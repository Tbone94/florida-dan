// FLORIDA DAN — ORLANDO. The fifth map and the finale (unlocked after the Atocha Job). West → east along I-4:
// the Greyhound stop + the Kingdom Inn (Dan's motel, a pool, a payphone) → the Big Orange juice stand + its grove →
// SQUEAKYLAND ("The Happiest Place Within City Limits": walls, a front gate, the Cheese Castle, Space Squeak Mountain,
// the teacups, a lagoon) over a parking lot the size of Delaware → International Drive (Sunny Pines Timeshares, the
// Upside-Down House, Volcano Golf, Giant Discount Souvenir World, Knights & Nuggets) → downtown: Lake Lola + the
// Orange County Courthouse. South: Gator Jamboree and Sunset Acres (55+, golf carts only). Cases live in orlando2.js.
'use strict';
const ORLANDO = () => Game.region === 'orlando';
const PARK = { x0: 21, x1: 57, y0: 3, y1: 22 };   // SqueakyLand's inside (tiles)
const inPark = (x, y) => { const tx = x / TS, ty = y / TS; return tx > PARK.x0 - .2 && tx < PARK.x1 + .2 && ty > PARK.y0 - .2 && ty < PARK.y1 + .3; };

function buildOrlando() {
  const W = World;
  W.fill(0, 0, MW - 1, MH - 1, T.GRASS);
  const lake = (cx, cy, rx, ry, deep = true) => { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2; if (d <= 1) W.set(x, y, deep && d < .38 ? T.DEEP : d < .72 ? T.WATER : T.SHALLOW); } };
  // I-4 (east-west), International Drive (north-south), the side streets
  for (let x = 0; x < MW; x++) { W.set(x, 29, T.ROAD); W.set(x, 30, T.ROAD); }
  for (let y = 0; y < MH; y++) { W.set(68, y, T.ROADV); W.set(69, y, T.ROADV); }
  for (let y = 31; y < MH; y++) { W.set(12, y, T.ROADV); W.set(13, y, T.ROADV); }
  for (let x = 14; x <= 67; x++) { W.set(x, 44, T.ROAD); W.set(x, 45, T.ROAD); }
  // SqueakyLand: pavers inside the walls, a lagoon, flower beds, the parking lot out front
  W.fill(PARK.x0, PARK.y0, PARK.x1, PARK.y1, T.PLAZA);
  lake(26.2, 17.3, 4.8, 4.6); W.fill(33, 13, 35, 16, T.GRASS); W.fill(43, 13, 45, 16, T.GRASS);
  W.fill(18, 23, 60, 28, T.CONCRETE); W.fill(37, 22, 41, 22, T.PLAZA);
  // downtown: Lake Lola (swan boats), a dock, the courthouse plaza
  lake(79.3, 7.8, 7.6, 5.2); W.fill(78, 7, 80, 8, T.SAND); for (let x = 70; x <= 73; x++) W.set(x, 8, T.DOCK);
  W.fill(74, 16, 87, 22, T.CONCRETE);
  // south: Gator Jamboree's pond, the Sunset Acres retention pond, Volcano Golf's lagoon + bunkers
  lake(27.2, 54.6, 6.6, 4.4); lake(53.6, 54.2, 3.9, 3.3, false); lake(85, 42.9, 3, 2.9, false); W.fill(74, 44, 76, 45, T.SAND);
  W.fill(70, 31, 87, 32, T.SIDEWALK); W.fill(70, 47, 87, 48, T.SIDEWALK);

  const P = W.props = [];
  const add = (kind, tx, ty, w, h, solid = true, extra = {}) => { const p = { kind, x: tx * TS, y: ty * TS, w: w * TS, h: h * TS, solid, ...extra }; P.push(p); return p; };
  // the west end: bus, motel, pool, payphone, the Big Orange and its grove
  add('station', 3, 26.4, 5, 2); add('oinn', 1.5, 34.2, 8, 2.6); add('opool', 2.4, 38.8, 6.2, 2.4); add('ophone', 9.9, 36.6, .7, .5);
  add('oorange', 15, 34.6, 4.2, 2.6); for (const [x, y] of [[15.4, 39], [18, 39.2], [20.6, 39], [15.6, 41.8], [18.2, 42], [20.8, 41.8]]) add('otree', x, y, .8, .5, true, { s: hash2(x * 3, y) });
  // SqueakyLand: the walls, the gate, the castle, the rides
  add('owall', 20, 2, 38, 1); add('owallv', 20, 3, 1, 19.6); add('owallv', 57.6, 3, 1, 19.6);
  add('owall', 20, 22.2, 17, .8); add('owall', 42, 22.2, 16.6, .8); add('ogate', 37, 22.1, 5, .9);
  add('ocastle', 34.5, 7.5, 10, 3.5); add('ocoaster', 47, 6.4, 8.4, 4.2); add('oteacups', 23.4, 5, 6.2, 3); add('ofountain', 38.7, 15, 1.6, 1);
  add('oflower', 33.2, 13.4, 2.6, 2.4, false); add('oflower', 43.2, 13.4, 2.6, 2.4, false);
  add('ocart', 33, 19, 1.4, .7, true, { c: '#ff5ea8', text: 'CHURROS $14' }); add('ocart', 44.6, 19, 1.4, .7, true, { c: '#27c6b4', text: 'EARS $40' }); add('ocart', 50, 13, 1.4, .7, true, { c: '#ffd23f', text: 'LEGS $22' });
  for (let y = 13; y <= 20; y += 3) { add('olamp', 37.3, y, .3, .3, false); add('olamp', 41.4, y, .3, .3, false); }
  // the parking lot + I-4
  for (const [x, y, c] of [[20, 24.4, '#e0433a'], [23, 26.6, '#f4efe6'], [27, 24.4, '#4f7bd1'], [31, 26.6, '#86c94a'], [46, 24.4, '#ffd23f'], [50, 26.6, '#b86bd6'], [54, 24.4, '#f4efe6'], [58, 26.6, '#ff8a3d']]) add('ocar', x, y, 1.6, .9, false, { c });
  add('olotsign', 34, 25.6, 1, .4, false, { text: 'LOT: CHEDDAR 7B', c: '#b86bd6' }); add('olotsign', 44, 25.6, 1, .4, false, { text: 'LOT: BRIE 40', c: '#27c6b4' });
  add('porta', 62.6, 26.2, 1, 1); add('newsbox', 70.6, 31.1, .7, .6);
  add('obill', 38, 34.6, 7, .4, false, { text: 'SQUEAKYLAND · 5 MIN*', sub: '*40 MIN' }); add('obill', 54, 34.6, 9, .4, false, { text: 'I-4 · UNDER CONSTRUCTION SINCE 1991', sub: 'THANK YOU FOR YOUR PATIENCE' });
  add('obill', 24.5, 34.6, 10, .4, false, { text: 'MOUSE BITE? 1-800-SUE-MICE', sub: 'SQUEAK, SQUEAK & PARTNERS' });
  for (const x of [16, 33, 50, 64, 80]) add('ocone', x, 29.95, .5, .3, false);
  add('ojam', 22, 29.2, 1.8, .6, true, { c: '#f4efe6' }); add('ojam', 41, 30.1, 1.8, .6, true, { c: '#e0433a' }); add('ojam', 57, 29.2, 1.8, .6, true, { c: '#4f7bd1' }); add('ojam', 76, 30.1, 1.8, .6, true, { c: '#86c94a' });
  // International Drive
  add('otimeshare', 71.5, 33.6, 7, 2.6); add('oupside', 80, 33.4, 6.4, 3); add('ovolcano', 75, 40.4, 5, 3); add('ogolfsign', 73, 38.8, 1, .4, false);
  add('osouvenir', 71.2, 50, 8, 2.6); add('oknights', 80.6, 50, 7, 2.8);
  // downtown
  add('ocourt', 75.5, 18, 9, 3.2); add('ofountain', 78.7, 7.2, 1.6, 1, true, { lake: true });
  for (const [x, y, s] of [[75, 5, 0], [83, 10, 1.3], [81, 4.6, 2.2]]) add('oswan', x, y, 1, .6, false, { s });
  // south: Gator Jamboree, Sunset Acres
  add('ogators', 22.5, 46.4, 7, 2.2); add('ogsign', 30.6, 48.6, 1, .4, false);
  for (const [x, y, c] of [[37, 47, '#ffd6e0'], [42.5, 47, '#d6f0ff'], [37, 53.4, '#fff2c2'], [42.5, 53.4, '#e2ffd6'], [59, 47, '#f0d6ff']]) add('ohouse', x, y, 4, 2, true, { c });
  add('ocart2', 47.2, 48.8, 1.4, .8, true, { c: '#ffffff' }); add('ocart2', 47.6, 54.6, 1.4, .8, true, { c: '#ffd6e0' }); add('oacres', 36.5, 51.2, 1, .4, false);
  add('ohole', 46, 57, .4, .3, false);
  for (const [x, y] of [[2, 21], [9, 22], [15, 24], [62, 23], [65, 16], [66, 5], [88, 14], [71, 26], [86, 27], [3, 47], [8, 54], [17, 56], [35, 58], [62, 55], [66, 41], [88, 37], [60, 36], [45, 35], [30, 36], [22, 33], [24, 10], [31, 11], [48, 12], [55, 15], [55, 20], [22, 4], [56, 10]])
    add('palm', x + .25, y + .55, .5, .4, true, { s: hash2(x, y) });
  W.spots = {
    dan: { x: 5.5 * TS, y: 37.9 * TS }, door: { x: 5.5 * TS, y: 37.2 * TS }, arrive: { x: 5.5 * TS, y: 28.8 * TS }, stationDoor: { x: 5.5 * TS, y: 28.9 * TS },
    court: { x: 80 * TS, y: 21.8 * TS }, hide: { x: 63.1 * TS, y: 27.6 * TS }, boat: { x: 86.2 * TS, y: 8.6 * TS }, cooler: { x: 10.4 * TS, y: 32.6 * TS },
    dockEnd: { x: 73.4 * TS, y: 8.5 * TS }, ramp: { x: 72 * TS, y: 8.5 * TS }, beach: { x: 79 * TS, y: 7.8 * TS }, pier: { x: 72.5 * TS, y: 8.5 * TS },
    gateOut: { x: 39.5 * TS, y: 23.9 * TS }, gateIn: { x: 39.5 * TS, y: 21.3 * TS }, castle: { x: 39.5 * TS, y: 11.6 * TS }, photo: { x: 39.5 * TS, y: 13 * TS },
    coaster: { x: 51.2 * TS, y: 11.4 * TS }, orange: { x: 17 * TS, y: 37.9 * TS }, grove: { x: 18 * TS, y: 40.6 * TS }, gators: { x: 27.5 * TS, y: 49 * TS }, pond: { x: 53.6 * TS, y: 50.4 * TS },
    timeshare: { x: 75 * TS, y: 36.8 * TS }, volcano: { x: 77.5 * TS, y: 44 * TS }, souvenir: { x: 75.2 * TS, y: 53.1 * TS }, knights: { x: 84 * TS, y: 53.3 * TS }, upside: { x: 83.2 * TS, y: 37 * TS },
    acres: { x: 45 * TS, y: 51 * TS }, onramp: { x: 63.5 * TS, y: 30.6 * TS }, pool: { x: 5.5 * TS, y: 42.3 * TS }, phone: { x: 10.2 * TS, y: 37.6 * TS }, lola: { x: 71 * TS, y: 9 * TS },
    merle: { x: -999, y: -999 }, darlene: { x: -999, y: -999 }, rhonda: { x: -999, y: -999 }, icemachine: { x: -999, y: -999 }, pasture: { x: -999, y: -999 }, glades: { x: -999, y: -999 },
  };
}

// ---------- drawing ----------
// the mouse, as the park draws him everywhere: a round head, two round ears. Legally distinct (he's grey).
function mouseHead(cx, cy, r, c = '#3a3440', inner = '#ff9ec7') {
  const disc = (x, y, rr, col) => { g.fillStyle = col; g.beginPath(); g.arc(Math.round(x), Math.round(y), rr, 0, 7); g.fill(); };
  disc(cx - r * .95, cy - r * .85, r * .62 + 1, PAL.ink); disc(cx + r * .95, cy - r * .85, r * .62 + 1, PAL.ink); disc(cx, cy, r + 1, PAL.ink);
  disc(cx - r * .95, cy - r * .85, r * .62, c); disc(cx + r * .95, cy - r * .85, r * .62, c); disc(cx, cy, r, c);
  if (r >= 4) { disc(cx - r * .95, cy - r * .85, r * .3, inner); disc(cx + r * .95, cy - r * .85, r * .3, inner); }
}
function drawOrlandoProp(p, x, y, w, h, t) {
  const sign = (text, cx, cy, bg, fg, pad = 6) => { const lw = labelWidth(text, 6); OR(cx - lw / 2 - pad / 2, cy - 9, lw + pad, 11, bg); label(text, cx, cy, fg, 6); };
  const shack = (body, roof, trim) => { shadow(x + w / 2, y + h + 2, w + 6, 5); OR(x, y - 10, w, h + 10, body); for (let i = 0; i < w; i += 6) R(x + i, y - 16, 6, 7, i % 12 ? roof : trim); OR(x - 2, y - 17, w + 4, 2, trim); };
  const night = Game.hour > 19.5 || Game.hour < 6;
  switch (p.kind) {
    case 'oinn': {   // the Kingdom Inn: two floors of doors, a crown on the sign, "11 miles from the park (minutes away!)"
      shadow(x + w / 2, y + h + 2, w + 8, 6); OR(x, y - 18, w, h + 18, '#f6e7c8'); R(x, y - 18, w, 4, '#7b4bc4'); R(x, y - 3, w, 2, '#e5d3ad');
      for (let i = 0; i < 5; i++) { const dx = x + 8 + i * 24; OR(dx, y + h - 19, 10, 17, i === 2 ? '#e0433a' : '#7b4bc4'); OR(dx + 12, y - 12, 8, 6, night ? '#ffe9a8' : PAL.waterL); OR(dx + 12, y + 3, 8, 6, night ? '#ffe9a8' : PAL.waterL); }
      label('214', x + 61, y + h - 21, PAL.yellow, 5);
      const sx = x + w - 12; R(sx, y - 42, 2, 24, PAL.greyD); OR(sx - 20, y - 50, 42, 13, '#7b4bc4'); R(sx - 8, y - 56, 3, 5, PAL.yellow); R(sx - 1, y - 58, 3, 7, PAL.yellow); R(sx + 6, y - 56, 3, 5, PAL.yellow);
      label('KINGDOM INN', sx + 1, y - 41, night && Math.floor(t * 2) % 7 ? '#ff9ec7' : PAL.yellow, 5);
      sign('MINUTES FROM THE PARK*', x + 44, y - 25, PAL.white, '#7b4bc4', 4); return true;
    }
    case 'opool': {   // kidney-shaped-ish, extremely chlorinated. Manny summers here now.
      OR(x - 2, y - 2, w + 4, h + 4, '#e8e2d2'); R(x, y, w, h, '#4fd0e8'); for (let i = 0; i < 6; i++) R(x + 4 + ((i * 13 + t * 9) % (w - 8)), y + 4 + (i % 3) * 10, 6, 1, '#b8f4ff');
      R(x + w - 10, y - 3, 2, 8, PAL.grey); R(x + w - 6, y - 3, 2, 8, PAL.grey); label('NO DIVING · NO GATORS', x + w / 2, y + h + 9, PAL.greyD, 4);
      if (Game.flags.gangHere) { const bob = Math.sin(t * 1.5) * 1.5; g.drawImage(SPR.manatee, Math.round(x + w / 2 - 12), Math.round(y + 8 + bob)); if (Math.floor(t / 3) % 3 === 0) label('Daaaniel.', x + w / 2, y + 4, PAL.glow, 5); }
      return true;
    }
    case 'ophone': { R(x + 4, y - 12, 2, 16, PAL.greyD); OR(x - 1, y - 22, 12, 12, '#c9c2b4'); R(x + 1, y - 20, 8, 5, PAL.ink); R(x + 2, y - 13, 6, 2, PAL.greyD); label('☎', x + 5, y - 25, PAL.yellow, 5); return true; }
    case 'oorange': {   // a juice stand shaped like a giant orange, obviously
      shadow(x + w / 2, y + h + 2, w + 8, 6); const cx = x + w / 2, cy = y + 10;
      g.fillStyle = PAL.ink; g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.fill(); g.fillStyle = '#ff9a2e'; g.beginPath(); g.arc(cx, cy, 29, 0, 7); g.fill();
      g.fillStyle = '#ffb65c'; g.beginPath(); g.arc(cx - 9, cy - 10, 10, 0, 7); g.fill(); for (let i = 0; i < 14; i++) R(cx + Math.cos(i * 2.3) * 20, cy + Math.sin(i * 2.3) * 20, 1, 1, '#e07a1a');
      OR(cx - 4, cy - 36, 8, 6, '#3e8f5a'); R(cx + 3, cy - 38, 8, 3, '#5aa83a');
      OR(cx - 16, cy + 6, 32, 12, '#fff1d6'); R(cx - 16, cy + 6, 32, 3, '#e0433a'); label('JUICE', cx, cy + 16, '#e0433a', 5);
      sign('THE BIG ORANGE', cx, cy - 40, '#ff9a2e', PAL.white, 4); return true;
    }
    case 'otree': {   // an orange tree: punch it
      const sh = p.shake > 0 ? Math.round(Math.sin(t * 60) * 2) : 0; p.shake = Math.max(0, (p.shake || 0) - 1 / 60);
      shadow(x + 6, y + 8, 22, 6); R(x + 5, y - 6, 3, 14, PAL.woodD);
      g.fillStyle = PAL.ink; g.beginPath(); g.arc(x + 6 + sh, y - 12, 12, 0, 7); g.fill(); g.fillStyle = '#3e7f2c'; g.beginPath(); g.arc(x + 6 + sh, y - 12, 11, 0, 7); g.fill();
      g.fillStyle = '#5aa83a'; g.beginPath(); g.arc(x + 3 + sh, y - 15, 6, 0, 7); g.fill();
      const n = Math.max(0, 4 - (p.picked || 0)); for (let i = 0; i < n; i++) R(x + sh + [0, 9, 3, 11][i], y - [17, 14, 7, 9][i], 3, 3, '#ff9a2e');
      return true;
    }
    case 'owall': {   // pink stucco curtain wall with a scalloped top. The magic stays IN.
      R(x, y - 8, w, h + 8, '#f7c6d9'); R(x, y + h - 2, w, 2, '#d99ab4'); for (let i = 0; i < w; i += 8) { R(x + i, y - 12, 5, 4, '#f7c6d9'); R(x + i, y - 12, 5, 1, PAL.white); }
      R(x, y - 8, w, 1, PAL.ink); R(x, y + h, w, 1, PAL.ink); return true;
    }
    case 'owallv': { R(x, y - 8, w, h + 8, '#f7c6d9'); R(x + w - 3, y - 8, 3, h + 8, '#d99ab4'); R(x, y - 8, 1, h + 8, PAL.ink); R(x + w, y - 8, 1, h + 8, PAL.ink); for (let i = 0; i < h; i += 24) R(x + 3, y + i, 8, 8, '#ffe0ec'); return true; }
    case 'ogate': {   // the front gate: turnstiles and a big arch (see-through while Dan is right behind it, inside)
      const D = Game.dan, behind = inPark(D.x, D.y) && Math.abs(D.x - p.x - p.w / 2) < 60 && D.y > p.y - 48 && D.y < p.y + 4; if (behind) g.globalAlpha = .4;
      R(x - 4, y - 36, 4, h + 36, '#f7c6d9'); R(x + w, y - 36, 4, h + 36, '#f7c6d9'); OR(x - 6, y - 44, w + 12, 10, '#7b4bc4');
      label('SQUEAKYLAND', x + w / 2, y - 36, PAL.yellow, 6); mouseHead(x + w / 2, y - 50, 5);
      for (let i = 0; i < 4; i++) { const tx = x + 6 + i * 18; OR(tx, y - 6, 8, h + 2, PAL.grey); R(tx - 4, y - 2 + Math.round(Math.sin(t * 3 + i)), 16, 2, PAL.greyD); }
      g.globalAlpha = 1; return true;
    }
    case 'ocastle': {   // the Cheese Castle: pale yellow towers, blue roofs, a mouse head on the top spire
      shadow(x + w / 2, y + h + 3, w + 14, 7);
      const tower = (tx, top, tw, roof) => { OR(tx, top, tw, y + h - top, '#fff0b8'); R(tx + tw - 3, top, 3, y + h - top, '#f0d98a'); g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(tx - 2, top + 1); g.lineTo(tx + tw / 2, top - roof - 1); g.lineTo(tx + tw + 2, top + 1); g.fill(); g.fillStyle = '#4f7bd1'; g.beginPath(); g.moveTo(tx, top); g.lineTo(tx + tw / 2, top - roof); g.lineTo(tx + tw, top); g.fill(); R(tx + tw / 2, top - roof - 6, 1, 6, PAL.grey); R(tx + tw / 2 + 1, top - roof - 6, 5, 3, '#ff5ea8'); };
      OR(x, y - 30, w, h + 30, '#ffe79a'); for (let i = 0; i < w; i += 8) R(x + i, y - 34, 5, 4, '#ffe79a');
      tower(x - 4, y - 40, 18, 14); tower(x + w - 14, y - 40, 18, 14); tower(x + 30, y - 58, 20, 20); tower(x + w - 50, y - 58, 20, 20); tower(x + w / 2 - 12, y - 76, 24, 22);
      mouseHead(x + w / 2, y - 106, 5);
      for (const [wx, wy] of [[x + 34, y - 46], [x + w - 42, y - 46], [x + w / 2 - 4, y - 66], [x + 6, y - 28], [x + w - 12, y - 28]]) OR(wx, wy, 6, 8, night ? '#ffe9a8' : '#9fd8ee');
      OR(x + w / 2 - 12, y + h - 26, 24, 26, '#7a4a2b'); g.fillStyle = '#7a4a2b'; g.beginPath(); g.arc(x + w / 2, y + h - 26, 12, Math.PI, 0); g.fill(); R(x + w / 2, y + h - 36, 1, 36, '#5a3620');
      if (Game.flags.memo) label('HQ', x + w / 2, y + h - 30, PAL.yellow, 5);
      return true;
    }
    case 'ocoaster': {   // Space Squeak Mountain: a white cone with spikes, a track wrapped round it
      shadow(x + w / 2, y + h + 3, w + 10, 7); const cx = x + w / 2, by = y + h;
      g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(x - 3, by + 1); g.lineTo(cx, y - 60); g.lineTo(x + w + 3, by + 1); g.fill();
      g.fillStyle = '#f4f1ea'; g.beginPath(); g.moveTo(x - 1, by); g.lineTo(cx, y - 57); g.lineTo(x + w + 1, by); g.fill();
      g.fillStyle = '#dcd6ca'; g.beginPath(); g.moveTo(cx, y - 57); g.lineTo(x + w + 1, by); g.lineTo(cx + 10, by); g.fill();
      for (let i = 0; i < 6; i++) { const k = i / 6, sx = lerp(x + 6, cx - 3, k), sy = lerp(by - 4, y - 46, k); R(sx, sy - 6, 2, 8, '#8d8a93'); R(x + w - (sx - x) - 2, sy - 6, 2, 8, '#8d8a93'); }
      g.strokeStyle = '#27c6b4'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 40; i++) { const k = i / 40, yy = lerp(by - 4, y - 40, k), ww = lerp(w / 2 + 6, 6, k); g.lineTo(cx + Math.sin(k * 14 + t * .5) * ww, yy); } g.stroke();
      const car = (t * .25) % 1, ck = car, cyy = lerp(by - 4, y - 40, ck), cww = lerp(w / 2 + 6, 6, ck); R(cx + Math.sin(ck * 14 + t * .5) * cww - 2, cyy - 3, 5, 3, '#e0433a');
      OR(cx - 12, by - 12, 24, 12, '#2a2136'); label('ENTER', cx, by - 3, '#27c6b4', 4);
      sign('SPACE SQUEAK MOUNTAIN', cx, y - 64, '#2a2136', '#27c6b4', 4); return true;
    }
    case 'oteacups': {   // spinning cups on a big spinning plate
      shadow(x + w / 2, y + h + 2, w + 6, 6); g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2 + 1, h / 2 + 1, 0, 0, 7); g.fill(); g.fillStyle = '#b8e0f7'; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7); g.fill();
      for (let i = 0; i < 5; i++) { const a = t * .8 + i * 1.256, cx = x + w / 2 + Math.cos(a) * w * .32, cy = y + h / 2 + Math.sin(a) * h * .28, c = ['#ff5ea8', '#ffd23f', '#86c94a', '#b86bd6', '#ff8a3d'][i]; OR(cx - 7, cy - 8, 14, 9, c); R(cx - 6, cy - 8, 12, 2, PAL.white); R(cx + 7, cy - 6, 2, 4, c); }
      sign('MAD TEACUPS', x + w / 2, y - 6, PAL.white, '#b86bd6', 4); return true;
    }
    case 'ofountain': {
      shadow(x + w / 2, y + h + 2, w + 6, 4); OR(x - 2, y + 2, w + 4, h - 1, p.lake ? '#e8e2d2' : '#f7c6d9'); R(x, y + 3, w, h - 4, '#4fd0e8');
      for (let i = 0; i < 6; i++) { const k = ((t * 1.5 + i / 6) % 1); R(x + w / 2 - 1 + Math.sin(i * 2) * k * 8, y - 14 + k * k * 18, 2, 2, '#d8f7f5'); }
      R(x + w / 2 - 1, y - 16, 2, 16, '#b8f4ff'); if (!p.lake) mouseHead(x + w / 2, y - 18, 3); return true;
    }
    case 'oflower': {   // a mouse head made of flowers. Every park has one. This one is grey.
      const cx = x + w / 2, cy = y + h / 2 + 2; mouseHead(cx, cy, 9, '#ff5ea8', '#ffd23f');
      for (let i = 0; i < 16; i++) R(cx + Math.cos(i * 2.4) * (i % 7), cy + Math.sin(i * 2.4) * (i % 7), 1, 1, i % 2 ? PAL.white : '#ffd23f'); return true;
    }
    case 'ocart': { shadow(x + w / 2, y + h + 1, w + 6, 4); OR(x, y - 6, w, h + 6, PAL.white); R(x, y - 6, w, 3, p.c); for (let i = 0; i < w + 4; i += 4) R(x - 2 + i, y - 16, 4, 6, i % 8 ? PAL.white : p.c); R(x + 2, y + h, 3, 2, PAL.ink); R(x + w - 5, y + h, 3, 2, PAL.ink); label(p.text, x + w / 2, y - 18, p.c === '#ffd23f' ? '#b8862a' : p.c, 4); return true; }
    case 'olamp': { R(x + 1, y - 18, 2, 20, '#3a3440'); OR(x - 2, y - 24, 8, 6, night ? '#ffe9a8' : '#fff7d6'); R(x - 3, y - 25, 10, 1, '#3a3440'); return true; }
    case 'ocar': { shadow(x + w / 2, y + h + 1, w + 4, 4); OR(x, y - 4, w, h + 2, p.c); OR(x + 5, y - 3, w - 10, 6, PAL.waterL); R(x + 2, y + h - 2, 4, 3, PAL.ink); R(x + w - 6, y + h - 2, 4, 3, PAL.ink); return true; }
    case 'olotsign': { R(x + 7, y - 16, 2, 18, PAL.greyD); mouseHead(x + 8, y - 22, 5, p.c, PAL.white); label(p.text, x + 8, y - 32, p.c, 4); return true; }
    case 'obill': {   // I-4 billboards: lawyers, the park, the road work
      R(x + 8, y - 22, 3, 24, PAL.woodD); R(x + w - 11, y - 22, 3, 24, PAL.woodD); OR(x, y - 40, w, 20, PAL.white); R(x, y - 40, w, 3, '#e0433a');
      label(p.text, x + w / 2, y - 30, PAL.ink, 5); label(p.sub, x + w / 2, y - 23, '#e0433a', 4); return true;
    }
    case 'ocone': { R(x + 1, y - 7, 6, 9, '#ff8a3d'); R(x + 1, y - 4, 6, 2, PAL.white); R(x, y + 1, 8, 2, PAL.ink); return true; }
    case 'ojam': {   // I-4 traffic that has not moved since Tuesday
      shadow(x + w / 2, y + h + 1, w + 4, 4); OR(x, y - 6, w, h + 4, p.c); OR(x + 6, y - 5, w - 14, 6, PAL.waterL); R(x + w - 3, y - 2, 2, 2, PAL.red);
      if (Math.floor(t * 1.3 + x) % 5 === 0) label('HONK', x + w / 2, y - 12, PAL.yellow, 5); return true;
    }
    case 'otimeshare': {
      shack('#fff7ec', '#27c6b4', PAL.white); OR(x + 8, y + 2, 26, 10, PAL.waterL); OR(x + w - 20, y + h - 16, 12, 16, '#27c6b4');
      for (let i = 0; i < 5; i++) R(x + w - 44 + i * 5, y + 4 + Math.round(Math.sin(t * 6 + i) * 1), 3, 7, ['#ff5ea8', '#ffd23f', '#86c94a', '#27c6b4', '#ff8a3d'][i]);   // balloons
      sign('SUNNY PINES TIMESHARES', x + w / 2, y - 20, '#27c6b4', PAL.white, 4); OR(x + w / 2 - 44, y + h + 2, 88, 9, PAL.yellow); label('FREE PARK TICKETS!*', x + w / 2, y + h + 10, '#e0433a', 5); return true;
    }
    case 'oupside': {   // a house, upside down, on its roof. You enter through the chimney, allegedly.
      shadow(x + w / 2, y + h + 3, w + 8, 6); g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(x - 4, y - 2); g.lineTo(x + w / 2, y + h + 1); g.lineTo(x + w + 4, y - 2); g.fill();
      g.fillStyle = '#b86bd6'; g.beginPath(); g.moveTo(x - 2, y - 1); g.lineTo(x + w / 2, y + h - 1); g.lineTo(x + w + 2, y - 1); g.fill();
      OR(x, y - 34, w, 33, '#fff7ec'); for (const wx of [x + 10, x + w - 22]) { OR(wx, y - 28, 12, 10, PAL.waterL); R(wx + 5, y - 28, 1, 10, PAL.white); }
      OR(x + w / 2 - 6, y - 34, 12, 16, '#7a4a2b'); R(x + w / 2 + 3, y - 22, 2, 2, '#ffd23f'); R(x + w - 16, y - 42, 6, 8, '#8d8a93');
      sign('THE UPSIDE-DOWN HOUSE', x + w / 2, y - 46, '#b86bd6', PAL.white, 4); return true;
    }
    case 'ovolcano': {   // Volcano Golf: 18 holes and a volcano that erupts on the hour (it's a propane tank)
      shadow(x + w / 2, y + h + 3, w + 14, 7); const cx = x + w / 2, by = y + h;
      g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(x - 10, by + 1); g.lineTo(cx - 10, y - 30); g.lineTo(cx + 10, y - 30); g.lineTo(x + w + 10, by + 1); g.fill();
      g.fillStyle = '#6b4a2e'; g.beginPath(); g.moveTo(x - 8, by); g.lineTo(cx - 9, y - 28); g.lineTo(cx + 9, y - 28); g.lineTo(x + w + 8, by); g.fill();
      g.fillStyle = '#8a5a3a'; g.beginPath(); g.moveTo(cx - 9, y - 28); g.lineTo(x - 8, by); g.lineTo(cx - 12, by); g.fill();
      for (let i = 0; i < 4; i++) R(cx - 6 + i * 4, y - 28 + i * 9, 3, 12, '#ff5a1f');
      const erupt = (Game.hour % 1) < .08 || Game.flags.volcanoT > Game.t; R(cx - 8, y - 32, 16, 4, erupt ? '#ffd23f' : '#ff8a3d');
      if (erupt) for (let i = 0; i < 8; i++) { const k = (t * 2 + i / 8) % 1; R(cx + Math.sin(i * 3) * 20 * k, y - 34 - Math.sin(k * Math.PI) * 30, 3, 3, i % 2 ? '#ffd23f' : '#ff5a1f'); }
      return true;
    }
    case 'ogolfsign': { R(x + 7, y - 18, 2, 20, PAL.woodD); sign('VOLCANO GOLF', x + 8, y - 20, '#ff5a1f', PAL.white, 4); label('18 HOLES OF LAVA', x + 8, y - 8, '#ff5a1f', 4); return true; }
    case 'osouvenir': {
      shack('#fff1a8', '#e0433a', PAL.white); OR(x + 8, y + 2, 34, 10, PAL.waterL); for (let i = 0; i < 5; i++) mouseHead(x + 13 + i * 6, y + 8, 2, ['#3a3440', '#ff5ea8', '#e0433a', '#27c6b4', '#ffd23f'][i]);
      OR(x + w - 20, y + h - 16, 12, 16, '#e0433a'); sign('GIANT SOUVENIR WORLD', x + w / 2, y - 20, '#e0433a', PAL.yellow, 4); label('70% OFF · ALWAYS', x + w / 2 + 14, y - 3, '#e0433a', 5); return true;
    }
    case 'oknights': {   // Knights & Nuggets: a dinner tournament in a stucco castle
      shadow(x + w / 2, y + h + 3, w + 8, 6); OR(x, y - 14, w, h + 14, '#c9c2b4'); for (let i = 0; i < w; i += 10) OR(x + i, y - 22, 6, 8, '#c9c2b4'); for (let i = 0; i < w; i += 6) R(x + i, y - 6 + (i % 12 ? 0 : 3), 5, 1, '#a9a39a');
      OR(x + w / 2 - 8, y + h - 18, 16, 18, '#7a4a2b'); R(x + 10, y - 34, 1, 14, PAL.grey); R(x + 11, y - 34 + Math.round(Math.sin(t * 5)), 8, 5, '#e0433a'); R(x + w - 12, y - 34, 1, 14, PAL.grey); R(x + w - 11, y - 34 + Math.round(Math.cos(t * 5)), 8, 5, '#4f7bd1');
      sign('KNIGHTS & NUGGETS', x + w / 2, y - 26, '#7b4bc4', PAL.yellow, 4); return true;
    }
    case 'ocourt': {
      shadow(x + w / 2, y + h + 3, w + 8, 6); OR(x, y - 22, w, h + 22, '#fbf2e0'); OR(x - 4, y - 30, w + 8, 10, '#ff9a2e'); g.fillStyle = '#ff9a2e'; g.beginPath(); g.arc(x + w / 2, y - 30, 12, Math.PI, 0); g.fill();
      R(x + w / 2 - 1, y - 48, 2, 8, PAL.grey); for (let i = 8; i < w - 6; i += 16) OR(x + i, y - 18, 6, h + 16, PAL.white); OR(x + w / 2 - 8, y + h - 20, 16, 20, PAL.woodD);
      sign('ORANGE COUNTY COURTHOUSE', x + w / 2, y - 20, '#ff9a2e', PAL.white, 4); return true;
    }
    case 'oswan': {   // swan paddle boats on Lake Lola
      const bob = Math.round(Math.sin(t * 1.3 + p.s) * 1), sx = x + Math.round(Math.sin(t * .2 + p.s) * 6);
      OR(sx - 1, y + 2 + bob, 16, 7, PAL.white); R(sx + 12, y - 8 + bob, 3, 11, PAL.white); R(sx + 11, y - 9 + bob, 5, 3, PAL.white); R(sx + 15, y - 8 + bob, 2, 1, '#ff8a3d'); R(sx + 12, y - 8 + bob, 1, 1, PAL.ink); R(sx + 1, y + 1 + bob, 6, 2, '#ffd6e0'); return true;
    }
    case 'ogators': {   // Gator Jamboree: the entrance is a gator's open mouth
      shadow(x + w / 2, y + h + 2, w + 8, 6); OR(x, y - 10, w, h + 10, '#f3e3b4'); for (let i = 0; i < w; i += 5) R(x + i, y - 10, 1, h + 10, '#e0cc94');
      const mx = x + w / 2; OR(mx - 20, y - 26, 40, 16, '#557f3c'); OR(mx - 22, y - 10, 44, 8, '#557f3c'); for (let i = 0; i < 7; i++) { R(mx - 18 + i * 6, y - 11, 3, 3, PAL.white); R(mx - 18 + i * 6, y - 8, 3, 2, PAL.white); }
      R(mx - 12, y - 24, 4, 4, PAL.yellow); R(mx + 8, y - 24, 4, 4, PAL.yellow); R(mx - 11, y - 23, 2, 2, PAL.ink); R(mx + 9, y - 23, 2, 2, PAL.ink); OR(mx - 7, y + h - 16, 14, 16, PAL.black);
      sign('GATOR JAMBOREE', mx, y - 30, '#557f3c', PAL.yellow, 4); return true;
    }
    case 'ogsign': { R(x + 7, y - 14, 2, 16, PAL.woodD); sign('DO NOT FEED THE GATORS', x + 8, y - 16, PAL.white, '#e0433a', 4); return true; }
    case 'ohouse': {   // Sunset Acres: identical pastel houses, a flamingo each
      shadow(x + w / 2, y + h + 2, w + 6, 5); OR(x, y - 8, w, h + 8, p.c); g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(x - 4, y - 7); g.lineTo(x + w / 2, y - 22); g.lineTo(x + w + 4, y - 7); g.fill();
      g.fillStyle = '#e0cfc0'; g.beginPath(); g.moveTo(x - 2, y - 8); g.lineTo(x + w / 2, y - 20); g.lineTo(x + w + 2, y - 8); g.fill();
      OR(x + 6, y + 2, 12, 9, PAL.waterL); OR(x + w - 18, y + h - 16, 10, 16, PAL.white); if (SPR.flamingo) g.drawImage(SPR.flamingo, x + w + 4, y + h - 10); return true;
    }
    case 'ocart2': { shadow(x + w / 2, y + h + 1, w + 4, 4); OR(x, y - 2, w, h, p.c); R(x + 2, y - 14, 1, 12, PAL.grey); R(x + w - 3, y - 14, 1, 12, PAL.grey); OR(x, y - 16, w, 3, '#27c6b4'); R(x + 2, y + h - 3, 3, 3, PAL.ink); R(x + w - 5, y + h - 3, 3, 3, PAL.ink); return true; }
    case 'oacres': { R(x + 7, y - 14, 2, 16, PAL.woodD); sign('SUNSET ACRES · 55+ · GOLF CARTS ONLY', x + 8, y - 16, '#7b4bc4', PAL.white, 4); return true; }
    case 'ohole': { R(x, y, 5, 2, PAL.ink); R(x + 2, y - 14, 1, 14, PAL.white); R(x + 3, y - 14, 6, 4, '#e0433a'); return true; }
  }
  return false;
}

// ---------- people ----------
const Orlando = {
  spawn() {
    const S_ = World.spots;
    Game.npcs = [
      makeNPC('chad', 'Chad', S_.timeshare.x, S_.timeshare.y, 'down'),
      makeNPC('larry', 'Lava Larry', S_.volcano.x - 30, S_.volcano.y + 8, 'down'),
      makeNPC('gloria', 'Gloria', S_.souvenir.x, S_.souvenir.y, 'down'),
      makeNPC('deb', 'Wrangler Deb', S_.gators.x + 48, S_.gators.y - 4, 'down'),
      makeNPC('dolores', 'Dolores', S_.acres.x, S_.acres.y, 'down', { wander: 40 }),
      makeNPC('enforcer', 'Fun Enforcement', 30 * TS, 11 * TS, 'down', { wander: 60 }),
      makeNPC('enforcer', 'Fun Enforcement', 50 * TS, 17 * TS, 'down', { wander: 60 }),
      makeNPC('tourist', 'Tourist', 36 * TS, 19.5 * TS, 'down', { wander: 40 }),
      makeNPC('tourist', 'Tourist', 74 * TS, 46 * TS, 'down', { wander: 50 }),
      makeNPC('tourist', 'Tourist', 30 * TS, 26 * TS, 'down', { wander: 70 }),
    ];
    const A = Game.animals = [];
    A.push(makeGator(26 * TS, 53 * TS, false), makeGator(29 * TS, 55 * TS, false));   // Gator Jamboree has gators. That's the whole show.
    for (let i = 0; i < 3; i++) A.push(makeCritter('duck', rnd(73, 86) * TS, rnd(4, 11) * TS));
    for (let i = 0; i < 2; i++) A.push(makeCritter('duck', rnd(83, 86) * TS, rnd(41, 44) * TS));
    for (let i = 0; i < 3; i++) A.push(makeCritter('iguana', rnd(36, 60) * TS, rnd(46, 50) * TS));
    A.push(makeCritter('pelican', S_.dockEnd.x - 10, S_.dockEnd.y - 8));
    if (Game.flags.trashBaby && !Game.flags.tbStay) A.push(makeCritter('raccoon', Game.dan.x + 14, Game.dan.y, { pet: true }));
    const P = Game.pickups = [];
    for (let i = 0, k = 0; i < 8 && k < 500; k++) { const x = rnd(1, 88) * TS, y = rnd(24, 58) * TS, tt = World.at(x, y); if ((tt === T.GRASS || tt === T.CONCRETE) && !World.solidAt(x, y)) { P.push({ kind: pick(['beer', 'beer', 'cig', 'scratch', 'hotdog', 'energy']), x, y }); i++; } }
    Game.vehicles = [];
    for (const p of World.props) if (p.kind === 'otree') p.picked = 0;
    if (typeof OrlandoCases !== 'undefined') OrlandoCases.spawn();
  },
  // the cooler at the I-4 on-ramp: the set piece (bridge.js, I-4 skin)
  coolerPrompt() { const D = Game.dan, o = World.spots.onramp; return D.ride === 'cooler' && Math.hypot(D.x - o.x, D.y - o.y) < 34 ? { label: qOpen('i4') ? 'FLOOR IT down I-4 (the gang is stuck)' : 'FLOOR IT down I-4', fn: () => OrlandoCases.i4Run() } : null; },
  // punch an orange tree (game.js punch): it shakes, oranges fall, sometimes on Dan
  punch(f) {
    const tr = World.props.find(p => p.kind === 'otree' && Math.hypot(p.x + 6 - f.x, p.y + 2 - f.y) < 18); if (!tr) return false;
    tr.shake = .35; Sound.play('punch'); Game.shake = 2; Game.punchCd = .45;
    if ((tr.picked || 0) >= 4) { toast(pick(['That tree is picked clean. It looks tired.', 'Nothing left. The tree respects you anyway.']), 2); return true; }
    tr.picked = (tr.picked || 0) + 1;
    const n = Math.random() < .35 ? 2 : 1;
    for (let i = 0; i < n; i++) Game.pickups.push({ kind: 'orange', x: tr.x + 6 + rnd(-14, 14), y: tr.y + rnd(8, 16) });
    if (Math.random() < .25) { hurtDan(2); toast(pick(['An orange falls on Dan’s head. Very Florida.', 'BONK. Vitamin C, directly to the skull.']), 2); }
    if (!Game.flags.punchTree) { Game.flags.punchTree = true; headline('FLORIDA MAN PUNCHES ORANGE TREE "UNTIL IT GAVE UP THE GOODS"', 2); }
    return true;
  },
  interactions() {
    const D = Game.dan, S_ = World.spots, list = [], near = (p, r) => p && Math.hypot(D.x - p.x, D.y - p.y) < r, F = Game.flags;
    list.push(...OrlandoCases.interactions());
    if (D.ride) return list;
    if (near(S_.door, 20) && sleepReady()) list.push({ label: 'Sleep at the Kingdom Inn (room 214)', fn: () => sleep() });
    if (near(S_.court, 22)) { const cs = Cases.courtCase(); list.push({ label: cs ? 'Enter the courthouse' : 'Orange County Courthouse (closed)', fn: () => cs ? Court.start(cs) : toast('The Orange County Courthouse. There’s a mouse-ear hat in the lost and found. There are 400.') }); }
    if (near(S_.stationDoor, 22)) list.push({ label: 'Greyhound', fn: () => busMenu() });
    if (near(S_.gateOut, 24) && !list.length) list.push(this.gatePrompt());
    if (near(S_.gateIn, 22) && inPark(D.x, D.y)) list.push({ label: 'Leave SqueakyLand', fn: () => this.leavePark() });
    if (near(S_.upside, 24)) list.push({ label: 'Try the front door (it’s on the roof)', fn: () => { toast(pick(['Dan climbs up to the door. It opens onto a ceiling fan. Upside down. Still on.', 'The door is upside down. Dan is now also upside down. Nobody is sure how.']), 3.5); if (!F.upsideHl) { F.upsideHl = true; headline('FLORIDA MAN TRIES TO ENTER UPSIDE-DOWN HOUSE THROUGH THE ROOF; "IT WAS THE FRONT DOOR"', 2); } } });
    if (near(S_.knights, 22)) list.push({ label: 'Knights & Nuggets (dinner show)', fn: () => { toast(pick(['The Red Knight wins. Dan boos for 40 minutes. He is asked to leave. He leaves with nuggets.', 'Dan jousts a man on a horse with a turkey leg. He is escorted out. Worth it.']), 3.5); if (!F.knightHl) { F.knightHl = true; headline('FLORIDA MAN CHALLENGES DINNER-SHOW KNIGHT TO JOUST USING TURKEY LEG; HORSE "UNIMPRESSED"', 3); } } });
    if (near(S_.orange, 20) && !near(Game.npcs.find(n => n.id === 'kyle'), 24)) list.push({ label: 'Hug the Big Orange', fn: () => { toast('Dan hugs the Big Orange. It is warm from the sun. He stays a while.', 3); Game.chill = Math.min(100, Game.chill + 10); } });
    if (Game.urgent > 0 && near(S_.hide, 22)) list.push({ label: 'USE THE TOILET', fn: () => { Game.urgent = 0; Sound.play('splash'); toast('A theme park parking lot porta-potty in August. Dan has been to the other side.'); Game.chill = 100; } });
    return list;
  },
  // the front gate: free passes, $139 at the booth, or legs
  gatePrompt() {
    const F = Game.flags;
    return { label: 'Enter SqueakyLand', fn: () => {
      if (F.tickets && !Game.day_.ticketUsed) { Game.day_.ticketUsed = true; return this.enterPark(); }
      if (Game.day_.inPaid) return this.enterPark();
      say([['TICKET BOOTH', 'One adult, one day: $139. Plus tax. Plus parking. Plus the churro you’re about to buy.', [
        [`Pay a coupon price ($30)${Game.money < 30 ? ' — broke' : ''}`, () => { if (Game.money < 30) return [['TICKET BOOTH', 'Card declined. The mouse can tell.']]; Game.money -= 30; Game.day_.inPaid = true; Sound.play('cash'); Game.afterTalk = () => this.enterPark(); return null; }],
        ['HOP THE TURNSTILE', () => { Game.day_.inPaid = true; Heat.add(2); Game.afterTalk = () => this.enterPark(true); return null; }],
        ['“Just looking at the mouse.”', () => null]]]]);
    } };
  },
  enterPark(hopped) {
    const D = Game.dan, S_ = World.spots; if (D.ride === 'cooler') D.ride = null;
    Object.assign(D, { x: S_.gateIn.x, y: S_.gateIn.y - 6, dir: 'up', ride: null }); Game.cam.x = D.x - VW / 2; Game.cam.y = D.y - VH / 2 - 10; Game.flash = .4; Sound.play('pickup');
    if (hopped) { toast('Dan vaults the turnstile. A family of five applauds. Fun Enforcement writes something down.', 3.5); if (!Game.flags.hopHl) { Game.flags.hopHl = true; headline('FLORIDA MAN HOPS SQUEAKYLAND TURNSTILE IN FLIP-FLOPS; SECURITY "IMPRESSED, HONESTLY"', 5); } }
    else toast(pick(['Welcome to SQUEAKYLAND! Churros are $14. Water is $9. Joy is free (it is not).', 'SQUEAKYLAND! The air smells like sugar and sunscreen and fear.']), 3.5);
    if (typeof OrlandoCases !== 'undefined') OrlandoCases.enteredPark();
  },
  leavePark() { const D = Game.dan, S_ = World.spots; Object.assign(D, { x: S_.gateOut.x, y: S_.gateOut.y + 6, dir: 'down' }); Game.cam.x = D.x - VW / 2; Game.cam.y = D.y - VH / 2 - 10; toast('Dan leaves SqueakyLand. His wallet is lighter. His heart is... also lighter. Churro-related.', 3); },
  // nightly fireworks over the castle, 8:45 to 9:15
  tick(dt) {
    const h = Game.hour; if (!(h > 20.75 && h < 21.25) || Game.mode !== 'play') return;
    if (Math.random() < dt * 2.2) {
      const bx = (39.5 + rnd(-6, 6)) * TS, by = (1 + rnd(-3, 3)) * TS, c = pick(['#ff5ea8', '#ffd23f', '#27c6b4', '#b86bd6', '#ff8a3d', PAL.white]);
      for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28; Game.parts.push({ kind: 'spark', x: bx, y: by, vx: Math.cos(a) * rnd(40, 70), vy: Math.sin(a) * rnd(40, 70) - 30, life: rnd(.8, 1.3), c }); }
      Game.parts.push({ kind: 'fire', x: bx, y: by, vx: 0, vy: 0, life: .4 }); if (Math.random() < .5) Sound.play('boom');
      if (!Game.day_.fwToast && Math.hypot(Game.dan.x - bx, Game.dan.y - by) < 600) { Game.day_.fwToast = true; toast('Fireworks over the Cheese Castle. Every night. Dan cries a little. Nobody sees.', 3.5); }
    }
  },
  // night light for the look layer (look.js calls this)
  lights(L, t) {
    for (const p of World.props) {
      const mx = p.x + p.w / 2, by = p.y + p.h;
      if (p.kind === 'ocastle') { L(mx, by - 50, 110, '#ffe9a8', .8); L(mx, p.y - 90, 60, '#b86bd6', .6); }
      else if (p.kind === 'ogate') L(mx, p.y - 30, 60, '#ff9ec7', .8);
      else if (p.kind === 'oinn') { L(mx + 50, p.y - 44, 40, '#b86bd6', .8); L(mx, by - 8, 60, '#ffd28a', .6); }
      else if (p.kind === 'olamp') L(p.x + 2, p.y - 20, 22, '#ffe9a8', .8);
      else if (p.kind === 'ocoaster') L(mx, p.y - 20, 60, '#27c6b4', .7);
      else if (p.kind === 'otimeshare' || p.kind === 'osouvenir' || p.kind === 'oknights' || p.kind === 'ocourt' || p.kind === 'ogators') L(mx, by - 12, 44, '#fff0c8', .6);
      else if (p.kind === 'ovolcano') L(mx, p.y - 30, 40, '#ff5a1f', .8);
      else if (p.kind === 'oorange') L(mx, p.y - 6, 50, '#ffb65c', .6);
      else if (p.kind === 'opool') L(mx, p.y + p.h / 2, 46, '#4fd0e8', .7);
    }
    for (const q of Game.parts) if (q.kind === 'spark' && q.c && Math.random() < .3) L(q.x, q.y, 16, q.c, .6);
  },
};
Object.assign(REGION_NAMES, { orlando: 'Orlando' });
TRAVEL_LINES.orlando = [['', 'Dan boards the Greyhound. The chicken guy is here. He is wearing mouse ears.'], ['', 'The Turnpike. Then I-4. Then more I-4. The bus does not move for an hour.'],
  ['DRIVER', 'Orlando. Or Kissimmee. Nobody knows where one stops.'], ['DAN', 'I can smell the churros from here.']];
Object.assign(Look.HT, { oinn: 44, oorange: 30, ocastle: 90, ocoaster: 60, otimeshare: 30, oupside: 36, ovolcano: 34, osouvenir: 30, oknights: 34, ocourt: 44, ogators: 30, ohouse: 24, otree: 22 });
