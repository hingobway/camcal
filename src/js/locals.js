const path = require('path');

const electron = require('electron');
const { shell, remote } = electron;
const ipc = electron.ipcRenderer;
const { Menu } = remote;

const win = remote.getCurrentWindow();

document.addEventListener('keyup', e => {
  if (e.key === 'Escape') win.setFullScreen(false);
});

window.addEventListener(
  'contextmenu',
  e => {
    e.preventDefault();
    Menu.buildFromTemplate([
      (fs => ({
        label: (fs ? 'Exit' : 'Go') + ' Fullscreen',
        icon: path.resolve(
          __dirname + `/../assets/fullscreen_${fs ? 'close' : 'open'}.png`
        ),
        click() {
          win.setFullScreen(!fs);
        }
      }))(win.isFullScreen()),
      {
        label: 'Configure',
        icon: path.resolve(__dirname + '/../assets/configure.png'),
        click() {
          ipc.send('config');
        }
      },
      { type: 'separator' },
      {
        label: 'Help...',
        click() {
          shell.openExternal('https://www.hingobway.me/camcal/');
        }
      }
    ]).popup();
  },
  false
);
