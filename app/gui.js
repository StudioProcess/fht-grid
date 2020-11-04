import { gui as dat } from '../node_modules/dat.gui/build/dat.gui.module.js';
import * as main from './main.js';
import * as util from './util.js';

export function create() {
  const gui = new dat.GUI();
  
  gui.add(main.params, 'rect_width', 0, 500).onFinishChange(main.recreate);
  gui.add(main.params, 'rect_height', 0, 500).onFinishChange(main.recreate);
  gui.add(main.params, 'save_svg');
}
