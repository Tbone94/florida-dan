# Playtests

Headless Chrome playtests (Playwright from `~/Projects/_tools/record-kit`). Start the `florida-dan` preview server on :8811, then:

```
tools/playtests/runall.sh
```

- `fullrun.mjs [mobile]` — every day 1–30 in the right region: fuzzed input, objective-arrow checks, and all 9 trials played to the credits.
- `keys.mjs [mobile] [outdir]` — the Keys: both cases end to end with asserts (bridge run, declaration, citizens, sunset dance, dives, tarpon, Rex chase, trials), set-piece screenshots.
- `phone.mjs`, `flam.mjs`, `lambo.mjs`, `fixes2.mjs` — self-playing calls/texts/whistle, lawn flamingos, the Lambo soft-lock, the 9/24 bug-pass regressions.
- `lint.py` — runs first: syntax, code swallowed by `//` comments, and const clashes across scripts.
- `dayt.mjs` / `dayt2.mjs` — Daytona Cases 6–7 end to end; Daytona gigs, shops, race loss/retry, motel sleep, pier fishing.
- `court1.mjs [desktop]` — Case 1 trial on a phone (tapping the on-screen E) and on desktop.
- `gigs.mjs`, `p2.mjs`, `up.mjs` — swamp gigs; bribes/detector/surf shop/Miami gigs; Bubba's upgrades.
- `tb2.mjs`, `seq.mjs`, `wanda.mjs`, `cont.mjs`, `swarm.mjs` — Trash Baby, headline/dialogue sequencing, hurricane skip, save+Continue, raccoon/gator pressure.
- `fixes.mjs` — launch-polish regressions (no skipping a case, blackout away from home, gigs across the bus, race retry, mid-day saves). `tour.mjs` / `menus.mjs` — phone screenshots of every mechanic and menu for eyeballing.
- `fullmap.mjs <region> <out.png>` — renders a whole map to one image.
