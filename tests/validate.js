#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const inline = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inline, 'index.html is missing its main script');
new vm.Script(inline, { filename: 'index.html' });

const runtimeScripts = [...html.matchAll(/<script src="(src\/[^"\r\n]+\.js)"><\/script>/g)];
const context = vm.createContext({
  window: {},
  document: { getElementById: id => id === 'arena-canvas' ? { getContext: () => ({}) } : null }
});
for (const [, file] of runtimeScripts) {
  const program = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(program, context, { filename: file });
}
console.log('PASS: Loaded ' + runtimeScripts.length + ' runtime scripts.');

const controls = inline.indexOf('      const game = new BattleArena();');
assert.ok(controls > 0, 'Could not locate the boundary between the engine and browser controls');
vm.runInContext(inline.slice(0, controls) + [
  'SoundFX.enabled = false;',
  'Object.assign(globalThis, { BattleArena, CHARACTER_REGISTRY, FighterRoster, FighterForms, SkillTimeline, CharacterMoves, UltimateAnimator, ComicSkills, ArenaBounds, CombatMovement, FighterAnimator });',
  '})();'
].join('\n'), context, { filename: 'index.html' });

const { BattleArena, CHARACTER_REGISTRY: registry, FighterRoster, FighterForms, SkillTimeline, CharacterMoves, UltimateAnimator, ComicSkills, ArenaBounds, CombatMovement, FighterAnimator } = context;
const ids = Object.keys(registry);
assert.equal(ids.length, 28);
assert.equal(new Set(Object.values(registry).map(fighter => fighter.name)).size, 28);
const arena = new BattleArena();
const slots = ['skill1', 'skill2', 'ultimate'];

for (const id of ids) {
  arena.p1Id = id;
  arena.reset();
  const [fighter, target] = arena.fighters;
  assert.equal(fighter.maxHp, 100, id + ' max HP');
  assert.equal(FighterRoster.get(id).forms.length, 5, id + ' forms');
  const ultimates = Array.from({ length: 5 }, (_, form) => CharacterMoves.get(id, form, 'ultimate')?.name);
  assert.ok(ultimates.every(Boolean) && new Set(ultimates).size === 5, id + ' ultimate progression');
  assert.equal(typeof fighter.char.skills.passive, 'function', id + ' passive');

  for (const [stage, hp] of [100, 80, 60, 40, 20].entries()) {
    fighter.currentHp = hp;
    FighterForms.sync(arena, fighter);
    assert.equal(fighter.formStage, stage, id + ' phase at ' + hp + ' HP');
    assert.ok(Number.isFinite(FighterForms.damageMultiplier(fighter)), id + ' damage multiplier');
    for (const slot of slots) {
      SkillTimeline.begin(fighter, target, slot, .7);
      const cast = fighter.skillCast;
      assert.equal(cast.technique, CharacterMoves.get(id, stage, slot)?.technique, id + ' ' + stage + ' ' + slot);
      if (id === 'hulk') assert.ok(cast.technique === 'regeneration' ||
        (cast.contact && ['punch', 'stomp', 'bodyRush', 'grapple', 'hammer'].includes(cast.action)));
      {
        const rig = UltimateAnimator.pose(arena, fighter, fighter.radius);
        assert.equal(rig.hands.length, id === 'sukuna' && stage >= 3 ? 4 : 2, id + ' hands');
        assert.equal(rig.feet, undefined, id + ' hand-only animation');
        assert.equal(rig.elbows.length, rig.hands.length);
        cast.age = cast.charge + .2;
        const released = UltimateAnimator.pose(arena, fighter, fighter.radius);
        assert.notDeepEqual(released.hands, rig.hands, id + ' ultimate release stance');
        cast.age = 0;
      }
      if (cast.kind === 'signature') assert.ok(cast.action && cast.name, id + ' ' + stage + ' ' + slot);
      else assert.equal(typeof fighter.char.skills[slot], 'function', id + ' ' + stage + ' ' + slot);
      SkillTimeline.update(arena, fighter, cast.charge + .015);
      assert.ok(Number.isFinite(fighter.x) && Number.isFinite(fighter.vx), id + ' cast state');
      if (ComicSkills.handles(cast.technique)) assert.ok(cast.comic, id + ' comic effect');
    }
  }

  assert.ok(arena.finalFormStages[0], id + ' final arena element');
  fighter.currentHp = 65;
  FighterForms.sync(arena, fighter);
  assert.equal(fighter.formStage, 4, id + ' forms remain unlocked on healing');
}
console.log('PASS: Verified 28 fighters, 140 forms and 420 hand-animated casts.');
assert.equal(CharacterMoves.get('gojo', 4, 'ultimate').technique, 'void');
assert.equal(CharacterMoves.get('sukuna', 1, 'ultimate').technique, 'divineFlame');
assert.equal(CharacterMoves.get('sukuna', 2, 'ultimate').technique, 'tenShadows');
assert.equal(CharacterMoves.get('naruto', 4, 'ultimate').contact, true);
assert.equal(CharacterMoves.get('thanos', 4, 'ultimate').technique, 'snap');
assert.equal(CharacterMoves.get('doraemon', 4, 'ultimate').technique, 'timeCloth');

const square = new BattleArena();
const [left, right] = square.fighters;
const cornerX = square.centerX + square.arenaHalfSize;
const cornerY = square.centerY - square.arenaHalfSize;
const ricochet = { x: cornerX + 4, y: cornerY - 7, vx: 300, vy: -460 };
const wall = ArenaBounds.reflect(square, ricochet);
assert.equal(wall.x, cornerX);
assert.equal(wall.y, cornerY);
assert.equal(ricochet.vx, -300);
assert.equal(ricochet.vy, 460);
assert.ok(ArenaBounds.contains(square, { x: cornerX - 8, y: cornerY + 8 }));
Object.assign(left, { x: cornerX - left.radius, y: cornerY + left.radius + 9, vx: 0, vy: 0 });
Object.assign(right, { x: cornerX - right.radius - 12, y: cornerY + right.radius, vx: 0, vy: 0 });
square.resolveBallCollision();
assert.ok(Math.hypot(left.x - right.x, left.y - right.y) > left.radius + right.radius);
assert.ok(square.fighters.every(fighter => ArenaBounds.contains(square, fighter, fighter.radius)));

square.reset();
square.running = true;
const [shooter, dodger] = square.fighters;
Object.assign(shooter, { x: square.centerX - 220, y: square.centerY, vx: 0, vy: 0 });
Object.assign(dodger, { x: square.centerX + 30, y: square.centerY, vx: 0, vy: 0 });
SkillTimeline.begin(shooter, dodger, 'skill1');
const attack = shooter.skillCast;
Object.assign(attack, { action: 'volley', age: attack.charge + .17, nodes: [
  { x: dodger.x - 150, y: dodger.y, vx: 1050, vy: 0 }
] });
CombatMovement.advance(square, 1 / 60);
assert.ok(Math.abs(dodger.vy) > Math.abs(dodger.vx), 'The fighter sidesteps the incoming shot');
assert.ok(CombatMovement.avoids(dodger, shooter, attack));
assert.ok(!CombatMovement.avoids(dodger, shooter, {}), 'The dodge protects against the telegraphed attack');
assert.ok(square.floatingTexts.some(text => text.text === 'NÉ ĐÒN'), 'The dodge has a callout');
const dodgeHit = square.applyDamage(shooter, dodger, 5, { color: '#fff', attack, skill: attack, isRanged: true });
assert.ok(dodgeHit.blocked && dodgeHit.amount === 0);
assert.equal(square.skillHits.length, 0, 'A dodged attack must not leave an impact');
assert.equal(dodger.skillReaction, null);
console.log('PASS: Verified square walls, corner separation, and a directional dodge against an incoming shot.');

const strike = new BattleArena();
strike.p1Id = 'hulk';
strike.p2Id = 'ironman';
strike.reset();
strike.elapsed = 30;
strike.time = 30;
const [striker, defender] = strike.fighters;
SkillTimeline.begin(striker, defender, 'ultimate');
const smash = striker.skillCast;
const start = FighterAnimator.pose(defender, strike.time, false, false);
const landed = strike.applyDamage(striker, defender, 6, { color: smash.color, skill: smash, attack: smash });
assert.ok(landed.amount > 0, 'The skill landed');
assert.equal(strike.skillHits.length, 1);
assert.equal(defender.skillReaction.mode, 'heavy');
assert.ok(FighterAnimator.pose(defender, strike.time, false, false).x > start.x, 'Defender recoils away from the caster');
assert.equal(UltimateAnimator.pose(strike, defender, defender.radius).clip, 'flinch');
assert.equal(FighterAnimator.reaction(defender, strike.time + .45), null, 'The flinch ends after recovery');
console.log('PASS: A landed skill creates directional recoil and impact art, while a dodge creates neither.');

for (const [duration, side] of [[3.4, 1], [30, 0], [60, 1], [93.7, 0]]) {
  const battle = new BattleArena();
  battle.p1Id = 'spider_man';
  battle.p2Id = 'hulk';
  battle.matchDuration = duration;
  battle.winnerPreference = String(side);
  battle.reset();
  battle.running = true;
  let finisher;
  const applyDamage = battle.applyDamage.bind(battle);
  battle.applyDamage = (attacker, defender, amount, opts) => {
    const before = defender.currentHp;
    const hit = applyDamage(attacker, defender, amount, opts);
    if (attacker.char.id === 'hulk') assert.ok(!opts.isRanged, 'Hulk must use physical attacks');
    if (opts.isPaced || opts.isFinisher) {
      assert.ok(Math.hypot(attacker.x - defender.x, attacker.y - defender.y) <= attacker.radius + defender.radius + 24,
        'Scheduled damage requires contact');
    }
    if (opts.isFinisher) finisher = { before, dealt: hit.amount, time: battle.elapsed };
    return hit;
  };
  let halfway;
  const halfSize = battle.arenaHalfSize;
  for (let step = 0; !battle.koState && step < duration * 70 + 1; step++) {
    assert.ok(battle.fighters.every(fighter => fighter.currentHp > 0), 'Early K.O.');
    battle.update(1 / 60);
    assert.ok(battle.fighters.every(fighter => ArenaBounds.contains(battle, fighter, fighter.radius)), 'Fighter left the square');
    if (!halfway && battle.elapsed >= duration / 2) halfway = battle.fighters.map(fighter => fighter.currentHp);
  }
  assert.ok(halfway?.every(hp => hp > 34 && hp < 64), 'Damage was not distributed across the match');
  assert.ok(battle.projectiles.every(shot => shot.owner.char.id !== 'hulk'), 'Hulk cannot create projectiles');
  assert.ok(finisher && finisher.before > 0 && finisher.before <= 10, 'Closing hit must use the small remaining HP');
  assert.equal(finisher.dealt, finisher.before);
  assert.equal(finisher.time, duration);
  assert.equal(battle.elapsed, duration);
  assert.equal(battle.koState.winner.side, side);
  assert.equal(battle.koState.loser.currentHp, 0);
  assert.equal(battle.arenaHalfSize, halfSize);
  assert.ok(battle.finalFormStages.every(Boolean), 'Both final arena elements should coexist');
}
console.log('PASS: Damage is spread across timed matches, including a real last hit at 60 seconds.');

const duel = new BattleArena();
duel.p1Id = 'spider_man';
duel.p2Id = 'hulk';
duel.reset();
duel.running = true;
duel.elapsed = 48;
const [spider, hulk] = duel.fighters;
for (const fighter of duel.fighters) {
  fighter.currentHp = 20;
  FighterForms.sync(duel, fighter);
}
assert.ok(hulk.radius > hulk.char.radius * 1.5);
const positions = duel.fighters.map(fighter => [fighter.x, fighter.y]);
for (let frame = 0; frame < 50; frame++) duel.update(1 / 60);
assert.deepEqual(duel.fighters.map(fighter => [fighter.x, fighter.y]), positions);
assert.ok(duel.elapsed > 48.8, 'The countdown continues during the freeze');
assert.equal(duel.transformation.active.fighter, spider);
assert.equal(spider.formBefore, null, 'The portrait switches during the zoom');
assert.ok(hulk.formBefore, 'Simultaneous transformations are shown in order');
for (let frame = 0; frame < 12; frame++) duel.update(1 / 60);
assert.equal(spider.skillCast.action, 'webArena');
assert.ok(spider.skillCast.age >= spider.skillCast.charge, 'The ultimate releases without charging again');
for (let frame = 0; frame < 23; frame++) duel.update(1 / 60);
const lattice = spider.skillCast.spectacle.paths.flat();
assert.ok(Math.max(...lattice.map(point => point.x)) - Math.min(...lattice.map(point => point.x)) > duel.arenaHalfSize * 1.78);
for (let frame = 0; frame < 94; frame++) duel.update(1 / 60);
assert.ok(duel.finalFormStages.every(Boolean));
assert.equal(hulk.skillCast?.action, 'stomp');
assert.ok(hulk.skillCast?.contact);
assert.ok(duel.ultimateDomains[1]);
console.log('PASS: Final-form scenes freeze combat, then launch both queued ultimates.');
