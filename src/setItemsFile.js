/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

module.exports = async (language) => {
  const itemsUrl = 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/pak01_dir/scripts/items.json';

  const localizationItemsUrl = `https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/panorama/localization/dac_${language}.txt`;

  const [
    { data: itemsFile },
    { data: localizationItemsFile }] = await Promise.all([
    axios.get(itemsUrl),
    axios.get(localizationItemsUrl),
  ]);

  const dac = localizationItemsFile.match(/"([^"]*)"/img)
    .slice(1)
    .map(string => string.replace(/"/g, ''))
    .reduce((obj, value, index, array) => {
      if (value.search(/^\s*dac_item/i) !== -1) {
        obj[value] = array[index + 1];
      }
      return obj;
    }, {});

  const items = Object.entries(itemsFile)
    .map((item) => {
      const displayName = dac[item[1].displayName.substring(1)];
      const { id, tier } = item[1];
      const description = dac[item[1].description.substring(1)]
        // eslint-disable-next-line dot-notation
        .replace(/\{d:(\w*)\}/g, (match, p1) => item[1][p1]);
      const type = dac[`dac_item_tooltip_item_type_${item[1].type.replace('equipment_', '')}`];

      return [item[0], {
        displayName,
        id,
        tier,
        description,
        type,
      }];
    })
    .reduce((obj, current) => {
      obj[current[0]] = current[1];
      return obj;
    }, {});

  await fs.writeFile(path.normalize(`./src/data_files/items_${language}.json`), JSON.stringify(items, null, 2));
  console.log('Arquivo items.json atualizado com sucesso!');
  return true;
};
