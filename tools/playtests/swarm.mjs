import { chromium } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  window.TRAILER = true; const res = [];
  for (let run = 0; run < 3; run++) {
    begin(false); ui.talk.hidden = true; Game.talk = null; Game.mode = 'play'; Game.flags.noChase = true;
    Game.inv.beer = 20; Game.inv.hotdog = 5; Game.hour = 9;
    let raids = 0, s = run * 97 + 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const orig = toast; window.toast = (m, t) => { if (/Raccoon snatched/.test(m)) raids++; return orig(m, t); };
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']; let held = null;
    for (let f = 0; f < 30 * 120; f++) {
      if (f % 45 === 0) { if (held) dispatchEvent(new KeyboardEvent('keyup', { code: held })); held = keys[Math.floor(rnd() * 4)]; dispatchEvent(new KeyboardEvent('keydown', { code: held })); }
      if (Game.mode === 'talk') { Input.press('a'); } if (Game.mode !== 'play' && Game.mode !== 'talk') Game.mode = 'play';
      Input.poll(); update(1 / 30); Input.endFrame(); Game.chill = 100; Game.hour = 9 + f / 30 / 60;
    }
    if (held) dispatchEvent(new KeyboardEvent('keyup', { code: held }));
    window.toast = orig; res.push(`raids ${raids}, gator bites ${Game.day_.bites}`);
  }
  return res.join(' | ');
});
console.log(r); await b.close();
