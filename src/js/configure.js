const isDev = require('electron-is-dev');
const Vue = require('../node_modules/vue/dist/vue' +
  (isDev ? '.js' : '.min.js'));

const electron = require('electron');

const win = electron.remote.getCurrentWindow();

const saved = JSON.parse(localStorage.getItem('config'));

const app = new Vue({
  el: '#app',
  data: {
    c: saved || {
      pins: [[2, 3, 4, 5]],
      tapSteps: 10,
      stepsPerSecond: 125
    }
  },
  methods: {
    close() {
      win.close();
    }
  },
  mounted() {
    // win.openDevTools();
    localStorage.setItem('config', JSON.stringify(this.c));
  },
  updated() {
    localStorage.setItem('config', JSON.stringify(this.c));
  }
});

document.addEventListener('keyup', e => {
  if (e.key === 'Escape') win.close();
});
