<!-- call: plan -->

```json
{
  "name": "Cardboard Bot Kid",
  "description": "A kid wearing a homemade cardboard-box robot costume: a big appliance-box torso with a drawn-on control panel, a smaller box head with a cut-out visor showing the kid's eyes, cardboard tube arms with mitten hands, jeans and cardboard boots peeking below.",
  "builderName": "cardboardBotKid",
  "size": [1.85, 1.65, 0.7],
  "layout": "A standing child in a craft-robot costume, front facing +Z, centred on x = 0. Chunky silhouette: the torso is a big cardboard box (0.88 wide, 0.68 tall, 0.62 deep) from y 0.5 to 1.2; the head is a smaller box (0.5 wide, 0.46 tall, 0.5 deep) from y 1.18 to 1.64, slightly narrower than the body; total height ~1.64 m. Front view, top to bottom: box head with a square visor hole showing the kid's face (skin, big white eyes with ink pupils, brown hair), antenna with a red bottle-cap ball on top, marker rivets and a tape cross on the box front; below, the torso box front carries a navy control panel with two cream dial gauges, three coloured buttons, a lever and a taped dark 'screen'; at the shoulders, round armholes with tape rims where the cardboard tube arms emerge and hang down-outward to mitten hands near hip height; below the box, blue denim legs and cardboard boot covers with lighter toe caps and tape straps rest on y = 0. Back view: a taped vertical seam with a corrugated stripe and a packing-tape patch. The style reads on every part: corrugated cardboard tones with lighter inner-flute edges, silver duct tape wraps at every seam, marker doodles and torn/hand-cut flap edges everywhere; nothing is smooth or factory-made.",
  "palette": {
    "cardboard": "#c9a06b",
    "cardboardDark": "#a8814f",
    "corrugatedLight": "#e6c791",
    "tape": "#b8b3a8",
    "packingTape": "#e8d8a8",
    "panelNavy": "#3f4a63",
    "cream": "#f2e9d4",
    "buttonRed": "#e0453a",
    "buttonGreen": "#3fae5c",
    "buttonYellow": "#f0b429",
    "visorDark": "#2a2438",
    "skin": "#f5cfa0",
    "hair": "#6b4a2f",
    "ink": "#2b2233",
    "denim": "#5a76a8",
    "denimDark": "#4a628c",
    "mitten": "#e0453a",
    "sticker": "#f2ede2"
  },
  "mounts": {
    "neck": [0, 1.19, 0.02],
    "shoulderL": [0.44, 1.1, 0],
    "shoulderR": [-0.44, 1.1, 0],
    "hips": [0, 0.56, 0]
  },
  "joints": [
    { "name": "body", "at": [0, 0.9, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "head", "parent": "body", "at": [0, 1.2, 0.02], "dir": [0, 1, 0], "role": "head" },
    { "name": "armL", "parent": "body", "at": [0.44, 1.1, 0], "dir": [0.75, -0.55, 0.1], "role": "arm" },
    { "name": "armR", "parent": "body", "at": [-0.44, 1.1, 0], "dir": [-0.75, -0.55, 0.1], "role": "arm" },
    { "name": "legL", "parent": "body", "at": [0.17, 0.56, 0.02], "dir": [0, -1, 0], "role": "leg" },
    { "name": "legR", "parent": "body", "at": [-0.17, 0.56, 0.02], "dir": [0, -1, 0], "role": "leg" }
  ],
  "parts": [
    {
      "id": "boots",
      "builds": "The kid's legs below the torso box: denim jeans and cardboard boot covers. Two straight denim cylinders (denim) from y 0.56 (the hips mount, tucked slightly inside the body box bottom) down to y 0.14, at x = ±0.17, radius ~0.085; each gets a rolled cuff ring (denimDark) at the bottom y 0.14–0.19. Each foot wears a cardboard boot cover: a box roughly 0.24 wide × 0.14 tall × 0.34 deep, front edge at z +0.17, sitting on y = 0 (these are the only floor parts; keep their lowest faces exactly at y = 0). Each boot: main body in cardboard, a lighter corrugated toe-cap panel (corrugatedLight) on the front face slightly proud, a tape strap running over the top front to back (tape), and a small round sticker (sticker) on the side with a marker dash. A fold-over cardboard cuff (cardboardDark, a slightly larger open box ring y 0.14–0.2) hides the boot-to-pants join, its torn top edge visible. Use thin boxes, frustum boxes or low-segment cylinders; keep everything blocky, like taped boxes on feet.",
      "box": [[-0.34, 0.0, -0.2], [0.34, 0.56, 0.2]],
      "attaches": "Leg cylinders start at the hips mount [0, 0.56, 0] and rise into the bottom face of the bodyBox part; boot cuffs overlap the denim at y 0.14–0.2.",
      "joints": ["legL", "legR"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "bodyBox",
      "builds": "The appliance-box torso, the hero piece. One big cardboard box from y 0.5 to 1.2, x ±0.44, z ±0.31, in cardboard, built as slabs/frustum boxes with slightly irregular edges so it reads as hand-cut. Front face (z +): a navy control panel plate (panelNavy, a thin box ~0.5 wide × 0.34 tall, centred at [0, 0.88, 0.315]) with a taped border (packingTape strips along its edges); on the panel: two dial gauges — cream cylinder faces (cream) radius ~0.05 with ink marker tick marks (tiny flat boxes) and a needle each, and a small tape rim; three chunky buttons in buttonRed, buttonGreen and buttonYellow, small cylinders standing proud with cardboard rims around them; a lever: a thin stick with a yellow knob poking out at an angle, seated through a small slot; and a dark 'screen' rectangle (visorDark) with a small green blob (buttonGreen) showing through, sealed over with a flat of packingTape. Around the box: a vertical duct-tape seam (tape strip) up the back centre flanked by a corrugated stripe (corrugatedLight narrow strip) showing the flutes; a packing-tape patch (a small crossed rectangle of packingTape) on the lower right side; marker rivet dots (tiny ink discs) along all four front corners; a white sticker (sticker) low on the front-left with two ink dashes. Top face: a torn square hole around the neck mount [0, 1.19, 0.02] with a jagged rim ring (cardboardDark, small uneven tabs of boxes around the opening) and four short cut flaps splayed outward (cardboard, thin slabs angled up-out, not covering the hole). Side armholes at shoulderL/shoulderR mounts: circular hole rims made of tape rings (tape) at the side faces, y ~1.1, radius ~0.09, open. Bottom face: open (legs come through). The box's lowest edge sits at y 0.5, just above the boots part's denim top.",
      "box": [[-0.44, 0.5, -0.31], [0.44, 1.2, 0.31]],
      "attaches": "Sits over the boots part at the hips mount; the head box overlaps its top face at the neck mount; arm tubes emerge from its side armholes at shoulderL/shoulderR.",
      "joints": ["body"],
      "floor": false,
      "budget": 260
    },
    {
      "id": "headBox",
      "builds": "The smaller box head, y 1.18–1.64, x ±0.3, z from -0.28 to +0.3 (slightly front-biased on the neck mount). Main box in cardboard with the front face a touch brighter; every edge gets a thin corrugatedLight trim strip on the front face only, like exposed flutes. Front face: a square visor hole roughly 0.22 wide × 0.14 tall centred at [0, 1.42, 0.3]; inside the hole a recessed visorDark backing plate, and the kid's face peeking through: a skin-coloured flat face shape just behind the hole, with two big oval eyes (sticker white ovals with ink pupils looking slightly to one side), thin ink eyebrows, and brown hair (hair) visible as a fringe peeking over the top of the hole and small tufts at the sides — build hair as a few small flat cards/boxes in front of the hole's top edge. Torn hole edge: a jagged rim of tiny uneven cardboardDark tabs around the opening. Antenna: on the box top at [0.12, 1.64, 0], a thin slightly tilted rod (~0.16 tall, tape colour like a coat-hanger wire) with a red bottle-cap ball (buttonRed, small cylinder with a rim) on top, and a small tape wrap (tape ring) at its base. Side 'ear' bolts: at x ±0.3, y 1.42, flat cylinders sticking out (cardboardDark disc radius 0.06 with a cream centre disc and an ink ring). Top face: a tape cross (two packingTape strips crossed) like a handle. Front corners: marker rivet dots (ink discs). A small packing-tape patch on the right side. Head box bottom edge overlaps the body box top by ~0.02 so the two boxes read as stacked.",
      "box": [[-0.3, 1.18, -0.28], [0.3, 1.64, 0.3]],
      "attaches": "Sits on the bodyBox top face over the neck mount [0, 1.19, 0.02]; its bottom flaps skirt over the body box's torn top edge.",
      "joints": ["head"],
      "floor": false,
      "budget": 250
    },
    {
      "id": "armL",
      "builds": "The kid's left arm (+X side), from the shoulderL mount [0.44, 1.1, 0]. At the mount: a cardboard shoulder disc (cardboard, flat cylinder radius ~0.11, thickness 0.02, facing outward, covering the armhole rim from outside) with a tape ring edge. Upper arm: a cardboard tube (low-segment cylinder, cardboard) radius ~0.055 running from the shoulder down-outward along the armL joint direction (about [0.75, -0.55, 0.1] normalized) for ~0.24; at the elbow a chunky duct-tape wrap (tape, a slightly fatter short cylinder radius 0.065, length 0.05). Forearm: a slightly narrower cardboard tube (radius 0.05) continuing down and angling slightly forward, total arm reaching to about [0.78, 0.72, 0.12]; the forearm wears one marker doodle — an ink zigzag dash line as a small flat decal strip. Wrist: a packingTape cuff ring. Hand: a mitten (mitten red) built as a rounded chunky box ~0.13 wide × 0.15 tall × 0.11 deep plus a thumb (small capsule sticking forward-inward) and a simple cuff of cardboard; mitten sits at the end of the forearm. The whole arm keeps a slight outward hang so the mitten ends near hip height, clear of the body box.",
      "box": [[0.38, 0.6, -0.12], [0.92, 1.12, 0.24]],
      "attaches": "Shoulder disc at shoulderL mount [0.44, 1.1, 0] over the bodyBox armhole; the arm hangs outside the body box's side face.",
      "joints": ["armL"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "armR",
      "builds": "The kid's right arm (-X side), the exact mirror of armL: cardboard shoulder disc at shoulderR mount [-0.44, 1.1, 0], cardboard tube upper arm along the armR joint direction ([-0.75, -0.55, 0.1]), tape elbow wrap, narrower forearm with the same ink zigzag marker doodle on the outer face, packingTape wrist cuff, and a mitten red rounded hand with a thumb, ending near [-0.78, 0.72, 0.12]. Mirror every detail, keeping the mitten thumb pointing inward-forward on both sides.",
      "box": [[-0.92, 0.6, -0.12], [-0.38, 1.12, 0.24]],
      "attaches": "Shoulder disc at shoulderR mount [-0.44, 1.1, 0] over the bodyBox armhole; the arm hangs outside the body box's side face.",
      "joints": ["armR"],
      "floor": false,
      "budget": 130
    }
  ]
}
```

<!-- call: boots -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBoots({ b, J, P, M }: any) {
  const r = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  for (const [side, bone] of [[1, J.legL], [-1, J.legR]] as [number, any][]) {
    const x = side * 0.17;
    // jeans
    b.part(cyl(0.085, 0.085, 0.44, 10), P.denim, { bone, at: [x, 0.35, 0.0] });
    // knee patch / seam details
    b.part(box(0.02, 0.3, 0.02), P.denimDark, { bone, at: [x + side * 0.083, 0.36, 0] });
    b.part(box(0.07, 0.07, 0.01), P.denimDark, { bone, at: [x, 0.3, 0.087] });
    // rolled cuff
    b.part(cyl(0.095, 0.095, 0.05, 10), P.denimDark, { bone, at: [x, 0.165, 0] });
    // boot body
    b.part(box(0.24, 0.14, 0.34), P.cardboard, { bone, at: [x, 0.07, 0] });
    // lighter lower sole edge
    b.part(box(0.245, 0.02, 0.345), P.cardboardDark, { bone, at: [x, 0.012, 0] });
    // toe cap
    b.part(box(0.2, 0.09, 0.02), P.corrugatedLight, { bone, at: [x, 0.07, 0.175] });
    for (let i = 0; i < 4; i++)
      b.part(box(0.01, 0.07, 0.006), P.cardboardDark, { bone, at: [x - 0.06 + i * 0.04, 0.07, 0.187] });
    // tape strap over top
    b.part(box(0.05, 0.012, 0.3), P.tape, { bone, at: [x, 0.145, 0.01] });
    b.part(box(0.05, 0.08, 0.012), P.tape, { bone, at: [x, 0.1, 0.176] });
    // sticker on side with dash
    const sx = x + side * 0.122;
    b.part(cyl(0.035, 0.035, 0.006, 10), P.sticker, { bone, at: [sx, 0.075, -0.03], dir: [side, 0, 0] });
    b.part(box(0.004, 0.006, 0.04), P.ink, { bone, at: [sx + side * 0.004, 0.075, -0.03], rotation: [0, 0, 0] });
    // fold-over cuff, open ring of four slabs
    const cy = 0.17;
    b.part(box(0.27, 0.06, 0.012), P.cardboardDark, { bone, at: [x, cy, 0.125] });
    b.part(box(0.27, 0.06, 0.012), P.cardboardDark, { bone, at: [x, cy, -0.125] });
    b.part(box(0.012, 0.06, 0.25), P.cardboardDark, { bone, at: [x + 0.125, cy, 0] });
    b.part(box(0.012, 0.06, 0.25), P.cardboardDark, { bone, at: [x - 0.125, cy, 0] });
    // torn top tabs
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const tx = x + Math.cos(a) * 0.125, tz = Math.sin(a) * 0.125;
      b.part(box(0.025, 0.02 + r() * 0.02, 0.012), P.cardboardDark, { bone, at: [tx, 0.215, tz], rotation: [0, -a * 57.3 + 90, 0] });
    }
    // marker dots
    b.part(cyl(0.01, 0.01, 0.004, 6), P.ink, { bone, at: [x + side * 0.1, 0.12, 0.172], dir: [0, 0, 1] });
  }
}
```

<!-- call: armR -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildArmR({ b, J, P, M }: Ctx) {
  const bone = J.armR;
  const s = -1;
  const sh = new THREE.Vector3(...M.shoulderR);
  const dir = new THREE.Vector3(-0.75, -0.55, 0.1).normalize();
  const at = (d: number) => sh.clone().addScaledVector(dir, d);
  const r = rng(11);

  // shoulder disc and tape ring, facing outward (-X)
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 12), P.cardboard, {
    bone, at: sh.clone().add(new THREE.Vector3(-0.012, 0, 0)), dir: [-1, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.11, 0.012, 5, 14), P.tape, {
    bone, at: sh.clone().add(new THREE.Vector3(-0.024, 0, 0)), dir: [-1, 0, 0], axis: "z",
  });
  // corrugated flute lines on the disc
  for (let i = -1; i <= 1; i++) {
    b.part(new THREE.BoxGeometry(0.004, 0.16, 0.012), P.corrugatedLight, {
      bone, at: sh.clone().add(new THREE.Vector3(-0.025, 0, i * 0.04)),
    });
  }

  // upper arm
  const elbow = at(0.26);
  b.rod(at(0.0), elbow, 0.055, P.cardboard, { bone, section: { ngon: 8 }, caps: "flat" });
  // flute rings on upper arm
  for (const t of [0.4, 0.7]) {
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.012, 8), P.cardboardDark, {
      bone, at: at(0.26 * t), dir: dir.toArray() as [number, number, number],
    });
  }
  // elbow tape wrap
  b.part(new THREE.CylinderGeometry(0.067, 0.067, 0.05, 10), P.tape, {
    bone, at: elbow, dir: dir.toArray() as [number, number, number],
  });

  // forearm
  const wrist = new THREE.Vector3(-0.78, 0.76, 0.12);
  const fdir = wrist.clone().sub(elbow).normalize();
  b.rod(elbow, wrist, 0.05, P.cardboard, { bone, section: { ngon: 8 }, caps: "flat" });
  // zigzag doodle on outer face (-X side)
  const fl = wrist.clone().sub(elbow);
  const pts = 6;
  for (let i = 0; i < pts; i++) {
    const t = 0.2 + (0.6 * i) / (pts - 1);
    const p = elbow.clone().addScaledVector(fl, t);
    p.x -= 0.05;
    p.z += (i % 2 ? 0.014 : -0.014);
    b.part(new THREE.BoxGeometry(0.008, 0.03, 0.007), P.ink, {
      bone, at: p, rotation: [0, 0, (i % 2 ? 25 : -25)],
    });
  }
  // wrist cuff
  b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.045, 10), P.packingTape, {
    bone, at: wrist, dir: fdir.toArray() as [number, number, number],
  });

  // cardboard mitten cuff
  const cuffAt = wrist.clone().addScaledVector(fdir, 0.04);
  b.part(new THREE.CylinderGeometry(0.063, 0.058, 0.04, 8), P.cardboardDark, {
    bone, at: cuffAt, dir: fdir.toArray() as [number, number, number],
  });

  // mitten
  const hand = wrist.clone().addScaledVector(fdir, 0.12);
  b.part(new THREE.BoxGeometry(0.11, 0.15, 0.1), P.mitten, {
    bone, at: hand, dir: fdir.toArray() as [number, number, number],
  });
  // rounded fingertips
  b.part(new THREE.SphereGeometry(0.058, 8, 6), P.mitten, {
    bone, at: hand.clone().addScaledVector(fdir, 0.07), scale: [1, 0.8, 0.9],
  });
  // thumb inward (+X) and forward (+Z)
  b.capsule(
    hand.clone().add(new THREE.Vector3(0.04, 0.02, 0.03)),
    hand.clone().add(new THREE.Vector3(0.09, -0.01, 0.08)),
    0.025, P.mitten, { bone },
  );
  // mitten stitch line
  b.part(new THREE.BoxGeometry(0.1, 0.006, 0.006), P.ink, {
    bone, at: hand.clone().add(new THREE.Vector3(-0.005, -0.03, 0.05)), dir: fdir.toArray() as [number, number, number], axis: "x",
  });
  void r; void frame; void s;
}
```

<!-- call: armL -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildArmL({ b, J, P, M }: Ctx) {
  const bone = J.armL;
  const sh = new THREE.Vector3(...M.shoulderL);
  const dir = new THREE.Vector3(0.75, -0.55, 0.1).normalize();
  const elbow = sh.clone().addScaledVector(dir, 0.26);
  const wristDir = new THREE.Vector3(0.12, -0.95, 0.2).normalize();
  const wrist = elbow.clone().addScaledVector(wristDir, 0.24);
  const R = rng(5);

  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const tube = (a: THREE.Vector3, c: THREE.Vector3, r: number, col: string, r2 = r, seg = 8) => {
    const m = a.clone().add(c).multiplyScalar(0.5);
    const d = c.clone().sub(a);
    return b.part(cyl(r, r2, d.length(), seg), col, { bone, at: m, dir: d.clone().normalize() });
  };

  // shoulder disc facing outward (+X)
  b.part(cyl(0.11, 0.11, 0.02, 14), P.cardboard, { bone, at: [sh.x + 0.015, sh.y, sh.z], dir: [1, 0, 0] });
  b.part(new THREE.TorusGeometry(0.11, 0.009, 5, 16), P.tape, { bone, at: [sh.x + 0.026, sh.y, sh.z], dir: [1, 0, 0], axis: "z" });
  b.part(cyl(0.07, 0.07, 0.012, 10), P.cardboardDark, { bone, at: [sh.x + 0.03, sh.y, sh.z], dir: [1, 0, 0] });

  // upper arm
  const s0 = sh.clone().addScaledVector(dir, -0.02);
  tube(s0, elbow, 0.055, P.cardboard);
  // corrugation rings
  for (const t of [0.3, 0.6]) {
    const p = s0.clone().lerp(elbow, t);
    b.part(new THREE.TorusGeometry(0.057, 0.004, 4, 10), P.corrugatedLight, { bone, at: p, dir, axis: "z" });
  }
  // elbow tape wrap
  b.part(cyl(0.066, 0.066, 0.05, 10), P.tape, { bone, at: elbow, dir });
  b.part(new THREE.SphereGeometry(0.052, 8, 6), P.cardboard, { bone, at: elbow });

  // forearm
  tube(elbow, wrist, 0.05, P.cardboard, 0.048);
  // zigzag doodle on outer face
  const side = new THREE.Vector3(1, 0.1, 0).normalize();
  for (let i = 0; i < 6; i++) {
    const t = 0.2 + i * 0.12;
    const p = elbow.clone().lerp(wrist, t).addScaledVector(side, 0.05);
    const sign = i % 2 ? 1 : -1;
    p.z += sign * 0.014;
    b.part(new THREE.BoxGeometry(0.006, 0.004, 0.045), P.ink, {
      bone, at: p, dir: wristDir, axis: "y", rotation: [0, 0, 0],
    });
  }
  // wrist cuff
  const cuffAt = wrist.clone().addScaledVector(wristDir, -0.015);
  b.part(cyl(0.056, 0.056, 0.035, 10), P.packingTape, { bone, at: cuffAt, dir: wristDir });
  // cardboard cuff under mitten
  const cuff2 = wrist.clone().addScaledVector(wristDir, 0.02);
  b.part(cyl(0.062, 0.058, 0.03, 8), P.cardboardDark, { bone, at: cuff2, dir: wristDir });

  // mitten
  const hand = wrist.clone().addScaledVector(wristDir, 0.1);
  b.part(new THREE.BoxGeometry(0.11, 0.15, 0.1), P.mitten, { bone, at: hand, dir: wristDir, axis: "y" });
  b.part(new THREE.SphereGeometry(0.055, 8, 6), P.mitten, {
    bone, at: hand.clone().addScaledVector(wristDir, -0.07), scale: [1, 0.9, 0.95],
  });
  b.part(new THREE.SphereGeometry(0.055, 8, 6), P.mitten, {
    bone, at: hand.clone().addScaledVector(wristDir, 0.075), scale: [1, 0.8, 0.9],
  });
  // thumb forward-inward
  const thumbAt = hand.clone().add(new THREE.Vector3(-0.05, 0.01, 0.06));
  b.part(new THREE.CapsuleGeometry(0.025, 0.05, 4, 8), P.mitten, {
    bone, at: thumbAt, dir: [-0.5, -0.2, 1],
  });
  // mitten stitch lines
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.BoxGeometry(0.004, 0.05, 0.004), P.ink, {
      bone,
      at: hand.clone().add(new THREE.Vector3(0.01 + i * 0.012 - 0.012, -0.02, 0.052 + R() * 0.001)),
      dir: wristDir,
    });
  }
  // tape scrap on the upper arm
  b.part(new THREE.BoxGeometry(0.03, 0.04, 0.004), P.packingTape, {
    bone, at: s0.clone().lerp(elbow, 0.45).add(new THREE.Vector3(0.0, 0.05, 0.03)), dir,
  });
}
```

<!-- call: bodyBox -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBodyBox({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r: number, h: number, c: string, at: number[], dir: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at, dir });
  const Z = [0, 0, 1];
  const X = [1, 0, 0];

  // Box walls (open top hole and open bottom)
  const y0 = 0.5, y1 = 1.2, hy = (y0 + y1) / 2, H = y1 - y0;
  box(0.88, H, 0.02, P.cardboard, [0, hy, 0.3]);
  box(0.88, H, 0.02, P.cardboardDark, [0, hy, -0.3]);
  box(0.02, H, 0.62, P.cardboard, [0.43, hy, 0]);
  box(0.02, H, 0.62, P.cardboard, [-0.43, hy, 0]);
  // top face pieces around hole (hole x +-0.16, z -0.14..0.18)
  box(0.88, 0.02, 0.12, P.cardboard, [0, 1.19, -0.25]);
  box(0.88, 0.02, 0.12, P.cardboard, [0, 1.19, 0.25]);
  box(0.28, 0.02, 0.38, P.cardboard, [0.3, 1.19, 0.02]);
  box(0.28, 0.02, 0.38, P.cardboard, [-0.3, 1.19, 0.02]);
  // inner dark lining
  box(0.84, H - 0.04, 0.01, P.cardboardDark, [0, hy, 0.285]);
  // corrugated edge trims
  for (const s of [1, -1]) {
    box(0.025, H, 0.025, P.corrugatedLight, [s * 0.44, hy, 0.31]);
    box(0.025, H, 0.025, P.corrugatedLight, [s * 0.44, hy, -0.31]);
    box(0.89, 0.025, 0.025, P.corrugatedLight, [0, y1, s * 0.31]);
    box(0.89, 0.025, 0.025, P.corrugatedLight, [0, y0, s * 0.31]);
  }

  // jagged rim tabs around neck hole
  for (let i = 0; i < 18; i++) {
    const t = i / 18 * Math.PI * 2;
    const x = Math.cos(t) * 0.17, z = 0.02 + Math.sin(t) * 0.17;
    const sq = Math.max(Math.abs(Math.cos(t)), Math.abs(Math.sin(t)));
    box(0.04 + R() * 0.03, 0.03 + R() * 0.03, 0.04 + R() * 0.03, P.cardboardDark, [x / sq * 0.9, 1.205, 0.02 + (z - 0.02) / sq * 0.9], [0, R() * 40, 0]);
  }
  // four flaps splayed
  const flaps = [[0, 0.26, 0, -25], [0, -0.22, 0, 25], [0.24, 0.02, 25, 0], [-0.24, 0.02, -25, 0]];
  flaps.forEach(([x, z, rz, rx], i) => {
    const sideways = i > 1;
    box(sideways ? 0.12 : 0.26, 0.012, sideways ? 0.26 : 0.1, P.cardboard, [x * 1.0, 1.23, z + 0.02], [rx * (Math.PI / 180) * 57.3 * 0 + (sideways ? 0 : (z > 0 ? -22 : 22)), 0, sideways ? (x > 0 ? -22 : 22) : 0]);
  });

  // control panel
  const pz = 0.318;
  box(0.5, 0.34, 0.012, P.panelNavy, [0, 0.88, pz]);
  const tp = (w: number, h: number, x: number, y: number) => box(w, h, 0.005, P.packingTape, [x, y, pz + 0.008]);
  tp(0.52, 0.025, 0, 1.055); tp(0.52, 0.025, 0, 0.705); tp(0.025, 0.36, 0.25, 0.88); tp(0.025, 0.36, -0.25, 0.88);

  // dials
  for (const s of [-1, 1]) {
    const cx = s * 0.12, cy = 0.97;
    cyl(0.058, 0.014, P.tape, [cx, cy, pz + 0.012], Z, 14);
    cyl(0.05, 0.014, P.cream, [cx, cy, pz + 0.016], Z, 14);
    for (let k = 0; k < 7; k++) {
      const a = (-120 + k * 40) * Math.PI / 180;
      box(0.004, 0.012, 0.003, P.ink, [cx + Math.sin(a) * 0.038, cy + Math.cos(a) * 0.038, pz + 0.025], [0, 0, -a]);
    }
    const na = s * 0.7;
    box(0.004, 0.04, 0.003, P.buttonRed, [cx + Math.sin(na) * 0.016, cy + Math.cos(na) * 0.016, pz + 0.028], [0, 0, -na]);
    cyl(0.006, 0.005, P.ink, [cx, cy, pz + 0.03], Z, 8);
  }
  // buttons
  [[P.buttonRed, -0.15], [P.buttonGreen, -0.08], [P.buttonYellow, -0.01]].forEach(([c, x]: any) => {
    cyl(0.032, 0.012, P.cardboardDark, [x, 0.84, pz + 0.01], Z, 10);
    cyl(0.024, 0.026, c, [x, 0.84, pz + 0.02], Z, 10);
  });
  // lever
  box(0.05, 0.016, 0.006, P.visorDark, [0.17, 0.84, pz + 0.008]);
  b.rod([0.17, 0.84, pz + 0.01], [0.21, 0.9, pz + 0.07], 0.007, P.tape, { bone });
  b.part(new THREE.SphereGeometry(0.017, 8, 6), P.buttonYellow, { bone, at: [0.21, 0.9, pz + 0.075] });
  // screen
  box(0.3, 0.1, 0.006, P.visorDark, [0, 0.75, pz + 0.008]);
  b.part(new THREE.SphereGeometry(0.025, 8, 6), P.buttonGreen, { bone, at: [-0.06, 0.75, pz + 0.014], scale: [1.4, 0.8, 0.3] });
  box(0.32, 0.12, 0.004, P.packingTape, [0, 0.75, pz + 0.016]);
  box(0.3, 0.1, 0.002, P.visorDark, [0, 0.75, pz + 0.0185]);
  b.part(new THREE.SphereGeometry(0.025, 8, 6), P.buttonGreen, { bone, at: [-0.06, 0.75, pz + 0.02], scale: [1.4, 0.8, 0.2] });

  // rivets on front corners
  for (const s of [1, -1]) for (let k = 0; k < 6; k++)
    cyl(0.008, 0.006, P.ink, [s * 0.415, 0.55 + k * 0.12, 0.312], Z, 6);

  // back seam
  box(0.07, H, 0.008, P.tape, [0, hy, -0.314]);
  box(0.035, H, 0.006, P.corrugatedLight, [0.07, hy, -0.313]);
  box(0.035, H, 0.006, P.corrugatedLight, [-0.07, hy, -0.313]);
  for (let k = 0; k < 10; k++) box(0.035, 0.004, 0.008, P.cardboardDark, [0.07, 0.53 + k * 0.07, -0.316]);
  box(0.2, 0.14, 0.006, P.packingTape, [-0.22, 0.8, -0.314], [0, 0, 0.1]);

  // packing tape patch on lower right side (-x)
  box(0.006, 0.05, 0.22, P.packingTape, [-0.445, 0.65, 0.05], [0.3, 0, 0]);
  box(0.006, 0.22, 0.05, P.packingTape, [-0.446, 0.65, 0.05], [0.3, 0, 0]);

  // sticker
  cyl(0.055, 0.005, P.sticker, [-0.3, 0.6, pz - 0.004], Z, 14);
  box(0.05, 0.007, 0.003, P.ink, [-0.3, 0.62, pz], [0, 0, 0.2]);
  box(0.035, 0.007, 0.003, P.ink, [-0.3, 0.59, pz], [0, 0, -0.1]);

  // armholes tape rings
  for (const s of [1, -1]) {
    const c = [s * 0.44, 1.1, 0];
    b.part(new THREE.TorusGeometry(0.09, 0.012, 5, 16), P.tape, { bone, at: c, dir: X, axis: "z" });
    b.part(new THREE.TorusGeometry(0.1, 0.006, 4, 16), P.tapeDark ?? P.cardboardDark, { bone, at: [s * 0.436, 1.1, 0], dir: X, axis: "z" });
  }
}
```

<!-- call: headBox -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHeadBox({ b, J, P, M }: Ctx) {
  const head = J.head;
  const r = rng(11);
  const X0 = -0.3, X1 = 0.3, Y0 = 1.18, Y1 = 1.64, Z0 = -0.28, Z1 = 0.3;
  const cx = 0, cy = (Y0 + Y1) / 2, cz = (Z0 + Z1) / 2;
  const W = X1 - X0, H = Y1 - Y0, D = Z1 - Z0;

  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: head, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], dir: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: head, at, dir });

  // main box
  box(W, H, D, P.cardboard, [cx, cy, cz]);
  // brighter front panel (with visor hole built from 4 pieces)
  const vw = 0.22, vh = 0.14, vy = 1.42;
  const fz = Z1 + 0.002;
  const fw = (W - vw) / 2, fh = (Y1 - Y0 - vh) / 2;
  box(fw, H, 0.004, "#d2aa75", [-(vw / 2 + fw / 2), cy, fz]);
  box(fw, H, 0.004, "#d2aa75", [vw / 2 + fw / 2, cy, fz]);
  const topH = Y1 - (vy + vh / 2), botH = vy - vh / 2 - Y0;
  box(vw, topH, 0.004, "#d2aa75", [0, Y1 - topH / 2, fz]);
  box(vw, botH, 0.004, "#d2aa75", [0, Y0 + botH / 2, fz]);

  // corrugated trim on front edges
  const tz = Z1 + 0.006;
  box(W, 0.02, 0.004, P.corrugatedLight, [0, Y1 - 0.012, tz]);
  box(W, 0.02, 0.004, P.corrugatedLight, [0, Y0 + 0.012, tz]);
  box(0.02, H, 0.004, P.corrugatedLight, [X0 + 0.012, cy, tz]);
  box(0.02, H, 0.004, P.corrugatedLight, [X1 - 0.012, cy, tz]);
  // flute lines on trim
  for (let i = 0; i < 10; i++) box(0.003, 0.014, 0.002, P.cardboardDark, [X0 + 0.05 + i * 0.055, Y1 - 0.012, tz + 0.003]);

  // visor interior
  box(vw + 0.02, vh + 0.02, 0.01, P.visorDark, [0, vy, Z1 - 0.06]);
  // face
  box(0.2, 0.125, 0.01, P.skin, [0, vy - 0.005, Z1 - 0.035]);
  for (const s of [1, -1]) {
    const e = b.part(new THREE.SphereGeometry(0.03, 8, 6), P.sticker, { bone: head, at: [s * 0.055, vy - 0.005, Z1 - 0.025], scale: [1, 1.2, 0.35] });
    b.part(new THREE.SphereGeometry(0.015, 6, 5), P.ink, { bone: head, at: [s * 0.055 + 0.008, vy - 0.007, Z1 - 0.015], scale: [1, 1.2, 0.4] });
    box(0.055, 0.008, 0.004, P.ink, [s * 0.055, vy + 0.04, Z1 - 0.027], [0, 0, s * -0.12]);
  }
  box(0.03, 0.006, 0.004, P.ink, [0, vy - 0.05, Z1 - 0.028]);
  // hair fringe and tufts
  for (let i = 0; i < 7; i++) {
    const x = -0.095 + i * 0.032;
    box(0.04, 0.03 + r() * 0.02, 0.012, P.hair, [x, vy + vh / 2 - 0.01, Z1 - 0.015], [0, 0, (r() - 0.5) * 0.5]);
  }
  for (const s of [1, -1]) for (let j = 0; j < 2; j++)
    box(0.03, 0.03, 0.012, P.hair, [s * 0.1, vy + 0.02 - j * 0.04, Z1 - 0.02], [0, 0, s * 0.4]);

  // torn rim tabs
  const tab = (x: number, y: number, w: number, h: number) =>
    box(w, h, 0.006, P.cardboardDark, [x, y, Z1 + 0.006], [0, 0, (r() - 0.5) * 0.8]);
  for (let i = 0; i < 9; i++) {
    const x = -vw / 2 + (i + 0.5) * (vw / 9);
    tab(x, vy + vh / 2 + 0.006, 0.014 + r() * 0.01, 0.01 + r() * 0.012);
    tab(x, vy - vh / 2 - 0.006, 0.014 + r() * 0.01, 0.01 + r() * 0.012);
  }
  for (let i = 0; i < 5; i++) {
    const y = vy - vh / 2 + (i + 0.5) * (vh / 5);
    tab(-vw / 2 - 0.006, y, 0.01 + r() * 0.01, 0.014);
    tab(vw / 2 + 0.006, y, 0.01 + r() * 0.01, 0.014);
  }

  // rivets on front corners
  for (const sx of [1, -1]) for (const y of [Y0 + 0.05, Y1 - 0.05, cy])
    cyl(0.01, 0.01, 0.004, 8, P.ink, [sx * (W / 2 - 0.04), y, Z1 + 0.01], [0, 0, 1]);

  // top tape cross
  box(0.34, 0.003, 0.05, P.packingTape, [0, Y1 + 0.002, 0]);
  box(0.05, 0.003, 0.4, P.packingTape, [0, Y1 + 0.003, 0]);

  // antenna
  const ax = 0.12;
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.17, 6), P.tape, { bone: head, at: [ax + 0.01, Y1 + 0.08, 0], dir: [0.12, 1, 0] });
  cyl(0.018, 0.018, 0.02, 8, P.tape, [ax, Y1 + 0.01, 0], [0, 1, 0]);
  cyl(0.032, 0.026, 0.02, 12, P.buttonRed, [ax + 0.02, Y1 + 0.18, 0], [0.12, 1, 0]);
  cyl(0.036, 0.036, 0.006, 12, "#b8352c", [ax + 0.0195, Y1 + 0.17, 0], [0.12, 1, 0]);
  b.part(new THREE.SphereGeometry(0.018, 6, 5), "#f08a80", { bone: head, at: [ax + 0.015, Y1 + 0.19, 0.012], scale: [1, 0.5, 1] });

  // ear bolts
  for (const s of [1, -1]) {
    const x = s * X1;
    cyl(0.06, 0.06, 0.016, 12, P.cardboardDark, [x + s * 0.008, 1.42, 0], [s, 0, 0]);
    cyl(0.04, 0.04, 0.006, 12, P.ink, [x + s * 0.017, 1.42, 0], [s, 0, 0]);
    cyl(0.033, 0.033, 0.006, 12, P.cream, [x + s * 0.02, 1.42, 0], [s, 0, 0]);
    cyl(0.01, 0.01, 0.006, 6, P.ink, [x + s * 0.024, 1.42, 0], [s, 0, 0]);
  }

  // side packing tape patch (right = -x)
  box(0.004, 0.1, 0.05, P.packingTape, [X0 - 0.002, 1.36, -0.05], [0, 0, 0.1]);
  box(0.004, 0.05, 0.1, P.packingTape, [X0 - 0.003, 1.36, -0.05], [0, 0, 0.1]);

  // bottom skirt flaps over body top
  for (let i = 0; i < 5; i++) {
    const x = -0.24 + i * 0.12;
    box(0.1, 0.002, 0.03, P.cardboardDark, [x, Y0 + 0.002, Z1 + 0.012], [0.25, 0, 0]);
  }
  // back seam hint
  box(0.03, H, 0.003, P.tape, [0.1, cy, Z0 - 0.002]);
}
```