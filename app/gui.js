import { gui as dat } from '../node_modules/dat.gui/build/dat.gui.module.js';
import * as main from './main.js';
import * as util from './util.js';

export let gui;

export function create() {
  gui = new dat.GUI();
  
  gui.add(main.params, 'format', ['single_page', 'spread']).onFinishChange(main.recreate);
  gui.add(main.params, 'arrangement', ['grid', 'circle', 'spiral']).onFinishChange(main.recreate);
  gui.add(main.params, 'grid_cols', 1).onFinishChange(main.recreate);
  gui.add(main.params, 'grid_h_space', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'grid_v_space', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'circle_diameter', 1, undefined, 1).onFinishChange(main.recreate);
  gui.add(main.params, 'spiral_diameter', 1, undefined, 1).onFinishChange(main.recreate);
  gui.add(main.params, 'spiral_windings', 1, undefined, 0.1).onFinishChange(main.recreate);
  gui.add(main.params, 'spiral_equidistant').onFinishChange(main.recreate);
  gui.add(main.params, 'dots', ['all', 'none', 'groups', 'non-groups']).onFinishChange(main.recreate);
  gui.add(main.params, 'dot_size', 0).onFinishChange(main.recreate);
  gui.addColor(main.params, 'dot_color', 0).onFinishChange(main.restyle);
  gui.add(main.params, 'sort', ['lehrveranstaltung_id', 'bezeichnung', 'bezeichnung_englisch', 'kurzbz', 'ects', 'lehrform', 'organisationsform', 'pflicht', 'semester', 'sws', 'unterrichtssprache', '_studium_name', '_studium_id', '_rooms', '_lehrende']).onFinishChange(main.recreate);
  
  let f = gui.addFolder('labels');
  f.add(main.params, 'labels', ['_none', 'lehrveranstaltung_id', 'bezeichnung', 'bezeichnung_englisch', 'kurzbz', 'ects', 'lehrform', 'organisationsform', 'pflicht', 'semester', 'sws', 'unterrichtssprache', '_studium_name', '_studium_id', '_rooms', '_lehrende']).onFinishChange(main.recreate);
  f.addColor(main.params, 'label_color').onFinishChange(main.restyle);
  f.addColor(main.params, 'label_bgcolor').onFinishChange(main.restyle);
  f.add(main.params, 'label_bgopacity', 0, 1, 0.01).onFinishChange(main.restyle);
  f.add(main.params, 'label_offset_x', undefined, undefined, 0.1).onFinishChange(main.recreate);
  f.add(main.params, 'label_offset_y', undefined, undefined, 0.1).onFinishChange(main.recreate);
  f.add(main.params, 'label_padding_x', 0, undefined, 0.1).onFinishChange(main.recreate);
  f.add(main.params, 'label_padding_y', 0, undefined, 0.1).onFinishChange(main.recreate);
  f.add(main.params, 'label_rotation', -180, 180, 0.1).onFinishChange(main.recreate);
  f.add(main.params, 'label_orient_center').onFinishChange(main.recreate);
  f.add(main.params, 'label_groups_only').onFinishChange(main.recreate);
  f.add(main.params, 'label_every', 1, undefined, 1).onFinishChange(main.recreate);
  f.add(main.params, 'label_size', 1, undefined, 0.1).onFinishChange(main.recreate);
  f.add(main.params, 'label_maxlen', 1, undefined, 1).onFinishChange(main.recreate);
  
  f = gui.addFolder('groups');
  f.add(main.params, 'group_by', ['studien', 'rooms', 'lehrende']).onFinishChange(main.recreate);
  f.add(main.params, 'group', []);
  f.add(main.params, 'group_count', 1, 31, 1).onFinishChange(main.recreate);
  f.add(main.params, 'show_connections').onFinishChange(main.recreate);
  f.add(main.params, 'conn_sort', ['_default', 'bezeichnung', 'lehrveranstaltung_id', '_x_y', '_y_x', '_random']).onFinishChange(main.recreate);
  f.add(main.params, 'conn_rnd_seed', undefined, undefined, 1).onFinishChange(main.recreate);
  f.addColor(main.params, 'conn_color').onFinishChange(main.restyle);
  f.add(main.params, 'conn_opacity', 0, 1, 0.01).onFinishChange(main.restyle);
  f.add(main.params, 'conn_stroke_width', 0).onFinishChange(main.restyle);
  f.add(main.params, 'conn_fill').onFinishChange(main.restyle);
  f.add(main.params, 'conn_fill_rule', ['nonzero', 'evenodd']).onFinishChange(main.recreate);
  f.add(main.params, 'show_hull').onFinishChange(main.recreate);
  f.add(main.params, 'hull_concavity', undefined, undefined, 0.01).onFinishChange(main.recreate);
  f.add(main.params, 'hull_lengthThresh', 0, undefined, 1).onFinishChange(main.recreate);
  f.addColor(main.params, 'hull_color').onFinishChange(main.restyle);
  f.add(main.params, 'hull_opacity', 0, 1, 0.01).onFinishChange(main.restyle);
  f.add(main.params, 'hull_stroke_width', 0).onFinishChange(main.restyle);
  f.add(main.params, 'hull_fill').onFinishChange(main.recreate);
  
  gui.addColor(main.params, 'bg_color').onFinishChange(main.recreate);
  gui.add(main.params, 'save_svg');
}
