import * as THREE from "three";
import { catmull, countershade, createBuilder, limb, mottle, paint, polyline, rng, svg } from "../../../../src/index";

export const meta = {
  name: "lion",
  description:
    "A standing adult male lion: countershaded tawny coat, a two-layer tuft mane, cheek pads, amber eyes, fangs and a rigged skeleton.",
};

// Palette
const TAWNY = "#c58a3d";
const TAWNY_DK = "#86552a";
const BELLY = "#ecd09e";
const MUZZLE = "#f2dfb6";
const PAW = "#5a3a1e";
const DARK = "#2a1a12";
const BROW = "#43260f";
const TEETH = "#f8f3e6";
const MOUTH = "#5c1f1c";
const EAR = "#9b6431";
const TAIL_TIP = "#3a2312";

// Mane tufts: flame-shaped strand bundles, root along the bottom edge.
const MANE_OUTER = `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
<path d="M3 96C0 66 6 44 16 34C16 48 22 56 28 58C26 40 32 20 42 2C42 26 48 42 52 52C58 64 62 80 61 96Z" fill="#4a2a12"/>
<path d="M12 96C10 74 16 60 26 52C28 66 34 74 40 76C40 60 42 46 48 36C50 58 52 76 50 96Z" fill="#7d4c20"/>
<path d="M24 96C24 82 28 74 34 68C36 80 38 88 40 96Z" fill="#b9793a"/>
</svg>`;

const MANE_INNER = `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
<path d="M6 96C4 70 12 50 22 40C22 54 28 62 34 64C32 46 38 28 48 14C48 36 52 52 56 60C60 70 60 84 58 96Z" fill="#2b170b"/>
<path d="M16 96C14 78 20 64 28 56C30 68 36 74 42 76C42 62 44 50 50 42C50 60 50 76 48 96Z" fill="#5a3217"/>
<path d="M26 96C26 84 30 76 36 70C38 82 40 88 42 96Z" fill="#8a5426"/>
</svg>`;

// Tail tuft: dark, fuller bundle.
const TUFT = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<path d="M8 64C2 42 16 26 30 6C34 26 46 30 58 40C62 52 56 64 50 64Z" fill="#2e1a0c"/>
<path d="M18 64C16 48 26 38 34 26C38 40 46 46 52 52C50 58 46 64 42 64Z" fill="#4e2e14"/>
</svg>`;

// Amber eye, drawn onto the skull as a decal.
const EYE = `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="32" cy="20" rx="31" ry="19" fill="#24130a"/>
<ellipse cx="32" cy="20" rx="26" ry="15" fill="#e9a632"/>
<ellipse cx="32" cy="21" rx="9" ry="11" fill="#120a05"/>
<ellipse cx="38" cy="13" rx="3" ry="3" fill="#fff7de"/>
</svg>`;

// Body radii along the spine, from rump (t = 0) to chest (t = 1).
const KT = [0, 0.35, 0.8, 1];
const RX = [0.19, 0.21, 0.2, 0.18];
const RY = [0.225, 0.27, 0.26, 0.24];

function along(t: number, ts: number[], vs: number[]): number {
  for (let i = 0; i < ts.length - 1; i++) {
    if (t <= ts[i + 1]) {
      const k = (t - ts[i]) / (ts[i + 1] - ts[i]);
      return vs[i] + (vs[i + 1] - vs[i]) * k;
    }
  }
  return vs[vs.length - 1];
}

export default function build() {
  const b = createBuilder({ name: "lion" });

  // Paints and textures
  const coat = countershade(mottle(TAWNY, TAWNY_DK, { size: 0.16, contrast: 0.35, seed: 4 }), BELLY);
  const legCoat = paint((p) => (p.y < 0.1 ? PAW : coat));
  const eyeTex = svg(EYE, { size: 256 });
  const maneOuter = svg(MANE_OUTER, { size: 256 });
  const maneInner = svg(MANE_INNER, { size: 256 });
  const tuftTex = svg(TUFT, { size: 128 });

  // Skeleton: hips, spine, neck, head, jaw, tail
  const hips = b.joint("hips", { at: [0, 0.9, -0.42], role: "spine" });

  const spine = b.chain("spine", catmull([[0, 0.9, -0.56], [0, 0.92, -0.22], [0, 0.93, 0.05], [0, 0.94, 0.3]]), {
    parent: hips,
    role: "spine",
    names: ["spine1", "spine2", "spine3"],
  });
  const chest = spine.joints[2];

  const neck = b.chain("neck", catmull([[0, 0.94, 0.3], [0, 1.04, 0.48], [0, 1.14, 0.63]]), {
    parent: chest,
    role: "neck",
    names: ["neck1", "neck2"],
  });

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.2, 0.72],
    aim: [0, 1.2, 1.0],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0, -0.15]),
    aim: head.local([0, 0.3, -0.15]),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([[0, 0.9, -0.56], [0, 0.86, -0.86], [0, 0.66, -1.08], [0, 0.4, -1.18], [0, 0.17, -1.14]]),
    {
      parent: hips,
      role: "tail",
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    },
  );
  const tailTip = tail.tip ?? tail.joints[tail.joints.length - 1];

  // Torso, neck and tail tubes
  b.sweep(spine, (t): [number, number] => [along(t, KT, RX), along(t, KT, RY)], { color: coat });
  b.sweep(neck, (t) => 0.2 - 0.04 * t, { color: coat });
  b.sweep(tail, (t) => 0.06 - 0.035 * t, { color: coat });

  // Tail tuft
  b.part(new THREE.SphereGeometry(0.06, 9, 7), TAIL_TIP, { bone: tailTip });
  b.cards(b.ring(tailTip, { count: 7, radius: 0.04 }).items, tuftTex, {
    size: [0.12, 0.13],
    lean: 30,
    cross: true,
    vary: 0.2,
    rng: rng(21),
  });

  // Legs: front legs are two-bone limbs ending on the floor, hind legs three-bone with a vertical cannon
  for (const sx of [1, -1]) {
    const s = sx > 0 ? "L" : "R";
    const x = sx * 0.2;

    // Front leg, elbow back
    const fore = b.chain(
      `fore${s}`,
      limb([sx * 0.19, 0.8, 0.24], [x, 0.04, 0.37], [0.42, 0.4], [[0, 0, -1]]),
      {
        parent: chest,
        role: "leg",
        names: [`shoulder${s}`, `elbow${s}`, `pawF${s}`],
      },
    );
    b.sweep(fore, (t) => 0.095 - 0.035 * t, { color: legCoat });
    const pawF = fore.tip ?? fore.joints[fore.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.15, 12, 9), coat, { bone: fore.joints[0], scale: [1, 1.15, 1.15] });
    b.part(new THREE.SphereGeometry(0.07, 10, 7), PAW, {
      bone: pawF,
      at: [x, 0.042, 0.37],
      scale: [1.1, 0.6, 1.3],
    });
    for (const dx of [-0.03, 0, 0.03]) {
      b.part(new THREE.SphereGeometry(0.024, 8, 6), DARK, { bone: pawF, at: [x + dx, 0.022, 0.44] });
    }

    // Hind leg, knee forward, hock back
    const hind = b.chain(
      `hind${s}`,
      limb([sx * 0.19, 0.88, -0.44], [x, 0.04, -0.5], [0.42, 0.38, 0.2], [
        [0, 0, 1],
        [0, 0, -1],
      ]),
      {
        parent: hips,
        role: "leg",
        names: [`hip${s}`, `knee${s}`, `hock${s}`, `pawH${s}`],
      },
    );
    b.sweep(hind, (t) => 0.11 - 0.06 * t, { color: legCoat });
    const pawH = hind.tip ?? hind.joints[hind.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.16, 12, 9), coat, { bone: hind.joints[0], scale: [0.95, 1.2, 1.1] });
    b.part(new THREE.SphereGeometry(0.07, 10, 7), PAW, {
      bone: pawH,
      at: [x, 0.042, -0.5],
      scale: [1.1, 0.6, 1.3],
    });
    for (const dx of [-0.03, 0, 0.03]) {
      b.part(new THREE.SphereGeometry(0.024, 8, 6), DARK, { bone: pawH, at: [x + dx, 0.022, -0.43] });
    }
  }

  // Head: skull, blunt muzzle, lower jaw, fangs
  const skull = b.part(new THREE.SphereGeometry(0.19, 16, 12), coat, {
    bone: head,
    scale: [1.04, 0.98, 0.94],
  });

  const snout = b.sweep(
    polyline([head.local([0, 0, -0.03]), head.local([0, 0.14, -0.05])]),
    (t): [number, number] => [0.1 - 0.012 * t, 0.088 - 0.012 * t],
    { bone: head, color: MUZZLE },
  );

  // Lower jaw and mouth interior
  b.part(new THREE.BoxGeometry(0.12, 0.035, 0.22), MUZZLE, { bone: jaw, at: jaw.local([0, 0.11, 0]) });
  b.part(new THREE.BoxGeometry(0.1, 0.008, 0.19), MOUTH, { bone: jaw, at: jaw.local([0, 0.105, 0.0215]) });

  // Fangs: upper ones on the head, lower ones on the jaw
  for (const sx of [1, -1]) {
    b.spike(head.local([sx * 0.05, 0.16, -0.11]), [0, -1, 0], 0.05, 0.012, { bone: head, color: TEETH });
    b.spike(jaw.local([sx * 0.05, 0.15, 0]), [0, 1, 0], 0.035, 0.011, { bone: jaw, color: TEETH });
  }

  // Nose seated on the front of the muzzle
  const noseHit = b.surface(snout).nearest(head.local([0, 0.2, -0.03]));
  b.stick(new THREE.SphereGeometry(0.05, 10, 8).scale(1.25, 0.7, 0.85), DARK, noseHit, { embed: 0.25 });

  // Face features on the skull: eyes, brows, cheek pads, ears
  const skin = b.surface(skull);
  for (const sx of [1, -1]) {
    const eye = skin.around(head).at(sx * 30, 12);
    if (eye) b.decal(skull, eyeTex, { at: eye, size: [0.092, 0.058], mirror: sx > 0 });

    const brow = skin.around(head).at(sx * 24, 34);
    if (brow) b.stick(new THREE.BoxGeometry(0.085, 0.024, 0.045), BROW, brow, { embed: 0.3 });

    const cheek = skin.around(head).at(sx * 40, -15);
    if (cheek) {
      b.stick(new THREE.SphereGeometry(0.062, 10, 8).scale(1, 0.85, 0.7), MUZZLE, cheek, { embed: 0.3 });
    }

    const ear = skin.around(head).at(sx * 52, 62);
    if (ear) b.stick(new THREE.SphereGeometry(0.05, 10, 7).scale(1.1, 0.5, 0.8), EAR, ear, { embed: 0.25 });
  }

  // Mane: two layers around the head, one layer down the neck
  b.cards(b.ring(head, { count: 22, radius: 0.13, tilt: -30 }).items, maneInner, {
    size: [0.14, 0.2],
    lean: 25,
    bend: 25,
    cross: true,
    vary: 0.25,
    rng: rng(5),
  });
  b.cards(b.ring(head, { count: 28, radius: 0.165, tilt: -18 }).items, maneOuter, {
    size: [0.13, 0.23],
    lean: 25,
    bend: 25,
    cross: true,
    vary: 0.25,
    rng: rng(6),
  });
  b.cards(b.ring(neck.joints[1], { count: 16, radius: 0.16, tilt: -40 }).items, maneOuter, {
    size: [0.13, 0.2],
    lean: 30,
    bend: 20,
    cross: true,
    vary: 0.25,
    rng: rng(9),
  });

  // Open the mouth slightly for a snarl
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  return b.root;
}
