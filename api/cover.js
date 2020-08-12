const { image_search } = require('duckduckgo-images-api');

module.exports = (req, res) => {
  const { name } = req.query;

  if (!name) {
    res.status(500).send("Error.");
  } else {
    image_search({ query: name })
      .then((data) => {
        if (data.length) {
          if (data[0].image.startsWith("http")) {
            res.setHeader(
              "Location",
              `${data[0].image}`
            );
          } else {
            res.setHeader(
              "Location",
              `http://${data[0].image}`
            );
          }
          res.status(301).send();
        } else {
          res.status(404).send("Not Found")
        }
      });
  }
};
