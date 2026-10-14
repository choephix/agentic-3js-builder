```ts
import * as THREE from "three";

export const meta = {
  name: "Telescope",
  description:
    "A stylised refractor telescope on a three-legged wooden tripod, with a white optical tube, brass fittings, a red accent band, a blue objective lens, a finder scope and an accessory tray.",
};

export default function telescope(): THREE.Object3D {
  const root = new THREE.Group();

  const mats = {
    white: new THREE.MeshStandardMaterial({ color: "#f1efe8", roughness: 0.45, metalness: 0.05 }),
    brass: new THREE.MeshStandardMaterial({ color: "#c9a24a", roughness: 0.3, metalness: 0.85 }),
    wood: new THREE.MeshStandardMaterial({ color: "#8a5a34", roughness: 0.7, metalness: 0.0 }),
    rubber: new THREE.MeshStandardMaterial({ color: "#1b1b1d", roughness: 0.9, metalness: 0.0 }),
    glass: new THREE.MeshStandardMaterial({ color: "#1d3f73", roughness: 0.05, metalness: 0.2 }),
    red: new THREE.MeshStandardMaterial({ color: "#c0392b", roughness: 0.5, metalness: 0.0 }),
    dark: new THREE.MeshStandardMaterial({ color: "#3a3d42", roughness: 0.6, metalness: 0.3 }),
  };

  const UP = new THREE.Vector3(0, 1, 0);

  // Places a cylinder between two points (bottom radius r0 at a, top radius r1 at b).
  function strut(
    a: THREE.Vector3,
    b: THREE.Vector3,
    r0: number,
    r1: number,
    mat: THREE.Material,
    parent: THREE.Object3D
  ) {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(r1, r0, len, 10);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, dir.normalize());
    parent.add(m);
    return m;
  }

  // ---------- Tripod ----------
  const hubY = 0.88;
  const hub = new THREE.Vector3(0, hubY, 0);
  const footR = 0.42;
  const angles = [0, (2 * Math.PI) / 3, (-2 * Math.PI) / 3];

  for (const a of angles) {
    const foot = new THREE.Vector3(Math.sin(a) * footR, 0.02, Math.cos(a) * footR);
    strut(hub, foot, 0.018, 0.024, mats.wood, root);

    const f = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 8), mats.rubber);
    f.position.copy(foot);
    root.add(f);

    // Brass leg clamp near the top
    const clampT = 0.22;
    const clampPos = hub.clone().lerp(foot, clampT);
    const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.045, 12), mats.brass);
    clamp.position.copy(clampPos);
    clamp.quaternion.setFromUnitVectors(UP, foot.clone().sub(hub).normalize());
    root.add(clamp);
  }

  // Central hub
  const hubMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 16), mats.brass);
  hubMesh.position.set(0, hubY, 0);
  root.add(hubMesh);

  // Accessory tray on the legs
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 24), mats.wood);
  tray.position.set(0, 0.45, 0);
  root.add(tray);
  const trayRim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.008, 6, 28), mats.brass);
  trayRim.rotation.x = Math.PI / 2;
  trayRim.position.set(0, 0.4575, 0);
  root.add(trayRim);

  // Small eyepiece case on the tray
  const caseBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.08), mats.red);
  caseBox.position.set(0.07, 0.4825, -0.04);
  root.add(caseBox);

  // ---------- Mount head / yoke ----------
  const pivotY = 1.1;
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.12), mats.dark);
    arm.position.set(s * 0.085, pivotY - 0.04, 0);
    root.add(arm);

    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.035, 14), mats.brass);
    boss.rotation.z = Math.PI / 2;
    boss.position.set(s * 0.1, pivotY, 0);
    root.add(boss);
  }
  const yokeBase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.12), mats.dark);
  yokeBase.position.set(0, 0.97, 0);
  root.add(yokeBase);

  // ---------- Optical tube (group pivots at the mount) ----------
  const tube = new THREE.Group();
  tube.position.set(0, pivotY, 0);
  tube.rotation.x = -0.6; // tilt the front end up and forward
  root.add(tube);

  // Helper: cylinder along Z centred at z
  function zCyl(
    rt: number,
    rb: number,
    len: number,
    mat: THREE.Material,
    z: number,
    segs = 24,
    open = false
  ) {
    const g = new THREE.CylinderGeometry(rt, rb, len, segs, 1, open);
    g.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(g, mat);
    m.position.z = z;
    tube.add(m);
    return m;
  }

  // Main white tube (z from -0.2 to 0.7)
  zCyl(0.07, 0.07, 0.9, mats.white, 0.25, 28);

  // Front dew shield lip
  zCyl(0.078, 0.078, 0.12, mats.white, 0.64, 28);

  // Red accent band
  zCyl(0.0715, 0.0715, 0.06, mats.red, 0.42, 28);

  // Brass collar at the rear end
  zCyl(0.076, 0.076, 0.05, mats.brass, -0.17, 28);

  // Brass ring at the front
  const frontRing = new THREE.Mesh(new THREE.TorusGeometry(0.079, 0.008, 8, 28), mats.brass);
  frontRing.position.z = 0.7;
  tube.add(frontRing);

  // Objective lens (blue glass)
  zCyl(0.064, 0.064, 0.01, mats.glass, 0.702, 28);

  // Eyepiece holder and eyepiece
  zCyl(0.03, 0.03, 0.1, mats.brass, -0.3, 16);
  zCyl(0.022, 0.022, 0.04, mats.dark, -0.38, 16);

  // Focuser housing on top of the rear
  const focuser = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.07), mats.dark);
  focuser.position.set(0, 0.095, -0.12);
  tube.add(focuser);

  // Focuser knob on the side
  const knobGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.02, 14);
  knobGeo.rotateZ(Math.PI / 2);
  const knob = new THREE.Mesh(knobGeo, mats.brass);
  knob.position.set(0.04, 0.095, -0.12);
  tube.add(knob);

  // Finder scope on top of the main tube
  const finderY = 0.135;
  zCyl(0.028, 0.028, 0.3, mats.white, 0.2, 16);
  // move finder up onto the bracket height
  const finderGroupMeshes = tube.children.slice(-1);
  finderGroupMeshes.forEach((m) => (m.position.y = finderY));
  // finder front ring and eyepiece
  const finderRing = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.005, 6, 18), mats.brass);
  finderRing.position.set(0, finderY, 0.36);
  tube.add(finderRing);
  const finderGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 16), mats.glass);
  finderGlass.rotation.x = Math.PI / 2;
  finderGlass.position.set(0, finderY, 0.357);
  tube.add(finderGlass);
  const finderEye = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 12), mats.brass);
  finderEye.rotation.x = Math.PI / 2;
  finderEye.position.set(0, finderY, 0.03);
  tube.add(finderEye);

  // Finder brackets
  for (const z of [-0.02, 0.22]) {
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.02), mats.dark);
    br.position.set(0, 0.1, z);
    tube.add(br);
  }

  return root;
}
```