import * as THREE from "three";

export const meta = {
  name: "Seaside Ice Cream Cart",
  description:
    "A mint and cream ice cream cart with a pink-and-white scalloped canopy, spoked wheels, a chrome freezer lid, a cone-shaped hand-painted sign and a row of giant pastel cones on top.",
};

type Mats = {
  mint: THREE.MeshStandardMaterial;
  cream: THREE.MeshStandardMaterial;
  pink: THREE.MeshStandardMaterial;
  white: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  tyre: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  wafer: THREE.MeshStandardMaterial;
  cherry: THREE.MeshStandardMaterial;
  flavours: THREE.MeshStandardMaterial[];
};

function makeMaterials(): Mats {
  const std = (color: number, roughness = 0.55, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return {
    mint: std(0x8fd9c0, 0.5),
    cream: std(0xfff3e0, 0.6),
    pink: std(0xf27c9e, 0.5),
    white: std(0xffffff, 0.5),
    chrome: std(0xdfe6ea, 0.2, 1),
    tyre: std(0x2d2a2e, 0.8),
    dark: std(0x2b2a33, 0.9),
    wafer: std(0xd9a466, 0.7),
    cherry: std(0xe0445a, 0.35),
    flavours: [
      std(0xffb3c6, 0.45), // strawberry
      std(0xbfe8d6, 0.45), // pistachio mint
      std(0xd9c8ff, 0.45), // lavender
      std(0xfff1a8, 0.45), // lemon
      std(0xffd1a8, 0.45), // peach
    ],
  };
}

function add(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

// Canopy arc height above the canopy edge, for a point at lateral offset x.
// Canopy: semicircle radius 0.8 centred on y = 1.45.
function canopyArcY(x: number): number {
  return 1.45 + Math.sqrt(Math.max(0, 0.64 - x * x));
}

function signTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 384;
  const g = c.getContext("2d") as CanvasRenderingContext2D;
  g.fillStyle = "#fff3e0";
  g.fillRect(0, 0, 512, 384);
  g.strokeStyle = "#f27c9e";
  g.lineWidth = 18;
  g.strokeRect(14, 14, 484, 356);
  g.fillStyle = "#f27c9e";
  g.font = 'bold 100px "Trebuchet MS", Arial, sans-serif';
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("SCOOPS", 256, 180);
  // hand-painted wave border under the word
  g.fillStyle = "#6fcfb0";
  for (let x = 80; x <= 440; x += 45) {
    g.beginPath();
    g.arc(x, 286, 20, 0, Math.PI);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeWheel(M: Mats): THREE.Group {
  const wheel = new THREE.Group();
  // tyre ring, axis along X
  const tyreGeo = new THREE.TorusGeometry(0.4, 0.07, 10, 28);
  tyreGeo.rotateY(Math.PI / 2);
  add(wheel, tyreGeo, M.tyre);
  // pink rim band
  const rimGeo = new THREE.TorusGeometry(0.4, 0.02, 8, 28);
  rimGeo.rotateY(Math.PI / 2);
  add(wheel, rimGeo, M.pink, 0.05, 0, 0);
  add(wheel, rimGeo, M.pink, -0.05, 0, 0);
  // spokes: four full-diameter bars give eight spokes
  const spokeGeo = new THREE.BoxGeometry(0.035, 0.74, 0.035);
  for (let i = 0; i < 4; i++) {
    const s = add(wheel, spokeGeo, M.pink);
    s.rotation.x = (i * Math.PI) / 4;
  }
  // chrome hub
  const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.14, 12);
  hubGeo.rotateZ(Math.PI / 2);
  add(wheel, hubGeo, M.chrome);
  return wheel;
}

export default function build(): THREE.Object3D {
  const M = makeMaterials();
  const root = new THREE.Group();

  // ---- Body ----
  add(root, new THREE.BoxGeometry(1.1, 0.85, 1.6), M.mint, 0, 0.775, 0);
  add(root, new THREE.BoxGeometry(1.13, 0.06, 1.63), M.cream, 0, 1.2, 0);
  add(root, new THREE.BoxGeometry(1.13, 0.1, 1.63), M.cream, 0, 0.36, 0);
  // pink pinstripes on both sides
  add(root, new THREE.BoxGeometry(0.02, 0.07, 1.62), M.pink, 0.556, 0.62, 0);
  add(root, new THREE.BoxGeometry(0.02, 0.07, 1.62), M.pink, -0.556, 0.62, 0);

  // ---- Front service window and counter ----
  add(root, new THREE.BoxGeometry(0.78, 0.3, 0.03), M.cream, 0, 1.01, 0.8);
  add(root, new THREE.PlaneGeometry(0.7, 0.22), M.dark, 0, 1.01, 0.818);
  add(root, new THREE.BoxGeometry(0.84, 0.04, 0.16), M.chrome, 0, 0.86, 0.88);

  // ---- Cone-shaped hand-painted sign on the front ----
  const signShape = new THREE.Shape();
  signShape.moveTo(-0.3, 0.2);
  signShape.quadraticCurveTo(0, 0.28, 0.3, 0.2);
  signShape.lineTo(0, -0.2);
  signShape.lineTo(-0.3, 0.2);
  const signGeo = new THREE.ShapeGeometry(signShape);
  const suv = signGeo.attributes.uv as THREE.BufferAttribute;
  const spos = signGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < spos.count; i++) {
    suv.setXY(i, (spos.getX(i) + 0.3) / 0.6, (spos.getY(i) + 0.2) / 0.44);
  }
  suv.needsUpdate = true;
  const signMat = new THREE.MeshStandardMaterial({
    map: signTexture(),
    roughness: 0.6,
  });
  add(root, signGeo, signMat, 0, 0.58, 0.822);

  // ---- Chrome freezer lid (half cylinder, top half) ----
  const lidGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.9, 20, 1, false, Math.PI / 2, Math.PI);
  lidGeo.rotateX(Math.PI / 2);
  add(root, lidGeo, M.chrome, 0, 1.2, 0.1);

  // ---- Canopy: eight alternating pink and white arc segments ----
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.CylinderGeometry(
      0.8,
      0.8,
      1.8,
      2,
      1,
      true,
      Math.PI / 2 + (i * Math.PI) / 8,
      Math.PI / 8
    );
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 1.45, -0.05);
    const mat = i % 2 === 0 ? M.pink : M.white;
    const seg = new THREE.Mesh(geo, mat);
    // canopy stripes are visible from both sides
    mat.side = THREE.DoubleSide;
    root.add(seg);
  }

  // ---- Scalloped valance along the front and back canopy edges ----
  const scallopGeo = new THREE.SphereGeometry(0.095, 12, 8);
  for (let i = 0; i < 9; i++) {
    const x = -0.72 + i * 0.18;
    const y = canopyArcY(x) - 0.02;
    const mat = i % 2 === 0 ? M.pink : M.white;
    add(root, scallopGeo, mat, x, y, 0.86);
    add(root, scallopGeo, mat, x, y, -0.96);
  }

  // ---- Canopy poles (chrome) ----
  const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 8);
  for (const sx of [-0.78, 0.78]) {
    for (const sz of [-0.7, 0.7]) {
      add(root, poleGeo, M.chrome, sx, 1.325, sz);
    }
  }

  // ---- Spoked wheels ----
  const wheelL = makeWheel(M);
  wheelL.position.set(0.62, 0.47, 0.15);
  root.add(wheelL);
  const wheelR = makeWheel(M);
  wheelR.position.set(-0.62, 0.47, 0.15);
  root.add(wheelR);

  // ---- Chrome push handle at the back ----
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.5, 0.4, -0.82),
    new THREE.Vector3(-0.5, 1.0, -1.08),
    new THREE.Vector3(0.5, 1.0, -1.08),
    new THREE.Vector3(0.5, 0.4, -0.82),
  ]);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 40, 0.035, 8, false);
  add(root, handleGeo, M.chrome);

  // ---- Giant pastel cones tip-down along the canopy ridge ----
  const ridgeY = canopyArcY(0); // 2.25
  const waferGeo = new THREE.ConeGeometry(0.2, 0.5, 16);
  waferGeo.rotateX(Math.PI);
  const scoopGeo = new THREE.SphereGeometry(0.26, 16, 12);
  const swirlGeo = new THREE.SphereGeometry(0.1, 10, 8);
  const cherryGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const cones = [-0.6, -0.2, 0.2, 0.6];
  cones.forEach((z, i) => {
    add(root, waferGeo, M.wafer, 0, ridgeY + 0.25, z);
    const baseY = ridgeY + 0.5;
    const flavour = M.flavours[i % M.flavours.length];
    const scoop = add(root, scoopGeo, flavour, 0, baseY + 0.12, z);
    scoop.scale.set(1, 0.8, 1);
    // three swirl blobs on top of the scoop
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + i * 0.5;
      add(
        root,
        swirlGeo,
        flavour,
        Math.cos(a) * 0.12,
        baseY + 0.3,
        z + Math.sin(a) * 0.12
      );
    }
    if (i % 2 === 0) {
      add(root, cherryGeo, M.cherry, 0, baseY + 0.42, z);
    }
  });

  return root;
}
