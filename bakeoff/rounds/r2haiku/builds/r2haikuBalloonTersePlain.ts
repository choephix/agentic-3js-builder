import * as THREE from "three";

export const meta = {
  name: "Hot-Air Balloon",
  description:
    "A striped red and cream hot-air balloon tethered over a wicker basket, with a gold equator band, rope rigging, and a glowing burner flame. Real scale, about 21 m tall.",
};

export default function createHotAirBalloon(): THREE.Object3D {
  const root = new THREE.Group();

  // ---------- Textures ----------

  // Gored envelope: alternating red and cream panels around the circumference.
  const stripeCanvas = document.createElement("canvas");
  stripeCanvas.width = 512;
  stripeCanvas.height = 256;
  {
    const ctx = stripeCanvas.getContext("2d")!;
    const panels = 12;
    const pw = stripeCanvas.width / panels;
    for (let i = 0; i < panels; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#d7322b" : "#f4e7c5";
      ctx.fillRect(i * pw, 0, pw + 1, stripeCanvas.height);
    }
    // Subtle seam lines between gores
    ctx.strokeStyle = "rgba(60,20,10,0.35)";
    ctx.lineWidth = 3;
    for (let i = 0; i <= panels; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pw, 0);
      ctx.lineTo(i * pw, stripeCanvas.height);
      ctx.stroke();
    }
  }
  const stripeTex = new THREE.CanvasTexture(stripeCanvas);
  stripeTex.colorSpace = THREE.SRGBColorSpace;
  stripeTex.wrapS = THREE.RepeatWrapping;

  // Wicker weave for the basket.
  const wickerCanvas = document.createElement("canvas");
  wickerCanvas.width = 128;
  wickerCanvas.height = 128;
  {
    const ctx = wickerCanvas.getContext("2d")!;
    ctx.fillStyle = "#b7834f";
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "#7a4e28";
    ctx.lineWidth = 9;
    for (let i = -128; i < 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 128, 128);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i + 128, 0);
      ctx.lineTo(i, 128);
      ctx.stroke();
    }
  }
  const wickerTex = new THREE.CanvasTexture(wickerCanvas);
  wickerTex.colorSpace = THREE.SRGBColorSpace;
  wickerTex.wrapS = THREE.RepeatWrapping;
  wickerTex.wrapT = THREE.RepeatWrapping;
  wickerTex.repeat.set(3, 2);

  // ---------- Materials ----------

  const envelopeMat = new THREE.MeshStandardMaterial({
    map: stripeTex,
    roughness: 0.75,
    side: THREE.DoubleSide,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: "#d9a53a",
    metalness: 0.6,
    roughness: 0.35,
  });
  const wickerMat = new THREE.MeshStandardMaterial({
    map: wickerTex,
    roughness: 0.95,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    color: "#5a3a22",
    roughness: 0.8,
  });
  const ropeMat = new THREE.MeshStandardMaterial({
    color: "#3a2a1a",
    roughness: 1.0,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: "#9aa3ad",
    metalness: 0.7,
    roughness: 0.4,
  });
  const flameMat = new THREE.MeshStandardMaterial({
    color: "#ff9a2e",
    emissive: "#ff7a10",
    emissiveIntensity: 2.2,
    roughness: 0.5,
  });

  // ---------- Envelope ----------

  // Profile from the mouth (bottom, open) up to the crown (top, closed).
  const profile = [
    new THREE.Vector2(2.4, 3.5),
    new THREE.Vector2(4.2, 4.5),
    new THREE.Vector2(5.9, 6.5),
    new THREE.Vector2(7.1, 9.5),
    new THREE.Vector2(7.3, 12.0),
    new THREE.Vector2(6.6, 14.5),
    new THREE.Vector2(5.0, 17.0),
    new THREE.Vector2(3.0, 19.0),
    new THREE.Vector2(1.2, 20.5),
    new THREE.Vector2(0.0, 21.2),
  ];
  const curve = new THREE.SplineCurve(profile);
  const envelopeGeo = new THREE.LatheGeometry(curve.getPoints(20), 24);
  const envelope = new THREE.Mesh(envelopeGeo, envelopeMat);
  root.add(envelope);

  // Gold equator band.
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(7.2, 0.16, 6, 24),
    goldMat
  );
  band.rotation.x = Math.PI / 2;
  band.position.y = 10.8;
  root.add(band);

  // Crown vent: dark cap with a small chimney.
  const vent = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.1, 0.5, 10),
    woodMat
  );
  vent.position.y = 21.0;
  root.add(vent);

  // Gold mouth ring at the bottom of the envelope.
  const mouthRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.45, 0.12, 6, 20),
    goldMat
  );
  mouthRing.rotation.x = Math.PI / 2;
  mouthRing.position.y = 3.5;
  root.add(mouthRing);

  // ---------- Basket ----------

  const basketW = 1.8;
  const basketH = 1.1;
  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(basketW, basketH, basketW),
    wickerMat
  );
  basket.position.y = basketH / 2;
  root.add(basket);

  // Wooden rim around the top edge.
  const rimThick = 0.12;
  const rimY = basketH + rimThick / 2;
  const rimLong = basketW + 0.2;
  const rimOffset = basketW / 2 + 0.06;
  const rimPieces: [number, number, number, number, number, number][] = [
    [rimLong, rimThick, 0.22, 0, rimY, rimOffset],
    [rimLong, rimThick, 0.22, 0, rimY, -rimOffset],
    [0.22, rimThick, rimLong, rimOffset, rimY, 0],
    [0.22, rimThick, rimLong, -rimOffset, rimY, 0],
  ];
  for (const [w, h, d, x, y, z] of rimPieces) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), woodMat);
    m.position.set(x, y, z);
    root.add(m);
  }

  // Wooden floor plate at the base.
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(basketW + 0.1, 0.1, basketW + 0.1),
    woodMat
  );
  floor.position.y = 0.05;
  root.add(floor);

  // Corner posts (small wooden pegs) for a chunky, puppet-like read.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.2, 0.16),
        woodMat
      );
      post.position.set(sx * (basketW / 2 + 0.02), basketH + 0.08, sz * (basketW / 2 + 0.02));
      root.add(post);
    }
  }

  // ---------- Burner ----------

  // Steel burner column rising from the basket centre toward the mouth.
  const burnerBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.12, 0.6),
    steelMat
  );
  burnerBase.position.set(0, basketH + 0.2, 0);
  root.add(burnerBase);

  const burnerCol = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 1.1, 8),
    steelMat
  );
  burnerCol.position.set(0, 2.1, 0);
  root.add(burnerCol);

  // Flame: a bright cone pointing up into the envelope mouth.
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.9, 8),
    flameMat
  );
  flame.position.set(0, 2.85, 0);
  root.add(flame);

  // ---------- Rigging ropes ----------

  const up = new THREE.Vector3(0, 1, 0);
  function strut(a: THREE.Vector3, b: THREE.Vector3, radius: number, mat: THREE.Material) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, len, 5),
      mat
    );
    mesh.position.copy(a).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(up, dir.normalize());
    root.add(mesh);
  }

  // Four ropes from the basket corners up to the envelope mouth.
  const mouthR = 2.4;
  const mouthY = 3.5;
  const corners = [
    [basketW / 2, basketH + 0.1, basketW / 2],
    [-basketW / 2, basketH + 0.1, basketW / 2],
    [-basketW / 2, basketH + 0.1, -basketW / 2],
    [basketW / 2, basketH + 0.1, -basketW / 2],
  ];
  const mouthAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  for (let i = 0; i < 4; i++) {
    const [cx, cy, cz] = corners[i];
    const a = mouthAngles[i];
    const from = new THREE.Vector3(cx, cy, cz);
    const to = new THREE.Vector3(Math.cos(a) * mouthR, mouthY, Math.sin(a) * mouthR);
    strut(from, to, 0.035, ropeMat);
  }

  // Extra ropes to the mouth ring at the midpoints, for a fuller rigging look.
  const midAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  for (let i = 0; i < 4; i++) {
    const a = midAngles[i];
    const from = new THREE.Vector3(
      Math.cos(a) * (basketW / 2 + 0.02),
      basketH + 0.1,
      Math.sin(a) * (basketW / 2 + 0.02)
    );
    const to = new THREE.Vector3(Math.cos(a) * mouthR * 0.98, mouthY, Math.sin(a) * mouthR * 0.98);
    strut(from, to, 0.03, ropeMat);
  }

  return root;
}
