import { gui as dat } from '../node_modules/dat.gui/build/dat.gui.module.js';
import * as main from './main.js';
import * as util from './util.js';

export function create() {
  const gui = new dat.GUI();
  
  gui.add(main.params, 'format', ['single_page', 'spread']).onFinishChange(main.recreate);
  gui.add(main.params, 'arrangement', ['grid', 'circle', 'spiral']).onFinishChange(main.recreate);
  gui.add(main.params, 'grid_cols', 1).onFinishChange(main.recreate);
  gui.add(main.params, 'grid_h_space', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'grid_v_space', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'circle_diameter', 1, undefined, 1).onFinishChange(main.recreate);
  gui.add(main.params, 'spiral_diameter', 1, undefined, 1).onFinishChange(main.recreate);
  gui.add(main.params, 'spiral_windings', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'spiral_equidistant').onFinishChange(main.recreate);
  gui.add(main.params, 'dot_size', 0).onFinishChange(main.recreate);
  gui.addColor(main.params, 'dot_color', 0).onFinishChange(main.restyle);
  gui.add(main.params, 'sort', ['lva_name', 'lva_id', 'studium_name', 'studium_id']).onFinishChange(main.recreate);
  gui.add(main.params, 'labels', ['none', 'lva_name', 'lva_id', 'studium_name', 'studium_id']).onFinishChange(main.recreate);
  gui.addColor(main.params, 'label_color').onFinishChange(main.restyle);
  gui.addColor(main.params, 'label_bgcolor').onFinishChange(main.restyle);
  gui.add(main.params, 'label_bgopacity', 0, 1, 0.01).onFinishChange(main.restyle);
  gui.add(main.params, 'label_rotation', -180, 180, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'label_groups_only').onFinishChange(main.recreate);
  gui.add(main.params, 'label_every', 1, undefined, 1).onFinishChange(main.recreate);
  gui.add(main.params, 'label_size', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'label_maxlen', 1, undefined, 1).onFinishChange(main.recreate);
  gui.add(main.params, 'group_offset', 0, 30, 1).onFinishChange(main.recreate);
  gui.add(main.params, 'group_count', 1, 31, 1).onFinishChange(main.recreate);
  gui.addColor(main.params, 'group_color').onFinishChange(main.restyle);
  gui.add(main.params, 'opacity', 0, 1, 0.01).onFinishChange(main.restyle);
  gui.add(main.params, 'stroke_width', 0).onFinishChange(main.restyle);
  gui.add(main.params, 'show_connections').onFinishChange(main.recreate);
  gui.add(main.params, 'show_grid').onFinishChange(main.recreate);
  gui.add(main.params, 'fill').onFinishChange(main.restyle);
  gui.add(main.params, 'fill_rule', ['nonzero', 'evenodd']).onFinishChange(main.recreate);
  gui.addColor(main.params, 'bg_color').onFinishChange(main.recreate);
  gui.add(main.params, 'save_svg');
}
