```ts
import * as THREE from "three";

export const meta = {
  name: "Hot-Air Balloon",
  description:
    "A striped hot-air balloon about to lift off: a patterned envelope, a glowing burner at the mouth, rope rigging to a wicker basket with sandbags and a pennant flag.",
};

export default function createHotAirBalloon(): THREE.Object3D {
  const root = new THREE.Group();

  // ---- materials (one per colour, shared) ----
  const cache = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (
    color: number,
    roughness = 0.6,
    extra: Partial<THREE.MeshStandardMaterialParameters> = {}
  ): THREE.MeshStandardMaterial => {
    const key = `${color}|${roughness}|${JSON.stringify(extra)}`;
    let m = cache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness, ...extra });
      cache.set(key, m);
    }
    return m;
  };

  const SUN = 0xf6c324;
  const TOMATO = 0xe0412b;
  const SKY = 0x5ab8e8;
  const NAVY = 0x1e3a5f;
  const CREAM = 0xf5ebd0;
  const WICKER = 0xb07b43;
  const WICKER_DARK = 0x7a4f2a;
  const WICKER_LIGHT = 0xcb9a5e;
  const METAL = 0x5a5f66;
  const ROPE = 0xd8c49a;
  const SANDBAG = 0xd9b77e;
  const TANK = 0x3c8d4f;

  const addMesh = (
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = root
  ): THREE.Mesh => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };

  // A thin cylinder stretched between two points.
  const link = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    r: number,
    m: THREE.Material,
    parent: THREE.Object3D = root
  ) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 5), m);
    o.position.copy(a).addScaledVector(dir, 0.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    parent.add(o);
    return o;
  };

  // ---- envelope ----
  const Y0 = 4.3; // mouth height
  const H = 15; // envelope height
  const RMAX = 5.4; // widest radius
  const RM = 1.3; // mouth radius

  const envR = (t: number): number => {
    const u = Math.pow(t, 1.4);
    const s = Math.max(0, Math.sin(Math.PI * u));
    const r = RMAX * Math.pow(s, 0.7);
    const k = Math.min(1, t / 0.14);
    const s2 = k * k * (3 - 2 * k);
    return Math.max(0.0001, RM + (r - RM) * s2);
  };

  const profile: THREE.Vector2[] = [];
  const PROFILE_STEPS = 60;
  for (let i = 0; i <= PROFILE_STEPS; i++) {
    const t = i / PROFILE_STEPS;
    profile.push(new THREE.Vector2(envR(t), Y0 + t * H));
  }

  const stripeColors = [SUN, TOMATO, SKY];
  const STRIPES = 12;
  const step = (Math.PI * 2) / STRIPES;
  const envelope = new THREE.Group();
  root.add(envelope);
  for (let i = 0; i < STRIPES; i++) {
    const geo = new THREE.LatheGeometry(profile, 4, i * step, step);
    const m = mat(stripeColors[i % 3], 0.55, { side: THREE.DoubleSide });
    envelope.add(new THREE.Mesh(geo, m));
  }

  // Patterned band around the middle: navy ring with diamond tiles.
  const bandT = 0.44;
  const bandR = envR(bandT) + 0.05;
  const bandY = Y0 + bandT * H;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(bandR, 0.07, 6, 36),
    mat(NAVY, 0.5)
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = bandY;
  envelope.add(ring);

  const TILES = 24;
  for (let k = 0; k < TILES; k++) {
    const phi = (k * Math.PI * 2) / TILES;
    const g = new THREE.Group();
    g.position.set(bandR * Math.sin(phi), bandY, bandR * Math.cos(phi));
    g.rotation.y = phi;
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.72, 0.12),
      mat(k % 2 === 0 ? CREAM : NAVY, 0.5)
    );
    tile.rotation.z = Math.PI / 4;
    g.add(tile);
    envelope.add(g);
  }

  // ---- burner and mouth ----
  const metal = mat(METAL, 0.4, { metalness: 0.6 });
  const mouthHoop = new THREE.Mesh(new THREE.TorusGeometry(RM, 0.05, 6, 24), metal);
  mouthHoop.rotation.x = Math.PI / 2;
  mouthHoop.position.y = Y0;
  root.add(mouthHoop);

  addMesh(new THREE.CylinderGeometry(0.32, 0.32, 0.5, 10), metal, 0, 3.65, 0);
  addMesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 10), metal, 0, 3.92, 0);

  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xff8a2a,
    emissive: 0xff5a00,
    emissiveIntensity: 2.2,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffe08a,
    emissive: 0xffc23a,
    emissiveIntensity: 3,
    roughness: 0.3,
  });
  addMesh(new THREE.ConeGeometry(0.26, 0.7, 8, 1, true), flameMat, 0, 4.25, 0);
  addMesh(new THREE.ConeGeometry(0.13, 0.5, 6), coreMat, 0, 4.05, 0);

  // ---- basket ----
  const HX = 0.55;
  const HZ = 0.42;
  const BH = 1.0;
  const T = 0.05;

  const basket = new THREE.Group();
  root.add(basket);

  // floor
  addMesh(new THREE.BoxGeometry(2 * HX, 0.05, 2 * HZ), mat(WICKER_DARK, 0.9), 0, 0.025, 0, basket);

  // solid core walls (open top so the tanks show)
  const wallMat = mat(WICKER_DARK, 0.9);
  addMesh(new THREE.BoxGeometry(2 * HX, BH, T), wallMat, 0, BH / 2, HZ, basket);
  addMesh(new THREE.BoxGeometry(2 * HX, BH, T), wallMat, 0, BH / 2, -HZ, basket);
  addMesh(new THREE.BoxGeometry(T, BH, 2 * HZ), wallMat, HX, BH / 2, 0, basket);
  addMesh(new THREE.BoxGeometry(T, BH, 2 * HZ), wallMat, -HX, BH / 2, 0, basket);

  // woven rods and stakes on each wall
  const rowHeights = [0.12, 0.26, 0.4, 0.54, 0.68, 0.82, 0.96];
  const weave = (isFront: boolean, sign: number) => {
    const L = isFront ? 2 * HX : 2 * HZ;
    const off = isFront ? HZ : HX;
    rowHeights.forEach((h, i) => {
      const m = i % 2 === 0 ? mat(WICKER, 0.9) : mat(WICKER_LIGHT, 0.9);
      const size = isFront
        ? new THREE.BoxGeometry(L + 0.04, 0.08, 0.04)
        : new THREE.BoxGeometry(0.04, 0.08, L + 0.04);
      const pos = isFront
        ? [0, h, sign * (off + 0.03)]
        : [sign * (off + 0.03), h, 0];
      addMesh(size, m, pos[0], pos[1], pos[2], basket);
    });
    const stakeMat = mat(WICKER_DARK, 0.9);
    for (let s = -3; s <= 3; s++) {
      const a = (s / 3) * (L / 2) * 0.9;
      const geo = isFront
        ? new THREE.BoxGeometry(0.035, BH, 0.04)
        : new THREE.BoxGeometry(0.04, BH, 0.035);
      const pos = isFront ? [a, BH / 2, sign * (off + 0.04)] : [sign * (off + 0.04), BH / 2, a];
      addMesh(geo, stakeMat, pos[0], pos[1], pos[2], basket);
    }
  };
  weave(true, 1);
  weave(true, -1);
  weave(false, 1);
  weave(false, -1);

  // rim
  const rimMat = mat(0xe7c48e, 0.85);
  addMesh(new THREE.BoxGeometry(2 * HX + 0.12, 0.08, 0.08), rimMat, 0, BH + 0.04, HZ + 0.02, basket);
  addMesh(new THREE.BoxGeometry(2 * HX + 0.12, 0.08, 0.08), rimMat, 0, BH + 0.04, -(HZ + 0.02), basket);
  addMesh(new THREE.BoxGeometry(0.08, 0.08, 2 * HZ + 0.12), rimMat, HX + 0.02, BH + 0.04, 0, basket);
  addMesh(new THREE.BoxGeometry(0.08, 0.08, 2 * HZ + 0.12), rimMat, -(HX + 0.02), BH + 0.04, 0, basket);

  // gas tanks standing inside the basket
  const tankMat = mat(TANK, 0.45, { metalness: 0.2 });
  [-0.2, 0.2].forEach((x) => {
    addMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12), tankMat, x, 0.35, 0.02, basket);
    addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), metal, x, 0.68, 0.02, basket);
  });

  // burner posts from basket corners up to the burner head
  const corners: [number, number][] = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  corners.forEach(([sx, sz]) => {
    link(
      new THREE.Vector3(sx * 0.5, BH, sz * 0.36),
      new THREE.Vector3(sx * 0.32, 3.4, sz * 0.3),
      0.03,
      metal
    );
  });

  // ropes from basket corners to the mouth ring
  const ropeMat = mat(ROPE, 0.9);
  const RING_R = RM - 0.05;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    const basketPt = new THREE.Vector3(
      Math.sign(cx) * HX,
      BH + 0.02,
      Math.sign(cz) * HZ
    );
    const mouthPt = new THREE.Vector3(RING_R * cx, Y0, RING_R * cz);
    link(basketPt, mouthPt, 0.025, ropeMat);
  }

  // sandbags hanging from the basket sides
  const bagMat = mat(SANDBAG, 1.0);
  const tieMat = mat(0x8a6a3c, 0.9);
  const sandbag = (x: number, y: number, z: number) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const bag = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), bagMat);
    bag.scale.set(0.2, 0.14, 0.12);
    g.add(bag);
    const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), tieMat);
    tie.position.y = 0.15;
    g.add(tie);
    root.add(g);
  };
  sandbag(0.18, 0.6, 0.5);
  link(new THREE.Vector3(0.18, BH, HZ), new THREE.Vector3(0.18, 0.74, 0.47), 0.02, ropeMat);
  sandbag(-0.67, 0.6, 0.1);
  link(new THREE.Vector3(-HX, BH, 0.1), new THREE.Vector3(-0.67, 0.74, 0.1), 0.02, ropeMat);

  // pennant flag on one basket corner
  const poleX = -HX;
  const poleZ = -HZ;
  addMesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), metal, poleX, BH + 0.6, poleZ);
  const flagGeo = new THREE.PlaneGeometry(0.5, 0.3, 6, 3);
  const fp = flagGeo.attributes.position;
  for (let i = 0; i < fp.count; i++) {
    const x = fp.getX(i);
    fp.setZ(i, 0.03 * Math.sin((x + 0.25) * 9) * (x + 0.25));
  }
  flagGeo.computeVertexNormals();
  const flag = new THREE.Mesh(
    flagGeo,
    mat(TOMATO, 0.7, { side: THREE.DoubleSide })
  );
  flag.position.set(poleX + 0.27, BH + 1.0, poleZ);
  root.add(flag);
  const flagStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.08, 0.01),
    mat(SUN, 0.7)
  );
  flagStripe.position.set(poleX + 0.27, BH + 0.92, poleZ + 0.005);
  flagStripe.rotation.z = 0;
  root.add(flagStripe);

  return root;
}
```