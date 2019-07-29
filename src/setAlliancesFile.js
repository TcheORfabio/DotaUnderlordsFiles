/* eslint-disable no-param-reassign */
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

module.exports = async (language) => {
  const synergiesUrl = 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/pak01_dir/scripts/synergies.json';

  const localizationUrl = `https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/panorama/localization/dac_${language}.txt`;

  const [
    { data: synergiesFile },
    { data: localizationFile },
  ] = await Promise.all([
    axios.get(synergiesUrl),
    axios.get(localizationUrl),
  ]);

  const dac = localizationFile.match(/"([^"]*)"/img)
    .slice(1)
    .map(string => string.replace(/"/g, ''))
    .reduce((obj, value, index, array) => {
      if (value.search(/^\s*dac_synergy/i) !== -1) {
        obj[value] = array[index + 1];
      }
      return obj;
    }, {});

  const alliances = Object.entries(synergiesFile)
    .map((alliance) => {
      const displayName = dac[`DAC_Synergy_${alliance[0]}`];
      const levels = alliance[1].levels.length;
      const description = [
        dac[`DAC_Synergy_Desc_${alliance[0]}_1`],
        dac[`DAC_Synergy_Desc_${alliance[0]}_2`],
        dac[`DAC_Synergy_Desc_${alliance[0]}_3`],
      ]
        .filter(desc => desc !== undefined)
        .map((desc, index) => desc.replace(/\{s:(\w*)\}/g, (match, p1) => (typeof alliance[1][p1] === typeof []
          ? JSON.stringify(alliance[1][p1][index])
          : JSON.stringify(alliance[1][p1]))));

      return [alliance[0], {
        displayName,
        levels,
        description,
      }];
    })
    .reduce((obj, current) => {
      // eslint-disable-next-line prefer-destructuring
      obj[current[0]] = current[1];
      return obj;
    }, {});

  await fs.writeFile(path.normalize(`./src/data_files/alliances_${language}.json`), JSON.stringify(alliances, null, 2));
  console.log('Arquivo alliances.json atualizado com sucesso!');
  return true;
};
