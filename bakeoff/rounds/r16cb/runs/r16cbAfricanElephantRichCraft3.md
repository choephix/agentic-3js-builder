```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  limb,
  frame,
  offset,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant in a low-poly style: faceted barrel body, big Africa-shaped ears with painted veins, curved ivory tusks, ringed trunk, dusty cracked skin, rigged legs, trunk, ears, jaw and tail.",
};

// ---------------------------------------------------------------- palette
const C = {
  skinLo: "#76716d",
  skinMid: "#8b8681",
  skinHi: "#a39d95",
  dust: "#ab9070",
  mud: "#6e5137",
  crack: "#58534f",
  dark: "#1d1715",
  nail: "#d9d1c0",
  gum: "#6b4d45",
  ear: "#a98a82",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "bushElephant" });
  const rand = rng(11);

  // ---------------------------------------------------------------- paints
  const SKIN = paint((p, n) => {
    const big = noise(p, 0.9, 3);
    let c = mix(C.skinLo, C.skinHi, smoothstep(0.25, 0.75, big));
    c = mix(c, C.skinMid, 0.3);
    const cl = cells(p, 0.24, 11);
    const e = cl.d2 - cl.d1;
    c = mix(c, C.crack, 0.6 * (1 - smoothstep(0.02, 0.11, e)) * (0.45 + 0.55 * noise(p, 0.5, 4)));
    c = mix(c, C.crack, 0.12 * smoothstep(0.55, 0.8, noise(p, 0.06, 9)));
    const dustAmt = smoothstep(1.7, 0.1, p.y) * (0.45 + 0.55 * noise(p, 0.35, 5));
    c = mix(c, C.dust, 0.6 * dustAmt);
    c = mix(c, C.mud, 0.85 * smoothstep(0.5, 0.12, p.y + 0.12 * noise(p, 0.15, 6)));
    c = mix(c, "#b8afa2", 0.18 * smoothstep(0.4, 1, n.y));
    return c;
  });
  const FOLD = paint((p, n) => mix(SKIN.at(p, n), C.crack, 0.35));
  const TRUNKSKIN = paint((p, n, s) => {
    const c = SKIN.at(p, n);
    const f = Math.abs(((s[0] * 24) % 1) - 0.5) * 2;
    const ridged = mix(c, C.crack, 0.55 * smoothstep(0.72, 1, f));
    return mix(ridged, "#a38c84", 0.25 * smoothstep(-0.3, -0.9, n.y));
  });
  const TUSK = paint((p, n, s) => {
    const t = s[0];
    let c = mix("#f6eed8", "#e6d8b2", noise(p, 0.12, 2));
    c = mix(c, "#b79c70", smoothstep(0.3, 0.0, t) * 0.9);
    c = mix(c, "#cdb88e", smoothstep(0.9, 1, t) * 0.7);
    c = mix(c, "#a89572", 0.25 * smoothstep(0.0, -0.8, n.y));
    return c;
  });
  const earPaint = (thick: THREE.Vector3) =>
    paint((p, n, s) => {
      const base = SKIN.at(p, n);
      if (Math.abs(n.dot(thick)) < 0.5) return mix(base, C.crack, 0.55);
      return mix(base, C.ear, 0.45 * smoothstep(0.1, -0.75, s[1]));
    });

  // ---------------------------------------------------------------- textures
  const EYE = svg(
    `<svg viewBox="0 0 80 60">
      <ellipse cx="40" cy="30" rx="38" ry="26" fill="#57514d" opacity="0.9"/>
      <path d="M8 30 Q40 3 72 30 Q40 57 8 30Z" fill="#241a14"/>
      <circle cx="40" cy="30" r="15" fill="#8d5c26"/>
      <circle cx="40" cy="30" r="15" fill="none" stroke="#2a190c" stroke-width="2.4"/>
      <circle cx="40" cy="30" r="7.5" fill="#0c0806"/>
      <circle cx="34" cy="24" r="4.5" fill="#ffffff"/>
      <circle cx="47" cy="36" r="2.2" fill="#ffffff"/>
      <path d="M6 17 Q40 -4 74 17" stroke="#38332f" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M10 46 Q40 62 70 46" stroke="#38332f" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const STAIN = svg(
    `<svg viewBox="0 0 50 100">
      <path d="M12 0 Q4 40 14 88 Q22 100 30 88 Q40 40 36 0Z" fill="#4a4440"/>
      <path d="M24 0 L24 70" stroke="#2f2a27" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const WRINKLE = svg(
    `<svg viewBox="0 0 100 60">
      <g fill="none" stroke-linecap="round">
        <g stroke="#4a4540" stroke-width="3.6">
          <path d="M5 10 Q50 0 95 12"/><path d="M8 24 Q50 13 92 26"/>
          <path d="M5 38 Q50 29 95 40"/><path d="M12 51 Q50 44 88 53"/>
        </g>
        <g stroke="#b4ada3" stroke-width="1.8">
          <path d="M5 14 Q50 4 95 16"/><path d="M8 28 Q50 17 92 30"/>
          <path d="M5 42 Q50 33 95 44"/>
        </g>
      </g>
    </svg>`,
    { size: 256 },
  );
  const mudSvg = () => {
    const r = rng(21);
    let s = "";
    for (let i = 0; i < 28; i++) {
      const rx = 3 + r() * 9;
      s += `<ellipse cx="${(8 + r() * 84).toFixed(1)}" cy="${(8 + r() * 84).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(rx * (0.6 + r() * 0.6)).toFixed(1)}" fill="${r() < 0.5 ? "#6c4f35" : "#816443"}"/>`;
    }
    return `<svg viewBox="0 0 100 100">${s}</svg>`;
  };
  const MUD = svg(mudSvg(), { size: 256 });
  const TUFT = svg(
    `<svg viewBox="0 0 40 100">
      <g fill="#241d1a">
        <path d="M20 100 Q14 50 5 4 L9 3 Q22 50 25 100Z"/>
        <path d="M18 100 Q18 50 18 2 L22 2 Q24 50 24 100Z"/>
        <path d="M16 100 Q24 50 33 5 L36 7 Q28 50 26 100Z"/>
        <path d="M14 100 Q10 70 10 30 L13 30 Q17 70 22 100Z"/>
      </g>
    </svg>`,
    { size: 128 },
  );
  const BRISTLE = svg(
    `<svg viewBox="0 0 24 48">
      <g fill="#3a3230">
        <path d="M6 48 Q7 24 4 2 L8 4 Q11 26 12 48Z"/>
        <path d="M10 48 Q12 24 13 0 L16 3 Q16 26 15 48Z"/>
        <path d="M13 48 Q18 26 21 6 L23 10 Q19 30 18 48Z"/>
      </g>
    </svg>`,
    { size: 96 },
  );
  const earVeinSvg = (flip: boolean) => {
    const X = (u: number) => (u * 100).toFixed(1);
    const Y = (v: number) => ((0.8 - v) * 100).toFixed(1);
    const root = [0.06, 0.12];
    const ends = [
      [0.42, 0.62],
      [0.8, 0.5],
      [1.0, 0.15],
      [0.9, -0.3],
      [0.62, -0.62],
      [0.36, -0.42],
      [0.2, -0.1],
    ];
    let d = "";
    for (const [u, v] of ends) {
      const dx = u - root[0];
      const dy = v - root[1];
      const len = Math.hypot(dx, dy);
      const px = -dy / len;
      const py = dx / len;
      d += `<path d="M${X(root[0])} ${Y(root[1])} Q${X(root[0] + dx * 0.5)} ${Y(root[1] + dy * 0.5 + 0.07)} ${X(u)} ${Y(v)}"/>`;
      const sx = root[0] + dx * 0.55;
      const sy = root[1] + dy * 0.55 + 0.04;
      d += `<path d="M${X(sx)} ${Y(sy)} L${X(sx + dx * 0.25 + px * 0.06)} ${Y(sy + dy * 0.25 + py * 0.06)}"/>`;
    }
    const patches = `<ellipse cx="${X(0.62)}" cy="${Y(-0.3)}" rx="26" ry="28" fill="#a58b84"/><ellipse cx="${X(0.38)}" cy="${Y(0.3)}" rx="16" ry="18" fill="#9d847d"/>`;
    const g = `${patches}<g fill="none" stroke="#6f605a" stroke-width="2.6" stroke-linecap="round">${d}</g>`;
    return `<svg viewBox="0 0 110 170">${flip ? `<g transform="translate(110 0) scale(-1 1)">${g}</g>` : g}</svg>`;
  };
  const VEIN_L = svg(earVeinSvg(false), { size: 256 });
  const VEIN_R = svg(earVeinSvg(true), { size: 256 });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 2.4, -1.3], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.5, -0.7],
      [0, 2.62, 0.1],
      [0, 2.7, 0.9],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.7, 0.9],
      [0, 2.62, 1.45],
      [0, 2.5, 1.9],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 2.45, 1.9], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.02, 2.0], aim: [0, 1.9, 2.55], role: "jaw" });

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.25, 2.4],
      [0, 1.85, 2.78],
      [0, 1.3, 2.98],
      [0, 0.8, 3.05],
      [0, 0.42, 3.2],
      [0, 0.27, 3.45],
      [0, 0.36, 3.68],
    ]),
    { parent: head, role: "tentacle" },
  );
  const trunkTip = trunk.joints[trunk.joints.length - 1];

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.4, -1.85],
      [0, 2.0, -2.1],
      [0, 1.4, -2.2],
      [0, 0.97, -2.18],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 2.22, -1.95], w: 0.9, h: 1.25 },
      { at: [0, 2.18, -1.4], w: 1.5, h: 1.75 },
      { at: [0, 2.1, -0.5], w: 1.75, h: 1.8 },
      { at: [0, 2.12, 0.4], w: 1.75, h: 1.85 },
      { at: [0, 2.32, 1.1], w: 1.55, h: 1.95 },
      { at: [0, 2.35, 1.65], w: 1.1, h: 1.3 },
    ],
    { bone: [hips, spine, neck], color: SKIN, sides: 12, smooth: false },
  );
  const bodySkin = b.surface(body);

  // skin wrinkle decals on the flanks
  const fold = (z: number, y: number, el: number, w: number, h: number, roll: number) => {
    for (const s of [1, -1]) {
      const hit = bodySkin.around([0, y, z]).at(s * 90, el);
      if (hit) b.decal(bodySkin, WRINKLE, { at: hit, dir: [s, 0, 0], size: [w, h], roll: s * roll, mirror: s < 0 });
    }
  };
  fold(0.9, 2.4, 15, 0.9, 0.6, -8);
  fold(-1.2, 2.4, 25, 0.9, 0.6, 10);
  fold(-0.2, 2.0, -25, 1.0, 0.6, 0);
  fold(1.55, 2.5, 5, 0.6, 0.45, -12);
  const mud = (z: number, y: number, el: number, w: number, h: number) => {
    for (const s of [1, -1]) {
      const hit = bodySkin.around([0, y, z]).at(s * 90, el);
      if (hit) b.decal(bodySkin, MUD, { at: hit, dir: [s, 0, 0], size: [w, h], roll: s * 20, mirror: s < 0 });
    }
  };
  mud(-0.2, 2.0, -42, 1.1, 0.6);
  mud(-1.3, 1.9, -38, 0.9, 0.6);
  mud(0.9, 1.95, -40, 0.8, 0.5);

  // wart bumps and sparse back bristles
  const bumpHits = bodySkin.scatter(34, { rng: rng(5), minDist: 0.3, filter: (h) => h.n.y > -0.2 });
  for (const h of bumpHits)
    b.stick(new THREE.SphereGeometry(0.07, 5, 3), FOLD, h, { embed: 0.5, scale: [1, 0.45, 1], flat: true });
  b.cards(
    bodySkin.scatter(40, { rng: rng(6), minDist: 0.22, filter: (h) => h.n.y > 0.8 }),
    BRISTLE,
    { size: [0.035, 0.09], lean: 30, vary: 0.3, rng: rand },
  );

  // ---------------------------------------------------------------- legs
  const legR = (t: number) => 0.38 - 0.12 * smoothstep(0.1, 0.55, t) + 0.05 * smoothstep(0.6, 1, t);

  const buildLeg = (kind: "fore" | "hind", s: number) => {
    const side = s > 0 ? "L" : "R";
    const fore = kind === "fore";
    const root = V(s * (fore ? 0.6 : 0.62), fore ? 2.25 : 2.15, fore ? 0.75 : -1.15);
    const target = V(root.x, 0.25, root.z + (fore ? 0.05 : 0));
    const pts = limb(
      root,
      target,
      fore ? [0.72, 0.65, 0.7] : [0.78, 0.66, 0.62],
      fore
        ? [
            [0, 0, -1],
            [0, 0, 1],
          ]
        : [
            [0, 0, 1],
            [0, 0, -1],
          ],
    );
    const names = fore
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `foreFoot${side}`]
      : [`hip${side}`, `knee${side}`, `ankle${side}`, `hindFoot${side}`];
    const chain = b.chain(`${kind}Leg${side}`, pts, {
      parent: fore ? chest : hips,
      names,
      role: "leg",
      contact: [target.x, 0, target.z],
    });
    const foot = chain.joints[chain.joints.length - 1];

    // muscle mass at shoulder / haunch
    b.part(new THREE.SphereGeometry(1, 10, 7), SKIN, {
      bone: chain.joints[0],
      at: fore ? [s * 0.58, 2.3, 0.8] : [s * 0.6, 2.2, -1.1],
      scale: fore ? [0.45, 0.65, 0.55] : [0.5, 0.7, 0.75],
      flat: true,
    });
    b.sweep(chain, legR, {
      color: SKIN,
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "flat" },
    });
    // skin folds at knee / elbow
    for (const t of [0.42, 0.7]) {
      const cp = chain.at(t);
      b.part(new THREE.TorusGeometry(legR(t) * 1.03, 0.03, 4, 10), FOLD, {
        at: cp,
        dir: cp.axis,
        axis: "z",
        flat: true,
      });
    }
    // foot
    const sx = fore ? 1 : 0.93;
    const sz = fore ? 1 : 1.12;
    const fc = V(target.x, 0.14, target.z + 0.02);
    b.part(new THREE.CylinderGeometry(0.29, 0.345, 0.3, 10), SKIN, {
      bone: foot,
      at: fc,
      scale: [sx, 1, sz],
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.3, 0.05, 4, 10), FOLD, {
      bone: foot,
      at: [fc.x, 0.3, fc.z],
      dir: [0, 1, 0],
      axis: "z",
      scale: [sx, sx, 1],
      flat: true,
    });
    const angles = fore ? [-56, -28, 0, 28, 56] : [-42, -14, 14, 42];
    for (const deg of angles) {
      const a = (deg * Math.PI) / 180;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.08), C.nail, {
        bone: foot,
        at: [fc.x + dx * 0.335 * sx, 0.075, fc.z + dz * 0.335 * sz],
        dir: [dx * sx, 0, dz * sz],
        axis: "z",
        flat: true,
      });
    }
    return chain;
  };
  for (const s of [1, -1]) {
    buildLeg("fore", s);
    buildLeg("hind", s);
  }

  // ---------------------------------------------------------------- head
  const skullC = V(0, 2.42, 2.0);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, {
    bone: head,
    at: skullC,
    scale: [0.52, 0.6, 0.58],
    flat: true,
  });
  const domes: ReturnType<typeof b.part>[] = [];
  for (const s of [1, -1]) {
    domes.push(
      b.part(new THREE.SphereGeometry(1, 10, 7), SKIN, {
        bone: head,
        at: [s * 0.2, 2.85, 1.98],
        scale: [0.3, 0.26, 0.34],
        flat: true,
      }),
    );
    // cheeks
    b.part(new THREE.SphereGeometry(1, 9, 6), SKIN, {
      bone: head,
      at: [s * 0.4, 2.1, 2.1],
      scale: [0.2, 0.22, 0.25],
      flat: true,
    });
  }
  // muzzle block behind the trunk root
  b.part(new THREE.SphereGeometry(1, 10, 7), SKIN, {
    bone: head,
    at: [0, 2.2, 2.3],
    scale: [0.34, 0.4, 0.3],
    flat: true,
  });
  // lower jaw
  b.frustumBox([0, 2.0, 2.0], [0, 1.9, 2.5], [0.5, 0.18], [0.34, 0.12], { bone: jaw, color: SKIN });
  b.part(new THREE.SphereGeometry(1, 8, 5), SKIN, {
    bone: jaw,
    at: [0, 1.9, 2.5],
    scale: [0.17, 0.07, 0.1],
    flat: true,
  });

  // eyes, brows, lashes, temporal streaks
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skullSkin.around(skullC).at(s * 78, 3)!;
    b.decal(skull, EYE, { at: eyeHit, size: [0.14, 0.105], up: [0, 1, 0], mirror: s < 0 });
    b.ring(eyeHit, { count: 6, radius: 0.05, fromDeg: -80, toDeg: 80, tilt: 30 }, (lash) =>
      b.spike(lash, lash, 0.07, 0.007, { color: C.dark }),
    );
    const brow = skullSkin.around(skullC).at(s * 66, 26)!;
    b.stick(new THREE.SphereGeometry(0.12, 7, 5), FOLD, brow, { embed: 0.35, scale: [1.1, 0.5, 1.3], flat: true });
    const strk = skullSkin.around(skullC).at(s * 82, -18)!;
    b.decal(skull, STAIN, { at: strk, size: [0.07, 0.14], up: [0, 1, 0] });
  }

  // forehead bristles
  b.cards(
    b.surface([skull, ...domes]).scatter(26, { rng: rng(8), minDist: 0.08, filter: (h) => h.n.y > 0.55 }),
    BRISTLE,
    { size: [0.04, 0.1], lean: 25, vary: 0.3, rng: rand },
  );

  // ---------------------------------------------------------------- trunk
  const trunkR = (t: number) => 0.3 - 0.2 * t;
  const trunkSweep = b.sweep(trunk, trunkR, {
    color: TRUNKSKIN,
    sides: 8,
    smooth: false,
    caps: { start: "round", end: "flat" },
  });
  for (let i = 0; i < 12; i++) {
    const t = 0.1 + i * 0.075;
    const cp = trunk.at(t);
    b.part(new THREE.TorusGeometry(trunkR(t) * 1.04, 0.022, 4, 10), FOLD, {
      at: cp,
      dir: cp.axis,
      axis: "z",
      flat: true,
    });
  }
  // trunk tip: nostrils and finger
  const endCp = trunk.at(1);
  const tan = endCp.tangent.clone().normalize();
  const endPt = endCp.at.clone();
  b.ring(frame(endPt, tan), { count: 2, radius: 0.04, fromDeg: 90, toDeg: 270 }, (n) => {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), C.dark, {
      bone: trunkTip,
      at: offset(n.at, tan, 0.004),
      dir: tan,
    });
  });
  b.spike(offset(endPt, [0, 1, 0], 0.07), tan, 0.12, 0.035, { color: SKIN, bone: trunkTip });
  b.cards(
    b.surface(trunkSweep).scatter(16, { rng: rng(9), minDist: 0.1, filter: (h) => h.at.y > 1.7 }),
    BRISTLE,
    { size: [0.03, 0.08], lean: 40, vary: 0.3, rng: rand },
  );

  // ---------------------------------------------------------------- tusks
  for (const s of [1, -1]) {
    const base = V(s * 0.3, 2.0, 2.35);
    const path = bezier(base, V(s * 0.45, 1.5, 2.9), V(s * 0.52, 1.3, 3.5), V(s * 0.4, 1.65, 4.0));
    const d = V(s * 0.15, -0.5, 0.55).normalize();
    b.part(new THREE.CylinderGeometry(0.075, 0.095, 0.14, 7), C.gum, {
      bone: head,
      at: offset(base, d, 0.02),
      dir: d,
      flat: true,
    });
    b.sweep(path, [0.085, 0.012], {
      bone: head,
      color: TUSK,
      sides: 8,
      caps: { start: "flat", end: "point" },
    });
  }

  // ---------------------------------------------------------------- ears
  const EAR_OUTLINE: [number, number, "sharp"?][] = [
    [0, 0.55],
    [0.35, 0.75],
    [0.8, 0.6],
    [1.1, 0.1],
    [1.0, -0.4],
    [0.7, -0.85, "sharp"],
    [0.35, -0.6],
    [0.1, -0.25],
  ] as [number, number, "sharp"?][];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = V(s * 0.42, 2.78, 1.85);
    const xdir = V(s * 0.45, 0, -1).normalize();
    const ydir = V(0, 1, 0);
    const earJoint = b.joint(`ear${side}`, { parent: head, at: root, dir: xdir, role: "hinge" });
    const thick = xdir.clone().cross(ydir).normalize();
    const ear = b.extrude(EAR_OUTLINE as [number, number][], {
      at: root,
      x: xdir,
      y: ydir,
      thickness: 0.05,
      smoothing: 1,
      color: earPaint(thick),
      bone: earJoint,
      name: `ear${side}`,
    });
    const out = ear.axis.dot(V(s, 0, 0)) > 0 ? 1 : -1;
    for (const face of [1, -1]) {
      const nrm = ear.axis.clone().multiplyScalar(face * out);
      b.part(new THREE.PlaneGeometry(1.1, 1.7), "#ffffff", {
        bone: earJoint,
        at: ear.local([0.55, -0.05, face * out * 0.029]),
        dir: nrm,
        up: [0, 1, 0],
        axis: "z",
        texture: nrm.x > 0 ? VEIN_L : VEIN_R,
      });
    }
  }

  // ---------------------------------------------------------------- tail
  b.sweep(tail, (t) => 0.1 - 0.055 * t, {
    color: SKIN,
    sides: 8,
    smooth: false,
    caps: { start: "round", end: "flat" },
  });
  const tailTip = tail.joints[tail.joints.length - 1];
  b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 7), C.dark, {
    bone: tailTip,
    at: [0, 0.95, -2.18],
    flat: true,
  });
  const tuft = b.ring(frame(V(0, 0.97, -2.18), [0, 1, 0]), { count: 8, radius: 0.02 }).items;
  b.cards(tuft, TUFT, {
    size: [0.12, 0.42],
    lean: 75,
    flow: [0, -1, 0],
    bend: 20,
    cross: true,
    vary: 0.2,
    rng: rand,
    bone: tailTip,
  });

  return b.root;
}
```