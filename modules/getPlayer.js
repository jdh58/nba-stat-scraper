const cheerio = require('cheerio');

async function getPlayer(playerName) {
  try {
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
        console.log(accoladeText);
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

    // Now fetch nicknames
    const playerInfoContainer = $('#meta div:nth-child(2)');
    const nicknames = [];
    let draftPick = -1;
    let draftYear = -1;
    let draftTeam = '';
    const positions = [];
    let shooting_hand = '';
    let college = '';
    let birthplace = '';
    let birthdate = '';
    let debut = '';

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
        shooting_hand = elementText.match(/Right|Left/g)[0];
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
      }
    });

    const statContainer = $('#div_per_game tbody > tr');
    const stats = {};

    statContainer.each((index, row) => {
      const rowData = $(row);

      // Make sure the stats we are getting are NBA stats.
      // This check also eliminates seasons a player completely missed.
      if (rowData.find('[data-stat="lg_id"]').text().trim() !== 'NBA') {
        return;
      }

      /* Check if the stats for this year are already generated. If they are,
      that means that the player has played for multiple teams in one year.
      Keep the total stats the same, just update the teams. */
      if (stats[rowData.find('th').text().trim()]) {
        stats[rowData.find('th').text().trim()].teams = [
          ...stats[rowData.find('th').text().trim()].teams,
          rowData.find('[data-stat="team_id"]').text().trim(),
        ];
      } else {
        stats[rowData.find('th').text().trim()] = {
          age: parseFloat(rowData.find('[data-stat="age"]').text().trim()),
          teams:
            // If the team id is "TOT", they got traded, so it's a special case.
            rowData.find('[data-stat="team_id"]').text().trim() === 'TOT'
              ? []
              : [rowData.find('[data-stat="team_id"]').text().trim()],
          position: rowData.find('[data-stat="pos"]').text().trim(),
          games: parseInt(rowData.find('[data-stat="g"]').text().trim()),
          games_started: parseInt(
            rowData.find('[data-stat="gs"]').text().trim()
          ),
          mpg: parseFloat(rowData.find('[data-stat="mp_per_g"]').text().trim()),
          fg: parseFloat(rowData.find('[data-stat="fg_per_g"]').text().trim()),
          fga: parseFloat(
            rowData.find('[data-stat="fga_per_g"]').text().trim()
          ),
          fg_pct: parseFloat(
            rowData.find('[data-stat="fg_pct"]').text().trim()
          ),
          '3p': parseFloat(
            rowData.find('[data-stat="fg3_per_g"]').text().trim()
          ),
          '3pa': parseFloat(
            rowData.find('[data-stat="fg3a_per_g"]').text().trim()
          ),
          '3p_pct': parseFloat(
            rowData.find('[data-stat="fg3_pct"]').text().trim()
          ),
          '2p': parseFloat(
            rowData.find('[data-stat="fg2_per_g"]').text().trim()
          ),
          '2pa': parseFloat(
            rowData.find('[data-stat="fg2a_per_g"]').text().trim()
          ),
          '2p_pct': parseFloat(
            rowData.find('[data-stat="fg2_pct"]').text().trim()
          ),
          efg: parseFloat(rowData.find('[data-stat="efg_pct"]').text().trim()),
          ft: parseFloat(rowData.find('[data-stat="ft_per_g"]').text().trim()),
          fta: parseFloat(
            rowData.find('[data-stat="fta_per_g"]').text().trim()
          ),
          ft_pct: parseFloat(
            rowData.find('[data-stat="ft_pct"]').text().trim()
          ),
          orb: parseFloat(
            rowData.find('[data-stat="orb_per_g"]').text().trim()
          ),
          drb: parseFloat(
            rowData.find('[data-stat="drb_per_g"]').text().trim()
          ),
          trb: parseFloat(
            rowData.find('[data-stat="trb_per_g"]').text().trim()
          ),
          ast: parseFloat(
            rowData.find('[data-stat="ast_per_g"]').text().trim()
          ),
          stl: parseFloat(
            rowData.find('[data-stat="stl_per_g"]').text().trim()
          ),
          bpg: parseFloat(
            rowData.find('[data-stat="blk_per_g"]').text().trim()
          ),
          tpg: parseFloat(
            rowData.find('[data-stat="tov_per_g"]').text().trim()
          ),
          pf: parseFloat(rowData.find('[data-stat="pf_per_g"]').text().trim()),
          ppg: parseFloat(
            rowData.find('[data-stat="pts_per_g"]').text().trim()
          ),
        };
      }
    });

    // Now get the career stats and load them
    const careerStatsRow = $('#div_per_game tfoot > tr').first();

    stats.career = {
      games: parseInt(careerStatsRow.find('[data-stat="g"]').text().trim()),
      games_started: parseInt(
        careerStatsRow.find('[data-stat="gs"]').text().trim()
      ),
      mpg: parseFloat(
        careerStatsRow.find('[data-stat="mp_per_g"]').text().trim()
      ),
      fg: parseFloat(
        careerStatsRow.find('[data-stat="fg_per_g"]').text().trim()
      ),
      fga: parseFloat(
        careerStatsRow.find('[data-stat="fga_per_g"]').text().trim()
      ),
      fg_pct: parseFloat(
        careerStatsRow.find('[data-stat="fg_pct"]').text().trim()
      ),
      '3p': parseFloat(
        careerStatsRow.find('[data-stat="fg3_per_g"]').text().trim()
      ),
      '3pa': parseFloat(
        careerStatsRow.find('[data-stat="fg3a_per_g"]').text().trim()
      ),
      '3p_pct': parseFloat(
        careerStatsRow.find('[data-stat="fg3_pct"]').text().trim()
      ),
      '2p': parseFloat(
        careerStatsRow.find('[data-stat="fg2_per_g"]').text().trim()
      ),
      '2pa': parseFloat(
        careerStatsRow.find('[data-stat="fg2a_per_g"]').text().trim()
      ),
      '2p_pct': parseFloat(
        careerStatsRow.find('[data-stat="fg2_pct"]').text().trim()
      ),
      efg: parseFloat(
        careerStatsRow.find('[data-stat="efg_pct"]').text().trim()
      ),
      ft: parseFloat(
        careerStatsRow.find('[data-stat="ft_per_g"]').text().trim()
      ),
      fta: parseFloat(
        careerStatsRow.find('[data-stat="fta_per_g"]').text().trim()
      ),
      ft_pct: parseFloat(
        careerStatsRow.find('[data-stat="ft_pct"]').text().trim()
      ),
      orb: parseFloat(
        careerStatsRow.find('[data-stat="orb_per_g"]').text().trim()
      ),
      drb: parseFloat(
        careerStatsRow.find('[data-stat="drb_per_g"]').text().trim()
      ),
      trb: parseFloat(
        careerStatsRow.find('[data-stat="trb_per_g"]').text().trim()
      ),
      ast: parseFloat(
        careerStatsRow.find('[data-stat="ast_per_g"]').text().trim()
      ),
      stl: parseFloat(
        careerStatsRow.find('[data-stat="stl_per_g"]').text().trim()
      ),
      bpg: parseFloat(
        careerStatsRow.find('[data-stat="blk_per_g"]').text().trim()
      ),
      tpg: parseFloat(
        careerStatsRow.find('[data-stat="tov_per_g"]').text().trim()
      ),
      pf: parseFloat(
        careerStatsRow.find('[data-stat="pf_per_g"]').text().trim()
      ),
      ppg: parseFloat(
        careerStatsRow.find('[data-stat="pts_per_g"]').text().trim()
      ),
    };

    // Finally, get the player's NBA.com id and headshot
    let playerID = $('#div_stats-nba-com > div > a:nth-child(1)').attr('href');
    // Null check for player that are retired or otherwise missing this link
    if (playerID) {
      playerID = playerID.match(/\d+/)[0];
    } else {
      playerID = '';
    }

    const picture = `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerID}.png`;

    const player = {
      name,
      picture,
      positions,
      nicknames,
      championships,
      mvps,
      allStars,
      accolades,
      stats,
      shooting_hand,
      college,
      birthplace,
      birthdate,
      draftPick,
      draftYear,
      draftTeam,
      debut,
    };

    return JSON.stringify(player);
  } catch (err) {
    console.error("Failed to fetch BBREF player's page", err);
  }
}

module.exports = getPlayer;
