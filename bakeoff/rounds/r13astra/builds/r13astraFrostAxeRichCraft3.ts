import * as THREE from "three";
import {
  createBuilder,
  svg,
  paint,
  grain,
  noise,
  mix,
  rng,
} from "../../../../src/index";
import type { Fill } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Winter Sovereign",
  description:
    "A monumental frost-forged battle axe: sweeping glacial blades, blue-black forged steel, ancient gold bindings, and a luminous ice-heart. Bold, faceted fantasy-game proportions.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "WinterSovereign", paintSize: 2048 });
  const random = rng(1827);
  const root = b.joint("weapon", { at: [0, 0, 0] });

  const C = {
    black: "#101d31",
    navy: "#182f48",
    steel: "#355571",
    edge: "#7199b1",
    gold: "#bc9250",
    goldLight: "#edcd87",
    goldDark: "#705539",
    leather: "#263544",
    stitch: "#9ba4a5",
    iceDark: "#237eaa",
    ice: "#54bcd8",
    iceLight: "#a9e9ef",
    white: "#e2ffff",
    rune: "#78ecff",
  };

  const forged = paint((p, n) => {
    const rough = noise(p, 0.075, 17);
    const light = Math.max(0, n.y) * 0.28 + rough * 0.38;
    return mix("#192e48", "#507a92", light);
  });
  const steelFace = paint((p, n) => {
    const streak = noise(
      new THREE.Vector3(p.x * 0.45, p.y * 3, p.z),
      0.06,
      8,
    );
    return mix("#264b68", "#638fa6", 0.19 + streak * 0.37 + Math.max(0, n.y) * 0.19);
  });
  const gold = paint((p, n) =>
    mix("#86603a", "#e6c47b", 0.23 + noise(p, 0.04, 31) * 0.40 + Math.max(0, n.y) * 0.27),
  );
  const leather = grain("#172938", "#394653", { size: 0.012, axis: "y", seed: 11 });
  const icePaint = paint((p, n) => {
    const mist = noise(p, 0.11, 63);
    return mix("#3b9dbd", "#b9f4f5", mist * 0.56 + Math.max(0, n.y) * 0.32);
  });

  const runeStrip = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 300">
      <g fill="none" stroke="#10283d" stroke-width="12" stroke-linejoin="miter">
        <path d="M48 18V68M25 37L48 18L71 37M26 55L48 68L70 55"/>
        <path d="M24 103L48 84L72 103L48 122ZM48 84V140"/>
        <path d="M23 157L48 179L73 157M48 148V211M27 193L48 211L69 193"/>
        <path d="M48 234L24 253L48 280L72 253ZM48 234V285"/>
      </g>
      <g fill="none" stroke="#8cefff" stroke-width="5" stroke-linejoin="miter">
        <path d="M48 18V68M25 37L48 18L71 37M26 55L48 68L70 55"/>
        <path d="M24 103L48 84L72 103L48 122ZM48 84V140"/>
        <path d="M23 157L48 179L73 157M48 148V211M27 193L48 211L69 193"/>
        <path d="M48 234L24 253L48 280L72 253ZM48 234V285"/>
      </g>
    </svg>`, { size: 512 });

  const cracks = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 300">
      <g fill="none" stroke="#c5faff" stroke-width="2.8" stroke-linecap="square">
        <path d="M112 0L91 46L103 72L72 111L81 141L44 187L57 220L30 269L37 300"/>
        <path d="M103 72L137 86L151 111M72 111L39 95L16 112"/>
        <path d="M44 187L18 180L0 196M57 220L93 236L109 267"/>
        <path d="M81 141L118 149L141 177M91 46L63 34L47 9"/>
      </g>
      <g fill="#e4ffff">
        <path d="M120 204l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"/>
        <path d="M33 49l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/>
      </g>
    </svg>`, { size: 512 });

  const seal = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <path d="M100 12L174 56V144L100 188L26 144V56Z"
        fill="#142e45" stroke="#dfba72" stroke-width="7"/>
      <path d="M100 29L158 65V135L100 170L42 135V65Z"
        fill="none" stroke="#5a879a" stroke-width="3"/>
      <g fill="none" stroke="#9df7ff" stroke-width="6">
        <path d="M100 48V151M61 76L139 123M139 76L61 123"/>
        <path d="M86 57L100 70L114 57M86 142L100 129L114 142"/>
        <path d="M62 91L80 89L79 71M121 129L120 111L138 109"/>
        <path d="M121 71L120 89L138 91M62 109L80 111L79 129"/>
      </g>
      <path d="M100 80L117 100L100 120L83 100Z" fill="#e3ffff"/>
    </svg>`, { size: 384 });

  const binding = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 64">
      <rect width="256" height="64" fill="#203544"/>
      <path d="M0 8H256M0 56H256" stroke="#c2aa75" stroke-width="4"/>
      <path d="M-32 32L0 14L32 32L64 14L96 32L128 14L160 32L192 14L224 32L256 14L288 32
               M-32 32L0 50L32 32L64 50L96 32L128 50L160 32L192 50L224 32L256 50L288 32"
        fill="none" stroke="#748b94" stroke-width="4"/>
      <path d="M16 32H24M80 32H88M144 32H152M208 32H216"
        stroke="#e9c98a" stroke-width="5"/>
    </svg>`, { size: 512 });

  const engraving = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 240">
      <g fill="none" stroke="#bb995b" stroke-width="5">
        <path d="M80 10L143 56L80 102L17 56ZM80 35L111 56L80 78L49 56Z"/>
        <path d="M80 102V222M80 138L28 102V153L80 192L132 153V102L80 138"/>
        <path d="M47 215L80 235L113 215"/>
      </g>
      <g fill="#e1c789">
        <path d="M80 47L91 56L80 65L69 56Z"/>
        <circle cx="28" cy="183" r="4"/><circle cx="132" cy="183" r="4"/>
      </g>
    </svg>`, { size: 384 });

  function box(
    at: number[],
    size: number[],
    color: Fill,
    name: string,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, rotation, bone: root, name,
    });
  }

  function poly(
    outline: number[][],
    at: number[],
    thickness: number,
    color: Fill,
    name: string,
    side = 1,
  ) {
    return b.extrude(outline, {
      at,
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness,
      color,
      bone: root,
      name,
    });
  }

  function stud(at: number[], radius = 0.012, color: Fill = gold) {
    return b.part(new THREE.IcosahedronGeometry(radius, 0), color, {
      at, bone: root, name: "forgedRivet",
    });
  }

  function line(points: number[][], radius: number, color: Fill, name: string) {
    return b.sweep(points, radius, {
      bone: root, color, sides: 5, caps: "flat", name,
    });
  }

  function drawing(
    texture: THREE.Texture,
    at: number[],
    width: number,
    height: number,
    back = false,
    turn = 0,
    luminous = false,
  ) {
    const p = b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      rotation: [0, back ? 180 : 0, turn],
      texture,
      bone: root,
      name: "inlaidDrawing",
    });
    if (luminous) glow(p, 0.65);
    return p;
  }

  // A long octagonal tang keeps the silhouette of a usable two-handed weapon.
  b.lathe([
    [0, 0.13], [0.052, 0.13], [0.052, 0.30],
    [0.045, 0.40], [0.048, 1.37], [0.068, 1.49],
    [0.068, 2.06], [0, 2.06],
  ], { at: [0, 0, 0], segments: 8, color: forged, bone: root, name: "continuousTang" });

  // Pointed, ground-contact pommel.
  b.lathe([
    [0, 0], [0.047, 0.034], [0.094, 0.107],
    [0.079, 0.184], [0.053, 0.217], [0, 0.217],
  ], { at: [0, 0, 0], segments: 6, color: forged, bone: root, name: "pommel" });

  b.lathe([
    [0.048, 0], [0.071, 0], [0.075, 0.025],
    [0.069, 0.046], [0.048, 0.046],
  ], { at: [0, 0.181, 0], segments: 8, color: gold, bone: root, name: "pommelCollar" });

  for (const face of [1, -1]) {
    poly(
      [[0, -0.052], [0.033, 0], [0, 0.053], [-0.033, 0]],
      [0, 0.11, face * 0.079],
      0.012,
      C.goldDark,
      "pommelGemSetting",
    );
    glow(poly(
      [[0, -0.038], [0.022, 0], [0, 0.038], [-0.022, 0]],
      [0, 0.11, face * 0.089],
      0.008,
      C.ice,
      "pommelIce",
    ), 0.5);
  }

  // Leather grip with individually readable overlapping diagonal bindings.
  b.part(new THREE.CylinderGeometry(0.061, 0.065, 0.94, 8), leather, {
    at: [0, 0.724, 0], bone: root, name: "leatherSleeve",
  });
  for (let i = 0; i < 17; i++) {
    const y = 0.278 + i * 0.054;
    const wrapPoints: number[][] = [];
    for (let j = 0; j <= 8; j++) {
      const a = (j / 8) * Math.PI * 2;
      wrapPoints.push([
        Math.cos(a) * 0.064,
        y + j / 8 * 0.045,
        Math.sin(a) * 0.064,
      ]);
    }
    line(wrapPoints, 0.009, i % 3 === 0 ? C.steel : leather, "raisedGripWrap");
    for (const face of [1, -1]) {
      line([
        [-0.014, y + 0.017, face * 0.068],
        [-0.005, y + 0.025, face * 0.069],
      ], 0.0018, C.stitch, "gripStitch");
    }
  }

  for (const y of [0.247, 0.70, 1.20]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.045, 8), gold, {
      at: [0, y, 0], bone: root, name: "gripBinding",
    });
    b.part(new THREE.CylinderGeometry(0.076, 0.076, 0.028, 8), "#ffffff", {
      at: [0, y, 0],
      texture: binding,
      bone: root,
      name: "wovenBindingInlay",
    });
    for (const face of [1, -1])
      stud([0, y, face * 0.078], 0.009);
  }

  // Armoured throat above the grip.
  b.lathe([
    [0, 0], [0.067, 0], [0.084, 0.055],
    [0.078, 0.125], [0.064, 0.22], [0, 0.22],
  ], { at: [0, 1.22, 0], segments: 8, color: forged, bone: root, name: "throat" });

  for (const y of [1.235, 1.40, 1.47]) {
    b.part(new THREE.CylinderGeometry(0.083, 0.083, 0.025, 8), gold, {
      at: [0, y, 0], bone: root, name: "throatRing",
    });
  }
  for (const face of [1, -1]) {
    drawing(engraving, [0, 1.325, face * 0.080], 0.08, 0.13, face < 0);
  }

  const headY = 1.82;

  // The axe heads are broad primitive plates, not thin decorative wings.
  const blade = [
    [0.115, 0.13],
    [0.36, 0.22],
    [0.64, 0.53],
    [0.61, 0.19],
    [0.83, 0.06],
    [0.95, -0.18],
    [0.91, -0.39],
    [0.67, -0.68],
    [0.62, -0.40],
    [0.35, -0.23],
    [0.115, -0.16],
  ];

  const inset = [
    [0.14, 0.095],
    [0.38, 0.17],
    [0.57, 0.35],
    [0.53, 0.13],
    [0.72, -0.01],
    [0.82, -0.19],
    [0.78, -0.34],
    [0.67, -0.51],
    [0.57, -0.32],
    [0.34, -0.18],
    [0.14, -0.125],
  ];

  const outerEdge = [
    [0.64, 0.53], [0.61, 0.19], [0.83, 0.06],
    [0.95, -0.18], [0.91, -0.39], [0.67, -0.68],
  ];
  const innerEdge = [
    [0.57, 0.35], [0.53, 0.13], [0.72, -0.01],
    [0.82, -0.19], [0.78, -0.34], [0.67, -0.51],
  ];

  for (const side of [1, -1]) {
    const tag = side === 1 ? "L" : "R";
    poly(blade, [0, headY, 0], 0.135, forged, `bladeCore${tag}`, side);

    for (const face of [1, -1]) {
      poly(inset, [0, headY, face * 0.078], 0.020, steelFace, `bladeFace${tag}`, side);

      // Wide bevels are actual planar facets, sloping from the thick steel
      // shoulders to the sharp, pale ice cutting edge.
      for (let i = 0; i < outerEdge.length - 1; i++) {
        const a = outerEdge[i];
        const c = outerEdge[i + 1];
        const d = innerEdge[i + 1];
        const e = innerEdge[i];
        const A = [side * a[0], headY + a[1], face * 0.026];
        const B = [side * c[0], headY + c[1], face * 0.026];
        const D = [side * d[0], headY + d[1], face * 0.095];
        const E = [side * e[0], headY + e[1], face * 0.095];
        b.slab([A, B, D], {
          thickness: 0.005,
          color: i % 2 === 0 ? C.iceLight : icePaint,
          bone: root,
          name: "glacialCuttingFacet",
        });
        b.slab([A, D, E], {
          thickness: 0.005,
          color: i % 2 === 0 ? icePaint : C.ice,
          bone: root,
          name: "glacialBevelFacet",
        });
      }

      line(
        innerEdge.map(([x, y]) => [side * x, headY + y, face * 0.099]),
        0.008,
        C.iceDark,
        "bladeBevelSeam",
      );

      // Raised angular reinforcement follows the inside of each crescent.
      line([
        [side * 0.153, headY + 0.087, face * 0.100],
        [side * 0.345, headY + 0.135, face * 0.100],
        [side * 0.495, headY + 0.255, face * 0.100],
      ], 0.012, gold, "upperBladeFiligree");

      line([
        [side * 0.15, headY - 0.12, face * 0.100],
        [side * 0.35, headY - 0.16, face * 0.100],
        [side * 0.56, headY - 0.30, face * 0.100],
        [side * 0.635, headY - 0.43, face * 0.100],
      ], 0.012, gold, "lowerBladeFiligree");

      poly([
        [0.19, 0.045], [0.35, 0.075], [0.46, -0.015],
        [0.36, -0.115], [0.19, -0.085],
      ], [0, headY, face * 0.103], 0.018, C.navy, "bladeRootInset", side);

      drawing(
        engraving,
        [side * 0.325, headY - 0.022, face * 0.117],
        0.115,
        0.16,
        face < 0,
        side * -12,
      );
      drawing(
        runeStrip,
        [side * 0.644, headY - 0.125, face * 0.093],
        0.09,
        0.31,
        face < 0,
        side * 24,
        true,
      );
      drawing(
        cracks,
        [side * 0.794, headY - 0.215, face * 0.101],
        0.072,
        0.18,
        face < 0,
        side * -12,
      );

      for (const [x, y] of [
        [0.19, 0.087], [0.32, 0.12], [0.405, 0.17],
        [0.20, -0.126], [0.34, -0.166], [0.48, -0.255],
      ]) {
        stud([side * x, headY + y, face * 0.112], 0.012);
      }

      // Tiny forged nicks are deliberately sparse, concentrated at the edge.
      for (let i = 0; i < 5; i++) {
        const y = headY - 0.12 - i * 0.045;
        const x = side * (0.836 - Math.abs(i - 2) * 0.011);
        line([
          [x, y, face * 0.084],
          [x - side * (0.015 + random() * 0.014), y - 0.017, face * 0.091],
        ], 0.0026, C.white, "edgeWear");
      }
    }

    // A thin highlight along the cutting silhouette ties the facets together.
    line(
      outerEdge.map(([x, y]) => [side * x, headY + y, 0]),
      0.012,
      C.iceLight,
      "frozenEdge",
    );
  }

  // Massive central socket and stepped gold-edged escutcheon.
  box([0, 1.79, 0], [0.235, 0.54, 0.235], forged, "headSocket");
  for (const y of [1.555, 2.015]) {
    box([0, y, 0], [0.275, 0.044, 0.258], gold, "socketBinding");
    box([0, y, 0], [0.28, 0.014, 0.265], C.goldLight, "socketBindingHighlight");
  }

  const shield = [
    [0, 0.29], [0.18, 0.15], [0.18, -0.12],
    [0.09, -0.27], [0, -0.32], [-0.09, -0.27],
    [-0.18, -0.12], [-0.18, 0.15],
  ];
  const shieldInner = shield.map(([x, y]) => [x * 0.84, y * 0.88]);

  for (const face of [1, -1]) {
    poly(shield, [0, headY, face * 0.14], 0.066, gold, "socketEscutcheon");
    poly(shieldInner, [0, headY, face * 0.181], 0.030, C.navy, "escutcheonRecess");

    for (const side of [1, -1]) {
      line([
        [side * 0.12, 2.005, face * 0.204],
        [side * 0.14, 1.915, face * 0.204],
        [side * 0.14, 1.755, face * 0.204],
        [side * 0.075, 1.61, face * 0.204],
      ], 0.009, C.edge, "socketRaisedBorder");
      stud([side * 0.143, 1.94, face * 0.213], 0.018);
      stud([side * 0.115, 1.69, face * 0.213], 0.014);
    }

    drawing(seal, [0, 1.825, face * 0.201], 0.232, 0.232, face < 0);

    // Solid ice heart: a sharply faceted kite, projecting above its dark seat.
    const heartOutline = [
      [0, 0.107], [0.051, 0.035], [0.038, -0.051],
      [0, -0.104], [-0.038, -0.051], [-0.051, 0.035],
    ];
    poly(heartOutline, [0, 1.825, face * 0.211], 0.014, C.iceDark, "heartSeat");
    const ridge = [0, 1.84, face * 0.279];
    const heartPoints = heartOutline.map(([x, y]) => [x, 1.825 + y, face * 0.224]);
    for (let i = 0; i < heartPoints.length; i++) {
      const p = b.slab([
        heartPoints[i],
        heartPoints[(i + 1) % heartPoints.length],
        ridge,
      ], {
        thickness: 0.003,
        color: [C.white, C.iceLight, C.ice, C.iceDark, C.ice, C.iceLight][i],
        bone: root,
        name: "iceHeartFacet",
      });
      glow(p, 0.65);
    }
    for (const y of [1.735, 1.92]) {
      box([0, y, face * 0.234], [0.044, 0.016, 0.024], gold, "heartClaw");
    }
  }

  // A spear-like crown of ice rises from the axe socket.
  b.lathe([
    [0, 0], [0.09, 0], [0.095, 0.035],
    [0.075, 0.073], [0.056, 0.10], [0, 0.10],
  ], { at: [0, 2.04, 0], segments: 6, color: gold, bone: root, name: "crownFerrule" });

  function crystal(
    at: number[],
    width: number,
    length: number,
    tilt: number,
    name: string,
  ) {
    const g = new THREE.CylinderGeometry(width * 0.62, width, length * 0.58, 5, 1);
    const stem = b.part(g, icePaint, {
      at: [at[0], at[1] + length * 0.25, at[2]],
      rotation: [0, 0, tilt],
      bone: root,
      name: `${name}Body`,
      flat: true,
    });
    const a = tilt * Math.PI / 180;
    const direction = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    const base = new THREE.Vector3(at[0], at[1] + length * 0.25, at[2])
      .addScaledVector(direction, length * 0.29);
    const tip = base.clone().addScaledVector(direction, length * 0.42);
    const spike = b.spike(base, tip, null, width * 0.62, {
      color: C.iceLight,
      bone: root,
      sides: 5,
      smooth: false,
      name: `${name}Tip`,
    });
    glow(spike, 0.3);
    return stem;
  }

  crystal([0, 2.12, 0], 0.071, 0.37, 0, "crownCrystal");
  for (const side of [1, -1]) {
    crystal([side * 0.06, 2.092, -0.014], 0.035, 0.20, -side * 26, "crownSplinter");

    // Broad claw-shaped supports, rather than a cloud of loose crystals.
    poly([
      [0.02, 0], [0.093, 0.014], [0.13, 0.12],
      [0.071, 0.085], [0.045, 0.19],
    ], [0, 2.015, 0.02], 0.095, forged, "crownClaw", side);

    for (const face of [1, -1]) {
      line([
        [side * 0.042, 2.047, face * 0.075],
        [side * 0.079, 2.085, face * 0.075],
        [side * 0.055, 2.16, face * 0.075],
      ], 0.007, gold, "crownClawInlay");
    }
  }

  // Small frost crystals are rooted in the head's inner corners.
  for (const side of [1, -1]) {
    crystal([side * 0.18, 1.97, 0.005], 0.028, 0.14, -side * 34, "socketFrost");
    crystal([side * 0.27, 1.99, -0.012], 0.023, 0.10, -side * 42, "socketFrost");
  }

  return b.root;
}
