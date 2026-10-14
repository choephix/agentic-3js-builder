```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export const meta = {
  name: "lighthouse",
  description: "A striped lighthouse on a tiny rocky island, with a keeper's cottage, a glowing lantern and a sweeping beam.",
};

const RED = 0xc8362e;
const WHITE = 0xf4f1e8;
const SAND = 0xe8d3a0;
const GRASS = 0x7fae4a;
const ROCK = 0x8a8f96;
const SEA = 0x2f6f8f;
const ROOF = 0x3b3f4a;
const GLASS_GLOW = 0xffe08a;
const DOOR = 0x7a4a2a;
const WINDOW = 0x2c4a63;

const mats = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const key = `${color}|${JSON.stringify(extra)}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.04, ...extra });
    mats.set(key, m);
  }
  return m;
}

function mesh(geo: THREE.BufferGeometry, material: THREE.Material, at: [number, number, number]) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(at[0], at[1], at[2]);
  return m;
}

export default function build() {
  const root = new THREE.Group();
  root.name = "lighthouse";
  const r = rng(7);

  // Sea disc, sunk a touch below the floor line.
  const sea = mesh(new THREE.CylinderGeometry(16, 16, 0.04, 40), mat(SEA, { roughness: 0.3 }), [0, -0.02, 0]);
  sea.name = "sea";
  root.add(sea);

  // Island: a low hemisphere of sand, flattened, sitting on y = 0.
  const islandTop = 0.74;
  const island = new THREE.Mesh(
    new THREE.SphereGeometry(6, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(SAND),
  );
  island.scale.set(1, 0.12, 1);
  island.name = "island";
  root.add(island);

  // Grass cap on the island.
  const grass = mesh(new THREE.CylinderGeometry(4.9, 5.2, 0.05, 16), mat(GRASS), [0, islandTop - 0.02, 0]);
  grass.name = "grass";
  root.add(grass);

  // Rocks ringing the shoreline.
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + r() * 0.3;
    const d = 5.6 + r() * 0.8;
    const s = 0.25 + r() * 0.25;
    const rock = mesh(new THREE.DodecahedronGeometry(s, 0), mat(ROCK), [Math.cos(a) * d, s * 0.4, Math.sin(a) * d]);
    rock.scale.set(1, 0.6 + r() * 0.3, 1);
    rock.rotation.set(r() * 3, r() * 3, r() * 3);
    rock.name = `rock${i}`;
    root.add(rock);
  }

  // Tower: a tapered cylinder built as alternating red and white bands.
  const towerBase = islandTop;
  const towerTop = towerBase + 10;
  const radiusAt = (y: number) => 1.7 - 0.5 * ((y - towerBase) / 10);
  const bands = 8;
  for (let i = 0; i < bands; i++) {
    const y0 = towerBase + (i * 10) / bands;
    const y1 = towerBase + ((i + 1) * 10) / bands;
    const band = mesh(
      new THREE.CylinderGeometry(radiusAt(y1), radiusAt(y0), y1 - y0, 14),
      mat(i % 2 === 0 ? RED : WHITE),
      [0, (y0 + y1) / 2, 0],
    );
    band.name = `band${i}`;
    root.add(band);
  }

  // Door at the base, facing +Z.
  root.add(mesh(new THREE.BoxGeometry(0.5, 0.9, 0.12), mat(DOOR), [0, towerBase + 0.45, 1.68]));

  // Window slits up the tower.
  for (const y of [4.2, 7.0]) {
    const yy = towerBase + y;
    root.add(mesh(new THREE.BoxGeometry(0.28, 0.6, 0.1), mat(WINDOW), [0, yy, radiusAt(yy) + 0.02]));
  }

  // Gallery: a dark deck with a rail ring.
  const galleryY = towerTop + 0.05;
  root.add(mesh(new THREE.CylinderGeometry(1.45, 1.4, 0.14, 16), mat(ROOF), [0, galleryY, 0]));
  const rail = mesh(new THREE.TorusGeometry(1.35, 0.05, 6, 20), mat(WHITE), [0, galleryY + 0.45, 0]);
  rail.rotation.x = Math.PI / 2;
  root.add(rail);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    root.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 5), mat(WHITE), [Math.cos(a) * 1.35, galleryY + 0.22, Math.sin(a) * 1.35]));
  }

  // Lantern room: glowing glass with dark mullions.
  const lanternY = galleryY + 0.07 + 0.75;
  const glass = mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 1.5, 12),
    mat(GLASS_GLOW, { emissive: new THREE.Color(GLASS_GLOW), emissiveIntensity: 1.2, transparent: true, opacity: 0.9 }),
    [0, lanternY, 0],
  );
  glass.name = "lantern";
  root.add(glass);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const m = mesh(new THREE.BoxGeometry(0.07, 1.5, 0.07), mat(ROOF), [Math.cos(a) * 0.86, lanternY, Math.sin(a) * 0.86]);
    m.rotation.y = -a;
    root.add(m);
  }

  // Red cap and finial.
  root.add(mesh(new THREE.ConeGeometry(1.1, 0.9, 12), mat(RED), [0, lanternY + 0.75 + 0.45, 0]));
  root.add(mesh(new THREE.SphereGeometry(0.12, 10, 8), mat(ROOF), [0, lanternY + 0.75 + 0.95, 0]));

  // Light beam: a faint open cone sweeping out toward +Z.
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 0.6, 14, 16, 1, true),
    mat(GLASS_GLOW, { transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, emissive: new THREE.Color(GLASS_GLOW), emissiveIntensity: 0.6 }),
  );
  beam.rotation.x = Math.PI / 2;
  beam.position.set(0, lanternY, 7.5);
  beam.name = "beam";
  root.add(beam);

  // Keeper's cottage beside the tower.
  const cx = -3.4;
  const cz = -0.8;
  root.add(mesh(new THREE.BoxGeometry(2.6, 1.5, 2.0), mat(WHITE), [cx, islandTop + 0.75, cz]));
  const roof = mesh(new THREE.ConeGeometry(1.84, 1.0, 4), mat(RED), [cx, islandTop + 1.5 + 0.5, cz]);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1, 1, 0.8);
  root.add(roof);
  root.add(mesh(new THREE.BoxGeometry(0.4, 0.7, 0.1), mat(DOOR), [cx, islandTop + 0.35, cz + 1.02]));
  root.add(mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), mat(WINDOW), [cx - 0.75, islandTop + 1.0, cz + 1.02]));
  root.add(mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), mat(WINDOW), [cx + 0.75, islandTop + 1.0, cz + 1.02]));

  // A few grass tufts on the island.
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const d = 2.5 + r() * 2.2;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (Math.hypot(x - cx, z - cz) < 2.2 || Math.hypot(x, z) < 2.0) continue;
    root.add(mesh(new THREE.ConeGeometry(0.16, 0.45, 5), mat(GRASS), [x, islandTop + 0.22, z]));
  }

  return root;
}
```