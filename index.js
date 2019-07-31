// const getFilesFromSteamDatabase = require('./src/getFilesFromSteamDatabase');
const setHeroesFiles = require('./src/setHeroesFile');
const setItemsFiles = require('./src/setItemsFile');
const setAlliancesFile = require('./src/setAlliancesFile');
const languages = require('./src/languages');

(async function main() {
  languages.forEach(async lang => Promise.all([
    setHeroesFiles(lang),
    setItemsFiles(lang),
    setAlliancesFile(lang),
  ]));
}());
