'use strict';

const SkillTimeline = (() => {
  const rotation = ['skill1', 'skill2', 'skill1', 'ultimate'];
  const finalRotation = ['skill1', 'ultimate', 'skill2'];
  const timings = {
    original: [.19, .30, .20],
    melee: [.18, .36, .22],
    ultimate: [.42, .40, .20],
    signature: [.25, .52, .18],
    fist: [.21, .39, .26]
  };

  const accents = {
    blue: '#69b5ff', red: '#ff4c72', purple: '#b988ff', void: '#a9acf9', shrine: '#ff6981',
    cursedSlash: '#ffc7d4', repulsor: '#80e9ff', unibeam: '#a0e9ff', web: '#ddebff',
    widowBite: '#81d9ff', hellChain: '#ff984b', lightning: '#b2dcff', photon: '#ffd67b',
    rasengan: '#83e6ff', rasenshuriken: '#b4f0ff', chakraBomb: '#cc79ff', zoltraak: '#ddf9ff',
    divineFlame:'#ff9760', hotClaws:'#ffad74', baryon:'#ff8b62', timeCloth:'#ff9ebe', snap:'#ffe5b5',
    twinRepulsor:'#a8ecff', twinPhoton:'#ffcc72', thread:'#bcf297', smallLight:'#ffeb8e'
  };

  function begin(fighter, target, slot = 'skill1', intensity = 0) {
    const stage = fighter.formStage;
    const move = CharacterMoves.get(fighter.char.id, stage, slot);
    const isMelee = slot === 'skill2';
    const isUltimate = slot === 'ultimate';
    const kind = move?.technique === 'elastic' ? 'fist' : move ? 'signature'
      : isUltimate ? 'ultimate' : isMelee ? 'melee' : 'original';
    const power = isUltimate ? 2 : isMelee ? 1 : 0;
    const [charge, active, recovery] = timings[kind];
    const spectacle = Boolean(move && ArenaUltimates.handles(move.action));
    const boomerang = move?.technique === 'shieldThrow' || move?.technique === 'hammerThrow';
    const bend = isMelee ? -160 : stage === 2 ? 155 : stage === 3 ? -130 : 0;
    fighter.skillCast = {
      slot, kind, name: move?.name, action: move?.action, technique: move?.technique,
      contact: move?.contact, pattern: 'arc', power, spectacle, bend, target, intensity,
      facing: Math.sign(target.x - fighter.x) || (fighter.side ? -1 : 1),
      charge: (kind === 'signature' && isUltimate ? .39 : charge) * (1 - intensity * .18),
      active: kind === 'signature'
        ? active + (isUltimate ? .18 + stage * .14 : stage * .035) + (spectacle ? .14 : 0) + (boomerang ? .31 : 0)
        : active,
      recovery: recovery * (1 - intensity * .5), age: 0, impactAge: null, form: stage,
      color: accents[move?.technique] || FighterForms.color(fighter)
    };
  }

  function advanceRotation(arena, fighter, target, dt) {
    update(arena, fighter, dt);
    if (fighter.skillCast || fighter.formBefore || fighter.motion.dodge > .10 || arena.elapsed < fighter.nextCastAt) return;
    const sequence = fighter.formStage === 4 ? finalRotation : rotation;
    const slot = sequence[fighter.castIndex % sequence.length];
    fighter.castIndex++;
    begin(fighter, target, slot, arena.intensity);
    const delay = (1.65 - .72 * arena.intensity) * fighter.castIntervalMultiplier;
    fighter.nextCastAt = arena.elapsed + delay;
  }

  function fireUltimate(arena, fighter, target) {
    begin(fighter, target, 'ultimate', arena.intensity);
    const cast = fighter.skillCast;
    cast.age = cast.charge;
    fighter.nextCastAt = Math.max(fighter.nextCastAt, arena.elapsed + .85);
    release(arena, fighter, cast);
  }

  function release(arena, fighter, cast) {
    const target = cast.target;
    const dx = target.x - fighter.x;
    const dy = target.y - fighter.y;
    const direction = Math.hypot(dx, dy) || 1;
    const ux = dx / direction;
    const uy = dy / direction;
    const power = 1 + cast.form * .035;

    cast.origin = UltimateAnimator.emitsFromBody(cast.technique)
      ? UltimateAnimator.origin(arena, fighter, cast, 1, true) : { x: fighter.x, y: fighter.y };
    cast.targetPoint = {
      x: target.x + target.vx * .065,
      y: target.y + target.vy * .065
    };
    cast.aim = Math.atan2(cast.targetPoint.y - cast.origin.y, cast.targetPoint.x - cast.origin.x);
    cast.releaseMark = { ...cast.origin, angle: cast.aim };

    cast.previous = cast.kind === 'fist' ? fistPoint(fighter, cast, 0) : cast.origin;

    if (cast.kind === 'melee') {
      fighter.motion.dash = cast.active;
      fighter.speedBoostTimer = Math.max(fighter.speedBoostTimer, .55);
      const speed = 1150 * power;
      fighter.vx = ux * speed;
      fighter.vy = uy * speed;
    }

    if (cast.technique) arena.playCastSound(cast);
    if (cast.kind === 'signature') {
      SignatureSkills.release(arena, fighter, cast);
    } else if (cast.kind === 'original' || cast.kind === 'ultimate') {
      fighter.char.skills[cast.slot]?.(fighter, target, arena);
    } else if (cast.name) {
      arena.showFighterSkill(fighter, cast.name.toUpperCase(), cast.color);
    }
    const isUltimate = cast.slot === 'ultimate';
    if (isUltimate) ArenaEffects.castUltimate(arena, fighter, cast);
    const from = cast.releaseMark;
    if (!cast.contact && cast.kind !== 'fist') {
      arena.spawnParticles(from.x, from.y, cast.color, isUltimate ? 8 : 4, 148);
    }
  }

  function segmentDistance(x, y, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / length));
    return Math.hypot(x - start.x - dx * t, y - start.y - dy * t);
  }

  function fistPoint(fighter, cast, t) {
    const facing = Math.sign(cast.targetPoint.x - fighter.x) || (fighter.side ? -1 : 1);
    const startX = cast.armRoot?.x ?? fighter.x + facing * fighter.radius * .68;
    const startY = cast.armRoot?.y ?? fighter.y + fighter.radius * .58;
    const dx = cast.targetPoint.x - startX;
    const dy = cast.targetPoint.y - startY;
    const distance = Math.hypot(dx, dy) || 1;
    const curve = cast.bend * Math.sin(t * Math.PI * (cast.form === 2 ? 2 : 1)) * Math.sin(t * Math.PI);
    return { x: startX + dx * t - dy / distance * curve, y: startY + dy * t + dx / distance * curve };
  }

  function hitDistance(fighter, cast, progress) {
    const target = cast.target;
    const tip = cast.kind === 'fist'
      ? fistPoint(fighter, cast, Math.min(1, progress * 1.47))
      : { x: fighter.x, y: fighter.y };
    const distance = segmentDistance(target.x, target.y, cast.previous, tip);
    cast.previous = tip;
    return distance - (cast.kind === 'fist' ? 25 + cast.form * 6 : fighter.radius * .85);
  }

  function impact(arena, fighter, cast) {
    const target = cast.target;
    cast.impactAge = cast.age;
    const dx = target.x - fighter.x;
    const dy = target.y - fighter.y;
    const distance = Math.hypot(dx, dy) || 1;
    const impactX = (fighter.x + target.x) * .5;
    const impactY = (fighter.y + target.y) * .5;
    const power = 3.1;
    const result = cast.kind === 'melee'
      ? arena.processExchange(fighter, target, impactX, impactY, dx / distance, dy / distance, true)
      : arena.applyDamage(fighter, target, power + cast.form * .4, {
        color: cast.color,
        attack: cast,
        skill: cast,
        label: '-0',
        size: 34
      });
    if (result.blocked || result.amount <= 0) return;
    target.vx += dx / distance * 205;
    target.vy += dy / distance * 205;
    arena.spawnParticles(target.x, target.y, cast.color, 7, 240);
    arena.addShake(7 + cast.form * 2 + cast.intensity * 3);
    arena.hitStop = Math.max(arena.hitStop, .025);
  }

  function update(arena, fighter, dt) {
    const cast = fighter.skillCast;
    if (!cast) return;

    const oldAge = cast.age;
    cast.age += dt;
    if (oldAge < cast.charge && cast.age >= cast.charge) release(arena, fighter, cast);

    const elapsed = cast.age - cast.charge;
    const direct = cast.kind === 'melee' || cast.kind === 'fist';
    if (cast.kind === 'signature' && oldAge < cast.charge + cast.active && elapsed >= 0) {
      SignatureSkills.advance(arena, fighter, cast, Math.min(1, elapsed / cast.active), dt);
    }
    if (direct && oldAge < cast.charge + cast.active && elapsed >= 0 && cast.impactAge === null) {
      const progress = Math.min(1, elapsed / cast.active);
      if (cast.kind === 'fist') cast.armRoot = UltimateAnimator.origin(arena, fighter, cast);
      if (cast.kind === 'melee' && progress < .85) {
        const dx = cast.target.x - fighter.x;
        const dy = cast.target.y - fighter.y;
        const distance = Math.hypot(dx, dy) || 1;
        const steer = Math.min(1, dt * 6);
        fighter.vx += (1100 * dx / distance - fighter.vx) * steer;
        fighter.vy += (1100 * dy / distance - fighter.vy) * steer;
      }
      if (hitDistance(fighter, cast, progress) <= cast.target.radius && !CombatMovement.avoids(cast.target, fighter, cast)) {
        impact(arena, fighter, cast);
      }
    }

    if (elapsed >= cast.active + cast.recovery) fighter.skillCast = null;
  }

  function drawCharge(ctx, fighter, cast, arena) {
    if (!cast.technique || !arena) return;
    const mode = SkillInk.kind(cast.technique);
    const aim = Math.atan2(cast.target.y - fighter.y, cast.target.x - fighter.x);
    const from = UltimateAnimator.origin(arena, fighter, cast);
    SkillInk.windup(ctx, from, aim, cast.color, cast.age / cast.charge, mode, cast.power);
  }

  function drawFist(ctx, fighter, cast, progress, alpha) {
    const reach = Math.min(1, progress * 1.47) * alpha;
    const width = 15 + cast.form * 4 + cast.intensity * 3;
    const root = fistPoint(fighter, cast, 0);
    const tip = fistPoint(fighter, cast, reach);
    const near = fistPoint(fighter, cast, Math.max(0, reach - .08));
    ctx.globalAlpha = Math.min(1, alpha * 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(root.x, root.y);
    for (let i = 1; i <= 24; i++) {
      const point = fistPoint(fighter, cast, reach * i / 24);
      ctx.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = '#281b2b';
    ctx.lineWidth = width + 9;
    ctx.stroke();
    ctx.strokeStyle = cast.form === 0 ? '#e9a67c' : cast.color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.strokeStyle = '#fff1d0';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const angle = Math.atan2(tip.y - near.y, tip.x - near.x);
    if (reach > .12) SkillInk.speed(ctx, near, angle, 52 + width, width * .86, '#fff0d6', alpha * .71);
    ctx.translate(tip.x, tip.y);
    ctx.rotate(angle);
    const size = (25 + cast.form * 6) * Math.max(.2, alpha);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.moveTo(-.8, -.5);
    ctx.bezierCurveTo(-.5, -1, -.15, -1, .05, -.71);
    ctx.bezierCurveTo(.46, -1.1, 1.1, -.68, 1.04, -.13);
    ctx.bezierCurveTo(1.2, .61, .51, 1.05, -.14, .78);
    ctx.lineTo(-.86, .43);
    ctx.closePath();
    ctx.fillStyle = cast.form === 0 ? '#f7c699' : cast.color;
    ctx.fill();
    ctx.strokeStyle = '#281b2b';
    ctx.lineWidth = .17;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-.38, -.31);
    ctx.quadraticCurveTo(.13, -.22, .48, -.43);
    ctx.moveTo(.12, .28);
    ctx.quadraticCurveTo(.43, .18, .47, -.06);
    ctx.lineWidth = .12;
    ctx.stroke();
  }

  function drawCastWake(ctx, fighter, cast, progress, alpha) {
    const ultimate = cast.kind === 'ultimate';
    const strength = .6 + cast.intensity * .4;
    ctx.translate(fighter.x, fighter.y);
    ctx.rotate(cast.aim);
    ctx.strokeStyle = cast.color;
    ctx.lineCap = 'round';
    ctx.lineWidth = (ultimate ? 8 : 5) * (1 - progress * .55);
    const reach = (fighter.radius + progress * (ultimate ? 135 : 75)) * strength;
    const angle = progress * 1.4;
    ctx.globalAlpha = alpha * (.94 - progress * .65);
    ctx.beginPath();
    ctx.ellipse(0, 0, reach, reach * .72, angle, -2.5, .36);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, reach, reach * .72, angle, .87, 2.64);
    ctx.stroke();
    if (ultimate) {
      ctx.globalAlpha *= .58;
      ctx.strokeStyle = '#fff8ee';
      ctx.lineWidth = 2;
      for (const sign of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(0, 0, reach + 20, reach * .56, sign * angle, 0, Math.PI * 1.72);
        ctx.stroke();
      }
    }
  }

  function drawMelee(ctx, fighter, cast, progress, alpha) {
    const angle = Math.atan2(cast.target.y - fighter.y, cast.target.x - fighter.x);
    const radius = fighter.radius * (1.15 + progress * .68 + cast.intensity * .32);
    ctx.translate(fighter.x, fighter.y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha * (.89 - progress * .36);
    ctx.lineCap = 'round';
    ctx.strokeStyle = cast.color;
    ctx.lineWidth = 11 - progress * 6;
    ctx.beginPath();
    if (cast.pattern === 'cross') {
      ctx.moveTo(radius * .1, -radius * .72);
      ctx.quadraticCurveTo(radius * .86, -radius * .21, radius * 1.3, radius * .48);
      ctx.moveTo(radius * .16, radius * .68);
      ctx.quadraticCurveTo(radius * .77, radius * .29, radius * 1.37, -radius * .48);
    } else if (cast.pattern === 'spiral' || cast.pattern === 'burst') {
      const stretch = cast.pattern === 'spiral' ? .62 : .91;
      ctx.ellipse(radius * .56, 0, radius * .49, radius * stretch, progress * 4, .2, Math.PI * 1.76);
    } else {
      ctx.ellipse(radius * .24, 0, radius, radius * .87, -.22, -1.2, 1.16);
    }
    ctx.stroke();
    ctx.strokeStyle = '#fff9ea';
    ctx.lineWidth *= .27;
    ctx.stroke();
  }

  function visibility(cast) {
    const elapsed = cast.age - cast.charge;
    const progress = Math.min(1, elapsed / cast.active);
    const alpha = 1 - Math.min(1, Math.max(0, (elapsed - cast.active) / cast.recovery));
    return { progress, alpha };
  }

  function drawBackground(ctx, fighter) {
    const cast = fighter.skillCast;
    if (!cast || cast.age < cast.charge || cast.kind !== 'signature') return;
    const { progress, alpha } = visibility(cast);
    SignatureSkills.drawBackground(ctx, fighter, cast, progress, alpha);
  }

  function draw(ctx, fighter, arena) {
    const cast = fighter.skillCast;
    if (!cast) return;
    ctx.save();
    if (cast.age < cast.charge) {
      drawCharge(ctx, fighter, cast, arena);
    } else {
      const { progress, alpha } = visibility(cast);
      SkillInk.launch(ctx, cast);
      if (cast.kind === 'fist') drawFist(ctx, fighter, cast, progress, alpha);
      else if (cast.kind === 'signature') SignatureSkills.draw(ctx, fighter, cast, progress, alpha);
      else if (cast.kind === 'melee') drawMelee(ctx, fighter, cast, progress, alpha);
      else drawCastWake(ctx, fighter, cast, progress, alpha);
    }
    ctx.restore();
  }

  return { begin, update, advanceRotation, fireUltimate, drawBackground, draw };
})();
