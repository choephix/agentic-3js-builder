import * as THREE from "three";
import { createBuilder, catmull, bezier, countershade, mottle, gradient, frame, rng } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = { name: "Kraken Rising", description: "Stylized heroic-cartoon kraken rising with eight spread tentacles, glowing eyes and a hinged beak." };

const ORANGE = "#ffa63a";
const BELLY = "#f2c6d2";
const BEAK = "#f1dca8";
const BODY = countershade(mottle("#5a3ca6", "#3f86c2", { size: 0.55, seed: 3 }), "#d9a3cb", { level: -0.2 });
const TENT = mottle("#6a45b0", "#3f86c2", { size: 0.45, seed: 5 });

const EYE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#1b1030"/>
  <circle cx="50" cy="50" r="41" fill="#ffd23a"/>
  <circle cx="50" cy="62" r="30" fill="#ff9a2e" opacity="0.6"/>
  <ellipse cx="50" cy="50" rx="9" ry="33" fill="#1b1030"/>
  <path d="M2 50 A48 48 0 0 1 98 50 Q50 28 2 50Z" fill="#3a2370"/>
  <circle cx="36" cy="40" r="8" fill="#fff"/>
  <circle cx="62" cy="64" r="4" fill="#fff"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const R = rng(7);

  // Skeleton root
  const body = b.joint("body", { at: [0, 1.3, 0], dir: [0, 1, 0], role: "spine" });

  // Mantle
  const mpath = catmull([[0, 1.3, 0], [0, 2.0, -0.15], [0, 2.8, -0.55], [0, 3.4, -1.0]]);
  const mchain = b.chain("mantle", mpath, { parent: body, names: ["mantle1", "mantle2", "mantle3"], role: "spine" });
  const mantle = b.sweep(mchain, [0.7, 0.85, 0.75, 0.4, 0.06], { color: BODY, sides: 10 });

  // Head
  const headGeo = new THREE.SphereGeometry(1, 14, 10);
  const head = b.part(headGeo, BODY, { bone: body, at: [0, 1.35, 0.2], scale: [0.85, 0.72, 0.82] });
  const hs = b.surface(head);
  for (const s of [1, -1]) {
    const hit = hs.around([0, 1.35, 0.2]).at(s * 52, 18);
    if (hit) {
      glow(b.decal(head, EYE, { at: hit, size: [0.42, 0.42], mirror: s > 0 }));
    }
    const brow = hs.around([0, 1.35, 0.2]).at(s * 52, 48);
    if (brow) b.stick(new THREE.SphereGeometry(0.2, 6, 4).scale(1.5, 0.5, 1), "#3a2a7a", brow, { embed: 0.3 });
  }

  // Beak: upper fixed, lower on jaw joint
  const jaw = b.joint("jaw", { parent: body, at: [0, 1.0, 0.78], aim: [0, 0.82, 1.0], role: "jaw" });
  b.sweep(bezier([0, 1.2, 0.72], [0, 1.15, 1.05], [0, 0.82, 1.0]), [0.16, 0.0], { bone: body, color: BEAK, caps: "none", sides: 6 });
  b.sweep(bezier([0, 1.0, 0.74], [0, 0.88, 1.0], [0, 0.8, 1.0]), [0.13, 0.0], { bone: jaw, color: "#e0c488", caps: "none", sides: 6 });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), "#2a1740", { bone: body, at: [0, 1.0, 0.68], scale: [1.2, 0.6, 0.9] });

  // Collar of spikes around head/mantle junction
  b.ring(frame([0, 1.75, -0.1], [0, 1, 0]), { count: 9, radius: 0.66, fromDeg: 100, toDeg: 260 }, (it) =>
    b.spike(it, it, 0.42, 0.1, { color: ORANGE, bone: body, sides: 5 }),
  );

  // Mantle ridge spikes and glow spots
  b.along(mantle, 6, (at) => b.spike(at, at, 0.22, 0.07, { color: ORANGE, sides: 5 }), { from: 0.15, to: 0.85 });
  const ms = b.surface(mantle);
  for (const h of ms.scatter(16, { rng: rng(11), minDist: 0.35, filter: (q) => q.n.y > -0.2 && q.at.y > 1.9 })) {
    glow(b.stick(new THREE.SphereGeometry(0.07, 6, 4), "#ffb347", h, { embed: 0.4 }), 1.2);
  }

  // Fins
  for (const s of [1, -1]) {
    b.extrude(
      [[0, -0.45], [0.5, -0.25], [1.1, 0.15], [1.0, 0.75], [0.45, 0.6], [0, 0.55]],
      {
        at: [s * 0.6, 2.4, -0.4],
        x: [s, 0, 0],
        thickness: 0.07,
        smoothing: 1,
        bone: mchain.joints[1],
        color: gradient("#2fb7c9", ORANGE, [s * 0.6, 2.4, -0.4], [s * 1.7, 2.9, -0.4]),
      },
    );
  }

  // Tentacles
  const rr = [0.5, 1.2, 2.0, 2.8, 3.6, 4.3];
  const yy = [1.2, 1.45, 0.85, 0.2, 0.07, 0.04];
  const radii = [0.3, 0.24, 0.17, 0.11, 0.06, 0.03];
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * 45 * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const px = dz;
    const pz = -dx;
    const sg = (i % 2 ? 1 : -1) * (0.7 + R() * 0.6);
    const lat = [0, 0, 0.1, 0.25, 0.5, 0.85];
    const pts = rr.map((r, k) => [dx * r + px * lat[k] * sg, yy[k], dz * r + pz * lat[k] * sg]);
    const path = catmull(pts);
    const names = [1, 2, 3, 4, 5].map((j) => `tent${i + 1}_${j}`);
    const ch = b.chain(`tent${i + 1}`, path, { parent: body, names, role: "tentacle" });
    const sw = b.sweep(ch, radii, {
      color: gradient(TENT, ORANGE, path.at(0.86), path.at(1)),
      sectors: [[125, 235, BELLY]],
      sides: 8,
    });
    b.along(sw, 7, (at) => {
      const r = at.radius * 0.5;
      return b.stick(new THREE.CylinderGeometry(r, r * 0.9, r * 0.6, 7), "#ffd7de", sw.at(at.t, 180), { embed: 0.5 });
    }, { from: 0.1, to: 0.9 });
    b.along(sw, 4, (at) => b.spike(at, at, at.radius * 1.8, at.radius * 0.5, { color: ORANGE, sides: 4 }), { from: 0.08, to: 0.5 });
  }

  return b.root;
}
