const electron = require('electron');
const ipc = electron.ipcRenderer;

const isDev = require('electron-is-dev');
const Vue = require('../node_modules/vue/dist/vue' +
  (isDev ? '.js' : '.min.js'));

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

// CREATE INIT CONFIG
if (!localStorage.getItem('config')) {
  alert('The application needs initial configuration.');
  ipc.send('config');
}

// VARS
let lastPress = 0;

// VUE
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

    /**
     * KEY BINDINGS
     *
     * Hit an arrow to step in that direction.
     * Two or more keydown events less than 80ms apart (e.g.
     *   holding down key) will trigger continuous motion until
     *   a keyup event is registered.
     */
    document.onkeyup = e => {
      if (e.key.match(/Arrow/)) {
        const dir = e.key.match(/Arrow(\w+)/)[1].toLowerCase();
        ipc.send('step', dir);
        ipc.send('stop');
      }
    };
    document.onkeydown = e => {
      if (e.key.match(/Arrow/)) {
        const dir = e.key.match(/Arrow(\w+)/)[1].toLowerCase();
        const time = new Date().getTime();
        if (time - lastPress < 80) {
          ipc.send('cont', dir);
        }
        lastPress = time;
      }
    };

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

// WebContents code not functionally relavant to the main app window.
require('./js/locals');
