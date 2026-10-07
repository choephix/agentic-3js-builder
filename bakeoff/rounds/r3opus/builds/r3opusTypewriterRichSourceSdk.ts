import * as THREE from "three";
import { createBuilder, svg, rng, catmull } from "../../../../src/index";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "A 1930s typewriter in glossy racing green: four staggered rows of round chrome-rimmed keys with cream letters, a semicircular fan of type bars, a black platen with a half-typed letter, a chrome carriage return lever and a brass maker's badge.",
};

const DEG = Math.PI / 180;

const GREEN = "#0e4a2b";
const CHROME = "#dde1e6";
const STEEL = "#7b828a";
const DARKSTEEL = "#4a4f55";
const BLACK = "#131313";
const RUBBER = "#1a1a1a";
const GOLD = "#d6b25e";
const FELT = "#2b211b";
const RIBBON_RED = "#9e1d1d";

function keyAtlas(letters: string[]) {
  const cols = 8;
  const rows = 6;
  let cells = "";
  letters.forEach((ch, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const cx = c * 64 + 32;
    const cy = r * 64 + 32;
    cells += `<circle cx="${cx}" cy="${cy}" r="27" fill="none" stroke="#3c3c3c" stroke-width="2"/>`;
    cells += `<text x="${cx}" y="${cy + 12}" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="34" text-anchor="middle" fill="#f1e3bd">${ch}</text>`;
  });
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * 64} ${rows * 64}"><rect x="0" y="0" width="${cols * 64}" height="${rows * 64}" fill="#121212"/>${cells}</svg>`,
    { size: 1024 },
  );
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "typewriter" });
  b.joint("root", { at: [0, 0, 0] });

  const quatX = (deg: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deg * DEG);

  // ---------------------------------------------------------------- Body
  b.extrude(
    [
      [-0.14, 0.008, "sharp"],
      [0.155, 0.008, "sharp"],
      [0.16, 0.015],
      [0.16, 0.05],
      [0.15, 0.058],
      [0.03, 0.085],
      [-0.14, 0.085, "sharp"],
    ],
    { at: [0, 0, 0], thickness: 0.28, bevel: 0.005, smoothing: 1, color: GREEN, name: "chassis" },
  );

  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.145, 0.008, "sharp"],
        [0.155, 0.008, "sharp"],
        [0.16, 0.015],
        [0.16, 0.052],
        [0.15, 0.06],
        [0.06, 0.086],
        [0.0, 0.12],
        [-0.05, 0.14],
        [-0.145, 0.14],
      ],
      { at: [s * 0.146, 0, 0], thickness: 0.016, bevel: 0.004, smoothing: 1, color: GREEN, name: s > 0 ? "sidePanelL" : "sidePanelR" },
    );
    // gold pinstripe on the outer face of each side panel
    const x = s * 0.1548;
    b.sweep(
      catmull(
        [
          [x, 0.02, 0.143],
          [x, 0.047, 0.146],
          [x, 0.076, 0.062],
          [x, 0.108, 0.003],
          [x, 0.127, -0.05],
          [x, 0.127, -0.128],
          [x, 0.02, -0.13],
        ],
        { closed: true },
      ),
      { radius: 0.0011, color: GOLD, sides: 4, name: s > 0 ? "pinstripeL" : "pinstripeR" },
    );
  }

  // back housing behind the type-bar well
  b.extrude(
    [
      [-0.145, 0.08, "sharp"],
      [-0.09, 0.08, "sharp"],
      [-0.09, 0.125],
      [-0.1, 0.138],
      [-0.145, 0.14],
    ],
    { at: [0, 0, 0], thickness: 0.276, bevel: 0.004, smoothing: 1, color: GREEN, name: "backHousing" },
  );

  // front gold stripe and rubber feet
  b.rod([-0.13, 0.054, 0.1575], [0.13, 0.054, 0.1575], { radius: 0.0012, color: GOLD, sides: 4, name: "frontStripe" });
  for (const x of [-0.13, 0.13])
    for (const z of [-0.12, 0.13])
      b.part(new THREE.CylinderGeometry(0.013, 0.014, 0.009, 10), RUBBER, { at: [x, 0.0045, z], name: "foot" });

  // ---------------------------------------------------------------- Brass badge
  const badgeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5dc8e"/><stop offset="0.5" stop-color="#c99a3c"/><stop offset="1" stop-color="#8a6420"/></linearGradient></defs><rect x="0" y="0" width="320" height="100" rx="50" fill="url(#g)"/><rect x="9" y="9" width="302" height="82" rx="41" fill="none" stroke="#5a3e12" stroke-width="4"/><text x="160" y="60" font-family="Georgia, serif" font-size="40" font-weight="bold" letter-spacing="6" text-anchor="middle" fill="#3b2708">SOVEREIGN</text><text x="160" y="83" font-family="Georgia, serif" font-size="14" letter-spacing="4" text-anchor="middle" fill="#3b2708">LONDON · No. 5</text></svg>`,
    { size: 512 },
  );
  const badge = b.part(new THREE.BoxGeometry(0.064, 0.02, 0.0025), "#ffffff", {
    at: [0, 0.031, 0.1612],
    texture: badgeTex,
    name: "badge",
  });
  {
    const m = badge.mesh.material as THREE.MeshStandardMaterial;
    m.metalness = 0.55;
    m.roughness = 0.3;
  }

  // ---------------------------------------------------------------- Keys
  const rowsDef = [
    ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "¢"],
    ["2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "½"],
  ];
  const letters = rowsDef.flat();
  const atlas = keyAtlas(letters);
  const tilt = 14;
  const qFace = quatX(-(90 - tilt));
  const qBody = quatX(tilt);
  const n = new THREE.Vector3(0, 1, 0).applyQuaternion(qBody);
  const pitch = 0.0195;
  let li = 0;
  rowsDef.forEach((row, r) => {
    const z = 0.135 - r * 0.0235;
    const yTop = 0.084 + r * 0.0115;
    const off = 0.012 - r * 0.0045;
    row.forEach((_, i) => {
      const x = (i - (row.length - 1) / 2) * pitch + off;
      const C = new THREE.Vector3(x, yTop, z);
      // stem down into the chassis
      b.rod(C.clone().addScaledVector(n, -0.005), [x, yTop - 0.058, z - 0.028], {
        radius: 0.0011,
        color: DARKSTEEL,
        sides: 4,
        name: "keyStem",
      });
      b.part(new THREE.CylinderGeometry(0.0068, 0.0064, 0.004, 14), BLACK, {
        at: C.clone().addScaledVector(n, -0.0024),
        quat: qBody,
        name: "keyCap",
      });
      b.part(new THREE.TorusGeometry(0.0072, 0.0012, 5, 16), CHROME, { at: C, quat: qFace, name: "keyRim" });
      const face = new THREE.CircleGeometry(0.0063, 18);
      const uv = face.getAttribute("uv");
      const col = li % 8;
      const rowA = Math.floor(li / 8);
      for (let k = 0; k < uv.count; k++)
        uv.setXY(k, (col + 0.04 + 0.92 * uv.getX(k)) / 8, (5 - rowA + 0.04 + 0.92 * uv.getY(k)) / 6);
      const fp = b.part(face, "#ffffff", {
        at: C.clone().addScaledVector(n, -0.0002),
        quat: qFace,
        texture: atlas,
        name: "keyFace",
      });
      const fm = fp.mesh.material as THREE.MeshStandardMaterial;
      fm.roughness = 0.25;
      fm.metalness = 0.05;
      li++;
    });
  });

  // space bar with chrome arms
  b.capsule([-0.085, 0.068, 0.153], [0.085, 0.068, 0.153], { radius: 0.0048, color: BLACK, name: "spaceBar" });
  for (const s of [-1, 1]) {
    b.rod([s * 0.075, 0.066, 0.152], [s * 0.075, 0.045, 0.128], { radius: 0.0016, color: CHROME, sides: 6, name: "spaceArm" });
  }

  // ---------------------------------------------------------------- Type-bar well and fan
  const C0 = new THREE.Vector3(0, 0, -0.075);
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.003, 24, 1, false, -Math.PI / 2, Math.PI), FELT, {
    at: [0, 0.087, -0.075],
    name: "wellFloor",
  });
  b.part(new THREE.TorusGeometry(0.032, 0.005, 5, 20, Math.PI), STEEL, {
    at: [0, 0.1, -0.075],
    rotation: [90, 0, 0],
    name: "typeSegment",
  });
  b.part(new THREE.TorusGeometry(0.091, 0.0035, 4, 28, Math.PI), FELT, {
    at: [0, 0.0905, -0.075],
    rotation: [90, 0, 0],
    name: "typeBarRest",
  });
  const bars = 34;
  for (let i = 0; i < bars; i++) {
    const phi = (-84 + (168 * i) / (bars - 1)) * DEG;
    const dir = new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi));
    const inner = C0.clone().addScaledVector(dir, 0.032).setY(0.1);
    const outer = C0.clone().addScaledVector(dir, 0.088).setY(0.093);
    const len = inner.distanceTo(outer);
    b.part(new THREE.BoxGeometry(0.0015, len, 0.0028), STEEL, {
      at: inner.clone().lerp(outer, 0.5),
      dir: outer.clone().sub(inner),
      up: [0, 1, 0],
      name: "typeBar",
    });
    b.part(new THREE.BoxGeometry(0.0034, 0.005, 0.0034), DARKSTEEL, {
      at: outer.clone().addScaledVector(dir, 0.002),
      dir: outer.clone().sub(inner),
      up: [0, 1, 0],
      name: "typeHead",
    });
  }

  // ribbon spools beside the fan
  const guide = new THREE.Vector3(0, 0.168, -0.0705);
  for (const s of [-1, 1]) {
    const sp = new THREE.Vector3(s * 0.115, 0, -0.058);
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.012, 8), STEEL, { at: [sp.x, 0.092, sp.z], name: "spoolPost" });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.006, 16), RIBBON_RED, { at: [sp.x, 0.099, sp.z], name: "ribbonRoll" });
    b.part(new THREE.CylinderGeometry(0.0185, 0.0185, 0.002, 16), BLACK, { at: [sp.x, 0.1027, sp.z], name: "ribbonRollTop" });
    b.part(new THREE.CylinderGeometry(0.021, 0.021, 0.0025, 18), CHROME, { at: [sp.x, 0.105, sp.z], name: "spoolLid" });
    b.part(new THREE.SphereGeometry(0.004, 8, 6), CHROME, { at: [sp.x, 0.107, sp.z], name: "spoolKnob" });
    const from = new THREE.Vector3(s * 0.098, 0.1, -0.062);
    const to = new THREE.Vector3(s * 0.015, guide.y, guide.z);
    b.part(new THREE.BoxGeometry(0.0006, from.distanceTo(to), 0.006), BLACK, {
      at: from.clone().lerp(to, 0.5),
      dir: to.clone().sub(from),
      up: [0, 0, 1],
      name: "ribbon",
    });
  }
  b.part(new THREE.BoxGeometry(0.03, 0.005, 0.0015), BLACK, { at: [0, 0.1705, -0.0705], name: "ribbonBlack" });
  b.part(new THREE.BoxGeometry(0.03, 0.005, 0.0015), RIBBON_RED, { at: [0, 0.1655, -0.0705], name: "ribbonRed" });
  b.part(new THREE.BoxGeometry(0.014, 0.012, 0.002), CHROME, { at: [0, 0.16, -0.068], name: "typeGuide" });

  // ---------------------------------------------------------------- Carriage
  b.part(new THREE.BoxGeometry(0.37, 0.012, 0.024), GREEN, { at: [0, 0.146, -0.128], name: "carriageRail" });
  b.rod([-0.185, 0.146, -0.1155], [0.185, 0.146, -0.1155], { radius: 0.0018, color: CHROME, sides: 6, name: "railTrim" });
  for (const s of [-1, 1])
    b.part(new THREE.BoxGeometry(0.008, 0.06, 0.07), GREEN, { at: [s * 0.178, 0.17, -0.1], name: "carriageEnd" });

  const PZ = -0.1;
  const PY = 0.175;
  const PR = 0.0235;
  b.part(new THREE.CylinderGeometry(PR, PR, 0.35, 22), RUBBER, { at: [0, PY, PZ], rotation: [0, 0, 90], name: "platen" });
  for (const s of [-1, 1]) {
    b.lathe(
      [
        [0, 0],
        [0.01, 0],
        [0.02, 0.003],
        [0.021, 0.017],
        [0.016, 0.022],
        [0, 0.022],
      ],
      { at: [s * 0.182, PY, PZ], axis: [s, 0, 0], segments: 16, color: BLACK, name: "platenKnob" },
    );
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.004, 14), CHROME, {
      at: [s * 0.2045, PY, PZ],
      rotation: [0, 0, 90],
      name: "knobCap",
    });
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.003, 18), CHROME, {
      at: [s * 0.171, PY, PZ],
      rotation: [0, 0, 90],
      name: "ratchet",
    });
  }

  // margin scale on a chrome bar in front of the platen
  b.part(new THREE.BoxGeometry(0.36, 0.004, 0.004), CHROME, { at: [0, 0.148, -0.069], name: "scaleBar" });
  let ticks = "";
  for (let k = 0; k <= 100; k++) {
    const x = 4 + k * 5.92;
    const h = k % 10 === 0 ? 7 : k % 5 === 0 ? 5 : 3;
    ticks += `<rect x="${x.toFixed(1)}" y="0" width="0.9" height="${h}" fill="#222"/>`;
    if (k % 10 === 0 && k < 100) ticks += `<text x="${(x + 1).toFixed(1)}" y="15" font-family="Arial" font-size="7" fill="#222">${k}</text>`;
  }
  const scaleTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 16"><rect width="600" height="16" fill="#efe5c8"/>${ticks}</svg>`,
    { size: 1024 },
  );
  b.part(new THREE.BoxGeometry(0.3, 0.008, 0.0015), "#ffffff", {
    at: [0, 0.153, -0.0665],
    rotation: [-20, 0, 0],
    texture: scaleTex,
    name: "marginScale",
  });

  // ---------------------------------------------------------------- Paper
  const theta0 = -60 * DEG;
  const theta1 = 20 * DEG;
  const pr = PR + 0.0004;
  const exit = new THREE.Vector2(PZ + pr * Math.cos(theta1), PY + pr * Math.sin(theta1)); // (z, y)
  const tdir = new THREE.Vector2(-Math.sin(theta1), Math.cos(theta1));
  const ndir = new THREE.Vector2(Math.cos(theta1), Math.sin(theta1));
  const lineLen = 0.15;
  const pathPts: THREE.Vector2[] = [];
  const arcSteps = 14;
  for (let i = 0; i <= arcSteps; i++) {
    const th = theta0 + ((theta1 - theta0) * i) / arcSteps;
    pathPts.push(new THREE.Vector2(PZ + pr * Math.cos(th), PY + pr * Math.sin(th)));
  }
  for (let i = 1; i <= 6; i++) pathPts.push(exit.clone().addScaledVector(tdir, (lineLen * i) / 6));
  const cum = [0];
  for (let i = 1; i < pathPts.length; i++) cum.push(cum[i - 1] + pathPts[i].distanceTo(pathPts[i - 1]));
  const total = cum[cum.length - 1];
  const W = 0.216;
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  pathPts.forEach((p, i) => {
    for (const side of [0, 1]) {
      pos.push(-W / 2 + side * W, p.y, p.x);
      uvs.push(side, cum[i] / total);
    }
  });
  for (let i = 0; i < pathPts.length - 1; i++) {
    const a = i * 2;
    const bb = a + 1;
    const c = a + 2;
    const d = a + 3;
    idx.push(a, bb, d, a, d, c);
  }
  const paperGeo = new THREE.BufferGeometry();
  paperGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  paperGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  paperGeo.setIndex(idx);
  paperGeo.computeVertexNormals();

  // the half-typed letter
  const H = Math.round(total * 1000);
  const printS = (65 * DEG) * pr * 1000;
  const yPrint = H - printS - 1.5;
  const lines: Array<[number, string]> = [
    [34, "London, 14th March 1934"],
    [0, ""],
    [0, "Dear Eleanor,"],
    [0, ""],
    [5, "Forgive the clatter of this letter -- I have at last"],
    [0, "bought the green machine from the shop on Charing Cross Rd,"],
    [0, "and I cannot leave it alone. The keys ring like little"],
    [0, "bells and the carriage runs as smooth as the Blue Train."],
    [0, ""],
    [5, "The races at Brooklands were splendid. Harry drove the"],
    [0, "Bentley through the rain and finished third, soaked to the"],
    [0, "bone and grinning like a schoolboy. We toasted him with"],
    [0, "warm champagne in the paddock until the stewards chased"],
    [0, "us all off the grass."],
    [0, ""],
    [5, "I shall come down to Sussex on Friday next if the"],
    [0, "weather holds. Tell your mother I have not forgotten her"],
    [0, "recipe for the lemon cake, nor my promise to"],
  ];
  const spacing = 6.6;
  const charW = 0.6 * 4.4;
  const r = rng(11);
  let textSvg = "";
  lines.forEach(([indent, text], i) => {
    const y = yPrint - spacing * (lines.length - 1 - i);
    if (y < 8 || !text) return;
    const op = (0.78 + 0.2 * r()).toFixed(2);
    textSvg += `<text x="${(20 + indent * charW).toFixed(1)}" y="${y.toFixed(1)}" font-family="'Courier New', Courier, monospace" font-size="4.4" fill="#22222c" fill-opacity="${op}">${text}</text>`;
  });
  const paperTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 ${H}"><rect width="216" height="${H}" fill="#fbf6ea"/><rect x="0" y="0" width="216" height="2" fill="#ece4d0"/>${textSvg}</svg>`,
    { size: 1024 },
  );
  const paper = b.part(paperGeo, "#ffffff", { at: [0, 0, 0], texture: paperTex, name: "paper" });
  {
    const m = paper.mesh.material as THREE.MeshStandardMaterial;
    m.side = THREE.DoubleSide;
    m.roughness = 0.9;
    m.metalness = 0;
  }

  // paper table behind the sheet
  const at2 = (d: number, o: number) =>
    new THREE.Vector3(0, exit.y + tdir.y * d + ndir.y * o, exit.x + tdir.x * d + ndir.x * o);
  const tdir3 = new THREE.Vector3(0, tdir.y, tdir.x);
  const ndir3 = new THREE.Vector3(0, ndir.y, ndir.x);
  b.part(new THREE.BoxGeometry(0.24, 0.095, 0.003), GREEN, {
    at: at2(0.065, -0.0045),
    dir: tdir3,
    up: ndir3,
    name: "paperTable",
  });

  // paper bail with rubber rollers
  const bail = at2(0.012, 0.004);
  b.rod([-0.135, bail.y, bail.z], [0.135, bail.y, bail.z], { radius: 0.0022, color: CHROME, sides: 8, name: "paperBail" });
  for (const s of [-1, 1]) {
    b.rod([s * 0.135, bail.y, bail.z], [s * 0.176, 0.19, -0.095], { radius: 0.0018, color: CHROME, sides: 6, name: "bailArm" });
    b.part(new THREE.CylinderGeometry(0.0042, 0.0042, 0.014, 10), RUBBER, {
      at: [s * 0.055, bail.y, bail.z],
      rotation: [0, 0, 90],
      name: "bailRoller",
    });
  }

  // ---------------------------------------------------------------- Carriage return lever (operator's left)
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 12), CHROME, { at: [-0.17, 0.203, -0.088], name: "leverBoss" });
  b.sweep(
    catmull([
      [-0.17, 0.205, -0.088],
      [-0.182, 0.214, -0.052],
      [-0.202, 0.219, -0.016],
      [-0.226, 0.217, 0.012],
    ]),
    { radius: 0.0034, color: CHROME, name: "returnLever" },
  );
  b.capsule([-0.226, 0.217, 0.012], [-0.246, 0.214, 0.026], { radius: 0.006, color: CHROME, name: "leverPaddle" });

  // paper release lever (operator's right)
  b.rod([0.172, 0.2, -0.12], [0.168, 0.222, -0.138], { radius: 0.0022, color: CHROME, sides: 6, name: "releaseLever" });
  b.part(new THREE.SphereGeometry(0.005, 10, 8), BLACK, { at: [0.168, 0.224, -0.139], name: "releaseKnob" });

  // ---------------------------------------------------------------- Finishes
  const finish = (c: string, rough: number, metal: number) => {
    const m = b.material(c);
    m.roughness = rough;
    m.metalness = metal;
  };
  finish(GREEN, 0.18, 0.12);
  finish(CHROME, 0.18, 0.75);
  finish(STEEL, 0.35, 0.6);
  finish(DARKSTEEL, 0.4, 0.5);
  finish(BLACK, 0.28, 0.05);
  finish(GOLD, 0.3, 0.6);
  finish(RUBBER, 0.85, 0.0);
  finish(FELT, 0.95, 0.0);

  return b.root;
}
