import cheerio from 'cheerio';

const getPlayer = async (req, res) => {
  // Grab player's name from URL and format it for BBREF
  let playerName = req.params.playerName;
  let [first, last] = playerName.split('_');

  const response = await fetch(
    `https://www.basketball-reference.com/search/?&search=${first}+${last}`
  );
  const responseHTML = await response.text();

  const $ = cheerio.load(responseHTML);
  const firstResult = $('.search-item-name');

  console.log(firstResult.attr('class'));
  res.send('s');
};

export { getPlayer };
