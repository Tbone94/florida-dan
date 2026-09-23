import { chromium, devices } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const mobile = process.argv[2] !== 'desktop';
const dev = mobile ? { ...devices['Pixel 7 landscape'] } : { viewport: { width: 1280, height: 720 } }; delete dev.defaultBrowserType;
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext(dev); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} begin(false); Game.day = 4; startDay(); ui.talk.hidden = true; Game.talk = null; Game.mode = 'play'; Court.start('flamingo'); });
const log = [];
// sit through the trial like a player: tap the dialogue box, pick the first choice when offered
for (let i = 0; i < 200; i++) {
  const st = await p.evaluate(() => ({ mode: Game.mode, choices: document.querySelectorAll('.choice').length }));
  if (st.mode === 'wrestle') break;
  if (st.choices) await p.click('.choice'); else if (mobile) await p.tap('#talk').catch(() => {}); else await p.keyboard.press('e');
  await p.waitForTimeout(90);
}
log.push('reached: ' + await p.evaluate(() => Game.mode) + (mobile ? ' | touch controls visible: ' + await p.evaluate(() => !ui.pad.hidden) : ''));
let bx = 0, by = 0;
if (mobile) { const r = await p.evaluate(() => { const b = $('btnA').getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2; return { x, y, hit: document.elementFromPoint(x, y).id }; }); bx = r.x; by = r.y; log.push('element under the E button spot: #' + r.hit); }
// wrestle: mash the real E button (tap on phone, key on desktop) and hit the arrows it asks for
for (let i = 0; i < 400; i++) {
  const s = await p.evaluate(() => ({ mode: Game.mode, prompt: Wrestle.w && Wrestle.w.prompt }));
  if (s.mode !== 'wrestle') break;
  if (s.prompt) await p.keyboard.press({ up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[s.prompt]);
  if (mobile) await p.touchscreen.tap(bx, by); else await p.keyboard.press('e');
  await p.waitForTimeout(40);
}
log.push('after fight: ' + await p.evaluate(() => Game.mode + ' / flags.acquitted=' + !!Game.flags.acquitted));
for (let i = 0; i < 60; i++) { const m = await p.evaluate(() => Game.mode); if (m === 'gazette') break; if (mobile) await p.tap('#talk').catch(() => {}); else await p.keyboard.press('e'); await p.waitForTimeout(90); }
log.push('ended at: ' + await p.evaluate(() => Game.mode + ' / acquitted=' + !!Game.flags.acquitted + ' / touch controls hidden again=' + ui.pad.hidden));
console.log((mobile ? 'PHONE ' : 'DESKTOP ') + log.join('\n')); console.log('errors:', errs.length ? errs : 'none'); await b.close();
