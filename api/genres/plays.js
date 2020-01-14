const fetch = require("isomorphic-unfetch");
const htmlToText = require("html-to-text");

module.exports = async (req, res) => {
  const { limit = 10 } = req.query;

  const { books } = await (
    await fetch(
      `https://librivox.org/api/feed/audiobooks?format=json&extended=1&limit=${limit}&offset=${Math.floor(
        Math.random() * 100
      )}&genre=plays`
    )
  ).json();

  res.json(
    Object.keys(books).map(key => {
      const book = books[key];
      return {
        id: book.id,
        title: book.title,
        description: htmlToText.fromString(book.description),
        language: book.language,
        authors: book.authors,
        total_time: book.totaltime,
        num_sections: book.num_sections
      };
    })
  );
};
