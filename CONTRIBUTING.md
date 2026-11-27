# Contributing to Anime Ball Battle Arena

Thank you for contributing! Whether you are adding a new anime/cartoon fighter, improving physics, or adding new visual effects, here is how to keep the project clean and balanced.

## Ground Rules

1. **Zero Runtime Dependencies:** Keep `index.html` 100% self-contained (HTML5 Canvas + Vanilla ES6 JS + inline CSS) so anyone can open it directly without installing packages.
2. **60 FPS First:** Avoid heavy per-frame DOM updates or unpooled allocations that cause frame drops at `1080×1920`.
3. **Deterministic Simulation:** Use `arena.rng()` for any gameplay-affecting randomness (damage variance, crit rolls, dodge chance, pocket rolls) so Random Seeds remain reproducible.

## Character Balance Checklist (`100 HP` Scale)

To keep matches in the **50s–60s** TikTok/Shorts sweet spot:
- `maxHp`: **Must be `100`**
- `attack`: `1.85 – 2.15`
- `defense`: `0.45 – 0.60`
- `speed`: `380 – 430`
- `skill1Cd` / `skill2Cd`: `6.8s – 8.0s`
- `ultimate` total damage: `8.5 – 11.0` (before Overdrive)
- Always implement **1 Passive + 3 Skills** (`passive`, `skill1`, `skill2`, `ultimate`) and a recognizable `drawFallbackAvatar(ctx, x, y, r, isAwakened)`.
- Call `arena.showFighterSkill(self, '[SKILL NAME!]', color)` so skill callouts appear cleanly below the HP bar without obstructing the arena.

## Submitting a Pull Request

1. Fork the repository and create a feature branch (`git checkout -b feat/add-goku`).
2. Add your character config and register it in `CHARACTER_REGISTRY` inside `index.html`.
3. Run the automated validation check:
   ```bash
   npm test
   ```
4. Test at least 3 matches in Chrome/Edge at `1.0x` and `2.5x` speed to confirm smooth 60 FPS rendering and 50s–60s match duration.
5. Open a Pull Request describing your fighter's passive, 3 skills, and visual design!
