```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Penguin with Chick",
  description:
    "Proud emperor penguin parent with glossy blue-black back, golden neck and ear patches, a slender striped beak and big black feet, with a fluffy grey chick peeking out from between its feet.",
};

export default function build() {
  const b = createBuilder({ name: "emperorPenguin" });

  const DARK = "#141f2c";
  const BLUE = "#23395c";
  const WHITE = "#f5f4ee";
  const PALE = "#f7dd85";
  const GOLD = "#f2b02a";
  const PINK = "#f28a63";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.3, 0], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.3, 0],
      [0, 0.55, 0],
      [0, 0.85, 0.02],
      [0, 0.97, 0.04],
      [0, 1.06, 0.06],
    ],
    { role: "spine", parent: "root", names: ["pelvis", "spine", "neck", "head"], up: [0, 0, 1] },
  );
  b.joint("jaw", { parent: "head", at: [0, 1.025, 0.08], dir: [0, 0, 1], role: "jaw" });
  b.joint("tail1", { parent: "pelvis", at: [0, 0.2, -0.12], dir: [0, -0.5, -1], role: "tail" });

  // ---------- plumage paint ----------
  const plumage = paint((p, n) => {
    let f = smoothstep(-0.05, 0.4, n.z);
    f *= 1 - smoothstep(0.97, 1.03, p.y);
    const back = mix(DARK, BLUE, smoothstep(0.2, 0.9, n.y) * 0.75);
    const c = mix(back, WHITE, f);
    const g = smoothstep(0.76, 0.86, p.y) * (1 - smoothstep(0.97, 1.0, p.y)) * smoothstep(-0.4, 0.2, n.z);
    const e =
      smoothstep(0.03, 0.05, Math.abs(p.x)) *
      smoothstep(0.97, 1.0, p.y) *
      (1 - smoothstep(1.07, 1.1, p.y)) *
      (1 - smoothstep(0.07, 0.1, p.z)) *
      smoothstep(-0.03, 0.0, p.z);
    let gcol = mix(PALE, GOLD, smoothstep(0.78, 0.96, p.y));
    gcol = mix(gcol, "#ef9a1e", e * 0.6);
    return mix(c, gcol, Math.max(g, e));
  });

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.16, -0.04], w: 0.18, h: 0.18 },
      { at: [0, 0.3, -0.03], w: 0.32, h: 0.28 },
      { at: [0, 0.5, -0.02], w: 0.39, h: 0.32 },
      { at: [0, 0.68, 0.0], w: 0.37, h: 0.3 },
      { at: [0, 0.84, 0.02], w: 0.26, h: 0.22 },
      { at: [0, 0.97, 0.04], w: 0.15, h: 0.15 },
    ],
    { color: plumage, bone: spine, sides: 10, name: "body", up: [0, 0, 1] },
  );

  // head
  b.part(new THREE.SphereGeometry(1, 10, 8), plumage, {
    at: [0, 1.045, 0.05],
    scale: [0.075, 0.075, 0.095],
    bone: "head",
    name: "head",
  });

  // beak
  b.sweep(
    [
      [0, 1.04, 0.1],
      [0, 1.035, 0.19],
      [0, 1.012, 0.27],
    ],
    {
      radius: (t: number) => [0.02 * (1 - t) + 0.004, 0.016 * (1 - t) + 0.004],
      color: "#1b1b20",
      sectors: [
        [50, 130, PINK],
        [230, 310, PINK],
      ],
      bone: "head",
      sides: 8,
      name: "beakUpper",
    },
  );
  b.sweep(
    [
      [0, 1.018, 0.1],
      [0, 1.012, 0.18],
      [0, 1.0, 0.245],
    ],
    {
      radius: (t: number) => [0.015 * (1 - t) + 0.003, 0.011 * (1 - t) + 0.003],
      color: PINK,
      bone: "jaw",
      sides: 8,
      name: "beakLower",
    },
  );

  // eyes + tail
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), "#4a3222", { at: [0.068 * s, 1.06, 0.07], scale: 0.012, bone: "head" });
    b.part(new THREE.SphereGeometry(1, 6, 5), "#050505", { at: [0.074 * s, 1.06, 0.072], scale: 0.008, bone: "head" });
    b.part(new THREE.SphereGeometry(1, 5, 4), "#ffffff", { at: [0.078 * s, 1.065, 0.077], scale: 0.003, bone: "head" });
  }
  b.capsule([0, 0.22, -0.1], [0, 0.04, -0.3], { radius: [0.045, 0.012], color: DARK, bone: "tail1", name: "tail", sides: 6 });

  // ---------- limbs ----------
  const flipperPaint = (s: number) =>
    paint((p, n) => {
      const inner = smoothstep(0.1, 0.6, -n.x * s);
      return mix(mix(DARK, BLUE, smoothstep(0.1, 0.8, n.x * s) * 0.6), "#e9e7e2", inner * 0.9);
    });
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = b.chain(
      "arm" + L,
      [
        [0.18 * s, 0.8, 0],
        [0.27 * s, 0.68, 0.0],
        [0.34 * s, 0.52, 0.02],
      ],
      { role: "arm", parent: "spine", names: ["shoulder" + L, "elbow" + L, "hand" + L], up: [0, 0, 1] },
    );
    b.sweep(arm, {
      radius: (t: number) => [0.013, 0.03 + 0.025 * Math.sin(Math.PI * Math.min(t * 1.2, 1)) * (1 - 0.3 * t)],
      color: flipperPaint(s),
      sides: 8,
      name: "flipper" + L,
    });

    const leg = b.chain(
      "leg" + L,
      [
        [0.1 * s, 0.3, 0],
        [0.11 * s, 0.15, 0.03],
        [0.12 * s, 0.05, 0.08],
      ],
      { role: "leg", parent: "root", names: ["hip" + L, "knee" + L, "ankle" + L], up: [0, 0, 1] },
    );
    b.sweep(leg, { radius: 0.035, color: "#1c1c20", sides: 6, name: "leg" + L });

    // big black feet
    const ank = "ankle" + L;
    b.part(new THREE.SphereGeometry(1, 8, 6), "#0e0e10", {
      at: [0.12 * s, 0.022, 0.1],
      scale: [0.06, 0.025, 0.1],
      bone: ank,
      name: "foot" + L,
    });
    [-0.5, 0, 0.5].forEach((a, i) => {
      const dx = Math.sin(a) * 0.1;
      const dz = Math.cos(a) * 0.1;
      b.part(new THREE.SphereGeometry(1, 6, 5), "#0e0e10", {
        at: [0.12 * s + dx * s * 0.6, 0.02, 0.14 + dz * 0.6],
        scale: [0.02, 0.02, 0.05],
        rotation: [0, a * 57.3 * s, 0],
        bone: ank,
        name: "toe" + L + i,
      });
      b.part(new THREE.ConeGeometry(0.008, 0.03, 5), "#3a3a3e", {
        at: [0.12 * s + dx * s * 1.05, 0.02, 0.14 + dz * 1.05],
        rotation: [90, 0, 0],
        bone: ank,
      });
    });
  }

  // ---------- chick ----------
  b.joint("chick", { parent: "root", at: [0, 0.1, 0.17], dir: [0, 1, 0] });
  b.joint("chickHead", { parent: "chick", at: [0, 0.2, 0.2], dir: [0, 1, 0.3], role: "head" });
  const GREY = "#9b9da4";
  const chickBody = paint((p, n) => mix(GREY, "#d4d5d9", smoothstep(0.1, 0.8, n.z) * 0.7));
  b.part(new THREE.SphereGeometry(1, 9, 7), chickBody, {
    at: [0, 0.11, 0.17],
    scale: [0.075, 0.095, 0.085],
    bone: "chick",
    name: "chickBody",
  });
  const chickHead = paint((p, n) => {
    const dy = p.y - 0.27;
    const w = smoothstep(0.1, 0.4, n.z) * (1 - smoothstep(0.0, 0.03, dy));
    const c = mix(GREY, "#f1f0ec", w);
    return mix(c, "#17171b", smoothstep(-0.005, 0.02, dy) * (1 - smoothstep(0.2, 0.5, n.z) * 0.2));
  });
  b.part(new THREE.SphereGeometry(1, 9, 7), chickHead, {
    at: [0, 0.27, 0.22],
    scale: 0.065,
    bone: "chickHead",
    name: "chickHead",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 5), "#050505", { at: [0.03 * s, 0.278, 0.277], scale: 0.01, bone: "chickHead" });
    b.part(new THREE.SphereGeometry(1, 5, 4), "#ffffff", { at: [0.032 * s, 0.282, 0.285], scale: 0.003, bone: "chickHead" });
    b.capsule([0.07 * s, 0.17, 0.17], [0.1 * s, 0.09, 0.18], {
      radius: [0.02, 0.012],
      color: GREY,
      bone: "chick",
      sides: 6,
    });
  }
  b.spike([0, 0.258, 0.275], [0, -0.1, 1], 0.045, { radius: 0.014, color: "#1a1a1c", bone: "chickHead", sides: 6 });
  // fluff tufts
  const r = rng7();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const dir = new THREE.Vector3(Math.sin(a) * 0.9, 0.5 + r() * 0.4, Math.cos(a) * 0.6 - 0.2).normalize();
    const base = new THREE.Vector3(0, 0.11, 0.17).addScaledVector(dir, 0.08);
    b.spike(base, dir.toArray(), 0.04, { radius: 0.014, color: i % 2 ? "#b4b6bc" : "#a3a5ab", bone: "chick", sides: 5 });
  }
  for (let i = 0; i < 5; i++) {
    const a = 0.6 + i * 1.2;
    const dir = new THREE.Vector3(Math.sin(a) * 0.6, 0.9, Math.cos(a) * 0.5 - 0.1).normalize();
    const base = new THREE.Vector3(0, 0.27, 0.22).addScaledVector(dir, 0.062);
    b.spike(base, dir.toArray(), 0.025, { radius: 0.01, color: "#1f1f24", bone: "chickHead", sides: 5 });
  }

  return b.root;
}

function rng7() {
  let s = 7;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
```