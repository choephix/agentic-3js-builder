import * as THREE from "three";
import { createBuilder, catmull, limb, countershade, mottle, gradient, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alert Gray Wolf",
  description: "Warcraft-style gray wolf standing alert: heavy ruff, glowing amber eyes, fang trophy collar, full rig.",
};

const DARK = "#23252b";
const BONE = "#eadfc4";
const LEATHER = "#5a3a22";
const NOSE = "#141416";
const CLAW = "#2c2a2a";

export default function build() {
  const b = createBuilder({ name: "wolf" });
  const R = rng(11);

  const coat = countershade(mottle("#767a82", "#50545c", { size: 0.1, seed: 3 }), "#cfc8b6", { level: -0.3 });
  const faceCoat = countershade(mottle("#8a8d92", "#5e6269", { size: 0.06, seed: 5 }), "#d9d2c0", { level: -0.2 });

  // ---------- skeleton: spine ----------
  const bodyPath = catmull([
    [0, 0.78, -0.5],
    [0, 0.8, -0.05],
    [0, 0.86, 0.42],
  ]);
  const hips = b.joint("hips", { at: [0, 0.78, -0.5], aim: [0, 0.8, -0.05], role: "spine" });
  const spine = b.chain("spine", bodyPath, { parent: hips, count: 3, role: "spine" });
  const body = b.sweep(spine, (t) => [0.12 + 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.1)), 0.13 + 0.07 * t], {
    color: coat,
    shift: [0, -0.04],
  });
  const chestJ = spine.joints[2];

  // ---------- neck & head ----------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.86, 0.4],
      [0, 0.95, 0.58],
      [0, 1.02, 0.72],
    ]),
    { parent: chestJ, count: 2, role: "neck" },
  );
  const neckSweep = b.sweep(neck, [0.15, 0.11], { color: coat });
  const H = [0, 1.02, 0.72];
  const P = (dx: number, dy: number, dz: number): [number, number, number] => [H[0] + dx, H[1] + dy, H[2] + dz];
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: H, dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, -0.04, 0.1), aim: P(0, -0.05, 0.32), role: "jaw" });

  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), faceCoat, {
    bone: head,
    at: P(0, 0, 0.08),
    scale: [0.105, 0.1, 0.125],
  });
  // upper snout
  b.frustumBox(P(0, 0.0, 0.14), P(0, -0.015, 0.33), [0.13, 0.11], [0.07, 0.065], { bone: head, color: faceCoat });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), NOSE, { bone: head, at: P(0, 0.005, 0.345), scale: [1, 0.8, 0.8] });
  // lower jaw
  b.frustumBox(P(0, -0.045, 0.1), P(0, -0.05, 0.31), [0.1, 0.04], [0.055, 0.032], { bone: jaw, color: "#c9c2b0" });
  b.frustumBox(P(0, -0.028, 0.14), P(0, -0.03, 0.3), [0.08, 0.012], [0.05, 0.012], { bone: jaw, color: "#c25a6a" });
  // fangs
  for (const s of [1, -1]) {
    b.spike(P(s * 0.032, -0.04, 0.3), [0, -1, 0], 0.05, 0.011, { bone: head, color: BONE });
    b.spike(P(s * 0.026, -0.03, 0.295), [0, 1, 0], 0.04, 0.009, { bone: jaw, color: BONE });
    for (const z of [0.24, 0.2]) b.spike(P(s * 0.04, -0.035, z), [0, -1, 0], 0.025, 0.007, { bone: head, color: BONE });
  }
  // eyes
  const eyeTex = svg(
    `<svg viewBox="0 0 60 40"><path d="M2 30 Q20 4 58 10 Q36 38 2 30Z" fill="#1a1208"/>
    <path d="M6 28 Q22 10 52 13 Q36 34 6 28Z" fill="#ffb21e"/><path d="M6 28 Q22 10 52 13 L50 17 Q24 15 8 29Z" fill="#c86a0a"/>
    <ellipse cx="32" cy="22" rx="4" ry="8" fill="#120a04"/><circle cx="26" cy="18" r="2.5" fill="#fff6c0"/>
    <path d="M0 22 Q24 -2 60 5" stroke="#1a1208" stroke-width="5" fill="none"/></svg>`,
    { size: 192 },
  );
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(P(0, 0, 0.08)).at(s * 40, 14);
    if (hit)
      glow(
        b.decal(skull, eyeTex, {
          at: hit,
          dir: [s * 0.55, 0.05, 0.85],
          size: [0.075, 0.05],
          mirror: s > 0,
          roll: -s * 12,
        }),
        1.2,
      );
  }
  // ears
  for (const s of [1, -1]) {
    b.spike(P(s * 0.065, 0.075, 0.0), [s * 0.3, 1, -0.25], 0.15, 0.048, { bone: head, color: faceCoat });
    b.spike(P(s * 0.062, 0.08, 0.015), [s * 0.3, 1, -0.2], 0.11, 0.032, { bone: head, color: "#3a3234" });
  }
  // cheek ruff blades
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      b.spike(P(s * 0.09, -0.04 - i * 0.012, 0.0 + i * 0.045), [s * 0.8, -0.35, -0.9], 0.12 - i * 0.02, 0.03, {
        bone: head,
        color: "#a9a9ad",
      });

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.77, -0.5],
      [0, 0.7, -0.75],
      [0, 0.55, -1.0],
      [0, 0.4, -1.15],
    ]),
    { parent: hips, count: 3, role: "tail" },
  );
  b.sweep(tail, (t) => 0.06 + 0.055 * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1)), {
    color: gradient(coat, DARK, tail.at(0.7).at, tail.at(1).at),
    caps: "point",
  });

  // ---------- legs ----------
  const footRs: THREE.Vector3[] = [];
  const pawParts = (pos: THREE.Vector3, bone: any) => {
    b.part(new THREE.SphereGeometry(0.05, 8, 6), faceCoat, {
      bone,
      at: [pos.x, 0.034, pos.z + 0.025],
      scale: [1, 0.7, 1.5],
    });
    for (const dx of [-0.025, 0, 0.025])
      b.spike([pos.x + dx, 0.03, pos.z + 0.09], [0, -0.2, 1], 0.045, 0.01, { bone, color: CLAW });
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const sh: [number, number, number] = [s * 0.12, 0.72, 0.3];
    const pts = limb(sh, [s * 0.12, 0.06, 0.34], [0.35, 0.35], [[0, 0, -1]]);
    const leg = b.chain(`legF${S}`, pts, {
      parent: chestJ,
      names: [`shoulder${S}`, `elbow${S}`, `pawF${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.085, 0.045], { color: coat });
    b.part(new THREE.SphereGeometry(0.12, 8, 6), coat, { bone: leg.joints[0], at: [s * 0.13, 0.75, 0.3], scale: [0.85, 1.1, 1.2] });
    pawParts(new THREE.Vector3(...pts[2].toArray()), leg.tip ?? leg.joints[1]);
    // hind
    const hp: [number, number, number] = [s * 0.11, 0.72, -0.4];
    const hpts = limb(hp, [s * 0.11, 0.06, -0.4], [0.32, 0.3, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const hleg = b.chain(`legH${S}`, hpts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
    });
    b.sweep(hleg, [0.09, 0.04], { color: coat });
    b.part(new THREE.SphereGeometry(0.14, 8, 6), coat, { bone: hleg.joints[0], at: [s * 0.14, 0.74, -0.4], scale: [0.8, 1.1, 1.3] });
    pawParts(new THREE.Vector3(...hpts[3].toArray()), hleg.tip ?? hleg.joints[2]);
    footRs.push(new THREE.Vector3(...hpts[3].toArray()));
  }

  // ---------- fur tufts ----------
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <path d="M2 64 Q6 30 16 0 Q26 30 30 64Z" fill="url(#g)"/><path d="M16 60 L16 14" stroke="#6a6a6a" stroke-width="2"/></svg>`,
    { size: 96 },
  );
  const furSurf = b.surface([neckSweep, body]);
  const hits = furSurf.scatter(160, {
    rng: R,
    minDist: 0.045,
    filter: (h) => h.at.z > 0.1 && h.at.y > 0.78 && h.n.y > -0.2,
  });
  b.cards(hits, tuft, { size: [0.07, 0.15], lean: 55, bend: 20, vary: 0.3, rng: rng(4), color: "#9b9ea4", cross: true });
  // dorsal mane blades along the back
  const back = body.line(0);
  b.along(back, 9, (at) => b.spike(at, [0, 1, -0.5], 0.1, 0.03, { color: "#5a5d64" }));

  // ---------- war trophy collar ----------
  const loop = b.surface(neckSweep).loop(neck.joints[1], { lift: 0.01 });
  b.sweep(loop, 0.014, { color: LEATHER });
  b.along(loop, 9, (at) => b.spike(at, [0, -1, 0.15], 0.07, 0.016, { color: BONE }));
  b.along(loop, 5, (at) => b.part(new THREE.SphereGeometry(0.018, 6, 4), "#b8862e", { at }));

  // scar on the flank (dark slash)
  b.part(new THREE.BoxGeometry(0.01, 0.012, 0.16), "#d8d0c0", {
    bone: chestJ,
    at: [0.19, 0.84, 0.15],
    rotation: [0, 0, 20],
  });

  return b.root;
}
