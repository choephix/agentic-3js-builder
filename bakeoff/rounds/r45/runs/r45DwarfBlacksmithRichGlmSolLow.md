<!-- call: plan -->

```json
{
  "name": "Dwarf Blacksmith at the Anvil",
  "description": "A stocky Warcraft-style dwarf blacksmith, hammer raised overhead in one fist and tongs gripping a glowing bar in the other, working at an iron anvil on a wooden stump over a soot-blackened stone forge floor.",
  "builderName": "dwarfBlacksmith",
  "size": [1.4, 1.65, 1.4],
  "layout": "The dwarf stands centred at x=0 facing +Z, feet on the floor at z≈-0.3, a chunky 1.15 m figure with a huge head, a braided copper-red beard to mid-chest, an iron helmet with brass trim, a blue tunic under a heavy leather smithing apron and short sturdy legs in iron-toed boots. His right arm (model -X) is raised high behind his head gripping a big smith hammer with a steel head at y≈1.6, mid-swing; his left arm reaches forward so the tongs in his hand grip a glowing orange bar lying across the anvil face. Directly in front of him at z≈0.42 sits the anvil station: a wooden stump, the iron anvil with its horn pointing +X, the ember-hot bar on the face, and scattered tools (a spare hammer head, a horseshoe, tongs) leaning against the stump. Everything rests on a low stone flagstone forge floor box (z from -0.55 to 0.62) with dark grout seams, soot stains around the anvil, spilled coal lumps and hairline ember cracks glowing near the stump. Style: bold faceted low-poly shapes with chunky exaggerated proportions (head ≈1/3 of the dwarf, beard and helmet as the identity cues), flat colours read warm at the fire (ember, stump, beard, brass) against cool iron, steel and stone, and every detail - braid rings, rivets, boots, anvil plate, gauge of the hammer - is a small part in its own colour seated on the surface. The only glow comes from the bar, the ember cracks and spilled coals.",
  "palette": {
    "skin": "#d68b56",
    "beard": "#c2532e",
    "beardDark": "#8f3a1f",
    "tunic": "#3f5a7d",
    "tunicTrim": "#8fa6c4",
    "apron": "#6b4a2c",
    "apronDark": "#4a3119",
    "belt": "#3a2c1e",
    "brass": "#d9a13c",
    "gold": "#f2c14e",
    "iron": "#4c5257",
    "steel": "#6d757c",
    "ironLight": "#8b939b",
    "stone": "#8a8d92",
    "stoneDark": "#5d6065",
    "soot": "#2b2622",
    "coal": "#191411",
    "ember": "#ff8b2e",
    "emberHot": "#ffd45e",
    "stump": "#7a5334",
    "stumpDark": "#5a3b22",
    "bone": "#d8cbb0"
  },
  "mounts": {
    "hipCenter": [0, 0.5, -0.28],
    "neckBase": [0, 0.95, -0.28],
    "shoulderL": [0.3, 0.9, -0.28],
    "shoulderR": [-0.3, 0.9, -0.28],
    "stumpSeat": [0, 0.42, 0.42],
    "anvilFace": [0, 0.74, 0.42],
    "barCenter": [0, 0.78, 0.42],
    "floorLevel": [0, 0.0, 0]
  },
  "joints": [
    { "name": "root", "at": [0, 0.5, -0.28], "dir": [0, 1, 0], "role": "spine" },
    { "name": "neck", "parent": "root", "at": [0, 0.95, -0.28], "dir": [0, 0.6, 0.8], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.12, -0.24], "dir": [0, 0.25, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.0, -0.16], "dir": [0, -0.3, 1], "role": "jaw" },
    { "name": "shoulderL", "parent": "root", "at": [0.3, 0.9, -0.28], "dir": [0.8, 0.35, 0.3], "role": "arm" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.42, 0.82, -0.02], "dir": [0.2, -0.05, 1], "role": "hinge" },
    { "name": "handL", "parent": "elbowL", "at": [0.34, 0.78, 0.28], "dir": [0, 0, 1], "role": "digit" },
    { "name": "shoulderR", "parent": "root", "at": [-0.3, 0.9, -0.28], "dir": [-0.55, 0.75, 0.1], "role": "arm" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.55, 1.22, -0.2], "dir": [-0.25, 0.9, 0.25], "role": "hinge" },
    { "name": "handR", "parent": "elbowR", "at": [-0.5, 1.45, -0.05], "dir": [-0.15, 0.95, 0.2], "role": "digit" }
  ],
  "parts": [
    {
      "id": "forgeFloor",
      "builds": "The stone forge floor the whole scene stands on: a low platform of large bevelled flagstone blocks (stone top, stoneDark sides) fitted in a rough grid with visible dark grout seams as thin recessed strips. Heavy soot and scorch staining (soot-coloured thin flat patches) around and under where the stump sits, plus a few hairline ember cracks (thin glowing ember strips) radiating toward the anvil. Spilled coal lumps (small faceted coal chunks) and one or two ember sparks (tiny ember/emberHot cubes glowing) scattered near the stump. A couple of moss-grey worn corners on the far edges for age. Faceted, chunky, deliberately uneven block edges.",
      "box": [[-0.7, 0.0, -0.55], [0.7, 0.16, 0.62]],
      "attaches": "Rests on the floor at y=0; the anvilStation stump and the dwarf's boots both stand on top of its surface, meeting mounts floorLevel and stumpSeat.",
      "joints": ["root"],
      "floor": true,
      "budget": 160
    },
    {
      "id": "anvilStation",
      "builds": "The anvil station in front of the dwarf at z≈0.42: a wooden stump (stump with stumpDark bark rings on top, faceted cylinder) rising from the forge floor to y=0.42 at mount stumpSeat, and on it the iron anvil - a chunky low-poly body (iron) with a steel face plate (steel) as a thin top slab, a thick tapered horn pointing +X, a waisted waist under the face and a small ironLight base plate with brass pins. Across the face at mount anvilFace lies the glowing workpiece: a short iron bar turning ember at its middle and emberHot at the heated centre, with 2-3 tiny emberHot sparks. Leaning against the stump and lying on the floor nearby: a spare hammer head, a small horseshoe (iron), a second pair of tongs (ironLight) and a couple of coal chunks. This part owns the bar at barCenter; the armsTools tongs grip its ends.",
      "box": [[-0.5, 0.0, 0.12], [0.5, 1.0, 0.72]],
      "attaches": "Stump foot meets forgeFloor at floorLevel/stumpSeat; anvil sits on stumpSeat; the glowing bar lies on anvilFace at barCenter where armsTools' tongs meet it.",
      "joints": ["root"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "dwarfBody",
      "builds": "The dwarf's trunk and legs: short sturdy bowed legs with chunky iron-toed boots (iron with ironLight toe caps and steel soles) planted on the forge floor at z≈-0.3, thick thighs in dark trousers (belt colour), a broad barrel torso (tunic) with tunicTrim collar edging and a chest strap, all wrapped in a heavy leather smithing apron (apron with apronDark scorched patches and burn holes near the waist, one small ember spark mark) that hangs from chest to knees, and a wide tooled belt (belt colour) with a big brass buckle and hanging tool loops. Massive trapezoid shoulders and short thick neck base under the helmet; the silhouette is a squashed barrel - wider than deep, arms bulging where they leave the shoulder sockets at mounts shoulderL and shoulderR.",
      "box": [[-0.42, 0.0, -0.6], [0.42, 0.98, -0.02]],
      "attaches": "Boots rest on forgeFloor top; the torso top meets dwarfHead at mount neckBase; the shoulder sockets at mounts shoulderL and shoulderR are where armsTools' arms begin.",
      "joints": ["root"],
      "floor": true,
      "budget": 200
    },
    {
      "id": "dwarfHead",
      "builds": "The dwarf's head - the hero of the model, oversized: a broad ruddy-skinned face (skin) with a huge bulbous nose, deep-set small eyes (dark pupils in skin-shadow sockets with heavy ironLight bushy brows above), rosy cheek blocks, and small pointed ears sticking out from under the helmet. A great braided beard (beard with beardDark under-shadows) in three thick braids, each braid a tapered chain of chunky segments bound with gold rings, split by a moustache over the mouth; the jaw is a separate lower jaw piece under the moustache so it can open. The iron helmet (iron) sits low over the brow with a steel band (steel), a brass nose-guard and rivets, two short bone horns at the sides and a brass finial stud on the crown. Everything keyed off a single head-scale constant so brow, eyes, nose, braids and helmet stay in place.",
      "box": [[-0.32, 0.9, -0.62], [0.32, 1.42, -0.02]],
      "attaches": "Sits on the neck at mount neckBase riding joints neck, head and jaw; the beard's lower braids overlap the chest of dwarfBody.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "armsTools",
      "builds": "Both arms with their tools: short massive arms in tunic sleeves with rolled leather bracers (apronDark with brass studs), big four-fingered blocky fists (skin). The right arm (model -X) rises from mount shoulderR up behind the head to handR, gripping overhead a huge smith hammer: a long wooden haft (stump colour) running up to a massive steel head (steel with ironLight face bevel and a brass wedge) at y≈1.6, angled for a downswing toward the anvil. The left arm reaches forward-down from mount shoulderL to handL near the anvil, holding iron tongs whose jaws close around the ends of the glowing bar at mount barCenter, posed so the tongs meet the bar exactly where anvilStation built it. Wrists, knuckles and thumb blocks are separate small parts; elbow and shoulder transitions are chunky.",
      "box": [[-0.75, 0.9, -0.6], [0.8, 1.62, 0.45]],
      "attaches": "Arms spring from mounts shoulderL and shoulderR on the dwarfBody torso; the left tongs grip the glowing bar at mount barCenter on the anvilStation anvil face.",
      "joints": ["shoulderL", "elbowL", "handL", "shoulderR", "elbowR", "handR"],
      "floor": false,
      "budget": 170
    }
  ]
}
```

<!-- call: dwarfHead -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildDwarfHead({ b, J, P, M }: any) {
  const SKIN = P.skin;
  const BEARD = P.beard;
  const BEARD_DARK = P.beardDark;
  const IRON = P.iron;
  const STEEL = P.steel;
  const LIGHT = P.ironLight;
  const BRASS = P.brass;
  const GOLD = P.gold;
  const BONE = P.bone;
  const INK = "#241b18";
  const ROSY = "#b9634d";

  const H = 1;
  const headBone = J.head;
  const jawBone = J.jaw ?? J.head;
  const neckBone = J.neck ?? J.head;

  const part = (
    geo: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    bone: any = headBone,
    extra: any = {},
  ) => b.part(geo, color, { at, bone, ...extra });

  const sphere = (
    at: [number, number, number],
    scale: [number, number, number],
    color: string,
    bone: any = headBone,
    seg = 10,
  ) =>
    part(
      new THREE.SphereGeometry(1, seg, Math.max(6, Math.floor(seg * 0.75))),
      color,
      at,
      bone,
      { scale },
    );

  const box = (
    at: [number, number, number],
    scale: [number, number, number],
    color: string,
    bone: any = headBone,
  ) => part(new THREE.BoxGeometry(1, 1, 1), color, at, bone, { scale });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: any = headBone,
  ) => b.rod(a, c, radius, { color, bone, sides: 7, caps: "round" });

  const cone = (
    at: [number, number, number],
    dir: [number, number, number],
    radius: number,
    length: number,
    color: string,
    bone: any = headBone,
  ) =>
    part(
      new THREE.ConeGeometry(radius, length, 7),
      color,
      at,
      bone,
      { dir, scale: [1, 1, 1] },
    );

  // Thick neck collar and the broad, ruddy head.
  b.sweep(
    [
      [0, 0.91, -0.28],
      [0, 1.02, -0.25],
      [0, 1.14, -0.22],
    ],
    [0.18, 0.23, 0.27],
    { color: SKIN, bone: neckBone, sides: 8, section: "circle" },
  );

  sphere([0, 1.185, -0.245], [0.315, 0.285, 0.275], SKIN, headBone, 14);

  // Ears: broad pointed ears tucked beneath the helmet.
  for (const s of [-1, 1]) {
    cone(
      [s * 0.285, 1.205, -0.235],
      [s * 0.95, 0.08, -0.08],
      0.095,
      0.19,
      SKIN,
      headBone,
    );
    sphere([s * 0.285, 1.205, -0.235], [0.07, 0.075, 0.035], ROSY, headBone, 7);
    rod(
      [s * 0.275, 1.205, -0.205],
      [s * 0.355, 1.215, -0.218],
      0.012,
      BEARD_DARK,
      headBone,
    );
  }

  // Eye sockets, small intense eyes, and heavy bushy brows.
  for (const s of [-1, 1]) {
    sphere([s * 0.115, 1.245, 0.018], [0.073, 0.052, 0.025], BEARD_DARK, headBone, 8);
    sphere([s * 0.115, 1.245, 0.039], [0.035, 0.032, 0.014], INK, headBone, 8);
    sphere([s * 0.103, 1.257, 0.051], [0.009, 0.011, 0.006], "#fff0cf", headBone, 6);
    rod(
      [s * 0.19, 1.292, 0.035],
      [s * 0.045, 1.285, 0.045],
      0.025,
      LIGHT,
      headBone,
    );
    rod(
      [s * 0.185, 1.286, 0.057],
      [s * 0.04, 1.277, 0.064],
      0.009,
      IRON,
      headBone,
    );
  }

  // Huge characteristic nose with nostril details.
  sphere([0, 1.19, 0.075], [0.105, 0.125, 0.115], SKIN, headBone, 10);
  sphere([-0.038, 1.17, 0.151], [0.024, 0.018, 0.012], INK, headBone, 7);
  sphere([0.038, 1.17, 0.151], [0.024, 0.018, 0.012], INK, headBone, 7);
  rod([0, 1.29, 0.06], [0, 1.225, 0.13], 0.014, ROSY, headBone);

  // Rosy cheek planes.
  sphere([-0.205, 1.16, 0.015], [0.075, 0.067, 0.025], ROSY, headBone, 8);
  sphere([0.205, 1.16, 0.015], [0.075, 0.067, 0.025], ROSY, headBone, 8);

  // Separate lower jaw, deliberately slightly dropped for rig readability.
  sphere([0, 1.045, -0.005], [0.235, 0.11, 0.18], SKIN, jawBone, 10);
  box([0, 1.065, 0.12], [0.16, 0.025, 0.018], INK, jawBone);

  // Moustache split into two curled, chunky lobes.
  for (const s of [-1, 1]) {
    rod([0, 1.145, 0.13], [s * 0.095, 1.135, 0.145], 0.043, BEARD_DARK, headBone);
    sphere([s * 0.105, 1.135, 0.145], [0.09, 0.045, 0.038], BEARD, headBone, 8);
    cone([s * 0.165, 1.128, 0.145], [s * 0.9, -0.1, 0.1], 0.035, 0.09, BEARD_DARK, headBone);
  }

  // Three long braids, each made from alternating faceted lobes and gold binding rings.
  const braidX = [-0.18, 0, 0.18];
  const braidTop = [1.125, 1.105, 1.125];
  braidX.forEach((x, bi) => {
    const s = x === 0 ? 0 : x > 0 ? 1 : -1;
    const n = bi === 1 ? 6 : 5;
    for (let i = 0; i < n; i++) {
      const y = braidTop[bi] - i * 0.072;
      const xx = x + (i % 2 === 0 ? s * 0.018 : -s * 0.018);
      const zz = 0.08 - i * 0.008;
      sphere([xx, y, zz], [0.073, 0.055, 0.065], i % 2 ? BEARD : BEARD_DARK, headBone, 8);
      if (i < n - 1) {
        rod([xx, y - 0.035, zz + 0.004], [xx, y - 0.048, zz + 0.004], 0.017, GOLD, headBone);
      }
    }
    sphere([x, braidTop[bi] - n * 0.072 - 0.025, 0.08], [0.055, 0.045, 0.052], GOLD, headBone, 7);
  });

  // A few beard side tufts make the silhouette read as a classic dwarf.
  for (const s of [-1, 1]) {
    cone([s * 0.245, 1.10, 0.02], [s * 0.65, -0.2, 0.4], 0.05, 0.14, BEARD, headBone);
    cone([s * 0.25, 1.045, 0.01], [s * 0.7, -0.35, 0.2], 0.042, 0.12, BEARD_DARK, jawBone);
  }

  // Helmet dome, low brow rim, and rear cheek guards.
  sphere([0, 1.335, -0.22], [0.335, 0.17, 0.30], IRON, headBone, 12);
  box([0, 1.285, -0.01], [0.34, 0.07, 0.105], IRON, headBone);
  rod([-0.285, 1.30, -0.02], [0.285, 1.30, -0.02], 0.018, STEEL, headBone);
  rod([-0.285, 1.30, -0.29], [0.285, 1.30, -0.29], 0.014, STEEL, headBone);

  for (const s of [-1, 1]) {
    box([s * 0.285, 1.225, -0.19], [0.055, 0.17, 0.12], IRON, headBone);
    sphere([s * 0.27, 1.31, -0.03], [0.022, 0.022, 0.022], BRASS, headBone, 7);
  }

  // Brass nose guard and central helmet rivets.
  box([0, 1.285, 0.055], [0.035, 0.16, 0.025], BRASS, headBone);
  rod([0, 1.355, 0.02], [0, 1.22, 0.075], 0.012, GOLD, headBone);
  for (const s of [-1, 1]) {
    sphere([s * 0.245, 1.305, 0.015], [0.018, 0.018, 0.018], GOLD, headBone, 7);
    sphere([s * 0.285, 1.245, -0.12], [0.014, 0.014, 0.014], BRASS, headBone, 7);
  }

  // Short bone horns and crown finial.
  for (const s of [-1, 1]) {
    cone([s * 0.26, 1.395, -0.22], [s * 0.45, 0.85, -0.15], 0.045, 0.16, BONE, headBone);
    sphere([s * 0.265, 1.405, -0.22], [0.052, 0.035, 0.05], BRASS, headBone, 7);
  }
  cone([0, 1.485, -0.22], [0, 1, 0], 0.035, 0.095, BRASS, headBone);
  sphere([0, 1.54, -0.22], [0.028, 0.028, 0.028], GOLD, headBone, 7);

  // Helmet cheek rivet rows and beard highlight beads.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      sphere([s * (0.275 + i * 0.004), 1.18 - i * 0.045, -0.105], [0.012, 0.012, 0.012], BRASS, headBone, 6);
    }
  }
}
```

<!-- call: forgeFloor -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildForgeFloor({ b, J, P, M }: Ctx) {
  const bone = J.root;
  const rand = rng(417);

  const add = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(geometry, color, {
      bone,
      at,
      rotation,
      name,
      group: "forgeFloor",
      flat: true,
    });

  // Deep foundation: the dark sides remain visible between the deliberately
  // separated flagstones and make the whole platform read as one slab.
  add(
    new THREE.BoxGeometry(1.4, 0.12, 1.17),
    P.stoneDark,
    [0, 0.06, 0.035],
    "forgeFloor.foundation",
  );

  // Twelve broad, slightly varied flagstones.  The small gaps are intentional:
  // the dark foundation beneath them becomes the recessed grout.
  const xs = [-0.525, -0.175, 0.175, 0.525];
  const zs = [-0.405, -0.015, 0.375];
  let tile = 0;
  for (let iz = 0; iz < zs.length; iz++) {
    for (let ix = 0; ix < xs.length; ix++) {
      const w = 0.326 + (rand() - 0.5) * 0.012;
      const d = 0.365 + (rand() - 0.5) * 0.014;
      const y = 0.137 + (rand() - 0.5) * 0.004;
      const yaw = (rand() - 0.5) * 1.8;
      add(
        new THREE.BoxGeometry(w, 0.046, d),
        P.stone,
        [xs[ix] + (rand() - 0.5) * 0.008, y, zs[iz] + (rand() - 0.5) * 0.008],
        `forgeFloor.flagstone${tile++}`,
        [0, yaw, 0],
      );

      // A smaller, offset upper facet gives each block a chunky worn bevel
      // without smoothing away the low-poly construction.
      if ((ix + iz) % 2 === 0) {
        add(
          new THREE.BoxGeometry(w * 0.86, 0.008, d * 0.84),
          P.ironLight,
          [xs[ix] - 0.006, 0.163, zs[iz] + 0.004],
          `forgeFloor.wornTop${tile}`,
          [0, yaw * 0.7, 0],
        );
      }
    }
  }

  // Recessed cross seams, plus a broken perimeter seam.
  const grout = P.soot;
  const seamX = [-0.35, 0, 0.35];
  for (let i = 0; i < seamX.length; i++) {
    add(
      new THREE.BoxGeometry(0.018, 0.006, 1.13),
      grout,
      [seamX[i], 0.164, 0.035],
      `forgeFloor.groutX${i}`,
    );
  }
  const seamZ = [-0.21, 0.18];
  for (let i = 0; i < seamZ.length; i++) {
    add(
      new THREE.BoxGeometry(1.36, 0.006, 0.018),
      grout,
      [0, 0.164, seamZ[i]],
      `forgeFloor.groutZ${i}`,
    );
  }
  add(
    new THREE.BoxGeometry(1.36, 0.005, 0.014),
    grout,
    [0, 0.164, -0.545],
    "forgeFloor.frontGrout",
  );

  // Soot-black scorch plates under and around the stump.  They are thin,
  // offset slabs, not a second floor, so they sit visibly on the stone.
  const sootPatches: Array<[number, number, number, number, number]> = [
    [0.0, 0.168, 0.35, 0.62, 0.48],
    [-0.27, 0.169, 0.39, 0.25, 0.18],
    [0.28, 0.169, 0.40, 0.31, 0.20],
    [0.05, 0.17, 0.12, 0.36, 0.16],
  ];
  for (let i = 0; i < sootPatches.length; i++) {
    const [x, y, z, w, d] = sootPatches[i];
    add(
      new THREE.BoxGeometry(w, 0.004, d),
      P.soot,
      [x, y, z],
      `forgeFloor.scorch${i}`,
      [0, (rand() - 0.5) * 18, 0],
    );
  }

  // Angular ember cracks radiate from the hot work area toward the front and
  // sides.  Each is a separate luminous strip so the glow remains legible.
  const crackData: Array<[[number, number, number], number, number]> = [
    [[-0.03, 0.174, 0.34], 0.27, -18],
    [[0.03, 0.175, 0.31], 0.21, 24],
    [[-0.10, 0.175, 0.29], 0.16, -48],
    [[0.12, 0.175, 0.35], 0.18, 62],
    [[0.00, 0.176, 0.26], 0.11, 4],
    [[-0.20, 0.175, 0.39], 0.13, -76],
  ];
  for (let i = 0; i < crackData.length; i++) {
    const [p, length, angle] = crackData[i];
    const crack = add(
      new THREE.BoxGeometry(length, 0.006, 0.012),
      i % 3 === 0 ? P.emberHot : P.ember,
      p,
      `forgeFloor.emberCrack${i}`,
      [0, angle, 0],
    );
    glow(crack, i % 3 === 0 ? 2.4 : 1.7);
  }

  // Faceted spilled coal lumps, concentrated beside the stump rather than
  // making a distracting ring around the hero.
  const coals: Array<[number, number, number, number]> = [
    [-0.39, 0.185, 0.27, 0.035],
    [-0.31, 0.184, 0.20, 0.027],
    [0.38, 0.184, 0.29, 0.032],
    [0.31, 0.184, 0.19, 0.024],
    [0.44, 0.184, 0.38, 0.021],
    [-0.22, 0.184, 0.50, 0.022],
    [0.20, 0.184, 0.51, 0.026],
  ];
  for (let i = 0; i < coals.length; i++) {
    const [x, y, z, r] = coals[i];
    const coal = add(
      new THREE.DodecahedronGeometry(r, 0),
      i === 2 || i === 5 ? P.ember : P.coal,
      [x, y + r * 0.55, z],
      `forgeFloor.coal${i}`,
      [(rand() - 0.5) * 20, rand() * 35, (rand() - 0.5) * 20],
    );
    if (i === 2 || i === 5) glow(coal, 1.8);
  }

  // Two tiny sparks lying just above the stone, like fresh flecks shaken from
  // the forge.  Their cuboid silhouette keeps the requested puppet language.
  for (let i = 0; i < 2; i++) {
    const spark = add(
      new THREE.BoxGeometry(0.018, 0.014, 0.018),
      i === 0 ? P.emberHot : P.ember,
      [0.17 + i * 0.09, 0.19, 0.31 + i * 0.055],
      `forgeFloor.spark${i}`,
      [0, 20 + i * 30, 0],
    );
    glow(spark, 2.6);
  }

  // Moss-grey worn corners along the far edge: sparse age detail, kept lower
  // and quieter than the fire colours.
  const moss = "#6f7668";
  const mossPieces: Array<[number, number, number, number, number]> = [
    [-0.61, 0.17, -0.50, 0.12, 0.055],
    [0.58, 0.17, -0.49, 0.14, 0.05],
    [-0.62, 0.17, 0.54, 0.10, 0.045],
  ];
  for (let i = 0; i < mossPieces.length; i++) {
    const [x, y, z, w, d] = mossPieces[i];
    add(
      new THREE.BoxGeometry(w, 0.006, d),
      moss,
      [x, y, z],
      `forgeFloor.moss${i}`,
      [0, (rand() - 0.5) * 25, 0],
    );
  }
}
```

<!-- call: dwarfBody -->

```ts
import * as THREE from "three";
import { polyline } from "agentic-3js-builder";

export function buildDwarfBody({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
  const box = (
    size: [number, number, number],
    p: [number, number, number],
    color: string,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (bevel > 0) {
      // A bevelled box is approximated with a deliberately faceted octagonal prism
      // wherever the silhouette benefits from it; ordinary boxes remain crisp.
    }
    return b.part(g, color, {
      bone,
      at: p,
      name: "dwarfBody.box",
      flat: true,
    });
  };

  const cylinder = (
    radius: number,
    height: number,
    p: [number, number, number],
    color: string,
    radial = 8,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius * 1.04, height, radial), color, {
      bone,
      at: p,
      rotation,
      name: "dwarfBody.cylinder",
      flat: true,
    });

  const capsule = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.capsule(a, c, radius, { bone, color, sides: 8, name: "dwarfBody.limb" });

  const Pn = (name: string, fallback: string) => (P as any)[name] ?? fallback;

  const TUNIC = Pn("tunic", "#3f5a7d");
  const TRIM = Pn("tunicTrim", "#8fa6c4");
  const APRON = Pn("apron", "#6b4a2c");
  const APRON_DARK = Pn("apronDark", "#4a3119");
  const BELT = Pn("belt", "#3a2c1e");
  const BRASS = Pn("brass", "#d9a13c");
  const GOLD = Pn("gold", "#f2c14e");
  const IRON = Pn("iron", "#4c5257");
  const STEEL = Pn("steel", "#6d757c");
  const IRON_LIGHT = Pn("ironLight", "#8b939b");
  const SKIN = Pn("skin", "#d68b56");
  const SOOT = Pn("soot", "#2b2622");
  const EMBER = Pn("ember", "#ff8b2e");

  // The dwarf's compact lower silhouette: two broad, slightly separated trouser
  // masses keep the stance readable beneath the apron.
  capsule([-0.19, 0.47, -0.30], [-0.24, 0.22, -0.30], 0.145, BELT);
  capsule([0.19, 0.47, -0.30], [0.24, 0.22, -0.30], 0.145, BELT);

  // Knee guards and deliberately chunky boot uppers.
  for (const s of [-1, 1]) {
    box([0.25, 0.18, 0.27], [s * 0.22, 0.23, -0.30], BELT);
    box([0.30, 0.19, 0.34], [s * 0.22, 0.105, -0.285], IRON);
    box([0.33, 0.055, 0.39], [s * 0.22, 0.027, -0.31], STEEL);
    box([0.29, 0.105, 0.18], [s * 0.22, 0.115, -0.105], IRON_LIGHT);
    box([0.19, 0.09, 0.055], [s * 0.22, 0.145, -0.015], IRON);
    // Toe-cap rim and two little sole studs.
    box([0.31, 0.025, 0.035], [s * 0.22, 0.19, -0.015], STEEL);
    for (const x of [-0.08, 0.08])
      cylinder(0.018, 0.018, [s * 0.22 + x, 0.065, -0.31], IRON_LIGHT, 6);
  }

  // Heavy barrel torso, wider at the shoulder line and tighter at the waist.
  b.loft(
    [
      { at: [-0.27, 0.36, -0.30], w: 0.47, h: 0.29 },
      { at: [-0.34, 0.60, -0.30], w: 0.76, h: 0.50 },
      { at: [-0.28, 0.86, -0.30], w: 0.82, h: 0.43 },
      { at: [0.00, 0.96, -0.30], w: 0.58, h: 0.28 },
    ],
    { bone, color: TUNIC, section: "box", sides: 8, name: "dwarfBody.barrel" },
  );

  // Squared shoulder caps make the arm sockets feel massive even before the arms
  // are attached by the other builder.
  for (const s of [-1, 1]) {
    box([0.26, 0.23, 0.38], [s * 0.34, 0.83, -0.29], TUNIC);
    capsule(
      [s * 0.38, 0.86, -0.29],
      [s * 0.49, 0.83, -0.26],
      0.105,
      TUNIC,
    );
    box([0.27, 0.055, 0.39], [s * 0.35, 0.966, -0.29], TRIM);
  }

  // Short neck cylinder and a visible collar ring beneath the head.
  cylinder(0.145, 0.18, [0, 0.99, -0.29], SKIN, 8);
  cylinder(0.205, 0.055, [0, 0.925, -0.29], TRIM, 10);

  // Broad smithing apron: layered front slab, bib, and pointed lower skirt.
  box([0.50, 0.43, 0.045], [0, 0.69, 0.015], APRON);
  box([0.39, 0.30, 0.055], [0, 0.84, -0.005], APRON);
  b.extrude(
    [
      [-0.26, 0],
      [0.26, 0],
      [0.22, 0.24],
      [0.18, 0.48],
      [-0.18, 0.48],
      [-0.22, 0.24],
    ],
    {
      bone,
      at: [0, 0.37, 0.015],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.052,
      color: APRON,
      bevel: 0.008,
      name: "dwarfBody.apron",
    },
  );

  // Apron bib seams, scorched lower edge, and burn-hole patches.
  box([0.022, 0.38, 0.012], [0, 0.60, 0.047], APRON_DARK);
  box([0.39, 0.026, 0.015], [0, 0.385, 0.048], APRON_DARK);
  box([0.10, 0.075, 0.009], [-0.15, 0.53, 0.048], APRON_DARK);
  box([0.07, 0.045, 0.010], [0.14, 0.46, 0.049], SOOT);
  box([0.035, 0.035, 0.012], [-0.04, 0.42, 0.052], SOOT);
  box([0.025, 0.025, 0.014], [0.08, 0.70, 0.054], EMBER);

  // Wide belt crossing the waist, with a large square buckle and tooling studs.
  box([0.69, 0.09, 0.12], [0, 0.48, -0.005], BELT);
  box([0.13, 0.13, 0.035], [0, 0.48, 0.070], BRASS);
  box([0.085, 0.082, 0.041], [0, 0.48, 0.091], GOLD);
  for (const s of [-1, 1]) {
    for (const x of [-0.23, -0.12, 0.12, 0.23])
      cylinder(0.012, 0.014, [s * x, 0.48, 0.073], BRASS, 6);
  }

  // Hanging leather tool loops and riveted apron straps.
  for (const s of [-1, 1]) {
    capsule(
      [s * 0.25, 0.47, 0.08],
      [s * 0.27, 0.30, 0.09],
      0.018,
      APRON_DARK,
    );
    box([0.075, 0.095, 0.035], [s * 0.27, 0.27, 0.09], BRASS);
    cylinder(0.014, 0.016, [s * 0.25, 0.515, 0.072], GOLD, 6);
  }

  // Chest harness straps over the tunic, leaving the apron visibly on top.
  for (const s of [-1, 1]) {
    const strap = polyline([
      [s * 0.24, 0.93, 0.035],
      [s * 0.16, 0.78, 0.055],
      [s * 0.10, 0.60, 0.065],
    ]);
    b.sweep(strap, 0.025, {
      bone,
      color: APRON_DARK,
      sides: 6,
      caps: "flat",
      name: "dwarfBody.chestStrap",
    });
    cylinder(0.021, 0.018, [s * 0.205, 0.83, 0.068], BRASS, 6);
  }

  // Neck-side leather guards and armhole trim, seated at the two specified sockets.
  for (const s of [-1, 1]) {
    box([0.075, 0.16, 0.28], [s * 0.38, 0.83, -0.29], APRON_DARK);
    box([0.035, 0.18, 0.30], [s * 0.425, 0.83, -0.29], TRIM);
    cylinder(0.027, 0.025, [s * 0.39, 0.91, -0.105], BRASS, 8);
    cylinder(0.027, 0.025, [s * 0.39, 0.78, -0.105], BRASS, 8);
  }

  // A few raised leather seams on the apron make the large dark surface readable.
  for (const z of [0.035, 0.055, 0.075]) {
    b.rod(
      [-0.19, 0.39, z],
      [0.19, 0.39, z],
      0.006,
      APRON_DARK,
      { bone, caps: "flat", name: "dwarfBody.apronStitch" },
    );
  }
}
```

<!-- call: armsTools -->

```ts
import * as THREE from "three";
import { frame } from "agentic-3js-builder";

export function buildArmsTools({ b, J, P, M }: Ctx) {
  const skin = P.skin;
  const tunic = P.tunic;
  const leather = P.apronDark;
  const brass = P.brass;
  const wood = P.stump;
  const iron = P.iron;
  const steel = P.steel;
  const light = P.ironLight;
  const hot = P.emberHot;

  const shoulderL = J.shoulderL;
  const elbowL = J.elbowL;
  const handL = J.handL;
  const shoulderR = J.shoulderR;
  const elbowR = J.elbowR;
  const handR = J.handR;

  const box = (
    at: THREE.Vector3 | [number, number, number],
    size: [number, number, number],
    color: string,
    bone: any,
    dir?: [number, number, number],
    name?: string,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      dir,
      name,
      flat: true,
    });
  };

  const cyl = (
    a: any,
    bpt: any,
    radius: number,
    color: string,
    name?: string,
  ) => b.capsule(a, bpt, radius, { color, name, sides: 8, detail: 1 });

  const rod = (
    a: any,
    bpt: any,
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, bpt, radius, { color, name, sides: 8, detail: 1 });

  // ---------------------------------------------------------------------------
  // LEFT ARM: model +X, reaching forward and down toward the hot bar.

  cyl(shoulderL, elbowL, 0.115, tunic, "leftUpperSleeve");
  cyl(elbowL, handL, 0.095, tunic, "leftForeSleeve");

  // Large angular shoulder cap and sleeve seam.
  box(
    shoulderL.local([0, 0.01, 0]),
    [0.25, 0.22, 0.23],
    tunic,
    shoulderL,
    [0.45, -0.15, 0.75],
    "leftShoulderBlock",
  );
  cyl(
    shoulderL.local([0, 0.13, 0]),
    shoulderL.local([0, 0.19, 0]),
    0.105,
    leather,
    "leftShoulderCuff",
  );

  // Rolled leather bracer at the forearm end.
  const lBraceA = elbowL.local([0, 0.02, 0]);
  const lBraceB = handL.local([0, -0.035, 0]);
  cyl(lBraceA, lBraceB, 0.105, leather, "leftLeatherBracer");

  const lBand = handL.local([0, -0.045, 0]);
  b.ring(frame(lBand, [0, 1, 0]), {
    count: 6,
    radius: 0.108,
    fromDeg: 0,
    toDeg: 360,
    name: "leftBracerStuds",
    parent: elbowL,
    role: "fan",
  }, (at: any) =>
    b.part(new THREE.SphereGeometry(0.014, 6, 4), brass, {
      frame: at,
      name: "leftBracerRivet",
      flat: true,
    }),
  );

  // Blocky palm and wrist.
  box(handL.local([0, 0.01, 0]), [0.18, 0.15, 0.18], skin, handL, [0, 0, 1], "leftFist");
  cyl(
    handL.local([0, -0.08, 0]),
    handL.local([0, -0.015, 0]),
    0.065,
    skin,
    "leftWrist",
  );

  // Four square fingers curled around the tong handles.
  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 0.038;
    const finger = handL.local([x, 0.045, 0.08]);
    box(
      finger,
      [0.035, 0.075, 0.07],
      skin,
      handL,
      [0, 0.25, 1],
      `leftFinger${i + 1}`,
    );
    b.part(new THREE.SphereGeometry(0.019, 6, 4), light, {
      at: handL.local([x, 0.085, 0.108]),
      bone: handL,
      name: `leftKnuckle${i + 1}`,
      flat: true,
    });
  }
  box(
    handL.local([-0.105, 0.035, 0.015]),
    [0.045, 0.09, 0.06],
    skin,
    handL,
    [0.3, 0, 0.8],
    "leftThumb",
  );

  // Tongs: two dark iron handles from the fist to the glowing bar,
  // splitting into jaws around the bar at the shared mount.
  const bar = new THREE.Vector3(...M.barCenter);
  const tongGrip = handL.at.clone().add(new THREE.Vector3(0, 0.015, 0.035));
  const tongPivot = new THREE.Vector3(0.14, 0.79, 0.40);

  rod(tongGrip, tongPivot, 0.018, iron, "heldTongHandleA");
  rod(handL.at.clone().add(new THREE.Vector3(0, -0.025, 0.035)), tongPivot, 0.018, iron, "heldTongHandleB");

  const jawA = new THREE.Vector3(0.035, 0.79, 0.40);
  const jawB = new THREE.Vector3(-0.035, 0.79, 0.40);
  rod(tongPivot, jawA, 0.014, light, "tongJawA");
  rod(tongPivot, jawB, 0.014, light, "tongJawB");
  rod(jawA, new THREE.Vector3(0.015, 0.785, 0.425), 0.012, iron, "tongTipA");
  rod(jawB, new THREE.Vector3(-0.015, 0.785, 0.425), 0.012, iron, "tongTipB");
  b.part(new THREE.SphereGeometry(0.026, 8, 6), brass, {
    at: tongPivot,
    bone: handL,
    name: "tongPivotRivet",
    flat: true,
  });

  // ---------------------------------------------------------------------------
  // RIGHT ARM: model -X, lifted high behind the head.

  cyl(shoulderR, elbowR, 0.12, tunic, "rightUpperSleeve");
  cyl(elbowR, handR, 0.10, tunic, "rightForeSleeve");

  box(
    shoulderR.local([0, 0.01, 0]),
    [0.25, 0.22, 0.23],
    tunic,
    shoulderR,
    [-0.6, 0.7, 0.2],
    "rightShoulderBlock",
  );

  // Leather roll and brass studs.
  cyl(
    elbowR.local([0, -0.01, 0]),
    handR.local([0, -0.035, 0]),
    0.108,
    leather,
    "rightLeatherBracer",
  );

  b.ring(frame(handR.local([0, -0.04, 0]), [0, 1, 0]), {
    count: 6,
    radius: 0.11,
    name: "rightBracerStuds",
    parent: elbowR,
    role: "fan",
  }, (at: any) =>
    b.part(new THREE.SphereGeometry(0.014, 6, 4), brass, {
      frame: at,
      name: "rightBracerRivet",
      flat: true,
    }),
  );

  box(handR.local([0, 0, 0]), [0.18, 0.16, 0.18], skin, handR, [-0.15, 0.95, 0.2], "rightFist");
  cyl(
    handR.local([0, -0.075, 0]),
    handR.local([0, 0.005, 0]),
    0.067,
    skin,
    "rightWrist",
  );

  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 0.038;
    box(
      handR.local([x, 0.025, 0.055]),
      [0.036, 0.075, 0.07],
      skin,
      handR,
      [-0.1, 0.95, 0.18],
      `rightFinger${i + 1}`,
    );
    b.part(new THREE.SphereGeometry(0.019, 6, 4), light, {
      at: handR.local([x, 0.065, 0.085]),
      bone: handR,
      name: `rightKnuckle${i + 1}`,
      flat: true,
    });
  }
  box(
    handR.local([0.105, 0.015, 0.02]),
    [0.045, 0.09, 0.06],
    skin,
    handR,
    [-0.2, 0.9, 0.25],
    "rightThumb",
  );

  // Hammer haft, deliberately angled toward the anvil for a readable swing.
  const hammerGrip = handR.at.clone().add(new THREE.Vector3(0, 0.02, 0));
  const hammerTop = new THREE.Vector3(-0.52, 1.61, 0.055);
  rod(hammerGrip, hammerTop, 0.032, wood, "hammerWoodenHaft");

  // Ferrule below the hammer head.
  const ferruleBase = new THREE.Vector3(-0.515, 1.515, 0.055);
  const ferruleTop = new THREE.Vector3(-0.52, 1.555, 0.055);
  cyl(ferruleBase, ferruleTop, 0.052, iron, "hammerFerrule");
  b.ring(frame(ferruleTop, [0, 1, 0]), {
    count: 6,
    radius: 0.052,
    name: "hammerFerruleRivets",
    parent: handR,
    role: "fan",
  }, (at: any) =>
    b.part(new THREE.SphereGeometry(0.009, 5, 4), brass, {
      frame: at,
      name: "hammerFerruleRivet",
      flat: true,
    }),
  );

  // Massive faceted hammer head, with bevel-like lighter face blocks and wedge.
  const hammerHead = new THREE.Vector3(-0.52, 1.59, 0.055);
  box(
    hammerHead,
    [0.30, 0.18, 0.20],
    steel,
    handR,
    [1, 0.04, 0],
    "hammerSteelHead",
  );
  box(
    new THREE.Vector3(-0.52, 1.59, 0.164),
    [0.20, 0.12, 0.025],
    light,
    handR,
    [0, 0, 1],
    "hammerBrightFace",
  );
  box(
    new THREE.Vector3(-0.52, 1.59, -0.055),
    [0.20, 0.12, 0.025],
    iron,
    handR,
    [0, 0, -1],
    "hammerBackFace",
  );
  box(
    new THREE.Vector3(-0.52, 1.59, 0.055),
    [0.055, 0.12, 0.16],
    brass,
    handR,
    [1, 0, 0],
    "hammerBrassWedge",
  );

  // Small hot flecks on the hammer face, echoing the forge light.
  b.part(new THREE.BoxGeometry(0.018, 0.018, 0.008), hot, {
    at: new THREE.Vector3(-0.565, 1.59, 0.181),
    bone: handR,
    name: "hammerHeatMarkA",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.012, 0.012, 0.008), hot, {
    at: new THREE.Vector3(-0.475, 1.595, 0.181),
    bone: handR,
    name: "hammerHeatMarkB",
    flat: true,
  });

  // A few tiny brass fasteners at the shoulder transitions.
  for (const [j, side] of [[shoulderL, "L"], [shoulderR, "R"]] as const) {
    b.part(new THREE.SphereGeometry(0.021, 6, 4), brass, {
      at: j.local([0.09, 0.03, 0.105]),
      bone: j,
      name: `shoulderRivet${side}`,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.016, 6, 4), brass, {
      at: j.local([-0.07, 0.06, 0.105]),
      bone: j,
      name: `shoulderRivet${side}B`,
      flat: true,
    });
  }
}
```

<!-- call: anvilStation -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildAnvilStation({ b, J, P, M }: Ctx) {
  const bone = J.root;
  const r = rng(2417);

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => b.part(geometry, color, { bone, at, ...options });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      options,
    );

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 10,
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      at,
      options,
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    segments = 8,
    rings = 5,
  ) =>
    part(new THREE.SphereGeometry(radius, segments, rings), color, at);

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, z, radius, { bone, color });

  const spike = (
    at: [number, number, number],
    dir: [number, number, number],
    length: number,
    radius: number,
    color: string,
  ) => b.spike(at, dir, length, radius, { bone, color });

  const STUMP = P.stump;
  const STUMP_DARK = P.stumpDark;
  const IRON = P.iron;
  const STEEL = P.steel;
  const LIGHT = P.ironLight;
  const BRASS = P.brass;
  const EMBER = P.ember;
  const HOT = P.emberHot;
  const COAL = P.coal;

  // ---------------------------------------------------------------------------
  // Uneven stone-and-wood footing beneath the station. The forge-floor builder
  // owns the large platform, so these are only the station's embedded footings.
  // ---------------------------------------------------------------------------
  cylinder(0.245, 0.035, STUMP_DARK, [0, 0.018, 0.42], 10);
  cylinder(0.225, 0.025, STUMP, [0, 0.042, 0.42], 10);

  // ---------------------------------------------------------------------------
  // Faceted stump, deliberately wider at the foot and slightly irregular.
  // ---------------------------------------------------------------------------
  const stump = part(
    new THREE.CylinderGeometry(0.235, 0.275, 0.38, 10),
    STUMP,
    [0, 0.225, 0.42],
  );

  // Bark slabs and dark vertical splits.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.16;
    const x = Math.cos(a) * 0.244;
    const z = 0.42 + Math.sin(a) * 0.244;
    const h = 0.22 + r() * 0.11;
    const dark = i % 3 === 0 ? STUMP_DARK : STUMP;
    box(
      [0.018, h, 0.045],
      dark,
      [x, 0.12 + h / 2, z],
      { rotation: [0, -a, (r() - 0.5) * 0.15] },
    );
  }

  // Top growth rings: broad, low-poly torus rings and a chopped center.
  for (const [rad, tube, col] of [
    [0.205, 0.012, STUMP_DARK],
    [0.145, 0.009, STUMP_DARK],
    [0.078, 0.007, STUMP_DARK],
  ] as [number, number, string][]) {
    part(
      new THREE.TorusGeometry(rad, tube, 5, 12),
      col,
      [0, 0.418, 0.42],
      { rotation: [0, 0, 0] },
    );
  }
  cylinder(0.055, 0.012, STUMP_DARK, [0, 0.424, 0.42], 8);

  // Nail-like brass collars around the stump.
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI * 2 / 10 + 0.2;
    sphere(
      0.012,
      BRASS,
      [Math.cos(a) * 0.258, 0.17 + (i % 2) * 0.13, 0.42 + Math.sin(a) * 0.258],
      6,
      4,
    );
  }

  // ---------------------------------------------------------------------------
  // Anvil base: four-footed iron base, waist, shoulders, and face plate.
  // ---------------------------------------------------------------------------
  box([0.31, 0.055, 0.23], LIGHT, [0, 0.435, 0.42]);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      box(
        [0.085, 0.11, 0.085],
        IRON,
        [sx * 0.105, 0.49, 0.42 + sz * 0.065],
      );
    }
  }

  // Waist is a dark, slightly tapered polygonal block.
  b.frustumBox(
    [0, 0.50, 0.42],
    [0, 0.625, 0.42],
    [0.22, 0.15],
    [0.155, 0.11],
    { bone, color: IRON, section: { ngon: 6 } },
  );

  // Broad shoulders under the anvil face.
  b.frustumBox(
    [0, 0.62, 0.42],
    [0, 0.69, 0.42],
    [0.155, 0.11],
    [0.285, 0.18],
    { bone, color: IRON, section: { ngon: 6 } },
  );

  // Face plate and its raised rim.
  box([0.47, 0.045, 0.22], STEEL, [0, 0.715, 0.42]);
  box([0.43, 0.018, 0.205], LIGHT, [0, 0.748, 0.42]);
  box([0.40, 0.012, 0.18], STEEL, [0, 0.762, 0.42]);

  // Square heel and hardy-hole surround.
  box([0.19, 0.07, 0.22], IRON, [-0.14, 0.735, 0.42]);
  box([0.105, 0.012, 0.10], LIGHT, [-0.13, 0.775, 0.42]);
  box([0.052, 0.014, 0.052], P.coal, [-0.13, 0.789, 0.42]);

  // Brass mounting pins in the anvil base.
  for (const x of [-0.115, 0.115]) {
    for (const z of [0.365, 0.475]) {
      cylinder(0.014, 0.018, BRASS, [x, 0.778, z], 6);
    }
  }

  // ---------------------------------------------------------------------------
  // Horn pointing toward model-left (+X), tapering into a blunt point.
  // ---------------------------------------------------------------------------
  b.frustumBox(
    [0.12, 0.70, 0.42],
    [0.38, 0.70, 0.42],
    [0.19, 0.15],
    [0.09, 0.09],
    { bone, color: IRON, section: "box" },
  );
  b.sweep(
    [
      [0.31, 0.70, 0.42],
      [0.46, 0.70, 0.42],
      [0.56, 0.70, 0.42],
    ],
    [0.075, 0.008],
    { bone, color: STEEL, caps: { start: "flat", end: "point" }, section: { ngon: 6 } },
  );
  box([0.025, 0.16, 0.18], LIGHT, [0.19, 0.70, 0.42]);
  cylinder(0.012, 0.012, BRASS, [0.34, 0.785, 0.42], 6);

  // A few planar forge marks on the face.
  for (const x of [-0.08, 0.02, 0.10]) {
    box([0.012, 0.006, 0.12], LIGHT, [x, 0.783, 0.42], {
      rotation: [0, 0, (r() - 0.5) * 0.12],
    });
  }

  // ---------------------------------------------------------------------------
  // Glowing workpiece laid across the face, with hotter center.
  // ---------------------------------------------------------------------------
  const bar = rod([-0.21, 0.795, 0.42], [0.21, 0.795, 0.42], 0.026, IRON);
  const emberBar = rod([-0.115, 0.797, 0.42], [0.115, 0.797, 0.42], 0.031, EMBER);
  const hotBar = rod([-0.045, 0.800, 0.42], [0.045, 0.800, 0.42], 0.034, HOT);
  glow(emberBar, 1.35);
  glow(hotBar, 2.2);

  // Square scale-like heat facets around the bar.
  for (const x of [-0.14, -0.09, 0.09, 0.14]) {
    const p = box([0.018, 0.008, 0.045], P.ironLight, [x, 0.826, 0.42]);
    if (x > 0) p.mesh.rotation.z = 0.15;
  }

  // Three sparks floating just above the anvil.
  const sparks: THREE.Object3D[] = [];
  sparks.push(sphere(0.012, HOT, [-0.075, 0.858, 0.445], 6, 4));
  sparks.push(box([0.018, 0.018, 0.018], EMBER, [0.055, 0.875, 0.39]));
  sparks.push(sphere(0.009, HOT, [0.13, 0.842, 0.47], 6, 4));
  for (const s of sparks) glow(s as any, 2.4);

  // ---------------------------------------------------------------------------
  // Spare hammer head leaning against the stump.
  // ---------------------------------------------------------------------------
  b.frustumBox(
    [-0.30, 0.03, 0.25],
    [-0.18, 0.20, 0.30],
    [0.055, 0.055],
    [0.045, 0.045],
    { bone, color: STUMP_DARK, section: "box" },
  );
  box([0.16, 0.075, 0.075], IRON, [-0.27, 0.255, 0.29], {
    rotation: [0.18, 0, -0.18],
  });
  box([0.12, 0.018, 0.08], LIGHT, [-0.27, 0.299, 0.29], {
    rotation: [0.18, 0, -0.18],
  });
  cylinder(0.018, 0.09, BRASS, [-0.27, 0.245, 0.29], 6, {
    rotation: [0, 0, Math.PI / 2],
  });

  // ---------------------------------------------------------------------------
  // Small horseshoe on the floor, made from a thick open torus.
  // ---------------------------------------------------------------------------
  part(
    new THREE.TorusGeometry(0.085, 0.014, 6, 14, Math.PI * 1.55),
    IRON,
    [-0.31, 0.026, 0.56],
    { rotation: [0, 0, 0.2] },
  );
  for (const a of [-0.76, 0.76]) {
    const x = -0.31 + Math.cos(a) * 0.085;
    const z = 0.56 + Math.sin(a) * 0.085;
    cylinder(0.009, 0.012, LIGHT, [x, 0.043, z], 6);
  }

  // ---------------------------------------------------------------------------
  // Second tongs, propped against the stump.
  // ---------------------------------------------------------------------------
  rod([-0.25, 0.04, 0.19], [-0.18, 0.43, 0.35], 0.012, LIGHT);
  rod([-0.21, 0.04, 0.20], [-0.15, 0.43, 0.36], 0.012, LIGHT);
  rod([-0.18, 0.43, 0.35], [-0.11, 0.56, 0.37], 0.009, IRON);
  rod([-0.15, 0.43, 0.36], [-0.08, 0.55, 0.39], 0.009, IRON);
  sphere(0.027, BRASS, [-0.165, 0.43, 0.355], 7, 4);
  for (const x of [-0.205, -0.175]) {
    cylinder(0.015, 0.012, STUMP_DARK, [x, 0.055, 0.195], 6);
  }

  // ---------------------------------------------------------------------------
  // Spilled coal lumps around the station.
  // ---------------------------------------------------------------------------
  const coals: [number, number, number][] = [
    [-0.39, 0.028, 0.30],
    [-0.34, 0.026, 0.37],
    [0.30, 0.026, 0.25],
    [0.36, 0.028, 0.34],
    [0.29, 0.026, 0.55],
    [-0.38, 0.028, 0.57],
  ];
  for (let i = 0; i < coals.length; i++) {
    const c = sphere(0.027 + (i % 2) * 0.008, i === 3 ? EMBER : COAL, coals[i], 6, 4);
    c.mesh.scale.set(1.25, 0.75, 0.9);
    if (i === 3) glow(c, 1.8);
  }

  // A pair of tiny hot fragments beside the stump.
  const fragmentA = box([0.025, 0.012, 0.012], HOT, [0.23, 0.034, 0.31], {
    rotation: [0.1, 0.35, 0.2],
  });
  const fragmentB = box([0.018, 0.012, 0.012], EMBER, [-0.29, 0.035, 0.48], {
    rotation: [-0.2, 0.1, -0.4],
  });
  glow(fragmentA, 2.1);
  glow(fragmentB, 1.7);

  // Small brass maker's plates on the stump front.
  box([0.095, 0.042, 0.006], BRASS, [0, 0.27, 0.171]);
  box([0.067, 0.020, 0.008], P.gold, [0, 0.27, 0.166]);
  for (const x of [-0.041, 0.041]) sphere(0.008, IRON, [x, 0.27, 0.162], 6, 4);

  return stump;
}
```