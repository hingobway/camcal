const electron = require('electron');
const { shell, remote } = electron;
const { dialog } = remote;
const ipc = electron.ipcRenderer;

const isDev = require('electron-is-dev');
const Vue = require('../node_modules/vue/dist/vue' +
  (isDev ? '.js' : '.min.js'));

function sizer() {
  const ratio = window.innerHeight / window.innerWidth;
  const bpoint = document.querySelector('.bpoint');
  const best = 0.515;
  if (ratio < best) {
    bpoint.style.width =
      Math.round(window.innerHeight * Math.pow(best, -1)) + 'px';
  } else {
    bpoint.style.removeProperty('width');
  }
}
window.addEventListener('resize', sizer, false);

const deviceSwitch = (dir, id) => {
  localStorage.setItem('device' + ['H', 'V'][dir], id);
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

// CREATE INIT CONFIG
if (!localStorage.getItem('config')) {
  dialog.showMessageBox(remote.getCurrentWindow(), {
    detail: 'The application needs initial configuration.',
    title: 'CAMCAL'
  });
  ipc.send('config');
}
document.querySelector('.bpoint').style.display = null;

// VARS
let lastPress = 0;

// VUE
const app = new Vue({
  el: '#app',
  data: {
    motors: [false, false, false, false],
    sources: [],
    deviceH: localStorage.getItem('deviceH') || '',
    deviceV: localStorage.getItem('deviceV') || '',
    zoomH: 1,
    zoomV: 1,
    rotateH: 0,
    rotateV: 0,

    status: {
      action: 'connect',
      msg: 'Click to Connect',
      type: 'action'
    }
  },
  computed: {
    systemOn() {
      let out = false;
      for (i in this.motors) {
        if (this.motors[i]) {
          out = true;
          break;
        }
      }
      return out;
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
    handleRelease(e) {
      ipc.send('release');
    },
    handleHelp(e) {
      shell.openExternal('https://www.hingobway.me/camcal/');
    },
    handleRotate(e) {
      const dir = e.currentTarget.classList.contains('horiz') ? 'H' : 'V';
      const val = this['rotate' + dir];
      const nv = val >= 270 ? 0 : val + 90;
      this['rotate' + dir] = nv;
    }
  },
  mounted() {
    sizer();
    navigator.mediaDevices.enumerateDevices().then(devices => {
      app.sources = devices
        .filter(i => i.kind === 'videoinput')
        .map(device => ({
          id: device.deviceId,
          name: device.label
        }));
    });

    // Draggable Videos
    const draggable = el => {
      let start = [0, 0];

      const handleMouseDown = e => {
        e.preventDefault();
        start = [e.clientX, e.clientY];

        el.style.cursor = 'grabbing';

        el.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleEnd);
      };
      const handleMouseMove = e => {
        const diff = [start[0] - e.clientX, start[1] - e.clientY];
        start = [e.clientX, e.clientY];

        el.style.left = el.offsetLeft - diff[0] + 'px';
        el.style.top = el.offsetTop - diff[1] + 'px';
      };

      const handleEnd = e => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.style.cursor = null;

        document.removeEventListener('mouseup', handleEnd);
      };

      el.addEventListener('mousedown', handleMouseDown);

      el.addEventListener('dblclick', () => {
        el.style.left = 0;
        el.style.top = 0;
        const selector = el.classList.contains('horiz') ? 'H' : 'V';
        app['zoom' + selector] = 1;
        app['rotate' + selector] = 0;
      });
    };
    draggable(document.querySelector('video.horiz'));
    draggable(document.querySelector('video.vert'));

    /**
     * ARROW BUTTONS
     *
     * Click an arrow to move in that direction. Hold it down for
     *   more than 600ms to trigger continuous motion until
     *   you let go.
     */
    const getDir = el => {
      const dir = el.classList.item(1);
      if (dir === 'lt') return 'left';
      if (dir === 'rt') return 'right';
      if (dir === 'up') return 'up';
      if (dir === 'dn') return 'down';
    };
    document.querySelectorAll('.arrow').forEach(el => {
      el.addEventListener('mousedown', e => {
        const wait = setTimeout(() => {
          el.onmouseup = null;

          ipc.send('cont', getDir(el));
        }, 600);
        el.onmouseup = () => {
          clearTimeout(wait);
          el.onmouseup = null;
        };
      });
      el.addEventListener('mouseup', e => ipc.send('step', getDir(el)));
    });
    document.addEventListener('mouseup', () => ipc.send('stop'));

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

    ipc.on('status', (_, msg) => {
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
    ipc.on('motor', (_, motor, val) => {
      const nm = Object.assign({}, app.motors);
      nm[motor] = val;
      app.motors = nm;
    });

    if (this.deviceH) deviceSwitch(0, this.deviceH);
    if (this.deviceV) deviceSwitch(1, this.deviceV);
  }
});

app.$watch('deviceH', id => deviceSwitch(0, id));
app.$watch('deviceV', id => deviceSwitch(1, id));

const setZoom = dir => {
  const el = document.querySelector('.cam.' + ['horiz', 'vert'][dir]);
  const prefix = dir ? 'V' : 'H';
  const scale = ((app['zoom' + prefix] - 1) * (10 - 1)) / (1000 - 1) + 1;
  const rotate = app['rotate' + prefix];
  el.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
};
app.$watch('zoomH', () => setZoom(0));
app.$watch('zoomV', () => setZoom(1));
app.$watch('rotateH', () => setZoom(0));
app.$watch('rotateV', () => setZoom(1));

// WebContents code not functionally relavant to the main app window.
require('./js/locals');
