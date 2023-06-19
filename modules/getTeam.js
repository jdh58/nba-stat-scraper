const cheerio = require('cheerio');

async function getTeam(teamName) {
  const searchQuery = encodeURIComponent(teamName);

  const searchResponse = await fetch(
    `https://www.basketball-reference.com/search/?&search=${searchQuery}`
  );
  const searchResponseHTML = await searchResponse.text();

  let $ = cheerio.load(searchResponseHTML);

  const firstResultHREF = $('#teams > .search-item')
    .first()
    .find('.search-item-url')
    .text();

  const firstResult = await fetch(
    `https://www.basketball-reference.com/${firstResultHREF}`
  );
  const firstResultHTML = await firstResult.text();

  $ = cheerio.load(firstResultHTML);

  // First, grab the team's name.
  const name = $('#meta h1').text().trim();

  // Check if we got to a player's page or not.
  /* Just typing "LeBron" automatically redirects to his page. It's pretty
    funny because as far as I can tell this is a entirely unique case. I might
    just leave it as a "feature" or code in something for it up top */
  if (name.length <= 0) {
    throw new Error(
      'Search query provided no results. Make sure your search query works at https://basketball-reference.com/'
    );
  } else if (!/player/.test(firstResultHREF)) {
    throw new Error(
      'Search query responded with a non-player result. Make sure your search query works at https://basketball-reference.com/'
    );
  }

  return firstResultHTML;
}

module.exports = getTeam;
