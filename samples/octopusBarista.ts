import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { PartOptions } from "../src/parts";
import type { Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull, spiral } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Octopus Barista",
  description:
    "A small pink octopus in a teal barista beret, standing on a curl of tentacles behind a candy-coloured coffee cart: one tentacle cups a latte with steam, another hugs a milk jug, and the rest spread out with curled tips. A beak with a separate lower jaw, a menu board, cups, an espresso machine and bunting dress the cart.",
};

// ---------------------------------------------------------------- palette
const PINK = "#ff8fb5";
const PINK_L = "#ffc6d9";
const PINK_D = "#f0679b";
const CREAM = "#fff3dc";
const BEAK = "#ffd884";
const MOUTH = "#8c2a55";
const TONGUE = "#ff7f9f";
const INK = "#3a2142";
const TEAL = "#3cc9b6";
const TEAL_D = "#22a394";
const MINT = "#a0ead8";
const WOOD = "#f2c38c";
const WOOD_D = "#d99b64";
const CHOC = "#8a5a44";
const STEEL = "#d3e0ec";
const STEEL_D = "#9db2c6";
const LILAC = "#b9a3f2";
const LILAC_D = "#8b73d6";
const BUTTER = "#ffe27a";
const SKY = "#8fd6ff";
const RED = "#ff6f7d";
const LEAF = "#6fd88c";
const SOIL = "#6b4636";

// ---------------------------------------------------------------- drawings
const ST = 'stroke-linecap="round" stroke-linejoin="round"';

const EYE = svg(
  `<svg viewBox="0 0 100 120">
    <defs><clipPath id="e"><ellipse cx="50" cy="62" rx="46" ry="56"/></clipPath></defs>
    <ellipse cx="50" cy="62" rx="46" ry="56" fill="${INK}"/>
    <g clip-path="url(#e)">
      <ellipse cx="50" cy="110" rx="46" ry="30" fill="#6b4bb8"/>
      <ellipse cx="50" cy="118" rx="34" ry="18" fill="#a488ea"/>
    </g>
    <circle cx="34" cy="38" r="17" fill="#fff"/>
    <circle cx="69" cy="82" r="8" fill="#fff"/>
    <circle cx="63" cy="31" r="5" fill="#fff"/>
  </svg>`,
  { size: 192 },
);

const BROW = svg(
  `<svg viewBox="0 0 60 24"><path d="M6 19 Q28 -1 54 11" fill="none" stroke="#c4467f" stroke-width="8" ${ST}/></svg>`,
  { size: 128 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 80 44">
    <ellipse cx="40" cy="22" rx="38" ry="20" fill="#ff5f95"/>
    <path d="M22 10 L30 34 M38 8 L46 36 M54 10 L62 32" stroke="#ffa6c4" stroke-width="5" ${ST}/>
  </svg>`,
  { size: 160 },
);

const BEAN = svg(
  `<svg viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="29" fill="${CREAM}"/>
    <circle cx="30" cy="30" r="23" fill="${TEAL_D}"/>
    <ellipse cx="30" cy="30" rx="12" ry="17" transform="rotate(28 30 30)" fill="${CREAM}"/>
    <path d="M25 17 Q36 30 35 43" fill="none" stroke="${CHOC}" stroke-width="4.5" ${ST}/>
  </svg>`,
  { size: 128 },
);

const HEART = svg(
  `<svg viewBox="0 0 60 56">
    <path d="M30 52 C2 32 6 6 30 18 C54 6 58 32 30 52Z" fill="${RED}"/>
    <path d="M14 18 Q16 11 23 12" fill="none" stroke="#fff" stroke-width="5" ${ST}/>
  </svg>`,
  { size: 128 },
);

const DROP = svg(
  `<svg viewBox="0 0 50 64">
    <path d="M25 4 C40 26 46 34 46 42 C46 54 37 60 25 60 C13 60 4 54 4 42 C4 34 10 26 25 4Z" fill="${SKY}" stroke="#4aa6e0" stroke-width="4"/>
    <path d="M14 42 Q15 50 22 52" fill="none" stroke="#fff" stroke-width="5" ${ST}/>
  </svg>`,
  { size: 128 },
);

const STEAM = svg(
  `<svg viewBox="0 0 56 112">
    <g fill="none" ${ST}>
      <path d="M22 106 C4 88 40 76 22 58 C6 42 34 30 24 10" stroke="#d6c8f4" stroke-width="14"/>
      <path d="M22 106 C4 88 40 76 22 58 C6 42 34 30 24 10" stroke="#ffffff" stroke-width="7"/>
      <path d="M42 100 C32 90 50 82 42 70" stroke="#d6c8f4" stroke-width="12"/>
      <path d="M42 100 C32 90 50 82 42 70" stroke="#ffffff" stroke-width="6"/>
    </g>
    <path d="M44 30 C34 22 36 12 44 16 C52 12 54 22 44 30Z" fill="${PINK_D}"/>
    <path d="M9 28 L11 22 L13 28 L19 30 L13 32 L11 38 L9 32 L3 30Z" fill="${BUTTER}"/>
  </svg>`,
  { size: 256 },
);

const LATTE = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill="#b87a4f"/>
    <circle cx="50" cy="50" r="43" fill="#d39a68"/>
    <path d="M50 84 C10 58 20 18 50 38 C80 18 90 58 50 84Z" fill="${CREAM}"/>
    <path d="M50 70 C28 55 34 36 50 46 C66 36 72 55 50 70Z" fill="#d39a68"/>
    <path d="M50 58 C42 52 44 46 50 50 C56 46 58 52 50 58Z" fill="${CREAM}"/>
  </svg>`,
  { size: 128 },
);

const FLOWER = svg(
  `<svg viewBox="0 0 50 80">
    <path d="M25 78 L25 30" stroke="#4fbf72" stroke-width="5" ${ST}/>
    <path d="M25 62 Q8 58 6 44 Q22 46 25 62Z" fill="${LEAF}"/>
    <path d="M25 52 Q42 50 44 36 Q28 38 25 52Z" fill="${LEAF}"/>
    ${[0, 60, 120, 180, 240, 300]
      .map(
        (a) =>
          `<ellipse cx="25" cy="11" rx="7" ry="11" transform="rotate(${a} 25 22)" fill="${a % 120 ? "#ffc6d9" : "#ff8fb5"}"/>`,
      )
      .join("")}
    <circle cx="25" cy="22" r="7" fill="${BUTTER}"/>
  </svg>`,
  { size: 128 },
);

const pennant = (a: string, b: string) =>
  svg(
    `<svg viewBox="0 0 40 52"><polygon points="2,50 38,50 20,4" fill="${a}"/><circle cx="20" cy="32" r="6" fill="${b}"/><circle cx="11" cy="45" r="2.6" fill="${b}"/><circle cx="29" cy="45" r="2.6" fill="${b}"/></svg>`,
    { size: 64 },
  );
const FLAGS = [pennant(PINK, CREAM), pennant(BUTTER, PINK_D), pennant(TEAL, CREAM), pennant(LILAC, BUTTER)];

const PANEL_FRONT = svg(
  `<svg viewBox="0 0 380 80">
    <rect width="380" height="80" fill="${MINT}"/>
    ${Array.from({ length: 20 }, (_, i) => {
      const c = i % 2 ? CREAM : PINK;
      return `<rect x="${i * 19}" y="0" width="19" height="22" fill="${c}"/><circle cx="${i * 19 + 9.5}" cy="22" r="9.5" fill="${c}"/>`;
    }).join("")}
    <rect x="104" y="34" width="172" height="38" rx="14" fill="${CHOC}"/>
    <rect x="108" y="38" width="164" height="30" rx="11" fill="none" stroke="${CREAM}" stroke-width="2" stroke-dasharray="6 5"/>
    <text x="190" y="61" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-weight="900" font-size="24" fill="${CREAM}">OCTO CAFÉ</text>
    <path d="M30 70 L32 50 L62 50 L64 70Z" fill="${CREAM}"/>
    <path d="M64 53 Q76 54 74 62 Q72 68 63 66" fill="none" stroke="${CREAM}" stroke-width="4"/>
    <path d="M38 46 Q34 40 39 35 M47 46 Q43 40 48 35" fill="none" stroke="#fff" stroke-width="3" ${ST}/>
    <path d="M324 66 C304 52 308 40 324 46 C340 40 344 52 324 66Z" fill="${RED}"/>
    <path d="M345 44 L347 38 L349 44 L355 46 L349 48 L347 54 L345 48 L339 46Z" fill="${BUTTER}"/>
  </svg>`,
  { size: 760 },
);

const PANEL_SIDE = svg(
  `<svg viewBox="0 0 190 80">
    <rect width="190" height="80" fill="${MINT}"/>
    <rect x="0" y="0" width="190" height="8" fill="${PINK}"/>
    <rect x="0" y="72" width="190" height="8" fill="${PINK}"/>
    ${[
      [24, 28],
      [70, 52],
      [150, 26],
      [120, 58],
      [172, 60],
      [30, 58],
    ]
      .map(([x, y], i) =>
        i % 2
          ? `<path d="M${x} ${y + 9} C${x - 14} ${y - 2} ${x - 10} ${y - 14} ${x} ${y - 8} C${x + 10} ${y - 14} ${x + 14} ${y - 2} ${x} ${y + 9}Z" fill="${PINK}"/>`
          : `<path d="M${x} ${y - 10} L${x + 3} ${y - 3} L${x + 10} ${y} L${x + 3} ${y + 3} L${x} ${y + 10} L${x - 3} ${y + 3} L${x - 10} ${y} L${x - 3} ${y - 3}Z" fill="${BUTTER}"/>`,
      )
      .join("")}
    <ellipse cx="95" cy="42" rx="26" ry="22" fill="${PINK}"/>
    <circle cx="86" cy="40" r="4.5" fill="${INK}"/><circle cx="104" cy="40" r="4.5" fill="${INK}"/>
    <circle cx="84.5" cy="38.5" r="1.6" fill="#fff"/><circle cx="102.5" cy="38.5" r="1.6" fill="#fff"/>
    <path d="M90 50 Q95 55 100 50" fill="none" stroke="${INK}" stroke-width="2.4" ${ST}/>
    <ellipse cx="78" cy="48" rx="5" ry="3" fill="${PINK_D}"/><ellipse cx="112" cy="48" rx="5" ry="3" fill="${PINK_D}"/>
    <path d="M78 20 Q95 4 112 20 Z" fill="${TEAL}"/>
  </svg>`,
  { size: 512 },
);

const MENU = svg(
  `<svg viewBox="0 0 110 150">
    <rect width="110" height="150" fill="#3f5368"/>
    <rect x="3" y="3" width="104" height="144" rx="5" fill="none" stroke="${CREAM}" stroke-width="1.6" stroke-dasharray="5 3"/>
    <text x="55" y="27" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-weight="900" font-size="19" fill="${BUTTER}">MENU</text>
    <path d="M22 34 Q32 29 42 34 T62 34 T82 34 T90 33" fill="none" stroke="${PINK}" stroke-width="2.4" ${ST}/>
    ${[
      ["latte", "3", 58],
      ["mocha", "4", 82],
      ["inkpresso", "5", 106],
    ]
      .map(
        ([n, p, y]) =>
          `<text x="14" y="${y}" font-family="Trebuchet MS, Verdana, sans-serif" font-weight="700" font-size="13" fill="${CREAM}">${n}</text><text x="96" y="${y}" text-anchor="end" font-family="Trebuchet MS, Verdana, sans-serif" font-weight="900" font-size="14" fill="${BUTTER}">${p}</text><path d="M14 ${Number(y) + 6} L96 ${Number(y) + 6}" stroke="#7d93aa" stroke-width="1.2" stroke-dasharray="2 3"/>`,
      )
      .join("")}
    <path d="M55 138 C40 128 42 118 55 123 C68 118 70 128 55 138Z" fill="${PINK}"/>
  </svg>`,
  { size: 384 },
);

const GAUGE = svg(
  `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="${STEEL_D}"/><circle cx="20" cy="20" r="15" fill="${CREAM}"/><path d="M20 20 L29 12" stroke="${RED}" stroke-width="3.4" ${ST}/><circle cx="20" cy="20" r="3" fill="${INK}"/><path d="M8 28 L12 24 M20 7 L20 11 M32 28 L28 24" stroke="${INK}" stroke-width="2" ${ST}/></svg>`,
  { size: 96 },
);

const PLATE = svg(
  `<svg viewBox="0 0 60 30"><rect width="60" height="30" rx="6" fill="${BUTTER}"/><text x="30" y="21" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-weight="900" font-size="15" fill="${CHOC}">TIPS</text></svg>`,
  { size: 128 },
);

function spotSheet(seed: number, n: number) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = 10 + r() * 80;
    const y = 10 + r() * 80;
    const rad = 4 + r() * 7;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="${i % 3 ? PINK_D : PINK_L}"/>`;
  }
  return svg(`<svg viewBox="0 0 100 100">${out}</svg>`, { size: 192 });
}
const SPOTS_A = spotSheet(11, 9);
const SPOTS_B = spotSheet(23, 9);

// ---------------------------------------------------------------- helpers
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

export default function build() {
  const b = createBuilder({ name: "octopusBarista" });
  const put = (g: THREE.BufferGeometry, color: string, o: PartOptions = {}) => b.part(g, color, { flat: true, ...o });

  // ------------------------------------------------------------ skeleton
  const tilt = V(0, 1, -0.22).normalize();
  const C = V(0, 0, -0.14); // octopus centre on the floor plan
  const A0 = V(0, 0.14, -0.14); // bulb base

  const body = b.joint("body", { at: [0, 0.17, -0.14], dir: [0, 1, 0], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 0.2, -0.145], dir: tilt, role: "head" });
  const mouthY = 0.262;
  const jaw = b.joint("jaw", { parent: head, at: [0, mouthY - 0.022, -0.03], dir: [0, 0, 1], role: "jaw" });
  const cart = b.joint("cart", { parent: body, at: [0, 0.05, 0.3], dir: [0, 1, 0] });

  // ------------------------------------------------------------ head
  const bulb = b.lathe(
    [
      [0, 0],
      [0.07, 0.004],
      [0.12, 0.03],
      [0.146, 0.09],
      [0.15, 0.15],
      [0.13, 0.22],
      [0.09, 0.285],
      [0.04, 0.322],
      [0, 0.33],
    ],
    { at: A0, axis: tilt, segments: 10, color: PINK, bone: head },
  );
  const skin = b.surface(bulb);

  for (const s of [1, -1]) {
    b.decal(skin, EYE, { at: [s * 0.062, 0.33, 0.2], dir: [0, 0, 1], size: [0.078, 0.094], segments: [8, 9] });
    b.decal(skin, BLUSH, {
      at: [s * 0.108, 0.272, 0.2],
      dir: [0, 0, 1],
      size: [0.05, 0.028],
      segments: [6, 4],
      roll: s * -8,
    });
    b.decal(skin, BROW, {
      at: [s * 0.066, 0.388, 0.2],
      dir: [0, 0, 1],
      size: [0.046, 0.018],
      segments: [6, 3],
      mirror: s > 0,
      roll: s * 6,
    });
  }
  b.decal(skin, SPOTS_A, { at: [0, 0.3, -0.3], dir: [0, 0.1, -1], size: [0.2, 0.2], segments: [10, 10] });
  b.decal(skin, SPOTS_B, { at: [0.16, 0.3, -0.2], dir: [1, 0, -0.1], size: [0.15, 0.17], segments: [8, 9] });
  b.decal(skin, SPOTS_B, {
    at: [-0.16, 0.3, -0.2],
    dir: [-1, 0, -0.1],
    size: [0.15, 0.17],
    segments: [8, 9],
    mirror: true,
  });

  // mouth: dark cavity and a small hooked upper beak on the head, a round chin-jaw on the jaw bone
  const mp = skin.ray([0, mouthY, 0.5], [0, 0, -1])!.at.clone();
  put(new THREE.SphereGeometry(0.03, 8, 5), MOUTH, {
    bone: head,
    at: [0, mouthY - 0.004, mp.z + 0.004],
    scale: [1.25, 0.85, 0.45],
  });
  const hookDir = V(0, -1, 0.45).normalize();
  put(new THREE.ConeGeometry(0.02, 0.04, 4), BEAK, {
    bone: head,
    at: V(0, mouthY + 0.012, mp.z + 0.012).addScaledVector(hookDir, 0.014),
    dir: hookDir,
    scale: [1.4, 1, 0.8],
  });
  const chinAt = V(0, mouthY - 0.02, mp.z + 0.006);
  put(new THREE.SphereGeometry(0.03, 8, 4), BEAK, { bone: jaw, at: chinAt, scale: [1.05, 0.45, 0.85] });
  put(new THREE.SphereGeometry(0.016, 6, 4), TONGUE, {
    bone: jaw,
    at: chinAt.clone().add(V(0, 0.008, 0.004)),
    scale: [1.3, 0.5, 1],
  });

  // beret, visor, pompom
  const seat = A0.clone().addScaledVector(tilt, 0.26);
  const cap = b.lathe(
    [
      [0, 0],
      [0.118, 0],
      [0.118, 0.016],
      [0.11, 0.036],
      [0.085, 0.062],
      [0.045, 0.08],
      [0, 0.086],
    ],
    { at: seat, axis: tilt, segments: 10, color: TEAL, bone: head },
  );
  b.lathe(
    [
      [0, 0.0],
      [0.121, 0.0],
      [0.121, 0.013],
      [0, 0.013],
    ],
    { at: seat.clone().addScaledVector(tilt, 0.003), axis: tilt, segments: 10, color: TEAL_D, bone: head },
  );
  b.extrude(
    [
      [-0.05, 0],
      [-0.06, 0.02],
      [-0.03, 0.05],
      [0.03, 0.05],
      [0.06, 0.02],
      [0.05, 0],
    ],
    {
      at: [0, 0.396, -0.092],
      x: [1, 0, 0],
      y: [0, -0.287, 0.958],
      thickness: 0.007,
      smoothing: 1,
      color: TEAL_D,
      bone: head,
    },
  );
  put(new THREE.SphereGeometry(0.015, 6, 4), BUTTER, { bone: head, at: seat.clone().addScaledVector(tilt, 0.09) });
  b.decal(cap, BEAN, { at: [0, 0.452, -0.05], dir: [0, 0.4, 1], size: [0.036, 0.036], segments: [5, 5] });

  // ------------------------------------------------------------ tentacles
  const tentRadii = [0.05, 0.042, 0.034, 0.026, 0.019, 0.014, 0.01, 0.007];
  const suckers = (sw: Sweep, from: number, to: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const t = from + ((to - from) * i) / Math.max(1, count - 1);
      const hit = sw.at(t, 180);
      const r = Math.max(0.006, hit.radius * 0.55);
      b.stick(new THREE.CylinderGeometry(r * 0.75, r, r * 0.5, 6), CREAM, hit, { embed: 0.45, flat: true });
    }
  };

  const floorSpecs: Array<[number, number, number]> = [
    [62, 0.34, 0.03],
    [112, 0.3, -0.035],
    [158, 0.27, 0.03],
  ];
  let k = 0;
  for (const [deg, reach, sway] of floorSpecs) {
    for (const s of [1, -1]) {
      k++;
      const phi = (deg * Math.PI) / 180;
      const d = V(s * Math.sin(phi), 0, Math.cos(phi));
      const p = V(s * Math.cos(phi), 0, -Math.sin(phi)); // sideways, mirrored with the side
      const at = (r: number, y: number, sideways = 0) =>
        C.clone().addScaledVector(d, r).addScaledVector(p, sideways).setY(y);
      const end = at(reach, 0.022, sway * 0.3);
      const R = 0.04;
      const curlCentre = end.clone().setY(0.022 + R);
      const axis = d.clone().cross(UP);
      const route = catmull([
        at(0.055, 0.205),
        at(0.105, 0.15),
        at(0.17, 0.07, sway * 0.4),
        at(reach * 0.62, 0.032, sway),
        end,
      ]).concat(spiral(curlCentre, end, axis, { turns: 1.15, r1: 0.013, pitch: 0.012 }));
      const names = (i: number) => `tentacle${s > 0 ? "L" : "R"}${(k + 1) >> 1}_${i + 1}`;
      const chain = b.chain(`tentacle${s > 0 ? "L" : "R"}${(k + 1) >> 1}`, route, {
        parent: body,
        count: 10,
        names,
        role: "tentacle",
      });
      const sw = b.sweep(chain, tentRadii, { color: PINK, sides: 6, smooth: false, sectors: [[135, 225, PINK_L]] });
      suckers(sw, 0.45, 0.96, 6);
    }
  }

  // ------------------------------------------------------------ held props
  const armRadii = [0.042, 0.026, 0.016, 0.0105, 0.009, 0.0078, 0.0066, 0.0055];
  const counterTop = 0.195;
  const cupBase = 0.225;
  const holdY = cupBase + 0.012;

  function arm(s: number, cx: number, cz: number, name: string) {
    const A = (x: number, y: number, z: number) => V(s * x, y, z);
    const mid = V(s * cx, holdY, cz);
    const a3 = A(0.2, 0.2, 0.16);
    const start = mid.clone().add(a3.clone().sub(mid).setY(0).normalize().multiplyScalar(0.04));
    const route = catmull([A(0.05, 0.21, -0.12), A(0.13, 0.175, -0.02), A(0.185, 0.18, 0.09), a3, start]).concat(
      spiral(mid, start, [0, 1, 0], { turns: -s * 1.6, r1: 0.046, pitch: 0.03 }),
    );
    const chain = b.chain(name, route, {
      parent: body,
      count: 14,
      names: (i) => `${name}_${i + 1}`,
      role: "tentacle",
    });
    const sw = b.sweep(chain, armRadii, { color: PINK, sides: 6, smooth: false, sectors: [[135, 225, PINK_L]] });
    suckers(sw, 0.3, 0.93, 7);
    return chain.joints[chain.joints.length - 1] as Joint;
  }

  // latte cup on the octopus's right (-x)
  {
    const cx = -0.14;
    const cz = 0.26;
    const hand = arm(-1, -cx, cz, "armR");
    const cup = b.lathe(
      [
        [0, 0],
        [0.026, 0],
        [0.04, 0.07],
        [0.036, 0.07],
        [0.0235, 0.012],
        [0, 0.012],
      ],
      { at: [cx, cupBase, cz], segments: 10, color: SKY, bone: hand },
    );
    put(new THREE.CircleGeometry(0.0335, 10), "#ffffff", {
      bone: hand,
      at: [cx, cupBase + 0.059, cz],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: LATTE,
    });
    b.decal(cup, HEART, {
      at: [cx, cupBase + 0.035, cz + 0.1],
      dir: [0, 0, 1],
      size: [0.024, 0.022],
      segments: [5, 5],
    });
    const frames = [
      frame([cx - 0.014, cupBase + 0.066, cz], [0, 1, 0]),
      frame([cx + 0.014, cupBase + 0.066, cz - 0.002], [0, 1, 0]),
    ];
    b.cards(frames, STEAM, { size: [0.06, 0.12], flow: [0, 0, 1], lean: 0, bone: hand, vary: 0.2, rng: rng(3) });
  }

  // milk jug on the octopus's left (+x)
  {
    const jx = 0.14;
    const jz = 0.26;
    const hand = arm(1, jx, jz, "armL");
    const jug = b.lathe(
      [
        [0, 0],
        [0.028, 0],
        [0.042, 0.03],
        [0.039, 0.06],
        [0.034, 0.095],
        [0.03, 0.095],
        [0.035, 0.06],
        [0.038, 0.03],
        [0, 0.016],
      ],
      { at: [jx, cupBase, jz], segments: 10, color: STEEL, bone: hand },
    );
    put(new THREE.CircleGeometry(0.031, 10), CREAM, {
      bone: hand,
      at: [jx, cupBase + 0.086, jz],
      dir: [0, 1, 0],
      axis: "z",
    });
    put(new THREE.ConeGeometry(0.017, 0.036, 4), STEEL, {
      bone: hand,
      at: [jx - 0.04, cupBase + 0.092, jz],
      dir: [-0.9, 0.42, 0],
      scale: [1, 1, 0.7],
    });
    const handle = catmull([
      [jx, cupBase + 0.084, jz - 0.033],
      [jx, cupBase + 0.096, jz - 0.058],
      [jx, cupBase + 0.07, jz - 0.072],
      [jx, cupBase + 0.042, jz - 0.058],
      [jx, cupBase + 0.036, jz - 0.038],
    ]);
    b.sweep(handle, 0.007, { color: STEEL_D, sides: 5, smooth: false, bone: hand });
    b.decal(jug, DROP, { at: [jx, cupBase + 0.05, jz + 0.1], dir: [0, 0, 1], size: [0.028, 0.034], segments: [5, 5] });
  }

  // ------------------------------------------------------------ the cart
  const onCart = (g: THREE.BufferGeometry, color: string, at: [number, number, number], o: PartOptions = {}) =>
    put(g, color, { bone: cart, at, ...o });
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], o: PartOptions = {}) =>
    onCart(new THREE.BoxGeometry(w, h, d), color, at, o);
  const sticker = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: [number, number, number],
    dir: [number, number, number],
    o: PartOptions = {},
  ) => b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: cart, at, dir, axis: "z", texture: tex, ...o });
  const shrink = (pts: Array<[number, number]>, k: number): Array<[number, number]> =>
    pts.map(([x, y]) => [x * k, y * k]);

  const cz0 = 0.29; // cart centre z
  box(0.64, 0.128, 0.34, MINT, [0, 0.109, cz0]);
  box(0.7, 0.022, 0.38, WOOD, [0, counterTop - 0.011, cz0]);
  box(0.71, 0.008, 0.39, WOOD_D, [0, counterTop - 0.026, cz0]);
  sticker(PANEL_FRONT, 0.64, 0.128, [0, 0.109, cz0 + 0.1725], [0, 0, 1]);
  sticker(PANEL_FRONT, 0.64, 0.128, [0, 0.109, cz0 - 0.1725], [0, 0, -1]);
  for (const s of [1, -1]) {
    sticker(PANEL_SIDE, 0.34, 0.128, [s * 0.3225, 0.109, cz0], [s, 0, 0]);
    // wheels
    onCart(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 10), CHOC, [s * 0.34, 0.045, 0.17], { dir: [1, 0, 0] });
    onCart(new THREE.CylinderGeometry(0.027, 0.027, 0.034, 8), CREAM, [s * 0.34, 0.045, 0.17], { dir: [1, 0, 0] });
    onCart(new THREE.CylinderGeometry(0.01, 0.01, 0.038, 6), PINK_D, [s * 0.34, 0.045, 0.17], { dir: [1, 0, 0] });
    // legs
    for (const z of [0.44]) onCart(new THREE.CylinderGeometry(0.013, 0.013, 0.05, 6), CHOC, [s * 0.28, 0.025, z]);
    // bunting poles and string
    for (const [z, top] of [
      [0.44, 0.465],
      [0.14, 0.445],
    ] as const) {
      b.rod([s * 0.33, counterTop, z], [s * 0.33, top, z], 0.0065, {
        color: CHOC,
        sides: 5,
        smooth: false,
        bone: cart,
      });
      onCart(new THREE.SphereGeometry(0.012, 6, 4), BUTTER, [s * 0.33, top + 0.006, z]);
    }
    const string = catmull([
      [s * 0.33, 0.46, 0.44],
      [s * 0.33, 0.428, 0.36],
      [s * 0.33, 0.41, 0.29],
      [s * 0.33, 0.424, 0.22],
      [s * 0.33, 0.44, 0.14],
    ]);
    b.sweep(string, 0.0026, { color: CHOC, sides: 4, smooth: false, bone: cart });
    const flagFrames = Array.from({ length: 6 }, (_, i) => frame(string.at(0.08 + (i * 0.84) / 5), [0, 1, 0]));
    b.cards(flagFrames, FLAGS, {
      size: [0.042, 0.055],
      lean: 180,
      flow: [s, 0, 0.6],
      sink: 0,
      bone: cart,
      rng: rng(4 + s),
    });
  }

  // espresso machine (octopus's left end of the counter)
  {
    const mx = 0.25;
    const mz = 0.2;
    box(0.105, 0.088, 0.08, LILAC, [mx, counterTop + 0.044, mz]);
    box(0.112, 0.012, 0.088, LILAC_D, [mx, counterTop + 0.094, mz]);
    box(0.09, 0.007, 0.046, STEEL_D, [mx, counterTop + 0.0035, mz + 0.054]);
    onCart(new THREE.CylinderGeometry(0.018, 0.016, 0.02, 8), STEEL, [mx, counterTop + 0.068, mz + 0.045]);
    sticker(GAUGE, 0.028, 0.028, [mx, counterTop + 0.078, mz + 0.0405], [0, 0, 1]);
    [-0.035, 0.035].forEach((x, i) =>
      onCart(new THREE.SphereGeometry(0.007, 6, 4), i ? RED : BUTTER, [mx + x, counterTop + 0.044, mz + 0.041]),
    );
    b.rod([mx + 0.053, counterTop + 0.066, mz + 0.02], [mx + 0.07, counterTop + 0.026, mz + 0.035], 0.0045, {
      color: STEEL_D,
      sides: 5,
      smooth: false,
      bone: cart,
    });
    b.lathe(
      shrink(
        [
          [0, 0],
          [0.014, 0],
          [0.02, 0.028],
          [0.017, 0.028],
          [0.011, 0.005],
          [0, 0.005],
        ],
        0.9,
      ),
      {
        at: [mx, counterTop + 0.007, mz + 0.054],
        segments: 8,
        color: CREAM,
        bone: cart,
      },
    );
  }

  // menu board on the counter (octopus's right, front)
  {
    const th = (12 * Math.PI) / 180;
    const hinge = V(-0.235, counterTop + 0.148, 0.36);
    const front = V(0, -0.075 * Math.cos(th), 0.075 * Math.sin(th));
    const back = V(0, -0.075 * Math.cos(th), -0.075 * Math.sin(th));
    const qf = new THREE.Quaternion().setFromEuler(new THREE.Euler(-th, 0, 0));
    const qb = new THREE.Quaternion().setFromEuler(new THREE.Euler(th, 0, 0));
    const fc = hinge.clone().add(front);
    onCart(new THREE.BoxGeometry(0.115, 0.15, 0.012), WOOD_D, fc.toArray() as [number, number, number], { quat: qf });
    onCart(
      new THREE.BoxGeometry(0.115, 0.15, 0.012),
      WOOD_D,
      hinge.clone().add(back).toArray() as [number, number, number],
      { quat: qb },
    );
    const face = fc.clone().add(V(0, 0, 0.0066).applyQuaternion(qf));
    b.part(new THREE.PlaneGeometry(0.099, 0.134), "#ffffff", { bone: cart, at: face, quat: qf, texture: MENU });
  }

  // takeaway cups and tip jar, front of the counter
  [0.12, 0.19, 0.26].forEach((x, i) => {
    const z = 0.4;
    const tone = [PINK, BUTTER, TEAL][i];
    const at: [number, number, number] = [x, counterTop, z];
    b.lathe(
      shrink(
        [
          [0, 0],
          [0.021, 0],
          [0.029, 0.058],
          [0.027, 0.058],
          [0.0195, 0.006],
          [0, 0.006],
        ],
        0.88,
      ),
      {
        at,
        segments: 10,
        color: CREAM,
        bone: cart,
      },
    );
    b.lathe(
      shrink(
        [
          [0.0235, 0.018],
          [0.0255, 0.018],
          [0.0275, 0.044],
          [0.0255, 0.044],
        ],
        0.88,
      ),
      { at, segments: 10, color: tone, bone: cart },
    );
    b.lathe(
      shrink(
        [
          [0, 0.056],
          [0.03, 0.056],
          [0.03, 0.062],
          [0.019, 0.068],
          [0, 0.07],
        ],
        0.88,
      ),
      {
        at,
        segments: 10,
        color: tone,
        bone: cart,
      },
    );
  });
  {
    const jx = -0.05;
    const jz = 0.41;
    b.lathe(
      shrink(
        [
          [0, 0],
          [0.03, 0],
          [0.033, 0.01],
          [0.033, 0.06],
          [0.03, 0.065],
          [0, 0.065],
        ],
        0.92,
      ),
      {
        at: [jx, counterTop, jz],
        segments: 10,
        color: "#d8f3fb",
        bone: cart,
      },
    );
    for (const [dx, dy, dz] of [
      [-0.008, 0.012, 0.004],
      [0.01, 0.014, -0.006],
      [0.0, 0.026, 0.006],
    ])
      onCart(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 6), BUTTER, [jx + dx, counterTop + dy, jz + dz], {
        dir: [0.2, 1, 0.4],
      });
    sticker(PLATE, 0.04, 0.02, [jx, counterTop + 0.036, jz + 0.0315], [0, 0, 1]);
  }

  // flower pot with sprite-card daisies
  {
    const px = -0.27;
    const pz = 0.19;
    b.lathe(
      shrink(
        [
          [0, 0],
          [0.022, 0],
          [0.03, 0.04],
          [0.034, 0.046],
          [0.03, 0.046],
          [0, 0.04],
        ],
        0.95,
      ),
      {
        at: [px, counterTop, pz],
        segments: 8,
        color: PINK_D,
        bone: cart,
      },
    );
    onCart(new THREE.CylinderGeometry(0.028, 0.028, 0.006, 8), SOIL, [px, counterTop + 0.041, pz]);
    const plants = [
      [0, 0],
      [0.012, 0.004],
      [-0.012, 0.004],
      [0.004, -0.012],
    ].map(([x, z], i) => frame([px + x, counterTop + 0.043, pz + z], [(i - 1.5) * 0.12, 1, i % 2 ? 0.08 : -0.08]));
    b.cards(plants, FLOWER, { size: [0.05, 0.08], flow: [0, 0, 1], cross: true, vary: 0.25, rng: rng(9), bone: cart });
  }

  // ------------------------------------------------------------ rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 16 });

  return b.root;
}
