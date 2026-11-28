'use strict';

// Each form supplies its display name and accent color.
const FighterRoster = (() => {
  function fighter(name, theme, finale, forms, options = {}) {
    return { name, theme, finale, forms, ...options };
  }

  const profiles = {
    spider_man: fighter('SPIDER-MAN', 'web', 'Infinite Spider Web', [
      ['Classic Spider-Man', '#ec5165'],
      ['Black Symbiote Suit', '#c1ccff'],
      ['Iron Spider', '#ffd379'],
      ['Spider-Totem', '#b6a7ee'],
      ['Captain Universe', '#8aefff']
    ], { passive: 'webDodge', speed: 414 }),
    ironman: fighter('IRON MAN', 'satellite', 'Stark Satellite Network', [
      ['Mark III', '#ff7c66'],
      ['Mark VII', '#65dcff'],
      ['Mark XLII', '#ffc469'],
      ['Mark L Nanotech', '#fa9d8c'],
      ['Mark LXXXV + Nano Gauntlet', '#ffdf8d']
    ], { finisher: 'satellite' }),
    wolverine: fighter('WOLVERINE', 'claw', 'Berserker Arena', [
      ['Classic Wolverine', '#ffd36c'],
      ['Weapon X', '#b1e4f3'],
      ['Berserker Rage', '#ff826f'],
      ['Hot Claws', '#cbd9f3'],
      ['Regeneration Overdrive', '#fff0a0']
    ], { passive: 'regeneration', speed: 404, finisher: 'claw' }),
    deadpool: fighter('DEADPOOL', 'glitch', 'Game Error', [
      ['Classic Deadpool', '#fb6677'],
      ['X-Force Deadpool', '#bbc5d4'],
      ['Healing Factor', '#f8948f'],
      ['Venompool', '#d89ab9'],
      ['Fourth Wall Deadpool', '#ff94c4']
    ], { passive: 'regeneration', speed: 402 }),
    captain_america: fighter('CAPTAIN AMERICA', 'shield', 'Vibranium Field', [
      ['Classic Captain', '#6a9afa'],
      ['Avengers Leader', '#9fbcff'],
      ['Energy-Shield Captain', '#daacff'],
      ['Worthy Captain', '#9af1ff'],
      ['Infinity Gauntlet Captain', '#ffd4ac']
    ]),
    thor: fighter('THOR', 'storm', 'Ragnarok Storm', [
      ['God of Thunder', '#82ccff'],
      ['Odinforce Thor', '#ffde89'],
      ['Stormbreaker Thor', '#87d9ff'],
      ['Dual-Wield Thor', '#b9adff'],
      ['King Thor', '#bfecff']
    ], { finisher: 'lightning' }),
    hulk: fighter('HULK', 'gamma', 'World Breaker', [
      ['Savage Hulk', '#89d86c'],
      ['Joe Fixit', '#bac2cf'],
      ['Gladiator Hulk', '#f9d38d'],
      ['World War Hulk', '#a8f46a'],
      ['Immortal Hulk', '#d3ff8d']
    ], { growth: .145, weight: .40, slowdown: .055 }),
    doctor_strange: fighter('DOCTOR STRANGE', 'mirror', 'Mirror Dimension', [
      ['Master of Mystic Arts', '#ffad74'],
      ['Sorcerer Supreme', '#ffd08d'],
      ['Mirror Dimension', '#87dcff'],
      ['Time Stone Strange', '#c994ff'],
      ['Multiverse Strange', '#ffcf83']
    ], { speed: 382 }),
    scarlet_witch: fighter('SCARLET WITCH', 'chaos', 'Chaos Reality', [
      ['Wanda Maximoff', '#ed637e'],
      ['Scarlet Witch', '#ff5474'],
      ['Chaos Witch', '#ff8fa3'],
      ['Reality Weaver', '#de85fb'],
      ['House of M', '#ff94bd']
    ], { passive: 'hex', speed: 383 }),
    thanos: fighter('THANOS', 'stones', 'Infinity Universe', [
      ['Armored Thanos', '#c59cf5'],
      ['Power Stone', '#c785ff'],
      ['Space and Reality', '#80cdff'],
      ['Soul, Time and Mind', '#e3f385'],
      ['Infinity Gauntlet', '#ffd297']
    ], { speed: 380, growth: .035, weight: .23 }),
    black_panther: fighter('BLACK PANTHER', 'panther', 'Ancestral Plane', [
      ['Panther Habit', '#abb7ef'],
      ['Vibranium Charge', '#a688ff'],
      ['Ancestral Herb', '#ffcc7c'],
      ['Panther Legacy', '#c3a5ff'],
      ['King of the Dead', '#d8b5ff']
    ], { passive: 'kinetic', speed: 414 }),
    loki: fighter('LOKI', 'timeline', 'Yggdrasil Timeline', [
      ['God of Mischief', '#a7dc87'],
      ['Frost Giant Loki', '#8ce4ff'],
      ['Illusion Master', '#bcf983'],
      ['Time Weaver', '#8eedbd'],
      ['God of Stories', '#d7ffc2']
    ], { passive: 'trickster', speed: 396 }),
    venom: fighter('VENOM', 'symbiote', 'Symbiote World', [
      ['Classic Venom', '#d0bdf2'],
      ['Enhanced Venom', '#c58bff'],
      ['Symbiote Swarm', '#db8fc7'],
      ['Winged Venom', '#a68be5'],
      ['King in Black', '#e8ace9']
    ], { speed: 390, growth: .055, weight: .19, slowdown: .02 }),
    doctor_doom: fighter('DOCTOR DOOM', 'doom', 'Battleworld', [
      ['Classic Doom', '#a0e4a0'],
      ['Doombot Commander', '#9deecb'],
      ['Sorcerer Doom', '#d1a7fd'],
      ['Cosmic Doom', '#9ad7ff'],
      ['God Emperor Doom', '#e6f6db']
    ], { passive: 'techWard', speed: 384 }),
    ghost_rider: fighter('GHOST RIDER', 'chain', 'Hellfire Arena', [
      ['Classic Ghost Rider', '#ff9d62'],
      ['Hellfire Infusion', '#ff774c'],
      ['Hellfire Projection', '#84dcff'],
      ['Penance Stare', '#ffb871'],
      ['Zarathos Unleashed', '#d0adff']
    ], { speed: 409, finisher: 'tether' }),
    black_widow: fighter('BLACK WIDOW', 'tactical', 'Tactical Network', [
      ['Classic Widow', '#ff927f'],
      ['Tactical Widow', '#88dcff'],
      ['Stealth Widow', '#b3bdfd'],
      ['Advanced Agent', '#ff7c99'],
      ['Red Room Protocol', '#ff99ae']
    ], { passive: 'webDodge', speed: 424 }),
    magneto: fighter('MAGNETO', 'metal', 'Magnetic Collapse', [
      ['Classic Magneto', '#f285a7'],
      ['Magnetic Master', '#d79aff'],
      ['Magnetic Flight', '#dfebff'],
      ['Omega Magneto', '#f9a7dd'],
      ['Geomagnetic Reversal', '#ffd4f1']
    ], { passive: 'techWard', speed: 387 }),
    captain_marvel: fighter('CAPTAIN MARVEL', 'stellar', 'Stellar Core', [
      ['Captain Marvel', '#ffc86b'],
      ['Energy Absorption', '#ffab6a'],
      ['Warbird', '#ffd873'],
      ['Binary', '#ff9279'],
      ['Binary Overdrive', '#fff0a1']
    ], { passive: 'absorb', speed: 418 }),
    moon_knight: fighter('MOON KNIGHT', 'moon', 'Temple of Khonshu', [
      ['Moon Knight', '#cbdcf9'],
      ['Mr. Knight', '#f7eee4'],
      ['Lunar Knight', '#abcfff'],
      ['Fist of Khonshu', '#d7c2ff'],
      ['Eclipse Avatar', '#ffd596']
    ], { passive: 'trickster', speed: 396 }),
    silver_surfer: fighter('SILVER SURFER', 'singularity', 'Cosmic Singularity', [
      ['Classic Silver Surfer', '#c4e4fc'],
      ['Cosmic Charge', '#89dfff'],
      ['Power Cosmic', '#c4c4ff'],
      ['Silver Surfer Black', '#9b9fe5'],
      ['Cosmic Transcendence', '#e1f9ff']
    ], { speed: 416, finisher: 'gravity' }),
    gojo: fighter('GOJO SATORU', 'infinity', 'Limitless Horizon', [
      ['Limitless + Six Eyes', '#00f3ff'],
      ['Maximum Output: Blue', '#81eaff'],
      ['Cursed Technique Reversal: Red', '#d7bdff'],
      ['Hollow Technique: Purple', '#e6a5ff'],
      ['Unlimited Void', '#eae1ff']
    ], { passive: 'infinityDodge' }),
    sukuna: fighter('RYOMEN SUKUNA', 'shrine', 'Shrine of Ruin', [
      ['Sukuna’s Vessel', '#fb4b72'],
      ['Shibuya Sukuna', '#ff7997'],
      ['Ten Shadows', '#ff5579'],
      ['Heian True Form', '#ff987a'],
      ['Malevolent Shrine', '#ffb0b8']
    ]),
    naruto: fighter('NARUTO UZUMAKI', 'fox', 'Nine-Tails Horizon', [
      ['Base Naruto', '#ff8b42'],
      ['Sage Mode', '#ffd477'],
      ['Kurama Chakra Mode', '#ff945c'],
      ['Six Paths Sage Mode', '#ffcb67'],
      ['Baryon Mode', '#ff8962']
    ]),
    luffy: fighter('MONKEY D. LUFFY', 'cloud', 'Dawn Playground', [
      ['Base + Haki', '#ff7968'],
      ['Gear 2', '#ffb086'],
      ['Gear 3', '#ff8e79'],
      ['Gear 4: Boundman', '#e7deff'],
      ['Gear 5: Dawn Monkey', '#ffe0b2']
    ], { finisher: 'tether' }),
    eren: fighter('EREN YEAGER', 'titan', 'Titan Faultline', [
      ['Scout Cadet', '#77ba91'],
      ['Attack Titan', '#aee6a9'],
      ['Hardened Attack Titan', '#e3bc8e'],
      ['War Hammer Power', '#d1d9d2'],
      ['Founding Titan', '#a2e4c4']
    ], { growth: .085, weight: .22, slowdown: .03 }),
    levi: fighter('LEVI ACKERMAN', 'blades', 'Ackerman Crosswind', [
      ['Underground Levi', '#93d4cc'],
      ['Survey Corps Captain', '#9ae9dc'],
      ['Ackerman Awakening', '#bde8ff'],
      ['Thunder Spear Levi', '#d2c4ff'],
      ['Beast Titan Pursuit', '#e2f4fa']
    ]),
    doraemon: fighter('DORAEMON', 'pocket', 'Twenty-Second Century', [
      ['Air Cannon', '#4fb8f1'],
      ['Take-copter', '#78edff'],
      ['Small Light', '#a9b8ff'],
      ['Anywhere Door', '#ead0f9'],
      ['Time Cloth', '#ff90af']
    ]),
    frieren: fighter('FRIEREN', 'runes', 'Astral Constellation', [
      ['Restrained Mana', '#88dec3'],
      ['Zoltraak', '#a6e6c1'],
      ['Judradjim and Vollzanbel', '#e0c7ff'],
      ['Analysis and Dispel', '#c4d4ff'],
      ['Unrestrained Mana', '#f4deff']
    ])
  };

  function get(id) { return profiles[id]; }

  function form(fighter) {
    return get(fighter.char.id)?.forms[fighter.formStage];
  }

  return { get, form, ids: Object.keys(profiles) };
})();
