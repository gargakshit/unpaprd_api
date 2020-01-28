const fetch = require("isomorphic-unfetch");

module.exports = async (req, res) => {
  const { url } = req.query;

  const { url: redUrl } = await fetch(url);
  res.setHeader("Cache-Control", "s-maxage=604800 stale-while-revalidate");
  res.send(redUrl);
};
