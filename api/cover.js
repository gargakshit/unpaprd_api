const qwant = require("qwant-api");

module.exports = (req, res) => {
  const { name } = req.query;

  if (!name) {
    res.status(500).send("Error.");
  } else {
    qwant.search(
      "images",
      { query: name, count: 0, offset: 0, language: "english" },
      (err, { data }) => {
        if (err) {
          res.status(500).send("Internal Server Error.");
        } else {
          res.setHeader(
            "Location",
            `https:${data.result.items[0].media_fullsize}`
          );
          res.status(301).send();
        }
      }
    );
  }
};
