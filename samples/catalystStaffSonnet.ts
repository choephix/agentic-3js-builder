import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import { catmull, spiral } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { cel, zigzag } from "../kits/toon";

export const meta = {
  name: "Zephyr Halo Catalyst",
  description:
    "An ornate Anemo-style catalyst staff: a cream-and-gold shaft with braided wind engraving, teal tassels, a winged feather crest and a gold sun halo cradling a floating, ring-orbited wind orb, displayed on a compass-star marble plinth.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: flat hexes for paint logic, cel() tones for plain surfaces.
const HEX = {
  gold: "#f8c24d",
  goldDark: "#c98a30",
  cream: "#fff6e2",
  pale: "#c6f7f0",
  teal: "#3fd3c4",
  tealDeep: "#1f8fa6",
  navy: "#35508a",
  marble: "#f6f1e7",
  rose: "#f08fa3",
};
const GOLD = cel(HEX.gold, "#c8782a");
const TEAL = cel(HEX.teal, "#2a8aa6");
const GLOW_TEAL = "#3df0dc";
const GLOW_PALE = "#c8fff6";
const GLOW_GOLD = "#ffe493";

// ---------------------------------------------------------------------------------------------------------------
// Layout (meters)
const FLOOR = 0.1; // plinth top
const HY = 1.25; // top of shaft / collar start
const OY = HY + 0.36; // orb centre
const ORB_R = 0.105;
const HALO_Z = -0.22;
const HALO_R = 0.27;
const SR = 1.25; // shaft girth

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const ORB_TEX = (() => {
  const spiralPts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const a = t * Math.PI * 5.2;
    const r = 6 + 64 * t;
    spiralPts.push(`${(256 + Math.cos(a) * r).toFixed(1)},${(128 + Math.sin(a) * r).toFixed(1)}`);
  }
  const spiral2: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const a = t * Math.PI * 5.2 + Math.PI;
    const r = 6 + 64 * t;
    spiral2.push(`${(256 + Math.cos(a) * r).toFixed(1)},${(128 + Math.sin(a) * r).toFixed(1)}`);
  }
  const waves = [40, 78, 178, 216]
    .map((y, i) => {
      const k = 2 + (i % 2);
      const pts: string[] = [];
      for (let x = 0; x <= 512; x += 8) pts.push(`${x},${(y + Math.sin((x / 512) * Math.PI * 2 * k + i) * 9).toFixed(1)}`);
      return `<polyline points="${pts.join(" ")}" fill="none" stroke="#ffffff" stroke-opacity="0.65" stroke-width="${i % 2 ? 4 : 6}" stroke-linecap="round"/>`;
    })
    .join("");
  const star = (x: number, y: number, s: number) =>
    `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z" fill="#ffffff"/>`;
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 256">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f4fffd"/><stop offset="0.38" stop-color="#9ff5ea"/>
          <stop offset="0.7" stop-color="#4fd9d0"/><stop offset="1" stop-color="#1f9fc4"/>
        </linearGradient>
        <radialGradient id="r" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#ffffff" stop-opacity="1"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="512" height="256" fill="url(#g)"/>
      ${waves}
      <ellipse cx="256" cy="128" rx="96" ry="96" fill="url(#r)"/>
      <polyline points="${spiralPts.join(" ")}" fill="none" stroke="#2bb7c9" stroke-width="9" stroke-linecap="round"/>
      <polyline points="${spiral2.join(" ")}" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <circle cx="256" cy="128" r="9" fill="#ffffff"/>
      ${star(214, 88, 12)}${star(310, 170, 9)}${star(300, 70, 7)}${star(60, 150, 10)}${star(450, 60, 8)}${star(130, 60, 7)}
    </svg>`,
    { size: 512 },
  );
})();

const TASSEL_TEX = (() => {
  // root (gold knot) at the bottom edge: the card hangs upside down from its frame
  const strands: string[] = [];
  const cols = ["#3fd3c4", "#2a9fb8", "#67e6d8", "#3fd3c4", "#2a9fb8", "#67e6d8", "#3fd3c4", "#2a9fb8"];
  for (let i = 0; i < 8; i++) {
    const x = 7 + i * 4.6;
    const sway = (i - 3.5) * 0.9;
    strands.push(
      `<path d="M${x} 120 L${x + sway * 0.5} 60 L${x + sway} 4" fill="none" stroke="${cols[i]}" stroke-width="3.6" stroke-linecap="round"/>`,
      `<path d="M${x + sway * 0.8} 30 L${x + sway} 4" fill="none" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round"/>`,
    );
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 128">
      ${strands.join("")}
      <rect x="4" y="96" width="40" height="5" rx="2" fill="#f8c24d"/>
      <rect x="3" y="116" width="42" height="9" rx="3" fill="#f8c24d"/>
      <rect x="3" y="118" width="42" height="2.5" fill="#c98a30"/>
    </svg>`,
    { size: 192 },
  );
})();

const rune = (glyph: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="3" y="3" width="58" height="58" rx="10" fill="#0d3a4a" stroke="#f8c24d" stroke-width="5"/>
      ${glyph}
    </svg>`,
    { size: 128 },
  );
const RUNES = [
  rune(
    `<path d="M32 17 C47 17 51 34 38 38 C27 42 21 31 30 27" fill="none" stroke="#c8fff6" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="48" r="3.4" fill="#c8fff6"/>`,
  ),
  rune(
    `<path d="M19 47 C22 25 38 17 46 14 C45 31 36 43 19 47 M19 47 L39 24" fill="none" stroke="#c8fff6" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  rune(
    `<path d="M15 25 q8.5 -9 17 0 t17 0 M15 35 q8.5 -9 17 0 t17 0 M15 45 q8.5 -9 17 0 t17 0" fill="none" stroke="#c8fff6" stroke-width="4.4" stroke-linecap="round"/>`,
  ),
];

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers
type V3 = [number, number, number];
function put(geo: THREE.BufferGeometry, pos: V3, rot: V3 = [0, 0, 0], scale: V3 = [1, 1, 1]) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
    new THREE.Vector3(...scale),
  );
  return (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m);
}
function ringPoint(r: number, ang: number, rot: V3, centre: V3): V3 {
  const v = new THREE.Vector3(r * Math.cos(ang), r * Math.sin(ang), 0).applyEuler(
    new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG),
  );
  return [centre[0] + v.x, centre[1] + v.y, centre[2] + v.z];
}
const LEAF_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
    <path d="M16 2 C30 16 30 44 16 62 C2 44 2 16 16 2Z" fill="#79d98f" stroke="#2b8f6c" stroke-width="3"/>
    <path d="M16 8 L16 62 M16 24 L24 16 M16 24 L8 16 M16 38 L25 29 M16 38 L7 29 M16 50 L23 43 M16 50 L9 43" fill="none" stroke="#2b8f6c" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);
const FLOWER_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    ${[0, 72, 144, 216, 288]
      .map((a) => `<ellipse cx="32" cy="17" rx="10.5" ry="15" transform="rotate(${a} 32 32)" fill="#f4fbff" stroke="#8fc3ec" stroke-width="2.6"/>`)
      .join("")}
    <circle cx="32" cy="32" r="8" fill="#ffd45a" stroke="#d68a2a" stroke-width="2.4"/>
    <circle cx="32" cy="32" r="2.6" fill="#d68a2a"/>
  </svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "catalystStaff", paintSize: 2048 });

  // ---- skeleton
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const staff = b.joint("staff", { parent: root, at: [0, FLOOR, 0], dir: [0, 1, 0] });
  const head = b.joint("head", { parent: staff, at: [0, HY, 0], dir: [0, 1, 0] });
  const orb = b.joint("orb", { parent: head, at: [0, OY, 0], dir: [0, 1, 0] });
  const ringAJ = b.joint("ringA", { parent: orb, at: [0, OY, 0], dir: [0, 1, 0], role: "hinge" });
  const ringBJ = b.joint("ringB", { parent: orb, at: [0, OY, 0], dir: [0, 1, 0], role: "hinge" });

  // ---- plinth ----------------------------------------------------------------------------------------------
  const plinthOutline: OutlinePoint[] = [
    [0, 0],
    [0.31, 0],
    [0.313, 0.03],
    [0.3, 0.038],
    [0.275, 0.038],
    [0.275, 0.062],
    [0.268, 0.07],
    [0.245, 0.078],
    [0.236, 0.098],
    [0, 0.1],
  ];
  const starR = (a: number) => 0.058 + 0.082 * zigzag(a / (Math.PI / 4)) + 0.05 * Math.pow(zigzag(a / (Math.PI / 2)), 3);
  const plinthPaint = cel(
    paint((p, n, s) => {
      const y = s[0];
      if (n.y > 0.9 && y > 0.095) {
        const r = Math.hypot(p.x, p.z);
        const a = Math.atan2(p.x, p.z);
        if (r < 0.05) return HEX.goldDark;
        const R = starR(a);
        if (r < R) {
          if (r > R - 0.007) return HEX.gold;
          return Math.cos(4 * a) > 0 ? HEX.pale : HEX.teal;
        }
        if (r > 0.188 && r < 0.197) return HEX.gold;
        if (r > 0.208 && r < 0.214) return HEX.gold;
        if (r > 0.198 && r < 0.207) return zigzag(a / (Math.PI / 12)) > 0.5 ? HEX.teal : HEX.marble;
        if (r > 0.1 && r < 0.17 && Math.cos(8 * a) > 0.93 && r > R + 0.012) return HEX.tealDeep;
        return HEX.marble;
      }
      if (y > 0.03 && y < 0.04) return HEX.gold;
      if (y > 0.063 && y < 0.08) return HEX.gold;
      if (y < 0.03) {
        const d = ((s[1] % 360) + 360) % 360;
        return Math.abs(((d / 22.5) % 1) - 0.5) < 0.16 && y > 0.008 && y < 0.022 ? HEX.teal : HEX.marble;
      }
      if (y > 0.082 && y < 0.094) {
        const d = ((s[1] % 360) + 360) % 360;
        return (d / 45) % 1 > 0.3 && (d / 45) % 1 < 0.7 ? HEX.teal : HEX.marble;
      }
      return HEX.marble;
    }),
  );
  b.lathe(plinthOutline, { at: [0, 0, 0], bone: root, segments: 24, color: plinthPaint, name: "plinth" });

  // gems on the plinth ledge
  {
    const gems: THREE.BufferGeometry[] = [];
    const bezels: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pos: V3 = [Math.sin(a) * 0.288, 0.04, Math.cos(a) * 0.288];
      gems.push(put(new THREE.SphereGeometry(0.01, 6, 4), pos, [0, 0, 0], [1, 0.7, 1]));
      bezels.push(put(new THREE.CylinderGeometry(0.0135, 0.0155, 0.007, 8), [pos[0], 0.0385, pos[2]]));
    }
    glow(b.part(mergeGeometries(gems)!, GLOW_TEAL, { bone: root, at: [0, 0, 0] }), 1);
    b.part(mergeGeometries(bezels)!, GOLD, { bone: root, at: [0, 0, 0] });
  }

  // four lantern posts on the plinth ledge
  {
    const posts: THREE.BufferGeometry[] = [];
    const caps: THREE.BufferGeometry[] = [];
    const lamps: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const x = Math.sin(a) * 0.287;
      const z = Math.cos(a) * 0.287;
      posts.push(put(new THREE.CylinderGeometry(0.0065, 0.009, 0.1, 6), [x, 0.09, z]));
      posts.push(put(new THREE.CylinderGeometry(0.016, 0.02, 0.014, 8), [x, 0.045, z]));
      lamps.push(put(new THREE.SphereGeometry(0.021, 8, 6), [x, 0.158, z]));
      caps.push(put(new THREE.ConeGeometry(0.014, 0.034, 8), [x, 0.193, z]));
      caps.push(put(new THREE.TorusGeometry(0.0225, 0.0035, 4, 10), [x, 0.158, z], [90, 0, 0]));
      caps.push(put(new THREE.SphereGeometry(0.0065, 5, 4), [x, 0.213, z]));
    }
    b.part(mergeGeometries(posts)!, GOLD, { bone: root, at: [0, 0, 0] });
    b.part(mergeGeometries(caps)!, GOLD, { bone: root, at: [0, 0, 0] });
    glow(b.part(mergeGeometries(lamps)!, GLOW_PALE, { bone: root, at: [0, 0, 0] }), 1.1);
  }

  // fallen leaves and wind-flowers on the dais
  {
    const rr = rng(5);
    const leafFrames = [];
    const leafFlows: THREE.Vector3[] = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rr() * 0.6;
      const rad = 0.1 + rr() * 0.12;
      leafFrames.push(frame([Math.sin(a) * rad, 0.1005, Math.cos(a) * rad], [0, 1, 0]));
      const f = rr() * Math.PI * 2;
      leafFlows.push(new THREE.Vector3(Math.cos(f), 0, Math.sin(f)));
    }
    b.cards(leafFrames, LEAF_TEX, {
      size: [0.04, 0.085],
      lean: 90,
      flow: (_f, i) => leafFlows[i].toArray() as V3,
      mirror: true,
      sink: 0,
      bone: root,
    });
    const flowerFrames = [
      frame([0.06, 0.1005, 0.075], [0, 1, 0]),
      frame([0.085, 0.1005, 0.045], [0, 1, 0]),
      frame([-0.075, 0.1005, 0.06], [0, 1, 0]),
    ];
    b.cards(flowerFrames, FLOWER_TEX, { size: 0.05, lean: 90, flow: [0, 0, 1], mirror: true, sink: 0, spin: 180, rng: rng(9), bone: root });
  }

  // lotus petals hugging the staff foot
  const petalOutline = (L: number, w: number): OutlinePoint[] => [
    [0, 0, "sharp"],
    [0.25 * L, 0.5 * w],
    [0.7 * L, 0.42 * w],
    [L, 0, "sharp"],
    [0.7 * L, -0.42 * w],
    [0.25 * L, -0.5 * w],
  ];
  const petalPaint = (L: number, thick: THREE.Vector3, tone: string, rim: string) =>
    cel(
      paint((_p, n, s) => {
        if (Math.abs(n.dot(thick)) < 0.6) return rim;
        if (Math.abs(s[1]) < 0.0022 && s[0] > 0.1 * L && s[0] < 0.86 * L) return rim;
        return s[0] > 0.62 * L ? tone : HEX.cream;
      }),
    );
  const petal = (base: V3, along: THREE.Vector3, side: THREE.Vector3, L: number, w: number, tone: string) => {
    const thick = new THREE.Vector3().crossVectors(along, side).normalize();
    return b.extrude(petalOutline(L, w), {
      at: base,
      x: along.toArray() as V3,
      y: side.toArray() as V3,
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      color: petalPaint(L, thick, tone, HEX.gold),
      bone: staff,
    });
  };
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const out = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const tilt = 24 * DEG;
    const along = out.clone().multiplyScalar(Math.sin(tilt)).add(new THREE.Vector3(0, Math.cos(tilt), 0));
    const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    petal([out.x * 0.034, FLOOR - 0.004, out.z * 0.034], along, side, 0.115, 0.055, HEX.teal);
  }

  // ---- shaft -----------------------------------------------------------------------------------------------
  const shaftOutline: OutlinePoint[] = [
    [0, FLOOR - 0.002],
    [0.0235 * SR, FLOOR - 0.002],
    [0.0235 * SR, 0.14],
    [0.0165 * SR, 0.18],
    [0.0165 * SR, 0.54],
    [0.0185 * SR, 0.57],
    [0.0185 * SR, 0.9],
    [0.0165 * SR, 0.93],
    [0.0165 * SR, 0.99],
    [0.0148 * SR, HY + 0.02],
    [0, HY + 0.02],
  ];
  const wrap = (v: number) => v - Math.floor(v);
  const shaftPaint = cel(
    paint((_p, _n, s) => {
      const y = s[0];
      const u = wrap(s[1] / 360);
      if (y < 0.18) return u > 0.4 && u < 0.6 && y > 0.12 && y < 0.16 ? HEX.teal : HEX.goldDark;
      if (y < 0.54) {
        // broad teal spiral, gold edged, with a pale thread between
        const ph = wrap(u - y / 0.2);
        if (ph < 0.3) return HEX.teal;
        if (ph < 0.345 || ph > 0.955) return HEX.gold;
        if (ph > 0.62 && ph < 0.66) return HEX.pale;
        return HEX.cream;
      }
      if (y < 0.58) return HEX.gold;
      if (y < 0.9) {
        if (wrap(u - y / 0.05) < 0.17) return HEX.gold;
        if (wrap(u + y / 0.05) < 0.1) return HEX.teal;
        return HEX.navy;
      }
      if (y < 0.94) return HEX.gold;
      // upper shaft: teal diamonds with gold hearts
      const dy = Math.abs(wrap(y / 0.1) - 0.5) * 0.1;
      const dx = Math.abs(wrap(u * 4) - 0.5) * 0.0323;
      if (dx / 0.011 + dy / 0.034 < 1) return dx / 0.0045 + dy / 0.0135 < 1 ? HEX.gold : HEX.teal;
      if (Math.abs(wrap(y / 0.1)) < 0.03 || Math.abs(wrap(y / 0.1) - 1) < 0.03) return HEX.gold;
      return HEX.cream;
    }),
  );
  b.lathe(shaftOutline, { at: [0, 0, 0], bone: staff, segments: 14, color: shaftPaint, name: "shaft" });

  // knots and flanges along the shaft
  b.lathe(
    [
      [0, -0.028],
      [0.018, -0.025],
      [0.036, -0.008],
      [0.036, 0.008],
      [0.018, 0.025],
      [0, 0.028],
    ],
    { at: [0, 0.56, 0], bone: staff, segments: 12, color: GOLD, name: "knot" },
  );
  // four swept-back leaf guards under the grip knot
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const out = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const tilt = 125 * DEG;
    const along = out.clone().multiplyScalar(Math.sin(tilt)).add(new THREE.Vector3(0, Math.cos(tilt), 0));
    const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    petal([out.x * 0.024, 0.552, out.z * 0.024], along, side, 0.085, 0.038, HEX.teal);
  }
  // tassel flange
  b.lathe(
    [
      [0, 0.91],
      [0.032, 0.91],
      [0.044, 0.922],
      [0.044, 0.934],
      [0.032, 0.948],
      [0, 0.948],
    ],
    { at: [0, 0, 0], bone: staff, segments: 14, color: GOLD, name: "flange" },
  );
  for (const y of [0.18, 0.545, 0.575, 0.895, 0.953, 1.06, 1.15]) {
    b.part(new THREE.TorusGeometry(y < 0.2 ? 0.03 : 0.0265, 0.0048, 5, 14), GOLD, {
      bone: staff,
      at: [0, y, 0],
      rotation: [90, 0, 0],
    });
  }

  // wind ribbons spiralling up the upper shaft
  for (let k = 0; k < 2; k++) {
    const path = spiral([0, 0.99, 0], [0.036 * (k ? -1 : 1), 0.99, 0], [0, 1, 0], { turns: 1.3, r1: 0.08, pitch: 0.16 });
    glow(
      b.sweep(path, (t) => [0.004 + 0.0105 * Math.pow(Math.sin(Math.PI * t), 0.6), 0.0016], {
        bone: staff,
        section: "box",
        color: GLOW_PALE,
        caps: "flat",
      }),
      0.6,
    );
  }

  // ---- tassels ---------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.047, 0.928, 0],
      [s * 0.056, 0.87, 0.01],
      [s * 0.06, 0.8, 0.018],
    ]);
    const chain = b.chain(`tassel${tag}`, path, {
      parent: staff,
      names: [`tassel${tag}1`, `tassel${tag}2`, `tassel${tag}Tip`],
      role: "tentacle",
    });
    b.sweep(chain, 0.0055, { color: TEAL, sides: 5 });
    const tip = chain.tip!;
    const T: V3 = [s * 0.06, 0.8, 0.018];
    b.part(new THREE.TorusGeometry(0.012, 0.0035, 5, 10), GOLD, { bone: tip, at: [s * 0.047, 0.928, 0], rotation: [0, 90, 0] });
    b.part(new THREE.SphereGeometry(0.02, 10, 8), cel("#2fc4b6", "#1f8aa0"), { bone: tip, at: T });
    b.part(new THREE.TorusGeometry(0.0215, 0.0035, 5, 14), GOLD, { bone: tip, at: T, rotation: [90, 0, 0] });
    b.lathe(
      [
        [0, -0.034],
        [0.013, -0.034],
        [0.02, -0.052],
        [0.016, -0.058],
        [0.0, -0.058],
      ],
      { at: T, bone: tip, segments: 10, color: GOLD, name: "tasselCap" },
    );
    b.cards(
      [0, 1, 2].map((i) => frame([T[0] + (i - 1) * 0.006, T[1] - 0.056, T[2]], [0, 1, 0])),
      TASSEL_TEX,
      { size: [0.085, 0.24], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.12, spin: 40, rng: rng(11 + (s > 0 ? 0 : 5)), bone: tip },
    );
  }

  // wind bells on the flange, front and back
  for (const s of [1, -1]) {
    const bz = s * 0.05;
    b.sweep(
      [
        [0, 0.924, s * 0.043],
        [0, 0.9, bz],
        [0, 0.884, bz],
      ],
      0.0035,
      { bone: staff, color: TEAL, sides: 5, caps: "round" },
    );
    b.part(new THREE.TorusGeometry(0.0085, 0.0028, 4, 8), GOLD, { bone: staff, at: [0, 0.884, bz], rotation: [0, 90, 0] });
    b.lathe(
      [
        [0, 0.012],
        [0.0075, 0.011],
        [0.0125, 0.002],
        [0.0165, -0.012],
        [0.0195, -0.017],
        [0.009, -0.0145],
        [0, -0.0145],
      ],
      { at: [0, 0.862, bz], bone: staff, segments: 10, color: GOLD, name: "bell" },
    );
    glow(b.part(new THREE.SphereGeometry(0.0065, 6, 4), GLOW_TEAL, { bone: staff, at: [0, 0.844, bz] }), 1);
  }

  // ---- head: collar and cup ---------------------------------------------------------------------------------
  const collarOutline: OutlinePoint[] = [
    [0, HY - 0.04],
    [0.026, HY - 0.04],
    [0.04, HY - 0.025],
    [0.048, HY - 0.005],
    [0.033, HY + 0.015],
    [0.028, HY + 0.03],
    [0.042, HY + 0.05],
    [0.064, HY + 0.09],
    [0.069, HY + 0.105],
    [0.061, HY + 0.108],
    [0.054, HY + 0.094],
    [0, HY + 0.078],
  ];
  const collarPaint = cel(
    paint((_p, n, s) => {
      const y = s[0] - HY;
      if (y > 0.0 && y < 0.012 && n.y < 0.6) return HEX.tealDeep;
      if (y > 0.06 && n.y > 0.35 && s[0] > HY + 0.07) return HEX.teal;
      if (y > 0.085 && y < 0.095 && n.y < 0.5) return HEX.tealDeep;
      return HEX.gold;
    }),
  );
  b.lathe(collarOutline, { at: [0, 0, 0], bone: head, segments: 14, color: collarPaint, name: "collar" });
  // light well in the cup and the beam up to the orb
  glow(b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.004, 14), GLOW_TEAL, { bone: head, at: [0, HY + 0.083, 0] }), 1.2);
  glow(
    b.sweep(
      [
        [0, HY + 0.085, 0],
        [0, OY - ORB_R - 0.01, 0],
      ],
      [0.013, 0.005],
      { bone: head, color: GLOW_PALE, sides: 6, caps: "flat" },
    ),
    1.1,
  );
  // front jewel
  b.part(new THREE.TorusGeometry(0.02, 0.0045, 5, 12), GOLD, { bone: head, at: [0, HY, 0.0425], scale: [0.85, 1.3, 1] });
  glow(b.part(new THREE.SphereGeometry(0.0165, 8, 6), GLOW_TEAL, { bone: head, at: [0, HY, 0.043], scale: [0.8, 1.25, 0.7] }), 1.1);

  // lyre prongs lifting the cup lip toward the orb
  {
    const pearls: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 4; i++) {
      const a = ((i * 90 + 45) * Math.PI) / 180;
      const prof: [number, number][] = [
        [0.064, 0.1],
        [0.097, 0.135],
        [0.105, 0.172],
        [0.08, 0.205],
      ];
      const pts = prof.map(([r, y]) => [Math.sin(a) * r, HY + y, Math.cos(a) * r]);
      b.sweep(catmull(pts), [0.012, 0.006], { bone: head, color: GOLD, sides: 6, caps: "round" });
      const last = pts[3];
      pearls.push(put(new THREE.SphereGeometry(0.0105, 6, 5), [last[0] * 0.98, last[1] + 0.01, last[2] * 0.98]));
    }
    glow(b.part(mergeGeometries(pearls)!, GLOW_GOLD, { bone: head, at: [0, 0, 0] }), 1);
  }

  // ---- wings ----------------------------------------------------------------------------------------------
  const featherOutline = (L: number, w: number, bend: number): OutlinePoint[] => {
    const c = (x: number) => bend * L * (x / L) * (x / L);
    return [
      [0, c(0) - 0.25 * w],
      [0.12 * L, c(0.12 * L) - 0.5 * w],
      [0.55 * L, c(0.55 * L) - 0.55 * w],
      [L, c(L), "sharp"],
      [0.55 * L, c(0.55 * L) + 0.55 * w],
      [0.12 * L, c(0.12 * L) + 0.5 * w],
      [0, c(0) + 0.25 * w],
    ];
  };
  const SCHEMES = [
    { base: HEX.cream, tip: HEX.teal },
    { base: HEX.pale, tip: HEX.tealDeep },
    { base: HEX.cream, tip: HEX.gold },
  ];
  const featherPaint = (L: number, bend: number, thick: THREE.Vector3, scheme: number) => {
    const { base, tip } = SCHEMES[scheme];
    const rachis = scheme === 2 ? HEX.teal : HEX.gold;
    const edge = scheme === 2 ? HEX.goldDark : HEX.gold;
    return cel(
      paint((_p, n, s) => {
        if (Math.abs(n.dot(thick)) < 0.6) return HEX.gold;
        const t = s[0] / L;
        const dy = s[1] - bend * L * t * t;
        if (Math.abs(dy) < 0.0032 && t > 0.06 && t < 0.9) return rachis;
        const b1 = 0.5 + 0.09 * zigzag(dy / 0.04);
        if (Math.abs(t - b1) < 0.02) return edge;
        return t < b1 ? base : tip;
      }),
    );
  };
  const phi = 32 * DEG;
  const feather = (s: number, a: number, L: number, w: number, bend: number, base: V3, scheme: number) => {
    const ex = new THREE.Vector3(s * Math.cos(phi), 0, -Math.sin(phi));
    const ey = new THREE.Vector3(0, 1, 0);
    const ca = Math.cos(a * DEG);
    const sa = Math.sin(a * DEG);
    const d = ex.clone().multiplyScalar(ca).add(ey.clone().multiplyScalar(sa));
    const q = ex.clone().multiplyScalar(-sa).add(ey.clone().multiplyScalar(ca));
    const thick = new THREE.Vector3().crossVectors(d, q).normalize();
    return b.extrude(featherOutline(L, w, bend), {
      at: base,
      x: d.toArray() as V3,
      y: q.toArray() as V3,
      thickness: [0.011, 0.005],
      bevel: 0.0035,
      smoothing: 1,
      color: featherPaint(L, bend, thick, scheme),
      bone: head,
    });
  };
  const FS = 1.15;
  const WF = 1.3; // feather fullness
  for (const s of [1, -1]) {
    const back: V3 = [s * 0.085, HY + 0.1, -0.035];
    const mid: V3 = [s * 0.08, HY + 0.095, -0.012];
    const fore: V3 = [s * 0.075, HY + 0.09, 0.006];
    [
      [4, 0.25, 0.05],
      [20, 0.3, 0.054],
      [36, 0.34, 0.056],
      [51, 0.37, 0.056],
      [65, 0.36, 0.052],
    ].forEach(([a, L, w]) => feather(s, a, L * FS, w * FS * WF, 0.05, back, 0));
    [
      [12, 0.19, 0.046],
      [28, 0.22, 0.048],
      [44, 0.245, 0.048],
      [58, 0.24, 0.044],
    ].forEach(([a, L, w]) => feather(s, a, L * FS, w * FS * WF, 0.06, mid, 1));
    [
      [20, 0.12, 0.038],
      [38, 0.14, 0.04],
      [55, 0.14, 0.036],
    ].forEach(([a, L, w]) => feather(s, a, L * FS, w * FS * WF, 0.07, fore, 2));
    // wing root boss and gem
    b.part(new THREE.SphereGeometry(1, 10, 8), GOLD, { bone: head, at: [s * 0.064, HY + 0.1, 0.0], scale: [0.052, 0.036, 0.036], name: "wingBoss" });
    glow(b.part(new THREE.SphereGeometry(0.0125, 8, 6), GLOW_TEAL, { bone: head, at: [s * 0.07, HY + 0.1, 0.032], scale: [1, 1.3, 0.7] }), 1);
    b.part(new THREE.TorusGeometry(0.017, 0.0035, 5, 10), GOLD, { bone: head, at: [s * 0.07, HY + 0.1, 0.032], scale: [1, 1.3, 1] });
  }

  // ---- halo ------------------------------------------------------------------------------------------------
  const haloC: V3 = [0, OY, HALO_Z];
  const haloPaint = cel(paint((_p, _n, s) => (wrap(s[0] * 48) < 0.62 ? HEX.gold : HEX.goldDark)));
  b.part(new THREE.TorusGeometry(HALO_R, 0.0125, 5, 52), haloPaint, { bone: head, at: haloC, name: "haloRing" });
  b.part(new THREE.TorusGeometry(HALO_R - 0.04, 0.005, 5, 44), TEAL, { bone: head, at: haloC, name: "haloInner" });
  {
    const spikes: THREE.BufferGeometry[] = [];
    const beads: THREE.BufferGeometry[] = [];
    const plates: THREE.BufferGeometry[][] = [[], [], []];
    const N = 24;
    for (let i = 0; i < N; i++) {
      const ph = (i / N) * Math.PI * 2;
      const long = i % 2 === 0;
      const len = long ? 0.06 : 0.034;
      const rr = HALO_R + 0.01 + len / 2;
      spikes.push(
        put(
          new THREE.ConeGeometry(long ? 0.011 : 0.0085, len, 4),
          [haloC[0] + Math.cos(ph) * rr, haloC[1] + Math.sin(ph) * rr, haloC[2]],
          [0, 0, ph / DEG - 90],
        ),
      );
      if (long) {
        const rb = HALO_R + 0.01 + len + 0.006;
        beads.push(put(new THREE.SphereGeometry(0.009, 6, 4), [haloC[0] + Math.cos(ph) * rb, haloC[1] + Math.sin(ph) * rb, haloC[2]]));
      }
      const rp = HALO_R - 0.02;
      plates[i % 3].push(
        put(
          new THREE.BoxGeometry(0.03, 0.036, 0.008),
          [haloC[0] + Math.cos(ph) * rp, haloC[1] + Math.sin(ph) * rp, haloC[2]],
          [0, 0, ph / DEG - 90],
        ),
      );
    }
    b.part(mergeGeometries(spikes)!, GOLD, { bone: head, at: [0, 0, 0], name: "haloSpikes" });
    glow(b.part(mergeGeometries(beads)!, GLOW_TEAL, { bone: head, at: [0, 0, 0] }), 1.1);
    plates.forEach((list, i) => glow(b.part(mergeGeometries(list)!, "#ffffff", { bone: head, at: [0, 0, 0], texture: RUNES[i] }), 1));
  }
  // struts: cup to halo
  for (const th of [-34, 0, 34]) {
    const a = th * DEG;
    const target: V3 = [Math.sin(a) * HALO_R, OY - Math.cos(a) * HALO_R, HALO_Z];
    b.sweep(
      catmull([
        [Math.sign(th) * 0.04, HY + 0.1, -0.045],
        [target[0] * 0.55, HY + 0.1 + (target[1] - HY - 0.1) * 0.4 + 0.012, -0.12],
        target,
      ]),
      0.0085,
      { bone: head, color: GOLD, sides: 5, caps: "round" },
    );
  }

  // ---- orb and its orbit -----------------------------------------------------------------------------------
  glow(
    b.part(new THREE.SphereGeometry(ORB_R, 24, 16), "#ffffff", {
      bone: orb,
      at: [0, OY, 0],
      rotation: [0, -90, 0],
      texture: ORB_TEX,
    }),
    1.25,
  );
  const rotA: V3 = [66, 0, 24];
  const rotB: V3 = [-24, 0, -58];
  const rings: [typeof ringAJ, number, V3][] = [
    [ringAJ, 0.15, rotA],
    [ringBJ, 0.168, rotB],
  ];
  const ringC: V3 = [0, OY, 0];
  rings.forEach(([joint, R, rot], idx) => {
    b.part(new THREE.TorusGeometry(R, 0.004, 5, 36), GOLD, { bone: joint, at: ringC, rotation: rot, name: `ring${idx}` });
    const beadsG: THREE.BufferGeometry[] = [];
    const gemsG: THREE.BufferGeometry[] = [];
    const shardG: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + idx * 0.4;
      const pos = ringPoint(R, ang, rot, ringC);
      if (i % 4 === 0) {
        gemsG.push(put(new THREE.OctahedronGeometry(0.016), pos, [0, 0, 0], [0.8, 1.25, 0.8]));
        beadsG.push(put(new THREE.TorusGeometry(0.0165, 0.0035, 5, 8), pos, [rot[0] + 90, 0, 0]));
      } else if (i % 2 === 0) {
        beadsG.push(put(new THREE.SphereGeometry(0.0085, 6, 4), pos));
      } else {
        shardG.push(put(new THREE.OctahedronGeometry(0.009), pos, [0, 0, 0], [0.7, 1.4, 0.7]));
      }
    }
    b.part(mergeGeometries(beadsG)!, GOLD, { bone: joint, at: [0, 0, 0] });
    glow(b.part(mergeGeometries(gemsG)!, GLOW_TEAL, { bone: joint, at: [0, 0, 0] }), 1.2);
    glow(b.part(mergeGeometries(shardG)!, GLOW_GOLD, { bone: joint, at: [0, 0, 0] }), 1);
  });

  // wind ribbons twirling round the orb
  for (let k = 0; k < 2; k++) {
    const path = spiral([0, OY - 0.22, 0], [0.2 * (k ? -1 : 1), OY - 0.22, 0.0], [0, 1, 0], { turns: 0.95, r1: 0.15, pitch: 0.2 });
    glow(
      b.sweep(path, (t) => [0.002 + 0.012 * Math.pow(Math.sin(Math.PI * t), 0.7), 0.0016], {
        bone: orb,
        section: "box",
        color: GLOW_PALE,
        caps: "flat",
      }),
      0.8,
    );
  }

  // floating motes
  {
    const rr = rng(23);
    const teal: THREE.BufferGeometry[] = [];
    const gold: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2 + rr() * 0.4;
      const rad = 0.23 + rr() * 0.08;
      const pos: V3 = [Math.cos(ang) * rad * 0.9, OY + Math.sin(ang) * rad * 0.95, 0.05 + rr() * 0.14];
      const g = put(new THREE.OctahedronGeometry(0.011 + rr() * 0.006), pos, [rr() * 60, rr() * 360, rr() * 60], [0.7, 1.5, 0.7]);
      (i % 3 === 0 ? gold : teal).push(g);
    }
    glow(b.part(mergeGeometries(teal)!, GLOW_TEAL, { bone: orb, at: [0, 0, 0] }), 1.1);
    glow(b.part(mergeGeometries(gold)!, GLOW_GOLD, { bone: orb, at: [0, 0, 0] }), 1);
  }

  return b.root;
}
