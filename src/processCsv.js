const { parseCSV } = require('./csvParser');
const { insertUser, fetchAllAges } = require('../db/db');



function prepareRecord(obj) {
  
  const first = (obj.name && obj.name.firstName) ? obj.name.firstName : '';
  const last = (obj.name && obj.name.lastName) ? obj.name.lastName : '';
  const name = `${String(first).trim()} ${String(last).trim()}`.trim();

  const age = obj.age !== undefined && obj.age !== null ? Number(obj.age) : null;


  const address = obj.address ? obj.address : null;

  
  const additional = deepClone(obj);
  
  if (additional.name) delete additional.name;
  if (additional.age) delete additional.age;
  if (additional.address) delete additional.address;

  return {
    name: name || null,
    age: age,
    address: address,
    additional_info: additional && Object.keys(additional).length ? additional : null,
  };
}

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

async function processAndSave(filePath) {
  console.log('Starting CSV parsing...');
  const rows = await parseCSV(filePath);
  console.log(`Parsed ${rows.length} rows from CSV`);

  
  const BATCH_SIZE = 500; 
  let insertedCount = 0;
  
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async row => {
      const rec = prepareRecord(row);
      if (!rec.age || !rec.name) {
        
        
        if (rec.age === null || !rec.name) {
          console.warn('Skipping record due to missing mandatory fields:', row);
          return null;
        }
      }
      return insertUser(rec);
    });
    
    const results = await Promise.all(promises);
    insertedCount += results.filter(r => r !== null).length;
    console.log(`Inserted ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length} records`);
  }

  console.log(`Total records inserted: ${insertedCount}`);

  const ages = await fetchAllAges();
  const dist = computeAgeDistribution(ages);
  return dist;
}

function computeAgeDistribution(ages) {
  const counts = { '<20': 0, '20-40': 0, '40-60': 0, '>60': 0 };
  ages.forEach(age => {
    if (age === null || age === undefined || Number.isNaN(age)) return;
    const a = Number(age);
    if (a < 20) counts['<20']++;
    else if (a <= 40) counts['20-40']++;
    else if (a <= 60) counts['40-60']++;
    else counts['>60']++;
  });
  const total = ages.length || 1;
  const percent = {};
  for (const k of Object.keys(counts)) {
    percent[k] = ((counts[k] / total) * 100).toFixed(2);
  }
  return percent;
}

module.exports = { processAndSave, computeAgeDistribution };
