```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, countershade, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Fruit Bat",
  description:
    "A golden-brown flying fox with wings spread wide, a fox-like face, big dark eyes, a moist black nose, pointed ears and charcoal membrane wings with hooked thumb claws. It clutches a half-eaten fig in its feet.",
};

export default function build() {
  const b = createBuilder({ name: "fruit_bat" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const FUR = "#a8702f";
  const GOLD = "#dca04a";
  const PALE = "#e8c27a";
  const TAN = "#b88650";
  const DARK = "#2a2a31";
  const MEM_A = "#3d3d48";
  const MEM_B = "#32323c";
  const CLAW = "#e9dfc4";

  const ball = (at: number[], r: [number, number, number], color: any, bone: string, rot?: number[]) =>
    b.part(new THREE.SphereGeometry(1, 10, 8), color, { at, bone, scale: r, rotation: rot });

  const cone = (base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color: string, bone: string, seg = 5) => {
    const d = dir.clone().normalize();
    const c = base.clone().addScaledVector(d, len / 2);
    return b.part(new THREE.ConeGeometry(r, len, seg), color, { at: c, dir: d, bone });
  };

  // ---------------- skeleton ----------------
  b.joint("root", { at: [0, 0.4, -0.08], dir: [0, 1, 0.5] });
  b.chain("spine", [V(0, 0.4, -0.08), V(0, 0.5, -0.01), V(0, 0.6, 0.06)], {
    parent: "root",
    role: "spine",
    names: ["spine1", "spine2", "chest"],
  });
  b.chain("neck", [V(0, 0.6, 0.06), V(0, 0.69, 0.18)], {
    parent: "chest",
    role: "neck",
    names: ["neck1", "head"],
  });
  b.joint("jaw", { parent: "head", at: [0, 0.658, 0.225], dir: [0, 0, 1], role: "jaw" });

  // ---------------- body ----------------
  const coat = countershade(mottle(FUR, "#94601f", { size: 0.05, seed: 3 }), mottle(PALE, "#d7a860", { size: 0.04, seed: 5 }), {
    level: 0.1,
    soft: 0.5,
  });
  ball([0, 0.5, 0.0], [0.1, 0.145, 0.095], coat, "spine2", [30, 0, 0]);
  ball([0, 0.4, -0.08], [0.075, 0.08, 0.075], coat, "root");
  ball([0, 0.62, 0.07], [0.098, 0.085, 0.09], GOLD, "chest");
  // fluffy ruff and belly tufts
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const base = V(Math.sin(a) * 0.085, 0.63 + Math.cos(a) * 0.03, 0.07 + Math.cos(a) * 0.06);
    const dir = V(Math.sin(a) * 0.8, 0.1 + Math.cos(a) * 0.1, Math.cos(a) * 0.9 + 0.2);
    cone(base, dir, 0.05, 0.02, i % 2 ? GOLD : PALE, "chest");
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const base = V(Math.sin(a) * 0.08, 0.47 + Math.cos(a) * 0.04, 0.0 + Math.cos(a) * 0.07 + 0.02);
    cone(base, V(Math.sin(a) * 0.7, -0.5, Math.cos(a) * 0.7 + 0.2), 0.045, 0.018, i % 2 ? PALE : FUR, "spine2");
  }

  // ---------------- head ----------------
  ball([0, 0.69, 0.2], [0.066, 0.062, 0.068], FUR, "head");
  ball([0, 0.675, 0.285], [0.036, 0.03, 0.055], TAN, "head");
  ball([0, 0.676, 0.338], [0.019, 0.016, 0.015], "#0b0b0e", "head");
  ball([-0.005, 0.684, 0.348], [0.006, 0.004, 0.004], "#8f98a8", "head");
  // lower jaw
  b.part(new THREE.BoxGeometry(0.048, 0.016, 0.075), "#8d5f33", { at: [0, 0.65, 0.275], bone: "jaw" });
  b.part(new THREE.BoxGeometry(0.03, 0.01, 0.03), "#8d5f33", { at: [0, 0.652, 0.32], bone: "jaw" });
  b.part(new THREE.BoxGeometry(0.044, 0.004, 0.07), "#5a2030", { at: [0, 0.659, 0.275], bone: "jaw" });
  for (const s of [1, -1]) {
    cone(V(s * 0.014, 0.664, 0.318), V(0, 1, 0.1), 0.012, 0.004, "#f4efe0", "jaw", 4);
    cone(V(s * 0.016, 0.664, 0.325), V(0, -1, 0), 0.012, 0.004, "#f4efe0", "head", 4);
    // eyes
    const eye = V(s * 0.042, 0.716, 0.245);
    ball(eye.toArray(), [0.021, 0.022, 0.02], "#07070a", "head");
    const hl = eye.clone().add(V(s * 0.4, 0.5, 0.75).normalize().multiplyScalar(0.017));
    ball(hl.toArray(), [0.006, 0.006, 0.005], "#ffffff", "head");
    // brow ridge
    ball([s * 0.04, 0.74, 0.245], [0.02, 0.007, 0.02], "#8a5a28", "head");
    // ears
    cone(V(s * 0.04, 0.742, 0.17), V(s * 0.5, 1, -0.25), 0.09, 0.032, "#8a5a28", "head", 4);
    cone(V(s * 0.04, 0.742, 0.178), V(s * 0.5, 1, -0.25), 0.07, 0.022, "#d89a8a", "head", 4);
    // cheek fluff
    cone(V(s * 0.05, 0.68, 0.22), V(s * 1, -0.2, 0.3), 0.04, 0.016, PALE, "head");
    cone(V(s * 0.045, 0.66, 0.24), V(s * 0.8, -0.5, 0.5), 0.035, 0.015, GOLD, "head");
  }
  cone(V(0, 0.745, 0.215), V(0, 0.6, -0.3), 0.04, 0.02, GOLD, "head");

  // ---------------- wings ----------------
  const wrist = V(0.46, 0.8, 0.12);
  const dirs = [V(1, 0.12, 0.2), V(0.8, -0.05, -0.45), V(0.55, -0.15, -0.8), V(0.3, -0.25, -0.95)];
  const lens = [0.5, 0.55, 0.5, 0.42];
  const tips = dirs.map((d, i) => wrist.clone().addScaledVector(d.clone().normalize(), lens[i]));
  const elbowP = V(0.3, 0.74, 0.0);
  const shoulderP = V(0.09, 0.62, 0.05);
  const hipP = V(0.07, 0.42, -0.12);

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const M = (v: THREE.Vector3) => V(v.x * s, v.y, v.z);
    const wb = `wrist${S}`;

    const arm = b.chain(`arm${S}`, [M(shoulderP), M(elbowP), M(wrist)], {
      parent: "chest",
      role: "arm",
      names: [`shoulder${S}`, `elbow${S}`, wb],
    });
    b.sweep(arm, [0.026, 0.012], { color: "#4a3a2e", sides: 6 });

    tips.forEach((tip, i) => {
      const knuckle = wrist.clone().lerp(tip, 0.5).add(V(0, 0.015, 0));
      const f = b.chain(`finger${S}${i + 1}`, [M(wrist), M(knuckle), M(tip)], {
        parent: wb,
        role: "digit",
        names: [`finger${S}${i + 1}a`, `finger${S}${i + 1}b`, `finger${S}${i + 1}tip`],
      });
      b.sweep(f, [0.011, 0.0035], { color: DARK, sides: 5 });
    });

    // membranes between fingers (scalloped trailing edges)
    for (let i = 0; i < 3; i++) {
      const mid = tips[i].clone().add(tips[i + 1]).multiplyScalar(0.5);
      mid.lerp(wrist, 0.22);
      b.slab([M(wrist), M(tips[i]), M(mid), M(tips[i + 1])], {
        color: i % 2 ? MEM_B : MEM_A,
        thickness: 0.004,
        bone: wb,
      });
    }
    b.slab([M(elbowP), M(wrist), M(tips[3])], { color: MEM_B, thickness: 0.004, bone: wb });
    b.slab([M(elbowP), M(tips[3]), M(hipP)], { color: MEM_A, thickness: 0.004, bone: wb });
    b.slab([M(shoulderP), M(elbowP), M(hipP)], { color: MEM_B, thickness: 0.004, bone: wb });
    // leading edge membrane (propatagium)
    b.slab([M(shoulderP.clone().add(V(0, 0, 0.02))), M(wrist), M(elbowP)], { color: MEM_A, thickness: 0.004, bone: wb });

    // thumb with hooked claw
    const thumbEnd = wrist.clone().add(V(0.02, 0.05, 0.07));
    b.joint(`thumb${S}`, { parent: wb, at: M(wrist), aim: M(thumbEnd) });
    b.rod(M(wrist), M(thumbEnd), 0.011, { color: DARK, bone: `thumb${S}`, sides: 5 });
    const c1 = V(s * 0.2, 0.55, 0.8);
    cone(M(thumbEnd), c1, 0.04, 0.012, CLAW, `thumb${S}`, 5);
    const c1end = thumbEnd.clone().addScaledVector(c1.clone().normalize(), 0.04);
    cone(M(c1end), V(s * 0.1, -0.6, 0.7), 0.028, 0.007, CLAW, `thumb${S}`, 5);

    // legs and feet
    const leg = b.chain(`leg${S}`, [V(s * 0.05, 0.38, -0.08), V(s * 0.078, 0.28, -0.04), V(s * 0.05, 0.17, 0.05)], {
      parent: "root",
      role: "leg",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
    });
    b.sweep(leg, [0.024, 0.011], { color: "#8d5f33", sides: 6 });
    ball([s * 0.05, 0.17, 0.05], [0.014, 0.014, 0.018], "#4a3a2e", `ankle${S}`);
    for (const z of [0.09, 0.12, 0.15]) {
      const tip = V(s * 0.068, 0.095, z);
      b.rod(V(s * 0.05, 0.17, 0.05), tip, 0.007, { color: "#3a2d2d", bone: `ankle${S}`, sides: 5 });
      cone(tip.clone().add(V(0, 0.002, 0)), V(-s * 0.6, -0.2, 0.1), 0.014, 0.004, CLAW, `ankle${S}`, 4);
    }
  }

  // ---------------- half-eaten fig ----------------
  const FR = 0.075;
  const fc = V(0, 0.075, 0.12);
  b.joint("fig", { parent: "root", at: fc, dir: [0, 1, 0] });
  const tilt = 15;
  const figPos = (x: number, y: number, z: number) =>
    V(x, y, z).applyAxisAngle(V(1, 0, 0), (tilt * Math.PI) / 180).add(fc);
  const skin = paint((p, n) =>
    mix(mix("#4a1f52", "#2d1a3c", smoothstep(0.35, 0.65, 0.5 + 0.5 * Math.sin(p.x * 90 + p.y * 40))), "#7a8a3a", smoothstep(0.08, 0.14, p.y)),
  );
  b.part(
    new THREE.SphereGeometry(FR, 12, 9, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65),
    skin,
    { at: fc, bone: "fig", rotation: [tilt, 0, 0] },
  );
  const capY = FR * Math.cos(Math.PI * 0.35);
  const capR = FR * Math.sin(Math.PI * 0.35);
  b.part(new THREE.CylinderGeometry(capR, capR, 0.006, 12), "#cdbd62", {
    at: figPos(0, capY - 0.002, 0),
    bone: "fig",
    rotation: [tilt, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(capR * 0.88, capR * 0.88, 0.006, 12), "#c2405a", {
    at: figPos(0, capY + 0.001, 0),
    bone: "fig",
    rotation: [tilt, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(capR * 0.55, capR * 0.55, 0.006, 10), "#e58a96", {
    at: figPos(0, capY + 0.0025, 0),
    bone: "fig",
    rotation: [tilt, 0, 0],
  });
  const rand = (() => {
    let s = 7;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  })();
  for (let i = 0; i < 22; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * capR * 0.8;
    b.part(new THREE.SphereGeometry(0.0035, 4, 3), "#f0d070", {
      at: figPos(Math.cos(a) * r, capY + 0.005, Math.sin(a) * r),
      bone: "fig",
    });
  }
  // stem nub at the bottom
  cone(V(0, 0.0, 0.12), V(0, -1, 0), 0.0, 0.001, "#4a1f52", "fig", 3);

  return b.root;
}
```