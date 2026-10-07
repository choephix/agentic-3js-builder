```ts
import * as THREE from "three";

export const meta = {
  name: "Sleepy Koala",
  description:
    "A drowsy ash-grey koala with a cream chest and fluffy cream-lined ears, hugging a eucalyptus branch while munching a sprig of blue-green leaves.",
};

type V3 = [number, number, number];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const UP = new THREE.Vector3(0, 1, 0);

function furTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#8d8a85";
  g.fillRect(0, 0, 256, 256);
  const r = rng(7);
  for (let i = 0; i < 2600; i++) {
    const x = r() * 256;
    const y = r() * 256;
    g.strokeStyle = r() > 0.5 ? "rgba(232,230,224,0.22)" : "rgba(40,38,36,0.2)";
    g.lineWidth = 1 + r() * 1.5;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 6, y + 3 + r() * 5);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function buildKoala(): THREE.Object3D {
  const rand = rng(20240611);
  const root = new THREE.Group();

  const fur = furTexture();
  const furMat = new THREE.MeshStandardMaterial({
    color: fur ? 0xffffff : 0x8d8a85,
    map: fur,
    roughness: 0.95,
  });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xefe4c8, roughness: 0.9 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x161514, roughness: 0.7 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.35 });
  const shineMat = new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.2 });
  const clawMat = new THREE.MeshStandardMaterial({ color: 0x1e1d1c, roughness: 0.5 });
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x6e5a48, roughness: 0.92 });
  const leafA = new THREE.MeshStandardMaterial({ color: 0x5b9a8e, roughness: 0.6 });
  const leafB = new THREE.MeshStandardMaterial({ color: 0x86b9a6, roughness: 0.6 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x7d8f6e, roughness: 0.8 });

  const add = (m: THREE.Object3D) => {
    root.add(m);
    return m;
  };

  // Ellipsoid built from a unit sphere: p = centre, s = radii.
  const blob = (mat: THREE.Material, p: V3, s: V3, seg = 18) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)), mat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    return add(m);
  };

  // Tapered cylinder between two points (rTop at b, rBot at a).
  const limb = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    rTop: number,
    rBot: number,
    mat: THREE.Material,
    seg = 10,
  ) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, seg), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    return add(m);
  };

  const V = (p: V3) => new THREE.Vector3(p[0], p[1], p[2]);

  // ---------- Eucalyptus branch (koala's right side, -X) ----------
  const bA = V([-0.62, 0.0, 0.02]);
  const bB = V([-0.05, 1.0, 0.22]);
  limb(bA, bB, 0.025, 0.05, barkMat, 12);
  const onBranch = (t: number) => new THREE.Vector3().lerpVectors(bA, bB, t);

  // Side twig
  const tw = onBranch(0.55).add(new THREE.Vector3(-0.02, 0, 0));
  limb(tw, tw.clone().add(new THREE.Vector3(-0.14, 0.1, 0.04)), 0.01, 0.018, barkMat, 8);

  // Leaves along branch
  for (let i = 0; i < 22; i++) {
    const t = 0.2 + rand() * 0.8;
    const p = onBranch(t);
    const ang = rand() * Math.PI * 2;
    const out = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
    const dir = out
      .clone()
      .multiplyScalar(0.8)
      .add(new THREE.Vector3(0, 0.3 + rand() * 0.4, 0))
      .normalize();
    const pos = p.clone().addScaledVector(out, 0.03).addScaledVector(dir, 0.04);
    const leaf = blob(rand() > 0.5 ? leafA : leafB, [pos.x, pos.y, pos.z], [0.012, 0.045, 0.003], 6);
    leaf.quaternion.setFromUnitVectors(UP, dir);
  }
  // Leaves on the twig
  for (let i = 0; i < 4; i++) {
    const t = 0.4 + rand() * 0.6;
    const p = new THREE.Vector3().lerpVectors(tw, tw.clone().add(new THREE.Vector3(-0.14, 0.1, 0.04)), t);
    const dir = new THREE.Vector3(rand() - 0.5, 0.6 + rand() * 0.4, rand() - 0.5).normalize();
    const pos = p.clone().addScaledVector(dir, 0.04);
    const leaf = blob(leafA, [pos.x, pos.y, pos.z], [0.012, 0.045, 0.003], 6);
    leaf.quaternion.setFromUnitVectors(UP, dir);
  }

  // ---------- Body ----------
  blob(furMat, [0, 0.34, 0], [0.24, 0.31, 0.23], 22);
  blob(creamMat, [0, 0.37, 0.15], [0.16, 0.19, 0.1], 16); // cream chest

  // Haunches and feet
  for (const sx of [-1, 1]) {
    blob(furMat, [sx * 0.15, 0.13, 0.07], [0.14, 0.11, 0.13], 14);
    blob(furMat, [sx * 0.14, 0.035, 0.25], [0.095, 0.045, 0.11], 12);
    for (const dx of [-0.035, 0, 0.035]) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.04, 8), clawMat);
      claw.position.set(sx * 0.14 + dx, 0.03, 0.33);
      claw.rotation.x = Math.PI / 2 + 0.5;
      add(claw);
    }
  }

  // ---------- Arms ----------
  // Right arm hugging the branch
  const shR = V([-0.18, 0.46, 0.07]);
  const pawR = V([-0.36, 0.46, 0.16]);
  limb(shR, pawR, 0.05, 0.05, furMat, 12);
  blob(furMat, [-0.36, 0.46, 0.16], [0.07, 0.065, 0.06], 12);

  // Left arm holding the sprig
  const shL = V([0.18, 0.46, 0.07]);
  const pawL = V([0.21, 0.43, 0.28]);
  limb(shL, pawL, 0.05, 0.05, furMat, 12);
  blob(furMat, [0.21, 0.43, 0.28], [0.065, 0.055, 0.07], 12);

  // ---------- Head ----------
  blob(furMat, [0, 0.78, 0.07], [0.21, 0.19, 0.19], 22);
  blob(creamMat, [0, 0.665, 0.2], [0.11, 0.06, 0.08], 14); // cream chin
  blob(noseMat, [0, 0.725, 0.245], [0.1, 0.072, 0.07], 16); // big leathery nose

  // Eyes: half-closed drowsy lids
  for (const sx of [-1, 1]) {
    blob(eyeMat, [sx * 0.08, 0.8, 0.225], [0.035, 0.035, 0.035], 14);
    blob(shineMat, [sx * 0.08 + sx * 0.005, 0.79, 0.255], [0.01, 0.01, 0.01], 8);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.034, 0.03), furMat);
    lid.position.set(sx * 0.08, 0.818, 0.245);
    lid.rotation.z = sx * 0.2; // lids slope down toward the nose
    add(lid);
  }

  // ---------- Ears ----------
  for (const sx of [-1, 1]) {
    const ex = sx * 0.15;
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 16), furMat);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(ex, 0.93, -0.01);
    add(ear);

    // Cream rim on the outer face
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.024, 8, 18), creamMat);
    rim.rotation.y = Math.PI / 2;
    rim.position.set(ex + sx * 0.02, 0.93, -0.01);
    add(rim);

    // Fluffy tufts around the rim
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const tuft = blob(
        creamMat,
        [ex + sx * 0.024, 0.93 + Math.cos(a) * 0.082, -0.01 + Math.sin(a) * 0.082],
        [0.021, 0.021, 0.021],
        8,
      );
      tuft.scale.setScalar(1);
    }
  }

  // ---------- Eucalyptus sprig (held mid-munch) ----------
  const sA = V([0.2, 0.44, 0.27]);
  const sB = V([0.08, 0.66, 0.34]);
  limb(sA, sB, 0.007, 0.01, stemMat, 8);
  for (let i = 0; i < 14; i++) {
    const t = 0.35 + rand() * 0.65;
    const p = new THREE.Vector3().lerpVectors(sA, sB, t);
    const ang = rand() * Math.PI * 2;
    const dir = new THREE.Vector3(
      Math.cos(ang) * 0.9,
      0.2 + rand() * 0.6,
      Math.sin(ang) * 0.5 + 0.3,
    ).normalize();
    const pos = p.clone().addScaledVector(dir, 0.035);
    const leaf = blob(rand() > 0.4 ? leafA : leafB, [pos.x, pos.y, pos.z], [0.014, 0.05, 0.004], 6);
    leaf.quaternion.setFromUnitVectors(UP, dir);
  }

  return root;
}
```