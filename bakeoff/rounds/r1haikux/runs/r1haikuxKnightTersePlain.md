```ts
import * as THREE from "three";

export const meta = {
  name: "Armoured Knight",
  description:
    "A stylised plate-armoured knight at rest: a crested great helm, a crimson tabard with a gold cross, a blue heater shield resting on the ground at his left, and a longsword planted point-down in his right hand.",
};

type Tri = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Canvas-drawn heraldic tabard: crimson field, gold border and gold cross. */
function makeEmblemTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 320;
  const g = canvas.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#9b1f28";
  g.fillRect(0, 0, 128, 320);
  g.strokeStyle = "#e2b650";
  g.lineWidth = 8;
  g.strokeRect(10, 10, 108, 300);
  g.fillStyle = "#e2b650";
  g.fillRect(50, 48, 28, 226);
  g.fillRect(22, 104, 84, 28);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Heater shield outline centred on the origin, scaled by s. */
function heaterShape(s: number): THREE.Shape {
  const sh = new THREE.Shape();
  sh.moveTo(-0.25 * s, 0.45 * s);
  sh.lineTo(0.25 * s, 0.45 * s);
  sh.lineTo(0.25 * s, 0.1 * s);
  sh.quadraticCurveTo(0.25 * s, -0.25 * s, 0, -0.45 * s);
  sh.quadraticCurveTo(-0.25 * s, -0.25 * s, -0.25 * s, 0.1 * s);
  sh.closePath();
  return sh;
}

export default function createKnight(): THREE.Object3D {
  const tex = makeEmblemTexture();

  // One material per colour, shared by every mesh that uses it.
  const M = {
    steel: new THREE.MeshStandardMaterial({ color: 0xc5ccd6, metalness: 0.9, roughness: 0.27 }),
    steelDark: new THREE.MeshStandardMaterial({ color: 0x6d747f, metalness: 0.85, roughness: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe2b650, metalness: 1, roughness: 0.24 }),
    crimson: new THREE.MeshStandardMaterial({ color: 0x9b1f28, roughness: 0.75 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x2c4b9c, metalness: 0.1, roughness: 0.55 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x4a2d1b, roughness: 0.9 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x101216, metalness: 0.3, roughness: 0.6 }),
    emblem: new THREE.MeshStandardMaterial({
      color: tex ? 0xffffff : 0x9b1f28,
      map: tex,
      roughness: 0.75,
    }),
  };

  const root = new THREE.Group();
  root.name = "armoured-knight";

  const place = (
    geo: THREE.BufferGeometry,
    m: THREE.Material | THREE.Material[],
    pos: Tri,
    rot: Tri = [0, 0, 0],
    parent: THREE.Object3D = root
  ): THREE.Mesh => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(...pos);
    o.rotation.set(...rot);
    parent.add(o);
    return o;
  };

  const ball = (r: number, m: THREE.Material, p: THREE.Vector3, seg = 10): THREE.Mesh =>
    place(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), m, [p.x, p.y, p.z]);

  // Cylinder from a to b with radius rA at a and rB at b.
  const tube = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    rA: number,
    rB: number,
    m: THREE.Material,
    seg = 8
  ): THREE.Mesh => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const o = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, dir.length(), seg, 1), m);
    o.position.addVectors(a, b).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(UP, dir.normalize());
    root.add(o);
    return o;
  };

  // ---------- legs ----------
  for (const s of [-1, 1]) {
    const hip = V(0.13 * s, 0.95, 0);
    const knee = V(0.14 * s, 0.55, 0.02);
    const ankle = V(0.14 * s, 0.1, 0.02);

    tube(hip, knee, 0.1, 0.085, M.steel, 10); // cuisse
    tube(knee, ankle, 0.085, 0.062, M.steel, 10); // greave
    ball(0.088, M.steel, knee, 10); // poleyn
    place(
      new THREE.ConeGeometry(0.055, 0.08, 6),
      M.steel,
      [knee.x, knee.y, knee.z + 0.075],
      [Math.PI / 2, 0, 0]
    ); // pointed knee
    place(new THREE.TorusGeometry(0.083, 0.009, 6, 14), M.gold, [knee.x, 0.5, knee.z], [Math.PI / 2, 0, 0]);

    place(new THREE.BoxGeometry(0.15, 0.09, 0.26), M.steelDark, [0.14 * s, 0.045, 0.06]); // sabaton
    place(new THREE.BoxGeometry(0.13, 0.07, 0.07), M.steel, [0.14 * s, 0.04, 0.2]); // toe cap

    place(new THREE.BoxGeometry(0.12, 0.2, 0.025), M.steel, [0.135 * s, 0.82, 0.105]); // tasset
    place(new THREE.BoxGeometry(0.124, 0.014, 0.03), M.gold, [0.135 * s, 0.715, 0.11]); // tasset trim
  }

  // ---------- hips, belt, torso ----------
  place(
    new THREE.CylinderGeometry(0.17, 0.21, 0.13, 8).rotateY(Math.PI / 8).scale(1, 1, 0.7),
    M.steelDark,
    [0, 0.96, 0]
  ); // fauld
  place(
    new THREE.TorusGeometry(0.21, 0.008, 6, 20).rotateX(Math.PI / 2).scale(1, 1, 0.7),
    M.gold,
    [0, 0.895, 0]
  ); // fauld trim
  place(
    new THREE.CylinderGeometry(0.2, 0.2, 0.035, 8).rotateY(Math.PI / 8).scale(1, 1, 0.72),
    M.leather,
    [0, 1.035, 0]
  ); // belt

  place(
    new THREE.CylinderGeometry(0.2, 0.17, 0.42, 12).rotateY(Math.PI / 12).scale(1, 1, 0.66),
    M.steel,
    [0, 1.25, 0]
  ); // breastplate
  place(
    new THREE.TorusGeometry(0.19, 0.011, 6, 24).rotateX(Math.PI / 2).scale(1, 1, 0.66),
    M.gold,
    [0, 1.445, 0]
  ); // gold collar rim

  // Tabard: crimson box, emblem on the front face, gold edging.
  place(
    new THREE.BoxGeometry(0.23, 0.62, 0.025),
    [M.crimson, M.crimson, M.crimson, M.crimson, M.emblem, M.crimson],
    [0, 1.1, 0.137]
  );
  for (const s of [-1, 1]) {
    place(new THREE.BoxGeometry(0.012, 0.62, 0.028), M.gold, [0.113 * s, 1.1, 0.137]);
  }
  place(new THREE.BoxGeometry(0.23, 0.014, 0.028), M.gold, [0, 0.79, 0.137]);

  // ---------- neck & great helm ----------
  place(new THREE.CylinderGeometry(0.095, 0.11, 0.07, 10), M.steelDark, [0, 1.47, 0]); // gorget
  place(new THREE.CylinderGeometry(0.125, 0.132, 0.24, 8).rotateY(Math.PI / 8), M.steel, [0, 1.6, 0]);
  place(new THREE.CylinderGeometry(0.118, 0.118, 0.012, 8).rotateY(Math.PI / 8), M.steelDark, [0, 1.72, 0]);
  place(new THREE.TorusGeometry(0.125, 0.011, 6, 16).rotateX(Math.PI / 2), M.gold, [0, 1.72, 0]);
  place(new THREE.TorusGeometry(0.132, 0.011, 6, 16).rotateX(Math.PI / 2), M.gold, [0, 1.48, 0]);

  // Visor: horizontal slit, vertical steel bar, breath holes.
  place(new THREE.BoxGeometry(0.1, 0.022, 0.02), M.dark, [0, 1.635, 0.115]);
  place(new THREE.BoxGeometry(0.022, 0.13, 0.022), M.steelDark, [0, 1.6, 0.126]);
  for (const x of [-0.03, 0.03]) {
    for (const y of [1.56, 1.52]) {
      place(new THREE.BoxGeometry(0.013, 0.013, 0.01), M.dark, [x, y, 0.12]);
    }
  }

  // Crimson plume sweeping back over the helm.
  place(new THREE.CylinderGeometry(0.02, 0.026, 0.035, 8), M.gold, [0, 1.74, 0]);
  {
    const p = V(0, 1.75, 0);
    let ang = 0;
    for (let i = 0; i < 5; i++) {
      const d = V(0, Math.cos(ang), -Math.sin(ang));
      const taper = 1 - i * 0.14;
      const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), M.crimson);
      blob.position.copy(p).addScaledVector(d, 0.04);
      blob.scale.set(0.03 * taper, 0.05, 0.02 * taper);
      blob.quaternion.setFromUnitVectors(UP, d);
      root.add(blob);
      p.addScaledVector(d, 0.04);
      ang += 0.3;
    }
  }

  // ---------- cape ----------
  place(new THREE.BoxGeometry(0.42, 0.86, 0.012), M.crimson, [0, 1.0, -0.15], [0.06, 0, 0]);
  place(new THREE.BoxGeometry(0.424, 0.016, 0.022), M.gold, [0, 0.575, -0.176], [0.06, 0, 0]);

  // ---------- pauldrons ----------
  for (const s of [-1, 1]) {
    const x = 0.25 * s;
    place(new THREE.SphereGeometry(0.125, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), M.steel, [x, 1.4, 0]);
    place(new THREE.CylinderGeometry(0.13, 0.12, 0.07, 10, 1, true), M.steelDark, [x, 1.37, 0]);
    place(new THREE.TorusGeometry(0.125, 0.009, 6, 16).rotateX(Math.PI / 2), M.gold, [x, 1.4, 0]);
    place(new THREE.SphereGeometry(0.022, 6, 4), M.gold, [x, 1.53, 0]);
  }

  // ---------- arms ----------
  const arms: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
    [V(0.25, 1.38, 0), V(0.36, 1.12, 0.1), V(0.3, 0.9, 0.24)], // left: holds the shield
    [V(-0.25, 1.38, 0), V(-0.46, 1.2, 0.08), V(-0.37, 1.0, 0.07)], // right: grips the sword
  ];
  for (const [S, E, W] of arms) {
    tube(S, E, 0.062, 0.052, M.steel, 8); // rerebrace
    ball(0.056, M.steel, E, 8); // couter
    tube(E, W, 0.056, 0.046, M.steel, 8); // vambrace
    const k = new THREE.Vector3().subVectors(E, W).normalize();
    tube(
      W.clone().addScaledVector(k, 0.03),
      W.clone().addScaledVector(k, 0.06),
      0.053,
      0.053,
      M.gold,
      10
    ); // gold cuff
    ball(0.055, M.steelDark, W, 8); // gauntlet
  }

  // ---------- heater shield, leaning on the left arm ----------
  const shield = new THREE.Group();
  shield.position.set(0.36, 0.45, 0.25);
  shield.rotation.z = 0.1;
  root.add(shield);

  const rimGeo = new THREE.ExtrudeGeometry(heaterShape(1), {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 6,
  });
  const fieldGeo = new THREE.ExtrudeGeometry(heaterShape(0.84), {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 1,
    curveSegments: 6,
  });
  place(rimGeo, M.gold, [0, 0, 0], [0, 0, 0], shield);
  place(fieldGeo, M.blue, [0, 0, 0.02], [0, 0, 0], shield);
  place(new THREE.BoxGeometry(0.07, 0.62, 0.012), M.gold, [0, -0.02, 0.06], [0, 0, 0], shield); // cross, upright
  place(new THREE.BoxGeometry(0.32, 0.07, 0.012), M.gold, [0, 0.1, 0.06], [0, 0, 0], shield); // cross, bar
  place(
    new THREE.SphereGeometry(0.04, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    M.gold,
    [0, 0.1, 0.058],
    [Math.PI / 2, 0, 0],
    shield
  ); // central boss
  for (const s of [-1, 1]) {
    for (const y of [0.36, 0.18]) {
      place(new THREE.SphereGeometry(0.012, 6, 4), M.gold, [0.245 * s, y, 0.035], [0, 0, 0], shield);
    }
  }

  // ---------- longsword, planted point-down at the right side ----------
  const sword = new THREE.Group();
  sword.position.set(-0.37, 0, 0.07);
  root.add(sword);
  place(new THREE.BoxGeometry(0.046, 0.885, 0.01), M.steel, [0, 0.4925, 0], [0, 0, 0], sword); // blade
  place(new THREE.BoxGeometry(0.01, 0.8, 0.014), M.steelDark, [0, 0.47, 0], [0, 0, 0], sword); // fuller
  place(new THREE.ConeGeometry(0.024, 0.05, 4), M.steel, [0, 0.025, 0], [Math.PI, 0, 0], sword); // point
  place(new THREE.BoxGeometry(0.2, 0.032, 0.03), M.gold, [0, 0.94, 0], [0, 0, 0], sword); // crossguard
  for (const s of [-1, 1]) {
    place(new THREE.SphereGeometry(0.02, 6, 4), M.gold, [0.1 * s, 0.94, 0], [0, 0, 0], sword);
  }
  place(new THREE.CylinderGeometry(0.017, 0.017, 0.12, 8), M.leather, [0, 1.0, 0], [0, 0, 0], sword); // grip
  for (const y of [0.975, 1.025]) {
    place(new THREE.TorusGeometry(0.018, 0.005, 5, 10).rotateX(Math.PI / 2), M.gold, [0, y, 0], [0, 0, 0], sword);
  }
  place(new THREE.SphereGeometry(0.03, 8, 6), M.gold, [0, 1.07, 0], [0, 0, 0], sword); // pommel

  return root;
}
```