import { SVG } from '../node_modules/@svgdotjs/svg.js/dist/svg.esm.js';
import * as util from './util.js';
import * as keys from './keys.js';
import * as gui from './gui.js';
import * as data_loader from './data.js';

export const config = {
  SINGLE_W: 205, // [mm]
  SINGLE_H: 276,
  SPREAD_W: 410,
  SPREAD_H: 276,
};

export const params = {
  format: 'spread',
  arrangement: 'grid',
  grid_cols: 38,
  grid_h_space: 14.5,
  grid_v_space: 20.0, // 14.5
  circle_diameter: 540,
  spiral_diameter: 540,
  spiral_windings: 8,
  spiral_equidistant: false,
  dot_size: 1.75,
  dot_color: '#000000',
  sort: 'lva_id',
  labels: 'lva_name',
  label_color: '#000000',
  label_bgcolor: '#00b3ff',
  label_bgopacity: 1,
  label_offset: 1,
  label_padding_x: 1,
  label_padding_y: 1,
  label_rotation: 0,
  label_orient_center: false,
  label_groups_only: true,
  label_every: 1,
  label_size: 6,
  label_maxlen: 100,
  group_by: 'studien',
  group_name: '',
  group_offset: 0,
  group_count: 1,
  group_color: '#000000',
  opacity: 0.8,
  fill: false,
  fill_rule: 'nonzero',
  stroke_width: 0.75,
  show_grid: true,
  show_connections: true,
  bg_color: '#FFFFFF', //#FFFFFa
  save_svg: save,
};

export let W, H; // [pt]
export let data, lvas, groups;
export const draw = SVG('#svg');
export let style;

function set_size() {
  if (params.format == 'spread') {
    W = config.SPREAD_W;
    H = config.SPREAD_H;
    document.querySelector('#line').style.display = 'block';
  } else {
    W = config.SINGLE_W;
    H = config.SINGLE_H;
    document.querySelector('#line').style.display = 'none';
  }
  W = util.mm2pt(W);
  H = util.mm2pt(H);
  draw.size(`${W}pt`, `${H}pt`);
  draw.viewbox(0, 0, W, H); // now we can specify all values in pt, but don't have to write 'pt' all the time. also contents of svg scale when svg is resized automatically
}

function make_lva_label(lva) {
  let text = '';
  if (params.labels === 'lva_name') {
    text = lva['bezeichnung'];
  } else if (params.labels === 'lva_id') {
    text = lva['lehrveranstaltung_id'];
  } else if (params.labels === 'studium_name') {
    let a = lva;
    while (typeof a === 'object' && a !== null && '_modul' in a) a = a['_modul'];
    text = a['_studium']['_name'];
  } else if (params.labels === 'studium_id') {
    let a = lva;
    while (typeof a === 'object' && a !== null && '_modul' in a) a = a['_modul'];
    text = a['_studium']['_studiengang_kz'];
  } else return;
  let x = lva['_pos'][0];
  let y = lva['_pos'][1];
  let x_offset = params.dot_size/2 + params.label_offset;
  let y_offset = -params.label_size;
  if (text.length > params.label_maxlen) { text = text.slice(0, params.label_maxlen) + '…'; }
  let r = params.label_rotation;
  if (params.label_orient_center) { r += Math.atan2(y - H/2, x - W/2) / (2*Math.PI) * 360; }
  let g = draw.group().translate(x, y).rotate(r);
  let bg = g.rect().addClass('label-bg').translate(x_offset, y_offset);
  g.text(text).font({'size': params.label_size}).addClass('label').translate(x_offset + params.label_padding_x, y_offset);
  let label_h = params.label_size + 2*params.label_padding_y;
  bg.size(g.width() + 2*params.label_padding_x, label_h).translate(0, label_h/2 - 2*params.label_padding_y);
}

function make_labels() {
  if (params.labels === 'none') return;
  
  let label_groups;
  if (params.label_groups_only) label_groups = groups;
  else label_groups = [ lvas ];
  
  for (let group of label_groups) {
    for ( let [i, lva] of group.entries() ) {
      if (i % params.label_every !== 0) continue;
      make_lva_label(lva);
    }
  }
}

// A grid of circles
function make_grid(cols, col_gap, row_gap, n, left = null, top = null) {
  cols = Math.floor(cols);
  let rows = Math.ceil(n / cols);
  
  const w = (cols-1) * col_gap; // grid witdh
  const h = (rows-1) * row_gap; // grid height
  
  if (left === null) left = (W - w) / 2 ;// center horizontally
  if (top === null) top = (H - h) / 2 ;// center vertically
  let x = left, y = top;
  
  let idx = 0;
  for (let j=0; j<rows; j++) {
    for (let i=0; i<cols; i++) {
      if ( idx == n ) break;
      lvas[idx]['_pos'] = [x, y]; // save grid coordinates with data
      draw.circle(params.dot_size).cx(x).cy(y).addClass('dot');
      // make_label(x, y, idx);
      x += col_gap;
      idx++;
    }
    x = left;
    y += row_gap;
  }
}

function make_circle(diameter, n, cx = null, cy = null) {
  if (cx === null) cx = W / 2 ;// center horizontally
  if (cy === null) cy = H / 2 ;// center vertically
  
  for ( let [i, lva] of lvas.entries() ) {
    let a = -Math.PI/2 + i * 2 * Math.PI / n; // angle
    let x = cx + diameter/2 * Math.cos(a);
    let y = cy + diameter/2 * Math.sin(a);
    lva['_pos'] = [x, y]; // save coordinates with data
    draw.circle(params.dot_size).cx(x).cy(y).addClass('dot');
  }
}

function make_spiral(diameter, windings, n, cx = null, cy = null) {
  if (cx === null) cx = W / 2 ;// center horizontally
  if (cy === null) cy = H / 2 ;// center vertically
  
  for ( let [i, lva] of lvas.entries() ) {
    let t = i / n;
    if (params.spiral_equidistant) t = Math.sqrt(t); // https://stackoverflow.com/a/44742854
    let a = -Math.PI/2 + 2 * Math.PI * windings * t; // angle
    let x = cx + diameter/2 * t * Math.cos(a);
    let y = cy + diameter/2 * t * Math.sin(a);
    lva['_pos'] = [x, y]; // save coordinates with data
    draw.circle(params.dot_size).cx(x).cy(y).addClass('dot');
  }
}

function make_groups() {
  let group_data = Object.values( data[params.group_by] );
  let group_count = Object.keys(group_data).length - 1;
  util.getController(gui.gui, null, 'group_offset').max(group_count);
  util.getController(gui.gui, null, 'group_count').max(group_count);
  let groups = [];
  for (let i=params.group_offset; i<params.group_offset+params.group_count; i++) {
    let lvas = group_data[i % group_data.length]['_lvas'];
    groups.push( lvas );
    let coords = lvas.map(lva => `${lva['_pos'][0]},${lva['_pos'][1]}` ).join(' ');
    if(params.show_connections) {
      draw.polygon(coords).addClass('group');
    }
  }
  let c = util.getController(gui.gui, null, 'group_name');
  let d = group_data[params.group_offset % group_data.length];
  c.setValue(d._name);
  return groups;
}

export function recreate() {
  draw.clear();
  style = draw.style();
  restyle();
  draw.attr({ 'font-family':"'GT America Mono',monospace,system-ui", 'font-weight':'normal' });
  set_size();
  
  // let rect = draw.rect( params.rect_width, params.rect_height );
  // rect.center( config.WIDTH/2, config.HEIGHT/2 );
  // rect.attr({ fill: 'dodgerblue' });
  
  lvas = data.lvas;
  lvas = data_loader['sort_' + params.sort](lvas);
  
  if(params.show_grid) {
    if (params.arrangement == 'grid') {
      make_grid(params.grid_cols, params.grid_h_space, params.grid_v_space, lvas.length);
    } else if (params.arrangement == 'circle'){
      make_circle(params.circle_diameter, lvas.length);
    } else {
      make_spiral(params.spiral_diameter, params.spiral_windings, lvas.length);
    }
  }
  
  document.getElementById("svg").style.backgroundColor = params.bg_color;
  
  groups = make_groups();
  make_labels();
}

export function restyle() {
  style.clear();
  style.rule('.dot', { 'fill': params.dot_color });
  style.rule('.label', { 'fill': params.label_color });
  style.rule('.label-bg', { 'fill': params.label_bgcolor, 'opacity': params.label_bgopacity });
  style.rule('.group', { 
    'stroke-linejoin': 'round',
    'stroke-width': params.stroke_width,
    'stroke': params.group_color,
    'fill': params.fill ? params.group_color : 'none',
    'opacity': params.opacity,
    'fill-rule': params.fill_rule,
  });
}

export function save() {
  util.saveSVG('#svg');
}


(async function main() {
  data = await data_loader.load();
  console.log(data);
  
  gui.create();
  
  recreate();

  keys.setup();
})();
