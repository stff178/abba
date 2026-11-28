'use strict';

const ArenaBounds = (() => {
  function limit(arena, padding) {
    return Math.max(0, arena.arenaHalfSize - padding);
  }

  function clamp(value, center, halfSize) {
    return Math.max(center - halfSize, Math.min(center + halfSize, value));
  }

  function confine(arena, point, padding = 0) {
    const half = limit(arena, padding);
    return { x: clamp(point.x, arena.centerX, half), y: clamp(point.y, arena.centerY, half) };
  }

  function contains(arena, point, padding = 0) {
    const half = limit(arena, padding);
    return Math.abs(point.x - arena.centerX) <= half + 1e-7 &&
      Math.abs(point.y - arena.centerY) <= half + 1e-7;
  }

  function reflect(arena, body, padding = 0) {
    const point = confine(arena, body, padding);
    const nx = Math.sign(body.x - point.x);
    const ny = Math.sign(body.y - point.y);
    Object.assign(body, point);
    const xHit = nx * body.vx > 0;
    const yHit = ny * body.vy > 0;
    if (xHit) body.vx *= -1;
    if (yHit) body.vy *= -1;
    if (!xHit && !yHit) return null;
    return { x: xHit ? body.x + nx * padding : body.x,
      y: yHit ? body.y + ny * padding : body.y };
  }

  function clearance(arena, point, ux, uy, padding = 0) {
    const half = limit(arena, padding);
    const dx = point.x - arena.centerX;
    const dy = point.y - arena.centerY;
    const x = ux > 0 ? (half - dx) / ux : ux < 0 ? (-half - dx) / ux : Infinity;
    const y = uy > 0 ? (half - dy) / uy : uy < 0 ? (-half - dy) / uy : Infinity;
    return Math.max(0, Math.min(x, y));
  }

  function separation(arena, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    const minimum = a.radius + b.radius;
    if (distance >= minimum) return null;

    const angle = distance > .0001 ? Math.atan2(dy, dx) : Math.atan2(arena.centerY - a.y, arena.centerX - a.x);
    const target = minimum + 3;
    const normal = (nx, ny) => {
      const projection = dx * nx + dy * ny;
      const gap = Math.hypot(projection, Math.sqrt(target * target - distance * distance)) - projection;
      return { nx, ny, gap, aSpace: clearance(arena, a, -nx, -ny, a.boundaryRadius ?? a.radius),
        bSpace: clearance(arena, b, nx, ny, b.boundaryRadius ?? b.radius) };
    };
    let best = normal(Math.cos(angle), Math.sin(angle));
    if (best.aSpace + best.bSpace >= best.gap) return best;

    // A diagonal normal may point both bodies into adjacent walls in the same corner.
    for (const [nx, ny] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const option = normal(nx, ny);
      if (option.aSpace + option.bSpace < option.gap) continue;
      if (best.aSpace + best.bSpace < best.gap || option.gap < best.gap) best = option;
    }
    return best;
  }

  function wallAt(arena, angle, padding = 0) {
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const distance = limit(arena, padding) / Math.max(Math.abs(ux), Math.abs(uy));
    return { x: arena.centerX + ux * distance, y: arena.centerY + uy * distance };
  }

  function trace(ctx, arena, inset = 0) {
    const half = limit(arena, inset);
    ctx.beginPath();
    ctx.rect(arena.centerX - half, arena.centerY - half, half * 2, half * 2);
  }

  function lane(arena, inset, position) {
    const half = limit(arena, inset);
    const t = ((position % 4) + 4) % 4;
    const side = Math.floor(t);
    const offset = (t - side) * half * 2 - half;
    if (side === 0) return { x: arena.centerX + offset, y: arena.centerY - half };
    if (side === 1) return { x: arena.centerX + half, y: arena.centerY + offset };
    if (side === 2) return { x: arena.centerX - offset, y: arena.centerY + half };
    return { x: arena.centerX - half, y: arena.centerY - offset };
  }

  function traceEdge(ctx, arena, inset, from, length) {
    const start = lane(arena, inset, from);
    const to = from + length;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (let corner = Math.floor(from) + 1; corner < to; corner++) {
      const point = lane(arena, inset, corner);
      ctx.lineTo(point.x, point.y);
    }
    const end = lane(arena, inset, to);
    ctx.lineTo(end.x, end.y);
  }

  return { confine, contains, reflect, clearance, separation, wallAt, trace, lane, traceEdge };
})();
