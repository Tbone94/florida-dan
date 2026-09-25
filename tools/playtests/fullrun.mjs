import { chromium, devices } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const mobile = process.argv[2] === 'mobile';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext(mobile ? (d => (delete d.defaultBrowserType, d))({ ...devices['Pixel 7 landscape'] }) : { viewport: { width: 1280, height: 720 } });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 240)); });
await p.goto('http://localhost:' + (process.env.PORT || 8811) + '/index.html'); await p.waitForTimeout(1200);
await p.evaluate(() => { window.TRAILER = true; try { localStorage.clear(); } catch (e) {} begin(false); });
const lines = [];
for (let day = 1; day <= 36; day++) {
  const res = await p.evaluate(async day => {
    const errs0 = [];
    const step = n => { for (let i = 0; i < n; i++) { Input.poll(); try { update(1 / 30); render(); hud(); } catch (e) { errs0.push('THROW ' + Game.mode + ': ' + e.message); } Input.endFrame(); } };
    const talk = () => { for (let i = 0; i < 200 && Game.mode === 'talk'; i++) { step(12); const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[0].click(); else Input.press('a'); step(1); } };
    const region = day <= 10 ? 'swamp' : day <= 16 ? 'miami' : day <= 22 ? 'daytona' : day <= 28 ? 'keys' : day <= 34 ? 'orlando' : ['orlando', 'swamp', 'miami', 'daytona', 'keys'][(day - 35) % 5];   // 23-28: the Keys (keysFrom = 23), 29-34: Orlando (orlandoFrom = 29)
    Object.assign(Game.flags, day > 16 ? { case5Won: true } : {}, day === 16 ? { flyer: true } : {}, day === 22 ? { raceWon: true } : {});
    Game.flags.noChase = false;
    World.load(region); Game.day = day; startDay(); talk();
    // wander + mash
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], acts = ['KeyE', 'KeyQ', 'KeyF', 'ShiftLeft', 'Digit1', 'Digit2', 'KeyE']; let held = null, arrowErr = 0;
    for (let f = 0; f < 900; f++) {
      if (f % 30 === 0) { if (held) dispatchEvent(new KeyboardEvent('keyup', { code: held })); held = keys[Math.floor(Math.random() * 4)]; dispatchEvent(new KeyboardEvent('keydown', { code: held })); }
      if (Math.random() < .06) { const c = acts[Math.floor(Math.random() * acts.length)]; dispatchEvent(new KeyboardEvent('keydown', { code: c })); step(1); dispatchEvent(new KeyboardEvent('keyup', { code: c })); }
      if (Game.mode === 'talk' && Math.random() < .3) { const cs = [...document.querySelectorAll('.choice')]; if (cs.length) cs[Math.floor(Math.random() * cs.length)].click(); else Input.press('a'); }
      if (Game.mode === 'shop' && Math.random() < .05) closeShop();
      if (Game.mode === 'journal') closeJournal();
      if (Game.mode === 'mash' || Game.mode === 'wrestle' || Game.mode === 'raccoon') Input.press('a');
      if (Game.mode === 'gazette') break;
      step(1);
      if (f % 60 === 0) { const q = currentQuest(); try { if (q) questTarget(q); } catch (e) { arrowErr++; errs0.push('ARROW ' + q.id + ': ' + e.message); } }
    }
    if (held) dispatchEvent(new KeyboardEvent('keyup', { code: held }));
    talk(); if (Game.mode === 'shop') closeShop(); if (Game.mode !== 'play' && Game.mode !== 'gazette') { Game.mode = 'play'; ui.talk.hidden = true; Game.talk = null; }
    let how = 'sleep';
    const cs = Cases.courtCase();
    if (cs && Game.mode === 'play') {
      how = 'court:' + cs; Court.start(cs);
      for (let i = 0; i < 3000 && Game.mode !== 'gazette'; i++) {
        if (Game.mode === 'talk') { const c = [...document.querySelectorAll('.choice')]; if (c.length) c[0].click(); else Input.press('a'); }
        if (Game.mode === 'objection') { const s = Objection.s; if (s && s.phase === 'show' && s.list[s.i].lie) Input.press('a'); }
        if (Game.mode === 'wrestle') { Input.press('a'); const w = Wrestle.w; if (w && w.prompt) Input.press(w.prompt); }
        if (Game.mode === 'mash') Input.press('a');
        step(1);
      }
    } else if (Game.mode === 'play') endDay('sleep');
    const reached = Game.mode === 'gazette';
    const credits = Game.flags.creditsPending;
    $('nextBtn').click(); if (!$('credits').hidden) $('creditsBtn').click();
    if (day === 29 && Game.flags.orlandoFrom !== 29) console.error('orlandoFrom=' + Game.flags.orlandoFrom + ' (want 29)');
    return { day, region, how, reached, credits, nextDay: Game.day, errs: errs0.slice(0, 3) };
  }, day);
  lines.push(`day ${String(res.day).padStart(2)} ${res.region.padEnd(7)} ${res.how.padEnd(12)} gazette=${res.reached}${res.credits ? ' credits=' + res.credits : ''} →day ${res.nextDay}${res.errs.length ? '  ERR ' + res.errs.join(' | ') : ''}`);
}
console.log(lines.join('\n')); console.log('page errors:', errs.length ? [...new Set(errs)].slice(0, 8) : 'none'); await b.close();
