// FLORIDA DAN — phone niceties: offline service worker, the Install button (Android/desktop Chrome),
// the "Add to Home Screen" tip (iPhone), and going properly full screen + landscape when you start playing.
'use strict';
const PWA = (() => {
  const standalone = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone === true;
  const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferred = null;
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !window.TRAILER) {
    const s = document.querySelector('script[src^="engine.js"]'), v = s ? new URL(s.src).searchParams.get('v') || 'dev' : 'dev';
    addEventListener('load', () => navigator.serviceWorker.register('sw.js?v=' + v).catch(() => { }));
  }
  const btn = $('installBtn'), tip = $('iosTip');
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (!standalone) btn.hidden = false; });
  addEventListener('appinstalled', () => { btn.hidden = true; deferred = null; toast('Installed. Florida Dan lives on your phone now. God help you.'); });
  btn.addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice.catch(() => { }); deferred = null; btn.hidden = true; });
  if (iOS && !standalone && isTouch) tip.hidden = false;
  // starting a game on a phone browser: go full screen and lock landscape where the browser allows it
  function immerse() {
    if (standalone || !isTouch) return;
    const el = document.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen;
    if (rq && !document.fullscreenElement) Promise.resolve(rq.call(el, { navigationUI: 'hide' })).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { })).catch(() => { });
  }
  return { immerse, standalone, iOS };
})();
