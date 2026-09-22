const { readSession } = require("./session");
const store = require("./store");
const { isStaffRankId, effectiveRankId } = require("./domain");

function superAdminIds() {
  return (process.env.SUPER_ADMIN_DISCORD_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Loads the logged-in user for this request, or null. Never trusts anything
// the client sends about who it is - only the signed session cookie.
async function currentUser(event) {
  const session = readSession(event);
  if (!session || !session.discordId) return null;
  const user = await store.getUser(session.discordId);
  if (!user || user.banned) return null;
  return user;
}

function isAdmin(user, config) {
  if (!user) return false;
  if (superAdminIds().indexOf(user.discordId) !== -1) return true;
  return isStaffRankId(config, effectiveRankId(user, config));
}

function json(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: Object.assign({ "Content-Type": "application/json" }, extraHeaders || {}),
    body: JSON.stringify(body),
  };
}

module.exports = { currentUser, isAdmin, superAdminIds, json };
