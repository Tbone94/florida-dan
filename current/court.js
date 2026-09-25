// FLORIDA DAN — Friday. The State of Florida v. Daniel Wayne Dupree.
'use strict';
const OBJECTIONS = [
  'OBJECTION! That iguana had it comin’.', 'OBJECTION! Hearsay! I heard it, and I say it didn’t happen.', 'OBJECTION! I was on medication. Sinus medication.',
  'OBJECTION! Leading the witness! There ain’t even a witness!', 'OBJECTION! That cow and I have an understanding.', 'OBJECTION! Your Honor, have YOU ever been to a hurricane party?',
];
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
    Game.mode = 'court'; Game.courtChuck = 0; showHud(false);
    const hs = Game.headlines.map(h => h.text), picks = hs.slice(-4);
    const ev = picks.length ? picks.flatMap((h, i) => [['PROSECUTOR VANCE', `Exhibit ${'ABCD'[i]}: “${h}”`], ['DAN', OBJECTIONS[i % OBJECTIONS.length]], ['JUDGE HARLAN', /COW/.test(h) ? 'Overruled. ...Did you really spoon a cow?' : ['Overruled.', 'Overruled. Sit DOWN, Mr. Dupree.', 'Overruled.', 'Overruled. Nice try, though.'][i]]])
      : [['PROSECUTOR VANCE', 'Your Honor, the defendant has... zero headlines this week?'], ['JUDGE HARLAN', 'In Florida? Suspicious as hell.']];
    const wit = Q('darlene') ? ['darlene', 'rhonda', 'merle2'].filter(id => Q(id) && Q(id).done).length : 3;
    const pants = Game.flags.pants;
    say([
      ['BAILIFF', 'All rise for the Honorable Judge Harlan P. Swamp.'],
      ['JUDGE HARLAN', 'Be seated. The State of Florida versus Daniel Wayne Dupree.'],
      ['JUDGE HARLAN', 'Charges: assault on a lawn flamingo, and — I’m quoting the complaint — “being a Florida Man.”'],
      ...(pants ? [['JUDGE HARLAN', '...Are those black jorts? Formal jorts? Respect.']] : [['JUDGE HARLAN', 'Counselor, why is your client in regular jorts.'], ['BRENDA', 'I asked him, Your Honor. I ASKED him.']]),
      ['JUDGE HARLAN', 'How do you plead?', [
        ['“Not guilty.”', () => [['JUDGE HARLAN', 'Noted. Nobody believes you, but noted.']]],
        ['“Not a Florida Man.”', () => [['JUDGE HARLAN', 'That’s not a plea, son.'], ['DAN', 'It’s a lifestyle, Your Honor.']]],
        ...(Game.inv.beer > 0 ? [['Crack open a Swamp Lite', () => { Game.inv.beer--; Sound.play('crack'); return [['', '*crack*'], ['JUDGE HARLAN', '...Is that a Swamp Lite?'], ['DAN', 'Want one?'], ['JUDGE HARLAN', 'After. Proceed.']]; }]] : []),
      ]],
      ['PROSECUTOR VANCE', 'Your Honor, the State submits this week’s edition of the Swamp Gazette.'],
      ...ev,
      ['BRENDA', `Your Honor, my client has ${wit === 3 ? 'THREE' : wit} character witness${wit === 1 ? '' : 'es'}.`],
      ...(wit === 3 ? [['BRENDA', 'A gas station clerk, a deputy who “only signed about the sign,” and... Merle Haggard.'], ['JUDGE HARLAN', 'Merle Haggard died in 2016.'], ['BRENDA', 'He’s... very committed, Your Honor.']] : [['JUDGE HARLAN', 'That’s less than three, counselor.']]),
      ['JUDGE HARLAN', 'Mr. Dupree. Anything to say before I rule?', [
        ['“I am NOT a Florida Man.”', () => [['JUDGE HARLAN', 'Duly noted.']]],
        ['“I’m a man. In Florida. It’s different.”', () => [['JUDGE HARLAN', 'Is it though.']]],
        ['“Can I get a Swamp Lite?”', () => [['BRENDA', 'DAN.']]],
      ]],
      ['', '*CRASH*'],
      ['', 'The courtroom doors explode inward.'],
      ['JUROR #4', 'THAT’S AN ALLIGATOR!'],
      ['JUDGE HARLAN', 'IS THAT A GOD DAMN ALLIGATOR IN MY COURTROOM?'],
      ['DAN', 'That’s Chuck. He followed me all week. He’s got... issues.'],
      ['???', 'Do not run, Daniel...'],
      ['DAN', 'Manny?!'],
      ['BRENDA', 'Who the hell is Manny?!'],
    ], () => { Game.courtChuck = 1; this.fight(); });
  },
  fight() {
    Wrestle.start({ foe: 'chuck', arena: 'court', onWin: () => this.win(), onLose: () => { Game.mode = 'court'; say([['', 'Chuck bites Dan on the butt. Gallery gasps.'], ['DAN', 'THAT ALL YOU GOT?'], ['', 'Dan gets back up. (Mash E, match the arrows!)']], () => this.fight()); } });
  },
  win() {
    Game.courtChuck = 2; Game.mode = 'court';
    headline('FLORIDA MAN ACQUITTED OF BEING A FLORIDA MAN AFTER WRESTLING ALLIGATOR IN COURTROOM', 20);
    say([
      ['', 'Dan holds Chuck’s jaws shut with one hand. With the other, he points at the jury.'],
      ['JURY', 'DAN! DAN! DAN! DAN!'],
      ['JUDGE HARLAN', 'Order. ORDER.'], ['JUDGE HARLAN', 'In thirty-one years on this bench... I have never seen...'],
      ['JUDGE HARLAN', 'NOT GUILTY. On all counts.'], ['JUDGE HARLAN', 'Also, I’m keeping the alligator.'], ['CHUCK', '*happy hiss*'],
      ['DAN', 'See, Brenda? Told you. NOT a Florida Man.'], ['BRENDA', 'Dan. You are holding an alligator. In a courtroom. In jorts.'],
      ['DAN', '...Wanna get a Swamp Lite?'], ['BRENDA', '...Yeah. Yeah I do.'],
    ], () => { Game.flags.acquitted = true; Game.flags.creditsPending = 1; endDay('court'); });
  },
  update(dt) { },
  drawRoom(t, fighting) {
    R(0, 0, VW, VH, '#6b4a2e');
    for (let x = 0; x < VW; x += 20) R(x, 0, 1, 70, '#5a3d25');
    R(0, 70, VW, VH - 70, '#8e5a36'); for (let y = 76; y < VH; y += 8) R(0, y, VW, 1, '#7a4a2b');
    OR(110, 18, 100, 34, PAL.woodD); R(110, 18, 100, 4, PAL.woodL);                    // bench
    label('IN GOD WE TRUST (MOSTLY)', 160, 12, PAL.yellow, 5);   // on the wall, behind the judge
    g.drawImage(SPR[ORLANDO() ? 'blossom' : KEYS() ? 'pinder' : DAYTONA() ? 'pettibone' : MIAMI() ? 'vega' : 'judge'].down[0], 0, 0, 16, 18, 152, 2, 16, 18);   // (source x was 152: the judge never showed up)
    OR(150, 60, 22, 8, PAL.yellow); OR(154, 28, 12, 10, PAL.blue); R(158, 30, 4, 6, PAL.white);    // seal
    OR(14, 44, 70, 40, PAL.woodD); R(14, 44, 70, 3, PAL.woodL); label('JURY', 49, 42, PAL.white, 6);
    const jurors = ['tourist', 'merle', 'darlene', 'tourist', 'rhonda', 'tourist'];
    jurors.forEach((j, i) => { const jump = fighting || Game.courtChuck === 2 ? Math.abs(Math.sin(t * 8 + i)) * 4 : 0; g.drawImage(SPR[j].down[0], 0, 0, 16, 14, 18 + (i % 3) * 22, 28 + Math.floor(i / 3) * 16 - jump, 16, 14); });
    OR(236, 70, 70, 16, PAL.woodD);
    if (!fighting) {
      g.drawImage(SPR.dan.up[0], 150, 120); g.drawImage(SPR[ORLANDO() ? 'brenda' : 'darlene'].up[0], 176, 120);   // Orlando: Brenda, in person, finally
      OR(130, 140, 70, 10, PAL.woodL);
      if (Game.courtChuck === 2) { g.drawImage(SPR.judge.down[0], 250, 118); }
    }
    OR(292, 90, 26, 60, PAL.woodD); if (Game.courtChuck) { R(292, 90, 26, 60, PAL.black); label('*CRASH*', 300, 86, PAL.yellow, 8); }
  },
  draw(t) {
    if (Game.scene === 'parade') return drawParade(t);
    if (Game.scene === 'finale') return drawFinale(t);
    this.drawRoom(t, false); drawCourtExtras(t);
    if (Game.courtChuck === 1 && Game.mode === 'talk') { g.save(); g.translate(270, 140); for (let i = 0; i < 1; i++); g.restore(); OR(246, 132, 50, 12, PAL.gator); OR(290, 134, 16, 8, PAL.gator); OR(236, 135, 12, 6, PAL.gatorD); OR(254, 128, 10, 3, PAL.hat); }
    if (Game.courtChuck === 2) { OR(180, 130, 50, 12, PAL.gator); OR(226, 132, 16, 8, PAL.gator); OR(186, 126, 10, 3, PAL.hat); label('NOT GUILTY', VW / 2, 90, PAL.yellow, 14); }
  },
};
