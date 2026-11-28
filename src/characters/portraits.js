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

  const formArt = FormPortraits.create({ shape, oval });

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
      if (form === 4) {
        shape(ctx,'M-.59-.27Q-.91-.70-.83-1.22Q-.58-.94-.36-.74L-.27-.45Z M.59-.27Q.91-.70.83-1.22Q.58-.94.36-.74L.27-.45Z','#ef9659','#5f2d39',.046);
        shape(ctx,'M-.65-.46L-.76-.89L-.48-.59 M.65-.46L.76-.89L.48-.59',null,'#ffcb84',.055);
      } else {
        shape(ctx, 'M-.68 -.55 Q0 -.755 .68 -.55 L.63 -.289 Q0 -.375 -.63 -.29Z', form >= 3 ? '#88394d' : '#27314c');
        shape(ctx, 'M-.32 -.566 Q0 -.625 .32 -.566 L.305 -.364 Q0 -.405 -.305 -.364Z', '#b9c8da', '#343949', .047);
        shape(ctx, 'M-.133 -.465 Q-.055 -.581 .041 -.501 Q.11 -.438 .01 -.432 Q-.04 -.43 -.018 -.474 L.122 -.47 L.172 -.54', null, '#3b4a62', .039);
      }
      eyes(ctx, form ? color : '#3798dd', pose);
      mouth(ctx, 'calm', pose, '#8d4f4b');
      shape(ctx, 'M-.51 .133 L-.35 .2 M-.535 .236 L-.365 .278 M-.46 .339 L-.34 .359 M.51 .133 L.35 .2 M.535 .236 L.365 .278 M.46 .339 L.34 .359', null, form ? '#923f39' : '#80505a', .049);
    },
    luffy(ctx, { form, pose, color }) {
      collar(ctx, form === 3 ? '#4b273e' : '#9b273e', form === 3 ? '#c76e78' : '#df5062', '#612e50');
      face(ctx, form === 1 ? '#f9af93' : '#f5bb91', '#bb766a', { broad: form === 3 });
      if (form === 3) {
        shape(ctx,'M-.68-.10L-.79-.48L-1.02-.69L-.73-.76L-.92-1.08L-.55-1.00L-.46-1.29L-.22-1.10L.02-1.36L.26-1.10L.61-1.24L.57-.99L.94-.96L.80-.67L.70-.19L.53-.48L.28-.35L.28-.59L.03-.42L-.12-.60L-.35-.41L-.43-.64Z','#2c2137');
        shape(ctx,'M-.71-.72L-.49-.81L-.42-.98L-.26-.82L.03-1.12L.18-.89L.46-.99L.36-.77L.70-.83L.53-.61',null,'#64475e',.055);
      } else {
        shape(ctx, 'M-.655 -.133 L-.778 -.505 L-.647 -.815 L.645 -.815 L.775 -.489 L.649 -.114 L.493 -.342 L.464 -.51 L.317 -.344 L.297 -.554 L.061 -.329 L.122 -.592 L-.169 -.381 L-.125 -.567 L-.418 -.413 L-.47 -.522Z', '#272233');
        shape(ctx, 'M-.64 -.66 Q-.65 -1.17 -.18 -1.209 Q.405 -1.314 .612 -.834 L.651 -.636Z', '#e3a850');
        shape(ctx, 'M-.57 -.783 Q-.42 -1.095 .15 -1.135 Q-.31 -1.175 -.49 -.959Z', '#ffdf7f', null);
        shape(ctx, 'M-.646 -.79 Q.028 -.894 .62 -.797 L.656 -.631 Q.013 -.722 -.659 -.62Z', form ? '#81324c' : '#bc3d52');
        shape(ctx, 'M-1.017 -.638 Q-.84 -.819 .018 -.777 Q.836 -.802 1.027 -.662 Q1.168 -.537 .725 -.502 Q.006 -.588 -.724 -.46 Q-1.145 -.5 -1.017 -.638Z', '#f4c962');
        shape(ctx, 'M-.868 -.606 Q-.43 -.729 -.031 -.69 Q.478 -.726 .871 -.625', null, '#a66a3d', .048);
      }
      eyes(ctx, form === 0 ? '#513125' : color, pose, form === 3 ? 'sharp' : 'round');
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
      if(form===4){
        shape(ctx,'M-.65-.29L-.34-.22L-.24-.07L-.26 .10L-.43 .20L-.58 .13L-.63-.05Z','#3b2c42');
        shape(ctx,'M-.63-.30L-.24-.09L.63-.23',null,'#988d93',.037);
        shape(ctx,'M-.35 .38L-.21 .65L.03 .67L.25 .60L.42 .34',null,'#e1cfbe',.056);
      }
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
      face(ctx, form === 1 ? '#a3a6af' : form >= 3 ? '#a5d37d' : '#91b36f', form === 1 ? '#686d83' : '#597b55', { broad: true });
      shape(ctx, 'M-.717 -.052 L-.849 -.272 L-.824 -.66 L-.74 -.874 L-.593 -.823 L-.468 -1.056 L-.353 -.97 L-.105 -1.157 L.001 -.981 L.186 -1.11 L.286 -.979 L.603 -1.022 L.522 -.9 L.785 -.925 L.842 -.622 L.771 -.181 L.544 -.316 L.579 -.516 L.284 -.589 L.106 -.404 L-.017 -.552 L-.286 -.446 L-.256 -.578 L-.541 -.41 L-.647 -.125Z', form === 1 ? '#383543' : '#293c3f');
      shape(ctx, 'M-.701 -.584 L-.56 -.713 L-.503 -.849 L-.395 -.757 L-.134 -.963 L-.074 -.817 L.103 -.93 L.23 -.815 L.466 -.859 L.524 -.763 L.688 -.799', null, '#4f6658', .074);
      if (form === 1) {
        shape(ctx,'M-.71-.62L-.59-1.03Q-.30-1.30 .10-1.16Q.42-1.36 .66-1.03L.81-.62Z','#34354a');
        shape(ctx,'M-.70-.72Q.06-.88 .79-.71L.80-.58Q.03-.70-.72-.59Z','#8b6d65');
        shape(ctx,'M-1.00-.60Q-.61-.80 .01-.73Q.62-.78 1.02-.62Q1.09-.47 .68-.50L-.66-.50Q-1.11-.47-1.00-.60Z','#56576b');
      }
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
    formArt.back(ctx, id, style);
    if (!finalArt.drawBody(ctx, id, style)) portrait(ctx, style);
    formArt.front(ctx, id, style);
    ctx.restore();
    return true;
  }

  function drawHit(ctx, id, x, y, radius, style) {
    if (style.pose !== 'hit') return;
    const armored = ['ironman', 'ultron', 'war_machine', 'black_panther', 'spider_man', 'deadpool'].includes(id);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(radius, radius);
    ctx.globalAlpha *= style.hurt ?? 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (armored) {
      shape(ctx, 'M-.53 -.40 L-.31 -.29 L-.45 -.10 L-.27 .02 M.36 .16 L.56 .25 L.40 .40', null, '#fff0c0', .045);
      shape(ctx, 'M-.56 .30 L-.38 .27 M.34 -.37 L.55 -.31', null, '#252339', .075);
    } else {
      oval(ctx, -.43, .24, .15, .08, 'rgba(167,94,144,.52)');
      oval(ctx, .43, .24, .15, .08, 'rgba(167,94,144,.52)');
      shape(ctx, 'M-.55 .16 L-.48 .27 M-.43 .13 L-.36 .25 M.35 .15 L.42 .27 M.47 .13 L.54 .24', null, '#9c5c77', .026);
    }
    if (!(id === 'gojo' && style.form === 0)) {
      shape(ctx, 'M-.49 -.03 L-.31 .045 L-.14 -.055 M.14 -.055 L.31 .045 L.49 -.03', null, '#211d30', .064);
    }
    shape(ctx, 'M-.19 .39 Q0 .31 .19 .39 L.15 .49 L-.15 .49Z', '#fff1d5', '#352239', .035);
    shape(ctx, 'M0 .37 L0 .47', null, '#6c5362', .022);
    ctx.restore();
  }

  return { draw, drawHit };
})();
