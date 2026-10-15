import * as THREE from "three";
import {
  createBuilder,
  svg,
  paint,
  grain,
  mix,
  noise,
  rng,
  catmull,
  bezier,
  frame,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Astral Atelier — Alchemist's Workbench",
  description:
    "An ornate fantasy apothecary workbench: carved walnut, teal lacquer and gilded starwork, luminous faceted potions, an illustrated herbal, brass balance scales, bound grimoires and drying herbs.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Astral Atelier", paintSize: 2048 });
  const root = b.joint("workbench", { at: [0, 0, 0] });
  const random = rng(713);
  type Fill = string | ReturnType<typeof paint>;
  type P = [number, number, number];

  const ink = "#202637";
  const darkWood = "#302839";
  const teal = "#226366";
  const tealLight = "#3e8d86";
  const cream = "#f2dfb2";
  const gold = metal("gilt", { tarnish: 0.12, polish: 0.6, size: 0.12 });
  const bronze = metal("bronze", { tarnish: 0.25, polish: 0.2 });
  const walnut = grain("#493247", "#78505a", {
    size: 0.035,
    axis: "y",
    seed: 21,
  });
  const boardGrain = grain("#67404c", "#a16c62", {
    size: 0.024,
    axis: "x",
    seed: 14,
  });
  const paper = paint((p, n) =>
    mix("#cdb582", "#f9eac4", 0.5 + 0.23 * n.y + noise(p, 0.05, 2) * 0.2),
  );
  const lacquer = paint((_p, n) =>
    n.y > 0.35 ? "#448d83" : n.z > 0.5 ? "#296c6a" : "#234851",
  );

  function box(
    name: string,
    at: P,
    size: P,
    color: Fill,
    rotation: P = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function ball(name: string, at: P, size: P, color: Fill) {
    return b.part(new THREE.SphereGeometry(1, 8, 6), color, {
      at,
      scale: size,
      bone: root,
      flat: true,
      name,
    });
  }

  function rod(name: string, a: P, c: P, r: number, color: Fill) {
    return b.rod(a, c, r, {
      color,
      bone: root,
      sides: 6,
      name,
    });
  }

  function linework(name: string, pts: P[], r: number, color: Fill) {
    return b.sweep(catmull(pts), r, {
      color,
      sides: 6,
      bone: root,
      name,
    });
  }

  function disc(
    name: string,
    at: P,
    radius: number,
    thickness: number,
    color: Fill,
    dir: P = [0, 1, 0],
    segments = 12,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, thickness, segments),
      color,
      { at, dir, bone: root, name },
    );
  }

  function diamond(name: string, at: P, w: number, h: number, color: Fill) {
    return b.extrude(
      [[0, h / 2], [w / 2, 0], [0, -h / 2], [-w / 2, 0]],
      {
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color,
        bone: root,
        name,
      },
    );
  }

  function frontDrawing(
    name: string,
    texture: THREE.Texture,
    at: P,
    w: number,
    h: number,
  ) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture,
      bone: root,
      name,
    });
  }

  const panelTexture = svg(`
    <svg viewBox="0 0 320 100">
      <g fill="none" stroke="#ddb975" stroke-width="3">
        <path d="M12 50 Q45 15 78 50 Q111 85 144 50
                 Q160 22 176 50 Q209 85 242 50 Q275 15 308 50"/>
        <path d="M12 50 Q45 85 78 50 Q111 15 144 50
                 M176 50 Q209 15 242 50 Q275 85 308 50"/>
        <path d="M20 12 H140 M180 12 H300 M20 88 H140 M180 88 H300"/>
      </g>
      <path d="M160 12 L176 50 L160 88 L144 50 Z" fill="#f9dea0"/>
      <path d="M160 31 L167 50 L160 69 L153 50 Z" fill="#26696c"/>
      <g fill="#edd095">
        <path d="M48 50 Q34 23 23 32 Q25 47 48 50"/>
        <path d="M272 50 Q286 23 297 32 Q295 47 272 50"/>
      </g>
    </svg>`, { size: 512 });

  const labelTexture = svg(`
    <svg viewBox="0 0 120 150">
      <path d="M19 7 H101 L112 23 V125 L99 141 H21 L8 125 V23Z"
        fill="#ead8aa" stroke="#463b53" stroke-width="5"/>
      <path d="M24 16 H96 L102 28 V119 L93 132 H27 L18 119 V28Z"
        fill="none" stroke="#b08a50" stroke-width="2"/>
      <path d="M60 27 L80 58 L60 89 L40 58Z" fill="#296d70"/>
      <path d="M60 39 L70 58 L60 76 L50 58Z" fill="#f8e5af"/>
      <path d="M35 98 H85 M41 106 H79 M47 114 H73"
        stroke="#63506a" stroke-width="3"/>
      <circle cx="30" cy="58" r="3" fill="#b4894a"/>
      <circle cx="90" cy="58" r="3" fill="#b4894a"/>
    </svg>`, { size: 256 });

  const sealTexture = svg(`
    <svg viewBox="0 0 200 200">
      <g fill="none" stroke="#e9c581" stroke-width="3">
        <circle cx="100" cy="100" r="88"/>
        <circle cx="100" cy="100" r="76"/>
        <path d="M100 13 L122 77 L187 100 L122 123 L100 187 L78 123 L13 100 L78 77Z"/>
        <path d="M100 46 L147 128 H53Z"/>
        <circle cx="100" cy="100" r="26"/>
        <path d="M41 41 L55 55 M159 41 L145 55 M41 159 L55 145 M159 159 L145 145"/>
      </g>
      <path d="M100 76 L115 100 L100 124 L85 100Z" fill="#f6dda0"/>
      <g fill="#e9c581">
        <circle cx="100" cy="21" r="4"/><circle cx="179" cy="100" r="4"/>
        <circle cx="100" cy="179" r="4"/><circle cx="21" cy="100" r="4"/>
      </g>
    </svg>`, { size: 384 });

  const spineTexture = svg(`
    <svg viewBox="0 0 80 220">
      <g fill="none" stroke="#efd193" stroke-width="3">
        <path d="M8 8 H72 V212 H8Z M15 18 H65 M15 202 H65"/>
        <path d="M40 39 L54 62 L40 85 L26 62Z"/>
        <path d="M22 111 H58 M22 124 H58 M28 137 H52"/>
        <path d="M26 175 Q40 150 54 175 Q40 197 26 175Z"/>
      </g>
      <path d="M40 49 L47 62 L40 75 L33 62Z" fill="#efd193"/>
    </svg>`, { size: 256 });

  const herbPage = svg(`
    <svg viewBox="0 0 240 320">
      <rect width="240" height="320" fill="#f3e4bf"/>
      <path d="M15 15 H225 V305 H15Z M22 22 H218 V298 H22Z"
        fill="none" stroke="#bba071" stroke-width="2"/>
      <text x="120" y="43" text-anchor="middle" font-family="serif"
        font-size="17" fill="#4c4952">FLORA LUNARIS</text>
      <path d="M43 55 H197" stroke="#b59964" stroke-width="2"/>
      <g fill="none" stroke="#49736a" stroke-width="3">
        <path d="M115 224 Q132 158 107 80 M120 181 Q85 167 72 140
          M123 157 Q153 136 165 104 M115 130 Q91 120 82 99"/>
      </g>
      <g fill="#6b9280" stroke="#3f6962" stroke-width="2">
        <path d="M118 176 Q70 178 67 139 Q101 143 118 176"/>
        <path d="M124 156 Q130 111 167 102 Q167 140 124 156"/>
        <path d="M114 130 Q75 128 79 94 Q108 100 114 130"/>
        <path d="M111 103 Q92 79 109 64 Q129 79 111 103"/>
      </g>
      <g fill="#b79bc6" stroke="#746386" stroke-width="2">
        <path d="M165 104 Q143 89 155 75 Q170 81 170 96
          Q175 73 188 80 Q190 98 165 104Z"/>
        <path d="M72 140 Q51 130 58 116 Q74 117 77 132
          Q79 115 91 119 Q92 136 72 140Z"/>
      </g>
      <g stroke="#9d8870" stroke-width="2" fill="none">
        <path d="M149 169 H197 M82 196 H40 M129 86 H195"/>
        <path d="M39 246 H199 M39 257 H188 M39 268 H199 M39 279 H171"/>
      </g>
      <text x="185" y="163" font-family="serif" font-size="11" fill="#776585">III</text>
      <text x="116" y="295" font-family="serif" font-size="10" fill="#8f795c">24</text>
    </svg>`, { size: 512 });

  const formulaPage = svg(`
    <svg viewBox="0 0 240 320">
      <rect width="240" height="320" fill="#f3e4bf"/>
      <path d="M15 15 H225 V305 H15Z M22 22 H218 V298 H22Z"
        fill="none" stroke="#bba071" stroke-width="2"/>
      <text x="120" y="43" text-anchor="middle" font-family="serif"
        font-size="17" fill="#4c4952">TRANSMUTATIO</text>
      <g fill="none" stroke="#77708b" stroke-width="2.5">
        <circle cx="120" cy="134" r="65"/>
        <circle cx="120" cy="134" r="56"/>
        <path d="M120 72 L173 165 H67Z M120 196 L67 103 H173Z"/>
        <circle cx="120" cy="134" r="24"/>
        <path d="M120 110 V158 M96 134 H144"/>
      </g>
      <g fill="#b79b62">
        <circle cx="120" cy="69" r="5"/><circle cx="176" cy="166" r="5"/>
        <circle cx="64" cy="166" r="5"/>
      </g>
      <g fill="none" stroke="#8e7c67" stroke-width="2">
        <path d="M39 222 H199 M39 234 H174 M39 246 H199 M39 258 H183"/>
        <path d="M48 279 H78 M64 273 V285 M103 279 H134 M118 273 V285
          M158 279 H190 M170 272 L180 286"/>
      </g>
      <text x="116" y="295" font-family="serif" font-size="10" fill="#8f795c">25</text>
    </svg>`, { size: 512 });

  const leafTexture = svg(`
    <svg viewBox="0 0 72 128">
      <path d="M35 125 Q4 99 9 61 Q15 25 38 4 Q67 38 63 69 Q61 104 35 125Z"
        fill="#709b79" stroke="#2e6260" stroke-width="4"/>
      <path d="M35 120 Q38 69 38 13 M37 85 L17 65 M37 67 L55 46
        M36 102 L54 83 M38 46 L24 32"
        fill="none" stroke="#c6cc91" stroke-width="3"/>
    </svg>`, { size: 192 });

  // Four grounded, architectural legs with brass shoes and carved capitals.
  for (const x of [-0.73, 0.73]) {
    for (const z of [-0.29, 0.29]) {
      const tag = `${x > 0 ? "L" : "R"}${z > 0 ? "F" : "B"}`;
      box(`foot_${tag}`, [x, 0.037, z], [0.13, 0.074, 0.13], bronze);
      box(`footRim_${tag}`, [x, 0.078, z], [0.139, 0.018, 0.139], gold);
      b.frustumBox(
        [x, 0.08, z],
        [x, 0.75, z],
        [0.095, 0.095],
        [0.142, 0.142],
        { color: walnut, bone: root, name: `leg_${tag}` },
      );
      box(`legCapital_${tag}`, [x, 0.73, z], [0.17, 0.105, 0.17], darkWood);
      box(`capitalGilt_${tag}`, [x, 0.774, z], [0.176, 0.015, 0.176], gold);
      if (z > 0) {
        diamond(`legInlay_${tag}`, [x, 0.52, z + 0.067], 0.056, 0.19, gold);
        diamond(`legInset_${tag}`, [x, 0.52, z + 0.073], 0.031, 0.115, teal);
      }
    }
  }

  // A low storage shelf and stretchers are part of the furniture, not a plinth.
  box("lowerShelfFrame", [0, 0.235, 0], [1.52, 0.065, 0.64], darkWood);
  for (let j = 0; j < 4; j++) {
    box("lowerShelfBoard", [0, 0.273, -0.228 + j * 0.152], [1.46, 0.025, 0.146], boardGrain);
  }
  box("lowFrontInlay", [0, 0.24, 0.325], [1.36, 0.012, 0.009], gold);
  for (const x of [-0.75, 0.75]) {
    box("sideApron", [x, 0.72, 0], [0.085, 0.2, 0.62], walnut);
    box("sideApronTrim", [x, 0.63, 0], [0.093, 0.015, 0.61], gold);
  }

  box("drawerCarcass", [0, 0.745, 0], [1.54, 0.23, 0.67], darkWood);
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.493;
    box("drawerGiltBorder", [x, 0.745, 0.353], [0.47, 0.185, 0.025], gold);
    box("drawerLacquer", [x, 0.745, 0.37], [0.452, 0.166, 0.021], lacquer);
    frontDrawing("drawerArabesque", panelTexture, [x, 0.744, 0.383], 0.415, 0.135);
    for (const dx of [-0.064, 0.064]) {
      disc("handleRosette", [x + dx, 0.755, 0.394], 0.018, 0.012, gold, [0, 0, 1], 8);
      rod("handlePost", [x + dx, 0.755, 0.394], [x + dx, 0.755, 0.422], 0.007, bronze);
    }
    linework(
      "drawerPull",
      [
        [x - 0.064, 0.755, 0.422],
        [x - 0.045, 0.723, 0.433],
        [x + 0.045, 0.723, 0.433],
        [x + 0.064, 0.755, 0.422],
      ],
      0.008,
      gold,
    );
  }

  box("worktopDarkRim", [0, 0.868, 0], [1.83, 0.088, 0.85], darkWood);
  box("worktopGiltReveal", [0, 0.899, 0], [1.842, 0.014, 0.862], gold);
  for (let i = 0; i < 5; i++) {
    box("broadWalnutWorktop", [0, 0.928, -0.336 + i * 0.168], [1.8, 0.045, 0.164], boardGrain);
  }
  for (const x of [-0.865, 0.865]) {
    box("worktopEndBinding", [x, 0.953, 0], [0.035, 0.009, 0.83], bronze);
    for (const z of [-0.35, 0.35]) {
      disc("topBindingPin", [x, 0.961, z], 0.01, 0.006, gold, [0, 1, 0], 6);
    }
  }

  // Back hutch: a teal field, slender pilasters and a shaped gilded cornice.
  box("hutchBack", [0, 1.25, -0.384], [1.58, 0.60, 0.045], darkWood);
  box("hutchTealPanel", [0, 1.249, -0.356], [1.45, 0.51, 0.014], lacquer);
  for (const x of [-0.777, 0.777]) {
    box("hutchPilaster", [x, 1.263, -0.307], [0.09, 0.628, 0.115], walnut);
    box("hutchGoldFlute", [x, 1.27, -0.243], [0.014, 0.47, 0.009], gold);
    box("hutchCapital", [x, 1.548, -0.303], [0.128, 0.069, 0.153], darkWood);
    box("hutchCapitalBand", [x, 1.57, -0.303], [0.137, 0.018, 0.162], gold);
    diamond("pilasterJewel", [x, 1.035, -0.242], 0.042, 0.07, gold);
  }

  box("upperShelf", [0, 1.432, -0.282], [1.62, 0.049, 0.276], boardGrain);
  box("upperShelfFrontLip", [0, 1.429, -0.14], [1.67, 0.055, 0.026], darkWood);
  box("shelfLipInlay", [0, 1.439, -0.124], [1.57, 0.008, 0.005], gold);
  for (const x of [-0.64, 0.64]) {
    b.extrude(
      [[-0.11, 0], [0.12, 0], [0.12, -0.04], [-0.06, -0.20], [-0.11, -0.20]],
      {
        at: [x, 1.409, -0.275],
        x: [0, 0, 1],
        thickness: 0.04,
        color: walnut,
        bone: root,
        name: "shelfBracket",
      },
    );
  }

  b.extrude(
    [
      [-0.86, 0], [-0.86, 0.07], [-0.68, 0.115],
      [-0.23, 0.115], [0, 0.23], [0.23, 0.115],
      [0.68, 0.115], [0.86, 0.07], [0.86, 0],
    ],
    {
      at: [0, 1.558, -0.35],
      x: [1, 0, 0],
      thickness: 0.09,
      color: darkWood,
      bone: root,
      name: "shapedCornice",
    },
  );
  b.sweep(
    [
      [-0.85, 1.631, -0.298],
      [-0.68, 1.678, -0.298],
      [-0.23, 1.678, -0.298],
      [0, 1.793, -0.298],
      [0.23, 1.678, -0.298],
      [0.68, 1.678, -0.298],
      [0.85, 1.631, -0.298],
    ],
    0.008,
    { color: gold, bone: root, sides: 6, name: "corniceGoldOutline" },
  );
  for (const s of [-1, 1]) {
    frontDrawing("corniceScroll", panelTexture, [s * 0.47, 1.618, -0.302], 0.48, 0.07);
  }
  diamond("corniceStar", [0, 1.693, -0.292], 0.117, 0.16, gold);
  diamond("corniceGem", [0, 1.693, -0.284], 0.058, 0.095, "#67c7bc");
  frontDrawing("backboardAstralSeal", sealTexture, [0.04, 1.209, -0.345], 0.30, 0.30);

  // Fine scroll-shaped braces beneath the outer ends of the table.
  for (const s of [-1, 1]) {
    linework(
      "apronScroll",
      [
        [s * 0.79, 0.855, 0.354],
        [s * 0.86, 0.785, 0.354],
        [s * 0.855, 0.66, 0.354],
        [s * 0.81, 0.63, 0.354],
        [s * 0.784, 0.675, 0.354],
      ],
      0.013,
      gold,
    );
  }

  // Potion bottles use opaque, faceted glass colors and luminous liquid cores.
  // The silhouetted lip, shoulders, cork, label and reflection belong to one assembly.
  function potion(
    name: string,
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    liquid: string,
    glass: string,
    kind: "round" | "tall" | "flask" = "round",
    luminous = false,
  ) {
    const neck = kind === "flask" ? 0.27 : kind === "tall" ? 0.37 : 0.34;
    const shoulder = kind === "flask" ? 0.56 : kind === "tall" ? 0.74 : 0.64;
    const profile: [number, number][] = [
      [0, 0],
      [r * 0.70, 0],
      [r, h * 0.10],
      [r, h * (shoulder - 0.17)],
      [r * 0.83, h * shoulder],
      [r * neck, h * 0.79],
      [r * neck, h * 0.94],
      [0, h * 0.94],
    ];
    const body = b.lathe(profile, {
      at: [x, y, z],
      segments: 8,
      color: glass,
      bone: root,
      name: `${name}_glass`,
    });

    const lower = b.lathe(
      [
        [0, 0], [r * 0.71, 0], [r * 1.012, h * 0.105],
        [r * 1.012, h * (shoulder - 0.18)],
        [r * 0.94, h * (shoulder - 0.08)], [0, h * (shoulder - 0.08)],
      ],
      {
        at: [x, y + 0.001, z],
        segments: 8,
        color: liquid,
        bone: root,
        name: `${name}_elixir`,
      },
    );
    if (luminous) glow(lower, 0.65);

    disc(`${name}_heel`, [x, y + h * 0.045, z], r * 0.82, h * 0.045, glass, [0, 1, 0], 8);
    disc(`${name}_collar`, [x, y + h * 0.85, z], r * neck * 1.25, h * 0.045, gold, [0, 1, 0], 8);
    disc(`${name}_lip`, [x, y + h * 0.94, z], r * neck * 1.35, h * 0.055, glass, [0, 1, 0], 8);
    b.part(
      new THREE.CylinderGeometry(r * neck * 0.92, r * neck * 0.78, h * 0.105, 7),
      "#b98b68",
      {
        at: [x, y + h * 0.995, z],
        bone: root,
        name: `${name}_cork`,
      },
    );
    disc(`${name}_corkTop`, [x, y + h * 1.05, z], r * neck * 0.96, h * 0.018, "#dbb986", [0, 1, 0], 7);

    b.decal([body, lower], labelTexture, {
      at: [x, y + h * 0.35, z + r],
      dir: [0, 0, 1],
      size: [r * 0.96, h * 0.31],
      lift: 0.002,
      segments: 6,
      bone: root,
      name: `${name}_paperLabel`,
    });
    // A broad painted-glass glint, deliberately angular rather than realistic.
    b.sweep(
      [
        [x - r * 0.56, y + h * 0.18, z + r * 0.80],
        [x - r * 0.56, y + h * (shoulder - 0.18), z + r * 0.80],
        [x - r * 0.46, y + h * (shoulder - 0.06), z + r * 0.72],
      ],
      r * 0.065,
      { color: "#d8f6e4", bone: root, sides: 4, name: `${name}_reflection` },
    );
    return body;
  }

  potion("moonwater", 0.02, 1.458, -0.268, 0.093, 0.292, "#55c9cb", "#b8e7db", "round", true);
  potion("violetDistillate", -0.235, 1.458, -0.27, 0.065, 0.222, "#9a75bd", "#d0bfdf", "tall");
  potion("amberTincture", -0.405, 1.458, -0.27, 0.060, 0.168, "#dc9b48", "#eed19b", "round");
  potion("roseElixir", 0.245, 1.458, -0.269, 0.067, 0.194, "#c46d8c", "#e8bfd1", "flask");
  potion("viridianEssence", 0.425, 1.458, -0.27, 0.053, 0.234, "#57a486", "#b6d7b7", "tall");
  potion("littleBluePhial", 0.58, 1.458, -0.27, 0.040, 0.151, "#4c9eba", "#b9dae2", "tall");
  potion("sunfire", -0.70, 0.953, -0.065, 0.080, 0.258, "#ecad4f", "#f1d49d", "flask", true);
  potion("starlight", -0.13, 0.953, -0.12, 0.085, 0.305, "#62b7cd", "#b9dedf", "tall", true);
  potion("rosebud", 0.16, 0.953, -0.125, 0.057, 0.166, "#cf7998", "#e9c2d3", "round");

  // Books, including gilded corners, raised spine bands and a patterned spine.
  function closedBook(
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
  ) {
    box(`${name}_pages`, [x, y + h / 2, z], [w - 0.025, h - 0.026, d - 0.022], paper);
    for (const yy of [y + 0.008, y + h - 0.008]) {
      box(`${name}_cover`, [x, yy, z], [w, 0.017, d], color);
      for (const sx of [-1, 1]) {
        box(`${name}_corner`, [x + sx * (w / 2 - 0.022), yy + 0.001, z + d / 2 - 0.019],
          [0.04, 0.021, 0.034], gold);
      }
    }
    box(`${name}_spine`, [x, y + h / 2, z + d / 2 - 0.007], [w, h, 0.025], color);
    for (const xx of [x - w * 0.33, x + w * 0.33]) {
      box(`${name}_raisedBand`, [xx, y + h / 2, z + d / 2 + 0.008],
        [0.012, h + 0.002, 0.008], gold);
    }
    frontDrawing(`${name}_title`, panelTexture, [x, y + h / 2, z + d / 2 + 0.014], w * 0.53, h * 0.75);
    // Fine page edges on the visible long side.
    for (let i = 1; i < 4; i++) {
      box(`${name}_pageEdge`, [x + w / 2 - 0.010, y + 0.013 + i * (h - 0.026) / 4, z - 0.007],
        [0.003, 0.0016, d - 0.037], "#bda77f");
    }
  }

  closedBook("indigoTreatise", 0.50, 0.953, -0.23, 0.34, 0.072, 0.215, "#454660");
  closedBook("greenHerbal", 0.47, 1.025, -0.22, 0.305, 0.064, 0.207, "#326e68");
  closedBook("lowerAtlas", -0.40, 0.287, 0.01, 0.43, 0.083, 0.38, "#654457");
  closedBook("lowerStarCodex", -0.365, 0.37, 0.035, 0.375, 0.072, 0.335, "#3a626b");

  // Upright folios tucked onto the lower shelf.
  for (let i = 0; i < 3; i++) {
    const x = 0.28 + i * 0.082;
    const h = [0.31, 0.355, 0.29][i];
    const c = ["#3c5369", "#6d4859", "#44776e"][i];
    box("uprightFolioPages", [x, 0.287 + h / 2, 0.015], [0.057, h - 0.021, 0.252], paper);
    for (const dx of [-0.034, 0.034]) {
      box("uprightFolioCover", [x + dx, 0.287 + h / 2, 0.015], [0.012, h, 0.278], c);
    }
    box("uprightFolioSpine", [x, 0.287 + h / 2, 0.156], [0.077, h, 0.023], c);
    frontDrawing("folioSpineGold", spineTexture, [x, 0.287 + h / 2, 0.169], 0.062, h * 0.95);
  }

  // The open herbal: a low V-shaped page block, with artwork on both leaves.
  const bookX = -0.43;
  const bookZ = 0.20;
  const hingeY = 0.979;
  const pageW = 0.198;
  const pageD = 0.28;
  for (const s of [-1, 1]) {
    const x0 = bookX + s * 0.006;
    const x1 = bookX + s * 0.214;
    b.slab(
      [
        [x0, hingeY - 0.01, bookZ - 0.155],
        [x1, hingeY + 0.033, bookZ - 0.155],
        [x1, hingeY + 0.033, bookZ + 0.155],
        [x0, hingeY - 0.01, bookZ + 0.155],
      ],
      { thickness: 0.016, color: "#364c60", bone: root, name: "openBookCover" },
    );
    b.slab(
      [
        [x0, hingeY + 0.004, bookZ - pageD / 2],
        [bookX + s * 0.203, hingeY + 0.045, bookZ - pageD / 2],
        [bookX + s * 0.203, hingeY + 0.045, bookZ + pageD / 2],
        [x0, hingeY + 0.004, bookZ + pageD / 2],
      ],
      { thickness: 0.016, color: paper, bone: root, name: "openBookPageBlock" },
    );
    b.part(new THREE.PlaneGeometry(pageW, pageD), "#ffffff", {
      at: [bookX + s * 0.1045, hingeY + 0.034, bookZ],
      dir: [-s * 0.208, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: s < 0 ? herbPage : formulaPage,
      bone: root,
      name: s < 0 ? "illustratedBotanicalPage" : "illustratedAlchemyPage",
    });
    for (const zz of [bookZ - 0.146, bookZ + 0.146]) {
      box("bookCornerGilt", [bookX + s * 0.197, hingeY + 0.039, zz],
        [0.032, 0.009, 0.022], gold, [0, 0, s * 11.8]);
    }
  }
  linework("bookBinding", [
    [bookX, hingeY + 0.006, bookZ - 0.151],
    [bookX, hingeY + 0.005, bookZ],
    [bookX, hingeY + 0.006, bookZ + 0.15],
  ], 0.006, "#a18067");
  b.slab(
    [
      [bookX + 0.026, hingeY + 0.013, bookZ + 0.07],
      [bookX + 0.052, hingeY + 0.019, bookZ + 0.07],
      [bookX + 0.052, 0.944, 0.446],
      [bookX + 0.037, 0.905, 0.449],
      [bookX + 0.026, 0.925, 0.447],
    ],
    { thickness: 0.003, color: "#b96170", bone: root, name: "ribbonBookmark" },
  );

  // A small marble mortar with a genuinely open bowl.
  const mx = 0.035;
  const mz = 0.245;
  b.lathe(
    [
      [0, 0], [0.068, 0], [0.071, 0.017],
      [0.063, 0.032], [0.093, 0.108], [0.096, 0.132],
      [0.080, 0.14], [0.070, 0.117], [0.049, 0.054], [0, 0.039],
    ],
    {
      at: [mx, 0.953, mz],
      segments: 10,
      color: paint((p, n) =>
        mix("#60797d", "#c2d1ba", 0.45 + n.y * 0.23 + noise(p, 0.055, 10) * 0.25)),
      bone: root,
      name: "stoneMortar",
    },
  );
  disc("mortarFootRing", [mx, 0.967, mz], 0.071, 0.012, gold, [0, 1, 0], 10);
  b.part(new THREE.TorusGeometry(0.089, 0.007, 5, 10), gold, {
    at: [mx, 1.085, mz],
    rotation: [90, 0, 0],
    bone: root,
    name: "mortarGiltRim",
  });
  disc("crushedHerbs", [mx, 1.012, mz], 0.05, 0.012, "#8f9d68", [0, 1, 0], 10);
  b.capsule([mx + 0.015, 1.016, mz], [mx + 0.09, 1.19, mz - 0.018], [0.024, 0.014], {
    color: "#ced9c5",
    sides: 8,
    bone: root,
    name: "stonePestle",
  });
  disc("pestleGripFinial", [mx + 0.09, 1.19, mz - 0.018], 0.021, 0.017, gold, [0.4, 1, -0.1], 8);

  // The balance is a separate, readable silhouette with two open hanging pans.
  const sx = 0.55;
  const sz = 0.18;
  b.lathe(
    [[0, 0], [0.104, 0], [0.109, 0.018], [0.091, 0.038], [0.047, 0.055], [0, 0.055]],
    { at: [sx, 0.953, sz], segments: 10, color: bronze, bone: root, name: "balanceFoot" },
  );
  disc("balanceBaseInlay", [sx, 0.983, sz], 0.086, 0.012, gold);
  rod("balanceColumn", [sx, 0.994, sz], [sx, 1.422, sz], 0.017, gold);
  for (const yy of [1.025, 1.338, 1.403]) {
    disc("balanceColumnCollar", [sx, yy, sz], 0.027, 0.018, bronze, [0, 1, 0], 8);
  }
  ball("balancePivot", [sx, 1.42, sz], [0.035, 0.035, 0.026], gold);
  diamond("balanceFinial", [sx, 1.479, sz], 0.035, 0.071, gold);
  b.extrude(
    [
      [-0.245, 0.014], [-0.225, 0.032], [-0.09, 0.018],
      [0, 0.04], [0.09, 0.018], [0.225, 0.032],
      [0.245, 0.014], [0.235, -0.013], [0.09, -0.004],
      [0, -0.021], [-0.09, -0.004], [-0.235, -0.013],
    ],
    {
      at: [sx, 1.418, sz],
      x: [1, 0, 0],
      thickness: 0.018,
      color: gold,
      bone: root,
      name: "balanceBeam",
    },
  );
  rod("balancePointer", [sx, 1.422, sz + 0.025], [sx, 1.31, sz + 0.025], 0.004, "#364753");
  diamond("pointerTip", [sx, 1.305, sz + 0.025], 0.014, 0.025, gold);
  for (const side of [-1, 1]) {
    const px = sx + side * 0.225;
    const panY = 1.153;
    b.part(new THREE.TorusGeometry(0.012, 0.003, 4, 8), bronze, {
      at: [px, 1.414, sz],
      bone: root,
      name: "panSuspensionEye",
    });
    b.lathe(
      [[0, 0], [0.04, 0], [0.083, 0.022], [0.09, 0.041],
        [0.083, 0.046], [0.075, 0.03], [0.037, 0.01], [0, 0.01]],
      {
        at: [px, panY, sz],
        segments: 12,
        color: gold,
        bone: root,
        name: "balancePan",
      },
    );
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI * 2 / 3 + Math.PI / 2;
      const end: P = [px + Math.cos(a) * 0.078, panY + 0.039, sz + Math.sin(a) * 0.078];
      rod("panChain", [px, 1.409, sz], end, 0.0027, bronze);
      ball("chainRivet", end, [0.005, 0.005, 0.005], gold);
    }
  }

  // Two tiny calibrated weights and a pinch of crystalline reagent.
  for (const [dx, r, h] of [[-0.024, 0.019, 0.027], [0.025, 0.014, 0.020]]) {
    const px = sx + 0.225 + dx;
    disc("balanceWeight", [px, 1.166 + h / 2, sz], r, h, bronze, [0, 1, 0], 8);
    ball("weightKnob", [px, 1.169 + h, sz], [r * 0.4, r * 0.4, r * 0.4], gold);
  }
  for (let i = 0; i < 3; i++) {
    const crystal = b.part(new THREE.OctahedronGeometry(0.018, 0), "#99d7d0", {
      at: [sx - 0.225 + (i - 1) * 0.023, 1.18, sz + (i % 2) * 0.018],
      scale: [0.7, 1.3, 0.8],
      bone: root,
      name: "reagentCrystal",
    });
    glow(crystal, 0.35);
  }

  // Drying bundles hang from hooks under the hutch, with broad drawn leaves.
  function herbBundle(x: number, z: number, top: number, variant: number) {
    b.part(new THREE.TorusGeometry(0.016, 0.0035, 5, 8, Math.PI * 1.6), bronze, {
      at: [x, top + 0.026, z],
      rotation: [0, 0, -25],
      bone: root,
      name: "herbHook",
    });
    rod("hangingTwine", [x, top + 0.015, z], [x, top - 0.042, z], 0.003, "#c2a77a");
    for (let j = 0; j < 4; j++) {
      const spread = (j - 1.5) * 0.027;
      const end: P = [x + spread, top - 0.20 - random() * 0.055, z + (j % 2) * 0.023];
      rod("dryingHerbStem", [x, top - 0.03, z], end, 0.0025, "#8b9160");
      for (let k = 0; k < 2; k++) {
        const side = k === 0 ? -1 : 1;
        const at: P = [
          x + spread * (0.5 + k * 0.25),
          top - 0.10 - k * 0.052,
          z + (j % 2) * 0.023,
        ];
        b.cards(
          [frame(at, [side * 0.60, -1, 0.13])],
          leafTexture,
          {
            size: [0.035, 0.075],
            flow: [0, 0, 1],
            lean: 12,
            bend: 15,
            bone: root,
            name: "hangingHerbLeaf",
          },
        );
      }
      if (variant === 1) {
        for (let k = 0; k < 3; k++) {
          ball(
            "lavenderBlossom",
            [end[0] + (k % 2 ? 0.007 : -0.005), end[1] + k * 0.013, end[2]],
            [0.011, 0.016, 0.01],
            k % 2 ? "#b6a2ce" : "#8e80b1",
          );
        }
      }
    }
    for (let k = 0; k < 3; k++) {
      disc("herbBinding", [x, top - 0.041 - k * 0.006, z], 0.013, 0.004, "#c1a276", [0, 1, 0], 7);
    }
    b.sweep(
      bezier([x, top - 0.045, z + 0.012], [x + 0.043, top - 0.035, z + 0.018], [x + 0.018, top - 0.074, z + 0.018]),
      0.0025,
      { color: "#d7bc85", bone: root, sides: 5, name: "twineBow" },
    );
  }
  herbBundle(-0.54, -0.23, 1.39, 0);
  herbBundle(-0.35, -0.25, 1.39, 1);

  // A tied sachet and spare reagent jar on the lower storage shelf.
  ball("linenSachet", [0.04, 0.355, -0.04], [0.095, 0.074, 0.085], "#b3ae88");
  b.sweep(
    [[0.04, 0.375, -0.04], [0.04, 0.445, -0.04]],
    [0.062, 0.029],
    { color: "#c5be96", bone: root, sides: 7, caps: "flat", name: "sachetGather" },
  );
  disc("sachetTie", [0.04, 0.423, -0.04], 0.037, 0.012, "#6e6878", [0, 1, 0], 8);
  potion("storedSaffron", 0.65, 0.287, 0.025, 0.063, 0.226, "#b8a064", "#d5c495", "tall");

  // A few loose leaves on the working surface, contained in the bench footprint.
  for (let i = 0; i < 3; i++) {
    b.cards(
      [frame([0.20 + i * 0.035, 0.958, 0.32 - i * 0.04], [0, 1, 0])],
      leafTexture,
      {
        size: [0.027, 0.064],
        lean: 90,
        flow: [0.7 - i * 0.3, 0, -1],
        mirror: true,
        sink: 0,
        bone: root,
        name: "looseHerbLeaf",
      },
    );
  }

  // Brass measuring spoon beside the mortar.
  rod("measuringSpoonHandle", [0.20, 0.964, 0.07], [0.29, 0.964, 0.255], 0.006, gold);
  ball("measuringSpoonBowl", [0.305, 0.968, 0.283], [0.022, 0.005, 0.033], bronze);
  ball("spoonInnerHighlight", [0.305, 0.973, 0.283], [0.016, 0.002, 0.026], gold);

  return b.root;
}
