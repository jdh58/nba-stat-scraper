const getPlayer = require('./modules/getPlayer');

(async () => {
  const banana = await getPlayer('kevin durant');
  console.log(JSON.parse(banana));
})();
