// FLORIDA DAN — the "Action News 6" trailer cut (trailer.html?cut=news).
// Same real gameplay, framed as a local news segment: chyrons, a ticker of real in-game headlines,
// and a few shots dressed as found footage (doorbell cam, security cam, bodycam, trail cam, phone video, news chopper).
'use strict';
(() => {
if (!/cut=news/.test(location.search)) return;

// ---------- look ----------
const css = `
  #nw { position: absolute; inset: 0; z-index: 9; pointer-events: none; font-family: 'Oswald', var(--display); }
  #nw [hidden] { display: none !important; }
  #nwPhone { position: absolute; inset: 0; width: 100%; height: 100%; }
  #nwBug { position: absolute; right: 44px; bottom: 96px; display: flex; align-items: stretch; box-shadow: 0 6px 18px rgba(0,0,0,.45); }
  #nwBug .six { background: linear-gradient(#1d4fb8, #0b2a6f); color: #fff; font: 700 54px/1 'Oswald'; padding: 6px 16px 8px; border: 3px solid #fff; border-right: 0; }
  #nwBug .nm { background: #fff; color: #0b1f4b; font: 700 22px/1.05 'Oswald'; padding: 9px 14px 0; letter-spacing: .06em; text-align: left; }
  #nwBug .nm i { display: block; font-style: normal; color: #fff; background: #d7263d; font-size: 18px; padding: 2px 8px; margin-top: 5px; text-align: center; }
  #nwL3 { position: absolute; left: 56px; bottom: 92px; width: 1330px; }
  #nwL3 .kick { display: inline-block; background: #d7263d; color: #fff; font: 700 30px/1 'Oswald'; letter-spacing: .08em; padding: 9px 18px 10px; }
  #nwL3 .main { background: #fff; color: #0b1f4b; font: 700 58px/1.02 'Oswald'; text-transform: uppercase; padding: 12px 22px 14px; border-left: 12px solid #d7263d; box-shadow: 0 8px 22px rgba(0,0,0,.4); }
  #nwL3 .sub { display: inline-block; background: #0b1f4b; color: #ffd23f; font: 500 26px/1 'Oswald'; letter-spacing: .1em; padding: 9px 18px 10px; text-transform: uppercase; }
  #nwTick { position: absolute; left: 0; right: 0; bottom: 0; height: 62px; background: #0b1f4b; border-top: 4px solid #ffd23f; overflow: hidden; display: flex; align-items: center; }
  #nwTick b { position: relative; z-index: 2; height: 100%; display: grid; place-items: center; background: #ffd23f; color: #0b1f4b; font: 700 26px 'Oswald'; letter-spacing: .08em; padding: 0 22px; }
  #nwTick .crawl { position: absolute; left: 0; white-space: nowrap; color: #fff; font: 500 30px 'Oswald'; letter-spacing: .03em; }
  #nwTick .crawl span { color: #ffd23f; margin: 0 26px; }
  #nwCam { position: absolute; inset: 0; font: 400 40px 'Share Tech Mono', monospace; color: #fff; text-shadow: 2px 2px 0 #000, 0 0 8px rgba(0,0,0,.6); }
  #nwCam .tl { position: absolute; left: 70px; top: 54px; } #nwCam .tr { position: absolute; right: 70px; top: 54px; } #nwCam .bl { position: absolute; left: 70px; top: 112px; }
  #nwCam .dot { display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: #ff3b3b; margin-right: 12px; vertical-align: -1px; }
  #nwCam .scan { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, transparent 2px 5px); }
  #nwCam .strip { position: absolute; left: 0; right: 0; top: 0; height: 64px; background: #000; display: flex; justify-content: space-between; align-items: center; padding: 0 40px; font-size: 34px; color: #eee; text-shadow: none; }
  #nwCam .reticle { position: absolute; width: 150px; height: 150px; border: 4px solid rgba(255,255,255,.9); box-shadow: 0 0 0 2px rgba(0,0,0,.5); }
  #nwCam .reticle::before, #nwCam .reticle::after { content: ''; position: absolute; background: #fff; left: 50%; top: -40px; width: 3px; height: 30px; transform: translateX(-50%); }
  #nwCam .reticle::after { top: auto; bottom: -40px; }
  #nwCam .live { background: #d7263d; padding: 2px 14px; margin-left: 14px; font-family: 'Oswald'; font-weight: 700; }
  #nwPhoneUI { position: absolute; left: 656px; width: 608px; top: 0; height: 1080px; font: 600 34px system-ui, -apple-system, sans-serif; color: #fff; }
  #nwPhoneUI .top { position: absolute; left: 22px; right: 22px; top: 26px; display: flex; gap: 12px; align-items: center; text-shadow: 0 1px 4px #000; }
  #nwPhoneUI .top .lv { background: #ff2d55; padding: 4px 14px; border-radius: 6px; font-weight: 800; font-size: 30px; }
  #nwPhoneUI .top .vw { margin-left: auto; background: rgba(0,0,0,.45); padding: 4px 14px; border-radius: 6px; font-size: 30px; }
  #nwPhoneUI .cm { position: absolute; left: 22px; max-width: 470px; background: rgba(0,0,0,.42); border-radius: 24px; padding: 12px 20px; font-size: 32px; line-height: 1.2; }
  #nwPhoneUI .cm b { color: #9fd3ff; margin-right: 8px; font-weight: 700; }
  #nwGfx { position: absolute; inset: 0; }
  #nwGfx .ident { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 45%, #2a68e0 0%, #0b2a6f 55%, #050f2c 100%); display: grid; place-items: center; overflow: hidden; }
  #nwGfx .ident .logo { display: flex; align-items: center; gap: 34px; }
  #nwGfx .ident .six { width: 250px; height: 250px; border: 12px solid #fff; border-radius: 30px; display: grid; place-items: center; font: 700 220px/1 'Oswald'; color: #fff; background: linear-gradient(#d7263d, #8e1022); box-shadow: 0 20px 60px rgba(0,0,0,.5); }
  #nwGfx .ident .words { font: 700 150px/.9 'Oswald'; color: #fff; letter-spacing: .02em; text-shadow: 0 10px 40px rgba(0,0,0,.5); }
  #nwGfx .ident .words small { display: block; font: 500 40px 'Oswald'; letter-spacing: .3em; color: #ffd23f; margin-top: 18px; }
  #nwGfx .ident .shine { position: absolute; top: -20%; bottom: -20%; width: 260px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent); transform: skewX(-18deg); }
  #nwGfx .panel { position: absolute; right: 60px; top: 150px; width: 560px; background: rgba(11,31,75,.94); border-top: 10px solid #d7263d; padding: 26px 30px 30px; box-shadow: 0 16px 40px rgba(0,0,0,.5); color: #fff; }
  #nwGfx .panel h3 { margin: 0 0 18px; font: 700 34px/1.05 'Oswald'; letter-spacing: .04em; text-transform: uppercase; }
  #nwGfx .panel .bar { height: 46px; background: #fff; border: 4px solid #fff; } #nwGfx .panel .bar i { display: block; height: 100%; background: repeating-linear-gradient(90deg, #d7263d 0 16px, #ff5a5a 16px 32px); }
  #nwGfx .panel .pct { font: 700 110px/1 'Oswald'; color: #ffd23f; margin-top: 14px; } #nwGfx .panel .src { font: 400 22px 'Oswald'; letter-spacing: .12em; color: #9fb4e8; }
  #nwGfx .map { position: absolute; inset: 0; background: radial-gradient(ellipse at 60% 50%, #173b86 0%, #0b1f4b 70%); }
  #nwGfx .map h2 { position: absolute; left: 80px; top: 80px; margin: 0; width: 560px; font: 700 70px/1 'Oswald'; color: #fff; letter-spacing: .03em; }
  #nwGfx .map h2 small { display: block; font: 500 34px 'Oswald'; color: #ffd23f; letter-spacing: .14em; margin-top: 12px; }
  #nwGfx .map svg { position: absolute; left: 700px; top: 70px; height: 940px; }
  #nwGfx .mug { position: absolute; inset: 0; background: #cfd6dc; overflow: hidden; }
  #nwGfx .mug .chart { position: absolute; inset: 0; background: repeating-linear-gradient(180deg, transparent 0 58px, #7b8791 58px 62px); }
  #nwGfx .mug .chart span { position: absolute; left: 36px; font: 700 34px 'Oswald'; color: #4b5560; }
  #nwGfx .mug img { position: absolute; left: 50%; bottom: 150px; height: 820px; image-rendering: pixelated; transform: translateX(-50%); }
  #nwGfx .mug .board { position: absolute; left: 50%; bottom: 60px; transform: translateX(-50%); background: #111; color: #fff; border: 8px solid #333; padding: 14px 40px 18px; text-align: center; min-width: 760px; }
  #nwGfx .mug .board .co { font: 700 32px 'Oswald'; letter-spacing: .14em; color: #bbb; } #nwGfx .mug .board .ch { font: 700 60px/1.05 'Oswald'; text-transform: uppercase; }
  #nwGfx .mug .board .no { font: 400 28px 'Share Tech Mono', monospace; color: #ffd23f; margin-top: 6px; }
  #nwGfx .flash { position: absolute; inset: 0; background: #fff; }
`;
const st = document.createElement('style'); st.textContent = css; document.head.append(st);
const fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Share+Tech+Mono&display=swap'; document.head.append(fl);
const root = document.createElement('div'); root.id = 'nw';
root.innerHTML = `<canvas id="nwPhone" width="1920" height="1080" hidden></canvas><div id="nwPhoneUI" hidden></div><div id="nwCam" hidden></div><div id="nwGfx" hidden></div>
  <div id="nwBug" hidden><div class="six">6</div><div class="nm">ACTION<br>NEWS<i>LIVE</i></div></div>
  <div id="nwL3" hidden><div class="kick"></div><div class="main"></div><div class="sub"></div></div>
  <div id="nwTick" hidden><b>SWAMP GAZETTE</b><div class="crawl"></div></div>`;
stage.append(root);
const E = id => document.getElementById(id);

// real headlines from the game, for the ticker
const TICK = ['FLORIDA MAN STRUCK BY FROZEN IGUANA, CALLS IT "A SIGN FROM GOD"', 'PELICAN STEALS FLORIDA MAN’S FISH, FLIES OFF "LAUGHING"', 'RACCOON ROBS FLORIDA MAN IN BROAD DAYLIGHT; POLICE "NOT INVOLVED"',
  'MANATEE TESTIFIES IN COURT; FLORIDA MAN ACQUITTED, ALLIGATOR CHARGED INSTEAD', 'FLORIDA MAN BUYS LETTUCE AT GAS STATION; CLERK "SHOOK"', 'FLORIDA MAN SHARES BEER WITH SKUNK APE; "HE’S A GOOD LISTENER"',
  'FLORIDA MAN BUYS PASTEL SUIT, IMMEDIATELY SPILLS CAFECITO ON IT', 'FLORIDA MAN ARM-WRESTLES BIKER NAMED "TINY" FOR A DONUT SIGN, WINS', 'FLORIDA MAN CLEARED OF "RECKLESS PACING"; JUDGE "HUNGRY NOW"',
  'FLORIDA MAN CHANGES FOUR TIRES IN RECORD TIME, IS NOT ON ANY PIT CREW', 'FLORIDA MAN BITTEN BY GATORS THREE TIMES IN ONE DAY, SAYS HE "HAD IT HANDLED"'];
E('nwTick').querySelector('.crawl').innerHTML = TICK.concat(TICK).map(h => `${h}<span>●</span>`).join('');

// ---------- the news package, driven per frame ----------
const N = { l3: null, cam: null, T: 0 };
const pad2 = n => String(Math.floor(n)).padStart(2, '0');
function l3(kick, main, sub, T) { N.l3 = { kick, main, sub: sub || '', t0: T }; const el = E('nwL3'); el.hidden = false; el.querySelector('.kick').textContent = kick; const m = el.querySelector('.main'); m.textContent = main; m.style.fontSize = ''; el.style.clipPath = 'none'; for (let fs = 58; m.scrollHeight > fs * 1.35 && fs > 38; fs -= 2) m.style.fontSize = (fs - 2) + 'px'; el.querySelector('.sub').textContent = sub || ''; el.querySelector('.sub').hidden = !sub; }
function l3off() { N.l3 = null; E('nwL3').hidden = true; }
function chrome(on) { E('nwBug').hidden = E('nwTick').hidden = !on; }
Trailer.onHeadline = (text, T) => { const sh = N.shot; if (sh && sh.o.hl === false) return; l3('BREAKING', text.replace(/"/g, '”').replace(/”([^”]*)”/g, '“$1”'), sh && sh.o.hlSub, T); };

function camOverlay(kind, T) {
  const el = E('nwCam'); if (!kind) { el.hidden = true; el.innerHTML = ''; N.camKind = null; return; }
  el.hidden = false;
  const s = 13 + T, clock = (h, m) => `${pad2(h)}:${pad2(m + Math.floor(s / 60))}:${pad2(s % 60)}`;
  const blink = Math.floor(T * 2) % 2 === 0;
  if (kind === 'door') el.innerHTML = `<div class="tl">FRONT DOOR</div><div class="tr">09-19-2026 &nbsp;${clock(11, 47)} PM</div><div class="bl">${blink ? '<i class="dot"></i>' : '<i class="dot" style="opacity:0"></i>'}MOTION DETECTED</div>`;
  if (kind === 'sec') el.innerHTML = `<div class="scan"></div><div class="tl">CAM 02 · GULP-N-GO LOT</div><div class="tr">${blink ? '<i class="dot"></i>' : '<i class="dot" style="opacity:0"></i>'}REC &nbsp;${clock(19, 18)}</div>`;
  if (kind === 'trail') el.innerHTML = `<div class="strip"><span>TRAILCAM-2</span><span>◐ &nbsp;41°F</span><span>${clock(3, 12)} AM</span><span>09/21/2026</span></div>`;
  if (kind === 'body') el.innerHTML = `<div class="tr" style="text-align:right">BODYCAM · DEPUTY R. · UNIT 7<br>2026-09-20 T${clock(13, 4)}.${pad2((T * 100) % 100)}</div>`;
  if (kind === 'chopper') el.innerHTML = `<div class="tl">NEWS CHOPPER 6<span class="live">LIVE</span><br><span style="font-size:30px">ALT 1,200 FT · DAYTONA BEACH</span></div><div class="reticle"></div>`;
}
// after the frame is drawn: phone crop + chopper reticle
function post() {
  const sh = N.shot; if (!sh) return;
  if (sh.o.dayLabel) { ui.dayLabel.textContent = sh.o.dayLabel; ui.dayLabel._v = sh.o.dayLabel; }
  if (sh.o.phone) {
    const c = E('nwPhone'), x = c.getContext('2d'), sc = screenCv, W = 1920, H = 1080, w = 608;
    x.filter = 'blur(28px) brightness(.55)'; x.drawImage(sc, 0, 0, sc.width, sc.height, -60, -60, W + 120, H + 120); x.filter = 'none';
    const sw = sc.width * w / W; x.drawImage(sc, (sc.width - sw) / 2, 0, sw, sc.height, (W - w) / 2, 0, w, H);
  }
  if (sh.o.track) {
    const p = sh.o.track(); const r = E('nwCam').querySelector('.reticle');
    if (p && r) { const [sx, sy] = worldToScreen(p.x, p.y), v = Game.view || [0, 0, 1], X = (sx / VW - v[0]) / v[2] * 1920, Y = (sy / VH - v[1]) / v[2] * 1080; r.style.left = (X - 75) + 'px'; r.style.top = (Y - 75) + 'px'; }
  }
}
const _hud = hud; hud = function () { _hud(); post(); };

function tick(T, lt, o) {
  N.T = T;
  if (o.cam) camOverlay(o.cam, T);
  if (o.l3 && lt >= o.l3[0] && (!N.l3 || N.l3.src !== o)) { l3(o.l3[1], o.l3[2], o.l3[3], T); N.l3.src = o; }
  // lower-third wipe-in
  if (N.l3) { const k = ease((T - N.l3.t0) / .28), el = E('nwL3'); el.style.clipPath = `inset(0 ${(100 - k * 100).toFixed(1)}% 0 0)`; }
  // ticker: always crawling, in whole pixels
  const cr = E('nwTick').querySelector('.crawl'); cr._w = cr._w || cr.scrollWidth / 2; cr.style.transform = `translateX(${Math.round(260 - (T * 150) % cr._w)}px)`;
  if (o.talk !== true) ui.talk.hidden = true;
  ui.toast.hidden = true;
  if (o.hud) { ui.hudTop.hidden = false; $('heat').hidden = !(Game.heat > 0); }
  if (o.cam) ui.hudTop.hidden = true;   // found footage has no game HUD
  if (o.phone) {   // DJ Flamingo is filming his own car
    const cms = [['djflamingo_official', 'MY CAR 😭😭😭'], ['sk8raul', 'bro parked it IN THE OCEAN 💀'], ['abuela.eats', 'ay dios mío'], ['kayden.klips', 'is that the florida man??'], ['tampa_tom', 'florida is undefeated 🦩']];
    E('nwPhoneUI').innerHTML = `<div class="top"><span class="lv">LIVE</span><span>@djflamingo_official</span><span class="vw">👁 ${(48.2 + lt * 3.1).toFixed(1)}K</span></div>` +
      cms.map(([u, m], i) => { const k = lt - .5 - i * .5; if (k < 0) return ''; const y = 1080 - 130 - (cms.filter((_, j) => lt - .5 - j * .5 >= 0).length - 1 - i) * 92; return `<div class="cm" style="top:${y}px;opacity:${Math.min(1, k * 5)}"><b>${u}</b>${m}</div>`; }).join('');
  }
}

// ---------- shots ----------
const V1s = Trailer.V1s, V2 = Trailer.V2;
function shot(id, src, o) {
  src = src || {};
  return { id, _o: o, dur: o.dur || src.dur, sim: o.sim !== undefined ? o.sim : src.sim, frozen: o.frozen || src.frozen,
    setup() {
      l3off(); camOverlay(null); E('nwGfx').hidden = true; E('nwGfx').innerHTML = ''; E('nwPhone').hidden = E('nwPhoneUI').hidden = !o.phone;
      if (src.setup) src.setup(); else base();
      N.shot = { o }; chrome(o.chrome !== false); Game.dan.idleT = 0;   // no dozing 'z' carried over from earlier shots
      if (o.setup) o.setup(); Game.lens = o.lens || 0; Game.camFx = o.camFx || 0; if (o.gfx) { E('nwGfx').hidden = false; E('nwGfx').innerHTML = o.gfx; }
    },
    step(lt, dt) { if (src.step) src.step(lt, dt); if (o.step) o.step(lt, dt); },
    after(lt, dt) { if (src.after) src.after(lt, dt); if (o.after) o.after(lt, dt); tick(this.start + lt, lt, o); },
    end() { if (src.end) src.end(); if (o.end) o.end(); },
  };
}
const setStill = () => { if (Game.mode !== 'play') return; };

// the Florida map (lon/lat traced by hand, 60px per degree of longitude)
const FL = [[0, 0], [156, 0], [162, 20], [324, 29], [342, 20], [369, 20], [372, 48], [378, 75], [396, 122], [420, 177], [432, 231], [453, 292], [447, 354], [432, 388], [390, 401], [372, 350], [348, 330], [339, 299], [309, 265], [291, 231], [288, 194], [273, 126], [252, 88], [204, 65], [156, 88], [135, 90], [114, 58], [66, 42], [24, 44], [6, 49]];
const PINS = { swamp: [376, 336, 'THE SWAMP'], miami: [447, 356, 'MIAMI'], daytona: [396, 122, 'DAYTONA BEACH'] };
function mapGfx(from, to, title, sub) {
  const pin = ([x, y, n], k) => `<g class="pin" data-k="${k}"><circle cx="${x}" cy="${y}" r="9" fill="#ffd23f" stroke="#0b1f4b" stroke-width="3"/><text x="${x + (k === 'miami' ? 16 : -16)}" y="${y + 6}" text-anchor="${k === 'miami' ? 'start' : 'end'}" font-family="Oswald" font-weight="700" font-size="22" fill="#fff" stroke="#0b1f4b" stroke-width="5" paint-order="stroke">${n}</text></g>`;
  const [ax, ay] = PINS[from], [bx, by] = PINS[to], mx = (ax + bx) / 2 + (to === 'daytona' ? 70 : 0), my = (ay + by) / 2 - (to === 'daytona' ? 0 : 60);
  return `<div class="map"><h2>${title}<small>${sub}</small></h2><svg viewBox="-20 -20 600 460">
    <polygon points="${FL.map(p => p.join(',')).join(' ')}" fill="#2f6fd0" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
    ${[[432, 394], [415, 404], [398, 413], [380, 422], [362, 430], [348, 436]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#2f6fd0" stroke="#fff" stroke-width="2"/>`).join('')}
    <path id="nwRoute" d="M${ax},${ay} Q${mx},${my} ${bx},${by}" fill="none" stroke="#ffd23f" stroke-width="7" stroke-linecap="round" stroke-dasharray="1000" stroke-dashoffset="1000"/>
    ${pin(PINS[from], from)}${pin(PINS[to], to)}</svg></div>`;
}
function mapAnim(lt) { const r = document.getElementById('nwRoute'); if (!r) return; const L = r.getTotalLength(); r.setAttribute('stroke-dasharray', `${L}`); r.setAttribute('stroke-dashoffset', `${(L * (1 - ease((lt - .25) / .9))).toFixed(1)}`); }

// mugshots: front, profile, front... one per case
const MUGS = [['COLLIER COUNTY', 'THE FLAMINGO INCIDENT'], ['COLLIER COUNTY', 'UNLAWFUL MANATEE OPERATION'], ['COLLIER COUNTY', 'IMPERSONATING A CRYPTID'], ['MIAMI-DADE', 'GRAND THEFT LAMBO'], ['MIAMI-DADE', 'INTENT TO CLEAR SINUSES'], ['VOLUSIA COUNTY', 'RECKLESS PACING'], ['VOLUSIA COUNTY', 'UNAUTHORIZED BURNOUTS']];
const sprURL = k => { const s = SPR.dan[k][0]; return s.toDataURL ? s.toDataURL() : s.src; };
function mugGfx() { return `<div class="mug"><div class="chart">${[6.5, 6, 5.5, 5, 4.5].map((h, i) => `<span style="top:${40 + i * 124}px">${Math.floor(h)}'${h % 1 ? '6' : '0'}"</span>`).join('')}</div><img alt=""><div class="board"><div class="co"></div><div class="ch"></div><div class="no"></div></div><div class="flash"></div></div>`; }
function mugAnim(lt) {
  const i = Math.min(MUGS.length - 1, Math.floor(lt / .42)), k = lt - i * .42, g = E('nwGfx');
  const img = g.querySelector('img'), want = sprURL(i % 2 ? 'right' : 'down'); if (img._k !== want) { img._k = want; img.src = want; }
  g.querySelector('.co').textContent = MUGS[i][0] + ' SHERIFF'; g.querySelector('.ch').textContent = MUGS[i][1]; g.querySelector('.no').textContent = `CASE #${i + 1} · DUPREE, DANIEL · DOB 03-14-1982`;
  g.querySelector('.flash').style.opacity = Math.max(0, 1 - k / .12).toFixed(2);
}

const SH = [
  // 0. cold open: the doorbell cam catches Dan riding the cooler past the cabin at midnight
  shot('doorbell', null, { dur: 3.0, cam: 'door', lens: .9, camFx: 1, chrome: false, hl: false,
    setup() {
      base({ hour: 23.3 }); const D = Game.dan, d = World.spots.door;
      Object.assign(D, { x: d.x, y: d.y + 120, dir: 'up', ride: 'cooler' }); Object.assign(Game.cooler, { x: D.x, y: D.y, dir: 'up' });
      Game.fx.buzz = 30; Game.npcs = Game.npcs.filter(n => n.id !== 'tourist'); Game.animals = Game.animals.filter(a => Math.hypot(a.x - d.x, a.y - d.y) > 160);
    },
    after(lt) {
      const d = World.spots.door, D = Game.dan, k = ease(lt / 1.5);
      D.x = d.x; D.y = lerp(d.y + 120, d.y + 34, k); D.dir = lt < 1.6 ? 'up' : 'down'; D.moving = lt < 1.5; Object.assign(Game.cooler, { x: D.x, y: D.y, dir: 'up' });
      if (at(lt, 1.9, 'beer')) { D.ride = null; D.y += 2; useItem('beer'); }
      camOn(d.x, d.y + 50, 1.75);
    } }),
  // 1. the station ident
  shot('ident', null, { dur: 1.5, sim: false, chrome: false,
    gfx: '<div class="ident"><div class="shine"></div><div class="logo"><div class="six">6</div><div class="words">ACTION<br>NEWS<small>COVERING THE SWAMP. UNFORTUNATELY.</small></div></div></div>',
    after(lt) { const g = E('nwGfx'), l = g.querySelector('.logo'), sh = g.querySelector('.shine'); l.style.transform = `scale(${(1.25 - .25 * ease(lt / .3)).toFixed(3)})`; l.style.opacity = Math.min(1, lt / .12); sh.style.left = `${-300 + lt * 1900}px`; } }),
  // 2. what the game is
  shot('premise', V1s('cozy'), { dur: 3.0, hud: true, hl: false, dayLabel: 'MON · DAY 1', l3: [.15, 'DEVELOPING', 'HE HAS 4 DAYS TO PROVE HE’S NOT A “FLORIDA MAN”', 'DAN DUPREE, 44 · COLLIER COUNTY'] }),
  shot('fish', V1s('fish'), { dur: 2.5, hl: false, l3: [.1, 'EXCLUSIVE', 'SOURCES SAY HE WAS “JUST FISHING”'] }),
  shot('wrestle', V1s('wrestle'), { dur: 2.5, hl: false, l3: [.1, 'CAUGHT ON CAMERA', 'WITNESSES: “A DISAGREEMENT BETWEEN FRIENDS”'] }),
  // 3. everything makes the news
  shot('meter', V1s('drunk'), { dur: 3.0, hud: true, hl: false, dayLabel: 'TUE · DAY 2', l3: [.1, 'DEVELOPING', 'EVERYTHING HE DOES MAKES THE NEWS'],
    gfx: '<div class="panel"><h3>Florida Man<br>Allegation Meter</h3><div class="bar"><i></i></div><div class="pct">12%</div><div class="src">SOURCE: SWAMP GAZETTE</div></div>',
    after(lt) { const k = ease((lt - .4) / 2.1), p = Math.round(12 + k * 82); E('nwGfx').querySelector('.bar i').style.width = p + '%'; E('nwGfx').querySelector('.pct').textContent = p + '%'; } }),
  shot('security', V1s('fireworks'), { dur: 2.5, cam: 'sec', camFx: 1, lens: .25, hlSub: 'CAM 02 · GULP-N-GO' }),
  shot('bodycam', V2.chase, { dur: 3.5, cam: 'body', camFx: 3, lens: .55, hlSub: 'DEPUTY BODYCAM',
    after(lt) { const v = Game.view; if (v) { v[0] += Math.sin(lt * 23) * .004; v[1] += Math.sin(lt * 17 + 1) * .005; } } }),
  shot('trailcam', V2.skunk, { dur: 2.5, cam: 'trail', camFx: 2, hl: false, l3: [.3, 'EXCLUSIVE', 'IS THE DEFENDANT A SKUNK APE?', 'TRAIL CAM FOOTAGE'] }),
  shot('court', V2.objection, { dur: 3.0, hl: false, l3: [.2, 'LIVE', 'IN COURT, DAN OBJECTS TO “EVERYTHING”', 'COLLIER COUNTY COURTHOUSE'] }),
  // 4. then Miami
  shot('map1', null, { dur: 2.0, sim: false, chrome: false, gfx: mapGfx('swamp', 'miami', 'DAN’S WHEREABOUTS', 'HE GOT ON A GREYHOUND'), after: mapAnim }),
  shot('phone', V2.lambo, { dur: 3.5, phone: true, chrome: false, hl: false }),
  shot('dance', V2.dance, { dur: 2.0, hl: false, l3: [.1, 'MIAMI', 'CLUB CONFIRMS DANCE-OFF “HAPPENED”'] }),
  shot('boat', V2.boat, { dur: 2.0, hl: false, l3: [.1, 'BREAKING', 'HIGH-SPEED BOAT CHASE OFF SOUTH BEACH'] }),
  // 5. then Daytona
  shot('map2', null, { dur: 1.5, sim: false, chrome: false, gfx: mapGfx('miami', 'daytona', 'DAN’S WHEREABOUTS', 'NOW: DAYTONA BEACH'), after: mapAnim }),
  shot('convoy', null, { dur: 3.5, cam: 'chopper', hl: false, l3: [.5, 'LIVE', '40 RACE CARS FOLLOW FLORIDA MAN THROUGH DONUT DRIVE-THRU'],
    track: () => Game.car,
    setup() {
      base({ region: 'daytona', day: 17, hour: 11 }); const D = Game.dan, dr = World.spots.drive;
      const y = T_.ry = convoyRoadY(), x1 = dr.x - 10, x0 = x1 - 150;
      const v = { kind: 'car', id: 'pace', x: x0, y, a: 0, v: 0, c: PAL.white, c2: PAL.red, num: 0 }; Game.vehicles = [v]; Car.enter(v);
      Convoy.on = true; Convoy.hist = []; for (let x = x0 - 300; x <= x0; x += 2) Convoy.hist.push({ x, y, a: 0 });
      T_.x0 = x0; T_.x1 = x1;
    },
    step() { },
    after(lt) { const v = Game.car; if (!v) return; v.x = lerp(T_.x0, T_.x1, Math.min(1, lt / 3.2)); v.y = T_.ry; v.a = 0; v.v = 40; Object.assign(Game.dan, { x: v.x, y: v.y }); Convoy.tick(); camOn(v.x - 40, v.y - 6, 1.15 + lt * .03); },
    end() { Convoy.on = false; Game.car = null; Game.dan.ride = null; } }),
  shot('speedway', null, { dur: 2.5, hud: false, hl: false, l3: [.3, 'SPORTS', 'HE IS, SOMEHOW, IN THE DAYTONA 250'],
    setup() {
      base({ region: 'daytona', day: 22, hour: 10 }); const v = { kind: 'car', id: 'car29', x: 0, y: 0, a: 0, v: 0, c: '#ffd23f', c2: PAL.red, num: 29 }; Game.vehicles = [v]; Car.enter(v);
      Speedway.start('race'); Speedway.count = 0; T_.s = 20; for (const c of Speedway.cars) c.prog += 18;
    },
    after(lt, dt) {
      const P = pathPts(), n = P.length, v = Game.car; if (!v) return; T_.s += dt * 190 / (1936 / n);
      const k = ((Math.floor(T_.s) % n) + n) % n, f = T_.s - Math.floor(T_.s), p = P[k], q = P[(k + 1) % n], a = Math.atan2(q.y - p.y, q.x - p.x);
      v.x = p.x + (q.x - p.x) * f + Math.cos(a + Math.PI / 2) * 4; v.y = p.y + (q.y - p.y) * f + Math.sin(a + Math.PI / 2) * 4; v.a = a; v.v = 190;
      Object.assign(Game.dan, { x: v.x, y: v.y }); ui.urgent.hidden = true; camOn(v.x, v.y - 4, 1.5);
    },
    end() { Speedway.on = false; Speedway.cars = []; Game.racing = false; Game.car = null; Game.dan.ride = null; } }),
  // 6. the rap sheet, as mugshots
  shot('mugs', null, { dur: 3.0, sim: false, chrome: false, gfx: mugGfx(), after: mugAnim }),
  // 7. the button
  shot('swears', null, { dur: 3.5, hl: false, l3: [.25, 'STATEMENT', 'DAN SWEARS HE IS NOT A FLORIDA MAN.'],
    setup() { base({ hour: 17.8 }); const D = Game.dan, d = World.spots.door; Object.assign(D, { x: d.x + 20, y: d.y + 34, dir: 'down' }); Game.npcs = Game.npcs.filter(n => n.id !== 'tourist'); Game.animals = Game.animals.filter(a => a.type !== 'gator'); },
    step(lt) { if (at(lt, 2.2, 'beer')) useItem('beer'); },
    after(lt) { const D = Game.dan; D.dir = 'down'; camOn(D.x, D.y - 8, 2.4); } }),
  shot('title', V1s('title'), { chrome: false }),
  shot('end', V1s('end'), { chrome: false }),
];
function convoyRoadY() {   // the street the Donut Hut drive-thru sits on
  const dr = World.spots.drive; for (let dy = 0; dy < 40; dy += 2) for (const s of [1, -1]) { const y = dr.y + s * dy; let ok = true; for (let x = dr.x - 460; x < dr.x; x += 8) if (!canDrive(x, y)) { ok = false; break; } if (ok) return y; }
  return dr.y + 8;
}
Trailer.setShots(SH);
Trailer.newsShots = SH;

// ---------- the score: Swamp Lite all the way through, with a local-news layer on top ----------
Trailer.renderAudio = async function () {
  const SR = 48000, total = Trailer.total, ctx = new OfflineAudioContext(2, Math.ceil(SR * total), SR);
  const S = {}; for (const s of SH) S[s.id] = s.start;
  const master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(master);
  const nbuf = ctx.createBuffer(1, SR * 2, SR); { const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const out = (node, pan = 0) => { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(comp); };
  function tone(t, f, dur, type = 'square', vol = .1, slide = 0, pan = 0, attack = .004) {
    if (t < 0 || t > total) return; const o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + dur);
    g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(vol, t + attack); g2.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g2); out(g2, pan); o.start(t); o.stop(t + dur + .05); return o;
  }
  function noise(t, dur, vol = .2, type = 'highpass', freq = 1000, q = .7, pan = 0, attack = .002, f1) {
    if (t < 0 || t > total) return; const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g2 = ctx.createGain();
    s.buffer = nbuf; s.loop = true; f.type = type; f.frequency.setValueAtTime(freq, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q;
    g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(vol, t + attack); g2.gain.exponentialRampToValueAtTime(.0008, t + dur);
    s.connect(f); f.connect(g2); out(g2, pan); s.start(t, Math.random()); s.stop(t + dur + .05); return f;
  }
  function brass(t, notes, dur = .28, vol = .05) {   // a short news-theme stab: detuned saws through a closing filter
    const f = ctx.createBiquadFilter(), g2 = ctx.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(500, t + dur); f.Q.value = 2;
    g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(vol, t + .012); g2.gain.exponentialRampToValueAtTime(.0008, t + dur); f.connect(g2); out(g2);
    for (const n of notes) for (const d of [-7, 0, 7]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 440 * Math.pow(2, (n - 69) / 12); o.detune.value = d; o.connect(f); o.start(t); o.stop(t + dur + .05); }
  }
  const timp = (t, v = .5) => { tone(t, 82, .7, 'sine', v, -18); noise(t, .08, v * .3, 'lowpass', 500); };
  const roll = (t0, t1) => { for (let t = t0; t < t1; t += .045) timp(t, .12 + .25 * (t - t0) / (t1 - t0)); };
  const kick = (t, v = .7) => { tone(t, 150, .22, 'sine', v, -110); noise(t, .02, .2, 'highpass', 3000); };
  const crash = (t, v = .3) => noise(t, 1.6, v, 'highpass', 5000, .5, -.2);
  const whoosh = (t, d = .35, v = .12) => noise(t, d, v, 'bandpass', 600, 1.2, 0, d * .6, 5000);
  const chomp = t => { noise(t, .1, .5, 'lowpass', 900); tone(t, 95, .22, 'square', .2, -45); };
  const boom = t => { noise(t, 1.2, .6, 'lowpass', 400); tone(t, 70, .9, 'sine', .5, -45); };
  const click = (t, v = .25) => { noise(t, .03, v, 'highpass', 2500); noise(t + .05, .04, v * .7, 'highpass', 1800); };
  const crack = t => { noise(t, .06, .35, 'highpass', 3000); noise(t + .04, .5, .08, 'highpass', 6000); for (let i = 0; i < 3; i++) tone(t + .55 + i * .16, 150 - i * 12, .1, 'sine', .12, -40); };
  const crickets = (t0, t1, v = .04) => { for (let t = t0; t < t1; t += .09) if (Math.random() < .6) tone(t, 4200 + Math.random() * 300, .05, 'sine', v, 0, Math.random() - .5); };
  const siren = (t0, t1) => { for (let t = t0, i = 0; t < t1; t += .22, i++) tone(t, i % 2 ? 700 : 950, .22, 'sine', .035); };
  const pop = t => { tone(t, 900, .06, 'sine', .07, 500); };

  // ---- cold open: doorbell cam. No music: a motion chime, crickets, a cooler motor, a beer
  crickets(0, S.ident, .035);
  tone(.05, 659, 1.1, 'sine', .12); tone(.55, 523, 1.4, 'sine', .12);   // ding... dong
  for (let t = .1; t < 1.5; t += .05) tone(t, 58 + Math.sin(t * 9) * 3, .07, 'sawtooth', .03);   // motorized cooler
  crack(S.doorbell + 1.95);
  // ---- the ident: timpani roll into a brass hit on the downbeat, and the song starts right there
  roll(S.ident - .55, S.ident); brass(S.ident, [40, 52, 59, 64], .9, .09); kick(S.ident, .9); crash(S.ident, .35); whoosh(S.ident + .05, .7, .1);
  const mg = ctx.createGain(); mg.gain.value = .85; mg.connect(master);
  const MR = Music.rig(ctx, mg), BPM = 120, T0 = S.ident, STOP = S.swears;
  const sec = (name, t0, o, t1) => Music.span(MR, 'swamp', name, t0, Math.min(t1 || t0 + 8, STOP), BPM, o);
  const MIA = { arp: 1, gated: 1, pad: 1 };
  sec('a', T0); sec('a2', T0 + 8); sec('b', T0 + 16);   // swamp; breakdown under bodycam / trail cam / court
  Music.I.riser(MR, T0 + 22, 2, 1.1);
  sec('a', T0 + 24, MIA); sec('a2', T0 + 32, MIA); sec('fin', T0 + 40, MIA);   // Miami and Daytona: same song, synthwave layers
  // the news layer: octave stabs on every downbeat, a timpani hit on every section change
  for (let t = T0 + 2; t < STOP - .01; t += 2) brass(t, [40, 52], .22, .035);
  for (const t of [T0 + 8, T0 + 16, T0 + 24, T0 + 32, T0 + 40]) { roll(t - .4, t); timp(t, .45); brass(t, [40, 52, 59, 64], .5, .06); }
  // ---- the button: the band stops dead. Crickets. He cracks a beer. Then the title slams in.
  mg.gain.setValueAtTime(.85, STOP - .02); mg.gain.linearRampToValueAtTime(0, STOP);
  crickets(STOP + .1, S.title, .04); crack(S.swears + 2.2);
  kick(S.title, 1); crash(S.title, .4); brass(S.title, [40, 52, 59, 64], 1.2, .08); timp(S.title, .6);
  const mg2 = ctx.createGain(); mg2.gain.value = .85; mg2.connect(master); const MR2 = Music.rig(ctx, mg2);
  Music.span(MR2, 'swamp', 'intro', S.title, S.end, BPM, { noDrums: true, pad: 1 });
  Music.span(MR2, 'swamp', 'a', S.end, total, BPM, {}); kick(S.end, .9);
  mg2.gain.setValueAtTime(.85, total - 1.6); mg2.gain.linearRampToValueAtTime(0, total - .05);

  // ---- spot effects, quiet under the music
  for (const s of SH) { const o = s._o; if (o && o.l3) whoosh(s.start + o.l3[0], .3, .06); }
  chomp(S.fish + 2.0); chomp(S.wrestle + .05);
  for (let i = 0; i < 14; i++) tone(S.meter + .4 + i * .15, 380 + i * 60, .09, 'square', .03);
  siren(S.bodycam, S.bodycam + 1.4); noise(S.bodycam + 1.4, .1, .25, 'lowpass', 600); for (let i = 0; i < 3; i++) noise(S.bodycam + .15 + i * .4, .12, .06, 'bandpass', 1800, 3);
  click(S.trailcam + .05); noise(S.court + 1.3, .08, .3, 'lowpass', 300);
  for (const m of ['map1', 'map2']) { whoosh(S[m] + .2, .9, .08); tone(S[m] + 1.15, 1318, .5, 'sine', .07); }
  boom(S.phone + 2.0); noise(S.phone + 2.0, 1.0, .25, 'lowpass', 900); for (let i = 0; i < 5; i++) pop(S.phone + .5 + i * .5);
  noise(S.boat + 1.6, .3, .2, 'lowpass', 700);
  for (let t = S.convoy; t < S.convoy + S.speedway - S.convoy; t += .085) noise(t, .07, .07, 'lowpass', 220);   // chopper blades
  for (let t = S.speedway; t < S.mugs; t += .6) { tone(t, 120, .6, 'sawtooth', .04, 60); whoosh(t + .2, .3, .05); }
  for (let i = 0; i < 7; i++) { click(S.mugs + i * .42, .3); noise(S.mugs + i * .42 + .02, .25, .06, 'highpass', 7000); }

  const buf = await ctx.startRendering(), n = buf.length, dv = new DataView(new ArrayBuffer(44 + n * 4)), w = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 4, true);
  const L = buf.getChannelData(0), Rr = buf.getChannelData(1);
  for (let i = 0; i < n; i++) { dv.setInt16(44 + i * 4, clamp(L[i], -1, 1) * 32767, true); dv.setInt16(46 + i * 4, clamp(Rr[i], -1, 1) * 32767, true); }
  let s = ''; const u = new Uint8Array(dv.buffer); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode(...u.subarray(i, i + 32768));
  return btoa(s);
};
})();
