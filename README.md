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

## how to run
* For running the code Python >= 3.5 is required.
* Git clone code
* Python
  > pip install numpy
  >
  > pip install -r requirements.txt
  >
  > pip install zerorpc
  >
* nodejs
  * install package
  > npm install electron
  >
  > npm install
  * install zeromq
  > npm install zeromq
  * install zerorpc
  > npm install zerorpc
* Run
  > npm start

## how to package?
The software is composed of Electron and Python, so it needs to be packaged separately.

### windows
#### package Python

* Open the command line in the root directory and enter 'chcp 65001' 
> if you don't type, Pyinstaller will show "UnicodeDecodeError: 'utf-8' codec can't decode byte 0xce in position"

* Secondly, run command: pyinstaller transform.spec --distpath=dist 
> if you don't use .spec. Pyinstaller will show "lack module gevent.__hub_local ....", The solution is add this code to .spec:
```
  hiddenimports=['gevent.__hub_local', 'gevent._local', 'gevent.__greenlet_primitives', 'gevent.__waiter', 'gevent.__hub_primitives', 'gevent._greenlet', 'gevent.__ident', 'gevent.libev.corecext', 'gevent.libuv.loop', 'gevent._event', 'gevent._queue', 'gevent.__semaphore', 'gevent.__imap'],
```

  
#### package Electron

* run command: 
  * windows x64 : npm run-script packager-64
  * windows x86 : npm run-script packager-32
> in package.json, scripts, 
"packager-64": "electron-packager ./ transform --platform=win32  --arch=x64  --out=./Appout --overwrite",
   --arch=x64 means x64, ia32 means x86

#### finally work
* Create a new folder in Electron root directory, named "dist". Copy the transform.exe(windows name) generated from pyinstaller to dist
* double click transform.exe in electron root directory (named APPout)

### linux
#### package Python
  > pyinstaller transform.spec --distpath=dist 
#### package Electron
  > npm run-script packageLinux-64
#### finally work
* Create a new folder in Electron root directory, named "dist". Copy the transform.exe(windows name) generated from pyinstaller to dist
* double click transform.exe in electron root directory (named APPout)
### OS
#### package Python
  > pyinstaller transform.spec --distpath=dist 
#### package Electron
  > npm run-script packageOS-64
#### finally work
* Create a new folder in Electron root directory, named "dist". Copy the transform.exe(windows name) generated from pyinstaller to dist
* double click transform.exe in electron root directory (named APPout)
