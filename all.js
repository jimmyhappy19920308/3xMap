const sidebarSwitch = document.querySelector('.sidebarSwitch');
const sidebar = document.querySelector('.sidebar');
const mapElement = document.getElementById('map');

sidebarSwitch.addEventListener('click', function(e){
  sidebar.classList.toggle('active');
  this.classList.toggle('active');
  mapElement.classList.toggle('active');
});

const map = L.map('map', {
  center: [22.604799,120.2976256],
  zoom: 16
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);