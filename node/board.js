const j5 = require('johnny-five');
const events = require('events');

const self = (module.exports = () =>
  new Promise(r => {
    const out = new events.EventEmitter();
    r(out);

    self.board = new j5.Board({
      repl: false
    });
    self.board.on('ready', () => {
      self.ready = true;
      out.emit('ready');
    });
  }));

self.ready = false;
