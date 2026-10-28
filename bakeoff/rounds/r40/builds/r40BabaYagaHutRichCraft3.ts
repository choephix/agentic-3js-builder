import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  limb,
  paint,
  mix,
  noise,
  smoothstep,
  scales,
  stripes,
  grain,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A folk-art log izba perched on two huge scaly chicken legs: carved and painted window frames, shuttered glowing windows, a sun-rayed gable with a round window, red-and-teal scalloped shingles, a rooster finial, a porch with a hanging ladder and lantern, and a brick chimney with smoke.",
};

// ---------------------------------------------------------------- palette
const RED = "#c8261e";
const DRED = "#8e1a16";
const TEAL = "#1f8a8a";
const GOLD = "#f0b82a";
const CREAM = "#f6e8c4";
const GREEN = "#3f8f3f";
const WOODL = "#a8693a";
const INKB = "#2a170c";
const CLAW = "#3b2410";
const IRON = "#2b2b33";
const SMOKE = "#ece6dc";

// ---------------------------------------------------------------- dimensions
const Y0 = 2.2; // floor level
const W = 3.0; // wall centre-line spacing (x)
const D = 3.4; // wall centre-line spacing (z)
const PITCH = 0.26;
const RL = 0.14; // log radius
const NC = 7; // log courses
const WT = Y0 + 2.0; // wall top
const RISE = 1.35;
const EX = 2.05; // eave half width
const EY = WT - 0.45; // eave height
const RY = WT + RISE; // ridge height
const SL = Math.hypot(EX, RY - EY); // roof slope length
const ROOF_Z = 4.3; // roof length along z
const SURF = W / 2 + RL; // outer wall surface x

// ---------------------------------------------------------------- paints
const logPaint = (ax: "x" | "z") =>
  paint((p, n) => {
    const cap = ax === "x" ? Math.abs(n.x) > 0.75 : Math.abs(n.z) > 0.75;
    if (cap) {
      const rr = noise(p, 0.06, 5);
      return mix("#e6bd7e", "#b9814a", smoothstep(0.3, 0.7, rr));
    }
    const q = ax === "x" ? new THREE.Vector3(p.x * 0.15, p.y, p.z) : new THREE.Vector3(p.x, p.y, p.z * 0.15);
    let c = mix("#a8693a", "#7c4624", smoothstep(0.3, 0.75, noise(q, 0.12, 2)));
    c = mix(c, "#4e2c14", 0.5 * smoothstep(0.2, -0.8, n.y));
    c = mix(c, "#5f8f3a", 0.55 * smoothstep(0.7, 1, n.y) * smoothstep(0.45, 0.7, noise(p, 0.25, 9)));
    return c;
  });
const LOGX = logPaint("x");
const LOGZ = logPaint("z");
const DECK = grain("#7a4a26", "#5a3418", { size: 0.05, axis: "z" });
const PORCH = grain("#b57a42", "#8d5a30", { size: 0.04, axis: "x" });
const PLANKV = grain("#9a6232", "#7a4a26", { size: 0.05, axis: "y" });
const RIDGE = stripes(RED, GOLD, { size: 0.32, axis: "z", width: 0.22, wobble: 0.1 });
const BRICK = scales(["#b4503a", "#a24632", "#c0604a"], "#43241c", { size: 0.13, width: 0.14 });
const PANTS = scales([RED, "#d4412a", "#a81f18"], DRED, { size: 0.11, width: 0.1 });
const SCALE = scales(["#e8a92c", "#d9961f", "#f0b83a"], "#7a4a10", { size: 0.07, width: 0.14 });
const BARGE = paint((_p, _n, s) => (s[1] > -0.02 ? GOLD : s[1] > -0.12 ? RED : TEAL));

const SC = 0.75; // rooster scale
const ROOSTER = paint((_p, _n, s) => {
  const u = s[0] / SC;
  const v = s[1] / SC;
  if (v > 1.0 && u > 0.1) return RED;
  if (u > 0.48 && v < 0.95 && v > 0.8) return "#e87a1c";
  if (u > 0.4 && v < 0.75 && v > 0.55) return RED;
  if (u < -0.2) {
    const a = Math.atan2(v - 0.3, u + 0.2);
    const k = ((Math.floor((a + Math.PI) * 2.2) % 3) + 3) % 3;
    return [TEAL, RED, GOLD][k];
  }
  const e = ((u + 0.02) / 0.22) ** 2 + ((v - 0.27) / 0.13) ** 2;
  if (e < 0.7) return TEAL;
  if (e < 1.0) return CREAM;
  return GOLD;
});

// ---------------------------------------------------------------- textures
const tulip = (x: number, y: number, s: number, c: string) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V-14" stroke="${GREEN}" stroke-width="2"/><path d="M0 -8Q-9 -8 -10 -16Q-3 -14 0 -8Z" fill="${GREEN}"/><path d="M0 -12C-9 -14 -9 -26 0 -32C9 -26 9 -14 0 -12Z" fill="${c}" stroke="${INKB}" stroke-width="1"/><path d="M0 -12C-3 -18 -3 -26 0 -32C3 -26 3 -18 0 -12Z" fill="${GOLD}"/></g>`;

const gableTex = () => {
  const planks = Array.from(
    { length: 28 },
    (_, i) =>
      `<rect x="${i * 11}" y="0" width="11" height="135" fill="${i % 2 ? "#1d7a82" : "#186b72"}"/><path d="M${i * 11} 0V135" stroke="#0b3c42" stroke-width="1.2"/>`,
  ).join("");
  const cx = 154;
  const cy = 95;
  const rays = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const d = 0.1;
    const r0 = 33;
    const r1 = i % 2 ? 78 : 100;
    const pts = `${cx + r0 * Math.cos(a - d)},${cy + r0 * Math.sin(a - d)} ${cx + r1 * Math.cos(a)},${cy + r1 * Math.sin(a)} ${cx + r0 * Math.cos(a + d)},${cy + r0 * Math.sin(a + d)}`;
    return `<polygon points="${pts}" fill="${i % 2 ? RED : GOLD}" stroke="${INKB}" stroke-width="1.2" stroke-linejoin="round"/>`;
  }).join("");
  return svg(
    `<svg viewBox="0 0 308 135"><defs><clipPath id="t"><polygon points="0,135 308,135 154,0"/></clipPath></defs>
    <g clip-path="url(#t)">${planks}${rays}
    <circle cx="${cx}" cy="${cy}" r="34" fill="${RED}" stroke="${GOLD}" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="28" fill="${INKB}"/>
    <polygon points="0,135 308,135 154,0" fill="none" stroke="${RED}" stroke-width="12"/>
    <polygon points="0,135 308,135 154,0" fill="none" stroke="${GOLD}" stroke-width="3" stroke-dasharray="0.1 9" stroke-linecap="round"/>
    ${tulip(40, 122, 0.9, RED)}${tulip(268, 122, 0.9, RED)}${tulip(70, 122, 0.7, CREAM)}${tulip(238, 122, 0.7, CREAM)}
    </g></svg>`,
    { size: 1024 },
  );
};

const doorTex = () => {
  const planks = Array.from(
    { length: 6 },
    (_, i) =>
      `<rect x="${i * 15}" y="0" width="15" height="140" fill="${i % 2 ? "#8a5226" : "#76441f"}"/><path d="M${i * 15} 0V140" stroke="#3a2010" stroke-width="1.6"/>`,
  ).join("");
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = i * 45;
    return `<ellipse cx="45" cy="52" rx="6.5" ry="12" fill="${RED}" stroke="${INKB}" stroke-width="1" transform="rotate(${a} 45 70)"/><ellipse cx="45" cy="50" rx="2.6" ry="6" fill="${GOLD}" transform="rotate(${a} 45 70)"/>`;
  }).join("");
  const strap = (y: number) =>
    `<rect x="0" y="${y}" width="90" height="9" fill="${IRON}"/><circle cx="8" cy="${y + 4.5}" r="6" fill="${IRON}"/><circle cx="8" cy="${y + 4.5}" r="2.2" fill="${CREAM}"/><circle cx="30" cy="${y + 4.5}" r="1.6" fill="${CREAM}"/><circle cx="60" cy="${y + 4.5}" r="1.6" fill="${CREAM}"/><circle cx="84" cy="${y + 4.5}" r="1.6" fill="${CREAM}"/>`;
  return svg(
    `<svg viewBox="0 0 90 140"><rect width="90" height="140" fill="#7b4620"/>${planks}
    <rect x="5" y="5" width="80" height="130" rx="3" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-dasharray="1 5" stroke-linecap="round"/>
    ${strap(20)}${strap(110)}
    <circle cx="45" cy="70" r="27" fill="${TEAL}" stroke="${CREAM}" stroke-width="2.5"/>${petals}
    <circle cx="45" cy="70" r="8" fill="${GOLD}" stroke="${INKB}" stroke-width="1.2"/><circle cx="45" cy="70" r="3.5" fill="${RED}"/>
    <path d="M18 98Q28 88 38 98" stroke="${GREEN}" stroke-width="3" fill="none"/><path d="M72 98Q62 88 52 98" stroke="${GREEN}" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 512 },
  );
};

const windowTex = svg(
  `<svg viewBox="0 0 70 96"><defs><radialGradient id="g" cx="0.5" cy="0.6" r="0.7"><stop offset="0" stop-color="#fff2a8"/><stop offset="1" stop-color="#ffb02e"/></radialGradient></defs>
  <rect width="70" height="96" fill="#3a2410"/><rect x="4" y="4" width="62" height="88" rx="2" fill="url(#g)"/>
  <path d="M35 4V92M4 48H66" stroke="#3a2410" stroke-width="4"/>
  <path d="M4 4H22Q13 26 20 48H4Z" fill="#d9362a"/><path d="M66 4H48Q57 26 50 48H66Z" fill="#d9362a"/>
  <path d="M4 48H66" stroke="#3a2410" stroke-width="4"/>
  <path d="M12 92Q16 76 20 92Z M22 92 L25 82 L30 92Z" fill="#3a2410"/></svg>`,
  { size: 256 },
);

const roundWinTex = svg(
  `<svg viewBox="0 0 100 100"><defs><radialGradient id="g" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#fff2a8"/><stop offset="1" stop-color="#ffa91f"/></radialGradient></defs>
  <circle cx="50" cy="50" r="49" fill="url(#g)"/><path d="M50 2V98M2 50H98" stroke="#3a2410" stroke-width="7"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#3a2410" stroke-width="6"/></svg>`,
  { size: 192 },
);

const shutterTex = svg(
  `<svg viewBox="0 0 28 86"><rect width="28" height="86" fill="${TEAL}"/><rect x="2" y="2" width="24" height="82" fill="none" stroke="${GOLD}" stroke-width="2"/>
  <path d="M14 82V46" stroke="${GREEN}" stroke-width="2"/><path d="M14 70Q6 68 5 60Q12 62 14 70Z M14 62Q22 60 23 52Q16 54 14 62Z" fill="${GREEN}"/>
  <path d="M14 46C6 42 6 30 14 24C22 30 22 42 14 46Z" fill="${RED}" stroke="${INKB}" stroke-width="1"/><path d="M14 46C11 40 11 30 14 24C17 30 17 40 14 46Z" fill="${CREAM}"/>
  <circle cx="14" cy="12" r="3" fill="${CREAM}"/><circle cx="7" cy="12" r="1.6" fill="${GOLD}"/><circle cx="21" cy="12" r="1.6" fill="${GOLD}"/></svg>`,
  { size: 256 },
);

const borderTex = (cols: number) => {
  let body = `<rect x="0" y="0" width="${cols * 16}" height="10" fill="${DRED}"/><rect x="0" y="10" width="${cols * 16}" height="3" fill="${GOLD}"/>`;
  for (let i = 0; i < cols; i++) {
    const x = i * 16;
    body += `<path d="M${x} 13H${x + 16}V15A8 9 0 0 1 ${x} 15Z" fill="${i % 2 ? TEAL : RED}" stroke="${INKB}" stroke-width="1.2"/>`;
    body += `<circle cx="${x + 8}" cy="16" r="2.2" fill="${CREAM}"/>`;
    body += `<path d="M${x + 8} 2L${x + 11} 5L${x + 8} 8L${x + 5} 5Z" fill="${CREAM}"/>`;
  }
  return svg(`<svg viewBox="0 0 ${cols * 16} 24">${body}</svg>`, { size: 1024 });
};

const shingleTex = (offset: boolean, fill: string, edge: string) => {
  let body = "";
  for (let i = 0; i < 21; i++) {
    const x = i * 22 - (offset ? 11 : 0);
    body += `<path d="M${x} 0H${x + 22}V30A11 20 0 0 1 ${x} 30Z" fill="${fill}" stroke="${edge}" stroke-width="1.6" stroke-linejoin="round"/>`;
    body += `<circle cx="${x + 11}" cy="37" r="2" fill="${CREAM}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 440 50"><rect width="440" height="14" fill="#0b2f33" opacity="0.0"/>${body}</svg>`,
    { size: 1024 },
  );
};

const featherTex = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8e1a16"/><stop offset="0.55" stop-color="#d6381f"/><stop offset="1" stop-color="#f0b82a"/></linearGradient></defs>
  <path d="M16 64C6 52 0 34 7 17Q16 0 25 17C32 34 26 52 16 64Z" fill="url(#f)" stroke="#5a1210" stroke-width="2"/>
  <path d="M16 62V10" stroke="${CREAM}" stroke-width="2"/>
  <path d="M16 50L8 40M16 40L7 30M16 30L9 21M16 50L24 40M16 40L25 30M16 30L23 21" stroke="#7a1812" stroke-width="1.5" fill="none"/></svg>`,
  { size: 192 },
);

const flowerTex = svg(
  `<svg viewBox="0 0 40 50"><path d="M20 50V22" stroke="${GREEN}" stroke-width="3"/><path d="M20 42Q8 38 6 28Q16 30 20 42Z M20 38Q32 34 34 24Q24 26 20 38Z" fill="${GREEN}"/>
  ${[0, 72, 144, 216, 288]
    .map((a) => `<circle cx="20" cy="8" r="6.5" fill="${a % 144 ? RED : "#ff7a5c"}" stroke="${INKB}" stroke-width="1" transform="rotate(${a} 20 16)"/>`)
    .join("")}
  <circle cx="20" cy="16" r="5" fill="${GOLD}" stroke="${INKB}" stroke-width="1"/></svg>`,
  { size: 128 },
);

const BORDER_S = borderTex(20);
const SHA = shingleTex(false, "#1f7f86", "#0b3c42");
const SHB = shingleTex(true, "#c8261e", "#5a1210");

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "baba_yaga_hut", paintSize: 2048 });
  const hut = b.joint("hut", { at: [0, Y0, 0], role: "spine" });
  const R = rng(11);

  const P = (geo: THREE.BufferGeometry, color: any, o: any = {}) => b.part(geo, color, { bone: hut, ...o });
  const X = (outline: any, at: number[], lat: number[], th: number, color: any, o: any = {}) =>
    b.extrude(outline, { at, x: lat, y: [0, 1, 0], thickness: th, color, bone: hut, ...o });
  const dot = (at: any, r = 0.03, color: any = GOLD) => P(new THREE.SphereGeometry(r, 6, 4), color, { at });
  const disc = (at: number[], dir: number[], r: number, h: number, color: any) =>
    P(new THREE.CylinderGeometry(r, r, h, 8), color, { at, dir });
  const cyl = (r: number, len: number, sides = 8) => new THREE.CylinderGeometry(r, r, len, sides, 1);

  // ---------------------------------------------------------- platform and walls
  P(new THREE.BoxGeometry(3.7, 0.22, 4.3), DECK, { at: [0, Y0 - 0.11, 0] });
  for (const s of [1, -1]) {
    P(cyl(0.2, 4.7), LOGZ, { at: [s * 0.9, Y0 - 0.4, 0], dir: [0, 0, 1], flat: true });
    P(cyl(0.1, 3.7), LOGX, { at: [0, Y0 - 0.3, s * 1.7], dir: [1, 0, 0], flat: true });
  }
  P(new THREE.BoxGeometry(2.9, 2.0, 3.2), INKB, { at: [0, Y0 + 1.0, 0] }); // dark interior

  for (let i = 0; i < NC; i++) {
    const yz = Y0 + RL + i * PITCH;
    const yx = Y0 + RL + PITCH / 2 + i * PITCH;
    for (const s of [1, -1]) P(cyl(RL, D + 0.6), LOGZ, { at: [s * W / 2, yz, 0], dir: [0, 0, 1], flat: true });
    P(cyl(RL, W + 0.6), LOGX, { at: [0, yx, -D / 2], dir: [1, 0, 0], flat: true });
    if (yx + RL <= Y0 + 1.46) {
      for (const s of [1, -1]) P(cyl(RL, 1.35), LOGX, { at: [s * 1.125, yx, D / 2], dir: [1, 0, 0], flat: true });
    } else {
      P(cyl(RL, W + 0.6), LOGX, { at: [0, yx, D / 2], dir: [1, 0, 0], flat: true });
    }
  }

  // ---------------------------------------------------------- gables
  const gable = [
    [-1.72, -0.12],
    [1.72, -0.12],
    [0, RISE + 0.02],
  ];
  const gTex = gableTex();
  for (const s of [1, -1]) {
    b.extrude(gable as any, { at: [0, WT, s * D / 2], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.14, color: PLANKV, bone: hut });
    P(new THREE.PlaneGeometry(3.08, RISE), "#ffffff", {
      at: [0, WT + RISE / 2, s * 1.776],
      dir: [0, 0, s],
      axis: "z",
      texture: gTex,
    });
    glow(
      P(new THREE.CircleGeometry(0.26, 16), "#ffffff", {
        at: [0, WT + 0.4, s * 1.786],
        dir: [0, 0, s],
        axis: "z",
        texture: roundWinTex,
      }),
      1.2,
    );
  }

  // ---------------------------------------------------------- roof
  for (const s of [1, -1]) {
    const tU = new THREE.Vector3((-s * EX) / SL, (RY - EY) / SL, 0);
    const nU = new THREE.Vector3((s * (RY - EY)) / SL, EX / SL, 0);
    const E = new THREE.Vector3(s * EX, EY, 0);
    P(new THREE.BoxGeometry(SL + 0.1, 0.1, ROOF_Z), DECK, {
      at: E.clone().addScaledVector(tU, SL / 2 + 0.05).addScaledVector(nU, -0.05),
      dir: tU,
      axis: "x",
    });
    for (let r = 0; r < 10; r++) {
      const bd = -0.04 + r * 0.24;
      P(new THREE.PlaneGeometry(ROOF_Z, 0.5), "#ffffff", {
        at: E.clone().addScaledVector(tU, bd + 0.25).addScaledVector(nU, 0.06 + r * 0.009),
        dir: nU,
        axis: "z",
        texture: r % 2 ? SHB : SHA,
      });
    }
    // bargeboards (carved eave boards) front and back
    const n = 9;
    const w = SL / n;
    const out: any[] = [
      [0, 0.17],
      [SL, 0.17],
    ];
    const depth = 0.3;
    for (let k = n - 1; k >= 0; k--) {
      const x0 = k * w;
      out.push(
        [x0 + w * 0.95, -0.07],
        [x0 + w * 0.8, -depth * 0.62],
        [x0 + w * 0.5, -depth],
        [x0 + w * 0.2, -depth * 0.62],
        [x0 + w * 0.05, -0.07],
      );
    }
    for (const zf of [1, -1]) {
      const bd = b.extrude(out, {
        at: [s * EX, EY, zf * 2.19],
        x: tU,
        y: nU,
        thickness: 0.05,
        bevel: 0.01,
        color: BARGE,
        bone: hut,
      });
      const zs = -s * zf;
      for (let k = 0; k < n; k++) dot(bd.local([k * w + w * 0.5, -depth * 0.5, zs * 0.03]), 0.028, CREAM);
    }
  }
  P(cyl(0.19, 4.55, 8), RIDGE, { at: [0, RY + 0.08, 0], dir: [0, 0, 1], flat: true });
  for (const zf of [1, -1]) disc([0, RY + 0.08, zf * 2.29], [0, 0, zf], 0.12, 0.05, GOLD);

  // rooster finial
  const roo: any[] = [
    [-0.28, 0],
    [-0.55, 0.22],
    [-0.78, 0.58],
    [-0.56, 0.52],
    [-0.66, 0.9],
    [-0.42, 0.68],
    [-0.4, 1.0],
    [-0.22, 0.7],
    [-0.1, 0.52],
    [0.02, 0.62],
    [0.1, 0.85],
    [0.14, 0.98],
    [0.12, 1.1],
    [0.2, 1.04],
    [0.24, 1.2],
    [0.31, 1.06],
    [0.37, 1.16],
    [0.4, 1.0],
    [0.5, 0.98],
    [0.7, 0.88],
    [0.5, 0.84],
    [0.44, 0.72],
    [0.46, 0.6],
    [0.36, 0.66],
    [0.4, 0.42],
    [0.34, 0.2],
    [0.24, 0.0],
  ].map(([u, v]) => [u * SC, v * SC]);
  const rooster = b.extrude(roo, {
    at: [0, RY + 0.22, 1.9],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.1,
    bevel: 0.012,
    color: ROOSTER,
    bone: hut,
  });
  for (const zs of [1, -1]) {
    dot(rooster.local([0.36 * SC, 0.92 * SC, zs * 0.05]), 0.024, INKB);
    disc(rooster.local([0.36 * SC, 0.92 * SC, zs * 0.052]).toArray(), [-zs, 0, 0], 0.012, 0.01, CREAM);
  }

  // ---------------------------------------------------------- chimney and smoke
  P(new THREE.BoxGeometry(0.5, 1.4, 0.5), BRICK, { at: [0.95, WT + 1.1, -0.9], flat: true });
  P(new THREE.BoxGeometry(0.64, 0.1, 0.64), DECK, { at: [0.95, WT + 1.85, -0.9] });
  P(new THREE.CylinderGeometry(0.17, 0.2, 0.2, 8), "#a24632", { at: [0.95, WT + 1.98, -0.9] });
  [
    [0.95, WT + 2.25, -0.9, 0.15],
    [0.8, WT + 2.6, -0.95, 0.2],
    [0.6, WT + 3.0, -1.0, 0.25],
    [0.35, WT + 3.45, -1.08, 0.3],
  ].forEach(([x, y, z, r]) => P(new THREE.SphereGeometry(r, 7, 5), SMOKE, { at: [x, y, z], flat: true }));

  // ---------------------------------------------------------- side friezes and windows
  for (const s of [1, -1]) {
    P(new THREE.PlaneGeometry(3.0, 0.22), "#ffffff", {
      at: [s * (SURF + 0.015), Y0 + 1.88, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: BORDER_S,
    });
  }
  const winPane = new THREE.PlaneGeometry(0.6, 0.823);
  const shutterG = new THREE.PlaneGeometry(0.28, 0.86);
  const lintel: any[] = [
    [-0.46, 0.41],
    [0.46, 0.41],
    [0.46, 0.54],
    [0.3, 0.56],
    [0.2, 0.7],
    [0, 0.86, "sharp"],
    [-0.2, 0.7],
    [-0.3, 0.56],
    [-0.46, 0.54],
  ];
  const sill: any[] = [
    [-0.5, -0.55],
    [0.5, -0.55],
    [0.5, -0.43],
    [-0.5, -0.43],
  ];
  const windowAt = (s: number, zc: number) => {
    const wy = Y0 + 0.92;
    const wx = s * SURF;
    const lat = [0, 0, 1];
    glow(P(winPane, "#ffffff", { at: [wx + s * 0.015, wy, zc], dir: [s, 0, 0], axis: "z", texture: windowTex }), 1.1);
    for (const g of [1, -1]) {
      P(shutterG, "#ffffff", { at: [wx + s * 0.015, wy, zc + g * 0.6], dir: [s, 0, 0], axis: "z", texture: shutterTex });
      const u1 = g * 0.3;
      const u2 = g * 0.44;
      X([[u1, -0.43], [u2, -0.43], [u2, 0.45], [u1, 0.45]], [wx + s * 0.06, wy, zc], lat, 0.08, CREAM);
      for (let k = 0; k < 3; k++) dot([wx + s * 0.11, wy - 0.3 + k * 0.3, zc + g * 0.37], 0.026, RED);
    }
    X(lintel, [wx + s * 0.09, wy, zc], lat, 0.1, RED, { bevel: 0.01 });
    X(sill, [wx + s * 0.08, wy, zc], lat, 0.14, CREAM, { bevel: 0.01 });
    disc([wx + s * 0.15, wy + 0.66, zc], [s, 0, 0], 0.07, 0.03, GOLD);
    disc([wx + s * 0.165, wy + 0.66, zc], [s, 0, 0], 0.035, 0.03, TEAL);
    P(new THREE.BoxGeometry(0.2, 0.14, 0.8), DRED, { at: [wx + s * 0.12, wy - 0.68, zc] });
    P(new THREE.BoxGeometry(0.205, 0.04, 0.8), GOLD, { at: [wx + s * 0.12, wy - 0.62, zc] });
    const fr = [-2, -1, 0, 1, 2].map((k) => frame([wx + s * 0.12, wy - 0.6, zc + k * 0.16], [0, 1, 0]));
    b.cards(fr, flowerTex, { size: [0.17, 0.26], flow: [s, 0, 0], cross: true, vary: 0.2, rng: R, bone: hut });
  };
  for (const s of [1, -1]) for (const zc of [-0.85, 0.85]) windowAt(s, zc);

  // ---------------------------------------------------------- door
  const hinge = b.joint("doorHinge", { parent: hut, at: [-0.45, Y0 + 0.7, 1.72], dir: [0, 1, 0], role: "hinge" });
  P(new THREE.BoxGeometry(0.9, 1.4, 0.08), PLANKV, { bone: hinge, at: [0, Y0 + 0.7, 1.72] });
  P(new THREE.PlaneGeometry(0.9, 1.4), "#ffffff", {
    bone: hinge,
    at: [0, Y0 + 0.7, 1.762],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTex(),
  });
  P(new THREE.TorusGeometry(0.05, 0.013, 5, 10), GOLD, { bone: hinge, at: [0.27, Y0 + 0.62, 1.8], dir: [0, 0, 1], axis: "z" });
  P(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), GOLD, { bone: hinge, at: [0.27, Y0 + 0.68, 1.775], dir: [0, 0, 1] });
  const doorArch: any[] = [
    [-0.64, 1.45],
    [0.64, 1.45],
    [0.64, 1.58],
    [0.42, 1.6],
    [0.28, 1.78],
    [0, 2.02, "sharp"],
    [-0.28, 1.78],
    [-0.42, 1.6],
    [-0.64, 1.58],
  ];
  for (const g of [1, -1]) {
    const u1 = g * 0.45;
    const u2 = g * 0.6;
    X([[u1, 0], [u2, 0], [u2, 1.45], [u1, 1.45]], [0, Y0, 1.87], [1, 0, 0], 0.1, CREAM, { bevel: 0.01 });
    for (let k = 0; k < 4; k++) dot([g * 0.525, Y0 + 0.25 + k * 0.33, 1.93], 0.03, RED);
  }
  X(doorArch, [0, Y0, 1.88], [1, 0, 0], 0.12, RED, { bevel: 0.012 });
  disc([0, Y0 + 1.66, 1.95], [0, 0, 1], 0.1, 0.03, GOLD);
  disc([0, Y0 + 1.66, 1.965], [0, 0, 1], 0.05, 0.03, TEAL);

  // ---------------------------------------------------------- porch and ladder
  P(new THREE.BoxGeometry(1.7, 0.12, 1.0), PORCH, { at: [0, Y0 - 0.06, 2.34] });
  P(new THREE.BoxGeometry(1.74, 0.05, 0.05), RED, { at: [0, Y0 + 0.01, 2.85] });
  const post: any[] = [
    [0, 0],
    [0.09, 0],
    [0.09, 0.08],
    [0.05, 0.14],
    [0.06, 0.4],
    [0.1, 0.5],
    [0.05, 0.58],
    [0.05, 0.85],
    [0.09, 0.9],
    [0.07, 0.95],
    [0, 0.95],
  ];
  for (const s of [1, -1]) {
    b.lathe(post, { at: [s * 0.78, Y0, 2.78], axis: [0, 1, 0], segments: 8, color: RED, bone: hut });
    P(new THREE.BoxGeometry(0.07, 0.07, 0.95), CREAM, { at: [s * 0.78, Y0 + 0.88, 2.34] });
    for (let k = 0; k < 4; k++) P(cyl(0.025, 0.78, 6), CREAM, { at: [s * 0.78, Y0 + 0.44, 1.95 + k * 0.25] });
    // ladder rails
    b.rod([s * 0.45, Y0 - 0.02, 2.84], [s * 0.45, 0.03, 3.95], 0.045, WOODL, { bone: hut });
  }
  for (let k = 1; k <= 7; k++) {
    const t = k / 8;
    P(cyl(0.03, 0.9, 6), "#c98a4a", { at: [0, Y0 - 0.02 + (0.03 - (Y0 - 0.02)) * t, 2.84 + 1.11 * t], dir: [1, 0, 0] });
  }
  // lantern
  b.rod([0.78, Y0 + 0.95, 2.78], [0.78, Y0 + 1.75, 2.78], 0.02, IRON, { bone: hut });
  b.rod([0.78, Y0 + 1.75, 2.78], [1.12, Y0 + 1.75, 2.78], 0.018, IRON, { bone: hut });
  b.rod([1.12, Y0 + 1.75, 2.78], [1.12, Y0 + 1.56, 2.78], 0.012, IRON, { bone: hut });
  glow(P(new THREE.CylinderGeometry(0.1, 0.1, 0.24, 8), "#ffc24a", { at: [1.12, Y0 + 1.4, 2.78] }), 1.4);
  P(new THREE.ConeGeometry(0.14, 0.14, 8), RED, { at: [1.12, Y0 + 1.59, 2.78] });
  P(new THREE.CylinderGeometry(0.09, 0.08, 0.04, 8), IRON, { at: [1.12, Y0 + 1.26, 2.78] });

  // ---------------------------------------------------------- chicken legs
  const L1 = 0.7;
  const L2 = 0.95;
  const L3 = 0.75;
  const tK = L1 / (L1 + L2 + L3);
  const tH = (L1 + L2) / (L1 + L2 + L3);
  const toeSpec: [number, number][] = [
    [-34, 0.7],
    [0, 0.78],
    [34, 0.7],
    [180, 0.42],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = [s * 0.9, Y0 - 0.35, -0.1];
    const footP = [s * 0.9, 0.17, 0.5];
    const pts = limb(hipP, footP, [L1, L2, L3], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hut,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.9, 0, 0.7],
    });
    const pantsR = (t: number) =>
      t < tK ? 0.34 - 0.08 * (t / tK) : 0.26 - 0.1 * ((t - tK) / (tH - tK));
    const pants = b.sweep(leg, pantsR, { color: PANTS, to: tH, smooth: false, sides: 8 });
    b.sweep(leg, [0.11, 0.08], { color: SCALE, from: tH - 0.01, to: 1, smooth: false, sides: 8 });
    const hp = leg.at(tH + 0.04);
    b.spike(hp, [0, 0.35, -1], 0.32, 0.055, { color: CLAW });
    // feathers over the thigh and drumstick
    const hits = b.surface(pants).scatter(34, { rng: R, minDist: 0.14, filter: (h: any) => h.n.y > -0.5 });
    b.cards(hits, featherTex, {
      size: [0.2, 0.34],
      lean: 70,
      bend: 25,
      flow: [0, -1, 0.15],
      vary: 0.25,
      spin: 20,
      rng: R,
    });
    // toes
    const foot = new THREE.Vector3(...footP);
    const footJoint = leg.joints[leg.joints.length - 1];
    toeSpec.forEach(([deg, len], k) => {
      const a = (deg * Math.PI) / 180;
      const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const p0 = foot.clone();
      const p1 = foot.clone().addScaledVector(dir, len * 0.5);
      p1.y = 0.08;
      const p2 = foot.clone().addScaledVector(dir, len);
      p2.y = 0.068;
      const tc = b.chain(`toe${side}${k + 1}`, [p0, p1, p2], {
        parent: footJoint,
        names: [`toe${side}${k + 1}a`, `toe${side}${k + 1}b`],
        role: "digit",
      });
      b.sweep(tc, [0.085, 0.068], { color: SCALE, sides: 6, smooth: false });
      const tip = tc.at(1);
      b.spike(tip, [dir.x, -0.15, dir.z], k === 3 ? 0.18 : 0.24, 0.058, { color: CLAW });
    });
  }

  return b.root;
}
