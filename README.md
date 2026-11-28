# Anime Ball Battle Arena

A zero-dependency, 60 FPS **2D Physics Anime Ball Battle Simulator** built with pure **HTML5 Canvas + Vanilla JavaScript (ES6)** with a local `index.html` entry point — designed specifically for creating viral **9:16 vertical TikTok, YouTube Shorts, and Instagram Reels** battle videos.

![Resolution](https://img.shields.io/badge/Resolution-1080x1920%20(9%3A16)-00f3ff?style=flat-square)
![FPS](https://img.shields.io/badge/Target-60%20FPS-38ff7a?style=flat-square)
![Dependencies](https://img.shields.io/badge/Dependencies-Zero-ffd60a?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-ff003c?style=flat-square)

---

## Features

- **Alternating Turns:** Every 1.5 seconds of active combat, one fighter attacks while the other runs and dodges. Old attacks stop at the turn boundary. Final-form cinematics pause the turn clock; a transformed defender uses its ultimate on its next attacking turn.
- **Larger Fighters and Clearer Hits:** Fighters are 1.5× their original size, and cast animations and projectiles run at 0.85× speed. Every fighter and form has a hurt expression, recoil and impact art for regular hits as well as skills. Layered impacts and louder critical hits sit above a very quiet continuous battle bed. All audio is synthesized locally, follows SFX mute, and is included in recordings.
- **Cinematic Finish:** The final strike plays at 0.4× speed for one second, returns to normal speed, then the defeated portrait dissolves into glowing fragments over 1.5 seconds. The camera pans to the winner with a layered victory chord and stereo echoes. Only the winner title and name appear, with no statistics box. Auto-record preserves the complete ending.
- **Compact Arena Layout:** The square sits directly below the HP, status and skill area. The comment prompt follows just below the arena.
- **Portable Engine:** No build step, no bundler, no external libraries. Open the local HTML file in Chrome/Edge or OBS and keep the `src/` folder beside it.
- **Seeded Physics:** The seed controls the initial movement, combat variance, critical hits and dodge rolls.
- **Automatic Skill Rotation:** Fighters alternate between tactical, melee and ultimate casts. Each form has a different ultimate. Later forms use wider effects, stronger impacts and arena changes.
- **Timed Finish:** Set the fight duration and choose Left, Right, or the side with more remaining HP. Both fighters trade damage throughout the round. The final hit lands at the time limit and finishes the defeated fighter.
- **Square Arena:** Fighters and ricochets bounce off four straight walls. Fighters separate after exchanging hits and can sidestep incoming lunges or projectiles. When both fighters fall below 50 HP, their colors light up the floor and edges.
- **Fighter Forms:** All 28 fighters have five forms, unlocked at 80, 60, 40 and 20 HP. Portraits, cast patterns and abilities evolve with each form. Two final arena effects can be active together. On the final form, a one-second camera move pauses combat and leads directly into the ultimate. The match timer continues toward the configured finish.
- **Multi-Layered Visual Identity:** Supports custom **PNG/WebP Avatar URLs** or built-in recognizable Canvas vector portraits, glowing neon auras, pill-shaped HP badges on each orb, and under-HUD manga skill callouts that never block the arena view.
- **Built-In 1080p Full HD Video Recorder (`60 FPS`, `12 Mbps`):** Toggle **`Auto-Rec 1080p`** to automatically record directly from the `1080×1920` Canvas + procedural SFX audio from `Start` through the slow final strike, disintegration, winner camera, victory sound and title — zero UI clutter in the exported video.
- **Built-In Procedural Web Audio SFX:** Crisp synthesized wall bounces, hits, crits, blocks, slashes, and explosions with zero copyright risk and continuous audio keep-alive for clean recording.
- **Creator Studio Panel:** Searchable character pickers, `Random Match`, `New Seed`, match duration and winner controls, and one-click **`Hide UI` / `Show UI`** (`H`).

---

## Original Roster and Marvel Expansion

The [roster](src/characters/fighter-roster.js) contains 28 fighters with five forms each. The [move sets](src/skills/ultimate-moves.js) define two regular skills and an ultimate per form. The [portrait layers](src/characters/form-portraits.js) draw a distinct outfit at each HP threshold. The [Canvas animator](src/animation/ultimate-animator.js) animates arms, wrists, grips and props through wind-up, release and recovery. Each landed skill adds a directional impact and a brief recoil pose to the fighter it hits.

| Fighter | Examples in the game |
| --- | --- |
| Hulk | Gray Hulk counters, a gladiator hammer, World War Hulk ground strikes and Immortal Hulk's close-range smash |
| Spider-Man and Iron Man | Web-shooter gestures, Symbiote and Iron Spider forms, plus twin repulsors and the Mark LXXXV gauntlet for Iron Man |
| Thor and Captain America | Bifrost descent, paired Asgardian weapons and Captain America's returning shield |
| Gojo and Sukuna | Blue, Red, Hollow Purple and Unlimited Void for Gojo, Divine Flame, Ten Shadows and Malevolent Shrine for Sukuna |
| Naruto and Luffy | Sage Mode, Rasenshuriken and close-range Baryon strikes for Naruto, Gear 2 through Gear 5 and Bajrang Gun for Luffy |
| Eren and Levi | Titan forms, War Hammer spikes and the Rumbling for Eren, reverse grips, ODM cables and Thunder Spears for Levi |
| Doraemon and Frieren | Time Cloth rewinds position for Doraemon, Zoltraak, Judradjim, Vollzanbel and Dispel for Frieren |

The [28-fighter reference](https://nghien-cuu-he-thong-suc-manh-28-nhan-vat-5sjh.pages.grok.bot/) guided the form order and skill gestures. The HP progression, some crossover variants and the Dawn Monkey design are adaptations for this arena.

The studio's upgraded forms adapt the characters' signature abilities for this arena. References include [Marvel's character profiles](https://cdn.marvel.com/u/prod/marvel/i/pdf/MMRPG_CharacterProfiles_20240717.pdf), [Marvel's licensed character handbook](https://cdn.marvel.com/u/prod/marvel/i/pdf/MMRPG_MarvelRivals_20241220.pdf), [Jujutsu Kaisen](https://shueisha-games.com/wp-content/uploads/2024/05/96bd33ca03eb0b23834861b2301241ef.pdf), [Naruto](https://naruto-official.com/en/news/01_1895), [One Piece](https://one-piece.com/63303/index.html), [Attack on Titan](https://www.koeitecmoamerica.com/attackontitan2/finalbattle/feature.html?tgt=tgt-feature4), [Doraemon](https://www.tv-asahi.co.jp/doraemon_2017/tool/ta.html) and [Frieren](https://frieren-anime.jp/special/magic/index.html).

---

## Quick Start

1. Clone or download this repository:
   ```bash
   git clone https://github.com/stff178/abba.git
   cd abba
   ```
2. Open `index.html` directly in Chrome, Edge, or Firefox (no server required), **or** run a local static server:
   ```bash
   npm start
   ```
3. Set **Thời lượng (giây)** and **Bên thắng** in Creator Studio. Press **`Space`** to start/pause, **`R`** to restart, and **`H`** to hide/show the Creator Panel when recording with OBS.

### Recording in OBS Studio (9:16 Vertical)
- Add a **Browser Source** pointing to `index.html` (Local file) with Width `1080` and Height `1920`, FPS `60`.
- Use **Interact** in OBS to pick fighters / seed, press `H` to hide the Creator Panel, then hit **Start Recording** and press `Space`.

---

## Adding Your Own Character

Add a profile to `src/characters/fighter-roster.js` with five forms and a signature arena motif. Define all three moves for each form in `src/skills/ultimate-moves.js`. Add the portrait to `src/characters/marvel-portraits.js` or `src/characters/portraits.js`. The shared effects in `src/skills/signature-skills.js` handle the new casts. An inline configuration can supply custom base skills and passives.

```javascript
const MY_CHAR_CONFIG = {
  id: 'goku',
  name: 'SON GOKU',
  avatarUrl: '', // Optional PNG/WebP URL (leave blank to use Canvas fallback)
  color: '#ff8800',
  secondaryColor: '#00e5ff',
  maxHp: 100,
  attack: 2.0,
  defense: 0.52,
  speed: 400,
  critChance: 0.18,
  critMult: 1.55,
  radius: 62,
  skills: {
    passive(self, target, arena, eventType, payload) { /* init, update, onTakeDamage, onHitSuccess, onWallBounce */ },
    skill1(self, target, arena) { /* releases a tactical cast */ },
    skill2(self, target, arena, hitInfo) { /* runs on a successful melee cast */ },
    ultimate(self, target, arena) { /* releases an ultimate cast */ }
  },
  drawFallbackAvatar(ctx, x, y, r, isAwakened) { /* custom Canvas portrait */ }
};
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for balancing guidelines and PR instructions.

---

## Validation & CI

Run the built-in validation suite (requires Node.js 18+):

```bash
npm test
```

This verifies the registry and all 420 form and move combinations, the ultimate poses, contact damage, final-form cinematics, and timed finishes.

---

## License

Released under the [MIT License](LICENSE). Feel free to fork, mod, add characters, and use recordings for your own content!
