# Contributing to Anime Ball Battle Arena

Thank you for contributing! Whether you are adding a new anime/cartoon fighter, improving physics, or adding new visual effects, here is how to keep the project clean and balanced.

## Ground Rules

1. **Zero Runtime Dependencies:** Use HTML5 Canvas and vanilla JavaScript. Keep scripts compatible with opening the local HTML file directly.
2. **60 FPS First:** Avoid heavy per-frame DOM updates or unpooled allocations that cause frame drops at `1080×1920`.
3. **Deterministic Simulation:** Use `arena.rng()` for any gameplay-affecting randomness (damage variance, crit rolls, dodge chance, pocket rolls) so Random Seeds remain reproducible.

## Character Balance Checklist (`100 HP` Scale)

Use these base stats for the timed matches:
- `maxHp`: **Must be `100`**
- `attack`: `1.85 – 2.15`
- `defense`: `0.45 – 0.60`
- `speed`: `380 – 430`
- `ultimate` total damage: `8.5 – 11.0` (before match damage scaling)
- Always implement **1 Passive + 3 Skills** (`passive`, `skill1`, `skill2`, `ultimate`) and a recognizable `drawFallbackAvatar(ctx, x, y, r, isAwakened)`.
- Call `arena.showFighterSkill(self, '[SKILL NAME!]', color)` so skill callouts appear cleanly below the HP bar without obstructing the arena.

## Submitting a Pull Request

1. Fork the repository and create a feature branch (`git checkout -b feat/add-goku`).
2. Add your character config and register it in `CHARACTER_REGISTRY` inside `index.html`.
3. Run the automated validation check:
   ```bash
   npm test
   ```
4. Test at least 3 matches in Chrome/Edge with different durations and winner settings to check cast animation and the timed result.
5. Open a Pull Request describing your fighter's passive, 3 skills, and visual design!
