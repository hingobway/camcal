const url = require('url');
const events = require('events');
const isDev = require('electron-is-dev');

const { BrowserWindow, Menu, shell } = require('electron');

const ev = new events.EventEmitter();
module.exports = () => new Promise(r => ev.once('ready', r));

const win = (module.exports.win = new BrowserWindow({
  width: 1000,
  height: 600,
  minWidth: 992,
  minHeight: 600,
  show: false,
  autoHideMenuBar: true,
  title: 'CAMCAL',
  backgroundColor: '#e8e4d5',
  // icon: __dirname + '/../public/assets/img/logo_64x64.png',
  webPreferences: {
    nodeIntegration: true
  }
}));

const eipc = require('./ElectronIPC');

if (true) {
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
win.loadURL(
  process.env.BROWSE_START_URL ||
    url.format({
      pathname: __dirname + '/../src/index.html',
      protocol: 'file:',
      slashes: true
    })
);
win.on('ready-to-show', () => {
  win.show();
  ev.emit('ready');
});
