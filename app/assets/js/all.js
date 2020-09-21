$(document).ready(() => {
  console.log('Hello Bootstrap4');
});

// 選取 DOM
const sidebarSwitch = document.querySelector('.sidebarSwitch');
const sidebar = document.querySelector('.sidebar');
const mapElement = document.getElementById('map');

// 伸縮 sidebar
sidebarSwitch.addEventListener('click', function(e){
  sidebar.classList.toggle('active');
  this.classList.toggle('active');
  mapElement.classList.toggle('active');
});

// 初始化地圖
const map = L.map('map', {
  center: [22.604799,120.2976256],
  zoom: 16
});

// 指定要讓 leftlet 使用的第三方圖資
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = new L.MarkerClusterGroup().addTo(map);;

// 撈取三倍券資料並透過 marker 顯示各家郵局的營業與三倍券資訊

function getData(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function() {
      if (req.status === 200) {
        resolve(JSON.parse(req.responseText));
      } else {
        reject(new Error(req));
      }
    };
    req.send(null);
  });
}

getData('https://3000.gov.tw/hpgapi-openmap/api/getPostData')
  .then(function(res) {
    console.log(res);
    const data = [
      {'name':'軟體園區',lat:22.604799,lng:120.2976256},
      {'name':'ikea',lat:22.6066728,lng:120.3015429}
    ];
    for(var i =0;data.length>i;i++){
      markers.addLayer(L.marker([data[i].lat,data[i].lng]));
    }
  })
  .catch(function(err) {
    console.log(err);
  });