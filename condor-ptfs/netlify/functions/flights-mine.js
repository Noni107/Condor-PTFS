const { currentUser, json } = require("./_lib/auth");
const store = require("./_lib/store");

exports.handler = async (event) => {
  const user = await currentUser(event);
  if (!user) return json(401, { error: "not_authenticated" });

  const all = await store.listFlights();
  const mine = all
    .filter((f) => f.pilotId === user.discordId)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  return json(200, { flights: mine });
};
