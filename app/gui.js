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
  gui.add(main.params, 'sort', ['lva_name', 'lva_id', 'studium_name', 'studium_id']).onFinishChange(main.recreate);
  gui.add(main.params, 'labels', ['none', 'lva_name', 'lva_id', 'studium_name', 'studium_id']).onFinishChange(main.recreate);
  gui.add(main.params, 'label_groups_only').onFinishChange(main.recreate);
  gui.add(main.params, 'label_every', 1, 20, 1).onFinishChange(main.recreate);
  gui.add(main.params, 'label_size', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'group_offset', 0, 30, 1).onFinishChange(main.recreate);
  gui.add(main.params, 'group_count', 1, 31, 1).onFinishChange(main.recreate);
  gui.addColor(main.params, 'color').onFinishChange(main.recreate);
  gui.add(main.params, 'opacity', 0, 1, 0.01).onFinishChange(main.recreate);
  gui.add(main.params, 'stroke_width', 0).onFinishChange(main.recreate);
  gui.add(main.params, 'fill').onFinishChange(main.recreate);
  gui.add(main.params, 'fill_rule', ['nonzero', 'evenodd']).onFinishChange(main.recreate);
  gui.add(main.params, 'save_svg');
}
