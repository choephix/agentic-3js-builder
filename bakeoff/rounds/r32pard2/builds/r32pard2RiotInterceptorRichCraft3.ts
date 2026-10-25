import * as THREE from "three";
import { createBuilder, paint, mix, noise, stripes, svg, lerp } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled, gaugeTexture } from "../../../../kits/clockwork";

export const meta = {
  name: "KT-07 Riot Interceptor",
  description:
    "Cyberpunk corporate riot-control interceptor truck with a roof water cannon, tank, neon light bars and underglow.",
};

const NEON_C = "#19f3ff";
const NEON_M = "#ff2bd6";
const YEL = "#ffd400";
const RED = "#ff2a4a";
const DARK = "#12141d";
const STEEL = "#6d7690";
const BLACK = "#0a0b10";

// ---------- textures ----------
const GLASS = svg(
  `<svg viewBox="0 0 100 60"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16314a"/><stop offset="1" stop-color="#05060c"/></linearGradient></defs>
  <rect width="100" height="60" fill="url(#g)"/>
  <polygon points="10,60 32,0 44,0 22,60" fill="#19f3ff" opacity="0.16"/>
  <polygon points="52,60 70,0 76,0 58,60" fill="#ff2bd6" opacity="0.14"/>
  <rect x="6" y="6" width="26" height="2" fill="#19f3ff" opacity="0.8"/><rect x="6" y="11" width="16" height="2" fill="#19f3ff" opacity="0.6"/>
  <rect x="70" y="50" width="24" height="2" fill="#ff2bd6" opacity="0.8"/></svg>`,
  { size: 256 },
);

const DOOR_LOGO = svg(
  `<svg viewBox="0 0 200 140"><rect x="3" y="3" width="194" height="134" rx="10" fill="#10131f" stroke="#19f3ff" stroke-width="4"/>
  <polygon points="52,22 82,22 98,50 82,78 52,78 36,50" fill="#ff2bd6" stroke="#fff" stroke-width="3"/>
  <path d="M46 50 L67 30 L88 50 L67 70Z" fill="#10131f"/><path d="M58 50 L67 40 L76 50 L67 60Z" fill="#19f3ff"/>
  <text x="108" y="44" font-family="sans-serif" font-weight="bold" font-size="24" fill="#ffffff">KURO-TEC</text>
  <text x="108" y="64" font-family="monospace" font-size="12" fill="#19f3ff">PEACEKEEPING</text>
  <rect x="14" y="92" width="172" height="22" fill="#ffd400"/>
  <text x="100" y="109" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="17" fill="#10131f">RIOT CONTROL // UNIT 07</text>
  <path d="M14 126 h8 v6 h-8z M26 126 h3 v6 h-3z M33 126 h10 v6 h-10z M47 126 h4 v6 h-4z M55 126 h7 v6 h-7z" fill="#fff"/></svg>`,
  { size: 384 },
);

const REAR = svg(
  `<svg viewBox="0 0 200 110"><rect width="200" height="110" fill="#1a1e2e"/><rect x="98" y="0" width="4" height="110" fill="#05060a"/>
  <rect x="6" y="6" width="88" height="98" fill="none" stroke="#2d3550" stroke-width="3"/><rect x="106" y="6" width="88" height="98" fill="none" stroke="#2d3550" stroke-width="3"/>
  <rect x="0" y="40" width="200" height="22" fill="#ffd400"/>
  <g fill="#10131f"><polygon points="0,62 14,40 28,40 14,62"/><polygon points="40,62 54,40 68,40 54,62"/><polygon points="80,62 94,40 108,40 94,62"/><polygon points="120,62 134,40 148,40 134,62"/><polygon points="160,62 174,40 188,40 174,62"/></g>
  <text x="100" y="26" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="15" fill="#19f3ff">KURO-TEC ENFORCEMENT</text>
  <text x="100" y="86" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#ff2bd6">CAUTION: HIGH-PRESSURE ORDNANCE</text>
  <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="9" fill="#9aa4c8">KEEP 10M // COMPLIANCE IS MANDATORY</text></svg>`,
  { size: 384 },
);

const GRILLE = svg(
  `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#090a10"/>
  ${[4, 11, 18, 25, 32].map((y, i) => `<rect x="6" y="${y}" width="108" height="3" fill="${i % 2 ? "#ff2bd6" : "#19f3ff"}" opacity="0.85"/>`).join("")}
  <rect x="55" y="0" width="10" height="40" fill="#090a10"/><polygon points="60,6 66,20 60,34 54,20" fill="#ff2bd6"/></svg>`,
  { size: 256 },
);

const HUB = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#161a28" stroke="#6d7690" stroke-width="3"/>
  ${[0, 60, 120, 180, 240, 300].map((a) => `<rect x="46" y="8" width="8" height="30" fill="#2d3550" transform="rotate(${a} 50 50)"/>`).join("")}
  <circle cx="50" cy="50" r="38" fill="none" stroke="#19f3ff" stroke-width="3"/><circle cx="50" cy="50" r="10" fill="#ff2bd6"/></svg>`,
  { size: 128 },
);

const TANK_LABEL = svg(
  `<svg viewBox="0 0 256 80"><rect width="256" height="80" fill="#1b2a3c"/><rect y="0" width="256" height="10" fill="#ffd400"/><rect y="70" width="256" height="10" fill="#ffd400"/>
  <path d="M30 18 Q44 40 30 58 Q16 40 30 18Z" fill="#19f3ff"/>
  <text x="140" y="42" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#ffffff">AQUA-SUPPRESS</text>
  <text x="140" y="60" text-anchor="middle" font-family="monospace" font-size="12" fill="#ff2bd6">12,000 L // 40 BAR</text></svg>`,
  { size: 384 },
);

const PLATE = svg(
  `<svg viewBox="0 0 80 30"><rect width="80" height="30" rx="3" fill="#e8e8f0"/><rect x="0" y="0" width="80" height="7" fill="#19f3ff"/>
  <text x="40" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#10131f">KT-0771</text></svg>`,
  { size: 128 },
);

const GAUGE = gaugeTexture({ needle: 70, label: "BAR" });

export default function build() {
  const b = createBuilder({ name: "riot_interceptor" });
  const chassis = b.joint("chassis", { at: [0, 1, 0] });
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.2, -0.45], dir: [0, 1, 0], role: "hinge" });
  const P0 = new THREE.Vector3(0, 2.64, -0.4);
  const P1 = new THREE.Vector3(0, 2.8, 1.05);
  const D = P1.clone().sub(P0).normalize();
  const cannon = b.joint("cannon", { parent: turret, at: P0, aim: P1, role: "hinge" });

  const rf = (z: number) => 2.25 - (0.1 * (z + 2.5)) / 3.55; // roof height at z
  const fz = (y: number) => 2.75 - 0.3 * (y - 0.8); // front face z at y
  const faceN: [number, number, number] = [0, 0.29, 0.96];
  const faceUp: [number, number, number] = [0, 0.96, -0.29];

  const box = (s: [number, number, number], color: any, at: [number, number, number], o: any = {}) =>
    b.part(new THREE.BoxGeometry(...s), color, { bone: chassis, at, flat: true, ...o });
  const neon = (s: [number, number, number], color: string, at: [number, number, number], k = 1.4, o: any = {}) =>
    glow(box(s, color, at, o), k);

  // ---------- hull ----------
  const HULL = panelled(
    paint((p, n) => {
      let c: any = n.y > 0.6 ? "#3a4260" : "#232839";
      if (p.y < 0.95) c = mix(c, "#0c0d14", 0.45 + 0.4 * noise(p, 0.3, 3));
      if (Math.abs(n.x) > 0.5 && p.y > 1.12 && p.y < 1.17) return "#ff2bd6";
      return c;
    }),
    { size: 0.5, aspect: 0.6, rivets: 0.1, seam: "#07080d" },
  );
  b.extrude(
    [
      [-2.6, 0.45],
      [2.6, 0.45],
      [2.75, 0.8],
      [2.6, 1.3],
      [1.7, 1.45],
      [1.05, 2.15],
      [-2.5, 2.25],
      [-2.65, 1.8],
      [-2.65, 0.8],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, bevel: 0.04, color: HULL, bone: chassis, name: "hull" },
  );

  // roof armor plate
  box([1.9, 0.06, 3.3], DARK, [0, rf(-0.8) + 0.02, -0.8], { rotation: [1.6, 0, 0] });

  // windshield
  const wsN = new THREE.Vector3(0, 0.65, 0.7).normalize();
  const wsMid = new THREE.Vector3(0, 1.8, 1.375).addScaledVector(wsN, 0.014);
  b.part(new THREE.PlaneGeometry(1.8, 0.95), "#ffffff", {
    bone: chassis, at: wsMid, dir: wsN, axis: "z", up: [0, 0.7, -0.65], texture: GLASS,
  });
  // visor frame
  box([1.9, 0.07, 0.1], DARK, [0, 2.17, 1.0], { rotation: [-47, 0, 0] });

  for (const s of [1, -1]) {
    // side windows
    b.part(new THREE.PlaneGeometry(0.85, 0.42), "#ffffff", {
      bone: chassis, at: [s * 1.014, 1.8, 0.62], dir: [s, 0, 0], axis: "z", texture: GLASS,
    });
    // door logo
    b.part(new THREE.PlaneGeometry(1.15, 0.8), "#ffffff", {
      bone: chassis, at: [s * 1.014, 1.62, -0.45], dir: [s, 0, 0], axis: "z", texture: DOOR_LOGO,
    });
    // neon side strips
    neon([0.03, 0.05, 4.2], NEON_C, [s * 1.012, 1.04, -0.2]);
    neon([0.03, 0.04, 3.4], NEON_M, [s * 1.012, 0.62, 0.1], 1.2);
    // data ticks
    for (let i = 0; i < 7; i++) neon([0.025, 0.12, 0.08], i % 2 ? NEON_C : YEL, [s * 1.012, 0.86, -1.9 + i * 0.28], 1.1);
    // fenders
    box([0.5, 0.13, 1.35], DARK, [s * 1.08, 1.06, 1.7]);
    box([0.5, 0.13, 1.35], DARK, [s * 1.08, 1.06, -1.7]);
    // mud flap
    box([0.4, 0.4, 0.04], BLACK, [s * 1.08, 0.5, -2.35]);
    // mirrors
    box([0.3, 0.04, 0.04], DARK, [s * 1.12, 1.88, 1.18]);
    box([0.07, 0.3, 0.2], "#262c42", [s * 1.28, 1.88, 1.2]);
    neon([0.02, 0.22, 0.03], NEON_C, [s * 1.28, 1.88, 1.31], 1.5);
    // underglow
    neon([0.1, 0.04, 4.4], NEON_M, [s * 0.82, 0.4, 0], 1.6);
    // headlights
    const hy = 1.08;
    glow(
      b.part(new THREE.BoxGeometry(0.62, 0.1, 0.06), "#e6fbff", {
        bone: chassis, at: [s * 0.78, hy, fz(hy) + 0.04], dir: faceN, axis: "z", up: faceUp, flat: true,
      }),
      1.8,
    );
    box([0.7, 0.18, 0.05], DARK, [s * 0.78, hy, fz(hy) + 0.02], { dir: faceN, axis: "z", up: faceUp });
    // fog / pursuit lights
    neon([0.14, 0.14, 0.06], NEON_M, [s * 1.0, 0.62, 2.62], 1.6);
    // tail lights
    neon([0.12, 0.8, 0.05], RED, [s * 0.95, 1.3, -2.69], 1.6);
    neon([0.5, 0.05, 0.05], NEON_M, [s * 0.55, 1.78, -2.66], 1.4);
    // spotlights on roof
    b.part(new THREE.CylinderGeometry(0.1, 0.07, 0.2, 8), DARK, {
      bone: chassis, at: [s * 0.8, 2.3, 0.35], dir: [0, 0.3, 1], flat: true,
    });
    glow(b.part(new THREE.CircleGeometry(0.085, 8), "#e8fbff", {
      bone: chassis, at: [s * 0.8, 2.32, 0.47], dir: [0, 0.3, 1], axis: "z",
    }), 2);
    // antenna
    b.rod([s * 0.9, 2.2, -2.3], [s * 0.9, 3.0, -2.35], 0.015, STEEL, { bone: chassis });
    neon([0.05, 0.05, 0.05], s > 0 ? RED : NEON_C, [s * 0.9, 3.02, -2.35], 2);
  }

  // front grille
  b.part(new THREE.PlaneGeometry(1.0, 0.36), "#ffffff", {
    bone: chassis, at: [0, 1.05, fz(1.05) + 0.03], dir: faceN, axis: "z", up: faceUp, texture: GRILLE,
  });
  // front skid / push bar
  b.extrude(
    [
      [2.45, 0.4],
      [3.0, 0.5],
      [3.0, 0.78],
      [2.7, 0.95],
      [2.45, 0.9],
    ],
    {
      at: [0, 0, 0], x: [0, 0, 1], thickness: 1.9, bevel: 0.03, bone: chassis, name: "pushbar",
      color: stripes(YEL, "#14141c", { size: 0.2, axis: "x", width: 0.5, wobble: 0 }),
    },
  );
  neon([1.5, 0.04, 0.04], NEON_C, [0, 0.46, 3.0], 1.5);
  box([0.1, 0.4, 0.1], STEEL, [0, 0.7, 3.0]);

  // rear bumper & plate
  box([2.0, 0.25, 0.2], DARK, [0, 0.57, -2.72]);
  b.part(new THREE.PlaneGeometry(0.4, 0.15), "#ffffff", {
    bone: chassis, at: [0, 0.57, -2.825], dir: [0, 0, -1], axis: "z", texture: PLATE,
  });
  // rear doors
  b.part(new THREE.PlaneGeometry(1.8, 0.99), "#ffffff", {
    bone: chassis, at: [0, 1.3, -2.668], dir: [0, 0, -1], axis: "z", texture: REAR,
  });
  // rear step
  box([1.4, 0.05, 0.3], STEEL, [0, 0.38, -2.7]);

  // ---------- roof light bar ----------
  box([1.95, 0.1, 0.32], DARK, [0, 2.23, 0.78]);
  const cols = [NEON_C, NEON_C, NEON_C, NEON_C, NEON_M, NEON_M, NEON_M, NEON_M];
  cols.forEach((c, i) => neon([0.22, 0.1, 0.28], c, [-0.8 + i * 0.228 + 0.0, 2.32, 0.78], 1.9));
  neon([1.9, 0.03, 0.03], "#ffffff", [0, 2.39, 0.9], 1.6);

  // ---------- water tank ----------
  const tankY = 2.57;
  const tank = b.part(new THREE.CylinderGeometry(0.38, 0.38, 1.3, 12), "#3b556f", {
    bone: chassis, at: [0, tankY, -1.75], dir: [0, 0, 1], flat: true,
  });
  for (const e of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.38, 12, 6), "#2f4760", {
      bone: chassis, at: [0, tankY, -1.75 + e * 0.65], scale: [1, 1, 0.4], flat: true,
    });
  }
  for (const z of [-2.2, -1.75, -1.3]) {
    b.part(new THREE.TorusGeometry(0.385, 0.028, 5, 14), STEEL, { bone: chassis, at: [0, tankY, z], flat: true });
  }
  box([0.9, 0.12, 1.5], DARK, [0, 2.26, -1.75]);
  for (const s of [1, -1]) {
    b.decal(tank, TANK_LABEL, { at: [s * 0.38, tankY, -1.75], dir: [s, 0, 0], size: [1.0, 0.33], bone: chassis });
  }
  neon([0.5, 0.04, 0.04], NEON_C, [0, tankY + 0.39, -1.75], 1.5);
  // hose tank → turret
  b.sweep(
    [
      [0.25, 2.5, -1.15],
      [0.5, 2.78, -0.95],
      [0.35, 2.75, -0.7],
      [0.15, 2.62, -0.55],
    ],
    0.045,
    { color: "#1c2030", bone: chassis, sides: 6 },
  );
  for (const t of [-0.95, -0.7]) b.part(new THREE.TorusGeometry(0.05, 0.015, 4, 6), YEL, { bone: chassis, at: [0.5 - (t + 0.95) * 0.6, 2.77, t] });

  // ---------- turret ----------
  b.part(new THREE.CylinderGeometry(0.42, 0.46, 0.14, 12), STEEL, { bone: turret, at: [0, rf(-0.45) + 0.07, -0.45], flat: true });
  b.part(new THREE.CylinderGeometry(0.36, 0.38, 0.12, 12), DARK, { bone: turret, at: [0, rf(-0.45) + 0.18, -0.45], flat: true });
  b.part(new THREE.BoxGeometry(0.64, 0.42, 0.8), "#2b3350", { bone: turret, at: [0, 2.5, -0.45], flat: true });
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.6), "#3a4260", { bone: turret, at: [0, 2.73, -0.45], flat: true });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.03, 0.06, 0.6), NEON_C, { bone: turret, at: [s * 0.33, 2.5, -0.45], flat: true }), 1.5);
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), STEEL, { bone: turret, at: [s * 0.35, 2.64, -0.4], dir: [1, 0, 0], flat: true });
  }
  b.part(new THREE.CircleGeometry(0.1, 16), "#ffffff", {
    bone: turret, at: [0.332, 2.46, -0.62], dir: [1, 0, 0], axis: "z", texture: GAUGE,
  });
  // sensor eye
  b.part(new THREE.SphereGeometry(0.07, 8, 6), DARK, { bone: turret, at: [0, 2.55, -0.04] });
  glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), RED, { bone: turret, at: [0, 2.55, 0.0] }), 2);

  // barrel
  const mid = lerp(P0, P1, 0.5);
  b.rod(P0, mid, 0.13, STEEL, { bone: cannon, sides: 8 });
  b.rod(mid, P1, 0.085, "#424b66", { bone: cannon, sides: 8 });
  for (const t of [0.12, 0.38, 0.62]) {
    glow(
      b.part(new THREE.TorusGeometry(t < 0.5 ? 0.135 : 0.1, 0.014, 4, 10), NEON_C, {
        bone: cannon, at: lerp(P0, P1, t), dir: D, axis: "z",
      }),
      1.6,
    );
  }
  // side feed pipes
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 2.6, -0.1], [s * 0.2, 2.72, 0.55], 0.03, "#8a93b0", { bone: cannon });
  }
  // nozzle
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.15, 0.08],
      [0.11, 0.2],
      [0.07, 0.3],
      [0.05, 0.3],
      [0, 0.28],
    ],
    { at: lerp(P0, P1, 0.96), axis: D, bone: cannon, color: "#2c3350", segments: 8, name: "nozzle" },
  );
  glow(
    b.part(new THREE.TorusGeometry(0.15, 0.018, 4, 10), NEON_M, {
      bone: cannon, at: lerp(P0, P1, 0.985), dir: D, axis: "z",
    }),
    2,
  );

  // ---------- wheels ----------
  for (const s of [1, -1]) {
    for (const zf of [1.7, -1.7]) {
      const nm = `wheel${s > 0 ? "L" : "R"}${zf > 0 ? "F" : "R"}`;
      const w = b.joint(nm, { parent: chassis, at: [s * 1.08, 0.52, zf], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.52, 0.52, 0.4, 14), "#15161c", {
        bone: w, at: [s * 1.08, 0.52, zf], dir: [1, 0, 0], flat: true,
      });
      b.part(new THREE.CircleGeometry(0.33, 12), "#ffffff", {
        bone: w, at: [s * 1.285, 0.52, zf], dir: [s, 0, 0], axis: "z", texture: HUB,
      });
      glow(
        b.part(new THREE.TorusGeometry(0.34, 0.018, 4, 14), NEON_C, {
          bone: w, at: [s * 1.287, 0.52, zf], dir: [s, 0, 0], axis: "z",
        }),
        1.6,
      );
      // lug nuts
      b.ring({ at: new THREE.Vector3(s * 1.29, 0.52, zf), axis: new THREE.Vector3(s, 0, 0) } as any, { count: 5, radius: 0.1 }, (it) =>
        b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 5), STEEL, { bone: w, at: it.at, dir: [s, 0, 0] }),
      );
    }
  }

  // skirt & underbody
  box([1.8, 0.1, 4.8], BLACK, [0, 0.42, 0]);

  return b.root;
}
