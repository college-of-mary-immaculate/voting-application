// utils/dateFormatter.js  ← overwrite or refactor

const PH_TZ = 'Asia/Manila';

// Format any date-like input → MySQL DATETIME string (wall time in PH)
// utils/dateFormatter.js
function formatForMySQL(input) {
  let localDt;

  if (typeof input === 'string') {
    // Frontend sends e.g. "2026-03-19T22:00" or "2026-03-19 22:00:00"
    const isoLike = input.includes('T') ? input : input.replace(' ', 'T');
    // Parse as local Manila time (append offset or use named zone if using luxon)
    localDt = new Date(isoLike + ' GMT+0800');  // force Manila offset
  } else if (input instanceof Date) {
    localDt = input;
  } else {
    throw new Error("Invalid date input");
  }

  if (isNaN(localDt.getTime())) {
    throw new Error("Invalid date format: " + input);
  }

  // Return MySQL-friendly string (wall-clock time in Manila)
  const pad = (n) => String(n).padStart(2, '0');
  return `${localDt.getFullYear()}-${pad(localDt.getMonth() + 1)}-${pad(localDt.getDate())} ` +
         `${pad(localDt.getHours())}:${pad(localDt.getMinutes())}:${pad(localDt.getSeconds())}`;
}

// Optional: only if you really need server time in PH
function getServerTimePH() {
  return new Date().toLocaleString('en-CA', {
    timeZone: PH_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$1-$2').replace(',', '');
}

module.exports = { formatForMySQL, getServerTimePH };