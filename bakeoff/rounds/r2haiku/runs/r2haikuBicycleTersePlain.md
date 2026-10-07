```ts
import * as THREE from "three";

export const meta = {
  name: "Vintage Bicycle",
  description: "A 1930s-style roadster bicycle with a green frame, cream pinstripe, chrome fittings, leather saddle, wicker front basket and a wooden rear crate.",
};

// Seeded generator kept for consistency (the model itself is fully deterministic).
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
void makeRng(7);

const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function tube(
  parent: THREE.Object3D,
  a: THREE.Vector3,
  b: THREE.Vector3,
  r: number,
  mat: THREE.Material,
  seg = 8
) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  parent.add(m);
  return m;
}

function part(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number
) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

export default function createModel(): THREE.Object3D {
  const bike = new THREE.Group();

  // ---------- Materials (one per colour, shared) ----------
  const mats = {
    frame: new THREE.MeshStandardMaterial({ color: "#2d5a43", roughness: 0.38, metalness: 0.15 }),
    cream: new THREE.MeshStandardMaterial({ color: "#efe3c2", roughness: 0.4 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#dcdcdc", roughness: 0.2, metalness: 1.0 }),
    tire: new THREE.MeshStandardMaterial({ color: "#1d1d1d", roughness: 0.8 }),
    leather: new THREE.MeshStandardMaterial({ color: "#6e4324", roughness: 0.55 }),
    wood: new THREE.MeshStandardMaterial({ color: "#b9824f", roughness: 0.7 }),
    woodDark: new THREE.MeshStandardMaterial({ color: "#8a5c35", roughness: 0.75 }),
    wicker: new THREE.MeshStandardMaterial({ color: "#c9a46a", roughness: 0.85 }),
    brass: new THREE.MeshStandardMaterial({ color: "#c9a04a", roughness: 0.3, metalness: 0.9 }),
    dark: new THREE.MeshStandardMaterial({ color: "#222222", roughness: 0.5, metalness: 0.4 }),
    grip: new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.9 }),
    lens: new THREE.MeshStandardMaterial({ color: "#f3f0d8", roughness: 0.1, metalness: 0.0 }),
  };

  // ---------- Wheels ----------
  const WHEEL_Y = 0.37;
  const REAR_Z = -0.53;
  const FRONT_Z = 0.53;

  function buildWheel(cz: number, front: boolean) {
    const g = new THREE.Group();
    const cy = WHEEL_Y;

    // Tyre and rim
    const tireGeo = new THREE.TorusGeometry(0.335, 0.035, 10, 28);
    tireGeo.rotateY(Math.PI / 2);
    part(g, tireGeo, mats.tire, 0, cy, cz);

    const rimGeo = new THREE.TorusGeometry(0.3, 0.012, 6, 32);
    rimGeo.rotateY(Math.PI / 2);
    part(g, rimGeo, mats.chrome, 0, cy, cz);

    // Hub
    const hubGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.14, 12);
    hubGeo.rotateZ(Math.PI / 2);
    part(g, hubGeo, mats.chrome, 0, cy, cz);

    // Spokes: alternate hub flanges for a crossed look
    const SPOKES = 20;
    for (let i = 0; i < SPOKES; i++) {
      const th = (i / SPOKES) * Math.PI * 2;
      const sx = i % 2 === 0 ? 0.05 : -0.05;
      const hub = V(sx, cy + 0.02 * Math.sin(th), cz + 0.02 * Math.cos(th));
      const rim = V(0, cy + 0.3 * Math.sin(th), cz + 0.3 * Math.cos(th));
      tube(g, hub, rim, 0.0028, mats.chrome, 4);
    }

    // Mudguard arc over the top of the wheel
    const fenderGeo = new THREE.TorusGeometry(0.39, 0.014, 6, 24, 1.8);
    fenderGeo.rotateZ(Math.PI / 2 - 0.9);
    fenderGeo.rotateY(Math.PI / 2);
    part(g, fenderGeo, front ? mats.frame : mats.frame, 0, cy, cz);

    bike.add(g);
    return g;
  }

  buildWheel(REAR_Z, false);
  buildWheel(FRONT_Z, true);

  // ---------- Frame ----------
  const BB = V(0, 0.34, -0.08);
  const seatTop = V(0, 0.82, -0.16);
  const headTop = V(0, 0.95, 0.36);
  const headBot = V(0, 0.82, 0.36);
  const rearAxleL = V(0.05, WHEEL_Y, REAR_Z);
  const rearAxleR = V(-0.05, WHEEL_Y, REAR_Z);
  const frontAxleL = V(0.05, WHEEL_Y, FRONT_Z);
  const frontAxleR = V(-0.05, WHEEL_Y, FRONT_Z);

  // Main triangle
  tube(bike, BB, seatTop, 0.024, mats.frame);          // seat tube
  tube(bike, seatTop, headTop, 0.022, mats.frame);     // top tube
  tube(bike, headBot, BB, 0.026, mats.frame);          // down tube
  tube(bike, headBot, headTop, 0.03, mats.frame, 10);  // head tube

  // Cream pinstripe running along the top tube and down tube
  const stripeOff = V(0, 0.028, 0);
  tube(bike, seatTop.clone().add(stripeOff), headTop.clone().add(stripeOff), 0.007, mats.cream, 6);
  tube(bike, headBot.clone().add(V(0.02, 0, 0)), BB.clone().add(V(0.02, 0, 0)), 0.006, mats.cream, 6);

  // Chainstays and seatstays (paired)
  for (const s of [1, -1]) {
    tube(bike, V(s * 0.02, BB.y, BB.z), V(s * 0.05, WHEEL_Y, REAR_Z), 0.014, mats.frame);
    tube(bike, V(s * 0.02, seatTop.y, seatTop.z), V(s * 0.05, WHEEL_Y, REAR_Z), 0.012, mats.frame);
  }

  // Fork blades
  tube(bike, V(0.04, headBot.y, headBot.z), frontAxleL, 0.016, mats.frame);
  tube(bike, V(-0.04, headBot.y, headBot.z), frontAxleR, 0.016, mats.frame);

  // Fork crown and headset details
  part(bike, new THREE.TorusGeometry(0.035, 0.008, 6, 14), mats.chrome, 0, headBot.y - 0.02, headBot.z).rotation.x = Math.PI / 2;
  part(bike, new THREE.SphereGeometry(0.04, 10, 8), mats.chrome, 0, headTop.y + 0.01, headTop.z);
  part(bike, new THREE.SphereGeometry(0.05, 10, 8), mats.chrome, BB.x, BB.y, BB.z);

  // Axle nuts
  for (const p of [rearAxleL, rearAxleR, frontAxleL, frontAxleR]) {
    part(bike, new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), mats.chrome, p.x * 1.1, p.y, p.z).rotation.z = Math.PI / 2;
  }

  // ---------- Drivetrain ----------
  // Chainring on the right side
  const ringGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.008, 20);
  ringGeo.rotateZ(Math.PI / 2);
  part(bike, ringGeo, mats.chrome, 0.07, BB.y, BB.z);
  // Rear cog
  const cogGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 14);
  cogGeo.rotateZ(Math.PI / 2);
  part(bike, cogGeo, mats.chrome, 0.06, WHEEL_Y, REAR_Z);
  // Chain loop (top and bottom runs)
  tube(bike, V(0.045, BB.y + 0.1, BB.z), V(0.045, WHEEL_Y + 0.035, REAR_Z), 0.006, mats.dark, 5);
  tube(bike, V(0.045, BB.y - 0.1, BB.z), V(0.045, WHEEL_Y - 0.035, REAR_Z), 0.006, mats.dark, 5);

  // Cranks and pedals
  tube(bike, V(0.09, BB.y, BB.z), V(0.09, 0.17, -0.12), 0.012, mats.chrome);
  tube(bike, V(-0.09, BB.y, BB.z), V(-0.09, 0.51, -0.04), 0.012, mats.chrome);
  part(bike, new THREE.BoxGeometry(0.1, 0.02, 0.08), mats.dark, 0.09, 0.17, -0.12);
  part(bike, new THREE.BoxGeometry(0.1, 0.02, 0.08), mats.dark, -0.09, 0.51, -0.04);

  // ---------- Saddle ----------
  const seatPostTop = V(0, 0.86, -0.18);
  tube(bike, seatTop, seatPostTop, 0.014, mats.chrome);
  const saddleGeo = new THREE.SphereGeometry(1, 14, 8);
  const saddle = new THREE.Mesh(saddleGeo, mats.leather);
  saddle.scale.set(0.085, 0.035, 0.18);
  saddle.position.set(0, 0.9, -0.2);
  bike.add(saddle);
  // Saddle nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), mats.leather);
  nose.scale.set(0.04, 0.025, 0.06);
  nose.position.set(0, 0.89, -0.09);
  bike.add(nose);

  // ---------- Handlebars and stem ----------
  const stemTop = V(0, 1.0, 0.38);
  tube(bike, headTop, stemTop, 0.018, mats.chrome);
  const clamp = V(0, 1.02, 0.4);
  tube(bike, stemTop, clamp, 0.02, mats.chrome);
  // Upright drop bars
  for (const s of [1, -1]) {
    tube(bike, clamp, V(s * 0.2, 1.06, 0.34), 0.012, mats.chrome, 8);
    tube(bike, V(s * 0.2, 1.06, 0.34), V(s * 0.22, 1.0, 0.3), 0.012, mats.chrome, 8);
    // Grips
    tube(bike, V(s * 0.18, 1.06, 0.36), V(s * 0.22, 1.0, 0.3), 0.02, mats.grip, 8);
  }
  // Brake lever hints
  part(bike, new THREE.BoxGeometry(0.03, 0.02, 0.06), mats.dark, 0.2, 1.01, 0.31);

  // Bell on the right handlebar
  part(bike, new THREE.SphereGeometry(0.035, 10, 8), mats.brass, 0.14, 1.12, 0.38);
  tube(bike, V(0.14, 1.1, 0.37), V(0.16, 1.05, 0.35), 0.006, mats.brass, 5);

  // Headlamp with brass housing and glass lens
  part(bike, new THREE.SphereGeometry(0.06, 14, 10), mats.brass, 0, 0.86, 0.46).scale.set(1, 1, 0.9);
  part(bike, new THREE.CircleGeometry(0.045, 14), mats.lens, 0, 0.86, 0.52).rotation.y = 0;
  tube(bike, V(0, 0.86, 0.42), V(0, headBot.y + 0.02, headBot.z + 0.04), 0.01, mats.brass, 6);

  // ---------- Front wicker basket ----------
  const basketGeo = new THREE.BoxGeometry(0.32, 0.16, 0.22);
  part(bike, basketGeo, mats.wicker, 0, 0.92, 0.72);
  // Basket rim
  part(bike, new THREE.BoxGeometry(0.34, 0.02, 0.24), mats.frame, 0, 1.0, 0.72);
  // Basket weave slats
  for (let i = -2; i <= 2; i++) {
    part(bike, new THREE.BoxGeometry(0.33, 0.01, 0.006), mats.woodDark, 0, 0.92 + i * 0.035, 0.72 + 0.112);
  }
  // Basket support struts
  for (const s of [1, -1]) {
    tube(bike, V(s * 0.05, 0.95, 0.4), V(s * 0.14, 0.84, 0.6), 0.008, mats.chrome, 6);
  }

  // ---------- Rear rack and wooden crate ----------
  for (const s of [1, -1]) {
    tube(bike, V(s * 0.02, seatTop.y - 0.05, seatTop.z - 0.02), V(s * 0.08, 0.66, -0.52), 0.007, mats.chrome, 6);
  }
  part(bike, new THREE.BoxGeometry(0.2, 0.012, 0.28), mats.chrome, 0, 0.66, -0.52);
  // Crate body
  part(bike, new THREE.BoxGeometry(0.2, 0.14, 0.26), mats.wood, 0, 0.74, -0.52);
  // Slat detail on crate
  for (let i = 0; i < 4; i++) {
    part(bike, new THREE.BoxGeometry(0.206, 0.012, 0.012), mats.woodDark, 0, 0.67 + i * 0.04, -0.52 + 0.134);
    part(bike, new THREE.BoxGeometry(0.206, 0.012, 0.012), mats.woodDark, 0, 0.67 + i * 0.04, -0.52 - 0.134);
  }
  // Crate lid strap
  part(bike, new THREE.BoxGeometry(0.02, 0.005, 0.27), mats.brass, 0.03, 0.815, -0.52);
  part(bike, new THREE.BoxGeometry(0.02, 0.005, 0.27), mats.brass, -0.03, 0.815, -0.52);

  // ---------- Rear reflector ----------
  part(bike, new THREE.BoxGeometry(0.06, 0.04, 0.012), mats.lens, 0, 0.5, -0.65).material = mats.dark;

  return bike;
}
```