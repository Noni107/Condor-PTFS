// Real, shared persistence for all users - a Netlify Blobs JSON store.
// This is the direct replacement for the old `localStorage` state: every
// visitor now reads/writes the SAME data instead of their own private copy.
const { getStore } = require("@netlify/blobs");

function store() {
  return getStore({ name: "condor-ptfs", consistency: "strong" });
}

async function getJSON(key, fallback) {
  const val = await store().get(key, { type: "json" });
  return val == null ? fallback : val;
}
async function setJSON(key, value) {
  await store().setJSON(key, value);
}
async function del(key) {
  await store().delete(key);
}
async function listByPrefix(prefix) {
  const { blobs } = await store().list({ prefix });
  return blobs.map((b) => b.key);
}

// ---- Users ----
async function getUser(discordId) {
  return getJSON(`user:${discordId}`, null);
}
async function saveUser(user) {
  user.updatedAt = new Date().toISOString();
  await setJSON(`user:${user.discordId}`, user);
  return user;
}
async function listUsers() {
  const keys = await listByPrefix("user:");
  const users = await Promise.all(keys.map((k) => getJSON(k, null)));
  return users.filter(Boolean);
}

// ---- Flights ----
async function getFlight(id) {
  return getJSON(`flight:${id}`, null);
}
async function saveFlight(flight) {
  await setJSON(`flight:${flight.id}`, flight);
  return flight;
}
async function listFlights() {
  const keys = await listByPrefix("flight:");
  const flights = await Promise.all(keys.map((k) => getJSON(k, null)));
  return flights.filter(Boolean);
}

// ---- News ----
async function saveNews(item) {
  await setJSON(`news:${item.id}`, item);
  return item;
}
async function listNews() {
  const keys = await listByPrefix("news:");
  const items = await Promise.all(keys.map((k) => getJSON(k, null)));
  return items.filter(Boolean).sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ---- Config (ranks/aircraft/trainings/xp - admin-editable) ----
const DEFAULT_CONFIG = require("./config");
async function getConfig() {
  const cfg = await getJSON("config:main", null);
  if (!cfg) {
    await setJSON("config:main", DEFAULT_CONFIG);
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
  return cfg;
}
async function saveConfig(cfg) {
  await setJSON("config:main", cfg);
  return cfg;
}

module.exports = {
  getUser,
  saveUser,
  listUsers,
  getFlight,
  saveFlight,
  listFlights,
  saveNews,
  listNews,
  getConfig,
  saveConfig,
  del,
};
