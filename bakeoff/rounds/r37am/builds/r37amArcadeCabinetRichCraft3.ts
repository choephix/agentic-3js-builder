import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "synthwave arcade cabinet",
  description: "A stylized 1980s upright arcade cabinet with neon trim, glowing marquee, CRT game screen, joystick, buttons, coin door, speakers, and retro side art.",
};

export default function build() {
  const b = createBuilder({ name: "synthwaveArcade", detail: 1 });

  const INK = "#120d25";
  const BODY = "#24143f";
  const BODY_DARK = "#180d2e";
  const EDGE = "#42206b";
  const MAGENTA = "#ff2bbd";
  const PINK = "#ff5ce1";
  const CYAN = "#24e7ff";
  const BLUE = "#236dff";
  const PURPLE = "#7138d5";
  const GOLD = "#ffb52e";
  const CREAM = "#ffe8bd";
  const RED = "#ff315b";
  const BLACK = "#05030d";
  const METAL = "#77728d";

  const marqueeTexture = svg(
    `<svg viewBox="0 0 640 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x2="0" y2="1">
          <stop stop-color="#30116b"/>
          <stop offset=".52" stop-color="#130b37"/>
          <stop offset="1" stop-color="#07051a"/>
        </linearGradient>
        <linearGradient id="hot" x2="0" y2="1">
          <stop stop-color="#fff"/>
          <stop offset=".35" stop-color="#ff9bf2"/>
          <stop offset="1" stop-color="#ff1bb7"/>
        </linearGradient>
      </defs>
      <rect width="640" height="180" rx="12" fill="url(#bg)" stroke="#24e7ff" stroke-width="7"/>
      <path d="M0 145 Q150 100 300 144 T640 130" fill="none" stroke="#ff2bbd" stroke-width="4" opacity=".8"/>
      <path d="M0 157 Q160 112 310 154 T640 142" fill="none" stroke="#7138d5" stroke-width="3"/>
      <text x="320" y="93" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="62" letter-spacing="6" fill="#30105a" stroke="#ff2bbd" stroke-width="9" paint-order="stroke">NEON</text>
      <text x="320" y="93" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="62" letter-spacing="6" fill="url(#hot)">NEON</text>
      <text x="320" y="133" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" letter-spacing="9" fill="#24e7ff">NIGHT DRIVE</text>
      <circle cx="54" cy="46" r="4" fill="#fff"/><circle cx="588" cy="35" r="3" fill="#fff"/>
    </svg>`,
    { size: 512 },
  );

  const screenTexture = svg(
    `<svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stop-color="#160c52"/><stop offset=".62" stop-color="#32106e"/><stop offset="1" stop-color="#ed247f"/>
        </linearGradient>
        <linearGradient id="road" x2="0" y2="1">
          <stop stop-color="#5c168c"/><stop offset="1" stop-color="#07051f"/>
        </linearGradient>
      </defs>
      <rect width="480" height="360" fill="url(#sky)"/>
      <circle cx="350" cy="118" r="64" fill="#ffbb38" opacity=".9"/>
      <path d="M0 220 L480 220 L480 360 L0 360Z" fill="url(#road)"/>
      <path d="M240 212 L240 360 M205 220 L118 360 M275 220 L362 360" stroke="#ff4ec9" stroke-width="5" opacity=".85"/>
      <path d="M0 265 H480 M0 305 H480 M0 338 H480" stroke="#3edfff" stroke-width="3" opacity=".7"/>
      <path d="M130 215 L190 155 L215 215 M270 215 L330 155 L355 215" fill="none" stroke="#24e7ff" stroke-width="5"/>
      <path d="M72 250 L408 250" stroke="#ffd34a" stroke-width="5"/>
      <path d="M185 305 L295 305" stroke="#fff" stroke-width="4"/>
      <text x="18" y="35" font-family="monospace" font-size="20" font-weight="bold" fill="#fff">SCORE 008840</text>
      <text x="350" y="35" font-family="monospace" font-size="18" fill="#24e7ff">1UP</text>
    </svg>`,
    { size: 512 },
  );

  const sideTexture = svg(
    `<svg viewBox="0 0 300 700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x2="1" y2="1">
          <stop stop-color="#180c3f"/><stop offset=".48" stop-color="#46118c"/><stop offset="1" stop-color="#0c1440"/>
        </linearGradient>
      </defs>
      <rect width="300" height="700" fill="url(#g)"/>
      <path d="M-40 530 L150 10 L185 10 L-5 530Z" fill="#ff2bbd" opacity=".72"/>
      <path d="M80 710 L270 130 L310 130 L120 710Z" fill="#24e7ff" opacity=".55"/>
      <path d="M-30 620 Q120 510 330 570" fill="none" stroke="#ffb52e" stroke-width="12"/>
      <path d="M-40 650 Q125 540 340 600" fill="none" stroke="#ff2bbd" stroke-width="7"/>
      <circle cx="222" cy="180" r="70" fill="none" stroke="#24e7ff" stroke-width="5"/>
      <circle cx="222" cy="180" r="45" fill="none" stroke="#ff2bbd" stroke-width="4"/>
      <path d="M222 115 L240 180 L222 245 L204 180Z" fill="#ffb52e"/>
      <text x="150" y="385" text-anchor="middle" transform="rotate(-19 150 385)" font-family="sans-serif" font-size="36" font-weight="900" fill="#fff" opacity=".92">NIGHT</text>
      <text x="150" y="428" text-anchor="middle" transform="rotate(-19 150 428)" font-family="sans-serif" font-size="35" font-weight="900" fill="#24e7ff">RIDER</text>
    </svg>`,
    { size: 512 },
  );

  const coinTexture = svg(
    `<svg viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="240" rx="15" fill="#171127" stroke="#ff2bbd" stroke-width="8"/>
      <rect x="30" y="36" width="120" height="112" rx="10" fill="#05030d" stroke="#77728d" stroke-width="6"/>
      <rect x="62" y="62" width="56" height="58" rx="26" fill="#ffb52e" stroke="#ffe8bd" stroke-width="5"/>
      <path d="M90 74 V106 M78 90 H102" stroke="#fff1a8" stroke-width="6"/>
      <text x="90" y="188" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="19" fill="#24e7ff">INSERT</text>
      <text x="90" y="212" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#ff5ce1">CREDIT</text>
    </svg>`,
    { size: 256 },
  );

  const speakerTexture = svg(
    `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="160" rx="18" fill="#090512" stroke="#24e7ff" stroke-width="6"/>
      <circle cx="80" cy="80" r="52" fill="#171126" stroke="#ff2bbd" stroke-width="6"/>
      <circle cx="80" cy="80" r="34" fill="#05030d" stroke="#7138d5" stroke-width="5"/>
      <circle cx="80" cy="80" r="15" fill="#24e7ff"/>
      <path d="M80 26 V48 M80 112 V134 M26 80 H48 M112 80 H134" stroke="#ffb52e" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const labelTexture = svg(
    `<svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="80" rx="10" fill="#0b0619" stroke="#7138d5" stroke-width="5"/>
      <text x="150" y="51" text-anchor="middle" font-family="monospace" font-size="25" font-weight="bold" letter-spacing="3" fill="#ffb52e">HIGH SCORE</text>
    </svg>`,
    { size: 256 },
  );

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => b.part(geometry, color, { at, flat: true, ...options });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => part(new THREE.BoxGeometry(...size), color, at, options);

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => part(new THREE.CylinderGeometry(radius, radius, height, 12), color, at, options);

  const neonRod = (a: [number, number, number], z: [number, number, number], color: string, r = 0.009) => {
    const rod = b.rod(a, z, r, { color, caps: "round", name: "neonTube" });
    glow(rod, 2.2);
    return rod;
  };

  // Main cabinet shell: chunky, dark, slightly taller than a real cabinet for a strong silhouette.
  box([0.78, 1.48, 0.58], BODY, [0, 0.84, 0]);
  box([0.82, 0.12, 0.62], BODY_DARK, [0, 1.61, -0.005]);
  box([0.78, 0.09, 0.60], EDGE, [0, 0.115, 0]);
  box([0.84, 0.07, 0.64], INK, [0, 0.055, 0]);

  // Heavy side art panels.
  for (const s of [-1, 1]) {
    part(new THREE.PlaneGeometry(0.5, 1.35), "#ffffff", [s * 0.397, 0.91, -0.015], {
      dir: [s, 0, 0],
      axis: "z",
      texture: sideTexture,
      name: s > 0 ? "sideArtL" : "sideArtR",
    });
    neonRod([s * 0.405, 0.18, 0.27], [s * 0.405, 1.55, 0.27], CYAN, 0.008);
    neonRod([s * 0.405, 0.18, -0.27], [s * 0.405, 1.55, -0.27], MAGENTA, 0.008);
  }

  // Front screen bezel and CRT glass.
  box([0.61, 0.57, 0.075], BLACK, [0, 1.38, 0.302]);
  box([0.53, 0.48, 0.02], "#160c2e", [0, 1.39, 0.345]);
  const screen = part(new THREE.PlaneGeometry(0.49, 0.38), "#ffffff", [0, 1.40, 0.358], {
    dir: [0, 0, 1],
    axis: "z",
    texture: screenTexture,
    name: "glowingCRTScreen",
  });
  glow(screen, 1.25);

  // Screen bezel corner bolts.
  for (const x of [-0.27, 0.27]) {
    for (const y of [1.15, 1.62]) {
      const bolt = cyl(0.014, 0.012, GOLD, [x, y, 0.35], { dir: [0, 0, 1], name: "bezelBolt" });
      glow(bolt, 0.5);
    }
  }

  // Angled control deck, with a dark underside and bright front lip.
  box([0.82, 0.18, 0.43], BODY_DARK, [0, 1.02, 0.31], { rotation: [-8, 0, 0] });
  box([0.84, 0.045, 0.44], EDGE, [0, 1.115, 0.31], { rotation: [-8, 0, 0] });
  neonRod([-0.38, 1.105, 0.49], [0.38, 1.105, 0.49], MAGENTA, 0.012);

  // Joystick shaft and arcade ball.
  cyl(0.018, 0.16, METAL, [0.19, 1.22, 0.36]);
  const ball = part(new THREE.SphereGeometry(0.055, 10, 7), MAGENTA, [0.19, 1.31, 0.36], { name: "joystickBall" });
  glow(ball, 1.4);
  cyl(0.072, 0.012, PURPLE, [0.19, 1.145, 0.36]);

  // Four candy-colored buttons.
  const buttonData: Array<[number, string]> = [
    [-0.13, CYAN],
    [-0.035, GOLD],
    [0.065, MAGENTA],
    [0.16, RED],
  ];
  for (const [x, c] of buttonData) {
    const button = cyl(0.035, 0.018, c, [x, 1.145, 0.39]);
    glow(button, 1.2);
    cyl(0.045, 0.008, INK, [x, 1.132, 0.39]);
  }

  // Tiny start/service buttons.
  for (const x of [-0.28, 0.28]) {
    const service = cyl(0.018, 0.014, CREAM, [x, 1.145, 0.24]);
    glow(service, 0.7);
  }

  // Marquee crown and illuminated marquee.
  box([0.82, 0.08, 0.61], BODY_DARK, [0, 1.69, 0]);
  box([0.86, 0.035, 0.63], CYAN, [0, 1.735, 0]);
  box([0.80, 0.23, 0.045], BLACK, [0, 1.82, 0.275]);
  const marquee = part(new THREE.PlaneGeometry(0.73, 0.205), "#ffffff", [0, 1.82, 0.305], {
    dir: [0, 0, 1],
    axis: "z",
    texture: marqueeTexture,
    name: "neonMarquee",
  });
  glow(marquee, 1.8);
  neonRod([-0.39, 1.69, 0.31], [0.39, 1.69, 0.31], MAGENTA, 0.011);
  neonRod([-0.39, 1.94, 0.31], [0.39, 1.94, 0.31], CYAN, 0.009);

  // Front coin door and lower fascia.
  box([0.48, 0.40, 0.035], INK, [0, 0.49, 0.302]);
  const coin = part(new THREE.PlaneGeometry(0.30, 0.39), "#ffffff", [0, 0.50, 0.325], {
    dir: [0, 0, 1],
    axis: "z",
    texture: coinTexture,
    name: "coinDoor",
  });
  glow(coin, 0.45);
  box([0.56, 0.045, 0.035], PURPLE, [0, 0.275, 0.33]);
  const label = part(new THREE.PlaneGeometry(0.40, 0.105), "#ffffff", [0, 0.29, 0.355], {
    dir: [0, 0, 1],
    axis: "z",
    texture: labelTexture,
    name: "highScoreLabel",
  });
  glow(label, 0.5);

  // Speaker cluster under the controls.
  for (const x of [-0.27, 0.27]) {
    const speaker = part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", [x, 0.84, 0.304], {
      dir: [0, 0, 1],
      axis: "z",
      texture: speakerTexture,
      name: "speakerGrille",
    });
    glow(speaker, 0.7);
  }

  // Cyan and magenta front edge accents.
  neonRod([-0.37, 0.18, 0.316], [-0.37, 1.58, 0.316], CYAN, 0.008);
  neonRod([0.37, 0.18, 0.316], [0.37, 1.58, 0.316], MAGENTA, 0.008);
  neonRod([-0.37, 0.18, 0.316], [0.37, 0.18, 0.316], BLUE, 0.008);

  // Four squat rubber feet, sunk just enough to meet the floor.
  for (const x of [-0.29, 0.29]) {
    for (const z of [-0.20, 0.20]) {
      cyl(0.055, 0.07, BLACK, [x, 0.035, z]);
      cyl(0.038, 0.012, METAL, [x, 0.075, z]);
    }
  }

  // Side bolts and decorative side stripes.
  for (const s of [-1, 1]) {
    for (const y of [0.18, 1.56]) {
      const bolt = cyl(0.017, 0.012, GOLD, [s * 0.414, y, 0.12], {
        dir: [s, 0, 0],
        name: "sideRivet",
      });
      glow(bolt, 0.7);
    }
    for (const z of [-0.21, -0.05, 0.11]) {
      neonRod([s * 0.414, 0.31, z], [s * 0.414, 0.55, z], z > 0 ? CYAN : MAGENTA, 0.005);
    }
  }

  return b.root;
}
