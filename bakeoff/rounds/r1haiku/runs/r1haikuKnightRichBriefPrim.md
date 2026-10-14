```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Battle-worn Knight",
  description:
    "A plate-armoured knight with a great helm and crimson plume, filigreed pauldrons, a blue griffin surcoat, a kite shield and a broadsword, with a torn crimson cape.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "knight" });
  const R = rng(1187);

  // Palette
  const STEEL = "#8c949e";
  const STEEL_DK = "#4b525c";
  const STEEL_HI = "#c3cad3";
  const DENT_A = "#6e757e";
  const DENT_B = "#a3aab3";
  const GOLD = "#d6a93a";
  const CRIM = "#9e1c28";
  const CRIM_DK = "#6e1119";
  const CAPE = "#7d1420";
  const BLUE = "#1f3c7d";
  const BLUE_DK = "#162b5c";
  const SILVER = "#d9dfe7";
  const SLIT = "#0b0b0e";
  const LEATHER = "#5a3b24";

  // Helpers
  const P = (geo: THREE.BufferGeometry, color: string, at: V, aim?: V) =>
    b.part(geo, color, aim ? { at, aim } : { at });
  const mid = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
  const jit = (v: number, s: number) => v + (R() - 0.5) * s;
  const dent = (at: V, n: number, s = 0.02) => {
    for (let i = 0; i < n; i++) {
      const c = R() > 0.5 ? DENT_A : DENT_B;
      P(new THREE.BoxGeometry(s * (0.6 + R()), s * 0.3, s * (0.6 + R())), c,
        [jit(at[0], 0.18), jit(at[1], 0.2), at[2] + 0.005]);
    }
  };
  const scratch = (at: V, len: number) => {
    const ang = R() * Math.PI;
    P(new THREE.BoxGeometry(len, 0.004, 0.004), STEEL_HI,
      [at[0] + Math.cos(ang) * len * 0.5, at[1] + Math.sin(ang) * len * 0.5, at[2] + 0.01],
      [at[0] + Math.cos(ang) * len, at[1] + Math.sin(ang) * len, at[2] + 0.01]);
  };

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 0.95, 0] });
  const spine = b.joint("spine", { at: [0, 1.2, 0] });
  const chest = b.joint("chest", { at: [0, 1.42, 0] });
  const neck = b.joint("neck", { at: [0, 1.58, 0] });
  const head = b.joint("head", { at: [0, 1.7, 0] });

  const shoulderL = b.joint("shoulderL", { at: [0.27, 1.45, 0] });
  const elbowL = b.joint("elbowL", { at: [0.36, 1.17, 0.05] });
  const wristL = b.joint("wristL", { at: [0.36, 1.0, 0.3] });
  const shoulderR = b.joint("shoulderR", { at: [-0.27, 1.45, 0] });
  const elbowR = b.joint("elbowR", { at: [-0.36, 1.17, 0.02] });
  const wristR = b.joint("wristR", { at: [-0.38, 0.95, 0.25] });

  const hipL = b.joint("hipL", { at: [0.12, 0.95, 0] });
  const kneeL = b.joint("kneeL", { at: [0.13, 0.5, 0.02] });
  const ankleL = b.joint("ankleL", { at: [0.13, 0.08, 0.03] });
  const hipR = b.joint("hipR", { at: [-0.12, 0.95, 0] });
  const kneeR = b.joint("kneeR", { at: [-0.13, 0.5, 0.02] });
  const ankleR = b.joint("ankleR", { at: [-0.13, 0.08, 0.03] });

  // ---- Great helm ----
  const hc: V = [0, 1.72, 0];
  P(new THREE.CylinderGeometry(0.15, 0.16, 0.3, 10), STEEL, hc);
  P(new THREE.BoxGeometry(0.3, 0.06, 0.3), STEEL_DK, [0, 1.88, 0]);
  P(new THREE.BoxGeometry(0.2, 0.2, 0.04), STEEL_DK, [0, 1.7, 0.155]);      // visor plate
  P(new THREE.BoxGeometry(0.17, 0.022, 0.02), SLIT, [0, 1.74, 0.178]);      // eye slit
  for (const x of [-0.05, 0, 0.05]) {
    P(new THREE.BoxGeometry(0.018, 0.018, 0.012), SLIT, [x, 1.66, 0.178]);  // breath holes
  }
  P(new THREE.BoxGeometry(0.02, 0.2, 0.02), GOLD, [0.14, 1.72, 0.12]);      // gold rivets seam
  P(new THREE.BoxGeometry(0.02, 0.2, 0.02), GOLD, [-0.14, 1.72, 0.12]);
  dent([0.08, 1.8, 0.14], 3, 0.03);
  scratch([-0.1, 1.78, 0.14], 0.12);

  // Crimson plume rising from the crown and sweeping back
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const y = 1.92 + t * 0.34;
    const z = -0.03 - t * 0.09;
    const w = 0.07 - t * 0.02;
    P(new THREE.BoxGeometry(w, 0.05, 0.12), i % 2 ? CRIM : CRIM_DK, [jit(0, 0.01), y, z]);
  }
  P(new THREE.CylinderGeometry(0.02, 0.03, 0.08, 6), GOLD, [0, 1.93, 0]);   // plume socket

  // ---- Neck, gorget, chest ----
  P(new THREE.CylinderGeometry(0.075, 0.09, 0.14, 10), STEEL_DK, [0, 1.52, 0]);
  P(new THREE.CylinderGeometry(0.17, 0.2, 0.14, 12), STEEL, [0, 1.46, 0]);  // gorget
  P(new THREE.TorusGeometry(0.17, 0.012, 5, 14), GOLD, [0, 1.52, 0]);

  // Breastplate
  P(new THREE.BoxGeometry(0.46, 0.5, 0.24), STEEL, [0, 1.3, 0.0]);
  P(new THREE.BoxGeometry(0.2, 0.36, 0.04), STEEL_HI, [0, 1.34, 0.13]);     // central ridge
  dent([0.12, 1.38, 0.13], 4, 0.035);
  dent([-0.1, 1.22, 0.13], 3, 0.03);
  scratch([-0.05, 1.45, 0.13], 0.18);
  scratch([0.1, 1.2, 0.13], 0.12);

  // Deep-blue surcoat with silver griffin
  P(new THREE.BoxGeometry(0.38, 0.62, 0.02), BLUE, [0, 1.18, 0.135]);
  P(new THREE.BoxGeometry(0.42, 0.22, 0.2), BLUE_DK, [0, 0.9, 0.04]);       // skirt front
  P(new THREE.BoxGeometry(0.34, 0.03, 0.01), GOLD, [0, 1.48, 0.147]);       // hem trims
  P(new THREE.BoxGeometry(0.02, 0.6, 0.01), GOLD, [0.19, 1.18, 0.147]);
  P(new THREE.BoxGeometry(0.02, 0.6, 0.01), GOLD, [-0.19, 1.18, 0.147]);
  // Griffin: body, head, wings, tail, talons
  P(new THREE.SphereGeometry(0.06, 10, 8), SILVER, [0, 1.2, 0.152]);
  P(new THREE.SphereGeometry(0.03, 8, 6), SILVER, [0.05, 1.26, 0.158]);
  P(new THREE.BoxGeometry(0.02, 0.012, 0.01), SILVER, [0.07, 1.25, 0.16]);   // beak
  P(new THREE.BoxGeometry(0.1, 0.035, 0.008), SILVER, [-0.08, 1.24, 0.157]);
  P(new THREE.BoxGeometry(0.13, 0.035, 0.008), SILVER, [-0.11, 1.3, 0.158]);
  P(new THREE.BoxGeometry(0.1, 0.03, 0.008), SILVER, [-0.09, 1.18, 0.158]);
  P(new THREE.BoxGeometry(0.06, 0.02, 0.008), SILVER, [-0.11, 1.12, 0.156]);
  P(new THREE.BoxGeometry(0.02, 0.1, 0.008), SILVER, [0.02, 1.1, 0.156]);

  // Belt
  P(new THREE.BoxGeometry(0.44, 0.07, 0.26), LEATHER, [0, 0.98, 0]);
  P(new THREE.BoxGeometry(0.06, 0.05, 0.02), GOLD, [0, 0.98, 0.135]);       // buckle

  // ---- Pauldrons: layered plates with gold filigree ----
  for (const side of [1, -1]) {
    const sx = 0.27 * side;
    const cx = sx + 0.03 * side;
    P(new THREE.SphereGeometry(0.14, 12, 8), STEEL, [cx, 1.5, 0], [cx, 1.5, 1]);
    P(new THREE.SphereGeometry(0.15, 12, 6), STEEL_DK, [cx, 1.46, 0]);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 0.8 - 0.2;
      P(new THREE.BoxGeometry(0.1, 0.02, 0.1), STEEL_HI,
        [cx + Math.cos(a) * 0.1 * side, 1.52 - k * 0.04, Math.sin(a) * 0.1]);
    }
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 1.2;
      P(new THREE.SphereGeometry(0.012, 5, 4), GOLD,
        [cx + Math.cos(a) * 0.13, 1.5 + Math.sin(a) * 0.04, Math.sin(a) * 0.13 * 0.9]);
    }
    dent([cx + 0.05 * side, 1.56, 0.1], 2, 0.03);
    scratch([cx, 1.5, 0.14], 0.1);
  }

  // ---- Arms ----
  const armSeg = (
    a: V, c: V, rA: number, rB: number, color: string,
  ) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    P(new THREE.CylinderGeometry(rA, rB, len, 8), color, mid(a, c), c);
  };

  // Left arm: vambrace and couter, holds shield forward
  armSeg(shoulderL.position(), elbowL.position(), 0.07, 0.06, STEEL_DK);
  armSeg(elbowL.position(), wristL.position(), 0.06, 0.05, STEEL);
  P(new THREE.SphereGeometry(0.075, 10, 8), STEEL, [0.36, 1.17, 0.05]);      // elbow cop
  P(new THREE.SphereGeometry(0.06, 8, 6), STEEL, [0.37, 1.0, 0.3]);          // gauntlet
  P(new THREE.TorusGeometry(0.05, 0.01, 4, 10), GOLD, [0.36, 1.0, 0.27]);

  // Right arm holds the sword at the hip
  armSeg(shoulderR.position(), elbowR.position(), 0.07, 0.06, STEEL_DK);
  armSeg(elbowR.position(), wristR.position(), 0.06, 0.05, STEEL);
  P(new THREE.SphereGeometry(0.075, 10, 8), STEEL, [-0.36, 1.17, 0.02]);
  P(new THREE.SphereGeometry(0.06, 8, 6), STEEL, [-0.38, 0.95, 0.25]);       // gauntlet

  // ---- Kite shield on the left arm ----
  const shieldC: V = [0.44, 1.1, 0.36];
  P(new THREE.BoxGeometry(0.42, 0.44, 0.05), BLUE_DK, shieldC, [0.44, 1.1, 1.36]);
  P(new THREE.BoxGeometry(0.3, 0.2, 0.05), BLUE_DK, [0.44, 0.8, 0.36]);
  P(new THREE.BoxGeometry(0.1, 0.1, 0.06), BLUE_DK, [0.44, 0.7, 0.36]);      // kite point
  P(new THREE.BoxGeometry(0.36, 0.04, 0.02), STEEL_DK, [0.44, 1.33, 0.4]);   // rim top
  P(new THREE.BoxGeometry(0.02, 0.44, 0.02), STEEL_DK, [0.25, 1.1, 0.4]);    // rim sides
  P(new THREE.BoxGeometry(0.02, 0.44, 0.02), STEEL_DK, [0.63, 1.1, 0.4]);
  // Griffin on shield
  P(new THREE.SphereGeometry(0.07, 10, 8), SILVER, [0.44, 1.1, 0.4]);
  P(new THREE.SphereGeometry(0.035, 8, 6), SILVER, [0.5, 1.17, 0.41]);
  P(new THREE.BoxGeometry(0.16, 0.04, 0.012), SILVER, [0.36, 1.12, 0.41]);
  P(new THREE.BoxGeometry(0.12, 0.035, 0.012), SILVER, [0.37, 1.2, 0.41]);
  P(new THREE.BoxGeometry(0.12, 0.03, 0.012), SILVER, [0.52, 1.05, 0.41]);
  P(new THREE.BoxGeometry(0.02, 0.14, 0.012), SILVER, [0.44, 0.95, 0.41]);
  P(new THREE.BoxGeometry(0.1, 0.03, 0.012), GOLD, [0.44, 0.9, 0.41]);
  dent([0.3, 1.2, 0.4], 4, 0.05);
  dent([0.55, 0.95, 0.4], 3, 0.04);
  scratch([0.44, 1.3, 0.4], 0.2);
  scratch([0.5, 0.85, 0.4], 0.14);

  // ---- Broadsword in the right hand, point planted at the ground ----
  P(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 6), LEATHER, [-0.4, 0.92, 0.27]);
  P(new THREE.BoxGeometry(0.2, 0.03, 0.04), GOLD, [-0.4, 0.84, 0.27]);       // crossguard
  P(new THREE.SphereGeometry(0.02, 6, 5), GOLD, [-0.4, 0.99, 0.27]);         // pommel
  P(new THREE.BoxGeometry(0.07, 0.8, 0.012), STEEL_HI, [-0.42, 0.45, 0.3]);  // blade
  P(new THREE.BoxGeometry(0.012, 0.8, 0.014), STEEL, [-0.42, 0.45, 0.3]);
  P(new THREE.BoxGeometry(0.07, 0.12, 0.012), STEEL_HI, [-0.42, 0.07, 0.3]); // tapering tip
  dent([-0.42, 0.6, 0.31], 2, 0.02);
  scratch([-0.42, 0.3, 0.31], 0.1);

  // ---- Torn crimson cape from the shoulders ----
  P(new THREE.BoxGeometry(0.44, 0.12, 0.08), CAPE, [0, 1.47, -0.06]);       // cape yoke
  for (let i = 0; i < 7; i++) {
    const x = -0.18 + i * 0.06;
    const h = 0.7 + R() * 0.45;
    const z = -0.12 - Math.abs(x) * 0.2;
    P(new THREE.BoxGeometry(0.055, h, 0.015), i % 2 ? CAPE : CRIM_DK,
      [x, 1.45 - h / 2, z], [x, 1.45 - h / 2, z - 1]);
  }
  // Tatters at the hem
  for (let i = 0; i < 4; i++) {
    const x = -0.15 + i * 0.1;
    P(new THREE.BoxGeometry(0.035, 0.16, 0.012), CAPE, [x + jit(0, 0.02), 0.4, -0.2]);
  }

  // ---- Legs: cuisses, greaves, sabatons, tassets ----
  for (const side of [1, -1]) {
    const hip: V = side > 0 ? [0.12, 0.95, 0] : [-0.12, 0.95, 0];
    const knee: V = side > 0 ? [0.13, 0.5, 0.02] : [-0.13, 0.5, 0.02];
    const ankle: V = side > 0 ? [0.13, 0.08, 0.03] : [-0.13, 0.08, 0.03];
    armSeg(hip, knee, 0.085, 0.075, STEEL);
    armSeg(knee, ankle, 0.07, 0.06, STEEL_DK);
    P(new THREE.SphereGeometry(0.075, 10, 8), STEEL_HI, [knee[0], knee[1] + 0.02, knee[2] + 0.05]); // kneecap
    P(new THREE.BoxGeometry(0.14, 0.1, 0.2), STEEL_DK, [ankle[0], 0.05, ankle[2] + 0.03]);          // sabaton
    P(new THREE.BoxGeometry(0.13, 0.02, 0.02), GOLD, [ankle[0], 0.07, ankle[2] + 0.13]);
    // Tasset plates hanging from the belt
    for (let k = 0; k < 2; k++) {
      P(new THREE.BoxGeometry(0.13, 0.2, 0.02), STEEL, [hip[0], 0.82 - k * 0.1, 0.1 - k * 0.02]);
    }
    dent([hip[0], 0.8, 0.12], 2, 0.025);
    scratch([knee[0], 0.6, 0.1], 0.1);
  }

  // ---- Helm plume base and final details ----
  dent([0.1, 0.92, 0.12], 2, 0.03);
  dent([-0.08, 1.4, -0.12], 2, 0.03);

  return b.root;
}
```