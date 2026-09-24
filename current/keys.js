// FLORIDA DAN — THE KEYS. The fourth map (unlocked after the Daytona 250), laid out like a drive down US-1:
// Marathon (the Greyhound stop, Tarpon Tom's bait shop and the tarpon dock) → the Seven Mile Bridge (with the old,
// broken one beside it) → Big Pine Key (key deer, the No Name Bar) → Key West (Duval Street, Sloppy Moe's, the
// conch shack, Mallory Square at sunset, the Six-Toe House, the marina + Dan's houseboat, the Southernmost Point,
// the Monroe County Courthouse). Every bit of water is diveable (dive.js). Cases live in keys2.js.
'use strict';
const KEYS = () => Game.region === 'keys';
const KEYS_BRIDGE = { x0: 16, x1: 45, y0: 30, y1: 31 };   // the Seven Mile Bridge deck (tiles)

function buildKeys() {
  const W = World;
  W.fill(0, 0, MW - 1, MH - 1, T.DEEP);
  const island = (x0, y0, x1, y1, ring = 2) => {   // grass on sand on shallows: every key looks like this from the air
    W.fill(x0 - ring, y0 - ring, x1 + ring, y1 + ring, T.SHALLOW);
    W.fill(x0, y0, x1, y1, T.SAND); W.fill(x0 + 1, y0 + 1, x1 - 1, y1 - 1, T.GRASS);
  };
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (hash2(x, y) > .55 && (y < 8 || y > 50)) W.set(x, y, T.WATER);   // lighter patches over the reef
  island(0, 16, 14, 44); island(47, 19, 57, 42); island(64, 6, 88, 55);
  W.fill(36, 44, 42, 50, T.SHALLOW); W.fill(20, 8, 30, 13, T.SHALLOW);   // flats: wade + dive
  // US-1: Marathon → the Seven Mile Bridge → Big Pine → the little bridge → Key West (Truman Ave)
  for (let x = 0; x < MW; x++) { W.set(x, 30, T.ROAD); W.set(x, 31, T.ROAD); }
  // the old bridge: concrete, beside the new one, with a span missing (you can't drive to Big Pine on it. people have tried)
  for (let x = 15; x <= 44; x++) if (x < 29 || x > 31) { W.set(x, 27, T.CONCRETE); W.set(x, 28, T.CONCRETE); }
  W.set(15, 29, T.CONCRETE);
  // Marathon: the tarpon dock, south
  for (let y = 45; y <= 50; y++) { W.set(6, y, T.DOCK); W.set(7, y, T.DOCK); }
  // Key West streets
  for (let y = 7; y <= 54; y++) { W.set(75, y, T.ROADV); W.set(76, y, T.ROADV); }       // Duval Street
  for (let x = 64; x <= 88; x++) { W.set(x, 16, T.ROAD); W.set(x, 17, T.ROAD); W.set(x, 46, T.ROAD); W.set(x, 47, T.ROAD); }   // Front St, South St
  W.fill(64, 6, 71, 9, T.PLAZA);                                                           // Mallory Square
  for (let x = 65; x <= 70; x++) { W.set(x, 3, T.DOCK); W.set(x, 4, T.DOCK); W.set(x, 5, T.DOCK); }   // the sunset pier
  for (let x = 59; x <= 63; x++) { W.set(x, 12, T.DOCK); W.set(x, 13, T.DOCK); }            // the marina dock (houseboat at the end)
  for (let x = 79; x <= 81; x++) for (let y = 55; y <= 57; y++) W.set(x, y, T.SAND);       // the Southernmost Point

  const P = W.props = [];
  const add = (kind, tx, ty, w, h, solid = true, extra = {}) => { const p = { kind, x: tx * TS, y: ty * TS, w: w * TS, h: h * TS, solid, ...extra }; P.push(p); return p; };
  // Marathon
  add('station', 3, 27, 5, 2); add('baitshop', 7.5, 36.5, 5, 2.2); add('kbilly', 1, 21, 3, .5, false, { text: 'MARATHON · MILE MARKER 50' });
  for (let x = KEYS_BRIDGE.x0; x <= KEYS_BRIDGE.x1; x += 2) { add('rail', x, 29.8, 2, .2, false); add('rail', x, 32, 2, .2, false); }   // the bridge's concrete lips
  add('kbilly', 16, 33.2, 4, .5, false, { text: 'SEVEN MILE BRIDGE' }); add('deerxing', 49, 28.2, 1, .5, false);
  // Big Pine
  add('nonamebar', 50, 22, 6, 2.6); add('kbilly', 52, 36, 4, .5, false, { text: 'BIG PINE KEY · SLOW: KEY DEER' });
  // Key West
  add('houseboat', 56.2, 11.2, 3.4, 2.2, false); add('slippy', 69, 20.4, 6, 2.6); add('conch', 78, 20.6, 4.4, 2.2); add('tees', 78, 36.6, 4.4, 2.2);
  add('sixtoe', 65.6, 36.6, 6.4, 3); add('kcourt', 79, 9.2, 8, 3.4); add('buoy', 79.6, 55, 2, 1.4); add('lighthouse', 71.5, 41, 1.6, 2.2);
  add('newsbox', 74.1, 25, .7, .6); add('porta', 72.6, 49, 1, 1); add('kbilly', 66, 10.4, 5, .5, false, { text: 'MALLORY SQUARE · SUNSET NIGHTLY' });
  for (const [x, y] of [[66, 24], [70, 27], [80, 26], [84, 22], [66, 44], [85, 40], [70, 52], [86, 52], [83, 12], [66, 14], [48, 34], [55, 25], [2, 18], [11, 24], [4, 40], [12, 42]])
    add('palm', x + .25, y + .55, .5, .4, true, { s: hash2(x, y) });
  for (const [x, y, c] of [[68, 53, '#ff5ea8'], [72, 55, '#27c6b4'], [84, 54, '#ffd23f'], [9, 44, '#ff8a3d']]) add('umbrella', x, y, .6, .4, false, { c });
  W.spots = {
    dan: { x: 63.2 * TS, y: 14.6 * TS }, door: { x: 60 * TS, y: 12.6 * TS }, arrive: { x: 5.5 * TS, y: 29.6 * TS }, stationDoor: { x: 5.5 * TS, y: 29.1 * TS },
    court: { x: 83 * TS, y: 13.3 * TS }, hide: { x: 73.1 * TS, y: 50.2 * TS }, boat: { x: 61.5 * TS, y: 14.8 * TS }, cooler: { x: 7.4 * TS, y: 32.8 * TS },
    dockEnd: { x: 6.5 * TS, y: 50.5 * TS }, ramp: { x: 61.5 * TS, y: 13 * TS }, beach: { x: 80.5 * TS, y: 54 * TS }, pier: { x: 67.5 * TS, y: 3.6 * TS },
    bait: { x: 10 * TS, y: 39.4 * TS }, tarpon: { x: 6.5 * TS, y: 51.5 * TS }, bar: { x: 53 * TS, y: 25.4 * TS }, moe: { x: 67.6 * TS, y: 24 * TS }, moeDoor: { x: 72 * TS, y: 23.6 * TS },
    conch: { x: 80.2 * TS, y: 23.6 * TS }, tees: { x: 80.2 * TS, y: 39.6 * TS }, sixtoe: { x: 68.8 * TS, y: 40.4 * TS }, mallory: { x: 67.5 * TS, y: 7.5 * TS },
    marina: { x: 62 * TS, y: 14 * TS }, bridgeW: { x: 16.5 * TS, y: 30.9 * TS }, bridgeE: { x: 47.5 * TS, y: 30.9 * TS }, oldbridge: { x: 26 * TS, y: 27.8 * TS },
    reef: { x: 76 * TS, y: 58.5 * TS }, buoy: { x: 80.5 * TS, y: 56.8 * TS },
    merle: { x: -999, y: -999 }, darlene: { x: -999, y: -999 }, rhonda: { x: -999, y: -999 }, icemachine: { x: -999, y: -999 }, pasture: { x: -999, y: -999 }, glades: { x: -999, y: -999 },
  };
}
// boats go under the bridges (the deck is road tiles over open water)
const keysUnderBridge = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return KEYS() && (ty === 30 || ty === 31) && ((tx >= KEYS_BRIDGE.x0 && tx <= KEYS_BRIDGE.x1) || (tx >= 59 && tx <= 61)); };

// ---------- drawing ----------
function drawKeysProp(p, x, y, w, h, t) {
  const sign = (text, cx, cy, bg, fg, pad = 6) => { const lw = labelWidth(text); OR(cx - lw / 2 - pad / 2, cy - 9, lw + pad, 11, bg); label(text, cx, cy, fg, 6); };
  const shack = (body, roof, trim) => { shadow(x + w / 2, y + h + 2, w + 6, 5); OR(x, y - 10, w, h + 10, body); for (let i = 0; i < w; i += 6) R(x + i, y - 16, 6, 7, i % 12 ? roof : trim); OR(x - 2, y - 17, w + 4, 2, trim); };
  switch (p.kind) {
    case 'rail': R(x, y, w, 2, '#d6d1c4'); return true;
    case 'kbilly': { R(x + 4, y - 6, 2, 8, PAL.woodD); R(x + w - 6, y - 6, 2, 8, PAL.woodD); sign(p.text, x + w / 2, y - 6, '#1f7a4d', PAL.white); return true; }
    case 'deerxing': { R(x + 7, y - 14, 2, 16, PAL.grey); OR(x + 1, y - 26, 14, 12, PAL.yellow); R(x + 5, y - 22, 5, 3, PAL.ink); R(x + 5, y - 19, 1, 3, PAL.ink); R(x + 9, y - 19, 1, 3, PAL.ink); R(x + 9, y - 25, 1, 3, PAL.ink); return true; }
    case 'baitshop': shack('#bfe3e0', '#2ba59a', PAL.white); OR(x + 8, y + 2, 14, 9, PAL.waterL); OR(x + w - 20, y + h - 16, 12, 16, PAL.woodD); sign("TARPON TOM'S BAIT", x + w / 2, y - 20, PAL.white, '#2ba59a'); return true;
    case 'nonamebar': {
      shack('#8a5a3a', '#6b4a2e', '#ffd23f'); OR(x + 8, y + 2, 16, 9, '#ffb347'); OR(x + w - 22, y + h - 16, 12, 16, PAL.black);
      for (let i = 0; i < 9; i++) R(x + 4 + i * 10, y - 6 + (i % 2) * 3, 5, 3, ['#6fbf73', '#ffd23f', PAL.white, '#9fd8ee'][i % 4]);   // dollar bills stapled to everything
      sign('THE NO NAME BAR', x + w / 2, y - 20, PAL.black, PAL.yellow); return true;
    }
    case 'houseboat': {   // Dan's rental. It has a flagpole. That's the problem.
      const bob = Math.round(Math.sin(t * 1.6) * 1);
      shadow(x + w / 2, y + h + 1, w + 4, 5); OR(x, y + 14 + bob, w, 12, PAL.white); R(x, y + 20 + bob, w, 2, '#2ba59a');
      OR(x + 6, y - 2 + bob, w - 14, 17, '#f4d6b0'); R(x + 4, y - 4 + bob, w - 10, 3, '#e0433a'); OR(x + 12, y + 3 + bob, 8, 7, PAL.waterL); OR(x + 26, y + 3 + bob, 8, 7, PAL.waterL);
      R(x + w - 6, y - 26 + bob, 1, 24, PAL.grey);
      const F = Game.flags, fl = F.declared && !F.flagGone ? '#4f7bd1' : F.flagBack ? '#4f7bd1' : null; if (fl) { OR(x + w - 5, y - 26 + bob + Math.round(Math.sin(t * 5)), 10, 7, fl); R(x + w - 3, y - 23 + bob, 6, 1, '#34569e'); }   // the jorts flag
      if (F.declared) label('REPUBLIC OF DAN', x + w / 2, y - 8 + bob, PAL.yellow, 5);
      return true;
    }
    case 'slippy': {
      shack('#fbf7ef', '#1a1423', PAL.red); OR(x + 8, y + 2, 20, 10, '#ffb347'); OR(x + w - 26, y + 2, 16, 10, '#ffb347'); OR(x + w / 2 - 7, y + h - 16, 14, 16, PAL.black);
      const on = Math.floor(t * 2) % 6 !== 0; sign("SLOPPY MOE'S", x + w / 2, y - 20, PAL.black, on ? PAL.red : PAL.greyD);
      if (Game.flags.flagAtMoes) { R(x + w - 4, y - 38, 1, 22, PAL.grey); OR(x + w - 3, y - 38 + Math.round(Math.sin(t * 5)), 10, 7, '#4f7bd1'); }
      return true;
    }
    case 'conch': shack('#ffe56b', '#ff8a3d', PAL.white); OR(x + 8, y + 2, 20, 9, PAL.white); R(x + 10, y + 5, 16, 1, PAL.ink); OR(x + w - 18, y + h - 16, 12, 16, PAL.woodD); sign('CONCH SHACK', x + w / 2, y - 20, '#ff8a3d', PAL.white); return true;
    case 'tees': {
      shack('#b8e0f7', '#ff5ea8', PAL.white); OR(x + w - 18, y + h - 16, 12, 16, PAL.woodD);
      for (let i = 0; i < 4; i++) { const c = [PAL.hat, PAL.yellow, PAL.teal, PAL.white][i]; OR(x + 4 + i * 9, y + 2, 7, 8, c); R(x + 3 + i * 9, y + 2, 9, 2, c); }
      sign('T-SHIRTS 3 FOR $10', x + w / 2, y - 20, PAL.white, PAL.hat); return true;
    }
    case 'sixtoe': {   // a big old conch house full of cats
      shadow(x + w / 2, y + h + 3, w + 8, 6); OR(x, y - 14, w, h + 14, '#f6efe0'); for (let i = 0; i < w; i += 4) R(x + i, y - 14, 1, h + 14, '#e5dccb');
      R(x - 3, y - 20, w + 6, 7, '#5f9e8f'); R(x - 3, y - 20, w + 6, 1, PAL.ink); for (let i = 8; i < w - 8; i += 16) { OR(x + i, y - 8, 8, 10, '#5f9e8f'); OR(x + i + 1, y - 7, 6, 8, PAL.waterL); }
      OR(x + w / 2 - 7, y + h - 18, 14, 18, '#5f9e8f');
      for (let i = 0; i < 4; i++) { const cx = x + 6 + i * 26, cy = y + h + 1 + Math.round(Math.sin(t * 2 + i)); R(cx, cy - 4, 6, 4, ['#f2a65a', PAL.black, PAL.white, PAL.grey][i]); R(cx, cy - 6, 2, 2, ['#f2a65a', PAL.black, PAL.white, PAL.grey][i]); R(cx + 4, cy - 6, 2, 2, ['#f2a65a', PAL.black, PAL.white, PAL.grey][i]); }
      sign('THE SIX-TOE HOUSE · TOURS $5 · CATS FREE', x + w / 2, y - 24, PAL.white, '#3f7f70'); return true;
    }
    case 'kcourt': {
      shadow(x + w / 2, y + h + 3, w + 8, 6); OR(x, y - 18, w, h + 18, '#f2ead8'); OR(x - 4, y - 26, w + 8, 10, '#e0d6bf'); R(x + w / 2 - 10, y - 38, 20, 12, '#e0d6bf'); R(x + w / 2 - 6, y - 34, 12, 6, PAL.waterL);
      for (let i = 10; i < w - 6; i += 18) OR(x + i, y - 14, 6, h + 12, PAL.white); OR(x + w / 2 - 7, y + h - 18, 14, 18, PAL.woodD);
      sign('MONROE COUNTY COURTHOUSE', x + w / 2, y - 18, '#e0d6bf', PAL.ink, 4); return true;
    }
    case 'buoy': {   // the Southernmost Point. Red, black, yellow. Everyone takes the same photo.
      shadow(x + w / 2, y + h + 1, w + 4, 5); g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(x + w / 2, y + 2, w / 2 + 1, 5, 0, 0, 7); g.fill();
      OR(x + 4, y - 30, w - 8, 12, PAL.red); OR(x + 4, y - 18, w - 8, 10, PAL.black); OR(x + 4, y - 8, w - 8, 10, PAL.yellow); R(x + 6, y - 28, w - 12, 1, PAL.white);
      label('SOUTHERNMOST', x + w / 2, y - 22, PAL.white, 4); label('90 MI TO CUBA', x + w / 2, y - 11, PAL.yellow, 4); return true;
    }
    case 'lighthouse': { shadow(x + w / 2, y + h + 1, w + 6, 4); OR(x + 4, y - 36, w - 8, h + 34, PAL.white); R(x + 4, y - 20, w - 8, 4, PAL.red); OR(x + 2, y - 44, w - 4, 8, PAL.ink); const on = Game.hour > 19 || Game.hour < 6; R(x + 5, y - 42, w - 10, 4, on ? PAL.yellow : '#9fd8ee'); return true; }
  }
  return false;
}

// ---------- people ----------
const Keys = {
  spawn() {
    const S_ = World.spots;
    Game.npcs = [
      makeNPC('lou', 'Captain Lou', S_.marina.x + 14, S_.marina.y + 8, 'left'),
      makeNPC('moe', 'Moe', S_.moe.x, S_.moe.y, 'down'),
      makeNPC('joelle', 'Joelle', S_.conch.x, S_.conch.y, 'down'),
      makeNPC('dwayne', 'Dwayne', S_.tees.x, S_.tees.y, 'down'),
      makeNPC('pearl', 'Miss Pearl', S_.sixtoe.x, S_.sixtoe.y, 'down'),
      makeNPC('mike', 'Mango Mike', S_.mallory.x + 20, S_.mallory.y, 'down', { wander: 24 }),
      makeNPC('tom', 'Tarpon Tom', S_.bait.x, S_.bait.y, 'down'),
      makeNPC('gus', 'Old Gus', 9.5 * TS, 44 * TS, 'down'),
      makeNPC('brayden', 'Brayden', 75.5 * TS, 34 * TS, 'down', { wander: 90 }),
      makeNPC('tourist', 'Tourist', 80 * TS, 52 * TS, 'down', { wander: 40 }),
      makeNPC('tourist', 'Tourist', 72 * TS, 12 * TS, 'down', { wander: 50 }),
    ];
    const A = Game.animals = [];
    for (let i = 0; i < 6; i++) A.push(makeCritter('rooster', rnd(66, 87) * TS, rnd(19, 45) * TS));
    for (let i = 0; i < 3; i++) A.push(makeCritter('cat', S_.sixtoe.x + rnd(-40, 40), S_.sixtoe.y + rnd(2, 20)));
    for (let i = 0; i < 4; i++) A.push(makeCritter('deer', rnd(48, 56) * TS, rnd(20, 41) * TS));
    for (let i = 0; i < 3; i++) A.push(makeCritter('iguana', rnd(66, 86) * TS, rnd(33, 45) * TS));
    A.push(makeCritter('pelican', S_.dockEnd.x + 10, S_.dockEnd.y - 6), makeCritter('pelican', S_.pier.x, S_.pier.y + 4), makeCritter('pelican', 44 * TS, 29.2 * TS));
    A.push(makeGator(30 * TS, 45 * TS, false));   // a saltwater croc, technically. Dan calls him Chuck's cousin
    if (Game.flags.trashBaby && !Game.flags.tbStay) A.push(makeCritter('raccoon', Game.dan.x + 14, Game.dan.y, { pet: true }));
    const P = Game.pickups = [];
    for (let i = 0, k = 0; i < 8 && k < 500; k++) { const x = rnd(0, 88) * TS, y = rnd(6, 55) * TS, tt = World.at(x, y); if ((tt === T.SAND || tt === T.GRASS) && !World.solidAt(x, y)) { P.push({ kind: pick(['beer', 'beer', 'cig', 'scratch', 'bait', 'energy']), x, y }); i++; } }
    Game.vehicles = [];
    if (typeof KeysCases !== 'undefined') KeysCases.spawn();
  },
  // what's under the water right here (dive.js zones)
  zoneAt(x, y) {
    const tx = x / TS, ty = y / TS;
    if (tx >= 14 && tx <= 46 && ty >= 24 && ty <= 35) return 'bridge';
    if (tx >= 55 && tx <= 66 && ty >= 8 && ty <= 18) return 'harbor';
    if (World.at(x, y) === T.SHALLOW) return 'flats';
    return 'reef';
  },
  canDiveHere() {
    const D = Game.dan;
    if (D.ride === 'boat') return true;
    if (D.ride) return false;
    const f = facingPoint(16), k = World.at(f.x, f.y); return WET(k);
  },
  // at the water's edge (or in the boat): one prompt, two choices — go under, or wet a line
  waterPrompt() {
    const D = Game.dan, f = facingPoint(16), fk = World.at(f.x, f.y), k = D.ride === 'boat' ? World.at(D.x, D.y) : fk, canFish = D.ride === 'boat' || fk === T.DEEP || fk === T.WATER || (fk === T.SHALLOW && World.at(D.x, D.y) === T.DOCK);
    return { label: D.ride === 'boat' ? 'Dive off the boat · or fish' : canFish ? 'Dive in · or fish' : 'Dive in', fn: () => {
      if (!canFish) return KeysCases.dive();
      say([['DAN', pick(['Water’s 84 degrees.', 'The ocean is calling. It’s saying “Dan.”', 'In or on?']), [['Dive in', () => { Game.afterTalk = () => KeysCases.dive(); return null; }], ['Cast a line', () => { Game.afterTalk = () => Fishing.start(k, D.ride !== 'boat'); return null; }], ['Nah', () => null]]]]);
    } };
  },
  coolerPrompt() { const D = Game.dan; return D.ride === 'cooler' && Math.hypot(D.x - World.spots.bridgeW.x, D.y - World.spots.bridgeW.y) < 30 ? { label: 'FLOOR IT across the Seven Mile Bridge', fn: () => KeysCases.bridgeRun() } : null; },
  interactions() {
    const D = Game.dan, S_ = World.spots, list = [], near = (p, r) => p && Math.hypot(D.x - p.x, D.y - p.y) < r;
    list.push(...KeysCases.interactions());
    if (D.ride) return list;
    if (this.canDiveHere()) list.push(this.waterPrompt());
    if (near(S_.door, 20) && sleepReady()) list.push({ label: 'Sleep on the houseboat', fn: () => sleep() });
    if (near(S_.court, 22)) { const cs = Cases.courtCase(); list.push({ label: cs ? 'Enter the courthouse' : 'Monroe County Courthouse (closed)', fn: () => cs ? Court.start(cs) : toast('The Monroe County Courthouse. A rooster is asleep on the steps. It has seniority.') }); }
    if (near(S_.stationDoor, 22)) list.push({ label: 'Greyhound', fn: () => busMenu() });
    if (near(S_.buoy, 26)) list.push({ label: 'Take a photo at the Southernmost Point', fn: () => KeysCases.buoyPhoto() });
    if (Game.urgent > 0 && near(S_.hide, 22)) list.push({ label: 'USE THE TOILET', fn: () => { Game.urgent = 0; Sound.play('splash'); toast('A Duval Street porta-potty at 2 PM. There are roosters in here.'); Game.chill = 100; } });
    return list;
  },
};
Object.assign(REGION_NAMES, { keys: 'the Keys' });
TRAVEL_LINES.keys = [['', 'Dan boards the Greyhound south. The chicken guy is here. He is wearing a lei.'], ['', 'Florida City. Key Largo. Islamorada. The road turns into a bridge and the bridge turns into the ocean.'],
  ['DRIVER', 'Marathon. End of the line.'], ['DAN', 'I thought this went to Key West.'], ['DRIVER', 'It does. For people who aren’t you. Your cooler’s under the bus.']];
