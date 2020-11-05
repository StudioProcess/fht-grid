const FILE_EVENTS = '../data/lvas/Alle LVs WS2019 SS2020 mit lehrveranstaltung_id.csv';

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
  let lines = text.split(/\n|\r\n/);
  lines = lines.map(line => {
    let items = line.split(',');
    items = items.map(item => {
      return item.trim().replace(/^"+|"+$/g, '');
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
  let studien_promises = STUDIEN.map(id => {
    return load_json(`${FOLDER_STUDIEN}/${id}.json`);
  });
  let studien = await Promise.all(studien_promises);
  return { events, studien };
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
  
  // add calendar (veranstaltungsorte) to lvas
  lvas = lvas.map(lva => {
    let cal = [];
    if (lva.lehrveranstaltung_id in calendar) cal = calendar[lva.lehrveranstaltung_id];
    if (cal.length == 0) stats.lvas_without_events += 1;
    return Object.assign(lva, {_calendar: cal});
  });
  
  console.log(parent_modules);
  
  return {
    raw: data,
    lvas,
    stats
  };
}
