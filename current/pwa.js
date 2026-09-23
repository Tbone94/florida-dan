// FLORIDA DAN — phone niceties: offline service worker, the Install button (Android/desktop Chrome),
// the "Add to Home Screen" tip (iPhone), and going properly full screen + landscape when you start playing.
'use strict';
const PWA = (() => {
  const standalone = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone === true;
  const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferred = null;
  { const s = document.querySelector('script[src^="engine.js"]'), v = s && new URL(s.src).searchParams.get('v'); const el = $('build'); if (el && v) el.textContent = 'build ' + v.slice(4); }
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !window.TRAILER) {
    const s = document.querySelector('script[src^="engine.js"]'), v = s ? new URL(s.src).searchParams.get('v') || 'dev' : 'dev';
    addEventListener('load', () => navigator.serviceWorker.register('sw.js?v=' + v).catch(() => { }));
  }
  const android = /Android/.test(navigator.userAgent), btns = [$('installBtn'), $('installBtn2')], tip = $('iosTip');
  const show = on => btns.forEach(b => b.hidden = !on);
  // Chrome only offers its install prompt after you've used the page a bit, so on Android the button is
  // always there: one tap installs if Chrome is ready, otherwise it says where Chrome keeps "Install app".
  if (!standalone && !iOS && (android || isTouch)) show(true);   // any Android browser, even one that hides its user agent
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (!standalone) show(true); });
  addEventListener('appinstalled', () => { show(false); deferred = null; tip.hidden = true; });
  async function install() {
    if (deferred) { deferred.prompt(); const c = await deferred.userChoice.catch(() => ({})); deferred = null; if (c.outcome === 'accepted') show(false); return; }
    tip.innerHTML = 'Tap Chrome’s <b>⋮</b> menu (top right) → <b>Install app</b> or <b>Add to Home screen</b>'; tip.hidden = false;
    if (Game.mode === 'journal') toast('Chrome menu ⋮ (top right) → Install app', 5);
  }
  btns.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); install(); }));
  if (iOS && !standalone && isTouch) tip.hidden = false;
  // starting a game on a phone browser: go full screen and lock landscape where the browser allows it
  function immerse() {
    if (standalone || !isTouch) return;
    const el = document.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen;
    if (rq && !document.fullscreenElement) Promise.resolve(rq.call(el, { navigationUI: 'hide' })).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { })).catch(() => { });
  }
  return { immerse, standalone, iOS };
})();
