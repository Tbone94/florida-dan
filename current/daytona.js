// FLORIDA DAN — DAYTONA BEACH. The third map (unlocked after Miami): the Speedway (a big oval with Lake Lloyd
// in the infield and the pits on the front stretch), Main Street biker row, the Donut Hut drive-thru, the
// boardwalk and pier, a beach you can drive on, and the Volusia County Courthouse. Cases live in daytona2.js.
'use strict';
T.TRACK = 13;   // speedway asphalt: no road paint, white edge lines
const DAYTONA = () => Game.region === 'daytona';
// the oval: a tall capsule. Centerline = vertical segment (15.5, 18)→(15.5, 44), radius 11 tiles; track is ±1.5 tiles
const OVAL = { cx: 15.5, y0: 18, y1: 44, r: 11 };
function ovalDist(tx, ty) { const y = Math.max(OVAL.y0, Math.min(OVAL.y1, ty)); return Math.hypot(tx - OVAL.cx, ty - y); }
// points around the centerline, clockwise from the start/finish line on the front (east) stretch
function ovalPath(n = 48, off = 0) {
  const r = OVAL.r + off, pts = [], straight = OVAL.y1 - OVAL.y0, arc = Math.PI * r, total = 2 * straight + 2 * arc;
  for (let i = 0; i < n; i++) {
    let s = (i / n) * total + (31 - OVAL.y0);   // start at y=31 on the east stretch, heading up (north)
    s %= total; let x, y;
    if (s < straight) { x = OVAL.cx + r; y = OVAL.y1 - s; }                                             // east stretch, going north... from y1 up
    else if (s < straight + arc) { const a = (s - straight) / r; x = OVAL.cx + Math.cos(a) * r; y = OVAL.y0 - Math.sin(a) * r; }   // north turn
    else if (s < 2 * straight + arc) { x = OVAL.cx - r; y = OVAL.y0 + (s - straight - arc); }            // west stretch, going south
    else { const a = (s - 2 * straight - arc) / r; x = OVAL.cx - Math.cos(a) * r; y = OVAL.y1 + Math.sin(a) * r; }   // south turn
    pts.push({ x: x * TS, y: y * TS });
  }
  return pts;
}

function buildDaytona() {
  const W = World;
  W.fill(0, 0, MW - 1, MH - 1, T.GRASS);
  for (let y = 0; y < MH; y++) {
    W.set(66, y, T.ROADV); W.set(67, y, T.ROADV);                                                 // A1A
    W.set(68, y, T.CONCRETE);                                                                        // boardwalk edge
    for (let x = 69; x <= 78; x++) W.set(x, y, T.SAND);                                              // the beach (you can drive on it)
    for (let x = 79; x < MW; x++) W.set(x, y, x <= 79 ? T.SHALLOW : x <= 82 ? T.WATER : T.DEEP);   // the Atlantic
  }
  for (let x = 70; x <= 86; x++) { W.set(x, 20, T.DOCK); W.set(x, 21, T.DOCK); }                    // the pier
  for (let x = 29; x <= 65; x++) { W.set(x, 24, T.ROAD); W.set(x, 25, T.ROAD); }                    // Main Street
  for (let x = 26; x <= 28; x++) { W.set(x, 24, T.ROAD); W.set(x, 25, T.ROAD); }                    // the tunnel into the speedway
  for (let y = 26; y <= 57; y++) { W.set(40, y, T.ROADV); W.set(41, y, T.ROADV); }                  // Beach Street, south
  for (let y = 2; y <= 23; y++) { W.set(52, y, T.ROADV); W.set(53, y, T.ROADV); }                   // Courthouse Row, north
  // the speedway
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < 32; tx++) {
    const d = ovalDist(tx + .5, ty + .5);
    if (Math.abs(d - OVAL.r) <= 1.5) W.set(tx, ty, T.TRACK);
    else if (d < OVAL.r - 1.5 && Math.hypot((tx + .5 - OVAL.cx) / 3.2, (ty + .5 - 31) / 6.5) < 1) W.set(tx, ty, T.WATER);   // Lake Lloyd (infield)
  }
  for (let y = 21; y <= 41; y++) W.set(23, y, T.CONCRETE);                                            // pit road, just inside the front stretch
  // lots
  W.fill(42, 26, 56, 31, T.CONCRETE); W.fill(58, 26, 65, 32, T.CONCRETE);
  W.fill(42, 17, 51, 23, T.CONCRETE); W.fill(54, 17, 65, 23, T.CONCRETE);
  W.fill(42, 2, 51, 8, T.CONCRETE); W.fill(54, 9, 65, 15, T.CONCRETE); W.fill(31, 26, 39, 30, T.CONCRETE);

  const P = W.props = [];
  const add = (kind, tx, ty, w, h, solid = true, extra = {}) => { const p = { kind, x: tx * TS, y: ty * TS, w: w * TS, h: h * TS, solid, ...extra }; P.push(p); return p; };
  add('grandstand', 29, 8, 2.4, 14); add('grandstand', 29, 34, 2.4, 20); add('grandstand', 0.2, 12, 2, 38);
  add('gate', 26.2, 22.4, 3, .6, false);
  add('finish', 25, 31, 3, .3, false);
  for (let i = 0; i < 6; i++) add('garage', 19.4, 21.5 + i * 3.4, 2.6, 2.2, true, { n: [29, 3, 8, 88, 43, 24][i] });   // infield garages, #29 first
  add('courthouse', 43, 3, 9, 4);
  add('saloon', 42.6, 19.3, 7, 2.6); add('tattoo', 55, 19.4, 4.4, 2.4); add('newsbox', 51.2, 22.6, .7, .6);
  add('speedshop', 43, 27.5, 6, 2.2); add('station', 32, 27.4, 5, 2); add('donut', 58.6, 27.2, 6, 2.6); add('drivethru', 64.2, 28.2, 1, 2.4, false);
  add('motel2', 55, 10.6, 9.6, 2.4); add('porta', 38.4, 22.2, 1, 1);
  for (let i = 0; i < 7; i++) add('bike', 43 + i * 1.4, 23.2, .9, .5, false, { c: ['#e0433a', '#1a1423', '#ffd23f', '#4f7bd1', '#1a1423', '#e0433a', '#86c94a'][i] });
  for (const [x, y] of [[33, 4], [37, 5], [33, 12], [37.5, 13], [34, 19]]) add('rv', x, y, 3.2, 1.8, true, { c: pick(['#f3eee0', '#e8d39a', '#bfe3e0']) });
  for (const [x, y] of [[36.4, 7.6], [36.2, 15.8]]) add('grill', x, y, 1, 1);
  for (let y = 2; y < MH - 2; y += 4) add('palm', 65.2, y + .5, .5, .4, true, { s: hash2(y, 3) });
  // the south end: flea market, Bike Week parking, and a roadside attraction
  W.fill(43, 38, 55, 47, T.CONCRETE);
  for (const [x, y, c] of [[44, 39.5, '#e0433a'], [47.4, 39.5, '#ffd23f'], [50.8, 39.5, '#27c6b4'], [44, 43.5, '#7b4bc4'], [47.4, 43.5, '#ff8a3d'], [50.8, 43.5, '#86c94a']]) add('tent', x, y, 2.6, 1.6, true, { c });
  add('fleasign', 43.2, 37.4, 2, .5, false);
  for (let i = 0; i < 9; i++) add('bike', 57 + i * 1.1, 36.2, .9, .5, false, { c: ['#1a1423', '#e0433a', '#1a1423', '#4f7bd1', '#ffd23f', '#1a1423', '#86c94a', '#e0433a', '#1a1423'][i] });
  add('sparkplug', 52.6, 52, 1.6, 1.2);
  for (const [x, y] of [[45, 50], [58, 45], [61, 53], [48, 56], [56, 57], [63, 40]]) add('palm', x + .25, y + .55, .5, .4, true, { s: hash2(x, y) });
  for (const [x, y, c] of [[72, 8, '#ff5ea8'], [75, 14, '#27c6b4'], [71, 36, '#ffd23f'], [76, 45, '#ff8a3d'], [73, 53, '#7b4bc4']]) add('umbrella', x, y, .6, .4, false, { c });
  W.spots = {
    dan: { x: 59.8 * TS, y: 13.8 * TS }, door: { x: 59.8 * TS, y: 13.1 * TS }, arrive: { x: 34.5 * TS, y: 30.4 * TS }, stationDoor: { x: 34.5 * TS, y: 29.6 * TS },
    court: { x: 47.5 * TS, y: 7.6 * TS }, pits: { x: 22.4 * TS, y: 30 * TS }, garage29: { x: 22.4 * TS, y: 23 * TS }, gate: { x: 27.5 * TS, y: 24.5 * TS },
    finish: { x: 26.5 * TS, y: 31 * TS }, saloon: { x: 46 * TS, y: 22.6 * TS }, tattoo: { x: 57.2 * TS, y: 22.4 * TS }, speed: { x: 46 * TS, y: 30.4 * TS },
    donut: { x: 61.6 * TS, y: 30.5 * TS }, drive: { x: 64.7 * TS, y: 29.4 * TS }, pier: { x: 85 * TS, y: 20.5 * TS }, hide: { x: 38.9 * TS, y: 24 * TS },
    boat: { x: 84 * TS, y: 30 * TS }, cooler: { x: 37 * TS, y: 31 * TS }, camp: { x: 35 * TS, y: 10 * TS }, beach: { x: 73 * TS, y: 30 * TS },
    dockEnd: { x: 85 * TS, y: 20.5 * TS }, ramp: { x: 70 * TS, y: 30 * TS },
    merle: { x: -999, y: -999 }, darlene: { x: -999, y: -999 }, rhonda: { x: -999, y: -999 }, icemachine: { x: -999, y: -999 }, pasture: { x: -999, y: -999 }, glades: { x: -999, y: -999 },
  };
}

// ---------- drawing ----------
function drawTrackTile(tx, ty, x, y, hs) {
  R(x, y, TS, TS, '#3f3f4a'); if (hs > .7) R(x + hs * 13, y + 7, 1, 1, '#35353f');
  for (const [dx, dy, ex, ey, ew, eh] of [[-1, 0, 0, 0, 1, TS], [1, 0, TS - 1, 0, 1, TS], [0, -1, 0, 0, TS, 1], [0, 1, 0, TS - 1, TS, 1]]) if (World.tile(tx + dx, ty + dy) !== T.TRACK) R(x + ex, y + ey, ew, eh, PAL.white);
}
function drawDaytonaProp(p, x, y, w, h, t) {
  const sign = (text, cx, cy, bg, fg, pad = 6) => { const lw = labelWidth(text); OR(cx - lw / 2 - pad / 2, cy - 9, lw + pad, 11, bg); label(text, cx, cy, fg, 6); };
  switch (p.kind) {
    case 'grandstand': { OR(x, y - 8, w, h + 8, '#5d7fbf'); for (let i = 0; i < h + 8; i += 3) R(x + 2, y - 8 + i, w - 4, 1, i % 6 ? '#3f5f9f' : '#f4efe6'); for (let i = 0; i < h; i += 7) if (hash2(i, p.x) > .4) R(x + 4 + (i % 3) * 5, y + i, 2, 2, [PAL.hat, PAL.yellow, PAL.red, PAL.white][Math.floor(hash2(p.x, i) * 4)]); return true; }   // the crowd
    case 'gate': { R(x, y - 26, 3, 28, PAL.greyD); R(x + w - 3, y - 26, 3, 28, PAL.greyD); sign('SPEEDWAY', x + w / 2, y - 18, PAL.red, PAL.white); return true; }
    case 'finish': { for (let i = 0; i < w / 4; i++) for (let j = 0; j < 2; j++) R(x + i * 4, y + j * 3, 4, 3, (i + j) % 2 ? PAL.black : PAL.white); return true; }
    case 'garage': { shadow(x + w / 2, y + h + 2, w + 4, 5); OR(x, y - 6, w, h + 6, '#d8d3c8'); OR(x + 5, y + 2, w - 10, h - 2, p.n === 29 ? '#2f8f4e' : PAL.greyD); R(x + 5, y + 6, w - 10, 1, PAL.ink); R(x + 5, y + 12, w - 10, 1, PAL.ink); label('#' + p.n, x + w / 2, y - 7, p.n === 29 ? PAL.yellow : PAL.white, 6); return true; }
    case 'courthouse': {
      shadow(x + w / 2, y + h + 3, w + 8, 6); OR(x, y - 16, w, h + 16, '#e9e2d0'); OR(x - 4, y - 24, w + 8, 10, '#d8d0bc');
      for (let i = 10; i < w - 6; i += 16) OR(x + i, y - 12, 6, h + 10, PAL.white); OR(x + w / 2 - 7, y + h - 18, 14, 18, PAL.woodD);
      sign('VOLUSIA COUNTY COURTHOUSE', x + w / 2, y - 18, '#d8d0bc', PAL.ink, 4); return true;
    }
    case 'saloon': {
      shadow(x + w / 2, y + h + 2, w + 6, 6); OR(x, y - 10, w, h + 10, '#5a3a22'); for (let i = 0; i < h + 10; i += 4) R(x, y - 10 + i, w, 1, '#4a2e1a');
      OR(x + 8, y + 2, 18, 10, '#ffb347'); OR(x + w - 26, y + 2, 18, 10, '#ffb347'); OR(x + w / 2 - 8, y + h - 18, 16, 18, PAL.black); R(x + w / 2 - 6, y + h - 14, 5, 8, PAL.woodL); R(x + w / 2 + 1, y + h - 14, 5, 8, PAL.woodL);
      const on = Math.floor(t * 2) % 5 !== 0; sign('THE IRON HOG', x + w / 2, y - 14, PAL.black, on ? '#ff8a3d' : PAL.greyD); return true;
    }
    case 'tattoo': { shadow(x + w / 2, y + h + 2, w + 6, 5); OR(x, y - 8, w, h + 8, '#2a2136'); OR(x + 6, y + 2, 16, 10, '#b86bd6'); OR(x + w - 18, y + h - 16, 12, 16, PAL.black); sign('INK & REGRET', x + w / 2, y - 12, PAL.black, PAL.neon); return true; }
    case 'speedshop': { shadow(x + w / 2, y + h + 2, w + 6, 5); OR(x, y - 8, w, h + 8, '#e9e2d0'); OR(x + 8, y - 2, w - 16, h, PAL.greyD); for (let i = 0; i < w; i += 8) R(x + i, y - 8, 4, 3, (i / 8) % 2 ? PAL.black : PAL.white); sign("WRENCH'S SPEED SHOP", x + w / 2, y - 12, PAL.red, PAL.white); return true; }
    case 'station': { shadow(x + w / 2, y + h + 2, w + 6, 5); OR(x, y - 10, w, h + 10, '#d7dde3'); R(x, y - 10, w, 6, '#3d6fe0'); OR(x + 8, y - 2, 18, 9, '#9fd8ee'); OR(x + w - 20, y + h - 16, 12, 16, PAL.greyD); label('GREYHOUND', x + w / 2, y - 4, PAL.white, 6); return true; }
    case 'donut': {   // a giant donut on the roof, obviously
      shadow(x + w / 2, y + h + 2, w + 6, 6); OR(x, y - 8, w, h + 8, '#fbe3ee'); R(x, y - 8, w, 5, '#ff8fc0'); OR(x + 8, y + 2, 22, 10, '#9fd8ee'); OR(x + w - 22, y + h - 16, 12, 16, PAL.woodD);
      const dx = x + w / 2, dy = y - 26; g.fillStyle = PAL.ink; g.beginPath(); g.arc(dx, dy, 14, 0, 7); g.fill(); g.fillStyle = '#d9a05b'; g.beginPath(); g.arc(dx, dy, 13, 0, 7); g.fill(); g.fillStyle = '#ff8fc0'; g.beginPath(); g.arc(dx, dy - 1, 11, 0, 7); g.fill(); g.fillStyle = PAL.ink; g.beginPath(); g.arc(dx, dy, 5, 0, 7); g.fill(); g.fillStyle = '#9fd18a'; g.beginPath(); g.arc(dx, dy, 4, 0, 7); g.fill();
      for (let i = 0; i < 8; i++) R(dx + Math.cos(i * .8) * 8, dy - 1 + Math.sin(i * .8) * 7, 2, 1, [PAL.yellow, PAL.teal, PAL.white][i % 3]);
      if (!Game.flags.donutSign || Game.flags.signBack) sign('DONUT HUT', x + w / 2, y - 3, PAL.white, PAL.hat);
      return true;
    }
    case 'drivethru': { R(x + 2, y - 4, 3, h + 4, PAL.greyD); OR(x - 2, y - 14, 14, 10, PAL.yellow); label('↓', x + 5, y - 6, PAL.ink, 6); return true; }
    case 'motel2': {
      shadow(x + w / 2, y + h + 2, w + 8, 6); OR(x, y - 10, w, h + 10, '#bfe3e0'); R(x, y - 10, w, 5, '#ff8a3d');
      for (let i = 0; i < 6; i++) { const dx = x + 10 + i * 24; OR(dx, y + h - 20, 10, 17, '#ff8a3d'); OR(dx + 13, y - 1, 8, 7, PAL.waterL); }
      sign('OCEAN BREEZE MOTEL', x + w / 2, y - 14, PAL.white, '#2ba59a'); return true;
    }
    case 'tent': { shadow(x + w / 2, y + h + 2, w + 4, 5); OR(x + 2, y + 2, w - 4, h - 2, PAL.woodL); for (let i = 0; i < w + 4; i += 6) R(x - 2 + i, y - 6, 6, 8, i % 12 ? PAL.white : p.c); OR(x - 2, y - 7, w + 4, 2, p.c); R(x + 6, y + 4, 4, 3, [PAL.yellow, PAL.teal, PAL.hat][Math.floor(hash2(p.x, p.y) * 3)]); return true; }
    case 'fleasign': { R(x + 4, y - 4, 2, 8, PAL.woodD); sign('FLEA MARKET · EVERYTHING $1', x + 16, y - 6, PAL.yellow, PAL.ink); return true; }
    case 'sparkplug': {   // the world's largest spark plug, obviously
      shadow(x + w / 2, y + h + 2, w + 10, 6); OR(x + 8, y - 4, 10, 18, PAL.grey); for (let i = 0; i < 18; i += 3) R(x + 8, y - 4 + i, 10, 1, PAL.greyD);
      OR(x + 6, y - 44, 14, 40, PAL.white); R(x + 8, y - 40, 3, 34, '#e9e2d0'); OR(x + 10, y - 54, 6, 10, PAL.greyD); R(x + 12, y - 60, 2, 6, PAL.grey);
      sign("WORLD'S LARGEST SPARK PLUG", x + 13, y + 26, PAL.red, PAL.white); return true;
    }
    case 'bike': { shadow(x + 7, y + 6, 14, 3); R(x + 1, y + 1, 4, 4, PAL.black); R(x + 10, y + 1, 4, 4, PAL.black); R(x + 3, y - 3, 9, 3, p.c); R(x + 11, y - 6, 1, 4, PAL.grey); return true; }
    case 'rv': { shadow(x + w / 2, y + h + 2, w + 4, 5); OR(x, y - 8, w, h + 8, p.c); R(x, y - 2, w, 3, PAL.orange); OR(x + 6, y - 5, 10, 6, PAL.waterL); OR(x + w - 10, y - 5, 6, 12, PAL.greyD); R(x + w + 2, y - 10, 1, 14, PAL.grey); R(x + w + 3, y - 10, 8, 5, PAL.red); R(x + w + 3, y - 8, 8, 1, PAL.white); return true; }   // + a flag
  }
  return false;
}

// ---------- people ----------
const Daytona = {
  spawn() {
    const S_ = World.spots;
    Game.npcs = [
      makeNPC('tammy', 'Tammy Jo', S_.pits.x, S_.pits.y + 12, 'right'),
      makeNPC('rusty', 'Rusty Lugnuts', S_.garage29.x + 10, S_.garage29.y + 20, 'down'),
      makeNPC('donna', 'Donna', S_.donut.x - 14, S_.donut.y + 10, 'down'),
      makeNPC('tiny', 'Tiny', S_.saloon.x + 20, S_.saloon.y + 14, 'down'),
      makeNPC('needles', 'Needles', S_.tattoo.x, S_.tattoo.y + 10, 'down'),
      makeNPC('wrench', 'Wrench', S_.speed.x, S_.speed.y + 10, 'down'),
      makeNPC('biker', 'Biker', 48 * TS, 26.8 * TS, 'down', { wander: 40 }),
      makeNPC('biker', 'Biker', 60 * TS, 33 * TS, 'down', { wander: 40 }),
      makeNPC('tourist', 'Race Fan', 36 * TS, 9 * TS, 'down', { wander: 50 }),
      makeNPC('tourist', 'Race Fan', 73 * TS, 25 * TS, 'down', { wander: 60 }),
    ];
    const A = Game.animals = [];
    A.push(makeGator(OVAL.cx * TS, 29 * TS, false), makeGator((OVAL.cx - 1) * TS, 33 * TS, false));   // Lake Lloyd has gators. It really does.
    A.push(makeCritter('pelican', 80 * TS, 19.5 * TS), makeCritter('pelican', 74 * TS, 40 * TS));
    if (Game.flags.trashBaby && !Game.flags.tbStay) A.push(makeCritter('raccoon', Game.dan.x + 14, Game.dan.y, { pet: true }));
    const P = Game.pickups = [];
    for (let i = 0, k = 0; i < 7 && k < 400; k++) { const x = rnd(30, 76) * TS, y = rnd(2, 58) * TS, tt = World.at(x, y); if ((tt === T.SAND || tt === T.CONCRETE || tt === T.GRASS) && !World.solidAt(x, y)) { P.push({ kind: pick(['beer', 'beer', 'hotdog', 'scratch', 'cig', 'energy']), x, y }); i++; } }
    Game.vehicles = [];
    if (typeof DaytonaCases !== 'undefined') DaytonaCases.spawn();
  },
  interactions() {
    const D = Game.dan, S_ = World.spots, list = [], near = (p, r) => p && Math.hypot(D.x - p.x, D.y - p.y) < r;
    list.push(...DaytonaCases.interactions());
    if (D.ride) return list;
    if (near(S_.door, 18)) list.push({ label: 'Go to your room (sleep)', fn: () => sleep() });
    if (near(S_.court, 22)) { const cs = Cases.courtCase(); list.push({ label: cs ? 'Enter the courthouse' : 'Volusia County Courthouse (closed)', fn: () => cs ? Court.start(cs) : toast('The Volusia County Courthouse. There’s a NASCAR flag on the flagpole. Under the other flag.') }); }
    if (near(S_.stationDoor, 22)) list.push({ label: 'Greyhound', fn: () => busMenu() });
    if (Game.urgent > 0 && near(S_.hide, 22)) list.push({ label: 'USE THE TOILET', fn: () => { Game.urgent = 0; Sound.play('splash'); toast('Made it. A speedway porta-potty on race week. Dan will not describe it.'); Game.chill = 100; } });
    return list;
  },
};

// ---------- the Greyhound, now with three stops ----------
const REGION_NAMES = { swamp: 'the swamp', miami: 'Miami', daytona: 'Daytona' };
function busMenu() {
  const n = Cases.info().n, F = Game.flags;
  if (n === 4 || n === 5 || ((n === 6 || n === 7) && DAYTONA())) return toast('Brenda would kill you. Finish the case first.');
  const dests = ['swamp', 'miami', 'daytona'].filter(r => r !== Game.region && (r === 'swamp' || (r === 'miami' && (F.case5Won || n >= 4)) || (r === 'daytona' && (F.case5Won))));
  if (!dests.length) return toast('The bus only goes one way right now. Nowhere.');
  say([['DRIVER', 'Where to?', [...dests.map(r => [`To ${REGION_NAMES[r]}`, () => { Game.afterTalk = () => travel(r); return null; }]), ['“Nowhere. Just looking at the bus.”', () => [['DRIVER', 'People do that. It’s a nice bus.']]]]]]);
}
const TRAVEL_LINES = {
  miami: [['', 'Dan boards the Greyhound with a cooler, a jon boat paddle, and no plan.'], ['', 'Six hours. Four stops. One man eating a whole rotisserie chicken in the back row.'], ['', 'MIAMI.']],
  swamp: [['', 'Dan boards the Greyhound. The rotisserie chicken guy is on this bus too.'], ['', 'The swamp welcomes him back with 100% humidity and a mosquito the size of a sparrow.']],
  daytona: [['', 'Dan boards the Greyhound north. The chicken guy is here. He has a second chicken.'], ['', 'Four hours of I-95 billboards: lawyers, fireworks, Jesus, lawyers.'], ['', 'DAYTONA BEACH. The air smells like gasoline and funnel cake.']],
};
