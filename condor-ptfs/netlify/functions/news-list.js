const { currentUser, json } = require("./_lib/auth");
const store = require("./_lib/store");

exports.handler = async (event) => {
  const user = await currentUser(event);
  if (!user) return json(401, { error: "not_authenticated" });
  const news = await store.listNews();
  return json(200, { news });
};
