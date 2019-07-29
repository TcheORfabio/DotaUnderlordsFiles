/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

module.exports = async (language) => {
  const unitsUrl = 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/pak01_dir/scripts/units.json';

  const localizationAbilitiesUrl = `https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/pak01_dir/resource/localization/dac_abilities_${language}.txt`;

  const localizationNamesUrl = `https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/panorama/localization/dac_${language}.txt`;

  const abilitiesUrl = 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/pak01_dir/scripts/abilities.json';

  const [
    { data: abilitiesDescFile },
    { data: dacFile },
    { data: abilitiesFile },
    { data: units }] = await Promise.all([
    axios.get(localizationAbilitiesUrl),
    axios.get(localizationNamesUrl),
    axios.get(abilitiesUrl),
    axios.get(unitsUrl),
  ]);

  const abilities = abilitiesDescFile.match(/"([^"]*)"/img)
    .map(string => string.replace(/"/g, ''))
    .slice(4)
    .reduce((obj, value, index, array) => {
      if (value.search(/^\s*dac_/i) !== -1) {
        obj[value] = array[index + 1];
        return obj;
      }
      return obj;
    }, {});

  const dac = dacFile.match(/"([^"]*)"/img)
    .map(string => string.replace(/"/g, ''))
    .slice(3)
    .reduce((obj, value, index, array) => {
      if (value.search(/^\s*dac_/i) !== -1) {
        obj[value] = array[index + 1];
        return obj;
      }
      return obj;
    }, {});

  const heroes = Object.entries(units)
    .map((hero) => {
      const abilitiesArray = hero[1].abilities
        ? hero[1].abilities.map((ability) => {
          if (!ability) return '';
          // Substituindo as partes das descrições de habilidade que variam de acordo com variáveis
          // ex.: { s: attack_speed_increase }
          const regex = new RegExp(/\{s:(\w*)\}/mi);
          let skillDescription = abilities[`dac_ability_${ability}_Description`] || '';
          let descriptionReplaced = '';
          let replaceStrings = skillDescription.search(regex);
          while (replaceStrings !== -1) {
            const match = skillDescription.match(regex) || [null];
            const replace = abilitiesFile[`${ability}`][`${match[1]}`];
            descriptionReplaced = skillDescription.replace(match[0], JSON.stringify(replace));
            skillDescription = descriptionReplaced;
            replaceStrings = skillDescription.search(regex);
          }

          return {
            name: abilities[`dac_ability_${ability}`],
            description: descriptionReplaced,
          };
        })
        : null;


      const displayName = dac[hero[1].displayName.substring(1)];
      const alliances = hero[1].keywords
        ? hero[1].keywords.split(' ').map(alliance => dac[`dac_hero_type_${alliance}`])
        : null;

      return [hero[0], {
        displayName,
        id: hero[1].id,
        alliances,
        abilities: abilitiesArray,
        armor: hero[1].armor,
        attackRange: hero[1].attackRange,
        attackRate: hero[1].attackRate,
        damageMin: hero[1].damageMin,
        damageMax: hero[1].damageMax,
        draftTier: hero[1].draftTier,
        goldCost: hero[1].goldCost,
        health: hero[1].health,
        magicResist: hero[1].magicResist,
        maxMana: hero[1].maxmana,
        moveSpeed: hero[1].movespeed,
      }];
    })
    .reduce((obj, current) => {
      obj[current[0]] = current[1];
      return obj;
    }, {});

  await fs.writeFile(path.normalize(`./src/data_files/heroes_${language}.json`), JSON.stringify(heroes, null, 2));
  console.log('Arquivo heroes.json atualizado com sucesso!');
  return true;
};
