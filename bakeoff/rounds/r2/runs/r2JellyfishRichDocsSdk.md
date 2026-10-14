```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, arc, frame, rng } from "agentic-3js-builder";

export const meta = {
  name: "Moon Jellyfish",
  description:
    "Glowing translucent moon jelly drifting upward: pale-blue bell, four pink horseshoe gonads, fringe of fine rim tentacles and four ruffled pearl-and-lilac oral arms.",
};

const BELL = "#bfe3ff";
const CANAL = "#d9b8f2";
const PINK = "#ff8fbf";
const CORE = "#fff3fb";
const RIM = "#cfc4f5";
const TENT = "#e3d9ff";
const PEARL = "#f6f2ff";
const LILAC = "#b9a2e6";
const FRILL = "#dccdf7";
const STALK = "#d8c6f2";

export default function build() {
  const b = createBuilder({ name: "moonJelly" });
  const R = rng(11);
  const Y0 = 0.42; // rim height

  const bell = b.joint("bell", { at: [0, Y0, 0], dir: [0, 1, 0], role: "spine" });

  // ---- bell shell (translucent, set after build)
  b.lathe(
    [
      [0, 0.17, "sharp"],
      [0.06, 0.165],
      [0.115, 0.14],
      [0.15, 0.09],
      [0.168, 0.04],
      [0.173, 0.0],
      [0.165, -0.012],
      [0.15, -0.005],
      [0.14, 0.04],
      [0.11, 0.09],
      [0.06, 0.125],
      [0, 0.135, "sharp"],
    ],
    { at: [0, Y0, 0], bone: bell, segments: 16, smoothing: 1, color: BELL, name: "bellShell" },
  );

  // glowing core + stomach disc
  b.part(new THREE.SphereGeometry(0.05, 10, 7), CORE, {
    bone: bell,
    at: [0, Y0 + 0.055, 0],
    scale: [1, 0.55, 1],
    name: "core",
  });
  b.lathe(
    [
      [0, 0.0],
      [0.06, 0.0],
      [0.065, 0.01],
      [0.04, 0.02],
      [0, 0.02],
    ],
    { at: [0, Y0 + 0.005, 0], bone: bell, segments: 12, color: STALK },
  );

  // ---- four pink horseshoes
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const c = new THREE.Vector3(Math.cos(a) * 0.07, Y0 + 0.07, Math.sin(a) * 0.07);
    const inward = new THREE.Vector3(-Math.cos(a), 0, -Math.sin(a));
    const dirFrom = inward.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (30 * Math.PI) / 180);
    const from = c.clone().addScaledVector(dirFrom, 0.032);
    b.sweep(arc(c, from, [0, 1, 0], 300), [0.011, 0.011], { bone: bell, color: PINK, sides: 6, name: `gonad${k}` });
  }

  // ---- radial canals inside the bell
  const inner: number[][] = [
    [0.03, 0.134],
    [0.06, 0.124],
    [0.11, 0.088],
    [0.14, 0.04],
    [0.15, -0.004],
  ];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + Math.PI / 8;
    const pts = inner.map(([r, y]) => [Math.cos(a) * r * 0.95, Y0 + y - 0.008, Math.sin(a) * r * 0.95]);
    b.sweep(catmull(pts), 0.0035, { bone: bell, color: CANAL, sides: 4, caps: "flat" });
  }

  // ---- rim: scalloped lobes and a soft band
  const ringPts: number[][] = [];
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2;
    ringPts.push([Math.cos(a) * 0.171, Y0 - 0.004, Math.sin(a) * 0.171]);
  }
  b.sweep(catmull(ringPts, { closed: true }), 0.009, { bone: bell, color: RIM, sides: 6 });
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.016, 6, 4), RIM, {
      bone: bell,
      at: [Math.cos(a) * 0.168, Y0 - 0.014, Math.sin(a) * 0.168],
      scale: [1, 0.7, 1],
    });
  }

  // ---- fringe of fine rim tentacles
  b.ring(
    frame([0, Y0 - 0.005, 0], [0, 1, 0]),
    { count: 48, radius: 0.167, joints: 8, name: "rimTent", parent: bell, role: "tentacle" },
    (item) => {
      const p = item.at;
      const o = new THREE.Vector3(p.x, 0, p.z).normalize();
      const sd = new THREE.Vector3(-o.z, 0, o.x);
      const len = 0.12 + 0.07 * R();
      const w = (R() - 0.5) * 0.04;
      const pt = (out: number, down: number, side: number) =>
        new THREE.Vector3(p.x, p.y, p.z)
          .addScaledVector(o, out)
          .addScaledVector(sd, side)
          .add(new THREE.Vector3(0, -down, 0));
      b.sweep(bezier(item, pt(0.01, len * 0.3, w), pt(0.0, len * 0.65, -w), pt(0.005, len, w * 0.6)), [0.0035, 0.001], {
        color: TENT,
        sides: 4,
        caps: { end: "point" },
      });
    },
  );

  // ---- manubrium stalk
  b.capsule([0, Y0 + 0.01, 0], [0, Y0 - 0.06, 0], [0.04, 0.026], { bone: bell, color: STALK, sides: 8 });

  // ---- four ruffled oral arms
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const tipY = 0.012 + (i % 2) * 0.05;
    const pts: number[][] = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const y = Y0 + 0.0 - t * (Y0 - tipY);
      const r = 0.03 + 0.035 * Math.sin(t * Math.PI) * (1 - t * 0.4);
      const wave = 0.03 * Math.sin(t * 9 + i * 1.7) * t;
      pts.push([
        Math.cos(a) * r - Math.sin(a) * wave,
        y,
        Math.sin(a) * r + Math.cos(a) * wave,
      ]);
    }
    const chain = b.chain(`arm${i}`, catmull(pts), { parent: bell, count: 5, role: "tentacle" });
    const tube = b.sweep(chain, (t) => [0.024 * (1 - t) + 0.011 + 0.006 * Math.sin(t * 30), 0.005], {
      bands: [
        [0.5, PEARL],
        [1, LILAC],
      ],
      sides: 8,
    });
    for (let k = 0; k < 14; k++) {
      const t = 0.06 + (k / 14) * 0.9;
      for (const ang of [90, 270]) {
        const at = tube.at(t, ang);
        b.stick(new THREE.SphereGeometry(0.016 * (1 - t * 0.5), 6, 4), t < 0.5 ? FRILL : LILAC, at, {
          scale: [0.7, 1, 1.5],
          embed: 0.4,
        });
      }
    }
  }

  const root = b.root;

  // translucency and glow
  const glow: Record<string, number> = { [CORE.slice(1)]: 0.9, [PINK.slice(1)]: 0.45, [CANAL.slice(1)]: 0.3, [BELL.slice(1)]: 0.25 };
  const seen = new Set<THREE.Material>();
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (!m || Array.isArray(m) || seen.has(m) || !m.color) return;
    seen.add(m);
    const hex = m.color.getHexString();
    if (hex === BELL.slice(1)) {
      m.transparent = true;
      m.opacity = 0.5;
      m.depthWrite = false;
    } else if (hex === TENT.slice(1) || hex === RIM.slice(1)) {
      m.transparent = true;
      m.opacity = 0.75;
    }
    if (glow[hex] !== undefined) {
      m.emissive = m.color.clone();
      m.emissiveIntensity = glow[hex];
    } else if (hex === PEARL.slice(1) || hex === LILAC.slice(1) || hex === FRILL.slice(1) || hex === STALK.slice(1)) {
      m.emissive = m.color.clone();
      m.emissiveIntensity = 0.15;
    }
  });

  return root;
}
```