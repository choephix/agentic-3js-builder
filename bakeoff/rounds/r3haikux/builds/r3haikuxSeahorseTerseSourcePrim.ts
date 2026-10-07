import * as THREE from "three";
import { catmull, createBuilder, gradient, mix, paint, resolve, smoothstep, stripes } from "../../../../src/index";

export const meta = {
  name: "Seahorse",
  description:
    "A stylised seahorse about 20 cm tall: an octagonal trunk banded in gold over a cream front, a tail curled under the body with a coral tip, a head with a coral coronet, cheek spines and turret eyes, a tube snout on a hinged lower jaw, and gradient dorsal and pectoral fins.",
};

const BODY = "#f26b2a";
const RING = "#ffc64a";
const BELLY = "#ffe9b8";
const CORAL = "#c2401c";
const FIN_TIP = "#fff3cf";
const EYE = "#fbf6ea";
const PUPIL = "#1d1510";

export default function seahorse() {
  const b = createBuilder({ name: "seahorse" });

  // One paint for the body: gold rings stacked along the trunk, shading to a cream front where the body faces forward.
  const rings = stripes(BODY, RING, { size: 0.011, axis: [0, 1, 0.15], width: 0.34, wobble: 0.4, seed: 3 });
  const skin = paint((p, n) => mix(resolve(rings, p, n), BELLY, 0.7 * smoothstep(0.15, 0.7, n.z)));

  // Skeleton. The pelvis is the root. The trunk is a 3-joint spine running up to the nape; the head and lower jaw hang
  // off its top; the dorsal fin hangs off the middle; the tail is a 6-joint chain from the pelvis, curled under the belly.
  const pelvis = b.joint("pelvis", { at: [0, 0.062, -0.004] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.062, -0.004],
      [0, 0.096, 0],
      [0, 0.128, 0.01],
      [0, 0.15, 0.016],
    ]),
    { parent: pelvis, role: "spine" },
  );
  const [, spine2, spine3] = spine.spanJoints;

  const head = b.joint("head", { parent: spine3, at: [0, 0.17, 0.024], dir: [0, -0.3, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.014, down: 0.014 }),
    dir: [0, -0.3, 1],
    role: "jaw",
  });
  const dorsal = b.joint("dorsal", { parent: spine2, at: [0, 0.1, -0.014], dir: [0, 0.3, -1], role: "fan" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.064, -0.01],
      [0, 0.046, -0.034],
      [0, 0.024, -0.036],
      [0, 0.013, -0.018],
      [0, 0.009, 0.008],
      [0, 0.017, 0.028],
      [0, 0.034, 0.036],
    ]),
    { parent: pelvis, role: "tail" },
  );

  // Trunk: one faceted octagonal tube, slimmer at the nape.
  b.sweep(spine, [0.015, 0.02, 0.023, 0.0225, 0.013], {
    color: skin,
    section: { ngon: 8 },
    name: "trunk",
  });

  // Tail: tapers from the pelvis to a coral tip that tucks forward under the belly.
  b.sweep(tail, [0.0105, 0.0095, 0.0083, 0.0071, 0.0057, 0.0045], {
    color: gradient(skin, CORAL, [0, 0.012, -0.02], [0, 0.034, 0.036]),
    section: { ngon: 8 },
    name: "tail",
  });

  // Head: a slightly elongated ball in the body paint.
  b.part(new THREE.SphereGeometry(0.022, 12, 9), skin, {
    bone: head,
    scale: [0.94, 1, 1.12],
    name: "head",
  });

  // Turret eyes on the sides of the head: white ball, dark pupil, small glint.
  for (const s of [-1, 1]) {
    const tag = s > 0 ? "L" : "R";
    const onHead = (left: number, up: number, forward: number) => head.local({ left: s * left, up, forward });
    b.part(new THREE.SphereGeometry(0.0085, 10, 8), EYE, {
      at: onHead(0.017, 0.004, 0.006),
      bone: head,
      name: `eye${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0047, 8, 6), PUPIL, {
      at: onHead(0.0235, 0.004, 0.01),
      bone: head,
      name: `pupil${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0014, 6, 4), "#ffffff", {
      at: onHead(0.027, 0.0068, 0.0125),
      bone: head,
      name: `glint${tag}`,
    });
  }

  // Coronet: three coral spikes on top of the head; a cheek spine behind each eye.
  b.spike(head.local({ up: 0.014, back: 0.002 }), [0, 1, -0.35], 0.013, 0.0045, {
    color: CORAL,
    bone: head,
    name: "coronet",
  });
  for (const s of [-1, 1]) {
    b.spike(head.local({ left: s * 0.008, up: 0.014, back: 0.004 }), [s * 0.35, 1, -0.45], 0.012, 0.0034, {
      color: CORAL,
      bone: head,
    });
    b.spike(head.local({ left: s * 0.018, up: -0.002, back: 0.004 }), [s * 0.6, 0.15, -0.8], 0.012, 0.0028, {
      color: CORAL,
      bone: head,
    });
  }

  // Snout: a tube from the head, with a separate lower jaw hinged beneath it so the mouth can open.
  b.capsule(head.local({ forward: 0.012, down: 0.002 }), head.local({ forward: 0.066, down: 0.02 }), [0.0085, 0.0065], {
    color: skin,
    bone: head,
    name: "snout",
  });
  b.capsule(jaw.at, head.local({ forward: 0.06, down: 0.03 }), [0.0055, 0.0042], {
    color: skin,
    bone: jaw,
    name: "lowerJaw",
  });

  // Dorsal fan on the back: a thin sagittal fin with a gradient from body orange to pale tips.
  b.slab(
    [
      [0, 0.08, -0.01],
      [0, 0.116, -0.016],
      [0, 0.13, -0.03],
      [0, 0.128, -0.046],
      [0, 0.112, -0.054],
      [0, 0.096, -0.046],
    ],
    {
      color: gradient(BODY, FIN_TIP, [0, 0.08, -0.012], [0, 0.128, -0.04]),
      thickness: 0.0035,
      bone: dorsal,
      name: "dorsalFin",
    },
  );

  // Pectoral fans on the chest, one each side, each on its own joint.
  for (const s of [-1, 1]) {
    const side = s > 0 ? "L" : "R";
    const fin = b.joint(`fin${side}`, {
      parent: spine3,
      at: [s * 0.018, 0.124, 0.004],
      dir: [s, 0.2, -0.3],
      role: "fan",
    });
    b.slab(
      [
        [s * 0.016, 0.126, 0.008],
        [s * 0.04, 0.134, 0],
        [s * 0.06, 0.13, -0.014],
        [s * 0.05, 0.12, -0.022],
        [s * 0.022, 0.118, -0.008],
      ],
      {
        color: gradient(BODY, FIN_TIP, [s * 0.02, 0.124, 0.004], [s * 0.056, 0.13, -0.014]),
        thickness: 0.0026,
        bone: fin,
        name: `pectoralFin${side}`,
      },
    );
  }

  return b.root;
}
