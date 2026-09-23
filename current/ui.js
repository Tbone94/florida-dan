// FLORIDA DAN — HUD, menus, save, boot.
'use strict';
const ui = {};
['hudTop', 'timeLabel', 'dayLabel', 'chillFill', 'buzzFill', 'allegeFill', 'allegeLabel', 'fxTags', 'objective', 'hint', 'hotbar', 'money', 'nFish', 'nBait', 'nCan', 'nPy',
  'prompt', 'toast', 'banner', 'bannerText', 'bannerKick', 'talk', 'talkWho', 'talkLine', 'talkChoices', 'fishHud', 'tensionFill', 'fishMsg', 'card', 'cardK', 'cardN', 'cardW', 'cardQ',
  'wrestle', 'gripFill', 'wrestlePrompt', 'wrestleMsg', 'raccoon', 'raccoonFill', 'shop', 'shopList', 'shopMoney', 'journal', 'jQuests', 'jSheet', 'title', 'gazette', 'pad', 'urgent', 'continueBtn'].forEach(id => ui[id] = $(id));

// ---------- hotbar ----------
const slotEls = {};
function buildHotbar() {
  ui.hotbar.innerHTML = '';
  HOTBAR.forEach((k, i) => {
    const b = document.createElement('button'); b.className = 'slot'; b.id = 'slot-' + k; b.title = `${ITEMS[k].name} — ${ITEMS[k].desc}`;
    b.innerHTML = `<span class="key">${i + 1}</span><img alt="" src="${SPR.iconURL[k]}"><span class="n">0</span>`;
    b.addEventListener('click', e => { e.currentTarget.blur(); useItem(k); });
    ui.hotbar.append(b); slotEls[k] = b;
  });
}
function updateHotbar() {
  for (const k of HOTBAR) { const el = slotEls[k], n = Game.inv[k] || 0; if (!el) continue; const s = el.querySelector('.n'); if (s.textContent !== String(n)) s.textContent = n; el.classList.toggle('empty', !n); el.classList.toggle('sel', Input.padActive && HOTBAR[Game.sel || 0] === k); }
}
function selSlot(d) { let i = Game.sel || 0; for (let n = 0; n < HOTBAR.length; n++) { i = (i + d + HOTBAR.length) % HOTBAR.length; if (Game.inv[HOTBAR[i]] > 0) break; } Game.sel = i; updateHotbar(); Sound.play('pickup'); toast(`${ITEMS[HOTBAR[Game.sel]].name} ×${Game.inv[HOTBAR[Game.sel]] || 0}`, 1.2); }
function flashSlot(k) { const el = slotEls[k]; if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

// ---------- quests ----------
// the HUD only shows what to do right now; the full list lives in the rap sheet
function renderQuests() {
  const q = currentQuest(), v = q ? q.text : '';
  if (ui.objective._v !== v) { ui.objective._v = v; ui.objective.textContent = v; ui.objective.hidden = !v || Game.mode === 'title'; if (v) { ui.objective.classList.remove('new'); void ui.objective.offsetWidth; ui.objective.classList.add('new'); } }
}

// ---------- headline banner ----------
let bannerT = 0;
function updateHeadlineBanner(dt) {
  if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) ui.banner.classList.remove('show'); return; }
  if (headlineQ.length && Game.mode !== 'title') {
    const h = headlineQ.shift(), it = typeof h === 'string' ? { text: h } : h;
    ui.bannerText.textContent = it.text; ui.bannerKick.textContent = it.isNew ? `NEW ON YOUR RAP SHEET · ${Sheet.count()}/${Sheet.total()}` : 'BREAKING · SWAMP GAZETTE';
    ui.banner.classList.toggle('fresh', !!it.isNew); ui.banner.classList.add('show'); bannerT = it.isNew ? 6.5 : 5.5;
    Sound.play('headline'); if (it.isNew) setTimeout(() => Sound.play('catch'), 250); Game.shake = 3;
  }
}

// ---------- HUD tick ----------
const days = ['', 'MON', 'TUE', 'WED', 'FRI'];
function clock() { const h = Math.floor(Game.hour), m = Math.floor(Game.hour % 1 * 6) * 10, h12 = ((h + 11) % 12) + 1; return `${h12}:${m ? m : '00'} ${h < 12 ? 'AM' : 'PM'}`; }
function hud() {
  if (Game.mode === 'title' || Game.mode === 'gazette') return;
  const set = (el, v) => { v = String(v); if (el._v !== v) { el._v = v; el.textContent = v; } };
  set(ui.timeLabel, clock()); set(ui.dayLabel, `${days[Game.day] || 'DAY ' + Game.day} · DAY ${Game.day}${Game.cold ? ' · 47°F' : Game.storm > .3 ? ' · HURRICANE WANDA' : ''}`);
  ui.chillFill.style.width = Game.chill + '%'; ui.buzzFill.style.width = Math.min(100, Game.fx.buzz) + '%'; ui.allegeFill.style.width = Game.allegations + '%';
  set(ui.allegeLabel, Game.allegations + '%');
  set(ui.money, '$' + Game.money); set(ui.nFish, Game.inv.fish || 0); set(ui.nBait, Game.inv.bait || 0); set(ui.nCan, Game.inv.can || 0); set(ui.nPy, Game.pythons.length ? Game.pythons.reduce((a, b) => a + b, 0).toFixed(0) + 'ft' : '0');
  const F = Game.fx, tags = [];
  if (F.buzz > 25) tags.push(F.buzz > 80 ? 'WASTED' : 'BUZZED'); if (F.high > 0) tags.push(`HIGH ${Math.ceil(F.high)}s`); if (F.shroom > 0) tags.push(`TRIPPIN ${Math.ceil(F.shroom)}s`);
  if (F.powder > 0) tags.push(`“SINUSES” ${Math.ceil(F.powder)}s`); if (F.crash > 0) tags.push('CRASHING'); if (F.cig > 0) tags.push('SMOKIN');
  set(ui.fxTags, tags.join(' · '));
  const hs = Math.ceil((Game.heat || 0) - .05); $('heat').hidden = hs <= 0; set($('heat'), '★'.repeat(hs) + '☆'.repeat(5 - Math.max(0, hs)) + (Heat.cop ? '  WANTED' : '')); $('heat').classList.toggle('hot', !!Heat.cop);
  ui.urgent.hidden = !(Game.urgent > 0); if (Game.urgent > 0) set(ui.urgent, `FIND A TOILET: ${Math.ceil(Game.urgent)}s`);
  for (const [id, n] of [['statBait', Game.inv.bait], ['statCan', Game.inv.can], ['statPy', Game.pythons.length]]) $(id).hidden = !n;
  updateHotbar(); renderQuests();
  if (Game.mode !== 'play') ui.prompt.hidden = true;
}
function showHud(on) { ['hudTop', 'hotbar'].forEach(k => ui[k].hidden = !on); ui.objective.hidden = !on || !ui.objective._v; if (!on) ui.hint.hidden = true; ui.pad.hidden = !(on && isTouch); }

// ---------- shop ----------
const SHOP = ['beer', 'cig', 'energy', 'hotdog', 'scratch', 'firework', 'bait'];
function openShop() {
  ui.shop.hidden = false; ui.talk.hidden = true; renderShop();
}
function renderShop() {
  ui.shopMoney.textContent = `Wallet: $${Game.money}`; ui.shopList.innerHTML = '';
  for (const k of SHOP) {
    const price = k === 'bait' ? 2 : k === 'cig' ? 5 : ITEMS[k].price, qty = k === 'cig' ? 5 : 1, name = k === 'bait' ? 'Nightcrawlers' : ITEMS[k].name + (k === 'cig' ? ' ×5' : '');
    const b = document.createElement('button'); b.className = 'shopRow'; b.disabled = Game.money < price;
    b.innerHTML = `<img alt="" src="${SPR.iconURL[k]}"><span class="nm">${name}<small>${k === 'bait' ? 'Fish bite a lot more.' : ITEMS[k].desc}</small></span><span class="pr">$${price}</span>`;
    b.addEventListener('click', () => { if (Game.money < price) return; Game.money -= price; giveItem(k, qty); Sound.play('cash'); renderShop(); });
    ui.shopList.append(b);
  }
}
function closeShop() { ui.shop.hidden = true; Game.mode = 'play'; }
$('shopClose').addEventListener('click', closeShop);

// ---------- journal / rap sheet ----------
function openJournal() {
  Game.mode = 'journal'; ui.journal.hidden = false;
  $('jControls').innerHTML = [['move', 'Move'], ['a', 'Use · talk · reel · wrestle'], ['punch', 'Punch (or throw an empty)'], ['b', 'Yell “GIT!”'], ['item', Input.padActive ? 'Use item (LB/RB to pick)' : 'Use an item'], ['run', 'Run'], ['journal', 'This rap sheet']]
    .filter(([k]) => !(k === 'run' && isTouch && !Input.padActive)).map(([k, t]) => `<li>${K(k)} ${t}</li>`).join('');
  ui.jQuests.innerHTML = ''; for (const q of Game.quests) { const li = document.createElement('li'); li.textContent = (q.done ? '✓ ' : '☐ ') + q.text; if (q.done) li.className = 'done'; ui.jQuests.append(li); }
  ui.jSheet.innerHTML = '';
  $('jCount').textContent = `${Sheet.count()} / ${Sheet.total()} HEADLINES`;
  const rows = HEADLINES.map(([k, , hint]) => [k, hint, Sheet.found[k]]).sort((a, b) => (b[2] ? 1 : 0) - (a[2] ? 1 : 0));
  for (const [, hint, f] of rows) {
    const li = document.createElement('li'); li.className = f ? 'got' : 'locked';
    const b = document.createElement('b'), sp = document.createElement('span');
    b.textContent = f ? `DAY ${f.day}` : '???'; sp.textContent = f ? f.text : hint; li.append(b, sp); ui.jSheet.append(li);
  }
}
function closeJournal() { ui.journal.hidden = true; Game.mode = 'play'; }
$('journalClose').addEventListener('click', closeJournal);
$('journalBtn').addEventListener('click', e => { e.currentTarget.blur(); if (Game.mode === 'play') openJournal(); });

// ---------- save ----------
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ day: Game.day, inv: Game.inv, money: Game.money, allegations: Game.allegations, headlines: Game.headlines, flags: Game.flags, catchBag: Game.catchBag, pythons: Game.pythons })); } catch (e) { } }
function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && s.day ? s : null; } catch (e) { return null; } }

// ---------- title / next day ----------
function begin(fromSave) {
  Sound.unlock(); ui.title.hidden = true;
  if (fromSave) { const s = load(); Object.assign(Game, { day: s.day, inv: s.inv, money: s.money, allegations: s.allegations, headlines: s.headlines, flags: s.flags, catchBag: s.catchBag || [], pythons: s.pythons || [] }); startDay(); }
  else newGame();
}
$('startBtn').addEventListener('click', () => begin(false));
$('howtoBtn').addEventListener('click', () => { ui.title.hidden = true; $('howto').hidden = false; $('howtoClose').focus(); });
const closeHowto = () => { $('howto').hidden = true; ui.title.hidden = false; $('howtoBtn').focus(); };
$('howtoClose').addEventListener('click', closeHowto);
ui.continueBtn.addEventListener('click', () => begin(true));
$('shareBtn').addEventListener('click', shareFrontPage);
$('nextBtn').addEventListener('click', () => {
  ui.gazette.hidden = true;
  if (Game.flags.acquitted && !Game.flags.credits) { Game.flags.credits = true; $('credits').hidden = false; return; }
  Game.day++; startDay();
});
$('creditsBtn').addEventListener('click', () => { $('credits').hidden = true; Game.day++; startDay(); });

// ---------- layout ----------
function resize() {
  const vw = innerWidth, vh = innerHeight, portrait = vh > vw * 1.05;
  const w = Math.floor(Math.min(vw, (portrait ? vh * .58 : vh) * 16 / 9)), h = Math.floor(w * 9 / 16);
  Object.assign(stage.style, { width: w + 'px', height: h + 'px', left: ((vw - w) / 2) + 'px', top: (portrait ? 8 : (vh - h) / 2) + 'px' });
  stage.style.setProperty('--u', Math.max(11, Math.min(21, w / 54)) + 'px');
  // Render at a whole-number multiple of the 320x180 art, capped at 4x (1280x720). The browser upscales the rest
  // crisply (image-rendering: pixelated). Full-screen on a big display was pushing 5000+px-wide frames through the FX shader.
  const dpr = devicePixelRatio || 1, k = clamp(Math.floor(w * dpr / VW), 1, window.TRAILER ? 6 : 4);
  screenCv.width = VW * k; screenCv.height = VH * k;
  document.body.classList.toggle('portrait', portrait);
  $('rotate').hidden = !(portrait && isTouch);
}
addEventListener('resize', resize);

// ---------- controller menus: d-pad/stick moves focus, A presses, B backs out ----------
function openMenu() {
  for (const id of ['howto', 'credits', 'gazette', 'shop', 'journal', 'title']) { const el = $(id); if (!el.hidden) return el; }
  if (Game.mode === 'talk' && ui.talkChoices.childElementCount) return ui.talkChoices;
  return null;
}
function menuNav() {
  const m = openMenu(); if (!m) return;
  const btns = [...m.querySelectorAll('button')].filter(b => !b.hidden && !b.disabled && b.offsetParent !== null);
  if (!btns.length) return;
  let i = btns.indexOf(document.activeElement);
  const move = d => { i = i < 0 ? 0 : (i + d + btns.length) % btns.length; btns[i].focus(); btns.forEach(b => b.classList.toggle('padfocus', b === btns[i])); Sound.play('talk'); };
  if (Input.tapped('down') || Input.tapped('right')) move(1);
  if (Input.tapped('up') || Input.tapped('left')) move(-1);
  if ((Input.tapped('a') || Input.tapped('pause')) && Input.padActive) { const b = i >= 0 ? btns[i] : btns[0]; Input.endFrame(); b.click(); }
  if (Input.tapped('b') && m.id === 'shop') closeShop();
  if ((Input.tapped('b') || Input.tapped('pause')) && m.id === 'howto') closeHowto();
}
Input.onPad = on => { document.body.classList.toggle('pad', on); if (on && Game.mode !== 'title') toast('Controller connected. Hell yeah.', 2); };

// ---------- boot ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  Input.poll(); menuNav();
  // one bad frame should never freeze the swamp on its last image; log it and keep going
  try { update(dt); render(); hud(); } catch (e) { console.error('frame error', e); }
  Sound.music(dt, Heat.cop ? 'chase' : Game.fx.powder > 0 ? 'speed' : Game.fx.high > 0 ? 'slow' : Game.fx.shroom > 0 ? 'trip' : (Game.hour >= 20.5 || Game.hour < 6) ? 'night' : 'norm');
  Input.endFrame();
  if (!window.TRAILER) requestAnimationFrame(frame);
}
buildWorld(); bakeAll(); gatorMap(); resize(); Screen.init(screenCv, buf); buildHotbar();
Input.bindStick($('stick'), $('nub')); Input.bindButton($('btnA'), 'a'); Input.bindButton($('btnB'), 'b'); Input.bindButton($('btnF'), 'punch');
['talk', 'card'].forEach(id => $(id).addEventListener('pointerdown', e => { if (e.target.closest('.choice')) return; Input.press('a'); }));
Game.inv = { beer: 0 }; Game.day_ = freshDayLog(); spawn(); Game.mode = 'title';
if (load()) { ui.continueBtn.hidden = false; ui.continueBtn.textContent = `Continue — Day ${load().day}`; }
document.fonts && document.fonts.load('700 8px "Pixelify Sans"').catch(() => { });
requestAnimationFrame(frame);
