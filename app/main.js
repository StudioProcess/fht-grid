import { SVG } from '../node_modules/@svgdotjs/svg.js/dist/svg.esm.js';
import * as util from './util.js';
import * as keys from './keys.js';
import * as gui from './gui.js';
import * as data_loader from './data.js';

export const config = {
  WIDTH:  1000,
  HEIGHT: 1000,
};

export const params = {
  format: 'single',
  grid_cols: 38,
  dot_size: 4,
  save_svg: save,
};

export let data;

export const draw = SVG('#svg');

function make_grid(left, top, cols, col_gap, row_gap, n) {
  let x = left, y = top;
  cols = Math.floor(cols);
  let rows = Math.ceil(n / cols);
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
  draw.size( config.WIDTH, config.HEIGHT );
  
  // let rect = draw.rect( params.rect_width, params.rect_height );
  // rect.center( config.WIDTH/2, config.HEIGHT/2 );
  // rect.attr({ fill: 'dodgerblue' });
  
  make_grid(0, 0, params.grid_cols, 10, 10, 1408);
  
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
