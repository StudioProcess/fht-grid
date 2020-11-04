import * as main from './main.js';
import * as util from './util.js';

export function setup() {
  document.addEventListener('keydown', e => {
    // console.log(e.key, e.keyCode, e);
    
    if (e.key == 'f') { // f .. fullscreen
      util.toggleFullscreen();
    }
    
    else if (e.key == 's') { // s .. save svg
      main.save();
    }
  });
}
