import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} begin(false); Game.day = 3; startDay(); });
for (let i = 0; i < 40 && await p.evaluate(() => Game.mode !== 'play'); i++) { await p.keyboard.press('e'); await p.waitForTimeout(80); }
await p.evaluate(() => { Game.hour = 9; Story.merle(); });
let picked = false;
for (let i = 0; i < 40; i++) {
  if (!picked && await p.evaluate(() => document.querySelectorAll('.choice').length)) { await p.click('.choice'); picked = true; }
  else await p.keyboard.press('e');
  await p.waitForTimeout(80);
  if (await p.evaluate(() => Game.flags.party)) break;
}
console.log(await p.evaluate(() => `party started: ${!!Game.flags.party} | clock: ${clock()} | storm: ${Game.storm.toFixed(2)} | talking: ${ui.talkWho.textContent} "${Game.talk && Game.talk.full}"`));
console.log('quest text:', await p.evaluate(() => (Game.quests.find(q => q.id === 'party') || {}).text));
console.log('errors:', errs.length ? errs : 'none'); await b.close();
