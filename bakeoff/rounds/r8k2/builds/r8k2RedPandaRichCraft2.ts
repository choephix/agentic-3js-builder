import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, noise, cells, svg } from "../../../../src/index";
import { cel, furEdge, animeEye, INK, KEY_LIGHT, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded, Genshin-style red panda cautiously balancing on a mossy runed stone: one forepaw raised in a balancing gesture, a ringed tail swung out as a counterweight, a teal dendro scarf with a leaf emblem, and a few glowing crystals, mushrooms and flowers.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants and palette

const FL = 0.21; // top of the stone
const BY = FL + 0.18; // height of the body axis
const BASE_H = 0.042;
const CZ = -0.03; // centre (z) of ground and stone

const RUST = "#cc4f22";
const RUST_LT = "#e56f30";
const HEAD_RUST = "#d9602a";
const BELLY = "#46282b";
const PAW = "#432729";
const TOE = "#5a363a";
const LEGDARK = "#3e2427";
const CREAM = "#fff2da";
const CREAM_SH = "#eac7a0";
const NOSE = "#2b1a22";
const TEAR = "#6e2a18";
const TAIL_O = "#e0662a";
const TAIL_R = "#8f351c";
const TEAL = "#2bb8a8";
const TEAL_LT = "#3fd2bd";
const GOLD = "#f2c14e";
const MOSS = "#62a23c";

const KEY = new THREE.Vector3(...KEY_LIGHT).normalize();
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** v made perpendicular to y (unit). */
const perpTo = (v: THREE.Vector3, y: THREE.Vector3) => {
  const yn = y.clone().normalize();
  return v.clone().addScaledVector(yn, -v.dot(yn)).normalize();
};
/** A point on the ground ring: angle from +Z (toward +X) and radius about the stone centre. */
const ringXZ = (deg: number, r: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [Math.sin(a) * r, CZ + Math.cos(a) * r];
};

// Toon palette
const C_CREAM = cel(CREAM, CREAM_SH);
const C_RUST = cel(RUST);
const C_RUSTLT = cel(RUST_LT);
const C_INNER = cel("#b9461f");
const C_PAW = cel(PAW);
const C_TOE = cel(TOE);
const C_LEG = cel(LEGDARK);
const C_TEAL = cel(TEAL);
const C_GOLD = cel(GOLD, "#c98f2a");
const C_MOSS = cel(MOSS);
const C_TAILO = cel(TAIL_O);
const C_TAILR = cel(TAIL_R);

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = animeEye({ iris: "#38d6c4", irisLight: "#b9fff0" });

const LID = svg(
  `<svg viewBox="0 0 70 28" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 24 Q10 3 36 2 Q60 3 69 24 Q36 12 1 24Z" fill="#9a3a1e"/>
    <path d="M1 24 Q10 3 36 2 Q60 3 69 24" stroke="#22112f" stroke-width="3.6" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const BLADE = svg(
  `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 48 Q7 24 1 6 Q13 20 15 48Z" fill="#478f38"/>
    <path d="M12 48 Q14 20 21 1 Q27 22 29 48Z" fill="#77c449"/>
    <path d="M26 48 Q31 28 39 12 Q36 34 37 48Z" fill="#58a83c"/>
  </svg>`,
  { size: 128 },
);

const LEAF = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 46 Q1 30 16 2 Q31 30 16 46Z" fill="#58b848" stroke="#2c6e34" stroke-width="2.5"/>
    <path d="M16 44 V10" stroke="#2c6e34" stroke-width="2.2"/>
  </svg>`,
  { size: 128 },
);

const FLOWER = svg(
  `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 56 V26" stroke="#3a9a3a" stroke-width="3.5"/>
    <g fill="#fff8fb" stroke="#e8a0c0" stroke-width="1.8">
      <ellipse cx="20" cy="10" rx="7" ry="9"/>
      <ellipse cx="10" cy="18" rx="7" ry="9" transform="rotate(-55 10 18)"/>
      <ellipse cx="30" cy="18" rx="7" ry="9" transform="rotate(55 30 18)"/>
    </g>
    <circle cx="20" cy="18" r="5" fill="#ffd34e"/>
  </svg>`,
  { size: 128 },
);

const RUNE = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#9dffb4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="100" cy="50" r="35"/>
      <circle cx="100" cy="50" r="25" stroke-width="3"/>
      <path d="M100 22 Q122 42 100 78 Q78 42 100 22Z"/>
      <path d="M100 30 V70"/>
      <path d="M100 50 L112 42 M100 58 L88 50"/>
      <path d="M14 50 H56 M144 50 H186"/>
      <path d="M24 38 L34 50 L24 62 M176 38 L166 50 L176 62"/>
      <path d="M60 20 L72 28 M140 20 L128 28 M60 80 L72 72 M140 80 L128 72"/>
    </g>
  </svg>`,
  { size: 512 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="29" fill="#1d6f67" stroke="#f2c14e" stroke-width="5"/>
    <path d="M32 12 Q51 28 32 53 Q13 28 32 12Z" fill="#9af0a8" stroke="#f2c14e" stroke-width="2.5"/>
    <path d="M32 18 V48 M32 34 L40 28 M32 40 L24 34" stroke="#1d6f67" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Scenery paints

const stonePaint = paint((p, n) => {
  const lit = n.dot(KEY) > 0.1;
  const wob = (noise(p, 0.14, 4) - 0.5) * 0.9;
  const mossy = n.y + wob + (p.y - 0.1) * 1.6;
  if (mossy > 0.78) {
    const deep = noise(p, 0.05, 11) > 0.6;
    return lit ? (deep ? "#74b045" : "#5e9a3a") : deep ? "#3f7a36" : "#336f33";
  }
  const c = cells(p, 0.2, 7);
  if (c.d2 - c.d1 < 0.03) return lit ? "#738092" : "#566379";
  const band = noise(p, 0.3, 2) > 0.55;
  return lit ? (band ? "#9aa6b4" : "#8895a6") : band ? "#68758a" : "#5c697e";
});

const baseCoat = paint((p, n) => {
  const lit = n.dot(KEY) > 0.1;
  if (n.y > 0.6) {
    const t = noise(p, 0.08, 3) > 0.55;
    return lit ? (t ? "#6cb040" : "#5a9f38") : t ? "#417f39" : "#367333";
  }
  return lit ? "#8a5a3a" : "#5e3a2c";
});

/** A flat low-poly fur wedge: a four-sided cone whose tip leans along the part's +Z (the flow). */
const wedgeGeo = (len: number, w: number) => {
  const g = new THREE.ConeGeometry(w, len, 4, 1);
  g.rotateY(Math.PI / 4);
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) > len * 0.49) pos.setZ(i, pos.getZ(i) + len * 0.45);
  g.scale(0.8, 1, 1.5);
  g.computeVertexNormals();
  return g;
};

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "red_panda_on_mossy_stone" });

  // Paw layout: the left forepaw is lifted in a balancing gesture; weight sits inside the three planted contacts.
  const PAWS = {
    hindL: { x: 0.105, z: -0.18, lift: 0, pitch: 0 },
    hindR: { x: -0.105, z: -0.18, lift: 0, pitch: 0 },
    frontR: { x: -0.055, z: 0.13, lift: 0, pitch: 0 },
    frontL: { x: 0.13, z: 0.17, lift: 0.065, pitch: 30 },
  };
  const pawList = Object.values(PAWS);
  const nearPaw = (x: number, z: number) => pawList.some((p) => Math.hypot(x - p.x, z - (p.z + 0.03)) < 0.085);

  // =============================================================================================================
  // Skeleton

  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  const hips = b.joint("hips", { parent: base, at: [0, BY, -0.155], dir: [0, 0.02, 1], role: "spine" });

  const spinePath = catmull([
    [0, BY, -0.155],
    [0, BY + 0.007, -0.075],
    [-0.004, BY + 0.013, 0.01],
    [-0.012, BY + 0.018, 0.11],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chest = spine.joints[2];

  const neckEnd: [number, number, number] = [-0.014, BY + 0.1, 0.225];
  const neckPath = catmull([[-0.012, BY + 0.018, 0.11], [-0.013, BY + 0.06, 0.17], neckEnd]);
  const neck = b.chain("neck", neckPath, { parent: chest, names: ["neck1", "neck2"], role: "neck" });

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neckEnd,
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ up: -0.035, forward: 0.05 }),
    aim: head.local({ up: -0.04, forward: 0.17 }),
    role: "jaw",
    group: "head",
  });

  // Tail: back, then swinging out to the model's left (+x) and up, as a counterweight beside the rump.
  const tailPath = catmull([
    [0, BY, -0.195],
    [0, BY - 0.002, -0.31],
    [0.01, BY + 0.01, -0.43],
    [0.07, BY + 0.04, -0.49],
    [0.17, BY + 0.07, -0.53],
    [0.28, BY + 0.14, -0.56],
    [0.32, BY + 0.22, -0.49],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
    role: "tail",
  });

  // =============================================================================================================
  // Ground, stone and scenery

  const ground = b.lathe(
    [
      [0, 0],
      [0.4, 0],
      [0.42, 0.015],
      [0.405, BASE_H - 0.002],
      [0, BASE_H],
    ],
    { at: [0, 0, CZ], segments: 12, bone: base, color: baseCoat, name: "ground" },
  );
  const groundSkin = b.surface(ground);
  const groundR = (h: { at: THREE.Vector3 }) => Math.hypot(h.at.x, h.at.z - CZ);

  // stone compressed ~20% vertically (top at FL)
  const stone = b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.355, 0.04],
      [0.37, 0.096],
      [0.335, 0.152],
      [0.285, 0.176],
      [0, 0.18],
    ],
    { at: [0, 0.03, CZ], segments: 9, spin: 20, bone: base, color: stonePaint, name: "stone" },
  );
  const stoneSkin = b.surface(stone);
  const stoneR = (h: { at: THREE.Vector3 }) => Math.hypot(h.at.x, h.at.z - CZ);
  const floorAt = (x: number, z: number) => {
    const h = stoneSkin.ray([x, 1, z], [0, -1, 0]);
    return h ? h.at.y : FL;
  };

  // satellite rocks and pebbles on the ring
  const rocks: [number, number, number, number][] = [
    [75, 0.375, 0.04, 0],
    [-155, 0.38, 0.045, 1],
    [165, 0.375, 0.035, 2],
  ];
  rocks.forEach(([deg, rad, r, i]) => {
    const [x, z] = ringXZ(deg, rad);
    b.part(new THREE.IcosahedronGeometry(1, 0), stonePaint, {
      bone: base,
      at: [x, BASE_H + r * 0.28, z],
      scale: [r, r * 0.62, r * 0.9],
      rotation: [0, i * 47, 0],
      flat: true,
      name: `rock${i}`,
    });
  });
  const rp = rng(31);
  for (let i = 0; i < 8; i++) {
    const a = rp() * 360;
    const [x, z] = ringXZ(a, 0.36 + rp() * 0.05);
    b.part(new THREE.IcosahedronGeometry(0.012 + rp() * 0.012, 0), stonePaint, {
      bone: base,
      at: [x, BASE_H, z],
      flat: true,
    });
  }

  // moss lumps and a lighter grass tuft cover on the stone, kept clear of the paws
  const stoneTop = (h: { n: THREE.Vector3; at: THREE.Vector3 }) =>
    h.n.y > 0.5 && stoneR(h) > 0.2 && !nearPaw(h.at.x, h.at.z);
  for (const h of stoneSkin.scatter(7, { rng: rng(5), minDist: 0.1, filter: stoneTop }))
    b.stick(new THREE.IcosahedronGeometry(0.028 + rp() * 0.018, 0), C_MOSS, h, { embed: 0.45, flat: true, bone: base });
  b.cards(stoneSkin.scatter(12, { rng: rng(6), minDist: 0.06, filter: (h) => stoneTop(h) && h.n.y > 0.6 }), BLADE, {
    size: [0.045, 0.06],
    bend: 20,
    cross: true,
    vary: 0.3,
    spin: 180,
    rng: rng(7),
    bone: base,
  });

  // grass and flowers on the ground ring
  const ringOK = (h: { n: THREE.Vector3; at: THREE.Vector3 }) => h.n.y > 0.9 && groundR(h) > 0.35 && groundR(h) < 0.41;
  b.cards(groundSkin.scatter(16, { rng: rng(8), minDist: 0.07, filter: ringOK }), BLADE, {
    size: [0.05, 0.07],
    bend: 20,
    cross: true,
    vary: 0.35,
    spin: 180,
    rng: rng(9),
    bone: base,
  });
  b.cards(
    groundSkin.scatter(5, { rng: rng(10), minDist: 0.08, filter: (h) => ringOK(h) && h.at.z > 0.1 && h.at.x < 0.1 }),
    FLOWER,
    { size: [0.045, 0.06], cross: true, vary: 0.25, spin: 180, rng: rng(12), bone: base },
  );

  // hanging vines with leaves, seated on the revised stone profile
  for (const ang of [60, -48]) {
    const a = (ang * Math.PI) / 180;
    const pt = (r: number, y: number): [number, number, number] => [Math.sin(a) * r, y, CZ + Math.cos(a) * r];
    const vinePath = catmull([pt(0.26, 0.213), pt(0.325, 0.192), pt(0.372, 0.13), pt(0.362, 0.075)]);
    b.sweep(vinePath, [0.007, 0.003], { color: "#2a6e36", bone: base, sides: 5 });
    const items: any[] = [];
    b.along(vinePath, 7, (at) => {
      items.push(at);
    });
    b.cards(items, LEAF, { size: [0.035, 0.05], lean: 55, vary: 0.25, spin: 120, rng: rng(13 + ang), bone: base });
  }

  // glowing rune on the stone front
  glow(
    b.decal(stone, RUNE, {
      at: [0, 0.125, CZ + 0.36],
      dir: [0, 0, 1],
      size: [0.2, 0.1],
      segments: 18,
      lift: 0.004,
      bone: base,
      name: "rune",
    }),
    0.7,
  );

  // dendro crystal cluster on the ring at the model's right (-x), leaning outward
  const crystal = (deg: number, rad: number, h: number, r: number) => {
    const [cx, cz] = ringXZ(deg, rad);
    const a = (deg * Math.PI) / 180;
    const c = V(cx, BASE_H - 0.004, cz);
    const d = V(Math.sin(a) * 0.3, 1, Math.cos(a) * 0.3).normalize();
    glow(
      b.part(new THREE.CylinderGeometry(r, r * 1.1, h, 6), "#35b97a", {
        bone: base,
        at: c.clone().addScaledVector(d, h / 2),
        dir: d,
        flat: true,
      }),
      0.6,
    );
    glow(
      b.part(new THREE.ConeGeometry(r, r * 2, 6), "#8fe8bc", {
        bone: base,
        at: c.clone().addScaledVector(d, h + r),
        dir: d,
        flat: true,
      }),
      1.0,
    );
  };
  crystal(-95, 0.385, 0.145, 0.03);
  crystal(-118, 0.385, 0.085, 0.022);
  crystal(-72, 0.385, 0.1, 0.024);
  const moteR = rng(41);
  for (let i = 0; i < 6; i++) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.008 + moteR() * 0.006, 0), i % 2 ? "#c8ffd8" : "#7affb0", {
        bone: base,
        at: [-0.46 + moteR() * 0.16, 0.16 + moteR() * 0.2, -0.05 + moteR() * 0.2],
        rotation: [moteR() * 90, moteR() * 90, 0],
        flat: true,
      }),
      1.0,
    );
  }

  // glowing mushrooms, front left of the model (+x), on the ring
  const mushroom = (deg: number, rad: number, h: number, r: number) => {
    const [x, z] = ringXZ(deg, rad);
    b.part(new THREE.CylinderGeometry(r * 0.2, r * 0.3, h, 6), "#f3e9d0", {
      bone: base,
      at: [x, BASE_H + h / 2 - 0.003, z],
    });
    const cap = glow(
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 1.1, r * 0.14],
          [r * 0.8, r * 0.5],
          [r * 0.35, r * 0.82],
          [0, r * 0.92],
        ],
        { at: [x, BASE_H + h - 0.004, z], segments: 8, bone: base, color: "#47c9b8" },
      ),
      0.7,
    );
    for (const hit of b.surface(cap).scatter(4, { rng: rng(Math.floor(deg) + 103), minDist: r * 0.5, filter: (q) => q.n.y > 0.35 }))
      glow(b.stick(new THREE.SphereGeometry(r * 0.15, 5, 4), "#eafffb", hit, { embed: 0.3, bone: base }), 1.0);
  };
  mushroom(38, 0.385, 0.05, 0.03);
  mushroom(62, 0.385, 0.034, 0.022);
  mushroom(18, 0.385, 0.03, 0.019);

  // a flower with a glowing heart, front right (-x)
  {
    const [fx, fz] = ringXZ(-30, 0.375);
    const top = BASE_H + 0.085;
    b.sweep(
      catmull([
        [fx, BASE_H, fz],
        [fx + 0.01, BASE_H + 0.04, fz + 0.005],
        [fx + 0.012, top, fz + 0.008],
      ]),
      0.004,
      { color: "#3a9a3a", bone: base, sides: 5 },
    );
    const petal: [number, number][] = [
      [0, 0],
      [0.012, 0.012],
      [0.028, 0.01],
      [0.037, 0],
      [0.028, -0.01],
      [0.012, -0.012],
    ];
    for (let k = 0; k < 6; k++) {
      const th = (k / 6) * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      b.extrude(petal as any, {
        at: [fx + 0.012, top, fz + 0.008],
        x: [c, 0.35, s],
        y: [-s, 0, c],
        thickness: 0.004,
        smoothing: 1,
        color: cel("#fff6fb", "#f3c3da"),
        bone: base,
      });
    }
    glow(b.part(new THREE.SphereGeometry(0.011, 6, 5), "#ffd34e", { bone: base, at: [fx + 0.012, top + 0.003, fz + 0.008] }), 0.9);
  }

  // =============================================================================================================
  // Body: compact, rounded back and fuller middle

  const bodyCoat = cel(furEdge(RUST, BELLY, { level: -0.15, teeth: 0.25, period: 0.08 }));
  const bulge = (t: number) => Math.sin(Math.PI * t);
  const body = b.sweep(
    spine,
    (t) => [0.084 + 0.032 * bulge(t) + 0.012 * t, 0.094 + 0.034 * bulge(t) + 0.012 * t],
    {
      color: bodyCoat,
      shift: (t) => [0, -0.014 + 0.006 * bulge(t)],
      name: "body",
    },
  );
  const neckTube = b.sweep(neck, [0.078, 0.07], { color: bodyCoat, name: "neckTube" });

  // shoulders and haunches: smaller, buried deeper so they read as part of the torso
  const haunches: any[] = [];
  for (const s of [1, -1]) {
    haunches.push(
      b.part(new THREE.SphereGeometry(1, 10, 8), bodyCoat, {
        bone: hips,
        at: [s * 0.066, BY - 0.02, -0.14],
        scale: [0.06, 0.078, 0.088],
        name: "haunch",
      }),
    );
    b.part(new THREE.SphereGeometry(1, 10, 8), bodyCoat, {
      bone: chest,
      at: [s * 0.063, BY - 0.016, 0.05],
      scale: [0.052, 0.065, 0.07],
      name: "shoulder",
    });
  }
  // a short tuft on each haunch
  haunches.forEach((hp, i) => {
    const s = i === 0 ? 1 : -1;
    const hit = b.surface(hp).around(V(s * 0.066, BY - 0.02, -0.14)).at(s * 90, -5);
    if (hit) b.stick(wedgeGeo(0.022, 0.016), C_RUST, hit, { embed: 0.5, flat: true, flow: [0, -0.2, -1] });
  });

  // =============================================================================================================
  // Legs: dark velvety limbs, clean boundary hidden under the body line

  const legCoat = cel(
    furEdge(RUST, LEGDARK, { by: "position", axis: [0, 1, 0], level: BY - 0.045, teeth: 0.03, period: 0.09, along: [0, 0, 1] }),
  );

  const makePaw = (tip: any, x: number, z: number, lift: number, pitch: number) => {
    const floor = floorAt(x, z + 0.03);
    const c = V(x, floor + lift + 0.0255, z + 0.025);
    const th = (pitch * Math.PI) / 180;
    b.part(new THREE.SphereGeometry(1, 8, 6), C_PAW, { bone: tip, at: c, scale: [0.042, 0.027, 0.058], rotation: [pitch, 0, 0] });
    for (const k of [-1, 0, 1]) {
      const ox = k * 0.02;
      const oz = 0.05 - Math.abs(k) * 0.007;
      let at: THREE.Vector3;
      if (lift > 0) {
        at = c.clone().add(V(ox, -0.006, oz).applyAxisAngle(V(1, 0, 0), th));
      } else {
        // planted: toe underside sits on the stone, embedded 1.5 mm
        const tx = x + ox;
        const tz = z + 0.025 + oz;
        at = V(tx, floorAt(tx, tz) + 0.0128 - 0.0015, tz);
      }
      b.part(new THREE.SphereGeometry(0.016, 6, 5), C_TOE, { bone: tip, at, scale: [1, 0.8, 1.15] });
    }
    return floor;
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // hind leg: knee forward
    const ph = s > 0 ? PAWS.hindL : PAWS.hindR;
    const hf = floorAt(ph.x, ph.z + 0.03);
    const hipP: [number, number, number] = [s * 0.075, BY - 0.015, -0.145];
    const footH: [number, number, number] = [ph.x, hf + 0.0395, ph.z];
    const hind = b.chain(`legHind${sd}`, limb(hipP, footH, [0.105, 0.105], [[0, 0, 1]]), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [footH[0], hf, footH[2] + 0.02],
    });
    b.sweep(hind, [0.054, 0.032], { color: legCoat, name: `hindLeg${sd}` });
    makePaw(hind.tip!, ph.x, ph.z, 0, 0);

    // front leg: planted with elbow back, or raised with a clearly bent elbow
    const pf = s > 0 ? PAWS.frontL : PAWS.frontR;
    const ff = floorAt(pf.x, pf.z + 0.03);
    const shP: [number, number, number] = [s * 0.078, BY - 0.015, 0.05];
    const footF: [number, number, number] = [pf.x, ff + pf.lift + 0.0395, pf.z];
    const bend: [number, number, number] = pf.lift ? [0, -0.6, -0.8] : [0, 0, -1];
    const front = b.chain(`legFront${sd}`, limb(shP, footF, [0.105, 0.105], [bend]), {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
      contact: pf.lift ? undefined : [footF[0], ff, footF[2] + 0.02],
    });
    const frontTube = b.sweep(front, [0.048, 0.03], { color: legCoat, name: `frontLeg${sd}` });
    makePaw(front.tip!, pf.x, pf.z, pf.lift, pf.pitch);
    // dark elbow tuft
    const eh = b.surface(frontTube).nearest(front.joints[1].at.clone().add(V(0, 0, -0.05)));
    b.stick(wedgeGeo(0.024, 0.017), C_LEG, eh, { embed: 0.5, flat: true, flow: [0, -0.2, -1] });
  }

  // =============================================================================================================
  // Tail: plush, banded, tapering to a rounded tip

  const tailR = (t: number) =>
    t < 0.5
      ? 0.05 + 0.022 * Math.sin((t / 0.5) * (Math.PI / 2))
      : 0.03 + 0.042 * Math.cos(((t - 0.5) / 0.5) * (Math.PI / 2));
  const tailPaint = cel(
    paint((_p, _n, s) => (Math.floor(Math.min(0.999, s[0]) * 7) % 2 === 0 ? TAIL_O : TAIL_R)),
  );
  const tailTube = b.sweep(tail, tailR, { color: tailPaint, name: "tailTube" });
  {
    // a few short tufts on the tail's outer bend only
    const hits = b.surface(tailTube).scatter(4, {
      rng: rng(21),
      minDist: 0.09,
      filter: (h) => h.at.x > 0.14 && h.n.y > 0.2,
    });
    for (const h of hits) {
      const t = tailPath.closestT(h.at);
      const band = Math.min(6, Math.floor(t * 7));
      b.stick(wedgeGeo(0.02, 0.015), band % 2 === 0 ? C_TAILO : C_TAILR, h, {
        embed: 0.5,
        flat: true,
        flow: tailPath.tangentAt(t),
      });
    }
  }

  // =============================================================================================================
  // Head

  const HC = head.local({ up: 0.03, forward: 0.07 });

  const headCoat = cel(
    paint((p) => {
      const dx = Math.abs(p.x - HC.x);
      const dy = p.y - HC.y;
      const dz = p.z - HC.z;
      if (dz > 0.02) {
        // narrow tear marking: from the eye's lower rim, down and outward
        const ax = 0.06;
        const ay = -0.022;
        const vx = 0.085 - ax;
        const vy = -0.062 - ay;
        const wx = dx - ax;
        const wy = dy - ay;
        const t = clamp01((wx * vx + wy * vy) / (vx * vx + vy * vy));
        if (Math.hypot(wx - vx * t, wy - vy * t) < 0.0085 - 0.0055 * t) return TEAR;
        // broad cream mask around each eye
        const q = Math.hypot((dx - 0.067) / 0.038, (dy - 0.012) / 0.045);
        if (q < 1) return CREAM;
        // painted cream brow arch above it
        if (q > 1.15 && q < 1.4 && dy > 0.03 && dz > 0.035) return CREAM;
      }
      // cream cheeks with a toothed top edge, connected to the eye mask
      const j = 0.014 * zigzag(p.x / 0.025 + p.z / 0.03);
      if (dx > 0.04 && dy < -0.02 + j) return CREAM;
      if (dy < -0.065) return CREAM;
      if (dz > 0.05 && dy < -0.03 && dx < 0.045) return CREAM;
      if (dy > 0.035 && dx < 0.012 && dz > -0.02) return RUST_LT;
      return HEAD_RUST;
    }),
  );

  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headCoat, {
    bone: head,
    at: HC,
    scale: [0.13, 0.1, 0.09],
    name: "skull",
  });
  const skin = b.surface(skull);

  const muzzle = b.part(new THREE.SphereGeometry(1, 10, 8), C_CREAM, {
    bone: head,
    at: head.local({ up: -0.012, forward: 0.13 }),
    scale: [0.052, 0.032, 0.034],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), cel(NOSE, "#1a0f15"), {
    bone: head,
    at: head.local({ up: 0.004, forward: 0.16 }),
    scale: [0.018, 0.013, 0.014],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.003, 4, 3), "#ffffff", {
    bone: head,
    at: head.local({ up: 0.01, forward: 0.17, left: 0.005 }),
  });
  // lower jaw (moves with the jaw joint): raised and tucked into the muzzle
  b.part(new THREE.SphereGeometry(1, 10, 8), C_CREAM, {
    bone: jaw,
    at: head.local({ up: -0.034, forward: 0.125 }),
    scale: [0.04, 0.022, 0.04],
    name: "lowerJaw",
  });

  // mouth line draped on the muzzle
  const mz = b.surface(muzzle);
  for (const s of [1, -1]) {
    const mouth = catmull([
      head.local({ up: -0.002, forward: 0.168 }),
      head.local({ up: -0.016, forward: 0.165 }),
      head.local({ left: s * 0.016, up: -0.025, forward: 0.158 }),
      head.local({ left: s * 0.034, up: -0.025, forward: 0.14 }),
    ]);
    b.sweep(mz.drape(mouth, { lift: 0.002 }), 0.0022, { color: INK, sides: 5, bone: head });
  }

  // whiskers
  for (const s of [1, -1])
    for (const k of [-1, 0, 1]) {
      b.rod(
        head.local({ left: s * 0.04, up: -0.015, forward: 0.14 }),
        head.local({ left: s * 0.14, up: -0.015 + k * 0.022, forward: 0.1 }),
        0.0012,
        "#fff6e6",
        { bone: head, sides: 4 },
      );
    }

  // eyes (anime decals, slightly smaller) with fitted lids
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 36, 4)!;
    const eyeDir: [number, number, number] = [s * 0.35, 0.05, 1];
    b.decal(skin, EYE, {
      at: hit.at,
      dir: eyeDir,
      size: [0.047, 0.058],
      mirror: s > 0,
      segments: 12,
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    b.decal(skin, LID, {
      at: hit.at.clone().add(V(0, 0.0215, 0)),
      dir: eyeDir,
      size: [0.052, 0.019],
      lift: 0.0035,
      segments: 8,
      name: `lid${s > 0 ? "L" : "R"}`,
    });
  }

  // ears: shallow rounded triangles with a cream rim, embedded in the skull
  const EAR: [number, number][] = [
    [-0.04, 0],
    [0.04, 0],
    [0, 0.088],
  ];
  const EAR_IN: [number, number][] = [
    [-0.027, 0],
    [0.027, 0],
    [0, 0.058],
  ];
  for (const s of [1, -1]) {
    const xd = V(1, -0.55 * s, 0).normalize();
    const yd = V(0.55 * s, 1, 0).normalize();
    const ear = b.extrude(EAR as any, {
      at: head.local({ left: s * 0.085, up: 0.082, forward: 0.05 }),
      x: xd,
      y: yd,
      thickness: 0.02,
      bevel: 0.005,
      smoothing: 2,
      color: C_CREAM,
      bone: head,
      name: "ear",
    });
    b.extrude(EAR_IN as any, {
      at: ear.local([0, 0.012, 0.0105]),
      x: xd,
      y: yd,
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 2,
      color: C_INNER,
      bone: head,
      name: "earInner",
    });
  }

  // cheek ruffs: thin three-tip plates facing front, rooted inside the skull, tips extend the cheek silhouette
  const CHEEK: [number, number, string?][] = [
    [-0.012, 0.028],
    [0.02, 0.03],
    [0.05, 0.016],
    [0.064, 0.0, "sharp"],
    [0.04, -0.008],
    [0.058, -0.03, "sharp"],
    [0.032, -0.03],
    [0.04, -0.056, "sharp"],
    [0.014, -0.04],
    [-0.012, -0.034],
  ];
  for (const s of [1, -1]) {
    const yd = V(0, 1, 0);
    b.extrude(CHEEK as any, {
      at: head.local({ left: s * 0.096, up: 0.0, forward: 0.07 }),
      x: perpTo(V(s, 0, 0.35), yd),
      y: yd,
      thickness: 0.011,
      bevel: 0.004,
      smoothing: 1,
      color: C_CREAM,
      bone: head,
      name: "cheekRuff",
    });
  }

  // =============================================================================================================
  // Scarf: broad folds, gold edges fitted to the band, knot seated in it, short tails and a leaf pendant

  const nk = neck.at(0.25);
  const nkSurf = b.surface(neckTube);
  const scarfCoat = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      return t > 0.3 && t < 0.62 ? TEAL_LT : TEAL;
    }),
  );
  const ringPath = nkSurf.loop(nk, { lift: 0.005 });
  b.sweep(ringPath, 0.018, { color: scarfCoat, name: "scarf" });

  const nkAt = nk.at.clone();
  const ax = nk.tangent.clone().normalize();
  const NS = 20;
  const samples: { p: THREE.Vector3; rad: THREE.Vector3 }[] = [];
  for (let i = 0; i < NS; i++) {
    const p = ringPath.at(i / NS).clone();
    const rad = p.clone().sub(nkAt);
    rad.addScaledVector(ax, -rad.dot(ax)).normalize();
    samples.push({ p, rad });
  }
  for (const o of [0.014, -0.014]) {
    const pts = samples.map(({ p, rad }) => p.clone().addScaledVector(ax, o).addScaledVector(rad, 0.0105));
    b.sweep(catmull(pts, { closed: true }), 0.0045, {
      color: C_GOLD,
      sides: 5,
      bone: neck.joints[0],
      name: "scarfEdge",
    });
  }

  // knot on the band, front-lower
  let kBest = samples[0];
  let kScore = -1e9;
  for (const smp of samples) {
    const sc = smp.rad.dot(V(0, -0.4, 1));
    if (sc > kScore) {
      kScore = sc;
      kBest = smp;
    }
  }
  const kp = kBest.p.clone().addScaledVector(kBest.rad, 0.012);
  b.part(new THREE.SphereGeometry(0.02, 8, 6), C_TEAL, {
    bone: neck.joints[0],
    at: kp,
    scale: [1.05, 0.9, 1],
    name: "scarfKnot",
  });

  // tails and pendant seated on the chest by ray hits
  const bn = b.surface([body, neckTube]);
  const chestAt = (x: number, y: number) => {
    const h = bn.ray([x, y, 0.7], [0, 0, -1]);
    return h ? h.at.clone().addScaledVector(h.n, 0.005) : V(x, y, kp.z);
  };
  const hem = cel(paint((_p, _n, s) => (s[1] < -0.032 ? GOLD : TEAL)));
  for (const s of [1, -1]) {
    const d1 = V(s * 0.14, -1, -0.22).normalize();
    const d2 = V(s * 0.35, -1, -0.3).normalize();
    const piece = (at: THREE.Vector3, d: THREE.Vector3, outline: [number, number][], name: string) => {
      const yv = d.clone().negate();
      b.extrude(outline as any, {
        at,
        x: perpTo(V(1, 0, 0), yv),
        y: yv,
        thickness: 0.007,
        bevel: 0.002,
        color: hem,
        bone: chest,
        name,
      });
    };
    piece(
      chestAt(kp.x + s * 0.016, kp.y - 0.01),
      d1,
      [
        [-0.016, 0],
        [0.016, 0],
        [0.018, -0.04],
        [-0.018, -0.04],
      ],
      "scarfTailTop",
    );
    piece(
      chestAt(kp.x + s * 0.024, kp.y - 0.05),
      d2,
      [
        [-0.018, 0],
        [0.018, 0],
        [0.02, -0.038],
        [0, -0.03],
        [-0.02, -0.038],
      ],
      "scarfTailEnd",
    );
  }

  const pBase = chestAt(kp.x, kp.y - 0.075);
  const pp = V(kp.x, kp.y - 0.075, pBase.z + 0.012);
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.008, 12), C_GOLD, { bone: chest, at: pp, dir: [0, 0, 1], name: "pendant" });
  glow(
    b.part(new THREE.CircleGeometry(0.021, 14), "#ffffff", {
      bone: chest,
      at: [pp.x, pp.y, pp.z + 0.0052],
      dir: [0, 0, 1],
      axis: "z",
      texture: EMBLEM,
      name: "emblem",
    }),
    0.7,
  );
  b.rod(kp.clone().add(V(0, -0.012, 0.01)), V(pp.x, pp.y + 0.024, pp.z), 0.002, GOLD, { bone: chest, sides: 4 });

  return b.root;
}
