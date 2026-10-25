import * as THREE from "three";
import { createBuilder, mix, mottle, noise, paint, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a turret-mounted coil railgun, deployed hydraulic stabiliser legs, rear spade, camo paint and glowing capacitor strips.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "railgun_carrier", paintSize: 2048 });

  // ---------- palette ----------
  const DARK = "#2a2e33";
  const STEEL = "#78828e";
  const CHROME = "#c5cdd6";
  const TIRE = mottle("#1a1b1d", "#2f3033", { size: 0.2, seed: 3 });
  const YELLOW = "#e0b020";
  const COPPER = "#b5683a";
  const BLUED = "#34476a";
  const CYAN = "#5ee8ff";
  const GLASS = "#10222b";

  const camo = mottle("#566038", "#7d7852", { size: 1.1, contrast: 2.2, seed: 4 });
  const MUD = [0.32, 0.26, 0.18] as const;
  const HULL = paint((p, n) => {
    let c = camo.at(p, n);
    const d = smoothstep(1.4, 0.6, p.y) * (0.3 + 0.7 * noise(p, 0.35, 9));
    c = mix(c, MUD, d * 0.75);
    const l = 0.88 + 0.14 * Math.max(n.y, 0);
    return [c[0] * l, c[1] * l, c[2] * l] as const;
  });
  const BANDS = paint((p) => ((((Math.floor(p.z * 4) % 2) + 2) % 2) ? "#d9a21b" : "#3b5072"));

  // ---------- textures ----------
  const WINDOW = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fc4d8"/><stop offset="1" stop-color="#16303c"/></linearGradient></defs><rect x="1.5" y="1.5" width="97" height="37" rx="5" fill="url(#g)" stroke="#101418" stroke-width="3"/><path d="M20 38 L38 3 L48 3 L30 38Z" fill="#ffffff" opacity=".4"/><path d="M52 38 L62 3 L66 3 L56 38Z" fill="#ffffff" opacity=".3"/></svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="29" fill="#1f2418" stroke="#e8dfb0" stroke-width="3.5"/><path d="M32 8 L38 26 L57 26 L42 37 L48 55 L32 44 L16 55 L22 37 L7 26 L26 26Z" fill="#e8dfb0" transform="scale(.7) translate(14 12)"/><text x="32" y="56" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#e8dfb0">07</text></svg>`,
    { size: 256 },
  );
  let hz = "";
  for (let i = 0; i < 10; i++)
    hz += `<path d="M${i * 16} 16 L${i * 16 + 8} 0 L${i * 16 + 16} 0 L${i * 16 + 8} 16Z" fill="#141414"/>`;
  const HAZARD = svg(
    `<svg viewBox="0 0 128 16" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="16" fill="#e0b020"/>${hz}<rect x="1" y="1" width="126" height="14" fill="none" stroke="#141414" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  let slats = "";
  for (let i = 0; i < 8; i++) slats += `<rect x="4" y="${4 + i * 3.6}" width="56" height="1.8" fill="#4a5058"/>`;
  const GRILLE = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" rx="3" fill="#15181b" stroke="#07080a" stroke-width="2"/>${slats}</svg>`,
    { size: 256 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="62" height="30" rx="3" fill="#e0b020" stroke="#141414" stroke-width="2.5"/><path d="M22 4 L12 18 L19 18 L15 28 L27 13 L20 13Z" fill="#141414"/><text x="45" y="23" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="15" fill="#141414">HV</text></svg>`,
    { size: 256 },
  );
  const RAILTXT = svg(
    `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg"><text x="100" y="29" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="26" fill="#e8e0c0">MK-IV RAILGUN</text></svg>`,
    { size: 512 },
  );

  // ---------- skeleton ----------
  const hull = b.joint("hull", { at: [0, 1.4, 0] });
  const turret = b.joint("turret", { parent: hull, at: [0, 2.3, -0.8] });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.9, -0.8], dir: [0, 0, 1] });

  // ---------- helpers ----------
  const box = (size: V, color: any, at: V, bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, flat: true, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: V, bone: any, dir: V = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir, flat: true });
  const plane = (w: number, h: number, tex: any, at: V, dir: V, bone: any, up?: V) => {
    const o: any = { bone, at, dir, axis: "z", texture: tex };
    if (up) o.up = up;
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", o);
  };
  const ringZ = (r0: number, r1: number, w: number, at: V, color: any, bone: any, seg = 8) =>
    b.lathe(
      [
        [r0, -w / 2],
        [r1, -w / 2],
        [r1, w / 2],
        [r0, w / 2],
      ],
      { at, axis: [0, 0, 1], segments: seg, color, bone },
    );

  // ---------- hull ----------
  b.extrude(
    [
      [-1.1, 0],
      [1.1, 0],
      [1.35, 0.25],
      [1.35, 0.7],
      [-1.35, 0.7],
      [-1.35, 0.25],
    ],
    { at: [0, 0.8, 0], x: [1, 0, 0], thickness: 9, color: HULL, bone: hull },
  );
  // engine / equipment bay
  b.extrude(
    [
      [-1.3, 0],
      [1.3, 0],
      [1.3, 0.55],
      [1.0, 0.8],
      [-1.0, 0.8],
      [-1.3, 0.55],
    ],
    { at: [0, 1.5, -1.05], x: [1, 0, 0], thickness: 6.7, color: HULL, bone: hull },
  );
  // cab
  b.extrude(
    [
      [2.2, 1.5],
      [4.5, 1.5],
      [4.5, 2.1],
      [3.9, 2.7],
      [2.6, 2.7],
      [2.2, 2.4],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, color: HULL, bone: hull },
  );
  // under-armour & bumper
  box([2.9, 0.4, 0.5], DARK, [0, 1.0, 4.6], hull);
  plane(2.8, 0.3, HAZARD, [0, 1.0, 4.86], [0, 0, 1], hull);
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 0.9, 4.8], [s * 0.8, 0.9, 5.15], 0.06, STEEL, { bone: hull });
    box([0.3, 0.12, 0.12], STEEL, [s * 0.8, 0.9, 5.15], hull);
  }

  // cab glazing & lights
  plane(2.1, 0.85, WINDOW, [0, 2.4 + 0.012, 4.2 + 0.012], [0, 0.707, 0.707], hull, [0, 0.707, -0.707]);
  for (const s of [1, -1]) {
    plane(1.3, 0.55, WINDOW, [s * 1.215, 2.2, 3.3], [s, 0, 0], hull);
    box([0.1, 0.1, 0.35], DARK, [s * 1.25, 1.95, 3.9], hull); // door handle
    b.rod([s * 1.2, 2.4, 3.95], [s * 1.5, 2.5, 4.0], 0.03, DARK, { bone: hull });
    box([0.08, 0.35, 0.22], DARK, [s * 1.52, 2.5, 4.0], hull); // mirror
    glow(box([0.38, 0.22, 0.06], "#fff1b0", [s * 0.95, 1.8, 4.52], hull), 1.6);
    glow(box([0.3, 0.14, 0.06], "#ff3a2a", [s * 1.0, 2.0, -4.43], hull), 1.4);
  }
  plane(1.2, 0.5, GRILLE, [0, 1.8, 4.505], [0, 0, 1], hull);
  plane(1.5, 0.65, GRILLE, [0, 1.95, -4.405], [0, 0, -1], hull);

  // roof gear
  box([1.4, 0.06, 0.3], DARK, [0, 2.73, 3.0], hull);
  glow(cyl(0.12, 0.14, 0.18, 8, "#ffae1a", [0.7, 2.8, 3.1], hull), 1.5);
  b.part(new THREE.SphereGeometry(0.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { bone: hull, at: [-0.6, 2.72, 3.2], flat: true });
  glow(box([0.14, 0.08, 0.05], CYAN, [-0.6, 2.85, 3.38], hull), 1.5);
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 2.7, 2.5], [s * 1.2 + s * 0.1, 5.2, 2.3], [0.025, 0.008], DARK, { bone: hull });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), YELLOW, { bone: hull, at: [s * 1.3, 5.2, 2.3] });
  }
  // gun cradle on cab
  b.rod([0, 2.7, 3.15], [0, 3.57, 3.15], 0.2, DARK, { bone: hull, section: "box" } as any);
  box([1.15, 0.16, 0.3], STEEL, [0, 3.65, 3.15], hull);

  // radar mast
  b.rod([-0.8, 2.3, 1.5], [-0.8, 3.0, 1.5], 0.05, STEEL, { bone: hull });
  b.lathe(
    [
      [0, 0],
      [0.15, 0.02],
      [0.32, 0.1],
      [0.32, 0.13],
      [0.15, 0.05],
      [0, 0.04],
    ],
    { at: [-0.8, 3.05, 1.5], axis: [0, 0.3, 1], segments: 10, color: CHROME, bone: hull },
  );

  // bay top details
  for (let i = 0; i < 4; i++) box([1.1, 0.07, 0.14], DARK, [0, 2.33, -3.6 + i * 0.28], hull);
  box([0.7, 0.08, 0.7], STEEL, [0, 2.34, 1.5], hull); // hatch
  for (const s of [1, -1]) {
    cyl(0.13, 0.15, 1.0, 8, DARK, [s * 0.95, 2.8, -3.9], hull);
    cyl(0.18, 0.18, 0.08, 8, STEEL, [s * 0.95, 3.3, -3.9], hull);
    glow(cyl(0.1, 0.1, 0.02, 8, "#ff7a2a", [s * 0.95, 3.35, -3.9], hull), 1.2);
    // bay side marking
    plane(0.55, 0.5, EMBLEM, [s * 1.311, 1.78, -2.4], [s, 0, 0], hull);
    plane(1.0, 0.16, HAZARD, [s * 1.311, 1.6, -3.8], [s, 0, 0], hull);
    // toolbox & jerrycans on fenders
    box([0.6, 0.3, 1.0], DARK, [s * 1.9, 1.7, -2.7], hull);
    box([0.1, 0.06, 0.4], CHROME, [s * 1.9, 1.88, -2.7], hull);
    box([0.28, 0.45, 0.18], "#6a6a40", [s * 1.8, 1.8, 0.0], hull);
    box([0.28, 0.45, 0.18], "#6a6a40", [s * 1.8, 1.8, 0.35], hull);
  }

  // ---------- rear spade ----------
  b.extrude(
    [
      [-1.4, 0.35],
      [1.4, 0.35],
      [1.15, -0.9],
      [-1.15, -0.9],
    ],
    { at: [0, 0.9, -4.65], x: [1, 0, 0], thickness: 0.2, color: HULL, bone: hull },
  );
  for (const s of [1, -1]) {
    b.rod([s * 0.7, 1.3, -4.0], [s * 0.7, 0.75, -4.7], 0.07, CHROME, { bone: hull });
    box([0.12, 0.7, 0.12], DARK, [s * 0.4, 0.5, -4.78], hull);
  }

  // ---------- wheels ----------
  const tireProfile: [number, number][] = [
    [0, -0.28],
    [0.5, -0.28],
    [0.66, -0.26],
    [0.7, -0.18],
    [0.7, -0.05],
    [0.64, 0],
    [0.7, 0.05],
    [0.7, 0.18],
    [0.66, 0.26],
    [0.5, 0.28],
    [0, 0.28],
  ];
  const wz = [3.3, 0.3, -2.7];
  const wheel = (name: string, s: number, z: number) => {
    const c: V = [s * 1.75, 0.7, z];
    const j = b.joint(name, { parent: hull, at: c, dir: [s, 0, 0] });
    b.lathe(tireProfile, { at: c, axis: [1, 0, 0], segments: 14, color: TIRE, bone: j });
    cyl(0.38, 0.38, 0.6, 10, STEEL, c, j, [1, 0, 0]);
    cyl(0.4, 0.4, 0.06, 10, CHROME, [s * 2.03, 0.7, z], j, [1, 0, 0]);
    cyl(0.14, 0.14, 0.1, 8, DARK, [s * 2.07, 0.7, z], j, [1, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 6), CHROME, {
        bone: j,
        at: [s * 2.07, 0.7 + 0.26 * Math.cos(a), z + 0.26 * Math.sin(a)],
        dir: [1, 0, 0],
      });
    }
    // mud flap behind
    box([0.05, 0.4, 0.5], DARK, [s * 1.75, 1.0, z - 0.85], hull);
  };
  for (const z of wz) {
    wheel("wheelL" + wz.indexOf(z), 1, z);
    wheel("wheelR" + wz.indexOf(z), -1, z);
    b.rod([-1.5, 0.7, z], [1.5, 0.7, z], 0.12, DARK, { bone: hull });
    b.part(new THREE.SphereGeometry(0.3, 8, 6), STEEL, { bone: hull, at: [0, 0.65, z], flat: true });
  }
  // fenders
  for (const z of wz)
    for (const s of [1, -1]) {
      box([1.0, 0.08, 1.7], HULL, [s * 1.8, 1.54, z], hull);
      box([0.07, 0.4, 1.7], HULL, [s * 2.3, 1.4, z], hull);
    }

  // ---------- stabiliser legs ----------
  const legZ = [1.85, -1.2];
  const names: Record<string, string> = {};
  for (const s of [1, -1])
    for (const z of legZ) {
      const nm = `stab${z > 0 ? "F" : "B"}${s > 0 ? "L" : "R"}`;
      names[nm] = nm;
      const A: V = [s * 1.45, 1.3, z];
      const F: V = [s * 3.2, 0.3, z];
      const j = b.joint(nm, { parent: hull, at: A, aim: F });
      box([0.3, 0.7, 0.8], DARK, [s * 1.4, 1.15, z], hull);
      const mid: V = [A[0] + (F[0] - A[0]) * 0.55, A[1] + (F[1] - A[1]) * 0.55, z];
      b.rod(A, mid, 0.17, BLUED, { bone: j });
      b.rod(mid, F, 0.09, CHROME, { bone: j });
      b.rod([s * 1.45, 0.95, z], [s * 3.1, 0.35, z], 0.07, DARK, { bone: j });
      b.part(new THREE.SphereGeometry(0.17, 6, 5), STEEL, { bone: j, at: F, flat: true });
      cyl(0.5, 0.5, 0.14, 8, DARK, [s * 3.2, 0.07, z], j);
      cyl(0.42, 0.42, 0.1, 8, YELLOW, [s * 3.2, 0.19, z], j);
    }

  // ---------- turret ----------
  b.lathe(
    [
      [0, 0],
      [1.35, 0],
      [1.35, 0.15],
      [1.2, 0.25],
      [0, 0.25],
    ],
    { at: turret.at, segments: 10, color: DARK, bone: turret },
  );
  b.extrude(
    [
      [-2.4, 2.55],
      [0.8, 2.55],
      [0.8, 3.0],
      [0.2, 3.5],
      [-1.9, 3.5],
      [-2.4, 3.1],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, color: HULL, bone: turret },
  );
  box([1.1, 0.25, 1.2], DARK, [0, 3.625, -0.9], turret);
  // cupola
  cyl(0.3, 0.3, 0.22, 8, STEEL, [-0.55, 3.6, -1.5], turret);
  b.part(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), HULL, { bone: turret, at: [-0.55, 3.7, -1.5], flat: true });
  glow(box([0.3, 0.08, 0.05], CYAN, [-0.55, 3.62, -1.2], turret), 1.4);
  // sensor pod
  box([0.4, 0.3, 0.3], DARK, [0.5, 3.65, -1.7], turret);
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), "#ff4a3a", { bone: turret, at: [0.5, 3.65, -1.52] }), 1.5);

  for (const s of [1, -1]) {
    // capacitors
    cyl(0.3, 0.3, 2.2, 10, BANDS, [s * 1.3, 3.1, -0.9], turret, [0, 0, 1]);
    for (const e of [1.1, -1.1])
      b.part(new THREE.SphereGeometry(0.3, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
        bone: turret,
        at: [s * 1.3, 3.1, -0.9 + e],
        dir: [0, 0, e > 0 ? 1 : -1],
        flat: true,
      });
    for (const z of [-1.6, -0.2]) box([0.4, 0.14, 0.3], DARK, [s * 1.15, 2.85, z], turret);
    plane(0.5, 0.25, LABEL, [s * 1.011, 2.75, -1.9], [s, 0, 0], turret);
    // cables
    b.sweep(
      [
        [s * 1.3, 3.1, 0.3],
        [s * 1.2, 3.4, 0.6],
        [s * 0.8, 3.8, 0.1],
        [s * 0.4, 3.85, -1.2],
        [s * 0.35, 3.9, -2.6],
      ],
      0.04,
      { color: "#15171a", bone: turret, sides: 5 },
    );
    // cheeks
    box([0.15, 0.5, 1.0], STEEL, [s * 0.55, 3.75, -0.9], turret);
  }

  // ---------- railgun ----------
  const RZ0 = -3.0;
  const RZ1 = 7.3;
  const RC = (RZ0 + RZ1) / 2;
  const RL = RZ1 - RZ0;
  box([0.3, 0.2, RL - 0.4], DARK, [0, 3.9, RC], gun);
  for (const s of [1, -1]) {
    box([0.26, 0.34, RL], COPPER, [s * 0.3, 3.9, RC], gun);
    glow(box([0.06, 0.025, RL - 1.2], CYAN, [s * 0.3, 4.07, RC + 0.4], gun), 1.8);
    box([0.2, 0.28, 0.4], CHROME, [s * 0.3, 3.9, RZ1 + 0.2], gun);
    plane(0.8, 0.16, RAILTXT, [s * 0.651, 3.9, -3.35], [s, 0, 0], gun);
  }
  box([1.3, 0.64, 0.9], HULL, [0, 3.9, -3.35], gun);
  glow(box([0.5, 0.06, 0.04], CYAN, [0, 4.1, -2.89], gun), 1.6);
  for (let i = 0; i < 7; i++) {
    const z = 0.9 + i * 0.9;
    ringZ(0.42, 0.66, 0.2, [0, 3.9, z], i % 2 ? BLUED : COPPER, gun);
    b.lathe(
      [
        [0.45, 0],
        [0.6, 0],
        [0.6, 0.012],
        [0.45, 0.012],
      ],
      { at: [0, 3.9, z + 0.1], axis: [0, 0, 1], segments: 8, color: CYAN, bone: gun },
    );
    // wire to glow
  }
  const rings = b.root.children.length; // keep reference used
  void rings;
  // glow facing rings need glow call
  // (rebuild glow ring faces as glowing parts)
  // muzzle
  ringZ(0.4, 0.78, 0.3, [0, 3.9, 7.0], STEEL, gun);
  for (const s of [1, -1]) box([0.08, 0.5, 0.3], DARK, [s * 0.82, 3.9, 7.0], gun);
  glow(box([0.4, 0.04, 0.04], CYAN, [0, 3.9, 7.46], gun), 2);

  // glow the ring faces: find by building a second set (cheap and explicit)
  for (let i = 0; i < 7; i++) {
    const z = 0.9 + i * 0.9;
    glow(
      ringZ(0.44, 0.58, 0.012, [0, 3.9, z + 0.112], CYAN, gun),
      1.7,
    );
  }

  return b.root;
}
