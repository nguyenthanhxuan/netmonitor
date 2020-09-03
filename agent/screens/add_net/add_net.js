const { ipcRenderer } = require('electron')

const form = document.getElementsByTagName("form").item(0);

form.addEventListener('submit', function(e){
    e.preventDefault();

    let name = document.getElementById('name');
    let host = document.getElementById('host');
    let method = document.getElementById('method');
    let time = document.getElementById('time');
    let timeout = document.getElementById('timeout');
    let netIdElement = document.getElementById('net-id');

    let netObject = {
        'netid': netIdElement.value,
        'name': name.value,
        'host': host.value,
        'method': method.value,
        'time': time.value,
        'timeout': timeout.value,
        'status': true
    };

    ipcRenderer.send('net-added', netObject);

    // Reset data
    name.value = '';
    host.value = '';
    method.value = 1;
    time.value = 5;
    timeout.value = 10;
})


ipcRenderer.on('edit-net', function(e, netId, net){
    let name = document.getElementById('name');
    let host = document.getElementById('host');
    let method = document.getElementById('method');
    let time = document.getElementById('time');
    let timeout = document.getElementById('timeout');
    let netIdElement = document.getElementById('net-id');
    let titleElement = document.getElementById('title');
    
    name.value = net.name;
    host.value = net.host;
    method.value = net.method;
    time.value = net.time;
    timeout.value = net.timeout;
    netIdElement.value = netId;

    let editBtn = document.getElementById('add-btn');
    editBtn.innerText = 'Sửa';
    titleElement.innerText = 'Sửa network';
    document.title = `Sửa ${net.name}`;
});