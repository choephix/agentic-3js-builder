```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Desert Scorpion",
  description:
    "Glossy amber scorpion in a threatening pose: tail arched over its back, big forward pincers, eight legs, banded segments, bulbous dark stinger and a cluster of tiny black eyes.",
};

export default function build() {
  const b = createBuilder({ name: "scorpion" });

  const AMBER = "#d98a1c";
  const LIGHT = "#f2b640";
  const DARK = "#4a2208";
  const BLACK = "#0b0805";
  const STING = "#2a1008";

  const sub = (p: number[], q: number[]) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
  const len3 = (v: number[]) => Math.hypot(v[0], v[1], v[2]);
  const norm = (v: number[]) => {
    const l = len3(v) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const midp = (p: number[], q: number[]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];

  // tapered cylinder between two points
  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, sides = 6) => {
    const l = len3(sub(c, a));
    const g = new THREE.CylinderGeometry(r1, r0, l, sides);
    return b.part(g, color, { at: midp(a, c), dir: norm(sub(c, a)), bone });
  };
  const ball = (p: number[], sx: number, sy: number, sz: number, color: string, bone: any, seg1 = 8) => {
    const g = new THREE.SphereGeometry(1, seg1, Math.max(5, seg1 - 2));
    g.scale(sx, sy, sz);
    return b.part(g, color, { at: p, bone });
  };
  const box = (p: number[], w: number, h: number, d: number, color: string, bone: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: p, bone });

  // ---------- skeleton: body + abdomen ----------
  const body = b.joint("body", { at: [0, 0.026, 0.0] });
  const head = b.joint("head", { at: [0, 0.03, 0.04], parent: body });
  const jaw = b.joint("jaw", { at: [0, 0.02, 0.066], parent: head });

  // carapace
  ball([0, 0.03, 0.036], 0.022, 0.014, 0.03, AMBER, head, 10);
  ball([0, 0.036, 0.03], 0.014, 0.008, 0.022, LIGHT, head);
  box([0, 0.0415, 0.03], 0.003, 0.003, 0.03, DARK, head);
  // front dark band of the carapace
  ball([0, 0.026, 0.062], 0.017, 0.008, 0.008, DARK, head);
  // eyes: two median + three lateral per side
  for (const s of [-1, 1]) {
    ball([s * 0.0055, 0.0445, 0.042], 0.004, 0.004, 0.004, BLACK, head, 6);
    for (let i = 0; i < 3; i++) {
      ball([s * 0.0175, 0.036 + i * 0.0004, 0.05 - i * 0.0075], 0.0025, 0.0025, 0.0025, BLACK, head, 5);
    }
    // eye brow ridge
    ball([s * 0.0055, 0.0425, 0.04], 0.0065, 0.003, 0.007, DARK, head, 6);
  }
  // chelicerae: upper fixed plates on head, lower jaw moving
  for (const s of [-1, 1]) {
    box([s * 0.007, 0.024, 0.07], 0.01, 0.007, 0.012, LIGHT, head);
    box([s * 0.007, 0.016, 0.073], 0.009, 0.005, 0.012, DARK, jaw);
    box([s * 0.0035, 0.0165, 0.08], 0.004, 0.004, 0.006, DARK, jaw);
  }

  // abdomen (mesosoma) 7 segments
  let prev: any = body;
  for (let i = 0; i < 7; i++) {
    const z = -0.006 - i * 0.0165;
    const w = 0.02 - i * 0.0015;
    const h = 0.0135 - i * 0.0006;
    const j = b.joint("abd" + (i + 1), { at: [0, 0.026 - i * 0.0004, z], parent: prev });
    prev = j;
    ball([0, 0.026 - i * 0.0004, z - 0.002], w, h, 0.0105, AMBER, j, 9);
    ball([0, 0.026 - i * 0.0004 + h * 0.55, z - 0.002], w * 0.6, h * 0.45, 0.0085, LIGHT, j, 6);
    // dark band at rear edge
    ball([0, 0.026 - i * 0.0004 - 0.001, z - 0.0105], w * 0.92, h * 0.85, 0.0032, DARK, j, 8);
  }
  // front joint band between carapace and abdomen
  ball([0, 0.026, -0.004], 0.019, 0.012, 0.0035, DARK, body, 8);

  // ---------- tail (metasoma) arched over the back ----------
  const cy = 0.04, cz = -0.05, R = 0.07;
  const thetas = [-10, 20, 50, 80, 110, 140];
  const P = thetas.map((t) => {
    const r = (t * Math.PI) / 180;
    return [0, cy + R * Math.sin(r), cz - R * Math.cos(r)];
  });
  const tang = (t: number) => {
    const r = (t * Math.PI) / 180;
    return [0, Math.cos(r), Math.sin(r)];
  };
  let tprev: any = prev;
  const tj: any[] = [];
  for (let i = 0; i < P.length; i++) {
    const j = b.joint("tail" + (i + 1), { at: P[i], parent: tprev });
    tj.push(j);
    tprev = j;
  }
  for (let i = 0; i < 5; i++) {
    const r0 = 0.0115 - i * 0.0011;
    const r1 = 0.0105 - i * 0.0011;
    seg(P[i], P[i + 1], r0, r1, AMBER, tj[i], 8);
    // lighter dorsal keel on the outside of the arc
    const m = midp(P[i], P[i + 1]);
    const outward = norm([0, m[1] - cy, m[2] - cz]);
    const keelAt = [0, m[1] + outward[1] * r0 * 0.85, m[2] + outward[2] * r0 * 0.85];
    b.part(new THREE.BoxGeometry(0.004, 0.004, len3(sub(P[i + 1], P[i])) * 0.8), LIGHT, {
      at: keelAt,
      dir: [0, 1, 0],
      bone: tj[i],
    });
    // dark joint band
    const g = new THREE.CylinderGeometry(r0 * 1.12, r0 * 1.12, 0.0045, 8);
    b.part(g, DARK, { at: P[i], dir: tang(thetas[i] - 15), bone: i === 0 ? tj[0] : tj[i] });
  }
  // last band + bulb + stinger
  b.part(new THREE.CylinderGeometry(0.0095, 0.0095, 0.0045, 8), DARK, {
    at: P[5], dir: tang(140), bone: tj[5],
  });
  const t5 = tang(150);
  const bulbAt = [0, P[5][1] + t5[1] * 0.007, P[5][2] + t5[2] * 0.007];
  ball(bulbAt, 0.0105, 0.0105, 0.0125, STING, tj[5], 9);
  ball([bulbAt[0], bulbAt[1] + 0.003, bulbAt[2] + 0.002], 0.004, 0.003, 0.005, DARK, tj[5], 5);
  const t6 = tang(170);
  const stBase = [0, bulbAt[1] + t5[1] * 0.007, bulbAt[2] + t5[2] * 0.007];
  const stTip = [0, stBase[1] + t6[1] * 0.024, stBase[2] + t6[2] * 0.024];
  b.part(new THREE.ConeGeometry(0.0042, len3(sub(stTip, stBase)), 6), BLACK, {
    at: midp(stBase, stTip),
    dir: norm(sub(stTip, stBase)),
    bone: tj[5],
  });

  // ---------- pedipalps (pincers) ----------
  for (const s of [-1, 1]) {
    const n = s > 0 ? "L" : "R";
    const sh = b.joint("shoulder" + n, { at: [s * 0.017, 0.028, 0.056], parent: head });
    const elbowP = [s * 0.04, 0.027, 0.085];
    const wristP = [s * 0.036, 0.027, 0.112];
    const elbow = b.joint("elbow" + n, { at: elbowP, parent: sh });
    const wrist = b.joint("wrist" + n, { at: wristP, parent: elbow });
    const jawJ = b.joint("claw" + n, { at: [s * 0.02, 0.027, 0.15], parent: wrist });

    seg([s * 0.017, 0.028, 0.056], elbowP, 0.0065, 0.0058, AMBER, sh, 6);
    ball(elbowP, 0.0075, 0.0075, 0.0075, DARK, elbow, 6);
    seg(elbowP, wristP, 0.0058, 0.0062, LIGHT, elbow, 6);
    ball(wristP, 0.0068, 0.0068, 0.0068, DARK, wrist, 6);
    // hand
    ball([s * 0.03, 0.027, 0.136], 0.0135, 0.0095, 0.023, AMBER, wrist, 9);
    ball([s * 0.03, 0.0335, 0.136], 0.007, 0.0045, 0.017, LIGHT, wrist, 6);
    // fixed finger (outer)
    const fb = [s * 0.037, 0.027, 0.152];
    const ft = [s * 0.031, 0.027, 0.19];
    b.part(new THREE.ConeGeometry(0.0072, len3(sub(ft, fb)), 6), AMBER, {
      at: midp(fb, ft), dir: norm(sub(ft, fb)), bone: wrist,
    });
    b.part(new THREE.ConeGeometry(0.0022, 0.008, 5), DARK, {
      at: [s * 0.03, 0.027, 0.192], dir: [0, 0, 1], bone: wrist,
    });
    // moving finger (inner), curved in two pieces
    const mb = [s * 0.0215, 0.027, 0.15];
    const mm = [s * 0.0185, 0.027, 0.172];
    const mt = [s * 0.0265, 0.027, 0.19];
    seg(mb, mm, 0.0065, 0.0052, AMBER, jawJ, 6);
    b.part(new THREE.ConeGeometry(0.0052, len3(sub(mt, mm)), 6), AMBER, {
      at: midp(mm, mt), dir: norm(sub(mt, mm)), bone: jawJ,
    });
    ball(mm, 0.0055, 0.0055, 0.0055, DARK, jawJ, 5);
    // dark finger tips
    b.part(new THREE.ConeGeometry(0.0022, 0.007, 5), DARK, {
      at: [s * 0.028, 0.027, 0.193], dir: norm(sub(mt, mm)), bone: jawJ,
    });
  }

  // ---------- eight legs ----------
  const zs = [0.05, 0.028, 0.006, -0.016];
  const fan = [1.0, 0.35, -0.3, -0.95];
  for (const s of [-1, 1]) {
    const n = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const z = zs[i];
      const f = fan[i];
      const parent = i === 0 ? head : body;
      const root = [s * 0.018, 0.022, z];
      const knee = [s * 0.05, 0.043, z + 0.02 * f];
      const ankle = [s * 0.076, 0.024, z + 0.042 * f];
      const foot = [s * 0.088, 0.0015, z + 0.058 * f];
      const k = i + 1;
      const hip = b.joint("hip" + n + k, { at: root, parent });
      const kn = b.joint("knee" + n + k, { at: knee, parent: hip });
      const an = b.joint("ankle" + n + k, { at: ankle, parent: kn });
      const ft = b.joint("foot" + n + k, { at: foot, parent: an });
      ball(root, 0.007, 0.006, 0.007, DARK, hip, 6);
      seg(root, knee, 0.0036, 0.003, AMBER, hip, 5);
      ball(knee, 0.0043, 0.0043, 0.0043, DARK, kn, 5);
      seg(knee, ankle, 0.003, 0.0026, LIGHT, kn, 5);
      ball(ankle, 0.0035, 0.0035, 0.0035, DARK, an, 5);
      seg(ankle, foot, 0.0025, 0.0016, AMBER, an, 5);
      // little claw at the foot
      b.part(new THREE.ConeGeometry(0.0016, 0.006, 4), BLACK, {
        at: [foot[0] + s * 0.001, foot[1] + 0.001, foot[2] + 0.0025 * f],
        dir: [s * 0.3, -0.5, f * 0.5],
        bone: ft,
      });
    }
  }

  return b.root;
}
```