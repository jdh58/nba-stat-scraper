const cheerio = require('cheerio');
const pretty = require('pretty');

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
  const coach = [];
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
      // Handle multiple coach scenario
      if (elementData.find('a').length > 1) {
        elementData.find('a').each((index, element) => {
          const coachText = $(element).text();
          coach.push(coachText);
        });
      } else {
        coach.push(elementData.find('a').text());
      }
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

  const rosterRows = $('#roster > tbody > tr');
  const roster = [];

  rosterRows.each((index, element) => {
    const elementData = $(element);

    roster.push({
      name: elementData.find('[data-stat="player"]').text(),
      position: elementData.find('[data-stat="pos"]').text(),
      height: elementData.find('[data-stat="height"]').text(),
      weight: parseInt(elementData.find('[data-stat="weight"]').text()),
      birthDate: new Date(elementData.find('[data-stat="birth_date"]').text()),
      birthCountry: elementData.find('[data-stat="birth_country"]').text(),
      yearsExperience:
        // Rookies are listed as 'R', a special case. We will replace with 0
        elementData.find('[data-stat="years_experience"]').text() === 'R'
          ? 0
          : parseInt(elementData.find('[data-stat="years_experience"]').text()),
      college: elementData.find('[data-stat="college"]').text(),
    });
  });

  // Save the total stats. Let the user divide if they want
  /* This is the stupidest bug I've ever faced. It's commented out here,
  so I have to uncomment the stats and THEN I can use them */
  const teamStatHTML = $('#content > #all_team_and_opponent')
    .html()
    .replace(/<!--|-->/g, '');
  const teamStatCheerio = cheerio.load(teamStatHTML);
  const teamStats = teamStatCheerio('#team_and_opponent > tbody')
    .first()
    .find('tr')
    .first();

  const stats = {
    g: parseInt(teamStats.find('[data-stat="g"]').text()),
    mp: parseInt(teamStats.find('[data-stat="mp"]').text()),
    fg: parseInt(teamStats.find('[data-stat="fg"]').text()),
    fga: parseInt(teamStats.find('[data-stat="fga"]').text()),
    fg_pct: parseFloat(teamStats.find('[data-stat="fg_pct"]').text()),
    fg3: parseInt(teamStats.find('[data-stat="fg3"]').text()),
    fg3a: parseInt(teamStats.find('[data-stat="fg3a"]').text()),
    fg3_pct: parseFloat(teamStats.find('[data-stat="fg3_pct"]').text()),
    fg2: parseInt(teamStats.find('[data-stat="fg2"]').text()),
    fg2a: parseInt(teamStats.find('[data-stat="fg2a"]').text()),
    fg2_pct: parseFloat(teamStats.find('[data-stat="fg2_pct"]').text()),
    ft: parseInt(teamStats.find('[data-stat="ft"]').text()),
    fta: parseInt(teamStats.find('[data-stat="fta"]').text()),
    ft_pct: parseFloat(teamStats.find('[data-stat="ft_pct"]').text()),
    orb: parseInt(teamStats.find('[data-stat="orb"]').text()),
    drb: parseInt(teamStats.find('[data-stat="drb"]').text()),
    trb: parseInt(teamStats.find('[data-stat="trb"]').text()),
    ast: parseInt(teamStats.find('[data-stat="ast"]').text()),
    stl: parseInt(teamStats.find('[data-stat="stl"]').text()),
    blk: parseInt(teamStats.find('[data-stat="blk"]').text()),
    tov: parseInt(teamStats.find('[data-stat="tov"]').text()),
    pf: parseInt(teamStats.find('[data-stat="pf"]').text()),
    pts: parseInt(teamStats.find('[data-stat="pts"]').text()),
  };

  const opponentStats = teamStatCheerio('#team_and_opponent > tbody')
    .last()
    .find('tr')
    .first();
  const oppStats = {
    g: parseInt(opponentStats.find('[data-stat="g"]').text()),
    mp: parseInt(opponentStats.find('[data-stat="mp"]').text()),
    fg: parseInt(opponentStats.find('[data-stat="opp_fg"]').text()),
    fga: parseInt(opponentStats.find('[data-stat="opp_fga"]').text()),
    fg_pct: parseFloat(opponentStats.find('[data-stat="opp_fg_pct"]').text()),
    fg3: parseInt(opponentStats.find('[data-stat="opp_fg3"]').text()),
    fg3a: parseInt(opponentStats.find('[data-stat="opp_fg3a"]').text()),
    fg3_pct: parseFloat(opponentStats.find('[data-stat="opp_fg3_pct"]').text()),
    fg2: parseInt(opponentStats.find('[data-stat="opp_fg2"]').text()),
    fg2a: parseInt(opponentStats.find('[data-stat="opp_fg2a"]').text()),
    fg2_pct: parseFloat(opponentStats.find('[data-stat="opp_fg2_pct"]').text()),
    ft: parseInt(opponentStats.find('[data-stat="opp_ft"]').text()),
    fta: parseInt(opponentStats.find('[data-stat="opp_fta"]').text()),
    ft_pct: parseFloat(opponentStats.find('[data-stat="opp_ft_pct"]').text()),
    orb: parseInt(opponentStats.find('[data-stat="opp_orb"]').text()),
    drb: parseInt(opponentStats.find('[data-stat="opp_drb"]').text()),
    trb: parseInt(opponentStats.find('[data-stat="opp_trb"]').text()),
    ast: parseInt(opponentStats.find('[data-stat="opp_ast"]').text()),
    stl: parseInt(opponentStats.find('[data-stat="opp_stl"]').text()),
    blk: parseInt(opponentStats.find('[data-stat="opp_blk"]').text()),
    tov: parseInt(opponentStats.find('[data-stat="opp_tov"]').text()),
    pf: parseInt(opponentStats.find('[data-stat="opp_pf"]').text()),
    pts: parseInt(opponentStats.find('[data-stat="opp_pts"]').text()),
  };

  // console.log(wins);
  // console.log(losses);
  // console.log(seed);
  // console.log(coach);
  // console.log(executive);
  // console.log(ppg);
  // console.log(oppg);
  // console.log(srs);
  // console.log(pace);
  // console.log(oRtg);
  // console.log(dRtg);
  // console.log(netRtg);
  // console.log(expW);
  // console.log(expL);
  // console.log(preseasonOdds);
  // console.log(overUnder);
  // console.log(arena);
  // console.log(attendance);
  // console.log(playoffs);
  // console.log(playoffResult);
  // console.log(name);
  // console.log(season);
  // console.log(roster);
  // console.log(stats);
  // console.log(oppStats);
  console.log(stats);
  console.log(oppStats);

  const team = {
    name,
    season,
    wins,
    losses,
    seed,
    coach,
    executive,
    stats,
    oppStats,
    playoffs,
    playoffResult,
    roster,
  };

  return JSON.stringify(team);
}

module.exports = getTeamSeason;
