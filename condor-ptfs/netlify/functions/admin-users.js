const { currentUser, isAdmin, json } = require("./_lib/auth");
const store = require("./_lib/store");
const { reconcile } = require("./_lib/domain");

exports.handler = async (event) => {
  const staffUser = await currentUser(event);
  if (!staffUser) return json(401, { error: "not_authenticated" });
  const config = await store.getConfig();
  if (!isAdmin(staffUser, config)) return json(403, { error: "admin_only" });

  if (event.httpMethod === "GET") {
    const users = await store.listUsers();
    return json(200, { users, config });
  }

  if (event.httpMethod === "POST") {
    let b;
    try {
      b = JSON.parse(event.body || "{}");
    } catch (e) {
      return json(400, { error: "invalid_json" });
    }
    const target = await store.getUser(b.userId);
    if (!target) return json(404, { error: "user_not_found" });

    if (b.action === "setRank") {
      if (!config.ranks.find((r) => r.id === b.rankId)) return json(400, { error: "unknown_rank" });
      target.progressionRank = b.rankId;
      reconcile(target, config);
      await store.saveUser(target);
      return json(200, { user: target });
    }

    if (b.action === "ban") {
      target.banned = !!b.banned;
      await store.saveUser(target);
      return json(200, { user: target });
    }

    return json(400, { error: "unknown_action" });
  }

  return json(405, { error: "method_not_allowed" });
};
