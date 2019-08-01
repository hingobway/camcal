const path = require('path');
const events = require('events');
const isDev = require('electron-is-dev');

const { BrowserWindow, Menu } = require('electron');

const file = rel => path.join(__dirname, rel);

const ev = new events.EventEmitter();
module.exports = () => new Promise(r => ev.once('ready', r));

// LOAD WINDOW
const load = new BrowserWindow({
  width: 300,
  height: 350,
  resizable: false,
  frame: false,
  show: false,
  backgroundColor: '#e8e4d5',
  title: 'CAMCAL',
  icon: file('../src/assets/icons/camcal.ico'),

  webPreferences: {
    nodeIntegration: true
  }
});
load.removeMenu();
load.loadFile(file('../src/load.html'));
load.on('ready-to-show', () => load.show());
load.shown = false;

/**
 * MAIN WINDOW
 */
const win = (module.exports.win = new BrowserWindow({
  width: 1000,
  height: 600,
  minWidth: 992,
  minHeight: 600,
  show: false,
  autoHideMenuBar: true,
  title: 'CAMCAL',
  backgroundColor: '#e8e4d5',
  icon: file('../src/assets/icons/camcal.ico'),
  webPreferences: {
    nodeIntegration: true
  }
}));

if (isDev) {
  win.setMenu(
    Menu.buildFromTemplate([
      {
        label: 'Tools',
        submenu: [
          { role: 'toggledevtools', accelerator: 'F12' },
          { role: 'reload', accelerator: 'Ctrl+R' }
        ]
      }
    ])
  );
} else win.removeMenu();
win.loadFile(file('../src/main.html'));

// Keep loading screen visible until app is ready AND at least 1.25 seconds have passed (for looks).
const show = () => {
  if (load.shown) {
    load.close();
    setTimeout(() => win.show(), 1000);
  } else load.shown = true;
};
setTimeout(show, 250);
win.on('ready-to-show', () => {
  ev.emit('ready');
  show();
});

/**
 * CONFIGURATION WINDOW
 */
let config;
function Config() {
  config = this.win = new BrowserWindow({
    modal: true,
    parent: win,

    width: 450,
    height: 350,
    resizable: false,

    frame: false,
    show: false,
    backgroundColor: '#e8e4d5',
    title: 'Configure CAMCAL',

    webPreferences: {
      nodeIntegration: true
    }
  });
  config.removeMenu();
  config.loadFile(file('../src/configure.html'));
  config.on('ready-to-show', () => config.show());
}
module.exports.config = Config;

const eipc = require('./ElectronIPC');
