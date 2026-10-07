import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mottle,
  mix,
  resolve,
  smoothstep,
  svg,
  frame,
  polyline,
} from "../../../../src/index";

export const meta = {
  name: "Koala",
  description:
    "A stylised low-poly koala standing on all fours in a rig-ready rest pose: chunky grey body, big round fluffy ears, a huge leathery nose, cream bib and belly, dark grippy paws with long claws.",
};

export default function build() {
  const b = createBuilder({ name: "koala", paintSize: 1024 });

  // ---------- palette ----------
  const GREY = "#8e8b93";
  const GREY2 = "#aaa7ae";
  const DARK = "#5f5b63";
  const CREAM = "#efe7da";
  const NOSE = "#2a272c";
  const CLAW = "#1b191c";
  const EYE = "#120f10";

  const coat = mottle(GREY, GREY2, { size: 0.06, seed: 2, contrast: 1.2 });
  const fur = paint((p, n) => {
    const base = resolve(coat, p, n);
    const belly = smoothstep(-0.25, -0.6, n.y);
    const bib = smoothstep(0.1, 0.2, p.z) * smoothstep(0.2, 0.55, n.z) * smoothstep(0.42, 0.34, p.y);
    const rump = smoothstep(-0.26, -0.33, p.z) * 0.6;
    return mix(base, CREAM, Math.max(belly, bib, rump));
  });
  const headFur = paint((p, n) => {
    const base = resolve(coat, p, n);
    const chin = smoothstep(0.42, 0.39, p.y) * smoothstep(0.0, 0.5, n.z);
    return mix(base, CREAM, chin);
  });
  const legFur = paint((p, n) => mix(resolve(fur, p, n), DARK, smoothstep(0.2, 0.06, p.y)));
  const noseLeather = mottle(NOSE, "#3d3940", { size: 0.012, seed: 5 });
  const earInner = mottle(CREAM, "#ffffff", { size: 0.02, seed: 8 });

  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 64 C20 52 6 42 9 18 C15 30 19 34 22 30 C19 18 24 8 32 0 C40 8 45 18 42 30 C45 34 49 30 55 18 C58 42 44 52 32 64Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.31, -0.15], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.31, -0.15],
      [0, 0.33, 0.03],
      [0, 0.35, 0.17],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.joint("neck", { parent: "spine2", at: [0, 0.36, 0.18], aim: [0, 0.42, 0.27], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.42, 0.27], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.395, 0.35], dir: [0, -0.3, 1], role: "jaw" });
  b.joint("tail1", { parent: hips, at: [0, 0.31, -0.32], dir: [0, -0.3, -1], role: "tail" });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.31, -0.34], w: 0.14, h: 0.14 },
      { at: [0, 0.32, -0.26], w: 0.3, h: 0.28 },
      { at: [0, 0.33, -0.08], w: 0.33, h: 0.3 },
      { at: [0, 0.34, 0.1], w: 0.3, h: 0.29 },
      { at: [0, 0.37, 0.22], w: 0.2, h: 0.2 },
    ],
    { color: fur, bone: spine, sides: 12, name: "body" },
  );

  // stubby tail
  b.part(new THREE.SphereGeometry(0.035, 8, 6), CREAM, { at: [0, 0.31, -0.335], bone: "tail1", name: "tail" });

  // ---------- head ----------
  const headPart = b.part(new THREE.SphereGeometry(0.12, 14, 10), headFur, {
    at: [0, 0.44, 0.31],
    bone: head,
    scale: [1.18, 0.95, 0.92],
    name: "skull",
  });
  const headSurf = b.surface(headPart);

  // the famous nose
  b.capsule([0, 0.458, 0.428], [0, 0.41, 0.44], [0.031, 0.039], { color: noseLeather, bone: head, sides: 10, name: "nose" });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), "#8a8590", { at: [0.012, 0.455, 0.462], bone: head, scale: [1, 1.6, 0.6], name: "noseShine" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), "#0b0a0b", {
      at: [s * 0.017, 0.405, 0.47],
      bone: head,
      scale: [1.3, 0.7, 0.6],
      name: s > 0 ? "nostrilL" : "nostrilR",
    });
  }

  // lower jaw (separate so the mouth opens)
  b.part(new THREE.SphereGeometry(0.036, 10, 6), "#d8d0c4", {
    at: [0, 0.383, 0.395],
    bone: jaw,
    scale: [1.25, 0.5, 1],
    name: "lowerJaw",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.004, 0.012), "#3a2e30", { at: [0, 0.395, 0.425], bone: head, name: "mouth" });

  // eyes
  for (const s of [1, -1]) {
    const hit = headSurf.ray([s * 0.055, 0.475, 1], [0, 0, -1]);
    if (hit) {
      b.stick(new THREE.SphereGeometry(0.015, 8, 6), EYE, hit, { bone: head, embed: 0.45, name: s > 0 ? "eyeL" : "eyeR" });
      const shine = hit.at.addScaledVector(hit.n, 0.012).add(new THREE.Vector3(s * 0.004, 0.006, 0));
      b.part(new THREE.SphereGeometry(0.0045, 5, 4), "#ffffff", { at: shine, bone: head, name: s > 0 ? "glintL" : "glintR" });
      const brow = hit.at.addScaledVector(hit.n, 0.004).add(new THREE.Vector3(0, 0.022, -0.004));
      b.part(new THREE.BoxGeometry(0.03, 0.006, 0.01), DARK, {
        at: brow,
        bone: head,
        rotation: [0, 0, s * -12],
        name: s > 0 ? "browL" : "browR",
      });
    }
  }

  // ears: big round discs with fluffy rims
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const at: [number, number, number] = [s * 0.128, 0.53, 0.29];
    const dir = new THREE.Vector3(s * 0.4, 0.15, 1).normalize();
    const ear = b.joint(`ear${side}`, { parent: head, at, dir: [s, 0.7, 0] });
    b.part(new THREE.CylinderGeometry(0.075, 0.07, 0.03, 12), fur, { at, dir, bone: ear, name: `earOuter${side}` });
    const inner = new THREE.Vector3(...at).addScaledVector(dir, 0.013);
    b.part(new THREE.CylinderGeometry(0.052, 0.05, 0.012, 12), earInner, { at: inner, dir, bone: ear, name: `earInner${side}` });
    const items = b.ring(frame(at, dir), { count: 12, radius: 0.068 }).items;
    b.cards(items, tuft, {
      size: [0.04, 0.045],
      color: CREAM,
      bone: ear,
      vary: 0.25,
      spin: 15,
      bend: 20,
      flow: dir,
      rng: rng(11 + s),
      name: `earFluff${side}`,
    });
  }

  // cheek fluff
  const cheekHits = headSurf.scatter(26, {
    rng: rng(21),
    minDist: 0.018,
    filter: (h) => Math.abs(h.n.x) > 0.55 && h.at.y < 0.47,
  });
  b.cards(cheekHits, tuft, {
    size: [0.03, 0.038],
    color: CREAM,
    lean: 45,
    bend: 25,
    flow: (f) => [f.at.x > 0 ? 1 : -1, -0.7, -0.3],
    vary: 0.3,
    rng: rng(22),
    name: "cheekFluff",
  });

  // ---------- legs ----------
  const legs: Array<{ side: string; s: number; z: number; parent: string; front: boolean }> = [
    { side: "L", s: 1, z: 0.13, parent: "spine2", front: true },
    { side: "R", s: -1, z: 0.13, parent: "spine2", front: true },
    { side: "L", s: 1, z: -0.17, parent: "hips", front: false },
    { side: "R", s: -1, z: -0.17, parent: "hips", front: false },
  ];
  for (const leg of legs) {
    const x = leg.s * 0.11;
    const n = leg.front
      ? [`shoulder${leg.side}`, `elbow${leg.side}`, `wrist${leg.side}`]
      : [`hip${leg.side}`, `knee${leg.side}`, `ankle${leg.side}`];
    const chain = b.chain(
      leg.front ? `arm${leg.side}` : `leg${leg.side}`,
      polyline([
        [x, 0.3, leg.z],
        [x + leg.s * 0.01, 0.16, leg.z + (leg.front ? -0.01 : 0.015)],
        [x + leg.s * 0.012, 0.04, leg.z + 0.01],
      ]),
      { parent: leg.parent, names: n, role: "leg", contact: [x + leg.s * 0.012, 0, leg.z + 0.03] },
    );
    b.sweep(chain, { radius: [0.058, 0.04], color: legFur, sides: 10, name: `limb${leg.side}${leg.front ? "F" : "H"}` });

    const wrist = n[2];
    const pawAt: [number, number, number] = [x + leg.s * 0.012, 0.026, leg.z + 0.03];
    b.part(new THREE.SphereGeometry(0.047, 10, 6), DARK, {
      at: pawAt,
      bone: wrist,
      scale: [1.05, 0.56, 1.25],
      name: `paw${leg.side}${leg.front ? "F" : "H"}`,
    });
    // toe pads + long claws, spread apart
    const toes = leg.front ? [-0.026, -0.009, 0.009, 0.026] : [-0.022, 0, 0.022];
    toes.forEach((dx, i) => {
      const base: [number, number, number] = [pawAt[0] + dx, 0.03, pawAt[2] + 0.048];
      b.part(new THREE.SphereGeometry(0.011, 6, 4), "#4a464d", {
        at: [base[0], 0.024, base[2] - 0.006],
        bone: wrist,
        name: `toe${leg.side}${leg.front ? "F" : "H"}${i + 1}`,
      });
      b.spike(base, [dx * 6, -0.45, 1], 0.036, 0.0065, {
        color: CLAW,
        bone: wrist,
        sides: 5,
        name: `claw${leg.side}${leg.front ? "F" : "H"}${i + 1}`,
      });
    });
  }

  // ---------- fur tufts on the coat ----------
  const bodySurf = b.surface(body);
  const coatHits = bodySurf.scatter(70, {
    rng: rng(3),
    minDist: 0.035,
    filter: (h) => h.n.y > -0.15,
  });
  b.cards(coatHits, tuft, {
    size: [0.038, 0.045],
    color: fur,
    lean: 62,
    bend: 20,
    flow: [0, -0.25, -1],
    vary: 0.3,
    spin: 20,
    rng: rng(4),
    name: "coatTufts",
  });
  const bibHits = bodySurf.scatter(18, {
    rng: rng(9),
    minDist: 0.025,
    filter: (h) => h.n.z > 0.35 && h.at.y < 0.4 && h.at.z > 0.12,
  });
  b.cards(bibHits, tuft, {
    size: [0.035, 0.04],
    color: CREAM,
    lean: 50,
    bend: 20,
    flow: [0, -1, 0.2],
    vary: 0.3,
    rng: rng(10),
    name: "bibFluff",
  });

  return b.root;
}
