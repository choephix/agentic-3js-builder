import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, mix, smoothstep, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow, glow as glowKit } from "../../../../kits/glow";

export const meta = {
  "name": "Warhound 77 Armored Truck",
  "description": "A low-poly cyberpunk militarized 6x6 truck from 2077 with armored cab, roof turret, wheel rig and a modular cargo bed with missile pods, neon and hazard trim."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2f3540",
  hullDark: "#1a1e26",
  hullLight: "#545d6c",
  trim: "#e7b814",
  black: "#0b0c10",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  glass: "#0d2a3a",
  tire: "#15161a",
  rim: "#8a919e",
  red: "#d0212b",
  olive: "#4b5a3a",
  steel: "#9aa3b0",
  orangeLamp: "#ff8a1c",
};
const M = {
  chassisTop: [0, 1.3, 0] as [number, number, number],
  frontAxle: [0, 0.62, 3.1] as [number, number, number],
  midAxle: [0, 0.62, -1.6] as [number, number, number],
  rearAxle: [0, 0.62, -3] as [number, number, number],
  cabFloor: [0, 1.3, 2.9] as [number, number, number],
  cabRoof: [0, 2.75, 2.7] as [number, number, number],
  turretRing: [0, 2.75, 2.2] as [number, number, number],
  cargoDeck: [0, 1.3, -2.4] as [number, number, number],
  bumperFront: [0, 0.9, 4.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);
  const mud = (base: any) =>
    paint((p, n, s) => {
      const m = smoothstep(0.75, 0.35, p.y + (noise(p, 0.25, 4) - 0.5) * 0.3);
      return mix(base as string, "#4a3a28", m * 0.7);
    });
  const hullPaint = mud(panelled(P.hull, { size: 0.5, rivets: 0.1 }));
  const darkPaint = mud(panelled(P.hullDark, { size: 0.4, rivets: 0.12 }));
  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, flat: true, ...extra });

  // main rails
  for (const s of [1, -1]) {
    box(0.22, 0.38, 8.6, hullPaint, [s * 0.75, 1.1, 0]);
    box(0.34, 0.08, 8.6, darkPaint, [s * 0.75, 1.3, 0]);
    box(0.34, 0.08, 8.6, darkPaint, [s * 0.75, 0.9, 0]);
    // side skirts with hazard stripes
    box(0.1, 0.34, 6.0, hullPaint, [s * 1.25, 0.6, -0.3]);
    for (let i = 0; i < 12; i++)
      box(0.11, 0.3, 0.18, i % 2 ? P.trim : P.black, [s * 1.26, 0.6, 2.2 - i * 0.5], { rotation: [0, 0, 0] });
    // underbody glow strips
    glow(box(0.04, 0.05, 5.6, P.neonCyan, [s * 1.0, 0.42, -0.3]), 1.5);
    glow(box(0.05, 0.05, 0.8, P.neonCyan, [s * 1.3, 0.85, 3.9]), 1.2);
    // fuel tanks
    const tank = b.lathe(
      [[0, -0.7], [0.26, -0.65], [0.3, -0.5], [0.3, 0.5], [0.26, 0.65], [0, 0.7]],
      { at: [s * 1.0, 0.62, -0.2], axis: [0, 0, 1], segments: 8, bone: body, color: metal("steel") },
    );
    for (const z of [-0.45, 0.45])
      b.part(new THREE.BoxGeometry(0.4, 0.05, 0.08), P.black, { bone: body, at: [s * 1.0, 0.62, -0.2 + z], flat: true });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 6), P.red, { bone: body, at: [s * 1.0, 0.94, -0.2] });
    // cable bundles
    for (let k = 0; k < 3; k++)
      b.rod([s * (0.55 + k * 0.05), 0.82 - k * 0.03, -4.0], [s * (0.55 + k * 0.05), 0.82 - k * 0.03, 3.6], 0.025, k % 2 ? P.neonMagenta : P.black, { bone: body, sides: 5 });
    // exhaust stacks behind cab
    b.rod([s * 1.15, 1.3, 1.1], [s * 1.15, 2.7, 1.1], 0.1, metal("iron"), { bone: body, sides: 8 });
    b.rod([s * 1.15, 2.7, 1.1], [s * 1.15, 2.95, 1.1], 0.13, P.black, { bone: body, sides: 8 });
    b.rod([s * 1.15, 1.4, 1.1], [s * 1.15, 2.6, 1.1], 0.015, P.rim, { bone: body });
    for (const y of [1.7, 2.1, 2.5]) b.part(new THREE.TorusGeometry(0.11, 0.025, 4, 8), P.steel, { bone: body, at: [s * 1.15, y, 1.1], rotation: [90, 0, 0] });
  }

  // cross members
  for (let i = 0; i < 9; i++) {
    const z = -4.0 + i * 1.0;
    box(1.5, 0.14, 0.14, darkPaint, [0, 1.1, z]);
    box(0.06, 0.2, 0.2, P.trim, [0, 1.1, z + 0.0]);
  }
  // deck plate
  box(2.0, 0.06, 8.6, darkPaint, [0, 1.27, 0]);

  // axles, differentials, drive shafts
  for (const z of [M.frontAxle[2], M.midAxle[2], M.rearAxle[2]]) {
    b.rod([-1.4, 0.62, z], [1.4, 0.62, z], 0.07, metal("steel"), { bone: body, sides: 8 });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), metal("blued"), { bone: body, at: [0, 0.62, z], scale: [1, 0.85, 1.1] });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 8), P.hullLight, { bone: body, at: [0, 0.62, z + 0.28], rotation: [90, 0, 0] });
    for (const s of [1, -1]) box(0.14, 0.14, 0.14, P.hullLight, [s * 0.5, 0.75, z]);
    glow(b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), P.orangeLamp, { bone: body, at: [0, 0.62, z + 0.35], rotation: [90, 0, 0] }), 1);
  }
  b.rod([0, 0.7, 3.1], [0, 0.78, -1.6], 0.06, metal("iron"), { bone: body, sides: 6 });
  b.rod([0, 0.7, -1.6], [0, 0.7, -3.0], 0.06, metal("iron"), { bone: body, sides: 6 });
  for (const z of [1.2, -0.2, -2.3]) b.part(new THREE.SphereGeometry(0.1, 6, 4), P.steel, { bone: body, at: [0, 0.74, z] });

  // hazard / label decals on skirts
  const label = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#e7b814"/><path d="M0 0L12 24H0zM24 0L36 24H24zM48 0L60 24H48z" fill="#0b0c10"/><text x="38" y="17" font-size="12" font-weight="bold" fill="#0b0c10" font-family="monospace">77-WH</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.7, 0.26), "#ffffff", {
      bone: body, at: [s * 1.311, 0.62, -2.6], dir: [s, 0, 0], axis: "z", texture: label,
    });

  // front tow hooks and rear hitch
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.1, 0.03, 4, 8), P.red, { bone: body, at: [s * 0.5, 0.85, 4.35] });
    box(0.2, 0.18, 0.3, P.hullDark, [s * 0.5, 0.9, 4.25]);
  }
  box(0.4, 0.2, 0.3, P.black, [0, 0.9, -4.3]);
  glow(box(1.2, 0.04, 0.04, P.neonMagenta, [0, 0.4, -4.35]), 1.4);
}
    return buildChassis;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: any) {
  const R = 0.62, W = 0.42;
  const rand = rng(77);

  const tirePaint = paint((p, n) => {
    const k = noise(p, 0.12, 3);
    const mud = smoothstep(0.35, 0.0, p.y) * 0.5 * noise(p, 0.2, 9);
    return mix(mix("#15161a", "#24262c", k), "#4a3c2c", mud);
  });
  const rimPaint = paint((p, n) => mix("#6e7582", "#aab2be", noise(p, 0.05, 5) * 0.8 + n.y * 0.1));
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 8} 0 L${i * 10} 16Z" fill="#0b0c10"/>`)
      .join("")}</svg>`,
    { size: 128 }
  );
  const warn = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 2 L30 29 H2Z" fill="#e7b814" stroke="#0b0c10" stroke-width="2"/><rect x="14.5" y="11" width="3" height="10" fill="#0b0c10"/><rect x="14.5" y="23" width="3" height="3" fill="#0b0c10"/></svg>`,
    { size: 64 }
  );

  const axles: [number, number, string][] = [
    [3.1, 0, "F"], [-1.6, 1, "M"], [-3.0, 2, "R"],
  ];

  for (const [z, ai, tag] of axles) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const j = J["wheel" + tag + side];
      const cx = s * 1.4;
      const ax: [number, number, number] = [s, 0, 0];
      const at = (o: number): [number, number, number] => [cx + s * o, R, z];

      // tire lathe
      b.lathe(
        [[0.3, -W / 2], [R - 0.08, -W / 2], [R, -W / 2 + 0.07], [R, W / 2 - 0.07], [R - 0.08, W / 2], [0.3, W / 2]],
        { at: at(0), axis: ax, segments: 16, color: tirePaint, bone: j }
      );
      // tread blocks
      const blocks = 16;
      for (let i = 0; i < blocks; i++) {
        const a = (i / blocks) * Math.PI * 2;
        const dy = Math.cos(a), dz = Math.sin(a);
        b.part(new THREE.BoxGeometry(W * 0.92, 0.07, 0.12), "#0b0c10", {
          bone: j,
          at: [cx, R + dy * (R + 0.02), z + dz * (R + 0.02)],
          rotation: [(-a * 180) / Math.PI + 90 * 0 , 0, 0],
        });
      }
      // rim
      b.lathe([[0, -0.2], [0.34, -0.2], [0.38, -0.15], [0.38, 0.15], [0.34, 0.2], [0, 0.2]], {
        at: at(s * 0.02), axis: ax, segments: 12, color: rimPaint, bone: j,
      });
      // magenta inner ring
      glow(
        b.lathe([[0.2, 0], [0.3, 0], [0.3, 0.03], [0.2, 0.03]], {
          at: at(s * 0.215), axis: ax, segments: 16, color: P.neonMagenta, bone: j,
        }),
        1.5
      );
      // hub cover
      b.part(new THREE.CylinderGeometry(0.14, 0.17, 0.08, 8), P.steel, {
        bone: j, at: at(s * 0.24), dir: ax,
      });
      // hex lug nuts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.hullDark, {
          bone: j, at: [cx + s * 0.28, R + Math.cos(a) * 0.1, z + Math.sin(a) * 0.1], dir: ax,
        });
      }
      // brake disc (inboard)
      b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.025, 14), "#6e7582", {
        bone: j, at: at(-s * 0.17), dir: ax,
      });
      b.part(new THREE.BoxGeometry(0.12, 0.12, 0.08), P.red, { bone: J.body, at: [cx - s * 0.17, R + 0.3, z], });

      // fender arch (half lathe ring + cap)
      const fy = 1.05;
      b.extrude(
        [[-0.85, 0], [-0.85, 0.12], [-0.55, 0.42], [0.55, 0.42], [0.85, 0.12], [0.85, 0], [0.7, 0], [0.5, 0.25], [-0.5, 0.25], [-0.7, 0]],
        { at: [cx, R + 0.38, z], x: [0, 0, 1], thickness: 0.62, color: P.hull, bone: J.body }
      );
      // hazard trim on fender edge
      b.part(new THREE.PlaneGeometry(1.4, 0.14), "#ffffff", {
        bone: J.body, at: [cx + s * 0.32, R + 0.82, z], dir: [s, 0, 0], axis: "z", texture: hazard,
      });
      // mud flap
      b.part(new THREE.BoxGeometry(0.5, 0.45, 0.04), P.black, {
        bone: J.body, at: [cx, 0.42, z - R - 0.22],
      });
      b.part(new THREE.BoxGeometry(0.4, 0.06, 0.05), P.trim, {
        bone: J.body, at: [cx, 0.6, z - R - 0.22],
      });
      // warning lamps
      glow(
        b.part(new THREE.SphereGeometry(0.05, 6, 4), P.orangeLamp, {
          bone: J.body, at: [cx + s * 0.28, R + 0.8, z + 0.62],
        }),
        1.6
      );
      glow(
        b.part(new THREE.SphereGeometry(0.04, 6, 4), P.red, {
          bone: J.body, at: [cx + s * 0.28, R + 0.8, z - 0.62],
        }),
        1.6
      );
      // decal on fender
      b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
        bone: J.body, at: [cx + s * 0.33, R + 0.55, z + 0.15 * (rand() - 0.5)], dir: [s, 0, 0], axis: "z", texture: warn,
      });
    }
  }
}
    return buildWheels;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: any) {
  const body = J.body;
  const hullPaint = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const t = noise(p, 0.3, 4);
      const lit = n.y > 0.5 ? 1.15 : 1;
      const c = mix(P.hull, P.hullLight, t * 0.4 * lit);
      const dirt = smoothstep(1.8, 1.3, p.y) * 0.5;
      return mix(c, "#3a3226", dirt);
    }),
    { size: 0.35, aspect: 0.8, rivets: 0.07 },
  );
  const hazard = paint((p: THREE.Vector3) => (Math.floor((p.x + p.z) / 0.14) % 2 ? P.trim : P.black));

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, rotation: rot, flat: true });

  // main cab block (rear) and sloped nose via loft
  box(2.9, 1.0, 1.6, hullPaint, [0, 1.8, 2.2]);
  b.loft(
    [
      { at: [0, 1.95, 2.9], w: 2.9, h: 1.3 },
      { at: [0, 1.85, 3.7], w: 2.8, h: 0.95 },
      { at: [0, 1.65, 4.45], w: 2.5, h: 0.6 },
    ],
    { bone: body, color: hullPaint, section: "box" },
  );
  // hood hazard stripe
  box(1.0, 0.04, 1.3, hazard, [0, 2.17, 3.9], [-14, 0, 0]);
  // windshield slanted
  const visor = box(2.3, 0.4, 0.05, P.glass, [0, 2.38, 3.18], [-35, 0, 0]);
  glow(visor, 0.5);
  const hud = svg(
    `<svg viewBox="0 0 120 30"><path d="M5 25 L40 8 L80 8 L115 25" stroke="#2ff3ff" stroke-width="2" fill="none"/><circle cx="60" cy="16" r="6" stroke="#ff2fb4" stroke-width="2" fill="none"/><path d="M10 6h20M90 6h20" stroke="#2ff3ff" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(2.2, 0.36), "#ffffff", {
    bone: body, at: [0, 2.385, 3.22], dir: [0, 0.57, 0.82], axis: "z", texture: hud,
  });
  // roof
  box(3.0, 0.14, 2.0, P.hullDark, [0, 2.72, 2.4]);
  box(2.4, 0.1, 1.5, P.hullLight, [0, 2.8, 2.5]);
  // roof rails & sensors & antennas
  for (const s of [1, -1]) {
    b.rod([s * 1.35, 2.82, 1.5], [s * 1.35, 2.82, 3.2], 0.025, P.steel, { bone: body });
    b.part(new THREE.SphereGeometry(0.1, 8, 5), P.neonCyan, { bone: body, at: [s * 1.1, 2.85, 3.1] });
    b.rod([s * 1.2, 2.8, 1.6], [s * 1.25, 3.5, 1.5], 0.01, P.black, { bone: body });
  }
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), P.orangeLamp, { bone: body, at: [0, 2.88, 3.2] }));

  // side armor, door seams, slits, emblems
  const num = svg(
    `<svg viewBox="0 0 80 60"><rect x="2" y="2" width="76" height="56" fill="none" stroke="#e7b814" stroke-width="3"/><text x="40" y="42" font-size="34" font-family="monospace" font-weight="bold" fill="#e7b814" text-anchor="middle">77</text><text x="10" y="14" font-size="9" fill="#ff2fb4">警</text></svg>`,
    { size: 192 },
  );
  for (const s of [1, -1]) {
    box(0.12, 0.95, 1.5, P.hullLight, [s * 1.5, 1.85, 2.3]);
    box(0.06, 0.8, 0.04, P.black, [s * 1.57, 1.85, 1.55]);
    box(0.06, 0.8, 0.04, P.black, [s * 1.57, 1.85, 3.0]);
    box(0.06, 0.1, 0.5, P.glass, [s * 1.56, 2.2, 2.5]);
    b.part(new THREE.PlaneGeometry(0.6, 0.45), "#ffffff", {
      bone: body, at: [s * 1.575, 1.75, 2.25], dir: [s, 0, 0], axis: "z", texture: num,
    });
    // mirror + camera
    b.rod([s * 1.5, 2.3, 3.0], [s * 1.85, 2.4, 3.1], 0.03, P.steel, { bone: body });
    box(0.1, 0.28, 0.2, P.hullDark, [s * 1.9, 2.4, 3.1]);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone: body, at: [s * 1.9, 2.5, 3.22] }));
    // fender-side headlight strips
    glow(box(0.5, 0.06, 0.05, P.neonCyan, [s * 0.9, 1.7, 4.2]), 1.4);
    glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), P.orangeLamp, { bone: body, at: [s * 1.25, 1.55, 4.35] }), 1.2);
  }
  // bumper, bull bar, winch
  box(2.8, 0.4, 0.4, P.hullDark, [0, 1.0, 4.4]);
  box(2.4, 0.08, 0.1, hazard, [0, 1.22, 4.62]);
  glow(box(2.0, 0.08, 0.06, P.neonCyan, [0, 1.35, 4.62]), 1.5);
  for (const x of [-1, -0.35, 0.35, 1]) b.rod([x, 0.85, 4.5], [x * 1.05, 1.8, 4.3], 0.05, P.steel, { bone: body });
  b.rod([-1.1, 1.55, 4.45], [1.1, 1.55, 4.45], 0.06, P.steel, { bone: body });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 8), P.black, { bone: body, at: [0, 0.95, 4.65], rotation: [0, 0, 90] });
  // grille vents
  for (let i = 0; i < 4; i++) box(1.0, 0.04, 0.04, P.black, [0, 1.5 + i * 0.1, 4.4]);
  box(2.9, 0.1, 1.7, P.hullDark, [0, 1.35, 2.5]);
}
    return buildCab;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: any) {
  const R = rng(77);
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const body = J.body;
  const CX = 0, CZ = 2.2;
  const g = (o: any) => glowKit(o, 1.4);

  const armor = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 1, n.y) * 0.6);
    const w = noise(p, 0.12, 4);
    return mix(base, P.hullDark, w * 0.35);
  });

  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="${P.black}"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 2 L30 29 H2Z" fill="${P.trim}" stroke="${P.black}" stroke-width="2"/><rect x="14.5" y="11" width="3" height="10" fill="${P.black}"/><rect x="14.5" y="23" width="3" height="3" fill="${P.black}"/></svg>`,
    { size: 64 },
  );
  const glyph = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="${P.hullDark}"/><path d="M6 8H26M16 4V28M8 16H24M9 24L16 18L23 24" stroke="${P.neonCyan}" stroke-width="2.5" fill="none"/></svg>`,
    { size: 64 },
  );
  const lensTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#08323c"/><circle cx="16" cy="16" r="10" fill="${P.neonCyan}"/><circle cx="16" cy="16" r="5" fill="#fff"/><circle cx="12" cy="12" r="2" fill="#fff"/></svg>`,
    { size: 64 },
  );

  // ring base on body
  b.lathe([[0, 0], [0.62, 0], [0.62, 0.06], [0.52, 0.1], [0.52, 0.14], [0, 0.14]], {
    at: [CX, 2.75, CZ], bone: body, segments: 12, color: P.hullDark,
  });
  b.lathe([[0.5, 0.14], [0.56, 0.14], [0.56, 0.2], [0.5, 0.2]], { at: [CX, 2.75, CZ], bone: body, segments: 12, color: P.steel });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.steel, {
      bone: body, at: [CX + Math.sin(a) * 0.58, 2.83, CZ + Math.cos(a) * 0.58],
    });
  }
  // neon ring
  g(b.sweep(
    Array.from({ length: 13 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [CX + Math.sin(a) * 0.63, 2.78, CZ + Math.cos(a) * 0.63];
    }),
    { radius: 0.012, color: P.neonCyan, skin: "rigid" },
  ));

  // rotating housing
  b.lathe([[0, 0], [0.55, 0], [0.5, 0.12], [0.46, 0.3], [0.34, 0.42], [0, 0.44]], {
    at: [CX, 2.9, CZ], bone: yaw, segments: 8, color: armor,
  });
  // faceted armor shell front wedge
  b.frustumBox([CX, 3.1, CZ + 0.1], [CX, 3.1, CZ + 0.62], [0.8, 0.32], [0.5, 0.2], { bone: yaw, color: armor });
  b.frustumBox([CX, 3.02, CZ - 0.5], [CX, 3.02, CZ - 0.1], [0.9, 0.28], [0.8, 0.3], { bone: yaw, color: P.hull });
  // side cheek plates
  for (const s of [1, -1]) {
    b.slab([[s * 0.4, 2.95, CZ + 0.5], [s * 0.45, 3.25, CZ + 0.3], [s * 0.45, 3.25, CZ - 0.3], [s * 0.4, 2.95, CZ - 0.5]], {
      bone: yaw, color: P.hullLight, thickness: 0.05,
    });
    b.part(new THREE.PlaneGeometry(0.22, 0.06), "#ffffff", {
      bone: yaw, at: [s * 0.47, 3.1, CZ + 0.15], dir: [s, 0, 0], axis: "z", texture: hazard,
    });
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      bone: yaw, at: [s * 0.47, 3.1, CZ - 0.15], dir: [s, 0, 0], axis: "z", texture: warn,
    });
    // smoke grenade launchers
    for (let k = 0; k < 3; k++) {
      const z = CZ - 0.3 + k * 0.12;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 6), P.olive, {
        bone: yaw, at: [s * 0.55, 3.18, z], dir: [s * 0.6, 0.8, 0.4],
      });
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 6), P.black, {
        bone: yaw, at: [s * 0.6, 3.27, z + 0.04], dir: [s * 0.6, 0.8, 0.4],
      });
    }
  }
  // top hatch + panel glyph
  b.part(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 8), P.hullLight, { bone: yaw, at: [CX - 0.15, 3.3, CZ - 0.2] });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: yaw, at: [CX + 0.2, 3.27, CZ - 0.25], dir: [0, 1, 0], axis: "z", texture: glyph,
  });

  // sensor ball on mast
  b.rod([CX + 0.3, 3.2, CZ - 0.1], [CX + 0.3, 3.42, CZ - 0.1], 0.03, { bone: yaw, color: P.steel });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), P.hullDark, { bone: yaw, at: [CX + 0.3, 3.45, CZ - 0.1] });
  g(b.part(new THREE.SphereGeometry(0.075, 8, 6), "#ffffff", {
    bone: yaw, at: [CX + 0.3, 3.45, CZ - 0.04], rotation: [0, -90, 0], texture: lensTex,
  }));
  // antenna
  b.rod([CX - 0.35, 3.2, CZ - 0.4], [CX - 0.4, 3.5, CZ - 0.45], [0.012, 0.005], { bone: yaw, color: P.black });

  // ammo box with belt
  b.part(new THREE.BoxGeometry(0.26, 0.24, 0.3), P.olive, { bone: yaw, at: [CX + 0.52, 3.0, CZ + 0.05] });
  b.part(new THREE.BoxGeometry(0.27, 0.04, 0.31), P.hullDark, { bone: yaw, at: [CX + 0.52, 3.1, CZ + 0.05] });
  b.part(new THREE.BoxGeometry(0.14, 0.06, 0.04), P.trim, { bone: yaw, at: [CX + 0.52, 3.0, CZ + 0.22] });
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.05), P.trim, {
      bone: yaw, at: [CX + 0.46 - t * 0.28, 3.02 + Math.sin(t * 3) * 0.04, CZ + 0.27 + t * 0.2],
    });
  }

  // gun cradle on pitch
  b.part(new THREE.BoxGeometry(0.5, 0.26, 0.34), P.hullDark, { bone: pitch, at: [CX, 3.05, CZ + 0.5] });
  b.part(new THREE.BoxGeometry(0.34, 0.2, 0.1), P.hullLight, { bone: pitch, at: [CX, 3.05, CZ + 0.72] });
  for (const s of [1, -1]) {
    const x = s * 0.17;
    b.rod([x, 3.05, CZ + 0.7], [x, 3.05, CZ + 1.38], 0.035, { bone: pitch, color: P.steel, sides: 8 });
    b.rod([x, 3.05, CZ + 0.8], [x, 3.05, CZ + 1.1], 0.05, { bone: pitch, color: P.hullDark, sides: 8 });
    // muzzle brake
    b.rod([x, 3.05, CZ + 1.38], [x, 3.05, CZ + 1.5], 0.052, { bone: pitch, color: P.black, sides: 6 });
    b.part(new THREE.BoxGeometry(0.12, 0.012, 0.03), P.black, { bone: pitch, at: [x, 3.05, CZ + 1.44] });
    b.part(new THREE.BoxGeometry(0.012, 0.12, 0.03), P.black, { bone: pitch, at: [x, 3.05, CZ + 1.4] });
    // barrel hazard band
    b.rod([x, 3.05, CZ + 1.15], [x, 3.05, CZ + 1.22], 0.042, { bone: pitch, color: P.trim, sides: 8 });
    // targeting laser housing
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.1), P.black, { bone: pitch, at: [s * 0.3, 3.0, CZ + 0.8] });
  }
  // red laser
  g(b.rod([0.3, 3.0, CZ + 0.86], [0.3, 3.0, CZ + 1.9], 0.006, { bone: pitch, color: P.red, sides: 4 }));
  g(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.red, { bone: pitch, at: [0.3, 3.0, CZ + 0.86] }));
  // brass rivets on shell
  for (let i = 0; i < 8; i++) {
    const a = R() * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 5), P.steel, {
      bone: yaw, at: [CX + Math.sin(a) * 0.3, 3.215 + 0.0, CZ + 0.15 + Math.cos(a) * 0.1 - 0.35],
    });
  }
  // cyan visor strip on front wedge
  g(b.part(new THREE.BoxGeometry(0.4, 0.025, 0.02), P.neonCyan, { bone: yaw, at: [CX, 3.12, CZ + 0.5] }));
  // magenta accent
  g(b.part(new THREE.BoxGeometry(0.02, 0.02, 0.6), P.neonMagenta, { bone: yaw, at: [-0.4, 3.0, CZ - 0.1] }));
}
    return buildTurret;
  })(),
  // cargo
  (() => {
function buildCargo({ b, J, P, M }: any) {
  const R = rng(77);
  const body = J.body;
  const radar = J.radar;
  const X0 = -1.5, X1 = 1.5, Z0 = -4.5, Z1 = 1.3, Y0 = 1.3, Y1 = 3.3;
  const cx = 0, cz = (Z0 + Z1) / 2, W = X1 - X0, L = Z1 - Z0;

  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: body, at, ...o });

  // paints
  const armor = paint((p: any, n: any) => {
    let c: any = mix(P.hull, P.hullLight, noise(p, 0.3, 3) * 0.4 + (n.y > 0.5 ? 0.25 : 0));
    const sz = 0.5;
    const du = Math.abs(((p.z / sz) % 1 + 1) % 1 - 0.5);
    const dv = Math.abs(((p.y / 0.5) % 1 + 1) % 1 - 0.5);
    if (du > 0.47 || dv > 0.47) c = mix(c, P.black, 0.8);
    if (p.y < 1.7) c = mix(c, "#4a3b2a", 0.45 * smoothstep(1.7, 1.3, p.y));
    return c;
  });
  const dark = paint((p: any, n: any) => mix(P.hullDark, P.hull, noise(p, 0.2, 5) * 0.5 + (n.y > 0.5 ? 0.2 : 0)));
  const hazard = paint((p: any) => (Math.floor((p.x + p.z + p.y) / 0.14) % 2 ? P.trim : P.black));

  // glyph decal texture
  const GLYPH = svg(`<svg viewBox="0 0 64 64"><g fill="none" stroke="#e7b814" stroke-width="5" stroke-linecap="round"><path d="M8 18H56M32 6V58M14 34H50M20 50L44 50"/></g></svg>`, { size: 128 });
  const WARN = svg(`<svg viewBox="0 0 64 64"><path d="M32 6L60 56H4Z" fill="#e7b814" stroke="#0b0c10" stroke-width="4"/><rect x="29" y="22" width="6" height="19" fill="#0b0c10"/><rect x="29" y="45" width="6" height="6" fill="#0b0c10"/></svg>`, { size: 96 });
  const NUM = svg(`<svg viewBox="0 0 96 64"><text x="48" y="48" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="48" fill="#ff2fb4">77</text></svg>`, { size: 128 });

  // main box shell with sloped top edges
  box(W - 0.1, 1.4, L, armor, [0, 2.0, cz]);
  box(W - 0.5, 0.3, L - 0.2, dark, [0, 2.85, cz]);
  // chamfer plates on top edges
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.35, 0.12, L - 0.1), armor, { bone: body, at: [s * 1.3, 2.78, cz], rotation: [0, 0, -s * 30] });
    // ribs
    for (let i = 0; i < 9; i++) {
      const z = Z0 + 0.4 + i * 0.6;
      box(0.1, 1.5, 0.12, dark, [s * 1.52, 2.1, z]);
    }
    // hazard stripe lower
    box(0.04, 0.16, L - 0.2, hazard, [s * 1.51, 1.55, cz]);
    // neon strips
    glow(box(0.04, 0.05, L - 0.4, P.neonMagenta, [s * 1.53, 2.95 - 0.05, cz]), 1.5);
    glow(box(0.04, 0.05, L - 0.4, P.neonMagenta, [s * 1.53, 1.75, cz]), 1.5);
    // decals
    b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: body, at: [s * 1.54, 2.35, -0.5], dir: [s, 0, 0], axis: "z", texture: GLYPH });
    b.part(new THREE.PlaneGeometry(0.35, 0.35), "#ffffff", { bone: body, at: [s * 1.54, 2.2, -2.6], dir: [s, 0, 0], axis: "z", texture: WARN });
    b.part(new THREE.PlaneGeometry(0.8, 0.55), "#ffffff", { bone: body, at: [s * 1.54, 2.7, -3.6], dir: [s, 0, 0], axis: "z", texture: NUM });
    // jerry cans
    for (let k = 0; k < 3; k++) {
      const z = -1.9 + k * 0.3;
      box(0.2, 0.34, 0.24, P.olive, [s * 1.65, 1.6, z]);
      box(0.08, 0.06, 0.08, P.black, [s * 1.65, 1.82, z]);
    }
    // crates
    box(0.3, 0.4, 0.7, P.olive, [s * 1.67, 1.65, -3.3]);
    box(0.32, 0.06, 0.72, P.trim, [s * 1.67, 1.88, -3.3]);
    // tie-down cables
    for (let k = 0; k < 2; k++)
      b.sweep([[s * 1.68, 1.9, -3.0 - k * 0.6], [s * 1.74, 1.75, -3.3 - k * 0.6], [s * 1.68, 1.5, -3.6 - k * 0.6]], 0.012, { bone: body, color: P.black });
    // rivets
    for (let i = 0; i < 8; i++) b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, { bone: body, at: [s * 1.52, 2.55, Z0 + 0.7 + i * 0.6] });
  }

  // top hatches
  for (const s of [1, -1]) {
    const h = box(0.9, 0.06, 1.3, hazard, [s * 0.5, 3.03, -1.4], { rotation: [0, 0, -s * 8] });
    box(0.5, 0.08, 0.08, P.steel, [s * 0.5, 3.1, -1.4]);
  }
  box(0.08, 0.1, 1.4, P.black, [0, 3.0, -1.4]);

  // missile pods
  for (const s of [1, -1]) {
    const pod = box(0.9, 0.7, 1.4, dark, [s * 0.75, 3.15, -3.4], { rotation: [-25, 0, 0] });
    box(0.95, 0.06, 1.45, hazard, [s * 0.75, 3.15, -3.4], { rotation: [-25, 0, 0] });
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-25 * Math.PI / 180, 0, 0));
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const local = new THREE.Vector3((c - 1) * 0.28, (r - 0.5) * 0.3, 0.72).applyQuaternion(q);
        const at = [s * 0.75 + local.x, 3.15 + local.y, -3.4 + local.z];
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), P.black, { bone: body, at, dir: [0, Math.sin(25 * Math.PI / 180), Math.cos(25 * Math.PI / 180)] });
        const wh = b.part(new THREE.ConeGeometry(0.075, 0.14, 6), P.red, { bone: body, at, dir: [0, Math.sin(25 * Math.PI / 180), Math.cos(25 * Math.PI / 180)] });
      }
  }

  // rear ramp door
  box(2.6, 1.3, 0.12, armor, [0, 2.0, Z0 - 0.05]);
  box(2.2, 0.1, 0.06, hazard, [0, 1.5, Z0 - 0.13]);
  box(2.2, 0.1, 0.06, hazard, [0, 2.6, Z0 - 0.13]);
  b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", { bone: body, at: [0, 2.05, Z0 - 0.14], dir: [0, 0, -1], axis: "z", texture: GLYPH });
  for (const s of [1, -1]) {
    glow(cyl(0.14, 0.14, 0.12, 8, P.orangeLamp, [s * 0.9, 2.8, Z0 - 0.1], { dir: [0, 0, -1] }), 2);
    glow(box(0.35, 0.12, 0.06, P.red, [s * 1.15, 1.7, Z0 - 0.12]), 2);
    glow(box(0.35, 0.12, 0.06, P.red, [s * 0.7, 1.7, Z0 - 0.12]), 1.5);
  }
  // rear bumper
  box(2.9, 0.28, 0.3, P.black, [0, 1.45, Z0 - 0.2]);
  box(2.9, 0.06, 0.32, hazard, [0, 1.62, Z0 - 0.2]);
  glow(box(2.0, 0.05, 0.05, P.neonMagenta, [0, 1.3 + 0.1, Z0 - 0.38]), 1.5);

  // radar mast
  cyl(0.1, 0.14, 0.3, 8, P.hullDark, [-1, 3.35, -1]);
  const mast = b.rod([-1, 3.3, -1], [-1, 3.8, -1], 0.04, { bone: radar, color: P.steel });
  b.part(new THREE.ConeGeometry(0.4, 0.2, 10, 1, true), P.steel, { bone: radar, at: [-1, 3.95, -0.85], rotation: [-100, 0, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 5), P.black, { bone: radar, at: [-1, 3.95, -0.9], rotation: [80, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.red, { bone: radar, at: [-1, 3.9, -0.7] }), 2);
  // antenna whips
  for (const [x, z, h] of [[1.2, -4.2, 1.4], [1.35, 0.9, 1.0]] as number[][]) {
    b.rod([x, 3.3, z], [x + 0.08, 3.3 + h, z - 0.06], [0.015, 0.006], { bone: body, color: P.black });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.red, { bone: body, at: [x + 0.08, 3.3 + h, z - 0.06] }), 2);
  }
  // front face behind cab
  box(2.7, 1.2, 0.1, dark, [0, 2.0, Z1 - 0.05]);
  // cable run on roof
  b.sweep([[-1.2, 3.02, 1.0], [-1.2, 3.1, -0.5], [-1.0, 3.3, -1.0]], 0.02, { bone: body, color: P.black });
}
    return buildCargo;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhound77" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.3,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.75,2.2], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,3.05,2.2], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.4,0.62,3.1], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.4,0.62,3.1], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.4,0.62,-1.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.4,0.62,-1.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.4,0.62,-3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.4,0.62,-3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["radar"] = b.joint("radar", { parent: J["body"], at: [-1,3.2,-1], dir: [0,1,0], role: "hinge", group: "cargo" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
