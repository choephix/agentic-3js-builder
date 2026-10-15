```ts
import * as THREE from "three";
import {
  createBuilder, catmull, polyline, rng, paint, mix, noise, svg,
} from "agentic-3js-builder";
import type { Joint, Fill, PointInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Bogfang, Keeper of the Drowned Bones",
  description:
    "A monumental swamp troll with hooked ivory tusks, a swept crimson mohawk, ritual warpaint, a beast-skull pauldron and carved bone trophies.",
};

/*
1. Fix the buried shin wraps and partial arm bindings: each wrap follows the
   outer envelope of all underlying muscle meshes, rather than an inner
   intersection loop. Seat the strap rivets directly on the strap.
2. Rebuild the kilt with a flared, two-stage silhouette that clears both
   thighs. Give its waistband a supported pelvic mass and relocate trophies.
3. Replace the noisy leather grain with restrained worn oxhide, preserving
   the much stronger green / crimson / ivory palette.
4. Flatten the cheeks, broaden the chin, sharpen the brows, and place cheek
   warpaint on the actual visible planes. Preserve the readable golden eyes.
5. Strengthen the mohawk's frontal width, shade tusks from aged roots to pale
   tips, and add restrained carved-bone accents rather than more clutter.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Bogfang", paintSize: 2048 });
  const random = rng(72041);

  const C = {
    light: "#79b18e",
    dark: "#214f50",
    crease: "#183e3c",
    lip: "#477b68",
    mouth: "#182c32",
    gum: "#785252",
    ivory: "#ead6a5",
    boneLight: "#ffedbd",
    boneDark: "#a18a59",
    leather: "#302d33",
    leatherEdge: "#79533d",
    wrap: "#aa936d",
    wrapLight: "#d5c497",
    brass: "#ba843a",
    gold: "#e7bb62",
    rust: "#a42d27",
    hair: "#d74a2d",
    hairLight: "#f4843c",
    hairDark: "#622d31",
    ink: "#172d32",
    teal: "#54c7b5",
    water: "#214c48",
  };

  const SKIN = paint((p, n) => {
    const lit = Math.max(0, n.y * 0.55 + n.z * 0.25 + n.x * 0.16);
    let col = mix("#306e66", "#68a586",
      0.27 + lit * 0.64 + noise(p, 0.19, 8) * 0.18);
    if (p.y < 0.48) col = mix(col, "#3b544b", (0.48 - p.y) * 1.4);
    return col;
  });
  const FACE = paint((p, n) =>
    mix("#397b6c", "#85b18c",
      0.25 + Math.max(0, n.y) * 0.36 + noise(p, 0.12, 9) * 0.22),
  );
  const BONE = paint((p, n) =>
    mix("#a28c61", "#f1dfad",
      0.45 + n.y * 0.2 + noise(p, 0.08, 32) * 0.27),
  );
  const TUSK = paint((p, n, s) =>
    mix("#ad925c", "#fff0c7",
      0.26 + s[0] * 0.68 + Math.max(0, n.y) * 0.08 + noise(p, 0.16, 33) * 0.06),
  );
  const LEATHER = paint((p, n) =>
    mix("#352b2b", "#71503a",
      0.16 + noise(p, 0.19, 4) * 0.34 + Math.max(0, n.y) * 0.13),
  );
  const MUD = paint((p, n) =>
    mix("#283735", "#535943",
      noise(p, 0.22, 5) * 0.65 + Math.max(n.y, 0) * 0.2),
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 160 96">
      <path d="M5 48 Q35 7 88 16 Q128 19 155 43 Q132 84 75 82 Q27 78 5 48Z" fill="#142d31"/>
      <path d="M16 48 Q48 27 88 29 Q122 30 143 44 Q123 69 80 69 Q40 67 16 48Z" fill="#e6c681"/>
      <ellipse cx="83" cy="48" rx="25" ry="29" fill="#e88322"/>
      <ellipse cx="83" cy="53" rx="19" ry="22" fill="#ffc94f"/>
      <path d="M83 23 Q70 46 83 76 Q96 46 83 23Z" fill="#192e2e"/>
      <circle cx="73" cy="37" r="7" fill="#fff5c5"/>
      <path d="M11 45 Q63 16 148 40" fill="none" stroke="#183c3b" stroke-width="9"/>
      <path d="M28 74 Q82 90 132 67" fill="none" stroke="#7caf89" stroke-width="4"/>
    </svg>`, { size: 384 },
  );
  const tattooTexture = svg(
    `<svg viewBox="0 0 160 200">
      <g fill="none" stroke="#d9dbaf" stroke-width="13" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M80 12 L120 45 L80 78 L40 45Z"/>
        <path d="M23 77 L51 98 L23 119 M137 77 L109 98 L137 119"/>
        <path d="M80 84 L80 164 M49 130 L80 160 L111 130 M57 167 L80 190 L103 167"/>
      </g>
      <path d="M80 33L94 45L80 58L66 45Z" fill="#a3412c"/>
    </svg>`, { size: 384 },
  );
  const cheekPaintTexture = svg(
    `<svg viewBox="0 0 100 160">
      <path d="M15 10L35 10L42 129L28 151Z M53 8L73 16L82 108L67 139Z"
        fill="#e0dfba"/>
      <path d="M12 23L86 43L83 57L15 40Z" fill="#a3422e"/>
    </svg>`, { size: 256 },
  );
  const clothTexture = svg(
    `<svg viewBox="0 0 240 360">
      <rect width="240" height="360" fill="#753a35"/>
      <path d="M0 12H240 M0 346H240" stroke="#b56b44" stroke-width="14"/>
      <path d="M18 0V360 M222 0V360" stroke="#e2bc76" stroke-width="7"/>
      <path d="M35 0V360 M205 0V360" stroke="#2c393b" stroke-width="9"/>
      <g fill="none" stroke="#ddbc81" stroke-width="9">
        <path d="M120 65 L170 120 L120 177 L70 120Z"/>
        <path d="M120 92 L143 120 L120 147 L97 120Z"/>
        <path d="M80 188L120 229L160 188 M80 226L120 267L160 226"/>
      </g>
      <path d="M120 168V302 M83 289L120 322L157 289" stroke="#202f32" stroke-width="10" fill="none"/>
      <path d="M52 24H188 M52 334H188" stroke="#e2bc76" stroke-width="5" stroke-dasharray="9 10"/>
      <g stroke="#a45b44" stroke-width="3" opacity=".6">
        <path d="M45 8L50 350 M63 0L59 360 M180 0L186 360 M195 0L191 360"/>
      </g>
    </svg>`, { size: 512 },
  );
  const charmTexture = svg(
    `<svg viewBox="0 0 80 160">
      <path d="M40 12V142 M18 34L40 54L62 34 M17 90L40 70L63 90 M19 116L40 136L61 116"
        fill="none" stroke="#734b32" stroke-width="7"/>
      <circle cx="40" cy="70" r="9" fill="#344c48"/>
    </svg>`, { size: 256 },
  );
  const scarTexture = svg(
    `<svg viewBox="0 0 180 100">
      <path d="M14 81L162 13" stroke="#25524d" stroke-width="13"/>
      <path d="M14 76L162 8" stroke="#b4c39a" stroke-width="6"/>
      <g stroke="#b0b68b" stroke-width="5">
        <path d="M43 50L53 75 M70 37L80 62 M98 24L108 49 M125 12L135 37"/>
      </g>
    </svg>`, { size: 256 },
  );
  const runeTexture = svg(
    `<svg viewBox="0 0 120 160">
      <g fill="none" stroke="#72c5a8" stroke-width="8">
        <path d="M60 17L92 50L60 84L28 50Z M60 83V144 M34 112L60 137L86 112"/>
      </g>
      <path d="M60 33L76 50L60 67L44 50Z" fill="#a3e5bd"/>
    </svg>`, { size: 256 },
  );

  // Skeleton first; hands and two-toed feet remain separated for animation.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root, at: [0, 1.24, 0], dir: [0, 1, 0], role: "spine",
  });
  const spine = b.chain("spine", [
    [0, 1.24, 0], [0, 1.59, -0.035], [0, 1.94, -0.07], [0, 2.15, -0.015],
  ], {
    parent: hips, names: ["spine1", "chest", "spineUpper", "neckBase"], role: "spine",
  });
  const neck = b.chain("neck", [[0, 2.12, -0.015], [0, 2.36, 0.105]], {
    parent: spine.joints[2], names: ["neck", "neckTip"], role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.tip!, at: [0, 2.55, 0.14], dir: [0, 0, 1], role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 2.35, 0.13], dir: [0, 0, 1], role: "jaw",
  });
  const H = b.region({ at: head, scale: 1.05, bone: head });
  const hp = (x: number, y: number, z: number) => H.p([x, y, z]);

  const limbs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${side}`, [
      [s * 0.49, 2.02, -0.07],
      [s * 0.99, 1.94, -0.035],
      [s * 1.4, 1.88, 0.005],
    ], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm",
    });
    const hand = b.joint(`hand${side}`, {
      parent: arm.tip!, at: [s * 1.48, 1.865, 0.025],
      dir: [s, -0.05, 0], role: "arm",
    });
    const fingers = [-1, 1].map((f, i) =>
      b.chain(`finger${side}${i + 1}`, [
        [s * 1.59, 1.865, 0.025 + f * 0.105],
        [s * 1.79, 1.85, 0.025 + f * 0.14],
        [s * 1.94, 1.82, 0.025 + f * 0.18],
      ], { parent: hand, role: "digit", count: 2 }),
    );
    const thumb = b.chain(`thumb${side}`, [
      [s * 1.46, 1.81, 0.12],
      [s * 1.53, 1.66, 0.24],
      [s * 1.68, 1.62, 0.29],
    ], { parent: hand, count: 2, role: "digit" });
    const leg = b.chain(`leg${side}`, [
      [s * 0.265, 1.25, 0],
      [s * 0.405, 0.79, 0.11],
      [s * 0.40, 0.34, -0.015],
    ], {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg", contact: [s * 0.40, 0.125, 0.18],
    });
    const foot = b.joint(`foot${side}`, {
      parent: leg.tip!, at: [s * 0.40, 0.255, 0.075], dir: [0, 0, 1], role: "leg",
    });
    const toes = [-1, 1].map((f, i) =>
      b.chain(`toe${side}${i + 1}`, [
        [s * 0.40 + f * 0.105, 0.24, 0.20],
        [s * 0.40 + f * 0.125, 0.225, 0.43],
        [s * 0.40 + f * 0.13, 0.22, 0.51],
      ], { parent: foot, count: 2, role: "digit" }),
    );
    return { s, side, arm, hand, fingers, thumb, leg, foot, toes };
  });

  function ell(
    at: PointInput, size: number[], color: Fill, bone: Joint,
    name: string, rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
      at, scale: size, bone, rotation, flat: true, name,
    });
  }
  function box(
    at: PointInput, size: number[], color: Fill, bone: Joint,
    name: string, rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation, name,
    });
  }
  function rod(
    a: PointInput, c: PointInput, radius: number, color: Fill, bone: Joint, name: string,
  ) {
    return b.rod(a, c, radius, { color, bone, sides: 6, name });
  }
  function ring(
    at: PointInput, radius: number, tube: number, color: Fill, bone: Joint,
    normal: number[] = [0, 0, 1], name = "ring",
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 12), color, {
      at, bone, dir: normal, axis: "z", name,
    });
  }
  function bead(at: PointInput, radius: number, color: Fill, bone: Joint, name = "bead") {
    return b.part(new THREE.IcosahedronGeometry(radius, 0), color, { at, bone, name });
  }
  function cord(points: number[][], radius: number, bone: Joint, name = "trophyCord") {
    return b.sweep(catmull(points), radius, {
      color: C.leatherEdge, bone, sides: 5, name,
    });
  }
  function fang(
    points: PointInput[], radius: number, bone: Joint, name: string, color: Fill = BONE,
  ) {
    return b.sweep(catmull(points), [radius, radius * 0.83, radius * 0.4, 0], {
      color, bone, sides: 7, smooth: false, caps: "flat", name,
    });
  }
  function littleBone(a: number[], c: number[], r: number, bone: Joint, name: string) {
    rod(a, c, r * 0.6, BONE, bone, `${name}shaft`);
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]).normalize();
    const lateral = new THREE.Vector3(d.y, -d.x, 0).normalize().multiplyScalar(r * 0.52);
    for (const p of [a, c]) {
      for (const s of [-1, 1]) {
        bead([p[0] + lateral.x * s, p[1] + lateral.y * s, p[2]],
          r, BONE, bone, `${name}knuckle`);
      }
    }
  }
  function texturedPlane(
    at: PointInput, width: number, height: number, texture: THREE.Texture,
    bone: Joint, name: string, normal: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, bone, dir: normal, axis: "z", texture, name,
    });
  }

  // Sample from outside inward. Overlapping muscle volumes cannot hide a wrap.
  function fittedWrap(
    surface: ReturnType<typeof b.surface>,
    center: THREE.Vector3,
    axis: THREE.Vector3,
    radius: number,
    color: Fill,
    bone: Joint,
    name: string,
  ) {
    const direction = axis.clone().normalize();
    const u = new THREE.Vector3(0, 0, 1);
    u.addScaledVector(direction, -u.dot(direction)).normalize();
    const v = direction.clone().cross(u).normalize();
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI * 2 / 24;
      const radial = u.clone().multiplyScalar(Math.cos(a))
        .addScaledVector(v, Math.sin(a));
      const origin = center.clone().addScaledVector(radial, 0.65);
      const hit = surface.ray(origin, radial.clone().negate());
      if (hit) points.push(hit.at.clone().addScaledVector(radial, radius * 0.58));
    }
    if (points.length >= 12) {
      return b.sweep(polyline(points, { closed: true }), radius, {
        color, bone, sides: 6, caps: "flat", name,
      });
    }
    return null;
  }

  const torso = b.loft([
    { at: [0, 1.17, 0], w: 0.53, h: 0.39 },
    { at: [0, 1.39, -0.015], w: 0.62, h: 0.43 },
    { at: [0, 1.65, -0.04], w: 0.73, h: 0.48 },
    { at: [0, 1.91, -0.065], w: 1.04, h: 0.56 },
    { at: [0, 2.08, -0.035], w: 0.85, h: 0.49 },
    { at: [0, 2.18, 0], w: 0.41, h: 0.36 },
  ], {
    bone: spine, color: SKIN, sides: 8, smooth: false, caps: "flat", name: "taperedTorso",
  });
  ell([0, 1.31, 0], [0.425, 0.23, 0.255], SKIN, hips, "pelvicMass");
  b.sweep(neck, [0.235, 0.205], {
    color: SKIN, sides: 8, smooth: false, name: "powerfulNeck",
  });
  for (const s of [-1, 1]) {
    const pec = ell([s * 0.26, 1.91, 0.165],
      [0.285, 0.17, 0.15], SKIN, spine.joints[1], "pectoral", [0, 0, s * 9]);
    ell([s * 0.24, 2.09, -0.105],
      [0.30, 0.15, 0.23], SKIN, spine.joints[2], "trapezius", [0, 0, -s * 13]);
    ell([s * 0.26, 1.60, -0.02],
      [0.15, 0.26, 0.22], SKIN, spine.joints[0], "latissimus");
    for (let i = 0; i < 2; i++) {
      ell([s * 0.105, 1.70 - i * 0.19, 0.17],
        [0.115, 0.10, 0.07], SKIN, spine.joints[0], "abdominal");
    }
    if (s < 0) {
      b.decal(pec, tattooTexture, {
        at: [-0.26, 1.925, 0.32], dir: [0, 0, 1],
        size: [0.27, 0.28], bone: spine.joints[1],
        lift: 0.003, name: "ivoryPectoralWarpaint",
      });
    } else {
      b.decal(pec, scarTexture, {
        at: [0.26, 1.94, 0.32], dir: [0, 0, 1],
        size: [0.27, 0.13], bone: spine.joints[1], name: "oldChestScar",
      });
    }
  }

  // Broad skull, chiseled cheeks, inward-drooping brows.
  const skull = ell(hp(0, 0.025, -0.035),
    [0.37, 0.35, 0.29], SKIN, head, "broadSkull");
  ell(hp(0, -0.07, 0.17), [0.285, 0.235, 0.18], FACE, head, "upperFace");
  for (const s of [-1, 1]) {
    ell(hp(s * 0.265, -0.075, 0.125),
      [0.10, 0.14, 0.084], FACE, head, "flattenedCheek", [0, s * 12, -s * 19]);
    const cheek = b.extrude([
      [-0.065, 0.055], [0.045, 0.083], [0.081, 0.025],
      [0.045, -0.114], [-0.045, -0.075],
    ], {
      at: hp(s * 0.264, -0.07, 0.226),
      x: [s, 0, -0.38], y: [0, 1, 0], thickness: 0.055,
      color: FACE, bone: head, name: "chiseledCheekPlane",
    });
    ell(hp(s * 0.171, 0.055, 0.252),
      [0.132, 0.087, 0.057], C.dark, head, "deepEyeSocket");
    texturedPlane(hp(s * 0.171, 0.055, 0.306),
      0.211, 0.124, eyeTexture, head, "goldenTrollEye", [s * 0.12, 0, 1]);
    b.sweep([
      hp(s * 0.065, 0.105, 0.292),
      hp(s * 0.19, 0.161, 0.284),
      hp(s * 0.295, 0.145, 0.21),
    ], [0.058, 0.069, 0.043], {
      color: SKIN, bone: head, section: { ngon: 5 }, caps: "flat", name: "scowlingBrow",
    });
    rod(hp(s * 0.115, -0.035, 0.31), hp(s * 0.27, -0.05, 0.28),
      0.011, C.light, head, "lowerLid");
    b.decal(cheek, cheekPaintTexture, {
      at: hp(s * 0.266, -0.089, 0.28),
      dir: [s * 0.35, 0, 1], size: [0.087, 0.135],
      mirror: s < 0, lift: 0.0025, bone: head, name: "cheekWarStripes",
    });
  }
  b.loft([
    { at: hp(0, 0.155, 0.205), w: 0.13, h: 0.12 },
    { at: hp(0, 0.025, 0.33), w: 0.15, h: 0.15 },
    { at: hp(0, -0.115, 0.425), w: 0.19, h: 0.165 },
    { at: hp(0, -0.18, 0.44), w: 0.135, h: 0.115 },
  ], {
    color: FACE, bone: head, sides: 6, smooth: false, caps: "flat", name: "longHookedNose",
  });
  for (const s of [-1, 1]) {
    ell(hp(s * 0.099, -0.13, 0.353),
      [0.078, 0.061, 0.068], SKIN, head, "nostrilWing");
    ell(hp(s * 0.091, -0.161, 0.401),
      [0.037, 0.021, 0.014], C.crease, head, "nostril");
  }
  ell(hp(0, -0.215, 0.255), [0.27, 0.054, 0.11], C.lip, head, "upperLip");
  ell([0, 2.306, 0.40], [0.268, 0.035, 0.11], C.mouth, jaw, "mouthInterior");
  ell([0, 2.245, 0.325], [0.285, 0.128, 0.205], SKIN, jaw, "heavyLowerJaw");
  ell([0, 2.286, 0.435], [0.235, 0.044, 0.075], C.lip, jaw, "lowerLip");
  b.frustumBox([0, 2.21, 0.36], [0, 2.16, 0.385],
    [0.30, 0.19], [0.255, 0.15], {
      color: FACE, bone: jaw, name: "squareChin",
    });

  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.ConeGeometry(0.024, 0.052, 5), BONE, {
        at: [s * (0.047 + i * 0.055), 2.318, 0.473], bone: jaw, name: "smallLowerTooth",
      });
    }
    ell([s * 0.246, 2.29, 0.411], [0.097, 0.062, 0.092], C.gum, jaw, "tuskGum");
    fang([
      [s * 0.245, 2.27, 0.419],
      [s * 0.365, 2.36, 0.56],
      [s * 0.415, 2.55, 0.59],
      [s * 0.395, 2.75, 0.52],
    ], 0.095, jaw, "greatUpturnedTusk", TUSK);
    const ferrule = b.sweep([
      [s * 0.275, 2.295, 0.453], [s * 0.306, 2.312, 0.492],
    ], 0.096, {
      color: C.brass, bone: jaw, sides: 8, caps: "flat", name: "tuskFerrule",
    });
    const stud = b.surface(ferrule).nearest([s * 0.288, 2.301, 0.57]);
    b.stick(new THREE.IcosahedronGeometry(0.019, 0), C.gold, stud, {
      embed: 0.4, bone: jaw, name: "tuskFerruleStud",
    });
  }

  for (const s of [-1, 1]) {
    b.extrude([
      [0, -0.10], [0.20, -0.08], [0.48, 0.22], [0.23, 0.17], [0.02, 0.11],
    ], {
      at: hp(s * 0.29, 0.055, -0.045), x: [s, 0, -0.24], y: [0, 1, 0],
      thickness: 0.075, color: SKIN, bone: head, name: "longSweptEar",
    });
    b.extrude([
      [0.055, -0.052], [0.19, -0.027], [0.382, 0.164],
      [0.20, 0.106], [0.065, 0.075],
    ], {
      at: hp(s * 0.29, 0.055, -0.001), x: [s, 0, -0.24], y: [0, 1, 0],
      thickness: 0.012, color: C.dark, bone: head, name: "earInset",
    });
    rod(hp(s * 0.34, 0.015, 0.003), hp(s * 0.67, 0.20, -0.07),
      0.018, C.light, head, "earRidge");
    ring(hp(s * 0.52, -0.075, -0.07),
      0.075, 0.016, C.brass, head, [0, 0, 1], "earring");
    bead(hp(s * 0.52, -0.151, -0.065), 0.028, C.teal, head, "earringBead");
    fang([
      hp(s * 0.52, -0.17, -0.065), hp(s * 0.54, -0.24, -0.055),
      hp(s * 0.51, -0.32, -0.025), hp(s * 0.48, -0.36, 0),
    ], 0.031, head, "earToothPendant");
  }
  b.decal(skull, scarTexture, {
    at: hp(-0.24, 0.22, 0.18), dir: [-0.25, 0.1, 1],
    size: [0.18, 0.09], roll: -47, name: "templeScar", bone: head,
  });

  // Solid crest first; overlapping locks provide the hand-carved silhouette.
  b.sweep(catmull([
    hp(0, 0.275, 0.16), hp(0, 0.352, -0.015),
    hp(0, 0.30, -0.23), hp(0, 0.16, -0.32),
  ]), (t) => [0.14 - t * 0.035, 0.073], {
    color: C.hairDark, bone: head, sides: 6, caps: "flat", name: "mohawkRoot",
  });
  for (let i = 0; i < 7; i++) {
    const z = 0.18 - i * 0.079;
    const y = 0.282 + Math.sin((i / 7) * Math.PI) * 0.045
      - Math.max(0, i - 4) * 0.038;
    const height = 0.26 + Math.sin((i / 7) * Math.PI) * 0.16;
    b.extrude([
      [-0.07, 0], [0.067, 0.012], [0.115, height * 0.43],
      [0.17, height], [0.027, height * 0.77], [-0.047, height * 0.32],
    ], {
      at: hp(0, y, z), x: [0, 0, -1], y: [0, 1, 0],
      thickness: [0.24, 0.077], color: i % 2 ? C.hair : C.rust,
      bone: head, name: "mohawkBlade",
    });
    for (const s of [-1, 1]) {
      b.slab([
        hp(s * 0.119, y + 0.025, z - 0.01),
        hp(s * 0.042, y + height * 0.91, z - 0.15),
        hp(s * 0.097, y + height * 0.39, z - 0.07),
      ], {
        thickness: 0.008, color: i % 2 ? C.hairLight : C.hair,
        bone: head, name: "mohawkHighlight",
      });
    }
  }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.extrude([
        [-0.055, 0], [0.045, 0.01], [0.10, 0.19],
        [0.04, 0.265], [-0.035, 0.10],
      ], {
        at: hp(s * 0.09, 0.30 - i * 0.018, 0.08 - i * 0.13),
        x: [0, 0, -1], y: [s * 0.29, 1, -0.18],
        thickness: [0.07, 0.022], color: i % 2 ? C.hair : C.rust,
        bone: head, name: "splayedMohawkLock",
      });
    }
    b.sweep(catmull([
      [s * 0.082, 2.19, 0.415], [s * 0.094, 2.075, 0.43],
      [s * 0.10, 1.99, 0.405],
    ]), [0.033, 0.022], {
      color: C.hairDark, bone: jaw, sides: 6, name: "chinBraid",
    });
    for (let k = 0; k < 4; k++) {
      ell([s * 0.092, 2.16 - k * 0.037, 0.43],
        [0.035, 0.024, 0.03], k % 2 ? C.hair : C.rust,
        jaw, "braidKnot", [0, 0, s * 20]);
    }
    b.part(new THREE.CylinderGeometry(0.034, 0.029, 0.046, 7), BONE, {
      at: [s * 0.10, 2.002, 0.409], bone: jaw, name: "braidIvoryTie",
    });
  }

  for (const L of limbs) {
    const { s, side, arm, hand, fingers, thumb, leg, foot, toes } = L;
    const armTube = b.sweep(arm, [0.205, 0.225, 0.16, 0.12], {
      color: SKIN, sides: 8, smooth: false, name: `armSkin${side}`,
    });
    const deltoid = ell([s * 0.57, 2.015, -0.06],
      [0.245, 0.245, 0.255], SKIN, arm.joints[0], "deltoid");
    const bicep = ell([s * 0.82, 1.96, 0.02],
      [0.255, 0.185, 0.18], SKIN, arm.joints[0], "bicep", [0, 0, -s * 8]);
    ell([s * 1.015, 1.945, -0.04],
      [0.145, 0.145, 0.17], SKIN, arm.joints[1], "elbow");
    const forearm = ell([s * 1.205, 1.91, 0.014],
      [0.215, 0.14, 0.145], SKIN, arm.joints[1], "forearm", [0, 0, -s * 8]);
    ell([s * 1.51, 1.865, 0.035],
      [0.185, 0.11, 0.19], SKIN, hand, "hugePalm");

    for (let i = 0; i < fingers.length; i++) {
      const digit = fingers[i];
      b.sweep(digit, [0.074, 0.061, 0.042], {
        color: SKIN, sides: 7, smooth: false, name: "longFinger",
      });
      ell(digit.at(0.55), [0.069, 0.067, 0.071],
        SKIN, digit.joints[1], "fingerKnuckle");
      const f = i === 0 ? -1 : 1;
      ell([s * 1.895, 1.858, 0.025 + f * 0.17],
        [0.066, 0.015, 0.041], C.boneDark, digit.joints[1], "bluntFingerNail");
    }
    b.sweep(thumb, [0.076, 0.062, 0.04], {
      color: SKIN, sides: 7, smooth: false, name: "opposedThumb",
    });
    ell([s * 1.653, 1.66, 0.286],
      [0.048, 0.016, 0.037], C.boneDark, thumb.joints[1], "thumbNail");

    const legTube = b.sweep(leg, [0.235, 0.22, 0.17, 0.115], {
      color: SKIN, sides: 8, smooth: false, name: `legSkin${side}`,
    });
    ell([s * 0.335, 1.05, 0.025],
      [0.225, 0.28, 0.24], SKIN, leg.joints[0], "thigh");
    ell([s * 0.405, 0.79, 0.15],
      [0.175, 0.14, 0.145], FACE, leg.joints[1], "kneecap");
    const calf = ell([s * 0.397, 0.59, -0.03],
      [0.155, 0.23, 0.17], SKIN, leg.joints[1], "calf");
    ell([s * 0.40, 0.255, 0.09],
      [0.24, 0.13, 0.25], SKIN, foot, "broadBareFoot");
    for (let i = 0; i < toes.length; i++) {
      b.sweep(toes[i], [0.102, 0.095, 0.069], {
        color: SKIN, sides: 8, smooth: false, name: "twoToedFootDigit",
      });
      const f = i === 0 ? -1 : 1;
      ell([s * 0.40 + f * 0.129, 0.274, 0.468],
        [0.071, 0.028, 0.081], C.boneDark, toes[i].joints[1], "broadToenail");
    }

    const armSurface = b.surface([armTube, forearm]);
    const cuffParts: NonNullable<ReturnType<typeof fittedWrap>>[] = [];
    for (let k = 0; k < 5; k++) {
      const p = arm.at(0.68 + k * 0.053);
      const band = fittedWrap(armSurface, p.at, p.tangent, 0.022,
        k % 2 ? C.wrap : C.wrapLight, arm.joints[1], "fittedWristWrap");
      if (band) cuffParts.push(band);
    }
    const shinSurface = b.surface([legTube, calf]);
    const shinWraps: NonNullable<ReturnType<typeof fittedWrap>>[] = [];
    for (let k = 0; k < 5; k++) {
      const band = fittedWrap(
        shinSurface,
        new THREE.Vector3(s * 0.4, 0.39 + k * 0.048, 0.015),
        new THREE.Vector3(0, 1, 0),
        0.023, k % 2 ? C.wrap : C.wrapLight,
        leg.joints[1], "fittedShinWrap",
      );
      if (band) shinWraps.push(band);
    }

    if (s > 0) {
      const cuffSurface = b.surface(cuffParts);
      for (let i = 0; i < 3; i++) {
        const y = 1.85 + i * 0.057;
        const a = cuffSurface.ray([1.14, y, 0.6], [0, 0, -1]);
        const c = cuffSurface.ray([1.34, y - 0.025, 0.6], [0, 0, -1]);
        if (a && c) {
          b.frustumBox(
            a.at.clone().add(new THREE.Vector3(0, 0, 0.01)),
            c.at.clone().add(new THREE.Vector3(0, 0, 0.01)),
            [0.043, 0.034], [0.035, 0.029],
            { color: BONE, bone: arm.joints[1], name: "forearmBoneSplint" },
          );
        }
      }
      const front = b.surface(shinWraps);
      const top = front.ray([0.40, 0.59, 0.7], [0, 0, -1]);
      const bottom = front.ray([0.40, 0.395, 0.7], [0, 0, -1]);
      if (top && bottom) {
        littleBone(
          [top.at.x, top.at.y, top.at.z + 0.021],
          [bottom.at.x, bottom.at.y, bottom.at.z + 0.021],
          0.028, leg.joints[1], "shinTrophy",
        );
      }
    } else {
      b.decal(deltoid, tattooTexture, {
        at: [-0.59, 2.035, 0.19], dir: [0, 0, 1],
        size: [0.25, 0.27], roll: -22, bone: arm.joints[0],
        lift: 0.003, name: "shoulderWarpaint",
      });
      const upperSurface = b.surface([armTube, bicep, deltoid]);
      for (let k = 0; k < 2; k++) {
        fittedWrap(
          upperSurface,
          new THREE.Vector3(-0.76 - k * 0.07, 1.975 - k * 0.012, 0),
          new THREE.Vector3(-1, -0.15, 0),
          0.027, C.rust, arm.joints[0], "redArmBinding",
        );
      }
      littleBone([-0.75, 2.015, 0.23], [-0.88, 1.99, 0.22],
        0.027, arm.joints[0], "armBindingBone");
      cord([
        [-0.78, 1.95, 0.22], [-0.78, 1.77, 0.20], [-0.75, 1.66, 0.18],
      ], 0.012, arm.joints[0], "armCharmCord");
      bead([-0.765, 1.73, 0.193], 0.034, C.teal, arm.joints[0], "armCharmBead");
      fang([
        [-0.75, 1.68, 0.18], [-0.74, 1.61, 0.18],
        [-0.73, 1.55, 0.17], [-0.70, 1.52, 0.15],
      ], 0.032, arm.joints[0], "armCharmTooth");
    }
  }

  // A panel is two planar pieces, flaring around the hips before dropping
  // vertically outside the thighs. No polygon spans through a thigh.
  const skirtCount = 12;
  for (let i = 0; i < skirtCount; i++) {
    const a = i / skirtCount * Math.PI * 2 - 0.032;
    const next = (i + 1) / skirtCount * Math.PI * 2 + 0.032;
    const mid = (a + next) / 2;
    const bottomY = 0.975 + (i % 3) * 0.025;
    const polar = (angle: number, x: number, y: number, z: number) =>
      [Math.sin(angle) * x, y, Math.cos(angle) * z];
    const topA = polar(a, 0.425, 1.425, 0.284);
    const topB = polar(next, 0.425, 1.425, 0.284);
    const flareA = polar(a, 0.605, 1.225, 0.345);
    const flareB = polar(next, 0.605, 1.225, 0.345);
    const bottomA = polar(a, 0.64, bottomY + 0.035, 0.355);
    const bottomB = polar(next, 0.64, bottomY + 0.035, 0.355);
    const point = polar(mid, 0.65, bottomY - 0.035, 0.365);
    const color = i % 3 === 0 ? C.leatherEdge : LEATHER;
    b.slab([topA, topB, flareB, flareA], {
      color, thickness: 0.024, bone: hips, name: "kiltHipFlare",
    });
    b.slab([flareA, flareB, bottomB, point, bottomA], {
      color, thickness: 0.024, bone: hips, name: "kiltHangingPanel",
    });
    b.sweep([topA, flareA, bottomA, point, bottomB], 0.008, {
      color: C.wrap, bone: hips, sides: 5, caps: "flat", name: "hidePanelBoundEdge",
    });
    bead(polar(mid, 0.444, 1.397, 0.304),
      0.017, C.brass, hips, "kiltPanelRivet");
  }
  const beltPath = catmull(
    Array.from({ length: 16 }, (_, i) => {
      const a = i / 16 * Math.PI * 2;
      return [Math.sin(a) * 0.427, 1.425, Math.cos(a) * 0.292];
    }), { closed: true },
  );
  b.sweep(beltPath, () => [0.061, 0.027], {
    color: LEATHER, bone: hips, section: "box", name: "wideLeatherBelt",
  });
  for (const y of [1.377, 1.473]) {
    b.sweep(catmull(Array.from({ length: 16 }, (_, i) => {
      const a = i / 16 * Math.PI * 2;
      return [Math.sin(a) * 0.442, y, Math.cos(a) * 0.307];
    }), { closed: true }), 0.008, {
      color: C.wrap, bone: hips, sides: 5, name: "beltStitchEdge",
    });
  }
  b.along(beltPath, 14, (p) =>
    bead([p.at.x * 1.04, p.at.y, p.at.z * 1.07], 0.018, C.brass, hips, "beltStud"),
  );

  b.extrude([
    [-0.175, 0.25], [0.175, 0.25], [0.16, -0.20],
    [0.08, -0.32], [-0.035, -0.35], [-0.155, -0.24],
  ], {
    at: [0, 1.10, 0.391], x: [1, 0, 0], thickness: 0.03,
    color: C.rust, bone: hips, name: "frontRitualTabard",
  });
  texturedPlane([0, 1.075, 0.409], 0.295, 0.48,
    clothTexture, hips, "wovenTabardPattern");
  for (const s of [-1, 1]) {
    cord([
      [s * 0.151, 1.33, 0.413], [s * 0.144, 1.02, 0.415],
      [s * 0.115, 0.84, 0.413],
    ], 0.01, hips, "tabardBoundEdge");
  }
  for (let i = 0; i < 5; i++) {
    const x = -0.10 + i * 0.05;
    rod([x, 0.86, 0.398], [x + 0.008, 0.755 + Math.abs(i - 2) * 0.023, 0.398],
      0.012, C.wrap, hips, "tabardFringe");
    bead([x, 0.81, 0.398], 0.018, C.brass, hips, "fringeBead");
  }

  function smallSkull(at: number[], scale: number, bone: Joint, name: string) {
    const p = (x: number, y: number, z: number) =>
      [at[0] + x * scale, at[1] + y * scale, at[2] + z * scale];
    ell(p(0, 0.025, 0), [0.095 * scale, 0.105 * scale, 0.064 * scale],
      BONE, bone, `${name}cranium`);
    box(p(0, -0.066, 0.025), [0.10 * scale, 0.065 * scale, 0.07 * scale],
      BONE, bone, `${name}maxilla`);
    for (const s of [-1, 1]) {
      ell(p(s * 0.04, 0.015, 0.057), [0.03 * scale, 0.035 * scale, 0.012 * scale],
        C.ink, bone, `${name}eyeSocket`, [0, 0, s * 18]);
      for (let i = 0; i < 2; i++) {
        box(p(s * (0.014 + i * 0.023), -0.103, 0.042),
          [0.017 * scale, 0.034 * scale, 0.026 * scale],
          C.boneLight, bone, `${name}tooth`);
      }
    }
    b.slab([
      p(0, -0.018, 0.073), p(-0.016, -0.045, 0.071), p(0.016, -0.045, 0.071),
    ], { color: C.ink, bone, thickness: 0.005, name: `${name}noseHole` });
  }
  smallSkull([0, 1.43, 0.36], 1.1, hips, "beltSkull");

  const necklace = catmull([
    [-0.26, 2.20, 0.04], [-0.28, 2.075, 0.22], [-0.19, 1.965, 0.30],
    [0, 1.915, 0.33],
    [0.19, 1.965, 0.30], [0.28, 2.075, 0.22], [0.26, 2.20, 0.04],
  ]);
  b.sweep(necklace, 0.025, {
    color: C.leather, bone: spine.joints[1], sides: 6, name: "toothNecklaceCord",
  });
  b.along(necklace, 9, (f) => {
    const p = f.at;
    bead(p, 0.034, C.brass, spine.joints[1], "necklaceSpacer");
    const length = 0.10 + 0.055 * (1 - Math.abs(p.x) / 0.3);
    fang([
      [p.x, p.y - 0.018, p.z + 0.01],
      [p.x * 1.04, p.y - length * 0.45, p.z + 0.035],
      [p.x * 1.07, p.y - length * 0.8, p.z + 0.023],
      [p.x * 1.06, p.y - length, p.z + 0.005],
    ], 0.028, spine.joints[1], "necklaceTooth");
  }, { from: 0.13, to: 0.87 });

  const shoulderL = limbs[0].arm.joints[0];
  const SP = (x: number, y: number, z: number) =>
    [0.63 + (x - 0.61) * 1.10, 2.16 + (y - 2.16) * 1.10, -0.065 + (z + 0.065) * 1.10];

  ell(SP(0.60, 2.14, -0.085), [0.363, 0.143, 0.341],
    LEATHER, shoulderL, "shoulderHidePad");
  b.sweep(catmull([
    SP(0.43, 2.17, 0.14), SP(0.65, 2.23, 0.17), SP(0.86, 2.13, 0.13),
    SP(0.83, 2.05, -0.22), SP(0.58, 2.19, -0.32),
  ]), 0.025, {
    color: C.wrap, bone: shoulderL, sides: 6, name: "pauldronBoundEdge",
  });
  const beastSkull = ell(SP(0.61, 2.235, -0.065), [0.270, 0.209, 0.286],
    BONE, shoulderL, "bogBeastSkull");
  b.frustumBox(SP(0.61, 2.24, 0.09), SP(0.61, 2.12, 0.36),
    [0.297, 0.22], [0.176, 0.121], {
      color: BONE, bone: shoulderL, name: "beastLongMuzzle",
    });
  for (const s of [-1, 1]) {
    ell(SP(0.61 + s * 0.13, 2.265, 0.15),
      [0.080, 0.072, 0.039], C.leather, shoulderL,
      "beastEyeCavity", [0, s * 20, s * 18]);
    rod(SP(0.61 + s * 0.185, 2.30, 0.11), SP(0.61 + s * 0.081, 2.32, 0.20),
      0.031, C.boneLight, shoulderL, "beastBrowRidge");
    fang([
      SP(0.61 + s * 0.17, 2.31, -0.15),
      SP(0.61 + s * 0.28, 2.43, -0.21),
      SP(0.61 + s * 0.32, 2.55, -0.22),
      SP(0.61 + s * 0.30, 2.66, -0.17),
    ], 0.078, shoulderL, "pauldronHorn", TUSK);
    for (let i = 0; i < 3; i++) {
      fang([
        SP(0.61 + s * (0.072 + i * 0.018), 2.12 + i * 0.02, 0.30 - i * 0.055),
        SP(0.61 + s * (0.08 + i * 0.018), 2.075 + i * 0.02, 0.31 - i * 0.055),
        SP(0.61 + s * (0.075 + i * 0.018), 2.04 + i * 0.02, 0.30 - i * 0.055),
        SP(0.61 + s * (0.06 + i * 0.018), 2.02 + i * 0.02, 0.28 - i * 0.055),
      ], 0.023, shoulderL, "beastSkullTooth");
    }
  }
  ell(SP(0.61, 2.15, 0.357), [0.054, 0.039, 0.015],
    C.ink, shoulderL, "beastNasalCavity");
  rod(SP(0.61, 2.39, -0.05), SP(0.61, 2.265, 0.23),
    0.021, C.boneLight, shoulderL, "beastSagittalRidge");
  b.decal(beastSkull, charmTexture, {
    at: SP(0.71, 2.36, 0.10), dir: [0.1, 0.65, 1],
    size: [0.075, 0.12], bone: shoulderL, name: "beastSkullCarving",
  });
  for (let i = 0; i < 3; i++) {
    const x = 0.77 + i * 0.073;
    fang([
      SP(x, 2.19 - i * 0.025, -0.19),
      SP(x + 0.07, 2.13 - i * 0.025, -0.25),
      SP(x + 0.10, 2.01 - i * 0.025, -0.24),
      SP(x + 0.06, 1.94 - i * 0.025, -0.19),
    ], 0.042, shoulderL, "pauldronRib");
  }
  for (const z of [-0.18, -0.09]) {
    b.sweep(catmull([
      SP(0.41, 2.17, z), SP(0.42, 2.35, z),
      SP(0.58, 2.42, z), SP(0.77, 2.35, z), SP(0.84, 2.17, z),
    ]), 0.012, {
      color: C.leatherEdge, bone: shoulderL, sides: 5, name: "skullPauldronLashing",
    });
  }

  const strap = b.sweep(catmull([
    [0.40, 2.19, 0.12], [0.31, 1.98, 0.325],
    [0.18, 1.73, 0.265], [-0.10, 1.47, 0.283],
  ]), () => [0.048, 0.019], {
    color: LEATHER, bone: spine.joints[1], section: "box",
    caps: "flat", name: "flatShoulderStrap",
  });
  const strapSurface = b.surface(strap);
  for (let i = 0; i < 5; i++) {
    const hit = strapSurface.nearest([
      0.30 - i * 0.073, 1.96 - i * 0.112, 0.48,
    ]);
    b.stick(new THREE.CylinderGeometry(0.015, 0.018, 0.011, 7), C.brass, hit, {
      embed: 0.35, bone: spine.joints[1], name: "seatedStrapRivet",
    });
  }

  // Trophies hang in front of, rather than inside, the flared hide.
  for (const s of [-1, 1]) {
    cord([
      [s * 0.35, 1.44, 0.20], [s * 0.49, 1.28, 0.35],
      [s * 0.58, 1.12, 0.40], [s * 0.59, 1.00, 0.405],
    ], 0.014, hips, "visibleBeltFetishCord");
    for (let k = 0; k < 3; k++) {
      bead([s * (0.55 + k * 0.013), 1.18 - k * 0.051, 0.39 + k * 0.009],
        0.029, k === 1 ? C.teal : C.rust, hips, "fetishTradeBead");
    }
    if (s > 0) {
      smallSkull([0.59, 0.956, 0.405], 0.78, hips, "hangingSkull");
    } else {
      littleBone([-0.60, 1.01, 0.415], [-0.58, 0.77, 0.425],
        0.038, hips, "hangingCarvedBone");
      texturedPlane([-0.59, 0.886, 0.451],
        0.047, 0.17, charmTexture, hips, "boneIncisions");
    }
  }
  cord([
    [-0.42, 1.43, -0.02], [-0.65, 1.25, 0.04], [-0.70, 1.13, 0.08],
  ], 0.017, hips, "fetishBundleTie");
  for (let i = 0; i < 3; i++) {
    littleBone(
      [-0.665 - i * 0.043, 1.15 - i * 0.025, 0.08],
      [-0.70 - i * 0.042, 0.94 - i * 0.025, 0.10],
      0.028, hips, "bundleBone",
    );
  }

  for (const hit of b.surface(torso).scatter(14, {
    rng: random, minDist: 0.085,
    filter: (h) => h.n.z < -0.25 && h.at.y > 1.65,
  })) {
    b.stick(new THREE.IcosahedronGeometry(0.026, 0), C.light, hit, {
      embed: 0.4, name: "backWart",
    });
  }

  // Low marsh vignette: no tall scenery competes with the head or shoulder skull.
  b.part(new THREE.CylinderGeometry(1.02, 1.09, 0.13, 14), MUD, {
    at: [0, 0.065, 0.02], scale: [1.08, 1, 0.87],
    bone: root, flat: true, name: "marshIsland",
  });
  const water = b.part(new THREE.CylinderGeometry(1.005, 1.005, 0.016, 14), C.water, {
    at: [0, 0.132, 0.02], scale: [1.08, 1, 0.87],
    bone: root, name: "stillBogWater",
  });
  (water.mesh.material as THREE.MeshStandardMaterial).roughness = 0.28;
  ell([0, 0.112, 0.07], [0.78, 0.055, 0.58], MUD, root, "raisedMudBank");
  for (let i = 0; i < 13; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.73 + random() * 0.18;
    ell([Math.sin(a) * r, 0.15, Math.cos(a) * r * 0.78],
      [0.055 + random() * 0.06, 0.025 + random() * 0.023, 0.047 + random() * 0.045],
      i % 3 === 0 ? "#6a7153" : "#48584a",
      root, "bogPebble", [0, random() * 180, 0]);
  }
  const standingStone = b.part(new THREE.IcosahedronGeometry(1, 0), "#52655b", {
    at: [-0.79, 0.30, -0.40], scale: [0.18, 0.28, 0.15],
    bone: root, rotation: [0, -12, -13], name: "sunkenSpiritStone",
  });
  glow(b.decal(standingStone, runeTexture, {
    at: [-0.79, 0.33, -0.255], dir: [0, 0, 1],
    size: [0.13, 0.21], bone: root, name: "stoneSpiritMark",
  }), 0.55);

  function reedCluster(x: number, z: number, count: number) {
    for (let i = 0; i < count; i++) {
      const dx = (random() - 0.5) * 0.15;
      const dz = (random() - 0.5) * 0.12;
      const height = 0.22 + random() * 0.27;
      const lean = (random() - 0.5) * 0.15;
      b.slab([
        [x + dx - 0.024, 0.14, z + dz],
        [x + dx + 0.022, 0.14, z + dz],
        [x + dx + lean + 0.016, 0.14 + height * 0.66, z + dz - 0.035],
        [x + dx + lean * 1.8, 0.14 + height, z + dz - 0.075],
        [x + dx + lean - 0.013, 0.14 + height * 0.57, z + dz - 0.035],
      ], {
        color: i % 2 ? "#637953" : "#3d6654",
        thickness: 0.006, bone: root, name: "marshSedge",
      });
    }
  }
  reedCluster(0.79, -0.38, 7);
  reedCluster(-0.88, -0.15, 6);
  reedCluster(0.65, 0.55, 4);
  for (let i = 0; i < 3; i++) {
    const x = 0.79 + i * 0.061;
    const z = -0.39 - i * 0.043;
    const h = 0.48 + i * 0.085;
    rod([x, 0.13, z], [x - 0.032, h, z - 0.045],
      0.009, "#68724c", root, "cattailStem");
    b.capsule([x - 0.032, h - 0.025, z - 0.045],
      [x - 0.035, h + 0.10, z - 0.05], 0.026, {
        color: "#624b37", bone: root, sides: 6, name: "cattailHead",
      });
  }
  littleBone([0.60, 0.17, 0.41], [0.83, 0.175, 0.27], 0.036, root, "fallenBogBone");
  for (let i = 0; i < 3; i++) {
    const x = -0.66 - i * 0.07;
    const z = 0.33 - i * 0.035;
    const height = 0.07 + i * 0.017;
    rod([x, 0.14, z], [x, 0.14 + height, z],
      0.012, C.boneDark, root, "fungusStem");
    glow(b.part(
      new THREE.SphereGeometry(1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#7bc9ac", {
        at: [x, 0.14 + height, z],
        scale: [0.045 + i * 0.006, 0.032, 0.045 + i * 0.006],
        bone: root, flat: true, name: "spiritMushroomCap",
      }), 0.6);
  }
  for (let i = 0; i < 3; i++) {
    const points: number[][] = [];
    for (let k = 0; k <= 9; k++) {
      const a = 0.2 + (k / 9) * 2.4;
      points.push([
        -0.50 + Math.cos(a) * (0.16 + i * 0.053),
        0.143,
        0.39 + Math.sin(a) * (0.09 + i * 0.029),
      ]);
    }
    b.sweep(polyline(points), 0.004, {
      color: "#548477", bone: root, sides: 4, caps: "flat", name: "puddleRipple",
    });
  }

  return b.root;
}
```