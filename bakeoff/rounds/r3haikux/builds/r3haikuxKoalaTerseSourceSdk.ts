import * as THREE from "three";
import {
  catmull,
  createBuilder,
  interpolate,
  mix,
  mottle,
  noise,
  paint,
  resolve,
  smoothstep,
} from "../../../../src/index";
import type { Hit } from "../../../../src/index";

export const meta = {
  name: "Koala",
  description:
    "A koala sitting in its rest pose: a round grey body with a cream chest, big fluffy ears, a huge dark nose, long claws and a jaw, holding a eucalyptus sprig in its right paw.",
};

// Palette
const FUR = "#9a958c";
const FUR_SHADE = "#6e6962";
const CREAM = "#eee6d5";
const CREAM_SHADE = "#d6cab3";
const NOSE = "#1d1917";
const EYE = "#120f0d";
const CLAW = "#3a342f";
const JAW = "#d3c9b5";
const TWIG = "#6f6b52";
const LEAF = "#8fa596";

// Paints: a mottled grey coat and a cream of the same kind, so the two blend as real fur does.
const fur = mottle(FUR, FUR_SHADE, { size: 0.045, seed: 3, contrast: 1.1 });
const cream = mottle(CREAM, CREAM_SHADE, { size: 0.03, seed: 8 });

/** Grey body with a cream chest and belly; the edge between the two is ragged rather than a line. */
const coat = paint((p, n) => {
  const front = smoothstep(0.15, 0.55, n.z);
  const band = smoothstep(0.12, 0.2, p.y) * (1 - smoothstep(0.33, 0.41, p.y));
  const ragged = noise(p, 0.03, 21) - 0.5;
  const chest = smoothstep(0.45, 0.6, front * band + ragged * 0.7);
  return mix(resolve(fur, p, n), resolve(cream, p, n), chest);
});

/** Grey head with a paler muzzle under the nose. */
const headCoat = paint((p, n) => {
  const muzzle = smoothstep(0.35, 0.8, n.z) * (1 - smoothstep(0.56, 0.6, p.y)) * smoothstep(0.42, 0.5, p.y);
  return mix(resolve(fur, p, n), resolve(cream, p, n), 0.45 * muzzle);
});

export default function koala() {
  const b = createBuilder({ name: "koala", detail: 1, paintSize: 1024 });

  // ---- Skeleton -----------------------------------------------------------------------------
  // A root on the floor; the spine up through hips, waist and chest; neck, head and jaw; a tail stub;
  // and mirrored arms and legs. Arms and legs are chains of two spans plus a tip joint (wrist or ankle).
  b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.13, -0.02],
      [0, 0.25, -0.02],
      [0, 0.36, 0],
      [0, 0.42, 0.02],
    ]),
    { parent: "root", names: ["hips", "waist", "chest"], role: "spine" },
  );
  const neck = b.chain("neck", [
    [0, 0.41, 0.02],
    [0, 0.5, 0.075],
  ], { parent: "chest", names: ["neck"], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.55, 0.08], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.512, 0.115], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.1, -0.13],
      [0, 0.095, -0.155],
    ],
    { parent: "hips", names: ["tail1"], role: "tail" },
  );

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = (v: number) => s * v;

    const arm = b.chain(
      `arm${L}`,
      catmull([
        [x(0.11), 0.35, 0.01],
        [x(0.175), 0.26, 0.05],
        [x(0.15), 0.185, 0.13],
      ]),
      { parent: "chest", names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" },
    );
    const leg = b.chain(
      `leg${L}`,
      catmull([
        [x(0.085), 0.11, -0.005],
        [x(0.13), 0.05, 0.14],
        [x(0.11), 0.03, 0.25],
      ]),
      {
        parent: "hips",
        names: [`hip${L}`, `knee${L}`, `ankle${L}`],
        role: "leg",
        contact: [x(0.11), 0, 0.29],
      },
    );

    b.sweep(arm, [0.046, 0.04, 0.034], { color: fur, sides: 10, name: `arm${L}` });
    b.sweep(leg, [0.07, 0.05, 0.036], { color: fur, sides: 10, name: `leg${L}` });

    // Paws and feet: flattened balls on the tip joints, each with three long dark claws.
    b.part(new THREE.SphereGeometry(0.042, b.segments(14), b.segments(10)), fur, {
      at: [x(0.15), 0.18, 0.15],
      bone: `wrist${L}`,
      scale: [0.95, 0.75, 1.2],
      name: `paw${L}`,
    });
    b.part(new THREE.SphereGeometry(0.058, b.segments(16), b.segments(12)), fur, {
      at: [x(0.11), 0.028, 0.29],
      bone: `ankle${L}`,
      scale: [0.95, 0.5, 1.35],
      name: `foot${L}`,
    });
    for (const dx of [-0.022, 0, 0.022]) {
      b.spike([x(0.15) + dx, 0.166, 0.19], [0, -0.35, 1], 0.034, 0.0065, { color: CLAW, bone: `wrist${L}` });
    }
    for (const dx of [-0.03, 0, 0.03]) {
      b.spike([x(0.11) + dx, 0.024, 0.35], [0, -0.25, 1], 0.03, 0.006, { color: CLAW, bone: `ankle${L}` });
    }
  }

  // ---- Body, neck and tail ------------------------------------------------------------------
  // A pear-shaped body: widest at the waist, narrowing to the shoulders. Elliptical sections: rx is the side,
  // ry the depth.
  const K = [0, 0.35, 0.7, 1];
  const RX = [0.135, 0.15, 0.13, 0.1];
  const RY = [0.125, 0.14, 0.12, 0.1];
  b.sweep(spine, (t: number): [number, number] => [interpolate(K, RX, t), interpolate(K, RY, t)], {
    color: coat,
    sides: 12,
    name: "body",
  });
  b.sweep(neck, 0.072, { color: coat, sides: 10, name: "neck" });
  b.sweep(tail, 0.024, { color: fur, sides: 8, name: "tail" });

  // ---- Head and ears ------------------------------------------------------------------------
  const headAt: [number, number, number] = [0, 0.55, 0.08];
  const head = b.part(new THREE.SphereGeometry(0.1, b.segments(22), b.segments(16)), headCoat, {
    at: headAt,
    bone: "head",
    scale: [1.02, 0.95, 0.98],
    name: "head",
  });

  // Big round ears: flattened discs turned to face forward and out, each with a cream inner disc on the face.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const turn = -25 * s;
    b.part(new THREE.SphereGeometry(0.065, b.segments(18), b.segments(12)), fur, {
      at: [s * 0.085, 0.62, 0.06],
      bone: "head",
      scale: [0.22, 1, 1],
      rotation: [0, turn, 0],
      name: `ear${L}`,
    });
    b.part(new THREE.SphereGeometry(0.042, b.segments(14), b.segments(10)), cream, {
      at: [s * 0.096, 0.62, 0.065],
      bone: "head",
      scale: [0.2, 1, 1],
      rotation: [0, turn, 0],
      name: `earInner${L}`,
    });
  }

  // ---- Face: eyes, nose and lower jaw, seated on the real head surface ----------------------
  const onHead = b.surface(head).around(headAt);
  const spot = (az: number, el: number): Hit => {
    const hit = onHead.at(az, el);
    if (!hit) throw new Error("koala: the head surface was missed");
    return hit;
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const eye = spot(s * 30, 0);
    b.stick(new THREE.SphereGeometry(0.016, b.segments(12), b.segments(10)), EYE, eye, {
      embed: 0.3,
      name: `eye${L}`,
    });
    // A catch-light lifted off the eye's upper edge.
    b.part(new THREE.SphereGeometry(0.0055, 8, 6), "#ffffff", {
      at: eye.moved([0.006, 0.0185, 0]).at,
      bone: "head",
      name: `glint${L}`,
    });
  }

  const nose = new THREE.SphereGeometry(0.034, b.segments(16), b.segments(12));
  nose.scale(1.25, 0.8, 1);
  b.stick(nose, NOSE, spot(0, 30), { embed: 0.3, name: "nose" });

  // The lower jaw rides the jaw joint, so it opens with the mouth.
  const chin = new THREE.SphereGeometry(0.03, b.segments(14), b.segments(10));
  chin.scale(1.3, 0.6, 0.95);
  b.stick(chin, JAW, spot(0, -20), { embed: 0.25, bone: "jaw", name: "lowerJaw" });

  // ---- A eucalyptus sprig held in the right paw ---------------------------------------------
  const wrist = new THREE.Vector3(-0.15, 0.2, 0.19);
  const tip = new THREE.Vector3(-0.1, 0.3, 0.26);
  b.sweep([wrist, tip], 0.0045, { color: TWIG, sides: 6, bone: "wristR", name: "twig" });

  /** A lanceolate leaf outline from `base` along `dir`: six points in one plane, for `slab`. */
  const leaf = (base: THREE.Vector3, dir: [number, number, number], length: number, width: number) => {
    const axis = new THREE.Vector3(...dir).normalize();
    const side = new THREE.Vector3().crossVectors(axis, new THREE.Vector3(0.6, 0.2, 0.8)).normalize();
    const at = (u: number, w: number) =>
      base.clone().addScaledVector(axis, length * u).addScaledVector(side, width * w);
    return [at(0, 0), at(0.3, 0.5), at(0.62, 0.42), at(1, 0), at(0.62, -0.42), at(0.3, -0.5)];
  };
  const onTwig = (t: number) => wrist.clone().lerp(tip, t);
  b.slab(leaf(onTwig(0.4), [-0.7, 0.6, 0.3], 0.075, 0.02), {
    color: LEAF,
    thickness: 0.0015,
    bone: "wristR",
    name: "leafA",
  });
  b.slab(leaf(onTwig(0.75), [0.8, 0.5, 0.25], 0.07, 0.02), {
    color: LEAF,
    thickness: 0.0015,
    bone: "wristR",
    name: "leafB",
  });
  b.slab(leaf(tip.clone(), [0.1, 1, 0.3], 0.08, 0.02), {
    color: LEAF,
    thickness: 0.0015,
    bone: "wristR",
    name: "leafC",
  });

  return b.root;
}
