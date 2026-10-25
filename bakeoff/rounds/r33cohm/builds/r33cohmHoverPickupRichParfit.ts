import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, noise, smoothstep, mix, rng, frame } from "../../../../src/index";
import { panelled, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Hover Technical",
  "description": "A militarized pickup truck converted to ride on four downward-facing hover thrusters, in a low-poly cyberpunk style with neon underglow, armour plating and a roll-cage gun mount."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2d323d",
  hullLight: "#4a5262",
  armor: "#3a4150",
  dark: "#12141a",
  trim: "#f2c200",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  glass: "#0b2a3a",
  rubber: "#1a1a1f",
  steel: "#8b94a6",
  rust: "#7a4a2e",
  red: "#d8202a",
  white: "#f1f4f8",
  orange: "#ff7a1a",
};
const M = {
  bodyCenter: [0, 1, 0] as [number, number, number],
  hoodFront: [0, 1.05, 2] as [number, number, number],
  cabFloor: [0, 0.85, 0.3] as [number, number, number],
  cabRoof: [0, 1.85, 0] as [number, number, number],
  bedFloor: [0, 0.9, -1.7] as [number, number, number],
  bedRear: [0, 0.9, -2.6] as [number, number, number],
  frontBumper: [0, 0.7, 2.6] as [number, number, number],
  rearBumper: [0, 0.7, -2.65] as [number, number, number],
  gunPintle: [0, 1.65, -1.4] as [number, number, number],
  thrusterFL: [0.95, 0.5, 1.6] as [number, number, number],
  thrusterFR: [-0.95, 0.5, 1.6] as [number, number, number],
  thrusterRL: [0.95, 0.5, -1.7] as [number, number, number],
  thrusterRR: [-0.95, 0.5, -1.7] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // Paints
  const plate = panelled(
    paint((p, n) => {
      const base = mix("#2d323d", "#4a5262", noise(p, 0.25, 3) * 0.7);
      const scratch = noise(new THREE.Vector3(p.x * 6, p.y * 0.5, p.z * 0.4), 0.05, 9);
      return scratch > 0.78 ? mix(base, "#8b94a6", 0.5) : mix(base, "#12141a", 0.25 * smoothstep(0.3, -0.9, n.y));
    }),
    { size: 0.4, aspect: 0.8, rivets: 0.1 },
  );
  const hazard = paint((p, _n, _s) => {
    const k = (((p.z + Math.abs(p.y) * 0.0 + p.y * 1.0) / 0.22) % 1 + 1) % 1;
    return k < 0.5 ? "#f2c200" : "#12141a";
  });
  const sillPaint = paint((p, n, s) => (Math.abs(n.x) > 0.6 ? hazard.at(p, n, s) : mix("#2d323d", "#12141a", 0.3)));

  const box = (w: number, h: number, d: number, color: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, flat: true, ...opt });

  // Belly tub: faceted skid plate (tapered box via frustum) plus angled nose and tail
  b.frustumBox([0, 0.62, -2.4], [0, 0.62, 2.1], [1.7, 0.2], [1.7, 0.2], { bone: body, color: plate });
  b.part(new THREE.CylinderGeometry(0.8, 0.95, 0.12, 6), P.armor, { bone: body, at: [0, 0.56, 0], scale: [1, 1, 1], flat: true });
  // angled nose and tail skid wedges
  for (const [z, dir] of [[2.35, 1], [-2.55, -1]] as const) {
    box(1.7, 0.3, 0.2, plate, [0, 0.62, dir > 0 ? 2.4 : -2.6]);
  }
  // Belly panel stays just below tub, cyan glow
  glow(box(1.3, 0.03, 3.4, P.neonCyan, [0, 0.455, 0]), 1.6);
  box(1.5, 0.03, 3.6, P.dark, [0, 0.47, 0]);

  // Frame rails and cross members
  for (const s of [1, -1]) {
    box(0.14, 0.2, 5.0, P.dark, [s * 0.62, 0.72, -0.1], { });
    box(0.1, 0.06, 5.0, P.steel, [s * 0.62, 0.84, -0.1]);
    // sills
    b.part(new THREE.BoxGeometry(0.22, 0.28, 4.7), sillPaint, { bone: body, at: [s * 1.1, 0.75, -0.1], flat: true });
    box(0.26, 0.06, 4.74, P.armor, [s * 1.1, 0.92, -0.1]);
    // sill chamfer
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 4.7, 4), P.trim, { bone: body, at: [s * 1.2, 0.62, -0.1], dir: [0, 0, 1], flat: true });
    // magenta underglow strip
    glow(box(0.05, 0.05, 4.4, P.neonMagenta, [s * 1.22, 0.58, -0.1]), 2);
    glow(box(0.04, 0.04, 4.4, P.neonMagenta, [s * 1.0, 0.5, -0.1]), 1.5);
  }
  const crossZ = [-2.5, -1.9, -1.2, -0.4, 0.4, 1.1, 1.8, 2.4];
  for (const z of crossZ) {
    box(2.3, 0.1, 0.12, z % 2 === 0 ? P.dark : P.hull, [0, 0.95, z]);
  }
  // top deck plate under cab and bed
  box(2.3, 0.05, 5.1, plate, [0, 0.975, -0.1]);

  // Top edge trim
  for (const s of [1, -1]) {
    box(0.05, 0.03, 5.0, P.trim, [s * 1.19, 0.985, -0.1]);
  }

  // Lift pads with bolts
  const pads = [M.thrusterFL, M.thrusterFR, M.thrusterRL, M.thrusterRR];
  for (const m of pads) {
    const x = m[0] * 0.8, z = m[2];
    const s = Math.sign(x);
    b.part(new THREE.CylinderGeometry(0.34, 0.38, 0.08, 8), P.armor, { bone: body, at: [x, 0.62, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 8), P.hullLight, { bone: body, at: [x, 0.57, z], flat: true });
    glow(b.part(new THREE.TorusGeometry(0.27, 0.015, 4, 12), P.neonCyan, { bone: body, at: [x, 0.545, z], dir: [0, 1, 0], axis: "z" }), 1.5);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), P.steel, {
        bone: body,
        at: [x + Math.cos(a) * 0.31, 0.665, z + Math.sin(a) * 0.31],
      });
    }
    // support gussets
    box(0.08, 0.2, 0.5, P.dark, [x - s * 0.3, 0.72, z]);
  }

  // Tow hooks / skid brackets at front and rear
  for (const [z, name] of [[M.frontBumper[2] - 0.3, "f"], [M.rearBumper[2] + 0.3, "r"]] as const) {
    for (const s of [1, -1]) {
      box(0.12, 0.16, 0.28, P.steel, [s * 0.5, 0.7, z]);
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 6), P.trim, { bone: body, at: [s * 0.5, 0.7, z + (name === "f" ? 0.18 : -0.18)], dir: [0, 0, 1], flat: true });
    }
  }

  // Number stencil decal on skid plate sides
  const tex = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="none"/><text x="4" y="19" font-family="monospace" font-weight="bold" font-size="20" fill="#f2c200">07 技</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.7, 0.26), "#ffffff", {
      bone: body,
      at: [s * 1.222, 0.8, 0.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: tex,
    });
  }

  // Exhaust-ish drain bolts along belly
  for (let i = 0; i < 8; i++) {
    const z = -2.1 + i * 0.6;
    box(0.06, 0.03, 0.06, P.steel, [(R() - 0.5) * 0.2 + (i % 2 ? 0.5 : -0.5), 0.43, z]);
  }
}
    return buildChassis;
  })(),
  // thrusters
  (() => {
function buildThrusters({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const HOUSING = paint((p, n) => {
    const base = n.y > 0.5 ? "#4a5262" : "#2d323d";
    const k = noise(p, 0.12, 3);
    return mix(base, "#12141a", smoothstep(0.55, 0.85, k) * 0.5);
  });
  const FIN = paint((p, n) => mix("#3a4150", "#12141a", n.y < 0 ? 0.4 : 0));
  const stencil = (num: string) =>
    svg(
      `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#f2c200"/><rect x="5" y="5" width="54" height="54" rx="4" fill="none" stroke="#12141a" stroke-width="3"/><text x="32" y="47" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#12141a">${num}</text></svg>`,
      { size: 128 },
    );
  const cone = svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2ff3ff" stop-opacity="0"/><stop offset="1" stop-color="#2ff3ff" stop-opacity="1"/></linearGradient></defs><path d="M10 0 L22 0 L32 64 L0 64Z" fill="url(#g)"/><path d="M16 0 L16 64" stroke="#ffffff" stroke-width="4" opacity="0.7"/></svg>`,
    { size: 128 },
  );
  const names = ["FL", "FR", "RL", "RR"];
  const nums = ["1", "2", "3", "4"];

  names.forEach((nm, idx) => {
    const joint = J["thruster" + nm];
    const m = M["thruster" + nm];
    const s = m[0] > 0 ? 1 : -1;
    const cx = m[0] - s * 0.2, cz = m[2];
    const at = (x: number, y: number, z: number): [number, number, number] => [cx + x, y, cz + z];
    const part = (g: THREE.BufferGeometry, c: any, pos: [number, number, number], o: any = {}) =>
      b.part(g, c, { bone: joint, at: pos, flat: true, ...o });

    // lift plate adapter
    part(new THREE.CylinderGeometry(0.34, 0.38, 0.06, 8), P.steel, at(0, 0.82, 0));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), P.dark, at(Math.cos(a) * 0.3, 0.86, Math.sin(a) * 0.3));
    }
    // housing
    part(new THREE.CylinderGeometry(0.38, 0.44, 0.34, 8), HOUSING, at(0, 0.62, 0));
    // hazard band
    part(new THREE.CylinderGeometry(0.455, 0.455, 0.07, 8), P.trim, at(0, 0.6, 0));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      part(new THREE.BoxGeometry(0.05, 0.075, 0.1), P.dark, at(Math.cos(a) * 0.45, 0.6, Math.sin(a) * 0.45), { rotation: [0, -a * 57.3 + 90, 0] });
    }
    // glowing intake ring
    glow(part(new THREE.TorusGeometry(0.36, 0.03, 6, 16), P.neonCyan, at(0, 0.8, 0), { rotation: [90, 0, 0] }), 1.6);
    // lower shoulder
    part(new THREE.CylinderGeometry(0.44, 0.3, 0.12, 8), P.armor, at(0, 0.39, 0));
    // vents on housing (front & back)
    for (const f of [1, -1])
      for (let k = -1; k <= 1; k++)
        part(new THREE.BoxGeometry(0.2, 0.025, 0.03), P.dark, at(k * 0.0, 0.54 + k * 0.07, f * 0.4), {});
    // nozzle cone flaring down
    part(new THREE.CylinderGeometry(0.3, 0.2, 0.2, 8, 1, true), P.dark, at(0, 0.27, 0));
    part(new THREE.CylinderGeometry(0.2, 0.34, 0.2, 8, 1, true), P.armor, at(0, 0.18, 0), { side: 2 } as any);
    part(new THREE.CylinderGeometry(0.2, 0.34, 0.22, 8), FIN, at(0, 0.17, 0));
    // inner glowing disc
    glow(part(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 8), P.neonCyan, at(0, 0.055, 0)), 1.8);
    // foot ring
    part(new THREE.CylinderGeometry(0.4, 0.42, 0.04, 8), P.rubber, at(0, 0.02, 0));
    // radial fins on nozzle + feet struts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const x = Math.cos(a), z = Math.sin(a);
      part(new THREE.BoxGeometry(0.03, 0.2, 0.12), P.steel, at(x * 0.3, 0.14, z * 0.3), { rotation: [0, -a * 57.3 + 90, 0] });
      part(new THREE.BoxGeometry(0.06, 0.06, 0.1), P.rubber, at(x * 0.4, 0.03, z * 0.4), { rotation: [0, -a * 57.3 + 90, 0] });
    }
    // stabiliser fins on outer side
    for (const dy of [0.7, 0.5]) {
      b.extrude(
        [[0, 0], [0.08, -0.03], [0.1, 0.1], [0, 0.14]],
        { at: at(s * 0.43, dy - 0.1, 0), x: [s, 0, 0], y: [0, 1, 0], thickness: 0.03, color: P.hullLight, bone: joint },
      );
    }
    // number decal on outer wall
    part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", at(s * 0.425, 0.52, 0.14), {
      dir: [s, 0, 0], axis: "z", texture: stencil(nums[idx]), flat: false,
    });
    // glow cone cards below nozzle
    const frames = [0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + R() * 0.3;
      return frame(at(Math.cos(a) * 0.08, 0.05, Math.sin(a) * 0.08), [0, 1, 0]);
    });
    const cards = b.cards(frames, cone, { size: [0.32, 0.05], lean: 180, flow: [0, 0, 1], cross: true, bone: joint });
    glow(cards, 1.3);
  });
}
    return buildThrusters;
  })(),
  // cabShell
  (() => {
function buildCabShell({ b, J, P, M }: Ctx) {
  const cab = J.cab;
  const body = J.body;
  const R = rng(11);

  // ---------- paints ----------
  const HULL = panelled(
    paint((p, n) => {
      const base = mix(P.hull, P.hullLight, smoothstep(0.3, 0.9, n.y) * 0.6 + noise(p, 0.15, 3) * 0.25);
      const scratch = noise(p, 0.02, 9) > 0.78 ? 0.25 : 0;
      return mix(base, P.steel, scratch);
    }),
    { size: 0.32, aspect: 0.8, rivets: 0.08, seam: P.dark },
  );
  const ARMOR = panelled(mix(P.armor, P.hullLight, 0.2), { size: 0.26, aspect: 0.7, rivets: 0.06, seam: P.dark });
  const HAZARD = paint((p) => (Math.floor((p.z + p.y) / 0.09) % 2 ? P.trim : P.dark));

  // ---------- textures ----------
  const windowTex = svg(
    `<svg viewBox="0 0 100 40"><rect x="1" y="1" width="98" height="38" rx="3" fill="#0b2a3a" stroke="#12141a" stroke-width="3"/>
    <path d="M10 38 L40 2 M30 38 L60 2 M50 38 L80 2" stroke="#2ff3ff" stroke-opacity="0.18" stroke-width="3"/>
    <circle cx="62" cy="18" r="2.2" fill="#12141a"/><circle cx="62" cy="18" r="5" fill="none" stroke="#7fd" stroke-opacity="0.5" stroke-width="0.8"/>
    <circle cx="35" cy="26" r="1.8" fill="#12141a"/><circle cx="35" cy="26" r="4.5" fill="none" stroke="#7fd" stroke-opacity="0.5" stroke-width="0.8"/>
    <rect x="1" y="1" width="98" height="38" rx="3" fill="none" stroke="#f2c200" stroke-width="1.2" stroke-dasharray="6 4"/></svg>`,
    { size: 256 },
  );
  const doorTex = (num: string, kanji: string) =>
    svg(
      `<svg viewBox="0 0 100 60"><text x="8" y="44" font-family="sans-serif" font-weight="bold" font-size="42" fill="#f1f4f8" stroke="#12141a" stroke-width="1">${num}</text>
      <text x="62" y="46" font-size="38" fill="#ff2fb4" font-family="sans-serif">${kanji}</text>
      <rect x="4" y="52" width="92" height="3" fill="#f2c200"/></svg>`,
      { size: 256 },
    );
  const dashTex = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#06151c"/><path d="M2 18 L12 8 L20 14 L30 4 L40 12 L50 6 L62 16" stroke="#2ff3ff" stroke-width="2" fill="none"/><rect x="4" y="19" width="20" height="3" fill="#ff2fb4"/><rect x="40" y="19" width="14" height="3" fill="#ff7a1a"/></svg>`,
    { size: 128 },
  );
  const sensorTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#ff2fb4"/><circle cx="16" cy="16" r="7" fill="#ffffff"/><circle cx="16" cy="16" r="3" fill="#12141a"/></svg>`,
    { size: 64 },
  );

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: cab, at, flat: true, ...opts });

  // ---------- main shell ----------
  // lower cab body
  box(2.3, 0.42, 1.95, HULL, [0, 1.21, 0.1]);
  // belt-line chunk (waist) slightly wider
  box(2.36, 0.12, 1.99, ARMOR, [0, 1.46, 0.1]);
  // cowl / firewall
  box(2.3, 0.34, 0.12, ARMOR, [0, 1.38, 1.04]);
  // rear cab wall
  box(2.3, 0.62, 0.1, ARMOR, [0, 1.66, -0.85]);
  // rear wall window band (dark)
  box(1.5, 0.2, 0.02, P.glass, [0, 1.7, -0.905]);

  // upper greenhouse: pillars
  const pillarGeo = (s: number) => {
    // A-pillar sloped: use rod between points
  };
  for (const s of [1, -1]) {
    // A-pillars (sloped)
    b.rod([s * 1.1, 1.52, 0.98], [s * 1.08, 1.84, 0.62], 0.055, P.armor, { bone: cab, sides: 4 });
    // B pillar
    box(0.1, 0.4, 0.14, HULL, [s * 1.12, 1.7, 0.05]);
    // C pillar thick rear
    box(0.12, 0.4, 0.14, HULL, [s * 1.12, 1.68, -0.78]);
    // door panels
    box(0.08, 0.42, 0.9, HULL, [s * 1.17, 1.22, 0.55]);
    box(0.08, 0.42, 0.9, HULL, [s * 1.17, 1.22, -0.35]);
    // wing armour skirts
    b.extrude(
      [
        [0, 0],
        [1.9, 0],
        [1.75, 0.2],
        [0.1, 0.2],
      ],
      { at: [s * 1.19, 1.02, -0.85], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, color: ARMOR, bone: cab },
    );
    // hazard stripe along skirt
    box(0.03, 0.06, 1.8, HAZARD, [s * 1.225, 1.14, 0.1]);
    // door handles
    box(0.04, 0.05, 0.2, P.steel, [s * 1.225, 1.4, 0.15]);
    box(0.04, 0.05, 0.2, P.steel, [s * 1.225, 1.4, -0.75 + 0.2]);
    // window glass, slit
    b.part(new THREE.PlaneGeometry(1.5, 0.3), "#ffffff", {
      bone: cab,
      at: [s * 1.215, 1.66, 0.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: windowTex,
      up: [0, 1, 0],
    });
    // glass backing
    box(0.04, 0.34, 1.68, P.glass, [s * 1.15, 1.66, 0.1]);
    // door decals
    const num = s > 0 ? "07" : "13";
    const kj = s > 0 ? "攻" : "鋼";
    b.part(new THREE.PlaneGeometry(0.62, 0.37), "#ffffff", {
      bone: cab,
      at: [s * 1.215, 1.26, 0.55],
      dir: [s, 0, 0],
      axis: "z",
      texture: doorTex(num, kj),
    });
    // side mirrors
    b.rod([s * 1.1, 1.55, 0.9], [s * 1.17, 1.62, 0.94], 0.012, P.dark, { bone: cab, sides: 4 });
    box(0.05, 0.16, 0.12, P.dark, [s * 1.175, 1.62, 0.96]);
    box(0.01, 0.13, 0.09, P.neonCyan, [s * 1.148, 1.62, 0.96]);
    // yellow trim on pillars
    box(0.03, 0.04, 0.9, P.trim, [s * 1.225, 1.88, 0.1]);
    // bullet impact patches
    box(0.025, 0.04, 0.04, P.dark, [s * 1.21, 1.5, 0.82]);
    box(0.025, 0.03, 0.03, P.dark, [s * 1.21, 1.35, -0.2]);
  }

  // windscreen (sloped glass)
  b.part(new THREE.PlaneGeometry(2.0, 0.42), P.glass, {
    bone: cab,
    at: [0, 1.68, 0.82],
    dir: [0, 0.55, 0.85],
    axis: "z",
    up: [0, 1, 0],
  });
  // dark frame for windscreen (double sided backing)
  b.frustumBox([0, 1.52, 0.98], [0, 1.88, 0.58], [2.1, 0.06], [2.1, 0.06], { bone: cab, color: P.dark });
  // windscreen visor strip
  box(2.2, 0.05, 0.12, P.trim, [0, 1.9, 0.55]);

  // roof
  box(2.3, 0.1, 1.5, ARMOR, [0, 1.93, -0.1]);
  // roof armour plate (faceted extrude)
  b.extrude(
    [
      [-0.9, -0.6],
      [0.9, -0.6],
      [1.0, 0.0, "sharp"],
      [0.8, 0.6],
      [-0.8, 0.6],
      [-1.0, 0.0, "sharp"],
    ],
    { at: [0, 1.98, -0.1], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, color: HULL, bone: cab },
  );
  // hazard roof stripes
  for (const z of [-0.55, 0.35]) box(1.6, 0.012, 0.08, HAZARD, [0, 2.012, z]);
  // roof edge neon-less rails
  for (const s of [1, -1]) box(0.06, 0.05, 1.5, P.dark, [s * 1.12, 1.98, -0.1]);

  // sensor pod
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.12, 0.08],
      [0.08, 0.12],
      [0, 0.13],
    ],
    { at: [0.5, 2.01, -0.3], segments: 6, color: P.dark, bone: cab },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      bone: cab,
      at: [0.5, 2.1, -0.19],
      dir: [0, 0.3, 1],
      axis: "z",
      texture: sensorTex,
    }),
    1.3,
  );
  // antenna
  b.rod([-0.8, 2.0, -0.7], [-0.82, 1.96 + 0.0, -0.72], [0.018, 0.008], P.steel, { bone: cab, sides: 5 });
  b.rod([-0.8, 2.0, -0.7], [-0.83, 2.0, -0.74], [0.014, 0.006], P.steel, { bone: cab, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.028, 6, 4), P.red, { bone: cab, at: [-0.83, 1.99, -0.74] }), 2);
  // antenna base
  box(0.1, 0.06, 0.1, P.dark, [-0.8, 2.0, -0.7]);

  // ---------- interior hint ----------
  // floor and dash
  box(2.0, 0.05, 1.6, P.dark, [0, 1.05, 0.1]);
  box(1.9, 0.18, 0.28, P.dark, [0, 1.62 - 0.3, 0.8]);
  glow(
    b.part(new THREE.PlaneGeometry(0.8, 0.3), "#ffffff", {
      bone: cab,
      at: [0, 1.46, 0.655],
      dir: [0, 0.3, -1],
      axis: "z",
      texture: dashTex,
    }),
    1.2,
  );
  // seats
  for (const s of [1, -1]) {
    box(0.55, 0.12, 0.55, P.rubber, [s * 0.45, 1.2, 0.2]);
    box(0.55, 0.55, 0.1, P.rubber, [s * 0.45, 1.52, -0.12]);
    box(0.22, 0.2, 0.08, P.armor, [s * 0.45, 1.88, -0.12]);
    box(0.5, 0.025, 0.04, P.trim, [s * 0.45, 1.55, -0.065]);
  }
  // steering wheel
  b.part(new THREE.TorusGeometry(0.11, 0.015, 4, 8), P.dark, {
    bone: cab,
    at: [0.45, 1.48, 0.6],
    dir: [0, 0.4, 1],
    axis: "z",
    flat: true,
  });
  // centre console glow strip
  glow(box(0.04, 0.02, 0.8, P.neonCyan, [0, 1.12, 0.1]), 1.5);

  // ---------- extra detail ----------
  // roof-front visor brow bolts
  for (let i = 0; i < 6; i++)
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), P.steel, {
      bone: cab,
      at: [-0.9 + i * 0.36, 1.97 + 0.04, 0.58],
    });
  // rear wall hazard top trim and magenta neon
  box(2.3, 0.05, 0.12, HAZARD, [0, 2.0 - 0.09, -0.85]);
  glow(box(2.0, 0.02, 0.02, P.neonMagenta, [0, 1.44, -0.91]), 1.6);
  // body-bone sill connecting plate
  b.part(new THREE.BoxGeometry(2.4, 0.06, 2.0), P.dark, { bone: body, at: [0, 1.03, 0.1], flat: true });
  // cab-side vents on rear wall
  for (let i = 0; i < 4; i++) box(0.3, 0.025, 0.02, P.dark, [-0.45 + i * 0.3, 1.55, -0.91]);
  // side neon accent beneath windows
  for (const s of [1, -1]) glow(box(0.015, 0.02, 1.7, P.neonCyan, [s * 1.23, 1.46, 0.1]), 1.4);
  // door seams
  for (const s of [1, -1]) for (const z of [0.1, 1.0, -0.8]) box(0.012, 0.42, 0.012, P.dark, [s * 1.215, 1.22, z]);
}
    return buildCabShell;
  })(),
  // frontEnd
  (() => {
function buildFrontEnd({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, flat: true, ...opts });

  const hullPaint = paint((p, n) => {
    const t = noise(p, 0.25, 3);
    const base = mix(P.hull, P.hullLight, 0.25 + 0.5 * smoothstep(0.2, 0.9, n.y) * t);
    const seam = Math.abs(((p.x + 5) % 0.5) - 0.25) < 0.004;
    return seam ? P.dark : base;
  });
  const armorPaint = paint((p, n) => mix(P.armor, P.hullLight, 0.2 * noise(p, 0.15, 5) + 0.2 * Math.max(0, n.y)));
  const hazard = paint((p) => ((Math.floor((p.x + p.y) / 0.08) % 2) ? P.trim : P.dark));

  // Hood: sloped faceted wedge
  const hoodShape: any = [
    [1.1, 1.05], [2.15, 1.0], [2.5, 0.88], [2.5, 0.7], [1.1, 0.7],
  ];
  for (const s of [1]) {
    b.extrude(hoodShape, { at: [-0.0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.02, color: hullPaint, bone });
  }
  // Hood top slope plate
  b.extrude([[1.1, 1.0], [2.2, 0.97], [2.3, 0.9], [1.1, 0.9]], {
    at: [0, 0.1, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.7, color: armorPaint, bone,
  });
  // Scoop
  b.extrude([[1.4, 1.1], [2.0, 1.1], [1.85, 1.3], [1.5, 1.3]], {
    at: [0, 0.0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.7, color: armorPaint, bone,
  });
  box(0.5, 0.05, 0.12, P.dark, [0, 1.285, 1.92], { rotation: [-12, 0, 0] });
  // Hood vents with orange glow
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      glow(box(0.35, 0.012, 0.04, P.orange, [s * 0.62, 1.1, 1.45 + i * 0.14], { rotation: [-3, s * 8, 0] }), 1.5);
      box(0.4, 0.02, 0.015, P.dark, [s * 0.62, 1.1, 1.52 + i * 0.14]);
    }
  }

  // Fenders + flares above thrusters
  for (const s of [1, -1]) {
    box(0.5, 0.45, 1.5, hullPaint, [s * 1.0, 0.95, 1.85]);
    box(0.12, 0.5, 1.25, armorPaint, [s * 1.27, 1.0, 1.7]);
    b.part(new THREE.CylinderGeometry(0.5, 0.58, 0.14, 8, 1, true, 0, Math.PI), P.armor, {
      bone, at: [s * 0.95, 0.9, M.thrusterFL[2]], rotation: [0, 0, 90], flat: true,
    });
    box(0.5, 0.06, 0.1, hazard, [s * 1.0, 1.22, 1.15]);
    // headlight with brow shield
    box(0.4, 0.17, 0.08, P.dark, [s * 0.82, 0.98, 2.54]);
    glow(box(0.34, 0.11, 0.05, P.white, [s * 0.82, 0.98, 2.58]), 2);
    glow(box(0.34, 0.025, 0.05, P.neonCyan, [s * 0.82, 0.9, 2.59]), 1.5);
    box(0.46, 0.05, 0.16, P.armor, [s * 0.82, 1.1, 2.55], { rotation: [15, 0, 0] });
    // tow hook
    b.sweep([[s * 0.5, 0.68, 2.55], [s * 0.5, 0.68, 2.65], [s * 0.5, 0.62, 2.68], [s * 0.5, 0.58, 2.62]], 0.022, { color: P.steel, bone, sides: 6 });
    // hazard corners
    box(0.22, 0.34, 0.2, hazard, [s * 1.14, 0.78, 2.6]);
  }

  // Grille texture
  let slits = "";
  for (let i = 0; i < 7; i++) slits += `<rect x="6" y="${6 + i * 8.5}" width="88" height="4.5" fill="#050608"/><rect x="6" y="${10 + i * 8.5}" width="88" height="1" fill="#2ff3ff"/>`;
  const grille = svg(`<svg viewBox="0 0 100 64"><rect width="100" height="64" fill="#1a1d24"/>${slits}<rect x="1" y="1" width="98" height="62" fill="none" stroke="#f2c200" stroke-width="2"/></svg>`, { size: 256 });
  box(1.0, 0.5, 0.1, P.dark, [0, 0.98, 2.52]);
  b.part(new THREE.PlaneGeometry(0.9, 0.42), "#ffffff", { bone, at: [0, 0.98, 2.575], dir: [0, 0, 1], axis: "z", texture: grille });
  // magenta bar
  glow(box(1.3, 0.04, 0.05, P.neonMagenta, [0, 1.27 - 0.02, 2.5]), 2);
  glow(box(1.0, 0.03, 0.04, P.neonMagenta, [0, 0.7, 2.6]), 2);

  // Bull-bar bumper
  box(2.3, 0.22, 0.28, armorPaint, [0, 0.68, 2.54]);
  box(1.4, 0.1, 0.1, hazard, [0, 0.8, 2.64]);
  for (const s of [1, -1]) {
    cyl(0.04, 0.04, 0.7, 6, P.steel, [s * 0.55, 0.95, 2.65]);
    cyl(0.04, 0.04, 0.7, 6, P.steel, [s * 0.15, 0.95, 2.65]);
    box(0.1, 0.1, 0.35, P.steel, [s * 0.55, 0.7, 2.52]);
  }
  box(1.3, 0.07, 0.07, P.steel, [0, 1.22, 2.65]);
  box(1.3, 0.07, 0.07, P.steel, [0, 0.86, 2.65]);
  // Winch
  cyl(0.07, 0.07, 0.4, 8, P.dark, [0, 0.66, 2.62], { rotation: [0, 0, 90] });
  cyl(0.085, 0.085, 0.06, 8, P.steel, [0.22, 0.66, 2.62], { rotation: [0, 0, 90] });
  cyl(0.085, 0.085, 0.06, 8, P.steel, [-0.22, 0.66, 2.62], { rotation: [0, 0, 90] });
  box(0.08, 0.1, 0.06, P.red, [0, 0.58, 2.67]);

  // Licence plate
  const plate = svg(`<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#f1f4f8"/><rect x="1.5" y="1.5" width="77" height="37" fill="none" stroke="#12141a" stroke-width="2"/><text x="40" y="28" font-family="monospace" font-weight="bold" font-size="20" text-anchor="middle" fill="#12141a">H0V-77</text></svg>`, { size: 160 });
  b.part(new THREE.PlaneGeometry(0.34, 0.17), "#ffffff", { bone, at: [0, 0.66, 2.692], dir: [0, 0, 1], axis: "z", texture: plate });
}
    return buildFrontEnd;
  })(),
  // cargoBed
  (() => {
function buildCargoBed({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const RUST: string = "#7a4a2e";

  const scuff = paint((p, n) => {
    const edge = smoothstep(0.55, 0.8, noise(p, 0.12, 4));
    const base = mix(P.hull, P.armor, noise(p, 0.3, 2));
    const top = n.y > 0.5 ? mix(base, P.hullLight, 0.25) : base;
    return mix(top, RUST, edge * 0.55);
  });
  const hazard = paint((p) => (Math.floor((p.x + p.z) / 0.1) % 2 === 0 ? P.trim : P.dark));

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...opts });

  // Floor and ribbed deck plates
  box(2.3, 0.08, 1.75, scuff, [0, 0.96, -1.75]);
  for (let i = 0; i < 9; i++) box(2.1, 0.03, 0.07, P.dark, [0, 1.02, -0.98 - i * 0.18]);

  // Side walls (faceted: lower panel + angled upper panel), hazard top trim, cyan strip
  for (const s of [1, -1]) {
    box(0.1, 0.5, 1.8, scuff, [s * 1.17, 1.22, -1.78]);
    box(0.12, 0.2, 1.8, scuff, [s * 1.19, 1.5, -1.78], { rotation: [0, 0, s * 12] });
    box(0.14, 0.06, 1.8, hazard, [s * 1.2, 1.64, -1.78]);
    glow(box(0.04, 0.03, 1.7, P.neonCyan, [s * 1.11, 1.67, -1.78]), 1.4);
    // wheel-arch bulges
    const arch = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
    b.part(arch, P.armor, { bone, at: [s * 1.12, 1.2, -1.7], rotation: [0, 0, 90] });
    box(0.22, 0.04, 0.5, P.trim, [s * 1.16, 1.43, -1.7]);
    // armour rivets on wall
    for (let i = 0; i < 4; i++) box(0.03, 0.05, 0.05, P.steel, [s * 1.23, 1.3, -1.1 - i * 0.45]);
  }
  // front wall
  box(2.4, 0.7, 0.1, scuff, [0, 1.3, -0.9]);
  box(2.4, 0.06, 0.12, hazard, [0, 1.66, -0.9]);

  // Tailgate
  box(2.4, 0.55, 0.1, scuff, [0, 1.25, -2.62]);
  box(2.4, 0.2, 0.12, scuff, [0, 1.58, -2.63], { rotation: [-12, 0, 0] });
  box(2.4, 0.06, 0.14, hazard, [0, 1.7, -2.64]);
  for (const s of [1, -1]) box(0.08, 0.5, 0.04, P.dark, [s * 0.5, 1.25, -2.68]);

  // Licence decal
  const plate = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#f1f4f8" stroke="#12141a" stroke-width="2"/><text x="32" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#12141a">HX-07</text><text x="6" y="10" font-size="8" fill="#d8202a">技</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", { bone, at: [0, 1.0, -2.78], dir: [0, 0, -1], axis: "z", texture: plate });

  // Rear bumper with tail lights and vents
  box(2.4, 0.2, 0.2, P.armor, [0, 0.92, -2.68]);
  box(2.45, 0.05, 0.22, hazard, [0, 1.04, -2.68]);
  for (const s of [1, -1]) {
    glow(box(0.3, 0.12, 0.05, P.red, [s * 0.95, 1.1, -2.7]), 1.6);
    box(0.36, 0.18, 0.04, P.dark, [s * 0.95, 1.1, -2.68]);
    // exhaust stacks
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.6, 8), P.steel, { bone, at: [s * 1.0, 1.4, -2.5] });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 8), P.orange, { bone, at: [s * 1.0, 1.71, -2.5] });
    for (let i = 0; i < 3; i++) box(0.15, 0.015, 0.1, P.dark, [s * 1.0, 1.25 + i * 0.1, -2.44], { });
  }

  // Roll-cage
  const rod = (a: number[], c: number[], r = 0.035) => b.rod(a, c, r, P.steel, { bone, sides: 6 });
  for (const s of [1, -1]) {
    rod([s * 1.1, 1.0, -1.0], [s * 1.1, 1.95, -1.0]);
    rod([s * 1.1, 1.0, -2.45], [s * 1.1, 1.95, -2.45]);
    rod([s * 1.1, 1.95, -1.0], [s * 1.1, 1.95, -2.45]);
    rod([s * 1.1, 1.0, -1.0], [s * 1.1, 1.95, -1.72], 0.025);
    b.part(new THREE.BoxGeometry(0.12, 0.05, 0.12), P.trim, { bone, at: [s * 1.1, 1.04, -1.0] });
  }
  rod([-1.1, 1.95, -1.0], [1.1, 1.95, -1.0]);
  rod([-1.1, 1.95, -2.45], [1.1, 1.95, -2.45]);
  // mount bar for gun
  rod([0, 1.95, -1.0], [0, 1.95, -2.45], 0.04);
  rod([-0.3, 1.95, -1.4], [0.3, 1.95, -1.4], 0.04);
  b.part(new THREE.CylinderGeometry(0.14, 0.16, 0.06, 8), P.armor, { bone, at: [0, 1.62, -1.4] });
  rod([0, 1.0, -1.4], [0, 1.6, -1.4], 0.03);

  // Ammo crate stack
  const crate = svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#5a5f3a"/><rect x="2" y="2" width="36" height="36" fill="none" stroke="#2a2d1a" stroke-width="2"/><text x="20" y="24" text-anchor="middle" font-size="10" font-family="monospace" fill="#f2c200">AMMO</text></svg>`,
    { size: 96 },
  );
  const crateAt = [[-0.7, 1.15, -2.15], [-0.7, 1.15, -1.6], [-0.7, 1.35, -2.0]];
  crateAt.forEach((p, i) =>
    b.part(new THREE.BoxGeometry(0.4, 0.2, 0.4), "#ffffff", { bone, at: p, rotation: [0, i * 9, 0], texture: crate }),
  );
  box(0.42, 0.03, 0.1, P.trim, [-0.7, 1.46, -2.0]);

  // Fuel canisters with straps
  for (let i = 0; i < 2; i++) {
    const z = -1.35 - i * 0.4;
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 8), i ? P.orange : P.red, { bone, at: [0.65, 1.25, z] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 6), P.steel, { bone, at: [0.65, 1.53, z] });
    for (const dy of [-0.12, 0.12])
      b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 8), P.rubber, { bone, at: [0.65, 1.25 + dy, z] });
  }
  box(0.4, 0.02, 0.9, P.dark, [0.65, 1.0, -1.55]);

  // Cargo net lashing hooks
  for (let i = 0; i < 5; i++) for (const s of [1, -1])
    b.part(new THREE.TorusGeometry(0.025, 0.007, 4, 6), P.steel, { bone, at: [s * 1.08, 1.12, -1.1 - i * 0.3 - R() * 0.02] });

  // Neon magenta tail strip
  glow(box(2.2, 0.025, 0.03, P.neonMagenta, [0, 1.52, -2.55]), 1.3);
  glow(box(2.1, 0.025, 0.03, P.neonCyan, [0, 1.63, -0.97]), 1.3);
}
    return buildCargoBed;
  })(),
  // gunMount
  (() => {
function buildGunMount({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const mount = J.gunMount;
  const barrelJ = J.gunBarrel;
  const [px, py, pz] = M.gunPintle;

  const HOUSING = "#20242d";
  const BRASS = "#c9a14a";

  const gun = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.3, 0.8, noise(p, 0.06, 3)));
    const top = smoothstep(0.4, 1, n.y);
    return mix(base, P.hullLight, top * 0.4);
  });
  const dk = paint((p, n) => mix(P.dark, P.hull, smoothstep(0.3, 0.9, noise(p, 0.04, 5)) * 0.6 + n.y * 0.1));

  const screenTex = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#032a33"/>
    <rect x="2" y="2" width="60" height="36" fill="none" stroke="#2ff3ff" stroke-width="2"/>
    <text x="6" y="16" font-family="monospace" font-size="11" fill="#2ff3ff">AMMO 0312</text>
    <rect x="6" y="22" width="40" height="6" fill="#2ff3ff"/><rect x="6" y="22" width="14" height="6" fill="#ff2fb4"/>
    <path d="M6 35 L20 31 L30 34 L44 29 L58 33" stroke="#2ff3ff" stroke-width="1.5" fill="none"/></svg>`,
    { size: 256 },
  );
  const dotTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#300"/><circle cx="16" cy="16" r="2.5" fill="#ff3030"/><path d="M16 4V9M16 23V28M4 16H9M23 16H28" stroke="#ff3030" stroke-width="1.5"/></svg>`,
    { size: 64 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 32 8"><rect width="32" height="8" fill="#f2c200"/><path d="M0 8L8 0H16L8 8ZM16 8L24 0H32L24 8Z" fill="#12141a"/></svg>`,
    { size: 128 },
  );

  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, ...o });

  // ---- base plate and post on gunMount
  cyl(0.3, 0.34, 0.04, 8, dk, [px, 1.67, pz], mount);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    cyl(0.018, 0.018, 0.03, 6, P.steel, [px + Math.cos(a) * 0.26, 1.7, pz + Math.sin(a) * 0.26], mount);
  }
  cyl(0.09, 0.12, 0.28, 8, gun, [px, 1.82, pz], mount);
  cyl(0.15, 0.15, 0.05, 8, P.steel, [px, 1.97, pz], mount);
  // swivel ring with hazard band
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 12, 1, true), "#ffffff", {
    bone: mount, at: [px, 1.935, pz], texture: hazard,
  });
  cyl(0.19, 0.2, 0.04, 8, dk, [px, 1.99, pz], mount);

  // yoke cheeks
  for (const s of [1, -1]) {
    box(0.05, 0.22, 0.2, gun, [px + s * 0.17, 2.1, pz], mount);
    cyl(0.04, 0.04, 0.06, 8, P.steel, [px + s * 0.2, 2.15, pz], mount, { rotation: [0, 0, 90] });
  }

  // gun shield (angled facets)
  const sh = [
    [-0.36, 0], [0.36, 0], [0.4, 0.18], [0.3, 0.34], [-0.3, 0.34], [-0.4, 0.18],
  ].map(([x, y]) => [x, y]) as [number, number][];
  const shield = b.extrude(sh, {
    at: [px, 2.0, pz + 0.38], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.01, color: P.armor, bone: mount,
  });
  box(0.7, 0.025, 0.04, P.trim, [px, 2.02, pz + 0.405], mount);
  for (const s of [1, -1]) {
    cyl(0.02, 0.02, 0.04, 6, P.steel, [px + s * 0.3, 2.22, pz + 0.4], mount, { rotation: [90, 0, 0] });
  }
  // viewing slit
  box(0.3, 0.035, 0.045, P.dark, [px, 2.2, pz + 0.4], mount);
  // handles on shield back side
  void shield;

  // ---- receiver, on barrel joint
  const rz = pz + 0.12;
  const ry = 2.12;
  box(0.2, 0.2, 0.55, gun, [px, ry, rz], barrelJ);
  box(0.22, 0.04, 0.4, P.armor, [px, ry + 0.12, rz + 0.02], barrelJ);
  box(0.24, 0.06, 0.1, P.trim, [px, ry - 0.02, rz - 0.22], barrelJ);
  // heat vent slots
  for (let i = 0; i < 4; i++)
    for (const s of [1, -1])
      box(0.012, 0.05, 0.05, P.dark, [px + s * 0.103, ry + 0.02, rz + 0.04 + i * 0.08], barrelJ);
  // status screen
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.094), "#ffffff", {
      bone: barrelJ, at: [px + 0.106, ry + 0.02, rz - 0.12], dir: [1, 0, 0], axis: "z", texture: screenTex,
    }),
    1.3,
  );
  box(0.012, 0.115, 0.17, P.dark, [px + 0.102, ry + 0.02, rz - 0.12], barrelJ);

  // ammo box on the left (+X) with belt feed
  box(0.17, 0.2, 0.3, "#3b4a36", [px + 0.2, ry - 0.06, rz + 0.02], barrelJ);
  box(0.18, 0.03, 0.31, P.trim, [px + 0.2, ry + 0.05, rz + 0.02], barrelJ);
  box(0.06, 0.035, 0.1, P.steel, [px + 0.2, ry - 0.17, rz + 0.02], barrelJ);
  box(0.12, 0.02, 0.12, P.red, [px + 0.2, ry - 0.2, rz + 0.1], barrelJ);
  // belt of cartridges curving up into receiver
  const bz = rz - 0.02;
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = px + 0.2 - t * 0.17;
    const y = ry + 0.05 - t * 0.1 + Math.sin(t * Math.PI) * 0.0;
    cyl(0.017, 0.017, 0.045, 6, BRASS, [x, y, bz + 0.17 + (i % 2) * 0.0], barrelJ, { rotation: [0, 0, 90 + t * 20] });
    cyl(0.01, 0.017, 0.02, 6, P.orange, [x, y, bz + 0.17], barrelJ, { rotation: [0, 0, 90 + t * 20] });
  }
  // belt links
  box(0.18, 0.012, 0.025, P.steel, [px + 0.11, ry - 0.02, bz + 0.17], barrelJ);

  // top rail + red dot sight
  box(0.05, 0.02, 0.5, P.steel, [px, ry + 0.155, rz + 0.02], barrelJ);
  for (let i = 0; i < 7; i++) box(0.055, 0.008, 0.012, P.dark, [px, ry + 0.168, rz - 0.18 + i * 0.07], barrelJ);
  box(0.07, 0.03, 0.08, P.dark, [px, ry + 0.19, rz - 0.05], barrelJ);
  box(0.012, 0.07, 0.012, P.dark, [px + 0.03, ry + 0.23, rz - 0.07], barrelJ);
  box(0.012, 0.07, 0.012, P.dark, [px - 0.03, ry + 0.23, rz - 0.07], barrelJ);
  box(0.075, 0.025, 0.07, P.dark, [px, ry + 0.27, rz - 0.07], barrelJ);
  glow(
    b.part(new THREE.PlaneGeometry(0.058, 0.058), "#ffffff", {
      bone: barrelJ, at: [px, ry + 0.235, rz - 0.032], dir: [0, 0, 1], axis: "z", texture: dotTex,
    }),
    1.5,
  );

  // handles (rear spade grips)
  for (const s of [1, -1]) {
    cyl(0.014, 0.014, 0.12, 6, P.steel, [px + s * 0.09, ry + 0.04, rz - 0.34], barrelJ, { rotation: [90, 0, 0] });
    cyl(0.02, 0.02, 0.1, 6, P.rubber, [px + s * 0.09, ry + 0.04, rz - 0.38], barrelJ, { rotation: [90, 0, 0] });
  }
  box(0.2, 0.025, 0.04, P.steel, [px, ry + 0.04, rz - 0.3], barrelJ);
  box(0.03, 0.12, 0.03, P.rubber, [px, ry - 0.1, rz - 0.15], barrelJ);

  // ---- barrel
  const bStart = rz + 0.28;
  const bLen = 0.66;
  const bz0 = bStart + bLen / 2;
  cyl(0.032, 0.032, bLen + 0.1, 8, P.steel, [px, ry, bz0], barrelJ, { rotation: [90, 0, 0] });
  // perforated shroud
  cyl(0.065, 0.065, 0.5, 8, P.armor, [px, ry, bStart + 0.28], barrelJ, { rotation: [90, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const z = bStart + 0.08 + i * 0.085;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      cyl(0.014, 0.014, 0.02, 6, P.dark, [px + Math.cos(a) * 0.063, ry + Math.sin(a) * 0.063, z], barrelJ, {
        dir: [Math.cos(a), Math.sin(a), 0],
      });
    }
  }
  for (const z of [bStart + 0.03, bStart + 0.53]) cyl(0.075, 0.075, 0.03, 8, P.trim, [px, ry, z], barrelJ, { rotation: [90, 0, 0] });
  // cooling fins along bare barrel
  for (let i = 0; i < 4; i++)
    cyl(0.048, 0.048, 0.015, 8, P.hullLight, [px, ry, bStart + 0.55 + i * 0.03], barrelJ, { rotation: [90, 0, 0] });
  // bipod-free: front block + flash hider
  const fz = bStart + bLen + 0.03;
  cyl(0.05, 0.04, 0.12, 8, P.dark, [px, ry, fz], barrelJ, { rotation: [90, 0, 0] });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    box(0.012, 0.012, 0.1, P.dark, [px + Math.cos(a) * 0.05, ry + Math.sin(a) * 0.05, fz + 0.01], barrelJ);
  }
  glow(cyl(0.03, 0.03, 0.02, 8, P.orange, [px, ry, fz + 0.07], barrelJ, { rotation: [90, 0, 0] }), 1.8);
  glow(cyl(0.045, 0.03, 0.015, 8, P.orange, [px, ry, fz + 0.055], barrelJ, { rotation: [90, 0, 0] }), 1.2);

  // elevation trunnion
  cyl(0.03, 0.03, 0.34, 8, P.steel, [px, ry, rz - 0.05], barrelJ, { rotation: [0, 0, 90] });
  void R;
  void HOUSING;
}
    return buildGunMount;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["cab"] = b.joint("cab", { parent: J["body"], at: [0,1,0.3], dir: [0,0,1], role: "hinge", group: "cab" });
  J["gunMount"] = b.joint("gunMount", { parent: J["body"], at: [0,1.65,-1.4], dir: [0,1,0], role: "hinge", group: "gun" });
  J["gunBarrel"] = b.joint("gunBarrel", { parent: J["gunMount"], at: [0,1.75,-1.4], dir: [0,0,1], role: "hinge", group: "gun" });
  J["thrusterFL"] = b.joint("thrusterFL", { parent: J["body"], at: [0.95,0.5,1.6], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterFR"] = b.joint("thrusterFR", { parent: J["body"], at: [-0.95,0.5,1.6], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterRL"] = b.joint("thrusterRL", { parent: J["body"], at: [0.95,0.5,-1.7], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  J["thrusterRR"] = b.joint("thrusterRR", { parent: J["body"], at: [-0.95,0.5,-1.7], dir: [0,-1,0], role: "hinge", group: "thrusters" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
