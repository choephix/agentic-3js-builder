import * as THREE from "three";
import { createBuilder, catmull, rng, svg, noise, paint, mix, smoothstep, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description: "Pandora-style glowing plant: curled stalks, frond leaves, glowing bulbs, hanging tendrils and ground petals.",
};

const DARK = "#1a1038";
const TEAL = "#20e8d0";
const CYAN = "#5ff0ff";
const VIOLET = "#8a4dff";
const PINK = "#ff5fd0";

const glowTex = svg(
  `<svg viewBox="0 0 64 64"><defs><radialGradient id="g"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#7ff8ff"/><stop offset="1" stop-color="#1ab0d0" stop-opacity="0"/></radialGradient></defs><circle cx="32" cy="32" r="31" fill="url(#g)"/></svg>`,
  { size: 64 },
);
const veinTex = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 L16 2" stroke="#c8ffff" stroke-width="3"/><path d="M16 50 L4 36 M16 50 L28 36 M16 36 L6 22 M16 36 L26 22 M16 22 L9 11 M16 22 L23 11" stroke="#8ff" stroke-width="2.5" fill="none"/><path d="M16 64 C2 40 6 14 16 1 C26 14 30 40 16 64Z" fill="none" stroke="#5ff" stroke-width="2"/></svg>`,
  { size: 128 },
);
const dots = svg(
  `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="#fff"/></svg>`,
  { size: 32 },
);

const stemPaint = paint((p, n, s) => {
  const base = mix("#2a1a5c", "#4a2a9a", smoothstep(0, 1, noise(p, 0.12, 3)));
  const stripe = Math.abs(((s[1] + 360) % 60) - 30) < 3 ? 1 : 0;
  return stripe ? mix(base, TEAL, 0.7) : mix(base, "#0e0820", smoothstep(0.2, -0.8, n.y) * 0.5);
});
const leafPaint = paint((p, n) =>
  mix(mix("#0f6a8a", "#4a2aa8", noise(p, 0.15, 5)), TEAL, smoothstep(0.4, 1, n.y) * 0.3),
);

export default function build() {
  const b = createBuilder({ name: "alienPlant" });
  const R = rng(11);
  const root = b.joint("root", { at: [0, 0.05, 0], role: "spine" });

  // ground mound
  b.part(new THREE.CylinderGeometry(0.5, 0.65, 0.12, 9), "#1d1240", { bone: root, at: [0, 0.03, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.35, 0.5, 0.1, 9), "#2a1a5c", { bone: root, at: [0, 0.1, 0], flat: true });

  // main stalks
  const stalks: { top: THREE.Vector3; dir: THREE.Vector3 }[] = [];
  const defs = [
    { a: 0, d: 0.12, h: 1.7, lean: 0.35 },
    { a: 2.1, d: 0.18, h: 1.2, lean: 0.4 },
    { a: 4.0, d: 0.16, h: 1.4, lean: 0.45 },
    { a: 5.2, d: 0.2, h: 0.8, lean: 0.35 },
    { a: 1.0, d: 0.3, h: 0.6, lean: 0.3 },
  ];
  defs.forEach((d, i) => {
    const bx = Math.cos(d.a) * d.d, bz = Math.sin(d.a) * d.d;
    const tx = bx + Math.cos(d.a) * d.lean, tz = bz + Math.sin(d.a) * d.lean;
    const pts = [
      [bx, 0.1, bz],
      [bx * 0.9, d.h * 0.35, bz * 0.9],
      [(bx + tx) / 2 - Math.cos(d.a) * 0.1, d.h * 0.7, (bz + tz) / 2 - Math.sin(d.a) * 0.1],
      [tx, d.h, tz],
    ];
    const path = catmull(pts);
    const ch = b.chain(`stalk${i}`, path, { parent: root, count: 4, role: "spine" });
    const sw = b.sweep(ch, (t) => 0.06 * (1 - t * 0.65) + 0.012, { color: stemPaint, sides: 6 } as any);
    // glowing rings along stalk
    b.along(sw, 5, (at) => {
      glow(b.stick(new THREE.TorusGeometry(0.05 * (1 - at.t * 0.5) + 0.02, 0.008, 4, 8), TEAL, at, { embed: 0 } as any), 1.3);
    });
    const topPt = path.at(1);
    stalks.push({ top: topPt, dir: new THREE.Vector3(Math.cos(d.a), 0.3, Math.sin(d.a)) });

    // frond leaves along stalk
    for (let k = 0; k < 4; k++) {
      const t = 0.3 + k * 0.17;
      const p = path.at(t);
      const ang = d.a + (k % 2 ? 1 : -1) * (1.2 + R() * 0.5);
      const dirv = new THREE.Vector3(Math.cos(ang), 0.5, Math.sin(ang)).normalize();
      const len = 0.45 - k * 0.04;
      const leaf = b.sweep(
        catmull([p, [p.x + dirv.x * len * 0.5, p.y + 0.18, p.z + dirv.z * len * 0.5], [p.x + dirv.x * len, p.y + 0.12, p.z + dirv.z * len]]),
        (t2) => [0.07 * Math.sin(Math.PI * Math.min(t2 * 1.1, 1)) + 0.005, 0.006],
        { color: leafPaint, bone: root, caps: "point" } as any,
      );
      void leaf;
    }
  });

  // bulbs and crowns on the tallest stalks
  stalks.forEach((s, i) => {
    const r = 0.07 + (i % 3) * 0.025;
    glow(b.part(new THREE.IcosahedronGeometry(r, 1), i % 2 ? PINK : CYAN, { bone: root, at: s.top, flat: true }), 1.6);
    b.part(new THREE.IcosahedronGeometry(r * 1.7, 0), VIOLET, { bone: root, at: s.top, flat: true, scale: [1, 0.8, 1] } as any);
    // halo card
    b.cards([frame(s.top, [0, 1, 0])], glowTex, { size: r * 5, lean: 0, flow: [0, 0, 1], cross: true, color: i % 2 ? PINK : CYAN } as any);
    // petals ring
    const ring = b.ring(frame(s.top, [0, 1, 0]), { count: 6, radius: r * 1.2, tilt: 40 });
    b.cards(ring.items, veinTex, { size: [r * 2.2, r * 4], lean: 25, flow: [0, 1, 0], color: i % 2 ? "#ff8ae0" : "#7ffcff" } as any);
    // hanging tendrils
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const st = new THREE.Vector3(s.top.x + Math.cos(a) * r, s.top.y - r * 0.5, s.top.z + Math.sin(a) * r);
      const len = 0.3 + R() * 0.25;
      const t = b.sweep(
        catmull([st, [st.x + Math.cos(a) * 0.1, st.y - len * 0.5, st.z + Math.sin(a) * 0.1], [st.x + Math.cos(a) * 0.12, st.y - len, st.z + Math.sin(a) * 0.12]]),
        [0.008, 0.002],
        { color: VIOLET, bone: root, sides: 4 } as any,
      );
      void t;
      glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), CYAN, { bone: root, at: [st.x + Math.cos(a) * 0.12, st.y - len, st.z + Math.sin(a) * 0.12] }), 2);
    }
  });

  // ground petals + glowing spores
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const base: [number, number, number] = [Math.cos(a) * 0.4, 0.12, Math.sin(a) * 0.4];
    b.sweep(
      catmull([base, [base[0] * 1.5, 0.28, base[2] * 1.5], [base[0] * 2.1, 0.12, base[2] * 2.1]]),
      (t) => [0.08 * Math.sin(Math.PI * t) + 0.01, 0.008],
      { color: leafPaint, bone: root, caps: "point" } as any,
    );
    glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), i % 2 ? TEAL : PINK, { bone: root, at: [base[0] * 1.9, 0.14, base[2] * 1.9] }), 1.8);
  }
  for (let i = 0; i < 14; i++) {
    const a = R() * 6.28, d = 0.5 + R() * 0.8;
    glow(b.part(new THREE.IcosahedronGeometry(0.016, 0), i % 2 ? CYAN : VIOLET, { bone: root, at: [Math.cos(a) * d, 0.1 + R() * 0.15, Math.sin(a) * d], flat: true }), 1.8);
    if (i % 4 === 0)
      b.cards([frame([Math.cos(a) * d, 0.06, Math.sin(a) * d], [0, 1, 0])], dots, { size: 0.08, lean: 90, color: TEAL } as any);
  }

  return b.root;
}
