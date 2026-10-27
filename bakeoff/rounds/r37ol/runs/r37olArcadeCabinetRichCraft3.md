```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Neon Vector Arcade Cabinet",
  description: "A stylized 1980s synthwave arcade cabinet with glowing marquee, CRT screen, controls, coin door, neon trim, speakers, and chunky low-poly construction.",
};

export default function build() {
  const b = createBuilder({ name: "neonVectorArcade", detail: 1 });

  const INK = "#130d2b";
  const BODY = "#24134f";
  const BODY2 = "#351866";
  const EDGE = "#5d2794";
  const BLACK = "#090812";
  const DARK = "#111027";
  const MAGENTA = "#ff197f";
  const PINK = "#ff56c7";
  const CYAN = "#15eaff";
  const BLUE = "#287bff";
  const PURPLE = "#8e35ff";
  const YELLOW = "#ffd342";
  const ORANGE = "#ff7b25";
  const WHITE = "#f5f4ff";
  const METAL = "#a7a4c2";
  const METAL_DARK = "#4b4968";
  const GREEN = "#50ffb0";

  const marqueeTex = svg(
    `<svg viewBox="0 0 900 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x2="0" y2="1">
          <stop stop-color="#171040"/><stop offset=".48" stop-color="#5a118c"/><stop offset="1" stop-color="#ff197f"/>
        </linearGradient>
        <linearGradient id="letters" x2="0" y2="1">
          <stop stop-color="#ffffff"/><stop offset=".35" stop-color="#67faff"/><stop offset="1" stop-color="#ff32c8"/>
        </linearGradient>
        <filter id="g"><feGaussianBlur stdDeviation="8"/></filter>
      </defs>
      <rect width="900" height="240" fill="url(#bg)"/>
      <path d="M0 198 Q130 156 260 195 T520 190 T900 180" fill="none" stroke="#ffb4f0" stroke-width="3" opacity=".8"/>
      <path d="M0 213 Q160 170 310 207 T610 201 T900 197" fill="none" stroke="#24eaff" stroke-width="2" opacity=".8"/>
      <text x="450" y="137" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="104" font-style="italic" font-weight="900" fill="#ff28be" opacity=".8" filter="url(#g)">VECTOR</text>
      <text x="450" y="127" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="104" font-style="italic" font-weight="900" fill="url(#letters)" stroke="#27134f" stroke-width="8" paint-order="stroke">VECTOR</text>
      <text x="450" y="190" text-anchor="middle" font-family="monospace" font-size="25" letter-spacing="12" fill="#fff0a8">INSERT COIN</text>
      <circle cx="72" cy="65" r="3" fill="#fff"/><circle cx="815" cy="44" r="4" fill="#fff"/>
      <circle cx="760" cy="82" r="2" fill="#fff"/><circle cx="160" cy="32" r="2" fill="#fff"/>
    </svg>`,
    { size: 512 },
  );

  const screenTex = svg(
    `<svg viewBox="0 0 640 440" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" y2="1"><stop stop-color="#100d3c"/><stop offset=".62" stop-color="#27106b"/><stop offset="1" stop-color="#e22a92"/></linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>
      <rect width="640" height="440" fill="url(#sky)"/>
      <circle cx="470" cy="128" r="78" fill="#ff63c8" opacity=".75" filter="url(#blur)"/>
      <circle cx="470" cy="128" r="66" fill="#ffb04b"/>
      <path d="M0 295 L640 270 L640 440 L0 440Z" fill="#100c36"/>
      <path d="M0 340 L640 316 M0 382 L640 358 M0 422 L640 396" stroke="#ff2b9f" stroke-width="3"/>
      <path d="M95 440 L320 294 L355 294 L185 440 M545 440 L355 294 L382 294 L620 440" fill="none" stroke="#20eaff" stroke-width="3"/>
      <path d="M90 330 L260 310 L275 318 L105 338Z" fill="#1eeaff"/>
      <path d="M275 310 L520 287 L533 295 L290 319Z" fill="#ff2a9e"/>
      <text x="320" y="75" text-anchor="middle" font-family="monospace" font-size="28" fill="#bfffff">HIGH SCORE 1986</text>
      <text x="320" y="112" text-anchor="middle" font-family="monospace" font-size="18" fill="#fff">1UP 047300</text>
      <path d="M110 260 Q170 205 235 257 T360 250 T500 235" fill="none" stroke="#ffec72" stroke-width="6"/>
    </svg>`,
    { size: 512 },
  );

  const controlTex = svg(
    `<svg viewBox="0 0 800 180" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="p" y2="1"><stop stop-color="#5530a0"/><stop offset="1" stop-color="#21134c"/></linearGradient></defs>
      <rect width="800" height="180" rx="12" fill="url(#p)" stroke="#ff27ad" stroke-width="8"/>
      <path d="M25 145 H775" stroke="#1beaff" stroke-width="4"/>
      <text x="570" y="56" fill="#ffdc74" font-family="monospace" font-size="24">PLAYER ONE</text>
      <text x="570" y="88" fill="#a9faff" font-family="monospace" font-size="16">READY // SET // GO</text>
      <path d="M420 130 h280" stroke="#ff3dc0" stroke-width="3" stroke-dasharray="12 9"/>
    </svg>`,
    { size: 256 },
  );

  const sideDecal = svg(
    `<svg viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 10 L245 140 L185 500 L72 500 L12 140Z" fill="#32135f" stroke="#ff218e" stroke-width="8"/>
      <path d="M128 42 L215 151 L165 455 L91 455 L41 151Z" fill="none" stroke="#13eaff" stroke-width="5"/>
      <path d="M35 300 L222 200 M26 351 L211 252 M18 402 L201 303" stroke="#ffcf49" stroke-width="4" opacity=".75"/>
      <text x="128" y="255" text-anchor="middle" transform="rotate(-12 128 255)" fill="#ffffff" font-family="Arial Black" font-size="30">V</text>
    </svg>`,
    { size: 256 },
  );

  const speakerTex = svg(
    `<svg viewBox="0 0 160 240" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="240" rx="16" fill="#080817"/>
      <g stroke="#ff29a5" stroke-width="5">
        <path d="M20 35h120M20 62h120M20 89h120M20 116h120M20 143h120M20 170h120M20 197h120"/>
      </g>
      <g fill="#22eaff">
        <circle cx="35" cy="35" r="4"/><circle cx="125" cy="89" r="4"/><circle cx="50" cy="170" r="4"/><circle cx="110" cy="197" r="4"/>
      </g>
    </svg>`,
    { size: 128 },
  );

  const coinTex = svg(
    `<svg viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="300" rx="18" fill="#17152b" stroke="#8c84b8" stroke-width="8"/>
      <rect x="45" y="34" width="130" height="48" rx="8" fill="#4a496c"/>
      <rect x="62" y="47" width="96" height="17" rx="7" fill="#0c0b17"/>
      <circle cx="110" cy="143" r="42" fill="#dcae40" stroke="#fff0a0" stroke-width="6"/>
      <circle cx="110" cy="143" r="25" fill="#7d4b18"/>
      <path d="M110 125 v36 M94 143 h32" stroke="#ffe89a" stroke-width="6"/>
      <rect x="55" y="220" width="110" height="26" rx="8" fill="#29263f"/>
      <text x="110" y="276" text-anchor="middle" font-family="monospace" font-size="16" fill="#ff4fc0">COIN</text>
    </svg>`,
    { size: 192 },
  );

  const box = (size: [number, number, number], at: [number, number, number], color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, ...opts });

  const cyl = (r: number, h: number, at: [number, number, number], color: any, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, opts.segments ?? 12), color, { at, ...opts });

  const rod = (a: [number, number, number], c: [number, number, number], r: number, color: any) =>
    b.rod(a, c, r, { color, caps: "round" });

  // Main cabinet: chunky lower plinth and an upper CRT shell.
  box([0.82, 0.16, 0.74], [0, 0.08, 0], BLACK);
  box([0.76, 0.84, 0.68], [0, 0.54, -0.02], BODY, { flat: true });
  box([0.72, 0.52, 0.62], [0, 1.17, 0.015], BODY2, { rotation: [-7, 0, 0], flat: true });
  box([0.72, 0.21, 0.62], [0, 1.53, -0.01], EDGE, { rotation: [-7, 0, 0], flat: true });

  // Wide side cheek plates and their graphic decals.
  for (const s of [-1, 1]) {
    const side = box([0.035, 1.32, 0.69], [s * 0.405, 0.79, -0.01], BODY2, { flat: true });
    b.part(new THREE.PlaneGeometry(0.52, 1.02), WHITE, {
      at: [s * 0.428, 0.84, 0.02],
      dir: [s, 0, 0],
      axis: "z",
      rotation: [0, 0, s * 5],
      texture: sideDecal,
      bone: side.bone,
      name: `sideGraphic${s}`,
    });
    rod([s * 0.437, 0.15, 0.28], [s * 0.437, 1.45, 0.28], 0.012, CYAN);
    rod([s * 0.437, 0.15, -0.27], [s * 0.437, 1.45, -0.27], 0.012, MAGENTA);
    cyl(0.032, 0.025, [s * 0.437, 0.29, 0.19], YELLOW, { dir: [s, 0, 0], segments: 8 });
    cyl(0.032, 0.025, [s * 0.437, 0.29, -0.19], YELLOW, { dir: [s, 0, 0], segments: 8 });
  }

  // Front CRT bezel, inset screen, and scanline details.
  box([0.64, 0.49, 0.075], [0, 1.18, 0.343], BLACK, { rotation: [-7, 0, 0], flat: true });
  const screen = b.part(new THREE.PlaneGeometry(0.53, 0.345), WHITE, {
    at: [0, 1.19, 0.386],
    dir: [0, 0.12, 1],
    axis: "z",
    rotation: [-7, 0, 0],
    texture: screenTex,
    name: "glowingCRT",
  });
  glow(screen, 1.8);
  box([0.67, 0.035, 0.50], [0, 1.43, 0.385], EDGE, { rotation: [-7, 0, 0] });
  box([0.67, 0.035, 0.50], [0, 0.91, 0.32], EDGE, { rotation: [-7, 0, 0] });

  // Marquee crown.
  box([0.80, 0.23, 0.70], [0, 1.66, -0.005], BLACK, { rotation: [-3, 0, 0] });
  box([0.73, 0.18, 0.035], [0, 1.67, 0.355], WHITE, {
    dir: [0, 0.05, 1],
    axis: "z",
    rotation: [-3, 0, 0],
    texture: marqueeTex,
    name: "neonMarquee",
  });
  const marqueeGlow = b.part(new THREE.BoxGeometry(0.68, 0.015, 0.02), MAGENTA, {
    at: [0, 1.55, 0.36],
    rotation: [-3, 0, 0],
  });
  glow(marqueeGlow, 2);

  // Neon crown and cabinet outline.
  rod([-0.36, 1.79, 0.30], [0.36, 1.79, 0.30], 0.014, PINK);
  rod([-0.36, 1.79, 0.30], [-0.40, 1.56, 0.30], 0.014, CYAN);
  rod([0.36, 1.79, 0.30], [0.40, 1.56, 0.30], 0.014, CYAN);
  rod([-0.39, 0.17, 0.33], [-0.39, 1.55, 0.33], 0.012, MAGENTA);
  rod([0.39, 0.17, 0.33], [0.39, 1.55, 0.33], 0.012, MAGENTA);

  // Control deck, front lip, and printed panel.
  box([0.78, 0.12, 0.38], [0, 0.84, 0.45], BLACK, { rotation: [-12, 0, 0] });
  const panel = b.part(new THREE.PlaneGeometry(0.70, 0.275), WHITE, {
    at: [0, 0.90, 0.625],
    dir: [0, 0.20, 1],
    axis: "z",
    rotation: [-12, 0, 0],
    texture: controlTex,
    name: "controlPanelGraphic",
  });
  glow(panel, 0.4);
  box([0.78, 0.06, 0.13], [0, 0.75, 0.63], BODY2, { rotation: [-12, 0, 0] });
  rod([-0.38, 0.78, 0.70], [0.38, 0.78, 0.70], 0.012, CYAN);

  // Joystick shaft, ball, and base.
  cyl(0.055, 0.035, [-0.22, 0.95, 0.60], BLACK, { rotation: [-12, 0, 0], segments: 10 });
  rod([-0.22, 0.95, 0.60], [-0.22, 1.10, 0.61], 0.018, METAL);
  const ball = cyl(0.064, 0.11, [-0.22, 1.13, 0.615], MAGENTA, { segments: 12 });
  glow(ball, 1.2);
  cyl(0.055, 0.025, [-0.22, 0.96, 0.68], CYAN, { segments: 10 });

  // Three chunky illuminated buttons.
  const buttons: [number, string][] = [
    [-0.03, YELLOW],
    [0.10, PINK],
    [0.23, CYAN],
  ];
  for (const [x, col] of buttons) {
    const base = cyl(0.047, 0.025, [x, 0.96, 0.63], BLACK, { segments: 10 });
    const button = cyl(0.041, 0.035, [x, 0.985, 0.635], col, { segments: 12 });
    glow(button, 1.4);
    cyl(0.026, 0.006, [x, 1.006, 0.638], WHITE, { segments: 10 });
  }

  // Speaker panel under the controls.
  box([0.54, 0.28, 0.025], [0, 0.57, 0.348], BLACK);
  const speaker = b.part(new THREE.PlaneGeometry(0.42, 0.22), WHITE, {
    at: [0, 0.57, 0.365],
    dir: [0, 0, 1],
    axis: "z",
    texture: speakerTex,
    name: "speakerGrille",
  });
  glow(speaker, 0.35);
  for (const s of [-1, 1]) {
    rod([s * 0.27, 0.47, 0.37], [s * 0.27, 0.68, 0.37], 0.009, MAGENTA);
  }

  // Coin door, token slot, and chrome frame.
  box([0.34, 0.39, 0.035], [0, 0.31, 0.351], METAL_DARK);
  const coin = b.part(new THREE.PlaneGeometry(0.30, 0.34), WHITE, {
    at: [0, 0.31, 0.373],
    dir: [0, 0, 1],
    axis: "z",
    texture: coinTex,
    name: "coinDoor",
  });
  for (const x of [-0.18, 0.18]) {
    rod([x, 0.12, 0.378], [x, 0.50, 0.378], 0.009, CYAN);
  }
  rod([-0.18, 0.50, 0.378], [0.18, 0.50, 0.378], 0.009, CYAN);
  rod([-0.18, 0.12, 0.378], [0.18, 0.12, 0.378], 0.009, CYAN);

  // Coin return and status lights.
  box([0.25, 0.055, 0.055], [0, 0.105, 0.39], BLACK);
  for (const x of [-0.07, 0.07]) {
    const lamp = cyl(0.018, 0.012, [x, 0.16, 0.405], x < 0 ? MAGENTA : CYAN, { dir: [0, 0, 1], segments: 8 });
    glow(lamp, 1.8);
  }

  // Base trim, feet, bolts, and tiny service details.
  rod([-0.38, 0.16, 0.36], [0.38, 0.16, 0.36], 0.018, YELLOW);
  rod([-0.38, 0.16, -0.34], [0.38, 0.16, -0.34], 0.018, PURPLE);
  for (const x of [-0.31, 0.31]) {
    for (const z of [-0.27, 0.27]) {
      box([0.13, 0.08, 0.13], [x, 0.035, z], BLACK);
      cyl(0.018, 0.006, [x, 0.082, z], METAL, { segments: 8 });
    }
  }

  // Side-mounted decorative fins and rivets.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.09, 0.02],
        [0.14, 0.17],
        [0.06, 0.28],
        [0, 0.32],
      ],
      {
        at: [s * 0.43, 1.05, -0.16],
        x: [0, 0, 1],
        y: [s * 0.15, 1, 0],
        thickness: 0.018,
        bevel: 0.006,
        color: s > 0 ? CYAN : MAGENTA,
        name: `sideFin${s}`,
      },
    );
    for (const y of [0.26, 0.54, 0.82, 1.10, 1.38]) {
      cyl(0.014, 0.012, [s * 0.44, y, 0.27], YELLOW, { dir: [s, 0, 0], segments: 8 });
      cyl(0.014, 0.012, [s * 0.44, y, -0.27], YELLOW, { dir: [s, 0, 0], segments: 8 });
    }
  }

  // A few glowing indicator bars make the silhouette read in a dark room.
  for (const [x, col] of [
    [-0.30, MAGENTA],
    [-0.20, PURPLE],
    [0.20, CYAN],
    [0.30, BLUE],
  ] as [number, string][]) {
    const bar = box([0.045, 0.012, 0.012], [x, 1.56, 0.37], col);
    glow(bar, 1.6);
  }

  return b.root;
}
```