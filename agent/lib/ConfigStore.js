const Store = require('electron-store');

const config = new Store();

module.exports.getConfig = function () {
    return config.get('config') || {};
};

module.exports.setConfig = function (cfg) {
    config.set('config', cfg);
};