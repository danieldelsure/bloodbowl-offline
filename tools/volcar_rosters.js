// Vuelca los ROSTERS del juego a tools/rosters.json (lo usa importar_tourplay.py)
const fs = require('fs'), path = require('path'), d = path.join(__dirname, '..', 'src', 'js');
const R = new Function(['01-nucleo', '02-equipos'].map(f => fs.readFileSync(path.join(d, f + '.js'), 'utf8')).join('\n') + '\nreturn ROSTERS;')();
const o = {}; for (const k in R) o[k] = { name: R[k].name, tier: R[k].tier, rr: R[k].rr, apo: R[k].apo, players: R[k].players.map(p => ({ ...p })) };
fs.writeFileSync(path.join(__dirname, 'rosters.json'), JSON.stringify(o)); console.log('rosters.json:', Object.keys(o).length, 'razas');
