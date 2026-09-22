const { shortStateCookie } = require("./_lib/session");

exports.handler = async () => {
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify",
    state,
    prompt: "consent",
  });
  return {
    statusCode: 302,
    headers: {
      Location: `https://discord.com/api/oauth2/authorize?${params.toString()}`,
      "Set-Cookie": shortStateCookie("oauth_state", state),
    },
    body: "",
  };
};
