const getPlayer = require('./modules/getPlayer');
const getTeam = require('./modules/getTeam');
const getPlayerSeason = require('./modules/getPlayerSeason');
const getPlayerCareer = require('./modules/getPlayerCareer');
const getTeamSeason = require('./modules/getTeamSeason');

(async () => {
  const banana = await getTeamSeason('hawks', 1998);
  // console.log(JSON.parse(banana));
})();
