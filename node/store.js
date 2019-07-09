const uuid = require('uuid');

const electron = require('electron');
const ipc = electron.ipcMain;

let send;
module.exports = async sender => {
  send = (c, ...p) => sender.send('store-' + c, ...p);
};

/**
 * The Persistent Storage API.
 *
 * Initialized at start, uses IPC and the webContents storage API to persist data. Has 2 very simple functions, both asynchronous:
 * - get(key): get a value. Returns: value.
 * - set(key,value): store something new. Returns: nothing.
 */
module.exports.store = {
  get: key =>
    new Promise(cb => {
      send('get', key, cb);
    }),
  set: (key, value) =>
    new Promise(cb => {
      send('set', key, value, cb);
    })
};
