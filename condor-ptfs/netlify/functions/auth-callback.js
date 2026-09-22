const { exchangeCode, fetchDiscordUser, fetchGuildMemberRoles } = require("./_lib/discord");
const { parseCookies, sign, sessionCookie, clearSessionCookie } = require("./_lib/session");
const { discordRankFromRoles, reconcile } = require("./_lib/domain");
const store = require("./_lib/store");

function newUser(discordUser) {
  return {
    discordId: discordUser.id,
    discordUsername: discordUser.username,
    avatar: discordUser.avatar,
    robloxUsername: "",
    progressionRank: "trainee",
    discordRank: null,
    discordRoles: [],
    xp: 0,
    completedFlights: 0,
    flightHours: 0,
    trainings: {},
    achievements: [],
    banned: false,
    joinedAt: new Date().toISOString(),
  };
}

exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);

  if (!qs.code || !qs.state || qs.state !== cookies.oauth_state) {
    return { statusCode: 400, body: "Ungültiger oder abgelaufener Login-Versuch. Bitte erneut versuchen." };
  }

  try {
    const token = await exchangeCode(qs.code);
    const discordUser = await fetchDiscordUser(token.access_token);
    const roles = await fetchGuildMemberRoles(discordUser.id);

    let user = await store.getUser(discordUser.id);
    if (!user) user = newUser(discordUser);
    user.discordUsername = discordUser.username;
    user.avatar = discordUser.avatar;
    user.discordRoles = roles;

    const config = await store.getConfig();
    user.discordRank = discordRankFromRoles(roles, config);
    reconcile(user, config);
    await store.saveUser(user);

    const jwtToken = sign({ discordId: user.discordId });
    return {
      statusCode: 302,
      headers: {
        Location: "/",
        "Set-Cookie": sessionCookie(jwtToken),
      },
      body: "",
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Set-Cookie": clearSessionCookie() },
      body: "Login fehlgeschlagen: " + err.message,
    };
  }
};
