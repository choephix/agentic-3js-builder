import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

const OLIVE = "#4f5a3a";
const OLIVE_D = "#3a4429";
const DARK = "#23262b";
const STEEL = "#8b929c";
const TIRE = "#17181a";
const HAZ = "#e8b923";
const CYAN = "#58f0ff";

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const rand = rng(5);

  const hull = paint((p, n) => {
    const base = mix(OLIVE_D, OLIVE, smoothstep(-0.3, 0.8, n.y));
    const wear = noise(p, 0.25, 3);
    return mix(base, "#6b6f55", smoothstep(0.62, 0.8, wear) * 0.6);
  });
  const steel = paint((p, n) => mix("#5d636c", STEEL, smoothstep(0, 1, n.y) * 0.6 + noise(p, 0.1, 2) * 0.3));

  const star = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e8e8e0"/><path d="M32 8 L38 26 L57 26 L42 38 L48 56 L32 45 L16 56 L22 38 L7 26 L26 26Z" fill="#23262b"/></svg>`,
    { size: 64 },
  );
  const stripe = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8b923"/><path d="M0 16 L16 0 L28 0 L12 16Z M32 16 L48 0 L60 0 L44 16Z" fill="#23262b"/></svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 6 L60 56 L4 56Z" fill="#e8b923" stroke="#23262b" stroke-width="5"/><rect x="29" y="22" width="6" height="20" fill="#23262b"/><rect x="29" y="46" width="6" height="6" fill="#23262b"/></svg>`,
    { size: 96 },
  );

  const root = b.joint("root", { at: [0, 0.75, 0] });
  const chassis = b.joint("chassis", { parent: root, at: [0, 0.8, 0], dir: [0, 0, 1] });

  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any = chassis, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });

  // Frame and hull
  box(2.4, 0.35, 8.6, DARK, [0, 0.62, 0]);
  b.frustumBox([0, 1.0, -4.0], [0, 1.0, 4.2], [2.8, 0.8], [2.6, 0.8], { bone: chassis, color: hull });
  // sloped glacis
  b.extrude(
    [[0, 0], [2.6, 0], [2.6, 0.5], [0, 0.9]],
    { at: [-1.3, 1.4, 4.2], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: hull, bone: chassis },
  );
  b.part(new THREE.BoxGeometry(2.6, 0.12, 1.3), hull, { bone: chassis, at: [0, 1.8, 4.55], rotation: [-30, 0, 0] });

  // Cab
  box(2.5, 1.2, 2.0, hull, [0, 1.95, 3.3]);
  b.part(new THREE.BoxGeometry(2.3, 0.1, 1.9), OLIVE, { bone: chassis, at: [0, 2.58, 3.3] });
  const glass = b.part(new THREE.BoxGeometry(2.2, 0.5, 0.08), "#2a8fa8", {
    bone: chassis, at: [0, 2.05, 4.32], rotation: [-20, 0, 0],
  });
  glow(glass, 0.5);
  for (const s of [1, -1]) {
    box(0.08, 0.5, 1.2, "#2a8fa8", [s * 1.27, 2.05, 3.3]);
    box(0.15, 0.25, 0.1, HAZ, [s * 1.0, 1.3, 4.62]);
    glow(b.part(new THREE.BoxGeometry(0.3, 0.14, 0.08), "#fff3c0", { bone: chassis, at: [s * 0.95, 1.55, 4.55] }), 1.5);
  }

  // Rear deck armour plates
  for (let i = 0; i < 4; i++) {
    box(2.6, 0.18, 1.2, hull, [0, 1.5 + 0.0, -3.2 + i * 1.3], chassis);
  }
  // Mount ring
  b.lathe([[0, 0], [1.3, 0], [1.3, 0.2], [1.1, 0.25], [0, 0.25]], {
    at: [0, 1.75, -0.8], bone: chassis, color: steel,
  });

  // Turret / gun cradle (rotating)
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.05, -0.8], dir: [0, 0, 1] });
  box(2.2, 0.8, 2.6, hull, [0, 2.45, -0.9], turret);
  b.frustumBox([0, 2.45, 0.4], [0, 2.45, 1.6], [2.0, 0.7], [1.5, 0.5], { bone: turret, color: OLIVE });
  for (const s of [1, -1]) {
    box(0.5, 1.1, 2.6, DARK, [s * 1.2, 2.9, -0.9], turret);
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 8), STEEL, {
      bone: turret, at: [s * 1.2, 3.1, 0.2], dir: [1, 0, 0],
    });
  }
  // Gun elevation
  const gun = b.joint("gun", { parent: turret, at: [0, 3.1, 0.2], dir: [0, 0.18, 1] });
  // twin rails
  for (const s of [1, -1]) {
    b.rod([s * 0.34, 3.1, -0.8], [s * 0.34, 3.7, 6.0], 0.16, steel, { bone: gun, sides: 4 });
    b.rod([s * 0.34, 3.1, 4.5], [s * 0.34, 3.7, 7.8], 0.12, DARK, { bone: gun, sides: 4 });
    glow(b.rod([s * 0.34, 3.35, 2.0], [s * 0.34, 3.55, 5.5], 0.04, CYAN, { bone: gun, sides: 4 }), 2);
  }
  box(1.1, 0.5, 1.6, hull, [0, 3.3, -0.2], gun);
  for (let i = 0; i < 6; i++) {
    const z = 0.6 + i * 1.0;
    b.part(new THREE.BoxGeometry(1.0, 0.1, 0.18), DARK, { bone: gun, at: [0, 3.18 + z * 0.12 , z + 0.4] });
  }
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.TorusGeometry(0.34, 0.07, 5, 8), HAZ, {
      bone: gun, at: [0, 3.15 + i * 0.5 * 0.12, 5.2 + i * 0.9], dir: [0, 0.12, 1], axis: "z",
    });
  }
  // muzzle brake
  box(1.0, 0.45, 0.5, DARK, [0, 3.7, 7.9], gun);

  // Capacitor banks on rear deck
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.CylinderGeometry(0.45, 0.45, 1.5, 8), steel, {
        bone: chassis, at: [s * 0.8, 1.95, -3.1 + i * 1.1], dir: [0, 0, 1],
      });
      glow(b.part(new THREE.CylinderGeometry(0.2, 0.2, 1.6, 6), CYAN, {
        bone: chassis, at: [s * 0.8, 1.95, -3.1 + i * 1.1], dir: [0, 0, 1],
      }), 1.4);
    }
  }

  // Decals
  b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
    bone: chassis, at: [1.33, 1.3, 1.2], dir: [1, 0, 0], axis: "z", texture: star,
  });
  b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
    bone: chassis, at: [-1.33, 1.3, 1.2], dir: [-1, 0, 0], axis: "z", texture: star,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(2.2, 0.55), "#ffffff", {
      bone: chassis, at: [s * 1.33, 1.0, -2.2], dir: [s, 0, 0], axis: "z", texture: stripe,
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
      bone: turret, at: [s * 1.46, 2.5, -0.9], dir: [s, 0, 0], axis: "z", texture: warn,
    });
  }
  // Antennas
  for (const s of [1, -1]) {
    b.rod([s * 1.0, 2.6, 2.6], [s * 1.1, 4.0, 2.4], [0.03, 0.015], DARK, { bone: chassis, sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.06, 5, 4), "#ff4040", { bone: chassis, at: [s * 1.1, 4.02, 2.4] }), 2);
  }

  // Wheels: three axles each side
  const wheelZ = [3.2, 0.2, -3.0];
  const R = 0.75;
  wheelZ.forEach((z, i) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hub = b.joint(`wheel${side}${i + 1}`, {
        parent: root, at: [s * 1.65, R, z], dir: [s, 0, 0], group: "wheels",
      });
      b.part(new THREE.CylinderGeometry(R, R, 0.7, 12), TIRE, { bone: hub, at: [s * 1.65, R, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.74, 8), steel, { bone: hub, at: [s * 1.65, R, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 6), HAZ, { bone: hub, at: [s * 1.65, R, z], dir: [1, 0, 0] });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.76, 0.12, 0.2), TIRE, {
          bone: hub, at: [s * 1.65, R + Math.sin(a) * 0.7, z + Math.cos(a) * 0.7],
          rotation: [(-a * 180) / Math.PI, 0, 0],
        });
      }
    }
    box(3.0, 0.14, 0.2, DARK, [0, 0.95, z], root);
    // fenders
    for (const s of [1, -1]) box(0.9, 0.1, 1.6, OLIVE_D, [s * 1.75, 1.62, z], chassis);
  });

  // Stabiliser legs
  const legPts: [number, number][] = [[1, 3.4], [-1, 3.4], [1, -3.8], [-1, -3.8]];
  legPts.forEach(([s, z], i) => {
    const name = `${s > 0 ? "L" : "R"}${z > 0 ? "F" : "B"}`;
    const top = [s * 1.5, 1.3, z];
    const knee = [s * 2.6, 1.0, z + (z > 0 ? 0.2 : -0.2)];
    const foot = [s * 3.1, 0.12, z + (z > 0 ? 0.3 : -0.3)];
    const ch = b.chain(`leg${name}`, [top, knee, foot], {
      parent: chassis, names: [`hip${name}`, `knee${name}`, `ankle${name}`], role: "leg",
    });
    b.rod(top, knee, 0.2, hull, { bone: ch.joints[0], sides: 6 });
    b.rod(knee, foot, 0.16, steel, { bone: ch.joints[1], sides: 6 });
    b.part(new THREE.SphereGeometry(0.26, 6, 5), DARK, { bone: ch.joints[0], at: knee });
    // hydraulic piston
    b.rod([s * 1.5, 1.9, z], [s * 2.5, 0.8, z], 0.07, STEEL, { bone: ch.joints[0], sides: 5 });
    b.part(new THREE.CylinderGeometry(0.6, 0.7, 0.14, 8), DARK, { bone: ch.tip ?? ch.joints[1], at: [foot[0], 0.07, foot[2]] });
    b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 8), HAZ, { bone: ch.tip ?? ch.joints[1], at: [foot[0], 0.15, foot[2]] });
  });

  return b.root;
}
