import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, countershade, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  "name": "Convoy Hauler MK-IV 'Nightwatch'",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a sloped armoured cab, roof gun turret and a sealed glowing cargo pod strapped to its flatbed."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3b4250",
  hullDark: "#22262f",
  hullLight: "#5a6475",
  trim: "#e7b814",
  rubber: "#15161a",
  steel: "#8a93a3",
  rust: "#8a4a2a",
  podShell: "#2c3a4a",
  podBand: "#d9a312",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fa8",
  glass: "#0b3a4a",
  warnRed: "#e0302f",
  lampWhite: "#fff6d0",
  ink: "#0b0c10",
};
const M = {
  chassisTop: [0, 1.3, 0] as [number, number, number],
  cabFloor: [0, 1.3, 3] as [number, number, number],
  cabRoof: [0, 2.45, 2.9] as [number, number, number],
  turretRing: [0, 2.45, 2.6] as [number, number, number],
  podBed: [0, 1.3, -1.1] as [number, number, number],
  axleFront: [0, 0.62, 2.9] as [number, number, number],
  axleMid: [0, 0.62, -1.4] as [number, number, number],
  axleRear: [0, 0.62, -3] as [number, number, number],
  muzzle: [0, 2.95, 4.4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassisAndWheels
  (() => {
function buildChassisAndWheels({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const body = J.body;
  const grime = (base: string) =>
    paint((p, n) => {
      const low = smoothstep(1.3, 0.2, p.y);
      const c = mix(base, P.ink, 0.55 * low + 0.25 * noise(p, 0.25, 3));
      return mix(c, P.rust, 0.35 * smoothstep(0.55, 0.8, noise(p, 0.12, 7)) * smoothstep(-0.2, 0.5, n.y));
    });
  const FRAME = grime(P.hullDark);
  const HULL = grime(P.hull);
  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any = body) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: at as any });

  // underframe and deck
  box(2.0, 0.3, 6.0, FRAME, [0, 0.72, -1]);
  box(2.2, 0.14, 6.0, panelled(HULL, { size: 0.5, rivets: 0.1 }), [0, 1.23, -1]);
  // hazard deck edges
  const haz = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/><g fill="#0b0c10"><path d="M0 16L8 0H20L12 16Z"/><path d="M24 16L32 0H44L36 16Z"/><path d="M48 16L56 0H68L60 16Z"/></g></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.1, 6.0), P.trim, { bone: body, at: [s * 1.14, 1.31, -1] });
    for (let i = 0; i < 12; i++)
      b.part(new THREE.BoxGeometry(0.06, 0.02, 0.2), P.ink, { bone: body, at: [s * 1.14, 1.37, -3.8 + i * 0.5], rotation: [0, 25, 0] });
    // ladder rails: I-beams
    b.part(new THREE.BoxGeometry(0.1, 0.22, 6.0), P.steel, { bone: body, at: [s * 0.8, 0.75, -1] });
    b.part(new THREE.BoxGeometry(0.3, 0.05, 6.0), P.steel, { bone: body, at: [s * 0.8, 0.88, -1] });
    b.part(new THREE.BoxGeometry(0.3, 0.05, 6.0), P.steel, { bone: body, at: [s * 0.8, 0.62, -1] });
    // skirts between axles
    b.part(new THREE.BoxGeometry(0.08, 0.5, 2.2), HULL, { bone: body, at: [s * 1.12, 0.95, 0.75] });
    b.part(new THREE.BoxGeometry(0.08, 0.5, 1.3), HULL, { bone: body, at: [s * 1.12, 0.95, -2.2] });
    glow(b.part(new THREE.BoxGeometry(0.03, 0.04, 2.2), P.neonCyan, { bone: body, at: [s * 1.17, 0.74, 0.75] }), 1.5);
    glow(b.part(new THREE.BoxGeometry(0.03, 0.04, 1.3), P.neonMagenta, { bone: body, at: [s * 1.17, 0.74, -2.2] }), 1.5);
    // diesel tank
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8), metal("steel", { tarnish: 0.5 }), { bone: body, at: [s * 0.98, 0.68, 0.7], rotation: [90, 0, 0] });
    b.part(new THREE.BoxGeometry(0.05, 0.1, 1.0), P.trim, { bone: body, at: [s * 1.27, 0.68, 0.7] });
  }
  // exhaust stacks with soot
  const soot = paint((p) => mix(P.steel, P.ink, smoothstep(1.4, 2.4, p.y)));
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.09, 1.2, 8), soot, { bone: body, at: [s * 1.0, 1.9, 1.85] });
    b.part(new THREE.CylinderGeometry(0.1, 0.07, 0.1, 8), P.ink, { bone: body, at: [s * 1.0, 2.52, 1.85] });
    b.part(new THREE.TorusGeometry(0.09, 0.02, 4, 8), P.trim, { bone: body, at: [s * 1.0, 1.5, 1.85], rotation: [90, 0, 0] });
  }
  // mud flaps and decals
  const warn = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#15161a"/><path d="M16 4L29 28H3Z" fill="#e7b814"/><rect x="14.5" y="12" width="3" height="9" fill="#0b0c10"/><rect x="14.5" y="23" width="3" height="3" fill="#0b0c10"/></svg>`,
    { size: 64 },
  );
  for (const z of [-1.4 + 0.9, -3 - 0.9, 2.9 + 0.9]) {
    if (z > 3) continue;
    for (const s of [1, -1]) {
      box(0.05, 0.4, 0.5, P.rubber, [s * 1.2, 0.42, z]);
      b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", { bone: body, at: [s * 1.235, 0.42, z], dir: [s, 0, 0], axis: "z", texture: warn });
    }
  }
  // rear bumper, tail lights, hitch
  box(2.6, 0.3, 0.3, HULL, [0, 0.8, -4.0]);
  box(2.6, 0.06, 0.32, P.trim, [0, 0.98, -4.0]);
  for (const s of [1, -1]) glow(b.part(new THREE.BoxGeometry(0.7, 0.08, 0.05), P.warnRed, { bone: body, at: [s * 0.8, 0.82, -4.17] }), 2);
  box(0.3, 0.2, 0.5, P.steel, [0, 0.7, -4.3]);
  b.part(new THREE.TorusGeometry(0.1, 0.03, 4, 8), P.steel, { bone: body, at: [0, 0.7, -4.6], rotation: [90, 0, 0] });
  // front bumper
  box(2.5, 0.3, 0.3, HULL, [0, 0.8, 3.95]);
  box(2.5, 0.06, 0.32, P.trim, [0, 0.98, 3.95]);

  // axles, springs, wheels, arches
  const tyre = paint((p, n) => mix(P.rubber, "#2a2b31", smoothstep(0.3, 0.9, noise(p, 0.05, 5)) * 0.8));
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 2.9], ["wheelFR", -1, 2.9], ["wheelML", 1, -1.4], ["wheelMR", -1, -1.4], ["wheelRL", 1, -3], ["wheelRR", -1, -3],
  ];
  for (const z of [2.9, -1.4, -3]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 2.4, 8), P.steel, { bone: body, at: [0, 0.62, z], rotation: [0, 0, 90] });
    for (const s of [1, -1]) {
      // leaf springs
      for (let k = 0; k < 3; k++) b.part(new THREE.BoxGeometry(0.14, 0.03, 1.1 - k * 0.25), P.hullLight, { bone: body, at: [s * 0.85, 0.86 + k * 0.035, z] });
      // fender arch
      b.part(new THREE.CylinderGeometry(0.78, 0.78, 0.6, 8, 1, false, 0, Math.PI), HULL, { bone: body, at: [s * 1.2, 0.62, z], rotation: [0, 0, 90], flat: true } as any);
      b.part(new THREE.BoxGeometry(0.62, 0.05, 1.5), P.trim, { bone: body, at: [s * 1.2, 1.4, z] });
    }
  }
  for (const [name, s, z] of wheels) {
    const j = J[name];
    const x = s * 1.2;
    const ax = new THREE.Vector3(s, 0, 0);
    const at = [x, 0.62, z];
    b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 8), tyre, { bone: j, at: at as any, rotation: [0, 0, 90], flat: true } as any);
    b.part(new THREE.CylinderGeometry(0.64, 0.64, 0.3, 8), P.rubber, { bone: j, at: at as any, rotation: [0, 0, 90], flat: true } as any);
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 8), P.steel, { bone: j, at: [x + s * 0.25, 0.62, z], rotation: [0, 0, 90] });
    glow(b.part(new THREE.TorusGeometry(0.3, 0.035, 4, 12), P.neonMagenta, { bone: j, at: [x + s * 0.29, 0.62, z], dir: [s, 0, 0], axis: "z" }), 2);
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 6), P.hullDark, { bone: j, at: [x + s * 0.3, 0.62, z], rotation: [0, 0, 90] });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), P.trim, {
        bone: j, at: [x + s * 0.3, 0.62 + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2], rotation: [0, 0, 90],
      });
    }
  }
}
    return buildChassisAndWheels;
  })(),
  // armouredCab
  (() => {
function buildArmouredCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  // paints
  const grime = (base: string) =>
    paint((p, n) => {
      const g = smoothstep(1.9, 1.3, p.y);
      const m = noise(p, 0.25, 3);
      let c = mix(base, "#22262f", g * 0.55);
      c = mix(c, "#8a4a2a", smoothstep(0.62, 0.8, m) * 0.35 * (1 - Math.abs(n.y)));
      return mix(c, "#5a6475", smoothstep(0.5, 1, n.y) * 0.25);
    });
  const HULL = panelled(grime(P.hull), { size: 0.4, aspect: 0.7, rivets: 0.1 });
  const HULLD = panelled(grime(P.hullDark), { size: 0.3, rivets: 0 });

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at: at as any, rotation: rot as any, flat: true, name });

  // main cab body (lower block)
  b.extrude(
    [
      [2.0, 0],
      [4.15, 0],
      [4.2, 0.35],
      [3.55, 0.62, "sharp"],
      [3.05, 1.12, "sharp"],
      [2.0, 1.15],
    ],
    { at: [0, 1.3, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, color: HULL, bone, name: "cabProfile" } as any,
  );
  // the extrude is centred on thickness axis x*y; make sure it spans width
  // roof slab
  box(2.3, 0.08, 1.0, HULLD, [0, 2.49, 2.55], undefined, "roofSlab");
  box(2.45, 0.05, 1.1, P.trim, [0, 2.455, 2.55], undefined, "roofTrim");

  // hood glacis plate with yellow chevrons
  const chev = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 4} 0 L${i * 16 + 8} 16 L${i * 16 - 4} 32 L${i * 16 - 12} 32 L${i * 16} 16 L${i * 16 - 12} 0Z" fill="#0b0c10"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(2.3, 0.28), "#ffffff", {
    bone, at: [0, 1.57, 4.23], dir: [0, 0.05, 1], axis: "z", texture: chev, name: "chevFront",
  });

  // windscreen frame + glowing visor slit
  const slope = Math.atan2(0.5, 0.5);
  box(2.2, 0.06, 0.62, P.hullDark, [0, 2.15, 3.38], [-45, 0, 0], "windFrame");
  glow(
    b.part(new THREE.BoxGeometry(1.9, 0.12, 0.03), P.neonCyan, { bone, at: [0, 2.17, 3.43], rotation: [-45, 0, 0] as any, name: "visor" }),
    1.8,
  );
  box(2.1, 0.08, 0.1, P.trim, [0, 2.42, 3.07], undefined, "visorBrow");
  void slope;

  // side armour plates + bolt rows
  for (const s of [1, -1]) {
    box(0.14, 0.75, 1.5, HULL, [s * 1.3, 1.85, 2.9], [0, 0, s * -4], "sidePlate");
    box(0.06, 0.1, 1.3, P.trim, [s * 1.37, 1.55, 2.9], undefined, "sideTrim");
    // door seams
    box(0.02, 0.6, 0.02, P.ink, [s * 1.38, 1.95, 2.55], undefined, "doorSeam");
    box(0.02, 0.6, 0.02, P.ink, [s * 1.38, 1.95, 3.25], undefined, "doorSeam");
    box(0.02, 0.02, 0.72, P.ink, [s * 1.38, 2.25, 2.9], undefined, "doorSeam");
    // bolts
    for (let i = 0; i < 6; i++)
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.steel, {
        bone, at: [s * 1.385, 1.5, 2.25 + i * 0.25], dir: [s, 0, 0], name: "bolt",
      });
    // emblem decal
    const eye = svg(
      `<svg viewBox="0 0 64 64"><path d="M32 4 L58 18 L58 46 L32 60 L6 46 L6 18Z" fill="#0b0c10" stroke="#2ff3ff" stroke-width="3"/><path d="M12 32 Q32 14 52 32 Q32 50 12 32Z" fill="#0b3a4a" stroke="#2ff3ff" stroke-width="2.5"/><circle cx="32" cy="32" r="8" fill="#ff2fa8"/><circle cx="32" cy="32" r="3" fill="#0b0c10"/></svg>`,
      { size: 128 },
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
        bone, at: [s * 1.392, 1.95, 2.9], dir: [s, 0, 0], axis: "z", texture: eye, name: "emblem",
      }),
      0.6,
    );
    // mirror on strut
    b.rod([s * 1.3, 2.2, 3.3], [s * 1.62, 2.3, 3.4], 0.025, P.steel, { bone });
    box(0.06, 0.32, 0.2, P.hullDark, [s * 1.65, 2.3, 3.4], undefined, "mirror");
    box(0.02, 0.26, 0.15, P.steel, [s * 1.69, 2.3, 3.4], undefined, "mirrorGlass");
    // headlight bars
    glow(b.part(new THREE.BoxGeometry(0.62, 0.1, 0.06), P.lampWhite, { bone, at: [s * 0.78, 1.62, 4.2], name: "headlight" }), 2);
    b.part(new THREE.BoxGeometry(0.7, 0.18, 0.04), P.ink, { bone, at: [s * 0.78, 1.62, 4.18], name: "lampBezel" });
    // front fender wedges
    box(0.3, 0.3, 0.5, HULLD, [s * 1.18, 1.5, 3.95], [0, s * 12, 0], "nosePlate");
  }

  // grille with slats
  box(1.1, 0.5, 0.06, P.ink, [0, 1.58, 4.19], undefined, "grille");
  for (let i = 0; i < 6; i++) box(1.0, 0.03, 0.05, P.steel, [0, 1.38 + i * 0.08, 4.215], undefined, "slat");

  // bull-bar ram
  box(2.5, 0.14, 0.14, P.hullDark, [0, 1.38, 4.32], undefined, "ramBar");
  box(2.5, 0.1, 0.12, P.trim, [0, 1.74, 4.3], undefined, "ramTop");
  for (const x of [-1.1, -0.55, 0, 0.55, 1.1]) b.rod([x, 1.36, 4.3], [x, 1.76, 4.25], 0.045, P.steel, { bone });
  for (const s of [1, -1]) b.rod([s * 1.2, 1.38, 4.3], [s * 1.2, 1.38, 3.95], 0.06, P.hullDark, { bone });
  glow(b.part(new THREE.BoxGeometry(2.3, 0.04, 0.05), P.neonMagenta, { bone, at: [0, 1.3, 4.34], name: "ramGlow" }), 2);

  // roof: antenna cluster and sensor dome
  b.part(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, { bone, at: [0.8, 2.5, 2.25], name: "dome" });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, { bone, at: [0.8, 2.6, 2.34], name: "domeEye" }), 2);
  for (const [x, z, h] of [[-0.85, 2.2, 0.7], [-0.7, 2.3, 0.45], [0.95, 3.0, 0.35]] as number[][]) {
    b.rod([x, 2.48, z], [x, 2.48 + h, z], [0.016, 0.008], P.steel, { bone });
    glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), P.warnRed, { bone, at: [x, 2.5 + h, z], name: "tipLamp" }), 2);
  }
  // roof corner rivets
  for (const sx of [1, -1]) for (const z of [2.1, 3.0])
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 6), P.steel, { bone, at: [sx * 1.1, 2.54, z], name: "roofBolt" });

  // rear wall + rust edge strip
  box(2.4, 1.1, 0.08, HULLD, [0, 1.85, 2.04], undefined, "rearWall");
  box(2.5, 0.06, 0.1, P.rust, [0, 1.3, 2.05], undefined, "rearRust");
}
    return buildArmouredCab;
  })(),
  // roofTurret
  (() => {
function buildRoofTurret({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const gun = J.gun;
  const R = rng(11);
  const RING = M.turretRing as number[];
  const cx = RING[0], cy = RING[1], cz = RING[2];

  const BOLT = "#b8c0cf";
  const DARKRED = "#7a1a1a";
  const GUNMETAL = "#4a5160";

  const armour = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(-0.2, 1, n.y) * 0.6);
    const grime = smoothstep(0.55, 0.8, noise(p, 0.12, 3)) * 0.35;
    const lowGrime = smoothstep(2.9, 2.5, p.y) * 0.4;
    return mix(mix(base, P.hullDark, grime + lowGrime), P.rust, smoothstep(0.7, 0.85, noise(p, 0.05, 8)) * 0.35);
  });
  const barrelPaint = paint((p, n) => {
    const heat = smoothstep(4.2, 4.6, p.z) * 0.5;
    return mix(mix(GUNMETAL, P.hullDark, smoothstep(0.3, -0.8, n.y) * 0.6), P.rust, heat * 0.6);
  });
  const hazard = paint((p) => ((Math.floor((p.x + p.z) / 0.06) & 1) ? P.trim : P.ink));

  const place = (geo: THREE.BufferGeometry, color: any, bone: any, at: number[], opts: any = {}) =>
    b.part(geo, color, { bone, at, ...opts });

  // ---- base drum (rides yaw)
  place(new THREE.CylinderGeometry(0.5, 0.56, 0.1, 8), P.hullDark, yaw, [cx, cy + 0.05, cz]);
  place(new THREE.CylinderGeometry(0.42, 0.5, 0.14, 8), armour, yaw, [cx, cy + 0.17, cz], { flat: true });
  place(new THREE.TorusGeometry(0.52, 0.025, 4, 8), P.trim, yaw, [cx, cy + 0.11, cz], { rotation: [90, 22.5, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    place(new THREE.SphereGeometry(0.02, 5, 3), BOLT, yaw, [cx + Math.sin(a) * 0.5, cy + 0.2, cz + Math.cos(a) * 0.5]);
  }
  // hazard stripe ring segments on drum
  place(new THREE.CylinderGeometry(0.455, 0.465, 0.04, 16, 1, true), hazard, yaw, [cx, cy + 0.13, cz]);

  // ---- shield housing: angular wedge pieces
  const hy = cy + 0.5;
  place(new THREE.BoxGeometry(0.9, 0.34, 0.8), armour, yaw, [cx, hy - 0.06, cz - 0.02], { flat: true });
  // sloped front shield
  place(new THREE.BoxGeometry(0.86, 0.32, 0.08), armour, yaw, [cx, hy + 0.05, cz + 0.45], { rotation: [-28, 0, 0], flat: true });
  // top plate sloped
  place(new THREE.BoxGeometry(0.8, 0.07, 0.7), P.hullLight, yaw, [cx, hy + 0.15, cz - 0.05], { rotation: [6, 0, 0], flat: true });
  // side cheeks
  for (const s of [1, -1]) {
    place(new THREE.BoxGeometry(0.08, 0.36, 0.74), armour, yaw, [cx + s * 0.47, hy - 0.02, cz + 0.0], { rotation: [0, s * 6, 0], flat: true });
    place(new THREE.BoxGeometry(0.1, 0.1, 0.5), P.trim, yaw, [cx + s * 0.5, hy + 0.12, cz - 0.02], { flat: true });
    for (let k = 0; k < 4; k++)
      place(new THREE.SphereGeometry(0.018, 5, 3), BOLT, yaw, [cx + s * 0.52, hy - 0.08, cz - 0.28 + k * 0.18]);
    // cheek vents
    for (let k = 0; k < 3; k++)
      place(new THREE.BoxGeometry(0.02, 0.03, 0.2), P.ink, yaw, [cx + s * 0.515, hy - 0.14 + k * 0.045, cz - 0.15]);
  }
  // rear bustle
  place(new THREE.BoxGeometry(0.7, 0.26, 0.22), P.hullDark, yaw, [cx, hy - 0.05, cz - 0.5], { flat: true });
  // front trim chevrons on shield
  for (let k = -2; k <= 2; k++)
    place(new THREE.BoxGeometry(0.1, 0.04, 0.012), P.trim, yaw, [cx + k * 0.15, hy + 0.04, cz + 0.5], { rotation: [-28, 0, k * 20] });
  // gun port frame
  place(new THREE.BoxGeometry(0.5, 0.18, 0.05), P.hullDark, yaw, [cx, hy - 0.04, cz + 0.49], { rotation: [-14, 0, 0] });

  // ---- cradle + barrels (ride gun)
  const gz = gun.at.z, gy = gun.at.y;
  place(new THREE.BoxGeometry(0.46, 0.2, 0.34), P.hullDark, gun, [cx, gy, gz + 0.05], { flat: true });
  place(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), P.steel, gun, [cx, gy, gz + 0.1], { dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    const x = cx + s * 0.14;
    const barrel = b.rod([x, gy, gz + 0.2], [x, gy, M.muzzle[2] - 0.1], 0.05, barrelPaint, { bone: gun, sides: 8 });
    // shroud
    place(new THREE.CylinderGeometry(0.075, 0.075, 0.5, 8), P.hullLight, gun, [x, gy, gz + 0.5], { dir: [0, 0, 1], flat: true });
    // cooling rings
    for (let k = 0; k < 3; k++)
      place(new THREE.CylinderGeometry(0.068, 0.068, 0.03, 8), P.trim, gun, [x, gy, gz + 0.85 + k * 0.16], { dir: [0, 0, 1], flat: true });
    // muzzle brake
    const mz = M.muzzle[2] - 0.1;
    place(new THREE.CylinderGeometry(0.085, 0.07, 0.2, 6), P.hullDark, gun, [x, gy, mz], { dir: [0, 0, 1], flat: true });
    place(new THREE.BoxGeometry(0.17, 0.02, 0.1), P.ink, gun, [x, gy, mz - 0.03]);
    glow(place(new THREE.CircleGeometry(0.035, 6), P.neonCyan, gun, [x, gy, mz + 0.105], { dir: [0, 0, 1], axis: "z" }), 0.6);
  }
  // brace between barrels at muzzle
  place(new THREE.BoxGeometry(0.2, 0.05, 0.05), P.steel, gun, [cx, gy, M.muzzle[2] - 0.45]);

  // ---- ammo box + belt feed (left side)
  const ax = cx + 0.62;
  place(new THREE.BoxGeometry(0.22, 0.26, 0.34), P.hullDark, yaw, [ax, hy - 0.08, cz - 0.1], { flat: true });
  place(new THREE.BoxGeometry(0.235, 0.05, 0.36), P.trim, yaw, [ax, hy + 0.06, cz - 0.1]);
  place(new THREE.BoxGeometry(0.08, 0.03, 0.08), BOLT, yaw, [ax + 0.0, hy - 0.08, cz + 0.1]);
  for (let k = 0; k < 7; k++) {
    const t = k / 6;
    place(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 6), "#c9962b", gun,
      [ax - 0.1 - t * 0.28, hy - 0.04 - t * 0.0 + Math.sin(t * Math.PI) * 0.08 - 0.06 * t, cz + 0.12 + t * 0.12],
      { rotation: [0, 0, 90] });
  }

  // ---- sensors
  place(new THREE.BoxGeometry(0.2, 0.16, 0.16), P.hullDark, yaw, [cx - 0.24, hy + 0.25, cz + 0.2], { flat: true });
  glow(place(new THREE.SphereGeometry(0.06, 8, 6), P.warnRed, yaw, [cx - 0.24, hy + 0.26, cz + 0.29]), 1.6);
  place(new THREE.TorusGeometry(0.07, 0.015, 4, 8), P.ink, yaw, [cx - 0.24, hy + 0.26, cz + 0.285]);
  place(new THREE.CylinderGeometry(0.05, 0.06, 0.22, 8), P.hullDark, yaw, [cx + 0.26, hy + 0.27, cz + 0.2], { dir: [0, 0, 1] });
  glow(place(new THREE.CircleGeometry(0.045, 8), P.neonCyan, yaw, [cx + 0.26, hy + 0.27, cz + 0.315], { dir: [0, 0, 1], axis: "z" }), 1.4);
  place(new THREE.BoxGeometry(0.14, 0.04, 0.08), P.trim, yaw, [cx + 0.26, hy + 0.17, cz + 0.2]);

  // ---- floodlight
  place(new THREE.BoxGeometry(0.05, 0.12, 0.05), P.steel, yaw, [cx + 0.3, hy + 0.24, cz - 0.3]);
  place(new THREE.CylinderGeometry(0.07, 0.05, 0.1, 8), P.hullDark, yaw, [cx + 0.3, hy + 0.34, cz - 0.28], { dir: [0, 0.3, 1] });
  glow(place(new THREE.CircleGeometry(0.058, 8), P.lampWhite, yaw, [cx + 0.3, hy + 0.35, cz - 0.225], { dir: [0, 0.3, 1], axis: "z" }), 1.5);

  // ---- antenna whip
  place(new THREE.CylinderGeometry(0.035, 0.045, 0.08, 6), P.steel, yaw, [cx - 0.32, hy + 0.2, cz - 0.4]);
  b.rod([cx - 0.32, hy + 0.24, cz - 0.4], [cx - 0.36, hy + 0.85, cz - 0.46], [0.012, 0.004], P.ink, { bone: yaw, sides: 5 });
  glow(place(new THREE.SphereGeometry(0.02, 5, 4), P.warnRed, yaw, [cx - 0.36, hy + 0.87, cz - 0.46]), 1.8);

  // ---- rivet rows on top & front
  for (let k = 0; k < 6; k++) {
    const x = cx - 0.34 + k * 0.136;
    place(new THREE.SphereGeometry(0.016, 5, 3), BOLT, yaw, [x, hy + 0.2, cz - 0.3]);
    place(new THREE.SphereGeometry(0.016, 5, 3), BOLT, yaw, [x, hy + 0.17, cz + 0.28 + R() * 0.0]);
  }

  // ---- warning label on rear bustle
  const label = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#e7b814"/><path d="M0 0L12 24H0ZM24 0L36 24H24ZM48 0L60 24H48Z" fill="#0b0c10"/><text x="38" y="17" font-size="12" font-family="monospace" font-weight="bold" fill="#0b0c10">AUTO</text></svg>`,
    { size: 128 },
  );
  place(new THREE.PlaneGeometry(0.4, 0.15), "#ffffff", yaw, [cx, hy - 0.05, cz - 0.612], { dir: [0, 0, -1], axis: "z", texture: label });
}
    return buildRoofTurret;
  })(),
  // cargoPod
  (() => {
function buildCargoPod({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const X0 = 1.15, Z0 = -3.8, Z1 = 1.6, Y0 = 1.3, Y1 = 2.78;
  const cx = 0, cz = (Z0 + Z1) / 2, W = X0 * 2, L = Z1 - Z0, H = Y1 - Y0;
  const cy = (Y0 + Y1) / 2;
  const body = J.body, lid = J.podLid;

  // ---- paints
  const shell = paint((p, n) => {
    let c = mix(P.podShell, "#3a4c60", noise(p, 0.5, 3) * 0.6);
    c = mix(c, P.hullDark, smoothstep(1.7, 1.3, p.y) * 0.7);
    // panel lines
    const gz = ((p.z * 1.0) % 1.08 + 1.08) % 1.08;
    if (gz < 0.02 && Math.abs(n.y) < 0.9) c = mix(c, P.ink, 0.8);
    // rust near edges
    const ex = Math.abs(Math.abs(p.x) - X0), ey = Math.abs(p.y - Y0);
    const edge = Math.min(ex, ey);
    c = mix(c, P.rust, smoothstep(0.18, 0.0, edge) * smoothstep(0.4, 0.7, noise(p, 0.12, 5)));
    return c;
  });
  const lidPaint = paint((p) => mix(P.hullLight, P.podShell, 0.5 + 0.4 * noise(p, 0.3, 8)));

  // ---- textures
  const hazard = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#d9a312"/>
    ${[-64, -32, 0, 32, 64].map((o) => `<path d="M${o} 64 L${o + 32} 0 L${o + 48} 0 L${o + 16} 64Z" fill="#15161a"/>`).join("")}</svg>`, { size: 128 });
  const label = svg(`<svg viewBox="0 0 128 96"><rect width="128" height="96" rx="6" fill="#e9e2c8" stroke="#0b0c10" stroke-width="4"/>
    <g transform="translate(34 40)" fill="#0b0c10"><circle r="6"/>
    ${[0, 120, 240].map((a) => `<g transform="rotate(${a})"><path d="M-5 -9 A10 10 0 0 1 5 -9 L9 -26 A22 22 0 0 0 -9 -26Z"/></g>`).join("")}
    <circle r="2.4" fill="#e9e2c8"/></g>
    <text x="64" y="30" font-family="monospace" font-weight="bold" font-size="17" fill="#b3261e">SEALED</text>
    <text x="64" y="48" font-family="monospace" font-size="9" fill="#0b0c10">SN 77-4410-NW</text>
    ${Array.from({ length: 22 }, (_, i) => `<rect x="${12 + i * 4.4}" y="74" width="${i % 3 ? 1.6 : 3}" height="14" fill="#0b0c10"/>`).join("")}
    <text x="64" y="64" font-family="monospace" font-size="8" fill="#0b0c10">BIOHAZARD CLASS IV</text></svg>`, { size: 256 });
  const screen = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#06161a" stroke="#2ff3ff" stroke-width="2"/>
    <path d="M4 30 L14 22 L24 26 L34 12 L46 18 L60 8" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    <text x="4" y="10" font-family="monospace" font-size="7" fill="#35ff7a">LOCK OK</text>
    <circle cx="54" cy="32" r="3" fill="#35ff7a"/><circle cx="46" cy="32" r="3" fill="#e0302f"/></svg>`, { size: 128 });
  const lockTex = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ff2fa8"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M32 8V20M32 44V56M8 32H20M44 32H56" stroke="#fff" stroke-width="4"/>
    <circle cx="32" cy="32" r="8" fill="#fff"/></svg>`, { size: 128 });
  const glyph = svg(`<svg viewBox="0 0 64 64"><g stroke="#ff2fa8" stroke-width="5" fill="none" stroke-linecap="round">
    <path d="M10 14H54M32 6V58M14 30H50M18 48Q32 40 48 52"/></g></svg>`, { size: 128 });

  const box = (w: number, h: number, d: number, color: any, at: number[], bone: any = body, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });

  // ---- shell: core + chamfer slabs (low-poly rounded box)
  const ch = 0.16;
  box(W, H - 2 * ch, L, shell, [cx, cy, cz]);
  box(W - 2 * ch, H, L, shell, [cx, cy - 0.0, cz]);
  box(W, H, L - 2 * ch, shell, [cx, cy, cz]);
  for (const s of [1, -1]) {
    b.rod([s * (X0 - ch / 2), Y0 + 0.02, Z0 + 0.02], [s * (X0 - ch / 2), Y0 + 0.02, Z1 - 0.02], ch * 0.8, P.hullDark, { bone: body, sides: 4 });
  }
  // lower dark base
  box(W + 0.02, 0.1, L + 0.02, P.hullDark, [cx, Y0 + 0.05, cz]);

  // ---- lid slab (rides podLid)
  box(W - 0.3, 0.14, L - 0.3, lidPaint, [cx, Y1 + 0.05, cz], lid);
  box(W - 0.7, 0.05, L - 0.7, P.hullLight, [cx, Y1 + 0.15, cz], lid);
  for (const s of [1, -1]) {
    glow(b.rod([s * (X0 - 0.28), Y1 + 0.13, Z0 + 0.2], [s * (X0 - 0.28), Y1 + 0.13, Z1 - 0.2], 0.018, P.neonCyan, { bone: lid, sides: 4 }), 1.6);
  }
  // vent fins on lid
  for (let i = 0; i < 6; i++) {
    box(0.7, 0.06, 0.05, P.hullDark, [0.0, Y1 + 0.2, Z0 + 0.7 + i * 0.12], lid, { rotation: [-20, 0, 0] });
  }
  // lid hazard strip front
  b.part(new THREE.PlaneGeometry(W - 0.4, 0.1), "#ffffff", { bone: lid, at: [cx, Y1 + 0.13, Z1 - 0.17], dir: [0, 1, 0], axis: "z", texture: hazard });

  // ---- hazard bands with buckles
  const bandZ = [-3.0, -1.5, 0.1];
  for (const z of bandZ) {
    box(W + 0.1, 0.12, 0.3, P.podBand, [cx, Y1 - 0.01, z]);
    for (const s of [1, -1]) {
      box(0.12, H + 0.02, 0.3, P.podBand, [s * (X0 + 0.02), cy, z]);
      b.part(new THREE.PlaneGeometry(0.28, H - 0.1), "#ffffff", { bone: body, at: [s * (X0 + 0.085), cy, z], dir: [s, 0, 0], axis: "z", texture: hazard });
      // buckle
      box(0.06, 0.2, 0.2, P.steel, [s * (X0 + 0.1), cy + 0.1, z]);
      box(0.07, 0.1, 0.1, P.ink, [s * (X0 + 0.12), cy + 0.1, z]);
      // chain links hanging
      for (let k = 0; k < 4; k++) {
        box(0.04, 0.09, 0.06, P.steel, [s * (X0 + 0.11), cy - 0.1 - k * 0.1, z + 0.08], body, { rotation: [k % 2 ? 90 : 0, 0, 0] });
      }
    }
    // rivets
    for (let k = -3; k <= 3; k++) b.part(new THREE.SphereGeometry(0.02, 5, 3), P.steel, { bone: body, at: [k * 0.3, Y1 + 0.07, z + 0.12] });
  }

  // ---- corner armour brackets
  for (const sx of [1, -1]) for (const sz of [0, 1]) {
    const z = sz ? Z1 : Z0;
    const zs = sz ? -1 : 1;
    box(0.26, 0.5, 0.26, P.hullLight, [sx * (X0 - 0.08), Y0 + 0.28, z + zs * 0.08]);
    box(0.28, 0.1, 0.28, P.trim, [sx * (X0 - 0.08), Y0 + 0.55, z + zs * 0.08]);
    box(0.26, 0.5, 0.26, P.hullLight, [sx * (X0 - 0.08), Y1 - 0.25, z + zs * 0.08]);
    box(0.28, 0.1, 0.28, P.trim, [sx * (X0 - 0.08), Y1 - 0.5, z + zs * 0.08]);
  }

  // ---- glowing seam lines on flanks
  for (const s of [1, -1]) {
    for (const y of [Y0 + 0.42, Y1 - 0.35]) {
      glow(b.rod([s * (X0 + 0.01), y, Z0 + 0.3], [s * (X0 + 0.01), y, Z1 - 0.3], 0.02, P.neonCyan, { bone: body, sides: 4 }), 1.8);
    }
  }
  // vertical seams on rear & front
  for (const z of [Z0 - 0.01, Z1 + 0.01]) {
    for (const x of [-0.6, 0.6]) glow(box(0.035, H - 0.4, 0.03, P.neonCyan, [x, cy, z]), 1.6);
  }

  // ---- rear door and lock core
  const zr = Z0 - 0.02;
  box(1.5, H - 0.35, 0.05, P.hullDark, [0, cy, zr]);
  box(1.4, H - 0.45, 0.03, P.hullLight, [0, cy, zr - 0.03]);
  glow(b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: body, at: [0, cy, zr - 0.06], dir: [0, 0, -1], axis: "z", texture: lockTex }), 2);
  glow(b.part(new THREE.TorusGeometry(0.4, 0.04, 5, 10), P.neonMagenta, { bone: body, at: [0, cy, zr - 0.06] }), 1.8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.steel, { bone: body, at: [Math.cos(a) * 0.55, cy + Math.sin(a) * 0.55, zr - 0.06], dir: [0, 0, -1] });
  }
  // door hinges
  for (const y of [Y0 + 0.4, Y1 - 0.4]) for (const x of [-0.78, 0.78]) box(0.1, 0.18, 0.08, P.steel, [x, y, zr - 0.04]);

  // ---- labels and screens
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.9, 0.675), "#ffffff", { bone: body, at: [s * (X0 + 0.012), cy + 0.05, -0.7 + s * 0.0], dir: [s, 0, 0], axis: "z", texture: label });
    glow(b.part(new THREE.PlaneGeometry(0.4, 0.25), "#ffffff", { bone: body, at: [s * (X0 + 0.012), cy + 0.25, -2.3], dir: [s, 0, 0], axis: "z", texture: screen }), 1.3);
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: body, at: [s * (X0 + 0.012), cy - 0.1, -3.3], dir: [s, 0, 0], axis: "z", texture: glyph, });
    // LEDs
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), "#35ff7a", { bone: body, at: [s * (X0 + 0.03), cy + 0.02, -2.4] }), 2);
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.warnRed, { bone: body, at: [s * (X0 + 0.03), cy + 0.02, -2.2] }), 2);
    // handle rails
    for (const z of [-2.3, -1.9]) {
      box(0.05, 0.05, 0.08, P.steel, [s * (X0 + 0.07), cy - 0.35, z]);
    }
    b.rod([s * (X0 + 0.11), cy - 0.35, -2.3], [s * (X0 + 0.11), cy - 0.35, -1.9], 0.025, P.steel, { bone: body, sides: 6 });
    // conduit down side to chassis
    b.rod([s * (X0 + 0.06), Y0 + 0.05, 0.9], [s * (X0 + 0.06), Y0 + 0.9, 0.9], 0.04, P.hullDark, { bone: body, sides: 6 });
    glow(b.rod([s * (X0 + 0.1), Y0 + 0.05, 0.9], [s * (X0 + 0.1), Y0 + 0.9, 0.9], 0.012, P.neonCyan, { bone: body, sides: 4 }), 1.5);
  }

  // front face: conduits, warning lamp, hazard chevron
  b.part(new THREE.PlaneGeometry(W - 0.5, 0.18), "#ffffff", { bone: body, at: [0, Y0 + 0.3, Z1 + 0.012], dir: [0, 0, 1], axis: "z", texture: hazard });
  b.part(new THREE.PlaneGeometry(0.7, 0.525), "#ffffff", { bone: body, at: [0, cy + 0.2, Z1 + 0.012], dir: [0, 0, 1], axis: "z", texture: label });
  const cable = b.sweep([[0.5, Y0 + 0.05, Z1 + 0.05], [0.55, Y0 + 0.4, Z1 + 0.25], [0.5, Y0 + 0.2, Z1 + 0.35]], 0.03, { color: P.ink, bone: body, sides: 6 });
  b.sweep([[-0.5, Y0 + 0.5, Z1 + 0.02], [-0.6, Y0 + 0.2, Z1 + 0.25], [-0.5, Y0 - 0.05, Z1 + 0.3]], 0.03, { color: P.hullDark, bone: body, sides: 6 });

  // side vent fins
  for (const s of [1, -1]) for (let i = 0; i < 5; i++) {
    box(0.06, 0.04, 0.5, P.hullDark, [s * (X0 + 0.04), Y1 - 0.65 - i * 0.07, -3.1], body, { rotation: [0, 0, s * 20] });
  }
  // hanging chains between bands on top (slack)
  for (const s of [1, -1]) {
    b.sweep([[s * 0.2, Y1 + 0.06, -2.9], [s * 0.4, Y1 + 0.12, -2.25], [s * 0.2, Y1 + 0.06, -1.6]], 0.02, { color: P.steel, bone: lid, sides: 4 });
  }
  // red top beacon
  glow(box(0.12, 0.08, 0.12, P.warnRed, [0.8, Y1 + 0.2, -3.4], lid), 2);
}
    return buildCargoPod;
  })(),
  // neonAndDetail
  (() => {
function buildNeonAndDetail({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const BONE = { bone: body } as const;

  // ---------- textures ----------
  const holo = svg(
    `<svg viewBox="0 0 128 64"><rect x="2" y="2" width="124" height="60" rx="6" fill="#06222c" stroke="#2ff3ff" stroke-width="3"/>
    <polygon points="28,32 38,14 58,14 68,32 58,50 38,50" fill="none" stroke="#2ff3ff" stroke-width="3"/>
    <ellipse cx="48" cy="32" rx="11" ry="6" fill="none" stroke="#2ff3ff" stroke-width="3"/><circle cx="48" cy="32" r="3" fill="#ff2fa8"/>
    <path d="M78 18h40M78 30h32M78 42h40" stroke="#2ff3ff" stroke-width="4"/><path d="M78 52h20" stroke="#ff2fa8" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const kanji = svg(
    `<svg viewBox="0 0 64 64"><g fill="none" stroke="#ff2fa8" stroke-width="5" stroke-linecap="round">
    <path d="M10 18h44M32 6v52M14 36h36M18 50l28-6"/><path d="M12 58l10-12M52 58L42 46"/></g></svg>`,
    { size: 128 },
  );
  const tag = svg(
    `<svg viewBox="0 0 96 48"><path d="M6 36C20 4 30 4 34 24S50 44 58 14s20 20 32 4" fill="none" stroke="#2ff3ff" stroke-width="5" stroke-linecap="round"/><path d="M8 42h80" stroke="#e7b814" stroke-width="4"/></svg>`,
    { size: 192 },
  );
  const plate = svg(
    `<svg viewBox="0 0 96 40"><rect x="1" y="1" width="94" height="38" rx="4" fill="#e8e8d8" stroke="#0b0c10" stroke-width="2"/><rect x="4" y="4" width="88" height="7" fill="#1c3a8a"/>
    <text x="48" y="33" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#0b0c10">NW-404</text></svg>`,
    { size: 192 },
  );
  const flagTex = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#e0302f"/><path d="M0 40L64 0v14L0 40z" fill="#e7b814"/><circle cx="46" cy="26" r="6" fill="#0b0c10"/></svg>`,
    { size: 128 },
  );

  const grime = paint((p, n) => {
    const base = P.hullDark;
    const k = noise(p, 0.3, 4);
    return mix(base, P.rust, smoothstep(0.55, 0.8, k) * 0.7 * (1 - smoothstep(0.5, 1, n.y) * 0.3));
  });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);
  const put = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { ...BONE, at, ...o });
  const lit = (g: THREE.BufferGeometry, c: string, at: number[], s = 1.4, o: any = {}) =>
    glow(put(g, c, at, o), s);

  // ---------- underglow & skirt light bars ----------
  for (const s of [1, -1]) {
    lit(box(0.06, 0.05, 6.4), P.neonCyan, [s * 1.2, 0.46, -1.0], 1.6);
    lit(box(0.05, 0.05, 1.8), P.neonMagenta, [s * 1.12, 0.46, 3.0], 1.6);
    lit(box(0.05, 0.05, 1.0), P.neonMagenta, [s * 1.12, 0.46, -4.0], 1.6);
    // side-running light bar on deck edge
    put(box(0.1, 0.12, 5.9), P.hullDark, [s * 1.14, 1.2, -1.0]);
    lit(box(0.04, 0.05, 5.7), P.neonCyan, [s * 1.2, 1.2, -1.0], 1.3);
    // marker lamps
    for (let i = 0; i < 6; i++) {
      lit(box(0.05, 0.08, 0.14), i % 2 ? P.warnRed : P.trim, [s * 1.2, 0.92, -3.6 + i * 1.0], 1.2);
    }
  }
  // (remove accidental empty plane parts above by re-adding decals properly)
  for (const s of [1, -1]) {
    const dir = [s, 0, 0];
    put(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", [s * 1.205, 0.8, -2.2], { dir, axis: "z", texture: tag });
    put(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", [s * 1.205, 0.85, -0.2], { dir, axis: "z", texture: kanji });
    // pod flank graffiti
    put(new THREE.PlaneGeometry(1.1, 0.55), "#ffffff", [s * 1.17, 2.1, -2.6], { dir, axis: "z", texture: tag });
    put(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", [s * 1.17, 1.75, -0.6], { dir, axis: "z", texture: kanji });
  }
  // holo convoy id panel on cab flank
  for (const s of [1, -1]) {
    glow(
      put(new THREE.PlaneGeometry(0.95, 0.48), "#ffffff", [s * 1.335, 2.0, 2.95], {
        dir: [s, 0, 0],
        axis: "z",
        texture: holo,
      }),
      1.2,
    );
  }

  // ---------- roof beacon bar ----------
  put(box(1.5, 0.08, 0.26), P.hullDark, [0, 2.5, 2.2]);
  for (const s of [1, -1]) {
    lit(box(0.62, 0.14, 0.2), s > 0 ? P.warnRed : "#2f6bff", [s * 0.4, 2.6, 2.2], 1.8);
    put(box(0.04, 0.16, 0.24), P.hullDark, [s * 0.74, 2.58, 2.2]);
  }
  put(box(0.1, 0.16, 0.24), P.hullDark, [0, 2.58, 2.2]);

  // ---------- number plates ----------
  put(new THREE.PlaneGeometry(0.7, 0.29), "#ffffff", [0, 0.9, -4.06], { dir: [0, 0, -1], axis: "z", texture: plate });
  put(box(0.78, 0.36, 0.03), P.hullDark, [0, 0.9, -4.045]);
  put(new THREE.PlaneGeometry(0.6, 0.25), "#ffffff", [0, 1.05, 4.205], { dir: [0, 0, 1], axis: "z", texture: plate });

  // ---------- canisters on skirts ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      const z = 0.5 + i * 0.5;
      const c = i ? P.warnRed : P.steel;
      put(cyl(0.14, 0.7, 8), c, [s * 1.32, 0.78, z - 0.6], { dir: [0, 0, 1] });
      put(cyl(0.15, 0.06, 8), P.trim, [s * 1.32, 0.78, z - 0.28], { dir: [0, 0, 1] });
      put(cyl(0.15, 0.06, 8), P.trim, [s * 1.32, 0.78, z - 0.92], { dir: [0, 0, 1] });
    }
    put(box(0.1, 0.05, 1.5), P.hullDark, [s * 1.32, 0.62, -0.2]);
    put(cyl(0.04, 0.1, 6), P.steel, [s * 1.32, 1.04, -0.1], {});
    lit(cyl(0.05, 0.03, 6), P.neonCyan, [s * 1.32, 1.1, -0.1], 1.5);
  }

  // ---------- cable bundles cab <-> pod ----------
  const cableCols = [P.ink, P.neonCyan, P.neonMagenta, P.hullDark];
  for (let k = 0; k < 4; k++) {
    const x = -0.45 + k * 0.3;
    const y = 1.55 + (k % 2) * 0.08;
    const pts: number[][] = [
      [x, 1.4, 2.0],
      [x * 1.1, y + 0.18, 1.85],
      [x * 1.1, y + 0.2, 1.7],
      [x, 1.9 + (k % 2) * 0.1, 1.6],
    ];
    const sw = b.sweep(pts, 0.025, { ...BONE, color: cableCols[k], sides: 6 } as any);
    if (k === 1 || k === 2) glow(sw, 1.2);
  }
  put(box(0.3, 0.22, 0.14), P.hullDark, [0, 1.45, 1.92]);
  for (const x of [-0.4, 0.4]) put(cyl(0.05, 0.18, 6), P.steel, [x, 1.4, 1.85]);

  // ---------- rear searchlight mast ----------
  put(cyl(0.1, 0.1, 8), P.hullDark, [0.9, 1.34, -3.7]);
  b.rod([0.9, 1.35, -3.7], [0.9, 2.35, -3.7], 0.035, P.steel, BONE as any);
  b.rod([0.9, 1.35, -3.7], [0.9, 2.1, -3.75], 0.02, P.steel, BONE as any);
  put(cyl(0.16, 0.22, 8), P.hullDark, [0.9, 2.45, -3.72], { dir: [0, 0.35, -1] });
  lit(cyl(0.13, 0.04, 8), P.lampWhite, [0.9, 2.45, -3.83], 2, { dir: [0, 0.35, -1] });

  // ---------- antenna masts with flags ----------
  const ants: [number, number, number, number][] = [
    [1.2, 2.5, 2.35, 1.2],
    [-1.2, 2.5, 2.35, 0.8],
  ];
  for (const [x, y, z, h] of ants) {
    put(cyl(0.07, 0.1, 6), P.hullDark, [x, y + 0.04, z]);
    b.rod([x, y, z], [x * 1.02, y + h, z - 0.05], [0.025, 0.008], P.steel, BONE as any);
    lit(new THREE.SphereGeometry(0.035, 6, 4), P.warnRed, [x * 1.02, y + h + 0.03, z - 0.05], 1.8);
    b.cards([frame([x * 1.02, y + h - 0.25, z - 0.05], [0, 1, 0])], flagTex, {
      size: [0.3, 0.2],
      lean: 90,
      flow: [0, 0, -1],
      bend: 20,
      bone: body,
    } as any);
  }

  // ---------- deck rail details: tie-down lights and clamps ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = -3.3 + i * 1.5;
      put(box(0.12, 0.1, 0.22), P.trim, [s * 1.18, 1.34, z]);
      put(cyl(0.025, 0.12, 6), P.steel, [s * 1.18, 1.42, z]);
    }
  }

  // ---------- rear tail strip & grime plates ----------
  lit(box(1.6, 0.06, 0.04), P.warnRed, [0, 0.7, -4.06], 1.6);
  for (let i = 0; i < 5; i++) {
    const s = R() > 0.5 ? 1 : -1;
    put(box(0.4 + R() * 0.3, 0.2, 0.02), grime, [s * 1.215, 0.7 + R() * 0.4, -3 + R() * 5]);
  }
}
    return buildNeonAndDetail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.45,2.6], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gun"] = b.joint("gun", { parent: J["turretYaw"], at: [0,2.75,2.8], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.2,0.62,2.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.2,0.62,2.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.2,0.62,-1.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.2,0.62,-1.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.2,0.62,-3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.2,0.62,-3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["podLid"] = b.joint("podLid", { parent: J["body"], at: [0,2.7,-1.1], dir: [0,0,1], role: "hinge", group: "cargo" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
