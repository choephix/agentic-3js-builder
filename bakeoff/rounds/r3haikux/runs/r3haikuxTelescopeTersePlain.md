```ts
import * as THREE from "three";

export const meta = {
  name: "Refractor Telescope on Tripod",
  description:
    "A 120 mm ivory refractor on a walnut tripod: graphite fork mount, brass cradle rings, a finder scope, a canvas label plate and an accessory tray.",
};

// ---------- helpers ----------
const UP = new THREE.Vector3(0, 1, 0);
const XAX = new THREE.Vector3(1, 0, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const at = (p: THREE.Vector3, d: THREE.Vector3, s: number) => p.clone().addScaledVector(d, s);
type Vec3 = [number, number, number];

function std(
  color: number,
  roughness: number,
  metalness = 0,
  extra: THREE.MeshStandardMaterialParameters = {}
) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
}

// One material per colour, shared by every mesh that uses it.
const M = {
  ivory: std(0xece4cf, 0.5),
  navy: std(0x1f3b57, 0.45),
  graphite: std(0x2e3238, 0.4, 0.5),
  brass: std(0xc99a3d, 0.3, 0.85),
  walnut: std(0x7a4a26, 0.7),
  tray: std(0xa86f3c, 0.6),
  rubber: std(0x1b1b1b, 0.9),
  glass: std(0x8fd3e8, 0.06, 0.1, { emissive: 0x1d3e4a, emissiveIntensity: 0.7 }),
  red: std(0xb8402f, 0.55),
  paper: std(0xe9dfc4, 0.85),
};

// Mesh at a position with an optional Euler rotation.
function put(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  m: THREE.Material,
  pos: Vec3,
  rot: Vec3 = [0, 0, 0]
) {
  const o = new THREE.Mesh(geo, m);
  o.position.set(pos[0], pos[1], pos[2]);
  o.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(o);
  return o;
}

// Round rod from a to b (the geometry's Y axis runs from a to b).
function rod(
  parent: THREE.Object3D,
  a: THREE.Vector3,
  b: THREE.Vector3,
  rTop: number,
  rBot: number,
  m: THREE.Material,
  seg = 14
) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, seg), m);
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  parent.add(mesh);
  return mesh;
}

// Rectangular bar from a to b; w and dp are its two cross-section sizes.
function bar(
  parent: THREE.Object3D,
  a: THREE.Vector3,
  b: THREE.Vector3,
  w: number,
  dp: number,
  m: THREE.Material
) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, len, dp), m);
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  parent.add(mesh);
  return mesh;
}

// Torus centred at c, lying in the plane perpendicular to n.
function ring(
  parent: THREE.Object3D,
  c: THREE.Vector3,
  n: THREE.Vector3,
  radius: number,
  tube: number,
  m: THREE.Material
) {
  const r = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 28), m);
  r.position.copy(c);
  r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n.clone().normalize());
  parent.add(r);
  return r;
}

// Canvas-drawn label for the tube. Falls back to a plain navy material if no DOM.
function labelTexture(): THREE.CanvasTexture | null {
  const doc: any = (globalThis as any).document;
  if (!doc || typeof doc.createElement !== "function") return null;
  const cv = doc.createElement("canvas");
  cv.width = 500;
  cv.height = 200;
  const g = cv.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#1f3b57";
  g.fillRect(0, 0, 500, 200);
  g.strokeStyle = "#c99a3d";
  g.lineWidth = 10;
  g.strokeRect(14, 14, 472, 172);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#ece4cf";
  g.font = "bold 62px Georgia, serif";
  g.fillText("120 · f/7.5", 250, 88);
  g.fillStyle = "#c99a3d";
  g.font = "26px Georgia, serif";
  g.fillText("REFRACTOR · 900 mm", 250, 146);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- model ----------
export default function build(): THREE.Object3D {
  const root = new THREE.Group();

  // Key points in metres, model space.
  const B = V(0, 0.92, 0); // polar axis base, sits on the hub
  const P = V(0, 0.62, 0.78).normalize(); // polar axis, tilted toward the front
  const T = V(0, 0.6, 0.8).normalize(); // optical tube axis, up and forward
  const Ctop = at(B, P, 0.42); // top of polar axis, fork head
  const Q = Ctop.clone().add(V(0, 0.3, 0.32)); // declination axis, tube cradle centre
  const top = V(0, 0.84, 0); // where the tripod legs meet

  // ----- tripod: three walnut legs, rubber feet -----
  const feet = [V(0, 0.03, -0.5), V(-0.433, 0.03, 0.25), V(0.433, 0.03, 0.25)];
  for (const f of feet) {
    bar(root, f, top, 0.04, 0.03, M.walnut);
    put(root, new THREE.CylinderGeometry(0.028, 0.03, 0.03, 14), M.rubber, [f.x, 0.015, f.z]);
  }

  // Accessory tray with brass rim, central column, and a few things on it.
  const trayY = 0.45;
  const trayTop = trayY + 0.012;
  put(root, new THREE.CylinderGeometry(0.2, 0.2, 0.024, 28), M.tray, [0, trayY, 0]);
  ring(root, V(0, trayTop, 0), UP, 0.2, 0.006, M.brass);
  rod(root, V(0, trayTop, 0), top, 0.028, 0.028, M.graphite, 14);
  put(root, new THREE.BoxGeometry(0.1, 0.05, 0.075), M.red, [0.095, trayTop + 0.025, 0], [0, 0.2, 0]);
  put(root, new THREE.BoxGeometry(0.12, 0.018, 0.09), M.paper, [-0.09, trayTop + 0.009, 0.065], [0, -0.45, 0]);
  put(
    root,
    new THREE.CylinderGeometry(0.02, 0.02, 0.07, 14),
    M.graphite,
    [-0.02, trayTop + 0.02, -0.11],
    [0, 0, Math.PI / 2]
  );

  // ----- hub, polar housing and axis -----
  put(root, new THREE.CylinderGeometry(0.065, 0.065, 0.1, 20), M.graphite, [0, 0.875, 0]);
  rod(root, B, at(B, P, 0.12), 0.058, 0.058, M.graphite, 20);
  rod(root, at(B, P, 0.095), at(B, P, 0.11), 0.063, 0.063, M.brass, 20);
  rod(root, at(B, P, 0.12), Ctop, 0.026, 0.026, M.graphite, 14);

  // Counterweight shaft running out to the left, with a weight and a brass cap.
  const cw = at(B, P, 0.07);
  rod(root, cw, V(-0.3, cw.y, cw.z), 0.017, 0.017, M.graphite, 10);
  put(root, new THREE.CylinderGeometry(0.06, 0.06, 0.05, 24), M.graphite, [-0.3, cw.y, cw.z], [0, 0, Math.PI / 2]);
  put(root, new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), M.brass, [-0.335, cw.y, cw.z], [0, 0, Math.PI / 2]);

  // ----- fork: head bar, two arms, declination bosses and knobs -----
  rod(root, V(-0.17, Ctop.y, Ctop.z), V(0.17, Ctop.y, Ctop.z), 0.03, 0.03, M.graphite, 14);
  for (const sx of [-1, 1]) {
    const x = sx * 0.17;
    bar(root, V(x, Ctop.y, Ctop.z), V(x, Q.y, Q.z), 0.035, 0.06, M.graphite);
    rod(root, V(sx * 0.185, Q.y, Q.z), V(sx * 0.215, Q.y, Q.z), 0.04, 0.04, M.brass, 16);
    put(root, new THREE.SphereGeometry(0.022, 12, 8), M.rubber, [sx * 0.235, Q.y, Q.z]);
  }

  // ----- cradle: two brass rings around the tube, saddle bars, struts to the bosses -----
  for (const s of [-0.1, 0.1]) ring(root, at(Q, T, s), T, 0.1, 0.012, M.brass);
  for (const sx of [-1, 1]) {
    const c = at(Q, XAX, sx * 0.1);
    bar(root, at(c, T, -0.12), at(c, T, 0.12), 0.022, 0.03, M.graphite);
    rod(root, c, at(Q, XAX, sx * 0.185), 0.012, 0.012, M.graphite, 10);
  }

  // ----- optical tube, built in its own frame -----
  // Local +Y runs along the tube toward the objective; local -Z is "up".
  const tube = new THREE.Group();
  tube.position.copy(Q);
  tube.quaternion.setFromUnitVectors(UP, T);
  root.add(tube);

  // Main body and brass pinstripe.
  put(tube, new THREE.CylinderGeometry(0.075, 0.075, 0.74, 24), M.ivory, [0, 0.07, 0]);
  put(tube, new THREE.CylinderGeometry(0.0765, 0.0765, 0.012, 24), M.brass, [0, -0.27, 0]);

  // Navy front cell, brass lip, glass objective.
  put(tube, new THREE.CylinderGeometry(0.092, 0.092, 0.14, 28), M.navy, [0, 0.43, 0]);
  ring(tube, V(0, 0.5, 0), UP, 0.092, 0.007, M.brass);
  put(tube, new THREE.CylinderGeometry(0.084, 0.084, 0.012, 28), M.glass, [0, 0.5, 0]);

  // Rear focuser, brass drawtube, eyepiece with rubber eyecup, focus knob.
  put(tube, new THREE.CylinderGeometry(0.058, 0.058, 0.08, 20), M.graphite, [0, -0.34, 0]);
  put(tube, new THREE.CylinderGeometry(0.028, 0.028, 0.09, 16), M.brass, [0, -0.425, 0]);
  put(tube, new THREE.CylinderGeometry(0.024, 0.026, 0.08, 16), M.graphite, [0, -0.51, 0]);
  put(tube, new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16), M.rubber, [0, -0.56, 0]);
  put(tube, new THREE.CylinderGeometry(0.016, 0.016, 0.06, 14), M.brass, [0.09, -0.34, 0], [0, 0, Math.PI / 2]);

  // Label plate on the -X side. Text runs along the tube, upright.
  const tex = labelTexture();
  const plateMat = tex ? std(0xffffff, 0.5, 0.1, { map: tex }) : M.navy;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.04), plateMat);
  plate.quaternion.setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(V(0, 1, 0), V(0, 0, -1), V(-1, 0, 0))
  );
  plate.position.set(-0.0765, 0.12, 0);
  tube.add(plate);

  // Finder scope on two posts, sitting above the tube.
  const fz = -0.125;
  put(tube, new THREE.CylinderGeometry(0.03, 0.03, 0.42, 16), M.graphite, [0, -0.03, fz]);
  put(tube, new THREE.CylinderGeometry(0.034, 0.034, 0.03, 16), M.navy, [0, 0.195, fz]);
  put(tube, new THREE.CylinderGeometry(0.027, 0.027, 0.006, 16), M.glass, [0, 0.212, fz]);
  put(tube, new THREE.CylinderGeometry(0.02, 0.02, 0.05, 14), M.rubber, [0, -0.265, fz]);
  for (const y of [-0.12, 0.12]) {
    rod(tube, V(0, y, -0.06), V(0, y, -0.11), 0.011, 0.011, M.graphite, 10);
  }

  return root;
}
```