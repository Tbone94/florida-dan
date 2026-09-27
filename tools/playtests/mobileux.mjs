// the mobile pass (9/26): the use prompt floats over the target (never on the hotbar), touch buttons read A/B/X,
// flavor comments stay off screen while notes that matter still show, and the chunked tile cache draws exactly
// what the old every-tile path drew in every region.
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; try { localStorage.clear(); } catch (e) { } begin(false);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } }, bad = [];
  const rect = el => el.getBoundingClientRect(), overlap = (a, c) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
  if (!isTouch) bad.push('mobile context is not coarse-pointer');
  // touch buttons: console letters
  const lbl = id => $(id).firstChild.textContent.trim();
  if (lbl('btnA') !== 'A' || lbl('btnB') !== 'B' || lbl('btnF') !== 'X') bad.push(`touch buttons read ${lbl('btnA')}/${lbl('btnB')}/${lbl('btnF')}`);
  if (!/>A</.test(K('a')) || !/>B</.test(K('b')) || !/>X</.test(K('punch'))) bad.push('K() on touch: ' + K('a') + K('b') + K('punch'));
  for (let i = 0; i < 400 && Game.mode !== 'play'; i++) { step(20); if (Game.mode === 'talk') { const c = document.querySelector('.choice'); if (c) c.click(); else Input.press('a'); } }
  if (Game.mode !== 'play') bad.push('never got to play: ' + Game.mode);
  window.TRAILER = false;   // the real flavor-comment behavior from here on
  // prompt over Merle, clear of the hotbar
  const m = Game.npcs.find(n => n.id === 'merle'); Object.assign(Game.dan, { x: m.x + 16, y: m.y + 2, dir: 'left', ride: null }); step(30);
  if (ui.prompt.hidden || !/Talk to Merle/.test(ui.prompt.textContent)) bad.push('no Merle prompt: ' + ui.prompt.textContent);
  else {
    const pr = rect(ui.prompt), hb = rect(ui.hotbar), st = rect(stage);
    const cx = clamp(Game.cam.x, 0, MW * TS - VW), mx = st.left + (m.x - cx) / VW * st.width;
    if (overlap(pr, hb)) bad.push('prompt overlaps the hotbar');
    if (Math.abs((pr.left + pr.right) / 2 - mx) > 40) bad.push(`prompt not over Merle (${Math.round((pr.left + pr.right) / 2)} vs ${Math.round(mx)})`);
    if (!/>A</.test(ui.prompt.innerHTML)) bad.push('prompt key is not A');
    if (!$('btnA').classList.contains('ready')) bad.push('A button not glowing with a prompt up');
  }
  // prompt over the boat, and gone when nothing's near
  Object.assign(Game.dan, { x: Game.boat.x + 18, y: Game.boat.y - 16 }); step(20);
  if (/Board/.test(ui.prompt.textContent)) { const pr = rect(ui.prompt), st = rect(stage), bx = st.left + (Game.boat.x - clamp(Game.cam.x, 0, MW * TS - VW)) / VW * st.width; if (Math.abs((pr.left + pr.right) / 2 - bx) > 40) bad.push('boat prompt not over the boat'); }
  const far = { x: 30 * TS, y: 26 * TS }; let spot = null;
  for (let y = 10; y < 50 && !spot; y += 2) for (let x = 10; x < 80 && !spot; x += 2) { Object.assign(Game.dan, { x: x * TS + 8, y: y * TS + 8 }); if (canWalk(Game.dan.x, Game.dan.y) && !interaction()) spot = { x, y }; }
  step(10); if (spot && (!ui.prompt.hidden || $('btnA').classList.contains('ready'))) bad.push('prompt/A glow stuck on with nothing to use');
  // flavor stays off screen; notes show and clear
  toast('Dan smokes like a man with no plans.'); step(2); if (!ui.toast.hidden) bad.push('a flavor toast showed');
  note('Too slow. Talk to Tammy Jo to try again.'); step(2);
  if ($('note').hidden) bad.push('note did not show'); else { const nr = rect($('note')), hb = rect(ui.hotbar); if (overlap(nr, hb)) bad.push('note overlaps the hotbar'); if (rect($('note')).left < rect(stage).left + rect(stage).width * .2) bad.push('note is still on the left'); }
  step(60 * 4); if (!$('note').hidden) bad.push('note never cleared');
  Game.inv.beer = 5; Game.inv.fish = 0; let stolen = false;
  for (let i = 0; i < 20 && !stolen; i++) { const gt = Game.animals.find(a => a.type === 'gator'); const before = Game.inv.beer; gatorBite(gt, 1, 0, 1); if (Game.inv.beer < before) stolen = true; }
  if (stolen && !/Swamp Lite/.test($('note').textContent)) bad.push('stolen beer did not make a note');
  Game.flags.hints = {}; hint('test', 'tip'); if (ui.hint.parentElement.id !== 'tips') bad.push('hint is not in the top tip stack');
  // chunked ground == the old every-tile path, everywhere
  const home = Game.region, res = {};
  for (const reg of ['swamp', 'miami', 'daytona', 'keys', 'orlando']) {
    World.load(reg); let worst = 0;
    for (let cy = 0; cy <= MH * TS - VH; cy += 151) for (let cx = 0; cx <= MW * TS - VW; cx += 223) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      window.NO_TILE_CACHE = true; drawTiles(cx, cy, 2.5); const a = g.getImageData(0, 0, buf.width, buf.height).data;
      window.NO_TILE_CACHE = false; drawTiles(cx, cy, 2.5); const c = g.getImageData(0, 0, buf.width, buf.height).data;
      for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - c[i]); if (d > worst) worst = d; }
    }
    res[reg] = worst; if (worst > 2) bad.push(`tile cache differs in ${reg} (worst ${worst})`);
  }
  World.load(home);
  return { res, bad };
});
console.log(JSON.stringify(r)); errs.push(...r.bad);
await p.screenshot({ path: '/tmp/fd-mobileux.png' });
console.log('errors:', errs.length ? errs : 'none'); await b.close();
