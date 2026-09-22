const { currentUser, isAdmin, json } = require("./_lib/auth");
const store = require("./_lib/store");
const { effectiveRankId, nextProgressionRank, aircraftUnlocked } = require("./_lib/domain");

exports.handler = async (event) => {
  const user = await currentUser(event);
  if (!user) return json(401, { error: "not_authenticated" });

  const config = await store.getConfig();
  const nr = nextProgressionRank(user, config);

  return json(200, {
    user,
    effectiveRank: effectiveRankId(user, config),
    nextRank: nr,
    unlockedAircraft: config.aircraft.filter((a) => aircraftUnlocked(user, a, config)).map((a) => a.id),
    isAdmin: isAdmin(user, config),
    config,
  });
};
