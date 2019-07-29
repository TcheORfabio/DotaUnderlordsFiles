// const getFilesFromSteamDatabase = require('./src/getFilesFromSteamDatabase');
const setHeroesFiles = require('./src/setHeroesFile');
const setItemsFiles = require('./src/setItemsFile');
const setAlliancesFile = require('./src/setAlliancesFile');

(async function main() {
  const language = 'brazilian';
  await Promise.all([
    setHeroesFiles(language),
    setItemsFiles(language),
    setAlliancesFile(language),
  ]);
}());
