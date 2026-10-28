<!-- call: plan -->

```json
{
  "name": "Revolver Gunblade",
  "description": "A Final Fantasy-style gunblade with a bright steel sword blade, a revolver mechanism at the hilt, a barrel along the spine, gold filigree, glowing sapphire and cyan accents, and a hanging lion pendant, standing upright on its pommel.",
  "builderName": "revolverGunblade",
  "size": [0.34, 1.5, 0.42],
  "layout": "The weapon stands upright with the blade pointing up (+Y) and the round pommel resting on y = 0. It is a flat-bladed sword, so the blade is thin in X (about 0.04 thick at the base) and wide in Z (0.14). The cutting edge faces the front (+Z) and the spine and barrel face the back (-Z). All axes run through x = 0; the z extent runs from about -0.26 (hammer tail, trigger guard) to +0.14 (guard front). From bottom to top: pommel (y 0-0.09), leather grip (0.09-0.40), crossguard and trigger guard (0.34-0.47), revolver receiver with a side-facing cylinder and rear hammer (0.40-0.70), blade (0.70-1.50), with the barrel riding the spine from y 0.70 to 1.34 (z -0.15..-0.07). The lion pendant hangs on a short chain from a lug on the left guard wing (+X side, x about 0.105) beside the grip, and ends near y 0.17. Final Fantasy look: elegant, slightly exaggerated, polished-steel silhouette with bold gold filigree, dark gunmetal mechanics, and a few glowing sapphire and cyan accents (pommel gem, cylinder jewel, fuller runes, muzzle). Every surface is a flat colour. Engravings, trim, rivets, runes and glints are small separate parts seated on the surface, layered as a dark outline, a main colour and a bright highlight. Light steel on the blade's top, deep steel and gunmetal in the lower mechanism, warm gold for every ornament.",
  "palette": {
    "steelBright": "#e3ebf3",
    "steel": "#a9b8c9",
    "steelShade": "#6f8095",
    "steelDeep": "#3e4a5c",
    "edgeWhite": "#fbfeff",
    "gunmetal": "#2a2e37",
    "gunmetalHi": "#4a515e",
    "black": "#12141a",
    "gold": "#e6b948",
    "goldDeep": "#a8741f",
    "goldPale": "#fbe08a",
    "leather": "#4a3126",
    "leatherDark": "#2e1d16",
    "leatherHi": "#6d4a37",
    "sapphire": "#2c6ee6",
    "glowCyan": "#52e8ff",
    "ruby": "#c1272f",
    "chain": "#cfd6df",
    "chainDark": "#7d8794",
    "lionFace": "#f0c455"
  },
  "mounts": {
    "pommelBase": [0, 0, 0],
    "gripBottom": [0, 0.09, 0],
    "gripTop": [0, 0.4, 0],
    "guardPlate": [0, 0.42, 0.0],
    "chainAnchor": [0.105, 0.4, -0.04],
    "cylinderCenter": [0, 0.55, -0.02],
    "triggerPivot": [0, 0.46, -0.085],
    "hammerPivot": [0, 0.64, -0.15],
    "guardLoopFront": [0, 0.47, -0.12],
    "guardLoopRear": [0, 0.36, -0.04],
    "bladeBase": [0, 0.7, 0.0],
    "breechTop": [0, 0.7, -0.105],
    "barrelBase": [0, 0.7, -0.105],
    "muzzle": [0, 1.34, -0.105],
    "bladeTip": [0, 1.5, 0.03],
    "spineLine": [0, 0.7, -0.07]
  },
  "joints": [
    { "name": "weapon", "at": [0, 0.4, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "cylinder", "parent": "weapon", "at": [0, 0.55, -0.02], "dir": [1, 0, 0], "role": "hinge", "group": "mechanism" },
    { "name": "trigger", "parent": "weapon", "at": [0, 0.46, -0.085], "dir": [0, -0.6, -0.8], "role": "hinge", "group": "mechanism" },
    { "name": "hammer", "parent": "weapon", "at": [0, 0.64, -0.15], "dir": [0, 0.5, -0.85], "role": "hinge", "group": "mechanism" },
    { "name": "chain1", "parent": "weapon", "at": [0.105, 0.4, -0.04], "dir": [0, -1, 0], "role": "tail", "group": "charm" },
    { "name": "chain2", "parent": "chain1", "at": [0.105, 0.34, -0.04], "dir": [0, -1, 0], "role": "tail", "group": "charm" },
    { "name": "chain3", "parent": "chain2", "at": [0.105, 0.28, -0.04], "dir": [0, -1, 0], "role": "tail", "group": "charm" },
    { "name": "pendant", "parent": "chain3", "at": [0.105, 0.22, -0.04], "dir": [0, -1, 0], "role": "tail", "group": "charm" }
  ],
  "parts": [
    {
      "id": "hilt",
      "builds": "The lower handle from pommel to grip top. (1) Pommel: a faceted lathe cap with a flat base on y=0, radius about 0.05, height 0.09, in gold with goldDeep underside bands, a ring of small gold studs, and a glowing sapphire gem (a small faceted sphere or cone) set in the bottom face and the rounded front. (2) Grip: an 8-sided tube radius 0.03 from y 0.09 to 0.40 in leather, with a diagonal leatherDark cord wrap built as thin rings or a spiral sweep, leatherHi highlight strips on the front, and gold collars (rings) at top and bottom with goldDeep edges. (3) A short sapphire or ruby bead band mid-grip, tiny rivets, and a thin goldPale highlight line on each collar. Everything is centred on x=0, z=0 and stays within x ±0.05 and z ±0.05. No chain here; the charm part hangs beside the grip.",
      "box": [[-0.05, 0, -0.05], [0.05, 0.4, 0.05]],
      "attaches": "The pommel base rests on y=0 at pommelBase. The grip top collar meets the receiver's crossguard plate at gripTop.",
      "joints": ["weapon"],
      "floor": true,
      "budget": 140
    },
    {
      "id": "receiver",
      "builds": "The revolver mechanism and guard. (1) Frame: a gunmetal housing from y 0.40 to 0.70 with a chunky chamfered front edge, side plates at x ±0.04 with gold trim lines and rivets, and gunmetalHi highlights on the top faces. (2) Crossguard: a gold plate at y 0.40-0.44 spanning x ±0.12 and z -0.06..+0.12, with upswept wing tips and goldDeep underside. On the left wing (+X) is a small ring lug at chainAnchor. Add a filigree scroll motif of small gold parts on the wings. (3) Cylinder on the joint 'cylinder': a chunky 8 to 10-sided drum, axis along X, centred at cylinderCenter, radius 0.085, width 0.07 (x ±0.035). Its two flat faces show six chamber holes in black around a central gold hub (small dark discs plus gold bullet-head rings), and the rim carries fine grooves. A sapphire jewel sits at the hub on the left face (+X). (4) Trigger on the joint 'trigger': a small gold crescent lever hanging from triggerPivot down and back. (5) Trigger guard: a gold sweep loop from guardLoopFront down and back round to guardLoopRear (touching the grip's rear face at z -0.03), about 0.016 thick. (6) Hammer on the joint 'hammer': a gunmetal hooked hammer with a gold spur and a ruby stud at its pivot, pointing back to z about -0.25. (7) Breech block: a gunmetal rear block y 0.60-0.70, z -0.15..-0.07 where the barrel starts, with a gold ring at its top (breechTop). (8) Blade lock collar: a gold and gunmetal band y 0.68-0.70 around the blade root (x ±0.035, z -0.075..+0.095) that the blade passes up through. Colours: gunmetal, gunmetalHi, gold, goldDeep, black, sapphire, ruby, steelDeep.",
      "box": [[-0.12, 0.34, -0.26], [0.12, 0.7, 0.14]],
      "attaches": "Sits on the grip at gripTop and guardPlate. The chain lug is at chainAnchor. The blade root enters at bladeBase through the collar. The barrel starts at breechTop and barrelBase. The cylinder, trigger and hammer ride the joints at their pivot mounts.",
      "joints": ["weapon", "cylinder", "trigger", "hammer"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "blade",
      "builds": "The sword blade, thin in X and wide in Z, from y 0.70 to the tip at y 1.50. Build the outline as an extrude (outline in the Z-Y plane, thickness along X) with a straight spine at z -0.07 and an edge at z +0.09 at the base. The edge side swells slightly just above the guard, then tapers with a gentle curve to a clipped diagonal point at bladeTip (z about +0.03, y 1.50). Details: (1) A steelBright main body; a steelShade bevel strip along the cutting edge as a thinner overlapping extrude, with an edgeWhite sharp edge line on the very rim. (2) A recessed fuller groove (steelDeep) along the centre from y 0.80 to 1.38 on both faces (+X and -X) with a thin edgeWhite highlight on its upper rim. (3) Gold inset ricasso block at the blade base (y 0.70-0.82) with goldDeep trim and a small gold emblem (an eight-point star or lion-mane burst) on each face. (4) Glowing glowCyan rune marks (small separate thin extrudes) in a vertical column on the fuller, 5 to 7 runes, with black outline underlays. (5) Three small notches or steps on the edge side near the base (decor ridges in steel and steelShade), and a gold clip band near the tip. (6) A brighter tip highlight (edgeWhite diagonal strip) and a steelDeep spine step line. Keep the blade slim (x ±0.02) so the silhouette is a tall, elegant blade. Colours: steelBright, steel, steelShade, steelDeep, edgeWhite, gold, goldDeep, goldPale, glowCyan, black.",
      "box": [[-0.03, 0.7, -0.07], [0.03, 1.5, 0.09]],
      "attaches": "The root sits inside the receiver's blade collar at bladeBase (y 0.70). The spine face at z -0.07 meets the barrel at spineLine. The tip is the highest point of the model, at y 1.50.",
      "joints": ["weapon"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "barrel",
      "builds": "The gun barrel assembly riding the blade's spine, from barrelBase (y 0.70) up to the muzzle (y 1.34), centred on x=0, z=-0.105. (1) Main barrel: an octagonal gunmetal tube radius 0.04 tapering to 0.034, with gunmetalHi top-facing highlight strips and black underside seams. (2) Shroud sleeve: a thicker gunmetal section y 0.72-0.95 with a row of cooling slots (small black inset boxes) and gold band rings at its ends and middle. (3) Spine clamps: 4 steel and gold bracket bands that wrap from barrel to blade spine at intervals, bridging z -0.07 to -0.11. (4) Muzzle: a gold and gunmetal flared muzzle brake with a black bore and a glowCyan ring inside the lip, plus a faint glowing sapphire dot. (5) Front sight: a small gold fin on the back of the muzzle and a rear sight notch near the breech, a thin ruby line, and tiny rivets. (6) Gold filigree scroll or vine small parts running along the barrel's -Z side, and a thin glowCyan line along the shroud. Colours: gunmetal, gunmetalHi, black, gold, goldDeep, goldPale, steel, glowCyan, sapphire, ruby.",
      "box": [[-0.045, 0.7, -0.15], [0.045, 1.34, -0.07]],
      "attaches": "Starts on the receiver breech block at barrelBase and breechTop. Its +Z face touches the blade's spine at spineLine. The muzzle is at the top of the barrel.",
      "joints": ["weapon"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "lionCharm",
      "builds": "The hanging lion pendant, Squall's signature charm, on a chain from the left guard wing lug at chainAnchor (x 0.105, y 0.40) hanging straight down. (1) Chain: a tube or sweep of small link bars (alternating oriented chain and chainDark short rod or capsule links) bending smoothly over joints chain1, chain2, chain3 from y 0.40 down to y 0.24, with a small gold jump ring at the top that loops through the lug. (2) Pendant on the joint 'pendant': a lion head medallion of radius about 0.05 centred at (0.105, 0.22, -0.04), seen from the front or +Z with its disc facing +Z and thin in z (about 0.02 thick). It has a gold rim ring, an outer mane of 10 to 12 gold spikes or shaped blades in a goldDeep to goldPale root-to-tip gradient, an inner lionFace disc, two eyes (black with a small white highlight), a small nose triangle and a muzzle with a mouth line, two small ears, and a sapphire gem on the forehead. A tiny wing or feather pair sits at each side of the disc. A small gold bail connects to chain3. Everything must be in the flat colours gold, goldDeep, goldPale, lionFace, chain, chainDark, black, sapphire. Keep x within 0.055-0.155 and y within 0.16-0.41.",
      "box": [[0.05, 0.16, -0.08], [0.16, 0.41, 0.0]],
      "attaches": "The top ring meets the left crossguard lug at chainAnchor. Joints chain1, chain2, chain3 and pendant run straight down along x about 0.105 and z -0.04, beside the grip (grip radius 0.03, so there is no collision).",
      "joints": ["chain1", "chain2", "chain3", "pendant"],
      "floor": false,
      "budget": 140
    }
  ]
}
```

<!-- call: hilt -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHilt({ b, J, P, M }: any) {
  const bone = J.weapon;
  const R = rng(11);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const lathe = (pts: number[][], c: string, y: number, seg = 8) =>
    b.lathe(pts, { at: [0, y, 0], axis: [0, 1, 0], segments: seg, color: c, bone });

  // Pommel: lower dome (goldDeep), main cap (gold), flat base on y=0
  lathe([[0, 0], [0.034, 0], [0.046, 0.012], [0.05, 0.028], [0.046, 0.034], [0, 0.034]], P.goldDeep, 0, 10);
  lathe([[0, 0.034], [0.046, 0.034], [0.05, 0.05], [0.042, 0.072], [0.03, 0.088], [0, 0.09]], P.gold, 0, 10);
  // underside gem in the bottom face (sunk slightly)
  part(new THREE.OctahedronGeometry(0.02, 0), P.sapphire, [0, 0.004, 0], { scale: [1, 0.6, 1] });
  part(new THREE.OctahedronGeometry(0.008, 0), P.glowCyan, [0, 0.002, 0.004], { scale: [1, 0.5, 1] });
  // front gem on the rounded face
  part(new THREE.OctahedronGeometry(0.014, 0), P.sapphire, [0, 0.05, 0.047], { scale: [1, 1.2, 0.8] });
  part(new THREE.OctahedronGeometry(0.005, 0), P.glowCyan, [0, 0.053, 0.056]);
  // studs ring
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    part(new THREE.SphereGeometry(0.006, 6, 4), P.goldPale, [Math.sin(a) * 0.049, 0.03, Math.cos(a) * 0.049]);
  }
  // pommel highlight ring
  lathe([[0.043, 0.074], [0.047, 0.074], [0.047, 0.077], [0.043, 0.077]], P.goldPale, 0, 10);

  // Grip
  const y0 = 0.09, y1 = 0.4;
  b.rod([0, y0, 0], [0, y1, 0], 0.03, P.leather, { bone, section: "circle", sides: 8, caps: "flat" });
  // diagonal cord wrap: tilted thin rings
  for (let i = 0; i < 17; i++) {
    const y = 0.115 + i * 0.016;
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.0305, 0.0028, 4, 12));
    m.geometry.rotateX(Math.PI / 2);
    part(m.geometry, P.leatherDark, [0, y, 0], { rotation: [0, 0, 0] });
    // diagonal feel: a small tilt on alternating rings
    part(new THREE.BoxGeometry(0.008, 0.012, 0.008), P.leatherDark, [Math.sin(i * 0.9) * 0.03, y + 0.007, Math.cos(i * 0.9) * 0.03], {
      rotation: [0, (i * 0.9 * 180) / Math.PI, 20],
    });
  }
  // highlight strips on front and back
  for (const s of [1, -1])
    part(new THREE.BoxGeometry(0.008, 0.26, 0.004), P.leatherHi, [0.0, 0.25, s * 0.0305], { rotation: [0, 0, 0] });
  for (const s of [1, -1])
    part(new THREE.BoxGeometry(0.004, 0.26, 0.008), P.leatherHi, [s * 0.0305, 0.25, 0], {});

  // Bead band mid-grip
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    part(new THREE.SphereGeometry(0.0072, 6, 4), i % 2 ? P.ruby : P.sapphire, [Math.sin(a) * 0.032, 0.245, Math.cos(a) * 0.032]);
  }
  lathe([[0.03, 0.234], [0.034, 0.234], [0.034, 0.238], [0.03, 0.238]], P.goldDeep, 0, 8);
  lathe([[0.03, 0.252], [0.034, 0.252], [0.034, 0.256], [0.03, 0.256]], P.goldDeep, 0, 8);

  // Collars at bottom and top
  for (const [y, h] of [[0.09, 0.022], [0.378, 0.022]] as number[][]) {
    lathe([[0.027, y], [0.04, y], [0.04, y + h], [0.027, y + h]], P.gold, 0, 8);
    lathe([[0.027, y], [0.042, y], [0.042, y + 0.004], [0.027, y + 0.004]], P.goldDeep, 0, 8);
    lathe([[0.027, y + h - 0.004], [0.042, y + h - 0.004], [0.042, y + h], [0.027, y + h]], P.goldDeep, 0, 8);
    lathe([[0.027, y + 0.01], [0.0415, y + 0.01], [0.0415, y + 0.013], [0.027, y + 0.013]], P.goldPale, 0, 8);
  }

  // Rivets on grip front/back
  for (const z of [1, -1])
    for (const y of [0.15, 0.34])
      part(new THREE.SphereGeometry(0.005, 6, 4), P.gold, [0, y, z * 0.031]);
  for (const x of [1, -1])
    for (const y of [0.15, 0.34])
      part(new THREE.SphereGeometry(0.005, 6, 4), P.gold, [x * 0.031, y, 0]);
  void R; void frame; void M;
}
```

<!-- call: lionCharm -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLionCharm({ b, J, P, M }: Ctx) {
  const X = 0.105, Z = -0.04;
  const R = rng(5);

  // jump ring through the lug
  const ringGeo = new THREE.TorusGeometry(0.014, 0.003, 6, 12);
  b.part(ringGeo, P.gold, { bone: J.chain1, at: [X, 0.395, Z], dir: [1, 0, 0], axis: "z" });

  // chain links: alternate orientation and colour
  const ys = [0.375, 0.355, 0.335, 0.315, 0.295, 0.275, 0.255, 0.24];
  const bones = [J.chain1, J.chain1, J.chain2, J.chain2, J.chain3, J.chain3, J.chain3, J.chain3];
  ys.forEach((y, i) => {
    const g = new THREE.TorusGeometry(0.0085, 0.0028, 5, 8).scale(1, 1.5, 1);
    b.part(g, i % 2 ? P.chainDark : P.chain, {
      bone: bones[i],
      at: [X, y, Z],
      dir: i % 2 ? [1, 0, 0] : [0, 0, 1],
      axis: "z",
    });
  });

  // bail
  b.part(new THREE.TorusGeometry(0.012, 0.003, 6, 10), P.gold, { bone: J.pendant, at: [X, 0.232, Z], dir: [1, 0, 0], axis: "z" });

  const cy = 0.185; // medallion centre (kept inside box y>=0.16 with spikes)
  const pb = J.pendant;
  const place = (geo: THREE.BufferGeometry, color: string, p: number[], opt: any = {}) =>
    b.part(geo, color, { bone: pb, at: [X + p[0], cy + p[1], Z + p[2]], ...opt });

  // mane spikes
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const dx = Math.sin(a), dy = Math.cos(a);
    const r0 = 0.034;
    const long = i % 2 ? 0.02 : 0.026;
    place(new THREE.ConeGeometry(0.0085, long, 5), i % 2 ? P.goldDeep : P.gold,
      [dx * (r0 + long / 2 - 0.002), dy * (r0 + long / 2 - 0.002), 0],
      { dir: [dx, dy, 0] });
    place(new THREE.ConeGeometry(0.0045, long * 0.55, 4), P.goldPale,
      [dx * (r0 + long * 0.7), dy * (r0 + long * 0.7), 0.004],
      { dir: [dx, dy, 0] });
  }

  // back disc, rim and face
  place(new THREE.CylinderGeometry(0.04, 0.04, 0.016, 16), P.goldDeep, [0, 0, 0], { dir: [0, 0, 1] });
  place(new THREE.TorusGeometry(0.037, 0.0035, 5, 16), P.gold, [0, 0, 0.009]);
  place(new THREE.CylinderGeometry(0.032, 0.032, 0.014, 14), P.lionFace, [0, 0, 0.003], { dir: [0, 0, 1] });

  // ears
  for (const s of [1, -1]) {
    place(new THREE.SphereGeometry(0.009, 6, 4), P.gold, [s * 0.026, 0.026, 0.01]);
    place(new THREE.SphereGeometry(0.0048, 5, 4), P.goldDeep, [s * 0.026, 0.026, 0.017]);
  }

  // sapphire forehead gem
  place(new THREE.OctahedronGeometry(0.0065), P.sapphire, [0, 0.022, 0.014], { scale: [1, 1.3, 0.8] });

  // eyes
  for (const s of [1, -1]) {
    place(new THREE.SphereGeometry(0.0055, 6, 4), P.black, [s * 0.013, 0.008, 0.015], { scale: [1.2, 0.8, 0.6] });
    place(new THREE.SphereGeometry(0.0018, 4, 3), "#ffffff", [s * 0.012, 0.0095, 0.0185]);
    // brows
    place(new THREE.BoxGeometry(0.012, 0.0025, 0.003), P.goldDeep, [s * 0.013, 0.016, 0.014], { rotation: [0, 0, s * -15] });
  }

  // muzzle
  place(new THREE.SphereGeometry(0.014, 8, 6), P.gold, [0, -0.011, 0.012], { scale: [1.3, 0.9, 0.6] });
  place(new THREE.ConeGeometry(0.0055, 0.006, 3), P.black, [0, -0.004, 0.0195], { rotation: [0, 0, 180] });
  place(new THREE.BoxGeometry(0.0025, 0.007, 0.002), P.black, [0, -0.0105, 0.0195]);
  for (const s of [1, -1]) {
    place(new THREE.BoxGeometry(0.011, 0.0024, 0.002), P.black, [s * 0.0058, -0.0145, 0.0195], { rotation: [0, 0, s * 20] });
    // cheek dots
    place(new THREE.SphereGeometry(0.0013, 4, 3), P.goldDeep, [s * 0.009, -0.009 + R() * 0.001, 0.0195]);
  }

  // wings / feathers at the sides
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const len = 0.022 - k * 0.003;
      const ang = 20 + k * 22;
      const rad = (ang * Math.PI) / 180;
      const dx = s * Math.cos(rad), dy = Math.sin(rad) * -1 + 0.2;
      place(new THREE.ConeGeometry(0.004, len, 4), k === 1 ? P.goldPale : P.gold,
        [s * (0.04 + k * 0.004) + dx * len * 0.3, 0.012 - k * 0.012, -0.011],
        { dir: [dx, dy, 0] });
    }
  }
}
```

<!-- call: blade -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBlade({ b, J, P, M }: Ctx) {
  const bone = J.weapon;
  const R = rng(5);
  // outline in (z, y) space, y measured from the blade base (0.70)
  const outline: [number, number, ("sharp")?][] = [
    [-0.07, 0],
    [0.09, 0],
    [0.098, 0.1],
    [0.09, 0.3],
    [0.075, 0.55],
    [0.05, 0.72],
    [0.03, 0.8, "sharp"],
    [-0.02, 0.77],
    [-0.07, 0.76],
  ] as any;
  const X: [number, number, number] = [0, 0, 1];
  const at = (x: number): [number, number, number] => [x, 0.7, 0];
  const body = b.extrude(outline as any, { at: at(0), x: X, y: [0, 1, 0], thickness: 0.036, bevel: 0.006, color: P.steelBright, bone });

  // bevel strip along the cutting edge (slightly thicker, thinner width)
  const bevel: any = [
    [0.05, 0.1],
    [0.087, 0.1],
    [0.08, 0.3],
    [0.066, 0.55],
    [0.043, 0.72],
    [0.03, 0.79, "sharp"],
    [0.03, 0.7],
    [0.045, 0.5],
    [0.05, 0.3],
  ];
  b.extrude(bevel, { at: at(0), x: X, thickness: 0.04, color: P.steelShade, bone });
  // sharp edge line
  const edge: any = [
    [0.083, 0.1],
    [0.097, 0.1],
    [0.089, 0.3],
    [0.074, 0.55],
    [0.05, 0.72],
    [0.03, 0.8, "sharp"],
    [0.034, 0.72],
    [0.06, 0.55],
    [0.078, 0.3],
  ];
  b.extrude(edge, { at: at(0), x: X, thickness: 0.042, color: P.edgeWhite, bone });

  // spine step line
  b.part(new THREE.BoxGeometry(0.042, 0.66, 0.008), P.steelDeep, { bone, at: [0, 1.1, -0.066] });
  b.part(new THREE.BoxGeometry(0.042, 0.62, 0.006), P.steel, { bone, at: [0, 1.1, -0.058] });

  // fuller grooves (both faces)
  for (const s of [1, -1]) {
    const fx = s * 0.0185;
    b.part(new THREE.BoxGeometry(0.004, 0.58, 0.026), P.steelDeep, { bone, at: [fx, 1.09, 0.0] });
    b.part(new THREE.BoxGeometry(0.0045, 0.58, 0.004), P.edgeWhite, { bone, at: [fx, 1.09, 0.015] });
    b.part(new THREE.BoxGeometry(0.0045, 0.012, 0.03), P.edgeWhite, { bone, at: [fx, 1.385, 0.0] });
    // ricasso
    b.part(new THREE.BoxGeometry(0.004, 0.12, 0.15), P.goldDeep, { bone, at: [s * 0.0185, 0.76, 0.01] });
    b.part(new THREE.BoxGeometry(0.0045, 0.105, 0.135), P.gold, { bone, at: [s * 0.019, 0.76, 0.01] });
    b.part(new THREE.BoxGeometry(0.005, 0.006, 0.14), P.goldPale, { bone, at: [s * 0.0195, 0.815, 0.01] });
    // star emblem: two crossed diamonds + hub
    const ep: [number, number, number] = [s * 0.0215, 0.76, 0.015];
    for (const a of [0, 45, 90, 135]) {
      b.part(new THREE.BoxGeometry(0.003, 0.05, 0.007), P.goldDeep, { bone, at: ep, rotation: [a, 0, 0] });
    }
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.004, 8), P.goldPale, { bone, at: ep, dir: [s, 0, 0] });
    // runes
    for (let i = 0; i < 6; i++) {
      const y = 0.86 + i * 0.09;
      const rp: [number, number, number] = [s * 0.0195, 1.0 + (i - 2.2) * 0.0 + (y - 1.0), 0.0];
      b.part(new THREE.BoxGeometry(0.003, 0.034, 0.02), P.black, { bone, at: rp });
      const k = R();
      const g1 = b.part(new THREE.BoxGeometry(0.0035, 0.026, 0.005), P.glowCyan, { bone, at: [rp[0] + s * 0.001, y, -0.004] });
      const g2 = b.part(new THREE.BoxGeometry(0.0035, 0.005, 0.014 + k * 0.004), P.glowCyan, { bone, at: [rp[0] + s * 0.001, y + (i % 2 ? 0.006 : -0.006), 0.003] });
      glow(g1, 1.5);
      glow(g2, 1.5);
    }
  }

  // edge notches / ridges
  for (let i = 0; i < 3; i++) {
    const y = 0.88 + i * 0.045;
    b.part(new THREE.BoxGeometry(0.04, 0.02, 0.014), i % 2 ? P.steelShade : P.steel, { bone, at: [0, y, 0.098 - i * 0.002] });
  }

  // gold clip band near tip
  b.part(new THREE.BoxGeometry(0.044, 0.02, 0.07), P.goldDeep, { bone, at: [0, 1.4, -0.02] });
  b.part(new THREE.BoxGeometry(0.046, 0.012, 0.066), P.gold, { bone, at: [0, 1.4, -0.02] });

  // tip highlight diagonal strip
  b.rod([0.0, 1.455, 0.015], [0.0, 1.495, 0.032], 0.0, P.edgeWhite, { bone, section: "box", caps: "none", radius: [0.003, 0.0015] } as any);
  b.part(new THREE.BoxGeometry(0.041, 0.006, 0.05), P.edgeWhite, { bone, at: [0, 1.472, 0.02], rotation: [28, 0, 0] });
}
```

<!-- call: barrel -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBarrel({ b, J, P, M }: Ctx) {
  const bone = J.weapon;
  const CX = 0, CZ = -0.105;
  const y0 = M.barrelBase[1], y1 = M.muzzle[1];
  const R = new (rng as any)(5);

  const cyl = (r0: number, r1: number, h: number, seg: number, color: string, y: number, z = CZ, x = 0, flat = true) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, seg), color, { bone, at: [x, y, z], flat });
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at });

  // main barrel (octagonal, tapering)
  b.part(new THREE.CylinderGeometry(0.034, 0.04, y1 - y0 - 0.02, 8), P.gunmetal, {
    bone, at: [CX, (y0 + y1 - 0.02) / 2, CZ], flat: true,
  });
  // highlight strips on top-facing (+Y not meaningful on vertical); put on back (-Z) and sides
  for (const s of [1, -1]) {
    box(0.006, 0.6, 0.006, P.gunmetalHi, [s * 0.03, 1.02, CZ - 0.02]);
    box(0.005, 0.6, 0.005, P.black, [s * 0.036, 1.02, CZ + 0.005]);
  }
  // shroud sleeve
  cyl(0.052, 0.052, 0.23, 8, P.gunmetal, 0.835);
  cyl(0.046, 0.046, 0.02, 8, P.gunmetalHi, 0.725);
  // cooling slots on both sides and back
  for (let i = 0; i < 7; i++) {
    const y = 0.75 + i * 0.03;
    for (const s of [1, -1]) box(0.006, 0.016, 0.03, P.black, [s * 0.05, y, CZ]);
    box(0.03, 0.016, 0.006, P.black, [0, y, CZ - 0.05]);
  }
  // glow cyan line along shroud
  glow(box(0.004, 0.2, 0.004, P.glowCyan, [0.019, 0.84, CZ - 0.051]), 1.2);
  glow(box(0.004, 0.2, 0.004, P.glowCyan, [-0.019, 0.84, CZ - 0.051]), 1.2);

  // gold bands
  for (const y of [0.72, 0.835, 0.95]) {
    cyl(0.056, 0.056, 0.016, 8, P.gold, y);
    cyl(0.058, 0.058, 0.004, 8, P.goldDeep, y - 0.01);
    cyl(0.057, 0.057, 0.003, 8, P.goldPale, y + 0.006);
  }

  // spine clamps bridging barrel to blade spine
  for (const y of [0.78, 1.0, 1.16, 1.28]) {
    box(0.05, 0.026, 0.05, P.steel, [0, y, -0.088]);
    box(0.054, 0.006, 0.054, P.gold, [0, y + 0.014, -0.088]);
    box(0.054, 0.006, 0.054, P.goldDeep, [0, y - 0.014, -0.088]);
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.004, 5, 4), P.goldPale, { bone, at: [s * 0.026, y, -0.07] });
  }

  // muzzle brake
  cyl(0.034, 0.05, 0.05, 8, P.gold, 1.31);
  cyl(0.05, 0.05, 0.012, 8, P.goldDeep, 1.335);
  cyl(0.052, 0.052, 0.006, 8, P.goldPale, 1.343);
  cyl(0.04, 0.04, 0.012, 8, P.gunmetal, 1.285);
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 8), P.black, { bone, at: [CX, 1.347, CZ] });
  glow(b.part(new THREE.TorusGeometry(0.03, 0.004, 4, 8), P.glowCyan, { bone, at: [CX, 1.347, CZ], rotation: [90, 0, 0] }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.006, 6, 4), P.sapphire, { bone, at: [CX, 1.32, CZ + 0.044] }), 1.4);
  // muzzle slots
  for (const s of [1, -1]) box(0.006, 0.02, 0.03, P.black, [s * 0.046, 1.31, CZ]);

  // front sight fin (back of muzzle)
  b.part(new THREE.ConeGeometry(0.014, 0.04, 4), P.gold, { bone, at: [CX, 1.34, CZ - 0.05], rotation: [-20, 45, 0] });
  box(0.008, 0.03, 0.016, P.goldDeep, [CX, 1.31, CZ - 0.046]);
  // rear sight notch near breech
  box(0.03, 0.014, 0.012, P.gunmetalHi, [CX, 0.76, CZ - 0.05]);
  box(0.008, 0.012, 0.014, P.black, [CX, 0.762, CZ - 0.052]);
  box(0.004, 0.2, 0.004, P.ruby, [CX, 1.1, CZ - 0.042]);

  // filigree vine along -Z side
  const zb = CZ - 0.044;
  for (let i = 0; i < 14; i++) {
    const y = 0.98 + i * 0.022;
    const x = Math.sin(i * 0.9) * 0.012;
    b.part(new THREE.TorusGeometry(0.007, 0.0017, 4, 8, Math.PI * 1.6), P.gold, {
      bone, at: [x, y, zb], rotation: [0, 0, i * 70],
    });
    if (i % 3 === 0) b.part(new THREE.OctahedronGeometry(0.004), P.goldPale, { bone, at: [x + 0.012, y + 0.01, zb - 0.002] });
  }
  box(0.003, 0.3, 0.003, P.goldDeep, [0, 1.12, zb - 0.002]);

  // rivets on shroud
  for (const y of [0.76, 0.91]) for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.004, 5, 4), P.goldPale, { bone, at: [s * 0.036, y, CZ + 0.038] });
}
```

<!-- call: receiver -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildReceiver({ b, J, P, M }: Ctx) {
  const W = J.weapon, CY = J.cylinder, TR = J.trigger, HA = J.hammer;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any = W, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r0: number, r1: number, h: number, seg: number, c: string, at: number[], dir: number[], bone: any = W) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), c, { bone, at, dir });
  const R = rng(5);

  // Frame housing (y 0.44-0.70)
  box(0.08, 0.26, 0.2, P.gunmetal, [0, 0.57, -0.04]);
  // chamfered front edge
  box(0.08, 0.26, 0.04, P.gunmetalHi, [0, 0.57, 0.075], W, [0, 0, 0]);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 4), P.gunmetalHi, { bone: W, at: [0, 0.57, 0.07], rotation: [0, 45, 0] });
  // top faces
  box(0.06, 0.008, 0.18, P.gunmetalHi, [0, 0.704, -0.04]);
  // side plates
  for (const s of [1, -1]) {
    box(0.008, 0.24, 0.18, P.steelDeep, [s * 0.044, 0.57, -0.04]);
    box(0.004, 0.006, 0.17, P.gold, [s * 0.049, 0.69, -0.04]);
    box(0.004, 0.006, 0.17, P.gold, [s * 0.049, 0.45, -0.04]);
    box(0.004, 0.22, 0.006, P.goldDeep, [s * 0.049, 0.57, 0.045]);
    for (const z of [-0.11, 0.03]) for (const y of [0.47, 0.67])
      cyl(0.006, 0.006, 0.006, 6, P.goldPale, [s * 0.05, y, z], [1, 0, 0]);
  }

  // Crossguard
  box(0.24, 0.02, 0.18, P.gold, [0, 0.42, 0.03]);
  box(0.24, 0.008, 0.18, P.goldDeep, [0, 0.408, 0.03]);
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.03, 0.09, 4), P.gold, { bone: W, at: [s * 0.13, 0.45, 0.03], rotation: [0, 0, -s * 12] });
    box(0.01, 0.03, 0.17, P.goldPale, [s * 0.118, 0.435, 0.03]);
    // filigree scrolls
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.TorusGeometry(0.014 - i * 0.002, 0.003, 4, 8), P.goldPale, {
        bone: W, at: [s * (0.06 + i * 0.026), 0.433, 0.07 - i * 0.02], rotation: [90, 0, 0] });
    }
    b.part(new THREE.TorusGeometry(0.012, 0.0035, 4, 8), P.goldDeep, { bone: W, at: [s * 0.09, 0.433, 0.1], rotation: [90, 0, 0] });
  }
  // lug ring at chainAnchor
  b.part(new THREE.TorusGeometry(0.014, 0.004, 6, 10), P.gold, { bone: W, at: [M.chainAnchor[0], 0.425, M.chainAnchor[2]], rotation: [0, 90, 0] });
  box(0.012, 0.012, 0.012, P.goldDeep, [0.105, 0.43, -0.04]);

  // Breech block
  box(0.07, 0.1, 0.08, P.gunmetal, [0, 0.65, -0.11]);
  box(0.05, 0.008, 0.07, P.gunmetalHi, [0, 0.703, -0.11]);
  b.part(new THREE.TorusGeometry(0.036, 0.007, 5, 10), P.gold, { bone: W, at: [0, 0.7, -0.105], rotation: [90, 0, 0] });

  // Blade collar
  box(0.07, 0.02, 0.17, P.gunmetal, [0, 0.69, 0.01]);
  box(0.075, 0.006, 0.175, P.gold, [0, 0.7, 0.01]);
  box(0.075, 0.004, 0.175, P.goldDeep, [0, 0.679, 0.01]);

  // Cylinder drum
  const cc = M.cylinderCenter;
  cyl(0.085, 0.085, 0.07, 10, P.gunmetal, cc, [1, 0, 0], CY);
  for (const s of [1, -1]) {
    cyl(0.088, 0.088, 0.008, 10, P.steelDeep, [s * 0.03, cc[1], cc[2]], [1, 0, 0], CY);
    cyl(0.03, 0.03, 0.006, 8, P.gold, [s * 0.037, cc[1], cc[2]], [1, 0, 0], CY);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const y = cc[1] + Math.cos(a) * 0.056, z = cc[2] + Math.sin(a) * 0.056;
      cyl(0.015, 0.015, 0.005, 8, P.black, [s * 0.037, y, z], [1, 0, 0], CY);
      cyl(0.008, 0.008, 0.007, 6, P.goldPale, [s * 0.038, y, z], [1, 0, 0], CY);
    }
  }
  const jewel = b.part(new THREE.OctahedronGeometry(0.016), P.sapphire, { bone: CY, at: [0.043, cc[1], cc[2]] });
  glow(jewel, 1.3);
  for (let i = 0; i < 10; i++) {
    const a = ((i + 0.5) / 10) * Math.PI * 2;
    box(0.05, 0.004, 0.012, P.black, [0, cc[1] + Math.cos(a) * 0.086, cc[2] + Math.sin(a) * 0.086], CY, [-(a * 180) / Math.PI + 90 - 90, 0, 0]);
  }

  // Trigger
  const tp = M.triggerPivot;
  cyl(0.008, 0.008, 0.02, 6, P.goldDeep, tp, [1, 0, 0], TR);
  b.part(new THREE.TorusGeometry(0.022, 0.006, 5, 8, Math.PI * 0.8), P.gold, { bone: TR, at: [0, tp[1] - 0.03, tp[2] - 0.012], rotation: [0, 90, 150] });

  // Trigger guard loop
  const f = M.guardLoopFront, r = M.guardLoopRear;
  const loop = [f, [0, 0.44, -0.15], [0, 0.39, -0.14], [0, 0.35, -0.1], [0, 0.34, -0.06], r];
  b.sweep(loop, 0.008, { bone: W, color: P.gold });
  b.sweep([[0, 0.352, -0.07], [0, 0.352, -0.035]], 0.006, { bone: W, color: P.goldDeep });

  // Hammer
  const hp = M.hammerPivot;
  cyl(0.014, 0.014, 0.05, 8, P.gold, hp, [1, 0, 0], HA);
  b.sweep([[0, hp[1], hp[2]], [0, hp[1] + 0.025, hp[2] - 0.05], [0, hp[1] + 0.05, hp[2] - 0.1]], [0.018, 0.012], { bone: HA, color: P.gunmetal });
  b.part(new THREE.ConeGeometry(0.012, 0.04, 5), P.gold, { bone: HA, at: [0, hp[1] + 0.065, hp[2] - 0.115], rotation: [-100, 0, 0] });
  box(0.03, 0.01, 0.03, P.goldDeep, [0, hp[1] + 0.058, hp[2] - 0.085], HA);
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.009, 6, 4), P.ruby, { bone: HA, at: [s * 0.026, hp[1], hp[2]] });
}
```