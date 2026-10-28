<!-- call: plan -->

```json
{
  "name": "Baba Yaga's Hut on Chicken Legs",
  "description": "A Slavic folk-art diorama: a carved log izba with a red-trimmed gable roof, standing on two giant scaly chicken legs inside a skull-post fence on a small forest clearing.",
  "builderName": "babaYagaHut",
  "size": [7.0, 5.5, 7.0],
  "layout": "Everything is centred on x = 0 and faces +Z, which is the front door and stairs. A round clearing disc (radius 3.5, top y 0.2) is the only floor piece. The izba floats on two chicken legs standing at x = ±0.75, z about 0.1, with feet planted at y 0.2 and toes splayed forward. Bottom to top: clearing y 0 to 0.2; legs y 0.2 to 2.0; a hut floor platform from y 1.85 to 2.0 (footprint x ±1.4, z ±1.3); honey-brown log walls y 2.0 to 3.5 (outer faces x ±1.3, z ±1.2, with log ends and rings sticking out 0.1 at the corners); then a steep gable roof with eaves at y 3.4 and x ±1.85, ridge at y 4.9 running along z from -1.65 to 1.75, overhanging the front. The front gable (door side, +Z) holds the door and the porch: a landing at z 1.2 to 2.0 and steep stairs down to the clearing, ending at z 3.1. A stubby brick chimney sits on the left rear slope. A horse-head ridge finial (konyok) crowns the front and back ends of the ridge. Folk art shows through one repeated motif, the six-petal rosette and sun, in red, yellow, blue and white. It appears on the door, window platbands, gable sunburst, porch balusters, fence posts and the clearing's border band. Carved platbands with zigzag cut-outs frame every window. Fretted barge-boards (polotentse) hang from the gable edges. Shingles alternate two browns with scalloped ends. The legs are chunky and bright yellow, with thick feathery rust-and-cream trousers at the top, scaled shanks, a spur, and three big dark claws plus a back toe on each foot. A skull-on-stake fence rings the clearing, with an open gap at the front for the stairs and a pair of gate posts. Birch trunks stand at the back corners, red-and-white fly-agaric mushrooms, flowers and stones decorate the edge, and a mortar and pestle rests near the stairs. The whole look is a chunky, simple primitive base with painted ornament built from small separate parts, and every surface is one flat colour.",
  "palette": {
    "logDark": "#6b3f22",
    "logMid": "#8a5530",
    "logLight": "#a8703a",
    "logEnd": "#d9a35e",
    "folkRed": "#c8281e",
    "folkBlue": "#1f5fa8",
    "folkYellow": "#f2b820",
    "folkWhite": "#f4ead2",
    "folkBlack": "#1c1613",
    "folkGreen": "#3f8a3a",
    "shingleDark": "#5a3b26",
    "shingleLight": "#7d5636",
    "moss": "#6a8a3a",
    "scaleYellow": "#e0a626",
    "scaleDark": "#a8701a",
    "featherRust": "#9a5a2a",
    "earth": "#5a4030",
    "grass": "#4f7a35",
    "grassDark": "#35582a",
    "stone": "#8b8a86",
    "stoneDark": "#5e5d5a",
    "glowGreen": "#7dff5a",
    "glowWarm": "#ffb347",
    "smoke": "#8c8a90"
  },
  "mounts": {
    "groundTop": [0, 0.2, 0],
    "hutFloor": [0, 2.0, 0],
    "hutUnderside": [0, 1.85, 0],
    "hipL": [0.75, 1.9, 0.1],
    "hipR": [-0.75, 1.9, 0.1],
    "ankleL": [0.8, 0.32, 0.45],
    "ankleR": [-0.8, 0.32, 0.45],
    "wallTop": [0, 3.5, 0],
    "doorCenter": [0, 2.55, 1.22],
    "windowLeft": [1.3, 2.8, 0.0],
    "windowRight": [-1.3, 2.8, 0.0],
    "windowBack": [0, 2.8, -1.2],
    "frontGable": [0, 3.5, 1.2],
    "ridgeFront": [0, 4.9, 1.75],
    "ridgeBack": [0, 4.9, -1.65],
    "eaveLeft": [1.85, 3.4, 0],
    "eaveRight": [-1.85, 3.4, 0],
    "chimneyBase": [-0.8, 4.2, -0.7],
    "porchLanding": [0, 2.0, 1.6],
    "stairTop": [0, 2.0, 2.0],
    "stairBottom": [0, 0.2, 3.1],
    "gatePostL": [1.2, 0.2, 2.9],
    "gatePostR": [-1.2, 0.2, 2.9]
  },
  "joints": [
    { "name": "ground", "at": [0, 0.2, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "hut", "parent": "ground", "at": [0, 2.0, 0], "dir": [0, 1, 0], "role": "spine", "group": "hut" },
    { "name": "doorHinge", "parent": "hut", "at": [-0.4, 2.55, 1.22], "dir": [0, 1, 0], "role": "hinge", "group": "hut" },

    { "name": "hipL", "parent": "hut", "at": [0.75, 1.9, 0.1], "dir": [0.05, -0.65, 0.3], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.8, 1.25, 0.4], "dir": [0, -0.55, -0.5], "role": "leg", "group": "legs" },
    { "name": "hockL", "parent": "kneeL", "at": [0.8, 0.7, -0.1], "dir": [0, -0.38, 0.55], "role": "leg", "group": "legs" },
    { "name": "ankleL", "parent": "hockL", "at": [0.8, 0.32, 0.45], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "toeL1", "parent": "ankleL", "at": [0.8, 0.3, 0.5], "dir": [0, -0.05, 1], "role": "digit", "group": "legs" },
    { "name": "toeL2", "parent": "ankleL", "at": [0.8, 0.3, 0.5], "dir": [-0.45, -0.05, 1], "role": "digit", "group": "legs" },
    { "name": "toeL3", "parent": "ankleL", "at": [0.8, 0.3, 0.5], "dir": [0.45, -0.05, 1], "role": "digit", "group": "legs" },
    { "name": "toeL4", "parent": "ankleL", "at": [0.8, 0.3, 0.4], "dir": [0, -0.05, -1], "role": "digit", "group": "legs" },

    { "name": "hipR", "parent": "hut", "at": [-0.75, 1.9, 0.1], "dir": [-0.05, -0.65, 0.3], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.8, 1.25, 0.4], "dir": [0, -0.55, -0.5], "role": "leg", "group": "legs" },
    { "name": "hockR", "parent": "kneeR", "at": [-0.8, 0.7, -0.1], "dir": [0, -0.38, 0.55], "role": "leg", "group": "legs" },
    { "name": "ankleR", "parent": "hockR", "at": [-0.8, 0.32, 0.45], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "toeR1", "parent": "ankleR", "at": [-0.8, 0.3, 0.5], "dir": [0, -0.05, 1], "role": "digit", "group": "legs" },
    { "name": "toeR2", "parent": "ankleR", "at": [-0.8, 0.3, 0.5], "dir": [0.45, -0.05, 1], "role": "digit", "group": "legs" },
    { "name": "toeR3", "parent": "ankleR", "at": [-0.8, 0.3, 0.5], "dir": [-0.45, -0.05, 1], "role": "digit", "group": "legs" },
    { "name": "toeR4", "parent": "ankleR", "at": [-0.8, 0.3, 0.4], "dir": [0, -0.05, -1], "role": "digit", "group": "legs" }
  ],
  "parts": [
    {
      "id": "chickenLegs",
      "builds": "Both giant chicken legs, mirrored, each running hip, knee (forward), hock (back) and ankle with a continuous smooth-skinned scaly tube. The tarsus is yellow (scaleYellow) with scaleDark scale plates, bands or ridges as small seated parts, and a sharp spur on the back of the hock. The thigh and knee wear a big shaggy trouser of overlapping feather blades in a root-to-tip palette (featherRust at the root, folkWhite and folkBlack tips), starting at y 2.0 so it tucks under the hut platform at hutUnderside around the hip mounts. The foot has three forward toes (toeL1 centre, toeL2 inner, toeL3 outer; toeR1 to toeR3 mirrored) and a back toe (toe4), each a tapered tube with knuckle bumps and a big curved dark claw (folkBlack, with a folkWhite highlight). Toe bottoms rest just in the clearing (ankle y 0.3, toe radius about 0.09). Ankle gets a folk-art red band with tiny yellow dots. Rigs: sweeps skinned over the leg chains, toes on digit joints. Shares the same left and right leg design, mirrored by sign of x.",
      "box": [[-1.35, 0.2, -0.7], [1.35, 2.05, 1.3]],
      "attaches": "Hips at mounts hipL and hipR tuck under hutUnderside (y 1.85); feet plant at ankleL and ankleR just into groundTop (y 0.2). The feathers hide the seam at the hut platform.",
      "joints": ["hipL", "kneeL", "hockL", "ankleL", "toeL1", "toeL2", "toeL3", "toeL4", "hipR", "kneeR", "hockR", "ankleR", "toeR1", "toeR2", "toeR3", "toeR4"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "hutWalls",
      "builds": "The izba body. Floor platform (y 1.85 to 2.0, x ±1.4, z ±1.3) of dark planks with underside crossbeams and root-like knobs. Log walls y 2.0 to 3.5 built from stacked horizontal cylinders (about 6 courses, alternating logMid, logDark and logLight), outer faces at x ±1.3 and z ±1.2. Log ends protrude 0.1 at the four corners (notched corner crossings) and each end carries a small logEnd disc with a dark ring. A top plate logDark at y 3.5 and a moss patch or two (moss) on the base logs. Front wall: a door at doorCenter (x ±0.4, y 2.0 to 3.1) hung on the doorHinge joint, painted folkBlue with a folkRed border frame, yellow six-petal rosettes and a sun in the centre, iron-black hinge straps and a ring handle (folkBlack). It sits slightly proud of the wall. Left and right side windows at windowLeft and windowRight, and a back window at windowBack (opening about 0.5 wide by 0.6 tall, glowing warm folkYellow or glowWarm panes with folkBlack cross muntins). Each has carved platbands around it (folkRed frame, folkWhite zigzag cut-outs, a little folkBlue crown with a rosette on top, an apron below) and an open pair of shutters flat against the wall painted folkBlue with folkYellow rosette dots. The corner posts carry a thin folkRed painted stripe.",
      "box": [[-1.4, 1.85, -1.3], [1.4, 3.55, 1.3]],
      "attaches": "Sits on hutFloor (y 2.0) over the legs at hutUnderside. Wall top at wallTop (y 3.5) meets the roof part. The front face at z 1.2 meets the porch landing at porchLanding and the stairs. Door rides doorHinge; everything else rides hut.",
      "joints": ["hut", "doorHinge"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "roof",
      "builds": "The steep folk gable roof and everything above wallTop. Two roof planes (thick slabs or lofts) run from eaveLeft or eaveRight (x ±1.85, y 3.4) up to the ridge at y 4.9, z -1.65 to 1.75, with a front overhang. They are covered by rows of scalloped shingle plates alternating shingleDark and shingleLight, and moss (moss) along the lower edges. A ridge beam (logDark) carries a carved horse-head finial (konyok) at ridgeFront and ridgeBack, painted folkRed with folkYellow trim and folkBlack eyes. A front gable triangle filled with vertical planks (logLight and logMid) fills from wallTop (y 3.5, x ±1.35) up to a point at about y 4.85. A round attic window sits at its centre with a folkYellow sunburst of 8 rays and a folkBlue ring, and a rosette row beneath. The gable edges wear fretted barge-boards (polotentse) in folkRed with folkWhite zigzag cut-outs and hanging pendant ends at the eaves. On the left rear slope a brick chimney (stoneDark with stone caps, folkRed brick courses) rises from chimneyBase, topped by a few puffs of smoke clumps (smoke) up to y 5.5. Small bone-white skull or rosette decorations are optional on the ridge.",
      "box": [[-1.95, 3.4, -1.75], [1.95, 5.5, 1.85]],
      "attaches": "Roof eaves rest at wallTop (y 3.5) on the wall top plate; the gable triangle sits on the front wall at frontGable. The chimney stands on chimneyBase. Rides the hut joint.",
      "joints": ["hut"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "porchStairs",
      "builds": "The front porch and steep stair. A landing platform (planks logMid, edge beam logDark) with top at y 2.0, x ±0.85, z 1.2 to 2.0, at porchLanding. Eight steps run from stairTop (0, 2.0, 2.0) down to stairBottom (0, 0.2, 3.1), each a plank with rise about 0.225 and run 0.14, two stringers (logDark), and the front edge of each step carries a thin folkRed stripe with yellow dot accents. Railings on both sides: turned balusters (folkWhite with folkRed rings, small rosette caps) and a sloped handrail (logLight) following the stair, with carved newel posts topped with folkYellow balls at the landing. A hanging lantern (folkBlack frame, glowing glowWarm pane) on a bracket by the door at the landing's front-left. Small props on the landing and steps: a twig broom leaning on the rail (logLight handle, featherRust straw), a wooden bucket (logMid with folkBlack hoops), and strings of dried mushrooms or herb bundles (folkRed, folkWhite, folkGreen) hanging from a short beam at the landing's left edge.",
      "box": [[-1.0, 0.2, 1.2], [1.0, 3.0, 3.15]],
      "attaches": "Landing meets the front wall at z about 1.2 near hutFloor and porchLanding. Stairs end at stairBottom on groundTop. Rides hut, whose stairs bottom just touches the clearing.",
      "joints": ["hut"],
      "floor": false,
      "budget": 110
    },
    {
      "id": "clearingDiorama",
      "builds": "The diorama base and its dressing, kept simpler than the hut. A low round clearing disc (radius 3.5, y 0 to 0.2) in earth, with a grass cap (grass, with grassDark tufts as small cones, broad folk-style blades) and a dirt path (earth) from the gate to stairBottom. A folk border band around the rim: alternating folkRed and folkWhite wedges and folkBlue dots, repeating the rosette motif every ~0.7 m. A skull fence: stakes (logDark, pointed tops, one every ~0.45 m at radius about 3.15 with a gap of about ±22° around +Z) each topped with a folkWhite skull whose eye sockets glow glowGreen. Every third stake wears a folkRed painted band with a yellow dot. Two thicker gate posts at gatePostL and gatePostR carry bigger skulls. Behind the hut: two birch trunks (folkWhite with folkBlack bark dashes) at about (±2.7, z -2.3) rising to y 4.3, with a few angled branches and small folkGreen leaf plates. Along the fence and the sides, clusters of fly-agaric mushrooms (folkRed caps with folkWhite spots, folkWhite stems), big six-petal folk flowers (folkYellow, folkRed and folkBlue petals with folkGreen stems and leaves), and a few rocks (stone and stoneDark, faceted) with moss (moss) on top. A wooden mortar (logDark with folkRed band) with a pestle leaning in it, placed to the right of the stairs near (-1.7, z 2.5), and a fallen log and ferns near the back. All of this stays outside the stairs and the hut footprint.",
      "box": [[-3.5, 0.0, -3.5], [3.5, 4.3, 3.5]],
      "attaches": "Disc top is groundTop (y 0.2): legs plant their feet on it and the stair ends at stairBottom (0, 0.2, 3.1). Fence gap lines up with the stairs between gatePostL and gatePostR. Rides ground.",
      "joints": ["ground"],
      "floor": true,
      "budget": 200
    }
  ]
}
```

<!-- call: chickenLegs -->

```ts
import * as THREE from "three";
import { aim, bezier, catmull, rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildChickenLegs({ b, J, P }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const DARKRUST = "#7d4621";
  const rnd = rng(11);

  // ---- merged feather store: one part per bone and colour ----
  const store = new Map<string, { bone: any; color: string; geos: THREE.BufferGeometry[] }>();
  const addG = (bone: any, color: string, g: THREE.BufferGeometry) => {
    const key = `${bone.name}|${color}`;
    let e = store.get(key);
    if (!e) store.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(g);
  };
  const kite = (len: number, w: number, depth: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(w / 2, len * 0.38);
    sh.lineTo(0, len);
    sh.lineTo(-w / 2, len * 0.38);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  const tipGeo = (len: number, w: number, depth: number) => {
    const hw = (w / 2) * 0.645;
    const sh = new THREE.Shape();
    sh.moveTo(-hw, len * 0.6);
    sh.lineTo(hw, len * 0.6);
    sh.lineTo(0, len);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  const feather = (
    bone: any, pos: THREE.Vector3, dir: THREE.Vector3, radial: THREE.Vector3,
    len: number, w: number, base: string, tip: string | null,
  ) => {
    const q = aim(dir, radial);
    const m = new THREE.Matrix4().compose(pos, q, V(1, 1, 1));
    addG(bone, base, kite(len, w, 0.03).applyMatrix4(m));
    if (tip) addG(bone, tip, tipGeo(len, w, 0.044).applyMatrix4(m));
  };
  const basis = (T: THREE.Vector3): [THREE.Vector3, THREE.Vector3] => {
    const e1 = new THREE.Vector3().crossVectors(T, V(1, 0, 0)).normalize();
    const e2 = new THREE.Vector3().crossVectors(T, e1).normalize();
    return [e1, e2];
  };

  const featherTips: (string | null)[] = [
    P.folkWhite, null, P.folkWhite, P.folkBlack, P.folkWhite, P.folkBlack, P.folkWhite, P.folkBlack,
  ];

  function leg(s: number) {
    const S = s > 0 ? "L" : "R";
    const hip = J[`hip${S}`], knee = J[`knee${S}`], hock = J[`hock${S}`], ankle = J[`ankle${S}`];

    const pts = [V(s * 0.75, 1.93, 0.1), V(s * 0.8, 1.25, 0.4), V(s * 0.8, 0.7, -0.1), V(s * 0.8, 0.32, 0.45)];
    const path = catmull(pts);
    const tK = path.closestT(pts[1]);
    const tH = path.closestT(pts[2]);
    const keys: [number, number][] = [[0, 0.28], [tK, 0.21], [tH, 0.125], [1, 0.095]];
    const rad = (t: number) => {
      for (let i = 0; i < keys.length - 1; i++) {
        const [t0, r0] = keys[i];
        const [t1, r1] = keys[i + 1];
        if (t <= t1) return r0 + ((r1 - r0) * (t - t0)) / Math.max(1e-6, t1 - t0);
      }
      return keys[keys.length - 1][1];
    };
    const tEnd = tK + (tH - tK) * 0.75;

    // ---- the continuous skinned leg tube ----
    const main = b.sweep(path, rad, {
      bone: [hip, knee, hock, ankle],
      color: P.scaleYellow,
      bands: [[tEnd + 0.02, P.featherRust], [1, P.scaleYellow]],
      caps: { start: "flat", end: "round" },
    });

    // ---- shaggy feather trousers ----
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const t = 0.03 + ((tEnd - 0.03) * r) / (rows - 1);
      const C = path.at(t);
      const T = path.tangentAt(t).normalize();
      const [e1, e2] = basis(T);
      const rr = rad(t);
      const n = Math.max(7, Math.min(12, Math.round((2 * Math.PI * rr) / 0.14)));
      const bone = t < tK - 0.02 ? hip : knee;
      const base = r % 2 ? DARKRUST : P.featherRust;
      for (let k = 0; k < n; k++) {
        const ang = ((k + (r % 2) * 0.5) / n) * Math.PI * 2 + (rnd() - 0.5) * 0.15;
        const radial = e1.clone().multiplyScalar(Math.cos(ang)).addScaledVector(e2, Math.sin(ang)).normalize();
        const root = C.clone().addScaledVector(radial, rr * 0.88 + r * 0.01);
        const tilt = ((16 + r * 3.5) * Math.PI) / 180;
        const dir = T.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(radial, Math.sin(tilt)).normalize();
        const len = 0.3 + rnd() * 0.07;
        const w = 0.11 + rr * 0.4;
        feather(bone, root, dir, radial, len, w, base, featherTips[r]);
      }
    }

    // ---- scale plates on the tarsus ----
    const rowsT = [0.1, 0.27, 0.44, 0.6, 0.74].map((f) => tH + (1 - tH) * f);
    rowsT.forEach((t, i) => {
      const angs = i % 2 ? [-30, 30] : [-58, 0, 58];
      for (const a of angs) {
        const hit = main.at(t, a);
        b.stick(new THREE.CylinderGeometry(0.044, 0.052, 0.034, 6), P.scaleDark, hit, {
          embed: 0.45,
          flow: hit.tangent,
          scale: rad(t) / 0.1,
        });
      }
    });

    // ---- folk red band with yellow dots at the ankle ----
    const tb = tH + (1 - tH) * 0.9;
    const Cb = path.at(tb);
    const Tb = path.tangentAt(tb).normalize();
    const [b1, b2] = basis(Tb);
    const rb = rad(tb) * 1.14;
    b.part(new THREE.CylinderGeometry(rb, rb, 0.1, 12), P.folkRed, { bone: hock, at: Cb, dir: Tb });
    for (const o of [-0.054, 0.054]) {
      b.part(new THREE.TorusGeometry(rb * 0.99, 0.011, 5, 12), P.folkYellow, {
        bone: hock,
        at: Cb.clone().addScaledVector(Tb, o),
        dir: Tb,
        axis: "z",
      });
    }
    const dots: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const p = Cb.clone()
        .addScaledVector(b1, Math.cos(a) * (rb * 0.98 + 0.006))
        .addScaledVector(b2, Math.sin(a) * (rb * 0.98 + 0.006));
      dots.push(new THREE.SphereGeometry(0.017, 5, 4).translate(p.x, p.y, p.z));
    }
    const dg = mergeGeometries(dots);
    if (dg) b.part(dg, P.folkYellow, { bone: hock, at: [0, 0, 0] });

    // ---- spur on the back of the hock ----
    const hit = b.surface(main).ray([s * 0.8, 0.72, -1.2], [0, 0, 1]);
    const root = hit ? hit.at.clone() : V(s * 0.8, 0.72, -0.2);
    const o = (x: number, y: number, z: number) => root.clone().add(V(x, y, z));
    b.part(new THREE.SphereGeometry(0.075, 6, 5), P.scaleDark, { bone: hock, at: o(0, 0.01, -0.02) });
    b.sweep(bezier(o(0, 0.01, 0.05), o(0, 0.03, -0.14), o(0, -0.02, -0.26), o(0, -0.15, -0.34)), [0.058, 0], {
      bone: hock,
      color: P.folkWhite,
      caps: { start: "flat", end: "point" },
      sides: 6,
    });
    b.part(new THREE.SphereGeometry(0.036, 5, 4), P.folkBlack, { bone: hock, at: o(0, -0.145, -0.335) });

    // ---- ankle ball ----
    b.part(new THREE.SphereGeometry(0.12, 8, 6).scale(1, 0.9, 1.08), P.scaleYellow, {
      bone: ankle,
      at: V(s * 0.8, 0.31, 0.46),
    });

    // ---- toes ----
    const toes: [number, number, number, number][] = [
      [1, 0, 1, 0.68],
      [2, -s * 0.45, 1, 0.6],
      [3, s * 0.45, 1, 0.6],
      [4, 0, -1, 0.46],
    ];
    for (const [i, dx, dz, L] of toes) {
      const tj = J[`toe${S}${i}`];
      const d = V(dx, 0, dz).normalize();
      const baseP = i < 4 ? V(s * 0.8, 0.285, 0.5) : V(s * 0.8, 0.285, 0.4);
      const tipY = 0.255;
      const tip = baseP.clone().addScaledVector(d, L);
      tip.y = tipY;
      const r0 = i === 4 ? 0.085 : 0.095;
      const r1 = 0.058;
      const toe = b.sweep([baseP, tip], [r0, r1], {
        bone: tj,
        color: P.scaleYellow,
        caps: { start: "round", end: "flat" },
      });
      // knuckle bumps with dark scale plates
      for (const f of [0.3, 0.62]) {
        const c = baseP.clone().lerp(tip, f);
        const rr = r0 + (r1 - r0) * f + 0.014;
        b.part(new THREE.SphereGeometry(rr, 7, 5), P.scaleYellow, { bone: tj, at: c });
        b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.03, 6), P.scaleDark, {
          bone: tj,
          at: c.clone().add(V(0, rr - 0.006, 0)),
        });
      }
      // big curved dark claw
      const pt = (dist: number, y: number) => {
        const p = tip.clone().addScaledVector(d, dist);
        p.y = y;
        return p;
      };
      const claw = b.sweep(
        bezier(pt(-0.04, tipY), pt(0.14, tipY + 0.02), pt(0.27, tipY - 0.03), pt(0.35, 0.2)),
        [0.068, 0],
        { bone: tj, color: P.folkBlack, caps: { start: "flat", end: "point" }, sides: 6 },
      );
      const hl: THREE.Vector3[] = [];
      for (const t of [0.12, 0.28, 0.44, 0.6]) hl.push(claw.at(t, 0, 0.003).at.clone());
      b.sweep(hl, [0.012, 0.004], { bone: tj, color: P.folkWhite, sides: 4 });
      void toe;
    }
  }

  leg(1);
  leg(-1);

  for (const e of store.values()) {
    const g = mergeGeometries(e.geos);
    if (g) b.part(g, e.color, { bone: e.bone, at: [0, 0, 0] });
  }
}
```

<!-- call: porchStairs -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { aim } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type V = [number, number, number];

export function buildPorchStairs({ b, J, P }: Ctx) {
  const bone = J.hut;
  const D = Math.PI / 180;

  // ---------------------------------------------------------------- merge bins (one part per colour)
  const bins = new Map<string, THREE.BufferGeometry[]>();
  const tmp = new THREE.Matrix4();
  const eul = new THREE.Euler();
  const qq = new THREE.Quaternion();
  const put = (
    color: string,
    geo: THREE.BufferGeometry,
    at: V,
    rot: V = [0, 0, 0],
    scale: V = [1, 1, 1],
    quat?: THREE.Quaternion,
  ) => {
    const q = quat ?? qq.setFromEuler(eul.set(rot[0] * D, rot[1] * D, rot[2] * D));
    tmp.compose(new THREE.Vector3(...at), q, new THREE.Vector3(...scale));
    geo.applyMatrix4(tmp);
    if (!bins.has(color)) bins.set(color, []);
    bins.get(color)!.push(geo);
  };
  const box = (c: string, s: V, at: V, rot?: V) => put(c, new THREE.BoxGeometry(s[0], s[1], s[2]), at, rot);
  const cyl = (c: string, rt: number, rb: number, h: number, seg: number, at: V, rot?: V, sc?: V) =>
    put(c, new THREE.CylinderGeometry(rt, rb, h, seg), at, rot, sc);
  const ball = (c: string, r: number, at: V, sc?: V, w = 6, h = 4) =>
    put(c, new THREE.SphereGeometry(r, w, h), at, [0, 0, 0], sc);
  const rod = (c: string, a: V, e: V, r0: number, r1 = r0, seg = 6) => {
    const d: V = [e[0] - a[0], e[1] - a[1], e[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const mid: V = [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, (a[2] + e[2]) / 2];
    put(c, new THREE.CylinderGeometry(r1, r0, len, seg), mid, [0, 0, 0], [1, 1, 1], aim(d));
  };
  const rosette = (at: V, face: "x" | "y" | "z", sgn: number, r: number, petal: string, center: string) => {
    const ia = face === "x" ? [2, 1] : face === "y" ? [0, 2] : [0, 1];
    const n = face === "x" ? 0 : face === "y" ? 1 : 2;
    const sc: V = [1, 1, 1];
    sc[n] = 0.4;
    for (let k = 0; k < 6; k++) {
      const a = k * 60 * D;
      const p: V = [...at];
      p[ia[0]] += Math.cos(a) * r * 0.62;
      p[ia[1]] += Math.sin(a) * r * 0.62;
      p[n] += sgn * r * 0.05;
      ball(petal, r * 0.45, p, sc, 5, 3);
    }
    const c: V = [...at];
    c[n] += sgn * r * 0.16;
    ball(center, r * 0.3, c, sc, 5, 3);
  };

  // ---------------------------------------------------------------- palette & constants
  const MID = P.logMid, DARK = P.logDark, LIGHT = P.logLight, END = P.logEnd;
  const RED = P.folkRed, BLUE = P.folkBlue, YEL = P.folkYellow, WHITE = P.folkWhite;
  const BLACK = P.folkBlack, GREEN = P.folkGreen, MOSS = P.moss, RUST = P.featherRust;

  const PX = 0.815; // x of rails, stringers, side beams
  const RISE = (2.0 - 0.23) / 8;
  const RUN = 0.1375;
  const yT = (i: number) => 2.0 - RISE * i;
  const zN = (i: number) => 2.0 + RUN * i;
  const SL = Math.hypot(1.1, 1.77);
  const yAt = (z: number) => 2.0 - (1.77 / 1.1) * (z - 2.0);
  const dS: V = [0, -1.77 / SL, 1.1 / SL];
  const nUp: V = [0, 1.1 / SL, 1.77 / SL];
  const onS = (s: number, off = 0): V => [0, 2.0 + dS[1] * s + nUp[1] * off, 2.0 + dS[2] * s + nUp[2] * off];

  // ---------------------------------------------------------------- landing
  box(DARK, [1.7, 0.08, 0.8], [0, 1.89, 1.6]);
  for (let k = 0; k < 7; k++) {
    const x = -0.78 + 0.2229 * (k + 0.5);
    box(k % 2 ? LIGHT : MID, [0.213, 0.08, 0.78], [x, 1.96, 1.58]);
  }
  box(DARK, [1.7, 0.21, 0.1], [0, 1.895, 2.0]); // front edge beam
  for (const s of [1, -1]) {
    box(DARK, [0.07, 0.2, 0.85], [s * PX, 1.9, 1.625]); // side beams
    rosette([s * 0.852, 1.9, 1.5], "x", s, 0.06, RED, YEL);
    rosette([s * 0.852, 1.9, 1.8], "x", s, 0.06, YEL, RED);
  }
  box(LIGHT, [0.9, 0.03, 0.12], [0, 2.015, 1.27]); // threshold
  // joist ends poking out of the front
  for (const x of [-0.6, -0.2, 0.2, 0.6]) {
    rod(MID, [x, 1.87, 1.9], [x, 1.87, 2.12], 0.05, 0.05, 7);
    cyl(DARK, 0.056, 0.056, 0.006, 7, [x, 1.87, 2.119], [90, 0, 0]);
    cyl(END, 0.043, 0.043, 0.008, 7, [x, 1.87, 2.123], [90, 0, 0]);
  }
  // rosettes on the front beam
  rosette([-0.4, 1.9, 2.053], "z", 1, 0.07, RED, YEL);
  rosette([0, 1.9, 2.053], "z", 1, 0.07, BLUE, WHITE);
  rosette([0.4, 1.9, 2.053], "z", 1, 0.07, RED, YEL);
  // woven runner rug
  box(BLUE, [0.7, 0.01, 0.58], [0, 2.004, 1.62]);
  box(RED, [0.6, 0.012, 0.48], [0, 2.006, 1.62]);
  box(WHITE, [0.6, 0.0125, 0.03], [0, 2.007, 1.44]);
  box(WHITE, [0.6, 0.0125, 0.03], [0, 2.007, 1.8]);
  rosette([0, 2.014, 1.62], "y", 1, 0.11, WHITE, YEL);

  // ---------------------------------------------------------------- stairs
  for (let i = 1; i <= 8; i++) {
    const y = yT(i), zf = zN(i), z0 = zN(i - 1);
    const depth = zf + 0.04 - z0;
    box(i % 2 ? MID : LIGHT, [1.56, 0.045, depth], [0, y - 0.0225, (z0 + zf + 0.04) / 2]);
    if (i < 8) box(DARK, [1.56, RISE - 0.045, 0.03], [0, yT(i + 1) + (RISE - 0.045) / 2, zf - 0.015]);
    box(RED, [1.56, 0.026, 0.008], [0, y - 0.0225, zf + 0.044]);
    for (const x of [-0.6, -0.3, 0, 0.3, 0.6]) cyl(YEL, 0.011, 0.011, 0.006, 6, [x, y - 0.0225, zf + 0.0485], [90, 0, 0]);
  }
  // stringers
  const sMid = 0.985;
  const sq = aim(dS, [0, 1, 0], "z");
  for (const s of [1, -1]) {
    const c = onS(sMid, -0.1);
    put(DARK, new THREE.BoxGeometry(0.07, 0.2, 2.07), [s * PX, c[1], c[2]], [0, 0, 0], [1, 1, 1], sq);
    const st = onS(0.95, -0.03);
    put(RED, new THREE.BoxGeometry(0.006, 0.014, 2.0), [s * 0.8515, st[1], st[2]], [0, 0, 0], [1, 1, 1], sq);
    const cols: [string, string][] = [[WHITE, RED], [YEL, BLUE], [RED, YEL]];
    [0.5, 1.0, 1.5].forEach((t, k) => {
      const p = onS(t, -0.1);
      rosette([s * 0.852, p[1], p[2]], "x", s, 0.052, cols[k][0], cols[k][1]);
    });
  }

  // ---------------------------------------------------------------- newels, rails, balusters
  const newel = (x: number, z: number, y0: number, y1: number, tall: boolean) => {
    const h = y1 - y0;
    cyl(LIGHT, 0.05, 0.05, h, 8, [x, y0 + h / 2, z]);
    cyl(DARK, 0.068, 0.068, 0.05, 8, [x, y0 + 0.1, z]);
    cyl(RED, 0.057, 0.057, 0.04, 8, [x, y0 + h * 0.38, z]);
    cyl(WHITE, 0.056, 0.056, 0.03, 8, [x, y0 + h * 0.72, z]);
    cyl(DARK, 0.04, 0.06, 0.04, 8, [x, y1 + 0.01, z]);
    ball(YEL, tall ? 0.07 : 0.07, [x, y1 + 0.07, z], undefined, 7, 5);
  };
  const baluster = (x: number, z: number, y0: number, y1: number) => {
    const h = y1 - y0;
    cyl(WHITE, 0.02, 0.02, h, 6, [x, y0 + h / 2, z]);
    cyl(WHITE, 0.03, 0.026, h * 0.17, 6, [x, y0 + h * 0.2, z]);
    cyl(RED, 0.034, 0.034, 0.022, 6, [x, y0 + h * 0.37, z]);
    cyl(RED, 0.034, 0.034, 0.022, 6, [x, y0 + h * 0.62, z]);
    cyl(YEL, 0.027, 0.027, 0.02, 6, [x, y0 + h * 0.95, z]);
  };
  for (const s of [1, -1]) {
    const x = s * PX;
    newel(x, 2.0, 1.8, 2.85, true);
    newel(x, 3.1, 0.2, 1.1, false);
    // back post at the wall
    cyl(LIGHT, 0.04, 0.04, 0.85, 8, [x, 2.425, 1.28]);
    cyl(RED, 0.046, 0.046, 0.03, 8, [x, 2.5, 1.28]);
    ball(YEL, 0.05, [x, 2.88, 1.28], undefined, 6, 4);
    // handrails
    rod(LIGHT, [x, 2.78, 1.28], [x, 2.78, 2.0], 0.035, 0.035, 6);
    rod(LIGHT, [x, 2.78, 2.0], [x, yAt(3.1) + 0.78, 3.1], 0.035, 0.035, 6);
    rod(MID, [x, 2.2, 1.28], [x, 2.2, 2.0], 0.024, 0.024, 6);
    rod(MID, [x, 2.0 - 0.25, 2.0], [x, 2.0 - 0.25, 2.0], 0.001); // (degenerate guard removed below)
    // stair balusters
    for (let k = 0; k < 8; k++) {
      const z = 2.0 + RUN * (k + 0.5);
      baluster(x, z, yAt(z) - 0.03, yAt(z) + 0.745);
    }
  }
  // landing balusters on the right-hand side only (left carries the herb strings)
  for (let k = 0; k < 4; k++) baluster(-PX, 1.28 + 0.144 * (k + 1), 2.0, 2.745);

  // ---------------------------------------------------------------- lantern & bracket
  const LX = 0.55, LZ = 1.52;
  box(BLACK, [0.1, 0.22, 0.03], [LX, 2.85, 1.215]);
  for (const dy of [-0.07, 0.07]) ball(RED, 0.012, [LX + 0.0, 2.85 + dy, 1.232], undefined, 5, 3);
  rod(BLACK, [LX, 2.96, 1.22], [LX, 2.96, LZ], 0.018, 0.018, 6);
  rod(BLACK, [LX, 2.68, 1.22], [LX, 2.94, 1.44], 0.014, 0.014, 6);
  ball(BLACK, 0.026, [LX, 2.96, LZ + 0.005], undefined, 6, 4);
  rod(BLACK, [LX, 2.955, LZ], [LX, 2.9, LZ], 0.006, 0.006, 4);
  put(BLACK, new THREE.TorusGeometry(0.02, 0.005, 4, 8), [LX, 2.9, LZ], [90, 0, 0]);
  cyl(BLACK, 0.0, 0.125, 0.1, 4, [LX, 2.855, LZ], [0, 45, 0]);
  box(BLACK, [0.17, 0.02, 0.17], [LX, 2.805, LZ]);
  box(BLACK, [0.16, 0.025, 0.16], [LX, 2.583, LZ]);
  cyl(BLACK, 0.03, 0.0, 0.06, 4, [LX, 2.54, LZ], [0, 45, 0]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(BLACK, [0.02, 0.2, 0.02], [LX + sx * 0.07, 2.695, LZ + sz * 0.07]);
  box(RED, [0.18, 0.012, 0.18], [LX, 2.82, LZ]);
  for (const sg of [1, -1]) {
    box(BLACK, [0.012, 0.2, 0.006], [LX, 2.695, LZ + sg * 0.063]);
    box(BLACK, [0.12, 0.012, 0.006], [LX, 2.695, LZ + sg * 0.063]);
    box(BLACK, [0.006, 0.2, 0.012], [LX + sg * 0.063, 2.695, LZ]);
    box(BLACK, [0.006, 0.012, 0.12], [LX + sg * 0.063, 2.695, LZ]);
  }

  // ---------------------------------------------------------------- bucket (left of the door side, on the landing)
  const BX = 0.56, BZ = 1.62;
  cyl(MID, 0.17, 0.14, 0.26, 10, [BX, 2.13, BZ]);
  cyl(BLACK, 0.156, 0.156, 0.025, 10, [BX, 2.06, BZ]);
  cyl(BLACK, 0.171, 0.171, 0.025, 10, [BX, 2.2, BZ]);
  cyl(DARK, 0.162, 0.162, 0.01, 10, [BX, 2.248, BZ]);
  put(BLACK, new THREE.TorusGeometry(0.16, 0.011, 4, 8, Math.PI), [BX, 2.26, BZ]);
  for (const sx of [1, -1]) box(BLACK, [0.02, 0.04, 0.02], [BX + sx * 0.168, 2.25, BZ]);
  for (const [dx, dz] of [[-0.06, 0.02], [0.05, -0.04], [0.03, 0.07], [-0.03, -0.07]])
    ball(RED, 0.035, [BX + dx, 2.262, BZ + dz], undefined, 5, 3);

  // ---------------------------------------------------------------- broom leaning on the right rail
  {
    const b0: V = [-0.6, 2.04, 1.55];
    const T: V = [-0.84, 2.95, 1.66];
    const d: V = [T[0] - b0[0], T[1] - b0[1], T[2] - b0[2]];
    const L = Math.hypot(...d);
    const u: V = [d[0] / L, d[1] / L, d[2] / L];
    const at = (t: number): V => [b0[0] + u[0] * t, b0[1] + u[1] * t, b0[2] + u[2] * t];
    rod(LIGHT, b0, T, 0.019, 0.019, 6);
    rod(RUST, b0, at(0.5), 0.11, 0.035, 8);
    rod(RED, at(0.27), at(0.3), 0.073, 0.073, 8);
    rod(YEL, at(0.37), at(0.39), 0.056, 0.056, 8);
    ball(LIGHT, 0.03, [T[0] + u[0] * 0.01, T[1] + u[1] * 0.01, T[2] + u[2] * 0.01], undefined, 5, 4);
  }

  // ---------------------------------------------------------------- herb strings on the left landing rail
  {
    const X = 0.7;
    // A: red mushroom caps
    const zA = 1.62;
    rod(LIGHT, [X, 2.745, zA], [X, 2.4, zA], 0.007, 0.007, 4);
    [2.68, 2.57, 2.46].forEach((y, k) => {
      ball(RED, 0.058, [X, y, zA], [1, 0.55, 1], 6, 4);
      ball(WHITE, 0.013, [X + 0.03, y + 0.02, zA + 0.02], undefined, 4, 3);
      ball(WHITE, 0.012, [X - 0.025, y + 0.025, zA - 0.025], undefined, 4, 3);
      cyl(WHITE, 0.018, 0.014, 0.04, 5, [X, y - 0.035, zA]);
      if (k < 2) ball(WHITE, 0.016, [X, y - 0.055, zA], undefined, 4, 3);
    });
    // B: herb bundles hung upside down
    for (const [z, c, s] of [[1.73, GREEN, 1] as [number, string, number], [1.8, MOSS, 0.8] as [number, string, number]]) {
      rod(LIGHT, [X, 2.745, z], [X, 2.68, z], 0.007, 0.007, 4);
      cyl(c, 0.0, 0.075 * s, 0.22 * s, 6, [X, 2.56 - (s < 1 ? 0.02 : 0), z]);
      cyl(RED, 0.03, 0.03, 0.02, 6, [X, 2.64 - (s < 1 ? 0.03 : 0), z]);
      for (let k = 0; k < 4; k++) {
        const a = k * 90 * D + 0.4;
        ball(YEL, 0.014, [X + Math.cos(a) * 0.06 * s, 2.45 - (s < 1 ? 0.03 : 0), z + Math.sin(a) * 0.06 * s], undefined, 4, 3);
      }
    }
    // C: garlic and chilies
    const zC = 1.92;
    rod(LIGHT, [X, 2.745, zC], [X, 2.42, zC], 0.007, 0.007, 4);
    [2.67, 2.42].forEach((y) => {
      ball(WHITE, 0.05, [X, y, zC], [1, 0.85, 1], 6, 4);
      cyl(WHITE, 0.0, 0.018, 0.05, 5, [X, y + 0.05, zC]);
      cyl(GREEN, 0.0, 0.012, 0.04, 4, [X, y + 0.09, zC]);
    });
    for (const sx of [1, -1]) {
      cyl(RED, 0.022, 0.0, 0.12, 5, [X + sx * 0.03, 2.5, zC], [0, 0, sx * 8]);
      cyl(GREEN, 0.01, 0.01, 0.02, 4, [X + sx * 0.03, 2.565, zC]);
    }
  }

  // ---------------------------------------------------------------- moss at the stair foot
  for (const [x, z, r] of [[0.9, 3.12, 0.09], [-0.9, 3.1, 0.08], [0.88, 2.85, 0.06]] as [number, number, number][])
    ball(MOSS, r, [x, 0.215, z], [1, 0.45, 1], 6, 4);
  ball(MOSS, 0.07, [0.7, yT(7) + 0.0, 3.03], [1, 0.4, 1], 5, 3);

  // ---------------------------------------------------------------- flush bins into parts
  for (const [color, geos] of bins) {
    const merged = mergeGeometries(geos, false);
    if (!merged) continue;
    b.part(merged, color, { bone, at: [0, 0, 0], flat: true, name: `porchStairs.${color.replace("#", "")}` });
    for (const g of geos) g.dispose();
  }

  // glowing lantern pane
  glow(
    b.part(new THREE.BoxGeometry(0.12, 0.2, 0.12), P.glowWarm, { bone, at: [LX, 2.695, LZ], name: "porchStairs.lanternPane" }),
    1.6,
  );
}
```

<!-- call: clearingDiorama -->

```ts
import * as THREE from "three";
import { aim, rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildClearingDiorama({ b, J, P, M }: Ctx) {
  type V = [number, number, number];
  const R = rng(2025);
  const GY = M.groundTop[1];
  const UP = new THREE.Vector3(0, 1, 0);
  const PI = Math.PI;

  // ---------------------------------------------------------------- geometry collector (one part per colour)
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const V3 = (p: V | THREE.Vector3) => (Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : p.clone());

  function put(
    geo: THREE.BufferGeometry,
    color: string,
    pos: V | THREE.Vector3,
    o: { q?: THREE.Quaternion; rx?: number; ry?: number; rz?: number; s?: V | number } = {},
  ) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    const q = o.q ?? new THREE.Quaternion().setFromEuler(new THREE.Euler(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0, "YXZ"));
    const sc = typeof o.s === "number" ? new THREE.Vector3(o.s, o.s, o.s) : V3((o.s ?? [1, 1, 1]) as V);
    g.applyMatrix4(new THREE.Matrix4().compose(V3(pos), q, sc));
    g.computeVertexNormals();
    if (!buckets.has(color)) buckets.set(color, []);
    buckets.get(color)!.push(g);
  }

  const box = () => new THREE.BoxGeometry(1, 1, 1);
  const octa = () => new THREE.OctahedronGeometry(1, 0);

  function rod(color: string, a: V | THREE.Vector3, bb: V | THREE.Vector3, r0: number, r1: number, seg = 6, open = false) {
    const A = V3(a);
    const B = V3(bb);
    const d = B.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1, open);
    put(g, color, A.clone().add(B).multiplyScalar(0.5), { q: aim(d.normalize()) });
  }

  // six-petal rosette: the folk-art motif used on border, gate posts and flowers
  function rosette(
    c: V | THREE.Vector3,
    n: V,
    Rr: number,
    petal: string | string[],
    centre: string,
    o: { solid?: boolean; up?: V; t?: number } = {},
  ) {
    const cv = V3(c);
    const nn = V3(n).normalize();
    let up = V3(o.up ?? [0, 1, 0]);
    if (Math.abs(nn.dot(up)) > 0.95) up = new THREE.Vector3(0, 0, 1);
    const q = aim(nn, up, "z");
    const pr = Rr * 0.4;
    const off = Rr * 0.62;
    const t = o.t ?? 0.03;
    const pg = o.solid
      ? new THREE.CylinderGeometry(pr, pr, t, 5).rotateX(PI / 2)
      : new THREE.CircleGeometry(pr, 5);
    const cg = o.solid
      ? new THREE.CylinderGeometry(Rr * 0.3, Rr * 0.3, t * 1.6, 5).rotateX(PI / 2)
      : new THREE.CircleGeometry(Rr * 0.3, 6);
    for (let i = 0; i < 6; i++) {
      const ang = (i * PI) / 3;
      const p = new THREE.Vector3(Math.cos(ang) * off, Math.sin(ang) * off, 0).applyQuaternion(q).add(cv);
      if (o.solid) p.addScaledVector(nn, (i % 2) * t * 0.35);
      put(pg, Array.isArray(petal) ? petal[i % petal.length] : petal, p, { q });
    }
    put(cg, centre, cv.clone().addScaledVector(nn, o.solid ? t * 0.45 : 0.002), { q });
  }

  // ---------------------------------------------------------------- exclusion zones for dressing
  const keep: { x: number; z: number; r: number }[] = [];
  const reserve = (x: number, z: number, r: number) => keep.push({ x, z, r });
  const free = (x: number, z: number, m = 0) => {
    if (Math.hypot(x, z) > 2.95 - m) return false;
    if (Math.abs(x) < 1.65 + m && Math.abs(z) < 1.55 + m) return false;
    if (Math.abs(x) < 1.05 + m && z > 1.0) return false;
    return keep.every((k) => Math.hypot(x - k.x, z - k.z) > k.r + m);
  };

  // ---------------------------------------------------------------- base disc, grass cap, border band
  put(new THREE.CylinderGeometry(3.5, 3.5, 0.185, 36), P.earth, [0, 0.0925, 0]);
  put(new THREE.CylinderGeometry(3.22, 3.26, 0.08, 30), P.grass, [0, GY - 0.04, 0]);

  // darker grass patches
  for (let i = 0, n = 0; n < 7 && i < 200; i++) {
    const a = R() * PI * 2;
    const r = Math.sqrt(R()) * 2.9;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (!free(x, z, 0.3)) continue;
    put(new THREE.CircleGeometry(0.3 + R() * 0.22, 7), P.grassDark, [x, GY + 0.004, z], { rx: -PI / 2, ry: R() * 3 });
    n++;
  }

  const NW = 30;
  for (let i = 0; i < NW; i++) {
    const a = ((i + 0.5) * PI * 2) / NW;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const rr = 3.37;
    put(box(), i % 2 ? P.folkWhite : P.folkRed, [sx * rr, GY - 0.01, cz * rr], { ry: a, s: [0.64, 0.02, 0.24] });
    if (i % 2 === 0) {
      rosette([sx * rr, GY + 0.006, cz * rr], [0, 1, 0], 0.095, P.folkWhite, P.folkYellow, { up: [sx, 0, cz] });
    } else {
      put(new THREE.CircleGeometry(0.06, 6), P.folkBlue, [sx * rr, GY + 0.004, cz * rr], { rx: -PI / 2 });
      put(new THREE.CircleGeometry(0.025, 5), P.folkRed, [sx * rr, GY + 0.006, cz * rr], { rx: -PI / 2 });
    }
  }

  // ---------------------------------------------------------------- dirt path from the gate to the stairs
  for (let z = 2.2; z <= 3.2; z += 0.16) {
    put(box(), P.earth, [(R() - 0.5) * 0.08, GY - 0.01, z], {
      ry: (R() - 0.5) * 0.2,
      s: [0.85 + R() * 0.2, 0.03, 0.2],
    });
  }
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1;
    put(octa(), P.stoneDark, [side * (0.55 + R() * 0.12), GY + 0.01, 2.3 + Math.floor(i / 2) * 0.28], {
      ry: R() * 3,
      s: [0.07, 0.035, 0.05],
    });
  }

  // ---------------------------------------------------------------- skulls
  function skull(c: V, s: number, yaw: number, big = false) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
    const cv = V3(c);
    const L = (x: number, y: number, z: number) =>
      new THREE.Vector3(x * s, y * s, z * s).applyQuaternion(q).add(cv);
    put(new THREE.SphereGeometry(1, 6, big ? 4 : 3), P.folkWhite, cv, { q, s: [0.1 * s, 0.092 * s, 0.105 * s] });
    put(box(), P.folkWhite, L(0, -0.085, 0.035), { q, s: [0.075 * s, 0.05 * s, 0.1 * s] });
    for (const sx of [1, -1]) {
      put(octa(), P.glowGreen, L(sx * 0.04, 0.012, 0.09), { q, s: [0.024 * s, 0.03 * s, 0.02 * s] });
      if (big) put(octa(), P.folkBlack, L(sx * 0.04, 0.012, 0.083), { q, s: [0.032 * s, 0.04 * s, 0.02 * s] });
    }
    put(new THREE.TetrahedronGeometry(1, 0), P.folkBlack, L(0, -0.035, 0.099), { q, s: 0.016 * s });
    if (big) put(box(), P.folkBlack, L(0, -0.088, 0.089), { q, s: [0.074 * s, 0.01 * s, 0.008 * s] });
  }

  // ---------------------------------------------------------------- skull fence
  const NS = 44;
  let kept = 0;
  for (let i = 1; i < NS; i++) {
    const adeg = (i * 360) / NS;
    const wrapped = adeg > 180 ? adeg - 360 : adeg;
    if (Math.abs(wrapped) < 26) continue;
    const a = (adeg * PI) / 180;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const rr = 3.15 + (R() - 0.5) * 0.06;
    const x = sx * rr;
    const z = cz * rr;
    const h = 1.0 + R() * 0.3;
    put(new THREE.CylinderGeometry(0.032, 0.055, h + 0.03, 5, 1, true), P.logDark, [x, GY - 0.03 + (h + 0.03) / 2, z], {
      ry: R() * 3,
    });
    skull([x, GY + h + 0.065, z], 1, a + (R() - 0.5) * 0.3);
    kept++;
    if (kept % 3 === 0) {
      put(new THREE.CylinderGeometry(0.05, 0.05, 0.09, 6), P.folkRed, [x, GY + 0.45, z]);
      put(octa(), P.folkYellow, [x + sx * 0.05, GY + 0.45, z + cz * 0.05], { ry: a, s: 0.02 });
    }
    kept === kept; // keep counter explicit
    // grass tuft at the stake foot (deferred list)
    stakeFeet.push([sx * 3.0, cz * 3.0]);
  }

  // ---------------------------------------------------------------- gate posts with big skulls
  for (const sx of [1, -1]) {
    const gp: V = sx > 0 ? M.gatePostL : M.gatePostR;
    const px = gp[0];
    const pz = gp[2];
    put(box(), P.logDark, [px, 0.87, pz], { s: [0.24, 1.4, 0.24] });
    put(box(), P.logMid, [px, GY + 0.04, pz], { s: [0.31, 0.14, 0.31] });
    put(box(), P.logMid, [px, 1.6, pz], { s: [0.32, 0.07, 0.32] });
    put(box(), P.folkRed, [px, 1.25, pz], { s: [0.255, 0.1, 0.255] });
    put(box(), P.folkYellow, [px, 1.33, pz], { s: [0.262, 0.02, 0.262] });
    put(box(), P.folkYellow, [px, 1.17, pz], { s: [0.262, 0.02, 0.262] });
    rosette([px, 0.78, pz + 0.125], [0, 0, 1], 0.075, P.folkYellow, P.folkRed);
    rosette([px - sx * 0.125, 0.78, pz], [-sx, 0, 0], 0.075, P.folkYellow, P.folkRed);
    rosette([px + sx * 0.125, 0.78, pz], [sx, 0, 0], 0.075, P.folkWhite, P.folkBlue);
    // small zigzag diamonds along the foot block
    for (let k = 0; k < 3; k++) {
      put(octa(), P.folkWhite, [px + (k - 1) * 0.08, GY + 0.04, pz + 0.16], { s: [0.03, 0.04, 0.01] });
    }
    skull([px, 1.79, pz], 1.7, sx * 0.3, true);
  }

  // ---------------------------------------------------------------- mortar and pestle
  {
    const mx = -1.7;
    const mz = 2.5;
    reserve(mx, mz, 0.55);
    put(new THREE.CylinderGeometry(0.25, 0.17, 0.4, 8), P.logDark, [mx, GY + 0.2, mz]);
    put(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 8), P.logMid, [mx, GY + 0.425, mz]);
    put(new THREE.CylinderGeometry(0.215, 0.205, 0.09, 8), P.folkRed, [mx, GY + 0.18, mz]);
    for (let k = 0; k < 8; k++) {
      const a = ((22.5 + 45 * k) * PI) / 180;
      const n = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      put(new THREE.CircleGeometry(0.026, 5), P.folkYellow, [mx + n.x * 0.2, GY + 0.18, mz + n.z * 0.2], {
        q: aim(n, UP, "z"),
      });
    }
    put(new THREE.CircleGeometry(0.22, 8), P.folkBlack, [mx, GY + 0.452, mz], { rx: -PI / 2 });
    const a: V = [mx - 0.03, 0.5, mz + 0.02];
    const t: V = [mx + 0.3, 1.25, mz - 0.22];
    rod(P.logLight, a, t, 0.045, 0.06, 6);
    put(new THREE.SphereGeometry(0.085, 5, 3), P.logMid, t);
    const ringAt = V3(a).lerp(V3(t), 0.82);
    put(new THREE.CylinderGeometry(0.066, 0.066, 0.035, 6), P.folkRed, ringAt, {
      q: aim(V3(t).sub(V3(a)).normalize()),
    });
  }

  // ---------------------------------------------------------------- rocks with moss
  function rock(x: number, z: number, r: number, col: string, moss: boolean, ico = false) {
    reserve(x, z, r * 1.1);
    const sy = 0.65;
    const yaw = R() * 6.28;
    const cy = GY + r * sy * 0.7;
    put(ico ? new THREE.IcosahedronGeometry(1, 0) : new THREE.DodecahedronGeometry(1, 0), col, [x, cy, z], {
      ry: yaw,
      s: [r * 1.1, r * sy, r * 0.95],
    });
    if (moss)
      put(new THREE.DodecahedronGeometry(1, 0), P.moss, [x + r * 0.05, cy + r * sy * 0.74, z], {
        ry: yaw + 0.4,
        s: [r * 0.65, r * 0.2, r * 0.55],
      });
  }
  rock(-2.7, 1.0, 0.28, P.stone, true);
  rock(-2.45, 1.35, 0.14, P.stoneDark, false, true);
  rock(2.8, -0.75, 0.24, P.stoneDark, true);
  rock(1.5, -2.55, 0.22, P.stone, true);
  rock(1.85, -2.45, 0.12, P.stoneDark, false, true);
  rock(-1.35, -2.5, 0.2, P.stoneDark, true);
  rock(2.0, 2.45, 0.13, P.stone, false, true);

  // ---------------------------------------------------------------- fly-agaric mushrooms
  function mushroom(x: number, z: number, r: number, y0 = GY) {
    const h = r * 1.5;
    put(new THREE.CylinderGeometry(r * 0.28, r * 0.4, h, 6, 1, true), P.folkWhite, [x, y0 + h / 2 - 0.01, z]);
    const cy = y0 + h - 0.02;
    const ry = 0.72;
    put(new THREE.SphereGeometry(r, 6, 3, 0, PI * 2, 0, PI / 2), P.folkRed, [x, cy, z], { s: [1, ry, 1] });
    put(new THREE.CircleGeometry(r * 0.95, 6), P.folkWhite, [x, cy - 0.002, z], { rx: PI / 2 });
    const ns = r > 0.15 ? 5 : 3;
    for (let i = 0; i < ns; i++) {
      const th = i * 2.4 + R();
      const ph = 0.35 + R() * 0.7;
      const lx = Math.sin(ph) * Math.cos(th);
      const ly = Math.cos(ph);
      const lz = Math.sin(ph) * Math.sin(th);
      const n = new THREE.Vector3(lx, ly / ry, lz).normalize();
      const p = new THREE.Vector3(x + r * lx, cy + r * ry * ly, z + r * lz).addScaledVector(n, r * 0.045);
      put(new THREE.CircleGeometry(r * 0.17, 5), P.folkWhite, p, { q: aim(n, UP, "z") });
    }
  }
  const cluster = (x: number, z: number, big: number) => {
    reserve(x, z, 0.4);
    mushroom(x, z, big);
    mushroom(x + 0.22, z - 0.1, big * 0.7);
    mushroom(x - 0.12, z + 0.2, big * 0.5);
  };
  cluster(2.5, 0.85, 0.2);
  cluster(-2.6, 0.45, 0.17);
  cluster(0.7, -2.8, 0.18);
  cluster(1.75, 2.3, 0.15);

  // ---------------------------------------------------------------- folk flowers
  const out2 = (x: number, z: number): [number, number] => {
    const l = Math.hypot(x, z) || 1;
    return [x / l, z / l];
  };
  function flower(x: number, z: number, h: number, Rr: number, petals: string[], cen: string) {
    reserve(x, z, 0.25);
    const [ox, oz] = out2(x, z);
    const head = new THREE.Vector3(x + ox * 0.1, GY + h, z + oz * 0.1);
    rod(P.folkGreen, [x, GY - 0.01, z], head, 0.028, 0.02, 5, true);
    for (const sd of [1, -1]) {
      const d = new THREE.Vector3(ox * 0.6 + -oz * sd * 0.8, 0.5, oz * 0.6 + ox * sd * 0.8).normalize();
      const c = new THREE.Vector3(x, GY + h * 0.32, z).addScaledVector(d, 0.14);
      put(octa(), P.folkGreen, c, { q: aim(d), s: [0.05, 0.17, 0.012] });
    }
    const n = new THREE.Vector3(ox * 0.5, 0.45, oz * 0.5 + 0.75).normalize();
    put(new THREE.CylinderGeometry(Rr * 0.62, Rr * 0.62, 0.03, 5), P.folkGreen, head.clone().addScaledVector(n, -0.035), {
      q: aim(n),
    });
    rosette(head, [n.x, n.y, n.z], Rr, petals, cen, { solid: true, t: 0.035 });
  }
  flower(2.2, 1.7, 0.7, 0.2, [P.folkRed, P.folkYellow], P.folkBlue);
  flower(2.65, 0.0, 0.62, 0.19, [P.folkYellow, P.folkBlue], P.folkRed);
  flower(2.93, -0.12, 0.42, 0.13, [P.folkRed, P.folkWhite], P.folkYellow);
  flower(-2.45, 1.65, 0.68, 0.2, [P.folkBlue, P.folkWhite], P.folkYellow);
  flower(-2.15, 1.85, 0.42, 0.13, [P.folkYellow, P.folkRed], P.folkBlue);
  flower(-2.8, -0.6, 0.64, 0.19, [P.folkRed, P.folkYellow], P.folkBlue);
  flower(2.45, -1.3, 0.7, 0.2, [P.folkYellow, P.folkRed], P.folkBlue);
  flower(-2.35, -1.4, 0.6, 0.18, [P.folkBlue, P.folkYellow], P.folkRed);

  // ---------------------------------------------------------------- fallen log
  {
    const A: V = [-0.7, 0.39, -2.5];
    const B: V = [0.95, 0.39, -2.25];
    reserve(0.1, -2.38, 0.95);
    rod(P.logDark, A, B, 0.2, 0.2, 8);
    const d = V3(B).sub(V3(A)).normalize();
    const q = aim(d);
    const end = (p: V, sgn: number) => {
      const pv = V3(p).addScaledVector(d, sgn * 0.004);
      put(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 8), P.logEnd, pv, { q });
      put(new THREE.CylinderGeometry(0.13, 0.13, 0.034, 6), P.logDark, pv, { q });
      put(new THREE.CylinderGeometry(0.09, 0.09, 0.038, 6), P.logEnd, pv, { q });
      put(new THREE.CylinderGeometry(0.03, 0.03, 0.042, 5), P.logDark, pv, { q });
    };
    end(B, 1);
    put(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 8), P.logEnd, V3(A).addScaledVector(d, -0.004), { q });
    put(new THREE.DodecahedronGeometry(1, 0), P.moss, [-0.35, 0.58, -2.45], { ry: 0.3, s: [0.3, 0.05, 0.16] });
    put(new THREE.DodecahedronGeometry(1, 0), P.moss, [0.45, 0.58, -2.34], { ry: -0.2, s: [0.22, 0.045, 0.14] });
    rod(P.logDark, [0.25, 0.5, -2.36], [0.4, 0.82, -2.3], 0.05, 0.028, 5);
    mushroom(-0.05, -2.43, 0.07, 0.57);
    mushroom(0.1, -2.4, 0.05, 0.57);
    mushroom(0.62, -2.31, 0.06, 0.57);
  }

  // ---------------------------------------------------------------- birch trees
  function birch(sx: number) {
    const base = new THREE.Vector3(sx * 2.1, GY - 0.02, -2.0);
    const top = new THREE.Vector3(sx * 2.28, 4.3, -2.1);
    reserve(base.x, base.z, 0.4);
    const at = (t: number) => base.clone().lerp(top, t);
    const rad = (t: number) => 0.15 - 0.075 * t;
    rod(P.folkWhite, base, top, 0.15, 0.07, 7);
    rod(P.logDark, base, at(0.07), 0.162, 0.154, 7);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + (sx > 0 ? 0.4 : 1.2);
      rod(
        P.logDark,
        [base.x + Math.sin(a) * 0.06, GY + 0.2, base.z + Math.cos(a) * 0.06],
        [base.x + Math.sin(a) * 0.3, GY, base.z + Math.cos(a) * 0.3],
        0.06,
        0.02,
        5,
      );
    }
    for (let k = 0; k < 14; k++) {
      const t = 0.1 + (k / 14) * 0.86 + R() * 0.03;
      const th = R() * 6.28;
      const w = 0.08 + R() * 0.07;
      const p = at(t).add(new THREE.Vector3(Math.sin(th), 0, Math.cos(th)).multiplyScalar(rad(t) * 0.9 + 0.005));
      put(box(), P.folkBlack, p, { ry: th, s: [w, 0.022, 0.016] });
    }
    const ts = [0.5, 0.64, 0.77, 0.88];
    ts.forEach((t, k) => {
      const phi = k * 2.2 + (sx > 0 ? 0.5 : 2.5);
      const dir = new THREE.Vector3(sx * 0.5 + Math.sin(phi) * 0.5, 0.5, Math.cos(phi) * 0.8).normalize();
      const len = 0.55 + R() * 0.3;
      const s0 = at(t);
      const tip = s0.clone().addScaledVector(dir, len);
      rod(P.folkWhite, s0, tip, 0.045, 0.018, 5);
      put(box(), P.folkBlack, s0.clone().lerp(tip, 0.45), { q: aim(dir), s: [0.075, 0.02, 0.075] });
      for (let l = 0; l < 4; l++) {
        const p = tip
          .clone()
          .lerp(s0, l * 0.12)
          .add(new THREE.Vector3((R() - 0.5) * 0.25, (R() - 0.3) * 0.2, (R() - 0.5) * 0.25));
        put(octa(), (l + k) % 2 ? P.folkGreen : P.moss, p, {
          rx: (R() - 0.5) * 1.2,
          ry: R() * 3,
          rz: (R() - 0.5) * 1.2,
          s: [0.1, 0.02, 0.15],
        });
      }
    });
    for (let l = 0; l < 7; l++) {
      const p = top.clone().add(new THREE.Vector3((R() - 0.5) * 0.6, R() * 0.2 - 0.1, (R() - 0.5) * 0.6));
      put(octa(), l % 2 ? P.folkGreen : P.moss, p, {
        rx: (R() - 0.5) * 1.2,
        ry: R() * 3,
        rz: (R() - 0.5) * 1.2,
        s: [0.11, 0.02, 0.16],
      });
    }
  }
  birch(1);
  birch(-1);

  // ---------------------------------------------------------------- ferns
  function fern(x: number, z: number, k: number) {
    reserve(x, z, 0.3);
    for (let i = 0; i < 9; i++) {
      const a = i * 0.72 + R() * 0.3;
      const tilt = 0.65 + R() * 0.5;
      const d = new THREE.Vector3(Math.sin(a) * Math.sin(tilt), Math.cos(tilt), Math.cos(a) * Math.sin(tilt));
      const len = (0.22 + R() * 0.12) * k;
      const c = new THREE.Vector3(x, GY - 0.01, z).addScaledVector(d, len * 0.95);
      put(octa(), i % 2 ? P.folkGreen : P.grassDark, c, { q: aim(d), s: [0.055 * k, len, 0.012] });
    }
  }
  fern(1.75, -2.05, 1.1);
  fern(-1.75, -2.1, 1.0);
  fern(0.25, -2.75, 0.9);
  fern(-0.9, -2.8, 0.8);

  // ---------------------------------------------------------------- grass tufts (last, avoids all props)
  function tuft(x: number, z: number, k: number) {
    const col = R() < 0.6 ? P.grassDark : P.folkGreen;
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6 + R();
      const tilt = 0.25 + R() * 0.35;
      const d = new THREE.Vector3(Math.sin(a) * Math.sin(tilt), Math.cos(tilt), Math.cos(a) * Math.sin(tilt));
      const h = (0.22 + R() * 0.2) * k;
      const baseP = new THREE.Vector3(x + Math.sin(a) * 0.03, GY - 0.015, z + Math.cos(a) * 0.03);
      const q = aim(d).multiply(new THREE.Quaternion().setFromAxisAngle(UP, R() * PI));
      put(new THREE.ConeGeometry(0.05, 1, 4, 1, true), col, baseP.addScaledVector(d, h / 2), {
        q,
        s: [k, h, 0.4 * k],
      });
    }
  }
  for (let i = 0, n = 0; n < 40 && i < 900; i++) {
    const a = R() * PI * 2;
    const r = Math.sqrt(R()) * 3.0;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (!free(x, z, 0.05)) continue;
    tuft(x, z, 0.8 + R() * 0.6);
    n++;
  }
  stakeFeet.forEach(([x, z], i) => {
    if (i % 2 === 0) tuft(x, z, 0.7);
  });

  // ---------------------------------------------------------------- flush: one merged part per colour
  for (const [color, list] of buckets) {
    const merged = mergeGeometries(list, false);
    if (!merged) continue;
    const part = b.part(merged, color, { bone: J.ground, at: [0, 0, 0], name: `clearing_${color.slice(1)}` });
    if (color === P.glowGreen) glow(part, 1.6);
  }
}

// stake-foot positions collected while building the fence, used for grass tufts
const stakeFeet: [number, number][] = [];
```

<!-- call: roof -->

```ts
import * as THREE from "three";
import { aim, rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRoof({ b, J, P, M }: Ctx) {
  const bone = J.hut;
  const R = rng(31);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- roof frame
  const RY = M.ridgeFront[1]; // ridge height 4.9
  const A = Math.atan2(1.5, 1.85);
  const CA = Math.cos(A);
  const SA = Math.sin(A);
  const TA = Math.tan(A);
  const SLAB = 0.1;
  // underside height of the roof slab at |x|
  const under = (x: number) => RY - SLAB / CA - Math.abs(x) * TA;

  const down = (s: number) => V(s * CA, -SA, 0);
  const nrm = (s: number) => V(s * SA, CA, 0);
  // s = +1 left slope (+X), s = -1 right slope. u = distance down the slope from the ridge.
  const onSlope = (s: number, u: number, z: number, off = 0) =>
    V(s * (CA * u + SA * off), RY - SA * u + CA * off, z);
  const slopeQ = (s: number) =>
    new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(down(s), nrm(s), V(0, 0, s)));
  const plateQ = (s: number) =>
    new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(V(0, 0, -s), V(-s * CA, SA, 0), V(s * SA, CA, 0)),
    );
  const faceQ = (n: THREE.Vector3) => aim(n, [0, 1, 0], "z");

  // ---------------------------------------------------------------- merge buckets (one part per colour)
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const ID = new THREE.Quaternion();
  const put = (
    color: string,
    geo: THREE.BufferGeometry,
    pos: THREE.Vector3,
    q: THREE.Quaternion = ID,
    sc: THREE.Vector3 | number = 1,
  ) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    const s = typeof sc === "number" ? V(sc, sc, sc) : sc;
    g.applyMatrix4(new THREE.Matrix4().compose(pos, q, s));
    g.computeVertexNormals();
    if (!buckets.has(color)) buckets.set(color, []);
    buckets.get(color)!.push(g);
  };
  const ZERO = V(0, 0, 0);

  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const SPH = new THREE.SphereGeometry(1, 6, 4);
  const ICO = new THREE.IcosahedronGeometry(1, 0);
  const DISC8 = new THREE.CylinderGeometry(1, 1, 1, 8).rotateX(Math.PI / 2);
  const DIAM = new THREE.CylinderGeometry(1, 1, 1, 4).rotateX(Math.PI / 2);
  const CONE4 = new THREE.ConeGeometry(1, 1, 4);

  // ---------------------------------------------------------------- folk rosette (six petals + centre)
  const rosette = (
    pos: THREE.Vector3,
    n: THREE.Vector3,
    s: number,
    petal: string,
    center: string,
    count = 6,
  ) => {
    const q = faceQ(n);
    for (let k = 0; k < count; k++) {
      const th = (k / count) * Math.PI * 2 + 0.2;
      const off = V(Math.cos(th) * 0.6 * s, Math.sin(th) * 0.6 * s, 0).applyQuaternion(q).add(pos);
      const qq = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), th));
      put(petal, SPH, off, qq, V(0.42 * s, 0.25 * s, 0.08 * s));
    }
    put(center, DISC8, pos.clone().addScaledVector(n, 0.04 * s), q, V(0.3 * s, 0.3 * s, 0.1 * s));
  };

  // ================================================================ ROOF SLABS
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(2.45, SLAB, 3.6), P.logDark, {
      bone,
      at: onSlope(s, 1.195, 0.05, -SLAB / 2),
      quat: slopeQ(s),
      name: s > 0 ? "roofSlabL" : "roofSlabR",
    });
  }

  // ================================================================ SHINGLES (scalloped, alternating browns)
  const H_PLATE = 0.34;
  const plateCache = new Map<number, THREE.BufferGeometry>();
  const plateGeo = (w: number) => {
    let g = plateCache.get(w);
    if (g) return g;
    const hw = w / 2;
    const sh = new THREE.Shape();
    sh.moveTo(-hw, H_PLATE);
    sh.lineTo(-hw, 0.11);
    sh.lineTo(-0.6 * hw, 0.022);
    sh.lineTo(0, 0);
    sh.lineTo(0.6 * hw, 0.022);
    sh.lineTo(hw, 0.11);
    sh.lineTo(hw, H_PLATE);
    g = new THREE.ExtrudeGeometry(sh, { depth: 0.025, bevelEnabled: false, steps: 1 });
    plateCache.set(w, g);
    return g;
  };
  for (const s of [1, -1]) {
    const q = plateQ(s);
    for (let r = 0; r < 10; r++) {
      const u = 2.38 - r * 0.22;
      const off = 0.012 + 0.0065 * r;
      const cells: [number, number][] = [];
      if (r % 2 === 0) {
        for (let i = 0; i < 12; i++) cells.push([-1.75 + 0.15 + i * 0.3, 0.3]);
      } else {
        cells.push([-1.675, 0.15]);
        for (let i = 0; i < 11; i++) cells.push([-1.45 + i * 0.3, 0.3]);
        cells.push([1.775, 0.15]);
      }
      cells.forEach(([zc, w], i) => {
        const col = (r + i) % 2 === 0 ? P.shingleDark : P.shingleLight;
        put(col, plateGeo(w), onSlope(s, u + (R() - 0.5) * 0.012, zc, off), q, 1);
      });
    }
  }

  // ================================================================ eave: rafters, fascia, dots, moss
  for (const s of [1, -1]) {
    const q = slopeQ(s);
    for (let k = 0; k < 9; k++) {
      const z = -1.6 + k * 0.4;
      put(P.logMid, BOX, onSlope(s, 1.97, z, -SLAB - 0.035), q, V(0.9, 0.07, 0.09));
    }
    put(P.folkRed, BOX, onSlope(s, 2.43, 0.05, -0.02), q, V(0.05, 0.15, 3.6));
    for (let k = 0; k < 16; k++) {
      const z = -1.62 + k * 0.225;
      put(k % 2 ? P.folkWhite : P.folkYellow, SPH, onSlope(s, 2.46, z, -0.02), ID, 0.027);
    }
    // moss along the lower edge
    for (let k = 0; k < 9; k++) {
      const z = -1.65 + R() * 3.4;
      const u = 2.0 + R() * 0.34;
      put(
        P.moss,
        ICO,
        onSlope(s, u, z, 0.04),
        q,
        V(0.1 + R() * 0.1, 0.035, 0.09 + R() * 0.12),
      );
    }
  }

  // ================================================================ RIDGE
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 3.6, 8), P.logDark, {
    bone,
    at: [0, 4.97, 0.05],
    dir: [0, 0, 1],
    name: "roofRidgeLog",
  });
  for (const s of [1, -1]) {
    const q = slopeQ(s);
    put(P.logMid, BOX, onSlope(s, 0.12, 0.05, 0.085), q, V(0.36, 0.045, 3.64));
    for (let k = 0; k < 11; k++) {
      const z = -1.5 + k * 0.3;
      put(
        k % 2 ? P.folkWhite : P.folkRed,
        DIAM,
        onSlope(s, 0.14, z, 0.115),
        faceQ(nrm(s)),
        V(0.045, 0.06, 0.012),
      );
    }
  }
  for (let k = 0; k < 9; k++) {
    put(k % 2 ? P.folkRed : P.folkYellow, SPH, V(0, 5.065, -1.1 + k * 0.275), ID, 0.04);
  }
  // ridge log ends: carved discs with a dark ring
  for (const [z, sg] of [
    [1.85, 1],
    [-1.75, -1],
  ] as [number, number][]) {
    put(P.folkBlack, DISC8, V(0, 4.97, z + sg * 0.004), ID, V(0.092, 0.092, 0.02));
    put(P.logEnd, DISC8, V(0, 4.97, z + sg * 0.012), ID, V(0.075, 0.075, 0.02));
    put(P.folkBlack, DISC8, V(0, 4.97, z + sg * 0.02), ID, V(0.045, 0.045, 0.02));
    put(P.logEnd, DISC8, V(0, 4.97, z + sg * 0.026), ID, V(0.03, 0.03, 0.02));
  }

  // ================================================================ KONYOK (horse-head finials)
  const HEAD: [number, number][] = [
    [-0.28, -0.05],
    [-0.1, 0.2],
    [-0.06, 0.4],
    [0.04, 0.52],
    [0.08, 0.68],
    [0.16, 0.55],
    [0.36, 0.47],
    [0.54, 0.3],
    [0.6, 0.22],
    [0.55, 0.13],
    [0.4, 0.17],
    [0.3, 0.1],
    [0.2, 0.02],
    [0.22, -0.1],
    [0.05, -0.14],
  ];
  const konyok = (z0: number, dz: number) => {
    const K = 0.52;
    const Y0 = 5.0;
    const base = HEAD.map(([x, y]) => [x * K, y * K] as [number, number]);
    const trim = HEAD.map(
      ([x, y]) => [(0.2 + (x - 0.2) * 1.14) * K, (0.25 + (y - 0.25) * 1.14) * K] as [number, number],
    );
    b.extrude(trim, { at: [0, Y0, z0], x: [0, 0, dz], thickness: 0.06, color: P.folkYellow, bone, name: "roofKonyokTrim" });
    b.extrude(base, {
      at: [0, Y0, z0],
      x: [0, 0, dz],
      thickness: 0.09,
      bevel: 0.006,
      color: P.folkRed,
      bone,
      name: "roofKonyok",
    });
    const W = (lx: number, ly: number, sx = 0) => V(sx, Y0 + ly * K, z0 + dz * lx * K);
    // mane beads along the neck
    for (const [lx, ly] of [
      [-0.17, 0.08],
      [-0.1, 0.2],
      [-0.085, 0.3],
      [-0.06, 0.4],
      [0.0, 0.5],
    ])
      put(P.folkYellow, SPH, W(lx, ly), ID, 0.034);
    // bridle strap
    put(P.folkYellow, BOX, W(0.45, 0.262), ID, V(0.1, 0.115, 0.03));
    put(P.folkBlack, SPH, W(0.45, 0.2, 0.05), ID, 0.012);
    for (const s of [1, -1]) {
      const n = V(s, 0, 0);
      const q = faceQ(n);
      // eye: yellow ring, black eye, white glint
      put(P.folkYellow, DISC8, W(0.27, 0.385, s * 0.046), q, V(0.038, 0.038, 0.01));
      put(P.folkBlack, DISC8, W(0.27, 0.385, s * 0.051), q, V(0.024, 0.024, 0.01));
      put(P.folkWhite, DISC8, W(0.265, 0.39, s * 0.056), q, V(0.008, 0.008, 0.006));
      // nostril
      put(P.folkBlack, DISC8, W(0.565, 0.205, s * 0.046), q, V(0.014, 0.014, 0.01));
      // neck rosette
      rosette(W(0.04, 0.2, s * 0.046), n, 0.05, P.folkWhite, P.folkBlue);
      // ear inner
      put(P.folkYellow, CONE4, W(0.085, 0.58, s * 0.046), q, V(0.016, 0.05, 0.008));
    }
  };
  konyok(1.55, 1);
  konyok(-1.45, -1);

  // ================================================================ GABLES (planks, attic window, sunburst, rosettes)
  const gable = (zf: number, sg: number) => {
    const zc = zf - sg * 0.05;
    // dark backing
    const bs = new THREE.Shape([
      new THREE.Vector2(-1.45, 3.5),
      new THREE.Vector2(1.45, 3.5),
      new THREE.Vector2(1.45, under(1.45) + 0.03),
      new THREE.Vector2(0, under(0) + 0.03),
      new THREE.Vector2(-1.45, under(1.45) + 0.03),
    ]);
    const bg = new THREE.ExtrudeGeometry(bs, { depth: 0.06, bevelEnabled: false });
    bg.translate(0, 0, sg > 0 ? zc - 0.05 : zc - 0.01);
    put(P.logDark, bg, ZERO);
    // vertical planks
    for (let i = 0; i < 20; i++) {
      const x0 = -1.4 + i * 0.14;
      const x1 = x0 + 0.13;
      const sh = new THREE.Shape([
        new THREE.Vector2(x0, 3.5),
        new THREE.Vector2(x1, 3.5),
        new THREE.Vector2(x1, under(x1) + 0.03),
        new THREE.Vector2(x0, under(x0) + 0.03),
      ]);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false });
      g.translate(0, 0, zc - 0.05);
      put(i % 2 ? P.logMid : P.logLight, g, ZERO);
    }
    const n = V(0, 0, sg);
    const Z = (d: number) => zf + sg * d;
    const cy = 4.0;
    // sunburst rays
    for (let k = 0; k < 8; k++) {
      const th = (k / 8) * Math.PI * 2;
      const len = k % 2 === 0 ? 0.19 : 0.16;
      const rc = 0.27 + len / 2;
      const qq = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), th - Math.PI / 2);
      put(P.folkYellow, CONE4, V(Math.cos(th) * rc, cy + Math.sin(th) * rc, Z(0.014)), qq, V(0.055, len, 0.025));
      // short red rays between
      const th2 = th + Math.PI / 8;
      const qq2 = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), th2 - Math.PI / 2);
      put(P.folkRed, CONE4, V(Math.cos(th2) * 0.35, cy + Math.sin(th2) * 0.35, Z(0.01)), qq2, V(0.032, 0.1, 0.02));
    }
    // blue ring, black rim, glowing pane, muntins
    put(P.folkBlue, DISC8, V(0, cy, Z(0.015)), ID, V(0.3, 0.3, 0.03));
    for (let k = 0; k < 8; k++) {
      const th = (k / 8) * Math.PI * 2 + Math.PI / 8;
      put(k % 2 ? P.folkWhite : P.folkYellow, DISC8, V(Math.cos(th) * 0.268, cy + Math.sin(th) * 0.268, Z(0.032)), ID, V(0.017, 0.017, 0.01));
    }
    put(P.folkBlack, DISC8, V(0, cy, Z(0.035)), ID, V(0.232, 0.232, 0.02));
    glow(
      b.part(new THREE.CylinderGeometry(0.205, 0.205, 0.02, 14), P.glowWarm, {
        bone,
        at: [0, cy, Z(0.045)],
        dir: [0, 0, sg],
        name: "roofAtticPane",
      }),
      1,
    );
    put(P.folkBlack, BOX, V(0, cy, Z(0.058)), ID, V(0.42, 0.026, 0.014));
    put(P.folkBlack, BOX, V(0, cy, Z(0.058)), ID, V(0.026, 0.42, 0.014));
    // rosette row beneath
    const cols: [string, string][] = [
      [P.folkRed, P.folkYellow],
      [P.folkBlue, P.folkWhite],
      [P.folkYellow, P.folkRed],
    ];
    [-1.15, -0.85, -0.55, 0.55, 0.85, 1.15].forEach((x, i) => {
      const [pc, cc] = cols[i % 3];
      rosette(V(x, 3.6, Z(0.004)), n, 0.1, pc, cc);
    });
    // red sill line under the row
    put(P.folkRed, BOX, V(0, 3.515, Z(0.006)), ID, V(2.7, 0.03, 0.014));
  };
  gable(1.3, 1);
  gable(-1.3, -1);

  // ================================================================ BARGE-BOARDS (polotentse)
  const yt = (x: number) => under(x) + 0.02;
  const bargeBoard = (zc: number, sg: number) => {
    for (const s of [1, -1]) {
      const o: ([number, number] | [number, number, "sharp"])[] = [];
      o.push([0, yt(0)]);
      o.push([1.92, yt(1.92)]);
      o.push([1.92, yt(1.92) - 0.18]);
      o.push([1.84, yt(1.84) - 0.36, "sharp"]);
      o.push([1.76, yt(1.76) - 0.18]);
      for (let k = 0; k < 10; k++) {
        const x = 1.6 - k * 0.17;
        if (k % 2 === 0) o.push([x, yt(x) - 0.3, "sharp"]);
        else o.push([x, yt(x) - 0.17]);
      }
      o.push([0, yt(0) - 0.24]);
      b.extrude(o, {
        at: [0, 0, zc],
        x: [s, 0, 0],
        thickness: 0.05,
        bevel: 0.005,
        color: P.folkRed,
        bone,
        name: "roofBarge",
      });
      // yellow edge stripe along the top
      const ang = -s * A;
      const qz = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), ang);
      put(P.folkYellow, BOX, V(s * 0.96, yt(0.96) - 0.032, zc + sg * 0.003), qz, V(1.92 / CA, 0.028, 0.054));
      // white zigzag diamonds
      for (let k = 0; k < 10; k++) {
        const x = 0.16 + k * 0.17;
        put(P.folkWhite, DIAM, V(s * x, yt(x) - 0.12, zc + sg * 0.029), ID, V(0.042, 0.052, 0.012));
      }
      // pendant ball
      put(P.folkYellow, SPH, V(s * 1.84, yt(1.84) - 0.4, zc), ID, 0.038);
      put(P.folkWhite, DISC8, V(s * 1.84, yt(1.84) - 0.28, zc + sg * 0.029), ID, V(0.026, 0.026, 0.012));
    }
  };
  bargeBoard(1.81, 1);
  bargeBoard(-1.71, -1);

  // ================================================================ CHIMNEY (right rear slope, from chimneyBase)
  const cx = M.chimneyBase[0];
  const cz = M.chimneyBase[2];
  const cw = 0.46;
  const y0 = 3.98;
  const yTop = 5.0;
  b.part(new THREE.BoxGeometry(cw, yTop - y0, cw), P.stoneDark, {
    bone,
    at: [cx, (y0 + yTop) / 2, cz],
    name: "roofChimney",
  });
  // stone quoins on the corners
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      put(P.stone, BOX, V(cx + sx * 0.205, (y0 + yTop) / 2, cz + sz * 0.205), ID, V(0.07, yTop - y0, 0.07));
  // brick courses
  const bw = 0.1;
  for (let c = 0; c < 8; c++) {
    const y = 4.08 + c * 0.115;
    const odd = c % 2;
    for (let i = 0; i < 4; i++) {
      const u = -0.17 + i * 0.113 + (odd ? 0.056 : 0);
      if (Math.abs(u) > 0.15) continue;
      for (const sg of [1, -1]) {
        put(P.folkRed, BOX, V(cx + u, y, cz + sg * (cw / 2 + 0.003)), ID, V(bw, 0.052, 0.014));
        put(P.folkRed, BOX, V(cx + sg * (cw / 2 + 0.003), y, cz + u), ID, V(0.014, 0.052, bw));
      }
    }
  }
  // caps
  put(P.stone, BOX, V(cx, 5.03, cz), ID, V(0.6, 0.06, 0.6));
  for (const sg of [1, -1]) {
    put(P.stone, BOX, V(cx, 5.085, cz + sg * 0.265), ID, V(0.6, 0.05, 0.07));
    put(P.stone, BOX, V(cx + sg * 0.265, 5.085, cz), ID, V(0.07, 0.05, 0.46));
  }
  put(P.folkBlack, BOX, V(cx, 5.064, cz), ID, V(0.46, 0.02, 0.46));
  // moss at the base of the stack
  put(P.moss, ICO, V(cx - 0.18, 4.07, cz + 0.12), ID, V(0.14, 0.05, 0.12));
  put(P.moss, ICO, V(cx - 0.2, 4.04, cz - 0.14), ID, V(0.12, 0.045, 0.1));
  // smoke puffs
  const puffs: [number, number, number, number][] = [
    [0, 5.2, 0, 0.1],
    [0.04, 5.29, 0.03, 0.12],
    [0.11, 5.36, 0.02, 0.1],
    [-0.04, 5.38, -0.05, 0.08],
    [0.18, 5.42, -0.02, 0.06],
  ];
  puffs.forEach(([dx, y, dz, r], i) => {
    b.part(new THREE.IcosahedronGeometry(r, 1), P.smoke, {
      bone,
      at: [cx + dx, y, cz + dz],
      flat: true,
      name: `roofSmoke${i}`,
    });
  });

  // ================================================================ flush merged colours
  for (const [color, list] of buckets) {
    const merged = mergeGeometries(list);
    if (!merged) throw new Error(`roof: could not merge ${color}`);
    b.part(merged, color, { bone, at: [0, 0, 0], name: `roofTrim${color.slice(1)}` });
  }
}
```

<!-- call: hutWalls -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHutWalls({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const D = Math.PI / 180;
  const hut = J.hut;
  const hinge = J.doorHinge;
  type V3 = [number, number, number];
  type Joint = typeof hut;
  type Face = "F" | "B" | "L" | "R";

  // own colours (palette covers the rest)
  const BLUE_DEEP = "#163f73";
  const SUN = "#ffd75e";
  const CORE = "#4a2c18";

  const baseY = M.hutFloor[1]; // 2.0
  const topY = M.wallTop[1]; // 3.5
  const COURSES = 6;
  const CH = (topY - baseY) / COURSES; // 0.25
  const LR = CH / 2; // log radius

  // ---------------------------------------------------------------- bucket of merged small trim
  const buckets = new Map<string, { color: string; bone: Joint; geos: THREE.BufferGeometry[] }>();
  const _m = new THREE.Matrix4();
  const _p = new THREE.Vector3();
  const _s = new THREE.Vector3();
  const qE = (x = 0, y = 0, z = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * D, y * D, z * D));
  const stash = (
    color: string,
    geo: THREE.BufferGeometry,
    at: V3,
    q: THREE.Quaternion,
    scale: V3 = [1, 1, 1],
    bone: Joint = hut,
  ) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    _m.compose(_p.set(at[0], at[1], at[2]), q, _s.set(scale[0], scale[1], scale[2]));
    g.applyMatrix4(_m);
    const key = `${color}|${bone.name}`;
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { color, bone, geos: [] }));
    bk.geos.push(g);
  };
  const flush = () => {
    let i = 0;
    for (const bk of buckets.values()) {
      const g = mergeGeometries(bk.geos);
      if (!g) throw new Error("hutWalls: could not merge trim " + bk.color);
      b.part(g, bk.color, { bone: bk.bone, at: [0, 0, 0], flat: true, name: `hutWallsTrim${i++}` });
    }
  };

  // ---------------------------------------------------------------- unit geometries
  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const PETAL = new THREE.OctahedronGeometry(1, 0);
  const CONE4 = new THREE.ConeGeometry(1, 1, 4, 1);
  const ICO = new THREE.IcosahedronGeometry(1, 0);
  const RING = new THREE.RingGeometry(0.6, 0.75, 12);
  const circCache = new Map<number, THREE.BufferGeometry>();
  const circ = (n: number) => {
    let g = circCache.get(n);
    if (!g) circCache.set(n, (g = new THREE.CircleGeometry(1, n)));
    return g;
  };
  const cylCache = new Map<number, THREE.BufferGeometry>();
  const cyl = (n: number) => {
    let g = cylCache.get(n);
    if (!g) cylCache.set(n, (g = new THREE.CylinderGeometry(1, 1, 1, n, 1)));
    return g;
  };

  // ---------------------------------------------------------------- face frames
  // Face-local axes: +X = u (viewer's right), +Y up, +Z outward.
  const FACE: Record<Face, { n: [number, number]; u: [number, number]; ry: number; d: number }> = {
    F: { n: [0, 1], u: [1, 0], ry: 0, d: 1.2 },
    B: { n: [0, -1], u: [-1, 0], ry: 180, d: 1.2 },
    L: { n: [1, 0], u: [0, -1], ry: 90, d: 1.3 },
    R: { n: [-1, 0], u: [0, 1], ry: -90, d: 1.3 },
  };
  const fp = (f: Face, d: number, u: number, v: number): V3 => {
    const F = FACE[f];
    return [F.n[0] * d + F.u[0] * u, v, F.n[1] * d + F.u[1] * u];
  };
  const addW = (color: string, geo: THREE.BufferGeometry, at: V3, rot: V3 = [0, 0, 0], scale?: V3, bone?: Joint) =>
    stash(color, geo, at, qE(rot[0], rot[1], rot[2]), scale, bone);
  const addF = (
    color: string,
    geo: THREE.BufferGeometry,
    f: Face,
    off: number,
    u: number,
    v: number,
    rot: V3 = [0, 0, 0],
    scale?: V3,
    bone?: Joint,
  ) =>
    stash(
      color,
      geo,
      fp(f, FACE[f].d + off, u, v),
      qE(0, FACE[f].ry, 0).multiply(qE(rot[0], rot[1], rot[2])),
      scale,
      bone,
    );
  const fbox = (
    color: string,
    f: Face,
    off: number,
    u: number,
    v: number,
    w: number,
    h: number,
    t: number,
    rot: V3 = [0, 0, 0],
    bone?: Joint,
  ) => addF(color, BOX, f, off, u, v, rot, [w, h, t], bone);
  const fcirc = (color: string, f: Face, off: number, u: number, v: number, r: number, n = 8, bone?: Joint) =>
    addF(color, circ(n), f, off, u, v, [0, 0, 0], [r, r, 1], bone);
  const fdia = (color: string, f: Face, off: number, u: number, v: number, s: number, bone?: Joint) =>
    fbox(color, f, off, u, v, s, s, 0.012, [0, 0, 45], bone);

  // six-petal rosette: the one folk motif repeated everywhere
  const rosette = (f: Face, off: number, u: number, v: number, s: number, petal: string, center: string, bone?: Joint) => {
    for (let k = 0; k < 6; k++) {
      const a = k * 60;
      addF(
        petal,
        PETAL,
        f,
        off + 0.007 * s,
        u + Math.cos(a * D) * 0.052 * s,
        v + Math.sin(a * D) * 0.052 * s,
        [0, 0, a - 90],
        [0.03 * s, 0.056 * s, 0.007 * s],
        bone,
      );
    }
    fcirc(center, f, off + 0.016 * s, u, v, 0.028 * s, 8, bone);
  };

  // ================================================================ FLOOR PLATFORM
  for (let i = 0; i < 7; i++) {
    b.part(new THREE.BoxGeometry(0.395, 0.085, 2.5), i % 2 ? P.shingleDark : P.logDark, {
      bone: hut,
      at: [-1.2 + 0.4 * i, 1.9525, 0],
      flat: true,
      name: `hutWallsPlank${i}`,
    });
  }
  // underside crossbeams and longitudinal beams
  for (const s of [1, -1]) {
    addW(P.logDark, BOX, [0, 1.885, s * 1.0], [0, 0, 0], [2.7, 0.07, 0.14]);
    addW(P.logDark, BOX, [s * 1.15, 1.885, 0], [0, 0, 0], [0.14, 0.07, 2.5]);
  }
  addW(P.logMid, BOX, [0, 1.885, 0], [0, 0, 0], [0.16, 0.07, 2.5]);
  // root-like knobs at the beam ends
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const k = 0.07 + R() * 0.02;
      addW(P.logLight, ICO, [sx * 1.37, 1.93, sz * 1.0], [R() * 40, R() * 40, 0], [k, k * 0.85, k]);
      addW(P.logMid, ICO, [sx * 1.3, 1.9, sz * 1.0 + sz * 0.02], [0, 30, 0], [0.045, 0.04, 0.045]);
      addW(P.logLight, ICO, [sx * 1.15, 1.93, sz * 1.2], [R() * 40, 0, R() * 40], [k, k * 0.85, k]);
      addW(P.logMid, ICO, [sx * 1.15, 1.9, sz * 1.2 - sz * 0.07], [0, 20, 0], [0.04, 0.035, 0.04]);
    }
  // fascia boards round the platform
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(2.8, 0.14, 0.05), P.logMid, {
      bone: hut,
      at: [0, 1.925, s * 1.275],
      flat: true,
      name: `hutWallsFascia${s > 0 ? "F" : "B"}`,
    });
    b.part(new THREE.BoxGeometry(0.05, 0.14, 2.5), P.logDark, {
      bone: hut,
      at: [s * 1.375, 1.925, 0],
      flat: true,
      name: `hutWallsFasciaSide${s > 0 ? "L" : "R"}`,
    });
  }
  // folk dentils on the fascia
  for (const f of ["F", "B", "L", "R"] as Face[]) {
    const span = f === "F" || f === "B" ? 1.32 : 1.2;
    let i = 0;
    for (let u = -span; u <= span + 1e-6; u += 0.12, i++) {
      if (f === "F" && Math.abs(u) < 0.9) continue;
      const col = i % 2 ? P.folkRed : P.folkYellow;
      const FF = FACE[f];
      const dist = f === "F" || f === "B" ? 1.3 : 1.4;
      const pos = fp(f, dist + 0.004, u, 1.925);
      stash(col, BOX, pos, qE(0, FF.ry, 45), [0.05, 0.05, 0.012]);
    }
  }

  // ================================================================ LOG WALLS
  const LOGC = [P.logMid, P.logDark, P.logLight];
  b.part(new THREE.BoxGeometry(2.2, topY - baseY, 2.0), CORE, {
    bone: hut,
    at: [0, (baseY + topY) / 2, 0],
    flat: true,
    name: "hutWallsCore",
  });
  const logGeo = (len: number) => new THREE.CylinderGeometry(LR, LR, len, 12, 1);
  for (let k = 0; k < COURSES; k++) {
    const y = baseY + LR + CH * k;
    const col = LOGC[k % 3];
    const even = k % 2 === 0;
    for (const s of [1, -1]) {
      const jz = (R() - 0.5) * 0.012;
      b.part(logGeo(even ? 2.8 : 2.1), col, {
        bone: hut,
        at: [0, y, s * (1.2 - LR) + jz],
        rotation: [0, 0, 90],
        flat: true,
        name: `hutWallsLog${k}${s > 0 ? "F" : "B"}`,
      });
      b.part(logGeo(even ? 1.9 : 2.6), col, {
        bone: hut,
        at: [s * (1.3 - LR) + jz, y, 0],
        rotation: [90, 0, 0],
        flat: true,
        name: `hutWallsLog${k}${s > 0 ? "L" : "R"}`,
      });
    }
    // protruding corner ends: dark ring, logEnd disc, growth ring, pith
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        const pos: V3 = even ? [sx * 1.4, y, sz * (1.2 - LR)] : [sx * (1.3 - LR), y, sz * 1.3];
        const dirRot: V3 = even ? [0, sx * 90, 0] : [0, sz > 0 ? 0 : 180, 0];
        const nrm: V3 = even ? [sx, 0, 0] : [0, 0, sz];
        const at = (o: number): V3 => [pos[0] + nrm[0] * o, pos[1], pos[2] + nrm[2] * o];
        addW(P.logDark, circ(12), at(0.004), dirRot, [0.122, 0.122, 1]);
        addW(P.logEnd, circ(12), at(0.007), dirRot, [0.094, 0.094, 1]);
        addW(P.logDark, RING, at(0.010), dirRot, [0.1, 0.1, 1]);
        addW(P.logEnd, circ(10), at(0.013), dirRot, [0.045, 0.045, 1]);
        addW(P.logDark, circ(6), at(0.016), dirRot, [0.016, 0.016, 1]);
      }
  }

  // top plate
  b.part(new THREE.BoxGeometry(2.66, 0.045, 2.46), P.logDark, {
    bone: hut,
    at: [0, topY + 0.02, 0],
    flat: true,
    name: "hutWallsTopPlate",
  });

  // ---------------------------------------------------------------- wall surface dressing
  const blocked = (f: Face, u: number, v: number) => {
    if (f === "F") return Math.abs(u) < 0.62 || Math.abs(u) > 0.9 || v > 3.3 || (u < 0 && v < 2.25);
    return (Math.abs(u) < 0.78 && v > 2.2) || Math.abs(u) > 0.92 || v > 3.3 || v < 2.15;
  };
  // grain strokes
  const faces: Face[] = ["F", "B", "L", "R"];
  for (let tries = 0, made = 0; tries < 200 && made < 34; tries++) {
    const f = faces[Math.floor(R() * 4)];
    const k = Math.floor(R() * COURSES);
    const v = baseY + LR + CH * k;
    const u = (R() * 2 - 1) * 0.95;
    if (blocked(f, u, v)) continue;
    const len = 0.16 + R() * 0.2;
    fbox(k % 3 === 1 ? P.logMid : P.logDark, f, 0.004, u, v + (R() - 0.5) * 0.04, len, 0.012, 0.008);
    made++;
  }
  // knots (cut branch stubs)
  const knots: [Face, number, number][] = [
    ["F", 0.8, 1], ["F", -0.82, 3], ["F", 0.72, 3], ["B", 0.82, 1], ["B", -0.8, 3], ["B", 0.8, 4],
    ["L", 0.88, 2], ["L", -0.85, 4], ["R", 0.86, 4], ["R", -0.88, 1],
  ];
  for (const [f, u, k] of knots) {
    const v = baseY + LR + CH * k;
    fcirc(P.logDark, f, 0.006, u, v, 0.05, 8);
    fcirc(P.logEnd, f, 0.008, u, v, 0.034, 8);
    fcirc(P.logDark, f, 0.01, u, v, 0.012, 6);
  }
  // moss on the base logs
  const moss: [Face, number, number, number][] = [
    ["F", -0.75, 2.11, 0.22], ["F", -0.5, 2.08, 0.12], ["L", 0.5, 2.12, 0.2], ["L", -0.3, 2.08, 0.12],
    ["B", 0.6, 2.11, 0.2], ["B", -0.55, 2.08, 0.12], ["R", -0.5, 2.12, 0.22],
  ];
  for (const [f, u, v, w] of moss) {
    addF(P.moss, ICO, f, 0, u, v, [0, 0, (R() - 0.5) * 30], [w, 0.055, 0.07]);
    addF(P.grass, ICO, f, 0.015, u + w * 0.3, v + 0.025, [0, 0, 10], [w * 0.5, 0.03, 0.05]);
  }
  // corner pilaster stripes (red, white dotted) on front and back
  for (const f of ["F", "B"] as Face[])
    for (const s of [1, -1]) {
      fbox(P.folkRed, f, 0.01, s * 0.98, (baseY + topY) / 2, 0.045, topY - baseY, 0.025);
      for (let v = baseY + 0.1; v < topY - 0.05; v += 0.15) fcirc(P.folkWhite, f, 0.0235, s * 0.98, v, 0.012, 6);
    }
  // folk frieze of rosettes under the top plate
  const frieze: [Face, number[]][] = [
    ["F", [-0.95, -0.75, 0.75, 0.95]],
    ["B", [-0.95, -0.75, 0.75, 0.95]],
    ["L", [-0.8, 0.8]],
    ["R", [-0.8, 0.8]],
  ];
  for (const [f, us] of frieze)
    us.forEach((u, i) => {
      if (i % 2 === 0) rosette(f, 0.004, u, 3.42, 0.6, P.folkRed, P.folkYellow);
      else rosette(f, 0.004, u, 3.42, 0.6, P.folkWhite, P.folkBlue);
    });

  // ================================================================ WINDOWS
  const windowSet = (f: Face, v0: number) => {
    const d0 = FACE[f].d;
    const ry = FACE[f].ry;
    const pane = b.part(new THREE.BoxGeometry(0.5, 0.6, 0.04), P.glowWarm, {
      bone: hut,
      at: fp(f, d0, 0, v0),
      rotation: [0, ry, 0],
      flat: true,
      name: `hutWallsPane${f}`,
    });
    glow(pane, 1.1);
    const lamp = b.part(new THREE.BoxGeometry(0.3, 0.42, 0.02), P.folkYellow, {
      bone: hut,
      at: fp(f, d0 + 0.02, 0, v0),
      rotation: [0, ry, 0],
      flat: true,
      name: `hutWallsLamp${f}`,
    });
    glow(lamp, 1.4);
    // casement frame + cross muntins
    for (const s of [1, -1]) {
      fbox(P.folkBlack, f, 0.025, s * 0.27, v0, 0.04, 0.68, 0.04);
      fbox(P.folkBlack, f, 0.025, 0, v0 + s * 0.32, 0.58, 0.04, 0.04);
    }
    fbox(P.folkBlack, f, 0.03, 0, v0, 0.03, 0.6, 0.03);
    fbox(P.folkBlack, f, 0.03, 0, v0, 0.5, 0.03, 0.03);
    // carved platbands: red frame
    for (const s of [1, -1]) fbox(P.folkRed, f, 0.02, s * 0.35, v0, 0.12, 0.68, 0.04);
    fbox(P.folkRed, f, 0.02, 0, v0 + 0.39, 0.94, 0.1, 0.04);
    fbox(P.folkRed, f, 0.02, 0, v0 - 0.39, 0.94, 0.1, 0.04);
    // white zigzag cut-outs
    for (const s of [1, -1])
      for (let i = -2; i <= 2; i++) fdia(P.folkWhite, f, 0.047, s * 0.35, v0 + i * 0.125, 0.04);
    for (let i = -4; i <= 4; i++) fdia(P.folkWhite, f, 0.047, i * 0.1, v0 + 0.39, 0.045);
    for (let i = -2; i <= 2; i++) fdia(P.folkWhite, f, 0.047, i * 0.15, v0 - 0.39, 0.045);
    // hanging teeth under the apron
    for (let i = -4; i <= 4; i++)
      addF(P.folkRed, CONE4, f, 0.02, i * 0.1, v0 - 0.485, [0, 0, 180], [0.045, 0.09, 0.012]);
    // blue crown with a rosette
    addF(P.folkBlue, CONE4, f, 0.02, 0, v0 + 0.54, [0, 0, 0], [0.3, 0.2, 0.045]);
    rosette(f, 0.06, 0, v0 + 0.51, 0.6, P.folkWhite, P.folkRed);
    fcirc(P.folkYellow, f, 0.06, 0, v0 + 0.6, 0.016, 6);
    // open shutters flat against the wall
    for (const s of [1, -1]) {
      const u = s * 0.58;
      fbox(P.folkBlue, f, 0.02, u, v0, 0.28, 0.72, 0.03);
      fbox(BLUE_DEEP, f, 0.037, u - 0.07, v0, 0.012, 0.66, 0.006);
      fbox(BLUE_DEEP, f, 0.037, u + 0.07, v0, 0.012, 0.66, 0.006);
      rosette(f, 0.036, u, v0 + 0.1, 0.8, P.folkYellow, P.folkRed);
      fdia(P.folkYellow, f, 0.04, u, v0 - 0.2, 0.05);
      fdia(P.folkYellow, f, 0.04, u, v0 + 0.29, 0.05);
      fbox(P.folkBlack, f, 0.042, u, v0 + 0.25, 0.27, 0.03, 0.01);
      fbox(P.folkBlack, f, 0.042, u, v0 - 0.25, 0.27, 0.03, 0.01);
    }
  };
  windowSet("L", M.windowLeft[1]);
  windowSet("R", M.windowRight[1]);
  windowSet("B", M.windowBack[1]);

  // ================================================================ FRONT DOOR
  const [dcx, dcy, dcz] = M.doorCenter;
  b.part(new THREE.BoxGeometry(0.8, 1.1, 0.07), P.folkBlue, {
    bone: hinge,
    at: [dcx, dcy, dcz + 0.02],
    flat: true,
    name: "hutWallsDoor",
  });
  const H = hinge;
  // plank grooves
  for (const u of [-0.2, 0, 0.2]) fbox(BLUE_DEEP, "F", 0.078, u, 2.55, 0.014, 1.0, 0.006, [0, 0, 0], H);
  // red border + mid rail
  for (const s of [1, -1]) {
    fbox(P.folkRed, "F", 0.0825, s * 0.365, 2.55, 0.07, 1.1, 0.015, [0, 0, 0], H);
    fbox(P.folkRed, "F", 0.0825, 0, s > 0 ? 3.065 : 2.035, 0.8, 0.07, 0.015, [0, 0, 0], H);
  }
  fbox(P.folkRed, "F", 0.0825, 0, 2.46, 0.66, 0.035, 0.015, [0, 0, 0], H);
  for (let i = -5; i <= 5; i++) {
    fcirc(P.folkWhite, "F", 0.093, i * 0.066, 3.065, 0.012, 6, H);
    fcirc(P.folkWhite, "F", 0.093, i * 0.066, 2.035, 0.012, 6, H);
  }
  for (let v = 2.12; v < 3.0; v += 0.1)
    for (const s of [1, -1]) fcirc(P.folkWhite, "F", 0.093, s * 0.365, v, 0.012, 6, H);
  // sunburst
  const SV = 2.8;
  fcirc(P.folkWhite, "F", 0.079, 0, SV, 0.125, 12, H);
  fcirc(SUN, "F", 0.081, 0, SV, 0.1, 12, H);
  fcirc(P.folkRed, "F", 0.083, 0, SV, 0.05, 10, H);
  fcirc(P.folkYellow, "F", 0.085, 0, SV, 0.022, 8, H);
  for (let k = 0; k < 12; k++) {
    const a = k * 30;
    addF(
      P.folkYellow,
      PETAL,
      "F",
      0.084,
      Math.cos(a * D) * 0.175,
      SV + Math.sin(a * D) * 0.175,
      [0, 0, a - 90],
      [0.022, 0.062, 0.006],
      H,
    );
  }
  // rosette row
  rosette("F", 0.076, -0.22, 2.27, 1.1, P.folkYellow, P.folkRed, H);
  rosette("F", 0.076, 0, 2.27, 1.1, P.folkWhite, P.folkRed, H);
  rosette("F", 0.076, 0.22, 2.27, 1.1, P.folkYellow, P.folkRed, H);
  // iron hinge straps, barrels and ring handle
  for (const v of [2.99, 2.12]) {
    fbox(P.folkBlack, "F", 0.1, -0.225, v, 0.35, 0.055, 0.012, [0, 0, 0], H);
    fdia(P.folkBlack, "F", 0.1, -0.05, v, 0.075, H);
    addF(P.folkBlack, cyl(8), "F", 0.1, -0.4, v, [0, 0, 0], [0.026, 0.11, 0.026], H);
    for (const u of [-0.3, -0.18]) fcirc(P.folkYellow, "F", 0.108, u, v, 0.01, 6, H);
  }
  addF(P.folkBlack, cyl(8), "F", 0.1, 0.27, 2.55, [90, 0, 0], [0.045, 0.014, 0.045], H);
  addF(P.folkBlack, new THREE.TorusGeometry(0.04, 0.011, 5, 12), "F", 0.125, 0.27, 2.52, [0, 0, 0], [1, 1, 1], H);
  fcirc(P.folkYellow, "F", 0.112, 0.27, 2.55, 0.018, 6, H);

  // door platbands on the wall around the door
  for (const s of [1, -1]) {
    fbox(P.folkRed, "F", 0.02, s * 0.47, 2.55, 0.14, 1.1, 0.04);
    for (let v = 2.2; v < 3.05; v += 0.16) fdia(P.folkWhite, "F", 0.047, s * 0.47, v, 0.045);
  }
  fbox(P.folkRed, "F", 0.02, 0, 3.2, 1.3, 0.2, 0.04);
  for (let i = -6; i <= 6; i++) fdia(i % 2 ? P.folkWhite : P.folkYellow, "F", 0.047, i * 0.1, 3.2, 0.05);
  addF(P.folkBlue, CONE4, "F", 0.02, 0, 3.385, [0, 0, 0], [0.42, 0.17, 0.05]);
  rosette("F", 0.065, 0, 3.37, 0.7, P.folkYellow, P.folkRed);
  fcirc(P.folkWhite, "F", 0.065, 0, 3.45, 0.014, 6);

  flush();
}
```