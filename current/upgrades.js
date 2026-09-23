// FLORIDA DAN — Bubba's Bait, Boats & Bail Bonds: stuff that changes how Dan plays, and junk for the cabin.
// Upgrades are one-time buys kept in Game.flags.up; the effects are checked where the thing happens (hasUp).
'use strict';
const UPGRADES = {
  // prices: a few good days of fishing, gigs and pythons each. Some only show up once Dan's cleared a case.
  fanny: { name: 'Fanny Pack', price: 40, desc: 'Zipped tight. Raccoons can’t rob you anymore.' },
  chum: { name: 'Chum Bucket', price: 70, desc: 'Fish bite way faster. Smells like a crime scene.' },
  billy: { name: 'Big Mouth Billy Bass', price: 60, desc: 'For the cabin wall. It sings when you walk by.', cabin: true },
  neon: { name: 'Neon Beer Sign', price: 80, desc: 'For the cabin. Glows at night. Classy.', cabin: true },
  zapper: { name: 'Bug Zapper', price: 90, desc: 'For the porch. Chill drains half as fast. The zaps are soothing.', cabin: true },
  recliner: { name: 'Porch Recliner', price: 110, desc: 'Nap on the porch: skip 2 hours, get your chill back.', cabin: true },
  waders: { name: 'Gator-Proof Waders', price: 120, desc: 'Gator bites hurt half as much. Mostly.' },
  boombox: { name: 'Boombox Cooler', price: 140, desc: 'Faster cooler. Plays music. Rhonda hates it.' },
  tooth: { name: 'Gator Tooth Necklace', price: 150, desc: 'Gators think twice before biting. Chuck thinks it’s rude.', after: 'acquitted' },
  rod: { name: 'The Ugly Stick', price: 180, desc: 'Line almost never snaps, and the big ones bite.' },
  keg: { name: 'Kegerator', price: 200, desc: 'For the cabin. Wakes you up with 3 free Swamp Lites every morning.', cabin: true, after: 'acquitted' },
  lucky: { name: 'Lucky Scratch-Off Penny', price: 220, desc: 'Scratch-offs win way more often. It’s a penny from a slot machine.', after: 'case2Won' },
  scanner: { name: 'Police Scanner', price: 260, desc: 'Hear ’em coming: your ★ cool off twice as fast.', after: 'case2Won' },
  bail: { name: 'Bubba’s Bail Card', price: 300, desc: 'Busted? Flash it: walk away free, keep your stuff. Once a day.', after: 'case3Won' },
  airboat: { name: 'Airboat', price: 450, desc: 'Giant fan, zero brakes. Way faster, and it skims right over sawgrass.' },
};
for (const [k, u] of Object.entries(UPGRADES)) ITEMS[k] = { ...u, upgrade: true };
const hasUp = k => !!(Game.flags && Game.flags.up && Game.flags.up[k]);

// 10x10 icons, same recipe as the rest (art.js bakes them)
Object.assign(ICONS, {
  chum: { key: { o: 'ink', g: 'grey', r: 'red', d: 'redD' }, rows: [
    '..........', '.oooooooo.', 'oggggggggo', 'orrdrrdrro', 'ordrrrrdro', '.orrdrrro.', '.orrrrdro.', '.orrrrrro.', '..oooooo..', '..........'] },
  zapper: { key: { o: 'ink', b: 'blue', w: 'white', y: 'yellow' }, rows: [
    '....oo....', '...owwo...', '..obbbbo..', '..obwbwo..', '..obbbbo..', '..obwbwo..', '..obbbbo..', '...oyyo...', '....oo....', '..........'] },
  tooth: { key: { o: 'ink', w: 'white', t: 'tan' }, rows: [
    'o........o', '.o......o.', '..o....o..', '...tttt...', '...owwo...', '...owwo...', '....ww....', '....ow....', '.....o....', '..........'] },
  keg: { key: { o: 'ink', g: 'grey', d: 'greyD', y: 'yellow', r: 'red' }, rows: [
    '..oooooo..', '.oggggggo.', '.ogddddgo.', '.oggrrggo.', '.oggyyggo.', '.oggggggo.', '.ogddddgo.', '.oggggggo.', '..oooooo..', '..........'] },
  lucky: { key: { o: 'ink', c: 'mudL', y: 'yellow', d: 'mud' }, rows: [
    '..........', '...oooo...', '..occcco..', '.occddcco.', '.ocdccdco.', '.ocdccdco.', '.occddcco.', '..occcco..', '...oooo...', '..........'] },
  scanner: { key: { o: 'ink', k: 'black', g: 'greyD', r: 'red', y: 'yellow' }, rows: [
    '.......o..', '.......o..', '.oooooooo.', '.okkkkkko.', '.okrrkyko.', '.okkkkkko.', '.oggggggo.', '.ogkgkgko.', '.oooooooo.', '..........'] },
  bail: { key: { o: 'ink', w: 'white', y: 'yellow', r: 'red' }, rows: [
    '..........', 'oooooooooo', 'oyyyyyyyyo', 'oyrrryyyyo', 'oyyyyyyyyo', 'owwwwwwwwo', 'owrrwrrwwo', 'owwwwwwwwo', 'oooooooooo', '..........'] },
  airboat: { key: { o: 'ink', g: 'grey', d: 'greyD', w: 'white', b: 'blue' }, rows: [
    '......ooo.', '.....owdwo', '.....odwdo', '.....owdwo', '......ooo.', '.oooooooo.', 'oggggggggo', 'oddddddddo', '.oooooooo.', 'bbbbbbbbbb'] },
  rod: { key: { o: 'ink', w: 'woodL', d: 'woodD', r: 'red', g: 'grey' }, rows: [
    '.........o', '........og', '.......og.', '......og..', '.....og...', '....ow....', '...ow.....', '..orr.....', '.odd......', '.oo.......'] },
  boombox: { key: { o: 'ink', r: 'red', w: 'white', g: 'greyD', y: 'yellow' }, rows: [
    '..........', '.oooooooo.', '.orrrrrro.', '.oggoogggo', '.ogwoogwgo', '.oggoogggo', '.owwwwwwwo', '.owwyywwwo', '.oooooooo.', '..........'] },
  waders: { key: { o: 'ink', g: 'camo', d: 'camoD', b: 'black' }, rows: [
    '.oooooooo.', '.oggggggo.', '.ogg..ggo.', '.ogdo.gdo.', '.ogdo.gdo.', '.ogdo.gdo.', '.ogdo.gdo.', 'obbbooobbo', 'obbbooobbo', '.ooo..ooo.'] },
  fanny: { key: { o: 'ink', p: 'neon', t: 'teal', y: 'yellow' }, rows: [
    '..........', '..........', 'oooooooooo', '.opppppo..', 'opppppppo.', 'opyyyyypo.', 'opppppppoo', '.opppppo..', '..ooooo...', '..........'] },
  billy: { key: { o: 'ink', w: 'woodL', d: 'woodD', g: 'grassD', l: 'grassL', r: 'red' }, rows: [
    'oooooooooo', 'owwwwwwwwo', 'owoooooowo', 'owgllllgwo', 'orgggggggo', 'owgggggwwo', 'owooooooow', 'owwwwwwwwo', 'oooooooooo', '..........'] },
  neon: { key: { o: 'ink', r: 'neon', b: 'blue', k: 'black' }, rows: [
    'oooooooooo', 'okkkkkkkko', 'okrrkrrkko', 'okrkkrkrko', 'okrrkrrkko', 'okkkkkkkko', 'okbbbbbbko', 'okkkkkkkko', 'oooooooooo', '..........'] },
  mattress: { key: { o: 'ink', w: 'white', s: 'stain', b: 'tankD' }, rows: [
    '..........', 'oooooooooo', 'owwbwwbwwo', 'owswwwwwwo', 'owwbwsbwwo', 'owwwwwssso', 'owwbwwbwwo', 'oooooooooo', '..........', '..........'] },
  recliner: { key: { o: 'ink', b: 'mudL', d: 'mud', w: 'woodD' }, rows: [
    'ooo.......', 'obbo......', 'obbo......', 'obbooooo..', 'obbbbbbbo.', 'odddddddo.', 'oooooooooo', '.ow....wo.', '.oo....oo.', '..........'] },
});

const Upgrades = {
  forSale: (shop = 'bubba') => Object.keys(UPGRADES).filter(k => !hasUp(k) && (UPGRADES[k].shop || 'bubba') === shop && (!UPGRADES[k].after || Game.flags[UPGRADES[k].after])),
  buy(k) {
    Game.flags.up = Game.flags.up || {}; Game.flags.up[k] = true;
    const H = { airboat: 'FLORIDA MAN BUYS AIRBOAT; NEIGHBORS "CAN’T HEAR THEMSELVES THINK"', billy: 'FLORIDA MAN BUYS SINGING FISH, CALLS IT "HOME DECOR"', recliner: 'FLORIDA MAN INSTALLS RECLINER ON PORCH, CALLS IT "THE OFFICE"' };
    if (H[k]) headline(H[k], 1);
    save();
  },
  // what a fish is worth at Darlene's: by the pound now, so a hawg pays
  fishValue: f => f.junk || f.legend ? 0 : Math.max(3, Math.min(60, Math.round(f.lbs * 2.5))),
};

// Big Mouth Billy Bass, the neon sign and the recliner live at the cabin (added to the map, drawn only once bought)
function addCabinJunk(add) { add('billy', 15.55, 16.02, .6, .1, false); add('neonsign', 18.35, 16.02, 1, .1, false);   // hung on the front wall (sorted just in front of it)
  add('recliner', 23.2, 16.3, 1, .8, false); }
function drawCabinJunk(p, x, y, t) {
  if (p.kind === 'billy') { if (!hasUp('billy')) return true; y -= 24; const sing = Math.hypot(Game.dan.x - p.x, Game.dan.y - p.y) < 50 && Math.floor(t * 4) % 2;
    OR(x, y - 2, 12, 8, PAL.woodL); R(x + 2, y, 7, 4, PAL.grassD); R(x + 8, y + (sing ? 2 : 1), 2, sing ? 2 : 1, PAL.red); if (sing) label('♪', x + 14, y - 3, PAL.yellow, 6); return true; }
  if (p.kind === 'neonsign') { if (!hasUp('neon')) return true; y -= 25; const on = Game.hour > 18 || Game.hour < 6.5, fl = on && Math.floor(t * 3) % 11 !== 0;
    OR(x - 2, y - 4, 22, 9, PAL.black); if (fl) { g.globalAlpha = .25; R(x - 6, y - 8, 30, 17, PAL.neon); g.globalAlpha = 1; } label('BEER', x + 9, y + 3, fl ? PAL.neon : PAL.greyD, 5); return true; }
  if (p.kind === 'recliner') { if (!hasUp('recliner')) return true; shadow(x + 8, y + 12, 16);
    OR(x, y - 8, 5, 18, PAL.mudL); OR(x + 4, y + 1, 12, 7, PAL.mudL); R(x + 5, y + 2, 10, 2, PAL.mud); R(x + 1, y + 9, 2, 3, PAL.woodD); R(x + 13, y + 9, 2, 3, PAL.woodD); return true; }
  return false;
}
function recliner() {   // the nap: two hours gone, chill restored
  if (Heat.cop) return toast('Can’t nap with Rhonda on your ass.');
  if (Game.hour >= 20) return toast('Too late for a nap. That’s just sleeping.');
  Game.hour += 2; Game.chill = Math.min(100, Game.chill + 35); Game.flash = .7; Sound.play('talk');
  toast(pick(['Dan naps in the recliner. Two hours gone. Worth it.', 'Dan wakes up with a lizard on his chest. Refreshed.', 'Power nap. Mostly nap. Some power.']));
}
