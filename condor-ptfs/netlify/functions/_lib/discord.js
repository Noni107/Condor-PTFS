// Talks to Discord's REST API. No gateway/websocket connection is used here -
// Netlify Functions can't hold one open - role lookups happen on demand via
// the bot token, which is exactly as accurate but pull-based instead of push-based.

async function exchangeCode(code) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  });
  const res = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error("Discord token exchange failed: " + res.status + " " + (await res.text()));
  return res.json(); // { access_token, token_type, ... }
}

async function fetchDiscordUser(accessToken) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: "Bearer " + accessToken },
  });
  if (!res.ok) throw new Error("Discord user fetch failed: " + res.status);
  const u = await res.json();
  return {
    id: u.id,
    username: u.global_name || u.username,
    avatar: u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${Number(u.discriminator || "0") % 5}.png`,
  };
}

// Requires the bot to be a member of DISCORD_GUILD_ID. Returns [] (not an
// error) if the person isn't in the server, or if the bot isn't configured yet.
async function fetchGuildMemberRoles(discordUserId) {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!guildId || !botToken) return [];
  const res = await fetch(`https://discord.com/api/guilds/${guildId}/members/${discordUserId}`, {
    headers: { Authorization: "Bot " + botToken },
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error("Discord guild member fetch failed: " + res.status);
  const data = await res.json();
  return data.roles || [];
}

module.exports = { exchangeCode, fetchDiscordUser, fetchGuildMemberRoles };
