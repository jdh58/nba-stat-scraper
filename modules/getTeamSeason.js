const cheerio = require('cheerio');

async function getTeamSeason(teamName, year) {
  // ADD WINSHARES AND PER AND HEIGHT AND WEIGHT TO GET PLAYER IN CAREER
  // Get the entire bio
  /*
  teamSeason = {
    name: "Boston Celtics",
    season: "1996-97",
    record:
    seed: 
    coach:
    executive:
    stats: {
      ppg:
      oppg:
      srs:
      pace:
      ortg:
      drtg:
      netrtg:
      expWL:
      arena:
      attendance: 
    }
    playoffs: [

    ]
    playoffResult:
    champions: true|false
    roster: ["boob ryan"]
  }
  */

  const searchQuery = `${year} ${teamName}`;

  const searchResponse = await fetch(
    `https://www.basketball-reference.com/search/?&search=${searchQuery}`
  );
  // On BBREF, year + team auto redirects to that team's page
  const firstResultHTML = await searchResponse.text();

  $ = cheerio.load(firstResultHTML);

  console.log(searchQuery);
  // First, grab the team's name.
  const name = $('#meta h1 > span:nth-child(2)').text().trim();
  const season = $('#meta h1 > span:nth-child(1)').text().trim();

  // Check if we got to a team's page or not.
  if (name.length <= 0) {
    throw new Error(
      'Search query provided no results. Make sure your search query works at https://basketball-reference.com/'
    );
  }

  let wins = -1;
  let losses = -1;
  let seed = -1;
  let coach = '';
  let executive = '';
  let ppg = -1;
  let oppg = -1;
  let srs = -1;
  let pace = -1;
  let expW = -1;
  let expL = -1;
  let preseasonOdds = -1;
  let overUnder = -1;
  let arena = '';
  let attendance = '';
  const playoffs = [];
  let playoffResult = '';

  // First, grab all the basic information from the team's bio
  const bio = $('#meta > div:nth-child(2) > p');

  bio.each((index, element) => {
    const elementData = $(element);
    const elementText = $(element).text();

    if (/Record:/.test(elementText)) {
      [wins, losses, seed] = elementText.match(/\d+/g);
      [wins, losses, seed] = [parseInt(wins), parseInt(losses), parseInt(seed)];
    } else if (/Coach:/.test(elementText)) {
      coach = elementData.find('a').text();
    } else if (/Executive:/.test(elementText)) {
      executive = elementData.find('a').text();
    } else if (/PTS\/G:/.test(elementText)) {
      console.log(elementText);
      [ppg, oppg] = elementText.match(/\d+\.\d/g);
      [ppg, oppg] = [parseFloat(ppg), parseFloat(oppg)];
    } else if (/SRS:/.test(elementText)) {
      [srs, pace] = elementText.match(/\d+\.\d+/g);
      [srs, pace] = [parseFloat(srs), parseFloat(pace)];
    } else if (/Off Rtg:/.test(elementText)) {
      [oRtg, dRtg] = elementText.match(/\d+\.\d/g);
      [oRtg, dRtg] = [parseFloat(oRtg), parseFloat(dRtg)];
      netRtg = parseFloat(elementText.match(/[\+-]\d+\.\d/g)[0]);
    } else if (/Expected W-L:/.test(elementText)) {
      expW = parseInt(elementText.match(/\d+/)[0]);
      expL = parseInt(elementText.match(/\d+/g)[1]);
    } else if (/Preseason Odds:/.test(elementText)) {
      preseasonOdds = parseInt(elementText.match(/[\+-]\d+/));
      overUnder = parseFloat(elementText.match(/\d+\.\d/g)[0]);
    } else if (/Arena:/.test(elementText)) {
      // Weird matching... but the whitespace is janky so this works
      arena = elementText.match(/.+/g)[2].trim();
      attendance = parseInt(elementText.match(/\d+,\d+/)[0].replace(',', ''));
    } else if (/NBA \d+ Playoffs/.test(elementText)) {
      const playoffElements = elementText
        .replace(/\(Series Stats\)/g, '')
        .trim()
        .split('\n');

      for (let i = 1; i < playoffElements.length; i++) {
        playoffs.push(playoffElements[i].trim());
      }

      playoffResult = playoffs[playoffs.length - 1];
    }
  });

  console.log(wins);
  console.log(losses);
  console.log(seed);
  console.log(coach);
  console.log(executive);
  console.log(ppg);
  console.log(oppg);
  console.log(srs);
  console.log(pace);
  console.log(oRtg);
  console.log(dRtg);
  console.log(netRtg);
  console.log(expW);
  console.log(expL);
  console.log(preseasonOdds);
  console.log(overUnder);
  console.log(arena);
  console.log(attendance);
  console.log(playoffs);
  console.log(playoffResult);
  console.log(name);
  console.log(season);

  // const team = {
  //   name,
  //   season: "1996-97",
  //   record:
  //   seed:
  //   coach:
  //   executive:
  //   stats: {
  //     ppg:
  //     oppg:
  //     srs:
  //     pace:
  //     ortg:
  //     drtg:
  //     netrtg:
  //     expWL:
  //     arena:
  //     attendance:
  //   }
  //   playoffs: [

  //   ]
  //   playoffResult:
  //   champions: true|false
  //   roster: ["boob ryan"]
  // }
}

module.exports = getTeamSeason;
