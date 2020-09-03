const Store = require('electron-store');

const netMonitors = new Store();

module.exports.getNetMonitors = function () {
    return netMonitors.get('nets') || [];
};

module.exports.getNetMonitorById = function(id){
    let nets = netMonitors.get('nets') || [];
    if(nets[id] != undefined){
        return nets[id];
    }
    return null;
}

module.exports.addNetMonitors = function (net) {
    let nets = netMonitors.get('nets') || [];
    let newNets = [...nets, net];
    netMonitors.set('nets', newNets);
};

module.exports.deleteNetMonitors = function (id) {
    let nets = netMonitors.get('nets') || [];
    if(nets[id] != undefined){
        nets.splice(id, 1);
        netMonitors.set('nets', nets);
    }
}

module.exports.updateNetMonitors = function(id, net){
    let nets = netMonitors.get('nets') || [];
    if(nets[id] != undefined){
        nets[id] = net;
        netMonitors.set('nets', nets);
    }
}