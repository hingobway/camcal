const file = rel => require('path').resolve(__dirname + '/' + rel);

const icon = './src/assets/icons/camcal.ico';

module.exports = {
  packagerConfig: { icon },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupExe: 'Install_CAMCAL.exe',
        setupIcon: file(icon),
        iconUrl: file(icon),
        loadingGif: file('./src/assets/load/load.gif')
      }
    }
  ]
};
