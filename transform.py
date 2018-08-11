from bson import Code
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import allel
import numpy as np
import json
import multiprocessing
import pickle
from lockfile import LockFile
from pymongo import MongoClient
import re
import zipfile
from django.http import StreamingHttpResponse
from wsgiref.util import FileWrapper
from functools import partial
import zerorpc
import time
import sys


class MyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.int_, np.intc, np.intp, np.int8,
                            np.int16, np.int32, np.int64, np.uint8,
                            np.uint16, np.uint32, np.uint64)):
            return int(obj)
        elif isinstance(obj, (np.float_, np.float16, np.float32,
                              np.float64)):
            return float(obj)
        # elif isinstance(obj, np.ndarray):
        #     return list(obj)
        elif isinstance(obj, np.bool_):
            return bool(obj)
        else:
            return json.JSONEncoder.default(self, obj)

def IoOperat_multi(tmpfile, chunker):
    # tmpfile = "value_" + md5 + ".dat"
    with open(tmpfile, "rb") as f:
        fields = pickle.load(f)
        samples = pickle.load(f)
        headers = pickle.load(f)
        filepath_json = pickle.load(f)

    recordstring = str()
    li = []
    for i in range(chunker[1]):
        recorddict1 = {
            k_field[9:]: [chunker[0][k_field][i][m] for m in range(chunker[0][k_field][i].size)] if type(
                chunker[0][k_field][i]) == np.ndarray else chunker[0][k_field][i] for k_field in fields if
        'variants/' in k_field
        }
        recordsamples = []
        for k_sample, j in zip(samples, range(0, samples.size)):
            recordsample1 = {
                "SampleNo": k_sample
            }
            recordsample2 = {
                k_field: [chunker[0][k_field][i][j][n] for n in range(chunker[0][k_field][i][j].size)] if type(
                    chunker[0][k_field][i][j]) == np.ndarray else chunker[0][k_field][i][j] for k_field in fields if
            "calldata/" in k_field
            }
            recordsample = dict(recordsample1, **recordsample2)
            recordsamples.append(recordsample)
        recorddict2 = {
            "Samples": recordsamples
        }
        recorddict = dict(recorddict1, **recorddict2)
        li.append(recorddict)
    recordstring = json.dumps(li, cls=MyEncoder) + '\n'
    lock = LockFile(filepath_json)
    lock.acquire()
    with open(filepath_json, "a") as fp:
        fp.write(recordstring)
    lock.release()
    return


class Transform(object):
    def test(self, str):
        return "hello " + str

    def vcf2json_Single(self, filepath_vcf, filepath_json):

        fields, samples, headers, chunks = allel.iter_vcf_chunks(filepath_vcf, fields=['*'])
        with open(filepath_json, 'a') as fp:
            for chunker in chunks:
                recordstring = str()
                li = []
                for i in range(0, chunker[1]):
                    # if i % 10000 == 0 :
                    #     print("i: ", i)
                    recorddict1 = {
                        k_field[9:]: [chunker[0][k_field][i][m] for m in range(chunker[0][k_field][i].size)] if type(
                            chunker[0][k_field][i]) == np.ndarray else chunker[0][k_field][i] for k_field in fields if
                    'variants/' in k_field
                    }
                    recordsamples = []
                    for k_sample, j in zip(samples, range(0, samples.size)):
                        recordsample1 = {
                            "SampleNo": k_sample
                        }
                        recordsample2 = {
                            k_field: [chunker[0][k_field][i][j][n] for n in
                                      range(chunker[0][k_field][i][j].size)] if type(
                                chunker[0][k_field][i][j]) == np.ndarray else chunker[0][k_field][i][j] for k_field in
                        fields if "calldata/" in k_field
                        }
                        recordsample = dict(recordsample1, **recordsample2)
                        recordsamples.append(recordsample)
                    recorddict2 = {
                        "Samples": recordsamples
                    }

                    recorddict = dict(recorddict1, **recorddict2)
                    li.append(recorddict)
                recordstring = json.dumps(li, cls=MyEncoder) + '\n'
                fp.write(recordstring)

        return


    def vcf2json_multi(self, filepath_vcf, filepath_json, md5):

        fields, samples, headers, chunks = allel.iter_vcf_chunks(filepath_vcf, fields=['variants/*', 'calldata/*'],chunk_length=50)

        tmpfile = "value_" + md5 + ".dat"
        with open(tmpfile, "wb") as f:
            pickle.dump(fields, f)
            pickle.dump(samples, f)
            pickle.dump(headers, f)
            pickle.dump(filepath_json, f)

        cores = multiprocessing.cpu_count()
        #pool = multiprocessing.Pool(processes=max(int(cores/2), 2))
        pool = multiprocessing.Pool(processes=max(int(cores / 2), 2))
        pool.map(partial(IoOperat_multi, tmpfile), chunks)
        pool.close()
        pool.join()  # 主进程阻塞等待子进程的退出
        os.remove(tmpfile)  # 删除该分片，节约空间

        # try:
        #     pool = multiprocessing.Pool(processes=max(cores - 2, 2))
        #     pool.map(partial(IoOperat_multi, tmpfile), chunks)
        #     pool.close()
        #     pool.join()  # 主进程阻塞等待子进程的退出
        # except e:
        #     pool.terminate()
        #     pool.join()
        # finally:
        #     os.remove(tmpfile)  # 删除该分片，节约空间
        return

    def dotranform(self, filepath_vcf):
        file_json = os.path.splitext(filepath_vcf)[0] + ".json"
        self.vcf2json_multi(filepath_vcf, file_json, "tmpdat")
        #self.vcf2json_Single(filepath_vcf, file_json)
        # if os.path.splitext(filepath_vcf)[1] == ".gz" or filesize_vcf <= 100 * 1024 * 1024:
        #     # 100M文件以下使用单进程
        #     # gzip压缩文件需要用单进程处理,原因未知
        #     #self.vcf2json_Single(filepath_vcf, file_json)
        # else:
        #     self.vcf2json_multi(filepath_vcf, file_json, "tmpdat")
        #     # 创建进程执行转换的原因, 可以并发处理请求.
        #     # 转换函数会创建进程池, 使用文件进行参数传递, 为了让并发请求不共享这个文件, 所以此处创建进程
        # return "complete"

if __name__ == "__main__":
    s = zerorpc.Server(Transform(), heartbeat=None)
    s.bind("tcp://0.0.0.0:42142")
    s.run()
# if __name__ == "__main__":
#     myinstance = Transform()
#     filepath = "F:/data/VCF_Files/ALL.chrY.phase3_integrated_v2a.20130502.genotypes.vcf"
#     #myinstance.dotranform(sys.argv[1])
#     myinstance.dotranform(filepath)
