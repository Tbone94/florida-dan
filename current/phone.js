// FLORIDA DAN — Dan's phone. Texts don't take over the talk box: his cracked, duct-taped
// phone slides up from the bottom, buzzes, shows the message(s), and slides away on its own.
'use strict';

const Phone = {
  q: [], cur: null, t: 0,
  text(from, msg) {                    // same sender back-to-back = one phone pop with a few bubbles
    const last = this.q[this.q.length - 1];
    if (last && last.from === from && last.msgs.length < 3) last.msgs.push(msg); else this.q.push({ from, msgs: [msg] });
  },
  clear() { this.q.length = 0; this.close(true); },
  free: () => Game.mode === 'play' && !Game.talk && !Game.racing,   // never over a fishing fight or a race
  update(dt) {
    const el = document.getElementById('cell'); if (!el) return;
    if (this.cur) {
      if (!this.free()) { el.classList.remove('up'); return; }   // a talk box / minigame took the bottom of the screen: duck, come back after
      el.classList.add('up'); if ((this.t -= dt) <= 0) this.close();
      return;
    }
    if (this.q.length && this.free()) this.open(this.q.shift());
  },
  open(m) {
    const el = document.getElementById('cell'); this.cur = m; this.t = 2.4 + m.msgs.join(' ').length * .035 + (m.msgs.length - 1) * .7;
    el.querySelector('.who').textContent = m.from;
    const box = el.querySelector('.msgs'); box.innerHTML = '';
    m.msgs.forEach((s, i) => { const b = document.createElement('div'); b.className = 'sms'; b.textContent = s; b.style.animationDelay = (.35 + i * .7) + 's'; box.append(b); });
    el.hidden = false; el.classList.remove('up'); void el.offsetWidth; el.classList.add('up');
    Sound.play('buzz'); if (Game.mode === 'play') Game.shake = Math.max(Game.shake, .6);
  },
  close(now) {
    const el = document.getElementById('cell'); this.cur = null; if (!el) return;
    el.classList.remove('up');
    if (now) el.hidden = true; else setTimeout(() => { if (!this.cur) el.hidden = true; }, 450);
  },
};
document.getElementById('cell').addEventListener('pointerdown', e => { e.stopPropagation(); if (Phone.cur) Phone.t = 0; });   // tap it away
