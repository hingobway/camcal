const electron = require('electron');
const { Menu } = electron.remote;
const ipc = electron.ipcRenderer;

const isDev = require('electron-is-dev');

function sizer() {
  const ratio = window.innerHeight / window.innerWidth;
  const bpoint = document.querySelector('.bpoint');
  const best = 0.5207;
  if (ratio < best) {
    bpoint.style.width =
      Math.round(window.innerHeight * Math.pow(best, -1)) + 'px';
  } else {
    bpoint.style.removeProperty('width');
  }
}
window.addEventListener('resize', sizer, false);

const app = new Vue({
  el: '#app',
  data: {
    sources: [],
    deviceH: '',
    deviceV: '',

    status: {
      action: 'connect',
      msg: 'Click to Connect',
      type: 'action'
    }
  },
  methods: {
    handleStatus(e) {
      switch (this.status.action) {
        case 'connect':
          this.status = {
            msg: 'Connecting...',
            type: 'loading'
          };
          ipc.send('connect');
          break;
      }
    },
    handleClick(e) {
      const el = e.currentTarget;
      const dir = el.classList[1];
      switch (dir) {
        case 'lt':
          ipc.send('step', 'left');
          break;
        case 'rt':
          ipc.send('step', 'right');
          break;
      }
    },
    handleRelease(e) {
      ipc.send('release');
    }
  },
  mounted: () => {
    sizer();
    navigator.mediaDevices.enumerateDevices().then(devices => {
      app.sources = devices
        .filter(i => i.kind === 'videoinput')
        .map(device => ({
          id: device.deviceId,
          name: device.label
        }));
    });

    ipc.on('status', (e, msg) => {
      switch (msg) {
        case 'ready':
          app.status = {
            msg: 'Connected',
            type: 'good'
          };
          break;
        case 'timeout':
          app.status = {
            msg: 'Connect timeout',
            type: 'bad',
            tip: 'Try plugging it in again, and/or click to try again.',
            action: 'connect'
          };
          break;
      }
    });
  }
});

const deviceSwitch = (dir, id) => {
  let vel = document.querySelector('.cam.' + ['horiz', 'vert'][dir]);
  navigator.mediaDevices
    .getUserMedia({ video: { deviceId: { exact: id } } })
    .then(stream => {
      vel.srcObject = stream;
    })
    .catch(err => {
      console.log(err);
      vel.srcObject = undefined;
    });
};
app.$watch('deviceH', id => deviceSwitch(0, id));
app.$watch('deviceV', id => deviceSwitch(1, id));

const win = electron.remote.getCurrentWindow();
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
        icon: `./src/assets/fullscreen_${fs ? 'close' : 'open'}.png`,
        click() {
          win.setFullScreen(!fs);
        }
      }))(win.isFullScreen()),
      { type: 'separator' },
      {
        label: 'Help...',
        click() {
          electron.shell.openExternal('https://h-n.me');
        }
      }
    ]).popup();
  },
  false
);
