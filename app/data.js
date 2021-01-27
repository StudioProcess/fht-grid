const FILE_EVENTS = '../data/lvas/Alle LVs WS2019 SS2020 mit lehrveranstaltung_id.csv';
const FILE_LEHRENDE = '../data/lvas/Alle LVs WS2019 SS2020 mit Lehrenden.csv';

const FOLDER_STUDIEN = '../data/studien';
const STUDIEN = ['227_311', '228', '254_392', '255_4', '256_312', '257_364', '258_184', '297', '298_377', '299', '300_41', '301', '302_309', '303', '327_345', '328', '329_351', '330_320', '331', '332_292', '334', '335_352', '336_286', '476_347', '578', '585', '692', '768_80', '779_321', '804_179', '854'];

async function load_text(url) {
  let res = await fetch(url);
  return res.text();
}

async function load_json(url) {
  let res = await fetch(url);
  return res.json();
}

async function load_csv(url) {
  let text = await load_text(url);
  let lines = text.split(/\n|\r\n/); // split by newline
  lines = lines.map(line => {
    let items = line.split('","');
    items = items.map(item => {
      return item.trim().replace(/^"+|"+$/g, ''); // trim double quotes
    });
    return items;
  });
  // convert to object
  let keys = lines[0];
  lines = lines.slice(1);
  lines = lines.map(line => {
    return line.reduce( (obj, item, idx) => {
      obj[ keys[idx] ] = item;
      return obj;
    }, {});
  });
  return lines;
}

// raw data
export async function load_data() {
  let events = await load_csv(FILE_EVENTS);
  let events_lehrende = await load_csv(FILE_LEHRENDE);
  let studien_promises = STUDIEN.map(id => {
    return load_json(`${FOLDER_STUDIEN}/${id}.json`);
  });
  let studien = await Promise.all(studien_promises);
  return { events, events_lehrende, studien };
}

let stats = {};
let parent_modules = [];

// extract lvas from module
function reduce_module(acc_lvas, module) {
  module = Object.assign( {}, module );
  
  // track lehrtypen
  if (module.lehrtyp in stats.lehrtypen) stats.lehrtypen[module.lehrtyp] += 1;
  else stats.lehrtypen[module.lehrtyp] = 1;
  
  let lvas = module.childs; 
  delete module.childs;
  if (lvas) { // could be undefined (empty module)
    // add module property to lva
    lvas = lvas.map( lva => Object.assign(lva, {_modul:module}) );
    
    // track lehrtypen
    for (const lva of lvas) {
      if (lva.lehrtyp in stats.lehrtypen) stats.lehrtypen[lva.lehrtyp] += 1;
      else stats.lehrtypen[lva.lehrtyp] = 1;
    }
    
    // lva could be a nested module
    let nested_modules = lvas.filter(lva => lva.lehrtyp === 'modul');
    let nested_lvas = nested_modules.reduce(reduce_module, []);
    stats.nested_modules += nested_modules.length;
    stats.nested_lvas += nested_lvas.length;
    if (nested_modules.length > 0) {
      stats.parent_modules += 1;
      let parent = Object.assign( {}, module );
      parent['_children'] = nested_modules;
      parent_modules.push( parent );
    }
    
    lvas = lvas.filter(lva => lva.lehrtyp !== 'modul');
    acc_lvas = acc_lvas.concat( lvas, nested_lvas );
  } else {
    stats.empty_modules += 1;
  }
  return acc_lvas;
}

// extract modules from studium
function reduce_studium(acc_modules, studium) {
  studium = Object.assign( {}, studium.data, {_name: studium.name, _studiengang_kz: studium.studiengang_kz, _url: studium.url} );
  let semester = studium.lehrveranstaltungen; // {1: [modules of 1st semester], 2: [modules of 2nd semester], ...}
  delete studium.lehrveranstaltungen;
  
  semester = Object.entries(semester); // [ [1, modules of 1st sem], [2, modules of 2nd sem], ...]
  let modules = semester.flatMap( ([sem_nr, modules]) => {
    return modules.map(mod => Object.assign( {}, mod, {_sem_nr:sem_nr, _studium:studium} ));
  });
  acc_modules = acc_modules.concat( modules );
  return acc_modules;
}

export async function load() {
  let data = await load_data();
  
  stats = {
    lehrtypen: {},
    empty_modules: 0,
    nested_modules: 0,
    lvas_without_events: 0,
    parent_modules: 0,
    nested_lvas: 0,
    events_without_teacher: 0,
    lvas_without_teacher: 0,
  };
  
  // flatten dataset
  let modules = data.studien.reduce(reduce_studium, []);
  let lvas = modules.reduce(reduce_module, []);
  
  // calendar structure: {lehrveranstaltung_id: [event, ...], ...}
  let calendar = data.events.reduce( (cal, x) => {
    if (x.lehrveranstaltung_id in cal) cal[x.lehrveranstaltung_id].push(x);
    else if (x.lehrveranstaltung_id) cal[x.lehrveranstaltung_id] = [x];
    return cal;
  }, {});
  
  // add lehrende to calendar events
  for (let e of data.events_lehrende) {
    if (e.lehrveranstaltung_id in calendar) {
      let events = calendar[e.lehrveranstaltung_id];
      events = events.filter( x => x.datum == e.datum && x.stunde == e.stunde );
      events.map( x => Object.assign(x, {vorname: e.vorname, nachname: e.nachname}) );
    }
  }
  
  // add calendar (veranstaltungsorte) to lvas
  lvas = lvas.map(lva => {
    let cal = [];
    if (lva.lehrveranstaltung_id in calendar) cal = calendar[lva.lehrveranstaltung_id];
    if (cal.length == 0) stats.lvas_without_events += 1;
    return Object.assign(lva, {_calendar: cal});
  });
  
  // create studien grouping
  let studien = {};
  for (let lva of lvas.slice(0)) {
    let m = lva;
    while (typeof m === 'object' && m !== null && '_modul' in m) m = m['_modul']; // find module (can be nested)
    let id = m['_studium']['_studiengang_kz']; // studium id
    if ( !studien[id] ) studien[id] = m['_studium'];
    if ( !studien[id]['_lvas'] ) studien[id]['_lvas'] = [];
    studien[id]['_lvas'].push(lva);
  }
  
  // create rooms grouping
  let rooms = {};
  for (let lva of lvas.slice(0)) {
    for (let e of lva._calendar) {
      let room_id = e.ort_kurzbz;
      if ( !rooms[room_id] ) {
        rooms[room_id] = {
          '_lvas': {},
          '_events': [],
          '_name': e.ort_kurzbz,
        };
      }
      let _lvas = rooms[room_id]['_lvas'];
      _lvas[lva.lehrveranstaltung_id] = lva;
      rooms[room_id]['_events'].push(e);
    }
  }
  // _lvas as array (not object)
  for (let r of Object.values(rooms)) {
    r._lvas = Object.values(r._lvas);
  }
  
  // create lehrende grouping
  let lehrende = {};
  for (let lva of lvas.slice(0)) {
    let lva_has_teacher = false;
    for (let e of lva._calendar) {
      if (!e.nachname) {
        stats.events_without_teacher += 1;
        continue;
      }
      let teacher_id = e.nachname;
      lva_has_teacher = true;
      if (e.vorname) teacher_id += ', ' + e.vorname;
      if ( !lehrende[teacher_id] ) {
        lehrende[teacher_id] = {
          nachname: e.nachname,
          vorname: e.vorname,
          '_lvas': {},
          '_events': [],
          '_name': teacher_id,
        }
      }
      let _lvas = lehrende[teacher_id]['_lvas'];
      _lvas[lva.lehrveranstaltung_id] = lva;
      lehrende[teacher_id]['_events'].push(e);
    }
    if (!lva_has_teacher) stats.lvas_without_teacher += 1;
  }
  // _lvas as array (not object)
  for (let l of Object.values(lehrende)) {
    l._lvas = Object.values(l._lvas);
  }
  
  return {
    raw: data,
    lvas,
    studien,
    rooms,
    lehrende,
    stats
  };
}

function cmp(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function sort_lva_name(array) {
  array = Array.from(array); // copy
  return array.sort( (a, b) => cmp(
    a['bezeichnung'].trim(),
    b['bezeichnung'].trim()
  ));
}

export function sort_lva_id(array) {
  array = Array.from(array); // copy
  return array.sort( (a, b) => cmp(
    parseInt(a['lehrveranstaltung_id']),
    parseInt(b['lehrveranstaltung_id']), 
  ));
}

export function sort_studium_name(array) {
  array = Array.from(array); // copy
  function get_key(a) {
    while (typeof a === 'object' && a !== null && '_modul' in a) a = a['_modul'];
    a = a['_studium']['_name'];
    return a;
  }
  return array.sort( (a, b) => cmp( get_key(a), get_key(b) ));
}

export function sort_studium_id(array) {
  array = Array.from(array); // copy
  function get_key(a) {
    while (typeof a === 'object' && a !== null && '_modul' in a) a = a['_modul'];
    a = a['_studium']['_studiengang_kz'];
    return a;
  }
  return array.sort( (a, b) => cmp( get_key(a), get_key(b) ));
}

export function sort_x_y(array) {
  array = Array.from(array); // copy
  return array.sort((a, b) => {
    let c = cmp( a._pos[0], b._pos[0] );
    if (c !== 0) return c;
    return cmp( a._pos[1], b._pos[1] );
  });
}

export function sort_y_x(array) {
  array = Array.from(array); // copy
  return array.sort((a, b) => {
    let c = cmp( a._pos[1], b._pos[1] );
    if (c !== 0) return c;
    return cmp( a._pos[0], b._pos[0] );
  });
}
