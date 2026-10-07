import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";

export const meta = {
  name: "Antique Gramophone",
  description:
    "A morning-glory horn gramophone on a carved walnut cabinet with a pale floral inlay, a black record with a red label, a chrome tonearm, a side crank and claw feet.",
};

/* ------------------------------------------------------------------ helpers */

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function smooth(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

type Ctx2D = CanvasRenderingContext2D;
type Paint = (g: Ctx2D, w: number, h: number) => void;

function canvasTexture(w: number, h: number, paint: Paint) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (g) paint(g, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ------------------------------------------------------------ paint sheets */

function paintGrain(g: Ctx2D, w: number, h: number, seed: number, base: string, strands: number) {
  const r = prng(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  for (let k = 0; k < strands; k++) {
    const y0 = r() * h;
    const amp = 1 + r() * 8;
    const f = 1 + Math.floor(r() * 3);
    const ph = r() * Math.PI * 2;
    g.strokeStyle =
      r() < 0.6
        ? `rgba(36,18,7,${(0.12 + r() * 0.28).toFixed(3)})`
        : `rgba(200,146,96,${(0.05 + r() * 0.1).toFixed(3)})`;
    g.lineWidth = 0.5 + r() * 2.2;
    g.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const u = (x / w) * Math.PI * 2;
      const y =
        y0 + amp * Math.sin(u * f + ph) + amp * 0.35 * Math.sin(u * (3 * f + 1) + ph * 1.7);
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
}

function inlayFlower(g: Ctx2D, x: number, y: number, s: number, rot: number) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  for (let k = 0; k < 5; k++) {
    g.save();
    g.rotate((k * Math.PI * 2) / 5);
    g.beginPath();
    g.ellipse(0, -s * 0.6, s * 0.34, s * 0.6, 0, 0, Math.PI * 2);
    g.fillStyle = "#efe4c8";
    g.fill();
    g.lineWidth = Math.max(1, s * 0.07);
    g.strokeStyle = "#a9895a";
    g.stroke();
    g.restore();
  }
  g.beginPath();
  g.arc(0, 0, s * 0.2, 0, Math.PI * 2);
  g.fillStyle = "#c9974c";
  g.fill();
  g.restore();
}

function inlayLeaf(g: Ctx2D, x: number, y: number, len: number, ang: number) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  g.beginPath();
  g.moveTo(0, 0);
  g.quadraticCurveTo(len * 0.5, -len * 0.3, len, 0);
  g.quadraticCurveTo(len * 0.5, len * 0.3, 0, 0);
  g.fillStyle = "#d6c293";
  g.fill();
  g.strokeStyle = "#a9895a";
  g.lineWidth = 1.2;
  g.stroke();
  g.restore();
}

function paintInlay(g: Ctx2D, w: number, h: number) {
  paintGrain(g, w, h, 23, "#5b3620", 90);
  g.strokeStyle = "#efe4c8";
  g.lineWidth = 6;
  g.strokeRect(14, 14, w - 28, h - 28);
  g.strokeStyle = "#a9895a";
  g.lineWidth = 2;
  g.strokeRect(26, 26, w - 52, h - 52);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      const x = 68 + col * 100 + (row % 2) * 50;
      const y = 80 + row * 96;
      inlayLeaf(g, x, y, 34, -2.3);
      inlayLeaf(g, x, y, 34, -0.84);
      inlayLeaf(g, x, y, 30, 2.4);
      inlayFlower(g, x, y, 22, row * 0.4);
      g.beginPath();
      g.arc(x + 50, y + 48, 3.5, 0, Math.PI * 2);
      g.fillStyle = "#e6d6ae";
      g.fill();
    }
  }
}

function paintBrass(g: Ctx2D, w: number, h: number) {
  g.fillStyle = "#c99b4e";
  g.fillRect(0, 0, w, h);
  const r = prng(77);
  for (let k = 0; k < 240; k++) {
    const x = r() * w;
    const y = r() * h;
    const rad = 3 + r() * 14;
    g.fillStyle =
      r() < 0.6
        ? `rgba(96,142,116,${(0.1 + r() * 0.22).toFixed(3)})`
        : `rgba(120,78,30,${(0.06 + r() * 0.12).toFixed(3)})`;
    g.beginPath();
    g.ellipse(x, y, rad, rad * (0.45 + r() * 0.6), r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  for (let k = 0; k < 90; k++) {
    const x = r() * w;
    const y = r() * h;
    g.fillStyle = `rgba(245,214,140,${(0.12 + r() * 0.15).toFixed(3)})`;
    g.beginPath();
    g.arc(x, y, 1 + r() * 3, 0, Math.PI * 2);
    g.fill();
  }
}

function paintGrooves(g: Ctx2D, w: number, h: number) {
  const c = w / 2;
  g.fillStyle = "#1d1d22";
  g.fillRect(0, 0, w, h);
  for (let rr = 100; rr < c - 4; rr += 1.5) {
    g.beginPath();
    g.arc(c, c, rr, 0, Math.PI * 2);
    g.strokeStyle = `rgba(130,130,145,${(0.05 + 0.09 * Math.abs(Math.sin(rr * 0.9))).toFixed(3)})`;
    g.lineWidth = 0.8;
    g.stroke();
  }
  const sheen = g.createRadialGradient(c, c, 40, c, c, c);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.55, "rgba(255,255,255,0.07)");
  sheen.addColorStop(0.8, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(0,0,0,0.35)");
  g.fillStyle = sheen;
  g.fillRect(0, 0, w, h);
  g.beginPath();
  g.arc(c, c, c - 6, 0, Math.PI * 2);
  g.strokeStyle = "#2e2e36";
  g.lineWidth = 8;
  g.stroke();
}

function paintLabel(g: Ctx2D, w: number, h: number) {
  const c = w / 2;
  const grad = g.createRadialGradient(c, c, 12, c, c, c);
  grad.addColorStop(0, "#d42a34");
  grad.addColorStop(1, "#7a0b14");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  g.lineWidth = 6;
  g.strokeStyle = "#e2bb66";
  g.beginPath();
  g.arc(c, c, c - 8, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 2;
  g.strokeStyle = "rgba(246,230,190,0.6)";
  g.beginPath();
  g.arc(c, c, c - 24, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#f6ead0";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "bold 34px Georgia, serif";
  g.fillText("AURORA", c, c - 18);
  g.font = "600 15px Georgia, serif";
  g.fillText("SONATA  \u00b7  78 R.P.M.", c, c + 22);
  g.beginPath();
  g.arc(c, c, 9, 0, Math.PI * 2);
  g.fillStyle = "#120a08";
  g.fill();
}

/* ------------------------------------------------------------------ model */

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  b.joint("cabinet", { at: [0, 0, 0] });
  const root = b.root;

  const put = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    root.add(m);
    return m;
  };

  // cylinder lying along X between x0 and x1
  const cylX = (r: number, x0: number, x1: number, y: number, z: number, mat: THREE.Material) => {
    const m = put(new THREE.CylinderGeometry(r, r, Math.abs(x1 - x0), 18), mat, (x0 + x1) / 2, y, z);
    m.rotation.z = Math.PI / 2;
    return m;
  };

  // turn an object so its local +Z points along d (YXZ Euler, no lookAt)
  const aimZ = (m: THREE.Object3D, d: THREE.Vector3) => {
    const v = d.clone().normalize();
    m.rotation.order = "YXZ";
    m.rotation.set(Math.asin(-v.y), Math.atan2(v.x, v.z), 0);
  };

  /* materials */
  const walnutMap = canvasTexture(512, 512, (g, w, h) => paintGrain(g, w, h, 11, "#6c4527", 110));
  const inlayMap = canvasTexture(768, 544, paintInlay);
  const brassMap = canvasTexture(256, 256, paintBrass);
  const grooveMap = canvasTexture(512, 512, paintGrooves);
  const labelMap = canvasTexture(256, 256, paintLabel);

  const walnut = new THREE.MeshStandardMaterial({ map: walnutMap, roughness: 0.55, metalness: 0 });
  const inlay = new THREE.MeshStandardMaterial({ map: inlayMap, roughness: 0.45, metalness: 0 });
  const brass = new THREE.MeshStandardMaterial({ map: brassMap, roughness: 0.35, metalness: 0.45 });
  const horn = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.32,
    metalness: 0.45,
    side: THREE.DoubleSide,
  });
  const chrome = new THREE.MeshStandardMaterial({ color: "#d8dde4", roughness: 0.2, metalness: 0.75 });
  const ebony = new THREE.MeshStandardMaterial({ color: "#17130f", roughness: 0.4, metalness: 0.05 });
  const amber = new THREE.MeshStandardMaterial({ color: "#a04c18", roughness: 0.2, metalness: 0 });
  const vinyl = new THREE.MeshStandardMaterial({ map: grooveMap, roughness: 0.28, metalness: 0.2 });
  const labelMat = new THREE.MeshStandardMaterial({ map: labelMap, roughness: 0.5 });

  /* claw feet: brass leg, claw cup, three toes, amber ball on the floor */
  const feet: Array<[number, number]> = [
    [-0.2, -0.165],
    [0.2, -0.165],
    [-0.2, 0.165],
    [0.2, 0.165],
  ];
  for (const [fx, fz] of feet) {
    put(new THREE.CylinderGeometry(0.013, 0.02, 0.1, 14), brass, fx, 0.15, fz);
    put(new THREE.CylinderGeometry(0.024, 0.019, 0.024, 16), brass, fx, 0.094, fz);
    put(new THREE.SphereGeometry(0.036, 20, 14), amber, fx, 0.036, fz);
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3 + 0.5;
      const at = (r: number, y: number) =>
        new THREE.Vector3(fx + r * Math.cos(a), y, fz + r * Math.sin(a));
      const toe = new THREE.CatmullRomCurve3([
        at(0.018, 0.09),
        at(0.04, 0.082),
        at(0.046, 0.05),
        at(0.036, 0.02),
        at(0.02, 0.006),
      ]);
      put(new THREE.TubeGeometry(toe, 20, 0.0075, 8, false), brass);
    }
  }

  /* plinth, carved body, cornice and top board */
  put(new THREE.BoxGeometry(0.5, 0.035, 0.44), walnut, 0, 0.2175, 0);
  put(new THREE.BoxGeometry(0.47, 0.288, 0.41), walnut, 0, 0.379, 0);
  put(new THREE.BoxGeometry(0.516, 0.01, 0.456), walnut, 0, 0.528, 0);
  put(new THREE.BoxGeometry(0.504, 0.027, 0.444), walnut, 0, 0.5465, 0);

  /* front: inlaid floral panel framed in carved moulding */
  put(new THREE.PlaneGeometry(0.33, 0.23), inlay, 0, 0.39, 0.2065);
  put(new THREE.BoxGeometry(0.36, 0.014, 0.012), walnut, 0, 0.512, 0.211);
  put(new THREE.BoxGeometry(0.36, 0.014, 0.012), walnut, 0, 0.268, 0.211);
  put(new THREE.BoxGeometry(0.014, 0.25, 0.012), walnut, -0.172, 0.39, 0.211);
  put(new THREE.BoxGeometry(0.014, 0.25, 0.012), walnut, 0.172, 0.39, 0.211);

  /* front pilasters with bead rings */
  for (const x of [-0.232, 0.232]) {
    put(new THREE.CylinderGeometry(0.018, 0.02, 0.288, 18), walnut, x, 0.379, 0.2);
    put(new THREE.CylinderGeometry(0.026, 0.026, 0.016, 18), walnut, x, 0.243, 0.2);
    put(new THREE.CylinderGeometry(0.026, 0.026, 0.016, 18), walnut, x, 0.515, 0.2);
    const b1 = put(new THREE.TorusGeometry(0.021, 0.006, 8, 18), walnut, x, 0.262, 0.2);
    b1.rotation.x = Math.PI / 2;
    const b2 = put(new THREE.TorusGeometry(0.021, 0.006, 8, 18), walnut, x, 0.5, 0.2);
    b2.rotation.x = Math.PI / 2;
  }

  /* brass drawer pull in the lower band */
  put(new THREE.TorusGeometry(0.011, 0.0028, 8, 20), brass, 0, 0.248, 0.2105);

  /* the horn block at the back of the top board, with its brass flange */
  put(new THREE.BoxGeometry(0.09, 0.05, 0.08), walnut, 0, 0.585, -0.17);

  /* ----- morning-glory horn: a lofted tube with five lobes at the mouth */
  const NS = 96; // stations along the horn
  const NR = 56; // segments around the horn
  const THROAT = 0.028;
  const MOUTH = 0.36;
  const flare = (s: number) => THROAT + (MOUTH - THROAT) * (0.35 * s * s + 0.65 * s ** 5);
  const lobeAmp = (s: number) => 0.2 * Math.pow(smooth(0.62, 1, s), 1.3);
  const lobe = (p: number) => 0.7 * Math.cos(5 * p) + 0.14 * Math.cos(10 * p + 0.6);

  const hornPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.612, -0.17),
    new THREE.Vector3(0, 0.8, -0.17),
    new THREE.Vector3(0, 0.98, -0.15),
    new THREE.Vector3(0, 1.07, -0.03),
    new THREE.Vector3(0, 1.12, 0.09),
    new THREE.Vector3(0, 1.2, 0.22),
  ]);

  type Station = { p: THREE.Vector3; t: THREE.Vector3; n: THREE.Vector3; bn: THREE.Vector3 };
  const stations: Station[] = [];
  let ref = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i <= NS; i++) {
    const s = i / NS;
    const t = hornPath.getTangentAt(s).normalize();
    ref = ref.addScaledVector(t, -ref.dot(t)).normalize(); // parallel transport
    const n = ref.clone();
    const bn = new THREE.Vector3().crossVectors(t, n);
    stations.push({ p: hornPath.getPointAt(s), t, n, bn });
  }

  const hornPositions: number[] = [];
  const hornColors: number[] = [];
  const hornIndices: number[] = [];
  const rimPts: THREE.Vector3[] = [];
  const cBrass = new THREE.Color("#c9994a");
  const cPatina = new THREE.Color("#5f8c74");
  const tint = new THREE.Color();

  for (let i = 0; i <= NS; i++) {
    const s = i / NS;
    const st = stations[i];
    for (let j = 0; j < NR; j++) {
      const phi = (j / NR) * Math.PI * 2;
      const L = lobe(phi);
      const r = flare(s) * (1 + lobeAmp(s) * L);
      const c = Math.cos(phi);
      const sn = Math.sin(phi);
      const x = st.p.x + r * (st.n.x * c + st.bn.x * sn);
      const y = st.p.y + r * (st.n.y * c + st.bn.y * sn);
      const z = st.p.z + r * (st.n.z * c + st.bn.z * sn);
      hornPositions.push(x, y, z);
      if (i === NS) rimPts.push(new THREE.Vector3(x, y, z));
      const wob = 0.5 + 0.5 * Math.sin(phi * 9 + s * 13) * Math.cos(phi * 4 - s * 7);
      const patina = clamp01(
        smooth(0.5, 1, s) * (0.3 + 0.55 * wob) + Math.max(0, -L) * smooth(0.55, 1, s) * 0.9,
      );
      tint.copy(cBrass).lerp(cPatina, patina);
      hornColors.push(tint.r, tint.g, tint.b);
    }
  }
  for (let i = 0; i < NS; i++) {
    for (let j = 0; j < NR; j++) {
      const a = i * NR + j;
      const d = i * NR + ((j + 1) % NR);
      const bq = (i + 1) * NR + j;
      const c = (i + 1) * NR + ((j + 1) % NR);
      hornIndices.push(a, d, bq, bq, d, c);
    }
  }
  const hornGeo = new THREE.BufferGeometry();
  hornGeo.setAttribute("position", new THREE.Float32BufferAttribute(hornPositions, 3));
  hornGeo.setAttribute("color", new THREE.Float32BufferAttribute(hornColors, 3));
  hornGeo.setIndex(hornIndices);
  hornGeo.computeVertexNormals();
  put(hornGeo, horn);

  // rolled brass rim following the petal lobes
  put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 200, 0.011, 8, true), brass);

  // seam bands along the neck
  for (const k of [14, 34, 52, 66]) {
    const st = stations[k];
    const M = new THREE.Matrix4().makeBasis(st.n, st.bn, st.t);
    M.setPosition(st.p);
    const ring = new THREE.TorusGeometry(flare(k / NS) + 0.002, 0.0055, 8, NR).applyMatrix4(M);
    put(ring, brass);
  }

  // throat flange seated on the horn block
  const s0 = stations[0];
  const M0 = new THREE.Matrix4().makeBasis(s0.n, s0.t, new THREE.Vector3().crossVectors(s0.n, s0.t));
  M0.setPosition(s0.p);
  put(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 28).applyMatrix4(M0), brass);

  /* turntable: brass platter, green felt mat, black record, red label, spindle */
  put(new THREE.CylinderGeometry(0.165, 0.165, 0.018, 64), brass, 0, 0.569, 0.05);
  const platterRim = put(new THREE.TorusGeometry(0.163, 0.005, 8, 72), brass, 0, 0.578, 0.05);
  platterRim.rotation.x = Math.PI / 2;

  put(new THREE.CylinderGeometry(0.15, 0.15, 0.004, 72), vinyl, 0, 0.583, 0.05);
  const labelDisc = put(new THREE.CircleGeometry(0.055, 48), labelMat, 0, 0.5862, 0.05);
  labelDisc.rotation.x = -Math.PI / 2;

  put(new THREE.CylinderGeometry(0.0045, 0.0045, 0.04, 14), chrome, 0, 0.605, 0.05);
  put(new THREE.SphereGeometry(0.009, 14, 10), brass, 0, 0.625, 0.05);

  /* tonearm: brass pillar, chrome S-curve arm, black headshell */
  put(new THREE.CylinderGeometry(0.014, 0.018, 0.04, 18), brass, 0.19, 0.58, -0.14);
  put(new THREE.SphereGeometry(0.015, 14, 10), brass, 0.19, 0.6, -0.14);
  const armPts = [
    new THREE.Vector3(0.19, 0.6, -0.14),
    new THREE.Vector3(0.19, 0.66, -0.12),
    new THREE.Vector3(0.17, 0.695, -0.05),
    new THREE.Vector3(0.125, 0.685, 0.01),
    new THREE.Vector3(0.1, 0.64, 0.065),
    new THREE.Vector3(0.086, 0.608, 0.098),
  ];
  put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(armPts), 96, 0.0065, 8, false), chrome);
  const head = put(new THREE.BoxGeometry(0.026, 0.012, 0.042), ebony, 0.086, 0.603, 0.108);
  aimZ(head, new THREE.Vector3().subVectors(armPts[5], armPts[4]));

  /* side crank: boss, axle, disc, pin, chrome handle and walnut knob */
  cylX(0.022, -0.246, -0.236, 0.4, 0, brass);
  cylX(0.011, -0.262, -0.246, 0.4, 0, brass);
  cylX(0.045, -0.272, -0.262, 0.4, 0, brass);
  cylX(0.007, -0.28, -0.272, 0.43, 0, chrome);
  cylX(0.008, -0.33, -0.28, 0.43, 0, chrome);
  put(new THREE.SphereGeometry(0.022, 18, 12), walnut, -0.342, 0.43, 0);

  /* seated details through the SDK: felt mat under the record, tacks on the inlay frame */
  const felt = new THREE.CylinderGeometry(0.158, 0.158, 0.003, 56);
  felt.translate(0, 0.0015, 0);
  b.stick(felt, "#22402e", frame([0, 0.578, 0.05], [0, 1, 0]));

  for (const [tx, ty] of [
    [-0.172, 0.512],
    [0.172, 0.512],
    [-0.172, 0.268],
    [0.172, 0.268],
  ]) {
    b.stick(new THREE.SphereGeometry(0.0045, 10, 8), "#c79a4c", frame([tx, ty, 0.2165], [0, 0, 1]));
  }

  return b.root;
}
