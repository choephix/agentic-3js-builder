import * as THREE from "three";
import {
  createBuilder,
  svg,
  paint,
  mix,
  noise,
  rng,
  catmull,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "The Moonweaver's Library",
  description:
    "A midnight-teal fantasy bookshelf with illuminated bindings, embroidered velvet, a luminous celestial globe, rolled manuscripts and warm candlelight.",
};

/*
Art-direction changes:
1. Replace the noisy wood grain with restrained lacquer and place wear only at edges.
2. Strengthen the book illustrations and seat their covers cleanly; introduce more
   binding variation without sacrificing the bookshelf's excellent silhouette.
3. Give the divination globe a luminous, graduated surface and readable constellations.
4. Bring all three upper candles out from behind the right pilaster.
5. Add a velvet shelf runner, supporting bookends, and restrained botanical inlay.
6. Move the foreground atlas fully onto its base and improve parchment readability.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "MoonweaversLibrary", paintSize: 2048 });
  const root = b.joint("cabinet", { at: [0, 0, 0] });
  const random = rng(8173);

  type Fill = Parameters<typeof b.part>[1];
  type P = number[] | THREE.Vector3;

  const C = {
    ink: "#191b30",
    navy: "#30364d",
    dark: "#222b40",
    teal: "#316269",
    lightTeal: "#648b88",
    gold: "#d7b26c",
    paleGold: "#f4dda1",
    paper: "#ead8b1",
    cream: "#f5e6c7",
    wax: "#f8dfb5",
    purple: "#72508d",
    blue: "#3d668c",
    red: "#934b69",
    green: "#3d7468",
    cyan: "#8deee6",
  };

  const lacquer = paint((p, n) =>
    mix("#29334b", "#45516a", 0.32 + 0.17 * n.y + 0.16 * noise(p, 0.25, 3)),
  );
  const shelfPaint = paint((p, n) =>
    mix("#303b52", "#536078", 0.22 + 0.22 * n.y + 0.1 * noise(p, 0.20, 7)),
  );
  const gold = paint((p, n) =>
    mix("#a47c46", "#f4d99a", 0.57 + 0.23 * n.y + 0.1 * n.z + 0.04 * noise(p, 0.1, 2)),
  );
  const paper = paint((p, n) =>
    mix("#c6b18c", "#f5e9c9",
      0.65 + 0.13 * n.y + 0.08 * Math.sin(p.y * 1550)),
  );
  const velvet = paint((p, n) =>
    mix("#4b2855", "#a15c88", 0.44 + 0.23 * n.y + 0.05 * noise(p, 0.04, 5)),
  );
  const bookColors = [C.blue, C.purple, C.red, C.green];

  function box(name: string, at: P, size: number[], color: Fill, rotation = [0, 0, 0]) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, rotation, bone: root, name,
    });
  }

  function cyl(
    name: string, at: P, radius: number, height: number, color: Fill,
    dir = [0, 1, 0], top = radius, sides = 12,
  ) {
    return b.part(new THREE.CylinderGeometry(top, radius, height, sides), color, {
      at, dir, bone: root, name,
    });
  }

  function ball(
    name: string, at: P, radius: number, color: Fill,
    scale = [1, 1, 1], segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(radius, segments, 8), color, {
      at, scale, bone: root, flat: true, name,
    });
  }

  function rod(name: string, a: P, c: P, radius: number, color: Fill) {
    return b.rod(a, c, radius, { color, sides: 6, bone: root, name });
  }

  function torus(
    name: string, at: P, radius: number, tube: number, color: Fill,
    rotation = [0, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, 36), color, {
      at, rotation, bone: root, name,
    });
  }

  function plate(
    name: string, at: P, width: number, height: number,
    texture: THREE.Texture, dir = [0, 0, 1], up = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, dir, up, axis: "z", texture, bone: root, name,
    });
  }

  function diamond(
    name: string, x: number, y: number, z: number, w: number, h: number,
    color: Fill = gold,
  ) {
    return b.extrude(
      [[0, h / 2], [w / 2, 0], [0, -h / 2], [-w / 2, 0]],
      {
        at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.012, color, bone: root, name,
      },
    );
  }

  // All drawings use substantial strokes, not hairline gold that disappears at distance.
  const coverTexture = svg(
    `<svg viewBox="0 0 240 320">
      <g fill="none" stroke="#e5c88d" stroke-linejoin="round">
        <path d="M17 17H223V303H17Z" stroke-width="4"/>
        <path d="M27 27H213V293H27Z" stroke-width="2.5"/>
        <path d="M27 60L60 27M180 27L213 60M27 260L60 293M180 293L213 260" stroke-width="5"/>
        <circle cx="120" cy="155" r="64" stroke-width="3.5"/>
        <circle cx="120" cy="155" r="53" stroke-width="2.5"/>
        <path d="M120 91L138 137L184 155L138 173L120 219L102 173L56 155L102 137Z" stroke-width="4"/>
        <path d="M75 110L165 200M165 110L75 200" stroke-width="2.5"/>
      </g>
      <circle cx="120" cy="155" r="25" fill="#27334a" stroke="#f8dfa5" stroke-width="4"/>
      <path d="M131 136C101 133 99 177 132 174C111 165 111 147 131 136Z" fill="#f8dfa5"/>
      <path d="M120 45L127 57L120 70L113 57ZM120 249L127 262L120 275L113 262Z" fill="#f0d496"/>
    </svg>`,
    { size: 768 },
  );

  function bindingTexture(background: string, title: string, symbol: number) {
    const emblems = [
      `<circle cx="50" cy="67" r="22" fill="none" stroke="#f7dfa5" stroke-width="3"/>
       <path d="M50 42L57 60L76 67L57 74L50 93L43 74L24 67L43 60Z" fill="#f7dfa5"/>
       <circle cx="50" cy="67" r="6" fill="${background}"/>`,
      `<path d="M62 43C25 37 22 91 62 91C39 76 40 55 62 43Z" fill="#f7dfa5"/>
       <path d="M74 53L78 63L88 67L78 71L74 81L70 71L60 67L70 63Z" fill="#f7dfa5"/>`,
      `<path d="M48 40C59 59 76 64 69 81C62 99 30 92 30 76C30 63 45 60 48 40Z" fill="none" stroke="#f7dfa5" stroke-width="4"/>
       <path d="M49 64C37 83 50 93 59 80Z" fill="#f7dfa5"/>`,
      `<path d="M50 42V94M50 68C24 68 26 48 29 46C48 46 50 58 50 68ZM50 82C76 82 75 60 72 58C54 59 50 70 50 82Z" fill="none" stroke="#f7dfa5" stroke-width="4"/>`,
    ];
    return svg(
      `<svg viewBox="0 0 100 360">
        <rect width="100" height="360" fill="${background}"/>
        <path d="M8 5H92V355H8Z" fill="none" stroke="#20223a" stroke-width="5"/>
        <path d="M17 13H83V347H17Z" fill="none" stroke="#ddbd7b" stroke-width="2.5"/>
        <path d="M24 29H76M24 327H76" stroke="#f6dda2" stroke-width="3"/>
        ${emblems[symbol]}
        <text x="50" y="187" fill="#ffe7b7" font-size="19" font-family="serif" text-anchor="middle" letter-spacing="3" transform="rotate(-90 50 187)">${title}</text>
        <path d="M31 282Q50 264 69 282Q50 300 31 282ZM50 272V292" fill="none" stroke="#e8c586" stroke-width="3"/>
        <text x="50" y="316" fill="#ffe7b7" font-size="13" font-family="serif" text-anchor="middle">VII</text>
      </svg>`,
      { size: 512 },
    );
  }

  const bindings = [
    bindingTexture("#365771", "ASTRA", 0),
    bindingTexture("#694a7c", "LUNARIA", 1),
    bindingTexture("#87425f", "IGNIS", 2),
    bindingTexture("#37685e", "HERBARIUM", 3),
  ];

  let stars = "";
  for (let i = 0; i < 34; i++) {
    stars += `<circle cx="${15 + random() * 570}" cy="${12 + random() * 188}" r="${i % 5 === 0 ? 2 : 1.15}" fill="${i % 3 ? "#7d8caa" : "#c9b484"}"/>`;
  }
  const backTexture = svg(
    `<svg viewBox="0 0 600 210">
      <rect width="600" height="210" fill="#29324a"/>
      <path d="M13 12H587V198H13Z M20 19H580V191H20Z" fill="none" stroke="#58647b" stroke-width="1.8"/>
      ${stars}
      <g stroke="#607e91" stroke-width="1.8" fill="none">
        <path d="M50 75L122 43L173 87L236 56M355 154L399 98L465 126L525 65"/>
        <circle cx="122" cy="43" r="5"/><circle cx="399" cy="98" r="5"/>
      </g>
      <path d="M300 35L306 54L325 60L306 66L300 85L294 66L275 60L294 54Z" fill="none" stroke="#bcac7c" stroke-width="2"/>
    </svg>`,
    { size: 768 },
  );

  const sealTexture = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="122" fill="#283b50" stroke="#d3b56f" stroke-width="4"/>
      <circle cx="128" cy="128" r="108" fill="none" stroke="#b1c2b0" stroke-width="2.5" stroke-dasharray="3 10"/>
      <circle cx="128" cy="128" r="91" fill="none" stroke="#d9c184" stroke-width="2.5"/>
      <path d="M128 38L151 104L218 128L151 152L128 218L105 152L38 128L105 104Z" fill="#86b2ac" stroke="#efd99d" stroke-width="3.5"/>
      <path d="M65 65L128 94L191 65L162 128L191 191L128 162L65 191L94 128Z" fill="none" stroke="#ddc88e" stroke-width="3"/>
      <circle cx="128" cy="128" r="29" fill="#28334b" stroke="#e8ca83" stroke-width="4"/>
      <path d="M138 107C105 105 104 153 139 150C118 139 119 119 138 107Z" fill="#f0dca7"/>
    </svg>`,
    { size: 512 },
  );

  const manuscriptTexture = svg(
    `<svg viewBox="0 0 260 330">
      <rect width="260" height="330" fill="#f2dfb2"/>
      <path d="M12 12H248V318H12Z M22 22H238V308H22Z" fill="none" stroke="#a77d4f" stroke-width="3"/>
      <text x="130" y="48" fill="#654576" font-family="serif" font-size="21" text-anchor="middle">LUX • AETERNA</text>
      <g stroke="#705184" fill="none" stroke-width="3">
        <circle cx="130" cy="135" r="57"/><circle cx="130" cy="135" r="43"/>
        <path d="M130 78L179 164H81ZM130 192L81 106H179Z"/>
        <path d="M64 135H196M130 69V201"/>
      </g>
      <circle cx="130" cy="135" r="13" fill="#b58e48"/>
      <g stroke="#80623f" stroke-width="3.5" stroke-linecap="round">
        <path d="M40 224H111M124 224H214M40 236H85M95 236H212M40 248H153M165 248H214M40 260H106M115 260H213M40 272H178M40 284H111M127 284H211"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const nameTexture = svg(
    `<svg viewBox="0 0 300 100">
      <rect x="3" y="3" width="294" height="94" rx="12" fill="#243047" stroke="#e2c17c" stroke-width="5"/>
      <path d="M22 50L34 38L46 50L34 62ZM254 50L266 38L278 50L266 62Z" fill="#e1c384"/>
      <text x="150" y="42" text-anchor="middle" font-family="serif" font-size="19" letter-spacing="3" fill="#f3dfac">MOONWEAVER</text>
      <text x="150" y="70" text-anchor="middle" font-family="serif" font-size="14" letter-spacing="4" fill="#adcfc6">ARCANA • VII</text>
    </svg>`,
    { size: 512 },
  );

  const bottleLabel = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M10 5H90V115H10Z" fill="#f1e0ba" stroke="#b08c57" stroke-width="5"/>
      <path d="M50 22L56 41L76 47L56 53L50 73L44 53L24 47L44 41Z" fill="#69507d"/>
      <path d="M25 89H75M33 101H67" stroke="#69507d" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );

  const orbTexture = svg(
    `<svg viewBox="0 0 512 256">
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#514998"/>
          <stop offset=".35" stop-color="#4b8fc3"/>
          <stop offset=".64" stop-color="#77e5df"/>
          <stop offset="1" stop-color="#39a4b5"/>
        </linearGradient>
      </defs>
      <rect width="512" height="256" fill="url(#a)"/>
      <path d="M0 171Q80 125 171 164T350 164T530 152" fill="none" stroke="#b3fff0" stroke-width="10" opacity=".28"/>
      <path d="M0 192Q100 154 207 184T440 180T550 175" fill="none" stroke="#d8fff1" stroke-width="4" opacity=".35"/>
    </svg>`,
    { size: 512 },
  );

  const constellationTexture = svg(
    `<svg viewBox="0 0 200 200">
      <g fill="none" stroke="#cefff0" stroke-width="3.4" stroke-linecap="round">
        <path d="M37 119L67 69L112 87L149 44M67 69L83 146L139 133"/>
        <circle cx="67" cy="69" r="8"/>
        <circle cx="139" cy="133" r="6"/>
      </g>
      <g fill="#f5fff2">
        <path d="M149 29L153 40L164 44L153 48L149 60L145 48L133 44L145 40Z"/>
        <circle cx="37" cy="119" r="4.5"/><circle cx="112" cy="87" r="4.5"/>
        <circle cx="83" cy="146" r="4.5"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const runnerTexture = svg(
    `<svg viewBox="0 0 200 220">
      <g fill="none" stroke="#e6c28d" stroke-width="3">
        <path d="M16 0V194L100 210L184 194V0"/>
        <path d="M26 0V185L100 199L174 185V0" stroke-dasharray="4 6"/>
        <circle cx="100" cy="105" r="40"/>
        <path d="M100 54L115 90L151 105L115 120L100 156L85 120L49 105L85 90Z"/>
      </g>
      <path d="M110 83C80 80 79 124 111 123C92 112 92 95 110 83Z" fill="#f3d8a1"/>
      <g fill="#e6c28d">
        <path d="M47 30L52 39L47 48L42 39ZM153 30L158 39L153 48L148 39Z"/>
        <circle cx="100" cy="25" r="3"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  // A compact octagonal platform, with ample support for the foreground props.
  const stage = cyl("octagonal_stage", [0, 0.055, 0.02], 1.31, 0.11, C.dark, [0, 1, 0], 1.27, 8);
  stage.mesh.scale.z = 0.61;
  const reveal = cyl("stage_gold_reveal", [0, 0.09, 0.02], 1.292, 0.018, gold, [0, 1, 0], 1.292, 8);
  reveal.mesh.scale.z = 0.61;
  const stageTop = cyl("stage_top", [0, 0.113, 0.02], 1.267, 0.032, shelfPaint, [0, 1, 0], 1.245, 8);
  stageTop.mesh.scale.z = 0.61;

  for (const x of [-0.76, 0.76]) {
    for (const z of [-0.2, 0.22]) {
      box("cabinet_foot", [x, 0.188, z], [0.22, 0.12, 0.22], lacquer);
      box("gilt_foot_shoe", [x, 0.147, z], [0.235, 0.036, 0.235], gold);
    }
  }

  box("lower_plinth", [0, 0.265, 0], [1.99, 0.105, 0.68], lacquer);
  box("lower_plinth_bead", [0, 0.319, 0.005], [2.025, 0.022, 0.695], gold);
  box("back", [0, 1.30, -0.274], [1.78, 1.99, 0.085], lacquer);

  for (let i = 0; i < 3; i++) {
    plate(`star_inlay_back_${i}`, [0, 0.624 + i * 0.65, -0.229], 1.65, 0.55, backTexture);
  }

  for (const s of [-1, 1]) {
    const x = s * 0.91;
    box("side_stile", [x, 1.30, 0], [0.145, 2, 0.63], lacquer);
    box("front_pilaster", [x, 1.31, 0.327], [0.105, 1.85, 0.06], C.teal);
    for (const dx of [-0.044, 0.044]) {
      box("pilaster_gold_edge", [x + dx, 1.31, 0.362], [0.008, 1.84, 0.01], gold);
    }
    box("column_foot", [x, 0.39, 0.327], [0.174, 0.12, 0.105], gold);
    box("column_capital", [x, 2.22, 0.327], [0.192, 0.105, 0.11], gold);
    box("capital_teal_reveal", [x, 2.172, 0.337], [0.145, 0.017, 0.09], C.teal);
    for (const y of [0.59, 1.24, 1.89]) {
      diamond("pilaster_lozenge", x, y, 0.371, 0.059, 0.105);
      glow(ball("inlaid_amethyst", [x, y, 0.386], 0.019, "#c2b2ef", [0.72, 1, 0.45]), 0.25);
    }
  }

  // The side medallions retain their generous negative space.
  for (const s of [-1, 1]) {
    box("side_panel_field", [s * 0.987, 1.30, 0.015], [0.018, 1.67, 0.455], C.teal);
    for (const z of [-0.224, 0.254]) {
      box("side_panel_vertical_moulding", [s * 1.001, 1.30, z], [0.021, 1.72, 0.026], gold);
    }
    for (const y of [0.45, 2.15]) {
      box("side_panel_horizontal_moulding", [s * 1.001, y, 0.015], [0.021, 0.026, 0.50], gold);
    }
    cyl("side_medallion_mount", [s * 1.007, 1.32, 0.015], 0.181, 0.02, gold, [s, 0, 0], 0.181, 24);
    plate("side_medallion", [s * 1.02, 1.32, 0.015], 0.342, 0.342, sealTexture, [s, 0, 0]);

    for (const y of [0.73, 1.91]) {
      b.extrude([[0, 0.095], [0.04, 0], [0, -0.095], [-0.04, 0]], {
        at: [s * 1.005, y, 0.015], x: [0, 0, s], y: [0, 1, 0],
        thickness: 0.014, color: gold, bone: root, name: "side_panel_lozenge",
      });
    }

    // Symmetrical laurel branches frame the medallion, not the whole panel.
    for (const side of [-1, 1]) {
      const stemPoints: number[][] = [];
      for (let i = 0; i <= 6; i++) {
        const a = (i / 6) * Math.PI * 0.73 + 0.14;
        stemPoints.push([
          s * 1.008,
          1.32 - Math.cos(a) * 0.29,
          0.015 + side * Math.sin(a) * 0.195,
        ]);
      }
      b.sweep(stemPoints, 0.0035, {
        color: "#bca771", bone: root, sides: 5, name: "side_laurel_stem",
      });
      for (let i = 1; i < 6; i++) {
        const p = stemPoints[i];
        b.extrude([[0, 0], [0.025, 0.011], [0.039, 0.042], [0.009, 0.03]], {
          at: p, x: [0, 0, side], y: [0, 1, 0],
          thickness: 0.004, color: "#9cae91", bone: root, name: "side_laurel_leaf",
        });
      }
    }
  }

  for (const y of [0.33, 0.98, 1.63]) {
    box("shelf", [0, y - 0.036, 0.012], [1.77, 0.072, 0.625], shelfPaint);
    box("shelf_front_fascia", [0, y - 0.035, 0.337], [1.80, 0.077, 0.035], C.teal);
    box("shelf_gold_lip", [0, y + 0.004, 0.355], [1.815, 0.014, 0.025], gold);
    box("shelf_lower_bead", [0, y - 0.072, 0.356], [1.82, 0.012, 0.022], gold);
    for (const x of [-0.66, -0.33, 0, 0.33, 0.66]) {
      diamond("shelf_tiny_star", x, y - 0.034, 0.359, 0.024, 0.033);
    }
  }

  box("top_cornice", [0, 2.255, 0.005], [2.04, 0.11, 0.715], lacquer);
  box("cornice_gold_upper", [0, 2.315, 0.005], [2.07, 0.021, 0.73], gold);
  box("cornice_front_inlay", [0, 2.252, 0.369], [1.81, 0.057, 0.014], C.teal);
  plate("library_nameplate", [0, 2.253, 0.38], 0.49, 0.155, nameTexture);

  b.extrude(
    [[-0.94, 0], [-0.94, 0.075], [-0.65, 0.14], [-0.42, 0.29],
      [0, 0.48], [0.42, 0.29], [0.65, 0.14], [0.94, 0.075], [0.94, 0]],
    {
      at: [0, 2.31, -0.19], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.13, color: lacquer, bone: root, name: "celestial_pediment",
    },
  );

  const arch = [
    [-0.94, 2.39, -0.114], [-0.65, 2.455, -0.114], [-0.42, 2.605, -0.114],
    [0, 2.795, -0.114], [0.42, 2.605, -0.114], [0.65, 2.455, -0.114],
    [0.94, 2.39, -0.114],
  ];
  b.sweep(arch, 0.015, { color: gold, sides: 6, bone: root, name: "gilded_pediment_edge" });
  cyl("star_seal_mount", [0, 2.51, -0.105], 0.182, 0.025, gold, [0, 0, 1], 0.182, 32);
  plate("star_seal", [0, 2.51, -0.089], 0.345, 0.345, sealTexture);

  for (const s of [-1, 1]) {
    diamond("pediment_side_star", s * 0.48, 2.43, -0.112, 0.065, 0.09);
    rod("pediment_fine_ray", [s * 0.29, 2.43, -0.112], [s * 0.405, 2.43, -0.112], 0.0035, gold);
    rod("pediment_fine_ray", [s * 0.555, 2.43, -0.112], [s * 0.65, 2.43, -0.112], 0.0035, gold);
    box("pinnacle_pedestal", [s * 0.91, 2.355, 0.035], [0.17, 0.065, 0.20], C.teal);
    cyl("pinnacle_socket", [s * 0.91, 2.405, 0.035], 0.065, 0.055, gold, [0, 1, 0], 0.05, 6);
    glow(b.part(new THREE.OctahedronGeometry(0.105), "#baaae9", {
      at: [s * 0.91, 2.51, 0.035], scale: [0.62, 1.30, 0.62],
      bone: root, name: "amethyst_finial",
    }), 0.5);
  }

  b.extrude(
    [[0.075, 0.125], [-0.025, 0.165], [-0.12, 0.103], [-0.151, 0],
      [-0.105, -0.11], [-0.005, -0.151], [0.097, -0.092],
      [0.015, -0.079], [-0.037, -0.018], [-0.025, 0.068]],
    {
      at: [0, 2.855, -0.19], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.045, color: gold, bone: root, name: "crescent_moon_crown",
    },
  );
  rod("moon_star_stem", [0.018, 2.785, -0.205], [0.072, 2.872, -0.205], 0.005, gold);
  diamond("moon_companion_star", 0.072, 2.872, -0.19, 0.065, 0.09);

  function book(
    name: string, x: number, y: number, z: number,
    w: number, h: number, d: number, style: number, lean = 0,
  ) {
    const angle = THREE.MathUtils.degToRad(lean);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
    const pivot = new THREE.Vector3(x, y + Math.abs(Math.sin(angle)) * w / 2, z);
    const p = (a: number, c: number, e: number) =>
      new THREE.Vector3(a, c, e).applyQuaternion(q).add(pivot);
    const piece = (tag: string, at: number[], size: number[], color: Fill) =>
      b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
        at: p(at[0], at[1], at[2]), quat: q, bone: root, name: `${name}_${tag}`,
      });

    piece("page_block", [0, h / 2, -0.012], [w - 0.022, h - 0.028, d - 0.035], paper);
    for (const s of [-1, 1]) {
      piece("cover", [s * (w / 2 - 0.006), h / 2, 0], [0.012, h, d], bookColors[style]);
      b.part(new THREE.PlaneGeometry(d * 0.88, h * 0.90), "#ffffff", {
        at: p(s * (w / 2 + 0.004), h / 2, 0),
        dir: new THREE.Vector3(s, 0, 0).applyQuaternion(q),
        up: new THREE.Vector3(0, 1, 0).applyQuaternion(q),
        axis: "z", texture: coverTexture, bone: root, name: `${name}_cover_illumination`,
      });
    }
    piece("spine", [0, h / 2, d / 2 - 0.014], [w, h, 0.028], bookColors[style]);
    b.part(new THREE.PlaneGeometry(w * 0.88, h * 0.94), "#ffffff", {
      at: p(0, h / 2, d / 2 + 0.003), quat: q,
      texture: bindings[style], bone: root, name: `${name}_gilded_title`,
    });
    for (const t of [0.12, 0.88]) {
      piece("raised_band", [0, h * t, d / 2 + 0.007], [w + 0.006, 0.013, 0.014], gold);
    }
    if (style === 2) {
      piece("clasp", [w * 0.26, h * 0.52, d / 2 + 0.014], [0.028, 0.043, 0.016], gold);
    }
    if (style === 0) {
      piece("bookmark", [w * 0.15, h - 0.01, -d * 0.19], [0.014, 0.014, d * 0.52], "#b783a2");
    }
  }

  function flatBook(name: string, at: number[], size: number[], color: string) {
    const [x, y, z] = at;
    const [w, h, d] = size;
    box(`${name}_pages`, [x, y + h / 2, z], [w - 0.022, h - 0.025, d - 0.015], paper);
    for (const yy of [y + 0.006, y + h - 0.006]) {
      box(`${name}_cover`, [x, yy, z], [w, 0.014, d], color);
    }
    box(`${name}_spine`, [x, y + h / 2, z + d / 2], [w, h, 0.019], color);
    for (const s of [-1, 1]) {
      box(`${name}_gold_band`, [x + s * w * 0.32, y + h / 2, z + d / 2 + 0.012],
        [0.017, h * 0.87, 0.008], gold);
    }
  }

  [
    [-0.735, 0.115, 0.45, 1], [-0.595, 0.13, 0.49, 0],
    [-0.447, 0.125, 0.43, 3], [-0.309, 0.12, 0.505, 2],
    [-0.175, 0.105, 0.465, 0], [-0.045, 0.115, 0.40, 1],
  ].forEach(([x, w, h, style], i) =>
    book(`lower_tome_${i}`, x, 0.335, 0.08, w, h, 0.38, style),
  );
  book("leaning_lower_tome", 0.13, 0.338, 0.085, 0.102, 0.46, 0.365, 3, -11);

  book("middle_tome_1", 0.275, 0.985, 0.075, 0.11, 0.445, 0.36, 2);
  book("middle_tome_2", 0.414, 0.985, 0.062, 0.135, 0.51, 0.39, 1);
  book("middle_tome_3", 0.564, 0.985, 0.065, 0.125, 0.475, 0.38, 0);
  book("middle_tome_4", 0.715, 0.985, 0.076, 0.13, 0.425, 0.36, 3);

  book("upper_tome_1", -0.733, 1.635, 0.065, 0.115, 0.47, 0.36, 0);
  book("upper_tome_2", -0.595, 1.635, 0.065, 0.125, 0.51, 0.36, 2);
  book("upper_tome_3", -0.45, 1.635, 0.06, 0.125, 0.435, 0.35, 1);

  // Decorative L-shaped bookends also make the arranged volumes feel supported.
  function bookend(name: string, x: number, y: number, z: number, s: number) {
    box(`${name}_foot`, [x - s * 0.035, y + 0.007, z], [0.09, 0.014, 0.25], gold);
    box(`${name}_upright`, [x, y + 0.112, z], [0.014, 0.21, 0.23], C.teal);
    b.extrude([[0, 0], [0.075, 0], [0.075, 0.025], [0.015, 0.15], [0, 0.15]], {
      at: [x, y + 0.013, z + 0.115], x: [s, 0, 0], y: [0, 1, 0],
      thickness: 0.012, color: gold, bone: root, name: `${name}_scroll_brace`,
    });
  }
  bookend("upper_bookend", -0.376, 1.635, 0.05, 1);
  bookend("middle_bookend", 0.205, 0.985, 0.05, -1);
  bookend("lower_bookend", 0.264, 0.335, 0.08, 1);

  // One richly coloured textile breaks up the otherwise entirely hard furniture.
  box("velvet_runner_top", [-0.015, 1.638, 0.115], [0.35, 0.010, 0.485], velvet);
  b.extrude(
    [[-0.175, 0], [0.175, 0], [0.175, -0.173], [0, -0.205], [-0.175, -0.173]],
    {
      at: [-0.015, 1.638, 0.369], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.012, color: velvet, bone: root, name: "velvet_runner_front",
    },
  );
  plate("embroidered_runner", [-0.015, 1.540, 0.377], 0.344, 0.195, runnerTexture);
  for (const s of [-1, 1]) {
    rod("runner_gold_piping", [-0.015 + s * 0.164, 1.646, -0.121],
      [-0.015 + s * 0.164, 1.646, 0.355], 0.0035, gold);
    const tx = -0.015 + s * 0.151;
    ball("runner_tassel_knot", [tx, 1.460, 0.38], 0.008, gold);
    b.sweep([[tx, 1.455, 0.38], [tx, 1.420, 0.38]], [0.006, 0.012], {
      color: "#d9b77b", sides: 6, bone: root, name: "runner_tassel",
    });
  }
  flatBook("upper_horizontal_book", [-0.03, 1.645, 0.055], [0.43, 0.085, 0.32], C.green);
  flatBook("upper_horizontal_book_2", [-0.015, 1.731, 0.035], [0.38, 0.075, 0.30], C.purple);

  function scroll(name: string, at: number[], length: number, radius: number, axis: number[]) {
    const center = new THREE.Vector3(at[0], at[1], at[2]);
    const direction = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize();
    const side = Math.abs(direction.y) > 0.8
      ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    side.addScaledVector(direction, -side.dot(direction)).normalize();
    const across = new THREE.Vector3().crossVectors(direction, side).normalize();

    cyl(`${name}_parchment`, center, radius, length, C.cream, axis, radius * 0.96);
    cyl(`${name}_ribbon`, center, radius + 0.003, 0.032, C.red, axis, radius + 0.003);
    for (const s of [-1, 1]) {
      const end = center.clone().addScaledVector(direction, s * (length / 2 + 0.001));
      cyl(`${name}_rolled_end`, end, radius * 0.92, 0.005, C.paper, axis, radius * 0.92);
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 36; i++) {
        const t = i / 36;
        const a = t * Math.PI * 5;
        const rr = radius * (0.10 + 0.73 * t);
        points.push(end.clone().addScaledVector(direction, s * 0.004)
          .addScaledVector(side, Math.cos(a) * rr)
          .addScaledVector(across, Math.sin(a) * rr));
      }
      b.sweep(points, 0.0018, {
        color: "#a28356", sides: 4, bone: root, name: `${name}_end_spiral`,
      });
    }
    ball(`${name}_ribbon_knot`, center.clone().addScaledVector(side, radius), 0.014, C.red);
  }

  box("scroll_bin_bottom", [0.565, 0.355, 0.04], [0.40, 0.045, 0.40], lacquer);
  for (const x of [0.365, 0.765]) {
    box("scroll_bin_side", [x, 0.447, 0.04], [0.025, 0.22, 0.40], C.teal);
  }
  box("scroll_bin_front", [0.565, 0.419, 0.245], [0.42, 0.12, 0.035], C.teal);
  box("scroll_bin_rim", [0.565, 0.482, 0.247], [0.43, 0.015, 0.044], gold);
  diamond("scroll_bin_badge", 0.565, 0.419, 0.267, 0.062, 0.066);

  scroll("bin_scroll_left", [0.44, 0.602, 0.04], 0.43, 0.054, [-0.08, 1, 0.04]);
  scroll("bin_scroll_center", [0.565, 0.626, 0.026], 0.48, 0.058, [0.07, 1, -0.05]);
  scroll("bin_scroll_right", [0.69, 0.576, 0.05], 0.39, 0.052, [0.09, 1, 0.03]);

  // Hero magical object: slightly finer facets, still emphatically primitive-built.
  const ox = -0.51;
  const oz = 0.065;
  cyl("orb_base", [ox, 1.005, oz], 0.176, 0.045, gold, [0, 1, 0], 0.16, 8);
  cyl("orb_base_teal_inset", [ox, 1.037, oz], 0.13, 0.035, C.teal, [0, 1, 0], 0.115, 8);
  cyl("orb_stem", [ox, 1.092, oz], 0.045, 0.095, gold, [0, 1, 0], 0.06, 8);
  cyl("orb_cup", [ox, 1.143, oz], 0.08, 0.052, gold, [0, 1, 0], 0.125, 10);

  const orb = glow(b.part(new THREE.SphereGeometry(0.192, 20, 12), "#ffffff", {
    at: [ox, 1.32, oz], texture: orbTexture, flat: true,
    bone: root, name: "luminous_divination_orb",
  }), 0.8);

  glow(b.decal(orb, constellationTexture, {
    at: [ox + 0.02, 1.31, oz + 0.19], dir: [0, 0, 1],
    size: [0.245, 0.245], segments: 12, lift: 0.003,
    bone: root, name: "orb_luminous_constellation",
  }), 1.6);

  const orbSkin = b.surface(orb);
  glow(b.stick(new THREE.SphereGeometry(0.026, 10, 6), "#e3fff6",
    orbSkin.around([ox, 1.32, oz]).at(-28, 35),
    { scale: [1, 0.12, 1.45], embed: 0.15, name: "orb_large_glint" },
  ), 1.1);
  glow(b.stick(new THREE.SphereGeometry(0.009, 8, 6), "#f2fff6",
    orbSkin.around([ox, 1.32, oz]).at(-7, 48),
    { scale: [1, 0.18, 1], name: "orb_small_glint" },
  ), 1.1);

  torus("orb_equatorial_ring", [ox, 1.32, oz], 0.211, 0.007, gold, [72, 14, 15]);
  torus("orb_inclined_ring", [ox, 1.32, oz], 0.214, 0.006, gold, [22, -30, -24]);
  for (const s of [-1, 1]) {
    b.sweep(catmull([
      [ox + s * 0.10, 1.04, oz],
      [ox + s * 0.17, 1.13, oz],
      [ox + s * 0.205, 1.30, oz],
    ]), [0.014, 0.009], {
      color: gold, sides: 6, bone: root, name: "orb_cradle_arm",
    });
    ball("orb_pivot", [ox + s * 0.209, 1.32, oz], 0.022, gold);
  }
  torus("orb_base_engraved_ring", [ox, 1.031, oz], 0.144, 0.004, C.paleGold, [90, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    ball("orb_base_rivet", [ox + Math.sin(a) * 0.146, 1.031, oz + Math.cos(a) * 0.146],
      0.005, C.paleGold, [1, 0.6, 1], 6);
  }

  function potion(name: string, x: number, y: number, z: number, r: number, color: string) {
    b.lathe(
      [[0, 0], [r * 0.75, 0], [r, 0.025], [r, 0.105],
        [r * 0.45, 0.15], [r * 0.38, 0.20], [0, 0.20]],
      { at: [x, y, z], segments: 8, color, bone: root, name: `${name}_bottle` },
    );
    cyl(`${name}_lip`, [x, y + 0.195, z], r * 0.52, 0.023, gold, [0, 1, 0], r * 0.52, 8);
    cyl(`${name}_cork`, [x, y + 0.217, z], r * 0.34, 0.028, "#b99268", [0, 1, 0], r * 0.30, 8);
    plate(`${name}_label`, [x, y + 0.077, z + r + 0.002], r * 1.15, 0.09, bottleLabel);
    rod(`${name}_glass_glint`, [x - r * 0.52, y + 0.045, z + r * 0.86],
      [x - r * 0.52, y + 0.106, z + r * 0.86], 0.004, "#c0eee4");
  }
  potion("moon_dew", -0.105, 0.985, 0.09, 0.074, "#4c9a94");
  potion("violet_essence", 0.045, 0.985, -0.025, 0.052, "#8a6aaa");

  function candle(
    name: string, x: number, y: number, z: number,
    height: number, radius: number, stand = 0.025,
  ) {
    cyl(`${name}_foot`, [x, y + 0.011, z], radius * 1.65, 0.022, gold, [0, 1, 0], radius * 1.5);
    if (stand > 0.04) {
      cyl(`${name}_stem`, [x, y + stand / 2, z], radius * 0.33, stand, gold);
      ball(`${name}_stem_knop`, [x, y + stand * 0.55, z], radius * 0.65, gold, [1, 0.65, 1]);
    }
    cyl(`${name}_dish`, [x, y + stand, z], radius * 1.38, 0.023, gold, [0, 1, 0], radius * 1.55);
    const bottom = y + stand + 0.013;
    const wax = cyl(`${name}_wax`, [x, bottom + height / 2, z],
      radius, height, C.wax, [0, 1, 0], radius * 0.97, 10);
    glow(wax, 0.12);
    cyl(`${name}_melt_pool`, [x, bottom + height + 0.001, z],
      radius * 0.70, 0.007, "#c6a071", [0, 1, 0], radius * 0.70, 10);

    for (let i = 0; i < 4; i++) {
      const a = i * 1.65 + 0.3;
      const xx = x + Math.cos(a) * radius * 0.97;
      const zz = z + Math.sin(a) * radius * 0.97;
      const drop = 0.025 + random() * 0.05;
      glow(b.capsule([xx, bottom + height - 0.003, zz], [xx, bottom + height - drop, zz],
        radius * 0.14, { color: C.wax, sides: 6, bone: root, name: `${name}_wax_drip` }), 0.12);
    }
    rod(`${name}_wick`, [x, bottom + height, z],
      [x, bottom + height + 0.025, z], 0.0035, "#47313a");
    const fy = bottom + height + 0.02;
    glow(b.sweep(
      [[x, fy, z], [x + 0.009, fy + 0.04, z], [x - 0.009, fy + 0.091, z]],
      [0.012, 0.022, 0],
      { color: "#ffb55d", sides: 7, bone: root, name: `${name}_amber_flame` },
    ), 1.8);
    glow(b.sweep(
      [[x, fy, z + 0.012], [x + 0.003, fy + 0.031, z + 0.014], [x - 0.004, fy + 0.062, z + 0.009]],
      [0.008, 0.012, 0],
      { color: "#fff2bc", sides: 6, bone: root, name: `${name}_flame_heart` },
    ), 2);
  }

  // The stagger is now visible from both the front and the three-quarter view.
  candle("upper_tall_candle", 0.49, 1.635, 0.075, 0.22, 0.044, 0.14);
  candle("upper_short_candle", 0.33, 1.635, 0.235, 0.143, 0.039, 0.035);
  candle("upper_right_candle", 0.685, 1.635, 0.14, 0.18, 0.035, 0.07);

  // The loose manuscript is fully supported by its inclined reading wedge.
  const angle = 35 * Math.PI / 180;
  const depth = 0.29 * Math.cos(angle);
  const rise = 0.29 * Math.sin(angle);
  b.extrude(
    [[-depth / 2, 0], [depth / 2, 0], [depth / 2, 0.009], [-depth / 2, rise + 0.009]],
    {
      at: [-0.01, 1.806, 0.04], x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.264, color: C.dark, bone: root, name: "manuscript_reading_wedge",
    },
  );
  const sheetCenter = new THREE.Vector3(-0.01, 1.819 + rise / 2, 0.04);
  const normal = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);
  const up = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);
  box("laid_out_manuscript", sheetCenter, [0.286, 0.008, 0.29], C.cream, [35, 0, 0]);
  glow(b.part(new THREE.PlaneGeometry(0.274, 0.278), "#ffffff", {
    at: sheetCenter.clone().addScaledVector(normal, 0.005),
    dir: normal, up, axis: "z", texture: manuscriptTexture,
    bone: root, name: "manuscript_illuminations",
  }), 0.08);
  rod("manuscript_retaining_lip", [-0.16, 1.826, 0.04 + depth / 2],
    [0.14, 1.826, 0.04 + depth / 2], 0.008, gold);

  // Foreground objects sit comfortably inside the octagonal top.
  flatBook("floor_atlas", [-0.58, 0.132, 0.49], [0.36, 0.07, 0.27], C.red);
  scroll("loose_floor_scroll", [-0.57, 0.247, 0.49], 0.38, 0.045, [1, 0, 0.08]);
  candle("floor_candle", 0.82, 0.132, 0.47, 0.15, 0.046, 0.025);

  torus("small_brass_key_bow", [-0.27, 0.14, 0.53], 0.025, 0.006, gold, [90, 0, 0]);
  rod("small_brass_key_shaft", [-0.245, 0.141, 0.53], [-0.15, 0.141, 0.53], 0.007, gold);
  box("key_tooth_one", [-0.161, 0.142, 0.545], [0.012, 0.013, 0.032], gold);
  box("key_tooth_two", [-0.183, 0.142, 0.541], [0.009, 0.013, 0.023], gold);

  for (const x of [-0.96, 0.96]) {
    for (const y of [0.266, 2.255]) {
      ball("frame_rivet", [x, y, y < 1 ? 0.343 : 0.365], 0.012, gold, [1, 1, 0.48]);
    }
  }

  root.object.userData.category = "Prop group";
  return b.root;
}
