$(document).ready(() => {
  console.log('Hello Bootstrap4');
});

// 選取 DOM
const sidebarSwitch = document.querySelector('.sidebarSwitch');
const sidebar = document.querySelector('.sidebar');
const mapElement = document.getElementById('map');
const list = document.querySelector('.list');
const city = document.querySelector('.city');
const area = document.querySelector('.area');
const dayElement = document.querySelector('.day');
const dateElement = document.querySelector('.date');
const todayLimitLastIdNumber = document.querySelector('.todayLimitLastIdNumber');

// 建立 Date 物件與將日期相關的資訊存放到常數中方便與日期相關操作
const date = new Date();
const day = date.getDay();
const year = date.getFullYear();
const month = date.getMonth();
const todayDate = date.getDate();

// 宣告經緯度的變數以便將使用者的地理位置存放到常數中來使用
let lat;
let lng;

// 伸縮 sidebar
sidebarSwitch.addEventListener('click', function (e) {
  sidebar.classList.toggle('active');
  this.classList.toggle('active');
  mapElement.classList.toggle('active');
});

// 初始化地圖
const map = L.map('map', {
  zoom: 15
});

// 指定要讓 leftlet 使用的第三方圖資
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// 將群集化 marker 圖層加到地圖上
const markers = new L.MarkerClusterGroup().addTo(map);;

// 新增有三倍券時 marker 的圖標
const greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 新增沒有三倍券時 marker 的圖標
const redIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 將撈取遠端資料的操作進行封裝以便重複使用
function getUrl(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
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
}

// 渲染出側邊欄列表資訊
function renderList(listDatas){
  let listStr = '';
  let btnColor = '';

  for(let i = 0; i < listDatas.length; i++){
    if(listDatas[i].total > 0) {
      btnColor = 'btn-primary';
    }else{
      btnColor = 'btn-gray';
    }

    listStr += `
      <li class="py-3 mx-3 border-bottom">
        <h5 class="h5 d-flex justify-content-between font-weight-bold text-dark my-2">${listDatas[i].storeNm}<div><a href="#" class="d-inline-block align-middle showTargetMarker material-icons h2 mb-0" data-lng="${listDatas[i].longitude}" data-lat="${listDatas[i].latitude}">visibility</a></div></h5>
        <p class="text-grayer mb-1">地址：${listDatas[i].zipCd} ${listDatas[i].addr}</p>
        <p class="text-grayer mb-1">電話：${listDatas[i].tel}</p>
        <p class="text-grayer mb-2">營業時間：${listDatas[i].busiTime}</p>
        <button class="btn ${btnColor} rounded-pill text-white">三倍券庫存量：<strong>${listDatas[i].total}</strong></button>
      </li>
    `;
  }
  list.innerHTML = listStr;

  setViewTargetMarker();
}

// 在側邊欄列表中點選其中一間郵局的 icon(眼睛) 時，會將地圖移動到對應的 marker 並顯示 popup 視窗
function setViewTargetMarker() {
  const showTargetMarker = document.querySelectorAll('.showTargetMarker');
  showTargetMarker.forEach(function(element){
    element.addEventListener('click', function(e){
      e.preventDefault();
      const lat = parseFloat(e.target.dataset.lat);
      const lng = parseFloat(e.target.dataset.lng);
      const latLng = L.latLng(lat, lng);
      
      map.setView(latLng, 16);
      markers.eachLayer(function(layer) {
        if(layer._latlng.lat === lat && layer._latlng.lng === lng){
          layer.openPopup();
        }
      });
    });
  });
}

// 首次載入網頁時取得使用者的經緯度座標並設置為地圖中心
function getGeolocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position) {
      let latLng;

      lat = position.coords.latitude;
      lng = position.coords.longitude;
      latLng = L.latLng(lat, lng);

      map.setView(latLng);
    });
  }
}
getGeolocation();

// 顯示今天星期幾到畫面上
switch (day){
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
}

// 將取得的日期(YYYY-mm-dd)顯示到畫面上
dateElement.innerHTML = `${year}-${month+1}-${todayDate}`;

// 顯示今日可領取(兌換)三倍券的身分證尾碼
if(day === 1 || day === 3 || day === 5){
  todayLimitLastIdNumber.innerHTML = `身分證末碼為<span class="h4 text-warning">1,3,5,7,9</span>可領取`;
}else if(day === 2 || day === 4){
  todayLimitLastIdNumber.innerHTML = `身分證末碼為<span class="h4 text-warning">2,4,6,8,0</span>可領取`;
}else if(day === 6){
  todayLimitLastIdNumber.innerHTML = `身分證末碼單雙號皆可領取`;
}else{
  todayLimitLastIdNumber.innerHTML = `今日郵局沒有營業`;
}

// 將發送非同步請求後的結果(回傳 promise 物件)先存到常數中，以便透過 promise.all 來執行後續操作
const get3000Datas = getUrl('https://3000.gov.tw/hpgapi-openmap/api/getPostData');
const getCityDatas = getUrl('https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json');


Promise.all([get3000Datas, getCityDatas])
  .then(res => {
    const ticketDatas = res[0]; // 將撈取到的三倍券即時領券量資料存到變數中
    const cityDatas = res[1]; // 將撈取到的各縣市地區資料存到變數中
    let selectedCity = '臺北市'; // 存放選取縣市的變數(預設為臺北市)
    let cityStr = ''; // 宣告在選擇縣市的下拉選單中的選項的組字串內容
    let defaultAreaStr = ''; // 首次載入頁面時選擇地區下拉選單各選項的字串

    // 將每間郵局的 marker 加到到地圖圖層上, 並渲染 pane(點擊 marker 時 popup 的視窗) 的內容
    for (let i = 0; ticketDatas.length > i; i++) {
      let markerIcon; // 存放 marker icon 樣式的變數
      let ticketCountColor; // 存放三倍券數量文字樣式 class 的變數
      if (parseInt(ticketDatas[i].total) === 0) { // 依據三倍券數量是否為 0 調整 marker 樣式與 pane 中的三倍券總數量文字樣式
        markerIcon = redIcon;
        ticketCountColor = 'text-danger';
      } else {
        markerIcon = greenIcon;
        ticketCountColor = 'text-success';
      }
      markers.addLayer(L.marker([ticketDatas[i].latitude, ticketDatas[i].longitude], {
        icon: markerIcon
      }).bindPopup(`<h5>${ticketDatas[i].storeNm}</h5><p>地址：${ticketDatas[i].addr}</p><p>電話：${ticketDatas[i].tel}</p><p>營業時間：${ticketDatas[i].busiTime}</p><p>剩餘受理量：<strong class="${ticketCountColor}">${ticketDatas[i].total}</strong></p><p>資訊更新時間：${ticketDatas[i].updateTime}</p><p>備註：${ticketDatas[i].busiMemo}</p>`));
    }

    // 首次載入頁面時側邊欄中預設顯示台北市的資料列表
    const listDatas = ticketDatas.filter(function(item){
      return item.hsnNm === '臺北市';
    });
    renderList(listDatas);

    // 首次載入頁面時渲染預設的選擇地區下拉選單的各選項
    const defaultCity = cityDatas.filter(function(city){
      return city.CityName === '臺北市'
    });
    defaultAreaStr +=`<option value="全部地區">全部地區</option>`;
    defaultCity[0].AreaList.forEach(function(area){
      defaultAreaStr +=`<option value="${area.AreaName}">${area.AreaName}</option>`;
    });
    area.innerHTML = defaultAreaStr;

    // 從撈取回來的縣市中逐筆組成選擇縣市的下拉選單中的各個選項
    cityDatas.forEach(function(item, index){
      cityStr += `<option value="${item.CityName}">${item.CityName}</option>`;
    });
    city.innerHTML = cityStr;

    // 依據選取的縣市渲染對應的側邊欄列表資訊
    city.addEventListener('change', function(e){
      let areaStr = ''; // 組選擇地區的下拉選單中的各選項用的字串
      selectedCity = e.target.value; // 將選取到的縣市儲存到變數中以利其他操作

      const listDatas = ticketDatas.filter(function(item){ // 從撈取回來的三倍券資料中過濾出與所選縣市吻合的各筆資料(只需要使用者所選取縣市的三倍券資料)
        return item.addr.includes(selectedCity);
      });
      renderList(listDatas);

      let cityList = cityDatas.filter(function(item){ // 從撈取回來的縣市資料中過濾出與所選縣市吻合的資料 (只需要使用者所選取縣市的地區資料)
        return item.CityName === selectedCity;
      });

      areaStr += `<option value="選擇地區">選擇地區</option>`; // 地區下拉選單的預設值
      cityList[0].AreaList.forEach(function(item){ // 將所選縣市的各地區組成下拉選單中的各選項
        areaStr += `<option value="${item.AreaName}">${item.AreaName}</option>`
      });
      area.innerHTML = areaStr; // 將縣市的各地區選項顯示到選取地區的下拉選單元素中
    });

    // 依據選取的地區渲染對應的側邊欄列表資訊
    area.addEventListener('change', function(e){
      let selectedArea = e.target.value;

      const listDatas = ticketDatas.filter(item => {
        return item.addr.includes(selectedCity+selectedArea);
      });
      renderList(listDatas);
    });
  })
  .catch(function (err) { // 捕捉非同步請求錯誤時的錯誤訊息
    console.log(err);
  });