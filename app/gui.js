import { gui as dat } from '../node_modules/dat.gui/build/dat.gui.module.js';
import * as main from './main.js';
import * as util from './util.js';

export function create() {
  const gui = new dat.GUI();
  
  gui.add(main.params, 'format', ['single_page', 'spread']).onFinishChange(main.recreate);
  gui.add(main.params, 'grid_cols', 1).onFinishChange(main.recreate);
  gui.add(main.params, 'h_space', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'v_space', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'dot_size', 0).onFinishChange(main.recreate);
  gui.add(main.params, 'sort', ['lva_name', 'lva_id', 'studium_name']).onFinishChange(main.recreate);
  gui.add(main.params, 'save_svg');
}
