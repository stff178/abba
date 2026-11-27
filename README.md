# Anime Ball Battle Arena

A zero-dependency, 60 FPS **2D Physics Anime Ball Battle Simulator** built with pure **HTML5 Canvas + Vanilla JavaScript (ES6)** in a single `index.html` file — designed specifically for creating viral **9:16 vertical TikTok, YouTube Shorts, and Instagram Reels** battle videos.

![Resolution](https://img.shields.io/badge/Resolution-1080x1920%20(9%3A16)-00f3ff?style=flat-square)
![FPS](https://img.shields.io/badge/Target-60%20FPS-38ff7a?style=flat-square)
![Dependencies](https://img.shields.io/badge/Dependencies-Zero-ffd60a?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-ff003c?style=flat-square)

---

## Features

- **Single-File Portable Engine (`index.html`):** No build step, no bundler, no external libraries. Double-click `index.html` in Chrome/Edge or load it directly as an **OBS Browser Source (`1080×1920`)**.
- **Deterministic Seeded Physics:** Uses Mulberry32 PRNG so any **Random Seed** replays the exact same match 100% deterministically — test seeds at `2.5x` speed, then record your favorite comeback at `1.0x`.
- **Lore-Accurate Combat System:** Every character has **1 Passive + 3 Signature Skills** (Tactical Skill 1, Close-Range Skill 2, and Ultimate triggered at `100` Energy or first drop below `30% HP`).
- **TikTok-Optimized Pacing (`50s–60s`):**
  - **Dynamic Shrinking Arena** activates at `22s`.
  - **Overdrive Mode (`2x Damage`)** activates at `44s` for guaranteed dramatic finishes.
  - **Slow-Motion `0.2x` K.O. Climax** (`1.5s`) with white flash and English end-of-match stats card.
- **Multi-Layered Visual Identity:** Supports custom **PNG/WebP Avatar URLs** or built-in recognizable Canvas vector portraits, glowing neon auras, pill-shaped HP badges on each orb, and under-HUD manga skill callouts that never block the arena view.
- **Built-In 1080p Full HD Video Recorder (`60 FPS`, `12 Mbps`):** Toggle **`Auto-Rec 1080p`** to automatically record directly from the `1080×1920` Canvas + procedural SFX audio from `Start` until the K.O. results card finishes — zero UI clutter in the exported video.
- **Built-In Procedural Web Audio SFX:** Crisp synthesized wall bounces, hits, crits, blocks, slashes, and explosions with zero copyright risk and continuous audio keep-alive for clean recording.
- **Creator Studio Panel:** Searchable character pickers, `Random Match`, `New Seed`, speed slider (`0.5x–2.5x`), and one-click **`Hide UI` / `Show UI`** (`H`).

---

## Built-In Character Roster (12 Fighters — `100 HP` Balanced)

| Character | Passive | Skill 1 | Skill 2 | Ultimate |
| :--- | :--- | :--- | :--- | :--- |
| **Gojo Satoru** | Limitless Barrier (blocks 1 hit, 9s CD) | Lapse: Blue (gravity vortex) | Reversal: Red (wall slam knockback) | Hollow Purple |
| **Ryomen Sukuna** | King of Curses (stacking Bleed) | Dismantle (3 ranged slashes) | Cleave (HP-scaling crit) | Domain Expansion: Malevolent Shrine |
| **Naruto Uzumaki** | Kurama Regeneration (HP/s heal) | Shadow Clone Jutsu (2 clones) | Rasengan (spiral knockback) | Tailed Beast Bomb |
| **Monkey D. Luffy** | Rubber Body (-22% dmg + bounce boost) | Gomu Gomu no Jet Pistol | Red Hawk (fiery burn) | Gear 5: Bajrang Gun |
| **Eren Yeager** | Titan Regeneration (heals 20% dmg taken) | Warhammer Spikes (3 spikes) | Hardening Punch | The Rumbling |
| **Levi Ackerman** | Ackerman Reflex (22% dodge + max speed) | ODM Grapple Dash | Spinning Slash (multi-slash) | Thunder Spear Barrage |
| **Doraemon** | 4D Pocket (Dorayaki / Copter / Time Cloth) | Air Cannon (knockback ring) | Small Light (-28% enemy dmg) | 22nd Century Beam |
| **Frieren** | Mana Suppression (+energy / +dmg <50% HP) | Defensive Magic (-65% next hit) | Zoltraak (armor-piercing) | Height of Magic (Black Hole) |
| **Thor** | God of Thunder (35% bonus lightning shock) | Mjolnir Throw | Lightning Strike (crit + brief slow) | Bifrost Stormbreaker |
| **Captain America** | Vibranium Shield (-20% dmg + 35% reflect) | Shield Throw | Shield Bash (heavy knockback) | Avengers Assemble |
| **Iron Man** | Arc Reactor (+30% energy gain) | Repulsor Blast (dual lasers) | Nanotech Blade | Unibeam Overdrive |
| **Hulk** | Unlimited Rage (+energy on hit, rage scaling) | Thunderclap (shockwave) | Hulk Smash (rage-scaled slam) | World Breaker (Gamma Quake) |

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
3. Press **`Space`** to start/pause, **`R`** to restart, and **`H`** to hide/show the Creator Panel when recording with OBS.

### Recording in OBS Studio (9:16 Vertical)
- Add a **Browser Source** pointing to `index.html` (Local file) with Width `1080` and Height `1920`, FPS `60`.
- Use **Interact** in OBS to pick fighters / seed, press `H` to hide the Creator Panel, then hit **Start Recording** and press `Space`.

---

## Adding Your Own Character

Every fighter is defined as a clean config object inside `index.html` and registered in `CHARACTER_REGISTRY`:

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
  skill1Cd: 7.4,
  skill2Cd: 7.4,
  skills: {
    passive(self, target, arena, eventType, payload) { /* init, update, onTakeDamage, onHitSuccess, onWallBounce */ },
    skill1(self, target, arena) { /* triggered on wall bounce when off cooldown */ },
    skill2(self, target, arena, hitInfo) { /* triggered on melee clash when off cooldown */ },
    ultimate(self, target, arena) { /* triggered at 100 Energy or first drop below 30% HP */ }
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

This verifies `index.html` JavaScript syntax, character registry integrity, and `100 HP` balance compliance.

---

## License

Released under the [MIT License](LICENSE). Feel free to fork, mod, add characters, and use recordings for your own content!
