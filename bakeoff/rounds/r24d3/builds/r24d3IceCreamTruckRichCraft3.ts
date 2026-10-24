import * as THREE from "three";
import { createBuilder, rng, paint, mix, smoothstep, cells, grain, spots, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ice Cream Truck",
  description:
    "A chubby pastel ice cream van in a cozy Animal Crossing style: smiling grille with blush cheeks, headlight eyes with lashes, striped scalloped serving awning, glowing interior, and a giant dripping two-scoop cone on the roof.",
};

type Pt = [number, number, number?];
type O = Record<string, any>;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const C = {
  cream: "#fff1dc",
  white: "#fff8ea",
  mint: "#8fdcc0",
  mintD: "#5fbf9e",
  pink: "#ff9db4",
  pinkD: "#f2708f",
  butter: "#ffd86b",
  brown: "#6b4a3a",
  tan: "#e9b86c",
  tanD: "#c98d4a",
  glass: "#bfe9f5",
  tire: "#4b3f4a",
  red: "#ff6b6b",
  wood: "#d6a56a",
  woodD: "#b07f48",
  dark: "#5a4650",
  roofTop: "#ffe7ca",
  lens: "#fff2a8",
};

// ---------------------------------------------------------------------------------------------------------------
// Outline helpers
function roundPoly(pts: Pt[], seg = 4): [number, number][] {
  const out: [number, number][] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const [x, y, r = 0] = pts[i];
    if (r <= 0) {
      out.push([x, y]);
      continue;
    }
    const [px, py] = pts[(i + n - 1) % n];
    const [nx, ny] = pts[(i + 1) % n];
    const l1 = Math.hypot(px - x, py - y);
    const l2 = Math.hypot(nx - x, ny - y);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a = [x + ((px - x) / l1) * rr, y + ((py - y) / l1) * rr];
    const c = [x + ((nx - x) / l2) * rr, y + ((ny - y) / l2) * rr];
    for (let k = 0; k <= seg; k++) {
      const t = k / seg;
      const u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * x + t * t * c[0], u * u * a[1] + 2 * u * t * y + t * t * c[1]]);
    }
  }
  return out;
}

function rrect(w: number, h: number, r: number): [number, number][] {
  const x = w / 2;
  const y = h / 2;
  return roundPoly(
    [
      [x, y, r],
      [-x, y, r],
      [-x, -y, r],
      [x, -y, r],
    ],
    3,
  );
}

/** Points on a wheel-arch circle, from the rear end over the top to the front end, down to height y0. */
function archPts(zc: number, R: number, y0 = 0.32, cy = 0.5, n = 9): [number, number][] {
  const t0 = Math.asin((y0 - cy) / R);
  const a = Math.PI - t0;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const th = a + ((t0 - a) * i) / n;
    pts.push([zc + R * Math.cos(th), cy + R * Math.sin(th)]);
  }
  return pts;
}

const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const BODY = paint((p, n) => {
  const wob = 0.045 * Math.abs(Math.sin(p.z * 15.7));
  let c: string;
  if (n.y > 0.6 && p.y > 2.3) c = C.roofTop;
  else if (n.y > 0.5 && p.z > 1.5 && p.y > 1.2) c = C.mint;
  else if (p.y < 0.86 + wob) {
    const cd = cells(p, 0.17, 4);
    c = cd.d1 < 0.2 ? C.cream : C.pink;
  } else c = C.cream;
  const k = smoothstep(-0.7, 0.9, n.y);
  const lit = mix(mix(c, "#7a6aa8", 0.14), mix(c, "#ffffff", 0.12), k);
  return mix(lit, "#9a7a6a", 0.18 * smoothstep(0.55, 0.2, p.y));
});

const WAFFLE = paint((_p, _n, s) => {
  const a = s[0] / 0.085 + s[1] / 36;
  const c = s[0] / 0.085 - s[1] / 36;
  const fa = a - Math.floor(a);
  const fc = c - Math.floor(c);
  return fa < 0.14 || fc < 0.14 ? C.tanD : C.tan;
});

const AWNING = paint((p, n) => {
  const base = Math.abs(Math.floor((p.z + 2.05) / 0.2)) % 2 ? C.pink : C.cream;
  return mix(base, n.y < 0 ? "#8a6a9a" : "#ffffff", n.y < 0 ? 0.15 : 0.08);
});

const WOOD = grain(C.wood, C.woodD, { size: 0.05, axis: "z", seed: 3 });
const PINK_SCOOP = spots(C.pink, "#ffe6ee", { size: 0.11, amount: 0.3, seed: 3 });
const MINT_SCOOP = spots(C.mint, C.brown, { size: 0.09, amount: 0.35, seed: 7 });
const TIRE = paint((p, n) => mix(C.tire, "#6b5d69", 0.25 * smoothstep(0.6, 1, tri(p.z * 14 + p.y * 14)) * (1 - Math.abs(n.x))));

// ---------------------------------------------------------------------------------------------------------------
// Textures
const BR = C.brown;
const doorTex = (flip: boolean) =>
  svg(
    `<svg viewBox="0 0 105 180" xmlns="http://www.w3.org/2000/svg"><g ${flip ? 'transform="translate(105 0) scale(-1 1)"' : ""}>
    <rect x="3" y="3" width="99" height="174" rx="18" fill="#fff8ea" stroke="${BR}" stroke-width="4"/>
    <rect x="13" y="14" width="79" height="66" rx="12" fill="#bfe9f5" stroke="${BR}" stroke-width="4"/>
    <path d="M28 70 L46 24 M48 70 L66 24" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
    <path d="M13 100 H92 V150 Q92 165 78 165 H27 Q13 165 13 150Z" fill="#8fdcc0" stroke="${BR}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M52 152 C40 140 42 122 52 112 C62 122 64 140 52 152Z" fill="#fff8ea" stroke="${BR}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M52 150 V122" stroke="${BR}" stroke-width="3" stroke-linecap="round"/>
    <rect x="68" y="88" width="20" height="8" rx="4" fill="#ffd86b" stroke="${BR}" stroke-width="3"/>
    </g></svg>`,
    { size: 256 },
  );
const DOOR_A = doorTex(false);
const DOOR_B = doorTex(true);

const WS_TEX = svg(
  `<svg viewBox="0 0 160 62" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3f7ff"/><stop offset="1" stop-color="#9fd8ee"/></linearGradient></defs>
  <rect x="2" y="2" width="156" height="58" rx="14" fill="url(#g)" stroke="${BR}" stroke-width="3"/>
  <g fill="#ffffff" opacity="0.92"><ellipse cx="40" cy="38" rx="16" ry="7"/><ellipse cx="52" cy="33" rx="11" ry="8"/><ellipse cx="112" cy="26" rx="14" ry="6"/><ellipse cx="122" cy="22" rx="9" ry="7"/></g>
  <path d="M70 58 L92 4 M88 58 L104 18" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.55"/>
  </svg>`,
  { size: 384 },
);

const SIGN_TEX = svg(
  `<svg viewBox="0 0 190 26" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="187" height="23" rx="11.5" fill="#8fdcc0" stroke="${BR}" stroke-width="3"/>
  <text x="95" y="19.5" text-anchor="middle" font-family="'Trebuchet MS', Verdana, sans-serif" font-weight="900" font-size="17" letter-spacing="2" fill="#fff8ea" stroke="${BR}" stroke-width="3" paint-order="stroke" stroke-linejoin="round">ICE CREAM</text>
  <path d="M13 9 L21 9 L17 22Z" fill="#e9b86c" stroke="${BR}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="17" cy="8" r="5" fill="#ff9db4" stroke="${BR}" stroke-width="1.8"/>
  <path d="M169 9 L177 9 L173 22Z" fill="#e9b86c" stroke="${BR}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="173" cy="8" r="5" fill="#fff8ea" stroke="${BR}" stroke-width="1.8"/>
  </svg>`,
  { size: 768 },
);

const INTERIOR_TEX = svg(
  `<svg viewBox="0 0 130 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="130" height="64" fill="#ffdcae"/><rect width="130" height="9" fill="#f2b27c"/>
  <path d="M65 0 V13" stroke="${BR}" stroke-width="2"/>
  <ellipse cx="65" cy="16" rx="11" ry="7" fill="#fff6b0" stroke="${BR}" stroke-width="2.5"/>
  <rect x="6" y="13" width="30" height="21" rx="3" fill="#fffaf0" stroke="${BR}" stroke-width="2.5"/>
  <path d="M11 20 H31 M11 25 H27 M11 30 H30" stroke="#ff9db4" stroke-width="2.4" stroke-linecap="round"/>
  <rect x="84" y="33" width="40" height="4" fill="#8a5a3b"/>
  <g stroke="${BR}" stroke-width="2" stroke-linejoin="round">
  <path d="M89 33 L95 33 L92 21Z" fill="#e9b86c"/><circle cx="92" cy="19" r="4.5" fill="#ff9db4"/>
  <path d="M100 33 L106 33 L103 21Z" fill="#e9b86c"/><circle cx="103" cy="19" r="4.5" fill="#8fdcc0"/>
  <path d="M111 33 L117 33 L114 21Z" fill="#e9b86c"/><circle cx="114" cy="19" r="4.5" fill="#ffd86b"/></g>
  <rect x="0" y="43" width="130" height="21" fill="#bfe9f5" stroke="${BR}" stroke-width="2.5"/>
  <g stroke="${BR}" stroke-width="2.2"><rect x="8" y="37" width="22" height="9" rx="3" fill="#ff9db4"/><rect x="36" y="37" width="22" height="9" rx="3" fill="#8fdcc0"/><rect x="64" y="37" width="22" height="9" rx="3" fill="#ffd86b"/><rect x="92" y="38" width="22" height="8" rx="3" fill="#a9785a"/></g>
  <path d="M0 54 H130" stroke="#8fc6dc" stroke-width="2"/>
  </svg>`,
  { size: 512 },
);

const OPEN_TEX = svg(
  `<svg viewBox="0 0 60 34" xmlns="http://www.w3.org/2000/svg">
  <path d="M17 1 L21 10 M43 1 L39 10" stroke="${BR}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <rect x="3" y="9" width="54" height="22" rx="7" fill="#ff9db4" stroke="${BR}" stroke-width="3"/>
  <text x="30" y="26" text-anchor="middle" font-family="'Trebuchet MS', Verdana, sans-serif" font-weight="900" font-size="14" fill="#fff8ea" stroke="${BR}" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">OPEN</text>
  </svg>`,
  { size: 256 },
);

const petals = [0, 60, 120, 180, 240, 300]
  .map((a) => `<ellipse cx="50" cy="27" rx="9" ry="14" transform="rotate(${a} 50 50)"/>`)
  .join("");
const HUB_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#fff8ea" stroke="${BR}" stroke-width="4"/>
  <g fill="#ff9db4" stroke="${BR}" stroke-width="2.5">${petals}</g>
  <circle cx="50" cy="50" r="10" fill="#ffd86b" stroke="${BR}" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const FACE_TEX = svg(
  `<svg viewBox="0 0 150 40" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="m"><path d="M45 8 H105 Q105 34 75 35 Q45 34 45 8Z"/></clipPath></defs>
  <ellipse cx="20" cy="18" rx="15" ry="8" fill="#ff8aa8" opacity="0.88"/><ellipse cx="130" cy="18" rx="15" ry="8" fill="#ff8aa8" opacity="0.88"/>
  <path d="M45 8 H105 Q105 34 75 35 Q45 34 45 8Z" fill="#fff8ea"/>
  <g clip-path="url(#m)"><path d="M55 8V36 M65 8V36 M75 8V36 M85 8V36 M95 8V36" stroke="${BR}" stroke-width="2.5"/></g>
  <path d="M45 8 H105 Q105 34 75 35 Q45 34 45 8Z" fill="none" stroke="${BR}" stroke-width="3.5" stroke-linejoin="round"/>
  </svg>`,
  { size: 384 },
);

const MURAL_TEX = svg(
  `<svg viewBox="0 0 135 115" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="129" height="109" rx="22" fill="#ffd0dc" stroke="${BR}" stroke-width="4"/>
  <path d="M52 56 L83 56 L67.5 103Z" fill="#e9b86c" stroke="${BR}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M57 64 L75 90 M64 60 L77 78 M78 62 L60 88 M70 60 L58 76" stroke="#c98d4a" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="67" cy="47" r="18" fill="#8fdcc0" stroke="${BR}" stroke-width="3.5"/>
  <circle cx="67" cy="30" r="16" fill="#ff9db4" stroke="${BR}" stroke-width="3.5"/>
  <circle cx="61" cy="25" r="4" fill="#ffffff" opacity="0.7"/>
  <circle cx="67" cy="13" r="5.5" fill="#ff5a6e" stroke="${BR}" stroke-width="2.5"/><path d="M67 8 Q70 3 75 3" stroke="${BR}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <g fill="#ffd86b" stroke="${BR}" stroke-width="2" stroke-linejoin="round"><path d="M22 70 L25 78 L33 81 L25 84 L22 92 L19 84 L11 81 L19 78Z"/><path d="M112 62 L114.5 68 L120.5 70.5 L114.5 73 L112 79 L109.5 73 L103.5 70.5 L109.5 68Z"/></g>
  <text x="26" y="40" text-anchor="middle" font-family="'Trebuchet MS', Verdana, sans-serif" font-weight="900" font-size="15" fill="#fff8ea" stroke="${BR}" stroke-width="3" paint-order="stroke" stroke-linejoin="round" transform="rotate(-12 26 40)">Yum!</text>
  <text x="106" y="40" text-anchor="middle" font-family="'Trebuchet MS', Verdana, sans-serif" font-weight="900" font-size="12" fill="#fff8ea" stroke="${BR}" stroke-width="3" paint-order="stroke" stroke-linejoin="round" transform="rotate(10 106 40)">Cool!</text>
  </svg>`,
  { size: 512 },
);

const PLATE_TEX = svg(
  `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="56" height="26" rx="7" fill="#ffd86b" stroke="${BR}" stroke-width="3"/>
  <text x="30" y="20" text-anchor="middle" font-family="'Trebuchet MS', Verdana, sans-serif" font-weight="900" font-size="13" fill="${BR}" letter-spacing="1">SCOOP</text>
  <circle cx="9" cy="8" r="1.6" fill="${BR}"/><circle cx="51" cy="8" r="1.6" fill="${BR}"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "ice_cream_truck" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0] });

  const rbox = (at: number[], size: [number, number, number], r: number, color: any, o: O = {}) => {
    const [w, h, d] = size;
    return b.extrude(rrect(w, h, r), {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: d,
      bevel: Math.min(d * 0.3, r * 0.7, 0.04),
      bone: chassis,
      color,
      ...o,
    });
  };
  const P = (geo: THREE.BufferGeometry, color: any, o: O = {}) => b.part(geo, color, { bone: chassis, flat: true, ...o });
  const plane = (tex: THREE.Texture, w: number, h: number, at: any, dir: any, o: O = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o });
  const sph = (r: number, color: any, at: any, o: O = {}) => P(new THREE.SphereGeometry(r, 8, 6), color, { at, ...o });

  // ---- Main shell ------------------------------------------------------------------------------------------
  const bodyPts: Pt[] = [
    [2.3, 0.32, 0.12],
    [2.3, 1.28, 0.22],
    [1.55, 1.62, 0.15],
    [1.0, 2.6, 0.25],
    [-2.3, 2.6, 0.4],
    [-2.3, 0.32, 0.12],
    ...archPts(-1.35, 0.6),
    ...archPts(1.6, 0.6),
  ];
  b.extrude(roundPoly(bodyPts, 5), {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 1.9,
    bevel: 0.07,
    color: BODY,
    bone: chassis,
  });

  // underbody and wheel wells
  rbox([0, 0.3, 0], [1.5, 0.16, 4.3], 0.05, C.dark);
  for (const zc of [1.6, -1.35]) rbox([0, 0.735, zc], [1.56, 0.83, 1.24], 0.05, C.dark);

  // arch trims
  for (const zc of [1.6, -1.35]) {
    const outer = archPts(zc, 0.68);
    const inner = archPts(zc, 0.6).reverse();
    for (const s of [1, -1])
      b.extrude([...outer, ...inner], {
        at: [s * 0.962, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.05,
        bevel: 0.012,
        color: C.pink,
        bone: chassis,
      });
  }

  // ---- Wheels ----------------------------------------------------------------------------------------------
  const tireProfile: [number, number][] = [
    [0, -0.16],
    [0.4, -0.16],
    [0.48, -0.1],
    [0.5, 0],
    [0.48, 0.1],
    [0.4, 0.16],
    [0, 0.16],
  ];
  const hubProfile: [number, number][] = [
    [0, 0],
    [0.3, 0],
    [0.3, 0.03],
    [0.26, 0.05],
    [0, 0.05],
  ];
  for (const [sn, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    for (const [fn, z] of [
      ["F", 1.6],
      ["R", -1.35],
    ] as const) {
      const wj = b.joint(`wheel${fn}${sn}`, { parent: chassis, at: [s * 0.93, 0.5, z], dir: [s, 0, 0] });
      b.lathe(tireProfile, { at: [s * 0.93, 0.5, z], axis: [s, 0, 0], bone: wj, color: TIRE, segments: 14 });
      b.lathe(hubProfile, {
        at: [s * 1.08, 0.5, z],
        axis: [s, 0, 0],
        bone: wj,
        color: C.cream,
        segments: 12,
      });
      b.part(new THREE.CircleGeometry(0.27, 12), "#ffffff", {
        bone: wj,
        at: [s * 1.14, 0.5, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: HUB_TEX,
      });
    }
  }

  // ---- Bumpers & lights ------------------------------------------------------------------------------------
  rbox([0, 0.46, 2.34], [2.0, 0.2, 0.22], 0.09, C.cream);
  rbox([0, 0.46, -2.34], [2.0, 0.2, 0.22], 0.09, C.pink);
  plane(PLATE_TEX, 0.36, 0.18, [0, 0.46, 2.456], [0, 0, 1]);
  plane(PLATE_TEX, 0.42, 0.21, [0, 0.7, -2.308], [0, 0, -1]);

  // smiling grille and blush
  plane(FACE_TEX, 1.5, 0.4, [0, 0.76, 2.308], [0, 0, 1]);

  const lensProfile: [number, number][] = [
    [0, 0],
    [0.2, 0],
    [0.21, 0.04],
    [0.14, 0.1],
    [0, 0.12],
  ];
  for (const s of [1, -1]) {
    const rim = b.lathe(
      [
        [0, 0],
        [0.27, 0],
        [0.29, 0.04],
        [0.26, 0.09],
        [0, 0.09],
      ],
      { at: [s * 0.62, 1.0, 2.29], axis: [0, 0, 1], bone: chassis, color: C.cream, segments: 12 },
    );
    glow(
      b.lathe(lensProfile, {
        at: [s * 0.62, 1.0, 2.36],
        axis: [0, 0, 1],
        bone: chassis,
        color: C.lens,
        segments: 10,
      }),
      1.2,
    );
    sph(0.035, "#ffffff", [s * 0.55, 1.07, 2.455], { scale: [1, 1, 0.5] });
    b.ring(
      rim,
      { count: 3, radius: 0.3, fromDeg: s > 0 ? -82 : 28, toDeg: s > 0 ? -28 : 82 },
      (lash) => b.spike(lash, lash, 0.11, 0.018, { color: C.brown }),
    );

    // tail lights
    b.lathe(
      [
        [0, 0],
        [0.15, 0],
        [0.15, 0.03],
        [0, 0.03],
      ],
      { at: [s * 0.75, 0.92, -2.3], axis: [0, 0, -1], bone: chassis, color: C.cream, segments: 10 },
    );
    glow(
      b.lathe(
        [
          [0, 0],
          [0.1, 0],
          [0.11, 0.03],
          [0.08, 0.07],
          [0, 0.08],
        ],
        { at: [s * 0.75, 0.92, -2.33], axis: [0, 0, -1], bone: chassis, color: C.red, segments: 10 },
      ),
      0.8,
    );
  }

  // hood ornament: tiny cone
  b.rod([0, 1.4, 2.0], [0, 1.52, 2.0], 0.015, C.brown, { bone: chassis });
  P(new THREE.ConeGeometry(0.06, 0.15, 6), C.tan, { at: [0, 1.6, 2.0], dir: [0, -1, 0] });
  sph(0.075, C.pink, [0, 1.7, 2.0]);
  sph(0.025, C.red, [0, 1.78, 2.0]);

  // ---- Windshield ------------------------------------------------------------------------------------------
  const wsTop = new THREE.Vector3(0, 2.6, 1.0);
  const wsBot = new THREE.Vector3(0, 1.62, 1.55);
  const wsDown = wsBot.clone().sub(wsTop).normalize();
  const wsUp = wsDown.clone().negate();
  const wsN = new THREE.Vector3(0, -wsUp.z, wsUp.y);
  const wsC = wsTop.clone().addScaledVector(wsDown, 0.6);
  b.extrude(rrect(1.74, 0.72, 0.14), {
    at: wsC,
    x: [1, 0, 0],
    y: wsUp,
    thickness: 0.07,
    bevel: 0.02,
    color: C.pink,
    bone: chassis,
  });
  b.part(new THREE.PlaneGeometry(1.58, 0.56), "#ffffff", {
    bone: chassis,
    at: wsC.clone().addScaledVector(wsN, 0.04),
    dir: wsN,
    up: wsUp,
    axis: "z",
    texture: WS_TEX,
  });

  // ---- Side details ----------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const faceX = s * 0.958;
    // door
    plane(s > 0 ? DOOR_A : DOOR_B, 1.05, 1.8, [faceX, 1.45, 0.325], [s, 0, 0]);
    // sign band
    plane(SIGN_TEX, 1.8, 0.246, [faceX, 2.4, -1.1], [s, 0, 0]);

    // mirror
    b.rod([s * 0.9, 1.78, 1.02], [s * 1.18, 1.86, 1.08], 0.018, C.dark, { bone: chassis });
    rbox([s * 1.25, 1.88, 1.08], [0.22, 0.3, 0.06], 0.08, C.cream);
    plane(new THREE.Texture() as THREE.Texture, 0.01, 0.01, [0, -5, 0], [0, 0, 1]).mesh.visible = false;
    b.part(new THREE.PlaneGeometry(0.17, 0.25), C.glass, {
      bone: chassis,
      at: [s * 1.25, 1.88, 1.043],
      dir: [0, 0, -1],
      axis: "z",
    });

    // service window
    const zc = -1.25;
    const W = 1.26;
    const H = 0.62;
    const yc = 1.67;
    glow(plane(INTERIOR_TEX, W, H, [faceX, yc, zc], [s, 0, 0]), 0.55);
    const fx = s * 0.98;
    rbox([fx, yc + H / 2 + 0.035, zc], [0.06, 0.07, W + 0.14], 0.025, C.pink);
    rbox([fx, yc - H / 2 - 0.035, zc], [0.06, 0.07, W + 0.14], 0.025, C.pink);
    for (const e of [1, -1]) rbox([fx, yc, zc + e * (W / 2 + 0.035)], [0.06, H, 0.07], 0.025, C.pink);
    plane(OPEN_TEX, 0.3, 0.17, [s * 1.018, 1.87, -0.78], [s, 0, 0]);

    // counter
    rbox([s * 1.175, 1.31, zc], [0.45, 0.06, 1.5], 0.025, WOOD);
    rbox([s * 1.375, 1.36, zc], [0.05, 0.1, 1.5], 0.02, C.pink);
    for (const e of [1, -1]) {
      P(new THREE.BoxGeometry(0.04, 0.2, 0.04), C.pinkD, {
        at: [s * 1.1, 1.18, zc + e * 0.6],
        rotation: [0, 0, s * 45],
      });
    }
    // sundae cups on the counter
    [-1.65, -0.85].forEach((cz, i) => {
      const x = s * 1.16;
      P(new THREE.CylinderGeometry(0.075, 0.055, 0.1, 8), C.cream, { at: [x, 1.39, cz] });
      P(new THREE.CylinderGeometry(0.077, 0.077, 0.02, 8), C.pink, { at: [x, 1.42, cz] });
      sph(0.07, i % 2 ? C.mint : C.pink, [x, 1.48, cz]);
      sph(0.025, C.red, [x, 1.56, cz]);
    });

    // awning
    b.extrude(
      [
        [0.93, 2.27],
        [1.42, 2.12],
        [1.42, 2.05],
        [0.93, 2.2],
      ],
      {
        at: [0, 0, zc],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 1.6,
        bevel: 0.008,
        color: AWNING,
        bone: chassis,
      },
    );
    for (let i = 0; i < 8; i++) {
      const sc: [number, number][] = [
        [-0.1, 0.05],
        [0.1, 0.05],
      ];
      for (let k = 1; k <= 7; k++) {
        const a = (-Math.PI * k) / 8;
        sc.push([0.1 * Math.cos(a), 0.05 + 0.1 * Math.sin(a)]);
      }
      b.extrude(sc, {
        at: [s * 1.4, 2.04, -2.05 + 0.1 + 0.2 * i],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.04,
        bevel: 0.008,
        color: i % 2 ? C.pink : C.cream,
        bone: chassis,
      });
    }
    for (const pz of [-2.04, -0.46]) b.rod([s * 1.38, 2.06, pz], [s * 1.38, 1.38, pz], 0.02, C.pinkD, { bone: chassis });
  }

  // ---- Rear ------------------------------------------------------------------------------------------------
  plane(MURAL_TEX, 1.35, 1.15, [0, 1.62, -2.308], [0, 0, -1]);

  // ---- Roof: giant cone sign -------------------------------------------------------------------------------
  const K = 0.72;
  const SZ = -1.25;
  const tipY = 2.7;
  P(new THREE.CylinderGeometry(0.3, 0.36, 0.1, 10), C.pink, { at: [0, 2.655, SZ] });
  const coneProfile: [number, number][] = [
    [0, 0],
    [0.4 * K, 0.8 * K],
    [0.46 * K, 0.86 * K],
    [0.46 * K, 0.98 * K],
    [0, 0.98 * K],
  ];
  b.lathe(coneProfile, { at: [0, tipY, SZ], axis: [0, 1, 0], bone: chassis, segments: 10, color: WAFFLE });
  // cradle
  b.lathe(
    [
      [0.13, 0],
      [0.19, 0],
      [0.19, 0.05],
      [0.13, 0.05],
    ],
    { at: [0, tipY + 0.24, SZ], axis: [0, 1, 0], bone: chassis, segments: 10, color: C.pinkD },
  );
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    b.rod([0.28 * Math.cos(a), 2.705, SZ + 0.28 * Math.sin(a)], [0.17 * Math.cos(a), tipY + 0.27, SZ + 0.17 * Math.sin(a)], 0.02, C.pinkD, {
      bone: chassis,
    });
  }
  const rimY = tipY + 0.98 * K;
  b.lathe(
    [
      [0, 0],
      [0.5 * K, 0],
      [0.56 * K, 0.06 * K],
      [0.52 * K, 0.15 * K],
      [0, 0.15 * K],
    ],
    { at: [0, rimY, SZ], axis: [0, 1, 0], bone: chassis, segments: 10, color: C.pink },
  );
  const sc1y = rimY + 0.2;
  const sc2y = sc1y + 0.28;
  const scoop1 = P(new THREE.SphereGeometry(0.36, 10, 8), PINK_SCOOP, { at: [0, sc1y, SZ] });
  P(new THREE.SphereGeometry(0.27, 9, 7), MINT_SCOOP, { at: [0, sc2y, SZ] });
  // drips
  const rg = rng(21);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const len = 0.08 + rg() * 0.13;
    const x = 0.375 * Math.cos(a);
    const z = SZ + 0.375 * Math.sin(a);
    b.capsule([x, rimY + 0.08, z], [x, rimY + 0.06 - len, z], 0.034, C.pink, { bone: chassis });
  }
  // sprinkles
  const sprinkleCols = [C.butter, C.mint, "#ffffff", C.red, "#8ec5ff"];
  const hits = b.surface(scoop1).scatter(26, { rng: rng(5), minDist: 0.08, filter: (h: any) => h.n.y > -0.1 });
  hits.forEach((h, i) => {
    b.stick(new THREE.BoxGeometry(0.045, 0.012, 0.012), sprinkleCols[i % sprinkleCols.length], h, {
      embed: 0.4,
      spin: rg() * 360,
      bone: chassis,
    });
  });
  // flake & cherry
  b.rod([0.04, sc2y + 0.2, SZ], [0.16, sc2y + 0.5, SZ + 0.05], 0.022, C.brown, { bone: chassis });
  sph(0.065, C.red, [-0.03, sc2y + 0.27, SZ]);
  sph(0.02, "#ffffff", [-0.05, sc2y + 0.3, SZ + 0.03]);
  b.rod([-0.03, sc2y + 0.32, SZ], [0.0, sc2y + 0.43, SZ - 0.04], 0.01, C.brown, { bone: chassis });

  // ---- Roof: speakers & flags ------------------------------------------------------------------------------
  const hornProfile: [number, number][] = [
    [0.04, 0],
    [0.08, 0],
    [0.2, 0.28],
    [0.21, 0.3],
    [0.18, 0.3],
    [0.04, 0.06],
  ];
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 8), C.pink, { at: [s * 0.45, 2.65, 0.3] });
    b.lathe(hornProfile, {
      at: [s * 0.45, 2.78, 0.33],
      axis: [0, 0.35, 1],
      bone: chassis,
      color: C.butter,
      segments: 10,
    });
    // flag poles
    const px = s * 0.8;
    b.rod([px, 2.6, -1.85], [px, 3.3, -1.85], 0.016, C.brown, { bone: chassis });
    sph(0.03, C.butter, [px, 3.32, -1.85]);
    const flagCol = s > 0 ? C.pink : C.mint;
    b.extrude(
      [
        [0, 0],
        [0.42, 0],
        [0.32, 0.1],
        [0.42, 0.2],
        [0, 0.2],
      ],
      { at: [px, 3.08, -1.86], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: flagCol, bone: chassis },
    );
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.07, 0.035],
        [0.14, 0, "sharp"],
        [0.07, -0.035],
      ],
      {
        at: [px, 3.18, -1.97],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.02,
        smoothing: 1,
        color: C.cream,
        bone: chassis,
      },
    );
  }

  return b.root;
}
