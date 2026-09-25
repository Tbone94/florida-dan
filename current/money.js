// FLORIDA DAN — ways to spend it: bribing the Gazette to bury a headline, slipping a cop cash when you're busted,
// the metal detector (beach loot), the Miami surf shack, and the Miami side gigs.
'use strict';

// ---------- the Swamp Gazette box: pay to bury one of today's headlines ----------
const Bribe = {
  cost: text => 10 + (Game.day_.allege && Game.day_.allege[text] || 5) * 4,
  open() {
    const hs = (Game.day_.headlines || []).slice(-3).reverse();
    if (!hs.length) return say([['', 'Dan peers into the Swamp Gazette box. Nothing about him today.'], ['DAN', 'Huh. Weird. Feels bad, actually.']]);
    say([['', 'Dan folds some cash into the Gazette box with a note that says “please.”'], ['GAZETTE', 'WHICH STORY DO YOU WANT GONE?', [
      ...hs.map(h => [`Bury “${h.length > 24 ? h.slice(0, 22) + '…' : h}” ($${Bribe.cost(h)})`, () => Bribe.bury(h)]),
      ['Never mind', () => [['DAN', 'Let the people have their news.']]]]]]);
  },
  bury(h) {
    const c = Bribe.cost(h); if (Game.money < c) return [['GAZETTE', `That’s $${c}. You have $${Game.money}. The press cannot be bought for less.`]];
    const a = (Game.day_.allege && Game.day_.allege[h]) || 5;
    Game.money -= c; Game.day_.headlines = Game.day_.headlines.filter(x => x !== h);
    const i = Game.headlines.map(x => x.text).lastIndexOf(h); if (i >= 0) Game.headlines.splice(i, 1);   // off the front page, out of the court's evidence pile
    Game.allegations = Math.max(0, Game.allegations - a * 2); Game.heat = Math.max(0, (Game.heat || 0) - 3);   // buried AND spun: worth more than the story cost you
    if (Heat.cop && Game.heat < 2.9) { Heat.end(); toast('RADIO: ...all units, disregard. Nothing to see. Per the Gazette.', 3); }
    Sound.play('cash');
    return [['', 'The story vanishes. Nobody will ever know. Except Dan. And the Gazette. And the $' + c + '.'], ['DAN', pick(['Journalism is dead. I killed it. Worth it.', 'Freedom of the press? More like freedom of the... less.', 'That’s called damage control, baby.'])]];
  },
};

// ---------- the metal detector: beep your way to buried beach loot ----------
const LOOT = [[.46, 'coins'], [.2, 'junk'], [.12, 'watch'], [.14, 'ring'], [.08, 'doubloon']];
const Detector = {
  spots() {   // six buried things per beach, per day
    const L = Game.day_.loot || (Game.day_.loot = {}); if (L[Game.region]) return L[Game.region];
    const out = [], r = rng(Game.day * 31 + Game.region.length * 7);
    for (let i = 0, k = 0; out.length < 6 && k < 3000; k++) { const x = Math.floor(r() * MW), y = Math.floor(r() * MH); if (World.tile(x, y) === T.SAND && !World.solidAt((x + .5) * TS, (y + .5) * TS)) out.push({ x: (x + .5) * TS, y: (y + .5) * TS }); }
    return L[Game.region] = out;
  },
  on: () => hasUp('detector') && !Game.dan.ride && World.at(Game.dan.x, Game.dan.y) === T.SAND,
  nearest() { const D = Game.dan; let best = null, bd = 1e9; for (const s of Detector.spots()) { const d = Math.hypot(s.x - D.x, s.y - D.y); if (d < bd) { bd = d; best = s; } } return [best, bd]; },
  tick(dt) {
    if (!Detector.on()) return; const [, d] = Detector.nearest(); if (d > 110) return;
    Detector.t = (Detector.t || 0) - dt;
    if (Detector.t <= 0) { Detector.t = .12 + d / 110 * .9; Sound.tone(1300 + (110 - d) * 6, .05, 'square', .05); Game.parts.push({ kind: 'text', x: Game.dan.x + 10, y: Game.dan.y - 26, vx: 0, vy: -10, life: .4, text: '·' }); }
  },
  interaction() {
    if (!Detector.on()) return null; const [s, d] = Detector.nearest(); if (!s || d > 11) return null;
    return { label: 'Dig here', fn: () => Detector.dig(s) };
  },
  dig(s) {
    const L = Detector.spots(); L.splice(L.indexOf(s), 1); Sound.play('munch'); splash(s.x, s.y, 6);
    let r = Math.random(), kind = 'coins'; for (const [p, k] of LOOT) { if (r < p) { kind = k; break; } r -= p; }
    const pay = { coins: 5 + Math.floor(Math.random() * 11), junk: 0, watch: 25, ring: 40, doubloon: 100 }[kind];
    Game.money += pay; if (pay) Sound.play('cash'); if (pay >= 25) react('cheer');
    toast({ coins: `Loose change! +$${pay}. The beach provides.`, junk: pick(['A single flip-flop. Not Dan’s size. Keeps it anyway.', 'Somebody’s dentures. Dan reburies them respectfully.', 'A soggy scratch-off. Loser. Of course.']),
      watch: 'A gold watch! Still ticking. +$25', ring: 'A WEDDING RING. Somebody’s having a bad week. +$40', doubloon: 'A SPANISH DOUBLOON. REAL PIRATE GOLD. +$100' }[kind], 4);
    if (kind === 'ring') headline('FLORIDA MAN FINDS WEDDING RING WITH METAL DETECTOR, SELLS IT, "FEELS BAD FOR LIKE A MINUTE"', 2);
    if (kind === 'doubloon') headline('FLORIDA MAN WITH METAL DETECTOR FINDS PIRATE GOLD, CLAIMS HE WAS "A PIRATE IN A PAST LIFE"', 3);
  },
  draw(x, y, t) {   // the detector, swept low in front of Dan
    if (!Detector.on()) return; const D = Game.dan, s = Math.sin(t * 4) * 4, dx = D.dir === 'left' ? -1 : 1;
    R(x + dx * 5, y - 8, 1, 7, PAL.greyD); OR(x + dx * 7 + s - 3, y - 1, 6, 2, PAL.grey);
  },
};

// ---------- Miami: South Beach Surf & Dive (detector, cigarette boat, gold aviators) ----------
Object.assign(UPGRADES, {
  detector: { name: 'Metal Detector', price: 120, desc: 'Beeps faster near buried loot on any beach. Dig it up.', shop: 'surf' },
  cigboat: { name: 'Cigarette Boat Engine', price: 350, desc: 'Bolt it on the SS Budget. Way faster on Miami water.', shop: 'surf' },
  aviators: { name: 'Gold Aviators', price: 75, desc: 'Pure drip. Does nothing. Worth it.', shop: 'surf' },
});
for (const k of ['detector', 'cigboat', 'aviators']) ITEMS[k] = { ...UPGRADES[k], upgrade: true };
Object.assign(ICONS, {
  detector: { key: { o: 'ink', g: 'grey', d: 'greyD', y: 'yellow' }, rows: [
    '.......oo.', '......oyo.', '.....od...', '....od....', '...od.....', '..od......', '.od.......', 'ooooo.....', 'ogggo.....', 'ooooo.....'] },
  cigboat: { key: { o: 'ink', w: 'white', p: 'neon', b: 'blue' }, rows: [
    '..........', '..........', '.......oo.', '.oooooooo.', 'owwwwwwwwo', 'oppppppppo', '.owwwwwwo.', '..oooooo..', 'bbbbbbbbbb', '..........'] },
  aviators: { key: { o: 'ink', y: 'yellow', k: 'shades' }, rows: [
    '..........', '..........', '..........', 'oooooooooo', 'oyyyooyyyo', 'okkkookkko', '.okko.okko', '..oo...oo.', '..........', '..........'] },
});
function addMiamiExtras(add) {
  add('surfshack', 67.6, 32.4, 3.2, 1.6);
  add('newsbox', 57.3, 17.6, .7, .6);
  return { surf: { x: 69.2 * TS, y: 35.2 * TS } };
}
function drawMoneyProp(p, x, y, w, h, t) {
  switch (p.kind) {
    case 'newsbox': { shadow(x + 6, y + 10, 12); OR(x, y - 8, 11, 17, PAL.blue); OR(x + 1, y - 5, 9, 6, PAL.white); R(x + 2, y - 3, 7, 1, PAL.greyD); R(x + 2, y - 1, 5, 1, PAL.greyD); R(x + 1, y + 4, 9, 1, PAL.blueD); return true; }
    case 'surfshack': {
      shadow(x + w / 2, y + h + 2, w + 6, 5);
      OR(x, y - 6, w, h + 6, '#7fe0d6'); for (let i = 0; i < w; i += 6) R(x + i, y - 6, 3, h + 6, '#6ccbc2');
      g.fillStyle = PAL.ink; g.fillRect(x - 5, y - 14, w + 10, 9); g.fillStyle = '#ff5ea8'; g.fillRect(x - 4, y - 13, w + 8, 7);
      for (const [ox, c] of [[-10, '#ffd23f'], [w + 3, '#ff8a3d']]) { OR(x + ox, y - 24, 6, 30, c); R(x + ox + 2, y - 20, 2, 20, PAL.white); }   // surfboards
      OR(x + w / 2 - 34, y - 30, 68, 11, PAL.white); label('SURF & DIVE', x + w / 2, y - 21, '#2ba59a', 6);
      return true;
    }
  }
  return false;
}

// ---------- Miami side gigs ----------
Object.assign(GIGS, {
  cafecito: { giver: 'abuela', pay: 30, quest: 'Bring a cafecito up to 3 lifeguard towers',
    offer: [['ABUELA', 'The lifeguards. They are so tired, mijo. So pale. Look at them.'], ['ABUELA', 'Take them cafecito. Three towers. Then they will be awake enough to save people.']],
    start() { G_().towers = []; },
    check: () => (G_().towers || []).length >= 3,
    hl: 'FLORIDA MAN DELIVERS CAFECITO TO SOUTH BEACH LIFEGUARDS; BEACH "VIBRATING"' },
  rematch: { giver: 'raul', pay: 30, ok: () => Cases.info().n !== 4, quest: 'Beat Raul in a rematch down Ocean Drive (talk to him to start)',
    offer: [['RAUL', 'Bro. BRO. I’ve been training. On the sidewalk. For days.'], ['RAUL', 'Rematch. Ocean Drive, to the Flamingo Hotel. Thirty bucks says you lose.']],
    start() { Race.lastWon = null; Race.start(); },
    talkActive: () => { if (!Race.on) { Race.lastWon = null; Race.start(); } return [['RAUL', 'GO GO GO, BRO!']]; },
    check: () => Race.lastWon === true,
    hl: 'FLORIDA MAN BEATS ROLLERBLADER TWICE; ROLLERBLADER "RETIRING FROM THE SIDEWALK"' },
  pickles: { giver: 'sheila', pay: 25, quest: 'Catch Sheila’s iguana, Mr. Pickles (on the beach), and bring him back',
    offer: [['SHEILA', 'Mr. Pickles got out! My iguana! He’s wearing a little bow tie!'], ['SHEILA', 'He likes the beach. He likes being chased less. Bring him home, hon.']],
    start() { const c = makeCritter('iguana', rnd(63, 71) * TS, rnd(8, 52) * TS); c.pickles = true; c.tag = 'MR. PICKLES'; Game.animals.push(c); },
    talkActive: () => Game.dan.carry === 'pickles' ? (Game.dan.carry = null, 'done') : [['SHEILA', 'Mr. Pickles is still out there, Dan. In his little bow tie.']],
    hl: 'FLORIDA MAN RETURNS ESCAPED IGUANA IN BOW TIE TO BOCA RETIREE; "HE’S FAMILY"' },
});
ICONS.pickles = { key: { o: 'ink', g: 'grassL', d: 'grassD', r: 'red' }, rows: [
  '..........', '..........', '.oo.......', 'oggo......', 'ogggggoo..', '.odgggggoo', '..oroggo..', '...o..o...', '..........', '..........'] };
const MiamiGigs = {
  interaction() {
    const D = Game.dan, G = G_(), near = (p, r) => Math.hypot(D.x - p.x, D.y - p.y) < r;
    if (G.active === 'cafecito') { for (const [i, p] of World.props.filter(p => p.kind === 'guard').entries()) if (!G.towers.includes(i) && near({ x: p.x + 11, y: p.y + 14 }, 26)) return { label: 'Hand a cafecito up the tower', fn: () => { G.towers.push(i); Sound.play('pickup'); toast(`LIFEGUARD: “¡Gracias!” (${G.towers.length}/3)`); questText('gig_cafecito', `Bring a cafecito up to 3 lifeguard towers (${G.towers.length}/3)`); } }; }
    if (G.active === 'pickles' && !D.carry) { const c = Game.animals.find(a => a.pickles); if (c && near(c, 16)) return { label: 'Grab Mr. Pickles', fn: () => { Game.animals = Game.animals.filter(a => a !== c); D.carry = 'pickles'; Sound.play('pickup'); toast('Got him. He is furious. His bow tie is crooked.'); } }; }
    return null;
  },
  target(id) {
    const G = G_(), who = n => Game.npcs.find(x => x.id === n);
    if (id === 'cafecito') { const i = World.props.filter(p => p.kind === 'guard').findIndex((p, k) => !G.towers.includes(k)); return i >= 0 ? World.props.filter(p => p.kind === 'guard')[i] : null; }
    if (id === 'rematch') return who('raul');
    if (id === 'pickles') return Game.dan.carry === 'pickles' ? who('sheila') : Game.animals.find(a => a.pickles);
    return null;
  },
};
