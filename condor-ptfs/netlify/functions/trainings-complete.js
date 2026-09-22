const { currentUser, isAdmin, json } = require("./_lib/auth");
const store = require("./_lib/store");
const { trainingAvailable, reconcile } = require("./_lib/domain");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });
  const staffUser = await currentUser(event);
  if (!staffUser) return json(401, { error: "not_authenticated" });
  const config = await store.getConfig();
  if (!isAdmin(staffUser, config)) return json(403, { error: "admin_only" });

  let b;
  try {
    b = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "invalid_json" });
  }

  const pilot = await store.getUser(b.userId);
  if (!pilot) return json(404, { error: "user_not_found" });
  const training = config.trainings.find((t) => t.id === b.trainingId);
  if (!training) return json(404, { error: "training_not_found" });
  if (pilot.trainings[training.id] === "completed") return json(409, { error: "already_completed" });
  if (!trainingAvailable(pilot, training, config)) return json(409, { error: "training_locked" });

  pilot.trainings[training.id] = "completed";
  pilot.xp += training.xp || 0;
  const gained = reconcile(pilot, config);
  await store.saveUser(pilot);

  return json(200, { user: pilot, achievementsGained: gained });
};
