const cheerio = require('cheerio');
const grabCareerStats = require('./grabCareerStats');
const fetchPlayerPage = require('./fetchPlayerPage');

async function getPlayerCareer(playerName) {
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

  // Now grab the stats for the player's career
  const statsRow = $('#div_per_game tfoot > tr').first();

  if (statsRow.length <= 0) {
    throw new Error('No career data for that player.');
  }

  const stats = grabCareerStats(statsRow, $);

  stats.name = name;

  return JSON.stringify(stats);
}

module.exports = getPlayerCareer;
