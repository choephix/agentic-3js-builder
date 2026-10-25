import * as THREE from "three";
import { createBuilder, svg, paint, mix, noise, smoothstep, countershade, catmull } from "../../../../src/index";
import type { Paint, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Convoy Hauler AEGIS-9",
  description:
    "Low-poly cyberpunk armoured six-wheel convoy hauler: bunker cab with visor, roof turret, and a sealed octagonal cargo pod with neon seals, a rear gun and hazard-striped bumpers.",
};

type V = [number, number, number];
type Col = string | Paint;

export default function build() {
  const b = createBuilder({ name: "convoy_hauler", paintSize: 2048 });
  const chassis = b.joint("chassis", { at: [0, 0.95, 0], role: "spine" });

  // ---------- palette
  const TRIM = "#161a24";
  const STEEL = "#7b8599";
  const DARKSTEEL = "#3a4152";
  const ORANGE = "#ff7a1a";
  const CYAN = "#27f0ff";
  const MAGENTA = "#ff2bd6";
  const AMBER = "#ffb21a";
  const RED = "#ff2a3c";
  const GLASS = "#0c1c28";
  const RUBBER = "#14151a";
  const WHITE = "#eaffff";

  const hullBase = paint((p, n) => {
    const c = mix("#46526e", "#222a3b", smoothstep(-0.2, 0.9, -n.y));
    const grime = smoothstep(1.5, 0.4, p.y) * noise(p, 0.45, 3);
    const scuff = smoothstep(0.62, 0.8, noise(p, 0.18, 8)) * 0.25;
    return mix(mix(c, "#17140f", grime * 0.65), "#7d8aa6", scuff);
  });
  const HULL = panelled(hullBase, { size: 0.55, aspect: 0.8, rivets: 0.1 });
  const ARMOR = panelled(countershade("#2c3342", "#161a24"), { size: 0.4, rivets: 0.08 });
  const POD = panelled(countershade("#e6eaf2", "#8f99ad", { level: -0.1 }), {
    size: 0.7,
    aspect: 0.9,
    rivets: 0.12,
    seam: "#5b6578",
  });

  // ---------- textures
  let stripes = "";
  for (let i = 0; i < 10; i++)
    stripes += `<path d="M${i * 10 - 8} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 3} 16Z" fill="#14141a"/>`;
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#ffc21a"/><g transform="scale(0.64 1)">${stripes}</g><rect width="64" height="16" fill="none" stroke="#14141a" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  let scan = "";
  for (let i = 0; i < 10; i++) scan += `<rect x="0" y="${i * 4 + 1}" width="100" height="0.8" fill="#27f0ff" opacity="0.35"/>`;
  const VISOR = svg(
    `<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#06323f"/><stop offset="0.5" stop-color="#0c7a8c"/><stop offset="1" stop-color="#06323f"/></linearGradient></defs><rect width="100" height="20" fill="url(#g)"/>${scan}<path d="M8 14 L30 14 L34 8 L50 8" stroke="#aaffff" stroke-width="1.4" fill="none"/><circle cx="72" cy="10" r="5" fill="none" stroke="#ff2bd6" stroke-width="1.2"/><path d="M66 10 H78 M72 4 V16" stroke="#ff2bd6" stroke-width="0.8"/><text x="84" y="12" font-size="5" fill="#aaffff" font-family="monospace">ESC-7</text><rect width="100" height="20" fill="none" stroke="#042028" stroke-width="2"/></svg>`,
    { size: 512 },
  );
  const LOGO = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 4 L90 27 L90 73 L50 96 L10 73 L10 27Z" fill="#141a2e" stroke="#ff7a1a" stroke-width="5"/><path d="M50 18 L78 34 L78 66 L50 82 L22 66 L22 34Z" fill="none" stroke="#27f0ff" stroke-width="2"/><path d="M26 50 Q50 28 74 50 Q50 72 26 50Z" fill="#ff7a1a"/><circle cx="50" cy="50" r="9" fill="#141a2e"/><circle cx="50" cy="50" r="4" fill="#27f0ff"/><path d="M50 6 V18 M50 82 V94" stroke="#ff7a1a" stroke-width="3"/></svg>`,
    { size: 512 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 160 24" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="158" height="22" rx="3" fill="#141a2e" stroke="#ff7a1a" stroke-width="2"/><text x="10" y="17" font-size="13" font-weight="bold" font-family="monospace" fill="#ff7a1a">SEALED // CARGO</text><rect x="128" y="6" width="24" height="12" fill="#ffc21a"/><path d="M130 18 L136 6 M138 18 L144 6 M146 18 L152 6" stroke="#14141a" stroke-width="3"/></svg>`,
    { size: 512 },
  );
  const STATUS = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="#04120c"/><text x="5" y="13" font-size="9" font-weight="bold" font-family="monospace" fill="#2bff8a">SEALED</text><text x="5" y="23" font-size="6" font-family="monospace" fill="#2bff8a">LOCK 3/3</text><rect x="42" y="6" width="16" height="4" fill="#2bff8a"/><rect x="42" y="13" width="16" height="4" fill="#2bff8a"/><rect x="42" y="20" width="16" height="4" fill="#ff2a3c"/><rect width="64" height="32" fill="none" stroke="#2bff8a" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="24" rx="2" fill="#ffc21a"/><rect x="2" y="2" width="56" height="20" rx="1" fill="#14141a"/><text x="6" y="17" font-size="13" font-weight="bold" font-family="monospace" fill="#ffc21a">CV-77</text><rect x="2" y="2" width="6" height="4" fill="#ff2bd6"/></svg>`,
    { size: 256 },
  );

  // ---------- helpers
  const bx = (w: number, h: number, d: number, col: Col, at: V, bone: Joint = chassis, rot: V = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot });
  const cy = (r: number, h: number, col: Col, at: V, bone: Joint = chassis, rot: V = [0, 0, 0], sides = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), col, { bone, at, rotation: rot, flat: true });
  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, bone: Joint = chassis) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const rod = (a: V, c: V, r: number, col: Col, bone: Joint = chassis, sides = 6) =>
    b.rod(a, c, r, col, { bone, sides });
  const D2R = 180 / Math.PI;

  // ---------- frame and running gear
  bx(1.3, 0.22, 9.0, TRIM, [0, 0.95, -0.1]);
  for (const z of [-4.0, -2.3, -0.4, 1.4, 3.6]) bx(1.9, 0.14, 0.2, DARKSTEEL, [0, 0.9, z]);
  for (const z of [2.9, -1.6, -3.0]) {
    rod([-1.2, 0.55, z], [1.2, 0.55, z], 0.1, DARKSTEEL, chassis, 8);
    b.part(new THREE.SphereGeometry(0.28, 8, 6), DARKSTEEL, { bone: chassis, at: [0, 0.55, z], flat: true });
    for (const s of [1, -1]) {
      rod([s * 0.6, 0.95, z - 0.3], [s * 0.6, 0.62, z + 0.05], 0.04, STEEL);
    }
  }
  rod([0, 0.6, 2.9], [0, 0.6, -3.0], 0.06, STEEL, chassis, 8);
  for (const s of [1, -1]) {
    cy(0.3, 1.6, DARKSTEEL, [s * 0.85, 0.78, 0.45], chassis, [90, 0, 0], 8); // fuel tank
    for (const z of [-0.1, 1.0]) bx(0.7, 0.05, 0.08, STEEL, [s * 0.85, 0.78, z]);
    glow(bx(0.05, 0.16, 0.06, AMBER, [s * 1.0, 0.78, 1.24]));
    // underglow
    glow(bx(0.06, 0.05, 2.2, MAGENTA, [s * 0.55, 0.7, 0.4]));
    glow(bx(0.06, 0.05, 1.4, MAGENTA, [s * 0.55, 0.7, -2.3]));
  }

  const wheel = (tag: string, s: number, z: number) => {
    const X = s * 1.2;
    const hub = b.joint("wheel" + tag, { parent: chassis, at: [X, 0.55, z], dir: [1, 0, 0], role: "hinge" });
    cy(0.52, 0.5, RUBBER, [X, 0.55, z], hub, [0, 0, 90], 12);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      bx(0.46, 0.1, 0.18, RUBBER, [X, 0.55 + 0.53 * Math.cos(a), z + 0.53 * Math.sin(a)], hub, [a * D2R, 0, 0]);
    }
    cy(0.33, 0.54, STEEL, [X, 0.55, z], hub, [0, 0, 90], 10);
    cy(0.14, 0.62, DARKSTEEL, [X + s * 0.02, 0.55, z], hub, [0, 0, 90], 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cy(0.028, 0.06, ORANGE, [X + s * 0.29, 0.55 + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)], hub, [0, 0, 90], 6);
    }
    glow(
      b.part(new THREE.TorusGeometry(0.27, 0.025, 4, 12), CYAN, {
        bone: hub,
        at: [X + s * 0.27, 0.55, z],
        rotation: [0, 90, 0],
      }),
    );
  };
  const wz: [string, number][] = [["F", 2.9], ["M", -1.6], ["R", -3.0]];
  for (const [t, z] of wz)
    for (const s of [1, -1]) {
      wheel(t + (s > 0 ? "L" : "R"), s, z);
      bx(0.78, 0.08, 1.35, ARMOR, [s * 1.2, 1.24, z]);
      bx(0.08, 0.3, 1.35, ARMOR, [s * 1.55, 1.1, z]);
      if (z < 0) bx(0.55, 0.45, 0.05, RUBBER, [s * 1.2, 0.6, z - 0.7]);
    }

  // ---------- cab
  bx(2.5, 0.9, 1.2, HULL, [0, 1.65, 3.8]); // nose
  bx(2.5, 0.08, 1.3, HULL, [0, 2.13, 3.8], chassis, [12, 0, 0]);
  bx(2.5, 1.5, 1.8, HULL, [0, 2.05, 2.3]); // cab
  bx(2.3, 0.12, 1.6, ARMOR, [0, 2.86, 2.3]);
  bx(2.56, 0.12, 1.84, TRIM, [0, 1.32, 2.3]);
  for (const s of [1, -1]) {
    bx(0.1, 0.9, 1.0, ARMOR, [s * 1.3, 1.7, 3.85], chassis, [0, 0, s * 8]);
    bx(0.05, 0.1, 1.7, ORANGE, [s * 1.28, 1.52, 2.3]);
    bx(0.12, 0.5, 0.25, ARMOR, [s * 1.25, 2.55, 3.15], chassis, [0, s * 20, 0]); // A-pillar guard
    // door
    const door = b.joint("door" + (s > 0 ? "L" : "R"), {
      parent: chassis,
      at: [s * 1.27, 2.05, 3.0],
      dir: [0, 1, 0],
      role: "hinge",
    });
    bx(0.08, 1.15, 1.35, HULL, [s * 1.29, 2.0, 2.3], door);
    bx(0.1, 0.38, 0.8, GLASS, [s * 1.31, 2.45, 2.25], door);
    bx(0.12, 0.05, 0.22, STEEL, [s * 1.33, 2.0, 1.75], door);
    plane(0.55, 0.22, PLATE, [s * 1.345, 1.7, 2.3], [s, 0, 0], door);
    // mirror
    rod([s * 1.3, 2.7, 3.05], [s * 1.6, 2.7, 3.15], 0.03, STEEL);
    bx(0.08, 0.34, 0.18, TRIM, [s * 1.65, 2.62, 3.15]);
    glow(bx(0.02, 0.26, 0.12, CYAN, [s * 1.62, 2.62, 3.15]));
    // headlights
    glow(bx(0.7, 0.1, 0.05, WHITE, [s * 0.85, 1.85, 4.42], chassis, [0, 0, s * -8]));
    glow(bx(0.5, 0.05, 0.05, MAGENTA, [s * 0.9, 1.7, 4.42]));
    bx(0.8, 0.2, 0.12, TRIM, [s * 0.85, 1.85, 4.38]);
    // exhausts
    rod([s * 1.12, 1.2, 1.2], [s * 1.12, 3.4, 1.2], 0.09, STEEL, chassis, 8);
    cy(0.13, 0.6, DARKSTEEL, [s * 1.12, 1.9, 1.2], chassis, [0, 0, 0], 8);
    glow(
      b.part(new THREE.TorusGeometry(0.115, 0.02, 4, 8), AMBER, {
        bone: chassis,
        at: [s * 1.12, 2.4, 1.2],
        rotation: [90, 0, 0],
      }),
    );
    cy(0.12, 0.08, TRIM, [s * 1.12, 3.42, 1.2], chassis, [0, 0, 0], 8);
    // wheel-well side armour
    bx(0.06, 0.7, 2.5, ARMOR, [s * 1.27, 0.98, 0.55], chassis, [0, 0, s * -6]);
    glow(bx(0.04, 0.05, 2.5, ORANGE, [s * 1.32, 0.68, 0.55]));
  }
  // visor
  bx(2.2, 0.55, 0.1, TRIM, [0, 2.48, 3.17]);
  glow(plane(2.0, 0.4, VISOR, [0, 2.48, 3.235], [0, 0, 1]), 0.8);
  bx(2.3, 0.1, 0.22, ARMOR, [0, 2.8, 3.22], chassis, [-25, 0, 0]); // brow
  // grille
  bx(1.6, 0.6, 0.06, TRIM, [0, 1.45, 4.42]);
  for (let i = 0; i < 4; i++) glow(bx(1.4, 0.04, 0.04, CYAN, [0, 1.27 + i * 0.13, 4.46]), 0.8);
  // bumper
  bx(2.7, 0.55, 0.5, ARMOR, [0, 0.95, 4.55]);
  plane(2.5, 0.38, HAZARD, [0, 0.95, 4.81], [0, 0, 1]);
  for (let i = 0; i < 7; i++) b.spike([-1.2 + i * 0.4, 0.78, 4.8], [0, 0, 1], 0.32, 0.07, STEEL, { bone: chassis, sides: 4 });
  bx(2.6, 0.12, 0.7, ARMOR, [0, 1.3, 4.6], chassis, [20, 0, 0]);
  // roof gear
  bx(1.6, 0.12, 0.22, TRIM, [0, 3.0, 2.95]);
  [-0.6, -0.3, 0, 0.3, 0.6].forEach((x) => glow(bx(0.2, 0.1, 0.14, x % 0.6 === 0 ? RED : AMBER, [x, 3.1, 2.95])));
  b.spike([-1.0, 2.92, 1.6], [0, 1, 0], 1.3, 0.025, STEEL, { bone: chassis, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), RED, { bone: chassis, at: [-1.0, 4.25, 1.6], flat: true }));
  b.lathe(
    [[0, 0], [0.32, 0.12], [0.32, 0.15], [0, 0.04]],
    { at: [0.9, 3.05, 1.7], axis: [0, 0.8, 0.6], segments: 10, bone: chassis, color: STEEL },
  );
  cy(0.04, 0.2, DARKSTEEL, [0.9, 2.98, 1.7]);

  // ---------- turret helper
  const turret = (tag: string, x: number, y: number, z: number, big: boolean) => {
    const k = big ? 1 : 0.85;
    const yaw = b.joint("yaw" + tag, { parent: chassis, at: [x, y, z], dir: [0, 1, 0], role: "hinge" });
    const pitch = b.joint("pitch" + tag, { parent: yaw, at: [x, y + 0.5 * k, z], dir: [0, 0, 1], role: "hinge" });
    cy(0.5 * k, 0.16, TRIM, [x, y + 0.08, z], yaw, [0, 0, 0], 8);
    bx(0.95 * k, 0.4 * k, 1.0 * k, ARMOR, [x, y + 0.36 * k, z - 0.05], yaw);
    bx(0.8 * k, 0.1, 0.7 * k, HULL, [x, y + 0.6 * k, z - 0.1], yaw, [-8, 0, 0]);
    for (const s of [1, -1]) {
      bx(0.4 * k, 0.3 * k, 0.3 * k, DARKSTEEL, [x + s * 0.6 * k, y + 0.36 * k, z - 0.1], yaw); // ammo box
      bx(0.06, 0.3 * k, 0.5 * k, ARMOR, [x + s * 0.3 * k, y + 0.55 * k, z + 0.3], yaw);
      rod([x + s * 0.18 * k, y + 0.5 * k, z + 0.3], [x + s * 0.18 * k, y + 0.5 * k, z + 1.7 * k], 0.05, STEEL, pitch);
      rod([x + s * 0.18 * k, y + 0.5 * k, z + 0.35], [x + s * 0.18 * k, y + 0.5 * k, z + 1.0 * k], 0.09, DARKSTEEL, pitch, 8);
      bx(0.14, 0.14, 0.2, TRIM, [x + s * 0.18 * k, y + 0.5 * k, z + 1.75 * k], pitch);
      glow(bx(0.04, 0.04, 0.03, MAGENTA, [x + s * 0.18 * k, y + 0.5 * k, z + 1.86 * k]), 1.2);
    }
    bx(0.3, 0.3, 0.5, DARKSTEEL, [x, y + 0.5 * k, z + 0.35], pitch);
    glow(cy(0.08, 0.06, CYAN, [x, y + 0.55 * k, z + 0.62], pitch, [90, 0, 0], 8), 1.2);
  };
  turret("Roof", 0, 2.92, 2.0, true);

  // ---------- deck and sealed pod
  bx(2.0, 0.16, 5.5, TRIM, [0, 1.12, -1.65]);
  bx(2.4, 0.5, 0.15, ARMOR, [0, 1.35, 1.05]); // headboard shield
  for (const z of [-3.6, -1.6, 0.4]) {
    bx(1.9, 0.22, 0.4, DARKSTEEL, [0, 1.3, z]);
    for (const s of [1, -1]) {
      bx(0.2, 0.5, 0.44, ARMOR, [s * 1.0, 1.55, z]);
      glow(bx(0.05, 0.14, 0.1, CYAN, [s * 1.12, 1.6, z]));
    }
  }
  const pod = b.lathe(
    [[0, -2.6], [0.7, -2.5], [1.15, -2.1], [1.2, -1.8], [1.2, 1.8], [1.15, 2.1], [0.7, 2.5], [0, 2.6]],
    { at: [0, 2.45, -1.6], axis: [0, 0, 1], segments: 8, bone: chassis, color: POD },
  );
  for (const zb of [-3.4, -1.6, 0.2]) {
    b.lathe([[1.17, -0.2], [1.27, -0.2], [1.27, 0.2], [1.17, 0.2]], {
      at: [0, 2.45, zb], axis: [0, 0, 1], segments: 8, bone: chassis, color: ORANGE,
    });
    for (const dz of [-0.32, 0.32])
      glow(
        b.lathe([[1.2, -0.025], [1.3, -0.025], [1.3, 0.025], [1.2, 0.025]], {
          at: [0, 2.45, zb + dz], axis: [0, 0, 1], segments: 8, bone: chassis, color: CYAN,
        }),
      );
  }
  for (const s of [1, -1]) {
    b.decal(pod, LOGO, { at: [s * 1.15, 2.6, -1.6], dir: [s, 0, 0], size: [1.2, 1.2], bone: chassis });
    b.decal(pod, LABEL, { at: [s * 1.15, 1.95, -2.6], dir: [s, 0, 0], size: [1.7, 0.26], bone: chassis });
  }
  // rear lock + status
  cy(0.4, 0.14, STEEL, [0, 2.45, -4.24], chassis, [90, 0, 0], 10);
  cy(0.18, 0.2, DARKSTEEL, [0, 2.45, -4.3], chassis, [90, 0, 0], 8);
  glow(b.part(new THREE.TorusGeometry(0.34, 0.03, 4, 12), RED, { bone: chassis, at: [0, 2.45, -4.32] }));
  glow(plane(0.7, 0.35, STATUS, [0, 3.0, -4.12], [0, -0.4, -1]), 0.9);
  // top hatch with seal
  const hatch = b.joint("hatchPod", { parent: chassis, at: [0, 3.62, -0.9], dir: [1, 0, 0], role: "hinge" });
  cy(0.5, 0.14, STEEL, [0, 3.66, -1.5], hatch, [0, 0, 0], 8);
  cy(0.3, 0.06, DARKSTEEL, [0, 3.74, -1.5], hatch, [0, 0, 0], 8);
  glow(cy(0.07, 0.06, RED, [0, 3.79, -1.5], hatch, [0, 0, 0], 6), 1.4);
  for (let i = 0; i < 5; i++) bx(0.9, 0.1, 0.08, DARKSTEEL, [0, 3.62, -2.3 - i * 0.16]); // cooling fins
  // cargo cables
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.45, 1.95, 1.4], [s * 0.5, 1.6, 1.2], [s * 0.4, 2.0, 0.95]]), {
      radius: 0.035, color: TRIM, bone: chassis, sides: 6,
    });
  }
  turret("Pod", 0, 3.6, -3.1, false);

  // ---------- rear
  bx(2.4, 0.4, 0.3, ARMOR, [0, 0.95, -4.75]);
  plane(2.2, 0.3, HAZARD, [0, 0.95, -4.91], [0, 0, -1]);
  bx(2.0, 0.5, 0.15, ARMOR, [0, 1.35, -4.5]);
  for (const s of [1, -1]) {
    glow(bx(0.45, 0.14, 0.05, RED, [s * 0.75, 1.38, -4.6]));
    glow(bx(0.2, 0.08, 0.05, AMBER, [s * 0.3, 1.38, -4.6]));
    cy(0.1, 0.25, STEEL, [s * 0.95, 0.65, -4.5], chassis, [90, 0, 0], 6); // tow hook
  }

  return b.root;
}
