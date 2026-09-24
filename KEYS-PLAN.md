# Florida Dan — The Keys (plan, 2026-09-24)

Stage 4 of the expansion roadmap (upgrades ✅, Florida Man gigs ✅, Dan anims ✅, Daytona ✅). Status: **PLAN — waiting on owner decisions (bottom).**

## Shape
- New region `keys`, unlocked after Case 7 (Daytona 250). Two cases, same 3-day rhythm as everything else:
  - **Case 8 — "The Republic of Dan"** · days 23–25
  - **Case 9 — "The Atocha Job"** · days 26–28
  - Endless moves to day 29+ (all four regions by Greyhound).
- Save migration: players already past day 22 in endless get the Keys starting the *next* day they sleep (store `F.keysFrom = day`, compute case days relative to it) so nobody's endless run gets hijacked mid-day.

## The map (one 90×60 region, like Miami/Daytona)
Left → right is a road trip down US-1:
- **Big Pine Key** (west edge = arrival): Greyhound stop, key deer (tiny, protected; punching one = instant 5★ + the worst headline in the game), bait shop.
- **The Seven Mile Bridge**: a long strip of road over turquoise water across the middle of the map. Cooler/cars drive it; the old broken bridge runs alongside (secret spot).
- **A middle key**: Robbie's-style tarpon dock (feed the tarpon, they jump and steal the bait bucket), a tiki bar, the houseboat marina.
- **Key West old town** (east): Duval Street bar crawl, Mallory Square sunset pier, the Southernmost Point buoy, a Hemingway-style house full of six-toed cats, roosters loose everywhere, the Monroe County courthouse.
- Look: its own GRADE in look.js — hot turquoise water, bleached pastels, pink-orange sunset hour. Music: Swamp Lite with a steel-drum/ukulele layer (same trick as Miami's arp layer, one continuous song).

## Case 8 — "The Republic of Dan" (days 23–25)
Dan rents a houseboat for "a quiet week." At sunset, eleven beers deep, he declares it a sovereign nation, raises a flag made of jorts, and fires a Freedom Rocket at a passing Coast Guard cutter. Charge: **"Secession (Maritime)."**
- Day 1: cold open cutscene (the declaration), Brenda call (packed call format), tow the houseboat back before the Coast Guard does (boat), find the jorts flag (it's flying on Duval St).
- Day 2: a nation needs citizens: recruit 3 — a six-toed cat (lure with fish), a rooster (chase + GIT herding, reuses the cow-herd code), and a very drunk tourist. **Sunset Celebration** performance at Mallory Square (reuse Dance with a new "street performer" track) for "diplomatic recognition."
- Day 3: court. The Conch Republic joke pays off: the judge's own grandpa seceded in '82; Objection minigame + a "treaty signing" finale.

## Case 9 — "The Atocha Job" (days 26–28)
Snorkeling the old bridge, Dan finds a gold coin. A treasure-hunting outfit (and a TV crew) say it's theirs. Then Dan finds a lot more. Charge: **"Grand Theft Galleon."**
- **New minigame: Dive** (side view, like the fishing screen): swim down, grab coins/junk, air meter, dodge a barracuda and jellyfish; buzz makes it wobbly, joint makes it slow and pretty. This is the Keys' signature mechanic and gets reused by an endless-mode dive gig.
- Tarpon-feeding set piece, a lobster mini-season gig (every tourist in the water at once), boat chase vs the treasure crew (reuse BoatChase with reef hazards).
- Day 3: court → **Florida Man of the Year: Grand Finale** parade down Duval (the FMOTY parade exists already; this is a bigger version) + full-series credits.

## Around it
- Gigs (3–4): roosters out of the bar, lobster-season crowd control, sunset pier "performer" shift, hauling a drunk guy's kayak back from "halfway to Cuba."
- Neighbor arc (2–3 chapters): the six-toed cat's owner, a retired treasure diver.
- Shops: conch shack (conch fritters / Key lime pie as new consumables with their own buzz effects), T-shirt shack (upgrade: "My Parents Went To Key West" shirt, snorkel set, glass-bottom cooler).
- ~20 new headlines, 4–5 cutscenes, travel lines, rap-sheet entries, Gazette variants.

## Build plan (small files, like Daytona)
1. `keys.js` — `buildKeys()` map, spots, `Keys.spawn()`, interactions, bus stop; add `keys` to `busMenu`, `REGION_NAMES`, `TRAVEL_LINES`, the look GRADE and the music layer.
2. `keys2.js` — `KeysCases` (8 + 9), `KeysCourt`, `Dive` minigame, Keys gigs + shops.
3. Hook-ups: `Cases.info` (+ save migration), `CASE_NAMES`, `courtCase()`, `ui.js` MUST table (replay a missed court day), `gigs.js` STORY_NPCS.
4. Tests: `tools/playtests/keys.mjs` (both cases end to end, dive fail/retry, travel in/out) + extend `fullrun.mjs` to day 30. Phone + desktop.
5. Trailer: a Keys shot or two for the next cut.

Rough size: Daytona was ~620 lines across two files; Keys should be about the same plus the Dive minigame (~150).

## Owner decisions needed
1. **Premises** — OK with "Republic of Dan" (secession) and "Atocha Job" (treasure)? Alternates if not: "Six-Toed Cat Custody Battle", "Lobster Mini-Season Massacre".
2. **Getting there** — Greyhound like everywhere else, *or* Dan drives the cooler down the Seven Mile Bridge as a set piece (more fun, ~1 extra hour of work).
3. **Dive minigame** — new mechanic (recommended) or keep it smaller and reuse fishing?
4. **Is this the finale?** Case 9 ends with the big FMOTY parade + series credits, or keep the ending open for more regions (Tampa? Orlando theme parks?).
