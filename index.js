const getPlayer = require('./modules/getPlayer');
const getTeam = require('./modules/getTeam');
const getPlayerSeason = require('./modules/getPlayerSeason');
const getPlayerCareer = require('./modules/getPlayerCareer');
const getTeamSeason = require('./modules/getTeamSeason');

(async () => {
  const banana = await getTeamSeason('cavaliers', 2016);
  console.log(JSON.parse(banana));
})();

module.exports = {
  getPlayer,
  getTeam,
  getPlayerSeason,
  getPlayerCareer,
  getTeamSeason,
};
