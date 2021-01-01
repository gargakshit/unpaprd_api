const libgen = require("libgen");
require("isomorphic-unfetch");
const cheerio = require("cheerio");

module.exports = async (req, resp) => {
  const mirror = "http://libgen.rs";
  const apiData = await libgen.search({
    mirror,
    query: "Moby Dick, or the Whale",
    count: 5,
    search_in: "title",
  });

  if (!apiData || apiData.length === 0) {
    resp
      .status(404)
      .send("The book you requested is not available as an e-book");
  } else {
    const data = apiData.filter((d) => d.extension === "pdf");

    if (data.length === 0) {
      resp.status(404).send("The requested book is not available");
    } else {
      const res = await fetch(
        `${mirror}/book/index.php?md5=${data[0].md5.toLowerCase()}`
      ).then((res) => res.text());
      const $ = cheerio.load(res);
      const newUrl = $(
        "body > table > tbody > tr:nth-child(18) > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > a"
      ).attr().href;

      const bookRes = await fetch(newUrl).then((res) => res.text());
      const $$ = cheerio.load(bookRes);
      const bookUrl = $$("#download > ul > li:nth-child(1) > a").attr().href;

      resp.setHeader("Cache-Control", "s-maxage=604800 stale-while-revalidate");
      resp.send(bookUrl);
    }
  }
};
