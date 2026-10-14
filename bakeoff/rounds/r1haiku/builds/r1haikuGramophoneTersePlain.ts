import * as THREE from "three";

export const meta = {
  name: "Gramophone",
  description:
    "A stylized wind-up gramophone: a wooden cabinet on four feet, a brass turntable with a red-labelled record, a tonearm, and a flared brass horn on a slender stand.",
};

function grainTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8a5a33";
  g.fillRect(0, 0, 256, 256);
  let s = 7;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < 120; i++) {
    g.strokeStyle = `rgba(60,30,12,${0.15 + rnd() * 0.25})`;
    g.lineWidth = 0.5 + rnd() * 2;
    const y = rnd() * 256;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 256; x += 32) {
      g.lineTo(x, y + Math.sin(x * 0.03 + i) * 3 * rnd());
    }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

export default function createGramophone(): THREE.Object3D {
  const grain = grainTexture();

  const wood = new THREE.MeshStandardMaterial({ map: grain, roughness: 0.7, color: 0xffffff });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x3b2215, roughness: 0.6 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd4a84a, roughness: 0.35, metalness: 0.85 });
  const black = new THREE.MeshStandardMaterial({ color: 0x14120f, roughness: 0.3, metalness: 0.1 });
  const red = new THREE.MeshStandardMaterial({ color: 0xb8322a, roughness: 0.5 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xefe3c4, roughness: 0.6 });

  const group = new THREE.Group();

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number],
    quat?: THREE.Quaternion
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(pos[0], pos[1], pos[2]);
    if (quat) m.quaternion.copy(quat);
    group.add(m);
    return m;
  };

  // Cabinet body and trim
  add(new THREE.BoxGeometry(0.36, 0.14, 0.34), wood, [0, 0.10, 0.02]);
  add(new THREE.BoxGeometry(0.37, 0.012, 0.35), woodDark, [0, 0.168, 0.02]);
  add(new THREE.BoxGeometry(0.31, 0.02, 0.006), brass, [0, 0.105, 0.195]);

  // Feet
  for (const fx of [-0.15, 0.15]) {
    for (const fz of [-0.12, 0.16]) {
      add(new THREE.CylinderGeometry(0.018, 0.02, 0.03, 12), woodDark, [fx, 0.015, fz]);
    }
  }

  // Turntable
  add(new THREE.CylinderGeometry(0.13, 0.13, 0.01, 32), brass, [0, 0.175, 0.02]);
  const rimQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  add(new THREE.TorusGeometry(0.13, 0.005, 8, 32), brass, [0, 0.18, 0.02], rimQ);

  // Record with label
  add(new THREE.CylinderGeometry(0.125, 0.125, 0.004, 32), black, [0, 0.181, 0.02]);
  add(new THREE.CylinderGeometry(0.045, 0.045, 0.005, 20), red, [0, 0.184, 0.02]);
  add(new THREE.CylinderGeometry(0.016, 0.016, 0.003, 16), cream, [0, 0.1855, 0.02]);

  // Spindle
  add(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 10), brass, [0, 0.2, 0.02]);

  // Horn stand post
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 12), brass, [0, 0.245, -0.13]);

  // Horn
  const throat = new THREE.Vector3(0, 0.31, -0.12);
  const dir = new THREE.Vector3(0, 0.55, 0.83).normalize();
  const L = 0.32;
  const bell = throat.clone().addScaledVector(dir, L);
  const mid = throat.clone().addScaledVector(dir, L / 2);
  const hornQ = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().negate()
  );
  const hornMat = brass.clone();
  hornMat.side = THREE.DoubleSide;
  add(new THREE.CylinderGeometry(0.014, 0.135, L, 28, 1, true), hornMat, [mid.x, mid.y, mid.z], hornQ);

  const rimDirQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  add(new THREE.TorusGeometry(0.135, 0.007, 8, 28), brass, [bell.x, bell.y, bell.z], rimDirQ);

  // Sound box at horn throat
  add(new THREE.SphereGeometry(0.02, 12, 10), brass, [throat.x, throat.y, throat.z]);

  // Tonearm pivot post and arm
  add(new THREE.CylinderGeometry(0.012, 0.014, 0.03, 12), brass, [0.15, 0.195, -0.11]);
  const P = new THREE.Vector3(0.15, 0.215, -0.11);
  const Q = new THREE.Vector3(0.065, 0.22, 0.02);
  const armVec = Q.clone().sub(P);
  const armLen = armVec.length();
  const armDir = armVec.clone().normalize();
  const armQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), armDir);
  const armMid = P.clone().add(Q).multiplyScalar(0.5);
  add(new THREE.CylinderGeometry(0.005, 0.005, armLen, 10), brass, [armMid.x, armMid.y, armMid.z], armQ);

  // Sound head at the end of the arm
  add(new THREE.BoxGeometry(0.018, 0.014, 0.026), black, [Q.x, Q.y, Q.z], armQ);
  add(new THREE.SphereGeometry(0.007, 8, 6), brass, [Q.x, Q.y - 0.01, Q.z]);

  // Wind-up crank on the right side
  const xAxisQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 16), brass, [-0.19, 0.11, 0.02], xAxisQ);
  add(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 10), brass, [-0.22, 0.11, 0.02], xAxisQ);
  add(new THREE.SphereGeometry(0.014, 10, 8), black, [-0.25, 0.11, 0.02]);

  return group;
}
