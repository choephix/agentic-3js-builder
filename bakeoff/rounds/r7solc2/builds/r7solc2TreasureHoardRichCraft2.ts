import * as THREE from "three";
import {
  createBuilder,
  rng,
  svg,
  paint,
  noise,
  mix,
  aim,
  catmull,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "The King's Ransom",
  description:
    "A royal fantasy treasure hoard: carved teal ironwood, embroidered crimson velvet, engraved gold, brilliant jewels, a sumptuous crown, chalices, pearls and the key to the king's fortune.",
};

/*
 * 1. Settle the large emerald into its coins; retain the successful composition.
 * 2. Give the chest stronger painted gold bevels, sculpted corner brackets and
 *    engraved end medallions. Its large shapes now carry the same craftsmanship
 *    as the small treasures, without adding noisy surface grain.
 * 3. Refine the crown into a richer royal object: shaped fleur points, engraved
 *    garnet insets, gold ridges and a raised velvet cushion.
 * 4. Enlarge and enrich the lid's central heraldry, retaining clear negative
 *    space around the face of the chest.
 * 5. Add a physically grounded ceremonial key to the quiet side of the stage;
 *    keep glow restricted to tiny jewel glints and subdued slate inlays.
 */

type P = [number, number, number];
type Finish = string | ReturnType<typeof paint>;

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "The King's Ransom",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(9217);

  const C = {
    gold: "#dba73e",
    goldLight: "#ffe098",
    goldDark: "#8c551f",
    goldShadow: "#694025",
    ink: "#17232f",
    ivory: "#fff0d1",
    teal: "#28dac6",
    ruby: "#ed4163",
    sapphire: "#427bea",
    purple: "#a45bdf",
  };

  const root = b.joint("hoardRoot", { at: [0, 0, 0] });
  const hingeAt: P = [0, 0.585, -0.565];
  const lid = b.joint("lidHinge", {
    parent: root,
    at: hingeAt,
    dir: [0, 0, 1],
    role: "hinge",
  });

  const wood = paint((p, n) => {
    const broad =
      Math.sin(p.y * 71 + Math.sin(p.x * 9 + p.z * 8) * 0.35) * 0.5 + 0.5;
    const grain = Math.pow(
      Math.max(0, Math.sin(p.y * 153 + Math.sin(p.x * 7 + p.z * 11) * 0.7)),
      14,
    );
    const shade =
      0.25 +
      broad * 0.20 +
      Math.max(0, n.y) * 0.15 +
      Math.max(0, n.z) * 0.09 +
      noise(p, 0.26, 18) * 0.13;
    return mix("#102e3a", "#48717a", shade - grain * 0.065);
  });

  const gold = paint((p, n) => {
    const directional = n.y * 0.68 + n.z * 0.30 + n.x * 0.17;
    const brush = (noise(p, 0.19, 12) - 0.5) * 0.09;
    if (directional > 0.66)
      return mix("#e8b956", "#fff0b5", 0.44 + brush);
    if (directional < -0.32)
      return mix("#724124", "#b97b2d", 0.34 + brush);
    return mix("#9e6327", "#f4ca70", 0.50 + directional * 0.31 + brush);
  });

  const velvet = paint((p, n) =>
    mix(
      "#49192d",
      "#ad354e",
      0.28 +
        Math.max(0, n.y) * 0.24 +
        noise(p, 0.24, 4) * 0.21 +
        Math.max(0, 0.9 - p.y) * 0.12,
    ),
  );

  const stone = paint((p, n) => {
    const v = noise(p, 0.25, 6);
    const seam =
      Math.abs(Math.sin(p.x * 7.5 + p.z * 4.5 + noise(p, 0.2, 7) * 1.2)) < 0.024;
    if (n.y > 0.65 && seam) return "#172d3c";
    return mix("#233647", "#405968", v * 0.54 + Math.max(0, n.y) * 0.18);
  });

  const buriedCoins = paint((p, n) => {
    const pitch = 0.066;
    const row = Math.floor(p.z / (pitch * 0.87));
    const x = p.x / pitch - (row % 2) * 0.5;
    const u = x - Math.floor(x) - 0.5;
    const v = (p.z / (pitch * 0.87) - row - 0.5) * 0.87;
    const d = Math.sqrt(u * u + v * v);
    if (d > 0.475) return "#69441f";
    if (d > 0.417) return "#f6cf78";
    if (d > 0.385) return "#946020";
    if (Math.abs(u) * 0.8 + Math.abs(v) < 0.155) return "#ffe2a0";
    return mix("#b7812d", "#e5b44d", 0.32 + Math.max(0, n.y) * 0.45);
  });

  const coinFace = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="#ad6b23"/>
      <circle cx="50" cy="50" r="44" fill="#edbc52" stroke="#ffe9a4" stroke-width="3"/>
      <circle cx="50" cy="50" r="36" fill="#d69b36" stroke="#92541f" stroke-width="2"/>
      <g fill="#ffeaa7" stroke="#ad7127" stroke-width="1.5">
        <path d="M50 15L56 34L50 30L44 34Z"/>
        <path d="M85 50L66 56L70 50L66 44Z"/>
        <path d="M50 85L44 66L50 70L56 66Z"/>
        <path d="M15 50L34 44L30 50L34 56Z"/>
        <path d="M25 25L42 34L34 42Z M75 25L66 42L58 34Z
                 M75 75L58 66L66 58Z M25 75L34 58L42 66Z"/>
      </g>
      <path d="M50 28L65 50L50 72L35 50Z" fill="#ffdf85" stroke="#9c5d22" stroke-width="3"/>
      <path d="M50 35L58 50L50 62L43 50Z" fill="#d69832"/>
      <path d="M20 30Q30 12 52 12M20 69Q29 87 49 88" fill="none"
        stroke="#fff0bb" stroke-width="2.5" stroke-linecap="round"/>
      <g fill="#8a501e">
        <circle cx="18" cy="50" r="2"/><circle cx="82" cy="50" r="2"/>
        <circle cx="50" cy="18" r="2"/><circle cx="50" cy="82" r="2"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const silverFace = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="#718594"/>
      <circle cx="50" cy="50" r="44" fill="#c3d7db" stroke="#effbff" stroke-width="3"/>
      <circle cx="50" cy="50" r="36" fill="#8faeb9" stroke="#537182" stroke-width="2"/>
      <path d="M27 61L23 35L39 44L50 24L61 44L77 35L73 61Z"
        fill="#e6f3eb" stroke="#506e7b" stroke-width="3"/>
      <path d="M29 67H71M34 74H66" stroke="#526d79" stroke-width="4"/>
      <circle cx="50" cy="49" r="5" fill="#648390"/>
      <path d="M20 30Q32 12 52 13" fill="none" stroke="#ffffff"
        stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const filigree = svg(
    `<svg viewBox="0 0 400 44">
      <path d="M0 4H400M0 40H400" stroke="#f7d58b" stroke-width="3"/>
      <path d="M0 10H400M0 34H400" stroke="#754622" stroke-width="2"/>
      <g fill="none" stroke="#eac16e" stroke-width="3" stroke-linejoin="round">
        <path d="M2 22L26 12L50 22L74 12L98 22L122 12L146 22L170 12L194 22
          L218 12L242 22L266 12L290 22L314 12L338 22L362 12L386 22L400 16"/>
        <path d="M2 22L26 32L50 22L74 32L98 22L122 32L146 22L170 32L194 22
          L218 32L242 22L266 32L290 22L314 32L338 22L362 32L386 22L400 28"/>
      </g>
      <g fill="#fff0b5">
        <path d="M50 17L55 22L50 27L45 22Z M146 17L151 22L146 27L141 22Z
          M242 17L247 22L242 27L237 22Z M338 17L343 22L338 27L333 22Z"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const heraldry = svg(
    `<svg viewBox="0 0 240 220">
      <g fill="none" stroke-linejoin="round">
        <path d="M120 16L132 39L158 24L159 53L191 48L180 77L214 89L188 109
          L213 137L179 141L186 174L154 164L145 198L120 177L95 198L86 164
          L54 174L61 141L27 137L52 109L26 89L60 77L49 48L81 53L82 24L108 39Z"
          stroke="#d6a356" stroke-width="3"/>
        <path d="M120 43L172 68L166 127Q154 157 120 174Q86 157 74 127L68 68Z"
          fill="#3c2037" stroke="#ffe3a0" stroke-width="7"/>
        <path d="M120 53L160 74L155 124Q143 148 120 161Q97 148 85 124L80 74Z"
          stroke="#a86c3e" stroke-width="3"/>
      </g>
      <path d="M118 65L127 65L125 116L146 123L143 132L124 127L122 151
        L115 151L113 127L94 132L91 123L112 116Z" fill="#ffe5a4"/>
      <path d="M119 59L130 74L123 107L116 107L110 74Z" fill="#f1bd61"/>
      <path d="M91 96L85 82L101 86M149 96L155 82L139 86"
        fill="none" stroke="#e5b767" stroke-width="5"/>
      <g fill="#ffe5a4">
        <path d="M120 7L124 15L120 23L116 15Z"/>
        <path d="M25 112L31 118L25 124L19 118Z M215 112L221 118L215 124L209 118Z"/>
      </g>
      <path d="M68 147Q56 139 52 122M172 147Q184 139 188 122"
        stroke="#efc77f" stroke-width="3" fill="none"/>
      <g fill="#efc77f">
        <path d="M58 139L43 136L49 128Z M62 145L50 149L52 139Z
          M182 139L197 136L191 128Z M178 145L190 149L188 139Z"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const velvetPattern = svg(
    `<svg viewBox="0 0 320 160">
      <g fill="none" stroke="#cf7b78" stroke-width="2.2" opacity=".7">
        <path d="M0 40L40 0L80 40L40 80ZM80 40L120 0L160 40L120 80Z
          M160 40L200 0L240 40L200 80ZM240 40L280 0L320 40L280 80Z
          M0 120L40 80L80 120L40 160ZM80 120L120 80L160 120L120 160Z
          M160 120L200 80L240 120L200 160ZM240 120L280 80L320 120L280 160Z"/>
      </g>
      <g fill="#efb280">
        <path d="M40 29L45 40L40 51L35 40ZM120 29L125 40L120 51L115 40Z
          M200 29L205 40L200 51L195 40ZM280 29L285 40L280 51L275 40Z
          M40 109L45 120L40 131L35 120ZM120 109L125 120L120 131L115 120Z
          M200 109L205 120L200 131L195 120ZM280 109L285 120L280 131L275 120Z"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const plaqueTexture = svg(
    `<svg viewBox="0 0 420 86">
      <rect x="4" y="4" width="412" height="78" rx="7" fill="#162c3b"
        stroke="#dfb76e" stroke-width="5"/>
      <path d="M16 16H404M16 70H404" stroke="#617581" stroke-width="2"/>
      <text x="210" y="40" text-anchor="middle" font-family="serif"
        font-weight="bold" font-size="25" letter-spacing="4" fill="#ffe2a0">THE KING'S RANSOM</text>
      <text x="210" y="61" text-anchor="middle" font-family="serif"
        font-size="13" letter-spacing="5" fill="#a5bac0">FORTUNE FAVORS THE BOLD</text>
      <path d="M20 37L25 43L20 49L15 43ZM400 37L405 43L400 49L395 43Z"
        fill="#efc474"/>
    </svg>`,
    { size: 512 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 100 100">
      <g fill="none" stroke="#79d5ce" stroke-width="3">
        <path d="M50 4L90 27V73L50 96L10 73V27Z"/>
        <path d="M50 15L80 33V67L50 85L20 67V33Z"/>
        <path d="M50 27L65 50L50 73L35 50Z"/>
        <path d="M50 4V18M90 27L78 35M90 73L78 66M50 96V82M10 73L22 66M10 27L22 35"/>
      </g>
    </svg>`,
    { size: 192 },
  );

  const glintTexture = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M50 3L58 41L97 50L58 59L50 97L42 59L3 50L42 41Z" fill="#e4fff5"/>
      <path d="M50 20L54 46L80 50L54 54L50 80L46 54L20 50L46 46Z" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  const fleurEngraving = svg(
    `<svg viewBox="0 0 80 160">
      <path d="M40 9L60 55L53 90L62 117L40 145L18 117L27 90L20 55Z"
        fill="#794129" stroke="#ffe7a1" stroke-width="4"/>
      <path d="M40 22L51 57L40 102L29 57Z" fill="#642338"/>
      <path d="M40 35L46 57L40 77L34 57Z" fill="#ca5966"/>
      <path d="M40 90V128M23 117L40 108L57 117"
        stroke="#e9b861" stroke-width="4" fill="none"/>
      <path d="M28 49L32 39M23 109L29 99" stroke="#fff1bc"
        stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const sunMedallion = svg(
    `<svg viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="70" fill="#244653" stroke="#eac171" stroke-width="5"/>
      <circle cx="80" cy="80" r="59" fill="none" stroke="#9b723b" stroke-width="3"/>
      <path d="M80 17L89 50L111 27L108 58L143 48L119 76L145 91
        L112 97L122 130L94 111L80 145L66 111L38 130L48 97L15 91
        L41 76L17 48L52 58L49 27L71 50Z"
        fill="#d7a44f" stroke="#ffe49c" stroke-width="2"/>
      <path d="M80 48L99 80L80 112L61 80Z" fill="#233b48" stroke="#f9da91" stroke-width="4"/>
      <path d="M80 58L89 80L80 100L71 80Z" fill="#56b6ab"/>
      <path d="M25 59Q31 32 61 23" fill="none" stroke="#fff0bc"
        stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  function box(
    name: string,
    at: P,
    size: P,
    color: Finish,
    bone = root,
    rotation?: P,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      name, at, bone, rotation, flat: true,
    });
  }

  function ball(
    name: string,
    at: P,
    scale: P,
    color: Finish,
    bone = root,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      name, at, bone, scale, flat: true,
    });
  }

  function plate(
    name: string,
    at: P,
    size: [number, number],
    texture: THREE.Texture,
    normal: P = [0, 0, 1],
    bone = root,
    up: P = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(...size), "#ffffff", {
      at, bone, dir: normal, up, axis: "z", texture, name,
    });
  }

  function rivet(at: P, normal: P, radius = 0.011, bone = root) {
    return b.part(new THREE.SphereGeometry(radius, 6, 4), C.goldLight, {
      at, bone, dir: normal, scale: [1, 0.48, 1],
      flat: true, name: "hammeredGoldRivet",
    });
  }

  function torus(
    at: P,
    radius: number,
    tube: number,
    color: Finish,
    normal: P = [0, 1, 0],
    bone = root,
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 4, 14), color, {
      at, bone, dir: normal, axis: "z", flat: true, name: "forgedRing",
    });
  }

  // Dark, compact staging leaves the treasure's warm silhouette unobstructed.
  b.part(new THREE.CylinderGeometry(0.98, 1.035, 0.105, 10), "#152837", {
    at: [0, 0.0525, 0], scale: [1, 1, 0.88],
    bone: root, flat: true, name: "slateDaisBevel",
  });
  b.part(new THREE.CylinderGeometry(0.963, 0.98, 0.024, 10), stone, {
    at: [0, 0.112, 0], scale: [1, 1, 0.88],
    bone: root, flat: true, name: "slateDaisTop",
  });
  for (const s of [-1, 1]) {
    b.sweep(
      [
        [s * 0.76, 0.125, 0.29],
        [s * 0.82, 0.125, 0.02],
        [s * 0.75, 0.125, -0.29],
      ],
      0.003,
      { color: "#947047", bone: root, sides: 4, caps: "flat", name: "insetStoneBorder" },
    );
  }
  box("nameplateBacking", [0, 0.063, 0.861], [0.46, 0.085, 0.026], C.goldDark);
  plate("engravedNameplate", [0, 0.064, 0.876], [0.445, 0.078], plaqueTexture);
  for (const s of [-1, 1]) {
    rivet([s * 0.211, 0.065, 0.879], [0, 0, 1], 0.007);
  }

  const frontZ = 0.115;
  const backZ = -0.565;
  box("chestBottom", [0, 0.235, -0.225], [1.025, 0.085, 0.68], wood);
  box("velvetInteriorFloor", [0, 0.282, -0.225], [0.88, 0.018, 0.56], velvet);

  for (let i = 0; i < 4; i++) {
    const y = 0.301 + i * 0.074;
    box("frontIronwoodPlank", [0, y, frontZ], [1.0, 0.069, 0.058], wood);
    box("backIronwoodPlank", [0, y, backZ], [1.0, 0.069, 0.055], wood);
    box("frontPlankPaintedEdge", [0, y + 0.03, 0.145], [0.95, 0.004, 0.002], "#496976");
    for (const s of [-1, 1]) {
      box("endIronwoodPlank", [s * 0.487, y, -0.225], [0.065, 0.069, 0.67], wood);
      box("endPlankPaintedEdge", [s * 0.521, y + 0.03, -0.225], [0.002, 0.004, 0.57], "#3d5d68");
    }
  }

  // Sparse broad scratches are placed deliberately, rather than random static.
  for (const [x, y, length] of [
    [-0.20, 0.335, 0.072],
    [0.215, 0.404, 0.061],
    [-0.24, 0.480, 0.044],
  ]) {
    b.rod([x, y, 0.146], [x + length, y + 0.003, 0.146], [0.0018, 0.0005], {
      color: "#54727b", bone: root, sides: 3, name: "ironwoodBrushScratch",
    });
  }

  box("insideFrontLining", [0, 0.43, 0.076], [0.87, 0.275, 0.012], velvet);
  for (const s of [-1, 1]) {
    box("insideEndLining", [s * 0.446, 0.43, -0.225], [0.012, 0.275, 0.55], velvet);
  }

  for (const z of [frontZ, backZ]) {
    box("upperGildedRim", [0, 0.584, z], [1.075, 0.047, 0.075], gold);
    box("rimFineHighlight", [0, 0.609, z + (z > 0 ? 0.01 : -0.01)], [1.06, 0.008, 0.059], C.goldLight);
    box("lowerGildedRail", [0, 0.251, z], [1.065, 0.047, 0.078], gold);
    box("lowerRailBevel", [0, 0.274, z], [1.045, 0.005, 0.077], "#f0c46d");
  }
  box("frontRimShadowLine", [0, 0.563, 0.154], [1.0, 0.005, 0.003], C.goldDark);
  box("frontRimBevel", [0, 0.603, 0.155], [1.055, 0.005, 0.003], "#fff0b5");

  for (const s of [-1, 1]) {
    box("endTopRail", [s * 0.508, 0.584, -0.225], [0.061, 0.047, 0.68], gold);
    box("endBottomRail", [s * 0.508, 0.251, -0.225], [0.061, 0.047, 0.68], gold);
    box("endRailUpperGlint", [s * 0.508, 0.61, -0.225], [0.055, 0.005, 0.65], C.goldLight);
    box("endLowerRailBevel", [s * 0.538, 0.270, -0.225], [0.003, 0.006, 0.66], "#f0c46d");

    for (const z of [0.065, -0.515]) {
      box("gildedChestFoot", [s * 0.455, 0.166, z], [0.153, 0.085, 0.151], gold);
      b.frustumBox(
        [s * 0.455, 0.19, z], [s * 0.455, 0.297, z],
        [0.127, 0.127], [0.082, 0.082],
        { bone: root, color: gold, name: "taperedCornerShoe" },
      );
      box("footInset", [s * 0.455, 0.163, z + 0.078], [0.072, 0.027, 0.006], C.goldShadow);
      box("footPaintedBevel", [s * 0.455, 0.204, z + 0.076], [0.127, 0.005, 0.004], "#edc16d");
    }

    const x = s * 0.365;
    box("frontArmorStrap", [x, 0.422, 0.153], [0.071, 0.333, 0.027], gold);
    box("strapEdgeGlint", [x - 0.027, 0.425, 0.169], [0.007, 0.304, 0.005], C.goldLight);
    box("strapShadowEdge", [x + 0.028, 0.425, 0.169], [0.004, 0.304, 0.003], C.goldDark);
    for (const y of [0.294, 0.423, 0.554]) rivet([x, y, 0.173], [0, 0, 1]);
    box("frontCornerArmor", [s * 0.503, 0.42, 0.142], [0.049, 0.345, 0.046], gold);

    b.extrude(
      [
        [0, 0], [0.125, 0], [0.125, -0.025], [0.069, -0.041],
        [0.042, -0.077], [0.024, -0.128], [0, -0.146],
      ],
      {
        at: [s * 0.527, 0.604, 0.175],
        x: [-s, 0, 0], y: [0, 1, 0],
        thickness: 0.018, bevel: 0.004,
        color: gold, bone: root, name: "sculptedCornerBracket",
      },
    );
    b.rod(
      [s * 0.514, 0.592, 0.187], [s * 0.421, 0.592, 0.187],
      [0.0038, 0.0018],
      { bone: root, color: C.goldLight, sides: 4, name: "cornerBracketBevel" },
    );
    rivet([s * 0.505, 0.562, 0.187], [0, 0, 1], 0.008);
  }

  plate("frontRoyalInlay", [0, 0.532, 0.147], [0.64, 0.039], filigree);

  b.extrude(
    [
      [-0.082, 0.09], [0.082, 0.09], [0.093, 0.043], [0.076, -0.064],
      [0, -0.107], [-0.076, -0.064], [-0.093, 0.043],
    ],
    {
      at: [0, 0.426, 0.156], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.032, bevel: 0.008,
      bone: root, color: gold, name: "royalShieldLock",
    },
  );
  b.sweep(
    [[-0.071, 0.497, 0.174], [-0.08, 0.461, 0.174], [-0.065, 0.368, 0.174], [0, 0.332, 0.174]],
    0.0025,
    { color: C.goldLight, bone: root, sides: 4, caps: "flat", name: "lockShieldBevel" },
  );
  box("lidHasp", [0, 0.554, 0.162], [0.055, 0.12, 0.031], gold);
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.063, 8), C.goldLight, {
    at: [0, 0.594, 0.181], dir: [1, 0, 0], bone: root, name: "haspHingePin",
  });
  b.part(new THREE.CircleGeometry(0.014, 10), C.ink, {
    at: [0, 0.416, 0.173], bone: root, name: "lockKeyholeRound",
  });
  b.extrude(
    [[-0.007, 0], [0.007, 0], [0.013, -0.03], [-0.013, -0.03]],
    {
      at: [0, 0.412, 0.174], x: [1, 0, 0],
      thickness: 0.002, color: C.ink, bone: root, name: "lockKeyholeSlot",
    },
  );
  for (const s of [-1, 1]) rivet([s * 0.056, 0.47, 0.175], [0, 0, 1], 0.008);

  for (const s of [-1, 1]) {
    for (const z of [-0.32, -0.12]) {
      b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.026, 6), C.goldDark, {
        at: [s * 0.535, 0.45, z], dir: [s, 0, 0],
        bone: root, name: "handleMount",
      });
      rivet([s * 0.553, 0.45, z], [s, 0, 0], 0.014);
    }
    b.sweep(
      [
        [s * 0.562, 0.45, -0.32], [s * 0.587, 0.376, -0.31],
        [s * 0.591, 0.354, -0.225], [s * 0.587, 0.376, -0.14],
        [s * 0.562, 0.45, -0.12],
      ],
      0.018,
      { bone: root, color: gold, sides: 6, caps: "round", name: "swingingEndHandle" },
    );
  }

  // The barrel lid remains a genuine separate hinged assembly.
  const lidAngle = (-105 * Math.PI) / 180;
  const ca = Math.cos(lidAngle);
  const sa = Math.sin(lidAngle);
  function L(x: number, z: number, y: number, forward = 0): P {
    return [x, hingeAt[1] + ca * y - sa * z, hingeAt[2] + sa * y + ca * z + forward];
  }
  const lidX: P = [0, -sa, ca];
  const lidY: P = [0, ca, sa];
  const section: [number, number][] = [
    [0, 0], [0.07, 0.103], [0.19, 0.184], [0.32, 0.211],
    [0.45, 0.184], [0.57, 0.103], [0.64, 0],
  ];

  for (let i = 0; i < section.length - 1; i++) {
    const [z0, y0] = section[i];
    const [z1, y1] = section[i + 1];
    b.slab(
      [L(-0.505, z0, y0), L(0.505, z0, y0), L(0.505, z1, y1), L(-0.505, z1, y1)],
      { bone: lid, thickness: 0.046, color: wood, name: "barrelLidIronwood" },
    );
    b.slab(
      [
        L(-0.455, z0, y0, 0.036), L(0.455, z0, y0, 0.036),
        L(0.455, z1, y1, 0.036), L(-0.455, z1, y1, 0.036),
      ],
      { bone: lid, thickness: 0.008, color: velvet, name: "barrelLidVelvet" },
    );
    for (const x of [-0.365, 0.365]) {
      b.slab(
        [
          L(x - 0.033, z0, y0, -0.031), L(x + 0.033, z0, y0, -0.031),
          L(x + 0.033, z1, y1, -0.031), L(x - 0.033, z1, y1, -0.031),
        ],
        { color: gold, bone: lid, thickness: 0.014, name: "exteriorLidArmorPlate" },
      );
    }
  }

  const endOutline: [number, number][] = [...section, [0.625, -0.035], [0.015, -0.035]];
  for (const s of [-1, 1]) {
    b.extrude(endOutline, {
      at: [s * 0.505, hingeAt[1], hingeAt[2]],
      x: lidX, y: lidY, thickness: 0.052, color: wood,
      bone: lid, name: "archedLidEnd",
    });
    b.sweep(section.map(([z, y]) => L(s * 0.527, z, y)), 0.022, {
      color: gold, bone: lid, sides: 6, caps: "flat", name: "archedEndGoldBorder",
    });
    b.rod(L(s * 0.527, 0, -0.012), L(s * 0.527, 0.64, -0.012), 0.021, {
      bone: lid, color: gold, sides: 6, name: "lidEndStraightBorder",
    });

    const medallionAt = L(s * 0.537, 0.34, 0.075);
    b.part(new THREE.CylinderGeometry(0.077, 0.081, 0.013, 10), gold, {
      at: medallionAt, dir: [s, 0, 0], bone: lid,
      flat: true, name: "lidEndMedallionSetting",
    });
    plate(
      "engravedLidSun",
      [medallionAt[0] + s * 0.0075, medallionAt[1], medallionAt[2]],
      [0.146, 0.146], sunMedallion, [s, 0, 0], lid,
    );
  }

  for (const x of [-0.365, 0.365]) {
    for (const index of [1, 3, 5]) {
      const [z, y] = section[index];
      rivet(L(x, z, y, -0.039), [0, 0, -1], 0.012, lid);
    }
  }
  for (const z of [0, 0.64]) {
    b.rod(L(-0.548, z, 0, 0.01), L(0.548, z, 0, 0.01), 0.027, {
      bone: lid, color: gold, sides: 6, name: "lidLipCrossRail",
    });
    b.rod(L(-0.515, z, 0, 0.037), L(0.515, z, 0, 0.037), 0.006, {
      bone: lid, color: C.goldLight, sides: 4, name: "lidLipHighlight",
    });
  }

  const innerLid = b.surface(lid);
  b.decal(innerLid, velvetPattern, {
    at: L(0, 0.32, 0.211, 0.045), dir: [0, 0.10, 1],
    size: [0.86, 0.39], segments: 12, lift: 0.002,
    bone: lid, name: "embroideredLidLining",
  });
  b.decal(innerLid, heraldry, {
    at: L(0, 0.34, 0.2, 0.05), dir: [0, 0.10, 1],
    size: [0.425, 0.395], segments: 12, lift: 0.006,
    bone: lid, name: "royalSwordSunEmbroidery",
  });

  for (const x of [-0.365, 0.365]) {
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.14, 8), gold, {
      at: [x, 0.588, -0.571], dir: [1, 0, 0],
      bone: root, name: "rearHingeBarrel",
    });
    for (const dx of [-0.052, 0.052]) {
      torus([x + dx, 0.588, -0.571], 0.034, 0.005, C.goldLight, [1, 0, 0]);
    }
  }

  for (const s of [-1, 1]) {
    const path = catmull([
      [s * 0.51, 0.605, 0.066],
      [s * 0.571, 0.713, -0.19],
      [s * 0.558, 0.917, -0.465],
      L(s * 0.51, 0.64, 0, 0.005),
    ]);
    for (let i = 0; i < 12; i++) {
      const q = aim(path.tangentAt(i / 11));
      q.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0), i % 2 ? Math.PI / 2 : 0,
        ),
      );
      b.part(new THREE.TorusGeometry(0.035, 0.006, 4, 8), gold, {
        at: path.at(i / 11), quat: q, scale: [0.74, 1.37, 1],
        bone: root, flat: true, name: "interlockedLidChain",
      });
    }
  }

  function coin(
    at: THREE.Vector3 | P,
    radius: number,
    normal: THREE.Vector3 | P = [0, 1, 0],
    silver = false,
    thickness = 0.008,
    spin = 0,
  ) {
    const axis =
      normal instanceof THREE.Vector3
        ? normal.clone().normalize()
        : new THREE.Vector3(...normal).normalize();
    const center = at instanceof THREE.Vector3 ? at.clone() : new THREE.Vector3(...at);
    b.part(new THREE.CylinderGeometry(radius, radius, thickness, 12), silver ? "#91aebb" : gold, {
      at: center, dir: axis, bone: root, flat: true,
      name: silver ? "silverCoinEdge" : "goldCoinEdge",
    });
    const q = aim(axis, [0, 0, -1], "z");
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), spin));
    b.part(new THREE.CircleGeometry(radius * 0.95, 12), "#ffffff", {
      at: center.addScaledVector(axis, thickness / 2 + 0.0007),
      quat: q, bone: root, texture: silver ? silverFace : coinFace,
      name: silver ? "silverCrownCoin" : "sunStampedGoldCoin",
    });
  }

  const edgeStack = paint((p, n) => {
    if (Math.abs(n.y) > 0.6) return gold;
    const line = ((p.y / 0.009) % 1 + 1) % 1;
    return line < 0.24 ? "#85551f" : line < 0.40 ? "#ffe297" : "#dca53d";
  });

  function stack(x: number, z: number, count: number, radius: number) {
    const h = count * 0.009;
    b.part(new THREE.CylinderGeometry(radius, radius, h, 12), edgeStack, {
      at: [x, 0.126 + h / 2, z], bone: root, flat: true, name: "stackOfMilledCoins",
    });
    coin([x, 0.129 + h, z], radius, [0.025, 1, -0.015], false, 0.006, random() * 6);
  }

  const chestHeap = ball("buriedChestCoins", [0, 0.523, -0.225], [0.438, 0.108, 0.267], buriedCoins, root, 16);
  const floorHeap = ball("buriedSpilledCoins", [-0.01, 0.137, 0.354], [0.377, 0.078, 0.25], buriedCoins, root, 16);
  const bridgeHeap = ball("buriedCoinsAtChestFoot", [0.035, 0.16, 0.16], [0.216, 0.104, 0.15], buriedCoins, root, 14);

  for (const [heap, count, spacing] of [
    [chestHeap, 91, 0.049],
    [floorHeap, 72, 0.045],
    [bridgeHeap, 25, 0.042],
  ] as const) {
    const hits = b.surface(heap).scatter(count, {
      rng: random, minDist: spacing,
      filter: (hit) => hit.n.y > 0.23 && hit.at.y > 0.128,
    });
    for (let i = 0; i < hits.length; i++) {
      const h = hits[i];
      coin(
        h.at.clone().addScaledVector(h.n, 0.002),
        0.035 + random() * 0.010,
        h.n, i % 24 === 11, 0.008, random() * Math.PI * 2,
      );
    }
  }

  for (let i = 0; i < 18; i++) {
    const a = i * 2.399963;
    const r = Math.sqrt((i + 0.6) / 18) * 0.87;
    const x = Math.cos(a) * r * 0.407;
    const z = -0.225 + Math.sin(a) * r * 0.237;
    const surface = b.surface(chestHeap).ray([x, 0.9, z], [0, -1, 0]);
    if (surface) {
      coin(
        surface.at.clone().add(new THREE.Vector3(0, 0.011, 0)),
        0.037 + random() * 0.007,
        [(random() - 0.5) * 0.18, 1, (random() - 0.5) * 0.18],
        false, 0.008, random() * 6,
      );
    }
  }

  for (const item of [
    [-0.34, 0.32, 7, 0.040],
    [-0.26, 0.56, 4, 0.037],
    [0.17, 0.52, 9, 0.040],
    [0.27, 0.29, 6, 0.039],
    [-0.065, 0.67, 3, 0.035],
  ]) stack(item[0], item[1], item[2], item[3]);

  for (const [x, z, r] of [
    [-0.70, 0.49, 0.032], [-0.41, 0.70, 0.035], [0.34, 0.72, 0.031],
    [0.61, 0.64, 0.034], [0.73, 0.32, 0.030], [-0.76, -0.03, 0.033],
    [-0.45, 0.28, 0.034], [0.36, 0.54, 0.035], [-0.30, 0.65, 0.033],
  ]) coin([x, 0.131, z], r, [0.02, 1, -0.03], false, 0.008, random() * 6);

  // Low-poly jewel cuts: pavilion, girdle, crown and table remain distinct.
  function gemGeometry(radius: number, height: number, sides = 6) {
    const vertices: number[] = [];
    const uvs: number[] = [];
    const ring = (r: number, y: number) =>
      Array.from({ length: sides }, (_, i) => {
        const a = (i * Math.PI * 2) / sides;
        return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
      });
    const lower = ring(radius, height * 0.08);
    const girdle = ring(radius, height * 0.19);
    const table = ring(radius * 0.54, height * 0.50);
    const bottom = new THREE.Vector3(0, -height * 0.5, 0);
    const top = new THREE.Vector3(0, height * 0.5, 0);
    const tri = (a: THREE.Vector3, d: THREE.Vector3, c: THREE.Vector3) => {
      for (const v of [a, d, c]) {
        vertices.push(v.x, v.y, v.z);
        uvs.push(0.5 + v.x / (radius * 2), 0.5 + v.z / (radius * 2));
      }
    };
    for (let i = 0; i < sides; i++) {
      const j = (i + 1) % sides;
      tri(bottom, lower[i], lower[j]);
      tri(lower[i], girdle[i], girdle[j]);
      tri(lower[i], girdle[j], lower[j]);
      tri(girdle[i], table[i], table[j]);
      tri(girdle[i], table[j], girdle[j]);
      tri(top, table[j], table[i]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }

  const gemPaints = new Map<string, ReturnType<typeof paint>>();
  function gemPaint(color: string) {
    let result = gemPaints.get(color);
    if (!result) {
      result = paint((_p, n) => {
        const light = n.x * 0.32 + n.y * 0.70 + n.z * 0.4;
        if (light > 0.70) return mix(color, "#e2fff7", 0.48);
        if (light > 0.26) return color;
        if (light > -0.14) return mix(color, "#172c63", 0.23);
        return mix(color, "#101c43", 0.52);
      });
      gemPaints.set(color, result);
    }
    return result;
  }

  function looseGem(
    name: string, x: number, z: number, floor: number,
    radius: number, height: number, color: string, rotation: P, sides = 6,
  ) {
    const geo = gemGeometry(radius, height, sides);
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        THREE.MathUtils.degToRad(rotation[0]),
        THREE.MathUtils.degToRad(rotation[1]),
        THREE.MathUtils.degToRad(rotation[2]),
      ),
    );
    geo.applyQuaternion(q);
    geo.computeBoundingBox();
    const low = geo.boundingBox!.min.y;
    return b.part(geo, gemPaint(color), {
      at: [x, floor - low - 0.002, z], bone: root, flat: true, name,
    });
  }

  function socketGem(
    at: P, radius: number, height: number, color: string,
    normal: P, bone = root,
  ) {
    b.part(new THREE.CylinderGeometry(radius * 1.17, radius * 1.24, 0.017, 8), gold, {
      at, dir: normal, bone, flat: true, name: "goldJewelBezel",
    });
    const n = new THREE.Vector3(...normal).normalize();
    return b.part(gemGeometry(radius, height, 6), gemPaint(color), {
      at: new THREE.Vector3(...at).addScaledVector(n, height * 0.25),
      dir: n, bone, flat: true, name: "bezelSetJewel",
    });
  }

  socketGem([0, 0.476, 0.179], 0.024, 0.04, C.ruby, [0, 0, 1]);

  const mainEmerald = looseGem(
    "largeEmerald", 0.04, 0.49, 0.200, 0.084, 0.145, C.teal, [18, 22, 12],
  );
  looseGem("spilledRuby", -0.19, 0.70, 0.126, 0.059, 0.105, C.ruby, [63, 12, 23]);
  const blueGem = looseGem(
    "largeSapphire", 0.40, 0.68, 0.126, 0.070, 0.115, C.sapphire, [49, 36, -18], 8,
  );
  looseGem("violetGem", -0.40, 0.44, 0.126, 0.047, 0.092, C.purple, [20, 8, 37]);
  looseGem("emeraldBesideCrown", 0.73, 0.11, 0.126, 0.049, 0.093, C.teal, [52, -8, 13]);
  looseGem("rubyInChest", 0.21, -0.28, 0.602, 0.06, 0.12, C.ruby, [12, 20, 12]);
  looseGem("sapphireInChest", -0.27, -0.16, 0.588, 0.052, 0.095, C.sapphire, [31, -12, -22]);
  looseGem("emeraldInChest", 0.015, -0.42, 0.579, 0.05, 0.11, C.teal, [10, 36, 8]);

  for (const [target, center, width] of [
    [mainEmerald, [0.04, 0.284, 0.49], 0.038],
    [blueGem, [0.40, 0.19, 0.68], 0.025],
  ] as const) {
    const hit = b.surface(target).around(center).at(-22, 43);
    if (hit) {
      glow(
        b.decal(target, glintTexture, {
          at: hit, size: [width, width], lift: 0.0015, segments: 3,
          bone: root, name: "gemstoneStarHighlight",
        }),
        0.8,
      );
    }
  }

  // Royal crown: open fleur silhouette, plush cushion, dark engraved channel.
  const crownAt: P = [0.505, 0.145, 0.405];
  const crownR = 0.177;
  b.lathe(
    [
      [0.153, 0], [0.188, 0], [0.195, 0.019], [0.188, 0.038],
      [0.183, 0.093], [0.194, 0.11], [0.187, 0.128], [0.153, 0.128],
    ],
    { at: crownAt, color: gold, bone: root, segments: 14, name: "hollowRoyalCirclet" },
  );
  torus([crownAt[0], crownAt[1] + 0.024, crownAt[2]], 0.189, 0.009, C.goldLight);
  torus([crownAt[0], crownAt[1] + 0.103, crownAt[2]], 0.187, 0.008, C.goldLight);
  b.lathe(
    [[0.184, 0.047], [0.190, 0.047], [0.190, 0.075], [0.184, 0.075]],
    { at: crownAt, color: C.goldDark, bone: root, segments: 14, name: "crownEngravedChannel" },
  );
  b.part(new THREE.CylinderGeometry(0.151, 0.151, 0.028, 14), velvet, {
    at: [crownAt[0], crownAt[1] + 0.017, crownAt[2]],
    bone: root, name: "crownVelvetCushionBase",
  });
  ball(
    "raisedCrimsonCrownCushion",
    [crownAt[0], crownAt[1] + 0.047, crownAt[2]],
    [0.147, 0.092, 0.147], velvet, root, 14,
  );

  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7;
    const radial: P = [Math.sin(a), 0, Math.cos(a)];
    const tangent: P = [Math.cos(a), 0, -Math.sin(a)];
    const tall = i === 0 ? 1.15 : 0.94;
    const at: P = [
      crownAt[0] + radial[0] * crownR,
      crownAt[1] + 0.108,
      crownAt[2] + radial[2] * crownR,
    ];
    b.extrude(
      [
        [-0.073, 0], [0.073, 0], [0.051, 0.044],
        [0.043, 0.067], [0.049, 0.096 * tall],
        [0.032, 0.117 * tall], [0.023, 0.149 * tall],
        [0, 0.191 * tall],
        [-0.023, 0.149 * tall], [-0.032, 0.117 * tall],
        [-0.049, 0.096 * tall], [-0.043, 0.067], [-0.051, 0.044],
      ],
      {
        at, x: tangent, y: [0, 1, 0], thickness: 0.028, bevel: 0.004,
        color: gold, bone: root, name: "crownFleurPoint",
      },
    );
    b.rod(
      [at[0] + radial[0] * 0.017, at[1] + 0.034, at[2] + radial[2] * 0.017],
      [at[0] + radial[0] * 0.017, at[1] + 0.145 * tall, at[2] + radial[2] * 0.017],
      [0.006, 0.002],
      { color: C.goldLight, bone: root, sides: 4, name: "crownPointRidge" },
    );
    plate(
      "engravedGarnetFleurInset",
      [
        at[0] + radial[0] * 0.019,
        at[1] + 0.101 * tall,
        at[2] + radial[2] * 0.019,
      ],
      [0.044, 0.103 * tall], fleurEngraving, radial,
    );
    socketGem(
      [
        crownAt[0] + radial[0] * 0.194,
        crownAt[1] + (i === 0 ? 0.132 : 0.092),
        crownAt[2] + radial[2] * 0.194,
      ],
      i === 0 ? 0.038 : 0.022,
      i === 0 ? 0.066 : 0.041,
      i === 0 || i % 3 === 0 ? C.ruby : C.teal,
      radial,
    );
    ball(
      "crownPointPearl",
      [at[0], at[1] + 0.183 * tall, at[2]],
      [0.012, 0.014, 0.012], C.goldLight,
    );
    for (const da of [-0.18, 0.18]) {
      ball(
        "circletSeedPearl",
        [
          crownAt[0] + Math.sin(a + da) * 0.191,
          crownAt[1] + 0.061,
          crownAt[2] + Math.cos(a + da) * 0.191,
        ],
        [0.006, 0.006, 0.006], C.ivory,
      );
    }
  }

  function goblet(at: P, scale: number, jewelColor: string) {
    const p = (x: number, y: number, z: number): P => [
      at[0] + x * scale, at[1] + y * scale, at[2] + z * scale,
    ];
    const profile: [number, number][] = [
      [0, 0], [0.091, 0], [0.101, 0.014], [0.095, 0.028],
      [0.062, 0.047], [0.026, 0.059], [0.020, 0.161],
      [0.033, 0.184], [0.065, 0.205], [0.098, 0.242],
      [0.113, 0.304], [0.11, 0.331], [0.094, 0.331],
      [0.094, 0.304], [0.080, 0.249], [0.052, 0.221],
      [0.018, 0.210], [0, 0.210],
    ];
    b.lathe(profile.map(([r, y]) => [r * scale, y * scale]), {
      at, color: gold, bone: root, segments: 10, name: "hollowGildedChalice",
    });
    torus(p(0, 0.327, 0), 0.104 * scale, 0.008 * scale, C.goldLight);
    torus(p(0, 0.027, 0), 0.090 * scale, 0.006 * scale, C.goldLight);
    ball("chaliceStemKnop", p(0, 0.142, 0), [0.033 * scale, 0.029 * scale, 0.033 * scale], gold);
    torus(p(0, 0.203, 0), 0.059 * scale, 0.006 * scale, C.goldDark);
    torus(p(0, 0.247, 0), 0.098 * scale, 0.004 * scale, C.goldDark);
    b.part(new THREE.CircleGeometry(0.089 * scale, 10), "#4c1534", {
      at: p(0, 0.304, 0), dir: [0, 1, 0], axis: "z", bone: root, name: "darkRubyWine",
    });
    b.part(new THREE.CircleGeometry(0.025 * scale, 8), "#b94d71", {
      at: p(-0.033, 0.305, -0.027), dir: [0, 1, 0], axis: "z",
      scale: [1, 0.28, 1], bone: root, name: "wineReflection",
    });
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      const nx = Math.sin(a);
      const nz = Math.cos(a);
      socketGem(
        p(nx * 0.106, 0.278, nz * 0.106),
        0.014 * scale, 0.024 * scale, jewelColor, [nx, 0.15, nz],
      );
    }
  }

  goblet([-0.665, 0.126, 0.16], 1.04, C.teal);
  goblet([-0.555, 0.126, 0.563], 0.76, C.ruby);

  const pearlPath = catmull([
    [-0.26, 0.627, -0.02], [-0.225, 0.606, 0.105],
    [-0.19, 0.431, 0.160], [-0.145, 0.262, 0.207], [-0.103, 0.232, 0.284],
  ]);
  b.sweep(pearlPath, 0.003, {
    color: C.goldDark, bone: root, sides: 4, name: "pearlNecklaceThread",
  });
  b.along(pearlPath, 15, (at) => {
    b.part(new THREE.SphereGeometry(0.014, 8, 6), C.ivory, {
      at, bone: root, name: "necklacePearl",
    });
  });
  socketGem([-0.099, 0.233, 0.299], 0.023, 0.041, C.teal, [0, 0.72, 0.69]);

  // A ceremonial key lies directly on the slate, inside the existing footprint.
  torus([0.756, 0.135, -0.165], 0.041, 0.009, gold);
  torus([0.756, 0.135, -0.165], 0.026, 0.004, C.goldLight);
  b.rod([0.756, 0.135, -0.128], [0.756, 0.135, 0.057], 0.010, {
    color: gold, bone: root, sides: 8, name: "ceremonialKeyShaft",
  });
  b.rod([0.751, 0.143, -0.118], [0.751, 0.143, 0.052], 0.0022, {
    color: C.goldLight, bone: root, sides: 4, name: "keyShaftBevel",
  });
  box("keyBit", [0.731, 0.135, 0.041], [0.060, 0.019, 0.018], gold);
  box("keyToothA", [0.706, 0.135, 0.022], [0.016, 0.019, 0.028], gold);
  box("keyToothB", [0.726, 0.135, 0.059], [0.014, 0.019, 0.025], gold);
  b.part(new THREE.CylinderGeometry(0.015, 0.018, 0.014, 6), gold, {
    at: [0.756, 0.135, -0.108], dir: [0, 0, 1],
    bone: root, name: "keyShaftCollar",
  });

  for (const s of [-1, 1]) {
    const mark = plate(
      "slateRuneInlay", [s * 0.79, 0.128, 0.16],
      [0.103, 0.103], runeTexture, [0, 1, 0], root, [0, 0, -1],
    );
    glow(mark, 0.24);
  }

  return b.root;
}
