// FLORIDA DAN — palette + hand-pixeled sprites. Every character is a string grid;
// NPCs are palette swaps of Dan's body (classic 16-bit trick).
'use strict';
const PAL = {
  ink: '#1a1423', inkL: '#3b2f4a',
  skin: '#eaa77e', skinD: '#b8704f', hair: '#6b3e26', hairL: '#8e5a36',
  hat: '#ff5ea8', hatD: '#c23a7d', tank: '#f4efe6', tankD: '#c9c2b4', stain: '#d9b35c',
  jorts: '#4f7bd1', jortsD: '#34569e', shades: '#141018', flip: '#ffd23f',
  grass: '#5aa83a', grassD: '#3e7f2c', grassL: '#86c94a', grassDD: '#2c5e22',
  sand: '#e8d39a', sandD: '#c9b077', mud: '#8a5a3a', mudD: '#664027', mudL: '#a8774f',
  water: '#2f8fb5', waterD: '#226f99', deep: '#174e78', waterL: '#6cc4d9', foam: '#d8f3f5',
  wood: '#a7683f', woodD: '#7a4a2b', woodL: '#c98a55',
  gator: '#557f3c', gatorD: '#34572a', gatorL: '#8fb35a', belly: '#d2cf92',
  road: '#4a4a55', roadD: '#3a3a44', line: '#f2d34a', concrete: '#b8b3a8', concreteD: '#96918a',
  red: '#e0433a', redD: '#a82c2a', orange: '#ff8a3d', yellow: '#ffd23f', purple: '#7b4bc4', neon: '#ff4fd8', teal: '#27c6b4',
  white: '#fbf7ef', grey: '#8d8a93', greyD: '#5d5a66', black: '#0c0a10', blue: '#3d6fe0', blueD: '#274ba8',
  tin: '#9fb2b8', tinD: '#6d8189', rust: '#b5562b', camo: '#6b7a3a', camoD: '#4a5528', flannel: '#c0392b', flannelD: '#7d241b',
  tan: '#c9a86b', tanD: '#9c7f48', brown: '#6b4a2e', cop: '#2d3a5c', blonde: '#ffe07a', blondeD: '#d9b441', purpleD: '#553089',
  robe: '#23202b', robeL: '#3a3545', manatee: '#8aa0b3', manateeD: '#63788c', glow: '#b8fff4',
};

const DAN_ROWS = {
  down: [
    '....oooooooo....', '...oPPPPPPPPo...', '..oPPPPPPPPPPo..', '..oPPPPPPPPPPo..', '.opppppppppppppo',
    '..ohssssssssho..', '..ohKKKssKKKho..', '..ohsssSSsssho..', '..ohshhhhhhsho..', '..ohhsssssshho..',
    '...ohhsssshho...', '..osWWWWWWWWso..', '.osSWWWWWWWWSso.', '.osoWWWyWWWWoso.', '.osoWWWWWWyWoso.',
    '.oSowWWWWWWwoSo.', '..soBBBBBBBBos..', '...oBBBBBBBBo...', '...oBBBooBBBo...', '....osso.osso...', '...offfo.offfo..', '....ooo...ooo...'],
  up: [
    '....oooooooo....', '...oPPPPPPPPo...', '..oPPPPPPPPPPo..', '..oPPPpPPpPPPo..', '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '...ohhhhhhhho...',
    '...ohhhhhhhho...', '..osWWhhhhWWso..', '.osSWWWWWWWWSso.', '.osoWWWWWWWWoso.', '.osoWWWWWWWWoso.',
    '.oSowWWWWWWwoSo.', '..soBBBBBBBBos..', '...oBBBBBBBBo...', '...oBBBooBBBo...', '....osso.osso...', '...offfo.offfo..', '....ooo...ooo...'],
  right: [
    '.....oooooo.....', '....oPPPPPPo....', '...oPPPPPPPPo...', '...oPPPPPPPPo...', '...opppppppppppo',
    '...ohhhsssssso..', '...ohhhsKKKKKo..', '...ohhsssssssso.', '...ohhsshhhhso..', '...ohhhssssso...',
    '....ohhsssso....', '....oWWWWWWo....', '...oWWWWWWWWo...', '...oWWWsWWyWWo..', '...oWWWsWWWWWWo.',
    '...owWWsWWWWWwo.', '....oBBBBBBBBo..', '....oBBBBBBBo...', '....oBBBoBBBo...', '.....osso.osso..', '.....offfoofffo.', '......ooo..ooo..'],
};
const WALK_B = {
  down: ['....osso..oso...', '...offfo..offo..', '....ooo....oo...'],
  up: ['....osso..oso...', '...offfo..offo..', '....ooo....oo...'],
  right: ['....osso...osso.', '...offfo...offfo', '....ooo.....ooo.'],
};
const DAN_KEY = { o: 'ink', P: 'hat', p: 'hatD', h: 'hair', s: 'skin', S: 'skinD', K: 'shades', W: 'tank', w: 'tankD', y: 'stain', B: 'jorts', b: 'jortsD', f: 'flip' };

// palette swaps: same body, different Florida
const SWAPS = {
  dan: {},
  merle: { hat: PAL.camo, hatD: PAL.camoD, tank: PAL.flannel, tankD: PAL.flannelD, stain: PAL.flannelD, jorts: PAL.blueD, hair: PAL.grey, shades: PAL.skin, flip: PAL.brown },
  rhonda: { hat: PAL.tan, hatD: PAL.tanD, tank: PAL.tan, tankD: PAL.tanD, stain: PAL.yellow, jorts: PAL.cop, hair: PAL.brown, flip: PAL.black },
  darlene: { hat: PAL.blonde, hatD: PAL.blondeD, tank: PAL.purple, tankD: PAL.purpleD, stain: PAL.neon, jorts: PAL.greyD, hair: PAL.blondeD, shades: PAL.neon, skin: '#f2b48f', flip: PAL.neon },
  judge: { hat: PAL.white, hatD: PAL.grey, tank: PAL.robe, tankD: PAL.robeL, stain: PAL.robeL, jorts: PAL.robe, hair: PAL.white, shades: PAL.skin, flip: PAL.black },
  kayden: { hat: PAL.teal, hatD: '#1b8f83', tank: PAL.purple, tankD: PAL.purpleD, stain: PAL.neon, jorts: PAL.black, hair: PAL.blonde, shades: PAL.skin, skin: '#f2c29a', flip: PAL.white },
  pam: { hat: PAL.tan, hatD: PAL.tanD, tank: PAL.teal, tankD: '#1b8f83', stain: PAL.white, jorts: PAL.tan, hair: PAL.grey, shades: PAL.skin, flip: PAL.brown },
  kevin: { hat: PAL.greyD, hatD: PAL.inkL, tank: PAL.mudL, tankD: PAL.mud, stain: PAL.mudD, jorts: PAL.greyD, hair: PAL.hairL, shades: PAL.skin, skin: '#d9a07a', flip: PAL.black },
  // ---- Miami ----
  abuela: { hat: PAL.grey, hatD: PAL.greyD, tank: PAL.red, tankD: PAL.redD, stain: PAL.yellow, jorts: PAL.red, hair: PAL.white, shades: PAL.skin, skin: '#d99a74', flip: PAL.black },
  dj: { hat: PAL.neon, hatD: PAL.hat, tank: PAL.white, tankD: PAL.tankD, stain: PAL.neon, jorts: PAL.white, hair: PAL.neon, shades: PAL.teal, skin: '#c98a62', flip: PAL.white },
  raul: { hat: PAL.yellow, hatD: PAL.orange, tank: PAL.teal, tankD: '#1b8f83', stain: PAL.yellow, jorts: PAL.neon, hair: PAL.black, shades: PAL.shades, skin: '#b8764f', flip: PAL.neon },
  sheila: { hat: PAL.white, hatD: PAL.tankD, tank: PAL.hat, tankD: PAL.hatD, stain: PAL.white, jorts: PAL.hat, hair: PAL.orange, shades: PAL.shades, skin: '#f2b48f', flip: PAL.white },
  rocket: { hat: PAL.hair, hatD: PAL.hairL, tank: PAL.teal, tankD: '#1b8f83', stain: PAL.hat, jorts: '#e9e2d0', hair: PAL.hair, shades: PAL.shades, flip: PAL.white },
  tubbs: { hat: PAL.black, hatD: PAL.inkL, tank: PAL.white, tankD: PAL.tankD, stain: PAL.teal, jorts: PAL.white, hair: PAL.black, shades: PAL.shades, skin: '#8a5a3a', skinD: '#6b4428', flip: PAL.black },
  vega: { hat: PAL.black, hatD: PAL.inkL, tank: PAL.robe, tankD: PAL.robeL, stain: PAL.robeL, jorts: PAL.robe, hair: PAL.black, shades: PAL.skin, skin: '#c98a62', flip: PAL.black },
  goon: { hat: PAL.black, hatD: PAL.inkL, tank: PAL.black, tankD: PAL.inkL, stain: PAL.inkL, jorts: PAL.black, hair: PAL.black, shades: PAL.shades, flip: PAL.black },
  valet: { hat: PAL.red, hatD: PAL.redD, tank: PAL.red, tankD: PAL.redD, stain: PAL.yellow, jorts: PAL.black, hair: PAL.black, flip: PAL.black },
  dansuit: { tank: '#7fe0d6', tankD: PAL.teal, stain: PAL.hat, jorts: '#f3eee0' },   // Dan, undercover, pastel
  tourist: { hat: PAL.white, hatD: PAL.tankD, tank: PAL.teal, tankD: '#1b8f83', stain: PAL.yellow, jorts: PAL.tankD, skin: '#ff9d8a', skinD: '#e0685a', hair: PAL.blonde },
};

const SPR = {};
function bakeRows(rows, key, pal, flip) {
  const w = rows[0].length, h = rows.length, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  rows.forEach((row, y) => { for (let i = 0; i < w; i++) { const k = key[row[i]]; if (!k) continue; x.fillStyle = pal[k] || PAL[k] || k; x.fillRect(flip ? w - 1 - i : i, y, 1, 1); } });
  return c;
}
function bakePerson(name) {
  const pal = Object.assign({}, PAL, SWAPS[name]), out = {};
  for (const dir of ['down', 'up', 'right']) {
    const a = DAN_ROWS[dir], b = a.slice(0, 19).concat(WALK_B[dir]);
    out[dir] = [bakeRows(a, DAN_KEY, pal), bakeRows(b, DAN_KEY, pal)];
    if (dir === 'right') out.left = [bakeRows(a, DAN_KEY, pal, true), bakeRows(b, DAN_KEY, pal, true)];
  }
  if (name === 'merle') for (const fr of out.down) { const g = fr.getContext('2d'); g.fillStyle = PAL.ink; g.fillRect(5, 6, 1, 1); g.fillRect(10, 6, 1, 1); g.fillStyle = PAL.grey; g.fillRect(4, 8, 8, 3); }
  if (name === 'judge') for (const fr of out.down) { const g = fr.getContext('2d'); g.fillStyle = PAL.ink; g.fillRect(5, 6, 1, 1); g.fillRect(10, 6, 1, 1); }
  return out;
}

// small critters + things, as string art
const CRITTERS = {
  raccoon: { key: { o: 'ink', g: 'grey', d: 'greyD', w: 'white', k: 'black' }, rows: [
    '.oo......oo.', 'ogdo....odgo', 'oggoooooogo.', 'owkkwggwkkwo', 'owkwwggwwkwo', '.oggwkkwggo.', '..oggggggo..', '.oggggggggoo', 'ogggggggggdo', 'ogdogggodgdo', '.oo.ooo.oo..'] },
  iguana: { key: { o: 'ink', g: 'gatorL', d: 'gator', r: 'orange', k: 'black' }, rows: [
    '.......oo...', '..ooooogkoo.', '.oggdgdggggo', 'oddgdgdggggo', '.orrooooddo.', '..o.o..o.o..'] },
  pelican: { key: { o: 'ink', w: 'white', g: 'grey', y: 'yellow', r: 'orange', k: 'black' }, rows: [
    '....ooo.......', '...owwwo......', '...owkwoooooo.', '...owwwyyyyyyo', '...owwoorrrro.', '..owwwo.oooo..', '.owwwwwo......', 'owwgggwwo.....', 'owggggwwwo....', '.owwwwwwwo....', '..ooooyoo.....', '....o..o......'] },
  cow: { key: { o: 'ink', w: 'white', k: 'black', p: 'hat', g: 'grey' }, rows: [
    '..oo..............oo', '.owwoooooooooooooowo', '.owkkwwwwwkkkwwwwwo.', 'owkkkwwwwwkkkkwwwwo.', 'owwkwwwwwwwkkwwwwwwo', '.owwwwwkkwwwwwwwkko.', '.owwwwkkkkwwwwwwwwo.', '..owwwwwwwwwwwwwwo..', '..owo.owo...owo.owo.', '..oko.oko...oko.oko.'] },
  flamingo: { key: { o: 'ink', p: 'hat', d: 'hatD', k: 'black', y: 'yellow' }, rows: [
    '...ooo..', '..oppko.', '..opooyo', '...op...', '...op...', '..opp...', '.opppoo.', 'oppppppo', '.oppppo.', '..oooo..', '...o....', '...o....', '...o....', '..ooo...'] },
  mushroom: { key: { o: 'ink', r: 'red', w: 'white', t: 'tankD' }, rows: [
    '..oooo..', '.orwrro.', 'orrrwrro', 'owrrrrwo', '.oooooo.', '..owwo..', '..owto..', '..oooo..'] },
  cowpie: { key: { o: 'ink', m: 'mud', d: 'mudD' }, rows: ['..ooo...', '.ommmoo.', 'ommdmmmo', 'ommmmdmo', '.oooooo.'] },
  skunkape: { key: { o: 'ink', h: '#5b4a33', l: '#7a6545', y: '#ffe066', m: '#2a1f14' }, rows: [
    '......oooooo......', '....oohhhhhhoo....', '...ohhhhhhhhhho...', '...ohhyyhhyyhho...', '...ohhhhhhhhhho...', '...ohhhmmmmhhho...',
    '..ohhhhlhhlhhhho..', '.ohhhhlhhhhlhhhho.', 'ohhhhhhhhhhhhhhhho', 'ohhohhhhlhhhhhohho', 'ohhohhhlhhlhhhohho', 'ohhohhhhhhhhhhohho',
    'ohhoohhhhhhhhoohho', '.hh..ohhhhhho..hh.', '.....ohhhhhho.....', '.....ohhhhhho.....', '.....ohhooohho....', '.....ohho..ohho...',
    '.....ohho..ohho...', '....ohhho..ohhho..', '....ooooo..ooooo..'] },
  footprint: { key: { o: '#3a2f22' }, rows: ['.oo..', 'oooo.', '.ooo.', '..o..', '.oo..'] },
  manatee: { key: { o: 'ink', m: 'manatee', d: 'manateeD', k: 'black', g: 'glow', w: 'white' }, rows: [
    '......oooooooooo........', '....oommmmmmmmmmoo......', '...ommmmmmmmmmmmmmo.....', '..ommmmmmmmmmmmmmmmoo...', '.okmmmmmmmmmmmmmmmmmmo..',
    'ommmmdmmmmmmmmmmmmmmmmoo', 'owwmmmmmmdmmmmmmmmmmmddo', '.ommmmmmmmmmmmmmmmmmdddo', '..oodmmmoommmmmmmmoodddo', '....ooooo.oooooooo..ooo.'] },
};

// item icons (10x10) — baked to data URLs for the DOM hotbar too
const ICONS = {
  beer: { key: { o: 'ink', s: 'tin', d: 'tinD', b: 'blue', w: 'white', r: 'red' }, rows: [
    '...oooo...', '..odsssod.', '..osssso..', '..obbbbo..', '..obwwbo..', '..obrrbo..', '..obwwbo..', '..obbbbo..', '..osssso..', '...oooo...'] },
  cig: { key: { o: 'ink', r: 'red', w: 'white', y: 'yellow' }, rows: [
    '..........', '.oooooooo.', '.orrrrrro.', '.orwwwwro.', '.owrrrrwo.', '.owwwwwwo.', '.owywywwo.', '.owwwwwwo.', '.oooooooo.', '..........'] },
  joint: { key: { o: 'ink', w: 'white', g: 'grassL', r: 'orange', s: 'grey' }, rows: [
    '........s.', '.......s..', '......or..', '.....owo..', '....owwo..', '...owgwo..', '..owwwo...', '.owwwo....', '.ooo......', '..........'] },
  shroom: { key: { o: 'ink', r: 'red', w: 'white', t: 'tankD' }, rows: [
    '..........', '...oooo...', '..orwrro..', '.orrrrwro.', '.owrrrrro.', '..oooooo..', '...owwo...', '...owto...', '...oooo...', '..........'] },
  powder: { key: { o: 'ink', w: 'white', g: 'tankD', c: 'teal' }, rows: [
    '..........', '..oooooo..', '..owwwwo..', '.owwwwwwo.', '.owwwwwwo.', '.ogwwwwgo.', '.occccccо.'.replace('о', 'o'), '.ocwcwcco.', '.oooooooo.', '..........'] },
  hotdog: { key: { o: 'ink', b: 'sandD', r: 'redD', y: 'yellow', s: 'sand' }, rows: [
    '..........', '..........', '..oooooo..', '.osssssso.', 'orrrrrrrro', 'oryryryrro', 'orrrrrrrro', '.obbbbbbo.', '..oooooo..', '..........'] },
  energy: { key: { o: 'ink', g: 'gatorL', k: 'black', n: 'neon', s: 'tin' }, rows: [
    '...oooo...', '..osssso..', '..okkkko..', '..okngko..', '..okgnko..', '..oknnko..', '..okgnko..', '..okkkko..', '..osssso..', '...oooo...'] },
  scratch: { key: { o: 'ink', y: 'yellow', g: 'grey', r: 'red', w: 'white' }, rows: [
    '..........', 'oooooooooo', 'oyyyyyyyyo', 'oyrryggyyo', 'oyrryggyyo', 'oyyyyyyyyo', 'oyggyrryyo', 'oyggyrryyo', 'oyyyyyyyyo', 'oooooooooo'] },
  firework: { key: { o: 'ink', r: 'red', w: 'white', b: 'blue', y: 'yellow' }, rows: [
    '....y.....', '....o.....', '...ooo....', '..orrro...', '..owwwo...', '..orrro...', '..owwwo...', '..obbbo...', '..obbbo...', '..ooooo...'] },
  bait: { key: { o: 'ink', y: 'yellow', k: 'black', p: 'hat', m: 'mud' }, rows: [
    '..........', '.oooooooo.', '.okkkkkko.', '.oyyyyyyo.', '.oypppyyo.', '.oyyyppyo.', '.oyyyyyyo.', '.oyyyyyyo.', '..oooooo..', '..........'] },
  fish: { key: { o: 'ink', g: 'grassD', b: 'belly', k: 'black' }, rows: [
    '..........', '..........', '...oooo...', 'o.oggggo..', 'oooggkggo.', 'ogggggggo.', 'ooobbbbbo.', 'o.obbbbo..', '...oooo...', '..........'] },
  cash: { key: { o: 'ink', g: 'grassL', d: 'grassD' }, rows: [
    '..........', '..........', 'oooooooooo', 'ogggggdggo', 'ogdggdgdgo', 'oggdddggdo', 'ogdggdgdgo', 'ogggggdggo', 'oooooooooo', '..........'] },
  lettuce: { key: { o: 'ink', g: 'grassL', d: 'grass', w: 'white' }, rows: [
    '..........', '...oooo...', '..oggdgo..', '.ogdgggdo.', '.oggwggdo.', '.odggdggo.', '.oggdgggo.', '..odggdo..', '...oooo...', '..........'] },
  trash: { key: { o: 'ink', g: 'grey', d: 'greyD', w: 'white' }, rows: [
    '..........', '...oooo...', '..owwwwo..', '.owgwwgwo.', '.owwwwwwo.', '.owgwgwwo.', '.owwwwwwo.', '..odddo...', '...ooo....', '..........'] },
  pool: { key: { o: 'ink', b: 'blue', w: 'white', y: 'yellow' }, rows: [
    '..........', '..........', '.oooooooo.', 'obbwbbwbbo', 'obbbbbbbbo', 'oyyyyyyyyo', '.oooooooo.', '..........', '..........', '..........'] },
  jorts: { key: { o: 'ink', b: 'black', g: 'greyD' }, rows: [
    '..........', '.oooooooo.', '.obbbbbbo.', '.obbggbbo.', '.obbbbbbo.', '.obbo.bbo.', '.obbo.bbo.', '.oooo.ooo.', '..........', '..........'] },
  rollerdog: { key: { o: 'ink', s: 'tin', r: 'redD', y: 'yellow', g: 'greyD' }, rows: [
    '..........', '.oooooooo.', '.ossssss o'.replace(' ', 's'), '.orrrrrro.', '.oyyyyyyo.', '.orrrrrro.', '.ossssss o'.replace(' ', 's'), '.oggggggo.', '.oooooooo.', '..........'] },
  sign: { key: { o: 'ink', r: 'red', w: 'white', g: 'grey' }, rows: [
    '..oooooo..', '.orrrrrro.', 'orrrrrrrro', 'orwwrwwrro', 'orrwrwrrro', 'orwwrwwrro', 'orrrrrrrro', '.orrrrrro.', '..oooooo..', '....oo....'] },
};

function bakeAll() {
  for (const n of Object.keys(SWAPS)) SPR[n] = bakePerson(n);
  for (const [n, d] of Object.entries(CRITTERS)) { SPR[n] = bakeRows(d.rows, d.key, PAL); SPR[n + 'L'] = bakeRows(d.rows, d.key, PAL, true); }
  SPR.icons = {}; SPR.iconURL = {};
  for (const [n, d] of Object.entries(ICONS)) { const c = bakeRows(d.rows, d.key, PAL); SPR.icons[n] = c; SPR.iconURL[n] = c.toDataURL(); }
}
