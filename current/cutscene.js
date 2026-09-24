// FLORIDA DAN — cutscenes. The big moments play out in the world (people walk in, the camera moves, things
// explode) instead of being described in the talk box. A scene is a list of steps run in order:
//   Scene.play([SC.cam(x, y, 1.4, 1), SC.walk('merle', x, y), SC.emote('dan', '!'), SC.say(lines), SC.fx(() => explode(x, y))], then)
// Hold E (or A / tap E) to skip. The world keeps living underneath (critters wander, particles fly).
'use strict';
const sEase = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
const Scene = {
  q: null, i: 0, t: 0, then: null, cam: null, bars: 0, skipT: 0, bubbles: [], flyers: [], props: [],
  skip() { if (Game.mode === 'scene') this.skipping = true; },
  on: () => Game.mode === 'scene' || (Game.mode === 'talk' && Game.talk && Game.talk.prev === 'scene'),
  play(steps, then) {
    this.q = steps.flat().filter(Boolean); this.i = 0; this.then = then || null; this.skipT = 0; this.bubbles = []; this.skipping = false;
    this.cam = { x: Game.cam.x + VW / 2, y: Game.cam.y + VH / 2 + 10, z: 1 };
    this.hud = !ui.hudTop.hidden; showHud(false); ui.prompt.hidden = true; ui.hint.hidden = true;
    Game.dan.moving = false; Input.releaseAll();
    Game.mode = 'scene'; $('lbox').classList.add('on'); this.begin();
  },
  begin() {
    const s = this.q[this.i]; if (!s) return this.end();
    this.t = 0; s._t0 = Game.t; if (s.start) s.start(s);
  },
  tick(dt) {
    Game.gatorCalm = Math.max(Game.gatorCalm || 0, .5); Game.raccoonCd = Math.max(Game.raccoonCd || 0, .5);   // nobody gets bitten mid-cutscene
    tickWorld(dt); updateParts(dt); tickFx(dt);
    this.bars = Math.min(1, this.bars + dt * 3);
    for (const b of this.bubbles) b.life -= dt; this.bubbles = this.bubbles.filter(b => b.life > 0);
    for (const f of this.flyers) f.t += dt; this.flyers = this.flyers.filter(f => f.t < f.d);
    // hold E to skip the rest (dialogue inside still gets shown, fast)
    this.skipT = Input.held('a') ? this.skipT + dt : 0;
    if (this.skipT > .6) this.skipping = true;
    $('lskip').textContent = this.skipT > 0 ? 'SKIPPING…' : 'SKIP ›';
    let guard = 0;
    while (Game.mode === 'scene' && this.q && guard++ < 50) {
      const s = this.q[this.i]; if (!s) { this.end(); break; }
      this.t += guard === 1 ? dt : 0;
      if (s.tick) s.tick(dt, this.t, s);
      const fin = this.skipping && !s.say ? true : s.done ? s.done(this.t, s) : this.t >= (s.dur || 0);
      if (!fin) break;
      if (s.finish) s.finish(s);
      this.i++; this.begin(); if (!this.skipping) break;
    }
    if (this.q) this.aim(dt);   // the last step can end the scene: don't re-aim (that left the zoom on in normal play)
  },
  aim() {   // the scene camera: centre + zoom through the shader's view window
    const c = this.cam, z = c.z, x0 = clamp(c.x - VW / 2, 0, MW * TS - VW), y0 = clamp(c.y - VH / 2 - 10, 0, MH * TS - VH);
    Game.cam.x = x0; Game.cam.y = y0;   // the map edge stops the camera, so aim the zoom at the subject instead of the middle
    const w = 1 / z, fx = (c.x - x0) / VW, fy = (c.y - 10 - y0) / VH;
    Game.view = z === 1 ? null : [clamp(fx - w / 2, 0, 1 - w), clamp(fy - w / 2, 0, 1 - w), w];
  },
  end() {
    const then = this.then; this.q = null; this.then = null; Game.view = null; this.bubbles = []; this.flyers = []; this.props = []; Game.dan.lift = 0;
    if (Game.mode === 'scene') Game.mode = 'play';
    for (const n of Game.npcs) n.moving = false; Game.dan.moving = false;
    if (Game.mode === 'play') showHud(this.hud !== false);
    this.bars = 0; Input.releaseAll(); $('lbox').classList.remove('on');
    if (then) then();
  },
  // drawn over the world: speech bubbles, letterbox, the skip hint
  draw(cx, cy, t) {
    if (!this.on()) return;
    for (const p of this.props) p.draw(cx, cy, t);
    for (const f of this.flyers) { const k = f.t / f.d, x = lerp(f.x0, f.x1, k) - cx, y = lerp(f.y0, f.y1, k) - cy - Math.sin(k * Math.PI) * 20;
      g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(f.spin * f.t); g.drawImage(f.img, -f.img.width / 2, -f.img.height / 2); g.restore(); }
    for (const b of this.bubbles) {
      const a = b.who(); if (!a) continue; let x = Math.round(a.x - cx), y = Math.round(a.y - cy - (b.hi || 30)) + (b.emote ? Math.round(Math.sin(t * 8) * 1.5) : 0);
      if (b.emote) { label(b.text, x, y, b.col || PAL.yellow, 10); continue; }
      const v = Game.view || [0, 0, 1], max = Math.max(8, Math.floor((v[2] * VW - 14) / 6)), rows = [];   // wrap to what fits on screen, even zoomed in
      for (const word of b.text.split(' ')) { const r = rows[rows.length - 1]; if (r && (r + ' ' + word).length <= max) rows[rows.length - 1] = r + ' ' + word; else rows.push(word); }
      const w = Math.max(...rows.map(r => labelWidth(r, 6))) + 8, h = rows.length * 9 + 2, x0 = v[0] * VW + w / 2 + 3, x1 = (v[0] + v[2]) * VW - w / 2 - 3;
      x = Math.round(clamp(x, x0, Math.max(x0, x1))); y = Math.max(Math.round(v[1] * VH + 3 + h), y);
      OR(x - w / 2, y - h, w, h, PAL.white); R(x - 1, y, 3, 2, PAL.white); rows.forEach((r, k) => label(r, x, y - h + 7 + k * 9, PAL.ink, 6));
    }
  },
};

// little scene-only sprites and effects
const DONUT = (() => { const c = document.createElement('canvas'); c.width = c.height = 7; const x = c.getContext('2d'); x.fillStyle = PAL.ink; x.fillRect(1, 0, 5, 7); x.fillRect(0, 1, 7, 5); x.fillStyle = '#e9b36b'; x.fillRect(1, 1, 5, 5); x.fillStyle = PAL.hat; x.fillRect(1, 1, 5, 2); x.fillStyle = PAL.ink; x.fillRect(3, 3, 1, 1); return c; })();
const ROCKET = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 10; const x = c.getContext('2d'); x.fillStyle = PAL.ink; x.fillRect(0, 0, 4, 10); x.fillStyle = PAL.red; x.fillRect(1, 2, 2, 7); x.fillStyle = PAL.yellow; x.fillRect(1, 1, 2, 1); return c; })();
function rocket(x, y, h = 90) {   // a Freedom Rocket: a fire trail up, then a burst
  for (let i = 0; i < 14; i++) Game.parts.push({ kind: 'fire', x: x + rnd(-1, 1), y: y - i * 5, vx: rnd(-4, 4), vy: rnd(-30, -10), life: .15 + i * .04 });
}
const burst = (x, y) => { explode(x + rnd(-8, 8), y); Game.flash = Math.max(Game.flash, .12); };
// ---------- step builders ----------
const actorOf = a => typeof a === 'function' ? a() : a === 'dan' ? Game.dan : typeof a === 'string' ? (Game.npcs.find(n => n.id === a) || Game.animals.find(n => n.id === a || n.type === a)) : a;
const SC = {
  wait: s => ({ dur: s }),
  fx: fn => ({ start: fn, dur: 0 }),
  // camera: glide to (x, y) at zoom z over d seconds
  cam: (x, y, z = 1, d = .8) => ({ dur: d, start(s) { const c = Scene.cam; s.a = { ...c }; s.b = { x: typeof x === 'function' ? x() : x, y: typeof y === 'function' ? y() : y, z }; if (!d) Object.assign(c, s.b); },
    tick(dt, t, s) { const k = sEase(Math.min(1, t / (d || 1))), c = Scene.cam; c.x = lerp(s.a.x, s.b.x, k); c.y = lerp(s.a.y, s.b.y, k); c.z = lerp(s.a.z, s.b.z, k); } }),
  camOn: (who, z = 1.4, d = .8, oy = -8) => SC.cam(() => actorOf(who).x, () => actorOf(who).y + oy, z, d),
  // walk someone to (x, y) (or next to another actor); frames animate, facing follows the move
  walk: (who, x, y, speed = 55, wait = true) => ({ start(s) { s.a = actorOf(who); s.x = typeof x === 'function' ? x() : x; s.y = typeof y === 'function' ? y() : y; },
    tick(dt, t, s) { const a = s.a; if (!a) return; const dx = s.x - a.x, dy = s.y - a.y, d = Math.hypot(dx, dy); if (d < 1.5) { a.moving = false; return; }
      const st = Math.min(d, speed * dt); a.x += dx / d * st; a.y += dy / d * st; a.dir = dirOf(dx, dy); if (Math.abs(dx) > .1) a.flip = dx < 0; a.moving = true; a.t = (a.t || 0) + dt; if (Math.floor(a.t * 8) % 2 !== (a.frame || 0)) a.frame = (a.frame || 0) ^ 1;
      if (a.hx !== undefined) { a.hx = a.x; a.hy = a.y; } },
    done: (t, s) => !wait || !s.a || Math.hypot(s.x - s.a.x, s.y - s.a.y) < 1.5, finish(s) { if (s.a) s.a.moving = false; } }),
  place: (who, x, y, dir) => SC.fx(() => { const a = actorOf(who); if (!a) return; a.x = x; a.y = y; if (a.hx !== undefined) { a.hx = x; a.hy = y; } if (dir) a.dir = dir; a.hidden = false; }),
  face: (who, dir) => SC.fx(() => { const a = actorOf(who); if (a) a.dir = dir; }),
  hide: (who, on = true) => SC.fx(() => { const a = actorOf(who); if (a) a.hidden = on; }),
  // a reaction over someone's head (! ? ♥ ...) or a short line in a speech bubble
  emote: (who, text, d = .9, col) => ({ start() { Scene.bubbles.push({ who: () => actorOf(who), text, life: d, emote: true, col }); Sound.play('talk'); }, dur: d * .6 }),
  line: (who, text, d = 1.6) => ({ start() { Scene.bubbles.push({ who: () => actorOf(who), text, life: d }); Sound.voice && Sound.voice(String(who).toUpperCase()); }, dur: d }),
  say: lines => ({ say: true, start(s) { s.ok = false; say(lines, () => { s.ok = true; }); }, done: (t, s) => s.ok }),
  react: (kind) => SC.fx(() => react(kind)),
  prop: (id, draw) => SC.fx(() => Scene.props.push({ id, draw })),
  unprop: id => SC.fx(() => { Scene.props = Scene.props.filter(p => p.id !== id); }),
  // raise someone off the ground (up a ladder, onto a roof, into the air) and back
  lift: (who, to, d = .6) => ({ dur: d, start(s) { s.a = actorOf(who); s.from = s.a.lift || 0; }, tick(dt, t, s) { s.a.lift = lerp(s.from, to, sEase(Math.min(1, t / d))); }, finish(s) { s.a.lift = to || 0; } }),
  // ramp any number from its value now to `to` (storm strength, hour of day...): get/set pair
  tween: (get, set, to, d = 1) => ({ dur: d, start(s) { s.from = get(); }, tick(dt, t, s) { set(lerp(s.from, to, sEase(Math.min(1, t / d)))); } }),
  // a sprite flying across the scene (a flamingo in a hurricane, a rocket...)
  fly: (img, x0, y0, x1, y1, d = 1.5, spin = 0, wait = false) => ({ dur: wait ? d : 0, start() { Scene.flyers.push({ img: typeof img === 'function' ? img() : img, x0, y0, x1, y1, d, spin, t: 0 }); } }),
  shake: (n = 6) => SC.fx(() => { Game.shake = n; }),
  flash: (n = .7) => SC.fx(() => { Game.flash = n; }),
  sound: k => SC.fx(() => Sound.play(k)),
  all: steps => ({ start(s) { s.kids = steps.map(k => ({ ...k })); s.kids.forEach(k => { k._t = 0; k.start && k.start(k); }); },
    tick(dt, t, s) { for (const k of s.kids) { if (k._d) continue; k._t += dt; k.tick && k.tick(dt, k._t, k); if (k.done ? k.done(k._t, k) : k._t >= (k.dur || 0)) { k._d = true; k.finish && k.finish(k); } } },
    done: (t, s) => s.kids.every(k => k._d) }),
};
// a rocket as scene steps: trail up, a beat, the burst
const SC_ROCKET = (x, y, h = 90, beat = .4) => [SC.fx(() => rocket(x, y)), SC.wait(beat), SC.fx(() => burst(x, y - h))];
