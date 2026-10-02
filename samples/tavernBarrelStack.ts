import * as THREE from "three";
import { createBuilder } from "../src/builder";

export const meta = {
  name: "Tavern Barrel Stack",
  description: "A chunky Warcraft tavern corner piled with banded barrels, carved crates, and well-loved mugs.",
  style: "Blizzard/Warcraft",
  commit: "9555ebf",
};

const WOOD = "#7a3f24";
const WOOD_LIGHT = "#a96a38";
const WOOD_DARK = "#3b2118";
const IRON = "#2b3038";
const BRASS = "#c48a35";
const RED = "#9e3028";
const CREAM = "#e9c98d";
const ALE = "#d88b2f";
const SHADOW = "#251713";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

type Axis = "x" | "y" | "z";

export default function build() {
  const b = createBuilder({ name: "tavernBarrelStack", detail: 0.85 });
  const root = b.joint("root", { at: [0, 0, 0] });

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: readonly [number, number, number],
    options: { rotation?: readonly [number, number, number]; name?: string; scale?: number | readonly [number, number, number] } = {},
  ) =>
    b.part(geometry, color, {
      bone: root,
      at,
      rotation: options.rotation,
      name: options.name,
      scale: options.scale,
      flat: true,
    });

  const box = (name: string, at: readonly [number, number, number], size: readonly [number, number, number], color: string) =>
    part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, { name });

  const cylinder = (
    name: string,
    at: readonly [number, number, number],
    radius: number,
    height: number,
    color: string,
    axis: Axis = "y",
    segments = 10,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1),
      color,
      at,
      { name, rotation: axis === "y" ? undefined : axis === "z" ? [90, 0, 0] : [0, 0, 90] },
    );

  const rod = (name: string, a: THREE.Vector3, c: THREE.Vector3, radius: number, color: string) =>
    b.rod(a, c, radius, { bone: root, color, name, section: { ngon: 6 } });

  // A heavy timber corner and a low plinth frame the prop group like a tavern set dressing piece.
  box("floorPlinth", [0, 0.055, 0], [2.55, 0.11, 1.7], WOOD_DARK);
  box("floorTop", [0, 0.12, 0], [2.38, 0.045, 1.56], WOOD_LIGHT);
  for (const x of [-1.1, 1.1]) {
    box(`cornerPost${x}`, [x, 1.28, -0.68], [0.15, 2.45, 0.15], WOOD_DARK);
    box(`postCap${x}`, [x, 2.53, -0.68], [0.23, 0.12, 0.23], BRASS);
  }
  for (const y of [0.55, 1.08, 1.61, 2.14]) {
    box(`backPlank${y}`, [0, y, -0.68], [2.12, 0.42, 0.11], WOOD);
    box(`backPlankTrim${y}`, [0, y + 0.2, -0.745], [2.17, 0.035, 0.035], WOOD_DARK);
  }
  box("shelf", [0.55, 1.92, -0.43], [1.0, 0.1, 0.62], WOOD_DARK);
  box("shelfFace", [0.55, 1.87, -0.1], [1.0, 0.12, 0.08], BRASS);

  const axial = (center: THREE.Vector3, axis: Axis, amount: number) =>
    axis === "x" ? center.clone().add(V(amount, 0, 0)) : axis === "y" ? center.clone().add(V(0, amount, 0)) : center.clone().add(V(0, 0, amount));

  const barrel = (name: string, center: readonly [number, number, number], radius: number, length: number, axis: Axis, accent = false) => {
    const c = V(center[0], center[1], center[2]);
    const rotation = axis === "y" ? undefined : axis === "z" ? ([90, 0, 0] as const) : ([0, 0, 90] as const);
    const hoopRotation = axis === "y" ? ([90, 0, 0] as const) : axis === "z" ? undefined : ([0, 90, 0] as const);
    const body = new THREE.CylinderGeometry(radius, radius * 0.94, length, 10, 3);
    part(body, accent ? WOOD_LIGHT : WOOD, center, { name: `${name}Body`, rotation });

    const capRadius = radius * 0.83;
    for (const end of [-1, 1]) {
      const capAt = axial(c, axis, end * (length / 2 + 0.012));
      cylinder(`${name}Cap${end}`, [capAt.x, capAt.y, capAt.z], capRadius, 0.026, WOOD_LIGHT, axis, 10);
      const plugAt = axial(c, axis, end * (length / 2 + 0.031));
      cylinder(`${name}Plug${end}`, [plugAt.x, plugAt.y, plugAt.z], radius * 0.13, 0.035, SHADOW, axis, 8);
    }

    for (const fraction of [-0.36, 0, 0.36]) {
      const hoopAt = axial(c, axis, fraction * length);
      part(new THREE.TorusGeometry(radius * 0.985, 0.026, 6, 12), accent && fraction === 0 ? RED : IRON, [hoopAt.x, hoopAt.y, hoopAt.z], {
        name: `${name}Hoop${fraction}`,
        rotation: hoopRotation,
      });
    }

    const radialA: THREE.Vector3 = axis === "y" ? V(1, 0, 0) : axis === "z" ? V(1, 0, 0) : V(0, 1, 0);
    const radialB: THREE.Vector3 = axis === "y" ? V(0, 0, 1) : axis === "z" ? V(0, 1, 0) : V(0, 0, 1);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const radial = radialA.clone().multiplyScalar(Math.cos(a)).add(radialB.clone().multiplyScalar(Math.sin(a))).multiplyScalar(radius * 0.985);
      rod(`${name}Stave${i}`, axial(c.clone().add(radial), axis, -length * 0.46), axial(c.clone().add(radial), axis, length * 0.46), 0.014, WOOD_DARK);
    }

    if (accent) {
      const badgeAt = axial(c, axis, -length / 2 - 0.044);
      cylinder(`${name}Badge`, [badgeAt.x, badgeAt.y, badgeAt.z], radius * 0.28, 0.018, RED, axis, 8);
      cylinder(`${name}BadgeBoss`, [badgeAt.x, badgeAt.y, badgeAt.z], radius * 0.09, 0.03, BRASS, axis, 8);
    }
  };

  // The lower pair and upper third barrel create a deliberately oversized, readable stack.
  barrel("barrelLeft", [-0.66, 0.56, -0.18], 0.34, 0.86, "y", true);
  barrel("barrelMiddle", [0.02, 0.56, -0.2], 0.34, 0.86, "y", false);
  barrel("barrelTop", [-0.32, 1.42, -0.18], 0.34, 0.82, "y", true);
  barrel("keg", [0.78, 0.53, -0.12], 0.32, 0.9, "z", false);
  barrel("highKeg", [0.68, 1.35, -0.26], 0.27, 0.72, "x", true);
  box("highKegCradleL", [0.42, 1.0, -0.26], [0.12, 0.2, 0.32], WOOD_DARK);
  box("highKegCradleR", [0.94, 1.0, -0.26], [0.12, 0.2, 0.32], WOOD_DARK);

  const crate = (name: string, center: readonly [number, number, number], size: readonly [number, number, number], painted = false) => {
    const [w, h, d] = size;
    const [x, y, z] = center;
    box(`${name}Core`, center, size, WOOD);
    for (const faceZ of [-1, 1]) {
      for (const dy of [-0.25, 0.25]) {
        box(`${name}Slat${faceZ}${dy}`, [x, y + dy * h, z + faceZ * (d / 2 + 0.018)], [w * 0.86, h * 0.1, 0.04], painted && dy > 0 ? RED : WOOD_LIGHT);
      }
    }
    for (const faceX of [-1, 1]) {
      box(`${name}SideSlat${faceX}`, [x + faceX * (w / 2 + 0.018), y, z], [0.04, h * 0.72, d * 0.7], WOOD_DARK);
    }
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        rod(`${name}Corner${sx}${sz}`, V(x + sx * (w * 0.43), y - h * 0.5, z + sz * (d * 0.43)), V(x + sx * (w * 0.43), y + h * 0.5, z + sz * (d * 0.43)), 0.022, BRASS);
      }
    }
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        part(new THREE.SphereGeometry(0.025, 6, 4), BRASS, [x + sx * (w * 0.31), y + sy * (h * 0.24), z + d / 2 + 0.04], { name: `${name}Nail${sx}${sy}` });
      }
    }
  };

  crate("crateLow", [0.98, 0.3, 0.42], [0.58, 0.46, 0.55], true);
  crate("crateSide", [-0.98, 0.29, 0.42], [0.55, 0.44, 0.52], false);
  crate("crateHigh", [0.98, 0.78, 0.39], [0.5, 0.42, 0.48], true);

  const mug = (name: string, at: readonly [number, number, number], color: string, handleSide: 1 | -1 = 1) => {
    const [x, y, z] = at;
    part(new THREE.CylinderGeometry(0.105, 0.115, 0.19, 10, 1, true), color, at, { name: `${name}Cup` });
    part(new THREE.TorusGeometry(0.106, 0.018, 6, 12), BRASS, [x, y + 0.095, z], { name: `${name}Rim`, rotation: [90, 0, 0] });
    cylinder(`${name}Ale`, [x, y + 0.098, z], 0.084, 0.012, ALE, "y", 10);
    const hx = x + handleSide * 0.113;
    rod(`${name}HandleUpper`, V(hx, y + 0.06, z), V(x + handleSide * 0.22, y + 0.04, z), 0.015, BRASS);
    rod(`${name}HandleLower`, V(hx, y - 0.06, z), V(x + handleSide * 0.22, y - 0.04, z), 0.015, BRASS);
    rod(`${name}HandleOuter`, V(x + handleSide * 0.22, y - 0.04, z), V(x + handleSide * 0.22, y + 0.04, z), 0.015, BRASS);
    part(new THREE.BoxGeometry(0.035, 0.13, 0.014), CREAM, [x - 0.04, y + 0.005, z + 0.112], { name: `${name}PaintStripe` });
  };

  mug("mugShelf", [0.38, 2.065, -0.08], CREAM, 1);
  mug("mugBarrel", [0.93, 1.04, 0.4], CREAM, -1);
  mug("mugCrate", [0.97, 1.16, 0.4], RED, 1);

  // A few broad, painted iron details give the otherwise simple primitives a heroic Warcraft silhouette.
  for (const x of [-0.88, 0.88]) {
    box(`postBrace${x}`, [x * 0.75, 1.76, -0.57], [0.48, 0.1, 0.08], RED);
    box(`postBraceBolt${x}`, [x * 0.75, 1.76, -0.625], [0.08, 0.08, 0.025], BRASS);
  }

  return b.root;
}
