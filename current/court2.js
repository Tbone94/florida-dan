// FLORIDA DAN — the Manatee and Skunk Ape trials, the OBJECTION! minigame, the Florida Man
// of the Year parade, and where the objective arrow points for everything added in Cases 2-3.
'use strict';

// ---------- OBJECTION! (object only to the lies; 3 seconds per statement) ----------
const Objection = {
  s: null,
  run(list, then) { this.s = { list, i: 0, t: 0, phase: 'show', score: 0, then }; Game.mode = 'objection'; this.show(); },
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
    ui.talkWho.textContent = MIAMI() ? 'JUDGE VEGA' : 'JUDGE HARLAN';
    ui.talkLine.textContent = objected ? (it.lie ? 'Sustained. ' + (it.bust || '') : 'Overruled. ' + (it.over || 'That one was true, son.')) : (it.lie ? (it.miss || 'The jury nods along. That was a lie, Dan. You let it slide.') : (it.ok || 'Noted.'));
    setTimeout(() => Sound.play(right ? 'cash' : 'fail'), 120);
  },
  finish() {
    const s = this.s; this.s = null; this.speaker = null; ui.talk.hidden = true; ui.fishMsg.textContent = ''; Game.mode = 'court';
    if (s.score === s.list.length) headline('FLORIDA MAN OBJECTS AT EVERY LIE, IS RIGHT EVERY TIME; LAWYERS "FURIOUS"', 3);
    s.then(s.score, s.list.length);
  },
};

const CLEAN_LIMIT = { 2: 10, 3: 8 };
const CourtCases = {
  begin() { Game.mode = 'court'; Game.courtChuck = 0; Game.courtExtra = {}; showHud(false); },
  // fewer headlines during the case = a nicer judge (and a collectible)
  clean(n) {
    const got = Game.headlines.length - (Game.flags['caseStart' + n] || 0), J = MIAMI() ? 'JUDGE VEGA' : 'JUDGE HARLAN';
    if (got <= CLEAN_LIMIT[n]) { headline('FLORIDA MAN MAKES IT THROUGH A WHOLE CASE WITH BARELY ANY HEADLINES; SCIENTISTS "CONCERNED"', 1); return [[J, `Only ${got} headlines this week, Mr. Dupree. For you, that is practically a vow of silence.`]]; }
    return [[J, `You made the paper ${got} times this week, Mr. Dupree. ${got} times. I read every one. At breakfast.`]];
  },
  manatee() {
    this.begin(); const F = Game.flags;
    say([['BAILIFF', 'All rise for the Honorable Judge Harlan P. Swamp.'], ['JUDGE HARLAN', 'Mr. Dupree. Again.'], ['DAN', 'Your Honor. Again.'], ...this.clean(2),
      ['JUDGE HARLAN', 'The charge: Unlawful Manatee Operation. Prosecution.'], ['PROSECUTOR VANCE', 'I will now describe the video, Your Honor. The defense may object if I say anything false.'], ['BRENDA', '(whispering) Only object to the LIES, Dan.']],
    () => Objection.run([
      { text: 'On the night of the hurricane, the defendant rode a manatee.', lie: false, ok: 'The jury nods. That part’s just true.', over: 'You rode it, son. Forty million people watched you ride it.' },
      { text: 'The defendant was wearing a tuxedo.', lie: true, bust: 'He was wearing jorts. He only owns jorts.' },
      { text: 'The defendant shouted “YEEHAW” eleven times.', lie: true, bust: 'It was twelve. I counted.' },
      { text: 'The manatee appeared to be enjoying itself.', lie: false, over: 'The manatee was SMILING. It’s in the video.' },
      { text: 'The defendant is a trained, professional manatee jockey.', lie: true, bust: 'Nobody trained him. Look at him.' },
      { text: 'The defendant had never been in the newspaper before that night.', lie: true, bust: 'He is in the paper every single day, Counselor.' },
    ], (score, of) => this.manateeEnd(score, of)));
  },
  manateeEnd(score, of) {
    const F = Game.flags; Game.courtExtra.manny = true;
    say([['JUDGE HARLAN', score >= of - 1 ? 'Well objected, Mr. Dupree. Did you go to law school?' : 'That was a lot of wrong objecting, Mr. Dupree.'], ['DAN', score >= of - 1 ? 'I watched a lot of TV in the jail.' : 'I panicked, Your Honor.'],
      ['BRENDA', F.pamLetter ? 'We submit a letter from Dr. Pam, thirty years a manatee rescuer. It says Dan is “surprisingly gentle with sea cows.”' : 'Our expert declined to write a letter. She said, quote, “absolutely not.”'],
      ['BRENDA', 'And the defense calls... Manny the Manatee.'], ['', 'The doors open. Merle wheels in a kiddie pool on a dolly. It has cartoon sharks on it. There is a manatee in it.'],
      ['JUDGE HARLAN', '...Is that a manatee in a kiddie pool in my courtroom.'], ['MANNY THE MANATEE', 'Your Honor. Daniel was a gentle and respectful rider.'], ['JUDGE HARLAN', 'IT TALKS?'], ['DAN', 'You can hear him too?!'],
      ['MANNY THE MANATEE', 'I direct the court to minute three of the video. Where Daniel was NOT the first to ride me that night.'], ['KAYDEN', '(from the gallery) BRO. ZOOM IN.'],
      ['', 'Everyone squints at Kayden’s phone. In the corner of the video, clinging to Manny’s tail, wearing a tiny pink visor: CHUCK.'],
      ['JUDGE HARLAN', '...Case dismissed. Somebody arrest that alligator.'], ['CHUCK', '*hiss* (from the back row)'], ['RHONDA', 'On it.']],
    () => { headline('MANATEE TESTIFIES IN COURT; FLORIDA MAN ACQUITTED, ALLIGATOR CHARGED INSTEAD', 10); F.case2Won = true; F.creditsPending = 2; endDay('court'); });
  },
  skunk() {
    this.begin();
    say([['BAILIFF', 'All rise. Again.'], ['JUDGE HARLAN', 'Third time, Mr. Dupree.'], ['DAN', 'Third time’s the charm, Your Honor.'], ...this.clean(3),
      ['JUDGE HARLAN', 'The question before this court is simple. Is the defendant... a Skunk Ape?'],
      ['PROSECUTOR VANCE', 'Exhibit A. The trail cam photo. Seven feet tall. Covered in mud. Holding a Swamp Lite.'], ['DAN', 'I’m five-nine.'], ['PROSECUTOR VANCE', 'He was standing on a cooler, Your Honor.']],
    () => Objection.run([
      { text: 'The creature in the photo is exactly the defendant’s height.', lie: true, bust: 'He’s five-nine. The thing in the photo is a LOT.' },
      { text: 'The defendant owns a hat that says DAN.', lie: false, over: 'He is wearing it. Right now. In my courtroom.' },
      { text: 'Skunk Apes do not exist.', lie: true, bust: '...Sustained? I don’t know why I said that. I have a feeling.' },
      { text: 'The defendant bought XXXL formal jorts on Tuesday.', lie: false, over: 'Darlene testified. Darlene was very tired.' },
      { text: 'The defendant has never met a cryptid.', lie: true, bust: 'His last character witness was a talking manatee, Counselor.' },
    ], () => this.skunkEnd()));
  },
  skunkEnd() {
    const F = Game.flags; Game.courtExtra.ape = true;
    say([['BRENDA', 'The defense calls... the Skunk Ape.'], ['', 'The doors creak open. Something enormous ducks through them. It is wearing XXXL formal jorts.'], ['JUROR #4', '*faints*'],
      ['JUDGE HARLAN', 'State your name for the record.'], ['SKUNK APE', 'HRRRRRRRM.'], ['BRENDA', 'He says “Gary.”'], ['JUDGE HARLAN', 'Gary. Are you the defendant?'],
      ['SKUNK APE', 'HRM. HRRRM HRM HRRRRRRM.'], ['BRENDA', 'He says “No, but he’s a good boy, and he shares his beer.”'], ['JUDGE HARLAN', 'Stand side by side. Both of you.'],
      ['', 'Dan and Gary the Skunk Ape stand side by side. They both do a thumbs up. It is exactly the photo.'], ['JUDGE HARLAN', '...I can tell them apart. Barely. The hat helps.'],
      ['', '*CRASH*'], ['', 'The doors explode inward. It’s Chuck. Out on bail. Wearing a tiny tie.'], ['JUDGE HARLAN', 'OF COURSE IT IS.'],
      ['', 'Chuck and Gary hug in the middle of the courtroom. The jury weeps. The bailiff weeps. Brenda weeps a little.'], ['JUDGE HARLAN', 'NOT GUILTY. On all counts. Get out of my courtroom. ALL of you. Including the ape.']],
    () => { headline('SKUNK APE APPEARS IN COURT IN FORMAL JORTS; FLORIDA MAN CLEARED OF BEING A CRYPTID', 10); F.case3Won = true; this.parade(); });
  },
  parade() {
    Game.scene = 'parade'; Game.mode = 'court';
    say([['', 'ONE WEEK LATER. THE FIRST ANNUAL COUNTY ROAD 29 WATER PARADE.'], ['MERLE', 'Ladies, gentlemen, gators, and apes! This year’s FLORIDA MAN OF THE YEAR is...'],
      ['MERLE', '...my cousin, DANNY DUPREE!'], ['', 'The crowd goes wild. Kayden is livestreaming. Chuck is wearing the tie again. Manny blows a bubble. Gary eats a roller dog.'],
      ['BRENDA', 'Dan. Say something. Anything. Please. Make it normal.'], ['DAN', '', [
        ['“I am NOT a Florida Man.” (puts on the sash)', () => [['', 'He says it wearing the sash. On an airboat. Next to a Skunk Ape. The crowd loses its mind.']]],
        ['“I’d like to thank my gator.”', () => [['CHUCK', '*proud hiss*'], ['', 'Chuck gets a standing ovation.']]],
        ['Crack a Swamp Lite and wave', () => [['', '*crack*'], ['', 'Three hundred people crack a Swamp Lite at the same time. The sound is heard in Georgia.']]]]],
      ['', 'Daniel Wayne Dupree is now, legally and officially, the most Florida Man in Florida.']],
    () => { headline('FLORIDA MAN NAMED FLORIDA MAN OF THE YEAR; INSISTS HE IS "NOT A FLORIDA MAN" WHILE WEARING THE SASH', 10); Game.flags.fmoty = true; Game.flags.creditsPending = 3; endDay('court'); });
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
  g.drawImage(SPR.manatee, 20, 140 + Math.sin(t * 1.5) * 2);
  for (let i = 0; i < 60; i++) { const x = (hash2(i, 1) * VW + t * 20 * (hash2(i, 5) - .5)) % VW, y = (hash2(i, 2) * VH + t * (30 + hash2(i, 3) * 40)) % VH; R(x, y, 2, 2, [PAL.hat, PAL.yellow, PAL.teal, PAL.white][i % 4]); }
}

// ---------- extra court staging for the new trials ----------
function drawCourtExtras(t) {
  const E = Game.courtExtra || {};
  if (E.manny) { OR(40, 130, 46, 12, PAL.blue); R(42, 132, 42, 3, PAL.waterL); for (let i = 0; i < 3; i++) R(46 + i * 13, 136, 5, 3, PAL.grey); g.drawImage(SPR.manatee, 51, 118 + Math.sin(t * 2)); label('MANNY', 63, 116, PAL.glow, 7); }
  if (E.ape) { g.save(); g.translate(236, 92); g.scale(1.6, 1.6); g.drawImage(SPR.skunkape, 0, 0); g.restore(); R(245, 118, 12, 6, PAL.black); label('GARY', 250, 88, PAL.yellow, 7); }
}

// ---------- credits after each case ----------
const CREDITS = {
  1: ['NOT GUILTY', 'Dan is legally not a Florida Man.<br>(He is.)', 'Next case'],
  2: ['CASE DISMISSED', 'The manatee testified. The alligator was charged instead.<br>Chuck made bail. Nobody knows who paid it.', 'Next case'],
  3: ['FLORIDA MAN OF THE YEAR', 'Three cases. Three acquittals. One sash.<br>The swamp is yours now: favors, headlines, and chaos, forever.<br><br>(Miami is coming.)', 'Keep being Dan'],
};

// ---------- where the objective arrow points for Cases 2-3 + favors ----------
function caseTarget(q) {
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
  return MiamiCases.target(q);
}
