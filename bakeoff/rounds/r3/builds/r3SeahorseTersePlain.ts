import * as THREE from "three";

export const meta = {
  name: "Seahorse",
  description: "Stylized low-poly seahorse with curled tail, crowned head, snout, ridged belly, dorsal fin and spikes, mounted on a small coral base.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, rough = 0.6) => {
    const k = c + "_" + rough;
    return (mats[k] ??= new THREE.MeshStandardMaterial({ color: c, roughness: rough, flatShading: true }));
  };

  // canvas stripe texture for body
  const cv = document.createElement("canvas");
  cv.width = 64; cv.height = 64;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#f2a33a"; g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#d9731f";
  for (let i = 0; i < 64; i += 16) g.fillRect(0, i, 64, 6);
  g.fillStyle = "#ffd27a";
  for (let i = 0; i < 12; i++) g.fillRect(rnd() * 60, rnd() * 60, 4, 4);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  const skin = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, flatShading: true });
  const dark = M(0xc4561a);
  const belly = M(0xffdc9a);
  const fin = new THREE.MeshStandardMaterial({ color: 0xff7a5a, roughness: 0.4, transparent: true, opacity: 0.8, side: THREE.DoubleSide, flatShading: true });
  const spike = M(0x8a2f12);
  const white = M(0xffffff, 0.3);
  const black = M(0x111111, 0.2);
  const sand = M(0xd9c28f, 0.9);
  const coral = M(0xe0507a, 0.7);
  const coral2 = M(0x4fb8a8, 0.7);

  const root = new THREE.Group();
  const seahorse = new THREE.Group();
  root.add(seahorse);

  const add = (geo: THREE.BufferGeometry, m: THREE.Material, p: number[], r: number[] = [0, 0, 0], sc: number[] = [1, 1, 1], parent: THREE.Object3D = seahorse) => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(p[0], p[1], p[2]);
    o.rotation.set(r[0], r[1], r[2]);
    o.scale.set(sc[0], sc[1], sc[2]);
    parent.add(o);
    return o;
  };

  // Spine path: head top -> neck -> belly -> tail curl. (y,z) in the side plane.
  const pts: THREE.Vector3[] = [];
  // neck/torso: S curve
  const spine = [
    [0.60, 0.10, 0.10], // head base
    [0.50, 0.07, 0.10],
    [0.40, 0.03, 0.13],
    [0.30, 0.00, 0.14],
    [0.20, 0.00, 0.13],
    [0.10, 0.03, 0.11],
    [0.02, 0.06, 0.09],
    [-0.05, 0.05, 0.075],
  ];
  // tail curl: spiral
  const cx = 0.0, cy = -0.18;
  for (let i = 0; i < 16; i++) {
    const a = -0.3 - i * 0.42; // angle
    const rad = 0.2 - i * 0.009;
    const y = cy + Math.sin(a + Math.PI) * rad * 0.0 + 0;
    spine.push([cy - 0.0 + Math.cos(a) * 0 + 0, 0, 0]); spine.pop();
    const yy = -0.2 + Math.sin(a) * rad;
    const zz = 0.04 + Math.cos(a) * rad;
    spine.push([yy, zz + 0.04 * 0, Math.max(0.018, 0.07 - i * 0.0036)]);
  }
  for (const p of spine) pts.push(new THREE.Vector3(0, p[0], p[1]));

  // place segments along spine
  const sg = new THREE.OctahedronGeometry(1, 0);
  const ridge = new THREE.ConeGeometry(0.02, 0.05, 4);
  for (let i = 0; i < pts.length; i++) {
    const r = spine[i][2];
    const a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)], pr = pts[Math.max(i - 1, 0)];
    const dir = b.clone().sub(pr).normalize();
    const mid = a.clone();
    const mesh = add(sg, i % 2 ? skin : skin, [0, mid.y, mid.z], [0, 0, 0], [r * 1.0, r * 1.15, r * 1.15]);
    const ang = Math.atan2(dir.z, dir.y);
    mesh.rotation.x = -ang + 0;
    mesh.scale.set(r * 0.95, r * 1.35, r * 1.1);
    // dorsal-ish spikes on back (outward away from the curl) 
    if (i % 2 === 0 && i < pts.length - 2) {
      const n = new THREE.Vector3(0, -dir.z, dir.y); // normal
      const back = i < 8 ? -1 : 1;
      const sp = add(ridge, spike, [0, a.y + n.y * r * back * 1.05, a.z + n.z * r * back * 1.05], [Math.atan2(-n.z * back, n.y * back) * 0 + (back === -1 ? 0 : 0), 0, 0], [1, 1, 1]);
      sp.lookAt(0, a.y + n.y * 5 * back, a.z + n.z * 5 * back);
      sp.rotateX(Math.PI / 2);
      sp.scale.setScalar(Math.max(0.5, r * 12));
    }
  }

  // belly: pale pouch on front of torso
  add(sg, belly, [0, 0.17, 0.25], [0.15, 0, 0], [0.085, 0.19, 0.1]);
  for (let i = 0; i < 5; i++) {
    add(new THREE.BoxGeometry(0.15, 0.012, 0.03), dark, [0, 0.07 + i * 0.065, 0.25 + 0.01 - (i === 0 ? 0.03 : 0) - Math.abs(i - 2) * 0.012], [0.15, 0, 0]);
  }

  // head
  const head = new THREE.Group();
  head.position.set(0, 0.64, 0.1);
  head.rotation.x = 0.45;
  seahorse.add(head);
  add(sg, skin, [0, 0, 0.0], [0, 0, 0], [0.085, 0.09, 0.1], head);
  // snout
  add(new THREE.CylinderGeometry(0.022, 0.033, 0.22, 6), skin, [0, -0.02, 0.17], [Math.PI / 2 + 0.1, 0, 0], [1, 1, 1], head);
  add(new THREE.BoxGeometry(0.05, 0.03, 0.04), dark, [0, -0.03, 0.285], [0, 0, 0], [1, 1, 1], head);
  // cheeks
  for (const x of [-1, 1]) {
    add(sg, belly, [x * 0.065, -0.03, 0.04], [0, 0, 0], [0.025, 0.04, 0.045], head);
    // eyes
    add(new THREE.SphereGeometry(0.036, 8, 6), white, [x * 0.08, 0.025, 0.05], [0, 0, 0], [0.6, 1, 1], head);
    add(new THREE.SphereGeometry(0.02, 6, 5), black, [x * 0.1, 0.025, 0.055], [0, 0, 0], [0.6, 1, 1], head);
    // spiky crown
  }
  // coronet
  for (let i = 0; i < 5; i++) {
    const c = add(new THREE.ConeGeometry(0.02, 0.1 - Math.abs(i - 2) * 0.012, 4), spike, [0, 0.1 + 0.0, -0.05 - i * 0.0], [0, 0, 0], [1, 1, 1], head);
    c.position.set((i - 2) * 0.03, 0.09, -0.03 - Math.abs(i - 2) * 0.02);
    c.rotation.z = (i - 2) * -0.25;
    c.rotation.x = -0.4;
  }
  // mane spikes down neck
  for (let i = 0; i < 4; i++) {
    const y = 0.56 - i * 0.09;
    const z = 0.0 + (pts[Math.min(i + 1, 3)].z) - 0.1;
    add(new THREE.ConeGeometry(0.022, 0.1, 4), spike, [0, y, pts[i + 1].z - 0.09], [-2.0, 0, 0]);
  }

  // dorsal fin (back of torso)
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0); finShape.lineTo(0.2, 0.06); finShape.lineTo(0.2, -0.06); finShape.lineTo(0, -0.1); finShape.lineTo(0, 0);
  const fg = new THREE.ShapeGeometry(finShape);
  const dfin = add(fg, fin, [0, 0.17, -0.0], [0, 0, 0]);
  dfin.rotation.set(0, Math.PI / 2, 0); // lies in YZ plane
  dfin.rotation.y = Math.PI / 2;
  dfin.scale.set(-1, 1.3, 1);
  dfin.position.set(0, 0.2, 0.0);
  // fan ribs
  for (let i = 0; i < 4; i++) {
    add(new THREE.BoxGeometry(0.008, 0.008, 0.2), dark, [0, 0.17 + (i - 1.5) * 0.04, -0.1], [(i - 1.5) * 0.12, 0, 0]);
  }

  // pectoral fins
  for (const x of [-1, 1]) {
    const pf = add(new THREE.ConeGeometry(0.06, 0.12, 4), fin, [x * 0.1, 0.45, 0.0], [0, 0, x * -1.2], [1, 1, 0.3]);
    pf.rotation.set(0.3, 0, x * -1.9);
    pf.position.set(x * 0.12, 0.45, 0.03);
  }

  // coral base
  add(new THREE.CylinderGeometry(0.26, 0.32, 0.05, 8), sand, [0, 0.0, -0.1]);
  const mk = (m: THREE.Material, x: number, z: number, h: number) => {
    add(new THREE.CylinderGeometry(0.012, 0.03, h, 5), m, [x, h / 2, z]);
    add(new THREE.CylinderGeometry(0.008, 0.012, h * 0.5, 5), m, [x + 0.03, h * 0.7, z], [0, 0, -0.7]);
    add(new THREE.IcosahedronGeometry(0.03, 0), m, [x, h, z]);
  };
  mk(coral, -0.2, -0.15, 0.25);
  mk(coral2, 0.22, -0.2, 0.2);
  mk(coral, 0.18, 0.05, 0.12);

  // ground: lift whole seahorse to rest on base and tail
  seahorse.position.y = 0.3;
  seahorse.position.z = -0.0;

  // normalize: lowest point to y=0 (base top ~0.05)
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;
  return root;
}
