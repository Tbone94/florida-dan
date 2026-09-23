// FLORIDA DAN — the air: dithered cloud shadows drifting over everything, sun glints on the water,
// fireflies after dark. Pure decoration, drawn over the world and under the HUD; nothing here touches gameplay.
'use strict';
const Ambient = (() => {
  const CS = 384;   // the cloud-shadow tile, in world pixels; it wraps, so the sky never runs out
  let cloud = null;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
  function bakeClouds() {
    const c = document.createElement('canvas'); c.width = c.height = CS; const x = c.getContext('2d'), img = x.createImageData(CS, CS), d = img.data;
    let s = 91; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const blobs = []; for (let i = 0; i < 7; i++) { const bx = r() * CS, by = r() * CS, n = 3 + Math.floor(r() * 4); for (let k = 0; k < n; k++) blobs.push([bx + (r() - .5) * 90, by + (r() - .5) * 40, 26 + r() * 34, 16 + r() * 18]); }
    const v = new Float32Array(CS * CS);   // density field: each blob only touches its own box (wrapped), so baking is instant
    for (const [bx, by, rx, ry] of blobs) for (let y = Math.floor(by - ry); y <= by + ry; y++) for (let x = Math.floor(bx - rx); x <= bx + rx; x++) {
      const dx = (x - bx) / rx, dy = (y - by) / ry, q = dx * dx + dy * dy; if (q >= 1) continue;
      const k = ((y % CS + CS) % CS) * CS + ((x % CS + CS) % CS); v[k] = Math.max(v[k], 1 - q);
    }
    for (let py = 0; py < CS; py++) for (let px = 0; px < CS; px++) {
      if (v[py * CS + px] * 1.6 > BAYER[(py & 3) * 4 + (px & 3)]) { const i = (py * CS + px) * 4; d[i] = 20; d[i + 1] = 26; d[i + 2] = 48; d[i + 3] = 255; }   // ordered dither: soft edges, honest pixels
    }
    x.putImageData(img, 0, 0); return c;
  }
  const daylight = h => h < 6 || h > 19.5 ? 0 : h < 8 ? (h - 6) / 2 : h > 17.5 ? (19.5 - h) / 2 : 1;
  function clouds(cx, cy, t) {
    const a = daylight(Game.hour) * (.16 + Game.storm * .14); if (a <= .01) return;
    cloud = cloud || bakeClouds();
    const ox = ((cx - t * 7) % CS + CS) % CS, oy = ((cy - t * 2.5) % CS + CS) % CS;
    g.globalAlpha = a;
    for (let y = -oy; y < VH; y += CS) for (let x = -ox; x < VW; x += CS) g.drawImage(cloud, Math.round(x), Math.round(y));
    g.globalAlpha = 1;
  }
  function glints(cx, cy, t) {
    if (daylight(Game.hour) < .5) return;
    const tx0 = Math.floor(cx / TS), ty0 = Math.floor(cy / TS), f = Math.floor(t * 3);
    for (let ty = ty0; ty <= ty0 + 12; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VW / TS); tx++) {
      const k = World.tile(tx, ty); if (!WET(k) || k === T.SHALLOW) continue;
      const h = hash2(tx * 7 + f, ty * 3); if (h < .93) continue;
      const x = Math.round(tx * TS - cx + hash2(tx, ty + f) * 12 + 2), y = Math.round(ty * TS - cy + hash2(ty, tx - f) * 12 + 2);
      R(x, y, 1, 1, PAL.white); if (h > .975) { R(x - 1, y, 3, 1, PAL.white); R(x, y - 1, 1, 3, PAL.white); }
    }
  }
  function fireflies(cx, cy, t) {
    const h = Game.hour; if (!(h > 19.8 || h < 5) || MIAMI()) return;
    const cs = 64, x0 = Math.floor(cx / cs) - 1, y0 = Math.floor(cy / cs) - 1;   // anchored to the world, so they hover in place as you walk
    for (let gy = y0; gy <= y0 + Math.ceil(VH / cs) + 2; gy++) for (let gx = x0; gx <= x0 + Math.ceil(VW / cs) + 2; gx++) {
      if (hash2(gx, gy) < .3) continue;
      const i = gx * 31 + gy * 17;
      const wx = gx * cs + hash2(gx, gy + 1) * cs + Math.sin(t * (.3 + hash2(gy, gx) * .4) + i) * 14, wy = gy * cs + hash2(gx + 1, gy) * cs + Math.cos(t * (.25 + hash2(gx, gy + 5) * .3) + i) * 9;
      if (WET(World.at(wx, wy))) continue;
      const blink = Math.sin(t * (1.6 + hash2(i, 11)) + i * 1.7); if (blink < .2) continue;
      const x = Math.round(wx - cx), y = Math.round(wy - cy);
      g.globalAlpha = .55 * blink; R(x - 2, y - 1, 5, 3, '#d9ff6a'); R(x - 1, y - 2, 3, 5, '#d9ff6a'); g.globalAlpha = 1; R(x - 1, y, 3, 1, '#f4ffb0'); R(x, y - 1, 1, 3, '#f4ffb0');
    }
  }
  return { water: glints, air(cx, cy, t) { fireflies(cx, cy, t); clouds(cx, cy, t); } };   // water: right after the tiles; air: over everything in the world
})();
