'use strict';

const FighterPortraits = (() => {
  const ink = '#121522';
  const paths = new Map();

  function shape(ctx, outline, fill, stroke = ink, weight = 0.054) {
    if (!paths.has(outline)) paths.set(outline, new Path2D(outline));
    const path = paths.get(outline);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill(path);
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = weight;
      ctx.stroke(path);
    }
  }

  function oval(ctx, x, y, rx, ry, fill, stroke = null) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = 0.045;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function collar(ctx, cloth, light, lining = ink) {
    shape(ctx, 'M-.97 .78 Q-.91 .28 -.49 .24 L.49 .24 Q.91 .28 .97 .78 Q.29 1.03 0 .89 Q-.35 1.02 -.97 .78Z', cloth);
    shape(ctx, 'M-.8 .73 Q-.63 .44 -.41 .36 L-.13 .83 Q-.45 .87 -.8 .73Z M.8 .73 Q.63 .44 .41 .36 L.13 .83 Q.45 .87 .8 .73Z', light, null);
    shape(ctx, 'M-.47 .39 L0 .66 L.47 .39 L.32 .79 L0 .92 L-.32 .79Z', lining);
  }

  function cape(ctx, color, light, wind) {
    ctx.save();
    ctx.translate(-.31, .40);
    ctx.rotate(wind);
    shape(ctx, 'M.32 -.09 Q-.04 -.249 -.39 -.156 Q-.77 .005 -1.11 -.19 Q-1.02 .015 -1.274 .34 Q-1.03 .6 -.78 .496 Q-.62 .38 -.465 .495 Q-.25 .57 .175 .362Z', color);
    shape(ctx, 'M-1.095 .34 Q-.88 .408 -.743 .302 Q-.568 .177 -.365 .213 L.097 .074 M-.941 .058 Q-.669 .028 -.507 -.024', null, light, .044);
    ctx.restore();
  }

  function ears(ctx, skin, shade, pointy) {
    const edge = pointy
      ? 'M-.54 -.14 Q-.83 -.27 -1.05 -.36 Q-.91 .15 -.55 .26Z M.54 -.14 Q.83 -.27 1.05 -.36 Q.91 .15 .55 .26Z'
      : 'M-.55 -.18 C-.92 -.28 -.88 .29 -.54 .33Z M.55 -.18 C.92 -.28 .88 .29 .54 .33Z';
    shape(ctx, edge, skin);
    shape(ctx, 'M-.77 -.06 Q-.67 -.08 -.63 .14 M.77 -.06 Q.67 -.08 .63 .14', null, shade, 0.045);
  }

  function face(ctx, skin, shade, { pointy = false, broad = false } = {}) {
    ears(ctx, skin, shade, pointy);
    const outline = broad
      ? 'M-.72 -.4 Q-.65 -.79 0 -.79 Q.65 -.79 .72 -.4 L.66 .28 Q.59 .65 0 .71 Q-.59 .65 -.66 .28Z'
      : 'M-.67 -.44 Q-.58 -.8 0 -.8 Q.58 -.8 .67 -.44 L.61 .24 Q.51 .59 0 .68 Q-.51 .59 -.61 .24Z';
    shape(ctx, outline, skin);
    shape(ctx, 'M.57 -.38 L.60 .18 Q.51 .54 .11 .61 Q.34 .42 .32 .29 Q.53 .15 .57 -.38Z', shade, null);
    shape(ctx, 'M-.041 .04 L-.085 .23 Q-.016 .26 .047 .22', null, shade, 0.047);
  }

  function eyes(ctx, color, pose, type = 'sharp') {
    const blink = pose === 'hit';
    for (const sign of [-1, 1]) {
      ctx.save();
      ctx.scale(sign, 1);
      if (blink) {
        shape(ctx, 'M.12 .035 L.34 -.025 L.49 .06', null, ink);
      } else {
        const open = type === 'round'
          ? 'M.12 .04 Q.16 -.21 .32 -.2 Q.48 -.2 .49 .015 Q.44 .18 .3 .18 Q.18 .18 .12 .04Z'
          : 'M.105 -.016 Q.29 -.11 .5 -.14 Q.45 .17 .26 .145 Q.15 .13 .105 -.016Z';
        shape(ctx, open, '#fff9f1', ink, 0.043);
        oval(ctx, .291, type === 'round' ? -.01 : .038, .072, .091, color);
        oval(ctx, .286, .025, .037, .056, ink);
        oval(ctx, .267, -.018, .024, .024, '#fffef4');
        if (type !== 'round') {
          const brow = pose === 'charge' ? 'M.115 -.11 L.465 -.26' : 'M.12 -.108 L.465 -.23';
          shape(ctx, brow, null, ink, .066);
        }
      }
      ctx.restore();
    }
  }

  function mouth(ctx, type, pose, shade) {
    if (pose === 'hit') {
      oval(ctx, 0, .41, .11, .077, ink);
    } else if (type === 'grin') {
      shape(ctx, 'M-.33 .31 Q-.03 .41 .33 .28 Q.23 .55 -.03 .55 Q-.26 .53 -.33 .31Z', ink);
      shape(ctx, 'M-.278 .343 Q-.02 .42 .267 .324 L.185 .432 Q-.044 .489 -.224 .434Z', '#fff6e8', null);
    } else {
      const path = pose === 'attack' ? 'M-.165 .403 L.134 .346' : 'M-.125 .397 Q-.01 .354 .13 .385';
      shape(ctx, path, null, shade, .05);
    }
  }

  function pupilsAndMouth(ctx, color, pose, expression, shade = '#80454f') {
    eyes(ctx, color, pose, expression === 'grin' ? 'round' : 'sharp');
    mouth(ctx, expression, pose, shade);
  }

  const marvel = MarvelPortraits.create({ shape, oval, collar, cape, face, eyes, mouth, pupilsAndMouth });
  const finalArt = FinalPortraits.create({ shape, oval, collar, face, eyes, mouth });

  const legacyGear = {
    gojo: ['M-.56 -.692 L-.906 -.995 L-1.131 -1.015 L-.851 -.55 M.56 -.692 L.906 -.995 L1.131 -1.015 L.851 -.55', 'M-.1 -.802 L0 -.979 L.1 -.802 L0 -.673Z'],
    sukuna: ['M-.52 .383 L-.862 .17 L-.964 .458 L-1.114 .639 L-.597 .722 M.52 .383 L.862 .17 L.964 .458 L1.114 .639 L.597 .722', 'M-.16 -.448 L0 -.59 L.16 -.448 L0 -.342Z'],
    naruto: ['M-.62 -.381 L-.933 -.671 L-.94 -1.13 L-.646 -.869 L-.474 -.855 M.62 -.381 L.933 -.671 L.94 -1.13 L.646 -.869 L.474 -.855', 'M-.21 .71 Q-.085 .508 .025 .695 Q.191 .64 .191 .781 Q.079 .91 -.21 .71Z'],
    luffy: ['M-.77 .356 Q-1.075 .198 -1.139 .431 Q-1.307 .466 -1.204 .618 Q-1.13 .878 -.862 .699 L-.572 .677 M.77 .356 Q1.075 .198 1.139 .431 Q1.307 .466 1.204 .618 Q1.13 .878 .862 .699 L.572 .677', 'M-.163 .738 Q-.1 .607 0 .738 Q.12 .617 .181 .745 Q.088 .861 0 .801 Q-.115 .864 -.163 .738Z'],
    eren: ['M-.561 .027 L-.877 -.094 L-1.019 .272 L-.909 .434 L-.749 .254 L-.536 .344 M.561 .027 L.877 -.094 L1.019 .272 L.909 .434 L.749 .254 L.536 .344', 'M-.25 .746 L0 .653 L.25 .746 L.162 .839 L0 .796 L-.162 .839Z'],
    levi: ['M-.421 .49 L-.918 -.503 L-1.127 -.72 L-.993 -.235 L-.605 .672 M.421 .49 L.918 -.503 L1.127 -.72 L.993 -.235 L.605 .672', 'M-.26 .738 L-.096 .661 L0 .754 L.096 .661 L.26 .738 L.094 .852 L0 .797 L-.094 .852Z'],
    doraemon: ['M-.752 -.306 L-1.074 -.302 L-1.15 -.105 L-.963 .102 L-.74 .093 M.752 -.306 L1.074 -.302 L1.15 -.105 L.963 .102 L.74 .093', 'M-.144 -.663 L0 -.746 L.144 -.663 L0 -.575Z'],
    frieren: ['M-.592 .446 Q-.966 .175 -.981 -.247 Q-.736 -.356 -.651 -.594 Q-.629 -.365 -.616 -.193 M.592 .446 Q.966 .175 .981 -.247 Q.736 -.356 .651 -.594 Q.629 -.365 .616 -.193', 'M-.106 -.425 L0 -.609 L.106 -.425 L0 -.307Z'],
    thor: ['M-.52 -.695 L-.832 -.977 L-1.217 -.911 L-.966 -.735 L-1.246 -.643 L-.807 -.553 M.52 -.695 L.832 -.977 L1.217 -.911 L.966 -.735 L1.246 -.643 L.807 -.553', 'M-.112 -.77 L.036 -1.016 L0 -.848 L.123 -.917 L-.028 -.653 L.009 -.817Z'],
    captain_america: ['M-.48 .463 L-.978 .234 L-1.179 .138 L-1.105 .447 L-.895 .636 L-.596 .725 M.48 .463 L.978 .234 L1.179 .138 L1.105 .447 L.895 .636 L.596 .725', 'M0 .632 L.063 .741 L.2 .752 L.103 .837 L.134 .957 L0 .89 L-.134 .957 L-.103 .837 L-.2 .752 L-.063 .741Z'],
    ironman: ['M-.494 .221 L-.942 .146 L-1.26 -.535 L-1.3 -.118 L-.989 .583 L-.59 .684 M.494 .221 L.942 .146 L1.26 -.535 L1.3 -.118 L.989 .583 L.59 .684', 'M-.148 .622 L.148 .622 L.198 .758 L0 .887 L-.198 .758Z'],
    hulk: ['M-.48 .334 L-.932 .061 L-1.128 .224 L-1.165 .524 L-.951 .794 L-.634 .764 M.48 .334 L.932 .061 L1.128 .224 L1.165 .524 L.951 .794 L.634 .764', 'M-.367 .688 L-.194 .586 L-.107 .772 L.015 .659 L.163 .826 L.369 .702']
  };

  function frame(ctx, id, style) {
    const { form, color, compact, time = 0 } = style;
    if (form < 2 || compact) return;
    const gear = legacyGear[id];
    ctx.save();
    if (gear) {
      if (form >= 3) shape(ctx, gear[0], '#2d304a', color, .039);
      else {
        ctx.scale(.85, .89);
        shape(ctx, gear[0], '#323345', color, .034);
        ctx.scale(1 / .85, 1 / .89);
      }
    }
    if (form >= 3) {
      const reach = 1.05 + form * .083;
      ctx.globalAlpha *= form === 4 ? .78 : .40;
      ctx.strokeStyle = color;
      ctx.lineWidth = form === 4 ? .054 : .036;
      for (const sign of [-1, 1]) {
        ctx.beginPath();
        const spin = time * .85 + sign * 1.54;
        ctx.ellipse(0, -.134, reach, reach * (form === 4 ? 1 : .87), .21, spin, spin + 1.53);
        ctx.stroke();
      }
      if (form === 4) {
        for (let i = 0; i < 5; i++) {
          const angle = time * .95 + i * Math.PI * .4;
          const x = Math.cos(angle) * (reach + .12);
          const y = Math.sin(angle) * (reach + .10) - .134;
          oval(ctx, x, y, .047, .047, color);
        }
      }
    }
    ctx.restore();
  }

  function crest(ctx, id, style) {
    if (style.form < 1 || !legacyGear[id]) return;
    ctx.save();
    ctx.globalAlpha *= .28 + style.form * .15;
    if (id === 'hulk') shape(ctx, legacyGear[id][1], null, style.color, .042);
    else shape(ctx, legacyGear[id][1], style.color, '#24223d', .023);
    ctx.restore();
  }

  const drawings = {
    gojo(ctx, { form, pose, color }) {
      collar(ctx, form >= 3 ? '#362a64' : '#252743', form === 4 ? '#7f70b0' : '#384973', '#172131');
      face(ctx, '#f6d7c2', '#b07e95');
      shape(ctx, 'M-.6 -.01 L-.72 -.45 L-.95 -.66 L-.67 -.7 L-.78 -1.08 L-.44 -.96 L-.4 -1.32 L-.11 -1.04 L.08 -1.4 L.28 -1.07 L.68 -1.25 L.58 -.94 L.96 -.95 L.74 -.66 L.66 -.22 L.47 -.49 L.23 -.22 L.25 -.56 L-.1 -.26 L-.08 -.56 L-.44 -.31 L-.4 -.58Z', form >= 3 ? '#daceff' : '#edf5ff');
      shape(ctx, 'M-.68 -.66 L-.49 -.72 L-.42 -.97 L-.23 -.72 L-.041 -.96 L.12 -.74 L.42 -1.02 L.3 -.665 L.65 -.83 L.44 -.55 L.27 -.38 L.28 -.6 L.001 -.38 L.033 -.62 L-.33 -.4 L-.28 -.67 L-.56 -.38Z', form >= 3 ? '#a28bef' : '#a9c8e9', null);
      if (form === 0) {
        shape(ctx, 'M-.67 -.25 Q-.13 -.17 .66 -.28 L.62 .125 Q-.01 .24 -.625 .11Z', '#20233a');
        shape(ctx, 'M-.51 -.129 Q-.03 -.049 .52 -.165', null, '#61759d', .048);
      } else {
        eyes(ctx, color, pose);
        shape(ctx, 'M-.55 .23 L-.39 .273 M.55 .23 L.39 .273', null, color, .044);
      }
      mouth(ctx, 'calm', pose, '#8d586e');
    },
    sukuna(ctx, { form, pose, color }) {
      collar(ctx, form >= 2 ? '#703948' : '#52243c', form === 4 ? '#d67983' : '#a75362', '#251e2c');
      face(ctx, '#f5bd9d', '#b66c6e', { broad: true });
      shape(ctx, 'M-.63 -.19 L-.76 -.5 L-.96 -.68 L-.69 -.74 L-.65 -1.08 L-.43 -.92 L-.26 -1.28 L-.06 -.95 L.19 -1.32 L.27 -.96 L.62 -1.12 L.57 -.852 L.88 -.905 L.76 -.48 L.65 -.18 L.43 -.53 L.14 -.49 L.27 -.69 L-.071 -.52 L-.34 -.59 L-.45 -.32Z', form >= 3 ? '#ffbdcf' : '#f47d94');
      shape(ctx, 'M-.67 -.54 L-.6 -.75 L-.37 -.675 L-.24 -.95 L-.08 -.73 L.18 -.96 L.23 -.74 L.56 -.87 L.52 -.666 L.71 -.7 L.63 -.425 L.45 -.59 L.2 -.59 L.28 -.74 L-.1 -.62 L-.38 -.69 L-.48 -.53Z', '#ab3a68', null);
      pupilsAndMouth(ctx, color, pose, 'sharp');
      shape(ctx, 'M-.13 -.43 L0 -.489 L.13 -.43 M0 -.47 L0 -.278 M-.5 .08 L-.56 .23 L-.41 .33 M.5 .08 L.56 .23 L.41 .33 M-.18 .51 L-.12 .606 M.18 .51 L.12 .606', null, '#502138', .071);
      if (form) shape(ctx, 'M-.62 -.34 L-.35 -.277 M.62 -.34 L.35 -.277', null, color, .055);
    },
    naruto(ctx, { form, pose, color }) {
      collar(ctx, form >= 3 ? '#8e4b4b' : '#302b38', form === 4 ? '#ffe795' : '#ff9047', '#4b3038');
      face(ctx, '#f8c69a', '#c98b67');
      shape(ctx, 'M-.65 -.136 L-.82 -.431 L-.95 -.586 L-.71 -.593 L-.885 -.856 L-.51 -.836 L-.619 -1.151 L-.343 -1.033 L-.207 -1.284 L-.036 -1.028 L.241 -1.306 L.315 -1.029 L.641 -1.143 L.598 -.863 L.894 -.984 L.762 -.638 L.667 -.15 L.47 -.55 L-.482 -.535Z', form ? '#ffda7d' : '#f6c446');
      shape(ctx, 'M-.59 -.706 L-.47 -.719 L-.5 -.931 L-.3 -.822 L-.18 -1.032 L-.02 -.797 L.233 -1.061 L.248 -.839 L.472 -.956 L.436 -.765 L.64 -.842 L.525 -.613 L-.51 -.53Z', '#ffe987', null);
      shape(ctx, 'M-.68 -.55 Q0 -.755 .68 -.55 L.63 -.289 Q0 -.375 -.63 -.29Z', form >= 3 ? '#88394d' : '#27314c');
      shape(ctx, 'M-.32 -.566 Q0 -.625 .32 -.566 L.305 -.364 Q0 -.405 -.305 -.364Z', '#b9c8da', '#343949', .047);
      shape(ctx, 'M-.133 -.465 Q-.055 -.581 .041 -.501 Q.11 -.438 .01 -.432 Q-.04 -.43 -.018 -.474 L.122 -.47 L.172 -.54', null, '#3b4a62', .039);
      eyes(ctx, form ? color : '#3798dd', pose);
      mouth(ctx, 'calm', pose, '#8d4f4b');
      shape(ctx, 'M-.51 .133 L-.35 .2 M-.535 .236 L-.365 .278 M-.46 .339 L-.34 .359 M.51 .133 L.35 .2 M.535 .236 L.365 .278 M.46 .339 L.34 .359', null, form ? '#923f39' : '#80505a', .049);
    },
    luffy(ctx, { form, pose, color }) {
      collar(ctx, form >= 3 ? '#e0dcf7' : '#9b273e', form >= 3 ? '#fbf4ff' : '#df5062', '#612e50');
      face(ctx, '#f5bb91', '#bb766a', { broad: form === 2 });
      if (form >= 3) {
        shape(ctx, 'M-.67 -.15 Q-.87 -.19 -.88 -.43 Q-1.02 -.53 -.89 -.77 Q-.87 -.96 -.65 -.965 Q-.637 -1.22 -.36 -1.16 Q-.25 -1.445 .005 -1.244 Q.208 -1.47 .415 -1.221 Q.645 -1.295 .707 -1.07 Q1.03 -1.06 .905 -.768 Q1.078 -.513 .849 -.418 Q.864 -.217 .643 -.208 L.526 -.486 Q.38 -.692 .243 -.47 Q.125 -.39 .014 -.524 Q-.18 -.423 -.291 -.548 Q-.47 -.387 -.583 -.476Z', '#fff8ef');
        shape(ctx, 'M-.789 -.642 Q-.569 -.556 -.479 -.794 Q-.408 -.607 -.19 -.724 Q-.211 -.889 -.085 -.954 Q.03 -.966 .098 -.868 M.356 -.961 Q.448 -.831 .675 -.882 Q.737 -.647 .815 -.698', null, '#b9afe3', .062);
      } else {
        shape(ctx, 'M-.655 -.133 L-.778 -.505 L-.647 -.815 L.645 -.815 L.775 -.489 L.649 -.114 L.493 -.342 L.464 -.51 L.317 -.344 L.297 -.554 L.061 -.329 L.122 -.592 L-.169 -.381 L-.125 -.567 L-.418 -.413 L-.47 -.522Z', '#272233');
        shape(ctx, 'M-.64 -.66 Q-.65 -1.17 -.18 -1.209 Q.405 -1.314 .612 -.834 L.651 -.636Z', '#e3a850');
        shape(ctx, 'M-.57 -.783 Q-.42 -1.095 .15 -1.135 Q-.31 -1.175 -.49 -.959Z', '#ffdf7f', null);
        shape(ctx, 'M-.646 -.79 Q.028 -.894 .62 -.797 L.656 -.631 Q.013 -.722 -.659 -.62Z', form ? '#81324c' : '#bc3d52');
        shape(ctx, 'M-1.017 -.638 Q-.84 -.819 .018 -.777 Q.836 -.802 1.027 -.662 Q1.168 -.537 .725 -.502 Q.006 -.588 -.724 -.46 Q-1.145 -.5 -1.017 -.638Z', '#f4c962');
        shape(ctx, 'M-.868 -.606 Q-.43 -.729 -.031 -.69 Q.478 -.726 .871 -.625', null, '#a66a3d', .048);
      }
      eyes(ctx, form === 0 ? '#513125' : color, pose, form === 2 ? 'sharp' : 'round');
      mouth(ctx, 'grin', pose, '#8a444b');
      shape(ctx, 'M.236 .216 L.514 .177 M.315 .17 L.334 .244 M.433 .145 L.455 .217', null, '#934952', .042);
      if (form === 2) shape(ctx, 'M-.66 .33 Q-.377 .73 -.126 .637 M.66 .33 Q.377 .73 .126 .637', null, '#963a51', .057);
    },
    eren(ctx, { form, pose, wind, color }) {
      cape(ctx, '#244d47', '#6ea58a', wind);
      collar(ctx, '#325950', '#6e9a72', '#30473c');
      shape(ctx, 'M-.79 .51 L-.82 -.481 Q-.747 -.998 -.35 -1.122 Q.034 -1.258 .56 -.986 Q.835 -.766 .811 -.068 L.825 .495 L.509 .227 L-.538 .309Z', '#382b34');
      face(ctx, form >= 3 ? '#efd0ae' : '#ecc6a5', '#ab786e');
      shape(ctx, 'M-.707 .48 Q-.833 .025 -.752 -.581 Q-.674 -1.137 -.162 -1.165 Q.403 -1.298 .703 -.855 L.75 -.579 Q.57 -.73 .403 -.792 L.517 -.534 L.333 -.692 Q.233 -.544 .016 -.417 L.069 -.683 Q-.25 -.533 -.43 -.222 L-.385 -.59 Q-.577 -.405 -.594 -.104 L-.569 .409Z', '#4c3540');
      shape(ctx, 'M-.618 -.576 Q-.44 -.944 .033 -1.039 Q-.079 -.918 -.126 -.812 M.212 -1.04 Q.403 -.961 .55 -.774', null, '#8b6264', .055);
      pupilsAndMouth(ctx, color, pose, 'sharp');
      if (form) shape(ctx, 'M-.136 .141 L-.278 .389 L-.444 .421 M.136 .141 L.278 .389 L.444 .421', null, form >= 3 ? '#7a415d' : '#99696c', .045);
    },
    levi(ctx, { form, pose, color }) {
      collar(ctx, '#403848', '#776562', '#393a4d');
      face(ctx, '#eed1ba', '#aa7f82');
      shape(ctx, 'M-.68 .25 L-.784 -.265 Q-.92 -.581 -.618 -.828 Q-.423 -1.12 -.021 -1.132 Q.313 -1.256 .554 -.981 Q.849 -.731 .71 -.217 L.532 -.012 L.522 -.433 L.33 -.697 L.394 -.401 L.035 -.63 L.072 -.409 L-.118 -.562 L-.424 -.224 L-.42 -.58 L-.608 -.275Z', form >= 3 ? '#405063' : '#292b3b');
      shape(ctx, 'M-.532 -.76 Q-.311 -1.025 .069 -1.017 L-.1 -.957 L-.259 -.691 M.255 -1.017 Q.541 -.9 .602 -.605', null, '#626b7f', .06);
      pupilsAndMouth(ctx, form ? color : '#587e93', pose, 'sharp');
      shape(ctx, 'M-.35 .607 L-.115 .664 L.036 .609 L.234 .646 L.106 .848 L-.296 .776Z', '#e8e1cb');
      shape(ctx, 'M-.09 .654 L-.03 .719 L.105 .626', null, '#d7d7bd', .062);
    },
    doraemon(ctx, { form, pose, color }) {
      shape(ctx, 'M0 -1.132 C.56 -1.132 .91 -.753 .91 -.227 C.91 .37 .533 .865 0 .865 C-.533 .865 -.91 .37 -.91 -.227 C-.91 -.753 -.56 -1.132 0 -1.132Z', form >= 3 ? '#355edb' : '#1683cb');
      shape(ctx, 'M-.77 -.357 Q-.628 -.971 -.016 -1.025 Q-.452 -.847 -.579 -.456Z', '#70d4ed', null);
      shape(ctx, 'M0 -.646 C.523 -.802 .786 -.461 .748 -.05 Q.691 .625 0 .717 Q-.691 .625 -.748 -.05 C-.786 -.461 -.523 -.802 0 -.646Z', '#fff7e8');
      oval(ctx, -.184, -.385, .182, pose === 'hit' ? .073 : .229, '#fffdf9', ink);
      oval(ctx, .184, -.385, .182, pose === 'hit' ? .073 : .229, '#fffdf9', ink);
      oval(ctx, -.103, -.348, .063, .082, form ? color : ink);
      oval(ctx, .103, -.348, .063, .082, form ? color : ink);
      shape(ctx, 'M0 -.105 L0 .395 M-.442 .237 Q0 .609 .442 .237 M-.477 -.015 L-.686 -.08 M-.465 .1 L-.702 .129 M.477 -.015 L.686 -.08 M.465 .1 L.702 .129', null, '#323548', .049);
      oval(ctx, 0, -.138, .137, .126, '#e44756', ink);
      oval(ctx, -.04, -.171, .041, .036, '#ffbeb2');
      shape(ctx, 'M-.543 .617 Q0 .742 .543 .617 L.465 .752 Q0 .91 -.465 .752Z', '#c13950');
      oval(ctx, 0, .782, .137, .14, '#ffd768', ink);
      shape(ctx, 'M-.113 .75 L.113 .75 M0 .8 L0 .898', null, '#885339', .038);
    },
    frieren(ctx, { form, pose, wind, color }) {
      cape(ctx, form >= 3 ? '#7971b2' : '#beb594', '#f7efda', wind);
      collar(ctx, '#e9e4d6', '#fff5e5', '#755e69');
      shape(ctx, 'M-.677 -.564 Q-.458 -1.19 -.015 -1.155 Q.524 -1.229 .717 -.576 Q.632 -.178 .841 .669 L.591 .54 L.485 .741 L.374 .41 L-.372 .41 L-.502 .738 L-.59 .54 L-.849 .671 Q-.612 -.123 -.677 -.564Z', form >= 3 ? '#d6d0f5' : '#f0ebed');
      face(ctx, '#f8dacf', '#bd8d97', { pointy: true });
      shape(ctx, 'M-.671 -.285 L-.697 -.627 Q-.523 -1.086 -.054 -1.156 Q.512 -1.159 .696 -.679 L.644 -.278 Q.502 -.471 .332 -.619 L.426 -.289 Q.152 -.366 .03 -.642 Q-.017 -.437 -.163 -.294 L-.28 -.583 L-.4 -.299 L-.488 -.575Z', form >= 3 ? '#eee5ff' : '#f7f0ef');
      shape(ctx, 'M-.561 -.692 Q-.433 -.915 -.151 -.969 L-.377 -.691 M.13 -.991 Q.357 -.925 .481 -.745', null, '#beb2cc', .063);
      pupilsAndMouth(ctx, color, pose, 'sharp', '#ae7689');
      for (const sign of [-1, 1]) {
        oval(ctx, sign * .688, .126, .05, .084, '#d99072', '#8d5062');
        oval(ctx, sign * .688, .193, .035, .053, '#f9c790');
      }
    },
    thor(ctx, { form, pose, wind, color }) {
      cape(ctx, '#aa3558', '#ec7c87', wind);
      collar(ctx, '#3e4a61', '#768798', '#262c44');
      shape(ctx, 'M-.72 -.656 Q0 -1.261 .72 -.656 L.851 .65 L.633 .557 L.461 .759 L.31 .422 L-.31 .422 L-.461 .759 L-.633 .557 L-.851 .65Z', form >= 3 ? '#ffebbf' : '#d99852');
      face(ctx, '#f0c6a0', '#b07773', { broad: true });
      shape(ctx, 'M-.56 .213 L-.364 .319 L-.257 .561 L-.119 .504 L.011 .57 L.139 .498 L.265 .524 L.396 .318 L.56 .213 L.519 .57 Q.336 .823 .029 .786 Q-.322 .825 -.546 .574Z', '#be783e');
      shape(ctx, 'M-.681 -.123 L-.756 -.641 Q-.584 -.95 0 -1.13 Q.584 -.95 .756 -.641 L.681 -.123 L.439 -.436 Q.007 -.582 -.44 -.436Z', '#7d95ae');
      shape(ctx, 'M-.508 -.503 L-.627 -.135 L-.758 -.435 L-1.009 -.895 L-.696 -.758 L-.8 -1.167 L-.521 -.931 L-.358 -.709Z M.508 -.503 L.627 -.135 L.758 -.435 L1.009 -.895 L.696 -.758 L.8 -1.167 L.521 -.931 L.358 -.709Z', '#e2edee');
      shape(ctx, 'M-.206 -.81 L0 -1.021 L.206 -.81 L0 -.56Z', form ? color : '#bce2e0');
      pupilsAndMouth(ctx, color, pose, 'sharp');
    },
    captain_america(ctx, { form, pose, color }) {
      collar(ctx, '#27385f', '#486ba5', '#223851');
      shape(ctx, 'M-.745 -.366 Q-.732 -1.027 0 -1.112 Q.732 -1.027 .745 -.366 L.677 .301 L.391 .55 L-.391 .55 L-.677 .301Z', form >= 3 ? '#456db1' : '#31528b');
      shape(ctx, 'M-.538 -.499 L-.572 -.697 Q-.413 -.962 -.056 -.995 L-.273 -.797Z', '#6397ce', null);
      shape(ctx, 'M-.526 .196 L-.294 .084 L.294 .084 L.526 .196 L.463 .427 Q.327 .676 0 .698 Q-.327 .676 -.463 .427Z', '#edc5a4');
      eyes(ctx, '#386c98', pose);
      mouth(ctx, 'calm', pose, '#995a62');
      shape(ctx, 'M-.148 -.531 L0 -.855 L.148 -.531 M-.088 -.653 L.088 -.653', null, form ? color : '#f2f7f4', .071);
      shape(ctx, 'M-.71 -.333 L-.944 -.526 L-.878 -.239 L-.708 -.118 M.71 -.333 L.944 -.526 L.878 -.239 L.708 -.118', '#e7edf0');
      shape(ctx, 'M0 .679 L.05 .765 L.15 .779 L.08 .845 L.1 .936 L0 .886 L-.1 .936 L-.08 .845 L-.15 .779 L-.05 .765Z', '#f3ece7', null);
    },
    ironman(ctx, { form, pose, color }) {
      collar(ctx, '#632a41', '#bd4d56', '#412a43');
      shape(ctx, 'M-.819 -.418 L-.646 -.862 L-.269 -1.076 L.269 -1.076 L.646 -.862 L.819 -.418 L.692 .344 L.427 .629 Q0 .809 -.427 .629 L-.692 .344Z', ['#ad344d', '#c94252', '#aa5164', '#d95b55', '#8c75b0'][form]);
      shape(ctx, 'M-.696 -.394 L-.611 -.741 L-.318 -.916 L-.19 -.617 L.19 -.617 L.318 -.916 L.611 -.741 L.696 -.394 L.575 .174 L.4 .275 L.345 .499 L.162 .647 L-.162 .647 L-.345 .499 L-.4 .275 L-.575 .174Z', ['#efb967', '#ffd08a', '#e8dcab', '#ffe2a0', '#fff0b7'][form]);
      shape(ctx, 'M-.603 -.435 L-.458 -.654 L-.288 -.709 L-.2 -.604 L-.473 -.467 L-.538 -.082 L-.403 .081 L-.433 .225 L-.578 .135Z M.603 -.435 L.458 -.654 L.288 -.709 L.2 -.604 L.473 -.467 L.538 -.082 L.403 .081 L.433 .225 L.578 .135Z', '#c78152', null);
      shape(ctx, 'M-.496 -.176 L-.108 -.107 L-.199 .005 L-.469 -.059Z M.496 -.176 L.108 -.107 L.199 .005 L.469 -.059Z', pose === 'hit' ? '#f09977' : '#e5fbff', '#402f4d', .054);
      shape(ctx, 'M-.315 .34 L-.187 .267 L.187 .267 L.315 .34 L.227 .393 L-.227 .393Z', '#814858');
      oval(ctx, 0, .793, .093, .063, color);
    },
    hulk(ctx, { form, pose, color }) {
      collar(ctx, form >= 2 ? '#55495d' : '#463552', form >= 2 ? '#a48562' : '#705480', '#4a3a5e');
      face(ctx, form >= 3 ? '#a5d37d' : '#91b36f', '#597b55', { broad: true });
      shape(ctx, 'M-.717 -.052 L-.849 -.272 L-.824 -.66 L-.74 -.874 L-.593 -.823 L-.468 -1.056 L-.353 -.97 L-.105 -1.157 L.001 -.981 L.186 -1.11 L.286 -.979 L.603 -1.022 L.522 -.9 L.785 -.925 L.842 -.622 L.771 -.181 L.544 -.316 L.579 -.516 L.284 -.589 L.106 -.404 L-.017 -.552 L-.286 -.446 L-.256 -.578 L-.541 -.41 L-.647 -.125Z', '#293c3f');
      shape(ctx, 'M-.701 -.584 L-.56 -.713 L-.503 -.849 L-.395 -.757 L-.134 -.963 L-.074 -.817 L.103 -.93 L.23 -.815 L.466 -.859 L.524 -.763 L.688 -.799', null, '#4f6658', .074);
      eyes(ctx, color, pose);
      shape(ctx, 'M-.396 .447 Q-.075 .243 .396 .417 L.301 .567 L-.28 .569Z', '#2d353a');
      shape(ctx, 'M-.303 .449 Q-.043 .332 .302 .428 L.261 .499 L-.248 .503Z', '#fff4d7', null);
      shape(ctx, 'M-.559 .146 L-.47 .205 L-.56 .265 M.559 .146 L.47 .205 L.56 .265', null, '#607545', .065);
    }
  };

  function draw(ctx, id, x, y, radius, style) {
    const portrait = drawings[id] || marvel[id];
    if (!portrait) return false;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(radius, radius);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (style.form === 4) finalArt.paintBehind(ctx, id, style);
    else frame(ctx, id, style);
    if (!finalArt.drawBody(ctx, id, style)) portrait(ctx, style);
    if (style.form === 4) finalArt.paintCrest(ctx, id, style);
    else crest(ctx, id, style);
    ctx.restore();
    return true;
  }

  return { draw };
})();
