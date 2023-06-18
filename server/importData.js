import fs from 'fs/promises';
import Player from './models/Player';
import { stat } from 'fs';

// USE INSTRUCTIONS: Update file contents and year stats are saving to
async function importNBARegulatSeasonData(req, res, next) {
  const fileContents = await fs.readFile(
    './assets/2022-23_NBA_REG.csv',
    'utf-8'
  );

  // Use regex to get all variants of newline to split
  const fileLines = fileContents.split(/\r?\n/);

  // console.log(fileLines);

  // For each line, split it by commas then put it into the DB based off the stats

  fileLines.forEach(async (line) => {
    // Remove all quotes from the string and split it by commas into an array
    line = line.replace(/"/g, '');
    const statsArray = line.split(',');

    console.log(statsArray);

    // First, check if this player already has a document
    const existingPlayer = await Player.findOne({ name: statsArray[1] });

    // If they have a document, update the stats with the current year
    if (existingPlayer) {
      /* Check if they already have stats for this season. */
      if (existingPlayer.stats['2022-23']) {
        /* If they do, that means they have been on multiple teams and we must merge their stats */
        const currentStats = existingPlayer.stats['2022-23'].stats;

        const newGP = statsArray[5];
        const totalGP = currentStats.gp + newGP;

        const perGameTotal = (oldStat, newStat) =>
          (oldStat * currentStats.gp + newStat * newGP) / totalGP;

        const totalMPG = perGameTotal(currentStats.mpg, statsArray[6]);
        const totalUSGP = perGameTotal(currentStats.usgP, statsArray[7]);
        const totalTOP = perGameTotal(currentStats.toP, statsArray[8]);
        const totalPPG = perGameTotal(currentStats.ppg, statsArray[17]);
        const totalRPG = perGameTotal(currentStats.rpg, statsArray[18]);
        const totalAPG = perGameTotal(currentStats.apg, statsArray[19]);
        const totalSPG = perGameTotal(currentStats.spg, statsArray[20]);
        const totalBPG = perGameTotal(currentStats.bpg, statsArray[21]);
        const totalTPG = perGameTotal(currentStats.tpg, statsArray[22]);
        const totalORTG = perGameTotal(currentStats.ortg, statsArray[27]);
        const totalDRTG = perGameTotal(currentStats.drtg, statsArray[28]);

        const totalFTA = currentStats.fta + statsArray[9];
        const total2PA = currentStats['2pa'] + statsArray[11];
        const total3PA = currentStats['3pa'] + statsArray[13];
        const totalFTP =
          (currentStats.ftP * currentStats.fta +
            statsArray[10] * statsArray[9]) /
          totalFTA;
        const total2PP =
          (currentStats['2pP'] * currentStats['2pa'] +
            statsArray[12] * statsArray[11]) /
          total2PA;
        const total3PP =
          (currentStats['3pP'] * currentStats['3pa'] +
            statsArray[14] * statsArray[13]) /
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
              teams: [...currentStats.team, statsArray[2]],
              position: statsArray[3],
              age: statsArray[4],
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
        // Otherwise, fill out the player's stats for this season
        await Player.updateOne(
          { name: statsArray[1] },
          {
            'stats.2022-23': {
              teams: [statsArray[2]],
              position: statsArray[3],
              age: statsArray[4],
              gp: statsArray[5],
              mpg: statsArray[6],
              usgP: statsArray[7],
              toP: statsArray[8],
              fta: statsArray[9],
              ftP: statsArray[10],
              '2pa': statsArray[11],
              '2pP': statsArray[12],
              '3pa': statsArray[13],
              '3pP': statsArray[14],
              efgP: statsArray[15],
              tsP: statsArray[16],
              ppg: statsArray[17],
              rpg: statsArray[18],
              apg: statsArray[19],
              spg: statsArray[20],
              bpg: statsArray[21],
              tpg: statsArray[22],
              ortg: statsArray[27],
              drtg: statsArray[28],
            },
          }
        );
      }
    }
  });

  res.send('dasdasdas');
}

export default importNBARegulatSeasonData;
