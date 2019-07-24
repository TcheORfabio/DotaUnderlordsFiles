const getFilesFromSteamDatabase = require('./src/getFilesFromSteamDatabase');
const setHeroesFiles = require('./src/setHeroesFile');

(async function main() {
  await getFilesFromSteamDatabase();
  await setHeroesFiles('brazilian');
}());
