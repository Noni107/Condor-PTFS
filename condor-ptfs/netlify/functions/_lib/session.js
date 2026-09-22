const jwt = require("jsonwebtoken");

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
}

function sign(payload) {
  return jwt.sign(payload, secret(), { expiresIn: "7d" });
}
function verify(token) {
  try {
    return jwt.verify(token, secret());
  } catch (e) {
    return null;
  }
}

function parseCookies(header) {
  const out = {};
  (header || "").split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

function sessionCookie(token) {
  return `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}`;
}
function clearSessionCookie() {
  return `session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
function shortStateCookie(name, value) {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;
}

// Reads the session cookie from a Netlify Functions event and returns the
// decoded payload ({ discordId }) or null if missing/invalid.
function readSession(event) {
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);
  if (!cookies.session) return null;
  return verify(cookies.session);
}

module.exports = {
  sign,
  verify,
  parseCookies,
  sessionCookie,
  clearSessionCookie,
  shortStateCookie,
  readSession,
};
