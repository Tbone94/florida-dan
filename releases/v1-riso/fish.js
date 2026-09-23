// Florida Dan — the fight (Blue Marlin-style side view) and the Swamp Gazette.
'use strict';
const SPECIES = [
  { id: 'bluegill', name: 'Bluegill', lb: [.3, 1.1], pull: .35, jump: 0, w: 30, h: .55, c1: I(170, 70, 60), c2: I(25, 60, 210), q: ['Lil fella. Still counts.', "That's a snack.", 'Baby’s first fish.'] },
  { id: 'bass', name: 'Largemouth Bass', lb: [1.2, 7.5], pull: .7, jump: .3, w: 26, h: .38, c1: I(165, 20, 190), c2: I(25, 0, 90), q: ['Now THAT’S a bass.', 'Hawg alert.', 'Look at the mouth on this guy.'] },
  { id: 'gar', name: 'Florida Gar', lb: [2, 11], pull: .8, jump: .5, w: 14, h: .17, c1: I(120, 55, 165), c2: I(35, 25, 80), q: ['Dinosaur fish. Merle’s gonna be mad.', 'All teeth, no manners.'] },
  { id: 'cat', name: 'Channel Catfish', lb: [2, 16], pull: .9, jump: 0, w: 18, h: .3, deep: true, c1: I(150, 95, 125), c2: I(45, 35, 55), q: ['Whiskers! Straight to the fryer.', 'Slimy lil sumbitch.'] },
  { id: 'bowfin', name: 'Mudfish', lb: [2, 9], pull: .85, jump: .15, w: 10, h: .3, c1: I(95, 135, 200), c2: I(55, 95, 170), q: ['Mudfish. Nobody wants you, bud. I love you though.'] },
  { id: 'boot', name: "Somebody's Boot", lb: [1, 2], pull: .15, jump: 0, w: 5, junk: true, q: ['Size 11. Not mine. ...Probably.'] },
  { id: 'cart', name: 'Publix Shopping Cart', lb: [25, 31], pull: .5, jump: 0, w: 3, junk: true, q: ['How does this keep happenin’.'] },
  { id: 'ronnie', name: 'BIG RONNIE', lb: [13, 15.5], pull: 1.2, jump: .35, w: 0, legend: true, h: .42, c1: I(200, 40, 210), c2: I(40, 60, 120), q: ['BIG RONNIE. THE LEGEND. I’m gonna cry.'] },
];
const SURF = 52, TIP = { x: 104, y: 27 };

const Fishing = {
  f: null,
  start(tile, fromShore) {
    const bottom = fromShore ? (tile === T.DEEP ? 140 : 124) : tile === T.DEEP ? 168 : tile === T.WATER ? 146 : 112;
    const M = World.spots.merle, merleZone = Math.hypot(S.dan.x - M.x, S.dan.y - M.y) < 220;
    const pool = SPECIES.map(sp => {
      let w = sp.w;
      if (sp.deep && bottom < 140) w = 0;
      if (sp.legend) w = merleZone && bottom >= 140 ? 3 : 0;
      return [sp, w];
    });
    const roll = () => { let r = Math.random() * pool.reduce((s, p) => s + p[1], 0); for (const [sp, w] of pool) if ((r -= w) < 0) return sp; return SPECIES[0]; };
    const fish = [];
    for (let i = 0, n = 4 + Math.floor(Math.random() * 3); i < n; i++) {
      const sp = roll(), lbs = +(sp.lb[0] + Math.random() ** 1.6 * (sp.lb[1] - sp.lb[0])).toFixed(1);
      const y = sp.junk ? bottom - 6 : SURF + 12 + Math.random() * (bottom - SURF - 22);
      fish.push({ sp, lbs, x: 130 + Math.random() * 180, y, hy: y, dir: Math.random() < .5 ? 1 : -1, spd: sp.junk ? 0 : 10 + Math.random() * 14, want: 0 });
    }
    const bait = S.inv.bait > 0;
    if (bait) S.inv.bait--; else toast('No bait. Usin’ a Cheeto.');
    this.f = { phase: 'cast', t: 0, lure: { x: TIP.x, y: TIP.y, vx: 120 + Math.random() * 60, vy: -70 }, bottom, fish, fromShore, bait, hooked: null,
      tension: 0, slack: 0, stam: 1, surge: 0, jump: null, gator: null, gatorT: 0, merleZone, msgT: 0, endT: 0 };
    S.mode = 'fish'; ui.fishHud.hidden = true; this.msg('');
  },
  msg(s, secs = 1.4) { txt(ui.fishMsg, s); if (this.f) this.f.msgT = secs; },
  exit() { S.mode = 'walk'; ui.fishHud.hidden = true; ui.card.hidden = true; this.msg(''); this.f = null; },
  lose(text) { const f = this.f; f.phase = 'done'; f.endT = 1.8; f.hooked = null; ui.fishHud.hidden = true; this.msg(text, 1.8); },

  update(dt) {
    const f = this.f; if (!f) return;
    f.t += dt;
    if (f.msgT > 0 && (f.msgT -= dt) <= 0 && f.phase !== 'card') this.msg('');
    const reel = held('a');
    // everybody swims
    for (const fi of f.fish) if (fi !== f.hooked && fi.spd) {
      if (fi.want > 1 && f.phase === 'wait') {
        const dx = f.lure.x - fi.x, dy = f.lure.y - fi.y, d = Math.hypot(dx, dy) || 1;
        fi.dir = dx > 0 ? 1 : -1; fi.x += dx / d * fi.spd * 1.8 * dt; fi.y += dy / d * fi.spd * 1.8 * dt;
        if (d < 5) this.hook(fi);
      } else {
        fi.x += fi.dir * fi.spd * dt; fi.y += (fi.hy + Math.sin(f.t + fi.hy) * 4 - fi.y) * dt;
        if (fi.x < 124 || fi.x > 314) fi.dir *= -1;
      }
    }
    if (f.phase === 'cast') {
      const L = f.lure; L.x += L.vx * dt; L.y += L.vy * dt; L.vy += 140 * dt;
      if (L.y >= SURF) { L.y = SURF; f.phase = 'wait'; splash(L.x + S.cam.x, SURF + S.cam.y, 6); }
      return;
    }
    if (f.phase === 'wait') {
      const L = f.lure;
      if (reel) { const dx = TIP.x + 4 - L.x; L.x += Math.sign(dx) * 34 * dt; L.y = Math.max(SURF + 3, L.y - 8 * dt); }
      else L.y = Math.min(f.bottom - 5, L.y + 22 * dt);
      if (L.x < TIP.x + 10) { this.lose('Nothin’.'); f.endT = 1; return; }
      const rate = (f.bait ? 1 : .5) * (reel ? 1.6 : 1) * (S.high > 0 ? 1.4 : 1);
      if (!f.fish.some(fi => fi.want > 1)) for (const fi of f.fish) {
        const d = Math.hypot(fi.x - L.x, fi.y - L.y);
        if (d < (fi.sp.junk ? 10 : 55)) fi.want += dt * rate * (fi.sp.junk ? 3 : .45 + Math.random() * .3);
        if (fi.want > 1) { if (fi.sp.junk) this.hook(fi); break; }
      }
      if (tapped('b')) this.lose('Reeled in. Nothin’ doin’.');
      return;
    }
    if (f.phase === 'fight') return this.fight(dt, reel);
    if (f.phase === 'done') { if ((f.endT -= dt) <= 0) this.exit(); return; }
    if (f.phase === 'card' && tapped('a')) this.exit();
  },

  hook(fi) {
    const f = this.f; f.hooked = fi; f.phase = 'fight'; f.tension = .25; f.stam = 1; f.slack = 0; f.gatorT = 0;
    fi.power = fi.sp.pull * (.6 + fi.lbs / fi.sp.lb[1] * .6);
    ui.fishHud.hidden = false;
    this.msg(fi.sp.junk ? 'Snagged somethin’...' : fi.sp.legend ? 'THIS ONE’S HEAVY' : 'FISH ON!', 1.2);
  },

  fight(dt, reel) {
    const f = this.f, fi = f.hooked;
    const dx = TIP.x - fi.x, dy = SURF + 4 - fi.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    if (f.surge > 0) f.surge -= dt; else if (!fi.sp.junk && Math.random() < dt * .22 * fi.power) { f.surge = .9; this.msg('RUN!', .8); }
    const run = fi.power * 36 * (.3 + f.stam * .7) * (f.surge > 0 ? 1.8 : 1);
    if (f.jump) {
      f.jump.t += dt; const k = f.jump.t / .95;
      fi.x = f.jump.x0 + k * 18; fi.y = SURF - Math.sin(Math.PI * Math.min(1, k)) * 34;
      if (k >= 1) { fi.y = SURF + 8; f.jump = null; splash(fi.x + S.cam.x, SURF + S.cam.y, 10); }
      if (reel) f.tension += dt * 1.5;
    } else {
      fi.x -= ux * run * dt; fi.y += (-uy * run * .4 + Math.sin(f.t * 3) * 6) * dt;
      if (reel) { fi.x += ux * 30 * dt; fi.y += uy * 30 * dt; }
      fi.x = Math.min(314, Math.max(TIP.x, fi.x)); fi.y = Math.min(f.bottom - 5, Math.max(SURF + 4, fi.y));
      fi.dir = dx > 0 ? -1 : 1;
      if (fi.sp.jump && fi.y < SURF + 50 && Math.random() < dt * fi.sp.jump * .4) { f.jump = { t: 0, x0: fi.x }; this.msg('JUMP! LET OFF!', .9); }
    }
    f.tension += reel ? dt * (.22 + fi.power * f.stam * .5 + (f.surge > 0 ? .55 : 0)) : -dt * .55;
    f.tension = Math.max(0, f.tension);
    if (f.tension > .15) f.stam = Math.max(0, f.stam - dt * (.05 + f.tension * .13));
    f.slack = f.tension < .08 ? f.slack + dt : 0;
    ui.tensionFill.style.height = Math.min(100, f.tension * 100) + '%';
    if (f.tension >= 1) { S.log.snapped++; S.chill = Math.max(0, S.chill - 8); return this.lose('SNAP!'); }
    if (f.slack > 2.8 && !fi.sp.junk) return this.lose('Spat the hook.');

    // a gator smells the fight
    f.gatorT += dt;
    if (!f.gator && !fi.sp.junk && f.gatorT > 2.5 && Math.random() < dt * (f.merleZone ? .12 : .05)) {
      f.gator = { x: 330, y: Math.min(f.bottom - 12, fi.y + 20), chuck: f.merleZone, flee: false };
      this.msg(f.merleZone ? 'CHUCK!! (Q = GIT)' : 'GATOR! (Q = GIT)', 1.6);
    }
    if (f.gator) {
      const G = f.gator;
      if (tapped('b') && !G.flee) { G.flee = Math.random() < .75; S.log.gits++; this.msg(G.flee ? 'GIT!' : 'He ain’t listenin’!', .9); if (G.flee && G.chuck && !S.log.chuckGit) { S.log.chuckGit = true; done('chuck'); } }
      const gx = G.flee ? 360 : fi.x, gy = G.flee ? f.bottom : fi.y, gd = Math.hypot(gx - G.x, gy - G.y) || 1;
      G.x += (gx - G.x) / gd * (G.flee ? 70 : 34) * dt; G.y += (gy - G.y) / gd * (G.flee ? 70 : 34) * dt;
      if (G.flee && G.x > 345) f.gator = null;
      else if (!G.flee && gd < 10) {
        S.log.steals.push({ name: fi.sp.name, chuck: G.chuck }); S.chill = Math.max(0, S.chill - 12);
        f.fish = f.fish.filter(x => x !== fi);
        return this.lose(`${G.chuck ? 'Chuck' : 'A gator'} ate your ${fi.sp.name.toLowerCase()}.`);
      }
    }
    if (d < 24 && (f.stam < .35 || fi.sp.junk)) this.land(fi);
  },

  land(fi) {
    const f = this.f; f.phase = 'card'; ui.fishHud.hidden = true; this.msg('');
    const caught = { id: fi.sp.id, name: fi.sp.name, lbs: fi.lbs, junk: !!fi.sp.junk };
    S.fish.push(caught); S.log.caught.push(caught); S.chill = Math.min(100, S.chill + (fi.sp.junk ? 3 : 10));
    txt(ui.cardK, fi.sp.junk ? 'YOU CAUGHT... UH' : fi.sp.legend ? 'LEGENDARY CATCH' : 'CAUGHT');
    txt(ui.cardN, fi.sp.name); txt(ui.cardW, `${fi.lbs} lb`); txt(ui.cardQ, '“' + pick(fi.sp.q) + '”');
    ui.card.hidden = false;
    renderTodo();
  },

  // ---------- side view ----------
  draw() {
    const f = this.f; if (!f) return;
    const t = S.t;
    R(0, 0, VW, SURF, C.paper);
    const sun = S.hour > 17 ? C.pink : C.yellow;
    g.fillStyle = sun; g.beginPath(); g.arc(262, 22 + Math.max(0, S.hour - 15) * 4, 13, 0, 7); g.fill();
    for (let x = 0; x < VW; x += 7) { const hgt = 6 + hash2(x, 3) * 12; R(x, SURF - hgt, 8, hgt, C.grassD); if (hash2(x, 9) > .75) R(x + 2, SURF - hgt - 6, 3, 6, C.grassD); }
    for (let y = SURF; y < f.bottom; y++) { const k = (y - SURF) / (f.bottom - SURF); R(0, y, VW, 1, I(110 + k * 140 | 0, 12 + k * 60 | 0, k * 20 | 0)); }
    for (let x = 0; x < VW; x += 12) R(x + Math.sin(t * 2 + x) * 3, SURF, 7, 1, C.foam);
    R(0, f.bottom, VW, VH - f.bottom, C.mud);
    for (let x = 4; x < VW; x += 13) { const hh = 6 + hash2(x, 7) * 14; for (let i = 0; i < hh; i += 2) R(x + Math.sin(t * 1.3 + i * .3 + x) * i * .12, f.bottom - i, 1, 2, C.grassD); }
    R(236, f.bottom - 4, 12, 5, C.dark); R(239, f.bottom - 3, 6, 3, C.mud);   // tire
    // boat or dock
    if (f.fromShore) {
      R(0, SURF - 14, 108, 4, C.wood); R(0, SURF - 10, 108, 2, C.woodL);
      for (let x = 10; x < 108; x += 30) R(x, SURF - 10, 4, f.bottom - SURF + 10, C.woodL);
      g.drawImage(SPR.right, 72, SURF - 30);
    } else {
      const bob = Math.sin(t * 2) * 1;
      g.drawImage(SPR.right, 0, 0, 12, 11, 72, SURF - 22 + bob, 12, 11);
      R(40, SURF - 12 + bob, 66, 7, C.woodL); R(44, SURF - 5 + bob, 58, 5, C.wood); R(36, SURF - 14 + bob, 6, 8, C.dark);
    }
    R(82, SURF - 18, 1, 1, C.dark);
    this.line(82, SURF - 18, TIP.x, TIP.y, 0, C.dark);   // rod
    // the line
    const end = f.hooked ? f.hooked : f.lure;
    const sag = f.phase === 'fight' ? (1 - Math.min(1, f.tension * 1.4)) * 18 : 10;
    if (f.phase !== 'done' && f.phase !== 'card') this.line(TIP.x, TIP.y, end.x, end.y, sag, C.dark);
    if (!f.hooked && f.phase !== 'done') { R(f.lure.x - 1, f.lure.y - 1, 3, 3, C.pink); }
    for (const fi of f.fish) if (f.phase !== 'card' || fi !== f.hooked) this.fishSprite(fi, t);
    if (f.gator) this.gatorSide(f.gator, t);
    drawParts(S.cam.x, S.cam.y);
    if (f.phase === 'wait' && !f.msgT) { g.font = '700 8px "Pixelify Sans", monospace'; g.textAlign = 'center'; g.fillStyle = C.blue; g.fillText(isTouch ? 'HOLD E TO REEL · GIT TO QUIT' : 'HOLD E TO REEL / TWITCH · Q TO QUIT', VW / 2 + 40, VH - 6); }
    if (f.phase === 'fight' && !f.msgT) { g.font = '700 8px "Pixelify Sans", monospace'; g.textAlign = 'center'; g.fillStyle = C.blue; g.fillText('HOLD E TO REEL · LET OFF BEFORE IT SNAPS', VW / 2, VH - 6); }
  },
  line(x0, y0, x1, y1, sag, c) {
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++) { const k = i / n; R(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k + Math.sin(Math.PI * k) * sag, 1, 1, c); }
  },
  fishSprite(fi, t) {
    const sp = fi.sp, x = Math.round(fi.x), y = Math.round(fi.y), dir = fi.dir;
    if (sp.id === 'boot') { R(x - 4, y - 6, 5, 8, C.mud); R(x - 4, y, 10, 3, C.mud); R(x - 4, y + 2, 10, 1, C.dark); return; }
    if (sp.id === 'cart') { R(x - 10, y - 8, 20, 10, C.dark); for (let i = 1; i < 20; i += 3) R(x - 10 + i, y - 7, 1, 8, C.shallow); R(x - 9, y + 3, 2, 2, C.dark); R(x + 7, y + 3, 2, 2, C.dark); R(x - 13, y - 9, 4, 1, C.pink); return; }
    const len = Math.round(Math.max(9, Math.min(46, 8 + fi.lbs * 2.3))), h = Math.max(3, len * sp.h), wig = Math.sin(t * 10 + fi.hy) * 1.2;
    for (let i = 0; i < len; i++) {
      const u = i / len, hh = Math.max(1, h * Math.sqrt(Math.max(0, Math.sin(Math.PI * (.06 + .9 * u))))), xx = dir > 0 ? x - len / 2 + i : x + len / 2 - i;
      const off = u < .3 ? wig * (.3 - u) * 3 : 0;
      R(xx, y - hh / 2 + off, 1, hh / 2, sp.c1); R(xx, y + off, 1, hh / 2, sp.c2);
    }
    const back = dir > 0 ? x - len / 2 - 3 : x + len / 2, front = dir > 0 ? x + len / 2 : x - len / 2;
    R(back, y - h * .55 + wig, 3, h * 1.1, sp.c1);
    R(front - dir * 4, y - h * .2, 1, 1, C.dark);
    if (sp.id === 'gar') R(dir > 0 ? front : front - 7, y - 1, 7, 2, sp.c1);
    if (sp.id === 'cat') { R(front - dir * 2, y + 1, dir * 5, 1, C.dark); R(front - dir * 2, y + 2, dir * 4, 1, C.dark); }
    if (sp.legend) { R(x - 2, y - h / 2 - 3, 4, 2, C.pink); }   // Ronnie has a lure scar. and a reputation
  },
  gatorSide(G, t) {
    const x = Math.round(G.x), y = Math.round(G.y), sw = Math.sin(t * 8) * 2, dir = G.flee ? 1 : -1;
    const P = (u, v, w, h, c) => R(dir > 0 ? x + u : x - u - w, y + v, w, h, c);
    P(-26, -2 + sw * .5, 12, 4, C.gatorD); P(-16, -5, 22, 9, C.gator); P(6, -4, 12, 6, C.gator); P(18, -2, 8, 4, C.gator);
    for (let i = -14; i < 6; i += 4) P(i, -7, 2, 2, C.gatorD);
    P(8, -6, 2, 2, C.yellow); P(-10, 4, 3, 4, C.gatorD); P(2, 4, 3, 4, C.gatorD);
    if (G.chuck) P(-4, -9, 5, 2, C.pink);
  },
};

// ---------- the Swamp Gazette ----------
const Gazette = {
  show(reason) {
    const L = S.log, real = L.caught.filter(f => !f.junk), big = real.slice().sort((a, b) => b.lbs - a.lbs)[0];
    const chuckSteal = L.steals.find(s => s.chuck);
    let head;
    if (reason === 'passout') head = 'Florida Man Found Asleep in Jon Boat, Clutching Bait Tub';
    else if (L.caught.some(f => f.id === 'ronnie')) head = 'Florida Man Lands Legendary “Big Ronnie,” Weeps Openly at Dock';
    else if (chuckSteal) head = `Gator Named Chuck Steals Florida Man’s ${chuckSteal.name}; “This Is Personal,” Says Man`;
    else if (L.bites >= 3) head = `Florida Man Bitten by Gators ${L.bites} Times, Calls It “A Pretty Good Day”`;
    else if (L.caught.some(f => f.id === 'cart')) head = 'Florida Man Returns Publix Cart via Swamp';
    else if (L.meltdowns) head = 'Florida Man Screams at Pelican for 40 Minutes; Pelican Unbothered';
    else if (L.merle) head = `Local Fish Fry Rated “Pretty Good” After Florida Man Delivers ${real.length} Fish`;
    else if (L.beers >= 5) head = `Florida Man Drinks ${L.beers} Beers, Cites “Hydration”`;
    else if (L.gits >= 5) head = `Florida Man Yells “GIT” ${L.gits} Times at Wildlife; Wildlife Mostly Complies`;
    else if (!real.length) head = 'Florida Man Goes Fishing, Catches Nothing, Remains Optimistic';
    else head = 'Florida Man Has Normal Day; Experts Baffled';

    const dek = `Dan, 44, of County Road 29, reportedly caught ${real.length} fish${big ? `, the largest a ${big.lbs} lb ${big.name.toLowerCase()}` : ''}. `
      + (L.merle ? 'Cousin Merle confirmed receipt “mostly.”' : 'Cousin Merle could not be reached for comment but was described by neighbors as “pretty ticked.”');
    txt($('gzMeta'), `Day ${S.day} · Collier County · 50¢`);
    txt($('gzHead'), head); txt($('gzDek'), dek);
    const fl = $('gzFish'); fl.innerHTML = '';
    (L.caught.length ? L.caught : [{ name: 'Nothing. Not even a boot.', lbs: '' }]).forEach(c => { const li = document.createElement('li'); li.textContent = c.lbs !== '' ? `${c.name} — ${c.lbs} lb` : c.name; fl.append(li); });
    const bl = $('gzBlotter'); bl.innerHTML = '';
    [`${L.bites} gator bite${L.bites === 1 ? '' : 's'}`, `${L.gits} counts of yelling “GIT”`,
      `${L.beers} beer${L.beers === 1 ? '' : 's'}, ${L.cigs} cig${L.cigs === 1 ? '' : 's'}${L.joints ? `, ${L.joints} joint` : ''}`,
      L.steals.length ? `${L.steals.length} fish lost to gators` : null, L.snapped ? `${L.snapped} snapped line${L.snapped > 1 ? 's' : ''}` : null,
      L.lostItems ? `${L.lostItems} beer${L.lostItems > 1 ? 's' : ''} stolen by reptiles` : null,
      `Chuck: ${L.chuckGit ? 'told to git' : 'at large'}`].filter(Boolean)
      .forEach(s => { const li = document.createElement('li'); li.textContent = s; bl.append(li); });
    ui.talk.hidden = true; ui.card.hidden = true; ui.fishHud.hidden = true; txt(ui.prompt, ''); txt(ui.toast, '');
    showHud(false);
    ui.gazette.hidden = false;
    $('nextBtn').focus();
  },
};
