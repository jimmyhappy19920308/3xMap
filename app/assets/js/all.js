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

const date = new Date();

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

// 撈取三倍券資料並透過 marker 顯示各家郵局的營業與三倍券資訊
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

function setViewTargetMarker() {
  const showTargetMarker = document.querySelectorAll('.showTargetMarker');
  // 在側邊欄列表中點選其中一間郵局的 icon(眼睛) 時，會將地圖移動到對應的 marker 並顯示 popup 視窗
  showTargetMarker.forEach(function(element){
    element.addEventListener('click', function(e){
      e.preventDefault();
      const lat = parseInt(e.target.dataset.lat);
      const lng = parseInt(e.target.dataset.lng);
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

// 取得今天是星期幾並顯示到畫面上
const day = date.getDay();

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


const get3000Datas = getUrl('https://3000.gov.tw/hpgapi-openmap/api/getPostData');
const getCityDatas = getUrl('https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json');

Promise.all([get3000Datas, getCityDatas])
  .then(res => {
    const ticketDatas = res[0]; // 將撈取到的三倍券即時領券量資料存到變數中
    const cityDatas = res[1]; // 將撈取到的各縣市地區資料存到變數中
    let selectedCity;
    let cityStr = '';

    for (let i = 0; ticketDatas.length > i; i++) {
      let mask;
      let ticketCountColor;
      if (parseInt(ticketDatas[i].total) === 0) {
        mask = redIcon;
        ticketCountColor = 'text-danger';
      } else {
        mask = greenIcon;
        ticketCountColor = 'text-success';
      }
      markers.addLayer(L.marker([ticketDatas[i].latitude, ticketDatas[i].longitude], {
        icon: mask
      }).bindPopup(`<h5>${ticketDatas[i].storeNm}</h5><p>地址：${ticketDatas[i].addr}</p><p>電話：${ticketDatas[i].tel}</p><p>營業時間：${ticketDatas[i].busiTime}</p><p>剩餘受理量：<strong class="${ticketCountColor}">${ticketDatas[i].total}</strong></p><p>資訊更新時間：${ticketDatas[i].updateTime}</p><p>備註：${ticketDatas[i].busiMemo}</p>`));
    }

    // 首次載入頁面時側邊欄中預設顯示台北市的資料列表
    const listDatas = ticketDatas.filter(function(item){
      return item.hsnNm === '臺北市';
    });
    renderList(listDatas);

    cityDatas.forEach(function(item, index){
      cityStr += `<option value="${item.CityName}">${item.CityName}</option>`;
    });
    city.innerHTML = cityStr;

    city.addEventListener('change', function(e){
      let areaStr = '';
      selectedCity = e.target.value;

      const listDatas = ticketDatas.filter(function(item){
        return item.addr.includes(selectedCity);
      });

      renderList(listDatas);

      let cityList = cityDatas.filter(function(item){
        return item.CityName === selectedCity;
      });

      areaStr += `<option value="選擇地區">選擇地區</option>`;
      cityList[0].AreaList.forEach(function(item){
        areaStr += `<option value="${item.AreaName}">${item.AreaName}</option>`
      });
      area.innerHTML = areaStr;
    });

    area.addEventListener('change', function(e){
      let selectedArea = e.target.value;

      const listDatas = ticketDatas.filter(item => {
        return item.addr.includes(selectedCity+selectedArea);
      });
      renderList(listDatas);
    });
  })
  .catch(function (err) {
    console.log(err);
  });