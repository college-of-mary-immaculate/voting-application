
function generatePlaceholders(rows, columns = 3) {
  return rows.map(() => `(${Array(columns).fill("?").join(", ")})`).join(", ");
}

function flattenValues(rows) {
  return rows.flat();
}

module.exports = { generatePlaceholders, flattenValues };