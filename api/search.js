const fetch = require("isomorphic-unfetch");
const cheerio = require("cheerio");

module.exports = (req, response) => {
  const { q } = req.query;

  fetch(
    `https://librivox.org/advanced_search?title=&author=&reader=&keywords=&genre_id=0&status=all&project_type=either&recorded_language=&sort_order=alpha&search_page=1&search_form=advanced&q=${q.toLowerCase()}`,
    {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    }
  )
    .then(res => res.json())
    .then(async res => {
      const html = res.results
        .replace(new RegExp("\n", "g"), "")
        .replace(new RegExp("\t", "g"), "")
        .replace(new RegExp("\\="), "=");

      const $ = cheerio.load(html);

      const urls = [];

      $("a").each((index, element) => {
        if (
          element.attribs.href.startsWith("https://librivox.org") &&
          !element.attribs.href.includes("author") &&
          !element.attribs.href.includes("reader")
        ) {
          urls.push(element.attribs.href);
        }
      });

      const data = [];

      await Promise.all(
        urls.map(async url => {
          const r = await fetch(url);
          const res = await r.text();

          const $ = cheerio.load(res);

          const curr = {};

          curr.title = $(".content-wrap > h1").text();

          curr.language = $(".book-page-genre")
            .last()
            .text()
            .includes("Language")
            ? $(".book-page-genre")
                .last()
                .text()
                .replace("Language: ", "")
            : $(".book-page-genre")
                .eq(1)
                .text()
                .replace("Language: ", "");

          curr.total_time = $(".product-details")
            .first()
            .text()
            .replace(new RegExp("\n", "g"), "")
            .replace(new RegExp("\t", "g"), "")
            .replace(new RegExp(".*Running Time:  "), "")
            .replace(new RegExp(" .*"), "");

          curr.num_sections = `${$(".chapter-download > tbody > tr").length}`;

          $(".book-download-btn").each((idx, ele) => {
            if (
              ele.attribs.href.includes("rss") &&
              !ele.attribs.href.includes("itpc")
            ) {
              curr.id = ele.attribs.href.replace(
                new RegExp("https://librivox.org/rss/"),
                ""
              );

              if (
                ele.attribs.href.replace(
                  new RegExp("https://librivox.org/rss/"),
                  ""
                )
              ) {
                curr.authors = [];
                curr.description = "";

                data.push(curr);
              }
            }
          });
        })
      );

      response.setHeader(
        "Cache-Control",
        "s-maxage=2592000 stale-while-revalidate"
      );

      response.json(data);
    });
};
