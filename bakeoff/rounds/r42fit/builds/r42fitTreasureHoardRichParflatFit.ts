import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Dragon's Hoard",
  "description": "A stylized League of Legends-style treasure hoard: an open iron-bound chest spilling a mound of gold coins and gems, a jeweled crown on top, and gilded goblets scattered around."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  woodDark: "#4a2a1a",
  woodMid: "#7a4a2a",
  woodLight: "#a56a3a",
  iron: "#2b2f3a",
  ironLight: "#59607a",
  gold: "#f2b632",
  goldLight: "#ffe27a",
  goldDark: "#a8731a",
  outline: "#2a1608",
  velvet: "#6a1f5c",
  crimson: "#c4223a",
  ruby: "#ff3b5c",
  sapphire: "#2f7bff",
  emerald: "#2fe08a",
  amethyst: "#a65bff",
  diamond: "#bff6ff",
  silver: "#cfd6e4",
  floorShadow: "#3a2a22",
};
const M = {
  chestCenter: [0, 0, -0.45] as [number, number, number],
  chestRim: [0, 0.62, -0.45] as [number, number, number],
  lidHinge: [0, 0.62, -0.85] as [number, number, number],
  moundPeak: [0, 0.95, -0.15] as [number, number, number],
  crownSeat: [0, 0.98, -0.1] as [number, number, number],
  goblet1Base: [0.8, 0, 0.55] as [number, number, number],
  goblet2Base: [-0.75, 0.12, 0.5] as [number, number, number],
  goblet3Base: [0.7, 0.1, -0.75] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chest
  (() => {
function buildChest({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cx = 0, cz = -0.45;
  const W = 1.1, D = 0.8, H = 0.62;
  const zf = cz + D / 2, zb = cz - D / 2;

  // body shell: floor, four walls
  box(W, 0.06, D, P.woodDark, [cx, 0.03, cz]);
  box(W, H, 0.06, P.woodMid, [cx, H / 2, zf - 0.03]);
  box(W, H, 0.06, P.woodMid, [cx, H / 2, zb + 0.03]);
  for (const s of [1, -1]) box(0.06, H, D, P.woodMid, [s * (W / 2 - 0.03), H / 2, cz]);
  // velvet lining
  box(W - 0.12, 0.04, D - 0.12, P.velvet, [cx, 0.5, cz]);
  box(W - 0.12, 0.06, D - 0.12, P.velvet, [cx, 0.08, cz]);
  // plank seams and highlights
  for (let i = 1; i < 4; i++) {
    const y = (H / 4) * i;
    box(W + 0.005, 0.012, 0.005, P.woodDark, [cx, y, zf + 0.002]);
    box(W + 0.005, 0.012, 0.005, P.woodDark, [cx, y, zb - 0.002]);
    for (const s of [1, -1]) box(0.005, 0.012, D, P.woodDark, [s * (W / 2 + 0.002), y, cz]);
    box(W - 0.2, 0.01, 0.006, P.woodLight, [cx, y + 0.05, zf + 0.004]);
  }
  // gold rim trim
  box(W + 0.04, 0.035, 0.05, P.gold, [cx, H, zf]);
  box(W + 0.04, 0.035, 0.05, P.gold, [cx, H, zb]);
  for (const s of [1, -1]) box(0.05, 0.035, D, P.gold, [s * W / 2, H, cz]);
  box(W, 0.012, 0.012, P.goldLight, [cx, H + 0.02, zf + 0.02]);

  // iron bands, brackets, rivets
  for (const x of [-0.35, 0.35]) {
    box(0.09, H, 0.02, P.iron, [x, H / 2, zf + 0.005]);
    box(0.09, H, 0.02, P.iron, [x, H / 2, zb - 0.005]);
    for (const y of [0.1, 0.3, 0.5]) {
      b.part(new THREE.SphereGeometry(0.015, 6, 4), P.ironLight, { at: [x, y, zf + 0.02] });
    }
  }
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.1, H + 0.02, 0.1, P.iron, [sx * (W / 2 - 0.02), H / 2, cz + sz * (D / 2 - 0.02)]);
    b.part(new THREE.OctahedronGeometry(0.045), P.gold, { at: [sx * (W / 2), 0.04, cz + sz * D / 2] });
    b.part(new THREE.OctahedronGeometry(0.045), P.gold, { at: [sx * (W / 2), H + 0.03, cz + sz * D / 2] });
  }
  // feet
  for (const sx of [1, -1]) for (const sz of [1, -1])
    box(0.1, 0.04, 0.1, P.outline, [sx * 0.48, 0.02, cz + sz * 0.32]);

  // lock plate + gem
  box(0.16, 0.2, 0.03, P.gold, [cx, H - 0.1, zf + 0.02]);
  box(0.12, 0.016, 0.034, P.goldLight, [cx, H - 0.02, zf + 0.022]);
  box(0.03, 0.06, 0.036, P.outline, [cx, H - 0.15, zf + 0.025]);
  b.part(new THREE.OctahedronGeometry(0.05), P.ruby, { at: [cx, H - 0.08, zf + 0.06], scale: [1, 1.3, 0.8] });

  // open lid hinged at lidHinge, thrown back ~110deg
  const hinge = new THREE.Vector3(...M.lidHinge);
  const ang = (110 * Math.PI) / 180;
  const lidBuilder = (geo: THREE.BufferGeometry, c: string, local: number[], rot: number[] = [0, 0, 0]) => {
    // local: x, y(up from hinge, lid closed), z (forward from hinge)
    const y = local[1], z = 0.02 + (local[2] - 0.02) * 0.55;
    geo.scale(1, 1, 0.55);
    // rotate about X by -ang (opening backwards)
    const cy = Math.cos(ang), sy = Math.sin(ang);
    const ny = y * cy + z * sy;
    const nz = -y * sy + z * cy;
    b.part(geo, c, { at: [local[0], hinge.y + ny, hinge.z + nz], rotation: [rot[0] - 110, rot[1], rot[2]] });
  };
  const lidArch = new THREE.CylinderGeometry(0.4, 0.4, W, 10, 1, false, 0, Math.PI);
  lidArch.rotateZ(Math.PI / 2);
  lidArch.rotateX(Math.PI / 2);
  // arch: half cylinder along X, bulging up when closed
  const arch = new THREE.CylinderGeometry(0.4, 0.4, W, 10, 1, false, -Math.PI / 2, Math.PI);
  arch.rotateZ(Math.PI / 2);
  arch.scale(1, 0.55, 1);
  lidBuilder(arch, P.woodMid, [cx, 0, 0.4]);
  // lid bands
  for (const x of [-0.35, 0.35]) {
    const band = new THREE.CylinderGeometry(0.415, 0.415, 0.09, 10, 1, true, -Math.PI / 2, Math.PI);
    band.rotateZ(Math.PI / 2);
    band.scale(1, 0.55, 1);
    lidBuilder(band, P.iron, [x, 0, 0.4]);
  }
  // lid velvet underside + side caps + front trim
  lidBuilder(new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.1), P.velvet, [cx, 0.01, 0.4]);
  for (const s of [1, -1]) lidBuilder(new THREE.BoxGeometry(0.05, 0.02, D), P.gold, [s * W / 2, 0.01, 0.4]);
  lidBuilder(new THREE.BoxGeometry(W + 0.04, 0.04, 0.05), P.gold, [cx, 0.01, 0.78]);
  lidBuilder(new THREE.BoxGeometry(W + 0.04, 0.04, 0.05), P.gold, [cx, 0.01, 0.02]);
  for (const x of [-0.35, 0.35]) for (const t of [0.15, 0.3]) {
    lidBuilder(new THREE.SphereGeometry(0.016, 6, 4), P.ironLight, [x, 0.22 * (1 - t) + 0.12, 0.4 + (t - 0.2) * 1.4]);
  }
  // hinge barrel
  b.part(new THREE.CylinderGeometry(0.025, 0.025, W, 8), P.iron, { at: [cx, H, zb - 0.01], rotation: [0, 0, 90] });
  for (const x of [-0.45, 0, 0.45]) b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 8), P.ironLight, { at: [x, H, zb - 0.01], rotation: [0, 0, 90] });
  void R; void frame; void J;
}
    return buildChest;
  })(),
  // coinMound
  (() => {
function buildCoinMound({ b, J, P, M }: any) {
  const r = rng(11);
  const golds = [P.gold, P.goldLight, P.goldDark, P.gold];
  const coinGeo = new THREE.CylinderGeometry(1, 1, 1, 10);

  // heap height field (x,z) -> y
  const H = (x: number, z: number) => {
    const dx = x / 1.05, dz = (z - 0.1) / 0.95;
    const d = Math.sqrt(dx * dx + dz * dz);
    let h = 0.98 * Math.max(0, 1 - d * d * 0.95) ;
    if (z < -0.5) h = Math.max(h, 0.8 * (1 - Math.abs(x) / 1.1));
    return Math.max(0, h);
  };

  // core faceted mound body
  const core = new THREE.ConeGeometry(1, 1, 9);
  b.part(core, P.goldDark, { at: [0, 0.4, 0.1], scale: [1.0, 0.8, 0.85] });
  b.part(core, P.goldDark, { at: [0, 0.38, -0.4], scale: [0.85, 0.76, 0.38] });
  b.part(new THREE.ConeGeometry(1, 1, 8), P.gold, { at: [0.55, 0.15, 0.55], scale: [0.55, 0.3, 0.45] });
  b.part(new THREE.ConeGeometry(1, 1, 8), P.gold, { at: [-0.6, 0.15, 0.5], scale: [0.5, 0.3, 0.42] });

  // layered coins on the surface
  let n = 0;
  while (n < 150) {
    const x = (r() * 2 - 1) * 1.1;
    const z = -0.7 + r() * 1.6;
    const h = H(x, z);
    if (h < 0.05) continue;
    const rad = 0.06 + r() * 0.05;
    const slope = 0.5;
    const c = b.part(coinGeo, golds[Math.floor(r() * 4)], {
      at: [x, h * 0.82 + 0.02, z],
      scale: [rad, 0.018, rad],
      rotation: [(r() - 0.5) * 60 + (z > 0.1 ? 25 * slope : 0), r() * 360, (r() - 0.5) * 60],
    });
    n++;
  }
  // coin rims (dark outline) on a few
  for (let i = 0; i < 20; i++) {
    const x = (r() * 2 - 1) * 0.9, z = -0.3 + r() * 1.1;
    const h = H(x, z);
    b.part(new THREE.CylinderGeometry(1, 1, 0.01, 10), P.outline, {
      at: [x, h * 0.82 + 0.005, z], scale: [0.075, 1, 0.075], rotation: [(r() - 0.5) * 30, r() * 360, 0],
    });
  }

  // floor coins spilling
  for (let i = 0; i < 24; i++) {
    const a = r() * Math.PI * 2, d = 0.85 + r() * 0.3;
    const x = Math.cos(a) * d * 1.05, z = 0.1 + Math.sin(a) * d * 0.8;
    if (z < -0.5) continue;
    b.part(coinGeo, golds[i % 3], { at: [x, 0.02, z], scale: [0.07, 0.017, 0.07], rotation: [0, r() * 360, (r() - 0.5) * 10] });
  }
  // upright coin stacks
  const stacks: [number, number, number][] = [[0.95, 0.55, 5], [-0.95, 0.25, 7], [0.35, 0.95, 4], [-0.4, 0.85, 6]];
  for (const [sx, sz, k] of stacks)
    for (let i = 0; i < k; i++)
      b.part(coinGeo, golds[(i + 1) % 3], {
        at: [sx + (r() - 0.5) * 0.015, 0.02 + i * 0.036, sz + (r() - 0.5) * 0.015],
        scale: [0.08, 0.018, 0.08], rotation: [0, r() * 90, 0],
      });
  // rolling coins on edge
  for (const [x, z, ry] of [[0.6, 0.85, 30], [-0.3, 0.95, -50], [1.05, 0.1, 80]] as number[][]) {
    b.part(coinGeo, P.goldLight, { at: [x, 0.08, z], scale: [0.08, 0.018, 0.08], rotation: [0, ry, 90] });
    b.part(coinGeo, P.outline, { at: [x, 0.08, z], scale: [0.07, 0.02, 0.07], rotation: [0, ry, 90] });
  }

  // gems
  const gemDefs: [string, number, number, number, number][] = [
    [P.ruby, 0.35, 0.55, 0.62, 0.11], [P.sapphire, -0.45, 0.5, 0.5, 0.1],
    [P.emerald, 0.8, 0.2, 0.3, 0.09], [P.amethyst, -0.85, 0.65, 0.2, 0.1],
    [P.diamond, 0.05, 0.75, 0.45, 0.08], [P.ruby, -0.15, 0.4, 0.8, 0.07],
    [P.emerald, -0.6, 0.15, 0.75, 0.08], [P.sapphire, 0.7, 0.9, 0.15, 0.07],
    [P.amethyst, 0.5, 0.0, 0.85, 0.07], [P.diamond, -0.9, 0.1, -0.1, 0.07],
    [P.ruby, 0.95, -0.3, 0.25, 0.08], [P.sapphire, -0.2, 0.05, 0.95, 0.06],
  ];
  for (const [col, x, y0, z, s] of gemDefs) {
    const zz = z, h = Math.max(H(x, zz) * 0.8, y0 > 0.3 ? y0 * 0.7 : 0.04);
    const g = b.part(new THREE.OctahedronGeometry(1, 0), col, {
      at: [x, h + s * 0.7, zz], scale: [s, s * 1.3, s], rotation: [r() * 40, r() * 360, r() * 40], flat: true,
    });
    glow(g, 1.2);
    b.part(new THREE.OctahedronGeometry(1, 0), P.goldLight, { at: [x - s * 0.2, h + s * 1.4, zz + s * 0.1], scale: [s * 0.2, s * 0.25, s * 0.2] });
  }

  // pearl string draped on front
  const pearls = 16;
  for (let i = 0; i < pearls; i++) {
    const t = i / (pearls - 1);
    const x = -0.7 + t * 1.2, z = 0.55 + Math.sin(t * Math.PI) * 0.25;
    const y = H(x, z) * 0.82 + 0.06;
    b.part(new THREE.SphereGeometry(0.028, 6, 5), "#f4efe6", { at: [x, y, z] });
  }

  // rings
  const rings: [number, number, number, string][] = [[0.2, 0.25, 0.9, P.ruby], [-0.7, 0.3, 0.7, P.emerald], [0.9, 0.2, 0.45, P.sapphire]];
  for (const [x, , z, gc] of rings) {
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 10), P.goldLight, { at: [x, 0.05, z], rotation: [80, r() * 60, 0] });
    glow(b.part(new THREE.OctahedronGeometry(0.02, 0), gc, { at: [x, 0.1, z] }), 1.2);
  }
}
    return buildCoinMound;
  })(),
  // crown
  (() => {
function buildCrown({ b, J, P, M }: Ctx) {
  const seat = M.crownSeat;
  const TILT = 0.12;
  const R = 0.23; // band radius
  const H = 0.13; // band height
  const base = seat[1] + 0.02;
  const root = new THREE.Group();
  root.position.set(seat[0], base, seat[2]);
  root.rotation.set(TILT, 0, -0.08);
  b.root.add(root);

  const put = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, flat = true) => {
    const m = new THREE.Mesh(geo, b.material ? b.material(color) : new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, flatShading: flat }));
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    root.add(m);
    return m;
  };
  const mat = (color: string, glow = 0) =>
    new THREE.MeshStandardMaterial({
      color, roughness: 0.55, metalness: 0.15, flatShading: true,
      emissive: glow ? color : "#000000", emissiveIntensity: glow,
    });
  const add = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, rot: [number, number, number] = [0, 0, 0], glow = 0, sc: [number, number, number] = [1, 1, 1]) => {
    const m = new THREE.Mesh(geo, mat(color, glow));
    m.position.set(x, y, z);
    m.rotation.set(rot[0], rot[1], rot[2]);
    m.scale.set(sc[0], sc[1], sc[2]);
    root.add(m);
    return m;
  };

  // Band: 10-sided gold tube, outline rings top and bottom
  add(new THREE.CylinderGeometry(R, R * 0.97, H, 10, 1, true), P.gold, 0, H / 2, 0);
  add(new THREE.CylinderGeometry(R - 0.01, R * 0.96 - 0.01, H, 10, 1, true).scale(-1, 1, 1), P.goldDark, 0, H / 2, 0);
  for (const y of [0.01, H - 0.01]) {
    add(new THREE.TorusGeometry(R + 0.004, 0.012, 4, 10), P.goldDark, 0, y, 0, [Math.PI / 2, 0, 0]);
  }
  add(new THREE.TorusGeometry(R + 0.006, 0.006, 4, 10), P.goldLight, 0, H - 0.028, 0, [Math.PI / 2, 0, 0]);
  add(new THREE.TorusGeometry(R + 0.006, 0.006, 4, 10), P.goldDark, 0, H * 0.5, 0, [Math.PI / 2, 0, 0]);

  // Velvet cap: dome rising inside
  add(new THREE.SphereGeometry(R * 0.96, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.crimson, 0, H - 0.02, 0, [0, 0, 0], 0, [1, 0.95, 1]);
  add(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.03, 10), P.velvet, 0, 0.03, 0);
  // cap top pearl
  add(new THREE.SphereGeometry(0.03, 6, 4), P.diamond, 0, H + R * 0.9, 0, [0, 0, 0], 0.5);
  add(new THREE.CylinderGeometry(0.02, 0.03, 0.03, 6), P.gold, 0, H + R * 0.9 - 0.02, 0);

  // Arches: 7 fleur points around the band
  const N = 7;
  const gems = [P.ruby, P.sapphire, P.emerald, P.amethyst];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const sx = Math.sin(a), cz = Math.cos(a);
    const front = i === 0;
    const h = front ? 0.27 : 0.22;
    const px = sx * R, pz = cz * R;
    const lean = 0.18;
    // main spike (cone), leaning outward slightly
    const spike = add(new THREE.ConeGeometry(0.052, h, 4), P.gold, px, H + h / 2 - 0.01, pz, [0, 0, 0]);
    spike.rotation.set(cz * lean, a, -sx * lean * 0 );
    spike.rotateY(Math.PI / 4);
    // highlight bar
    add(new THREE.BoxGeometry(0.012, h * 0.7, 0.012), P.goldLight, px + sx * 0.03, H + h * 0.4, pz + cz * 0.03, [cz * lean, a, 0]);
    // side fleur petals
    for (const s of [1, -1]) {
      const tx = px + Math.cos(a) * s * 0.055, tz = pz - Math.sin(a) * s * 0.055;
      add(new THREE.ConeGeometry(0.028, 0.085, 4), P.goldDark, tx, H + 0.04, tz, [0, a, s * 0.5]);
      add(new THREE.OctahedronGeometry(0.02, 0), P.goldLight, tx, H + 0.085, tz);
    }
    // tip gem or pearl
    const tipY = H + h + 0.005;
    const tx = px + sx * lean * h * 0.5, tz2 = pz + cz * lean * h * 0.5;
    if (i % 2 === 0) add(new THREE.SphereGeometry(0.034, 6, 4), P.diamond, tx, tipY + 0.02, tz2, [0, 0, 0], 0.6);
    else add(new THREE.OctahedronGeometry(0.04, 0), gems[i % 4], tx, tipY + 0.02, tz2, [0, 0, 0], 0.9, [1, 1.4, 1]);
    // band inlay gems between points and rivets
    const b2 = a + Math.PI / N;
    const gx = Math.sin(b2) * (R + 0.012), gz = Math.cos(b2) * (R + 0.012);
    add(new THREE.OctahedronGeometry(0.03, 0), gems[(i + 1) % 4], gx, H * 0.5, gz, [0, b2, 0], 0.8, [1, 1.2, 0.5]);
    for (const dy of [0.04, -0.04]) {
      const rx = Math.sin(a) * (R + 0.008), rz = Math.cos(a) * (R + 0.008);
      add(new THREE.SphereGeometry(0.01, 4, 3), P.goldLight, rx, H * 0.5 + dy * 1.1, rz);
    }
  }

  // Big central ruby on the front, ringed by gold bezel
  add(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 8), P.goldDark, 0, H * 0.5, R + 0.012, [Math.PI / 2, 0, 0]);
  add(new THREE.OctahedronGeometry(0.052, 0), P.ruby, 0, H * 0.5, R + 0.03, [0, 0, 0], 1.1, [1, 1.2, 0.6]);
  // flanking sapphire and emerald on the front band
  for (const s of [1, -1]) {
    const a = s * 0.55;
    add(new THREE.OctahedronGeometry(0.03, 0), s > 0 ? P.sapphire : P.emerald, Math.sin(a) * (R + 0.02), H * 0.5, Math.cos(a) * (R + 0.02), [0, a, 0], 1, [1, 1.3, 0.6]);
  }
}
    return buildCrown;
  })(),
  // goblets
  (() => {
function buildGoblets({ b, P, M }: any) {
  const R = rng(11);
  const flat = (g: THREE.BufferGeometry) => g;

  // Lathe helper: profile of [radius, height], spun around +Y, placed with optional tilt.
  const lathe = (prof: number[][], at: number[], color: string, opts: any = {}) => {
    const pts = prof.map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(pts, opts.seg ?? 8);
    return b.part(g, color, { at, flat: true, ...(opts.rot ? { rotation: opts.rot } : {}) });
  };
  const gem = (at: number[], color: string, s: number, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.OctahedronGeometry(s, 0), color, { at, rotation: rot, flat: true });
  const coin = (at: number[], r: number, color: string, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.014, 10), color, { at, rotation: rot, flat: true });

  // Goblet body in local coords around y axis starting at y=0 on base.
  // Builds an upright goblet and returns nothing; origin = base centre.
  const goblet = (o: number[], scale: number, body: string, trim: string, hi: string, dark: string, g1: string, g2: string, tall: number) => {
    const s = scale;
    const at = (x: number, y: number, z: number) => [o[0] + x * s, o[1] + y * s, o[2] + z * s];
    // flared base
    lathe([[0, 0], [0.13 * s, 0], [0.13 * s, 0.015 * s], [0.07 * s, 0.05 * s], [0.04 * s, 0.07 * s], [0, 0.07 * s]], o, body);
    lathe([[0.125 * s, 0.002 * s], [0.135 * s, 0.002 * s], [0.135 * s, 0.02 * s], [0.125 * s, 0.02 * s]], [o[0], o[1] + 0.005 * s, o[2]], dark);
    // stem
    const stemH = 0.2 * tall * s;
    b.part(new THREE.CylinderGeometry(0.025 * s, 0.035 * s, stemH, 6), body, { at: at(0, 0.07 + stemH / s / 2, 0), flat: true });
    // knob
    const ky = 0.07 + stemH / s * 0.5;
    b.part(new THREE.IcosahedronGeometry(0.05 * s, 0), trim, { at: at(0, ky + 0.01, 0), flat: true });
    gem(at(0, ky + 0.01, 0.05), g1, 0.016 * s);
    // cup
    const cy = 0.07 + stemH / s;
    const ch = 0.2 * tall;
    lathe([[0, 0], [0.04 * s, 0.01 * s], [0.12 * s, 0.07 * s * tall], [0.15 * s, ch * s], [0.14 * s, ch * s], [0.11 * s, 0.08 * s * tall], [0.0, 0.03 * s]], at(0, cy, 0), body, { seg: 8 });
    // inner dark
    lathe([[0, 0.02 * s], [0.14 * s, (ch - 0.01) * s], [0, (ch - 0.01) * s]], at(0, cy + 0.003, 0), dark, { seg: 8 });
    // rim highlight
    b.part(new THREE.TorusGeometry(0.147 * s, 0.008 * s, 4, 8), hi, { at: at(0, cy + ch, 0), rotation: [90, 0, 0], flat: true });
    // dark band + jewel band
    b.part(new THREE.TorusGeometry(0.1 * s, 0.01 * s, 4, 8), dark, { at: at(0, cy + ch * 0.4, 0), rotation: [90, 0, 0], flat: true });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rr = 0.123 * s;
      gem(at(Math.sin(a) * rr / s, cy / s + ch * 0.55, Math.cos(a) * rr / s), i % 2 ? g1 : g2, 0.014 * s, [0, a * 57, 0]);
    }
  };

  // 1) upright gold goblet
  const m1 = M.goblet1Base;
  goblet(m1, 1.35, P.gold, P.goldDark, P.goldLight, P.outline, P.ruby, P.emerald, 1.1);

  // 3) tall chalice
  const m3 = M.goblet3Base;
  goblet([m3[0], 0, m3[2]], 1.2, P.gold, P.goldDark, P.goldLight, P.outline, P.sapphire, P.emerald, 1.0);
  // big inset gems on chalice cup
  const c3y = 0.4;
  gem([m3[0], c3y, m3[2] + 0.16], P.sapphire, 0.05);
  gem([m3[0] + 0.12, c3y - 0.05, m3[2] + 0.11], P.emerald, 0.04);

  // 2) tipped-over silver goblet lying on its side, axis along -X direction, mouth toward +Z-ish
  const o2 = [M.goblet2Base[0], 0.17, M.goblet2Base[2]];

  // build in sideways orientation manually: axis along X (mouth toward -X, outward right)
  const dirX = -1;
  const ax = (d: number, y = 0, z = 0) => [o2[0] + dirX * d, o2[1] + y, o2[2] + z];
  const rotZ = [0, 0, 90 * (dirX > 0 ? -1 : 1) * -1];
  lathe([[0, 0], [0.12, 0], [0.12, 0.015], [0.065, 0.05], [0.035, 0.07], [0, 0.07]], ax(0.36), P.silver, { rot: [0, 0, -90 * dirX] });
  b.part(new THREE.CylinderGeometry(0.022, 0.03, 0.2, 6), P.silver, { at: ax(0.2), rotation: [0, 0, 90], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.045, 0), P.gold, { at: ax(0.14), flat: true });
  lathe([[0, 0], [0.04, 0.01], [0.11, 0.07], [0.14, 0.2], [0.13, 0.2], [0.1, 0.08], [0, 0.03]], ax(0.1), P.silver, { rot: [0, 0, 90 * dirX * -1 + (dirX > 0 ? 0 : 0)] });
  void rotZ;
  b.part(new THREE.TorusGeometry(0.135, 0.008, 4, 8), P.goldLight, { at: ax(-0.1), rotation: [0, 90, 0], flat: true });
  b.part(new THREE.TorusGeometry(0.1, 0.01, 4, 8), P.goldDark, { at: ax(0.0), rotation: [0, 90, 0], flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    gem(ax(-0.02, Math.sin(a) * 0.11, Math.cos(a) * 0.11), i % 2 ? P.ruby : P.amethyst, 0.014);
  }
  // spilled coins from mouth
  const cols = [P.gold, P.goldLight, P.goldDark];
  for (let i = 0; i < 16; i++) {
    const d = -0.12 - R() * 0.4;
    const z = (R() - 0.5) * 0.3;
    coin(ax(d, 0.012 + (i % 3) * 0.012 * (d > -0.25 ? 1 : 0.2), z), 0.04 + R() * 0.015, cols[i % 3], [R() * 20, R() * 360, R() * 16]);
  }

  // Dagger on floor near front
  const dx = -0.15, dz = 0.7;
  const ang = 20;
  const lay = (x: number, y: number, z: number): number[] => {
    const a = ang * Math.PI / 180;
    return [dx + x * Math.cos(a) + z * Math.sin(a), y, dz - x * Math.sin(a) + z * Math.cos(a)];
  };
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.42), P.silver, { at: lay(0, 0.007, 0.0), rotation: [0, ang, 0], flat: true });
  b.part(new THREE.ConeGeometry(0.04, 0.12, 4), P.silver, { at: lay(0, 0.007, 0.27), rotation: [90, ang, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.01, 0.016, 0.38), P.goldLight, { at: lay(0, 0.016, 0.0), rotation: [0, ang, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.03), P.goldDark, { at: lay(0, 0.015, -0.2), rotation: [0, ang, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), P.woodDark, { at: lay(0, 0.02, -0.29), rotation: [90, ang, 0], flat: true });
  gem(lay(0, 0.04, -0.37), P.ruby, 0.03);

  // two plates
  const plate = (x: number, z: number, y: number, tilt: number) => {
    lathe([[0, 0], [0.1, 0.0], [0.16, 0.025], [0.15, 0.03], [0.09, 0.012], [0, 0.012]], [x, y, z], P.silver, { seg: 10, rot: [tilt, 0, 0] });
    b.part(new THREE.TorusGeometry(0.155, 0.006, 4, 10), P.goldLight, { at: [x, y + 0.03, z], rotation: [90 + tilt, 0, 0], flat: true });
    gem([x, y + 0.03, z], P.sapphire, 0.02);
  };
  plate(0.45, 0.72, 0.0, 0);
  plate(0.8, 0.2, 0.0, 6);
  void flat;
}
    return buildGoblets;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dragonHoard" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
