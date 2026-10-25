import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, mix, noise, smoothstep } from "../../../../src/index";
import { metal, panelled, gearGeometry } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Warhound MX-77 Armored Truck",
  "description": "A low-poly cyberpunk militarized 6x6 truck from 2077: angular armored hull, slab-sided cab with neon visor, roof turret, and a cargo bed with missile pods, antennas, and glowing trim."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4150",
  hullDark: "#232830",
  hullLight: "#59647a",
  trim: "#e7b814",
  rubber: "#15171c",
  rim: "#8a93a6",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  neonOrange: "#ff7a1a",
  glass: "#0b2a35",
  steel: "#7b8494",
  olive: "#4d5640",
  white: "#e8ecf2",
  warnRed: "#d62a2a",
};
const M = {
  chassisTop: [0, 1.25, 0] as [number, number, number],
  cabFloor: [0, 1.25, 2.05] as [number, number, number],
  cabRoof: [0, 2.45, 2] as [number, number, number],
  bedFloor: [0, 1.25, -1.55] as [number, number, number],
  bedFront: [0, 1.25, 0.9] as [number, number, number],
  turretRing: [0, 2.45, 0.35] as [number, number, number],
  axleFront: [0, 0.62, 2.4] as [number, number, number],
  axleMid: [0, 0.62, -0.9] as [number, number, number],
  axleRear: [0, 0.62, -2.7] as [number, number, number],
  bumperBase: [0, 0.75, 3.2] as [number, number, number],
  tailgate: [0, 1.25, -4] as [number, number, number],
  rearPods: [0, 2.3, -3.2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassisAndWheels
  (() => {
function buildChassisAndWheels({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(77);
  const IRON = panelled(metal("iron"), { size: 0.3, rivets: 0.06 });
  const FRAME = metal("iron", { tarnish: 0.5 });
  const STEEL = metal("steel", { tarnish: 0.3 });

  const box = (sx: number, sy: number, sz: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone: body, at, ...opts });

  // ---- ladder frame ----
  for (const s of [1, -1]) {
    box(0.16, 0.3, 6.6, IRON, [s * 0.65, 0.85, 0]);
    box(0.34, 0.06, 6.6, FRAME, [s * 0.65, 1.0, 0]);
    box(0.34, 0.06, 6.6, FRAME, [s * 0.65, 0.7, 0]);
    // battery boxes + fuel tank
    box(0.3, 0.3, 0.5, P.olive, [s * 0.95, 0.85, 1.4]);
    box(0.08, 0.1, 0.3, P.trim, [s * 0.95, 1.05, 1.4]);
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 8), IRON, {
      bone: body, at: [s * 0.95, 0.75, -1.9], dir: [0, 0, 1],
    });
    box(0.5, 0.05, 1.3, P.trim, [s * 0.95, 0.5, -1.9], { });
  }
  for (let i = 0; i < 9; i++) {
    const z = -3.1 + i * 0.78;
    box(1.2, 0.16, 0.14, FRAME, [0, 0.9, z]);
  }
  // drive shaft
  b.rod([0, 0.62, 2.4], [0, 0.62, -2.7], 0.06, STEEL, { bone: body, sides: 6 });
  // underbody engine vents (glow)
  for (let i = 0; i < 5; i++) {
    glow(box(0.7, 0.03, 0.08, P.neonOrange, [0, 0.58, 3.0 - i * 0.12]), 1.6);
  }
  box(0.9, 0.2, 0.7, P.hullDark, [0, 0.72, 2.9]);

  // axles, differentials, leaf springs
  const axles = [2.4, -0.9, -2.7];
  for (const z of axles) {
    b.rod([-1.2, 0.62, z], [1.2, 0.62, z], 0.07, STEEL, { bone: body, sides: 6 });
    b.part(new THREE.SphereGeometry(0.24, 8, 6), IRON, { bone: body, at: [0, 0.62, z], scale: [1, 0.9, 1.1] });
    glow(b.part(new THREE.CircleGeometry(0.1, 6), P.neonOrange, { bone: body, at: [0, 0.62, z + 0.26], dir: [0, 0, 1], axis: "z" }), 1.2);
    for (const s of [1, -1]) {
      box(0.14, 0.1, 0.9, STEEL, [s * 0.8, 0.78, z]);
      box(0.2, 0.14, 0.2, FRAME, [s * 0.8, 0.7, z]);
      for (const k of [-0.3, 0.3]) box(0.22, 0.04, 0.08, P.hullDark, [s * 0.8, 0.84, z + k]);
    }
  }

  // ---- mud flap decal ----
  const hazard = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#e7b814"/>${[-32, -16, 0, 16, 32]
      .map((x) => `<path d="M${x} 32 L${x + 8} 32 L${x + 40} 0 L${x + 32} 0Z" fill="#15171c"/>`)
      .join("")}</svg>`,
    { size: 64 },
  );
  const grime = paint((p, n) => {
    const base: any = [0.08, 0.09, 0.11];
    const mud: any = [0.26, 0.2, 0.13];
    const t = smoothstep(1.0, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.15, 3));
    const up = 0.7 + 0.3 * Math.max(n.y, 0);
    const c = mix(base, mud, t * 0.8);
    return [c[0] * up, c[1] * up, c[2] * up];
  });
  const hexRim = metal("steel", { polish: 0.5 });

  // tread lathe profile (octagonal)
  const TR = 0.62, TW = 0.46;
  const tireOutline: [number, number][] = [
    [0.34, -TW / 2], [0.52, -TW / 2], [TR - 0.04, -TW / 2 + 0.05], [TR, -TW / 2 + 0.12],
    [TR, TW / 2 - 0.12], [TR - 0.04, TW / 2 - 0.05], [0.52, TW / 2], [0.34, TW / 2],
  ];
  const lugGeo = new THREE.BoxGeometry(0.1, 0.07, 0.36);
  const names = ["FL", "FR", "ML", "MR", "RL", "RR"];
  const zs = [2.4, 2.4, -0.9, -0.9, -2.7, -2.7];
  names.forEach((nm, i) => {
    const j = J["wheel" + nm];
    const s = i % 2 === 0 ? 1 : -1;
    const c = j.at;
    const out = [s, 0, 0];
    b.lathe(tireOutline, { at: c, axis: out, segments: 8, bone: j, color: grime });
    // tread blocks
    for (let k = 0; k < 8; k++) {
      const a = (k + 0.5) * (Math.PI / 4);
      const dy = Math.sin(a) * (TR + 0.02);
      const dz = Math.cos(a) * (TR + 0.02);
      b.part(lugGeo, P.rubber, {
        bone: j, at: [c.x, c.y + dy, c.z + dz],
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    // hex rim
    const sx = (d: number) => c.x + s * d;
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.3, 6), hexRim, { bone: j, at: [sx(0.12), c.y, c.z], dir: out });
    b.part(new THREE.CylinderGeometry(0.22, 0.26, 0.08, 6), P.hullDark, { bone: j, at: [sx(0.28), c.y, c.z], dir: out });
    glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 6), P.neonCyan, { bone: j, at: [sx(0.34), c.y, c.z], dir: out }), 1.5);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), P.steel, {
        bone: j, at: [sx(0.3), c.y + Math.sin(a) * 0.17, c.z + Math.cos(a) * 0.17], dir: out,
      });
    }
    // arch liner
    const lx = c.x + s * 0.12;
    b.part(new THREE.CylinderGeometry(0.76, 0.76, 0.5, 8, 1, true, 0, Math.PI), P.hullDark, {
      bone: body, at: [lx, c.y, c.z], rotation: [0, 0, 90],
      quat: undefined,
    });
  });

  // mud flaps
  for (const z of [-0.2 - 0.9 + 0.9, -3.4]) {
    for (const s of [1, -1]) {
      const zz = z === -3.4 ? -3.3 : -1.7;
      b.part(new THREE.BoxGeometry(0.5, 0.45, 0.04), "#ffffff", {
        bone: body, at: [s * 1.2, 0.5, zz], texture: hazard,
      });
      b.part(new THREE.BoxGeometry(0.5, 0.45, 0.04), "#ffffff", {
        bone: body, at: [s * 1.2, 0.5, zz - 0.001], texture: hazard, rotation: [0, 180, 0],
      });
    }
  }
}
    return buildChassisAndWheels;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);

  const HULL = panelled(metal("iron", { tarnish: 0.2 }), { size: 0.3, rivets: 0.07 });
  const HULLP = paint((p, n) => {
    const base = HULL.at(p, n);
    const t = smoothstep(0.3, 1, n.y) * 0.15;
    return mix(mix(base, P.hull, 0.55), P.hullLight, t);
  });
  const DARKP = panelled(P.hullDark, { size: 0.25, rivets: 0.06 });

  // textures
  const visor = svg(
    `<svg viewBox="0 0 256 64"><rect x="2" y="6" width="252" height="52" rx="8" fill="#0b3a48" stroke="#2ff3ff" stroke-width="4"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="8" y="${10 + i * 5.5}" width="240" height="1.6" fill="#2ff3ff" opacity="0.5"/>`).join("")}
    <path d="M20 44 L50 20 L80 44" stroke="#aaffff" stroke-width="3" fill="none"/>
    <circle cx="150" cy="32" r="14" fill="none" stroke="#2ff3ff" stroke-width="3"/><path d="M150 14v36M132 32h36" stroke="#2ff3ff" stroke-width="2"/>
    <text x="190" y="28" font-size="14" fill="#aaffff" font-family="monospace">77:MX</text><text x="190" y="46" font-size="10" fill="#2ff3ff" font-family="monospace">戦闘 ▲</text></svg>`,
    { size: 512 },
  );
  const chevron = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#232830" opacity="0.0"/>
    ${[0, 1, 2, 3].map((i) => `<path d="M${6 + i * 22} 8 L${28 + i * 22} 32 L${6 + i * 22} 56 L${16 + i * 22} 56 L${38 + i * 22} 32 L${16 + i * 22} 8Z" fill="#e7b814"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const number = svg(
    `<svg viewBox="0 0 96 64"><rect x="2" y="2" width="92" height="60" rx="4" fill="#e8ecf2" opacity="0.9"/><text x="48" y="46" text-anchor="middle" font-size="40" font-weight="bold" font-family="monospace" fill="#232830">07</text></svg>`,
    { size: 128 },
  );
  const lamp = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="4" fill="#2ff3ff"/><rect x="4" y="4" width="56" height="6" fill="#ffffff"/><rect x="4" y="14" width="56" height="3" fill="#8ff"/></svg>`,
    { size: 128 },
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...opts });

  // main body: lower slab
  b.loft(
    [
      { at: [0, 1.75, 0.95], w: 2.5, h: 1.0 },
      { at: [0, 1.8, 2.1], w: 2.5, h: 1.0 },
      { at: [0, 1.65, 3.15], w: 2.3, h: 0.7 },
    ],
    { bone: body, color: HULLP, section: "box" },
  );
  // sloped hood
  b.slab(
    [
      [-1.12, 2.1, 2.4],
      [1.12, 2.1, 2.4],
      [1.0, 1.98, 3.18],
      [-1.0, 1.98, 3.18],
    ],
    { bone: body, color: P.hullLight, thickness: 0.08 },
  );
  // cabin upper wedge (extrude side profile)
  const prof: [number, number, string?][] = [
    [0, 0],
    [1.65, 0],
    [1.65, 0.12],
    [1.05, 0.7],
    [0.2, 0.7],
    [0, 0.6],
  ];
  const cabin = b.extrude(prof.map((p) => [p[0], p[1]] as [number, number]), {
    at: [-1.0, 2.25, 0.95],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 2.0,
    bevel: 0.03,
    color: HULLP,
    bone: body,
  });
  // The extrude is centred in x (thickness axis along x); roof plate
  box(1.9, 0.07, 1.0, P.hullDark, [0, 2.97 - 0.2, 1.55]);
  // windscreen visor
  glow(
    b.part(new THREE.PlaneGeometry(1.8, 0.42), "#ffffff", {
      bone: body,
      at: [0, 2.58, 2.0],
      dir: [0, 0.82, 0.57],
      axis: "z",
      texture: visor,
    }),
    1.3,
  );
  b.part(new THREE.BoxGeometry(2.0, 0.55, 0.05), P.hullDark, { bone: body, at: [0, 2.58, 1.97], dir: [0, 0.82, 0.57], axis: "z" });
  // side window slits and armor, doors
  for (const s of [1, -1]) {
    glow(box(0.04, 0.12, 0.8, P.neonCyan, [s * 1.01, 2.5, 1.55]), 1.2);
    box(0.12, 0.62, 1.15, P.hullDark, [s * 1.27, 1.85, 1.6]);
    b.part(new THREE.PlaneGeometry(0.95, 0.47), "#ffffff", {
      bone: body, at: [s * 1.34, 1.9, 1.6], dir: [s, 0, 0], axis: "z", texture: chevron, color: "#ffffff",
    });
    b.part(new THREE.PlaneGeometry(0.34, 0.23), "#ffffff", {
      bone: body, at: [s * 1.34, 1.62, 2.35], dir: [s, 0, 0], axis: "z", texture: number,
    });
    // door seams
    for (const z of [1.1, 2.1]) box(0.03, 1.0, 0.03, "#111111", [s * 1.26, 2.0, z]);
    box(0.03, 0.03, 1.0, "#111111", [s * 1.26, 1.5, 1.6]);
    // handles
    box(0.06, 0.05, 0.22, P.steel, [s * 1.3, 2.2, 1.95]);
    // fender armor
    box(0.2, 0.3, 1.4, P.hull, [s * 1.2, 1.55, 2.6], { rotation: [0, 0, s * 8] });
    // roof rails
    b.rod([s * 0.8, 2.82, 1.0], [s * 0.8, 2.82, 2.1], 0.025, P.steel, { bone: body, sides: 6 });
    box(0.05, 0.08, 0.05, P.steel, [s * 0.8, 2.78, 1.0]);
    box(0.05, 0.08, 0.05, P.steel, [s * 0.8, 2.78, 2.1]);
    // camera pod mirrors
    b.rod([s * 1.3, 2.45, 2.3], [s * 1.55, 2.5, 2.3], 0.02, P.steel, { bone: body, sides: 6 });
    b.part(new THREE.BoxGeometry(0.16, 0.2, 0.22), P.hullDark, { bone: body, at: [s * 1.6, 2.5, 2.3] });
    glow(box(0.14, 0.06, 0.03, P.neonCyan, [s * 1.6, 2.52, 2.42]), 1.4);
    // headlights
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
      bone: body, at: [s * 0.8, 1.72, 3.2], dir: [0, -0.1, 1], axis: "z", texture: lamp,
    });
    // exhaust stacks behind cab
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 1.3, 8), P.steel, { bone: body, at: [s * 1.15, 2.35, 0.82] });
    b.part(new THREE.CylinderGeometry(0.12, 0.09, 0.1, 8), P.hullDark, { bone: body, at: [s * 1.15, 3.02, 0.82] });
    glow(b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), P.neonOrange, { bone: body, at: [s * 1.15, 3.08, 0.82] }), 1.2);
    for (const y of [1.9, 2.4]) b.part(new THREE.TorusGeometry(0.11, 0.02, 4, 8), P.trim, { bone: body, at: [s * 1.15, y, 0.82], rotation: [90, 0, 0] });
    // side step
    box(0.3, 0.06, 2.0, P.trim, [s * 1.3, 1.25, 2.0]);
  }
  // yellow stripe across the hood and cab
  box(0.3, 0.015, 0.8, P.trim, [0, 2.12, 2.8], { rotation: [-10, 0, 0] });
  box(0.3, 0.015, 0.8, P.trim, [0.0, 2.112, 2.8], { rotation: [-10, 0, 0] });
  // rear wall armor meeting the bed
  box(2.3, 1.2, 0.1, P.hullDark, [0, 2.1, 0.95]);
  // roof sensor mast + lidar
  b.rod([0, 2.8, 1.5], [0, 3.3, 1.5], 0.035, P.steel, { bone: body, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 8), P.hullDark, { bone: body, at: [0, 3.0, 1.5] });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8), P.neonCyan, { bone: body, at: [0, 3.3, 1.5] });
  glow(b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 8), P.neonCyan, { bone: body, at: [0, 3.3, 1.5] }), 1.4);
  // searchlight
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8), P.hullDark, { bone: body, at: [0.5, 2.92, 2.2], rotation: [80, 0, 0] });
  glow(b.part(new THREE.CircleGeometry(0.09, 8), P.white, { bone: body, at: [0.5, 2.95, 2.31], dir: [0, 0.1, 1], axis: "z" }), 1.5);
  // grille vents on hood
  for (let i = 0; i < 5; i++) glow(box(0.4, 0.02, 0.05, P.neonOrange, [(i - 2) * 0.35 * 0.8, 2.07 - 0.0, 3.0 - 0.02]), 1);
  // rivets (merged)
  const geos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 24; i++) {
    const s = i % 2 ? 1 : -1;
    geos.push(new THREE.SphereGeometry(0.025, 5, 3).translate(s * 1.33, 1.6 + R() * 0.5, 1.1 + (i >> 1) * 0.12));
  }
  const merged = new THREE.BufferGeometry();
  const arr: number[] = [], idx: number[] = [], nor: number[] = [], uvs: number[] = [];
  let off = 0;
  for (const g of geos) {
    const pa = g.getAttribute("position"), na = g.getAttribute("normal"), ua = g.getAttribute("uv");
    for (let i = 0; i < pa.count; i++) { arr.push(pa.getX(i), pa.getY(i), pa.getZ(i)); nor.push(na.getX(i), na.getY(i), na.getZ(i)); uvs.push(ua.getX(i), ua.getY(i)); }
    const ix = g.index!;
    for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
    off += pa.count;
  }
  merged.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  merged.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  merged.setIndex(idx);
  b.part(merged, P.steel, { bone: body, at: [0, 0, 0] });
}
    return buildCab;
  })(),
  // bumperAndPlow
  (() => {
function buildBumperAndPlow({ b, J, P, M }: Ctx) {
  const body = J.body;
  const BZ = M.bumperBase[2]; // 3.2
  const AMBER = "#ffb23a";
  const DARKORANGE = "#ff7a1a";
  const hullPaint = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.22, rivets: 0.06 });
  const hullLight = panelled(mix(P.hullLight, P.hull, 0.3) as any, { size: 0.2 });
  const steelPaint = metal("steel", { tarnish: 0.4, polish: 0.2 });
  const grime = paint((p, n) => {
    const base = mix(P.hull, P.hullDark, smoothstep(0.9, 0.3, p.y) * 0.7);
    const d = noise(p, 0.12, 4);
    return mix(base, "#14161a", 0.35 * smoothstep(0.55, 0.8, d) + 0.2 * smoothstep(0.5, -0.5, n.y));
  });

  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, rotation: rot, flat: true, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, rotation: rot, flat: true });

  // Textures
  const HAZ = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#16181d"/>` +
      Array.from({ length: 10 }, (_, i) => `<path d="M${i * 16 - 8} 32 L${i * 16 + 8} 0 L${i * 16 + 18} 0 L${i * 16 + 2} 32Z" fill="#e7b814"/>`).join("") +
      `<rect x="0" y="0" width="128" height="3" fill="#0a0b0e"/><rect x="0" y="29" width="128" height="3" fill="#0a0b0e"/></svg>`,
    { size: 256 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0e0f13"/>` +
      Array.from({ length: 8 }, (_, i) => `<rect x="${3 + i * 7.6}" y="4" width="4.6" height="24" fill="#ff7a1a"/><rect x="${3 + i * 7.6}" y="4" width="1.4" height="24" fill="#ffd08a"/>`).join("") +
      `<rect x="1" y="1" width="62" height="30" fill="none" stroke="#3a4150" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const LIGHTBAR = svg(
    `<svg viewBox="0 0 128 16"><rect width="128" height="16" fill="#0b2a35"/>` +
      Array.from({ length: 12 }, (_, i) => `<rect x="${3 + i * 10.4}" y="3" width="8" height="10" fill="#2ff3ff"/><rect x="${3 + i * 10.4}" y="3" width="8" height="3" fill="#ffffff"/>`).join("") +
      `</svg>`,
    { size: 256 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#1a1d24"/><path d="M8 18H56M32 6V58M14 30L50 30M18 44L46 44M12 54L52 54" stroke="#e7b814" stroke-width="5" fill="none" stroke-linecap="square"/><rect x="2" y="2" width="60" height="60" fill="none" stroke="#e7b814" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const BAR = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#e8ecf2"/>` +
      Array.from({ length: 22 }, (_, i) => `<rect x="${3 + i * 2.7}" y="3" width="${i % 3 ? 1.2 : 2}" height="14" fill="#111"/>`).join("") +
      `<text x="32" y="23" font-size="5" text-anchor="middle" fill="#111" font-family="monospace">WH-MX77 / FRNT</text></svg>`,
    { size: 128 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 64 64"><path d="M8 8L32 32L8 56H24L48 32L24 8Z" fill="#e7b814"/><path d="M28 8L52 32L28 56H40L60 32L40 8Z" fill="#e7b814" opacity="0.7"/></svg>`,
    { size: 128 },
  );
  const FOG = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#2a2e38"/><circle cx="32" cy="32" r="22" fill="#fff2c0"/><circle cx="32" cy="32" r="14" fill="#ffffff"/><circle cx="32" cy="32" r="30" fill="none" stroke="#e7b814" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const decal = (geo: THREE.BufferGeometry, tex: any, at: number[], dir: number[], up: number[] = [0, 1, 0], g = false) => {
    const p = b.part(geo, "#ffffff", { bone: body, at, dir, up, axis: "z", texture: tex });
    return g ? glow(p, 1.4) : p;
  };

  // ---- Main bumper block (sloped)
  b.frustumBox([0, 0.62, 3.3], [0, 1.22, 3.55], [2.7, 0.28], [2.7, 0.2], { bone: body, color: hullPaint });
  b.extrude(
    [[0, 0], [0.62, 0], [0.7, 0.55], [0.12, 0.62], [0, 0.46]] as any,
    { at: [-1.3, 0.55, 3.3], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bone: body, color: hullPaint },
  );
  // Upper slab sloped bumper face
  b.extrude(
    [[-1.35, 0.7], [1.35, 0.7], [1.3, 1.25], [-1.3, 1.25]] as any,
    { at: [0, 0, 3.62], x: [-1, 0, 0], y: [0, 1, 0], thickness: [0.2, 0.2], bevel: 0.03, bone: body, color: hullPaint },
  );
  // Upper hood-front brow
  b.frustumBox([0, 1.36, 3.35], [0, 1.36, 3.7], [2.4, 0.12], [2.2, 0.08], { bone: body, color: hullLight });

  // ---- Plow wedge: layered plates
  const plow = (w: number, y0: number, y1: number, zb: number, zf: number, color: any, th: number) =>
    b.extrude(
      [[-w / 2, y0], [w / 2, y0], [w / 2 - 0.12, y1], [-w / 2 + 0.12, y1]] as any,
      { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: th, bone: body, color },
    );
  // wedge as lofted slab pieces
  b.slab([[-1.35, 0.32, 3.75], [1.35, 0.32, 3.75], [1.2, 0.75, 3.55], [-1.2, 0.75, 3.55]], { thickness: 0.07, color: grime, bone: body });
  b.slab([[-1.5 + 0.1, 0.34, 3.88], [1.4, 0.34, 3.88], [1.25, 0.82, 3.7], [-1.25, 0.82, 3.7]].map((p) => [p[0] * 0.98, p[1], p[2] + 0.06]), { thickness: 0.06, color: hullPaint, bone: body });
  // central ridge wedge (V shape)
  for (const s of [1, -1]) {
    b.slab([[0, 0.3, 4.0], [s * 1.38, 0.3, 3.7], [s * 1.25, 0.9, 3.55], [0, 0.95, 3.72]], { thickness: 0.07, color: s > 0 ? hullPaint : hullPaint, bone: body });
    // yellow edge rod
    b.rod([0, 0.3, 4.0], [s * 1.38, 0.3, 3.7], 0.035, P.trim, { bone: body, sides: 4 } as any);
    b.rod([s * 1.38, 0.3, 3.7], [s * 1.25, 0.9, 3.55], 0.03, P.trim, { bone: body, sides: 4 } as any);
  }
  b.rod([0, 0.3, 4.0], [0, 0.95, 3.72], 0.04, P.hullLight, { bone: body, sides: 4 } as any);
  // hazard decals on plow faces
  for (const s of [1, -1]) {
    const nrm = [s * 0.35, 0.45, 0.82];
    decal(new THREE.PlaneGeometry(1.1, 0.28), HAZ, [s * 0.68, 0.6, 3.83], nrm, [0, 1, 0]);
  }
  // tooth blades along plow bottom
  for (let i = 0; i < 7; i++) {
    const x = -1.2 + i * 0.4;
    const zz = 3.98 - Math.abs(x) * 0.22;
    box(0.2, 0.1, 0.14, P.steel, [x, 0.34, zz - 0.02], [0, 0, 0]);
  }
  // skid plates
  box(2.2, 0.06, 0.8, P.hullDark, [0, 0.38, 3.35]);
  box(1.4, 0.05, 0.5, steelPaint, [0, 0.34, 3.4]);

  // ---- Grille + glowing slats
  box(1.3, 0.5, 0.06, P.hullDark, [0, 1.0, 3.66]);
  glow(
    b.part(new THREE.PlaneGeometry(1.15, 0.38), "#ffffff", { bone: body, at: [0, 1.0, 3.7], dir: [0, 0, 1], axis: "z", texture: GRILLE }),
    1.3,
  );
  // frame around grille
  box(1.4, 0.05, 0.1, P.trim, [0, 1.27, 3.67]);
  box(1.4, 0.05, 0.1, P.trim, [0, 0.73, 3.67]);
  for (const s of [1, -1]) box(0.05, 0.54, 0.1, P.trim, [s * 0.7, 1.0, 3.67]);

  // ---- Light bar (cyan LED)
  box(2.2, 0.18, 0.12, P.hullDark, [0, 1.42, 3.68]);
  glow(
    b.part(new THREE.PlaneGeometry(2.05, 0.12), "#ffffff", { bone: body, at: [0, 1.42, 3.745], dir: [0, 0, 1], axis: "z", texture: LIGHTBAR }),
    1.8,
  );
  for (const s of [1, -1]) box(0.08, 0.24, 0.16, P.trim, [s * 1.12, 1.42, 3.68]);

  // ---- Fog light pods
  for (const s of [1, -1]) {
    const hx = s * 1.0;
    cyl(0.14, 0.17, 0.2, 8, P.hullDark, [hx, 0.82, 3.62], [90, 0, 0]);
    decal(new THREE.CircleGeometry(0.125, 10), FOG, [hx, 0.82, 3.735], [0, 0, 1], [0, 1, 0], true);
    cyl(0.17, 0.17, 0.03, 8, P.trim, [hx, 0.82, 3.7], [90, 0, 0]);
    box(0.34, 0.04, 0.2, P.hullDark, [hx, 0.99, 3.62]);
  }

  // ---- Winch
  cyl(0.11, 0.11, 0.62, 8, steelPaint, [0, 0.62, 3.5], [0, 0, 90]);
  for (const s of [1, -1]) {
    cyl(0.16, 0.16, 0.04, 8, P.trim, [s * 0.33, 0.62, 3.5], [0, 0, 90]);
    box(0.06, 0.26, 0.2, P.hullDark, [s * 0.36, 0.55, 3.5]);
  }
  for (let i = 0; i < 6; i++) cyl(0.125, 0.125, 0.015, 8, P.rubber, [-0.2 + i * 0.08, 0.62, 3.5], [0, 0, 90]);
  b.sweep(
    [[0.1, 0.52, 3.52], [0.12, 0.5, 3.7], [0.1, 0.46, 3.85], [0.08, 0.4, 3.9]] as any,
    0.012,
    { bone: body, color: P.steel, sides: 5 } as any,
  );
  // hook
  b.sweep(
    [[0.08, 0.4, 3.9], [0.08, 0.32, 3.9], [0.08, 0.27, 3.93], [0.08, 0.3, 3.97]] as any,
    [0.022, 0.016],
    { bone: body, color: P.warnRed, sides: 5 } as any,
  );
  box(0.08, 0.06, 0.06, P.warnRed, [0.08, 0.42, 3.9]);
  // winch fairlead
  box(0.34, 0.06, 0.1, P.hullLight, [0.1, 0.5, 3.66]);

  // ---- Tow hooks
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.85, 0.5, 3.6], [s * 0.85, 0.46, 3.84], [s * 0.85, 0.38, 3.9], [s * 0.85, 0.34, 3.84]] as any,
      0.03,
      { bone: body, color: P.trim, sides: 6 } as any,
    );
    box(0.14, 0.18, 0.06, P.hullDark, [s * 0.85, 0.52, 3.62]);
  }

  // ---- Front fender armor over first axle arches (axle z 2.4)
  for (const s of [1, -1]) {
    const x = s * 1.18;
    // arch cap: arc of angled slabs
    for (let i = 0; i < 5; i++) {
      const a = (-65 + i * 32.5) * (Math.PI / 180);
      const R = 0.78;
      const cy = 0.62, cz = 2.4;
      const py = cy + Math.cos(a) * R + 0.05;
      const pz = cz + Math.sin(a) * R;
      box(0.5, 0.09, 0.4, i % 2 ? hullPaint : hullLight, [x, py, pz], [(a * 180) / Math.PI, 0, 0]);
    }
    // flare rim
    for (let i = 0; i < 5; i++) {
      const a = (-65 + i * 32.5) * (Math.PI / 180);
      const R = 0.85;
      box(0.06, 0.05, 0.36, P.trim, [s * 1.43, 0.62 + Math.cos(a) * R + 0.05, 2.4 + Math.sin(a) * R], [(a * 180) / Math.PI, 0, 0]);
    }
    // fender front/back wedges
    b.slab([[s * 0.95, 0.9, 3.15], [s * 1.42, 0.9, 3.15], [s * 1.42, 0.95, 2.78], [s * 0.95, 1.08, 2.78]], { thickness: 0.08, color: hullPaint, bone: body });
    b.slab([[s * 0.95, 0.9, 3.55], [s * 1.42, 0.9, 3.55], [s * 1.42, 0.82, 3.15], [s * 0.95, 0.82, 3.15]], { thickness: 0.08, color: hullPaint, bone: body });
    // outer end cap wedge
    b.extrude(
      [[0, 0], [0.5, 0], [0.4, 0.4], [0.08, 0.5]] as any,
      { at: [s * 1.4, 0.6, 3.1], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, bone: body, color: hullPaint },
    );
    // chevron decal on fender front
    decal(new THREE.PlaneGeometry(0.34, 0.34), CHEV, [s * 1.42, 0.88, 3.4], [s, 0, 0], [0, 1, 0]);
    // glyph plate
    decal(new THREE.PlaneGeometry(0.2, 0.2), GLYPH, [s * 1.44, 1.1, 3.0], [s, 0, 0], [0, 1, 0]);
    // magenta marker
    glow(box(0.04, 0.05, 0.18, P.neonMagenta, [s * 1.43, 0.78, 3.62]), 1.5);
    glow(box(0.04, 0.05, 0.12, P.neonOrange, [s * 1.43, 0.7, 3.62]), 1.5);

    // ---- Side step plates running back along cab (z 3.0 → 1.0)
    box(0.38, 0.06, 2.0, P.hullDark, [s * 1.36, 0.58, 2.05]);
    box(0.4, 0.04, 2.02, P.trim, [s * 1.36, 0.55, 2.05]);
    // anti-slip ribs
    for (let i = 0; i < 12; i++) box(0.3, 0.02, 0.04, P.steel, [s * 1.36, 0.62, 1.1 + i * 0.16]);
    // brackets
    for (let i = 0; i < 4; i++) {
      box(0.06, 0.22, 0.08, P.hullLight, [s * 1.22, 0.45, 1.2 + i * 0.55], [0, 0, s * 12]);
    }
    // neon underglow strip
    glow(box(0.03, 0.03, 1.9, P.neonCyan, [s * 1.56, 0.52, 2.05]), 1.6);
    decal(new THREE.PlaneGeometry(0.28, 0.12), BAR, [s * 1.0, 0.64, 3.58], [0, 1, 0], [0, 0, 1]);
  }

  // ---- Bumper top details: hazard stripe band
  decal(new THREE.PlaneGeometry(2.3, 0.2), HAZ, [0, 1.2, 3.735], [0, 0.08, 1], [0, 1, 0]);
  // numbers / barcode
  decal(new THREE.PlaneGeometry(0.4, 0.15), BAR, [-0.95, 1.2 - 0.2, 3.74], [0, 0, 1]);
  decal(new THREE.PlaneGeometry(0.2, 0.2), GLYPH, [0.98, 1.0, 3.7], [0, 0, 1]);

  // ---- Corner guards
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.3, 0], [0.3, 0.6], [0.1, 0.75], [0, 0.6]] as any,
      { at: [s * 1.34, 0.65, 3.55], x: [-s * 0.5, 0, -0.85], y: [0, 1, 0], thickness: 0.1, bone: body, color: hullLight },
    );
    cyl(0.07, 0.07, 0.3, 6, P.trim, [s * 1.28, 1.0, 3.6]);
  }

  // ---- Rivets & bolts merged
  const rivetGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.03, 6);
  const front: THREE.BufferGeometry[] = [];
  const addR = (x: number, y: number, z: number, rx: number) => {
    const g = rivetGeo.clone();
    g.rotateX(rx);
    g.translate(x, y, z);
    front.push(g);
  };
  for (let i = 0; i < 14; i++) {
    const x = -1.2 + i * (2.4 / 13);
    addR(x, 1.32, 3.75, Math.PI / 2);
    addR(x, 0.76, 3.72, Math.PI / 2);
  }
  for (let i = 0; i < 8; i++) {
    const x = -1.05 + i * 0.3;
    addR(x, 0.45, 3.78 - Math.abs(x) * 0.12, Math.PI / 2 - 0.3);
  }
  b.part(mergeGeometries(front)!, P.steel, { bone: body, at: [0, 0, 0] });

  const bolts: THREE.BufferGeometry[] = [];
  const bg = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6);
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const g = bg.clone();
      g.rotateZ(Math.PI / 2);
      g.translate(s * 1.46, 0.85 + (i % 2) * 0.12, 1.2 + i * 0.4);
      bolts.push(g);
    }
  b.part(mergeGeometries(bolts)!, P.steel, { bone: body, at: [0, 0, 0] });

  // ---- Antenna stubs / bumper lamps (small amber turn signals)
  for (const s of [1, -1]) {
    glow(box(0.16, 0.08, 0.05, AMBER, [s * 1.2, 1.3, 3.62]), 1.4);
    glow(box(0.1, 0.06, 0.05, DARKORANGE, [s * 0.55, 0.66, 3.7]), 1.4);
  }
  // under-bumper cross brace
  b.rod([-1.2, 0.5, 3.3], [1.2, 0.5, 3.3], 0.05, P.hullLight, { bone: body, sides: 6 } as any);
  // chain cable loop under bumper
  b.sweep(
    [[-0.5, 0.45, 3.55], [-0.45, 0.38, 3.6], [-0.2, 0.36, 3.62], [0, 0.4, 3.6]] as any,
    0.012,
    { bone: body, color: P.steel, sides: 5 } as any,
  );
}
    return buildBumperAndPlow;
  })(),
  // cargoBed
  (() => {
function buildCargoBed({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(77);

  // ---------- textures ----------
  const HAZARD = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e7b814"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 16 - 16} 32 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16 - 8} 32Z" fill="#15171c"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const BARCODE = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#e8ecf2"/><rect x="2" y="2" width="60" height="6" fill="#d62a2a"/>` +
      Array.from({ length: 22 }, (_, i) => `<rect x="${5 + i * 2.6}" y="14" width="${i % 3 ? 1.2 : 2}" height="18" fill="#15171c"/>`).join("") +
      `<text x="32" y="7" font-size="6" text-anchor="middle" fill="#fff" font-family="monospace">WARNING</text></svg>`,
    { size: 128 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#232830"/><path d="M10 14H54M32 6V58M14 30H50M18 46L32 34L46 46M12 54H52" stroke="#2ff3ff" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="2" y="2" width="60" height="60" fill="none" stroke="#e7b814" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 64 32"><path d="M4 4L24 16L4 28M24 4L44 16L24 28M44 4L62 16L44 28" stroke="#e7b814" stroke-width="6" fill="none" stroke-linejoin="miter"/></svg>`,
    { size: 128 },
  );
  const ORANGE_G = svg(
    `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#ff7a1a"/><circle cx="8" cy="8" r="3" fill="#fff2b0"/></svg>`,
    { size: 32 },
  );

  // ---------- paints ----------
  const hullPaint = paint((p, n, s) => {
    const base = panelled(metal("iron", { tarnish: 0.3 }), { size: 0.4, rivets: 0.07 }).at(p, n);
    // soot toward the rear top, orange glow strip along lower flank
    const soot = smoothstep(-2, -4, p.z) * smoothstep(0.3, 1, n.y) * 0.5;
    let c = mix(base, "#0a0a0c", soot);
    if (Math.abs(n.x) > 0.7 && p.y > 0.78 && p.y < 0.84) c = mix(c, "#ff7a1a", 0.95);
    return c;
  });
  const plate = panelled(P.hull, { size: 0.32, rivets: 0.06 });
  const darkPlate = panelled(P.hullDark, { size: 0.3, rivets: 0.06 });

  const box = (w: number, h: number, d: number, at: number[], color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, flat: true, ...opts });

  // ---------- main body ----------
  // lower box
  box(2.7, 1.2, 4.9, [0, 1.35 + 0.6 - 0.0, -1.6], hullPaint);
  // upper slanted shell (extrude cross section along z)
  const prof: [number, number, string?][] = [
    [-1.3, 0], [1.3, 0], [1.2, 0.55], [0.95, 0.75], [-0.95, 0.75], [-1.2, 0.55],
  ] as any;
  b.extrude(prof as any, { at: [0, 2.0, -1.6], x: [1, 0, 0], y: [0, 1, 0], thickness: 4.8, bone: body, color: plate });
  // extrude thickness runs along x*y = +z; recentred on drawing
  // roof deck with turret opening ring
  b.lathe([[0.62, 0], [0.62, 0.1], [0.72, 0.1], [0.72, 0]], { at: [0, 2.74, 0.35], bone: body, segments: 8, color: P.trim });
  // chassis rails mounting
  for (const s of [1, -1]) box(0.2, 0.3, 4.9, [s * 0.9, 1.4, -1.6], P.hullDark);

  // ---------- ribbed side panels ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 11; i++) {
      const z = -3.7 + i * 0.4;
      b.extrude(
        [[0, 0], [0.12, 0], [0.12, 0.9], [0.02, 1.0], [0, 1.0]],
        { at: [s * 1.35, 1.4 + 0.45, z], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.16, color: i % 2 ? P.hullLight : P.hull, bone: body },
      );
    }
    // lower skirt rail
    box(0.12, 0.14, 4.8, [s * 1.38, 1.2, -1.6], P.trim);
    // orange glow strip lower flank
    glow(box(0.05, 0.07, 4.4, [s * 1.4, 0.82 + 0.5, -1.6], P.neonOrange), 1.6);
    // equipment lockers
    for (const [z, w] of [[-0.2, 0.9], [-2.2, 1.0]] as number[][]) {
      box(0.14, 0.8, w, [s * 1.42, 2.3, z], darkPlate);
      b.part(new THREE.PlaneGeometry(w * 0.7, 0.4), "#ffffff", {
        bone: body, at: [s * 1.5, 2.3, z], dir: [s, 0, 0], axis: "z", texture: BARCODE,
      });
      box(0.05, 0.1, 0.1, [s * 1.5, 2.55, z + w * 0.4 - 0.05], P.steel);
    }
    // chevron decal
    b.part(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", { bone: body, at: [s * 1.5, 1.95, -1.2], dir: [s, 0, 0], axis: "z", texture: CHEV });
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: body, at: [s * 1.5, 2.65, -3.4], dir: [s, 0, 0], axis: "z", texture: GLYPH });
    // fender skirts / arches over mid & rear axles
    for (const z of [-0.9, -2.7]) {
      const arch = b.lathe(
        [[0.78, -0.12], [0.78, 0.12], [0.95, 0.12], [0.95, -0.12]],
        { at: [s * 1.3, 0.62, z], axis: [1, 0, 0], segments: 8, color: P.hullDark, bone: body },
      );
      box(0.08, 0.5, 1.7, [s * 1.45, 1.08, z], darkPlate);
      box(0.4, 0.07, 1.7, [s * 1.3, 1.4, z], P.hullDark);
    }
  }

  // ---------- roof hatches ----------
  const hatches: number[][] = [[-0.55, 0.65, -1.4], [0.55, 0.65, -1.4], [-0.55, 0.65, -2.6], [0.55, 0.65, -2.6]];
  for (const h of hatches) {
    const at = [h[0], 2.76 + 0.0, h[2]];
    box(0.9, 0.08, 1.0, at, darkPlate);
    box(0.94, 0.03, 0.06, [at[0], 2.82, at[2] + 0.5], P.trim);
    box(0.94, 0.03, 0.06, [at[0], 2.82, at[2] - 0.5], P.trim);
    box(0.06, 0.03, 0.94, [at[0] - 0.45, 2.82, at[2]], P.trim);
    box(0.06, 0.03, 0.94, [at[0] + 0.45, 2.82, at[2]], P.trim);
    box(0.12, 0.08, 0.12, [at[0], 2.86, at[2]], P.steel);
  }

  // ---------- crates on deck rear / front ----------
  const crates: number[][] = [[0.8, 2.9, 0.55], [-0.85, 2.9, 0.6]];
  for (const c of crates) {
    box(0.55, 0.3, 0.5, c, P.olive);
    box(0.57, 0.04, 0.52, [c[0], c[1] + 0.12, c[2]], P.trim);
    b.part(new THREE.PlaneGeometry(0.3, 0.2), "#ffffff", { bone: body, at: [c[0], c[1] + 0.02, c[2] + 0.255], dir: [0, 0, 1], axis: "z", texture: BARCODE });
  }
  // fuel drums
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), P.warnRed, { bone: body, at: [s * 0.75, 2.97, -0.35], flat: true });
    b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 8), P.steel, { bone: body, at: [s * 0.75, 3.0, -0.35], flat: true });
  }

  // ---------- missile pod rack ----------
  box(1.9, 0.12, 0.9, [0, 2.8 + 0.0, -3.2], P.hullDark);
  for (const s of [1, -1]) {
    box(0.1, 0.5, 0.8, [s * 0.95, 2.95, -3.2], darkPlate);
    // pod
    const podAt = new THREE.Vector3(s * 0.48, 3.0, -3.25);
    const tilt = -28;
    const pod = b.part(new THREE.BoxGeometry(0.78, 0.55, 0.9), plate, {
      bone: body, at: podAt.toArray(), rotation: [tilt, 0, 0], flat: true,
    });
    b.part(new THREE.BoxGeometry(0.8, 0.06, 0.92), P.trim, { bone: body, at: [podAt.x, podAt.y + 0.18, podAt.z], rotation: [tilt, 0, 0], flat: true });
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((tilt * Math.PI) / 180, 0, 0));
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(q); // faces rear-up
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const right = new THREE.Vector3(1, 0, 0);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const pos = podAt
          .clone()
          .addScaledVector(fwd, 0.46)
          .addScaledVector(right, (c - 1) * 0.24)
          .addScaledVector(up, (r - 0.5) * 0.24);
        // tube ring and glowing end
        b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.08, 6), P.steel, {
          bone: body, at: pos.toArray(), dir: fwd.toArray(), flat: true,
        });
        glow(
          b.part(new THREE.CircleGeometry(0.07, 6), "#ffffff", {
            bone: body, at: pos.clone().addScaledVector(fwd, 0.045).toArray(), dir: fwd.toArray(), axis: "z", texture: ORANGE_G,
          }),
          1.5,
        );
      }
  }

  // ---------- antenna array & radome ----------
  const ax = [-1.0, -0.8];
  b.part(new THREE.CylinderGeometry(0.12, 0.16, 0.12, 8), P.hullDark, { bone: body, at: [-1.0, 2.8, -1.9], flat: true });
  for (let i = 0; i < 3; i++) {
    const a = 0.5 + i * 0.12;
    b.rod([-1.0, 2.85, -1.9 + i * 0.1 - 0.1], [-1.0 - 0.45 - i * 0.05, 2.85 + 0.15, -1.9 + i * 0.1 - 0.1], 0.02, P.steel, { bone: body });
  }
  b.rod([-1.15, 2.85, -2.0], [-1.15, 3.7, -2.05], 0.015, P.steel, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonMagenta, { bone: body, at: [-1.15, 3.72, -2.05] }), 2);
  b.rod([-0.95, 2.85, -2.2], [-0.95, 3.3, -2.5], 0.015, P.steel, { bone: body });
  // radome dish
  b.part(new THREE.CylinderGeometry(0.05, 0.1, 0.25, 6), P.steel, { bone: body, at: [1.0, 2.9, -1.9], flat: true });
  b.part(new THREE.SphereGeometry(0.3, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.white, { bone: body, at: [1.0, 3.02, -1.9], flat: true });
  b.part(new THREE.TorusGeometry(0.3, 0.03, 4, 8), P.trim, { bone: body, at: [1.0, 3.02, -1.9], rotation: [90, 0, 0], flat: true });

  // ---------- rear bumper & tail lights ----------
  box(2.8, 0.3, 0.3, [0, 0.95, -4.05], darkPlate);
  for (let i = 0; i < 6; i++) b.part(new THREE.BoxGeometry(0.22, 0.31, 0.32), i % 2 ? P.trim : P.rubber, { bone: body, at: [-1.15 + i * 0.46, 0.95, -4.05], flat: true });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 6), P.steel, { bone: body, at: [0, 0.95, -4.25], rotation: [90, 0, 0], flat: true });
  for (const s of [1, -1]) {
    glow(box(0.14, 0.8, 0.06, [s * 1.3, 1.95, -4.08], P.neonMagenta), 2);
    glow(box(0.5, 0.1, 0.06, [s * 1.05, 1.2, -4.08], P.neonMagenta), 1.8);
    box(0.2, 1.0, 0.1, [s * 1.3, 1.95, -4.02], P.hullDark);
  }

  // ---------- tailgate (on tailgate joint) ----------
  const tg = J.tailgate; // at [0,1.3,-4], bone +Y along x-ish; use explicit bone
  const tgAt = (x: number, y: number, z = -4.04) => [x, y, z];
  b.part(new THREE.BoxGeometry(2.4, 1.4, 0.1), plate, { bone: tg, at: tgAt(0, 2.0), flat: true });
  b.part(new THREE.PlaneGeometry(2.1, 0.5), "#ffffff", { bone: tg, at: tgAt(0, 1.6, -4.1), dir: [0, 0, -1], axis: "z", texture: HAZARD });
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: tg, at: tgAt(0, 2.3, -4.1), dir: [0, 0, -1], axis: "z", texture: GLYPH });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.16, 0.2, 0.14), P.steel, { bone: tg, at: tgAt(s * 1.0, 2.55), flat: true });
    b.part(new THREE.BoxGeometry(0.16, 0.2, 0.14), P.steel, { bone: tg, at: tgAt(s * 1.0, 1.45), flat: true });
    b.part(new THREE.BoxGeometry(0.1, 0.9, 0.04), P.trim, { bone: tg, at: tgAt(s * 0.55, 2.25, -4.1), flat: true });
  }
  b.part(new THREE.BoxGeometry(0.4, 0.1, 0.1), P.trim, { bone: tg, at: tgAt(0, 2.65, -4.1), flat: true });

  // ---------- rivet studs along top edge (merged) ----------
  const studs: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 24; i++) studs.push(new THREE.SphereGeometry(0.025, 5, 3).translate(s * 1.28, 2.0 + 0.02, -3.9 + i * 0.2));
  const merged = studs.length ? (studs.reduce((a, g) => a) , null) : null;
  void merged;
  for (let i = 0; i < 24; i++)
    for (const s of [1, -1])
      if (R() > 0.4) b.part(studs[i + (s < 0 ? 24 : 0)], P.steel, { bone: body, at: [0, 0, 0] });
}
    return buildCargoBed;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const BRASS = "#c8963c";
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const ring = M.turretRing;
  const CX = ring[0];
  const CZ = ring[2];
  const GY = 2.95; // gun axis height

  // ---------- paints ----------
  const hullPaint = panelled(
    paint((p, n) => {
      const base = mix(P.hull, P.hullLight, smoothstep(0.35, 0.75, noise(p, 0.3, 4)) * 0.6 + n.y * 0.25);
      return mix(base, P.hullDark, smoothstep(0.3, -0.6, n.y) * 0.5);
    }),
    { size: 0.2, aspect: 0.6, rivets: 0.05 },
  );
  const darkPaint = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.16, rivets: 0.04 });
  const steelPaint = metal("steel", { tarnish: 0.35, size: 0.1 });

  // ---------- textures ----------
  const killMarks = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="62" height="38" rx="3" fill="#15171c" stroke="#e7b814" stroke-width="2"/>
      <g stroke="#e8ecf2" stroke-width="2.4" stroke-linecap="round">
        <path d="M8 8 v10 M13 8 v10 M18 8 v10 M23 8 v10 M6 16 L26 10"/>
        <path d="M32 8 v10 M37 8 v10 M42 8 v10 M47 8 v10 M30 16 L50 10"/>
        <path d="M8 24 v10 M13 24 v10 M18 24 v10 M6 32 L21 26"/>
      </g>
      <path d="M40 24 l8 0 l4 5 l-4 5 l-8 0 l-4 -5z" fill="none" stroke="#ff2fb4" stroke-width="2"/>
      <path d="M44 27 v4 M42 29 h4" stroke="#2ff3ff" stroke-width="1.6"/>
      <text x="52" y="36" font-size="6" fill="#e7b814" font-family="monospace">77</text>
    </svg>`,
    { size: 192 },
  );
  const glyph = svg(
    `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#e7b814"/>
      <path d="M6 10 h36 M24 4 v40 M10 22 h28 M12 36 l12 -10 l12 10 M14 16 l-6 8 M34 16 l6 8" stroke="#15171c" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const lensEye = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="r"><stop offset="0" stop-color="#ffffff"/><stop offset="0.3" stop-color="#ff6ad0"/><stop offset="0.7" stop-color="#ff2fb4"/><stop offset="1" stop-color="#6a0a4a"/></radialGradient></defs>
      <circle cx="32" cy="32" r="30" fill="#15171c" stroke="#e7b814" stroke-width="3"/>
      <circle cx="32" cy="32" r="22" fill="url(#r)"/>
      <circle cx="32" cy="32" r="8" fill="#1a0014"/>
      <circle cx="26" cy="26" r="3.5" fill="#ffffff"/>
      <path d="M32 6 v8 M32 50 v8 M6 32 h8 M50 32 h8" stroke="#ff2fb4" stroke-width="2.5"/>
    </svg>`,
    { size: 128 },
  );
  const barcode = svg(
    `<svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="20" fill="#e8ecf2"/>
      <g fill="#15171c"><rect x="3" y="3" width="2" height="11"/><rect x="7" y="3" width="1" height="11"/><rect x="10" y="3" width="3" height="11"/><rect x="15" y="3" width="1" height="11"/><rect x="18" y="3" width="2" height="11"/><rect x="22" y="3" width="3" height="11"/><rect x="27" y="3" width="1" height="11"/><rect x="30" y="3" width="2" height="11"/><rect x="34" y="3" width="3" height="11"/></g>
      <rect x="0" y="16" width="40" height="4" fill="#d62a2a"/></svg>`,
    { size: 96 },
  );

  // ---------- helpers ----------
  const box = (size: number[], color: any, at: number[], bone: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...opts });
  const cyl = (r0: number, r1: number, len: number, seg: number, color: any, at: number[], dir: number[], bone: any, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(r1, r0, len, seg), color, { bone, at, dir, ...opts });
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], bone: any, up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex });

  // ---------- ring base (static on body) ----------
  b.lathe(
    [[0, 0], [0.74, 0], [0.74, 0.04], [0.68, 0.1], [0, 0.1]],
    { at: [CX, ring[1], CZ], segments: 16, bone: J.body, color: darkPaint },
  );
  b.lathe(
    [[0.66, 0.1], [0.7, 0.1], [0.7, 0.115], [0.66, 0.115]],
    { at: [CX, ring[1], CZ], segments: 16, bone: J.body, color: P.trim },
  );
  // yellow/black bolt blocks round the base
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box([0.06, 0.05, 0.06], P.trim, [CX + Math.sin(a) * 0.72, ring[1] + 0.03, CZ + Math.cos(a) * 0.72], J.body, {
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // toothed slew gear
  b.part(gearGeometry({ teeth: 36, radius: 0.6, thickness: 0.05, bore: 0.25 }), steelPaint, {
    bone: yaw,
    at: [CX, ring[1] + 0.125, CZ],
    dir: [0, 1, 0],
  });

  // ---------- housing (rides yaw) ----------
  const hy = ring[1] + 0.15; // 2.6
  const prof: [number, number, string?][] = [
    [-0.45, 0],
    [0.6, 0],
    [0.6, 0.22],
    [0.3, 0.4],
    [-0.28, 0.4],
    [-0.45, 0.22],
  ];
  const outline = prof.map(([x, y]) => [x, y, "sharp"] as [number, number, "sharp"]);
  b.extrude(outline, { at: [0, hy, CZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.9, bevel: 0.02, bone: yaw, color: hullPaint });
  // side armour cheeks + trim
  for (const s of [1, -1]) {
    b.extrude(
      [[-0.4, 0.04, "sharp"], [0.55, 0.04, "sharp"], [0.55, 0.2, "sharp"], [0.28, 0.36, "sharp"], [-0.25, 0.36, "sharp"], [-0.4, 0.2, "sharp"]],
      { at: [s * 0.45, hy, CZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, bevel: 0.012, bone: yaw, color: hullPaint },
    );
    // yellow trim stripe along cheek bottom
    box([0.07, 0.025, 1.0], P.trim, [s * 0.455, hy + 0.025, CZ + 0.08], yaw);
    box([0.07, 0.025, 0.6], P.trim, [s * 0.455, hy + 0.37, CZ + 0.0], yaw);
    // kill-mark decal
    decal(killMarks, 0.4, 0.25, [s * 0.485, hy + 0.2, CZ - 0.02], [s, 0, 0], yaw);
    // glyph plate
    decal(glyph, 0.12, 0.12, [s * 0.485, hy + 0.12, CZ + 0.38], [s, 0, 0], yaw);
    // smoke dischargers
    box([0.1, 0.06, 0.42], P.hullDark, [s * 0.54, hy + 0.3, CZ - 0.2], yaw);
    for (let i = 0; i < 3; i++) {
      const z = CZ - 0.36 + i * 0.14;
      cyl(0.04, 0.04, 0.16, 6, P.olive, [s * 0.58, hy + 0.38, z], [s * 0.5, 0.9, 0], yaw);
      cyl(0.02, 0.02, 0.02, 6, P.hullDark, [s * 0.63, hy + 0.46, z], [s * 0.5, 0.9, 0], yaw);
    }
  }
  // rear bustle with vents
  box([0.8, 0.28, 0.2], hullPaint, [0, hy + 0.2, CZ - 0.5], yaw);
  box([0.84, 0.03, 0.22], P.trim, [0, hy + 0.35, CZ - 0.5], yaw);
  for (let i = 0; i < 4; i++) glow(box([0.5, 0.015, 0.012], P.neonOrange, [0, hy + 0.1 + i * 0.045, CZ - 0.605], yaw), 1.3);
  // top plate + trim ridge
  box([0.7, 0.03, 0.9], hullPaint, [0, hy + 0.415, CZ + 0.0], yaw);
  for (const s of [1, -1]) box([0.04, 0.045, 0.9], P.trim, [s * 0.33, hy + 0.44, CZ], yaw);
  // hatch
  cyl(0.16, 0.14, 0.05, 8, P.hullLight, [0.12, hy + 0.46, CZ - 0.12], [0, 1, 0], yaw);
  cyl(0.17, 0.17, 0.015, 8, P.trim, [0.12, hy + 0.44, CZ - 0.12], [0, 1, 0], yaw);
  box([0.05, 0.03, 0.05], P.rim, [0.12, hy + 0.5, CZ - 0.12], yaw);
  // barcode plate on top
  decal(barcode, 0.16, 0.08, [-0.15, hy + 0.435, CZ + 0.15], [0, 1, 0], yaw, [0, 0, 1]);

  // ---------- ammo feed box (left side, rides yaw) ----------
  const ax = 0.68;
  box([0.22, 0.28, 0.5], P.olive, [ax, hy + 0.22, CZ + 0.2], yaw);
  box([0.24, 0.03, 0.52], P.trim, [ax, hy + 0.37, CZ + 0.2], yaw);
  decal(barcode, 0.2, 0.1, [ax + 0.112, hy + 0.22, CZ + 0.2], [1, 0, 0], yaw);
  for (let i = 0; i < 5; i++) {
    cyl(0.025, 0.025, 0.1, 6, BRASS, [ax, hy + 0.43, CZ + 0.02 + i * 0.09], [0, 1, 0], yaw);
    cyl(0.0, 0.025, 0.04, 6, P.warnRed, [ax, hy + 0.5, CZ + 0.02 + i * 0.09], [0, 1, 0], yaw);
  }
  box([0.12, 0.1, 0.12], P.hullDark, [ax - 0.12, hy + 0.2, CZ + 0.5], yaw);

  // ---------- gun (rides pitch) ----------
  const GZ = 0.55;
  // mantlet and cradle
  box([0.62, 0.3, 0.2], hullPaint, [0, GY, GZ + 0.45], pitch);
  box([0.64, 0.03, 0.22], P.trim, [0, GY + 0.16, GZ + 0.45], pitch);
  box([0.1, 0.1, 0.12], P.hullDark, [0, GY, GZ + 0.58], pitch);
  // trunnion pins
  for (const s of [1, -1]) cyl(0.06, 0.06, 0.1, 8, P.steel, [s * 0.34, GY, GZ], [1, 0, 0], pitch);
  // feed belt from ammo box to the breech
  const belt = [
    [ax - 0.12, hy + 0.3, CZ + 0.5],
    [0.4, GY - 0.05, GZ + 0.5],
    [0.2, GY, GZ + 0.55],
  ];
  b.sweep(belt, 0.02, { color: P.hullDark, bone: pitch, sides: 6 });
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    box([0.04, 0.04, 0.05], BRASS, [belt[0][0] + (belt[2][0] - belt[0][0]) * t, belt[0][1] + (belt[2][1] - belt[0][1]) * t + 0.03, belt[0][2] + (belt[2][2] - belt[0][2]) * t - 0.02 * t], pitch);
  }
  // twin barrels
  for (const s of [1, -1]) {
    const x = s * 0.17;
    b.rod([x, GY, GZ + 0.55], [x, GY, 1.82], 0.042, P.steel, { bone: pitch, sides: 8 });
    // heat-shield sleeve with vent ribs
    b.rod([x, GY, 0.95], [x, GY, 1.4], 0.07, steelPaint, { bone: pitch, sides: 8 });
    for (let i = 0; i < 4; i++) cyl(0.082, 0.082, 0.025, 8, P.hullDark, [x, GY, 1.0 + i * 0.11], [0, 0, 1], pitch);
    // muzzle brake
    cyl(0.075, 0.075, 0.14, 6, P.hullDark, [x, GY, 1.77], [0, 0, 1], pitch);
    cyl(0.08, 0.08, 0.02, 6, P.trim, [x, GY, 1.7], [0, 0, 1], pitch);
    box([0.02, 0.1, 0.1], P.hullLight, [x, GY, 1.78], pitch);
    // glowing orange tip
    glow(cyl(0.035, 0.035, 0.03, 8, P.neonOrange, [x, GY, 1.865], [0, 0, 1], pitch), 1.6);
    glow(cyl(0.05, 0.05, 0.02, 8, P.neonOrange, [x, GY, 1.83], [0, 0, 1], pitch), 0.9);
  }
  // coax bar between barrels
  box([0.34, 0.04, 0.05], P.trim, [0, GY, 1.0], pitch);
  box([0.3, 0.03, 0.04], P.trim, [0, GY, 1.4], pitch);

  // ---------- sensor head (right side, pitch) ----------
  const sx = -0.52;
  box([0.1, 0.05, 0.3], P.hullDark, [-0.42, GY - 0.02, GZ + 0.35], pitch);
  box([0.22, 0.2, 0.3], hullPaint, [sx - 0.0, GY + 0.0, GZ + 0.5], pitch);
  box([0.24, 0.025, 0.32], P.trim, [sx, GY + 0.11, GZ + 0.5], pitch);
  cyl(0.085, 0.085, 0.08, 10, P.hullDark, [sx, GY, GZ + 0.7], [0, 0, 1], pitch);
  glow(decal(lensEye, 0.15, 0.15, [sx, GY, GZ + 0.745], [0, 0, 1], pitch), 1.5);
  // visor hood
  box([0.2, 0.03, 0.1], P.hullDark, [sx, GY + 0.1, GZ + 0.72], pitch);
  // laser rangefinder slits
  for (const s of [1, -1]) glow(box([0.03, 0.03, 0.02], P.neonCyan, [sx + s * 0.075, GY - 0.075, GZ + 0.655], pitch), 1.3);

  // ---------- antenna and comms dish (yaw) ----------
  b.rod([0.4, hy + 0.4, CZ - 0.4], [0.43, 3.1, CZ - 0.52], [0.012, 0.006], P.steel, { bone: yaw, sides: 6 });
  glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), P.neonMagenta, { bone: yaw, at: [0.43, 3.1, CZ - 0.52] }), 1.5);
  box([0.06, 0.04, 0.06], P.hullDark, [0.4, hy + 0.42, CZ - 0.4], yaw);
  // dish
  cyl(0.015, 0.015, 0.14, 6, P.steel, [-0.28, hy + 0.48, CZ - 0.36], [0, 1, 0], yaw);
  b.lathe([[0, 0], [0.12, 0.045], [0.115, 0.055], [0, 0.015]], {
    at: [-0.28, 3.0, CZ - 0.36],
    axis: [-0.25, 1, 0.5],
    segments: 8,
    bone: yaw,
    color: P.white,
  });
  cyl(0.008, 0.008, 0.08, 4, P.steel, [-0.29, 3.03, CZ - 0.33], [-0.25, 1, 0.5], yaw);
  glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), P.neonCyan, { bone: yaw, at: [-0.3, 3.08, CZ - 0.31] }), 1.4);

  // ---------- neon accent strips on front of housing ----------
  for (const s of [1, -1]) glow(box([0.025, 0.02, 0.5], P.neonCyan, [s * 0.46, hy + 0.07, CZ + 0.05], yaw, {}), 1.2);
  glow(box([0.5, 0.015, 0.015], P.neonMagenta, [0, hy + 0.405, CZ + 0.46], yaw), 1.2);
}
    return buildTurret;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhoundMx77" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.2,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.2,0.62,2.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.2,0.62,2.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.2,0.62,-0.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.2,0.62,-0.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.2,0.62,-2.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.2,0.62,-2.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.45,0.35], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,2.95,0.55], dir: [0,0,1], role: "hinge", group: "turret" });
  J["tailgate"] = b.joint("tailgate", { parent: J["body"], at: [0,1.3,-4], dir: [1,0,0], role: "hinge", group: "bed" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
