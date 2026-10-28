import * as THREE from "three";
import { createBuilder, rng, noise, mix, smoothstep, paint, countershade, svg, catmull, limb, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description: "A towering, mossy tree guardian in a Warcraft-style stylised look, with glowing amber eyes and a leafy crown.",
};

export default function build() {
  const b = createBuilder({ name: "treant" });
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const q = new THREE.Vector3();

  // ---------- paints ----------
  const BARK = paint((p, n) => {
    q.set(p.x * 4, p.y * 0.5, p.z * 4);
    const streak = noise(q, 0.1, 2);
    const knot = noise(p, 0.3, 4);
    let c = mix("#3d2918", "#7b5a3a", streak * 0.7 + knot * 0.3);
    c = mix(c, "#24170d", smoothstep(0.1, -0.9, n.y) * 0.5 + smoothstep(0.5, 0.2, p.y) * 0.4);
    const moss = smoothstep(0.3, 0.75, n.y) * smoothstep(0.35, 0.6, noise(p, 0.3, 5));
    return mix(c, mix("#3f7a2c", "#7cb040", noise(p, 0.12, 6)), moss * 0.9);
  });
  const BARK_DARK = countershade("#4a3322", "#241810");
  const LEAF = paint((p, n) => {
    let c = mix("#2b6428", "#86bb3c", noise(p, 0.4, 3));
    c = mix(c, "#e2b43c", smoothstep(0.62, 0.8, noise(p, 0.5, 8)) * 0.55);
    return mix(c, "#173a1a", smoothstep(0.2, -0.9, n.y) * 0.65);
  });
  const MOSS = "#6d9a3a";
  const PALE = "#a7bd6c";
  const VINE = "#3c6a2a";
  const CAP = paint((p, n) => (noise(p, 0.05, 9) > 0.62 ? "#fff0d0" : mix("#b8322a", "#8a1e1e", smoothstep(0.5, -0.5, n.y))));

  // ---------- textures ----------
  const EYE = svg(
    `<svg viewBox="0 0 100 50"><path d="M4 30 Q50 -8 96 22 Q50 54 4 30Z" fill="#150c05"/>
     <path d="M12 29 Q50 6 88 23 Q50 44 12 29Z" fill="#ff9a1a"/>
     <ellipse cx="52" cy="26" rx="17" ry="12" fill="#ffd95a"/><ellipse cx="52" cy="26" rx="5" ry="10" fill="#7a2a00"/></svg>`,
    { size: 128 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#9aff6a" stroke-width="5"/>
     <circle cx="50" cy="50" r="34" fill="none" stroke="#5fd03a" stroke-width="2.5"/>
     <path d="M50 14 L50 86 M50 50 L22 28 M50 50 L78 28 M50 64 L30 80 M50 64 L70 80" stroke="#c8ff8a" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`,
    { size: 192 },
  );
  const LEAFTEX = svg(
    `<svg viewBox="0 0 40 64"><path d="M20 62 Q2 36 20 2 Q38 36 20 62Z" fill="#5aa032" stroke="#2a5a1c" stroke-width="3"/>
     <path d="M20 60 L20 10" stroke="#a6d45a" stroke-width="2.5"/></svg>`,
    { size: 96 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.7, 0], role: "spine" });
  const spinePath = catmull([[0, 1.7, 0], [0, 2.6, 0.05], [0, 3.1, 0.15], [0, 3.4, 0.25]]);
  const spine = b.chain("spine", spinePath, { parent: hips, count: 3, role: "spine" });
  const chest = spine.joints[1];
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 3.4, 0.25], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.38, 0.2], aim: [0, 3.38, 0.9], role: "jaw" });

  // ---------- trunk ----------
  const trunk = b.sweep(spine, [0.8, 0.9, 0.85, 0.6], { color: BARK, sides: 8, bone: spine });
  b.part(new THREE.IcosahedronGeometry(0.85, 1), BARK, { bone: hips, at: [0, 1.75, 0], scale: [1, 0.8, 0.9], flat: true });
  b.part(new THREE.CylinderGeometry(0.62, 0.7, 0.28, 8), BARK, { bone: chest, at: [0, 2.0, 0.05] });

  // rune heart
  glow(b.decal(trunk, RUNE, { at: [0, 2.55, 0.9], dir: [0, 0, 1], size: [0.55, 0.55], bone: chest }), 1.4);

  // ---------- head ----------
  b.part(new THREE.BoxGeometry(1.0, 0.7, 0.85), BARK, { bone: head, at: [0, 3.72, 0.45] });
  b.part(new THREE.BoxGeometry(1.12, 0.16, 0.3), BARK_DARK, { bone: head, at: [0, 3.95, 0.86], rotation: [-12, 0, 0] });
  b.part(new THREE.ConeGeometry(0.16, 0.4, 6), BARK, { bone: head, at: [0, 3.58, 0.98], dir: [0, -0.2, 1] });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", { bone: head, at: [s * 0.25, 3.78, 0.887], dir: [0, 0, 1], axis: "z", texture: EYE }), 1.6);
    b.part(new THREE.BoxGeometry(0.2, 0.5, 0.4), BARK_DARK, { bone: head, at: [s * 0.58, 3.75, 0.4], rotation: [0, 0, -s * 15] });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.25), BARK, { bone: head, at: [s * 0.3, 3.35, 0.9] });
  }
  b.part(new THREE.BoxGeometry(0.8, 0.04, 0.03), "#120a05", { bone: head, at: [0, 3.37, 0.875] });
  // jaw
  b.part(new THREE.BoxGeometry(0.88, 0.3, 0.72), BARK, { bone: jaw, at: [0, 3.2, 0.5] });
  b.part(new THREE.BoxGeometry(0.72, 0.02, 0.6), "#120a05", { bone: jaw, at: [0, 3.355, 0.5] });
  for (const s of [1, -1]) b.part(new THREE.ConeGeometry(0.06, 0.2, 5), "#d9c9a0", { bone: jaw, at: [s * 0.28, 3.42, 0.8] });
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.13;
    b.spike([x, 3.1, 0.75 - Math.abs(i - 3) * 0.05], [0, -1, 0.25], 0.5 + R() * 0.45 - Math.abs(i - 3) * 0.04, 0.065, { bone: jaw, color: i % 2 ? PALE : MOSS });
  }

  // ---------- foliage helper ----------
  const foliage: THREE.Mesh[] = [];
  const blob = (at: THREE.Vector3, r: number, bone: any) => {
    const p = b.part(new THREE.IcosahedronGeometry(r, 1), LEAF, {
      bone, at, scale: [1 + R() * 0.2, 0.8 + R() * 0.2, 1 + R() * 0.2], rotation: [R() * 90, R() * 90, 0], flat: true,
    });
    foliage.push(p.mesh);
    return p;
  };
  const twigTree = (start: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number, bone: any) => {
    const end = start.clone().addScaledVector(dir, len);
    b.capsule(start, end, [r, r * 0.65], BARK, { bone });
    if (depth === 0) {
      blob(end, 0.3 + R() * 0.15, bone);
      return;
    }
    for (let k = 0; k < 2; k++) {
      const d = dir.clone().add(V((R() - 0.5) * 1.1, 0.15 + R() * 0.3, (R() - 0.5) * 1.1)).normalize();
      twigTree(end, d, len * 0.75, r * 0.65, depth - 1, bone);
    }
  };

  // crown
  const crownBase: [number, number, number, number, number][] = [
    [0, 4.02, 0.35, 0, 1], [0.35, 4.02, 0.3, 0.5, 1], [-0.35, 4.02, 0.3, -0.5, 1], [0.1, 4.0, 0.6, 0.1, 1.4], [-0.1, 4.0, 0.1, -0.1, 1],
  ];
  for (const [x, y, z, dx, dz] of crownBase) twigTree(V(x, y, z), V(dx, 1.5, (dz - 1) * 0.4).normalize(), 0.6, 0.1, 2, head);
  for (const s of [1, -1]) {
    blob(V(s * 0.5, 4.2, 0.2), 0.45, head);
    twigTree(V(s * 0.55, 3.9, 0.35), V(s * 1.2, 0.8, 0).normalize(), 0.6, 0.09, 1, head);
  }
  blob(V(0, 4.55, 0.3), 0.6, head);
  blob(V(0, 4.45, -0.15), 0.55, head);

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.5, 1.7, 0), V(s * 0.7, 0.28, 0.15), [0.85, 0.8], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.42, 0.34, 0.3], { color: BARK, sides: 8 });
    b.part(new THREE.IcosahedronGeometry(0.4, 1), BARK, { bone: leg.joints[1], at: pts[1], flat: true });
    const ank = leg.joints[2];
    b.part(new THREE.BoxGeometry(0.7, 0.3, 0.8), BARK, { bone: ank, at: [s * 0.7, 0.15, 0.35] });
    for (let i = 0; i < 4; i++) {
      const x = s * (0.7 + (i - 1.5) * 0.19);
      b.spike([x, 0.14, 0.7], [(i - 1.5) * 0.12 * s, -0.05, 1], 0.5, 0.1, { bone: ank, color: BARK_DARK });
    }
    blob(V(s * 0.9, 0.5, 0.15), 0.22, ank);

    // ---------- arms ----------
    const sh = V(s * 0.95, 2.9, 0.05);
    const ap = limb(sh, V(s * 2.2, 1.95, 0.4), [1.2, 1.1], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, ap, { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" });
    b.sweep(arm, [0.3, 0.24, 0.17], { color: BARK, sides: 8 });
    b.part(new THREE.IcosahedronGeometry(0.5, 1), BARK, { bone: arm.joints[0], at: sh, flat: true });
    blob(V(s * 1.0, 3.4, 0), 0.45, arm.joints[0]);
    blob(V(s * 1.25, 3.3, -0.1), 0.3, arm.joints[0]);
    b.part(new THREE.IcosahedronGeometry(0.28, 1), BARK, { bone: arm.joints[1], at: ap[1], flat: true });
    const wr = ap[2];
    const wj = arm.joints[2];
    b.part(new THREE.IcosahedronGeometry(0.24, 1), BARK, { bone: wj, at: wr, flat: true });
    const d = wr.clone().sub(ap[1]).normalize();
    for (let i = 0; i < 5; i++) {
      const sp = (i - 2) * 0.4;
      const d1 = V(d.x, d.y - 0.1, sp).normalize();
      const p1 = wr.clone().addScaledVector(d1, i === 2 ? 0.42 : 0.36);
      const d2 = d1.clone().add(V(0, -0.45, sp * 0.2)).normalize();
      const p2 = p1.clone().addScaledVector(d2, 0.34);
      const f = b.chain(`finger${S}${i}`, catmull([wr, p1, p2]), { parent: wj, names: [`f${S}${i}a`, `f${S}${i}b`], role: "digit" });
      b.sweep(f, [0.085, 0.025], { color: BARK_DARK, sides: 6, caps: "point" });
    }
    // forearm branch
    twigTree(ap[1].clone().add(V(0, 0.2, -0.1)), V(s * 0.4, 1, -0.5).normalize(), 0.5, 0.07, 1, arm.joints[1]);
  }

  // ---------- trunk details ----------
  const skin = b.surface(trunk);
  for (const h of skin.scatter(10, { rng: rng(5), minDist: 0.45, filter: (h) => h.at.y > 2.0 && Math.abs(h.n.y) < 0.5 }))
    b.stick(new THREE.ConeGeometry(0.1, 0.3, 6), BARK_DARK, h, { embed: 0.3 });
  for (const h of skin.scatter(14, { rng: rng(6), minDist: 0.3, filter: (h) => h.n.y > 0.3 && h.at.y > 2.0 }))
    b.stick(new THREE.IcosahedronGeometry(0.13, 0), LEAF, h, { embed: 0.5, flat: true });
  // mushrooms
  for (const h of skin.scatter(5, { rng: rng(7), minDist: 0.5, filter: (h) => h.n.y > 0.1 && h.at.y > 2.2 && h.at.z < 0.3 })) {
    b.stick(new THREE.CylinderGeometry(0.03, 0.04, 0.16, 6), "#efe2c0", h, { embed: 0.3 });
    b.stick(new THREE.SphereGeometry(0.1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), CAP, h.moved([0, 0.14, 0]), { embed: 0 });
  }
  // vine belts
  const belt = skin.loop(V(0, 2.2, 0), { lift: 0.03 });
  b.sweep(belt, 0.05, { color: VINE, sides: 6 });
  const belt2 = skin.loop(V(0, 2.9, 0), { lift: 0.03 });
  b.sweep(belt2, 0.04, { color: VINE, sides: 6 });
  b.along(belt, 9, (at) => b.stick(new THREE.IcosahedronGeometry(0.07, 0), "#e8c24a", at, { embed: 0.2 }));
  // leaf cards
  const hits = b.surface(foliage).scatter(120, { rng: rng(9), minDist: 0.12, filter: (h) => h.n.y > -0.2 });
  b.cards(hits, LEAFTEX, { size: [0.14, 0.2], lean: 55, vary: 0.3, rng: rng(10), bend: 20 });

  return b.root;
}
