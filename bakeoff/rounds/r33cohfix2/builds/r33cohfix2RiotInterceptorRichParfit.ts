import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng, offset, catmull } from "../../../../src/index";
import { panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Arasaka-style Riot Interceptor RC-9",
  "description": "A corporate armored riot-control interceptor truck with a roof water cannon, neon light bars and cyberpunk grime and decals."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2b303a",
  hullDark: "#14171d",
  armor: "#454c59",
  hazard: "#f2c200",
  corpRed: "#d1202f",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  glass: "#0b1a24",
  rubber: "#0e0e10",
  rim: "#7b8494",
  steel: "#8d96a5",
  tankBlue: "#2a5d86",
  white: "#e8ecef",
  amber: "#ff9a1f",
};
const M = {
  chassisTop: [0, 1.3, 0] as [number, number, number],
  axleFront: [0, 0.5, 1.9] as [number, number, number],
  axleMid: [0, 0.5, 0.2] as [number, number, number],
  axleRear: [0, 0.5, -1.7] as [number, number, number],
  cabFloor: [0, 1.3, 1.1] as [number, number, number],
  turretRing: [0, 2.15, 0.1] as [number, number, number],
  cannonPivot: [0, 2.45, 0.3] as [number, number, number],
  tankBay: [0, 1.3, -1.9] as [number, number, number],
  bumperFront: [0, 0.75, 3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(5);

  const grime = (base: string) =>
    paint((p, n) => {
      const g = smoothstep(0.75, 0.3, p.y) * (0.5 + 0.5 * noise(p, 0.18, 3));
      const c = mix(base, P.hullDark, Math.min(1, g * 0.9));
      return mix(c, "#3a3226", 0.25 * smoothstep(0.6, 0.3, p.y) * noise(p, 0.07, 9));
    });
  const HULL = grime(P.hull);
  const ARMOR = grime(P.armor);

  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.hazard}"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M${i * 8} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 16Z" fill="#111"/>`).join("") +
      `</svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" rx="3" fill="#e8ecef" stroke="#111" stroke-width="2"/><text x="32" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#111">RC-9 NC</text></svg>`,
    { size: 256 },
  );

  // main hull loft: wedge, nose to tail
  b.loft(
    [
      { at: [0, 0.8, -2.95], w: 2.3, h: 0.9 },
      { at: [0, 0.82, -1.5], w: 2.5, h: 0.95 },
      { at: [0, 0.82, 0.2], w: 2.5, h: 0.95 },
      { at: [0, 0.8, 1.8], w: 2.4, h: 0.9 },
      { at: [0, 0.72, 2.6], w: 2.0, h: 0.6 },
    ],
    { bone: body, color: panelled(HULL), section: "box", name: "hull" } as any,
  );

  // upper deck plate
  b.frustumBox([0, 1.28, -2.9], [0, 1.28, 2.5], [2.3, 0.1], [1.9, 0.1], { bone: body, color: ARMOR });

  // underbody
  b.frustumBox([0, 0.34, -2.8], [0, 0.34, 2.5], [1.6, 0.18], [1.4, 0.18], { bone: body, color: P.hullDark });

  // side skirts with hazard chevrons and fender arches
  const wheelZ = [M.axleFront[2], M.axleMid[2], M.axleRear[2]];
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.3, 5.3), P.hullDark, { bone: body, at: [s * 1.28, 0.5, -0.1] });
    b.part(new THREE.PlaneGeometry(5.2, 0.28), "#ffffff", {
      bone: body,
      at: [s * 1.335, 0.5, -0.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: HAZ,
    });
    for (const z of wheelZ) {
      // fender arch: lintel + side cheeks
      b.part(new THREE.BoxGeometry(0.34, 0.1, 1.15), P.armor, { bone: body, at: [s * 1.2, 1.02, z] });
      b.part(new THREE.BoxGeometry(0.36, 0.14, 1.25), P.hullDark, { bone: body, at: [s * 1.2, 1.1, z] });
      for (const dz of [-0.55, 0.55]) b.part(new THREE.BoxGeometry(0.3, 0.5, 0.08), P.armor, { bone: body, at: [s * 1.2, 0.85, z + dz] });
      // arch rivets
      for (let i = 0; i < 3; i++)
        b.part(new THREE.SphereGeometry(0.02, 5, 4), P.steel, { bone: body, at: [s * 1.38, 1.1, z - 0.35 + i * 0.35] });
    }
    // plate number
    b.part(new THREE.PlaneGeometry(0.4, 0.15), "#ffffff", { bone: body, at: [s * 1.345, 0.95, 1.1], dir: [s, 0, 0], axis: "z", texture: PLATE });
    // side neon strip
    b.part(new THREE.BoxGeometry(0.03, 0.04, 4.6), P.neonCyan, { bone: body, at: [s * 1.31, 0.68, -0.1] });
    // exhaust pipe
    b.capsule([s * 0.55, 0.45, -2.2], [s * 0.55, 0.45, -3.0], 0.06, P.steel, { bone: body });
  }

  // axles and driveshaft
  for (const z of wheelZ) {
    b.rod([-1.05, 0.5, z], [1.05, 0.5, z], 0.06, P.steel, { bone: body });
    b.part(new THREE.SphereGeometry(0.17, 8, 6), P.hullDark, { bone: body, at: [0, 0.5, z] });
  }
  b.rod([0, 0.45, -1.7], [0, 0.45, 1.9], 0.05, P.rim, { bone: body });
  for (let i = 0; i < 4; i++) b.part(new THREE.BoxGeometry(0.1, 0.1, 0.08), P.steel, { bone: body, at: [0, 0.45, -1 + i * 0.9] });

  // underside glow strips and hazard deck edges
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.04, 4), P.neonMagenta, { bone: body, at: [s * 0.72, 0.28, 0] });
    b.part(new THREE.PlaneGeometry(5.4, 0.1), "#ffffff", { bone: body, at: [s * 1.2, 1.3, -0.1], dir: [s * 0.2, 0.3, 0], axis: "z", texture: HAZ });
  }

  // deck rivets
  for (let i = 0; i < 12; i++) {
    const z = -2.6 + i * 0.45;
    for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), P.steel, { bone: body, at: [s * 1.08, 1.34, z] });
  }
}
    return buildChassis;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.5; // tyre radius
  const W = 0.46; // tyre width
  const bone = J.body;

  const grime = paint((p, n) => {
    const g = noise(p, 0.12, 4);
    const base = mix("#0e0e10", "#2a2824", smoothstep(0.5, 0.8, g) * 0.8);
    return n.y > 0.6 ? mix(base, "#3a3226", 0.3) : base;
  });
  const rimPaint = paint((p, n) => mix(P.rim, P.steel, noise(p, 0.05, 2) * 0.8 + n.y * 0.1));
  const discPaint = paint((p) => mix("#6b7280", "#a0a8b6", noise(p, 0.03, 8)));

  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#2ff3ff" stroke-width="6"/><circle cx="32" cy="32" r="10" fill="#14171d"/><path d="M32 6V16M32 48V58M6 32H16M48 32H58" stroke="#2ff3ff" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#f2c200"/><path d="M0 32L16 0H32L16 32ZM32 32L48 0H64L48 32Z" fill="#14171d"/></svg>`,
    { size: 128 },
  );

  // tyre profile (x = radius, y = along axle)
  const tyre = [
    [R * 0.62, -W / 2], [R * 0.9, -W / 2], [R, -W * 0.36], [R, W * 0.36],
    [R * 0.9, W / 2], [R * 0.62, W / 2],
  ] as [number, number][];
  const rimProf = [
    [0, -W * 0.3], [R * 0.64, -W * 0.3], [R * 0.64, W * 0.3], [0, W * 0.3],
  ] as [number, number][];

  const axles = [M.axleFront[2], M.axleMid[2], M.axleRear[2]];
  const lugGeo = new THREE.BoxGeometry(0.1, 0.07, 0.12);
  const boltGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6);

  for (const z of axles) {
    // axle housing + differential
    b.rod([-1.05, 0.5, z], [1.05, 0.5, z], 0.07, P.hullDark, { bone, sides: 8 });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.armor, { bone, at: [0, 0.5, z], scale: [1, 1, 0.9] });

    for (const s of [1, -1]) {
      const x = s * 1.05;
      const axis: [number, number, number] = [s, 0, 0];
      // tyre
      b.lathe(tyre, { at: [x, 0.5, z], axis, segments: 14, color: grime, bone });
      // tread blocks
      const n = 14;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const py = 0.5 + Math.sin(a) * (R + 0.02);
        const pz = z + Math.cos(a) * (R + 0.02);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-a + Math.PI / 2 * 0 , 0, 0));
        b.part(lugGeo, P.rubber, {
          bone, at: [x, py, pz], quat: q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), a),
        });
      }
      // rim
      b.lathe(rimProf, { at: [x + s * 0.02, 0.5, z], axis, segments: 12, color: rimPaint, bone });
      // outer hub plate with neon ring
      const out = x + s * (W * 0.3 + 0.025);
      glow(
        b.part(new THREE.CircleGeometry(0.3, 16), "#ffffff", {
          bone, at: [out, 0.5, z], dir: axis, axis: "z", texture: hubTex,
        }),
        1.6,
      );
      b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.06, 8), P.hullDark, {
        bone, at: [out + s * 0.03, 0.5, z], dir: axis,
      });
      // lug bolts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        b.part(boltGeo, P.steel, {
          bone,
          at: [out + s * 0.01, 0.5 + Math.sin(a) * 0.2, z + Math.cos(a) * 0.2],
          dir: axis,
        });
      }
      // brake disc inboard
      b.lathe(
        [[0.08, -0.012], [0.3, -0.012], [0.3, 0.012], [0.08, 0.012]],
        { at: [x - s * (W / 2 + 0.05), 0.5, z], axis, segments: 12, color: discPaint, bone },
      );
      // caliper
      b.part(new THREE.BoxGeometry(0.07, 0.14, 0.12), P.corpRed, {
        bone, at: [x - s * (W / 2 + 0.05), 0.5 + 0.27, z],
      });
      // mud flap behind tyre
      const flap = b.part(new THREE.BoxGeometry(0.4, 0.34, 0.03), P.rubber, {
        bone, at: [x, 0.3, z - R - 0.08],
      });
      b.part(new THREE.PlaneGeometry(0.3, 0.1), "#ffffff", {
        bone, at: [x, 0.2, z - R - 0.097], dir: [0, 0, -1], axis: "z", texture: hazard,
      });
      void flap;
      // flap bracket
      b.rod([x, 0.5 + 0.2, z - R - 0.08], [x, 0.5 + 0.2, z - R + 0.05], 0.02, P.steel, { bone, sides: 6 });
    }
  }
}
    return buildWheels;
  })(),
  // cabShell
  (() => {
function buildCabShell({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const HULL = paint((p, n) => {
    const base = mix(P.hull, P.armor, smoothstep(0.4, 0.9, noise(p, 0.3, 3)) * 0.6);
    const top = mix(base, "#5a6272", Math.max(n.y, 0) * 0.35);
    return mix(top, P.hullDark, smoothstep(1.6, 1.3, p.y) * 0.6);
  });
  const PLATE = panelled(HULL, { size: 0.45, rivets: 0.06 });

  const glass = svg(`<svg viewBox="0 0 64 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c4a5e"/><stop offset="0.5" stop-color="#0b1a24"/><stop offset="1" stop-color="#0a121a"/></linearGradient></defs><rect width="64" height="32" fill="url(#g)"/><path d="M4 30 L22 2 L28 2 L10 30Z" fill="#7fe8ff" opacity="0.22"/><path d="M30 30 L42 2 L45 2 L33 30Z" fill="#7fe8ff" opacity="0.15"/></svg>`, { size: 128 });
  const emblem = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#d1202f" stroke-width="5"/><path d="M32 10 L48 50 L40 50 L32 30 L24 50 L16 50Z" fill="#d1202f"/><rect x="14" y="40" width="36" height="5" fill="#d1202f"/></svg>`, { size: 128 });
  const cage = svg(`<svg viewBox="0 0 64 32"><g stroke="#14171d" stroke-width="5">${[8, 20, 32, 44, 56].map((x) => `<path d="M${x} 0V32"/>`).join("")}<path d="M0 16H64"/></g></svg>`, { size: 128 });

  const box = (w: number, h: number, d: number, c: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, flat: true, ...opts });

  // cab body: lower box + sloped roof loft
  b.loft(
    [
      { at: [0, 1.65, -0.55], w: 2.3, h: 0.7 },
      { at: [0, 1.7, 0.7], w: 2.3, h: 0.8 },
      { at: [0, 1.62, 2.1], w: 2.2, h: 0.65 },
    ],
    { bone, color: PLATE, section: "box" },
  );
  // sloped upper greenhouse
  b.loft(
    [
      { at: [0, 2.05, -0.5], w: 2.1, h: 0.25 },
      { at: [0, 2.08, 0.9], w: 2.0, h: 0.25 },
      { at: [0, 1.92, 1.9], w: 1.8, h: 0.2 },
    ],
    { bone, color: HULL, section: "box" },
  );
  // roof plate
  box(2.0, 0.06, 1.5, P.armor, [0, 2.2, 0.35]);

  // windshield slit
  b.part(new THREE.PlaneGeometry(1.7, 0.26), "#ffffff", { bone, at: [0, 1.93, 2.04], dir: [0, 0.4, 1], axis: "z", texture: glass });
  box(1.8, 0.05, 0.05, P.hullDark, [0, 2.07, 2.0], { dir: [0, 0.3, 1], axis: "z" });
  box(1.8, 0.05, 0.05, P.hullDark, [0, 1.79, 2.1]);

  for (const s of [1, -1]) {
    // A-pillars
    b.rod([s * 1.0, 1.8, 2.12], [s * 0.95, 2.18, 1.7], 0.05, { bone, color: P.armor });
    // side windows + cages + doors
    const x = s * 1.12;
    b.part(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", { bone, at: [x + s * 0.01, 1.95, 1.0], dir: [s, 0, 0], axis: "z", texture: glass });
    b.part(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", { bone, at: [x + s * 0.03, 1.95, 1.0], dir: [s, 0, 0], axis: "z", texture: cage });
    box(0.05, 0.9, 1.2, P.armor, [s * 1.14, 1.75, 1.0], { flat: true });
    box(0.03, 0.04, 0.2, P.steel, [s * 1.18, 1.72, 0.55]);
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone, at: [s * 1.185, 1.5, 1.0], dir: [s, 0, 0], axis: "z", texture: emblem });
    // hazard stripe on sill
    box(0.04, 0.06, 2.4, P.hazard, [s * 1.17, 1.36, 0.85]);
    // mirrors
    b.rod([s * 1.15, 1.85, 1.9], [s * 1.5, 1.95, 1.9], 0.025, { bone, color: P.hullDark });
    box(0.08, 0.2, 0.14, P.hullDark, [s * 1.55, 1.95, 1.9]);
    box(0.01, 0.16, 0.1, P.neonCyan, [s * 1.51, 1.95, 1.9]);
    // roof rails
    b.rod([s * 0.9, 2.25, -0.4], [s * 0.9, 2.25, 1.7], 0.025, { bone, color: P.steel });
    for (const z of [-0.4, 0.5, 1.7]) b.rod([s * 0.9, 2.2, z], [s * 0.9, 2.26, z], 0.02, { bone, color: P.steel });
    // amber strobes
    glow(box(0.22, 0.1, 0.12, P.amber, [s * 0.7, 2.2, 1.85]), 1.6);
    // sensor pods
    b.part(new THREE.SphereGeometry(0.1, 8, 6), P.hullDark, { bone, at: [s * 0.85, 2.27, -0.3] });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { bone, at: [s * 0.85, 2.3, -0.22] }), 1.5);
  }
  // roof strobe bar
  box(1.0, 0.05, 0.08, P.hullDark, [0, 2.21, 1.85]);
  // antenna
  b.rod([-0.8, 2.22, -0.5], [-0.85, 2.9, -0.5], 0.01, { bone, color: P.steel });
  // rear window bar
  box(2.0, 0.2, 0.05, P.hullDark, [0, 1.8, -0.58]);
  glow(box(1.6, 0.03, 0.03, P.neonCyan, [0, 1.97, -0.6]), 1.4);
  // front brow with cyan edge
  box(2.1, 0.06, 0.1, P.armor, [0, 2.1, 2.05]);
  glow(box(1.9, 0.02, 0.02, P.neonCyan, [0, 2.12, 2.1]), 1.4);
  // hazard roof stripes
  for (let i = 0; i < 4; i++) box(0.3, 0.015, 0.12, i % 2 ? P.hullDark : P.hazard, [-0.45 + i * 0.3, 2.235, -0.3 + R() * 0.0]);
}
    return buildCabShell;
  })(),
  // noseBumper
  (() => {
function buildNoseBumper({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  const grime = paint((p, n) => {
    const g = 1 - smoothstep(0.35, 1.0, p.y);
    const base = mix(P.hull, P.hullDark, g * 0.7 * (0.5 + noise(p, 0.15, 3)));
    return n.y > 0.7 ? mix(base, P.armor, 0.3) : base;
  });
  const hazardPaint = paint((p) => (Math.floor((p.x + p.y * 0.8) / 0.12) % 2 === 0 ? P.hazard : P.hullDark));

  // sloped hood: wedge extrude in side profile
  b.extrude(
    [[0, 0], [0.8, 0], [0.8, 0.45], [0.5, 0.78], [0, 1.0]],
    { at: [-1.2, 0.5, 2.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: grime, bone },
  );
  // hood side to fill thickness direction: extrude thickness runs along x
  // front fascia
  box(2.5, 0.55, 0.12, grime, [0, 0.8, 2.98]);
  // grille with cyan glow behind
  glow(box(1.5, 0.3, 0.04, P.neonCyan, [0, 0.88, 3.0]), 1.5);
  for (let i = 0; i < 7; i++) box(1.5, 0.025, 0.05, P.hullDark, [0, 0.76 + i * 0.045, 3.03]);
  // headlights: slim neon strips
  for (const s of [1, -1]) {
    glow(box(0.55, 0.06, 0.04, P.white, [s * 0.85, 1.05, 3.01]), 1.6);
    glow(box(0.55, 0.03, 0.04, P.amber, [s * 0.85, 0.99, 3.01]), 1.2);
  }
  // neon bumper bar
  box(2.6, 0.2, 0.2, P.hullDark, [0, 0.55, 2.95]);
  glow(box(1.25, 0.07, 0.05, P.neonCyan, [-0.65, 0.57, 3.07]), 2);
  glow(box(1.25, 0.07, 0.05, P.neonMagenta, [0.65, 0.57, 3.07]), 2);
  // ram plow
  b.part(new THREE.BoxGeometry(2.5, 0.3, 0.15), hazardPaint, { bone, at: [0, 0.42, 3.0] });
  const plow = b.extrude(
    [[-1.3, 0], [1.3, 0], [1.1, 0.25], [-1.1, 0.25]],
    { at: [0, 0.36, 2.9], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, color: P.steel, bone },
  );
  void plow;
  // push bars
  for (const s of [-0.7, 0, 0.7]) {
    b.rod([s, 0.4, 2.9], [s, 0.9, 3.05], 0.04, P.steel, { bone });
  }
  // tow hooks
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 0.42, 3.0], [s * 0.95, 0.42, 3.15], 0.035, P.amber, { bone });
    b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 8), P.amber, { bone, at: [s * 0.95, 0.42, 3.17] });
  }
  // emblem decal on hood
  const emblem = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#14171d" stroke="#d1202f" stroke-width="6"/><path d="M50 14 L82 80 L66 80 L50 44 L34 80 L18 80Z" fill="#d1202f"/><rect x="26" y="62" width="48" height="8" fill="#d1202f"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", {
    bone, at: [0, 1.36, 2.55], dir: [0, 0.75, 0.66], axis: "z", texture: emblem,
  });
  // warning text decals
  const warn = svg(
    `<svg viewBox="0 0 200 40"><rect width="200" height="40" fill="#f2c200"/><text x="100" y="28" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="#14171d">DISPERSE · RC-9</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.8, 0.16), "#ffffff", {
    bone, at: [0.6, 0.72, 3.05], dir: [0, 0, 1], axis: "z", texture: warn,
  });
  const kanji = svg(
    `<svg viewBox="0 0 120 40"><text x="60" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#2ff3ff">NO CROSSING</text></svg>`,
    { size: 256 },
  );
  glow(b.part(new THREE.PlaneGeometry(0.6, 0.2), "#ffffff", {
    bone, at: [-0.6, 0.72, 3.05], dir: [0, 0, 1], axis: "z", texture: kanji,
  }), 1);
  // hood vents and side armor
  for (const s of [1, -1]) {
    box(0.06, 0.5, 0.7, P.armor, [s * 1.27, 0.95, 2.6]);
    box(0.5, 0.05, 0.4, P.hullDark, [s * 0.7, 1.28, 2.55], { rotation: [-35, 0, 0] });
  }
}
    return buildNoseBumper;
  })(),
  // turretBase
  (() => {
function buildTurretBase({ b, J, P, M }: Ctx) {
  const bone = J.turret;
  const [cx, cy, cz] = M.turretRing;
  const plate = paint((p, n) => {
    const w = n.y > 0.5 ? 1 : 0.8;
    const c = (0.17 + 0.05 * Math.sin(p.x * 40) * Math.sin(p.z * 40)) * w;
    return [c, c + 0.01, c + 0.03] as [number, number, number];
  });
  const hazardPaint = paint((p) => {
    const k = Math.floor((p.x + p.z) / 0.06) % 2 === 0;
    return k ? P.hazard : P.hullDark;
  });
  const lathe = (o: [number, number][], at: [number, number, number], color: any, seg = 16) =>
    b.lathe(o, { at, segments: seg, color, bone });

  // pedestal
  lathe([[0, 0], [0.62, 0], [0.62, 0.05], [0.5, 0.18], [0.46, 0.3], [0, 0.3]], [cx, cy, cz], plate);
  // hazard ring
  lathe([[0.5, 0], [0.66, 0], [0.66, 0.05], [0.5, 0.05]], [cx, cy + 0.05, cz], hazardPaint, 24);
  // rotating collar
  lathe([[0, 0], [0.52, 0], [0.52, 0.08], [0.44, 0.1], [0, 0.1]], [cx, cy + 0.3, cz], P.steel);
  // collar bolts
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.rim, {
      bone, at: [cx + Math.sin(a) * 0.48, cy + 0.4, cz + Math.cos(a) * 0.48],
    });
  }
  // shield housing
  b.part(new THREE.BoxGeometry(0.9, 0.34, 0.6), plate, { bone, at: [cx, cy + 0.57, cz + 0.05], flat: true });
  b.part(new THREE.BoxGeometry(0.8, 0.2, 0.3), P.armor, { bone, at: [cx, cy + 0.5, cz + 0.45], rotation: [-25, 0, 0], flat: true });
  // side shield wings
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.4, 0.55), P.armor, { bone, at: [s * 0.5, cy + 0.6, cz + 0.2], flat: true });
    b.part(new THREE.BoxGeometry(0.07, 0.04, 0.55), P.hazard, { bone, at: [s * 0.5, cy + 0.82, cz + 0.2] });
  }
  // camera eye decal
  const eye = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#111"/><circle cx="32" cy="32" r="22" fill="#d1202f"/><circle cx="32" cy="32" r="13" fill="#1a0408"/><circle cx="27" cy="27" r="5" fill="#fff"/><path d="M4 32h10M50 32h10" stroke="#2ff3ff" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.CircleGeometry(0.09, 16), "#ffffff", {
    bone, at: [cx, cy + 0.6, cz + 0.37], dir: [0, 0, 1], axis: "z", texture: eye,
  });
  // beacon
  lathe([[0, 0], [0.12, 0], [0.12, 0.03], [0, 0.03]], [cx - 0.3, cy + 0.74, cz - 0.1], P.steel, 8);
  glow(b.part(new THREE.CylinderGeometry(0.08, 0.1, 0.14, 8), P.neonMagenta, {
    bone, at: [cx - 0.3, cy + 0.84, cz - 0.1],
  }), 1.6);
  b.part(new THREE.ConeGeometry(0.03, 0.05, 6), P.hullDark, { bone, at: [cx - 0.3, cy + 0.94, cz - 0.1] });
  // cable bundles
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.15, cy + 0.3, cz - 0.25], [s * 0.3, cy + 0.2, cz - 0.4], [s * 0.35, cy + 0.02, cz - 0.5]],
      0.03, { color: P.hullDark, bone, sides: 6 },
    );
  }
  // seat platform behind
  const pz = cz - 0.5;
  b.part(new THREE.BoxGeometry(0.9, 0.05, 0.4), P.armor, { bone, at: [cx, cy + 0.2, pz], flat: true });
  b.part(new THREE.BoxGeometry(0.92, 0.02, 0.06), hazardPaint, { bone, at: [cx, cy + 0.23, pz - 0.2] });
  b.part(new THREE.BoxGeometry(0.4, 0.08, 0.3), P.rubber, { bone, at: [cx, cy + 0.28, pz], flat: true });
  b.part(new THREE.BoxGeometry(0.4, 0.3, 0.07), P.rubber, { bone, at: [cx, cy + 0.45, pz - 0.14], flat: true });
  // handrails
  for (const s of [1, -1]) {
    for (const z of [pz - 0.18, pz + 0.18]) {
      b.rod([s * 0.42, cy + 0.22, z], [s * 0.42, cy + 0.55, z], 0.015, P.steel, { bone, sides: 6 });
    }
    b.rod([s * 0.42, cy + 0.55, pz - 0.18], [s * 0.42, cy + 0.55, pz + 0.18], 0.015, P.steel, { bone, sides: 6 });
  }
  b.rod([-0.42, cy + 0.55, pz - 0.18], [0.42, cy + 0.55, pz - 0.18], 0.015, P.steel, { bone, sides: 6 });
  // cyan accent strip on shield
  glow(b.part(new THREE.BoxGeometry(0.7, 0.02, 0.02), P.neonCyan, { bone, at: [cx, cy + 0.72, cz + 0.36] }), 1.4);
}
    return buildTurretBase;
  })(),
  // waterCannon
  (() => {
function buildWaterCannon({ b, J, P, M }: Ctx) {
  const bone = J.cannon;
  const [px, py, pz] = M.cannonPivot;
  const at = (x: number, y: number, z: number): [number, number, number] => [px + x, py + y, pz + z];
  const Z: [number, number, number] = [0, 0, 1];

  // barrel paint: hazard stripes near the muzzle, grime elsewhere
  const barrelPaint = paint((p, n) => {
    const g = noise(p, 0.08, 3);
    let c = mix(P.armor, P.hull, 0.3 + 0.5 * g);
    const stripe = (((p.z + p.y * 0.0) / 0.1) % 2 + 2) % 2 < 1;
    if (p.z > 1.55 && p.z < 1.85) c = mix(stripe ? P.hazard : P.hullDark, c, 0.0);
    c = mix(c, P.hullDark, 0.4 * smoothstep(0.3, -0.8, n.y));
    return c;
  });

  // main barrel: tapered
  b.part(new THREE.CylinderGeometry(0.17, 0.2, 1.4, 10), barrelPaint, { bone, at: at(0, 0, 0.85), dir: Z });
  // breech block
  b.part(new THREE.BoxGeometry(0.4, 0.36, 0.4), P.hull, { bone, at: at(0, 0, 0.1), flat: true });
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 10), P.steel, { bone, at: at(0, 0, -0.05), dir: Z });
  // reinforcing bands
  for (const z of [0.3, 0.7, 1.1, 1.45]) {
    b.part(new THREE.CylinderGeometry(0.235 - z * 0.02, 0.235 - z * 0.02, 0.07, 10), P.steel, { bone, at: at(0, 0, z), dir: Z });
    b.part(new THREE.TorusGeometry(0.22 - z * 0.02, 0.012, 4, 12), P.rim, { bone, at: at(0, 0, z + 0.05), dir: Z, axis: "z" });
  }
  // flared nozzle
  b.lathe(
    [[0.12, 0], [0.22, 0.02], [0.3, 0.2], [0.33, 0.28], [0.29, 0.28], [0.19, 0.04], [0.12, 0.02]],
    { at: at(0, 0, 1.82), axis: Z, segments: 12, color: P.armor, bone },
  );
  b.part(new THREE.TorusGeometry(0.315, 0.025, 5, 14), P.hazard, { bone, at: at(0, 0, 2.1), dir: Z, axis: "z" });
  glow(b.part(new THREE.CircleGeometry(0.25, 12), P.neonCyan, { bone, at: at(0, 0, 1.93), dir: Z, axis: "z" }), 1.6);
  glow(b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 8), P.neonCyan, { bone, at: at(0, 0, 1.84), dir: Z }), 1.4);

  // side lamps
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.12, 0.2), P.hullDark, { bone, at: at(s * 0.27, 0.05, 0.8), flat: true });
    glow(b.part(new THREE.BoxGeometry(0.06, 0.08, 0.02), P.white, { bone, at: at(s * 0.27, 0.05, 0.91) }), 1.5);
    b.rod(at(s * 0.22, 0.02, 0.8), at(s * 0.27, 0.05, 0.8), 0.02, P.steel, { bone });
  }

  // magenta laser sight on top
  b.part(new THREE.BoxGeometry(0.08, 0.08, 0.3), P.hullDark, { bone, at: at(0, 0.27, 0.6), flat: true });
  glow(b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6), P.neonMagenta, { bone, at: at(0, 0.27, 0.78), dir: Z }), 2);
  glow(b.rod(at(0, 0.27, 0.8), at(0, 0.27, 2.1), 0.006, P.neonMagenta, { bone, sides: 4 }), 1.5);

  // pressure gauge decal on a side housing
  const gauge = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e8ecef" stroke="#14171d" stroke-width="5"/>
    <path d="M20 70 A38 38 0 1 1 80 70" stroke="#14171d" stroke-width="4" fill="none"/>
    <path d="M62 38 A38 38 0 0 1 80 70" stroke="#d1202f" stroke-width="7" fill="none"/>
    <path d="M50 50 L66 34" stroke="#d1202f" stroke-width="5"/><circle cx="50" cy="50" r="6" fill="#14171d"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.BoxGeometry(0.1, 0.16, 0.2), P.hull, { bone, at: at(0.24, -0.12, 0.35), flat: true });
  b.part(new THREE.CircleGeometry(0.06, 14), "#ffffff", { bone, at: at(0.296, -0.12, 0.35), dir: [1, 0, 0], axis: "z", texture: gauge });

  // ribbed feed hose from the breech down to the turret ring
  const start = at(0, -0.1, -0.1);
  const end: [number, number, number] = [0, M.turretRing[1] + 0.12, M.turretRing[2] - 0.05];
  const hosePath = [start, at(0, -0.1, -0.35), [0, py - 0.35, pz - 0.35], end] as number[][];
  const hose = b.sweep(hosePath, 0.055, { bone, color: P.hullDark, sides: 8 });
  b.along(hose, 7, (a) =>
    b.part(new THREE.TorusGeometry(0.06, 0.016, 4, 8), P.steel, { bone, frame: a, at: a.at, dir: a.axis, axis: "z" }),
  );
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 8), P.steel, { bone, at: end, dir: [0, 1, 0] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), P.steel, { bone, at: start, dir: [0, 1, 0] });

  // hazard stripe wrap near the base of barrel
  const hz = paint((p) => (((p.x + p.y) / 0.06) % 2 + 2) % 2 < 1 ? P.hazard : P.hullDark);
  b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.12, 10), hz, { bone, at: at(0, 0, 0.5), dir: Z });
}
    return buildWaterCannon;
  })(),
  // tankBay
  (() => {
function buildTankBay({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });

  const grime = (base: string) =>
    paint((p, n) =>
      mix(mix(base, "#0a0b0e", 0.5 * smoothstep(1.9, 1.3, p.y)), "#000000", 0.25 * noise(p, 0.12, 4)),
    );
  const HULL = grime(P.hull);
  const ARM = grime(P.armor);

  // Deck
  box(2.5, 0.08, 2.3, P.hullDark, [0, 1.34, -1.85]);

  // Water tank
  const tankBlue = paint((p, n) =>
    mix(P.tankBlue, "#0d2236", 0.4 * smoothstep(0.2, -0.8, n.y) + 0.2 * noise(p, 0.15, 2)),
  );
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 14), tankBlue, {
    bone, at: [-0.1, 1.95, -1.55], dir: [1, 0, 0], axis: "y",
  });
  for (const x of [-0.7, -0.2, 0.3]) {
    b.part(new THREE.CylinderGeometry(0.53, 0.53, 0.07, 14), P.steel, {
      bone, at: [x - 0.05, 1.95, -1.55], dir: [1, 0, 0], axis: "y",
    });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.5, 10, 6), tankBlue, {
      bone, at: [-0.1 + s * 0.75, 1.95, -1.55], scale: [0.35, 1, 1],
    });
  }
  // Level gauge decal
  const gauge = svg(
    `<svg viewBox="0 0 32 96"><rect x="2" y="2" width="28" height="92" rx="6" fill="#0b1a24" stroke="#e8ecef" stroke-width="3"/><rect x="7" y="40" width="18" height="50" fill="#2ff3ff"/><g stroke="#e8ecef" stroke-width="3"><path d="M7 20h8M7 40h8M7 60h8M7 80h8"/></g></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.16, 0.48), "#ffffff", {
      bone, at: [0.15, 2.2, -2.06], dir: [0, 0.4, -1], axis: "z", texture: gauge,
    }),
    0.5,
  );

  // Equipment cabinet
  box(0.85, 0.85, 1.0, ARM, [0.8, 1.78, -1.35]);
  box(0.85, 0.1, 1.0, P.hullDark, [0.8, 2.25, -1.35]);
  for (let i = 0; i < 4; i++) box(0.02, 0.05, 0.7, P.hullDark, [1.235, 1.6 + i * 0.12, -1.35]);

  // Rear doors
  for (const s of [1, -1]) {
    box(1.1, 0.85, 0.06, HULL, [s * 0.58, 1.78, -2.97]);
    box(0.05, 0.3, 0.05, P.steel, [s * 0.06, 1.78, -3.02]);
    box(0.9, 0.04, 0.02, P.hazard, [s * 0.58, 1.5, -3.01]);
  }
  // Hazard bumper
  const hz = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c200"/><path d="M0 16L12 0h12L12 16zM24 16L36 0h12L36 16zM48 16L60 0h12L60 16z" fill="#14171d"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.BoxGeometry(2.5, 0.2, 0.14), "#ffffff", {
    bone, at: [0, 1.3, -3.0], texture: hz,
  });

  // Tail light bar
  glow(box(1.1, 0.07, 0.05, P.corpRed, [-0.6, 2.2, -3.02]), 1.6);
  glow(box(1.1, 0.07, 0.05, P.neonMagenta, [0.6, 2.2, -3.02]), 1.6);
  for (const s of [1, -1]) glow(box(0.1, 0.1, 0.05, P.corpRed, [s * 1.2, 1.62, -3.02]), 1.5);

  // Exhaust stacks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.95, 8), P.steel, { bone, at: [s * 1.12, 1.8, -0.85] });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 8), P.hullDark, { bone, at: [s * 1.12, 2.29, -0.85] });
  }

  // Pipes and valves
  b.rod([-0.85, 1.45, -0.8], [-0.85, 1.45, -2.2], 0.035, P.steel, { bone });
  b.rod([-0.85, 1.45, -1.0], [-0.85, 1.8, -1.0], 0.03, P.steel, { bone });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), P.corpRed, {
    bone, at: [-0.85, 1.85, -1.0],
  });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.03), P.corpRed, { bone, at: [-0.85, 1.9, -1.0] });

  // Coiled hoses
  for (const s of [1, -1]) {
    const pts: number[][] = [];
    for (let i = 0; i <= 20; i++) {
      const a = i * 0.9;
      pts.push([s * 1.2, 1.62 + Math.sin(a) * 0.14, -1.0 - i * 0.07 - Math.cos(a) * 0.04]);
    }
    b.sweep(catmull(pts), 0.035, { bone, color: P.rubber, sides: 6 });
  }

  // Ladder
  for (const x of [-0.95, -0.65]) b.rod([x, 1.4, -3.05], [x, 2.25, -3.05], 0.022, P.steel, { bone });
  for (let i = 0; i < 6; i++) b.rod([-0.95, 1.5 + i * 0.14, -3.05], [-0.65, 1.5 + i * 0.14, -3.05], 0.016, P.steel, { bone });

  // Logo and warning decals
  const logo = svg(
    `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="none" stroke="#d1202f" stroke-width="7"/><path d="M40 12L64 64H52L40 38L28 64H16Z" fill="#d1202f"/><path d="M26 54h28" stroke="#d1202f" stroke-width="5"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
    bone, at: [1.256, 1.8, -1.35], dir: [1, 0, 0], axis: "z", texture: logo,
  });
  const warn = svg(
    `<svg viewBox="0 0 160 40"><rect width="160" height="40" fill="#f2c200"/><text x="80" y="27" font-family="monospace" font-weight="bold" font-size="20" text-anchor="middle" fill="#14171d">WARNING: HIGH PRESSURE</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.8, 0.2), "#ffffff", {
    bone, at: [0, 2.1, -3.0], dir: [0, 0, -1], axis: "z", texture: warn,
  });
}
    return buildTankBay;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turret"] = b.joint("turret", { parent: J["body"], at: [0,2.15,0.1], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannon"] = b.joint("cannon", { parent: J["turret"], at: [0,2.45,0.3], dir: [0,0,1], role: "hinge", group: "turret" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
