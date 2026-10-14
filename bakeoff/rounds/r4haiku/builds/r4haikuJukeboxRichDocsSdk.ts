import * as THREE from "three";
import { catmull, createBuilder, paint, polyline, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

type V3 = [number, number, number];

// Palette: chrome, lacquer, glowing tubes (base colour plus a hot core), glass and records.
const CHROME = "#dfe4ea";
const CHROME_DARK = "#8d97a1";
const BODY = "#a8202a";
const WINE = "#2a0d13";
const CREAM = "#f4e9cc";
const GLASS = "#bfe9ea";
const BLACK = "#141418";
const RED = "#e8232e";
const RED_CORE = "#ff9d8f";
const AMBER = "#f7a11a";
const AMBER_CORE = "#fff0a0";
const TEAL = "#18c7b4";
const TEAL_CORE = "#c4fff5";
const RAY_A = "#2a1613";
const RAY_B = "#4d2620";

// Layout in metres. The cabinet stands on y = 0 and faces +Z.
const KICK_H = 0.07;
const BODY_TOP = 0.44;
const HEAD_BOTTOM = 0.6;
const SPRING = 1.0; // spring line of the arch; the window dome centres here
const ARCH_R = 0.35;
const FRONT = 0.2; // front face of the arched head
const GRILLE_Y = 0.25;

// Selection panel, tilted 15 degrees back at the top.
const PANEL_C: V3 = [0, 0.55, 0.245];
const PANEL_UP: V3 = [0, 0.966, -0.259];
const PANEL_N: V3 = [0, 0.259, 0.966];

/** A point on the selection panel: u across, v up the panel, d out of its face. */
const onPanel = (u: number, v: number, d = 0): V3 => [
  u,
  PANEL_C[1] + v * PANEL_UP[1] + d * PANEL_N[1],
  PANEL_C[2] + v * PANEL_UP[2] + d * PANEL_N[2],
];

/** A glowing tube: its base colour, with a hot core on the side facing the viewer. */
const glow = (base: string, core: string) => paint((_p, n) => (n.z > 0.7 ? core : base));

/** Closed outline: a rectangle with a half-round top, spring line at ys. */
function archLoop(r: number, yb: number, ys: number, z: number): V3[] {
  const pts: V3[] = [
    [-r, yb, z],
    [r, yb, z],
    [r, ys, z],
  ];
  for (let i = 1; i < 18; i++) {
    const a = (i * Math.PI) / 18;
    pts.push([r * Math.cos(a), ys + r * Math.sin(a), z]);
  }
  pts.push([-r, ys, z]);
  return pts;
}

const flatOutline = (pts: V3[]) => pts.map(([x, y]) => [x, y] as OutlinePoint);

/** One tube of the arch: up the left leg, over the top, down the right leg. */
function archTube(R: number, z: number): V3[] {
  const pts: V3[] = [
    [-R, 0.72, z],
    [-R, 0.86, z],
  ];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI - (i * Math.PI) / 12;
    pts.push([R * Math.cos(a), SPRING + R * Math.sin(a), z]);
  }
  pts.push([R, 0.86, z], [R, 0.72, z]);
  return pts;
}

/** A 24-point star outline: twelve sharp rays. */
function starOutline(): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12 + Math.PI / 2;
    const r = i % 2 === 0 ? 0.13 : 0.058;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

/** A selection title strip: cream card, coloured tab, title line. */
const titleCard = (title: string, tab: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 24">` +
      `<rect width="96" height="24" fill="#fff5dc"/>` +
      `<rect width="12" height="24" fill="${tab}"/>` +
      `<rect x="12" width="84" height="2" fill="#b58a45"/>` +
      `<text x="17" y="15.5" font-family="Georgia, serif" font-size="11" font-weight="bold" fill="#2a1512" textLength="74" lengthAdjust="spacingAndGlyphs">${title}</text>` +
      `</svg>`,
    { size: 256 },
  );

export const meta = {
  name: "1950s diner jukebox",
  description:
    "Cherry-red jukebox with a tall arch of glowing red, amber and teal tubes, a domed window with a record stack and pick arm, ten chrome selection buttons with title cards, a starburst speaker grille and a coin slot.",
};

export default function build() {
  const b = createBuilder({ name: "jukebox" });

  // Speaker: a sunburst of alternating rays painted on the grille disc.
  const sunburst = paint((p) => {
    const a = Math.atan2(p.y - GRILLE_Y, p.x);
    return Math.floor((a + Math.PI) / (Math.PI / 12)) % 2 ? RAY_B : RAY_A;
  });

  // Skeleton: the cabinet, and the head that carries the arch and window.
  const body = b.joint("body", { at: [0, 0.45, 0] });
  const top = b.joint("top", { parent: body, at: [0, SPRING, 0] });

  // ---- Plinth, cabinet and trim -------------------------------------------
  b.part(new THREE.BoxGeometry(0.72, KICK_H, 0.54), CHROME_DARK, {
    at: [0, KICK_H / 2, 0],
    bone: body,
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.7, 0.37, 0.52), BODY, { at: [0, 0.255, 0], bone: body });
  b.part(new THREE.BoxGeometry(0.72, 0.022, 0.54), CHROME, { at: [0, BODY_TOP, 0], bone: body });
  // Waist behind the selection panel.
  b.part(new THREE.BoxGeometry(0.7, 0.2, 0.425), BODY, { at: [0, 0.54, 0.0125], bone: body });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.37, 0.02), CHROME, {
      at: [s * 0.35, 0.255, 0.26],
      bone: body,
      flat: true,
    });
  }

  // ---- Speaker grille: cream surround, sunburst, chrome star ---------------
  b.part(new THREE.BoxGeometry(0.6, 0.36, 0.012), CREAM, { at: [0, 0.25, 0.266], bone: body });
  for (const x of [-0.275, 0.275]) {
    for (const y of [0.105, 0.395]) {
      b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.01, 10), CHROME, {
        at: [x, y, 0.274],
        dir: [0, 0, 1],
        bone: body,
        flat: true,
      });
    }
  }
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 28), sunburst, {
    at: [0, GRILLE_Y, 0.277],
    dir: [0, 0, 1],
    bone: body,
  });
  b.part(new THREE.TorusGeometry(0.162, 0.012, 6, 28), CHROME, {
    at: [0, GRILLE_Y, 0.282],
    bone: body,
  });
  b.extrude(starOutline(), {
    at: [0, GRILLE_Y, 0.292],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    color: CHROME,
    bone: body,
  });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 14), CHROME, {
    at: [0, GRILLE_Y, 0.3],
    dir: [0, 0, 1],
    bone: body,
    flat: true,
  });

  // ---- Selection panel: chrome border, cream face, buttons and title cards ----
  b.part(new THREE.BoxGeometry(0.645, 0.255, 0.012), CHROME, {
    at: onPanel(0, 0, -0.002),
    dir: PANEL_N,
    axis: "z",
    up: PANEL_UP,
    bone: body,
  });
  b.part(new THREE.BoxGeometry(0.62, 0.23, 0.02), CREAM, {
    at: PANEL_C,
    dir: PANEL_N,
    axis: "z",
    up: PANEL_UP,
    bone: body,
  });

  const titles = [
    "BLUE SUEDE SHOES",
    "HOUND DOG",
    "TUTTI FRUTTI",
    "AT THE HOP",
    "JAILHOUSE ROCK",
    "SHAKE RATTLE",
    "LONG TALL SALLY",
    "EARTH ANGEL",
    "ROCKIN' ROBIN",
    "PEGGY SUE",
  ];
  const tabs = [RED, AMBER, TEAL];
  const cardTex = titles.map((t, i) => titleCard(t, tabs[i % 3]));
  const cols = [-0.27, 0.02];
  const rows = [0.075, 0.037, -0.001, -0.039, -0.077];
  let k = 0;
  for (const v of rows) {
    for (const u of cols) {
      const cap = tabs[k % 3];
      b.part(new THREE.CylinderGeometry(0.016, 0.017, 0.012, 14), CHROME, {
        at: onPanel(u, v, 0.016),
        dir: PANEL_N,
        bone: body,
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.008, 14), cap, {
        at: onPanel(u, v, 0.026),
        dir: PANEL_N,
        bone: body,
        flat: true,
      });
      b.part(new THREE.PlaneGeometry(0.12, 0.03), "#ffffff", {
        at: onPanel(u + 0.095, v, 0.0115),
        dir: PANEL_N,
        axis: "z",
        up: PANEL_UP,
        texture: cardTex[k],
        bone: body,
      });
      k++;
    }
  }

  // Coin slot: chrome escutcheon with an "INSERT COIN" strip, a slit and a return knob.
  const coinTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 14">` +
      `<rect width="56" height="14" fill="#c8202b"/>` +
      `<text x="4" y="10" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#fff3d6" textLength="48" lengthAdjust="spacingAndGlyphs">INSERT COIN</text>` +
      `</svg>`,
    { size: 256 },
  );
  const COIN_U = 0.235;
  b.part(new THREE.BoxGeometry(0.075, 0.09, 0.012), CHROME, {
    at: onPanel(COIN_U, 0, 0.016),
    dir: PANEL_N,
    axis: "z",
    up: PANEL_UP,
    bone: body,
  });
  b.part(new THREE.PlaneGeometry(0.07, 0.0175), "#ffffff", {
    at: onPanel(COIN_U, 0.03, 0.0245),
    dir: PANEL_N,
    axis: "z",
    up: PANEL_UP,
    texture: coinTex,
    bone: body,
  });
  b.part(new THREE.BoxGeometry(0.026, 0.005, 0.004), BLACK, {
    at: onPanel(COIN_U, -0.012, 0.0265),
    dir: PANEL_N,
    axis: "z",
    up: PANEL_UP,
    bone: body,
  });
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.01, 12), RED, {
    at: onPanel(COIN_U, -0.06, 0.012),
    dir: PANEL_N,
    bone: body,
    flat: true,
  });

  // ---- Arched head: a tombstone slab with a chrome edge -------------------
  b.extrude(flatOutline(archLoop(ARCH_R, HEAD_BOTTOM, SPRING, 0)), {
    at: [0, 0, 0.02],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.36,
    color: WINE,
    bone: top,
  });
  b.sweep(polyline(archLoop(ARCH_R, HEAD_BOTTOM, SPRING, FRONT + 0.002), { closed: true }), 0.008, {
    color: CHROME,
    bone: top,
  });

  // Crown and starburst finial.
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.09, 0.02],
      [0.05, 0.045],
      [0, 0.06],
    ],
    { at: [0, 1.33, 0.02], axis: [0, 1, 0], color: CHROME, bone: top },
  );
  b.spike([0, 1.39, 0.02], [0, 1, 0], 0.13, 0.016, { color: CHROME, bone: top });

  // ---- The glowing arch: three tubes, red outside, amber, teal inside ------
  const outerArch = catmull(archTube(0.32, 0.212));
  b.sweep(outerArch, 0.017, { color: glow(RED, RED_CORE), bone: top });
  b.sweep(catmull(archTube(0.28, 0.212)), 0.017, { color: glow(AMBER, AMBER_CORE), bone: top });
  b.sweep(catmull(archTube(0.24, 0.212)), 0.017, { color: glow(TEAL, TEAL_CORE), bone: top });
  // Chrome beads threaded along the outer tube.
  b.along(
    outerArch,
    11,
    (at) => {
      b.part(new THREE.SphereGeometry(0.024, 8, 6), CHROME, { at, flat: true });
    },
    { from: 0.04, to: 0.96 },
  );
  // Chrome sockets where the legs meet the head.
  for (const R of [0.32, 0.28, 0.24]) {
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.024, 12), CHROME, {
        at: [s * R, 0.7, 0.212],
        bone: top,
        flat: true,
      });
    }
  }

  // ---- Domed window: glass, chrome frame, glints ---------------------------
  const WIN_R = 0.19;
  const WIN_B = 0.74;
  b.extrude(flatOutline(archLoop(WIN_R, WIN_B, SPRING, 0)), {
    at: [0, 0, 0.204],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.008,
    color: GLASS,
    bone: top,
  });
  b.sweep(polyline(archLoop(WIN_R, WIN_B, SPRING, 0.21), { closed: true }), 0.009, {
    color: CHROME,
    bone: top,
  });
  const glints = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 45">` +
      `<polygon points="7.5,39 9,39 17,3 15.5,3" fill="#ffffff"/>` +
      `<polygon points="19,39 20.2,39 26.5,7 25.3,7" fill="#ffffff"/>` +
      `</svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.38, 0.45), "#ffffff", {
    at: [0, 0.965, 0.2115],
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    texture: glints,
    bone: top,
  });

  // A stack of records, face on, with the top one's label showing.
  const recLabel = [RED, AMBER, TEAL, CREAM, RED, TEAL];
  for (let i = 0; i < 6; i++) {
    const pos: V3 = [-0.06 + i * 0.012, 0.83 + i * 0.034, 0.218 + i * 0.004];
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.006, 22), BLACK, {
      at: pos,
      dir: [0, 0, 1],
      bone: top,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.0075, 12), recLabel[i], {
      at: [pos[0], pos[1], pos[2] + 0.002],
      dir: [0, 0, 1],
      bone: top,
      flat: true,
    });
  }

  // The pick arm: a chain pivoting at the window's right wall, gripping the top record.
  const arm = b.chain(
    "pick",
    catmull([
      [0.175, 0.86, 0.225],
      [0.19, 0.98, 0.24],
      [0.13, 1.1, 0.255],
      [0.068, 1.04, 0.258],
    ]),
    { parent: top },
  );
  b.sweep(arm, [0.008, 0.006], { color: CHROME });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 12), CHROME, {
    at: [0.175, 0.86, 0.225],
    dir: [0, 0, 1],
    bone: top,
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.03, 0.018, 0.022), CHROME_DARK, {
    at: [0.068, 1.04, 0.258],
    bone: arm,
  });

  return b.root;
}
