import * as THREE from "three";

export const meta = {
  name: "1930s Racing Green Typewriter",
  description:
    "Glossy racing green portable typewriter with cream-lettered keys on chrome rims, a fan of type bars, a chrome carriage return lever, a black platen and a half-typed sheet of paper.",
};

const KEY_CHARS = [..."1234567890QWERTYUIOPASDFGHJKLZXCVBNM"]; // 36 keys
const ROWS = [
  { count: 10, start: 0, z: -0.036, shift: -0.0165 },
  { count: 10, start: 10, z: -0.013, shift: -0.0055 },
  { count: 9, start: 20, z: 0.010, shift: 0.0055 },
  { count: 7, start: 29, z: 0.033, shift: 0.0165 },
];

function makeKeyAtlas(): THREE.CanvasTexture {
  const size = 512;
  const cells = 8;
  const cell = size / cells;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#161616";
  g.fillRect(0, 0, size, size);
  g.fillStyle = "#efe4c6";
  g.font = "bold 40px Helvetica, Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  KEY_CHARS.forEach((ch, k) => {
    const col = k % cells;
    const row = Math.floor(k / cells);
    g.fillText(ch, col * cell + cell / 2, row * cell + cell / 2 + 2);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makePaperTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 640;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f3eedc";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#2a2a30";
  g.font = "23px 'Courier New', Courier, monospace";
  g.textBaseline = "alphabetic";
  const lines = [
    "Dear Mr. Harlow,",
    "",
    "Further to our telephone call I",
    "enclose the revised schedule for the",
    "autumn consignment. Kindly confirm",
    "the quantities by return, as the",
    "dispatch office closes on Friday, and",
    "we would hate to miss the boat once",
    "again. With kind regards,",
  ];
  lines.forEach((line, i) => {
    const y = 600 - (lines.length - 1 - i) * 36;
    g.fillText(line, 56, y);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeBadgeTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 166;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#d9b06a");
  grad.addColorStop(1, "#a9782c");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "#5a3a14";
  g.lineWidth = 6;
  g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = "#3a2410";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "bold 58px Georgia, 'Times New Roman', serif";
  g.fillText("MERIDIAN", w / 2, h * 0.42);
  g.font = "bold 22px Georgia, serif";
  g.fillText("PORTABLE  ·  MODEL 6", w / 2, h * 0.76);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// A thin cylinder stretched between two points.
function rod(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material): THREE.Mesh {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.clone().sub(a).normalize()
  );
  return m;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();

  // ---- materials (one per colour, shared) ----
  const green = new THREE.MeshStandardMaterial({ color: 0x0c5b3a, roughness: 0.22, metalness: 0.05 });
  const greenDark = new THREE.MeshStandardMaterial({ color: 0x073d27, roughness: 0.3, metalness: 0.05 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe4e6ea, roughness: 0.16, metalness: 1 });
  const black = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.45, metalness: 0.2 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.9 });
  const keyCap = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5 });
  const keyAtlasMat = new THREE.MeshStandardMaterial({ map: makeKeyAtlas(), roughness: 0.4 });
  const paperMat = new THREE.MeshStandardMaterial({
    map: makePaperTexture(),
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    map: makeBadgeTexture(),
    metalness: 0.6,
    roughness: 0.35,
  });

  // ---- base and housing ----
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.23), greenDark);
  plinth.position.set(0, 0.015, -0.03);
  root.add(plinth);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.09, 0.2), green);
  body.position.set(0, 0.075, -0.03);
  root.add(body);

  const backHousing = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.06, 0.10), green);
  backHousing.position.set(0, 0.15, -0.135);
  root.add(backHousing);

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 12), rubber);
      foot.position.set(sx * 0.17, 0.003, sz > 0 ? 0.06 : -0.14);
      root.add(foot);
    }
  }

  // ---- keyboard group: sloped, facing the operator ----
  const keyGroup = new THREE.Group();
  keyGroup.position.set(0, 0.118, 0.045);
  keyGroup.rotation.x = 0.3;
  root.add(keyGroup);

  // Sloped key bank and its front wedge
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.006, 0.19), green);
  plate.position.set(0, 0, 0.015);
  keyGroup.add(plate);

  const wedge = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.09, 0.2), green);
  wedge.position.set(0, -0.048, 0);
  keyGroup.add(wedge);

  // Brass maker's badge on the front of the wedge
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.026), brassMat);
  badge.position.set(0, -0.048, 0.1015);
  keyGroup.add(badge);

  const capGeo = new THREE.CylinderGeometry(0.0092, 0.0102, 0.008, 18);
  const rimGeo = new THREE.TorusGeometry(0.0106, 0.0013, 6, 18);
  const topBase = new THREE.CircleGeometry(0.0092, 18);
  topBase.rotateX(-Math.PI / 2 + 0); // placed flat later via mesh rotation; keep base geometry flat in XZ
  const topRot = new THREE.CircleGeometry(0.0092, 18);

  let k = 0;
  for (const row of ROWS) {
    for (let i = 0; i < row.count; i++, k++) {
      const x = (i - (row.count - 1) / 2) * 0.0215 + row.shift;
      const kg = new THREE.Group();
      kg.position.set(x, 0, row.z);
      keyGroup.add(kg);

      const rim = new THREE.Mesh(rimGeo, chrome);
      rim.rotation.x = Math.PI / 2;
      kg.add(rim);

      const cap = new THREE.Mesh(capGeo, keyCap);
      cap.position.y = 0.004;
      kg.add(cap);

      // Letter face: atlas cell remapped into the circle's UVs
      const geo = topRot.clone();
      const uv = geo.attributes.uv as THREE.BufferAttribute;
      const col = k % 8;
      const cellRow = Math.floor(k / 8);
      for (let j = 0; j < uv.count; j++) {
        const u = uv.getX(j);
        const v = uv.getY(j);
        uv.setXY(j, (col + u) / 8, 1 - (cellRow + 1 - v) / 8);
      }
      const face = new THREE.Mesh(geo, keyAtlasMat);
      face.rotation.x = -Math.PI / 2;
      face.position.y = 0.0081;
      kg.add(face);
    }
  }
  topBase.dispose();

  // Space bar
  const spaceRim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.004, 0.022), chrome);
  spaceRim.position.set(0, 0, 0.058);
  keyGroup.add(spaceRim);
  const space = new THREE.Mesh(new THREE.BoxGeometry(0.112, 0.006, 0.016), keyCap);
  space.position.set(0, 0.005, 0.058);
  keyGroup.add(space);

  // ---- type-bar fan: semicircle of thin bars converging on the platen ----
  const P = new THREE.Vector3(0, 0.2, -0.103);
  const R = 0.09;
  const phi = 0.62;
  const barGeo = new THREE.BoxGeometry(0.0022, 0.0022, R);
  const headGeo = new THREE.BoxGeometry(0.004, 0.004, 0.004);
  for (let i = 0; i < 36; i++) {
    const a = THREE.MathUtils.lerp(-1.35, 1.35, i / 35);
    const dir = new THREE.Vector3(
      Math.sin(a) * Math.cos(phi),
      -Math.sin(phi),
      Math.cos(a) * Math.cos(phi)
    );
    const Q = P.clone().addScaledVector(dir, R);
    const mid = P.clone().addScaledVector(dir, R / 2);
    const bar = new THREE.Mesh(barGeo, chrome);
    bar.position.copy(mid);
    bar.lookAt(P);
    root.add(bar);

    const head = new THREE.Mesh(headGeo, chrome);
    head.position.copy(Q);
    root.add(head);
  }

  // ---- carriage and platen ----
  for (const sx of [-1, 1]) {
    const plateEnd = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.1, 0.07), black);
    plateEnd.position.set(sx * 0.205, 0.2, -0.125);
    root.add(plateEnd);
  }
  const carriageBar = new THREE.Mesh(new THREE.BoxGeometry(0.428, 0.012, 0.06), chrome);
  carriageBar.position.set(0, 0.245, -0.125);
  root.add(carriageBar);

  const platen = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.40, 24), rubber);
  platen.rotation.z = Math.PI / 2;
  platen.position.set(0, 0.2, -0.125);
  root.add(platen);

  const platenKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.025, 16), chrome);
  platenKnob.rotation.z = Math.PI / 2;
  platenKnob.position.set(0.22, 0.2, -0.125);
  root.add(platenKnob);

  // ---- half-typed sheet rising from the platen ----
  const paperGroup = new THREE.Group();
  paperGroup.position.set(0, 0.2, -0.103);
  paperGroup.rotation.x = -0.2;
  root.add(paperGroup);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.26), paperMat);
  sheet.position.set(0, 0.13, 0.001);
  paperGroup.add(sheet);

  // ---- carriage return lever (right side, chrome) ----
  const lever = new THREE.Group();
  root.add(lever);
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.03), chrome);
  bracket.position.set(-0.225, 0.165, -0.13);
  lever.add(bracket);
  lever.add(
    rod(
      new THREE.Vector3(-0.226, 0.17, -0.15),
      new THREE.Vector3(-0.226, 0.13, -0.005),
      0.0045,
      chrome
    )
  );
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), chrome);
  knob.position.set(-0.226, 0.13, -0.005);
  lever.add(knob);

  return root;
}
