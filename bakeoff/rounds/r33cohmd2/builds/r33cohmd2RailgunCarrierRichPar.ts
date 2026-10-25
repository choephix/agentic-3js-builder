import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, mix, smoothstep, rng, stripes, countershade } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { coil } from "../../../../kits/clockwork";

export const meta = {
  "name": "Longspear Railgun Carrier",
  "description": "A six-wheeled low-poly sci-fi military carrier with a long electromagnetic railgun on a rotating turret, braced on four deployed hydraulic stabiliser legs."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#4b5240",
  hullDark: "#2f3429",
  hullLight: "#6a7357",
  gunmetal: "#363b44",
  steel: "#8a929e",
  tyre: "#1c1d20",
  hub: "#5a606b",
  hazard: "#e7b814",
  stencil: "#e9e6da",
  neonCyan: "#2ff3ff",
  glass: "#14424d",
  redLamp: "#ff3b2f",
  rubber: "#26272b",
};
const M = {
  chassisTop: [0, 1.7, 0] as [number, number, number],
  cabRoof: [0, 2.35, 3] as [number, number, number],
  turretRing: [0, 2, -1.4] as [number, number, number],
  gunPivot: [0, 2.9, -1] as [number, number, number],
  muzzle: [0, 2.9, 4.6] as [number, number, number],
  axleFront: [0, 0.65, 3] as [number, number, number],
  axleMid: [0, 0.65, 0.4] as [number, number, number],
  axleRear: [0, 0.65, -2.2] as [number, number, number],
  legMountFL: [1.7, 1.2, 1.6] as [number, number, number],
  legMountFR: [-1.7, 1.2, 1.6] as [number, number, number],
  legMountRL: [1.7, 1.2, -2.6] as [number, number, number],
  legMountRR: [-1.7, 1.2, -2.6] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // hull
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildHull({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(7);

  // ---------- paints ----------
  const hullPaint = paint((p, n) => {
    let c: any = mix(P.hull, P.hullLight, smoothstep(0.4, 1, n.y) * 0.6);
    c = mix(c, P.hullDark, (1 - smoothstep(-0.8, 0.2, n.y)) * 0.5);
    // soot at the rear
    c = mix(c, "#15160f", smoothstep(-3.2, -4.5, p.z) * 0.55 * noise(p, 0.3, 3));
    // mottled wear
    c = mix(c, P.hullDark, smoothstep(0.62, 0.8, noise(p, 0.35, 5)) * 0.35);
    // panel seams
    const sx = Math.abs(((p.z + 10) % 1.1) - 0.55);
    const sy = Math.abs(((p.y * 3 + 10) % 1.5) - 0.75);
    if (Math.abs(n.x) > 0.7 && (sx > 0.52 || (sy > 0.72 && p.y > 1.0))) c = mix(c, "#171a12", 0.8);
    if (n.y > 0.7 && Math.abs(((p.z + 10) % 1.4) - 0.7) > 0.67) c = mix(c, "#171a12", 0.8);
    return c;
  });
  const plate = paint((p, n) =>
    mix(mix(P.hull, P.hullLight, smoothstep(0.3, 1, n.y) * 0.5), P.hullDark, smoothstep(0.6, 0.8, noise(p, 0.25, 9)) * 0.4),
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, ...opts });

  // ---------- main hull body: chamfered loft ----------
  b.loft(
    [
      { at: [0, 1.45, -4.35], w: 3.7, h: 1.0 },
      { at: [0, 1.45, -3.0], w: 4.0, h: 1.1 },
      { at: [0, 1.45, 0.5], w: 4.1, h: 1.1 },
      { at: [0, 1.4, 1.8], w: 3.8, h: 1.0 },
      { at: [0, 1.32, 2.1], w: 3.2, h: 0.82 },
    ],
    { bone, color: hullPaint, name: "hullBody", detail: 0.6 },
  );
  // sloped nose wedge
  b.extrude(
    [
      [0, 0.95],
      [0.75, 0.95],
      [0.75, 1.5],
      [0, 1.95],
    ],
    { at: [0, 0, 1.45], x: [0, 0, 1], y: [0, 1, 0], thickness: [3.4, 3.4], color: hullPaint, bone, name: "hullNose" },
  );
  // upper deck (flat rear deck) chamfered
  box(3.5, 0.12, 5.2, plate, [0, 2.0, -1.85], { name: "hullDeck" });
  box(3.7, 0.1, 5.3, P.hullDark, [0, 1.93, -1.85]);
  // underbelly
  box(3.0, 0.2, 6.2, P.gunmetal, [0, 0.95, -1.2]);

  // ---------- side skirts over wheel arches ----------
  for (const s of [1, -1]) {
    for (const z of [3.0, 0.4, -2.2]) {
      // arch shroud: slanted skirt on top of wheel
      b.part(new THREE.BoxGeometry(0.5, 0.1, 1.5), P.hullDark, { bone, at: [s * 2.15, 1.38, z], name: "hullFender" });
      b.part(new THREE.BoxGeometry(0.1, 0.5, 1.5), P.hullDark, { bone, at: [s * 2.38, 1.12, z] });
    }
    // fuel tank per flank
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 1.5, 10), P.hazard, {
      bone,
      at: [s * 2.35, 1.5, -1.0],
      dir: [0, 0, 1],
      name: "hullFuelTank",
    });
    for (const z of [-1.55, -0.45])
      b.part(new THREE.BoxGeometry(0.1, 0.5, 0.1), P.gunmetal, { bone, at: [s * 2.3, 1.5, z] });
    box(0.06, 0.56, 0.12, P.gunmetal, [s * 2.4, 1.5, -1.7]);
    box(0.06, 0.56, 0.12, P.gunmetal, [s * 2.4, 1.5, -0.3]);
    cyl(0.12, 0.12, 0.08, 8, P.steel, [s * 2.35, 1.82, -1.0]);

    // side armour plates with bolts
    for (let i = 0; i < 3; i++) {
      const z = [1.55, -2.0, -3.35][i];
      const w = i === 0 ? 1.0 : 1.2;
      b.part(new THREE.BoxGeometry(0.12, 0.62, w), plate, { bone, at: [s * 2.1, 1.65, z], name: "hullPlate" });
      for (const dz of [-1, 1])
        for (const dy of [-1, 1])
          cyl(0.05, 0.05, 0.05, 6, P.steel, [s * 2.18, 1.65 + dy * 0.22, z + dz * (w / 2 - 0.12)], {
            dir: [s, 0, 0],
          });
    }
  }

  // ---------- rivet rows (merged) ----------
  const rivets: THREE.BufferGeometry[] = [];
  const addRivet = (x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
    const g = new THREE.SphereGeometry(0.035, 5, 3);
    g.translate(x + nx * 0.02, y + ny * 0.02, z + nz * 0.02);
    rivets.push(g);
  };
  for (let i = 0; i < 18; i++) {
    const z = -4.2 + i * 0.37;
    addRivet(2.07, 1.98, z, 1, 0, 0);
    addRivet(-2.07, 1.98, z, -1, 0, 0);
  }
  for (let i = 0; i < 9; i++) {
    const x = -1.6 + i * 0.4;
    addRivet(x, 2.06, -4.35, 0, 1, 0);
    addRivet(x, 2.06, 0.6, 0, 1, 0);
  }
  b.part(mergeGeo(rivets), P.steel, { bone, at: [0, 0, 0], name: "hullRivets" });

  // ---------- turret ring ----------
  const [tx, ty, tz] = M.turretRing;
  b.lathe(
    [
      [0, 0],
      [1.25, 0],
      [1.25, 0.12],
      [1.05, 0.2],
      [1.05, 0.0],
      [0, 0.0],
    ],
    { at: [tx, 1.98, tz], bone, color: P.hullDark, segments: 16, name: "hullCollar" },
  );
  b.lathe(
    [
      [0.88, 0],
      [1.08, 0],
      [1.08, 0.1],
      [0.88, 0.1],
    ],
    { at: [tx, 2.08, tz], bone, color: P.gunmetal, segments: 16, name: "hullBearing" },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.22, 0.03, 0.08), i % 2 ? P.hazard : P.hullDark, {
      bone,
      at: [tx + Math.sin(a) * 1.17, 2.12, tz + Math.cos(a) * 1.17],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }

  // ---------- stabiliser leg sockets ----------
  for (const k of ["FL", "FR", "RL", "RR"]) {
    const [x, y, z] = M["legMount" + k];
    const s = Math.sign(x);
    box(0.75, 0.7, 0.9, P.hullDark, [x - s * 0.15, y, z], { name: "hullSocket" + k });
    box(0.2, 0.5, 0.7, P.gunmetal, [x + s * 0.24, y - 0.02, z], { name: "hullBay" + k });
    box(0.05, 0.3, 0.5, P.hazard, [x + s * 0.36, y + 0.04, z]);
    cyl(0.1, 0.1, 0.1, 8, P.steel, [x + s * 0.32, y - 0.28, z + 0.3], { dir: [s, 0, 0] });
    cyl(0.1, 0.1, 0.1, 8, P.steel, [x + s * 0.32, y - 0.28, z - 0.3], { dir: [s, 0, 0] });
  }

  // ---------- hazard rear edge ----------
  const hazTex = svg(
    `<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="8" fill="#e7b814"/>${Array.from(
      { length: 9 },
      (_, i) => `<polygon points="${i * 8 - 4},8 ${i * 8},0 ${i * 8 + 4},0 ${i * 8},8" fill="#1a1a1a"/>`,
    ).join("")}</svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(3.7, 0.25), "#ffffff", {
    bone,
    at: [0, 1.88, -4.52],
    dir: [0, 0, -1],
    axis: "z",
    texture: hazTex,
    name: "hullHazardRear",
  });
  b.part(new THREE.PlaneGeometry(3.4, 0.2), "#ffffff", {
    bone,
    at: [0, 1.45, -4.52],
    dir: [0, 0, -1],
    axis: "z",
    texture: hazTex,
  });

  // ---------- rear ramp ----------
  b.part(new THREE.BoxGeometry(2.4, 0.08, 0.9), P.hullDark, {
    bone,
    at: [0, 1.25, -4.85],
    rotation: [-25, 0, 0],
    name: "hullRamp",
  });
  for (const x of [-1, 0, 1])
    box(0.06, 0.05, 0.8, P.steel, [x * 0.7, 1.28, -4.85], { rotation: [-25, 0, 0] });
  box(2.6, 0.9, 0.1, P.hullDark, [0, 1.45, -4.55], { name: "hullRearDoor" });
  box(2.3, 0.7, 0.04, P.hull, [0, 1.45, -4.6]);

  // ---------- lamps ----------
  for (const s of [1, -1]) {
    glow(box(0.3, 0.2, 0.08, P.redLamp, [s * 1.5, 1.8, -4.55], { name: "hullLamp" }), 1.6);
    box(0.38, 0.28, 0.05, P.gunmetal, [s * 1.5, 1.8, -4.52]);
    glow(box(0.14, 0.1, 0.08, P.neonCyan, [s * 1.0, 1.25, -4.6]), 1.2);
    // tow hooks
    b.sweep(
      [
        [s * 0.9, 1.1, -4.55],
        [s * 0.9, 1.0, -4.8],
        [s * 0.9, 0.85, -4.9],
        [s * 0.9, 0.78, -4.75],
      ],
      0.045,
      { bone, color: P.steel, name: "hullTowHook" },
    );
    cyl(0.1, 0.1, 0.18, 8, P.gunmetal, [s * 0.9, 1.1, -4.5], { dir: [0, 0, 1] });
    // front hooks
    b.sweep(
      [
        [s * 1.0, 1.0, 2.2],
        [s * 1.0, 0.95, 2.45],
        [s * 1.0, 0.8, 2.55],
      ],
      0.04,
      { bone, color: P.steel },
    );
  }

  // ---------- stencils ----------
  const num = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><text x="32" y="33" text-anchor="middle" font-family="Impact, sans-serif" font-weight="bold" font-size="38" fill="#e9e6da">07</text></svg>`,
    { size: 256 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="28" fill="none" stroke="#e9e6da" stroke-width="4"/><path d="M32 8 L40 50 L32 42 L24 50Z" fill="#e9e6da"/><path d="M12 36 H52" stroke="#e9e6da" stroke-width="3"/></svg>`,
    { size: 192 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.9, 0.56), "#ffffff", {
      bone,
      at: [s * 2.172, 1.5, -3.0],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: num,
      name: "hullNumber",
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
      bone,
      at: [s * 2.172, 1.72, 1.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: emblem,
      name: "hullEmblem",
    });
  }
  b.part(new THREE.PlaneGeometry(1.0, 0.62), "#ffffff", {
    bone,
    at: [0, 2.065, -3.6],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: num,
    name: "hullRoofNum",
  });

  // ---------- roof details ----------
  box(0.8, 0.12, 0.6, P.gunmetal, [-1.2, 2.1, -3.5], { name: "hullHatchPanel" });
  box(0.7, 0.1, 0.5, P.hazard, [-1.2, 2.08, -3.5]);
  box(0.6, 0.14, 0.4, P.gunmetal, [-1.2, 2.14, -3.5]);
  for (const s of [1, -1]) {
    box(0.5, 0.14, 0.9, P.hullDark, [s * 1.35, 2.1, -0.2]);
    for (let i = 0; i < 4; i++) box(0.4, 0.03, 0.05, P.gunmetal, [s * 1.35, 2.18, -0.5 + i * 0.2]);
  }
  glow(box(0.3, 0.05, 0.05, P.neonCyan, [1.2, 2.08, -3.5]), 1.3);
}

function mergeGeo(list: THREE.BufferGeometry[]) {
  let n = 0,
    ni = 0;
  for (const g of list) {
    n += g.getAttribute("position").count;
    ni += g.index!.count;
  }
  const pos = new Float32Array(n * 3),
    nor = new Float32Array(n * 3),
    uv = new Float32Array(n * 2),
    idx: number[] = [];
  let o = 0;
  for (const g of list) {
    const p = g.getAttribute("position"),
      nn = g.getAttribute("normal"),
      u = g.getAttribute("uv");
    pos.set(p.array as any, o * 3);
    nor.set(nn.array as any, o * 3);
    uv.set(u.array as any, o * 2);
    for (let i = 0; i < g.index!.count; i++) idx.push(g.index!.getX(i) + o);
    o += p.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  m.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  m.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  m.setIndex(idx);
  return m;
}
    return buildHull;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: any) {
  const bone = J.cab;
  const R = rng(11);

  // own colours (max 6)
  const CHROME = "#c9d1da";
  const LAMP = "#e6ffff";
  const DARKVENT = "#15171b";

  // paints
  const hullPaint = paint((p, n) => {
    let c: any = P.hull;
    const k = noise(p, 0.5, 3);
    c = mix(P.hull, P.hullDark, 0.25 * k);
    if (n.y > 0.6) c = mix(c, P.hullLight, 0.5);
    if (n.y < -0.3) c = mix(c, P.hullDark, 0.5);
    // panel seams
    const sx = ((p.x + 5) % 0.9 + 0.9) % 0.9;
    const sz = ((p.z + 5) % 0.75 + 0.75) % 0.75;
    if (Math.abs(n.y) > 0.6 && (sx < 0.02 || sz < 0.02)) c = mix(c, P.hullDark, 0.8);
    if (Math.abs(n.x) > 0.6 && (sz < 0.02 || ((p.y * 10) % 8 + 8) % 8 < 0.2)) c = mix(c, P.hullDark, 0.8);
    return c;
  });
  const hazardPaint = paint((p) => (Math.floor((p.x + p.y + p.z) / 0.1) % 2 === 0 ? P.hazard : P.hullDark));

  // textures
  const visorTex = svg(
    `<svg viewBox="0 0 128 48"><rect width="128" height="48" fill="#14424d"/>
    <path d="M6 10H50M6 16H34M78 10H122M94 16H122" stroke="#2ff3ff" stroke-width="2.5" fill="none"/>
    <circle cx="64" cy="26" r="11" fill="none" stroke="#2ff3ff" stroke-width="2.5"/>
    <path d="M64 12V40M50 26H78" stroke="#2ff3ff" stroke-width="1.8"/>
    <path d="M8 40H40L46 34H100L106 40H122" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    <path d="M0 0L40 0L0 20Z" fill="#ffffff" opacity="0.15"/></svg>`,
    { size: 256 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#e9e6da" stroke-width="4"/>
    <path d="M32 10L44 40L32 34L20 40Z" fill="#e9e6da"/><rect x="14" y="46" width="36" height="5" fill="#e9e6da"/>
    <text x="32" y="60" font-size="8" text-anchor="middle" fill="#e9e6da" font-family="sans-serif">LS-3</text></svg>`,
    { size: 128 },
  );
  const numTex = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="26" font-size="28" font-weight="bold" text-anchor="middle" fill="#e9e6da" font-family="sans-serif">07</text></svg>`,
    { size: 128 },
  );
  const radarTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#8a929e"/><circle cx="16" cy="16" r="10" fill="none" stroke="#363b44" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="#363b44"/></svg>`,
    { size: 64 },
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });

  // ---- main body: faceted wedge via extrude (side profile in z,y)
  const profile: any = [
    [0, 1.0],
    [2.3, 1.0],
    [2.3, 2.2],
    [1.55, 2.62],
    [0.6, 2.62],
    [0.2, 2.2],
  ];
  // x axis = +z, y up ; thickness along x
  const shell = b.extrude(profile.map((q: number[]) => [q[0], q[1], "sharp"]), {
    at: [-1.75, 0, 2.2],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 3.5,
    bevel: 0.05,
    color: hullPaint,
    bone,
  });
  // nose lower chamfer plate
  box(3.4, 0.5, 0.2, P.hullDark, [0, 1.25, 4.5]);
  // underside
  box(3.3, 0.15, 2.2, P.gunmetal, [0, 0.98, 3.3]);

  // ---- visor (slanted, front-top)
  const visorGeo = new THREE.PlaneGeometry(2.7, 0.62);
  const vy0 = 2.2, vz0 = 3.8, vy1 = 2.62, vz1 = 3.0;
  const vmid = [0, (vy0 + vy1) / 2 + 0.02, (vz0 + vz1) / 2 + 0.03];
  const nrm = [0, (vz0 - vz1), (vy1 - vy0)]; // outward normal of slope
  const visor = b.part(visorGeo, "#ffffff", {
    bone, at: vmid, dir: nrm, axis: "z", texture: visorTex, up: [0, 1, 0.2],
  });
  glow(visor, 1.1);
  // visor frame
  box(2.85, 0.07, 0.1, P.gunmetal, [0, 2.63, 3.0]);
  box(2.85, 0.07, 0.1, P.gunmetal, [0, 2.2, 3.82]);
  for (const s of [1, -1]) {
    b.rod([s * 1.38, 2.2, 3.83], [s * 1.38, 2.63, 3.0], 0.05, P.gunmetal, { bone });
  }
  // wiper
  b.rod([0.5, 2.24, 3.77], [-0.3, 2.5, 3.2], 0.015, P.hullDark, { bone });

  // ---- side hatches with hazard trim, vent, emblem
  for (const s of [1, -1]) {
    const x = s * 1.78;
    box(0.08, 1.0, 1.1, P.hullLight, [x, 1.75, 3.15]);
    box(0.1, 0.06, 1.2, hazardPaint, [x + s * 0.01, 2.27, 3.15]);
    box(0.1, 0.06, 1.2, hazardPaint, [x + s * 0.01, 1.23, 3.15]);
    box(0.1, 1.0, 0.06, hazardPaint, [x + s * 0.01, 1.75, 2.58]);
    box(0.1, 1.0, 0.06, hazardPaint, [x + s * 0.01, 1.75, 3.72]);
    // handle & hinges
    box(0.1, 0.07, 0.25, CHROME, [x + s * 0.06, 1.7, 3.5]);
    for (const hy of [2.05, 1.45]) box(0.1, 0.18, 0.08, P.gunmetal, [x + s * 0.04, hy, 2.64]);
    // porthole window
    const win = b.part(new THREE.PlaneGeometry(0.6, 0.35), P.glass, { bone, at: [x + s * 0.045, 2.0, 3.2], dir: [s, 0, 0], axis: "z" });
    glow(win, 0.4);
    // bolts
    for (const bz of [2.7, 3.6]) for (const by of [1.35, 2.15]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.steel, { bone, at: [x + s * 0.05, by, bz], dir: [s, 0, 0] });
    }
    // emblem on door (left side) / number on right
    b.part(new THREE.PlaneGeometry(0.42, 0.42), "#ffffff", {
      bone, at: [x + s * 0.05, 1.6, 3.0], dir: [s, 0, 0], axis: "z", texture: emblem,
    });
    // vent grille on rear flank
    box(0.06, 0.4, 0.5, DARKVENT, [x + s * 0.02, 1.5, 2.45 + 0.0]);
    for (let i = 0; i < 4; i++) box(0.08, 0.025, 0.46, P.gunmetal, [x + s * 0.03, 1.38 + i * 0.09, 2.45]);
    // wing mirror
    b.rod([s * 1.78, 2.35, 3.7], [s * 2.05, 2.5, 3.8], 0.025, P.gunmetal, { bone });
    box(0.06, 0.26, 0.2, P.gunmetal, [s * 2.08, 2.5, 3.8]);
    box(0.02, 0.22, 0.16, CHROME, [s * 2.08 - s * 0.035, 2.5, 3.8]);
  }
  // number decal on roof slope
  b.part(new THREE.PlaneGeometry(0.8, 0.4), "#ffffff", {
    bone, at: [0.9, 2.64, 2.4], dir: [0, 1, 0], axis: "z", texture: numTex, up: [0, 0, 1],
  });

  // ---- roof: hazard strip and sensor mast
  box(3.3, 0.04, 0.12, hazardPaint, [0, 2.64, 2.3]);
  box(0.9, 0.12, 0.7, P.gunmetal, [-0.9, 2.66, 2.7]);
  const mastBase = [0.9, 2.62, 2.7];
  b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.1, 8), P.gunmetal, { bone, at: [0.9, 2.66, 2.7] });
  b.rod([0.9, 2.7, 2.7], [0.9, 3.25, 2.7], 0.04, P.steel, { bone });
  // radar dish
  const dish = b.lathe(
    [[0, 0], [0.16, 0.0], [0.28, 0.1], [0.26, 0.11], [0.14, 0.03], [0, 0.03]],
    { at: [0.9, 3.15, 2.78], axis: [0, 0.5, 1], bone, color: P.hub, segments: 10 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
    bone, at: [0.9, 3.15 + 0.07, 2.78 + 0.035], dir: [0, 0.5, 1], axis: "z", texture: radarTex,
  });
  b.rod([0.9, 3.15, 2.78], [0.9, 3.15 + 0.1, 2.78 + 0.2], 0.012, P.steel, { bone });
  // lamp on mast top
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonCyan, { bone, at: [0.9, 3.28, 2.7] }), 2);
  // antenna whip
  b.rod([-1.2, 2.7, 2.5], [-1.3, 3.5, 2.45], [0.02, 0.006], P.steel, { bone });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.redLamp, { bone, at: [-1.3, 3.5, 2.45] }), 2);
  // roof lights bar
  box(1.4, 0.09, 0.14, P.gunmetal, [0, 2.7, 3.05 - 0.02]);
  for (let i = -2; i <= 2; i++) glow(box(0.2, 0.06, 0.05, P.hazard, [i * 0.28, 2.7, 2.99]), 1.2);

  // ---- front: headlight cluster, grille, bumper, winch, tow bar
  for (const s of [1, -1]) {
    box(0.7, 0.34, 0.1, P.gunmetal, [s * 1.1, 1.78, 4.52]);
    glow(box(0.5, 0.22, 0.06, LAMP, [s * 1.1, 1.78, 4.58]), 1.6);
    for (let i = 0; i < 3; i++) {
      glow(b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 6), P.neonCyan, {
        bone, at: [s * 1.1 + (i - 1) * 0.15, 1.5, 4.55], dir: [0, 0, 1],
      }), 1.5);
    }
    // armour brow over light
    box(0.78, 0.07, 0.2, P.hullDark, [s * 1.1, 1.99, 4.55]);
    // bumper end bolts
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6), P.steel, { bone, at: [s * 1.55, 1.2, 4.7], dir: [0, 0, 1] });
  }
  // center vent grille
  box(0.9, 0.55, 0.08, DARKVENT, [0, 1.8, 4.53]);
  for (let i = 0; i < 6; i++) box(0.9, 0.03, 0.12, P.gunmetal, [0, 1.58 + i * 0.09, 4.56]);
  // front stencil
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    bone, at: [0, 2.08, 4.54], dir: [0, 0, 1], axis: "z", texture: numTex,
  });
  // bumper (wedge)
  box(3.7, 0.4, 0.45, P.gunmetal, [0, 1.15, 4.55]);
  box(3.7, 0.06, 0.47, hazardPaint, [0, 1.38, 4.56]);
  box(3.5, 0.12, 0.3, P.hullDark, [0, 0.95, 4.5], { rotation: [-20, 0, 0] });
  // tow bar
  b.rod([-0.55, 1.1, 4.7], [-0.55, 1.1, 5.0 - 0.45], 0.05, CHROME, { bone });
  b.rod([0.55, 1.1, 4.7], [0.55, 1.1, 4.55], 0.05, CHROME, { bone });
  const hook = b.sweep(
    [[ -0.55, 1.1, 4.78], [-0.55, 1.1, 4.95], [-0.55, 0.98, 5.0], [-0.55, 0.9, 4.9]],
    0.035, { bone, color: CHROME, sides: 6 },
  );
  b.sweep(
    [[0.55, 1.1, 4.7], [0.55, 1.1, 4.95], [0.55, 0.98, 5.0], [0.55, 0.9, 4.9]],
    0.035, { bone, color: CHROME, sides: 6 },
  );
  // winch drum
  const winch = b.part(new THREE.CylinderGeometry(0.14, 0.14, 1.3, 10), P.gunmetal, {
    bone, at: [0, 1.0, 4.75], dir: [1, 0, 0],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10), P.steel, { bone, at: [s * 0.65, 1.0, 4.75], dir: [1, 0, 0] });
    box(0.08, 0.3, 0.2, P.hullDark, [s * 0.72, 1.12, 4.7]);
  }
  b.sweep(
    [[0.6, 1.0, 4.9], [0.3, 1.0, 4.92], [0.0, 0.96, 4.9], [-0.3, 1.0, 4.92], [-0.6, 1.0, 4.9]],
    0.025, { bone, color: P.hullDark, sides: 6 },
  );
  // hazard fairing on hook of winch
  box(0.2, 0.2, 0.2, P.hazard, [0, 0.82, 4.95]);

  // ---- rivet rows on shell sides and roof
  const rivetGeo: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const z = 2.35 + i * 0.19;
    for (const s of [1, -1]) {
      rivetGeo.push(new THREE.SphereGeometry(0.025, 5, 3).translate(s * 1.78, 1.12, z));
    }
  }
  for (let i = 0; i < 9; i++) {
    for (const s of [1, -1]) rivetGeo.push(new THREE.SphereGeometry(0.025, 5, 3).translate(s * 1.5, 2.64, 2.3 + i * 0.03 + 0.0));
  }
  import_merge(rivetGeo, b, P.steel, bone);

  // rear face panel meets hull; small cable conduit
  box(0.2, 0.9, 0.12, P.gunmetal, [-1.5, 1.7, 2.26]);
  box(0.2, 0.9, 0.12, P.gunmetal, [1.5, 1.7, 2.26]);
  // fender flares over front wheels (arch lip)
  for (const s of [1, -1]) {
    box(0.5, 0.12, 1.5, P.hullDark, [s * 1.9, 1.0, 3.0]);
    box(0.1, 0.32, 1.5, P.hullDark, [s * 2.12, 0.84, 3.0]);
  }
  // red tail marker on top rear corners
  for (const s of [1, -1]) glow(box(0.12, 0.08, 0.08, P.redLamp, [s * 1.7, 2.1, 2.3]), 1.5);
}

function import_merge(geos: THREE.BufferGeometry[], b: any, color: any, bone: any) {
  const total = geos.length;
  // simple merge without extra imports
  let vc = 0, ic = 0;
  for (const g of geos) { vc += g.getAttribute("position").count; ic += g.index!.count; }
  const pos = new Float32Array(vc * 3), nor = new Float32Array(vc * 3), uv = new Float32Array(vc * 2);
  const idx = new Uint32Array(ic);
  let vo = 0, io = 0;
  for (const g of geos) {
    const p = g.getAttribute("position"), n = g.getAttribute("normal"), u = g.getAttribute("uv");
    pos.set(p.array as any, vo * 3); nor.set(n.array as any, vo * 3); uv.set(u.array as any, vo * 2);
    const ix = g.index!;
    for (let i = 0; i < ix.count; i++) idx[io + i] = ix.getX(i) + vo;
    vo += p.count; io += ix.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  m.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  m.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  m.setIndex(new THREE.BufferAttribute(idx, 1));
  if (total) b.part(m, color, { bone, at: [0, 0, 0] });
}
    return buildCab;
  })(),
  // runningGear
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildRunningGear({ b, J, P, M }: Ctx) {
  const R = 0.65;
  const W = 0.5;
  const rand = rng(11);

  // Paints
  const tyrePaint = paint((p, n) => {
    const w = noise(p, 0.25, 3);
    const base = mix("#1c1d20", "#2c2d31", w);
    const dust = smoothstep(0.35, 0.0, p.y) * 0.35;
    return mix(base, "#5a5346", dust);
  });
  const gunPaint = paint((p, n) => {
    const w = noise(p, 0.18, 5);
    const c = mix("#2c3039", "#454b56", w);
    return mix(c, "#6a707b", smoothstep(0.6, 1, n.y) * 0.4);
  });
  const mudPaint = paint((p) => mix("#1f2023", "#3a372f", smoothstep(0.1, 0.5, noise(p, 0.12, 8))));

  // Hubcap stencil ring texture
  const cap = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#5a606b" stroke="#1a1c20" stroke-width="3"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#e9e6da" stroke-width="3" stroke-dasharray="7 4"/>
    <circle cx="32" cy="32" r="9" fill="#363b44" stroke="#1a1c20" stroke-width="2"/>
    <circle cx="32" cy="32" r="3" fill="#8a929e"/></svg>`,
    { size: 128 },
  );
  const discTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#23262c"/>
    <circle cx="32" cy="32" r="24" fill="none" stroke="#3d424c" stroke-width="2"/>
    <circle cx="32" cy="32" r="14" fill="none" stroke="#3d424c" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["FL", 1, 3.0], ["FR", -1, 3.0], ["ML", 1, 0.4], ["MR", -1, 0.4], ["RL", 1, -2.2], ["RR", -1, -2.2],
  ];

  // Tread block geometry merged per tyre is expensive; use per-wheel blocks
  for (const [id, s, z] of wheels) {
    const joint = J["wheel" + id];
    const cx = s * 1.9;
    const c = new THREE.Vector3(cx, R, z);
    const ax: [number, number, number] = [s, 0, 0];
    // tyre: lathe profile around the axle, 12 sides
    b.lathe(
      [
        [0, -W / 2], [R - 0.12, -W / 2], [R - 0.03, -W / 2 + 0.06], [R, -W / 2 + 0.14],
        [R, W / 2 - 0.14], [R - 0.03, W / 2 - 0.06], [R - 0.12, W / 2], [0, W / 2],
      ],
      { at: c, axis: ax, segments: 12, bone: joint, color: tyrePaint, name: "tyre" + id },
    );
    // tread blocks
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      const pos = new THREE.Vector3(cx, R + Math.sin(a) * (R + 0.02), z + Math.cos(a) * (R + 0.02));
      const radial: [number, number, number] = [0, Math.sin(a), Math.cos(a)];
      b.part(new THREE.BoxGeometry(W * 0.78, 0.06, 0.2), P.rubber, {
        bone: joint, at: pos, dir: radial, axis: "y", up: ax, name: "tread" + id,
      });
    }
    // inner dark disc and hub
    const outer = c.clone().add(new THREE.Vector3(s * (W / 2 - 0.02), 0, 0));
    b.part(new THREE.CylinderGeometry(R - 0.14, R - 0.14, 0.06, 12), P.gunmetal, {
      bone: joint, at: outer, dir: ax, name: "disc" + id,
    });
    b.part(new THREE.CircleGeometry(R - 0.16, 12), "#ffffff", {
      bone: joint, at: outer.clone().add(new THREE.Vector3(s * 0.035, 0, 0)), dir: ax, axis: "z",
      texture: discTex, name: "discTex" + id,
    });
    b.part(new THREE.CylinderGeometry(0.27, 0.3, 0.12, 10), P.hub, {
      bone: joint, at: outer.clone().add(new THREE.Vector3(s * 0.06, 0, 0)), dir: ax, name: "hub" + id,
    });
    b.part(new THREE.CircleGeometry(0.25, 12), "#ffffff", {
      bone: joint, at: outer.clone().add(new THREE.Vector3(s * 0.125, 0, 0)), dir: ax, axis: "z",
      texture: cap, name: "cap" + id,
    });
    // lug bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = outer.clone().add(new THREE.Vector3(s * 0.13, Math.sin(a) * 0.19, Math.cos(a) * 0.19));
      b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.06, 6), P.steel, {
        bone: joint, at: p, dir: ax, name: "lug" + id,
      });
    }
    // mud flap behind the wheel
    b.part(new THREE.BoxGeometry(0.44, 0.5, 0.05), mudPaint, {
      bone: J.body, at: [s * 1.9, 0.5, z - R - 0.1], name: "mud" + id,
    });
    b.part(new THREE.BoxGeometry(0.44, 0.05, 0.07), P.hazard, {
      bone: J.body, at: [s * 1.9, 0.76, z - R - 0.1], name: "mudTrim" + id,
    });
  }

  // Axles, differentials, suspension
  const axles: [number, number][] = [[3.0, 1], [0.4, 1], [-2.2, 1]];
  for (const [z] of axles) {
    b.rod([-1.72, R, z], [1.72, R, z], 0.1, gunPaint, { bone: J.body, sides: 8, name: "axle" });
    // differential housing
    b.part(new THREE.SphereGeometry(0.3, 8, 6), gunPaint, {
      bone: J.body, at: [0, R, z], scale: [1.1, 0.9, 1], name: "diff",
    });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 8), P.steel, {
      bone: J.body, at: [0, R, z + 0.3], dir: [0, 0, 1], name: "diffCap",
    });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, {
        bone: J.body, at: [Math.cos(a) * 0.2, R + Math.sin(a) * 0.2, z + 0.31], name: "diffBolt",
      });
    }
    for (const s of [1, -1]) {
      const x = s * 1.35;
      // lower control arm
      b.rod([s * 0.4, 0.5, z + 0.05], [s * 1.5, R - 0.05, z + 0.05], 0.05, P.gunmetal, { bone: J.body, sides: 6, name: "arm" });
      b.rod([s * 0.4, 0.5, z - 0.08], [s * 1.5, R - 0.05, z - 0.08], 0.05, P.gunmetal, { bone: J.body, sides: 6, name: "arm" });
      // coil spring + damper
      const top: [number, number, number] = [x, 1.25, z - 0.2];
      const bot: [number, number, number] = [x, R + 0.12, z - 0.2];
      b.sweep(coil(bot, top, 0.07, 7), 0.016, { bone: J.body, color: P.hazard, sides: 5, name: "spring" });
      b.rod(bot, [x, 1.0, z - 0.2], 0.03, P.steel, { bone: J.body, sides: 6, name: "piston" });
      b.rod([x, 1.0, z - 0.2], top, 0.045, P.gunmetal, { bone: J.body, sides: 6, name: "damper" });
      b.part(new THREE.BoxGeometry(0.2, 0.06, 0.2), P.gunmetal, { bone: J.body, at: [x, 1.27, z - 0.2], name: "mountTop" });
      b.part(new THREE.BoxGeometry(0.16, 0.08, 0.16), P.gunmetal, { bone: J.body, at: [x, R + 0.1, z - 0.2], name: "mountBot" });
      // hub-side axle collar
      b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 8), P.steel, {
        bone: J.body, at: [s * 1.62, R, z], dir: [s, 0, 0], name: "collar",
      });
    }
  }

  // Drive shaft along underbelly with universal joints
  b.rod([0, 0.6, 3.0], [0, 0.6, -2.2], 0.055, P.steel, { bone: J.body, sides: 8, name: "driveShaft" });
  for (const z of [2.0, 1.2, -0.7, -1.5]) {
    b.part(new THREE.BoxGeometry(0.14, 0.14, 0.14), P.gunmetal, { bone: J.body, at: [0, 0.6, z], rotation: [0, 0, 45], name: "uJoint" });
  }
  // transfer case and hazard guard
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.6), gunPaint, { bone: J.body, at: [0, 0.62, 0.4], name: "transfer" });
  b.part(new THREE.BoxGeometry(0.52, 0.04, 0.2), P.hazard, { bone: J.body, at: [0, 0.78, 0.4], name: "transferStripe" });
  // cross members
  for (const z of [1.7, -0.9]) {
    b.rod([-1.4, 0.95, z], [1.4, 0.95, z], 0.06, P.gunmetal, { bone: J.body, sides: 6, name: "crossmember" });
  }
  void rand;
  void M;
}
    return buildRunningGear;
  })(),
  // stabilisers
  (() => {
function buildStabilisers({ b, J, P, M }: Ctx) {
  const CHROME = "#d8dde6";
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // anti-slip tread drawing for the pad tops
  const TREAD = svg(
    `<svg viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#2a2d33"/>
      ${Array.from({ length: 8 }, (_, i) => `<path d="M4 ${i * 8 + 7} L32 ${i * 8 + 1} L60 ${i * 8 + 7}" stroke="#5a606b" stroke-width="2.4" fill="none"/>`).join("")}
      <rect x="1" y="1" width="62" height="62" fill="none" stroke="#1c1d20" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );

  const padOutline: [number, number, "sharp"][] = [];
  const h = 0.55;
  const c = 0.14;
  for (const [x, y] of [
    [-h + c, -h], [h - c, -h], [h, -h + c], [h, h - c],
    [h - c, h], [-h + c, h], [-h, h - c], [-h, -h + c],
  ])
    padOutline.push([x, y, "sharp"]);

  const legs: [string, number, number][] = [
    ["legFL", 1, 1.6],
    ["legFR", -1, 1.6],
    ["legRL", 1, -2.6],
    ["legRR", -1, -2.6],
  ];

  for (const [name, s, z] of legs) {
    const upper = J[name];
    const m = V(s * 1.7, 1.2, z);
    const e = V(s * 3.6, 0.2, z);
    const d = e.clone().sub(m).normalize();
    const k = m.clone().lerp(e, 0.5);
    const lower = b.joint(`stabilisers${name}Lower`, { parent: upper, at: k, aim: e, role: "leg", group: "stabilisers" });
    const along = (t: number) => m.clone().lerp(e, t);
    const sleeveEnd = along(0.58);
    const dArr: [number, number, number] = [d.x, d.y, d.z];

    // upper housing at the hull socket
    b.part(new THREE.BoxGeometry(0.64, 0.56, 0.66), P.gunmetal, { bone: upper, at: along(0.04), aim: d });
    b.part(new THREE.BoxGeometry(0.5, 0.1, 0.56), P.hullDark, { bone: upper, at: along(0.0), aim: d });
    // hydraulic bay plate and bolts on the housing's top
    b.part(new THREE.BoxGeometry(0.36, 0.06, 0.04), P.hullDark, { bone: upper, at: along(0.07).add(V(0, 0.22, 0.3 * 0 + 0.0)), aim: d });
    for (const dz of [-0.24, 0.24])
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6), P.steel, {
        bone: upper, at: V(m.x + s * 0.2, m.y + 0.31, m.z + dz),
      });

    // hazard sleeve
    b.rod(along(0.08), sleeveEnd, 0.16, stripes(P.hazard, P.hullDark, { size: 0.15, axis: dArr, width: 0.5, wobble: 0 }), {
      bone: upper, sides: 8,
    });
    b.rod(sleeveEnd, sleeveEnd.clone().addScaledVector(d, 0.06), 0.185, P.gunmetal, { bone: upper, sides: 8 });
    b.rod(along(0.08), along(0.08).addScaledVector(d, 0.05), 0.19, P.gunmetal, { bone: upper, sides: 8 });

    // chrome piston, riding the lower section
    b.rod(sleeveEnd.clone().addScaledVector(d, -0.25), e.clone().addScaledVector(d, -0.05), 0.075, CHROME, { bone: lower, sides: 8 });

    // two angled braces to the hull
    for (const dz of [-1, 1]) {
      const a = V(s * 1.95, 0.85, z + dz * 0.4);
      const bp = along(0.34).add(V(0, 0, dz * 0.1));
      b.rod(a, bp, 0.04, P.steel, { bone: upper, sides: 6 });
      b.part(new THREE.BoxGeometry(0.14, 0.14, 0.1), P.gunmetal, { bone: upper, at: a });
      b.part(new THREE.SphereGeometry(0.06, 6, 4), P.steel, { bone: upper, at: bp });
    }

    // hose with clamps
    const off = V(0, 0.12, 0.24);
    const hose = [0.02, 0.18, 0.34, 0.5, 0.6].map((t, i) => {
      const p = along(t).add(off);
      p.y -= i === 2 ? 0.05 : 0;
      p.z += i === 0 ? 0.0 : 0.0;
      return p.toArray() as [number, number, number];
    });
    b.sweep(hose, 0.03, { bone: upper, color: P.rubber, sides: 6 });
    for (const t of [0.18, 0.5])
      b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 8), P.steel, {
        bone: upper, at: along(t).add(off), aim: d,
      });

    // status lamp on the housing, facing up and out
    glow(
      b.part(new THREE.SphereGeometry(0.06, 6, 4), P.neonCyan, {
        bone: upper, at: V(m.x + s * 0.28, m.y + 0.3, m.z - 0.25),
      }),
      1.6,
    );

    // ball joint, collar and pad
    b.part(new THREE.SphereGeometry(0.14, 8, 6), P.gunmetal, { bone: lower, at: e });
    b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.1, 8), P.steel, { bone: lower, at: V(e.x, 0.15, e.z) });
    const pad = b.extrude(padOutline, {
      at: V(e.x, 0.05, e.z), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, bone: lower, color: P.hullDark,
    });
    void pad;
    // hazard rim bars on the top edge
    const hz = stripes(P.hazard, P.hullDark, { size: 0.12, axis: "x", width: 0.5, wobble: 0 });
    const hzz = stripes(P.hazard, P.hullDark, { size: 0.12, axis: "z", width: 0.5, wobble: 0 });
    for (const sg of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.76, 0.03, 0.07), hz, { bone: lower, at: V(e.x, 0.105, e.z + sg * 0.5) });
      b.part(new THREE.BoxGeometry(0.07, 0.03, 0.76), hzz, { bone: lower, at: V(e.x + sg * 0.5, 0.105, e.z) });
    }
    // tread plate
    b.part(new THREE.PlaneGeometry(0.88, 0.88), "#ffffff", {
      bone: lower, at: V(e.x, 0.108, e.z), dir: [0, 1, 0], axis: "z", texture: TREAD,
    });
    // corner bolts
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.045, 6), P.steel, {
          bone: lower, at: V(e.x + sx * 0.44, 0.12, e.z + sz * 0.44),
        });
  }
}
    return buildStabilisers;
  })(),
  // turretGun
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildTurretGun({ b, J, P, M }: Ctx) {
  const T = J.turret;
  const G = J.gun;
  const R = rng(11);

  // ---------- paints & textures ----------
  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 1, n.y) * 0.6);
    const m = mix(base, P.hullDark, 0.35 * smoothstep(0.5, 0.8, noise(p, 0.25, 3)));
    const seam = Math.abs(((p.z * 2.2) % 1)) < 0.015 || Math.abs(((p.x * 2.2) % 1)) < 0.015;
    return seam ? P.hullDark : m;
  });
  const gunPaint = paint((p, n) => {
    const m = mix(P.gunmetal, P.steel, 0.25 * smoothstep(0.4, 0.9, noise(p, 0.12, 5)) + 0.2 * Math.max(0, n.y));
    return m;
  });
  const hazardPaint = stripes(P.hazard, P.hullDark, { size: 0.16, axis: [1, 0, 1], width: 0.5, wobble: 0 });

  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#e9e6da" stroke-width="4"/>
    <path d="M32 8 L40 36 L32 30 L24 36Z" fill="#e9e6da"/><path d="M14 46 H50" stroke="#e9e6da" stroke-width="5"/>
    <text x="32" y="60" text-anchor="middle" font-size="12" font-family="sans-serif" font-weight="bold" fill="#e9e6da">07</text></svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e7b814"/><path d="M0 32 L16 0 H32 L16 32Z M32 32 L48 0 H64 L48 32Z" fill="#2f3429"/></svg>`,
    { size: 128 },
  );
  const channelTex = svg(
    `<svg viewBox="0 0 128 16"><rect width="128" height="16" fill="#0a5560"/><rect y="5" width="128" height="6" fill="#2ff3ff"/><path d="M0 8 H128" stroke="#ffffff" stroke-width="2" stroke-dasharray="10 6"/></svg>`,
    { size: 256 },
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], bone: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, flat: true, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], bone: any, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, flat: true, ...opts });

  // ---------- TURRET ----------
  const ty = M.turretRing[1];
  const tz = M.turretRing[2];
  // base ring (lathe)
  b.lathe(
    [
      [0, 0],
      [1.45, 0],
      [1.5, 0.05],
      [1.5, 0.16],
      [1.3, 0.2],
      [0, 0.2],
    ],
    { at: [0, ty, tz], bone: T, segments: 14, color: P.gunmetal },
  );
  // hazard dashes on ring
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box(0.2, 0.03, 0.08, P.hazard, [Math.sin(a) * 1.48, ty + 0.14, tz + Math.cos(a) * 1.48], T, {
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // wedge housing: extruded side profile (z along, y up)
  const prof: [number, number, string?][] = [
    [-1.55, 0],
    [1.2, 0],
    [1.5, 0.35],
    [1.2, 0.85],
    [-0.2, 1.0],
    [-1.55, 0.95],
  ];
  b.extrude(prof as any, {
    at: [0, ty + 0.2, tz],
    x: [0, 0, 1],
    thickness: 2.3,
    bevel: 0.07,
    bone: T,
    color: hullPaint,
  });
  // side armour plates + bolts
  for (const s of [1, -1]) {
    box(0.1, 0.7, 1.9, P.hullLight, [s * 1.2, ty + 0.65, tz - 0.1], T, { rotation: [0, 0, -s * 8] });
    box(0.06, 0.12, 1.9, hazardPaint, [s * 1.27, ty + 0.98, tz - 0.1], T);
    for (let i = 0; i < 5; i++)
      for (const y of [0.45, 0.85])
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.steel, {
          bone: T,
          at: [s * 1.29, ty + y + 0.2, tz - 0.9 + i * 0.45],
          dir: [s, 0, 0],
        });
    // emblem decal
    b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", {
      bone: T,
      at: [s * 1.31, ty + 0.62, tz - 0.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: emblem,
    });
    // smoke launchers
    for (let i = 0; i < 4; i++) {
      cyl(0.07, 0.07, 0.3, 8, P.gunmetal, [s * 1.1, ty + 0.78 + 0.02 * i, tz + 0.15 - i * 0.16 - 0.9], T, {
        rotation: [0, 0, -s * 40],
      });
    }
  }
  // hatch
  cyl(0.38, 0.42, 0.1, 8, P.hullDark, [-0.5, ty + 1.2, tz - 0.9], T);
  cyl(0.3, 0.3, 0.06, 8, P.hullLight, [-0.5, ty + 1.27, tz - 0.9], T);
  box(0.2, 0.05, 0.06, P.steel, [-0.5, ty + 1.32, tz - 0.9], T);
  // sensor box
  box(0.55, 0.3, 0.45, P.gunmetal, [0.6, ty + 1.3, tz - 0.9], T);
  b.part(new THREE.CircleGeometry(0.11, 10), P.neonCyan, { bone: T, at: [0.6, ty + 1.3, tz - 0.66], dir: [0, 0, 1], axis: "z" });
  glow(b.part(new THREE.CircleGeometry(0.1, 10), P.neonCyan, { bone: T, at: [0.6, ty + 1.3, tz - 0.67], dir: [0, 0, 1], axis: "z" }), 1.5);
  // antenna whips
  for (const s of [1, -1]) {
    b.rod([s * 1.0, ty + 1.0, tz - 1.3], [s * 1.15, ty + 2.0, tz - 1.45], [0.02, 0.008], { bone: T, color: P.steel });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), P.redLamp, { bone: T, at: [s * 1.15, ty + 2.02, tz - 1.45] });
  }
  // rear hazard stripe
  b.part(new THREE.PlaneGeometry(2.0, 0.3), "#ffffff", { bone: T, at: [0, ty + 0.45, tz - 1.58], dir: [0, 0, -1], axis: "z", texture: warn });

  // ---------- GUN ----------
  const gy = M.gunPivot[1];
  const gz = M.gunPivot[2];
  const zEnd = M.muzzle[2];
  const len = zEnd - gz;
  const zc = (gz + zEnd) / 2;
  // saddle/cradle supports on turret
  for (const s of [1, -1]) box(0.4, 0.5, 1.6, P.gunmetal, [s * 0.6, gy - 0.4, gz + 0.4], T);
  // cradle block
  box(1.4, 0.55, 0.9, P.gunmetal, [0, gy, gz + 0.3], G, { paint: undefined });
  box(1.5, 0.12, 0.95, hazardPaint, [0, gy + 0.3, gz + 0.3], G);
  // rails
  for (const s of [1, -1]) {
    box(0.18, 0.18, len, gunPaint, [s * 0.32, gy + 0.05, zc], G);
    box(0.06, 0.2, len - 0.4, P.steel, [s * 0.32, gy + 0.05, zc], G, { scale: [1, 0.6, 1] });
    // recoil dampers
    cyl(0.07, 0.07, 1.0, 8, P.steel, [s * 0.65, gy - 0.05, gz + 0.1], G, { dir: [0, 0, 1] });
    cyl(0.1, 0.1, 0.45, 8, P.hazard, [s * 0.65, gy - 0.05, gz - 0.15], G, { dir: [0, 0, 1] });
  }
  // energy channel
  glow(b.part(new THREE.BoxGeometry(0.34, 0.08, len - 0.5), "#ffffff", { bone: G, at: [0, gy + 0.05, zc], texture: channelTex, flat: true }), 1.6);
  // insulators + coils
  const nC = 9;
  for (let i = 0; i < nC; i++) {
    const z = gz + 0.9 + (i / (nC - 1)) * (len - 1.9);
    box(0.5, 0.1, 0.1, P.hub, [0, gy + 0.05, z + 0.25], G);
    // coil ring
    glow(
      b.part(new THREE.TorusGeometry(0.4, 0.045, 5, 12), P.neonCyan, { bone: G, at: [0, gy + 0.05, z], flat: true }),
      1.6,
    );
    for (const s of [1, -1]) box(0.12, 0.12, 0.14, P.gunmetal, [s * 0.4, gy + 0.05, z], G);
  }
  // top & bottom brace bars
  box(0.9, 0.08, 0.14, P.gunmetal, [0, gy + 0.46, gz + 1.0], G);
  // muzzle brake
  box(1.0, 0.5, 0.7, P.gunmetal, [0, gy + 0.05, zEnd - 0.35], G);
  for (let i = 0; i < 4; i++) box(1.1, 0.55, 0.05, P.steel, [0, gy + 0.05, zEnd - 0.55 + i * 0.16], G);
  box(1.0, 0.1, 0.35, P.hazard, [0, gy + 0.33, zEnd - 0.35], G);
  box(0.9, 0.5, 0.08, P.hullDark, [0, gy + 0.05, zEnd - 0.02], G);
  glow(b.part(new THREE.PlaneGeometry(0.36, 0.2), P.neonCyan, { bone: G, at: [0, gy + 0.05, zEnd + 0.03], dir: [0, 0, 1], axis: "z" }), 1.8);
  // flash shield
  b.extrude([[-0.55, 0], [0.55, 0], [0.45, 0.3], [-0.45, 0.3]], {
    at: [0, gy + 0.3, zEnd - 0.7], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.04, color: P.hullDark, bone: G,
  });
  // power cables down into turret
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.25, gy + 0.05, gz + 0.1], [s * 0.3, gy + 0.25, gz - 0.25], [s * 0.35, gy - 0.1, gz - 0.55], [s * 0.35, ty + 1.1, gz - 0.7]],
      0.035,
      { bone: G, color: P.rubber, sides: 6 },
    );
  }
  // ammo drum on side
  cyl(0.38, 0.38, 0.5, 10, P.hullDark, [1.0, gy - 0.15, gz + 0.1], T, { dir: [1, 0, 0] });
  cyl(0.3, 0.3, 0.06, 10, P.hazard, [1.28, gy - 0.15, gz + 0.1], T, { dir: [1, 0, 0] });
  box(0.2, 0.15, 0.4, P.gunmetal, [0.7, gy - 0.1, gz + 0.1], T);
}
    return buildTurretGun;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "longspearRailgunCarrier" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.2,0], dir: [0,0,1], role: "spine" });
  J["cab"] = b.joint("cab", { parent: J["body"], at: [0,1.7,3], dir: [0,0,1], role: "hinge" });
  J["turret"] = b.joint("turret", { parent: J["body"], at: [0,2,-1.4], dir: [0,1,0], role: "hinge" });
  J["gun"] = b.joint("gun", { parent: J["turret"], at: [0,2.9,-1], dir: [0,0,1], role: "hinge" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.9,0.65,3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.9,0.65,3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.9,0.65,0.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.9,0.65,0.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.9,0.65,-2.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.9,0.65,-2.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["legFL"] = b.joint("legFL", { parent: J["body"], at: [1.7,1.2,1.6], dir: [0.75,-0.65,0], role: "leg", group: "stabilisers" });
  J["legFR"] = b.joint("legFR", { parent: J["body"], at: [-1.7,1.2,1.6], dir: [-0.75,-0.65,0], role: "leg", group: "stabilisers" });
  J["legRL"] = b.joint("legRL", { parent: J["body"], at: [1.7,1.2,-2.6], dir: [0.75,-0.65,0], role: "leg", group: "stabilisers" });
  J["legRR"] = b.joint("legRR", { parent: J["body"], at: [-1.7,1.2,-2.6], dir: [-0.75,-0.65,0], role: "leg", group: "stabilisers" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
