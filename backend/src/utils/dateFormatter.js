const PH_TIME_OFFSET = 8 * 60; // UTC+8 in minutes

function toPHTime(dateInput) {
  const date = new Date(dateInput);
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + PH_TIME_OFFSET * 60000);
}

function formatForMySQL(dateInput) {
  const phDate = toPHTime(dateInput);
  return phDate.toISOString().slice(0, 19).replace("T", " ");
}

function formatReadable(dateInput) {
  const phDate = toPHTime(dateInput);
  return phDate.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });
}

module.exports = { toPHTime, formatForMySQL, formatReadable };