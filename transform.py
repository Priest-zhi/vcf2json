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

try:
    # Python 3.4+
    if sys.platform.startswith('win'):
        import multiprocessing.popen_spawn_win32 as forking
    else:
        import multiprocessing.popen_fork as forking
except ImportError:
    import multiprocessing.forking as forking

if sys.platform.startswith('win'):
    # First define a modified version of Popen.
    class _Popen(forking.Popen):
        def __init__(self, *args, **kw):
            if hasattr(sys, 'frozen'):
                # We have to set original _MEIPASS2 value from sys._MEIPASS
                # to get --onefile mode working.
                os.putenv('_MEIPASS2', sys._MEIPASS)
            try:
                super(_Popen, self).__init__(*args, **kw)
            finally:
                if hasattr(sys, 'frozen'):
                    # On some platforms (e.g. AIX) 'os.unsetenv()' is not
                    # available. In those cases we cannot delete the variable
                    # but only set it to the empty string. The bootloader
                    # can handle this case.
                    if hasattr(os, 'unsetenv'):
                        os.unsetenv('_MEIPASS2')
                    else:
                        os.putenv('_MEIPASS2', '')
    # Second override 'Popen' class with our modified version.
    forking.Popen = _Popen

    # class Process(multiprocessing.Process):
    #     _Popen = _Popen
    #
    #
    # class Pool(multiprocessing.Pool):
    #     Process = Process

if __name__ == "__main__":
    multiprocessing.freeze_support()
    s = zerorpc.Server(Transform(), heartbeat=None)
    s.bind("tcp://0.0.0.0:42142")
    s.run()
