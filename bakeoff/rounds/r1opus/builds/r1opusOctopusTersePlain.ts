import * as THREE from "three";

export const meta = {
  name: "Coral Reef Octopus",
  description:
    "A stylized low-poly octopus resting on the floor: a speckled coral mantle with warty papillae, big golden eyes with bar-shaped pupils, and eight segmented arms that splay out and curl their tips skyward to show off rows of cream suckers.",
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeSkinTexture(rng: () => number): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  if (!g) return null;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#d8452f");
  grad.addColorStop(0.6, "#e8603f");
  grad.addColorStop(1, "#f0855a");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) {
    g.fillStyle = `rgba(140,30,35,${0.25 + rng() * 0.35})`;
    g.beginPath();
    g.ellipse(rng() * 256, rng() * 256, 4 + rng() * 12, 3 + rng() * 8, rng() * 3, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < 120; i++) {
    g.fillStyle = `rgba(255,214,170,${0.35 + rng() * 0.4})`;
    g.beginPath();
    g.arc(rng() * 256, rng() * 256, 1 + rng() * 2.5, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export default function build(): THREE.Object3D {
  const rng = mulberry32(80085);
  const root = new THREE.Group();
  const V = THREE.Vector3;
  const UP = new V(0, 1, 0);

  const skinTex = makeSkinTexture(rng);
  const skin = new THREE.MeshStandardMaterial({
    color: skinTex ? 0xffffff : 0xe0523a,
    map: skinTex ?? undefined,
    roughness: 0.55,
    flatShading: true,
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x9e2a2a, roughness: 0.6, flatShading: true });
  const sucker = new THREE.MeshStandardMaterial({ color: 0xf8d6bb, roughness: 0.45, flatShading: true });
  const pitMat = new THREE.MeshStandardMaterial({ color: 0xc9706a, roughness: 0.7 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xfff6e6, roughness: 0.25 });
  const iris = new THREE.MeshStandardMaterial({ color: 0xf2b22e, roughness: 0.3, emissive: 0x3a2400 });
  const pupil = new THREE.MeshStandardMaterial({ color: 0x15131c, roughness: 0.2 });
  const shine = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 });
  const blush = new THREE.MeshStandardMaterial({ color: 0xff8a8a, roughness: 0.8 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    parent.add(m);
    return m;
  };

  // ---------- Body ----------
  const headC = new V(0, 0.14, 0.02);
  const head = add(new THREE.SphereGeometry(1, 14, 10), skin);
  head.position.copy(headC);
  head.scale.set(0.13, 0.105, 0.125);

  const mantle = add(new THREE.SphereGeometry(1, 14, 10), skin);
  mantle.position.set(0, 0.3, -0.07);
  mantle.scale.set(0.15, 0.19, 0.17);
  mantle.rotation.x = -0.35;
  mantle.updateMatrix();

  // papillae (warts) on the mantle
  for (let i = 0; i < 28; i++) {
    const th = rng() * Math.PI * 2;
    const ph = rng() * Math.PI * 0.62;
    const d = new V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
    const p = d.clone().multiplyScalar(0.97).applyMatrix4(mantle.matrix);
    const w = add(new THREE.IcosahedronGeometry(0.007 + rng() * 0.009, 0), rng() < 0.7 ? dark : sucker);
    w.position.copy(p);
    w.rotation.set(rng() * 3, rng() * 3, rng() * 3);
  }
  // ridge band where mantle meets head
  const ridge = add(new THREE.TorusGeometry(0.118, 0.012, 5, 16), dark);
  ridge.position.set(0, 0.2, -0.035);
  ridge.rotation.x = Math.PI / 2 - 0.35;

  // siphon
  const siph = add(new THREE.CylinderGeometry(0.018, 0.026, 0.06, 8, 1, true), skin);
  siph.position.set(0.12, 0.13, -0.05);
  siph.rotation.z = -1.1;
  const siphRim = add(new THREE.TorusGeometry(0.018, 0.005, 4, 10), dark);
  siphRim.position.set(0.146, 0.145, -0.05);
  siphRim.rotation.y = Math.PI / 2;
  siphRim.rotation.x = 0.47;

  // ---------- Eyes ----------
  for (const s of [-1, 1]) {
    const eyePos = new V(0.075 * s, 0.185, 0.095);
    const look = new V(0.55 * s, 0.12, 0.83).normalize();
    const xA = new V().crossVectors(UP, look).normalize();
    const yA = new V().crossVectors(look, xA);
    const eye = new THREE.Group();
    eye.position.copy(eyePos);
    eye.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, look));
    root.add(eye);

    add(new THREE.SphereGeometry(0.042, 12, 8), eyeWhite, eye);
    const ir = add(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 12), iris, eye);
    ir.rotation.x = Math.PI / 2;
    ir.position.z = 0.037;
    const pu = add(new THREE.BoxGeometry(0.036, 0.011, 0.006), pupil, eye);
    pu.position.z = 0.042;
    const hl = add(new THREE.SphereGeometry(0.007, 6, 4), shine, eye);
    hl.position.set(0.012 * s, 0.014, 0.045);
    // heavy eyelid
    const lid = add(new THREE.SphereGeometry(0.047, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), skin, eye);
    lid.rotation.x = 0.55;
    const brow = add(new THREE.TorusGeometry(0.044, 0.006, 4, 12, Math.PI), dark, eye);
    brow.rotation.z = 0.05;
    brow.rotation.x = 0.35;
    brow.position.z = 0.012;

    const ch = add(new THREE.SphereGeometry(0.018, 8, 5), blush);
    ch.position.set(0.075 * s, 0.13, 0.12);
    ch.scale.set(1, 0.55, 0.4);
    ch.lookAt(ch.position.clone().add(new V(0.4 * s, 0, 1)));
  }
  // little smile
  const smile = add(new THREE.TorusGeometry(0.016, 0.004, 4, 10, Math.PI), pupil);
  smile.position.set(0, 0.135, 0.142);
  smile.rotation.z = Math.PI;

  // ---------- Arms ----------
  const N = 20;
  const nFlat = 11;
  const nCurl = N - nFlat;
  const radius = (t: number) => 0.006 + 0.04 * Math.pow(1 - t, 0.9);
  const quatAlong = (v: THREE.Vector3) => new THREE.Quaternion().setFromUnitVectors(UP, v.clone().normalize());

  for (let i = 0; i < 8; i++) {
    const th = ((i + 0.5) / 8) * Math.PI * 2;
    const dir = new V(Math.sin(th), 0, Math.cos(th));
    const side = new V(Math.cos(th), 0, -Math.sin(th));
    const L = 0.3 + rng() * 0.1;
    const R0 = 0.06 + rng() * 0.035;
    const phiMax = Math.PI * (1.15 + rng() * 0.65);
    const phase = rng() * 6;
    const latA = 0.02 + rng() * 0.03;

    const dh: [number, number][] = [];
    const rad: number[] = [];
    const pts: THREE.Vector3[] = [];
    const hc = radius((nFlat - 1) / (N - 1));
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1);
      const r = radius(t);
      let d: number, h: number;
      if (k < nFlat) {
        const f = k / (nFlat - 1);
        d = 0.03 + L * f;
        h = r + (0.075 - r) * Math.pow(Math.max(0, 1 - f * 2.2), 2);
      } else {
        const f = (k - nFlat + 1) / nCurl;
        const phi = f * phiMax;
        const R = R0 * (1 - 0.55 * f);
        d = 0.03 + L + R * Math.sin(phi);
        h = hc + R0 - R * Math.cos(phi);
      }
      const lat = latA * Math.sin(t * 4 + phase) * t;
      dh.push([d, h]);
      rad.push(r);
      pts.push(dir.clone().multiplyScalar(d).addScaledVector(UP, h).addScaledVector(side, lat));
    }

    for (let k = 0; k < N; k++) {
      const p = pts[k];
      const r = rad[k];
      const j = add(new THREE.SphereGeometry(r, 7, 5), skin);
      j.position.copy(p);

      if (k < N - 1) {
        const q = pts[k + 1];
        const seg = new V().subVectors(q, p);
        const len = seg.length();
        const c = add(new THREE.CylinderGeometry(rad[k + 1], r, len, 7, 1, true), skin);
        c.position.copy(p).addScaledVector(seg, 0.5);
        c.quaternion.copy(quatAlong(seg));
      }

      // underside normal in the arm plane
      const a = dh[Math.max(0, k - 1)];
      const b = dh[Math.min(N - 1, k + 1)];
      let td = b[0] - a[0];
      let thh = b[1] - a[1];
      const tl = Math.hypot(td, thh) || 1;
      td /= tl;
      thh /= tl;
      const nrm = dir.clone().multiplyScalar(thh).addScaledVector(UP, -td).normalize();

      if (k >= 3) {
        for (const s of [-1, 1]) {
          const ang = 0.8 * s;
          const sd = nrm.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang)).normalize();
          const sp = add(new THREE.CylinderGeometry(0.42 * r, 0.36 * r, 0.35 * r, 8), sucker);
          sp.position.copy(p).addScaledVector(sd, r * 0.82);
          sp.quaternion.copy(quatAlong(sd));
          if (k >= nFlat - 1) {
            const pit = add(new THREE.CylinderGeometry(0.2 * r, 0.2 * r, 0.1 * r, 6), pitMat);
            pit.position.copy(p).addScaledVector(sd, r * 1.0);
            pit.quaternion.copy(sp.quaternion);
          }
        }
      }
    }
  }

  return root;
}
