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
    const positions = [];
    let shooting_hand = '';
    let college = '';

    const playerInfoElements = playerInfoContainer.find('p');

    playerInfoElements.each((index, element) => {
      const elementText = $(element).text().trim();
      const elementData = $(element);

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
      } else if (/^Position/.test(elementText)) {
        // Position and handedness check
        positions.push(
          ...elementText.match(
            /Guard|Center|Forward|Small Forward|Point Guard|Shooting Guard|Power Forward/g
          )
        );
        shooting_hand = elementText.match(/Right|Left/g)[0];
      } else if (/^College/.test(elementText)) {
        college = elementText.slice(9).trim();
      }
    });

    console.log(nicknames);
    console.log(pickNum);
    console.log(draftYear);
    console.log(positions);
    console.log(shooting_hand);
    console.log(college);

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

    res.send('das');
  } catch (err) {
    console.error("Failed to fetch BBREF player's page", err);
  }
};

export { getPlayer };
