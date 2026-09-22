const { currentUser, isAdmin, json } = require("./_lib/auth");
const store = require("./_lib/store");
const { effectiveRankId, rankIndex } = require("./_lib/domain");

exports.handler = async (event) => {
  const user = await currentUser(event);
  if (!user) return json(401, { error: "not_authenticated" });

  const config = await store.getConfig();
  const users = await store.listUsers();
  const admin = isAdmin(user, config);

  const list = users
    .map((u) => ({
      discordId: u.discordId,
      username: u.discordUsername,
      avatar: u.avatar,
      robloxUsername: u.robloxUsername,
      rank: effectiveRankId(u, config),
      completedFlights: u.completedFlights,
      // Only staff/admins can see who else is staff, so a regular pilot
      // doesn't get a client-side signal of who to social-engineer.
      banned: admin ? !!u.banned : undefined,
    }))
    .sort((a, b) => rankIndex(config, b.rank) - rankIndex(config, a.rank) || b.completedFlights - a.completedFlights);

  return json(200, { members: list, config });
};
