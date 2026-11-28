'use strict';

const CharacterMoves = (() => {
  // Each row is the tactical attack, close/support follow-up and ultimate for one form.
  const kits = {
    hulk: [
      ['Heavy Hook/punch', 'Shoulder Charge/bodyRush', 'Hulk Smash/stomp'],
      ['Ground Pound/stomp', 'Rage Uppercut/punch', 'Seismic Landing/bodyRush'],
      ['Gladiator Hook/punch', 'Arena Grapple/grapple', 'Gladiator Slam/stomp'],
      ['Warbound Charge/bodyRush', 'Double-Fist Smash/punch', 'World War Pummel/punch'],
      ['Gamma Knuckle/punch', 'Faultline Stomp/stomp', 'World Breaker Smash/stomp']
    ],
    spider_man: [
      ['Web Shot/web', 'Swing Kick/webKick', 'Web Swing Takedown/webKick'],
      ['Anchor Swing/web', 'Acrobatic Kick/webKick', 'Web Cocoon/web'],
      ['Iron Spider Legs/claws', 'Wrist Web/web', 'Iron Spider Takedown/claws'],
      ['Symbiote Web/web', 'Tendril Slam/tether', 'Symbiote Cocoon/tether'],
      ['Cosmic Web/web', 'Wall Swing Kick/webKick', 'Infinite Spider Web/webArena']
    ],
    ironman: [
      ['Palm Repulsor/repulsor', 'Boot-Thruster Rush/bodyRush', 'Chest Unibeam/unibeam'],
      ['Twin Repulsors/repulsor', 'Shoulder Micro-Missiles/missile', 'Repulsor Crossfire/repulsor'],
      ['Repulsor Flight Pass/repulsor', 'Armor Module Guard/guard', 'Modular Repulsor Array/ironArmor'],
      ['Nanotech Blade/sword', 'Nanotech Shield/guard', 'Nanotech Unibeam/unibeam'],
      ['Godkiller Repulsor/repulsor', 'Armor Wing Rush/bodyRush', 'Iron Legion Crossfire/ironArmor']
    ],
    wolverine: [
      ['Adamantium Swipe/claws', 'Feral Lunge/claws', 'Adamantium Crosscut/claws'],
      ['Weapon X Cut/claws', 'Shoulder Rake/claws', 'Weapon X Breakout/claws'],
      ['Berserker Pounce/claws', 'Rising Claw/claws', 'Berserker Triple Cut/claws'],
      ['Adamantium Counter/claws', 'Raking Rush/claws', 'Berserker Close-Quarters/claws'],
      ['Immortal Crosscut/claws', 'Feral Grapple/grapple', 'Immortal Berserker Barrage/claws']
    ],
    deadpool: [
      ['Katana Cross/sword', 'Acrobatic Kick/kick', 'Twin Katana Flourish/sword'],
      ['X-Force Katana Dash/sword', 'Short-Range Counter/kick', 'X-Force Crosscut/sword'],
      ['Spinning Katana/sword', 'Recovering Guard/guard', 'Mercenary Blade Rush/sword'],
      ['Symbiote Grip/tether', 'Symbiote Katana/sword', 'Venompool Double Cut/sword'],
      ['Katana Feint/sword', 'Comic-Panel Kick/kick', 'Merc’s Encore/sword']
    ],
    captain_america: [
      ['Shield Throw/shieldThrow', 'Shield Bash/shieldBash', 'Vibranium Ricochet/shieldThrow'],
      ['Banking Shield Throw/shieldThrow', 'Cover Behind Shield/guard', 'Shield Return Combo/shieldBash'],
      ['Vibranium Intercept/guard', 'Shield Counter/shieldBash', 'Vibranium Countercharge/shieldBash'],
      ['Worthy Shield Bash/shieldBash', 'Mjolnir Throw/hammerThrow', 'Worthy Thunder/lightning'],
      ['Sentinel Shield Throw/shieldThrow', 'Shield Rush/shieldBash', 'Sentinel Ricochet/shieldThrow']
    ],
    thor: [
      ['Mjolnir Throw/hammerThrow', 'Mjolnir Strike/hammer', 'Mjolnir Thunder/lightning'],
      ['Lightning Call/lightning', 'Returning Hammer/hammerThrow', 'Thunder Cross/lightning'],
      ['Stormbreaker Slash/hammer', 'Stormbreaker Throw/hammerThrow', 'Stormbreaker Descent/hammer'],
      ['Rune Lightning/lightning', 'God of Thunder Hammer/hammer', 'Rune Thunderstorm/lightning'],
      ['Cosmic Stormbreaker/hammer', 'Stormbreaker Return/hammerThrow', 'Ragnarok Lightning/lightning']
    ],
    doctor_strange: [
      ['Crimson Bands of Cyttorak/tether', 'Mystic Shield/guard', 'Crimson Bands Circle/tether'],
      ['Sling Ring Gate/portal', 'Mystic Binding/tether', 'Twin Sling Ring Gates/portal'],
      ['Mirror Gate/portal', 'Images of Ikonn/illusion', 'Mirror Dimension Fold/portal'],
      ['Crimson Bands Weave/tether', 'Mystic Ward/guard', 'Images of Ikonn Formation/illusion'],
      ['Multiverse Gate/portal', 'Ring of Binding/tether', 'Mirror Dimension Array/portal']
    ],
    scarlet_witch: [
      ['Chaos Bolt/hexBolt', 'Warding Hex/guard', 'Scarlet Hex Burst/chaos'],
      ['Scarlet Hex/chaos', 'Chaos Bolt Pair/hexBolt', 'Hex Circle/chaos'],
      ['Seeking Chaos Bolt/hexBolt', 'Reality Hex/chaos', 'Chaos Magic Convergence/chaos'],
      ['Probability Hex/chaos', 'Scarlet Barrier/guard', 'Reality Rewritten/chaos'],
      ['House of M Hex/chaos', 'Scarlet Chaos Volley/hexBolt', 'House of M Reality/chaos']
    ],
    thanos: [
      ['Titan Punch/punch', 'Titan Grapple/grapple', 'Titan Overpower/stomp'],
      ['Power Stone Wave/powerStone', 'Titan Smash/stomp', 'Power Stone Release/powerStone'],
      ['Space Stone Gate/portal', 'Reality Stone Warp/chaos', 'Space and Reality Fold/portal'],
      ['Mind Stone Pressure/chaos', 'Time Stone Slow/timeStone', 'Time Stone Reversal/timeStone'],
      ['Infinity Gauntlet Bolt/stones', 'Space Stone Rift/portal', 'Infinity Stones Convergence/stones']
    ],
    black_panther: [
      ['Vibranium Claws/claws', 'Panther Pounce/kick', 'Panther Claw Takedown/claws'],
      ['Kinetic Storage/guard', 'Charged Claw/claws', 'Vibranium Kinetic Discharge/kinetic'],
      ['Golden Vibranium Claw/claws', 'Panther Counter/kick', 'Golden Panther Rush/claws'],
      ['Ancestral Prowl/claws', 'Vibranium Guard/guard', 'Ancestral Kinetic Burst/kinetic'],
      ['Claws of Bast/claws', 'Vibranium Pounce/kick', 'Avatar of Bast Kinetic Release/kinetic']
    ],
    loki: [
      ['Illusion Feint/illusion', 'Asgardian Dagger/sword', 'Hall of Mischief/illusion'],
      ['Frost Spell/frost', 'Frost Giant Dagger/sword', 'Frost Giant Illusion/frost'],
      ['Double Illusion/illusion', 'Vanishing Blade/sword', 'Illusion Court/illusion'],
      ['Timeline Gate/portal', 'Decoy Dagger/sword', 'Temporal Decoy/illusion'],
      ['Yggdrasil Illusion/illusion', 'Timeline Step/portal', 'Yggdrasil Mirror Legion/illusion']
    ],
    venom: [
      ['Symbiote Lash/tether', 'Venom Pounce/grapple', 'Symbiote Takedown/tether'],
      ['Double Tendril/tether', 'Symbiote Slam/stomp', 'Tendril Swarm/tether'],
      ['Symbiote Snare/tether', 'Brutal Grapple/grapple', 'Symbiote Grasp/tether'],
      ['Symbiote Wing Dive/bodyRush', 'Winged Tendril/tether', 'Black Wings Takedown/grapple'],
      ['King in Black Tendrils/tether', 'Symbiote Crush/stomp', 'Symbiote World Grasp/tether']
    ],
    doctor_doom: [
      ['Doom Armor Ray/beam', 'Armor Force Field/guard', 'Doom Arc Discharge/beam'],
      ['Doombot Patrol/doomBots', 'Armored Gauntlet/punch', 'Doombot Crossfire/doomBots'],
      ['Latverian Sigil/chaos', 'Mystic Ward/guard', 'Doom Sorcery Circle/chaos'],
      ['Cosmic Armor Ray/beam', 'Cosmic Ward/guard', 'Cosmic Doom Discharge/beam'],
      ['Battleworld Doombots/doomBots', 'God Emperor Ward/guard', 'Battleworld Doombot Array/doomBots']
    ],
    ghost_rider: [
      ['Hellfire Chain/hellChain', 'Hellfire Trail/flame', 'Hellfire Chain Swing/hellChain'],
      ['Flaming Chain Hook/hellChain', 'Hellfire Charge/flame', 'Spirit’s Chain Snare/hellChain'],
      ['Blue Hellfire/flame', 'Blue Chain/hellChain', 'Blue Flame Circuit/flame'],
      ['Vengeance Chain/hellChain', 'Judgment Glare/penance', 'Penance Stare/penance'],
      ['Cosmic Hellfire Trail/flame', 'Cosmic Chain/hellChain', 'Hellfire Chain Arena/hellChain']
    ],
    black_widow: [
      ['Widow’s Bite/widowBite', 'Baton Sweep/baton', 'Widow Baton Counter/baton'],
      ['Tactical Baton/baton', 'Widow’s Bite Pair/widowBite', 'Widow Slide Takedown/kick'],
      ['Stealth Takedown/kick', 'Baton Counter/baton', 'Widow’s Bite Overload/widowBite'],
      ['Widow’s Bite Circuit/widowBite', 'Twin Batons/baton', 'Twin Baton Rush/baton'],
      ['Red Room Baton/baton', 'Red Room Counter/kick', 'Red Room Takedown/baton']
    ],
    magneto: [
      ['Metal Shards/metalShards', 'Magnetic Deflection/magnet', 'Metal Barrage/metalShards'],
      ['Magnetic Metal Ring/magnet', 'Shrapnel Fan/metalShards', 'Metal Storm/metalShards'],
      ['Magnetic Shield/guard', 'Polarity Pull/magnet', 'White Magneto Shrapnel/metalShards'],
      ['Omega Polarity/magnet', 'Metal Crossfire/metalShards', 'Omega Magnetic Field/magnet'],
      ['Magnetic Collapse/magnet', 'Magnetic Shrapnel/metalShards', 'Magnetic Sovereign Field/magnet']
    ],
    captain_marvel: [
      ['Photon Blast/photon', 'Flight Punch/bodyRush', 'Photon Impact/photon'],
      ['Photon Salvo/photon', 'Aerial Dash/bodyRush', 'Photon Overload/photon'],
      ['Energy Absorption/guard', 'Photon Return/photon', 'Absorbed Energy Release/photon'],
      ['Binary Flight Strike/bodyRush', 'Binary Photon Bolt/photon', 'Binary Photon Burst/nova'],
      ['Cosmic Photon Blast/photon', 'Stellar Charge/bodyRush', 'Binary Stellar Core/nova']
    ],
    moon_knight: [
      ['Crescent Dart/crescent', 'Crescent Blade/sword', 'Crescent Ricochet/crescent'],
      ['Mr. Knight Baton/baton', 'Mr. Knight Counter/kick', 'Mr. Knight Baton Flurry/baton'],
      ['Lunar Crescent Darts/crescent', 'Crescent Blade Rush/sword', 'Lunar Crescent Sweep/crescent'],
      ['Khonshu Crescent/crescent', 'Lunar Blade/sword', 'Fist of Khonshu Assault/sword'],
      ['Eclipse Crescent Volley/crescent', 'Moon Blade Rush/sword', 'Eclipse Crescent Storm/crescent']
    ],
    silver_surfer: [
      ['Power Cosmic Ray/cosmicRay', 'Board Sweep/boardRush', 'Silver Cosmic Burst/cosmicRay'],
      ['Charged Cosmic Ray/cosmicRay', 'Cosmic Skim/boardRush', 'Cosmic Board Break/boardRush'],
      ['Cosmic Orbit/orbit', 'Silver Ray/cosmicRay', 'Power Cosmic Convergence/nova'],
      ['Silver Surfer Black Ray/cosmicRay', 'Dark Cosmic Field/gravity', 'Dark Matter Well/gravity'],
      ['Galactic Power Cosmic/cosmicRay', 'Cosmic Board Dive/boardRush', 'Cosmic Singularity/gravity']
    ],
    gojo: [
      ['Cursed Technique Lapse: Blue/blue', 'Infinity/guard', 'Hollow Purple/purple'],
      ['Six Eyes Blue/blue', 'Cursed Technique Reversal: Red/red', 'Maximum Output Blue/blue'],
      ['Limitless Red/red', 'Lapse: Blue Pull/blue', 'Unlimited Void/void'],
      ['Maximum Output Red/red', 'Blue Singularity/blue', 'Maximum Output Hollow Purple/purple'],
      ['Limitless Blue and Red/purple', 'Unlimited Void/void', 'Unrestricted Hollow Purple/purple']
    ],
    sukuna: [
      ['Dismantle/cursedSlash', 'Cleave/claws', 'Malevolent Shrine/shrine'],
      ['Dismantle Cross/cursedSlash', 'Cleave Counter/claws', 'Shrine: Grid of Slashes/shrine'],
      ['Dismantle Lattice/cursedSlash', 'Cleave at Close Range/claws', 'Malevolent Shrine Barrage/shrine'],
      ['Dismantle Line/cursedSlash', 'Cleave Rupture/claws', 'World-Cutting Dismantle/cursedSlash'],
      ['World-Cutting Slash/cursedSlash', 'Cleave Crosscut/claws', 'Malevolent Shrine: Open Domain/shrine']
    ],
    naruto: [
      ['Shadow Clone Jutsu/ninjaClone', 'Rasengan/rasengan', 'Multi Shadow Clone Combo/ninjaClone'],
      ['Shadow Clone Rasengan/rasengan', 'Chakra Arm/tether', 'Giant Rasengan/rasengan'],
      ['Nine-Tails Chakra Arm/tether', 'Rasengan Rush/rasengan', 'Tailed Beast Bomb/chakraBomb'],
      ['Sage Rasenshuriken/rasenshuriken', 'Shadow Clone Assault/ninjaClone', 'Six Paths: Rasenshuriken/rasenshuriken'],
      ['Kurama Chakra Arm/tether', 'Tailed Beast Bomb/chakraBomb', 'Tailed Beast Rasenshuriken/rasenshuriken']
    ],
    luffy: [
      ['Gum-Gum Pistol/elastic', 'Gum-Gum Whip/elastic', 'Gum-Gum Gatling/elasticFlurry'],
      ['Gear 2: Jet Pistol/elastic', 'Jet Stamp/elastic', 'Gear 2: Jet Gatling/elasticFlurry'],
      ['Gear 4: Kong Gun/elastic', 'Python/elastic', 'Gear 4: King Kong Gun/dawnFists'],
      ['Gear 5: Dawn Whip/elastic', 'Gum-Gum Giant/elastic', 'Gear 5: Bajrang Gun/dawnFists'],
      ['Dawn Monkey Pistol/elastic', 'Dawn Gatling/elasticFlurry', 'Dawn Monkey: Bajrang Gun/dawnFists']
    ],
    eren: [
      ['Cadet ODM Blade/odm', 'Twin Blade Counter/sword', 'Scout Assault/odm'],
      ['Attack Titan Hook/punch', 'Titan Grapple/grapple', 'Attack Titan Takedown/stomp'],
      ['Titan Heavy Fist/punch', 'Hardened Knuckles/punch', 'Attack Titan Ground Smash/stomp'],
      ['War Hammer Floor Spikes/warHammer', 'Hardened Strike/punch', 'War Hammer Spike Field/warHammer'],
      ['Founding Titan Sovereign Step/stomp', 'Titan Advance/titanMarch', 'Founding Titan: The Rumbling/titanMarch']
    ],
    levi: [
      ['ODM Blade Rush/odm', 'Twin Blade Slash/sword', 'Ackerman Spinning Cut/odm'],
      ['Grapple Slash/odm', 'Reverse-Grip Cut/sword', 'ODM Crosscut/odm'],
      ['Ackerman Twin Blades/sword', 'Grapple Feint/odm', 'Ackerman High-Speed Duel/odm'],
      ['Thunder Spear Volley/thunderSpears', 'Reverse Blade Flurry/odm', 'Thunder Spear Barrage/thunderSpears'],
      ['Ackerman Blade Charge/odm', 'Thunder Spear Pass/thunderSpears', 'Ackerman Dual Blade Rush/odm']
    ],
    doraemon: [
      ['Air Cannon/airCannon', 'Small Light/smallLight', 'Air Cannon Gust/airCannon'],
      ['Take-copter Dive/copter', 'Air Cannon Puff/airCannon', 'Take-copter Air Cannon/airCannon'],
      ['Small Light Sweep/smallLight', 'Air Cannon Burst/airCannon', 'Small Light and Air Cannon/smallLight'],
      ['Anywhere Door Escape/door', 'Air Cannon Counter/airCannon', 'Anywhere Door Surprise/door'],
      ['Anywhere Door Step/door', 'Small Light Assist/smallLight', 'Anywhere Door Air Cannon/door']
    ],
    frieren: [
      ['Zoltraak/zoltraak', 'Defensive Magic/guard', 'Zoltraak Barrage/zoltraak'],
      ['Hexagonal Defense/guard', 'Zoltraak Pierce/zoltraak', 'Zoltraak Array/zoltraak'],
      ['Judgment Light: Catastravia/zoltraak', 'Binding Magic/tether', 'Catastravia: Judgment Light/nova'],
      ['Vollzanbel Fire Magic/flame', 'Layered Defense/guard', 'Vollzanbel Flame Wave/flame'],
      ['Zoltraak Crossfire/zoltraak', 'Hexagonal Ward/guard', 'Grand Zoltraak Barrage/zoltraak']
    ]
  };

  const variations = {
    repulsor: 'beam', unibeam: 'beam', missile: 'volley', ironArmor: 'satellite', doomBots: 'satellite',
    shieldThrow: 'ricochet', hammerThrow: 'ricochet', crescent: 'ricochet', frost: 'volley',
    powerStone: 'shock', timeStone: 'gravity', hexBolt: 'volley', photon: 'beam', cosmicRay: 'beam',
    blue: 'gravity', red: 'shock', purple: 'volley', void: 'gravity', shrine: 'moonClaws',
    cursedSlash: 'beam', illusion: 'clone', ninjaClone: 'clone', chakraBomb: 'volley',
    rasenshuriken: 'volley', elasticFlurry: 'dawnFists', hellChain: 'tether', penance: 'chaos',
    thunderSpears: 'volley', airCannon: 'shock', smallLight: 'beam', door: 'portal',
    zoltraak: 'beam', kinetic: 'guard', metalShards: 'volley', widowBite: 'beam',
    warHammer: 'stomp', copter: 'kick'
  };

  const close = new Set(['punch', 'stomp', 'bodyRush', 'grapple', 'claws', 'sword', 'shieldBash',
    'hammer', 'kick', 'webKick', 'rasengan', 'odm', 'baton', 'boardRush', 'warHammer', 'copter']);

  function get(id, form, slot) {
    const index = slot === 'ultimate' ? 2 : slot === 'skill2' ? 1 : 0;
    const entry = kits[id]?.[form]?.[index];
    if (!entry) return null;
    const [name, technique] = entry.split('/');
    return { name, technique, action: variations[technique] || technique, contact: close.has(technique) };
  }

  return { get };
})();
