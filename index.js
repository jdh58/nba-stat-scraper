const getPlayer = require('./modules/getPlayer');
const getTeam = require('./modules/getTeam');

(async () => {
  const banana = await getPlayer('atlanta hawks');
  console.log(banana);
})();
