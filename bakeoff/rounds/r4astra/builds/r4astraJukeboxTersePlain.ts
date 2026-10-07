import * as THREE from "three";

export const meta = {
  name: "Melody 100 Jukebox",
  description:
    "A vintage arched jukebox with honey-colored illuminated tubes, walnut cabinetry, a visible record changer, printed song cards, and a brass sunburst speaker grille.",
};

export default function createJukebox(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "Melody 100 — vintage jukebox";

  let seed = 73191;
  function random(): number {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }

  function material(
    color: string,
    roughness = 0.5,
    metalness = 0,
    extra: Partial<THREE.MeshStandardMaterialParameters> = {}
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color, roughness, metalness, ...extra,
    });
  }

  const walnut = material("#542a21", 0.46);
  const walnutLight = material("#713d2a", 0.5);
  const walnutDark = material("#301c19", 0.56);
  const wine = material("#672430", 0.33, 0.12);
  const ruby = material("#982e35", 0.28, 0.16);
  const teal = material("#287573", 0.34, 0.18);
  const darkTeal = material("#142f32", 0.42, 0.12);
  const brass = material("#bd8b47", 0.3, 0.75);
  const paleGold = material("#edc779", 0.27, 0.66);
  const agedBrass = material("#765737", 0.49, 0.6);
  const chrome = material("#bac9c6", 0.23, 0.83);
  const cream = material("#f4dfb4", 0.56);
  const black = material("#10191a", 0.56);
  const vinyl = material("#141b1d", 0.3, 0.12);
  const grooves = material("#303c3b", 0.38, 0.2);
  const fabric = material("#292922", 0.97);
  const weave = material("#625c42", 0.88, 0.1);
  const amber = material("#efad47", 0.3, 0.08, {
    emissive: "#ed881f", emissiveIntensity: 0.42,
  });
  const lightCore = material("#ffe4a0", 0.32, 0.03, {
    emissive: "#ffd175", emissiveIntensity: 0.7,
  });
  const redLight = material("#c34a2d", 0.32, 0.1, {
    emissive: "#b72b12", emissiveIntensity: 0.35,
  });
  const glass = material("#83b5b4", 0.16, 0.12, {
    transparent: true, opacity: 0.085, depthWrite: false,
    side: THREE.DoubleSide,
  });
  const reflection = material("#d5e8df", 0.24, 0.05, {
    transparent: true, opacity: 0.23, depthWrite: false,
  });

  const unitBox = new THREE.BoxGeometry(1, 1, 1);

  function mesh(
    geometry: THREE.BufferGeometry,
    mat: THREE.MeshStandardMaterial,
    x: number, y: number, z: number,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(x, y, z);
    m.castShadow = !mat.transparent;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function box(
    w: number, h: number, d: number,
    x: number, y: number, z: number,
    mat: THREE.MeshStandardMaterial,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const m = mesh(unitBox, mat, x, y, z, parent);
    m.scale.set(w, h, d);
    return m;
  }

  function cylinder(
    r: number, h: number,
    x: number, y: number, z: number,
    mat: THREE.MeshStandardMaterial,
    segments = 16,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    return mesh(
      new THREE.CylinderGeometry(r, r, h, segments, 1),
      mat, x, y, z, parent
    );
  }

  function disc(
    r: number, d: number,
    x: number, y: number, z: number,
    mat: THREE.MeshStandardMaterial,
    segments = 32,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const m = cylinder(r, d, x, y, z, mat, segments, parent);
    m.rotation.x = Math.PI / 2;
    return m;
  }

  function torus(
    radius: number, tube: number,
    x: number, y: number, z: number,
    mat: THREE.MeshStandardMaterial,
    arc = Math.PI * 2,
    parent: THREE.Object3D = root,
    segments = 48
  ): THREE.Mesh {
    return mesh(
      new THREE.TorusGeometry(radius, tube, 8, segments, arc),
      mat, x, y, z, parent
    );
  }

  function bar(
    a: THREE.Vector3, b: THREE.Vector3,
    width: number, depth: number,
    mat: THREE.MeshStandardMaterial,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const delta = b.clone().sub(a);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const m = box(width, delta.length(), depth, mid.x, mid.y, mid.z, mat, parent);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return m;
  }

  function rod(
    a: THREE.Vector3, b: THREE.Vector3,
    radius: number, mat: THREE.MeshStandardMaterial,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const delta = b.clone().sub(a);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const m = cylinder(radius, delta.length(), mid.x, mid.y, mid.z, mat, 10, parent);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return m;
  }

  // A rectangular slab capped with a faceted half-cylinder.
  function archedSlab(
    width: number, bottom: number, spring: number,
    depth: number, z: number,
    mat: THREE.MeshStandardMaterial,
    parent: THREE.Object3D = root
  ): void {
    box(width, spring - bottom, depth, 0, (bottom + spring) / 2, z, mat, parent);
    const top = mesh(
      new THREE.CylinderGeometry(
        width / 2, width / 2, depth, 40, 1, false, Math.PI / 2, Math.PI
      ),
      mat, 0, spring, z, parent
    );
    top.rotation.x = Math.PI / 2;
  }

  function horseshoe(
    radius: number, tube: number, bottom: number,
    spring: number, z: number, mat: THREE.MeshStandardMaterial
  ): void {
    torus(radius, tube, 0, spring, z, mat, Math.PI, root, 40);
    for (const side of [-1, 1]) {
      cylinder(tube, spring - bottom, side * radius, (spring + bottom) / 2, z, mat, 12);
    }
  }

  function screw(
    x: number, y: number, z: number,
    parent: THREE.Object3D = root
  ): void {
    disc(0.0044, 0.002, x, y, z, chrome, 10, parent);
    const slot = box(0.0054, 0.0009, 0.001, x, y, z + 0.0015, agedBrass, parent);
    slot.rotation.z = 0.4;
  }

  // Solid cabinetry and feet.
  for (const x of [-0.398, 0.398]) {
    for (const z of [-0.242, 0.238]) {
      cylinder(0.063, 0.048, x, 0.024, z, black, 12);
      cylinder(0.05, 0.025, x, 0.052, z, walnutDark, 12);
    }
  }
  box(1.005, 0.063, 0.649, 0, 0.067, -0.003, walnutDark);
  box(1.086, 0.087, 0.712, 0, 0.117, 0.006, walnut);
  box(1.102, 0.018, 0.726, 0, 0.158, 0.006, brass);
  box(1.074, 0.015, 0.718, 0, 0.081, 0.006, agedBrass);
  box(1.049, 0.009, 0.017, 0, 0.107, 0.369, walnutDark);
  box(1.049, 0.008, 0.017, 0, 0.137, 0.369, paleGold);

  archedSlab(1.07, 0.16, 1.055, 0.61, -0.025, walnut);
  archedSlab(1.036, 0.165, 1.055, 0.029, 0.286, wine);
  archedSlab(0.784, 0.18, 1.055, 0.03, 0.301, darkTeal);

  // Cabinet side doors, recessed ventilation and restrained wood grain.
  for (const side of [-1, 1]) {
    box(0.018, 0.797, 0.47, side * 0.537, 0.614, -0.03, walnutDark);
    box(0.011, 0.747, 0.423, side * 0.549, 0.614, -0.03, walnutLight);

    for (let i = 0; i < 12; i++) {
      const z = -0.224 + i * 0.033 + random() * 0.006;
      const height = 0.48 + random() * 0.2;
      box(
        0.0015, height, 0.0015 + random() * 0.002,
        side * 0.555, 0.605 + (random() - 0.5) * 0.055, z,
        i % 3 === 0 ? walnut : walnutDark
      );
    }
    for (const z of [-0.244, 0.184]) {
      box(0.014, 0.754, 0.008, side * 0.554, 0.614, z, agedBrass);
    }
    for (const y of [0.236, 0.992]) {
      box(0.014, 0.008, 0.435, side * 0.554, y, -0.03, brass);
    }

    box(0.012, 0.256, 0.284, side * 0.56, 0.645, -0.035, black);
    for (let i = 0; i < 8; i++) {
      box(0.022, 0.016, 0.296, side * 0.57, 0.535 + i * 0.031, -0.035, walnut);
      box(0.004, 0.003, 0.27, side * 0.584, 0.54 + i * 0.031, -0.035, walnutLight);
    }
    for (const y of [0.323, 0.901]) {
      box(0.024, 0.047, 0.031, side * 0.562, y, 0.166, brass);
      const hinge = cylinder(0.010, 0.055, side * 0.572, y, 0.166, agedBrass, 10);
      hinge.name = "Door hinge";
    }
    const lock = cylinder(0.015, 0.011, side * 0.566, 0.427, -0.164, brass, 12);
    lock.rotation.z = Math.PI / 2;
    box(0.006, 0.016, 0.003, side * 0.573, 0.427, -0.164, black);
  }

  // Rear service panel is finished too.
  archedSlab(0.991, 0.185, 1.055, 0.016, -0.338, walnutDark);
  box(0.735, 0.626, 0.009, 0, 0.611, -0.351, walnut);
  for (let i = 0; i < 9; i++) {
    box(0.504, 0.013, 0.007, 0, 0.451 + i * 0.037, -0.359, black);
  }
  box(0.173, 0.061, 0.008, 0, 0.827, -0.361, agedBrass);
  box(0.139, 0.032, 0.01, 0, 0.827, -0.367, black);
  for (const x of [-0.347, 0.347]) {
    for (const y of [0.318, 0.9]) {
      disc(0.006, 0.004, x, y, -0.359, agedBrass, 10);
    }
  }
  horseshoe(0.511, 0.008, 0.178, 1.055, -0.348, agedBrass);

  // The defining illuminated horseshoe.
  horseshoe(0.517, 0.016, 0.183, 1.055, 0.301, brass);
  horseshoe(0.403, 0.010, 0.211, 1.055, 0.355, paleGold);
  torus(0.465, 0.052, 0, 1.055, 0.324, amber, Math.PI, root, 48);
  torus(0.465, 0.014, 0, 1.055, 0.362, lightCore, Math.PI, root, 48);

  for (const side of [-1, 1]) {
    const x = side * 0.465;
    box(0.145, 0.033, 0.15, x, 0.184, 0.31, brass);
    box(0.128, 0.071, 0.128, x, 0.228, 0.319, wine);
    box(0.115, 0.013, 0.14, x, 0.26, 0.32, paleGold);

    cylinder(0.052, 0.159, x, 0.3515, 0.324, redLight, 12);
    cylinder(0.052, 0.624, x, 0.743, 0.324, amber, 12);
    cylinder(0.014, 0.607, x, 0.7515, 0.362, lightCore, 10);
    cylinder(0.009, 0.124, x, 0.351, 0.373, ruby, 8);

    for (const y of [0.276, 0.432, 0.487, 0.786, 1.045]) {
      cylinder(0.0558, 0.011, x, y, 0.324, brass, 16);
      cylinder(0.0562, 0.003, x, y + 0.006, 0.324, paleGold, 16);
    }
    box(0.074, 0.026, 0.009, x, 0.221, 0.389, agedBrass);
    box(0.047, 0.004, 0.01, x, 0.221, 0.395, paleGold);
  }

  for (let i = 1; i <= 7; i++) {
    const angle = (i * Math.PI) / 8;
    const band = torus(
      0.054, 0.004,
      Math.cos(angle) * 0.465,
      1.055 + Math.sin(angle) * 0.465,
      0.324, brass, Math.PI * 2, root, 16
    );
    band.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0)
    );
  }
  for (const offset of [-0.017, 0.017]) {
    const angle = Math.PI / 2 + offset;
    const band = torus(
      0.0545, 0.0025,
      Math.cos(angle) * 0.465,
      1.055 + Math.sin(angle) * 0.465,
      0.324, paleGold, Math.PI * 2, root, 16
    );
    band.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0)
    );
  }

  // Woven speaker cloth under a substantial art-deco fan grille.
  const speakerRadius = 0.323;
  const speakerSpring = 0.326;
  const speakerBottom = 0.189;
  archedSlab(0.668, 0.18, speakerSpring, 0.022, 0.326, agedBrass);
  archedSlab(speakerRadius * 2, speakerBottom, speakerSpring, 0.01, 0.341, fabric);

  for (let i = -24; i <= 24; i++) {
    const x = i * 0.0128;
    const top = speakerSpring + Math.sqrt(speakerRadius ** 2 - x * x) - 0.005;
    box(0.0018, top - speakerBottom, 0.002, x, (top + speakerBottom) / 2, 0.348, weave);
  }
  for (let y = 0.201; y < 0.646; y += 0.0127) {
    const dy = Math.max(0, y - speakerSpring);
    const halfWidth = Math.sqrt(Math.max(0, speakerRadius ** 2 - dy * dy)) - 0.005;
    if (halfWidth > 0) box(halfWidth * 2, 0.0015, 0.002, 0, y, 0.350, agedBrass);
  }

  horseshoe(0.33, 0.011, 0.19, speakerSpring, 0.357, brass);
  box(0.672, 0.019, 0.018, 0, 0.188, 0.356, paleGold);

  const originY = 0.221;
  for (let i = -6; i <= 6; i++) {
    const angle = (i * 13 * Math.PI) / 180;
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const offset = originY - speakerSpring;
    let distance = -offset * c + Math.sqrt(speakerRadius ** 2 - offset ** 2 * s * s);
    if (originY + distance * c < speakerSpring) {
      distance = speakerRadius / Math.abs(s);
    }
    distance -= 0.009;
    const start = new THREE.Vector3(s * 0.033, originY + c * 0.033, 0.367);
    const end = new THREE.Vector3(s * distance, originY + c * distance, 0.367);
    bar(start, end, i === 0 ? 0.016 : 0.0105, 0.012, paleGold);
  }

  disc(0.064, 0.016, 0, 0.252, 0.377, brass, 24);
  disc(0.052, 0.011, 0, 0.252, 0.389, ruby, 24);
  torus(0.047, 0.0028, 0, 0.252, 0.396, paleGold, Math.PI * 2, root, 24);
  const diamond = box(0.039, 0.039, 0.006, 0, 0.252, 0.399, teal);
  diamond.rotation.z = Math.PI / 4;

  // Small dimensional, geometric lettering.
  const strokes: Record<string, number[][][]> = {
    M: [[[0, 0], [0, 1], [0.5, 0.48], [1, 1], [1, 0]]],
    E: [[[1, 1], [0, 1], [0, 0], [1, 0]], [[0, 0.5], [0.78, 0.5]]],
    L: [[[0, 1], [0, 0], [1, 0]]],
    O: [[[0.2, 0], [0.8, 0], [1, 0.2], [1, 0.8], [0.8, 1], [0.2, 1], [0, 0.8], [0, 0.2], [0.2, 0]]],
    D: [[[0, 0], [0, 1], [0.65, 1], [1, 0.75], [1, 0.25], [0.65, 0], [0, 0]]],
    Y: [[[0, 1], [0.5, 0.53], [1, 1]], [[0.5, 0.53], [0.5, 0]]],
    "4": [[[0.8, 0], [0.8, 1]], [[0.1, 1], [0, 0.43], [1, 0.43]]],
    "5": [[[1, 1], [0, 1], [0, 0.55], [0.8, 0.55], [1, 0.4], [1, 0.1], [0.8, 0], [0, 0]]],
  };

  function lettering(
    text: string, x: number, y: number, z: number,
    w: number, h: number, gap: number, weight: number,
    mat: THREE.MeshStandardMaterial,
    parent: THREE.Object3D = root
  ): void {
    let offset = 0;
    for (const ch of text) {
      for (const path of strokes[ch] || []) {
        for (let i = 1; i < path.length; i++) {
          bar(
            new THREE.Vector3(x + offset + path[i - 1][0] * w, y + path[i - 1][1] * h, z),
            new THREE.Vector3(x + offset + path[i][0] * w, y + path[i][1] * h, z),
            weight, weight * 0.8, mat, parent
          );
        }
      }
      offset += w + gap;
    }
  }
  lettering("M", -0.011, 0.24, 0.405, 0.022, 0.025, 0, 0.0025, cream);

  // Upper display: fan marks, record platter, label and tonearm.
  for (let i = 0; i <= 12; i++) {
    const a = ((17 + i * (146 / 12)) * Math.PI) / 180;
    const r1 = i % 3 === 0 ? 0.310 : 0.327;
    const r2 = 0.349;
    bar(
      new THREE.Vector3(Math.cos(a) * r1, 1.055 + Math.sin(a) * r1, 0.321),
      new THREE.Vector3(Math.cos(a) * r2, 1.055 + Math.sin(a) * r2, 0.321),
      i % 3 === 0 ? 0.006 : 0.003, 0.004, agedBrass
    );
  }
  box(0.638, 0.023, 0.048, 0, 1.002, 0.326, walnutDark);
  box(0.63, 0.008, 0.027, 0, 1.013, 0.352, chrome);

  const record = new THREE.Group();
  record.name = "Visible 45 rpm record and platter";
  record.position.set(-0.019, 1.175, 0.333);
  record.rotation.x = -0.1;
  root.add(record);
  disc(0.175, 0.018, 0, 0, 0, agedBrass, 48, record);
  torus(0.17, 0.004, 0, 0, 0.011, chrome, Math.PI * 2, record, 48);
  disc(0.164, 0.01, 0, 0, 0.017, vinyl, 48, record);
  for (let i = 0; i < 9; i++) {
    torus(0.07 + i * 0.0103, 0.00085, 0, 0, 0.0227, grooves, Math.PI * 2, record, 48);
  }
  for (const start of [0.46, 3.62]) {
    const glint = torus(0.144, 0.002, 0, 0, 0.024, grooves, 0.44, record, 18);
    glint.rotation.z = start;
  }
  disc(0.058, 0.004, 0, 0, 0.025, ruby, 32, record);
  disc(0.049, 0.005, 0, 0, 0.028, cream, 32, record);
  disc(0.022, 0.006, 0, 0, 0.032, teal, 24, record);
  disc(0.008, 0.013, 0, 0, 0.04, chrome, 12, record);
  lettering("45", -0.014, 0.022, 0.032, 0.011, 0.013, 0.006, 0.0013, wine, record);
  for (let i = 0; i < 3; i++) {
    box(0.023 - i * 0.004, 0.001, 0.001, 0, -0.028 - i * 0.004, 0.032, agedBrass, record);
  }

  disc(0.030, 0.02, 0.235, 1.213, 0.334, agedBrass, 20);
  disc(0.021, 0.025, 0.235, 1.213, 0.351, chrome, 20);
  disc(0.009, 0.029, 0.235, 1.213, 0.36, black, 12);
  const armPoints = [
    new THREE.Vector3(0.235, 1.213, 0.367),
    new THREE.Vector3(0.219, 1.247, 0.370),
    new THREE.Vector3(0.174, 1.174, 0.372),
    new THREE.Vector3(0.111, 1.083, 0.375),
  ];
  for (let i = 1; i < armPoints.length; i++) {
    rod(armPoints[i - 1], armPoints[i], 0.006, chrome);
  }
  const pickup = box(0.026, 0.034, 0.018, 0.11, 1.075, 0.376, wine);
  pickup.rotation.z = -0.5;
  const pickupTop = box(0.021, 0.015, 0.005, 0.111, 1.079, 0.389, paleGold);
  pickupTop.rotation.z = -0.5;
  rod(
    new THREE.Vector3(0.251, 1.212, 0.351),
    new THREE.Vector3(0.28, 1.24, 0.357),
    0.003, brass
  );

  // Single-surface clear glazing; slim reflections make it readable as glass.
  mesh(new THREE.PlaneGeometry(0.754, 0.06), glass, 0, 1.025, 0.397);
  mesh(new THREE.CircleGeometry(0.377, 40, 0, Math.PI), glass, 0, 1.055, 0.397);
  for (const [x, y, w, h] of [
    [0.271, 1.184, 0.012, 0.178],
    [0.298, 1.177, 0.005, 0.115],
    [-0.326, 1.114, 0.006, 0.066],
  ]) {
    const shine = mesh(new THREE.PlaneGeometry(w, h), reflection, x, y, 0.3985);
    shine.rotation.z = 0.34;
    shine.castShadow = false;
  }
  lettering("MELODY", -0.1255, 1.361, 0.402, 0.031, 0.038, 0.013, 0.0034, paleGold);
  box(0.154, 0.0025, 0.004, 0, 1.35, 0.402, brass);

  // Deterministic printed artwork, made in memory without external assets or a DOM.
  const font: Record<string, string> = {
    A: "01110/10001/10001/11111/10001/10001/10001",
    B: "11110/10001/10001/11110/10001/10001/11110",
    C: "01111/10000/10000/10000/10000/10000/01111",
    D: "11110/10001/10001/10001/10001/10001/11110",
    E: "11111/10000/10000/11110/10000/10000/11111",
    F: "11111/10000/10000/11110/10000/10000/10000",
    G: "01111/10000/10000/10111/10001/10001/01110",
    H: "10001/10001/10001/11111/10001/10001/10001",
    I: "11111/00100/00100/00100/00100/00100/11111",
    J: "00111/00010/00010/00010/00010/10010/01100",
    K: "10001/10010/10100/11000/10100/10010/10001",
    L: "10000/10000/10000/10000/10000/10000/11111",
    M: "10001/11011/10101/10101/10001/10001/10001",
    N: "10001/11001/10101/10011/10001/10001/10001",
    O: "01110/10001/10001/10001/10001/10001/01110",
    P: "11110/10001/10001/11110/10000/10000/10000",
    Q: "01110/10001/10001/10001/10101/10010/01101",
    R: "11110/10001/10001/11110/10100/10010/10001",
    S: "01111/10000/10000/01110/00001/00001/11110",
    T: "11111/00100/00100/00100/00100/00100/00100",
    U: "10001/10001/10001/10001/10001/10001/01110",
    V: "10001/10001/10001/10001/10001/01010/00100",
    W: "10001/10001/10001/10101/10101/11011/10001",
    X: "10001/10001/01010/00100/01010/10001/10001",
    Y: "10001/10001/01010/00100/00100/00100/00100",
    Z: "11111/00001/00010/00100/01000/10000/11111",
    "0": "01110/10001/10011/10101/11001/10001/01110",
    "1": "00100/01100/00100/00100/00100/00100/01110",
    "2": "01110/10001/00001/00010/00100/01000/11111",
    "3": "11110/00001/00001/01110/00001/00001/11110",
    "4": "00010/00110/01010/10010/11111/00010/00010",
    "5": "11111/10000/10000/11110/00001/00001/11110",
    "6": "01110/10000/10000/11110/10001/10001/01110",
    "7": "11111/00001/00010/00100/01000/01000/01000",
    "8": "01110/10001/10001/01110/10001/10001/01110",
    "9": "01110/10001/10001/01111/00001/00001/01110",
    "-": "00000/00000/00000/11111/00000/00000/00000",
    ".": "00000/00000/00000/00000/00000/00110/00110",
  };

  const atlasW = 1024, atlasH = 384;
  const pixels = new Uint8Array(atlasW * atlasH * 4);
  type Ink = [number, number, number];
  const paperInk: Ink = [240, 225, 187];
  const darkInk: Ink = [36, 53, 52];
  const redInk: Ink = [133, 48, 43];
  const borderInk: Ink = [171, 143, 94];

  function rect(x: number, y: number, w: number, h: number, color: Ink): void {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        if (px < 0 || py < 0 || px >= atlasW || py >= atlasH) continue;
        const index = ((atlasH - 1 - py) * atlasW + px) * 4;
        pixels[index] = color[0];
        pixels[index + 1] = color[1];
        pixels[index + 2] = color[2];
        pixels[index + 3] = 255;
      }
    }
  }
  function print(text: string, x: number, y: number, size: number, color: Ink): void {
    let cursor = x;
    for (const ch of text) {
      const rows = font[ch]?.split("/");
      if (rows) {
        for (let yy = 0; yy < 7; yy++) {
          for (let xx = 0; xx < 5; xx++) {
            if (rows[yy][xx] === "1") rect(cursor + xx * size, y + yy * size, size, size, color);
          }
        }
      }
      cursor += size * 6;
    }
  }

  rect(0, 0, atlasW, atlasH, paperInk);
  const songs = [
    ["BLUE MOON", "THE MARCELS"],
    ["IN THE MOOD", "GLENN MILLER"],
    ["STARDUST", "NAT KING COLE"],
    ["MOON RIVER", "ANDY WILLIAMS"],
    ["DREAM A LITTLE", "ELLA FITZGERALD"],
    ["JAILHOUSE ROCK", "ELVIS PRESLEY"],
    ["EARTH ANGEL", "THE PENGUINS"],
    ["SWEET GEORGIA", "THE JAZZ ORCHESTRA"],
    ["ONLY YOU", "THE PLATTERS"],
    ["ROCK AROUND", "BILL HALEY"],
  ];
  for (let i = 0; i < 10; i++) {
    const col = Math.floor(i / 5), row = i % 5;
    const x = col * 512, y = row * 64;
    rect(x + 2, y + 2, 508, 60, borderInk);
    rect(x + 4, y + 4, 504, 56, paperInk);
    rect(x + 70, y + 7, 2, 50, redInk);
    rect(x + 84, y + 56, 410, 1, redInk);
    print((col === 0 ? "A" : "B") + (row + 1), x + 14, y + 21, 3, redInk);
    print(songs[i][0], x + 86, y + 9, 3, darkInk);
    print(songs[i][1], x + 86, y + 38, 2, redInk);
  }
  print("COIN OPERATED", 138, 327, 3, redInk);
  print("1 PLAY 5C   3 PLAYS 10C", 124, 359, 2, darkInk);
  print("100 SELECTIONS", 601, 339, 4, redInk);

  const atlas = new THREE.DataTexture(pixels, atlasW, atlasH, THREE.RGBAFormat);
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.magFilter = THREE.LinearFilter;
  atlas.minFilter = THREE.LinearMipmapLinearFilter;
  atlas.generateMipmaps = true;
  atlas.needsUpdate = true;
  const printedPaper = material("#ffffff", 0.83, 0, { map: atlas });

  function label(
    width: number, height: number, col: number, row: number,
    x: number, y: number, z: number,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(width, height);
    const uv = geometry.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i), v = uv.getY(i);
      uv.setXY(i, (col + u) / 2, 1 - (row + 1 - v) / 6);
    }
    return mesh(geometry, printedPaper, x, y, z, parent);
  }

  // Slightly inclined selector console and individual ivory push buttons.
  const consoleGroup = new THREE.Group();
  consoleGroup.name = "Song selector console";
  consoleGroup.position.set(0, 0.877, 0.363);
  consoleGroup.rotation.x = -0.12;
  root.add(consoleGroup);

  box(0.744, 0.252, 0.036, 0, 0, 0, brass, consoleGroup);
  box(0.717, 0.226, 0.019, 0, 0, 0.021, wine, consoleGroup);
  box(0.694, 0.205, 0.009, 0, 0, 0.034, darkTeal, consoleGroup);
  box(0.009, 0.195, 0.009, 0, 0, 0.043, brass, consoleGroup);
  for (let row = 0; row < 5; row++) {
    const y = 0.08 - row * 0.04;
    for (const col of [0, 1]) {
      const side = col === 0 ? -1 : 1;
      const x = side * 0.153;
      box(0.271, 0.035, 0.006, x, y, 0.043, agedBrass, consoleGroup);
      label(0.26, 0.0305, col, row, x, y, 0.047, consoleGroup);

      disc(0.015, 0.01, side * 0.321, y, 0.043, brass, 16, consoleGroup);
      disc(0.0114, 0.012, side * 0.321, y, 0.052, cream, 12, consoleGroup);
      disc(0.0032, 0.0015, side * 0.321, y, 0.059, ruby, 10, consoleGroup);
    }
  }
  for (const x of [-0.355, 0.355]) {
    for (const y of [-0.111, 0.111]) screw(x, y, 0.033, consoleGroup);
  }
  box(0.256, 0.036, 0.017, 0, 1.025, 0.387, brass);
  label(0.24, 0.027, 1, 5, 0, 1.025, 0.397);

  // Coin equipment below the title cards.
  box(0.734, 0.087, 0.038, 0, 0.699, 0.345, brass);
  box(0.705, 0.065, 0.02, 0, 0.699, 0.371, wine);
  box(0.269, 0.05, 0.009, -0.183, 0.699, 0.386, agedBrass);
  label(0.257, 0.041, 0, 5, -0.183, 0.699, 0.391);

  box(0.233, 0.054, 0.011, 0.196, 0.699, 0.386, chrome);
  box(0.028, 0.043, 0.006, 0.156, 0.699, 0.395, agedBrass);
  box(0.009, 0.032, 0.005, 0.156, 0.699, 0.400, black);
  box(0.086, 0.027, 0.005, 0.248, 0.700, 0.395, black);
  box(0.064, 0.009, 0.019, 0.248, 0.692, 0.402, chrome);
  box(0.049, 0.004, 0.021, 0.248, 0.69, 0.41, paleGold);
  disc(0.019, 0.012, 0.024, 0.699, 0.393, brass, 16);
  disc(0.012, 0.009, 0.024, 0.699, 0.403, teal, 16);
  for (const x of [0.092, 0.3]) screw(x, 0.7, 0.397);

  // Small lower apron ornament and trim seams.
  box(0.15, 0.028, 0.008, 0, 0.117, 0.384, agedBrass);
  box(0.134, 0.016, 0.004, 0, 0.117, 0.39, darkTeal);
  for (const x of [-0.044, -0.029, -0.014, 0.014, 0.029, 0.044]) {
    box(0.003, 0.009, 0.003, x, 0.117, 0.394, paleGold);
  }
  for (const side of [-1, 1]) {
    box(0.017, 0.451, 0.014, side * 0.366, 0.426, 0.331, wine);
    box(0.004, 0.435, 0.007, side * 0.375, 0.426, 0.342, brass);
  }

  return root;
}
