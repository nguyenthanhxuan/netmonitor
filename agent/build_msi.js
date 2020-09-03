// 1. Import Modules
const { MSICreator } = require('electron-wix-msi');
const path = require('path');

// 2. Define input and output directory.
const APP_DIR = path.resolve(__dirname, './release-builds/netMonitor-win32-ia32');

const OUT_DIR = path.resolve(__dirname, './windows_installer');

// 3. Instantiate the MSICreator
const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,

    // Configure metadata
    description: 'Phần mềm theo dõi kết nối mạng',
    exe: 'netMonitor',
    name: 'netMonitor',
    manufacturer: 'Xuan Nguyen',
    version: '1.0.0',
    iconPath: path.resolve(__dirname, './assets/images/network_icon.ico'),
    shortcutName: 'netMonitor',

    // Configure installer User Interface
    ui: {
        chooseDirectory: true
    },
});

// // 4. Create a .wxs template file
// msiCreator.create().then(function(){

//     // Step 5: Compile the template to a .msi file
//     msiCreator.compile();
// });

// Step 2: Create a .wxs template file
const supportBinaries = await msiCreator.create();

// 🆕 Step 2a: optionally sign support binaries if you
// sign you binaries as part of of your packaging script
supportBinaries.forEach(async (binary) => {
  // Binaries are the new stub executable and optionally
  // the Squirrel auto updater.
  await signFile(binary);
});

// Step 3: Compile the template to a .msi file
await msiCreator.compile();
