import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, noise, smoothstep, rng } from "../../../../src/index";
import { glow, glow as glowKit } from "../../../../kits/glow";
import { metal, panelled, coil } from "../../../../kits/clockwork";

export const meta = {
  "name": "Arasaka-style Riot Interceptor RC-9",
  "description": "A corporate cyberpunk riot-control armored interceptor with a roof water cannon, neon light bars, glowing wheel hubs and holographic corp decals."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2b303b",
  hullDark: "#14171e",
  armor: "#454c5a",
  trim: "#f2c200",
  glass: "#0a1a22",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  strobeRed: "#ff2a3a",
  strobeBlue: "#2a5bff",
  tire: "#0d0d10",
  rim: "#6b7280",
  steel: "#9aa3b2",
  tank: "#3a7f9e",
  rubber: "#1b1b20",
};
const M = {
  deckTop: [0, 1.55, 0] as [number, number, number],
  cabRoof: [0, 2, 0.5] as [number, number, number],
  turretRing: [0, 2, -0.9] as [number, number, number],
  bumperFront: [0, 0.7, 3] as [number, number, number],
  axleFront: [0, 0.55, 1.9] as [number, number, number],
  axleMid: [0, 0.55, -0.2] as [number, number, number],
  axleRear: [0, 0.55, -2.1] as [number, number, number],
  cannonMuzzle: [0, 2.45, 1.6] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassisHull
  (() => {
function buildChassisHull({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  const armor = panelled(
    paint((p, n) => {
      const g = noise(p, 0.3, 4);
      const wheelDirt = Math.max(0, 1 - Math.abs(Math.abs(p.z + 0.1) - 1.0) / 0.0 || 0);
      const near = Math.min(Math.abs(p.z - 1.9), Math.abs(p.z + 0.2), Math.abs(p.z + 2.1));
      const grime = smoothstep(0.6, 0.0, near) * smoothstep(0.9, 0.4, p.y) * 0.5;
      const base = mix(P.hull, P.armor, 0.3 + 0.4 * g * Math.max(0, n.y + 0.3));
      return mix(base, "#0d0f14", grime + wheelDirt * 0);
    }),
    { size: 0.5, rivets: 0.1, seam: P.hullDark },
  );

  // floor pan
  box(2.3, 0.12, 5.8, P.hullDark, [0, 0.36, 0]);
  // main lower body
  box(2.4, 0.7, 4.4, armor, [0, 0.8, -0.7]);
  // rear cargo box
  box(2.4, 0.5, 2.6, armor, [0, 1.35, -1.7]);
  // wedge nose via extrude (side profile in z,y)
  const nose = b.extrude(
    [[-0.0, 0], [2.0, 0], [1.5, 0.45], [0.0, 0.85]],
    { at: [-1.2, 0.45, 1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: armor, bone },
  );
  nose.mesh.position.x += 1.2;
  // sloped hood plates
  for (const s of [1, -1])
    b.extrude([[0, 0], [1.9, 0], [0.2, 0.4]], {
      at: [s * 0.6, 1.2, 1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.0, bevel: 0.02, color: P.armor, bone,
    });

  // ram bumper with hazard chevrons
  const hazard = paint((p) => (Math.floor((p.x + p.y * 1.0) / 0.12) % 2 ? P.trim : P.hullDark));
  box(2.5, 0.3, 0.25, hazard, [0, 0.62, 3.0]);
  box(2.2, 0.12, 0.2, P.steel, [0, 0.42, 3.02]);

  // wheel arches with flares
  for (const z of [1.9, -0.2, -2.1])
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.72, 0.72, 0.14, 12, 1, false, 0, Math.PI), P.hullDark, {
        bone, at: [s * 1.2, 0.55, z], dir: [s, 0, 0], rotation: [0, 0, 0],
      });
      box(0.2, 0.08, 1.3, P.trim, [s * 1.22, 1.22, z]);
      box(0.18, 0.1, 1.3, P.armor, [s * 1.2, 1.12, z]);
    }

  // side skirts + neon sills
  for (const s of [1, -1]) {
    box(0.1, 0.22, 4.6, P.hullDark, [s * 1.2, 0.5, -0.4]);
    glow(box(0.04, 0.05, 4.2, P.neonMagenta, [s * 1.26, 0.58, -0.4]), 1.6);
    glow(box(0.04, 0.05, 4.2, P.neonCyan, [s * 1.26, 0.46, -0.4]), 1.6);
  }

  // side vents on cargo box
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      box(0.05, 0.28, 0.07, P.hullDark, [s * 1.22, 1.38, -1.0 - i * 0.22]);
    }
  // rear grilles on top rear
  for (let i = 0; i < 5; i++) box(1.2, 0.03, 0.06, P.hullDark, [0, 1.62, -2.6 + i * 0.12]);

  // rear doors + emblem decal
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#2ff3ff" stroke-width="4"/>
     <path d="M32 8 L52 52 L40 52 L32 32 L24 52 L12 52Z" fill="#ff2bd6"/><path d="M8 56h48" stroke="#f2c200" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  box(2.2, 1.0, 0.06, P.hullDark, [0, 1.15, -3.0]);
  box(0.04, 1.0, 0.08, P.trim, [0, 1.15, -3.02]);
  glow(
    b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", {
      bone, at: [0.5, 1.2, -3.04], dir: [0, 0, -1], axis: "z", texture: emblem,
    }),
    0.8,
  );
  for (const s of [1, -1]) {
    // tail lights
    glow(box(0.4, 0.14, 0.05, P.strobeRed, [s * 0.85, 1.5, -3.04]), 1.8);
    // headlight slits
    glow(box(0.5, 0.06, 0.06, P.neonCyan, [s * 0.8, 0.98, 3.0 - 0.0]), 2);
    // tow stubs / corner armor
    box(0.14, 0.5, 0.14, P.armor, [s * 1.2, 0.8, 2.95]);
  }
  // hood vents
  for (let i = 0; i < 4; i++) box(0.9, 0.02, 0.05, P.hullDark, [0, 1.24 - i * 0.06, 2.0 + i * 0.25]);
  // rear bumper
  box(2.4, 0.2, 0.2, hazard, [0, 0.55, -3.0]);
}
    return buildChassisHull;
  })(),
  // cabin
  (() => {
function buildCabin({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...extra });

  const plate = paint((p, n) => {
    const g = noise(p, 0.12, 4);
    const base = mix("#3a414e", "#2b303b", g);
    return n.y > 0.5 ? mix(base, "#5a6272", 0.25) : base;
  });

  // main cab shell: sloped front via frustumBox
  b.frustumBox([0, 1.58, -0.35], [0, 1.58, 1.85], [2.1, 0.5], [1.9, 0.5], { bone, color: plate });
  // sloped roof wedge
  b.extrude([[0, 0], [2.0, 0], [1.75, 0.5], [0.2, 0.5]], {
    at: [0, 1.85, -0.4], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, bone, color: plate, bevel: 0.02,
  });
  b.extrude([[0, 0], [0.2, 0], [0.2, 0.0], [0, 0]].length ? [[0, 0], [1.5, 0], [0.9, 0.3], [0, 0.3]] : [], {
    at: [0, 1.85, 0.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.5, bone, color: "#454c5a",
  });

  // windshield slit
  const hud = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#0a1a22"/>${
    Array.from({ length: 8 }, (_, i) => `<rect y="${i * 2}" width="64" height="0.7" fill="#2ff3ff" opacity="0.5"/>`).join("")
  }<path d="M4 12 L14 4 L24 12" stroke="#2ff3ff" stroke-width="1" fill="none"/></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(1.8, 0.28), "#ffffff", {
    bone, at: [0, 2.0, 1.82], dir: [0, 0.35, 1], axis: "z", texture: hud,
  });
  box(1.9, 0.07, 0.05, P.hullDark, [0, 2.17, 1.8]);
  box(1.9, 0.05, 0.05, P.trim, [0, 1.84, 1.84]);

  // side window slits, door panels, trim, logo
  const logo = svg(`<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="#14171e" stroke="#f2c200" stroke-width="3"/><path d="M24 8 L38 38 L24 30 L10 38Z" fill="#ff2a3a"/></svg>`, { size: 128 });
  const plateTex = svg(`<svg viewBox="0 0 60 20"><rect width="60" height="20" fill="#f2c200"/><text x="30" y="15" font-size="13" font-weight="bold" text-anchor="middle" fill="#14171e">RC-9</text></svg>`, { size: 128 });
  for (const s of [1, -1]) {
    box(0.04, 0.17, 1.2, P.glass, [s * 1.03, 2.0, 0.7]);
    glow(box(0.02, 0.02, 1.2, P.neonCyan, [s * 1.045, 2.1, 0.7]), 1.2);
    box(0.05, 0.4, 0.9, P.armor, [s * 1.02, 1.75, 0.65]);
    box(0.06, 0.03, 0.95, P.trim, [s * 1.03, 1.55 + 0.02, 0.65]);
    box(0.06, 0.03, 0.95, P.trim, [s * 1.03, 1.94, 0.65]);
    b.part(new THREE.CircleGeometry(0.17, 12), "#ffffff", {
      bone, at: [s * 1.06, 1.75, 0.65], dir: [s, 0, 0], axis: "z", texture: logo,
    });
    box(0.03, 0.2, 0.01, P.hullDark, [s * 1.06, 1.75, 0.18]);
    // mirrors
    b.rod([s * 1.08, 1.95, 1.6], [s * 1.28, 2.0, 1.55], 0.02, { bone, color: P.hullDark });
    box(0.06, 0.2, 0.16, P.hullDark, [s * 1.3, 2.0, 1.55]);
    glow(box(0.02, 0.18, 0.02, P.neonMagenta, [s * 1.34, 2.0, 1.62]), 1.4);
    // sensor pods
    b.part(new THREE.SphereGeometry(0.07, 6, 4), P.steel, { bone, at: [s * 0.85, 2.38 - 0.1, 1.5] });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonCyan, { bone, at: [s * 0.85, 2.3, 1.56] });
  }
  b.part(new THREE.PlaneGeometry(0.4, 0.13), "#ffffff", {
    bone, at: [0, 1.7, -0.42], dir: [0, 0, -1], axis: "z", texture: plateTex,
  });

  // roof plate and strobe bars
  box(1.5, 0.05, 1.2, P.hullDark, [0, 2.2, 0.5]);
  glow(box(0.7, 0.07, 0.1, P.strobeRed, [0.4, 2.27, 0.5]), 2);
  glow(box(0.7, 0.07, 0.1, P.strobeBlue, [-0.4, 2.27, 0.5]), 2);
  for (const s of [1, -1]) {
    box(0.06, 0.08, 0.14, P.hullDark, [s * 0.78, 2.26, 0.5]);
    box(0.06, 0.08, 0.14, P.hullDark, [s * 0.02, 2.26, 0.5]);
  }
  // floodlight bar
  box(1.7, 0.1, 0.12, P.hullDark, [0, 2.22, 1.5]);
  for (let i = 0; i < 5; i++) glow(box(0.2, 0.06, 0.03, "#ffffff", [-0.6 + i * 0.3, 2.22, 1.57]), 1.8);

  // antennas
  const r = rng0();
  [[-0.6, -0.1, 0.5], [0.6, -0.15, 0.7], [0.3, -0.2, 0.3]].forEach(([x, z, h], i) => {
    b.rod([x, 2.22, z], [x, 2.22 + h, z], [0.014, 0.006], { bone, color: P.steel });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), i % 2 ? P.neonMagenta : P.strobeRed, { bone, at: [x, 2.22 + h, z] });
  });
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 8), P.steel, { bone, at: [0.2, 2.26, -0.2] });
  b.part(new THREE.SphereGeometry(0.1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.armor, { bone, at: [0.2, 2.3, -0.2] });
  // rear cab wall near turret & rivets
  box(2.0, 0.55, 0.06, P.hullDark, [0, 1.85, -0.38]);
  for (let i = 0; i < 8; i++) b.part(new THREE.SphereGeometry(0.02, 4, 3), P.steel, { bone, at: [-0.9 + i * 0.26, 2.1, 1.84] });

  function rng0() { return 0; }
}
    return buildCabin;
  })(),
  // waterCannonTurret
  (() => {
function buildWaterCannonTurret({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pitch = J.cannonPitch;
  const G = glowKit;
  const R = rng(5);
  const RED = P.strobeRed;

  const grime = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const c = new THREE.Color(P.armor);
    const d = new THREE.Color(P.hullDark);
    return c.lerp(d, Math.max(0, -n.y) * 0.6 + (Math.sin(p.x * 40 + p.z * 30) > 0.9 ? 0.3 : 0)).getStyle();
  });

  const gauge = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e8e8e0" stroke="#14171e" stroke-width="4"/>
    <path d="M12 44 A24 24 0 1 1 52 44" stroke="#14171e" stroke-width="3" fill="none"/>
    <path d="M44 40 A14 14 0 0 0 48 30" stroke="#ff2a3a" stroke-width="5" fill="none"/>
    <path d="M32 32 L22 18" stroke="#ff2a3a" stroke-width="3"/><circle cx="32" cy="32" r="4" fill="#14171e"/></svg>`,
    { size: 128 },
  );
  const stripeTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c200"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10} 16 L${i * 10 + 8} 0 L${i * 10 + 14} 0 L${i * 10 + 6} 16Z" fill="#14171e"/>`).join("")}</svg>`,
    { size: 128 },
  );

  // ring base with teeth
  b.part(new THREE.CylinderGeometry(0.5, 0.55, 0.08, 16), P.hullDark, { bone: yaw, at: [0, 2.02, -0.9] });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.07, 0.07, 0.07), P.steel, {
      bone: yaw,
      at: [Math.sin(a) * 0.55, 2.04, -0.9 + Math.cos(a) * 0.55],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // housing
  b.part(new THREE.CylinderGeometry(0.4, 0.46, 0.3, 8), grime, { bone: yaw, at: [0, 2.2, -0.9], flat: true });
  b.part(new THREE.BoxGeometry(0.6, 0.22, 0.7), grime, { bone: yaw, at: [0, 2.3, -0.75] });
  b.part(new THREE.BoxGeometry(0.62, 0.05, 0.72), P.trim, { bone: yaw, at: [0, 2.2, -0.75] });
  // gauge on side
  for (const s of [1, -1])
    b.part(new THREE.CircleGeometry(0.1, 16), "#ffffff", {
      bone: yaw,
      at: [s * 0.32, 2.3, -0.75],
      dir: [s, 0, 0],
      axis: "z",
      texture: gauge,
    });
  // camera eye
  b.part(new THREE.BoxGeometry(0.12, 0.1, 0.12), P.hullDark, { bone: yaw, at: [0.28, 2.42, -0.5] });
  G(b.part(new THREE.SphereGeometry(0.035, 6, 4), RED, { bone: yaw, at: [0.28, 2.42, -0.43] }), 2);

  // tank behind
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 10), P.tank, {
    bone: yaw,
    at: [0, 2.2, -1.5],
    rotation: [90, 0, 0],
    flat: true,
  });
  for (const z of [-1.8, -1.2])
    b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 10), P.hullDark, {
      bone: yaw,
      at: [0, 2.2, z],
      rotation: [90, 0, 0],
    });
  for (const z of [-1.95, -1.05])
    b.part(new THREE.CylinderGeometry(0.2, 0.3, 0.05, 10), P.steel, {
      bone: yaw,
      at: [0, 2.2, z],
      rotation: [90, 0, 0],
    });
  G(b.part(new THREE.BoxGeometry(0.04, 0.04, 0.7), P.neonCyan, { bone: yaw, at: [0.31, 2.28, -1.5] }), 2);
  G(b.part(new THREE.BoxGeometry(0.04, 0.04, 0.7), P.neonCyan, { bone: yaw, at: [-0.31, 2.28, -1.5] }), 2);
  b.part(new THREE.BoxGeometry(0.5, 0.02, 0.1), "#ffffff", { bone: yaw, at: [0, 2.51, -1.5] });
  // saddle supports
  for (const z of [-1.7, -1.3]) b.part(new THREE.BoxGeometry(0.6, 0.12, 0.08), P.hullDark, { bone: yaw, at: [0, 2.0, z] });

  // hoses
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.15, 2.2, -1.2],
        [s * 0.35, 2.35, -1.05],
        [s * 0.28, 2.4, -0.9],
        [s * 0.15, 2.4, -0.6],
      ],
      0.03,
      { color: P.rubber, bone: yaw, sides: 6 },
    );
  }

  // handrails
  for (const s of [1, -1]) {
    b.rod([s * 0.75, 2.05, -1.6], [s * 0.75, 2.05, -0.3], 0.02, P.steel, { bone: yaw });
    for (const z of [-1.6, -0.3]) b.rod([s * 0.75, 2.0, z], [s * 0.75, 2.05, z], 0.02, P.steel, { bone: yaw });
  }

  // trunnion
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 8), P.steel, {
    bone: yaw, at: [s * 0.34, 2.4, -0.7], rotation: [0, 0, 90],
  });

  // barrel on pitch
  const bz0 = -0.7;
  b.part(new THREE.CylinderGeometry(0.13, 0.15, 1.2, 8), grime, {
    bone: pitch, at: [0, 2.4, bz0 + 0.65], rotation: [90, 0, 0], flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 8), P.armor, {
    bone: pitch, at: [0, 2.4, bz0 + 1.5], rotation: [90, 0, 0], flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.15, 0.1, 0.12, 8), P.steel, {
    bone: pitch, at: [0, 2.4, 1.58], rotation: [90, 0, 0],
  });
  G(b.part(new THREE.TorusGeometry(0.11, 0.02, 6, 12), P.neonCyan, { bone: pitch, at: [0, 2.4, 1.65] }), 2.5);
  for (const z of [0.0, 0.5, 1.0])
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 8), P.hullDark, {
      bone: pitch, at: [0, 2.4, z], rotation: [90, 0, 0],
    });
  for (const z of [0.2, 0.75])
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8), "#ffffff", {
      bone: pitch, at: [0, 2.4, z], rotation: [90, 0, 0], texture: stripeTex,
    });
  // sight and rivets
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.3), P.hullDark, { bone: pitch, at: [0, 2.58, 0.4] });
  for (let i = 0; i < 6; i++)
    b.part(new THREE.SphereGeometry(0.015, 4, 3), P.steel, {
      bone: yaw, at: [(R() - 0.5) * 0.5, 2.42, -0.75 + (R() - 0.5) * 0.5],
    });
}
    return buildWaterCannonTurret;
  })(),
  // runningGear
  (() => {
function buildRunningGear({ b, J, P, M }: any) {
  const R = rng(5);
  const WR = 0.55; // wheel radius
  const WW = 0.42; // tire width

  const tirePaint = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const wear = noise(p, 0.15, 3);
    const base = mix("#0d0d10", "#26262c", smoothstep(0.5, 0.9, wear));
    const mud = smoothstep(0.35, -0.2, p.y - 0.2) * 0.35 * noise(p, 0.08, 9);
    return mix(base, "#3a2f24", mud);
  });
  const rimPaint = paint((p: THREE.Vector3) => mix(P.rim, "#3b4150", noise(p, 0.05, 4) * 0.6));
  const darkMetal = paint((p: THREE.Vector3, n: THREE.Vector3) =>
    mix(P.hullDark, P.armor, noise(p, 0.1, 2) * 0.5 + 0.2 * Math.max(0, n.y)));

  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2bd6" stroke-width="7"/><circle cx="32" cy="32" r="28" fill="none" stroke="#ffd6f6" stroke-width="2"/></svg>`,
    { size: 128 });
  const treadTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#000"/></svg>`, { size: 16 });
  void treadTex;

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]], ["wheelFR", -1, M.axleFront[2]],
    ["wheelML", 1, M.axleMid[2]], ["wheelMR", -1, M.axleMid[2]],
    ["wheelRL", 1, M.axleRear[2]], ["wheelRR", -1, M.axleRear[2]],
  ];

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = s * 1.1;
    const cy = WR;
    const at = new THREE.Vector3(cx, cy, z);
    const ax: [number, number, number] = [s, 0, 0];
    // tire
    b.part(new THREE.CylinderGeometry(WR, WR, WW, 16), tirePaint, { bone: j, at, dir: ax });
    // shoulders
    for (const k of [-1, 1])
      b.part(new THREE.CylinderGeometry(WR * 0.9, WR * 1.0, 0.05, 16), P.rubber,
        { bone: j, at: new THREE.Vector3(cx + s * k * WW * 0.5, cy, z), dir: ax });
    // tread blocks
    const nb = 16;
    for (let i = 0; i < nb; i++) {
      const a = (i / nb) * Math.PI * 2;
      const blk = b.part(new THREE.BoxGeometry(WW * 0.9, 0.06, 0.12), P.tire, {
        bone: j,
        at: new THREE.Vector3(cx, cy + Math.sin(a) * (WR + 0.02), z + Math.cos(a) * (WR + 0.02)),
        dir: [0, Math.sin(a), Math.cos(a)], axis: "y" as any,
      });
      void blk;
    }
    // rim face
    const fx = cx + s * (WW / 2 + 0.005);
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 12), rimPaint, { bone: j, at: new THREE.Vector3(fx, cy, z), dir: ax });
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.07, 10), P.steel, { bone: j, at: new THREE.Vector3(fx + s * 0.03, cy, z), dir: ax });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), P.hullDark, { bone: j, at: new THREE.Vector3(fx + s * 0.07, cy, z), dir: ax });
    // magenta glow ring
    glow(b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", {
      bone: j, at: new THREE.Vector3(fx + s * 0.03, cy, z), dir: ax, axis: "z", texture: hubTex,
    }), 1.6);
    glow(b.part(new THREE.TorusGeometry(0.31, 0.012, 5, 18), P.neonMagenta, {
      bone: j, at: new THREE.Vector3(fx + s * 0.035, cy, z), dir: ax, axis: "z",
    }), 2);
    // bolts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 6), P.steel, {
        bone: j,
        at: new THREE.Vector3(fx + s * 0.04, cy + Math.sin(a) * 0.27, z + Math.cos(a) * 0.27),
        dir: ax,
      });
    }
    // axle stub inboard
    b.rod([cx - s * 0.2, cy, z], [s * 0.45, cy, z], 0.07, darkMetal, { bone: j });
    // brake disc
    b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 12), P.steel, { bone: j, at: new THREE.Vector3(cx - s * 0.26, cy, z), dir: ax });
    // suspension arm, spring, damper (attached to body)
    const ay = 0.82;
    b.rod([s * 0.5, 0.5, z + 0.05], [s * 0.85, 0.56, z + 0.05], 0.045, P.armor, { bone: J.body });
    b.rod([s * 0.5, 0.5, z - 0.1], [s * 0.85, 0.56, z - 0.1], 0.04, P.armor, { bone: J.body });
    b.sweep(coil([s * 0.9, 0.6, z + 0.2], [s * 0.9, ay + 0.2, z + 0.2], 0.05, 6), 0.011, { bone: J.body, color: P.trim });
    b.rod([s * 0.9, 0.6, z - 0.2], [s * 0.9, ay + 0.25, z - 0.2], 0.03, P.steel, { bone: J.body });
    b.rod([s * 0.9, 0.78, z - 0.2], [s * 0.9, ay + 0.3, z - 0.2], 0.02, P.hullDark, { bone: J.body });
    // mud flap behind tire
    b.part(new THREE.BoxGeometry(0.05, 0.32, 0.4), P.rubber, { bone: J.body, at: new THREE.Vector3(cx, 0.33, z - WR - 0.12) });
    b.part(new THREE.BoxGeometry(0.052, 0.06, 0.4), P.trim, { bone: J.body, at: new THREE.Vector3(cx, 0.46, z - WR - 0.12) });
  }

  // axle tubes + differentials
  for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
    b.rod([-1.0, WR, z], [1.0, WR, z], 0.06, darkMetal, { bone: J.body });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), darkMetal, { bone: J.body, at: new THREE.Vector3(0, WR, z), scale: [1, 0.9, 1.1] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), P.steel, { bone: J.body, at: new THREE.Vector3(0, WR, z + 0.2), dir: [0, 0, 1] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 6), P.steel, {
        bone: J.body, at: new THREE.Vector3(Math.cos(a) * 0.14, WR + Math.sin(a) * 0.14, z + 0.13), dir: [0, 0, 1] });
    }
  }
  // drive shafts
  b.rod([0, WR + 0.02, M.axleFront[2] - 0.2], [0, WR + 0.02, M.axleMid[2] + 0.2], 0.05, P.steel, { bone: J.body });
  b.rod([0, WR + 0.02, M.axleMid[2] - 0.2], [0, WR + 0.02, M.axleRear[2] + 0.2], 0.05, P.steel, { bone: J.body });
  for (const z of [0.9, -1.2])
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), P.trim, { bone: J.body, at: new THREE.Vector3(0, WR + 0.02, z), dir: [0, 0, 1] });
  // transfer case
  b.part(new THREE.BoxGeometry(0.4, 0.22, 0.5), darkMetal, { bone: J.body, at: new THREE.Vector3(0, 0.62, M.axleMid[2] + 0.5) });
  void R;
}
    return buildRunningGear;
  })(),
  // frontEquipment
  (() => {
function buildFrontEquipment({ b, J, P }: any) {
  const body = J.body;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: any, at: number[], extra: any = {}) =>
    b.part(g, c, { bone: body, at, ...extra });

  const HAZ = paint((p) => {
    const k = Math.floor((p.x + p.y * 1.2) / 0.07) % 2 === 0;
    return k ? P.trim : P.hullDark;
  });
  const ARMOR = paint((p, n) => {
    const v = 0.9 + 0.1 * n.y;
    return mix(P.armor, P.hullDark, p.y < 0.45 ? 0.35 : 0.0 + (1 - v));
  });

  // heavy ram bar
  put(box(2.4, 0.3, 0.16), ARMOR, [0, 0.75, 2.95]);
  put(box(2.5, 0.12, 0.2), HAZ, [0, 0.55, 2.94]);
  put(box(0.5, 0.5, 0.12), P.hullDark, [0, 0.95, 2.98]);
  for (const s of [-1, 1]) {
    put(box(0.5, 0.45, 0.14), P.armor, [s * 0.8, 0.95, 2.98]);
    put(box(0.14, 0.5, 0.2), P.hull, [s * 1.2, 0.85, 2.88]);
    // rivets
    for (const x of [0.62, 0.98])
      for (const y of [0.8, 1.1])
        put(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.steel, [s * x, y, 3.06], { dir: [0, 0, 1] });
    // tow hooks
    put(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.steel, [s * 0.55, 0.5, 3.0]);
    // bolt-on side armor panels with magenta edges
    put(box(0.08, 0.5, 0.32), P.armor, [s * 1.26, 0.95, 2.78]);
    glow(put(box(0.02, 0.52, 0.03), P.neonMagenta, [s * 1.31, 0.95, 2.94]), 1.5);
    glow(put(box(0.02, 0.03, 0.34), P.neonMagenta, [s * 1.31, 1.21, 2.78]), 1.5);
    glow(put(box(0.02, 0.03, 0.34), P.neonMagenta, [s * 1.31, 0.69, 2.78]), 1.5);
  }

  // push bar / shield rack
  for (const s of [-1, 1]) put(box(0.05, 0.5, 0.05), P.steel, [s * 0.35, 1.15, 3.0]);
  put(box(0.8, 0.06, 0.06), P.steel, [0, 1.25, 3.0]);
  put(box(0.7, 0.4, 0.04), P.glass, [0, 1.05, 3.04]);

  // winch with hazard stripes
  put(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 10), HAZ, [0, 0.4, 2.85], { dir: [1, 0, 0] });
  b.sweep([[0, 0.4, 2.95], [0, 0.35, 3.1], [0.0, 0.3, 3.2]], 0.015, { color: P.hullDark, bone: body });
  put(new THREE.SphereGeometry(0.05, 6, 4), P.steel, [0, 0.3, 3.2]);

  // double neon light bar
  for (const y of [1.18, 1.26])
    glow(put(box(2.0, 0.045, 0.05), P.neonCyan, [0, y, 3.0]), 1.8);
  const slogan = svg(
    `<svg viewBox="0 0 120 24"><rect width="120" height="24" fill="#0a1a22"/><text x="60" y="17" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#2ff3ff">ORDER · COMPLIANCE</text></svg>`,
    { size: 256 },
  );
  glow(
    put(new THREE.PlaneGeometry(0.9, 0.18), "#ffffff", [0, 1.02, 3.075], { dir: [0, 0, 1], axis: "z", texture: slogan }),
    1.2,
  );

  // splitter and glow strip
  put(box(2.3, 0.05, 0.3), P.hullDark, [0, 0.33, 2.85]);
  put(box(2.4, 0.04, 0.05), P.steel, [0, 0.31, 3.0]);
  glow(put(box(2.1, 0.03, 0.03), P.neonCyan, [0, 0.4, 3.0]), 1.6);
}
    return buildFrontEquipment;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2,-0.9], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannonPitch"] = b.joint("cannonPitch", { parent: J["turretYaw"], at: [0,2.4,-0.7], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.1,0.55,1.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.1,0.55,1.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.1,0.55,-0.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.1,0.55,-0.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.1,0.55,-2.1], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.1,0.55,-2.1], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
