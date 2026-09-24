// lawn flamingos: shop, plant, neighbor line, punch over, stand up, pull up, water refusal, survive travel + save/Continue
import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const SP = process.argv[2] || "/tmp";
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const out = await p.evaluate(() => { const log = [];
  window.TRAILER = true; try { localStorage.clear(); } catch (e) {} begin(false);
  const step = n => { for (let i = 0; i < n; i++) { Input.poll(); update(1 / 60); render(); hud(); Input.endFrame(); } };
  const talk = () => { for (let i = 0; i < 200 && Game.mode === 'talk'; i++) { step(8); Input.press('a'); step(1); } };
  talk(); Game.flags.noChase = true;
  // buy from the Gulp
  Game.money = 100; openShop('gulp'); log.push('gulp sells flamingo: ' + shopItems().includes('flamingo'));
  closeShop(); giveItem('flamingo', 6);
  const D = Game.dan, S = World.spots; D.x = S.door.x; D.y = S.door.y + 30; D.dir = 'down'; D.ride = null;
  step(2); log.push('hotbar slot shown: ' + !document.getElementById('slot-flamingo').classList.contains('empty'));
  Input.press('s13'); step(2);
  log.push('placed: ' + Game.flags.flamingos.length + ' toast: ' + ui.toast.textContent);
  D.x += 30; Input.press('s13'); step(2); D.x += 30; useItem('flamingo'); step(2); log.push('placed after 3: ' + Game.flags.flamingos.length + ' inv ' + Game.inv.flamingo);
  // same spot twice
  useItem('flamingo'); log.push('dup: ' + ui.toast.textContent);
  // near Merle
  const m = Game.npcs.find(n => n.id === 'merle'); D.x = m.x - 30; D.y = m.y; D.dir = 'right'; useItem('flamingo'); log.push('near merle: ' + ui.toast.textContent);
  // punch it
  punch(); step(2); log.push('punched down: ' + Game.flags.flamingos.at(-1).down + ' headline Q: ' + Game.headlines.map(h => h.text).filter(t => /FLAMINGO/.test(t)).join(' || '));
  Game.punchCd = 0; let ix = interaction(); log.push('prompt on downed: ' + (ix && ix.label)); ix.fn(); ix = interaction(); log.push('prompt after stand: ' + (ix && ix.label)); ix.fn(); log.push('after pull-up: ' + Game.flags.flamingos.length + ' inv ' + Game.inv.flamingo);
  // water
  D.x = S.dockEnd.x; D.y = S.dockEnd.y; D.dir = 'right'; useItem('flamingo'); log.push('water: ' + ui.toast.textContent);
  // travel + back, props rebuilt
  const cnt = () => World.props.filter(p => p.placed).length;
  log.push('swamp props: ' + cnt()); World.load('miami'); log.push('miami props: ' + cnt()); World.load('swamp'); log.push('back in swamp: ' + cnt());
  save(); const saved = JSON.parse(localStorage.getItem(SAVE_KEY)).flags.flamingos; log.push('saved: ' + (saved && saved.length));
  Game.flags = {}; Flamingos.sync(); log.push('wiped: ' + cnt()); begin(true); talk(); log.push('after Continue: ' + cnt());
  D.x = S.door.x + 20; D.y = S.door.y + 40; Game.mode = 'play'; step(3);
  return log; });
console.log(out.join('\n'));
const want = ['gulp sells flamingo: true', 'hotbar slot shown: true', 'placed after 3: 3 inv 3', 'near merle: MERLE', 'punched down: 1', 'prompt on downed: Stand', 'prompt after stand: Pull up', 'after pull-up: 3 inv 3', 'miami props: 0', 'back in swamp: 3', 'saved: 3', 'after Continue: 3'];
for (const w of want) if (!out.some(l => l.startsWith(w))) errs.push('expected: ' + w);
await p.waitForTimeout(300); await p.screenshot({ path: `${SP}/flam.png` });
console.log('errors:', errs.length ? errs : 'none'); await b.close();
