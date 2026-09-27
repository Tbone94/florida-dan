// The Daytona parade lap, played the way a person plays it: get in the pace car and just chase the arrow.
// (The pace car starts right past the finish line; the arrow used to point back at it, so people drove the lap
// backwards and it never counted.) Also: a lap driven the other way round still counts. PORT env picks the server.
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const PORT = process.env.PORT || 8811;
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
const bad = [];
for (const how of ['arrow', 'backwards']) {
  await p.goto(`http://localhost:${PORT}/index.html?test&t=${Date.now()}`); await p.waitForTimeout(1000);
  const r = await p.evaluate(how => {
    window.TRAILER = true; const out = [];
    const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); Input.endFrame(); } };
    const talk = () => { for (let i = 0; i < 300 && Game.mode === 'talk'; i++) { step(8); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[0].click(); else Input.press('a'); step(1); } };
    document.querySelector('[data-n="6"]').click(); talk();
    World.load('daytona'); startDay(); talk();   // (the bus is covered elsewhere)
    const t = Game.npcs.find(n => n.id === 'tammy'); Object.assign(Game.dan, { x: t.x, y: t.y + 16 }); Story.talk(t); talk();
    const pace = Game.vehicles.find(v => v.id === 'pace'); Object.assign(Game.dan, { x: pace.x, y: pace.y + 10 }); step(1);
    const ix = interaction(); if (!ix || !/pace/.test(ix.label)) return ['no pace car prompt: ' + (ix && ix.label)]; ix.fn(); step(2);
    const v = Game.car, P = pathPts(), N = P.length;
    if (how === 'arrow') {
      // chase whatever the arrow points at, like a player: 90 px/s toward the target, never teleporting
      for (let f = 0; f < 60 * 90 && qOpen('pacelap'); f++) {
        const tg = questTarget(Q('pacelap')); if (!tg) { out.push('arrow vanished mid-lap'); break; }
        const dx = tg.x - v.x, dy = tg.y - v.y, d = Math.hypot(dx, dy) || 1, sp = Math.min(d, 90 / 60);
        v.x += dx / d * sp; v.y += dy / d * sp; v.a = Math.atan2(dy, dx); Object.assign(Game.dan, { x: v.x, y: v.y }); step(1);
      }
    } else {
      let i0 = nearestIdx(v.x, v.y, 0, 48)[0];
      for (let k = 1; k <= N + 10 && qOpen('pacelap'); k++) { const q = P[((i0 - k) % N + N) % N]; for (let s = 0; s < 4; s++) { v.x += (q.x - v.x) / (4 - s); v.y += (q.y - v.y) / (4 - s); Object.assign(Game.dan, { x: v.x, y: v.y }); step(1); } }
    }
    talk();
    if (qOpen('pacelap')) out.push(`${how}: the lap never counted (progress ${Game.day_._pp})`);
    if (!qOpen('donuts')) out.push(`${how}: no donut quest after the lap`);
    // then the donut run itself
    const dr = World.spots.drive; if (Game.car) { Game.car.x = dr.x; Game.car.y = dr.y; Object.assign(Game.dan, { x: dr.x, y: dr.y }); } step(2); talk(); step(2);
    if (!Game.flags.donutRun) out.push(`${how}: the donut scene never triggered`);
    return out;
  }, how);
  bad.push(...r);
}
console.log(bad.length ? 'FAIL\n' + bad.join('\n') : 'pace lap ok both ways');
console.log('errors:', errs.length || bad.length ? [...errs, ...bad].slice(0, 8) : 'none');
await b.close();
