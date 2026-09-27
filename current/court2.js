// FLORIDA DAN — the Manatee and Skunk Ape trials, the OBJECTION! minigame, the Florida Man
// of the Year parade, and where the objective arrow points for everything added in Cases 2-3.
'use strict';

// ---------- OBJECTION! (object only to the lies; 3 seconds per statement) ----------
const Objection = {
  s: null,
  run(list, then) { this.s = { list, i: 0, t: 0, phase: 'show', score: 0, then }; Game.mode = 'objection'; padFor(true); this.show(); },
  show() {
    const it = this.s.list[this.s.i];
    ui.talk.hidden = false; ui.talk.classList.remove('phone'); ui.talkWho.hidden = false; ui.talkWho.textContent = this.speaker || 'PROSECUTOR VANCE'; ui.talkLine.textContent = it.text;
    ui.talkChoices.innerHTML = `<div class="objbar"><i id="objFill"></i></div><div class="objhint">${K('a')} OBJECTION! &nbsp;— only if it’s a lie. Let the truth slide.</div>`;
    this.s.t = 0; this.s.phase = 'show'; Sound.voice('PROSECUTOR');
  },
  update(dt) {
    const s = this.s; if (!s) { Game.mode = 'court'; return; }
    s.t += dt;
    if (s.phase === 'show') { const f = $('objFill'); if (f) f.style.width = Math.max(0, 100 - s.t / 3 * 100) + '%'; if (Input.tapped('a')) this.resolve(true); else if (s.t > 3) this.resolve(false); }
    else if (s.t > 1.9 || (s.t > .45 && Input.tapped('a'))) { s.i++; if (s.i >= s.list.length) this.finish(); else this.show(); }
  },
  resolve(objected) {
    const s = this.s, it = s.list[s.i], right = objected === it.lie; if (right) s.score++;
    s.phase = 'react'; s.t = 0; ui.talkChoices.innerHTML = '';
    if (objected) { ui.fishMsg.textContent = 'OBJECTION!'; setTimeout(() => { if (Game.mode === 'objection') ui.fishMsg.textContent = ''; }, 800); Game.shake = 7; Sound.play('punch'); }
    ui.talkWho.textContent = Game.courtJudge || (ORLANDO() ? 'JUDGE BLOSSOM' : null) || (KEYS() ? 'JUDGE PINDER' : DAYTONA() ? 'JUDGE PETTIBONE' : MIAMI() ? 'JUDGE VEGA' : 'JUDGE HARLAN');
    ui.talkLine.textContent = objected ? (it.lie ? 'Sustained. ' + (it.bust || '') : 'Overruled. ' + (it.over || 'That one was true, son.')) : (it.lie ? (it.miss || 'The jury nods along. That was a lie, Dan. You let it slide.') : (it.ok || 'Noted.'));
    setTimeout(() => Sound.play(right ? 'cash' : 'fail'), 120);
  },
  finish() {
    const s = this.s; this.s = null; this.speaker = null; padFor(false); ui.talk.hidden = true; ui.fishMsg.textContent = ''; Game.mode = 'court';
    if (s.score === s.list.length) headline('FLORIDA MAN OBJECTS AT EVERY LIE, IS RIGHT EVERY TIME; LAWYERS "FURIOUS"', 3);
    s.then(s.score, s.list.length);
  },
};

const CLEAN_LIMIT = { 2: 10, 3: 8 };
const CourtCases = {
  begin() { Game.mode = 'court'; Game.courtChuck = 0; Game.courtExtra = {}; Game.courtJudge = null; CT.reset(); showHud(false); },
  // fewer headlines during the case = a nicer judge (and a collectible)
  clean(n) {
    const got = Game.headlines.length - (Game.flags['caseStart' + n] || 0), J = Game.courtJudge || (ORLANDO() ? 'JUDGE BLOSSOM' : null) || (KEYS() ? 'JUDGE PINDER' : DAYTONA() ? 'JUDGE PETTIBONE' : MIAMI() ? 'JUDGE VEGA' : 'JUDGE HARLAN');
    if (got <= CLEAN_LIMIT[n]) { headline('FLORIDA MAN MAKES IT THROUGH A WHOLE CASE WITH BARELY ANY HEADLINES; FLORIDA "WORRIED ABOUT HIM"', 1); return [[J, `Only ${got} headline${got === 1 ? '' : 's'} this week, Mr. Dupree. For you, that is practically a vow of silence.`]]; }
    return [[J, `You made the paper ${got} times this week, Mr. Dupree. ${got} times. I read every one. At breakfast.`]];
  },
  manatee() {
    this.begin();
    courtCut([SC.wait(.3), SC.line('judge', 'Mr. Dupree. Again.', 1.3), SC.line('dan', 'Your Honor. Again.', 1.3)],
      () => say([...this.clean(2), ['JUDGE HARLAN', 'Charge: Unlawful Manatee Operation. Prosecution, describe the video.'], ['BRENDA', '(whispering) Only object to the LIES, Dan.']],
        () => Objection.run([
          { text: 'On the night of the hurricane, the defendant rode a manatee.', lie: false, ok: 'The jury nods. That part’s just true.', over: 'Forty million people watched you ride it, son.' },
          { text: 'The defendant shouted “YEEHAW” eleven times.', lie: true, bust: 'It was twelve. I counted.' },
          { text: 'The manatee appeared to be enjoying itself.', lie: false, over: 'The manatee was SMILING. It’s in the video.' },
          { text: 'The defendant is a trained, professional manatee jockey.', lie: true, bust: 'Nobody trained him. Look at him.' },
          { text: 'The defendant had never been in the newspaper before that night.', lie: true, bust: 'He is in the paper every single day.' },
        ], (score, of) => this.manateeEnd(score, of))));
  },
  manateeEnd(score, of) {
    const F = Game.flags, good = score >= of - 1;
    say([['JUDGE HARLAN', good ? 'Well objected, Mr. Dupree. Did you go to law school?' : 'That was a lot of wrong objecting, Mr. Dupree.'], ['DAN', good ? 'I watched a lot of TV in the jail.' : 'I panicked, Your Honor.'],
      ['BRENDA', (F.pamLetter ? 'Dr. Pam says Dan is “surprisingly gentle with sea cows.”' : 'Our expert’s letter just says “absolutely not.”') + ' The defense calls... Manny the Manatee.']],
    () => courtCut([
      // Merle wheels Manny in through the side door in a kiddie pool (cartoon sharks and all)
      SC.sound('splash'), SC.fx(() => { CT.add('manny', null, 290, 112, 'left', { draw: (a, t) => C2.manny(a.x, a.y, t, a.named) }); CT.add('merle', 'merle', 316, 112, 'left'); }),
      SC.all([SC.walk('manny', 118, 112, 50), SC.walk('merle', 144, 112, 50), SC.line('merle', 'Comin’ through!', 1.3)]), SC.face('merle', 'up'),
      SC.fx(() => { Game.courtExtra.manny = true; }), SC.emote('jury', '?!', .8),
      SC.line('judge', 'A manatee. In a kiddie pool.', 1.5),
      SC.line('manny', 'Daniel was a gentle rider.', 1.6),
      SC.all([SC.line('judge', 'IT TALKS?!', 1.2), SC.emote('jury', '!!', 1, PAL.red), SC.shake(3)]), SC.fx(() => { const m = actorOf('manny'); if (m) m.named = true; }), SC.line('dan', 'You hear him too?!', 1.3),
      SC.say([['MANNY THE MANATEE', 'Minute three of the video, Your Honor. Daniel was NOT my first rider that night.']]),
      // Kayden jumps up in the gallery with the phone: the zoomed-in video shows who's on Manny's tail
      SC.fx(() => CT.add('kayden', 'kayden', 262, 112, 'left')), SC.all([SC.walk('kayden', 250, 104, 40), SC.line('kayden', 'BRO. ZOOM IN.', 1.2)]),
      SC.sound('headline'), SC.prop('zoom', (cx, cy, t) => C2.zoom(t)), SC.wait(1.2), SC.emote('judge', '!!', 1, PAL.red), SC.wait(.6), SC.unprop('zoom'),
      SC.say([['JUDGE HARLAN', '...Case dismissed. Somebody arrest that alligator.']]),
      // Chuck pops up in the back row; Rhonda walks him out
      SC.fx(() => CT.gator('chuck', 288, 114, 'left')), SC.line('chuck', '*hiss*', 1),
      SC.fx(() => CT.add('rhonda', 'rhonda', 316, 92, 'left')), SC.all([SC.walk('rhonda', 298, 90, 60), SC.line('rhonda', 'On it.', 1)]),
      SC.all([SC.walk('chuck', 345, 114, 55), SC.walk('rhonda', 345, 92, 50)]),
    ], () => { headline('MANATEE TESTIFIES IN COURT; FLORIDA MAN ACQUITTED, ALLIGATOR CHARGED INSTEAD', 10); F.case2Won = true; F.creditsPending = 2; endDay('court'); }));
  },
  skunk() {
    this.begin();
    courtCut([SC.wait(.3), SC.line('judge', 'Third time, Mr. Dupree.', 1.3), SC.line('dan', 'Third time’s the charm!', 1.3)],
      () => say([...this.clean(3), ['JUDGE HARLAN', 'The question before this court is simple. Is the defendant... a Skunk Ape?']],
        () => courtCut([
          // Exhibit A goes up on an easel: the trail cam photo
          SC.sound('snap'), SC.flash(.3), SC.fx(() => CT.add('photo', null, 103, 100, 'down', { draw: (a, t) => C2.photo(a.x, a.y) })),
          SC.line('prosecutor', 'Exhibit A. Seven feet tall.', 1.5), SC.line('dan', 'I’m five-nine.', 1.2), SC.line('prosecutor', 'He stood on a cooler.', 1.4),
        ], () => Objection.run([
          { text: 'The creature in the photo is exactly the defendant’s height.', lie: true, bust: 'He’s five-nine. The thing in the photo is a LOT.' },
          { text: 'The defendant owns a hat that says DAN.', lie: false, over: 'He is wearing it. Right now. In my courtroom.' },
          { text: 'Skunk Apes do not exist.', lie: true, bust: '...Sustained? I don’t know why I said that. I have a feeling.' },
          { text: 'The defendant bought XXXL formal jorts on Tuesday.', lie: false, over: 'Darlene testified. Darlene was very tired.' },
          { text: 'The defendant has never met a cryptid.', lie: true, bust: 'His last character witness was a talking manatee, Counselor.' },
        ], () => this.skunkEnd()))));
  },
  skunkEnd() {
    const F = Game.flags, big = (id, text, d, col) => ({ start() { Scene.bubbles.push({ who: () => actorOf(id), text, life: d, hi: col ? 50 : 48, emote: !!col, col }); Sound.voice('SKUNK APE'); }, dur: col ? d * .6 : d });   // Gary is tall: his bubbles sit above his name tag
    say([['BRENDA', 'The defense calls... the Skunk Ape.']], () => courtCut([
      // the side door creaks; something enormous in XXXL formal jorts ducks through it; juror #4 goes down
      SC.sound('trip'), SC.shake(3), SC.fx(() => CT.add('gary', null, 316, 114, 'left', { draw: (a, t) => C2.gary(a.x, a.y, a.flip, a.named) })),
      SC.all([SC.walk('gary', 240, 112, 30), SC.emote('jury', '!!', .9, PAL.red), SC.fx(() => { Game.courtExtra.ape = true; })]),
      SC.fx(() => CT.add('faint', null, 0, 44, 'down', { draw: () => C2.faint() })), SC.sound('trip'), SC.line('jury', '*faints*', 1.1),
      SC.line('judge', 'State your name.', 1.2), big('gary', 'HRRRRRRRM.', 1.2), SC.fx(() => { const a = actorOf('gary'); if (a) a.named = true; }),
      SC.line('judge', 'Are you the defendant?', 1.3), big('gary', 'HRM. HRRRM HRM HRRRRRRM.', 1.5),
      SC.say([['BRENDA', 'He says “Gary.” And “No, but he’s a good boy, and he shares his beer.”']]),
      // side by side, thumbs up: it is exactly the photo
      SC.line('judge', 'Stand side by side.', 1.2), SC.fx(() => CT.cast()),
      SC.all([SC.walk('dan', 150, 112, 60), SC.walk('gary', 176, 112, 45)]), SC.face('dan', 'down'),
      big('gary', '*thumbs up*', 1.1), SC.sound('snap'), SC.flash(.6), SC.prop('frame', () => C2.frame()), SC.wait(1), SC.unprop('frame'),
      SC.line('judge', 'I can tell them apart.', 1.2), SC.line('judge', 'Barely. The hat helps.', 1.3),
      // *CRASH*: Chuck, out on bail, in a tiny tie. He and Gary hug. The jury weeps.
      SC.sound('boom'), SC.shake(10), SC.flash(.5), SC.fx(() => { Game.courtChuck = 1; CT.gator('chuck', 314, 114, 'left'); CT.add('tie', null, 314, 114, 'down', { draw: a => C2.tie(a) }); }),
      SC.all([SC.walk('chuck', 234, 106, 95), SC.line('judge', 'OF COURSE IT IS.', 1.4)]),
      SC.all([SC.walk('gary', 202, 106, 40), big('gary', '♥', 1.4, PAL.hat), SC.emote('chuck', '♥', 1.4, PAL.hat)]),
      SC.all([SC.sound('sniff'), SC.line('jury', '*weeping*', 1.4)]),
      SC.say([['JUDGE HARLAN', 'NOT GUILTY. On all counts. Get out of my courtroom. ALL of you. Including the ape.']]),
    ], () => { headline('SKUNK APE APPEARS IN COURT IN FORMAL JORTS; FLORIDA MAN CLEARED OF BEING A CRYPTID', 10); F.case3Won = true; this.parade(); }));
  },
  parade() {
    Game.scene = 'parade'; Game.mode = 'court'; Game.courtActors = [];
    // bubble anchors over the float (drawParade draws everyone; these just say where their heads are)
    for (const [id, x, y] of [['merle', 90, 106], ['darlene', 112, 106], ['chuck', 133, 102], ['dan', 160, 106], ['gary', 181, 106], ['rhonda', 214, 106], ['kayden', 236, 106], ['manny', 26, 114]]) CT.add(id, null, x, y, 'down', { anchor: true });
    let pick = 0;
    // bubbles float in the sky above the FLORIDA MAN OF THE YEAR banner, not over it
    const up = (id, text, d, col) => ({ start() { Scene.bubbles.push({ who: () => actorOf(id), text, life: d, hi: col ? 58 : 54, emote: !!col, col }); Sound.voice(String(id).toUpperCase()); }, dur: col ? d * .6 : d });
    const cheer = [
      [up('dan', 'I am NOT a Florida Man.', 1.5), SC.all([SC.shake(4), SC.sound('cash'), up('merle', '!!', 1.2, PAL.red), up('kayden', 'IN THE SASH?!', 1.4)])],
      [up('dan', 'I’d like to thank my gator.', 1.5), SC.all([up('chuck', '♥', 1.4, PAL.hat), up('kayden', 'STANDING OVATION!', 1.4)])],
      [SC.sound('crack'), up('dan', '*crack*', .8), SC.all([SC.sound('crack'), SC.shake(6), SC.flash(.3), up('merle', 'They heard that in Georgia.', 1.6)])],
    ];
    courtCut([
      SC.prop('card', () => label('ONE WEEK LATER', VW / 2, 34, PAL.white, 10)), SC.wait(1.3), SC.unprop('card'),
      up('merle', 'FLORIDA MAN OF THE YEAR...', 1.5), up('merle', '...my cousin, DANNY DUPREE!', 1.5),
      SC.all([SC.sound('cash'), SC.flash(.25), up('kayden', 'LIVE', 1.3, PAL.red), up('manny', '*blub*', 1.3), up('gary', '♥', 1.3, PAL.hat)]),
      SC.say([['BRENDA', 'Dan. Say something. Anything. Make it normal.', [
        ['“I am NOT a Florida Man.” (puts on sash)', () => { pick = 0; return null; }],
        ['“I’d like to thank my gator.”', () => { pick = 1; return null; }],
        ['Crack a Swamp Lite and wave', () => { pick = 2; return null; }]]]]),
    ], () => courtCut([...cheer[pick], SC.prop('card', () => { label('LEGALLY AND OFFICIALLY:', VW / 2, 30, PAL.white, 7); label('THE MOST FLORIDA MAN IN FLORIDA', VW / 2, 42, PAL.yellow, 7); }), SC.wait(2.2)],
      () => { headline('FLORIDA MAN NAMED FLORIDA MAN OF THE YEAR; INSISTS HE IS "NOT A FLORIDA MAN" WHILE WEARING THE SASH', 10); Game.flags.fmoty = true; Game.flags.creditsPending = 3; endDay('court'); }));
  },
};

// ---------- the parade scene ----------
function drawParade(t) {
  for (let y = 0; y < 70; y++) { const k = y / 70; g.fillStyle = `rgb(${255 - k * 20 | 0},${120 + k * 60 | 0},${140 + k * 40 | 0})`; g.fillRect(0, y, VW, 1); }
  g.fillStyle = PAL.yellow; g.beginPath(); g.arc(250, 64, 20, 0, 7); g.fill();
  for (let x = 0; x < VW; x += 7) { const h = 8 + hash2(x, 3) * 14; R(x, 70 - h, 8, h, PAL.grassDD); }
  for (let y = 70; y < VH; y++) R(0, y, VW, 1, y < 74 ? PAL.foam : y % 6 === 0 ? PAL.waterL : PAL.waterD);
  const bob = Math.sin(t * 2) * 1.5, fx = 60, fy = 104 + bob;
  OR(fx, fy, 200, 26, PAL.woodD); R(fx, fy, 200, 4, PAL.woodL); OR(fx + 196, fy - 30, 18, 34, PAL.greyD);   // airboat + fan cage
  for (let i = 0; i < 4; i++) R(fx + 200 + Math.cos(t * 30 + i * 1.6) * 7, fy - 14 + Math.sin(t * 30 + i * 1.6) * 7, 2, 2, PAL.white);
  OR(fx + 20, fy - 48, 160, 13, PAL.white); label('FLORIDA MAN OF THE YEAR', fx + 100, fy - 38, PAL.red, 7);
  R(fx + 30, fy - 35, 2, 36, PAL.woodD); R(fx + 168, fy - 35, 2, 36, PAL.woodD);
  for (let i = 0; i < 6; i++) g.drawImage(SPR.flamingo, fx + 6 + i * 36, fy + 12);
  const cast = [['merle', 22], ['darlene', 44], ['dan', 92], ['rhonda', 146], ['kayden', 168]];
  for (const [who, x] of cast) g.drawImage(SPR[who].down[Math.floor(t * 3 + x) % 2], fx + x, fy - 20 + (who === 'dan' ? Math.round(Math.sin(t * 6)) : 0));
  R(fx + 96, fy - 12, 9, 2, PAL.hat); R(fx + 97, fy - 10, 2, 5, PAL.hat);   // Dan's sash
  g.save(); g.translate(fx + 108, fy - 34); g.scale(1.5, 1.5); g.drawImage(SPR.skunkape, 0, 0); g.restore();
  OR(fx + 60, fy - 6, 20, 6, PAL.gator); OR(fx + 78, fy - 5, 8, 4, PAL.gator); R(fx + 64, fy - 8, 5, 2, PAL.hat); R(fx + 70, fy - 2, 2, 3, PAL.red);   // Chuck in his tie
  g.drawImage(SPR.manatee, 12, 106 + Math.sin(t * 1.5) * 2);   // Manny, beside the float (down at y 140 the talk box hid him)
  for (let i = 0; i < 60; i++) { const x = (hash2(i, 1) * VW + t * 20 * (hash2(i, 5) - .5)) % VW, y = (hash2(i, 2) * VH + t * (30 + hash2(i, 3) * 40)) % VH; R(x, y, 2, 2, [PAL.hat, PAL.yellow, PAL.teal, PAL.white][i % 4]); }
  if (Scene.inCourt()) Scene.draw(0, 0, t);   // the parade's cutscene bubbles and title cards
}

// ---------- extra court staging for the new trials ----------
// Manny and Gary are court actors while their scenes play (drawn by C2 below). The static copies only draw when
// no actor is standing in for them. Name tags sit clear above the heads, never under a sprite.
const courtHas = id => (Game.courtActors || []).some(a => a.id === id);
function drawCourtExtras(t) {
  const E = Game.courtExtra || {};
  if (E.manny && !courtHas('manny')) C2.manny(118, 112, t, true);
  if (E.ape && !courtHas('gary')) C2.gary(202, 106, false, true);
  if (typeof drawOrlandoCourt === 'function') drawOrlandoCourt(E, t);
}
const C2 = {
  // Manny in a kiddie pool (cartoon sharks) on a dolly; x, y = the dolly's wheels
  manny(x, y, t, named) {
    OR(x - 20, y - 11, 40, 9, PAL.blue); R(x - 18, y - 9, 36, 3, PAL.waterL);
    for (let i = 0; i < 3; i++) { R(x - 15 + i * 12, y - 5, 5, 2, PAL.grey); R(x - 13 + i * 12, y - 6, 2, 1, PAL.grey); }
    R(x - 17, y - 2, 3, 3, PAL.ink); R(x + 14, y - 2, 3, 3, PAL.ink);
    const bob = Math.round(Math.sin(t * 2));
    g.drawImage(SPR.manatee, x - 12, y - 19 + bob);   // (he faces the jury, whichever way the dolly rolls)
    if (named) label('MANNY', x, y - 22, PAL.glow, 7);
  },
  // Gary the Skunk Ape, big, in XXXL formal jorts; x, y = his feet
  gary(x, y, flip, named) {
    g.save(); g.translate(Math.round(x - 14), Math.round(y - 34)); g.scale(1.6, 1.6); g.drawImage(flip ? SPR.skunkapeL : SPR.skunkape, 0, 0); g.restore();
    R(x - 9, y - 15, 18, 6, PAL.jorts); R(x - 9, y - 15, 18, 1, PAL.ink); R(x - 1, y - 13, 2, 4, PAL.jortsD);
    if (named) label('GARY', x, y - 37, PAL.yellow, 7);
  },
  // Exhibit A on an easel: the trail cam photo (green night vision, a big hairy thing on a cooler, holding a beer)
  photo(x, y) {
    R(x - 11, y - 12, 2, 12, PAL.woodD); R(x + 9, y - 12, 2, 12, PAL.woodD);
    OR(x - 16, y - 38, 32, 27, PAL.white); R(x - 14, y - 36, 28, 21, '#23402a');
    OR(x - 6, y - 21, 12, 5, PAL.blue); g.drawImage(SPR.skunkape, x - 9, y - 41, 18, 21); R(x + 7, y - 31, 2, 3, PAL.yellow);
    label('EXHIBIT A', x, y - 3, PAL.white, 6);
  },
  // the trail cam framing: Dan and Gary side by side ARE the photo
  frame() {
    const x0 = 132, y0 = 64, x1 = 196, y1 = 118, c = PAL.white;
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { R(sx > 0 ? x : x - 8, y, 8, 1, c); R(x, sy > 0 ? y : y - 8, 1, 8, c); }
    label('REC', x0 + 4, y0 + 9, PAL.red, 6, 'left');
  },
  // juror #4 slides down behind the jury box
  faint() {
    R(18, 44, 16, 14, PAL.woodD); R(18, 44, 16, 3, PAL.woodL);
    g.save(); g.translate(27, 55); g.rotate(1.2); g.drawImage(SPR.tourist.down[0], 0, 0, 16, 14, -8, -7, 16, 14); g.restore();
    R(16, 57, 20, 8, PAL.woodD);
  },
  // Chuck's tiny tie rides along on his neck
  tie(a) {
    const c = (Game.courtActors || []).find(k => k.id === 'chuck'); if (!c) return;
    a.y = c.y + .5; const d = c.dir, x = c.x + (d === 'left' ? -13 : d === 'right' ? 11 : -1), y = c.y + (d === 'up' ? -13 : d === 'down' ? 11 : -1);
    R(x - 1, y - 1, 4, 5, PAL.ink); R(x, y, 2, 3, PAL.red);
  },
  // Kayden's phone, zoomed in on minute three: somebody in a pink visor is hanging off Manny's tail
  zoom(t) {
    OR(148, 36, 92, 64, PAL.ink); R(152, 40, 84, 54, '#2b5570');
    for (let i = 0; i < 5; i++) R(154 + (i * 23 + t * 20) % 78, 48 + i * 9, 8, 1, PAL.waterL);
    g.save(); g.translate(160, 62 + Math.round(Math.sin(t * 3))); g.scale(2, 2); g.drawImage(SPR.manatee, 0, 0); g.restore();
    OR(214, 71, 16, 6, PAL.gator); OR(208, 72, 6, 4, PAL.gator); R(218, 69, 6, 2, PAL.hat);
    label('MIN 3:00', 155, 49, PAL.white, 6, 'left'); R(229, 43, 3, 3, PAL.red);
    if (Math.floor(t * 3) % 2) label('CHUCK?!', 212, 64, PAL.hat, 7);
  },
};

// ---------- credits after each case ----------
const CREDITS = {
  1: ['NOT GUILTY', 'Dan is legally not a Florida Man.<br>(He is.)', 'Next case'],
  2: ['CASE DISMISSED', 'The manatee testified. The alligator was charged instead.<br>Chuck made bail. Nobody knows who paid it.', 'Next case'],
  3: ['FLORIDA MAN OF THE YEAR', 'Three cases. Three acquittals. One sash.<br>The swamp is yours now: favors, headlines, and chaos, forever.<br><br>(Miami is coming.)', 'Keep being Dan'],
};

// ---------- where the objective arrow points for Cases 2-3 + favors ----------
function caseTarget(q) {
  if (!q) return null;   // no objective right now: no arrow (this used to throw and skip the rest of the frame)
  const P = Cases.places(), who = id => Game.npcs.find(n => n.id === id), ape = Game.animals.find(a => a.ape);
  if (q.id.startsWith('fav_')) {
    const f = Favors.get(q.id.slice(4)), d = FAVORS[q.id.slice(4)]; if (!f) return null;
    if (f.state === 'offered' || (d.ready && d.ready())) return who(d.giver);
    if (f.id === 'heist') return Game.pickups.find(p => p.kind === 'rollerdog');
    if (f.id === 'porch') return Game.animals.find(a => a.porch);
    if (f.id === 'kevin' || f.id === 'fishfry') return null;
    return null;
  }
  switch (q.id) {
    case 'kayden': case 'content': return who('kayden') || P.kayden;
    case 'pam': return who('pam') || P.pam;
    case 'trash': return Game.dan.ride === 'boat' ? Game.pickups.find(p => p.kind === 'trash') : Game.boat;
    case 'bed': return World.spots.door;
    case 'lettuce': case 'dogs': case 'jorts': return who('darlene');
    case 'pool': return who('merle');
    case 'manny2': return Game.animals.find(a => a.sober) || P.manny;
    case 'trailcam': case 'lure': return P.trailcam;
    case 'track': case 'rehearse': case 'reunion': return ape || P.den;
  }
  const cn = Cases.info().n;
  if (typeof OrlandoCases !== 'undefined' && (ORLANDO() || cn >= 10)) { const o = OrlandoCases.target(q); if (o !== undefined) return o; }
  if (typeof KeysCases !== 'undefined' && (KEYS() || cn === 8 || cn === 9)) { const k = KeysCases.target(q); if (k !== undefined) return k; }   // (this hook was missing: the Keys never had objective arrows)
  if (typeof DaytonaCases !== 'undefined') { const d = DaytonaCases.target(q); if (d !== undefined) return d; }
  return MiamiCases.target(q);
}
