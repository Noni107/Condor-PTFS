const { currentUser, isAdmin, json } = require("./_lib/auth");
const store = require("./_lib/store");

const ALLOWED_KEYS = ["ranks", "aircraft", "trainings", "xpPerType", "hoursPerType", "discordRoleMap"];

exports.handler = async (event) => {
  if (event.httpMethod !== "PUT" && event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });
  const user = await currentUser(event);
  if (!user) return json(401, { error: "not_authenticated" });
  const config = await store.getConfig();
  if (!isAdmin(user, config)) return json(403, { error: "admin_only" });

  let b;
  try {
    b = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "invalid_json" });
  }

  ALLOWED_KEYS.forEach((key) => {
    if (b[key] !== undefined) config[key] = b[key];
  });

  await store.saveConfig(config);
  return json(200, { config });
};
