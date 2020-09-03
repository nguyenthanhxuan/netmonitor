const { ipcRenderer } = require('electron');


document.getElementById('system-form').addEventListener('submit', function(e){
    let server_url_el = document.getElementById('server_url');
    let agent_name_el = document.getElementById('agent_name');
    let agent_ip_el = document.getElementById('agent_ip');

    let system = {
        server_url: server_url_el.value,
        agent_name: agent_name_el.value,
        agent_ip: agent_ip_el.value
    }

    ipcRenderer.send('save-system', system);
});

ipcRenderer.on('config', function(e, config){
    console.log(config);
    let server_url = document.getElementById('server_url');
    let agent_name = document.getElementById('agent_name');
    let agent_ip = document.getElementById('agent_ip');
    
    server_url.value = config.server_url;
    agent_name.value = config.agent_name;
    agent_ip.value = config.agent_ip;
});