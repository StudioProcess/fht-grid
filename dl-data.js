const studien = {
  'Bachelor Biomedical Engineering':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=227&studienordnung_id=311',
  
  'Bachelor Urbane Erneuerbare Energietechnologien':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=476&studienordnung_id=347',
  
  'Bachelor Elektronik':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=254&studienordnung_id=392',
  
  'Bachelor Elektronik/Wirtschaft':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=255&studienordnung_id=4',
  
  'Bachelor Human Factors and Sports Engineering':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=327&studienordnung_id=345',
  
  'Bachelor Informations- und Kommunikationstechnologien':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=258&studienordnung_id=184',
  
  'Bachelor Informatik':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=257&studienordnung_id=364',
  
  'Bachelor Internationales Wirtschaftsingenieurwesen':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=335&studienordnung_id=352',
  
  'Bachelor Maschinenbau':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=779&studienordnung_id=321',
  
  'Bachelor Mechatronik/Robotik':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=330&studienordnung_id=320',
  
  'Bachelor Smart Homes und Assistive Technologien':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=768&studienordnung_id=80',
  
  'Bachelor Wirtschaftsinformatik':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=256&studienordnung_id=312',
  
  'Master IT-Security':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=303',
  
  'Master Data Science':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=854',
  
  'Master Erneuerbare Urbane Energiesysteme': 
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=578',
  
  'Master Embedded Systems':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=297',
  
  'Master Gesundheits- und Rehabilitationstechnik':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=329&studienordnung_id=351',
  
  'Master Game Engineering':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=585',
  
  'Master Internationales Wirtschaftsingenieurwesen':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=336&studienordnung_id=286',
  
  'Master Leistungselektronik':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=300&studienordnung_id=41',
  
  'Master Maschinenbau':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=804&studienordnung_id=179',
  
  'Master Medical Engineering & eHealth':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=228',
  
  'Master Mechatronik/Robotik':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=331',
  
  'Master Integrative Stadtentwicklung - Smart City':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=334',
  
  'Master Software Engineering':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=299',
  
  'Master Sports Technology':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=328',
  
  'Master Tissue Engineering':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=692',
  
  'Master Telekommunikation und Internettechnologien':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=298&studienordnung_id=377',
  
  'Master Innovations- und Technologiemanagement':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=301',
  
  'Master Umweltmanagement und Ökotoxikologie': 'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=332&studienordnung_id=292',
  
  'Master Wirtschaftsinformatik':
  'https://cis.technikum-wien.at/addons/lvinfo/export/export.php?studiengang_kz=302&studienordnung_id=309'
};

const FOLDER = 'data/studien';

const fetch = require('node-fetch');
const fs = require('fs');

(async function() {
  for ( let [name, url] of Object.entries(studien) ) {
    let url_obj = new URL(url);
    let studiengang_kz = url_obj.searchParams.get('studiengang_kz');
    let studienordnung_id = url_obj.searchParams.get('studienordnung_id');
    let data = { name, url, studiengang_kz, studienordnung_id };
    console.log('downloading:');
    console.log(data);
    
    let res = await fetch(url);
    let obj = await res.json();
    data['data'] = obj
    filename = studienordnung_id ? `${FOLDER}/${studiengang_kz}_${studienordnung_id}.json` : `${FOLDER}/${studiengang_kz}.json`;
    fs.writeFile(filename, JSON.stringify(data, null, 2), function(err) {
      if (err) {
        console.err(err)
      } else {
        console.log(`written: ${filename}\n`);
      }
    });
    // break;
  }
})();