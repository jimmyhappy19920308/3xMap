const sidebarSwitch = document.querySelector('.sidebarSwitch');
const sidebar = document.querySelector('.sidebar');
const map = document.getElementById('map');

sidebarSwitch.addEventListener('click', function(e){
  sidebar.classList.toggle('active');
  this.classList.toggle('active');
  map.classList.toggle('active');
});
