import fs from 'fs/promises';
import Player from '../models/Player.js';
import NBA from 'nba';

// USE INSTRUCTIONS: Update file contents and year stats are saving to
async function importNBARegulatSeasonData(req, res, next) {
  const fileContents = await fs.readFile(
    './assets/2022-23_NBA_REG.csv',
    'utf-8'
  );

  // Use regex to get all variants of newline to split
  const fileLines = fileContents.split(/\r?\n/);

  // For each line, split it by commas then put it into the DB based off the stats

  for (let i = 0; i < fileLines.length - 1; i++) {
    // Remove all quotes from the string and split it by commas into an array
    const line = fileLines[i].replace(/"/g, '');
    const statsArray = line.split(',');

    // First, check if this player already has a document
    console.log();
    const existingPlayer = await Player.findOne({ name: statsArray[1] });

    console.log('EXISTING PLAYER: ' + existingPlayer);

    // If they have a document, update the stats with the current year
    if (existingPlayer) {
      /* Check if they already have stats for this season. */
      if (existingPlayer.stats['2022-23']) {
        /* If they do, that means they have been on multiple teams and we must merge their stats */
        const currentStats = existingPlayer.stats['2022-23'];

        const newGP = parseInt(statsArray[5]);
        const totalGP = currentStats.gp + newGP;

        const perGameTotal = (oldStat, newStat) =>
          (oldStat * currentStats.gp + newStat * newGP) / totalGP;

        const totalMPG = perGameTotal(
          currentStats.mpg,
          parseFloat(statsArray[6])
        );
        const totalPPG = perGameTotal(
          currentStats.ppg,
          parseFloat(statsArray[17])
        );
        const totalRPG = perGameTotal(
          currentStats.rpg,
          parseFloat(statsArray[18])
        );
        const totalAPG = perGameTotal(
          currentStats.apg,
          parseFloat(statsArray[19])
        );
        const totalSPG = perGameTotal(
          currentStats.spg,
          parseFloat(statsArray[20])
        );
        const totalBPG = perGameTotal(
          currentStats.bpg,
          parseFloat(statsArray[21])
        );
        const totalTPG = perGameTotal(
          currentStats.tpg,
          parseFloat(statsArray[22])
        );

        /* These are rough estimations... but the best I can do with current
        info + they should be incredibly close */
        const totalUSGP = perGameTotal(
          currentStats.usgP,
          parseFloat(statsArray[7])
        );
        const totalTOP = perGameTotal(
          currentStats.toP,
          parseFloat(statsArray[8])
        );
        const totalORTG = perGameTotal(
          currentStats.ortg,
          parseFloat(statsArray[27])
        );
        const totalDRTG = perGameTotal(
          currentStats.drtg,
          parseFloat(statsArray[28])
        );

        const totalFTA = currentStats.fta + parseFloat(statsArray[9]);
        const total2PA = currentStats['2pa'] + parseFloat(statsArray[11]);
        const total3PA = currentStats['3pa'] + parseFloat(statsArray[13]);
        const totalFTP =
          (currentStats.ftP * currentStats.fta +
            parseFloat(statsArray[10]) * parseFloat(statsArray[9])) /
          totalFTA;
        const total2PP =
          (currentStats['2pP'] * currentStats['2pa'] +
            parseFloat(statsArray[12]) * parseFloat(statsArray[11])) /
          total2PA;
        const total3PP =
          (currentStats['3pP'] * currentStats['3pa'] +
            parseFloat(statsArray[14]) * parseFloat(statsArray[13])) /
          total3PA;

        // (FGM + .5 * 3PM) / FGA
        const totalFGM = total2PA * total2PP + total3PA * total3PP;
        const totalFGA = total2PA + total3PA;
        const totaleFG = (totalFGM + 0.5 * total3PA * total3PP) / totalFGA;

        // TS% = PTS / (2 * TSA)
        const totalPTS = totalPPG * totalGP;
        const totalTSA = totalFGA + 0.44 * totalFTA;
        const totalTSP = totalPTS / (2 * totalTSA);

        await Player.updateOne(
          { name: statsArray[1] },
          {
            'stats.2022-23': {
              teams: [...currentStats.teams, statsArray[2]],
              position: statsArray[3],
              age: parseFloat(statsArray[4]),
              gp: totalGP,
              mpg: totalMPG,
              usgP: totalUSGP,
              toP: totalTOP,
              fta: totalFTA,
              ftP: totalFTP,
              '2pa': total2PA,
              '2pP': total2PP,
              '3pa': total3PA,
              '3pP': total3PP,
              efgP: totaleFG,
              tsP: totalTSP,
              ppg: totalPPG,
              rpg: totalRPG,
              apg: totalAPG,
              spg: totalSPG,
              bpg: totalBPG,
              tpg: totalTPG,
              ortg: totalORTG,
              drtg: totalDRTG,
            },
          }
        );
      } else {
        /* If they exist but don't have this season's stats yet,
        fill out the player's stats for this season */
        await Player.updateOne(
          { name: statsArray[1] },
          {
            'stats.2022-23': {
              teams: [statsArray[2]],
              position: parseFloat(statsArray[3]),
              age: parseFloat(statsArray[4]),
              gp: parseInt(statsArray[5]),
              mpg: parseFloat(statsArray[6]),
              usgP: parseFloat(statsArray[7]),
              toP: parseFloat(statsArray[8]),
              fta: parseInt(statsArray[9]),
              ftP: parseFloat(statsArray[10]),
              '2pa': parseInt(statsArray[11]),
              '2pP': parseFloat(statsArray[12]),
              '3pa': parseInt(statsArray[13]),
              '3pP': parseFloat(statsArray[14]),
              efgP: parseFloat(statsArray[15]),
              tsP: parseFloat(statsArray[16]),
              ppg: parseFloat(statsArray[17]),
              rpg: parseFloat(statsArray[18]),
              apg: parseFloat(statsArray[19]),
              spg: parseFloat(statsArray[20]),
              bpg: parseFloat(statsArray[21]),
              tpg: parseFloat(statsArray[22]),
              ortg: parseFloat(statsArray[27]),
              drtg: parseFloat(statsArray[28]),
            },
          }
        );
      }
    } else {
      // This player does not exist. Let's create a new player document for them.
      console.log(statsArray[1]);

      const player = NBA.findPlayer(statsArray[1]);
      let playerId;

      if (player) {
        playerId = player.playerId;
      }

      // Find the player's NBA id, which will give us their picture
      const newPlayer = new Player({
        league: 'NBA',
        name: statsArray[1],
        picture: playerId
          ? `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId.toString()}.png`
          : '',
        stats: {
          '2022-23': {
            teams: [statsArray[2]],
            position: statsArray[3],
            age: parseFloat(statsArray[4]),
            gp: parseInt(statsArray[5]),
            mpg: parseFloat(statsArray[6]),
            usgP: parseFloat(statsArray[7]),
            toP: parseFloat(statsArray[8]),
            fta: parseInt(statsArray[9]),
            ftP: parseFloat(statsArray[10]),
            '2pa': parseInt(statsArray[11]),
            '2pP': parseFloat(statsArray[12]),
            '3pa': parseInt(statsArray[13]),
            '3pP': parseFloat(statsArray[14]),
            efgP: parseFloat(statsArray[15]),
            tsP: parseFloat(statsArray[16]),
            ppg: parseFloat(statsArray[17]),
            rpg: parseFloat(statsArray[18]),
            apg: parseFloat(statsArray[19]),
            spg: parseFloat(statsArray[20]),
            bpg: parseFloat(statsArray[21]),
            tpg: parseFloat(statsArray[22]),
            ortg: parseFloat(statsArray[27]),
            drtg: parseFloat(statsArray[28]),
          },
        },
        funFacts: {},
        nicknames: [],
        championships: 0,
        college: '.',
        pick: 0,
        country_of_birth: '.',
        birth_date: 0,
        first_year: 0,
        last_year: 0,
        playerId: playerId,
      });

      await newPlayer.save();
    }
  }

  res.send('dasdasdas');
}

export default importNBARegulatSeasonData;
