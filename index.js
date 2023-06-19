const getPlayer = require('./modules/getPlayer');

(async () => {
  const banana = await getPlayer('bill russel');
  console.log(banana);
})();
