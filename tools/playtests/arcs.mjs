// neighbor stories: every chapter offered, accepted, done and paid; plus the cooler whistle and cops on foot
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const out = await p.evaluate(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
  const talk = (k = 0) => { for (let i = 0; i < 400 && Game.mode === 'talk'; i++) { step(6); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[Math.min(k, cs.length - 1)].click(); else Input.press('a'); step(1); } };
  const go = (region, day, flags) => { Game.mode = 'play'; ui.talk.hidden = true; Game.talk = null; World.load(region); Game.day = day; Object.assign(Game.flags, flags); startDay(); talk(); };
  const r = {}, log = [];
  const ALL = { acquitted: true, case2Won: true, case3Won: true, case4Won: true, case5Won: true };
  for (const [id, chs] of Object.entries(ARCS)) for (let ci = 0; ci < chs.length; ci++) {
    const c = chs[ci]; const reg = c.where; go(reg, reg === 'miami' ? 14 : 25, ALL); Game.flags.arcs = Game.flags.arcs || {}; Game.flags.arcs[id] = { ch: ci, st: 'idle' };
    if (id === 'darlene' && ci === 2) Game.flags.arcs.merle = { ch: 3, st: 'idle' };
    Game.quests = Game.quests.filter(q => q.opt);   // no story in the way
    const n = Game.npcs.find(x => x.id === id); if (!n) { r[id + ci] = 'NO NPC in ' + reg; continue; }
    const offered = Arcs.offering(n); Story.talk(n); talk(0);
    const s = ARC(id); if (s.st !== 'active') { r[id + ci] = 'not started (offered=' + offered + ')'; continue; }
    // meet the need
    Game.hour = 21; Object.assign(Game.inv, { beer: 9, hotdog: 3, firework: 3, can: 7, scratch: 1 }); Game.flags.up = Object.assign(Game.flags.up || {}, { billy: true });
    Game.catchBag.push({ name: 'Largemouth Bass', lbs: 8, sp: {} }); Game.day_.wrestles = 5;
    const q = Q('arc_' + id), tg = q && Arcs.target(q);
    if (c.act) { const at = c.act.at(); if (at === n || Game.npcs.includes(at)) { Story.talk(at); } else { Game.dan.x = at.x; Game.dan.y = at.y + 4; step(2); const a = interaction(); if (!a || !/./.test(a.label)) { r[id + ci] = 'no act prompt'; continue; } a.fn(); } talk(0); }
    if (s.st === 'active') { Story.talk(n); talk(0); }
    step(30); talk(0);
    r[id + ci] = s.ch === ci + 1 && s.st === 'idle' ? 'ok' : `stuck ch=${s.ch} st=${s.st} acted=${s.acted} target=${!!tg}`;
  }
  // cooler whistle
  go('swamp', 25, ALL); Game.day_.usedCooler = true; Game.cooler.x = Game.dan.x + 600; Game.cooler.y = Game.dan.y; step(2);
  const a = interaction(); const label = a && a.label; if (a) a.fn(); talk(); for (let i = 0; i < 20 * 60 && Game.cooler.home; i++) step(1);
  r.cooler = label === 'Whistle for the cooler' && !Game.cooler.home && Math.hypot(Game.cooler.x - Game.dan.x, Game.cooler.y - Game.dan.y) < 60 ? 'ok' : `label=${label} home=${!!Game.cooler.home} d=${Math.round(Math.hypot(Game.cooler.x - Game.dan.x, Game.cooler.y - Game.dan.y))}`;
  // cops in Miami actually get to you (from the hotel sidewalk, and from the beach)
  for (const [nm, spot] of [['hotel', () => World.spots.door], ['beach', () => findTile(k => k === T.SAND, 60, 20, 78, 50, 3)]]) {
    go('miami', 14, ALL); const S = spot(); Game.dan.x = S.x; Game.dan.y = S.y + 14; Game.heat = 3.5; let caught = false, foot = false;
    for (let i = 0; i < 25 * 60; i++) { step(1); if (Heat.cop && Heat.cop.foot) foot = true; if (Game.mode === 'talk' && /OFFICER/.test(ui.talkWho.textContent)) { caught = true; break; } }
    r['cops_' + nm] = caught ? 'ok' + (foot ? ' (on foot)' : '') : 'never caught'; talk(); Heat.end(); Game.heat = 0;
  }
  return r;
});
console.log(out); const bad = Object.entries(out).filter(([k, v]) => !String(v).startsWith('ok'));
console.log(bad.length ? 'FAILURES: ' + JSON.stringify(bad) : 'all arcs ok'); console.log('errors:', errs.length ? [...new Set(errs)].slice(0, 6) : 'none'); await b.close();
