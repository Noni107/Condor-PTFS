const { currentUser, json } = require("./_lib/auth");
const store = require("./_lib/store");
const { fetchGuildMemberRoles } = require("./_lib/discord");
const { discordRankFromRoles, reconcile } = require("./_lib/domain");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });
  const user = await currentUser(event);
  if (!user) return json(401, { error: "not_authenticated" });

  const roles = await fetchGuildMemberRoles(user.discordId);
  const config = await store.getConfig();
  user.discordRoles = roles;
  user.discordRank = discordRankFromRoles(roles, config);
  const gained = reconcile(user, config);
  await store.saveUser(user);

  return json(200, { user, achievementsGained: gained });
};
