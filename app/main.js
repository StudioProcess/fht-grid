import { SVG } from '../node_modules/@svgdotjs/svg.js/dist/svg.esm.js';
import * as util from './util.js';
import * as keys from './keys.js';
import * as gui from './gui.js';
import * as data_loader from './data.js';
import './concaveman-dist.js';
import '../node_modules/seedrandom/seedrandom.js';

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
  dots: 'all',
  dot_size: 1.75,
  dot_color: '#000000',
  sort: 'lehrveranstaltung_id',
  labels: 'bezeichnung',
  label_color: '#000000',
  label_bgcolor: '#00b3ff',
  label_bgopacity: 1,
  label_offset_x: 1,
  label_offset_y: 0,
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
  show_connections: true,
  
  conn_sort: '_default',
  conn_rnd_seed: 0,
  conn_color: '#000000',
  conn_opacity: 0.8,
  conn_fill: false,
  conn_fill_rule: 'nonzero',
  conn_stroke_width: 0.75,
  
  show_hull: false,
  hull_concavity: 1,
  hull_lengthThresh: 200,
  hull_fill: false,
  hull_color: '#000000',
  hull_opacity: 0.8,
  hull_stroke_width: 0.75,
  
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
  if (params.labels === '_none') return;
  let text = '';
  if ( !params.labels.startsWith('_') ) {
    text = lva[params.labels];
    if (typeof(text) === 'boolean') { text = text.toString(); }
  } else if (params.labels === '_studium_name') {
    let a = lva;
    while (typeof a === 'object' && a !== null && '_modul' in a) a = a['_modul'];
    text = a['_studium']['_name'];
  } else if (params.labels === '_studium_id') {
    let a = lva;
    while (typeof a === 'object' && a !== null && '_modul' in a) a = a['_modul'];
    text = a['_studium']['_studiengang_kz'];
  } else if (params.labels === '_rooms') {
    text = lva._rooms.join(', ');
  } else if (params.labels === '_lehrende') {
    text = lva._lehrende.join('; ');
  }
  if (!text) return;
  
  let x = lva['_pos'][0];
  let y = lva['_pos'][1];
  let x_offset = params.dot_size/2 + params.label_offset_x;
  let y_offset = -params.label_size + params.label_offset_y;
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
      let dot = draw.circle(params.dot_size).cx(x).cy(y).addClass('dot');
      lvas[idx]['_dot_element'] = dot;
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
    let dot = draw.circle(params.dot_size).cx(x).cy(y).addClass('dot');
    lva['_dot_element'] = dot;
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
    let dot = draw.circle(params.dot_size).cx(x).cy(y).addClass('dot');
    lva['_dot_element'] = dot;
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
    
    if (params.conn_sort === '_random') {
      Math.seedrandom(params.conn_rnd_seed)
      lvas = util.shuffle(lvas);
    } else if (params.conn_sort !== '_default') {
      let sort_fn = data_loader.sort_lvas[params.conn_sort];
      lvas = sort_fn(lvas);
    }
    
    groups.push( lvas );
    let points = lvas.map(x => x._pos);
    
    if (params.show_connections) {
      draw.polygon(points).addClass('group');
    }
    
    if (params.show_hull) {
      let hull = concaveman(points, params.hull_concavity, params.hull_lengthThresh);
      draw.polygon(hull).addClass('hull');
    }
  }
  let c = util.getController(gui.gui, null, 'group_name');
  let d = group_data[params.group_offset % group_data.length];
  c.setValue(d._name);
  return groups;
}

function set_dots_visibility() {
  if (params.dots === 'all') { 
    return;
  } else if (params.dots === 'none') {
    for (let lva of lvas) { lva._dot_element.addClass('hidden') } // hide all
  } else if (params.dots === 'groups') {
    for (let lva of lvas) { lva._dot_element.addClass('hidden') } // hide all
    // un-hide groups
    for (let g of groups) {
      for (let lva of g) { lva._dot_element.removeClass('hidden') }
    }
  } else if (params.dots === 'non-groups') {
    // hide groups
    for (let g of groups) {
      for (let lva of g) { lva._dot_element.addClass('hidden') }
    }
  }
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
  lvas = data_loader.sort_lvas[params.sort](lvas);
  
  if (params.arrangement == 'grid') {
    make_grid(params.grid_cols, params.grid_h_space, params.grid_v_space, lvas.length);
  } else if (params.arrangement == 'circle'){
    make_circle(params.circle_diameter, lvas.length);
  } else {
    make_spiral(params.spiral_diameter, params.spiral_windings, lvas.length);
  }
  
  // document.getElementById("svg").style.backgroundColor = params.bg_color;
  document.getElementById('svg_style').innerText = `svg { background-color:${params.bg_color} !important;}`;
  
  groups = make_groups();
  set_dots_visibility();
  make_labels();
  
  window.data = data;
  window.lvas = lvas;
  window.groups = groups;
}

export function restyle() {
  style.clear();
  style.rule('.dot', { 'fill': params.dot_color });
  style.rule('.label', { 'fill': params.label_color });
  style.rule('.label-bg', { 'fill': params.label_bgcolor, 'opacity': params.label_bgopacity });
  style.rule('.group', { 
    'stroke-linejoin': 'round',
    'stroke-width': params.conn_stroke_width,
    'stroke': params.conn_color,
    'fill': params.conn_fill ? params.conn_color : 'none',
    'opacity': params.conn_opacity,
    'fill-rule': params.conn_fill_rule,
  });
  style.rule('.hull', {
    'stroke-linejoin': 'round',
    'stroke-width': params.hull_stroke_width,
    'stroke': params.hull_color,
    'fill': params.hull_fill ? params.hull_color : 'none',
    'opacity': params.hull_opacity,
  });
  style.rule('.hidden', {'display': 'none'});
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
