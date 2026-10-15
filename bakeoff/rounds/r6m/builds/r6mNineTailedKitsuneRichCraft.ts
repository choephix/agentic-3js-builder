import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  limb,
  gradient,
  countershade,
  stripes,
  paint,
  mix,
  noise,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A white spirit fox with red markings, nine fanned tails tipped with foxfire, standing on a mossy shrine dais with glowing runes and stone lanterns.",
};

const Y0 = 0.12; // dais height
type V = [number, number, number];
const P = (x: number, y: number, z: number): V => [x, y + Y0, z];
const HEADY = 0.86;
const HEADZ = 0.56;
const hp = (x: number, y: number, z: number): V => [x, HEADY + Y0 + y, HEADZ + z];

const WHITE = "#fbf6ec";
const CREAM = "#eadcc4";
const RED = "#d8362b";
const GOLD = "#e9b84a";
const INK = "#2a1530";
const FLAME_BLUE = "#7fe6ff";

// ---------------------------------------------------------------- textures
const EYE = svg(
  `<svg viewBox="0 0 60 40">
  <path d="M2 27 Q22 3 58 11 Q40 37 2 27Z" fill="#ffb52e" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M6 24 Q24 12 52 14 Q40 24 6 24Z" fill="#e8741c" opacity="0.7"/>
  <ellipse cx="31" cy="21" rx="4" ry="9" fill="${INK}"/>
  <circle cx="27" cy="17" r="3" fill="#ffffff"/>
  <circle cx="35" cy="26" r="1.6" fill="#ffffff"/>
  <path d="M0 25 Q22 -1 59 7" stroke="#e0302a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const CHEEK = svg(
  `<svg viewBox="0 0 60 40">
  <path d="M2 6 Q30 4 58 18" stroke="${RED}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M4 18 Q30 18 56 32" stroke="${RED}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M10 30 Q28 30 44 38" stroke="${RED}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const BROW = svg(
  `<svg viewBox="0 0 40 40">
  <path d="M20 2 L35 20 L20 38 L5 20Z" fill="${RED}" stroke="${INK}" stroke-width="2"/>
  <circle cx="20" cy="20" r="6" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/>
  </svg>`,
  { size: 128 },
);
function runeSvg() {
  let star = "";
  const pts: string[] = [];
  for (let i = 0; i < 9; i++) {
    const a = ((i * 4) / 9) * Math.PI * 2;
    pts.push(`${(100 + 58 * Math.sin(a)).toFixed(1)},${(100 - 58 * Math.cos(a)).toFixed(1)}`);
  }
  star = `<polygon points="${pts.join(" ")}" fill="none" stroke="#7fe6ff" stroke-width="2.2"/>`;
  let ticks = "";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r0 = i % 4 === 0 ? 70 : 76;
    ticks += `<path d="M${(100 + r0 * Math.sin(a)).toFixed(1)} ${(100 - r0 * Math.cos(a)).toFixed(1)} L${(100 + 86 * Math.sin(a)).toFixed(1)} ${(100 - 86 * Math.cos(a)).toFixed(1)}" stroke="#7fe6ff" stroke-width="2.4"/>`;
  }
  let flames = "";
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    flames += `<circle cx="${(100 + 64 * Math.sin(a)).toFixed(1)}" cy="${(100 - 64 * Math.cos(a)).toFixed(1)}" r="4" fill="#b58cff"/>`;
  }
  return `<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="96" fill="none" stroke="#7fe6ff" stroke-width="3"/>
  <circle cx="100" cy="100" r="88" fill="none" stroke="#7fe6ff" stroke-width="1.5"/>
  <circle cx="100" cy="100" r="40" fill="none" stroke="#b58cff" stroke-width="2.4"/>
  ${star}${ticks}${flames}
  <circle cx="100" cy="100" r="9" fill="#7fe6ff"/></svg>`;
}
const RUNES = svg(runeSvg(), { size: 512 });
function flameTex(a: string, b2: string, c: string) {
  return svg(
    `<svg viewBox="0 0 40 64"><defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b2}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
    <path d="M20 2 C26 18 38 28 36 44 C34 58 26 62 20 62 C14 62 6 58 4 44 C2 32 12 24 14 14 C16 20 18 14 20 2Z" fill="url(#f)"/>
    <path d="M20 26 C24 34 29 40 28 48 C27 55 23 58 20 58 C17 58 13 55 12 48 C11 40 17 34 20 26Z" fill="#ffffff" opacity="0.85"/>
    </svg>`,
    { size: 128 },
  );
}
const FLAME_A = flameTex("#3a8cff", "#7fe6ff", "#d8fbff");
const FLAME_B = flameTex("#7a4cff", "#b58cff", "#f0e0ff");

// ---------------------------------------------------------------- paints
const BACKSTRIPE = stripes(WHITE, RED, { size: 0.11, width: 0.3, wobble: 0.6, seed: 4 });
const BELLY = countershade(WHITE, CREAM, { level: -0.1 });
const COAT = paint((_p, n) => (n.y > 0.62 ? BACKSTRIPE : BELLY));
const STONE = paint((p, n) => {
  const base = mix("#7f869c", "#a8aec2", noise(p, 0.15, 2));
  const moss = smoothstep(0.55, 0.95, n.y) * smoothstep(0.45, 0.7, noise(p, 0.12, 5)) * 0.8;
  return mix(base, "#5f9a58", moss);
});

export default function build() {
  const b = createBuilder({ name: "kitsune" });

  const hips = b.joint("hips", { at: P(0, 0.52, -0.3) });

  // helper: a cone of fluff rooted at base pointing along dir
  const fluff = (base: V, dir: V, len: number, r: number, color: any, bone: any, seg = 5) => {
    const d = new THREE.Vector3(...dir).normalize();
    const at = new THREE.Vector3(...base).addScaledVector(d, len * 0.48);
    return b.part(new THREE.ConeGeometry(r, len, seg), color, { bone, at, dir: d, flat: true });
  };

  // ---------------------------------------------------------------- dais
  b.lathe(
    [
      [0, 0],
      [0.95, 0],
      [0.95, 0.05],
      [0.86, 0.075],
      [0.86, Y0],
      [0, Y0],
    ],
    { at: [0, 0, 0], bone: hips, segments: 14, color: STONE },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.78, 36), "#ffffff", {
      at: [0, Y0 + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNES,
      bone: hips,
    }),
    1.1,
  );
  const ringPts: V[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    ringPts.push([0.88 * Math.sin(a), Y0 + 0.012, 0.88 * Math.cos(a)]);
  }
  glow(b.sweep(catmull(ringPts, { closed: true }), 0.01, { color: FLAME_BLUE, bone: hips }), 1.2);

  // stone lanterns
  const lantern = (x: number, z: number) => {
    const y = Y0;
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.04, 6), STONE, { at: [x, y + 0.02, z], bone: hips });
    b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.2, 6), STONE, { at: [x, y + 0.14, z], bone: hips });
    b.part(new THREE.BoxGeometry(0.2, 0.03, 0.2), STONE, { at: [x, y + 0.255, z], bone: hips });
    glow(b.part(new THREE.BoxGeometry(0.12, 0.12, 0.12), "#ffd27a", { at: [x, y + 0.33, z], bone: hips }), 1.4);
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        b.part(new THREE.BoxGeometry(0.025, 0.12, 0.025), STONE, {
          at: [x + sx * 0.085, y + 0.33, z + sz * 0.085],
          bone: hips,
        });
    b.part(new THREE.BoxGeometry(0.24, 0.03, 0.24), STONE, { at: [x, y + 0.405, z], bone: hips });
    b.part(new THREE.ConeGeometry(0.19, 0.12, 4), "#6c7390", {
      at: [x, y + 0.48, z],
      bone: hips,
      rotation: [0, 45, 0],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, { at: [x, y + 0.55, z], bone: hips });
  };
  lantern(0.7, 0.35);
  lantern(-0.7, 0.35);

  // ---------------------------------------------------------------- body
  const spine = b.chain(
    "spine",
    catmull([P(0, 0.5, -0.42), P(0, 0.52, -0.2), P(0, 0.58, 0.1), P(0, 0.62, 0.38)]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  b.sweep(spine, [0.12, 0.17, 0.19, 0.15], { color: COAT });

  const neck = b.chain("neck", catmull([P(0, 0.62, 0.38), P(0, 0.74, 0.48), P(0, HEADY, HEADZ)]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const neckTube = b.sweep(neck, [0.11, 0.08], { color: WHITE });

  const head = b.joint("head", { parent: neck.joints[1], at: P(0, HEADY, HEADZ), dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.05, 0.05),
    aim: hp(0, -0.075, 0.25),
    role: "jaw",
  });

  // ruff, collar, bell
  b.ring(neck.joints[0], { count: 9, radius: 0.12, tilt: -50 }, (item) =>
    b.spike(item, item, 0.16, 0.05, { color: WHITE, sides: 5 }),
  );
  const collar = b.ring(neck.joints[1], { count: 12, radius: 0.107 });
  b.sweep(catmull(collar.items, { closed: true }), 0.016, { color: RED, bone: neck.joints[1] });
  const bellAt = collar.items[6].at;
  b.part(new THREE.SphereGeometry(0.035, 8, 6), GOLD, {
    at: [bellAt.x, bellAt.y - 0.03, bellAt.z],
    bone: neck.joints[1],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.006, 0.05), INK, {
    at: [bellAt.x, bellAt.y - 0.045, bellAt.z + 0.012],
    bone: neck.joints[1],
  });

  // sash
  const sash = b.ring(spine.joints[1], { count: 14, radius: 0.2 });
  b.sweep(catmull(sash.items, { closed: true }), 0.02, { color: RED, bone: spine.joints[1] });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), GOLD, {
    at: sash.items[0].at,
    bone: spine.joints[1],
    scale: [1, 0.6, 1],
  });
  void neckTube;

  // ---------------------------------------------------------------- legs
  const SOCK = (x: number) => gradient(WHITE, "#2a1b2e", P(x, 0.22, 0), P(x, 0.07, 0));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fp = limb(P(s * 0.11, 0.5, 0.28), P(s * 0.11, 0.05, 0.3), [0.27, 0.27], [[0, 0, -1]]);
    const fl = b.chain(`legF${S}`, fp, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `pawF${S}`],
      role: "leg",
    });
    b.sweep(fl, [0.065, 0.035], { color: SOCK(s * 0.11) });
    b.part(new THREE.SphereGeometry(1, 8, 6), "#2a1b2e", {
      bone: fl.tip!,
      at: P(s * 0.11, 0.04, 0.33),
      scale: [0.05, 0.04, 0.075],
    });
    // hind
    const hpts = limb(P(s * 0.12, 0.5, -0.3), P(s * 0.12, 0.05, -0.36), [0.24, 0.24, 0.12], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hl = b.chain(`legH${S}`, hpts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
    });
    b.sweep(hl, [0.09, 0.055, 0.035, 0.03], { color: SOCK(s * 0.12) });
    b.part(new THREE.SphereGeometry(1, 8, 6), WHITE, {
      bone: hl.joints[0],
      at: P(s * 0.13, 0.5, -0.3),
      scale: [0.1, 0.14, 0.15],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), "#2a1b2e", {
      bone: hl.tip!,
      at: P(s * 0.12, 0.04, -0.33),
      scale: [0.05, 0.04, 0.075],
    });
    // red leg band
    const band = b.ring(fl.joints[1], { count: 8, radius: 0.052 });
    b.sweep(catmull(band.items, { closed: true }), 0.01, { color: GOLD, bone: fl.joints[1] });
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, {
    bone: head,
    at: hp(0, 0.02, 0.04),
    scale: [0.115, 0.1, 0.115],
  });
  b.part(new THREE.ConeGeometry(0.075, 0.2, 6), WHITE, {
    bone: head,
    at: hp(0, -0.005, 0.17),
    dir: [0, -0.12, 1],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.022, 6, 5), INK, { bone: head, at: hp(0, -0.02, 0.268) });
  b.rod(hp(0, -0.055, 0.06), hp(0, -0.07, 0.23), [0.045, 0.02], CREAM, { bone: jaw, sides: 6 });
  for (const s of [1, -1]) {
    // fangs
    b.part(new THREE.ConeGeometry(0.007, 0.03, 4), "#ffffff", {
      bone: head,
      at: hp(s * 0.03, -0.085, 0.2),
      dir: [0, -1, 0],
    });
    // ears
    const EARC = gradient(WHITE, INK, hp(0, 0.26, 0), hp(0, 0.35, 0));
    fluff(hp(s * 0.075, 0.12, -0.005), [s * 0.35, 1, -0.25], 0.27, 0.07, EARC, head, 4);
    fluff(hp(s * 0.073, 0.115, 0.012), [s * 0.35, 1, -0.25], 0.2, 0.045, "#3a1a2c", head, 4);
    // cheek ruffs
    fluff(hp(s * 0.09, -0.02, 0.0), [s * 0.9, -0.25, -0.5], 0.15, 0.045, WHITE, head);
    fluff(hp(s * 0.085, -0.05, 0.03), [s * 0.8, -0.5, -0.2], 0.12, 0.04, WHITE, head);
    fluff(hp(s * 0.09, 0.01, -0.01), [s * 0.9, 0.1, -0.5], 0.13, 0.04, CREAM, head);
    // whiskers
    for (const k of [0, 1, 2])
      b.spike(hp(s * 0.045, -0.03 - k * 0.012, 0.2), [s, 0.12 - k * 0.1, -0.15], 0.14, 0.004, {
        color: "#ffffff",
        bone: head,
        sides: 4,
      });
    // eyes + cheek marks
    b.decal(skull, EYE, {
      at: hp(s * 0.065, 0.04, 0.12),
      dir: [s * 0.55, 0.1, 0.8],
      size: [0.075, 0.05],
      mirror: s > 0,
    });
    b.decal(skull, CHEEK, {
      at: hp(s * 0.1, 0.0, 0.04),
      dir: [s, 0, 0.2],
      size: [0.085, 0.06],
      mirror: s > 0,
    });
  }
  b.decal(skull, BROW, { at: hp(0, 0.1, 0.06), dir: [0, 0.7, 0.7], size: [0.05, 0.05] });
  for (const k of [-1, 0, 1])
    fluff(hp(k * 0.03, 0.1, -0.01), [k * 0.3, 0.7, -0.7], 0.1, 0.03, k === 0 ? RED : WHITE, head);

  // ---------------------------------------------------------------- nine tails
  const B = new THREE.Vector3(0, 0.56 + Y0, -0.4);
  for (let i = 0; i < 9; i++) {
    const k = (i - 4) / 4;
    const a = k * 1.3;
    const d = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));
    const h = 0.7 + 0.3 * (1 - Math.abs(k));
    const stagger = i % 2 ? 0.06 : -0.04;
    const at = (f: number, up: number) => B.clone().addScaledVector(d, f).add(new THREE.Vector3(0, up, 0));
    const path = catmull([
      B.clone(),
      at(0.28, 0.1),
      at(0.58, 0.32 * h + stagger),
      at(0.76, 0.7 * h + 0.05 + stagger),
    ]);
    const nm = (c: string) => `tail${i + 1}${c}`;
    const tail = b.chain(`tail${i + 1}`, path, {
      parent: hips,
      names: [nm("a"), nm("b"), nm("c")],
      role: "tail",
    });
    const tipCol = i === 4 ? "#ffd86a" : i % 2 ? RED : "#ff8a3c";
    const tailPaint = paint((_p, n, s) => {
      const base = mix(CREAM, "#fffaf0", smoothstep(-0.5, 0.6, n.y));
      return mix(base, tipCol, smoothstep(0.6, 0.85, s[0]));
    });
    b.sweep(tail, [0.045, 0.1, 0.115, 0.09], { color: tailPaint });
    // spirit flame
    const tip = path.at(1);
    glow(
      b.cards([frame([tip.x, tip.y + 0.05, tip.z], [0, 1, 0])], i % 2 ? FLAME_B : FLAME_A, {
        size: [0.15, 0.26],
        cross: true,
        bone: tail.joints[tail.joints.length - 1],
      }),
      1.3,
    );
  }

  // ---------------------------------------------------------------- floating foxfire
  const orbAngles = [-95, -55, -20, 20, 55, 95];
  orbAngles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const r = 0.7 + (i % 2) * 0.1;
    const y = 0.75 + (i % 3) * 0.28;
    const x = r * Math.sin(a);
    const z = 0.3 + 0.55 * Math.cos(a) * (Math.abs(deg) > 80 ? 0.2 : 1);
    glow(b.part(new THREE.SphereGeometry(0.035, 7, 5), "#c6f6ff", { at: [x, y, z], bone: hips }), 1.6);
    glow(
      b.cards([frame([x, y + 0.025, z], [0, 1, 0])], i % 2 ? FLAME_B : FLAME_A, {
        size: [0.1, 0.17],
        cross: true,
        bone: hips,
      }),
      1.2,
    );
  });

  return b.root;
}
