const FILE_LVAS = '../data/lvas/Alle LVs WS2019 SS2020 mit lehrveranstaltung_id.csv';

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


export async function load() {
  let lvas = await load_csv(FILE_LVAS);
  let studien_promises = STUDIEN.map(id => {
    return load_json(`${FOLDER_STUDIEN}/${id}.json`);
  });
  let studien = await Promise.all(studien_promises);
  return { lvas, studien };
}
