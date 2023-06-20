const cheerio = require('cheerio');

async function getTeam(teamName) {
  try {
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

    // Check if we got to a team's page or not.
    if (name.length <= 0) {
      throw new Error(
        'Search query provided no results. Make sure your search query works at https://basketball-reference.com/'
      );
    }

    // First, grab all the basic information from the team's bio
    const bio = $('#meta > div:nth-child(2) > p');

    let location = '';
    const teamNames = [];
    let wins = -1;
    let losses = -1;
    let win_pct = 0.0;
    let playoffAppearances = -1;
    let championships = -1;

    bio.each((index, element) => {
      const elementData = $(element);
      const elementText = $(element).text();

      if (/Location:/.test(elementText)) {
        // Grab the location
        location = elementText.trim().slice(10).trim();
      } else if (/Team Names:/.test(elementText)) {
        // Grab all team names.
        // I am trimming the start because sometimes there's weird whitespace
        const teams = elementText.trim().slice(11);
        const teamList = teams.split(',');
        for (let i = 0; i < teamList.length; i++) {
          teamNames.push(teamList[i].trim());
        }
      } else if (/Record:/.test(elementText)) {
        // Grab the wins, losees, and win%
        [wins, losses] = elementText.match(/\d+/g);
        win_pct = parseFloat(elementText.match(/\.\d+/g)[0]);
        wins = parseInt(wins);
        losses = parseInt(losses);
      } else if (/Playoff Appearances:/.test(elementText)) {
        // Grab playoff appearances
        playoffAppearances = parseInt(elementText.match(/\d+/)[0]);
      } else if (/Championships:/.test(elementText)) {
        // Grab championships
        championships = parseInt(elementText.match(/\d+/)[0]);
      }
    });

    // Grab the team's logo
    const logo = $('#meta > .logo > .teamLogo').attr('src');

    // Return all the info in a team object
    const team = {
      name,
      logo,
      location,
      teamNames,
      wins,
      losses,
      win_pct,
      playoffAppearances,
      championships,
    };

    return JSON.stringify(team);
  } catch (err) {
    console.error('Failed to grab team from BBREF', +err);
  }
}

module.exports = getTeam;
