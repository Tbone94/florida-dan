// FLORIDA DAN — the look. Everything here is visual only:
//  - a time-of-day color grade per region (pink dawn, punchy noon, golden hour, purple hour, navy night), fed to the screen shader
//  - a night light layer: porch lights, neon, headlights, cop lights, fire, fireflies actually light the world
//  - long sun shadows that swing and stretch with the hour
//  - chaos that sticks around (scorch marks, cans, tire tracks) until Dan sleeps, and a few permanent story scars
//  - dusk mosquito clouds over the swamp (heat shimmer lives in the shader)
'use strict';
// [hour, shadow tint, highlight tint, saturation, ambient light]
const GRADES = {
  swamp: [
    [0, [.34, .36, .66], [.60, .64, .95], .95, .42], [5, [.40, .38, .68], [.70, .62, .88], .95, .5], [6.2, [.72, .54, .74], [1.04, .78, .80], 1.08, .78],
    [7.6, [.93, .90, .99], [1.05, .99, .91], 1.22, .97], [10, [.97, .99, 1.03], [1.04, 1.02, .97], 1.3, 1], [16, [.95, .93, 1.02], [1.06, 1.0, .90], 1.3, 1],
    [17.8, [.80, .62, .84], [1.14, .90, .66], 1.38, .97], [19.2, [.60, .46, .80], [1.0, .74, .74], 1.25, .8], [20.6, [.38, .38, .70], [.66, .66, .95], 1.0, .5], [24, [.34, .36, .66], [.60, .64, .95], .95, .42]],
  miami: [
    [0, [.36, .28, .64], [.74, .58, .98], 1.1, .46], [5.5, [.46, .36, .70], [.80, .64, .92], 1.05, .55], [6.6, [.80, .60, .80], [1.06, .84, .86], 1.15, .82],
    [8, [.95, .93, 1.0], [1.05, 1.0, .95], 1.3, .98], [10, [.98, 1.0, 1.04], [1.05, 1.03, 1.0], 1.35, 1], [16.5, [.96, .94, 1.04], [1.06, 1.0, .94], 1.35, 1],
    [18.2, [.78, .56, .88], [1.12, .84, .74], 1.42, .96], [19.4, [.58, .40, .84], [1.04, .72, .88], 1.35, .8], [20.8, [.38, .30, .68], [.78, .60, .98], 1.15, .52], [24, [.36, .28, .64], [.74, .58, .98], 1.1, .46]],
  keys: [
    [0, [.30, .36, .64], [.60, .70, .98], 1.0, .44], [5.5, [.42, .40, .70], [.78, .70, .92], 1.0, .54], [6.6, [.84, .62, .76], [1.08, .86, .80], 1.14, .82],
    [8, [.96, .98, 1.02], [1.06, 1.03, .96], 1.28, .99], [10, [1.0, 1.02, 1.04], [1.08, 1.06, 1.0], 1.32, 1], [17, [.98, .96, 1.02], [1.08, 1.02, .94], 1.32, 1],
    [18.4, [.86, .60, .78], [1.18, .88, .66], 1.46, .97], [19.6, [.66, .44, .80], [1.10, .74, .78], 1.36, .82], [20.9, [.36, .34, .70], [.70, .66, 1.0], 1.08, .52], [24, [.30, .36, .64], [.60, .70, .98], 1.0, .44]],
  daytona: [
    [0, [.34, .36, .64], [.62, .66, .95], .95, .44], [5.5, [.42, .40, .68], [.72, .66, .88], .95, .52], [6.5, [.76, .60, .74], [1.05, .84, .78], 1.08, .8],
    [8, [.96, .95, 1.0], [1.07, 1.04, .95], 1.15, .98], [10, [1.0, 1.0, 1.02], [1.08, 1.06, .97], 1.18, 1], [16.5, [.98, .95, 1.0], [1.08, 1.02, .92], 1.2, 1],
    [18, [.82, .64, .82], [1.14, .90, .68], 1.3, .96], [19.3, [.60, .46, .78], [1.0, .76, .74], 1.2, .8], [20.7, [.38, .38, .68], [.66, .68, .95], 1.0, .5], [24, [.34, .36, .64], [.62, .66, .95], .95, .44]],
};
const Look = {
  g: null,
  // ---------- the grade for right now ----------
  grade() {
    const K = GRADES[Game.region] || GRADES.swamp, h = Game.mode === 'title' ? 11 : ((Game.hour % 24) + 24) % 24;
    let i = 0; while (i < K.length - 2 && h > K[i + 1][0]) i++;
    const [h0, s0, i0, a0, b0] = K[i], [h1, s1, i1, a1, b1] = K[i + 1], k = clamp((h - h0) / Math.max(.01, h1 - h0), 0, 1), mix = (p, q) => p.map((v, j) => v + (q[j] - v) * k);
    const noon = Game.mode === 'title' || MIAMI() ? 0 : clamp(1 - Math.abs(h - 13.2) / 2.4, 0, 1);
    return this.g = { sh: mix(s0, s1), hi: mix(i0, i1), sat: a0 + (a1 - a0) * k, amb: Math.min(1, (b0 + (b1 - b0) * k) + Game.storm * 0), shimmer: noon * (1 - Game.storm) };
  },
  // ---------- night lights ----------
  glows: {},
  glow(col, r) {
    const key = col + r; if (this.glows[key]) return this.glows[key];
    const c = document.createElement('canvas'); c.width = c.height = r * 2; const x = c.getContext('2d'), gr = x.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, col); gr.addColorStop(.35, col + 'aa'); gr.addColorStop(.7, col + '33'); gr.addColorStop(1, col + '00'); x.fillStyle = gr; x.fillRect(0, 0, r * 2, r * 2);
    return this.glows[key] = c;
  },
  lights(cx, cy, t) {
    const G = this.g || this.grade(); if (G.amb > .97 || Game.mode === 'title') return null;
    const c = this.lc || (this.lc = document.createElement('canvas')); if (c.width !== buf.width || c.height !== buf.height) { c.width = buf.width; c.height = buf.height; this.lx = c.getContext('2d'); }
    const x = this.lx, on = Math.min(1, (1 - G.amb) * 2.4);
    x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'lighter';
    const L = (wx, wy, r, col, a = 1) => { const sx = wx - cx, sy = wy - cy; if (sx < -r || sy < -r || sx > c.width + r || sy > c.height + r) return; x.globalAlpha = clamp(a * on, 0, 1); x.drawImage(this.glow(col, r), Math.round(sx - r), Math.round(sy - r)); };
    const D = Game.dan, fl = (s, k = 1) => .8 + Math.sin(t * 9 * k + s) * .12 + Math.sin(t * 23 * k + s * 3) * .08;
    L(D.x, D.y - 8, 46, '#ffd9a0', .4);   // just enough to always see Dan
    for (const p of World.props) {
      const mx = p.x + p.w / 2, by = p.y + p.h; if (mx < cx - 140 || mx > cx + c.width + 140 || by < cy - 60 || by > cy + c.height + 160) continue;
      switch (p.kind) {
        case 'cabin': { const d = World.spots.door; L(d.x, d.y + 6, 50, '#ffc978', .9); L(p.x + p.w * .25, p.y + 4, 28, '#ffcf7a', .45); L(p.x + p.w * .75, p.y + 4, 28, '#ffcf7a', .45); break; }
        case 'neonsign': if (hasUp('neon')) L(p.x + 9, p.y - 22, 34, '#ff4fd8', .85 * (Math.floor(t * 3) % 11 ? 1 : .2)); break;
        case 'canopy': L(mx, p.y + p.h / 2, 72, '#fff1d6', .7); break;
        case 'gas': L(mx, by - 10, 54, '#fff0c8', .6); break;
        case 'pump': L(p.x + 6, p.y, 16, '#ff6a6a', .45); break;
        case 'tiki': L(mx, by - 12, 56, '#ffb35a', .8); break;
        case 'torch': L(p.x + 3, p.y - 14, 32, '#ff9a3d', fl(p.x)); break;
        case 'motel': case 'motel2': for (let i = 1; i < 4; i++) L(p.x + p.w * i / 4, by - 10, 24, '#ffd28a', .5); break;
        case 'motelsign': L(mx, p.y - 14, 38, '#ff5ea8', .85); break;
        case 'fireworks': L(mx, by - 12, 44, '#ffd23f', .7); break;
        case 'bubba': L(mx, by - 12, 36, '#ffcf7a', .6); break;
        case 'deco': { const top = p.y - (p.floors || 2) * 14; L(mx, top - 30, 50, p.neon || '#ff4fd8', .9); L(mx, by - 12, 32, '#ffe0a0', .8); L(p.x + p.w * .22, by - 30, 32, '#ffe9a8', .35); L(p.x + p.w * .78, by - 30, 32, '#ffe9a8', .35); break; }
        case 'condo': L(mx, by - 40, 64, '#ffe9a8', .45); break;
        case 'cafe': L(mx, by - 10, 40, '#ffd28a', .75); break;
        case 'station': case 'mdcourt': case 'courthouse': case 'marina': case 'surfshack': case 'shop': case 'garage': L(mx, by - 12, 36, '#fff0c8', .5); break;
        case 'saloon': L(mx, by - 12, 44, '#ffb35a', .7); break;
        case 'tattoo': L(mx, by - 16, 40, '#ff4fd8', .8); break;
        case 'speedshop': L(mx, by - 16, 40, '#7fd8ff', .7); break;
        case 'donut': L(mx, p.y - 20, 52, '#ff5ea8', .85); break;
        case 'drivethru': L(mx, by - 8, 30, '#ffd23f', .7); break;
        case 'grandstand': L(mx, p.y, 96, '#f4f8ff', .8); break;
        case 'van': L(mx, by - 8, 26, '#c77dff', .6 + Math.sin(t * 2) * .15); break;
        case 'rv': case 'trailer': L(mx, by - 8, 24, '#ffcf7a', .55); break;
        case 'icemachine': L(mx, by - 6, 18, '#9fe0ff', .5); break;
        case 'billboard': L(mx, by - 20, 44, '#fff0c8', .45); break;
        case 'grill': case 'fryer': L(mx, by - 4, 22, '#ff8a3d', .5 * fl(p.x, .5)); break;
      }
    }
    // headlights: the cooler (it has headlights, it's a joke in the game) and every car
    const beam = (px, py, ax, ay) => { L(px + ax * 16, py + ay * 16 - 2, 22, '#fff6d0', .8); L(px + ax * 34, py + ay * 34 - 2, 30, '#fff6d0', .5); };
    const dv = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, C = Game.cooler;
    if (C) { const [ax, ay] = dv[D.ride === 'cooler' ? D.dir : C.dir] || [0, 1]; beam(D.ride === 'cooler' ? D.x : C.x, D.ride === 'cooler' ? D.y : C.y, ax, ay); }
    for (const v of Game.vehicles || []) beam(v.x, v.y, Math.cos(v.a || 0), Math.sin(v.a || 0));
    const cop = typeof Heat !== 'undefined' && Heat.cop; if (cop) { const b = Math.floor(t * 8) % 2; L(cop.x - 4, cop.y, 52, b ? '#ff3b3b' : '#3b7bff', .95); }
    let n = 0; for (const q of Game.parts) if (q.kind === 'fire' && n++ < 40) L(q.x, q.y, 14, '#ff8a3d', .55);
    if (typeof Ambient !== 'undefined' && Ambient.eachFly) Ambient.eachFly(cx, cy, t, (wx, wy, b) => L(wx, wy, 9, '#d9ff6a', .8 * b));
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    return c;
  },
  // ---------- long sun shadows ----------
  HT: { cabin: 44, gas: 40, canopy: 30, tiki: 38, motel: 34, motel2: 34, bubba: 34, condo: 90, cafe: 30, station: 40, mdcourt: 52, courthouse: 52, marina: 28, surfshack: 30, shop: 30,
    saloon: 40, tattoo: 34, speedshop: 36, donut: 42, grandstand: 50, garage: 34, trailer: 24, rv: 24, van: 22, truck: 20, billboard: 36, fireworks: 30, icemachine: 18, pump: 20, porta: 22, dumpster: 14, grill: 12, fryer: 12 },
  shadows(cx, cy, t) {
    const h = Game.hour; if (Game.mode === 'title' || h < 6.4 || h > 19.3 || Game.storm > .3 || (Game.scene === 'court')) return;
    const s = clamp((h - 12.8) / 6.4, -1, 1), k = .22 + 1.15 * Math.pow(Math.abs(s), 1.35), dx = s * k, dy = -.22 * k - .06;
    const fade = Math.min(1, (h - 6.4) * 1.4, (19.3 - h) * 1.4);
    const c = this.sc || (this.sc = document.createElement('canvas')); if (c.width !== buf.width || c.height !== buf.height) { c.width = buf.width; c.height = buf.height; this.sx = c.getContext('2d'); }
    const x = this.sx; x.clearRect(0, 0, c.width, c.height); x.fillStyle = '#000';
    const box = (bx, by, w, d, H) => { const ox = dx * H, oy = dy * H, n = Math.max(2, Math.ceil(Math.hypot(ox, oy) / 3)); for (let i = 0; i <= n; i++) x.fillRect(Math.round(bx + ox * i / n - cx), Math.round(by + oy * i / n - cy), w, d); };
    const tree = (bx, by, H, cw) => { box(bx - 1, by - 2, 3, 3, H * .8); const ox = dx * H, oy = dy * H; x.beginPath(); x.ellipse(Math.round(bx + ox - cx), Math.round(by + oy - cy), cw / 2, cw / 4.5, 0, 0, 7); x.fill(); };
    for (const p of World.props) {
      if (p.x + p.w < cx - 160 || p.x > cx + c.width + 160 || p.y > cy + c.height + 120 || p.y + p.h < cy - 120) continue;
      if (p.kind === 'palm') { tree(p.x + 4, p.y + 5, 42, 30); continue; }
      if (p.kind === 'cypress') { tree(p.x + 4, p.y + 6, 40, 30); continue; }
      if (p.kind === 'deco') { box(p.x, p.y, p.w, p.h, (p.floors || 2) * 14 + 34); continue; }
      const H = this.HT[p.kind]; if (H) box(p.x, p.y, p.w, p.h, H);
    }
    const man = a => { if (a && !a.hidden) box(a.x - 3, a.y - 1, 6, 3, 18); };
    man(Game.dan); for (const n of Game.npcs) man(n);
    for (const a of Game.animals) if (a.type === 'cow' || a.ape) box(a.x - 6, a.y - 2, 12, 4, a.ape ? 30 : 12);
    g.globalAlpha = .32 * fade; g.drawImage(c, 0, 0); g.globalAlpha = 1;
  },
  // ---------- chaos that sticks around (until Dan sleeps), and permanent story scars ----------
  mark(kind, x, y, o = {}, perm = false) {
    const list = perm ? (Game.flags.scars = Game.flags.scars || []) : (Game.marks = Game.marks || []);
    if (!perm && list.length > 500) list.shift();
    list.push({ kind, x: Math.round(x), y: Math.round(y), r: Game.region, s: Math.random(), ...o });
  },
  drawMarks(cx, cy) {
    const all = (Game.flags.scars || []).concat(Game.marks || []); if (!all.length) return;
    for (const m of all) {
      if (m.r !== Game.region) continue; const x = m.x - cx, y = m.y - cy; if (x < -40 || y < -40 || x > VW + 40 || y > VH + 40) { if (m.kind !== 'skid') continue; }
      switch (m.kind) {
        case 'scorch': { const r = m.big ? 16 : 8; g.globalAlpha = .5; g.fillStyle = '#1b1414'; g.beginPath(); g.ellipse(x, y, r, r * .55, 0, 0, 7); g.fill();
          g.globalAlpha = .35; for (let i = 0; i < 6; i++) { const a = m.s * 9 + i * 1.1; R(Math.round(x + Math.cos(a) * r * 1.1), Math.round(y + Math.sin(a) * r * .6), 2, 1, '#1b1414'); } g.globalAlpha = 1; break; }
        case 'can': R(x, y, 3, 2, '#8fb3d9'); R(x, y, 1, 2, '#e8eef5'); R(x + 2, y, 1, 2, PAL.red); break;
        case 'track': g.globalAlpha = .28; R(x, y, 2, 1, '#3a2c20'); g.globalAlpha = 1; break;
        case 'flip': R(x, y, 3, 2, PAL.hat); R(x + 1, y, 1, 1, PAL.ink); break;
        case 'paper': R(x, y, 1, 1, [PAL.hat, PAL.yellow, PAL.teal, PAL.white][Math.floor(m.s * 4)]); break;
        case 'shingles': for (let i = 0; i < 4; i++) R(Math.round(x + (m.s * 7 + i * 5) % 14 - 7), Math.round(y + i * 2 - 3), 4, 2, i % 2 ? PAL.greyD : '#6e6a78'); break;
        case 'skid': { g.globalAlpha = .4; g.strokeStyle = '#1b1414'; g.lineWidth = 1; for (const off of [-3, 3]) { g.beginPath(); g.moveTo(x + .5, y + off + .5); g.lineTo(m.x2 - cx + .5, m.y2 - cy + off + .5); g.stroke(); } g.globalAlpha = 1; break; }
        case 'donuts': { g.globalAlpha = .35; g.strokeStyle = '#1b1414'; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(x, y, 14 + i * 3, 8 + i * 2, m.s, 0, 7); g.stroke(); } g.globalAlpha = 1; break; }
      }
    }
  },
  // ---------- dusk mosquito clouds over swamp water ----------
  air(cx, cy, t) {
    const h = Game.hour; if (MIAMI() || DAYTONA() || KEYS() || h < 17.4 || h > 21.2 || Game.mode === 'title') return;
    const cs = 96, x0 = Math.floor(cx / cs) - 1, y0 = Math.floor(cy / cs) - 1;
    for (let gy = y0; gy <= y0 + Math.ceil(VH / cs) + 1; gy++) for (let gx = x0; gx <= x0 + Math.ceil(VW / cs) + 1; gx++) {
      if (hash2(gx * 3, gy * 7) < .55) continue;
      const wx = gx * cs + hash2(gx, gy + 2) * cs, wy = gy * cs + hash2(gx + 2, gy) * cs, k = World.at(wx, wy); if (!(k === T.SHALLOW || k === T.SAWGRASS || k === T.MUD)) continue;
      for (let i = 0; i < 9; i++) { const a = t * (2 + i * .37) + i * 2.1, r = 3 + (i % 4) * 1.6; R(Math.round(wx - cx + Math.cos(a) * r), Math.round(wy - cy - 14 + Math.sin(a * 1.3) * r * .7), 1, 1, PAL.ink); }
    }
  },
};
