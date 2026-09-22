const { currentUser, json } = require("./_lib/auth");
const store = require("./_lib/store");

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });
  const user = await currentUser(event);
  if (!user) return json(401, { error: "not_authenticated" });

  let b;
  try {
    b = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "invalid_json" });
  }

  const type = ["short", "medium", "long"].includes(b.type) ? b.type : "short";
  const flight = {
    id: uid(),
    pilotId: user.discordId,
    pilotName: user.discordUsername,
    callsign: String(b.callsign || "").slice(0, 20),
    aircraft: String(b.aircraft || "").slice(0, 30),
    rules: String(b.rules || "").slice(0, 10),
    dep: String(b.dep || "").slice(0, 10),
    arr: String(b.arr || "").slice(0, 10),
    route: String(b.route || "").slice(0, 200),
    fl: String(b.fl || "").slice(0, 10),
    type,
    status: "pending",
    reason: null,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
  };
  if (!flight.callsign || !flight.aircraft || !flight.dep || !flight.arr) {
    return json(400, { error: "missing_fields" });
  }

  await store.saveFlight(flight);
  return json(200, { flight });
};
