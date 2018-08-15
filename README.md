# vcf2json
A desktop application for vcf to json


打包可能遇到的问题

Python

1. Pyinstaller打包出现UnicodeDecodeError: 'utf-8' codec can't decode byte 0xce in position

  在你打包的命令行中先输入chcp 65001 然后再输入打包命令。
  
  
  
2. 缺少模块 gevent.__hub_local ....

在 *.spec中添加
  hiddenimports=['gevent.__hub_local', 'gevent._local', 'gevent.__greenlet_primitives', 'gevent.__waiter', 'gevent.__hub_primitives', 'gevent._greenlet', 'gevent.__ident', 'gevent.libev.corecext', 'gevent.libuv.loop', 'gevent._event', 'gevent._queue', 'gevent.__semaphore', 'gevent.__imap'],
 
最后运行 pyinstaller transform.spec --distpath=dist
  
electron

1. 将    "packager": "electron-packager ./ transform --platform=win32  --arch=x64  --out=./Appout --overwrite", 加入到 scripts 
   --arch中的x64表示64位 ia32表示32位
2 运行命令 npm run-script packager 
