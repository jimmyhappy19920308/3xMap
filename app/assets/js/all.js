$(document).ready(() => {
  console.log('Hello Bootstrap4');
});

// 選取 DOM
const sidebarSwitch = document.querySelector('.sidebarSwitch');
const sidebar = document.querySelector('.sidebar');
const mapElement = document.getElementById('map');

// 伸縮 sidebar
sidebarSwitch.addEventListener('click', function (e) {
  sidebar.classList.toggle('active');
  this.classList.toggle('active');
  mapElement.classList.toggle('active');
});

// 初始化地圖
const map = L.map('map', {
  center: [22.604799, 120.2976256],
  zoom: 16
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

const get3000Datas = getUrl('https://3000.gov.tw/hpgapi-openmap/api/getPostData');
const getCityDatas = getUrl('https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json');

Promise.all([get3000Datas, getCityDatas])
  .then(res => {
    const ticketDatas = res[0]; // 將撈取到的三倍券即時領券量資料存到變數中
    const cityDatas = res[1]; // 將撈取到的各縣市地區資料存到變數中

    for (let i = 0; ticketDatas.length > i; i++) {
      let mask;
      if (ticketDatas[i].total === 0) {
        mask = redIcon;
      } else {
        mask = greenIcon;
      }
      markers.addLayer(L.marker([ticketDatas[i].latitude, ticketDatas[i].longitude], {
        icon: mask
      }).bindPopup(`<h5>${ticketDatas[i].storeNm}</h5><p>${ticketDatas[i].addr}</p><p>${ticketDatas[i].tel}</p><p>營業時間:${ticketDatas[i].busiTime}</p><p>備註:${ticketDatas[i].busiMemo}</p><p>剩餘受理量:${ticketDatas[i].total}</p>`));
    }
  })
  .catch(function (err) {
    console.log(err);
  });