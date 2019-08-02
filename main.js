const electron = require('electron');
const { app } = electron;

if (require('electron-squirrel-startup')) app.quit();

app.on('ready', async () => {
  process.stdout.write('Starting...  ');
  await require('./node/UI')();
  process.stdout.write('Done. \n\n');
});

app.on('window-all-closed', () => app.quit());
