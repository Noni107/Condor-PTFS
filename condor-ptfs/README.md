# Condor PTFS – Setup

Dieses Projekt ist ein echtes Backend (Netlify Functions + Netlify Blobs als
Datenbank) für deine Condor-PTFS-Seite: echter Discord-Login, Rollen-Sync,
serverseitige XP/Rang-Logik, kein `localStorage` mehr.

## 1. Discord: Bot anlegen

Du hast schon eine Application (Client ID/Secret). Jetzt den Bot dazu anlegen:

1. https://discord.com/developers/applications → deine Application öffnen
2. Links auf **Bot** → **Add Bot** (falls noch nicht vorhanden)
3. **Token** kopieren (nur einmal sichtbar – notieren, brauchst du gleich)
4. Unter **Privileged Gateway Intents** musst du hier nichts aktivieren – wir
   nutzen nur REST-Abfragen, keine Gateway-Verbindung
5. Unter **OAuth2 → Redirects** eintragen:
   `https://DEINE-SEITE.netlify.app/auth/discord/callback`
   (die echte Netlify-Domain trägst du erst nach dem ersten Deploy ein,
   danach nochmal hier ergänzen)
6. Bot auf deinen Server einladen: **OAuth2 → URL Generator** →
   Scopes: `bot` → Permissions: reicht "View Server" (der Bot muss nur
   Mitglied sein, um Rollen abzufragen) → Link öffnen → Server auswählen

## 2. Deine IDs besorgen

- Discord-Einstellungen → **Erweitert** → **Entwicklermodus** aktivieren
- Rechtsklick auf deinen Server-Namen → **Server-ID kopieren** →
  `DISCORD_GUILD_ID`
- Rechtsklick auf dein eigenes Profil → **Nutzer-ID kopieren** →
  `SUPER_ADMIN_DISCORD_IDS` (damit du dich nicht aussperrst, bevor du im
  Adminpanel echte Rollen zugeordnet hast)

## 3. Bei Netlify deployen

1. Dieses Projekt zu GitHub pushen (oder den Ordner direkt per Drag&Drop bei
   Netlify hochladen: https://app.netlify.com → "Add new site" → "Deploy
   manually")
2. Netlify erkennt `netlify.toml` automatisch (Functions-Ordner,
   Redirects)
3. **Site settings → Environment variables** – trage ein (siehe `.env.example`):
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_REDIRECT_URI` → `https://DEINE-SEITE.netlify.app/auth/discord/callback`
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_GUILD_ID`
   - `JWT_SECRET` → ein langer Zufallsstring, z. B. mit `openssl rand -hex 32`
     erzeugen
   - `SUPER_ADMIN_DISCORD_IDS` → deine eigene Discord-User-ID
4. Neu deployen (Environment-Variablen werden erst beim nächsten Build aktiv:
   **Deploys → Trigger deploy**)
5. Jetzt im Discord Developer Portal die **echte** Netlify-URL nochmal exakt
   als Redirect eintragen, falls sie sich vom Platzhalter unterscheidet

## 4. Erster Login & Admin-Einrichtung

1. Öffne deine Seite, klicke "Mit Discord anmelden"
2. Da deine ID in `SUPER_ADMIN_DISCORD_IDS` steht, siehst du sofort den
   Admin-Bereich (auch ohne passende Discord-Rolle)
3. Admin → **Einstellungen** → **Discord-Rollen-Zuordnung**: trage die
   Rollen-IDs deiner Ränge ein (z. B. deine "Staff"-Rolle → Staff, "Instructor"
   → Instructor). Rollen-ID bekommst du per Rechtsklick auf die Rolle in den
   Server-Einstellungen (Entwicklermodus muss an sein)
4. Ab jetzt bekommt jeder, der diese Discord-Rolle hat, beim Login/Sync
   automatisch den passenden Rang auf der Website

## Wie die Rollen-Synchronisation funktioniert

Es läuft **kein** dauerhafter Bot-Prozess (Netlify Functions können das
technisch nicht). Stattdessen:

- Bei jedem Login wird der aktuelle Rollen-Stand einmalig per REST-API
  abgefragt (mit dem Bot-Token) und gespeichert
- Nutzer können jederzeit über den Button **"Rollen synchronisieren"** in der
  Sidebar manuell neu abgleichen (z. B. direkt nachdem du ihnen im Discord
  eine neue Rolle gegeben hast)
- Das ist kein Echtzeit-Push, aber für ein Pilot-Portal völlig ausreichend

## Datenbank

Alle Daten (Nutzer, Flüge, News, Konfiguration) liegen in **Netlify Blobs** –
automatisch verfügbar, kein separater Account nötig. Falls du später mehr
Kontrolle/Abfragemöglichkeiten brauchst, lässt sich `netlify/functions/_lib/store.js`
relativ leicht auf z. B. Supabase (Postgres) umstellen, ohne die restliche
Logik anzufassen.

## Admin-Funktionen im Überblick

- **Pending/Accepted/Rejected**: Flüge prüfen, annehmen (vergibt automatisch
  XP/Flugstunden/Rang/Achievements), ablehnen mit Grund
- **Mitglieder**: Rang manuell setzen, Nutzer sperren/entsperren
- **Einstellungen**: Discord-Rollen-Zuordnung, XP/Flugstunden pro
  Streckentyp, sowie ein JSON-Editor für Ränge/Flotte/Trainings (um z. B. ein
  neues Flugzeug oder einen neuen Rang hinzuzufügen, ohne Code anzufassen)

## Lokal testen (optional)

```
npm install -g netlify-cli
npm install
netlify dev
```

`netlify dev` startet Frontend + Functions lokal; für Netlify Blobs und echte
Discord-Logins brauchst du trotzdem eine echte Netlify-Site-Verknüpfung
(`netlify link`) und die Environment-Variablen lokal (`netlify env:pull`).


