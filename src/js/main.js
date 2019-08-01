const electron = require('electron');
// const { Menu } = electron.remote;
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
    motors: [false, false, false, false],
    sources: [],
    deviceH: '',
    deviceV: '',
    zoomH: 1,
    zoomV: 1,

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
        case 'up':
          ipc.send('step', 'up');
          break;
        case 'dn':
          ipc.send('step', 'down');
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
      });
      // el.addEventListener('contextmenu', e => {
      //   e.preventDefault();

      //   Menu.buildFromTemplate([
      //     {
      //       label: 'Reset Pan & Zoom',
      //       sublabel: 'Next time, just double click.',
      //       click() {
      //         el.dispatchEvent('dblclick');
      //       }
      //     }
      //   ]).popup();
      // });
    };
    draggable(document.querySelector('video.horiz'));
    draggable(document.querySelector('video.vert'));

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
      const nm = app.motors;
      nm[motor] = val;
      app.motors = nm;
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

const setZoom = (dir, val) => {
  let el = document.querySelector('.cam.' + ['horiz', 'vert'][dir]);
  el.style.transform = `scale(${((val - 1) * (10 - 1)) / (1000 - 1) + 1})`;
};
app.$watch('zoomH', v => setZoom(0, v));
app.$watch('zoomV', v => setZoom(1, v));

// WebContents code not functionally relavant to the main app window.
require('./js/locals');
