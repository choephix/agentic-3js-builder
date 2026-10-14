```ts
import * as THREE from "three";

export const meta = {
  name: "Meridian No. 7 Typewriter",
  description:
    "A cherry-red desktop typewriter with cream key caps printed with letters, a sloped key well, a chrome carriage and typebars, and a letter in progress on the platen.",
};

const GLYPHS = "1234567890-QWERTYUIOPASDFGHJKLZXCVBNM,.";
const INK = "#2b2220";
const SLOPE = 0.294; // key-well rise per metre of depth
const TILT = Math.atan(SLOPE);
const BEV = 0.003; // extrude bevel, also pushes the outline out by this much
const PITCH = 0.028; // key centre spacing
const PLATEN_Y = 0.205;
const PLATEN_Z = -0.11;

/** Height of the key-well deck at depth z, including the bevel offset. */
function deckY(z: number): number {
  return 0.088 + (0.15 - z) * SLOPE;
}

/** mulberry32: small seeded PRNG so every build is identical. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Key cap: base at y = 0, top-face UVs point at one glyph cell of the atlas. */
function keyGeometry(w: number, h: number, d: number, glyph: number | null): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0);
  const pos = g.attributes.position;
  const nrm = g.attributes.normal;
  const uv = g.attributes.uv;
  const cell = 1 / 8;
  const idx = glyph ?? 63; // cell 63 is blank cream
  const u0 = (idx % 8) * cell;
  const v0 = 1 - (Math.floor(idx / 8) + 1) * cell;
  for (let i = 0; i < pos.count; i++) {
    if (nrm.getY(i) > 0.5) {
      const lu = 0.5 + pos.getX(i) / w; // +X reads to the right
      const lv = 0.5 - pos.getZ(i) / d; // far edge (-Z) is the top of the letter
      uv.setXY(i, u0 + cell * (0.08 + 0.84 * lu), v0 + cell * (0.08 + 0.84 * lv));
    } else {
      uv.setXY(i, 7.5 * cell, 0.5 * cell);
    }
  }
  uv.needsUpdate = true;
  return g;
}

export default function typewriter(): THREE.Object3D {
  const rand = makeRng(1952);
  const group = new THREE.Group();
  group.name = "typewriter";

  // ---- materials: one per colour or texture ----
  const mBody = new THREE.MeshStandardMaterial({ color: 0xc9372c, roughness: 0.5 });
  const mRubber = new THREE.MeshStandardMaterial({ color: 0x1f1b1b, roughness: 0.85 });
  const mChrome = new THREE.MeshStandardMaterial({ color: 0xd3d7dc, metalness: 0.7, roughness: 0.3 });
  const mPlate = new THREE.MeshStandardMaterial({ color: 0x2a2224, roughness: 0.4 });

  // key-cap atlas: 8 x 8 cells of 128 px, glyph i in cell i, cell 63 blank
  const atlasC = makeCanvas(1024, 1024);
  const ax = atlasC.getContext("2d")!;
  ax.fillStyle = "#f2ead6";
  ax.fillRect(0, 0, 1024, 1024);
  ax.fillStyle = INK;
  ax.font = "bold 80px Helvetica, Arial, sans-serif";
  ax.textAlign = "center";
  ax.textBaseline = "middle";
  for (let i = 0; i < GLYPHS.length; i++) {
    ax.fillText(GLYPHS[i], (i % 8) * 128 + 64, Math.floor(i / 8) * 128 + 66);
  }
  const keyTex = new THREE.CanvasTexture(atlasC);
  keyTex.colorSpace = THREE.SRGBColorSpace;
  keyTex.anisotropy = 4;
  const mKey = new THREE.MeshStandardMaterial({ map: keyTex, roughness: 0.45 });

  // paper with a typed letter
  const paperC = makeCanvas(512, 640);
  const px = paperC.getContext("2d")!;
  px.fillStyle = "#f7f2e3";
  px.fillRect(0, 0, 512, 640);
  px.strokeStyle = "rgba(200,70,60,0.45)";
  px.lineWidth = 2;
  px.beginPath();
  px.moveTo(60, 0);
  px.lineTo(60, 640);
  px.stroke();
  px.font = "22px 'Courier New', Courier, monospace";
  px.textBaseline = "alphabetic";
  px.fillStyle = "rgba(38,32,28,0.9)";
  px.fillText("21 March 1952", 84, 96);
  const letter = [
    "Dear Mr. Halvorsen,",
    "",
    "Thank you for your letter of",
    "14th. The manuscript arrived",
    "safely, and I have begun",
    "it. The second chapter is",
    "wonderful; the ending needs a",
    "little more air. Shall we meet",
    "on Thursday?",
    "",
    "Warmly,",
    "M. Ortega",
  ];
  let ty = 150;
  for (const line of letter) {
    if (line) {
      px.fillStyle = `rgba(38,32,28,${(0.8 + rand() * 0.2).toFixed(2)})`;
      px.fillText(line, 84 + (rand() - 0.5) * 1.5, ty + (rand() - 0.5) * 1.5);
    }
    ty += 40;
  }
  const paperTex = new THREE.CanvasTexture(paperC);
  paperTex.colorSpace = THREE.SRGBColorSpace;
  const mPaper = new THREE.MeshStandardMaterial({
    map: paperTex,
    roughness: 0.95,
    side: THREE.DoubleSide,
  });

  // front nameplate
  const labC = makeCanvas(512, 96);
  const lx = labC.getContext("2d")!;
  lx.fillStyle = "#efe2bf";
  lx.fillRect(0, 0, 512, 96);
  lx.strokeStyle = INK;
  lx.lineWidth = 5;
  lx.strokeRect(12, 12, 488, 72);
  lx.fillStyle = INK;
  lx.font = "bold 50px Georgia, 'Times New Roman', serif";
  lx.textAlign = "center";
  lx.textBaseline = "middle";
  lx.fillText("MERIDIAN", 256, 50);
  const labTex = new THREE.CanvasTexture(labC);
  labTex.colorSpace = THREE.SRGBColorSpace;
  const mLabel = new THREE.MeshStandardMaterial({ map: labTex, roughness: 0.5 });

  // ---- helpers ----
  const place = (o: THREE.Object3D, x: number, z: number, lift = 0): void => {
    o.rotation.x = TILT;
    o.position.set(x, deckY(z) + lift * Math.cos(TILT), z + lift * Math.sin(TILT));
    group.add(o);
  };

  const KEY_LIFT = 0.003;
  const addKey = (x: number, z: number, w: number, h: number, d: number, glyph: number | null): void => {
    place(new THREE.Mesh(keyGeometry(w, h, d, glyph), mKey), x, z, KEY_LIFT);
  };

  const addRod = (a: THREE.Vector3, b: THREE.Vector3): void => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0016, len, 5), mChrome);
    rod.position.copy(a).addScaledVector(dir, 0.5);
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    group.add(rod);
  };

  // ---- main shell: side profile extruded across the width ----
  const profile = new THREE.Shape();
  profile.moveTo(-0.15, 0.03); // back bottom
  profile.lineTo(0.15, 0.03); // front bottom
  profile.lineTo(0.15, 0.085); // front top edge
  profile.lineTo(-0.02, 0.135); // key well, rising to the back
  profile.lineTo(-0.08, 0.14); // rear hood
  profile.lineTo(-0.15, 0.14);
  profile.closePath();

  const depthW = 0.44 - 2 * BEV;
  const shellGeo = new THREE.ExtrudeGeometry(profile, {
    depth: depthW,
    bevelEnabled: true,
    bevelThickness: BEV,
    bevelSize: BEV,
    bevelSegments: 2,
    curveSegments: 1,
  });
  shellGeo.translate(0, 0, -depthW / 2);
  shellGeo.rotateY(-Math.PI / 2); // profile x -> model z, profile y -> model y, extrude -> model x
  group.add(new THREE.Mesh(shellGeo, mBody));

  // feet
  const footGeo = new THREE.CylinderGeometry(0.017, 0.019, 0.032, 14);
  const feet: [number, number][] = [
    [-0.17, -0.11],
    [0.17, -0.11],
    [-0.17, 0.11],
    [0.17, 0.11],
  ];
  for (const [fx, fz] of feet) {
    const f = new THREE.Mesh(footGeo, mRubber);
    f.position.set(fx, 0.016, fz);
    group.add(f);
  }

  // side grille slats
  const slatGeo = new THREE.BoxGeometry(0.004, 0.004, 0.1);
  for (const sx of [-1, 1]) {
    for (const sy of [0.042, 0.054, 0.066]) {
      const s = new THREE.Mesh(slatGeo, mRubber);
      s.position.set(sx * 0.2215, sy, -0.04);
      group.add(s);
    }
  }

  // chrome trim on the front top edge, nameplate on the front face
  const trim = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.006, 0.012), mChrome);
  trim.position.set(0, 0.087, 0.149);
  group.add(trim);

  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.028), mLabel);
  label.position.set(0, 0.056, 0.1545);
  group.add(label);

  // dark key well and the keys on it
  const plateGeo = new THREE.BoxGeometry(0.39, 0.003, 0.13);
  plateGeo.translate(0, 0.0015, 0);
  place(new THREE.Mesh(plateGeo, mPlate), 0, 0.085);

  const rows = [
    { z: 0.03, shift: 0.0, keys: "1234567890-" },
    { z: 0.058, shift: 0.5, keys: "QWERTYUIOP" },
    { z: 0.086, shift: 0.9, keys: "ASDFGHJKL" },
    { z: 0.114, shift: 1.4, keys: "ZXCVBNM,." },
  ];
  for (const r of rows) {
    const n = r.keys.length;
    for (let i = 0; i < n; i++) {
      const x = (r.shift + i - (n - 1) / 2) * PITCH;
      addKey(x, r.z, 0.022, 0.014, 0.022, GLYPHS.indexOf(r.keys[i]));
    }
  }
  addKey(0.184, 0.114, 0.034, 0.014, 0.022, null); // left shift
  addKey(-0.106, 0.114, 0.034, 0.014, 0.022, null); // right shift
  addKey(0, 0.138, 0.16, 0.012, 0.02, null); // space bar

  // rear arms, top rail and carriage
  const armGeo = new THREE.BoxGeometry(0.012, 0.135, 0.095);
  for (const ax2 of [-0.215, 0.215]) {
    const arm = new THREE.Mesh(armGeo, mBody);
    arm.position.set(ax2, 0.1975, -0.1175);
    group.add(arm);
  }

  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.012, 0.03), mChrome);
  rail.position.set(0, 0.27, -0.15);
  group.add(rail);

  const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.03), mChrome);
  carriage.position.set(0, 0.195, -0.15);
  group.add(carriage);

  // platen with end knobs
  const platen = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 18), mRubber);
  platen.rotation.z = Math.PI / 2;
  platen.position.set(0, PLATEN_Y, PLATEN_Z);
  group.add(platen);

  const knobGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.02, 14);
  knobGeo.rotateZ(Math.PI / 2);
  for (const kx of [-0.19, 0.19]) {
    const knob = new THREE.Mesh(knobGeo, mChrome);
    knob.position.set(kx, PLATEN_Y, PLATEN_Z);
    group.add(knob);
  }

  // ribbon spools on the outside of the arms
  const spoolGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.01, 18);
  spoolGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.014, 12);
  hubGeo.rotateZ(Math.PI / 2);
  for (const sx of [-1, 1]) {
    const spool = new THREE.Mesh(spoolGeo, mRubber);
    spool.position.set(sx * 0.2265, 0.23, -0.115);
    group.add(spool);
    const hub = new THREE.Mesh(hubGeo, mChrome);
    hub.position.set(sx * 0.2335, 0.23, -0.115);
    group.add(hub);
  }

  // typebasket: chrome bars fanning from the hood up to the platen
  const RODS = 17;
  for (let i = 0; i < RODS; i++) {
    const t = i / (RODS - 1) - 0.5;
    addRod(
      new THREE.Vector3(t * 0.26, 0.13, -0.03),
      new THREE.Vector3(t * 0.16, PLATEN_Y - 0.005, -0.081),
    );
  }

  // the letter in progress, tilted back over the platen
  const paperW = 0.216;
  const paperH = 0.22;
  const paperTilt = -0.22;
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(paperW, paperH), mPaper);
  const paperUp = new THREE.Vector3(0, Math.cos(paperTilt), Math.sin(paperTilt));
  const paperBase = new THREE.Vector3(0, PLATEN_Y, -0.083);
  paper.position.copy(paperBase).addScaledVector(paperUp, paperH / 2);
  paper.rotation.x = paperTilt;
  group.add(paper);

  return group;
}
```