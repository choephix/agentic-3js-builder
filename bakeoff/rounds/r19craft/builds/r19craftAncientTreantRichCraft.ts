import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import type { Path } from "../../../../src/path";
import { cells, mix, noise, paint, smoothstep, spots } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { interpolate } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: heavy mossy shoulders, huge root-fingered hands, a craggy bearded face with glowing amber eyes, leafy antler crown and back branches, vine belt with a glowing gem, glowing runes.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette ---------------------------------------------------------------------------------------------------------
const BARK_DARK = "#3a2415";
const BARK_MID = "#6a4426";
const BARK_LIGHT = "#a2713c";
const BARK_HIGH = "#d29a52";
const BARK_FISSURE = "#1f120c";
const BARK_SHADOW = "#2b1a24";
const MUD = "#4a3a22";
const MOSS_DARK = "#2f6320";
const MOSS = "#62a52c";
const MOSS_LIGHT = "#a8d94a";
const MOSS_SHADOW = "#1f4a28";
const LEAF_DARK = "#2a6e24";
const LEAF = "#4aa22c";
const LEAF_LIGHT = "#9bd447";
const LEAF_GOLD = "#e3b02a";
const LEAF_SHADOW = "#1c4a2a";
const VINE = "#4f7a2a";
const VINE_DARK = "#2e4f1c";
const AMBER = "#ffc43a";
const WOOD_CUT = "#e2bb7e";
const IVORY = "#ecd6a4";
const MOUTH = "#1a0d0a";
const CREAM = "#f4e6c4";
const EAR_LEAF = "#58b030";

const prof = (ys: number[]) => {
  const xs = ys.map((_, i) => i / (ys.length - 1));
  return (t: number) => interpolate(xs, ys, t);
};

const ell = (rx: number[], ry: number[]) => {
  const fx = prof(rx);
  const fy = prof(ry);
  return (t: number): [number, number] => [fx(t), fy(t)];
};

/** Points spiralling round a path: vines, wraps. */
function helix(path: Path, rad: (t: number) => number, turns: number, phase: number, from: number, to: number, steps = 26) {
  const pts: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = from + (to - from) * (i / steps);
    const c = path.at(t);
    const T = path.tangentAt(t);
    let u = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 0, 1));
    if (u.lengthSq() < 1e-4) u = new THREE.Vector3().crossVectors(T, new THREE.Vector3(1, 0, 0));
    u.normalize();
    const v = new THREE.Vector3().crossVectors(T, u);
    const a = phase + turns * Math.PI * 2 * (i / steps);
    const p = c.clone().addScaledVector(u, Math.cos(a) * rad(t)).addScaledVector(v, Math.sin(a) * rad(t));
    pts.push([p.x, p.y, p.z]);
  }
  return pts;
}

const P3 = (v: THREE.Vector3) => [v.x, v.y, v.z];

export default function build() {
  const b = createBuilder({ name: "ancientTreant", paintSize: 2048 });
  const R = rng(11);

  // Paints ----------------------------------------------------------------------------------------------------------
  const bark = (seed: number) =>
    paint((p, n) => {
      const q = new THREE.Vector3(p.x * 2.4, p.y * 0.6, p.z * 2.4);
      const c = cells(q, 0.34, seed);
      const seam = c.d2 - c.d1;
      const lum = noise(q, 0.3, seed + 5);
      let col: Rgb = mix(BARK_DARK, BARK_MID, smoothstep(0.25, 0.7, lum));
      col = mix(col, BARK_LIGHT, 0.55 * smoothstep(0.6, 0.95, c.id) * smoothstep(0.12, 0.4, seam));
      col = mix(BARK_FISSURE, col, smoothstep(0.04, 0.16, seam));
      col = mix(col, BARK_HIGH, 0.5 * smoothstep(0.3, 0.95, n.y) * smoothstep(0.08, 0.3, seam));
      if (seam < 0.05 && c.id > 0.93) col = mix(col, "#e8a838", 0.7);
      const mossAmt =
        smoothstep(0.45, 0.85, n.y) * smoothstep(0.42, 0.6, noise(p, 0.3, seed + 9)) * (0.5 + 0.5 * smoothstep(1, 3, p.y));
      const mossCol = mix(MOSS_DARK, MOSS, noise(p, 0.09, seed + 11));
      col = mix(col, mossCol, mossAmt);
      col = mix(col, MUD, 0.65 * smoothstep(0.45, 0, p.y));
      return mix(col, BARK_SHADOW, 0.55 * smoothstep(0.05, -0.85, n.y));
    });
  const BARK = bark(3);

  const MOSSP = paint((p, n) => {
    let c: Rgb = mix(MOSS_DARK, MOSS, smoothstep(0.3, 0.7, noise(p, 0.14, 3)));
    c = mix(c, MOSS_LIGHT, 0.6 * smoothstep(0.5, 1, n.y) * smoothstep(0.45, 0.75, noise(p, 0.07, 8)));
    return mix(c, MOSS_SHADOW, 0.5 * smoothstep(0, -0.8, n.y));
  });

  const LEAFP = paint((p, n) => {
    let c: Rgb = mix(LEAF_DARK, LEAF, smoothstep(0.25, 0.75, noise(p, 0.22, 21)));
    c = mix(c, LEAF_LIGHT, 0.8 * smoothstep(0.2, 0.95, n.y));
    c = mix(c, LEAF_GOLD, 0.5 * smoothstep(0.7, 0.85, noise(p, 0.3, 40)) * smoothstep(0, 0.6, n.y));
    return mix(c, LEAF_SHADOW, 0.6 * smoothstep(0, -0.9, n.y));
  });

  const CAPP = spots("#e2402a", "#fff1d0", { size: 0.06, amount: 0.6, seed: 4 });

  // Textures ---------------------------------------------------------------------------------------------------------
  const leafTex = (body: string, vein: string, edge: string) =>
    svg(
      `<svg viewBox="0 0 48 64">
      <path d="M24 63 C3 46 3 16 24 1 C45 16 45 46 24 63Z" fill="${body}" stroke="${edge}" stroke-width="2"/>
      <path d="M24 62 L24 10" stroke="${vein}" stroke-width="2" fill="none"/>
      <path d="M24 46 L12 34 M24 36 L36 25 M24 28 L14 19 M24 48 L36 37" stroke="${vein}" stroke-width="1.7" fill="none"/>
    </svg>`,
      { size: 128 },
    );
  const LEAVES = [
    leafTex("#3f9a2c", "#9be04a", "#1f5a1c"),
    leafTex("#5cbb34", "#c5ef6a", "#2c7a22"),
    leafTex("#7ab52e", "#d6f27a", "#3a7a1a"),
    leafTex("#e0a020", "#ffe27a", "#8a5a10"),
  ];
  const TUFT = svg(
    `<svg viewBox="0 0 32 40">
      <path d="M16 40 C15 26 9 16 5 3 C13 12 17 24 20 40Z" fill="#4f9a2a"/>
      <path d="M12 40 C12 30 6 24 1 18 C9 22 14 30 16 40Z" fill="#2f6a20"/>
      <path d="M18 40 C20 26 24 14 29 5 C28 16 25 30 23 40Z" fill="#7cc23a"/>
      <path d="M15 40 C17 30 17 20 16 9 C20 20 21 30 20 40Z" fill="#9bd447"/>
    </svg>`,
    { size: 128 },
  );
  const HANG = svg(
    `<svg viewBox="0 0 24 80">
      <path d="M12 80 C6 60 18 40 11 24 C8 14 12 6 12 0" fill="none" stroke="#2f5a1e" stroke-width="7" stroke-linecap="round"/>
      <path d="M12 80 C6 60 18 40 11 24 C8 14 12 6 12 0" fill="none" stroke="#8cc63f" stroke-width="3.6" stroke-linecap="round"/>
      <ellipse cx="5" cy="62" rx="5" ry="3" fill="#6fb232" transform="rotate(-30 5 62)"/>
      <ellipse cx="19" cy="44" rx="5" ry="3" fill="#a8d86a" transform="rotate(30 19 44)"/>
      <ellipse cx="5" cy="28" rx="4.5" ry="2.8" fill="#6fb232" transform="rotate(-30 5 28)"/>
    </svg>`,
    { size: 160 },
  );
  const flowerTex = (petal: string, centre: string) =>
    svg(
      `<svg viewBox="0 0 32 32"><g fill="${petal}" stroke="#6b2a44" stroke-width="1.2">${[0, 72, 144, 216, 288]
        .map((a) => `<ellipse cx="16" cy="8" rx="5" ry="7" transform="rotate(${a} 16 16)"/>`)
        .join("")}</g><circle cx="16" cy="16" r="4" fill="${centre}"/></svg>`,
      { size: 96 },
    );
  const FLOWERS = [flowerTex("#ff8fb4", "#ffe27a"), flowerTex("#fff4dc", "#f0a020"), flowerTex("#b9a0ff", "#ffe27a")];
  const RUNE = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#b4ffa0" stroke-width="2.6"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#5fe04e" stroke-width="2"/>
      <path d="M32 12 L32 52 M32 19 L45 32 L32 45 L19 32 Z M21 21 L43 43 M43 21 L21 43" fill="none" stroke="#b4ffa0" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M32 3 L32 8 M32 56 L32 61 M3 32 L8 32 M56 32 L61 32" stroke="#b4ffa0" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="3.4" fill="#e8ffd8"/>
    </svg>`,
    { size: 192 },
  );

  // Skeleton ---------------------------------------------------------------------------------------------------------
  const pelvis = b.joint("pelvis", { at: [0, 1.75, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.75, 0],
      [0, 2.2, 0.0],
      [0, 2.7, 0.08],
      [0, 3.1, 0.14],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[3];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 3.05, 0.12],
      [0, 3.35, 0.22],
      [0, 3.58, 0.34],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.55, 0.3], aim: [0, 3.42, 0.8], role: "jaw" });

  const hp = (x: number, y: number, z: number) => [x, 3.75 + y, 0.42 + z];

  // Torso ------------------------------------------------------------------------------------------------------------
  const torso = b.sweep(spine, ell([0.56, 0.5, 0.62, 0.8, 0.78], [0.46, 0.44, 0.5, 0.56, 0.5]), {
    color: BARK,
    sides: 10,
    caps: { start: "round", end: "flat" },
  });
  const torsoSkin = b.surface(torso);
  b.part(new THREE.SphereGeometry(1, 10, 7), BARK, { bone: chest, at: [0, 3.08, 0.08], scale: [0.72, 0.34, 0.46] });

  // Back ridge spikes
  b.along(torso, 5, (at) => {
    b.spike(at, at, 0.3, 0.075, { color: BARK_LIGHT });
  });

  // Burls on the trunk
  for (const h of torsoSkin.scatter(16, { rng: R, minDist: 0.3, filter: (k) => k.at.y > 1.8 && k.n.y > -0.4 }))
    b.stick(new THREE.SphereGeometry(0.1 + R() * 0.07, 6, 5), BARK, h, { embed: 0.45, scale: [1, 0.7, 1] });

  // Broken branch stubs on the trunk
  for (const h of torsoSkin.scatter(8, { rng: R, minDist: 0.4, filter: (k) => k.n.z < 0.2 && k.at.y > 2 })) {
    const sh = 0.2 + R() * 0.12;
    b.stick(new THREE.CylinderGeometry(0.05, 0.08, sh, 7), BARK, h, { embed: 0.2 });
    b.stick(new THREE.CylinderGeometry(0.052, 0.052, 0.014, 7), WOOD_CUT, h.moved([0, sh * 0.8, 0]), { embed: 0.5 });
  }

  // Growth ridges round the belly
  for (const y of [2.05, 2.45]) {
    const ring = torsoSkin.loop([0, y, 0.1], { lift: 0.0 });
    b.sweep(ring, 0.04, { color: BARK_FISSURE });
  }

  // Carved pectoral ridges
  for (const s of [1, -1]) {
    const outline = catmull(
      [
        [s * 0.07, 3.0, 1.2],
        [s * 0.45, 3.05, 1.1],
        [s * 0.62, 2.82, 0.9],
        [s * 0.5, 2.5, 1.1],
        [s * 0.2, 2.42, 1.2],
      ],
      { closed: true },
    );
    b.sweep(torsoSkin.drape(outline, { lift: 0.012 }), 0.035, { color: BARK_LIGHT });
  }

  // Vine belt with gem buckle
  const belt = torsoSkin.loop(spine.joints[1], { lift: 0.035 });
  b.sweep(belt, 0.06, { color: VINE });
  b.sweep(torsoSkin.loop([0, 2.07, 0.1], { lift: 0.03 }), 0.035, { color: VINE_DARK });
  const gemHit = torsoSkin.nearest([0, 2.2, 3]);
  b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.06, 6), "#7a5226", {
    at: gemHit.moved([0, 0.05, 0]),
    dir: gemHit.axis,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.1), AMBER, {
      at: gemHit.moved([0, 0.1, 0]),
      dir: gemHit.axis,
      scale: [1, 1.3, 0.7],
    }),
    1.8,
  );
  const beltFrames = b.along(belt, 16, () => {});
  b.cards(
    beltFrames.map((f) => frame(f, [0, 1, 0])),
    HANG,
    { size: [0.12, 0.4], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R },
  );

  // Diagonal vine bandolier
  const strap = catmull(
    [
      [0.75, 3.35, 0.15],
      [0.2, 2.85, 0.62],
      [-0.55, 2.25, 0.45],
      [-0.8, 2.05, -0.05],
      [-0.3, 2.5, -0.55],
      [0.4, 3.0, -0.5],
    ],
    { closed: true },
  );
  b.sweep(torsoSkin.drape(strap, { lift: 0.03 }), 0.05, { color: VINE });

  // Glowing chest rune
  const runeHit = torsoSkin.nearest([0, 2.78, 1.6]);
  glow(b.decal(torso, RUNE, { at: runeHit, size: [0.46, 0.46] }), 1.4);

  // Legs and feet ---------------------------------------------------------------------------------------------------
  const legR = prof([0.42, 0.38, 0.31, 0.3, 0.27]);
  const legSurfaces: ReturnType<typeof b.surface>[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ax = s * 0.55;
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.52, 1.8, 0],
        [s * 0.58, 1.05, 0.1],
        [ax, 0.34, 0.02],
      ]),
      { parent: pelvis, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    const ankle = leg.joints[2];
    const knee = leg.joints[1];
    const legSweep = b.sweep(leg, legR, { color: BARK });
    const legSkin = b.surface(legSweep);
    legSurfaces.push(legSkin);

    b.part(new THREE.SphereGeometry(0.27, 8, 6), BARK, { bone: knee, at: [s * 0.58, 1.05, 0.28], scale: [1, 0.9, 0.8] });
    b.part(new THREE.SphereGeometry(0.3, 8, 6), BARK, { bone: ankle, at: [ax, 0.18, 0.1], scale: [1.15, 0.55, 1.5] });

    // Wraps
    for (const t of [0.42, 0.88]) {
      const cp = leg.at(t);
      b.sweep(legSkin.loop(cp, { lift: 0.025 }), 0.05, { color: t < 0.5 ? VINE_DARK : VINE });
    }

    // Toes
    [-0.34, 0, 0.34].forEach((off, i) => {
      const P0 = [ax, 0.32, 0.12];
      const P1 = [ax + off * 0.55, 0.17, 0.5];
      const P2 = [ax + off * 1.0, 0.06, 0.92 - Math.abs(off) * 0.6];
      const toe = b.chain(`toe${S}${i + 1}`, catmull([P0, P1, P2]), {
        parent: ankle,
        names: [`toe${S}${i + 1}a`, `toe${S}${i + 1}b`, `toe${S}${i + 1}c`],
        role: "digit",
      });
      b.sweep(toe, [0.14, 0.05], { color: BARK, caps: { end: "point" } });
      b.part(new THREE.SphereGeometry(0.1, 6, 5), BARK, { bone: toe.joints[1], at: P1 });
      b.spike(P2, [off * 0.2, -0.03, 1], 0.15, 0.04, { color: IVORY, bone: toe.joints[2] });
    });
    // Heel root
    b.sweep(
      catmull([
        [ax, 0.3, -0.05],
        [ax, 0.15, -0.3],
        [ax, 0.07, -0.55],
      ]),
      [0.13, 0.04],
      { bone: ankle, color: BARK, caps: { end: "point" } },
    );
    // Sole
    b.part(new THREE.SphereGeometry(1, 8, 6), BARK, { bone: ankle, at: [ax, 0.14, 0.12], scale: [0.36, 0.16, 0.5] });
    // Root tendrils spreading over the ground
    const dirs: number[][] = [
      [s * 1, 0.35],
      [s * 0.85, -0.45],
      [s * 0.3, -1],
      [-s * 0.35, -0.9],
    ];
    for (const [dx, dz] of dirs) {
      const l = Math.hypot(dx, dz);
      const ux = dx / l;
      const uz = dz / l;
      b.sweep(
        catmull([
          [ax + ux * 0.2, 0.12, 0.05 + uz * 0.2],
          [ax + ux * 0.6 + uz * 0.05, 0.08, 0.05 + uz * 0.6 - ux * 0.05],
          [ax + ux * 1.05, 0.05, 0.05 + uz * 1.05],
        ]),
        [0.065, 0.012],
        { bone: ankle, color: BARK, caps: { end: "point" } },
      );
    }
    // Vine wrapping the leg
    const lv = b.sweep(
      catmull(helix(leg.path, (t) => legR(t) + 0.02, 1.7, s * 0.8, 0.12, 0.92)),
      0.03,
      { bone: leg, color: VINE },
    );
    b.cards(
      [0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((t, i) => lv.at(t, i * 110)),
      LEAVES,
      { size: [0.1, 0.14], lean: 40, vary: 0.3, rng: R },
    );
    // Shelf fungus on the thigh
    const fh = legSkin.nearest([s * 1.4, 1.35, 0.1]);
    const nn = fh.n;
    const yaw = (Math.atan2(-nn.z, nn.x) * 180) / Math.PI;
    b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 10, 1, false, 0, Math.PI), "#e0912a", {
      at: fh.moved([0, -0.05, 0]),
      rotation: [0, yaw, 0],
    });
    b.part(new THREE.CylinderGeometry(0.14, 0.15, 0.05, 10, 1, false, 0, Math.PI), "#c46a1c", {
      at: fh.moved([0, 0.0, 0]).moved([0, 0.06, 0]),
      rotation: [0, yaw, 0],
    });
  }

  // Shoulders, arms, hands --------------------------------------------------------------------------------------------
  const armR = prof([0.3, 0.28, 0.3, 0.34, 0.24]);
  const mossParts: ReturnType<typeof b.part>[] = [];
  const vineLeafFrames: ReturnType<ReturnType<typeof b.sweep>["at"]>[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = [s * 1.0, 3.0, 0.0];
    const el = [s * 1.55, 2.1, 0.1];
    const wr = [s * 1.85, 1.25, 0.25];
    const arm = b.chain(`arm${S}`, catmull([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    const armSweep = b.sweep(arm, armR, { color: BARK });
    const armSkin = b.surface(armSweep);

    // Heavy mossy shoulder pad
    const pad = b.part(new THREE.SphereGeometry(0.5, 10, 7), BARK, {
      bone: shoulder,
      at: [s * 0.98, 3.0, 0],
      scale: [1.1, 0.9, 1.0],
    });
    mossParts.push(
      b.part(new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), MOSSP, {
        bone: shoulder,
        at: [s * 0.98, 3.12, 0],
        scale: [1.12, 0.72, 1.02],
      }),
    );
    for (const h of b.surface(pad).scatter(5, { rng: R, minDist: 0.3, filter: (k) => k.n.y > 0.1 && Math.abs(k.n.x * s) > 0.3 }))
      b.stick(new THREE.ConeGeometry(0.1, 0.4, 6), BARK_LIGHT, h, { embed: 0.15 });
    // Elbow knuckle
    b.part(new THREE.SphereGeometry(0.3, 8, 6), BARK, { bone: elbow, at: el, scale: [1, 1, 1] });
    b.spike(el, [s * 1, -0.2, -0.6], 0.35, 0.09, { color: BARK_LIGHT, bone: elbow });

    // Cuffs
    for (const t of [0.58, 0.9]) {
      const cp = arm.at(t);
      b.sweep(armSkin.loop(cp, { lift: 0.03 }), 0.055, { color: t < 0.7 ? VINE_DARK : VINE });
    }
    // Rune on the forearm
    const cp = arm.at(0.72);
    const rh = armSkin.nearest(cp.at.clone().add(new THREE.Vector3(s * 0.6, 0, 0)));
    glow(b.decal(armSweep, RUNE, { at: rh, size: [0.26, 0.26] }), 1.3);

    // Vine wrapping the arm
    const av = b.sweep(
      catmull(helix(arm.path, (t) => armR(t) + 0.02, 2.2, s * 0.5, 0.15, 0.92)),
      0.03,
      { bone: arm, color: VINE },
    );
    for (const t of [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92]) vineLeafFrames.push(av.at(t, t * 700));

    // Hand
    const d = arm.path.tangentAt(1).clone().normalize();
    const palmC = new THREE.Vector3(wr[0], wr[1], wr[2]).addScaledVector(d, 0.22);
    const wv = new THREE.Vector3(wr[0], wr[1], wr[2]);
    b.part(new THREE.SphereGeometry(1, 9, 7), BARK, {
      bone: wrist,
      at: P3(palmC),
      dir: d,
      scale: [0.25, 0.3, 0.15],
    });
    const lens = [0.95, 1.1, 1.0, 0.8];
    lens.forEach((len, i) => {
      const off = -s * (0.15 - 0.1 * i);
      const base = wv.clone().addScaledVector(d, 0.38).add(new THREE.Vector3(off, 0, 0));
      const q0 = P3(base);
      const q1 = P3(base.clone().addScaledVector(d, 0.3 * len).add(new THREE.Vector3(off * 0.6, 0, 0.04)));
      const q2 = P3(base.clone().addScaledVector(d, 0.55 * len).add(new THREE.Vector3(off * 1.2, 0, 0.16)));
      const f = b.chain(`finger${S}${i + 1}`, catmull([q0, q1, q2]), {
        parent: wrist,
        names: [`finger${S}${i + 1}a`, `finger${S}${i + 1}b`, `finger${S}${i + 1}c`],
        role: "digit",
      });
      b.sweep(f, [0.085, 0.03], { color: BARK, caps: { end: "point" } });
      b.part(new THREE.SphereGeometry(0.075, 6, 5), BARK, { bone: f.joints[1], at: q1 });
      b.spike(q2, [off * 0.4, -0.9, 0.3], 0.1, 0.028, { color: IVORY, bone: f.joints[2] });
    });
    {
      const base = wv.clone().addScaledVector(d, 0.2).add(new THREE.Vector3(-s * 0.2, 0, 0.08));
      const q0 = P3(base);
      const q1 = P3(base.clone().addScaledVector(d, 0.18).add(new THREE.Vector3(-s * 0.12, 0, 0.12)));
      const q2 = P3(base.clone().addScaledVector(d, 0.32).add(new THREE.Vector3(-s * 0.2, 0, 0.26)));
      const th = b.chain(`thumb${S}`, catmull([q0, q1, q2]), {
        parent: wrist,
        names: [`thumb${S}a`, `thumb${S}b`, `thumb${S}c`],
        role: "digit",
      });
      b.sweep(th, [0.1, 0.035], { color: BARK, caps: { end: "point" } });
      b.spike(q2, [-s * 0.3, -0.7, 0.6], 0.1, 0.03, { color: IVORY, bone: th.joints[2] });
    }

    // Fungus cluster on the upper arm
    for (const h of armSkin.scatter(3, { rng: R, minDist: 0.2, filter: (k) => k.n.y > 0.35 && k.at.y > 1.9 })) {
      const mh = 0.1 + R() * 0.08;
      const mr = 0.08 + R() * 0.05;
      b.stick(new THREE.CylinderGeometry(mr * 0.35, mr * 0.45, mh, 6), CREAM, h, { embed: 0.3 });
      b.stick(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CAPP, h.moved([0, mh * 0.7, 0]), {
        embed: 0.1,
        scale: [mr, mr * 0.6, mr],
      });
    }
  }

  // Neck -------------------------------------------------------------------------------------------------------------
  b.sweep(neck, [0.34, 0.3], { color: BARK });

  // Head ---------------------------------------------------------------------------------------------------------------
  b.part(new THREE.SphereGeometry(1, 11, 8), BARK, { bone: head, at: hp(0, 0.08, -0.02), scale: [0.44, 0.44, 0.44] });
  b.frustumBox(hp(0, -0.02, 0.2), hp(0, -0.1, 0.5), [0.62, 0.4], [0.46, 0.26], { bone: head, color: BARK });
  mossParts.push(
    b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), MOSSP, {
      bone: head,
      at: hp(0, 0.28, -0.04),
      scale: [0.45, 0.3, 0.44],
    }),
  );
  // Nose
  b.sweep(catmull([hp(0, 0.14, 0.42), hp(0, 0.0, 0.58), hp(0, -0.1, 0.62)]), [0.1, 0.07], {
    bone: head,
    color: BARK,
    caps: { end: "round" },
  });
  // Mouth cavity, fangs, jaw
  b.part(new THREE.BoxGeometry(0.4, 0.1, 0.34), MOUTH, { bone: head, at: hp(0, -0.18, 0.36) });
  b.frustumBox(hp(0, -0.26, 0.05), hp(0, -0.3, 0.5), [0.56, 0.17], [0.36, 0.16], { bone: jaw, color: BARK });
  b.part(new THREE.SphereGeometry(0.13, 8, 6), BARK, { bone: jaw, at: hp(0, -0.3, 0.52) });
  for (const s of [1, -1]) {
    // Cheeks, sockets, eyes, brows
    b.part(new THREE.SphereGeometry(0.14, 7, 6), BARK, { bone: head, at: hp(s * 0.3, -0.06, 0.3), scale: [1, 0.9, 1] });
    b.part(new THREE.SphereGeometry(0.105, 8, 6), "#1b0f0a", { bone: head, at: hp(s * 0.19, 0.1, 0.38) });
    glow(
      b.part(new THREE.SphereGeometry(0.062, 8, 6), AMBER, {
        bone: head,
        at: hp(s * 0.19, 0.1, 0.44),
        scale: [1, 0.85, 0.7],
      }),
      1.8,
    );
    b.part(new THREE.BoxGeometry(0.02, 0.075, 0.02), "#2a1204", { bone: head, at: hp(s * 0.19, 0.1, 0.492) });
    b.capsule(hp(s * 0.4, 0.24, 0.28), hp(s * 0.07, 0.17, 0.44), 0.08, BARK, { bone: head });
    b.capsule(hp(s * 0.38, 0.29, 0.28), hp(s * 0.1, 0.22, 0.42), 0.035, MOSS, { bone: head });
    // Nostrils
    b.part(new THREE.SphereGeometry(0.045, 6, 5), BARK, { bone: head, at: hp(s * 0.07, -0.1, 0.58) });
    // Tusks and fangs
    b.spike(hp(s * 0.2, -0.2, 0.46), [0, 1, 0.15], 0.2, 0.045, { color: IVORY, bone: jaw });
    b.spike(hp(s * 0.09, -0.12, 0.52), [0, -1, 0], 0.1, 0.03, { color: IVORY, bone: head });
    // Ears
    const ear: OutlinePoint[] = [
      [0, -0.1],
      [0.14, -0.18],
      [0.38, 0.04, "sharp"],
      [0.16, 0.22],
      [0, 0.12],
    ];
    b.extrude(ear, {
      at: hp(s * 0.4, 0.1, -0.02),
      x: [s, 0, -0.35],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 1,
      color: EAR_LEAF,
      bone: head,
    });
  }

  // Beard of root strands and lichen
  const strandFrames: ReturnType<ReturnType<typeof b.sweep>["at"]>[] = [];
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.075;
    const len = 0.45 + 0.3 * (1 - Math.abs(i - 3) / 3);
    const strand = b.sweep(
      catmull([
        hp(x, -0.32, 0.5),
        hp(x * 1.3, -0.55, 0.52),
        hp(x * 1.6, -0.75 - len * 0.4, 0.46),
        hp(x * 1.9, -0.95 - len, 0.4),
      ]),
      [0.05, 0.012],
      { bone: jaw, color: i % 2 ? VINE : MOSS_DARK, caps: { end: "point" } },
    );
    for (const t of [0.3, 0.55, 0.8]) strandFrames.push(strand.at(t, 0));
  }
  b.cards(
    strandFrames.map((f) => frame(f, [0, 1, 0])),
    HANG,
    { size: [0.1, 0.28], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R },
  );
  // Whisker roots
  for (const s of [1, -1]) {
    b.sweep(
      catmull([hp(s * 0.1, -0.1, 0.58), hp(s * 0.3, -0.2, 0.56), hp(s * 0.42, -0.45, 0.42), hp(s * 0.38, -0.8, 0.34)]),
      [0.04, 0.01],
      { bone: head, color: MOSS, caps: { end: "point" } },
    );
  }
  // Mane of roots down the back of the head
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.12;
    b.sweep(
      catmull([hp(x, 0.3, -0.3), hp(x * 1.3, 0.05, -0.5), hp(x * 1.5, -0.3, -0.55), hp(x * 1.6, -0.6, -0.45)]),
      [0.05, 0.012],
      { bone: head, color: i % 2 ? MOSS_DARK : VINE, caps: { end: "point" } },
    );
  }

  // Foliage -------------------------------------------------------------------------------------------------------------
  const puffs: ReturnType<typeof b.part>[] = [];
  const puff = (bone: Joint, c: number[], r: number) => {
    const offs = [
      [0, 0, 0],
      [r * 0.7, -r * 0.15, r * 0.3],
      [-r * 0.6, -r * 0.1, -r * 0.35],
    ];
    offs.forEach(([ox, oy, oz], i) =>
      puffs.push(
        b.part(new THREE.IcosahedronGeometry(r * (i === 0 ? 1 : 0.68), 1), LEAFP, {
          bone,
          at: [c[0] + ox, c[1] + oy, c[2] + oz],
          rotation: [R() * 90, R() * 90, 0],
          flat: true,
        }),
      ),
    );
  };
  const twig = (bone: Joint, pts: number[][], r: number) =>
    b.sweep(catmull(pts), [r, 0.012], { bone, color: BARK, caps: { end: "point" } });

  // Antlers
  for (const s of [1, -1]) {
    const pts = [hp(s * 0.2, 0.34, -0.05), hp(s * 0.42, 0.55, -0.1), hp(s * 0.58, 0.8, -0.08), hp(s * 0.48, 1.0, -0.12)];
    const ap = catmull(pts);
    b.sweep(ap, [0.08, 0.02], { bone: head, color: BARK, caps: { end: "point" } });
    puff(head, pts[3], 0.2);
    [0.4, 0.7].forEach((t, k) => {
      const p = ap.at(t);
      const tip = [p.x + s * 0.25, p.y + 0.22, p.z + (k ? 0.12 : -0.12)];
      twig(head, [P3(p), [p.x + s * 0.12, p.y + 0.1, p.z], tip], 0.04);
      puff(head, tip, 0.14);
    });
  }

  // Back branches
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const br = b.chain(
      `branch${S}`,
      catmull([
        [s * 0.5, 3.0, -0.3],
        [s * 0.72, 3.55, -0.5],
        [s * 1.1, 4.0, -0.5],
        [s * 1.35, 4.4, -0.3],
      ]),
      { parent: chest, names: [`branch${S}1`, `branch${S}2`, `branch${S}3`, `branch${S}4`], role: "tentacle" },
    );
    b.sweep(br, [0.2, 0.07], { color: BARK, caps: { end: "point" } });
    [0.35, 0.6, 0.85].forEach((t, k) => {
      const p = br.path.at(t);
      const tip = [p.x + s * 0.6, p.y + 0.42, p.z + (k - 1) * 0.15];
      twig(br.jointAt(t), [P3(p), [p.x + s * 0.28, p.y + 0.2, p.z - 0.05 * k], tip], 0.07);
      puff(br.jointAt(t), tip, 0.27);
    });
    const end = br.path.at(1);
    puff(br.joints[3], [end.x + s * 0.1, end.y + 0.1, end.z], 0.5);
  }

  // Leaf cards over the canopy
  const leafHits = b.surface(puffs).scatter(420, { rng: R, minDist: 0.07 });
  b.cards(leafHits, LEAVES, { size: [0.16, 0.22], lean: 55, bend: 25, vary: 0.3, spin: 180, rng: R });
  b.cards(vineLeafFrames, LEAVES, { size: [0.1, 0.14], lean: 40, vary: 0.3, rng: R });

  // Moss, flowers and mushrooms on the upper surfaces
  const mossSkin = b.surface(mossParts);
  b.cards(mossSkin.scatter(150, { rng: R, minDist: 0.07, filter: (k) => k.n.y > 0.4 }), TUFT, {
    size: [0.09, 0.13],
    lean: 15,
    bend: 20,
    vary: 0.4,
    spin: 180,
    cross: true,
    rng: R,
  });
  b.cards(mossSkin.scatter(16, { rng: R, minDist: 0.18, filter: (k) => k.n.y > 0.5 }), FLOWERS, {
    size: 0.09,
    vary: 0.3,
    cross: true,
    rng: R,
  });
  for (const h of mossSkin.scatter(7, { rng: R, minDist: 0.3, filter: (k) => k.n.y > 0.5 })) {
    const mh = 0.1 + R() * 0.1;
    const mr = 0.07 + R() * 0.06;
    b.stick(new THREE.CylinderGeometry(mr * 0.35, mr * 0.45, mh, 6), CREAM, h, { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CAPP, h.moved([0, mh * 0.7, 0]), {
      embed: 0.1,
      scale: [mr, mr * 0.6, mr],
    });
  }

  return b.root;
}
