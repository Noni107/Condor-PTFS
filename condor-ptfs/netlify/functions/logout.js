const { clearSessionCookie } = require("./_lib/session");

exports.handler = async () => {
  return {
    statusCode: 302,
    headers: {
      Location: "/",
      "Set-Cookie": clearSessionCookie(),
    },
    body: "",
  };
};
