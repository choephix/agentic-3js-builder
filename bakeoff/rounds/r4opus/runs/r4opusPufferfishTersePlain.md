```ts
import * as THREE from "three";

export const meta = {
  name: "Puffed-Up Pufferfish",
  description:
    "A stylized low-poly inflated pufferfish: a faceted mustard-and-cream ball covered in two-tone spines, big half-lidded teal eyes, a coral pucker mouth with beak plates, and scalloped orange fans for fins and tail.",
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = makeRng(1337);
  const root = new THREE.Group();

  // ---------- Palette ----------
  const MUSTARD = "#d9a83a";

  // ---------- Body texture ----------
  const bc = document.createElement("canvas");
  bc.width = 512;
  bc.height = 256;
  const bx = bc.getContext("2d")!;
  const grad = bx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, "#c8952c");
  grad.addColorStop(0.25, MUSTARD);
  grad.addColorStop(0.48, "#e8c25a");
  grad.addColorStop(0.6, "#f3e8c8");
  grad.addColorStop(1.0, "#fbf7ec");
  bx.fillStyle = grad;
  bx.fillRect(0, 0, 512, 256);

  const ellipseWrapped = (x: number, y: number, rx: number, ry: number) => {
    for (const off of [-512, 0, 512]) {
      bx.beginPath();
      bx.ellipse(x + off, y, rx, ry, 0, 0, Math.PI * 2);
      bx.fill();
    }
  };
  // saddle patches
  bx.fillStyle = "rgba(150,100,30,0.35)";
  for (let i = 0; i < 5; i++) {
    const x = (i / 5) * 512 + rand() * 40;
    const y = 50 + rand() * 40;
    const th = (Math.PI * y) / 256;
    ellipseWrapped(x, y, 38 / Math.max(Math.sin(th), 0.3), 26);
  }
  // spots
  bx.fillStyle = "#5e3a1a";
  for (let i = 0; i < 170; i++) {
    const y = 8 + Math.pow(rand(), 0.9) * 135;
    const x = rand() * 512;
    const r = 3 + rand() * 5;
    const th = (Math.PI * y) / 256;
    ellipseWrapped(x, y, r / Math.max(Math.sin(th), 0.25), r);
  }
  // a few tiny light freckles on belly line
  bx.fillStyle = "rgba(255,255,240,0.7)";
  for (let i = 0; i < 40; i++) {
    const y = 140 + rand() * 30;
    ellipseWrapped(rand() * 512, y, 2 + rand() * 2, 2 + rand() * 2);
  }
  const bodyTex = new THREE.CanvasTexture(bc);
  bodyTex.colorSpace = THREE.SRGBColorSpace;

  // ---------- Fin texture (scalloped radial fan) ----------
  const fc = document.createElement("canvas");
  fc.width = 256;
  fc.height = 256;
  const fx = fc.getContext("2d")!;
  const C = 128;
  const RAYS = 44;
  fx.clearRect(0, 0, 256, 256);
  fx.beginPath();
  for (let i = 0; i <= 720; i++) {
    const a = (i / 720) * Math.PI * 2;
    const r = C * (0.84 + 0.14 * Math.pow(Math.abs(Math.cos((a * RAYS) / 2)), 0.6));
    const px = C + Math.cos(a) * r;
    const py = C + Math.sin(a) * r;
    if (i === 0) fx.moveTo(px, py);
    else fx.lineTo(px, py);
  }
  fx.closePath();
  const fg = fx.createRadialGradient(C, C, 0, C, C, C);
  fg.addColorStop(0.0, "#ffd36a");
  fg.addColorStop(0.45, "#ffae3d");
  fg.addColorStop(0.85, "#f27a2a");
  fg.addColorStop(1.0, "#c8501e");
  fx.fillStyle = fg;
  fx.fill();
  fx.strokeStyle = "rgba(140,55,15,0.75)";
  fx.lineWidth = 3;
  for (let i = 0; i < RAYS; i++) {
    const a = (i / RAYS) * Math.PI * 2;
    fx.beginPath();
    fx.moveTo(C + Math.cos(a) * 10, C + Math.sin(a) * 10);
    fx.lineTo(C + Math.cos(a) * C * 0.97, C + Math.sin(a) * C * 0.97);
    fx.stroke();
  }
  const finTex = new THREE.CanvasTexture(fc);
  finTex.colorSpace = THREE.SRGBColorSpace;

  // ---------- Materials ----------
  const mBody = new THREE.MeshStandardMaterial({ map: bodyTex, flatShading: true, roughness: 0.55 });
  const mMustard = new THREE.MeshStandardMaterial({ color: MUSTARD, flatShading: true, roughness: 0.55 });
  const mSpineDark = new THREE.MeshStandardMaterial({ color: "#7a4a1c", flatShading: true, roughness: 0.5 });
  const mSpineMid = new THREE.MeshStandardMaterial({ color: "#c99a3a", flatShading: true, roughness: 0.5 });
  const mSpineLight = new THREE.MeshStandardMaterial({ color: "#f2e7c9", flatShading: true, roughness: 0.5 });
  const mWhite = new THREE.MeshStandardMaterial({ color: "#fbfbf2", roughness: 0.25 });
  const mIris = new THREE.MeshStandardMaterial({ color: "#1fa39a", roughness: 0.3, metalness: 0.1 });
  const mGold = new THREE.MeshStandardMaterial({ color: "#f2c230", roughness: 0.3, metalness: 0.2 });
  const mDark = new THREE.MeshStandardMaterial({ color: "#16141a", roughness: 0.4 });
  const mLips = new THREE.MeshStandardMaterial({ color: "#ef7a6a", flatShading: true, roughness: 0.5 });
  const mBlush = new THREE.MeshStandardMaterial({ color: "#f7a08e", roughness: 0.7 });
  const mFin = new THREE.MeshStandardMaterial({
    map: finTex,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.5,
  });

  // ---------- Body ----------
  const R = 0.16;
  const SX = 1.0, SY = 0.94, SZ = 1.1;
  const body = new THREE.Mesh(new THREE.SphereGeometry(R, 16, 12), mBody);
  body.scale.set(SX, SY, SZ);
  root.add(body);

  const surf = (d: THREE.Vector3) => new THREE.Vector3(d.x * R * SX, d.y * R * SY, d.z * R * SZ);
  const nrm = (d: THREE.Vector3) => new THREE.Vector3(d.x / SX, d.y / SY, d.z / SZ).normalize();
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();

  const fanGeo = (radius: number, spread: number, center: number, segs: number) =>
    new THREE.CircleGeometry(radius, segs, center - spread / 2, spread);

  // ---------- Feature directions ----------
  const eyeD = v(0.62, 0.36, 0.7);
  const mouthD = v(0, -0.12, 1);
  const tailD = v(0, 0, -1);
  const pecD = v(0.95, -0.05, -0.12);
  const dorsalD = v(0, 0.62, -0.78);
  const analD = v(0, -0.55, -0.83);
  const gillD = v(0.93, 0.02, 0.2);

  // ---------- Spines ----------
  const spineGeo = new THREE.ConeGeometry(0.0085, 0.042, 4, 1);
  spineGeo.translate(0, 0.021, 0);
  const up = new THREE.Vector3(0, 1, 0);
  const N = 190;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - ((i + 0.5) / N) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const d = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    const mirrorX = (a: THREE.Vector3) => new THREE.Vector3(-a.x, a.y, a.z);
    if (d.dot(eyeD) > 0.86 || d.dot(mirrorX(eyeD)) > 0.86) continue;
    if (d.dot(mouthD) > 0.93) continue;
    if (d.dot(tailD) > 0.9) continue;
    if (d.dot(pecD) > 0.96 || d.dot(mirrorX(pecD)) > 0.96) continue;
    if (d.dot(gillD) > 0.985 || d.dot(mirrorX(gillD)) > 0.985) continue;
    if (d.dot(dorsalD) > 0.95 || d.dot(analD) > 0.95) continue;
    const mat = d.y > 0.15 ? mSpineDark : d.y > -0.2 ? mSpineMid : mSpineLight;
    const s = new THREE.Mesh(spineGeo, mat);
    s.position.copy(surf(d).multiplyScalar(0.97));
    s.quaternion.setFromUnitVectors(up, nrm(d));
    const len = 0.8 + rand() * 0.45;
    s.scale.set(1, len, 1);
    s.rotateY(rand() * Math.PI);
    root.add(s);
  }

  // ---------- One side (left, +X), mirrored for right ----------
  const side = new THREE.Group();

  // Eye
  const eye = new THREE.Group();
  eye.position.copy(surf(eyeD).multiplyScalar(0.9));
  eye.lookAt(eye.position.clone().add(v(0.72, 0.22, 0.66)));
  const ER = 0.042;
  eye.add(new THREE.Mesh(new THREE.SphereGeometry(ER, 14, 10), mWhite));
  const iris = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 8), mIris);
  iris.scale.set(1, 1, 0.45);
  iris.position.set(0, -0.002, 0.032);
  eye.add(iris);
  const irisRing = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.003, 4, 16), mGold);
  irisRing.position.set(0, -0.002, 0.038);
  eye.add(irisRing);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 8), mDark);
  pupil.scale.set(1, 1.15, 0.4);
  pupil.position.set(0, -0.003, 0.042);
  eye.add(pupil);
  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 6), mWhite);
  glint.position.set(0.007, 0.004, 0.047);
  eye.add(glint);
  const glint2 = new THREE.Mesh(new THREE.SphereGeometry(0.003, 6, 4), mWhite);
  glint2.position.set(-0.006, -0.009, 0.046);
  eye.add(glint2);
  const socket = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.009, 6, 18), mMustard);
  socket.position.z = 0.008;
  eye.add(socket);
  const lid = new THREE.Mesh(
    new THREE.SphereGeometry(ER * 1.1, 16, 6, 0, Math.PI * 2, 0, 1.18),
    mMustard
  );
  lid.rotation.x = 0.32;
  eye.add(lid);
  // lid edge lash line
  const lash = new THREE.Mesh(
    new THREE.TorusGeometry(ER * 1.02, 0.0035, 4, 14, Math.PI * 0.8),
    mSpineDark
  );
  lash.position.set(0, 0.012, 0.012);
  lash.rotation.set(-1.25, 0, Math.PI * 0.1);
  eye.add(lash);
  side.add(eye);

  // Blush
  const blushD = v(0.55, 0.0, 0.83);
  const blush = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 6), mBlush);
  blush.position.copy(surf(blushD).multiplyScalar(0.995));
  blush.lookAt(blush.position.clone().add(nrm(blushD)));
  blush.scale.set(1.2, 0.7, 0.18);
  side.add(blush);

  // Gill slit
  const gill = new THREE.Group();
  gill.position.copy(surf(gillD).multiplyScalar(1.0));
  gill.lookAt(gill.position.clone().add(nrm(gillD)));
  const arcLen = Math.PI * 0.85;
  const slit = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.0035, 4, 10, arcLen), mDark);
  slit.rotation.z = -arcLen / 2;
  gill.add(slit);
  side.add(gill);

  // Pectoral fin
  const pec = new THREE.Group();
  pec.position.copy(surf(pecD).multiplyScalar(0.98));
  pec.rotation.y = 0.85;
  const pecFan = new THREE.Mesh(fanGeo(0.078, 1.55, 0, 12), mFin);
  pecFan.rotation.z = -0.3;
  pec.add(pecFan);
  const pecNub = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), mMustard);
  pecNub.scale.set(0.6, 1.4, 1);
  pec.add(pecNub);
  side.add(pec);

  // Nostril
  const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), mDark);
  const nD = v(0.22, 0.12, 0.97);
  nostril.position.copy(surf(nD));
  nostril.scale.set(1, 1, 0.5);
  nostril.lookAt(nostril.position.clone().add(nrm(nD)));
  side.add(nostril);

  root.add(side);
  const sideR = side.clone();
  sideR.scale.x = -1;
  root.add(sideR);

  // ---------- Mouth ----------
  const mouth = new THREE.Group();
  mouth.position.copy(surf(mouthD)).add(nrm(mouthD).multiplyScalar(0.004));
  const lips = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.0095, 6, 14), mLips);
  lips.scale.set(1.15, 0.85, 1.3);
  mouth.add(lips);
  const throat = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 12), mDark);
  throat.rotation.x = Math.PI / 2;
  throat.scale.set(1.1, 1, 0.8);
  throat.position.z = -0.003;
  mouth.add(throat);
  const toothGeo = new THREE.BoxGeometry(0.02, 0.0065, 0.008);
  const toothTop = new THREE.Mesh(toothGeo, mWhite);
  toothTop.position.set(0, 0.0075, 0.003);
  mouth.add(toothTop);
  const toothBot = new THREE.Mesh(toothGeo, mWhite);
  toothBot.position.set(0, -0.0075, 0.003);
  mouth.add(toothBot);
  root.add(mouth);

  // ---------- Dorsal & anal fins ----------
  const dorsal = new THREE.Group();
  dorsal.position.copy(surf(dorsalD).multiplyScalar(0.95));
  dorsal.rotation.y = Math.PI / 2;
  dorsal.add(new THREE.Mesh(fanGeo(0.075, 1.2, 0.8, 10), mFin));
  root.add(dorsal);

  const anal = new THREE.Group();
  anal.position.copy(surf(analD).multiplyScalar(0.95));
  anal.rotation.y = Math.PI / 2;
  anal.add(new THREE.Mesh(fanGeo(0.06, 1.0, -0.55, 9), mFin));
  root.add(anal);

  // ---------- Tail ----------
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.048, 0.075, 10), mMustard);
  ped.rotation.x = -Math.PI / 2;
  ped.position.z = -R * SZ - 0.017;
  root.add(ped);
  // a couple of spots on the tail stalk
  for (let i = 0; i < 3; i++) {
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 4), mSpineDark);
    const a = -0.6 + i * 0.6;
    const z = ped.position.z - 0.01 + i * 0.008;
    const rr = 0.036 - i * 0.002;
    sp.position.set(Math.sin(a) * rr, Math.cos(a) * rr, z);
    sp.scale.set(1, 1, 0.5);
    root.add(sp);
  }
  const tail = new THREE.Group();
  tail.position.z = ped.position.z - 0.036;
  tail.rotation.y = Math.PI / 2;
  tail.add(new THREE.Mesh(fanGeo(0.105, 1.8, 0, 14), mFin));
  const tailKnob = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), mMustard);
  tailKnob.scale.set(0.8, 1, 0.8);
  tail.add(tailKnob);
  root.add(tail);

  // ---------- Slight playful tilt, then ground it ----------
  const holder = new THREE.Group();
  root.rotation.x = 0.06; // nose dips a touch
  holder.add(root);
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(holder, true);
  root.position.y = -box.min.y;
  root.position.x = -(box.min.x + box.max.x) / 2;

  return holder;
}
```