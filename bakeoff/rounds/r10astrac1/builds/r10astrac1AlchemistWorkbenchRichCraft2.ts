import * as THREE from "three";
import {
  createBuilder, rng, svg, paint, mix, noise, mottle,
  catmull, bezier,
} from "../../../../src/index";
import type { Fill } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

/*
1. Replace the overly busy wood/page grain with quiet, hand-painted surfaces:
   the bottles, gilding and illustrations should lead, not surface noise.
2. Conform the celestial drawing to its arched backing, move the crossbar
   behind it, and seat the crown, herb hooks and floor inlays properly.
3. Add a midnight-blue embroidered work runner, shaped side ornaments and
   brighter botanical accents for a more distinctive fantasy-academy identity.
4. Open the receiving flask beneath the condenser and strengthen the warm
   burner/cool elixir contrast without adding floating decorative effects.
*/

export const meta = {
  name: "The Aster Atelier",
  description:
    "A gilded botanical alchemist's workbench with a celestial arched hutch, luminous mint alembic, brass balance, illustrated grimoires, suspended herbs and an embroidered midnight-blue work runner.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "The Aster Atelier", paintSize: 2048 });
  const root = b.joint("workbench", { at: [0, 0, 0] });
  const random = rng(417);
  const C = {
    ink: "#182a38",
    woodDark: "#263b3b",
    wood: "#42605a",
    teal: "#267678",
    tealLight: "#4da8a0",
    gold: "#d8ac59",
    goldLight: "#f7db91",
    brassDark: "#86623c",
    cream: "#eee5bd",
    page: "#e4d6ab",
    pageShadow: "#b7a77b",
    violet: "#6b5291",
    purple: "#b294dd",
    coral: "#dc8969",
    green: "#4e8561",
    mint: "#9edbb0",
    leafDark: "#285c50",
    rope: "#b9a374",
    stone: "#52626c",
    cork: "#aa7650",
    cloth: "#344c72",
  };

  // Broad colour variation, with sparse fine grain instead of high-contrast noise.
  const wood = paint((p, n) => {
    const broad = noise(p, 0.38, 5);
    const grainPoint = new THREE.Vector3(p.x * 0.085, p.y, p.z);
    const streak = noise(grainPoint, 0.045, 7);
    const light = 0.25 + broad * 0.18 + streak * 0.08 + Math.max(0, n.y) * 0.2;
    return mix("#293f3d", "#70846a", light);
  });
  const gold = paint((p, n) =>
    mix("#98713c", "#f1d28b",
      0.42 + 0.37 * Math.max(0, n.y) + 0.07 * noise(p, 0.09, 13)),
  );
  const stone = mottle("#485b66", "#6c7c7e", {
    size: 0.3, seed: 18, contrast: 0.45,
  });
  const ceramic = paint((_p, n) =>
    mix("#a8bdad", "#f1efd3", 0.6 + n.y * 0.3),
  );
  const parchment = paint((p, n) =>
    mix("#d6c59b", "#f0e5c4",
      0.55 + noise(p, 0.15, 32) * 0.13 + Math.max(0, n.y) * 0.14),
  );
  const pageEdges = paint((p, n) => {
    const lines = Math.pow(0.5 + 0.5 * Math.cos(p.y * Math.PI * 2 / 0.004), 10);
    return mix("#e8dbb7", "#bdac82", Math.abs(n.y) < 0.5 ? lines * 0.24 : 0.04);
  });

  function box(
    at: number[], size: number[], color: Fill,
    name?: string, rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone: root, rotation, name,
    });
  }
  function ball(at: number[], size: number[], color: Fill, name?: string) {
    return b.part(new THREE.SphereGeometry(1, 10, 6), color, {
      at, scale: size, bone: root, name, flat: true,
    });
  }
  function cylinder(
    at: number[], radius: number, height: number,
    color: Fill, name?: string, top = radius,
  ) {
    return b.part(new THREE.CylinderGeometry(top, radius, height, 12), color, {
      at, bone: root, name,
    });
  }
  function rod(a: number[], end: number[], radius: number, color: Fill) {
    return b.rod(a, end, radius, { color, bone: root, sides: 6 });
  }
  function ring(
    at: number[], radius: number, tube: number, color: Fill,
    normal: number[] = [0, 1, 0], name?: string,
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 20), color, {
      at, dir: normal, axis: "z", bone: root, name,
    });
  }
  function drawing(
    texture: THREE.Texture, at: number[], size: number[],
    normal: number[] = [0, 0, 1], up: number[] = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at, dir: normal, up, axis: "z", bone: root, texture,
    });
  }
  function star(at: number[], radius: number, color: Fill, thickness = 0.008) {
    const outline: number[][] = [];
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + i * Math.PI / 4;
      const r = i % 2 === 0 ? radius : radius * 0.24;
      outline.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return b.extrude(outline, {
      at, x: [1, 0, 0], y: [0, 1, 0], thickness, color, bone: root,
    });
  }
  function labelTexture(symbol: string, text: string, accent: string) {
    return svg(
      `<svg viewBox="0 0 128 150" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 8H115V126L101 142H27L13 126Z" fill="#efe6c6" stroke="#735a44" stroke-width="5"/>
        <path d="M23 18H105V122L96 132H32L23 122Z" fill="none" stroke="${accent}" stroke-width="3"/>
        <path d="M28 35H47M81 35H100M28 111H100" stroke="#ac884d" stroke-width="3"/>
        <g fill="${accent}" stroke="${accent}" stroke-width="3">${symbol}</g>
        <text x="64" y="102" text-anchor="middle" fill="#394b4c" font-family="serif" font-size="15" font-weight="bold">${text}</text>
        <path d="M39 120H89M49 125H79" stroke="#a89670" stroke-width="2.5"/>
      </svg>`, { size: 256 },
    );
  }

  const moonLabel = labelTexture(
    `<path d="M75 43A25 25 0 1 0 79 80A22 22 0 0 1 75 43Z"/>
     <path d="M86 45L89 54L98 57L89 60L86 69L83 60L74 57L83 54Z"/>`,
    "LUNA", "#6f5895",
  );
  const leafLabel = labelTexture(
    `<path d="M42 77Q37 45 84 42Q89 77 42 77Z" fill="none" stroke-width="5"/>
     <path d="M43 78L77 49M58 62V48M59 62L78 64" fill="none" stroke-width="3"/>`,
    "VIRIDIS", "#36796e",
  );
  const sunLabel = labelTexture(
    `<path d="M64 40L69 57L87 62L69 67L64 84L59 67L41 62L59 57Z"/>
     <circle cx="64" cy="62" r="27" fill="none" stroke-width="2"/>`,
    "AURUM", "#bd8241",
  );

  // The drawing itself is arched and transparent outside its border.
  const celestial = svg(
    `<svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 470V145Q10 30 200 10Q390 30 390 145V470Z" fill="#173b48"/>
      <path d="M22 451V143Q22 24 200 24Q378 24 378 143V451Z"
        fill="none" stroke="#c9a864" stroke-width="5"/>
      <path d="M36 440V146Q36 42 200 42Q364 42 364 146V440Z"
        fill="none" stroke="#568c86" stroke-width="3"/>
      <g fill="none" stroke="#81b5a5">
        <circle cx="200" cy="226" r="128" stroke-width="2.5"/>
        <circle cx="200" cy="226" r="107" stroke-width="2"/>
        <ellipse cx="200" cy="226" rx="128" ry="47" transform="rotate(-35 200 226)" stroke-width="3"/>
        <ellipse cx="200" cy="226" rx="128" ry="47" transform="rotate(35 200 226)" stroke-width="2"/>
        <path d="M72 226H328M200 98V354" stroke-width="2" stroke-dasharray="6 9"/>
      </g>
      <g fill="#eed492">
        <path d="M200 146L216 210L280 226L216 242L200 306L184 242L120 226L184 210Z"/>
        <circle cx="200" cy="97" r="7"/><circle cx="328" cy="226" r="7"/>
        <circle cx="72" cy="226" r="7"/><circle cx="200" cy="355" r="7"/>
        <path d="M89 119L94 134L109 139L94 144L89 159L84 144L69 139Z"/>
        <path d="M309 300L313 312L325 316L313 320L309 332L305 320L293 316L305 312Z"/>
      </g>
      <circle cx="200" cy="226" r="24" fill="#173b48" stroke="#f5dfab" stroke-width="4"/>
      <path d="M200 208L205 221L218 226L205 231L200 244L195 231L182 226L195 221Z" fill="#91dfce"/>
      <text x="200" y="397" text-anchor="middle" font-family="serif" font-size="25" letter-spacing="5" fill="#ead69e">ASTER</text>
      <text x="200" y="425" text-anchor="middle" font-family="serif" font-size="13" letter-spacing="3" fill="#9cc9b9">ARS • NATURAE</text>
      <path d="M158 68H242M176 78H224" stroke="#d2b472" stroke-width="3"/>
    </svg>`, { size: 512 },
  );
  const bookCover = svg(
    `<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="320" fill="#284e61"/>
      <path d="M15 15H225V305H15Z M25 25H215V295H25Z" fill="none" stroke="#dbbd78" stroke-width="3"/>
      <path d="M37 45V83M37 45H75M203 45V83M203 45H165
        M37 275V237M37 275H75M203 275V237M203 275H165" fill="none" stroke="#e7cb8b" stroke-width="6"/>
      <circle cx="120" cy="150" r="63" fill="none" stroke="#80aeb3" stroke-width="3"/>
      <path d="M120 76L135 134L190 150L135 166L120 224L105 166L50 150L105 134Z"
        fill="none" stroke="#e9d297" stroke-width="5"/>
      <path d="M120 112L128 142L155 150L128 158L120 188L112 158L85 150L112 142Z" fill="#dfc98c"/>
      <text x="120" y="258" text-anchor="middle" font-family="serif" font-size="15" letter-spacing="2" fill="#ead8a4">HERBARIUM</text>
      <path d="M80 270H160" stroke="#b4c6b8" stroke-width="3"/>
    </svg>`, { size: 384 },
  );
  const recipe = svg(
    `<svg viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="300" fill="#e9dcb5"/>
      <path d="M15 15H225V285H15Z" fill="none" stroke="#b59c69" stroke-width="3"/>
      <text x="120" y="42" text-anchor="middle" font-family="serif" font-size="19" fill="#466462">Lunar Distillation</text>
      <g stroke="#57796b" fill="none" stroke-width="3">
        <path d="M80 68H110M88 68V99Q54 148 95 155Q136 148 102 99V68"/>
        <path d="M66 132Q95 121 123 132M95 156V177M70 178H120"/>
        <path d="M162 84V170M162 109Q137 99 142 81Q163 84 162 109Z
          M162 134Q185 127 184 105Q163 110 162 134Z"/>
      </g>
      <g fill="none" stroke="#95805b" stroke-width="3" stroke-linecap="round">
        <path d="M36 201H154M36 213H198M36 225H182M36 249H119M36 261H166"/>
        <circle cx="192" cy="251" r="17"/>
        <path d="M192 236V266M177 251H207"/>
      </g>
    </svg>`, { size: 384 },
  );
  const apronTexture = svg(
    `<svg viewBox="0 0 640 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#d8b975" stroke-width="4">
        <path d="M15 20H245L270 50L245 80H15M625 20H395L370 50L395 80H625"/>
        <path d="M35 34H218M35 66H218M422 34H605M422 66H605"/>
        <path d="M270 50L320 7L370 50L320 93Z"/>
      </g>
      <path d="M320 18L329 41L352 50L329 59L320 82L311 59L288 50L311 41Z" fill="#f1d697"/>
      <g fill="#80b8a8"><circle cx="256" cy="50" r="5"/><circle cx="384" cy="50" r="5"/></g>
    </svg>`, { size: 768 },
  );
  const embroidery = svg(
    `<svg viewBox="0 0 240 360" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 7V353M224 7V353" stroke="#d8c082" stroke-width="3" fill="none"/>
      <path d="M27 7V353M213 7V353" stroke="#809fb2" stroke-width="2" stroke-dasharray="4 6" fill="none"/>
      <g fill="none" stroke="#d7c28c" stroke-width="3">
        <path d="M120 36L173 100L120 164L67 100Z"/>
        <circle cx="120" cy="100" r="42"/>
        <path d="M120 196V308M120 236Q82 227 78 199Q117 203 120 236Z
          M120 261Q159 247 163 223Q124 230 120 261Z
          M120 286Q83 278 80 254Q116 262 120 286Z"/>
      </g>
      <path d="M120 62L129 91L158 100L129 109L120 138L111 109L82 100L111 91Z" fill="#e4d29a"/>
      <path d="M60 328H180M82 337H158" stroke="#d8c082" stroke-width="3"/>
    </svg>`, { size: 384 },
  );

  // Small academy-floor stage.
  b.part(new THREE.CylinderGeometry(1, 1.02, 0.075, 10), C.ink, {
    at: [0, 0.0375, 0], scale: [1.3, 1, 0.82], bone: root,
    name: "ten-sided stone footing",
  });
  b.part(new THREE.CylinderGeometry(0.99, 0.99, 0.012, 10), stone, {
    at: [0, 0.079, 0], scale: [1.3, 1, 0.82], bone: root,
  });
  const floorRim: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI * 2 / 10;
    floorRim.push([1.244 * Math.sin(a), 0.087, 0.785 * Math.cos(a)]);
  }
  b.sweep([...floorRim, floorRim[0]], 0.006, {
    color: C.brassDark, bone: root, sides: 4,
  });
  for (const x of [-0.71, 0, 0.71]) {
    rod([x, 0.087, -0.57], [x, 0.087, 0.57], 0.0025, "#82928f");
  }

  // Carved furniture with square feet and gilded joinery.
  for (const x of [-0.86, 0.86]) {
    for (const z of [-0.32, 0.32]) {
      box([x, 0.53, z], [0.12, 0.89, 0.12], wood, "square carved leg");
      box([x, 0.135, z], [0.157, 0.1, 0.157], C.woodDark);
      box([x, 0.197, z], [0.143, 0.024, 0.143], gold);
      box([x, 0.873, z], [0.15, 0.15, 0.15], C.teal);
      box([x, 0.94, z], [0.163, 0.025, 0.163], gold);
      if (z > 0) {
        box([x, 0.566, z + 0.062], [0.018, 0.48, 0.007], gold);
        star([x, 0.869, z + 0.081], 0.042, C.goldLight);
      }
    }
  }
  box([0, 0.331, 0], [1.84, 0.062, 0.7], wood, "lower storage shelf");
  box([0, 0.363, 0.344], [1.86, 0.018, 0.024], gold);
  box([0, 0.85, 0.365], [1.77, 0.19, 0.075], C.woodDark, "front apron");
  box([0, 0.944, 0.41], [1.91, 0.022, 0.026], gold);
  drawing(apronTexture, [0, 0.85, 0.405], [1.54, 0.17]);

  for (const x of [-0.94, 0.94]) {
    box([x, 0.862, 0], [0.06, 0.17, 0.77], C.woodDark);
    for (const z of [-0.26, 0.26]) {
      b.extrude([[0, 0], [0.16, 0], [0, -0.19]], {
        at: [x > 0 ? x - 0.055 : x + 0.055, 0.94, z],
        x: [x > 0 ? -1 : 1, 0, 0], y: [0, 1, 0],
        thickness: 0.044, color: C.teal, bone: root,
      });
    }
    // Readable ornament on the otherwise plain side apron.
    b.extrude(
      [[0, 0.053], [0.082, 0], [0, -0.053], [-0.082, 0]],
      {
        at: [x + Math.sign(x) * 0.034, 0.865, 0],
        x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.008, color: gold, bone: root,
      },
    );
    b.extrude(
      [[0, 0.034], [0.051, 0], [0, -0.034], [-0.051, 0]],
      {
        at: [x + Math.sign(x) * 0.039, 0.865, 0],
        x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.009, color: C.teal, bone: root,
      },
    );
    for (const s of [-1, 1]) {
      rod(
        [x + Math.sign(x) * 0.034, 0.865, s * 0.11],
        [x + Math.sign(x) * 0.034, 0.865, s * 0.3],
        0.005, gold,
      );
    }
  }

  box([0, 0.987, 0], [2.03, 0.086, 0.9], C.woodDark, "tabletop underframe");
  for (let i = 0; i < 5; i++) {
    box([0, 1.039, -0.352 + i * 0.176], [2.045, 0.042, 0.172],
      wood, "individual tabletop plank");
  }
  box([0, 1.028, 0.451], [2.06, 0.035, 0.025], gold);
  for (const x of [-1.018, 1.018]) {
    box([x, 1.032, 0], [0.026, 0.05, 0.92], gold);
    for (const z of [-0.36, 0.36]) {
      box([x * 0.965, 1.063, z], [0.085, 0.009, 0.13], gold);
      for (const dz of [-0.035, 0.035]) {
        ball([x * 0.965, 1.071, z + dz], [0.009, 0.005, 0.009], C.goldLight);
      }
    }
  }

  // A tailored cloth under the book stack, turning over the front lip.
  box([0.68, 1.063, 0.064], [0.43, 0.004, 0.77], C.cloth, "midnight-blue work runner");
  for (const x of [0.476, 0.884]) {
    rod([x, 1.066, -0.32], [x, 1.066, 0.445], 0.003, C.goldLight);
  }
  b.slab(
    [
      [0.465, 1.063, 0.449], [0.895, 1.063, 0.449],
      [0.895, 0.735, 0.469], [0.68, 0.666, 0.475],
      [0.465, 0.735, 0.469],
    ],
    { color: C.cloth, thickness: 0.006, bone: root, name: "pointed embroidered runner fall" },
  );
  drawing(embroidery, [0.68, 0.858, 0.481], [0.39, 0.328]);
  b.sweep(
    [[0.469, 1.06, 0.455], [0.469, 0.737, 0.475],
      [0.68, 0.671, 0.481], [0.891, 0.737, 0.475], [0.891, 1.06, 0.455]],
    0.0035, { color: C.goldLight, bone: root, sides: 4 },
  );
  rod([0.68, 0.675, 0.476], [0.68, 0.642, 0.477], 0.006, gold);
  ball([0.68, 0.641, 0.477], [0.012, 0.014, 0.012], gold);
  for (let i = -1; i <= 1; i++) {
    rod([0.68 + i * 0.005, 0.632, 0.477],
      [0.68 + i * 0.009, 0.592, 0.478], 0.004, C.goldLight);
  }

  // Hutch uprights and individual shelves.
  for (const s of [-1, 1]) {
    const x = s * 0.92;
    box([x, 1.51, -0.378], [0.065, 0.9, 0.07], C.woodDark, "hutch upright");
    box([x, 1.51, -0.337], [0.015, 0.86, 0.012], gold);
    cylinder([x, 1.983, -0.378], 0.048, 0.05, gold);
    ball([x, 2.024, -0.378], [0.033, 0.042, 0.033], C.tealLight);
    box([s * 0.638, 1.557, -0.365], [0.605, 0.045, 0.242], wood);
    box([s * 0.638, 1.58, -0.238], [0.622, 0.022, 0.025], gold);
    for (const xx of [s * 0.39, s * 0.86]) {
      b.extrude([[0, 0], [0.16, 0], [0, -0.15]], {
        at: [xx, 1.534, -0.45], x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.025, color: C.teal, bone: root,
      });
    }
  }
  // The rail is behind the board, no longer striking across its illustration.
  box([0, 1.91, -0.475], [1.86, 0.065, 0.07], C.woodDark);
  box([0, 1.948, -0.475], [1.88, 0.012, 0.077], gold);
  for (const x of [-0.92, 0.92]) {
    box([x, 1.915, -0.432], [0.07, 0.07, 0.075], C.woodDark);
  }

  const arch = [
    [-0.36, 0], [0.36, 0], [0.36, 0.54],
    [0.31, 0.65], [0.2, 0.735], [0, 0.78],
    [-0.2, 0.735], [-0.31, 0.65], [-0.36, 0.54],
  ];
  b.extrude(arch, {
    at: [0, 1.235, -0.44], x: [1, 0, 0], thickness: 0.048,
    color: gold, bone: root, name: "gilded arched celestial backboard",
  });
  const innerArch = b.extrude(
    [
      [-0.337, 0.024], [0.337, 0.024], [0.337, 0.535],
      [0.289, 0.633], [0.189, 0.712], [0, 0.755],
      [-0.189, 0.712], [-0.289, 0.633], [-0.337, 0.535],
    ],
    {
      at: [0, 1.235, -0.411], x: [1, 0, 0], thickness: 0.008,
      color: "#173b48", bone: root, name: "arched enamel chart inset",
    },
  );
  b.decal(innerArch, celestial, {
    at: [0, 1.615, -0.406], dir: [0, 0, 1],
    size: [0.674, 0.737], segments: 24, lift: 0.0015, bone: root,
  });
  // Crown physically grows from the top of the arch.
  star([0, 2.033, -0.432], 0.076, gold, 0.023);
  glow(star([0, 2.033, -0.414], 0.037, "#b7f4d9", 0.008), 0.65);
  for (const s of [-1, 1]) {
    b.extrude(
      [[0, 0], [0.08, 0.024], [0.14, 0.081], [0.09, 0.079],
        [0.043, 0.051], [0, 0.04]],
      {
        at: [s * 0.052, 2.003, -0.433], x: [s, 0, 0],
        y: [0, 1, 0], thickness: 0.015, color: gold, bone: root,
      },
    );
  }

  function potion(
    x: number, y: number, z: number, r: number, h: number,
    liquid: string, glass: string, label: THREE.Texture,
    luminous = false, open = false,
  ) {
    const body = b.lathe(
      [
        [0, 0], [r * 0.68, 0], [r * 0.93, h * 0.045],
        [r, h * 0.18], [r, h * 0.43],
        [r * 0.92, h * 0.52], [0, h * 0.52],
      ],
      {
        at: [x, y, z], segments: 10, color: liquid, bone: root,
        name: "faceted elixir reservoir",
      },
    );
    if (luminous) glow(body, 0.45);
    b.lathe(
      [
        [0, h * 0.515], [r * 0.925, h * 0.515],
        [r * 0.84, h * 0.61], [r * 0.39, h * 0.74],
        [r * 0.35, h * 0.88], [r * 0.23, h * 0.88],
        [r * 0.23, h * 0.75], [0, h * 0.71],
      ],
      {
        at: [x, y, z], segments: 10, color: glass, bone: root,
        name: "sloped glass shoulder and hollow neck",
      },
    );
    ring([x, y + h * 0.86, z], r * 0.37, r * 0.085, glass);
    if (open) {
      cylinder([x, y + h * 0.75, z], r * 0.21, 0.003, C.ink);
    } else {
      cylinder([x, y + h * 0.915, z], r * 0.295, h * 0.115, C.cork);
      cylinder([x, y + h * 0.969, z], r * 0.32, h * 0.018, gold);
    }
    ring([x, y + h * 0.746, z], r * 0.4, 0.004, C.rope);
    b.decal(body, label, {
      at: [x, y + h * 0.29, z + r], dir: [0, 0, 1],
      size: [r * 1.12, h * 0.33], segments: 5,
      lift: 0.0018, bone: root,
    });
    b.sweep(
      [
        [x - r * 0.6, y + h * 0.18, z + r * 0.79],
        [x - r * 0.65, y + h * 0.38, z + r * 0.75],
        [x - r * 0.56, y + h * 0.49, z + r * 0.79],
      ],
      r * 0.065, { color: glass, bone: root, sides: 4, caps: "round" },
    );
    return body;
  }

  potion(-0.79, 1.583, -0.36, 0.064, 0.26, "#a88bcf", "#d6c7e6", moonLabel);
  potion(-0.61, 1.583, -0.36, 0.056, 0.3, "#5aaba3", "#b6ddcb", leafLabel, true);
  potion(-0.43, 1.583, -0.36, 0.052, 0.2, "#d5a45a", "#e9d8ac", sunLabel);
  potion(0.45, 1.583, -0.36, 0.055, 0.24, "#8d75b9", "#d4c4e2", moonLabel);
  potion(0.63, 1.583, -0.36, 0.061, 0.29, "#dc9478", "#eed4b7", sunLabel);
  potion(0.8, 1.583, -0.35, 0.046, 0.2, "#62aa87", "#c1ddba", leafLabel);

  // Alembic and burner.
  const ax = 0.035;
  const az = -0.045;
  cylinder([ax, 1.08, az], 0.145, 0.035, C.ink);
  cylinder([ax, 1.103, az], 0.122, 0.024, gold);
  cylinder([ax, 1.13, az], 0.063, 0.045, C.teal);
  ring([ax, 1.155, az], 0.064, 0.008, gold);
  glow(
    b.part(new THREE.OctahedronGeometry(0.035), "#ffc977", {
      at: [ax, 1.183, az], scale: [0.72, 1.48, 0.72],
      bone: root, name: "warm alchemical burner flame",
    }), 1.6,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.02), "#fff3c5", {
      at: [ax, 1.176, az + 0.011], scale: [0.65, 1.3, 0.65], bone: root,
    }), 1.9,
  );
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    rod([ax + dx * 0.105, 1.108, az + dz * 0.105],
      [ax + dx * 0.108, 1.257, az + dz * 0.108], 0.009, gold);
  }
  ring([ax, 1.255, az], 0.115, 0.012, gold);
  const mainFlask = b.lathe(
    [
      [0, 0], [0.071, 0.008], [0.11, 0.046],
      [0.125, 0.105], [0.116, 0.17], [0.087, 0.215], [0, 0.215],
    ],
    { at: [ax, 1.221, az], color: "#60c4ae", segments: 12, bone: root },
  );
  glow(mainFlask, 0.55);
  b.lathe(
    [
      [0, 0.211], [0.089, 0.211], [0.057, 0.253],
      [0.031, 0.271], [0.031, 0.323], [0, 0.323],
    ],
    { at: [ax, 1.221, az], color: "#c0e8d2", segments: 12, bone: root },
  );
  b.decal(mainFlask, leafLabel, {
    at: [ax, 1.335, az + 0.126], dir: [0, 0, 1],
    size: [0.092, 0.112], bone: root, segments: 6,
  });
  b.sweep(
    bezier([ax - 0.074, 1.271, az + 0.082],
      [ax - 0.119, 1.353, az + 0.06],
      [ax - 0.068, 1.418, az + 0.061]),
    0.007, { color: "#ddffee", bone: root, sides: 5 },
  );
  cylinder([ax, 1.552, az], 0.044, 0.031, gold);
  b.sweep(
    catmull([
      [ax, 1.565, az], [ax + 0.015, 1.647, az],
      [0.16, 1.674, az], [0.305, 1.57, az],
      [0.39, 1.462, az], [0.39, 1.339, az],
    ]),
    [0.021, 0.014],
    {
      color: gold, bone: root, sides: 8, caps: "flat",
      name: "alembic swan-neck condenser",
    },
  );
  for (let i = 0; i < 4; i++) {
    ring([0.39, 1.38 + i * 0.022, az], 0.022, 0.0045,
      i % 2 ? C.teal : C.goldLight);
  }
  potion(0.39, 1.063, az, 0.068, 0.29,
    "#69bcb3", "#c1e9d9", leafLabel, true, true);

  // Brass balance, shallow pans and separate suspensions.
  const sx = -0.59;
  const sz = 0.105;
  b.lathe(
    [[0, 0], [0.115, 0], [0.115, 0.022], [0.087, 0.045], [0.042, 0.054], [0, 0.054]],
    { at: [sx, 1.061, sz], color: C.ink, bone: root, segments: 12 },
  );
  cylinder([sx, 1.111, sz], 0.084, 0.013, gold);
  rod([sx, 1.115, sz], [sx, 1.462, sz], 0.014, gold);
  for (const yy of [1.147, 1.414]) cylinder([sx, yy, sz], 0.028, 0.018, gold);
  ball([sx, 1.48, sz], [0.032, 0.032, 0.032], C.goldLight);
  star([sx, 1.532, sz], 0.045, gold, 0.013);
  rod([sx - 0.232, 1.46, sz], [sx + 0.232, 1.46, sz], 0.012, gold);
  rod([sx, 1.455, sz + 0.025], [sx + 0.017, 1.38, sz + 0.025], 0.004, C.ink);
  for (const s of [-1, 1]) {
    const px = sx + s * 0.205;
    const panY = 1.205;
    ring([px, 1.457, sz], 0.017, 0.004, C.goldLight, [0, 0, 1]);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + i * Math.PI * 2 / 3;
      rod([px, 1.441, sz],
        [px + Math.cos(a) * 0.091, panY + 0.026, sz + Math.sin(a) * 0.091],
        0.003, C.goldLight);
    }
    b.lathe(
      [
        [0, 0], [0.052, 0], [0.091, 0.017], [0.099, 0.032],
        [0.091, 0.036], [0.048, 0.01], [0, 0.01],
      ],
      { at: [px, panY, sz], color: gold, bone: root, segments: 12 },
    );
    ring([px, panY + 0.034, sz], 0.094, 0.004, C.goldLight);
    if (s === -1) {
      for (let i = 0; i < 3; i++) {
        cylinder([px - 0.035 + i * 0.034, panY + 0.024, sz],
          0.018, 0.023 + i * 0.006, C.brassDark);
        ball([px - 0.035 + i * 0.034, panY + 0.041 + i * 0.003, sz],
          [0.009, 0.009, 0.009], gold);
      }
    } else {
      for (const d of [[-0.025, 0.016], [0.02, 0.01], [0, -0.022]]) {
        b.part(new THREE.OctahedronGeometry(0.026), "#a7d9c1", {
          at: [px + d[0], panY + 0.031, sz + d[1]],
          scale: [0.75, 1, 0.65], bone: root,
          rotation: [0, random() * 90, 20],
        });
      }
    }
  }

  function book(
    at: number[], w: number, h: number, d: number,
    color: string, yaw: number, decorated = true,
  ) {
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0), yaw * Math.PI / 180,
    );
    const p = (x: number, y: number, z: number) =>
      new THREE.Vector3(x, y, z).applyQuaternion(q).add(new THREE.Vector3(...at));
    const part = (size: number[], pos: number[], fill: Fill) =>
      b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), fill, {
        at: p(pos[0], pos[1], pos[2]), quat: q, bone: root,
      });
    part([w, 0.013, d], [0, 0.0065, 0], color);
    part([w - 0.025, h - 0.026, d - 0.025], [0.005, h / 2, 0], pageEdges);
    part([w, 0.013, d], [0, h - 0.0065, 0], color);
    part([0.022, h, d], [-w / 2 + 0.009, h / 2, 0], color);
    for (const zz of [-d * 0.34, d * 0.34]) {
      part([0.029, h + 0.006, 0.014], [-w / 2 + 0.008, h / 2, zz], gold);
    }
    for (const xx of [-1, 1]) {
      for (const zz of [-1, 1]) {
        part([0.041, 0.004, 0.03],
          [xx * (w / 2 - 0.025), h + 0.002, zz * (d / 2 - 0.02)], gold);
      }
    }
    for (let i = 0; i < 3; i++) {
      part([w - 0.035, 0.001, 0.002],
        [0.005, 0.022 + i * (h - 0.04) / 3, d / 2 - 0.011], C.pageShadow);
    }
    if (decorated) {
      const faceQ = q.clone().multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2),
      );
      b.part(new THREE.PlaneGeometry(w - 0.04, d - 0.035), "#ffffff", {
        at: p(0, h + 0.0025, 0), quat: faceQ, bone: root, texture: bookCover,
      });
    }
    part([0.021, 0.003, 0.075], [w * 0.19, h * 0.57, d / 2 + 0.019], C.coral);
  }
  book([0.686, 1.066, 0.19], 0.35, 0.071, 0.34, C.violet, -7, false);
  book([0.67, 1.137, 0.185], 0.32, 0.082, 0.32, C.teal, 7, true);
  book([0.61, 0.367, -0.015], 0.38, 0.09, 0.39, C.coral, -3, false);
  book([0.62, 0.457, -0.01], 0.36, 0.075, 0.35, C.teal, 5, true);

  // Recipe sheet and quill.
  box([0.12, 1.065, 0.303], [0.274, 0.006, 0.24], parchment,
    "loose recipe parchment");
  drawing(recipe, [0.12, 1.070, 0.303], [0.255, 0.224], [0, 1, 0], [0, 0, -1]);
  for (const x of [-0.012, 0.252]) {
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.239, 8), parchment, {
      at: [x, 1.074, 0.303], dir: [0, 0, 1], bone: root,
    });
  }
  cylinder([0.34, 1.089, 0.319], 0.033, 0.052, C.ink);
  ring([0.34, 1.116, 0.319], 0.025, 0.005, gold);
  rod([0.338, 1.113, 0.318], [0.404, 1.293, 0.292], 0.003, C.goldLight);
  b.extrude(
    [[0, 0], [-0.018, 0.055], [-0.011, 0.105], [0.003, 0.141],
      [0.017, 0.09], [0.014, 0.037]],
    {
      at: [0.371, 1.197, 0.302], x: [1, 0, 0], y: [0.34, 1, -0.12],
      thickness: 0.0025, color: C.cream, bone: root, name: "ivory writing quill",
    },
  );

  function leaf(at: number[], tip: number[], width: number, color: Fill) {
    const start = new THREE.Vector3(...at);
    const end = new THREE.Vector3(...tip);
    const length = start.distanceTo(end);
    const dir = end.clone().sub(start).normalize();
    const side = new THREE.Vector3(-dir.y, dir.x, 0);
    if (side.lengthSq() < 0.01) side.set(1, 0, 0);
    side.normalize();
    const blade = b.extrude(
      [
        [0, 0], [width * 0.54, length * 0.38],
        [width * 0.37, length * 0.7], [0, length],
        [-width * 0.37, length * 0.7], [-width * 0.54, length * 0.38],
      ],
      { at, x: side, y: dir, thickness: 0.003, color, bone: root },
    );
    const a = start.clone().add(new THREE.Vector3(0, 0, 0.003));
    const e = end.clone().add(new THREE.Vector3(0, 0, 0.003));
    b.rod(a, e, 0.0018, { color: C.mint, bone: root, sides: 4 });
    return blade;
  }

  // Eye screws actually bridge the shelf fascia to the hanging herb rings.
  for (const side of [-1, 1]) {
    const x = side * 0.886;
    const z = -0.203;
    rod([x, 1.558, -0.25], [x, 1.558, z], 0.006, gold);
    cylinder([x, 1.582, -0.237], 0.011, 0.008, gold);
    ring([x, 1.558, z], 0.02, 0.004, gold, [0, 0, 1]);
    rod([x, 1.542, z], [x, 1.472, z], 0.006, C.rope);
    for (let k = 0; k < 3; k++) {
      const dx = (k - 1) * 0.032;
      const stemBottom = [x + dx * 1.5, 1.235 - (k % 2) * 0.035, z + 0.012];
      rod([x, 1.479, z], stemBottom, 0.0035, C.rope);
      for (let j = 0; j < 3; j++) {
        const yy = 1.399 - j * 0.052;
        const xx = x + dx * (0.4 + j * 0.3);
        const sign = (k + j) % 2 ? 1 : -1;
        leaf([xx, yy, z + 0.008],
          [xx + sign * (0.052 + j * 0.004), yy - 0.064, z + 0.018],
          0.038, j % 2 ? "#72a77a" : C.green);
      }
      if (side === -1) {
        for (let j = 0; j < 3; j++) {
          ball(
            [stemBottom[0] + (j % 2 ? 0.01 : -0.007),
              stemBottom[1] + j * 0.018, z + 0.014],
            [0.014, 0.02, 0.012], j === 0 ? "#ccb4ed" : C.purple,
          );
        }
      }
    }
    ring([x, 1.465, z], 0.019, 0.005, C.rope);
  }

  // Porcelain mortar, open bowl and resting pestle.
  b.lathe(
    [
      [0, 0], [0.055, 0], [0.058, 0.018], [0.046, 0.029],
      [0.078, 0.065], [0.085, 0.113], [0.076, 0.119],
      [0.066, 0.072], [0.039, 0.048], [0, 0.044],
    ],
    {
      at: [0.76, 1.066, -0.095], color: ceramic, bone: root,
      segments: 12, name: "porcelain herb mortar",
    },
  );
  ring([0.76, 1.180, -0.095], 0.081, 0.005, gold);
  b.capsule([0.745, 1.122, -0.095], [0.82, 1.263, -0.09], [0.017, 0.012], {
    color: ceramic, bone: root, sides: 8,
  });
  leaf([0.746, 1.127, -0.056], [0.69, 1.182, -0.045], 0.035, C.green);

  // Lower storage.
  box([-0.53, 0.386, -0.02], [0.48, 0.042, 0.42], wood);
  for (const z of [-0.222, 0.182]) {
    for (let j = 0; j < 3; j++) {
      box([-0.53, 0.418 + j * 0.047, z],
        [0.48, 0.034, 0.019], j % 2 ? C.wood : C.woodDark);
    }
  }
  for (const x of [-0.765, -0.295]) {
    box([x, 0.469, -0.02], [0.027, 0.18, 0.43], wood);
  }
  for (const x of [-0.735, -0.325]) {
    box([x, 0.465, 0.195], [0.018, 0.178, 0.009], gold);
  }
  potion(-0.64, 0.408, -0.02, 0.065, 0.32, "#729b91", "#b8d7bd", leafLabel);
  potion(-0.435, 0.408, -0.045, 0.069, 0.355, "#a387ad", "#d7c5d5", moonLabel);
  for (let i = 0; i < 3; i++) {
    const x = -0.07 + i * 0.077;
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.3, 10), parchment, {
      at: [x, 0.404, -0.055], dir: [0, 0, 1], bone: root,
    });
    ring([x, 0.404, 0.098], 0.025, 0.006, C.pageShadow, [0, 0, 1]);
    ring([x, 0.404, 0.1], 0.012, 0.004, C.page, [0, 0, 1]);
    ring([x, 0.404, -0.03], 0.038, 0.005, C.rope, [0, 0, 1]);
  }

  // Small tools and loose sprigs.
  cylinder([-0.279, 1.078, 0.322], 0.041, 0.033, gold);
  cylinder([-0.279, 1.101, 0.322], 0.024, 0.018, C.brassDark);
  ball([-0.279, 1.119, 0.322], [0.011, 0.012, 0.011], gold);
  for (let i = 0; i < 3; i++) {
    const x = -0.905 + i * 0.018;
    leaf([x, 1.065, 0.056], [x + 0.06, 1.069, 0.16 + i * 0.018],
      0.034, C.green);
  }
  ring([0.93, 1.066, 0.29], 0.027, 0.005, gold);
  rod([0.911, 1.067, 0.271], [0.873, 1.067, 0.226], 0.006, C.woodDark);

  // Gold inlays are inside the stone polygon, not floating beyond its bevel.
  for (const x of [-0.95, 0.95]) {
    b.part(new THREE.OctahedronGeometry(0.032), C.gold, {
      at: [x, 0.086, 0.43], scale: [1, 0.06, 1], bone: root,
      name: "flush stone-floor star inlay",
    });
  }

  return b.root;
}
