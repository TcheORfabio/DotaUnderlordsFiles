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
        .replace(/\{[d|s]:(\w*)\}/g, (match, p1) => {
          const desc = item[1][p1]
            ? JSON.stringify(item[1][p1])
            : JSON.stringify(item[1].global[Object.keys(item[1].global)[0]][p1]);

          return desc;
        });

      const type = dac[`dac_item_tooltip_item_type_${item[1].type.replace('equipment_', '')}`];
      const lore = dac[`${item[1].displayName.substring(1)}_lore`];

      return [item[0], {
        displayName,
        id,
        tier,
        description,
        lore,
        type,
      }];
    })
    .reduce((obj, current) => {
      obj[current[0]] = current[1];
      return obj;
    }, {});

  await fs.writeFile(path.normalize(`./src/data_files/items_${language}.json`), JSON.stringify(items, null, 2));
  console.log(`Arquivo items_${language}.json atualizado com sucesso!`);
  return true;
};
