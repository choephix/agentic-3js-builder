import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Coral Octopus",
  description:
    "A stylized low-poly common octopus resting in a star pose: a bulbous speckled mantle, big golden eyes with brow papillae, a side siphon, webbing between the arm roots and eight tapering tentacle chains lined with two rows of cream suckers.",
};

type P = [number, number, number];

function lerpP(a: P, b: P, t: number): P {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// Point at fraction t of the arc length of a polyline.
function polyAt(pts: P[], t: number): P {
  const lens: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    lens.push(lens[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  const total = lens[lens.length - 1];
  const d = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 1; i < pts.length; i++) {
    if (d <= lens[i] || i === pts.length - 1) {
      const seg = lens[i] - lens[i - 1] || 1;
      return lerpP(pts[i - 1], pts[i], (d - lens[i - 1]) / seg);
    }
  }
  return pts[pts.length - 1];
}

export default function build() {
  const b: any = createBuilder({ name: "octopus" });

  const R: any = rng(31);
  const rand = (): number =>
    typeof R === "function" ? R() : R.next ? R.next() : R.float ? R.float() : Math.random();

  // Palette
  const BODY = "#d9573b";
  const BODY_DARK = "#a3352b";
  const SPOT_LIGHT = "#f4a35e";
  const SPOT_DARK = "#7e2424";
  const SUCKER = "#f7dcbc";
  const SUCKER_IN = "#e6a98a";
  const WEB = "#c2473a";
  const EYE = "#ffcf3f";
  const PUPIL = "#1b1414";
  const SHINE = "#ffffff";

  // ---------- Skeleton ----------
  const body = b.joint("body", { at: [0, 0.1, 0] });

  const mantlePts: P[] = [
    [0, 0.035, 0.01],
    [0, 0.11, 0.01],
    [0, 0.2, -0.02],
    [0, 0.29, -0.07],
    [0, 0.36, -0.12],
    [0, 0.39, -0.15],
  ];
  const spine = b.chain("spine", mantlePts, { parent: body, role: "spine" });

  // Eight arms in a star, tips gently curled up.
  type Arm = { name: string; theta: number; pts: P[]; chain: any; sweep?: any };
  const arms: Arm[] = [];
  const reach = 0.58;
  const R0 = 0.055;
  const ts = [0, 0.2, 0.4, 0.6, 0.8, 0.92, 1];
  const rad = (t: number) => 0.034 - 0.027 * t;
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 4; i++) {
      const deg = 22.5 + 45 * i;
      const theta = ((side === 0 ? deg : -deg) * Math.PI) / 180;
      const dx = Math.sin(theta), dz = Math.cos(theta);
      const pts: P[] = ts.map((t) => {
        let dist = R0 + reach * t;
        let y = t === 0 ? 0.075 : rad(t) * 0.95;
        if (t === 0.92) y = rad(t) * 1.4;
        if (t === 1) { dist -= 0.035; y = 0.05; }
        return [dx * dist, y, dz * dist];
      });
      const name = (side === 0 ? "armL" : "armR") + (i + 1);
      const chain = b.chain(name, pts, { parent: body, role: "tentacle" });
      arms.push({ name, theta, pts, chain });
    }
  }

  // ---------- Bodies ----------
  const mantle = b.sweep(spine, {
    radius: [0.055, 0.105, 0.125, 0.115, 0.075, 0.012],
    color: BODY,
  });

  for (const arm of arms) {
    arm.sweep = b.sweep(arm.chain, { radius: [0.036, 0.006], color: BODY });
  }

  // Webbing between neighbouring arm roots (sorted around the body).
  const sorted = [...arms].sort((a, c) => a.theta - c.theta);
  for (let i = 0; i < sorted.length; i++) {
    const A = sorted[i], C = sorted[(i + 1) % sorted.length];
    const edge = (arm: Arm): P[] =>
      [0, 0.12, 0.24].map((t) => {
        const p = polyAt(arm.pts, t);
        return [p[0], p[1] + rad(t) * 0.55, p[2]] as P;
      });
    b.membrane(edge(A), edge(C), { color: WEB });
  }

  // ---------- Surface details ----------
  const ms = b.surface(mantle);

  // Eyes, eyelid rims, pupils, highlights, brow papillae
  for (const sx of [1, -1]) {
    const hit = ms.nearest([sx * 0.1, 0.17, 0.06]);
    const er = 0.03;

    const lid = new THREE.TorusGeometry(er * 0.98, er * 0.32, 6, 14);
    lid.rotateX(Math.PI / 2);
    lid.translate(0, er * 0.35, 0);
    b.stick(lid, BODY_DARK, hit);

    const ball = new THREE.SphereGeometry(er, 12, 8);
    ball.scale(1, 0.8, 1);
    ball.translate(0, er * 0.35, 0);
    b.stick(ball, EYE, hit);

    const pupil = new THREE.CylinderGeometry(er * 0.45, er * 0.45, er * 0.2, 10);
    pupil.scale(1.5, 1, 0.6);
    pupil.translate(0, er * 1.13, 0);
    b.stick(pupil, PUPIL, hit);

    const shine = new THREE.SphereGeometry(er * 0.16, 6, 4);
    shine.translate(er * 0.3, er * 1.2, er * 0.25);
    b.stick(shine, SHINE, hit);

    // little horn-like papillae over each eye
    for (let k = 0; k < 3; k++) {
      const h = ms.nearest([sx * (0.085 + k * 0.01), 0.215 + k * 0.006, 0.05 - k * 0.025]);
      const cone = new THREE.ConeGeometry(0.009 - k * 0.002, 0.03 - k * 0.006, 5);
      cone.translate(0, 0.012, 0);
      b.stick(cone, BODY_DARK, h);
    }
  }

  // Siphon on the right flank
  {
    const h = ms.nearest([-0.11, 0.1, -0.03]);
    const siphon = new THREE.CylinderGeometry(0.011, 0.02, 0.05, 8, 1, true);
    siphon.translate(0, 0.022, 0);
    b.stick(siphon, BODY_DARK, h);
    const lip = new THREE.TorusGeometry(0.011, 0.004, 5, 10);
    lip.rotateX(Math.PI / 2);
    lip.translate(0, 0.047, 0);
    b.stick(lip, BODY, h);
  }

  // Speckles over the mantle
  const around = ms.around([0, 0.25, -0.05]);
  for (let i = 0; i < 46; i++) {
    const az = rand() * 360;
    const el = -5 + rand() * 80;
    // keep the eye area clean
    const azr = (az * Math.PI) / 180;
    if (el < 30 && Math.abs(Math.cos(azr)) < 0.35 && Math.sin(azr) > -0.2) continue;
    const h = around.at(az, el);
    const big = rand() < 0.35;
    const r = big ? 0.012 + rand() * 0.008 : 0.005 + rand() * 0.005;
    const g = new THREE.SphereGeometry(r, 7, 4);
    g.scale(1, 0.3, 1);
    b.stick(g, big ? SPOT_DARK : SPOT_LIGHT, h);
  }

  // Suckers: two rows along the flanks of every arm
  for (const arm of arms) {
    const s = b.surface(arm.sweep);
    const sideX = Math.cos(arm.theta), sideZ = -Math.sin(arm.theta);
    const n = 14;
    for (let k = 0; k < n; k++) {
      const t = 0.1 + (0.8 * k) / (n - 1);
      const c = polyAt(arm.pts, t);
      const r = rad(t);
      for (const sgn of [1, -1]) {
        const target: P = [
          c[0] + sideX * sgn * r * 1.6,
          c[1] - r * 0.35,
          c[2] + sideZ * sgn * r * 1.6,
        ];
        const h = s.nearest(target);
        const sr = Math.max(r * 0.42, 0.003);
        const cup = new THREE.CylinderGeometry(sr, sr * 1.1, sr * 0.7, 8);
        cup.translate(0, sr * 0.25, 0);
        b.stick(cup, SUCKER, h);
        const dimple = new THREE.CylinderGeometry(sr * 0.45, sr * 0.45, sr * 0.2, 6);
        dimple.translate(0, sr * 0.62, 0);
        b.stick(dimple, SUCKER_IN, h);
      }
    }
    // a few speckles on the top of each arm
    for (let k = 0; k < 5; k++) {
      const t = 0.12 + rand() * 0.6;
      const c = polyAt(arm.pts, t);
      const r = rad(t);
      const h = s.nearest([c[0], c[1] + r * 2, c[2]]);
      const g = new THREE.SphereGeometry(r * 0.35, 6, 4);
      g.scale(1, 0.3, 1);
      b.stick(g, rand() < 0.5 ? SPOT_DARK : SPOT_LIGHT, h);
    }
  }

  return b.root;
}
