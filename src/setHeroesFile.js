const fs = require('fs').promises;
const axios = require('axios');
const units = require('./downloaded files/units.json');

module.exports = async (language) => {
  const localizationAbilitiesUrl = `https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/pak01_dir/resource/localization/dac_abilities_${language}.txt`;

  const localizationNamesUrl = `https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/panorama/localization/dac_${language}.txt`;

  const [{ data: abilitiesFile }, { data: dacFile }] = await Promise.all([
    axios.get(localizationAbilitiesUrl),
    axios.get(localizationNamesUrl),
  ]);

  let abilities = abilitiesFile.match(/"([^"]*)"/img)
    .map(string => string.replace(/"/g, ''));

  abilities.splice(0, 4);

  abilities = abilities.reduce((obj, value, index, array) => {
    if (value.search(/^\s*dac_/i) !== -1) {
      obj[value] = array[index + 1];
      return obj;
    }
    return obj;
  }, {});

  let dac = dacFile.match(/"([^"]*)"/img)
    .map(string => string.replace(/"/g, ''));

  dac.splice(0, 3);

  dac = dac.reduce((obj, value, index, array) => {
    if (value.search(/^\s*dac_/i) !== -1) {
      obj[value] = array[index + 1];
      return obj;
    }
    return obj;
  }, {});


  console.log(abilities);
  console.log(dac);
};
