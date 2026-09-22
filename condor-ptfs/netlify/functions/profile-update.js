const { currentUser, json } = require("./_lib/auth");
const store = require("./_lib/store");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });
  const user = await currentUser(event);
  if (!user) return json(401, { error: "not_authenticated" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "invalid_json" });
  }

  const roblox = String(body.robloxUsername || "").trim().slice(0, 40);
  if (!roblox) return json(400, { error: "roblox_username_required" });

  user.robloxUsername = roblox;
  await store.saveUser(user);
  return json(200, { user });
};
