'use strict';

const FighterAnimator = (() => {
  function create() {
    return { wall: 0, hit: 0, dodge: 0, dodgeCooldown: 0, dash: 0, transform: 0 };
  }

  const timers = Object.keys(create());

  function advance(motion, dt) {
    for (const key of timers) motion[key] = Math.max(0, motion[key] - dt);
  }

  function reaction(fighter, time) {
    const event = fighter.skillReaction;
    if (!event) return null;
    const age = time - event.start;
    if (age >= event.duration) return null;
    const t = Math.max(0, age / event.duration);
    const snap = Math.cos(t * 4.65) * (1 - t) ** 1.43 * event.strength;
    return { ...event, age, t, snap, brace: (1 - t) ** .7 * event.strength };
  }

  function pose(fighter, time, running, defeated) {
    const motion = fighter.motion;
    const cast = fighter.skillCast;
    const recoil = reaction(fighter, time);
    const charging = cast && cast.age < cast.charge;
    const attacking = cast && cast.age >= cast.charge && cast.age < cast.charge + cast.active;
    const speed = Math.hypot(fighter.vx, fighter.vy);
    const wall = motion.wall / .19;
    const hit = motion.hit / .18;
    const dash = Math.min(1, motion.dash / .2);
    const dodge = motion.dodge / .27;
    const dodgeLean = fighter.movement?.evade?.dx || 0;
    const transform = Math.min(1, motion.transform / .65);
    const breathe = Math.sin(time * (running ? 5 : 3.8) + fighter.side * 2) * .025;
    const chargeAmount = charging ? cast.age / cast.charge : 0;
    const releaseAmount = attacking ? Math.max(0, 1 - (cast.age - cast.charge) / .24) : 0;
    const special = cast?.slot === 'ultimate' ? 1.3 : 1;
    const stretch = dash * .12 + dodge * .18 + wall * .08 + hit * .09 + releaseAmount * .11 * special;
    const size = fighter.ultScale * (1 + breathe + transform * .12 - chargeAmount * .072 * special);
    const facing = speed > 1 ? fighter.vx / speed : 0;
    const attackTilt = releaseAmount * Math.cos(cast?.aim ?? 0) * .16;

    const recoilSnap = recoil?.snap || 0;
    const compress = Math.abs(recoilSnap);
    const heavy = recoil?.mode === 'heavy';
    const travel = fighter.radius * (heavy ? .39 : .33) * recoilSnap;
    const squash = heavy ? .24 : .16;
    return {
      form: fighter.formStage,
      time,
      color: FighterForms.color(fighter),
      pose: (recoil && recoil.t < .42) || hit > .45 ? 'hit' : charging ? 'charge' : attacking ? 'attack' : 'idle',
      x: fighter.x + (recoil?.ux || 0) * travel + Math.sin(time * 87) * hit * 2,
      y: fighter.y + (recoil?.uy || 0) * travel + breathe * fighter.radius * (running ? 1 : 1.8) - compress * fighter.radius * .10,
      sx: size * (1 + stretch - compress * squash),
      sy: size * (1 - stretch * .72 + compress * squash * .81),
      tilt: (running ? facing * .14 : breathe) + dodge * dodgeLean * .29 + attackTilt + (recoil?.ux || 0) * recoilSnap * .27,
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
      const echoes = fighter.motion.dodge > 0 ? [.23, .47, .70] : [.3, .62];
      for (const index of echoes.map(mark => Math.floor(trail.length * mark))) {
        const point = trail[index];
        ctx.globalAlpha = .13 + index / trail.length * (fighter.motion.dodge > 0 ? .29 : .16);
        drawAfterimage(point.x, point.y);
      }
    }
    ctx.restore();
  }

  return { create, advance, reaction, pose, drawTrail };
})();
