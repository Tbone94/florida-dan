// FLORIDA DAN — Friday. The State of Florida v. Daniel Wayne Dupree.
'use strict';
const OBJECTIONS = [
  'OBJECTION! That iguana had it comin’.', 'OBJECTION! Hearsay! I heard it, and I say it didn’t happen.', 'OBJECTION! I was on medication. Sinus medication.',
  'OBJECTION! Leading the witness! There ain’t even a witness!', 'OBJECTION! That cow and I have an understanding.', 'OBJECTION! Your Honor, have YOU ever been to a hurricane party?',
];
// ---------- courtroom cutscenes ----------
// The big court moments play out on the stage like the rest of the game (people walk in, doors blow open, bubbles),
// using the same step list as world cutscenes: courtCut([SC.walk('chuck', 230, 140), SC.line('judge', 'ORDER!'), ...], then).
// Actors live in stage coordinates (the 320x180 courtroom; x, y = their feet). Stage the action ABOVE y≈122: on a phone the
// talk box covers the bottom third, and the letterbox bars take the top 16px (keep bubbles/emotes below y≈40). Anchors (judge, jury, dan, lawyer, gallery)
// are invisible spots for bubbles and emotes over people the room already draws; CT.cast() turns Dan and his lawyer into
// real actors so a scene can walk them around.
const CT = {
  reset() {
    Game.courtActors = [];
    for (const [id, x, y] of [['judge', 160, 66], ['jury', 49, 52], ['dan', 158, 139], ['lawyer', 184, 139], ['prosecutor', 271, 100], ['gallery', 250, 118], ['door', 305, 118]]) CT.add(id, null, x, y, 'down', { anchor: true });
  },
  add(id, sprite, x, y, dir = 'down', extra = {}) {
    const A = Game.courtActors || (Game.courtActors = []), old = A.findIndex(a => a.id === id); if (old >= 0) A.splice(old, 1);
    const a = { id, sprite, x, y, dir, frame: 0, t: 0, ...extra }; A.push(a); return a;
  },
  gator(id, x, y, dir = 'left', chuck = true) { const a = CT.add(id, null, x, y, dir); Object.assign(a, makeGator(x, y, chuck), { id, lurk: false, state: 'chase', dir, gator: true }); return a; },
  remove(id) { Game.courtActors = (Game.courtActors || []).filter(a => a.id !== id); },
  cast() {   // Dan and his lawyer step out of the backdrop and become actors
    (Game.courtExtra = Game.courtExtra || {}).cast = true;
    CT.add('dan', 'dan', 158, 139, 'up'); CT.add('lawyer', ORLANDO() ? 'brenda' : 'darlene', 184, 139, 'up');
  },
  draw(t) {
    const L = (Game.courtActors || []).filter(a => !a.anchor && !a.hidden).sort((a, b) => a.y - b.y);
    for (const a of L) {
      if (a.gator) { drawGator(a, 0, 0, t); continue; }
      if (a.draw) { a.draw(a, t); continue; }
      const S = SPR[a.sprite]; if (!S) continue;
      const img = S.width ? S : (S[a.dir] || S.down)[a.moving ? a.frame || 0 : 0];
      if (a.flip && S.width) { g.save(); g.translate(Math.round(a.x), 0); g.scale(-1, 1); g.drawImage(img, -(img.width >> 1), Math.round(a.y - img.height - (a.lift || 0))); g.restore(); }
      else g.drawImage(img, Math.round(a.x - (img.width >> 1)), Math.round(a.y - img.height - (a.lift || 0)));
    }
  },
};
function courtCut(steps, then) { Scene.play(steps, then, { court: true }); }

const Court = {
  start(cs) {
    if (cs === 'whimsy') return OrlandoCourt.whimsy();
    if (cs === 'finale') return OrlandoCourt.finale();
    if (cs === 'republic') return KeysCourt.republic();
    if (cs === 'galleon') return KeysCourt.galleon();
    if (cs === 'donut') return DaytonaCourt.donut();
    if (cs === 'race') return DaytonaCourt.race();
    if (cs === 'manatee') return CourtCases.manatee();
    if (cs === 'skunk') return CourtCases.skunk();
    if (cs === 'lambo') return MiamiCourt.lambo();
    if (cs === 'sinus') return MiamiCourt.sinus();
    Game.mode = 'court'; Game.courtChuck = 0; Game.courtExtra = {}; CT.reset(); showHud(false);
    const hs = Game.headlines.map(h => h.text), picks = hs.slice(-2);   // two exhibits, not four: the joke lands by the second
    const ev = picks.length ? picks.flatMap((h, i) => [['PROSECUTOR VANCE', `Exhibit ${'AB'[i]}: “${h}”`], ['DAN', OBJECTIONS[i % OBJECTIONS.length]]]).concat([['JUDGE HARLAN', 'Overruled. All of it.']])
      : [['PROSECUTOR VANCE', 'Your Honor, the defendant has... zero headlines this week?'], ['JUDGE HARLAN', 'In Florida? Suspicious as hell.']];
    const wit = Q('darlene') ? ['darlene', 'rhonda', 'merle2'].filter(id => Q(id) && Q(id).done).length : 3;
    say([
      ['JUDGE HARLAN', 'The State versus Daniel Wayne Dupree. Charge: “being a Florida Man.”'],
      ...(Game.flags.pants ? [['JUDGE HARLAN', 'Formal jorts. Respect.']] : [['BRENDA', 'I told him to wear pants, Your Honor.']]),
      ['JUDGE HARLAN', 'How do you plead?', [
        ['“Not guilty.”', () => [['JUDGE HARLAN', 'Noted. Nobody believes you.']]],
        ['“Not a Florida Man.”', () => [['JUDGE HARLAN', 'That’s not a plea, son.']]],
        ...(Game.inv.beer > 0 ? [['Crack open a Swamp Lite', () => { Game.inv.beer--; Sound.play('crack'); return [['JUDGE HARLAN', '...After. Proceed.']]; }]] : []),
      ]],
      ...ev,
      ...(wit === 3 ? [['BRENDA', 'Three character witnesses, Your Honor. One is Merle Haggard.'], ['JUDGE HARLAN', 'Merle Haggard is dead.']] : [['BRENDA', `We have ${wit} witness${wit === 1 ? '' : 'es'}, Your Honor.`], ['JUDGE HARLAN', 'That’s not three.']]),
      ['JUDGE HARLAN', 'Anything to say before I rule?', [
        ['“I am NOT a Florida Man.”', () => null],
        ['“I’m a man. In Florida. It’s different.”', () => [['JUDGE HARLAN', 'Is it though.']]],
        ['“Can I get a Swamp Lite?”', () => [['BRENDA', 'DAN.']]],
      ]],
    ], () => this.chuck());
  },
  // the doors blow in, Chuck charges the bench, the room loses it (shown, not told)
  chuck() {
    Game.courtChuck = 1;
    courtCut([
      SC.wait(.3), SC.sound('boom'), SC.shake(10), SC.flash(.5), SC.fx(() => CT.gator('chuck', 314, 118, 'left')),
      SC.emote('jury', '!!', .9, PAL.red),
      SC.all([SC.walk('chuck', 226, 118, 95), SC.line('judge', 'IS THAT AN ALLIGATOR?!', 1.6)]),
      SC.sound('chomp'), SC.shake(5),
      SC.line('dan', 'That’s Chuck. He’s got issues.', 1.6),
    ], () => this.fight());
  },
  fight() {
    Wrestle.start({ foe: 'chuck', arena: 'court', onWin: () => this.win(), onLose: () => { Game.mode = 'court'; say([['DAN', 'THAT ALL YOU GOT?']], () => this.fight()); } });
  },
  win() {
    Game.courtChuck = 2; Game.mode = 'court';
    headline('FLORIDA MAN ACQUITTED OF BEING A FLORIDA MAN AFTER WRESTLING ALLIGATOR IN COURTROOM', 20);
    const ch = (Game.courtActors || []).find(a => a.id === 'chuck'); if (ch) Object.assign(ch, { x: 214, y: 116, belly: 1.5, dir: 'right' });   // flipped, jaws shut
    courtCut([
      SC.line('jury', 'DAN! DAN! DAN!', 1.6),
      SC.line('judge', 'NOT GUILTY.', 1.3), SC.line('judge', 'I’m keeping the alligator.', 1.6),
      SC.say([['BRENDA', 'You’re holding an alligator. In court. In jorts.'], ['DAN', '...Swamp Lite?'], ['BRENDA', '...Yeah.']]),
    ], () => { Game.flags.acquitted = true; Game.flags.creditsPending = 1; endDay('court'); });
  },
  update(dt) { },
  drawRoom(t, fighting) {
    R(0, 0, VW, VH, '#6b4a2e');
    for (let x = 0; x < VW; x += 20) R(x, 0, 1, 70, '#5a3d25');
    R(0, 70, VW, VH - 70, '#8e5a36'); for (let y = 76; y < VH; y += 8) R(0, y, VW, 1, '#7a4a2b');
    OR(110, 18, 100, 34, PAL.woodD); R(110, 18, 100, 4, PAL.woodL);                    // bench
    label('IN GOD WE TRUST', 262, 30, PAL.yellow, 5); label('(MOSTLY)', 262, 38, PAL.yellow, 5);   // on the wall beside the bench (behind the judge, his head covered it)
    g.drawImage(SPR[ORLANDO() ? 'blossom' : KEYS() ? 'pinder' : DAYTONA() ? 'pettibone' : MIAMI() ? 'vega' : 'judge'].down[0], 0, 0, 16, 18, 152, 2, 16, 18);   // (source x was 152: the judge never showed up)
    OR(150, 60, 22, 8, PAL.yellow); OR(154, 28, 12, 10, PAL.blue); R(158, 30, 4, 6, PAL.white);    // seal
    OR(14, 44, 70, 40, PAL.woodD); R(14, 44, 70, 3, PAL.woodL); label('JURY', 49, 70, PAL.woodL, 6);   // on the front of the box, not behind the jurors
    const jurors = ['tourist', 'merle', 'darlene', 'tourist', 'rhonda', 'tourist'];
    jurors.forEach((j, i) => { const jump = fighting || Game.courtChuck === 2 ? Math.abs(Math.sin(t * 8 + i)) * 4 : 0; g.drawImage(SPR[j].down[0], 0, 0, 16, 14, 18 + (i % 3) * 22, 28 + Math.floor(i / 3) * 16 - jump, 16, 14); });
    OR(236, 70, 70, 16, PAL.woodD);
    if (!fighting && !(Game.courtExtra && Game.courtExtra.cast)) {
      g.drawImage(SPR.dan.up[0], 150, 120); g.drawImage(SPR[ORLANDO() ? 'brenda' : 'darlene'].up[0], 176, 120);   // Orlando: Brenda, in person, finally
      if (Game.courtChuck === 2) { g.drawImage(SPR.judge.down[0], 250, 118); }
    }
    if (!fighting) OR(130, 140, 70, 10, PAL.woodL);   // the defense desk stays when Dan and his lawyer become cutscene actors
    OR(292, 90, 26, 60, PAL.woodD); if (Game.courtChuck) { R(292, 90, 26, 60, PAL.black); label('*CRASH*', 300, 86, PAL.yellow, 8); }
  },
  draw(t) {
    if (Game.scene === 'parade') return drawParade(t);
    if (Game.scene === 'finale') return drawFinale(t);
    const sh = Game.shake || 0; g.save(); if (sh) g.translate(Math.round((Math.random() - .5) * sh), Math.round((Math.random() - .5) * sh));   // court moments shake too
    this.drawRoom(t, false); drawCourtExtras(t); CT.draw(t);
    if (Scene.inCourt()) Scene.draw(0, 0, t);
    g.restore();
    if (Game.courtChuck === 2 && !Scene.inCourt()) label('NOT GUILTY', VW / 2, 90, PAL.yellow, 14);   // (Chuck himself is a court actor now)
  },
};
