import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Wild Boar",
  description:
    "A heroic wild boar, about 0.95 m at the withers: a bristled dorsal mane, heavy brow and jowls, ivory tusks capped in worn bronze, bronze-banded hooves, painted in a Blizzard-style hand-painted palette.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "wildBoar", paintSize: 2048 });

  // ---- palette (sRGB) ----
  const HIDE_DARK = "#2e1409";
  const HIDE_MID = "#6a3015";
  const HIDE_LIGHT = "#a8582a";
  const HIDE_RIM = "#e0924a";
  const BELLY = "#3d1b0c";
  const HEAD_MID = "#7a3a1c";
  const CHEEK = "#9a5027";
  const MANE = "#3a1a0b";
  const MANE_TIP = "#9a5a2a";
  const SNOUT = "#c97f66";
  const SNOUT_DARK = "#8a4438";
  const NOSTRIL = "#1b0905";
  const IVORY = "#f1e2bd";
  const BRONZE = "#a06f22";
  const GOLD = "#d8b04a";
  const HOOF = "#2a221e";

  // ---- paints: countershading, dorsal and shoulder rim light, shadowed belly, mottled clumps ----
  const hide = paint((p, n) => {
    const clump = noise(p, 0.05, 11);
    const fine = noise(p, 0.012, 23);
    const top = smoothstep(-0.2, 0.9, n.y);
    let c = mix(BELLY, HIDE_MID, top);
    c = mix(c, HIDE_DARK, 0.55 * smoothstep(0.5, 0.8, clump));
    c = mix(c, HIDE_LIGHT, 0.6 * smoothstep(0.55, 0.9, n.y) * smoothstep(0.4, 0.7, fine));
    const ridge = smoothstep(0.16, 0.0, Math.abs(p.x)) * smoothstep(0.35, 0.85, n.y);
    c = mix(c, HIDE_RIM, 0.75 * ridge);
    const shoulder = smoothstep(0.2, 0.04, Math.hypot(Math.abs(p.x) - 0.2, p.z - 0.32, p.y - 0.78));
    c = mix(c, HIDE_RIM, 0.45 * shoulder);
    c = mix(c, BELLY, 0.7 * smoothstep(0.42, 0.26, p.y));
    return c;
  });

  const headSkin = paint((p, n) => {
    const clump = noise(p, 0.04, 31);
    let c = mix(HEAD_MID, CHEEK, smoothstep(0.2, 0.7, clump));
    c = mix(c, HIDE_DARK, 0.4 * smoothstep(0.55, 0.85, noise(p, 0.03, 8)));
    c = mix(c, HIDE_LIGHT, 0.5 * smoothstep(0.6, 0.95, n.y));
    c = mix(c, BELLY, 0.7 * smoothstep(-0.1, -0.6, n.y));
    return c;
  });

  const legSkin = paint((p, _n) => {
    const g = noise(p, 0.03, 52);
    const c = mix(HIDE_DARK, HIDE_MID, smoothstep(0.1, 0.35, p.y));
    return mix(c, HIDE_DARK, 0.4 * smoothstep(0.55, 0.8, g));
  });

  const snout = paint((_p, n) => mix(SNOUT_DARK, SNOUT, smoothstep(0.0, 0.9, n.z)));

  const maneColor = paint((p, _n) => mix(MANE, MANE_TIP, smoothstep(0.5, 0.9, noise(p, 0.02, 41))));

  // ---- textures ----
  const bristleCard = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
<path d="M16 64 C12 44 9 22 16 0 C23 22 20 44 16 64Z" fill="#9c9c9c"/>
<path d="M16 58 C14 40 13 22 16 6" stroke="#ffffff" stroke-width="2" fill="none"/>
<path d="M11 60 C9 44 8 30 10 18" stroke="#dcdcdc" stroke-width="1.4" fill="none"/>
<path d="M21 60 C23 44 23 30 21 18" stroke="#6e6e6e" stroke-width="1.4" fill="none"/>
</svg>`,
    { size: 128 },
  );
  const coatCard = svg(
    `<svg viewBox="0 0 16 32" xmlns="http://www.w3.org/2000/svg">
<path d="M8 32 C5 20 5 10 8 0 C11 10 11 20 8 32Z" fill="#a8a8a8"/>
<path d="M8 28 C7 18 7 10 8 4" stroke="#ffffff" stroke-width="1" fill="none"/>
</svg>`,
    { size: 96 },
  );
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="32" cy="34" rx="28" ry="22" fill="#d9c49a"/>
<circle cx="32" cy="34" r="16" fill="#c2701c"/>
<circle cx="32" cy="34" r="11" fill="#eaa23a"/>
<ellipse cx="32" cy="34" rx="4.5" ry="10" fill="#120804"/>
<circle cx="27" cy="27" r="3.5" fill="#fff6e0"/>
<path d="M2 30 Q32 2 62 30" stroke="#1d0c05" stroke-width="7" fill="none"/>
<path d="M4 40 Q32 62 60 40" stroke="#2b1408" stroke-width="4" fill="none"/>
</svg>`,
    { size: 128 },
  );
  const scarTex = svg(
    `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
<path d="M6 20 L24 12 L38 22 L58 10 L76 20 L96 12 L122 18" stroke="#e7a892" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M48 4 L56 28" stroke="#c98a74" stroke-width="2.2" fill="none"/>
<path d="M84 6 L90 26" stroke="#c98a74" stroke-width="2" fill="none"/>
</svg>`,
    { size: 256 },
  );

  // A squashed sphere, built in model space and carried by one bone.
  const blob = (bone: Joint, color: Fill, c: V3, r: V3, seg = 12) =>
    b.part(
      new THREE.SphereGeometry(1, seg, Math.max(6, Math.round((seg * 2) / 3)))
        .scale(r[0], r[1], r[2])
        .translate(c[0], c[1], c[2]),
      color,
      { bone, at: [0, 0, 0] },
    );

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.62, -0.62], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, -0.42],
      [0, 0.64, -0.12],
      [0, 0.66, 0.14],
      [0, 0.7, 0.38],
    ]),
    { parent: hips, names: ["spineA", "spineB", "spineC"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.7, 0.38],
      [0, 0.8, 0.6],
      [0, 0.85, 0.74],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.86, 0.76], aim: [0, 0.79, 1.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.72, 0.86], aim: [0, 0.67, 1.1], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.66, -0.7],
      [0, 0.72, -0.84],
      [0, 0.8, -0.96],
    ]),
    { parent: hips, names: ["tailBase", "tailTip"], role: "tail" },
  );

  // ---- body ----
  const body = b.loft(
    [
      { at: [0, 0.6, -0.78], w: 0.4, h: 0.44 },
      { at: [0, 0.6, -0.56], w: 0.6, h: 0.58 },
      { at: [0, 0.6, -0.3], w: 0.62, h: 0.6 },
      { at: [0, 0.58, -0.02], w: 0.64, h: 0.6 },
      { at: [0, 0.6, 0.2], w: 0.66, h: 0.64 },
      { at: [0, 0.64, 0.4], w: 0.64, h: 0.64 },
    ],
    { bone: [hips, spine], color: hide },
  );
  const neckMesh = b.sweep(neck, [0.22, 0.17], { color: hide });

  // ---- legs: a forelimb (shoulder, elbow, wrist, hoof) and a hindlimb (hip, knee, hock, hoof), per side ----
  const legMeshes: Sweep[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    const forePts = limb(
      [s * 0.2, 0.52, 0.36],
      [s * 0.19, 0.04, 0.42],
      [0.22, 0.2, 0.12],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fore = b.chain(`foreLeg${L}`, forePts, {
      parent: spine.joints[2],
      names: [`shoulderF${L}`, `elbowF${L}`, `wristF${L}`, `hoofF${L}`],
      role: "leg",
    });
    const hindPts = limb(
      [s * 0.2, 0.52, -0.5],
      [s * 0.19, 0.04, -0.56],
      [0.22, 0.22, 0.12],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`hindLeg${L}`, hindPts, {
      parent: hips,
      names: [`hipH${L}`, `kneeH${L}`, `hockH${L}`, `hoofH${L}`],
      role: "leg",
    });

    legMeshes.push(b.sweep(fore, [0.11, 0.085, 0.06, 0.05], { color: legSkin }));
    legMeshes.push(b.sweep(hind, [0.13, 0.095, 0.06, 0.05], { color: legSkin }));

    // Shoulder and haunch masses give the heroic silhouette.
    blob(fore.joints[0], hide, [s * 0.24, 0.6, 0.3], [0.14, 0.2, 0.2], 14);
    blob(hind.joints[0], hide, [s * 0.22, 0.6, -0.5], [0.14, 0.18, 0.2], 14);

    // Cloven hooves: two toes under each foot, a bronze band round the pastern.
    for (const [chain, foot] of [
      [fore, forePts[3]],
      [hind, hindPts[3]],
    ] as const) {
      const hoof = chain.joints[3];
      for (const x of [-0.025, 0.025]) blob(hoof, HOOF, [foot.x + x, 0.03, foot.z + 0.02], [0.024, 0.03, 0.038]);
      const band = b.ring(chain.joints[2], { count: 8, radius: 0.072 });
      b.sweep(catmull(band.items, { closed: true }), 0.011, { color: BRONZE });
      for (const item of band.items) b.stick(new THREE.SphereGeometry(0.009, 6, 4), GOLD, item, { embed: 0.2 });
    }
  }

  // ---- head ----
  const skull = b.loft(
    [
      { at: [0, 0.82, 0.7], w: 0.32, h: 0.28 },
      { at: [0, 0.8, 0.84], w: 0.38, h: 0.3 },
      { at: [0, 0.77, 0.97], w: 0.26, h: 0.22 },
      { at: [0, 0.75, 1.08], w: 0.17, h: 0.17 },
      { at: [0, 0.74, 1.12], w: 0.15, h: 0.15 },
    ],
    { bone: head, color: headSkin },
  );
  const mandible = b.loft(
    [
      { at: [0, 0.7, 0.82], w: 0.22, h: 0.14 },
      { at: [0, 0.68, 0.97], w: 0.16, h: 0.11 },
      { at: [0, 0.665, 1.09], w: 0.12, h: 0.09 },
    ],
    { bone: jaw, color: headSkin },
  );
  for (const s of [1, -1]) {
    blob(head, headSkin, [s * 0.14, 0.76, 0.9], [0.115, 0.1, 0.13]); // jowls
    blob(head, headSkin, [s * 0.13, 0.9, 0.84], [0.1, 0.035, 0.11]); // heavy brow bar
    blob(head, NOSTRIL, [s * 0.035, 0.75, 1.15], [0.024, 0.018, 0.012]); // nostrils
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.105, 0.06, 14), snout, {
    bone: head,
    at: [0, 0.745, 1.12],
    dir: [0, 0, 1],
  });

  // Ears: broad leaf shapes standing up and splayed out from the crown.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.14, 0.0],
        [0.15, 0.1],
        [0.07, 0.2, "sharp"],
        [0, 0.12],
      ],
      {
        at: [s * 0.13, 0.9, 0.86],
        x: [0, 0, -1],
        y: [s * 0.45, 1, 0],
        thickness: 0.03,
        bevel: 0.008,
        smoothing: 1,
        color: CHEEK,
        bone: head,
      },
    );
  }

  // Eyes as painted decals on the skull.
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, {
      at: [s * 0.14, 0.855, 0.92],
      dir: [s * 0.6, 0.1, 0.8],
      size: [0.095, 0.095],
      mirror: s < 0,
    });
  }

  // Tusks: ivory curving up from the lower jaw, capped in worn bronze, with gold studs.
  for (const s of [1, -1]) {
    const tusk = b.sweep(
      bezier([s * 0.075, 0.69, 0.98], [s * 0.13, 0.74, 1.08], [s * 0.1, 0.86, 1.1]),
      [0.03, 0.008],
      {
        bone: jaw,
        color: IVORY,
        bands: [
          [0.8, IVORY],
          [1, BRONZE],
        ],
        caps: { start: "round", end: "point" },
      },
    );
    b.along(tusk, 3, (at) => b.stick(new THREE.SphereGeometry(0.008, 6, 4), GOLD, at, { embed: 0.3 }), {
      from: 0.15,
      to: 0.7,
    });
  }

  // War scars: one across each flank.
  b.decal(body, scarTex, { at: [0.3, 0.68, 0.22], dir: [1, 0, 0], size: [0.2, 0.05] });
  b.decal(body, scarTex, { at: [-0.3, 0.62, -0.2], dir: [-1, 0, 0], size: [0.16, 0.04] });

  // Tail with a small bristle tuft.
  b.sweep(tail, [0.035, 0.014], { color: hide });
  const tailEnd = tail.at(0.98);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.spike(tailEnd, [Math.cos(a) * 0.35, Math.sin(a) * 0.35 + 0.4, -1], 0.08, 0.012, { color: maneColor });
  }

  // ---- bristles and coat cards ----
  const bodySkin = b.surface([body, neckMesh, skull, mandible]);
  const mane = bodySkin.scatter(900, {
    rng: rng(3),
    minDist: 0.024,
    filter: (h) => h.n.y > 0.5 && Math.abs(h.at.x) < 0.15 && h.at.z > -0.5 && h.at.z < 0.72,
  });
  b.cards(mane, bristleCard, {
    size: [0.045, 0.1],
    lean: 16,
    bend: 25,
    vary: 0.3,
    rng: rng(4),
    color: maneColor,
  });

  const coat = bodySkin.scatter(1500, {
    rng: rng(9),
    minDist: 0.027,
    filter: (h) => h.n.y < 0.5,
  });
  b.cards(coat, coatCard, { size: [0.035, 0.07], lean: 35, bend: 12, vary: 0.3, rng: rng(10), color: hide });

  const headHair = b.surface(skull).scatter(240, { rng: rng(12), minDist: 0.024 });
  b.cards(headHair, coatCard, { size: [0.03, 0.06], lean: 40, vary: 0.3, rng: rng(13), color: headSkin });

  const legHair = b.surface(legMeshes).scatter(420, {
    rng: rng(14),
    minDist: 0.018,
    filter: (h) => h.at.y > 0.12,
  });
  b.cards(legHair, coatCard, { size: [0.03, 0.065], lean: 40, vary: 0.3, rng: rng(15), color: legSkin });

  return b.root;
}
