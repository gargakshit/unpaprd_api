const fetch = require("isomorphic-unfetch");

module.exports = async (req, res) => {
  const { url } = req.query;

  const { url: redUrl } = await fetch(url);
  res.send(redUrl);
};
