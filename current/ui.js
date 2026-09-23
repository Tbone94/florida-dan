// FLORIDA DAN — HUD, menus, save, boot.
'use strict';
const ui = {};
['hudTop', 'timeLabel', 'dayLabel', 'chillFill', 'buzzFill', 'allegeFill', 'allegeLabel', 'fxTags', 'quests', 'questList', 'questToggle', 'hotbar', 'money', 'nFish', 'nBait', 'nCan', 'nPy',
  'prompt', 'toast', 'banner', 'bannerText', 'talk', 'talkWho', 'talkLine', 'talkChoices', 'fishHud', 'tensionFill', 'fishMsg', 'card', 'cardK', 'cardN', 'cardW', 'cardQ',
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
function selSlot(d) { Game.sel = ((Game.sel || 0) + d + HOTBAR.length) % HOTBAR.length; updateHotbar(); Sound.play('pickup'); toast(`${ITEMS[HOTBAR[Game.sel]].name} ×${Game.inv[HOTBAR[Game.sel]] || 0}`, 1.2); }
function flashSlot(k) { const el = slotEls[k]; if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

// ---------- quests ----------
function renderQuests() {
  ui.questList.innerHTML = '';
  for (const q of Game.quests) { const li = document.createElement('li'); li.textContent = (q.done ? '✓ ' : q.opt ? '◇ ' : '☐ ') + q.text; li.className = q.done ? 'done' : q.opt ? 'opt' : ''; ui.questList.append(li); }
}
ui.questToggle.addEventListener('click', () => ui.quests.classList.toggle('open'));

// ---------- headline banner ----------
let bannerT = 0;
function updateHeadlineBanner(dt) {
  if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) ui.banner.classList.remove('show'); return; }
  if (headlineQ.length && Game.mode !== 'title') { ui.bannerText.textContent = headlineQ.shift(); ui.banner.classList.add('show'); bannerT = 5.5; Sound.play('headline'); Game.shake = 3; }
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
  ui.urgent.hidden = !(Game.urgent > 0); if (Game.urgent > 0) set(ui.urgent, `FIND A TOILET: ${Math.ceil(Game.urgent)}s`);
  updateHotbar();
  if (Game.mode !== 'play') ui.prompt.hidden = true;
}
function showHud(on) { ['hudTop', 'quests', 'hotbar'].forEach(k => ui[k].hidden = !on); ui.pad.hidden = !(on && isTouch); }

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
  ui.jQuests.innerHTML = ''; for (const q of Game.quests) { const li = document.createElement('li'); li.textContent = (q.done ? '✓ ' : '☐ ') + q.text; if (q.done) li.className = 'done'; ui.jQuests.append(li); }
  ui.jSheet.innerHTML = '';
  if (!Game.headlines.length) { const li = document.createElement('li'); li.textContent = 'Clean record. For now.'; ui.jSheet.append(li); }
  Game.headlines.slice().reverse().forEach(h => { const li = document.createElement('li'); li.innerHTML = `<b>DAY ${h.day}</b> ${h.text}`; ui.jSheet.append(li); });
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
ui.continueBtn.addEventListener('click', () => begin(true));
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
  stage.style.setProperty('--u', Math.max(10, Math.min(17, w / 62)) + 'px');
  const dpr = Math.min(2, devicePixelRatio || 1); screenCv.width = Math.round(w * dpr); screenCv.height = Math.round(h * dpr);
  document.body.classList.toggle('portrait', portrait);
  $('rotate').hidden = !(portrait && isTouch);
}
addEventListener('resize', resize);

// ---------- controller menus: d-pad/stick moves focus, A presses, B backs out ----------
function openMenu() {
  for (const id of ['credits', 'gazette', 'shop', 'journal', 'title']) { const el = $(id); if (!el.hidden) return el; }
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
}
Input.onPad = on => { document.body.classList.toggle('pad', on); if (on && Game.mode !== 'title') toast('Controller connected. Hell yeah.', 2); };

// ---------- boot ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  Input.poll(); menuNav();
  update(dt); render(); hud();
  Sound.music(dt, Game.fx.powder > 0 ? 'speed' : Game.fx.high > 0 ? 'slow' : Game.fx.shroom > 0 ? 'trip' : 'norm');
  Input.endFrame();
  if (!window.TRAILER) requestAnimationFrame(frame);
}
buildWorld(); bakeAll(); gatorMap(); resize(); Screen.init(screenCv, buf); buildHotbar();
Input.bindStick($('stick'), $('nub')); Input.bindButton($('btnA'), 'a'); Input.bindButton($('btnB'), 'b'); Input.bindButton($('btnF'), 'throw');
['talk', 'card'].forEach(id => $(id).addEventListener('pointerdown', e => { if (e.target.closest('.choice')) return; Input.press('a'); }));
Game.inv = { beer: 0 }; Game.day_ = freshDayLog(); spawn(); Game.mode = 'title';
if (load()) { ui.continueBtn.hidden = false; ui.continueBtn.textContent = `Continue — Day ${load().day}`; }
document.fonts && document.fonts.load('700 8px "Pixelify Sans"').catch(() => { });
requestAnimationFrame(frame);
