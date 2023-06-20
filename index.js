const getPlayer = require('./modules/getPlayer');
const getTeam = require('./modules/getTeam');
const getPlayerSeason = require('./modules/getPlayerSeason');
const getPlayerCareer = require('./modules/getPlayerCareer');

(async () => {
  const banana = await getPlayer('kevin Durant');
  console.log(JSON.parse(banana));
})();
