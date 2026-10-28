import * as THREE from "three";
import { createBuilder, frame, rng, bezier, catmull, polyline, limb, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description: "A towering walking tree guardian with a bark body, root legs, branch fingers, glowing amber eyes, a leafy crown and a chest rune.",
};

// ---------- palette & paints ----------
const BARK = paint((p, n) => {
  const q = new THREE.Vector3(p.x * 3, p.y, p.z * 3);
  const g = noise(q, 0.18, 3);
  let c = mix("#2e1c0e", "#7a5430", g);
  const crack = noise(q, 0.07, 9);
  if (crack > 0.62) c = mix(c, "#1b0f07", 0.7);
  const mossy = smoothstep(0.3, 0.8, n.y) * smoothstep(0.42, 0.6, noise(p, 0.3, 5));
  c = mix(c, "#5f8d2f", mossy * 0.9);
  const dirt = smoothstep(0.5, 0.0, p.y);
  c = mix(c, "#2b2014", dirt * 0.6);
  return c;
});
const BARK_DARK = "#2a180b";
const LEAF = paint((p, n) => {
  const g = noise(p, 0.25, 11);
  let c = mix("#2f6a22", "#8cc43c", g);
  c = mix(c, "#cfa22c", smoothstep(0.7, 0.9, noise(p, 0.4, 2)) * 0.5);
  const sh = 0.75 + 0.25 * smoothstep(-0.6, 0.6, n.y);
  return [c[0] * sh, c[1] * sh, c[2] * sh];
});
const SHROOM = "#e0782a";
const BONE = "#d3c79c";
const DARK = "#120a05";

// ---------- textures ----------
function eyeTex(innerLeft: boolean) {
  const flip = innerLeft ? "" : 'transform="translate(64 0) scale(-1 1)"';
  return svg(
    `<svg viewBox="0 0 64 40"><g ${flip}>
      <path d="M2 30 Q20 4 62 8 Q40 38 2 30Z" fill="#1a0d04"/>
      <path d="M8 29 Q24 11 56 12 Q40 33 8 29Z" fill="#ff9a1a"/>
      <path d="M18 27 Q30 15 50 14 Q40 28 18 27Z" fill="#ffe46a"/>
      <ellipse cx="34" cy="21" rx="3" ry="7" fill="#3a1500"/>
      </g></svg>`,
    { size: 128 },
  );
}
const RUNE = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#7dffb0" stroke-width="3.5"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="#7dffb0" stroke-width="2.5"/>
    <path d="M32 10 L32 54 M32 22 L18 36 M32 22 L46 36 M20 44 L44 44" stroke="#baffd2" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M10 32 L16 32 M48 32 L54 32" stroke="#7dffb0" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);
const LEAFTEX = svg(
  `<svg viewBox="0 0 32 48"><path d="M16 46 Q2 28 16 2 Q30 28 16 46Z" fill="#4c9a2a" stroke="#1f4a14" stroke-width="1.6"/>
   <path d="M16 44 L16 8 M16 30 L9 22 M16 22 L23 15 M16 36 L23 29" stroke="#a6dc5a" stroke-width="1.6" fill="none"/></svg>`,
  { size: 128 },
);
const MOSS = svg(
  `<svg viewBox="0 0 16 48"><path d="M8 0 Q3 14 8 26 Q12 38 8 47 Q6 36 5 26 Q1 12 8 0Z" fill="#6a9a3a" stroke="#2f5a1c" stroke-width="1"/>
   <path d="M8 0 Q12 14 9 26 Q7 36 8 47" stroke="#a9cf6a" stroke-width="1.2" fill="none"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "treant" });
  const R = rng(21);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.7, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 1.7, 0], [0, 2.3, 0], [0, 2.9, 0.1], [0, 3.3, 0.15]]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 3.3, 0.12], aim: [0, 3.6, 0.2], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.55, 0.15], aim: [0, 3.8, 0.6], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.5, 0.1], aim: [0, 3.5, 0.7], role: "jaw" });

  // ---------- torso ----------
  b.part(new THREE.IcosahedronGeometry(0.7, 1), BARK, { bone: hips, at: [0, 1.8, 0], scale: [1, 0.7, 0.85], flat: true });
  const torso = b.sweep(spine, (t) => [0.55 + 0.35 * Math.min(1, t * 1.4), 0.45 + 0.25 * t], {
    color: BARK,
    section: { ngon: 8 },
  });
  const skin = b.surface(torso);

  // bark ridges
  for (const h of skin.scatter(46, { rng: R, minDist: 0.22, filter: (h) => h.n.y > -0.2 }))
    b.stick(new THREE.ConeGeometry(0.07, 0.26, 5), BARK_DARK, h, { embed: 0.35 });
  // bracket fungi
  for (const h of skin.scatter(7, { rng: rng(5), minDist: 0.4, filter: (h) => Math.abs(h.n.y) < 0.5 && h.at.y > 2 }))
    b.stick(new THREE.CylinderGeometry(0.17, 0.06, 0.05, 8), SHROOM, h, { embed: 0.5 });
  // chest rune
  const rh = skin.ray([0, 2.6, 3], [0, 0, -1]);
  if (rh) glow(b.decal(torso, RUNE, { at: rh, dir: [0, 0, 1], size: [0.7, 0.7], lift: 0.012 }), 1.3);
  // belt of roots/knot
  b.sweep(skin.loop([0, 2.0, 0], { lift: 0.03 }), 0.07, { color: BARK_DARK, section: { ngon: 6 } });

  // root skirt at back
  for (let i = 0; i < 6; i++) {
    const a = ((100 + i * 32) * Math.PI) / 180;
    const sx = Math.sin(a), cz = Math.cos(a);
    b.sweep(bezier([sx * 0.55, 1.95, cz * 0.5], [sx * 0.95, 1.2, cz * 0.85], [sx * 1.05, 0.05, cz * 1.0]), [0.12, 0.03], {
      color: BARK, bone: hips, sides: 6,
    });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP: [number, number, number] = [s * 0.5, 1.7, 0];
    const foot: [number, number, number] = [s * 0.6, 0.16, 0.1];
    const pts = limb(hipP, foot, [0.8, 0.8], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [foot[0], 0, foot[2]] });
    b.sweep(leg, [0.36, 0.26, 0.2], { color: BARK, section: { ngon: 8 } });
    const knee = leg.joints[1];
    b.part(new THREE.DodecahedronGeometry(0.27, 0), BARK, { bone: knee, at: knee.at, flat: true });
    b.part(new THREE.IcosahedronGeometry(0.4, 0), LEAF, { bone: leg.joints[0], at: [s * 0.62, 1.75, -0.1], scale: [1, 0.6, 1], flat: true });
    const ank = leg.tip!;
    b.part(new THREE.SphereGeometry(0.3, 8, 6), BARK, { bone: ank, at: [foot[0], 0.14, foot[2] + 0.1], scale: [1, 0.48, 1.4] });
    for (const dx of [-0.3, 0, 0.3])
      b.sweep(bezier([foot[0], 0.17, foot[2] + 0.1], [foot[0] + dx * 0.6, 0.12, foot[2] + 0.45], [foot[0] + dx, 0.04, foot[2] + 0.75]), [0.12, 0.03], {
        color: BARK, bone: ank, sides: 6, caps: { start: "round", end: "point" },
      });
    b.sweep(bezier([foot[0], 0.17, foot[2]], [foot[0], 0.12, foot[2] - 0.3], [foot[0], 0.05, foot[2] - 0.5]), [0.12, 0.03], { color: BARK, bone: ank, sides: 6 });
  }

  // ---------- arms ----------
  const blobs: THREE.Mesh[] = [];
  const blob = (bone: any, at: number[], r: number, sc: number[] = [1, 0.85, 1]) => {
    const p = b.part(new THREE.IcosahedronGeometry(r, 1), LEAF, { bone, at, scale: sc, flat: true });
    blobs.push(p.mesh);
    return p;
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.95, 3.0, 0];
    const hand: [number, number, number] = [s * 1.45, 1.5, 0.75];
    const pts = limb(sh, hand, [1.0, 1.0], [[s * 0.6, 0, -0.5]]);
    const arm = b.chain(`arm${S}`, pts, { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" });
    const armTube = b.sweep(arm, [0.32, 0.22, 0.18], { color: BARK, section: { ngon: 8 } });
    b.part(new THREE.DodecahedronGeometry(0.45, 0), BARK, { bone: arm.joints[0], at: [s * 1.0, 3.2, 0], flat: true });
    blob(arm.joints[0], [s * 1.05, 3.62, -0.05], 0.4);
    b.part(new THREE.DodecahedronGeometry(0.24, 0), BARK, { bone: arm.joints[1], at: arm.joints[1].at, flat: true });
    const wr = arm.tip!;
    b.part(new THREE.SphereGeometry(0.2, 8, 6), BARK, { bone: wr, at: wr.at, scale: [1, 0.8, 1.1] });
    const H = wr.at;
    for (let k = 0; k < 5; k++) {
      const thumb = k === 4;
      const off = thumb ? -s * 0.22 : (k - 1.5) * 0.11 * s;
      const L = thumb ? 0.7 : 1;
      const f = b.chain(
        `fing${S}${k}`,
        polyline([
          [H.x + off, H.y, H.z],
          [H.x + off * 1.5, H.y - 0.12 * L, H.z + 0.3 * L],
          [H.x + off * 2, H.y - 0.32 * L, H.z + 0.52 * L],
        ]),
        { parent: wr, names: [`fing${S}${k}a`, `fing${S}${k}b`], role: "digit" },
      );
      b.sweep(f, [0.07, 0.015], { color: BARK, sides: 6, caps: { start: "round", end: "point" } });
    }
    // hanging moss on forearm
    const pts2 = [0.35, 0.5, 0.65, 0.8].map((t) => frame(armTube.at(t, 0).at, [0, 1, 0]));
    b.cards(pts2, MOSS, { size: [0.14, 0.45], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R });
  }

  // ---------- head ----------
  b.part(new THREE.BoxGeometry(1.0, 0.75, 0.8), BARK, { bone: head, at: [0, 3.8, 0.3], flat: true });
  b.part(new THREE.BoxGeometry(1.1, 0.3, 0.7), BARK, { bone: head, at: [0, 4.1, 0.2], flat: true });
  b.part(new THREE.CylinderGeometry(0.3, 0.4, 0.3, 6), BARK, { bone: neck, at: [0, 3.45, 0.1] });
  b.part(new THREE.BoxGeometry(0.85, 0.22, 0.65), BARK, { bone: jaw, at: [0, 3.38, 0.38], flat: true });
  b.part(new THREE.BoxGeometry(0.62, 0.05, 0.05), DARK, { bone: jaw, at: [0, 3.5, 0.7] });
  b.part(new THREE.ConeGeometry(0.14, 0.4, 6), BARK, { bone: head, at: [0, 3.7, 0.85], dir: [0, -0.15, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.06, 0.3, 6), BONE, { bone: jaw, at: [s * 0.28, 3.55, 0.7] });
    b.part(new THREE.BoxGeometry(0.46, 0.13, 0.22), BARK, { bone: head, at: [s * 0.25, 4.03, 0.72], rotation: [0, 0, s * 18], flat: true });
    b.part(new THREE.BoxGeometry(0.34, 0.2, 0.04), DARK, { bone: head, at: [s * 0.24, 3.88, 0.7] });
    glow(
      b.part(new THREE.PlaneGeometry(0.32, 0.2), "#ffffff", {
        bone: head, at: [s * 0.24, 3.88, 0.725], dir: [0, 0, 1], axis: "z", texture: eyeTex(s > 0),
      }),
      1.6,
    );
    b.part(new THREE.DodecahedronGeometry(0.17, 0), BARK, { bone: head, at: [s * 0.55, 3.7, 0.2], flat: true });
    b.part(new THREE.ConeGeometry(0.1, 0.4, 5), BARK, { bone: head, at: [s * 0.62, 3.95, 0.0], rotation: [0, 0, -s * 70] });
  }
  // beard of moss
  const beard: any[] = [];
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.085;
    beard.push(frame([x, 3.29, 0.62 - Math.abs(x) * 0.4], [0, 1, 0], undefined));
  }
  b.cards(beard, MOSS, { size: [0.12, 0.55], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R, bone: jaw });

  // ---------- crown ----------
  const ends = [[0.5, 5.0, 0.0], [0.95, 4.75, -0.1], [1.35, 4.35, 0.0], [0.2, 5.35, -0.2]];
  for (const s of [1, -1])
    ends.forEach((e, i) => {
      const end: [number, number, number] = [s * e[0], e[1], e[2]];
      b.sweep(bezier([s * 0.3, 4.1, 0.05], [s * e[0] * 0.3, e[1] * 0.85, e[2]], end), [0.1, 0.02], { color: BARK, bone: head, sides: 6 });
      b.sweep(bezier([s * e[0] * 0.5, e[1] * 0.85, e[2]], [s * e[0] * 0.9, e[1] * 0.95, e[2] + 0.2], [s * e[0] * 1.05, e[1] + 0.2, e[2] + 0.4]), [0.05, 0.01], { color: BARK, bone: head, sides: 5 });
      blob(head, end, 0.34 + 0.06 * (i % 2), [1.1, 0.8, 1.1]);
    });
  blob(head, [0, 5.1, -0.1], 0.6);
  blob(head, [0, 4.8, -0.5], 0.5);
  blob(chest, [0, 3.6, -0.6], 0.55, [1.3, 0.8, 0.9]);

  const leafHits = b.surface(blobs).scatter(150, { rng: rng(8), minDist: 0.12 });
  b.cards(leafHits, LEAFTEX, { size: [0.26, 0.3], lean: 40, cross: true, vary: 0.3, rng: rng(9), bone: head });

  return b.root;
}
