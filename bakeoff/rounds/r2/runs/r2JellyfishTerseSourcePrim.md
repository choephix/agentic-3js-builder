```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, gradient } from "agentic-3js-builder";

export const meta = {
  name: "Jellyfish",
  description:
    "A stylized moon-jelly style jellyfish: ribbed faceted bell with scalloped rim, frilly oral arms and long trailing tentacles, rigged on named joint chains.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "jellyfish" });
  const R = rng(11);
  const Y0 = 0.72;

  b.joint("root", { at: [0, Y0, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("bell", { parent: "root", at: [0, Y0, 0], dir: [0, 1, 0], role: "head" });

  // Bell paint: radial ribs, lighter crown, magenta rim
  const bellPaint = paint((p) => {
    const ang = Math.atan2(p.x, p.z);
    const rib = 0.5 + 0.5 * Math.cos(ang * 8);
    const h = Math.min(Math.max((p.y - Y0) / 0.26, 0), 1);
    const base = mix("#b57be6", "#e9c8ff", h);
    const ribbed = mix(base, "#8a52d0", rib * 0.45 * (1 - h * 0.5));
    return p.y - Y0 < 0.03 ? mix(ribbed, "#ff6fb8", 0.7) : ribbed;
  });

  b.lathe(
    [
      [0, 0.27], [0.1, 0.26], [0.18, 0.22], [0.24, 0.14], [0.265, 0.05], [0.26, -0.02],
      [0.225, 0.0], [0.205, 0.1], [0.12, 0.19], [0, 0.21],
    ],
    { color: bellPaint, at: [0, Y0, 0], segments: 16, bone: "bell", name: "bell" },
  );

  // Crown knob and dome bumps
  b.part(new THREE.SphereGeometry(0.035, 6, 5), "#f6e3ff", { at: [0, Y0 + 0.27, 0], bone: "bell" });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const r = 0.15;
    const y = 0.04 + 0.23 * Math.sqrt(1 - (r / 0.275) ** 2);
    b.part(new THREE.SphereGeometry(0.02, 5, 4), "#ffd9f3", {
      at: [Math.sin(a) * r, Y0 + y, Math.cos(a) * r],
      scale: [1, 0.6, 1],
      bone: "bell",
    });
  }

  // Scalloped rim lappets
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.03, 0.07, 5), i % 2 ? "#ff7cc4" : "#ff9ad3", {
      at: [Math.sin(a) * 0.245, Y0 - 0.02, Math.cos(a) * 0.245],
      dir: [0, -1, 0],
      bone: "bell",
    });
  }

  // Gonads: clover glowing inside the bell
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 8), "#ffb35c", {
      at: [Math.sin(a) * 0.08, Y0 + 0.07, Math.cos(a) * 0.08],
      rotation: [90, 0, 0],
      bone: "bell",
    });
  }

  // Oral arms: frilly ribbons
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const pts: [number, number, number][] = [
      [sx * 0.05, Y0 + 0.02, sz * 0.05],
      [sx * 0.07, Y0 - 0.12, sz * 0.07],
      [sx * 0.09, Y0 - 0.26, sz * 0.09],
      [sx * 0.1, Y0 - 0.4, sz * 0.1],
    ];
    const ch = b.chain(`oral${k + 1}_`, b.along ? pts : pts, {
      parent: "bell",
      count: 3,
      role: "tentacle",
      up: [sx, 0, sz],
    });
    b.sweep(ch, (t) => [(0.022 + 0.012 * Math.sin(t * 16 + k)) * (1 - 0.5 * t), 0.006], {
      color: k % 2 ? "#f7c9ee" : "#ffdff6",
      section: "box",
      name: `oralArm${k + 1}`,
    });
  }

  // Long trailing tentacles
  const tentPaint = gradient("#ff8fd0", "#7a4bd6", [0, Y0, 0], [0, 0, 0]);
  const n = 12;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const len = k % 3 === 0 ? 0 : 0.1 + R() * 0.18;
    const ph = R() * 6;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 4; i++) {
      const f = i / 4;
      const y = Y0 - 0.02 - f * (Y0 - 0.02 - len);
      const rr = 0.235 + 0.04 * Math.sin(f * 5 + ph) + f * 0.02;
      const tw = a + 0.25 * Math.sin(f * 4 + ph);
      pts.push([Math.sin(tw) * rr, y, Math.cos(tw) * rr]);
    }
    pts[0] = [sx * 0.235, Y0 - 0.02, sz * 0.235];
    const ch = b.chain(`tent${k + 1}_`, pts, { parent: "bell", count: 4, role: "tentacle" });
    b.sweep(ch, (t) => 0.009 * (1 - t) + 0.003, { color: tentPaint, name: `tentacle${k + 1}`, sides: 5 });
  }

  return b.root;
}
```