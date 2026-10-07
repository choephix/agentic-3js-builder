```ts
import * as THREE from "three";

export const meta = {
  name: "Morning-Glory Gramophone",
  description:
    "Antique wind-up gramophone: a flaring, scalloped brass morning-glory horn with a green patina, a walnut cabinet with pale floral inlay, a black record with a red label, a silver tonearm, a side crank and ball-and-claw feet.",
};

type V3 = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

// ---------- seeded random ----------
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- canvas textures ----------
function canvasTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
  srgb: boolean,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function inlayFlower(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "#ece0bf";
  ctx.strokeStyle = "#8f6d40";
  ctx.lineWidth = Math.max(1, r * 0.07);
  for (let k = 0; k < 5; k++) {
    ctx.save();
    ctx.rotate((k * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.5, r * 0.26, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "#c59a5c";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a3b1e";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function leafShape(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, ang: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = "#d9c99c";
  ctx.strokeStyle = "#8f6d40";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(len * 0.5, 0, len * 0.5, len * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Walnut with grain and a pale floral inlay. The tile repeats seamlessly.
function drawWalnut(ctx: CanvasRenderingContext2D, S: number) {
  const r = rng(7);
  ctx.fillStyle = "#5b3a22";
  ctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 72; i++) {
    const y0 = r() * S;
    const amp = 1.5 + r() * 6;
    const k = 1 + Math.floor(r() * 3);
    const ph = r() * Math.PI * 2;
    const dark = r() < 0.6;
    ctx.strokeStyle = dark
      ? `rgba(30,18,9,${(0.18 + r() * 0.3).toFixed(2)})`
      : `rgba(150,104,64,${(0.12 + r() * 0.2).toFixed(2)})`;
    ctx.lineWidth = 0.6 + r() * 2.2;
    for (const off of [-S, 0, S]) {
      ctx.beginPath();
      for (let x = 0; x <= S; x += 4) {
        const t = (x / S) * Math.PI * 2;
        const y = y0 + off + amp * Math.sin(k * t + ph) + amp * 0.35 * Math.sin(3 * k * t + 2 * ph);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(25,15,8,${(0.2 + r() * 0.3).toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(r() * S, r() * S, 0.6 + r() * 1.4, 0.4 + r() * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // vine joining the two large flowers (drawn first, flowers sit on top)
  ctx.strokeStyle = "#d8c89c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0.25 * S, 0.25 * S);
  ctx.quadraticCurveTo(0.52 * S, 0.46 * S, 0.75 * S, 0.75 * S);
  ctx.stroke();
  leafShape(ctx, 0.4 * S, 0.4 * S, S * 0.12, Math.PI * 0.75);
  leafShape(ctx, 0.6 * S, 0.6 * S, S * 0.12, -Math.PI * 0.25);

  inlayFlower(ctx, 0.25 * S, 0.25 * S, S * 0.1, 0.3);
  inlayFlower(ctx, 0.75 * S, 0.75 * S, S * 0.1, 1.0);
  inlayFlower(ctx, 0.75 * S, 0.25 * S, S * 0.045, 0.6);
  inlayFlower(ctx, 0.25 * S, 0.75 * S, S * 0.045, 0.2);
}

// Green patina blotches, shared by the colour and metalness maps.
function patinaTextures(): { color: THREE.CanvasTexture; metal: THREE.CanvasTexture } {
  const r = rng(42);
  const blots: { x: number; y: number; rx: number; ry: number; rot: number; a: number; g: number }[] = [];
  for (let i = 0; i < 80; i++) {
    blots.push({
      x: r() * 512,
      y: r() * 512,
      rx: 6 + r() * 40,
      ry: 5 + r() * 24,
      rot: r() * Math.PI,
      a: 0.3 + r() * 0.45,
      g: Math.floor(r() * 4),
    });
  }
  const specks: { x: number; y: number; s: number; l: boolean }[] = [];
  for (let i = 0; i < 1100; i++) {
    specks.push({ x: r() * 512, y: r() * 512, s: 0.5 + r() * 1.7, l: r() < 0.5 });
  }
  const greens = ["#5f8f72", "#7fa98b", "#3f6d5b", "#9bb68a"];

  const color = canvasTexture(
    512,
    (ctx, S) => {
      ctx.fillStyle = "#c48d3e";
      ctx.fillRect(0, 0, S, S);
      for (const p of specks) {
        ctx.fillStyle = p.l ? "rgba(240,200,120,0.45)" : "rgba(110,70,25,0.35)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const b of blots) {
        ctx.fillStyle = greens[b.g];
        ctx.globalAlpha = b.a;
        for (const dx of [-S, 0, S]) {
          for (const dy of [-S, 0, S]) {
            ctx.beginPath();
            ctx.ellipse(b.x + dx, b.y + dy, b.rx, b.ry, b.rot, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    },
    true,
  );

  // metalness: bright where the brass is bare, dull where the patina sits
  const metal = canvasTexture(
    512,
    (ctx, S) => {
      ctx.fillStyle = "rgb(190,190,190)";
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = "rgb(30,30,30)";
      for (const b of blots) {
        ctx.globalAlpha = b.a;
        for (const dx of [-S, 0, S]) {
          for (const dy of [-S, 0, S]) {
            ctx.beginPath();
            ctx.ellipse(b.x + dx, b.y + dy, b.rx, b.ry, b.rot, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    },
    false,
  );

  return { color, metal };
}

function drawGrooves(ctx: CanvasRenderingContext2D, S: number) {
  const r = rng(3);
  const c = S / 2;
  ctx.fillStyle = "#16161a";
  ctx.fillRect(0, 0, S, S);
  for (let rad = S * 0.2; rad < S * 0.5; rad += 1.5) {
    ctx.strokeStyle = `rgba(160,160,172,${(0.03 + r() * 0.08).toFixed(3)})`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(c, c, rad, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawLabel(ctx: CanvasRenderingContext2D, S: number) {
  const c = S / 2;
  ctx.fillStyle = "#e8dab0";
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = "#a6222b";
  ctx.beginPath();
  ctx.arc(c, c, S * 0.46, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e3b657";
  ctx.lineWidth = S * 0.016;
  ctx.beginPath();
  ctx.arc(c, c, S * 0.36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f3d98c";
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * S * 0.26, c + Math.sin(a) * S * 0.26, S * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let k = 0; k < 6; k++) {
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate((k / 6) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -S * 0.1, S * 0.03, S * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#161616";
  ctx.beginPath();
  ctx.arc(c, c, S * 0.035, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- geometry helpers ----------
function mk(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material | THREE.Material[],
  pos: V3 = [0, 0, 0],
  rot: V3 = [0, 0, 0],
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(m);
  return m;
}

// A cylinder stretched between two points.
function rod(parent: THREE.Object3D, a: V3, b: V3, r: number, mat: THREE.Material, seg = 10): THREE.Mesh {
  const A = new THREE.Vector3(a[0], a[1], a[2]);
  const B = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = B.clone().sub(A);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  parent.add(m);
  return m;
}

function ball(parent: THREE.Object3D, r: number, mat: THREE.Material, pos: V3): THREE.Mesh {
  return mk(parent, new THREE.SphereGeometry(r, 16, 12), mat, pos);
}

// Box whose UVs are in world units, so the inlay keeps one scale on every face.
function woodBox(parent: THREE.Object3D, w: number, h: number, d: number, mat: THREE.Material, pos: V3, tile = 0.24): THREE.Mesh {
  const g = new THREE.BoxGeometry(w, h, d);
  const p = g.attributes.position as THREE.BufferAttribute;
  const n = g.attributes.normal as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i));
    const ay = Math.abs(n.getY(i));
    const az = Math.abs(n.getZ(i));
    let u: number;
    let v: number;
    if (ax >= ay && ax >= az) {
      u = p.getZ(i);
      v = p.getY(i);
    } else if (ay >= az) {
      u = p.getX(i);
      v = p.getZ(i);
    } else {
      u = p.getX(i);
      v = p.getY(i);
    }
    uv.setXY(i, u / tile, v / tile);
  }
  uv.needsUpdate = true;
  return mk(parent, g, mat, pos);
}

// Ball-and-claw foot: a brass ball held by three curled claws, on a short leg.
function clawFoot(parent: THREE.Object3D, x: number, z: number, mat: THREE.Material) {
  const ballR = 0.024;
  const c = new THREE.Vector3(x, ballR, z);
  ball(parent, ballR, mat, [c.x, c.y, c.z]);
  for (let k = 0; k < 3; k++) {
    const a = (k * Math.PI * 2) / 3 + 0.4;
    const o = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const base = c.clone().addScaledVector(o, 0.018);
    base.y += 0.012;
    const dir = o.clone().multiplyScalar(-0.35).add(UP).normalize();
    const h = 0.05;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.011, h, 10), mat);
    cone.position.copy(base).addScaledVector(dir, h / 2);
    cone.quaternion.setFromUnitVectors(UP, dir);
    parent.add(cone);
  }
  rod(parent, [x, 0.05, z], [x, 0.104, z], 0.009, mat);
}

// ---------- morning-glory horn ----------
// Radius along the horn axis (s = 0 at the throat, s = 1 at the mouth).
function hornRadius(s: number): number {
  return 0.014 + 0.02 * s + 0.325 * Math.pow(s, 2.6);
}

// Surface of revolution with five scalloped lobes that grow toward the mouth.
function morningGlory(L: number, N: number, M: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const base = hornRadius(s);
    for (let j = 0; j <= M; j++) {
      const th = (j / M) * Math.PI * 2;
      const w = Math.cos(5 * th);
      const r = base * (1 + 0.12 * Math.pow(s, 3) * w);
      const y = s * L + 0.025 * Math.pow(s, 6) * (0.5 + 0.5 * w);
      pos.push(Math.cos(th) * r, y, Math.sin(th) * r);
      uv.push((j / M) * 3, s * 1.6);
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j;
      const b = (i + 1) * (M + 1) + j;
      const c = b + 1;
      const d = a + 1;
      idx.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();

  // Blend normals across the seam so there is no visible line.
  const nrm = g.getAttribute("normal") as THREE.BufferAttribute;
  for (let i = 0; i <= N; i++) {
    const a = i * (M + 1);
    const b = a + M;
    const x = nrm.getX(a) + nrm.getX(b);
    const y = nrm.getY(a) + nrm.getY(b);
    const z = nrm.getZ(a) + nrm.getZ(b);
    const l = Math.hypot(x, y, z) || 1;
    nrm.setXYZ(a, x / l, y / l, z / l);
    nrm.setXYZ(b, x / l, y / l, z / l);
  }
  nrm.needsUpdate = true;
  return g;
}

// ---------- the model ----------
export default function buildGramophone(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "gramophone";

  // materials
  const grain = canvasTexture(512, drawWalnut, true);
  const walnut = new THREE.MeshStandardMaterial({ map: grain, roughness: 0.5, metalness: 0 });
  const walnutDeep = new THREE.MeshStandardMaterial({ map: grain, color: 0x8f7462, roughness: 0.55, metalness: 0 });

  const pat = patinaTextures();
  const brass = new THREE.MeshStandardMaterial({
    map: pat.color,
    metalnessMap: pat.metal,
    metalness: 1,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const silver = new THREE.MeshStandardMaterial({ color: 0xdde3ea, metalness: 0.7, roughness: 0.2 });
  const vinyl = new THREE.MeshStandardMaterial({ color: 0x131315, roughness: 0.32, metalness: 0.1 });
  const grooveMat = new THREE.MeshStandardMaterial({
    map: canvasTexture(512, drawGrooves, true),
    roughness: 0.32,
    metalness: 0.1,
  });
  const labelMat = new THREE.MeshStandardMaterial({ map: canvasTexture(256, drawLabel, true), roughness: 0.5 });
  const red = new THREE.MeshStandardMaterial({ color: 0xa3222b, roughness: 0.5 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xeee4c8, roughness: 0.45 });

  // ----- cabinet -----
  woodBox(root, 0.5, 0.02, 0.4, walnutDeep, [0, 0.11, 0]); // plinth
  woodBox(root, 0.5, 0.38, 0.4, walnut, [0, 0.31, 0]); // body
  woodBox(root, 0.53, 0.02, 0.43, walnut, [0, 0.51, 0]); // top moulding
  woodBox(root, 0.36, 0.26, 0.014, walnut, [0, 0.31, 0.207]); // raised front panel

  // carved bead border around the front panel
  const bz = 0.216;
  rod(root, [-0.18, 0.18, bz], [0.18, 0.18, bz], 0.006, walnutDeep);
  rod(root, [-0.18, 0.44, bz], [0.18, 0.44, bz], 0.006, walnutDeep);
  rod(root, [-0.18, 0.18, bz], [-0.18, 0.44, bz], 0.006, walnutDeep);
  rod(root, [0.18, 0.18, bz], [0.18, 0.44, bz], 0.006, walnutDeep);

  // brass medallion with ivory inlay ring
  mk(root, new THREE.CylinderGeometry(0.03, 0.03, 0.006, 40), brass, [0, 0.41, 0.216], [Math.PI / 2, 0, 0]);
  mk(root, new THREE.TorusGeometry(0.026, 0.003, 8, 40), ivory, [0, 0.41, 0.22]);

  // corner pilasters with brass capitals
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const px = sx * 0.245;
      const pz = sz * 0.195;
      mk(root, new THREE.CylinderGeometry(0.02, 0.021, 0.38, 14), walnut, [px, 0.31, pz]);
      mk(root, new THREE.CylinderGeometry(0.026, 0.026, 0.012, 16), brass, [px, 0.126, pz]);
      mk(root, new THREE.CylinderGeometry(0.026, 0.026, 0.012, 16), brass, [px, 0.494, pz]);
    }
  }

  // ball-and-claw feet
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      clawFoot(root, sx * 0.2, sz * 0.15, brass);
    }
  }

  // ----- turntable -----
  const TX = -0.03;
  const TZ = 0.03;
  mk(root, new THREE.CylinderGeometry(0.16, 0.165, 0.012, 64), brass, [TX, 0.526, TZ]);
  mk(root, new THREE.TorusGeometry(0.16, 0.0045, 10, 72), brass, [TX, 0.532, TZ], [Math.PI / 2, 0, 0]);
  // record: black disc with grooves on the top face, red label on top
  mk(root, new THREE.CylinderGeometry(0.127, 0.127, 0.004, 96), [vinyl, grooveMat, vinyl], [TX, 0.534, TZ]);
  mk(root, new THREE.CylinderGeometry(0.05, 0.05, 0.001, 64), [red, labelMat, red], [TX, 0.5365, TZ]);
  // spindle with a small nut
  rod(root, [TX, 0.532, TZ], [TX, 0.566, TZ], 0.0065, brass);
  ball(root, 0.0105, brass, [TX, 0.568, TZ]);

  // ----- silver tonearm -----
  mk(root, new THREE.CylinderGeometry(0.024, 0.024, 0.008, 28), brass, [0.17, 0.524, -0.13]);
  rod(root, [0.17, 0.52, -0.13], [0.17, 0.6, -0.13], 0.008, silver);
  ball(root, 0.011, silver, [0.17, 0.6, -0.13]);

  const armPts = [
    new THREE.Vector3(0.17, 0.6, -0.13),
    new THREE.Vector3(0.168, 0.628, -0.1),
    new THREE.Vector3(0.15, 0.636, -0.055),
    new THREE.Vector3(0.118, 0.614, -0.02),
    new THREE.Vector3(0.09, 0.585, 0.0),
    new THREE.Vector3(0.07, 0.56, 0.012),
  ];
  const armCurve = new THREE.CatmullRomCurve3(armPts, false, "centripetal");
  mk(root, new THREE.TubeGeometry(armCurve, 48, 0.0045, 8, false), silver);
  // sound box (reproducer) and stylus
  rod(root, [0.07, 0.56, 0.012], [0.052, 0.548, 0.028], 0.011, silver);
  ball(root, 0.0065, silver, [0.052, 0.548, 0.028]);
  const stylus = mk(root, new THREE.ConeGeometry(0.0025, 0.016, 6), silver, [0.056, 0.5445, 0.024]);
  stylus.quaternion.setFromUnitVectors(UP, DOWN);

  // ----- wind-up crank on the side (+X) -----
  mk(root, new THREE.CylinderGeometry(0.012, 0.012, 0.012, 16), brass, [0.256, 0.36, -0.06], [0, 0, Math.PI / 2]);
  mk(root, new THREE.CylinderGeometry(0.028, 0.028, 0.008, 36), brass, [0.27, 0.36, -0.06], [0, 0, Math.PI / 2]);
  rod(root, [0.274, 0.36, -0.06], [0.274, 0.396, -0.06], 0.007, brass);
  ball(root, 0.0075, brass, [0.274, 0.396, -0.06]);
  rod(root, [0.274, 0.396, -0.06], [0.33, 0.396, -0.06], 0.0065, brass);
  mk(root, new THREE.CylinderGeometry(0.0125, 0.0125, 0.03, 16), walnut, [0.345, 0.396, -0.06], [0, 0, Math.PI / 2]);

  // ----- horn post and morning-glory horn -----
  const HB: V3 = [0, 0.62, -0.13];
  mk(root, new THREE.CylinderGeometry(0.045, 0.05, 0.014, 36), brass, [0, 0.527, -0.13]);
  rod(root, [0, 0.52, -0.13], HB, 0.011, brass);
  ball(root, 0.022, brass, HB);

  const hornDir = new THREE.Vector3(0, 0.5, 0.866).normalize();
  const hornGroup = new THREE.Group();
  hornGroup.name = "horn";
  hornGroup.position.set(HB[0], HB[1], HB[2]);
  hornGroup.quaternion.setFromUnitVectors(UP, hornDir);
  root.add(hornGroup);

  const L = 0.6;
  mk(hornGroup, morningGlory(L, 28, 60), brass);
  // decorative collars along the bell
  for (const s of [0.1, 0.36, 0.66]) {
    const rr = hornRadius(s) + 0.004;
    mk(hornGroup, new THREE.TorusGeometry(rr, 0.0055, 8, 60), brass, [0, s * L, 0], [Math.PI / 2, 0, 0]);
  }

  return root;
}
```