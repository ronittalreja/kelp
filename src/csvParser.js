
const fs = require('fs');
const readline = require('readline');

/**
 * Parse a CSV file into an array of objects.
 * - Handles quoted fields with commas and escaped quotes ("")
 * - Supports nested keys (a.b.c)
 * - Streams file (memory efficient) but collects objects in an array to return
 *
 * @param {string} filePath
 * @returns {Promise<Array<Object>>}
 */
async function parseCSV(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers = null;
  const rows = [];

  let buffer = ''; 

  for await (const physicalLine of rl) {
   
    buffer += (buffer.length ? '\n' : '') + physicalLine;

    if (!isCompleteCsvLine(buffer)) {
      // still inside a quoted field — get next physical line
      continue;
    }

 
    if (!headers) {
      headers = splitCsvLine(buffer).map(h => h.trim());
    } else {
      const values = splitCsvLine(buffer);
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const val = i < values.length ? values[i] : '';
        setDeep(obj, header, parseValue(val));
      }
      rows.push(obj);
    }

    buffer = '';
  }

  if (buffer) {
    if (!headers) {
      headers = splitCsvLine(buffer).map(h => h.trim());
    } else if (isCompleteCsvLine(buffer)) {
      const values = splitCsvLine(buffer);
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const val = i < values.length ? values[i] : '';
        setDeep(obj, header, parseValue(val));
      }
      rows.push(obj);
    } else {
      throw new Error('CSV ended with unterminated quoted field.');
    }
  }

  return rows;
}

function isCompleteCsvLine(line) {
  
  const quoteCount = (line.match(/"/g) || []).length;
  return quoteCount % 2 === 0;
}


function splitCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        cur += '"';
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
      continue;
    }

    cur += ch;
  }
  result.push(cur);
  return result;
}


function setDeep(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] === undefined || cur[p] === null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}


function parseValue(v) {
  if (v === undefined || v === null) return null;
  const t = v.trim();
  if (t === '') return null;

  
  if (!Number.isNaN(Number(t)) && /^-?\d+(\.\d+)?$/.test(t)) {
    
    return t.indexOf('.') === -1 ? parseInt(t, 10) : parseFloat(t);
  }

  return t;
}

module.exports = { parseCSV };
