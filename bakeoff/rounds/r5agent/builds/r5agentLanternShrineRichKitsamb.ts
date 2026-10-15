// Wayside lantern shrine: a roadside hokora on a stone plinth with a vermilion torii, stone and paper lanterns,
// kitsune guardians, offerings, ema plaques and a sakura. Genshin Impact look: toon-cel paints, gold filigree,
// tassels and Electro-purple glow.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { grain, mottle, noise, paint, spots, stripes } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import type { SweepOptions } from "../../../../src/sweep";
import type { Radius } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Wayside Lantern Shrine",
  description:
    "A roadside hokora on a mossy stone plinth with a vermilion torii, glowing stone and paper lanterns, kitsune guardians holding an Electro orb and a scroll, an offering table, sake barrels, ema plaques, a basin, a sacred rock and a sakura in bloom.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];
const D = Math.PI / 180;
const G = 0.1; // ground top
const PL = G + 0.28; // shrine platform top
const WALL = PL + 0.95; // hall wall top
const YE = 1.4; // roof eave line

const b = createBuilder({ name: "lanternShrine", paintSize: 2048 });
const root = b.joint("shrine", { at: [0, 0, 0] });

// ---------------------------------------------------------------------------------------------------------------
// Local frames: build a part in its own coordinates, then place and turn the whole group.
// ---------------------------------------------------------------------------------------------------------------
type Fr = {
  yaw: number;
  pt: (x: number, y: number, z: number) => V;
  dir: (x: number, y: number, z: number) => V;
  qOf: (rot?: V) => THREE.Quaternion;
  sub: (x: number, y: number, z: number, yaw?: number) => Fr;
};
function frameAt(ox: number, oy: number, oz: number, yaw = 0): Fr {
  const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * D);
  const fr: Fr = {
    yaw,
    pt: (x, y, z) => {
      const v = new THREE.Vector3(x, y, z).applyQuaternion(qy);
      return [v.x + ox, v.y + oy, v.z + oz];
    },
    dir: (x, y, z) => new THREE.Vector3(x, y, z).applyQuaternion(qy).toArray() as V,
    qOf: (rot = [0, 0, 0]) =>
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)).premultiply(qy),
    sub: (x, y, z, dy = 0) => {
      const p = fr.pt(x, y, z);
      return frameAt(p[0], p[1], p[2], yaw + dy);
    },
  };
  return fr;
}
const ID = frameAt(0, 0, 0, 0);

type O = {
  F?: Fr;
  rot?: V;
  bone?: Joint;
  name?: string;
  tex?: THREE.Texture;
  flat?: boolean;
  seg?: number;
  seg2?: number;
  spin?: number;
};

const sph = (at: V, rad: number | V, color: Fill, o: O = {}) => {
  const F = o.F ?? ID;
  return b.part(new THREE.SphereGeometry(1, o.seg ?? 8, o.seg2 ?? 6), color, {
    bone: o.bone ?? root,
    at: F.pt(...at),
    quat: F.qOf(o.rot),
    scale: rad,
    texture: o.tex,
    name: o.name,
    flat: o.flat,
  });
};

/** Bevelled box standing on `at` (bottom centre), or centred on it with `mid`. */
function bx(w: number, h: number, d: number, color: Fill, at: V, o: O & { bev?: number; mid?: boolean } = {}) {
  const F = o.F ?? ID;
  const q = F.qOf(o.rot);
  const X = new THREE.Vector3(1, 0, 0).applyQuaternion(q).toArray() as V;
  const Y = new THREE.Vector3(0, 1, 0).applyQuaternion(q).toArray() as V;
  const y0 = o.mid ? -h / 2 : 0;
  const bevel = Math.min(o.bev ?? 0.008, Math.min(w, h, d) * 0.4);
  return b.extrude(
    [
      [-w / 2, y0],
      [w / 2, y0],
      [w / 2, y0 + h],
      [-w / 2, y0 + h],
    ],
    {
      at: F.pt(...at),
      x: X,
      y: Y,
      thickness: d,
      bevel,
      detail: 0.34,
      color,
      bone: o.bone ?? root,
      name: o.name,
    },
  );
}

/** Cylinder standing on `at` (base centre). */
function cyl(rt: number, rb: number, h: number, color: Fill, at: V, o: O = {}) {
  const F = o.F ?? ID;
  const g = new THREE.CylinderGeometry(rt, rb, h, o.seg ?? 10, 1);
  g.translate(0, h / 2, 0);
  return b.part(g, color, { bone: o.bone ?? root, at: F.pt(...at), quat: F.qOf(o.rot), name: o.name, flat: o.flat });
}

function lat(outline: OutlinePoint[], color: Fill, at: V, o: O = {}) {
  const F = o.F ?? ID;
  return b.lathe(outline, {
    at: F.pt(...at),
    color,
    segments: o.seg ?? 10,
    spin: o.spin,
    bone: o.bone ?? root,
    name: o.name,
    smoothing: 0,
    detail: 0.5,
  });
}

function tube(
  pts: V[],
  r: Radius,
  color: Fill,
  o: O & { closed?: boolean; poly?: boolean; sides?: number } = {},
  extra: Partial<SweepOptions> = {},
) {
  const F = o.F ?? ID;
  const P = pts.map((p) => F.pt(...p));
  const path = o.poly ? polyline(P, { closed: o.closed }) : catmull(P, { closed: o.closed });
  return b.sweep(path, r, { bone: o.bone ?? root, color, sides: o.sides ?? 8, name: o.name, ...extra });
}

function plane(tex: THREE.Texture, w: number, h: number, at: V, dir: V, o: O = {}) {
  const F = o.F ?? ID;
  return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
    bone: o.bone ?? root,
    at: F.pt(...at),
    dir: F.dir(...dir),
    axis: "z",
    texture: tex,
    name: o.name,
  });
}

function batch(color: Fill, bone: Joint = root) {
  const geos: THREE.BufferGeometry[] = [];
  return {
    add(g: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0], scale: V = [1, 1, 1]) {
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(...at),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)),
        new THREE.Vector3(...scale),
      );
      geos.push(g.clone().applyMatrix4(m));
    },
    done(name?: string) {
      return b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0], name });
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Textures: every drawing is an SVG, transparent where the surface is cut away.
// ---------------------------------------------------------------------------------------------------------------
const S = (w: number, h: number, body: string, size = 256) =>
  svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`, { size });

const GOLD_T = "#ffd460";
const BOLT = "70,14 38,70 58,70 48,114 92,52 70,52 84,14";

const TUFT = S(
  48,
  56,
  `<path d="M2 56 C5 36 8 22 4 6 C14 18 19 34 21 56Z" fill="#5db35a"/>
   <path d="M15 56 C15 36 22 14 27 0 C33 16 33 38 33 56Z" fill="#7ad06b"/>
   <path d="M28 56 C32 40 38 26 46 12 C45 30 42 44 45 56Z" fill="#5db35a"/>
   <path d="M22 56 C23 40 26 28 27 12 C30 30 29 44 31 56Z" fill="#a4e583"/>`,
  128,
);
const PETAL = S(
  24,
  24,
  `<path d="M12 23 C1 16 1 6 12 1 C23 6 23 16 12 23Z" fill="#ffc4d8"/><path d="M12 23 C7 18 7 10 12 6 C11 12 12 18 12 23Z" fill="#ff9fc2"/>`,
  64,
);
const BLOSSOM = S(
  64,
  64,
  `<g transform="translate(32 34)">${[0, 72, 144, 216, 288]
    .map(
      (a) =>
        `<g transform="rotate(${a})"><path d="M0 0 C-13 -8 -13 -27 0 -31 C13 -27 13 -8 0 0Z" fill="#ffbfd6"/><path d="M0 0 C-6 -6 -6 -17 0 -21 C6 -17 6 -6 0 0Z" fill="#ff93bb"/></g>`,
    )
    .join("")}<circle r="5" fill="#ffe27a"/></g>`,
  128,
);
const LEAF = S(
  32,
  48,
  `<path d="M16 48 C0 36 2 12 16 0 C30 12 32 36 16 48Z" fill="#6ac85c"/><path d="M16 0 C30 12 32 36 16 48 L16 8Z" fill="#8fe070"/><path d="M16 46 L16 8" stroke="#3f9a4c" stroke-width="2.6"/>`,
  96,
);
const SHIDE = S(
  32,
  96,
  `<rect x="9" y="0" width="14" height="8" fill="#fffaf0"/>
   <polyline points="16,6 27,22 6,38 27,54 6,70 24,84 16,95" fill="none" stroke="#fffaf0" stroke-width="10" stroke-linejoin="miter"/>
   <polyline points="16,8 24,22 8,38 24,54 8,70 21,82" fill="none" stroke="#dcd2ec" stroke-width="3"/>`,
  192,
);
const TASSEL = S(
  24,
  72,
  `<circle cx="12" cy="6" r="5" fill="#ffd460"/><rect x="9" y="10" width="6" height="4" fill="#e0963a"/>
   <path d="M12 14 V34" stroke="#d63a35" stroke-width="3.4"/>
   <circle cx="12" cy="37" r="6" fill="#ffd460"/><circle cx="10" cy="35" r="2" fill="#fff0b0"/>
   <path d="M12 43 L3 70 M12 43 L8 71 M12 43 L12 72 M12 43 L16 71 M12 43 L21 70" stroke="#e24a3a" stroke-width="2.6" stroke-linecap="round"/>
   <path d="M12 43 L6 70 M12 43 L18 70" stroke="#ffd460" stroke-width="2.6" stroke-linecap="round"/>`,
  144,
);
const SMOKE = S(
  32,
  96,
  `<path d="M16 96 C3 80 29 70 14 52 C2 36 27 24 16 3" fill="none" stroke="#eeeaf8" stroke-width="5" stroke-linecap="round"/>
   <path d="M17 94 C6 80 27 70 15 52" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`,
  192,
);
const CREST = S(
  128,
  128,
  `<circle cx="64" cy="64" r="62" fill="#3a2d6b"/>
   <circle cx="64" cy="64" r="58" fill="none" stroke="${GOLD_T}" stroke-width="5"/>
   <circle cx="64" cy="64" r="49" fill="none" stroke="#ffe9a0" stroke-width="2.4"/>
   <polygon points="${BOLT}" fill="#c78bff"/>
   <polygon points="68,30 50,64 66,64 58,94 80,58 66,58 76,30" fill="#f0d6ff"/>
   ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<circle cx="64" cy="14" r="3.2" fill="${GOLD_T}" transform="rotate(${a} 64 64)"/>`).join("")}`,
  256,
);
const doorTex = (bossRight: boolean) => {
  let lat = "";
  for (let i = -130; i < 170; i += 15) {
    lat += `<path d="M0 ${i} L40 ${i + 40}" stroke="#ffd460" stroke-width="1.5" opacity="0.85"/>`;
    lat += `<path d="M0 ${i + 40} L40 ${i}" stroke="#ffd460" stroke-width="1.5" opacity="0.85"/>`;
  }
  return S(
    40,
    120,
    `<rect width="40" height="120" fill="#3b2b5e"/>${lat}
     <rect x="0" y="6" width="40" height="7" fill="#2a1f45"/><rect x="0" y="56" width="40" height="8" fill="#2a1f45"/><rect x="0" y="107" width="40" height="7" fill="#2a1f45"/>
     <rect x="0" y="8" width="40" height="3" fill="${GOLD_T}"/><rect x="0" y="59" width="40" height="3" fill="${GOLD_T}"/><rect x="0" y="109" width="40" height="3" fill="${GOLD_T}"/>
     <rect x="1.5" y="1.5" width="37" height="117" fill="none" stroke="${GOLD_T}" stroke-width="3"/>
     <circle cx="${bossRight ? 33 : 7}" cy="61" r="5" fill="#ffe9a0" stroke="#e0963a" stroke-width="1.6"/>
     <circle cx="${bossRight ? 33 : 7}" cy="61" r="1.8" fill="#e0963a"/>`,
    240,
  );
};
const DOOR_L = doorTex(false);
const DOOR_R = doorTex(true);
const ROUNDWIN = S(
  64,
  64,
  `<circle cx="32" cy="32" r="31" fill="#3b2b5e"/><circle cx="32" cy="32" r="28" fill="none" stroke="${GOLD_T}" stroke-width="4"/>
   ${[0, 45, 90, 135].map((a) => `<path d="M32 4 V60" stroke="${GOLD_T}" stroke-width="2" transform="rotate(${a} 32 32)"/>`).join("")}
   <circle cx="32" cy="32" r="9" fill="#3b2b5e" stroke="${GOLD_T}" stroke-width="2.4"/><circle cx="32" cy="32" r="3" fill="#c78bff"/>`,
  128,
);
const PLAQUE = S(
  80,
  100,
  `<rect width="80" height="100" fill="#241c3a"/>
   <rect x="2" y="2" width="76" height="96" fill="none" stroke="${GOLD_T}" stroke-width="3"/>
   <rect x="7" y="7" width="66" height="86" fill="none" stroke="#e0963a" stroke-width="1.4"/>
   <circle cx="40" cy="50" r="25" fill="#3a2d6b" stroke="${GOLD_T}" stroke-width="3"/>
   <polygon points="43,30 28,53 38,53 33,72 52,47 43,47 49,30" fill="#c78bff"/>
   <path d="M12 90 C12 72 28 78 28 87 C28 93 20 93 20 88" fill="none" stroke="${GOLD_T}" stroke-width="2.4"/>
   <path d="M68 90 C68 72 52 78 52 87 C52 93 60 93 60 88" fill="none" stroke="${GOLD_T}" stroke-width="2.4"/>
   <path d="M12 10 C12 28 28 22 28 13 C28 7 20 7 20 12" fill="none" stroke="${GOLD_T}" stroke-width="2.4"/>
   <path d="M68 10 C68 28 52 22 52 13 C52 7 60 7 60 12" fill="none" stroke="${GOLD_T}" stroke-width="2.4"/>`,
  240,
);
const SAISEN = S(
  100,
  36,
  `<rect width="100" height="36" fill="#4a2f3e"/>
   <rect x="1.5" y="1.5" width="97" height="33" fill="none" stroke="${GOLD_T}" stroke-width="3"/>
   <circle cx="50" cy="18" r="12" fill="#3a2d6b" stroke="${GOLD_T}" stroke-width="2.6"/>
   <polygon points="52,8 44,19 49,19 47,28 56,17 51,17 54,8" fill="#c78bff"/>
   <path d="M10 18 C10 8 22 10 22 17 C22 22 16 22 16 18 M22 17 H36" fill="none" stroke="${GOLD_T}" stroke-width="2.4"/>
   <path d="M90 18 C90 8 78 10 78 17 C78 22 84 22 84 18 M78 17 H64" fill="none" stroke="${GOLD_T}" stroke-width="2.4"/>`,
  300,
);
const LANTERN_WIN = S(
  40,
  56,
  `<path d="M4 54 V22 Q20 -4 36 22 V54Z" fill="#ffb347"/><path d="M9 50 V24 Q20 6 31 24 V50Z" fill="#fff0b0"/>
   <path d="M20 4 V54 M4 38 H36" stroke="#6a4a3a" stroke-width="2.6"/>`,
  160,
);
const chochinTex = () => {
  let ribs = "";
  for (let y = 12; y < 124; y += 11) ribs += `<path d="M0 ${y} H256" stroke="#e5622f" stroke-width="3"/>`;
  let crests = "";
  for (let k = 0; k < 4; k++) {
    const x = 32 + 64 * k;
    crests += `<circle cx="${x}" cy="64" r="17" fill="#fff4d6" stroke="#e0963a" stroke-width="3"/><polygon points="${x + 2},50 ${x - 8},66 ${x},66 ${x - 4},80 ${x + 9},62 ${x + 1},62 ${x + 6},50" fill="#8c5be0"/>`;
  }
  return S(
    256,
    128,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7e4f"/><stop offset="0.5" stop-color="#ffd08a"/><stop offset="1" stop-color="#ff7e4f"/></linearGradient></defs>
     <rect width="256" height="128" fill="url(#g)"/>${ribs}${crests}`,
    256,
  );
};
const CHO = chochinTex();
const OFUDA = S(
  24,
  64,
  `<rect x="1" y="1" width="22" height="62" fill="#fff4dc" stroke="#d63a35" stroke-width="1.8"/>
   <path d="M12 8 V50 M6 18 H18 M7 30 H17 M8 42 H16" stroke="#d63a35" stroke-width="2.2"/>
   <rect x="8" y="52" width="8" height="8" fill="#8c5be0"/>`,
  192,
);
const LABEL = S(
  64,
  80,
  `<rect x="3" y="3" width="58" height="74" rx="4" fill="#e8402e" stroke="${GOLD_T}" stroke-width="2.6"/>
   <circle cx="32" cy="30" r="16" fill="#fff4dc"/><polygon points="34,17 25,32 31,32 29,44 40,28 34,28 38,17" fill="#8c5be0"/>
   <path d="M10 58 Q20 50 32 58 T54 58" stroke="#fff4dc" stroke-width="3" fill="none"/><path d="M10 68 Q20 60 32 68 T54 68" stroke="#fff4dc" stroke-width="3" fill="none"/>`,
  192,
);
const MARKER = S(
  48,
  120,
  `<circle cx="24" cy="16" r="9" fill="none" stroke="#56628a" stroke-width="3.2"/>
   <path d="M24 28 V104 M8 44 H40 M12 60 H36 M16 76 H32" stroke="#56628a" stroke-width="3.4" stroke-linecap="round"/>
   <path d="M8 96 Q16 88 24 96 T40 96" fill="none" stroke="#56628a" stroke-width="3.2"/>`,
  240,
);
const EMA_BG = `<path d="M48 3 L92 27 V77 H4 V27 Z" fill="#ecc27e" stroke="#7a4a3a" stroke-width="3" stroke-linejoin="round"/><path d="M48 9 L86 30 V71 H10 V30Z" fill="none" stroke="#c88c52" stroke-width="1.6"/>`;
const emaFace = (art: string) => S(96, 80, EMA_BG + art, 192);
const EMA = [
  emaFace(
    `<path d="M24 66 L20 36 L35 44 H61 L76 36 L72 66 L48 73 Z" fill="#fff7ee" stroke="#4a3050" stroke-width="2.4" stroke-linejoin="round"/>
     <path d="M20 36 L26 22 L38 44Z" fill="#e8402e"/><path d="M76 36 L70 22 L58 44Z" fill="#e8402e"/>
     <path d="M31 55 Q36 49 42 55 M54 55 Q60 49 65 55" stroke="#4a3050" stroke-width="2.8" fill="none"/>
     <circle cx="48" cy="64" r="3.4" fill="#4a3050"/><path d="M22 60 L33 62 M74 60 L63 62" stroke="#e8402e" stroke-width="2.6"/>`,
  ),
  emaFace(
    `<g transform="translate(48 48)">${[0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<g transform="rotate(${a})"><path d="M0 0 C-12 -6 -12 -22 0 -26 C12 -22 12 -6 0 0Z" fill="#ffb3cf" stroke="#d96b98" stroke-width="1.6"/></g>`,
      )
      .join("")}<circle r="5" fill="#ffe27a"/></g>`,
  ),
  emaFace(
    `<circle cx="48" cy="50" r="22" fill="#3a2d6b" stroke="#ffd460" stroke-width="3"/>
     <polygon points="51,32 38,53 47,53 43,69 59,47 50,47 56,32" fill="#c78bff" stroke="#f0d6ff" stroke-width="1.2"/>`,
  ),
  emaFace(
    `<path d="M62 30 A22 22 0 1 0 62 70 A17 17 0 1 1 62 30Z" fill="#ffd460" stroke="#e0963a" stroke-width="2"/>
     <polygon points="68,40 70,46 76,46 71,50 73,56 68,52 63,56 65,50 60,46 66,46" fill="#fff0b0"/>`,
  ),
  emaFace(
    `<path d="M48 30 V68" stroke="#a06a3a" stroke-width="3"/>
     <circle cx="48" cy="34" r="8" fill="#ffb3cf" stroke="#d96b98" stroke-width="1.6"/><circle cx="48" cy="48" r="8" fill="#fffaf0" stroke="#c8b8c8" stroke-width="1.6"/><circle cx="48" cy="62" r="8" fill="#9ed985" stroke="#5fa55a" stroke-width="1.6"/>`,
  ),
];
const EMA_BACK = S(
  96,
  80,
  `<path d="M48 3 L92 27 V77 H4 V27 Z" fill="#d9a468" stroke="#7a4a3a" stroke-width="3" stroke-linejoin="round"/>
   <path d="M24 40 H72 M24 52 H66 M24 64 H58" stroke="#8a5a3a" stroke-width="3" stroke-linecap="round"/>`,
  192,
);
const flowerTex = (col: string, dark: string) =>
  S(
    24,
    40,
    `<path d="M12 40 V16" stroke="#4fa150" stroke-width="2.6"/><path d="M12 30 Q5 28 4 22 Q10 22 12 30Z" fill="#6ac85c"/>
     ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="12" cy="8" rx="3.6" ry="5" fill="${col}" stroke="${dark}" stroke-width="0.8" transform="rotate(${a} 12 13)"/>`).join("")}
     <circle cx="12" cy="13" r="2.6" fill="#ffe27a"/>`,
    96,
  );
const FLOWER_A = flowerTex("#c9a6ff", "#8c5be0");
const FLOWER_B = flowerTex("#fffaf0", "#cbb8d8");

// ---------------------------------------------------------------------------------------------------------------
// Palette: cel paints (lit tone + hue-shifted shadow); flat colours only for the glow.
// ---------------------------------------------------------------------------------------------------------------
const VERM = cel("#e8402e", "#b3262f");
const VERM_WOOD = cel(grain("#e8402e", "#d6372b", { size: 0.035, axis: "y", seed: 2 }), "#a8252e");
const VERM_WOOD_X = cel(grain("#e8402e", "#d6372b", { size: 0.035, axis: "x", seed: 3 }), "#a8252e");
const BLACK = cel("#2d2542", "#1a1530");
const GOLD = cel("#ffd460", "#d98f3a");
const WOOD = cel(grain("#b97a4e", "#a46a45", { size: 0.03, axis: "x", seed: 4 }), "#7a4b50");
const WOOD_Z = cel(grain("#b97a4e", "#a46a45", { size: 0.03, axis: "z", seed: 4 }), "#7a4b50");
const WOOD_Y = cel(grain("#b97a4e", "#a46a45", { size: 0.03, axis: "y", seed: 5 }), "#7a4b50");
const WOOD_D = cel(grain("#6c4660", "#5d3b55", { size: 0.03, axis: "x", seed: 6 }), "#43294a");
const WOOD_DY = cel(grain("#6c4660", "#5d3b55", { size: 0.03, axis: "y", seed: 7 }), "#43294a");
const PLASTER = cel(stripes("#f4ebd8", "#e6d9c4", { size: 0.07, axis: "x", width: 0.1, wobble: 0.1, seed: 4 }), "#cdb9c4");
const PAPER = cel("#fff6e0", "#e8d2cc");
const STRAW = cel("#ecd48c", "#c79f5e");
const PINK = cel(mottle("#ffb6d0", "#ffd3e3", { size: 0.35, seed: 5 }), "#e585b5");
const BARK = cel(grain("#8a6070", "#6d4a62", { size: 0.04, axis: "y", seed: 8 }), "#4d3558");
const LEAFG = cel(mottle("#6ec760", "#8be070", { size: 0.3, seed: 6 }), "#3f9a6a");
const SOIL = cel("#7a5a4a", "#5a4358");
const MOSS_C = "#79b85a";
const BAMBOO = cel(grain("#a8cf70", "#8fbd5e", { size: 0.04, axis: "y", seed: 3 }), "#5f9a62");
const CLOTH = cel(
  paint((p, n) => {
    const edge = Math.max(Math.abs(p.x - 1.9) - 0.42, Math.abs(p.z - 0.25) - 0.22);
    return n.y > 0.5 && edge > -0.045 ? "#6a4aa8" : "#f6efe0";
  }),
  "#cdbfd0",
);

function stoneP(y0: number, seed = 1, moss = 1) {
  const base = mottle("#d3d0e4", "#e4e1f1", { size: 0.14, seed });
  return cel(
    paint((p, n) => {
      const m = noise(p, 0.22, seed + 7);
      const low = p.y - y0;
      if (moss > 0 && (low < 0.03 + 0.11 * m * moss || (m > 0.8 && n.y > 0.3))) return MOSS_C;
      return base;
    }),
  );
}
const STONE = stoneP(G, 1);
const STONE_D = cel(mottle("#aba8c9", "#bdbad6", { size: 0.14, seed: 3 }));
const STONE_PLAIN = cel(mottle("#d3d0e4", "#e4e1f1", { size: 0.14, seed: 2 }));

// ---------------------------------------------------------------------------------------------------------------
// Ground and the paved approach
// ---------------------------------------------------------------------------------------------------------------
const GX = 2.85;
const GZC = 0.45;
const GZH = 3.05;
const grassBase = mottle("#8fd96e", "#6fc263", { size: 0.55, seed: 4 });
const grassDark = mottle("#6fba62", "#58a85e", { size: 0.5, seed: 9 });
const dirtBase = mottle("#dcc9a4", "#cdb68f", { size: 0.2, seed: 3 });
const gravel = spots("#d8d0c4", "#b3a9b6", { size: 0.06, amount: 0.5, seed: 8 });
const groundPaint = paint((p, n) => {
  if (n.y < 0.5) return SOIL;
  const q = (p.x / GX) ** 2 + ((p.z - GZC) / GZH) ** 2;
  const wob = 0.1 * Math.sin(p.z * 1.7);
  const tooth = 0.05 * zigzag(p.z / 0.16);
  if (p.z > -0.25 && p.z > 0.0 && Math.abs(p.x - wob) < 0.66 + tooth) return dirtBase;
  if (Math.abs(p.x) < 1.68 + 0.05 * zigzag(p.z / 0.2) && p.z < 0.72 + 0.04 * zigzag(p.x / 0.18)) return gravel;
  return q > 0.84 ? grassDark : grassBase;
});
{
  const R = rng(5);
  const outline: OutlinePoint[] = [];
  const N = 40;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const w = 1 + 0.035 * Math.sin(3 * a + 1) + 0.025 * Math.sin(5 * a) + 0.01 * (R() - 0.5);
    const x = GX * Math.sign(c) * Math.pow(Math.abs(c), 0.5) * w;
    const z = GZC + GZH * Math.sign(s) * Math.pow(Math.abs(s), 0.5) * w;
    outline.push([x, -z]);
  }
  b.extrude(outline, {
    at: [0, 0.05, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.1,
    bevel: 0.04,
    detail: 0.5,
    color: groundPaint,
    bone: root,
    name: "ground",
  });
}

function flagstone(cx: number, cz: number, w: number, d: number, yawDeg: number, seed: number, thick = 0.07) {
  const R = rng(seed * 31 + 7);
  const j = () => 1 + (R() - 0.5) * 0.16;
  const sx = w / 2;
  const sz = d / 2;
  const pts: [number, number][] = [
    [-sx * j(), 0.55 * sz],
    [-0.55 * sx, sz * j()],
    [0.55 * sx * j(), sz],
    [sx * j(), 0.35 * sz],
    [0.92 * sx, -0.7 * sz],
    [0.1 * sx, -sz * j()],
    [-0.85 * sx * j(), -0.8 * sz],
  ];
  const F = frameAt(cx, G + thick / 2 - 0.012, cz, yawDeg);
  b.extrude(pts, {
    at: F.pt(0, 0, 0),
    x: F.dir(1, 0, 0),
    y: F.dir(0, 0, -1),
    thickness: thick,
    bevel: 0.016,
    smoothing: 1,
    detail: 0.34,
    color: stoneP(G, 1 + (seed % 3)),
    bone: root,
  });
}
{
  const R = rng(12);
  for (let i = 0; i < 8; i++) {
    const z = 3.2 - i * 0.43;
    const off = (i % 2 ? 0.13 : -0.13) + 0.07 * Math.sin(z * 1.7);
    for (const s of [-1, 1]) {
      flagstone(off + s * 0.265, z + (R() - 0.5) * 0.04, 0.5 + R() * 0.06, 0.37 + R() * 0.04, (R() - 0.5) * 14, i * 2 + (s > 0 ? 1 : 0));
    }
  }
  // wider paving round the offering box
  flagstone(-0.55, 0.0, 0.6, 0.42, 6, 3);
  flagstone(0.5, -0.02, 0.62, 0.4, -5, 5);
  flagstone(0.0, 0.52, 0.72, 0.36, 2, 7);
}

// ---------------------------------------------------------------------------------------------------------------
// Torii
// ---------------------------------------------------------------------------------------------------------------
const TZ = 2.2;
const lanternL = b.joint("lanternL", { parent: root, at: [1.6, 2.3, TZ], role: "hinge" });
const lanternR = b.joint("lanternR", { parent: root, at: [-1.6, 2.3, TZ], role: "hinge" });

function chochin(joint: Joint, top: V, r: number, h: number, withTassel = true, hangCord = 0.1) {
  const [x, y, z] = top;
  tube([[x, y, z], [x, y - hangCord, z]], 0.008, cel("#ffd460", "#d98f3a"), { bone: joint, poly: true, sides: 5 });
  cyl(r * 0.5, r * 0.55, 0.045, BLACK, [x, y - hangCord - 0.045, z], { bone: joint, seg: 8 });
  cyl(r * 0.56, r * 0.56, 0.012, GOLD, [x, y - hangCord - 0.057, z], { bone: joint, seg: 8 });
  const cy = y - hangCord - 0.05 - h / 2;
  glow(sph([x, cy, z], [r, h / 2, r], "#ffffff", { bone: joint, tex: CHO, seg: 12, seg2: 8, rot: [0, 45, 0] }), 1.25);
  cyl(r * 0.55, r * 0.5, 0.045, BLACK, [x, cy - h / 2 - 0.0, z], { bone: joint, seg: 8 });
  cyl(r * 0.56, r * 0.56, 0.012, GOLD, [x, cy - h / 2 + 0.036, z], { bone: joint, seg: 8 });
  if (withTassel) {
    const ty = cy - h / 2;
    sph([x, ty - 0.03, z], 0.014, GOLD, { bone: joint, seg: 6, seg2: 4 });
    b.cards([frame([x, ty - 0.025, z], [0, 1, 0])], TASSEL, {
      size: [0.04, 0.16],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      bone: joint,
    });
  }
}

function torii() {
  const GOLDX = GOLD;
  const px = (y: number) => 1.27 - 0.07 * ((y - G) / 2.9);
  for (const s of [1, -1]) {
    // pillar with black base and gold bands
    b.sweep(
      polyline([
        [s * 1.27, G - 0.02, TZ],
        [s * px(3.0), 3.0, TZ],
      ]),
      [0.165, 0.128],
      { bone: root, color: VERM_WOOD, sides: 10, caps: "flat", name: "toriiPillar" },
    );
    lat(
      [[0, 0], [0.225, 0], [0.225, 0.06], [0.2, 0.12], [0.175, 0.36], [0.19, 0.42], [0.17, 0.45], [0, 0.45]],
      BLACK,
      [s * 1.27, G - 0.02, TZ],
      { seg: 10, name: "toriiFoot" },
    );
    lat([[0.17, 0], [0.205, 0], [0.205, 0.035], [0.17, 0.035]], GOLDX, [s * 1.27, G + 0.33, TZ], { seg: 10 });
    lat([[0.135, 0], [0.16, 0], [0.16, 0.035], [0.135, 0.035]], GOLDX, [s * px(2.9), 2.9, TZ], { seg: 10 });
    // kusabi wedges either side of the pillar on the tie beam
    for (const t of [-1, 1]) bx(0.05, 0.27, 0.16, BLACK, [s * px(2.38) + t * 0.2, 2.25, TZ], { bev: 0.006 });
    // gold cap on the tie-beam end
    bx(0.035, 0.17, 0.15, GOLDX, [s * 1.635, 2.3, TZ], { bev: 0.006 });
    bx(0.02, 0.1, 0.1, VERM, [s * 1.645, 2.335, TZ], { bev: 0.004 });
  }
  // nuki tie beam, shimaki, kasagi
  bx(3.24, 0.15, 0.13, VERM_WOOD_X, [0, 2.31, TZ], { bev: 0.01, name: "nuki" });
  bx(3.5, 0.1, 0.22, BLACK, [0, 2.92, TZ], { bev: 0.01, name: "shimaki" });
  const kasaTop: [number, number][] = [
    [-2.12, 0.3], [-1.7, 0.19], [-1.0, 0.135], [-0.35, 0.12], [0.35, 0.12], [1.0, 0.135], [1.7, 0.19], [2.12, 0.3],
  ];
  const kasaBot: [number, number][] = [
    [2.05, 0.12], [1.5, 0.045], [0.7, 0.005], [0, 0], [-0.7, 0.005], [-1.5, 0.045], [-2.05, 0.12],
  ];
  const kasaPaint = cel(
    paint((_p, n) => {
      if (Math.abs(n.x) > 0.75) return "#ffd460";
      if (n.y < -0.3) return "#171326";
      return "#2a2240";
    }),
    "#15101f",
  );
  b.extrude([...kasaTop, ...kasaBot], {
    at: [0, 3.02, TZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.34,
    bevel: 0.015,
    detail: 0.34,
    color: kasaPaint,
    bone: root,
    name: "kasagi",
  });
  // gold edge lines along the kasagi tips
  for (const s of [1, -1]) {
    bx(0.03, 0.2, 0.36, GOLDX, [s * 2.13, 3.19, TZ], { bev: 0.005, rot: [0, 0, s * -20] });
  }
  // gakuzuka plaque between nuki and shimaki
  bx(0.4, 0.46, 0.07, BLACK, [0, 2.455, TZ], { bev: 0.006, name: "plaque" });
  for (const s of [1, -1]) plane(PLAQUE, 0.39, 0.45, [0, 2.685, s * 0.037], [0, 0, s]);
  // shimenawa rope between the pillars, with shide
  const sag: V[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    sag.push([-1.1 + 2.2 * t, 2.2 - 0.17 * Math.sin(Math.PI * t) - 0.04 * (1 - Math.sin(Math.PI * t)), TZ + 0.12]);
  }
  const ropeP = cel(
    paint((_p, _n, s) => (((((s[1] - s[0] * 7200) % 150) + 150) % 150) < 70 ? "#f3dc98" : "#c79a5a")),
    "#a47a4c",
  );
  tube(sag, [0.035, 0.05, 0.05, 0.05, 0.05, 0.05, 0.035], ropeP, { sides: 8, name: "shimenawa" });
  for (const s of [1, -1]) {
    tube(
      [[s * 1.1, 2.2, TZ + 0.12], [s * 1.2, 2.16, TZ + 0.12], [s * 1.24, 2.0, TZ + 0.12]],
      [0.045, 0.03],
      ropeP,
      { sides: 8, caps: "point" },
    );
  }
  const shideAt = sag.filter((_p, i) => i % 1 === 0 && i > 0 && i < 6).map((p) => frame([p[0], p[1] - 0.04, p[2]], [0, 1, 0]));
  b.cards(shideAt, SHIDE, { size: [0.11, 0.33], lean: 180, flow: [0, 0, 1], cross: false });
  // hanging chochin from the tie-beam ends
  chochin(lanternL, [1.6, 2.3, TZ], 0.16, 0.36);
  chochin(lanternR, [-1.6, 2.3, TZ], 0.16, 0.36);
  // ofuda on the pillars
  for (const s of [1, -1]) {
    plane(OFUDA, 0.07, 0.19, [s * (px(1.6) - 0.002), 1.62, TZ + 0.131], [0, 0, 1]);
    plane(OFUDA, 0.07, 0.19, [s * (px(1.6) - 0.002), 1.62, TZ - 0.131], [0, 0, -1]);
  }
}
torii();

// ---------------------------------------------------------------------------------------------------------------
// Stone lanterns
// ---------------------------------------------------------------------------------------------------------------
function stoneLantern(x: number, z: number, seed: number) {
  const F = frameAt(x, G, z, 0);
  const mp = stoneP(G, seed);
  const hex = { F, seg: 6, spin: 30 };
  const rnd = { F, seg: 8 };
  lat([[0, 0], [0.37, 0], [0.37, 0.07], [0.33, 0.13], [0, 0.13]], mp, [0, 0, 0], { ...hex, name: "lanternBase" });
  lat(
    [[0, 0.13], [0.15, 0.13], [0.115, 0.2], [0.105, 0.31], [0.155, 0.34], [0.155, 0.39], [0.105, 0.42], [0.105, 0.57], [0.15, 0.6], [0, 0.6]],
    mp,
    [0, 0, 0],
    { ...rnd, name: "lanternShaft" },
  );
  lat([[0, 0.6], [0.2, 0.6], [0.31, 0.66], [0.34, 0.71], [0.3, 0.72], [0, 0.72]], mp, [0, 0, 0], { ...hex, name: "lanternDais" });
  for (let k = 0; k < 6; k++) {
    const th = (30 + 60 * k) * D;
    b.spike(
      F.pt(Math.sin(th) * 0.3, 0.7, Math.cos(th) * 0.3),
      F.dir(Math.sin(th) * 0.2, 1, Math.cos(th) * 0.2),
      0.07,
      0.025,
      { bone: root, color: mp, sides: 5 },
    );
  }
  // fire box: glowing core, six posts, panels and windows
  glow(lat([[0, 0.73], [0.17, 0.73], [0.17, 1.05], [0, 1.05]], "#ffb347", [0, 0, 0], { ...hex, name: "lanternFire" }), 1.4);
  const A = 0.184;
  for (let k = 0; k < 6; k++) {
    const th = (30 + 60 * k) * D;
    bx(0.05, 0.33, 0.05, mp, [Math.sin(th) * 0.213, 0.72, Math.cos(th) * 0.213], { F, bev: 0.006 });
  }
  for (let k = 0; k < 6; k++) {
    const th = k * 60 * D;
    const Pk = F.sub(Math.sin(th) * A, 0, Math.cos(th) * A, k * 60);
    if (k % 3 === 0) {
      glow(plane(LANTERN_WIN, 0.2, 0.3, [0, 0.89, 0], [0, 0, 1], { F: Pk }), 1.4);
      bx(0.2, 0.025, 0.03, mp, [0, 0.72, 0.0], { F: Pk, bev: 0.004 });
    } else {
      bx(0.2, 0.31, 0.035, mp, [0, 0.72, 0], { F: Pk, bev: 0.006 });
      cyl(0.055, 0.055, 0.014, STONE_D, [0, 0.875, 0.012], { F: Pk, rot: [90, 0, 0], seg: 8 });
      cyl(0.03, 0.03, 0.016, mp, [0, 0.875, 0.016], { F: Pk, rot: [90, 0, 0], seg: 8 });
    }
  }
  lat([[0, 1.04], [0.27, 1.04], [0.27, 1.085], [0, 1.085]], mp, [0, 0, 0], { ...hex, name: "lanternCeil" });
  const roofP = cel(
    paint((p, _n, s) => {
      const r = Math.hypot(p.x - x, p.z - z);
      if (((s[0] * 1000) % 40 + 40) % 40 < 6 && r > 0.12) return "#8d8ab0";
      return mottle("#cfcce2", "#e2dff0", { size: 0.12, seed });
    }),
  );
  lat(
    [[0, 1.08], [0.5, 1.08], [0.55, 1.14], [0.5, 1.17], [0.38, 1.2], [0.2, 1.29], [0.09, 1.36], [0, 1.385]],
    roofP,
    [0, 0, 0],
    { ...hex, name: "lanternRoof" },
  );
  for (let k = 0; k < 6; k++) {
    const th = (30 + 60 * k) * D;
    const rp: [number, number][] = [[0.06, 1.37], [0.2, 1.3], [0.38, 1.212], [0.5, 1.182], [0.56, 1.162], [0.605, 1.2], [0.625, 1.245]];
    tube(
      rp.map(([r, y]) => [Math.sin(th) * r, y, Math.cos(th) * r] as V),
      [0.02, 0.014],
      mp,
      { F, sides: 5 },
      { caps: { start: "flat", end: "point" } },
    );
    sph([Math.sin(th) * 0.6, 1.17, Math.cos(th) * 0.6], 0.014, GOLD, { F, seg: 5, seg2: 4 });
  }
  // hoshu jewel
  lat([[0.05, 1.37], [0.075, 1.37], [0.075, 1.395], [0.05, 1.395]], GOLD, [0, 0, 0], { F, seg: 8 });
  lat([[0, 1.385], [0.055, 1.385], [0.075, 1.425], [0.06, 1.465], [0.025, 1.52], [0, 1.55]], mp, [0, 0, 0], { F, seg: 8, name: "hoshu" });
  sph([0, 1.56, 0], 0.014, GOLD, { F, seg: 5, seg2: 4 });
}
stoneLantern(1.02, 0.95, 4);
stoneLantern(-1.02, 0.95, 5);

// ---------------------------------------------------------------------------------------------------------------
// Kitsune guardians
// ---------------------------------------------------------------------------------------------------------------
function kitsune(s: 1 | -1) {
  const x = s * 1.55;
  const z = -0.62;
  const mp = stoneP(G, 6 + (s > 0 ? 1 : 0));
  const BASE = frameAt(x, G, z, -s * 14);
  // pedestal
  bx(0.58, 0.1, 0.52, mp, [0, 0, 0], { F: BASE, bev: 0.012, name: "pedestalFoot" });
  bx(0.46, 0.24, 0.4, mp, [0, 0.1, 0], { F: BASE, bev: 0.012, name: "pedestalShaft" });
  bx(0.54, 0.06, 0.48, STONE_PLAIN, [0, 0.34, 0], { F: BASE, bev: 0.012, name: "pedestalTop" });
  for (let k = 0; k < 7; k++) {
    const a = ((k - 3) * 13) * D;
    cyl(0.0, 0.03, 0.05, STONE_PLAIN, [Math.sin(a) * 0.255, 0.4, 0.0 + Math.cos(a) * 0.0 + 0.215 + 0.0], { F: BASE, seg: 4 });
    void a;
  }
  const F = BASE.sub(0, 0.4, 0, 0);
  const fo = { F };
  const fox = stoneP(G + 0.4, 9 + (s > 0 ? 1 : 0));
  const CREAM = cel("#f1ecf8", "#c8c0dc");
  // body
  tube([[0, 0.1, -0.17], [0, 0.25, -0.14], [0, 0.42, -0.03], [0, 0.54, 0.02]], [0.155, 0.17, 0.135, 0.1], fox, { F, sides: 9, name: "foxBody" });
  sph([0, 0.36, 0.06], [0.13, 0.15, 0.11], CREAM, { F, seg: 8, seg2: 6, name: "foxChest" });
  for (const t of [1, -1]) {
    sph([t * 0.13, 0.13, -0.1], [0.085, 0.125, 0.15], fox, { F, name: "foxHaunch" });
    sph([t * 0.15, 0.03, 0.08], [0.05, 0.03, 0.09], fox, { F, seg: 7, seg2: 5, name: "foxHindPaw" });
    // fore legs and paws
    tube([[t * 0.1, 0.44, 0.07], [t * 0.1, 0.22, 0.14], [t * 0.1, 0.045, 0.19]], [0.047, 0.036], fox, { F, sides: 7, name: "foxForeleg" });
    sph([t * 0.1, 0.03, 0.225], [0.05, 0.03, 0.07], fox, { F, seg: 7, seg2: 5, name: "foxForepaw" });
    for (const c of [-1, 0, 1]) b.spike(F.pt(t * 0.1 + c * 0.018, 0.028, 0.285), F.dir(c * 0.1, 0, 1), 0.02, 0.01, { bone: root, color: CREAM, sides: 4 });
  }
  // head
  sph([0, 0.64, 0.07], [0.105, 0.095, 0.1], fox, { F, seg: 9, seg2: 7, name: "foxSkull" });
  tube([[0, 0.635, 0.13], [0, 0.605, 0.21], [0, 0.6, 0.265]], [0.07, 0.05, 0.026], fox, { F, sides: 8, name: "foxMuzzle" });
  sph([0, 0.6, 0.285], 0.022, BLACK, { F, seg: 6, seg2: 5, name: "foxNose" });
  bx(0.075, 0.01, 0.06, CREAM, [0, 0.563, 0.2], { F, bev: 0.003, name: "foxChin" });
  for (const t of [1, -1]) {
    // ears
    b.extrude(
      [[-0.052, 0], [0.052, 0], [0.012, 0.17]],
      { at: F.pt(t * 0.065, 0.69, 0.05), x: F.dir(t, 0, 0), y: F.dir(t * 0.16, 1, -0.12), thickness: 0.026, bevel: 0.006, smoothing: 1, detail: 0.34, color: fox, bone: root, name: "foxEar" },
    );
    b.extrude(
      [[-0.03, 0], [0.03, 0], [0.008, 0.115]],
      { at: F.pt(t * 0.065, 0.695, 0.066), x: F.dir(t, 0, 0), y: F.dir(t * 0.16, 1, -0.12), thickness: 0.012, bevel: 0.003, smoothing: 1, detail: 0.34, color: VERM, bone: root, name: "foxEarIn" },
    );
    // carved eye slits, brow and cheek tufts
    bx(0.04, 0.012, 0.012, BLACK, [t * 0.052, 0.655, 0.152], { F, rot: [0, t * -22, t * 18], mid: true, bev: 0.002 });
    bx(0.045, 0.008, 0.012, STONE_D, [t * 0.054, 0.676, 0.15], { F, rot: [0, t * -22, t * 22], mid: true, bev: 0.002 });
    for (const k of [0, 1, 2]) {
      b.spike(F.pt(t * 0.092, 0.625 - k * 0.018, 0.085 - k * 0.012), F.dir(t * 1, -0.25 - k * 0.12, -0.15), 0.06 - k * 0.008, 0.02, { bone: root, color: CREAM, sides: 4 });
    }
    sph([t * 0.07, 0.61, 0.215], [0.012, 0.01, 0.01], BLACK, { F, seg: 4, seg2: 3 });
  }
  // tail wraps the outside, cream tip
  const tp: V[] = [[0, 0.1, -0.24], [s * 0.1, 0.09, -0.42], [s * 0.28, 0.12, -0.4], [s * 0.37, 0.28, -0.26], [s * 0.34, 0.46, -0.14], [s * 0.3, 0.58, -0.12]];
  tube(tp, [0.05, 0.095, 0.12, 0.1, 0.06, 0.012], fox, { F, sides: 9, name: "foxTail" }, { caps: { start: "round", end: "point" }, bands: [[0.72, fox], [1, CREAM]] });
  // red bib, bell and rope
  tube(
    Array.from({ length: 8 }, (_v, i) => [Math.sin((i / 8) * Math.PI * 2) * 0.12, 0.505, 0.035 + Math.cos((i / 8) * Math.PI * 2) * 0.118] as V),
    0.034,
    VERM,
    { F, closed: true, sides: 6, name: "foxScarf" },
  );
  b.extrude([[-0.085, 0], [0.085, 0], [0, -0.17]], {
    at: F.pt(0, 0.5, 0.155),
    x: F.dir(1, 0, 0),
    y: F.dir(0, 1, 0),
    thickness: 0.02,
    bevel: 0.006,
    smoothing: 1,
    detail: 0.34,
    color: VERM,
    bone: root,
    name: "foxBib",
  });
  tube([[-0.07, 0.49, 0.168], [0, 0.34, 0.175], [0.07, 0.49, 0.168]], 0.007, GOLD, { F, poly: true, sides: 5, name: "bibTrim" });
  sph([0, 0.335, 0.175], 0.026, GOLD, { F, seg: 8, seg2: 6, name: "foxBell" });
  bx(0.034, 0.005, 0.012, BLACK, [0, 0.333, 0.197], { F, bev: 0.001, mid: true });
  // offering between the paws
  if (s > 0) {
    cyl(0.07, 0.085, 0.025, GOLD, [0, 0.0, 0.31], fo);
    lat([[0, 0.0], [0.035, 0.0], [0.05, 0.02], [0.03, 0.04], [0, 0.04]], GOLD, [0, 0.025, 0.31], { F, seg: 8 });
    glow(sph([0, 0.115, 0.31], 0.065, "#c78bff", { F, seg: 9, seg2: 7, name: "electroOrb" }), 1.5);
    glow(sph([0, 0.115, 0.31], 0.032, "#f0d6ff", { F, seg: 7, seg2: 5 }), 1.8);
    for (let k = 0; k < 3; k++) {
      const th = k * 120 * D;
      tube(
        [[Math.sin(th) * 0.075, 0.03, 0.31 + Math.cos(th) * 0.075], [Math.sin(th) * 0.09, 0.1, 0.31 + Math.cos(th) * 0.09], [Math.sin(th) * 0.05, 0.19, 0.31 + Math.cos(th) * 0.05]],
        [0.007, 0.004],
        GOLD,
        { F, sides: 4, poly: true },
      );
    }
  } else {
    // scroll lying across the paws
    cyl(0.034, 0.034, 0.3, PAPER, [-0.15, 0.065, 0.3], { F, rot: [0, 0, -90], seg: 8, name: "scroll" });
    for (const t of [1, -1]) {
      cyl(0.04, 0.04, 0.025, GOLD, [t * 0.15 + (t > 0 ? -0.012 : 0.012), 0.065, 0.3], { F, rot: [0, 0, -90], seg: 8 });
      sph([t * 0.162, 0.065, 0.3], 0.02, VERM, { F, seg: 6, seg2: 4 });
    }
    cyl(0.037, 0.037, 0.03, VERM, [-0.015, 0.065, 0.3], { F, rot: [0, 0, -90], seg: 8 });
    tube([[0, 0.1, 0.3], [0.01, 0.07, 0.34], [0.03, 0.03, 0.36]], 0.006, VERM, { F, sides: 4, poly: true });
  }
}
kitsune(1);
kitsune(-1);

// ---------------------------------------------------------------------------------------------------------------
// Shrine hall
// ---------------------------------------------------------------------------------------------------------------
const doorL = b.joint("doorL", { parent: root, at: [0.29, PL + 0.1, -1.04], role: "hinge" });
const doorR = b.joint("doorR", { parent: root, at: [-0.29, PL + 0.1, -1.04], role: "hinge" });
const bellSwing = b.joint("bellSwing", { parent: root, at: [0, WALL - 0.12, -0.68], role: "hinge" });
const ropeSwing = b.joint("ropeSwing", { parent: root, at: [0, WALL - 0.12, -0.6], role: "hinge" });

function roofTopY(x: number) {
  const u = Math.min(1, Math.abs(x) / 0.95);
  const up = Math.pow(Math.max(0, (Math.abs(x) - 0.8) / 0.22), 2) * 0.13;
  return YE + 0.52 * Math.pow(1 - u, 1.6) + up;
}
const RZ0 = -2.25;
const RZ1 = -0.65;
const RZC = (RZ0 + RZ1) / 2;

function shrineHall() {
  const stoneM = stoneP(G, 11);
  // platform tiers and steps
  bx(2.3, 0.14, 1.95, stoneM, [0, G, -1.45], { bev: 0.015, name: "tier1" });
  bx(2.0, 0.14, 1.65, stoneP(G + 0.14, 12, 0.5), [0, G + 0.14, -1.45], { bev: 0.015, name: "tier2" });
  bx(0.92, 0.07, 0.3, stoneM, [0, G, -0.34], { bev: 0.012, name: "step1" });
  bx(0.92, 0.21, 0.15, stoneM, [0, G, -0.55], { bev: 0.012, name: "step3" });
  // low stone kerb studs on the tiers
  const studs = batch(STONE_D);
  for (let i = 0; i < 8; i++) {
    studs.add(new THREE.BoxGeometry(0.1, 0.04, 0.1), [-1.0 + i * 0.285, G + 0.16, -0.5], [0, 0, 0]);
  }
  studs.done("kerbStuds");

  // hall body: sill, plaster walls, red posts and beams
  bx(1.36, 0.06, 1.1, VERM_WOOD_X, [0, PL, -1.5], { bev: 0.006, name: "sill" });
  bx(1.2, 0.85, 0.96, PLASTER, [0, PL + 0.06, -1.5], { bev: 0.004, name: "walls" });
  for (const sx of [1, -1])
    for (const z of [-1.0, -2.0]) bx(0.09, 0.96, 0.09, VERM_WOOD, [sx * 0.62, PL + 0.04, z], { bev: 0.006, name: "hallPost" });
  for (const sx of [1, -1]) {
    bx(0.07, 0.07, 1.1, VERM, [sx * 0.62, PL + 0.74, -1.5], { bev: 0.005, name: "sideBeam" });
    bx(0.09, 0.1, 1.12, VERM_WOOD, [sx * 0.62, WALL - 0.1, -1.5], { bev: 0.006, name: "topPlate" });
    // round lattice windows on the flanks
    plane(ROUNDWIN, 0.3, 0.3, [sx * 0.606, PL + 0.5, -1.5], [sx, 0, 0]);
  }
  bx(1.32, 0.07, 0.08, VERM, [0, PL + 0.74, -1.02], { bev: 0.005, name: "lintelBeam" });
  bx(1.32, 0.1, 0.09, VERM_WOOD, [0, WALL - 0.1, -1.02], { bev: 0.006, name: "frontPlate" });
  bx(1.32, 0.1, 0.09, VERM_WOOD, [0, WALL - 0.1, -1.98], { bev: 0.006, name: "backPlate" });
  // door frame
  for (const sx of [1, -1]) bx(0.045, 0.75, 0.06, VERM_WOOD, [sx * 0.3, PL + 0.06, -1.03], { bev: 0.004, name: "jamb" });
  bx(0.66, 0.045, 0.06, VERM_WOOD_X, [0, PL + 0.76, -1.03], { bev: 0.004, name: "doorLintel" });
  bx(0.66, 0.035, 0.1, WOOD, [0, PL + 0.06, -0.99], { bev: 0.004, name: "threshold" });
  // door leaves on hinge joints
  for (const [j, tex, sgn] of [[doorL, DOOR_L, 1], [doorR, DOOR_R, -1]] as const) {
    bx(0.27, 0.7, 0.03, BLACK, [sgn * 0.29 - sgn * 0.135, PL + 0.08, -1.045], { bev: 0.004, bone: j, name: "doorLeaf" });
    plane(tex, 0.27, 0.7, [sgn * 0.29 - sgn * 0.135, PL + 0.43, -1.0615], [0, 0, 1], { bone: j });
    // gold ring pull
    b.part(new THREE.TorusGeometry(0.018, 0.005, 5, 10), GOLD, { bone: j, at: [sgn * 0.29 - sgn * (sgn > 0 ? 0.045 : 0.045), PL + 0.35, -1.072], rotation: [0, 0, 0], name: "doorPull" });
  }
  // glowing crest above the door
  glow(plane(CREST, 0.2, 0.2, [0, PL + 0.865, -1.0], [0, 0, 1], { name: "lintelCrest" }), 1.2);
  // flank panels: vertical slat lines
  for (const sx of [1, -1]) {
    for (let k = 0; k < 4; k++) bx(0.012, 0.72, 0.012, VERM, [sx * (0.37 + k * 0.062), PL + 0.06, -1.025], { bev: 0.002 });
    bx(0.25, 0.012, 0.012, VERM, [sx * 0.45, PL + 0.42, -1.025], { bev: 0.002 });
  }
  // porch deck with railings
  bx(1.56, 0.06, 0.32, WOOD_Z, [0, PL, -0.87], { bev: 0.006, name: "porchDeck" });
  const planks = batch(WOOD_D);
  for (let k = 1; k < 9; k++) planks.add(new THREE.BoxGeometry(0.008, 0.004, 0.31), [-0.78 + k * 0.174, PL + 0.062, -0.87]);
  planks.done("porchPlanks");
  for (const sx of [1, -1]) {
    // porch pillar with gold collars
    cyl(0.05, 0.055, WALL - PL - 0.1, VERM_WOOD, [sx * 0.72, PL + 0.06, -0.74], { seg: 8, name: "porchPost" });
    lat([[0.052, 0], [0.068, 0], [0.068, 0.03], [0.052, 0.03]], GOLD, [sx * 0.72, PL + 0.06, -0.74], { seg: 8 });
    lat([[0.052, 0], [0.068, 0], [0.068, 0.025], [0.052, 0.025]], GOLD, [sx * 0.72, WALL - 0.17, -0.74], { seg: 8 });
    // bracket stack
    bx(0.14, 0.04, 0.14, BLACK, [sx * 0.72, WALL - 0.14, -0.74], { bev: 0.004 });
    // railing
    bx(0.04, 0.045, 0.34, VERM, [sx * 0.76, PL + 0.28, -0.88], { bev: 0.004 });
    bx(0.03, 0.03, 0.34, VERM, [sx * 0.76, PL + 0.16, -0.88], { bev: 0.004 });
    bx(0.04, 0.3, 0.04, VERM_WOOD, [sx * 0.76, PL + 0.06, -0.72], { bev: 0.004 });
    lat([[0, 0], [0.025, 0], [0.032, 0.02], [0.02, 0.04], [0.008, 0.06], [0, 0.07]], GOLD, [sx * 0.76, PL + 0.36, -0.72], { seg: 8, name: "giboshi" });
    bx(0.3, 0.04, 0.04, VERM, [sx * 0.57, PL + 0.28, -0.72], { bev: 0.004 });
    bx(0.3, 0.03, 0.03, VERM, [sx * 0.57, PL + 0.16, -0.72], { bev: 0.004 });
    bx(0.04, 0.3, 0.04, VERM_WOOD, [sx * 0.42, PL + 0.06, -0.72], { bev: 0.004 });
    lat([[0, 0], [0.025, 0], [0.032, 0.02], [0.02, 0.04], [0.008, 0.06], [0, 0.07]], GOLD, [sx * 0.42, PL + 0.36, -0.72], { seg: 8 });
  }
  bx(1.6, 0.12, 0.1, VERM_WOOD_X, [0, WALL - 0.12, -0.74], { bev: 0.008, name: "porchBeam" });
  bx(1.5, 0.03, 0.12, GOLD, [0, WALL - 0.13, -0.735], { bev: 0.004, name: "porchBeamGold" });

  // roof: one curved gable prism
  const top: [number, number][] = [];
  const xs = [-1.02, -0.9, -0.74, -0.55, -0.35, -0.17, 0, 0.17, 0.35, 0.55, 0.74, 0.9, 1.02];
  for (const x of xs) top.push([x, roofTopY(x)]);
  const bot: [number, number][] = [[1.02, YE + 0.0], [0.9, YE - 0.07], [-0.9, YE - 0.07], [-1.02, YE + 0.0]];
  const tileLo = "#35557f";
  const tileHi = "#4f7cab";
  const tileDk = "#233b62";
  const roofPaint = cel(
    paint((p, n, s) => {
      if (Math.abs(n.z) > 0.7) {
        const yt = roofTopY(s[0]);
        if (yt - s[1] < 0.065) return "#ffd460";
        if (s[1] < YE - 0.07 + 0.05) return "#e8402e";
        return Math.abs((((s[0] * 1000) % 70) + 70) % 70) < 6 ? "#5d4b99" : "#4b3b7e";
      }
      if (n.y < -0.45) return Math.abs((((p.z * 1000) % 90) + 90) % 90) < 8 ? "#2c1b38" : "#4a2f50";
      if (Math.abs(s[0]) > 0.995 && n.y < 0.5) return "#ffd460";
      const col = (((p.z * 1000) % 85) + 85) % 85 / 85;
      const row = ((Math.abs(s[0]) * 1000) % 72) / 72;
      const id = Math.floor(p.z / 0.085) + Math.floor(Math.abs(s[0]) / 0.072) * 3;
      if (Math.abs(s[0]) > 0.9) return "#ffd460";
      if (row < 0.11 || col < 0.12) return tileDk;
      if (col > 0.84) return tileHi;
      return id % 3 === 0 ? "#3e6592" : tileLo;
    }),
  );
  b.extrude([...top, ...bot], {
    at: [0, 0, RZC],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: RZ1 - RZ0,
    bevel: 0.012,
    detail: 0.34,
    color: roofPaint,
    bone: root,
    name: "roof",
  });
  // ridge cap, ridge ornaments, barge boards
  const ry = roofTopY(0);
  tube([[0, ry + 0.03, RZ0 - 0.03], [0, ry + 0.03, RZ1 + 0.03]], 0.06, BLACK, { poly: true, sides: 6, name: "ridgeCap" }, { caps: "flat" });
  for (const [z, d] of [[RZ0 - 0.04, -1], [RZ1 + 0.04, 1]] as const) {
    cyl(0.085, 0.085, 0.04, GOLD, [0, ry + 0.03, z], { rot: [90, 0, 0], seg: 12, name: "ridgeDisc" });
    cyl(0.05, 0.05, 0.05, VERM, [0, ry + 0.03, z + d * 0.002], { rot: [90, 0, 0], seg: 12 });
    tube([[0, ry + 0.08, z - d * 0.04], [0, ry + 0.2, z - d * 0.06], [0, ry + 0.3, z - d * 0.02]], [0.03, 0.006], GOLD, { sides: 5, name: "ridgeFlame" }, { caps: { start: "round", end: "point" } });
  }
  const bargeP = cel("#e8402e", "#a8252e");
  for (const z of [RZ1 + 0.012, RZ0 - 0.012]) {
    for (const sx of [1, -1]) {
      const pts: V[] = xs.filter((x) => x * sx >= 0).map((x) => [x + sx * 0.0, roofTopY(x) + 0.028, z] as V);
      tube(pts, 0.032, bargeP, { sides: 4, name: "bargeBoard" }, { caps: "flat" });
    }
  }
  // gable crest (glowing Electro) and gold gable trim
  glow(plane(CREST, 0.34, 0.34, [0, YE + 0.24, RZ1 + 0.003], [0, 0, 1], { name: "gableCrest" }), 1.3);
  glow(plane(CREST, 0.34, 0.34, [0, YE + 0.24, RZ0 - 0.003], [0, 0, -1], { name: "gableCrestBack" }), 1.3);
  // hanging tassels at the roof corners and rafter ends
  const hang: V[] = [[1.0, YE - 0.075, RZ1 + 0.02], [-1.0, YE - 0.075, RZ1 + 0.02], [1.0, YE - 0.075, RZ0 - 0.02], [-1.0, YE - 0.075, RZ0 - 0.02]];
  b.cards(hang.map((p) => frame(p, [0, 1, 0])), TASSEL, { size: [0.08, 0.3], lean: 180, flow: [0, 0, 1], cross: true });
  for (const p of hang) sph([p[0], p[1] + 0.01, p[2]], 0.025, GOLD, { seg: 6, seg2: 5 });
  const rafters = batch(WOOD_D);
  const discs = batch("#ffd460");
  for (let i = 0; i < 11; i++) {
    const z = RZ0 + 0.1 + i * ((RZ1 - RZ0 - 0.2) / 10);
    for (const sx of [1, -1]) {
      rafters.add(new THREE.BoxGeometry(0.1, 0.045, 0.035), [sx * 0.97, YE - 0.095, z]);
      discs.add(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 10), [sx * 1.03, YE + 0.025, z], [0, 0, 90]);
    }
  }
  for (let i = 0; i < 9; i++) {
    const x = -0.76 + i * 0.19;
    rafters.add(new THREE.BoxGeometry(0.035, 0.045, 0.1), [x, YE - 0.095, RZ1 - 0.04]);
    rafters.add(new THREE.BoxGeometry(0.035, 0.045, 0.1), [x, YE - 0.095, RZ0 + 0.04]);
  }
  rafters.done("rafterEnds");
  discs.done("eaveDiscs");
}
shrineHall();

// ---------------------------------------------------------------------------------------------------------------
// Bell and rope, offering box
// ---------------------------------------------------------------------------------------------------------------
function bellAndRope() {
  const [bx0, by0, bz0] = [0, WALL - 0.12, -0.68];
  // bell on its hanger
  b.part(new THREE.TorusGeometry(0.022, 0.006, 5, 10), GOLD, { bone: bellSwing, at: [bx0, by0 - 0.015, bz0], rotation: [0, 90, 0], name: "bellRing" });
  cyl(0.012, 0.012, 0.05, GOLD, [bx0, by0 - 0.07, bz0], { bone: bellSwing, seg: 6 });
  sph([bx0, by0 - 0.17, bz0], 0.095, GOLD, { bone: bellSwing, seg: 12, seg2: 8, name: "suzu" });
  b.part(new THREE.TorusGeometry(0.0955, 0.007, 4, 14), BLACK, { bone: bellSwing, at: [bx0, by0 - 0.19, bz0], rotation: [90, 0, 0], name: "suzuSlit" });
  sph([bx0, by0 - 0.262, bz0], [0.02, 0.008, 0.02], BLACK, { bone: bellSwing, seg: 6, seg2: 3 });
  sph([bx0 - 0.03, by0 - 0.13, bz0 + 0.075], 0.014, cel("#fff0b0", "#f2c168"), { bone: bellSwing, seg: 5, seg2: 4 });
  // rope: red-white-gold twisted, with gold clasp and a tassel
  const ropeP = cel(
    paint((_p, _n, s) => {
      const k = ((((s[1] - s[0] * 2600) % 180) + 180) % 180);
      return k < 60 ? "#e8402e" : k < 120 ? "#fff4e0" : "#ffd460";
    }),
    "#a8252e",
  );
  cyl(0.03, 0.025, 0.035, GOLD, [bx0, by0 - 0.025, bz0 + 0.07], { bone: ropeSwing, seg: 8, name: "ropeClasp" });
  tube([[bx0, by0 - 0.02, bz0 + 0.075], [bx0, by0 - 0.3, bz0 + 0.085], [bx0, by0 - 0.62, bz0 + 0.1]], [0.034, 0.03], ropeP, { bone: ropeSwing, sides: 8, name: "tsuna" });
  sph([bx0, by0 - 0.655, bz0 + 0.1], 0.035, GOLD, { bone: ropeSwing, seg: 8, seg2: 6 });
  b.cards([frame([bx0, by0 - 0.65, bz0 + 0.1], [0, 1, 0])], TASSEL, { size: [0.07, 0.24], lean: 180, flow: [0, 0, 1], cross: true, bone: ropeSwing });
  // purple Electro seal tag beside the bell
  plane(OFUDA, 0.07, 0.19, [0.22, WALL - 0.27, -0.688], [0, 0, 1]);
  plane(OFUDA, 0.07, 0.19, [-0.22, WALL - 0.27, -0.688], [0, 0, 1]);
}
bellAndRope();

function saisenBox() {
  const z = 0.12;
  const y0 = G;
  for (const sx of [1, -1]) for (const sz of [1, -1]) bx(0.07, 0.19, 0.07, WOOD_DY, [sx * 0.4, y0, z + sz * 0.19], { bev: 0.006, name: "saisenLeg" });
  bx(0.9, 0.3, 0.46, WOOD_D, [0, y0 + 0.17, z], { bev: 0.01, name: "saisenBody" });
  bx(0.96, 0.04, 0.52, WOOD_D, [0, y0 + 0.47, z], { bev: 0.01, name: "saisenRim" });
  bx(0.84, 0.01, 0.4, "#150f1e", [0, y0 + 0.5, z], { bev: 0.002, name: "saisenSlot" });
  const bars = batch(WOOD);
  for (let i = 0; i < 9; i++) {
    const zz = -0.2 + i * 0.05;
    bars.add(new THREE.BoxGeometry(0.88, 0.022, 0.03), [0, y0 + 0.53 + 0.03 * (0.2 - zz), z + zz], [10, 0, 0]);
  }
  bars.done("saisenGrate");
  for (const sx of [1, -1]) {
    bx(0.04, 0.045, 0.42, GOLD, [sx * 0.465, y0 + 0.5, z], { bev: 0.004, name: "saisenGoldRail" });
    bx(0.05, 0.4, 0.05, GOLD, [sx * 0.455, y0 + 0.1, z + 0.225], { bev: 0.004 });
    sph([sx * 0.465, y0 + 0.54, z + 0.255], 0.02, GOLD, { seg: 6, seg2: 5 });
    sph([sx * 0.465, y0 + 0.54, z - 0.255], 0.02, GOLD, { seg: 6, seg2: 5 });
  }
  plane(SAISEN, 0.6, 0.22, [0, y0 + 0.31, z + 0.2315], [0, 0, 1]);
  bx(0.84, 0.02, 0.03, GOLD, [0, y0 + 0.455, z + 0.24], { bev: 0.003 });
  // coins on the grate
  const coins = batch("#ffd460");
  const R = rng(21);
  for (let i = 0; i < 7; i++) {
    const zz = -0.15 + R() * 0.3;
    coins.add(new THREE.CylinderGeometry(0.02, 0.02, 0.005, 8), [(R() - 0.5) * 0.7, y0 + 0.555 + 0.03 * (0.2 - zz), z + zz], [10, R() * 90, R() * 20]);
  }
  coins.done("coins");
}
saisenBox();

// ---------------------------------------------------------------------------------------------------------------
// Offering table
// ---------------------------------------------------------------------------------------------------------------
function offerings() {
  const tx = 1.9;
  const tz = 0.25;
  const top = G + 0.5;
  for (const sx of [1, -1]) for (const sz of [1, -1]) bx(0.06, 0.46, 0.06, WOOD_DY, [tx + sx * 0.48, G, tz + sz * 0.22], { bev: 0.005, name: "tableLeg" });
  bx(1.04, 0.04, 0.54, WOOD_D, [tx, top - 0.04, tz], { bev: 0.008, name: "tableTop" });
  bx(1.0, 0.03, 0.04, VERM, [tx, G + 0.32, tz + 0.22], { bev: 0.004 });
  bx(1.0, 0.03, 0.04, VERM, [tx, G + 0.32, tz - 0.22], { bev: 0.004 });
  bx(0.9, 0.012, 0.5, CLOTH, [tx, top, tz], { bev: 0.003, name: "tableCloth" });
  // gold tassels on cloth corners
  b.cards([frame([tx + 0.5, top - 0.02, tz + 0.27], [0, 1, 0]), frame([tx - 0.5, top - 0.02, tz + 0.27], [0, 1, 0])], TASSEL, { size: [0.05, 0.17], lean: 180, flow: [0, 0, 1], cross: true });
  const ty = top + 0.012;
  // sanbo stand with mandarins
  const sx0 = tx - 0.32;
  const sz0 = tz + 0.02;
  bx(0.13, 0.08, 0.13, WOOD, [sx0, ty, sz0], { bev: 0.005, name: "sanboFoot" });
  bx(0.25, 0.025, 0.25, WOOD, [sx0, ty + 0.08, sz0], { bev: 0.005, name: "sanboTray" });
  for (const sx of [1, -1]) bx(0.01, 0.03, 0.25, WOOD_D, [sx0 + sx * 0.12, ty + 0.105, sz0], { bev: 0.002 });
  bx(0.2, 0.004, 0.2, PAPER, [sx0, ty + 0.105, sz0], { bev: 0.001 });
  const MAND = cel(mottle("#ff9a2e", "#ffb447", { size: 0.04, seed: 2 }), "#e0602a");
  for (const [dx, dz, dy] of [[-0.05, -0.05, 0], [0.05, -0.05, 0], [-0.05, 0.05, 0], [0.05, 0.05, 0], [0, 0, 0.065]] as const) {
    sph([sx0 + dx, ty + 0.15 + dy, sz0 + dz], [0.05, 0.043, 0.05], MAND, { seg: 8, seg2: 6, name: "mandarin" });
  }
  sph([sx0, ty + 0.22, sz0], [0.016, 0.006, 0.016], "#5aa84a", { seg: 5, seg2: 3 });
  sph([sx0 + 0.03, ty + 0.208, sz0 + 0.01], [0.022, 0.006, 0.012], LEAFG, { seg: 5, seg2: 3, rot: [0, 30, 15] });
  // rice bowl
  const rx = tx - 0.08;
  const rz = tz - 0.1;
  lat([[0, 0], [0.03, 0], [0.04, 0.02], [0.075, 0.07], [0.078, 0.085], [0.068, 0.085], [0.034, 0.03], [0, 0.03]], cel("#f4f0ff", "#c6c0e0"), [rx, ty, rz], { seg: 10, name: "riceBowl" });
  sph([rx, ty + 0.077, rz], [0.068, 0.04, 0.068], cel("#fffdf8", "#d8d0e4"), { seg: 8, seg2: 5, name: "rice" });
  lat([[0.0, 0.0], [0.034, 0.0], [0.034, 0.012], [0, 0.012]], cel("#4a5aa0", "#313c78"), [rx, ty, rz], { seg: 10 });
  // sake bottle and cups on a tray
  const kx = tx + 0.12;
  const kz = tz + 0.06;
  bx(0.3, 0.014, 0.2, VERM, [kx + 0.03, ty, kz], { bev: 0.004, name: "tray" });
  lat([[0, 0.014], [0.05, 0.014], [0.062, 0.06], [0.05, 0.11], [0.025, 0.13], [0.022, 0.18], [0.03, 0.2], [0.02, 0.2], [0, 0.19]], cel("#4a5aa0", "#2c3566"), [kx, ty, kz], { seg: 10, name: "tokkuri" });
  lat([[0.0, 0.0], [0.026, 0.0], [0.03, 0.02], [0.034, 0.045], [0.026, 0.045], [0.0, 0.01]], cel("#fffaf0", "#d0c8e4"), [kx + 0.14, ty + 0.014, kz - 0.03], { seg: 8, name: "sakeCup" });
  lat([[0.0, 0.0], [0.026, 0.0], [0.03, 0.02], [0.034, 0.045], [0.026, 0.045], [0.0, 0.01]], cel("#fffaf0", "#d0c8e4"), [kx + 0.1, ty + 0.014, kz + 0.05], { seg: 8, name: "sakeCup" });
  cyl(0.0, 0.0, 0.0, GOLD, [0, -5, 0]);
  sph([kx, ty + 0.205, kz], 0.014, GOLD, { seg: 6, seg2: 4 });
  b.part(new THREE.TorusGeometry(0.053, 0.007, 4, 12), VERM, { at: [kx, ty + 0.115, kz], rotation: [90, 0, 0], name: "tokkuriCord" });
  // dango skewers on a plate
  const dx = tx + 0.36;
  const dz = tz - 0.1;
  lat([[0, 0], [0.09, 0.0], [0.11, 0.018], [0.095, 0.018], [0, 0.006]], cel("#f4f0ff", "#c6c0e0"), [dx, ty, dz], { seg: 12, name: "plate" });
  for (let k = 0; k < 3; k++) {
    const a = (k - 1) * 0.35;
    const P0: V = [dx + (k - 1) * 0.05, ty + 0.018, dz + 0.03];
    const P1: V = [dx + (k - 1) * 0.05 - Math.sin(a) * 0.05, ty + 0.2, dz - 0.07 - 0.0];
    tube([P0, P1], 0.0035, WOOD, { poly: true, sides: 4 }, { caps: "point" });
    const cols = ["#ffb0cc", "#fffaf0", "#a6dc8e"];
    for (let i = 0; i < 3; i++) {
      const t = 0.42 + i * 0.2;
      sph(
        [P0[0] + (P1[0] - P0[0]) * t, P0[1] + (P1[1] - P0[1]) * t, P0[2] + (P1[2] - P0[2]) * t],
        0.026,
        cel(cols[i]),
        { seg: 7, seg2: 5, name: "dango" },
      );
    }
  }
  // incense burner with glowing sticks and smoke
  const ix = tx + 0.38;
  const iz = tz + 0.14;
  lat([[0, 0], [0.05, 0], [0.065, 0.03], [0.07, 0.07], [0.06, 0.085], [0, 0.085]], cel("#b98a4a", "#7e5238"), [ix, ty, iz], { seg: 10, name: "koro" });
  for (const a of [0, 120, 240]) cyl(0.012, 0.008, 0.03, GOLD, [ix + Math.sin(a * D) * 0.05, ty - 0.01, iz + Math.cos(a * D) * 0.05], { seg: 5 });
  b.part(new THREE.TorusGeometry(0.066, 0.006, 4, 12), GOLD, { at: [ix, ty + 0.07, iz], rotation: [90, 0, 0], name: "koroRim" });
  const sticks = [[-0.02, 0.0, 6], [0.0, -0.015, -4], [0.02, 0.01, 8]] as const;
  const smokeFrames = [];
  for (const [ox, oz, lean] of sticks) {
    cyl(0.003, 0.003, 0.12, "#9a4a3a", [ix + ox, ty + 0.07, iz + oz], { rot: [lean, 0, lean * 0.6], seg: 4 });
    glow(sph([ix + ox + lean * 0.0018, ty + 0.188, iz + oz + lean * 0.0012], 0.006, "#ff6a3a", { seg: 4, seg2: 3 }), 1.8);
    smokeFrames.push(frame([ix + ox + lean * 0.0018, ty + 0.195, iz + oz], [0, 1, 0]));
  }
  b.cards(smokeFrames, SMOKE, { size: [0.05, 0.22], lean: 4, flow: [1, 0, 0.3], bend: 0, cross: true, vary: 0.2, rng: rng(33) });
  // flower vase with blossom branch
  const vx = tx - 0.12;
  const vz = tz - 0.14;
  lat([[0, 0], [0.04, 0], [0.05, 0.05], [0.04, 0.1], [0.025, 0.13], [0.03, 0.16], [0.02, 0.16], [0, 0.15]], cel("#7ab8d8", "#4d7fb0"), [vx, ty, vz], { seg: 9, name: "vase" });
  const branch: V[] = [[vx, ty + 0.15, vz], [vx + 0.02, ty + 0.3, vz - 0.02], [vx + 0.07, ty + 0.4, vz - 0.04]];
  tube(branch, [0.008, 0.004], BARK, { sides: 5 });
  tube([[vx + 0.02, ty + 0.3, vz - 0.02], [vx - 0.05, ty + 0.38, vz]], [0.005, 0.003], BARK, { sides: 4 });
  const bl = [frame([vx + 0.07, ty + 0.4, vz - 0.04], [0.3, 1, 0.2]), frame([vx + 0.03, ty + 0.34, vz - 0.03], [1, 0.3, 0.3]), frame([vx - 0.05, ty + 0.38, vz], [-1, 0.5, 0.2]), frame([vx + 0.0, ty + 0.25, vz - 0.02], [-0.6, 0.6, 0.5])];
  b.cards(bl, BLOSSOM, { size: 0.1, lean: 10, cross: true, vary: 0.2, rng: rng(5) });
  // ofuda on the table front
  plane(OFUDA, 0.08, 0.2, [tx - 0.3, G + 0.2, tz + 0.2], [0, 0, 1]);
}
offerings();

// ---------------------------------------------------------------------------------------------------------------
// Ema rack
// ---------------------------------------------------------------------------------------------------------------
const emaJoints: Joint[] = [];
function emaRack() {
  const x = -2.25;
  const z0 = 0.55;
  const z1 = 1.95;
  const top = 1.75;
  for (const z of [z0, z1]) {
    cyl(0.055, 0.065, top - G, VERM_WOOD, [x, G - 0.02, z], { seg: 8, name: "emaPost" });
    lat([[0.06, 0], [0.078, 0], [0.078, 0.035], [0.06, 0.035]], GOLD, [x, top - 0.12, z], { seg: 8 });
    bx(0.2, 0.16, 0.2, STONE, [x, G - 0.02, z], { bev: 0.01, name: "emaFooting" });
  }
  // roofed cross beam
  bx(0.14, 0.11, z1 - z0 + 0.3, VERM_WOOD_X, [x, top - 0.12, (z0 + z1) / 2], { bev: 0.008, name: "emaBeam" });
  const roofP = cel(
    paint((p, n) => {
      if (n.y < -0.4) return "#4a2f50";
      return (((p.z * 1000) % 80) + 80) % 80 < 12 ? "#233b62" : "#3a608d";
    }),
  );
  b.extrude(
    [[-0.3, 0], [0, 0.17], [0.3, 0], [0.26, -0.03], [-0.26, -0.03]],
    { at: [x, top, (z0 + z1) / 2], x: [1, 0, 0], y: [0, 1, 0], thickness: z1 - z0 + 0.5, bevel: 0.01, detail: 0.34, color: roofP, bone: root, name: "emaRoof" },
  );
  tube([[x, top + 0.17, z0 - 0.26], [x, top + 0.17, z1 + 0.26]], 0.025, GOLD, { poly: true, sides: 5, name: "emaRidge" }, { caps: "flat" });
  // hanging bar and plaques
  const barY = top - 0.22;
  bx(0.04, 0.04, z1 - z0 + 0.1, WOOD, [x + 0.09, barY, (z0 + z1) / 2], { bev: 0.004, name: "emaBar" });
  const R = rng(14);
  const n = 5;
  const pillar0 = z0 + 0.14;
  const span = z1 - z0 - 0.28;
  for (let i = 0; i < n; i++) {
    const z = pillar0 + (i / (n - 1)) * span;
    const hx = x + 0.09;
    const j = b.joint(`ema${i + 1}`, { parent: root, at: [hx, barY, z], role: "hinge" });
    emaJoints.push(j);
    const w = 0.27;
    const h = 0.22;
    const py = barY - 0.07 - h; // plaque bottom
    // two cord loops
    for (const dz of [-0.07, 0.07]) tube([[hx, barY, z + dz], [hx + 0.006, barY - 0.04, z + dz], [hx + 0.012, py + h - 0.02, z + dz * 0.8]], 0.005, VERM, { bone: j, poly: true, sides: 4 });
    // plaque body (pentagon), front and back faces
    const tilt = (R() - 0.5) * 5;
    b.extrude(
      [[-w / 2, 0], [w / 2, 0], [w / 2, h * 0.72], [0, h], [-w / 2, h * 0.72]],
      { at: [hx + 0.018, py, z], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, detail: 0.34, color: WOOD, bone: j, name: "emaBoard" },
    );
    void tilt;
    plane(EMA[i], w * 0.98, h * 1.0, [hx + 0.0275, py + h * 0.5 + 0.0, z], [1, 0, 0], { bone: j, name: "emaFace" });
    plane(EMA_BACK, w * 0.98, h, [hx + 0.0085, py + h * 0.5, z], [-1, 0, 0], { bone: j, name: "emaBack" });
    // tiny gold bead
    sph([hx + 0.012, barY - 0.045, z], 0.012, GOLD, { bone: j, seg: 5, seg2: 4 });
  }
  // fox figurine standing at the foot of the rack: small stone fox head marker
  bx(0.34, 0.4, 0.34, STONE, [x + 0.05, G, z1 + 0.5], { bev: 0.012, name: "emaMarker" });
  plane(MARKER, 0.22, 0.32, [x + 0.05 + 0.172, G + 0.2, z1 + 0.5], [1, 0, 0]);
}
emaRack();

// ---------------------------------------------------------------------------------------------------------------
// String of paper lanterns on the left
// ---------------------------------------------------------------------------------------------------------------
function lanternString() {
  const x = 2.62;
  const z0 = 0.95;
  const z1 = 3.05;
  const topY = 2.45;
  for (const z of [z0, z1]) {
    bx(0.22, 0.2, 0.22, STONE, [x, G - 0.02, z], { bev: 0.012, name: "poleFooting" });
    cyl(0.05, 0.065, topY - G, WOOD_Y, [x, G + 0.16, z], { seg: 8, name: "pole" });
    lat([[0.05, 0], [0.075, 0], [0.075, 0.04], [0.05, 0.04]], GOLD, [x, topY - 0.2, z], { seg: 8 });
    lat([[0, 0], [0.07, 0], [0.065, 0.03], [0.03, 0.06], [0, 0.09]], BLACK, [x, topY - 0.02 + 0.02, z], { seg: 8, name: "poleCap" });
    sph([x, topY + 0.115, z], 0.02, GOLD, { seg: 6, seg2: 5 });
    bx(0.1, 0.05, 0.1, WOOD_D, [x, topY - 0.12, z], { bev: 0.004 });
  }
  const pts: V[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    pts.push([x, topY - 0.06 - 0.3 * Math.sin(Math.PI * t), z0 + (z1 - z0) * t]);
  }
  const rp = cel(paint((_p, _n, s) => (((((s[1] - s[0] * 5800) % 150) + 150) % 150) < 70 ? "#f3dc98" : "#c79a5a")), "#a47a4c");
  const rope = catmull(pts);
  b.sweep(rope, 0.018, { bone: root, color: rp, sides: 6, name: "stringRope" });
  const lampN = 6;
  for (let i = 0; i < lampN; i++) {
    const t = 0.1 + (i / (lampN - 1)) * 0.8;
    const p = rope.at(t);
    chochin(root, [p.x, p.y - 0.01, p.z], 0.15, 0.32, i % 2 === 0, 0.07);
  }
  // shide on the rope between lanterns
  const sf = [];
  for (let i = 0; i < lampN - 1; i++) {
    const t = 0.1 + ((i + 0.5) / (lampN - 1)) * 0.8;
    const p = rope.at(t);
    sf.push(frame([p.x, p.y - 0.01, p.z], [0, 1, 0]));
  }
  b.cards(sf, SHIDE, { size: [0.07, 0.22], lean: 180, flow: [1, 0, 0], cross: false });
}
lanternString();

// ---------------------------------------------------------------------------------------------------------------
// Sake barrels, sacred rock, basin, marker stone
// ---------------------------------------------------------------------------------------------------------------
function barrel(x: number, y: number, z: number, label: boolean, seed: number) {
  const staves = cel(
    paint((p, _n, s) => {
      const k = ((((s[1] / (360 / 14)) % 1) + 1) % 1);
      const hoop = Math.abs(s[0] - 0.07) < 0.025 || Math.abs(s[0] - 0.35) < 0.025;
      if (hoop) return "#4a3550";
      if (k < 0.07) return "#a9743f";
      const n = noise(p, 0.05, seed);
      return n > 0.55 ? "#efcf94" : "#e7c183";
    }),
    "#b17f58",
  );
  const part = lat(
    [[0, 0], [0.17, 0], [0.195, 0.1], [0.21, 0.21], [0.195, 0.32], [0.17, 0.42], [0, 0.42]],
    staves,
    [x, y, z],
    { seg: 14, name: "barrel" },
  );
  lat([[0, 0.418], [0.17, 0.418], [0.17, 0.43], [0.15, 0.435], [0, 0.435]], cel("#d9a868", "#9a6a48"), [x, y, z], { seg: 14, name: "barrelLid" });
  // straw rope bands
  for (const hy of [0.12, 0.3]) {
    const r = hy < 0.2 ? 0.2 : 0.2;
    tube(
      Array.from({ length: 10 }, (_v, i) => [x + Math.sin((i / 10) * Math.PI * 2) * (r + 0.005), y + hy, z + Math.cos((i / 10) * Math.PI * 2) * (r + 0.005)] as V),
      0.014,
      STRAW,
      { closed: true, sides: 6, name: "barrelRope" },
    );
  }
  if (label) b.decal(part, LABEL, { at: [x, y + 0.21, z + 0.21], dir: [0, 0, 1], size: [0.16, 0.2], name: "barrelLabel" });
}
function sakeBarrels() {
  barrel(-2.12, G, -0.55, true, 1);
  barrel(-2.12, G, -0.0, false, 2);
  // third one on top, lying wrapped for show
  barrel(-2.12, G + 0.43, -0.28, true, 3);
  // ladle and a small stand of sake cups
  cyl(0.012, 0.012, 0.45, BAMBOO, [-1.82, G + 0.02, -0.05], { rot: [0, 0, 28], seg: 6, name: "ladleHandle" });
  lat([[0, 0], [0.04, 0], [0.045, 0.04], [0.04, 0.05], [0, 0.04]], BAMBOO, [-1.7, G + 0.02, -0.05], { seg: 8, name: "ladleCup" });
}
sakeBarrels();

function sacredRock() {
  const cx = -1.85;
  const cz = -2.0;
  const rockP = cel(
    paint((p, n) => {
      const m = noise(p, 0.3, 4);
      if (n.y > 0.35 && m > 0.45) return MOSS_C;
      if (p.y < G + 0.12 && m > 0.35) return MOSS_C;
      return mottle("#b4b2c8", "#cfcce0", { size: 0.18, seed: 2 });
    }),
  );
  b.part(new THREE.IcosahedronGeometry(1, 1), rockP, { bone: root, at: [cx, G + 0.26, cz], scale: [0.52, 0.4, 0.46], rotation: [0, 20, 0], flat: true, name: "sacredRock" });
  b.part(new THREE.IcosahedronGeometry(1, 0), rockP, { bone: root, at: [cx + 0.38, G + 0.1, cz + 0.2], scale: [0.2, 0.14, 0.17], rotation: [10, 40, 0], flat: true, name: "rockSmall" });
  b.part(new THREE.IcosahedronGeometry(1, 0), rockP, { bone: root, at: [cx - 0.35, G + 0.08, cz + 0.3], scale: [0.15, 0.1, 0.14], rotation: [0, 70, 5], flat: true, name: "rockSmall2" });
  const ropeP = cel(paint((_p, _n, s) => (((((s[1] - s[0] * 4000) % 150) + 150) % 150) < 70 ? "#f3dc98" : "#c79a5a")), "#a47a4c");
  const ring: V[] = Array.from({ length: 12 }, (_v, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [cx + Math.sin(a) * 0.54, G + 0.27 - 0.025 * Math.cos(a * 2), cz + Math.cos(a) * 0.49] as V;
  });
  tube(ring, 0.032, ropeP, { closed: true, sides: 8, name: "rockRope" });
  // knot at the front and shide
  sph([cx, G + 0.28, cz + 0.5], [0.05, 0.05, 0.045], ropeP, { seg: 8, seg2: 6 });
  const sf = [-0.18, 0.1, 0.28].map((dx) => {
    const a = Math.atan2(dx, 0.5);
    return frame([cx + Math.sin(a + 0.5) * 0.53 * 0 + dx, G + 0.25, cz + 0.5 - Math.abs(dx) * 0.2], [0, 1, 0]);
  });
  b.cards(sf, SHIDE, { size: [0.09, 0.27], lean: 180, flow: [0, 0, 1] });
}
sacredRock();

function basin() {
  const x = -2.0;
  const z = 3.0;
  const mp = stoneP(G, 16);
  bx(0.7, 0.2, 0.5, mp, [x, G - 0.01, z], { bev: 0.015, name: "basinFoot" });
  bx(0.62, 0.2, 0.42, mp, [x, G + 0.19, z], { bev: 0.015, name: "basinBlock" });
  bx(0.34, 0.012, 0.22, "#8fdcee", [x, G + 0.378, z], { bev: 0.002, name: "water" });
  // rim ledge round the water
  for (const sz of [1, -1]) bx(0.62, 0.025, 0.1, STONE_PLAIN, [x, G + 0.39, z + sz * 0.16], { bev: 0.006 });
  for (const sx of [1, -1]) bx(0.14, 0.025, 0.22, STONE_PLAIN, [x + sx * 0.24, G + 0.39, z], { bev: 0.006 });
  // bamboo spout from a post
  cyl(0.045, 0.05, 0.9, WOOD_Y, [x, G + 0.19, z - 0.3], { seg: 7, name: "spoutPost" });
  tube([[x, G + 0.95, z - 0.3], [x, G + 0.9, z - 0.1], [x, G + 0.82, z + 0.0]], 0.032, BAMBOO, { poly: true, sides: 7, name: "bambooSpout" }, { caps: "flat" });
  for (const t of [0.3, 0.7]) {
    const py = G + 0.95 - 0.1 * t;
    tube([[x, py + 0.0, z - 0.3 + 0.3 * t * 0.0 + t * 0.3 - 0.06], [x, py, z - 0.3 + t * 0.3 - 0.0]], 0.037, BAMBOO, { poly: true, sides: 7 }, { caps: "flat" });
  }
  tube([[x, G + 0.8, z + 0.0], [x, G + 0.382, z + 0.0]], 0.01, "#a6e8f6", { poly: true, sides: 4, name: "waterfall" }, { caps: "flat" });
  // ladles
  for (const dz of [-0.06, 0.07]) {
    cyl(0.01, 0.01, 0.5, BAMBOO, [x - 0.28, G + 0.39, z + dz - 0.0], { rot: [0, 0, 90], seg: 6, name: "ladleHandle" });
    lat([[0, 0], [0.035, 0], [0.04, 0.04], [0.035, 0.045], [0, 0.035]], BAMBOO, [x + 0.19, G + 0.4, z + dz], { seg: 8, name: "ladleCup" });
  }
}
basin();

function markerStone() {
  const x = 1.62;
  const z = 3.05;
  bx(0.46, 0.1, 0.34, STONE, [x, G - 0.02, z], { bev: 0.012, name: "markerFoot" });
  bx(0.34, 1.0, 0.24, stoneP(G, 18, 0.8), [x, G + 0.08, z], { bev: 0.012, name: "markerStone" });
  plane(MARKER, 0.2, 0.5, [x, G + 0.6, z + 0.1235], [0, 0, 1]);
  lat([[0, 0], [0.2, 0], [0.18, 0.03], [0.1, 0.07], [0, 0.09]], STONE_PLAIN, [x, G + 1.08, z], { seg: 4, spin: 45, name: "markerCap" });
}
markerStone();

// ---------------------------------------------------------------------------------------------------------------
// Sakura, bushes, grass, flowers, pebbles and drifting petals
// ---------------------------------------------------------------------------------------------------------------
function sakura() {
  const trunk: V[] = [[1.95, G - 0.02, -2.0], [1.9, 0.8, -2.05], [1.7, 1.6, -1.95], [1.45, 2.3, -1.85], [1.15, 2.95, -1.8]];
  tube(trunk, [0.31, 0.25, 0.19, 0.13, 0.08], BARK, { sides: 8, name: "trunk" }, { caps: "point" });
  // flared roots
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.5;
    b.spike([1.95 + Math.sin(a) * 0.2, G + 0.18, -2.0 + Math.cos(a) * 0.2], [Math.sin(a), -0.5, Math.cos(a)], 0.45, 0.1, { bone: root, color: BARK, sides: 6 });
  }
  const branches: V[][] = [
    [[1.7, 1.6, -1.95], [1.2, 2.2, -1.75], [0.65, 2.65, -1.55], [0.3, 3.05, -1.5]],
    [[1.55, 2.0, -1.9], [2.1, 2.5, -2.15], [2.5, 2.95, -2.35]],
    [[1.35, 2.55, -1.85], [1.75, 2.9, -1.35], [1.65, 3.2, -1.0]],
    [[1.2, 2.85, -1.8], [1.55, 3.4, -1.8], [1.5, 3.9, -1.7]],
  ];
  for (const br of branches) tube(br, [0.085, 0.045, 0.02], BARK, { sides: 6, name: "branch" }, { caps: "point" });
  const blobs: [number, number, number, number][] = [
    [1.0, 3.3, -1.7, 0.82], [0.35, 3.1, -1.5, 0.62], [1.95, 3.55, -2.0, 0.72], [2.45, 3.05, -2.35, 0.58], [1.7, 3.1, -1.05, 0.52],
    [0.9, 3.85, -1.95, 0.55], [1.55, 4.0, -1.7, 0.58], [0.55, 2.7, -1.45, 0.42],
  ];
  const parts = blobs.map(([x, y, z, r], i) => b.part(new THREE.IcosahedronGeometry(1, 1), PINK, { bone: root, at: [x, y, z], scale: [r, r * 0.82, r], rotation: [0, i * 37, 0], flat: true, name: "canopy" }));
  const hits = b.surface(parts).scatter(190, { rng: rng(41), minDist: 0.17, filter: (h) => h.n.y > -0.4 });
  b.cards(hits, BLOSSOM, { size: 0.3, lean: 12, cross: true, vary: 0.3, rng: rng(42), flow: [0, -0.3, -1] });
  const lh = b.surface(parts).scatter(40, { rng: rng(43), minDist: 0.3, filter: (h) => h.n.y < 0.2 });
  b.cards(lh, PETAL, { size: 0.14, lean: 30, cross: true, vary: 0.3, rng: rng(44) });
}
sakura();

function bushes() {
  const spots: [number, number, number][] = [[-0.9, -2.5, 0.5], [0.85, -2.55, 0.55], [-2.35, -1.2, 0.5], [2.35, -0.9, 0.38], [-2.4, 1.0, 0.0]];
  const parts: ReturnType<typeof b.part>[] = [];
  for (const [x, z, r] of spots) {
    if (r <= 0) continue;
    parts.push(b.part(new THREE.IcosahedronGeometry(1, 1), LEAFG, { bone: root, at: [x, G + r * 0.55, z], scale: [r * 1.25, r * 0.9, r * 1.1], flat: true, name: "bush" }));
    parts.push(b.part(new THREE.IcosahedronGeometry(1, 1), LEAFG, { bone: root, at: [x + r * 0.6, G + r * 0.4, z + r * 0.3], scale: [r * 0.8, r * 0.65, r * 0.75], flat: true, name: "bush" }));
  }
  const hits = b.surface(parts).scatter(110, { rng: rng(51), minDist: 0.12, filter: (h) => h.n.y > -0.2 });
  b.cards(hits, LEAF, { size: [0.14, 0.2], lean: 40, cross: true, vary: 0.3, rng: rng(52) });
  const fh = b.surface(parts).scatter(26, { rng: rng(53), minDist: 0.25, filter: (h) => h.n.y > 0.2 });
  b.cards(fh, BLOSSOM, { size: 0.12, lean: 10, cross: true, vary: 0.3, rng: rng(54) });
}
bushes();

function keepOut(x: number, z: number) {
  const q = (x / GX) ** 2 + ((z - GZC) / GZH) ** 2;
  if (q > 0.74) return true;
  if (z > -0.45 && z > 0.0 && Math.abs(x - 0.1 * Math.sin(z * 1.7)) < 0.8) return true; // path
  if (z < 0.0 && z > -0.5 && Math.abs(x) < 0.7) return true; // steps
  if (Math.abs(x) < 1.4 && z < -0.45 && z > -2.5) return true; // platform
  for (const s of [1, -1]) {
    if (Math.hypot(x - s * 1.02, z - 0.95) < 0.55) return true;
    if (Math.hypot(x - s * 1.55, z + 0.62) < 0.5) return true;
    if (Math.hypot(x - s * 1.27, z - 2.2) < 0.32) return true;
  }
  if (x > 1.3 && x < 2.55 && z > -0.1 && z < 0.65) return true; // offering table
  if (Math.hypot(x - 2.62, z - 0.95) < 0.2 || Math.hypot(x - 2.62, z - 3.05) < 0.2) return true;
  if (x < -2.0 && x > -2.5 && z > -0.9 && z < 0.3) return true; // barrels
  if (Math.hypot(x + 1.85, z + 2.0) < 0.85) return true; // sacred rock
  if (x < -1.55 && x > -2.5 && z > 2.45 && z < 3.5) return true; // basin
  if (Math.abs(x + 2.25) < 0.25 && z > 0.4 && z < 2.5) return true; // ema posts
  if (Math.hypot(x - 1.62, z - 3.05) < 0.35) return true; // marker
  if (Math.hypot(x - 1.95, z + 2.0) < 0.4) return true; // trunk
  return false;
}

function ground() {
  const R = rng(61);
  const tufts = [];
  const flowers: { p: V; kind: number }[] = [];
  let guard = 0;
  while (tufts.length < 330 && guard++ < 4000) {
    const x = (R() * 2 - 1) * GX;
    const z = GZC + (R() * 2 - 1) * GZH;
    if (keepOut(x, z)) continue;
    tufts.push(frame([x, G, z], [0, 1, 0]));
  }
  b.cards(tufts, TUFT, { size: [0.17, 0.2], cross: true, vary: 0.35, rng: rng(62), spin: 180, flow: [0, 0, 1] });
  guard = 0;
  while (flowers.length < 70 && guard++ < 4000) {
    const x = (R() * 2 - 1) * GX;
    const z = GZC + (R() * 2 - 1) * GZH;
    if (keepOut(x, z)) continue;
    flowers.push({ p: [x, G, z], kind: R() < 0.55 ? 0 : 1 });
  }
  for (const k of [0, 1])
    b.cards(
      flowers.filter((f) => f.kind === k).map((f) => frame(f.p, [0, 1, 0])),
      k === 0 ? FLOWER_A : FLOWER_B,
      { size: [0.085, 0.14], cross: true, vary: 0.3, rng: rng(63 + k), spin: 180, flow: [0, 0, 1] },
    );
  // pebbles in the shrine yard
  const peb = batch(cel("#cbc2cf", "#9890ac"));
  for (let i = 0; i < 60; i++) {
    const x = (R() * 2 - 1) * 1.55;
    const z = -2.3 + R() * 2.7;
    if (Math.abs(x) < 1.2 && z < -0.45) continue;
    if (Math.abs(x) < 0.75 && z > -0.5) continue;
    if (Math.hypot(Math.abs(x) - 1.55, z + 0.62) < 0.38) continue;
    if (Math.hypot(Math.abs(x) - 1.02, z - 0.95) < 0.45) continue;
    peb.add(new THREE.IcosahedronGeometry(1, 0), [x, G + 0.008, z], [R() * 90, R() * 90, 0], [0.025 + R() * 0.02, 0.014, 0.022 + R() * 0.02]);
  }
  peb.done("pebbles");
  // fallen petals on the paving and grass
  const pf = [];
  for (let i = 0; i < 90; i++) {
    const x = -1.3 + R() * 3.6;
    const z = -2.2 + R() * 5.2;
    if (keepOut(x, z) && R() < 0.8) continue;
    if (z < -0.45 && Math.abs(x) < 1.4 && z > -2.5) continue;
    pf.push(frame([x, G + 0.016 + (z > 0.1 && Math.abs(x) < 0.8 ? 0.05 : 0), z], [0, 1, 0]));
  }
  b.cards(pf, PETAL, { size: 0.06, lean: 90, flow: [1, 0, 0.5], vary: 0.3, spin: 180, mirror: true, rng: rng(66), sink: 0 });
  // petals on the air
  const air = [];
  for (let i = 0; i < 38; i++) {
    const p: V = [-0.8 + R() * 3.4, 0.5 + R() * 3.0, -2.4 + R() * 2.8];
    const dir: V = [R() * 2 - 1, 0.6 + R(), R() * 2 - 1];
    air.push(frame(p, dir));
  }
  b.cards(air, PETAL, { size: 0.075, lean: 90, flow: [1, 0, 0], vary: 0.3, mirror: true, rng: rng(67), sink: 0 });
}
ground();

// Electro motes drifting round the hall: crystals with a bright core
function motes() {
  const pts: [V, number][] = [
    [[0.75, 1.75, -0.3], 1], [[-0.85, 2.05, -0.5], 0.8], [[0.3, 2.55, -0.9], 0.7], [[-0.4, 1.5, 0.35], 0.9],
    [[1.1, 1.3, -0.1], 0.6], [[-1.15, 1.25, -0.2], 0.7], [[0.1, 2.1, 0.5], 0.6],
  ];
  pts.forEach(([p, k], i) => {
    const g = new THREE.OctahedronGeometry(0.04 * k, 0);
    glow(b.part(g, "#c78bff", { bone: root, at: p, scale: [1, 1.7, 1], rotation: [0, i * 40, 12], name: "electroMote" }), 1.4);
    glow(sph(p, 0.012 * k, "#f4e6ff", { seg: 4, seg2: 3 }), 2);
  });
}
motes();

// ink line of the plinth: dark outline strip where the tiers meet the ground
void INK;

export default function build() {
  return b.root;
}
