import * as THREE from "three";

export const meta = {
  name: "Fennec Fox Kit",
  description:
    "A wide-eared fennec fox kit standing alert on a sand dune at dusk, with satin peach-lined ears, a cream-to-gold coat, a black-tipped tail, oversized paws and a leather collar with a brass bell.",
};

const CREAM = new THREE.Color("#f4e4c6");
const GOLD = new THREE.Color("#d69a52");

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Materials (one per colour, shared)
const furMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
const creamMat = new THREE.MeshStandardMaterial({ color: "#efdcb8", roughness: 0.9 });
const sandMat = new THREE.MeshStandardMaterial({ color: "#d9b27c", roughness: 1 });
const grainMat = new THREE.MeshStandardMaterial({ color: "#c39a5f", roughness: 1 });
const earMat = new THREE.MeshStandardMaterial({ color: "#e2b177", roughness: 0.35 });
const earInnerMat = new THREE.MeshStandardMaterial({ color: "#f3c7a4", roughness: 0.4 });
const blackMat = new THREE.MeshStandardMaterial({ color: "#1b1411", roughness: 0.5 });
const eyeMat = new THREE.MeshStandardMaterial({ color: "#0f0a08", roughness: 0.3 });
const sparkMat = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  emissive: "#ffffff",
  emissiveIntensity: 0.8,
});
const leatherMat = new THREE.MeshStandardMaterial({ color: "#6e4327", roughness: 0.6 });
const brassMat = new THREE.MeshStandardMaterial({ color: "#d7aa48", metalness: 0.9, roughness: 0.28 });

const SW = 18;
const SH = 12;

// Vertex-colour gradient: cream underneath, warming to gold along the top.
function gradient(geo: THREE.BufferGeometry, lo: number, hi: number) {
  const pos = geo.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.smoothstep(pos.getY(i), lo, hi);
    c.copy(CREAM).lerp(GOLD, t);
    cols[i * 3] = c.r;
    cols[i * 3 + 1] = c.g;
    cols[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  return geo;
}

// Ellipsoid built from a unit sphere, scaled per axis.
function blob(
  parent: THREE.Object3D,
  scale: [number, number, number],
  pos: [number, number, number],
  material: THREE.Material,
  rot: [number, number, number] = [0, 0, 0],
) {
  const geo = new THREE.SphereGeometry(1, SW, SH);
  if (material === furMat) gradient(geo, -0.4, 0.8);
  const m = new THREE.Mesh(geo, material);
  m.scale.set(scale[0], scale[1], scale[2]);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(m);
  return m;
}

// Upper hemisphere, so the dune sits flat on the ground.
function duneGeo() {
  return new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, Math.PI / 2);
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = seeded(7);

  // ---- Dune (sits on y = 0) ----
  const dune = new THREE.Mesh(duneGeo(), sandMat);
  dune.scale.set(0.42, 0.14, 0.32);
  root.add(dune);

  // Wind-swept secondary lobe
  const lobe = new THREE.Mesh(duneGeo(), sandMat);
  lobe.scale.set(0.2, 0.07, 0.17);
  lobe.position.set(0.23, 0, -0.1);
  root.add(lobe);

  // Sand grains scattered over the crest
  const grainGeo = new THREE.SphereGeometry(0.007, 5, 4);
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.75;
    const g = new THREE.Mesh(grainGeo, grainMat);
    g.position.set(
      0.42 * r * Math.cos(a),
      0.14 * Math.sqrt(1 - r * r) - 0.002,
      0.32 * r * Math.sin(a),
    );
    root.add(g);
  }

  // ---- Fox (local origin at the paws, lifted onto the dune crest) ----
  const fox = new THREE.Group();
  fox.position.set(0, 0.13, 0);
  root.add(fox);

  // Legs and oversized paws
  const legGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.17, 10);
  const legs: [number, number][] = [
    [0.062, 0.1],
    [-0.062, 0.1],
    [0.06, -0.1],
    [-0.06, -0.1],
  ];
  for (const [x, z] of legs) {
    const leg = new THREE.Mesh(legGeo, creamMat);
    leg.position.set(x, 0.085, z);
    fox.add(leg);
    blob(fox, [0.036, 0.022, 0.046], [x, 0.01, z + 0.02], creamMat);
  }

  // Torso
  blob(fox, [0.12, 0.1, 0.2], [0, 0.18, 0], furMat);
  // Neck
  blob(fox, [0.07, 0.08, 0.08], [0, 0.24, 0.14], furMat);

  // Head
  blob(fox, [0.088, 0.085, 0.085], [0, 0.3, 0.2], furMat);
  // Cheek puffs
  blob(fox, [0.04, 0.035, 0.04], [0.045, 0.27, 0.23], creamMat);
  blob(fox, [0.04, 0.035, 0.04], [-0.045, 0.27, 0.23], creamMat);
  // Snout
  blob(fox, [0.042, 0.038, 0.085], [0, 0.28, 0.31], furMat);
  // Nose
  blob(fox, [0.013, 0.012, 0.013], [0, 0.296, 0.39], blackMat);

  // Eyes with tiny sparkles
  for (const side of [1, -1]) {
    const ex = side * 0.045;
    blob(fox, [0.017, 0.02, 0.012], [ex, 0.315, 0.265], eyeMat);
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 6, 5), sparkMat);
    spark.position.set(ex + side * 0.006, 0.322, 0.278);
    fox.add(spark);
  }

  // Satin ears with peach linings, tilted outward and forward (alert)
  for (const side of [1, -1]) {
    const ear = new THREE.Group();
    ear.position.set(side * 0.05, 0.44, 0.17);
    ear.rotation.set(0.2, 0, -side * 0.2);
    fox.add(ear);
    blob(ear, [0.04, 0.11, 0.011], [0, 0, 0], earMat);
    blob(ear, [0.026, 0.085, 0.004], [0, -0.01, 0.009], earInnerMat);
  }

  // Fluffy tail curling back, black-tipped
  const tailSegs: [[number, number, number], number][] = [
    [[0, 0.2, -0.17], 0.05],
    [[0, 0.22, -0.25], 0.06],
    [[0, 0.24, -0.33], 0.065],
    [[0, 0.23, -0.41], 0.06],
    [[0, 0.18, -0.43], 0.05],
  ];
  for (const [p, r] of tailSegs) {
    blob(fox, [r, r, r], p, furMat);
  }
  blob(fox, [0.04, 0.04, 0.04], [0, 0.162, -0.47], blackMat);

  // Woven leather collar around the neck
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 10, 32), leatherMat);
  collar.position.set(0, 0.22, 0.15);
  collar.rotation.x = -0.99; // ring normal follows the neck direction
  fox.add(collar);

  // Small brass bell hanging at the front-bottom of the collar
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.019, 12, 10), brassMat);
  bell.position.set(0, 0.163, 0.225);
  fox.add(bell);

  return root;
}
