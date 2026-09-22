const { currentUser, isAdmin, json } = require("./_lib/auth");
const store = require("./_lib/store");
const { reconcile } = require("./_lib/domain");

exports.handler = async (event) => {
  const user = await currentUser(event);
  if (!user) return json(401, { error: "not_authenticated" });
  const config = await store.getConfig();
  if (!isAdmin(user, config)) return json(403, { error: "admin_only" });

  if (event.httpMethod === "GET") {
    const status = (event.queryStringParameters || {}).status || "pending";
    const all = await store.listFlights();
    const filtered = all
      .filter((f) => f.status === status)
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
    return json(200, { flights: filtered });
  }

  if (event.httpMethod === "POST") {
    let b;
    try {
      b = JSON.parse(event.body || "{}");
    } catch (e) {
      return json(400, { error: "invalid_json" });
    }
    const flight = await store.getFlight(b.id);
    if (!flight) return json(404, { error: "flight_not_found" });
    if (flight.status !== "pending") return json(409, { error: "already_reviewed" });

    if (b.action === "accept") {
      flight.status = "accepted";
      flight.reviewedAt = new Date().toISOString();
      flight.reviewedBy = user.discordUsername;
      await store.saveFlight(flight);

      const pilot = await store.getUser(flight.pilotId);
      if (pilot) {
        pilot.completedFlights += 1;
        pilot.flightHours += config.hoursPerType[flight.type] || 0;
        pilot.xp += config.xpPerType[flight.type] || 0;
        const gained = reconcile(pilot, config);
        await store.saveUser(pilot);
        return json(200, { flight, pilot, achievementsGained: gained });
      }
      return json(200, { flight });
    }

    if (b.action === "reject") {
      flight.status = "rejected";
      flight.reason = String(b.reason || "Kein Grund angegeben").slice(0, 300);
      flight.reviewedAt = new Date().toISOString();
      flight.reviewedBy = user.discordUsername;
      await store.saveFlight(flight);
      return json(200, { flight });
    }

    return json(400, { error: "unknown_action" });
  }

  return json(405, { error: "method_not_allowed" });
};
