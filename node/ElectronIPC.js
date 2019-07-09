const electron = require('electron');

const ipc = electron.ipcMain;
const { BrowserWindow } = electron;

const { win } = require('./UI');
const board = require('./board');
const Stepper = require('./Stepper');
let stp1;

ipc.on('devtools', () => win.webContents.openDevTools());
ipc.on('minimize', () => win.minimize());
ipc.on('close', () => win.close());

ipc.on('store-ready', ({ sender }) => require('./store')(sender));

/**
 * Renderer Event Handling
 */
ipc.on('connect', async e => {
  // Connect to board, but timeout after 10 seconds.
  let done = false;
  const init = () => {
    done = true;
    stp1 = new Stepper({ id: 1, pins: [2, 3, 13, 5] });
    e.sender.send('status', 'ready');
  };
  const b = await board();
  b.once('ready', init);
  setTimeout(() => {
    if (done) return;
    b.removeListener('ready', init);
    e.sender.send('status', 'timeout');
  }, 10 * 1000);
});

ipc.on('step', (e, dir) => {
  if (!stp1) return;
  switch (dir) {
    case 'left':
      stp1.step(true);
      break;
    case 'right':
      stp1.step(false);
      break;
  }
});

ipc.on('release', e => {
  if (!stp1) return;
  stp1.off();
});
