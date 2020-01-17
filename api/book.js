const fetch = require("isomorphic-unfetch");
const htmlToText = require("html-to-text");
const { parseString } = require("xml2js");
const _ = require("lodash");

module.exports = async (req, res) => {
  const { id } = req.query;

  const { books } = await (
    await fetch(
      `https://librivox.org/api/feed/audiobooks/?id=${id}&format=json&extended=1`
    )
  ).json();

  const book = books[Object.keys(books)[0]];

  const readers = [];

  book.sections.forEach(section => {
    section.readers.forEach(reader => {
      readers.push(reader);
    });
  });

  const { url_iarchive } = book;

  const build_url = `${url_iarchive.replace(
    "details",
    "download"
  )}/${url_iarchive
    .replace("www.", "")
    .replace("http://archive.org/details/", "")}_files.xml`;

  parseString(
    await (await fetch(build_url)).text(),
    { trim: true },
    (err, data) => {
      const audio = [];

      if (!err) {
        console.log(err);

        data.files.file.forEach(file => {
          if (file.original && file.$.name) {
            if (
              file.original.toString().endsWith(".mp3") &&
              file.$.name.toString().endsWith("mp3")
            ) {
              audio.push({
                url: `${url_iarchive.replace("details", "download")}/${
                  file.original
                }`,
                title: file.title[0],
                length: file.length[0]
              });
            }
          }
        });
      }

      res.json({
        id: book.id,
        title: book.title,
        description: htmlToText.fromString(book.description),
        language: book.language,
        authors: book.authors,
        total_time: book.totaltime,
        num_sections: book.num_sections,
        genre: book.genre,
        readers: _.uniqBy(readers, "reader_id"),
        audio,
        torrent: `${url_iarchive.replace(
          "details",
          "download"
        )}/${url_iarchive
          .replace("www.", "")
          .replace("http://archive.org/details/", "")}_archive.torrent`
      });
    }
  );
};
