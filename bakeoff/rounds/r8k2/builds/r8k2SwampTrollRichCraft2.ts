import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  aim,
  lerp,
  catmull,
  bezier,
  polyline,
  limb,
  paint,
  countershade,
  mottle,
  spots,
  grain,
  noise,
  mix,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { Joint, Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll Witch-Doctor",
  description:
    "A hunched, tusked swamp troll with a flaming mohawk, bone fetishes, a skull necklace and war paint, standing in a rune-ringed bog beside a voodoo totem and a bubbling cauldron.",
};

type V = [number, number, number];
type Col = string | Paint;
type Outline = Array<[number, number] | [number, number, "sharp"]>;

const sphereG = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
const v3 = (p: ArrayLike<number>) => new THREE.Vector3(p[0], p[1], p[2]);
const arr = (v: THREE.Vector3): V => [v.x, v.y, v.z];
// Position of a vector, hit or path point as a fresh Vector3.
const pos = (p: any): THREE.Vector3 => {
  const q = p && p.at && p.at.x !== undefined ? p.at : p;
  return new THREE.Vector3(q.x, q.y, q.z);
};

function ramp(keys: number[][]): (t: number) => [number, number] {
  return (t) => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0] || i === keys.length - 1) {
        const a = keys[i - 1];
        const c = keys[i];
        const u = Math.min(Math.max((t - a[0]) / (c[0] - a[0]), 0), 1);
        return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      }
    }
    return [keys[0][1], keys[0][2]];
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Palette

const BONE = "#e9dfc0";
const BONE_D = "#b8a77c";
const CLAW = "#cdbd8c";
const INK = "#1a1410";
const LEATHER = "#6b4326";
const LEATHER_D = "#3f2915";
const RED = "#c8321e";
const RED_D = "#7a1d2a";
const GOLD = "#d9a93a";
const GLOWG = "#7dff8c";
const AMBER = "#ffc43a";
const MOUTH = "#6e1620";
const IRON = "#34343c";

// ---------------------------------------------------------------------------------------------------------------
// Paints

const HIDE = mottle("#3a8465", "#52a57b", { size: 0.16, seed: 4 });
const BELLY = mottle("#b9c07a", "#d0d28c", { size: 0.12, seed: 5 });
const SKIN_BASE = spots(HIDE, "#2a5e4b", { size: 0.09, amount: 0.05, seed: 8 });
const SKIN = paint((p, n) => {
  const base0 = SKIN_BASE.at(p, n);
  const front =
    smoothstep(0.15, 0.5, n.z) * smoothstep(0.92, 1.05, p.y) * smoothstep(1.64, 1.52, p.y) * smoothstep(0.4, 0.3, Math.abs(p.x));
  const inner = smoothstep(0.35, 0.8, -Math.sign(p.x) * n.x) * smoothstep(0.08, 0.15, Math.abs(p.x)) * smoothstep(1.55, 1.4, p.y);
  const warm = Math.min(1, Math.max(front, inner * 0.85));
  const backMark =
    Math.max(smoothstep(0.2, 0.8, n.y), smoothstep(0.15, 0.7, -n.z), smoothstep(0.55, 0.95, Math.abs(n.x))) *
    smoothstep(0.57, 0.68, noise(p, 0.08, 17));
  const c1 = mix(mix(base0, "#2a5e4b", backMark * 0.3), BELLY.at(p, n), warm * 0.9);
  const hm = smoothstep(1.62, 1.68, p.y) * smoothstep(0.42, 0.52, p.z);
  const ed = Math.hypot(Math.abs(p.x) - 0.08, p.y - 1.79, p.z - 0.725);
  const sock = hm * smoothstep(0.085, 0.045, ed);
  const noseU = hm * smoothstep(-0.25, -0.65, n.y) * smoothstep(0.66, 0.72, p.z);
  const c = mix(mix(mix(c1, "#7cc79a", hm * 0.3), "#1d4a3a", sock * 0.75), "#1d4a3a", noseU * 0.6);
  const l = 0.86 + 0.18 * Math.max(n.y, -0.3);
  const mud = smoothstep(0.32, 0.1, p.y) * (0.45 + 0.55 * noise(p, 0.06, 11));
  const m = mix(c, "#3a2a1b", Math.min(mud, 0.9));
  return [m[0] * l, m[1] * l, m[2] * l] as const;
});

const MOHAWK = paint((_p, _n, s) => {
  const t = Math.min(Math.max(s[1] / 0.3, 0), 1);
  return t < 0.5 ? mix("#4a0f2e", "#c8262e", t / 0.5) : mix("#c8262e", "#ff9a2e", (t - 0.5) / 0.5);
});
const TUSKP = paint((_p, _n, s) => mix("#a8975f", "#f6eed2", Math.min(1, s[0] * 1.3)));
const LEATHERP = paint((_p, _n, s) => {
  const h = s[0];
  const deg = ((s[1] % 360) + 360) % 360;
  const d = deg % 60;
  if (h < 0.045) return "#b98c58";
  if (h < 0.056) return "#33200f";
  if (d < 2.5 || d > 57.5) return "#33200f";
  if (h > 0.145) return "#5a3a1e";
  return Math.floor(deg / 60) % 2 ? "#8c5c30" : "#7a4d27";
});
const WOODP = grain("#4f3320", "#76502f", { size: 0.025, axis: "y", seed: 6 });
const POTP = mottle("#26262d", "#4a4c58", { size: 0.1, seed: 9 });
const STONEP = mottle("#5b5f5a", "#8a8d84", { size: 0.08, seed: 13 });
const MUD_BASE = mottle("#33261a", "#4d3a28", { size: 0.22, seed: 21 });
const MUDP = paint((p, n) => {
  const c = MUD_BASE.at(p, n);
  const moss = smoothstep(0.52, 0.72, noise(p, 0.3, 5)) * smoothstep(0.5, 0.95, n.y);
  const m = mix(c, "#4f6b2c", moss * 0.85);
  const rim = smoothstep(1.1, 1.35, Math.hypot(p.x, p.z)) * 0.35;
  const k = 1 - rim * 0.6;
  return [m[0] * k, m[1] * k, m[2] * k] as const;
});
const WINGP = paint((_p, _n, s) => mix(RED_D, "#2a9d8f", smoothstep(0.18, 0.4, s[0])));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const mask = (inner: string) =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#5b3a22"/>
      <rect x="2" y="2" width="60" height="60" fill="none" stroke="#2a190e" stroke-width="3"/>
      ${inner}
    </svg>`,
    { size: 160 },
  );

const TOTEM_TROLL = mask(`
  <path d="M16 14 L20 3 L26 12 L32 1 L38 12 L44 3 L48 14Z" fill="#d8402a"/>
  <rect x="12" y="12" width="40" height="44" rx="6" fill="#3f8a6a" stroke="#1b0f07" stroke-width="2.5"/>
  <path d="M14 25 L30 29 L30 22 L14 19Z M50 25 L34 29 L34 22 L50 19Z" fill="#1b0f07"/>
  <circle cx="22" cy="31" r="4.2" fill="#ffd23a"/><circle cx="42" cy="31" r="4.2" fill="#ffd23a"/>
  <ellipse cx="22" cy="31" rx="1.2" ry="3.2" fill="#1b0f07"/><ellipse cx="42" cy="31" rx="1.2" ry="3.2" fill="#1b0f07"/>
  <path d="M32 29 L28 41 L36 41Z" fill="#2c6b52"/>
  <rect x="18" y="45" width="28" height="7" fill="#7a1010"/>
  <path d="M20 47 L22 36 L25 47Z M44 47 L42 36 L39 47Z" fill="#f2e8c8" stroke="#1b0f07" stroke-width="1"/>
`);
const TOTEM_BIRD = mask(`
  <path d="M8 14 L32 6 L56 14 L50 30 L14 30Z" fill="#2a9d8f" stroke="#1b0f07" stroke-width="2"/>
  <path d="M10 34 L32 26 L54 34 L48 50 L16 50Z" fill="#c8321e" stroke="#1b0f07" stroke-width="2"/>
  <circle cx="21" cy="20" r="7" fill="#f2e8c8" stroke="#1b0f07" stroke-width="2"/><circle cx="43" cy="20" r="7" fill="#f2e8c8" stroke="#1b0f07" stroke-width="2"/>
  <circle cx="21" cy="20" r="3.2" fill="#c8321e"/><circle cx="43" cy="20" r="3.2" fill="#c8321e"/>
  <path d="M32 22 L24 42 L32 58 L40 42Z" fill="#e0a82e" stroke="#1b0f07" stroke-width="2"/>
  <path d="M14 56 L20 48 L26 56 M38 56 L44 48 L50 56" fill="none" stroke="#f2e8c8" stroke-width="2.5"/>
`);
const TOTEM_SPIRIT = mask(`
  <rect x="6" y="6" width="52" height="52" fill="#241a2e"/>
  <path d="M32 10 C48 10 52 24 48 34 L48 44 L16 44 L16 34 C12 24 16 10 32 10Z" fill="#efe3c0" stroke="#1b0f07" stroke-width="2"/>
  <ellipse cx="23" cy="30" rx="6" ry="7" fill="#1b0f07"/><ellipse cx="41" cy="30" rx="6" ry="7" fill="#1b0f07"/>
  <circle cx="23" cy="30" r="2.6" fill="#7dff8c"/><circle cx="41" cy="30" r="2.6" fill="#7dff8c"/>
  <path d="M32 36 L28 42 L36 42Z" fill="#1b0f07"/>
  <path d="M22 44 V54 M28 44 V54 M36 44 V54 M42 44 V54" stroke="#efe3c0" stroke-width="3"/>
  <path d="M8 8 L18 18 M56 8 L46 18" stroke="#c8321e" stroke-width="4"/>
`);

const FACEPAINT = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 2 V22" stroke="#b5251b" stroke-width="9" stroke-linecap="round"/>
    <circle cx="50" cy="28" r="3" fill="#f5f1e0"/>
    <path d="M8 36 L30 50 M4 28 L24 44 M14 42 L34 54" stroke="#f5f1e0" stroke-width="4" stroke-linecap="round"/>
    <path d="M92 36 L70 50 M96 28 L76 44 M86 42 L66 54" stroke="#f5f1e0" stroke-width="4" stroke-linecap="round"/>
    <path d="M20 12 L34 20 M80 12 L66 20" stroke="#b5251b" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const GLYPH = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#c2301f" stroke-width="5"/>
    <circle cx="50" cy="50" r="33" fill="none" stroke="#f1e7c8" stroke-width="3.5" stroke-dasharray="6 5"/>
    <path d="M50 20 L74 66 L26 66Z" fill="none" stroke="#c2301f" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="50" cy="52" r="8" fill="#f1e7c8"/><circle cx="50" cy="52" r="3.4" fill="#2a1410"/>
    <path d="M12 50 H2 M88 50 H98 M50 8 V0" stroke="#c2301f" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const CLOTH = svg(
  `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 0 H58 V62 L52 78 L46 62 L40 78 L34 62 L28 78 L22 62 L16 78 L10 62 L4 78 L2 62Z" fill="#8a2f2a" stroke="#2a1410" stroke-width="2"/>
    <rect x="2" y="0" width="56" height="11" fill="#3b1f4a"/>
    <path d="M3 18 L10 27 L17 18 L24 27 L31 18 L38 27 L45 18 L52 27 L57 20" fill="none" stroke="#e8c85a" stroke-width="3"/>
    <circle cx="30" cy="44" r="10" fill="#efe3c0" stroke="#2a1410" stroke-width="1.6"/>
    <circle cx="26" cy="42" r="2.8" fill="#2a1410"/><circle cx="34" cy="42" r="2.8" fill="#2a1410"/>
    <path d="M30 46 L28 50 H32Z" fill="#2a1410"/>
    <rect x="24" y="52" width="12" height="5" fill="#efe3c0" stroke="#2a1410" stroke-width="1.2"/>
    <circle cx="4" cy="74" r="2.6" fill="#efe3c0"/><circle cx="28" cy="74" r="2.6" fill="#efe3c0"/><circle cx="52" cy="74" r="2.6" fill="#efe3c0"/>
  </svg>`,
  { size: 192 },
);

const FEATHER = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c8321e"/><stop offset="0.55" stop-color="#e8a02e"/><stop offset="1" stop-color="#1f9d8a"/></linearGradient></defs>
    <path d="M12 63 C1 46 1 20 12 1 C23 20 23 46 12 63Z" fill="url(#g)" stroke="#2a1410" stroke-width="1.4"/>
    <path d="M12 63 V6" stroke="#f3ecd0" stroke-width="1.8"/>
  </svg>`,
  { size: 128 },
);

const REED = svg(
  `<svg viewBox="0 0 16 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 96 C5 60 6 30 3 0 C10 30 11 60 11 96Z" fill="#5f8a34"/>
    <path d="M8 96 C8 70 9 44 9 22" stroke="#7a9a3c" stroke-width="2.6" fill="none"/>
    <ellipse cx="9" cy="16" rx="3.6" ry="12" fill="#5a3a22" stroke="#2a190e" stroke-width="1"/>
  </svg>`,
  { size: 192 },
);

const LILY = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 32 L58.3 22.4 A28 28 0 1 0 58.3 41.6Z" fill="#3d6a38" stroke="#1c3320" stroke-width="2"/>
    <path d="M32 32 L10 20 M32 32 L6 36 M32 32 L16 54 M32 32 L38 6" stroke="#55873c" stroke-width="1.8"/>
  </svg>`,
  { size: 128 },
);

const RUNES = (() => {
  let g = "";
  for (let i = 0; i < 12; i++) {
    const k = i % 3;
    const shape =
      k === 0
        ? `<path d="M50 5 L46.5 12 L53.5 12Z" fill="#7dff8c"/>`
        : k === 1
          ? `<path d="M46.5 5 L53.5 12 M53.5 5 L46.5 12" stroke="#7dff8c" stroke-width="1.5" fill="none"/>`
          : `<circle cx="50" cy="8" r="2.4" fill="#7dff8c"/><path d="M50 10.5 V14" stroke="#7dff8c" stroke-width="1.5"/>`;
    g += `<g transform="rotate(${i * 30} 50 50)">${shape}</g>`;
    g += `<g transform="rotate(${i * 30 + 15} 50 50)"><circle cx="50" cy="8" r="1.1" fill="#7dff8c"/></g>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="none" stroke="#7dff8c" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#7dff8c" stroke-width="1.2"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#7dff8c" stroke-width="1" stroke-dasharray="2 3"/>
      ${g}
    </svg>`,
    { size: 512 },
  );
})();

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const R = rng(11);
  const G = 0.075; // top of the mud base

  // ---- Skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const base = b.joint("base", { parent: root, at: [0, 0.04, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.92, -0.1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.92, -0.1],
      [0, 1.14, -0.05],
      [0, 1.38, 0.08],
      [0, 1.56, 0.24],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chestJ = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.56, 0.24],
      [0, 1.64, 0.36],
      [0, 1.7, 0.46],
    ]),
    { parent: chestJ, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.7, 0.46], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.69, 0.47], aim: [0, 1.64, 0.62], role: "jaw" });

  // ---- Generic helpers
  const blob = (color: Col, bone: Joint, at: V, r: number | V, extra: { flat?: boolean } = {}) =>
    b.part(sphereG(8, 6), color, { bone, at, scale: typeof r === "number" ? [r, r, r] : r, ...extra });

  const boneRod = (a: V, c: V, r: number, bone: Joint, col: Col = BONE) => {
    b.rod(a, c, r, { color: col, bone, sides: 6 });
    const d = v3(c).sub(v3(a)).normalize();
    const perp = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(d, perp).normalize().multiplyScalar(r * 0.9);
    for (const e of [a, c])
      for (const k of [1, -1])
        blob(col, bone, [e[0] + side.x * k, e[1] + side.y * k, e[2] + side.z * k], r * 1.35);
  };

  const skull = (at: V, facing: V, size: number, bone: Joint, o: { eye?: string; color?: Col } = {}) => {
    const q = aim(facing, [0, 1, 0], "z");
    const L = (x: number, y: number, z: number): V => {
      const p = new THREE.Vector3(x, y, z).multiplyScalar(size).applyQuaternion(q);
      return [at[0] + p.x, at[1] + p.y, at[2] + p.z];
    };
    const col = o.color ?? BONE;
    b.part(sphereG(7, 5), col, { bone, at: L(0, 0.06, 0), quat: q, scale: [size * 0.5, size * 0.46, size * 0.54] });
    b.part(new THREE.BoxGeometry(size * 0.4, size * 0.2, size * 0.42), col, { bone, at: L(0, -0.36, 0.1), quat: q });
    b.part(new THREE.BoxGeometry(size * 0.34, size * 0.17, size * 0.3), col, { bone, at: L(0, -0.2, 0.28), quat: q });
    for (const s of [1, -1]) {
      b.part(sphereG(6, 4), INK, {
        bone,
        at: L(s * 0.2, 0.03, 0.455),
        quat: q,
        scale: [size * 0.17, size * 0.19, size * 0.08],
      });
      if (o.eye)
        glow(
          b.part(sphereG(5, 4), o.eye, {
            bone,
            at: L(s * 0.2, 0.03, 0.49),
            quat: q,
            scale: [size * 0.055, size * 0.065, size * 0.03],
          }),
          0.8,
        );
    }
    b.part(new THREE.ConeGeometry(size * 0.05, size * 0.12, 3), INK, { bone, at: L(0, -0.12, 0.52), quat: q });
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(size * 0.085, size * 0.1, size * 0.05), BONE_D, {
        bone,
        at: L((i - 1) * 0.12, -0.3, 0.43),
        quat: q,
      });
    return { L, q };
  };

  const feathers = (pts: V[], bone: Joint, size: [number, number], flow: V = [0, 0, 1], spread = 0) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      FEATHER,
      {
        size,
        lean: 180,
        flow: (_f: unknown, i: number): V => {
          const a = ((i - (pts.length - 1) / 2) * spread * Math.PI) / 180;
          return [flow[0] * Math.cos(a) + flow[2] * Math.sin(a), 0, -flow[0] * Math.sin(a) + flow[2] * Math.cos(a)];
        },
        bone,
        vary: 0.2,
        spin: 5,
        rng: R,
        sink: 0,
      },
    );

  // Thin two-layer cloth panel hanging from y = 0 (top edge), drawn in local space with +z outward.
  const clothGeo = (w: number, len: number, prof: number[], th: number) => {
    const rows = prof.length - 1;
    const cols = 6;
    const pa: number[] = [];
    const ua: number[] = [];
    const idx: number[] = [];
    const nv = (rows + 1) * (cols + 1);
    for (let layer = 0; layer < 2; layer++) {
      const off = layer === 0 ? th / 2 : -th / 2;
      for (let r = 0; r <= rows; r++)
        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          const sag = 0.02 * Math.pow(Math.abs(u - 0.5) * 2, 2);
          pa.push((u - 0.5) * w, -(r / rows) * len, prof[r] - sag + off);
          ua.push(u, 1 - r / rows);
        }
    }
    for (let layer = 0; layer < 2; layer++)
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const a0 = layer * nv + r * (cols + 1) + c;
          const a1 = a0 + 1;
          const d0 = a0 + cols + 1;
          const d1 = d0 + 1;
          if (layer === 0) idx.push(a0, d0, d1, a0, d1, a1);
          else idx.push(a0, d1, d0, a0, a1, d1);
        }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(ua, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  const fetish = (top: V, bone: Joint, k = 1) => {
    const [x, y, z] = top;
    // leather knot with two cord tails
    b.part(sphereG(6, 4), LEATHER_D, { bone, at: [x, y, z], scale: [0.026 * k, 0.022 * k, 0.026 * k] });
    b.rod([x, y, z], [x - 0.03 * k, y - 0.045 * k, z], 0.007 * k, { color: LEATHER, bone });
    b.rod([x, y, z], [x + 0.025 * k, y - 0.04 * k, z], 0.007 * k, { color: LEATHER, bone });
    b.rod([x, y, z], [x, y - 0.055 * k, z], 0.008 * k, { color: LEATHER_D, bone });
    skull([x, y - 0.1 * k, z], [0, 0, 1], 0.09 * k, bone, { eye: GLOWG });
    boneRod([x, y - 0.14 * k, z], [x, y - 0.26 * k, z], 0.016 * k, bone);
    b.part(new THREE.TorusGeometry(0.022 * k, 0.008 * k, 5, 8), RED, {
      bone,
      at: [x, y - 0.2 * k, z],
      rotation: [90, 0, 0],
    });
    feathers([[x - 0.04 * k, y - 0.25 * k, z], [x + 0.04 * k, y - 0.25 * k, z]], bone, [0.075 * k, 0.17 * k], [0, 0, 1], 40);
  };

  // =============================================================================================================
  // Torso
  const torso = b.sweep(spine, ramp([[0, 0.2, 0.17], [0.35, 0.19, 0.16], [0.7, 0.324, 0.238], [0.85, 0.356, 0.259], [1, 0.346, 0.248]]), {
    color: SKIN,
  });
  const hump = blob(SKIN, chestJ, [0, 1.55, 0.08], [0.33, 0.19, 0.25]);
  const trapL = blob(SKIN, chestJ, [0.19, 1.55, 0.16], [0.2, 0.14, 0.19]);
  const trapR = blob(SKIN, chestJ, [-0.19, 1.55, 0.16], [0.2, 0.14, 0.19]);
  const neckSweep = b.sweep(neck, [0.15, 0.12], { color: SKIN });
  const torsoSurf = b.surface(torso);
  const bodySurf = b.surface([torso, hump, trapL, trapR, neckSweep]);

  // =============================================================================================================
  // Head
  const HC: V = [0, 1.76, 0.56];
  const hc = (x: number, y: number, z: number): V => [HC[0] + x, HC[1] + y, HC[2] + z];

  const skullP = b.part(sphereG(10, 8), SKIN, { bone: head, at: HC, scale: [0.18, 0.18, 0.19] });
  const skullBack = blob(SKIN, head, hc(0, 0.02, -0.08), [0.16, 0.16, 0.14]);
  const cheeks: any[] = [];
  for (const s of [1, -1]) {
    cheeks.push(
      b.frustumBox(hc(s * 0.07, -0.005, 0.13), hc(s * 0.15, -0.07, 0.16), [0.09, 0.05], [0.07, 0.06], {
        color: SKIN,
        bone: head,
      }),
    );
    // heavy brow
    b.rod(hc(s * 0.14, 0.085, 0.07), hc(s * 0.03, 0.06, 0.185), 0.04, { color: SKIN, bone: head });
    // eyes
    const eye = blob(AMBER, head, hc(s * 0.08, 0.03, 0.165), 0.034);
    glow(eye, 1.3);
    b.part(sphereG(6, 4), INK, { bone: head, at: hc(s * 0.08, 0.03, 0.192), scale: [0.005, 0.023, 0.0066] });
    blob(SKIN, head, hc(s * 0.08, 0.054, 0.172), [0.04, 0.02, 0.034]); // heavy lid
    // nostrils
    blob("#14291f", head, hc(s * 0.032, -0.087, 0.28), [0.014, 0.01, 0.012]);
    // small upper fangs
    b.spike(hc(s * 0.05, -0.08, 0.2), [0, -1, 0], 0.05, 0.014, { color: BONE, bone: head });
  }
  // muzzle and hooked nose
  const muzzle = b.frustumBox(hc(0, -0.015, 0.07), hc(0, -0.05, 0.2), [0.24, 0.13], [0.17, 0.1], {
    color: SKIN,
    bone: head,
  });
  b.part(new THREE.BoxGeometry(0.15, 0.05, 0.07), SKIN, { bone: head, at: hc(0, -0.052, 0.2) });
  const nose = b.sweep(
    bezier(hc(0, 0.03, 0.16), hc(0, 0.06, 0.285), hc(0, -0.07, 0.275)),
    (t) => [0.02 + 0.032 * t, 0.034 - 0.01 * t],
    { color: SKIN, bone: head, sides: 6 },
  );
  // mouth interior, lower jaw
  blob(MOUTH, head, hc(0, -0.105, 0.12), [0.12, 0.03, 0.13]);
  b.frustumBox(hc(0, -0.14, -0.04), hc(0, -0.15, 0.2), [0.24, 0.075], [0.2, 0.075], { color: SKIN, bone: jaw });
  b.part(new THREE.BoxGeometry(0.17, 0.085, 0.1), SKIN, { bone: jaw, at: hc(0, -0.145, 0.225) });
  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 0.04;
    b.spike(hc(x, -0.108, 0.19), [0, 1, 0], 0.03, 0.01, { color: BONE_D, bone: jaw });
  }
  // tusks
  for (const s of [1, -1]) {
    const path = bezier(hc(s * 0.095, -0.135, 0.14), hc(s * 0.18, -0.15, 0.3), hc(s * 0.16, 0.1, 0.32));
    b.sweep(path, [0.04, 0.003], { color: TUSKP, bone: jaw, caps: { start: "flat", end: "point" } });
    b.part(new THREE.TorusGeometry(0.034, 0.008, 5, 8), RED, {
      bone: jaw,
      at: path.at(0.3),
      dir: path.tangentAt(0.3),
      axis: "z",
    });
    b.part(new THREE.TorusGeometry(0.027, 0.006, 5, 8), GOLD, {
      bone: jaw,
      at: path.at(0.5),
      dir: path.tangentAt(0.5),
      axis: "z",
    });
    // chin tendrils with bone beads
    const tp = bezier(hc(s * 0.05, -0.185, 0.22), hc(s * 0.07, -0.27, 0.235), hc(s * 0.055, -0.35, 0.225));
    b.sweep(tp, [0.014, 0.006], { color: RED_D, bone: jaw });
    blob(BONE, jaw, arr(pos(tp.at(0.6))), 0.017);
    blob(BONE, jaw, arr(pos(tp.at(1))), 0.02);
  }

  // ears
  const earOutline = (k: number): Outline => [
    [0, -0.04 * k],
    [0.1 * k, 0],
    [0.26 * k, 0.2 * k, "sharp"],
    [0.1 * k, 0.1 * k],
    [0, 0.07 * k],
  ];
  for (const s of [1, -1]) {
    const earAt = v3(hc(s * 0.165, 0.02, -0.02));
    const xd = new THREE.Vector3(s * 0.92, 0, -0.38);
    b.extrude(earOutline(1.2), { at: arr(earAt), x: arr(xd), y: [0, 1, 0], thickness: 0.022, color: SKIN, bone: head });
    b.extrude(earOutline(0.62), {
      at: arr(earAt.clone().addScaledVector(xd, 0.05).add(new THREE.Vector3(0, 0.005, 0))),
      x: arr(xd),
      y: [0, 1, 0],
      thickness: 0.027,
      color: "#b86a55",
      bone: head,
    });
    const lobe = earAt.clone().addScaledVector(xd, 0.05).add(new THREE.Vector3(0, -0.06, 0));
    blob(SKIN, head, arr(lobe), [0.022, 0.03, 0.016]);
    b.part(new THREE.TorusGeometry(0.024, 0.006, 5, 8), GOLD, {
      bone: head,
      at: arr(lobe.clone().add(new THREE.Vector3(0, -0.012, 0))),
      dir: arr(xd),
      axis: "z",
    });
    b.spike(arr(lobe.clone().add(new THREE.Vector3(0, -0.03, 0))), [0, -1, 0], 0.07, 0.014, {
      color: BONE,
      bone: head,
    });
  }

  // war paint
  b.decal([skullP, ...cheeks, muzzle, nose], FACEPAINT, {
    at: hc(0, 0.0, 0.2),
    dir: [0, 0, 1],
    size: [0.34, 0.2],
    segments: 18,
  });

  // warts
  for (const h of b.surface([skullP, skullBack]).scatter(4, { rng: R, minDist: 0.08, filter: (x) => x.n.y > 0.35 }))
    b.stick(new THREE.SphereGeometry(0.014, 5, 4), "#78b383", h, { embed: 0.4 });

  // open the jaw a touch for the rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  // =============================================================================================================
  // Mohawk
  const bladeOutline = (k: number): Outline => [
    [-0.05, -0.03],
    [0.07, -0.03],
    [0.085, 0.1 * k],
    [0.14, 0.27 * k, "sharp"],
    [0.02, 0.17 * k],
    [-0.05, 0.07 * k],
  ];
  const headSurf = b.surface([skullP, skullBack]);
  const neckTop = b.surface([neckSweep, hump, trapL, trapR]);
  const stations: Array<[number, number]> = [[0.6, 1.0], [0.5, 1.25], [0.4, 1.15], [0.3, 0.8], [0.2, 0.58], [0.1, 0.4]];
  for (const [z, k] of stations) {
    const onHead = z >= 0.36;
    const surf = onHead ? headSurf : neckTop;
    const bone = onHead ? head : z >= 0.27 ? neck.joints[1] : chestJ;
    for (const [dx, kk, tilt] of [[0, 1, 0], [0.045, 0.78, 1], [-0.045, 0.78, -1]]) {
      const h = surf.ray([dx, 3, z], [0, -1, 0]);
      if (!h) continue;
      b.extrude(bladeOutline(k * kk), {
        at: [dx, h.at.y + 0.015, z],
        x: [0, 0, -1],
        y: [Math.sin(tilt * 0.349), Math.cos(tilt * 0.349), 0],
        thickness: tilt ? [0.055, 0.012] : [0.095, 0.016],
        color: MOHAWK,
        bone,
      });
    }
  }
  // dreadlocks with bone beads
  for (const s of [1, -1]) {
    const dp = bezier(hc(s * 0.12, -0.01, -0.15), hc(s * 0.2, -0.12, -0.18), [s * 0.2, 1.47, 0.28]);
    b.sweep(dp, [0.022, 0.011], { color: RED_D, bone: head });
    blob(BONE, head, arr(pos(dp.at(0.45))), 0.022);
    blob(GOLD, head, arr(pos(dp.at(0.75))), 0.02);
    const end = arr(pos(dp.at(1)));
    feathers([[end[0], end[1] - 0.01, end[2]]], head, [0.055, 0.2], [s * 0.4, 0, 1]);
  }

  // =============================================================================================================
  // Arms and hands
  const hand = (s: number, S: string, wrist: Joint, wp: THREE.Vector3, d: THREE.Vector3) => {
    const dir = d.clone().normalize();
    const X = new THREE.Vector3(1, 0, 0);
    const palm = wp.clone().addScaledVector(dir, 0.075);
    blob(SKIN, wrist, arr(palm), [0.095, 0.09, 0.065]);
    const finger = (name: string, p0: THREE.Vector3, d0: THREE.Vector3, l1: number, l2: number, r: number) => {
      const p1 = p0.clone().addScaledVector(d0, l1);
      const d1 = d0.clone().add(new THREE.Vector3(0, 0, 0.35)).normalize();
      const p2 = p1.clone().addScaledVector(d1, l2);
      const ch = b.chain(name, polyline([arr(p0), arr(p1), arr(p2)]), {
        parent: wrist,
        names: [`${name}_1`, `${name}_2`],
        role: "digit",
      });
      b.sweep(ch, [r, r * 0.65], { color: SKIN, sides: 6 });
      blob(SKIN, wrist, arr(p0), r * 1.2);
      blob(SKIN, ch.joints[1], arr(p1), r * 0.9);
      b.spike(arr(p2), arr(d1), 0.07, r * 0.5, { color: CLAW, bone: ch.joints[1] });
    };
    [-1, 1].forEach((u, i) => {
      const p0 = palm.clone().addScaledVector(dir, 0.065).addScaledVector(X, u * 0.045);
      const d0 = dir.clone().addScaledVector(X, u * 0.16).add(new THREE.Vector3(0, 0, 0.1)).normalize();
      finger(`finger${S}${i + 1}`, p0, d0, 0.095, 0.08, 0.04);
    });
    const t0 = palm.clone().addScaledVector(dir, 0.02).add(new THREE.Vector3(-s * 0.09, 0, 0.02));
    const td = new THREE.Vector3(-s * 0.85, -0.4, 0.4).normalize();
    finger(`thumb${S}`, t0, td, 0.075, 0.07, 0.04);
  };

  const pauldron = (s: number, sh: THREE.Vector3, bone: Joint) => {
    const ax = new THREE.Vector3(s * 0.62, 1, 0.05).normalize();
    const c = sh.clone().addScaledVector(ax, 0.07);
    b.lathe(
      [[0, 0], [0.19, 0], [0.2, 0.025], [0.16, 0.09], [0.08, 0.14], [0, 0.155]],
      { at: arr(c), axis: arr(ax), segments: 10, color: LEATHERP, bone },
    );
    const u = new THREE.Vector3().crossVectors(ax, new THREE.Vector3(0, 0, 1)).normalize();
    const w = new THREE.Vector3().crossVectors(ax, u).normalize();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const rad = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
      const bp = c.clone().addScaledVector(rad, 0.14).addScaledVector(ax, 0.04);
      const dir = rad.clone().multiplyScalar(0.7).addScaledVector(ax, 0.7).normalize();
      b.spike(arr(bp), arr(dir), 0.11, 0.032, { color: BONE, bone });
    }
    b.spike(arr(c.clone().addScaledVector(ax, 0.12)), arr(ax), 0.16, 0.04, { color: BONE, bone });
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shP: V = [s * 0.34, 1.5, 0.15];
    const handP: V = [s * 0.66, 0.64, 0.3];
    const pts = limb(shP, handP, [0.52, 0.5], [[s * 0.4, -0.1, -1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chestJ,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const [shJ, elJ, wrJ] = arm.joints;
    b.sweep(arm, [0.135, 0.13, 0.08, 0.085, 0.07], { color: SKIN });
    blob(SKIN, shJ, arr(pts[0]), 0.15);
    blob(SKIN, shJ, arr(lerp(pts[0], pts[1], 0.45)), [0.098, 0.136, 0.094]);
    blob(SKIN, elJ, arr(lerp(pts[1], pts[2], 0.3)), [0.085, 0.119, 0.081]);
    blob(SKIN, elJ, arr(pts[1]), 0.077);
    pauldron(s, pts[0], shJ);
    // leather cuff with bone studs
    const fa = pts[2].clone().sub(pts[1]).normalize();
    const cuffAt = lerp(pts[1], pts[2], 0.68).addScaledVector(fa, -0.05);
    b.lathe([[0.09, 0], [0.105, 0.012], [0.105, 0.1], [0.09, 0.112]], {
      at: arr(cuffAt),
      axis: arr(fa),
      segments: 10,
      color: LEATHER,
      bone: elJ,
    });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const u = new THREE.Vector3().crossVectors(fa, new THREE.Vector3(0, 0, 1)).normalize();
      const w = new THREE.Vector3().crossVectors(fa, u).normalize();
      const p = cuffAt.clone().addScaledVector(fa, 0.055).addScaledVector(u, Math.cos(a) * 0.108).addScaledVector(w, Math.sin(a) * 0.108);
      blob(BONE, elJ, arr(p), 0.014);
    }
    hand(s, S, wrJ, pts[2], pts[2].clone().sub(pts[1]));
  }

  // =============================================================================================================
  // Legs and feet
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP: V = [s * 0.2, 0.88, -0.1];
    const ankP: V = [s * 0.27, 0.15, 0.0];
    const pts = limb(hipP, ankP, [0.46, 0.42], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.27, G, 0.12],
    });
    const [hipJ, kneeJ, ankJ] = leg.joints;
    b.sweep(leg, [0.15, 0.135, 0.1, 0.092, 0.075], { color: SKIN });
    blob(SKIN, hipJ, arr(lerp(pts[0], pts[1], 0.35)), [0.14, 0.19, 0.14]);
    blob(SKIN, kneeJ, [pts[1].x, pts[1].y, pts[1].z + 0.05], [0.085, 0.075, 0.065]);
    blob(SKIN, kneeJ, arr(lerp(pts[1], pts[2], 0.3).add(new THREE.Vector3(0, 0, -0.04))), [0.072, 0.12, 0.077]);
    // foot
    const ax = s * 0.27;
    blob(SKIN, ankJ, [ax, 0.1, 0.07], [0.105, 0.065, 0.17]);
    blob(SKIN, ankJ, [ax, 0.15, -0.02], 0.08);
    for (const i of [-1, 0, 1]) {
      const tx = ax + i * 0.075;
      const a: V = [tx, 0.1, 0.17];
      const c: V = [tx + i * 0.02, 0.095, 0.34];
      b.rod(a, c, [0.042, 0.032], { color: SKIN, bone: ankJ, sides: 6 });
      blob(SKIN, ankJ, c, 0.036);
      b.spike(c, [i * 0.1, -0.1, 1], 0.075, 0.022, { color: CLAW, bone: ankJ });
    }
    // anklet of bone beads
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      blob(BONE, ankJ, [ax + Math.cos(a) * 0.085, 0.2, Math.sin(a) * 0.085], 0.014);
    }
  }

  // =============================================================================================================
  // Clothing and bone fetishes
  // belt
  const beltPath = torsoSurf.loop([0, 1.02, -0.08], { dir: [0, 1, 0.22], lift: 0.015 });
  b.sweep(beltPath, 0.03, { color: LEATHER_D });
  const studPath = torsoSurf.loop([0, 1.02, -0.08], { dir: [0, 1, 0.22], lift: 0.04 });
  b.along(studPath, 16, (at) => b.part(sphereG(5, 4), GOLD, { frame: at, scale: [0.017, 0.017, 0.017] }));
  const bf = torsoSurf.ray([0, 1.02, 1.2], [0, 0, -1]);
  if (bf) {
    const p = bf.at.clone().addScaledVector(bf.n, 0.05);
    skull(arr(p), arr(bf.n), 0.1, spine.joints[0], { eye: GLOWG });
    // loincloth front: top edge tucked under the belt, bowed, weighted hem
    b.part(clothGeo(0.3, 0.43, [0, 0.085, 0.13, 0.125], 0.008), "#ffffff", {
      bone: spine.joints[0],
      at: [0, bf.at.y - 0.03, bf.at.z + 0.022],
      texture: CLOTH,
    });
  }
  const bb = torsoSurf.ray([0, 1.02, -1.2], [0, 0, 1]);
  if (bb) {
    b.part(clothGeo(0.32, 0.45, [0, 0.03, 0, -0.06], 0.008), "#ffffff", {
      bone: spine.joints[0],
      at: [0, bb.at.y - 0.03, bb.at.z - 0.022],
      rotation: [0, 180, 0],
      texture: CLOTH,
    });
  }
  // hanging fetishes
  const beltAt = (target: V): V => {
    const q = pos(beltPath.at(beltPath.closestT(target)));
    const n = torsoSurf.nearest(q).n;
    const hn = Math.hypot(n.x, n.z) || 1;
    return [q.x + (n.x / hn) * 0.055, q.y - 0.004, q.z + (n.z / hn) * 0.055];
  };
  fetish(beltAt([0.2, 1.0, 0.2]), spine.joints[0]);
  fetish(beltAt([-0.2, 1.0, 0.2]), spine.joints[0], 0.9);

  // chest glyph
  const chestHit = bodySurf.ray([0, 1.3, 1.2], [0, 0, -1]);
  if (chestHit) b.decal(torso, GLYPH, { at: chestHit, size: [0.3, 0.3] });

  // warts on body
  for (const h of bodySurf.scatter(8, { rng: R, minDist: 0.2, filter: (x) => x.n.y > -0.2 && x.n.z < 0.35 }))
    b.stick(new THREE.SphereGeometry(0.022, 5, 4), "#6aa57a", h, { embed: 0.4 });

  // bone necklace draped over the shoulders
  const collarRough = catmull(
    [
      [0, 1.32, 0.5], [0.19, 1.4, 0.46], [0.26, 1.52, 0.34], [0.24, 1.62, 0.14], [0.17, 1.62, -0.08],
      [0, 1.57, -0.17], [-0.17, 1.62, -0.08], [-0.24, 1.62, 0.14], [-0.26, 1.52, 0.34], [-0.19, 1.4, 0.46],
    ],
    { closed: true },
  );
  const collar = bodySurf.drape(collarRough, { lift: 0.01 });
  b.sweep(collar, 0.012, { color: LEATHER_D });
  const fang = new THREE.ConeGeometry(0.02, 0.12, 5).translate(0, 0.068, 0);
  let bi = 0;
  b.along(collar, 15, (at) => {
    const rear = at.at.z < 0.02;
    const k = rear ? 1 + (bi++ % 2) : bi++ % 3;
    if (k === 0) b.part(fang, BONE, { frame: at, dir: [0, -1, 0] });
    else if (k === 1) b.part(sphereG(5, 4), RED, { frame: at, scale: [0.022, 0.022, 0.022] });
    else b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 5), BONE_D, { frame: at, dir: [0, 1, 0.2] });
  });
  const pend = pos(collar.at(0));
  b.part(sphereG(6, 4), LEATHER_D, {
    bone: spine.joints[1],
    at: [pend.x, pend.y - 0.005, pend.z + 0.012],
    scale: [0.02, 0.018, 0.02],
  });
  b.rod([pend.x, pend.y - 0.005, pend.z + 0.012], [pend.x, pend.y - 0.058, pend.z + 0.045], 0.008, {
    color: LEATHER_D,
    bone: spine.joints[1],
  });
  skull([pend.x, pend.y - 0.108, pend.z + 0.048], [0, -0.2, 1], 0.12, spine.joints[1], { eye: GLOWG });
  feathers(
    [[pend.x - 0.04, pend.y - 0.17, pend.z + 0.055], [pend.x + 0.04, pend.y - 0.17, pend.z + 0.055]],
    spine.joints[1],
    [0.07, 0.11],
    [0, 0, 1],
    40,
  );

  // =============================================================================================================
  // Setting: mud base, runes, puddles
  const outline: Array<[number, number]> = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r = 1.08 + 0.04 * Math.sin(3 * a + 0.5) + 0.03 * Math.sin(7 * a + 1.2);
    outline.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  b.extrude(outline, { at: [0, G / 2, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: G, bevel: 0.02, color: MUDP, bone: base });

  glow(
    b.part(new THREE.CircleGeometry(0.68, 32), "#ffffff", {
      bone: base,
      at: [0, G + 0.004, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNES,
    }),
    0.15,
  );

  const puddle = (x: number, z: number, r: number) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.01, 12), "#17302d", { bone: base, at: [x, G + 0.002, z] });
    b.part(new THREE.CircleGeometry(r * 0.35, 8), "#ffffff", {
      bone: base,
      at: [x + r * 0.2, G + 0.009, z - r * 0.1],
      dir: [0, 1, 0],
      axis: "z",
      texture: LILY,
    });
    b.part(new THREE.CircleGeometry(r * 0.26, 8), "#ffffff", {
      bone: base,
      at: [x - r * 0.35, G + 0.0095, z + r * 0.25],
      dir: [0, 1, 0],
      axis: "z",
      texture: LILY,
      rotation: [0, 0, 70],
    });
  };
  puddle(0.4, 0.7, 0.2);
  puddle(-0.4, 0.72, 0.2);

  // stones
  for (const [x, z, r] of [[0.92, -0.02, 0.1], [-0.92, -0.15, 0.09], [0.02, 0.97, 0.08], [0.4, -0.85, 0.09], [-0.35, -0.88, 0.07]] as number[][])
    blob(STONEP, base, [x, G + r * 0.25, z], [r, r * 0.55, r * 0.9], { flat: true });

  // mushrooms
  const mushroom = (x: number, z: number, k: number) => {
    b.part(new THREE.CylinderGeometry(0.018 * k, 0.026 * k, 0.07 * k, 6), "#d8cfa8", { bone: base, at: [x, G + 0.035 * k, z] });
    const cap = b.lathe([[0, 0], [0.11 * k, 0], [0.105 * k, 0.025 * k], [0.07 * k, 0.055 * k], [0, 0.07 * k]], {
      at: [x, G + 0.065 * k, z],
      segments: 8,
      color: "#7a5580",
      bone: base,
    });
    glow(cap, 0.2);
    for (const [dx, dz] of [[0.04, 0.02], [-0.03, 0.05], [0.0, -0.05]])
      b.part(sphereG(5, 4), "#f2e8c8", { bone: base, at: [x + dx * k, G + 0.1 * k, z + dz * k], scale: [0.014 * k, 0.008 * k, 0.014 * k] });
  };
  mushroom(0.78, 0.42, 0.9);
  mushroom(0.84, 0.28, 0.6);
  mushroom(-0.8, 0.36, 0.9);
  mushroom(-0.68, 0.55, 0.6);

  // ground bones
  boneRod([-0.18, G + 0.025, 0.72], [0.05, G + 0.025, 0.78], 0.016, base);
  boneRod([-0.1, G + 0.025, -0.8], [0.15, G + 0.025, -0.9], 0.014, base);
  skull([0.55, G + 0.055, -0.2], [-0.4, 0, 1], 0.11, base, { eye: GLOWG });

  // =============================================================================================================
  // Totem pole
  const TS = 0.52;
  const TX = 0.72;
  const TZ = -0.65;
  const yaw = -48;
  const ya = (yaw * Math.PI) / 180;
  const ty = (y: number) => G + y * TS;
  const sc = (o: Outline): Outline =>
    o.map((p) => (p.length === 3 ? [p[0] * TS, p[1] * TS, "sharp"] : [p[0] * TS, p[1] * TS])) as Outline;
  b.part(new THREE.CylinderGeometry(0.09 * TS, 0.11 * TS, 1.5 * TS, 8), WOODP, { bone: base, at: [TX, ty(0.75), TZ] });
  const faces = [TOTEM_TROLL, TOTEM_BIRD, TOTEM_SPIRIT];
  faces.forEach((tex, i) => {
    b.part(new THREE.BoxGeometry(0.34 * TS, 0.3 * TS, 0.34 * TS), "#ffffff", {
      bone: base,
      at: [TX, ty(0.5 + i * 0.32), TZ],
      rotation: [0, yaw, 0],
      texture: tex,
    });
  });
  for (const y of [0.34, 0.66, 0.98, 1.3])
    b.part(new THREE.BoxGeometry(0.39 * TS, 0.035 * TS, 0.39 * TS), RED_D, { bone: base, at: [TX, ty(y), TZ], rotation: [0, yaw, 0] });
  for (const y of [0.2, 1.42])
    b.part(new THREE.TorusGeometry(0.105 * TS, 0.014 * TS, 5, 10), LEATHER, { bone: base, at: [TX, ty(y), TZ], rotation: [90, 0, 0] });
  // wings
  const xd: V = [Math.cos(ya), 0, -Math.sin(ya)];
  for (const s of [1, -1])
    b.extrude(
      sc([[0.14, 0.04], [0.5, 0.2, "sharp"], [0.42, 0.02], [0.46, -0.1, "sharp"], [0.34, -0.06], [0.3, -0.2, "sharp"], [0.14, -0.1]]),
      { at: [TX, ty(0.82), TZ], x: [xd[0] * s, 0, xd[2] * s], y: [0, 1, 0], thickness: 0.03 * TS, color: WINGP, bone: base },
    );
  // crowning skull, horns and feathers
  const face: V = [-0.75, 0, 0.66];
  const crown = skull([TX, ty(1.5), TZ], face, 0.24 * TS, base, { eye: GLOWG });
  const hornTips: V[] = [];
  for (const s of [1, -1]) {
    const hp = bezier(crown.L(s * 0.45, 0.2, 0), crown.L(s * 0.85, 0.3, -0.05), crown.L(s * 0.8, 0.95, 0));
    b.sweep(hp, [0.034 * TS, 0.004], { color: BONE_D, bone: base });
    hornTips.push(arr(pos(hp.at(0.75))));
  }
  feathers(hornTips, base, [0.07 * TS, 0.3 * TS]);
  feathers([crown.L(0, 0.55, -0.3), crown.L(0.2, 0.5, -0.3), crown.L(-0.2, 0.5, -0.3)], base, [0.07 * TS, 0.3 * TS], [0, 0, 1]);
  // fetishes hanging from the wings
  for (const s of [1, -1]) {
    const wp = [TX + xd[0] * s * 0.4 * TS, ty(0.8), TZ + xd[2] * s * 0.4 * TS] as V;
    fetish([wp[0], wp[1] - 0.02 * TS, wp[2]], base, 0.9 * TS);
  }
  // skull-and-bone pile at the foot
  skull([TX - 0.22 * TS, G + 0.04, TZ + 0.3 * TS], [-0.6, 0, 0.8], 0.1 * TS, base);
  boneRod([TX - 0.35 * TS, G + 0.02, TZ + 0.1 * TS], [TX - 0.1 * TS, G + 0.02, TZ + 0.38 * TS], 0.012, base);

  // =============================================================================================================
  // Cauldron
  const CS = 0.65;
  const CX = -0.68;
  const CZ = -0.58;
  const cy = (y: number) => G + y * CS;
  b.lathe(
    ([[0, 0.06], [0.15, 0.03], [0.27, 0.1], [0.33, 0.22], [0.32, 0.34], [0.28, 0.4], [0, 0.4]] as Array<[number, number]>).map(
      ([x, y]) => [x * CS, y * CS] as [number, number],
    ),
    {
      at: [CX, G, CZ],
      segments: 10,
      color: POTP,
      bone: base,
    },
  );
  b.part(new THREE.TorusGeometry(0.29 * CS, 0.032 * CS, 5, 12), IRON, { bone: base, at: [CX, cy(0.4), CZ], rotation: [90, 0, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.265 * CS, 0.265 * CS, 0.012, 12), "#6dd36a", { bone: base, at: [CX, cy(0.403), CZ] }), 1.3);
  for (const a of [0, 120, 240]) {
    const r = (a * Math.PI) / 180;
    b.part(new THREE.CylinderGeometry(0.03 * CS, 0.045 * CS, 0.1 * CS, 5), IRON, {
      bone: base,
      at: [CX + Math.cos(r) * 0.22 * CS, cy(0.04), CZ + Math.sin(r) * 0.22 * CS],
    });
    glow(
      b.part(new THREE.ConeGeometry(0.05 * CS, 0.14 * CS, 5), "#9dff7a", {
        bone: base,
        at: [CX + Math.cos(r + 1.0) * 0.12 * CS, cy(0.08), CZ + Math.sin(r + 1.0) * 0.12 * CS],
      }),
      1.2,
    );
  }
  for (const s of [1, -1])
    b.part(new THREE.TorusGeometry(0.05 * CS, 0.01 * CS, 5, 8), IRON, { bone: base, at: [CX + s * 0.33 * CS, cy(0.34), CZ], rotation: [0, 90, 0] });
  b.rod([CX + 0.08 * CS, cy(0.38), CZ + 0.02 * CS], [CX - 0.22 * CS, cy(0.9), CZ + 0.14 * CS], 0.016, { color: WOODP, bone: base });
  for (const [dx, dy, dz, r] of [[0.08, 0.46, 0.05, 0.035], [-0.1, 0.5, -0.08, 0.026], [0.02, 0.58, -0.02, 0.02], [-0.04, 0.7, 0.06, 0.016]] as number[][])
    glow(b.part(sphereG(6, 4), GLOWG, { bone: base, at: [CX + dx * CS, cy(dy), CZ + dz * CS], scale: [r * CS, r * CS, r * CS] }), 1.4);

  // floating wisps
  for (const [x, y, z] of [[0.35, 0.95, -0.7], [-0.4, 1.0, -0.9], [0.9, 1.35, -0.2], [-1.0, 0.9, 0.0], [0.5, 1.25, -1.0]] as number[][])
    glow(b.part(sphereG(6, 4), GLOWG, { bone: base, at: [x, G + y - 0.3, z], scale: [0.02, 0.026, 0.02] }), 1.5);

  // =============================================================================================================
  // Reeds around the back and sides
  const reedFrames = [];
  const polar = (deg: number, r: number): V => {
    const a = (deg * Math.PI) / 180;
    return [Math.sin(a) * r, G, Math.cos(a) * r];
  };
  for (let i = 0; i < 9; i++) reedFrames.push(frame(polar(150 + i * 6.5, 0.97 + 0.06 * R()), [0, 1, 0]));
  for (const a of [100, 108, 116]) reedFrames.push(frame(polar(a, 1.0 + 0.04 * R()), [0, 1, 0]));
  b.cards(reedFrames, REED, { size: [0.07, 0.42], lean: 4, bend: 16, vary: 0.3, spin: 80, rng: R, cross: true, bone: base });

  return b.root;
}
