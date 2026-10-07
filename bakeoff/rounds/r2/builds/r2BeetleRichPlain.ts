import * as THREE from "three";

export const meta = {
  name: "Stag Beetle on Mossy Log",
  description: "Proud stag beetle with glossy chestnut elytra, branched antler jaws, elbowed feathery antennae, spiny legs, and a dewdrop on a mossy log.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const root = new THREE.Group();

  const mat = (c: number, r = 0.6, m = 0, extra: any = {}) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true, ...extra });

  // bark texture
  const cv = document.createElement("canvas");
  cv.width = 128; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#5a3d28"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 70; i++) {
    g.fillStyle = rnd() > 0.5 ? "#44301f" : "#6e4c32";
    g.fillRect(rnd() * 128, 0, 2 + rnd() * 4, 128);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  const bark = mat(0xffffff, 0.95, 0, { map: tex });
  const moss = mat(0x4f8a2e, 1);
  const moss2 = mat(0x6aa83a, 1);
  const ringM = mat(0xb08a5c, 0.9);
  const black = mat(0x0c0c0e, 0.35, 0.2);
  const chest = mat(0x7a2a10, 0.12, 0.5);
  const jaw = mat(0x8a3a1c, 0.4, 0.1);
  const legM = mat(0x131315, 0.4, 0.2);
  const spine = mat(0x2a2a2e, 0.5);
  const dew = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.7, flatShading: false });

  const add = (geo: THREE.BufferGeometry, m: THREE.Material, p: number[], r: number[] = [0, 0, 0], sc: number[] = [1, 1, 1], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(p[0], p[1], p[2]);
    me.rotation.set(r[0], r[1], r[2]);
    me.scale.set(sc[0], sc[1], sc[2]);
    parent.add(me);
    return me;
  };

  // Log along Z axis, radius 0.14, top at y=0.12 (log center y=-0.02)
  const logR = 0.14;
  const logCenterY = -0.02;
  add(new THREE.CylinderGeometry(logR, logR * 1.05, 0.9, 12), bark, [0, logCenterY, 0], [Math.PI / 2, 0, 0]);
  add(new THREE.CylinderGeometry(logR * 0.96, logR * 0.96, 0.01, 12), ringM, [0, logCenterY, 0.451], [Math.PI / 2, 0, 0]);
  add(new THREE.CylinderGeometry(logR * 1.0, logR * 1.0, 0.01, 12), ringM, [0, logCenterY, -0.451], [Math.PI / 2, 0, 0]);
  // lift so log bottom touches y=0
  const topY = logCenterY + logR; // ~0.12
  const logShift = logR * 1.0 - logCenterY;
  root.children.forEach(c => (c.position.y += logShift));
  const top = topY + logShift; // beetle sit height

  // moss clumps
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2;
    const z = (rnd() - 0.5) * 0.85;
    const rr = 0.04 + rnd() * 0.05;
    const y = logCenterY + logShift + Math.cos(a) * logR * 0.95;
    const x = Math.sin(a) * logR * 0.95;
    if (Math.cos(a) < -0.2 && rnd() > 0.3) continue;
    add(new THREE.IcosahedronGeometry(rr, 0), rnd() > 0.5 ? moss : moss2, [x, y, z], [rnd(), rnd(), rnd()], [1, 0.5, 1]);
  }

  // Beetle group
  const b = new THREE.Group();
  b.position.set(0, top + 0.012, -0.02);
  root.add(b);
  const bodyY = 0.035;

  // abdomen / elytra
  add(new THREE.SphereGeometry(0.05, 12, 8), chest, [0, bodyY + 0.012, -0.075], [0, 0, 0], [0.95, 0.6, 1.5], b);
  // elytra split line
  add(new THREE.BoxGeometry(0.0025, 0.004, 0.14), black, [0, bodyY + 0.043, -0.085], [0.12, 0, 0], [1, 1, 1], b);
  // highlight strip (mirror shine)
  const shine = mat(0xffd2a0, 0.05, 0.1, { emissive: 0x442211 });
  add(new THREE.BoxGeometry(0.008, 0.002, 0.07), shine, [0.02, bodyY + 0.04, -0.07], [0.15, 0, -0.2], [1, 1, 1], b);
  add(new THREE.BoxGeometry(0.008, 0.002, 0.07), shine, [-0.02, bodyY + 0.04, -0.07], [0.15, 0, 0.2], [1, 1, 1], b);
  // black rear tip
  add(new THREE.SphereGeometry(0.03, 8, 6), black, [0, bodyY - 0.002, -0.145], [0, 0, 0], [1, 0.7, 1], b);
  // thorax
  add(new THREE.CylinderGeometry(0.04, 0.045, 0.05, 8), black, [0, bodyY + 0.01, 0.005], [Math.PI / 2, 0, 0], [1, 1, 0.75], b);
  // head
  add(new THREE.BoxGeometry(0.06, 0.035, 0.04), black, [0, bodyY + 0.01, 0.05], [0, 0, 0], [1, 1, 1], b);
  // eyes
  for (const sx of [-1, 1]) {
    add(new THREE.SphereGeometry(0.008, 6, 5), mat(0x332211, 0.2), [sx * 0.032, bodyY + 0.018, 0.06], [0, 0, 0], [1, 1, 1], b);
  }

  // jaws: branched
  for (const sx of [-1, 1]) {
    const jg = new THREE.Group();
    jg.position.set(sx * 0.02, bodyY + 0.008, 0.068);
    b.add(jg);
    const segs: [number, number, number, number][] = [
      // x, z, len, yaw (toward center curve)
      [0, 0, 0.05, sx * 0.35],
      [0.0, 0, 0.05, -sx * 0.15],
      [0, 0, 0.045, -sx * 0.6],
    ];
    let px = 0, pz = 0, ang = 0;
    let tipX = 0, tipZ = 0;
    segs.forEach((sg, i) => {
      ang += sg[3];
      const len = sg[2];
      const dx = Math.sin(ang) * len, dz = Math.cos(ang) * len;
      const w = 0.012 - i * 0.003;
      const m = add(new THREE.BoxGeometry(w, w * 0.9, len * 1.1), jaw, [px + dx / 2, i * 0.003, pz + dz / 2], [0, ang, 0], [1, 1, 1], jg);
      px += dx; pz += dz;
      if (i === 1) {
        // branch tine
        const ta = ang + sx * 0.7 * -1;
        add(new THREE.ConeGeometry(0.005, 0.03, 5), jaw, [px + Math.sin(ta) * 0.013, 0.012, pz + Math.cos(ta) * 0.013 - 0.02 + 0.02], [Math.PI / 2 - 0.5, 0, 0].map((v, k) => k === 1 ? 0 : v), [1, 1, 1], jg).rotation.set(Math.PI / 2, ta, 0, "YXZ");
      }
      if (i === 0) {
        add(new THREE.ConeGeometry(0.0045, 0.025, 5), jaw, [px, 0.012, pz - 0.005], [-0.6, 0, sx * 0.4], [1, 1, 1], jg);
      }
      tipX = px; tipZ = pz;
    });
    // tip cone
    add(new THREE.ConeGeometry(0.005, 0.03, 5), jaw, [tipX + Math.sin(ang) * 0.012, 0.004, tipZ + Math.cos(ang) * 0.012], [Math.PI / 2, ang, 0], [1, 1, 1], jg).rotation.set(Math.PI / 2, ang, 0, "YXZ");
    // upper tine
    add(new THREE.ConeGeometry(0.004, 0.025, 5), jaw, [px * 0.55, 0.015, pz * 0.7], [-0.3, 0, -sx * 0.5], [1, 1, 1], jg);
    // dewdrop on left (+X) jaw
    if (sx === 1) {
      add(new THREE.SphereGeometry(0.009, 10, 8), dew, [tipX * 0.7 + 0.002, -0.009, tipZ * 0.7], [0, 0, 0], [1, 1.2, 1], jg);
    }
  }

  // antennae
  for (const sx of [-1, 1]) {
    const ag = new THREE.Group();
    ag.position.set(sx * 0.024, bodyY + 0.022, 0.07);
    b.add(ag);
    add(new THREE.CylinderGeometry(0.0022, 0.0022, 0.03, 5), legM, [sx * 0.008, 0.008, 0.012], [Math.PI / 2 - 0.5, 0, -sx * 0.4], [1, 1, 1], ag);
    // elbow
    add(new THREE.SphereGeometry(0.004, 5, 4), legM, [sx * 0.016, 0.017, 0.026], [0, 0, 0], [1, 1, 1], ag);
    add(new THREE.CylinderGeometry(0.002, 0.002, 0.025, 5), legM, [sx * 0.03, 0.02, 0.034], [Math.PI / 2, 0, sx * 1.2], [1, 1, 1], ag);
    // feathery tips
    for (let k = 0; k < 4; k++) {
      add(new THREE.BoxGeometry(0.0025, 0.002, 0.016), legM, [sx * (0.04 + k * 0.004), 0.021, 0.036 + k * 0.003], [0, sx * (0.6 - k * 0.1), 0], [1, 1, 1], ag);
      add(new THREE.BoxGeometry(0.0025, 0.002, 0.016), legM, [sx * (0.04 + k * 0.004), 0.021, 0.036 + k * 0.003], [0, sx * (0.6 - k * 0.1) + Math.PI / 2 * 0.6, 0], [1, 1, 1], ag);
    }
  }

  // legs: three pairs
  const legZ = [0.015, -0.025, -0.07];
  const splay = [0.5, 0, -0.5];
  for (let i = 0; i < 3; i++) {
    for (const sx of [-1, 1]) {
      const lg = new THREE.Group();
      lg.position.set(sx * 0.03, bodyY - 0.005, legZ[i]);
      b.add(lg);
      const dirY = splay[i] * 0.6;
      // upper leg: out and up
      const upLen = 0.045;
      const u = add(new THREE.CylinderGeometry(0.004, 0.0055, upLen, 5), legM, [sx * 0.025, 0.012, 0.0], [0, 0, sx * -1.15], [1, 1, 1], lg);
      u.position.z += 0;
      // knee
      const kx = sx * 0.05, ky = 0.024, kz = 0;
      add(new THREE.SphereGeometry(0.006, 5, 4), legM, [kx, ky, kz + dirY * 0.01], [0, 0, 0], [1, 1, 1], lg);
      // lower leg: down to the bark
      const fx = sx * 0.085, fz = dirY * 0.08;
      const fy = -(bodyY + 0.012 - 0.0) + 0.0;
      const dx = fx - kx, dy = fy - ky, dz = fz - kz;
      const L = Math.hypot(dx, dy, dz);
      const lower = add(new THREE.CylinderGeometry(0.0025, 0.004, L, 5), legM, [kx + dx / 2, ky + dy / 2, kz + dz / 2], [0, 0, 0], [1, 1, 1], lg);
      lower.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
      // spines
      for (let k = 0; k < 3; k++) {
        const t = 0.3 + k * 0.25;
        add(new THREE.ConeGeometry(0.0018, 0.012, 4), spine, [kx + dx * t + sx * 0.004, ky + dy * t, kz + dz * t + 0.003], [0.5, 0, -sx * 1.2], [1, 1, 1], lg);
      }
      // foot claw
      add(new THREE.ConeGeometry(0.003, 0.012, 4), spine, [fx + sx * 0.003, fy + 0.004, fz + 0.004], [0.3, 0, sx * 0.4], [1, 1, 1], lg);
    }
  }

  // Beetle rest: legs reach local y ≈ -0.047 => bark at top - ... adjust by lowering slightly
  b.position.y = top + 0.045;
  b.rotation.y = 0;

  // widen log contact: small moss under feet for ground cover
  add(new THREE.IcosahedronGeometry(0.03, 0), moss2, [0.1, top + 0.005, 0.1], [0, 0, 0], [1, 0.4, 1]);

  // scale beetle slightly larger for readability
  b.scale.setScalar(1.6);
  b.position.y = top + 0.045 * 1.6 - 0.004;

  return root;
}
