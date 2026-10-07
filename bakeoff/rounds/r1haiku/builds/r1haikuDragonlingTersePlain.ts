import * as THREE from "three";

export const meta = {
  name: "Baby Dragon",
  description: "A stylized green baby dragon in a rest pose, with folded-out wings, ochre back spines, horns, and a spade-tipped tail."
};

// Seeded generator so every build is identical.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createBabyDragon(): THREE.Object3D {
  const rng = mulberry32(7741);

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  function mat(name: string, color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
    if (!mats[name]) {
      mats[name] = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.0, ...extra });
    }
    return mats[name];
  }

  const palette = {
    green: 0x4f9d3a,
    darkGreen: 0x2f6b2a,
    belly: 0xe9dc8a,
    ochre: 0xe0a33a,
    horn: 0xf1e6c8,
    membrane: 0xc0505a,
    bone: 0x3a6b2a,
    eye: 0xffc83a,
    pupil: 0x101010,
    nostril: 0x1a1a1a,
    fang: 0xfbf7e6
  };

  const sphere = new THREE.SphereGeometry(1, 20, 14);
  const sphereLo = new THREE.SphereGeometry(1, 12, 9);
  const box = new THREE.BoxGeometry(1, 1, 1);

  function add(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1]
  ) {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    parent.add(mesh);
    return mesh;
  }

  const root = new THREE.Group();

  const green = mat("green", palette.green);
  const darkGreen = mat("darkGreen", palette.darkGreen);
  const belly = mat("belly", palette.belly);
  const ochre = mat("ochre", palette.ochre);
  const horn = mat("horn", palette.horn);
  const membrane = mat("membrane", palette.membrane, { side: THREE.DoubleSide, roughness: 0.8 });
  const boneMat = mat("bone", palette.bone);
  const eye = mat("eye", palette.eye, { emissive: 0x553300, emissiveIntensity: 0.4 });
  const pupil = mat("pupil", palette.pupil);
  const nostril = mat("nostril", palette.nostril);
  const fang = mat("fang", palette.fang);

  // ---------- Torso ----------
  add(root, sphere, green, [0, 0.36, 0], [0, 0, 0], [0.2, 0.19, 0.3]);
  // Pale chest plate pushing out at the front
  add(root, sphere, belly, [0, 0.33, 0.19], [0, 0, 0], [0.15, 0.16, 0.14]);

  // ---------- Neck ----------
  add(root, sphereLo, green, [0, 0.47, 0.3], [0, 0, 0], [0.085, 0.09, 0.09]);
  add(root, sphereLo, green, [0, 0.58, 0.38], [0, 0, 0], [0.07, 0.075, 0.075]);

  // ---------- Head ----------
  add(root, sphere, green, [0, 0.67, 0.5], [0, 0, 0], [0.11, 0.1, 0.13]);
  // Brow ridge
  add(root, box, darkGreen, [0, 0.73, 0.56], [0.15, 0, 0], [0.1, 0.03, 0.07]);
  // Snout
  add(root, new THREE.CylinderGeometry(0.04, 0.05, 0.12, 8), green, [0, 0.665, 0.64], [Math.PI / 2, 0, 0]);
  // Lower jaw
  add(root, box, belly, [0, 0.615, 0.6], [0, 0, 0], [0.085, 0.035, 0.12]);

  for (const side of [1, -1]) {
    // Nostrils
    add(root, sphereLo, nostril, [side * 0.02, 0.675, 0.705], [0, 0, 0], [0.012, 0.012, 0.012]);
    // Fangs
    add(root, new THREE.ConeGeometry(0.01, 0.03, 6), fang, [side * 0.035, 0.63, 0.67], [Math.PI, 0, 0]);
    // Eyes and pupils
    add(root, sphereLo, eye, [side * 0.075, 0.71, 0.56], [0, 0, 0], [0.024, 0.024, 0.02]);
    add(root, sphereLo, pupil, [side * 0.079, 0.71, 0.578], [0, 0, 0], [0.006, 0.014, 0.01]);
    // Horns swept back
    add(root, new THREE.ConeGeometry(0.018, 0.13, 6), horn, [side * 0.05, 0.775, 0.46], [-0.6, 0, -side * 0.25]);
    // Cheek spike
    add(root, new THREE.ConeGeometry(0.014, 0.05, 5), ochre, [side * 0.1, 0.63, 0.5], [0, 0, -side * 1.0]);
  }

  // ---------- Back spines ----------
  const topY = (z: number) => 0.36 + 0.19 * Math.sqrt(Math.max(0, 1 - (z / 0.3) ** 2));
  for (let z = 0.24; z >= -0.3; z -= 0.06) {
    const taper = 1 - (0.24 - z) / 0.7;
    const s = (0.75 + rng() * 0.35) * taper;
    add(root, new THREE.ConeGeometry(0.03, 0.09, 6), ochre, [0, topY(z) - 0.01, z], [0, 0, 0], [s, s, s]);
  }
  // Neck spines
  add(root, new THREE.ConeGeometry(0.026, 0.07, 6), ochre, [0, 0.55, 0.3]);
  add(root, new THREE.ConeGeometry(0.022, 0.06, 6), ochre, [0, 0.63, 0.4]);

  // ---------- Tail ----------
  const tailSegs: [number, number, number][] = [
    [-0.2, 0.33, 0.075],
    [-0.34, 0.3, 0.06],
    [-0.46, 0.26, 0.05],
    [-0.57, 0.22, 0.04],
    [-0.66, 0.2, 0.03]
  ];
  tailSegs.forEach(([z, y, r], i) => {
    add(root, sphereLo, green, [0, y, z], [0, 0, 0], [r, r * 0.95, r * 1.4]);
    if (i < 3) {
      add(root, new THREE.ConeGeometry(0.02, 0.06, 5), ochre, [0, y + r * 0.9, z]);
    }
  });
  // Spade tip: diamond plate
  add(root, box, darkGreen, [0, 0.19, -0.77], [0, 0, Math.PI / 4], [0.07, 0.07, 0.014]);
  add(root, new THREE.ConeGeometry(0.035, 0.1, 5), green, [0, 0.19, -0.72], [-Math.PI / 2, 0, 0]);

  // ---------- Legs and claws ----------
  for (const side of [1, -1]) {
    // Back leg: haunch, shin, foot
    add(root, sphereLo, green, [side * 0.15, 0.31, -0.1], [0, 0, 0], [0.09, 0.1, 0.11]);
    add(root, new THREE.CylinderGeometry(0.035, 0.028, 0.2, 8), darkGreen, [side * 0.16, 0.12, -0.1]);
    add(root, sphereLo, darkGreen, [side * 0.16, 0.03, 0.0], [0, 0, 0], [0.065, 0.03, 0.1]);
    for (const dx of [-0.03, 0, 0.03]) {
      add(root, new THREE.ConeGeometry(0.012, 0.04, 5), horn, [side * 0.16 + dx, 0.02, 0.09], [Math.PI / 2, 0, 0]);
    }

    // Front leg: upper arm, forearm, foot
    add(root, new THREE.CylinderGeometry(0.04, 0.032, 0.18, 8), green, [side * 0.13, 0.16, 0.2]);
    add(root, sphereLo, darkGreen, [side * 0.13, 0.025, 0.25], [0, 0, 0], [0.045, 0.025, 0.065]);
    for (const dx of [-0.02, 0, 0.02]) {
      add(root, new THREE.ConeGeometry(0.01, 0.03, 5), horn, [side * 0.13 + dx, 0.015, 0.29], [Math.PI / 2, 0, 0]);
    }
  }

  // ---------- Wings (folded out, mirrored per side) ----------
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.04);
  wingShape.lineTo(0.14, 0.12);
  wingShape.lineTo(0.30, 0.06);
  wingShape.lineTo(0.30, -0.08);
  wingShape.lineTo(0.22, -0.12);
  wingShape.lineTo(0.18, -0.2);
  wingShape.lineTo(0.10, -0.14);
  wingShape.lineTo(0.02, -0.2);
  wingShape.lineTo(0, -0.04);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.008, bevelEnabled: false, curveSegments: 3 });

  function bone(parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 5), m);
    c.position.copy(a).add(b).multiplyScalar(0.5);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    parent.add(c);
  }

  for (const side of [1, -1]) {
    const wing = new THREE.Group();
    wing.position.set(side * 0.16, 0.5, 0.0);
    wing.scale.set(side, 1, 1);
    wing.rotation.set(0, 0, side * 0.25);
    root.add(wing);

    add(wing, wingGeo, membrane, [0, 0, -0.004]);

    const origin = new THREE.Vector3(0, 0.02, 0.006);
    const tips = [
      [0.14, 0.12],
      [0.30, 0.06],
      [0.30, -0.08],
      [0.18, -0.2],
      [0.02, -0.2]
    ];
    for (const [x, y] of tips) {
      bone(wing, origin, new THREE.Vector3(x, y, 0.006), 0.006, boneMat);
    }
    // Shoulder knob where the wing meets the body
    add(wing, sphereLo, darkGreen, [0, 0.02, 0.006], [0, 0, 0], [0.025, 0.025, 0.02]);
  }

  return root;
}
