const { ipcRenderer } = require('electron');

let method = ['ICMP (Ping)', 'HTTP - GET'];
let nets = [];

document
    .getElementById('add-net-btn')
    .addEventListener('click', function (event) {
        ipcRenderer.send('add-net');
    });

// Search network
document
    .getElementById('search')
    .addEventListener('click', function(e){
        let search_text = document.getElementById('search-text').value.toLowerCase();
        let state = document.getElementById('inputState').value;
        if(nets.length){
            let filterNets = nets.filter(function(net){
                let fb_state = false;
                let fb_search = false;
                if(state == '' || (state == '1' && net.status) || (state == '0' && !net.status)) {
                    fb_state = true;
                }

                let net_name = net.name.toLowerCase();
                let host = net.host.toLowerCase();

                if(search_text == '' || net_name.search(search_text) != -1 || host.search(search_text) != -1){
                    fb_search = true;
                }

                return fb_search && fb_state;
            });

            netsProcess(filterNets);
        }
    });

ipcRenderer.on('nets', function (e, nets_data) {
    nets = nets_data.map(function(net, index){
        net.net_id = index + 1;
        return net;
    });

    netsProcess(nets);
});

function netsProcess(nets_data){
    let netContent = document.getElementById('nets-body');

    // create html string
    let i = 1;
    const netItems = nets_data.reduce((html, net) => {
        html += `<tr>`;
        html += `<th scope="row">${i}</th>`;
        html += `<td><a class="edit" net-id="${net.net_id}" href="#">${net.name}</a></td>`;
        html += `<td>${net.host}</td>`;
        html += `<td>${method[parseInt(net.method) - 1]}</td>`;
        html += `<td>${net.time}</td>`;
        html += `<td>${net.timeout}</td>`;
        html += `<td class="status" net-id="${net.net_id}"><span class="badge badge-success">up</span></td>`;
        if (net.status) {
            html += `<td><button type="button" net-id="${net.net_id}" net-action="stop" class="btn btn-danger btn-sm btn-net">Ngừng</button> <button type="button" net-id="${net.net_id}" class="btn btn-secondary btn-sm delete-btn">Xóa</button></td>`;
        } else {
            html += `<td><button type="button" net-id="${net.net_id}" net-action="start" class="btn btn-primary btn-sm btn-net">Theo dõi</button> <button type="button" net-id="${net.net_id}" class="btn btn-secondary btn-sm delete-btn">Xóa</button></td>`;
        }

        html += '</tr>';

        i++;

        return html;
    }, '');

    netContent.innerHTML = netItems;

    let netButtons = document.getElementsByClassName('btn-net');
    let editLinks = document.getElementsByClassName('edit');
    let deleteButtons = document.getElementsByClassName('delete-btn');

    for (let i = 0; i < netButtons.length; i++) {
        const element = netButtons[i];
        const editLink = editLinks[i];
        const deleteButton = deleteButtons[i];
        element.addEventListener('click', function (event) {
            let netAction = element.getAttribute('net-action');
            let netId = parseInt(element.getAttribute('net-id')) - 1;
            if (netAction == 'stop') {
                ipcRenderer.send('net-stop', netId);
            } else {
                ipcRenderer.send('net-start', netId);
            }
        });

        editLink.addEventListener('click', function (e) {
            let netId = parseInt(element.getAttribute('net-id')) - 1;
            ipcRenderer.send('add-net', netId);
        });

        deleteButton.addEventListener('click', function (e) {
            let netId = parseInt(element.getAttribute('net-id')) - 1;
            ipcRenderer.send('net-delete', netId);
        });
    }
}

ipcRenderer.on('net-stopped', function(e, netId){
    // modify nets
    nets[netId].status = false;
    let btnElement = document.querySelector('button[net-id="'+ (netId + 1) +'"]');
    btnElement.setAttribute('net-action', 'start');
    btnElement.className = 'btn btn-primary btn-sm btn-net';
    btnElement.innerText = 'Theo dõi';
});

ipcRenderer.on('net-started', function(e, netId){
    // modify nets
    nets[netId].status = true;
    let btnElement = document.querySelector('button[net-id="'+ (netId + 1) +'"]');
    btnElement.setAttribute('net-action', 'stop');
    btnElement.className = 'btn btn-danger btn-sm btn-net';
    btnElement.innerText = 'Ngừng';
});

ipcRenderer.on('net-down', function (e, netId) {
    let netStatus = document.querySelector('td[class="status"][net-id="'+ (netId + 1) +'"]');
    if (netStatus != null) {
        netStatus.innerHTML =
            '<span class="badge badge-secondary">down</span>';
    }
});

ipcRenderer.on('net-up', function (e, netId) {
    let netStatus = document.querySelector('td[class="status"][net-id="'+ (netId + 1) +'"]');
    if (netStatus != null) {
        netStatus.innerHTML =
            '<span class="badge badge-success">up</span>';
    }
});
