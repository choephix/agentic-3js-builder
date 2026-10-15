import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  svg,
  grain,
  paint,
  mix,
  noise,
  catmull,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "The Moonweaver's Library",
  description:
    "An ornate midnight-blue wizard's bookshelf filled with gilded spellbooks, rolled manuscripts, a luminous celestial orb, potions and dripping candles.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "MoonweaversBookshelf", paintSize: 2048 });
  const root = b.joint("cabinet", { at: [0, 0, 0] });
  const random = rng(8173);

  const C = {
    ink: "#19182e",
    dark: "#25253f",
    wood: "#343653",
    teal: "#32656c",
    tealLight: "#58988e",
    purple: "#77548e",
    red: "#914968",
    blue: "#3e658b",
    green: "#416b61",
    gold: "#dab365",
    paleGold: "#ffe5a2",
    cream: "#efdcaf",
    paper: "#dfcfa7",
    wax: "#f9e3c0",
    waxShade: "#d6b98e",
    cyan: "#70eee5",
    lavender: "#c6adff",
  };

  const wood = grain("#272b45", "#44465f", {
    size: 0.035,
    axis: "y",
    seed: 2,
  });
  const shelfWood = grain("#30344d", "#51516b", {
    size: 0.04,
    axis: "x",
    seed: 8,
  });
  const brass = metal("brass", { polish: 0.48, tarnish: 0.16 });
  const gilding = metal("gilt", { polish: 0.6, tarnish: 0.06 });
  const paper = paint((p, n) => {
    const line = Math.sin(p.y * 1600);
    return mix(
      "#c5b18c",
      "#f2e4bf",
      0.57 + 0.17 * n.y + 0.13 * line + 0.1 * noise(p, 0.04, 8),
    );
  });

  type Fill = Parameters<typeof b.part>[1];
  type P = number[] | THREE.Vector3;

  function box(
    name: string,
    at: P,
    size: number[],
    color: Fill,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function ball(name: string, at: P, radius: number, color: Fill, scale = [1, 1, 1]) {
    return b.part(new THREE.SphereGeometry(radius, 12, 8), color, {
      at,
      scale,
      bone: root,
      flat: true,
      name,
    });
  }

  function cyl(
    name: string,
    at: P,
    radius: number,
    height: number,
    color: Fill,
    dir: number[] = [0, 1, 0],
    top = radius,
    sides = 12,
  ) {
    return b.part(new THREE.CylinderGeometry(top, radius, height, sides), color, {
      at,
      dir,
      bone: root,
      name,
    });
  }

  function rod(name: string, a: P, c: P, radius: number, color: Fill) {
    return b.rod(a, c, radius, { color, bone: root, sides: 6, name });
  }

  function torus(
    name: string,
    at: P,
    radius: number,
    tube: number,
    color: Fill,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, 32), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function plate(
    name: string,
    at: P,
    width: number,
    height: number,
    texture: THREE.Texture,
    dir = [0, 0, 1],
    up = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir,
      up,
      axis: "z",
      texture,
      bone: root,
      name,
    });
  }

  function diamond(name: string, x: number, y: number, z: number, w: number, h: number) {
    return b.extrude(
      [[0, h / 2], [w / 2, 0], [0, -h / 2], [-w / 2, 0]],
      {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: gilding,
        bone: root,
        name,
      },
    );
  }

  // Drawings: four families of book bindings share a celestial visual language.
  function bindingTexture(background: string, title: string, symbol: number) {
    const emblem = [
      `<circle cx="50" cy="67" r="20" fill="none" stroke="#f7d996" stroke-width="3"/>
       <path d="M50 43L56 61L75 67L56 73L50 92L44 73L25 67L44 61Z" fill="#f7d996"/>
       <circle cx="50" cy="67" r="6" fill="${background}"/>`,
      `<path d="M63 44C28 36 24 91 63 88C39 74 42 56 63 44Z" fill="#f7d996"/>
       <path d="M70 55L73 63L81 66L73 69L70 77L67 69L59 66L67 63Z" fill="#f7d996"/>`,
      `<path d="M48 40C58 59 75 64 69 80C62 98 31 92 31 76C31 64 45 60 48 40Z" fill="none" stroke="#f7d996" stroke-width="4"/>
       <path d="M49 65C37 83 51 91 58 80Z" fill="#f7d996"/>`,
      `<path d="M50 43V94M50 68C24 68 27 49 29 47C48 47 50 59 50 68ZM50 81C75 81 74 60 72 59C55 59 50 70 50 81Z" fill="none" stroke="#f7d996" stroke-width="4"/>`,
    ][symbol];
    return svg(
      `<svg viewBox="0 0 100 360">
        <rect width="100" height="360" fill="${background}"/>
        <path d="M8 5H92V355H8Z" fill="none" stroke="#171b30" stroke-width="5"/>
        <path d="M16 12H84V348H16Z" fill="none" stroke="#dfbd76" stroke-width="2"/>
        <path d="M23 29H77M23 326H77" stroke="#f4d99e" stroke-width="3"/>
        <path d="M22 17L32 17L22 27M78 17L68 17L78 27M22 343L32 343L22 333M78 343L68 343L78 333" fill="none" stroke="#f4d99e" stroke-width="3"/>
        ${emblem}
        <text x="50" y="188" fill="#ffe5b0" font-size="19" font-family="serif" text-anchor="middle" letter-spacing="4" transform="rotate(-90 50 188)">${title}</text>
        <path d="M31 282Q50 264 69 282Q50 300 31 282ZM50 272V292" fill="none" stroke="#e4bd74" stroke-width="2.5"/>
        <text x="50" y="316" fill="#ffe5b0" font-size="12" font-family="serif" text-anchor="middle">VII</text>
      </svg>`,
      { size: 512 },
    );
  }

  const bindings = [
    bindingTexture("#36546d", "ASTRA", 0),
    bindingTexture("#654471", "LUNARIA", 1),
    bindingTexture("#793b58", "IGNIS", 2),
    bindingTexture("#355c54", "HERBARIUM", 3),
  ];

  let stars = "";
  for (let i = 0; i < 42; i++) {
    const x = 15 + random() * 570;
    const y = 12 + random() * 188;
    const r = i % 5 === 0 ? 2.1 : 1.1;
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 3 ? "#747e9c" : "#c7b183"}"/>`;
  }
  const backTexture = svg(
    `<svg viewBox="0 0 600 210">
      <rect width="600" height="210" fill="#22283e"/>
      <path d="M13 12H587V198H13Z M20 19H580V191H20Z" fill="none" stroke="#60667c" stroke-width="1.6"/>
      ${stars}
      <g stroke="#5b7787" stroke-width="1.5" fill="none">
        <path d="M50 75L122 43L173 87L236 56M355 154L399 98L465 126L525 65"/>
        <circle cx="122" cy="43" r="5"/><circle cx="399" cy="98" r="5"/>
      </g>
      <path d="M300 35L306 54L325 60L306 66L300 85L294 66L275 60L294 54Z" fill="none" stroke="#9a926e" stroke-width="1.5"/>
    </svg>`,
    { size: 768 },
  );

  const sealTexture = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="122" fill="#263349" stroke="#d3b56f" stroke-width="4"/>
      <circle cx="128" cy="128" r="108" fill="none" stroke="#8d9d9b" stroke-width="2" stroke-dasharray="2 10"/>
      <circle cx="128" cy="128" r="91" fill="none" stroke="#d3b56f" stroke-width="2"/>
      <path d="M128 38L151 104L218 128L151 152L128 218L105 152L38 128L105 104Z" fill="#92b8b0" stroke="#e2cc8d" stroke-width="3"/>
      <path d="M65 65L128 94L191 65L162 128L191 191L128 162L65 191L94 128Z" fill="none" stroke="#ddc88e" stroke-width="3"/>
      <circle cx="128" cy="128" r="29" fill="#28334b" stroke="#e8ca83" stroke-width="4"/>
      <path d="M138 107C105 105 104 153 139 150C118 139 119 119 138 107Z" fill="#e5ce9a"/>
    </svg>`,
    { size: 512 },
  );

  const manuscript = svg(
    `<svg viewBox="0 0 260 330">
      <rect width="260" height="330" fill="#ead8ab"/>
      <path d="M12 12H248V318H12Z M20 20H240V310H20Z" fill="none" stroke="#a88459" stroke-width="2"/>
      <text x="130" y="47" fill="#61476c" font-family="serif" font-size="20" text-anchor="middle">LUX • AETERNA</text>
      <g stroke="#715a80" fill="none" stroke-width="2">
        <circle cx="130" cy="135" r="57"/><circle cx="130" cy="135" r="43"/>
        <path d="M130 78L179 164H81ZM130 192L81 106H179Z"/>
        <path d="M64 135H196M130 69V201"/>
      </g>
      <circle cx="130" cy="135" r="13" fill="#b19360"/>
      <g stroke="#806746" stroke-width="3" stroke-linecap="round">
        <path d="M40 224H111M124 224H214M40 236H85M95 236H212M40 248H153M165 248H214M40 260H106M115 260H213M40 272H178M40 284H111M127 284H211"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const labelTexture = svg(
    `<svg viewBox="0 0 300 100">
      <rect x="3" y="3" width="294" height="94" rx="12" fill="#222b40" stroke="#e2c17c" stroke-width="5"/>
      <path d="M22 50L34 38L46 50L34 62ZM254 50L266 38L278 50L266 62Z" fill="#d7b56d"/>
      <text x="150" y="42" text-anchor="middle" font-family="serif" font-size="19" letter-spacing="3" fill="#eddaa4">MOONWEAVER</text>
      <text x="150" y="70" text-anchor="middle" font-family="serif" font-size="14" letter-spacing="4" fill="#a5c4bc">ARCANA • VII</text>
    </svg>`,
    { size: 512 },
  );

  const bottleLabel = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M10 5H90V115H10Z" fill="#e7d7ac" stroke="#b08c57" stroke-width="5"/>
      <path d="M50 22L56 41L76 47L56 53L50 73L44 53L24 47L44 41Z" fill="#69507d"/>
      <path d="M25 89H75M33 101H67" stroke="#69507d" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );

  // Low, chamfered exhibition plinth; the cabinet's feet really meet its top.
  cyl("octagonal_stage", [0, 0.055, 0.02], 1.31, 0.11, C.dark, [0, 1, 0], 1.27, 8)
    .mesh.scale.z = 0.61;
  cyl("stage_gold_reveal", [0, 0.09, 0.02], 1.292, 0.018, brass, [0, 1, 0], 1.292, 8)
    .mesh.scale.z = 0.61;
  cyl("stage_top", [0, 0.113, 0.02], 1.267, 0.032, shelfWood, [0, 1, 0], 1.245, 8)
    .mesh.scale.z = 0.61;

  for (const x of [-0.76, 0.76]) {
    for (const z of [-0.2, 0.22]) {
      box("cabinet_foot", [x, 0.188, z], [0.22, 0.12, 0.22], wood);
      box("foot_gilt_shoe", [x, 0.147, z], [0.235, 0.036, 0.235], brass);
    }
  }

  box("lower_plinth", [0, 0.265, 0], [1.99, 0.105, 0.68], wood);
  box("lower_plinth_bead", [0, 0.319, 0.005], [2.025, 0.022, 0.695], brass);
  box("back", [0, 1.30, -0.274], [1.78, 1.99, 0.085], wood);

  for (let level = 0; level < 3; level++) {
    plate(
      `star_inlay_back_${level}`,
      [0, 0.624 + level * 0.65, -0.229],
      1.65,
      0.55,
      backTexture,
    );
  }

  for (const s of [-1, 1]) {
    const x = s * 0.91;
    box("side_stile", [x, 1.30, 0], [0.145, 2.0, 0.63], wood);
    box("front_pilaster", [x, 1.31, 0.327], [0.105, 1.85, 0.06], C.teal);
    for (const offset of [-0.044, 0.044]) {
      box("pilaster_gold_edge", [x + offset, 1.31, 0.362], [0.008, 1.84, 0.01], brass);
    }
    box("column_foot", [x, 0.39, 0.327], [0.174, 0.12, 0.105], brass);
    box("column_capital", [x, 2.22, 0.327], [0.192, 0.105, 0.11], brass);
    for (const y of [0.59, 1.24, 1.89]) {
      diamond("pilaster_lozenge", x, y, 0.371, 0.059, 0.105);
      ball("inlaid_amethyst", [x, y, 0.386], 0.019, C.lavender, [0.72, 1, 0.45]);
    }
  }

  const floorLevels = [0.33, 0.98, 1.63];
  for (let i = 0; i < 3; i++) {
    const y = floorLevels[i];
    box("shelf", [0, y - 0.036, 0.012], [1.77, 0.072, 0.625], shelfWood);
    box("shelf_front_fascia", [0, y - 0.035, 0.337], [1.80, 0.077, 0.035], C.teal);
    box("shelf_gold_lip", [0, y + 0.004, 0.355], [1.815, 0.014, 0.025], brass);
    box("shelf_lower_bead", [0, y - 0.072, 0.356], [1.82, 0.012, 0.022], brass);
    for (const x of [-0.66, -0.33, 0, 0.33, 0.66]) {
      diamond("shelf_tiny_star", x, y - 0.034, 0.359, 0.024, 0.033);
    }
  }

  box("top_cornice", [0, 2.255, 0.005], [2.04, 0.11, 0.715], wood);
  box("cornice_gold_upper", [0, 2.315, 0.005], [2.07, 0.021, 0.73], brass);
  box("cornice_front_inlay", [0, 2.252, 0.369], [1.81, 0.057, 0.014], C.teal);
  plate("library_nameplate", [0, 2.253, 0.38], 0.49, 0.155, labelTexture);

  // Architectural pediment: a broad pointed arch and tapered crystal pinnacles.
  const archOutline: number[][] = [
    [-0.94, 0], [-0.94, 0.075], [-0.65, 0.14], [-0.42, 0.29],
    [0, 0.48], [0.42, 0.29], [0.65, 0.14], [0.94, 0.075], [0.94, 0],
  ];
  b.extrude(archOutline, {
    at: [0, 2.31, -0.19],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.13,
    color: wood,
    bone: root,
    name: "pointed_celestial_pediment",
  });

  const archTrim = [
    [-0.94, 2.39, -0.114], [-0.65, 2.455, -0.114],
    [-0.42, 2.605, -0.114], [0, 2.795, -0.114],
    [0.42, 2.605, -0.114], [0.65, 2.455, -0.114],
    [0.94, 2.39, -0.114],
  ];
  b.sweep(archTrim, 0.015, { color: brass, sides: 6, bone: root, name: "pediment_gilded_edge" });
  cyl("star_seal_mount", [0, 2.51, -0.105], 0.182, 0.025, brass, [0, 0, 1], 0.182, 32);
  plate("star_seal", [0, 2.51, -0.089], 0.345, 0.345, sealTexture);
  for (const s of [-1, 1]) {
    diamond("pediment_side_star", s * 0.48, 2.43, -0.112, 0.065, 0.09);
    box("pinnacle_pedestal", [s * 0.91, 2.355, 0.035], [0.17, 0.065, 0.20], C.teal);
    cyl("pinnacle_gold_socket", [s * 0.91, 2.405, 0.035], 0.065, 0.055, brass, [0, 1, 0], 0.05, 6);
    glow(b.part(new THREE.OctahedronGeometry(0.105), C.lavender, {
      at: [s * 0.91, 2.51, 0.035],
      scale: [0.62, 1.30, 0.62],
      bone: root,
      name: "amethyst_finial",
    }), 0.35);
  }

  b.extrude(
    [
      [0.075, 0.125], [-0.025, 0.165], [-0.12, 0.103], [-0.151, 0],
      [-0.105, -0.11], [-0.005, -0.151], [0.097, -0.092],
      [0.015, -0.079], [-0.037, -0.018], [-0.025, 0.068],
    ],
    {
      at: [0, 2.855, -0.19],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      color: gilding,
      bone: root,
      name: "crescent_moon_crown",
    },
  );
  diamond("moon_companion_star", 0.072, 2.872, -0.19, 0.065, 0.09);

  // A reusable book assembly; all details share its local placement and lean.
  function book(
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    style: number,
    lean = 0,
  ) {
    const colors = [C.blue, C.purple, C.red, C.green];
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      THREE.MathUtils.degToRad(lean),
    );
    const pivot = new THREE.Vector3(x, y + Math.abs(Math.sin(THREE.MathUtils.degToRad(lean))) * w / 2, z);
    const p = (a: number, c: number, e: number) => new THREE.Vector3(a, c, e).applyQuaternion(q).add(pivot);
    const piece = (tag: string, at: number[], size: number[], color: Fill) =>
      b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
        at: p(at[0], at[1], at[2]), quat: q, bone: root, name: `${name}_${tag}`,
      });

    piece("page_block", [0, h / 2, -0.012], [w - 0.019, h - 0.025, d - 0.035], paper);
    for (const s of [-1, 1]) {
      piece("cover", [s * (w / 2 - 0.005), h / 2, 0], [0.012, h, d], colors[style]);
    }
    piece("spine", [0, h / 2, d / 2 - 0.014], [w, h, 0.028], colors[style]);
    b.part(new THREE.PlaneGeometry(w * 0.88, h * 0.94), "#ffffff", {
      at: p(0, h / 2, d / 2 + 0.0015),
      quat: q,
      texture: bindings[style],
      bone: root,
      name: `${name}_gilded_title`,
    });
    for (const t of [0.12, 0.88]) {
      piece("raised_binding_band", [0, h * t, d / 2 + 0.005], [w + 0.008, 0.014, 0.014], brass);
    }
    if (style === 2) {
      piece("clasp", [w * 0.26, h * 0.52, d / 2 + 0.012], [0.028, 0.043, 0.016], gilding);
    }
  }

  // Lower shelf: a rhythm of heavy volumes, with parchment storage at the right.
  const lowerBooks = [
    [-0.735, 0.115, 0.45, 1], [-0.595, 0.13, 0.49, 0],
    [-0.447, 0.125, 0.43, 3], [-0.309, 0.12, 0.505, 2],
    [-0.175, 0.105, 0.465, 0], [-0.045, 0.115, 0.40, 1],
  ];
  lowerBooks.forEach(([x, w, h, style], i) =>
    book(`lower_tome_${i}`, x, 0.335, 0.08, w, h, 0.38, style),
  );
  book("leaning_lower_tome", 0.13, 0.338, 0.085, 0.102, 0.46, 0.365, 3, -11);

  // Middle shelf: clear space around the orb, then neatly arranged rare tomes.
  book("middle_tome_1", 0.275, 0.985, 0.075, 0.11, 0.445, 0.36, 2);
  book("middle_tome_2", 0.414, 0.985, 0.062, 0.135, 0.51, 0.39, 1);
  book("middle_tome_3", 0.564, 0.985, 0.065, 0.125, 0.475, 0.38, 0);
  book("middle_tome_4", 0.715, 0.985, 0.076, 0.13, 0.425, 0.36, 3);

  book("upper_tome_1", -0.733, 1.635, 0.065, 0.115, 0.47, 0.36, 0);
  book("upper_tome_2", -0.595, 1.635, 0.065, 0.125, 0.51, 0.36, 2);
  book("upper_tome_3", -0.45, 1.635, 0.06, 0.125, 0.435, 0.35, 1);

  function flatBook(name: string, at: number[], size: number[], color: string) {
    const [x, y, z] = at;
    const [w, h, d] = size;
    box(`${name}_pages`, [x, y + h / 2, z], [w - 0.022, h - 0.025, d - 0.015], paper);
    for (const yy of [y + 0.006, y + h - 0.006]) {
      box(`${name}_cover`, [x, yy, z], [w, 0.014, d], color);
    }
    box(`${name}_spine`, [x, y + h / 2, z + d / 2], [w, h, 0.019], color);
    for (const s of [-1, 1]) {
      box(`${name}_gold_band`, [x + s * w * 0.32, y + h / 2, z + d / 2 + 0.012], [0.017, h * 0.87, 0.008], brass);
    }
  }

  flatBook("upper_horizontal_book", [-0.03, 1.635, 0.055], [0.43, 0.085, 0.32], C.green);
  flatBook("upper_horizontal_book_2", [-0.015, 1.721, 0.035], [0.38, 0.075, 0.30], C.purple);

  // Scrolls have rolled end grain, visible spiral ink, and fabric ties.
  function scroll(name: string, at: number[], length: number, radius: number, axis: number[]) {
    const center = new THREE.Vector3(...at as [number, number, number]);
    const direction = new THREE.Vector3(...axis as [number, number, number]).normalize();
    const side = Math.abs(direction.y) > 0.8
      ? new THREE.Vector3(1, 0, 0)
      : new THREE.Vector3(0, 1, 0);
    const across = new THREE.Vector3().crossVectors(direction, side).normalize();
    cyl(`${name}_parchment`, center, radius, length, C.cream, axis, radius * 0.96, 12);
    cyl(`${name}_ribbon`, center, radius + 0.003, 0.035, C.red, axis, radius + 0.003, 12);
    for (const s of [-1, 1]) {
      const end = center.clone().addScaledVector(direction, s * (length / 2 + 0.001));
      cyl(`${name}_rolled_end`, end, radius * 0.92, 0.005, C.paper, axis, radius * 0.92, 12);
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const a = t * Math.PI * 5;
        const rr = radius * (0.10 + 0.73 * t);
        points.push(end.clone().addScaledVector(direction, s * 0.004)
          .addScaledVector(side, Math.cos(a) * rr)
          .addScaledVector(across, Math.sin(a) * rr));
      }
      b.sweep(points, 0.0018, { color: "#9c7b4f", sides: 4, bone: root, name: `${name}_end_spiral` });
    }
    const knot = center.clone().addScaledVector(side, radius);
    ball(`${name}_ribbon_knot`, knot, 0.016, C.red, [1, 0.7, 1]);
  }

  box("scroll_bin_bottom", [0.565, 0.355, 0.04], [0.40, 0.045, 0.40], wood);
  for (const x of [0.365, 0.765]) {
    box("scroll_bin_side", [x, 0.447, 0.04], [0.025, 0.22, 0.40], C.teal);
  }
  box("scroll_bin_front", [0.565, 0.419, 0.245], [0.42, 0.12, 0.035], C.teal);
  box("scroll_bin_rim", [0.565, 0.482, 0.247], [0.43, 0.015, 0.044], brass);
  diamond("scroll_bin_badge", 0.565, 0.419, 0.267, 0.062, 0.066);

  scroll("bin_scroll_left", [0.44, 0.602, 0.04], 0.43, 0.054, [-0.08, 1, 0.04]);
  scroll("bin_scroll_center", [0.565, 0.626, 0.026], 0.48, 0.058, [0.07, 1, -0.05]);
  scroll("bin_scroll_right", [0.69, 0.576, 0.05], 0.39, 0.052, [0.09, 1, 0.03]);

  // The divination orb is the principal accent, with brass feet and orbit bands.
  const ox = -0.51;
  const oz = 0.065;
  cyl("orb_base", [ox, 1.005, oz], 0.176, 0.045, brass, [0, 1, 0], 0.16, 8);
  cyl("orb_base_teal_inset", [ox, 1.037, oz], 0.13, 0.035, C.teal, [0, 1, 0], 0.115, 8);
  cyl("orb_stem", [ox, 1.092, oz], 0.045, 0.095, gilding, [0, 1, 0], 0.06, 8);
  cyl("orb_cup", [ox, 1.143, oz], 0.08, 0.052, brass, [0, 1, 0], 0.125, 10);

  const orb = glow(ball("luminous_divination_orb", [ox, 1.32, oz], 0.192, "#73b6e7"), 0.65);
  const orbSkin = b.surface(orb);
  const sheen = orbSkin.around([ox, 1.32, oz]).at(-26, 35);
  b.stick(new THREE.SphereGeometry(0.04, 10, 6), "#d9ffff", sheen, {
    scale: [1, 0.12, 1.65], embed: 0.1, name: "orb_large_glint",
  });
  const littleSheen = orbSkin.around([ox, 1.32, oz]).at(-6, 53);
  glow(b.stick(new THREE.SphereGeometry(0.014, 8, 6), "#e3ffff", littleSheen, {
    scale: [1, 0.2, 1], name: "orb_small_glint",
  }), 0.8);

  torus("orb_equatorial_ring", [ox, 1.32, oz], 0.21, 0.008, brass, [72, 14, 15]);
  torus("orb_inclined_ring", [ox, 1.32, oz], 0.213, 0.007, brass, [22, -30, -24]);
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [ox + s * 0.10, 1.04, oz],
        [ox + s * 0.17, 1.13, oz],
        [ox + s * 0.205, 1.30, oz],
      ]),
      [0.014, 0.009],
      { color: brass, sides: 6, bone: root, name: "orb_cradle_arm" },
    );
    ball("orb_pivot", [ox + s * 0.209, 1.32, oz], 0.022, gilding);
  }
  torus("orb_base_engraved_ring", [ox, 1.031, oz], 0.144, 0.004, C.paleGold, [90, 0, 0]);

  // Opaque jewel-coloured potion bottles read cleanly without transparency.
  function potion(name: string, x: number, y: number, z: number, r: number, color: string) {
    b.lathe(
      [[0, 0], [r * 0.75, 0], [r, 0.025], [r, 0.105],
       [r * 0.45, 0.15], [r * 0.38, 0.20], [0, 0.20]],
      { at: [x, y, z], segments: 8, color, bone: root, name: `${name}_bottle` },
    );
    cyl(`${name}_lip`, [x, y + 0.195, z], r * 0.52, 0.023, brass, [0, 1, 0], r * 0.52, 8);
    cyl(`${name}_cork`, [x, y + 0.217, z], r * 0.34, 0.028, "#b99268", [0, 1, 0], r * 0.30, 8);
    plate(`${name}_label`, [x, y + 0.077, z + r + 0.001], r * 1.15, 0.09, bottleLabel);
    rod(`${name}_glass_glint`, [x - r * 0.52, y + 0.045, z + r * 0.86],
      [x - r * 0.52, y + 0.106, z + r * 0.86], 0.005, "#b7eee2");
  }

  potion("moon_dew", -0.105, 0.985, 0.075, 0.074, "#448e8b");
  potion("violet_essence", 0.025, 0.985, -0.08, 0.052, "#7c649f");

  // Candlesticks: broad wax bodies, individual drips, curled low-poly flames.
  function candle(
    name: string,
    x: number,
    y: number,
    z: number,
    height: number,
    radius: number,
    stand = 0.025,
  ) {
    cyl(`${name}_foot`, [x, y + 0.011, z], radius * 1.65, 0.022, brass, [0, 1, 0], radius * 1.5);
    if (stand > 0.04) {
      cyl(`${name}_stem`, [x, y + stand / 2, z], radius * 0.33, stand, brass);
      ball(`${name}_stem_knop`, [x, y + stand * 0.55, z], radius * 0.65, brass, [1, 0.65, 1]);
    }
    cyl(`${name}_dish`, [x, y + stand, z], radius * 1.38, 0.023, brass, [0, 1, 0], radius * 1.55);
    const bottom = y + stand + 0.013;
    cyl(`${name}_wax`, [x, bottom + height / 2, z], radius, height, C.wax, [0, 1, 0], radius * 0.97, 10);
    cyl(`${name}_melt_pool`, [x, bottom + height + 0.001, z], radius * 0.70, 0.007, C.waxShade, [0, 1, 0], radius * 0.70, 10);
    for (let i = 0; i < 4; i++) {
      const angle = (i * 1.65) + 0.3;
      const xx = x + Math.cos(angle) * radius * 0.97;
      const zz = z + Math.sin(angle) * radius * 0.97;
      const drop = 0.025 + random() * 0.053;
      b.capsule(
        [xx, bottom + height - 0.003, zz],
        [xx, bottom + height - drop, zz],
        radius * 0.14,
        { color: C.wax, sides: 6, bone: root, name: `${name}_wax_drip` },
      );
    }
    rod(`${name}_wick`, [x, bottom + height, z], [x, bottom + height + 0.025, z], 0.004, "#47313a");
    const flameY = bottom + height + 0.02;
    glow(b.sweep(
      [[x, flameY, z], [x + 0.009, flameY + 0.04, z], [x - 0.009, flameY + 0.091, z]],
      [0.012, 0.022, 0],
      { color: "#ffb75f", sides: 7, bone: root, name: `${name}_amber_flame` },
    ), 1.6);
    glow(b.sweep(
      [[x, flameY, z + 0.012], [x + 0.003, flameY + 0.031, z + 0.014], [x - 0.004, flameY + 0.062, z + 0.009]],
      [0.008, 0.012, 0],
      { color: "#fff1ba", sides: 6, bone: root, name: `${name}_flame_heart` },
    ), 2);
  }

  candle("upper_tall_candle", 0.64, 1.635, -0.015, 0.22, 0.045, 0.14);
  candle("upper_short_candle", 0.44, 1.635, 0.17, 0.155, 0.043, 0.035);
  candle("upper_back_candle", 0.79, 1.635, -0.12, 0.15, 0.033, 0.07);

  // A loose illuminated manuscript rests on the stacked books.
  box("manuscript_support", [-0.01, 1.815, 0.04], [0.285, 0.037, 0.24], C.dark, [-12, 0, 0]);
  const sheet = b.part(new THREE.BoxGeometry(0.286, 0.008, 0.29), C.cream, {
    at: [-0.01, 1.845, 0.04], rotation: [-12, 0, 0], bone: root, name: "laid_out_manuscript",
  });
  const sheetNormal = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), -12 * Math.PI / 180);
  const sheetUp = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), -12 * Math.PI / 180);
  b.part(new THREE.PlaneGeometry(0.274, 0.278), "#ffffff", {
    at: new THREE.Vector3(-0.01, 1.845, 0.04).addScaledVector(sheetNormal, 0.0048),
    dir: sheetNormal, up: sheetUp, axis: "z",
    texture: manuscript, bone: root, name: "manuscript_illuminations",
  });

  // Restrained foreground grouping frames rather than obscures the cabinet.
  flatBook("floor_atlas", [-0.68, 0.132, 0.52], [0.38, 0.07, 0.29], C.red);
  scroll("loose_floor_scroll", [-0.62, 0.25, 0.53], 0.42, 0.045, [1, 0, 0.08]);
  candle("floor_candle", 0.88, 0.132, 0.49, 0.15, 0.046, 0.025);

  // A little key lies beside the scroll: the library's last narrative detail.
  torus("small_brass_key_bow", [-0.31, 0.14, 0.53], 0.025, 0.006, brass, [90, 0, 0]);
  rod("small_brass_key_shaft", [-0.285, 0.141, 0.53], [-0.19, 0.141, 0.53], 0.007, brass);
  box("key_tooth_one", [-0.201, 0.142, 0.545], [0.012, 0.013, 0.032], brass);
  box("key_tooth_two", [-0.223, 0.142, 0.541], [0.009, 0.013, 0.023], brass);

  // Tiny studs punctuate the construction without competing with the volumes.
  for (const x of [-0.96, 0.96]) {
    for (const y of [0.266, 2.255]) {
      ball("frame_rivet", [x, y, 0.372], 0.012, gilding, [1, 1, 0.48]);
    }
  }

  // Keep the named manuscript support accessible to editor tooling.
  sheet.mesh.userData.description = "Loose parchment resting on the upper stack";
  root.object.userData.category = "Prop group";
  return b.root;
}
