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
    b.innerHTML = `<span class="key">${'1234567890-='[i]}</span><img alt="" src="${SPR.iconURL[k]}"><span class="n">0</span>`;
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
// one thing on screen at a time: headlines only drop in during play (or fishing), never over dialogue.
// If a conversation starts mid-headline, the headline steps aside and comes back when it's over.
let bannerCur = null;
const BANNER_OK = { play: 1, fish: 1 };
function updateHeadlineBanner(dt) {
  if (bannerT > 0) {
    if (!BANNER_OK[Game.mode]) { ui.banner.classList.remove('show'); bannerT = 0; if (bannerCur) headlineQ.unshift({ ...bannerCur, again: true }); bannerCur = null; return; }
    bannerT -= dt; if (bannerT <= 0) { ui.banner.classList.remove('show'); bannerCur = null; } return;
  }
  if (headlineQ.length && BANNER_OK[Game.mode] && !window.TRAILER) {
    const h = headlineQ.shift(), it = typeof h === 'string' ? { text: h } : h; bannerCur = it;
    ui.bannerText.textContent = it.text; ui.bannerKick.textContent = it.isNew ? `NEW ON YOUR RAP SHEET · ${Sheet.count()}/${Sheet.total()}` : 'BREAKING · SWAMP GAZETTE';
    ui.banner.classList.toggle('fresh', !!it.isNew); ui.banner.classList.add('show'); bannerT = it.isNew ? 6 : 5;
    if (!it.again) { Sound.play('headline'); if (it.isNew) setTimeout(() => Sound.play('catch'), 250); Game.shake = 3; }
  }
}

// ---------- HUD tick ----------
const days = ['', 'MON', 'TUE', 'WED', 'FRI'];
function clock() { const h = Math.floor(Game.hour), m = Math.floor(Game.hour % 1 * 6) * 10, h12 = ((h + 11) % 12) + 1; return `${h12}:${m ? m : '00'} ${h < 12 ? 'AM' : 'PM'}`; }
function hud() {
  if (Game.mode === 'title' || Game.mode === 'gazette') return;
  const set = (el, v) => { v = String(v); if (el._v !== v) { el._v = v; el.textContent = v; } };
  set(ui.timeLabel, clock()); set(ui.dayLabel, `${Game.day <= 4 ? days[Game.day] : Cases.name()} · DAY ${Game.day}${Game.cold ? ' · 47°F' : Game.storm > .3 ? ' · HURRICANE WANDA' : ''}`);
  ui.chillFill.style.width = Game.chill + '%'; ui.buzzFill.style.width = Math.min(100, Game.fx.buzz) + '%'; ui.allegeFill.style.width = Game.allegations + '%';
  set(ui.allegeLabel, Game.allegations + '%');
  set(ui.money, '$' + Game.money); set(ui.nFish, Game.inv.fish || 0); set(ui.nBait, Game.inv.bait || 0); set(ui.nCan, Game.inv.can || 0); set(ui.nPy, Game.pythons.length ? Game.pythons.reduce((a, b) => a + b, 0).toFixed(0) + 'ft' : '0');
  const F = Game.fx, tags = [];
  if (F.buzz > 25) tags.push(F.buzz > 80 ? 'WASTED' : 'BUZZED'); if (F.high > 0) tags.push(`HIGH ${Math.ceil(F.high)}s`); if (F.shroom > 0) tags.push(`TRIPPIN ${Math.ceil(F.shroom)}s`);
  if (F.powder > 0) tags.push(`“SINUSES” ${Math.ceil(F.powder)}s`); if (F.crash > 0) tags.push('CRASHING'); if (F.cig > 0) tags.push('SMOKIN');
  set(ui.fxTags, tags.join(' · '));
  const hs = Math.ceil((Game.heat || 0) - .05); $('heat').hidden = hs <= 0; set($('heat'), '★'.repeat(hs) + '☆'.repeat(5 - Math.max(0, hs)) + (Heat.cop ? '  WANTED' : '')); $('heat').classList.toggle('hot', !!Heat.cop);
  const tt = Gigs.timer(); ui.urgent.hidden = !(Game.urgent > 0 || tt); if (Game.urgent > 0) set(ui.urgent, `FIND A TOILET: ${Math.ceil(Game.urgent)}s`); else if (tt) set(ui.urgent, `BEAT THE RECORD: ${tt}s`);
  for (const [id, n] of [['statBait', Game.inv.bait], ['statCan', Game.inv.can], ['statPy', Game.pythons.length]]) $(id).hidden = !n;
  updateHotbar(); renderQuests();
  if (Game.mode !== 'play') ui.prompt.hidden = true;
}
// touch controls must be up whenever a minigame needs input, even inside a cutscene (court) where the HUD is hidden
function padFor(needed) { ui.pad.hidden = !(isTouch && (needed || !ui.hudTop.hidden)); }
function showHud(on) { ['hudTop', 'hotbar'].forEach(k => ui[k].hidden = !on); ui.objective.hidden = !on || !ui.objective._v; if (!on) ui.hint.hidden = true; ui.pad.hidden = !(on && isTouch); }

// ---------- shop ----------
const SHOP = ['beer', 'cig', 'energy', 'hotdog', 'scratch', 'firework', 'bait'];
const VENDORS = {
  gulp: { title: 'GULP-N-GO', sub: '', items: () => SHOP.concat(Game.day >= 5 ? Cases.shopExtras() : []) },
  van: { title: 'WAYNE’S MYSTERY VAN', sub: 'Cash only. No cops. No Rhondas. Buying here gets you noticed (+1★).', items: () => ['joint', 'gummy'], shady: true },
  clinic: { title: 'DR. SNIFFLES’ SINUS CLINIC', sub: 'Medical grade. Allegedly. Buying here gets you noticed (+1★).', items: () => ['powder', 'cafecito'], shady: true },
  suits: { title: 'PASTEL SUITS', sub: 'Miami formal. For crimes, weddings, and crimes at weddings.', items: () => ['suit'] },
  bubba: { title: 'BUBBA’S', sub: 'Boats, bait, and bail. Mostly bail.', items: () => Upgrades.forSale('bubba') },
  surf: { title: 'SURF & DIVE', sub: 'Wax, gear, and one extremely illegal engine.', items: () => Upgrades.forSale('surf') },
  cafe: { title: 'CAFÉ ABUELA', sub: 'Ventanita open. Pay in cash or compliments.', items: () => ['cafecito', 'pastelito'] },
};
let vendor = 'gulp';
function openShop(v = 'gulp') {
  vendor = v; ui.shop.querySelector('h2').textContent = VENDORS[v].title; $('shopSub').textContent = VENDORS[v].sub; $('shopSub').hidden = !VENDORS[v].sub;
  ui.shop.hidden = false; ui.talk.hidden = true; $('shopMsg').hidden = true; renderShop(shopItems()[0]);
}
// the shop keeps your place: rows are built once, then updated in place after each purchase
const shopItems = () => VENDORS[vendor].items();
function shopInfo(k) {
  return { price: k === 'bait' ? 2 : k === 'cig' ? 5 : k === 'joint' ? 8 : k === 'powder' ? 20 : ITEMS[k].price, qty: k === 'cig' ? 5 : 1,
    name: k === 'bait' ? 'Nightcrawlers' : ITEMS[k].name + (k === 'cig' ? ' ×5' : ''), desc: k === 'bait' ? 'Fish bite a lot more.' : ITEMS[k].desc };
}
function renderShop(focusKey) {
  ui.shopList.innerHTML = '';
  for (const k of shopItems()) {
    const { price, name, desc } = shopInfo(k), b = document.createElement('button');
    b.className = 'shopRow'; b.dataset.k = k;
    b.innerHTML = `<img alt="" src="${SPR.iconURL[k === 'jortsXXXL' || k === 'suit' ? 'jorts' : k]}"><span class="nm">${name}<small>${desc}</small></span><span class="own">×<b>0</b></span><span class="pr">$${price}</span>`;
    b.addEventListener('click', () => buy(k, b)); ui.shopList.append(b);
  }
  refreshShop();
  const f = focusKey && [...ui.shopList.children].find(b => b.dataset.k === focusKey);
  if (f) { f.focus(); f.classList.toggle('padfocus', Input.padActive); }
}
function refreshShop() {
  ui.shopMoney.innerHTML = `You have <b id="wallet">$${Game.money}</b>`;
  for (const b of ui.shopList.children) {
    const k = b.dataset.k, broke = Game.money < shopInfo(k).price;
    b.classList.toggle('broke', broke); b.setAttribute('aria-disabled', broke);
    const own = ITEMS[k] && ITEMS[k].upgrade ? 0 : k === 'jortsXXXL' ? (Game.flags.xxxl ? 1 : 0) : k === 'suit' ? (Game.flags.suit ? 1 : 0) : (Game.inv[k] || 0);
    b.querySelector('.own b').textContent = own; b.querySelector('.own').classList.toggle('none', !own);
  }
}
function buy(k, b) {
  const { price, qty, name } = shopInfo(k);
  if (Game.money < price) {
    Sound.play('fail'); b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
    return shopMsg(`Not enough cash. You need $${price - Game.money} more.`, true);
  }
  Game.money -= price; if (ITEMS[k].upgrade) Upgrades.buy(k); else giveItem(k, qty, true); if (Game.day >= 5) Cases.bought(k); if (MIAMI()) MiamiCases.bought(k); Sound.play('cash');
  if (VENDORS[vendor].shady) { Heat.add(1); Game.flags['bought_' + vendor] = (Game.flags['bought_' + vendor] || 0) + 1;
    if (Game.flags['bought_' + vendor] === 1) headline(vendor === 'van' ? 'FLORIDA MAN BUYS "OREGANO" FROM MAN IN VAN; OREGANO "EXTREMELY FUNNY"' : 'FLORIDA MAN BUYS "SINUS MEDICINE" FROM BEACH TENT RUN BY MAN IN SHARPIE LAB COAT', 3); }
  // feedback you can see: the row flashes, the price floats up, the wallet ticks down
  const box = ui.shop.querySelector('.box'), r = b.getBoundingClientRect(), br = box.getBoundingClientRect(), f = document.createElement('span');
  f.className = 'floatCost'; f.textContent = `−$${price}`; f.style.left = (r.right - br.left - 70) + 'px'; f.style.top = (r.top - br.top - 6) + 'px';
  box.append(f); setTimeout(() => f.remove(), 950);
  b.classList.remove('bought'); void b.offsetWidth; b.classList.add('bought');
  shopMsg(`Bought: ${name} for $${price}.`);
  if (!shopItems().includes(k)) { if (shopItems().length) renderShop(shopItems()[0]); else { closeShop(); toast(vendor === 'surf' ? 'Coral’s sold out. She’s closing early to go surf.' : 'Bubba’s sold out. You bought everything. He’s buying a boat.'); } } else refreshShop();
  const w = $('wallet'); if (w) { w.classList.remove('tick'); void w.offsetWidth; w.classList.add('tick'); }
}
function shopMsg(msg, bad) { const el = $('shopMsg'); el.textContent = msg; el.className = bad ? 'bad' : 'good'; el.hidden = false; clearTimeout(shopMsg.t); shopMsg.t = setTimeout(() => el.hidden = true, 2200); }
function closeShop() { ui.shop.hidden = true; Game.mode = 'play'; }
$('shopClose').addEventListener('click', closeShop);

// ---------- journal / rap sheet ----------
// the fridge: to-do on a sticky note, your headlines as clippings you flip through, one rumor for a headline you haven't found
const Fridge = { found: [], i: 0 };
function openJournal() {
  Game.mode = 'journal'; ui.journal.hidden = false; soundButtons();
  ui.jQuests.innerHTML = ''; for (const q of Game.quests) { const li = document.createElement('li'); li.textContent = q.text; if (q.done) li.className = 'done'; ui.jQuests.append(li); }
  if (!Game.quests.length) ui.jQuests.innerHTML = '<li>nothing. enjoy it.</li>';
  Fridge.found = HEADLINES.map(([k]) => Sheet.found[k]).filter(Boolean).sort((a, b) => b.day - a.day); Fridge.i = 0; showClip();
  const locked = HEADLINES.filter(([k]) => !Sheet.found[k]);
  $('rumor').hidden = !locked.length; if (locked.length) $('rumorText').textContent = pick(locked)[2];
}
function showClip() {
  const f = Fridge.found[Fridge.i], n = Fridge.found.length;
  $('clipText').textContent = f ? f.text : 'Nothing in the paper yet. Go be Florida.';
  $('clipDay').textContent = f ? `THE SWAMP GAZETTE · DAY ${f.day}` : 'THE SWAMP GAZETTE';
  document.querySelector('.clip').classList.toggle('empty', !f);
  $('jCount').textContent = `${n} of ${Sheet.total()}`;
  $('clipPrev').disabled = Fridge.i <= 0; $('clipNext').disabled = Fridge.i >= n - 1;
}
function flipClip(d) { const n = Fridge.found.length; if (!n) return; const k = clamp(Fridge.i + d, 0, n - 1); if (k !== Fridge.i) { Fridge.i = k; showClip(); Sound.play('talk'); } }
$('clipPrev').addEventListener('click', e => { e.stopPropagation(); flipClip(-1); });
$('clipNext').addEventListener('click', e => { e.stopPropagation(); flipClip(1); });
function soundButtons() {
  const s = $('soundBtn'), m = $('musicBtn');
  s.textContent = Sound.muted ? 'sound: off' : 'sound: on'; s.classList.toggle('off', Sound.muted);
  m.textContent = Sound.musicPref ? 'music: on' : 'music: off'; m.classList.toggle('off', !Sound.musicPref);
}
$('soundBtn').addEventListener('click', e => { e.stopPropagation(); Sound.toggleMute(); soundButtons(); });
$('musicBtn').addEventListener('click', e => { e.stopPropagation(); Sound.toggleMusic(); soundButtons(); });
// Trash Baby: face him to send him home (he waddles back to the cabin porch); walk up to him there to bring him along again
function setTrashBaby(stay) {
  Game.flags.tbStay = stay; const tb = Game.animals.find(a => a.pet);
  if (stay && MIAMI()) { Game.animals = Game.animals.filter(a => a !== tb); toast('Trash Baby hops a Greyhound back to the swamp. He’ll be on the porch.'); }
  else if (stay) { const d = World.spots.door; if (tb) { tb.hx = d.x + 22; tb.hy = d.y + 8; } toast('Trash Baby waddles home to the porch. Judging you the whole way.'); }
  else { if (tb) tb.hx = tb.hy = undefined; toast('Trash Baby scampers after you. Reunited.'); }
  Sound.play(stay ? 'talk' : 'pickup'); save();
}
function closeJournal() { ui.journal.hidden = true; Game.mode = 'play'; }
$('journalClose').addEventListener('click', closeJournal);
$('journalBtn').addEventListener('click', e => { e.currentTarget.blur(); if (Game.mode === 'play') openJournal(); });

// ---------- save ----------
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ region: Game.region, day: Game.day, inv: Game.inv, money: Game.money, allegations: Game.allegations, headlines: Game.headlines, flags: Game.flags, catchBag: Game.catchBag, pythons: Game.pythons })); } catch (e) { } }
function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && s.day ? s : null; } catch (e) { return null; } }

// ---------- title / next day ----------
function begin(fromSave) {
  Sound.unlock(); ui.title.hidden = true; if (window.PWA) PWA.immerse();
  if (fromSave) { const s = load(); World.load(s.region || 'swamp'); Object.assign(Game, { day: s.day, inv: s.inv, money: s.money, allegations: s.allegations, headlines: s.headlines, flags: s.flags, catchBag: s.catchBag || [], pythons: s.pythons || [] }); startDay(); }
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
  const cp = Game.flags.creditsPending;
  if (cp) { Game.flags.creditsPending = 0; const [h, p, b] = CREDITS[cp]; $('credits').querySelector('h2').textContent = h; $('creditsText').innerHTML = p; $('creditsBtn').textContent = b; $('credits').hidden = false; $('creditsBtn').focus(); return; }
  Game.day++; startDay();
});
$('creditsBtn').addEventListener('click', () => { $('credits').hidden = true; Game.day++; startDay(); });

// ---------- layout ----------
function resize() {
  const vw = innerWidth, vh = innerHeight, portrait = vh > vw * 1.05;
  let w, h;
  if (!portrait && !window.TRAILER) {   // landscape: widen the world view (up to ~20:9) so wide phones show more swamp, not black bars
    VW = clamp(Math.round(VH * vw / vh / 2) * 2, VW0, 440);
    h = Math.min(vh, Math.floor(vw * VH / VW)); w = Math.min(vw, Math.round(h * VW / VH));
  } else { VW = VW0; w = Math.floor(Math.min(vw, (portrait ? vh * .58 : vh) * 16 / 9)); h = Math.floor(w * 9 / 16); }
  if (buf.width !== VW) { buf.width = VW; g.imageSmoothingEnabled = false; }
  Object.assign(stage.style, { width: w + 'px', height: h + 'px', left: ((vw - w) / 2) + 'px', top: (portrait ? 8 : (vh - h) / 2) + 'px' });
  stage.style.setProperty('--u', Math.max(11, Math.min(21, w / 54, h / 25)) + 'px');   // short landscape phones: size text by height too
  // Render at the screen's real resolution (capped at 2200px wide); the shader's sharp-bilinear upscale keeps every
  // game pixel the same size at any scale, so scrolling doesn't shimmer the way a CSS-stretched canvas did.
  const dpr = devicePixelRatio || 1, cw = Math.round(Math.min(w * dpr, window.TRAILER ? 1920 : 2200));
  screenCv.width = cw; screenCv.height = Math.round(cw * VH / VW);
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
bakeAll(); World.load('swamp'); Cases.places(); resize(); Screen.init(screenCv, buf); buildHotbar();
Input.bindStick($('stick'), $('nub')); Input.bindButton($('btnA'), 'a'); Input.bindButton($('btnB'), 'b'); Input.bindButton($('btnF'), 'punch');
['talk', 'card'].forEach(id => $(id).addEventListener('pointerdown', e => { if (e.target.closest('.choice')) return; Input.press('a'); }));
Game.inv = { beer: 0 }; Game.day_ = freshDayLog(); spawn(); Game.mode = 'title';
if (load()) { ui.continueBtn.hidden = false; ui.continueBtn.textContent = `Continue — Day ${load().day}`; }
document.fonts && document.fonts.load('700 8px "Pixelify Sans"').catch(() => { });
requestAnimationFrame(frame);
