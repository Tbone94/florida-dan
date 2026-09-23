// Florida Dan — the swamp: ink palette, map generation, sprites and top-down drawing.
'use strict';
const VW = 320, VH = 180, TS = 16, MW = 56, MH = 40;

// Every color is an ink recipe: I(blue, pink, yellow), 0..255 each.
const I = (b, p, y) => `rgb(${b},${p},${y})`;
const C = {
  deep: I(235, 70, 10), water: I(185, 30, 0), shallow: I(130, 5, 30), ripple: I(70, 0, 0), foam: I(20, 0, 0),
  grass: I(110, 0, 150), grassD: I(165, 20, 190), grassL: I(60, 0, 110), bank: I(150, 120, 200),
  mud: I(55, 95, 170), mudD: I(95, 135, 200), wood: I(75, 130, 215), woodD: I(135, 185, 235), woodL: I(35, 80, 170),
  dark: I(255, 215, 200), shade: I(60, 45, 45), paper: I(0, 0, 0),
  skin: I(0, 95, 160), skinD: I(25, 140, 200), pink: I(0, 235, 0), pinkL: I(0, 120, 0), yellow: I(0, 0, 235), blue: I(230, 0, 0), blueL: I(120, 0, 0),
  white: I(8, 6, 10), gator: I(160, 45, 215), gatorD: I(215, 95, 240), gatorL: I(110, 20, 190),
  moss: I(70, 40, 110), lily: I(120, 0, 190), reed: I(80, 50, 200), rust: I(20, 170, 220), smoke: I(45, 35, 40),
  roof: I(35, 175, 80), trailer: I(20, 10, 40), trailerD: I(90, 50, 90),
};

const T = { DEEP: 0, WATER: 1, SHALLOW: 2, GRASS: 3, MUD: 4, DOCK: 5 };
const WALKABLE = t => t === T.GRASS || t === T.MUD || t === T.DOCK || t === T.SHALLOW;
const BOATABLE = t => t === T.DEEP || t === T.WATER || t === T.SHALLOW;
const WET = t => t <= T.SHALLOW;

function hash2(x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

// ---------- map ----------
const World = {
  map: new Uint8Array(MW * MH), props: [], spots: {},
  tile(tx, ty) { return tx < 0 || ty < 0 || tx >= MW || ty >= MH ? T.DEEP : this.map[ty * MW + tx]; },
  at(px, py) { return this.tile(Math.floor(px / TS), Math.floor(py / TS)); },
  set(tx, ty, t) { if (tx >= 0 && ty >= 0 && tx < MW && ty < MH) this.map[ty * MW + tx] = t; },
  fill(x0, y0, x1, y1, t) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, t); },
  solidAt(px, py) {
    for (const p of this.props) if (p.solid && px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h) return p;
    return null;
  },
};

function buildWorld() {
  const blob = (x, y, cx, cy, r) => Math.max(0, 1 - Math.hypot((x - cx) / r, (y - cy) / (r * .78)));
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    let f = blob(x, y, 17, 20, 13) * 1.3 + blob(x, y, 44, 12, 7.5) * 1.35 + blob(x, y, 41, 31, 5) * 1.25 + blob(x, y, 5, 5, 4)
      + (vnoise(x * .19, y * .19) - .5) * .6;
    let t = f > .42 ? T.GRASS : f > .3 ? T.SHALLOW : f > .1 ? T.WATER : T.DEEP;
    if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) t = T.DEEP;
    World.map[y * MW + x] = t;
  }
  World.fill(11, 14, 22, 23, T.GRASS);          // Dan's yard
  World.fill(40, 8, 48, 15, T.GRASS);           // Merle's lot
  // dock: runs east off Dan's island along row 22
  let x0 = 18; while (World.tile(x0, 22) === T.GRASS) x0++;
  for (let x = x0 - 1; x <= x0 + 4; x++) World.set(x, 22, T.DOCK);
  for (let x = x0 + 5; x <= x0 + 8; x++) for (let y = 21; y <= 23; y++) if (!WET(World.tile(x, y))) World.set(x, y, T.WATER);
  // mud path: cabin door → dock
  for (let y = 19; y <= 22; y++) World.set(16, y, T.MUD);
  for (let x = 16; x < x0 - 1; x++) World.set(x, 22, T.MUD);
  World.fill(42, 14, 43, 16, T.MUD);

  const P = World.props = [];
  const add = (kind, tx, ty, w, h, solid = true, extra = {}) => { const p = { kind, x: tx * TS, y: ty * TS, w: w * TS, h: h * TS, solid, ...extra }; P.push(p); return p; };
  add('cabin', 13, 15, 5, 3);                    // door is at the bottom middle, x=15.5
  add('couch', 19, 17, 2, 1, true);
  add('truck', 11, 19, 3, 2);
  add('flamingo', 18, 20, .5, .5, false);
  add('grill', 13, 19, 1, 1, true);
  add('trailer', 42, 10, 5, 3);
  add('flamingo', 47, 14, .5, .5, false);
  add('sign', 11, 23, 1, 1, true, { text: 'NO TRESPASSIN' });
  World.spots = { door: { x: 15.5 * TS, y: 18.6 * TS }, dockEnd: { x: (x0 + 4.5) * TS, y: 22.5 * TS }, boat: { x: (x0 + 6) * TS, y: 22.5 * TS }, merle: { x: 44.5 * TS, y: 13.9 * TS }, dan: { x: 15.5 * TS, y: 19.4 * TS } };

  const r = rng(29);
  const clear = (x, y) => !World.solidAt(x * TS + 8, y * TS + 8) && Math.hypot(x - 16, y - 18) > 4.5 && Math.hypot(x - 44, y - 12) > 3.5 && World.tile(x, y) === T.GRASS && World.tile(x, y + 1) !== T.DOCK && World.tile(x, y + 1) !== T.MUD && World.tile(x, y) !== T.MUD;
  for (let i = 0; i < 900; i++) {
    const x = 1 + Math.floor(r() * (MW - 2)), y = 1 + Math.floor(r() * (MH - 2)), t = World.tile(x, y);
    const roll = r();
    if (t === T.GRASS && clear(x, y) && roll < .14) add(r() < .7 ? 'cypress' : 'palm', x + .25, y + .55, .5, .4, true, { s: r() });
    else if (t === T.SHALLOW && roll < .1) add('reeds', x, y, 1, 1, false, { s: r() });
    else if ((t === T.WATER || t === T.DEEP) && roll < .025) add('lily', x, y, 1, 1, false, { s: r() });
  }
}

// ---------- sprites (janky on purpose) ----------
const KEY = { P: C.pink, h: C.mud, s: C.skin, S: C.skinD, K: C.dark, W: C.white, w: C.pinkL, B: C.blue, b: C.skin, f: C.yellow, m: C.mudD, g: C.gator, G: C.gatorD, y: C.yellow, o: C.rust, r: C.roof };
const DAN = {
  down: [
    '....PPPP....', '...PPPPPP...', '..PPPPPPPPP.', '..hssssssh..', '..sKKssKKs..', '..ssssssss..', '..hshhhhsh..', '...hssssh...',
    '..sWWWWWWs..', '.ssWWwWWWss.', '.s.WWbbWW.s.', '.s.WWbbWW.s.', '...BBBBBB...', '...BB..BB...', '...ss..ss...', '..ff....ff..'],
  up: [
    '....PPPP....', '...PPPPPP...', '...PPPPPP...', '..hhhhhhhh..', '..hhhhhhhh..', '..hhhhhhhh..', '...hhhhhh...', '...hhhhhh...',
    '..sWWWWWWs..', '.ssWWWWWWss.', '.s.WWWWWW.s.', '.s.WWWWWW.s.', '...BBBBBB...', '...BB..BB...', '...ss..ss...', '..ff....ff..'],
  side: [
    '....PPPP....', '...PPPPPPP..', '...PPPPPPPPP', '...hhsssss..', '...hhsKKKs..', '...hhsssss..', '...hhhshhh..', '....hssss...',
    '...sWWWWW...', '...sWWwWbb..', '...sWWWWbb..', '....sWWWW...', '....BBBBB...', '....BB.BB...', '....ss.ss...', '...ff..ff...'],
};
const MERLE = [
  '............', '...rrrrrr...', '..rrrrrrrr..', '..hsssssh...', '..sKssKss...', '..ssssssss..', '..hhhhhhhh..', '..hhhhhhhh..',
  '..sBBBBBBs..', '.ssBBBBBBss.', '.s.BBBBBB.s.', '.s.BBBBBB.s.', '...mmmmmm...', '...mm..mm...', '...ss..ss...', '..KK....KK..'];

const SPR = {};
function bake(rows, flip) {
  const c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, i) => { if (KEY[ch]) { x.fillStyle = KEY[ch]; x.fillRect(flip ? row.length - 1 - i : i, y, 1, 1); } }));
  return c;
}
function bakeSprites() {
  SPR.down = bake(DAN.down); SPR.up = bake(DAN.up); SPR.right = bake(DAN.side); SPR.left = bake(DAN.side, true);
  SPR.merle = bake(MERLE);
}

// ---------- drawing ----------
let g;  // 2d context of the ink buffer, set by game.js
const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

function drawTiles(cx, cy, t) {
  const tx0 = Math.floor(cx / TS), ty0 = Math.floor(cy / TS);
  for (let ty = ty0; ty <= ty0 + Math.ceil(VH / TS) + 1; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VW / TS) + 1; tx++) {
    const k = World.tile(tx, ty), x = tx * TS - cx, y = ty * TS - cy, hs = hash2(tx, ty);
    if (WET(k)) {
      R(x, y, TS, TS, k === T.DEEP ? C.deep : k === T.WATER ? C.water : C.shallow);
      const ph = (t * .8 + hs * 6.28);
      if (hs > .55) R(x + 3 + Math.sin(ph) * 2, y + 5 + hs * 6, 5, 1, C.ripple);
      if (hs < .12) R(x + 8 + Math.cos(ph) * 2, y + 11, 3, 1, C.foam);
    } else if (k === T.DOCK) {
      R(x, y, TS, TS, C.water);
      R(x, y + 2, TS, 12, C.wood);
      for (let i = 0; i < 4; i++) R(x + i * 4, y + 2, 1, 12, C.woodD);
      R(x, y + 14, TS, 2, C.woodL);
      if ((tx & 1) === 0) { R(x + 1, y + 13, 2, 3, C.woodD); R(x + 13, y + 13, 2, 3, C.woodD); }
    } else {
      R(x, y, TS, TS, k === T.MUD ? C.mud : C.grass);
      if (k === T.GRASS) {
        if (hs > .6) { R(x + hs * 10, y + 4, 1, 2, C.grassD); R(x + hs * 10 + 2, y + 3, 1, 3, C.grassD); }
        if (hs < .2) R(x + 5, y + 9, 2, 1, C.grassL);
        if (hs > .93) { R(x + 6, y + 6, 2, 2, C.pink); R(x + 7, y + 8, 1, 2, C.grassD); }
      } else if (hs > .5) R(x + hs * 12, y + 7, 2, 1, C.mudD);
      // 3/4-view bank where land drops into water
      if (WET(World.tile(tx, ty + 1))) { R(x, y + 12, TS, 4, C.bank); R(x, y + 15, TS, 1, C.dark); }
      if (WET(World.tile(tx - 1, ty))) R(x, y, 1, TS, C.bank);
      if (WET(World.tile(tx + 1, ty))) R(x + 15, y, 1, TS, C.bank);
    }
  }
}

function shadow(x, y, w) {
  g.globalCompositeOperation = 'lighter';   // adds ink = darker, just like a second pass
  R(x - w / 2, y - 1, w, 3, C.shade);
  g.globalCompositeOperation = 'source-over';
}

function drawProp(p, cx, cy, t) {
  const x = Math.round(p.x - cx), y = Math.round(p.y - cy);
  switch (p.kind) {
    case 'cabin': {
      R(x - 2, y - 26, p.w + 4, 14, C.roof);                        // tin roof
      for (let i = 0; i < p.w + 4; i += 5) R(x - 2 + i, y - 26, 1, 14, C.rust);
      R(x - 2, y - 13, p.w + 4, 2, C.dark);
      R(x, y - 11, p.w, p.h + 11, C.wood);
      for (let i = 0; i < p.h + 11; i += 4) R(x, y - 11 + i, p.w, 1, C.woodD);
      R(x + 33, y + p.h - 18, 12, 18, C.dark);                       // door
      R(x + 35, y + p.h - 16, 8, 14, C.woodL);
      R(x + 8, y + 4, 12, 9, C.yellow); R(x + 13, y + 4, 1, 9, C.dark); R(x + 8, y + 8, 12, 1, C.dark);   // window
      R(x + 56, y + 4, 12, 9, C.yellow); R(x + 61, y + 4, 1, 9, C.dark);
      R(x + 60, y - 32, 3, 8, C.dark);                               // stovepipe
      shadow(x + p.w / 2, y + p.h + 1, p.w + 2);
      break;
    }
    case 'trailer': {
      R(x, y - 12, p.w, p.h + 12, C.trailer);
      R(x, y - 12, p.w, 3, C.trailerD); R(x, y + 10, p.w, 3, C.pinkL);
      R(x + 10, y - 4, 14, 8, C.blueL); R(x + 50, y - 4, 10, 18, C.trailerD);
      R(x - 4, y + p.h - 2, p.w + 8, 2, C.dark);
      R(x + 30, y + p.h, 4, 4, C.dark); R(x + 70, y + p.h, 4, 4, C.dark);   // cinder blocks
      R(x + 64, y - 22, 1, 12, C.dark); R(x + 60, y - 22, 9, 1, C.dark);   // antenna
      shadow(x + p.w / 2, y + p.h + 3, p.w);
      break;
    }
    case 'truck': {
      R(x, y, p.w, p.h - 6, C.rust); R(x + 2, y + 2, 16, 10, C.blueL); R(x + 22, y + 1, 1, p.h - 8, C.dark);
      R(x + 4, y + p.h - 6, 6, 5, C.dark); R(x + 34, y + p.h - 6, 6, 5, C.dark);   // cinder blocks, no wheels
      R(x + 30, y + 4, 12, 2, C.pinkL);
      break;
    }
    case 'couch': {
      R(x, y - 6, p.w, 8, C.pink); R(x, y + 2, p.w, 10, C.pinkL); R(x - 2, y - 2, 4, 14, C.pink); R(x + p.w - 2, y - 2, 4, 14, C.pink);
      R(x + 10, y + 4, 6, 3, C.yellow);  // stain
      shadow(x + p.w / 2, y + 13, p.w);
      break;
    }
    case 'grill': { R(x + 3, y - 2, 10, 8, C.dark); R(x + 5, y + 6, 1, 8, C.dark); R(x + 10, y + 6, 1, 8, C.dark); if (hash2(t | 0, 1) > .7) R(x + 7, y - 6, 2, 3, C.smoke); break; }
    case 'flamingo': {
      R(x + 3, y - 14, 5, 6, C.pink); R(x + 6, y - 18, 1, 5, C.pink); R(x + 6, y - 20, 3, 2, C.pink); R(x + 9, y - 19, 2, 1, C.dark);
      R(x + 5, y - 8, 1, 10, C.dark); break;
    }
    case 'sign': { R(x + 7, y - 4, 2, 18, C.woodD); R(x - 2, y - 12, 20, 9, C.wood); R(x, y - 9, 16, 1, C.pink); R(x, y - 7, 11, 1, C.pink); break; }
    case 'cypress': {
      const sway = Math.sin(t * .7 + p.s * 9) * 1.2;
      R(x + 2, y - 8, 5, 14, C.mudD); R(x - 1, y + 3, 11, 4, C.mudD);     // flared trunk
      R(x - 9 + sway, y - 34, 26, 22, C.grassD); R(x - 5 + sway, y - 40, 18, 8, C.grassD); R(x - 3 + sway, y - 30, 8, 6, C.grassL);
      R(x - 6 + sway, y - 13, 2, 9, C.moss); R(x + 11 + sway, y - 14, 2, 11, C.moss); R(x + 3 + sway, y - 12, 1, 6, C.moss);  // spanish moss
      shadow(x + 4, y + 8, 18);
      break;
    }
    case 'palm': {
      const sway = Math.sin(t * .9 + p.s * 9) * 1.5;
      for (let i = 0; i < 6; i++) R(x + 2 + i * .6, y - i * 5, 4, 5, i % 2 ? C.mud : C.mudD);
      const tx = x + 5 + sway, ty = y - 30;
      R(tx - 14, ty, 14, 3, C.grassD); R(tx + 1, ty, 14, 3, C.grassD); R(tx - 10, ty - 5, 8, 3, C.grassD); R(tx + 2, ty - 5, 9, 3, C.grassD);
      R(tx - 16, ty + 3, 4, 3, C.grassD); R(tx + 13, ty + 3, 4, 3, C.grassD); R(tx - 1, ty - 1, 3, 3, C.mud);
      shadow(x + 5, y + 6, 14);
      break;
    }
    case 'reeds': {
      for (let i = 0; i < 5; i++) { const rx = x + 2 + i * 3 + p.s * 2, sw = Math.sin(t * 1.5 + i + p.s * 5); R(rx + sw * .6, y + 2 + (i % 2) * 3, 1, 11 - (i % 2) * 3, C.reed); }
      R(x + 5 + p.s * 3, y + 1, 2, 4, C.mudD);   // cattail
      break;
    }
    case 'lily': { R(x + 4, y + 6, 7, 4, C.lily); R(x + 7, y + 6, 1, 2, C.water); if (p.s > .7) R(x + 5, y + 5, 2, 2, C.pink); break; }
  }
}

function drawDan(x, y, dir, moving, t, opts = {}) {
  const spr = SPR[dir] || SPR.down, bob = moving ? (Math.floor(t * 8) % 2) : 0;
  shadow(x, y, 10);
  if (opts.wading) {
    g.drawImage(spr, 0, 0, 12, 12, Math.round(x - 6), Math.round(y - 13 + bob), 12, 12);
    R(x - 7, y - 2, 14, 1, C.foam);
  } else g.drawImage(spr, Math.round(x - 6), Math.round(y - 16 + bob));
  if (opts.beer) { R(x + 5, y - 12, 3, 5, C.blueL); R(x + 5, y - 12, 3, 1, C.white); }
  if (opts.cig) { R(x + 4, y - 9, 3, 1, C.white); R(x + 7, y - 9, 1, 1, C.pink); }
}

function drawBoat(x, y, dir, t, withDan, danDir) {
  const bob = Math.sin(t * 2.2) * .8, horiz = dir === 'left' || dir === 'right';
  const w = horiz ? 30 : 16, h = horiz ? 14 : 28;
  const bx = Math.round(x - w / 2), by = Math.round(y - h / 2 + bob);
  R(bx - 1, by + h - 1, w + 2, 2, C.foam);
  R(bx, by, w, h, C.woodL); R(bx + 2, by + 2, w - 4, h - 4, C.wood);
  if (horiz) { R(bx + (dir === 'right' ? w - 3 : 0), by + 3, 3, h - 6, C.woodL); R(bx + (dir === 'right' ? 2 : w - 6), by + 4, 4, 6, C.dark); }  // outboard
  else R(bx + 5, by + (dir === 'down' ? 2 : h - 7), 6, 5, C.dark);
  if (withDan) g.drawImage(SPR[danDir] || SPR.down, 0, 0, 12, 11, Math.round(x - 6), Math.round(y - 12 + bob), 12, 11);
}

// Gators are drawn procedurally along a local axis so one routine does all four facings.
function drawGator(gt, cx, cy, t) {
  const big = gt.chuck ? 1.35 : 1, lurk = gt.lurk;
  const d = gt.dir, x0 = gt.x - cx, y0 = gt.y - cy;
  const put = (u, v, lu, lv, c) => {
    u *= big; v *= big; lu *= big; lv *= big;
    if (d === 'right') R(x0 + u, y0 + v, lu, lv, c);
    else if (d === 'left') R(x0 - u - lu, y0 + v, lu, lv, c);
    else if (d === 'down') R(x0 + v, y0 + u, lv, lu, c);
    else R(x0 + v, y0 - u - lu, lv, lu, c);
  };
  const sw = Math.sin(t * (gt.state === 'chase' ? 12 : 4) + gt.seed * 7);
  if (lurk) {   // just eyes and ridges above the waterline
    put(-8, -1, 12, 2, C.gatorD); put(-6, -1, 1, 1, C.gatorL); put(-2, -1, 1, 1, C.gatorL);
    put(8, -3, 2, 2, C.gatorD); put(8, 1, 2, 2, C.gatorD); put(8.5, -2.5, 1, 1, C.yellow); put(8.5, 1.5, 1, 1, C.yellow);
    put(12, -1, 5, 2, C.gatorD); put(-12, -3, 6, 1, C.ripple); put(-12, 2, 6, 1, C.ripple);
    return;
  }
  for (let i = 0; i < 4; i++) put(-18 + i * 3, -1 - (3 - i) * .4 + sw * (4 - i) * .45, 4, 2 + i * .7, C.gatorD);   // tail
  put(-7, -4, 14, 8, C.gator);
  for (let i = -6; i < 6; i += 3) { put(i, -1, 2, 2, C.gatorD); }
  const leg = Math.sin(t * 14) * (gt.state === 'chase' ? 1.5 : .6);
  put(-5 + leg, -7, 3, 3, C.gatorD); put(-5 - leg, 4, 3, 3, C.gatorD); put(3 - leg, -7, 3, 3, C.gatorD); put(3 + leg, 4, 3, 3, C.gatorD);
  put(7, -3, 7, 6, C.gator); put(14, -2, gt.chomp > 0 ? 3 : 6, 4, C.gator);
  if (gt.chomp > 0) { put(14, -3.5, 7, 1.5, C.gatorD); put(14, 2, 7, 1.5, C.gatorD); put(15, -2, 5, 4, C.pink); }
  put(8, -4, 2, 2, C.yellow); put(8, 2, 2, 2, C.yellow); put(9, -3.5, 1, 1, C.dark); put(9, 2.5, 1, 1, C.dark);
  if (gt.chuck) { put(-2, -5, 4, 2, C.pink); put(-1, -6, 2, 1, C.pink); }   // Chuck wears a lil pink visor. nobody knows why
}

function drawPickup(p, cx, cy, t) {
  const x = Math.round(p.x - cx), y = Math.round(p.y - cy + Math.sin(t * 3 + p.x) * 1);
  shadow(x, p.y - cy + 2, 7);
  if (p.kind === 'beer') { R(x - 2, y - 7, 5, 7, C.blueL); R(x - 2, y - 7, 5, 1, C.white); R(x - 2, y - 4, 5, 2, C.white); }
  else if (p.kind === 'cig') { R(x - 3, y - 6, 7, 5, C.white); R(x - 3, y - 6, 7, 2, C.pink); }
  else if (p.kind === 'joint') { R(x - 3, y - 3, 7, 2, C.white); R(x + 3, y - 3, 1, 2, C.pink); R(x - 4, y - 4, 1, 1, C.yellow); }
  else if (p.kind === 'bait') { R(x - 3, y - 7, 7, 7, C.yellow); R(x - 3, y - 7, 7, 2, C.dark); R(x - 1, y - 4, 3, 1, C.pink); }
}

function drawNPC(x, y, t) { shadow(x, y, 10); g.drawImage(SPR.merle, Math.round(x - 6), Math.round(y - 16 + (Math.floor(t * 2) % 2))); }
