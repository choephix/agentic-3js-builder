import * as THREE from "three";

// ---------- seeded random ----------
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const R = makeRng(20240611);

export const meta = {
  name: "Battle-Worn Griffin Knight",
  description:
    "A stylized fantasy knight in dented plate: octagonal great helm with a narrow eye slit and tall crimson plume, layered gold-etched pauldrons, deep-blue surcoat and kite shield bearing a silver griffin, a broadsword resting point-down, and a torn crimson cape.",
};

// ---------- canvas helpers ----------
function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, color = true) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d") as CanvasRenderingContext2D;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(cv);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function drawSteel(ctx: CanvasRenderingContext2D, w: number, h: number, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) {
    const l = R() < 0.5;
    ctx.fillStyle = l ? `rgba(255,255,255,${0.05 * R()})` : `rgba(20,22,28,${0.09 * R()})`;
    ctx.beginPath();
    ctx.arc(R() * w, R() * h, 4 + R() * 20, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 95; i++) {
    const x = R() * w, y = R() * h, a = R() * Math.PI, len = 6 + R() * 40;
    ctx.strokeStyle = R() < 0.55 ? `rgba(255,255,255,${0.25 + 0.35 * R()})` : `rgba(25,25,30,${0.3 + 0.3 * R()})`;
    ctx.lineWidth = 0.5 + R() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  for (let i = 0; i < 10; i++) {
    const x = R() * w, y = R() * h, rad = 5 + R() * 10;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, "rgba(30,30,35,0.6)");
    g.addColorStop(1, "rgba(30,30,35,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 7);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, rad * 0.8, 3.6, 5.4);
    ctx.stroke();
  }
  for (let i = 0; i < 25; i++) {
    ctx.fillStyle = `rgba(110,60,25,${0.15 + 0.2 * R()})`;
    ctx.beginPath();
    ctx.arc(R() * w, R() * h, 1 + R() * 3, 0, 7);
    ctx.fill();
  }
}

function drawCloth(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#1d3c84";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) {
    const hor = R() < 0.5;
    ctx.strokeStyle = R() < 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,20,0.12)";
    ctx.lineWidth = 1;
    const x = R() * w, y = R() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(hor ? x + 10 + R() * 30 : x, hor ? y : y + 10 + R() * 30);
    ctx.stroke();
  }
  for (let i = 0; i < 14; i++) {
    const x = R() * w, y = R() * h, rad = 8 + R() * 25;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, "rgba(20,15,10,0.3)");
    g.addColorStop(1, "rgba(20,15,10,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 7);
    ctx.fill();
  }
}

function drawGriffin(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, fill: string, line: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.fillStyle = fill;
  ctx.strokeStyle = fill;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const poly = (p: number[]) => {
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.closePath();
    ctx.fill();
  };
  const path = (p: number[]) => {
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.stroke();
  };
  // wing
  poly([-4, -6, 6, -40, 14, -34, 20, -48, 28, -36, 36, -46, 40, -30, 48, -30, 38, -16, 44, -8, 22, 4]);
  // tail
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(22, 12);
  ctx.bezierCurveTo(42, 14, 48, 30, 36, 44);
  ctx.stroke();
  poly([36, 44, 29, 53, 40, 50, 45, 40]);
  // body
  ctx.beginPath();
  ctx.ellipse(6, 8, 21, 13, -0.55, 0, Math.PI * 2);
  ctx.fill();
  poly([-20, -18, -6, -24, 12, 2, -6, 14]);
  // head
  ctx.beginPath();
  ctx.arc(-16, -24, 9, 0, Math.PI * 2);
  ctx.fill();
  poly([-23, -29, -37, -21, -23, -17]);
  poly([-12, -31, -4, -43, -7, -27]);
  // legs
  ctx.lineWidth = 6;
  path([-10, -2, -24, -8, -30, -16]);
  path([-6, 6, -22, 10, -31, 3]);
  ctx.lineWidth = 7;
  path([12, 16, 4, 30, 10, 44]);
  path([20, 13, 26, 30, 19, 44]);
  // talons
  ctx.lineWidth = 2;
  path([-30, -16, -36, -18]);
  path([-30, -16, -34, -22]);
  path([-31, 3, -37, 0]);
  path([-31, 3, -36, 7]);
  path([10, 44, 4, 47]);
  path([10, 44, 14, 48]);
  path([19, 44, 13, 47]);
  path([19, 44, 23, 48]);
  // detail lines
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.5;
  path([8, -4, 14, -34]);
  path([16, -2, 26, -36]);
  path([24, 0, 38, -28]);
  path([28, 2, 42, -14]);
  path([-14, -14, -2, -4]);
  path([-10, -8, 2, 0]);
  ctx.fillStyle = line;
  ctx.beginPath();
  ctx.arc(-18, -26, 2, 0, 7);
  ctx.fill();
  ctx.restore();
}

function kitePath(p: any) {
  p.moveTo(-0.27, 0.36);
  p.quadraticCurveTo(0, 0.42, 0.27, 0.36);
  p.lineTo(0.28, 0.12);
  p.quadraticCurveTo(0.26, -0.25, 0, -0.55);
  p.quadraticCurveTo(-0.26, -0.25, -0.28, 0.12);
  p.lineTo(-0.27, 0.36);
}

function remapUV(geo: THREE.BufferGeometry, minX: number, minY: number, w: number, h: number) {
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - minX) / w, (p.getY(i) - minY) / h);
  uv.needsUpdate = true;
}

const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build(): THREE.Object3D {
  const root = new THREE.Group();

  // ---------- textures ----------
  const steelTex = canvasTex(256, 256, (c, w, h) => drawSteel(c, w, h, "#b9c0c8"));
  const pauldronTex = canvasTex(256, 256, (c, w, h) => {
    drawSteel(c, w, h, "#b4bbc4");
    const scroll = (x: number, y: number, s: number, d: number) => {
      c.beginPath();
      for (let t = 0; t <= 4 * Math.PI; t += 0.25) {
        const rr = s * (1 - t / (4 * Math.PI));
        const px = x + Math.cos(t * d) * rr, py = y + Math.sin(t * d) * rr;
        if (t === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();
    };
    for (const pass of [{ col: "#3b2a0a", lw: 5 }, { col: "#e8bd55", lw: 2.4 }]) {
      c.strokeStyle = pass.col;
      c.lineWidth = pass.lw;
      c.lineCap = "round";
      const y = h * 0.39;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= w; x += 4) c.lineTo(x, y + Math.sin((x / w) * Math.PI * 8) * 10);
      c.stroke();
      for (let k = 0; k < 8; k++) {
        const x = ((k + 0.25) / 8) * w;
        scroll(x, y - 16, 9, 1);
        scroll(x + w / 16, y + 16, 9, -1);
      }
      c.beginPath();
      c.moveTo(0, h * 0.475);
      c.lineTo(w, h * 0.475);
      c.moveTo(0, h * 0.3);
      c.lineTo(w, h * 0.3);
      c.stroke();
      for (let k = 0; k < 8; k++) {
        const x = ((k + 0.5) / 8) * w;
        c.beginPath();
        c.moveTo(x, h * 0.29);
        c.quadraticCurveTo(x + 10, h * 0.2, x, h * 0.13);
        c.quadraticCurveTo(x - 10, h * 0.2, x, h * 0.29);
        c.stroke();
      }
    }
  });
  const clothTex = canvasTex(256, 256, drawCloth);
  const emblemTex = canvasTex(256, 270, (c, w, h) => {
    drawCloth(c, w, h);
    c.strokeStyle = "#c9d0da";
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(0, 8);
    c.lineTo(w, 8);
    c.stroke();
    c.lineWidth = 2;
    c.strokeRect(14, 18, w - 28, h - 26);
    drawGriffin(c, w / 2 - 4, h / 2 + 6, 2.0, "#dfe4ec", "#4a587a");
  });
  const flapTex = canvasTex(256, 256, (c, w, h) => {
    drawCloth(c, w, h);
    c.fillStyle = "#c9d0da";
    c.fillRect(w * 0.05, 0, 6, h);
    c.fillRect(w * 0.95 - 6, 0, 6, h);
    c.fillRect(0, h * 0.8, w, 5);
    for (let k = 0; k < 7; k++) {
      c.beginPath();
      const x = ((k + 0.5) / 7) * w;
      c.moveTo(x, h * 0.72);
      c.lineTo(x + 8, h * 0.76);
      c.lineTo(x, h * 0.8);
      c.lineTo(x - 8, h * 0.76);
      c.fill();
    }
  });
  const SW = 302, SH = 512, SS = SW / 0.56;
  const shieldTex = canvasTex(SW, SH, (c, w, h) => {
    c.fillStyle = "#173470";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) {
      c.fillStyle = R() < 0.5 ? "rgba(255,255,255,0.04)" : "rgba(0,0,10,0.1)";
      c.fillRect(R() * w, R() * h, 2 + R() * 8, 2 + R() * 8);
    }
    c.setTransform(SS, 0, 0, -SS, 0.28 * SS, 0.4 * SS);
    c.save();
    c.translate(0, -0.07);
    c.scale(0.9, 0.9);
    c.translate(0, 0.07);
    c.beginPath();
    kitePath(c);
    c.lineWidth = 0.018;
    c.strokeStyle = "#c9d0da";
    c.stroke();
    c.restore();
    c.setTransform(1, 0, 0, 1, 0, 0);
    drawGriffin(c, w / 2, 210, 2.25, "#dfe4ec", "#3b4868");
    for (let i = 0; i < 70; i++) {
      const x = R() * w, y = R() * h, a = R() * Math.PI, len = 5 + R() * 35;
      c.strokeStyle = R() < 0.6 ? `rgba(230,235,245,${0.2 + 0.3 * R()})` : "rgba(5,10,25,0.5)";
      c.lineWidth = 0.6 + R();
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.stroke();
    }
    for (let i = 0; i < 4; i++) {
      const x = 40 + R() * (w - 80), y = 80 + R() * 300, a = 0.4 + R() * 0.6, len = 40 + R() * 40;
      c.strokeStyle = "rgba(8,10,20,0.85)";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.stroke();
      c.strokeStyle = "rgba(190,170,130,0.7)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(x + 2, y - 2);
      c.lineTo(x + 2 + Math.cos(a) * len, y - 2 + Math.sin(a) * len);
      c.stroke();
    }
  });
  const capeTex = canvasTex(128, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#a8172b");
    g.addColorStop(1, "#5a0912");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = "rgba(30,0,5,0.18)";
      c.fillRect(((i + 0.3) / 6) * w, 0, 6 + R() * 6, h);
    }
    c.fillStyle = "#d9a93c";
    c.fillRect(0, 6, w, 5);
    for (let i = 0; i < 10; i++) {
      const x = R() * w, y = h * 0.7 + R() * h * 0.3, rad = 6 + R() * 14;
      const gg = c.createRadialGradient(x, y, 0, x, y, rad);
      gg.addColorStop(0, "rgba(20,5,0,0.45)");
      gg.addColorStop(1, "rgba(20,5,0,0)");
      c.fillStyle = gg;
      c.beginPath();
      c.arc(x, y, rad, 0, 7);
      c.fill();
    }
  });
  const capeAlpha = canvasTex(128, 256, (c, w, h) => {
    c.fillStyle = "#fff";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#000";
    c.beginPath();
    c.moveTo(0, h);
    const n = 13;
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * w;
      const depth = i % 2 === 0 ? 0.02 + R() * 0.05 : 0.08 + R() * 0.12;
      c.lineTo(x, h - depth * h);
    }
    c.lineTo(w, h);
    c.closePath();
    c.fill();
    const holes = [[0.3, 0.72], [0.68, 0.6], [0.55, 0.83]];
    for (const [hx, hy] of holes) {
      c.beginPath();
      c.moveTo(hx * w, hy * h - 14);
      c.lineTo(hx * w + 6, hy * h + 2);
      c.lineTo(hx * w - 2, hy * h + 16);
      c.lineTo(hx * w - 6, hy * h);
      c.closePath();
      c.fill();
    }
  }, false);
  const mailTex = canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = "#24272d";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#a2a9b2";
    c.lineWidth = 1.6;
    for (let y = 0; y < h + 8; y += 8)
      for (let x = 0; x < w + 8; x += 8) {
        c.beginPath();
        c.arc(x + ((y / 8) % 2 ? 4 : 0), y, 4.5, 0, 7);
        c.stroke();
      }
  });
  mailTex.wrapS = mailTex.wrapT = THREE.RepeatWrapping;
  mailTex.repeat.set(6, 2);

  // ---------- materials ----------
  const M = (color: number, o: any = {}) => new THREE.MeshStandardMaterial({ color, ...o });
  const steel = M(0xffffff, { map: steelTex, metalness: 0.75, roughness: 0.38, flatShading: true });
  const darkSteel = M(0x7c828b, { map: steelTex, metalness: 0.7, roughness: 0.45, flatShading: true });
  const pauldronMat = M(0xffffff, { map: pauldronTex, metalness: 0.7, roughness: 0.4, flatShading: true, side: THREE.DoubleSide });
  const gold = M(0xd9a93c, { metalness: 0.9, roughness: 0.3, flatShading: true });
  const black = M(0x050506, { roughness: 0.9 });
  const cloth = M(0xffffff, { map: clothTex, roughness: 0.95, flatShading: true });
  const emblem = M(0xffffff, { map: emblemTex, roughness: 0.9 });
  const flapMat = M(0xffffff, { map: flapTex, roughness: 0.95, side: THREE.DoubleSide });
  const shieldFace = M(0xffffff, { map: shieldTex, metalness: 0.2, roughness: 0.6 });
  const capeMat = M(0xffffff, { map: capeTex, alphaMap: capeAlpha, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, flatShading: true });
  const plumeA = M(0xb3121f, { roughness: 0.85, flatShading: true });
  const plumeB = M(0x6e0a14, { roughness: 0.85, flatShading: true });
  const leather = M(0x4a2c18, { roughness: 0.85, flatShading: true });
  const mail = M(0xffffff, { map: mailTex, metalness: 0.6, roughness: 0.5 });
  const bladeMat = M(0xdfe5ec, { metalness: 0.9, roughness: 0.22, flatShading: true });

  // ---------- helpers ----------
  const add = (geo: THREE.BufferGeometry, mat: any, x = 0, y = 0, z = 0, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const between = (a: THREE.Vector3, b: THREE.Vector3, r1: number, r2: number, seg: number, mat: any, parent: THREE.Object3D = root) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, seg), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(m);
    return m;
  };
  const rivetGeo = new THREE.IcosahedronGeometry(0.008, 0);
  const rivet = (x: number, y: number, z: number, parent: THREE.Object3D = root) => add(rivetGeo, gold, x, y, z, parent);

  // ---------- legs ----------
  for (const s of [-1, 1]) {
    const hip = V(0.11 * s, 0.9, 0), knee = V(0.12 * s, 0.5, 0.03), ankle = V(0.125 * s, 0.11, 0.01);
    between(hip, knee, 0.085, 0.072, 8, steel);
    between(V(0.118 * s, 0.6, 0.025), V(0.119 * s, 0.57, 0.028), 0.08, 0.077, 8, darkSteel);
    const pol = add(new THREE.SphereGeometry(0.062, 8, 6), steel, knee.x, knee.y, knee.z + 0.025);
    pol.scale.set(1, 1.1, 0.9);
    rivet(knee.x, knee.y, knee.z + 0.083);
    const wing = add(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8), darkSteel, knee.x + 0.06 * s, knee.y, knee.z + 0.01);
    wing.rotation.z = Math.PI / 2;
    rivet(knee.x + 0.067 * s, knee.y, knee.z + 0.01);
    between(V(0.121 * s, 0.43, 0.025), V(0.122 * s, 0.4, 0.023), 0.07, 0.068, 8, darkSteel);
    between(knee, ankle, 0.066, 0.055, 8, steel);
    add(new THREE.SphereGeometry(0.058, 8, 5), darkSteel, ankle.x, ankle.y, ankle.z);
    // sabaton
    add(new THREE.BoxGeometry(0.12, 0.015, 0.27), leather, ankle.x, 0.0075, 0.05);
    add(new THREE.BoxGeometry(0.115, 0.055, 0.25), steel, ankle.x, 0.0425, 0.05);
    for (let i = 0; i < 3; i++) {
      const b = add(new THREE.BoxGeometry(0.11 - 0.012 * i, 0.03, 0.065), i % 2 ? darkSteel : steel, ankle.x, 0.08 - i * 0.012, 0.02 + i * 0.06);
      b.rotation.x = 0.15;
    }
    const toe = add(new THREE.BoxGeometry(0.09, 0.04, 0.06), steel, ankle.x, 0.04, 0.19);
    toe.rotation.x = 0.35;
  }

  // ---------- skirt, mail, torso ----------
  const mailHem = add(new THREE.CylinderGeometry(0.19, 0.24, 0.48, 12, 1, true), mail, 0, 0.66, 0);
  mailHem.scale.z = 0.72;
  (mail as any).side = THREE.DoubleSide;
  const skirt = add(new THREE.CylinderGeometry(0.2, 0.26, 0.5, 10, 1, true), cloth, 0, 0.73, 0);
  skirt.scale.z = 0.72;
  (cloth as any).side = THREE.DoubleSide;

  // tabard flaps with torn hem
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-0.2, 0);
  flapShape.lineTo(0.2, 0);
  const teeth = 10;
  for (let i = 0; i <= teeth; i++) {
    const x = 0.23 - (i / teeth) * 0.46;
    const y = -0.5 + (i % 2 ? 0.04 * R() + 0.02 : -0.015 * R()) + (i === 4 ? 0.09 : 0);
    flapShape.lineTo(x, y);
  }
  flapShape.lineTo(-0.2, 0);
  const flapGeo = new THREE.ShapeGeometry(flapShape);
  flapGeo.computeBoundingBox();
  const fb = flapGeo.boundingBox as THREE.Box3;
  remapUV(flapGeo, fb.min.x, fb.min.y, fb.max.x - fb.min.x, fb.max.y - fb.min.y);
  const front = add(flapGeo, flapMat, 0, 0.98, 0.158);
  front.rotation.x = -0.12;
  const back = add(flapGeo, flapMat, 0, 0.98, -0.158);
  back.rotation.set(0.12, Math.PI, 0);

  add(new THREE.BoxGeometry(0.42, 0.44, 0.27), cloth, 0, 1.19, 0);
  add(new THREE.PlaneGeometry(0.4, 0.42), emblem, 0, 1.19, 0.1365);

  // belt
  const belt = add(new THREE.CylinderGeometry(0.218, 0.218, 0.055, 12), leather, 0, 0.975, 0);
  belt.scale.z = 0.66;
  add(new THREE.BoxGeometry(0.065, 0.055, 0.015), gold, 0, 0.975, 0.148);
  add(new THREE.BoxGeometry(0.035, 0.028, 0.017), leather, 0, 0.975, 0.149);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    if (Math.abs(Math.sin(a)) > 0.95 && Math.cos(a) > 0) continue;
    rivet(Math.sin(a) * 0.222, 0.975, Math.cos(a) * 0.222 * 0.66);
  }
  const pouch = add(new THREE.BoxGeometry(0.08, 0.1, 0.045), leather, -0.18, 0.9, 0.1);
  pouch.rotation.y = -0.6;
  rivet(-0.195, 0.93, 0.125);
  // empty scabbard on left hip
  between(V(0.2, 0.95, -0.03), V(0.31, 0.27, -0.2), 0.024, 0.019, 6, leather);
  between(V(0.302, 0.32, -0.187), V(0.312, 0.26, -0.203), 0.022, 0.016, 6, gold);
  between(V(0.205, 0.92, -0.04), V(0.214, 0.87, -0.055), 0.028, 0.028, 6, gold);

  // gorget
  add(new THREE.CylinderGeometry(0.1, 0.14, 0.12, 8), steel, 0, 1.44, 0);
  const gr = add(new THREE.TorusGeometry(0.135, 0.008, 4, 16), gold, 0, 1.4, 0);
  gr.rotation.x = Math.PI / 2;

  // ---------- helm ----------
  const helm = add(new THREE.CylinderGeometry(0.135, 0.135, 0.3, 16), steel, 0, 1.65, 0);
  helm.rotation.y = Math.PI / 16;
  add(new THREE.CylinderGeometry(0.09, 0.135, 0.05, 16), steel, 0, 1.825, 0);
  const ringAt = (y: number, tube: number, mat: any) => {
    const t = add(new THREE.TorusGeometry(0.137, tube, 4, 16), mat, 0, y, 0);
    t.rotation.x = Math.PI / 2;
    return t;
  };
  ringAt(1.505, 0.01, gold);
  ringAt(1.735, 0.007, gold);
  ringAt(1.8, 0.006, darkSteel);
  const slitGeo = new THREE.TorusGeometry(0.134, 0.012, 4, 10, 1.7);
  slitGeo.rotateZ(Math.PI / 2 - 0.85);
  slitGeo.rotateX(Math.PI / 2);
  const slit = add(slitGeo, black, 0, 1.7, 0);
  slit.scale.y = 0.6;
  add(new THREE.BoxGeometry(0.026, 0.18, 0.014), gold, 0, 1.6, 0.136);
  add(new THREE.BoxGeometry(0.026, 0.08, 0.014), gold, 0, 1.77, 0.132);
  for (const yy of [1.53, 1.62, 1.76]) rivet(0, yy, 0.145);
  const holeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.02, 5);
  for (const side of [-1, 1])
    for (let c = 0; c < 3; c++)
      for (let r = 0; r < 3; r++) {
        const phi = side * (0.42 + c * 0.16);
        const h = add(holeGeo, black, Math.sin(phi) * 0.133, 1.55 + r * 0.035, Math.cos(phi) * 0.133);
        h.rotation.set(Math.PI / 2, phi, 0, "YXZ");
      }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    rivet(Math.sin(a) * 0.145, 1.505, Math.cos(a) * 0.145);
  }

  // plume
  add(new THREE.CylinderGeometry(0.022, 0.03, 0.06, 6), gold, 0, 1.87, 0);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    pts.push(V(0, 1.88 + 0.4 * Math.sin(t * Math.PI * 0.78), 0.02 - 0.45 * t * t));
  }
  const ellGeo = new THREE.SphereGeometry(1, 7, 5);
  const featherGeo = new THREE.ConeGeometry(0.022, 0.15, 4);
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const a = pts[i], b = pts[i + 1];
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const r = 0.068 * (1 - 0.55 * t) + 0.015;
    const e = add(ellGeo, i % 3 === 2 ? plumeB : plumeA, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    e.scale.set(r * 1.1, len * 0.85, r);
    e.quaternion.setFromUnitVectors(UP, d.normalize());
    if (i >= 1) {
      for (const sd of [-1, 1]) {
        const dir = V(sd * 0.8, -0.25 - t * 0.4, -0.45).normalize();
        const f = add(featherGeo, (i + (sd > 0 ? 1 : 0)) % 2 ? plumeB : plumeA, a.x + dir.x * 0.08, a.y + dir.y * 0.08, a.z + dir.z * 0.08);
        f.quaternion.setFromUnitVectors(UP, dir);
        f.scale.set(1, 1 - t * 0.3, 0.6);
      }
    }
  }
  const tip = pts[8];
  for (let k = 0; k < 5; k++) {
    const dir = V((k - 2) * 0.25, -0.85, -0.4).normalize();
    const f = add(featherGeo, k % 2 ? plumeB : plumeA, tip.x + dir.x * 0.08, tip.y + dir.y * 0.08, tip.z + dir.z * 0.08);
    f.quaternion.setFromUnitVectors(UP, dir);
    f.scale.set(1, 1.3, 0.6);
  }

  // ---------- arms ----------
  const buildArm = (s: number, elbow: THREE.Vector3, hand: THREE.Vector3) => {
    const shoulder = V(0.25 * s, 1.37, 0);
    add(new THREE.SphereGeometry(0.065, 8, 6), mail, shoulder.x, shoulder.y - 0.02, shoulder.z);
    between(shoulder, elbow, 0.058, 0.052, 8, steel);
    add(new THREE.SphereGeometry(0.058, 8, 6), darkSteel, elbow.x, elbow.y, elbow.z);
    const fan = add(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), steel, elbow.x + 0.05 * s, elbow.y, elbow.z);
    fan.rotation.z = Math.PI / 2;
    rivet(elbow.x + 0.057 * s, elbow.y, elbow.z);
    const dir = new THREE.Vector3().subVectors(hand, elbow).normalize();
    const wrist = hand.clone().addScaledVector(dir, -0.07);
    between(elbow, wrist, 0.05, 0.044, 8, steel);
    between(wrist.clone().addScaledVector(dir, -0.075), wrist, 0.062, 0.046, 8, darkSteel);
    const hb = add(new THREE.BoxGeometry(0.075, 0.1, 0.065), darkSteel, hand.x, hand.y, hand.z);
    hb.quaternion.setFromUnitVectors(UP, dir);
    const kn = add(new THREE.BoxGeometry(0.08, 0.025, 0.07), steel, 0, 0, 0);
    kn.position.copy(hand).addScaledVector(dir, 0.03);
    kn.quaternion.copy(hb.quaternion);
    const rv = rivet(0, 0, 0);
    rv.position.copy(wrist).addScaledVector(dir, -0.04).add(V(0.055 * s, 0, 0));

    // layered pauldron
    const pg = new THREE.Group();
    pg.position.set(shoulder.x + 0.03 * s, shoulder.y + 0.04, 0);
    pg.rotation.z = -0.35 * s;
    root.add(pg);
    for (let i = 0; i < 4; i++) {
      const r = 0.115 + 0.012 * i;
      const d = add(new THREE.SphereGeometry(r, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), pauldronMat, 0, -0.045 * i, 0, pg);
      d.scale.set(1, 0.75, 1.05);
      const rim = add(new THREE.TorusGeometry(r, 0.006, 4, 16), gold, 0, -0.045 * i, 0, pg);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(1, 1.05, 1);
      for (const a of [-0.5, 0, 0.5]) rivet(Math.sin(a) * r, -0.045 * i + 0.008, Math.cos(a) * r * 1.05, pg);
    }
    const ridgeGeo = new THREE.TorusGeometry(0.115, 0.008, 4, 10, Math.PI);
    const ridge = add(ridgeGeo, gold, 0, 0, 0, pg);
    ridge.rotation.y = Math.PI / 2;
    ridge.scale.set(1.05, 0.75, 1);
    // cape clasp
    add(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 8), gold, 0.17 * s, 1.41, 0.12).rotation.x = Math.PI / 2;
  };
  const rElbow = V(-0.32, 1.09, -0.02), rHand = V(-0.34, 0.9, 0.17);
  const lElbow = V(0.33, 1.1, 0.0), lHand = V(0.37, 0.96, 0.2);
  buildArm(-1, rElbow, rHand);
  buildArm(1, lElbow, lHand);
  between(V(-0.17, 1.41, 0.125), V(0.17, 1.41, 0.125), 0.005, 0.005, 4, gold).rotation.z += 0;

  // ---------- broadsword ----------
  const target = V(-0.43, 0.012, 0.6);
  const sdir = new THREE.Vector3().subVectors(target, rHand);
  const D = sdir.length();
  sdir.normalize();
  const L = D - 0.17;
  const sword = new THREE.Group();
  sword.quaternion.setFromUnitVectors(V(0, -1, 0), sdir);
  sword.position.copy(rHand).addScaledVector(sdir, 0.07);
  root.add(sword);
  add(new THREE.BoxGeometry(0.05, L, 0.01), bladeMat, 0, -L / 2, 0, sword);
  add(new THREE.BoxGeometry(0.012, L * 0.8, 0.012), darkSteel, 0, -L * 0.42, 0, sword);
  const stip = add(new THREE.ConeGeometry(0.0354, 0.1, 4), bladeMat, 0, -L - 0.05, 0, sword);
  stip.rotation.set(Math.PI, Math.PI / 4, 0);
  stip.scale.set(1, 1, 0.2);
  add(new THREE.BoxGeometry(0.22, 0.025, 0.035), gold, 0, 0.0125, 0, sword);
  for (const sx of [-1, 1]) add(new THREE.OctahedronGeometry(0.022), gold, sx * 0.115, 0.0125, 0, sword);
  add(new THREE.CylinderGeometry(0.016, 0.018, 0.13, 6), leather, 0, 0.09, 0, sword);
  const pom = add(new THREE.OctahedronGeometry(0.032), gold, 0, 0.18, 0, sword);
  pom.scale.set(1, 1.1, 0.6);
  add(new THREE.SphereGeometry(0.012, 5, 4), M(0x9c1020, { roughness: 0.3, metalness: 0.2 }), 0, 0.18, 0.02, sword);

  // ---------- kite shield ----------
  const ks = new THREE.Shape();
  kitePath(ks);
  const sg = new THREE.ExtrudeGeometry(ks, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.012, bevelSegments: 1, curveSegments: 6 });
  remapUV(sg, -0.28, -0.55, 0.56, 0.95);
  const shield = new THREE.Mesh(sg, [shieldFace, steel]);
  shield.position.set(0.44, 0.9, 0.23);
  shield.rotation.set(-0.06, 0.5, 0, "YXZ");
  root.add(shield);
  const outline = ks.getSpacedPoints(26);
  for (let i = 0; i < outline.length - 1; i++) {
    const p = outline[i];
    rivet(p.x * 0.93, (p.y + 0.07) * 0.93 - 0.07, 0.036, shield);
  }
  // shield straps behind
  add(new THREE.BoxGeometry(0.3, 0.035, 0.01), leather, 0, 0.1, -0.012, shield);
  add(new THREE.BoxGeometry(0.3, 0.035, 0.01), leather, 0, -0.08, -0.012, shield);

  // ---------- torn cape ----------
  const capeGeo = new THREE.PlaneGeometry(1, 1, 10, 14);
  const cp = capeGeo.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    const u = cp.getX(i) + 0.5, v = cp.getY(i) + 0.5, hang = 1 - v;
    const width = 0.5 + 0.36 * hang;
    const e = Math.abs(u - 0.5) * 2;
    const x = (u - 0.5) * width;
    const y = 0.3 + v * 1.12;
    const z = -0.165 - hang * 0.16 - 0.035 * Math.sin(u * Math.PI * 5 + 0.5) * (0.25 + hang) + e * e * 0.06 * v * v;
    cp.setXYZ(i, x, y, z);
  }
  capeGeo.computeVertexNormals();
  add(capeGeo, capeMat);

  return root;
}
