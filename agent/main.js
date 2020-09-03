// Modules to control application life and create native browser window
const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const monitor = require('./lib/Monitor');
const MonitorHelloServer = require('./lib/MonitorHelloServer');
const MonitorAlert = require('./lib/MonitorAlert');

const { getConfig, setConfig } = require('./lib/ConfigStore');
const config = getConfig();

const serverURL = config.server_url || 'http://10.230.1.32:8888';
const agentName = config.agent_name || 'AGENT_MONITOR';
const agentIP = config.agent_ip || '10.230.1.10';

// Get custom lib
const {
    getNetMonitors,
    addNetMonitors,
    deleteNetMonitors,
    updateNetMonitors,
    getNetMonitorById,
} = require('./lib/MonitorStore');
const { stat } = require('fs');

const assets = path.join(__dirname, 'assets');

let tray = null;
let configWindow = null;
let aboutWindow = null;
let addNetWindow = null;
let systemWindow = null;
let monitors = [];
let isMonitoring = true;
let hello = null;

let trayMenu = [
    { label: 'Giới thiệu', type: 'normal', click: showAboutWindow },
    { type: 'separator' },
    { label: 'Cấu hình network', type: 'normal', click: showConfigWindow },
    { label: 'Cấu hình hệ thống', type: 'normal', click: showSystemWindow },
    { type: 'separator' },
    { label: 'Đừng theo dõi tất cả', type: 'checkbox', click: toggleMonitor },
    { type: 'separator' },
    {
        label: 'Thoát',
        type: 'normal',
        click: appQuit,
    },
];

if (process.platform === 'darwin') {
    app.dock.hide();
} else {
    Menu.setApplicationMenu(null);
}

function createWindow(width, height, file) {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: width,
        height: height,
        center: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // and load the index.html of the app.
    // mainWindow.loadFile('./screens/config/index.html');
    mainWindow.loadFile(file);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
    return mainWindow;
}

function createTray() {
    tray = new Tray(path.join(assets, '/images/network16.png'));
    const contextMenu = Menu.buildFromTemplate(trayMenu);
    tray.setToolTip('Theo dõi mạng máy tính');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', function(){
        showConfigWindow();
    });
}

ipcMain.on('add-net', function (event, netId) {
    // Create the browser window.
    addNetWindow = new BrowserWindow({
        width: 450,
        height: 600,
        center: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
        },
        parent: configWindow,
    });

    // and load the index.html of the app.
    addNetWindow.loadFile('./screens/add_net/add_net.html');

    // addNetWindow.webContents.openDevTools();

    addNetWindow.webContents.on('did-finish-load', () => {
        let net = getNetMonitorById(netId);
        addNetWindow.webContents.send('edit-net', netId, net);
    });
});

// Add network and stored to database
ipcMain.on('net-added', function (e, data) {
    if (data.netid !== '-1') {
        // Edit
        let netId = parseInt(data.netid);
        delete data.netid;
        updateNetMonitors(netId, data);
        addNetWindow.close();
    } else {
        // Add
        addNetMonitors(data);
    }

    isMonitoring = true;
    toggleMonitor();

    let nets = getNetMonitors();
    monitorNet(nets);

    sendHello();

    configWindow.send('nets', nets);
});

// Stop service
ipcMain.on('net-stop', function (e, netId) {
    monitors[netId].stop();
    changeNetStatus(netId, false);
    configWindow.webContents.send('net-stopped', netId);
});

// Start service
ipcMain.on('net-start', function (e, netId) {
    monitors[netId].start();
    changeNetStatus(netId, true);
    configWindow.webContents.send('net-started', netId);
});

// Save system
ipcMain.on('save-system', function(e, sysConfig){
    setConfig(sysConfig);
    let confirm = dialog.showMessageBox({
        type: 'question',
        title: 'Lưu cấu hình thành công',
        message: 'Lưu cấu hình thành công, hãy khởi động lại ứng dụng để đảm bảo ứng dụng chạy ổn định.',
        buttons: ['Đồng ý'],
    });

    Promise.resolve(confirm).then(function (confirmValue) {
        if (confirmValue.response === 0) {
            systemWindow.close();
            app.quit();
        }
    });
    
});

// EDIT && DELETE
ipcMain.on('net-delete', function (e, netId) {
    let net = getNetMonitorById(netId);
    let confirm = dialog.showMessageBox({
        type: 'question',
        title: 'Bạn có chắc chắn muốn xóa?',
        message: `Bạn có chắc chắn muốn xóa?\nTên: ${net.name} \nHost/Domain: ${net.host}`,
        buttons: ['Đồng ý', 'Bỏ qua'],
    });

    Promise.resolve(confirm).then(function (confirmValue) {
        if (confirmValue.response === 0) {
            deleteNetMonitors(netId);

            isMonitoring = true;
            toggleMonitor();

            let nets = getNetMonitors();
            monitorNet(nets);

            sendHello();

            configWindow.send('nets', nets);
        }
    });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createTray();

    // Monitor network when app ready
    let nets = getNetMonitors();
    monitorNet(nets);

    // Send hello to server
    sendHello();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    // if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// App function here
function appQuit() {
    app.quit();
}

function sendHello() {
    let nets = getNetMonitors();

    // SEND HELLO TO SERVER
    if (hello == null) {
        hello = new MonitorHelloServer(
            serverURL,
            agentName,
            agentIP,
            nets,
            monitors
        );
    } else {
        hello.restart(nets, monitors);
    }
}

function showAboutWindow() {
    if (aboutWindow == null) {
        aboutWindow = createWindow(300, 200, './screens/about/about.html');
        aboutWindow.on('closed', function () {
            aboutWindow = null;
        });
    } else {
        aboutWindow.show();
    }
}

function showConfigWindow() {
    if (configWindow == null) {
        configWindow = createWindow(900, 600, './screens/config/index.html');
        configWindow.on('closed', function () {
            configWindow = null;
        });

        configWindow.webContents.on('did-finish-load', () => {
            let nets = getNetMonitors();
            configWindow.webContents.send('nets', nets);
        });
    } else {
        configWindow.show();
    }
}

function showSystemWindow(){
    if(systemWindow == null){
        systemWindow = createWindow(300, 400, './screens/system/system.html');
        systemWindow.on('closed', function(){
            systemWindow = null;
        });

        systemWindow.webContents.on('did-finish-load', () => {
            let cfg = {
                server_url: serverURL,
                agent_name: agentName,
                agent_ip: agentIP
            };

            systemWindow.webContents.send('config', cfg);
        });
    } else {
        systemWindow.show();
    }
}

function toggleMonitor() {
    isMonitoring = isMonitoring ? false : true;
    let nets = getNetMonitors();
    monitors.forEach((monitorItem, index) => {
        if (isMonitoring) {
            if(nets[index].status){
                monitorItem.start();
            }
        } else {
            monitorItem.stop();
        }
    });
}

function changeNetStatus(id, status) {
    let netNeedChange = getNetMonitorById(id);
    netNeedChange.status = status;
    updateNetMonitors(id, netNeedChange);
}

function monitorNet(nets) {
    monitors = [];
    for (let i = 0; i < nets.length; i++) {
        const net = nets[i];
        const netMonitoring = new monitor(
            i,
            net.host,
            net.method,
            parseInt(net.time),
            parseInt(net.timeout),
            net.status
        );

        netMonitoring.on('up', (status) => {
            console.log(
                `Network with name ${net.name} and host ${net.host} is up`
            );
            if (configWindow != null) {
                configWindow.webContents.send('net-up', i);
            }
        });

        netMonitoring.on('down', (status) => {
            console.log(
                `Network with name ${net.name} and host ${net.host} is down`
            );
            if (configWindow != null) {
                configWindow.webContents.send('net-down', i);
            }
        });

        netMonitoring.on('die', (status) => {
            console.log(
                `Network with name ${net.name} and host ${net.host} was die`
            );

            if (status.totalDies == 1 || status.totalDies == 10) {
                status.name = net.name;
                status.agent = agentName;
                const netAlert = new MonitorAlert(serverURL, status);
                (async () => {
                    await netAlert.report();
                })();

                // Stop send alert to server if die time == 10
                if (status.totalDies == 10) {
                    netMonitoring.stop();
                    changeNetStatus(i, false);
                    if (configWindow != null) {
                        configWindow.webContents.send('net-stopped', i);
                    }
                }
            }
        });

        monitors.push(netMonitoring);
    }
}
