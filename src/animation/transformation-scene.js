'use strict';

const TransformationScene = (() => {
  const duration = 1;
  const revealAt = .42;

  function create() { return { queue: [], active: null, nextAt: 0 }; }

  function enqueue(arena, fighter, before) {
    const scene = arena.transformation;
    fighter.formBefore = before;
    fighter.skillCast = null;
    scene.queue.push(fighter);
  }

  function reveal(arena, fighter) {
    if (!fighter.formBefore) return;
    fighter.formBefore = null;
    ArenaEffects.addFinalForm(arena, fighter, FighterRoster.get(fighter.char.id));
    arena.spawnParticles(fighter.x, fighter.y, FighterForms.color(fighter), 34, 470);
    arena.triggerFlash(FighterForms.color(fighter), .17);
  }

  function finish(arena, fighter) {
    reveal(arena, fighter);
    SkillTimeline.fireUltimate(arena, fighter, arena.fighters[1 - fighter.side]);
  }

  function advance(arena, dt) {
    const scene = arena.transformation;
    if (!scene.active && scene.queue.length && arena.elapsed >= scene.nextAt) {
      const fighter = scene.queue.shift();
      const available = arena.matchDuration - arena.elapsed;
      if (available <= .23) {
        finish(arena, fighter);
        return false;
      }
      const length = Math.min(duration, Math.max(.18, available - .14));
      scene.active = { fighter, age: 0, length };
      arena.ultCinematic.active = false;
    }

    const current = scene.active;
    if (!current) return false;
    current.age = Math.min(current.length, current.age + dt);
    if (current.age >= current.length * revealAt) reveal(arena, current.fighter);
    if (current.age >= current.length) {
      finish(arena, current.fighter);
      scene.active = null;
      scene.nextAt = Math.min(arena.elapsed + .65, arena.matchDuration - .58);
    }
    return true;
  }

  function clear(arena) {
    const scene = arena.transformation;
    if (scene.active) reveal(arena, scene.active.fighter);
    for (const fighter of scene.queue) reveal(arena, fighter);
    scene.active = null;
    scene.queue.length = 0;
  }

  function smooth(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function applyCamera(ctx, arena) {
    const current = arena.transformation.active;
    if (!current) return;
    const t = current.age / current.length;
    const strength = smooth(t / .245) * (1 - smooth((t - .73) / .27));
    const zoom = 1 + strength * 1.34;
    const x = arena.centerX + (current.fighter.x - arena.centerX) * strength;
    const y = arena.centerY + (current.fighter.y - arena.centerY) * strength;
    ctx.translate(arena.centerX, arena.centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-x, -y);
  }

  function shapePose(arena, fighter, style) {
    const current = arena.transformation.active;
    if (!current || current.fighter !== fighter) return;
    const progress = current.age / current.length;
    if (progress < revealAt) {
      const tension = smooth(progress / revealAt);
      style.sx *= 1 - tension * .11;
      style.sy *= 1 + tension * .10;
      style.y += Math.sin(progress * 105) * tension * 2.8;
      return;
    }
    const release = (progress - revealAt) / (1 - revealAt);
    const rebound = Math.sin(release * Math.PI * 2.4) * (1 - release);
    style.sx *= 1 + rebound * .19;
    style.sy *= 1 + rebound * .29;
    style.y -= Math.sin(release * Math.PI) * fighter.radius * .19;
  }

  function drawWorld(ctx, arena) {
    const current = arena.transformation.active;
    if (!current) return;
    const { fighter, age, length } = current;
    const progress = age / length;
    const energy = Math.sin(Math.PI * progress);
    const color = FighterForms.color(fighter);
    const width = fighter.radius;
    ctx.save();
    ctx.translate(fighter.x, fighter.y);
    const glow = ctx.createRadialGradient(0, 0, width * .12, 0, 0, width * (2.35 + energy * 1.1));
    const flash = Math.max(0, 1 - Math.abs(progress - revealAt) * 12);
    glow.addColorStop(0, '#fff6e7');
    glow.addColorStop(.27, color);
    glow.addColorStop(1, 'transparent');
    ctx.globalAlpha = energy * .18 + flash * .19;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, width * (2.35 + energy * 1.1), 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.globalAlpha = energy * .78;
    for (let i = 0; i < 4; i++) {
      const phase = i % 2 ? -1 : 1;
      const radius = width * (1.18 + i * .31 + energy * .37);
      const angle = age * 5.5 * phase + i * .94;
      ctx.lineWidth = i % 2 ? 1.8 : 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * .83, .48 * phase, angle, angle + Math.PI * 1.46);
      ctx.stroke();
    }

    ctx.strokeStyle = '#fffbef';
    ctx.lineWidth = 1.7;
    if (fighter.char.id === 'spider_man') {
      ctx.globalAlpha = energy * .58;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + age * 2.4;
        const r = width * (1.05 + energy * .7);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.quadraticCurveTo(-Math.sin(a) * r * .19, Math.cos(a) * r * .19, -Math.cos(a) * r, -Math.sin(a) * r);
        ctx.stroke();
      }
    } else if (fighter.char.id === 'luffy') {
      ctx.globalAlpha = energy * .69;
      ctx.fillStyle = '#f4e4ff';
      for (let i = 0; i < 9; i++) {
        const a = i * Math.PI * 2 / 9 + age * 2.1;
        const r = width * (1.26 + Math.max(0, progress - revealAt) * 1.5);
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r, Math.sin(a) * r, width * .18, width * .095, a + .54, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = '#fffbef';
    ctx.globalAlpha = Math.max(energy * .47, flash * .8);
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
      const angle = i * Math.PI * 2 / 14 + age * .4;
      const reach = width * (1.43 + (i % 3) * .19 + (progress >= revealAt ? (progress - revealAt) * .55 : .2));
      const length = width * (.22 + flash * .42);
      ctx.moveTo(Math.cos(angle) * reach, Math.sin(angle) * reach);
      ctx.lineTo(Math.cos(angle) * (reach + length), Math.sin(angle) * (reach + length));
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawTitle(ctx, arena, width) {
    const current = arena.transformation.active;
    if (!current) return;
    const progress = current.age / current.length;
    const opacity = smooth(progress * 9) * (1 - smooth((progress - .8) / .2));
    const color = FighterForms.color(current.fighter);
    const y = arena.centerY - 334 - Math.max(0, current.fighter.radius - 68) * 2.7;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = '700 29px Segoe UI, sans-serif';
    ctx.fillText('FINAL FORM', arena.centerX, y);
    ctx.font = '900 65px Segoe UI, sans-serif';
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#12101e';
    const name = FighterForms.name(current.fighter).toUpperCase();
    ctx.strokeText(name, arena.centerX, y + 71, width * .88);
    ctx.fillStyle = '#fffbef';
    ctx.fillText(name, arena.centerX, y + 71, width * .88);
    ctx.restore();
  }

  return { create, enqueue, advance, clear, applyCamera, shapePose, drawWorld, drawTitle };
})();
