// FLORIDA DAN — lawn flamingos. Charged for fighting one; now he buys them by the armful.
// Plant one where Dan is facing (hotbar), pull it back up (E), punch it over for old times' sake.
// They live in Game.flags.flamingos ({ r: region, x, y, down }) so they save and stay put.
'use strict';

const FLAMINGO_SAYS = {
  merle: '...Danny. He’s beautiful.', darlene: 'I sold you that. I’m not proud of it.', rhonda: 'I’m writing this down, Dan.',
  bubba: 'Nice bird. Bail’s extra.', wayne: 'Oh he’s WATCHING, man. He sees everything.', lurleen: 'Finally. Some CLASS in this park.',
  skeeter: 'Put a lil umbrella in its drink.', rita: 'He can stay if he pays.', boomer: 'Don’t put him near the merchandise.', earl: 'The cows are gonna think that’s a god.',
};

const Flamingos = {
  list: () => Game.flags.flamingos || (Game.flags.flamingos = []),
  // placed flamingos are ordinary non-solid props, so they draw in y-order with everything else
  sync() {
    if (!World.props) return;
    for (let i = World.props.length - 1; i >= 0; i--) if (World.props[i].placed) World.props.splice(i, 1);
    for (const f of this.list()) if (f.r === Game.region) World.props.push({ kind: 'flamingo', x: f.x - 4, y: f.y - 3, w: 8, h: 6, solid: false, placed: f, down: f.down });
  },
  at(pt, r = 10) {   // any flamingo prop (placed or the ones already on the map)
    let best = null, bd = r;
    for (const p of World.props) if (p.kind === 'flamingo') { const d = Math.hypot(p.x + 4 - pt.x, p.y + 3 - pt.y); if (d < bd) { bd = d; best = p; } }
    return best;
  },
  place() {
    const D = Game.dan;
    if (D.ride) { toast(`Not from the ${D.ride === 'boat' ? 'boat' : 'driver’s seat'}, Dan.`); Sound.play('fail'); return; }
    const f = facingPoint(12), k = World.at(f.x, f.y);
    if (!WALKABLE(k) || WET(k)) { toast('Not in the water, Dan. It would float off and some manatee would have a flamingo.'); Sound.play('fail'); return; }
    if (World.solidAt(f.x, f.y)) { toast('Something’s in the way. The flamingo needs dirt.'); Sound.play('fail'); return; }
    if (this.at(f, 7)) { toast('There’s already a flamingo there. They need their space.'); Sound.play('fail'); return; }
    Game.inv.flamingo--; this.list().push({ r: Game.region, x: Math.round(f.x), y: Math.round(f.y) }); this.sync();
    D.punchT = .12; Sound.play('plant'); updateHotbar();
    const n = this.list().length, here = this.list().filter(q => q.r === Game.region).length, F = Game.flags;
    const nb = Game.npcs.filter(p => Math.hypot(p.x - f.x, p.y - f.y) < 60).sort((a, b) => Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y))[0];
    if (nb) toast(`${(nb.name || nb.id).toUpperCase()}: ${FLAMINGO_SAYS[nb.id] || pick(['...Why.', 'Oh, hell yes.', 'Is that... for me?', 'Sir. SIR.'])}`, 3);
    else toast(pick(['*thunk* A flamingo. Right there. Perfect.', 'Dan steps back. Admires it. Nods.', 'It looks like it belongs. It does not belong.']), 2.2);
    const road = k === T.ROAD || k === T.ROADV || (T.TRACK !== undefined && k === T.TRACK);
    if (!F.flamFirst) { F.flamFirst = true; headline('FLORIDA MAN AT CENTER OF “FLAMINGO INCIDENT” SEEN BUYING MORE FLAMINGOS', 3); }
    else if (road && !F.flamRoad) { F.flamRoad = true; headline('LAWN FLAMINGO PLACED IN MIDDLE OF ROAD; DRIVERS GO AROUND IT “OUT OF RESPECT”', 2); }
    else if (World.spots.court && Math.hypot(World.spots.court.x - f.x, World.spots.court.y - f.y) < 90 && !F.flamCourt) { F.flamCourt = true; headline('PLASTIC FLAMINGO LEFT OUTSIDE COURTHOUSE; JUDGE CALLS IT “A THREAT”', 3); }
    else if (here === 5 && !F['flamFlock_' + Game.region]) { F['flamFlock_' + Game.region] = true; headline('FLOCK OF PLASTIC FLAMINGOS APPEARS OVERNIGHT; NEIGHBORS “NOT SURPRISED”', 2); }
    else if (n === 15 && !F.flamArmy) { F.flamArmy = true; headline('FLORIDA MAN’S FLAMINGO ARMY NOW OUTNUMBERS LOCAL POLICE', 3); }
  },
  interaction() {   // facing one: stand it back up, or pull it up and take it with you
    const D = Game.dan; if (D.ride) return null;
    const p = this.at(facingPoint(12), 9); if (!p) return null;
    if (p.down) return { label: 'Stand the flamingo back up', fn: () => { p.down = 0; if (p.placed) p.placed.down = 0; toast('Dan dusts him off. No hard feelings.', 2); Sound.play('pickup'); } };
    if (p.placed) return { label: 'Pull up the flamingo', fn: () => { const L = this.list(); L.splice(L.indexOf(p.placed), 1); this.sync(); giveItem('flamingo'); updateHotbar(); } };
    return null;
  },
  punch(pt) {   // it's what he's known for
    const p = this.at(pt, 12); if (!p) return false;
    if (p.down) { toast('He’s already down, Dan.', 1.6); Sound.play('whiff'); return true; }
    p.down = Game.dan.x < p.x + 4 ? 1 : -1; if (p.placed) p.placed.down = p.down;
    Sound.play('punch'); Game.shake = 3; Game.hitstop = .06; Game.kick = 1;
    Game.parts.push({ kind: 'text', x: p.x + 4, y: p.y - 14, vx: 0, vy: -16, life: .7, text: pick(PUNCH_WORDS) });
    for (let i = 0; i < 6; i++) Game.parts.push({ kind: 'spark', x: p.x + 4, y: p.y - 6, vx: rnd(-40, 40), vy: rnd(-50, -10), life: .3, c: PAL.hat });
    const F = Game.flags; F.flamPunch = (F.flamPunch || 0) + 1;
    if (F.flamPunch === 1) headline('FLORIDA MAN CHARGED WITH FIGHTING LAWN FLAMINGO FIGHTS ANOTHER LAWN FLAMINGO', 4);
    else toast(pick(['It had it coming.', 'Round two goes to Dan.', 'Brenda would not like this.', 'He looked at Dan funny.']), 1.8);
    return true;
  },
};
// re-plant this region's flamingos whenever a map loads (travel, Continue)
{ const load = World.load; World.load = function (id) { load.call(this, id); Flamingos.sync(); }; }
