```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Red Panda on a Mossy Branch",
  description:
    "A delighted red panda balancing upright on a mossy branch in a little forest diorama: rusty back, black belly and legs, a white face with red tear marks, white-rimmed pointed ears, a bamboo shoot in one paw, one arm out for balance, and a big ringed tail hanging behind the branch.",
};

type V = [number, number, number];
type PIn = V | THREE.Vector3;

const v = (p: PIn): THREE.Vector3 =>
  p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);

// Orient a geometry so its local +Y points along yDir (local +Z as close to zHint as possible).
function orientYZ(geo: THREE.BufferGeometry, yDir: PIn, zHint: PIn = [0, 0, 1]) {
  const y = v(yDir).normalize();
  const x = new THREE.Vector3().crossVectors(y, v(zHint));
  if (x.lengthSq() < 1e-8) x.crossVectors(y, new THREE.Vector3(1, 0, 0));
  if (x.lengthSq() < 1e-8) x.crossVectors(y, new THREE.Vector3(0, 0, 1));
  x.normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  geo.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
  return geo;
}

// Orient a geometry so its local +Z points along zDir (local +Y as close to yHint as possible).
function orientZY(geo: THREE.BufferGeometry, zDir: PIn, yHint: PIn = [0, 1, 0]) {
  const z = v(zDir).normalize();
  const x = new THREE.Vector3().crossVectors(v(yHint), z);
  if (x.lengthSq() < 1e-8) x.crossVectors(new THREE.Vector3(0, 0, 1), z);
  if (x.lengthSq() < 1e-8) x.crossVectors(new THREE.Vector3(1, 0, 0), z);
  x.normalize();
  const y = new THREE.Vector3().crossVectors(z, x);
  geo.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
  return geo;
}

export default function build() {
  const b = createBuilder({ name: "red_panda" });
  const B: any = b;

  const R: any = rng(7321);
  const rand = (): number =>
    typeof R === "function"
      ? R()
      : typeof R.next === "function"
      ? R.next()
      : typeof R.random === "function"
      ? R.random()
      : R.float();
  const range = (a: number, c: number) => a + (c - a) * rand();
  const pick = <T,>(arr: T[]): T => arr[Math.min(arr.length - 1, Math.floor(rand() * arr.length))];

  const C = {
    rust: "#c4502a",
    rustDark: "#8e3420",
    rustLight: "#de7c3f",
    black: "#2a1a17",
    blackSoft: "#3a231d",
    white: "#f7f0e3",
    cream: "#f0d29a",
    tear: "#a2331d",
    nose: "#1b1212",
    eye: "#140d0e",
    shine: "#ffffff",
    mouth: "#4a161a",
    tongue: "#ea7586",
    earIn: "#4a1c14",
    claw: "#e8dcc0",
    tailG: "#c2552b",
    tailC: "#efcf98",
    tailTip: "#5c2516",
    bamboo: "#7fb546",
    bambooNode: "#4f7f2a",
    bambooTip: "#b4dc78",
    leaf: "#79b043",
    leafDark: "#4f8a2f",
    bark: "#6e4a33",
    barkDark: "#4c3122",
    hole: "#2a1a12",
    wood: "#d6b182",
    woodRing: "#a8794c",
    soil: "#5a3b28",
    moss1: "#5f9136",
    moss2: "#86bb4a",
    moss3: "#3f6e27",
    grass: "#6fa63c",
    grass2: "#94c456",
    stone: "#8d8a84",
    stone2: "#a6a29a",
    shroom: "#d8442f",
    shroomStem: "#f1e6cf",
    petal: "#f39ab8",
    petal2: "#b9a0ea",
    flower: "#f7d046",
    leafFall: "#e0913a",
    leafFall2: "#d2b445",
  };

  // ---------- helpers ----------
  const part = (geo: THREE.BufferGeometry, color: string, at: PIn, bone: any) => {
    const p = v(at);
    return B.part(geo, color, { at: [p.x, p.y, p.z], bone });
  };
  const partAbs = (geo: THREE.BufferGeometry, color: string, bone: any) => {
    geo.computeBoundingBox();
    const c = new THREE.Vector3();
    geo.boundingBox!.getCenter(c);
    geo.translate(-c.x, -c.y, -c.z);
    return part(geo, color, c, bone);
  };
  const ell = (
    c: PIn,
    r: V,
    color: string,
    bone: any,
    o: { y?: PIn; z?: PIn; hint?: PIn; seg?: [number, number]; ico?: number } = {}
  ) => {
    const geo =
      o.ico !== undefined
        ? new THREE.IcosahedronGeometry(1, o.ico)
        : new THREE.SphereGeometry(1, o.seg ? o.seg[0] : 10, o.seg ? o.seg[1] : 7);
    geo.scale(r[0], r[1], r[2]);
    if (o.y) orientYZ(geo, o.y, o.hint ?? [0, 0, 1]);
    else if (o.z) orientZY(geo, o.z, o.hint ?? [0, 1, 0]);
    return part(geo, color, c, bone);
  };
  const rod = (a: PIn, c: PIn, r0: number, r1: number, color: string, bone: any, radial = 7) => {
    const A = v(a), Cc = v(c);
    const d = Cc.clone().sub(A);
    const geo = new THREE.CylinderGeometry(r1, r0, Math.max(d.length(), 0.001), radial, 1);
    orientYZ(geo, d);
    return part(geo, color, A.add(Cc).multiplyScalar(0.5), bone);
  };
  const cap = (a: PIn, c: PIn, r: number, color: string, bone: any, radial = 8) => {
    const A = v(a), Cc = v(c);
    const d = Cc.clone().sub(A);
    const geo = new THREE.CapsuleGeometry(r, Math.max(d.length(), 0.001), 3, radial);
    orientYZ(geo, d);
    return part(geo, color, A.add(Cc).multiplyScalar(0.5), bone);
  };
  const cone = (
    base: PIn,
    dir: PIn,
    len: number,
    r: number,
    color: string,
    bone: any,
    radial = 5,
    flat = 1,
    hint: PIn = [0, 0, 1]
  ) => {
    const d = v(dir).normalize();
    const geo = new THREE.ConeGeometry(r, len, radial);
    if (flat !== 1) geo.scale(1, 1, flat);
    orientYZ(geo, d, hint);
    return part(geo, color, v(base).addScaledVector(d, len / 2), bone);
  };
  const onEll = (c: PIn, r: V, d: V, k = 1) => {
    const n = v(d).normalize();
    const cc = v(c);
    return new THREE.Vector3(cc.x + r[0] * n.x * k, cc.y + r[1] * n.y * k, cc.z + r[2] * n.z * k);
  };
  const ellNormal = (r: V, d: V) => {
    const n = v(d).normalize();
    return new THREE.Vector3(n.x / r[0], n.y / r[1], n.z / r[2]).normalize();
  };

  const J = (name: string, at: V, parent?: any, role?: string) => {
    const j = parent ? B.joint(name, { at, parent }) : B.joint(name, { at });
    if (role && j && j.userData) j.userData.role = role;
    return j;
  };

  // ---------- skeleton ----------
  const root = J("root", [0, 0, 0]);
  const hips = J("hips", [0, 0.64, -0.02], root, "spine");
  const spine1 = J("spine1", [0, 0.75, -0.015], hips, "spine");
  const chest = J("chest", [0, 0.85, 0.0], spine1, "spine");
  const neck = J("neck", [0, 0.91, 0.01], chest, "neck");
  const head = J("head", [0, 0.97, 0.03], neck, "head");
  const jaw = J("jaw", [0, 0.95, 0.09], head, "jaw");

  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = J("hip" + S, [0.065 * s, 0.63, -0.01], hips, "leg");
    const knee = J("knee" + S, [0.09 * s, 0.56, 0.05], hip, "leg");
    const ankle = J("ankle" + S, [0.09 * s, 0.49, -0.005], knee, "leg");
    const toe = J("toe" + S, [0.09 * s, 0.45, 0.05], ankle, "leg");
    legs[S] = { hip, knee, ankle, toe };
  }

  const shoulderL = J("shoulderL", [0.075, 0.87, 0.01], chest, "arm");
  const elbowL = J("elbowL", [0.17, 0.862, 0.035], shoulderL, "arm");
  const wristL = J("wristL", [0.255, 0.853, 0.05], elbowL, "arm");
  const pawL = J("pawL", [0.3, 0.85, 0.06], wristL, "arm");

  const shoulderR = J("shoulderR", [-0.075, 0.87, 0.01], chest, "arm");
  const elbowR = J("elbowR", [-0.14, 0.8, 0.08], shoulderR, "arm");
  const wristR = J("wristR", [-0.15, 0.85, 0.165], elbowR, "arm");
  const pawR = J("pawR", [-0.152, 0.88, 0.2], wristR, "arm");

  const tailPts: V[] = [
    [0, 0.63, -0.1],
    [0.0, 0.54, -0.18],
    [0.02, 0.42, -0.215],
    [0.05, 0.3, -0.2],
    [0.08, 0.22, -0.14],
    [0.1, 0.18, -0.05],
  ];
  const tailJ: any[] = [];
  tailPts.forEach((p, i) => tailJ.push(J("tail" + i, p, i === 0 ? hips : tailJ[i - 1], "tail")));

  // ---------- torso ----------
  ell([0, 0.68, -0.025], [0.1, 0.09, 0.088], C.rust, hips, { seg: [12, 8] });
  ell([0, 0.755, -0.015], [0.093, 0.08, 0.085], C.rust, spine1, { seg: [12, 8] });
  ell([0, 0.83, -0.005], [0.095, 0.1, 0.082], C.rust, chest, { seg: [12, 8] });
  // black belly and chest
  ell([0, 0.74, 0.035], [0.07, 0.125, 0.06], C.black, spine1, { seg: [10, 8] });
  ell([0, 0.845, 0.04], [0.058, 0.06, 0.05], C.blackSoft, chest, { seg: [10, 7] });
  // shoulder caps
  ell([0.07, 0.872, 0.0], [0.042, 0.042, 0.042], C.rust, chest);
  ell([-0.07, 0.872, 0.0], [0.042, 0.042, 0.042], C.rust, chest);
  // neck ruff
  ell([0, 0.912, 0.0], [0.078, 0.05, 0.072], C.rust, neck, { ico: 1 });
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.2;
    // skip the front (+Z) under the chin
    if (Math.sin(a) > 0.55) continue;
    const base: V = [0.06 * Math.cos(a), 0.905, 0.055 * Math.sin(a)];
    cone(base, [Math.cos(a), -0.55, Math.sin(a)], 0.045, 0.018, i % 2 ? C.rust : C.rustDark, neck, 4);
  }
  // back fur tufts
  for (let i = 0; i < 9; i++) {
    const sx = (i % 3) - 1;
    const ty = [0.68, 0.75, 0.82][Math.floor(i / 3)];
    const cc = i < 3 ? [0, 0.68, -0.025] : i < 6 ? [0, 0.755, -0.015] : [0, 0.83, -0.005];
    const rr: V = i < 3 ? [0.1, 0.09, 0.088] : i < 6 ? [0.093, 0.08, 0.085] : [0.095, 0.1, 0.082];
    const d: V = [sx * 0.55, (ty - cc[1]) * 3 + range(-0.1, 0.1), -1];
    const p = onEll(cc as V, rr, d, 0.92);
    const n = ellNormal(rr, d);
    const bone = i < 3 ? hips : i < 6 ? spine1 : chest;
    cone(p, n.add(new THREE.Vector3(0, -0.7, 0)), 0.04, 0.016, i % 2 ? C.rustDark : C.rustLight, bone, 4);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const L = legs[S];
    const hipP: V = [0.065 * s, 0.63, -0.01];
    const kneeP: V = [0.09 * s, 0.56, 0.05];
    const ankleP: V = [0.09 * s, 0.49, -0.005];
    ell([0.072 * s, 0.615, 0.0], [0.048, 0.062, 0.062], C.black, L.hip, { seg: [10, 7] });
    cap(hipP, kneeP, 0.036, C.black, L.hip);
    cap(kneeP, ankleP, 0.027, C.black, L.knee);
    // paw on the branch
    ell([0.09 * s, 0.47, 0.025], [0.034, 0.021, 0.05], C.black, L.ankle, { seg: [10, 6] });
    // toes and claws wrapping over the branch's front
    const bx = 0.09 * s;
    const ay = 0.39 + 0.01 * (bx + 0.5) / 1.12;
    const br = 0.07 + (0.042 - 0.07) * (bx + 0.5) / 1.12;
    for (const dx of [-0.022, -0.0075, 0.0075, 0.022]) {
      const th = 0.72;
      const rr = br + 0.011;
      ell([bx + dx, ay + rr * Math.cos(th), rr * Math.sin(th)], [0.011, 0.011, 0.012], C.black, L.toe, { seg: [6, 5] });
      const th2 = 1.02;
      const rr2 = br + 0.006;
      cone(
        [bx + dx, ay + rr2 * Math.cos(th2), rr2 * Math.sin(th2)],
        [0, -Math.sin(th2), Math.cos(th2)],
        0.016,
        0.0042,
        C.claw,
        L.toe,
        4
      );
    }
  }

  // ---------- left arm, out for balance ----------
  cap([0.075, 0.87, 0.01], [0.17, 0.862, 0.035], 0.029, C.black, shoulderL);
  cap([0.17, 0.862, 0.035], [0.255, 0.853, 0.05], 0.024, C.black, elbowL);
  ell([0.275, 0.852, 0.055], [0.032, 0.022, 0.03], C.black, wristL, { seg: [9, 6] });
  for (const dz of [-0.02, -0.007, 0.007, 0.02]) {
    ell([0.302, 0.85, 0.055 + dz], [0.01, 0.01, 0.009], C.black, pawL, { seg: [6, 5] });
    cone([0.308, 0.848, 0.055 + dz * 1.2], [1, -0.35, dz * 6], 0.016, 0.004, C.claw, pawL, 4);
  }

  // ---------- right arm, holding the bamboo ----------
  cap([-0.075, 0.87, 0.01], [-0.14, 0.8, 0.08], 0.029, C.black, shoulderR);
  cap([-0.14, 0.8, 0.08], [-0.15, 0.85, 0.165], 0.024, C.black, elbowR);
  ell([-0.152, 0.872, 0.19], [0.027, 0.031, 0.025], C.black, wristR, { seg: [9, 6] });
  for (const fy of [0.858, 0.873, 0.888]) {
    ell([-0.155, fy, 0.218], [0.012, 0.0085, 0.011], C.black, pawR, { seg: [6, 5] });
    cone([-0.146, fy, 0.226], [1, -0.2, 0.4], 0.01, 0.0035, C.claw, pawR, 4);
  }

  // bamboo shoot
  const bA = new THREE.Vector3(-0.13, 0.74, 0.205);
  const bB = new THREE.Vector3(-0.21, 1.1, 0.205);
  const bDir = bB.clone().sub(bA).normalize();
  const bAt = (t: number) => bA.clone().lerp(bB, t);
  const bR = (t: number) => 0.0135 + (0.0095 - 0.0135) * t;
  rod(bA, bB, 0.0135, 0.0095, C.bamboo, pawR, 8);
  cone(bB.clone().addScaledVector(bDir, -0.004), bDir, 0.06, 0.0095, C.bambooTip, pawR, 8);
  for (const t of [0.12, 0.36, 0.6, 0.82]) {
    const g = new THREE.CylinderGeometry(bR(t) + 0.0028, bR(t) + 0.0028, 0.008, 8);
    orientYZ(g, bDir);
    part(g, C.bambooNode, bAt(t), pawR);
  }
  // bottom cut face
  {
    const g = new THREE.CylinderGeometry(0.0125, 0.0125, 0.004, 8);
    orientYZ(g, bDir);
    part(g, C.bambooTip, bA.clone().addScaledVector(bDir, -0.001), pawR);
  }
  const leafDirs: V[] = [
    [-1, 0.45, 0.2],
    [-0.45, 0.95, -0.3],
    [-0.35, 0.55, 0.9],
  ];
  leafDirs.forEach((ld, i) => {
    const base = bAt(i === 1 ? 0.92 : 0.82);
    const d = v(ld).normalize();
    ell(base.clone().addScaledVector(d, 0.05), [0.016, 0.055, 0.0035], i % 2 ? C.leafDark : C.leaf, pawR, {
      y: d,
      hint: [0, 1, 0.3],
      seg: [8, 6],
    });
    rod(base, base.clone().addScaledVector(d, 0.03), 0.003, 0.002, C.bambooNode, pawR, 4);
  });

  // ---------- head ----------
  const H = new THREE.Vector3(0, 1.0, 0.04);
  const HR: V = [0.11, 0.09, 0.088];
  ell(H, HR, C.rust, head, { seg: [12, 9] });
  // crown fluff
  ell([0, 1.075, 0.02], [0.06, 0.03, 0.05], C.rustLight, head, { ico: 1 });

  // white muzzle, nose, mouth
  ell([0, 0.975, 0.105], [0.05, 0.032, 0.04], C.white, head, { seg: [10, 7] });
  ell([0, 0.997, 0.142], [0.02, 0.013, 0.013], C.nose, head, { seg: [8, 6] });
  ell([0.006, 1.003, 0.153], [0.004, 0.003, 0.003], C.shine, head, { seg: [5, 4] });
  rod([0, 0.987, 0.146], [0, 0.962, 0.141], 0.0025, 0.0025, C.nose, head, 4);
  ell([0, 0.948, 0.124], [0.03, 0.02, 0.02], C.mouth, head, { seg: [9, 6] });

  // jaw: lower lip and tongue (open, happy mouth)
  ell([0, 0.928, 0.11], [0.036, 0.017, 0.03], C.white, jaw, { seg: [9, 6] });
  ell([0, 0.94, 0.126], [0.017, 0.006, 0.014], C.tongue, jaw, { seg: [8, 5] });

  // white cheeks + flaring cheek tufts
  for (const s of [1, -1]) {
    const CL: V = [0.066 * s, 0.96, 0.09];
    const CR: V = [0.05, 0.042, 0.045];
    ell(CL, CR, C.white, head, { seg: [10, 7] });
    cone([0.1 * s, 0.955, 0.075], [s, -0.45, -0.1], 0.05, 0.02, C.white, head, 5);
    cone([0.105 * s, 0.975, 0.06], [s, -0.05, -0.25], 0.045, 0.018, C.white, head, 5);
    cone([0.095 * s, 0.94, 0.07], [s * 0.6, -1, 0.1], 0.04, 0.016, C.white, head, 5);

    // red tear marks running down from the eyes
    const tdirs: V[] = [
      [-0.25 * s, 0.6, 0.76],
      [-0.1 * s, 0.25, 0.96],
      [0.05 * s, -0.15, 0.99],
      [0.17 * s, -0.5, 0.85],
    ];
    const pts = tdirs.map((d) => onEll(CL, CR, d).addScaledVector(ellNormal(CR, d), 0.002));
    const curve = new THREE.CatmullRomCurve3(pts);
    partAbs(new THREE.TubeGeometry(curve, 10, 0.0068, 5, false), C.tear, head);
    ell(pts[3], [0.008, 0.008, 0.006], C.tear, head, { z: ellNormal(CR, tdirs[3]), seg: [6, 4] });

    // eyes with sparkle
    const ed: V = [0.4 * s, 0.14, 0.9];
    const eN = ellNormal(HR, ed);
    const eP = onEll(H, HR, ed, 0.965);
    ell(eP, [0.02, 0.023, 0.016], C.eye, head, { z: eN, seg: [10, 8] });
    const sh = eP.clone().addScaledVector(eN, 0.013);
    ell(sh.clone().add(new THREE.Vector3(0.006, 0.008, 0)), [0.0058, 0.0058, 0.004], C.shine, head, { seg: [6, 5] });
    ell(sh.clone().add(new THREE.Vector3(-0.005, -0.006, 0.001)), [0.003, 0.003, 0.002], C.shine, head, { seg: [5, 4] });

    // white brow spots, raised in delight
    const bd: V = [0.33 * s, 0.52, 0.8];
    ell(onEll(H, HR, bd, 0.97), [0.024, 0.014, 0.009], C.white, head, {
      z: ellNormal(HR, bd),
      hint: [-0.35 * s, 1, 0],
      seg: [8, 5],
    });

    // pointed ears with white rims
    const earBase = onEll(H, HR, [0.62 * s, 0.72, 0.05], 0.95);
    const earDir = v([0.5 * s, 1, 0.06]).normalize();
    const ex = new THREE.Vector3().crossVectors(earDir, new THREE.Vector3(0, 0, 1)).normalize();
    const fwd = new THREE.Vector3().crossVectors(ex, earDir).normalize();
    {
      const g = new THREE.ConeGeometry(0.046, 0.082, 5);
      g.scale(1, 1, 0.5);
      orientYZ(g, earDir, [0, 0, 1]);
      part(g, C.rust, earBase.clone().addScaledVector(earDir, 0.032), head);
    }
    {
      const g = new THREE.ConeGeometry(0.041, 0.074, 5);
      g.scale(1, 1, 0.4);
      orientYZ(g, earDir, [0, 0, 1]);
      part(g, C.white, earBase.clone().addScaledVector(earDir, 0.031).addScaledVector(fwd, 0.008), head);
    }
    {
      const g = new THREE.ConeGeometry(0.026, 0.05, 5);
      g.scale(1, 1, 0.35);
      orientYZ(g, earDir, [0, 0, 1]);
      part(g, C.earIn, earBase.clone().addScaledVector(earDir, 0.024).addScaledVector(fwd, 0.0145), head);
    }
    // white tuft inside the ear
    cone(
      earBase.clone().addScaledVector(earDir, 0.006).addScaledVector(fwd, 0.016),
      earDir.clone().addScaledVector(ex, -0.4 * s),
      0.03,
      0.008,
      C.white,
      head,
      4
    );

    // whiskers
    for (const wy of [0.15, 0, -0.15]) {
      const a = new THREE.Vector3(0.045 * s, 0.972 + wy * 0.03, 0.126);
      const d = v([s, wy, 0.32]).normalize();
      rod(a, a.clone().addScaledVector(d, 0.07), 0.0014, 0.0008, C.white, head, 3);
    }
  }

  // ---------- tail: big, fluffy, ringed ----------
  const tailCurve = new THREE.CatmullRomCurve3(tailPts.map((p) => v(p)));
  const N = 13;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const p = tailCurve.getPointAt(t);
    const tan = tailCurve.getTangentAt(t);
    let best = 0;
    let bd = Infinity;
    tailPts.forEach((q, k) => {
      const d = p.distanceTo(v(q));
      if (d < bd) {
        bd = d;
        best = k;
      }
    });
    const bone = tailJ[best];
    const r = i === N - 1 ? 0.042 : 0.05 + 0.028 * Math.sin(Math.PI * Math.min(1, 0.2 + t * 0.85));
    const color = i === 0 ? C.rust : i === N - 1 ? C.tailTip : i % 2 ? C.tailC : C.tailG;
    const hint = v([range(-1, 1), range(-1, 1), range(-1, 1)]);
    ell(p, [r, 0.04, r * 0.96], color, bone, { y: tan, hint, ico: 1 });
    // fluffy tufts poking out of each ring
    const side = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0.3)).normalize();
    const up = new THREE.Vector3().crossVectors(side, tan).normalize();
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + i * 0.9;
      const n = side.clone().multiplyScalar(Math.cos(a)).addScaledVector(up, Math.sin(a));
      cone(
        p.clone().addScaledVector(n, r * 0.8),
        n.clone().addScaledVector(tan, 0.6),
        0.03,
        0.016,
        color,
        bone,
        4
      );
    }
  }

  // ---------- diorama: base ----------
  part(new THREE.CylinderGeometry(0.7, 0.74, 0.07, 10), C.soil, [0, 0.035, 0], root);
  part(new THREE.CylinderGeometry(0.69, 0.7, 0.02, 10), C.moss1, [0, 0.075, 0], root);
  const GY = 0.085;
  // rim stones
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + range(-0.15, 0.15);
    const s = range(0.025, 0.04);
    ell([0.7 * Math.cos(a), 0.06, 0.7 * Math.sin(a)], [s * 1.3, s, s], i % 2 ? C.stone : C.stone2, root, { ico: 0, y: [range(-0.3, 0.3), 1, range(-0.3, 0.3)] });
  }
  // moss bumps on the ground
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const rr = range(0.15, 0.62);
    const s = range(0.03, 0.06);
    ell([rr * Math.cos(a), GY - 0.005, rr * Math.sin(a)], [s, s * 0.35, s * 0.85], pick([C.moss1, C.moss2, C.moss3]), root, { ico: 1 });
  }
  const TX = -0.5, TZ = -0.03;
  // grass tufts
  for (let i = 0; i < 18; i++) {
    const a = rand() * Math.PI * 2;
    const rr = range(0.2, 0.64);
    const px = rr * Math.cos(a), pz = rr * Math.sin(a);
    if (Math.hypot(px - TX, pz - TZ) < 0.2) continue;
    for (let k = 0; k < 4; k++) {
      cone(
        [px + range(-0.012, 0.012), GY - 0.004, pz + range(-0.012, 0.012)],
        [range(-0.4, 0.4), 1, range(-0.4, 0.4)],
        range(0.04, 0.085),
        0.0065,
        k % 2 ? C.grass : C.grass2,
        root,
        3
      );
    }
  }
  // pebbles
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    const rr = range(0.25, 0.6);
    const s = range(0.014, 0.026);
    ell([rr * Math.cos(a), GY + s * 0.3, rr * Math.sin(a)], [s * 1.2, s * 0.8, s], pick([C.stone, C.stone2]), root, { ico: 0 });
  }
  // fallen leaves
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    const rr = range(0.2, 0.6);
    ell(
      [rr * Math.cos(a), GY + 0.003, rr * Math.sin(a)],
      [0.016, 0.036, 0.003],
      pick([C.leafFall, C.leafFall2]),
      root,
      { y: [Math.cos(a * 3), 0.15, Math.sin(a * 3)], hint: [0, 1, 0], seg: [7, 5] }
    );
  }
  // flowers
  const flowerSpots: V[] = [
    [0.35, 0, 0.42],
    [0.5, 0, 0.18],
    [-0.2, 0, 0.5],
    [0.18, 0, -0.45],
  ];
  flowerSpots.forEach((fp, i) => {
    const h = range(0.05, 0.08);
    rod([fp[0], GY - 0.003, fp[2]], [fp[0], GY + h, fp[2]], 0.003, 0.0025, C.leafDark, root, 4);
    const top = new THREE.Vector3(fp[0], GY + h, fp[2]);
    ell(top, [0.008, 0.006, 0.008], C.flower, root, { seg: [6, 4] });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ell(
        [top.x + 0.012 * Math.cos(a), top.y - 0.001, top.z + 0.012 * Math.sin(a)],
        [0.009, 0.003, 0.006],
        i % 2 ? C.petal2 : C.petal,
        root,
        { y: [Math.cos(a), 0, Math.sin(a)], hint: [0, 1, 0], seg: [6, 4] }
      );
    }
  });
  // mushrooms
  const shrooms: [number, number, number][] = [
    [-0.33, 0.2, 1],
    [-0.62, 0.17, 0.8],
    [-0.38, -0.24, 0.65],
  ];
  shrooms.forEach(([sx, sz, k]) => {
    rod([sx, GY - 0.003, sz], [sx, GY + 0.045 * k, sz], 0.016 * k, 0.012 * k, C.shroomStem, root, 7);
    const capG = new THREE.SphereGeometry(0.036 * k, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    capG.scale(1, 0.75, 1);
    part(capG, C.shroom, [sx, GY + 0.04 * k, sz], root);
    for (let d = 0; d < 4; d++) {
      const a = d * 1.7 + 0.4;
      const el = 0.55 + (d % 2) * 0.35;
      const rr = 0.036 * k;
      ell(
        [sx + rr * Math.cos(el) * Math.cos(a), GY + 0.04 * k + rr * 0.75 * Math.sin(el), sz + rr * Math.cos(el) * Math.sin(a)],
        [0.0065 * k, 0.0035 * k, 0.0065 * k],
        C.shroomStem,
        root,
        { seg: [6, 4], y: [Math.cos(el) * Math.cos(a), Math.sin(el), Math.cos(el) * Math.sin(a)] }
      );
    }
  });

  // ---------- diorama: tree trunk ----------
  const TB = GY - 0.005, TT = 0.765;
  const trR = (y: number) => 0.12 + (0.085 - 0.12) * ((y - TB) / (TT - TB));
  rod([TX, TB, TZ], [TX, TT, TZ], 0.12, 0.085, C.bark, root, 9);
  // cut top with growth rings
  part(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 9), C.wood, [TX, TT + 0.004, TZ], root);
  part(new THREE.CylinderGeometry(0.055, 0.055, 0.016, 9), C.woodRing, [TX, TT + 0.006, TZ], root);
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), C.wood, [TX, TT + 0.008, TZ], root);
  // bark ridges
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const c = Math.cos(a), s = Math.sin(a);
    const y0 = TB + 0.03, y1 = TT - range(0.03, 0.12);
    const p0 = new THREE.Vector3(TX + trR(y0) * c, y0, TZ + trR(y0) * s);
    const p1 = new THREE.Vector3(TX + trR(y1) * c, y1, TZ + trR(y1) * s);
    const g = new THREE.BoxGeometry(0.022, p0.distanceTo(p1), 0.014);
    orientYZ(g, p1.clone().sub(p0), [c, 0, s]);
    part(g, C.barkDark, p0.add(p1).multiplyScalar(0.5), root);
  }
  // roots
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.6;
    const c = Math.cos(a), s = Math.sin(a);
    rod([TX + 0.07 * c, 0.14, TZ + 0.07 * s], [TX + 0.24 * c, GY, TZ + 0.24 * s], 0.05, 0.016, C.bark, root, 6);
  }
  // knot hole facing the viewer
  {
    const y = 0.58;
    const p = new THREE.Vector3(TX + 0.02, y, TZ + trR(y) - 0.004);
    ell(p, [0.022, 0.032, 0.012], C.hole, root, { seg: [8, 6] });
    const tor = new THREE.TorusGeometry(0.027, 0.008, 5, 10);
    tor.scale(1, 1.3, 1);
    part(tor, C.barkDark, p.clone().add(new THREE.Vector3(0, 0, 0.004)), root);
  }
  // moss on the trunk
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const y = i < 9 ? range(TB + 0.02, 0.3) : TT - range(0.0, 0.03);
    const n = new THREE.Vector3(Math.cos(a), i < 9 ? 0.2 : 0.8, Math.sin(a)).normalize();
    const p = new THREE.Vector3(TX + trR(y) * Math.cos(a), y, TZ + trR(y) * Math.sin(a));
    const s = range(0.022, 0.04);
    ell(p, [s * 1.2, s * 0.45, s], pick([C.moss1, C.moss2, C.moss3]), root, { y: n, hint: [1, 0, 0], ico: 1 });
  }

  // ---------- diorama: the mossy branch ----------
  const BX0 = -0.5, BX1 = 0.62;
  const axY = (x: number) => 0.39 + 0.01 * (x - BX0) / (BX1 - BX0);
  const brR = (x: number) => 0.07 + (0.042 - 0.07) * (x - BX0) / (BX1 - BX0);
  rod([BX0, axY(BX0), 0], [BX1, axY(BX1), 0], 0.07, 0.042, C.bark, root, 9);
  // cut end
  {
    const g = new THREE.CylinderGeometry(0.039, 0.039, 0.006, 9);
    orientYZ(g, [1, 0, 0]);
    part(g, C.wood, [BX1 + 0.002, axY(BX1), 0], root);
    const g2 = new THREE.CylinderGeometry(0.022, 0.022, 0.008, 8);
    orientYZ(g2, [1, 0, 0]);
    part(g2, C.woodRing, [BX1 + 0.003, axY(BX1), 0], root);
  }
  // bark streaks along the branch
  for (let i = 0; i < 7; i++) {
    const th = (i / 7) * Math.PI * 2 + 0.3;
    const x0 = range(-0.4, 0.0), x1 = x0 + range(0.15, 0.35);
    const p0 = new THREE.Vector3(x0, axY(x0) + brR(x0) * Math.cos(th), brR(x0) * Math.sin(th));
    const p1 = new THREE.Vector3(x1, axY(x1) + brR(x1) * Math.cos(th), brR(x1) * Math.sin(th));
    const g = new THREE.BoxGeometry(0.012, p0.distanceTo(p1), 0.008);
    orientYZ(g, p1.clone().sub(p0), [0, Math.cos(th), Math.sin(th)]);
    part(g, C.barkDark, p0.add(p1).multiplyScalar(0.5), root);
  }
  // knot on the branch
  {
    const x = 0.3, th = 1.7;
    const n = new THREE.Vector3(0, Math.cos(th), Math.sin(th));
    const p = new THREE.Vector3(x, axY(x), 0).addScaledVector(n, brR(x));
    const tor = new THREE.TorusGeometry(0.016, 0.006, 5, 9);
    orientZY(tor, n, [1, 0, 0]);
    part(tor, C.barkDark, p, root);
    ell(p.clone().addScaledVector(n, -0.003), [0.012, 0.012, 0.006], C.hole, root, { z: n, seg: [6, 4] });
  }
  // moss clumps on top and sides
  for (let i = 0; i < 48; i++) {
    const x = range(-0.42, 0.58);
    const th = range(-1.5, 1.5);
    if (Math.abs(Math.abs(x) - 0.09) < 0.065 && th > -0.6 && th < 1.25) continue;
    const n = new THREE.Vector3(0, Math.cos(th), Math.sin(th));
    const p = new THREE.Vector3(x, axY(x), 0).addScaledVector(n, brR(x) * 0.96);
    const s = range(0.016, 0.032);
    ell(p, [s * 1.4, s * 0.5, s], pick([C.moss1, C.moss2, C.moss2, C.moss3]), root, { y: n, hint: [1, 0, 0], ico: 1 });
  }
  // hanging moss strands
  for (let i = 0; i < 11; i++) {
    const x = range(-0.4, 0.55);
    if (x > -0.04 && x < 0.17) continue;
    const z = range(-0.025, 0.025);
    const p = new THREE.Vector3(x, axY(x) - brR(x) * 0.9, z);
    const len = range(0.05, 0.13);
    cone(p, [range(-0.1, 0.1), -1, range(-0.1, 0.1)], len, 0.009, pick([C.moss1, C.moss3]), root, 4);
    cone(p.clone().add(new THREE.Vector3(0.012, 0, 0.005)), [0.15, -1, 0], len * 0.6, 0.006, C.moss2, root, 4);
  }
  // moss collar where the branch meets the trunk
  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2;
    const n = new THREE.Vector3(0, Math.cos(th), Math.sin(th));
    const p = new THREE.Vector3(-0.41, axY(-0.41), 0).addScaledVector(n, brR(-0.41) * 0.95);
    ell(p, [0.03, 0.014, 0.026], pick([C.moss1, C.moss2]), root, { y: n, hint: [1, 0, 0], ico: 1 });
  }
  // twigs with leaves
  const twig = (x: number, th: number, dir: V, len: number, leaves: number) => {
    const n = new THREE.Vector3(0, Math.cos(th), Math.sin(th));
    const base = new THREE.Vector3(x, axY(x), 0).addScaledVector(n, brR(x) * 0.7);
    const d = v(dir).normalize();
    const tip = base.clone().addScaledVector(d, len);
    rod(base, tip, 0.011, 0.005, C.bark, root, 5);
    for (let k = 0; k < leaves; k++) {
      const t = 0.45 + (k / Math.max(1, leaves - 1)) * 0.55;
      const at = base.clone().lerp(tip, t);
      const side = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 0, 1));
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
      side.normalize().multiplyScalar(k % 2 ? 1 : -1);
      const ld = side.clone().addScaledVector(d, 0.8).normalize();
      ell(at.clone().addScaledVector(ld, 0.035), [0.017, 0.04, 0.0035], k % 2 ? C.leaf : C.leafDark, root, {
        y: ld,
        hint: [0.2, 1, 0.5],
        seg: [7, 5],
      });
    }
  };
  twig(0.36, 0.3, [0.45, 0.8, 0.45], 0.2, 4);
  twig(0.5, -0.4, [0.5, 0.6, -0.6], 0.15, 3);
  twig(-0.3, -0.2, [0.2, 1, -0.3], 0.17, 3);
  twig(0.22, 2.2, [0.35, -0.35, 0.85], 0.12, 2);

  return b.root;
}
```