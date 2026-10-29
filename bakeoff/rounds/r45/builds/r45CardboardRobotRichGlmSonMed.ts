import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Captain Cardboard",
  "description": "A stylized kid in a homemade cardboard-box robot costume: kraft box torso with a marker-drawn control panel, a box helmet with a taped visor window where the kid's face peeks out, an antenna, cardboard tube arms with mitts, cardboard boots, and a paper jetpack with zigzag paper flames on the back."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  cardboard: "#c99a5b",
  cardboardLight: "#e2bd87",
  cardboardDark: "#8a6238",
  fluting: "#b07f47",
  tape: "#b6b0a4",
  tapeDark: "#8d877b",
  robotRed: "#d95d3a",
  robotBlue: "#3a7bd0",
  paintYellow: "#f2c230",
  paintGreen: "#5aa457",
  panelWhite: "#f4efe2",
  ink: "#332f2a",
  bolt: "#a9aeb3",
  skin: "#f0b489",
  blush: "#e88a6a",
  hair: "#7a4a2b",
  denim: "#4f6fa5",
  sole: "#6b5136",
  eyeWhite: "#fdfdf8",
  iris: "#4a3222",
  paperOrange: "#ef8f3a",
  paperYellow: "#f8d458",
};
const M = {
  collar: [0, 1.15, 0.02] as [number, number, number],
  shoulderL: [0.36, 1.13, 0] as [number, number, number],
  shoulderR: [-0.36, 1.13, 0] as [number, number, number],
  hipL: [0.16, 0.6, 0] as [number, number, number],
  hipR: [-0.16, 0.6, 0] as [number, number, number],
  backMount: [0, 0.95, -0.26] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torsoBox
  (() => {
function buildTorsoBox({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: string, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], dir: number[] = [0, 0, 1]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir });

  const CY = 0.87, Z = 0.25;
  // main box
  box(0.74, 0.58, 0.5, P.cardboard, [0, CY, 0]);
  // bottom light rim and dark inner rim
  box(0.76, 0.03, 0.52, P.cardboardLight, [0, 0.595, 0]);
  box(0.68, 0.03, 0.44, P.cardboardDark, [0, 0.575, 0]);
  // top edge strips
  for (const s of [1, -1]) {
    box(0.02, 0.02, 0.52, P.cardboardLight, [s * 0.37, 1.16, 0]);
    box(0.76, 0.02, 0.02, P.cardboardLight, [0, 1.16, s * 0.25]);
  }
  // fluting on front vertical corners
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const y = 0.6 + i * 0.07 - 0.0 + 0.0;
      void y;
    }
    for (let i = 0; i < 3; i++) {
      // vertical flutes: one tall half-round per slot across front edge and side edge
      cyl(0.008, 0.008, 0.56, 5, P.fluting, [s * (0.37 + 0.003), CY, 0.25 - i * 0.022], [0, 1, 0]);
      cyl(0.008, 0.008, 0.56, 5, P.fluting, [s * (0.37 - i * 0.022), CY, 0.253], [0, 1, 0]);
    }
    for (let i = 0; i < 2; i++) {
      cyl(0.008, 0.008, 0.56, 5, P.fluting, [s * (0.37 + 0.003), CY, 0.25 - (i + 3) * 0.022], [0, 1, 0]);
      cyl(0.008, 0.008, 0.56, 5, P.fluting, [s * (0.37 - (i + 3) * 0.022), CY, 0.253], [0, 1, 0]);
    }
  }
  // control panel
  box(0.33, 0.25, 0.01, P.tape, [0, 0.92, Z + 0.005]);
  box(0.30, 0.22, 0.01, P.robotBlue, [0, 0.92, Z + 0.012]);
  box(0.26, 0.02, 0.006, "#4f8fe0", [0, 1.005, Z + 0.019]);
  // big gauge
  const gz = Z + 0.02, gx = -0.06, gy = 0.945;
  cyl(0.045, 0.045, 0.008, 20, P.panelWhite, [gx, gy, gz]).mesh.rotation.x = 0;
  const g = frame([gx, gy, gz + 0.006], [0, 0, 1]);
  void g;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.003, 0.009, 0.003), P.ink, {
      bone,
      at: [gx + Math.sin(a) * 0.036, gy + Math.cos(a) * 0.036, gz + 0.006],
      rotation: [0, 0, -(a * 180) / Math.PI],
    });
  }
  b.part(new THREE.BoxGeometry(0.004, 0.036, 0.003), P.ink, {
    bone, at: [gx + 0.01, gy + 0.013, gz + 0.007], rotation: [0, 0, -35],
  });
  cyl(0.006, 0.006, 0.006, 8, P.ink, [gx, gy, gz + 0.007]);
  // small yellow gauge
  cyl(0.03, 0.03, 0.008, 16, P.paintYellow, [0.085, 0.955, gz]);
  b.part(new THREE.BoxGeometry(0.003, 0.024, 0.003), P.ink, { bone, at: [0.088, 0.962, gz + 0.006], rotation: [0, 0, 30] });
  for (let i = 0; i < 5; i++) {
    const a = (-60 + i * 30) * Math.PI / 180;
    b.part(new THREE.BoxGeometry(0.002, 0.006, 0.002), P.ink, {
      bone, at: [0.085 + Math.sin(a) * 0.024, 0.955 + Math.cos(a) * 0.024, gz + 0.006], rotation: [0, 0, -a * 180 / Math.PI],
    });
  }
  // buttons and switch
  cyl(0.0125, 0.0125, 0.02, 12, P.robotRed, [-0.07, 0.862, Z + 0.02]);
  cyl(0.0125, 0.0125, 0.02, 12, P.paintGreen, [-0.035, 0.862, Z + 0.02]);
  box(0.05, 0.012, 0.006, P.ink, [0.07, 0.862, Z + 0.018]);
  box(0.008, 0.03, 0.01, P.paintGreen, [0.075, 0.872, Z + 0.024], { rotation: [0, 0, -25] });
  // smiley
  const sy = 0.76;
  cyl(0.05, 0.05, 0.008, 20, P.paintYellow, [0, sy, Z + 0.004]);
  for (const s of [1, -1]) cyl(0.007, 0.007, 0.006, 8, P.ink, [s * 0.017, sy + 0.015, Z + 0.01]);
  for (let i = 0; i < 7; i++) {
    const a = (-60 + i * 20) * Math.PI / 180;
    b.part(new THREE.BoxGeometry(0.014, 0.005, 0.004), P.ink, {
      bone, at: [Math.sin(a) * 0.03, sy - 0.003 - Math.cos(a) * 0.03 + 0.012, Z + 0.01], rotation: [0, 0, a * 180 / Math.PI],
    });
  }
  // tape band wrapping
  box(0.75, 0.06, 0.51, P.tape, [0, 0.66, 0]);
  box(0.755, 0.008, 0.515, P.tapeDark, [0, 0.632, 0]);
  box(0.755, 0.008, 0.515, P.tapeDark, [0, 0.688, 0]);
  // X repair patch lower front right (model right = -x)
  for (const r of [45, -45]) box(0.13, 0.03, 0.008, P.tape, [-0.25, 0.755, Z + 0.004], { rotation: [0, 0, r] });
  box(0.04, 0.01, 0.01, P.tapeDark, [-0.25, 0.755, Z + 0.009]);
  // crayon squiggles
  const wob = (x0: number, y0: number, col: string) => {
    for (let i = 0; i < 6; i++)
      b.part(new THREE.BoxGeometry(0.02, 0.005, 0.004), col, {
        bone, at: [x0 + i * 0.017, y0 + (i % 2 ? 0.008 : -0.008), Z + 0.003], rotation: [0, 0, i % 2 ? 35 : -35],
      });
  };
  wob(0.1, 0.78, P.robotRed);
  wob(0.1, 0.725, "#3a8fe0");
  wob(-0.19, 0.69 + 0.0, P.paintGreen);
  // shoulder pads
  for (const s of [1, -1]) {
    const m = s > 0 ? M.shoulderL : M.shoulderR;
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 12, 1, false, 0, Math.PI / 2), P.cardboardLight, {
      bone, at: [m[0] + s * 0.0, 1.175, m[2]], rotation: [0, s > 0 ? 0 : 90, 0],
    });
    cyl(0.015, 0.015, 0.02, 8, P.bolt, [m[0] + s * 0.07, 1.2, m[2] + 0.07], [0, 1, 0]);
  }
  // collar
  box(0.46, 0.05, 0.46, P.tape, [M.collar[0], 1.185, M.collar[2]]);
  box(0.47, 0.01, 0.47, P.tapeDark, [M.collar[0], 1.21, M.collar[2]]);
  // side vents
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) box(0.01, 0.025, 0.14, P.cardboardDark, [s * 0.372, 0.63 + i * 0.0 + 0.0 + 0.05 + i * 0.045 - 0.0, -0.02]);
}
    return buildTorsoBox;
  })(),
  // helmet
  (() => {
function buildHelmet({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const R = rng(11);

  // box helper: center, size, color, bone
  const box = (c: number[], s: number[], color: string, bone: any = head) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { bone, at: c });
  const cyl = (c: number[], r: number, h: number, color: string, dir: number[], bone: any = head, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at: c, dir });

  const CX = 0, CY = 1.36, CZ = 0.02, S = 0.44, T = 0.02;
  const top = CY + S / 2, bot = CY - S / 2, front = CZ + S / 2, back = CZ - S / 2;
  const wy = 1.385, ww = 0.26, wh = 0.17;

  // walls
  box([0, top - T / 2, CZ], [S, T, S], P.cardboard);
  box([0, bot + T / 2, CZ], [S, T, S], P.cardboardDark);
  box([0, CY, back + T / 2], [S, S, T], P.cardboard);
  box([S / 2 - T / 2, CY, CZ], [T, S, S], P.cardboard);
  box([-S / 2 + T / 2, CY, CZ], [T, S, S], P.cardboard);

  // front face: four slabs around window
  const fz = front - T / 2;
  const wTop = wy + wh / 2, wBot = wy - wh / 2;
  box([0, (top + wTop) / 2, fz], [S, top - wTop, T], P.cardboard);
  box([0, (bot + wBot) / 2, fz], [S, wBot - bot, T], P.cardboard);
  const sideW = (S - ww) / 2;
  for (const s of [1, -1]) box([s * (ww / 2 + sideW / 2), wy, fz], [sideW, wh, T], P.cardboard);

  // tape border around window
  const tz = front + 0.002;
  box([0, wTop + 0.01, tz], [ww + 0.04, 0.02, 0.006], P.tape);
  box([0, wBot - 0.01, tz], [ww + 0.04, 0.02, 0.006], P.tape);
  for (const s of [1, -1]) box([s * (ww / 2 + 0.01), wy, tz], [0.02, wh, 0.006], P.tape);

  // edge strips (light) along top edges
  box([0, top + 0.005, front - 0.005], [S, 0.012, 0.03], P.cardboardLight);
  box([0, top + 0.005, back + 0.005], [S, 0.012, 0.03], P.cardboardLight);
  for (const s of [1, -1]) {
    box([s * (S / 2 - 0.005), top + 0.005, CZ], [0.03, 0.012, S], P.cardboardLight);
    // fluting on front vertical edges
    for (let i = 0; i < 8; i++) {
      const y = bot + 0.03 + i * ((S - 0.06) / 7);
      cyl([s * (S / 2 - 0.004), y, front + 0.003], 0.012, 0.03, P.fluting, [1, 0, 0], head, 6);
    }
    // bolt studs on sides
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.bolt, { bone: head, at: [s * (S / 2 + 0.004), CY - 0.1, CZ - 0.05] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.bolt, { bone: head, at: [s * (S / 2 + 0.004), CY + 0.1, CZ - 0.05] });
  }
  // bottom edge light strip
  box([0, bot + 0.008, front + 0.002], [S, 0.016, 0.006], P.cardboardLight);

  // kid's head
  b.part(new THREE.SphereGeometry(0.105, 14, 10), P.skin, { bone: head, at: [0, 1.35, 0.06] });
  const hz = 0.06 + 0.105; // face front approx
  // eyes
  for (const s of [1, -1]) {
    const ex = s * 0.045, ey = 1.385, ez = 0.158;
    const faceDir = [0, 0, 1];
    b.part(new THREE.CircleGeometry(0.035, 14), P.eyeWhite, { bone: head, at: [ex, ey, ez], dir: faceDir, axis: "z" });
    b.part(new THREE.CircleGeometry(0.02, 12), P.iris, { bone: head, at: [ex, ey, ez + 0.002], dir: faceDir, axis: "z" });
    b.part(new THREE.CircleGeometry(0.012, 10), P.ink, { bone: head, at: [ex, ey, ez + 0.004], dir: faceDir, axis: "z" });
    b.part(new THREE.CircleGeometry(0.006, 6), "#ffffff", { bone: head, at: [ex + 0.008, ey + 0.008, ez + 0.006], dir: faceDir, axis: "z" });
    b.part(new THREE.CircleGeometry(0.018, 10), P.blush, { bone: head, at: [s * 0.08, 1.345, 0.146], dir: [s * 0.4, 0, 1], axis: "z" });
    // eyebrow
    box([ex, ey + 0.045, 0.157], [0.04, 0.008, 0.006], P.hair);
  }
  // nose
  b.part(new THREE.SphereGeometry(0.008, 6, 4), P.ink, { bone: head, at: [0, 1.348, 0.163] });
  // mouth: upper lip on head, lower lip on jaw
  box([0, 1.322, 0.16], [0.045, 0.008, 0.01], P.blush, head);
  box([0, 1.31, 0.158], [0.04, 0.008, 0.01], P.blush, jaw);

  // fringe of hair tufts along window top
  const tuft = [[0, 0], [0.05, 0], [0.025, -0.04]] as any;
  for (let i = 0; i < 6; i++) {
    const x = -0.11 + i * 0.044;
    const h = 0.035 + R() * 0.02;
    const shape = [[-0.022, 0], [0.022, 0], [0, -h]] as any;
    b.extrude(shape, { at: [x, 1.455, 0.158 + (i % 2) * 0.004], x: [1, 0, 0], thickness: 0.012, color: P.hair, bone: head });
  }
  box([0, 1.463, 0.14], [0.25, 0.02, 0.05], P.hair);
  // back tuft
  for (let i = 0; i < 3; i++) {
    b.extrude([[-0.02, 0], [0.02, 0], [0, -0.05]] as any, {
      at: [-0.04 + i * 0.04, bot + 0.01, back - 0.004], x: [1, 0, 0], thickness: 0.015, color: P.hair, bone: head,
    });
  }

  // antenna
  b.rod([0.1, top, -0.02], [0.1, 1.84 - 0.035, -0.02], 0.008, P.bolt, { bone: head });
  b.part(new THREE.SphereGeometry(0.035, 10, 8), P.robotRed, { bone: head, at: [0.1, 1.84 - 0.025, -0.02] });
  cyl([0.1, top + 0.008, -0.02], 0.02, 0.016, P.tapeDark, [0, 1, 0]);

  // crossed tape X on right side (x negative)
  const rx = -S / 2 - 0.003;
  for (const a of [40, -40]) {
    b.part(new THREE.BoxGeometry(0.005, 0.2, 0.035), P.tape, {
      bone: head, at: [rx, CY + 0.02, CZ + 0.02], rotation: [a, 0, 0],
    });
  }
  // yellow gauge sticker on left side
  const lx = S / 2 + 0.003;
  cyl([lx, CY + 0.02, CZ + 0.02], 0.06, 0.004, P.paintYellow, [1, 0, 0], head, 16);
  cyl([lx + 0.003, CY + 0.02, CZ + 0.02], 0.045, 0.002, P.panelWhite, [1, 0, 0], head, 16);
  b.part(new THREE.BoxGeometry(0.003, 0.04, 0.005), P.ink, {
    bone: head, at: [lx + 0.005, CY + 0.035, CZ + 0.03], rotation: [-30, 0, 0],
  });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), P.ink, { bone: head, at: [lx + 0.005, CY + 0.02, CZ + 0.02] });
  for (let i = 0; i < 7; i++) {
    const a = (-120 + i * 40) * Math.PI / 180;
    b.part(new THREE.BoxGeometry(0.003, 0.008, 0.003), P.ink, {
      bone: head, at: [lx + 0.005, CY + 0.02 + Math.cos(a) * 0.04, CZ + 0.02 + Math.sin(a) * 0.04],
    });
  }
}
    return buildHelmet;
  })(),
  // arms
  (() => {
function buildArms({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const jointOf = (s: number) => (s > 0 ? { sh: J.shoulderL, el: J.elbowL, wr: J.wristL } : { sh: J.shoulderR, el: J.elbowR, wr: J.wristR });
  const v = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  for (const s of [1, -1]) {
    const { sh, el, wr } = jointOf(s);
    const S = [s * 0.36, 1.13, 0];
    const E = [s * 0.52, 0.92, 0.07];
    const W = [s * 0.55, 0.73, 0.17];

    // upper arm and forearm tubes
    b.rod(S, E, 0.075, P.cardboard, { bone: sh, sides: 10 });
    b.rod(E, W, 0.065, P.cardboard, { bone: el, sides: 10 });
    // joints caps
    b.part(new THREE.SphereGeometry(0.078, 10, 8), P.cardboardDark, { bone: sh, at: S });
    b.part(new THREE.SphereGeometry(0.07, 10, 8), P.cardboardDark, { bone: el, at: E });
    // shoulder stud
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 8), P.bolt, {
      bone: sh, at: [s * 0.4, 1.2, 0], dir: [s * 0.4, 1, 0.1],
    });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 6), P.tapeDark, {
      bone: sh, at: [s * 0.4, 1.205, 0], dir: [s * 0.4, 1, 0.1],
    });

    // tape rings
    const ring = (a: number[], b2: number[], t: number, r: number, bone: any, col: string, h: number) => {
      const p = v(a).lerp(v(b2), t);
      const d = v(b2).sub(v(a)).normalize();
      b.part(new THREE.CylinderGeometry(r, r, h, 12), col, { bone, at: p, dir: d });
    };
    ring(E, W, 0.0, 0.069, el, P.tape, 0.03);
    ring(E, W, 0.0, 0.0705, el, P.tapeDark, 0.006);
    ring(E, W, 0.93, 0.07, el, P.tape, 0.035);
    ring(E, W, 0.93, 0.0715, el, P.tapeDark, 0.006);

    // corrugation strip outer edge
    for (const [A, B, bone, r] of [[S, E, sh, 0.075], [E, W, el, 0.065]] as const) {
      const a = v(A), c = v(B);
      const o = new THREE.Vector3(s, 0, 0);
      b.rod(a.clone().addScaledVector(o, r * 0.97).add(new THREE.Vector3(0, 0, 0)).lerp(c, 0.1).addScaledVector(o, 0.0),
        c.clone().addScaledVector(o, r * 0.97).lerp(a, 0.1), 0.009, P.fluting, { bone, sides: 6 });
    }
    // fluting ribs: tiny rings on the strip
    for (let i = 0; i < 4; i++) {
      const p = v(S).lerp(v(E), 0.18 + i * 0.2);
      b.part(new THREE.BoxGeometry(0.014, 0.02, 0.014), P.cardboardDark, { bone: sh, at: [p.x + s * 0.074, p.y, p.z] });
    }

    // mitt
    const mp = [s * 0.556, 0.675, 0.19];
    b.part(new THREE.SphereGeometry(0.095, 10, 8), P.cardboardLight, { bone: wr, at: mp, scale: [0.9, 1.0, 0.85] });
    // thumb nub on inner side
    b.part(new THREE.SphereGeometry(0.03, 8, 6), P.cardboard, { bone: wr, at: [s * 0.49, 0.69, 0.21], scale: [1, 1.4, 0.9] });
    // worn fingertip patch
    b.part(new THREE.SphereGeometry(0.04, 8, 6), P.cardboardDark, { bone: wr, at: [s * 0.565, 0.6, 0.215], scale: [1, 0.5, 0.9] });
    // knuckle lines
    for (const dx of [-0.02, 0.02]) {
      b.part(new THREE.BoxGeometry(0.004, 0.035, 0.004), P.ink, { bone: wr, at: [s * 0.556 + dx, 0.615, 0.262], rotation: [-20, 0, 0] });
    }
    // small mitt seam
    b.part(new THREE.BoxGeometry(0.1, 0.006, 0.006), P.cardboardDark, { bone: wr, at: [s * 0.556, 0.7, 0.268] });
  }

  // left forearm power meter sticker (outer-front side)
  {
    const wr = J.elbowL;
    const p = v([0.535, 0.83, 0.12]);
    const d: [number, number, number] = [0.15, 0.1, 1];
    b.part(new THREE.BoxGeometry(0.07, 0.05, 0.006), P.paintYellow, { bone: wr, at: [p.x, p.y, p.z + 0.066], rotation: [-15, 0, 0] });
    b.part(new THREE.BoxGeometry(0.074, 0.054, 0.004), P.ink, { bone: wr, at: [p.x, p.y, p.z + 0.064], rotation: [-15, 0, 0] });
    const f = frame([p.x, p.y, p.z + 0.07], [0, 0.26, 1]);
    for (let i = 0; i < 5; i++) {
      const a = (-60 + i * 30) * Math.PI / 180;
      b.part(new THREE.BoxGeometry(0.003, 0.012, 0.003), P.ink, {
        bone: wr, at: [p.x + Math.sin(a) * 0.026, p.y + 0.004 + Math.cos(a) * 0.014 - 0.01, p.z + 0.073 - 0.01 * 0.2],
        rotation: [-15, 0, -a * 180 / Math.PI],
      });
    }
    b.part(new THREE.BoxGeometry(0.004, 0.028, 0.003), P.robotRed, { bone: wr, at: [p.x + 0.004, p.y - 0.006, p.z + 0.076], rotation: [-15, 0, -25] });
    void f; void d;
  }

  // right upper arm red stripe ring
  {
    const A = v([-0.36, 1.13, 0]), B = v([-0.52, 0.92, 0.07]);
    const p = A.clone().lerp(B, 0.5);
    const dir = B.clone().sub(A).normalize();
    b.part(new THREE.CylinderGeometry(0.0775, 0.0775, 0.035, 12), P.robotRed, { bone: J.shoulderR, at: p, dir });
  }
  // right forearm repair patch
  {
    const p = [-0.545, 0.82, 0.21];
    b.part(new THREE.BoxGeometry(0.05, 0.04, 0.005), P.tapeDark, { bone: J.elbowR, at: p, rotation: [-12, 10, 8] });
    b.part(new THREE.BoxGeometry(0.052, 0.006, 0.006), P.tape, { bone: J.elbowR, at: [p[0], p[1], p[2] + 0.002], rotation: [-12, 10, 45] });
    b.part(new THREE.BoxGeometry(0.052, 0.006, 0.006), P.tape, { bone: J.elbowR, at: [p[0], p[1], p[2] + 0.002], rotation: [-12, 10, -45] });
  }
}
    return buildArms;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1: number, r2: number, h: number, n = 10) => new THREE.CylinderGeometry(r1, r2, h, n);

  for (const s of [1, -1]) {
    const hip = s > 0 ? J.hipL : J.hipR;
    const knee = s > 0 ? J.kneeL : J.kneeR;
    const foot = s > 0 ? J.footL : J.footR;
    const x = s * 0.17;

    // Bare thigh (skin) from shorts to knee
    b.part(cyl(0.062, 0.055, 0.2, 10), P.skin, { bone: hip, at: [x, 0.47, 0.01] });
    // Shorts: denim band
    b.part(cyl(0.092, 0.095, 0.12, 12), P.denim, { bone: hip, at: [x, 0.56, 0.005] });
    b.part(cyl(0.097, 0.097, 0.012, 12), P.ink, { bone: hip, at: [x, 0.502, 0.005] });
    // hem seam stitching
    b.part(cyl(0.096, 0.096, 0.006, 12), P.cardboardLight, { bone: hip, at: [x, 0.51, 0.005] });

    // Thigh guards: front and outer side
    b.part(box(0.1, 0.17, 0.014), P.cardboard, { bone: hip, at: [x, 0.4, 0.075] });
    b.part(box(0.1, 0.012, 0.018), P.cardboardLight, { bone: hip, at: [x, 0.486, 0.077] });
    b.part(box(0.1, 0.012, 0.018), P.cardboardLight, { bone: hip, at: [x, 0.318, 0.077] });
    b.part(box(0.014, 0.17, 0.09), P.cardboard, { bone: hip, at: [x + s * 0.065, 0.4, 0.01] });
    b.part(box(0.018, 0.012, 0.09), P.cardboardLight, { bone: hip, at: [x + s * 0.066, 0.486, 0.01] });
    b.part(box(0.018, 0.012, 0.09), P.cardboardLight, { bone: hip, at: [x + s * 0.066, 0.318, 0.01] });
    b.part(box(0.012, 0.15, 0.016), P.fluting, { bone: hip, at: [x, 0.4, 0.084] });

    // Knee: bare skin patch + red disc
    b.part(new THREE.SphereGeometry(0.052, 8, 6), P.skin, { bone: knee, at: [x, 0.33, 0.015] });
    b.part(cyl(0.032, 0.032, 0.01, 12), P.skin, { bone: knee, at: [x, 0.33, 0.062], dir: [0, 0, 1] });
    b.part(cyl(0.0275, 0.0275, 0.008, 14), P.robotRed, { bone: knee, at: [x, 0.33, 0.072], dir: [0, 0, 1] });
    b.part(cyl(0.012, 0.012, 0.004, 8), P.cardboardLight, { bone: knee, at: [x, 0.33, 0.077], dir: [0, 0, 1] });

    // Lower leg (skin) and shin guard
    b.part(cyl(0.05, 0.042, 0.2, 10), P.skin, { bone: knee, at: [x, 0.2, 0.02] });
    b.part(box(0.115, 0.2, 0.1), P.cardboard, { bone: knee, at: [x, 0.2, 0.022] });
    b.part(box(0.12, 0.014, 0.106), P.cardboardLight, { bone: knee, at: [x, 0.3, 0.022] });
    b.part(box(0.12, 0.014, 0.106), P.cardboardLight, { bone: knee, at: [x, 0.105, 0.022] });
    for (const k of [-1, 0, 1]) {
      b.part(box(0.014, 0.17, 0.014), P.fluting, { bone: knee, at: [x + k * 0.03, 0.2, 0.077] });
    }
    b.part(box(0.1, 0.015, 0.108), P.tape, { bone: knee, at: [x, 0.22, 0.022] });

    // Boot
    b.part(box(0.13, 0.14, 0.22), P.cardboard, { bone: foot, at: [x, 0.095, 0.15] });
    b.part(box(0.134, 0.05, 0.224), P.cardboardDark, { bone: foot, at: [x, 0.04, 0.15] });
    b.part(box(0.15, 0.025, 0.24), P.sole, { bone: foot, at: [x, 0.0125, 0.15] });
    // ankle collar
    b.part(box(0.136, 0.02, 0.1), P.cardboardLight, { bone: foot, at: [x, 0.165, 0.09] });
    // toe cap rounded
    b.part(new THREE.SphereGeometry(0.068, 10, 8), P.cardboardLight, { bone: foot, at: [x, 0.07, 0.235], scale: [1, 0.85, 0.9] });
    // scuff patch
    b.part(box(0.06, 0.004, 0.05), P.tapeDark, { bone: foot, at: [x, 0.136, 0.2] });
    b.part(box(0.04, 0.05, 0.004), P.tapeDark, { bone: foot, at: [x - s * 0.015, 0.075, 0.301] });
    // strap + buckle
    b.part(box(0.138, 0.016, 0.04), P.tape, { bone: foot, at: [x, 0.168, 0.15] });
    b.part(box(0.138, 0.04, 0.012), P.tape, { bone: foot, at: [x, 0.13, 0.215], scale: [1, 0.4, 1] });
    b.part(box(0.03, 0.02, 0.012), P.bolt, { bone: foot, at: [x, 0.172, 0.17] });
    b.part(box(0.014, 0.008, 0.014), P.ink, { bone: foot, at: [x, 0.172, 0.17] });
    // sole stitches
    for (let i = 0; i < 4; i++) {
      b.part(box(0.006, 0.01, 0.006), P.cardboardLight, {
        bone: foot,
        at: [x + s * 0.067, 0.03 + R() * 0.0, 0.07 + i * 0.05],
      });
    }
    // lace-like crayon marks on boot sides
    for (let i = 0; i < 3; i++) {
      b.part(box(0.004, 0.008, 0.03), P.ink, { bone: foot, at: [x + s * 0.066, 0.1 + i * 0.02, 0.12 + (i % 2) * 0.03] });
    }
  }
}
    return buildLegs;
  })(),
  // jetpack
  (() => {
function buildJetpack({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const CZ = -0.355; // pack centre z
  const W = 0.5, H = 0.44, D = 0.17;
  const CY = 0.95;
  const BACK = CZ - D / 2; // -0.44

  const box = (w: number, h: number, d: number, color: string, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  // main pack
  box(W, H, D, P.cardboard, [0, CY, CZ]);
  // top tape border
  box(W + 0.012, 0.045, D + 0.012, P.tape, [0, CY + H / 2 - 0.03, CZ]);
  box(W + 0.016, 0.008, D + 0.016, P.tapeDark, [0, CY + H / 2 - 0.054, CZ]);
  // bottom rim
  box(W + 0.01, 0.025, D + 0.01, P.cardboardDark, [0, CY - H / 2 + 0.012, CZ]);

  // vertical edge strips with fluting
  for (const s of [1, -1]) for (const z of [1, -1]) {
    box(0.03, H - 0.02, 0.03, P.cardboardLight, [s * (W / 2 - 0.004), CY, CZ + z * (D / 2 - 0.004)]);
    for (let i = 0; i < 4; i++)
      box(0.008, H - 0.1, 0.012, P.fluting, [s * (W / 2 - 0.028 - i * 0.012), CY - 0.01, CZ + z * (D / 2 + 0.001)]);
  }

  // back emblem
  const ez = BACK - 0.005;
  const disc = (r: number, color: string, dz: number, seg = 24) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.01, seg), color, { bone, at: [0, CY + 0.04, ez - dz], dir: [0, 0, -1] });
  disc(0.076, P.ink, 0);
  disc(0.07, P.robotBlue, 0.004);
  // star
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    const r = i % 2 ? 0.0225 : 0.05;
    star.push([r * Math.sin(a), r * Math.cos(a)]);
  }
  b.extrude(star, {
    at: [0, CY + 0.04, ez - 0.012], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.008, color: P.paintYellow, bone,
  });
  // back rivets / marker lines
  for (const s of [1, -1]) {
    box(0.1, 0.012, 0.006, P.robotRed, [s * 0.14, CY - 0.1, BACK - 0.003], { rotation: [0, 0, s * 8] });
    box(0.06, 0.01, 0.006, P.paintGreen, [s * 0.15, CY + 0.17, BACK - 0.003]);
    b.part(new THREE.SphereGeometry(0.012, 6, 4), P.bolt, { bone, at: [s * 0.2, CY + 0.15, BACK - 0.004] });
  }

  // nozzles
  for (const s of [1, -1]) {
    const top = new THREE.Vector3(s * 0.16, 0.8, -0.38);
    const dir = new THREE.Vector3(s * 0.22, -1, -0.08).normalize();
    const mid = top.clone().addScaledVector(dir, 0.07);
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.14, 12, 1, true), P.cardboardDark, { bone, at: mid, dir });
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.14, 10), P.ink, { bone, at: mid.clone().addScaledVector(dir, 0.004), dir });
    b.part(new THREE.CylinderGeometry(0.059, 0.059, 0.03, 12), P.tape, { bone, at: top.clone().addScaledVector(dir, 0.015), dir });
    b.part(new THREE.TorusGeometry(0.055, 0.007, 5, 12), P.cardboardLight, {
      bone, at: top.clone().addScaledVector(dir, 0.14), dir, axis: "z",
    });

    // flames
    const end = top.clone().addScaledVector(dir, 0.14);
    const side = new THREE.Vector3(0, 0, 1);
    const flame = (len: number, w: number, color: string, off: number) => {
      const pts: [number, number][] = [
        [-w, 0], [-w * 0.8, -len * 0.45], [-w * 0.5, -len * 0.3], [-w * 0.3, -len * 0.75],
        [0, -len * 0.5], [w * 0.3, -len], [w * 0.5, -len * 0.35], [w * 0.8, -len * 0.5], [w, 0],
      ];
      // shape drawn along local x = world z, y = down-out
      b.extrude(pts, {
        at: end.clone().addScaledVector(dir, 0.0).add(new THREE.Vector3(0, 0, 0)).addScaledVector(side, 0).add(new THREE.Vector3(0, 0, 0)),
        x: [0, 0, 1], y: [s * 0.2, 1, 0], thickness: 0.006 + off, color, bone,
      });
    };
    flame(0.2, 0.05, P.paperOrange, 0.002);
    flame(0.12, 0.028, P.paperYellow, 0.008);
  }

  // fins
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.06, 0], [0, 0.14]], {
      at: [s * (W / 2 + 0.002), CY + H / 2 - 0.02, CZ + 0.03], x: [0, 0, -1], y: [0, 1, 0],
      thickness: 0.012, color: P.cardboardLight, bone,
    });
    box(0.016, 0.1, 0.012, P.fluting, [s * (W / 2 + 0.002), CY + H / 2 + 0.03, CZ + 0.035]);
  }

  // strap loops on sides
  for (const s of [1, -1]) for (const dy of [0.1, -0.1]) {
    box(0.03, 0.05, D + 0.02, P.tape, [s * (W / 2 + 0.004), CY + dy, CZ]);
    box(0.032, 0.008, D + 0.022, P.tapeDark, [s * (W / 2 + 0.005), CY + dy + 0.027, CZ]);
    box(0.03, 0.05, 0.04, P.tape, [s * (W / 2 - 0.02), CY + dy, CZ + D / 2 + 0.005 + 0.0]);
  }

  // tiny crayon stickers
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10), P.paintGreen, { bone, at: [-0.15, CY - 0.02, BACK - 0.002], dir: [0, 0, -1] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 8), P.robotRed, { bone, at: [-0.15, CY - 0.02, BACK - 0.005], dir: [0, 0, -1] });
  for (let i = 0; i < 3; i++)
    box(0.04 + R() * 0.02, 0.006, 0.004, P.cardboardDark, [0.16, CY - 0.17 + i * 0.015, BACK - 0.002]);
}
    return buildJetpack;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "cardboardRobotKid" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.9,0.02], dir: [0,1,0], role: "spine" });
  J["head"] = b.joint("head", { parent: J["body"], at: [0,1.34,0.05], dir: [0,0.98,0.2], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.3,0.1], dir: [0,-0.35,0.94], role: "jaw" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["body"], at: [0.36,1.13,0], dir: [0.62,-0.72,0.32], role: "arm" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.52,0.92,0.07], dir: [0.15,-0.82,0.45], role: "arm" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.55,0.73,0.17], dir: [0.1,-0.6,0.45], role: "arm" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["body"], at: [-0.36,1.13,0], dir: [-0.62,-0.72,0.32], role: "arm" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.52,0.92,0.07], dir: [-0.15,-0.82,0.45], role: "arm" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.55,0.73,0.17], dir: [-0.1,-0.6,0.45], role: "arm" });
  J["hipL"] = b.joint("hipL", { parent: J["body"], at: [0.16,0.6,0], dir: [0.02,-1,0.01], role: "leg" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.17,0.33,0.01], dir: [0,-1,0.05], role: "leg" });
  J["footL"] = b.joint("footL", { parent: J["kneeL"], at: [0.17,0.11,0.04], dir: [0,0,1], role: "leg" });
  J["hipR"] = b.joint("hipR", { parent: J["body"], at: [-0.16,0.6,0], dir: [-0.02,-1,0.01], role: "leg" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.17,0.33,0.01], dir: [0,-1,0.05], role: "leg" });
  J["footR"] = b.joint("footR", { parent: J["kneeR"], at: [-0.17,0.11,0.04], dir: [0,0,1], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
