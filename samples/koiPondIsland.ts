import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import type { PartOptions } from "../src/parts";

export const meta = {
  name: "Koi Pond Island",
  description:
    "A cute flat low-poly tabletop diorama: a round pond with lily pads, lotus and three chubby koi (one leaping), a red arched bridge, a stone lantern, a tea house with a curved roof and a cherry tree shedding petals.",
};

// ---------------------------------------------------------------- palette
const GRASS = "#b3ec8e";
const SOIL = "#d29a6a";
const SOIL_D = "#b0744b";
const WATER = "#72d8ea";
const STONE = "#d6d3e8";
const STONE_D = "#b4b0d0";
const RED = "#ff5f66";
const RED_D = "#e8444f";
const GOLD = "#ffd166";
const WOOD = "#eab27a";
const WOOD_D = "#c58552";
const CREAM = "#fff4de";
const BARK = "#a86f77";
const PINK = "#ffc4d8";
const PINK_D = "#ff9fc2";
const PINK_L = "#ffdfeb";
const INK = "#3b2a4d";
const LANTERN = "#ffd27a";
const BUSH = "#8adf78";
const BUSH_D = "#6ccd73";

// ---------------------------------------------------------------- drawings
const vb = (box: string, inner: string, size: number) =>
  svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}">${inner}</svg>`, { size });

function lilyPad(fill: string, vein: string, notch: number) {
  // notch: angle (deg) of the wedge cut, drawn at the top of the pad
  const r = 46;
  const a0 = ((-90 - 13) * Math.PI) / 180 + (notch * Math.PI) / 180;
  const a1 = ((-90 + 13) * Math.PI) / 180 + (notch * Math.PI) / 180;
  const p = (a: number) => `${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  let veins = "";
  for (let i = 0; i < 7; i++) {
    const a = a1 + ((i + 0.5) * (Math.PI * 2 - (a1 - a0))) / 7;
    veins += `<path d="M50 50 L${(50 + 38 * Math.cos(a)).toFixed(1)} ${(50 + 38 * Math.sin(a)).toFixed(1)}" stroke="${vein}" stroke-width="3.4" stroke-linecap="round"/>`;
  }
  return vb(
    "0 0 100 100",
    `<path d="M50 50 L${p(a0)} A${r} ${r} 0 1 0 ${p(a1)} Z" fill="${fill}"/>${veins}<circle cx="50" cy="50" r="4.5" fill="${vein}"/>`,
    256,
  );
}

const PAD_A = lilyPad("#7fdc7c", "#56bd6b", 0);
const PAD_B = lilyPad("#62cf93", "#3fae7d", 120);
const PAD_C = lilyPad("#a4e66f", "#72c95a", 230);

const LOTUS_PETAL = vb(
  "0 0 40 80",
  `<path d="M20 78 C2 60 -2 28 20 2 C42 28 42 60 20 78 Z" fill="#ff9ec6"/>
   <path d="M20 70 C10 54 9 34 20 14 C31 34 30 54 20 70 Z" fill="#ffc1dc"/>
   <path d="M20 2 C26 10 29 14 31 20 C26 18 22 14 20 2Z" fill="#ff7fb3"/>`,
  192,
);
const LOTUS_PETAL_W = vb(
  "0 0 40 80",
  `<path d="M20 78 C2 60 -2 28 20 2 C42 28 42 60 20 78 Z" fill="#ffe6f1"/>
   <path d="M20 70 C10 54 9 34 20 14 C31 34 30 54 20 70 Z" fill="#fff8fb"/>
   <path d="M20 2 C26 10 29 14 31 20 C26 18 22 14 20 2Z" fill="#ffb3d3"/>`,
  192,
);

function petalSvg(main: string, deep: string) {
  return vb(
    "0 0 40 50",
    `<path d="M20 48 C4 38 -2 18 8 4 C14 0 18 4 20 10 C22 4 26 0 32 4 C42 18 36 38 20 48 Z" fill="${main}"/>
     <path d="M20 44 C18 34 19 24 20 14" stroke="${deep}" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    128,
  );
}
const PETAL_A = petalSvg("#ffc4d8", "#ff95b8");
const PETAL_B = petalSvg("#ffe3ee", "#ffb3cd");
const PETAL_C = petalSvg("#ff9fc2", "#ff78a6");

const BLOSSOM = (() => {
  let petals = "";
  for (let i = 0; i < 5; i++) {
    petals += `<path transform="rotate(${i * 72} 50 50)" d="M50 50 C36 40 34 18 42 10 C46 8 49 12 50 16 C51 12 54 8 58 10 C66 18 64 40 50 50Z" fill="#ffb7d0"/>
      <path transform="rotate(${i * 72} 50 50)" d="M50 46 C48 38 49 30 50 22" stroke="#ff8db4" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  }
  let dots = "";
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 + 36) * (Math.PI / 180);
    dots += `<circle cx="${(50 + 11 * Math.cos(a)).toFixed(1)}" cy="${(50 + 11 * Math.sin(a)).toFixed(1)}" r="3.2" fill="#ffd166"/>`;
  }
  return vb("0 0 100 100", `${petals}<circle cx="50" cy="50" r="7" fill="#ff7fae"/>${dots}`, 160);
})();

const SPARKLE = vb(
  "0 0 40 40",
  `<path d="M20 1 C22 13 27 18 39 20 C27 22 22 27 20 39 C18 27 13 22 1 20 C13 18 18 13 20 1Z" fill="#ffffff"/>`,
  96,
);
const SPARKLE_Y = vb(
  "0 0 40 40",
  `<path d="M20 1 C22 13 27 18 39 20 C27 22 22 27 20 39 C18 27 13 22 1 20 C13 18 18 13 20 1Z" fill="#fff2a8"/>`,
  96,
);
const DROP = vb("0 0 24 36", `<path d="M12 2 C20 14 23 20 23 25 A11 11 0 0 1 1 25 C1 20 4 14 12 2Z" fill="#dff8ff"/><ellipse cx="8" cy="25" rx="2.6" ry="4" fill="#ffffff"/>`, 96);
const RING = vb(
  "0 0 100 100",
  `<ellipse cx="50" cy="50" rx="46" ry="46" fill="none" stroke="#e4fbff" stroke-width="4"/>
   <ellipse cx="50" cy="50" rx="30" ry="30" fill="none" stroke="#e4fbff" stroke-width="4" stroke-dasharray="30 12"/>`,
  256,
);

function waterDrawing() {
  let s = "";
  const r = rng(11);
  for (let i = 0; i < 16; i++) {
    const x = 14 + r() * 172;
    const y = 14 + r() * 172;
    const w = 7 + r() * 10;
    s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${(w / 2).toFixed(1)} -5 ${w.toFixed(1)} 0" fill="none" stroke="#c4f3fb" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  s += `<path d="M96 12 C98 20 102 24 110 26 C102 28 98 32 96 40 C94 32 90 28 82 26 C90 24 94 20 96 12Z" fill="#ffffff"/>`;
  s += `<path d="M160 150 C161 155 164 158 169 159 C164 160 161 163 160 168 C159 163 156 160 151 159 C156 158 159 155 160 150Z" fill="#ffffff"/>`;
  return vb("0 0 200 200", s, 512);
}
const WATER_TEX = waterDrawing();

function grassTuft(a: string, b: string) {
  return vb(
    "0 0 60 60",
    `<path d="M8 60 C8 42 6 26 2 12 C14 22 20 40 22 60Z" fill="${b}"/>
     <path d="M20 60 C22 36 26 16 30 2 C36 18 38 40 40 60Z" fill="${a}"/>
     <path d="M38 60 C40 44 46 28 58 14 C56 32 52 46 52 60Z" fill="${b}"/>`,
    128,
  );
}
const TUFT_A = grassTuft("#8fdc72", "#6cc763");
const TUFT_B = grassTuft("#b4ee86", "#86d66f");

function daisy(petal: string, centre: string) {
  let p = "";
  for (let i = 0; i < 6; i++)
    p += `<ellipse cx="50" cy="26" rx="10" ry="18" fill="${petal}" transform="rotate(${i * 60} 50 50)"/>`;
  return vb("0 0 100 100", `${p}<circle cx="50" cy="50" r="12" fill="${centre}"/>`, 96);
}
const DAISY_W = daisy("#ffffff", "#ffd166");
const DAISY_P = daisy("#ffb3d1", "#fff2a8");
const DAISY_Y = daisy("#ffe27a", "#ff9a5a");

// ---------------------------------------------------------------- roof geometry (hand-built hip roof)
function hipRoof(a: number, bz: number, H: number, lift: number, N: number, thick: number) {
  const plateau = 0.16;
  const heightAt = (u: number, v: number) => {
    const m = Math.max(Math.abs(u), Math.abs(v), plateau);
    return H * Math.pow((1 - m) / (1 - plateau), 1.75) + lift * Math.pow(Math.abs(u * v), 3);
  };
  const pos: number[] = [];
  const uvs: number[] = [];
  const vert = (i: number, j: number, drop: number) => {
    const u = -1 + (2 * i) / N;
    const v = -1 + (2 * j) / N;
    pos.push(u * a, heightAt(u, v) - drop, v * bz);
    uvs.push(u * 0.5 + 0.5, v * 0.5 + 0.5);
  };
  const tri = (p: Array<[number, number]>, drop: number, flip: boolean) => {
    const order = flip ? [0, 2, 1] : [0, 1, 2];
    for (const k of order) vert(p[k][0], p[k][1], drop);
  };
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const cu = -1 + (2 * (i + 0.5)) / N;
      const cv = -1 + (2 * (j + 0.5)) / N;
      const p00: [number, number] = [i, j];
      const p10: [number, number] = [i + 1, j];
      const p01: [number, number] = [i, j + 1];
      const p11: [number, number] = [i + 1, j + 1];
      const tris: Array<Array<[number, number]>> =
        cu * cv > 0
          ? [
              [p00, p01, p11],
              [p00, p11, p10],
            ]
          : [
              [p00, p01, p10],
              [p10, p01, p11],
            ];
      for (const t of tris) {
        tri(t, 0, false);
        tri(t, thick, true);
      }
    }
  // skirt around the rim
  const rim: Array<[[number, number], [number, number], number, number]> = [];
  for (let k = 0; k < N; k++) {
    rim.push([[k, 0], [k + 1, 0], 0, -1]);
    rim.push([[k, N], [k + 1, N], 0, 1]);
    rim.push([[0, k], [0, k + 1], -1, 0]);
    rim.push([[N, k], [N, k + 1], 1, 0]);
  }
  for (const [p, q, nx, nz] of rim) {
    const quad: Array<[[number, number], number]> = [
      [p, 0],
      [q, 0],
      [q, thick],
      [p, 0],
      [q, thick],
      [p, thick],
    ];
    // outward normal of first triangle, flip when it points inwards
    const pv = (x: [number, number], d: number) => {
      const u = -1 + (2 * x[0]) / N;
      const v = -1 + (2 * x[1]) / N;
      return new THREE.Vector3(u * a, heightAt(u, v) - d, v * bz);
    };
    const n = new THREE.Vector3()
      .subVectors(pv(quad[1][0], quad[1][1]), pv(quad[0][0], quad[0][1]))
      .cross(new THREE.Vector3().subVectors(pv(quad[2][0], quad[2][1]), pv(quad[0][0], quad[0][1])));
    const flip = n.x * nx + n.z * nz < 0;
    const seq = flip ? [0, 2, 1, 3, 5, 4] : [0, 1, 2, 3, 4, 5];
    for (const k of seq) {
      const [x, d] = quad[k];
      vert(x[0], x[1], d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.computeVertexNormals();
  return g;
}

function roofTexture() {
  const rows = 6;
  const cols = ["#a9a4ff", "#928dee"];
  let s = "";
  for (let k = 0; k < rows; k++) {
    const m0 = 1 - k / rows;
    const inset = 50 * (1 - m0);
    const size = 100 * m0;
    s += `<rect x="${inset.toFixed(2)}" y="${inset.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" fill="${cols[k % 2]}"/>`;
  }
  // tile ridges running down each slope
  let lines = "";
  const sp = 100 / 13;
  for (let k = 0; k < rows; k++) {
    const m0 = 1 - k / rows;
    const m1 = 1 - (k + 1) / rows;
    const lo = 50 * (1 - m0);
    const hi = 50 * (1 - m1);
    const off = k % 2 ? sp / 2 : 0;
    for (let x = lo + off + sp / 2; x < 100 - lo; x += sp) {
      if (x > hi && x < 100 - hi) {
        lines += `<path d="M${x.toFixed(1)} ${lo.toFixed(1)} L${x.toFixed(1)} ${hi.toFixed(1)} M${x.toFixed(1)} ${(100 - lo).toFixed(1)} L${x.toFixed(1)} ${(100 - hi).toFixed(1)}" stroke="#7470d6" stroke-width="0.9"/>`;
      }
      if (x > hi && x < 100 - hi) {
        lines += `<path d="M${lo.toFixed(1)} ${x.toFixed(1)} L${hi.toFixed(1)} ${x.toFixed(1)} M${(100 - lo).toFixed(1)} ${x.toFixed(1)} L${(100 - hi).toFixed(1)} ${x.toFixed(1)}" stroke="#7470d6" stroke-width="0.9"/>`;
      }
    }
  }
  // diagonal hips
  lines += `<path d="M0 0 L50 50 L100 0 M0 100 L50 50 L100 100" stroke="#6b67ca" stroke-width="1.6" fill="none"/>`;
  return vb("0 0 100 100", s + lines, 512);
}
const ROOF_TEX = roofTexture();

function shoji(round: boolean) {
  let g = `<rect width="100" height="100" fill="#fffaf0"/>`;
  g += `<rect x="3" y="3" width="94" height="94" fill="none" stroke="#d99a66" stroke-width="6"/>`;
  if (round) {
    g += `<circle cx="50" cy="48" r="30" fill="#fff3d6" stroke="#d99a66" stroke-width="5"/>`;
    g += `<path d="M50 18 V78 M20 48 H80 M29 27 L71 69 M71 27 L29 69" stroke="#d99a66" stroke-width="2.6"/>`;
  } else {
    for (let i = 1; i < 3; i++) g += `<path d="M${(i * 100) / 3} 3 V97" stroke="#d99a66" stroke-width="3"/>`;
    for (let j = 1; j < 5; j++) g += `<path d="M3 ${(j * 100) / 5} H97" stroke="#d99a66" stroke-width="3"/>`;
  }
  return vb("0 0 100 100", g, 256);
}
const SHOJI = shoji(false);
const SHOJI_ROUND = shoji(true);

const NOREN = vb(
  "0 0 80 60",
  `<path d="M2 0 H78 V52 L66 46 L54 52 L40 46 L26 52 L14 46 L2 52Z" fill="#ff8fa8"/>
   <path d="M27 0 V50 M53 0 V50" stroke="#ffe3ea" stroke-width="3"/>
   <path d="M40 14 C30 14 29 28 40 32 C51 28 50 14 40 14Z" fill="#fff4de"/>
   <path d="M33 10 q7 -6 14 0" stroke="#fff4de" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
  192,
);
const STEAM = vb(
  "0 0 30 60",
  `<path d="M15 58 C5 46 25 36 15 24 C10 18 12 10 16 2 C20 10 24 16 18 24 C8 36 28 46 15 58Z" fill="#ffffff"/>`,
  128,
);

const WINDOW_GLOW = vb(
  "0 0 100 100",
  `<rect x="6" y="6" width="88" height="88" rx="18" fill="${LANTERN}"/>
   <path d="M50 6 V94 M6 50 H94" stroke="#c98a3c" stroke-width="7"/>
   <rect x="6" y="6" width="88" height="88" rx="18" fill="none" stroke="#c98a3c" stroke-width="7"/>`,
  128,
);

const FACE_GLOW = vb(
  "0 0 100 100",
  `<rect x="6" y="6" width="88" height="88" rx="18" fill="${LANTERN}"/>
   <path d="M20 48 Q30 34 40 48 M60 48 Q70 34 80 48" stroke="#b9772e" stroke-width="7" fill="none" stroke-linecap="round"/>
   <path d="M40 64 Q50 78 60 64 Z" fill="#b9772e"/>
   <ellipse cx="17" cy="64" rx="8" ry="5.5" fill="#ff8f7a"/><ellipse cx="83" cy="64" rx="8" ry="5.5" fill="#ff8f7a"/>
   <rect x="6" y="6" width="88" height="88" rx="18" fill="none" stroke="#c98a3c" stroke-width="7"/>`,
  128,
);

const SIGN = vb(
  "0 0 100 100",
  `<circle cx="50" cy="50" r="46" fill="#fff4de"/>
   <circle cx="50" cy="50" r="46" fill="none" stroke="#d99a66" stroke-width="6"/>
   <path d="M26 52 H74 C74 74 64 82 50 82 C36 82 26 74 26 52Z" fill="#ff8fa8"/>
   <path d="M74 56 C86 54 88 70 72 72" stroke="#ff8fa8" stroke-width="6" fill="none" stroke-linecap="round"/>
   <path d="M40 44 C34 36 44 32 40 24 M56 44 C50 36 60 32 56 24" stroke="#c9b9a0" stroke-width="5" fill="none" stroke-linecap="round"/>
   <path d="M38 62 q4 4 8 0 M54 62 q4 4 8 0" stroke="#3b2a4d" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  192,
);

export default function build() {
  const b = createBuilder({ name: "koiPondIsland" });
  const root = b.joint("island", { at: [0, 0.05, 0] });
  const R = rng(2025);

  const put = (geo: THREE.BufferGeometry, color: string, o: PartOptions = {}) =>
    b.part(geo, color, { bone: root, flat: true, ...o });

  // ---------------------------------------------------------------- ground
  const GR = 0.1; // grass top
  const PZ = 0.05; // pond centre z
  const POND = 0.285;
  const WY = GR + 0.022; // water surface
  b.lathe(
    [
      [0, 0],
      [0.43, 0],
      [0.55, 0.045],
      [0.57, 0.07],
      [0, 0.07],
    ],
    { at: [0, 0, 0], segments: 10, spin: 18, color: SOIL, bone: root },
  );
  b.lathe(
    [
      [0, 0.06],
      [0.545, 0.06],
      [0.565, 0.082],
      [0.545, GR],
      [0, GR],
    ],
    { at: [0, 0, 0], segments: 10, spin: 18, color: GRASS, bone: root },
  );
  // soil studs under the turf lip
  for (let i = 0; i < 10; i++) {
    const a = ((i + 0.5) / 10) * Math.PI * 2 + 0.31;
    put(new THREE.IcosahedronGeometry(0.03 + R() * 0.012, 0), i % 2 ? SOIL_D : SOIL, {
      at: [Math.cos(a) * 0.5, 0.045, Math.sin(a) * 0.5],
      scale: [1, 0.7, 1],
    });
  }

  // ---------------------------------------------------------------- raised pond
  put(new THREE.CylinderGeometry(POND, POND, 0.03, 10, 1), WATER, { at: [0, WY - 0.015, PZ], rotation: [0, 18, 0] });
  put(new THREE.CircleGeometry(POND - 0.004, 10), "#ffffff", {
    at: [0, WY + 0.0015, PZ],
    rotation: [-90, 0, 0],
    texture: WATER_TEX,
  });
  b.lathe(
    [
      [POND - 0.012, 0],
      [POND + 0.04, 0],
      [POND + 0.04, 0.02],
      [POND + 0.026, 0.034],
      [POND - 0.012, 0.034],
    ],
    { at: [0, GR - 0.004, PZ], segments: 10, spin: 18, color: STONE, bone: root },
  );

  // bridge crosses the pond along X, in the back third
  const BZ = 0.345;
  const BC = PZ - 0.09;

  // rim stones on the pond edge
  for (let i = 0; i < 18; i++) {
    const deg = i * 20 + 6;
    const a = (deg * Math.PI) / 180;
    const r = POND + 0.014 + R() * 0.01;
    const sx = Math.sin(a) * r;
    const sz = PZ + Math.cos(a) * r;
    if (Math.abs(sz - BC) < 0.1 && Math.abs(sx) > 0.22) continue; // bridge feet
    if (sz < -0.22 && Math.abs(sx) < 0.17) continue; // tea house porch
    const s = 0.02 + R() * 0.012;
    put(new THREE.IcosahedronGeometry(s, 0), i % 3 === 0 ? STONE_D : STONE, {
      at: [sx, GR + 0.026, sz],
      scale: [1.15, 0.72, 1],
      rotation: [0, R() * 360, 0],
    });
  }

  // ---------------------------------------------------------------- bridge
  const deckY = (x: number) => GR + 0.04 + 0.08 * (1 - (x / BZ) ** 2);
  const deckPts: Array<[number, number, number]> = [];
  for (let i = 0; i <= 8; i++) {
    const x = -BZ + (2 * BZ * i) / 8;
    deckPts.push([x, deckY(x), BC]);
  }
  const deckPath = catmull(deckPts);
  b.sweep(deckPath, [0.06, 0.008], { section: "box", color: WOOD, bone: root, up: [0, 1, 0] });
  // red side fascias (arched plates)
  for (const s of [1, -1]) {
    const top: Array<[number, number]> = [];
    const bot: Array<[number, number]> = [];
    for (let i = 0; i <= 8; i++) {
      const x = -BZ + (2 * BZ * i) / 8;
      top.push([x, deckY(x) + 0.003]);
    }
    for (let i = 8; i >= 0; i--) {
      const x = -BZ + (2 * BZ * i) / 8;
      bot.push([x, deckY(x) - 0.022 - 0.036 * (1 - (x / BZ) ** 2)]);
    }
    b.extrude([...top, ...bot], {
      at: [0, 0, BC + s * 0.066],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      color: RED,
      bone: root,
    });
    // rail
    const railPts: Array<[number, number, number]> = [];
    for (let i = 0; i <= 8; i++) {
      const x = -BZ + (2 * BZ * i) / 8;
      railPts.push([x, deckY(x) + 0.05, BC + s * 0.066]);
    }
    b.sweep(catmull(railPts), 0.0085, { sides: 6, smooth: false, color: RED_D, bone: root });
    b.along(deckPath, 7, (at) => {
      put(new THREE.BoxGeometry(0.014, 0.05, 0.014), RED, { at: [at.at.x, at.at.y + 0.022, BC + s * 0.066] });
    });
    for (const e of [-1, 1]) {
      const x = e * (BZ + 0.004);
      put(new THREE.SphereGeometry(0.0145, 6, 5), GOLD, { at: [x, deckY(x) + 0.062, BC + s * 0.066] });
      put(new THREE.CylinderGeometry(0.011, 0.011, 0.07, 6), RED, { at: [x, deckY(x) + 0.03, BC + s * 0.066] });
    }
  }
  // planks
  b.along(deckPath, 13, (at) => {
    const x = at.at.x;
    const slope = (-2 * 0.08 * x) / (BZ * BZ);
    put(new THREE.BoxGeometry(0.02, 0.006, 0.112), WOOD_D, {
      at: [x, deckY(x) + 0.0095, BC],
      rotation: [0, 0, (Math.atan(slope) * 180) / Math.PI],
    });
  });

  // ---------------------------------------------------------------- stone lantern
  const LX = -0.39;
  const LZ = 0.28;
  const LY = GR - 0.005;
  const hexL = (prof: Array<[number, number]>, y: number, color: string, spin = 0) =>
    b.lathe(prof, { at: [LX, LY + y, LZ], segments: 6, spin, color, bone: root });
  hexL(
    [
      [0, 0],
      [0.06, 0],
      [0.056, 0.02],
      [0, 0.02],
    ],
    0,
    STONE_D,
  );
  hexL(
    [
      [0, 0],
      [0.019, 0],
      [0.019, 0.055],
      [0, 0.055],
    ],
    0.02,
    STONE,
  );
  hexL(
    [
      [0, 0],
      [0.03, 0],
      [0.058, 0.01],
      [0.058, 0.02],
      [0, 0.02],
    ],
    0.075,
    STONE_D,
  );
  put(new THREE.BoxGeometry(0.06, 0.056, 0.06), STONE, { at: [LX, LY + 0.123, LZ] });
  for (const [dx, dz, ry] of [
    [0, 0.0306, 0],
    [0, -0.0306, 180],
    [0.0306, 0, 90],
    [-0.0306, 0, -90],
  ] as Array<[number, number, number]>) {
    glow(
      put(new THREE.PlaneGeometry(0.036, 0.036), "#ffffff", {
        at: [LX + dx, LY + 0.123, LZ + dz],
        rotation: [0, ry, 0],
        texture: dz > 0 ? FACE_GLOW : WINDOW_GLOW,
      }),
      1.3,
    );
  }
  hexL(
    [
      [0, 0],
      [0.06, 0],
      [0.092, 0.013],
      [0.074, 0.02],
      [0.05, 0.033],
      [0.026, 0.049],
      [0, 0.055],
    ],
    0.151,
    STONE_D,
    30,
  );
  put(new THREE.SphereGeometry(0.013, 6, 4), GOLD, { at: [LX, LY + 0.215, LZ] });
  put(new THREE.ConeGeometry(0.008, 0.016, 5), GOLD, { at: [LX, LY + 0.232, LZ] });

  // ---------------------------------------------------------------- stepping stones
  const stepStone = (x: number, z: number, r: number, y: number, color: string) =>
    b.lathe(
      [
        [0, 0],
        [r, 0],
        [r * 0.94, 0.014],
        [r * 0.8, 0.022],
        [0, 0.022],
      ],
      { at: [x, y, z], segments: 7, spin: R() * 60, color, bone: root },
    );
  const stones: Array<[number, number, number]> = [
    [-0.38, -0.14, 0.032],
    [-0.33, -0.225, 0.03],
    [-0.31, -0.3, 0.03],
    [-0.29, -0.375, 0.03],
    [0.385, 0.04, 0.032],
    [0.4, 0.13, 0.03],
    [0.37, 0.22, 0.034],
    [0.31, 0.29, 0.03],
  ];
  stones.forEach(([x, z, r], i) => stepStone(x, z, r, GR - 0.006, i % 2 ? STONE_D : STONE));

  // ---------------------------------------------------------------- tea house
  const HZ = -0.395;
  const HB = 0.085; // stone terrace under the tea house
  const FY = GR + HB + 0.029;
  const WH = 0.105;
  put(new THREE.BoxGeometry(0.29, HB + 0.004, 0.205), STONE, { at: [0, GR + HB / 2, -0.3825] });
  put(new THREE.BoxGeometry(0.31, 0.032, 0.225), WOOD, { at: [0, GR + HB + 0.013, -0.3825] });
  for (const z of [-0.31, -0.29, -0.27])
    put(new THREE.BoxGeometry(0.31, 0.004, 0.006), WOOD_D, { at: [0, GR + HB + 0.03, z] });
  put(new THREE.BoxGeometry(0.05, (HB * 2) / 3, 0.09), STONE, { at: [-0.185, GR + HB / 3, -0.38] });
  put(new THREE.BoxGeometry(0.05, HB / 3, 0.09), STONE, { at: [-0.235, GR + HB / 6, -0.38] });
  // interior
  put(new THREE.BoxGeometry(0.2, 0.004, 0.125), "#d3e7a4", { at: [0, FY + 0.002, HZ - 0.001] });
  put(new THREE.BoxGeometry(0.05, 0.014, 0.036), WOOD, { at: [0, FY + 0.011, -0.405] });
  put(new THREE.IcosahedronGeometry(0.013, 1), PINK_D, { at: [-0.012, FY + 0.03, -0.405], scale: [1, 0.85, 1] });
  put(new THREE.ConeGeometry(0.004, 0.016, 5), PINK_D, { at: [0.002, FY + 0.03, -0.405], rotation: [0, 0, -70] });
  put(new THREE.CylinderGeometry(0.0075, 0.006, 0.011, 6), "#ffffff", { at: [0.016, FY + 0.0235, -0.397] });
  b.cards([frame([0.016, FY + 0.029, -0.397], [0, 1, 0])], STEAM, {
    size: [0.018, 0.04],
    flow: [0, 0, 1],
    bone: root,
  });
  // frame and walls
  put(new THREE.BoxGeometry(0.22, WH, 0.008), CREAM, { at: [0, FY + WH / 2, -0.458] });
  for (const x of [-0.055, 0.055])
    put(new THREE.BoxGeometry(0.07, WH * 0.6, 0.004), "#ffffff", {
      at: [x, FY + WH * 0.52, -0.4635],
      texture: SHOJI,
    });
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.008, WH, 0.124), "#ffffff", {
      at: [s * 0.104, FY + WH / 2, -0.396],
      texture: SHOJI,
    });
    put(new THREE.BoxGeometry(0.066, WH, 0.008), "#ffffff", {
      at: [s * 0.0685, FY + WH / 2, -0.332],
      texture: s > 0 ? SHOJI : SHOJI_ROUND,
    });
    for (const [x, z] of [
      [0.104, -0.46],
      [0.104, -0.332],
      [0.035, -0.332],
    ])
      put(new THREE.BoxGeometry(0.013, WH + 0.012, 0.013), WOOD_D, { at: [s * x, FY + WH / 2 + 0.005, z] });
    put(new THREE.BoxGeometry(0.014, 0.014, 0.14), WOOD_D, { at: [s * 0.104, FY + WH + 0.007, -0.396] });
  }
  put(new THREE.BoxGeometry(0.23, 0.014, 0.014), WOOD_D, { at: [0, FY + WH + 0.007, -0.332] });
  put(new THREE.BoxGeometry(0.23, 0.014, 0.014), WOOD_D, { at: [0, FY + WH + 0.007, -0.46] });
  b.cards([frame([0, FY + WH - 0.002, -0.326], [0, 1, 0])], NOREN, {
    size: [0.07, 0.052],
    lean: 180,
    flow: [0, 0, 1],
    bone: root,
    sink: 0,
  });
  // curved hip roof
  const ROOF_Y = FY + WH + 0.015;
  put(hipRoof(0.178, 0.12, 0.088, 0.024, 12, 0.014), "#ffffff", { at: [0, ROOF_Y, HZ], texture: ROOF_TEX });
  put(new THREE.SphereGeometry(0.0115, 6, 4), GOLD, { at: [0, ROOF_Y + 0.088 + 0.006, HZ] });
  put(new THREE.ConeGeometry(0.006, 0.02, 5), GOLD, { at: [0, ROOF_Y + 0.088 + 0.02, HZ] });
  // little paper lantern under the front eave
  put(new THREE.CylinderGeometry(0.0012, 0.0012, 0.014, 4), INK, { at: [0.135, ROOF_Y - 0.004, -0.29] });
  b.lathe(
    [
      [0, 0],
      [0.012, 0],
      [0.02, 0.011],
      [0.02, 0.022],
      [0.012, 0.033],
      [0, 0.033],
    ],
    { at: [0.135, ROOF_Y - 0.048, -0.29], segments: 8, color: "#ff6b7a", bone: root },
  );
  put(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 8), GOLD, { at: [0.135, ROOF_Y - 0.0145, -0.29] });
  put(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 8), GOLD, { at: [0.135, ROOF_Y - 0.0485, -0.29] });

  // teacup sign by the terrace
  put(new THREE.BoxGeometry(0.01, 0.11, 0.01), WOOD_D, { at: [0.225, GR + 0.055, -0.31] });
  put(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 10), WOOD, { at: [0.225, GR + 0.112, -0.31], rotation: [90, 0, 0] });
  put(new THREE.CircleGeometry(0.032, 10), "#ffffff", { at: [0.225, GR + 0.112, -0.3055], texture: SIGN });

  // ---------------------------------------------------------------- cherry tree
  const TX = 0.4;
  const TZ = -0.2;
  const trunk = b.chain(
    "trunk",
    catmull([
      [TX, GR - 0.01, TZ],
      [TX - 0.006, 0.17, TZ + 0.01],
      [TX - 0.03, 0.26, TZ + 0.0],
      [TX - 0.06, 0.34, TZ - 0.02],
    ]),
    { parent: root, count: 4, names: (i) => `trunk${i + 1}`, role: "spine" },
  );
  const trunkTube = b.sweep(trunk, (t) => 0.023 * (1 - t) + 0.011, {
    sides: 6,
    smooth: false,
    color: BARK,
  });
  const trunkSkin = b.surface(trunkTube);
  const branch = (name: string, from: number, pts: Array<[number, number, number]>) => {
    const hit = trunkSkin.nearest(trunk.at(from).at);
    return b.sprout(name, hit, catmull(pts), [0.012, 0.006], {
      count: 2,
      names: [`${name}1`, `${name}2`],
      role: "arm",
      sides: 5,
      smooth: false,
      color: BARK,
    });
  };
  const brL = branch("branchL", 0.62, [
    [TX - 0.1, 0.33, TZ + 0.02],
    [TX - 0.16, 0.37, TZ + 0.01],
  ]);
  const brB = branch("branchB", 0.5, [
    [TX + 0.03, 0.29, TZ - 0.06],
    [TX + 0.08, 0.34, TZ - 0.1],
  ]);
  const brF = branch("branchF", 0.72, [
    [TX - 0.05, 0.35, TZ + 0.05],
    [TX - 0.03, 0.38, TZ + 0.1],
  ]);
  const tipOf = (br: typeof brL) => br.chain!.joints[br.chain!.joints.length - 1];
  const trunkTop = trunk.joints[trunk.joints.length - 1];
  const blobSpec: Array<[number, number, number, number, string, (typeof trunkTop)]> = [
    [TX - 0.06, 0.4, TZ - 0.02, 0.105, PINK, trunkTop],
    [TX - 0.04, 0.485, TZ - 0.02, 0.068, PINK_L, trunkTop],
    [TX - 0.175, 0.38, TZ + 0.0, 0.078, PINK_D, tipOf(brL)],
    [TX + 0.09, 0.36, TZ - 0.11, 0.072, PINK_L, tipOf(brB)],
    [TX - 0.04, 0.4, TZ + 0.11, 0.068, PINK, tipOf(brF)],
    [TX - 0.11, 0.45, TZ + 0.05, 0.058, PINK_D, trunkTop],
    [TX + 0.02, 0.43, TZ - 0.06, 0.062, PINK_D, trunkTop],
  ];
  const blobs = blobSpec.map(([x, y, z, r, c, bone]) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), c, { at: [x, y, z], bone, flat: true, scale: [1, 0.86, 1] }),
  );
  const blossomHits = b.surface(blobs).scatter(90, { rng: rng(3), minDist: 0.036, filter: (h) => h.n.y > -0.35 });
  b.cards(blossomHits, BLOSSOM, { size: 0.032, lean: 80, flow: [0.3, -0.5, 1], vary: 0.2, rng: rng(4), spin: 180 });

  // ---------------------------------------------------------------- lily pads and lotus
  const pads: Array<[number, number, number, THREE.Texture]> = [
    [-0.22, 0.06, 0.085, PAD_A],
    [0.25, 0.1, 0.075, PAD_B],
    [0.04, 0.05, 0.055, PAD_C],
    [-0.16, -0.17, 0.07, PAD_C],
    [0.14, -0.17, 0.06, PAD_A],
    [0.0, -0.2, 0.05, PAD_B],
    [0.0, 0.3, 0.045, PAD_A],
    [-0.27, 0.0, 0.05, PAD_B],
  ];
  pads.forEach(([x, z, s, tex], i) => {
    const a = R() * Math.PI * 2;
    b.cards([frame([x, WY + 0.0035, z], [0, 1, 0])], tex, {
      size: s,
      lean: 90,
      flow: [Math.cos(a), 0, Math.sin(a)],
      mirror: true,
      bone: root,
      sink: 0,
    });
    if (i % 2 === 0)
      b.cards([frame([x + s * 0.3, WY + 0.004, z - s * 0.2], [0, 1, 0])], RING, {
        size: s * 1.5,
        lean: 90,
        flow: [1, 0, 0],
        mirror: true,
        bone: root,
        sink: 0,
      });
  });

  const lotus = (x: number, z: number, h: number, petals: number) => {
    const top: [number, number, number] = [x, WY + h, z];
    b.sweep(
      catmull([
        [x + 0.012, WY - 0.005, z - 0.008],
        [x + 0.004, WY + h * 0.5, z - 0.002],
        top,
      ]),
      0.0042,
      { sides: 5, smooth: false, color: "#56bd6b", bone: root },
    );
    if (petals === 0) {
      // bud
      const bud = b.ring(frame(top, [0, 1, 0]), { count: 6, radius: 0.004, tilt: 72 });
      b.cards(bud.items, LOTUS_PETAL, { size: [0.026, 0.05], flow: [0, 1, 0], bend: 10, bone: root, sink: 0.05 });
      return;
    }
    const tiers: Array<[number, number, number, THREE.Texture, number]> = [
      [7, 28, 0.06, LOTUS_PETAL_W, 0.008],
      [6, 50, 0.052, LOTUS_PETAL, 0.005],
      [5, 68, 0.042, LOTUS_PETAL_W, 0.003],
    ];
    for (const [count, tilt, len, tex, r] of tiers) {
      const items = b.ring(frame(top, [0, 1, 0]), { count, radius: r, tilt, fromDeg: tilt, toDeg: tilt + 360 - 360 / count }).items;
      b.cards(items, tex, { size: [len * 0.62, len], flow: [0, 1, 0], bend: 18, bone: root, sink: 0.05 });
    }
    put(new THREE.CylinderGeometry(0.011, 0.008, 0.012, 6), GOLD, { at: [x, WY + h + 0.006, z] });
  };
  lotus(-0.22, 0.06, 0.06, 1);
  lotus(0.25, 0.1, 0.055, 1);
  lotus(0.04, 0.05, 0.045, 0);

  // ---------------------------------------------------------------- koi
  const PATCH_A = vb(
    "0 0 60 100",
    `<path d="M10 58 C4 44 16 30 32 34 C48 36 56 52 46 64 C40 76 18 74 10 58Z" fill="#fff5e6"/>
     <path d="M24 20 C18 12 26 4 36 8 C44 12 44 22 34 26 C30 28 26 24 24 20Z" fill="#fff5e6"/>
     <path d="M28 96 C20 90 22 82 32 82 C42 82 46 92 40 98 C36 100 32 100 28 96Z" fill="#fff5e6"/>
     <circle cx="46" cy="36" r="4.5" fill="#fff5e6"/><circle cx="12" cy="84" r="3.6" fill="#fff5e6"/>`,
    256,
  );
  const PATCH_B = vb(
    "0 0 60 100",
    `<path d="M12 18 C10 6 28 0 42 6 C54 12 50 28 36 30 C22 34 14 28 12 18Z" fill="#ff8e4d"/>
     <path d="M8 60 C6 48 20 42 32 48 C46 52 52 64 42 72 C30 78 10 74 8 60Z" fill="#ff8e4d"/>
     <path d="M34 92 C28 86 38 80 46 85 C50 93 42 98 34 92Z" fill="#4a3a5c"/>
     <path d="M8 40 C6 34 14 32 18 36 C20 42 12 46 8 40Z" fill="#4a3a5c"/>
     <circle cx="16" cy="82" r="5" fill="#4a3a5c"/>`,
    256,
  );
  const PATCH_C = vb(
    "0 0 60 100",
    `<circle cx="31" cy="27" r="12" fill="#ff5f66"/>
     <path d="M10 62 C6 50 20 44 32 50 C46 54 52 66 42 74 C30 80 12 76 10 62Z" fill="#fff6d8"/>
     <path d="M26 98 C20 92 28 84 38 88 C44 94 36 100 26 98Z" fill="#fff6d8"/>
     <circle cx="14" cy="38" r="4" fill="#fff6d8"/>`,
    256,
  );
  const EYE = vb(
    "0 0 100 100",
    `<circle cx="48" cy="46" r="38" fill="${INK}"/>
     <circle cx="34" cy="31" r="13" fill="#ffffff"/>
     <circle cx="60" cy="60" r="6.5" fill="#ffffff"/>
     <ellipse cx="74" cy="88" rx="17" ry="8" fill="#ff8fb0"/>`,
    256,
  );
  const MOUTH = vb(
    "0 0 60 44",
    `<ellipse cx="30" cy="22" rx="24" ry="17" fill="#c2415f"/><ellipse cx="30" cy="29" rx="14" ry="8" fill="#ff8fa3"/>`,
    128,
  );
  const fanPath = "M50 100 C28 88 6 72 4 42 C2 22 12 8 26 10 C38 12 44 24 50 30 C56 24 62 12 74 10 C88 8 98 22 96 42 C94 72 72 88 50 100Z";
  const leafPath = "M50 100 C26 84 6 56 14 30 C22 6 48 2 70 18 C92 36 78 76 50 100Z";
  const sailPath = "M6 100 C10 70 28 30 72 4 C66 38 74 70 94 100Z";
  const finSvg = (path: string, main: string, tip: string, ray: string) => {
    let rays = "";
    for (let i = 0; i < 5; i++) {
      const a = ((-50 + i * 25) * Math.PI) / 180;
      rays += `<path d="M50 96 L${(50 + 70 * Math.sin(a)).toFixed(1)} ${(96 - 70 * Math.cos(a)).toFixed(1)}" stroke="${ray}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    return vb(
      "0 0 100 100",
      `<defs><clipPath id="fin"><path d="${path}"/></clipPath></defs><path d="${path}" fill="${tip}"/><g transform="translate(50 100) scale(0.74) translate(-50 -100)"><path d="${path}" fill="${main}"/></g><g clip-path="url(#fin)">${rays}</g>`,
      192,
    );
  };

  type KoiSpec = {
    id: string;
    pos: [number, number, number];
    yaw: number;
    pitchUp?: number;
    sc: number;
    sway: number;
    arch?: number;
    body: string;
    belly: string;
    patch: THREE.Texture;
    fins: [string, string, string];
  };
  const koi = (o: KoiSpec) => {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler((-(o.pitchUp ?? 0) * Math.PI) / 180, (o.yaw * Math.PI) / 180, 0, "YXZ"),
    );
    const P = (x: number, y: number, z: number) =>
      new THREE.Vector3(x * o.sc, y * o.sc, z * o.sc).applyQuaternion(q).add(new THREE.Vector3(...o.pos));
    const D = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q);
    const id = o.id;
    const zs = [-0.08, -0.052, -0.022, 0.008, 0.038, 0.064, 0.084];
    const pts = zs.map((z) =>
      P(o.sway * Math.sin(((z + 0.08) / 0.164) * Math.PI * 1.3), -(o.arch ?? 0) * (z / 0.084) ** 2, z),
    );
    const path = catmull(pts);
    const core = b.joint(`${id}Core`, { parent: root, at: P(0, 0, 0.004), aim: P(0, 0, 0.03), role: "spine" });
    const rootT = path.closestT(core.at);
    const front = b.chain(`${id}Spine`, path.slice(rootT, 1), {
      parent: core,
      count: 3,
      names: [`${id}Spine1`, `${id}Spine2`, `${id}Head`],
      role: "spine",
    });
    const back = b.chain(`${id}Tail`, path.slice(rootT, 0), {
      parent: core,
      count: 4,
      names: (i) => `${id}Tail${i + 1}`,
      role: "tail",
    });
    const keys = [0.005, 0.011, 0.024, 0.037, 0.043, 0.04, 0.028];
    const radius = (t: number): [number, number] => {
      const f = t * (keys.length - 1);
      const i = Math.min(keys.length - 2, Math.floor(f));
      const r = (keys[i] + (keys[i + 1] - keys[i]) * (f - i)) * o.sc;
      return [r, r * 0.95];
    };
    const body = b.sweep(path, radius, {
      bone: [back, core, front],
      sides: 10,
      smooth: false,
      color: o.body,
      sectors: [[125, 235, o.belly]],
    });
    // patches, eyes, mouth
    const topHit = body.at(0.56, 0);
    b.decal(body, o.patch, {
      at: topHit,
      dir: D(0, -1, 0),
      up: D(0, 0, 1),
      size: [0.1 * o.sc, 0.17 * o.sc],
      segments: [16, 28],
      lift: 0.006,
    });
    for (const s of [1, -1]) {
      const sp = body.at(0.86, -s * 62);
      b.decal(body, EYE, {
        at: sp,
        dir: sp.n.clone().negate(),
        up: D(0, 1, 0),
        size: [0.04 * o.sc, 0.04 * o.sc],
        segments: 6,
        lift: 0.0025,
        mirror: s < 0,
      });
    }
    const headJoint = front.joints[front.joints.length - 1];
    const snout = b.surface(body).around(P(0, 0, 0.05)).at(o.yaw, -8 + (o.pitchUp ?? 0));
    if (snout)
      b.decal(body, MOUTH, {
        at: snout,
        dir: D(0, 0, -1),
        up: D(0, 1, 0),
        size: [0.034 * o.sc, 0.024 * o.sc],
        segments: 4,
        lift: 0.002,
      });
    const jaw = b.joint(`${id}Jaw`, {
      parent: headJoint,
      at: P(0, -0.03, 0.078),
      aim: P(0, -0.032, 0.11),
      role: "jaw",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), PINK_D, {
      bone: jaw,
      at: P(0, -0.034, 0.096),
      quat: q,
      scale: [0.021 * o.sc, 0.009 * o.sc, 0.02 * o.sc],
      flat: true,
    });
    for (const s of [1, -1])
      b.sweep(bezier(P(s * 0.02, -0.02, 0.1), P(s * 0.042, -0.022, 0.104), P(s * 0.056, -0.03, 0.084)), [0.003 * o.sc, 0.001], {
        sides: 4,
        smooth: false,
        color: CREAM,
        bone: headJoint,
      });
    // fins: each a pair of back-to-back planes so both faces are lit like the fin they are
    const [fMain, fTip, fRay] = o.fins;
    const tailTex = finSvg(fanPath, fMain, fTip, fRay);
    const leafTex = finSvg(leafPath, fMain, fTip, fRay);
    const sailTex = finSvg(sailPath, fMain, fTip, fRay);
    const fin = (
      tex: THREE.Texture,
      w: number,
      h: number,
      from: THREE.Vector3,
      grow: THREE.Vector3,
      side: THREE.Vector3,
      bone: typeof root,
    ) => {
      const dir = grow.clone().normalize();
      const at = from.clone().addScaledVector(dir, -0.1 * h);
      const quat = aim(dir, side, "y");
      const faceA = new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0);
      const faceB = faceA.clone().rotateY(Math.PI);
      const uv = faceB.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
      glow(b.part(faceA, "#ffffff", { bone, at, quat, texture: tex }), 0.5);
      glow(b.part(faceB, "#ffffff", { bone, at, quat, texture: tex }), 0.5);
    };
    const dorsalAt = body.at(0.55, 0);
    const dorsal = b.joint(`${id}Dorsal`, {
      parent: front.joints[0],
      at: dorsalAt.at,
      dir: D(0, 1, -0.35),
      role: "fan",
    });
    fin(sailTex, 0.085 * o.sc, 0.06 * o.sc, dorsalAt.at, D(0, 1, -0.45), D(1, 0, 0), dorsal);
    for (const s of [1, -1]) {
      const pe = body.at(0.72, -s * 104);
      const grow = D(s * 0.85, -0.3, -0.5);
      const pec = b.joint(`${id}Pec${s > 0 ? "L" : "R"}`, {
        parent: front.joints[1],
        at: pe.at,
        dir: grow,
        role: "fan",
      });
      fin(leafTex, 0.05 * o.sc, 0.065 * o.sc, pe.at, grow, D(0, 1, 0), pec);
    }
    const tailEnd = back.at(1);
    fin(tailTex, 0.1 * o.sc, 0.1 * o.sc, tailEnd.at, tailEnd.axis, D(1, 0, 0), back.joints[back.joints.length - 1]);
    return { P, D, body };
  };

  const fishA = koi({
    id: "koiA",
    pos: [0.13, WY + 0.006, 0.22],
    yaw: -60,
    sc: 1,
    sway: 0.012,
    body: "#ffa15a",
    belly: "#ffe9d2",
    patch: PATCH_A,
    fins: ["#ffe7cf", "#ffb98a", "#ffcfa3"],
  });
  const fishB = koi({
    id: "koiB",
    pos: [-0.17, WY + 0.006, 0.17],
    yaw: 216,
    sc: 0.95,
    sway: -0.012,
    body: "#fff6ea",
    belly: "#ffe6d6",
    patch: PATCH_B,
    fins: ["#ffffff", "#ffd2b4", "#ffe3cf"],
  });
  const fishC = koi({
    id: "koiC",
    pos: [-0.04, 0.2, 0.12],
    yaw: -80,
    pitchUp: 24,
    sc: 1.05,
    sway: 0,
    arch: 0.05,
    body: "#ffd651",
    belly: "#fff3c4",
    patch: PATCH_C,
    fins: ["#fff3b8", "#ffdd6e", "#ffe9a0"],
  });
  // ripples under the swimmers, splash under the jumper
  for (const f of [fishA, fishB])
    b.cards([frame([f.P(0, 0, 0).x, WY + 0.004, f.P(0, 0, 0).z], [0, 1, 0])], RING, {
      size: 0.22,
      lean: 90,
      flow: [1, 0, 0],
      mirror: true,
      bone: root,
      sink: 0,
    });
  const splashAt = fishC.P(0, 0, -0.09);
  b.cards([frame([splashAt.x, WY + 0.004, splashAt.z], [0, 1, 0])], RING, {
    size: 0.2,
    lean: 90,
    flow: [1, 0, 0],
    mirror: true,
    bone: root,
    sink: 0,
  });
  const drops = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const r = 0.03 + R() * 0.05;
    return frame([splashAt.x + Math.cos(a) * r, WY + 0.01 + R() * 0.07, splashAt.z + Math.sin(a) * r], [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4]);
  });
  b.cards(drops, DROP, { size: [0.014, 0.022], flow: [0, 0, 1], cross: true, bone: root, vary: 0.25, rng: rng(9) });

  // ---------------------------------------------------------------- bushes, sparkles, petals, grass
  const bushSpots: Array<[number, number, number]> = [
    [-0.22, 0.43, 0.055],
    [0.2, 0.44, 0.05],
    [0.0, 0.48, 0.04],
    [-0.47, 0.02, 0.05],
  ];
  const bushes = bushSpots.map(([x, z, r], i) =>
    put(new THREE.IcosahedronGeometry(r, 1), i % 2 ? BUSH : BUSH_D, { at: [x, GR + r * 0.3, z], scale: [1.2, 0.8, 1.1] }),
  );
  b.cards(
    b.surface(bushes).scatter(44, { rng: rng(14), minDist: 0.022, filter: (h) => h.n.y > 0.15 }),
    [DAISY_W, DAISY_P, DAISY_Y],
    { size: 0.024, lean: 80, flow: [0.2, -0.4, 1], rng: rng(15), spin: 180, bone: root },
  );
  const sparkles = [
    frame([-0.14, 0.3, 0.12], [0, 1, 0]),
    frame([0.1, 0.27, 0.16], [0, 1, 0]),
    frame([-0.02, 0.14, 0.24], [0, 1, 0]),
    frame([0.12, 0.17, 0.05], [0, 1, 0]),
  ];
  b.cards(sparkles, [SPARKLE, SPARKLE_Y], { size: 0.03, flow: [0, 0, 1], cross: true, bone: root, rng: rng(6), vary: 0.3 });

  const air = Array.from({ length: 70 }, () => {
    const x = 0.12 + R() * 0.42;
    const z = -0.36 + R() * 0.45;
    const y = 0.11 + R() * 0.3;
    const d: [number, number, number] = [R() - 0.5, R() * 0.6 + 0.4, R() - 0.5];
    return frame([x, y, z], d);
  });
  b.cards(air, [PETAL_A, PETAL_B, PETAL_C], { size: 0.022, flow: [0, 0, 1], bend: 25, vary: 0.3, spin: 180, rng: rng(8), bone: root });

  const keep: Array<[number, number, number]> = [
    [0, PZ, 0.4],
    [-0.39, 0.28, 0.09],
    [0, -0.39, 0.24],
    [TX, TZ, 0.05],
    ...stones,
  ];
  const onGrass = (x: number, z: number) => {
    const r = Math.hypot(x, z);
    return (
      r > 0.3 &&
      r < 0.51 &&
      keep.every(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) > kr) &&
      bushSpots.every(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) > kr + 0.03)
    );
  };
  const scatterGrass = (count: number, seed: number) => {
    const g = rng(seed);
    const out: Array<[number, number]> = [];
    for (let i = 0; i < count * 6 && out.length < count; i++) {
      const a = g() * Math.PI * 2;
      const r = 0.3 + g() * 0.2;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (onGrass(x, z)) out.push([x, z]);
    }
    return out;
  };
  b.cards(
    scatterGrass(46, 21).map(([x, z]) => frame([x, GR - 0.002, z], [0, 1, 0])),
    [TUFT_A, TUFT_B],
    { size: [0.04, 0.042], cross: true, flow: [0, 0, 1], vary: 0.3, spin: 180, rng: rng(22), bone: root },
  );
  const flowers = scatterGrass(22, 31).map(([x, z]) => frame([x, GR + 0.0015, z], [0, 1, 0]));
  b.cards(flowers, [DAISY_W, DAISY_P, DAISY_Y], { size: 0.03, lean: 90, flow: [1, 0, 0], mirror: true, rng: rng(32), bone: root, sink: 0, spin: 180 });
  const ground = Array.from({ length: 34 }, () => {
    const a = R() * Math.PI * 2;
    const r = R() * 0.17;
    const x = TX - 0.05 + Math.cos(a) * r;
    const z = TZ + 0.03 + Math.sin(a) * r;
    const inPond = Math.hypot(x, z - PZ) < POND - 0.02;
    return frame([x, inPond ? WY + 0.005 : GR + 0.002, z], [0, 1, 0]);
  });
  b.cards(ground, [PETAL_A, PETAL_B, PETAL_C], { size: 0.022, lean: 90, flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)], mirror: true, rng: rng(33), bone: root, sink: 0 });

  return b.root;
}
