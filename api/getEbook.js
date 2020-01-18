const libgen = require("libgen");
require("isomorphic-unfetch");
const cheerio = require("cheerio");

module.exports = async (req, resp) => {
  const apiData = await libgen.search({
    mirror: "https://libgen.is",
    query: req.query.q,
    count: 5
  });

  if (!apiData || apiData.length === 0) {
    resp.status(404).send("Not found");
  } else {
    const data = apiData.filter(d => d.extension === "pdf");

    fetch(`https://libgen.is/book/index.php?md5=${data[0].md5.toLowerCase()}`)
      .then(res => res.text())
      .then(res => {
        const $ = cheerio.load(res);

        $("a").each((_, element) => {
          if (element.attribs.title === "Gen.lib.rus.ec") {
            fetch(element.attribs.href)
              .then(res => res.text())
              .then(res => {
                const $ = cheerio.load(res);

                $("a").each((_, el) => {
                  if (el.attribs.href.startsWith("/")) {
                    resp.setHeader(
                      "Cache-Control",
                      "s-maxage=604800 stale-while-revalidate"
                    );

                    resp.send(
                      `${element.attribs.href.replace(
                        new RegExp("/_ads.*", "i"),
                        ""
                      )}${el.attribs.href}`
                    );
                  }
                });
              });
          }
        });
      });
  }
};
