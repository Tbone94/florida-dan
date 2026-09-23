// FLORIDA DAN — minigames: Blue Marlin-style fishing, gator (and python) wrestling,
// and the ice machine raccoon.
'use strict';
const SPECIES = [
  { id: 'bluegill', name: 'Bluegill', lb: [.3, 1.1], pull: .35, jump: 0, w: 30, h: .55, c1: '#3d6fa8', c2: '#f2a64a', q: ['Lil fella. Still counts.', 'That’s a snack.'] },
  { id: 'bass', name: 'Largemouth Bass', lb: [1.2, 7.5], pull: .7, jump: .3, w: 26, h: .38, c1: '#4f7f2e', c2: '#d9d49a', q: ['Now THAT’S a bass.', 'Hawg alert. HAWG ALERT.', 'Look at the mouth on this sumbitch.'] },
  { id: 'gar', name: 'Florida Gar', lb: [2, 11], pull: .8, jump: .5, w: 14, h: .17, c1: '#6b6a3a', c2: '#c9c29a', q: ['Dinosaur fish. Merle’s gonna be pissed.', 'All teeth, no manners.'] },
  { id: 'cat', name: 'Channel Catfish', lb: [2, 16], pull: .9, jump: 0, w: 18, h: .3, deep: true, c1: '#5d5a66', c2: '#d8d0c0', q: ['Whiskers! Straight to the fryer.', 'Slimy lil bastard.'] },
  { id: 'bowfin', name: 'Mudfish', lb: [2, 9], pull: .85, jump: .15, w: 10, h: .3, c1: '#6b4a2e', c2: '#a8774f', q: ['Mudfish. Nobody wants you, bud. I love you though.'] },
  { id: 'boot', name: "Somebody's Boot", lb: [1, 2], pull: .15, jump: 0, w: 5, junk: true, q: ['Size 11. Not mine. ...Probably.'] },
  { id: 'cart', name: 'Shopping Cart', lb: [25, 31], pull: .5, jump: 0, w: 3, junk: true, q: ['How does this keep happenin’.'] },
  { id: 'phone', name: "Somebody's iPhone", lb: [.4, .4], pull: .1, jump: 0, w: 2, junk: true, q: ['17 missed calls from “MOM.” Not my problem.'] },
  { id: 'ronnie', name: 'BIG RONNIE', lb: [13, 15.5], pull: 1.2, jump: .35, w: 0, legend: true, h: .42, c1: '#2c5e22', c2: '#e8d39a', q: ['BIG RONNIE. THE LEGEND. I’m gonna cry. I’m cryin’.'] },
];
const OCEAN = [
  { id: 'grunt', name: 'Grunt', lb: [.4, 1.5], pull: .35, jump: 0, w: 28, h: .5, c1: '#9fb2b8', c2: '#ffd23f', q: ['It grunts. Hence the name. Hence the fish.'] },
  { id: 'snapper', name: 'Mangrove Snapper', lb: [1, 6], pull: .7, jump: .1, w: 24, h: .4, c1: '#c0392b', c2: '#ffb3a0', q: ['Snapper! Abuela’s gonna fry this.'] },
  { id: 'cuda', name: 'Barracuda', lb: [4, 20], pull: .9, jump: .5, w: 14, h: .18, c1: '#8d8a93', c2: '#e8f0f2', q: ['Teeth. So many teeth.'] },
  { id: 'tarpon', name: 'THE SILVER KING', lb: [40, 90], pull: 1.25, jump: .6, w: 2, legend: true, h: .35, c1: '#d8e6ee', c2: '#ffffff', q: ['A TARPON. The Silver King. Dan is crying in public again.'] },
  { id: 'sneaker', name: 'Designer Sneaker', lb: [1, 1], pull: .15, jump: 0, w: 5, junk: true, q: ['$900 sneaker. Soaked. Still worth $900.'] },
  { id: 'bale', name: 'Square Grouper', lb: [25, 40], pull: .5, jump: 0, w: 3, junk: true, q: ['A bale of “sinus medicine.” The ocean is full of them.'] },
];
const LAMBO_FISH = { id: 'lambo', name: 'PINK LAMBORGHINI', lb: [3814, 3814], pull: 1.1, jump: 0, w: 0, h: .3, c1: '#ff5ea8', c2: '#ffc2d6', q: ['It’s beautiful. There’s an octopus driving it.'] };
const SURF = 56, TIP = { x: 104, y: 30 };

const Fishing = {
  f: null,
  start(tile, fromShore, forced) {
    const bottom = fromShore ? (tile === T.DEEP ? 142 : 126) : tile === T.DEEP ? 168 : tile === T.WATER ? 148 : 116;
    const merleZone = World.region(Game.dan.x, Game.dan.y) === 'merle';
    const pool = MIAMI() ? OCEAN.map(sp => [sp, sp.w]) : SPECIES.map(sp => [sp, sp.deep && bottom < 140 ? 0 : sp.legend ? (merleZone && bottom >= 140 ? 3 : 0) : sp.w]);
    const roll = () => { let r = Math.random() * pool.reduce((s, p) => s + p[1], 0); for (const [sp, w] of pool) if ((r -= w) < 0) return sp; return SPECIES[0]; };
    const fish = [];
    for (let i = 0, n = 4 + Math.floor(Math.random() * 3); i < n; i++) {
      const sp = roll(), lbs = +((sp.lb[0] + Math.random() ** (hasUp('rod') ? 1.1 : 1.6) * (sp.lb[1] - sp.lb[0]))).toFixed(1);   // the Ugly Stick pulls up bigger ones
      const y = sp.junk ? bottom - 6 : SURF + 12 + Math.random() * (bottom - SURF - 22);
      fish.push({ sp, lbs, x: 130 + Math.random() * 180, y, hy: y, dir: Math.random() < .5 ? 1 : -1, spd: sp.junk ? 0 : rnd(10, 24), want: 0 });
    }
    if (forced === 'lambo') fish.splice(0, fish.length, { sp: LAMBO_FISH, lbs: 3814, x: 250, y: bottom - 10, hy: bottom - 10, dir: -1, spd: 1, want: 0 });
    const bait = Game.inv.bait > 0; if (bait) Game.inv.bait--; else toast('No bait. Usin’ a Cheeto.');
    this.f = { phase: 'cast', t: 0, lure: { x: TIP.x, y: TIP.y, vx: rnd(120, 180), vy: -70 }, bottom, fish, fromShore, bait, hooked: null, tension: 0, slack: 0, stam: 1, surge: 0, jump: null, gator: null, gatorT: 0, merleZone, msgT: 0, endT: 0 };
    Game.mode = 'fish'; ui.fishHud.hidden = true; this.msg(''); Sound.play('splash');
  },
  msg(s, secs = 1.4) { ui.fishMsg.textContent = s; if (this.f) this.f.msgT = secs; },
  exit() { Game.mode = 'play'; ui.fishHud.hidden = true; ui.card.hidden = true; this.msg(''); this.f = null; if (this.big) { this.big = false; react('cheer'); } },
  lose(text) { const f = this.f; f.phase = 'done'; f.endT = 1.8; f.hooked = null; ui.fishHud.hidden = true; this.msg(text, 1.8); Sound.play('fail'); },
  update(dt) {
    const f = this.f; if (!f) { Game.mode = 'play'; ui.fishHud.hidden = true; ui.card.hidden = true; return; }
    f.t += dt;
    if (f.msgT > 0 && (f.msgT -= dt) <= 0 && f.phase !== 'card') this.msg('');
    const reel = Input.held('a');
    for (const fi of f.fish) if (fi !== f.hooked && fi.spd) {
      if (fi.want > 1 && f.phase === 'wait') {
        const dx = f.lure.x - fi.x, dy = f.lure.y - fi.y, d = Math.hypot(dx, dy) || 1;
        fi.dir = dx > 0 ? 1 : -1; fi.x += dx / d * fi.spd * 1.8 * dt; fi.y += dy / d * fi.spd * 1.8 * dt;
        if (d < 5) this.hook(fi);
      } else { fi.x += fi.dir * fi.spd * dt; fi.y += (fi.hy + Math.sin(f.t + fi.hy) * 4 - fi.y) * dt; if (fi.x < 124 || fi.x > 314) fi.dir *= -1; }
    }
    if (f.phase === 'cast') { const L = f.lure; L.x += L.vx * dt; L.y += L.vy * dt; L.vy += 140 * dt; if (L.y >= SURF) { L.y = SURF; f.phase = 'wait'; Sound.play('splash'); } return; }
    if (f.phase === 'wait') {
      const L = f.lure;
      if (reel) { L.x -= 34 * dt; L.y = Math.max(SURF + 3, L.y - 8 * dt); if (Math.random() < dt * 12) Sound.play('reel'); } else L.y = Math.min(f.bottom - 5, L.y + 22 * dt);
      if (L.x < TIP.x + 10) { this.lose('Nothin’.'); f.endT = 1; return; }
      const rate = (f.bait ? 1 : .55) * (reel ? 1.6 : 1) * (Game.fx.high > 0 ? 1.6 : 1);
      if (!f.fish.some(fi => fi.want > 1)) for (const fi of f.fish) {
        const d = Math.hypot(fi.x - L.x, fi.y - L.y);
        if (d < (fi.sp.junk ? 10 : 55)) fi.want += dt * rate * (fi.sp.junk ? 3 : rnd(.45, .75));
        if (fi.want > 1) { if (fi.sp.junk) this.hook(fi); break; }
      }
      if (Input.tapped('b')) this.lose('Reeled in. Nothin’ doin’.');
      return;
    }
    if (f.phase === 'fight') return this.fight(dt, reel);
    if (f.phase === 'done') { if ((f.endT -= dt) <= 0) this.exit(); return; }
    if (f.phase === 'card' && Input.tapped('a')) this.exit();
  },
  hook(fi) {
    const f = this.f; f.hooked = fi; f.phase = 'fight'; f.tension = .25; f.stam = 1; f.slack = 0; f.gatorT = 0;
    fi.power = fi.sp.pull * (.6 + fi.lbs / fi.sp.lb[1] * .6);
    ui.fishHud.hidden = false; Sound.play('snap');
    this.msg(fi.sp.junk ? 'Snagged somethin’...' : fi.sp.legend ? 'THIS ONE’S HEAVY AS HELL' : 'FISH ON!', 1.2);
  },
  fight(dt, reel) {
    const f = this.f, fi = f.hooked;
    const dx = TIP.x - fi.x, dy = SURF + 4 - fi.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    if (f.surge > 0) f.surge -= dt; else if (!fi.sp.junk && Math.random() < dt * .14 * fi.power) { f.surge = .7; this.msg('RUN!', .8); }
    const run = fi.power * 30 * (.25 + f.stam * .75) * (f.surge > 0 ? 1.6 : 1);
    if (f.jump) {
      f.jump.t += dt; const k = f.jump.t / .95;
      fi.x = f.jump.x0 + k * 18; fi.y = SURF - Math.sin(Math.PI * Math.min(1, k)) * 38;
      if (k >= 1) { fi.y = SURF + 8; f.jump = null; Sound.play('splash'); }
      if (reel) f.tension += dt * .9;
    } else {
      fi.x -= ux * run * dt; fi.y += (-uy * run * .4 + Math.sin(f.t * 3) * 6) * dt;
      if (reel) { fi.x += ux * 44 * dt; fi.y += uy * 44 * dt; if (Math.random() < dt * 14) Sound.play('reel'); }
      fi.x = clamp(fi.x, TIP.x, 314); fi.y = clamp(fi.y, SURF + 4, f.bottom - 5); fi.dir = dx > 0 ? -1 : 1;
      if (fi.sp.jump && fi.y < SURF + 50 && Math.random() < dt * fi.sp.jump * .4) { f.jump = { t: 0, x0: fi.x }; this.msg('JUMP! LET OFF!', .9); }
    }
    f.tension += reel ? dt * (.13 + fi.power * f.stam * .3 + (f.surge > 0 ? .35 : 0)) * (hasUp('rod') ? .6 : 1) : -dt * .75;   // gentler: fishing should feel good, not like a chore
    f.tension = Math.max(0, f.tension);
    if (f.tension > .1) f.stam = Math.max(0, f.stam - dt * (.09 + f.tension * .2));
    f.slack = f.tension < .08 ? f.slack + dt : 0;
    ui.tensionFill.style.height = Math.min(100, f.tension * 100) + '%';
    if (f.tension >= 1) { Sound.play('snap'); Game.chill = Math.max(0, Game.chill - 8); return this.lose(pick(['SNAP! GOD DAMMIT!', 'SNAP! Son of a—', 'SNAP.'])); }
    if (f.slack > 4 && !fi.sp.junk) return this.lose('Spat the hook. Bastard.');
    f.gatorT += dt;
    if (!f.gator && !fi.sp.junk && f.gatorT > 2.5 && Math.random() < dt * (f.merleZone ? .12 : .05)) { f.gator = { x: 330, y: Math.min(f.bottom - 12, fi.y + 20), chuck: f.merleZone, flee: false }; this.msg(f.merleZone ? 'CHUCK!! (Q = GIT)' : 'GATOR! (Q = GIT)', 1.6); }
    if (f.gator) {
      const G = f.gator;
      if (Input.tapped('b') && !G.flee) { G.flee = Math.random() < .75; Game.day_.gits++; Sound.play('git'); this.msg(G.flee ? 'GIT!!' : 'He ain’t listenin’!', .9); if (G.flee && G.chuck) done('chuck'); }
      const gx = G.flee ? 360 : fi.x, gy = G.flee ? f.bottom : fi.y, gd = Math.hypot(gx - G.x, gy - G.y) || 1;
      G.x += (gx - G.x) / gd * (G.flee ? 70 : 34) * dt; G.y += (gy - G.y) / gd * (G.flee ? 70 : 34) * dt;
      if (G.flee && G.x > 345) f.gator = null;
      else if (!G.flee && gd < 10) { Game.chill = Math.max(0, Game.chill - 12); f.fish = f.fish.filter(x => x !== fi); Sound.play('chomp'); return this.lose(`${G.chuck ? 'CHUCK' : 'A gator'} ATE YOUR ${fi.sp.name.toUpperCase()}.`); }
    }
    if (d < 30 && (f.stam < .55 || fi.sp.junk)) this.land(fi);
  },
  land(fi) {
    const f = this.f; f.phase = 'card'; ui.fishHud.hidden = true; this.msg('');
    const c = { id: fi.sp.id, name: fi.sp.name, lbs: fi.lbs, junk: !!fi.sp.junk, legend: !!fi.sp.legend };
    Game.catchBag.push(c); Game.day_.caught.push(c); this.big = !c.junk && (c.lbs >= 5 || c.legend); Game.inv.fish = Game.catchBag.filter(x => !x.junk).length;
    Game.chill = Math.min(100, Game.chill + (c.junk ? 3 : 10));
    ui.cardK.textContent = c.junk ? 'YOU CAUGHT... UH' : c.legend ? 'LEGENDARY CATCH' : 'CAUGHT';
    ui.cardN.textContent = c.name; ui.cardW.textContent = `${c.lbs} lb`; ui.cardQ.textContent = '“' + pick(fi.sp.q) + '”';
    ui.card.hidden = false; Sound.play('catch'); Story.event('caught');
    if (c.id === 'lambo') { done('fishcar'); headline('FLORIDA MAN FISHES PINK LAMBORGHINI OUT OF THE ATLANTIC; OCTOPUS FOUND "DRIVING"', 6); }
    if (c.id === 'bale') headline('FLORIDA MAN FISHES "SQUARE GROUPER" OUT OF OCEAN, TRIES TO RETURN IT TO OWNER', 4);
    if (c.id === 'tarpon') headline('FLORIDA MAN LANDS 90-POUND TARPON OFF SOUTH BEACH PIER, KISSES IT, GETS SLAPPED BY IT', 4);
  },
  draw() {
    const f = this.f; if (!f) return;
    const t = Game.t, sky = Game.hour > 18 ? ['#ff8a5c', '#ffb36b'] : Game.hour < 8 ? ['#ffb3a0', '#ffd9a0'] : ['#8fd3ff', '#c9ecff'];
    for (let y = 0; y < SURF; y++) R(0, y, VW, 1, y < SURF / 2 ? sky[0] : sky[1]);
    g.fillStyle = PAL.yellow; g.beginPath(); g.arc(262, 20 + Math.max(0, Game.hour - 15) * 4, 12, 0, 7); g.fill();
    for (let x = 0; x < VW; x += 7) { const hh = 6 + hash2(x, 3) * 13; R(x, SURF - hh, 8, hh, PAL.grassDD); if (hash2(x, 9) > .75) R(x + 2, SURF - hh - 7, 3, 7, PAL.grassDD); }
    for (let y = SURF; y < f.bottom; y++) { const k = (y - SURF) / (f.bottom - SURF); g.fillStyle = `rgb(${47 - k * 30 | 0},${143 - k * 80 | 0},${181 - k * 70 | 0})`; g.fillRect(0, y, VW, 1); }
    for (let i = 0; i < 6; i++) { g.globalAlpha = .08; R(40 + i * 50 + Math.sin(t * .5 + i) * 10, SURF, 14, f.bottom - SURF, PAL.white); } g.globalAlpha = 1;
    for (let x = 0; x < VW; x += 12) R(x + Math.sin(t * 2 + x) * 3, SURF, 7, 1, PAL.foam);
    R(0, f.bottom, VW, VH - f.bottom, PAL.mudD); R(0, f.bottom, VW, 2, PAL.mud);
    for (let x = 4; x < VW; x += 13) { const hh = 6 + hash2(x, 7) * 14; for (let i = 0; i < hh; i += 2) R(x + Math.sin(t * 1.3 + i * .3 + x) * i * .12, f.bottom - i, 1, 2, PAL.grassD); }
    OR(236, f.bottom - 5, 12, 5, PAL.black); R(239, f.bottom - 4, 6, 3, PAL.mudD);
    if (f.fromShore) {
      OR(0, SURF - 14, 108, 4, PAL.wood); for (let x = 10; x < 108; x += 30) R(x, SURF - 10, 4, f.bottom - SURF + 10, PAL.woodD);
      g.drawImage(SPR.dan.right[0], 72, SURF - 35);
    } else {
      const bob = Math.sin(t * 2);
      g.drawImage(SPR.dan.right[0], 0, 0, 16, 14, 72, SURF - 26 + bob, 16, 14);
      OR(40, SURF - 12 + bob, 66, 7, PAL.greyD); R(44, SURF - 5 + bob, 58, 5, PAL.grey); OR(34, SURF - 16 + bob, 6, 10, PAL.ink);
    }
    this.line(84, SURF - 20, TIP.x, TIP.y, 0, PAL.woodD);
    const end = f.hooked || f.lure, sag = f.phase === 'fight' ? (1 - Math.min(1, f.tension * 1.4)) * 18 : 10;
    if (f.phase !== 'done' && f.phase !== 'card') this.line(TIP.x, TIP.y, end.x, end.y, sag, PAL.white);
    if (!f.hooked && f.phase !== 'done') OR(f.lure.x - 1, f.lure.y - 1, 3, 3, PAL.red);
    for (const fi of f.fish) if (f.phase !== 'card' || fi !== f.hooked) this.fishSprite(fi, t);
    if (f.gator) this.gatorSide(f.gator, t);
    const A_ = Input.padActive ? 'Ⓐ' : 'E', B_ = Input.padActive ? 'Ⓑ' : isTouch ? 'GIT' : 'Q';
    const hint = f.phase === 'wait' ? `HOLD ${A_} TO REEL/TWITCH · ${B_} TO QUIT` : f.phase === 'fight' ? `HOLD ${A_} TO REEL · LET OFF BEFORE IT SNAPS` : '';
    if (hint && !f.msgT) label(hint, VW / 2 + 20, VH - 5, PAL.white, 7);
  },
  line(x0, y0, x1, y1, sag, c) { const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) { const k = i / n; R(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k + Math.sin(Math.PI * k) * sag, 1, 1, c); } },
  fishSprite(fi, t) {
    const sp = fi.sp, x = Math.round(fi.x), y = Math.round(fi.y), dir = fi.dir;
    if (sp.id === 'boot') { OR(x - 4, y - 6, 5, 8, PAL.brown); OR(x - 4, y, 10, 3, PAL.brown); return; }
    if (sp.id === 'cart') { OR(x - 10, y - 8, 20, 10, PAL.greyD); for (let i = 1; i < 20; i += 3) R(x - 10 + i, y - 7, 1, 8, PAL.waterD); OR(x - 9, y + 3, 2, 2, PAL.ink); OR(x + 7, y + 3, 2, 2, PAL.ink); OR(x - 13, y - 9, 4, 1, PAL.red); return; }
    if (sp.id === 'lambo') { const lx = Math.round(fi.x), ly = Math.round(fi.y); OR(lx - 22, ly - 7, 44, 12, '#ff5ea8'); R(lx - 22, ly - 7, 44, 3, '#ffc2d6'); OR(lx - 4, ly - 12, 16, 6, '#9fe8f0'); OR(lx - 16, ly + 4, 7, 5, PAL.black); OR(lx + 10, ly + 4, 7, 5, PAL.black); R(lx + 2, ly - 11, 4, 3, '#b86bd6'); R(lx + 1, ly - 8, 1, 3, '#b86bd6'); R(lx + 6, ly - 8, 1, 3, '#b86bd6'); return; }
    if (sp.id === 'bale') { const bx = Math.round(fi.x), by = Math.round(fi.y); OR(bx - 9, by - 7, 18, 14, PAL.tan); R(bx - 9, by - 2, 18, 2, PAL.tanD); R(bx - 2, by - 7, 2, 14, PAL.tanD); return; }
    if (sp.id === 'sneaker') { const sx = Math.round(fi.x), sy = Math.round(fi.y); OR(sx - 6, sy - 3, 12, 6, PAL.white); R(sx - 6, sy + 1, 12, 2, '#ff4fd8'); return; }
    if (sp.id === 'phone') { OR(x - 2, y - 3, 4, 7, PAL.black); R(x - 1, y - 2, 2, 4, PAL.teal); return; }
    const len = Math.round(clamp(8 + fi.lbs * 2.3, 9, 46)), h = Math.max(3, len * sp.h), wig = Math.sin(t * 10 + fi.hy) * 1.2;
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < len; i++) {
      const u = i / len, hh = Math.max(1, h * Math.sqrt(Math.max(0, Math.sin(Math.PI * (.06 + .9 * u))))), xx = dir > 0 ? x - len / 2 + i : x + len / 2 - i, off = u < .3 ? wig * (.3 - u) * 3 : 0;
      if (pass === 0) R(xx, y - hh / 2 + off - 1, 1, hh + 2, PAL.ink); else { R(xx, y - hh / 2 + off, 1, hh / 2, sp.c1); R(xx, y + off, 1, hh / 2, sp.c2); }
    }
    const back = dir > 0 ? x - len / 2 - 3 : x + len / 2, front = dir > 0 ? x + len / 2 : x - len / 2;
    OR(back, y - h * .55 + wig, 3, h * 1.1, sp.c1); R(front - dir * 4, y - h * .2, 1, 1, PAL.black);
    if (sp.id === 'gar') OR(dir > 0 ? front : front - 7, y - 1, 7, 2, sp.c1);
    if (sp.id === 'cat') { R(front - dir * 2, y + 1, dir * 5, 1, PAL.ink); R(front - dir * 2, y + 2, dir * 4, 1, PAL.ink); }
    if (sp.legend) label('RONNIE', x, y - h / 2 - 3, PAL.yellow, 5);
  },
  gatorSide(G, t) {
    const x = Math.round(G.x), y = Math.round(G.y), sw = Math.sin(t * 8) * 2, dir = G.flee ? 1 : -1, P = (u, v, w, h, c) => OR(dir > 0 ? x + u : x - u - w, y + v, w, h, c);
    P(-26, -2 + sw * .5, 12, 4, PAL.gatorD); P(-16, -5, 22, 9, PAL.gator); P(6, -4, 12, 6, PAL.gator); P(18, -2, 8, 4, PAL.gator);
    P(8, -6, 2, 2, PAL.yellow); P(-10, 4, 3, 4, PAL.gatorD); P(2, 4, 3, 4, PAL.gatorD);
    if (G.chuck) P(-4, -9, 6, 2, PAL.hat);
  },
};

// ---------- wrestling: gators, pythons, and one very specific courtroom ----------
const ARROWS = { up: '▲', down: '▼', left: '◀', right: '▶' };
const Wrestle = {
  w: null,
  start(opts) {
    // opts: { foe: 'gator'|'python'|'chuck', onWin, onLose, arena: 'swamp'|'court' }
    const hard = opts.foe === 'chuck' ? 1.5 : opts.foe === 'python' ? .8 : 1;
    this.w = { ...opts, hard, grip: 35, t: 0, prompt: null, promptT: 1.4, thrash: 0, msgT: 0, over: false, overT: 0, won: false };
    Game.prevMode = Game.mode; Game.mode = 'wrestle'; ui.wrestle.hidden = false; padFor(true); ui.wrestlePrompt.textContent = ''; this.msg(opts.foe === 'python' ? 'GRAB THAT NOODLE!' : 'HOLD THE JAWS SHUT!');
    Sound.play('chomp');
  },
  msg(s) { ui.wrestleMsg.textContent = s; },
  update(dt) {
    const w = this.w;
    if (!w) { Game.mode = 'play'; ui.wrestle.hidden = true; ui.wrestlePrompt.textContent = ''; return; }   // never strand the player in an empty fight
    w.t += dt;
    if (w.over) { if ((w.overT -= dt) <= 0) this.finish(); return; }
    if (Input.tapped('a')) { w.grip += 5.5 / w.hard * (Game.fx.powder > 0 ? 1.6 : 1) * (Game.fx.buzz > 60 ? .8 : 1); Sound.play('reel'); Game.shake = 1.5; }
    w.grip -= dt * 7 * w.hard;
    if (!w.prompt) { w.promptT -= dt; if (w.promptT <= 0) { w.prompt = pick(Object.keys(ARROWS)); w.window = .95 / Math.sqrt(w.hard); this.msg(`THRASH! PRESS ${ARROWS[w.prompt]}`); Sound.play('git'); } }
    else {
      w.window -= dt;
      const hitDir = ['up', 'down', 'left', 'right'].find(k => Input.tapped(k)) || this.swipe();
      if (hitDir === w.prompt) { w.grip += 12; w.prompt = null; w.promptT = rnd(.9, 1.8) / w.hard; this.msg(pick(['COUNTERED!', 'NOT TODAY!', 'HELL YEAH!'])); Sound.play('cash'); }
      else if (hitDir || w.window <= 0) { w.grip -= 22 * w.hard; w.prompt = null; w.promptT = rnd(.9, 1.8) / w.hard; this.msg(pick(['HE’S ROLLIN’!', 'DEATH ROLL!', 'OH GOD OH GOD'])); Game.shake = 8; Sound.play('hurt'); }
    }
    w.grip = clamp(w.grip, 0, 100);
    ui.gripFill.style.width = w.grip + '%';
    ui.wrestlePrompt.textContent = w.prompt ? ARROWS[w.prompt] : '';
    if (w.grip >= 100) { w.over = true; w.won = true; w.overT = 1.3; this.msg(w.foe === 'python' ? 'BAGGED!' : 'JAWS SHUT! YOU WIN!'); Sound.play('catch'); Game.flash = .4; }
    else if (w.grip <= 0) { w.over = true; w.overT = 1.3; this.msg(w.foe === 'python' ? 'IT SLIPPED AWAY' : 'CHOMP.'); Sound.play('chomp'); Game.shake = 10; }
  },
  swipe() { const a = Input.axis(); if (!Game._swipeLock && Math.hypot(a.x, a.y) > .8) { Game._swipeLock = true; return dirOf(a.x, a.y); } if (Math.hypot(a.x, a.y) < .3) Game._swipeLock = false; return null; },
  finish() {
    const w = this.w; this.w = null; ui.wrestle.hidden = true; ui.wrestlePrompt.textContent = ''; padFor(false);   // the ▶ lives outside the panel; clear it or it blinks forever
    Game.mode = Game.prevMode === 'wrestle' ? 'play' : (Game.prevMode || 'play');
    if (w.won) w.onWin && w.onWin(); else w.onLose && w.onLose();
  },
  draw() {
    const w = this.w; if (!w) return;
    const t = Game.t, court = w.arena === 'court';
    if (!court) { for (let y = 0; y < VH; y++) R(0, y, VW, 1, y < 60 ? '#5aa83a' : y < 64 ? PAL.foam : PAL.waterD); for (let x = 0; x < VW; x += 9) R(x, 60 + Math.sin(t * 3 + x) * 1, 5, 1, PAL.waterL); }
    else Court.drawRoom(t, true);
    const shake = w.prompt ? Math.sin(t * 60) * 3 : Math.sin(t * 8) * 1;
    const cx = VW / 2 + shake, cy = 118;
    if (w.foe === 'python') {
      for (let i = 0; i < 26; i++) { const a = i * .5 + t * 3, r = 24 - i * .4; OR(cx + Math.cos(a) * r, cy - 20 + Math.sin(a) * r * .6, 6, 6, i % 3 ? PAL.tan : PAL.brown); }
    } else {
      const big = w.foe === 'chuck' ? 1.3 : 1, P = (u, v, ww, hh, c) => OR(cx + u * big, cy + v * big, ww * big, hh * big, c);
      const roll = w.prompt ? Math.sin(t * 20) * 4 : 0;
      P(-70, -4 + roll, 30, 10, PAL.gator); P(-44, -12, 60, 22, PAL.gator); P(-40, -12, 52, 3, PAL.gatorL);
      for (let i = -38; i < 14; i += 7) P(i, -15, 4, 3, PAL.gatorD);
      P(16, -10, 36, 14, PAL.gator); P(20, 4, 32, 4, PAL.belly); P(46, -9, 2, 2, PAL.white); P(24, -14, 5, 5, PAL.yellow); P(26, -13, 2, 3, PAL.black);
      P(-30, 10, 8, 8, PAL.gatorD); P(0, 10, 8, 8, PAL.gatorD);
      if (w.foe === 'chuck') { P(-8, -20, 16, 5, PAL.hat); label('CHUCK', cx, cy - 40, PAL.hat, 8); }
    }
    const dan = SPR.dan.down[Math.floor(t * 10) % 2];
    g.drawImage(dan, Math.round(cx - 4), Math.round(cy - 34 + Math.sin(t * 12) * 2));
    R(cx + 18, cy - 14, 6, 3, PAL.skin); R(cx + 30, cy - 14, 6, 3, PAL.skin);   // hands on the snout
  },
};

// ---------- the ice machine raccoon ----------
const Minigame = {
  raccoon() {
    say([['', 'Dan reaches into the ice machine...'], ['', '...something reaches back.'], ['RACCOON', 'SKREEEEEEEEE'], ['', 'THE RACCOON IS ON DAN’S FACE.']], () => {
      Game.mode = 'raccoon'; this.r = { t: 0, mash: 0 }; ui.raccoon.hidden = false; Sound.play('hurt');
    });
  },
  updateRaccoon(dt) {
    const r = this.r; r.t += dt;
    if (Input.tapped('a') || ['up', 'down', 'left', 'right'].some(k => Input.tapped(k))) { r.mash++; Game.shake = 3; Sound.play('munch'); }
    ui.raccoonFill.style.width = Math.min(100, r.mash / 18 * 100) + '%';
    if (Math.random() < dt * 3) Sound.play('talk');
    if (r.mash >= 18) {
      Game.mode = 'play'; ui.raccoon.hidden = true; Game.flags.raccoonOut = true; done('ice');
      const pet = makeCritter('raccoon', Game.dan.x + 12, Game.dan.y, { pet: true }); Game.animals.push(pet); Game.flags.trashBaby = true;
      headline('FLORIDA MAN REMOVES RACCOON FROM GAS STATION ICE MACHINE USING HIS FACE; RACCOON NOW "FAMILY"', 5);
      say([['', 'Dan peels the raccoon off his face. They lock eyes.'], ['', 'Something passes between them.'], ['DAN', 'Your name is Trash Baby now.'], ['TRASH BABY', '*chitters*'], ['', 'Trash Baby is now following Dan. Forever. Go tell Darlene.']]);
    }
  },
  drawRaccoon() {
    const r = this.r, t = Game.t, j = Math.sin(t * 30) * 4;
    R(0, 0, VW, VH, PAL.concrete);
    g.save(); g.translate(VW / 2 + j, VH / 2 + 10); g.scale(9, 9); g.drawImage(SPR.raccoon, -6, -8); g.restore();
    label('SKREEEEEE', VW / 2 + Math.sin(t * 17) * 20, 30 + Math.cos(t * 13) * 6, PAL.red, 12);
  },
};
