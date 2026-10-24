```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  cells,
  createBuilder,
  frame,
  limb,
  mix,
  noise,
  paint,
  rng,
  smoothstep,
  svg,
  vec,
} from "agentic-3js-builder";

export const meta = {
  name: "Raven on a Skull",
  description:
    "A woodcut-print raven, wings raised and beak open, perched on a weathered human skull. Ink-black plumage cut with white gouge lines, hatched and cross-hatched bone.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: ink, paper, a single hand-tinted rust accent
const INK = "#15110f";
const INK2 = "#26221f";
const PAPER = "#eee1bf";
const PAPER_HI = "#f7edd0";
const BONE_SH = "#b3a074";
const CUT = "#dccfae";
const CUT_DIM = "#7b7566";
const RUST = "#a8391e";
const SOCKET = "#0d0a08";

const LIGHT = new THREE.Vector3(0.45, 0.8, 0.4).normalize();
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const fr = (x: number) => x - Math.floor(x);
/** 1 on integers, 0 halfway: a line of width fraction w is `tri(u) > 1 - w`. */
const tri = (u: number) => Math.abs(fr(u) - 0.5) * 2;
const RAD = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Paints (woodcut: lit areas are cut with white lines, shadowed bone is hatched with ink)

const skullInk = paint((p, n) => {
  const L = n.dot(LIGHT);
  const d = smoothstep(0.5, -0.5, L);
  const grime = noise(p, 0.06, 4);
  const base = mix(L > 0.5 ? PAPER_HI : PAPER, BONE_SH, smoothstep(0.5, 0.8, grime) * 0.55);
  if (d > 0.08) {
    const u = (p.x * 0.62 + p.y * 0.78 + p.z * 0.1) / 0.0105;
    if (tri(u) > 1 - d * 0.75) return INK;
    if (d > 0.5) {
      const u2 = (p.z * 0.7 - p.x * 0.55 + p.y * 0.35) / 0.0105;
      if (tri(u2) > 1 - (d - 0.5) * 1.3) return INK;
    }
  }
  if (noise(p, 0.013, 9) > 0.85) return mix(base, BONE_SH, 0.85);
  return base;
});

const plumage = paint((p, n) => {
  const L = n.dot(LIGHT);
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const u = ay >= ax && ay > 0.55 ? p.x + 0.35 * p.z : ax >= 0.5 ? p.y + 0.35 * p.z : p.x * 0.8 + p.y * 0.6;
  const w = smoothstep(-0.05, 0.95, L) * 0.44;
  if (w > 0.05 && tri(u / 0.0085) > 1 - w) return CUT;
  if (L > 0.2) {
    const c = cells(p, 0.024, 11);
    if (c.d2 - c.d1 < 0.06) return CUT_DIM;
  }
  return L > 0.35 ? INK2 : INK;
});

const featherInk = paint((_p, n, s) => {
  const L = n.dot(LIGHT);
  const x = s[0];
  const y = s[1];
  if (Math.abs(y) < 0.0011 && x > 0.012) return CUT;
  const w = L > 0 ? 0.2 + 0.32 * L : 0.12 * (1 + L);
  if (x > 0.02 && tri((x - 1.6 * Math.abs(y)) / 0.007) > 1 - w) return L > 0 ? CUT : CUT_DIM;
  return L > 0.45 ? INK2 : INK;
});

const legInk = paint((p, n) => {
  const L = n.dot(LIGHT);
  if (L > -0.2 && tri(p.y / 0.006) > 0.72) return CUT_DIM;
  return L > 0.3 ? INK2 : INK;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

const tuftArt = (round: boolean) =>
  svg(
    `<svg viewBox="0 0 32 64">
      <path d="${round ? "M16 2 C29 6 31 40 16 63 C1 40 3 6 16 2Z" : "M16 1 C25 16 30 42 16 63 C2 42 7 16 16 1Z"}" fill="${INK}"/>
      <path d="M16 8 L16 58" stroke="${CUT}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M16 18 L10 28 M16 18 L22 28 M16 30 L9 42 M16 30 L23 42 M16 42 L11 51 M16 42 L21 51" stroke="${CUT}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
const TUFT_A = tuftArt(false);
const TUFT_B = tuftArt(true);

const EYE = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="${INK}"/>
    <circle cx="32" cy="32" r="23" fill="none" stroke="${CUT}" stroke-width="3.5"/>
    <circle cx="32" cy="32" r="17" fill="${RUST}"/>
    <circle cx="32" cy="32" r="9.5" fill="${SOCKET}"/>
    <circle cx="26" cy="26" r="4" fill="${PAPER_HI}"/>
  </svg>`,
  { size: 128 },
);

const SIGIL = svg(
  `<svg viewBox="0 0 64 64">
    <g fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round">
      <circle cx="32" cy="32" r="9"/>
      <path d="M32 4 V16 M32 48 V60 M4 32 H16 M48 32 H60 M12 12 L20 20 M44 44 L52 52 M52 12 L44 20 M20 44 L12 52"/>
    </g>
    <circle cx="32" cy="32" r="3.4" fill="${RUST}"/>
  </svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------

function featherOutline(len: number, hw: number): Array<[number, number] | [number, number, "sharp"]> {
  return [
    [0, -hw * 0.18],
    [len * 0.1, -hw * 0.7],
    [len * 0.5, -hw],
    [len * 0.86, -hw * 0.72],
    [len * 0.98, -hw * 0.25],
    [len, 0, "sharp"],
    [len * 0.98, hw * 0.25],
    [len * 0.86, hw * 0.72],
    [len * 0.5, hw],
    [len * 0.1, hw * 0.7],
    [0, hw * 0.18],
  ];
}

export default function build() {
  const b = createBuilder({ name: "raven-on-skull", paintSize: 2048 });
  type J = ReturnType<typeof b.joint>;

  // =============================================================================================================
  // SKELETON
  const skull = b.joint("skull", { at: [0, 0.13, 0], dir: [0, 0, 1] });
  const jaw = b.joint("jaw", { parent: skull, at: [0, 0.075, -0.02], aim: [0, 0.03, 0.09], role: "jaw" });

  const hips = b.joint("hips", { parent: skull, at: [0, 0.37, -0.06], aim: [0, 0.44, 0.07], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.37, -0.06],
      [0, 0.405, 0.0],
      [0, 0.44, 0.075],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2"] },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.44, 0.075],
      [0, 0.49, 0.1],
      [0, 0.54, 0.125],
      [0, 0.57, 0.15],
    ]),
    { parent: chest, role: "neck", names: ["neck1", "neck2", "neck3"] },
  );
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 0.57, 0.15],
    aim: [0, 0.575, 0.25],
    role: "head",
  });
  const beakLower = b.joint("beakLower", {
    parent: head,
    at: [0, 0.568, 0.185],
    aim: [0, 0.548, 0.285],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.365, -0.115],
      [0, 0.33, -0.2],
      [0, 0.285, -0.28],
      [0, 0.245, -0.35],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );

  // =============================================================================================================
  // THE SKULL
  const CR = V(0, 0.15, -0.02);
  const cranium = b.part(new THREE.SphereGeometry(1, 14, 10), skullInk, {
    bone: skull,
    at: CR,
    scale: [0.092, 0.09, 0.108],
    flat: true,
    name: "cranium",
  });
  const craniumSkin = b.surface(cranium);

  b.part(new THREE.SphereGeometry(1, 10, 8), skullInk, {
    bone: skull,
    at: [0, 0.1, -0.05],
    scale: [0.068, 0.05, 0.075],
    flat: true,
    name: "occiput",
  });
  // upper jaw
  b.part(new THREE.BoxGeometry(0.082, 0.068, 0.07), skullInk, { bone: skull, at: [0, 0.092, 0.045], name: "maxillaBack" });
  b.part(new THREE.BoxGeometry(0.07, 0.06, 0.04), skullInk, { bone: skull, at: [0, 0.092, 0.095], name: "maxillaFront" });
  // nasal cavity: an inverted heart
  b.extrude(
    [
      [0, -0.013, "sharp"],
      [0.012, 0.006],
      [0.008, 0.014],
      [0, 0.008, "sharp"],
      [-0.008, 0.014],
      [-0.012, 0.006],
    ],
    { at: [0, 0.103, 0.1158], x: [1, 0, 0], thickness: 0.004, color: SOCKET, bone: skull, name: "nasal" },
  );

  const hitAt = (sk: ReturnType<typeof b.surface>, c: THREE.Vector3, az: number, el: number) => {
    const h = sk.around(c).at(az, el);
    if (!h) throw new Error(`no surface at ${az}, ${el}`);
    return h;
  };

  // eye sockets with bony rims
  for (const s of [1, -1]) {
    const h = hitAt(craniumSkin, CR, s * 33, -9);
    b.stick(new THREE.SphereGeometry(1, 8, 6), SOCKET, h, { embed: 0.35, scale: [0.021, 0.011, 0.026], flat: true });
    b.stick(new THREE.TorusGeometry(0.0265, 0.0065, 5, 10).rotateX(Math.PI / 2), skullInk, h, {
      embed: 0.3,
      scale: [1, 1, 1.15],
      flat: true,
    });
    // brow ridge
    const brow = hitAt(craniumSkin, CR, s * 30, 12);
    b.stick(new THREE.SphereGeometry(1, 8, 5), skullInk, brow, { embed: 0.3, scale: [0.03, 0.009, 0.012], flat: true });
    // cheekbone arch
    b.sweep(
      catmull([
        [s * 0.043, 0.086, 0.075],
        [s * 0.07, 0.09, 0.04],
        [s * 0.088, 0.1, 0.0],
      ]),
      0.0085,
      { bone: skull, color: skullInk, sides: 6, smooth: false },
    );
  }

  // forehead sigil
  b.decal(cranium, SIGIL, { at: hitAt(craniumSkin, CR, 0, 52), size: [0.05, 0.05], segments: 8 });

  // sutures and a crack: zigzag lines laid on the bone
  const wavy = (path: ReturnType<typeof catmull>, axis: THREE.Vector3, amp: number, count: number) =>
    catmull(
      Array.from({ length: count + 1 }, (_, i) => {
        const pt = vec(path.at(i / count));
        return pt.addScaledVector(axis, (i % 2 ? 1 : -1) * amp);
      }),
    );
  const coronal = craniumSkin.loop(V(0, 0.15, 0.0), { dir: [0, 0, 1], lift: 0.0012 });
  const coronalArc = coronal.slice(0.8, 1).concat(coronal.slice(0, 0.2));
  b.sweep(wavy(coronalArc, V(0, 0, 1), 0.003, 26), 0.0015, { bone: skull, color: INK, sides: 4 });
  const sagittal = craniumSkin.loop(V(0, 0.15, -0.02), { dir: [1, 0, 0], lift: 0.0012 });
  const sagArc = sagittal.slice(0.86, 1).concat(sagittal.slice(0, 0.2));
  b.sweep(wavy(sagArc, V(1, 0, 0), 0.0028, 26), 0.0015, { bone: skull, color: INK, sides: 4 });
  const crack = craniumSkin.drape(
    catmull([
      [-0.02, 0.238, -0.04],
      [-0.034, 0.225, -0.015],
      [-0.024, 0.208, 0.01],
      [-0.044, 0.19, 0.03],
      [-0.034, 0.17, 0.052],
      [-0.052, 0.155, 0.066],
    ]),
    { lift: 0.0012 },
  );
  b.sweep(crack, 0.0017, { bone: skull, color: INK, sides: 4 });

  // upper teeth on the skull, lower teeth and mandible on the jaw
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.0085;
    const zu = 0.108 - 0.03 * (x / 0.04) ** 2;
    const zl = 0.1 - 0.034 * (x / 0.047) ** 2;
    b.part(new THREE.BoxGeometry(0.0072, 0.018, 0.006), skullInk, { bone: skull, at: [x, 0.056, zu], name: "toothU" });
    b.part(new THREE.BoxGeometry(0.0068, 0.016, 0.0055), skullInk, { bone: jaw, at: [x, 0.03, zl], name: "toothL" });
  }
  const half: number[][] = [
    [0.078, 0.088, -0.022],
    [0.074, 0.05, -0.012],
    [0.066, 0.0125, 0.012],
    [0.047, 0.0125, 0.066],
  ];
  const mandible = [
    ...half,
    [0, 0.0125, 0.1],
    ...half
      .slice()
      .reverse()
      .map((p) => [-p[0], p[1], p[2]]),
  ];
  b.sweep(catmull(mandible), 0.0125, { bone: jaw, color: skullInk, sides: 6, smooth: false });

  // =============================================================================================================
  // THE RAVEN: body, neck, head
  const body = b.sweep(
    catmull([
      [0, 0.355, -0.14],
      [0, 0.385, -0.07],
      [0, 0.415, 0.01],
      [0, 0.445, 0.085],
    ]),
    [0.03, 0.064, 0.078, 0.058],
    { bone: [hips, spine], color: plumage },
  );
  const neckTube = b.sweep(neck, [0.05, 0.043, 0.04, 0.043], { color: plumage });

  const HC = V(0, 0.58, 0.175);
  const headPart = b.part(new THREE.SphereGeometry(1, 12, 9), plumage, {
    bone: head,
    at: HC,
    scale: [0.046, 0.043, 0.057],
    flat: true,
    name: "headShell",
  });
  const headSkin = b.surface(headPart);

  // beak: heavy, curved culmen; slimmer lower beak on its own joint
  b.sweep(bezier([0, 0.588, 0.19], [0, 0.602, 0.25], [0, 0.565, 0.308]), (t) => {
    const f = Math.pow(1 - t, 0.75);
    return [0.026 * f + 0.002, 0.023 * f + 0.002];
  }, { bone: head, color: plumage, caps: { start: "flat", end: "point" }, sides: 8 });
  b.sweep(bezier([0, 0.567, 0.185], [0, 0.55, 0.24], [0, 0.545, 0.285]), (t) => {
    const f = Math.pow(1 - t, 0.8);
    return [0.019 * f + 0.002, 0.016 * f + 0.002];
  }, { bone: beakLower, color: plumage, caps: { start: "flat", end: "point" }, sides: 8 });
  // rictal bristles over the beak base
  b.ring(frame(V(0, 0.585, 0.222), [0, 0, 1]), { count: 9, radius: 0.02, fromDeg: -120, toDeg: 120 }, (it) =>
    b.spike(it, [it.outward.x * 0.3, it.outward.y * 0.3 - 0.1, 1], 0.04, 0.004, { color: INK, bone: head }),
  );

  // eyes and brows
  for (const s of [1, -1]) {
    b.decal(headPart, EYE, { at: hitAt(headSkin, HC, s * 64, 5), size: [0.03, 0.03], segments: 8 });
    const bh = hitAt(headSkin, HC, s * 58, 32);
    b.stick(new THREE.SphereGeometry(1, 8, 5), plumage, bh, { embed: 0.3, scale: [0.02, 0.008, 0.026], flat: true });
  }

  // =============================================================================================================
  // Tail: flat base plus a wedge of feathers
  b.sweep(tail, (t) => [0.04 * (1 - t) + 0.025, 0.014], { color: plumage });

  const putFeather = (
    root: THREE.Vector3,
    dir: THREE.Vector3,
    nrm: THREE.Vector3,
    len: number,
    hw: number,
    bone: J,
    layer: number,
  ) => {
    const d = dir.clone().normalize();
    const nn = nrm.clone().addScaledVector(d, -nrm.dot(d)).normalize();
    const w = new THREE.Vector3().crossVectors(nn, d).normalize();
    return b.extrude(featherOutline(len, hw), {
      at: root.clone().addScaledVector(nn, layer * 0.0026),
      x: d.toArray(),
      y: w.toArray(),
      thickness: 0.004,
      smoothing: 1,
      color: featherInk,
      bone,
      group: "plumage",
    });
  };

  const d0 = V(0, -0.48, -0.88).normalize();
  const nT = V(0, 0.88, -0.48);
  const tailRoot = V(0, 0.365, -0.115);
  for (let k = -4; k <= 4; k++) {
    const phi = k * 6.5 * RAD;
    const d = d0.clone().multiplyScalar(Math.cos(phi)).addScaledVector(V(1, 0, 0), Math.sin(phi));
    putFeather(tailRoot, d, nT, 0.31 - 0.022 * Math.abs(k), 0.027, tail.joints[1], (k + 4) % 3);
  }
  for (let k = -2; k <= 2; k++) {
    const phi = k * 9 * RAD;
    const d = d0.clone().multiplyScalar(Math.cos(phi)).addScaledVector(V(1, 0, 0), Math.sin(phi));
    putFeather(tailRoot, d, nT, 0.13, 0.026, tail.joints[0], 4 + (k + 2) % 2);
  }

  // =============================================================================================================
  // Wings: raised and half open
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = V(s * 0.075, 0.43, 0.0);
    const el = V(s * 0.17, 0.47, -0.07);
    const wr = V(s * 0.28, 0.55, -0.01);
    const shat = wr.clone().sub(sh).normalize();
    const back = V(0, 0, -1);
    const nrm = new THREE.Vector3().crossVectors(shat, back).normalize();
    if (nrm.y < 0) nrm.negate();
    const backP = back.clone().addScaledVector(nrm, -back.dot(nrm));
    backP.addScaledVector(shat, -backP.dot(shat)).normalize();
    const dirAt = (deg: number) =>
      shat.clone().multiplyScalar(Math.cos(deg * RAD)).addScaledVector(backP, Math.sin(deg * RAD));

    const hd = wr.clone().addScaledVector(dirAt(10), 0.12);
    const armPath = catmull([sh, el, wr, hd]);
    const arm = b.chain(`arm${sd}`, armPath, {
      parent: chest,
      role: "wing",
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`],
    });
    b.sweep(arm, (t) => [0.036 * (1 - 0.5 * t) + 0.006, 0.02 * (1 - 0.4 * t) + 0.004], { color: plumage });

    const wrist = arm.joints[2];
    // primaries and their coverts
    for (let i = 0; i < 9; i++) {
      const len = i < 2 ? 0.3 : 0.3 - 0.014 * (i - 1);
      putFeather(wr.clone().addScaledVector(backP, 0.004 * i), dirAt(-8 + 7.5 * i), nrm, len, 0.024, wrist, i % 3);
    }
    for (let i = 0; i < 8; i++) {
      putFeather(
        wr.clone().addScaledVector(shat, 0.01).addScaledVector(backP, 0.004 * i),
        dirAt(-4 + 7.7 * i),
        nrm,
        0.14 - 0.004 * i,
        0.021,
        wrist,
        3 + (i % 2),
      );
    }
    // secondaries, coverts and lesser coverts along the arm
    for (let j = 0; j < 10; j++) {
      const t = 0.08 + j * 0.064;
      const root = vec(armPath.at(t));
      const bone = t < 0.31 ? arm.joints[0] : t < 0.69 ? arm.joints[1] : wrist;
      const th = 100 - 30 * (t / 0.69);
      putFeather(root, dirAt(th), nrm, 0.17 + 0.09 * (t / 0.69), 0.026, bone, j % 3);
      putFeather(root, dirAt(th), nrm, 0.12, 0.024, bone, 3 + (j % 2));
    }
    for (let j = 0; j < 8; j++) {
      const t = 0.06 + j * 0.08;
      const bone = t < 0.31 ? arm.joints[0] : t < 0.69 ? arm.joints[1] : wrist;
      putFeather(vec(armPath.at(t)), dirAt(85 - 25 * (t / 0.69)), nrm, 0.07, 0.02, bone, 5 + (j % 2));
    }
  }

  // =============================================================================================================
  // Legs and toes gripping the crown
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const g = craniumSkin.ray([s * 0.045, 0.5, 0.01], [0, -1, 0]);
    if (!g) throw new Error("foot ray missed the skull");
    const foot = g.at.clone().addScaledVector(g.n, 0.011);
    const pts = limb(V(s * 0.052, 0.355, -0.02), foot, [0.05, 0.06, 0.065], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      role: "leg",
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `foot${sd}`],
    });
    b.sweep(leg, (t) => 0.03 - 0.019 * Math.min(t / 0.67, 1), { from: 0, to: 0.7, color: plumage });
    b.sweep(leg, 0.0068, { from: 0.6, to: 1, color: legInk, sides: 6 });

    const proj = (q: THREE.Vector3) => {
      const h = craniumSkin.ray([q.x, 0.5, q.z], [0, -1, 0]);
      return h ? h.at.clone().addScaledVector(h.n, 0.0055) : q.clone();
    };
    const toes: Array<[number, number]> = [
      [-18, 0.052],
      [8, 0.06],
      [36, 0.05],
      [180, 0.036],
    ];
    toes.forEach(([a, len], i) => {
      const ang = a * RAD;
      const dir = V(s * Math.sin(ang), 0, Math.cos(ang));
      const p1 = proj(foot.clone().addScaledVector(dir, len * 0.5));
      const p2 = proj(foot.clone().addScaledVector(dir, len));
      const toe = b.chain(`toe${i + 1}${sd}`, catmull([foot.clone(), p1, p2]), {
        parent: leg.tip ?? leg.joints[leg.joints.length - 1],
        role: "digit",
        names: [`toe${i + 1}${sd}a`, `toe${i + 1}${sd}b`],
      });
      b.sweep(toe, [0.0078, 0.0045], { color: legInk, sides: 6 });
      const t = p2.clone().sub(p1).normalize();
      b.spike(p2, [t.x, t.y - 0.5, t.z], 0.022, 0.0045, { color: INK, bone: toe.joints[1] });
    });
  }

  // =============================================================================================================
  // Hackles: cards of drawn feather tufts on throat, neck and breast
  const throat = headSkin.scatter(45, {
    rng: rng(21),
    minDist: 0.014,
    filter: (h) => h.n.y < 0.15 && h.at.z > 0.14,
  });
  b.cards(throat, [TUFT_A, TUFT_B], {
    size: [0.02, 0.042],
    lean: 50,
    bend: 20,
    flow: [0, -0.4, -1],
    vary: 0.3,
    rng: rng(22),
  });
  const neckHits = b.surface(neckTube).scatter(80, { rng: rng(5), minDist: 0.018, filter: (h) => h.n.y > -0.4 });
  b.cards(neckHits, [TUFT_A, TUFT_B], {
    size: [0.032, 0.065],
    lean: 68,
    bend: 25,
    flow: [0, -0.5, -1],
    vary: 0.3,
    spin: 20,
    rng: rng(6),
  });
  const bodyHits = b.surface(body).scatter(130, { rng: rng(8), minDist: 0.026, filter: (h) => h.n.y > -0.5 });
  b.cards(bodyHits, [TUFT_A, TUFT_B, TUFT_B], {
    size: [0.04, 0.075],
    lean: 75,
    bend: 25,
    flow: [0, -0.35, -1],
    vary: 0.25,
    spin: 15,
    rng: rng(9),
  });

  // =============================================================================================================
  // Rest pose: beak and jaw slightly parted
  b.pose(jaw, { axis: [1, 0, 0], deg: 5 });
  b.pose(beakLower, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
```