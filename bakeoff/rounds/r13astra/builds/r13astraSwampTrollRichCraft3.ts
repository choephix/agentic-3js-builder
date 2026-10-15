import * as THREE from "three";
import {
  createBuilder, catmull, bezier, frame, rng, svg,
  paint, mix, noise, grain, type Paint,
} from "../../../../src/index";

export const meta = {
  name: "Grimfen • Swamp Troll",
  description:
    "A towering, hand-painted swamp troll with jade skin, immense ivory tusks, a rust-red mohawk, and a shaman's collection of carved bone fetishes.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Grimfen", paintSize: 2048 });
  const random = rng(7819);
  type Bone = ReturnType<typeof b.joint>;
  type Fill = string | Paint;
  type P = [number, number, number];

  const C = {
    deep: "#173c3c",
    skin: "#4b8c68",
    light: "#8eae70",
    ink: "#172c2c",
    mouth: "#361e28",
    gum: "#75443c",
    ivory: "#ead9a7",
    boneShadow: "#9d885a",
    boneDark: "#514b35",
    red: "#a53c29",
    orange: "#dc6a34",
    hairDark: "#52252b",
    leather: "#42362c",
    leatherEdge: "#806044",
    gold: "#c9a457",
    iron: "#344747",
    cloth: "#873b31",
    clothDark: "#4e282a",
    turquoise: "#56bba9",
  };

  const skin = paint((p, n) => {
    const variation = noise(p, 0.19, 12);
    let base = mix("#3f795b", "#5e956a", variation);
    base = mix(base, "#abc17b", Math.max(0, n.y) * 0.22);
    base = mix(base, "#224e4b", Math.max(0, -n.y) * 0.38);
    if (p.y < 0.40) base = mix(base, "#314c42", (0.40 - p.y) * 0.8);
    return base;
  });
  const paleSkin = paint((p, n) =>
    mix("#668b60", "#a0b47a", 0.35 + n.y * 0.18 + noise(p, 0.12, 32) * 0.25),
  );
  const darkSkin = paint((p, n) =>
    mix("#234e46", "#4c7957", 0.40 + n.y * 0.2 + noise(p, 0.12, 41) * 0.24),
  );
  const bone = paint((p, n) =>
    mix("#a89768", "#f5e5b5", 0.48 + n.y * 0.24 + noise(p, 0.10, 18) * 0.19),
  );
  const horn = paint((_p, n, s) =>
    mix("#a99561", "#f6e7bd", Math.min(1, s[0] * 0.9 + 0.2 + n.y * 0.14)),
  );
  const hair = grain("#662a2b", "#bd492b", { size: 0.035, axis: "y", seed: 6 });
  const leather = grain("#372f28", "#66503a", { size: 0.025, axis: "y", seed: 15 });
  const cloth = paint((p, n) => {
    const weave = Math.sin(p.x * 600) * Math.sin(p.y * 650) * 0.025;
    return mix("#6c2f2c", "#b05236", 0.44 + n.y * 0.19 + weave);
  });

  const eyeTex = svg(`
    <svg viewBox="0 0 120 80">
      <path d="M4 38 Q48 2 116 24 L108 59 Q58 79 12 53Z" fill="#132c28"/>
      <path d="M14 39 Q56 16 106 29 L100 51 Q56 65 20 49Z" fill="#e3bb55"/>
      <ellipse cx="66" cy="42" rx="17" ry="21" fill="#ef861e"/>
      <ellipse cx="66" cy="42" rx="9" ry="20" fill="#202b26"/>
      <path d="M21 40 Q58 22 103 31" fill="none" stroke="#ffe69c" stroke-width="4"/>
      <circle cx="61" cy="34" r="5" fill="#fff7cf"/>
      <path d="M7 35 Q50 10 115 23" fill="none" stroke="#193d33" stroke-width="8"/>
    </svg>`, { size: 256 });

  const warpaintTex = svg(`
    <svg viewBox="0 0 100 160">
      <path d="M12 5 L34 12 L29 73 L43 101 L30 151 L19 119 L23 83Z
               M46 4 L66 9 L58 77 L70 106 L51 153 L44 126 L49 87Z
               M79 13 L94 20 L83 76 L92 101 L74 142 L72 112 L76 80Z"
        fill="#c8c794"/>
      <path d="M16 17 L21 49 M49 19 L54 42 M79 31 L81 52"
        fill="none" stroke="#eee0b0" stroke-width="4"/>
    </svg>`, { size: 256 });

  const clothTex = svg(`
    <svg viewBox="0 0 180 250">
      <path d="M12 0 L12 209 L87 240 L168 208 L168 0"
        fill="none" stroke="#d49b56" stroke-width="9"/>
      <path d="M26 0 L26 198 L88 224 L153 196 L153 0"
        fill="none" stroke="#452c29" stroke-width="5"/>
      <path d="M90 36 L139 104 L117 167 L91 199 L63 168 L42 106Z"
        fill="#412f2a" stroke="#d7b273" stroke-width="6"/>
      <path d="M90 55 L113 103 L103 143 L91 161 L78 143 L66 104Z"
        fill="#d7b273"/>
      <path d="M64 102 L84 110 L79 125 L62 119 M116 102 L96 110 L101 125 L118 119"
        fill="#442c27"/>
      <path d="M88 132 L82 144 L98 144Z" fill="#442c27"/>
      <path d="M71 166 L63 186 M90 177 L90 197 M108 167 L117 187"
        stroke="#d7b273" stroke-width="7"/>
      <path d="M17 24 L24 30 M17 51 L24 57 M17 78 L24 84
               M157 24 L164 30 M157 51 L164 57 M157 78 L164 84"
        stroke="#f4ce88" stroke-width="4"/>
    </svg>`, { size: 512 });

  const runeTex = svg(`
    <svg viewBox="0 0 80 100">
      <path d="M40 8 L16 36 L40 59 L63 35Z M40 14 L40 88 M18 66 L40 83 L62 65"
        fill="none" stroke="#713d2b" stroke-width="8" stroke-linejoin="miter"/>
      <path d="M40 14 L23 35 M40 62 L40 81"
        fill="none" stroke="#bc6844" stroke-width="3"/>
    </svg>`, { size: 192 });

  const scarTex = svg(`
    <svg viewBox="0 0 160 70">
      <path d="M6 54 Q68 32 152 12" stroke="#264a3d" stroke-width="10" fill="none"/>
      <path d="M6 48 Q68 26 152 6" stroke="#aec18c" stroke-width="6" fill="none"/>
      <path d="M31 36 L40 56 M62 24 L72 46 M95 14 L103 34 M127 5 L135 25"
        stroke="#698e63" stroke-width="5"/>
    </svg>`, { size: 256 });

  const crackTex = svg(`
    <svg viewBox="0 0 100 100">
      <path d="M44 0 L52 23 L40 38 L54 62 L45 82 L57 100
               M43 39 L23 44 L14 60 M52 63 L73 54 L88 60"
        stroke="#84764f" stroke-width="3" fill="none"/>
    </svg>`, { size: 192 });

  // Skeleton. Every limb and digit is built before the visible puppet.
  const hips = b.joint("hips", { at: [0, 1.04, -0.04], role: "spine" });
  const spine = b.chain("spine", [
    [0, 1.04, -0.04], [0, 1.40, -0.10], [0, 1.83, -0.02],
  ], { parent: hips, names: ["spineLower", "chest", "chestTop"], role: "spine" });
  const neck = b.chain("neck", [
    [0, 1.83, -0.02], [0, 2.03, 0.10], [0, 2.20, 0.16],
  ], { parent: spine.tip!, names: ["neckBase", "neckTop", "neckEnd"], role: "neck" });
  const head = b.joint("head", {
    parent: neck.tip!, at: [0, 2.25, 0.14], dir: [0, 0, 1], role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 2.08, 0.17], dir: [0, 0, 1], role: "jaw",
  });
  const crest = b.joint("mohawk", {
    parent: head, at: [0, 2.60, 0.06], dir: [0, 1, 0], role: "hinge",
  });

  const rigs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${side}`, [
      [s * 0.42, 1.83, -0.02],
      [s * 0.92, 1.65, 0],
      [s * 1.32, 1.48, 0.08],
    ], {
      parent: spine.tip!,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const hand = b.joint(`hand${side}`, {
      parent: arm.tip!, at: [s * 1.43, 1.45, 0.08],
      dir: [s, -0.15, 0], role: "arm",
    });
    const fingers = [0, 1, 2].map((i) => {
      const yy = 1.55 - i * 0.103;
      return b.chain(`finger${side}${i + 1}`, [
        [s * 1.52, yy, 0.10],
        [s * (1.71 + (i === 1 ? 0.04 : 0)), yy - 0.015, 0.12],
        [s * (1.85 + (i === 1 ? 0.04 : 0)), yy - 0.025, 0.16],
      ], { parent: hand, role: "digit", count: 2 });
    });
    const thumb = b.chain(`thumb${side}`, [
      [s * 1.41, 1.36, 0.13], [s * 1.47, 1.22, 0.19], [s * 1.61, 1.18, 0.23],
    ], { parent: hand, role: "digit", count: 2 });
    const leg = b.chain(`leg${side}`, [
      [s * 0.235, 1.08, -0.04],
      [s * 0.34, 0.60, 0.09],
      [s * 0.34, 0.20, -0.02],
    ], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg", contact: [s * 0.34, 0, 0.15],
    });
    const foot = b.joint(`foot${side}`, {
      parent: leg.tip!, at: [s * 0.34, 0.13, 0.10],
      dir: [0, 0, 1], role: "leg",
    });
    const toes = [-1, 0, 1].map((k) =>
      b.chain(`toe${side}${k + 2}`, [
        [s * 0.34 + k * 0.10, 0.105, 0.21],
        [s * 0.34 + k * 0.13, 0.095, 0.43 - Math.abs(k) * 0.035],
      ], { parent: foot, role: "digit", count: 1 }),
    );
    const ear = b.joint(`ear${side}`, {
      parent: head, at: [s * 0.31, 2.35, 0.07],
      dir: [s, 0.2, -0.1], role: "hinge",
    });
    return { s, side, arm, hand, fingers, thumb, leg, foot, toes, ear };
  });

  function ellipsoid(name: string, at: P, scale: P, fill: Fill, owner: Bone, segments = 10) {
    return b.part(new THREE.SphereGeometry(1, segments, 7), fill, {
      at, scale, bone: owner, name, flat: true,
    });
  }
  function box(name: string, at: P, size: P, fill: Fill, owner: Bone, rotation: P = [0, 0, 0]) {
    return b.part(new THREE.BoxGeometry(...size), fill, { at, bone: owner, name, rotation });
  }
  function rod(name: string, a: P, z: P, r: number, fill: Fill, owner: Bone) {
    return b.rod(a, z, r, { color: fill, bone: owner, sides: 6, name });
  }
  function bead(at: P, r: number, fill: Fill, owner: Bone) {
    return b.part(new THREE.IcosahedronGeometry(r, 0), fill, { at, bone: owner, name: "fetishBead" });
  }
  function patch(texture: THREE.Texture, at: P, size: [number, number], owner: Bone, dir: P = [0, 0, 1]) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at, bone: owner, texture, dir, axis: "z", name: "paintedDetail",
    });
  }
  function ring(at: P, radius: number, tube: number, fill: Fill, owner: Bone, dir: P = [0, 0, 1]) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 12), fill, {
      at, bone: owner, dir, axis: "z", name: "forgedRing",
    });
  }

  // Large readable masses: narrow waist under enormous sloping shoulders.
  const torso = b.loft([
    { at: [0, 1.00, -0.04], w: 0.53, h: 0.38 },
    { at: [0, 1.22, -0.06], w: 0.47, h: 0.34 },
    { at: [0, 1.49, -0.07], w: 0.70, h: 0.45 },
    { at: [0, 1.76, -0.03], w: 1.02, h: 0.52 },
    { at: [0, 1.88, -0.015], w: 0.84, h: 0.44 },
  ], { bone: spine, color: skin, sides: 10, name: "barrelChest" });
  b.sweep(neck, [0.24, 0.26, 0.23], { color: darkSkin, sides: 8, name: "hunchedNeck" });
  for (const { s } of rigs) {
    ellipsoid("pectoral", [s * 0.235, 1.70, 0.185], [0.28, 0.20, 0.13], skin, spine.joints[1]);
    ellipsoid("trapezius", [s * 0.23, 1.91, -0.04], [0.28, 0.18, 0.22], skin, spine.tip!);
    ellipsoid("hipMuscle", [s * 0.22, 1.04, -0.04], [0.23, 0.23, 0.23], skin, hips);
    for (let i = 0; i < 2; i++) {
      ellipsoid("abdominalPlane", [s * 0.115, 1.42 - i * 0.15, 0.131],
        [0.12, 0.10, 0.047], paleSkin, spine.joints[0]);
    }
  }

  // Face first: long angular nose, deeply set amber eyes, separate lower jaw.
  const H = 1.0;
  const hr = b.region({ at: [0, 2.25, 0.14], scale: H, bone: head });
  const hp = (p: P): P => {
    const v = hr.p(p);
    return [v.x, v.y, v.z];
  };
  const skull = ellipsoid("angularSkull", hp([0, 0.04, 0]), [0.355 * H, 0.375 * H, 0.285 * H], skin, head, 12);
  ellipsoid("occipital", hp([0, 0.02, -0.14]), [0.30, 0.30, 0.23], darkSkin, head);
  const chin = ellipsoid("heavyLowerJaw", hp([0, -0.22, 0.17]),
    [0.30, 0.16, 0.255], skin, jaw, 10);
  ellipsoid("chinPlane", hp([0, -0.29, 0.22]), [0.21, 0.08, 0.16], paleSkin, jaw);
  ellipsoid("mouthOpening", hp([0, -0.125, 0.257]), [0.263, 0.055, 0.115], C.mouth, head);
  ellipsoid("upperMuzzle", hp([0, -0.065, 0.25]), [0.275, 0.092, 0.155], paleSkin, head);
  ellipsoid("lowerLip", hp([0, -0.175, 0.335]), [0.22, 0.038, 0.045], darkSkin, jaw);
  b.sweep([
    hp([0, 0.20, 0.22]), hp([0, 0.065, 0.35]), hp([0, -0.025, 0.43]),
  ], (t) => [0.067 + t * 0.038, 0.055 + t * 0.015], {
    bone: head, color: skin, sides: 6, name: "longHookedNose",
  });
  ellipsoid("noseTip", hp([0, -0.005, 0.423]), [0.116, 0.074, 0.081], skin, head);

  for (const { s, side, ear } of rigs) {
    ellipsoid("cheekPlane", hp([s * 0.265, -0.055, 0.16]),
      [0.13, 0.16, 0.15], paleSkin, head);
    const eyeSocket = ellipsoid(`eyeSocket${side}`, hp([s * 0.19, 0.112, 0.224]),
      [0.133, 0.087, 0.065], C.deep, head);
    b.decal(eyeSocket, eyeTex, {
      at: hp([s * 0.19, 0.11, 0.285]),
      dir: [s * 0.16, 0, 1], size: [0.208, 0.125],
      mirror: s > 0, bone: head, lift: 0.002, name: `amberEye${side}`,
    });
    b.sweep([
      hp([s * 0.065, 0.16, 0.27]),
      hp([s * 0.18, 0.215, 0.255]),
      hp([s * 0.30, 0.19, 0.19]),
    ], [0.057, 0.071, 0.043], {
      bone: head, color: darkSkin, sides: 6, name: `heavyBrow${side}`,
    });
    ellipsoid("nostril", hp([s * 0.074, -0.033, 0.48]),
      [0.027, 0.014, 0.010], C.deep, head, 8);

    const earOutline = [
      [0, -0.10], [0.25, -0.035], [0.50, 0.23],
      [0.20, 0.145], [0.035, 0.13],
    ];
    b.extrude(earOutline, {
      at: hp([s * 0.28, 0.07, -0.045]), x: [s, 0, -0.18], y: [0, 1, 0],
      thickness: 0.085, bevel: 0.015, color: skin, bone: ear, name: `longEar${side}`,
    });
    b.extrude([
      [0.045, -0.04], [0.23, 0.015], [0.405, 0.18], [0.19, 0.095], [0.065, 0.09],
    ], {
      at: hp([s * 0.28, 0.07, 0.001]), x: [s, 0, -0.18], y: [0, 1, 0],
      thickness: 0.012, color: darkSkin, bone: ear, name: "earInset",
    });

    const tuskPath = catmull([
      hp([s * 0.235, -0.215, 0.32]),
      hp([s * 0.325, -0.10, 0.42]),
      hp([s * 0.36, 0.075, 0.49]),
      hp([s * 0.345, 0.255, 0.49]),
      hp([s * 0.30, 0.365, 0.445]),
    ]);
    b.sweep(tuskPath, [0.082, 0.078, 0.055, 0.026, 0], {
      color: horn, bone: jaw, sides: 8, caps: "flat", name: `greatTusk${side}`,
    });
    ellipsoid("tuskGum", hp([s * 0.232, -0.215, 0.32]),
      [0.089, 0.053, 0.088], C.gum, jaw);
    b.sweep(tuskPath, 0.084, {
      from: 0.09, to: 0.16, color: leather, bone: jaw, sides: 8, caps: "flat", name: "tuskBinding",
    });
    b.sweep(tuskPath, 0.086, {
      from: 0.11, to: 0.125, color: C.gold, bone: jaw, sides: 8, caps: "flat",
    });
    for (let i = 0; i < 3; i++) {
      b.spike(hp([s * (0.065 + i * 0.047), -0.11, 0.35]),
        [0, -1, 0.08], 0.048, 0.020, { bone: head, color: bone, sides: 5 });
    }

    b.decal(skull, warpaintTex, {
      at: hp([s * 0.275, -0.025, 0.235]), dir: [s * 0.35, 0, 1],
      size: [0.105, 0.20], bone: head, mirror: s < 0, name: "cheekWarpaint",
    });
    ring(hp([s * 0.49, 0.065, -0.01]), 0.067, 0.013, C.gold, ear);
    bead(hp([s * 0.49, -0.009, -0.01]), 0.023, C.turquoise, ear);
  }
  b.decal(chin, runeTex, {
    at: hp([0, -0.285, 0.38]), dir: [0, 0, 1], size: [0.10, 0.09], bone: jaw,
  });
  b.decal(skull, scarTex, {
    at: hp([-0.15, 0.29, 0.18]), dir: [-0.15, 0.3, 1],
    size: [0.17, 0.065], bone: head, roll: -24,
  });
  ring(hp([0, -0.071, 0.48]), 0.049, 0.009, C.gold, head);

  // A solid crimson crest with broad, overlapping blade-shaped locks.
  ellipsoid("mohawkRoot", [0, 2.594, 0.015], [0.095, 0.10, 0.285], C.hairDark, crest);
  for (let i = 0; i < 7; i++) {
    const z = 0.34 - i * 0.10;
    const y = 2.575 - Math.max(0, i - 3) * 0.045;
    const height = 0.30 + Math.sin((i + 1) * 0.42) * 0.17;
    b.extrude([
      [-0.082, 0], [-0.075, height * 0.48], [-0.025, height],
      [0.018, height * 0.93], [0.073, height * 0.31], [0.085, 0],
    ], {
      at: [0, y, z], x: [1, 0, 0], y: [0, 1, -0.38],
      thickness: [0.125, 0.035], color: i % 2 ? hair : C.red,
      bone: crest, name: "mohawkBlade",
    });
    b.sweep([
      [0.02, y + 0.035, z + 0.065],
      [0.008, y + height * 0.51, z + 0.015 - height * 0.19],
      [-0.02, y + height * 0.91, z - height * 0.35],
    ], [0.018, 0.014, 0], {
      color: C.orange, bone: crest, sides: 5, name: "crestHighlight",
    });
  }

  // Limbs remain spread and clearly articulated, with separated thick digits.
  for (const r of rigs) {
    const { s, side, arm, hand, fingers, thumb, leg, foot, toes } = r;
    b.sweep(arm, [0.235, 0.205, 0.15], {
      color: skin, sides: 8, name: `armMass${side}`,
    });
    ellipsoid("deltoid", [s * 0.55, 1.83, -0.015], [0.28, 0.25, 0.25], skin, arm.joints[0]);
    ellipsoid("bicep", [s * 0.76, 1.72, 0.085], [0.235, 0.19, 0.17], skin, arm.joints[0]);
    ellipsoid("elbow", [s * 0.94, 1.64, -0.025], [0.16, 0.17, 0.17], darkSkin, arm.joints[1]);
    ellipsoid("forearmPlane", [s * 1.105, 1.57, 0.095],
      [0.235, 0.16, 0.145], skin, arm.joints[1]);
    ellipsoid("largePalm", [s * 1.45, 1.45, 0.10], [0.19, 0.19, 0.105], skin, hand);
    ellipsoid("palmPad", [s * 1.46, 1.45, 0.19], [0.125, 0.13, 0.025], paleSkin, hand);
    for (const [i, finger] of fingers.entries()) {
      b.sweep(finger, [0.060, 0.053, 0.039], { color: skin, sides: 6, name: "thickFinger" });
      const p = finger.at(0.84).at;
      ellipsoid("fingerNail", [p.x, p.y + 0.009, p.z + 0.035],
        [0.045, 0.032, 0.014], C.boneDark, finger.joints[1], 6);
      const k = finger.at(0.38).at;
      ellipsoid("knuckle", [k.x, k.y + 0.025, k.z + 0.025],
        [0.055, 0.039, 0.034], darkSkin, finger.joints[0], 6);
      if (i === 1) ring([k.x, k.y, k.z], 0.055, 0.008, C.gold, finger.joints[0], [s, 0, 0]);
    }
    b.sweep(thumb, [0.071, 0.058, 0.035], { color: skin, sides: 6, name: "opposedThumb" });
    const thumbEnd = thumb.at(0.87).at;
    ellipsoid("thumbNail", [thumbEnd.x, thumbEnd.y, thumbEnd.z + 0.033],
      [0.043, 0.029, 0.015], C.boneDark, thumb.joints[1], 6);

    b.sweep(leg, [0.23, 0.18, 0.12], { color: skin, sides: 8, name: `legMass${side}` });
    ellipsoid("thigh", [s * 0.295, 0.86, 0.005], [0.22, 0.28, 0.23], skin, leg.joints[0]);
    ellipsoid("kneeCap", [s * 0.34, 0.59, 0.23], [0.133, 0.14, 0.08], darkSkin, leg.joints[1]);
    ellipsoid("calf", [s * 0.35, 0.42, -0.045], [0.145, 0.23, 0.155], skin, leg.joints[1]);
    ellipsoid("wideFoot", [s * 0.34, 0.125, 0.115], [0.205, 0.125, 0.245], skin, foot);
    for (const toe of toes) {
      b.sweep(toe, [0.072, 0.063], { color: skin, sides: 6, name: "splayedToe" });
      const p = toe.at(0.92).at;
      ellipsoid("toeNail", [p.x, p.y + 0.043, p.z + 0.015],
        [0.047, 0.018, 0.062], C.boneDark, toe.joints[0], 6);
    }

    // Leather wraps use the same limb axes as their underlying sweeps.
    b.sweep(arm, 0.166, {
      from: 0.78, to: 0.94, color: leather, sides: 8, bone: arm,
      caps: "flat", name: "wristBracer",
    });
    for (const t of [0.78, 0.83, 0.89, 0.94]) {
      b.sweep(arm, 0.173, {
        from: t, to: t + 0.012, color: C.leatherEdge, sides: 8,
        caps: "flat", name: "bracerLashing",
      });
    }
    for (let i = 0; i < 3; i++) {
      const x = s * (1.15 + i * 0.075);
      b.spike([x, 1.65 - i * 0.03, 0.12], [0, 0.9, 0.25],
        0.17 - i * 0.025, 0.038, { color: bone, bone: arm.joints[1], sides: 5 });
    }
    b.sweep(leg, 0.145, {
      from: 0.72, to: 0.92, color: leather, sides: 8, caps: "flat", name: "ankleWrap",
    });
    for (const t of [0.73, 0.80, 0.88]) {
      b.sweep(leg, 0.152, {
        from: t, to: t + 0.022, color: C.leatherEdge, sides: 8, caps: "flat",
      });
    }
  }

  // A few broad scars and rough, clustered warts rather than a noisy surface.
  b.decal(torso, scarTex, {
    at: [0.22, 1.72, 0.25], dir: [0, 0, 1], size: [0.28, 0.10],
    roll: 12, bone: spine.joints[1],
  });
  const wartSurface = b.surface(torso);
  for (const hit of wartSurface.scatter(16, {
    rng: random, minDist: 0.065,
    filter: (h) => h.at.y > 1.58 && (h.n.z < -0.25 || Math.abs(h.n.x) > 0.7),
  })) {
    b.stick(new THREE.IcosahedronGeometry(0.020 + random() * 0.011, 0),
      darkSkin, hit, { embed: 0.45, name: "swampWart" });
  }

  // Layered hide skirt, woven front tabard, heavy belt and stitches.
  b.sweep(catmull([
    [0, 1.07, 0.19], [0.30, 1.07, 0.10], [0.31, 1.07, -0.17],
    [0, 1.07, -0.25], [-0.31, 1.07, -0.17], [-0.30, 1.07, 0.10],
  ], { closed: true }), 0.070, { color: leather, bone: hips, sides: 6, name: "wideWaistBelt" });

  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const x = Math.sin(a) * 0.29;
    const z = Math.cos(a) * 0.23 - 0.035;
    const widthDir: P = [Math.cos(a), 0, -Math.sin(a)];
    b.extrude([
      [-0.11, 0], [0.11, 0], [0.12, -0.22],
      [0.055, -0.34 - (i % 3) * 0.025], [-0.09, -0.30],
    ], {
      at: [x, 1.035, z], x: widthDir, y: [0, 1, 0],
      thickness: 0.035, color: i % 2 ? C.clothDark : cloth, bone: hips, name: "hideSkirtPanel",
    });
  }
  const frontCloth = b.extrude([
    [-0.19, 0], [0.19, 0], [0.17, -0.40],
    [0.04, -0.51], [-0.02, -0.46], [-0.15, -0.49],
  ], {
    at: [0, 1.065, 0.285], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.032, color: cloth, bone: hips, name: "ceremonialLoincloth",
  });
  b.decal(frontCloth, clothTex, {
    at: [0, 0.825, 0.305], dir: [0, 0, 1], size: [0.35, 0.48],
    bone: hips, lift: 0.0015, name: "wovenSkullEmblem",
  });
  b.extrude([
    [-0.17, 0], [0.17, 0], [0.15, -0.42], [0, -0.52], [-0.16, -0.39],
  ], {
    at: [0, 1.05, -0.30], x: [-1, 0, 0], y: [0, 1, 0],
    thickness: 0.03, color: cloth, bone: hips, name: "rearTabard",
  });
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      box("beltStud", [s * (0.10 + i * 0.044), 1.083, 0.242 - i * 0.013],
        [0.016, 0.025, 0.018], C.gold, hips);
    }
  }

  // Bone fetish helper: a recognizable miniature skull with open sockets,
  // cheek flanges, teeth, and an engraved forehead.
  function fetishSkull(center: P, size: number, owner: Bone, engraved = true) {
    const [x, y, z] = center;
    ellipsoid("fetishCranium", [x, y + size * 0.10, z],
      [size * 0.48, size * 0.53, size * 0.30], bone, owner, 8);
    ellipsoid("fetishMuzzle", [x, y - size * 0.24, z + size * 0.18],
      [size * 0.33, size * 0.22, size * 0.20], bone, owner, 8);
    for (const s of [1, -1]) {
      ellipsoid("emptyEyeSocket",
        [x + s * size * 0.21, y + size * 0.035, z + size * 0.255],
        [size * 0.14, size * 0.155, size * 0.038], C.boneDark, owner, 6);
      ellipsoid("skullCheek",
        [x + s * size * 0.37, y - size * 0.19, z + size * 0.12],
        [size * 0.12, size * 0.16, size * 0.16], bone, owner, 6);
    }
    b.extrude([[-size * 0.09, 0], [size * 0.09, 0], [0, size * 0.15]], {
      at: [x, y - size * 0.235, z + size * 0.375],
      x: [1, 0, 0], y: [0, 1, 0], thickness: 0.003,
      color: C.boneDark, bone: owner, name: "skullNasalCavity",
    });
    for (let i = 0; i < 4; i++) {
      box("fetishTooth",
        [x + (i - 1.5) * size * 0.13, y - size * 0.43, z + size * 0.22],
        [size * 0.10, size * 0.18, size * 0.15], bone, owner);
    }
    if (engraved) {
      patch(runeTex, [x, y + size * 0.29, z + size * 0.28],
        [size * 0.25, size * 0.31], owner);
    }
  }

  // A central skull buckle, paired long-bone charms, and a dangling hip trophy.
  fetishSkull([0, 1.12, 0.29], 0.22, hips);
  for (const s of [1, -1]) {
    const x = s * 0.29;
    b.sweep(catmull([
      [x, 1.10, 0.13], [x + s * 0.07, 0.94, 0.16],
      [x + s * 0.035, 0.79, 0.19],
    ]), 0.012, { color: C.leather, bone: hips, sides: 5, name: "fetishCord" });
    for (let i = 0; i < 3; i++) {
      bead([x + s * 0.06, 0.99 - i * 0.045, 0.17], 0.026,
        i === 1 ? C.red : C.turquoise, hips);
    }
    const bx = x + s * 0.035;
    rod("hangingLongBone", [bx, 0.82, 0.19], [bx + s * 0.035, 0.61, 0.21], 0.027, bone, hips);
    for (const yy of [0.82, 0.61]) {
      for (const k of [-1, 1]) {
        bead([bx + (yy < 0.7 ? s * 0.035 : 0) + k * 0.025, yy, 0.20], 0.035, bone, hips);
      }
    }
  }
  fetishSkull([-0.365, 0.94, -0.07], 0.17, hips, false);

  // Necklace rides the chest, falling below the face without hiding it.
  const necklacePoints: P[] = [
    [-0.33, 1.99, 0.13], [-0.40, 1.87, 0.24], [-0.32, 1.70, 0.30],
    [-0.16, 1.59, 0.31], [0, 1.55, 0.31],
    [0.16, 1.59, 0.31], [0.32, 1.70, 0.30], [0.40, 1.87, 0.24], [0.33, 1.99, 0.13],
  ];
  const necklace = catmull(necklacePoints);
  b.sweep(necklace, 0.016, {
    color: C.leather, bone: spine.joints[1], sides: 6, name: "necklaceCord",
  });
  b.along(necklace, 19, (f) => {
    const p = f.at;
    const turquoise = Math.abs(p.x) > 0.28;
    bead([p.x, p.y, p.z], turquoise ? 0.036 : 0.026,
      turquoise ? C.turquoise : C.boneShadow, spine.joints[1]);
  });
  for (let i = 0; i < 7; i++) {
    const t = 0.20 + (i / 6) * 0.60;
    const p = necklace.at(t);
    const len = 0.11 + (1 - Math.abs(i - 3) / 3) * 0.06;
    b.sweep(bezier(
      [p.x, p.y, p.z],
      [p.x * 1.08, p.y - len * 0.55, p.z + 0.045],
      [p.x * 1.10, p.y - len, p.z + 0.025],
    ), [0.039, 0.027, 0], {
      color: bone, bone: spine.joints[1], sides: 6, name: "necklaceFang",
    });
    ring([p.x, p.y + 0.009, p.z], 0.025, 0.007, C.red, spine.joints[1], [0, 1, 0]);
  }
  fetishSkull([0, 1.48, 0.33], 0.16, spine.joints[1]);

  // Asymmetric shoulder mantle: a simple hide saddle carrying an assembly
  // of big bones, lashings, a carved skull, and two dangling feather charms.
  const shoulderOwner = rigs[0].arm.joints[0];
  ellipsoid("hideShoulderMantle", [0.57, 1.95, -0.035],
    [0.30, 0.135, 0.28], leather, shoulderOwner);
  for (let i = 0; i < 5; i++) {
    const x = 0.37 + i * 0.105;
    const yy = 2.04 - Math.abs(i - 2) * 0.024;
    b.sweep(catmull([
      [x, yy - 0.09, 0.20],
      [x, yy + 0.065, 0.05],
      [x + 0.025, yy + 0.08, -0.14],
      [x + 0.04, yy - 0.025, -0.29],
    ]), [0.034, 0.043, 0.036, 0.024], {
      color: bone, bone: shoulderOwner, sides: 6, name: "ribShoulderArmor",
    });
    b.spike([x, yy + 0.06, -0.10], [0.23, 0.95, -0.20],
      0.14 + (i % 2) * 0.08, 0.043, {
        color: bone, bone: shoulderOwner, sides: 6, name: "shoulderBoneSpike",
      });
    bead([x, yy - 0.065, 0.22], 0.028, C.red, shoulderOwner);
  }
  fetishSkull([0.66, 1.94, 0.245], 0.22, shoulderOwner);
  patch(crackTex, [0.68, 2.00, 0.306], [0.10, 0.13], shoulderOwner);

  for (const [index, x] of [0.77, 0.87].entries()) {
    const yy = 1.84 - index * 0.07;
    rod("shoulderCharmCord", [x, 1.95, 0.18], [x + 0.025, yy - 0.14, 0.20],
      0.009, C.leather, shoulderOwner);
    bead([x + 0.018, yy - 0.04, 0.20], 0.032, C.turquoise, shoulderOwner);
    bead([x + 0.022, yy - 0.10, 0.20], 0.022, C.red, shoulderOwner);
    b.extrude([
      [0, 0], [0.052, -0.09], [0.025, -0.23], [-0.020, -0.27], [-0.043, -0.11],
    ], {
      at: [x + 0.025, yy - 0.13, 0.20], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.015, color: index ? C.red : C.deep,
      bone: shoulderOwner, name: "fetishFeather",
    });
    rod("featherQuill", [x + 0.025, yy - 0.13, 0.212],
      [x + 0.010, yy - 0.36, 0.212], 0.004, C.ivory, shoulderOwner);
  }

  // Opposite upper arm: ritual paint and a tight cord of carved bones.
  const rightArm = rigs[1].arm;
  const bandPath = catmull([
    [-0.73, 1.86, 0.03], [-0.73, 1.77, 0.22],
    [-0.73, 1.57, 0.08], [-0.73, 1.66, -0.15],
  ], { closed: true });
  b.sweep(bandPath, 0.024, {
    color: C.clothDark, bone: rightArm.joints[0], sides: 6, name: "upperArmBinding",
  });
  for (let i = 0; i < 4; i++) {
    const x = -0.65 - i * 0.055;
    rod("armBoneTalisman", [x, 1.81, 0.208], [x, 1.65, 0.224],
      0.021, bone, rightArm.joints[0]);
    bead([x, 1.81, 0.208], 0.027, bone, rightArm.joints[0]);
    bead([x, 1.65, 0.224], 0.027, bone, rightArm.joints[0]);
  }

  // Small tied details make the primitive construction feel handmade.
  for (const r of rigs) {
    const { s, leg } = r;
    for (let i = 0; i < 3; i++) {
      const x = s * 0.34 + (i - 1) * 0.055;
      rod("shinBoneSlat", [x, 0.40, 0.123], [x, 0.25, 0.135],
        0.018, bone, leg.joints[1]);
    }
    for (let i = 0; i < 3; i++) {
      const yy = 0.275 + i * 0.042;
      rod("shinCrossTie", [s * 0.34 - 0.095, yy, 0.155],
        [s * 0.34 + 0.095, yy + 0.01, 0.155], 0.007, C.leatherEdge, leg.joints[1]);
    }
  }

  return b.root;
}
