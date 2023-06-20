const cheerio = require('cheerio');
const grabStats = require('./grabStats');
const fetchPlayerPage = require('./fetchPlayerPage');

async function getPlayerSeason(playerName, year) {
  // Grab player's name from URL and format it for BBREF
  const firstResultHTML = await fetchPlayerPage(playerName);

  $ = cheerio.load(firstResultHTML);

  // First, grab the player's name.
  const name = $('#meta h1').text().trim();

  if (name.length <= 0) {
    throw new Error(
      'Search query provided no players. Make sure your search query works at https://basketball-reference.com/'
    );
  }

  // Now grab the stats for the requested season
  const statsRow = $(`#per_game\\.${year}`);

  if (statsRow.length <= 0) {
    throw new Error(
      'No data for that season for this player. Ensure they played during the entered year'
    );
  }

  const stats = grabStats(statsRow, $);
  stats.name = name;

  return JSON.stringify(stats);
}

module.exports = getPlayerSeason;
