```ts
import * as THREE from "three";

export const meta = {
  name: "Brass Explorer's Telescope",
  description:
    "A polished brass refracting telescope with leather-wrapped bands, engraved rings, a finder scope, focusing knobs and a rubber eyecup, on a mahogany tripod with brass fittings and a little tray holding a rolled star chart, a spread chart and a compass.",
};

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  rx = 1,
  ry = 1
) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  return t;
}

export default function build(): THREE.Object3D {
  const rng = mulberry32(1868);
  const root = new THREE.Group();

  // ---------- Textures ----------
  const brassTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#d1a84e";
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 2) {
      const l = rng();
      g.fillStyle = l > 0.5 ? `rgba(255,236,170,${(l - 0.5) * 0.25})` : `rgba(90,60,10,${(0.5 - l) * 0.25})`;
      g.fillRect(x, 0, 2, h);
    }
    // broad highlight band
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, "rgba(255,240,190,0)");
    gr.addColorStop(0.3, "rgba(255,240,190,0.35)");
    gr.addColorStop(0.42, "rgba(255,240,190,0)");
    gr.addColorStop(1, "rgba(255,240,190,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });

  const leatherTex = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = "#5e3420";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      g.fillStyle = rng() > 0.5 ? "rgba(30,12,4,0.25)" : "rgba(140,90,55,0.18)";
      g.fillRect(rng() * w, rng() * h, 2, 2);
    }
    g.strokeStyle = "rgba(25,10,3,0.55)";
    g.lineWidth = 2;
    for (let x = -64; x < w + 64; x += 21) {
      g.beginPath();
      g.moveTo(x, 12);
      g.lineTo(x + 30, h - 12);
      g.stroke();
    }
    g.fillStyle = "#3a1c0e";
    g.fillRect(0, 0, w, 10);
    g.fillRect(0, h - 10, w, 10);
    g.strokeStyle = "#ecd9a8";
    g.lineWidth = 2;
    g.setLineDash([6, 5]);
    g.beginPath();
    g.moveTo(0, 15);
    g.lineTo(w, 15);
    g.moveTo(0, h - 15);
    g.lineTo(w, h - 15);
    g.stroke();
    g.setLineDash([]);
  });

  const engravedTex = canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = "#c99f45";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#4a3210";
    g.fillRect(0, 4, w, 3);
    g.fillRect(0, h - 7, w, 3);
    g.fillStyle = "#f4dc96";
    g.fillRect(0, 9, w, 2);
    g.fillRect(0, h - 11, w, 2);
    g.strokeStyle = "#4a3210";
    g.lineWidth = 2;
    g.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = 32 + Math.sin((x / w) * Math.PI * 32) * 9;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    for (let i = 0; i < 16; i++) {
      const cx = i * 32 + 16;
      g.fillStyle = "#4a3210";
      g.beginPath();
      g.moveTo(cx, 22);
      g.lineTo(cx + 6, 32);
      g.lineTo(cx, 42);
      g.lineTo(cx - 6, 32);
      g.closePath();
      g.fill();
      g.beginPath();
      g.arc(cx + 16, 32, 2.5, 0, Math.PI * 2);
      g.fill();
    }
  });

  const woodTex = canvasTex(128, 512, (g, w, h) => {
    g.fillStyle = "#6e2617";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x0 = rng() * w;
      const amp = 2 + rng() * 6;
      const f = 1 + rng() * 3;
      g.strokeStyle = rng() > 0.4 ? `rgba(35,8,3,${0.2 + rng() * 0.35})` : `rgba(170,80,45,${0.15 + rng() * 0.2})`;
      g.lineWidth = 1 + rng() * 2.5;
      g.beginPath();
      for (let y = 0; y <= h; y += 8) {
        const x = x0 + Math.sin((y / h) * Math.PI * 2 * f + i) * amp;
        if (y === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
  });

  const chartTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#1b2550";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(230,190,100,0.55)";
    g.lineWidth = 1.5;
    for (let r = 30; r < 200; r += 34) {
      g.beginPath();
      g.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      g.stroke();
    }
    for (let a = 0; a < 12; a++) {
      g.beginPath();
      g.moveTo(w / 2, h / 2);
      g.lineTo(w / 2 + Math.cos((a * Math.PI) / 6) * 200, h / 2 + Math.sin((a * Math.PI) / 6) * 200);
      g.stroke();
    }
    for (let i = 0; i < 160; i++) {
      const s = rng();
      g.fillStyle = s > 0.85 ? "#ffd86b" : "#ffffff";
      g.beginPath();
      g.arc(rng() * w, rng() * h, s > 0.9 ? 2.6 : 1 + s, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = "#9fd0ff";
    g.lineWidth = 1.5;
    for (let c = 0; c < 4; c++) {
      let x = 40 + rng() * 170;
      let y = 40 + rng() * 170;
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        x += (rng() - 0.5) * 60;
        y += (rng() - 0.5) * 60;
        g.lineTo(x, y);
        g.fillStyle = "#ffffff";
        g.fillRect(x - 2, y - 2, 4, 4);
      }
      g.stroke();
    }
    g.strokeStyle = "#e8c070";
    g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, h - 6);
  });

  const paperTex = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = "#e9dbb0";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 25; i++) {
      g.fillStyle = `rgba(150,110,50,${rng() * 0.12})`;
      g.beginPath();
      g.arc(rng() * w, rng() * h, 6 + rng() * 20, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = "rgba(90,60,30,0.5)";
    g.lineWidth = 1;
    for (let y = 10; y < h; y += 14) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    g.fillStyle = "#2a2f6a";
    for (let i = 0; i < 40; i++) g.fillRect(rng() * w, rng() * h, 2, 2);
  });

  const rollEndTex = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = "#e3d2a0";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#7a5a30";
    g.lineWidth = 2;
    g.beginPath();
    for (let t = 0; t < Math.PI * 12; t += 0.1) {
      const r = 4 + t * 1.55;
      const x = w / 2 + Math.cos(t) * r;
      const y = h / 2 + Math.sin(t) * r;
      if (t === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  });

  const compassTex = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = "#f3ead2";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#3a2a10";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(64, 64, 56, 0, Math.PI * 2);
    g.stroke();
    for (let a = 0; a < 32; a++) {
      const an = (a * Math.PI) / 16;
      const r0 = a % 4 === 0 ? 44 : 50;
      g.beginPath();
      g.moveTo(64 + Math.cos(an) * r0, 64 + Math.sin(an) * r0);
      g.lineTo(64 + Math.cos(an) * 56, 64 + Math.sin(an) * 56);
      g.stroke();
    }
    g.fillStyle = "#b8231c";
    g.beginPath();
    g.moveTo(64, 14);
    g.lineTo(72, 64);
    g.lineTo(56, 64);
    g.fill();
    g.fillStyle = "#1c2a55";
    g.beginPath();
    g.moveTo(64, 114);
    g.lineTo(72, 64);
    g.lineTo(56, 64);
    g.fill();
    g.fillStyle = "#3a2a10";
    g.font = "bold 16px serif";
    g.textAlign = "center";
    g.fillText("N", 64, 34 - 12);
  });

  const plateTex = canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = "#d6ae55";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#4a3210";
    g.lineWidth = 4;
    g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = "#3d290c";
    g.textAlign = "center";
    g.font = "bold 26px serif";
    g.fillText("J. HARLOW & SONS", w / 2, 44);
    g.font = "italic 20px serif";
    g.fillText("London \u2022 1868", w / 2, 74);
  });

  // ---------- Materials ----------
  const brass = new THREE.MeshStandardMaterial({ color: 0xffffff, map: brassTex, metalness: 0.6, roughness: 0.3 });
  const darkBrass = new THREE.MeshStandardMaterial({ color: 0x9c7428, metalness: 0.6, roughness: 0.4, flatShading: true });
  const brightBrass = new THREE.MeshStandardMaterial({ color: 0xf0cf78, metalness: 0.55, roughness: 0.22 });
  const engraved = new THREE.MeshStandardMaterial({ color: 0xffffff, map: engravedTex, metalness: 0.55, roughness: 0.32 });
  const leather = new THREE.MeshStandardMaterial({ color: 0xffffff, map: leatherTex, roughness: 0.85 });
  const wood = new THREE.MeshStandardMaterial({ color: 0xffffff, map: woodTex, roughness: 0.55 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1c1a1a, roughness: 0.95, side: THREE.DoubleSide });
  const glass = new THREE.MeshStandardMaterial({ color: 0x2b4f86, metalness: 0.8, roughness: 0.05, emissive: 0x0b1c3a, emissiveIntensity: 0.6 });
  const blackInner = new THREE.MeshStandardMaterial({ color: 0x0c0b0b, roughness: 1, side: THREE.DoubleSide });
  const brassOpen = new THREE.MeshStandardMaterial({ color: 0xffffff, map: brassTex, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide });
  const chartMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: chartTex, roughness: 0.8 });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: paperTex, roughness: 0.9 });
  const rollEndMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: rollEndTex, roughness: 0.9 });
  const ribbon = new THREE.MeshStandardMaterial({ color: 0xb3202a, roughness: 0.6 });
  const compassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: compassTex, roughness: 0.5 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: plateTex, metalness: 0.5, roughness: 0.35 });
  const woodWall = new THREE.MeshStandardMaterial({ color: 0xffffff, map: woodTex, roughness: 0.55, side: THREE.DoubleSide });

  const add = (parent: THREE.Object3D, m: THREE.Mesh) => {
    parent.add(m);
    return m;
  };

  // cylinder along local Z, front (+Z) radius rF, back radius rB
  const tubeZ = (
    parent: THREE.Object3D,
    rF: number,
    rB: number,
    z0: number,
    z1: number,
    mat: THREE.Material | THREE.Material[],
    seg = 16,
    open = false,
    x = 0,
    y = 0
  ) => {
    const geo = new THREE.CylinderGeometry(rF, rB, z1 - z0, seg, 1, open);
    geo.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, (z0 + z1) / 2);
    return add(parent, m);
  };
  const cylX = (parent: THREE.Object3D, r: number, len: number, mat: THREE.Material, x: number, y: number, z: number, seg = 12) => {
    const geo = new THREE.CylinderGeometry(r, r, len, seg);
    geo.rotateZ(Math.PI / 2);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    return add(parent, m);
  };
  const ringZ = (parent: THREE.Object3D, r: number, tube: number, z: number, mat: THREE.Material, x = 0, y = 0) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 5, 20), mat);
    m.position.set(x, y, z);
    return add(parent, m);
  };
  const rod = (parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 8) => {
    const d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return add(parent, m);
  };

  // ---------- Tripod ----------
  const headY = 1.13;
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 12), wood);
  head.position.y = headY;
  root.add(head);
  const headTrim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.007, 5, 24), brass);
  headTrim.rotation.x = Math.PI / 2;
  headTrim.position.y = headY + 0.025;
  root.add(headTrim);
  const headTrim2 = headTrim.clone();
  headTrim2.position.y = headY - 0.025;
  root.add(headTrim2);

  const legAngles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
  const trayY = 0.45;
  const legPointsAtTray: THREE.Vector3[] = [];

  for (const a of legAngles) {
    const ca = Math.cos(a), sa = Math.sin(a);
    const A = new THREE.Vector3(ca * 0.11, 1.1, sa * 0.11);
    const F = new THREE.Vector3(ca * 0.6, 0.05, sa * 0.6);
    const dir = F.clone().sub(A).normalize();
    const tan = new THREE.Vector3(-sa, 0, ca);
    const zA = new THREE.Vector3().crossVectors(tan, dir).normalize();
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(tan, dir, zA));
    const seg = (s0: number, s1: number, w: number, d: number, mat: THREE.Material) => {
      const P = A.clone().lerp(F, s0), Q = A.clone().lerp(F, s1);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, P.distanceTo(Q), d), mat);
      m.position.copy(P).add(Q).multiplyScalar(0.5);
      m.quaternion.copy(q);
      return add(root, m);
    };
    // upper twin slats
    const up1 = seg(0.0, 0.58, 0.022, 0.034, wood);
    up1.position.addScaledVector(tan, 0.016);
    const up2 = seg(0.0, 0.58, 0.022, 0.034, wood);
    up2.position.addScaledVector(tan, -0.016);
    // lower extension
    seg(0.5, 0.97, 0.026, 0.026, wood);
    // brass fittings
    seg(0.54, 0.62, 0.064, 0.044, darkBrass); // clamp
    seg(0.27, 0.3, 0.06, 0.04, brass); // slat band
    seg(0.92, 1.0, 0.034, 0.034, brass); // ferrule
    // clamp screw outward
    const M = A.clone().lerp(F, 0.58);
    const out = zA.clone().multiplyScalar(zA.dot(new THREE.Vector3(ca, 0, sa)) > 0 ? 1 : -1);
    rod(root, M, M.clone().addScaledVector(out, 0.05), 0.006, brass, 6);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.008), brightBrass);
    wing.position.copy(M).addScaledVector(out, 0.05);
    wing.quaternion.copy(q);
    root.add(wing);
    // hinge at top
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.075, 10), brass);
    hinge.position.copy(A);
    hinge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
    root.add(hinge);
    // spike foot
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 6), darkBrass);
    spike.rotation.x = Math.PI;
    spike.position.set(F.x, 0.025, F.z);
    root.add(spike);
    // leg point at tray height
    const s = (A.y - trayY) / (A.y - F.y);
    legPointsAtTray.push(A.clone().lerp(F, s));
  }

  // ---------- Tray ----------
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.018, 6), wood);
  tray.position.y = trayY;
  root.add(tray);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 6, 1, true), woodWall);
  wall.position.y = trayY + 0.024;
  root.add(wall);
  for (let k = 0; k < 6; k++) {
    const th = (k * Math.PI) / 3;
    const cx = Math.sin(th) * 0.22, cz = Math.cos(th) * 0.22;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.045, 6), brass);
    post.position.set(cx, trayY + 0.022, cz);
    root.add(post);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), brightBrass);
    bead.position.set(cx, trayY + 0.048, cz);
    root.add(bead);
  }
  for (const L of legPointsAtTray) {
    const h = new THREE.Vector3(L.x, 0, L.z).normalize();
    const start = new THREE.Vector3(h.x * 0.22, trayY, h.z * 0.22);
    rod(root, start, L, 0.008, brass, 6);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), darkBrass);
    clip.position.copy(L);
    clip.rotation.y = Math.atan2(h.x, h.z);
    root.add(clip);
  }
  const trayTop = trayY + 0.009;
  // rolled star chart
  const rollGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.24, 14);
  rollGeo.rotateZ(Math.PI / 2);
  const roll = new THREE.Mesh(rollGeo, [paperMat, rollEndMat, rollEndMat]);
  roll.position.set(0, trayTop + 0.026, -0.07);
  roll.rotation.y = 0.15;
  root.add(roll);
  for (const off of [-0.06, 0.06]) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.004, 4, 14), ribbon);
    rib.position.set(Math.cos(0.15) * off, trayTop + 0.026, -0.07 - Math.sin(0.15) * off);
    rib.rotation.y = Math.PI / 2 + 0.15;
    root.add(rib);
  }
  const bowTail = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.002, 0.05), ribbon);
  bowTail.position.set(0.06, trayTop + 0.002, -0.035);
  bowTail.rotation.y = 0.5;
  root.add(bowTail);
  // spread chart
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.003, 0.11), chartMat);
  sheet.position.set(-0.045, trayTop + 0.002, 0.075);
  sheet.rotation.y = 0.25;
  root.add(sheet);
  // compass
  const compass = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.034, 0.014, 14), brass);
  compass.position.set(0.115, trayTop + 0.007, 0.07);
  root.add(compass);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.027, 16), compassMat);
  face.rotation.x = -Math.PI / 2;
  face.position.set(0.115, trayTop + 0.0145, 0.07);
  root.add(face);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.002, 4, 8), brightBrass);
  bow.position.set(0.115, trayTop + 0.01, 0.106);
  root.add(bow);

  // ---------- Mount ----------
  const az = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.03, 12), brass);
  az.position.y = 1.17;
  root.add(az);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.04, 10), darkBrass);
  post.position.y = 1.205;
  root.add(post);
  cylX(root, 0.006, 0.05, brass, 0.08, 1.17, 0, 6);
  const azKnob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), brightBrass);
  azKnob.position.set(0.107, 1.17, 0);
  root.add(azKnob);
  const yokeBase = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.02, 0.08), brass);
  yokeBase.position.y = 1.235;
  root.add(yokeBase);
  const pivotY = 1.33;
  for (const sx of [-1, 1]) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.1, 0.07), brass);
    plate.position.set(sx * 0.095, 1.29, 0);
    root.add(plate);
    cylX(root, 0.035, 0.015, brass, sx * 0.095, pivotY, 0, 14);
    const knob = cylX(root, 0.026, 0.016, darkBrass, sx * 0.118, pivotY, 0, 12);
    knob.rotation.x = 0.1;
    cylX(root, 0.014, 0.012, brightBrass, sx * 0.131, pivotY, 0, 10);
    const tbar = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.06, 0.01), brightBrass);
    tbar.position.set(sx * 0.14, pivotY, 0);
    root.add(tbar);
  }

  // ---------- Telescope ----------
  const tg = new THREE.Group();
  tg.position.set(0, pivotY, 0);
  tg.rotation.x = -0.35;
  root.add(tg);

  cylX(tg, 0.012, 0.19, darkBrass, 0, 0, 0, 8); // trunnion axle
  ringZ(tg, 0.063, 0.009, 0, darkBrass);

  // main body
  tubeZ(tg, 0.055, 0.055, -0.45, 0.45, brass, 18);
  tubeZ(tg, 0.058, 0.058, 0.08, 0.3, leather, 18);
  tubeZ(tg, 0.058, 0.058, -0.38, -0.15, leather, 18);
  for (const z of [-0.42, -0.12, 0.05, 0.33]) {
    tubeZ(tg, 0.061, 0.061, z - 0.012, z + 0.012, engraved, 18);
    ringZ(tg, 0.061, 0.003, z - 0.012, brightBrass);
    ringZ(tg, 0.061, 0.003, z + 0.012, brightBrass);
  }
  // objective end / dew shield
  tubeZ(tg, 0.068, 0.056, 0.45, 0.5, brass, 18);
  tubeZ(tg, 0.068, 0.068, 0.5, 0.66, brassOpen, 18, true);
  tubeZ(tg, 0.065, 0.065, 0.55, 0.655, blackInner, 18, true);
  tubeZ(tg, 0.071, 0.071, 0.61, 0.645, engraved, 18);
  ringZ(tg, 0.068, 0.006, 0.66, brightBrass);
  ringZ(tg, 0.068, 0.004, 0.5, darkBrass);
  tubeZ(tg, 0.062, 0.062, 0.545, 0.553, glass, 18);
  ringZ(tg, 0.06, 0.004, 0.555, darkBrass);

  // nameplate on +X side
  const plateBack = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.032, 0.074), darkBrass);
  plateBack.position.set(0.056, 0, -0.075);
  tg.add(plateBack);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.026), plateMat);
  plate.rotation.y = Math.PI / 2;
  plate.position.set(0.0585, 0, -0.075);
  tg.add(plate);
  for (const z of [-0.106, -0.044]) {
    const rv = new THREE.Mesh(new THREE.SphereGeometry(0.003, 6, 4), brightBrass);
    rv.position.set(0.0585, 0, z);
    tg.add(rv);
  }

  // rear: focuser and eyepiece
  tubeZ(tg, 0.055, 0.042, -0.5, -0.45, brass, 18);
  tubeZ(tg, 0.042, 0.042, -0.6, -0.5, darkBrass, 14);
  ringZ(tg, 0.042, 0.004, -0.6, brightBrass);
  const rack = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.09), darkBrass);
  rack.position.set(0, -0.05, -0.55);
  tg.add(rack);
  cylX(tg, 0.006, 0.15, brightBrass, 0, -0.058, -0.55, 6);
  for (const sx of [-1, 1]) {
    cylX(tg, 0.022, 0.02, darkBrass, sx * 0.065, -0.058, -0.55, 12);
    cylX(tg, 0.013, 0.008, brightBrass, sx * 0.079, -0.058, -0.55, 10);
    cylX(tg, 0.016, 0.004, brightBrass, sx * 0.053, -0.058, -0.55, 10);
  }
  tubeZ(tg, 0.031, 0.031, -0.7, -0.6, brightBrass, 14);
  for (const z of [-0.62, -0.64, -0.66]) ringZ(tg, 0.031, 0.0015, z, darkBrass);
  tubeZ(tg, 0.025, 0.022, -0.75, -0.7, brass, 14);
  ringZ(tg, 0.024, 0.003, -0.72, engraved);
  tubeZ(tg, 0.025, 0.033, -0.81, -0.745, rubber, 14, true);
  ringZ(tg, 0.029, 0.004, -0.775, rubber);
  ringZ(tg, 0.033, 0.003, -0.81, rubber);
  tubeZ(tg, 0.02, 0.02, -0.752, -0.748, glass, 12);

  // finder scope
  const fy = 0.118;
  for (const z of [-0.08, 0.2]) {
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.018), darkBrass);
    stem.position.set(0, 0.075, z);
    tg.add(stem);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, 0.03), brass);
    foot.position.set(0, 0.058, z);
    tg.add(foot);
    ringZ(tg, 0.023, 0.005, z, brass, 0, fy);
    for (const sx of [-1, 1]) {
      const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.018, 6), brightBrass);
      sc.position.set(sx * 0.022, fy + 0.016, z);
      sc.rotation.z = -sx * 0.8;
      tg.add(sc);
      const hd = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 4), brightBrass);
      hd.position.set(sx * 0.028, fy + 0.022, z);
      tg.add(hd);
    }
  }
  tubeZ(tg, 0.016, 0.016, -0.23, 0.25, brass, 12, false, 0, fy);
  tubeZ(tg, 0.017, 0.017, -0.02, 0.1, leather, 12, false, 0, fy);
  tubeZ(tg, 0.022, 0.016, 0.25, 0.27, brass, 12, false, 0, fy);
  tubeZ(tg, 0.022, 0.022, 0.27, 0.31, brassOpen, 12, true, 0, fy);
  ringZ(tg, 0.022, 0.003, 0.31, brightBrass, 0, fy);
  tubeZ(tg, 0.02, 0.02, 0.285, 0.289, glass, 12, false, 0, fy);
  tubeZ(tg, 0.016, 0.011, -0.26, -0.23, brass, 10, false, 0, fy);
  tubeZ(tg, 0.011, 0.014, -0.3, -0.26, rubber, 10, true, 0, fy);

  return root;
}
```