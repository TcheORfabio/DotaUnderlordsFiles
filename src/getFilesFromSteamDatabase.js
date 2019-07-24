const fs = require('fs').promises;
const axios = require('axios');
const path = require('path');

module.exports = async () => {
  const urlUnits = 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/pak01_dir/scripts/units.json';
  const urlItems = 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/pak01_dir/scripts/items.json';
  const urlSynergies = 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-Underlords/master/game/dac/pak01_dir/scripts/synergies.json';
  const [units, items, synergies] = await Promise.all([
    axios.get(urlUnits),
    axios.get(urlItems),
    axios.get(urlSynergies),
  ]);
  await Promise.all([
    fs.writeFile(path.normalize('./src/downloaded files/units.json'), JSON.stringify(units.data, null, 2)),
    fs.writeFile(path.normalize('./src/downloaded files/items.json'), JSON.stringify(items.data, null, 2)),
    fs.writeFile(path.normalize('./src/downloaded files/synergies.json'), JSON.stringify(synergies.data, null, 2)),
  ]);
  return true;
};
