const cheerio = require('cheerio');

async function fetchPlayerPage(playerName) {
  // Grab player's name from URL and format it for BBREF
  const searchQuery = encodeURIComponent(playerName);

  const searchResponse = await fetch(
    `https://www.basketball-reference.com/search/?&search=${searchQuery}`
  );
  const searchResponseHTML = await searchResponse.text();

  let $ = cheerio.load(searchResponseHTML);

  const firstResultHREF = $('#players > .search-item')
    .first()
    .find('.search-item-url')
    .text();

  const firstResult = await fetch(
    `https://www.basketball-reference.com/${firstResultHREF}`
  );
  const firstResultHTML = await firstResult.text();

  return firstResultHTML;
}

module.exports = fetchPlayerPage;
