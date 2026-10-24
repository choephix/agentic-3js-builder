```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, bezier, limb, paint, mix, noise, smoothstep, gradient, svg } from "agentic-3js-builder";

export const meta = {
  name: "Wendigo",
  description:
    "A starved, three-and-a-half metre folk-horror wendigo: an elk-skull head with towering antlers hung with twine, lichen, raven feathers and hex charms, a ribcage showing through grey hide with an ember glowing in the chest, long clawed arms and digitigrade legs, ochre ritual marks, and a tattered hide cape.",
};

type V = [number, number, number];
type Fr = ReturnType<typeof frame>;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- flat colours
const BONE = "#d9cfb6";
const CLAW = "#2b231d";
const TOOTH = "#e8e0c8";
const SOCKET = "#0d0908";
const TWINE = "#8c7347";
const GUM = "#4a1713";
const TONGUE = "#6b2a2e";
const SINEW = "#5a3b3a";
const EMBER = "#ff7a2a";
const CRATER = "#3a0f0c";

// ---------------------------------------------------------------- paints
const SKIN = paint((p, n) => {
  let c = mix("#74655a", "#463a34", smoothstep(0.35, 0.7, noise(p, 0.16, 2)));
  c = mix(c, "#5b4658", 0.55 * smoothstep(0.62, 0.8, noise(p, 0.07, 5)));
  c = mix(c, "#95867a", 0.3 * smoothstep(0.4, 1, n.y));
  c = mix(c, "#e2edf1", 0.85 * smoothstep(0.6, 0.95, n.y) * smoothstep(0.45, 0.65, noise(p, 0.08, 7)));
  const mud = smoothstep(0.35, 0.04, p.y);
  c = mix(c, "#2a211b", 0.85 * mud * (0.6 + 0.4 * noise(p, 0.05, 3)));
  return c;
});

const BONEP = paint((p, n) => {
  let c = mix("#d8cdb0", "#a99a78", smoothstep(0.3, 0.75, noise(p, 0.06, 12)));
  c = mix(c, "#5a4a30", 0.45 * smoothstep(0.58, 0.8, noise(p, 0.03, 14)));
  c = mix(c, "#7a6a50", 0.25 * smoothstep(0.2, -0.8, n.y));
  return c;
});

const SKULLP = paint((p, n) => {
  let c = mix("#e0d6ba", "#aa9b79", smoothstep(0.3, 0.75, noise(p, 0.05, 21)));
  c = mix(c, "#5c4a2e", 0.5 * smoothstep(0.6, 0.8, noise(p, 0.025, 23)));
  if (p.z > 0.93 && p.y < 2.8) {
    const k = ((((p.z - 0.93) / 0.07) % 1) + 1) % 1;
    if (k < 0.3) c = mix(c, "#8a2a18", 0.9);
  }
  c = mix(c, "#6e5d44", 0.3 * smoothstep(0.2, -0.8, n.y));
  return c;
});

const ANT_BASE = paint((p) => mix("#4b3a2c", "#6d5841", noise(p, 0.05, 4)));
const ANTLER = gradient(ANT_BASE, "#eadfc2", [0, 2.8, 0.6], [0, 3.75, 1.0]);

// ---------------------------------------------------------------- textures
const EYE = svg(
  `<svg viewBox="0 0 64 48">
    <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#e8fff6"/><stop offset="0.7" stop-color="#4ee0b8"/><stop offset="1" stop-color="#2aa88a" stop-opacity="0"/>
    </radialGradient></defs>
    <ellipse cx="32" cy="24" rx="30" ry="22" fill="url(#g)"/>
    <ellipse cx="32" cy="24" rx="18" ry="15" fill="#d9fff1"/>
    <ellipse cx="32" cy="24" rx="5" ry="13" fill="#0a1512"/>
  </svg>`,
  { size: 256 },
);

const FUR = svg(
  `<svg viewBox="0 0 32 64">
    <defs><linearGradient id="f" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="64">
      <stop offset="0" stop-color="#9a8b76"/><stop offset="0.5" stop-color="#5a4b3e"/><stop offset="1" stop-color="#2d241f"/>
    </linearGradient></defs>
    <path d="M3 64 Q1 36 8 5 Q11 34 12 64Z" fill="url(#f)"/>
    <path d="M10 64 Q10 30 17 0 Q19 32 21 64Z" fill="url(#f)"/>
    <path d="M18 64 Q20 34 26 9 Q26 38 29 64Z" fill="url(#f)"/>
    <path d="M13 64 Q15 40 22 24 Q20 46 24 64Z" fill="#6f604e"/>
  </svg>`,
  { size: 128 },
);

const TATTER = svg(
  `<svg viewBox="0 0 40 80">
    <defs><linearGradient id="h" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a4a3a"/><stop offset="1" stop-color="#3a2e26"/>
    </linearGradient></defs>
    <path d="M2 80 H38 L36 50 L39 28 L33 16 L35 0 L27 14 L24 0 L19 18 L13 2 L10 22 L4 10 L5 40 L1 58Z" fill="url(#h)" stroke="#1d1613" stroke-width="2" stroke-linejoin="round"/>
    <path d="M8 76 V12" stroke="#cbb68a" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
    <ellipse cx="26" cy="44" rx="8" ry="12" fill="#5b1a14" opacity="0.45"/>
    <circle cx="20" cy="70" r="3" fill="#d9cfb6"/>
  </svg>`,
  { size: 160 },
);

const SIGIL_PATHS = `<circle cx="32" cy="32" r="28"/><path d="M32 54V20M32 44L21 33L19 17M21 33L11 30M32 34L43 23L45 8M43 23L53 20M24 54L32 59L40 54M32 20L28 12M32 20L36 12"/><circle cx="14" cy="47" r="1.5"/><circle cx="50" cy="47" r="1.5"/>`;
const SIGIL = svg(
  `<svg viewBox="0 0 64 64">
    <g fill="none" stroke="#190d09" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${SIGIL_PATHS}</g>
    <g fill="none" stroke="#8c2a1a" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">${SIGIL_PATHS}</g>
  </svg>`,
  { size: 256 },
);

const HAND = svg(
  `<svg viewBox="0 0 52 60">
    <g fill="#8c2a1a" stroke="#190d09" stroke-width="1.5" stroke-linejoin="round">
      <path d="M12 58 L10 34 Q8 30 12 28 L13 12 Q14 8 17 12 L18 26 L20 6 Q22 2 24 6 L25 26 L28 8 Q30 4 32 8 L32 28 L36 14 Q38 11 40 15 L38 36 L44 28 Q47 26 47 30 L40 54 Q38 58 34 58Z"/>
    </g>
  </svg>`,
  { size: 128 },
);

const HEX = svg(
  `<svg viewBox="0 0 48 72">
    <path d="M24 72 V56" stroke="#8c7347" stroke-width="3" fill="none"/>
    <circle cx="24" cy="36" r="19" fill="none" stroke="#2b1f14" stroke-width="7"/>
    <circle cx="24" cy="36" r="19" fill="none" stroke="#c7a85a" stroke-width="4"/>
    <g stroke="#2b1f14" stroke-width="5.5" stroke-linecap="round"><path d="M24 17V55M7.5 26.5L40.5 45.5M7.5 45.5L40.5 26.5"/></g>
    <g stroke="#c7a85a" stroke-width="3" stroke-linecap="round"><path d="M24 17V55M7.5 26.5L40.5 45.5M7.5 45.5L40.5 26.5"/></g>
    <circle cx="24" cy="36" r="4.5" fill="#8c2a1a"/>
    <g stroke="#c7a85a" stroke-width="3" stroke-linecap="round"><path d="M16 15L14 2M24 14V0M32 15L34 2"/></g>
  </svg>`,
  { size: 192 },
);

const FROST = svg(
  `<svg viewBox="0 0 32 48">
    <path d="M16 48 L9 20 L16 0 L23 20Z" fill="#e9f7ff" stroke="#9fc8da" stroke-width="1"/>
    <path d="M8 48 L1 28 L6 13 L12 30Z" fill="#bfe3f2"/>
    <path d="M26 48 L21 30 L30 15 L31 34Z" fill="#cdeaf6"/>
    <path d="M16 46 L16 8" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
  </svg>`,
  { size: 128 },
);

const FEATHER = svg(
  `<svg viewBox="0 0 24 64">
    <path d="M12 2 C23 14 24 40 12 60 C0 40 1 14 12 2Z" fill="#1b1822"/>
    <path d="M12 6 C20 20 20 40 12 56" stroke="#4a4968" stroke-width="2" fill="none"/>
    <path d="M12 2 V64" stroke="#0e0c12" stroke-width="2.4"/>
    <path d="M4 22 L9 26 M3 34 L9 37 M20 22 L15 26 M21 34 L15 37" stroke="#0e0c12" stroke-width="1.4"/>
  </svg>`,
  { size: 128 },
);

const LICHEN = svg(
  `<svg viewBox="0 0 40 48">
    <path d="M5 48 Q1 26 7 3 Q12 26 12 48Z" fill="#6f7f52"/>
    <path d="M12 48 Q10 22 16 0 Q21 24 21 48Z" fill="#9aa87a"/>
    <path d="M20 48 Q20 28 26 6 Q29 28 29 48Z" fill="#5f6e49"/>
    <path d="M28 48 Q30 30 35 12 Q37 32 36 48Z" fill="#b9c29a"/>
    <path d="M16 48 Q15 34 20 20 Q22 36 22 48Z" fill="#d3d9b6"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- glow helper
const glowCache = new Map<THREE.Material, Map<number, THREE.MeshStandardMaterial>>();
function glow<T>(target: T, strength = 1): T {
  const t = target as any;
  const meshes: THREE.Mesh[] = Array.isArray(t) ? t : t.mesh ? [t.mesh] : t.meshes ? t.meshes : [t];
  for (const mesh of meshes) {
    const m = mesh.material as THREE.MeshStandardMaterial;
    let byS = glowCache.get(m);
    if (!byS) glowCache.set(m, (byS = new Map()));
    let c = byS.get(strength);
    if (!c) {
      c = m.clone();
      c.emissive.copy(m.color);
      c.emissiveMap = m.map;
      c.emissiveIntensity = strength;
      byS.set(strength, c);
    }
    mesh.material = c;
  }
  return target;
}

export default function build() {
  const b = createBuilder({ name: "wendigo", paintSize: 2048 });
  const R = rng(13);

  // ================================================================ skeleton
  const hips = b.joint("hips", { at: [0, 1.38, -0.1], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.45, -0.08],
      [0, 1.75, -0.02],
      [0, 2.05, 0.1],
      [0, 2.3, 0.27],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.3, 0.27],
      [0, 2.42, 0.43],
      [0, 2.52, 0.6],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.52, 0.6], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.55, 0.72], dir: [0, -0.08, 1], role: "jaw" });

  // ================================================================ helpers
  const onHead = (geo: THREE.BufferGeometry, color: any, at: V, opts: any = {}) =>
    b.part(geo, color, { bone: head, at, ...opts });

  const wrap = (
    pt: THREE.Vector3,
    dir: THREE.Vector3,
    r: number,
    thick: number,
    color: any,
    bone: ReturnType<typeof b.joint>,
  ) => {
    const ring = b.ring(frame(pt, dir), { count: 8, radius: r });
    b.sweep(catmull(ring.items, { closed: true }), thick, { color, bone, sides: 5, smooth: false });
  };

  // ================================================================ torso
  const torso = b.loft(
    [
      { at: [0, 1.32, -0.11], w: 0.3, h: 0.22 },
      { at: [0, 1.45, -0.08], w: 0.34, h: 0.23 },
      { at: [0, 1.62, -0.04], w: 0.24, h: 0.18 },
      { at: [0, 1.8, 0.0], w: 0.3, h: 0.22 },
      { at: [0, 2.0, 0.08], w: 0.4, h: 0.28 },
      { at: [0, 2.18, 0.19], w: 0.44, h: 0.27 },
      { at: [0, 2.3, 0.27], w: 0.4, h: 0.2 },
    ],
    { bone: [spine, hips], color: SKIN },
  );
  const skin = b.surface(torso);

  // ribs
  for (const sg of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const t = 0.4 + i * 0.07;
      const pts = [18, 58, 100, 138, 166].map((d) => torso.at(t - 0.05 * (d / 180), sg * d, 0.028).at);
      b.sweep(catmull(pts), [0.019, 0.009], {
        bone: spine.joints[i < 4 ? 1 : 2],
        color: BONEP,
        sides: 5,
        smooth: false,
      });
    }
  }
  // sternum, split around the ember
  const sternum = torso.line(180, 0.03);
  for (const [a, c] of [
    [0.4, 0.58],
    [0.71, 0.86],
  ]) {
    b.sweep(sternum.slice(a, c), 0.016, { bone: spine.joints[1], color: BONEP, sides: 5, smooth: false });
  }
  // ember in the chest
  const heart = torso.at(0.645, 180, 0);
  b.stick(new THREE.CylinderGeometry(0.095, 0.11, 0.03, 8), CRATER, heart, { embed: 0.4 });
  glow(b.stick(new THREE.SphereGeometry(0.06, 8, 6), EMBER, heart.moved([0, 0.012, 0]), { embed: 0.3 }), 2);

  // vertebrae down the back
  b.along(
    torso,
    9,
    (at) => {
      b.spike(at, at, 0.075, 0.026, { color: BONEP, sides: 5, smooth: false });
    },
    { from: 0.18, to: 0.96 },
  );
  // shoulder blades
  for (const sg of [1, -1]) {
    b.stick(new THREE.BoxGeometry(0.13, 0.035, 0.17), BONEP, torso.at(0.86, sg * 22), { embed: 0.35 });
  }
  // hip bones
  for (const sg of [1, -1]) {
    b.capsule([sg * 0.12, 1.52, -0.13], [sg * 0.22, 1.4, 0.0], 0.028, { color: BONEP, bone: hips });
  }
  // collarbones
  for (const sg of [1, -1]) {
    b.rod([sg * 0.02, 2.27, 0.38], [sg * 0.22, 2.31, 0.3], 0.016, { color: BONEP, bone: spine.joints[2] });
  }

  // ritual sigil on the belly, handprints on the flanks
  b.decal(torso, SIGIL, { at: [0, 1.62, 0.3], dir: [0, 0.1, 1], size: [0.27, 0.27] });
  for (const sg of [1, -1]) {
    b.decal(torso, HAND, { at: [sg * 0.15, 1.7, -0.02], dir: [sg, 0, 0.1], size: [0.1, 0.115] });
  }

  // belt, rags and cape
  const belt = skin.loop(hips, { lift: 0.03 });
  b.sweep(belt, 0.02, { color: TWINE, bone: hips, sides: 5, smooth: false });
  const rags: Fr[] = [];
  for (let i = 0; i < 20; i++) rags.push(frame(belt.at(i / 20), [0, 1, 0]));
  b.cards(rags, TATTER, { size: [0.1, 0.42], lean: 180, flow: [0, 0, 1], bone: hips, vary: 0.3, rng: R, spin: 8 });
  const charms: Fr[] = [];
  for (const t of [0.04, 0.3, 0.62, 0.86]) charms.push(frame(belt.at(t), [0, 1, 0]));
  b.cards(charms, HEX, { size: [0.1, 0.15], lean: 180, flow: [0, 0, 1], bone: hips });

  const capeLoop = skin.loop([0, 2.2, 0.2], { dir: [0, 1, 0.3], lift: 0.02 });
  const cape: Fr[] = [];
  for (let i = 0; i < 26; i++) {
    const p = capeLoop.at(i / 26);
    if (p.z < 0.22) cape.push(frame(p, [0, 1, 0]));
  }
  b.cards(cape, TATTER, {
    size: [0.14, 0.62],
    lean: 165,
    flow: [0, 0, -1],
    bone: spine.joints[2],
    vary: 0.35,
    rng: R,
    spin: 6,
  });
  b.cards(
    skin.scatter(140, { rng: R, minDist: 0.04, filter: (h) => h.at.y > 2.0 }),
    FUR,
    { size: [0.07, 0.2], lean: 60, bend: 20, vary: 0.35, rng: R, spin: 15 },
  );
  b.cards(
    skin.scatter(40, { rng: R, minDist: 0.06, filter: (h) => h.at.y > 2.1 && h.n.y > 0.5 }),
    FROST,
    { size: [0.04, 0.09], cross: true, vary: 0.3, rng: R },
  );

  // ================================================================ neck
  b.sweep(neck, [0.07, 0.055], { color: SKIN });
  for (const sg of [1, -1]) {
    b.rod([sg * 0.03, 2.5, 0.6], [sg * 0.11, 2.28, 0.3], 0.015, { color: SINEW, bone: neck.joints[0] });
  }
  const nk = neck.at(0.3);
  const collar = b.ring(nk, { count: 14, radius: 0.088 });
  b.sweep(catmull(collar.items, { closed: true }), 0.006, { color: TWINE, bone: neck.joints[0], sides: 5 });
  for (const it of collar.items) {
    b.part(new THREE.ConeGeometry(0.014, 0.06, 5), TOOTH, {
      bone: neck.joints[0],
      at: it.at.clone().add(v3(0, -0.03, 0)),
      dir: [0, -1, 0],
    });
  }
  b.cards(b.ring(neck.at(0.12), { count: 12, radius: 0.07 }).items, FUR, {
    size: [0.08, 0.2],
    lean: 70,
    flow: [0, -1, -0.1],
    vary: 0.3,
    rng: R,
  });

  // ================================================================ head
  onHead(new THREE.SphereGeometry(1, 10, 8), SKULLP, [0, 2.63, 0.72], { scale: [0.105, 0.105, 0.14] });
  const cranium = b.surface(head).nearest([0, 2.7, 0.8]); // keeps a surface query warm for the decal below
  void cranium;
  const skull = onHead(new THREE.SphereGeometry(1, 8, 6), SKULLP, [0, 2.65, 0.74], { scale: [0.09, 0.09, 0.12] });

  const snout = b.frustumBox([0, 2.62, 0.82], [0, 2.54, 1.24], [0.15, 0.12], [0.07, 0.06], {
    bone: head,
    color: SKULLP,
  });
  const bottomY = (z: number) => 2.56 - 0.1186 * (z - 0.82);
  const halfW = (z: number) => 0.075 - 0.0893 * (z - 0.82);
  b.frustumBox([0, bottomY(0.85) - 0.002, 0.85], [0, bottomY(1.22) - 0.002, 1.22], [0.13, 0.012], [0.07, 0.012], {
    bone: head,
    color: GUM,
  });
  for (const sg of [1, -1]) {
    onHead(new THREE.SphereGeometry(1, 6, 4), SOCKET, [sg * 0.02, 2.545, 1.235], { scale: [0.014, 0.01, 0.012] });
  }

  // forehead mark and snout handprint
  b.decal(skull, SIGIL, { at: [0, 2.72, 0.83], dir: [0, 0.6, 0.8], size: [0.07, 0.07] });
  b.decal(snout, HAND, { at: [0.065, 2.6, 1.0], dir: [1, 0, 0.1], size: [0.055, 0.065] });

  // upper teeth
  for (const sg of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const z = 0.93 + i * 0.04;
      const fang = i === 4;
      const len = fang ? 0.12 : 0.03 + R() * 0.015;
      onHead(
        new THREE.ConeGeometry(fang ? 0.016 : 0.011, len, 5),
        TOOTH,
        [sg * (halfW(z) - 0.014), bottomY(z) - len / 2 + 0.006, z],
        { dir: fang ? [sg * 0.1, -1, -0.15] : [0, -1, 0] },
      );
    }
  }

  // eyes, brows, cheeks, burrs
  for (const sg of [1, -1]) {
    const C = v3(sg * 0.078, 2.67, 0.8);
    const dir = v3(sg * 0.45, 0, 1).normalize();
    const socket = onHead(new THREE.SphereGeometry(0.05, 8, 6), SOCKET, [C.x, C.y, C.z]);
    const at = C.clone().addScaledVector(dir, 0.046);
    glow(b.decal(socket, EYE, { at, dir, size: [0.075, 0.056], lift: 0.002 }), 1.7);
    const rimAt = C.clone().addScaledVector(dir, 0.028);
    onHead(new THREE.TorusGeometry(0.052, 0.012, 5, 9), BONEP, [rimAt.x, rimAt.y, rimAt.z], { dir, axis: "z" });
    b.capsule([sg * 0.02, 2.735, 0.8], [sg * 0.115, 2.715, 0.75], 0.02, { color: SKULLP, bone: head });
    b.rod([sg * 0.095, 2.64, 0.78], [sg * 0.075, 2.56, 0.92], 0.014, { color: SKULLP, bone: head });
    onHead(new THREE.SphereGeometry(0.04, 6, 5), BONEP, [sg * 0.07, 2.74, 0.64]);
    // ears
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.06, 0.05],
        [0.13, 0.052],
        [0.2, 0.03],
        [0.255, 0.005, "sharp"],
        [0.215, -0.01],
        [0.2, -0.03],
        [0.13, -0.045],
        [0.06, -0.045],
      ],
      {
        at: [sg * 0.095, 2.69, 0.67],
        x: [sg * 0.9, -0.2, -0.3],
        y: [sg * 0.2, 0.9, 0],
        thickness: [0.012, 0.004],
        color: SKIN,
        bone: head,
      },
    );
  }

  // lower jaw
  for (const sg of [1, -1]) {
    const mp = catmull([
      [sg * 0.075, 2.555, 0.74],
      [sg * 0.05, 2.5, 0.98],
      [sg * 0.022, 2.475, 1.17],
    ]);
    b.sweep(mp, [0.024, 0.012], { bone: jaw, color: SKULLP, sides: 6, smooth: false });
    b.part(new THREE.SphereGeometry(0.032, 6, 5), SKULLP, { bone: jaw, at: [sg * 0.078, 2.552, 0.745] });
    for (let i = 0; i < 6; i++) {
      const t = 0.38 + i * 0.11;
      const p = mp.at(t);
      const fang = i === 5;
      const len = fang ? 0.09 : 0.028 + R() * 0.012;
      b.part(new THREE.ConeGeometry(fang ? 0.014 : 0.01, len, 5), TOOTH, {
        bone: jaw,
        at: [p.x - sg * 0.008, p.y + 0.014 + len / 2 - 0.004, p.z],
        dir: fang ? [sg * 0.05, 1, 0.2] : [0, 1, 0],
      });
    }
  }
  b.rod([-0.022, 2.475, 1.17], [0.022, 2.475, 1.17], 0.013, { color: SKULLP, bone: jaw });
  b.sweep(
    catmull([
      [0, 2.5, 0.86],
      [0, 2.47, 1.1],
      [0, 2.4, 1.27],
    ]),
    () => [0.022, 0.009],
    { bone: jaw, color: TONGUE, sides: 6 },
  );

  // hair
  const hairF: Fr[] = [];
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.02;
    hairF.push(frame([x, 2.72 - Math.abs(x) * 0.4, 0.62], [0, 1, 0]));
  }
  b.cards(hairF, FUR, { size: [0.1, 0.55], lean: 140, flow: [0, 0, -1], bone: head, vary: 0.3, rng: R, bend: 25 });

  // ================================================================ antlers
  const lichenF: Fr[] = [];
  const featherF: Fr[] = [];
  const charmF: Fr[] = [];
  const frostF: Fr[] = [];

  const antler = (s: number) => {
    const P: V[] = (
      [
        [0.07, 2.74, 0.64],
        [0.17, 2.92, 0.58],
        [0.3, 3.12, 0.6],
        [0.4, 3.36, 0.7],
        [0.38, 3.6, 0.86],
        [0.27, 3.76, 1.02],
      ] as V[]
    ).map(([x, y, z]) => [s * x, y, z] as V);
    const beam = catmull(P);
    b.sweep(beam, [0.034, 0.012], {
      bone: head,
      color: ANTLER,
      sides: 6,
      smooth: false,
      caps: { start: "flat", end: "point" },
    });
    const mk = (p0: THREE.Vector3, d: V, len: number, r0: number) => {
      const start = p0.clone();
      const dir = v3(s * d[0], d[1], d[2]).normalize();
      const tip = start.clone().addScaledVector(dir, len);
      const ctrl = start.clone().addScaledVector(dir, len * 0.5).add(v3(0, len * 0.16, 0));
      const path = bezier(start, ctrl, tip);
      b.sweep(path, [r0, 0.004], {
        bone: head,
        color: ANTLER,
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "point" },
      });
      return path;
    };
    const tines: [number, V, number, number][] = [
      [0.1, [0.1, 0.15, 1], 0.32, 0.022],
      [0.26, [0.8, 0.55, 0.4], 0.36, 0.02],
      [0.42, [0.7, 0.7, -0.35], 0.4, 0.019],
      [0.58, [-0.35, 0.85, 0.55], 0.36, 0.017],
      [0.74, [0.5, 0.85, 0.2], 0.3, 0.014],
    ];
    for (const [t, d, len, r] of tines) {
      const path = mk(beam.at(t), d, len, r);
      if (len > 0.34) {
        mk(path.at(0.55), [d[0] * 0.5, 1, d[2] * 0.5 + 0.2], len * 0.5, r * 0.55);
        mk(path.at(0.8), [-d[0] * 0.4, 0.9, d[2] * 0.6], len * 0.4, r * 0.45);
      }
    }
    mk(beam.at(0.97), [0.3, 0.4, 1], 0.18, 0.011);
    mk(beam.at(0.97), [-0.6, 0.6, 0.6], 0.16, 0.01);

    wrap(beam.at(0.2), beam.tangentAt(0.2), 0.042, 0.007, TWINE, head);
    wrap(beam.at(0.52), beam.tangentAt(0.52), 0.032, 0.007, TWINE, head);
    for (const t of [0.34, 0.5, 0.66, 0.82]) lichenF.push(frame(beam.at(t), [0, 1, 0]));
    for (const t of [0.4, 0.72]) featherF.push(frame(beam.at(t), [0, 1, 0]));
    charmF.push(frame(beam.at(s > 0 ? 0.58 : 0.46), [0, 1, 0]));
    for (const t of [0.3, 0.5, 0.7, 0.9]) frostF.push(frame(beam.at(t), [0, 1, 0]));
  };
  antler(1);
  antler(-1);
  b.cards(lichenF, LICHEN, { size: [0.1, 0.26], lean: 180, flow: [0, 0, 1], bone: head, vary: 0.3, rng: R });
  b.cards(featherF, FEATHER, { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1], bone: head, vary: 0.2, rng: R });
  b.cards(charmF, HEX, { size: [0.12, 0.18], lean: 180, flow: [0, 0, 1], bone: head });
  b.cards(frostF, FROST, { size: [0.05, 0.09], cross: true, bone: head, vary: 0.3, rng: R });

  // ================================================================ arms
  const ribbonF: Fr[] = [];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh: V = [s * 0.24, 2.2, 0.24];
    const el: V = [s * 0.9, 2.1, 0.18];
    const wr: V = [s * 1.55, 1.96, 0.3];
    const arm = b.chain(`arm${sd}`, catmull([sh, el, wr]), {
      parent: spine.joints[2],
      names: [`shoulder${sd}`, `elbow${sd}`, `hand${sd}`],
      role: "arm",
    });
    const hand = arm.tip!;
    const armTube = b.sweep(arm, [0.07, 0.058, 0.046, 0.044, 0.04, 0.034, 0.03], {
      color: SKIN,
      sides: 6,
      smooth: false,
    });
    b.part(new THREE.SphereGeometry(0.07, 7, 5), SKIN, { bone: arm.joints[0], at: [s * 0.26, 2.24, 0.24] });
    b.spike([s * 0.3, 2.3, 0.2], [s * 0.4, 0.8, -0.2], 0.14, 0.03, { bone: arm.joints[0], color: BONEP, sides: 5 });
    b.spike(el, [0, 0.3, -1], 0.13, 0.03, { bone: arm.joints[1], color: BONEP, sides: 5 });

    const palmEnd: V = [s * 1.69, 1.94, 0.3];
    b.sweep([wr, palmEnd], () => [0.045, 0.016], { bone: hand, color: SKIN });

    const zs = [0.06, 0.02, -0.02, -0.06];
    const Ls = [0.19, 0.22, 0.21, 0.16];
    zs.forEach((z, i) => {
      const base = v3(s * 1.69, 1.94, 0.3 + z * 0.9);
      const d = v3(s, -0.1, z * 2.4).normalize();
      const pts = [base.clone()];
      const segs = [0.42, 0.33, 0.25];
      let last = d.clone();
      segs.forEach((f, j) => {
        last = d.clone().add(v3(0, -0.16 * j, 0)).normalize();
        pts.push(pts[pts.length - 1].clone().addScaledVector(last, Ls[i] * f));
      });
      const ch = b.chain(`finger${sd}${i + 1}`, pts, {
        parent: hand,
        names: [`finger${sd}${i + 1}a`, `finger${sd}${i + 1}b`, `finger${sd}${i + 1}c`],
        role: "digit",
      });
      b.sweep(ch, [0.02, 0.007], { color: SKIN, sides: 5, smooth: false });
      b.part(new THREE.SphereGeometry(0.017, 5, 4), BONEP, { bone: ch.joints[1], at: pts[1] });
      b.spike(pts[3], last.clone().add(v3(0, -0.6, 0)), 0.075, 0.011, {
        bone: ch.joints[2],
        color: CLAW,
        sides: 5,
      });
    });
    // thumb
    {
      const base = v3(s * 1.66, 1.95, 0.375);
      const d = v3(s * 0.35, -0.12, 1).normalize();
      const p1 = base.clone().addScaledVector(d, 0.09);
      const p2 = p1.clone().addScaledVector(d.clone().add(v3(0, -0.2, 0)).normalize(), 0.08);
      const th = b.chain(`thumb${sd}`, [base, p1, p2], {
        parent: hand,
        names: [`thumb${sd}a`, `thumb${sd}b`],
        role: "digit",
      });
      b.sweep(th, [0.022, 0.01], { color: SKIN, sides: 5, smooth: false });
      b.spike(p2, d.clone().add(v3(0, -0.7, 0)), 0.065, 0.011, { bone: th.joints[1], color: CLAW, sides: 5 });
    }
    // cuffs and ribbons
    for (const t of [0.88, 0.92, 0.96]) {
      const cp = arm.at(t);
      wrap(cp.at, cp.tangent, 0.045, 0.007, TWINE, arm.joints[1]);
    }
    for (const t of [0.58, 0.68, 0.78, 0.86]) ribbonF.push(frame(armTube.at(t, 180).at, [0, 1, 0]));
  }
  b.cards(ribbonF, TATTER, { size: [0.07, 0.38], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R, spin: 8 });

  // ================================================================ legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hipP: V = [s * 0.14, 1.36, -0.08];
    const pts = limb(hipP, [s * 0.2, 0.026, 0.14], [0.56, 0.56, 0.46, 0.24], [[0, 0, 1], [0, 0, -1]], {
      sole: [0, 0, 1],
    });
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `ankle${sd}`, `foot${sd}`],
      role: "leg",
      contact: [s * 0.2, 0, 0.2],
    });
    b.sweep(leg, [0.085, 0.075, 0.06, 0.062, 0.05, 0.042, 0.034, 0.032, 0.03], {
      color: SKIN,
      sides: 6,
      smooth: false,
    });
    b.part(new THREE.SphereGeometry(0.075, 7, 5), SKIN, { bone: leg.joints[0], at: hipP });
    b.part(new THREE.SphereGeometry(0.062, 7, 5), BONEP, { bone: leg.joints[1], at: pts[1] });
    b.spike(pts[1], [0, 0.2, 1], 0.1, 0.035, { bone: leg.joints[1], color: BONEP, sides: 5 });
    b.spike(pts[2], [0, 0.3, -1], 0.12, 0.025, { bone: leg.joints[2], color: BONEP, sides: 5 });
    for (const t of [0.8, 0.84]) {
      const cp = leg.at(t);
      wrap(cp.at, cp.tangent, 0.045, 0.007, TWINE, leg.joints[3]);
    }
    // foot
    const foot = leg.tip!;
    for (const k of [-1, 0, 1]) {
      const base: V = [s * 0.2 + k * 0.015, 0.026, 0.06];
      const tip: V = [s * 0.2 + k * 0.075, 0.02, 0.27 + (k === 0 ? 0.03 : 0)];
      b.capsule(base, tip, [0.024, 0.014], { bone: foot, color: SKIN, sides: 6, smooth: false });
      b.spike(tip, [k * 0.2, -0.35, 1], 0.07, 0.014, { bone: foot, color: CLAW, sides: 5 });
    }
    b.spike([s * 0.2, 0.05, -0.12], [0, 0.3, -1], 0.09, 0.016, { bone: foot, color: CLAW, sides: 5 });
  }

  // open the mouth a little
  b.pose(jaw, { axis: [1, 0, 0], deg: 16 });

  return b.root;
}
```