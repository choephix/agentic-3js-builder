```ts
import * as THREE from "three";
import { createBuilder, frame, line, rng } from "agentic-3js-builder";

// Palette: polished brass, aged copper, red collar, dark leather, green glass.
const BRASS = "#c9a040";
const BRASS_DK = "#8f6d25";
const COPPER = "#b8733a";
const RED = "#b3222a";
const LEATHER = "#5a2e17";
const LENS = "#5fbf8a";
const DARK = "#2b241d";

export const meta = {
  name: "Clockwork Terrier",
  description:
    "A wind-up brass and copper terrier with riveted plates, a gear-filled chest, a winding key, coil-spring legs and tail, leather ears, green glass eyes and a red collar with a brass tag.",
};

export default function build() {
  const b = createBuilder({ name: "clockwork-terrier" });
  const R = rng(7);

  // ---- Skeleton -----------------------------------------------------------
  const root = b.joint("root", { at: [0, 0.2, 0] });

  // Torso spine runs from hips (rear) to chest (front).
  const spine = b.chain("spine", [
    [0, 0.22, -0.16],
    [0, 0.24, 0.0],
    [0, 0.25, 0.14],
  ]);

  // Neck and head.
  const neck = b.chain("neck", [
    [0, 0.25, 0.14],
    [0, 0.3, 0.2],
  ]);
  const head = b.joint("head", { parent: neck.end ?? undefined, at: [0, 0.32, 0.22] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.29, 0.28] });

  // Tail: a coil-spring rising from the rump.
  const tail = b.chain("tail", [
    [0, 0.27, -0.17],
    [0, 0.33, -0.25],
    [0, 0.38, -0.3],
  ]);

  // Legs: upper leg, knee, paw. Springy coil legs.
  const legs = [
    { name: "legFL", x: 0.07, z: 0.1 },
    { name: "legFR", x: -0.07, z: 0.1 },
    { name: "legBL", x: 0.07, z: -0.1 },
    { name: "legBR", x: -0.07, z: -0.1 },
  ].map((l) => ({
    ...l,
    chain: b.chain(l.name, [
      [l.x, 0.23, l.z],
      [l.x, 0.12, l.z + 0.03],
      [l.x, 0.02, l.z + 0.005],
    ]),
  }));

  // ---- Body -----------------------------------------------------------------
  const body = b.sweep(spine, 0.085, { color: COPPER });
  const surface = b.surface(body);

  // Riveted brass plates along the flanks and back.
  const plateGeo = new THREE.BoxGeometry(0.05, 0.008, 0.09);
  for (const z of [-0.09, 0.0, 0.09]) {
    const top = surface.nearest([0, 0.335, z]);
    b.stick(plateGeo, BRASS, top);
    for (const x of [-0.02, 0.02]) {
      // Rivet heads on each plate corner.
      const rivet = new THREE.SphereGeometry(0.006, 6, 5);
      b.stick(rivet, DARK, surface.nearest([x * 2.2, 0.335, z + 0.03]));
      b.stick(rivet, DARK, surface.nearest([x * 2.2, 0.335, z - 0.03]));
    }
  }

  // Side plates with rivet rows, wrapped around the body.
  const sidePlate = new THREE.BoxGeometry(0.012, 0.07, 0.08);
  for (const side of [1, -1]) {
    const hit = surface.nearest([side * 0.085, 0.25, -0.02]);
    b.stick(sidePlate, BRASS_DK, hit);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const at = surface.around([side * 0.0, 0.25, -0.02]).at(a, 0.0);
      b.stick(new THREE.SphereGeometry(0.005, 6, 5), DARK, at);
    }
  }

  // Chest: two meshing gears behind a brass window, turning in the chest.
  const gearBody = new THREE.CylinderGeometry(0.034, 0.034, 0.01, 14);
  gearBody.rotateX(Math.PI / 2);
  const gearSmall = new THREE.CylinderGeometry(0.022, 0.022, 0.012, 12);
  gearSmall.rotateX(Math.PI / 2);
  const tooth = new THREE.BoxGeometry(0.012, 0.012, 0.008);

  const gearHitA = surface.nearest([0.0, 0.245, 0.12]);
  const gearHitB = surface.nearest([0.035, 0.235, 0.12]);
  const windowPlate = new THREE.CylinderGeometry(0.06, 0.06, 0.006, 16);
  windowPlate.rotateX(Math.PI / 2);
  b.stick(windowPlate, BRASS_DK, surface.nearest([0.0, 0.24, 0.125]));

  b.stick(gearBody, BRASS, gearHitA);
  b.ring(gearHitA, { count: 14, radius: 0.036 }, (at: any) => {
    b.part(tooth, BRASS, { frame: at });
  });
  b.stick(gearSmall, BRASS_DK, gearHitB);
  b.ring(gearHitB, { count: 10, radius: 0.023 }, (at: any) => {
    b.part(tooth, BRASS_DK, { frame: at });
  });
  // A little jitter so the teeth read as hand-cut.
  void R();

  // Winding key on the back: stem plus bow.
  const keyHit = surface.nearest([0, 0.34, -0.04]);
  const keyStem = new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8);
  keyStem.translate(0, 0.025, 0);
  const keyBow = new THREE.TorusGeometry(0.025, 0.006, 6, 14);
  keyBow.translate(0, 0.06, 0);
  b.stick(keyStem, BRASS, keyHit);
  b.stick(keyBow, BRASS, keyHit);

  // ---- Neck, head, face -----------------------------------------------------
  const headMesh = new THREE.SphereGeometry(0.075, 12, 10);
  b.part(headMesh, COPPER, { at: [0, 0.32, 0.22], bone: head, scale: [1, 0.92, 1.15] });

  const snout = new THREE.CylinderGeometry(0.04, 0.05, 0.07, 10);
  snout.rotateX(Math.PI / 2);
  b.part(snout, COPPER, { at: [0, 0.3, 0.31], bone: head });

  const nose = new THREE.SphereGeometry(0.014, 8, 6);
  b.part(nose, DARK, { at: [0, 0.31, 0.35], bone: head });

  // Lower jaw as its own piece so it can open.
  const jawMesh = new THREE.BoxGeometry(0.05, 0.02, 0.07);
  b.part(jawMesh, BRASS_DK, { at: [0, 0.282, 0.3], bone: jaw });

  // Glass-lens eyes with brass rims.
  for (const side of [1, -1]) {
    const eyeFrame = frame([side * 0.04, 0.335, 0.285], [side * 0.35, 0.2, 1]);
    const lens = new THREE.SphereGeometry(0.018, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    b.stick(lens, LENS, eyeFrame);
    b.stick(new THREE.TorusGeometry(0.02, 0.005, 6, 12), BRASS, eyeFrame);
  }

  // Floppy leather ears hanging from the top of the skull.
  const earOutline: [number, number][] = [
    [0, 0],
    [0.035, -0.005],
    [0.05, -0.05],
    [0.035, -0.095],
    [0.0, -0.105],
    [-0.01, -0.05],
  ];
  for (const side of [1, -1]) {
    const x0 = side * 0.045;
    b.extrude(earOutline, {
      at: [x0, 0.365, 0.2],
      x: [side, 0, 0],
      y: [0, 1, 0],
    });
  }

  // Ear rivets in brass.
  for (const side of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.005, 6, 5), BRASS, frame([side * 0.05, 0.36, 0.2], [0, 0, 1]));
  }

  // ---- Collar and tag -----------------------------------------------------
  const collar = surface.loop(neck.at(0.1));
  b.sweep(collar, 0.097, { color: RED });

  const tagHit = surface.nearest([0, 0.16, 0.13]);
  const tag = new THREE.BoxGeometry(0.032, 0.04, 0.004);
  b.stick(tag, BRASS, tagHit);
  b.stick(new THREE.SphereGeometry(0.004, 6, 5), DARK, tagHit);

  // ---- Legs with coil springs and feet ----------------------------------
  for (const l of legs) {
    b.sweep(l.chain, 0.016, { color: BRASS });
    b.along(l.chain, 6, (at: any) => {
      b.part(new THREE.TorusGeometry(0.024, 0.0045, 6, 10), BRASS_DK, { frame: at });
    });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), DARK, { at: [l.x, 0.012, l.z + 0.008] });
  }

  // ---- Tail: a coil spring ----------------------------------------------
  b.sweep(tail, 0.007, { color: COPPER });
  b.along(tail, 10, (at: any) => {
    b.part(new THREE.TorusGeometry(0.018, 0.0038, 6, 10), BRASS, { frame: at });
  });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), BRASS, { at: [0, 0.39, -0.32] });

  // Keep the line helper referenced for the tail tip direction.
  void line([0, 0.37, -0.29], [0, 0.39, -0.32]);

  return b.root;
}
```