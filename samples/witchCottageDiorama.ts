import * as THREE from "three";

export const meta = {
  name: "Witch's Cottage",
  description:
    "A whimsical tabletop witch's cottage diorama with a sagging thatched roof, glowing windows, bubbling cauldron, herb garden, pond, twisted trees, cat, broom, lanterns, stone path, and picket fence.",
  builtBy: "GPT-6 Astra",
};

const palette = {
  soil: "#38512f",
  soilEdge: "#253623",
  wood: "#5a3827",
  woodLight: "#8a5b37",
  woodDark: "#302119",
  thatch: "#b58c4a",
  thatchLight: "#d3ae5d",
  stone: "#6f7470",
  stoneLight: "#989589",
  roofDark: "#554331",
  glass: "#ffd978",
  glassHot: "#fff0a3",
  iron: "#242529",
  ironEdge: "#4b4b45",
  copper: "#ad643a",
  leaf: "#3d6b3c",
  leafDark: "#24472f",
  leafLight: "#71904b",
  mushroom: "#c96b52",
  mushroomPale: "#ecd2a0",
  water: "#397f87",
  waterLight: "#67b9ae",
  lily: "#75a657",
  fire: "#f47b32",
  fireHot: "#ffd85a",
  smoke: "#6e7d77",
  paper: "#d8ba76",
  red: "#a63d37",
  black: "#16181a",
};

type MatOptions = ConstructorParameters<typeof THREE.MeshStandardMaterial>[0];
const materials = new Map<string, THREE.MeshStandardMaterial>();
function material(color: string, options: MatOptions = {}) {
  const key = `${color}|${options.emissive ?? ""}|${options.emissiveIntensity ?? ""}|${options.transparent ?? false}`;
  let m = materials.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.04, ...options });
    materials.set(key, m);
  }
  return m;
}

function mesh(root: THREE.Group, geometry: THREE.BufferGeometry, color: string, at: [number, number, number], options: MatOptions = {}) {
  const item = new THREE.Mesh(geometry, material(color, options));
  item.position.set(...at);
  root.add(item);
  return item;
}

function box(root: THREE.Group, size: [number, number, number], color: string, at: [number, number, number], rotation: [number, number, number] = [0, 0, 0], options: MatOptions = {}) {
  const item = mesh(root, new THREE.BoxGeometry(...size), color, at, options);
  item.rotation.set(...rotation);
  return item;
}

function cylinder(root: THREE.Group, radius: number, height: number, color: string, at: [number, number, number], segments = 10, rotation: [number, number, number] = [0, 0, 0], options: MatOptions = {}) {
  const item = mesh(root, new THREE.CylinderGeometry(radius, radius * 1.04, height, segments), color, at, options);
  item.rotation.set(...rotation);
  return item;
}

function cone(root: THREE.Group, radius: number, height: number, color: string, at: [number, number, number], segments = 8, rotation: [number, number, number] = [0, 0, 0]) {
  const item = mesh(root, new THREE.ConeGeometry(radius, height, segments), color, at);
  item.rotation.set(...rotation);
  return item;
}

function sphere(root: THREE.Group, radius: number, color: string, at: [number, number, number], scale: [number, number, number] = [1, 1, 1], segments = 10, options: MatOptions = {}) {
  const item = mesh(root, new THREE.SphereGeometry(radius, segments, Math.max(5, Math.floor(segments * 0.7))), color, at, options);
  item.scale.set(...scale);
  return item;
}

function rod(root: THREE.Group, a: [number, number, number], b: [number, number, number], radius: number, color: string, segments = 8) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const length = Math.hypot(dx, dy, dz);
  const item = cylinder(root, radius, length, color, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], segments);
  item.rotation.z = Math.atan2(dx, dy);
  item.rotation.x = -Math.atan2(dz, Math.hypot(dx, dy));
  return item;
}

function torus(root: THREE.Group, major: number, minor: number, color: string, at: [number, number, number], rotation: [number, number, number] = [0, 0, 0], segments = 12) {
  const item = mesh(root, new THREE.TorusGeometry(major, minor, 6, segments), color, at);
  item.rotation.set(...rotation);
  return item;
}

function addTree(root: THREE.Group, x: number, z: number, scale: number, lean: number) {
  const y0 = 0.13;
  const trunk = cylinder(root, 0.075 * scale, 0.82 * scale, palette.woodDark, [x, y0 + 0.41 * scale, z], 7, [0, 0, lean]);
  trunk.scale.x = 1.1;
  rod(root, [x, y0 + 0.4 * scale, z], [x + 0.18 * scale, y0 + 0.92 * scale, z + 0.02], 0.035 * scale, palette.woodDark, 6);
  rod(root, [x, y0 + 0.56 * scale, z], [x - 0.19 * scale, y0 + 0.78 * scale, z - 0.03], 0.032 * scale, palette.woodDark, 6);
  sphere(root, 0.22 * scale, palette.leafDark, [x - 0.12 * scale, y0 + 0.93 * scale, z], [1.1, 0.9, 1], 8);
  sphere(root, 0.2 * scale, palette.leaf, [x + 0.1 * scale, y0 + 1.08 * scale, z + 0.02], [1.15, 1, 0.9], 8);
  sphere(root, 0.15 * scale, palette.leafLight, [x - 0.02 * scale, y0 + 1.23 * scale, z + 0.04], [1.1, 0.8, 0.9], 7);
  cone(root, 0.11 * scale, 0.28 * scale, palette.leafDark, [x + 0.22 * scale, y0 + 0.9 * scale, z + 0.06], 7, [0.1, 0, -0.4]);
}

function addMushroom(root: THREE.Group, x: number, z: number, scale: number, cap: string = palette.mushroom) {
  cylinder(root, 0.025 * scale, 0.09 * scale, palette.mushroomPale, [x, 0.2 * scale, z], 7);
  sphere(root, 0.09 * scale, cap, [x, 0.27 * scale, z], [1.2, 0.55, 1.0], 8);
  sphere(root, 0.014 * scale, palette.mushroomPale, [x - 0.03 * scale, 0.3 * scale, z + 0.04 * scale], [1, 0.5, 1], 6);
}

function addLantern(root: THREE.Group, x: number, y: number, z: number, scale = 1) {
  box(root, [0.13 * scale, 0.025 * scale, 0.11 * scale], palette.iron, [x, y, z]);
  box(root, [0.09 * scale, 0.15 * scale, 0.07 * scale], palette.glass, [x, y + 0.085 * scale, z]);
  for (const dx of [-0.052, 0.052]) for (const dz of [-0.042, 0.042]) box(root, [0.014 * scale, 0.17 * scale, 0.014 * scale], palette.iron, [x + dx * scale, y + 0.085 * scale, z + dz * scale]);
  box(root, [0.13 * scale, 0.022 * scale, 0.11 * scale], palette.iron, [x, y + 0.175 * scale, z]);
  cone(root, 0.082 * scale, 0.065 * scale, palette.iron, [x, y + 0.22 * scale, z], 4, [0, Math.PI / 4, 0]);
  torus(root, 0.028 * scale, 0.006 * scale, palette.iron, [x, y + 0.272 * scale, z], [Math.PI / 2, 0, 0], 12);
}

export default function build() {
  const root = new THREE.Group();
  root.name = "witchCottageDiorama";

  // Octagonal earth plinth: 1.42 m across, with a chunky dark edge.
  cylinder(root, 0.72, 0.12, palette.soilEdge, [0, 0.06, 0], 10);
  cylinder(root, 0.67, 0.055, palette.soil, [0, 0.147, 0], 10);
  torus(root, 0.685, 0.025, palette.woodDark, [0, 0.125, 0], [Math.PI / 2, 0, 0], 10);

  // Crooked cottage walls and heavy timber frame.
  const cottage = box(root, [0.74, 0.66, 0.78], palette.wood, [-0.12, 0.52, -0.02], [0, -0.035, -0.018]);
  cottage.scale.set(1, 1, 1);
  box(root, [0.8, 0.1, 0.09], palette.woodLight, [-0.12, 0.27, 0.4], [0, -0.035, -0.018]);
  box(root, [0.8, 0.075, 0.08], palette.woodDark, [-0.12, 0.78, 0.4], [0, -0.035, -0.018]);
  for (const x of [-0.45, 0.2]) box(root, [0.07, 0.64, 0.075], palette.woodDark, [x, 0.53, 0.405], [0, -0.035, -0.018]);
  box(root, [0.075, 0.68, 0.07], palette.woodDark, [-0.12, 0.53, 0.408], [0, -0.035, -0.32]);

  // Front door, glowing windows, and a crooked little lintel.
  box(root, [0.2, 0.39, 0.035], palette.woodDark, [-0.13, 0.42, 0.414], [0, 0, -0.04]);
  box(root, [0.16, 0.34, 0.018], palette.wood, [-0.13, 0.43, 0.435], [0, 0, -0.04]);
  for (const y of [0.31, 0.48, 0.65]) box(root, [0.17, 0.026, 0.024], palette.woodLight, [-0.13, y, 0.45], [0, 0, -0.04]);
  sphere(root, 0.018, palette.copper, [0.0, 0.43, 0.46], [1, 1, 0.5], 7);
  box(root, [0.19, 0.17, 0.028], palette.woodDark, [-0.41, 0.62, 0.418], [0, 0, -0.03]);
  box(root, [0.14, 0.12, 0.02], palette.glass, [-0.41, 0.62, 0.435], [0, 0, -0.03]);
  box(root, [0.19, 0.17, 0.028], palette.woodDark, [0.16, 0.61, 0.418], [0, 0, 0.03]);
  box(root, [0.14, 0.12, 0.02], palette.glass, [0.16, 0.61, 0.435], [0, 0, 0.03]);
  box(root, [0.48, 0.07, 0.07], palette.woodLight, [-0.13, 0.86, 0.41], [0, 0, -0.06]);

  // Two roof planes sag away from a crooked ridge, plus visible thatch ends.
  box(root, [0.58, 0.11, 0.87], palette.thatch, [-0.32, 1.1, -0.02], [0, 0, -0.55]);
  box(root, [0.58, 0.11, 0.87], palette.thatch, [0.08, 1.14, -0.02], [0, 0, 0.62]);
  box(root, [0.12, 0.12, 0.91], palette.thatchLight, [-0.13, 1.36, -0.02], [0, 0, -0.04]);
  for (const x of [-0.58, -0.43, -0.28, -0.13, 0.02, 0.17, 0.32]) {
    const sag = 1.025 + 0.055 * Math.cos((x + 0.13) * 7);
    cone(root, 0.032, 0.15, palette.thatchLight, [x, sag, 0.415], 5, [0.75, 0, 0]);
  }

  // Leaning chimney and cap.
  cylinder(root, 0.085, 0.42, palette.red, [0.2, 1.5, -0.12], 8, [0, 0, -0.14]);
  box(root, [0.2, 0.055, 0.18], palette.iron, [0.23, 1.72, -0.12], [0, 0, -0.14]);
  sphere(root, 0.05, palette.smoke, [0.21, 1.84, -0.12], [1, 1.2, 1], 8);
  sphere(root, 0.075, palette.smoke, [0.24, 1.97, -0.1], [1, 0.9, 1], 8);
  sphere(root, 0.045, palette.smoke, [0.16, 2.08, -0.08], [1, 1.1, 1], 7);

  // Winding stepping-stone path to the threshold.
  const stones: [number, number, number, number][] = [
    [-0.55, 0.18, 0.36, 0.11], [-0.4, 0.18, 0.29, 0.11], [-0.26, 0.18, 0.34, 0.105], [-0.1, 0.18, 0.29, 0.11],
    [-0.02, 0.18, 0.38, 0.1], [-0.1, 0.18, 0.46, 0.09],
  ];
  for (const [x, y, z, r] of stones) cylinder(root, r, 0.035, palette.stoneLight, [x, y, z], 7);

  // Cauldron, fire ring, flames, and three curling smoke puffs.
  for (const [x, z] of [[-0.47, 0.28], [-0.33, 0.25], [-0.4, 0.16]] as [number, number][]) sphere(root, 0.075, palette.stone, [x, 0.22, z], [1, 0.65, 1], 7);
  torus(root, 0.12, 0.018, palette.ironEdge, [-0.4, 0.27, 0.23], [0, 0, 0], 12);
  cylinder(root, 0.13, 0.1, palette.iron, [-0.4, 0.35, 0.23], 12);
  sphere(root, 0.11, palette.iron, [-0.4, 0.4, 0.23], [1, 0.52, 1], 10);
  torus(root, 0.115, 0.014, palette.copper, [-0.4, 0.44, 0.23], [0, 0, 0], 12);
  for (const dx of [-0.075, 0.075]) rod(root, [-0.4 + dx, 0.18, 0.23], [-0.4 + dx * 0.75, 0.3, 0.23], 0.012, palette.iron, 6);
  sphere(root, 0.075, palette.fire, [-0.4, 0.28, 0.23], [1, 0.5, 1], 8);
  cone(root, 0.075, 0.24, palette.fire, [-0.4, 0.24, 0.23], 6);
  cone(root, 0.04, 0.18, palette.fireHot, [-0.43, 0.27, 0.23], 5, [0, 0, 0.25]);
  cone(root, 0.032, 0.14, palette.fireHot, [-0.36, 0.26, 0.24], 5, [0, 0, -0.3]);
  for (const [x, y, z, s] of [[-0.39, 0.58, 0.23, 1], [-0.34, 0.72, 0.2, 0.72], [-0.42, 0.84, 0.24, 0.5]] as [number, number, number, number][]) sphere(root, 0.06 * s, palette.smoke, [x, y, z], [1, 1.15, 1], 8);

  // Herb garden, labels, and mushrooms beside the cottage.
  box(root, [0.33, 0.07, 0.25], palette.woodLight, [0.38, 0.19, 0.03]);
  for (const x of [0.28, 0.39, 0.5]) {
    for (const z of [-0.02, 0.08]) {
      rod(root, [x, 0.21, z], [x + 0.02, 0.37 + ((x + z) * 0.2), z + 0.015], 0.012, palette.leafDark, 6);
      sphere(root, 0.035, palette.leaf, [x - 0.025, 0.32, z], [1.8, 0.5, 0.7], 7);
      sphere(root, 0.03, palette.leafLight, [x + 0.03, 0.35, z + 0.018], [1.5, 0.5, 0.7], 7);
    }
  }
  box(root, [0.1, 0.055, 0.012], palette.paper, [0.59, 0.37, 0.03], [0, -0.2, 0]);
  rod(root, [0.59, 0.2, 0.03], [0.59, 0.37, 0.03], 0.008, palette.woodDark, 6);
  addMushroom(root, 0.53, 0.2, 0.8, palette.red);
  addMushroom(root, 0.58, 0.28, 0.62, palette.mushroom);
  addMushroom(root, 0.28, 0.29, 0.65, palette.red);

  // Small pond with reeds and lily pads.
  cylinder(root, 0.27, 0.026, palette.water, [0.37, 0.175, 0.37], 12);
  torus(root, 0.26, 0.018, palette.stone, [0.37, 0.19, 0.37], [Math.PI / 2, 0, 0], 12);
  sphere(root, 0.055, palette.lily, [0.29, 0.198, 0.31], [1.5, 0.08, 1], 8);
  sphere(root, 0.045, palette.lily, [0.46, 0.198, 0.42], [1.5, 0.08, 1], 8);
  sphere(root, 0.033, palette.waterLight, [0.4, 0.199, 0.3], [1.8, 0.05, 1], 8);
  for (const x of [0.15, 0.58]) {
    rod(root, [x, 0.2, 0.49], [x + 0.03, 0.42, 0.5], 0.009, palette.leafDark, 6);
    cone(root, 0.025, 0.12, palette.leaf, [x + 0.03, 0.45, 0.5], 5, [0.1, 0, 0.25]);
  }

  // Twisted trees frame the cottage silhouette.
  addTree(root, -0.59, -0.18, 0.78, -0.11);
  addTree(root, 0.58, -0.17, 0.7, 0.13);

  // Picket fence around the front-right garden.
  rod(root, [0.33, 0.29, 0.61], [0.66, 0.29, 0.6], 0.018, palette.woodDark, 6);
  rod(root, [0.33, 0.2, 0.61], [0.66, 0.2, 0.6], 0.018, palette.woodDark, 6);
  for (const x of [0.34, 0.42, 0.5, 0.58, 0.66]) {
    box(root, [0.035, 0.21, 0.035], palette.woodLight, [x, 0.28, 0.6], [0, 0, (x * 10) % 2 ? 0.05 : -0.05]);
    cone(root, 0.027, 0.07, palette.woodLight, [x, 0.42, 0.6], 4, [0, Math.PI / 4, 0]);
  }

  // Broom by the door: crooked handle, bound bristles.
  rod(root, [0.05, 0.24, 0.5], [0.34, 0.92, 0.5], 0.014, palette.woodLight, 7);
  for (let i = 0; i < 5; i++) rod(root, [0.02 + i * 0.022, 0.19, 0.5], [0.08 + i * 0.015, 0.34, 0.5], 0.012, palette.thatch, 5);
  torus(root, 0.034, 0.009, palette.red, [0.07, 0.31, 0.5], [Math.PI / 2, 0, 0], 8);

  // A black cat watches the pond, with an expressive tail and bright eyes.
  sphere(root, 0.105, palette.black, [0.61, 0.27, 0.27], [1.25, 0.75, 1], 9);
  sphere(root, 0.075, palette.black, [0.69, 0.38, 0.28], [1, 1, 0.95], 9);
  cone(root, 0.04, 0.11, palette.black, [0.65, 0.45, 0.26], 4, [0.08, 0, -0.25]);
  cone(root, 0.04, 0.11, palette.black, [0.73, 0.45, 0.3], 4, [-0.08, 0, 0.25]);
  for (const x of [0.67, 0.72]) sphere(root, 0.012, palette.glassHot, [x, 0.39, 0.348], [1, 1, 0.35], 6);
  rod(root, [0.52, 0.3, 0.25], [0.45, 0.48, 0.2], 0.018, palette.black, 7);
  rod(root, [0.45, 0.48, 0.2], [0.51, 0.62, 0.18], 0.015, palette.black, 7);
  for (const x of [0.57, 0.64]) rod(root, [x, 0.2, 0.25], [x, 0.17, 0.32], 0.017, palette.black, 6);

  // Witch's sign and two warm lanterns add story-scale details.
  rod(root, [0.38, 0.2, 0.45], [0.38, 0.78, 0.45], 0.018, palette.woodDark, 7);
  box(root, [0.32, 0.15, 0.035], palette.paper, [0.38, 0.73, 0.45], [0, 0.08, -0.05]);
  box(root, [0.26, 0.018, 0.045], palette.red, [0.38, 0.76, 0.47], [0, 0.08, -0.05]);
  addLantern(root, -0.56, 0.32, 0.43, 0.72);
  addLantern(root, 0.43, 0.52, 0.44, 0.58);

  // Tiny stepping stones and scattered herb leaves finish the front edge.
  for (const [x, z] of [[-0.62, 0.38], [0.04, 0.59], [0.2, 0.56], [0.54, 0.1]] as [number, number][]) {
    sphere(root, 0.035, palette.leafLight, [x, 0.19, z], [1.5, 0.16, 0.8], 7);
  }

  return root;
}
