export function timestamp() {
  let ts = new Date().toISOString(); // 2020-11-04T10:20:50.276Z
  ts = ts.replace('T', '_');
  ts = ts.replaceAll(/[:.]/g, '-');
  ts = ts.replace('Z', ''); // 2020-11-04_10-20-50-276
  return ts;
}


export function toggleFullscreen() {
  if (document.webkitFullscreenEnabled) { // Chrome, Opera, Safari
    if (!document.webkitFullscreenElement) {
      document.querySelector('body').webkitRequestFullscreen();
    } else { document.webkitExitFullscreen(); }
  } else if (document.mozFullScreenEnabled) { // Firefox
    if (!document.mozFullScreenElement) {
      document.querySelector('body').mozRequestFullScreen();
    } else { document.mozCancelFullScreen(); }
  } else if (document.fullscreenEnabled) { // Standard, Edge
    if (!document.fullscreenElement) {
      document.querySelector('body').requestFullscreen();
    } else { document.exitFullscreen(); }
  }
}


// NOTE: Needs THREE.WebGLRenderer with preserveDrawingBuffer=true
// TODO: Firefox seems to save only the bottom left quadrant of the canvas. This also happens with 'Right-Click/Save Image as...'
export function saveCanvas() {
  let canvas = document.querySelector('canvas');
  let link = document.createElement('a');
  link.download = timestamp() + '.png';
  link.href = canvas.toDataURL();
  link.style.display = 'none';     // Firefox
  document.body.appendChild(link); // Firefox
  link.click();
  document.body.removeChild(link); // Firefox
}

export function saveText(str, filename = '', ext = '.txt', mime = 'text/plain') {
  let link = document.createElement('a');
  if (!filename) filename = timestamp() + ext;
  link.download = filename;
  link.href = URL.createObjectURL(new Blob([str], {type: mime}));
  link.style.display = 'none';     // Firefox
  document.body.appendChild(link); // Firefox
  link.click();
  document.body.removeChild(link); // Firefox
  return filename;
}

export function saveJSON(obj, filename = '') {
  return saveText( JSON.stringify(obj), filename, '.json', 'application/json' );
}

export function saveSVG(selector, filename = '') {
  let text = document.querySelector(selector).outerHTML;
  return saveText( text, filename, '.svg', 'image/svg+xml' );
}


export function saveSettings(obj, filename = '') {
  return saveJSON( obj, filename );
}

export async function loadSettings(url, target = {}) {
  const response = await fetch(url);
  let obj = {};
  try {
    obj = await response.json();
  } catch (e) {
    console.error(`Error parsing settings file ${url}`, e);
  }
  return Object.assign( target, obj );
}


export function mm2pt(mm) {
  return mm / 25.4 * 72;
}


export function getController(dg, obj, name) {
  for (let c of dg.__controllers) {
    if (obj && c.object === obj && c.property === name) return c;
    if (!obj && c.property === name) return c;
  }
  return undefined;
}

export function lockController(dg, obj, name) {
  let c = getController(dg, obj, name);
  if (!c) return;
  console.log(c);
  let e = c.domElement.querySelector('input');
  if (!e) return;
  e.setAttribute('disabled', 'disabled');
}