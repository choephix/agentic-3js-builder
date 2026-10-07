import * as THREE from "three";
import { createBuilder, frame, rng, paint, mottle, spots, grain, svg, catmull } from "../../../../src/index";

export const meta = {
  name: "Mossback Fawn Spirit",
  description:
    "A small forest spirit: a body of grey river stones under a soft moss blanket, slender wooden legs with dark hooves, a pale carved mask with glowing green eyes, flowering antlers, and fireflies orbiting its head.",
};

export default function build() {
  const b = createBuilder({ name: "mossFawnSpirit" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------- palette & paints ----------------
  const BARK = "#5b4430";
  const BARK_DARK = "#3e2d20";
  const HOOF = "#2f231a";
  const LEAF = "#5f9a3a";
  const LEAF2 = "#86b84a";
  const PETAL = "#fbf8ef";
  const CENTER = "#f2c94c";
  const EYE = "#7dffa0";
  const EYE_RING = "#3fd07a";
  const FIRE = "#e2ff63";
  const TRAIL = "#b6ef4f";
  const MUSH = "#c8452f";

  const stoneBase = mottle("#8f9593", "#6a706e", { size: 0.07, seed: 3 });
  const lichen = spots(stoneBase, ["#b7c07a", "#d6d2a6"], { size: 0.05, amount: 0.15, seed: 9 });
  const stone = paint((p) => {
    const d = p.y - 0.47 - 0.35 * (p.z + 0.1) + 0.15 * p.x;
    return Math.abs(d) < 0.005 ? "#ece8dc" : lichen;
  });
  const moss = mottle(mottle("#4b7a2c", "#6a9b3a", { size: 0.03, seed: 2 }), "#8fc152", {
    size: 0.05,
    seed: 5,
    contrast: 1.4,
  });
  const wood = grain("#7a5a3a", "#5a4029", { size: 0.01, axis: "y", seed: 4 });
  const pale = grain("#efe5ca", "#d8c7a2", { size: 0.008, axis: "x", seed: 6 });

  const sph = new THREE.SphereGeometry(1, 8, 6);

  // ---------------- skeleton ----------------
  b.joint("hips", { at: [0, 0.5, -0.14], dir: [0, 0, 1] });
  b.chain("spine", [[0, 0.5, -0.14], [0, 0.52, 0.0], [0, 0.54, 0.14]], {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });

  const legs: ReturnType<typeof b.chain>[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    legs.push(
      b.chain(`legH${L}`, [[s * 0.1, 0.44, -0.2], [s * 0.11, 0.29, -0.15], [s * 0.11, 0.15, -0.22], [s * 0.11, 0.04, -0.2]], {
        parent: "hips",
        names: [`hipH${L}`, `kneeH${L}`, `hockH${L}`, `hoofH${L}`],
        role: "leg",
      }),
    );
    legs.push(
      b.chain(`legF${L}`, [[s * 0.09, 0.46, 0.15], [s * 0.1, 0.3, 0.17], [s * 0.1, 0.16, 0.15], [s * 0.1, 0.04, 0.17]], {
        parent: "chest",
        names: [`shoulderF${L}`, `elbowF${L}`, `wristF${L}`, `hoofF${L}`],
        role: "leg",
      }),
    );
  }

  const neck = b.chain("neck", catmull([[0, 0.6, 0.16], [0, 0.7, 0.24], [0, 0.79, 0.29]]), {
    parent: "chest",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const H = V(0, 0.8, 0.3);
  const h = (x: number, y: number, z: number) => H.clone().add(V(x, y, z));
  b.joint("head", { parent: "neck2", at: H, dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: h(0, -0.055, 0.04), dir: [0, -0.1, 1], role: "jaw" });

  const tail = b.chain("tail", [[0, 0.55, -0.3], [0, 0.6, -0.38]], {
    parent: "hips",
    names: ["tail1", "tail2"],
    role: "tail",
  });

  // ---------------- small helpers ----------------
  const leaf = (base: THREE.Vector3, dir: THREE.Vector3, bone: string, k = 1, color = LEAF) => {
    const d = dir.clone().normalize();
    b.part(sph, color, {
      at: base.clone().addScaledVector(d, 0.012 * k),
      dir: d,
      scale: [0.007 * k, 0.013 * k, 0.0025 * k],
      bone,
    });
  };
  const flower = (at: THREE.Vector3, dir: THREE.Vector3, bone: string, k = 1) => {
    const d = dir.clone().normalize();
    b.ring(frame(at, d), { count: 5, radius: 0.006 * k }, (it) => {
      b.part(sph, PETAL, { at: it.at, dir: it.outward, up: d, scale: [0.0045 * k, 0.007 * k, 0.002 * k], bone });
    });
    b.part(sph, CENTER, { at: at.clone().addScaledVector(d, 0.002), scale: 0.0035 * k, bone });
  };

  // ---------------- body: river stones under moss ----------------
  const stoneGeo = new THREE.IcosahedronGeometry(1, 2);
  b.part(stoneGeo, stone, { at: [0, 0.5, -0.13], scale: [0.17, 0.14, 0.19], rotation: [4, 8, -3], bone: "hips", flat: true });
  b.part(stoneGeo, stone, { at: [0, 0.54, 0.1], scale: [0.14, 0.13, 0.15], rotation: [-6, -12, 4], bone: "chest", flat: true });
  const capGeo = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, 1.2);
  const mossHind = b.part(capGeo, moss, { at: [0, 0.505, -0.13], scale: [0.178, 0.148, 0.198], rotation: [6, 0, -4], bone: "hips" });
  const mossFront = b.part(capGeo, moss, { at: [0, 0.545, 0.1], scale: [0.148, 0.138, 0.158], rotation: [-8, 0, 5], bone: "chest" });

  const mossSurf = b.surface([mossHind, mossFront]);
  const clumpR = rng(11);
  const clumpGeo = new THREE.IcosahedronGeometry(0.018, 0);
  const greens = ["#4f7f2e", "#6a9d3c", "#8cbf50", "#3f6a26"];
  for (const hit of mossSurf.scatter(38, { rng: rng(12), minDist: 0.035, filter: (x) => x.n.y > 0.2 })) {
    b.stick(clumpGeo, greens[Math.floor(clumpR() * greens.length)], hit, {
      embed: 0.45,
      scale: 0.7 + clumpR() * 0.7,
      spin: clumpR() * 360,
      flat: true,
    });
  }

  // ferns
  let leaflets = "";
  for (let i = 0; i < 7; i++) {
    const y = 56 - i * 7.5;
    const w = 11 - i * 1.2;
    leaflets +=
      `<ellipse cx="${16 - w / 2}" cy="${y}" rx="${w / 2}" ry="2.6" transform="rotate(20 16 ${y})" fill="#6fae45"/>` +
      `<ellipse cx="${16 + w / 2}" cy="${y}" rx="${w / 2}" ry="2.6" transform="rotate(-20 16 ${y})" fill="#88c457"/>`;
  }
  const fern = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 Q15 32 17 2" stroke="#3f6b2a" stroke-width="2" fill="none"/>${leaflets}</svg>`,
    { size: 128 },
  );
  b.cards(mossSurf.scatter(16, { rng: rng(14), minDist: 0.05, filter: (x) => x.n.y > 0.5 }), fern, {
    size: [0.035, 0.07],
    lean: 20,
    bend: 30,
    vary: 0.3,
    spin: 40,
    rng: rng(15),
  });

  // mushrooms
  const stemGeo = new THREE.CylinderGeometry(0.005, 0.007, 0.03, 6);
  const mushCap = new THREE.SphereGeometry(0.017, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const dotR = rng(17);
  for (const hit of mossSurf.scatter(3, { rng: rng(16), minDist: 0.09, filter: (x) => x.n.y > 0.6 })) {
    b.stick(stemGeo, "#efe6d0", hit, { embed: 0.25 });
    const n = hit.n;
    const top = hit.at.addScaledVector(n, 0.022);
    b.part(mushCap, MUSH, { at: top, dir: n, bone: hit.bone!, flat: true });
    for (let k = 0; k < 3; k++) {
      const a = dotR() * Math.PI * 2;
      const side = V(Math.cos(a), 0, Math.sin(a)).addScaledVector(n, -0.0);
      b.part(sph, "#fff7e8", { at: top.clone().addScaledVector(n, 0.012).addScaledVector(side, 0.009), scale: 0.0028, bone: hit.bone! });
    }
  }

  // ---------------- legs ----------------
  const knobGeo = new THREE.IcosahedronGeometry(0.018, 0);
  const sockGeo = new THREE.TorusGeometry(0.017, 0.008, 5, 10);
  const hoofGeo = new THREE.CylinderGeometry(0.016, 0.022, 0.04, 7);
  legs.forEach((leg, i) => {
    b.sweep(leg, [0.021, 0.012], { color: wood });
    b.part(knobGeo, BARK_DARK, { at: leg.joints[1], bone: leg.joints[1], flat: true });
    const hoof = leg.joints[3];
    const foot = hoof.at;
    b.part(sockGeo, moss, { at: [foot.x, 0.055, foot.z], dir: [0, 1, 0], axis: "z", bone: hoof });
    b.part(hoofGeo, HOOF, { at: [foot.x, 0.02, foot.z], bone: hoof, flat: true });
    const s = foot.x > 0 ? 1 : -1;
    const up = leg.joints[0].at.lerp(leg.joints[1].at, 0.6);
    leaf(up.add(V(s * 0.015, 0, 0)), V(s, 0.4, i % 2 ? 0.3 : -0.3), leg.joints[0].name, 1.1, LEAF2);
  });

  // ---------------- neck ----------------
  b.sweep(neck, [0.045, 0.03], { color: wood });
  const n0 = neck.at(0.15);
  b.part(new THREE.TorusGeometry(0.048, 0.022, 6, 12), moss, { at: n0, dir: n0.tangent, axis: "z", bone: "neck1" });
  const nTop = neck.at(0.85);
  b.ring(frame(nTop.at, nTop.tangent), { count: 8, radius: 0.03, tilt: -25 }, (it) =>
    leaf(it.at, it.outward, "neck2", 1.7, it.i % 2 ? LEAF : LEAF2),
  );

  // ---------------- head ----------------
  b.part(sph, BARK, { at: h(0, 0.01, -0.02), scale: [0.07, 0.062, 0.074], bone: "head" });
  b.part(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), moss, {
    at: h(0, 0.04, -0.035),
    scale: [0.058, 0.035, 0.052],
    bone: "head",
  });
  // mask
  b.extrude(
    [
      [-0.065, 0.03],
      [-0.045, 0.065],
      [0, 0.078, "sharp"],
      [0.045, 0.065],
      [0.065, 0.03],
      [0.05, -0.02],
      [0.02, -0.055],
      [-0.02, -0.055],
      [-0.05, -0.02],
    ],
    { color: pale, at: h(0, 0.005, 0.055), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, smoothing: 1, bone: "head" },
  );
  // snout & jaw
  b.frustumBox(h(0, -0.025, 0.05), h(0, -0.035, 0.15), [0.07, 0.055], [0.04, 0.035], { color: pale, bone: "head" });
  b.part(sph, "#2b201a", { at: h(0, -0.03, 0.152), scale: [0.015, 0.01, 0.01], bone: "head" });
  b.frustumBox(h(0, -0.055, 0.04), h(0, -0.065, 0.14), [0.05, 0.022], [0.032, 0.016], { color: "#d8c8a4", bone: "jaw" });
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10), "#241b14", { at: h(s * 0.03, 0.014, 0.062), dir: [0, 0, 1], bone: "head" });
    b.part(new THREE.TorusGeometry(0.019, 0.0028, 6, 14), EYE_RING, { at: h(s * 0.03, 0.014, 0.066), bone: "head" });
    b.part(new THREE.SphereGeometry(0.013, 10, 8), EYE, { at: h(s * 0.03, 0.014, 0.064), scale: [1, 1, 0.6], bone: "head" });
    b.part(sph, "#ffffff", { at: h(s * 0.03 + 0.004, 0.019, 0.072), scale: 0.0028, bone: "head" });
    // carved cheek marks
    for (let k = 0; k < 2; k++)
      b.part(new THREE.BoxGeometry(0.004, 0.016, 0.003), "#a4503a", {
        at: h(s * (0.024 + k * 0.012), -0.012, 0.063),
        rotation: [0, 0, s * 12],
        bone: "head",
      });
  }
  // forehead leaf mark
  b.part(sph, "#4f9a3f", { at: h(0, 0.05, 0.063), scale: [0.007, 0.015, 0.002], bone: "head" });
  b.part(new THREE.BoxGeometry(0.0015, 0.024, 0.0025), "#2f6a2a", { at: h(0, 0.05, 0.064), bone: "head" });

  // ears
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const d = V(s, 0.35, -0.25).normalize();
    const at = h(s * 0.055, 0.025, -0.01);
    b.joint(`ear${L}`, { parent: "head", at, dir: d });
    b.part(sph, LEAF, { at: at.clone().addScaledVector(d, 0.04), dir: d, up: [0, 0, 1], scale: [0.022, 0.048, 0.007], bone: `ear${L}` });
    b.part(sph, "#cdbd92", { at: at.clone().addScaledVector(d, 0.04).add(V(0, 0, 0.004)), dir: d, up: [0, 0, 1], scale: [0.013, 0.034, 0.005], bone: `ear${L}` });
  }

  // antlers
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ant = b.chain(
      `antler${L}`,
      catmull([h(s * 0.035, 0.05, 0), h(s * 0.07, 0.13, -0.02), h(s * 0.1, 0.22, -0.04), h(s * 0.11, 0.31, -0.02)]),
      { parent: "head", names: [`antler${L}1`, `antler${L}2`] },
    );
    b.sweep(ant, [0.012, 0.004], { color: BARK });
    const tines: Array<[number, THREE.Vector3]> = [
      [0.35, V(s * 0.06, 0.05, 0.05)],
      [0.55, V(s * 0.05, 0.04, -0.05)],
      [0.75, V(-s * 0.01, 0.06, 0.05)],
    ];
    tines.forEach(([t, off], k) => {
      const base = ant.at(t).at;
      const tip = base.clone().add(off);
      const bone = ant.jointAt(t).name;
      b.capsule(base, tip, [0.0065, 0.003], { color: BARK, bone });
      flower(tip, off, bone, k === 1 ? 0.8 : 1);
      leaf(base.clone().lerp(tip, 0.5), V(s, 0.2, k % 2 ? 0.5 : -0.5), bone, 0.9, k % 2 ? LEAF2 : LEAF);
    });
    const end = ant.at(1);
    flower(end.at, end.tangent, `antler${L}2`, 1.15);
    leaf(ant.at(0.9).at, V(-s, 0.3, 0.4), `antler${L}2`, 1, LEAF2);
    leaf(ant.at(0.2).at, V(s, -0.1, 0.5), `antler${L}1`, 1, LEAF);
  }

  // ---------------- tail ----------------
  const tGeo = new THREE.IcosahedronGeometry(0.025, 0);
  b.part(tGeo, "#6a9b3a", { at: tail.at(0.3), bone: "tail1", flat: true });
  b.part(tGeo, "#8cbf50", { at: tail.at(0.7), bone: "tail1", scale: 0.85, flat: true });
  b.part(tGeo, "#f1ece0", { at: tail.at(0.75).at.add(V(0, -0.012, 0)), bone: "tail1", scale: 0.6, flat: true });
  flower(tail.at(1).at, V(0, 0.5, -1), "tail2", 1);

  // ---------------- fireflies ----------------
  const fc = h(0, 0.1, 0);
  b.joint("fireflies", { parent: "head", at: fc, dir: [0, 1, 0] });
  const fr = rng(21);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + fr() * 0.4;
    const r = 0.22 + fr() * 0.05;
    const y = (fr() - 0.4) * 0.16;
    const pos = fc.clone().add(V(Math.sin(a) * r, y, Math.cos(a) * r));
    const tan = V(Math.cos(a), 0, -Math.sin(a));
    const side = V(0, 1, 0).cross(tan).normalize();
    b.part(sph, FIRE, { at: pos, dir: tan, scale: [0.006, 0.009, 0.006], bone: "fireflies" });
    b.part(sph, "#2e2618", { at: pos.clone().addScaledVector(tan, 0.009), scale: 0.0042, bone: "fireflies" });
    for (const w of [1, -1])
      b.part(sph, "#eef6ff", {
        at: pos.clone().add(V(0, 0.005, 0)).addScaledVector(side, w * 0.006).addScaledVector(tan, 0.003),
        dir: side.clone().multiplyScalar(w).add(V(0, 0.4, 0)),
        scale: [0.003, 0.007, 0.0012],
        bone: "fireflies",
      });
    for (let k = 1; k <= 3; k++) {
      const a2 = a - k * 0.13;
      b.part(sph, TRAIL, {
        at: fc.clone().add(V(Math.sin(a2) * r, y - k * 0.004, Math.cos(a2) * r)),
        scale: 0.0036 - k * 0.0008,
        bone: "fireflies",
      });
    }
  }

  // ---------------- glow ----------------
  for (const [c, k] of [
    [EYE, 2.2],
    [EYE_RING, 0.8],
    [FIRE, 2.5],
    [TRAIL, 1.4],
  ] as const) {
    const m = b.material(c);
    m.emissive = new THREE.Color(c);
    m.emissiveIntensity = k;
  }

  return b.root;
}
