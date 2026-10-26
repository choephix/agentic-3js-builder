import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Neon Vector Arcade Cabinet",
  description: "A chunky 1980s synthwave arcade cabinet with a glowing marquee, CRT screen, control deck, joystick, buttons, coin door, speakers, and magenta/cyan neon trim.",
};

export default function build() {
  const b = createBuilder({ name: "neonVectorArcade", detail: 1 });

  const BLACK = "#100c24";
  const DEEP = "#17133b";
  const PURPLE = "#322067";
  const VIOLET = "#6d2fb5";
  const MAGENTA = "#ff2fa8";
  const CYAN = "#19e6ff";
  const BLUE = "#416dff";
  const YELLOW = "#ffe75c";
  const ORANGE = "#ff7438";
  const RED = "#ff315e";
  const WHITE = "#fff4ff";
  const METAL = "#7775a5";
  const DARKMETAL = "#282541";

  const neonScreen = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#081448"/>
          <stop offset="0.55" stop-color="#15105a"/>
          <stop offset="1" stop-color="#270b47"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff566"/>
          <stop offset="1" stop-color="#ff4b93"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#bg)"/>
      <circle cx="160" cy="105" r="48" fill="url(#sun)" stroke="#ffb8f4" stroke-width="3"/>
      <g stroke="#ff83dc" stroke-width="2" opacity=".8">
        <path d="M48 164H272"/><path d="M58 174H262"/><path d="M68 184H252"/>
        <path d="M78 194H242"/><path d="M88 204H232"/>
      </g>
      <g stroke="#24dcff" stroke-width="2" opacity=".9">
        <path d="M160 156L20 220"/><path d="M160 156L70 220"/>
        <path d="M160 156L110 220"/><path d="M160 156L210 220"/>
        <path d="M160 156L250 220"/><path d="M160 156L300 220"/>
      </g>
      <path d="M0 150 L50 132 L84 143 L121 116 L155 128 L191 97 L225 118 L270 88 L320 102 L320 151 L0 151Z"
        fill="#130d35" stroke="#b82cff" stroke-width="4"/>
      <path d="M18 34 L42 17 L56 34 L82 9 L99 31 L125 13 L145 34 L174 8 L194 34 L222 12 L243 34 L276 8 L300 32"
        fill="none" stroke="#28eaff" stroke-width="4"/>
      <text x="160" y="71" text-anchor="middle" fill="#ffffff" stroke="#ff2fa8" stroke-width="2"
        paint-order="stroke" font-family="sans-serif" font-size="24" font-weight="bold">VECTOR</text>
    </svg>`, { size: 512 });

  const marqueeTex = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 110">
      <defs><linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#ff2fa8"/><stop offset=".48" stop-color="#7137d8"/><stop offset="1" stop-color="#13e7ff"/>
      </linearGradient></defs>
      <rect width="500" height="110" rx="14" fill="#160d3b" stroke="#28eaff" stroke-width="8"/>
      <text x="250" y="75" text-anchor="middle" font-family="sans-serif" font-weight="bold"
        font-size="56" fill="url(#m)" stroke="#fff1ff" stroke-width="2" paint-order="stroke">NEON VECTOR</text>
    </svg>`, { size: 512 });

  const coinTex = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">
      <rect x="4" y="4" width="92" height="122" rx="10" fill="#17152d" stroke="#ff2fa8" stroke-width="5"/>
      <circle cx="50" cy="48" r="20" fill="#ffda55" stroke="#fff2a1" stroke-width="4"/>
      <path d="M37 48h26M50 35v26" stroke="#a34291" stroke-width="4"/>
      <text x="50" y="101" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#19e6ff">INSERT</text>
    </svg>`, { size: 256 });

  const cabinet = b.joint("cabinet", { at: [0, 0, 0], dir: [0, 1, 0], role: "spine" });

  function box(size: [number, number, number], at: [number, number, number], color: any, name: string, bevel = 0) {
    const geo = new THREE.BoxGeometry(...size);
    return b.part(geo, color, { bone: cabinet, at, name, flat: true });
  }

  function cyl(radius: number, height: number, at: [number, number, number], color: any, name: string, radial = 10, dir: [number, number, number] = [0, 1, 0]) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      bone: cabinet, at, dir, name, flat: true,
    });
  }

  // Heavy cabinet shell: two blocky sections create the unmistakable arcade profile.
  box([0.78, 0.92, 0.58], [0, 0.49, 0], DEEP, "lowerCabinet");
  box([0.78, 0.72, 0.58], [0, 1.31, -0.015], PURPLE, "upperCabinet");
  box([0.78, 0.15, 0.60], [0, 1.735, -0.005], BLACK, "topCap");
  box([0.84, 0.08, 0.64], [0, 0.055, 0], BLACK, "footPlinth");

  // Slightly raised side cheeks emphasize the wedge silhouette.
  for (const s of [-1, 1]) {
    box([0.035, 1.48, 0.06], [s * 0.405, 0.82, 0.02], BLACK, `sideCheek${s}`);
    b.rod(
      [s * 0.424, 0.18, 0.28],
      [s * 0.424, 1.58, 0.27],
      0.012,
      { color: s > 0 ? MAGENTA : CYAN, bone: cabinet, caps: "round", name: `neonSide${s}` },
    );
    b.rod(
      [s * 0.424, 0.18, -0.25],
      [s * 0.424, 1.58, -0.24],
      0.009,
      { color: s > 0 ? CYAN : MAGENTA, bone: cabinet, caps: "round", name: `rearSideGlow${s}` },
    );
  }

  // Monitor bezel and glowing CRT image, facing +Z.
  box([0.64, 0.49, 0.055], [0, 1.37, 0.292], BLACK, "monitorBezel");
  const screen = b.part(new THREE.PlaneGeometry(0.535, 0.355), WHITE, {
    bone: cabinet,
    at: [0, 1.385, 0.326],
    dir: [0, 0, 1],
    axis: "z",
    texture: neonScreen,
    name: "crtScreen",
  });
  glow(screen, 1.8);

  // CRT glass corners / scanline-like horizontal neon bars.
  for (let i = 0; i < 5; i++) {
    const line = b.part(new THREE.BoxGeometry(0.48, 0.004, 0.006), "#bcefff", {
      bone: cabinet,
      at: [0, 1.24 + i * 0.065, 0.337],
      name: `scanline${i}`,
    });
    glow(line, 0.45);
  }

  // Marquee hood and sign.
  box([0.72, 0.205, 0.075], [0, 1.725, 0.30], BLACK, "marqueeHood");
  const marquee = b.part(new THREE.PlaneGeometry(0.65, 0.143), WHITE, {
    bone: cabinet,
    at: [0, 1.73, 0.345],
    dir: [0, 0, 1],
    axis: "z",
    texture: marqueeTex,
    name: "glowingMarquee",
  });
  glow(marquee, 2.2);

  // Control deck, angled visually with layered slabs.
  box([0.80, 0.10, 0.32], [0, 0.94, 0.315], BLACK, "controlDeck");
  box([0.74, 0.035, 0.28], [0, 0.995, 0.34], VIOLET, "controlDeckInset");
  b.rod([-0.35, 1.02, 0.475], [0.35, 1.02, 0.475], 0.012, {
    color: CYAN, bone: cabinet, name: "deckFrontNeon",
  });

  // Joystick: black stalk, chrome collar, magenta ball.
  cyl(0.037, 0.025, [-0.20, 1.035, 0.315], METAL, "joystickCollar", 12);
  cyl(0.016, 0.14, [-0.20, 1.105, 0.315], DARKMETAL, "joystickStem", 8);
  const stickBall = b.part(new THREE.SphereGeometry(0.052, 10, 6), MAGENTA, {
    bone: cabinet, at: [-0.20, 1.18, 0.315], name: "joystickBall", flat: true,
  });
  glow(stickBall, 1.4);

  // Six bright arcade buttons.
  const buttonColors = [CYAN, MAGENTA, YELLOW, ORANGE, BLUE, RED];
  for (let i = 0; i < 6; i++) {
    const x = 0.02 + (i % 3) * 0.075;
    const z = 0.305 + Math.floor(i / 3) * 0.085;
    const button = b.part(new THREE.CylinderGeometry(0.027, 0.031, 0.018, 10), buttonColors[i], {
      bone: cabinet, at: [x, 1.045, z], name: `button${i + 1}`, flat: true,
    });
    glow(button, 1.25);
    cyl(0.034, 0.006, [x, 1.032, z], BLACK, `buttonRing${i + 1}`, 10);
  }

  // Small start/select buttons on the left.
  for (let i = 0; i < 2; i++) {
    const button = b.part(new THREE.CylinderGeometry(0.018, 0.021, 0.014, 8), i ? YELLOW : CYAN, {
      bone: cabinet, at: [-0.31 + i * 0.07, 1.045, 0.40], name: `smallButton${i}`, flat: true,
    });
    glow(button, 1.1);
  }

  // Coin door with a glowing coin graphic.
  box([0.26, 0.32, 0.025], [0, 0.44, 0.304], BLACK, "coinDoor");
  const coin = b.part(new THREE.PlaneGeometry(0.16, 0.208), WHITE, {
    bone: cabinet,
    at: [0, 0.44, 0.323],
    dir: [0, 0, 1],
    axis: "z",
    texture: coinTex,
    name: "coinSlotGraphic",
  });
  glow(coin, 0.7);
  box([0.075, 0.018, 0.012], [0, 0.545, 0.341], METAL, "coinSlot");
  for (const x of [-0.095, 0.095]) {
    cyl(0.012, 0.018, [x, 0.30, 0.335], METAL, `doorRivet${x}`, 8, [0, 0, 1]);
  }

  // Speaker grille: five cyan bars and two magenta woofer rings.
  for (let i = 0; i < 5; i++) {
    const bar = b.part(new THREE.BoxGeometry(0.025, 0.16, 0.012), CYAN, {
      bone: cabinet, at: [-0.27 + i * 0.07, 0.68, 0.315], name: `speakerBar${i}`,
    });
    glow(bar, 0.65);
  }
  for (const x of [-0.20, 0.20]) {
    const ring = b.part(new THREE.TorusGeometry(0.075, 0.009, 6, 16), MAGENTA, {
      bone: cabinet, at: [x, 0.72, 0.32], dir: [0, 0, 1], name: `speakerRing${x}`, flat: true,
    });
    glow(ring, 0.8);
    cyl(0.045, 0.012, [x, 0.72, 0.326], BLACK, `speakerCone${x}`, 12, [0, 0, 1]);
  }

  // Tiny status lamps and a checkerboard lower trim.
  for (let i = 0; i < 8; i++) {
    const lamp = b.part(new THREE.SphereGeometry(0.012, 7, 5), i % 2 ? MAGENTA : CYAN, {
      bone: cabinet, at: [-0.28 + i * 0.08, 0.17, 0.305], name: `statusLamp${i}`,
    });
    glow(lamp, 1.4);
  }
  for (let i = 0; i < 9; i++) {
    box([0.07, 0.035, 0.018], [-0.28 + i * 0.07, 0.095, 0.33], i % 2 ? MAGENTA : CYAN, `baseStripe${i}`);
  }

  // Corner bolts and bright cabinet feet.
  for (const s of [-1, 1]) {
    for (const y of [0.16, 0.86, 1.58]) {
      const bolt = b.part(new THREE.SphereGeometry(0.018, 8, 5), YELLOW, {
        bone: cabinet, at: [s * 0.39, y, 0.325], name: `cornerBolt${s}${y}`, flat: true,
      });
      glow(bolt, 0.75);
    }
    cyl(0.045, 0.025, [s * 0.27, 0.035, 0], MAGENTA, `foot${s}`, 8);
  }

  return b.root;
}
