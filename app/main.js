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
  dot_size: 1.75,
  sort: 'lva_id',
  labels: 'lva_name',
  label_color: '#000000',
  label_groups_only: true,
  label_every: 1,
  label_size: 6,
  group_offset: 0,
  group_count: 1,
  color: '#000000',
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
  let x = lva['_pos'][0] + params.dot_size;
  let y = lva['_pos'][1];
  draw.text(text).x(x).y(y).font({'size': params.label_size});
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
      draw.circle(params.dot_size).cx(x).cy(y);
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
    draw.circle(params.dot_size).cx(x).cy(y);
  }
}

function make_groups() {
  let studien = Object.values(data.studien);
  let groups = [];
  for (let i=params.group_offset; i<params.group_offset+params.group_count; i++) {
    let lvas = studien[i % studien.length]['_lvas'];
    groups.push( lvas );
    let coords = lvas.map(lva => `${lva['_pos'][0]},${lva['_pos'][1]}` ).join(' ');
    if(params.show_connections) {
      draw.polygon(coords)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', params.stroke_width)
        .attr('stroke', params.color)
        .attr('fill', params.fill ? params.color : 'none')
        .attr('opacity', params.opacity)
        .attr('fill-rule', params.fill_rule);
      }
  }
  return groups;
}

export function recreate() {
  draw.clear();
  draw.attr({ 'font-family':"'GT America Mono',monospace,system-ui", 'font-weight':'normal'});
  draw.attr('fill', params.label_color)
  set_size();
  
  // let rect = draw.rect( params.rect_width, params.rect_height );
  // rect.center( config.WIDTH/2, config.HEIGHT/2 );
  // rect.attr({ fill: 'dodgerblue' });
  
  lvas = data.lvas;
  lvas = data_loader['sort_' + params.sort](lvas);
  
  if(params.show_grid) {
    if (params.arrangement == 'grid') {
      make_grid(params.grid_cols, params.grid_h_space, params.grid_v_space, lvas.length);
    } else {
      make_circle(params.circle_diameter, lvas.length);
    }
  }
  
  document.getElementById("svg").style.backgroundColor = params.bg_color;
  
  groups = make_groups();
  make_labels();
}

export function save() {
  util.saveSVG('#svg');
}


(async function main() {
  data = await data_loader.load();
  console.log(data);
  
  recreate();

  gui.create();

  keys.setup();
})();
