import { SVG } from '../node_modules/@svgdotjs/svg.js/dist/svg.esm.js';
import * as util from './util.js';
import * as keys from './keys.js';
import * as gui from './gui.js';
import * as data_loader from './data.js';

export const config = {
  WIDTH: 300,
  HEIGHT: 300,
};

export const params = {
  rect_width: 100,
  rect_height: 100,
  save_svg: save,
};

export let data;

export const draw = SVG('#svg');

export function recreate() {
  draw.clear();
  draw.size( config.WIDTH, config.HEIGHT );
  
  let rect = draw.rect( params.rect_width, params.rect_height );
  rect.center( config.WIDTH/2, config.HEIGHT/2 );
  rect.attr({ fill: 'dodgerblue' });
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
