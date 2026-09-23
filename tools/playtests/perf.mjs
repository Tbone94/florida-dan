import { chromium, devices } from '/Users/happycamper/Projects/_tools/record-kit/node_modules/playwright/index.mjs';
const rate = +(process.argv[2] || 4);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required', '--use-angle=metal'] });
const dev = { ...devices['Pixel 7 landscape'] }; delete dev.defaultBrowserType;
const ctx = await b.newContext(dev); const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate });
await p.goto('http://localhost:8811/index.html'); await p.waitForTimeout(2000);
const r = await p.evaluate(async () => {
  try { localStorage.clear(); } catch (e) {} begin(false);
  for (let i = 0; i < 40 && Game.mode !== 'play'; i++) { Input.press('a'); await new Promise(r => setTimeout(r, 120)); }
  const T = { update: 0, render: 0, hud: 0, music: 0 }, wrap = (o, k, key) => { const f = o[k]; o[k] = function () { const t = performance.now(); try { return f.apply(this, arguments); } finally { T[key] += performance.now() - t; } }; };
  wrap(window, 'update', 'update'); wrap(window, 'render', 'render'); wrap(window, 'hud', 'hud'); wrap(Sound, 'music', 'music');
  // walk around (hold right/down alternately) for 6 seconds and log rAF gaps
  const gaps = []; let last = performance.now(), run = true;
  const tick = now => { gaps.push(now - last); last = now; if (run) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  const kd = c => dispatchEvent(new KeyboardEvent('keydown', { code: c })), ku = c => dispatchEvent(new KeyboardEvent('keyup', { code: c }));
  for (const c of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']) { kd(c); await new Promise(r => setTimeout(r, 1000)); ku(c); }
  run = false; gaps.sort((a, b) => a - b);
  const n = gaps.length, avg = gaps.reduce((a, b) => a + b, 0) / n;
  return { frames: n, avgMs: avg.toFixed(1), p50: gaps[n >> 1].toFixed(1), p95: gaps[Math.floor(n * .95)].toFixed(1), fps: (1000 / avg).toFixed(0),
    perFrame: Object.fromEntries(Object.entries(T).map(([k, v]) => [k, (v / n).toFixed(2) + 'ms'])), canvas: screenCv.width + 'x' + screenCv.height, VW, mode: Game.mode };
});
console.log(`cpu x${rate}`, JSON.stringify(r)); await b.close();
