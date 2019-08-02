const electron = require('electron');

const ipc = electron.ipcMain;
const { BrowserWindow } = electron;

const { win, config } = require('./UI');
const board = require('./board');
const Stepper = require('./Stepper');
const stp = [];

const conf = async () =>
  JSON.parse(
    await win.webContents.executeJavaScript(`localStorage.getItem('config')`)
  );

ipc.on('devtools', () => win.webContents.openDevTools());
ipc.on('minimize', () => win.minimize());
ipc.on('close', () => win.close());

/**
 * Renderer Event Handling
 */
ipc.on('connect', async e => {
  // Connect to board, but timeout after 10 seconds.
  let done = false;
  const init = async () => {
    done = true;
    stp.push(new Stepper({ id: 1, pins: (await conf()).pins[0] }));
    stp.forEach((motor, i) =>
      motor.on('change', stage => e.sender.send('motor', i, stage ? !!1 : !!0))
    );
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

ipc.on('config', () => {
  const { win } = new config();
});

// MOTOR MOVEMENT FUNCTIONS
let spin = [];
ipc.on('cont', async (e, dir) => {
  if (!stp.length) return;
  if (spin.length > 0) return;

  dir = dir === 'down' ? true : dir === 'up' ? false : undefined;
  spin.push(
    setInterval(
      () => stp[0].step(dir),
      1000 / ((await conf()).stepsPerSecond || 125)
    )
  );
});
ipc.on('stop', e => {
  spin.forEach(cur => clearInterval(cur));
  spin = [];
});

ipc.on('step', async (e, dir) => {
  if (!stp.length || spin.length) return;
  dir = dir === 'down' ? true : dir === 'up' ? false : undefined;

  for (i = 0; i < ((await conf()).tapSteps || 10); i++) stp[0].step(dir);
});

ipc.on('release', e => {
  if (!stp[0]) return;
  stp[0].off();
});
