import * as THREE from "three";
import {
  createBuilder,
  mix,
  mottle,
  noise,
  paint,
  polyline,
  svg,
} from "../../../../src/index";
import type { Fill } from "../../../../src/index";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A richly ornamented piano accordion with iridescent mother-of-pearl cases, burgundy bellows, ivory keys, bass buttons, brass filigree, grillework, and leather straps.",
};

export default function build() {
  const b = createBuilder({ name: "italianMotherOfPearlAccordion", detail: 1 });

  const PEARL = paint((p, n) => {
    const cloud = noise(p, 0.085, 17);
    const ribbon = 0.5 + 0.5 * Math.sin(p.x * 52 + p.z * 31 + cloud * 5.5);
    const cool = mix("#fff3df", "#a8d9d6", cloud * 0.62);
    const pink = mix(cool, "#e7a6bf", ribbon * 0.24);
    const lit = 0.72 + 0.28 * Math.max(0, n.y * 0.7 + n.z * 0.3);
    return [pink[0] * lit, pink[1] * lit, pink[2] * lit];
  });

  const PEARL_DARK = mottle("#846a8b", "#c9d7d0", {
    size: 0.055,
    contrast: 1.35,
    seed: 21,
  });

  const BELLows = mottle("#241526", "#662442", {
    size: 0.06,
    contrast: 1.25,
    seed: 33,
  });

  const BELLows_EDGE = mottle("#8c3f58", "#d08a75", {
    size: 0.035,
    contrast: 1.4,
    seed: 34,
  });

  const GOLD = "#d4a64b";
  const GOLD_LIGHT = "#f4d781";
  const GOLD_DARK = "#67421f";
  const INK = "#17111d";
  const IVORY = "#fff2cf";
  const IVORY_SHADOW = "#d8c29e";
  const BLACK = "#17121a";
  const BURGUNDY = "#4b1c35";
  const BUTTON_PINK = "#d99ab1";
  const BUTTON_BLUE = "#8fc4c3";

  const pearlTile = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 420">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff4df"/>
          <stop offset=".24" stop-color="#b8e3d8"/>
          <stop offset=".48" stop-color="#ecd0e4"/>
          <stop offset=".72" stop-color="#a6c6df"/>
          <stop offset="1" stop-color="#ffe4c3"/>
        </linearGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".08"/>
          <stop offset=".45" stop-color="#ffffff" stop-opacity=".62"/>
          <stop offset=".56" stop-color="#ffffff" stop-opacity=".08"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity=".32"/>
        </linearGradient>
        <filter id="soft"><feTurbulence baseFrequency=".018" numOctaves="2" seed="8"/>
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0.05  0 0 1 0 0.08  0 0 0 .18 0"/>
          <feBlend in="SourceGraphic" mode="screen"/></filter>
      </defs>
      <rect width="256" height="420" fill="url(#bg)"/>
      <path d="M-30 110 C45 50 83 150 155 82 S252 53 286 10" fill="none" stroke="#ffffff" stroke-opacity=".46" stroke-width="18" filter="url(#soft)"/>
      <path d="M-20 292 C52 215 85 350 164 250 S247 236 280 174" fill="none" stroke="#f9ffff" stroke-opacity=".42" stroke-width="13"/>
      <path d="M20 410 C88 340 108 413 184 330 S246 334 280 280" fill="none" stroke="#d8ffff" stroke-opacity=".38" stroke-width="10"/>
      <path d="M0 0 L256 0 L256 420 L0 420Z" fill="url(#sheen)"/>
      <g fill="#f8df96" opacity=".8">
        <circle cx="37" cy="66" r="2"/><circle cx="204" cy="126" r="2.4"/><circle cx="92" cy="228" r="1.7"/>
        <circle cx="224" cy="318" r="1.8"/><circle cx="46" cy="372" r="2.3"/><circle cx="155" cy="44" r="1.5"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const rosette = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <defs>
        <radialGradient id="r" cx=".35" cy=".3">
          <stop offset="0" stop-color="#fffdf0"/>
          <stop offset=".35" stop-color="#d9f3e6"/>
          <stop offset=".72" stop-color="#d99fca"/>
          <stop offset="1" stop-color="#799cc3"/>
        </radialGradient>
      </defs>
      <circle cx="128" cy="128" r="124" fill="url(#r)" stroke="#5d351d" stroke-width="8"/>
      <g fill="none" stroke="#f7d77f" stroke-width="7" stroke-linecap="round">
        <path d="M128 25 C160 67 185 81 231 82 C185 105 170 128 171 181 C148 153 125 145 76 168 C95 130 91 102 57 71 C98 79 117 64 128 25Z"/>
        <path d="M128 231 C95 183 75 169 24 174 C70 145 82 119 78 74 C107 103 133 105 184 87 C157 121 164 153 199 189 C159 178 139 190 128 231Z"/>
      </g>
      <g fill="#fff7c5" stroke="#6a3a2b" stroke-width="4">
        <ellipse cx="128" cy="66" rx="13" ry="29"/>
        <ellipse cx="190" cy="99" rx="29" ry="13" transform="rotate(45 190 99)"/>
        <ellipse cx="183" cy="173" rx="13" ry="29" transform="rotate(90 183 173)"/>
        <ellipse cx="73" cy="167" rx="29" ry="13" transform="rotate(45 73 167)"/>
        <ellipse cx="73" cy="91" rx="13" ry="29" transform="rotate(45 73 91)"/>
      </g>
      <circle cx="128" cy="128" r="30" fill="#d9a64e" stroke="#6a3a2b" stroke-width="6"/>
      <circle cx="118" cy="116" r="9" fill="#fff2bc"/>
    </svg>`,
    { size: 256 },
  );

  const grille = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 150">
      <rect x="3" y="3" width="214" height="144" rx="16" fill="#241625" fill-opacity=".72" stroke="#edc870" stroke-width="6"/>
      <g fill="none" stroke="#efc96f" stroke-width="4">
        <path d="M18 75 C35 20 62 20 78 75 S122 130 140 75 S184 20 202 75"/>
        <path d="M18 75 C35 130 62 130 78 75 S122 20 140 75 S184 130 202 75"/>
        <path d="M44 16 Q110 75 176 16 M44 134 Q110 75 176 134"/>
      </g>
      <g fill="#fff0a4">
        <circle cx="44" cy="75" r="5"/><circle cx="110" cy="75" r="5"/><circle cx="176" cy="75" r="5"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const bellowsTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 360">
      <rect width="256" height="360" fill="#291626"/>
      <path d="M-50 0 L30 0 L306 280 L306 360 L226 360 Z" fill="#9a3e5b" opacity=".55"/>
      <path d="M-50 75 L5 20 L286 301 L231 356 Z" fill="#d38a72" opacity=".28"/>
      <path d="M42 -20 L102 -20 L282 160 L282 220 Z" fill="#f1bd83" opacity=".22"/>
      <path d="M-20 0 L256 276 M-20 72 L184 360 M67 0 L256 189 M150 0 L256 106"
        stroke="#f0bb83" stroke-width="8" opacity=".32"/>
      <path d="M0 20 L236 256 M0 100 L156 256 M83 0 L256 173 M170 0 L256 87"
        stroke="#140d17" stroke-width="5" opacity=".7"/>
    </svg>`,
    { size: 256 },
  );

  const labelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 70">
      <rect x="3" y="3" width="294" height="64" rx="18" fill="#4d1a35" stroke="#f1ce79" stroke-width="6"/>
      <path d="M22 35 H278" stroke="#d79c4a" stroke-width="2" stroke-dasharray="2 8"/>
      <text x="150" y="45" text-anchor="middle" font-family="serif" font-weight="bold"
        font-size="28" letter-spacing="5" fill="#ffeab0">VENEZIA</text>
    </svg>`,
    { size: 256 },
  );

  const buttonTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="58" fill="#fff0d3" stroke="#6a352b" stroke-width="7"/>
      <path d="M64 16 C75 43 86 52 112 64 C85 74 74 84 64 112 C53 85 41 75 16 64 C43 53 53 42 64 16Z"
        fill="#dba4bd" stroke="#f8dc91" stroke-width="4"/>
      <circle cx="64" cy="64" r="13" fill="#83bcbf"/>
    </svg>`,
    { size: 128 },
  );

  const box = (
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    color: ColorInput,
    name: string,
    texture?: THREE.Texture,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      texture,
      flat: true,
      name,
    });

  const plane = (
    size: readonly [number, number],
    at: readonly [number, number, number],
    color: ColorInput,
    name: string,
    texture?: THREE.Texture,
  ) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), color, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture,
      name,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: readonly [number, number, number],
    color: ColorInput,
    name: string,
    segments = 12,
    texture?: THREE.Texture,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir: [0, 0, 1],
      texture,
      flat: true,
      name,
    });

  const sphere = (
    radius: number,
    at: readonly [number, number, number],
    color: ColorInput,
    name: string,
    scale?: readonly [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      scale,
      flat: true,
      name,
    });

  // Main pearl cabinets. The two end boxes overlap the bellows slightly, as a real accordion's
  // bellows are recessed into the end frames.
  box([0.19, 0.62, 0.30], [-0.275, 0.325, 0], PEARL, "bassCase");
  box([0.19, 0.62, 0.30], [0.275, 0.325, 0], PEARL, "keyboardCase");

  // Iridescent front fields.
  plane([0.158, 0.565], [-0.275, 0.325, 0.158], "#ffffff", "bassPearlFace", pearlTile);
  plane([0.158, 0.565], [0.275, 0.325, 0.158], "#ffffff", "keyboardPearlFace", pearlTile);

  // Dark inset rims behind the front decoration.
  box([0.164, 0.572, 0.012], [-0.275, 0.325, 0.151], GOLD_DARK, "bassInset");
  box([0.164, 0.572, 0.012], [0.275, 0.325, 0.151], GOLD_DARK, "keyboardInset");
  plane([0.153, 0.555], [-0.275, 0.325, 0.166], "#ffffff", "bassInsetFace", pearlTile);
  plane([0.153, 0.555], [0.275, 0.325, 0.166], "#ffffff", "keyboardInsetFace", pearlTile);

  // Gold perimeter braid and corner hardware.
  for (const side of [-1, 1]) {
    const x = side * 0.275;
    box([0.157, 0.012, 0.018], [x, 0.052, 0.177], GOLD, `${side < 0 ? "bass" : "keyboard"}BottomBraid`);
    box([0.157, 0.012, 0.018], [x, 0.598, 0.177], GOLD_LIGHT, `${side < 0 ? "bass" : "keyboard"}TopBraid`);
    box([0.012, 0.54, 0.018], [x - 0.075, 0.325, 0.177], GOLD, `${side < 0 ? "bass" : "keyboard"}InnerBraid`);
    box([0.012, 0.54, 0.018], [x + 0.075, 0.325, 0.177], GOLD_LIGHT, `${side < 0 ? "bass" : "keyboard"}OuterBraid`);

    for (const yy of [0.075, 0.575]) {
      sphere(0.014, [x - 0.07, yy, 0.19], GOLD_LIGHT, `${side < 0 ? "bass" : "keyboard"}CornerA`);
      sphere(0.014, [x + 0.07, yy, 0.19], GOLD_LIGHT, `${side < 0 ? "bass" : "keyboard"}CornerB`);
    }
  }

  // The recessed burgundy bellows body.
  box([0.37, 0.55, 0.225], [0, 0.325, -0.005], BELLows, "bellowsCore");
  plane([0.35, 0.505], [0, 0.325, 0.116], "#ffffff", "bellowsFrontCloth", bellowsTexture);
  box([0.39, 0.025, 0.245], [0, 0.608, 0.005], BELLows_EDGE, "bellowsTopFrame");
  box([0.39, 0.025, 0.245], [0, 0.042, 0.005], BELLows_EDGE, "bellowsBottomFrame");

  // Vertical folds, alternating in depth and tone to make the pleated silhouette read from a distance.
  const foldXs = [-0.165, -0.124, -0.083, -0.042, 0, 0.042, 0.083, 0.124, 0.165];
  foldXs.forEach((x, i) => {
    const z = i % 2 === 0 ? 0.132 : 0.119;
    box(
      [0.014, 0.515, 0.028],
      [x, 0.325, z],
      i % 2 === 0 ? BELLows_EDGE : BURGUNDY,
      `bellowsFold${i}`,
    );
    box([0.006, 0.515, 0.008], [x + 0.008, 0.325, z + 0.016], GOLD_DARK, `bellowsFoldShadow${i}`);
  });

  // Zig-zag fold edges at three heights.
  for (const [j, y] of [0.105, 0.325, 0.545].entries()) {
    const points: number[][] = foldXs.map((x, i) => [x, y, i % 2 === 0 ? 0.151 : 0.137]);
    b.sweep(polyline(points), 0.005, {
      color: j === 1 ? GOLD_LIGHT : GOLD,
      caps: "round",
      name: `bellowsZigzag${j}`,
    });
  }

  // Bellows hinge bars and little brass end blocks.
  for (const side of [-1, 1]) {
    box([0.018, 0.54, 0.03], [side * 0.184, 0.325, 0.12], GOLD_DARK, `hingeBar${side}`);
    for (const yy of [0.075, 0.205, 0.335, 0.465, 0.575]) {
      cylinder(0.012, 0.018, [side * 0.184, yy, 0.141], GOLD_LIGHT, `hingePin${side}_${yy}`, 8);
    }
  }

  // Keyboard well and nine ivory piano keys.
  box([0.137, 0.435, 0.025], [0.277, 0.355, 0.173], BLACK, "keyboardWell");
  const keyY = [0.16, 0.208, 0.256, 0.304, 0.352, 0.4, 0.448, 0.496, 0.544];
  keyY.forEach((y, i) => {
    box([0.125, 0.043, 0.034], [0.274, y, 0.194], i % 3 === 0 ? IVORY : "#fff8df", `whiteKey${i}`);
    box([0.124, 0.004, 0.006], [0.274, y + 0.024, 0.213], IVORY_SHADOW, `keyGap${i}`);
  });

  // Raised black keys on the characteristic alternating pattern.
  [0.184, 0.28, 0.376, 0.472].forEach((y, i) => {
    box([0.074, 0.026, 0.044], [0.291, y, 0.217], BLACK, `blackKey${i}`);
    box([0.062, 0.006, 0.006], [0.291, y - 0.012, 0.241], GOLD_DARK, `blackKeyEdge${i}`);
  });
  box([0.014, 0.455, 0.025], [0.201, 0.355, 0.188], GOLD, "keyboardInnerRail");
  box([0.014, 0.455, 0.025], [0.349, 0.355, 0.188], GOLD_LIGHT, "keyboardOuterRail");

  // Decorative nameplate over the keyboard.
  plane([0.118, 0.027], [0.275, 0.592, 0.178], "#ffffff", "nameplate", labelTexture);
  box([0.132, 0.008, 0.012], [0.275, 0.574, 0.18], GOLD_DARK, "nameplateLowerMount");

  // Bass-button field: three columns and four rows with individual pearl caps.
  box([0.135, 0.39, 0.022], [-0.275, 0.345, 0.174], BURGUNDY, "bassButtonBed");
  const bassXs = [-0.322, -0.275, -0.228];
  const bassYs = [0.205, 0.305, 0.405, 0.505];
  bassYs.forEach((y, row) => {
    bassXs.forEach((x, col) => {
      const index = row * bassXs.length + col;
      cylinder(0.025, 0.009, [x, y, 0.19], GOLD_DARK, `bassButtonRing${index}`, 10);
      const capColor = (row + col) % 3 === 0 ? BUTTON_PINK : (row + col) % 3 === 1 ? BUTTON_BLUE : IVORY;
      sphere(0.018, [x, y, 0.198], capColor, `bassButtonCap${index}`, [1, 1, 0.46]);
      if (index === 1 || index === 7 || index === 10) {
        plane([0.023, 0.023], [x, y, 0.209], "#ffffff", `bassButtonMark${index}`, buttonTexture);
      }
    });
  });

  // Ornate grille above the bass buttons.
  plane([0.115, 0.078], [-0.275, 0.575, 0.178], "#ffffff", "bassGrille", grille);
  box([0.125, 0.009, 0.012], [-0.275, 0.527, 0.181], GOLD_DARK, "grilleLowerRail");

  // Two jewel-like rosettes: a large bass crest and a smaller keyboard crest.
  cylinder(0.067, 0.012, [-0.275, 0.586, 0.185], GOLD_DARK, "bassRosetteMount", 24);
  plane([0.118, 0.118], [-0.275, 0.586, 0.193], "#ffffff", "bassRosette", rosette);

  cylinder(0.043, 0.011, [0.275, 0.592, 0.185], GOLD_DARK, "keyboardRosetteMount", 20);
  plane([0.075, 0.075], [0.275, 0.592, 0.193], "#ffffff", "keyboardRosette", rosette);

  // Fine radial filigree around the large crest.
  const crestCenter: [number, number, number] = [-0.275, 0.586, 0.201];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const p0: [number, number, number] = [
      crestCenter[0] + Math.cos(a) * 0.041,
      crestCenter[1] + Math.sin(a) * 0.041,
      crestCenter[2],
    ];
    const p1: [number, number, number] = [
      crestCenter[0] + Math.cos(a + 0.18) * 0.059,
      crestCenter[1] + Math.sin(a + 0.18) * 0.059,
      crestCenter[2],
    ];
    b.rod(p0, p1, 0.0028, { color: GOLD_LIGHT, name: `crestFiligree${i}` });
  }

  // Mother-of-pearl leaf inlays in the four corners of each cabinet face.
  const leafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.026, 0.012, "sharp"],
    [0.040, 0.030, "sharp"],
    [0.012, 0.022, "sharp"],
  ];
  for (const side of [-1, 1]) {
    const x = side * 0.275;
    for (const [i, lx, ly] of [
      [0, 0, 0],
      [1, 1, 0],
      [2, 0, 1],
      [3, 1, 1],
    ] as const) {
      const xx = x + (i % 2 === 0 ? -0.058 : 0.032);
      const yy = 0.225 + (i >= 2 ? 0.22 : 0);
      b.extrude(leafOutline, {
        at: [xx, yy, 0.202],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0.002,
        color: i % 2 === 0 ? PEARL_DARK : GOLD_LIGHT,
        name: `${side < 0 ? "bass" : "keyboard"}Leaf${i}`,
      });
    }
  }

  // Gold studs framing the bellows and lower cabinets.
  for (const side of [-1, 1]) {
    for (const yy of [0.075, 0.16, 0.49, 0.575]) {
      sphere(0.009, [side * 0.182, yy, 0.158], GOLD_LIGHT, `frontStud${side}_${yy}`);
    }
  }

  // Rear shoulder straps, deliberately kept visible at the top and bottom silhouettes.
  box([0.042, 0.62, 0.018], [-0.105, 0.325, -0.17], BURGUNDY, "rearStrapLeft");
  box([0.042, 0.62, 0.018], [0.105, 0.325, -0.17], BURGUNDY, "rearStrapRight");
  box([0.28, 0.032, 0.02], [0, 0.625, -0.16], BURGUNDY, "rearStrapTopBridge");
  box([0.28, 0.032, 0.02], [0, 0.025, -0.16], BURGUNDY, "rearStrapBottomBridge");

  // Brass strap buckles peeking around the top edge.
  for (const x of [-0.105, 0.105]) {
    box([0.056, 0.068, 0.014], [x, 0.61, -0.174], GOLD_DARK, `strapBuckle${x}`);
    box([0.034, 0.043, 0.018], [x, 0.61, -0.183], GOLD, `strapBuckleInset${x}`);
  }

  // Four low feet let the instrument stand cleanly on the floor.
  for (const x of [-0.342, -0.208, 0.208, 0.342]) {
    box([0.038, 0.022, 0.18], [x, 0.011, 0], GOLD_DARK, `foot${x}`);
    sphere(0.018, [x, 0.012, 0.075], GOLD, `footCap${x}`, [1, 0.55, 1]);
  }

  return b.root;
}
