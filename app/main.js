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
  format: 'single_page',
  grid_cols: 38,
  h_space: 14.5,
  v_space: 14.5,
  dot_size: 1,
  sort: 'lva_id',
  labels: 'lva_id',
  label_every: 10,
  label_size: 6,
  group_offset: 0,
  group_count: 1,
  color: '#1E90FF',
  opacity: 0.4,
  fill: false,
  stroke_width: 1,
  save_svg: save,
};

export let W, H; // [pt]
export let data, lvas;
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

function make_label(x, y, i) {
  if (params.labels === 'none') return;
  if (i % (params.label_every) !== 0) return;
  let text = '';
  let lva = lvas[i];
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
  x = x + params.dot_size;
  y = y;
  draw.text(text).x(x).y(y).font({'family': 'system-ui', 'size': params.label_size});
}

// A grid of circles
function make_grid(cols, col_gap, row_gap, n, left = null, top = null) {
  cols = Math.floor(cols);
  let rows = Math.ceil(n / cols);
  
  const w = (cols-1) * col_gap; // grid witdh
  const h = (rows-1) * row_gap; // grid height
  
  if (left === null) left = (W - w) / 2 ;// center horizontally
  if (top === null) top = (H - h) / 2 ;// center horizontally
  let x = left, y = top;
  
  let idx = 0;
  for (let j=0; j<rows; j++) {
    for (let i=0; i<cols; i++) {
      if ( idx == n ) break;
      lvas[idx]['_pos'] = [x, y]; // save grid coordinates with data
      draw.circle(params.dot_size).cx(x).cy(y);
      make_label(x, y, idx);
      x += col_gap;
      idx++;
    }
    x = left;
    y += row_gap;
  }
}

function make_groups() {
  let studien = Object.values(data.studien);
  for (let i=params.group_offset; i<params.group_offset+params.group_count; i++) {
    let lvas = studien[i % studien.length]['_lvas'];
    let coords = lvas.map(lva => `${lva['_pos'][0]},${lva['_pos'][1]}` ).join(' ');
    draw.polygon(coords)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', params.stroke_width)
      .attr('stroke', params.color)
      .attr('fill', params.fill ? params.color : 'none')
      .attr('opacity', params.opacity);
  }
}

export function recreate() {
  draw.clear();
  set_size();
  
  // let rect = draw.rect( params.rect_width, params.rect_height );
  // rect.center( config.WIDTH/2, config.HEIGHT/2 );
  // rect.attr({ fill: 'dodgerblue' });
  
  lvas = data.lvas;
  lvas = data_loader['sort_' + params.sort](lvas);
  // console.log(lvas);
  make_grid(params.grid_cols, params.h_space, params.v_space, lvas.length);
  make_groups();
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
