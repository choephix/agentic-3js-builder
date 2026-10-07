import * as THREE from "three";
import { createBuilder, polyline, paint, grain, mix, smoothstep, svg, rng } from "../../../../src/index";

export const meta = {
  name: "Golden-Age Jukebox",
  description:
    "A 1940s-style arched jukebox: walnut cabinet, glowing amber arch with teal bubble tubes, a record spinning behind a domed window, a lit song-title strip, ivory selector keys and a chrome speaker grille with a glowing music-note medallion.",
};

// Palette
const CHROME = "#dfe3ea";
const RED = "#e2321e";
const ORANGE = "#ff7a1a";
const AMBER = "#ffb42a";
const YELLOW = "#ffe28a";
const TEAL = "#37e0d0";
const BUBBLE = "#f2fbff";
const GLASS = "#cfeaff";
const IVORY = "#f3ead2";
const PLINTH = "#24140c";
const VINYL = "#141414";

function archOutline(rx: number, ry: number, cy: number, y0: number, n = 18): number[][] {
  const pts: number[][] = [
    [-rx, y0],
    [rx, y0],
    [rx, cy],
  ];
  for (let k = 1; k < n; k++) {
    const a = (k / n) * Math.PI;
    pts.push([rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  pts.push([-rx, cy]);
  return pts;
}

/** Legs up from y0, then an elliptical arch over the top, then down again; at depth z. */
function archPath(rx: number, ry: number, cy: number, y0: number, z: number, n = 20): number[][] {
  const pts: number[][] = [
    [-rx, y0, z],
    [-rx, cy, z],
  ];
  for (let k = 1; k < n; k++) {
    const a = Math.PI - (k / n) * Math.PI;
    pts.push([rx * Math.cos(a), cy + ry * Math.sin(a), z]);
  }
  pts.push([rx, cy, z], [rx, y0, z]);
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "jukebox", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });

  // ---------- materials ----------
  const glow = (c: string, k = 0.55) => {
    const m = b.material(c);
    m.emissive = new THREE.Color(c);
    m.emissiveIntensity = k;
    m.roughness = 0.35;
  };
  [RED, ORANGE, AMBER, YELLOW].forEach((c) => glow(c, 0.6));
  glow(TEAL, 0.5);
  const chrome = b.material(CHROME);
  chrome.metalness = 0.5;
  chrome.roughness = 0.22;
  const bub = b.material(BUBBLE);
  bub.emissive = new THREE.Color("#bff6ff");
  bub.emissiveIntensity = 0.4;
  bub.roughness = 0.1;
  const glass = b.material(GLASS);
  glass.transparent = true;
  glass.opacity = 0.16;
  glass.roughness = 0.05;
  glass.metalness = 0.1;
  glass.depthWrite = false;
  b.material(IVORY).roughness = 0.35;
  b.material(VINYL).roughness = 0.3;

  // ---------- paints ----------
  const wood = grain("#4a2312", "#82441f", { size: 0.012, axis: "y", seed: 3 });
  const burst = paint((p) => {
    const dx = p.x;
    const dy = p.y - 1.13;
    const a = Math.atan2(dy, dx);
    const d = Math.hypot(dx, dy);
    const ray = smoothstep(0.25, 0.6, Math.cos(a * 18));
    const base = mix("#0c102c", "#2a3576", smoothstep(0.42, 0.12, d));
    return mix(base, "#e2ad4a", ray * 0.4 * smoothstep(0.17, 0.4, d));
  });
  const fabric = paint((p) => {
    const w = 0.5 + 0.25 * Math.sin(p.x * 650) + 0.25 * Math.sin(p.y * 650);
    const vignette = smoothstep(0.38, 0.1, Math.hypot(p.x, (p.y - 0.38) * 1.2));
    return mix(mix("#2c0d09", "#5e2418", w * 0.8), "#7a3320", vignette * 0.35);
  });

  const R = { bone: "root" as const };
  const rod = (a: number[], c: number[], r: number, color: string = CHROME) =>
    b.rod(a, c, r, { color, ...R });

  // ---------- plinth & cabinet ----------
  b.part(new THREE.BoxGeometry(0.88, 0.06, 0.66), PLINTH, { at: [0, 0.03, 0], ...R });
  b.part(new THREE.BoxGeometry(0.86, 0.022, 0.012), CHROME, { at: [0, 0.032, 0.332], ...R });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.BoxGeometry(0.07, 0.012, 0.07), CHROME, { at: [sx * 0.39, 0.006, sz * 0.28], ...R });

  b.extrude(archOutline(0.42, 0.5, 1.05, 0.06), {
    color: wood,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.6,
    bevel: 0.02,
    ...R,
    name: "cabinet",
  });

  // Chrome trim riding the front bevel of the cabinet.
  b.sweep(polyline(archPath(0.414, 0.494, 1.05, 0.06, 0.294, 24)), {
    radius: 0.011,
    color: CHROME,
    caps: "flat",
    ...R,
    name: "trim",
  });

  // ---------- glowing arch band ----------
  const bandColor = (t: number) =>
    t < 0.12 ? RED : t < 0.24 ? ORANGE : t < 0.4 ? AMBER : t < 0.6 ? YELLOW : t < 0.76 ? AMBER : t < 0.88 ? ORANGE : RED;
  b.sweep(polyline(archPath(0.36, 0.44, 1.05, 0.1, 0.31)), {
    radius: () => [0.04, 0.03] as const,
    section: "box",
    up: [0, 0, 1],
    color: bandColor,
    caps: "flat",
    ...R,
    name: "arch",
  });
  for (const sx of [-1, 1])
    b.part(new THREE.BoxGeometry(0.095, 0.03, 0.075), CHROME, { at: [sx * 0.36, 0.1, 0.31], ...R });

  // Bubble tube with rising bubbles.
  const tubePath = polyline(archPath(0.36, 0.44, 1.05, 0.11, 0.345));
  b.sweep(tubePath, { radius: 0.016, color: TEAL, caps: "round", ...R, name: "bubbleTube" });
  const rand = rng(11);
  for (let i = 0; i < 70; i++) {
    const t = 0.01 + rand() * 0.98;
    const p = tubePath.at(t);
    const r = 0.004 + rand() * 0.004;
    b.part(new THREE.SphereGeometry(r, 8, 6), BUBBLE, {
      at: [p.x + (rand() - 0.5) * 0.012, p.y, p.z + 0.011],
      ...R,
    });
  }

  // ---------- record window ----------
  b.extrude(archOutline(0.33, 0.41, 1.05, 0.93), {
    color: burst,
    at: [0, 0, 0.305],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    ...R,
    name: "windowBack",
  });
  b.extrude(archOutline(0.322, 0.402, 1.05, 0.93), {
    color: GLASS,
    at: [0, 0, 0.336],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    ...R,
    name: "glass",
  });
  rod([-0.325, 0.93, 0.33], [0.325, 0.93, 0.33], 0.011);
  // Platter rim (static).
  b.part(new THREE.CylinderGeometry(0.185, 0.185, 0.008, 32), CHROME, { at: [0, 1.13, 0.312], dir: [0, 0, 1], ...R });

  // ---------- selector wedge with title strip ----------
  b.extrude(
    [
      [0.29, 0.72],
      [0.42, 0.72],
      [0.345, 0.915],
      [0.29, 0.915],
    ],
    { color: CHROME, at: [0, 0, 0], thickness: 0.62, bevel: 0.008, ...R, name: "selectorWedge" },
  );
  let cardsMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 170"><rect width="560" height="170" fill="#e9dcc0"/>`;
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 5; c++) {
      const x = 10 + c * 110;
      const y = 8 + r * 80;
      const top = (r + c) % 2 ? "#c8281e" : "#1f5fa8";
      cardsMarkup +=
        `<rect x="${x}" y="${y}" width="100" height="74" fill="#fffaf0" stroke="#b8a888" stroke-width="2"/>` +
        `<rect x="${x}" y="${y}" width="100" height="13" fill="${top}"/>` +
        `<rect x="${x + 10}" y="${y + 24}" width="${60 + ((c * 7 + r * 13) % 25)}" height="6" fill="#2a2a2a"/>` +
        `<rect x="${x + 10}" y="${y + 36}" width="${45 + ((c * 11) % 30)}" height="4" fill="#777"/>` +
        `<rect x="${x + 6}" y="${y + 47}" width="88" height="2" fill="${top}"/>` +
        `<rect x="${x + 10}" y="${y + 55}" width="${55 + ((c * 5 + r * 17) % 30)}" height="6" fill="#2a2a2a"/>` +
        `<rect x="${x + 10}" y="${y + 65}" width="${40 + ((c * 9 + r) % 28)}" height="4" fill="#777"/>`;
    }
  cardsMarkup += `</svg>`;
  const cardsTex = svg(cardsMarkup, { size: 1024 });
  const n = new THREE.Vector3(0, 0.075, 0.195).normalize();
  const strip = b.part(new THREE.PlaneGeometry(0.56, 0.17), "#ffffff", {
    at: [0, 0.8175 + n.y * 0.004, 0.3825 + n.z * 0.004],
    dir: [0, n.y, n.z],
    axis: "z",
    up: [0, 1, 0],
    texture: cardsTex,
    ...R,
    name: "titleStrip",
  });
  {
    const m = strip.mesh.material as THREE.MeshStandardMaterial;
    m.emissive = new THREE.Color("#ffffff");
    m.emissiveMap = cardsTex;
    m.emissiveIntensity = 0.35;
  }

  // Selector keys, rail, reject button, coin plate.
  for (let i = 0; i < 8; i++) {
    const x = -0.147 + i * 0.042;
    b.part(new THREE.BoxGeometry(0.032, 0.026, 0.03), IVORY, { at: [x, 0.678, 0.31], ...R });
    b.part(new THREE.BoxGeometry(0.02, 0.005, 0.002), i % 2 ? RED : "#1f5fa8", { at: [x, 0.683, 0.3255], ...R });
  }
  rod([-0.19, 0.655, 0.312], [0.19, 0.655, 0.312], 0.007);
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 16), RED, { at: [-0.25, 0.672, 0.31], dir: [0, 0, 1], ...R });
  b.part(new THREE.TorusGeometry(0.02, 0.005, 6, 16), CHROME, { at: [-0.25, 0.672, 0.32], ...R });
  const coinTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 50"><rect width="80" height="50" rx="7" fill="#d4d9e1"/><rect x="3" y="3" width="74" height="44" rx="5" fill="none" stroke="#8a919c" stroke-width="2"/><rect x="34" y="7" width="12" height="20" rx="2" fill="#1a1a1a"/><text x="40" y="43" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#b0201a" text-anchor="middle">25¢</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.BoxGeometry(0.076, 0.05, 0.012), CHROME, { at: [0.25, 0.672, 0.305], ...R });
  b.part(new THREE.PlaneGeometry(0.07, 0.044), "#ffffff", { at: [0.25, 0.672, 0.3115], texture: coinTex, ...R });

  // ---------- speaker section ----------
  b.extrude(
    [
      [-0.32, 0.12],
      [0.32, 0.12],
      [0.32, 0.64],
      [-0.32, 0.64],
    ],
    { color: fabric, at: [0, 0, 0.3], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, ...R, name: "grilleCloth" },
  );
  for (let i = 0; i <= 10; i++) {
    const x = -0.26 + i * 0.052;
    rod([x, 0.14, 0.311], [x, 0.62, 0.311], 0.0055);
  }
  rod([-0.32, 0.133, 0.313], [0.32, 0.133, 0.313], 0.009);
  rod([-0.32, 0.628, 0.313], [0.32, 0.628, 0.313], 0.009);

  // Glowing medallion.
  b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.012, 32), AMBER, { at: [0, 0.38, 0.318], dir: [0, 0, 1], ...R });
  let rays = "";
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const x1 = 100 + 98 * Math.cos(a - 0.08);
    const y1 = 100 + 98 * Math.sin(a - 0.08);
    const x2 = 100 + 98 * Math.cos(a + 0.08);
    const y2 = 100 + 98 * Math.sin(a + 0.08);
    rays += `<polygon points="100,100 ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="#ffd36a" opacity="0.6"/>`;
  }
  const medalTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="g"><stop offset="0" stop-color="#fff4c0"/><stop offset="0.6" stop-color="#ffb43a"/><stop offset="1" stop-color="#e2561a"/></radialGradient></defs><circle cx="100" cy="100" r="100" fill="url(#g)"/>${rays}<circle cx="100" cy="100" r="72" fill="none" stroke="#9a2412" stroke-width="3"/><ellipse cx="78" cy="132" rx="19" ry="13" transform="rotate(-20 78 132)" fill="#7a1410"/><ellipse cx="132" cy="120" rx="19" ry="13" transform="rotate(-20 132 120)" fill="#7a1410"/><rect x="90" y="62" width="7" height="70" fill="#7a1410"/><rect x="144" y="50" width="7" height="70" fill="#7a1410"/><polygon points="90,62 151,50 151,68 90,80" fill="#7a1410"/></svg>`,
    { size: 512 },
  );
  const medal = b.part(new THREE.CircleGeometry(0.13, 32), "#ffffff", {
    at: [0, 0.38, 0.3245],
    texture: medalTex,
    ...R,
    name: "medallion",
  });
  {
    const m = medal.mesh.material as THREE.MeshStandardMaterial;
    m.emissive = new THREE.Color("#ffffff");
    m.emissiveMap = medalTex;
    m.emissiveIntensity = 0.5;
  }
  b.part(new THREE.TorusGeometry(0.14, 0.014, 8, 32), CHROME, { at: [0, 0.38, 0.326], ...R });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(new THREE.SphereGeometry(0.01, 8, 6), CHROME, {
      at: [0.175 * Math.cos(a), 0.38 + 0.175 * Math.sin(a), 0.318],
      ...R,
    });
  }

  // ---------- sides & back ----------
  for (const sx of [-1, 1]) {
    for (const y of [0.3, 0.34, 0.38]) rod([sx * 0.423, y, -0.22], [sx * 0.423, y, 0.22], 0.006);
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 20), AMBER, {
      at: [sx * 0.423, 1.0, 0.02],
      dir: [sx, 0, 0],
      ...R,
    });
    b.part(new THREE.TorusGeometry(0.064, 0.01, 6, 24), CHROME, {
      at: [sx * 0.427, 1.0, 0.02],
      dir: [sx, 0, 0],
      axis: "z",
      ...R,
    });
  }
  for (let i = 0; i < 5; i++)
    b.part(new THREE.BoxGeometry(0.4, 0.016, 0.012), "#140a06", { at: [0, 0.42 + i * 0.05, -0.3], ...R });

  // ---------- turntable & tonearm (own joints, so the record can spin and the arm swing) ----------
  b.joint("turntable", { at: [0, 1.13, 0.318], dir: [0, 0, 1], parent: "root" });
  b.joint("tonearm", { at: [0.235, 1.27, 0.326], dir: [-0.165, -0.095, 0], parent: "root" });

  let grooves = "";
  for (let r = 38; r <= 96; r += 3.2)
    grooves += `<circle cx="100" cy="100" r="${r.toFixed(1)}" fill="none" stroke="#2c2c2c" stroke-width="1"/>`;
  const recordTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#111111"/>${grooves}<path d="M100,100 L190,60 A98,98 0 0 1 196,90 Z" fill="#ffffff" opacity="0.13"/><path d="M100,100 L10,140 A98,98 0 0 1 4,110 Z" fill="#ffffff" opacity="0.13"/><circle cx="100" cy="100" r="34" fill="#d8342c"/><circle cx="100" cy="100" r="30" fill="none" stroke="#f6e3b4" stroke-width="1.5"/><rect x="80" y="80" width="40" height="5" fill="#f6e3b4"/><rect x="85" y="112" width="30" height="4" fill="#f6e3b4"/><rect x="74" y="120" width="52" height="3" fill="#f6e3b4"/><circle cx="100" cy="100" r="3.5" fill="#cccccc"/></svg>`,
    { size: 512 },
  );
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.006, 32), VINYL, {
    at: [0, 1.13, 0.318],
    dir: [0, 0, 1],
    bone: "turntable",
  });
  b.part(new THREE.CircleGeometry(0.17, 48), "#ffffff", {
    at: [0, 1.13, 0.3215],
    texture: recordTex,
    bone: "turntable",
    name: "record",
  });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.016, 8), CHROME, {
    at: [0, 1.13, 0.326],
    dir: [0, 0, 1],
    bone: "turntable",
  });

  b.part(new THREE.CylinderGeometry(0.022, 0.026, 0.014, 16), CHROME, {
    at: [0.235, 1.27, 0.318],
    dir: [0, 0, 1],
    bone: "tonearm",
  });
  b.rod([0.235, 1.27, 0.327], [0.075, 1.178, 0.327], 0.0045, { color: CHROME, bone: "tonearm" });
  b.part(new THREE.BoxGeometry(0.018, 0.03, 0.008), "#2a2a2a", {
    at: [0.068, 1.172, 0.327],
    dir: [-0.165, -0.095, 0],
    bone: "tonearm",
  });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.01), CHROME, {
    at: [0.25, 1.28, 0.326],
    dir: [0.165, 0.095, 0],
    bone: "tonearm",
  });

  return b.root;
}
