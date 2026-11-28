'use strict';

const FighterAnimator = (() => {
  function create() {
    return { wall: 0, hit: 0, dodge: 0, dodgeCooldown: 0, dash: 0, transform: 0 };
  }

  const timers = Object.keys(create());

  function advance(motion, dt) {
    for (const key of timers) motion[key] = Math.max(0, motion[key] - dt);
  }

  function pose(fighter, time, running, defeated) {
    const motion = fighter.motion;
    const cast = fighter.skillCast;
    const charging = cast && cast.age < cast.charge;
    const attacking = cast && cast.age >= cast.charge && cast.age < cast.charge + cast.active;
    const speed = Math.hypot(fighter.vx, fighter.vy);
    const wall = motion.wall / .19;
    const hit = motion.hit / .18;
    const dash = Math.min(1, motion.dash / .2);
    const dodge = motion.dodge / .27;
    const transform = Math.min(1, motion.transform / .65);
    const breathe = Math.sin(time * (running ? 5 : 3.8) + fighter.side * 2) * .025;
    const chargeAmount = charging ? cast.age / cast.charge : 0;
    const releaseAmount = attacking ? Math.max(0, 1 - (cast.age - cast.charge) / .24) : 0;
    const special = cast?.slot === 'ultimate' ? 1.3 : 1;
    const stretch = dash * .12 + dodge * .08 + wall * .08 + hit * .09 + releaseAmount * .11 * special;
    const size = fighter.ultScale * (1 + breathe + transform * .12 - chargeAmount * .072 * special);
    const facing = speed > 1 ? fighter.vx / speed : 0;
    const attackTilt = releaseAmount * Math.cos(cast?.aim ?? 0) * .16;

    return {
      form: fighter.formStage,
      time,
      color: FighterForms.color(fighter),
      pose: hit > .45 ? 'hit' : charging ? 'charge' : attacking ? 'attack' : 'idle',
      x: fighter.x + Math.sin(time * 87) * hit * 4,
      y: fighter.y + breathe * fighter.radius * (running ? 1 : 1.8),
      sx: size * (1 + stretch),
      sy: size * (1 - stretch * .72),
      tilt: (running ? facing * .14 : breathe) + dodge * facing * .18 + attackTilt,
      wind: Math.sin(time * (running ? 9 : 4.2) + fighter.side) * .15 + facing * (running ? .19 : .05),
      opacity: defeated ? .38 : 1 - dodge * .2
    };
  }

  function drawTrail(ctx, fighter, color, drawAfterimage) {
    const trail = fighter.trail;
    if (trail.length < 2) return;
    const intense = fighter.motion.dash > 0 || fighter.motion.dodge > 0;
    ctx.save();
    ctx.lineCap = 'round';

    for (let i = 1; i < trail.length; i++) {
      const ratio = i / trail.length;
      ctx.globalAlpha = ratio * (intense ? .36 : .16);
      ctx.strokeStyle = color;
      ctx.lineWidth = fighter.radius * ratio * (intense ? .69 : .42);
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }

    if (intense) {
      for (const index of [Math.floor(trail.length * .3), Math.floor(trail.length * .62)]) {
        const point = trail[index];
        ctx.globalAlpha = .15 + index / trail.length * .14;
        drawAfterimage(point.x, point.y);
      }
    }
    ctx.restore();
  }

  return { create, advance, pose, drawTrail };
})();
