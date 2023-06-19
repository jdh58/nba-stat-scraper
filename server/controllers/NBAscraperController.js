import cheerio from 'cheerio';

const getPlayer = async (req, res) => {
  try {
    // Grab player's name from URL and format it for BBREF
    let playerName = req.params.playerName;
    let [first, last] = playerName.split('_');

    const searchResponse = await fetch(
      `https://www.basketball-reference.com/search/?&search=${first}+${last}`
    );
    const searchResponseHTML = await searchResponse.text();

    let $ = cheerio.load(searchResponseHTML);
    const firstResultHREF = $('.search-item-name')
      .children(':nth-child(1)')
      .children(':nth-child(1)')
      .attr('href');

    const playerResponse = await fetch(
      `https://www.basketball-reference.com/${firstResultHREF}`
    );
    const playerResponseHTML = await playerResponse.text();

    $ = cheerio.load(playerResponseHTML);

    // First, grab the player's accolades
    const accolades = [];
    const accoladeList = $('#bling');

    accoladeList.children().each((index, accolade) => {
      const accoladeElement = $(accolade);
      accolades.push(accoladeElement.text());
    });

    // FIND THESE IN A MORE PROGRAMMATIC WAY THE NTH CHILD SHIT MOVES AROUND ARGH

    // Now fetch nicknames
    const playerInfoContainer = $('#meta div:nth-child(2)');
    const nicknames = [];
    let pickNum = -1;
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
        pickNum = elementText.match(/\d+/g)[2];
        draftYear = elementText.match(/\d+/g)[3];
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
        birthdate = elementData
          .find('span:nth-child(2)')
          .text()
          .replace(/[\r\t\n\f]/g, '')
          .trim();
      } else if (/^NBA Debut/.test(elementText)) {
        debut = elementText.slice(11).trim();
      }
    });

    console.log(nicknames);
    console.log(pickNum);
    console.log(draftYear);
    console.log(positions);
    console.log(shooting_hand);
    console.log(college);
    console.log(draftTeam);
    console.log(birthplace);
    console.log(birthdate);
    console.log(debut);

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
          age: rowData.find('[data-stat="age"]').text().trim(),
          teams:
            // If the team id is "TOT", they got traded, so it's a special case.
            rowData.find('[data-stat="team_id"]').text().trim() === 'TOT'
              ? []
              : [rowData.find('[data-stat="team_id"]').text().trim()],
          position: rowData.find('[data-stat="pos"]').text().trim(),
          games: rowData.find('[data-stat="g"]').text().trim(),
          games_started: rowData.find('[data-stat="gs"]').text().trim(),
          mpg: rowData.find('[data-stat="mp_per_g"]').text().trim(),
          fg: rowData.find('[data-stat="fg_per_g"]').text().trim(),
          fga: rowData.find('[data-stat="fga_per_g"]').text().trim(),
          fg_pct: rowData.find('[data-stat="fg_pct"]').text().trim(),
          '3p': rowData.find('[data-stat="fg3_per_g"]').text().trim(),
          '3pa': rowData.find('[data-stat="fg3a_per_g"]').text().trim(),
          '3p_pct': rowData.find('[data-stat="fg3_pct"]').text().trim(),
          '2p': rowData.find('[data-stat="fg2_per_g"]').text().trim(),
          '2pa': rowData.find('[data-stat="fg2a_per_g"]').text().trim(),
          '2p_pct': rowData.find('[data-stat="fg2_pct"]').text().trim(),
          efg: rowData.find('[data-stat="efg_pct"]').text().trim(),
          ft: rowData.find('[data-stat="ft_per_g"]').text().trim(),
          fta: rowData.find('[data-stat="fta_per_g"]').text().trim(),
          ft_pct: rowData.find('[data-stat="ft_pct"]').text().trim(),
          orb: rowData.find('[data-stat="orb_per_g"]').text().trim(),
          drb: rowData.find('[data-stat="drb_per_g"]').text().trim(),
          trb: rowData.find('[data-stat="trb_per_g"]').text().trim(),
          ast: rowData.find('[data-stat="ast_per_g"]').text().trim(),
          stl: rowData.find('[data-stat="stl_per_g"]').text().trim(),
          bpg: rowData.find('[data-stat="blk_per_g"]').text().trim(),
          tpg: rowData.find('[data-stat="tov_per_g"]').text().trim(),
          pf: rowData.find('[data-stat="pf_per_g"]').text().trim(),
          ppg: rowData.find('[data-stat="pts_per_g"]').text().trim(),
        };
      }
    });

    res.send(stats);

    /* nicknameList will be dependent on if the player's page has
    a) First row as a pronunciation
    or b) No nicknames listed */
    // let nicknameList;

    // // If the first row is pronunciation
    // if (
    //   /Pronunciation/.test(playerInfoContainer.find('p:nth-child(2)').text())
    // ) {
    //   // Then nicknames will be the 4th child. If they aren't then there are no nicknames.
    //   if (
    //     /^\(.*\)$/.test(
    //       playerInfoContainer.find('p:nth-child(4)').text().trim()
    //     )
    //   ) {
    //     nicknameList = playerInfoContainer.find('p:nth-child(4)').text();
    //   } else {
    //     nicknameList = null;
    //   }
    // } else {
    //   // If there is no pronunciation row, then nicknames will be the 3rd child.
    //   // If they aren't, then there are no nicknames.
    //   if (
    //     /^\(.*\)$/.test(
    //       playerInfoContainer.find('p:nth-child(3)').text().trim()
    //     )
    //   ) {
    //     nicknameList = playerInfoContainer.find('p:nth-child(3)').text();
    //   } else {
    //     nicknameList = null;
    //   }
    // }

    // if (nicknameList) {
    //   const nicknameArr = nicknameList.replace(/[()\n]/g, '').split(',');

    //   for (let i = 0; i < nicknameArr.length; i++) {
    //     nicknames.push(nicknameArr[i].trim());
    //   }
    // }

    // // Now get place of birth
    // const birthplaceElement = $('#meta')
    //   .children(':nth-child(2)')
    //   .children(':nth-child(6)')
    //   .children(':nth-child(3)')
    //   .text();
    // const birthplace = birthplaceElement.trim().slice(3);

    // // Draft pick and first year
    // const draftRegex = /\d+ NBA Draft/;
    // const draftElement = $('a:contains("NBA Draft")').text();
    // const pickRegex = /\d+ NBA Draft/;
    // const draftElement = $('p:contains("NBA Draft")').text();

    // const pickNum = draftElement.match(/\d+/g)[2];
    // const draftYear = draftElement.match(/\d+/g)[3];

    // console.log(draftElement);
  } catch (err) {
    console.error("Failed to fetch BBREF player's page", err);
  }
};

export { getPlayer };
