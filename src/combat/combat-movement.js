'use strict';

const CombatMovement = (() => {
  const linear = new Set(['volley', 'ricochet', 'beam', 'stones', 'web', 'tether']);
  const evasionTime = .27;

  function create() {
    return { reset: 0, evade: null, crowd: 0 };
  }

  function localAttack(cast) {
    return cast.kind === 'signature' && (cast.contact || linear.has(cast.action)) ||
      cast.kind === 'fist' || cast.kind === 'melee';
  }

  function farCast(cast) {
    return !cast.contact && cast.kind !== 'fist' && cast.kind !== 'melee';
  }

  function approachDirection(fighter, enemy) {
    const angle = Math.atan2(fighter.y - enemy.y, fighter.x - enemy.x);
    return Number.isFinite(angle) ? angle : fighter.side * Math.PI;
  }

  function heading(arena, fighter, enemy, angle, range, dodge) {
    const away = approachDirection(fighter, enemy);
    const turns = dodge ? [1.28, -1.28, 1.02, -1.02, 1.58, -1.58] : [0, .56, -.56, 1.02, -1.02, 1.53, -1.53];
    let best;
    for (const turn of turns) {
      const vx = Math.cos(angle + turn);
      const vy = Math.sin(angle + turn);
      const room = ArenaBounds.clearance(arena, fighter, vx, vy, fighter.radius + 7);
      const separation = vx * Math.cos(away) + vy * Math.sin(away);
      const score = Math.min(room, range) + separation * (dodge ? 29 : 46) - Math.abs(turn) * 5;
      if (!best || score > best.score) best = { vx, vy, score };
    }
    return best;
  }

  function startDodge(arena, fighter, enemy, threat = null, angle = approachDirection(fighter, enemy)) {
    if (!enemy || fighter.motion.dodge > 0 || arena.matchDamage.closing) return false;
    const direction = heading(arena, fighter, enemy, angle, 176, true);
    const speed = 805 + fighter.formStage * 23;
    fighter.motion.dodge = evasionTime;
    fighter.motion.dodgeCooldown = 1.03 + fighter.side * .21 - fighter.formStage * .045;
    fighter.movement.reset = .34;
    fighter.movement.evade = { x: fighter.x, y: fighter.y, dx: direction.vx, dy: direction.vy,
      threat, owner: enemy };
    fighter.vx = direction.vx * speed;
    fighter.vy = direction.vy * speed;
    const color = FighterForms.color(fighter);
    arena.spawnFloatingText(fighter.x, fighter.y - fighter.radius * 1.25, 'NÉ ĐÒN', color, 27);
    arena.spawnParticles(fighter.x, fighter.y, color, 9, 200);
    return true;
  }

  function willPassNear(fighter, shot, extra) {
    if (!shot || shot.done || shot.hit) return false;
    const dx = fighter.x - shot.x;
    const dy = fighter.y - shot.y;
    const vx = shot.vx - fighter.vx * .23;
    const vy = shot.vy - fighter.vy * .23;
    const speed2 = vx * vx + vy * vy;
    if (!speed2 || speed2 > 2100 ** 2) return false;
    const t = (dx * vx + dy * vy) / speed2;
    return t > .015 && t < .26 &&
      Math.hypot(dx - vx * t, dy - vy * t) < fighter.radius + extra;
  }

  function noticeThreat(arena, fighter, enemy, distance) {
    const cast = enemy.skillCast;
    if (cast && localAttack(cast)) {
      for (const shot of cast.nodes || []) {
        if (willPassNear(fighter, shot, 27 + cast.form * 2)) {
          return startDodge(arena, fighter, enemy, cast, Math.atan2(shot.vy, shot.vx));
        }
      }
      const elapsed = cast.age - cast.charge;
      const reach = fighter.radius + enemy.radius + (farCast(cast) ? 515 : cast.kind === 'fist' ? 355 : 120);
      const alreadyFlying = cast.nodes?.some(shot => Number.isFinite(shot.vx));
      if (!alreadyFlying && distance <= reach && elapsed >= -.125 && elapsed <= .084 &&
          (!farCast(cast) || distance > fighter.radius + enemy.radius + 25)) {
        const exitAngle = Math.atan2(fighter.y - enemy.y, fighter.x - enemy.x);
        return startDodge(arena, fighter, enemy, cast, exitAngle);
      }
    }
    for (const shot of arena.projectiles) {
      if (shot.owner === enemy && willPassNear(fighter, shot, shot.radius + 8)) {
        return startDodge(arena, fighter, enemy, shot, Math.atan2(shot.vy, shot.vx));
      }
    }
    return false;
  }

  function advance(arena, dt) {
    for (const fighter of arena.fighters) {
      const enemy = arena.fighters[1 - fighter.side];
      const state = fighter.movement;
      state.reset = Math.max(0, state.reset - dt);
      if (!fighter.motion.dodge) state.evade = null;
      if (arena.matchDamage.closing) continue;

      const distance = Math.hypot(fighter.x - enemy.x, fighter.y - enemy.y);
      const reach = fighter.radius + enemy.radius;
      const cast = fighter.skillCast;
      const committed = cast && (cast.power === 2 || (cast.contact && cast.age > cast.charge && !cast.finishedContact));
      if (!committed && !fighter.motion.dodgeCooldown && !fighter.motion.hit && fighter.domainSlowTimer <= 0) {
        if (noticeThreat(arena, fighter, enemy, distance)) continue;
      }
      if (fighter.motion.dodge > .105 && state.evade) {
        const blend = Math.min(1, dt * 8);
        fighter.vx += (state.evade.dx * 760 - fighter.vx) * blend;
        fighter.vy += (state.evade.dy * 760 - fighter.vy) * blend;
      }
      state.crowd = distance < reach + 32 ? state.crowd + dt : Math.max(0, state.crowd - dt * 3);
      const crowdLimit = committed ? .43 : .18;
      if (state.crowd > crowdLimit && !state.reset && !fighter.motion.dodge) {
        reset(arena, fighter, enemy, .29, 550);
      }
    }
  }

  function reset(arena, fighter, enemy, duration = .24, speed = 620) {
    if (fighter.motion.dodge > 0 || arena.matchDamage.closing) return;
    const direction = heading(arena, fighter, enemy, approachDirection(fighter, enemy), 154, false);
    fighter.vx = direction.vx * speed;
    fighter.vy = direction.vy * speed;
    fighter.movement.reset = Math.max(duration, fighter.movement.reset);
    fighter.movement.crowd = 0;
  }

  function avoids(fighter, attacker, cast) {
    const dodge = fighter.movement.evade;
    return Boolean(cast && dodge && fighter.motion.dodge > .115 && dodge.owner === attacker && dodge.threat === cast);
  }

  function draw(ctx, fighter) {
    const dodge = fighter.movement.evade;
    if (!dodge) return;
    const progress = 1 - fighter.motion.dodge / evasionTime;
    const r = fighter.radius;
    ctx.save();
    ctx.translate(dodge.x, dodge.y);
    ctx.rotate(Math.atan2(dodge.dy, dodge.dx));
    ctx.lineCap = 'round';
    ctx.strokeStyle = FighterForms.color(fighter);
    ctx.globalAlpha = (1 - progress) * .77;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-r * (.82 + progress), side * r * .26);
      ctx.quadraticCurveTo(r * .12, side * r * (.41 + progress * .45), r * 1.16, side * r * .57);
      ctx.lineWidth = 4.5 - progress * 2;
      ctx.stroke();
    }
    ctx.strokeStyle = '#eefaff';
    ctx.globalAlpha *= .82;
    ctx.lineWidth = 1.7;
    for (let i = 0; i < 4; i++) {
      const x = -r * (.7 + progress - i * .37);
      const y = r * ((i % 2 ? 1 : -1) * (.30 + i * .092));
      ctx.beginPath();
      ctx.moveTo(x - r * .42, y);
      ctx.lineTo(x + r * .23, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  return { create, advance, startDodge, reset, avoids, draw };
})();
