var tableIndex = 1;
var IconPlus = "fa fa-plus-square-o";
var IconMinus = "fa fa-minus-square-o";


function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1)
    .match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}


function CreatvcfColums(linetitle) {
  var columns = [];
  for (var k in linetitle){
    var column = {};
    column.data = k;
    column.title = linetitle[k];
    column.className = 'gridtitle ';
    column.createdCell = function (td, cellData, rowData, row, col) {
      $(td).attr('title', cellData);//设置单元格title，鼠标移上去时悬浮框展示全部内容
    };
    columns.push(column);
  }
  return columns;
}

function CreatevcfTable(data){
  var lines = data.split('\n');
  var colums = lines[0].split('\t');

  var vcfdata = [];
  vcfdata.push(lines[1].split('\t'));
  vcfdata.push(lines[2].split('\t'));
  var table = $("#DataTable_vcf").DataTable({
      destroy: true,
      bSort: false,
      searching: false,
      bLengthChange: false,//去掉每页多少条框体
      bPaginate: false, //翻页功能
      bAutoWidth: true,//自动宽度
      'autoWidth': true,
      paging: false, // 分页
      bInfo: false, //Showing x to x of x entries
      scrollX: true,  //水平滚动条
      columns: CreatvcfColums(colums),
      data: vcfdata
    });
}

//二级table的模板
function format2(table_id) {
  return '<table id="DataTable'+ table_id +'" class="table table-striped table-bordered table-hover" cellpadding="5" cellspacing="0" border="0"></table>';
}

//重构返回的json数据
function ParseJsonData(strdata) {
  var data=eval('('+strdata+')');
  // var data = JSON.parse( strdata );
  var result = [];
  for (var line in data) {
    var rowJson = {};
    var info_row = {};
    var filter_row = {};
    var rowData = data[line];
    //保证顺序 可以让datatales 按序显示
    rowJson["CHROM"] = rowData["CHROM"];
    rowJson["POS"] = rowData["POS"];
    rowJson["ID"] = rowData["ID"];
    rowJson["REF"] = rowData["REF"];
    rowJson["ALT"] = rowData["ALT"];
    rowJson["QUAL"] = rowData["QUAL"];
    for (var key in rowData) {
      switch (key) {
        case "CHROM":
        case "POS":
        case "ID":
        case "REF":
        case "QUAL":
        case "Samples":
        case "ALT":
          break;
        default:
          //区分filter 和 info
          if (key.match(/^FILTER_/g)) {
            filter_row[key] = rowData[key]
          } else {
            info_row[key] = rowData[key];
          }
          break;
      }
    }
    rowJson["FILTER"] = filter_row;
    rowJson["Info"] = info_row;
    rowJson["Samples"] = rowData["Samples"];
    result.push(rowJson);
  }
  return result;
}


//重构返回的json数据
function ParseJsonData2(strdata) {
  var data=eval('('+strdata+')');
  // var data = JSON.parse( strdata );
  var result = [];
  for (var line in data) {
    var rowJson = {};
    var info_row = {};
    var filter_row = {};
    var samples_row ={};
    var rowData = data[line];
    //保证顺序 可以让datatales 按序显示
    rowJson["CHROM"] = rowData["CHROM"];
    rowJson["POS"] = rowData["POS"];
    rowJson["ID"] = rowData["ID"];
    rowJson["REF"] = rowData["REF"];
    rowJson["ALT"] = rowData["ALT"];
    rowJson["QUAL"] = rowData["QUAL"];
    for (var key in rowData) {
      switch (key) {
        case "CHROM":
        case "POS":
        case "ID":
        case "REF":
        case "QUAL":
        case "ALT":
          break;
        default:
          //区分filter 和 info
          if (key.match(/^FILTER_/g)) {
            filter_row[key] = rowData[key]
          } else if (key.match(/^calldata/g) || key === 'Samples'){
            samples_row[key] = rowData[key]
          } else {
            info_row[key] = rowData[key];
          }
          break;
      }
    }
    rowJson["FILTER"] = filter_row;
    //info
    for (var k in info_row){
      rowJson[k] = info_row[k];
    }
    //rowJson["Info"] = info_row;
    //samples
    for (var m in samples_row){
      rowJson[m] = rowData[m];
    }
    //rowJson["Samples"] = rowData["Samples"];
    result.push(rowJson);
  }
  return result;
}

//根据json数据 创建列
function CreatColums(data) {
  var columns = [];
  var rowData = data instanceof Array? data[0] : data;
  for (var k in rowData){
    var column = {};
    column.data = k;
    column.title = k;
    column.className = 'gridtitle ';
    if (rowData[k] instanceof Object && (k === 'Info' || k === 'Samples' || k === 'FILTER')){
      column.className += 'details-control';
      column.targets = -1;
      column.orderable = false;
      column.defaultContent = '';
    }
    column.createdCell = function (td, cellData, rowData, row, col) {
      $(td).attr('title', cellData);//设置单元格title，鼠标移上去时悬浮框展示全部内容
    };
    column.data === 'SampleNo'?columns.unshift(column):columns.push(column);
  }
  return columns;
}

function CreatejsonTable(tableID, data, IsRoot) {
  var table = $(tableID).DataTable({
    destroy: true,
    bSort: false,
    searching: false,
    bLengthChange:false,//每页多少条框体
    bPaginate: false, //翻页功能
    bAutoWidth: true,//自动宽度
    "autoWidth": true,
    paging: false, // 分页
    bInfo : false, //Showing x to x of x entries
    scrollX: true,  //水平滚动条
    columns: CreatColums(data),
    data: data,
    colReorder: {
      order: [0]
    },
    "fnCreatedRow": function (nRow, aData, iDataIndex) {
      var i = 0;
      for (var k in aData){
        var isobject = $('td:eq('+i+')', nRow).hasClass("details-control");
        if (isobject){
          $('td:eq('+i+')', nRow).html("<span class='row-details fa fa-plus-square-o'>&nbsp;" + $('td:eq('+i+')', nRow).attr("title")+"</span>");
        }
        ++i;
      }
    }
  });

  $(tableID).on('click', ' tbody td.details-control', function () {
    var OpenCell = function (obj) {
      ++tableIndex;
      row.child(format2(tableIndex)).show();
      $(obj).children('span').removeClass(IconPlus).addClass(IconMinus);
      var childdata = table.cell(obj).data();
      var tmp = [];
      if (childdata instanceof Array){
        tmp = childdata;
      }else{
        tmp.push(childdata);
      }
      CreatejsonTable('#DataTable' + tableIndex, tmp, false);
    };
    var Tr = $(this).parents('tr');
    var row = table.row(Tr);
    if (row.child.isShown()) {
      row.child.hide();
      var span = Tr.find('span.fa-minus-square-o');
      if ($(this).children('span')[0] === span[0]) {
        // This cell is already open - close it
        $(this).children('span').removeClass(IconMinus).addClass(IconPlus);
      } else {
        //other cell is open, close other cell and then open current cell
        span.removeClass(IconMinus).addClass(IconPlus);
        OpenCell(this);
      }
    }
    else {
      // Open this row (the format() function would return the data to be shown)
      OpenCell(this);
    }
  });
}


$(function () {
  var vcffilepath = GetQueryString("vcffile");
  if (!!vcffilepath) {
    var zerorpc = require('zerorpc');
    var client = new zerorpc.Client({ timeout: 3600 * 24, heartbeatInterval: 3600 * 1000 * 24 });
    client.connect('tcp://127.0.0.1:42142');
    client.invoke('preview', vcffilepath, (error, res) => {
      if (error) {
        layui.use('layer', function () {
          layer = layui.layer;
          layer.msg(error);
        });
      } else {
        CreatevcfTable(res['vcf']);
        CreatejsonTable('#DataTable_json', ParseJsonData2(res['json']), true);
      }
    });
  }else{
    layui.use('layer', function(){
      layer = layui.layer;
      layer.msg('invalid file path');
    });
  }
});

