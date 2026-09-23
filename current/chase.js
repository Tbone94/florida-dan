// FLORIDA DAN — heat + the Rhonda chase. Headlines raise heat (0-5 stars); at 3 stars
// Deputy Rhonda comes after Dan in her cruiser. The cruiser is land-only, so the jon boat,
// the cooler, a porta-potty, or plain distance all get you away. Getting caught costs you.
'use strict';
const Heat = {
  cop: null, lostT: 0,
  add(n) { Game.heat = clamp((Game.heat || 0) + n, 0, 5); },
  tick(dt) {
    Game.heat = Math.max(0, (Game.heat || 0) - dt * (this.cop ? 0 : .012));
    if (!this.cop && Game.heat >= 2.9 && Game.day !== 4 && !Game.flags.noChase) this.start();
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
    if (MIAMI()) toast(pick(['MIAMI-DADE: Pull over, pastel boy!', 'MIAMI-DADE: Stop right there, Florida Man!']), 3.5); else toast(pick(['RHONDA: DAN! PULL OVER! ...OR WALK OVER! WHATEVER YOU’RE DOING!', 'RHONDA: You’re on my list today, Dan!', 'RHONDA: Stop right there, Florida Man!']), 3.5);
    hint('chase', `Lose her: ${K('run')} run, take the <b>boat</b>, ride the <b>cooler</b>, or hide in the <b>porta-potty</b>`, 6);
  },
  chase(dt) {
    const c = this.cop, D = Game.dan; c.t += dt;
    if (Math.floor(c.t / .7) !== Math.floor((c.t - dt) / .7)) Sound.play('siren');
    const dx = D.x - c.x, dy = D.y - c.y, d = Math.hypot(dx, dy) || 1;
    const hidden = Game.dan.hiding, onWater = Game.dan.ride === 'boat' && !canDrive(D.x, D.y);
    const sp = hidden ? 0 : 74;   // faster than Dan on foot, slower than the cooler/boat/"sinus medicine"
    let moved = false;
    for (const turn of [0, .6, -.6, 1.2, -1.2]) {
      const a = Math.atan2(dy, dx) + turn, nx = c.x + Math.cos(a) * sp * dt, ny = c.y + Math.sin(a) * sp * dt;
      if (canDrive(nx, ny)) { c.x = nx; c.y = ny; c.dir = dirOf(Math.cos(a), Math.sin(a)); moved = true; break; }
    }
    if (!hidden && !onWater && d < 13) return this.busted();
    // she loses you if you're far away, in a porta-potty, or out on the water, for long enough
    const lost = hidden || onWater || d > 200 || !moved;
    this.lostT = lost ? this.lostT + dt : Math.max(0, this.lostT - dt * 2);
    if (this.lostT > (hidden ? 5 : 7)) this.escaped(hidden ? 'hide' : onWater ? 'boat' : Game.dan.ride === 'cooler' ? 'cooler' : 'run');
  },
  end() { this.cop = null; const r = Game.npcs.find(n => n.id === 'rhonda'); if (r) r.hidden = false; },
  busted() {
    this.end(); Sound.play('siren');
    const fine = Math.min(Game.money, 20), took = ['beer', 'joint', 'shroom', 'powder'].filter(k => Game.inv[k] > 0);
    Game.money -= fine; took.forEach(k => Game.inv[k] = 0); Game.dan.ride = null;
    headline(pick(['FLORIDA MAN LEADS DEPUTY ON LOW-SPEED CHASE, CAUGHT HIDING BEHIND A LAWN FLAMINGO', 'FLORIDA MAN ARRESTED AFTER TELLING DEPUTY "YOU CAN’T ARREST ME, I’M ON THE CLOCK"']), 6);
    Game.heat = 0;
    say([['RHONDA', pick(['Gotcha. You run like a wet sock, Dan.', 'End of the line, Dan. Hands where I can see ’em. Not THERE.', 'Dan. You were jogging. I was DRIVING.'])],
      ['RHONDA', `That’s a $${fine} fine${took.length ? `, and I’m confiscating the ${took.map(k => ITEMS[k].name).join(', ')}` : ''}.`],
      ['DAN', pick(['This is entrapment.', 'I want to speak to Brenda.', 'Can I at least keep one beer. For my nerves.'])], ['RHONDA', 'Go home, Dan.']]);
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
    label(MIAMI() ? 'MIAMI-DADE' : 'SHERIFF', x, y + h / 2 + 9, PAL.white, 7);
  },
};
