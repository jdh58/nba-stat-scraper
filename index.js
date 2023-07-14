const getPlayer = require('./modules/getPlayer');
const getTeam = require('./modules/getTeam');
const getPlayerSeason = require('./modules/getPlayerSeason');
const getPlayerCareer = require('./modules/getPlayerCareer');
const getTeamSeason = require('./modules/getTeamSeason');

(async () => {
  const banan = await getPlayer('Lebron James');
  console.log(JSON.parse(banan));
})();

module.exports = {
  getPlayer,
  getTeam,
  getPlayerSeason,
  getPlayerCareer,
  getTeamSeason,
};
