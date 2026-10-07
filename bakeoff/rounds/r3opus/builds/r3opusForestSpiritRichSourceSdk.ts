import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, grain, spots, svg, spiral, frame } from "../../../../src/index";

export const meta = {
  name: "Mossback Forest Spirit",
  description:
    "A small deer-like forest spirit: a river-stone body under soft moss, slender jointed wooden legs on cloven hooves, a pale painted wooden mask with glowing green eyes, leaf ears, flowering branched antlers and a ring of fireflies circling its head.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function flowerGeometry(r0: number) {
  const shape = new THREE.Shape();
  const N = 40;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = r0 * (0.35 + 0.65 * Math.abs(Math.cos(2.5 * a)));
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const g = new THREE.ExtrudeGeometry(shape, { depth: r0 * 0.25, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, -r0 * 0.125);
  g.rotateX(-Math.PI / 2);
  return g;
}

function leafGeometry(len: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(len * 0.45, len * 0.4, 0, len);
  s.quadraticCurveTo(-len * 0.45, len * 0.4, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: len * 0.06, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -len * 0.03);
  return g;
}

const MOSS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M8 64 Q10 30 3 16 Q17 34 18 64Z" fill="#4f7f2e"/>
<path d="M18 64 Q21 22 29 5 Q28 30 32 64Z" fill="#6fa83c"/>
<path d="M29 64 Q37 26 50 12 Q42 36 42 64Z" fill="#5b9134"/>
<path d="M40 64 Q50 36 62 28 Q52 44 54 64Z" fill="#8cc152"/>
<circle cx="29" cy="7" r="3" fill="#eef8c8"/>
</svg>`;

const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M32 0 L36 27 L64 32 L36 37 L32 64 L28 37 L0 32 L28 27Z" fill="#ffffff"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "forestSpirit", paintSize: 1024 });
  const R = rng(42);

  // ---------------------------------------------------------------- paints
  const stone = paint((p, n) => {
    let c = mix("#848d94", "#adb4b7", smoothstep(0.3, 0.7, noise(p, 0.06, 11)));
    c = mix(c, "#5f676d", smoothstep(0.62, 0.82, noise(p, 0.014, 12)) * 0.6);
    const v = p.x * 0.35 + p.y * 0.6 + p.z * 0.72 + (noise(p, 0.06, 13) - 0.5) * 0.05;
    const band = Math.max(smoothstep(0.009, 0.004, Math.abs(v - 0.27)), smoothstep(0.005, 0.002, Math.abs(v - 0.31)));
    c = mix(c, "#e4e6df", band);
    const moss = smoothstep(0.05, 0.35, n.y + (noise(p, 0.05, 14) - 0.5) * 0.9 - 0.12);
    const mossCol = mix("#4c7c2c", "#8fbf4a", noise(p, 0.02, 15));
    return mix(c, mossCol, moss);
  });
  const woodGrain = grain("#9b7650", "#6e5236", { size: 0.006, axis: "y" });
  const wood = paint((p, n) =>
    n.y > 0.2 && noise(p, 0.015, 50) > 0.66 ? "#78a845" : woodGrain,
  );
  const antlerGrain = grain("#6d5038", "#4b3626", { size: 0.004, axis: "y" });
  const antlerWood = paint((p, n) => (n.y > 0.5 && noise(p, 0.01, 40) > 0.6 ? "#7aa84a" : antlerGrain));
  const paleWood = grain("#efe6cf", "#d6c49e", { size: 0.004, axis: "z" });
  const mossPaint = paint((p) => mix("#4f7f2e", "#93c552", noise(p, 0.02, 31)));
  const maskPaint = paint((p, n, s) => {
    const [x, y] = s;
    let c = mix("#f2e9d3", "#d9c9a4", smoothstep(0.3, 0.8, noise(p, 0.012, 21)));
    const g = 0.5 + 0.5 * Math.sin(y * 260 + noise(p, 0.02, 22) * 5);
    c = mix(c, "#c9b48c", smoothstep(0.85, 1, g) * 0.5);
    const ax = Math.abs(x);
    if (ax < 0.006 && y > -0.075 && y < 0.045) return "#b5452c";
    for (let k = 0; k < 3; k++) {
      const dx = ax - (0.032 + k * 0.009);
      const dy = y - (-0.02 - k * 0.014);
      if (dx * dx + dy * dy < (0.0048 - k * 0.0006) ** 2) return "#3f7a3a";
    }
    const r = Math.hypot(x, y - 0.02);
    if (Math.abs(r - 0.055) < 0.0042 && y > 0.045) return "#b5452c";
    return c;
  });
  const earPaint = paint((p, n, s) => {
    const [x, y] = s;
    if (Math.abs(y) < 0.0022 && x > 0.005) return "#d4ec9a";
    let c = mix("#457c2d", "#88c650", x / 0.115);
    const vein = Math.abs(((x - Math.abs(y) * 1.2) * 70) % 1);
    if (vein < 0.08 && x > 0.012) c = mix(c, "#b5dc7a", 0.6);
    return c;
  });

  const flowerGeo = flowerGeometry(0.012);
  const smallFlowerGeo = flowerGeometry(0.008);
  const centerGeo = new THREE.SphereGeometry(0.0035, 6, 4);
  const leafGeo = leafGeometry(0.03);
  const smallLeafGeo = leafGeometry(0.018);
  const mossTex = svg(MOSS_SVG, { size: 128 });
  const starTex = svg(STAR_SVG, { size: 64 });
  const flowerColor = () => (R() < 0.75 ? "#fffdf5" : "#f8e4ee");
  const leafColor = () => (R() < 0.5 ? "#5f9e3e" : "#86c04e");

  // ---------------------------------------------------------------- skeleton: spine
  b.joint("hips", { at: [0, 0.47, -0.22], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", [[0, 0.47, -0.22], [0, 0.48, -0.02], [0, 0.5, 0.18]], {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });

  const body = b.loft(
    [
      { at: [0, 0.47, -0.37], w: 0.1, h: 0.09 },
      { at: [0, 0.47, -0.27], w: 0.25, h: 0.22 },
      { at: [0, 0.47, -0.06], w: 0.3, h: 0.26 },
      { at: [0, 0.49, 0.15], w: 0.28, h: 0.27 },
      { at: [0, 0.53, 0.27], w: 0.15, h: 0.15 },
    ],
    { color: stone, bone: [spine], sides: 12, name: "body" },
  );

  // ---------------------------------------------------------------- neck & head
  const neck = b.chain("neck", [[0, 0.56, 0.2], [0, 0.66, 0.28], [0, 0.745, 0.335]], {
    parent: "chest",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const neckSkin = b.sweep(neck, [0.07, 0.058, 0.048], { color: stone, extend: [0.05, 0.02], sides: 10, name: "neck" });

  b.joint("head", { at: [0, 0.75, 0.34], dir: [0, 0, 1], parent: "neck2", role: "head" });
  const skull = b.loft(
    [
      { at: [0, 0.78, 0.31], w: 0.13, h: 0.12 },
      { at: [0, 0.78, 0.38], w: 0.15, h: 0.13 },
      { at: [0, 0.75, 0.46], w: 0.1, h: 0.09 },
      { at: [0, 0.73, 0.52], w: 0.07, h: 0.06 },
    ],
    { color: stone, bone: "head", sides: 10, name: "skull" },
  );

  // lower jaw
  b.joint("jaw", { at: [0, 0.722, 0.41], dir: [0, -0.15, 1], parent: "head", role: "jaw" });
  b.loft(
    [
      { at: [0, 0.712, 0.41], w: 0.06, h: 0.03 },
      { at: [0, 0.705, 0.47], w: 0.05, h: 0.025 },
      { at: [0, 0.708, 0.515], w: 0.035, h: 0.018 },
    ],
    { color: paleWood, bone: "jaw", sides: 8, name: "lowerJaw" },
  );

  // nose
  b.part(new THREE.SphereGeometry(0.014, 8, 6), "#2b211b", { at: [0, 0.737, 0.546], scale: [1.3, 0.8, 0.8], bone: "head" });

  // mask
  const maskY = V(0, 0.52, -0.855).normalize();
  const maskN = V(1, 0, 0).cross(maskY);
  const guess = V(0, 0.8, 0.45);
  const hit = b.surface(skull).ray(guess.clone().addScaledVector(maskN, 0.3), maskN.clone().negate());
  const maskAt = (hit ? hit.at : guess).addScaledVector(maskN, 0.002);
  const mask = b.extrude(
    [
      [0, -0.1],
      [0.03, -0.095],
      [0.04, -0.05],
      [0.065, 0.0],
      [0.075, 0.04],
      [0.092, 0.088, "sharp"],
      [0.05, 0.07],
      [0, 0.082],
      [-0.05, 0.07],
      [-0.092, 0.088, "sharp"],
      [-0.075, 0.04],
      [-0.065, 0.0],
      [-0.04, -0.05],
      [-0.03, -0.095],
    ],
    { color: maskPaint, at: maskAt, x: [1, 0, 0], y: maskY, thickness: 0.016, bevel: 0.004, smoothing: 1, bone: "head", name: "mask" },
  );

  // glowing eyes
  const almond = [
    [-0.024, 0],
    [-0.01, 0.011],
    [0.01, 0.011],
    [0.024, 0],
    [0.01, -0.011],
    [-0.01, -0.011],
  ];
  for (const side of [1, -1]) {
    const u = 0.042 * side;
    const v = 0.014;
    const q = mask.quat;
    b.extrude(almond, { color: "#16210f", at: mask.local([u, v, 0.0085]), x: [1, 0, 0], y: maskY, thickness: 0.003, smoothing: 1, bone: "head" });
    b.part(new THREE.TorusGeometry(0.017, 0.0022, 4, 14), "#2fbf5a", { at: mask.local([u, v, 0.01]), quat: q, scale: [1.25, 0.75, 1], bone: "head" });
    b.part(new THREE.SphereGeometry(0.0145, 12, 8), "#7dff4a", { at: mask.local([u, v, 0.0095]), quat: q, scale: [1.25, 0.72, 0.55], bone: "head" });
    b.part(new THREE.SphereGeometry(0.008, 10, 6), "#e8ffb8", { at: mask.local([u, v, 0.015]), quat: q, scale: [1.2, 0.7, 0.5], bone: "head" });
    b.part(new THREE.SphereGeometry(0.0028, 6, 4), "#ffffff", { at: mask.local([u - 0.006 * side, v + 0.004, 0.0195]), bone: "head" });
  }

  // leaf ears
  for (const side of [1, -1]) {
    const L = side > 0 ? "L" : "R";
    const earAt = V(0.07 * side, 0.815, 0.33);
    const dir = V(side, 0.35, -0.25).normalize();
    b.joint(`ear${L}`, { at: earAt, dir, parent: "head", role: "hinge" });
    b.extrude(
      [
        [0, 0],
        [0.03, 0.028],
        [0.075, 0.024],
        [0.115, 0, "sharp"],
        [0.075, -0.022],
        [0.03, -0.026],
      ],
      { color: earPaint, at: earAt, x: dir, y: [0, 1, 0], thickness: 0.007, bevel: 0.002, smoothing: 1, bone: `ear${L}` },
    );
  }

  // antlers with flowers and leaves
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ant = b.chain(
      `antler${L}`,
      [
        [0.035 * s, 0.835, 0.33],
        [0.08 * s, 0.94, 0.31],
        [0.11 * s, 1.04, 0.33],
        [0.12 * s, 1.14, 0.29],
      ],
      { parent: "head", names: [`antler${L}1`, `antler${L}2`, `antler${L}3`] },
    );
    b.sweep(ant, [0.014, 0.011, 0.008, 0.005], { color: antlerWood, sides: 7, extend: [0.02, 0] });
    const tines: Array<[number, THREE.Vector3]> = [
      [0.3, V(0.13 * s, 1.0, 0.43)],
      [0.62, V(0.2 * s, 1.1, 0.36)],
      [0.85, V(0.07 * s, 1.21, 0.23)],
    ];
    const tips: Array<[THREE.Vector3, THREE.Vector3, number]> = [];
    for (const [t, tip] of tines) {
      const base = ant.at(t);
      b.spike(base, tip, null, 0.0075, { color: antlerWood, sides: 6 });
      const d = tip.clone().sub(base.at).normalize();
      tips.push([tip, d, t]);
      // a little twig off each tine
      const mid = base.at.clone().lerp(tip, 0.55);
      const twigTip = mid.clone().add(V(0.03 * s, 0.035, (R() - 0.5) * 0.04));
      b.spike(mid, twigTip, null, 0.004, { color: antlerWood, sides: 5, bone: ant.jointAt(t) });
      b.part(smallLeafGeo, leafColor(), { at: twigTip, dir: twigTip.clone().sub(mid), bone: ant.jointAt(t) });
    }
    const end = ant.at(1);
    tips.push([end.at.clone().addScaledVector(end.tangent, 0.004), end.tangent, 0.99]);
    for (const [tip, d, t] of tips) {
      const bone = ant.jointAt(t);
      const fd = d.clone().add(V((R() - 0.5) * 0.4, 0.2, (R() - 0.5) * 0.4)).normalize();
      b.part(flowerGeo, flowerColor(), { at: tip, dir: fd, bone });
      b.part(centerGeo, "#ffcf3a", { at: tip.clone().addScaledVector(fd, 0.002), bone });
      // a smaller companion blossom
      const side = V(s * 0.6, -0.3, R() - 0.5).normalize();
      const p2 = tip.clone().addScaledVector(d, -0.018).addScaledVector(side, 0.01);
      const fd2 = side.clone().add(fd).normalize();
      b.part(smallFlowerGeo, flowerColor(), { at: p2, dir: fd2, bone });
      b.part(centerGeo, "#ffcf3a", { at: p2.clone().addScaledVector(fd2, 0.0015), bone, scale: 0.7 });
    }
    for (const t of [0.18, 0.45, 0.72, 0.92]) {
      const p = ant.at(t);
      const d = V(s * (0.5 + R()), R() * 0.8 - 0.1, R() - 0.5).normalize();
      b.part(leafGeo, leafColor(), { at: p.at, dir: d, up: [0, 1, 0], bone: ant.jointAt(t) });
    }
  }

  // ---------------------------------------------------------------- legs
  const legs: Array<{ s: number; front: boolean }> = [
    { s: 1, front: true },
    { s: -1, front: true },
    { s: 1, front: false },
    { s: -1, front: false },
  ];
  for (const { s, front } of legs) {
    const L = s > 0 ? "L" : "R";
    const x = 0.085 * s;
    const pts = front
      ? [[x, 0.43, 0.19], [x, 0.27, 0.215], [x, 0.13, 0.2], [x, 0.035, 0.21]]
      : [[x, 0.44, -0.22], [x, 0.3, -0.16], [x, 0.15, -0.25], [x, 0.035, -0.235]];
    const names = front
      ? [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hoofF${L}`]
      : [`hip${L}`, `knee${L}`, `hock${L}`, `hoofH${L}`];
    const leg = b.chain(`leg${front ? "F" : "H"}${L}`, pts, { parent: front ? "chest" : "hips", names, role: "leg" });
    b.sweep(leg, [0.03, 0.02, 0.015, 0.013], { color: wood, sides: 8 });
    // wooden puppet knuckles
    b.part(new THREE.SphereGeometry(0.02, 7, 5), "#7b5a3c", { at: leg.joints[1].at, bone: leg.joints[1], flat: true });
    b.part(new THREE.SphereGeometry(0.017, 7, 5), "#7b5a3c", { at: leg.joints[2].at, bone: leg.joints[2], flat: true });
    // cloven hooves
    const zTip = pts[3][2];
    for (const h of [1, -1])
      b.lathe(
        [
          [0, 0],
          [0.012, 0],
          [0.0105, 0.026],
          [0.007, 0.038],
          [0, 0.04],
        ],
        { color: "#2e2620", at: [x + 0.0075 * h, 0, zTip + 0.002], segments: 7, bone: leg.joints[3] },
      );
    // vines curling round two of the legs
    if ((front && s > 0) || (!front && s < 0)) {
      const cz = front ? 0.206 : -0.243;
      const vine = spiral([x, 0.05, cz], [x + 0.019, 0.05, cz], [0, 1, 0], { turns: 2, pitch: 0.048 });
      b.sweep(vine, 0.0042, { color: "#4a8a35", bone: leg, sides: 5 });
      b.along(vine, 6, (pt) => {
        const out = pt.at.clone().sub(V(x, pt.at.y, cz)).setY(0).normalize().add(V(0, 0.6, 0)).normalize();
        b.part(smallLeafGeo, leafColor(), { at: pt.at, dir: out, up: [0, 1, 0] });
      });
    }
  }

  // ---------------------------------------------------------------- tail
  const tail = b.chain("tail", [[0, 0.52, -0.33], [0, 0.56, -0.39], [0, 0.6, -0.43]], {
    parent: "hips",
    names: ["tail1", "tail2"],
    role: "tail",
  });
  b.sweep(tail, [0.035, 0.03, 0.014], { color: mossPaint, sides: 8 });
  const tailTip = tail.at(1);
  const tailFlowerAt = tailTip.at.clone().addScaledVector(tailTip.tangent, 0.012);
  b.part(flowerGeo, "#fffdf5", { at: tailFlowerAt, dir: tailTip.tangent, bone: "tail2" });
  b.part(centerGeo, "#ffcf3a", { at: tailFlowerAt.clone().addScaledVector(tailTip.tangent, 0.002), bone: "tail2" });
  b.cards([tail.at(0.7), tail.at(0.9)], mossTex, { size: [0.045, 0.04], cross: true, rng: rng(21), spin: 90 });

  // ---------------------------------------------------------------- moss coat
  const coat = b.surface([body, neckSkin]);
  const mossHits = coat.scatter(70, { rng: rng(5), minDist: 0.028, filter: (h) => h.n.y > 0.5 });
  b.cards(mossHits, mossTex, { size: [0.05, 0.045], cross: true, vary: 0.35, spin: 180, lean: 15, flow: [0, 0, -1], rng: rng(6) });

  // mossy beard under the neck
  const beard = Array.from({ length: 10 }, (_, k) => neckSkin.at(0.1 + (0.5 * k) / 9, 150 + 60 * R()));
  b.cards(beard, mossTex, { size: [0.05, 0.06], lean: 70, flow: [0, -1, 0.2], bend: 30, cross: true, rng: rng(13), vary: 0.2 });

  // mounds, pebbles, mushrooms and blossoms on the back
  const tops = b.surface(body).scatter(16, { rng: rng(11), minDist: 0.06, filter: (h) => h.n.y > 0.7 });
  tops.forEach((h, i) => {
    if (i < 6) {
      const g = new THREE.IcosahedronGeometry(0.026 + R() * 0.012, 0);
      g.scale(1, 0.5, 1.1);
      b.stick(g, R() < 0.5 ? "#5f9238" : "#77aa44", h, { embed: 0.4, spin: R() * 360, flat: true });
    } else if (i < 9) {
      const g = new THREE.DodecahedronGeometry(0.014 + R() * 0.008, 0);
      g.scale(1, 0.6, 0.8);
      b.stick(g, R() < 0.5 ? "#b9bdb8" : "#8f979b", h, { embed: 0.35, spin: R() * 360, flat: true });
    } else if (i < 12) {
      const axis = V(0, 1, 0).add(h.n).normalize();
      const at = h.moved([0, -0.006, 0]);
      const k = 0.8 + R() * 0.5;
      b.lathe(
        [
          [0, 0],
          [0.006 * k, 0],
          [0.0055 * k, 0.035 * k],
          [0, 0.035 * k],
        ],
        { color: "#efe3c8", at, axis, segments: 7 },
      );
      b.lathe(
        [
          [0, 0.03 * k],
          [0.024 * k, 0.03 * k],
          [0.022 * k, 0.04 * k],
          [0.012 * k, 0.05 * k],
          [0, 0.053 * k],
        ],
        { color: spots("#c8542e", "#f3e8d0", { size: 0.012, amount: 0.4, seed: i }), at, axis, segments: 9 },
      );
    } else {
      b.stick(flowerGeo, flowerColor(), h, { embed: 0.1, spin: R() * 360 });
      b.stick(centerGeo, "#ffcf3a", h, { embed: 0.1 });
    }
  });

  // ---------------------------------------------------------------- fireflies circling the head
  b.joint("wisps", { at: [0, 0.86, 0.36], parent: "head", dir: [0, 1, 0] });
  const angles = [20, 85, 150, 210, 270, 330];
  const heights = [0.95, 0.78, 0.88, 0.74, 0.92, 0.82];
  const sparkFrames = [];
  angles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const r = 0.21;
    const pos = V(r * Math.sin(a), heights[i], 0.36 + r * Math.cos(a));
    const tangent = V(Math.cos(a), 0, -Math.sin(a));
    b.capsule(pos.clone().addScaledVector(tangent, -0.002), pos.clone().addScaledVector(tangent, 0.007), 0.0035, {
      color: "#3b2f1f",
      bone: "wisps",
      sides: 5,
    });
    b.part(new THREE.SphereGeometry(0.0075, 8, 6), "#f4ff86", { at: pos.clone().addScaledVector(tangent, -0.005), bone: "wisps" });
    for (let k = 1; k <= 3; k++) {
      const ak = a - k * 0.17;
      b.part(new THREE.SphereGeometry(0.0042 - k * 0.0009, 6, 4), "#d9f27a", {
        at: V(r * Math.sin(ak), heights[i] - k * 0.006, 0.36 + r * Math.cos(ak)),
        bone: "wisps",
      });
    }
    sparkFrames.push(frame(pos.clone().add(V(0, -0.022, 0)), [0, 1, 0]));
  });
  b.cards(sparkFrames, starTex, { size: [0.045, 0.045], cross: true, bone: "wisps", color: "#fff6a8", sink: 0, spin: 45, rng: rng(9) });

  return b.root;
}
