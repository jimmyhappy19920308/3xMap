"use strict";

$(document).ready(function () {
  console.log('Hello Bootstrap4');
}); // 選取 DOM

var sidebarSwitch = document.querySelector('.sidebarSwitch');
var sidebar = document.querySelector('.sidebar');
var mapElement = document.getElementById('map');
var list = document.querySelector('.list');
var city = document.querySelector('.city');
var area = document.querySelector('.area');
var dayElement = document.querySelector('.day');
var dateElement = document.querySelector('.date');
var todayLimitLastIdNumber = document.querySelector('.todayLimitLastIdNumber'); // 建立 Date 物件與將日期相關的資訊存放到常數中方便與日期相關操作

var date = new Date();
var day = date.getDay();
var year = date.getFullYear();
var month = date.getMonth();
var todayDate = date.getDate(); // 宣告經緯度的變數以便將使用者的地理位置存放到常數中來使用

var lat;
var lng; // 伸縮 sidebar

sidebarSwitch.addEventListener('click', function (e) {
  sidebar.classList.toggle('active');
  this.classList.toggle('active');
  mapElement.classList.toggle('active');
}); // 初始化地圖

var map = L.map('map', {
  center: [23.9134578, 120.6903032],
  zoom: 15
}); // 指定要讓 leftlet 使用的第三方圖資

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map); // 將群集化 marker 圖層加到地圖上

var markers = new L.MarkerClusterGroup().addTo(map); // 新增有三倍券時 marker 的圖標

var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}); // 新增沒有三倍券時 marker 的圖標

var redIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}); // 將撈取遠端資料的操作進行封裝以便重複使用

function getUrl(url) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function () {
      if (req.status === 200) {
        resolve(JSON.parse(req.responseText));
      } else {
        reject(new Error(req));
      }
    };

    req.send(null);
  });
} // 渲染出側邊欄列表資訊


function renderList(listDatas) {
  var listStr = '';
  var btnColor = '';

  for (var i = 0; i < listDatas.length; i++) {
    if (listDatas[i].total > 0) {
      btnColor = 'btn-primary';
    } else {
      btnColor = 'btn-gray';
    }

    listStr += "\n      <li class=\"py-3 mx-3 border-bottom\">\n        <h5 class=\"h5 d-flex justify-content-between font-weight-bold text-dark my-2\">".concat(listDatas[i].storeNm, "<div><a href=\"#\" class=\"d-inline-block align-middle showTargetMarker material-icons h2 mb-0\" data-lng=\"").concat(listDatas[i].longitude, "\" data-lat=\"").concat(listDatas[i].latitude, "\">visibility</a></div></h5>\n        <p class=\"text-grayer mb-1\">\u5730\u5740\uFF1A").concat(listDatas[i].zipCd, " ").concat(listDatas[i].addr, "</p>\n        <p class=\"text-grayer mb-1\">\u96FB\u8A71\uFF1A").concat(listDatas[i].tel, "</p>\n        <p class=\"text-grayer mb-2\">\u71DF\u696D\u6642\u9593\uFF1A").concat(listDatas[i].busiTime, "</p>\n        <button class=\"btn ").concat(btnColor, " rounded-pill text-white\">\u4E09\u500D\u5238\u5EAB\u5B58\u91CF\uFF1A<strong>").concat(listDatas[i].total, "</strong></button>\n      </li>\n    ");
  }

  list.innerHTML = listStr;
  setViewTargetMarker();
} // 在側邊欄列表中點選其中一間郵局的 icon(眼睛) 時，會將地圖移動到對應的 marker 並顯示 popup 視窗


function setViewTargetMarker() {
  var showTargetMarker = document.querySelectorAll('.showTargetMarker');
  showTargetMarker.forEach(function (element) {
    element.addEventListener('click', function (e) {
      e.preventDefault();
      var lat = parseFloat(e.target.dataset.lat);
      var lng = parseFloat(e.target.dataset.lng);
      var latLng = L.latLng(lat, lng);
      var mediaQueryList = window.matchMedia("(max-width: 768px)"); // 將要匹配的螢幕解析度儲存到常數中

      map.setView(latLng, 16);
      markers.eachLayer(function (layer) {
        if (layer._latlng.lat === lat && layer._latlng.lng === lng) {
          layer.openPopup();
        }
      });

      if (mediaQueryList.matches) {
        // 判斷螢幕解析度是否符合 768px
        sidebar.classList.toggle('active');
        sidebarSwitch.classList.toggle('active');
        mapElement.classList.toggle('active');
      }
    });
  });
} // 首次載入網頁時取得使用者的經緯度座標並設置為地圖中心


function getGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var latLng;
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      latLng = L.latLng(lat, lng);
      map.setView(latLng);
    });
  }
}

getGeolocation(); // 顯示今天星期幾到畫面上

switch (day) {
  case 1:
    dayElement.innerHTML = '星期一';
    break;

  case 2:
    dayElement.innerHTML = '星期二';
    break;

  case 3:
    dayElement.innerHTML = '星期三';
    break;

  case 4:
    dayElement.innerHTML = '星期四';
    break;

  case 5:
    dayElement.innerHTML = '星期五';
    break;

  case 6:
    dayElement.innerHTML = '星期六';
    break;

  case 7:
    dayElement.innerHTML = '星期日';
    break;
} // 將取得的日期(YYYY-mm-dd)顯示到畫面上


dateElement.innerHTML = "".concat(year, "-").concat(month + 1, "-").concat(todayDate); // 顯示今日可領取(兌換)三倍券的身分證尾碼

if (day === 1 || day === 3 || day === 5) {
  todayLimitLastIdNumber.innerHTML = "\u8EAB\u5206\u8B49\u672B\u78BC\u70BA<span class=\"h4 text-warning\">1,3,5,7,9</span>\u53EF\u9818\u53D6";
} else if (day === 2 || day === 4) {
  todayLimitLastIdNumber.innerHTML = "\u8EAB\u5206\u8B49\u672B\u78BC\u70BA<span class=\"h4 text-warning\">2,4,6,8,0</span>\u53EF\u9818\u53D6";
} else if (day === 6) {
  todayLimitLastIdNumber.innerHTML = "\u8EAB\u5206\u8B49\u672B\u78BC\u55AE\u96D9\u865F\u7686\u53EF\u9818\u53D6";
} else {
  todayLimitLastIdNumber.innerHTML = "\u4ECA\u65E5\u90F5\u5C40\u6C92\u6709\u71DF\u696D";
} // 將發送非同步請求後的結果(回傳 promise 物件)先存到常數中，以便透過 promise.all 來執行後續操作


var get3000Datas = getUrl('https://3000.gov.tw/hpgapi-openmap/api/getPostData');
var getCityDatas = getUrl('https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json');
Promise.all([get3000Datas, getCityDatas]).then(function (res) {
  var ticketDatas = res[0]; // 將撈取到的三倍券即時領券量資料存到變數中

  var cityDatas = res[1]; // 將撈取到的各縣市地區資料存到變數中

  var selectedCity = '臺北市'; // 存放選取縣市的變數(預設為臺北市)

  var cityStr = ''; // 宣告在選擇縣市的下拉選單中的選項的組字串內容

  var defaultAreaStr = ''; // 首次載入頁面時選擇地區下拉選單各選項的字串
  // 將每間郵局的 marker 加到到地圖圖層上, 並渲染 pane(點擊 marker 時 popup 的視窗) 的內容

  for (var i = 0; ticketDatas.length > i; i++) {
    var markerIcon = void 0; // 存放 marker icon 樣式的變數

    var ticketCountColor = void 0; // 存放三倍券數量文字樣式 class 的變數

    if (parseInt(ticketDatas[i].total) === 0) {
      // 依據三倍券數量是否為 0 調整 marker 樣式與 pane 中的三倍券總數量文字樣式
      markerIcon = redIcon;
      ticketCountColor = 'text-danger';
    } else {
      markerIcon = greenIcon;
      ticketCountColor = 'text-success';
    }

    markers.addLayer(L.marker([ticketDatas[i].latitude, ticketDatas[i].longitude], {
      icon: markerIcon
    }).bindPopup("<h5>".concat(ticketDatas[i].storeNm, "</h5><p>\u5730\u5740\uFF1A").concat(ticketDatas[i].addr, "</p><p>\u96FB\u8A71\uFF1A").concat(ticketDatas[i].tel, "</p><p>\u71DF\u696D\u6642\u9593\uFF1A").concat(ticketDatas[i].busiTime, "</p><p>\u5269\u9918\u53D7\u7406\u91CF\uFF1A<strong class=\"").concat(ticketCountColor, "\">").concat(ticketDatas[i].total, "</strong></p><p>\u8CC7\u8A0A\u66F4\u65B0\u6642\u9593\uFF1A").concat(ticketDatas[i].updateTime, "</p><p>\u5099\u8A3B\uFF1A").concat(ticketDatas[i].busiMemo, "</p>")));
  }

  map.addLayer(markers); // 將 markers 加入到地圖圖層上
  // 首次載入頁面時側邊欄中預設顯示台北市的資料列表

  var listDatas = ticketDatas.filter(function (item) {
    return item.hsnNm === '臺北市';
  });
  renderList(listDatas); // 首次載入頁面時渲染預設的選擇地區下拉選單的各選項

  var defaultCity = cityDatas.filter(function (city) {
    return city.CityName === '臺北市';
  });
  defaultAreaStr += "<option value=\"\u5168\u90E8\u5730\u5340\">\u5168\u90E8\u5730\u5340</option>";
  defaultCity[0].AreaList.forEach(function (area) {
    defaultAreaStr += "<option value=\"".concat(area.AreaName, "\">").concat(area.AreaName, "</option>");
  });
  area.innerHTML = defaultAreaStr; // 從撈取回來的縣市中逐筆組成選擇縣市的下拉選單中的各個選項

  cityDatas.forEach(function (item, index) {
    cityStr += "<option value=\"".concat(item.CityName, "\">").concat(item.CityName, "</option>");
  });
  city.innerHTML = cityStr; // 依據選取的縣市渲染對應的側邊欄列表資訊

  city.addEventListener('change', function (e) {
    var areaStr = ''; // 組選擇地區的下拉選單中的各選項用的字串

    selectedCity = e.target.value; // 將選取到的縣市儲存到變數中以利其他操作

    var listDatas = ticketDatas.filter(function (item) {
      // 從撈取回來的三倍券資料中過濾出與所選縣市吻合的各筆資料(只需要使用者所選取縣市的三倍券資料)
      return item.addr.includes(selectedCity);
    });
    renderList(listDatas);
    var cityList = cityDatas.filter(function (item) {
      // 從撈取回來的縣市資料中過濾出與所選縣市吻合的資料 (只需要使用者所選取縣市的地區資料)
      return item.CityName === selectedCity;
    });
    areaStr += "<option value=\"\u5168\u90E8\u5730\u5340\">\u5168\u90E8\u5730\u5340</option>"; // 地區下拉選單的預設值

    cityList[0].AreaList.forEach(function (item) {
      // 將所選縣市的各地區組成下拉選單中的各選項
      areaStr += "<option value=\"".concat(item.AreaName, "\">").concat(item.AreaName, "</option>");
    });
    area.innerHTML = areaStr; // 將縣市的各地區選項顯示到選取地區的下拉選單元素中
  }); // 依據選取的地區渲染對應的側邊欄列表資訊

  area.addEventListener('change', function (e) {
    var selectedArea = e.target.value;
    var listDatas;

    if (selectedArea === '全部地區') {
      listDatas = ticketDatas.filter(function (item) {
        return item.addr.includes(selectedCity);
      });
    } else {
      listDatas = ticketDatas.filter(function (item) {
        return item.addr.includes(selectedCity + selectedArea);
      });
    }

    renderList(listDatas);
  });
})["catch"](function (err) {
  // 捕捉非同步請求錯誤時的錯誤訊息
  console.log(err);
});
//# sourceMappingURL=all.js.map
