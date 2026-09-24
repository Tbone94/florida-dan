# Florida Dan — STATUS

**What:** unhinged pixel-art Florida Man game. Dan, 44, has 4 days before court for "The Flamingo Incident" to prove he's not a Florida Man. He is extremely a Florida Man.
Inspo: Blue Marlin (NES) camera + fishing; Goose Game / Goat Sim "world reacts to your chaos".

**v2 (2026-09-22) — published:** https://claude.ai/artifact/JuLrxAQGy85fv8cjFiUWKj (v1 riso prototype backed up in releases/v1-riso)
- `current/` plain JS, no build. engine (input, synth sound, FX shader), art (string-pixel sprites + palette swaps), world (90x60 map), actors, items, story (4 days), minigames (fishing, wrestling, raccoon), court, game (loop/render), ui (HUD/shop/rap sheet/save).
- Days: MON fish fry (turkey-fryer fire) · TUE 3 character witnesses (raccoon-in-ice-machine → pet Trash Baby, stop sign on roof, pay Merle $40 via python bounty/fish/scratchers) · WED Hurricane Wanda, gumbo shrooms, Manny the manatee spirit · FRI court (headlines read as evidence, Chuck bursts in, gator-wrestle finale) → credits → free roam.
- Substances drive a WebGL post shader: beer (double vision/sway, blackout teleport), joint (slow-mo, sat), shrooms (melt/hue, reversed controls, animals talk), "sinus medicine" (2x speed, chroma jitter → crash), cig, energy drink, roller dog (food poisoning timer).
- Headlines = score → FLA MAN allegation meter + end-of-day Swamp Gazette + Rap Sheet (J). Save per day in localStorage.
- Tested in browser: title, day 1 HUD, fishing fight, gator wrestle, shroom+powder FX, full courtroom → gazette. Not yet hand-played start to finish.

**Next:** owner playtest notes. Ideas: Blender-rendered sprites (pipeline PoC in ~/Projects/glovebox/blender-sprites), more random events, airboat, sound polish, PWA/Play packaging.

**v2.1 (2026-09-22):** controller support (Gamepad API; standard layout: A use · B GIT · X use item · LB/RB pick item · LT throw · RT run · Y rap sheet · START pause · SELECT mute; d-pad/stick navigate menus + dialogue choices; rumble). Tested with a stubbed pad in browser. Cooler has headlights now (it's a joke in the game).

**Trailer (2026-09-22):** director mode = `current/trailer.html` + `trailer.js` (NOT published with the game). ~20 scripted shots of real gameplay, fixed 1/60 stepping, camera zoom via shader `view` uniform, offline-rendered synth soundtrack cut to the shot list.
- Record: `cd ~/Projects/_tools/record-kit && ./node/bin/node florida-trailer.mjs samples` (contact sheet) / `... full` (1080p60 mp4). Needs the `florida-dan` preview server on :8811.
- Output: `~/Projects/florida-dan/promo/florida-dan-trailer.mp4` (+ copy on Desktop).
- Structure: cozy cold open → gator bite + freeze-frame/record scratch (hook <4s) → "DAN IS NOT A FLORIDA MAN." → escalating montage w/ BREAKING headlines → Brenda "Four days, no headlines" → headline pile-up → courtroom gator → title → headlights button gag → end slate "COMING SOON".

**2026-09-24 — phone, flamingos, bug pass**
- Phone calls: `say()` packs a run of PHONE_* + DAN lines into ONE self-playing call box (last 3 rows, auto-hangs up; tap = whole call, tap again = hang up). Texts (`TEXT: X` lines + random Merle texts) never hit the talk box — `phone.js` slides Dan's cracked/duct-taped phone up from the bottom (buzz sound, tap to dismiss, waits for play mode).
- Lawn flamingos: `flamingos.js`. Gulp-N-Go $6, hotbar slot 13 (`[`), plant where Dan faces, neighbors react, pull up (E), punch over + stand up. Saved in `Game.flags.flamingos` per region, re-planted on every `World.load`.
- Bug pass: cooler whistle prompt (was inside a comment); Lambo sink left Dan stuck as `ride='lambo'` (inside a comment); mid-day saves now keep DAWN story flags (`saveFlags`, KEEP_FLAG = up/tbStay/flamingos/flam*/hints live) — fixed day 6/8 Continue soft-locks; Miami + Daytona boats moved within boarding range; Dr. Pam no longer zeroes trash already picked up; shopkeeper nags (favor/gig/arc) get "Can I buy somethin'?" (`sideNag`, `Game.skipSide`); passing out in the boat tows it home; declined gigs go away; bales re-count on a replayed day 14; roller-dog bait guard; a talk's ending runs after its shop closes (`Game.afterShop`).
- Suite: `tools/playtests/lint.py` (node --check + swallowed-code scan) runs first; new lambo/phone/flam/fixes2 tests. Keys plan: `KEYS-PLAN.md` (awaiting owner decisions).

**2026-09-24 — THE KEYS (Cases 8–9)**
- Files: `keys.js` (map buildKeys: Marathon → Seven Mile Bridge + broken old bridge → Big Pine → Key West; props drawKeysProp; Keys.spawn/zoneAt/waterPrompt/coolerPrompt/interactions; REGION_NAMES/TRAVEL_LINES), `keys2.js` (KeysCases, KeysChase (Rex boat chase), KeysCourt (republic/galleon), Keys gigs roosters/lobsters/kayak, shops bait/conch/tees, SWAPS/CRITTERS rooster/cat/deer), `bridge.js` (Seven Mile Bridge set piece, mode 'bridge', msgBox helper), `dive.js` (Dive minigame, mode 'dive', zones reef/bridge/harbor/flats, extras for story loot).
- Case days are relative: `Game.flags.keysFrom` (set in nextDay the morning after the Daytona 250, or next morning for old endless saves). Cases.info: keysFrom+0..2 = case 8, +3..5 = case 9, then endless. KEYS_MUST in ui.js ('8.1' declared, '8.3', '9.3'); a Keys case day away from the Keys rewinds to keysFrom.
- Diving: every Keys water edge / the boat gets one prompt "Dive in · or fish" (Keys.waterPrompt). The cooler on the bridge's west end gets "FLOOR IT across the Seven Mile Bridge".
- Fixed on the way: cutscenes that ended on a zoomed camera left the whole game zoomed (Scene.tick re-aimed after end()) — hit the Manny reunion + Daytona donut scenes; Dance hid nothing (HUD covered the arrow lane) — now hides the HUD; Dance takes {who, sprite, sunset}; Mash takes a custom draw.
- Tests: `tools/playtests/keys.mjs [mobile]` plays both Keys cases end to end with asserts + set-piece screenshots (/tmp/fd-keys). lint.py also glues all scripts in index.html order to catch cross-file const clashes.
- NEXT (owner): Orlando / theme-park knockoff = the finale region.
