```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Armored Knight",
  description:
    "A stylized low-poly knight in full plate in a rigging T-pose. He wears a great helm with a hinged visor and a red crest, a blue tabard with a gold cross and a crimson cape. He grips a longsword in his right hand and carries a kite shield on his left forearm.",
};

const C = {
  steel: "#a9b2bd",
  steelDk: "#6b7480",
  steelLt: "#d6dce3",
  gold: "#d8a836",
  mail: "#59606a",
  leather: "#5a3a22",
  blue: "#22418f",
  blueDk: "#16295e",
  red: "#b3212c",
  redDk: "#7a1219",
  black: "#121418",
  white: "#efe7d6",
};

type V3 = [number, number, number];

export default function build() {
  const b: any = createBuilder({ name: "knight" });

  // ---------- geometry helpers ----------
  const cyl = (rt: number, rb: number, h: number, s = 8) =>
    new THREE.CylinderGeometry(rt, rb, h, s, 1, false, Math.PI / s);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const gem = (r: number) => new THREE.IcosahedronGeometry(r, 0);
  const dome = (r: number) => new THREE.SphereGeometry(r, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const ringY = (r: number, t: number, seg = 12) => {
    const g = new THREE.TorusGeometry(r, t, 4, seg);
    g.rotateX(Math.PI / 2);
    return g;
  };

  const P = (geo: THREE.BufferGeometry, color: string, at: V3, bone: any, extra: any = {}) =>
    b.part(geo, color, { at, bone, ...extra });

  const seg = (
    a: V3,
    c: V3,
    mk: (len: number) => THREE.BufferGeometry,
    color: string,
    bone: any,
    extra: any = {}
  ) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const len = d.length();
    const m = A.clone().add(B).multiplyScalar(0.5);
    return b.part(mk(len), color, {
      at: [m.x, m.y, m.z],
      dir: [d.x / len, d.y / len, d.z / len],
      bone,
      ...extra,
    });
  };

  // ---------- skeleton ----------
  const J = (name: string, at: V3, parent?: any) =>
    parent ? b.joint(name, { at, parent }) : b.joint(name, { at });

  const hips = J("hips", [0, 1.0, 0]);
  const spine = J("spine", [0, 1.14, 0], hips);
  const chest = J("chest", [0, 1.32, 0], spine);
  const neck = J("neck", [0, 1.54, 0], chest);
  const head = J("head", [0, 1.63, 0], neck);
  const jaw = J("jaw", [0, 1.76, 0.05], head); // hinged visor
  J("headTop", [0, 1.9, 0], head);

  const arm: Record<string, any> = {};
  const leg: Record<string, any> = {};
  for (const [S, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const sh = J(`shoulder${S}`, [s * 0.12, 1.47, 0], chest);
    const ua = J(`upperArm${S}`, [s * 0.24, 1.47, 0], sh);
    const el = J(`elbow${S}`, [s * 0.52, 1.47, 0], ua);
    const ha = J(`hand${S}`, [s * 0.82, 1.47, 0], el);
    J(`fingers${S}`, [s * 0.95, 1.47, 0], ha);
    arm[S] = { sh, ua, el, ha };
    const hp = J(`hip${S}`, [s * 0.1, 0.94, 0], hips);
    const kn = J(`knee${S}`, [s * 0.105, 0.52, 0], hp);
    const an = J(`ankle${S}`, [s * 0.105, 0.1, -0.01], kn);
    J(`toe${S}`, [s * 0.105, 0.03, 0.14], an);
    leg[S] = { hp, kn, an };
  }

  // ---------- torso ----------
  P(cyl(0.15, 0.16, 0.18), C.mail, [0, 1.1, 0], spine, { scale: [1, 1, 0.75] });
  P(cyl(0.21, 0.165, 0.36), C.steel, [0, 1.33, 0], chest, { scale: [1, 1, 0.72] });
  P(cyl(0.13, 0.21, 0.06), C.steel, [0, 1.54, 0], chest, { scale: [1, 1, 0.72] });
  P(ringY(0.135, 0.012), C.gold, [0, 1.57, 0], chest, { scale: [1, 1, 0.72] });
  P(ringY(0.17, 0.012), C.gold, [0, 1.15, 0], chest, { scale: [1, 1, 0.72] });
  // breastplate lames and ridge
  P(ringY(0.19, 0.008), C.steelDk, [0, 1.22, 0], chest, { scale: [1, 1, 0.72] });
  seg([0, 1.16, 0.115], [0, 1.5, 0.142], (l) => box(0.025, l, 0.02), C.steelLt, chest);
  // gold sun emblem
  P(cyl(0.05, 0.05, 0.015), C.gold, [0, 1.37, 0.14], chest, { dir: [0, 0.08, 1] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(new THREE.ConeGeometry(0.018, 0.05, 4), C.gold, [Math.cos(a) * 0.07, 1.37 + Math.sin(a) * 0.07, 0.135], chest, {
      dir: [Math.cos(a), Math.sin(a), 0],
    });
  }
  P(gem(0.026), C.red, [0, 1.37, 0.152], chest);

  // faulds with rivets
  for (let i = 0; i < 3; i++) {
    const y = 1.04 - i * 0.055;
    const r = 0.178 + i * 0.015;
    P(cyl(0.17 + i * 0.015, 0.185 + i * 0.015, 0.06), i % 2 ? C.steelLt : C.steel, [0, y, 0], hips, {
      scale: [1, 1, 0.75],
    });
    for (let k = -2; k <= 2; k++) {
      const a = k * 0.5;
      P(sph(0.008, 4, 3), C.gold, [Math.sin(a) * (r + 0.004), y, Math.cos(a) * (r + 0.004) * 0.75], hips);
    }
  }
  P(cyl(0.2, 0.22, 0.12), C.mail, [0, 0.88, 0], hips, { scale: [1, 1, 0.8] });
  // belt + buckle
  P(ringY(0.172, 0.018), C.leather, [0, 1.09, 0], hips, { scale: [1, 1, 0.76] });
  P(box(0.055, 0.05, 0.015), C.gold, [0, 1.09, 0.14], hips);
  P(box(0.03, 0.025, 0.01), C.black, [0, 1.09, 0.147], hips);

  // tabard front and back
  for (const zs of [1, -1]) {
    const z = 0.178 * zs;
    P(box(0.29, 0.44, 0.012), C.gold, [0, 0.855, z - 0.004 * zs], hips);
    P(box(0.26, 0.42, 0.018), C.blue, [0, 0.86, z], hips);
    P(box(0.24, 0.05, 0.02), C.blueDk, [0, 1.045, z + 0.002 * zs], hips);
    P(box(0.035, 0.24, 0.01), C.gold, [0, 0.83, z + 0.012 * zs], hips);
    P(box(0.16, 0.035, 0.01), C.gold, [0, 0.89, z + 0.012 * zs], hips);
    for (let k = 0; k < 4; k++) {
      P(new THREE.ConeGeometry(0.03, 0.05, 4), C.gold, [-0.105 + k * 0.07, 0.625, z], hips, { dir: [0, -1, 0] });
    }
  }

  // scabbard on the left hip
  seg([0.21, 1.03, 0.07], [0.3, 0.42, -0.16], (l) => cyl(0.026, 0.03, l, 6), C.leather, hips, {
    scale: [1, 1, 0.6],
  });
  seg([0.21, 1.03, 0.07], [0.215, 0.99, 0.055], (l) => cyl(0.034, 0.034, l, 6), C.gold, hips);
  seg([0.295, 0.45, -0.145], [0.3, 0.42, -0.16], (l) => cyl(0.03, 0.033, l, 6), C.gold, hips);

  // ---------- head ----------
  P(cyl(0.085, 0.12, 0.07), C.steel, [0, 1.585, 0], neck);
  P(ringY(0.12, 0.01), C.gold, [0, 1.555, 0], neck);
  P(cyl(0.12, 0.12, 0.24), C.steel, [0, 1.72, 0], head, { scale: [1, 1, 1.08] });
  P(cyl(0.06, 0.12, 0.06), C.steel, [0, 1.87, 0], head, { scale: [1, 1, 1.08] });
  P(cyl(0.0, 0.06, 0.03), C.steelLt, [0, 1.915, 0], head);
  P(ringY(0.128, 0.011, 16), C.gold, [0, 1.84, 0], head, { scale: [1, 1, 1.08] });
  P(ringY(0.128, 0.011, 16), C.gold, [0, 1.605, 0], head, { scale: [1, 1, 1.08] });
  // brow plate + eye slit
  P(box(0.2, 0.04, 0.025), C.steelLt, [0, 1.825, 0.125], head);
  P(box(0.19, 0.026, 0.012), C.black, [0, 1.795, 0.12], head);
  P(box(0.025, 0.05, 0.01), C.gold, [0, 1.83, 0.14], head);
  // visor on jaw hinge
  P(box(0.2, 0.15, 0.03), C.steelLt, [0, 1.71, 0.128], jaw);
  P(box(0.025, 0.15, 0.01), C.gold, [0, 1.71, 0.146], jaw);
  P(box(0.1, 0.02, 0.01), C.gold, [0, 1.755, 0.146], jaw);
  for (const s of [1, -1]) {
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 2; c++)
        P(box(0.013, 0.013, 0.01), C.black, [s * (0.045 + c * 0.03), 1.665 + r * 0.025, 0.145], jaw);
    P(sph(0.014, 6, 4), C.gold, [s * 0.128, 1.76, 0.04], head);
  }
  // crest and plume
  P(cyl(0.015, 0.022, 0.05), C.gold, [0, 1.94, -0.01], head);
  const plumeCols = [C.red, C.redDk, C.white, C.red, C.redDk, C.red, C.white, C.redDk, C.red];
  for (let i = 0; i < 9; i++) {
    const th = THREE.MathUtils.degToRad(80 + i * 14);
    const dir: V3 = [0, Math.sin(th), Math.cos(th)];
    const len = 0.24 - Math.abs(i - 3) * 0.015;
    const base: V3 = [0, 1.96, -0.015];
    P(new THREE.ConeGeometry(0.035, len, 5), plumeCols[i], [0, base[1] + dir[1] * len * 0.5, base[2] + dir[2] * len * 0.5], head, {
      dir,
    });
  }

  // ---------- cape ----------
  P(cyl(0.032, 0.032, 0.46, 6), C.red, [0, 1.52, -0.155], chest, { dir: [1, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const x = -0.22 + i * 0.088;
    seg([x, 1.5, -0.165], [x * 1.25, 0.5, -0.29 - (i % 2) * 0.035], (l) => box(0.097, l, 0.02), i % 2 ? C.redDk : C.red, chest);
    seg([x * 1.25, 0.52, -0.29 - (i % 2) * 0.035], [x * 1.25, 0.5, -0.29 - (i % 2) * 0.035], () => box(0.099, 0.03, 0.024), C.gold, chest);
  }
  for (const s of [1, -1]) P(gem(0.028), C.gold, [s * 0.16, 1.535, -0.11], chest);

  // ---------- arms ----------
  for (const [S, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const { sh, ua, el, ha } = arm[S];
    const pc: V3 = [s * 0.25, 1.5, 0];
    const n = new THREE.Vector3(s * 0.45, 1, 0).normalize();
    // pauldron lames under dome
    for (let i = 0; i < 2; i++) {
      P(cyl(0.095 - i * 0.008, 0.105 - i * 0.008, 0.05), i ? C.steel : C.steelLt, [s * (0.3 + i * 0.045), 1.465 - i * 0.012, 0], ua, {
        dir: [s, -0.25, 0],
      });
    }
    P(dome(0.135), C.steel, pc, sh, { dir: [n.x, n.y, n.z] });
    P(ringY(0.135, 0.011), C.gold, pc, sh, { dir: [n.x, n.y, n.z] });
    P(sph(0.016, 6, 4), C.gold, [pc[0] + n.x * 0.135, pc[1] + n.y * 0.135, 0], sh);
    for (const z of [0.07, -0.07]) P(sph(0.01, 4, 3), C.gold, [pc[0] + n.x * 0.1, pc[1] + n.y * 0.09, z], sh);
    // upper arm
    seg([s * 0.3, 1.47, 0], [s * 0.49, 1.47, 0], (l) => cyl(0.06, 0.065, l), C.steel, ua);
    // elbow couter + fan
    P(sph(0.068), C.steelLt, [s * 0.52, 1.47, 0], el);
    P(cyl(0.062, 0.062, 0.014), C.steel, [s * 0.52, 1.47, -0.07], el, { dir: [0, 0, -1] });
    P(sph(0.013, 6, 4), C.gold, [s * 0.52, 1.47, -0.08], el);
    // vambrace
    seg([s * 0.56, 1.47, 0], [s * 0.79, 1.47, 0], (l) => cyl(0.05, 0.06, l), C.steel, el);
    P(ringY(0.058, 0.008), C.gold, [s * 0.6, 1.47, 0], el, { dir: [s, 0, 0] });
    // gauntlet cuff
    seg([s * 0.78, 1.47, 0], [s * 0.85, 1.47, 0], (l) => cyl(0.078, 0.056, l), C.steelLt, ha);
    P(ringY(0.076, 0.007), C.gold, [s * 0.849, 1.47, 0], ha, { dir: [s, 0, 0] });
    // fist
    P(box(0.1, 0.085, 0.09), C.steel, [s * 0.9, 1.465, 0.005], ha);
    for (let i = 0; i < 4; i++) P(box(0.07, 0.018, 0.022), i % 2 ? C.steel : C.steelLt, [s * 0.905, 1.435 + i * 0.02, 0.055], ha);
    P(box(0.022, 0.05, 0.026), C.steelLt, [s * 0.86, 1.495, 0.045], ha);
    for (const z of [-0.025, 0.02]) P(sph(0.009, 4, 3), C.gold, [s * 0.952, 1.47, z], ha);
  }

  // ---------- sword (right hand) ----------
  const hR = arm.R.ha;
  const sx = -0.9;
  seg([sx, 1.39, 0.01], [sx, 1.565, 0.01], (l) => cyl(0.017, 0.017, l, 6), C.leather, hR);
  P(gem(0.032), C.gold, [sx, 1.59, 0.01], hR);
  P(box(0.26, 0.025, 0.032), C.gold, [sx, 1.38, 0.01], hR);
  for (const d of [1, -1]) P(gem(0.02), C.gold, [sx + d * 0.135, 1.385, 0.01], hR);
  P(box(0.05, 0.03, 0.035), C.steelDk, [sx, 1.355, 0.01], hR);
  P(new THREE.CylinderGeometry(0.03, 0.033, 0.82, 4), C.steelLt, [sx, 0.93, 0.01], hR, { scale: [1.15, 1, 0.28] });
  P(box(0.01, 0.6, 0.004), C.steelDk, [sx, 1.0, 0.0195], hR);
  P(new THREE.ConeGeometry(0.03, 0.1, 4), C.steelLt, [sx, 0.47, 0.01], hR, { dir: [0, -1, 0], scale: [1.15, 1, 0.28] });

  // ---------- kite shield (left forearm) ----------
  const elL = arm.L.el;
  const kite = (k: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(-0.25 * k, 0.22 * k);
    sh.quadraticCurveTo(0, 0.29 * k, 0.25 * k, 0.22 * k);
    sh.lineTo(0.25 * k, 0.0);
    sh.quadraticCurveTo(0.22 * k, -0.3 * k, 0, -0.5 * k);
    sh.quadraticCurveTo(-0.22 * k, -0.3 * k, -0.25 * k, 0.0);
    sh.closePath();
    return new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false, curveSegments: 4 });
  };
  const SX = 0.66, SY = 1.38;
  P(kite(1.08), C.gold, [SX, SY, 0.08], elL);
  P(kite(1.0), C.blue, [SX, SY, 0.095], elL);
  P(box(0.05, 0.64, 0.012), C.gold, [SX, SY - 0.1, 0.13], elL);
  P(box(0.44, 0.05, 0.012), C.gold, [SX, SY + 0.08, 0.13], elL);
  P(dome(0.055), C.red, [SX, SY + 0.08, 0.135], elL, { dir: [0, 0, 1] });
  P(ringY(0.056, 0.008), C.gold, [SX, SY + 0.08, 0.136], elL, { dir: [0, 0, 1] });
  for (const [qx, qy] of [[-0.13, 0.17], [0.13, 0.17], [-0.11, -0.08], [0.11, -0.08]] as [number, number][]) {
    P(new THREE.OctahedronGeometry(0.03, 0), C.white, [SX + qx, SY + qy, 0.13], elL, { scale: [0.8, 1.2, 0.4] });
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    P(sph(0.008, 4, 3), C.steelLt, [SX + Math.cos(a) * 0.08, SY + 0.08 + Math.sin(a) * 0.08, 0.137], elL);
  }
  // shield straps behind
  for (const x of [0.58, 0.76]) P(box(0.025, 0.14, 0.03), C.leather, [x, 1.47, 0.07], elL);

  // ---------- legs ----------
  for (const [S, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const { hp, kn, an } = leg[S];
    const x = s * 0.105;
    seg([s * 0.1, 0.92, 0.01], [x, 0.57, 0.01], (l) => cyl(0.075, 0.09, l), C.steel, hp);
    P(ringY(0.083, 0.008), C.steelLt, [s * 0.102, 0.7, 0.01], hp);
    P(ringY(0.078, 0.007), C.gold, [x, 0.585, 0.01], hp);
    // poleyn
    P(sph(0.07), C.steelLt, [x, 0.52, 0.03], kn);
    P(cyl(0.056, 0.056, 0.012), C.steel, [x + s * 0.06, 0.52, 0.02], kn, { dir: [s, 0, 0] });
    P(sph(0.014, 6, 4), C.gold, [x, 0.52, 0.1], kn);
    // greave
    seg([x, 0.47, 0], [x, 0.12, -0.005], (l) => cyl(0.05, 0.065, l), C.steel, kn);
    seg([x, 0.45, 0.06], [x, 0.14, 0.046], (l) => box(0.018, l, 0.012), C.steelLt, kn);
    P(ringY(0.052, 0.007), C.gold, [x, 0.14, -0.004], kn);
    // ankle + sabaton
    P(sph(0.052), C.steelDk, [x, 0.1, -0.01], an);
    P(box(0.11, 0.06, 0.24), C.steel, [x, 0.03, 0.04], an);
    const lames: [number, number][] = [[-0.02, 0.075], [0.04, 0.068], [0.1, 0.056]];
    lames.forEach(([z, y], i) => P(box(0.116, 0.03, 0.07), i % 2 ? C.steel : C.steelLt, [x, y, z], an));
    P(new THREE.ConeGeometry(0.045, 0.1, 4), C.steelLt, [x, 0.04, 0.2], an, { dir: [0, -0.1, 1] });
    // spur
    seg([x, 0.075, -0.07], [x, 0.075, -0.14], (l) => cyl(0.007, 0.007, l, 4), C.gold, an);
    P(ringY(0.02, 0.005, 6), C.gold, [x, 0.075, -0.155], an, { dir: [1, 0, 0] });
  }

  return b.root;
}
```