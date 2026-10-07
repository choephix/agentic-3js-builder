import * as THREE from "three";
import type { OutlinePoint } from "../../../../src/index";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  gradient,
  grain,
  limb,
  mottle,
  paint,
  rng,
  spots,
  svg,
} from "../../../../src/index";

type V = [number, number, number];

export const meta = {
  name: "Red Panda on a Mossy Branch",
  description:
    "A delighted red panda balancing on a moss-covered branch, one paw raised holding a leafy bamboo shoot. Rusty back, black belly and legs, white face with tear marks, white-rimmed ears and a big ringed tail.",
};

const C = {
  RUST: "#b5431f",
  RUST_LIGHT: "#d4682e",
  GINGER: "#c95b22",
  GINGER_DARK: "#a8451b",
  CREAM: "#f2e2bb",
  CREAM_DARK: "#dcc592",
  TIP: "#55281a",
  BLACK: "#1d1613",
  BLACK_LIGHT: "#31251f",
  WHITE: "#f9f4ea",
  WHITE_SHADE: "#e9e0d0",
  NOSE: "#0f0b0b",
  EYE: "#120d0c",
  SPARK: "#ffffff",
  TEAR: "#a8381a",
  EAR_IN: "#2a1c17",
  PINK: "#e88a93",
  BLUSH: "#f2b8b0",
  MOUTH: "#5c1f27",
  TOOTH: "#fbf4e2",
  CLAW: "#e3d3b0",
  WHISKER: "#f4efe4",
  BAMBOO: "#a8c65a",
  BAMBOO_DARK: "#6f9a35",
  LEAF_A: "#5aa03a",
  LEAF_B: "#3f7f2c",
  BARK: "#5b4333",
  BARK_DARK: "#3a2b22",
  MOSS: "#5f8f2f",
  MOSS_DARK: "#3f6a25",
  MOSS_LIGHT: "#93bd45",
  WOOD: "#e0c08a",
  WOOD_RING: "#b88f55",
  CAP_RED: "#d8402b",
  SHELF: "#e9a24a",
  SHELF_DARK: "#b9712a",
} as const;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda" });
  type JointT = ReturnType<typeof b.joint>;
  type ChainT = ReturnType<typeof b.chain>;
  type Col = string | ReturnType<typeof mottle>;
  const jt = (c: ChainT, i: number): JointT => c.joints[i] as JointT;

  let lcg = 20240611;
  const rand = (): number => {
    lcg = (lcg * 1664525 + 1013904223) % 4294967296;
    return lcg / 4294967296;
  };

  // ------------------------------------------------------------------ paints
  const rustFur = mottle(C.RUST, C.RUST_LIGHT, { size: 0.06, seed: 2 });
  const blackFur = mottle(C.BLACK, C.BLACK_LIGHT, { size: 0.04, seed: 4 });
  const coat = countershade(rustFur, blackFur, { level: -0.3, soft: 0.3 });
  const legPaint = gradient(blackFur, coat, [0, 0.25, 0], [0, 0.34, 0]);
  const whiteFur = mottle(C.WHITE, C.WHITE_SHADE, { size: 0.025, seed: 13 });
  const headRust = mottle(C.RUST, C.RUST_LIGHT, { size: 0.03, seed: 12 });

  const barkGrain = grain(C.BARK, C.BARK_DARK, { size: 0.02, axis: "z", seed: 2 });
  const mossPatch = mottle(C.MOSS, C.MOSS_LIGHT, { size: 0.045, seed: 7 });
  const mossy = spots(barkGrain, mossPatch, { size: 0.11, amount: 0.8, seed: 5 });
  const branchPaint = countershade(mossy, barkGrain, { level: -0.3, soft: 0.3 });

  // ------------------------------------------------------------------ skeleton root + branch
  const root = b.joint("root", { at: [0, 0.09, 0] });

  const brR = (t: number): number => 0.108 - 0.04 * t;
  const brSpec: [number, number][] = [
    [0.04, -0.85],
    [-0.025, -0.5],
    [0.0, -0.15],
    [0.0, 0.2],
    [0.03, 0.55],
    [-0.015, 0.85],
  ];
  const brPts: number[][] = brSpec.map(([x, z]) => [x, brR((z + 0.85) / 1.7) - 0.004, z]);
  const branchPath = catmull(brPts);
  const branch = b.sweep(branchPath, brR, { bone: root, color: branchPaint, sides: 10, caps: "flat" });
  const branchSurf = b.surface(branch);
  const topAt = (x: number, z: number): number => {
    const h = branchSurf.ray([x, 1, z], [0, -1, 0]);
    return h ? h.at.y : 0.17;
  };

  // cut ends of the branch
  const capDisc = (t: number, sign: number): void => {
    const p = branchPath.at(t);
    const r = brR(t);
    const mk = (rad: number, h: number, c: string): void => {
      b.part(new THREE.CylinderGeometry(rad, rad, h, 10), c, {
        at: [p.x, p.y, p.z + sign * 0.002],
        dir: [0, 0, sign],
        bone: root,
        flat: true,
      });
    };
    mk(r * 0.94, 0.008, C.WOOD);
    mk(r * 0.62, 0.0095, C.WOOD_RING);
    mk(r * 0.2, 0.011, C.BARK_DARK);
  };
  capDisc(0, -1);
  capDisc(1, 1);

  // ------------------------------------------------------------------ spine, neck, head, jaw
  const spinePts: V[] = [
    [0, 0.355, -0.14],
    [0, 0.36, -0.01],
    [0, 0.365, 0.09],
    [0, 0.37, 0.17],
  ];
  const spine = b.chain("spine", catmull(spinePts), {
    parent: root,
    names: ["hips", "spine2", "chest"],
    role: "spine",
  });
  const hips = jt(spine, 0);
  const chest = jt(spine, 2);

  const neck = b.joint("neck", { parent: chest, at: [0, 0.372, 0.175], aim: [0, 0.395, 0.245], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.395, 0.245], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.372, 0.322], aim: [0, 0.366, 0.4], role: "jaw" });

  // body
  const bodyR = (t: number): [number, number] => {
    const w = 0.086 + 0.016 * Math.sin(Math.PI * t);
    return [w, w + 0.006];
  };
  const bodySweep = b.sweep(spine, bodyR, { color: coat, sides: 12, caps: "round" });

  // ------------------------------------------------------------------ paws helper
  const addToes = (bone: JointT, c: THREE.Vector3): void => {
    for (let i = 0; i < 4; i++) {
      const x = c.x + (i - 1.5) * 0.0145;
      const zz = c.z + 0.024 - Math.abs(i - 1.5) * 0.004;
      b.part(new THREE.SphereGeometry(0.0115, 6, 4), C.BLACK, { at: [x, c.y - 0.008, zz], bone, flat: true });
      b.part(new THREE.ConeGeometry(0.0042, 0.014, 4), C.CLAW, {
        at: [x, c.y - 0.011, zz + 0.012],
        dir: [0, -0.2, 1],
        bone,
        flat: true,
      });
    }
  };

  const feet: [number, number][] = [];

  // ------------------------------------------------------------------ hind legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hip: V = [s * 0.082, 0.325, -0.14];
    const ax = s * 0.058;
    const az = s > 0 ? -0.175 : -0.205;
    const ay = topAt(ax, az) + 0.026;
    const pts = limb(hip, [ax, ay, az], [0.105, 0.105], [s * 0.3, 0.2, 1]);
    const toe = new THREE.Vector3(ax, ay, az + 0.07);
    const leg = b.chain(`legHind${sd}`, [...pts, toe], {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `toe${sd}`],
      role: "leg",
      contact: [ax, topAt(ax, az + 0.07), az + 0.07],
    });
    b.sweep(leg, [0.054, 0.04, 0.032, 0.03, 0.033], { color: legPaint });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      at: [s * 0.085, 0.312, -0.135],
      scale: [0.05, 0.065, 0.075],
      bone: jt(leg, 0),
    });
    addToes(jt(leg, 3), toe);
    feet.push([ax, az + 0.03]);
  }

  // ------------------------------------------------------------------ planted front leg (left)
  {
    const shoulder: V = [0.085, 0.33, 0.1];
    const wx = 0.055;
    const wz = 0.262;
    const wy = topAt(wx, wz) + 0.026;
    const pts = limb(shoulder, [wx, wy, wz], [0.125, 0.125], [0.35, 0.1, -1]);
    const toe = new THREE.Vector3(wx, wy, wz + 0.05);
    const leg = b.chain("legFrontL", [...pts, toe], {
      parent: chest,
      names: ["shoulderL", "elbowL", "wristL", "pawL"],
      role: "leg",
      contact: [wx, topAt(wx, wz + 0.05), wz + 0.05],
    });
    b.sweep(leg, [0.044, 0.035, 0.03, 0.031, 0.034], { color: legPaint });
    addToes(jt(leg, 3), toe);
    feet.push([wx, wz + 0.03]);
  }

  // ------------------------------------------------------------------ bamboo + raised front arm (right)
  const S0 = new THREE.Vector3(-0.14, 0.23, 0.27);
  const S1 = new THREE.Vector3(-0.09, 0.56, 0.44);
  const sDir = S1.clone().sub(S0).normalize();
  const stalkAt = (u: number): THREE.Vector3 => S0.clone().lerp(S1, u);
  const gripBase = stalkAt(0.24);
  const backPerp = new THREE.Vector3(0, 0, -1);
  backPerp.addScaledVector(sDir, -backPerp.dot(sDir)).normalize();
  const grip = gripBase.clone().addScaledVector(backPerp, 0.024);
  const wrist = grip.clone().addScaledVector(sDir, -0.035);
  const handEnd = grip.clone().addScaledVector(sDir, 0.014);

  const armPts = limb([-0.085, 0.33, 0.1], wrist, [0.125, 0.125], [-0.7, -0.7, -0.1]);
  const armR = b.chain("armRaisedR", [...armPts, handEnd], {
    parent: chest,
    names: ["shoulderR", "elbowR", "wristR", "pawR"],
    role: "arm",
  });
  b.sweep(armR, [0.044, 0.035, 0.03, 0.031, 0.033], { color: legPaint });
  const pawR = jt(armR, 3);

  // fingers wrapped around the stalk
  {
    const front = backPerp.clone().negate();
    const sideV = new THREE.Vector3().crossVectors(sDir, front).normalize();
    for (const off of [-0.02, -0.007, 0.006, 0.019]) {
      const c = gripBase.clone().addScaledVector(sDir, off);
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k < 5; k++) {
        const a = THREE.MathUtils.degToRad(-100 + k * 50);
        pts.push(
          c
            .clone()
            .addScaledVector(front, Math.cos(a) * 0.0155)
            .addScaledVector(sideV, Math.sin(a) * 0.0155),
        );
      }
      b.sweep(catmull(pts), 0.0066, { color: C.BLACK, bone: pawR });
    }
  }

  // the shoot itself
  b.rod(S0, S1, [0.0095, 0.0075], { color: C.BAMBOO, bone: pawR, sides: 8 });
  for (const u of [0.12, 0.38, 0.62, 0.84]) {
    const rad = 0.0125 - 0.002 * u;
    b.part(new THREE.CylinderGeometry(rad, rad, 0.007, 8), C.BAMBOO_DARK, {
      at: stalkAt(u),
      dir: sDir,
      bone: pawR,
      flat: true,
    });
  }

  const leaf = (
    base: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    wid: number,
    color: string,
    bone: JointT,
    roll: number,
  ): void => {
    const d = dir.clone().normalize();
    const side = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0));
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    side.normalize().applyAxisAngle(d, roll);
    const outline: OutlinePoint[] = [
      [0, 0, "sharp"],
      [len * 0.3, wid * 0.5],
      [len * 0.72, wid * 0.32],
      [len, 0, "sharp"],
      [len * 0.72, -wid * 0.32],
      [len * 0.3, -wid * 0.5],
    ];
    b.extrude(outline, { at: base, x: d, y: side, thickness: 0.003, smoothing: 1, color, bone });
  };

  const leafDirs: V[] = [
    [-0.9, 0.35, 0.1],
    [-0.5, 0.6, 0.55],
    [0.0, 0.7, 0.7],
    [0.3, 0.65, 0.35],
    [-0.6, 0.5, -0.5],
    [0.1, 0.8, -0.3],
    [-0.95, -0.2, 0.2],
    [-0.3, 0.9, 0.2],
    [-0.4, 0.2, 0.9],
    [-0.75, 0.55, -0.1],
  ];
  const leafNodes = [0.78, 0.88, 0.97, 1.0];
  leafDirs.forEach((d, i) => {
    const u = leafNodes[i % 4] ?? 1;
    leaf(
      stalkAt(u),
      new THREE.Vector3(d[0], d[1], d[2]),
      0.11 + (i % 3) * 0.015,
      0.034,
      i % 2 === 0 ? C.LEAF_A : C.LEAF_B,
      pawR,
      i * 0.7,
    );
  });

  // ------------------------------------------------------------------ tail
  const tailPts: V[] = [
    [0, 0.35, -0.215],
    [0, 0.355, -0.35],
    [0.02, 0.37, -0.5],
    [0.06, 0.4, -0.65],
    [0.075, 0.45, -0.78],
    [0.04, 0.51, -0.87],
  ];
  const tailPath = catmull(tailPts);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail" });

  const gingerFur = mottle(C.GINGER, C.GINGER_DARK, { size: 0.04, seed: 8 });
  const creamFur = mottle(C.CREAM, C.CREAM_DARK, { size: 0.04, seed: 9 });
  const tipFur = mottle(C.TIP, C.BLACK_LIGHT, { size: 0.04, seed: 10 });
  const ringAt = (t: number) => (t > 0.945 ? tipFur : Math.floor(t * 13) % 2 === 0 ? gingerFur : creamFur);
  const tailColor = paint((_p, _n, s) => ringAt(s[0]));
  const tailTuftColor = paint((p) => ringAt(tailPath.closestT(p)));
  const tailSweep = b.sweep(tail, [0.056, 0.078, 0.092, 0.092, 0.074, 0.04], {
    color: tailColor,
    sides: 10,
    caps: "round",
  });

  // ------------------------------------------------------------------ head
  const HC: V = [0, 0.41, 0.295];
  const hp = (dx: number, dy: number, dz: number): V => [HC[0] + dx, HC[1] + dy, HC[2] + dz];
  const ball = (color: Col, at: V, r: V, extra: any = {}, w = 10, h = 7) =>
    b.part(new THREE.SphereGeometry(1, w, h), color, { at, scale: r, ...extra });

  ball(headRust, hp(0, 0, 0), [0.103, 0.088, 0.092], { bone: head }, 14, 10);
  const mask = ball(whiteFur, hp(0, -0.012, 0.04), [0.1, 0.078, 0.074], { bone: head }, 14, 10);
  for (const s of [1, -1]) {
    ball(whiteFur, hp(s * 0.08, -0.034, 0.012), [0.045, 0.04, 0.052], { bone: head }, 10, 7);
    ball(whiteFur, hp(s * 0.085, 0.012, 0.02), [0.032, 0.04, 0.05], { bone: head }, 10, 7);
  }

  // muzzle (upper jaw), nose, lower jaw, mouth
  const muzzle = ball(whiteFur, hp(0, -0.027, 0.1), [0.043, 0.032, 0.05], { bone: head }, 12, 8);
  ball(C.NOSE, hp(0, -0.011, 0.142), [0.02, 0.014, 0.016], { bone: head }, 8, 6);
  ball(C.MOUTH, hp(0, -0.056, 0.088), [0.03, 0.011, 0.042], { bone: head }, 8, 6);
  ball(whiteFur, hp(0, -0.066, 0.108), [0.036, 0.018, 0.048], { bone: jaw }, 10, 7);
  ball(C.PINK, hp(0, -0.05, 0.11), [0.02, 0.007, 0.036], { bone: jaw }, 8, 5);
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.005, 0.014, 4), C.TOOTH, {
      at: hp(s * 0.02, -0.058, 0.128),
      dir: [0, -1, 0],
      bone: head,
      flat: true,
    });
  }

  // eyes, sparkles, raised brows, blush
  for (const s of [1, -1]) {
    ball(C.EYE, hp(s * 0.05, 0.022, 0.088), [0.0185, 0.021, 0.016], { bone: head }, 10, 7);
    ball(C.SPARK, hp(s * 0.05 - 0.006, 0.03, 0.101), [0.0058, 0.0058, 0.004], { bone: head }, 6, 4);
    ball(C.SPARK, hp(s * 0.05 + 0.0055, 0.014, 0.101), [0.003, 0.003, 0.002], { bone: head }, 5, 4);
    ball(whiteFur, hp(s * 0.052, 0.056, 0.06), [0.021, 0.0085, 0.014], { bone: head, rotation: [0, 0, 14 * s] }, 8, 5);
    ball(C.BLUSH, hp(s * 0.075, -0.022, 0.082), [0.016, 0.011, 0.008], { bone: head, rotation: [0, s * 28, 0] }, 8, 5);
  }

  // tear marks draped over the face
  const faceSurf = b.surface([mask, muzzle]);
  for (const s of [1, -1]) {
    const raw: V[] = [
      hp(s * 0.036, 0.004, 0.115),
      hp(s * 0.04, -0.018, 0.135),
      hp(s * 0.044, -0.04, 0.14),
      hp(s * 0.046, -0.054, 0.125),
    ];
    const draped = faceSurf.drape(catmull(raw), { lift: 0.0008 });
    b.sweep(draped, [0.0045, 0.0075], { color: C.TEAR, bone: head, sides: 6 });
  }

  // ears: white rim, dark inside
  const earOuter: OutlinePoint[] = [
    [-0.038, 0],
    [0.038, 0],
    [0.032, 0.04],
    [0, 0.088, "sharp"],
    [-0.032, 0.04],
  ];
  const earInner: OutlinePoint[] = [
    [-0.024, 0.012],
    [0.024, 0.012],
    [0.02, 0.04],
    [0, 0.07, "sharp"],
    [-0.02, 0.04],
  ];
  const phi = (24 * Math.PI) / 180;
  for (const s of [1, -1]) {
    const eb = hp(s * 0.066, 0.052, -0.004);
    const ex: V = [Math.cos(phi), -s * Math.sin(phi), 0];
    const ey: V = [s * Math.sin(phi), Math.cos(phi), -0.12];
    b.extrude(earOuter, {
      at: eb,
      x: ex,
      y: ey,
      thickness: 0.016,
      bevel: 0.003,
      smoothing: 1,
      color: whiteFur,
      bone: head,
    });
    b.extrude(earInner, { at: eb, x: ex, y: ey, thickness: 0.022, smoothing: 1, color: C.EAR_IN, bone: head });
    ball(headRust, hp(s * 0.07, 0.045, -0.02), [0.032, 0.024, 0.03], { bone: head }, 8, 6);
  }

  // fluffy cheek tufts
  const tuftDirs: V[] = [
    [1, -0.05, -0.6],
    [1, -0.35, -0.5],
    [0.8, -0.7, -0.4],
  ];
  for (const s of [1, -1]) {
    tuftDirs.forEach((d, i) => {
      const base = hp(s * (0.1 - i * 0.012), -0.012 - i * 0.026, i * 0.012);
      const dir: V = [s * d[0], d[1], d[2]];
      const n = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
      b.part(new THREE.ConeGeometry(0.02, 0.062, 5), whiteFur, {
        at: [base[0] + n.x * 0.026, base[1] + n.y * 0.026, base[2] + n.z * 0.026],
        dir,
        bone: head,
        flat: true,
      });
    });
  }

  // whiskers
  for (const s of [1, -1]) {
    const wd: V[] = [
      [s * 1, 0.25, 0.35],
      [s * 1, 0, 0.3],
      [s * 1, -0.25, 0.25],
    ];
    for (const d of wd) {
      const a = new THREE.Vector3(...hp(s * 0.034, -0.03, 0.105));
      const dv = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      const e = a.clone().addScaledVector(dv, 0.1);
      b.rod(a, e, [0.0016, 0.0008], { color: C.WHISKER, bone: head, sides: 4 });
    }
  }

  // ------------------------------------------------------------------ fur cards
  const furTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
      <path d="M3 64 C1 42 11 20 16 0 C21 20 31 42 29 64 Z" fill="#cfcfcf"/>
      <path d="M10 64 C9 44 14 24 16 8 C18 24 23 44 22 64 Z" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const tailHits = b.surface(tailSweep).scatter(150, { rng: rng(41), minDist: 0.028 });
  b.cards(tailHits, furTex, {
    size: [0.045, 0.085],
    lean: 68,
    bend: 25,
    vary: 0.25,
    rng: rng(42),
    color: tailTuftColor,
  });
  const bodyHits = b.surface(bodySweep).scatter(130, {
    rng: rng(31),
    minDist: 0.04,
    filter: (h) => h.n.y > -0.1,
  });
  b.cards(bodyHits, furTex, {
    size: [0.045, 0.075],
    lean: 62,
    bend: 20,
    vary: 0.3,
    rng: rng(32),
    color: coat,
  });

  // ------------------------------------------------------------------ branch dressing
  const okSpot = (x: number, z: number): boolean => feet.every(([fx, fz]) => Math.hypot(x - fx, z - fz) > 0.075);

  const mossHits = branchSurf.scatter(70, {
    rng: rng(21),
    minDist: 0.075,
    filter: (h) => h.n.y > 0.4 && okSpot(h.at.x, h.at.z),
  });
  const mossPalette = [C.MOSS, C.MOSS_DARK, C.MOSS_LIGHT];
  for (const h of mossHits) {
    const k = 0.032 + rand() * 0.028;
    const col = mossPalette[Math.floor(rand() * 3)] ?? C.MOSS;
    b.stick(new THREE.SphereGeometry(1, 6, 4), col, h, {
      scale: [k, k * 0.5, k * 1.05],
      embed: 0.25,
      flat: true,
      bone: root,
    });
  }

  const mossTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32">
      <path d="M4 32 L7 9 L12 32 Z" fill="#4c7d28"/>
      <path d="M10 32 L16 4 L21 32 Z" fill="#6a9c32"/>
      <path d="M18 32 L26 1 L30 32 Z" fill="#8cbb44"/>
      <path d="M27 32 L35 6 L39 32 Z" fill="#5f9130"/>
      <path d="M34 32 L42 11 L45 32 Z" fill="#7aaa3a"/>
    </svg>`,
    { size: 96 },
  );
  const mossCards = branchSurf.scatter(110, {
    rng: rng(22),
    minDist: 0.04,
    filter: (h) => h.n.y > 0.1 && okSpot(h.at.x, h.at.z),
  });
  b.cards(mossCards, mossTex, { size: [0.055, 0.04], lean: 20, vary: 0.35, rng: rng(23), cross: true });

  // broken stubs with cut ends
  const stub = (t: number, az: number, el: number, len: number, r: number): void => {
    const h = branchSurf.around(branchPath.at(t)).at(az, el);
    if (!h) return;
    const n = h.n.clone().normalize();
    const base = h.at.clone().addScaledVector(n, -0.02);
    const midP = base.clone().addScaledVector(n, len / 2);
    const endP = base.clone().addScaledVector(n, len);
    b.part(new THREE.CylinderGeometry(r * 0.75, r, len, 7), C.BARK_DARK, { at: midP, dir: n, bone: root, flat: true });
    b.part(new THREE.CylinderGeometry(r * 0.76, r * 0.76, 0.006, 7), C.WOOD, {
      at: endP,
      dir: n,
      bone: root,
      flat: true,
    });
  };
  stub(0.3, -90, 40, 0.13, 0.022);
  stub(0.7, 85, 30, 0.09, 0.018);

  // shelf fungi
  const shelf = (t: number, az: number, el: number, k: number, col: string): void => {
    const h = branchSurf.around(branchPath.at(t)).at(az, el);
    if (!h) return;
    b.part(new THREE.SphereGeometry(1, 8, 5), col, {
      at: h.at.clone().addScaledVector(h.n, 0.006),
      scale: [0.045 * k, 0.012 * k, 0.036 * k],
      rotation: [0, az, 0],
      bone: root,
      flat: true,
    });
  };
  shelf(0.2, 90, 15, 1, C.SHELF);
  shelf(0.22, 90, 34, 0.72, C.SHELF_DARK);
  shelf(0.27, -90, 20, 0.9, C.SHELF);

  // toadstools
  const toadstool = (x: number, z: number, k: number): void => {
    const y = topAt(x, z);
    b.part(new THREE.CylinderGeometry(0.008 * k, 0.011 * k, 0.05 * k, 7), C.CREAM, {
      at: [x, y + 0.02 * k, z],
      bone: root,
      flat: true,
    });
    const cap: OutlinePoint[] = [
      [0, 0],
      [0.036 * k, 0.002 * k],
      [0.038 * k, 0.01 * k],
      [0.03 * k, 0.024 * k],
      [0.014 * k, 0.033 * k],
      [0, 0.036 * k],
    ];
    b.lathe(cap, {
      at: [x, y + 0.04 * k, z],
      segments: 9,
      color: spots(C.CAP_RED, C.WHITE, { size: 0.018 * k, amount: 0.4, seed: 4 }),
      bone: root,
    });
  };
  toadstool(0.03, -0.55, 1.0);
  toadstool(-0.025, -0.62, 0.7);
  toadstool(0.02, -0.68, 0.5);

  // leafy side twig near the front end
  const twigHit = branchSurf.around(branchPath.at(0.9)).at(70, 50);
  if (twigHit) {
    const q = twigHit.at;
    const twig = bezier(
      [q.x, q.y, q.z],
      [q.x + 0.06, q.y + 0.12, q.z + 0.04],
      [q.x + 0.16, q.y + 0.2, q.z + 0.1],
      [q.x + 0.26, q.y + 0.2, q.z + 0.2],
    );
    b.sweep(twig, [0.016, 0.005], { color: C.BARK, bone: root, sides: 6 });
    for (const t of [0.4, 0.6, 0.8, 1.0]) {
      const p = twig.at(t);
      const tg = twig.tangentAt(t);
      for (const k of [-1, 1]) {
        const dir = tg.clone().multiplyScalar(0.6).add(new THREE.Vector3(k * 0.7, 0.25, k * -0.3));
        leaf(p, dir, 0.1, 0.04, k > 0 ? C.LEAF_A : C.LEAF_B, root, t * 3 + k);
      }
    }
  }

  // ------------------------------------------------------------------ final rest pose: happy open mouth, head turned toward the bamboo
  b.pose(jaw, { axis: [1, 0, 0], deg: 20 });
  b.pose(head, { axis: [0, 1, 0], deg: -12 });
  b.pose(head, { axis: [1, 0, 0], deg: -5 });

  return b.root;
}
