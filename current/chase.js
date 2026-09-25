// FLORIDA DAN — heat + the Rhonda chase. Headlines raise heat (0-5 stars); at 3 stars
// Deputy Rhonda comes after Dan in her cruiser. The cruiser is land-only, so the jon boat,
// the cooler, a porta-potty, or plain distance all get you away. Getting caught costs you.
'use strict';
const Heat = {
  cop: null, lostT: 0,
  add(n) {
    Game.heat = clamp((Game.heat || 0) + n, 0, 5); Game.heatBumpT = 2.5;   // the stars say why they went up
    hint('heat', `Headlines = ★. At ★★★ the cops come. Bribe the Gazette (blue box) or lie low to cool off`, 7);
  },
  tick(dt) {
    Game.heat = Math.max(0, (Game.heat || 0) - dt * (this.cop ? 0 : hasUp('scanner') ? .024 : .012)); Game.heatBumpT = (Game.heatBumpT || 0) - dt;
    if (!this.cop && Game.heat >= 2.9 && Game.day !== 4 && !Game.flags.noChase && !Game.racing && !(typeof Convoy !== 'undefined' && Convoy.on) && !ui.banner.classList.contains('show') && !headlineQ.length) this.start();   // one thing at a time
    if (this.cop) this.chase(dt);
  },
  start() {
    const D = Game.dan;
    let spot = null;   // spawn the cruiser on drivable ground somewhere off-screen
    for (let i = 0; i < 60 && !spot; i++) {
      const a = rnd(0, 6.28), r = rnd(150, 210), x = D.x + Math.cos(a) * r, y = D.y + Math.sin(a) * r;
      if (canDrive(x, y)) spot = { x, y };
    }
    if (!spot) return;
    this.cop = { x: spot.x, y: spot.y, dir: 'left', t: 0 }; this.lostT = 0;
    const r = Game.npcs.find(n => n.id === 'rhonda'); if (r) r.hidden = true;
    Sound.play('siren'); Game.day_.chases = (Game.day_.chases || 0) + 1;
    if (ORLANDO()) toast(pick(['ORANGE COUNTY: Pull over, Mouse Man!', 'ORANGE COUNTY: Sir, the ears are NOT a disguise!']), 3.5); else if (KEYS()) toast(pick(['MONROE COUNTY: Pull over, Mr. President!', 'MONROE COUNTY: Stop in the name of the United States! Which you are still part of!']), 3.5); else if (MIAMI()) toast(pick(['MIAMI-DADE: Pull over, pastel boy!', 'MIAMI-DADE: Stop right there, Florida Man!']), 3.5); else if (DAYTONA()) toast(pick(['VOLUSIA DEPUTY: Pull over, champ!', 'VOLUSIA DEPUTY: This ain’t the speedway, Dupree!']), 3.5); else toast(pick(['RHONDA: DAN! PULL OVER! ...OR WALK OVER! WHATEVER YOU’RE DOING!', 'RHONDA: You’re on my list today, Dan!', 'RHONDA: Stop right there, Florida Man!']), 3.5);
    hint(MIAMI() || DAYTONA() ? 'chase2' : 'chase', MIAMI() || DAYTONA() ? `Lose 'em: ${K('run')} to run, or get way out of sight` : `Lose her: ${K('run')} to run, take the <b>boat</b>, ride the <b>cooler</b>, or hide in the <b>porta-potty</b>`, 6);
  },
  chase(dt) {
    const c = this.cop, D = Game.dan; c.t += dt;
    if (Math.floor(c.t / .7) !== Math.floor((c.t - dt) / .7)) Sound.play('siren');
    const P = c.foot || c;   // whoever is actually chasing: the cruiser, or the officer who got out of it
    const dx = D.x - P.x, dy = D.y - P.y, d = Math.hypot(dx, dy) || 1;
    const hidden = Game.dan.hiding, onWater = Game.dan.ride === 'boat' && !canDrive(D.x, D.y);
    // cruiser: faster than Dan on foot, slower than the cooler/boat/"sinus medicine". On foot: slower than Dan running, faster than walking.
    const sp = hidden ? 0 : c.foot ? 68 : 74, ok = c.foot ? canWalk : canDrive;
    let moved = false;
    const wp = this.route(P, !!c.foot, dt), base = wp ? Math.atan2(wp.y - P.y, wp.x - P.x) : Math.atan2(dy, dx);   // around buildings, not into them
    for (const turn of [0, .6, -.6, 1.2, -1.2]) {
      const a = base + turn, nx = P.x + Math.cos(a) * sp * dt, ny = P.y + Math.sin(a) * sp * dt;
      if (ok(nx, ny)) { P.x = nx; P.y = ny; P.dir = dirOf(Math.cos(a), Math.sin(a)); moved = true; break; }
    }
    if (c.foot) { c.foot.moving = moved; if (moved && Math.floor(c.t * 8) % 2 !== c.foot.frame) c.foot.frame ^= 1; }
    // the car can't get to him (sidewalk, beach, yard): the officer bails out and runs him down
    c.stuck = moved || c.foot ? 0 : (c.stuck || 0) + dt;
    if (!c.foot && c.stuck > .5 && !hidden && !onWater && d < 180) {
      for (const [ox, oy] of [[0, 14], [14, 0], [-14, 0], [0, -14], [0, 0]]) if (canWalk(c.x + ox, c.y + oy)) { c.foot = { x: c.x + ox, y: c.y + oy, dir: 'down', frame: 0, moving: false }; break; }
      if (c.foot) { toast(ORLANDO() ? 'ORANGE COUNTY: Fine. I’ll catch the mouse man on FOOT.' : MIAMI() ? 'OFFICER: Out of the car! ON FOOT!' : DAYTONA() ? 'DEPUTY: Oh, you wanna RUN? I did track in high school!' : 'RHONDA: Fine. FINE. I’ll catch you on FOOT, Dan.', 2.5); hint('footcop', `Cops get out and run now. ${K('run')} to outrun them`, 5); }
    }
    if (!hidden && !onWater && d < (c.foot ? 11 : 13)) return this.busted();
    // she loses you if you're far away, in a porta-potty, or out on the water, for long enough
    const lost = hidden || onWater || d > 200 || !moved;
    this.lostT = lost ? this.lostT + dt : Math.max(0, this.lostT - dt * 2);
    if (this.lostT > (hidden ? 5 : 7)) this.escaped(hidden ? 'hide' : onWater ? 'boat' : Game.dan.ride === 'cooler' ? 'cooler' : 'run');
  },
  // a distance map to Dan over drivable (or walkable) tiles, rebuilt twice a second; the pursuer steps downhill
  route(P, foot, dt) {
    const F = this.flow || (this.flow = {}), k = foot ? 'walk' : 'drive', D = Game.dan;
    const f = F[k] || (F[k] = { t: 0 }); f.t -= dt;
    if (f.t <= 0 || !f.d) {
      f.t = .5; const W = MW, H = MH, d = f.d && f.d.length === W * H ? f.d.fill(-1) : (f.d = new Int16Array(W * H).fill(-1)), ok = foot ? canWalk : canDrive;
      const sx = Math.floor(D.x / TS), sy = Math.floor(D.y / TS), q = [sx + sy * W]; if (sx < 0 || sy < 0 || sx >= W || sy >= H) return null; d[q[0]] = 0;
      for (let i = 0; i < q.length; i++) { const cur = q[i], x = cur % W, y = (cur - x) / W;
        for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ox, ny = y + oy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = nx + ny * W; if (d[j] >= 0) continue; if (!ok((nx + .5) * TS, (ny + .5) * TS) && !(nx === sx && ny === sy)) continue; d[j] = d[cur] + 1; q.push(j); } }
    }
    const W = MW, x = Math.floor(P.x / TS), y = Math.floor(P.y / TS), here = f.d[x + y * W]; if (here === undefined || here <= 1) return null;
    let best = null, bd = here < 0 ? 1e9 : here;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const v = f.d[(x + ox) + (y + oy) * W]; if (v >= 0 && v < bd) { bd = v; best = [x + ox, y + oy]; } }
    return best ? { x: (best[0] + .5) * TS, y: (best[1] + .5) * TS } : null;
  },
  end() { this.cop = null; const r = Game.npcs.find(n => n.id === 'rhonda'); if (r) r.hidden = false; },
  busted() {
    this.end(); Sound.play('siren'); react('flop');
    const mia = MIAMI() || DAYTONA() || ORLANDO(), cop = MIAMI() ? 'OFFICER' : DAYTONA() || ORLANDO() ? 'DEPUTY' : 'RHONDA', fine = Math.min(Game.money, 20), took = ['beer', 'joint', 'shroom', 'powder'].filter(k => Game.inv[k] > 0), bribe = mia ? 40 : 25;
    if (Game.car && typeof Car !== 'undefined') Car.exit(); Game.dan.ride = null; Game.heat = 0;
    const takeFine = () => { Game.money -= fine; took.forEach(k => Game.inv[k] = 0); headline(pick(['FLORIDA MAN LEADS DEPUTY ON LOW-SPEED CHASE, CAUGHT HIDING BEHIND A LAWN FLAMINGO', 'FLORIDA MAN ARRESTED AFTER TELLING DEPUTY "YOU CAN’T ARREST ME, I’M ON THE CLOCK"']), 6);
      return [[cop, `That’s a $${fine} fine${took.length ? `, and I’m confiscating the ${took.map(k => ITEMS[k].name).join(', ')}` : ''}.`], ['DAN', pick(['This is entrapment.', 'I want to speak to Brenda.', 'Can I at least keep one beer. For my nerves.'])], [cop, 'Go home, Dan.']]; };
    const payOff = () => { Game.money -= bribe; Sound.play('cash'); return [['', `Dan folds $${bribe} into a handshake. A long handshake.`], [cop, pick(['...I didn’t see anything. I was looking at a bird.', 'Huh. Must’ve been some other Florida Man.', 'This never happened, Dan. And wash your hands.'])]]; };
    say([[cop, pick(['Gotcha. You run like a wet sock, Dan.', 'End of the line, Dan. Hands where I can see ’em. Not THERE.', 'Dan. You were jogging. I was DRIVING.'])],
      ...(hasUp('bail') && !Game.day_.bailUsed ? [['DAN', '', [['Flash Bubba’s Bail Card (free, once a day)', () => { Game.day_.bailUsed = true; Sound.play('cash'); return [['', 'Dan produces a laminated card. It says BUBBA’S BAIL BONDS · “HE’S WITH ME.”'], [cop, '...Bubba vouches for you? Bubba. The man with the boat named BAIL. Fine. GO.']]; }],
        ...(Game.money >= bribe ? [[`Slip ${mia ? 'him' : 'her'} $${bribe}`, payOff]] : []), ['Take the fine', takeFine]]]]
      : Game.money >= bribe ? [['DAN', '', [[`Slip ${mia ? 'him' : 'her'} $${bribe} (keep your stuff, no headline)`, payOff], ['Take the fine', takeFine]]]] : takeFine())]);
  },
  escaped(how) {
    this.end();
    const H = {
      hide: 'FLORIDA MAN HIDES FROM POLICE IN PORTA-POTTY; DEPUTY "NOT GOING IN THERE"',
      boat: 'FLORIDA MAN ESCAPES POLICE IN JON BOAT NAMED "SS BUDGET"',
      cooler: 'FLORIDA MAN EVADES DEPUTY ON MOTORIZED COOLER; DEPUTY "NOT MAD, JUST DISAPPOINTED"',
      run: 'FLORIDA MAN OUTRUNS DEPUTY IN FLIP-FLOPS, TELLS REPORTERS HE "HAS CARDIO NOW"',
    };
    headline(H[how], 4); Game.heat = 1;
    toast(pick(['Lost her. Dan’s heart is doing the cha-cha.', 'She’s gone. For now.', 'Escaped. Dan did not have a plan. Dan never has a plan.']));
    if (Game.dan.hiding) { const h = World.spots.hide || { x: 25.8 * TS, y: 43.3 * TS }; Game.dan.hiding = false; Game.dan.x = h.x; Game.dan.y = h.y + 10; }
  },
  draw(cx, cy, t) {
    const c = this.cop; if (!c) return;
    const x = Math.round(c.x - cx), y = Math.round(c.y - cy), horiz = c.dir === 'left' || c.dir === 'right';
    const w = horiz ? 30 : 16, h = horiz ? 16 : 28;
    shadow(x, y + h / 2, w + 4, 5);
    OR(x - w / 2, y - h / 2, w, h, PAL.white);
    if (horiz) { R(x - w / 2, y - h / 2, 9, h, PAL.black); R(x + w / 2 - 9, y - h / 2, 9, h, PAL.black); R(x - 5, y - h / 2 + 2, 10, h - 4, PAL.waterL); }
    else { R(x - w / 2, y - h / 2, w, 7, PAL.black); R(x - w / 2, y + h / 2 - 7, w, 7, PAL.black); R(x - w / 2 + 2, y - 5, w - 4, 10, PAL.waterL); }
    const on = Math.floor(t * 8) % 2;
    OR(x - 5, y - 2, 4, 3, on ? PAL.red : PAL.redD); OR(x + 1, y - 2, 4, 3, on ? PAL.blueD : PAL.blue);
    if (on) { g.globalAlpha = .18; g.fillStyle = PAL.red; g.beginPath(); g.arc(x - 3, y, 18, 0, 7); g.fill(); g.fillStyle = PAL.blue; g.beginPath(); g.arc(x + 3, y, 18, 0, 7); g.fill(); g.globalAlpha = 1; }
    label(ORLANDO() ? 'ORANGE CO.' : KEYS() ? 'MONROE' : MIAMI() ? 'MIAMI-DADE' : DAYTONA() ? 'VOLUSIA' : 'SHERIFF', x, y + h / 2 + 9, PAL.white, 7);
    const f = c.foot; if (f) { const fx = Math.round(f.x - cx), fy = Math.round(f.y - cy); shadow(fx, fy + 1, 12); g.drawImage(SPR.rhonda[f.dir][f.moving ? f.frame : 0], fx - 8, fy - 21); R(fx - 5, fy - 17, 10, 1, PAL.shades); }
  },
};
