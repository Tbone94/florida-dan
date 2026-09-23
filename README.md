# FLORIDA DAN — “I’m *not* a Florida Man.”

Dan, 44, lives in a cabin off County Road 29 with a jon boat, a motorized cooler, and a grudge against a gator named Chuck. He goes to court Friday for The Flamingo Incident. He has four days to prove he’s not a Florida Man.

He is extremely a Florida Man.

An unhinged pixel-art swamp game in plain HTML/JS — no build step, no engine, no asset files. Every sprite is hand-pixeled in code and every sound is synthesized.

▶ **Play:** https://tbone94.github.io/florida-dan/  
▶ **Trailer:** [`promo/florida-dan-trailer.mp4`](promo/florida-dan-trailer.mp4)

## Play it locally

```bash
cd current && python3 -m http.server 8811
```
Then open http://localhost:8811.

## Controls

| | Keyboard | Controller |
|---|---|---|
| Move | WASD / arrows | Left stick / d-pad |
| Use / talk / reel / wrestle | E / Space | A |
| Punch (or throw an empty) | F | X |
| Yell “GIT!” | Q | B |
| Use an item | 1–9 | LT (LB/RB to pick) |
| Run | Shift | RT |
| Rap sheet (to-do, controls, every headline) | J | Y |
| Pause / mute | Esc / M | Start / Select |

Touch: on-screen stick + buttons.

## What’s in the swamp

- **Four-day story:** a fish fry that ends in a turkey-fryer fire, three character witnesses (one is a raccoon stuck in an ice machine), Hurricane Wanda, a manatee spirit named Manny, and a courtroom finale where Chuck bursts in.
- **Substances change how the game looks and plays** (WebGL post shader): beer (double vision, blackouts that teleport you), doobies (slow-mo), cow-pie shrooms (melting world, reversed controls, talking animals), “sinus medicine” (2× speed, then a crash), roller dogs (find a toilet in 35 seconds).
- **Headlines are the score.** Every Florida Man thing Dan does prints a BREAKING headline and raises the allegation meter. End of each day: the Swamp Gazette.
- Punch gators (three hits and they give up — Chuck hits back), Blue Marlin-style side-view fishing, gator and python wrestling, a motorized cooler with headlights, Gulp-N-Go shop, save per day.

## Layout

```
current/            the game (open index.html via any static server)
  engine.js         input (keys/touch/gamepad), synth sound, screen-FX shader
  art.js            palette + string-pixel sprites (NPCs are palette swaps)
  world.js          90×60 tile map, props, drawing
  actors.js         Dan, boat, cooler, gators, pythons, critters, people
  items.js          what’s in Dan’s pockets and what it does to him
  story.js          the four days, dialogue, quests, headlines
  minigames.js      fishing, wrestling, the ice machine raccoon
  court.js          Friday
  game.js / ui.js   loop, render, HUD, menus, save
  trailer.html/.js  director mode: scripted shots for the trailer
tools/florida-trailer.mjs   frame-exact trailer recorder (Playwright + ffmpeg)
releases/v1-riso/   the original risograph prototype
```

## Re-render the trailer

Needs Playwright + Chrome + ffmpeg. Serve `current/` on port 8811, then:

```bash
node tools/florida-trailer.mjs samples   # one still per shot + contact sheet
node tools/florida-trailer.mjs full      # 1080p60 mp4 with the synthesized soundtrack
```

*Contains swearing, cartoon substances, and Florida. No real alligators were harmed. Several were humbled.*
