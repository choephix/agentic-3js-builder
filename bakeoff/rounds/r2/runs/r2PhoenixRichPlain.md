```ts
import * as THREE from "three";

export const meta = {
  name: "Rising Phoenix",
  description: "A blocky low-poly phoenix with flung-open feathered wings, flame crest, ribbon tail feathers and drifting embers.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (hex: number, emi = 0.5, rough = 0.6) => {
    const k = hex + "_" + emi;
    if (!mats[k])
      mats[k] = new THREE.MeshStandardMaterial({
        color: hex,
        emissive: hex,
        emissiveIntensity: emi,
        roughness: rough,
        flatShading: true,
      });
    return mats[k];
  };
  const palette = [0x7a0a14, 0xa80f18, 0xd42a14, 0xf0521a, 0xff7a1a, 0xffa326, 0xffc83a, 0xffe36b];
  const gold = mat(0xf2b81c, 0.5, 0.35);
  const eyeM = mat(0xffb000, 1.6, 0.3);
  const darkM = mat(0x1a0505, 0.1, 0.5);

  // Feather: flattened pyramid-like shape, pointing along +Y local, scaled
  const featherGeo = new THREE.ConeGeometry(0.5, 1, 4);
  featherGeo.translate(0, 0.5, 0);
  featherGeo.scale(1, 1, 0.12);
  const add = (g: THREE.Object3D, p: THREE.Object3D = root) => {
    p.add(g);
    return g;
  };
  const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(x, y, z);
    parent.add(me);
    return me;
  };
  // feather pointing in direction (angle in XY plane from +X), with t color index
  const feather = (parent: THREE.Object3D, x: number, y: number, z: number, ang: number, len: number, wid: number, ci: number, tilt = 0) => {
    const m = mesh(featherGeo, mat(palette[Math.max(0, Math.min(7, Math.round(ci)))], 0.55), x, y, z, parent);
    m.scale.set(wid, len, wid * 0.3);
    m.rotation.z = ang - Math.PI / 2;
    m.rotation.x = tilt;
    return m;
  };

  const phoenix = new THREE.Group();
  phoenix.rotation.x = -0.25; // rising, chest up
  phoenix.position.y = 1.6;
  root.add(phoenix);

  // Body
  const body = mesh(new THREE.OctahedronGeometry(0.5, 1), mat(0xa80f18, 0.45), 0, 0, 0, phoenix);
  body.scale.set(0.8, 1.0, 1.5);
  const chest = mesh(new THREE.OctahedronGeometry(0.4, 0), mat(0xff7a1a, 0.6), 0, -0.05, 0.45, phoenix);
  chest.scale.set(0.85, 1, 0.9);
  const belly = mesh(new THREE.OctahedronGeometry(0.3, 0), mat(0xffc83a, 0.8), 0, -0.2, 0.2, phoenix);
  belly.scale.set(0.8, 0.9, 1.5);
  // breast feathers
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3), c = i % 3;
    feather(phoenix, (c - 1) * 0.14, 0.15 - r * 0.16, 0.7 - r * 0.1, -Math.PI / 2, 0.22, 0.17, 3 + r);
  }

  // Neck & head
  const neck = mesh(new THREE.CylinderGeometry(0.17, 0.26, 0.6, 6), mat(0xd42a14, 0.5), 0, 0.45, 0.65, phoenix);
  neck.rotation.x = 0.5;
  const head = mesh(new THREE.OctahedronGeometry(0.26, 1), mat(0xf0521a, 0.55), 0, 0.78, 0.9, phoenix);
  head.scale.set(0.9, 0.95, 1.1);
  // Beak
  const upper = mesh(new THREE.ConeGeometry(0.11, 0.38, 5), gold, 0, 0.74, 1.2, phoenix);
  upper.rotation.x = Math.PI / 2 + 0.25;
  const hook = mesh(new THREE.ConeGeometry(0.06, 0.16, 4), gold, 0, 0.66, 1.37, phoenix);
  hook.rotation.x = Math.PI / 2 + 1.2;
  const lower = mesh(new THREE.ConeGeometry(0.07, 0.25, 4), gold, 0, 0.67, 1.14, phoenix);
  lower.rotation.x = Math.PI / 2 - 0.05;
  // Eyes
  for (const s of [-1, 1]) {
    mesh(new THREE.OctahedronGeometry(0.06, 0), eyeM, s * 0.2, 0.84, 1.02, phoenix);
    mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), darkM, s * 0.24, 0.84, 1.06, phoenix);
    const brow = mesh(new THREE.BoxGeometry(0.14, 0.03, 0.08), mat(0x7a0a14, 0.4), s * 0.2, 0.92, 1.03, phoenix);
    brow.rotation.z = -s * 0.4;
  }
  // Crest of flame plumes
  for (let i = 0; i < 7; i++) {
    const a = 1.1 + (i - 3) * 0.0;
    const sway = (i - 3) * 0.16;
    const m = feather(phoenix, 0, 1.0, 0.82 - i * 0.1, a, 0.5 + (i % 3 === 1 ? 0.25 : 0) + (i === 3 ? 0.2 : 0), 0.14, 5 + (i % 3));
    m.rotation.set(0, 0, 0);
    m.rotation.x = -0.9 - i * 0.18;
    m.rotation.z = sway;
    m.scale.set(0.14, 0.55 + 0.1 * (3 - Math.abs(i - 3)), 0.06);
    m.position.set(sway * 0.5, 0.98, 0.85 - i * 0.07);
  }

  // Wings
  const makeWing = (s: number) => {
    const w = new THREE.Group();
    w.position.set(s * 0.35, 0.25, 0.15);
    phoenix.add(w);
    // arm bones
    const arm = mesh(new THREE.BoxGeometry(1.3, 0.12, 0.2), mat(0x7a0a14, 0.4), s * 0.65, 0.3, 0, w);
    arm.rotation.z = s * 0.35;
    const arm2 = mesh(new THREE.BoxGeometry(1.5, 0.1, 0.16), mat(0xa80f18, 0.45), s * 1.9, 0.82, -0.05, w);
    arm2.rotation.z = s * 0.15;
    // coverts layered rows
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      const n = 8 - r;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const x = s * (0.35 + t * 2.7);
        const y = 0.3 + t * 0.9 - r * 0.0;
        const ang = (s > 0 ? 1 : -1) * 0 + (s > 0 ? -0.35 : Math.PI + 0.35) - s * (t * 0.0);
        const rowOff = r * 0.2;
        const len = (0.5 + t * 0.5) * (1.1 + r * 0.25) + 0.3;
        const col = r * 0.7 + t * 4 + 0.5;
        const f = feather(w, x, y - rowOff * 0.9, -0.08 * r - 0.05 + (rnd() - 0.5) * 0.03, ang + s * 0.0, len, 0.28, col);
        // rotate so feathers sweep backward/down
        const down = -Math.PI / 2 - s * (0.1 + t * 0.15) + (rnd() - 0.5) * 0.05;
        f.rotation.z = down + (s > 0 ? 0.0 : 0.0) + s * -0.0;
        f.rotation.z = s * (-0.15 - t * 0.5) + Math.PI * 0 + (s > 0 ? 0 : 0);
        f.rotation.z += Math.PI; // point downward-outward
        f.rotation.z = s * (0.0) + Math.PI + s * (0.35 + t * 0.55) * -1 * -1;
        f.rotation.z = Math.PI + s * (0.25 + t * 0.9);
      }
    }
    // long primaries fanning out at wingtip
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const ang = s * (0.15 + t * 1.5);
      const f = feather(w, s * (2.4 + t * 0.9), 1.0 - t * 0.2, -0.05, 0, 1.2 + (1 - t) * 1.0, 0.26, 4.5 + t * 3.5);
      f.rotation.z = (s > 0 ? -Math.PI / 2 : Math.PI / 2) + s * 0.0 + ( -s) * (0.9 - t * 1.6) * -1;
      f.rotation.z = -s * (Math.PI / 2) + s * (t - 0.2) * 1.3;
      f.rotation.z = -s * (Math.PI / 2 - 0.6) + s * t * 1.5 * -1 + s * 0;
      f.rotation.z = -s * (0.5 + t * 1.2);
      f.rotation.z += s > 0 ? Math.PI * 0 : 0;
      f.rotation.z = -s * (Math.PI / 2 - 0.3 + 0) + s * t * -0.0;
      f.rotation.z = -s * (0.4 + t * 1.15) + (s > 0 ? 0 : 0);
      f.rotation.z = s * -(0.4 + t * 1.15) - 0;
      f.rotation.z = -s * (0.3 + t * 1.2);
      f.rotation.z = -s * (0.3 + t * 1.2) + (s < 0 ? 0 : 0);
      // make them point outward-upward fan: rotation z negative for +x side tilts toward +x
      f.rotation.z = -s * (Math.PI / 2 - 0.9 + t * 1.5 - 0.0) * 1;
      f.rotation.z = -s * (0.7 + t * 1.1) + 0;
      f.rotation.z = -s * (0.45 + t * 1.25);
    }
    return w;
  };
  makeWing(1);
  makeWing(-1);

  // Tail: long ribbons
  for (let i = 0; i < 7; i++) {
    const t = (i - 3) / 3;
    const len = 2.4 + (3 - Math.abs(i - 3)) * 0.5;
    const segs = 6;
    let px = t * 0.08, py = -0.05, pz = -0.6;
    for (let k = 0; k < segs; k++) {
      const sl = len / segs;
      const f = k / (segs - 1);
      const dx = t * 0.25 + Math.sin(k * 0.9 + i) * 0.12;
      const dy = -0.12 - k * 0.04;
      const dz = -sl;
      const seg = mesh(
        new THREE.BoxGeometry(0.16 * (1 - f * 0.4), 0.03, sl * 1.1),
        mat(palette[Math.min(7, Math.floor(1 + f * 3 + (i % 2) * 2 + (k === segs - 1 ? 2 : 0)))], 0.6),
        px + dx / 2, py + dy / 2, pz + dz / 2, phoenix
      );
      seg.lookAt(new THREE.Vector3(px + dx, py + dy, pz + dz).add(phoenix.position).add(new THREE.Vector3(0, 0, 0)));
      seg.rotation.set(0, 0, 0);
      seg.rotation.y = Math.atan2(dx, -dz) * -1;
      seg.rotation.x = Math.atan2(dy, -dz) * -1;
      px += dx; py += dy; pz += dz;
    }
    const tip = mesh(new THREE.OctahedronGeometry(0.16, 0), mat(0xffe36b, 1.0), px, py, pz, phoenix);
    tip.scale.set(0.8, 0.3, 2.2);
  }

  // Talons (tucked, trailing)
  for (const s of [-1, 1]) {
    const leg = mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.6, 5), gold, s * 0.2, -0.5, -0.25, phoenix);
    leg.rotation.x = 0.7;
    for (let c = -1; c <= 1; c++) {
      const claw = mesh(new THREE.ConeGeometry(0.03, 0.22, 4), gold, s * 0.2 + c * 0.06, -0.8, -0.45, phoenix);
      claw.rotation.x = 2.2;
    }
  }

  // Embers
  const emberGeo = new THREE.OctahedronGeometry(0.05, 0);
  for (let i = 0; i < 70; i++) {
    const side = rnd() < 0.5 ? -1 : 1;
    const x = side * (0.5 + rnd() * 3.8);
    const y = 0.4 + rnd() * 3.4;
    const z = (rnd() - 0.5) * 2.4 - 0.3;
    const e = mesh(emberGeo, mat(palette[4 + Math.floor(rnd() * 4)], 1.5), x, y, z);
    const sc = 0.4 + rnd() * 1.4;
    e.scale.set(sc, sc * 1.4, sc);
    e.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
  }

  // Aura glow disc behind
  const glow = mesh(
    new THREE.CircleGeometry(1.6, 10),
    new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }),
    0, 1.9, -0.9
  );

  // Ensure lowest point is near floor: tail tips/talons; shift so min y = 0
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o !== glow) box.expandByObject(o);
  });
  root.position.y -= box.min.y;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
```