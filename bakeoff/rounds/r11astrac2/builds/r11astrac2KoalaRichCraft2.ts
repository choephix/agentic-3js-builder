import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  type Joint,
  type Paint,
} from "../../../../src/index";
import {
  pixelArt,
  pixelTexture,
  cellPaint,
  stepped,
} from "../../../../kits/pixel";

export const meta = {
  name: "Eucalyptus Cuddler",
  description:
    "A bright-eyed voxel koala holding a eucalyptus perch, with broad woolly ears, individually articulated gripping digits, papery bark and pixel-cut sage leaves.",
};

export default function build(): THREE.Object3D {
  /*
   * Art-direction changes:
   * 1. Replace the pinched, triangular-looking body and limbs with deliberate
   *    stepped voxel volumes. The silhouette should feel cuddly, not crumpled.
   * 2. Broaden the woolly ears, brighten the eyes, lengthen the charcoal nose,
   *    and replace the tooth-like muzzle with a quiet, wide koala smile.
   * 3. Give the foliage real pixel-cut silhouettes and a little more volume;
   *    preserve the clear space around the face.
   * 4. Lighten the fur and simplify its pixel shading. Add specific bark,
   *    leaf-vein and seed-capsule details rather than more surface noise.
   */
  const b = createBuilder({ name: "Eucalyptus Cuddler", paintSize: 2048 });
  const random = rng(82174);
  const P = 0.012;
  const INK = "#20323f";
  const GREY = ["#84959f", "#9cabb3", "#b3c0c4", "#c6d0cf", "#d6dcda"];
  const CREAM = ["#bac8bd", "#d1daca", "#e4e8d5", "#f3f0dc"];
  const BARK = ["#95816a", "#b29b7b", "#ceb58f", "#e3cda6"];
  const GREEN = ["#416f64", "#598d7c", "#7aa58d", "#a8c3a2"];

  // Skeleton: the koala's rig is independent of the static botanical stand.
  const stand = b.joint("stand", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: stand, at: [0, 0.56, 0], role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 0.56, 0], [0, 0.73, 0], [0, 0.875, 0.012]],
    {
      parent: hips,
      names: ["belly", "chest", "neck"],
      role: "spine",
    },
  );
  const head = b.joint("head", {
    parent: spine.tip!, at: [0, 1.005, 0.025],
    dir: [0, 0, 1], role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 0.914, 0.115],
    dir: [0, 0, 1], role: "jaw",
  });
  const ears = [-1, 1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head, at: [s * 0.258, 1.06, 0.01],
      dir: [s, 0.15, 0], role: "hinge",
    }),
  );

  const limbs = [-1, 1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const armPoints = [
      [s * 0.151, 0.822, 0.012],
      [s * 0.238, 0.755, 0.096],
      [s * 0.298, 0.783, 0.255],
    ];
    const legPoints = [
      [s * 0.125, 0.582, -0.005],
      [s * 0.207, 0.487, 0.073],
      [s * 0.174, 0.45, 0.26],
    ];
    const arm = b.chain(`arm${side}`, armPoints, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const leg = b.chain(`leg${side}`, legPoints, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.174, 0.424, 0.26],
    });
    const fingers = Array.from({ length: 3 }, (_, j) => {
      const x = s * (0.268 + j * 0.029);
      return b.chain(`finger${side}${j + 1}`, [
        [x, 0.796, 0.292],
        [x, 0.773, 0.334],
        [x, 0.727, 0.325],
      ], { parent: arm.tip!, role: "digit", count: 2 });
    });
    const thumb = b.chain(`thumb${side}`, [
      [s * 0.25, 0.787, 0.257],
      [s * 0.228, 0.763, 0.292],
      [s * 0.24, 0.733, 0.307],
    ], { parent: arm.tip!, role: "digit", count: 2 });
    const toes = Array.from({ length: 3 }, (_, j) => {
      const x = s * (0.145 + j * 0.029);
      return b.chain(`toe${side}${j + 1}`, [
        [x, 0.465, 0.291],
        [x, 0.449, 0.337],
        [x, 0.414, 0.322],
      ], { parent: leg.tip!, role: "digit", count: 2 });
    });
    return { s, arm, leg, armPoints, legPoints, fingers, thumb, toes };
  });

  // Face-direction shading is intentionally discrete and restrained.
  const fur = cellPaint(P, (c) => {
    const speck = c.random(19);
    return c.pick(
      GREY,
      0.60 + c.n.y * 0.12 + c.n.z * 0.045 +
      (speck < 0.026 ? 0.16 : speck > 0.985 ? -0.13 : 0),
    );
  });
  const wool = cellPaint(P, (c) =>
    c.pick(CREAM, 0.72 + c.n.y * 0.1 + (c.random(7) > 0.95 ? -0.15 : 0)),
  );
  const muzzle = cellPaint(P, (c) =>
    c.pick(["#bdcbc5", "#d4ded2", "#e4e8d9"], 0.56 + c.n.y * 0.12),
  );
  const bark = cellPaint(P, (c) => {
    const stripe = Math.sin(c.u * 1.45 + Math.floor(c.v / 13) * 0.65);
    return c.pick(BARK, 0.62 + stripe * 0.12 + c.n.y * 0.1);
  });
  const foliage = cellPaint(P / 2, (c) =>
    c.pick(GREEN, 0.54 + c.n.y * 0.12),
  );
  const soil = cellPaint(P, (c) =>
    c.random(16) > 0.985
      ? "#aeb78b"
      : c.pick(["#657655", "#7e8d63", "#96a276"], 0.55 + c.n.y * 0.05),
  );

  const eyeTex = pixelArt([
    "................",
    ".....kkkkkk.....",
    "...kkkkkkkkkk...",
    "..kkkkkkkkkkkk..",
    "..kkwwwwkkkkkk..",
    "..kkwwwwkkkkkk..",
    "..kkwwwkkkkkkk..",
    "..kkkkkkkkkkkk..",
    "..kkkkkkkkkkkk..",
    "..kkkkkkkgggkk..",
    "...kkkkkggwkk...",
    "....kkkkggkk....",
    ".....cccccc.....",
    "................",
    "................",
    "................",
  ], {
    k: INK, w: "#fff9e8", g: "#6e929d", c: "#cbd7d0",
  });

  const earTex = pixelTexture(28, 28, (g) => {
    g.fill((x, y) => {
      const dx = Math.abs(x - 13.5);
      const dy = Math.abs(y - 13.5);
      if (dx > 12 - Math.max(0, dy - 6) * 0.75 || dy > 12) return "";
      if (dx > 8.5 || dy > 9.5) {
        return (x + Math.floor(y / 3)) % 7 === 0 ? "#cbd8ca" : "#ecedda";
      }
      return x < 11 ? "#c7d5c7" : "#dce4cf";
    });
    g.stamp(11, 8, [
      "...ss...",
      "..sss...",
      ".ssss...",
      ".ssss...",
      ".sssss..",
      "..ssss..",
      "...sss..",
      "....ss..",
      ".....s..",
    ], { s: "#9fb6ac" });
  });

  const noseTex = pixelArt([
    "...hhhhhh...",
    "..hhllllhh..",
    ".hhlllllllh.",
    ".hlllllllll.",
    ".llllllllll.",
    ".llllllllll.",
    ".llllllllll.",
    ".llllllllll.",
    ".llllllllll.",
    ".llllllllll.",
    ".llllllllll.",
    "..kllllllk..",
    "..kkkkkkkk..",
    "...kkkkkk...",
    "....kkkk....",
    "............",
  ], { h: "#597381", l: "#293e4c", k: "#1c2e3b" });

  const barkTex = pixelTexture(32, 48, (g) => {
    g.fill((x, y) =>
      (Math.floor(x / 6) + Math.floor(y / 21)) % 4 === 0
        ? "#ddc49e" : "#cbb18b",
    );
    for (let i = 0; i < 7; i++) {
      const x = 2 + Math.floor(random() * 27);
      const y = Math.floor(random() * 28);
      for (let j = 0; j < 10 + i; j++) {
        g.set(x, y + j, "#a98d6d");
        g.set(x + 1, y + j, "#ead8b3");
        g.set(x + 2, y + j, "#ead8b3");
      }
    }
  });

  const endTex = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      const r = Math.max(Math.abs(x - 11.5), Math.abs(y - 11.5));
      return r > 10 ? "#8e795f" :
        Math.floor(r / 2) % 2 ? "#e5cfaa" : "#b99b73";
    });
    g.stamp(10, 10, ["kkk", "kdk", "kkk"], {
      k: "#947555", d: "#ddc49b",
    });
  });

  const leafTex = pixelTexture(12, 40, (g) => {
    g.fill((x, y) => {
      const half = Math.min(4.8, 1 + Math.floor(y / 3), Math.floor((40 - y) / 5));
      if (Math.abs(x - 5.5) > half) return "";
      if (x === 5) return "#c2d4ad";
      if ((y + x * 2) % 11 === 0 && x < 5) return "#a1c1a4";
      return x < 5 ? "#81ad93" : "#578c7b";
    });
  });

  const plaqueTex = pixelTexture(64, 20, (g) => {
    g.fill((x, y) =>
      x < 1 || x > 62 || y < 1 || y > 18 ? "#d4c39d" : "#31554d",
    );
    const letters: Record<string, string[]> = {
      K: ["101", "110", "100", "110", "101"],
      O: ["111", "101", "101", "101", "111"],
      A: ["010", "101", "111", "101", "101"],
      L: ["100", "100", "100", "100", "111"],
    };
    [..."KOALA"].forEach((letter, i) =>
      letters[letter].forEach((row, y) =>
        [...row].forEach((ch, x) => {
          if (ch !== "1") return;
          for (let a = 0; a < 2; a++) {
            for (let c = 0; c < 2; c++) {
              g.set(13 + i * 8 + x * 2 + a, 5 + y * 2 + c, "#f0e6c9");
            }
          }
        }),
      ),
    );
  });

  function box(
    name: string,
    at: number[],
    size: [number, number, number],
    color: string | Paint,
    bone: Joint = stand,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, { at, bone, name });
  }

  function image(
    name: string,
    texture: THREE.Texture,
    at: number[],
    width: number,
    height: number,
    bone: Joint = stand,
    direction: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, bone, texture, dir: direction, axis: "z", name,
    });
  }

  // A limb is a series of overlapping, axis-aligned voxel sections.
  // Each section belongs to its named anatomical bone.
  function voxelSegment(
    name: string,
    from: number[],
    to: number[],
    r0: number,
    r1: number,
    bone: Joint,
    count: number,
  ) {
    const a = new THREE.Vector3(...from);
    const z = new THREE.Vector3(...to);
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const p = a.clone().lerp(z, t);
      const r = r0 + (r1 - r0) * t;
      const snap = (v: number) => Math.round(v / P) * P;
      box(name, [snap(p.x), snap(p.y), snap(p.z)], [r * 2, r * 2, r * 2], fur, bone);
    }
  }

  // Bark segments retain their straight, woody axes, without a twisting skin.
  function branch(name: string, points: number[][], radii: number[]) {
    for (let i = 0; i < points.length - 1; i++) {
      b.frustumBox(
        points[i], points[i + 1],
        [radii[i] * 2, radii[i] * 2],
        [radii[i + 1] * 2, radii[i + 1] * 2],
        { color: bark, bone: stand, name: `${name}_${i}` },
      );
    }
  }

  // Compact octagonal forest-floor stage.
  b.part(new THREE.CylinderGeometry(0.49, 0.465, 0.07, 8), "#3b5549", {
    at: [0, 0.035, 0.09], bone: stand, name: "dark_octagonal_base",
  });
  b.part(new THREE.CylinderGeometry(0.47, 0.48, 0.024, 8), soil, {
    at: [0, 0.078, 0.09], bone: stand, name: "moss_floor",
  });
  box("plaque_mount", [0, 0.046, 0.572], [0.264, 0.072, 0.032], "#31554d");
  image("KOALA_label", plaqueTex, [0, 0.046, 0.589], 0.256, 0.08);
  for (const s of [-1, 1]) {
    box("plaque_pin", [s * 0.12, 0.046, 0.592], [0.006, 0.006, 0.004], "#e1d2ac");
  }

  branch("trunk", [
    [0.025, 0.09, 0.25], [0.018, 0.38, 0.247],
    [0.045, 0.64, 0.235], [0.045, 0.805, 0.23],
  ], [0.064, 0.056, 0.045, 0.031]);
  branch("hand_branchL", [
    [0.035, 0.64, 0.235], [0.2, 0.737, 0.252], [0.38, 0.777, 0.25],
  ], [0.039, 0.034, 0.026]);
  branch("hand_branchR", [
    [0.04, 0.67, 0.235], [-0.19, 0.733, 0.25], [-0.37, 0.764, 0.25],
  ], [0.039, 0.032, 0.025]);
  branch("foot_perch", [
    [-0.255, 0.423, 0.25], [0.015, 0.417, 0.254], [0.252, 0.427, 0.25],
  ], [0.03, 0.036, 0.028]);
  for (const s of [-1, 1]) {
    branch(`root${s}`, [
      [0.025, 0.18, 0.25], [s * 0.12, 0.11, 0.22], [s * 0.21, 0.095, 0.15],
    ], [0.041, 0.025, 0.01]);
    image("perch_end_grain", endTex, [s * 0.257, 0.426, 0.25], 0.052, 0.052, stand, [s, 0, 0]);
  }
  image("trunk_end_grain", endTex, [0.045, 0.806, 0.23], 0.059, 0.059, stand, [0, 1, 0]);

  for (let i = 0; i < 5; i++) {
    const x = 0.025 + (i % 2 ? 0.021 : -0.012);
    const y = 0.19 + i * 0.108;
    const z = 0.309 - i * 0.006;
    box("peeling_bark_thickness", [x, y, z - 0.003], [0.025, 0.082, 0.008], "#ddc7a2");
    image("papery_bark_pixels", barkTex, [x, y, z + 0.002], 0.025, 0.082);
  }

  // Plump, carefully stepped torso instead of a tapered cuboid.
  const tiers: [number, number, number, number, number][] = [
    [0.536, 0.216, 0.072, 0.216, -0.012],
    [0.584, 0.288, 0.072, 0.264, -0.012],
    [0.644, 0.336, 0.096, 0.288, -0.006],
    [0.716, 0.336, 0.072, 0.276, 0],
    [0.776, 0.312, 0.072, 0.252, 0.006],
    [0.83, 0.252, 0.06, 0.216, 0.012],
    [0.873, 0.192, 0.05, 0.168, 0.012],
  ];
  for (const [y, w, h, d, z] of tiers) {
    box("soft_voxel_torso_tier", [0, y, z], [w, h, d], fur,
      y < 0.62 ? hips : y < 0.75 ? spine.joints[0] : spine.joints[1]);
  }

  b.extrude(stepped([
    [-3, 3], [-5, 5], [-7, 7], [-8, 8], [-9, 9], [-9, 9],
    [-9, 9], [-9, 9], [-8, 8], [-7, 7], [-5, 5], [-3, 3],
  ], [P, P * 1.5], { rows: true }), {
    at: [0, 0.612, 0.141],
    x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.018, color: wool, bone: spine.joints[0],
    name: "large_cream_belly_and_bib",
  });
  for (const s of [-1, 1]) {
    box("bib_soft_upper_edge", [s * 0.047, 0.822, 0.127],
      [0.036, 0.025, 0.018], wool, spine.joints[1]);
  }

  const headOutline = stepped([
    [-11, 11], [-14, 14], [-16, 16], [-18, 18],
    [-18, 18], [-18, 18], [-18, 18], [-18, 18],
    [-18, 18], [-17, 17], [-16, 16], [-14, 14], [-11, 11],
  ], [P, P * 2], { rows: true });

  b.extrude(headOutline, {
    at: [0, 0.888, 0.025], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.256, color: fur, bone: head, name: "stepped_koala_head",
  });
  b.extrude(stepped([
    [-9, 9], [-12, 12], [-14, 14], [-15, 15], [-15, 15],
    [-15, 15], [-15, 15], [-14, 14], [-12, 12], [-9, 9],
  ], [P, P * 2], { rows: true }), {
    at: [0, 0.916, -0.112], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.062, color: fur, bone: head, name: "rounded_back_of_head",
  });

  for (const s of [-1, 1]) {
    image("bright_pixel_eye", eyeTex, [s * 0.119, 1.042, 0.155], 0.126, 0.126, head);
    box("soft_brow", [s * 0.117, 1.106, 0.155],
      [0.048, 0.008, 0.006], "#d5ded9", head);
    box("cheek_highlight", [s * 0.165, 0.974, 0.157],
      [0.024, 0.012, 0.008], "#d0dad3", head);
    box("cheek_highlight_small", [s * 0.18, 0.962, 0.157],
      [0.012, 0.012, 0.008], "#c4d4cc", head);
    b.extrude(stepped([
      [-2, 2], [-3, 3], [-4, 4], [-4, 4], [-3, 3],
    ], P, { rows: true }), {
      at: [s * 0.165, 0.931, 0.133],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.045, color: fur, bone: head, name: "cheek_fur_step",
    });
  }

  // Broad, shallow muzzle reads as soft fur, not as exposed front teeth.
  b.extrude(stepped([
    [-4, 4], [-6, 6], [-7, 7], [-7, 7], [-6, 6], [-4, 4],
  ], [P, P * 0.75], { rows: true }), {
    at: [0, 0.918, 0.158],
    x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.026, color: muzzle, bone: head, name: "wide_soft_upper_muzzle",
  });
  box("separate_lower_jaw", [0, 0.918, 0.15],
    [0.102, 0.023, 0.044], muzzle, jaw);
  box("philtrum", [0, 0.947, 0.174],
    [0.006, 0.018, 0.004], INK, head);
  box("quiet_smile", [0, 0.936, 0.174],
    [0.042, 0.005, 0.004], INK, head);
  for (const s of [-1, 1]) {
    box("smile_corner", [s * 0.023, 0.94, 0.174],
      [0.005, 0.009, 0.004], INK, head);
  }

  b.extrude(stepped([
    [-2, 2], [-3, 3], [-4, 4], [-4, 4], [-4, 4], [-4, 4],
    [-4, 4], [-4, 4], [-4, 4], [-4, 4], [-3, 3], [-2, 2],
  ], P, { rows: true }), {
    at: [0, 0.95, 0.184],
    x: [1, 0, 0], y: [0, 1, 0], thickness: 0.061,
    color: "#2b404d", bone: head, name: "tall_iconic_koala_nose",
  });
  image("nose_pixel_leather", noseTex, [0, 1.026, 0.216], 0.115, 0.153, head);

  // Slightly wider ears: the cream wool now dominates the ear silhouette.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? -1 : 1;
    const cx = s * 0.287;
    const bone = ears[i];
    b.extrude(stepped([
      [-3, 3], [-5, 5], [-7, 7], [-8, 8], [-9, 9], [-9, 9],
      [-9, 9], [-9, 9], [-8, 8], [-7, 7], [-5, 5], [-3, 3],
    ], [P * 1.14, P * 1.8], { rows: true }), {
      at: [cx, 0.948, 0.006],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.096, color: fur, bone, name: "broad_round_pixel_ear",
    });
    image("ivory_inner_ear", earTex, [cx, 1.078, 0.055], 0.232, 0.232, bone);
    const tufts = [
      [-0.072, 0.087], [-0.043, 0.108], [0.012, 0.116],
      [0.061, 0.097], [0.104, 0.043], [0.106, -0.012],
      [0.083, -0.077], [-0.035, -0.105], [-0.095, -0.055],
    ];
    for (let j = 0; j < tufts.length; j++) {
      const [x, y] = tufts[j];
      box("ear_wool_tuft", [cx + x, 1.078 + y, 0.044],
        [0.024, j % 2 ? 0.024 : 0.032, 0.025],
        j % 3 === 0 ? "#e2e8d7" : "#cbd7cd", bone);
    }
  }

  for (const limb of limbs) {
    const { s, arm, leg, armPoints, legPoints, fingers, thumb, toes } = limb;
    voxelSegment("upper_arm_voxels", armPoints[0], armPoints[1],
      0.064, 0.058, arm.joints[0], 4);
    voxelSegment("forearm_voxels", armPoints[1], armPoints[2],
      0.058, 0.044, arm.joints[1], 5);
    voxelSegment("thigh_voxels", legPoints[0], legPoints[1],
      0.077, 0.066, leg.joints[0], 4);
    voxelSegment("shin_voxels", legPoints[1], legPoints[2],
      0.061, 0.039, leg.joints[1], 5);
    box("hand_back", [s * 0.296, 0.791, 0.281],
      [0.112, 0.061, 0.073], fur, arm.tip!);
    box("hind_paw", [s * 0.174, 0.463, 0.276],
      [0.108, 0.058, 0.083], fur, leg.tip!);
    box("wrist_light_pixel", [s * 0.297, 0.823, 0.282],
      [0.048, 0.008, 0.027], "#d0dbd4", arm.tip!);

    for (const digit of [...fingers, thumb, ...toes]) {
      b.sweep(digit, [0.012, 0.011, 0.009], {
        section: "box", caps: "flat", skin: "rigid",
        color: fur, name: "separated_gripping_digit",
      });
      const tip = digit.at(1);
      const p = tip.at;
      b.frustumBox(tip, [p.x, p.y - 0.013, p.z - 0.007],
        [0.012, 0.01], [0.004, 0.004], {
          color: "#e1dfcd",
          bone: digit.joints[digit.joints.length - 1],
          name: "small_ivory_claw",
        });
    }
  }

  // The tall fork stays beside the ear, never in front of the eyes.
  branch("tall_left_fork", [
    [0.045, 0.74, 0.23], [0.3, 0.87, 0.063],
    [0.445, 1.01, -0.058], [0.474, 1.235, -0.09],
  ], [0.024, 0.019, 0.012, 0.004]);
  branch("right_leaf_branch", [
    [-0.21, 0.737, 0.25], [-0.382, 0.846, 0.095],
    [-0.456, 0.962, 0.008],
  ], [0.017, 0.01, 0.003]);
  branch("rear_leaf_branch", [
    [0.032, 0.62, 0.22], [0.19, 0.87, -0.17], [0.29, 1.055, -0.21],
  ], [0.019, 0.011, 0.004]);

  function eucalyptusLeaf(root: number[], tip: number[], index: number) {
    const r = new THREE.Vector3(...root);
    const t = new THREE.Vector3(...tip);
    const axis = t.clone().sub(r);
    const len = axis.length();
    axis.normalize();
    const across = new THREE.Vector3(1, 0, 0);
    if (Math.abs(axis.dot(across)) > 0.9) across.set(0, 0, 1);
    across.addScaledVector(axis, -across.dot(axis)).normalize();
    const width = index % 3 === 0 ? 0.043 : 0.036;
    const outline = stepped([
      [-1, 1], [-2, 2], [-3, 3], [-3, 3], [-3, 3],
      [-2, 3], [-2, 2], [-1, 2], [-1, 1], [0, 1],
    ], [width / 6, len / 10], { rows: true });
    b.extrude(outline, {
      at: root, x: across, y: axis,
      thickness: 0.006, color: foliage, bone: stand,
      name: "pixel_cut_eucalyptus_leaf",
    });
    const normal = across.clone().cross(axis).normalize();
    const lift = normal.clone().multiplyScalar(0.0035);
    b.rod(r.clone().add(lift), t.clone().add(lift), 0.002, {
      color: "#b5cfaa", section: "box", bone: stand, name: "leaf_mid_rib",
    });
    for (const sign of [-1, 1]) {
      for (let k = 2; k <= 6; k += 2) {
        const a = r.clone().addScaledVector(axis, len * k / 10).add(lift);
        const z = a.clone().addScaledVector(across, sign * width * 0.32)
          .addScaledVector(axis, -len * 0.075);
        b.rod(a, z, 0.0012, {
          color: "#91b69a", section: "box", bone: stand, name: "leaf_side_vein",
        });
      }
    }
  }

  const clusters = [
    { at: [0.471, 1.21, -0.086], ends: [
      [0.404, 1.337, -0.085], [0.558, 1.297, -0.07], [0.574, 1.067, -0.045],
    ] },
    { at: [0.46, 1.125, -0.065], ends: [
      [0.57, 0.982, 0.015], [0.439, 0.959, -0.13],
    ] },
    { at: [0.437, 0.998, -0.052], ends: [
      [0.55, 0.863, 0.015], [0.482, 0.81, -0.012],
    ] },
    { at: [-0.446, 0.943, 0.016], ends: [
      [-0.514, 1.081, -0.035], [-0.57, 0.827, 0.075], [-0.432, 0.769, 0.025],
    ] },
    { at: [-0.385, 0.85, 0.091], ends: [
      [-0.525, 0.739, 0.15], [-0.375, 0.666, 0.09],
    ] },
    { at: [0.285, 1.043, -0.206], ends: [
      [0.362, 1.155, -0.25], [0.389, 0.924, -0.23], [0.25, 0.885, -0.25],
    ] },
  ];
  let leafIndex = 0;
  for (const cluster of clusters) {
    for (const end of cluster.ends) {
      const root = new THREE.Vector3(...cluster.at);
      const dest = new THREE.Vector3(...end);
      const stalkEnd = root.clone().lerp(dest, 0.13);
      b.rod(root, stalkEnd, 0.003, {
        color: "#8b9d7b", bone: stand, section: "box", name: "leaf_petiole",
      });
      eucalyptusLeaf(stalkEnd.toArray(), end, leafIndex++);
    }
  }

  for (const s of [-1, 1]) {
    const x = s > 0 ? 0.431 : -0.409;
    const y = s > 0 ? 0.976 : 0.896;
    const z = s > 0 ? -0.04 : 0.064;
    for (let j = 0; j < 3; j++) {
      const px = x + s * (0.02 + j * 0.015);
      const py = y - 0.02 - j * 0.016;
      b.rod([x, y, z], [px, py, z + 0.009], 0.0025, {
        color: "#899d7b", bone: stand, section: "box", name: "gumnut_stalk",
      });
      box("gumnut", [px, py - 0.008, z + 0.009],
        [0.017, 0.02, 0.017], "#a8b28b");
      box("gumnut_rim", [px, py + 0.003, z + 0.009],
        [0.022, 0.005, 0.022], "#d3cea6");
      box("gumnut_opening", [px, py + 0.006, z + 0.009],
        [0.01, 0.002, 0.01], "#6b775b");
    }
  }

  for (let i = 0; i < 15; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 0.24 + random() * 0.17;
    const x = Math.cos(angle) * radius;
    const z = 0.09 + Math.sin(angle) * radius;
    if (z > 0.39 && Math.abs(x) < 0.18) continue;
    const size = 0.018 + random() * 0.024;
    box("forest_pebble", [x, 0.089 + size * 0.3, z],
      [size * 1.4, size * 0.6, size],
      i % 3 === 0 ? "#abb28f" : i % 3 === 1 ? "#839576" : "#c3bb98");
    if (i % 3 === 0) {
      for (let j = 0; j < 3; j++) {
        const height = 0.035 + j * 0.009;
        box("pixel_moss_sprig", [x + (j - 1) * 0.014, 0.089 + height / 2, z - 0.018],
          [0.012, height, 0.012], j % 2 ? "#76966e" : "#a1b583");
      }
    }
  }

  for (const [x, z, angle] of [
    [-0.24, 0.3, 0.5], [0.3, 0.12, -0.8],
    [-0.18, -0.18, 1.4], [0.16, 0.38, -0.4],
  ]) {
    b.cards([frame([x, 0.091, z], [0, 1, 0])], leafTex, {
      size: [0.037, 0.13], lean: 90, sink: 0,
      flow: [Math.cos(angle), 0, Math.sin(angle)],
      mirror: true, bone: stand, name: "fallen_eucalyptus_leaf",
    });
  }

  return b.root;
}
