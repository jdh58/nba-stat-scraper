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
    const nicknames = [];
    const nicknameList = $('#meta')
      .children(':nth-child(2)')
      .children(':nth-child(3)')
      .text();

    const nicknameArr = nicknameList.replace(/[()\n]/g, '').split(',');

    for (let i = 0; i < nicknameArr.length; i++) {
      nicknames.push(nicknameArr[i].trim());
    }

    // Now get place of birth
    const birthplaceElement = $('#meta')
      .children(':nth-child(2)')
      .children(':nth-child(6)')
      .children(':nth-child(3)')
      .text();
    const birthplace = birthplaceElement.trim().slice(3);

    // Draft pick and first year
    const draftRegex = /\d+ NBA Draft/;
    const draftElement = $('a:contains("NBA Draft")').text();
    // const pickRegex = /\d+ NBA Draft/;
    // const draftElement = $('p:contains("NBA Draft")').text();

    // const pickNum = draftElement.match(/\d+/g)[2];
    // const draftYear = draftElement.match(/\d+/g)[3];

    console.log(draftElement);

    res.send(birthplace);
  } catch (err) {
    console.error("Failed to fetch BBREF player's page", err);
  }
};

export { getPlayer };
