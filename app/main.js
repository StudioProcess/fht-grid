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
  dot_size: 4,
  sort: 'lva_id',
  save_svg: save,
};

export let W, H; // [pt]
export let data;
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

// A grid of circles
function make_grid(cols, col_gap, row_gap, n, left = null, top = null) {
  cols = Math.floor(cols);
  let rows = Math.ceil(n / cols);
  
  const w = (cols-1) * col_gap; // grid witdh
  const h = (rows-1) * row_gap; // grid height
  
  if (left === null) left = (W - w) / 2 ;// center horizontally
  if (top === null) top = (H - h) / 2 ;// center horizontally
  let x = left, y = top;
  
  for (let j=0; j<rows; j++) {
    for (let i=0; i<cols; i++) {
      if ( j*cols + i == n ) break;
      draw.circle(params.dot_size).cx(x).cy(y);
      x += col_gap;
    }
    x = left;
    y += row_gap;
  }
}

export function recreate() {
  draw.clear();
  set_size();
  
  // let rect = draw.rect( params.rect_width, params.rect_height );
  // rect.center( config.WIDTH/2, config.HEIGHT/2 );
  // rect.attr({ fill: 'dodgerblue' });
  
  let lvas = data.lvas;
  lvas = data_loader['sort_' + params.sort](lvas);
  console.log(lvas);
  make_grid(params.grid_cols, params.h_space, params.v_space, lvas.length);
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
