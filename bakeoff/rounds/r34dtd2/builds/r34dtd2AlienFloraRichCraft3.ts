import * as THREE from "three";
import { createBuilder, catmull, rng, svg, noise, paint, mix, smoothstep, countershade, mottle } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pandora Glowbloom",
  description: "Bioluminescent alien plant in the Avatar style: a twisting stalk, glowing frond leaves, hanging tendrils and luminous pods.",
};

const DEEP = "#14243a";
const TEAL = "#1fb6a8";
const CYAN = "#5af2ff";
const MAG = "#d44cff";
const PINK = "#ff6ad5";
const LIME = "#9dff7a";

export default function build() {
  const b = createBuilder({ name: "glowbloom" });
  const R = rng(5);
  const base = b.joint("base", { at: [0, 0.0, 0], dir: [0, 1, 0], role: "spine" });

  // stalk
  const stalkPts = [
    [0, 0, 0],
    [0.05, 0.4, 0.02],
    [-0.04, 0.85, 0.0],
    [0.03, 1.3, -0.02],
    [0, 1.7, 0.02],
  ];
  const stalkPath = catmull(stalkPts);
  const stalk = b.chain("stalk", stalkPath, { parent: base, count: 5, role: "spine" });
  const bark = countershade(mottle(DEEP, "#1e4a5a", { size: 0.12 }), "#0d1a2a");
  const st = b.sweep(stalk, (t) => 0.12 * (1 - t) + 0.035, { color: bark, sides: 7 });

  // glowing vein dots along the stalk
  const dotTex = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="${CYAN}"/><circle cx="16" cy="16" r="6" fill="#ffffff"/></svg>`, { size: 64 });
  const skin = b.surface(st);
  const hits = skin.scatter(40, { rng: R, minDist: 0.07 });
  b.cards(hits, dotTex, { size: 0.045, lean: 90, color: CYAN });
  glow(b.stick(new THREE.SphereGeometry(0.02, 6, 4), CYAN, hits[0]), 1.5);

  // buttress roots
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const tip: [number, number, number] = [Math.sin(a) * 0.42, 0.02, Math.cos(a) * 0.42];
    const mid: [number, number, number] = [Math.sin(a) * 0.2, 0.14, Math.cos(a) * 0.2];
    b.sweep(catmull([[0, 0.3, 0], mid, tip]), [0.07, 0.015], { color: DEEP, sides: 6, bone: base, caps: { end: "point" } });
  }

  // frond leaves
  const leafTex = svg(
    `<svg viewBox="0 0 64 128"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${TEAL}"/><stop offset="1" stop-color="${CYAN}"/></linearGradient></defs>
    <path d="M32 126 Q2 80 12 40 Q22 10 32 2 Q42 10 52 40 Q62 80 32 126Z" fill="url(#g)" stroke="#0a3a4a" stroke-width="3"/>
    <path d="M32 120 L32 10" stroke="${LIME}" stroke-width="3"/>
    <path d="M32 90 L14 62 M32 90 L50 62 M32 60 L18 38 M32 60 L46 38" stroke="${LIME}" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );
  const frondFrames = b.ring(stalk.at(0.62), { count: 7, radius: 0.04, tilt: -55 }).items;
  glow(b.cards(frondFrames, leafTex, { size: [0.5, 0.85], lean: 50, bend: 55, vary: 0.25, rng: R, cross: false, flow: [0, -0.2, 1] }), 0.9);
  const lowFrames = b.ring(stalk.at(0.3), { count: 5, radius: 0.08, tilt: -75 }).items;
  glow(b.cards(lowFrames, leafTex, { size: [0.4, 0.7], lean: 65, bend: 50, vary: 0.2, rng: R }), 0.8);

  // hanging tendrils
  const top = stalk.at(0.88);
  const tend = b.ring(top, { count: 8, radius: 0.1, tilt: -80 }).items;
  tend.forEach((f, i) => {
    const d = f.outward;
    const p0 = f.at.clone();
    const p1 = p0.clone().addScaledVector(d, 0.25).add(new THREE.Vector3(0, 0.05, 0));
    const p2 = p1.clone().addScaledVector(d, 0.1).add(new THREE.Vector3(0, -0.4 - 0.1 * (i % 3), 0));
    b.sweep(catmull([p0, p1, p2]), [0.014, 0.004], { color: i % 2 ? MAG : PINK, bone: stalk.joints[4], sides: 5, caps: { end: "point" } });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), i % 2 ? PINK : LIME, { at: p2, bone: stalk.joints[4] }), 1.8);
  });

  // crown bloom
  const tipPos = stalk.at(1).at;
  const petalTex = svg(
    `<svg viewBox="0 0 48 96"><path d="M24 94 Q-4 50 24 2 Q52 50 24 94Z" fill="${MAG}" stroke="#4a1a6a" stroke-width="3"/><path d="M24 90 L24 14" stroke="#ffd6ff" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const crown = b.ring({ at: tipPos, axis: new THREE.Vector3(0, 1, 0) }, { count: 8, radius: 0.03, tilt: 35 }).items;
  glow(b.cards(crown, petalTex, { size: [0.14, 0.3], lean: 30, bend: 30, rng: R }), 1.2);
  glow(b.part(new THREE.IcosahedronGeometry(0.09, 0), LIME, { at: [tipPos.x, tipPos.y + 0.06, tipPos.z], bone: stalk.joints[4] }), 2);

  // ground pods
  for (let i = 0; i < 7; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.3 + R() * 0.35;
    const s = 0.05 + R() * 0.07;
    glow(
      b.part(new THREE.IcosahedronGeometry(s, 0), i % 2 ? CYAN : PINK, {
        at: [Math.sin(a) * r, s * 0.7, Math.cos(a) * r],
        bone: base,
      }),
      1.6,
    );
    b.sweep(catmull([[Math.sin(a) * r, 0, Math.cos(a) * r], [Math.sin(a) * r * 0.8, 0.05, Math.cos(a) * r * 0.8], [Math.sin(a) * 0.1, 0.15, Math.cos(a) * 0.1]]), 0.012, { color: DEEP, bone: base, sides: 5 });
  }

  return b.root;
}
