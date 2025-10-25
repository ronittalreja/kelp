// src/csvParser.js
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

  // We'll assemble logical CSV rows because physical lines might be inside quoted fields
  let headers = null;
  const rows = [];

  let buffer = ''; // accumulate physical lines until we close all quotes for a logical row

  for await (const physicalLine of rl) {
    // append physical line with newline preserved — important for quoted field line breaks
    buffer += (buffer.length ? '\n' : '') + physicalLine;

    if (!isCompleteCsvLine(buffer)) {
      // still inside a quoted field — get next physical line
      continue;
    }

    // buffer is a complete logical CSV line
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

  // If buffer leftover (file ended mid-row) — try to parse if complete
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

// Check if a logical csv line is complete: count of unescaped quotes is even.
function isCompleteCsvLine(line) {
  // Count quotes that are not escaped: we treat "" as escaped quote inside a quoted field.
  // Simpler: count occurrences of " and ensure it's even.
  // But because escaped quotes are two double-quotes, counting raw quotes still works:
  const quoteCount = (line.match(/"/g) || []).length;
  return quoteCount % 2 === 0;
}

/**
 * Split CSV logical line into fields handling quotes and escaped quotes.
 * Returns array of raw strings (quotes removed, escaped quotes turned into ").
 */
function splitCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // If next char is also ", it's an escaped quote inside a quoted field.
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        cur += '"';
        i++; // skip next quote
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

// set nested property for dotted path, creating objects as needed
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

// basic parse: empty => null, numeric string => number, otherwise trimmed string
function parseValue(v) {
  if (v === undefined || v === null) return null;
  const t = v.trim();
  if (t === '') return null;

  // numeric?
  if (!Number.isNaN(Number(t)) && /^-?\d+(\.\d+)?$/.test(t)) {
    // return int for integer-like
    return t.indexOf('.') === -1 ? parseInt(t, 10) : parseFloat(t);
  }

  return t;
}

module.exports = { parseCSV };
