```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  type Joint,
  type Paint,
} from "agentic-3js-builder";
import {
  pixelArt,
  pixelTexture,
  tileBox,
  cellPaint,
  stepped,
  pick,
  bayer,
} from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Eucalyptus Cuddler",
  description:
    "A chunky pixel-art koala hugging a forked eucalyptus stand, with woolly stepped ears, articulated gripping paws, papery bark and blue-green leaves.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Eucalyptus Cuddler", paintSize: 2048 });
  const random = rng(82174);
  const P = 0.012;
  const GREY = ["#545e68", "#6d7880", "#879298", "#a3adb0", "#bdc5c3"];
  const CREAM = ["#a5aaa5", "#c5c8bc", "#e0dfce", "#f2ecd8"];
  const BARK = ["#71695b", "#958875", "#b3a38a", "#cbbb9d", "#e0cfad"];
  const GREEN = ["#244b48", "#38665c", "#518674", "#76a38a", "#a5bba0"];
  const DARK = "#29333c";
  const INK = "#172631";
  const CLAW = "#e7dfc9";

  // All articulation is established before the puppet's geometry.
  const stand = b.joint("stand", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: stand, at: [0, 0.56, 0.005], role: "spine",
  });
  const spine = b.chain("spine", [[0, 0.56, 0.005], [0, 0.73, 0], [0, 0.87, 0.015]], {
    parent: hips, names: ["belly", "chest", "neck"], role: "spine",
  });
  const head = b.joint("head", {
    parent: spine.tip!, at: [0, 1.005, 0.025], dir: [0, 0, 1], role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 0.906, 0.087], dir: [0, 0, 1], role: "jaw",
  });
  const ears = [-1, 1].map((s) => b.joint(s > 0 ? "earL" : "earR", {
    parent: head, at: [s * 0.238, 1.034, 0.012], dir: [s, 0.15, 0], role: "hinge",
  }));

  const limbs = [-1, 1].map((s, i) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${side}`, [
      [s * 0.16, 0.835, 0.015],
      [s * 0.255, 0.746, 0.09],
      [s * 0.298, 0.783, 0.255],
    ], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const leg = b.chain(`leg${side}`, [
      [s * 0.125, 0.582, -0.005],
      [s * 0.22, 0.466, 0.065],
      [s * 0.174, 0.45, 0.26],
    ], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.174, 0.424, 0.26],
    });
    const fingers = Array.from({ length: 3 }, (_, j) => {
      const x = s * (0.268 + j * 0.028);
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
      const x = s * (0.146 + j * 0.027);
      return b.chain(`toe${side}${j + 1}`, [
        [x, 0.465, 0.291],
        [x, 0.449, 0.337],
        [x, 0.414, 0.322],
      ], { parent: leg.tip!, role: "digit", count: 2 });
    });
    return { s, i, arm, leg, fingers, thumb, toes };
  });

  // One consistent centimeter-scale pixel grid, including the painted solids.
  const fur = cellPaint(P, (c) => {
    const light = 0.48 + c.n.y * 0.19 + c.n.z * 0.09;
    const fleck = c.random(19);
    return c.pick(GREY, light + (fleck < 0.12 ? 0.24 : fleck > 0.9 ? -0.18 : 0));
  }, { dither: true });
  const wool = cellPaint(P, (c) => c.pick(
    CREAM, 0.65 + c.n.y * 0.13 + (c.random(3) - 0.5) * 0.3,
  ), { dither: true });
  const bark = cellPaint(P, (c) => {
    const stripe = Math.sin(c.u * 1.7 + Math.floor(c.v / 8) * 0.6);
    return c.pick(BARK, 0.53 + stripe * 0.16 + c.n.y * 0.15 + (c.random(8) - 0.5) * 0.18);
  });
  const leafPaint = cellPaint(P, (c) => c.pick(
    GREEN, 0.49 + c.n.y * 0.15 + (c.random(31) - 0.5) * 0.26,
  ));
  const soil = cellPaint(P, (c) =>
    c.random(16) > 0.94 ? "#b6b18a" : c.pick(["#4c5d4d", "#65735b", "#85906d"], 0.48 + c.n.y * 0.2)
  );
  const nosePaint = cellPaint(P, (c) => c.pick(
    ["#182630", "#293742", "#3c4c56", "#56626a"],
    0.25 + c.n.y * 0.28 + (c.random(4) > 0.92 ? 0.18 : 0),
  ));

  // Reusable drawings: every image is deliberately low resolution.
  const furTile = pixelTexture(48, 48, (g) => {
    g.fill((x, y) => {
      const q = random();
      return pick(GREY, 0.57 + (q < 0.1 ? 0.18 : q > 0.91 ? -0.16 : 0), bayer(x, y));
    });
    for (let i = 0; i < 35; i++) {
      const x = Math.floor(random() * 44);
      const y = Math.floor(random() * 44);
      g.set(x, y, GREY[3]);
      g.set(x + 1, y, GREY[3]);
      g.set(x + 1, y + 1, GREY[1]);
    }
  });
  const eyeTex = pixelArt([
    "............",
    "...kkkkkk...",
    "..kkkkkkkk..",
    ".kkwwkkkkkk.",
    ".kkwwkkkkkk.",
    ".kkkkkkkkkk.",
    ".kkkkkkkkkk.",
    "..kkkkkgkk..",
    "...kkkkkk...",
    "....cccc....",
    "............",
    "............",
  ], { k: INK, w: "#fff8dc", g: "#52656e", c: "#c4ccc8" });
  const earTex = pixelTexture(20, 24, (g) => {
    g.fill((x, y) => {
      const dx = Math.abs(x - 9.5);
      const dy = Math.abs(y - 11.5);
      if (dx > 9 - Math.max(0, dy - 6) * 0.8) return "";
      const edge = dx > 6.5 || dy > 8;
      if (edge) return (x + y) % 3 ? "#e8e5d4" : "#b8c1ba";
      if (x < 6 && y > 6 && y < 18) return "#a1aaa5";
      return pick(["#aab1a8", "#c4c7b8", "#dedccb"], 0.65 + (random() - 0.5) * 0.4);
    });
    g.stamp(8, 8, [
      "..gg..",
      ".gggg.",
      ".gggg.",
      "ggggg.",
      "gggg..",
      ".ggg..",
      "..g...",
    ], { g: "#949f9c" });
  });
  const noseTex = pixelArt([
    "..hhhhhh..",
    ".hhllllhh.",
    "hhllllllhh",
    "hllllllllh",
    "hllllllllh",
    "hllllllllh",
    "hllllllllh",
    "hllllllllh",
    "hkkllllkkh",
    ".kkllllkk.",
    "..kkkkkk..",
    "...kkkk...",
  ], { h: "#475660", l: "#2b3943", k: "#172630" });
  const barkTile = pixelTexture(32, 48, (g) => {
    g.fill((x, y) => pick(BARK,
      0.56 + 0.16 * Math.sin(Math.floor(x / 3) * 2 + Math.floor(y / 14)),
      bayer(x, y)));
    for (let i = 0; i < 17; i++) {
      const x = Math.floor(random() * 30);
      const y = Math.floor(random() * 40);
      for (let k = 0; k < 5 + Math.floor(random() * 5); k++) {
        g.set(x, y + k, "#837967");
        g.set(x + 1, y + k, "#e0cfad");
      }
    }
  });
  const endTex = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      const r = Math.max(Math.abs(x - 11.5), Math.abs(y - 11.5));
      return r > 10 ? "#827462" : Math.floor(r / 2) % 2 ? "#d8c19a" : "#b79c77";
    });
    g.stamp(10, 10, ["kkk", "kdk", "kkk"], { k: "#9a7d5b", d: "#cdb38a" });
  });
  const leafTex = pixelTexture(12, 32, (g) => {
    g.fill((x, y) => {
      const width = Math.max(0, Math.min(5, Math.floor((31 - y) / 4), Math.floor(y / 2) + 1));
      if (Math.abs(x - 5.5) > width) return "";
      if (x === 5) return "#b3c7a0";
      if ((y + x * 2) % 9 === 0 && x < 5) return "#87ab8b";
      return x < 5 ? "#568b77" : "#376b60";
    });
  });
  const plaqueTex = pixelTexture(64, 20, (g) => {
    g.fill((x, y) => x < 1 || x > 62 || y < 1 || y > 18 ? "#c1b38e" : "#294743");
    const letters: Record<string, string[]> = {
      K: ["101", "110", "100", "110", "101"],
      O: ["111", "101", "101", "101", "111"],
      A: ["010", "101", "111", "101", "101"],
      L: ["100", "100", "100", "100", "111"],
    };
    [..."KOALA"].forEach((letter, i) => {
      const rows = letters[letter];
      rows.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch === "1") {
          for (let a = 0; a < 2; a++) for (let c = 0; c < 2; c++)
            g.set(13 + i * 8 + x * 2 + a, 5 + y * 2 + c, "#e7dfbf");
        }
      }));
    });
  });

  function box(
    name: string, at: number[], size: [number, number, number],
    color: string | Paint, bone: Joint = stand,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, { at, bone, name });
  }
  function furBox(name: string, at: number[], size: [number, number, number], bone: Joint) {
    return b.part(tileBox(size, furTile, P, { rand: random }), "#ffffff", {
      at, bone, texture: furTile, name,
    });
  }
  function image(
    name: string, texture: THREE.Texture, at: number[], width: number, height: number,
    bone: Joint = stand, direction: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, bone, texture, dir: direction, axis: "z", name,
    });
  }
  function branch(name: string, points: number[][], radii: number[]) {
    return b.sweep(points, radii, {
      color: bark, section: "box", caps: "flat", bone: stand, name,
    });
  }

  // Compact octagonal forest-floor presentation.
  b.part(new THREE.CylinderGeometry(0.49, 0.465, 0.07, 8), "#364d45", {
    at: [0, 0.035, 0.09], bone: stand, name: "octagonal_dark_soil_edge",
  });
  b.part(new THREE.CylinderGeometry(0.47, 0.48, 0.024, 8), soil, {
    at: [0, 0.078, 0.09], bone: stand, name: "pixel_moss_top",
  });
  box("plaque_mount", [0, 0.051, 0.526], [0.262, 0.068, 0.018], "#263c38");
  image("KOALA_pixel_label", plaqueTex, [0, 0.052, 0.536], 0.256, 0.08);

  // A real wooden stand, not a pole floating beneath the animal.
  branch("main_eucalyptus_trunk", [
    [0.025, 0.09, 0.25], [0.018, 0.38, 0.247], [0.045, 0.64, 0.235], [0.045, 0.85, 0.23],
  ], [0.068, 0.06, 0.049, 0.038]);
  branch("left_hand_branch", [
    [0.035, 0.64, 0.235], [0.20, 0.737, 0.252], [0.38, 0.777, 0.25],
  ], [0.044, 0.038, 0.026]);
  branch("right_hand_branch", [
    [0.04, 0.67, 0.235], [-0.19, 0.733, 0.25], [-0.37, 0.764, 0.25],
  ], [0.043, 0.034, 0.025]);
  branch("foot_perch", [
    [-0.255, 0.423, 0.25], [0.015, 0.417, 0.254], [0.252, 0.427, 0.25],
  ], [0.03, 0.039, 0.028]);
  for (const s of [-1, 1]) {
    branch(`root_${s}`, [
      [0.025, 0.19, 0.25], [s * 0.12, 0.11, 0.22], [s * 0.21, 0.095, 0.15],
    ], [0.045, 0.028, 0.012]);
    image("exposed_end_grain", endTex, [s * 0.257, 0.426, 0.25], 0.053, 0.053, stand, [s, 0, 0]);
  }
  // Strips of peeling bark are broad pixel-textured cuboids.
  for (let i = 0; i < 7; i++) {
    const y = 0.18 + i * 0.085;
    b.part(tileBox([0.024, 0.058, 0.009], barkTile, P / 2, { rand: random }), "#ffffff", {
      at: [0.025 + (i % 2 ? 0.021 : -0.012), y, 0.309 - i * 0.004],
      texture: barkTile, bone: stand, name: "papery_bark_strip",
    });
  }

  // The torso stays simple and chunky. A box-section sweep connects its rig.
  b.sweep(spine, (t) => [0.151 + Math.sin(t * Math.PI) * 0.018, 0.103], {
    section: "box", caps: "flat", color: fur, name: "blocky_koala_torso",
  });
  furBox("round_square_rump", [0, 0.57, -0.008], [0.294, 0.18, 0.225], hips);
  furBox("shoulder_block", [0, 0.804, 0.01], [0.326, 0.16, 0.21], spine.joints[1]);
  b.extrude(stepped([
    [-4, 4], [-6, 6], [-7, 7], [-7, 7], [-7, 7], [-6, 6], [-5, 5], [-3, 3],
  ], P, { rows: true }), {
    at: [0, 0.656, 0.119], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.016, color: wool, bone: spine.joints[1], name: "cream_chest_bib",
  });
  for (let i = 0; i < 5; i++) {
    box("bib_stair_step", [(i - 2) * 0.027, 0.752 + (i % 2) * 0.013, 0.129],
      [0.024, 0.028, 0.01], "#e2e0ce", spine.joints[1]);
  }

  // Head silhouette: a broad, squared oval, with chamfer-like pixel steps.
  const headOutline = stepped([
    [-12, 12], [-15, 15], [-17, 17], [-18, 18],
    [-18, 18], [-18, 18], [-18, 18], [-18, 18],
    [-18, 18], [-18, 18], [-17, 17], [-15, 15], [-12, 12],
  ], [P, P * 2], { rows: true });
  b.extrude(headOutline, {
    at: [0, 0.888, 0.025],
    x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.256, color: fur, bone: head, name: "stepped_square_koala_head",
  });
  // Broad lower cheek fluff overlaps the cranium, not the eyes.
  for (const s of [-1, 1]) {
    furBox("cheek_fluff_block", [s * 0.145, 0.951, 0.105], [0.108, 0.072, 0.114], head);
    box("cheek_pale_lower_edge", [s * 0.152, 0.925, 0.165], [0.083, 0.024, 0.014], "#bdc5bf", head);
    image("bright_pixel_eye", eyeTex, [s * 0.112, 1.036, 0.155], 0.091, 0.091, head);
    box("soft_eyebrow", [s * 0.115, 1.087, 0.156], [0.058, 0.012, 0.012], "#aeb9b8", head);
    box("cheek_pixel_highlight", [s * 0.157, 0.982, 0.164], [0.036, 0.012, 0.01], "#c8ceca", head);
    box("cheek_pixel_highlight_small", [s * 0.176, 0.969, 0.165], [0.012, 0.012, 0.01], "#b8c3be", head);
  }
  // The large leathery nose is a separate, stepped solid.
  b.extrude(stepped([
    [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-5, 5],
    [-5, 5], [-5, 5], [-5, 5], [-4, 4], [-3, 3],
  ], P, { rows: true }), {
    at: [0, 0.953, 0.181], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.074, color: nosePaint, bone: head, name: "iconic_large_koala_nose",
  });
  image("nose_pixel_leather", noseTex, [0, 1.014, 0.219], 0.12, 0.144, head);
  box("upper_muzzle", [0, 0.945, 0.159], [0.11, 0.026, 0.054], wool, head);
  box("mouth_dark_seam", [0, 0.925, 0.184], [0.065, 0.009, 0.012], DARK, head);
  box("separate_lower_jaw", [0, 0.91, 0.151], [0.104, 0.025, 0.068], wool, jaw);
  box("mouth_left_corner", [-0.035, 0.93, 0.186], [0.012, 0.012, 0.009], DARK, head);
  box("mouth_right_corner", [0.035, 0.93, 0.186], [0.012, 0.012, 0.009], DARK, head);

  // Oversized woolly ears are the hero silhouette, built as stepped plates.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? -1 : 1;
    const bone = ears[i];
    const cx = s * 0.257;
    b.extrude(stepped([
      [-4, 4], [-6, 6], [-7, 7], [-8, 8],
      [-8, 8], [-8, 8], [-8, 8], [-8, 8],
      [-8, 8], [-7, 7], [-6, 6], [-4, 4],
    ], [P, P * 1.7], { rows: true }), {
      at: [cx, 0.938, -0.006], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.122, color: fur, bone, name: "large_stepped_outer_ear",
    });
    image("woolly_pixel_inner_ear", earTex, [cx, 1.061, 0.056], 0.173, 0.212, bone);
    for (let j = 0; j < 9; j++) {
      const a = (-30 + j * 30) * Math.PI / 180;
      const x = cx + Math.cos(a) * 0.083;
      const y = 1.061 + Math.sin(a) * 0.103;
      box("ear_wool_edge_cube", [x, y, 0.045],
        [0.025, j % 2 ? 0.025 : 0.036, 0.025],
        j % 3 === 0 ? "#d4d7ca" : "#b8c2bb", bone);
    }
    box("ear_top_pixel", [cx - s * 0.012, 1.184, -0.005], [0.036, 0.024, 0.084], "#aab5b4", bone);
  }

  // Arms and legs use continuous box-section skinning; hands wrap around the wood.
  for (const limb of limbs) {
    const { s, arm, leg, fingers, thumb, toes } = limb;
    b.sweep(arm, [0.073, 0.064, 0.048], {
      section: "box", caps: "flat", color: fur, name: "angular_forelimb",
    });
    b.sweep(leg, [0.084, 0.076, 0.044], {
      section: "box", caps: "flat", color: fur, name: "chunky_hindlimb",
    });
    furBox("hand_back", [s * 0.296, 0.791, 0.281], [0.112, 0.061, 0.073], arm.tip!);
    furBox("hind_paw", [s * 0.174, 0.463, 0.276], [0.105, 0.058, 0.083], leg.tip!);
    box("wrist_light_pixel", [s * 0.297, 0.826, 0.282], [0.06, 0.012, 0.036], "#bbc4c0", arm.tip!);
    for (const digit of [...fingers, thumb, ...toes]) {
      b.sweep(digit, [0.013, 0.012, 0.01], {
        color: fur, section: "box", caps: "flat", name: "separated_gripping_digit",
      });
      const tip = digit.at(1);
      const p = tip.at;
      b.frustumBox(
        tip,
        [p.x, p.y - 0.018, p.z - 0.009],
        [0.014, 0.012], [0.004, 0.004],
        { color: CLAW, bone: digit.joints[digit.joints.length - 1], name: "ivory_square_claw" },
      );
    }
    // Dithered flank tufts and patches, kept broad rather than fuzzy geometry.
    for (let j = 0; j < 4; j++) {
      furBox("hip_fur_step", [s * (0.153 + j * 0.012), 0.556 - j * 0.025, 0.045],
        [0.048, 0.037, 0.072], leg.joints[0]);
    }
  }

  // Foliage is arranged beside and behind the face, never across the eyes.
  branch("tall_left_fork", [
    [0.045, 0.74, 0.23], [0.285, 0.87, 0.075],
    [0.405, 1.01, -0.035], [0.435, 1.233, -0.08],
  ], [0.029, 0.024, 0.016, 0.006]);
  branch("low_right_foliage_branch", [
    [-0.21, 0.737, 0.25], [-0.368, 0.846, 0.11], [-0.435, 0.962, 0.015],
  ], [0.019, 0.012, 0.005]);
  branch("rear_leaf_branch", [
    [0.032, 0.62, 0.22], [0.19, 0.87, -0.15], [0.29, 1.055, -0.19],
  ], [0.024, 0.015, 0.006]);

  function eucalyptusLeaf(root: number[], tip: number[], index: number) {
    const r = new THREE.Vector3(...root);
    const t = new THREE.Vector3(...tip);
    const axis = t.clone().sub(r);
    const len = axis.length();
    axis.normalize();
    const across = new THREE.Vector3(1, 0, 0);
    if (Math.abs(axis.dot(across)) > 0.9) across.set(0, 0, 1);
    across.addScaledVector(axis, -across.dot(axis)).normalize();
    const width = index % 3 === 0 ? 0.044 : 0.035;
    b.extrude([
      [0, 0], [-width * 0.42, len * 0.18],
      [-width * 0.55, len * 0.52], [-width * 0.25, len * 0.8],
      [0, len], [width * 0.35, len * 0.72],
      [width * 0.48, len * 0.32],
    ], {
      at: root, x: across, y: axis, thickness: 0.006,
      color: leafPaint, bone: stand, name: "angular_eucalyptus_leaf",
    });
    b.sweep([root, tip], 0.0028, {
      color: "#a8bc97", bone: stand, caps: "flat", section: "box",
      name: "leaf_mid_rib",
    });
    // Pixel drawings on double-sided cards add crisp alternating veins.
    b.cards([frame(root, axis)], leafTex, {
      size: [width * 1.2, len], flow: [0, 0, 1],
      sink: 0, bone: stand, name: "pixel_leaf_veins",
    });
  }
  const clusters = [
    { at: [0.432, 1.21, -0.076], ends: [[0.36, 1.30, -0.075], [0.51, 1.27, -0.06], [0.52, 1.11, -0.035]] },
    { at: [0.42, 1.125, -0.055], ends: [[0.50, 1.03, 0], [0.405, 1.002, -0.08], [0.34, 1.19, -0.085]] },
    { at: [0.391, 0.998, -0.03], ends: [[0.48, 0.91, 0.005], [0.43, 0.859, 0.018]] },
    { at: [-0.423, 0.943, 0.027], ends: [[-0.48, 1.04, 0.015], [-0.52, 0.88, 0.06], [-0.408, 0.82, 0.075]] },
    { at: [-0.371, 0.85, 0.103], ends: [[-0.48, 0.775, 0.13], [-0.362, 0.711, 0.12]] },
    { at: [0.285, 1.043, -0.186], ends: [[0.35, 1.12, -0.20], [0.352, 0.969, -0.15], [0.25, 0.926, -0.19]] },
  ];
  let leafIndex = 0;
  for (const cluster of clusters) {
    for (const end of cluster.ends) {
      const root = new THREE.Vector3(...cluster.at);
      const destination = new THREE.Vector3(...end);
      const stalkEnd = root.clone().lerp(destination, 0.16);
      b.rod(root, stalkEnd, 0.004, {
        color: "#748b69", bone: stand, section: "box", name: "leaf_petiole",
      });
      eucalyptusLeaf(stalkEnd.toArray(), end, leafIndex++);
    }
  }

  // Quiet forest-floor details, with an open front around the label.
  for (let i = 0; i < 17; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 0.24 + random() * 0.17;
    const x = Math.cos(angle) * radius;
    const z = 0.09 + Math.sin(angle) * radius;
    if (z > 0.39 && Math.abs(x) < 0.18) continue;
    const size = 0.018 + random() * 0.024;
    box("square_forest_pebble", [x, 0.096 + size * 0.3, z],
      [size * 1.4, size * 0.6, size],
      i % 3 === 0 ? "#a3a58a" : i % 3 === 1 ? "#74836e" : "#c0b79a");
    if (i % 3 === 0) {
      for (let j = 0; j < 3; j++) {
        box("pixel_moss_sprig", [x + (j - 1) * 0.014, 0.112 + j * 0.005, z - 0.018],
          [0.012, 0.035 + j * 0.009, 0.012], j % 2 ? "#65886a" : "#91a377");
      }
    }
  }
  for (const [x, z, angle] of [
    [-0.24, 0.30, 0.5], [0.30, 0.12, -0.8], [-0.18, -0.18, 1.4], [0.16, 0.38, -0.4],
  ]) {
    b.cards([frame([x, 0.093, z], [0, 1, 0])], leafTex, {
      size: [0.038, 0.116], lean: 90, sink: 0,
      flow: [Math.cos(angle), 0, Math.sin(angle)], mirror: true,
      bone: stand, name: "fallen_eucalyptus_leaf",
    });
  }

  return b.root;
}
```