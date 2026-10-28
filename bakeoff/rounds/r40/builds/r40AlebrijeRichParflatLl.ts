import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull } from "../../../../src/index";

export const meta = {
  "name": "Alebrije Jaguar-Eagle",
  "description": "A Oaxacan alebrije painted-wood fantasy beast: jaguar body and legs with an eagle's head, hooked beak and folded-open feathered wings, covered in dotted, striped and flowered folk-art patterns."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  jaguarGold: "#f2b01e",
  rosetteBlack: "#1a1020",
  bellyCream: "#fff0c2",
  magenta: "#d81b78",
  turquoise: "#10b5b0",
  deepBlue: "#2a3fa8",
  orange: "#f26a1b",
  red: "#d62a2a",
  leafGreen: "#3aa84a",
  lime: "#a8d62a",
  violet: "#7a35b5",
  pink: "#ff7ab0",
  white: "#fffaf0",
  beakOrange: "#ff8a1c",
  beakDark: "#a8320f",
  eyeYellow: "#ffe04a",
  woodBrown: "#6b3a1e",
};
const M = {
  shoulderL: [0.45, 1.05, 0.3] as [number, number, number],
  shoulderR: [-0.45, 1.05, 0.3] as [number, number, number],
  neckBase: [0, 1.05, 0.5] as [number, number, number],
  headCenter: [0, 1.45, 1] as [number, number, number],
  tailBase: [0, 0.95, -0.7] as [number, number, number],
  hipL: [0.35, 0.7, -0.45] as [number, number, number],
  hipR: [-0.35, 0.7, -0.45] as [number, number, number],
  frontLegL: [0.35, 0.7, 0.3] as [number, number, number],
  frontLegR: [-0.35, 0.7, 0.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // body
  (() => {
function buildBody({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const hips = J.hips, chest = J.chest;

  // Torso loft: hips -> chest
  const torso = b.loft(
    [
      { at: [0, 0.88, -0.62], w: 0.62, h: 0.58 },
      { at: [0, 0.88, -0.3], w: 0.9, h: 0.72 },
      { at: [0, 0.9, 0.1], w: 0.95, h: 0.78 },
      { at: [0, 0.95, 0.42], w: 0.82, h: 0.8 },
    ],
    { bone: [hips, chest], color: P.jaguarGold },
  );
  const skin = b.surface(torso);

  // belly cream strip
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.95), P.bellyCream, { bone: hips, at: [0, 0.53, -0.1] });

  // rosettes on flanks and back
  const hits = skin.scatter(34, { rng: r, minDist: 0.15, filter: (h) => h.n.y > -0.2 });
  hits.forEach((h, i) => {
    const big = i % 2 === 0;
    if (big) {
      b.stick(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 10), P.rosetteBlack, h, { embed: 0.4 });
      b.stick(new THREE.CylinderGeometry(0.048, 0.048, 0.024, 10), i % 4 === 0 ? P.orange : P.jaguarGold, h, { embed: 0.35 });
      b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.028, 6), P.rosetteBlack, h, { embed: 0.3 });
    } else {
      b.stick(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 6), P.rosetteBlack, h, { embed: 0.4 });
    }
  });

  // dorsal petal studs
  const cols = [P.magenta, P.turquoise, P.orange, P.violet];
  for (let i = 0; i < 9; i++) {
    const z = -0.55 + i * 0.12;
    const h = skin.ray([0, 2, z], [0, -1, 0]);
    if (!h) continue;
    b.stick(new THREE.ConeGeometry(0.045, 0.1, 5), cols[i % 4], h, { embed: 0.2 });
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), P.white, h.moved([0, 0.1, 0]), { embed: 0 });
  }

  // magenta saddle collar with white dots
  const collar = skin.loop([0, 0.95, 0.38], { dir: [0, 0, 1], lift: 0.012 });
  b.sweep(collar, 0.035, { color: P.magenta, bone: chest });
  b.along(skin.loop([0, 0.95, 0.38], { dir: [0, 0, 1], lift: 0.04 }), 16, (at) =>
    b.part(new THREE.SphereGeometry(0.018, 6, 4), P.white, { at, bone: chest }),
  );

  // shoulder and hip flower circles
  const flower = (s: number, pos: number[], bone: any, petal: string) => {
    const h = skin.ray([s * 2, pos[1], pos[2]], [-s, 0, 0]);
    if (!h) return;
    b.stick(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 12), P.rosetteBlack, h, { embed: 0.4 });
    b.ring(h, { count: 6, radius: 0.08 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.04, 6, 4), petal, it, { embed: 0.3 }),
    );
    b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), P.eyeYellow, h, { embed: 0.3 });
  };
  for (const s of [1, -1]) {
    flower(s, [0, 0.9, 0.2], chest, P.pink);
    flower(s, [0, 0.85, -0.45], hips, P.turquoise);
  }

  // tail
  const tail = b.sweep(
    catmull([
      [0, 0.95, -0.65],
      [0, 0.97, -0.85],
      [0, 1.0, -1.0],
      [0, 1.1, -1.15],
      [0, 1.2, -1.28],
    ]),
    [0.1, 0.04],
    { bone: [J.tail1, J.tail2, J.tail3], color: P.jaguarGold },
  );
  for (let i = 0; i < 6; i++) {
    const t = 0.1 + i * 0.14;
    const p = tail.at(t, 0);
    b.stick(new THREE.CylinderGeometry(0.03 + (1 - t) * 0.06, 0.03 + (1 - t) * 0.06, 0.025, 8), P.rosetteBlack, p, { embed: 0.5 });
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), P.white, tail.at(t + 0.05, 90), { embed: 0.2 });
  }

  // feather tuft at tail tip
  const tip = new THREE.Vector3(0, 1.2, -1.25);
  const tuftCols = [P.magenta, P.turquoise, P.magenta, P.turquoise, P.orange];
  tuftCols.forEach((c, i) => {
    const a = (i - 2) * 0.35;
    const end: [number, number, number] = [Math.sin(a) * 0.16, 1.2 + 0.1 + Math.cos(a) * 0.05, -1.25 - 0.02];
    b.spike(tip, end, null, 0.045, { color: c, bone: J.tail3 });
  });
  b.part(new THREE.SphereGeometry(0.05, 8, 6), P.white, { at: [0, 1.2, -1.25], bone: J.tail3 });
}
    return buildBody;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: any) {
  const R = rng(11);
  const GOLD = P.jaguarGold, BLACK = P.rosetteBlack, CREAM = P.bellyCream;
  const PINK = P.pink, TEAL = P.turquoise, CLAW = P.beakDark, WHITE = P.white;
  const MAG = P.magenta;

  const legs = [
    { n: "FL", s: 1, front: true, hip: J.hipFL, knee: J.kneeFL, m: M.frontLegL, r: 0.15 },
    { n: "FR", s: -1, front: true, hip: J.hipFR, knee: J.kneeFR, m: M.frontLegR, r: 0.15 },
    { n: "BL", s: 1, front: false, hip: J.hipBL, knee: J.kneeBL, m: M.hipL, r: 0.18 },
    { n: "BR", s: -1, front: false, hip: J.hipBR, knee: J.kneeBR, m: M.hipR, r: 0.18 },
  ];

  for (const L of legs) {
    const [hx, hy, hz] = L.m;
    const kz = hz + (L.front ? 0.03 : -0.05);
    const ky = 0.4;
    const pz = hz + (L.front ? 0.08 : -0.02);
    const r = L.r;
    // upper leg
    b.rod([hx, hy, hz], [hx, ky, kz], [r * 1.15, r * 0.95], GOLD, { bone: L.hip, sides: 8 });
    b.part(new THREE.SphereGeometry(r * 1.2, 8, 6), GOLD, { at: [hx, hy, hz], bone: L.hip });
    if (!L.front) {
      // haunch
      b.part(new THREE.SphereGeometry(0.24, 8, 6), GOLD, { at: [hx + L.s * 0.04, hy + 0.04, hz - 0.03], bone: L.hip, scale: [0.9, 1.1, 1.2] });
      for (let i = 0; i < 3; i++)
        b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), BLACK, {
          at: [hx + L.s * 0.2, hy + 0.1 - i * 0.07, hz - 0.03 + (i % 2) * 0.06], bone: L.hip, dir: [L.s, 0, 0],
        });
    }
    // lower leg
    b.rod([hx, ky, kz], [hx, 0.12, pz], [r * 0.95, r * 0.8], GOLD, { bone: L.knee, sides: 8 });
    b.part(new THREE.SphereGeometry(r * 0.98, 8, 6), GOLD, { at: [hx, ky, kz], bone: L.knee });
    // striped rings
    const rings = [0.3, 0.2, 0.12];
    rings.forEach((y, i) => {
      const t = (ky - y) / (ky - 0.12);
      const z = kz + (pz - kz) * t;
      const rr = r * (0.95 - 0.15 * t) + 0.012;
      b.part(new THREE.CylinderGeometry(rr, rr, 0.035, 8), i % 2 ? TEAL : PINK, { at: [hx, y + 0.1 - 0.05, z], bone: L.knee });
    });
    // upper leg ring
    b.part(new THREE.CylinderGeometry(r * 1.05 + 0.01, r * 1.05 + 0.01, 0.04, 8), PINK, { at: [hx, 0.55, hz + (kz - hz) * 0.4], bone: L.hip });
    // zigzag cuff above paw
    const cz = pz;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const cr = r * 0.8 + 0.02;
      b.spike([hx + Math.cos(a) * cr, 0.2, cz + Math.sin(a) * cr], [0, -1, 0], 0.06, 0.025, { color: i % 2 ? MAG : WHITE, bone: L.knee });
    }
    // spots
    for (let i = 0; i < 4; i++) {
      const a = R() * Math.PI * 2;
      const y = 0.3 + R() * 0.35;
      const t = Math.max(0, (hy - y) / (hy - ky));
      const z = hz + (kz - hz) * Math.min(1, t);
      b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.01, 7), BLACK, {
        at: [hx + Math.cos(a) * r * 1.05, y, z + Math.sin(a) * r * 1.05], bone: y > ky ? L.hip : L.knee,
        dir: [Math.cos(a), 0, Math.sin(a)],
      });
    }
    // paw
    const fz = pz + 0.08;
    b.part(new THREE.SphereGeometry(0.17, 8, 6), GOLD, { at: [hx, 0.1, fz - 0.04], bone: L.knee, scale: [1, 0.6, 1.3] });
    // pad
    b.part(new THREE.SphereGeometry(0.07, 8, 6), CREAM, { at: [hx, 0.015, fz - 0.05], bone: L.knee, scale: [1.2, 0.3, 1] });
    // toes
    for (let i = -1; i <= 1; i++) {
      const tx = hx + i * 0.095;
      const tzz = fz + 0.12 - Math.abs(i) * 0.03;
      b.part(new THREE.SphereGeometry(0.06, 7, 5), i === 0 ? PINK : GOLD, { at: [tx, 0.06, tzz], bone: L.knee, scale: [1, 0.9, 1.2] });
      b.spike([tx, 0.05, tzz + 0.06], [0, -0.2, 1], 0.1, 0.022, { color: CLAW, bone: L.knee });
      b.part(new THREE.SphereGeometry(0.018, 5, 4), BLACK, { at: [tx, 0.1, tzz + 0.03], bone: L.knee });
    }
  }
}
    return buildLegs;
  })(),
  // headNeck
  (() => {
function buildHeadNeck({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const neck1 = J.neck1, neck2 = J.neck2, head = J.head, jaw = J.jaw;

  // helpers
  const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const dot = (at: number[], r: number, color: string, bone: any, dir: number[] = [0, 0, 1]) =>
    b.part(ball(r, 6, 4), color, { bone, at, dir });

  // ---- NECK: thick curved sweep
  const neckPts = [
    [0, 1.0, 0.42],
    [0, 1.15, 0.6],
    [0, 1.3, 0.78],
    [0, 1.42, 0.92],
  ];
  const neck = b.sweep(neckPts, [0.2, 0.16], { bone: [neck1, neck2, head], color: P.turquoise, sides: 10 });

  // scallop collars: rows of white discs along the neck
  for (let i = 0; i < 4; i++) {
    const t = 0.1 + i * 0.25;
    const p = neck.at(t, 0);
    const r = 0.2 - i * 0.015;
    for (let k = -3; k <= 3; k++) {
      const a = k * 26;
      const h = neck.at(t, a);
      b.stick(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), i % 2 ? P.white : P.pink, h, { embed: 0.3 });
    }
    void p; void r;
  }
  // dots on neck sides
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const h = neck.at(0.08 + i * 0.16, s * 90 * -1);
      b.stick(ball(0.02, 6, 4), i % 2 ? P.magenta : P.eyeYellow, h, { embed: 0.3 });
    }

  // ---- SKULL
  const H = 1.0;
  const skull = b.part(new THREE.BoxGeometry(0.4 * H, 0.34 * H, 0.42 * H), P.deepBlue, {
    bone: head, at: [0, 1.46, 0.97],
  });
  b.part(new THREE.BoxGeometry(0.42, 0.1, 0.3), P.turquoise, { bone: head, at: [0, 1.6, 0.95] });
  b.part(new THREE.BoxGeometry(0.36, 0.08, 0.34), P.white, { bone: head, at: [0, 1.31, 0.99] });
  void skull;

  // ---- BEAK upper (hooked) on head
  b.part(new THREE.BoxGeometry(0.2, 0.12, 0.26), P.beakOrange, { bone: head, at: [0, 1.43, 1.3] });
  b.frustumBox([0, 1.45, 1.4], [0, 1.43, 1.54], [0.18, 0.12], [0.1, 0.07], { bone: head, color: P.beakOrange });
  // hook
  b.spike([0, 1.46, 1.5], [0, -0.75, 0.55], 0.17, 0.05, { bone: head, color: P.beakDark, sides: 6 });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.4), P.red, { bone: head, at: [0, 1.5, 1.32] });
  for (const s of [1, -1]) dot([s * 0.03, 1.49, 1.5], 0.016, P.rosetteBlack, head);

  // ---- LOWER BEAK on jaw
  b.frustumBox([0, 1.35, 1.1], [0, 1.34, 1.42], [0.17, 0.07], [0.09, 0.04], { bone: jaw, color: P.beakOrange });
  b.spike([0, 1.34, 1.42], [0, 0, 1], 0.07, 0.035, { bone: jaw, color: P.beakDark, sides: 6 });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.2), P.red, { bone: jaw, at: [0, 1.3, 1.25] });

  // ---- EYES
  for (const s of [1, -1]) {
    const c = [s * 0.2, 1.5, 1.1];
    const d = [s * 0.9, 0.1, 0.35];
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), P.rosetteBlack, { bone: head, at: c, dir: d });
    b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.04, 12), P.eyeYellow, { bone: head, at: [s * 0.215, 1.5, 1.105], dir: d });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), P.rosetteBlack, { bone: head, at: [s * 0.23, 1.5, 1.11], dir: d });
    dot([s * 0.235, 1.53, 1.13], 0.014, P.white, head);
    // brow stripes
    b.part(new THREE.BoxGeometry(0.16, 0.025, 0.05), P.magenta, { bone: head, at: [s * 0.19, 1.62, 1.1], rotation: [0, 0, s * -15] });
    b.part(new THREE.BoxGeometry(0.12, 0.02, 0.04), P.orange, { bone: head, at: [s * 0.19, 1.66, 1.07], rotation: [0, 0, s * -15] });
    // cheek feather blades
    const cols = [P.pink, P.violet, P.orange];
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.03, 0.2, 0.09), cols[i], {
        bone: head, at: [s * (0.22 + i * 0.015), 1.33 - i * 0.04, 0.95 - i * 0.07],
        rotation: [20 - i * 10, 0, s * (15 + i * 10)],
      });
      dot([s * (0.24 + i * 0.015), 1.25 - i * 0.04, 0.95 - i * 0.07], 0.016, P.white, head, [s, 0, 0]);
    }
  }

  // ---- CREST: fanned broad blades
  const crestCols = [P.magenta, P.orange, P.eyeYellow, P.orange, P.magenta];
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 20;
    const col = crestCols[i % 5];
    const len = 0.3 - Math.abs(i - 3) * 0.02;
    const fin = b.extrude(
      [[-0.05, 0], [0.05, 0], [0.06, len * 0.6], [0, len, "sharp"], [-0.06, len * 0.6]],
      { at: [0, 1.62, 0.9], x: [0, 0, 1], y: [Math.sin((a * Math.PI) / 180) * 1.0, 1, -0.5], thickness: 0.025, color: col, bone: head },
    );
    void fin;
    const tipY = 1.62 + len * 0.7;
    dot([Math.sin((a * Math.PI) / 180) * len * 0.7, tipY, 0.9 - len * 0.35], 0.014, P.white, head, [0, 1, 0]);
  }
  // crest base stripe
  b.part(new THREE.BoxGeometry(0.34, 0.03, 0.1), P.white, { bone: head, at: [0, 1.64, 0.92] });
  for (let i = -3; i <= 3; i++) dot([i * 0.05, 1.66, 0.92], 0.012, P.rosetteBlack, head, [0, 1, 0]);
  void R; void frame; void M;
}
    return buildHeadNeck;
  })(),
  // wingLeft
  (() => {
function buildWingLeft({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const bones = [J.wingL1, J.wingL2, J.wingL3];
  const BLACK = P.rosetteBlack;
  const S = M.shoulderL;
  // arm points
  const pts: [number, number, number][] = [
    [0.45, 1.05, 0.3],
    [0.9, 1.15, 0.25],
    [1.3, 1.25, 0.1],
  ];
  const arm = b.sweep(pts, [0.075, 0.04], { color: P.deepBlue, bone: bones, caps: "round" } as any);
  // dotted bands on arm
  for (let i = 0; i < 6; i++) {
    const t = 0.1 + i * 0.16;
    const pt = arm.at(t, 0);
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), i % 2 ? P.white : P.orange, pt, { embed: 0.3 });
  }
  // feather helper: blade extruded in the wing plane, pointing along +X leaning back
  const feather = (
    base: [number, number, number],
    len: number,
    w: number,
    angDeg: number,
    col: string,
    tip: string,
    bone: any,
    lift: number,
  ) => {
    const a = (angDeg * Math.PI) / 180;
    const dir: [number, number, number] = [Math.cos(a), lift, -Math.sin(a)];
    const side = new THREE.Vector3(dir[0], dir[1], dir[2]).cross(new THREE.Vector3(0, 1, 0)).normalize();
    const outline: any = (k: number) => [
      [0, -w * k],
      [len * k * 0.7, -w * k * 1.05],
      [len * k, 0, "sharp"],
      [len * k * 0.7, w * k * 1.05],
      [0, w * k],
    ];
    const x: [number, number, number] = [dir[0], dir[1], dir[2]];
    const y: [number, number, number] = [0, 1, 0];
    // outline (black, slightly larger and thinner behind)
    b.extrude(outline(1.06), { at: base, x, y, thickness: 0.012, color: BLACK, bone, smoothing: 1 } as any);
    const f = b.extrude(outline(1), {
      at: [base[0], base[1] + 0.008, base[2]],
      x,
      y,
      thickness: 0.014,
      color: col,
      bone,
      smoothing: 1,
    } as any);
    // white centre stripe
    b.rod(
      [base[0] + dir[0] * len * 0.1, base[1] + 0.016, base[2] + dir[2] * len * 0.1],
      [base[0] + dir[0] * len * 0.85, base[1] + 0.016 + dir[1] * len * 0.85, base[2] + dir[2] * len * 0.85],
      0.008,
      P.white,
      { bone, caps: "flat" } as any,
    );
    // tip dot
    const tp = new THREE.Vector3(
      base[0] + dir[0] * len * 0.88,
      base[1] + 0.02 + dir[1] * len * 0.88,
      base[2] + dir[2] * len * 0.88,
    );
    b.part(new THREE.SphereGeometry(w * 0.3, 6, 4), tip, { at: tp, bone });
  };
  // rows: covert (near arm), middle, flight
  const rows = [
    { n: 6, len: 0.36, w: 0.07, y: 1.17, cols: [P.turquoise], tips: [P.white], z: 0.18, ang0: 70, ang1: 20 },
    { n: 6, len: 0.55, w: 0.085, y: 1.14, cols: [P.magenta, P.orange], tips: [P.white, P.eyeYellow], z: 0.12, ang0: 65, ang1: 15 },
    { n: 7, len: 0.8, w: 0.095, y: 1.11, cols: [P.violet, P.red, P.lime], tips: [P.white, P.eyeYellow, P.orange], z: 0.06, ang0: 70, ang1: 10 },
  ];
  rows.forEach((row, ri) => {
    for (let i = 0; i < row.n; i++) {
      const t = i / (row.n - 1);
      const x = 0.5 + t * 0.8;
      const ang = row.ang0 - (row.ang0 - row.ang1) * t * 0 - (1 - t) * 0 + (t * (row.ang1 - row.ang0)) * -1 + 0;
      const a = 80 - t * 70 + ri * 0; // fan from backward to outward
      const bone = bones[Math.min(2, Math.floor(t * 3))];
      const z = row.z - 0.05 * t * 3 - ri * 0.0;
      const len = row.len * (1.15 - t * 0.3);
      feather(
        [x, row.y - ri * 0.03 + t * 0.1, z - 0.04],
        len,
        row.w,
        Math.max(20, 95 - t * 70 + ri * 0 + (ang - ang) * 0),
        row.cols[i % row.cols.length],
        row.tips[i % row.tips.length],
        bone,
        0.05 + t * 0.1,
      );
    }
  });
  // flower rosette at shoulder
  const c = new THREE.Vector3(S[0] + 0.05, S[1] + 0.1, S[2] + 0.02);
  const fc = frame([c.x, c.y, c.z], [0, 1, 0]);
  b.ring(fc, { count: 6, radius: 0.07 }, (it: any) =>
    b.stick(new THREE.SphereGeometry(0.05, 6, 4), P.pink, it, { embed: 0.2, scale: [1, 0.5, 1] } as any),
  );
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), P.eyeYellow, { at: [c.x, c.y + 0.02, c.z], bone: J.wingL1 });
}
    return buildWingLeft;
  })(),
  // wingRight
  (() => {
function buildWingRight({ b, J, P, M }: Ctx) {
  const s = -1; // right wing, -X
  const R = rng(11);
  const bones = [J.wingR1, J.wingR2, J.wingR3];
  const BLACK = P.rosetteBlack;
  const WHITE = P.white;

  // arm: three capsules along the bones with joint balls
  const pts: [number, number, number][] = [
    [-0.45, 1.05, 0.3],
    [-0.9, 1.15, 0.25],
    [-1.3, 1.25, 0.1],
  ];
  const seg = (i: number, r0: number, r1: number) =>
    b.rod(pts[i], pts[i + 1], [r0, r1], P.deepBlue, { bone: bones[i], sides: 8 });
  seg(0, 0.1, 0.085);
  seg(1, 0.085, 0.06);
  for (const p of pts)
    b.part(new THREE.SphereGeometry(0.09, 8, 6), P.deepBlue, { at: p, bone: p === pts[0] ? bones[0] : p === pts[1] ? bones[1] : bones[2] });

  // dotted bands on arm
  for (let i = 0; i < 2; i++) {
    for (let k = 0; k < 6; k++) {
      const t = (k + 0.5) / 6;
      const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t;
      const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
      const z = pts[i][2] + (pts[i + 1][2] - pts[i][2]) * t;
      b.part(new THREE.SphereGeometry(0.02, 5, 4), k % 2 ? WHITE : P.eyeYellow, { at: [x, y + 0.085, z], bone: bones[i] });
    }
  }

  // flower rosette at shoulder
  const fc: [number, number, number] = [-0.5, 1.15, 0.3];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.04, 6, 4), k % 2 ? P.pink : P.magenta, {
      at: [fc[0], fc[1] + Math.cos(a) * 0.085, fc[2] + Math.sin(a) * 0.085],
      bone: bones[0],
    });
  }
  b.part(new THREE.SphereGeometry(0.05, 6, 5), P.eyeYellow, { at: [fc[0] - 0.02, fc[1], fc[2]], bone: bones[0] });

  // feather outline: [u along length, v width, "sharp"]
  const feather = (L: number, W: number): [number, number, string?][] => [
    [0, -W * 0.4],
    [L * 0.55, -W * 0.5],
    [L * 0.9, -W * 0.3],
    [L, 0, "sharp"],
    [L * 0.9, W * 0.3],
    [L * 0.55, W * 0.5],
    [0, W * 0.4],
  ];

  // rows: [count, length, width, y offset, colours, tip colour, boneIdx start]
  const rows = [
    { n: 8, L: 0.42, W: 0.2, y: 0.07, cols: [P.violet, P.red, P.lime, P.red, P.violet, P.lime, P.red, P.violet], tip: WHITE, dy: -0.02, back: 0.15 },
    { n: 7, L: 0.34, W: 0.2, y: 0.12, cols: [P.orange, P.magenta, P.orange, P.magenta, P.orange, P.magenta, P.orange], tip: P.eyeYellow, dy: 0, back: 0.1 },
    { n: 6, L: 0.24, W: 0.2, y: 0.17, cols: [P.turquoise, P.turquoise, P.turquoise, P.turquoise, P.turquoise, P.turquoise], tip: WHITE, dy: 0.01, back: 0.05 },
  ];
  rows.forEach((row, ri) => {
    for (let i = 0; i < row.n; i++) {
      const t = i / (row.n - 1);
      // root along the arm trailing edge
      const rx = -0.5 - t * 0.78;
      const ry = 1.1 + t * 0.12 + row.y - 0.09 * ri + row.dy;
      const rz = 0.28 - t * 0.2 - 0.08;
      // direction: back and outward, fanning
      const ang = (-0.6 + t * 1.0) * (1 - 0.0); // fan from backward to outward
      const dx = -Math.sin(ang + 0.2) * 0.6;
      const dz = -Math.cos(ang + 0.35);
      const dirv = new THREE.Vector3(dx, 0.05 + 0.04 * ri, dz).normalize();
      const bi = t < 0.4 ? 0 : t < 0.75 ? 1 : 2;
      const bone = bones[bi];
      const L = row.L * (1 + (ri === 0 ? 0.5 * (1 - Math.abs(t - 0.5) * 1.2) : 0.2 * (1 - t)));
      const W = row.W;
      const x = [dirv.x, dirv.y, dirv.z];
      // outline pass (black, slightly bigger, behind)
      const base = [rx, ry, rz];
      const ex = new THREE.Vector3(0, 1, 0).cross(dirv).normalize();
      const yv = ex.clone().cross(dirv).negate();
      const ydir: [number, number, number] = [yv.x, yv.y, yv.z];
      const out = feather(L * 1.07, W * 1.12) as any;
      b.extrude(out, { at: [rx, ry - 0.004, rz], x: x as any, y: ydir, thickness: 0.016, color: BLACK, bone });
      b.extrude(feather(L, W) as any, { at: [rx, ry, rz], x: x as any, y: ydir, thickness: 0.026, color: row.cols[i % row.cols.length], bone });
      const at = (u: number, v: number, h: number): [number, number, number] => [
        rx + dirv.x * u + yv.x * v + ex.x * h,
        ry + dirv.y * u + yv.y * v + ex.y * h,
        rz + dirv.z * u + yv.z * v + ex.z * h,
      ];
      // top face offset: pick the side facing up
      const up = Math.abs(ex.y) > 0.01 ? Math.sign(ex.y) : 1;
      // white centre stripe
      b.rod(at(L * 0.12, 0, up * 0.016), at(L * 0.78, 0, up * 0.016), 0.012, WHITE, { bone, sides: 4 });
      // tip dot
      b.part(new THREE.SphereGeometry(0.03, 6, 4), row.tip, { at: at(L * 0.86, 0, up * 0.016), bone });
      if (ri === 0) b.part(new THREE.SphereGeometry(0.018, 5, 4), WHITE, { at: at(L * 0.5, W * 0.22, up * 0.016), bone });
      if (ri === 0) b.part(new THREE.SphereGeometry(0.018, 5, 4), WHITE, { at: at(L * 0.5, -W * 0.22, up * 0.016), bone });
    }
  });

  // white dots along the leading edge of the arm
  for (let k = 0; k < 7; k++) {
    const t = k / 6;
    b.part(new THREE.SphereGeometry(0.018, 5, 4), WHITE, {
      at: [-0.5 - t * 0.78, 1.1 + t * 0.14, 0.3 - t * 0.17 + 0.07],
      bone: bones[t < 0.5 ? 0 : 1],
    });
  }
}
    return buildWingRight;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.85,-0.4], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,0.9,0.2], dir: [0,0,1], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["chest"], at: [0,1.05,0.5], dir: [0,0.7,0.7], role: "neck" });
  J["neck2"] = b.joint("neck2", { parent: J["neck1"], at: [0,1.25,0.75], dir: [0,0.5,0.85], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck2"], at: [0,1.4,0.9], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.38,1.1], dir: [0,0,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,0.95,-0.7], dir: [0,0.1,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1,-1], dir: [0,0.3,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.15,-1.25], dir: [0,0.5,-1], role: "tail" });
  J["wingL1"] = b.joint("wingL1", { parent: J["chest"], at: [0.45,1.05,0.3], dir: [1,0.2,0], role: "wing" });
  J["wingL2"] = b.joint("wingL2", { parent: J["wingL1"], at: [0.9,1.15,0.25], dir: [1,0.2,-0.1], role: "wing" });
  J["wingL3"] = b.joint("wingL3", { parent: J["wingL2"], at: [1.3,1.25,0.1], dir: [1,0.1,-0.2], role: "wing" });
  J["wingR1"] = b.joint("wingR1", { parent: J["chest"], at: [-0.45,1.05,0.3], dir: [-1,0.2,0], role: "wing" });
  J["wingR2"] = b.joint("wingR2", { parent: J["wingR1"], at: [-0.9,1.15,0.25], dir: [-1,0.2,-0.1], role: "wing" });
  J["wingR3"] = b.joint("wingR3", { parent: J["wingR2"], at: [-1.3,1.25,0.1], dir: [-1,0.1,-0.2], role: "wing" });
  J["hipFL"] = b.joint("hipFL", { parent: J["chest"], at: [0.35,0.7,0.3], dir: [0,-1,0], role: "leg" });
  J["kneeFL"] = b.joint("kneeFL", { parent: J["hipFL"], at: [0.35,0.4,0.3], dir: [0,-1,0.1], role: "leg" });
  J["hipFR"] = b.joint("hipFR", { parent: J["chest"], at: [-0.35,0.7,0.3], dir: [0,-1,0], role: "leg" });
  J["kneeFR"] = b.joint("kneeFR", { parent: J["hipFR"], at: [-0.35,0.4,0.3], dir: [0,-1,0.1], role: "leg" });
  J["hipBL"] = b.joint("hipBL", { parent: J["hips"], at: [0.35,0.7,-0.45], dir: [0,-1,0], role: "leg" });
  J["kneeBL"] = b.joint("kneeBL", { parent: J["hipBL"], at: [0.35,0.4,-0.5], dir: [0,-1,-0.1], role: "leg" });
  J["hipBR"] = b.joint("hipBR", { parent: J["hips"], at: [-0.35,0.7,-0.45], dir: [0,-1,0], role: "leg" });
  J["kneeBR"] = b.joint("kneeBR", { parent: J["hipBR"], at: [-0.35,0.4,-0.5], dir: [0,-1,-0.1], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
