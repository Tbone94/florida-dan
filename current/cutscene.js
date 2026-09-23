// FLORIDA DAN — cutscenes. The big moments play out in the world (people walk in, the camera moves, things
// explode) instead of being described in the talk box. A scene is a list of steps run in order:
//   Scene.play([SC.cam(x, y, 1.4, 1), SC.walk('merle', x, y), SC.emote('dan', '!'), SC.say(lines), SC.fx(() => explode(x, y))], then)
// Hold E (or A / tap E) to skip. The world keeps living underneath (critters wander, particles fly).
'use strict';
const Scene = {
  q: null, i: 0, t: 0, then: null, cam: null, bars: 0, skipT: 0, bubbles: [],
  on: () => Game.mode === 'scene' || (Game.mode === 'talk' && Game.talk && Game.talk.prev === 'scene'),
  play(steps, then) {
    this.q = steps.flat().filter(Boolean); this.i = 0; this.then = then || null; this.skipT = 0; this.bubbles = []; this.skipping = false;
    this.cam = { x: Game.cam.x + VW / 2, y: Game.cam.y + VH / 2 + 10, z: 1 };
    this.hud = !ui.hudTop.hidden; showHud(false); ui.prompt.hidden = true; ui.hint.hidden = true;
    Game.dan.moving = false; Input.releaseAll();
    Game.mode = 'scene'; this.begin();
  },
  begin() {
    const s = this.q[this.i]; if (!s) return this.end();
    this.t = 0; s._t0 = Game.t; if (s.start) s.start(s);
  },
  tick(dt) {
    tickWorld(dt); updateParts(dt); tickFx(dt);
    this.bars = Math.min(1, this.bars + dt * 3);
    for (const b of this.bubbles) b.life -= dt; this.bubbles = this.bubbles.filter(b => b.life > 0);
    // hold E to skip the rest (dialogue inside still gets shown, fast)
    this.skipT = Input.held('a') ? this.skipT + dt : 0;
    if (this.skipT > .6) this.skipping = true;
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
    this.aim(dt);
  },
  aim() {   // the scene camera: centre + zoom through the shader's view window
    const c = this.cam, z = c.z;
    Game.cam.x = c.x - VW / 2; Game.cam.y = c.y - VH / 2 - 10;
    Game.view = z === 1 ? null : [.5 - .5 / z, .5 - .5 / z, 1 / z];
  },
  end() {
    const then = this.then; this.q = null; this.then = null; Game.view = null; this.bubbles = [];
    if (Game.mode === 'scene') Game.mode = 'play';
    for (const n of Game.npcs) n.moving = false; Game.dan.moving = false;
    if (Game.mode === 'play') showHud(this.hud !== false);
    this.bars = 0; Input.releaseAll();
    if (then) then();
  },
  // drawn over the world: speech bubbles, letterbox, the skip hint
  draw(cx, cy, t) {
    if (!this.on()) return;
    for (const b of this.bubbles) {
      const a = b.who(); if (!a) continue; const x = Math.round(a.x - cx), y = Math.round(a.y - cy - (b.hi || 30)) + (b.emote ? Math.round(Math.sin(t * 8) * 1.5) : 0);
      if (b.emote) { label(b.text, x, y, b.col || PAL.yellow, 10); continue; }
      const w = labelWidth(b.text, 6) + 8; OR(x - w / 2, y - 9, w, 11, PAL.white); R(x - 1, y + 2, 3, 2, PAL.white); label(b.text, x, y - 1, PAL.ink, 6);
    }
    const h = Math.round(14 * ease(this.bars)); g.fillStyle = '#000'; g.fillRect(0, 0, VW, h); g.fillRect(0, VH - h, VW, h);
    if (Game.mode === 'scene' && !this.skipping) label(this.skipT > 0 ? 'SKIPPING…' : 'HOLD E TO SKIP', VW - 34, VH - 5, PAL.greyD || '#8d8a93', 5);
  },
};

// ---------- step builders ----------
const actorOf = a => typeof a === 'function' ? a() : a === 'dan' ? Game.dan : typeof a === 'string' ? (Game.npcs.find(n => n.id === a) || Game.animals.find(n => n.id === a || n.type === a)) : a;
const SC = {
  wait: s => ({ dur: s }),
  fx: fn => ({ start: fn, dur: 0 }),
  // camera: glide to (x, y) at zoom z over d seconds
  cam: (x, y, z = 1, d = .8) => ({ dur: d, start(s) { const c = Scene.cam; s.a = { ...c }; s.b = { x: typeof x === 'function' ? x() : x, y: typeof y === 'function' ? y() : y, z }; if (!d) Object.assign(c, s.b); },
    tick(dt, t, s) { const k = ease(Math.min(1, t / (d || 1))), c = Scene.cam; c.x = lerp(s.a.x, s.b.x, k); c.y = lerp(s.a.y, s.b.y, k); c.z = lerp(s.a.z, s.b.z, k); } }),
  camOn: (who, z = 1.4, d = .8, oy = -8) => SC.cam(() => actorOf(who).x, () => actorOf(who).y + oy, z, d),
  // walk someone to (x, y) (or next to another actor); frames animate, facing follows the move
  walk: (who, x, y, speed = 55, wait = true) => ({ start(s) { s.a = actorOf(who); s.x = typeof x === 'function' ? x() : x; s.y = typeof y === 'function' ? y() : y; },
    tick(dt, t, s) { const a = s.a; if (!a) return; const dx = s.x - a.x, dy = s.y - a.y, d = Math.hypot(dx, dy); if (d < 1.5) { a.moving = false; return; }
      const st = Math.min(d, speed * dt); a.x += dx / d * st; a.y += dy / d * st; a.dir = dirOf(dx, dy); a.moving = true; a.t = (a.t || 0) + dt; if (Math.floor(a.t * 8) % 2 !== (a.frame || 0)) a.frame = (a.frame || 0) ^ 1;
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
  shake: (n = 6) => SC.fx(() => { Game.shake = n; }),
  flash: (n = .7) => SC.fx(() => { Game.flash = n; }),
  sound: k => SC.fx(() => Sound.play(k)),
  all: steps => ({ start(s) { s.kids = steps.map(k => ({ ...k })); s.kids.forEach(k => { k._t = 0; k.start && k.start(k); }); },
    tick(dt, t, s) { for (const k of s.kids) { if (k._d) continue; k._t += dt; k.tick && k.tick(dt, k._t, k); if (k.done ? k.done(k._t, k) : k._t >= (k.dur || 0)) { k._d = true; k.finish && k.finish(k); } } },
    done: (t, s) => s.kids.every(k => k._d) }),
};
