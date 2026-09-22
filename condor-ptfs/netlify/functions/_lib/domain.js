// All the rules that used to live in client-side JS (and were therefore fakeable
// via devtools/localStorage editing) now live here, on the server, as the only
// place that is allowed to change XP, ranks, and unlocks.

function rankIndex(config, id) {
  return config.ranks.findIndex((r) => r.id === id);
}
function rankById(config, id) {
  return config.ranks.find((r) => r.id === id);
}
function isStaffRankId(config, id) {
  const r = rankById(config, id);
  return !!(r && r.staffOnly);
}

// The rank actually shown/used: a synced Discord role beats auto-progression.
function effectiveRankId(user, config) {
  if (user.discordRank && rankById(config, user.discordRank)) return user.discordRank;
  return user.progressionRank;
}

function nextProgressionRank(user, config) {
  const idx = rankIndex(config, user.progressionRank);
  for (let i = idx + 1; i < config.ranks.length; i++) {
    if (!config.ranks[i].staffOnly) return config.ranks[i];
  }
  return null;
}

function checkRankUp(user, config) {
  let changed = false;
  config.ranks.forEach((r) => {
    if (r.staffOnly) return;
    const flightsOk = user.completedFlights >= (r.minFlights || 0);
    const trainOk = !r.training || user.trainings[r.training] === "completed";
    if (flightsOk && trainOk && rankIndex(config, r.id) > rankIndex(config, user.progressionRank)) {
      user.progressionRank = r.id;
      changed = true;
    }
  });
  return changed;
}

function trainingAvailable(user, training, config) {
  return rankIndex(config, effectiveRankId(user, config)) >= rankIndex(config, training.reqRank);
}

function refreshTrainingLocks(user, config) {
  config.trainings.forEach((t) => {
    if (user.trainings[t.id] === "completed") return;
    user.trainings[t.id] = trainingAvailable(user, t, config) ? "available" : "locked";
  });
}

function aircraftUnlocked(user, aircraft, config) {
  const eff = effectiveRankId(user, config);
  const rankOk = rankIndex(config, eff) >= rankIndex(config, aircraft.reqRank) || isStaffRankId(config, eff);
  const trainOk = !aircraft.reqTraining || user.trainings[aircraft.reqTraining] === "completed";
  return rankOk && trainOk;
}

const ACHIEVEMENTS = [
  { id: "first", name: "First Flight", desc: "Absolviere deinen ersten Flug.", check: (u) => u.completedFlights >= 1 },
  { id: "ten", name: "10 Flights", desc: "Absolviere 10 Flüge.", check: (u) => u.completedFlights >= 10 },
  { id: "fifty", name: "50 Flights", desc: "Absolviere 50 Flüge.", check: (u) => u.completedFlights >= 50 },
  { id: "a330q", name: "A330 Qualified", desc: "Schließe das A330 Training ab.", check: (u) => u.trainings.a330 === "completed" },
  { id: "captain", name: "Captain", desc: "Erreiche den Captain-Rang.", check: (u, c) => rankIndex(c, effectiveRankId(u, c)) >= rankIndex(c, "capt") }
];

function checkAchievements(user, config) {
  const gained = [];
  ACHIEVEMENTS.forEach((a) => {
    if (user.achievements.indexOf(a.id) === -1 && a.check(user, config)) {
      user.achievements.push(a.id);
      gained.push(a.name);
    }
  });
  return gained;
}

// Re-derive a Discord role-id list into an internal rank override, using the
// admin-configured discordRoleMap. Highest-priority matching rank wins.
function discordRankFromRoles(roleIds, config) {
  let best = null;
  (roleIds || []).forEach((rid) => {
    const mapped = config.discordRoleMap[rid];
    if (mapped && rankById(config, mapped)) {
      if (!best || rankIndex(config, mapped) > rankIndex(config, best)) best = mapped;
    }
  });
  return best;
}

// Applies rank-up, training-lock refresh and achievement checks together,
// the way "something changed" (a flight got accepted, a training completed,
// roles got synced) should always be followed up.
function reconcile(user, config) {
  checkRankUp(user, config);
  refreshTrainingLocks(user, config);
  return checkAchievements(user, config);
}

module.exports = {
  rankIndex,
  rankById,
  isStaffRankId,
  effectiveRankId,
  nextProgressionRank,
  checkRankUp,
  trainingAvailable,
  refreshTrainingLocks,
  aircraftUnlocked,
  ACHIEVEMENTS,
  checkAchievements,
  discordRankFromRoles,
  reconcile,
};
