$('.Transformation').click(function () {
  $('.Transformation').addClass('active');
  $('.Transformation > .icon').addClass('active');
  $('.about').removeClass('active');
  $('.wrap').removeClass('active');
  $('.ship').removeClass('active');
  $('.about > .icon').removeClass('active');
  $('.wrap > .icon').removeClass('active');
  $('.ship > .icon').removeClass('active');
  // $('#line').addClass('one');
  // $('#line').removeClass('two');
  // $('#line').removeClass('three');
  // $('#line').removeClass('four');
  $('#line').addClass('two');
  $('#line').removeClass('one');
  $('#line').removeClass('three');
  $('#line').removeClass('four');
});
$('.about').click(function () {
  $('.about').addClass('active');
  $('.about > .icon').addClass('active');
  $('.Transformation').removeClass('active');
  $('.wrap').removeClass('active');
  $('.ship').removeClass('active');
  $('.Transformation > .icon').removeClass('active');
  $('.wrap > .icon').removeClass('active');
  $('.ship > .icon').removeClass('active');
  // $('#line').addClass('two');
  // $('#line').removeClass('one');
  // $('#line').removeClass('three');
  // $('#line').removeClass('four');
  $('#line').addClass('three');
  $('#line').removeClass('two');
  $('#line').removeClass('one');
  $('#line').removeClass('four');
});
$('.wrap').click(function () {
  $('.wrap').addClass('active');
  $('.wrap > .icon').addClass('active');
  $('.about').removeClass('active');
  $('.Transformation').removeClass('active');
  $('.ship').removeClass('active');
  $('.about > .icon').removeClass('active');
  $('.Transformation > .icon').removeClass('active');
  $('.ship > .icon').removeClass('active');
  $('#line').addClass('three');
  $('#line').removeClass('two');
  $('#line').removeClass('one');
  $('#line').removeClass('four');
});
$('.ship').click(function () {
  $('.ship').addClass('active');
  $('.ship > .icon').addClass('active');
  $('.about').removeClass('active');
  $('.wrap').removeClass('active');
  $('.Transformation').removeClass('active');
  $('.about > .icon').removeClass('active');
  $('.wrap > .icon').removeClass('active');
  $('.Transformation > .icon').removeClass('active');
  $('#line').addClass('four');
  $('#line').removeClass('two');
  $('#line').removeClass('three');
  $('#line').removeClass('one');
});
$('.Transformation').click(function () {
  $('#first').addClass('rightside_active');
  $('#second').removeClass('rightside_active');
  $('#third').removeClass('rightside_active');
  $('#fourth').removeClass('rightside_active');
});
$('.about').click(function () {
  $('#first').removeClass('rightside_active');
  $('#second').addClass('rightside_active');
  $('#third').removeClass('rightside_active');
  $('#fourth').removeClass('rightside_active');
});
$('.wrap').click(function () {
  $('#first').removeClass('rightside_active');
  $('#second').removeClass('rightside_active');
  $('#third').addClass('rightside_active');
  $('#fourth').removeClass('rightside_active');
});
$('.ship').click(function () {
  $('#first').removeClass('rightside_active');
  $('#second').removeClass('rightside_active');
  $('#third').removeClass('rightside_active');
  $('#fourth').addClass('rightside_active');
});

var mode = "top";

$(function () {
  $('#progress-control').hide();  //隐藏进度条
  //绑定外部链接
  const {shell} = require('electron')

  const exLinksBtn = document.getElementById('a_github')

  exLinksBtn.addEventListener('click', (event) => {
    shell.openExternal('https://github.com/Priest-zhi/vcf2json')
  })
});

function selectinputfile() {
  const {dialog} = require('electron').remote;
  console.log(dialog.showOpenDialog({properties: ['openFile'], filters: [
      {name: 'vcf file', extensions: ['vcf']}
    ]},(files) => {
    if (files) {
      $("#input_filepath").val(files);
    }
  }));
}

function selectoutputfile() {
  const {dialog} = require('electron').remote;
  console.log(dialog.showOpenDialog({properties: ['openDirectory']},(files) => {
    if (files) {
      $("#output_filepath").val(files);
    }
  }));
}

function transformfile() {
  if (!$("#input_filepath").val()){
    layui.use('layer', function(){
      layer = layui.layer;
      layer.msg('invalid file path');
    });
    return;
  }
  var timer =  window.setInterval(progressAdd,1000);//每隔1min调用一次show函数, 防止用户以为卡死
  $('#progress-control').show();
  $('#progress-bar-transform').css('width', '1%');
  $('#progress-bar-transform').text('1%');
  $('#status').text("transform...");

  var zerorpc = require("zerorpc");
  var client = new zerorpc.Client({ timeout: 3600*24, heartbeatInterval: 3600*1000*24});

  client.connect("tcp://127.0.0.1:42142");
  if (mode === "top"){
    client.invoke("dotranform", $("#input_filepath").val(), $('#select_jsonformat').val(), (error, res) =>{
      $('#progress-bar-transform').css('width', '100%');
      $('#progress-bar-transform').text('100%');
      if(error) {
        $('#status').text(error);
      } else {
        $('#status')
          .text("transform complete!");
      }
    })
  }else if(mode === "bottom"){
    var fileName = $("#input_filepath").val();
    //正则表达式获取文件名，不带后缀
    var strFileName=fileName.replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi,"$1");

    //var strFileName = fileName.substring(fileName.lastIndexOf("\\")+1);
    var filepath_json = $('#output_filepath').val()+ '\\' + strFileName + '.json';
    client.invoke("dotransformWithOutPath", $("#input_filepath").val(),filepath_json,$('#select_jsonformat').val(), (error, res) =>{
      $('#progress-bar-transform').css('width', '100%');
      $('#progress-bar-transform').text('100%');
      if(error) {
        $('#status').text(error);
      } else {
        $('#status')
          .text("transform complete!");
      }
    })
  }

}

//伪进度条
function progressAdd() {
  var result_width = GetProgressWidth($('#progress-bar-transform'));
  if (result_width < 99){
    $('#progress-bar-transform').css('width', ++result_width[0] + '%');
    $('#progress-bar-transform').text(result_width[0] + '%');
  }
}

function GetProgressWidth(selector) {
  var width = selector[0].style.width;
  var reg = /\d+/g;
  var result_width = width.match(reg);
  return result_width;
}

function show(section) {
  if (section === 'top'){
    mode="top";
    $("#button-addon2").attr("disabled",true);
    $("#output_filepath").attr("disabled",true);
  }else if(section === 'bottom'){
    mode="bottom";
    $("#button-addon2").removeAttr("disabled");
    $("#output_filepath").removeAttr("disabled");
  }
}

function preview() {

  const {BrowserWindow} = require('electron').remote;
  const path = require('path');
  let win = new BrowserWindow({width: 1016, height: 600,autoHideMenuBar:true
    ,resizable: false
  });
  win.on('closed', () => {
    win = null
  });
  // 加载URL
  var modalPath = path.join('file://', __dirname, '/template/preview.html?vcffile=');
  modalPath += $("#input_filepath").val();
  modalPath += "&mode=" + $("#select_jsonformat").val();
  win.loadURL(modalPath);

  // var zerorpc = require("zerorpc");
  // var client = new zerorpc.Client({ timeout: 3600*24, heartbeatInterval: 3600*1000*24});
  // client.connect("tcp://127.0.0.1:42142");
  // client.invoke("preview", $("#input_filepath").val(), (error, res) =>{
  //   if(error) {
  //     $('#status').text(error);
  //   } else {
  //     $('#status')
  //       .text("transform complete!");
  //   }
  // })
}
