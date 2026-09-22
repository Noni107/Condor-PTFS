const { currentUser, isAdmin, json } = require("./_lib/auth");
const store = require("./_lib/store");

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });
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
  const title = String(b.title || "").trim().slice(0, 120);
  const text = String(b.text || "").trim().slice(0, 2000);
  if (!title || !text) return json(400, { error: "missing_fields" });

  const item = {
    id: uid(),
    title,
    text,
    author: user.discordUsername,
    date: new Date().toISOString().slice(0, 10),
  };
  await store.saveNews(item);
  return json(200, { news: item });
};
