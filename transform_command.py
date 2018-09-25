import os
import sys
import zerorpc
from transform_core import *

class Transform(TransformV2J):

    def dotranform(self, filepath_vcf, mode):
        TransformV2J.dotranform(self, filepath_vcf, mode)

    # with output path
    def dotransformWithOutPath(self, filepath_vcf, filepath_json, mode):
        TransformV2J.dotransformWithOutPath(self, filepath_vcf, filepath_json, mode)

    def preview(self, filepath_vcf, mode):
        return TransformV2J.preview(self, filepath_vcf, mode)


if __name__ == "__main__":
    V2J = Transform()
    TypeV2J = sys.argv[1]
    filepath = sys.argv[2]
    if (TypeV2J == '-t'):  #input a vcf file
        #filepath = sys.argv[2]
        V2J.dotranform(filepath, mode='MergeAll')
    elif (TypeV2J == '-r'):    #input a txt with a list of vcf files
        #listfilepath = sys.argv[2]
        with open(filepath, 'r') as f:
            lines = f.readlines()
        for line in lines:
            line = line.strip('\n')
            V2J.dotranform(line, mode='MergeAll')
    elif (TypeV2J == '-f'):    #input a folder, and then transform all vcf files into json
        files = os.listdir(filepath)
        for file in files:
            file_ap = os.path.join(filepath, file)
            if not os.path.isdir(file_ap):
                if os.path.splitext(file_ap)[1] == '.gz':
                    V2J.dotranform(file_ap, mode='MergeAll')