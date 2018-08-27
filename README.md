# VCF2JSON
A desktop application for transforming VCF files to JSON files

## What’s VCF2JSON
VCF2JSON, a standalone, cross-platform and freely available desktop software, which is developed for researcher without bioinformatics skills. VCF2JSON transform VCF files into JSON files with zero data loss. After that, researcher can use JSON tools to process data in VCF files much easier. Users can download the executable program and double-click it to run directly due to the fact that it is easy to implement and has a user-friendly graphical user interface (GUI).

## A sample case 
As described in figure 1, the first line in JSON file saves the header information of the original VCF file. The next line is an array, each element represents a row of data in VCF.
![](https://github.com/Priest-zhi/vcf2json/raw/master/doc/figure1.jpg)

## Software framework
The base framework of VCF2JSON is shown in figure 2.The core of VCF2JSON was built with python program. The framework of the GUI were designed and implemented with Electron (https://electronjs.org/) which using JavaScript, HTML and CSS to write cross-platform desktop application. The frontend and backend communicate with each other using zerorpc (http://www.zerorpc.io/). The software has been tested in several operating systems (UNIX, Mac and Windows).
![](https://github.com/Priest-zhi/vcf2json/raw/master/doc/figure2.jpg)

## Application of VCF2JSON: a utility case
The transform is initiated from the main page (Figure 3A), user open file dialog and select a VCF file, and then choose output directory. Besides, two JSON formats are available for the user to choose. The default JSON format is to merge annotation together, the other is the opposite. When user click “Go” button and wait a moment, they can get a JSON file at output directory. What’s more, by clicking the preview button, the user can preview the results of the transform, of course only the first two lines can be previewed (Figure 3B).
![](https://github.com/Priest-zhi/vcf2json/raw/master/doc/figure3.jpg)

## 打包可能遇到的问题

### Python

* Pyinstaller打包出现UnicodeDecodeError: 'utf-8' codec can't decode byte 0xce in position

  在你打包的命令行中先输入chcp 65001 然后再输入打包命令。
  
  
  
* 缺少模块 gevent.__hub_local ....

> 在 *.spec中添加
  hiddenimports=['gevent.__hub_local', 'gevent._local', 'gevent.__greenlet_primitives', 'gevent.__waiter', 'gevent.__hub_primitives', 'gevent._greenlet', 'gevent.__ident', 'gevent.libev.corecext', 'gevent.libuv.loop', 'gevent._event', 'gevent._queue', 'gevent.__semaphore', 'gevent.__imap'],
 
> 最后运行 pyinstaller transform.spec --distpath=dist
  
### electron

* 将    "packager": "electron-packager ./ transform --platform=win32  --arch=x64  --out=./Appout --overwrite", 加入到 scripts 
   --arch中的x64表示64位 ia32表示32位
* 运行命令 npm run-script packager 
