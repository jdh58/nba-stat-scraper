const cheerio = require('cheerio');
const grabStats = require('./grabStats');
const grabCareerStats = require('./grabCareerStats');
const fetchPlayerPage = require('./fetchPlayerPage');

async function getPlayer(playerName) {
  try {
    const firstResultHTML = await fetchPlayerPage(playerName);

    $ = cheerio.load(firstResultHTML);

    // First, grab the player's name.
    const name = $('#meta h1').text().trim();

    // Check if we got to a player's page or not.
    /* Just typing "LeBron" automatically redirects to his page. It's pretty
    funny because as far as I can tell this is a entirely unique case. I might
    just leave it as a "feature" or code in something for it up top */
    if (name.length <= 0) {
      throw new Error(
        'Search query provided no players. Make sure your search query works at https://basketball-reference.com/'
      );
    }

    // Grab the player's accolades
    const accolades = [];
    let championships = 0;
    let mvps = 0;
    let allStars = 0;
    const accoladeList = $('#bling > li');

    accoladeList.each((index, accolade) => {
      const accoladeElement = $(accolade);
      const accoladeText = $(accolade).text();

      if (/NBA Champ$/.test(accoladeText)) {
        // If it doesn't have an x in it, it's 1 time
        if (!/x/.test(accoladeText)) {
          championships = 1;
        } else {
          championships = parseInt(accoladeText.match(/^\d+/)[0]);
        }
      } else if (/^\d{4}-\d{2} MVP$|^\d+x MVP$/.test(accoladeText)) {
        // This RegExonly matches MVPs. Not WCF MVPs or ASG or anything
        // And here the logic is very similar to the championships
        if (!/x/.test(accoladeText)) {
          mvps = 1;
        } else {
          mvps = parseInt(accoladeText.match(/^\d+/)[0]);
        }
      } else if (/^\d+x All Star$/.test(accoladeText)) {
        // Here they will all have x's, so just get the leading number
        allStars = parseInt(accoladeText.match(/^\d+/));
      }
      accolades.push(accoladeElement.text());
    });

    // Now fetch bio info
    let playerInfoContainer = $('#meta div:nth-child(2)');
    if ($('#meta > .nothumb').length > 0) {
      // User has no thumbnail, the player info is in a different place.
      playerInfoContainer = $('#meta > .nothumb');
    }
    const nicknames = [];
    let draftPick = -1;
    let draftYear = -1;
    let draftTeam = '';
    const positions = [];
    let shootingHand = '';
    let college = '';
    let birthplace = '';
    let birthdate = '';
    let debut = '';
    let height = '';
    let weight = -1;
    let careerLength = -1;

    const playerInfoElements = playerInfoContainer.find('p');

    playerInfoElements.each((index, element) => {
      const elementData = $(element);
      const elementText = $(element).text().trim();

      if (/^\(.*\)$/.test(elementText)) {
        // Nickname check
        const nicknameList = elementText;
        const nicknameArr = nicknameList.replace(/[()\n]/g, '').split(',');
        for (let i = 0; i < nicknameArr.length; i++) {
          nicknames.push(nicknameArr[i].trim());
        }
      } else if (/^Draft/.test(elementText)) {
        // Draft check
        // This returns the number occurences in the draft string
        draftPick = parseInt(elementText.match(/\d+/g)[2]);
        draftYear = parseInt(elementText.match(/\d+/g)[3]);
        draftTeam = elementData.find('a:nth-child(2)').text().trim();
      } else if (/^Position/.test(elementText)) {
        // Position and handedness check
        positions.push(
          ...elementText.match(
            /Guard|Center|Forward|Small Forward|Point Guard|Shooting Guard|Power Forward/g
          )
        );
        shootingHand = elementText.match(/Right|Left/g)[0];
      } else if (/^College/.test(elementText)) {
        // College check
        college = elementText.slice(9).trim();
      } else if (/^Born/.test(elementText)) {
        // Born info check
        birthplace = elementData
          .find('span:nth-child(3)')
          .text()
          .trim()
          .slice(3);
        birthdate = new Date(
          elementData.find('span:nth-child(2)').text().trim()
        );
      } else if (/^NBA Debut/.test(elementText)) {
        debut = new Date(elementText.slice(11).trim());
      } else if (/kg\)$/.test(elementText)) {
        // Height and weight check
        height = elementText.match(/\d-\d+/)[0];
        weight = parseInt(elementText.match(/\d+/g)[2]);
      } else if (/^Career Length:/.test(elementText)) {
        // Grab career length if they're retired
        careerLength = parseInt(elementText.match(/\d+/)[0]);
      }
    });

    const statContainer = $('#div_per_game tbody > tr');
    const stats = grabStats(statContainer, $);

    // Now get the career stats and load them
    const careerStatsRow = $('#div_per_game tfoot > tr').first();

    stats.career = grabCareerStats(careerStatsRow, $);

    // Finally, get the player's NBA.com id and headshot
    let picture = '';
    let playerID = $('#div_stats-nba-com > div > a:nth-child(1)').attr('href');
    // Null check for player that are retired or otherwise missing this link
    if (playerID) {
      playerID = playerID.match(/\d+/)[0];
      picture = `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerID}.png`;
    } else {
      playerID = '';
    }

    const player = {
      name,
      picture,
      positions,
      height,
      weight,
      nicknames,
      championships,
      mvps,
      allStars,
      accolades,
      stats,
      shootingHand,
      college,
      birthplace,
      birthdate,
      draftPick,
      draftYear,
      draftTeam,
      debut,
      careerLength,
    };

    return JSON.stringify(player);
  } catch (err) {
    console.error("Failed to fetch BBREF player's page", err);
  }
}

module.exports = getPlayer;
