// Server-side source of truth (was hardcoded client-side before - now it lives
// in the database and can be changed from the admin panel without touching code).
module.exports = {
  ranks: [
    { id: "trainee", name: "Trainee", minFlights: 0, training: null, note: "Start-Rang", staffOnly: false },
    { id: "fo", name: "First Officer", minFlights: 5, training: null, note: "5 absolvierte Flüge", staffOnly: false },
    { id: "sfo", name: "Senior First Officer", minFlights: 20, training: "ifr", note: "20 Flüge + IFR Training", staffOnly: false },
    { id: "capt", name: "Captain", minFlights: 50, training: "captain", note: "50 Flüge + Captain Training", staffOnly: false },
    { id: "scapt", name: "Senior Captain", minFlights: 100, training: null, note: "100 absolvierte Flüge", staffOnly: false },
    { id: "instr", name: "Instructor", minFlights: null, training: null, note: "Wird von der Airline-Leitung per Discord-Rolle ernannt", staffOnly: true },
    { id: "staff", name: "Staff", minFlights: null, training: null, note: "Teammitglied von Condor PTFS", staffOnly: true }
  ],
  aircraft: [
    { id: "a320", name: "A320", maker: "Airbus", cat: "Kurz-/Mittelstrecke", reqRank: "trainee", reqTraining: null,
      desc: "Das Starter-Flugzeug der Flotte. Jeder neue Pilot beginnt hier." },
    { id: "a330", name: "A330", maker: "Airbus", cat: "Langstrecke", reqRank: "sfo", reqTraining: "a330",
      desc: "Langstrecken-Flaggschiff für Fernziele, ab Senior First Officer freigeschaltet." },
    { id: "b767", name: "767", maker: "Boeing", cat: "Langstrecke", reqRank: "capt", reqTraining: "b767",
      desc: "Bewährter Langstreckenklassiker für erfahrene Captains." },
    { id: "b747", name: "747", maker: "Boeing", cat: "Langstrecke", reqRank: "scapt", reqTraining: "b747",
      desc: "Das große Muster für Senior Captains mit besonderem Training." },
    { id: "dc10", name: "DC-10", maker: "McDonnell Douglas", cat: "Langstrecke (Spezial)", reqRank: "instr", reqTraining: "dc10",
      desc: "Spezialmuster, ausschließlich für Instructors mit Spezialtraining." }
  ],
  trainings: [
    { id: "basic", name: "Basic Pilot Training", desc: "Grundlagen von PTFS.", xp: 250, reqRank: "trainee" },
    { id: "ifr", name: "IFR Training", desc: "IFR-Flüge sicher durchführen.", xp: 250, reqRank: "fo" },
    { id: "atc", name: "ATC Training", desc: "Zusammenarbeit mit ATC.", xp: 250, reqRank: "fo" },
    { id: "a330", name: "A330 Training", desc: "Musterberechtigung Airbus A330.", xp: 250, reqRank: "sfo" },
    { id: "b767", name: "B767 Training", desc: "Musterberechtigung Boeing 767.", xp: 250, reqRank: "capt" },
    { id: "b747", name: "B747 Training", desc: "Musterberechtigung Boeing 747.", xp: 250, reqRank: "scapt" },
    { id: "dc10", name: "DC-10 Training", desc: "Spezialtraining für die DC-10.", xp: 250, reqRank: "instr" },
    { id: "captain", name: "Captain Training", desc: "Voraussetzung für den Captain-Rang.", xp: 250, reqRank: "sfo" }
  ],
  xpPerType: { short: 100, medium: 200, long: 300 },
  hoursPerType: { short: 1.1, medium: 2.8, long: 7.5 },
  // Discord-Rollen-ID -> interne Rang-ID. Leer bis der Admin es im Adminpanel befuellt.
  // Beispiel: { "123456789012345678": "staff", "234567890123456789": "instr" }
  discordRoleMap: {}
};
