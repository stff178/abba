'use strict';

const FighterForms = (() => {
  const thresholds = [.8, .6, .4, .2];
  const formDamage = [0, .025, .055, .095, .155];
  const formSpeed = [1, 1.025, 1.05, 1.085, 1.12];

  function color(fighter) {
    return FighterRoster.form(fighter)?.[1] || fighter.char.color;
  }

  function name(fighter) {
    return FighterRoster.form(fighter)?.[0] || 'Base Form';
  }

  function damageMultiplier(fighter) {
    if (!fighter) return 1;
    const missingHp = 1 - Math.max(0, Math.min(1, fighter.currentHp / fighter.maxHp));
    return 1 + missingHp * .12 + formDamage[fighter.formStage];
  }

  function sync(arena, fighter) {
    if (fighter.currentHp <= 0) return;

    const hp = fighter.currentHp / fighter.maxHp;
    let stage = 0;
    while (stage < thresholds.length && hp <= thresholds[stage]) stage++;
    if (stage <= fighter.formStage) return;

    const profile = FighterRoster.get(fighter.char.id);
    const before = { stage: fighter.formStage, radius: fighter.radius, color: color(fighter) };
    fighter.formStage = stage;
    fighter.isAwakened = stage >= 3;
    fighter.radius = fighter.char.radius * (1 + (profile?.growth || 0) * stage);
    if (fighter.radius > before.radius) Object.assign(fighter, ArenaBounds.confine(arena, fighter, fighter.boundaryRadius));
    fighter.mass = 1 + (profile?.weight || 0) * stage;
    fighter.motion.transform = .52 + stage * .065;
    if (stage === 4 && profile) {
      if (arena.running && arena.elapsed < arena.matchDuration - .12) {
        TransformationScene.enqueue(arena, fighter, before);
        return;
      }
      ArenaEffects.addFinalForm(arena, fighter, profile);
    }

    const accent = color(fighter);
    arena.addShake(5 + stage * 2);
    arena.spawnRing(fighter.x, fighter.y, fighter.radius * .78, fighter.radius + 55 + stage * 23, accent, .55);
    arena.spawnParticles(fighter.x, fighter.y, accent, 10 + stage * 4, 280 + stage * 24);
    arena.showFighterSkill(fighter, name(fighter).toUpperCase(), accent);
    arena.spawnFloatingText(fighter.x, fighter.y - fighter.radius * 1.46, stage === 4 ? 'FINAL FORM' : 'POWER UP!', accent, 31);

  }

  function dodge(arena, fighter, attacker) {
    const style = FighterRoster.get(fighter.char.id)?.passive;
    const stage = fighter.formStage;
    if (fighter.motion.dodgeCooldown > 0) return false;

    const odds = style === 'infinityDodge' && stage >= 3 ? .21 + stage * .01
      : style === 'webDodge' && stage >= 2 ? .06 + stage * .035
      : style === 'trickster' && stage >= 3 ? .12 : 0;
    if (!odds || arena.rng() >= odds) return false;

    if (!CombatMovement.startDodge(arena, fighter, attacker)) return false;
    fighter.motion.dodgeCooldown = style === 'trickster' ? 2 : 2.5;
    return true;
  }

  function speedMultiplier(fighter) {
    const slowdown = FighterRoster.get(fighter.char.id)?.slowdown || 0;
    return formSpeed[fighter.formStage] * (1 - slowdown * fighter.formStage);
  }

  function passive(fighter, target, arena, event, data) {
    const style = FighterRoster.get(fighter.char.id)?.passive;
    const stage = fighter.formStage;
    if (event === 'update' && style === 'regeneration' && stage >= 2) {
      if (stage <= (fighter.custom.lastHealStage || 0)) return;
      fighter.custom.lastHealStage = stage;
      fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + (fighter.char.id === 'wolverine' ? 5 + stage : 4));
      arena.spawnRing(fighter.x, fighter.y, 22, fighter.radius + 52, '#9aefaf', .44);
      arena.spawnFloatingText(fighter.x, fighter.y - fighter.radius, 'RECOVER', '#9aefaf', 23);
    }

    if (event !== 'onTakeDamage' || data.isDot) return;
    if (style === 'kinetic') {
      fighter.custom.kinetic = Math.min(6, (fighter.custom.kinetic || 0) + data.amount * .46);
      data.amount *= .88;
    } else if (style === 'absorb' && data.isRanged && stage >= 1) {
      fighter.custom.kinetic = Math.min(5, (fighter.custom.kinetic || 0) + data.amount * .32);
      data.amount *= .79;
    } else if (style === 'techWard' && stage >= 2 && data.isRanged) {
      data.amount *= .88;
    }
  }

  return { color, name, sync, damageMultiplier, speedMultiplier, dodge, passive };
})();
