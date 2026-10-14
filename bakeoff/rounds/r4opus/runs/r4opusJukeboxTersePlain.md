```ts
import * as THREE from "three";

export const meta = {
  name: "Starlight Jukebox",
  description:
    "A 1940s-style arched jukebox: walnut cabinet, glowing orange and red bubble-tube arches, a glass dome over a record carousel, a tilted selector panel and an ornate chrome-barred speaker grille with a gold star medallion.",
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  draw(ctx);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function normUV(g: THREE.BufferGeometry) {
  g.computeBoundingBox();
  const b = g.boundingBox!;
  const p = g.attributes.position;
  const uv = new Float32Array(p.count * 2);
  const w = b.max.x - b.min.x || 1;
  const h = b.max.y - b.min.y || 1;
  for (let i = 0; i < p.count; i++) {
    uv[i * 2] = (p.getX(i) - b.min.x) / w;
    uv[i * 2 + 1] = (p.getY(i) - b.min.y) / h;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

function roundRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export default function build(): THREE.Object3D {
  const rng = makeRng(1946);
  const root = new THREE.Group();

  // ---------- textures ----------
  const woodTex = canvasTex(256, 256, (c) => {
    c.fillStyle = "#7c4524";
    c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) {
      const y = rng() * 256;
      const dark = rng() < 0.6;
      c.strokeStyle = dark
        ? `rgba(60,25,10,${0.15 + rng() * 0.35})`
        : `rgba(190,120,70,${0.1 + rng() * 0.25})`;
      c.lineWidth = 0.6 + rng() * 2.4;
      c.beginPath();
      const amp = 1 + rng() * 4, f = 0.01 + rng() * 0.03, ph = rng() * 6;
      for (let x = 0; x <= 256; x += 8) {
        const yy = y + Math.sin(x * f + ph) * amp;
        if (x === 0) c.moveTo(x, yy);
        else c.lineTo(x, yy);
      }
      c.stroke();
    }
  });
  woodTex.repeat.set(1, 2);

  const grilleTex = canvasTex(256, 256, (c) => {
    c.fillStyle = "#5e1020";
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = "rgba(0,0,0,0.25)";
    c.lineWidth = 1;
    for (let i = 0; i < 256; i += 3) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke();
    }
    c.strokeStyle = "#e8b74a";
    c.lineWidth = 3;
    for (let i = -256; i <= 512; i += 32) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 256, 256); c.stroke();
      c.beginPath(); c.moveTo(i, 256); c.lineTo(i + 256, 0); c.stroke();
    }
    c.fillStyle = "#ffd77a";
    for (let x = 0; x <= 256; x += 32)
      for (let y = 0; y <= 256; y += 32) {
        c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(x + 16, y + 16, 2.5, 0, Math.PI * 2); c.fill();
      }
  });
  grilleTex.repeat.set(1, 1);

  const burstTex = canvasTex(256, 192, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 192);
    g.addColorStop(0, "#14082e");
    g.addColorStop(1, "#4a1866");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 192);
    const n = 22;
    for (let i = 0; i < n; i++) {
      if (i % 2) continue;
      const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 1) / n) * Math.PI;
      c.fillStyle = "rgba(255,160,60,0.28)";
      c.beginPath();
      c.moveTo(128, 192);
      c.lineTo(128 + Math.cos(a0) * 300, 192 + Math.sin(a0) * 300);
      c.lineTo(128 + Math.cos(a1) * 300, 192 + Math.sin(a1) * 300);
      c.closePath();
      c.fill();
    }
    const rg = c.createRadialGradient(128, 192, 4, 128, 192, 90);
    rg.addColorStop(0, "rgba(255,220,120,0.9)");
    rg.addColorStop(1, "rgba(255,120,40,0)");
    c.fillStyle = rg;
    c.fillRect(0, 0, 256, 192);
    c.strokeStyle = "rgba(80,220,230,0.7)";
    c.lineWidth = 2;
    for (const r of [120, 150]) {
      c.beginPath(); c.arc(128, 192, r, Math.PI, 0); c.stroke();
    }
  });

  const titleTex = canvasTex(512, 96, (c) => {
    c.fillStyle = "#2a1a12";
    c.fillRect(0, 0, 512, 96);
    const titles = ["MOONLIGHT", "BOOGIE", "IN THE MOOD", "SWING", "STARDUST", "JIVE", "BLUE SKIES", "TUXEDO",
      "SENTIMENTAL", "CHATTANOOGA", "PENNIES", "SERENADE", "TAKE THE A", "BEGIN", "DREAM", "ROSE"];
    for (let r = 0; r < 2; r++)
      for (let k = 0; k < 8; k++) {
        const x = 6 + k * 63, y = 6 + r * 45;
        c.fillStyle = "#f6ecd2";
        c.fillRect(x, y, 58, 39);
        c.fillStyle = r === 0 ? "#c8202e" : "#1f58b8";
        c.fillRect(x, y, 58, 6);
        c.fillStyle = "#222";
        c.font = "bold 8px sans-serif";
        c.fillText(titles[r * 8 + k].slice(0, 11), x + 3, y + 18);
        c.font = "7px sans-serif";
        c.fillStyle = "#555";
        c.fillText(String.fromCharCode(65 + r) + (k + 1), x + 3, y + 32);
        c.fillRect(x + 18, y + 27, 34, 2);
      }
  });

  // ---------- materials ----------
  const M = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, ...o });
  const wood = M(0xffffff, { map: woodTex, roughness: 0.5 });
  const darkWood = M(0x5a3a2c, { map: woodTex, roughness: 0.6 });
  const chrome = M(0xe8ecf2, { metalness: 0.95, roughness: 0.2 });
  const gold = M(0xf2b844, { metalness: 0.85, roughness: 0.3 });
  const orangeTube = M(0xff8a1f, { emissive: 0xff6a00, emissiveIntensity: 0.9, roughness: 0.3 });
  const redTube = M(0xff3446, { emissive: 0xe0102a, emissiveIntensity: 0.8, roughness: 0.3 });
  const amber = M(0xffd24a, { emissive: 0xffb000, emissiveIntensity: 0.9, roughness: 0.3 });
  const teal = M(0x48e6d8, { emissive: 0x13b4aa, emissiveIntensity: 0.75, roughness: 0.3 });
  const bubbleMat = M(0xfff6c8, { emissive: 0xfff0a8, emissiveIntensity: 1.0 });
  const maroon = M(0x4a0e1c, { roughness: 0.7 });
  const glass = M(0xcfe8ff, { transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.3, depthWrite: false });
  const vinyl = M(0x141418, { roughness: 0.3, metalness: 0.2 });
  const labelRed = M(0xd82a34, { roughness: 0.5 });
  const labelBlue = M(0x2a66d0, { roughness: 0.5 });
  const labelYellow = M(0xf4c430, { roughness: 0.5 });
  const ivory = M(0xf4ead0, { roughness: 0.35 });
  const slot = M(0x0e0e10, { roughness: 0.8 });
  const grilleMat = M(0xffffff, { map: grilleTex, roughness: 0.85 });
  const burstMat = M(0xffffff, { map: burstTex, emissive: 0xffffff, emissiveMap: burstTex, emissiveIntensity: 0.4 });
  const titleMat = M(0xffffff, { map: titleTex, emissive: 0xffffff, emissiveMap: titleTex, emissiveIntensity: 0.3 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };

  // ---------- plinth & cabinet ----------
  add(new THREE.BoxGeometry(0.92, 0.1, 0.58), darkWood, 0, 0.05, 0);
  add(new THREE.BoxGeometry(0.924, 0.014, 0.012), chrome, 0, 0.1, 0.29);
  add(new THREE.BoxGeometry(0.924, 0.014, 0.012), chrome, 0, 0.02, 0.292);

  const cab = new THREE.Shape();
  cab.moveTo(-0.42, 0.1);
  cab.lineTo(0.42, 0.1);
  cab.lineTo(0.42, 1.1);
  cab.absarc(0, 1.1, 0.42, 0, Math.PI, false);
  cab.lineTo(-0.42, 0.1);
  const cabGeo = new THREE.ExtrudeGeometry(cab, {
    depth: 0.47, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 24,
  });
  cabGeo.translate(0, 0, -0.235);
  add(cabGeo, wood);

  // inner maroon face panel
  const inner = new THREE.Shape();
  inner.moveTo(-0.29, 0.2);
  inner.lineTo(0.29, 0.2);
  inner.lineTo(0.29, 1.1);
  inner.absarc(0, 1.1, 0.29, 0, Math.PI, false);
  inner.lineTo(-0.29, 0.2);
  add(new THREE.ExtrudeGeometry(inner, { depth: 0.008, bevelEnabled: false, curveSegments: 20 }), maroon, 0, 0, 0.25);

  // ---------- bubble tube arches ----------
  const archTube = (r: number, tr: number, mat: THREE.Material, z: number, y0: number) => {
    add(new THREE.TorusGeometry(r, tr, 8, 28, Math.PI), mat, 0, 1.1, z);
    for (const sx of [-1, 1])
      add(new THREE.CylinderGeometry(tr, tr, 1.1 - y0, 8), mat, sx * r, (1.1 + y0) / 2, z);
  };
  archTube(0.405, 0.024, chrome, 0.262, 0.2);
  archTube(0.365, 0.03, orangeTube, 0.28, 0.2);
  archTube(0.327, 0.011, chrome, 0.268, 0.2);
  archTube(0.305, 0.016, redTube, 0.272, 0.2);

  // bubbles rising in the orange tube
  const bubbleGeo = new THREE.SphereGeometry(1, 6, 4);
  const R = 0.365, straight = 0.9, arcL = Math.PI * R, L = 2 * straight + arcL;
  for (let i = 0; i < 46; i++) {
    const t = (i / 46) * L + rng() * 0.03;
    let x: number, y: number;
    if (t < straight) { x = -R; y = 0.22 + t * 0.97; }
    else if (t < straight + arcL) {
      const a = Math.PI - (t - straight) / R;
      x = Math.cos(a) * R; y = 1.1 + Math.sin(a) * R;
    } else { x = R; y = 1.1 - (t - straight - arcL) * 0.97; }
    const s = 0.005 + rng() * 0.005;
    const b = add(bubbleGeo, bubbleMat, x + (rng() - 0.5) * 0.02, y, 0.302);
    b.scale.setScalar(s);
  }

  // tube foot blocks and caps
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.15, 0.05, 0.07), chrome, sx * 0.355, 0.2, 0.27);
    add(new THREE.CylinderGeometry(0.02, 0.026, 0.02, 8), amber, sx * 0.365, 0.235, 0.28);
  }

  // ---------- crest on top ----------
  add(new THREE.CylinderGeometry(0.075, 0.075, 0.016, 16, 1, false, Math.PI / 2, Math.PI), gold, 0, 1.53, 0.16, Math.PI / 2);
  for (let i = 0; i < 7; i++) {
    const a = (i / 6) * Math.PI;
    add(new THREE.BoxGeometry(0.008, 0.06, 0.02), chrome, Math.cos(a) * 0.05, 1.53 + Math.sin(a) * 0.05, 0.168, 0, 0, a - Math.PI / 2);
  }
  add(new THREE.SphereGeometry(0.018, 10, 6), redTube, 0, 1.545, 0.175);

  // ---------- dome window ----------
  const win = new THREE.Shape();
  win.moveTo(-0.27, 0.97);
  win.lineTo(0.27, 0.97);
  win.lineTo(0.27, 1.1);
  win.absarc(0, 1.1, 0.27, 0, Math.PI, false);
  win.lineTo(-0.27, 0.97);
  const winGeo = new THREE.ShapeGeometry(win, 20);
  normUV(winGeo);
  add(winGeo, burstMat, 0, 0, 0.259);

  const dome = add(new THREE.SphereGeometry(0.27, 20, 8, 0, Math.PI, 0, Math.PI / 2), glass, 0, 1.1, 0.258);
  dome.scale.set(1, 1, 0.55);
  const domeLow = add(new THREE.CylinderGeometry(0.27, 0.27, 0.13, 20, 1, true, -Math.PI / 2, Math.PI), glass, 0, 1.035, 0.258);
  domeLow.scale.set(1, 1, 0.55);
  add(new THREE.TorusGeometry(0.276, 0.013, 6, 28, Math.PI), chrome, 0, 1.1, 0.262);
  for (const sx of [-1, 1])
    add(new THREE.CylinderGeometry(0.013, 0.013, 0.14, 6), chrome, sx * 0.276, 1.035, 0.262);
  // sill
  add(new THREE.BoxGeometry(0.6, 0.025, 0.17), chrome, 0, 0.962, 0.335);
  add(new THREE.CylinderGeometry(0.0125, 0.0125, 0.6, 8), chrome, 0, 0.962, 0.42, 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) add(new THREE.SphereGeometry(0.016, 8, 6), amber, sx * 0.24, 0.99, 0.31);

  // display records standing in back
  const discGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.004, 24);
  const lblGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.005, 14);
  const disp: [number, number, number, THREE.Material][] = [
    [-0.15, 1.17, 0.264, labelBlue], [0.15, 1.17, 0.264, labelYellow], [0, 1.22, 0.27, labelRed],
  ];
  for (const [x, y, z, lm] of disp) {
    add(discGeo, vinyl, x, y, z, Math.PI / 2);
    add(lblGeo, lm, x, y, z + 0.001, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 6), chrome, x, y, z + 0.002, Math.PI / 2);
  }

  // turntable & record stack
  add(new THREE.CylinderGeometry(0.09, 0.092, 0.012, 24), chrome, 0, 0.981, 0.31);
  const recGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.004, 24);
  const recLbl = new THREE.CylinderGeometry(0.03, 0.03, 0.0045, 14);
  const lbls = [labelRed, labelYellow, labelBlue, labelRed, labelBlue, labelYellow];
  for (let i = 0; i < 6; i++) {
    const y = 0.991 + i * 0.0065;
    add(recGeo, vinyl, 0, y, 0.31);
    add(recLbl, lbls[i], 0, y, 0.31);
  }
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.11, 6), chrome, 0, 1.03, 0.31);
  add(new THREE.SphereGeometry(0.007, 6, 4), chrome, 0, 1.085, 0.31);

  // tonearm
  const px = 0.19, pz = 0.29, hx = 0.05, hz = 0.345, ay = 1.04;
  add(new THREE.CylinderGeometry(0.022, 0.026, 0.03, 10), chrome, px, 0.988, pz);
  add(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 6), chrome, px, 1.02, pz);
  const dx = hx - px, dz = hz - pz, len = Math.hypot(dx, dz);
  add(new THREE.BoxGeometry(len, 0.008, 0.012), chrome, (px + hx) / 2, ay, (pz + hz) / 2, 0, Math.atan2(-dz, dx), 0);
  add(new THREE.BoxGeometry(0.03, 0.012, 0.022), gold, hx, ay - 0.002, hz, 0, Math.atan2(-dz, dx), 0);
  add(new THREE.SphereGeometry(0.012, 8, 6), chrome, px, ay, pz);

  // ---------- selector panel ----------
  const sel = new THREE.Group();
  sel.position.set(0, 0.885, 0.285);
  sel.rotation.x = -0.35;
  root.add(sel);
  add(new THREE.BoxGeometry(0.56, 0.13, 0.05), chrome, 0, 0, 0, 0, 0, 0, sel);
  add(new THREE.PlaneGeometry(0.52, 0.064), titleMat, 0, 0.026, 0.0255, 0, 0, 0, sel);
  add(new THREE.BoxGeometry(0.54, 0.006, 0.008), gold, 0, -0.012, 0.027, 0, 0, 0, sel);
  const btnGeo = new THREE.BoxGeometry(0.032, 0.026, 0.024);
  for (let i = 0; i < 10; i++) {
    const m = i === 9 ? labelRed : ivory;
    add(btnGeo, m, -0.225 + i * 0.05, -0.038, 0.03, 0, 0, 0, sel);
  }

  // ---------- speaker grille ----------
  add(new THREE.ExtrudeGeometry(roundRect(0.52, 0.56, 0.07), { depth: 0.016, bevelEnabled: false, curveSegments: 4 }), chrome, 0, 0.52, 0.255);
  const gGeo = new THREE.ShapeGeometry(roundRect(0.48, 0.52, 0.055), 4);
  normUV(gGeo);
  add(gGeo, grilleMat, 0, 0.52, 0.2715);
  for (let i = 0; i < 7; i++)
    add(new THREE.CylinderGeometry(0.0055, 0.0055, 0.5, 6), chrome, -0.18 + i * 0.06, 0.52, 0.28);
  add(new THREE.CylinderGeometry(0.0055, 0.0055, 0.46, 6), chrome, 0, 0.3, 0.282, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.0055, 0.0055, 0.46, 6), chrome, 0, 0.74, 0.282, 0, 0, Math.PI / 2);
  // medallion
  add(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 20), gold, 0, 0.52, 0.288, Math.PI / 2);
  add(new THREE.TorusGeometry(0.077, 0.009, 6, 24), chrome, 0, 0.52, 0.292);
  const star = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.02 : 0.05;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  star.closePath();
  add(new THREE.ExtrudeGeometry(star, { depth: 0.008, bevelEnabled: false }), redTube, 0, 0.52, 0.293);

  // ---------- kickplate ----------
  for (const y of [0.13, 0.16, 0.19])
    add(new THREE.CylinderGeometry(0.008, 0.008, 0.56, 8), chrome, 0, y, 0.255, 0, 0, Math.PI / 2);

  // ---------- side glow strips ----------
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.006, 0.74, 0.08), chrome, sx * 0.437, 0.6, 0.16);
    add(new THREE.BoxGeometry(0.008, 0.7, 0.05), teal, sx * 0.44, 0.6, 0.16);
    for (let k = 0; k < 6; k++)
      add(new THREE.BoxGeometry(0.01, 0.008, 0.054), chrome, sx * 0.441, 0.3 + k * 0.12, 0.16);
    add(new THREE.BoxGeometry(0.006, 0.02, 0.4), chrome, sx * 0.437, 0.22, -0.03);
  }

  // coin entry plate (right side of the cabinet, +X)
  add(new THREE.BoxGeometry(0.008, 0.14, 0.15), chrome, 0.439, 1.0, -0.04);
  for (let k = 0; k < 3; k++)
    add(new THREE.BoxGeometry(0.004, 0.04, 0.007), slot, 0.444, 1.025, -0.085 + k * 0.045);
  add(new THREE.SphereGeometry(0.012, 8, 6), labelRed, 0.444, 0.965, -0.04);
  add(new THREE.BoxGeometry(0.004, 0.012, 0.11), gold, 0.444, 0.99, -0.04);

  return root;
}
```