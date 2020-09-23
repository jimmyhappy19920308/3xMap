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
    let selectedCity;
    let cityStr = '';
    let btnColor = '';

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

    cityStr += `<option value="選擇縣市">選擇縣市</option>`;
    cityDatas.forEach(function(item, index){
      cityStr += `<option value="${item.CityName}">${item.CityName}</option>`;
    });
    city.innerHTML = cityStr;

    city.addEventListener('change', function(e){
      let listStr = '';
      let areaStr = '';
      selectedCity = e.target.value;

      const listDatas = ticketDatas.filter(function(item){
        return item.addr.includes(selectedCity);
      });

      for (let i = 0; listDatas.length > i; i++) {
        if(listDatas[i].total > 0) {
          btnColor = 'btn-primary';
        }else{
          btnColor = 'btn-gray';
        }

        listStr += `
          <li class="py-3 mx-3 border-bottom">
            <h6 class="h5 font-weight-bold text-dark my-2">${listDatas[i].storeNm}</h6>
            <p class="text-grayer mb-1">地址：${listDatas[i].zipCd} ${listDatas[i].addr}</p>
            <p class="text-grayer mb-1">電話：${listDatas[i].tel}</p>
            <p class="text-grayer mb-2">營業時間：${listDatas[i].busiTime}</p>
            <button class="btn ${btnColor} rounded-pill text-white">三倍券庫存量：<strong>${listDatas[i].total}</strong></button>
          </li>
        `;
      }
      list.innerHTML = listStr;

      let cityList = cityDatas.filter(function(item){
        return item.CityName === selectedCity;
      });

      areaStr += `<option value="選擇地區">選擇地區</option>`;
      cityList[0].AreaList.forEach(function(item){
        areaStr += `<option value="${item.AreaName}">${item.AreaName}</option>`
      });
      area.innerHTML = areaStr;
    });
  })
  .catch(function (err) {
    console.log(err);
  });