// FLORIDA DAN — MIAMI. A second map: Biscayne Bay marina, city blocks, Ocean Drive's neon
// Art Deco strip, Lummus Park, the beach, the Atlantic. Reached by Greyhound from the swamp.
'use strict';
function buildMiami() {
  const W = World;
  W.fill(0, 0, MW - 1, MH - 1, T.PLAZA);
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x <= 8; x++) W.set(x, y, x <= 4 ? T.DEEP : x <= 7 ? T.WATER : T.SHALLOW);   // Biscayne Bay
    W.set(9, y, T.DOCK); W.set(10, y, T.DOCK);                                                   // marina boardwalk
    W.set(56, y, T.SIDEWALK); W.set(57, y, T.SIDEWALK);
    for (let x = 58; x <= 61; x++) W.set(x, y, T.GRASS);                                          // Lummus Park
    for (let x = 62; x <= 72; x++) W.set(x, y, T.SAND);
    for (let x = 73; x < MW; x++) W.set(x, y, x <= 74 ? T.SHALLOW : x <= 80 ? T.WATER : T.DEEP); // the Atlantic
  }
  for (const py of [12, 24, 36, 48]) for (let x = 3; x <= 8; x++) W.set(x, py, T.DOCK);           // marina piers
  for (let x = 63; x <= 81; x++) { W.set(x, 29, T.DOCK); W.set(x, 30, T.DOCK); }                   // fishing pier
  for (const ry of [13, 31, 47]) for (let x = 11; x <= 53; x++) { W.set(x, ry, T.ROAD); W.set(x, ry + 1, T.ROAD); }
  for (const rx of [25, 40]) for (let y = 0; y < MH; y++) { W.set(rx, y, T.ROADV); W.set(rx + 1, y, T.ROADV); }
  for (let y = 0; y < MH; y++) { W.set(54, y, T.ROADV); W.set(55, y, T.ROADV); }                   // Ocean Drive
  for (const ry of [13, 31, 47]) for (let x = 11; x <= 53; x++) { if (W.tile(x, ry) !== T.ROADV) { W.set(x, ry, T.ROAD); W.set(x, ry + 1, T.ROAD); } }
  // sidewalks hug every road
  const isRoad = t => t === T.ROAD || t === T.ROADV;
  for (let y = 0; y < MH; y++) for (let x = 11; x <= 53; x++) if (W.tile(x, y) === T.PLAZA && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => isRoad(W.tile(x + dx, y + dy)))) W.set(x, y, T.SIDEWALK);

  const P = W.props = [];
  const add = (kind, tx, ty, w, h, solid = true, extra = {}) => { const p = { kind, x: tx * TS, y: ty * TS, w: w * TS, h: h * TS, solid, ...extra }; P.push(p); return p; };
  add('deco', 43, 6, 9, 3, true, { color: '#ffc2d6', trim: '#ff4fd8', sign: 'HOTEL NEON', neon: '#ff4fd8', floors: 3 });
  add('deco', 43, 18, 9, 3, true, { color: '#8a5ad6', trim: '#27c6b4', sign: 'CLUB SINUS', neon: '#27c6b4', floors: 2, club: true });
  add('cafe', 45, 25, 6, 2, true);
  add('deco', 43, 34, 9, 3, true, { color: '#fff1c2', trim: '#ff8a3d', sign: 'THE FLAMINGO', neon: '#ff8a3d', floors: 3 });
  add('shop', 45, 40, 6, 2, true, { color: '#bff0ea', sign: 'PASTEL SUITS' });
  add('condo', 42, 49.5, 10, 3.5, true);
  add('pool', 42.5, 54.2, 8, 2.6, true);
  add('station', 14, 50, 8, 3, true);
  add('mdcourt', 29, 17.5, 10, 3.5, true);
  add('marina', 11.5, 21, 4, 2, true);
  add('valet', 52.4, 10.2, .8, .6, true);
  for (const [x, y, w, c] of [[13, 3, 6, '#b8e6ff'], [28, 3, 9, '#ffe0a8'], [13, 18, 7, '#c9f2c7'], [13, 36, 7, '#ffd0e6'], [28, 36, 9, '#d8ccff'], [28, 53, 9, '#ffe7c2'], [13, 26, 7, '#ffe2b8']])
    add('deco', x, y, w, 3, true, { color: c, trim: PAL.white, floors: 2 });
  for (const [x, y, c] of [[66, 7, '#ff9ec7'], [67, 20, '#7fe0d6'], [66, 39, '#ffd23f'], [67, 52, '#ff8a3d']]) add('guard', x, y, 1.4, 1, true, { c });
  for (const [x, y] of [[1.5, 16], [2, 33], [1.5, 43]]) add('yacht', x, y, 4, 1.5, false);
  add('porta', 62.3, 26.2, 1, 1, true);
  add('net', 64, 44, 3, .4, false);
  const r = rng(305);
  for (let y = 2; y < MH - 2; y += 3) { add('palm', 58.3, y + .5, .5, .4, true, { s: r() }); if (r() < .6) add('palm', 60.8, y + 1.7, .5, .4, true, { s: r() }); }
  for (let i = 0; i < 16; i++) { const x = 63 + r() * 8, y = 2 + r() * 55; if (Math.abs(y - 29.5) > 3) add(r() < .5 ? 'umbrella' : 'towel', x, y, .6, .4, false, { c: pick(['#ff5ea8', '#27c6b4', '#ffd23f', '#ff8a3d', '#7b4bc4']) }); }
  W.spots = {
    dan: { x: 47.5 * TS, y: 10.1 * TS }, door: { x: 47.5 * TS, y: 9.4 * TS }, arrive: { x: 18 * TS, y: 53.9 * TS },
    court: { x: 34 * TS, y: 21.4 * TS }, cafe: { x: 48 * TS, y: 27.5 * TS }, club: { x: 47.5 * TS, y: 21.6 * TS }, condo: { x: 46.5 * TS, y: 57.6 * TS },
    boat: { x: 6.5 * TS, y: 28 * TS }, cooler: { x: 20.2 * TS, y: 54.4 * TS }, hide: { x: 62.8 * TS, y: 27.8 * TS },
    pier: { x: 80 * TS, y: 30 * TS }, valet: { x: 52.8 * TS, y: 11.1 * TS }, lambo: { x: 54.9 * TS, y: 11.5 * TS }, marina: { x: 13.5 * TS, y: 23.6 * TS },
    boutique: { x: 48 * TS, y: 42.4 * TS }, stationDoor: { x: 18 * TS, y: 53.4 * TS },
    merle: { x: -999, y: -999 }, darlene: { x: -999, y: -999 }, rhonda: { x: -999, y: -999 }, icemachine: { x: -999, y: -999 }, dockEnd: { x: 80 * TS, y: 30 * TS }, ramp: { x: 8 * TS, y: 36 * TS }, pasture: { x: -999, y: -999 },
  };
  if (typeof addMiamiExtras === 'function') Object.assign(W.spots, addMiamiExtras(add));   // surf shack, Gazette box (money.js)
}

// ---------- drawing the city ----------
const NIGHT = () => Game.hour >= 19.5 || Game.hour < 6;
const shadeHex = (hex, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
function neonGlow(x, y, w, h, c) {
  if (!NIGHT()) return;
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = .22 + Math.sin(Game.t * 3 + x) * .05; g.fillStyle = c;
  g.fillRect(Math.round(x - 6), Math.round(y - 5), w + 12, h + 10); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function drawMiamiProp(p, x, y, w, h, t) {
  switch (p.kind) {
    case 'deco': {   // Ocean Drive art deco: stepped ziggurat tower, fins, racing stripes, eyebrow ledges, portholes, neon
      const fl = p.floors || 2, top = y - fl * 14, H = h + fl * 14, cx = Math.round(x + w / 2), dark = shadeHex(p.color, .78), deep = shadeHex(p.color, .6), night = NIGHT();
      const trim = p.trim === PAL.white ? shadeHex(p.color, .55) : p.trim, glass = night ? '#ffe9a8' : '#9fd8ee', stream = !p.sign && hash2(p.x, p.y) > .5, tw = p.sign ? 34 : stream ? 0 : 24;   // streamline style: no tower, one tall fin, stripes all the way round
      shadow(cx, y + h + 2, w + 8, 6);
      OR(x, top, w, H, p.color);
      R(x + 1, top + 1, 2, H - 2, dark); R(x + w - 3, top + 1, 2, H - 2, dark);                       // rounded, shaded corners
      for (let i = 0; i < 3; i++) { R(x + 3, top + 5 + i * 3, cx - tw / 2 - x - 5, 1, trim); R(cx + tw / 2 + 2, top + 5 + i * 3, x + w - cx - tw / 2 - 5, 1, trim); }   // racing stripes
      R(x, top, w, 2, trim);
      // windows with eyebrow ledges, left and right of the tower
      for (let f = 0; f < fl; f++) { const wy = top + 16 + f * 14;
        for (let wx = x + 7; wx + 12 < cx - tw / 2 - 2; wx += 16) for (const X of [wx, x + w - (wx - x) - 12]) { OR(X, wy, 12, 7, glass); R(X - 2, wy - 3, 16, 2, trim); R(X - 2, wy - 1, 16, 1, deep); } }
      if (stream) {   // the fin: a tall slab off to one side, lettered stripes, a porthole column
        const fx = x + Math.round(w * .28), ft = top - 24; OR(fx - 5, ft, 10, H + 4 - 18, p.color); R(fx - 5, ft, 10, 2, trim); for (let i = 0; i < 4; i++) R(fx - 3, ft + 5 + i * 4, 6, 1, trim);
        for (let k = 0; k < fl; k++) { const py = top + 14 + k * 14; R(fx - 2, py - 2, 5, 5, PAL.ink); R(fx - 1, py - 1, 3, 3, glass); }
        if (night) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = .5; R(fx - 5, ft, 10, 1, trim); R(fx, ft, 1, H - 14, trim); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
      }
      // the tower: three stepped tiers rising over the roofline, with a spine of vertical fins
      const t1 = top - 10, t2 = top - 17, t3 = top - 22;
      if (tw) {
      OR(cx - tw / 2, t1, tw, H - (t1 - top) - 18 + 10, p.color); OR(cx - tw / 2 + 5, t2, tw - 10, 8, p.color); OR(cx - tw / 2 + 10, t3, tw - 20, 6, p.color);
      R(cx - tw / 2, t1, tw, 2, trim); R(cx - tw / 2 + 5, t2, tw - 10, 2, trim); R(cx - tw / 2 + 10, t3, tw - 20, 2, trim);
      for (const fx of [-6, 0, 6]) R(cx + fx - (fx ? 0 : 1), t1 + 4, fx ? 1 : 2, H - 30, dark);
      // porthole windows down the tower
      for (let k = 0; k < fl; k++) { const py = top + 12 + k * 14; for (const px of [cx - 10, cx + 10]) { R(px - 2, py - 3, 5, 1, PAL.ink); R(px - 3, py - 2, 7, 5, PAL.ink); R(px - 2, py + 3, 5, 1, PAL.ink); R(px - 2, py - 2, 5, 5, glass); R(px - 1, py - 1, 1, 1, PAL.white); } }
      }
      // entrance: glass-block panels, a marquee canopy, the door
      const ey = y + h - 18;
      for (const gx of [cx - 20, cx + 13]) { OR(gx, ey, 7, 16, '#d8f3ff'); for (let r = 0; r < 4; r++) R(gx + 1, ey + 3 + r * 4, 5, 1, '#9fc8dc'); }
      OR(cx - 15, ey - 5, 30, 5, trim); R(cx - 14, ey, 28, 1, deep);
      OR(cx - 8, ey + 2, 16, 14, PAL.inkL); R(cx - 1, ey + 2, 1, 14, PAL.ink);
      if (p.sign) { const sw = labelWidth(p.sign) + 8; OR(cx - sw / 2, t3 - 14, sw, 11, PAL.ink); neonGlow(cx - sw / 2, t3 - 14, sw, 11, p.neon); label(p.sign, cx, t3 - 5, night && Math.sin(t * 7 + x) < -.95 ? PAL.inkL : p.neon, 7); }
      if (night) {   // neon tubes trace the tower tiers and the stripes
        const n = p.neon || trim; g.globalCompositeOperation = 'lighter'; g.globalAlpha = .55 + Math.sin(t * 3 + x) * .1;
        R(cx - tw / 2, t1, tw, 1, n); R(cx - tw / 2 + 5, t2, tw - 10, 1, n); R(cx - tw / 2 + 10, t3, tw - 20, 1, n); R(x + 3, top + 5, w - 6, 1, n); R(cx - 15, ey, 30, 1, n);
        g.globalAlpha = .12; R(cx - tw / 2 - 4, t3 - 4, tw + 8, H + 6, n); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      if (p.club) { for (let i = 0; i < 3; i++) R(x + 10 + i * 30, y + h - 4, 18, 2, [PAL.neon, PAL.teal, PAL.yellow][(Math.floor(t * 4) + i) % 3]); }
      break;
    }
    case 'cafe': {
      shadow(x + w / 2, y + h + 2, w + 6, 5);
      OR(x, y - 16, w, h + 16, '#fff3d6'); for (let i = 0; i < w; i += 8) R(x + i, y - 16, 4, 6, i % 16 ? PAL.white : PAL.red);
      OR(x + 30, y + 2, 26, 12, PAL.ink); R(x + 32, y + 4, 22, 8, '#6b3e26'); label('VENTANITA', x + 43, y - 1, PAL.red, 7);
      label('CAFÉ ABUELA', x + w / 2, y - 20, PAL.red, 7);
      for (let i = 0; i < 3; i++) { const sx = x + 36 + i * 6, sy = y - 2 - (t * 10 + i * 5) % 10; g.globalAlpha = .5; R(sx, sy, 2, 2, PAL.white); g.globalAlpha = 1; }
      break;
    }
    case 'shop': { shadow(x + w / 2, y + h + 2, w + 6, 5); OR(x, y - 12, w, h + 12, p.color); OR(x + 8, y - 2, 30, 14, '#e8fbff'); for (let i = 0; i < 3; i++) OR(x + 12 + i * 9, y + 1, 5, 9, ['#ff9ec7', '#7fe0d6', '#fff3c4'][i]); label(p.sign, x + w / 2, y - 15, PAL.teal, 7); break; }
    case 'condo': {
      const top = y - 70; shadow(x + w / 2, y + h + 2, w + 8, 6);
      OR(x, top, w, h + 70, '#f3f0e8'); for (let f = 0; f < 6; f++) { R(x, top + 6 + f * 12, w, 2, '#7fe0d6'); for (let wx = x + 6; wx < x + w - 6; wx += 14) R(wx, top + 9 + f * 12, 8, 5, NIGHT() ? '#ffe9a8' : '#9fd8ee'); }
      label('THE BOCA-ISH', x + w / 2, top - 4, PAL.teal, 7); OR(x + w / 2 - 8, y + h - 16, 16, 16, PAL.inkL);
      break;
    }
    case 'pool': { OR(x, y, w, h, '#58d8e6'); for (let i = 0; i < 6; i++) R(x + 6 + ((t * 12 + i * 21) % (w - 16)), y + 6 + (i % 3) * 11, 6, 1, PAL.white); R(x - 3, y - 3, w + 6, 3, PAL.white); for (let i = 0; i < 4; i++) OR(x + 10 + i * 30, y + h + 3, 14, 5, i % 2 ? PAL.hat : PAL.white); break; }
    case 'station': {
      shadow(x + w / 2, y + h + 2, w + 6, 6); OR(x, y - 20, w, h + 20, '#d7dde3'); R(x, y - 20, w, 7, '#3d6fe0'); label('GREYHOUND', x + w / 2, y - 13, PAL.white, 7);
      OR(x + 10, y - 2, 30, 12, '#9fd8ee'); OR(x + w / 2 - 8, y + h - 16, 16, 16, PAL.inkL);
      OR(x + w + 6, y + 6, 36, 20, PAL.white); R(x + w + 6, y + 14, 36, 4, '#3d6fe0'); for (let i = 0; i < 4; i++) R(x + w + 9 + i * 8, y + 8, 5, 4, '#9fd8ee'); OR(x + w + 9, y + 26, 5, 4, PAL.ink); OR(x + w + 32, y + 26, 5, 4, PAL.ink);   // the bus
      break;
    }
    case 'mdcourt': {
      shadow(x + w / 2, y + h + 2, w + 8, 6);
      OR(x, y - 22, w, h + 22, '#f4efe2'); OR(x - 4, y - 40, w + 8, 18, '#e2d8bf'); R(x + w / 2 - 36, y - 40, 72, 3, '#ffd23f');
      for (let i = 0; i < 6; i++) { OR(x + 12 + i * 28, y - 18, 8, h + 14, PAL.white); R(x + 13 + i * 28, y - 18, 1, h + 14, PAL.tankD); }
      OR(x + w / 2 - 10, y + h - 22, 20, 22, PAL.woodD); label('MIAMI-DADE COURTHOUSE', x + w / 2, y - 26, PAL.greyD, 7);
      break;
    }
    case 'marina': { shadow(x + w / 2, y + h + 2, w + 4, 5); OR(x, y - 12, w, h + 12, PAL.white); R(x, y - 12, w, 4, '#27c6b4'); label('MARINA', x + w / 2, y - 15, '#27c6b4', 7); OR(x + 18, y + 4, 12, 16, PAL.inkL); break; }
    case 'valet': { OR(x, y - 10, 12, 14, PAL.red); R(x, y - 10, 12, 3, PAL.white); label('VALET', x + 6, y - 13, PAL.red, 7); break; }
    case 'guard': { shadow(x + 11, y + 14, 26, 5); R(x + 3, y - 4, 2, 18, PAL.white); R(x + 17, y - 4, 2, 18, PAL.white); OR(x - 2, y - 18, 26, 14, p.c); R(x - 4, y - 22, 30, 4, PAL.red); R(x + 6, y - 14, 10, 6, '#9fd8ee'); break; }
    case 'umbrella': { shadow(x + 4, y + 6, 16, 4); R(x + 3, y - 12, 1, 16, PAL.white); g.fillStyle = p.c; g.beginPath(); g.moveTo(x - 7, y - 10); g.lineTo(x + 3.5, y - 18); g.lineTo(x + 14, y - 10); g.fill(); break; }
    case 'towel': { OR(x - 3, y, 8, 14, p.c); R(x - 3, y + 4, 8, 2, PAL.white); break; }
    case 'yacht': {
      const bob = Math.sin(t * 1.5 + x) * 1;
      OR(x, y - 6 + bob, w, 14, PAL.white); R(x + 4, y + 4 + bob, w - 8, 2, '#27c6b4'); OR(x + 14, y - 16 + bob, w - 30, 10, PAL.white); R(x + 18, y - 14 + bob, w - 38, 4, '#1a1423');
      if (NIGHT()) for (let i = 0; i < 6; i++) R(x + 6 + i * 9, y - 8 + bob, 2, 2, [PAL.neon, PAL.yellow, PAL.teal][i % 3]);
      break;
    }
    case 'net': { R(x, y - 12, 2, 16, PAL.white); R(x + w - 2, y - 12, 2, 16, PAL.white); for (let i = 0; i < w; i += 3) R(x + i, y - 11, 1, 6, PAL.tankD); R(x, y - 12, w, 1, PAL.white); R(x, y - 6, w, 1, PAL.white); break; }
  }
}

// ---------- people + critters ----------
const Miami = {
  spawn() {
    const S_ = World.spots;
    Game.npcs = [
      makeNPC('abuela', 'Abuela', S_.cafe.x, S_.cafe.y, 'down'),
      makeNPC('sheila', 'Sheila', S_.condo.x, S_.condo.y, 'up', { wander: 20 }),
      makeNPC('raul', 'Raul', 57 * TS, 6 * TS, 'down', { skate: 1 }),
      makeNPC('valet', 'Valet', S_.valet.x + 12, S_.valet.y + 4, 'down'),
      makeNPC('tourist', 'Tourist', 65 * TS, 16 * TS, 'down', { wander: 50 }),
      makeNPC('tourist', 'Tourist', 68 * TS, 46 * TS, 'down', { wander: 50 }),
      makeNPC('tourist', 'Tourist', 57 * TS, 36 * TS, 'down', { wander: 40 }),
    ];
    const A = Game.animals = [];
    for (let i = 0; i < 7; i++) A.push(makeCritter('iguana', rnd(58, 71) * TS, rnd(3, 57) * TS));   // Miami is 40% iguana
    A.push(makeCritter('pelican', 76 * TS, 29 * TS), makeCritter('pelican', 8.5 * TS, 24 * TS), makeCritter('pelican', 70 * TS, 30.3 * TS));
    A.push(makeGator(3 * TS, 26 * TS, false));
    if (Game.flags.trashBaby && !Game.flags.tbStay) A.push(makeCritter('raccoon', Game.dan.x + 14, Game.dan.y, { pet: true }));
    const P = Game.pickups = [];
    for (let i = 0, k = 0; i < 8 && k < 400; k++) { const x = rnd(12, 71) * TS, y = rnd(2, 58) * TS, tt = World.at(x, y); if ((tt === T.SAND || tt === T.SIDEWALK || tt === T.PLAZA || tt === T.GRASS) && !World.solidAt(x, y)) { P.push({ kind: pick(['beer', 'cafecito', 'scratch', 'hotdog', 'cig', 'bait']), x, y }); i++; } }
    Game.npcs.push(makeNPC('coral', 'Coral', S_.surf.x, S_.surf.y, 'down'));
    if (typeof MiamiCases !== 'undefined') MiamiCases.spawn();
  },
  // Raul skates the Ocean Drive sidewalk, forever
  tickNPC(n, dt) {
    if (n.race || n.baleGrab) return true;
    if (!n.skate) return false;
    n.t += dt; n.y += n.skate * 70 * dt; n.dir = n.skate > 0 ? 'down' : 'up'; n.moving = true;
    if (n.y > 57 * TS) n.skate = -1; if (n.y < 3 * TS) n.skate = 1;
    if (Math.floor(n.t * 6) % 2 !== n.frame) n.frame ^= 1;
    return true;
  },
  interactions() {
    const D = Game.dan, S_ = World.spots, list = [], near = (p, r) => p && Math.hypot(D.x - p.x, D.y - p.y) < r;
    if (D.ride) return list;
    list.push(...MiamiCases.interactions());
    if (near(S_.door, 18) && Game.flags.checkedIn !== false && sleepReady()) list.push({ label: 'Go up to your room (sleep)', fn: () => sleep() });
    if (near(S_.court, 22)) { const cs = Cases.courtCase(); list.push({ label: cs ? 'Enter the courthouse' : 'Miami-Dade Courthouse (closed)', fn: () => cs ? Court.start(cs) : toast('The Miami-Dade Courthouse. Dan salutes it. Force of habit.') }); }
    if (near(S_.stationDoor, 22)) list.push({ label: Cases.info().n >= 4 && Cases.info().n <= 5 ? 'Greyhound (can’t leave mid-case)' : 'Greyhound', fn: () => busMenu() });
    if (Game.urgent > 0 && near(S_.hide, 22)) list.push({ label: 'USE THE TOILET', fn: () => { Game.urgent = 0; Sound.play('splash'); toast('...Made it. A beach porta-potty in July. Dan has seen God, and God is sweaty.'); Game.chill = 100; } });
    return list;
  },
};

// ---------- the Greyhound between worlds ----------
function travel(to) {
  const lines = TRAVEL_LINES[to];
  say(lines, () => {
    World.load(to);
    const a = to === 'swamp' ? { x: 20.5 * TS, y: 43.8 * TS } : World.spots.arrive;
    Object.assign(Game.dan, { x: a.x, y: a.y, ride: null, dir: 'down', hiding: false, carry: null });
    Object.assign(Game.boat, { x: World.spots.boat.x, y: World.spots.boat.y, dir: 'right' });
    Object.assign(Game.cooler, { x: a.x + 24, y: a.y + 6, dir: 'down', home: null });
    Heat.end(); Game.heat = 0; Game.prints = [];
    spawn();
    Game.cam.x = Game.dan.x - VW / 2; Game.cam.y = Game.dan.y - VH / 2 - 10; Game.flash = .7;
    if (to === 'miami' && !Game.flags.miamiFirst) { Game.flags.miamiFirst = true; headline('FLORIDA MAN ARRIVES IN MIAMI WITH A COOLER AND "NO PLAN"; CITY "BRACES"', 3); }
    toast({ miami: 'Welcome to MIAMI. Everything is pink and costs $19.', daytona: 'Welcome to DAYTONA BEACH. World Center of Racing. And sunburns.', swamp: 'Home sweet swamp.' }[to], 3.5);
    if (to === 'daytona' && !Game.flags.daytonaFirst) { Game.flags.daytonaFirst = true; headline('FLORIDA MAN ARRIVES IN DAYTONA; SPEEDWAY "ON HIGH ALERT"', 2); }
    if (typeof MiamiCases !== 'undefined') MiamiCases.arrived(to);
    if (typeof DaytonaCases !== 'undefined') DaytonaCases.arrived(to);
    Gigs.drop(); Gigs.newDay();   // a gig can't follow you onto the bus; new town, new people with work
    save();
  });
}
