import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; const out = [];
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 30); render(); hud(); Input.endFrame(); } };
  const finishTalk = () => { for (let i = 0; i < 60 && Game.mode === 'talk'; i++) { const c = document.querySelector('.choice'); if (c) c.click(); else Input.press('a'); step(4); } };
  begin(false); finishTalk(); Game.day = 2; startDay(); finishTalk(); Game.flags.noChase = true;
  out.push('day 2 offers: ' + JSON.stringify(Game.day_.gig.offers));
  const D = Game.dan, npc = id => Game.npcs.find(n => n.id === id);
  for (const id of ['beer', 'pool', 'mattress', 'fireworks', 'trial', 'cow']) {
    const d = GIGS[id], giver = npc(d.giver); Game.day_.gig.offers = { [d.giver]: id }; Game.day_.gig.active = null; Game.mode = 'play';
    Object.assign(D, { x: giver.x, y: giver.y + 16, ride: null, carry: null });
    if (id === 'bubba' || d.giver === 'bubba') { Story.talk(giver); for (let i = 0; i < 20 && Game.mode === 'talk'; i++) { const cs = [...document.querySelectorAll('.choice')]; const c = cs.find(b => /work/.test(b.textContent)) || cs.find(b => /in\.”/.test(b.textContent)); if (c) c.click(); else Input.press('a'); step(4); } }
    else { Story.talk(giver); finishTalk(); }
    const acc = Game.day_.gig.active === id;
    let arrow = currentQuest() && currentQuest().id;
    // play it out
    if (id === 'beer') { Game.inv.beer = 8; Story.talk(giver); finishTalk(); }
    if (id === 'pool') { const a = Game.animals.find(x => x.gig === 'pool'); Object.assign(D, { x: a.x - 14, y: a.y }); const it = interaction(); it.fn(); for (let i = 0; i < 400 && Game.mode === 'wrestle'; i++) { Input.press('a'); const w = Wrestle.w; if (w && w.prompt) Input.press(w.prompt); step(2); } finishTalk(); }
    if (id === 'mattress') { const m = Game.pickups.find(x => x.kind === 'mattress'); Object.assign(D, { x: m.x, y: m.y }); step(3); const dm = World.props.find(x => x.kind === 'dumpster'); Object.assign(D, { x: dm.x + 12, y: dm.y + 24 }); const it = interaction(); if (it) it.fn(); }
    if (id === 'fireworks') { for (let k = 0; k < 3; k++) { useItem('firework'); step(40); } step(5); }
    if (id === 'trial') { const P = [World.spots.bubbaDock, World.spots.tikiDock, World.spots.dockEnd, World.spots.bubbaDock]; Object.assign(D, { ride: 'boat', x: P[0].x, y: P[0].y }); step(3); for (let i = 1; i < 4; i++) { Object.assign(D, { x: P[i].x, y: P[i].y }); step(3); } }
    if (id === 'cow') { const c = Game.animals.find(a => a.herd); Object.assign(c, { x: 60 * TS, y: 50 * TS }); step(3); }
    finishTalk();
    out.push(`${id}: accepted=${acc} arrow→${arrow} done=${Game.day_.gig.done.includes(id)} $${Game.money}`);
  }
  return out.join('\n');
});
console.log(r); console.log('errors:', errs.length ? errs : 'none'); await b.close();
