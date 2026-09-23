// FLORIDA DAN — the map: islands, mainland, County Road 29, the Gulp-N-Go, the Glades.
'use strict';
const TS = 16, MW = 90, MH = 60;
const T = { DEEP: 0, WATER: 1, SHALLOW: 2, GRASS: 3, MUD: 4, DOCK: 5, SAND: 6, ROAD: 7, CONCRETE: 8, SAWGRASS: 9, SIDEWALK: 10, ROADV: 11, PLAZA: 12 };
const WET = t => t <= T.SHALLOW;
const WALKABLE = t => t >= T.SHALLOW;
const BOATABLE = t => t <= T.SHALLOW;
const DRIVABLE = t => t >= T.GRASS;

const World = {
  map: new Uint8Array(MW * MH), props: [], spots: {},
  tile(tx, ty) { return tx < 0 || ty < 0 || tx >= MW || ty >= MH ? T.DEEP : this.map[ty * MW + tx]; },
  at(px, py) { return this.tile(Math.floor(px / TS), Math.floor(py / TS)); },
  set(tx, ty, t) { if (tx >= 0 && ty >= 0 && tx < MW && ty < MH) this.map[ty * MW + tx] = t; },
  fill(x0, y0, x1, y1, t) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, t); },
  solidAt(px, py) { for (const p of this.props) if (p.solid && px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h) return p; return null; },
  region(px, py) {
    const tx = px / TS, ty = py / TS;
    if (ty > 38 && tx < 20) return 'glades';
    if (tx > 49 && tx < 70 && ty > 46) return 'pasture';
    if (Math.hypot(tx - 46, ty - 11) < 12) return 'merle';
    if (ty > 36) return 'mainland';
    return 'swamp';
  },
};

const REGIONS = {};
World.load = function (id) {
  if (!REGIONS[id]) {
    this.map = new Uint8Array(MW * MH); this.props = []; this.spots = {};
    (id === 'miami' ? buildMiami : buildWorld)();
    gatorMap(); REGIONS[id] = { map: this.map, props: this.props, spots: this.spots, gatorOK };
  }
  const Rg = REGIONS[id]; this.map = Rg.map; this.props = Rg.props; this.spots = Rg.spots; gatorOK = Rg.gatorOK; Game.region = id;
};
const MIAMI = () => Game.region === 'miami';

function buildWorld() {
  const blob = (x, y, cx, cy, r) => Math.max(0, 1 - Math.hypot((x - cx) / r, (y - cy) / (r * .78)));
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const n = vnoise(x * .17, y * .17) - .5;
    let f = blob(x, y, 20, 17, 12) * 1.3 + blob(x, y, 46, 11, 7.5) * 1.35 + blob(x, y, 7, 7, 4) + blob(x, y, 33, 26, 3.8) * 1.2 + blob(x, y, 66, 18, 6) * 1.2 + n * .55;
    const coast = 36 + Math.sin(x * .21) * 1.5 + vnoise(x * .3, 99) * 2.5;
    if (y > coast) f = Math.max(f, .6 + (y - coast) * .2);
    let t = f > .42 ? T.GRASS : f > .3 ? T.SHALLOW : f > .1 ? T.WATER : T.DEEP;
    if (t === T.GRASS && f < .5) t = T.SAND;
    if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) t = t === T.GRASS || t === T.SAND ? T.GRASS : T.DEEP;
    World.map[y * MW + x] = t;
  }
  // the Glades: sawgrass with puddles
  for (let y = 39; y < MH - 1; y++) for (let x = 1; x < 20; x++) {
    const k = vnoise(x * .35, y * .35);
    World.set(x, y, k > .62 ? T.SHALLOW : k > .55 ? T.MUD : T.SAWGRASS);
  }
  World.fill(13, 13, 25, 21, T.GRASS);            // Dan's yard
  World.fill(41, 8, 50, 14, T.GRASS);             // Merle's lot
  World.fill(0, 44, MW - 1, 45, T.ROAD);          // County Road 29
  World.fill(27, 39, 38, 43, T.CONCRETE);         // Gulp-N-Go lot
  World.fill(72, 37, 84, 43, T.CONCRETE);         // courthouse plaza
  World.fill(76, 43, 78, 43, T.CONCRETE);
  World.fill(50, 47, 69, 57, T.GRASS);            // pasture
  // footbridge: Dan's island → mainland
  let y0 = 20; while (World.tile(21, y0) >= T.GRASS) y0++;
  let y1 = y0; while (World.tile(21, y1) < T.GRASS) y1++;
  for (let y = y0 - 1; y <= y1; y++) { World.set(21, y, T.DOCK); World.set(22, y, T.DOCK); }
  // fishing dock east of the cabin
  let x0 = 22; while (World.tile(x0, 17) >= T.GRASS) x0++;
  for (let x = x0 - 1; x <= x0 + 4; x++) World.set(x, 17, T.DOCK);
  for (let x = x0 + 5; x <= x0 + 8; x++) for (let y = 16; y <= 18; y++) if (!WET(World.tile(x, y))) World.set(x, y, T.WATER);
  // Gulp-N-Go boat ramp (Florida)
  for (let y = 33; y <= 38; y++) World.set(35, y, y < 36 && WET(World.tile(35, y)) ? T.DOCK : World.tile(35, y) === T.CONCRETE ? T.CONCRETE : T.DOCK);
  // mud paths
  for (let y = 16; y <= 19; y++) World.set(18, y, T.MUD);
  for (let x = 18; x <= 21; x++) World.set(x, 19, T.MUD);
  for (let x = 18; x < x0 - 1; x++) World.set(x, 17, T.MUD);
  for (let y = y1; y < 44; y++) World.set(21, y, T.MUD);
  for (let y = 43; y >= 38; y--) World.set(77, y, T.CONCRETE);

  const P = World.props = [];
  const add = (kind, tx, ty, w, h, solid = true, extra = {}) => { const p = { kind, x: tx * TS, y: ty * TS, w: w * TS, h: h * TS, solid, ...extra }; P.push(p); return p; };
  add('cabin', 15, 13, 5, 3);
  add('couch', 21, 15, 2, 1);
  add('truck', 12.5, 17, 3, 2);
  add('grill', 15, 17.2, 1, 1);
  add('flamingo', 20.5, 18, .5, .4, false);
  add('flamingo', 23.5, 14.5, .5, .4, false);
  add('sign', 13.2, 20, 1, .5, true, { text: 'NO TRESPASSIN' });
  add('trailer', 43, 9, 5, 3);
  add('flamingo', 49, 12.5, .5, .4, false);
  add('fryer', 42, 13, 1, 1);
  add('gas', 28, 38.5, 6, 2.5);
  add('canopy', 29, 41, 7, 2, false);
  add('pump', 30.5, 42, .8, .6); add('pump', 33.5, 42, .8, .6);
  add('icemachine', 34.5, 39.2, 1.2, 1.2);
  add('dumpster', 37, 39.5, 1.5, 1);
  add('billboard', 44, 42, 5, .6, true);
  add('courthouse', 73, 34, 10, 4);
  add('porta', 25.3, 42.3, 1, 1);
  add('mailbox', 20, 43, .5, .5);
  for (let x = 50; x <= 69; x++) { if (x < 58 || x > 60) add('fence', x, 46.5, 1, .3); add('fence', x, 57.5, 1, .3); }
  for (let y = 47; y <= 57; y++) { add('fencev', 49.7, y, .3, 1); add('fencev', 69.7, y, .3, 1); }
  World.spots = {
    door: { x: 17.6 * TS, y: 16.6 * TS }, dan: { x: 17.6 * TS, y: 17.4 * TS }, dockEnd: { x: (x0 + 4.5) * TS, y: 17.5 * TS },
    boat: { x: (x0 + 6) * TS, y: 17.5 * TS }, cooler: { x: 20.5 * TS, y: 17.8 * TS }, merle: { x: 45.5 * TS, y: 12.9 * TS },
    darlene: { x: 31 * TS, y: 41.2 * TS }, rhonda: { x: 40 * TS, y: 43.4 * TS }, icemachine: { x: 35.1 * TS, y: 40.8 * TS },
    court: { x: 78 * TS, y: 38.6 * TS }, pasture: { x: 59 * TS, y: 52 * TS }, glades: { x: 10 * TS, y: 50 * TS },
    bridgeS: { x: 21.5 * TS, y: (y1 + 1) * TS }, ramp: { x: 35.5 * TS, y: 33.5 * TS }, roof: { x: 17.6 * TS, y: 12.4 * TS },
  };
  const r = rng(29);
  const clearOf = (x, y) => World.props.every(p => Math.hypot(p.x / TS + p.w / TS / 2 - x, p.y / TS + p.h / TS / 2 - y) > 3.2);
  for (let i = 0; i < 2600; i++) {
    const x = 1 + Math.floor(r() * (MW - 2)), y = 1 + Math.floor(r() * (MH - 2)), t = World.tile(x, y), roll = r();
    const open = t === T.GRASS && clearOf(x, y) && World.tile(x, y + 1) === T.GRASS && World.tile(x, y - 1) !== T.ROAD && World.tile(x, y + 1) !== T.ROAD && World.region(x * TS, y * TS) !== 'pasture';
    if (open && roll < .1) add(y > 36 || r() < .35 ? 'palm' : 'cypress', x + .25, y + .55, .5, .4, true, { s: r() });
    else if (t === T.SHALLOW && roll < .09) add('reeds', x, y, 1, 1, false, { s: r() });
    else if ((t === T.WATER || t === T.DEEP) && roll < .02) add('lily', x, y, 1, 1, false, { s: r() });
    else if (t === T.SAWGRASS && roll < .05) add('cypress', x + .25, y + .55, .5, .4, true, { s: r() });
  }
}

// ---------- drawing ----------
let g;
const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const OR = (x, y, w, h, c) => { R(x - 1, y - 1, w + 2, h + 2, PAL.ink); R(x, y, w, h, c); };   // outlined rect
function shadow(x, y, w, h = 3) { g.globalAlpha = .28; g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(Math.round(x), Math.round(y), w / 2, h / 2, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
// label() lives in font.js (crisp 5x7 pixel font)

function drawTiles(cx, cy, t) {
  const tx0 = Math.floor(cx / TS), ty0 = Math.floor(cy / TS);
  for (let ty = ty0; ty <= ty0 + 12; ty++) for (let tx = tx0; tx <= tx0 + 21; tx++) {
    const k = World.tile(tx, ty), x = tx * TS - cx, y = ty * TS - cy, hs = hash2(tx, ty);
    if (WET(k)) {
      const mia = MIAMI();
      R(x, y, TS, TS, k === T.DEEP ? (mia ? '#0f6f9a' : PAL.deep) : k === T.WATER ? (mia ? '#1aa3b8' : PAL.waterD) : (mia ? '#46d1c9' : PAL.water));
      if (k === T.SHALLOW) { if (hs > .5) R(x + hs * 11, y + 9, 2, 1, PAL.sandD); }
      const ph = t * 1.2 + hs * 6.28;
      if (hs > .45) R(x + 3 + Math.sin(ph) * 2, y + 4 + hs * 8, 4, 1, k === T.DEEP ? PAL.waterD : PAL.waterL);
      // foam where water meets land
      const n = World.tile(tx, ty - 1), s = World.tile(tx, ty + 1), w = World.tile(tx - 1, ty), e = World.tile(tx + 1, ty), f = Math.sin(t * 2 + tx + ty) > 0 ? 1 : 0;
      if (!WET(n) && n !== T.DOCK) R(x, y + 1 + f, TS, 1, PAL.foam);
      if (!WET(w) && w !== T.DOCK) R(x + 1 + f, y, 1, TS, PAL.foam);
      if (!WET(e) && e !== T.DOCK) R(x + 14 - f, y, 1, TS, PAL.foam);
      if (!WET(s) && s !== T.DOCK) R(x, y + 14 - f, TS, 1, PAL.foam);
      continue;
    }
    switch (k) {
      case T.DOCK:
        R(x, y, TS, TS, PAL.waterD);
        R(x, y, TS, TS - 2, PAL.wood); for (let i = 0; i < TS; i += 4) R(x, y + i, TS, 1, PAL.woodD);
        R(x, y + 14, TS, 2, PAL.ink); if (hs > .7) R(x + 5, y + 6, 1, 1, PAL.ink);
        break;
      case T.ROAD: {
        R(x, y, TS, TS, PAL.road); if (hs > .6) R(x + hs * 13, y + 5, 1, 1, PAL.roadD);
        const up = World.tile(tx, ty - 1), dn = World.tile(tx, ty + 1);
        if (up !== T.ROAD) R(x, y, TS, 1, PAL.white);
        if (dn === T.ROAD && up !== T.ROAD && tx % 2 === 0) R(x + 2, y + 15, 10, 2, PAL.line);
        if (dn !== T.ROAD) R(x, y + 15, TS, 1, PAL.white);
        break;
      }
      case T.ROADV: {
        R(x, y, TS, TS, PAL.road); if (hs > .6) R(x + 5, y + hs * 13, 1, 1, PAL.roadD);
        const lf = World.tile(tx - 1, ty), rt = World.tile(tx + 1, ty);
        if (lf !== T.ROADV && lf !== T.ROAD) R(x, y, 1, TS, PAL.white);
        if (rt === T.ROADV && lf !== T.ROADV && ty % 2 === 0) R(x + 15, y + 2, 2, 10, MIAMI() ? PAL.neon : PAL.line);
        if (rt !== T.ROADV && rt !== T.ROAD) R(x + 15, y, 1, TS, PAL.white);
        break;
      }
      case T.SIDEWALK:
        R(x, y, TS, TS, '#f4c9c4'); R(x, y + 15, TS, 1, '#dfa9a6'); R(x + 15, y, 1, TS, '#dfa9a6'); if (hs > .9) R(x + 5, y + 7, 2, 1, '#dfa9a6');
        break;
      case T.PLAZA:
        R(x, y, TS, TS, '#f1e6d2'); for (let i = 0; i < 4; i++) R(x + hash2(tx * 3 + i, ty) * 14, y + hash2(tx, ty * 3 + i) * 14, 1, 1, ['#27c6b4', '#ff5ea8', '#ffd23f', '#8d8a93'][i]);
        if ((tx + ty) % 2 === 0) { g.globalAlpha = .06; R(x, y, TS, TS, PAL.ink); g.globalAlpha = 1; }
        break;
      case T.CONCRETE:
        R(x, y, TS, TS, PAL.concrete); R(x, y + 15, TS, 1, PAL.concreteD); R(x + 15, y, 1, TS, PAL.concreteD);
        if (hs > .85) { R(x + 4, y + 6, 4, 1, PAL.concreteD); R(x + 7, y + 7, 3, 1, PAL.concreteD); }
        if (hs < .05) R(x + 6, y + 6, 4, 3, PAL.grey);   // gum. or worse
        break;
      case T.SAND:
        R(x, y, TS, TS, MIAMI() ? '#f7e7bd' : PAL.sand); if (hs > .4) R(x + hs * 12, y + 3 + hs * 9, 1, 1, PAL.sandD); if (hs < .1) R(x + 9, y + 4, 2, 1, PAL.white);
        break;
      case T.MUD:
        R(x, y, TS, TS, PAL.mud); if (hs > .5) R(x + hs * 12, y + 5, 3, 1, PAL.mudD); if (hs < .25) R(x + 3, y + 11, 2, 1, PAL.mudL);
        break;
      case T.SAWGRASS:
        R(x, y, TS, TS, PAL.grassD);
        for (let i = 0; i < 5; i++) { const bx = x + (hash2(tx * 7 + i, ty) * 15), sw = Math.sin(t * 1.4 + bx * .3) * 1.2; R(bx + sw * .5, y + 3 + i % 3 * 2, 1, 9, i % 2 ? PAL.grassL : PAL.camo); }
        break;
      default:
        R(x, y, TS, TS, PAL.grass);
        if (hs > .55) { R(x + hs * 10, y + 4, 1, 2, PAL.grassD); R(x + hs * 10 + 2, y + 3, 1, 3, PAL.grassD); }
        if (hs < .18) R(x + 5, y + 10, 2, 1, PAL.grassL);
        if (hs > .96) { R(x + 6, y + 6, 2, 2, PAL.yellow); R(x + 6, y + 8, 1, 2, PAL.grassDD); }
        else if (hs > .93) { R(x + 9, y + 9, 2, 2, PAL.hat); }
    }
    // cliff lip where land drops to water (3/4 view)
    if (!WET(k) && k !== T.DOCK && WET(World.tile(tx, ty + 1))) { R(x, y + 11, TS, 5, k === T.SAND ? PAL.sandD : PAL.mudD); R(x, y + 11, TS, 1, k === T.SAND ? PAL.sand : PAL.grassDD); }
  }
}

function drawProp(p, cx, cy, t) {
  const x = Math.round(p.x - cx), y = Math.round(p.y - cy), w = p.w, h = p.h;
  switch (p.kind) {
    case 'cabin': {
      shadow(x + w / 2, y + h + 1, w + 8, 6);
      OR(x, y - 12, w, h + 12, PAL.wood);
      for (let i = 0; i < h + 12; i += 4) R(x, y - 12 + i, w, 1, PAL.woodD);
      OR(x - 4, y - 30, w + 8, 18, PAL.tin);                       // tin roof
      for (let i = 0; i < w + 8; i += 4) R(x - 4 + i, y - 30, 1, 18, PAL.tinD);
      R(x + 10, y - 26, 12, 6, PAL.rust); R(x + 50, y - 20, 9, 5, PAL.rust);
      if (Game.flags.stopSignOnRoof) { OR(x + 30, y - 40, 12, 12, PAL.red); R(x + 33, y - 35, 6, 2, PAL.white); R(x + 35, y - 28, 2, 8, PAL.grey); }
      OR(x + 36, y + h - 20, 12, 20, PAL.woodD); R(x + 45, y + h - 11, 2, 2, PAL.yellow);   // door
      OR(x + 9, y + 2, 14, 11, PAL.yellow); R(x + 15, y + 2, 1, 11, PAL.ink); R(x + 9, y + 7, 14, 1, PAL.ink);
      OR(x + 56, y + 2, 12, 11, PAL.yellow); R(x + 61, y + 2, 1, 11, PAL.ink);
      if (Game.flags.boarded) { R(x + 7, y + 3, 18, 3, PAL.woodL); R(x + 7, y + 9, 18, 3, PAL.woodL); R(x + 54, y + 3, 16, 3, PAL.woodL); R(x + 54, y + 9, 16, 3, PAL.woodL); }
      OR(x + 64, y - 38, 4, 10, PAL.greyD);
      if (Math.floor(t * 2) % 3 === 0) R(x + 65, y - 44, 3, 3, PAL.grey);
      label('DAN', x + w / 2 - 20, y - 16, PAL.hat, 7);
      break;
    }
    case 'trailer': {
      shadow(x + w / 2, y + h + 3, w + 6, 6);
      OR(x, y - 14, w, h + 14, PAL.white); R(x, y - 2, w, 4, PAL.teal); R(x, y + 14, w, 3, PAL.tankD);
      OR(x + 8, y - 8, 16, 9, PAL.waterL); R(x + 16, y - 8, 1, 9, PAL.ink);
      OR(x + 52, y - 6, 12, 22, PAL.greyD);
      R(x - 4, y + h - 2, w + 8, 2, PAL.ink);
      OR(x + 30, y + h, 5, 4, PAL.concreteD); OR(x + 66, y + h, 5, 4, PAL.concreteD);
      R(x + 70, y - 28, 1, 14, PAL.ink); R(x + 64, y - 28, 12, 1, PAL.ink); R(x + 64, y - 24, 12, 1, PAL.ink);
      label("MERLE'S", x + w / 2, y - 18, PAL.orange, 7);
      break;
    }
    case 'fryer': { shadow(x + 8, y + 15, 14); OR(x + 3, y + 2, 10, 11, PAL.greyD); R(x + 4, y + 2, 8, 2, PAL.yellow); if (Math.sin(t * 5) > 0) R(x + 6, y - 3, 3, 3, PAL.tankD); R(x + 2, y + 12, 12, 2, PAL.ink); break; }
    case 'gas': {
      shadow(x + w / 2, y + h + 2, w + 6, 6);
      OR(x, y - 16, w, h + 16, PAL.concrete); R(x, y - 16, w, 7, PAL.red); R(x, y - 9, w, 2, PAL.yellow);
      label('GULP-N-GO', x + w / 2, y - 10, PAL.yellow, 8);
      OR(x + 8, y + 2, 26, 16, PAL.waterL); R(x + 20, y + 2, 1, 16, PAL.ink); R(x + 10, y + 5, 8, 2, PAL.neon); R(x + 23, y + 8, 7, 2, PAL.yellow);
      OR(x + 42, y + 4, 14, 20, PAL.waterL); R(x + 48, y + 4, 1, 20, PAL.ink);
      OR(x + 60, y + 3, 34, 22, PAL.white); R(x + 60, y + 13, 34, 1, PAL.tankD); label('BAIT', x + 77, y + 12, PAL.red, 7); label('BEER', x + 77, y + 23, PAL.blueD, 7);
      break;
    }
    case 'canopy': {
      OR(x, y - 30, w, 6, PAL.red); R(x, y - 26, w, 2, PAL.yellow);
      R(x + 6, y - 24, 3, 28, PAL.greyD); R(x + w - 9, y - 24, 3, 28, PAL.greyD);
      break;
    }
    case 'pump': { shadow(x + 7, y + 10, 14); OR(x, y - 12, 12, 20, PAL.red); OR(x + 2, y - 9, 8, 5, PAL.ink); R(x + 3, y - 8, 5, 1, PAL.teal); R(x + 12, y - 6, 3, 8, PAL.ink); break; }
    case 'icemachine': {
      shadow(x + 10, y + 20, 20); OR(x, y - 6, 19, 25, PAL.white); R(x, y - 6, 19, 6, PAL.blue); label('ICE', x + 10, y, PAL.white, 6);
      if (!Game.flags.raccoonOut) { const k = Math.sin(t * 6) > .6; R(x + 5, y + 8 + (k ? -2 : 0), 9, 5, PAL.grey); R(x + 6, y + 9 + (k ? -2 : 0), 2, 1, PAL.black); R(x + 11, y + 9 + (k ? -2 : 0), 2, 1, PAL.black); R(x + 3, y + 14, 13, 2, PAL.ink); }
      break;
    }
    case 'dumpster': { shadow(x + 12, y + 16, 26); OR(x, y - 4, 24, 19, PAL.grassDD); R(x - 1, y - 6, 26, 3, PAL.gatorD); R(x + 4, y + 2, 16, 1, PAL.grassD); break; }
    case 'billboard': {
      R(x + 16, y - 8, 3, 16, PAL.woodD); R(x + 86, y - 8, 3, 16, PAL.woodD);
      OR(x - 12, y - 52, 128, 46, PAL.white); R(x - 12, y - 52, 128, 11, PAL.blue);
      label('ACCUSED OF BEING', x + 52, y - 42, PAL.white, 7);
      label('A FLORIDA MAN?', x + 52, y - 31, PAL.red, 7);
      label('CALL BRENDA', x + 52, y - 21, PAL.blueD, 7);
      label('1-800-NOT-ME', x + 52, y - 10, PAL.hatD, 7);
      break;
    }
    case 'courthouse': {
      shadow(x + w / 2, y + h + 2, w + 8, 6);
      OR(x, y - 18, w, h + 18, PAL.white);
      OR(x - 4, y - 34, w + 8, 16, PAL.tankD); R(x + w / 2 - 30, y - 34, 60, 3, PAL.white);
      for (let i = 0; i < 6; i++) { OR(x + 12 + i * 28, y - 14, 8, h + 10, PAL.white); R(x + 13 + i * 28, y - 14, 1, h + 10, PAL.tankD); }
      OR(x + w / 2 - 10, y + h - 22, 20, 22, PAL.woodD);
      label('COUNTY COURTHOUSE', x + w / 2, y - 22, PAL.ink === '' ? PAL.ink : PAL.greyD, 7);
      R(x + w - 16, y - 58, 1, 24, PAL.greyD); R(x + w - 15, y - 58, 10, 6, PAL.blue); R(x + w - 15, y - 54, 10, 2, PAL.red);
      break;
    }
    case 'truck': {
      shadow(x + w / 2, y + h, w + 4, 6);
      OR(x, y - 6, w, h - 4, PAL.rust); OR(x + 30, y - 12, 16, 12, PAL.rust); OR(x + 33, y - 10, 11, 7, PAL.waterL);
      R(x + 4, y - 2, 22, 1, PAL.redD);
      OR(x + 4, y + h - 10, 7, 6, PAL.concreteD); OR(x + 36, y + h - 10, 7, 6, PAL.concreteD);   // no wheels, cinder blocks
      if (Game.flags.truckNuts) { R(x - 3, y + 10, 3, 4, PAL.hat); }
      break;
    }
    case 'couch': {
      shadow(x + w / 2, y + h + 2, w + 4, 5);
      OR(x, y - 8, w, 10, PAL.hat); OR(x, y + 2, w, 10, PAL.hatD); OR(x - 3, y - 4, 5, 16, PAL.hat); OR(x + w - 2, y - 4, 5, 16, PAL.hat);
      R(x + 10, y + 4, 7, 3, PAL.stain); R(x + 20, y - 5, 3, 3, PAL.stain);
      break;
    }
    case 'grill': { shadow(x + 8, y + 15, 14); OR(x + 2, y - 2, 12, 8, PAL.greyD); R(x + 4, y + 6, 1, 8, PAL.ink); R(x + 11, y + 6, 1, 8, PAL.ink); break; }
    case 'flamingo': { shadow(x + 5, y + 7, 10); g.drawImage(SPR.flamingo, x, y - 12); break; }
    case 'sign': { R(x + 7, y - 6, 2, 14, PAL.woodD); OR(x - 33, y - 19, 82, 12, PAL.woodL); label('NO TRESPASSIN', x + 8, y - 9, PAL.red, 7); break; }
    case 'porta': { shadow(x + 8, y + 16, 16); OR(x + 1, y - 10, 14, 26, PAL.teal); R(x + 1, y - 12, 14, 3, PAL.white); R(x + 10, y + 3, 2, 2, PAL.red); break; }
    case 'mailbox': { R(x + 3, y - 2, 2, 10, PAL.woodD); OR(x, y - 8, 9, 6, PAL.greyD); R(x + 8, y - 8, 2, 3, PAL.red); break; }
    case 'fence': { R(x, y - 6, TS, 2, PAL.woodL); R(x, y - 2, TS, 2, PAL.woodL); R(x + 1, y - 9, 2, 12, PAL.woodD); break; }
    case 'fencev': { R(x + 1, y, 2, TS, PAL.woodL); R(x, y + 1, 4, 3, PAL.woodD); break; }
    case 'cypress': {
      const sw = Math.sin(t * .7 + p.s * 9) * 1.2;
      shadow(x + 4, y + 7, 22, 6);
      OR(x + 1, y - 8, 7, 14, PAL.mudD); R(x - 2, y + 3, 13, 4, PAL.mudD);
      OR(x - 11 + sw, y - 36, 30, 24, PAL.grassD); R(x - 7 + sw, y - 43, 22, 9, PAL.grassD); R(x - 7 + sw, y - 42, 20, 1, PAL.ink);
      R(x - 5 + sw, y - 33, 10, 7, PAL.grassL); R(x + 7 + sw, y - 28, 6, 4, PAL.grass);
      R(x - 9 + sw, y - 13, 2, 11, PAL.grey); R(x + 14 + sw, y - 14, 2, 13, PAL.grey); R(x + 3 + sw, y - 13, 1, 7, PAL.grey);   // spanish moss
      break;
    }
    case 'palm': {
      const sw = Math.sin(t * .9 + p.s * 9) * 1.6;
      shadow(x + 5, y + 6, 18, 5);
      for (let i = 0; i < 7; i++) { R(x + 1 + i * .5, y - i * 5 - 1, 7, 6, PAL.ink); R(x + 2 + i * .5, y - i * 5, 5, 5, i % 2 ? PAL.mudL : PAL.mud); }
      const tx = x + 6 + sw, ty = y - 34;
      for (const [dx, dy, ww] of [[-16, 0, 15], [2, 0, 15], [-11, -6, 10], [2, -6, 10], [-18, 4, 5], [14, 4, 5], [-3, -9, 7]]) OR(tx + dx, ty + dy, ww, 3, PAL.grassD);
      R(tx - 2, ty - 1, 3, 3, PAL.brown); R(tx + 1, ty + 1, 3, 3, PAL.brown);
      if (Game.cold && hash2(p.x, p.y) > .5) { OR(tx - 6, ty + 3, 8, 3, PAL.gatorL); }   // iguana, waiting to fall
      break;
    }
    case 'reeds': { for (let i = 0; i < 5; i++) { const rx = x + 2 + i * 3 + p.s * 2, sw = Math.sin(t * 1.5 + i + p.s * 5); R(rx + sw * .6, y + 2 + (i % 2) * 3, 1, 11 - (i % 2) * 3, PAL.camo); } R(x + 5 + p.s * 3, y, 2, 5, PAL.brown); break; }
    default: if (typeof drawMiamiProp === 'function') drawMiamiProp(p, x, y, w, h, t); break;
    case 'lily': { R(x + 4, y + 6, 8, 5, PAL.grassDD); R(x + 5, y + 6, 7, 4, PAL.grass); R(x + 8, y + 6, 1, 2, PAL.waterD); if (p.s > .7) R(x + 6, y + 5, 2, 2, PAL.hat); break; }
  }
}
