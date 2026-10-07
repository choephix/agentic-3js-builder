```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, spots, mottle, rng } from "agentic-3js-builder";

export const meta = {
  name: "Feisty Red Rock Crab",
  description:
    "A brick-red rock crab with a knobbly speckled shell, eye stalks, eight jointed pointed legs, one oversized raised claw with toothed dark-tipped pinchers, a barnacle cluster and a strand of seaweed on its back.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const surfY = (x: number, z: number) =>
  0.065 + 0.055 * Math.sqrt(Math.max(0, 1 - (x / 0.16) ** 2 - (z / 0.12) ** 2));

export default function build() {
  const b = createBuilder({ name: "rockCrab" });
  const rand = rng(11);

  const RED = "#a8331f";
  const ORANGE = "#e8832e";
  const CREAM = "#f1dfbd";
  const DARK = "#2a1512";

  const base = mottle("#962b1c", "#bb4627", { size: 0.05, seed: 3 });
  const shellCoat = paint((p, n) =>
    n.y < -0.15 ? "#e9c7a0" : spots(base, [ORANGE, CREAM], { size: 0.022, amount: 0.45, seed: 5 }),
  );
  const limbCoat = spots(mottle("#a2301d", "#c04a28", { size: 0.04, seed: 8 }), [ORANGE, CREAM], {
    size: 0.016,
    amount: 0.35,
    seed: 9,
  });

  b.joint("root", { at: [0, 0.065, 0], dir: [0, 0, 1] });

  // Shell
  b.part(new THREE.SphereGeometry(1, 14, 9), shellCoat, { at: [0, 0.065, 0], scale: [0.16, 0.055, 0.12], bone: "root" });
  b.part(new THREE.SphereGeometry(1, 14, 6), "#7d2418", { at: [0, 0.045, 0], scale: [0.168, 0.028, 0.126], bone: "root" });

  // Knobs on the carapace
  for (let i = 0; i < 18; i++) {
    const th = 0.15 + rand() * 0.85;
    const ph = rand() * Math.PI * 2;
    const x = 0.16 * Math.sin(th) * Math.sin(ph) * 0.97;
    const z = 0.12 * Math.sin(th) * Math.cos(ph) * 0.97;
    if (z > 0.06 && Math.abs(x) < 0.07) continue; // keep the eye area clear
    const y = 0.065 + 0.055 * Math.cos(th) * 0.97;
    const r = 0.009 + rand() * 0.008;
    b.part(new THREE.SphereGeometry(r, 6, 4), rand() > 0.3 ? "#c4482a" : "#e0a060", {
      at: [x, y, z], scale: [1, 0.75, 1], bone: "root", flat: true,
    });
  }

  // Front rim teeth
  for (let i = 0; i < 7; i++) {
    const ph = ((i - 3) / 3) * 1.0;
    const x = 0.16 * Math.sin(ph) * 0.99;
    const z = 0.12 * Math.cos(ph) * 0.99;
    b.part(new THREE.ConeGeometry(0.009, 0.026, 5), "#d4582e", {
      at: [x, 0.075, z], dir: [Math.sin(ph) * 0.7, 0.25, Math.cos(ph)], bone: "root",
    });
  }

  // Mouth: upper lip and a separate lower jaw
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.016), "#6a2016", { at: [0, 0.048, 0.112], bone: "root" });
  b.joint("jaw", { parent: "root", at: [0, 0.04, 0.108], dir: [0, -0.2, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.044, 0.01, 0.018), CREAM, { at: [0, 0.036, 0.116], bone: "jaw" });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.012, 0.008, 0.02), "#d9622e", { at: [s * 0.012, 0.034, 0.128], bone: "jaw" });

  // Eye stalks
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const at = V(s * 0.04, 0.088, 0.1);
    const dir = V(s * 0.35, 1, 0.3).normalize();
    const j = b.joint(`eyeStalk${S}`, { parent: "root", at, dir });
    const tip = at.clone().addScaledVector(dir, 0.042);
    b.capsule(at, tip, 0.007, { color: "#d9622e", bone: j });
    const eyeC = tip.clone().addScaledVector(dir, 0.006);
    b.part(new THREE.SphereGeometry(0.0145, 8, 6), "#0e0e10", { at: eyeC, bone: j });
    b.part(new THREE.SphereGeometry(0.004, 5, 4), "#ffffff", {
      at: eyeC.clone().add(V(s * 0.006, 0.006, 0.009)), bone: j,
    });
  }

  // Walking legs
  const z0s = [0.06, 0.025, -0.01, -0.05];
  const zsp = [0.07, 0.03, -0.04, -0.09];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const z0 = z0s[i];
      const zs = zsp[i];
      const pts = [
        V(s * 0.12, 0.06, z0),
        V(s * 0.2, 0.1, z0 + 0.4 * zs),
        V(s * 0.26, 0.118, z0 + 0.7 * zs),
        V(s * 0.31, 0.06, z0 + 0.9 * zs),
        V(s * 0.34, 0.0, z0 + zs),
      ];
      const n = i + 1;
      const chain = b.chain(`leg${S}${n}`, pts, {
        names: [`coxa${S}${n}`, `merus${S}${n}`, `carpus${S}${n}`, `propodus${S}${n}`, `dactyl${S}${n}`],
        role: "leg",
        parent: "root",
      });
      const r = [0.017, 0.016, 0.013, 0.01];
      for (let k = 0; k < 3; k++) {
        b.capsule(pts[k], pts[k + 1], [r[k], r[k + 1]], { color: limbCoat, bone: chain.joints[k] });
        if (k > 0) b.part(new THREE.SphereGeometry(r[k] * 1.1, 7, 5), "#e07a30", { at: pts[k], bone: chain.joints[k] });
      }
      b.spike(pts[3], pts[4], null, 0.0105, { color: DARK, bone: chain.joints[3] });
    }
  }

  // Claws
  const X = V(1, 0, 0);
  function claw(S: string, pts: THREE.Vector3[], D: THREE.Vector3, k: number, rs: number) {
    const chain = b.chain(`arm${S}`, pts, {
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "arm",
      parent: "root",
    });
    for (let i = 0; i < 3; i++) {
      b.capsule(pts[i], pts[i + 1], [rs * (1 - 0.12 * i), rs * (1 - 0.12 * (i + 1))], {
        color: limbCoat, bone: chain.joints[i],
      });
      if (i > 0) b.part(new THREE.SphereGeometry(rs * 1.08, 7, 5), "#e07a30", { at: pts[i], bone: chain.joints[i] });
    }
    const H = pts[3];
    const hand = chain.joints[3];
    b.part(new THREE.SphereGeometry(1, 10, 7), limbCoat, {
      at: H.clone().addScaledVector(D, 0.04 * k), dir: D, scale: [0.05 * k, 0.062 * k, 0.042 * k], bone: hand,
    });
    const palmEnd = H.clone().addScaledVector(D, 0.075 * k);
    const Lf = 0.11 * k;
    const rf = 0.028 * k;
    const finger = (bs: THREE.Vector3, dir: THREE.Vector3, inner: THREE.Vector3, bone: any) => {
      const mid = bs.clone().addScaledVector(dir, Lf * 0.65);
      const tip = bs.clone().addScaledVector(dir, Lf);
      b.capsule(bs, mid, [rf, rf * 0.6], { color: limbCoat, bone });
      b.spike(mid, tip, null, rf * 0.6, { color: DARK, bone });
      for (let j = 0; j < 4; j++) {
        const f = 0.2 + 0.17 * j;
        const p = bs.clone().addScaledVector(dir, Lf * f).addScaledVector(inner, rf * 0.8 * (1 - f * 0.6));
        b.part(new THREE.ConeGeometry(0.008 * k, 0.02 * k, 5), CREAM, { at: p, dir: inner, bone });
      }
    };
    const Df = D.clone().addScaledVector(X, -0.12).normalize();
    finger(palmEnd.clone().addScaledVector(X, -0.012 * k), Df, X.clone(), hand);
    const bm = palmEnd.clone().addScaledVector(X, 0.015 * k);
    const Dm = D.clone().addScaledVector(X, 0.3).normalize();
    const jaw = b.joint(`clawJaw${S}`, { parent: hand, at: bm, dir: Dm, role: "jaw" });
    finger(bm, Dm, X.clone().negate(), jaw);
  }

  claw(
    "L",
    [V(0.14, 0.07, 0.09), V(0.25, 0.1, 0.11), V(0.28, 0.15, 0.15), V(0.28, 0.21, 0.2)],
    V(0, 0.65, 0.75).normalize(),
    1.0,
    0.03,
  );
  claw(
    "R",
    [V(-0.14, 0.07, 0.09), V(-0.22, 0.07, 0.15), V(-0.24, 0.07, 0.21), V(-0.2, 0.065, 0.27)],
    V(0.1, 0.1, 1).normalize(),
    0.5,
    0.02,
  );

  // Barnacle cluster
  const bar: Array<[number, number, number]> = [[-0.05, -0.06, 1], [-0.07, -0.045, 0.7], [-0.035, -0.075, 0.6]];
  for (const [x, z, sc] of bar) {
    const y = surfY(x, z) - 0.004;
    b.part(new THREE.CylinderGeometry(0.008 * sc, 0.013 * sc, 0.018 * sc, 7), "#cfc8b8", { at: [x, y + 0.008 * sc, z], bone: "root", flat: true });
    b.part(new THREE.CylinderGeometry(0.005 * sc, 0.005 * sc, 0.004, 6), "#3a332c", { at: [x, y + 0.0175 * sc, z], bone: "root" });
  }

  // Seaweed
  const weed: Array<[string, number, number, number]> = [
    ["#3f7a3a", 0.05, -0.07, 1],
    ["#5a8a3c", 0.075, -0.055, 0.8],
    ["#2f5f35", 0.03, -0.08, 0.9],
  ];
  weed.forEach(([col, x, z, sc], idx) => {
    const y = surfY(x, z) - 0.004;
    const sx = idx === 1 ? 1 : idx === 2 ? -1 : 0.3;
    const path = catmull([
      [x, y, z],
      [x + 0.015 * sx, y + 0.05 * sc, z - 0.02],
      [x + 0.03 * sx, y + 0.09 * sc, z - 0.06],
      [x + 0.01 * sx, y + 0.1 * sc, z - 0.11],
      [x - 0.02, y + 0.07 * sc, z - 0.15],
      [x - 0.03, y + 0.03 * sc, z - 0.18],
    ]);
    b.sweep(path, (t: number) => [0.011 * (1 - 0.6 * t) + 0.002, 0.0022], {
      color: col, section: "box", bone: "root", caps: "flat",
    });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), "#7aa04a", {
      at: path.at(0.45).add(V(0, 0.006, 0)), bone: "root",
    });
  });

  return b.root;
}
```