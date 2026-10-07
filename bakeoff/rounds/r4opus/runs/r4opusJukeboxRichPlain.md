```ts
import * as THREE from "three";

export const meta = {
  name: "Starliner 1950s Diner Jukebox",
  description:
    "A walnut and chrome 1950s diner jukebox with a tall arch of glowing red, amber and teal tubes. A domed porthole window shows a record rack, a turntable stack, a tonearm and the picker arm. Below it sit a tilted panel of title cards, two rows of chrome selector keys, a coin entry plate, and a burgundy speaker grille with a chrome starburst.",
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
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
  draw: (c: CanvasRenderingContext2D, w: number, h: number) => void
) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export default function build(): THREE.Object3D {
  const r = rng(1955);
  const PI = Math.PI;
  const root = new THREE.Group();

  // ---------- environment for chrome / glass ----------
  const env = canvasTex(512, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.3, "#c9d8e8");
    g.addColorStop(0.48, "#a08070");
    g.addColorStop(0.56, "#3a2a2a");
    g.addColorStop(1, "#120c0e");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#ffffff";
    c.fillRect(40, 45, 70, 40);
    c.fillRect(200, 35, 110, 50);
    c.fillRect(380, 55, 80, 35);
    c.fillStyle = "#ff4646";
    c.fillRect(130, 80, 10, 70);
    c.fillStyle = "#30e0d0";
    c.fillRect(330, 85, 10, 60);
    c.fillStyle = "#ffb030";
    c.fillRect(470, 80, 10, 70);
  });
  env.mapping = THREE.EquirectangularReflectionMapping;

  // ---------- textures ----------
  const woodTex = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = "#6e3a1c";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 150; i++) {
      const x0 = r() * w;
      c.strokeStyle =
        r() < 0.5
          ? `rgba(40,16,6,${0.15 + r() * 0.3})`
          : `rgba(170,95,45,${0.1 + r() * 0.25})`;
      c.lineWidth = 1 + r() * 3;
      const amp = 4 + r() * 10,
        f = 0.008 + r() * 0.02,
        ph = r() * 6;
      c.beginPath();
      for (let y = 0; y <= h; y += 8) {
        const x = x0 + Math.sin(y * f + ph) * amp;
        if (y === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
    }
  });
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
  woodTex.repeat.set(1.4, 1.4);

  const fabricTex = canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = "#5a1420";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 4) {
      c.fillStyle = "rgba(0,0,0,0.25)";
      c.fillRect(i, 0, 1, h);
      c.fillStyle = "rgba(255,120,120,0.08)";
      c.fillRect(0, i + 2, w, 1);
    }
    c.strokeStyle = "rgba(255,200,150,0.07)";
    for (let i = -h; i < w; i += 16) {
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i + h, h);
      c.stroke();
    }
  });
  fabricTex.wrapS = fabricTex.wrapT = THREE.RepeatWrapping;
  fabricTex.repeat.set(4, 3);

  const backdropTex = canvasTex(256, 256, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    g.addColorStop(0, "#fff4c8");
    g.addColorStop(0.4, "#ffae3a");
    g.addColorStop(0.82, "#c2321e");
    g.addColorStop(1, "#4a0e12");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,255,255,0.10)";
    for (let i = 0; i < 24; i += 2) {
      const a0 = (i / 24) * PI * 2,
        a1 = ((i + 1) / 24) * PI * 2;
      c.beginPath();
      c.moveTo(w / 2, h / 2);
      c.arc(w / 2, h / 2, w, a0, a1);
      c.closePath();
      c.fill();
    }
  });

  const titles = [
    ["MOONLIGHT HOP", "The Starliners"],
    ["CHERRY SODA", "Dot & the Dashes"],
    ["ROCKET RIDE", "Ricky Vale"],
    ["JITTERBUG JIVE", "The Hi-Fis"],
    ["MILKSHAKE MAMA", "Lulu Bell"],
    ["NEON NIGHTS", "The Comets Five"],
    ["SOCK HOP SWING", "Buddy Crane"],
    ["HOT ROD HEART", "The Pistons"],
    ["STARDUST SLOW", "Peggy Lane"],
    ["JUKEBOX BABY", "The Chromatones"],
  ];
  const stripe = ["#d8342c", "#e8a020", "#1aa89c"];
  const cardTex = canvasTex(1024, 216, (c, w, h) => {
    c.fillStyle = "#1a1012";
    c.fillRect(0, 0, w, h);
    const cw = w / 5,
      ch = h / 2;
    for (let i = 0; i < 10; i++) {
      const col = i % 5,
        row = Math.floor(i / 5);
      const x = col * cw + 5,
        y = row * ch + 5,
        ww = cw - 10,
        hh = ch - 10;
      c.fillStyle = "#f6ecd2";
      c.fillRect(x, y, ww, hh);
      c.fillStyle = stripe[i % 3];
      c.fillRect(x, y, ww, 22);
      c.fillRect(x, y + hh - 6, ww, 6);
      c.fillStyle = "#ffffff";
      c.font = "bold 16px sans-serif";
      c.textAlign = "left";
      c.fillText("ABCDEFGHJK"[i] + (1 + (i % 9)), x + 8, y + 17);
      c.fillStyle = "#2a1a14";
      c.textAlign = "center";
      c.font = "bold 20px sans-serif";
      c.fillText(titles[i][0], x + ww / 2, y + 52);
      c.font = "italic 15px serif";
      c.fillStyle = "#7a2a20";
      c.fillText(titles[i][1], x + ww / 2, y + 76);
    }
  });

  const keyTex = canvasTex(512, 96, (c, w, h) => {
    c.fillStyle = "#141216";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#f3e6c8";
    c.fillRect(0, 39, w, 18);
    c.fillStyle = "#d4a23a";
    c.fillRect(0, 3, w, 2);
    c.fillRect(0, h - 5, w, 2);
    c.fillStyle = "#c0281e";
    c.font = "bold 14px sans-serif";
    c.textAlign = "center";
    const L = "ABCDEFGHJK";
    for (let i = 0; i < 10; i++) {
      const x = -0.225 + i * 0.05;
      c.fillText(L[i] + " " + ((i + 1) % 10), ((x + 0.28) / 0.56) * w, 53);
    }
  });

  const nameTex = canvasTex(512, 96, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#a3141c");
    g.addColorStop(1, "#5a0a10");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#e8c070";
    c.lineWidth = 4;
    c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = "#fbefd0";
    c.font = "italic bold 58px serif";
    c.textAlign = "center";
    c.fillText("Starliner", w / 2, 68);
  });

  // ---------- materials ----------
  const chrome = new THREE.MeshStandardMaterial({ color: 0xeef1f5, metalness: 0.9, roughness: 0.16, envMap: env, envMapIntensity: 1.3 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe0aa3e, metalness: 0.9, roughness: 0.25, envMap: env, envMapIntensity: 1.1 });
  const wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.45, envMap: env, envMapIntensity: 0.35 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf3e6c8, roughness: 0.5 });
  const channel = new THREE.MeshStandardMaterial({ color: 0x2a1418, roughness: 0.6 });
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.4, envMap: env, envMapIntensity: 0.4 });
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
  const keyBack = new THREE.MeshStandardMaterial({ map: keyTex, roughness: 0.5 });
  const cards = new THREE.MeshStandardMaterial({ map: cardTex, roughness: 0.6, emissive: 0xffffff, emissiveMap: cardTex, emissiveIntensity: 0.25 });
  const fabric = new THREE.MeshStandardMaterial({ map: fabricTex, roughness: 0.95 });
  const nameMat = new THREE.MeshStandardMaterial({ map: nameTex, roughness: 0.35 });
  const backdrop = new THREE.MeshStandardMaterial({ map: backdropTex, emissive: 0xffffff, emissiveMap: backdropTex, emissiveIntensity: 0.7 });
  const sleeve = new THREE.MeshStandardMaterial({ color: 0xf7d9a0, emissive: 0x6a3a10, emissiveIntensity: 0.6, roughness: 0.6, side: THREE.DoubleSide });
  const vinyl = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.28, envMap: env, envMapIntensity: 0.8 });
  const labels = [0xd8342c, 0xf2c230, 0x2f6fd0, 0xf3f0e6].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })
  );
  const glass = new THREE.MeshStandardMaterial({ color: 0xd8ecff, transparent: true, opacity: 0.2, roughness: 0.04, metalness: 0.1, envMap: env, envMapIntensity: 1.6, depthWrite: false });
  const streak = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6, transparent: true, opacity: 0.55, depthWrite: false });
  const glow = (c: number) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.4, roughness: 0.3 });
  const halo = (c: number) =>
    new THREE.MeshStandardMaterial({ color: 0x000000, emissive: c, emissiveIntensity: 1, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false });
  const glowRed = glow(0xff3424), glowAmber = glow(0xffa21a), glowTeal = glow(0x22e0cc);
  const haloRed = halo(0xff3020), haloAmber = halo(0xff9a10), haloTeal = halo(0x10d8c8);
  const redBtn = new THREE.MeshStandardMaterial({ color: 0xd8241c, roughness: 0.3, emissive: 0x500000 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const beam = (a: THREE.Vector3, b: THREE.Vector3, rad: number, mat: THREE.Material, seg = 6) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = add(new THREE.CylinderGeometry(rad, rad, len, seg), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return m;
  };

  // ---------- cabinet ----------
  const W = 0.43, YB = 0.08, YC = 1.1, WIN_Y = 1.12, WIN_R = 0.22;
  const shape = new THREE.Shape();
  shape.moveTo(-W, YB);
  shape.lineTo(W, YB);
  shape.lineTo(W, YC);
  shape.absarc(0, YC, W, 0, PI, false);
  shape.lineTo(-W, YB);
  const hole = new THREE.Path();
  hole.absarc(0, WIN_Y, WIN_R, 0, PI * 2, false);
  shape.holes.push(hole);
  const cabGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.52, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1, curveSegments: 18 });
  cabGeo.translate(0, 0, -0.26);
  add(cabGeo, wood);
  const FZ = 0.275; // front face

  // plinth
  add(new THREE.BoxGeometry(0.92, 0.08, 0.6), plinthMat, 0, 0.04, 0);
  add(new THREE.BoxGeometry(0.92, 0.012, 0.006), chrome, 0, 0.074, 0.301);
  add(new THREE.BoxGeometry(0.92, 0.012, 0.006), chrome, 0, 0.008, 0.301);
  add(new THREE.BoxGeometry(0.236, 0.056, 0.004), chrome, 0, 0.04, 0.3);
  add(new THREE.PlaneGeometry(0.22, 0.042), nameMat, 0, 0.04, 0.3025);

  // tube channel band
  const ro = 0.425, ri = 0.3, yb = 0.1;
  const band = new THREE.Shape();
  band.moveTo(-ro, yb);
  band.lineTo(-ro, YC);
  band.absarc(0, YC, ro, PI, 0, true);
  band.lineTo(ro, yb);
  band.lineTo(ri, yb);
  band.lineTo(ri, YC);
  band.absarc(0, YC, ri, 0, PI, false);
  band.lineTo(-ri, yb);
  const bandGeo = new THREE.ExtrudeGeometry(band, { depth: 0.012, bevelEnabled: false, curveSegments: 24 });
  add(bandGeo, channel, 0, 0, FZ - 0.002);

  // chrome arch trims
  const archTrim = (rad: number, tr: number, z: number, y0: number) => {
    add(new THREE.TorusGeometry(rad, tr, 5, 30, PI), chrome, 0, YC, z);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(tr, tr, YC - y0, 5), chrome, s * rad, (YC + y0) / 2, z);
  };
  archTrim(0.432, 0.01, 0.282, 0.085);
  archTrim(0.298, 0.008, 0.29, 0.1);
  archTrim(0.432, 0.01, -0.282, 0.085);

  // glowing tubes
  const sleeveGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.04, 8);
  const tubes = [
    { rad: 0.404, m: glowRed, h: haloRed },
    { rad: 0.362, m: glowAmber, h: haloAmber },
    { rad: 0.32, m: glowTeal, h: haloTeal },
  ];
  const TZ = 0.299, TB = 0.13;
  for (const t of tubes) {
    add(new THREE.TorusGeometry(t.rad, 0.014, 6, 30, PI), t.m, 0, YC, TZ);
    add(new THREE.TorusGeometry(t.rad, 0.026, 6, 30, PI), t.h, 0, YC, TZ);
    for (const s of [-1, 1]) {
      add(new THREE.CylinderGeometry(0.014, 0.014, YC - TB, 6), t.m, s * t.rad, (YC + TB) / 2, TZ);
      add(new THREE.CylinderGeometry(0.026, 0.026, YC - TB, 6), t.h, s * t.rad, (YC + TB) / 2, TZ);
      add(sleeveGeo, chrome, s * t.rad, TB, TZ);
    }
  }
  add(new THREE.BoxGeometry(0.88, 0.016, 0.02), chrome, 0, 0.09, 0.288);

  // ---------- window & record mechanism ----------
  add(new THREE.CircleGeometry(0.23, 28), backdrop, 0, WIN_Y, -0.12);
  const backCap = add(new THREE.CircleGeometry(0.23, 28), wood, 0, WIN_Y, -0.277);
  backCap.rotation.y = PI;
  const sl = add(new THREE.CylinderGeometry(0.204, 0.204, 0.4, 28, 1, true), sleeve, 0, WIN_Y, 0.077);
  sl.rotation.x = PI / 2;

  // turntable & horizontal stack
  const TTZ = 0.09;
  add(new THREE.CylinderGeometry(0.06, 0.066, 0.05, 16), chrome, 0, 0.938, TTZ);
  add(new THREE.CylinderGeometry(0.092, 0.092, 0.008, 24), chrome, 0, 0.962, TTZ);
  const recGeo = new THREE.CylinderGeometry(0.089, 0.089, 0.003, 22);
  const labGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.0036, 12);
  for (let i = 0; i < 10; i++) {
    const y = 0.9675 + i * 0.0052;
    add(recGeo, vinyl, 0, y, TTZ);
    add(labGeo, labels[i % 4], 0, y, TTZ);
  }
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.094, 6), chrome, 0, 1.013, TTZ);
  add(new THREE.SphereGeometry(0.008, 8, 6), chrome, 0, 1.06, TTZ);

  // vertical record rack (carousel)
  const vRec = new THREE.CylinderGeometry(0.075, 0.075, 0.003, 18);
  const vLab = new THREE.CylinderGeometry(0.026, 0.026, 0.0036, 10);
  for (let i = -5; i <= 5; i++) {
    const x = i * 0.027, y = 1.19, z = -0.035 - Math.abs(i) * 0.004;
    const a = add(vRec, vinyl, x, y, z);
    a.rotation.set(0, i * 0.07, PI / 2);
    const b = add(vLab, labels[(i + 5) % 4], x, y, z);
    b.rotation.set(0, i * 0.07, PI / 2);
  }
  for (const z of [-0.07, 0.0]) {
    const rod = add(new THREE.CylinderGeometry(0.005, 0.005, 0.32, 6), chrome, 0, 1.12, z);
    rod.rotation.z = PI / 2;
  }

  // picker arm (right)
  add(new THREE.CylinderGeometry(0.028, 0.028, 0.012, 12), gold, 0.16, 0.996, 0.1);
  add(new THREE.CylinderGeometry(0.009, 0.009, 0.09, 6), chrome, 0.16, 1.035, 0.1);
  add(new THREE.SphereGeometry(0.014, 8, 6), chrome, 0.16, 1.078, 0.1);
  add(new THREE.BoxGeometry(0.11, 0.012, 0.014), chrome, 0.105, 1.074, 0.1);
  add(new THREE.BoxGeometry(0.016, 0.022, 0.03), gold, 0.048, 1.062, 0.1);
  for (const dz of [-0.012, 0.012]) add(new THREE.BoxGeometry(0.006, 0.026, 0.005), chrome, 0.048, 1.04, 0.1 + dz);

  // tonearm (left)
  add(new THREE.CylinderGeometry(0.016, 0.02, 0.014, 10), gold, -0.155, 0.998, 0.12);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.045, 6), chrome, -0.155, 1.015, 0.12);
  beam(new THREE.Vector3(-0.175, 1.037, 0.13), new THREE.Vector3(-0.06, 1.03, 0.07), 0.0045, chrome);
  add(new THREE.BoxGeometry(0.024, 0.01, 0.028), chrome, -0.058, 1.026, 0.068);
  const cw = add(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 10), chrome, -0.175, 1.037, 0.132);
  cw.rotation.z = PI / 2;

  // dome glass, bezel, highlight
  const domeGeo = new THREE.SphereGeometry(1, 22, 8, 0, PI * 2, 0, PI / 2);
  domeGeo.rotateX(PI / 2);
  const dome = add(domeGeo, glass, 0, WIN_Y, FZ);
  dome.scale.set(0.212, 0.212, 0.1);
  add(new THREE.TorusGeometry(0.215, 0.02, 6, 30), chrome, 0, WIN_Y, 0.284);
  add(new THREE.TorusGeometry(0.246, 0.005, 4, 30), gold, 0, WIN_Y, 0.279);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * PI * 2;
    add(new THREE.SphereGeometry(0.006, 6, 4), chrome, Math.cos(a) * 0.235, WIN_Y + Math.sin(a) * 0.235, 0.296);
  }
  const st = add(new THREE.TorusGeometry(0.165, 0.004, 4, 10, 0.8), streak, 0, WIN_Y, FZ + 0.066);
  st.rotation.z = 1.85;
  const st2 = add(new THREE.TorusGeometry(0.135, 0.003, 4, 8, 0.45), streak, 0, WIN_Y, FZ + 0.078);
  st2.rotation.z = 2.0;

  // ---------- title-card console ----------
  const con = new THREE.Group();
  con.position.set(0, 0.795, FZ);
  con.rotation.x = -0.3;
  root.add(con);
  add(new THREE.BoxGeometry(0.56, 0.13, 0.07), cream, 0, 0, 0.03, con);
  add(new THREE.PlaneGeometry(0.5, 0.105), cards, 0, 0, 0.0655, con);
  add(new THREE.BoxGeometry(0.58, 0.012, 0.012), chrome, 0, 0.059, 0.066, con);
  add(new THREE.BoxGeometry(0.58, 0.012, 0.012), chrome, 0, -0.059, 0.066, con);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.012, 0.13, 0.012), chrome, s * 0.256, 0, 0.066, con);
  add(new THREE.BoxGeometry(0.004, 0.105, 0.006), chrome, 0, 0, 0.067, con);
  add(new THREE.BoxGeometry(0.59, 0.012, 0.09), chrome, 0, 0.069, 0.035, con);

  // ---------- selector keys ----------
  const keys = new THREE.Group();
  keys.position.set(0, 0.665, FZ);
  keys.rotation.x = -0.15;
  root.add(keys);
  add(new THREE.BoxGeometry(0.56, 0.105, 0.03), plinthMat, 0, 0, 0.015, keys);
  add(new THREE.PlaneGeometry(0.56, 0.105), keyBack, 0, 0, 0.0305, keys);
  add(new THREE.BoxGeometry(0.575, 0.01, 0.036), chrome, 0, 0.056, 0.016, keys);
  add(new THREE.BoxGeometry(0.575, 0.01, 0.036), chrome, 0, -0.056, 0.016, keys);
  const keyGeo = new THREE.BoxGeometry(0.038, 0.03, 0.022);
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 10; i++) {
      const k = add(keyGeo, chrome, -0.225 + i * 0.05, row === 0 ? 0.026 : -0.026, 0.038, keys);
      k.rotation.x = row === 0 ? 0.08 : -0.08;
    }
  const rb = add(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 10), redBtn, 0.262, 0, 0.036, keys);
  rb.rotation.x = PI / 2;
  const tb = add(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 10), glowTeal, -0.262, 0, 0.036, keys);
  tb.rotation.x = PI / 2;

  // ---------- coin entry ----------
  const CY = 0.56;
  add(new THREE.BoxGeometry(0.27, 0.055, 0.014), chrome, 0, CY, 0.282);
  for (let i = -1; i <= 1; i++) {
    add(new THREE.BoxGeometry(0.044, 0.02, 0.006), gold, i * 0.06, CY, 0.291);
    add(new THREE.BoxGeometry(0.03, 0.006, 0.004), slotMat, i * 0.06, CY, 0.295);
  }
  const rej = add(new THREE.CylinderGeometry(0.011, 0.011, 0.014, 10), redBtn, 0.11, CY, 0.293);
  rej.rotation.x = PI / 2;
  add(new THREE.BoxGeometry(0.036, 0.028, 0.006), slotMat, -0.11, CY - 0.004, 0.29);
  add(new THREE.BoxGeometry(0.044, 0.006, 0.012), chrome, -0.11, CY - 0.019, 0.293);

  // ---------- speaker grille with starburst ----------
  const GY = 0.31;
  add(new THREE.PlaneGeometry(0.52, 0.38), fabric, 0, GY, 0.2765);
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.556, 0.018, 0.02), chrome, 0, GY + s * 0.199, 0.282);
    add(new THREE.BoxGeometry(0.018, 0.416, 0.02), chrome, s * 0.269, GY, 0.282);
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) add(new THREE.SphereGeometry(0.013, 8, 6), gold, sx * 0.269, GY + sy * 0.199, 0.292);
  const dots = [glowRed, glowAmber, glowTeal];
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * PI * 2;
    const ex = 1 / Math.sqrt((Math.cos(a) / 0.23) ** 2 + (Math.sin(a) / 0.165) ** 2);
    const f = i % 2 === 0 ? 0.95 : i % 4 === 1 ? 0.64 : 0.45;
    const L = f * ex - 0.05;
    const d = 0.05 + L / 2;
    const ray = add(new THREE.BoxGeometry(i % 2 === 0 ? 0.008 : 0.005, L, 0.006), chrome, Math.cos(a) * d, GY + Math.sin(a) * d, 0.283);
    ray.rotation.z = a - PI / 2;
    if (i % 2 === 0) {
      const t = 0.05 + L + 0.008;
      add(new THREE.SphereGeometry(0.009, 6, 4), dots[(i / 2) % 3], Math.cos(a) * t, GY + Math.sin(a) * t, 0.284);
    }
  }
  const med = add(new THREE.CylinderGeometry(0.04, 0.044, 0.018, 16), chrome, 0, GY, 0.285);
  med.rotation.x = PI / 2;
  add(new THREE.TorusGeometry(0.048, 0.005, 4, 20), gold, 0, GY, 0.288);
  const jewel = add(new THREE.SphereGeometry(0.022, 10, 6, 0, PI * 2, 0, PI / 2), redBtn, 0, GY, 0.293);
  jewel.rotation.x = PI / 2;

  // ---------- sides & back ----------
  for (const s of [-1, 1]) {
    for (const y of [0.26, 0.31, 0.36]) add(new THREE.BoxGeometry(0.006, 0.012, 0.44), chrome, s * 0.448, y, 0);
    const md = add(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 16), chrome, s * 0.449, 0.78, 0);
    md.rotation.z = PI / 2;
    const ring = add(new THREE.TorusGeometry(0.05, 0.005, 4, 18), gold, s * 0.452, 0.78, 0);
    ring.rotation.y = PI / 2;
    const gem = add(new THREE.SphereGeometry(0.02, 8, 6), dots[s > 0 ? 2 : 0], s * 0.455, 0.78, 0);
    gem.scale.set(0.6, 1, 1);
    for (const y of [0.58, 0.98]) add(new THREE.BoxGeometry(0.006, 0.01, 0.3), chrome, s * 0.448, y, 0);
  }
  for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.4, 0.012, 0.006), slotMat, 0, 0.3 + i * 0.04, -0.278);

  return root;
}
```