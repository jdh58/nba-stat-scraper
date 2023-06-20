const cheerio = require('cheerio');
const grabCareerStats = require('./grabCareerStats');

async function getPlayerCareer(playerName) {
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

  $ = cheerio.load(firstResultHTML);

  // First, grab the player's name.
  const name = $('#meta h1').text().trim();

  if (name.length <= 0) {
    throw new Error(
      'Search query provided no players. Make sure your search query works at https://basketball-reference.com/'
    );
  }

  // Now grab the stats for the player's career
  const statsRow = $('#div_per_game tbody > tr');

  if (statsRow.length <= 0) {
    throw new Error('No career data for that player.');
  }

  const stats = grabCareerStats(statsRow, $);

  stats.name = name;

  return JSON.stringify(stats);
}

module.exports = getPlayerCareer;
