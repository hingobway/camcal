const events = require('events');
const j5 = require('johnny-five');

const board = require('./board');

// ENUMS
const modes = {
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
};

// PRIVATE
let coil;

/**
 * @class Stepper
 * @description Controller for RS 440-442 stepper motor.
 *
 * @method step Steps one step in set direction.
 * @method switch Change direction.
 * @method off Turn off all coils.
 * @param {Boolean} reverse Default: false. Whether or not direction is counterclockwise.
 */
class Stepper extends events {
  coil = [];
  reverse = false;

  /**
   * CURRENT STATE
   *
   * The current state, in accordance with RS 440-442 datasheet. Pattern is as such [wire(coil #)]:
   * 0: OFF
   * 1: Red(1) + Green(3)
   * 2: Green(3) + Black(2)
   * 3: Black(2) + Yellow(4)
   * 4: Yellow(4) + Red(1)
   */
  h = {
    value: 0,
    watchState: this.watchState.bind(this),
    get state() {
      return this.value;
    },
    set state(nv) {
      this.value = nv;
      this.watchState(nv);
    }
  };

  constructor({ pins, id }) {
    super();

    this.id = id;
    if (board.ready) {
      this.handleReady(pins);
      return this;
    } else {
      throw new Error(`Board must be connected before instantiating Stepper.`);
    }
  }

  handleReady(pins) {
    coil = [
      null,
      j5.Pin({
        pin: pins[0],
        mode: modes.OUTPUT,
        board: board.board
      }),
      j5.Pin({
        pin: pins[1],
        mode: modes.OUTPUT,
        board: board.board
      }),
      j5.Pin({
        pin: pins[2],
        mode: modes.OUTPUT,
        board: board.board
      }),
      j5.Pin({
        pin: pins[3],
        mode: modes.OUTPUT,
        board: board.board
      })
    ];
    this.h.state = 0;

    // j5.Pin({
    //   pin: 8,
    //   mode: modes.INPUT,
    //   board: board.board
    // }).read((_, v) => console.log(v));
  }

  watchState(nv) {
    if (!board.ready) return;

    console.log(`MTR-${this.id} STATE`, nv);
    this.emit('change', nv);

    switch (nv) {
      case 0:
        // 1+2+3+4 OFF
        coil[1].low();
        coil[2].low();
        coil[3].low();
        coil[4].low();
        break;
      case 1:
        // 1+3 ON, 2+4 OFF
        coil[1].high();
        coil[3].high();
        coil[2].low();
        coil[4].low();
        break;
      case 2:
        // 2+3 ON, 1+4 OFF
        coil[2].high();
        coil[3].high();
        coil[1].low();
        coil[4].low();
        break;
      case 3:
        // 2+4 ON, 1+3 OFF
        coil[2].high();
        coil[4].high();
        coil[1].low();
        coil[3].low();
        break;
      case 4:
        // 1+4 ON, 2+3 OFF
        coil[1].high();
        coil[4].high();
        coil[2].low();
        coil[3].low();
        break;
    }
  }

  step(rev) {
    if (!board.ready) return;

    if (rev != undefined) this.reverse = rev ? true : false;

    if (this.reverse) this.h.state = this.h.state > 1 ? this.h.state - 1 : 4;
    else this.h.state = this.h.state < 4 ? this.h.state + 1 : 1;
  }

  switch() {
    this.reverse = !this.reverse;
  }

  off() {
    this.h.state = 0;
  }
}

module.exports = Stepper;
