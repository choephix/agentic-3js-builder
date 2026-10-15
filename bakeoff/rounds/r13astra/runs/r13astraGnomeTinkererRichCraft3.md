```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  svg,
  grain,
  paint,
  mix,
  noise,
} from "agentic-3js-builder";
import type { Fill, Joint } from "agentic-3js-builder";
import {
  metal,
  gearGeometry,
  gearTrain,
  gaugeTexture,
  coil,
} from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Bramble Brassbutton",
  description:
    "A rosy-nosed gnome inventor in a crooked cranberry cap, with an ivory beard, teal workcoat, articulated hands and a densely fitted brass-and-leather gadget backpack.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Bramble_Brassbutton", paintSize: 2048 });
  const random = rng(417);

  const ink = "#273039";
  const leatherDark = "#382a29";
  const sole = "#242a31";
  const ivory = "#eee5ce";
  const stitch = "#e2bd7e";
  const coral = "#dc846f";
  const brass = metal("brass", { tarnish: 0.22, polish: 0.45 });
  const copper = metal("copper", { tarnish: 0.25, verdigris: 0.12 });
  const steel = metal("steel", { tarnish: 0.15 });
  const iron = metal("iron", { tarnish: 0.3 });
  const wood = grain("#75462f", "#b97f48", { size: 0.018, axis: "y", seed: 7 });
  const leather = grain("#714031", "#92573b", { size: 0.012, seed: 9 });
  const beardPaint = paint((p, n) =>
    mix("#b8bab5", "#fff3d5", 0.45 + n.y * 0.25 + n.z * 0.2 + noise(p, 0.06, 4) * 0.15),
  );
  const cloth = paint((p, n) =>
    mix("#174954", "#37858a", 0.35 + n.y * 0.24 + n.z * 0.16 + noise(p, 0.035, 3) * 0.22),
  );
  const hatPaint = paint((p, n) =>
    mix("#772b40", "#bd4e59", 0.4 + n.y * 0.3 + noise(p, 0.045, 5) * 0.22),
  );
  const skin = paint((_p, n) => mix("#c9876d", "#f5c59b", 0.62 + n.y * 0.22));
  const trousers = "#374b59";

  const eyeTexture = svg(`
    <svg viewBox="0 0 100 100">
      <ellipse cx="50" cy="51" rx="45" ry="43" fill="#382c31"/>
      <ellipse cx="50" cy="53" rx="38" ry="35" fill="#fff2d8"/>
      <ellipse cx="52" cy="54" rx="23" ry="29" fill="#38696b"/>
      <ellipse cx="53" cy="58" rx="16" ry="23" fill="#23373e"/>
      <ellipse cx="44" cy="42" rx="9" ry="11" fill="#ffffff"/>
      <circle cx="64" cy="67" r="4" fill="#c6f7e9"/>
      <path d="M8 32 Q50 6 91 32" stroke="#63483f" stroke-width="7" fill="none"/>
    </svg>`, { size: 256 });

  const patchTexture = svg(`
    <svg viewBox="0 0 120 120">
      <rect x="4" y="4" width="112" height="112" rx="18" fill="#273f47" stroke="#d7b271" stroke-width="4"/>
      <rect x="12" y="12" width="96" height="96" rx="13" fill="none" stroke="#e0bc7f" stroke-width="3" stroke-dasharray="5 5"/>
      <path d="M38 82 L73 40 M32 35 L45 28 L50 42 L42 51 L31 48 Z M69 77 L83 66 L92 78 L85 90 L74 89 Z"
        stroke="#f0cc81" stroke-width="9" fill="none" stroke-linejoin="round"/>
      <circle cx="61" cy="60" r="14" fill="#2f757b" stroke="#f0cc81" stroke-width="5"/>
      <circle cx="61" cy="60" r="5" fill="#f0cc81"/>
    </svg>`, { size: 256 });

  const notebookTexture = svg(`
    <svg viewBox="0 0 120 150">
      <rect width="120" height="150" fill="#efe1b9"/>
      <path d="M14 10 V140 M22 10 V140" stroke="#c58970" stroke-width="2"/>
      <g stroke="#91a4a0" stroke-width="2">
        <path d="M28 28 H107 M28 45 H107 M28 62 H107 M28 79 H107 M28 96 H107 M28 113 H107 M28 130 H107"/>
      </g>
      <g stroke="#35545a" stroke-width="3" fill="none">
        <circle cx="68" cy="70" r="24"/><circle cx="68" cy="70" r="10"/>
        <path d="M68 38 V100 M36 70 H100 M49 51 L86 88 M49 88 L86 51 M34 119 L48 112 L61 121 L82 110"/>
      </g>
      <text x="60" y="20" text-anchor="middle" font-size="10" fill="#794c3c" font-family="serif">IDEA No. 47</text>
    </svg>`, { size: 256 });

  const labelTexture = svg(`
    <svg viewBox="0 0 180 80">
      <rect x="3" y="3" width="174" height="74" rx="8" fill="#ead6a5" stroke="#6a432b" stroke-width="5"/>
      <path d="M14 13 H166 M14 67 H166" stroke="#af783b" stroke-width="2"/>
      <text x="90" y="36" text-anchor="middle" font-family="serif" font-weight="bold" font-size="23" fill="#46352b">BRAMBLE</text>
      <text x="90" y="58" text-anchor="middle" font-family="monospace" font-size="13" fill="#79553d">FIELD WORKS · 07</text>
    </svg>`, { size: 384 });

  const lensTexture = svg(`
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="#1d525f"/>
      <circle cx="50" cy="50" r="41" fill="#60b9b9"/>
      <path d="M16 49 A35 35 0 0 1 61 17 L21 64Z" fill="#c0eee1"/>
      <path d="M36 85 L84 37" stroke="#8ed8cf" stroke-width="8"/>
      <path d="M26 30 Q41 18 55 23" stroke="#f1fff0" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="44" stroke="#193c49" stroke-width="3" fill="none"/>
    </svg>`, { size: 256 });

  const gauge = gaugeTexture({ needle: 43, label: "SPARK", size: 256 });

  // Skeleton: neutral open stance, with individually separated fingers.
  const hips = b.joint("hips", { at: [0, 0.39, 0], role: "spine" });
  const spine = b.chain("spine", [[0, 0.39, 0], [0, 0.59, 0], [0, 0.77, 0]], {
    parent: hips, names: ["spineLower", "chest", "neckBase"], role: "spine",
  });
  const neck = b.joint("neck", {
    parent: spine.tip!, at: [0, 0.81, 0], dir: [0, 1, 0], role: "neck",
  });
  const head = b.joint("head", {
    parent: neck, at: [0, 0.93, 0.015], dir: [0, 0, 1], role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head, at: [0, 0.842, 0.09], dir: [0, 0, 1], role: "jaw",
  });

  const limbs = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const leg = b.chain(`leg${side}`, [
      [s * 0.105, 0.41, 0], [s * 0.125, 0.24, 0.012], [s * 0.14, 0.105, 0.012],
    ], {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg", contact: [s * 0.14, 0, 0.065],
    });
    const arm = b.chain(`arm${side}`, [
      [s * 0.16, 0.744, 0], [s * 0.355, 0.734, 0], [s * 0.505, 0.723, 0.01],
      [s * 0.565, 0.72, 0.018],
    ], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    const fingers = [0, 1, 2, 3].map((i) => {
      const z = -0.026 + i * 0.029;
      const endX = 0.638 + (i === 1 || i === 2 ? 0.014 : 0);
      return b.chain(`finger${side}${i + 1}`, [
        [s * 0.575, 0.721, z],
        [s * 0.612, 0.718, z + (i - 1.5) * 0.007],
        [s * endX, 0.716, z + (i - 1.5) * 0.013],
      ], { parent: arm.tip!, role: "digit", count: 2 });
    });
    const thumb = b.chain(`thumb${side}`, [
      [s * 0.54, 0.718, 0.048], [s * 0.559, 0.71, 0.088], [s * 0.585, 0.707, 0.108],
    ], { parent: arm.tip!, role: "digit", count: 2 });
    return { s, side, leg, arm, fingers, thumb };
  });

  const chest = spine.joints[1];

  function box(name: string, at: number[], size: number[], color: Fill, bone: Joint, rotation = [0, 0, 0]) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation, name,
    });
  }
  function ball(name: string, at: number[], size: number[], color: Fill, bone: Joint) {
    return b.part(new THREE.SphereGeometry(1, 10, 7), color, { at, scale: size, bone, name, flat: true });
  }
  function cyl(name: string, at: number[], r: number, h: number, color: Fill, bone: Joint, dir = [0, 1, 0], segments = 10) {
    return b.part(new THREE.CylinderGeometry(r, r, h, segments), color, { at, bone, dir, name });
  }
  function rod(name: string, a: number[], c: number[], r: number, color: Fill, bone: Joint) {
    return b.rod(a, c, r, { color, bone, name, sides: 6 });
  }
  function rivet(at: number[], bone: Joint, color: Fill = brass) {
    return ball("round_rivet", at, [0.008, 0.008, 0.005], color, bone);
  }
  function plane(name: string, at: number[], w: number, h: number, texture: THREE.Texture, bone: Joint, dir = [0, 0, 1]) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at, bone, dir, axis: "z", texture, name,
    });
  }
  function torus(name: string, at: number[], r: number, tube: number, color: Fill, bone: Joint, dir = [0, 0, 1]) {
    return b.part(new THREE.TorusGeometry(r, tube, 5, 16), color, {
      at, bone, dir, axis: "z", name,
    });
  }

  // Sturdy boots, trousers, and the simple tailored coat silhouette.
  b.sweep(spine, (t) => [0.15 + 0.035 * Math.sin(t * Math.PI), 0.115 + 0.015 * Math.sin(t * Math.PI)], {
    color: cloth, sides: 8, caps: "flat", name: "workcoat_body",
  });
  b.lathe([[0, 0], [0.178, 0], [0.18, 0.04], [0.148, 0.19], [0, 0.19]], {
    at: [0, 0.365, 0], bone: hips, color: cloth, segments: 10, name: "flared_coat_skirt",
  });
  box("coat_front_placket", [0, 0.55, 0.127], [0.035, 0.245, 0.018], "#205660", chest);
  for (const y of [0.46, 0.535, 0.61]) {
    cyl("coat_button", [0, y, 0.146], 0.013, 0.009, brass, chest, [0, 0, 1]);
    box("button_slot", [0, y, 0.152], [0.013, 0.0025, 0.002], leatherDark, chest);
  }

  for (const { s, side, leg, arm, fingers, thumb } of limbs) {
    b.sweep(leg, [0.075, 0.057], { color: trousers, sides: 8, name: `trousers${side}` });
    const foot = leg.tip!;
    box("boot_sole", [s * 0.14, 0.025, 0.063], [0.155, 0.05, 0.245], sole, foot);
    box("boot_welt", [s * 0.14, 0.053, 0.065], [0.161, 0.017, 0.247], "#aa7545", foot);
    ball("round_boot_toe", [s * 0.14, 0.091, 0.11], [0.082, 0.062, 0.105], leather, foot);
    cyl("boot_upper", [s * 0.14, 0.119, 0.012], 0.071, 0.119, leather, foot);
    cyl("boot_cuff", [s * 0.14, 0.176, 0.012], 0.075, 0.034, leatherDark, foot);
    for (let i = 0; i < 3; i++) {
      rod("boot_lace", [s * 0.14 - 0.036, 0.12 + i * 0.016, 0.072],
        [s * 0.14 + 0.036, 0.126 + i * 0.016, 0.072], 0.004, stitch, foot);
    }
    for (let i = 0; i < 5; i++) {
      box("sole_tread", [s * 0.14, 0.009, -0.025 + i * 0.043], [0.135, 0.018, 0.022], sole, foot);
    }
    b.sweep(arm, [0.082, 0.073, 0.05, 0.04], {
      from: 0, to: 0.82, color: cloth, sides: 8, caps: "flat", name: `sleeve${side}`,
    });
    ball("elbow_patch", [s * 0.36, 0.731, -0.058], [0.063, 0.049, 0.02], leather, arm.joints[1]);
    cyl("rolled_sleeve", [s * 0.486, 0.724, 0.01], 0.054, 0.049, "#c6c4a6", arm.joints[1], [s, 0, 0]);
    cyl("cuff_trim", [s * 0.51, 0.722, 0.01], 0.051, 0.012, cloth, arm.joints[2], [s, 0, 0]);
    ball("palm", [s * 0.553, 0.72, 0.017], [0.05, 0.03, 0.057], skin, arm.tip!);
    for (const finger of fingers) {
      b.sweep(finger, [0.014, 0.01], { color: skin, sides: 6, name: "separated_finger" });
      const p = finger.at(0.82).at;
      ball("fingernail", [p.x, p.y + 0.009, p.z], [0.011, 0.003, 0.0075], "#f9d6b5", finger.joints[1]);
    }
    b.sweep(thumb, [0.018, 0.012], { color: skin, sides: 6, name: "thumb" });
    // The coat pockets are below the beard and clear of the hands.
    box("lower_patch_pocket", [s * 0.109, 0.444, 0.132], [0.084, 0.075, 0.022], "#28626a", hips);
    box("pocket_lip", [s * 0.109, 0.483, 0.148], [0.091, 0.014, 0.018], "#79a5a0", hips);
    for (let j = 0; j < 4; j++) {
      box("pocket_stitch", [s * 0.109 - 0.029 + j * 0.019, 0.411, 0.145],
        [0.008, 0.003, 0.002], stitch, hips);
    }
  }

  // Harness is physically separate from the coat; the beard overlaps only its central section.
  for (const s of [1, -1]) {
    b.sweep(catmull([
      [s * 0.125, 0.46, 0.127], [s * 0.15, 0.65, 0.126], [s * 0.147, 0.786, 0.035],
      [s * 0.145, 0.78, -0.13], [s * 0.13, 0.49, -0.16],
    ]), () => [0.024, 0.012], { color: leather, bone: chest, section: "box", name: "backpack_shoulder_strap" });
    box("strap_buckle", [s * 0.15, 0.647, 0.144], [0.058, 0.066, 0.012], brass, chest);
    box("buckle_inset", [s * 0.15, 0.647, 0.152], [0.034, 0.042, 0.006], leatherDark, chest);
    rod("buckle_pin", [s * 0.15 - 0.022, 0.647, 0.158], [s * 0.15 + 0.022, 0.647, 0.158], 0.004, brass, chest);
  }
  cyl("waist_belt", [0, 0.418, 0], 0.181, 0.042, leatherDark, hips, [0, 1, 0], 10);
  box("belt_buckle", [0, 0.418, 0.181], [0.067, 0.049, 0.017], brass, hips);
  box("belt_buckle_center", [0, 0.418, 0.192], [0.041, 0.026, 0.005], "#52392f", hips);
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) rivet([s * (0.064 + i * 0.025), 0.418, 0.174 - i * 0.012], hips);
  }

  // Face first: broad cheeks, enormous nose, paired eyes, ears and a hinged lower jaw.
  const skull = ball("head_skull", [0, 0.931, 0.02], [0.185, 0.166, 0.145], skin, head);
  ball("upper_muzzle", [0, 0.851, 0.132], [0.095, 0.051, 0.057], skin, head);
  ball("lower_jaw", [0, 0.821, 0.126], [0.09, 0.043, 0.056], skin, jaw);
  ball("smile_shadow", [0, 0.841, 0.185], [0.062, 0.017, 0.009], "#673c3b", jaw);
  ball("lower_lip", [0, 0.828, 0.191], [0.037, 0.009, 0.008], coral, jaw);
  for (const s of [1, -1]) {
    ball("ear", [s * 0.186, 0.936, 0.019], [0.053, 0.071, 0.04], skin, head);
    ball("ear_inner", [s * 0.207, 0.938, 0.043], [0.026, 0.041, 0.015], coral, head);
    ball("cheek", [s * 0.123, 0.879, 0.116], [0.061, 0.049, 0.047], skin, head);
    ball("cheek_blush", [s * 0.137, 0.883, 0.153], [0.033, 0.022, 0.009], "#dc917d", head);
    const eye = ball("eye_socket", [s * 0.077, 0.948, 0.145], [0.049, 0.052, 0.028], ivory, head);
    b.decal(eye, eyeTexture, {
      at: [s * 0.077, 0.948, 0.174], dir: [0, 0, 1], size: [0.084, 0.089],
      bone: head, segments: 6, name: "painted_eye",
    });
    b.sweep(bezier([s * 0.035, 0.999, 0.163], [s * 0.079, 1.023, 0.166], [s * 0.126, 1.005, 0.145]), [0.019, 0.009], {
      bone: head, color: beardPaint, sides: 5, name: "bushy_eyebrow",
    });
  }
  ball("magnificent_nose", [0, 0.898, 0.213], [0.073, 0.06, 0.075], skin, head);
  ball("nose_rosy_tip", [0, 0.892, 0.265], [0.049, 0.035, 0.024], "#e9a187", head);
  for (const s of [1, -1]) {
    ball("nostril", [s * 0.038, 0.87, 0.253], [0.012, 0.007, 0.006], "#a56558", head);
    for (let i = 0; i < 3; i++) {
      ball("freckle", [s * (0.111 + i * 0.012), 0.887 + (i % 2) * 0.009, 0.161],
        [0.003, 0.003, 0.002], "#a86857", head);
    }
  }

  // Chunky beard: a continuous mass plus broad overlapping carved locks.
  ball("beard_foundation", [0, 0.768, 0.123], [0.147, 0.154, 0.097], beardPaint, jaw);
  function beardLock(x: number, y: number, z: number, length: number, width: number, lean: number) {
    b.extrude([
      [-width * 0.5, 0], [-width * 0.58, -length * 0.38],
      [lean - width * 0.2, -length * 0.85], [lean, -length],
      [lean + width * 0.29, -length * 0.77], [width * 0.51, -length * 0.25],
      [width * 0.36, 0.018],
    ], {
      at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.012, 0.036],
      color: beardPaint, bone: jaw, name: "carved_beard_lock",
    });
    b.sweep(bezier([x, y - 0.02, z + 0.021],
      [x + lean * 0.3, y - length * 0.48, z + 0.023],
      [x + lean * 0.8, y - length * 0.83, z + 0.012]), [0.003, 0.001], {
      color: "#c5c5b8", bone: jaw, sides: 4, name: "beard_engraved_groove",
    });
  }
  for (const s of [1, -1]) {
    beardLock(s * 0.127, 0.874, 0.143, 0.16, 0.061, -s * 0.012);
    beardLock(s * 0.094, 0.836, 0.197, 0.19, 0.065, -s * 0.025);
    beardLock(s * 0.051, 0.805, 0.218, 0.199, 0.066, -s * 0.018);
    b.sweep(bezier([s * 0.012, 0.857, 0.226], [s * 0.075, 0.866, 0.247], [s * 0.13, 0.828, 0.196]), [0.028, 0.022, 0.004], {
      color: beardPaint, bone: head, sides: 6, name: "sweeping_moustache",
    });
  }
  beardLock(0, 0.779, 0.235, 0.19, 0.071, 0.006);

  // Tall, kinked cap. Goggles stay on the brim, never across the eyes.
  b.lathe([[0, 0], [0.194, 0], [0.201, 0.029], [0.191, 0.068], [0.168, 0.078], [0, 0.078]], {
    at: [0, 1.045, 0.008], bone: head, segments: 12, color: hatPaint, name: "cap_turned_brim",
  });
  b.sweep(catmull([
    [0, 1.094, 0.008], [-0.015, 1.205, 0.001], [-0.047, 1.323, 0.009],
    [-0.106, 1.401, 0.024], [-0.171, 1.382, 0.041],
  ]), [0.169, 0.138, 0.087, 0.043, 0.007], {
    bone: head, color: hatPaint, sides: 9, caps: "flat", name: "crooked_pointed_cap",
  });
  ball("cap_tip", [-0.174, 1.38, 0.041], [0.019, 0.023, 0.019], brass, head);
  for (let i = 0; i < 15; i++) {
    const a = (-76 + i * 11) * Math.PI / 180;
    rod("hat_brim_stitch", [Math.sin(a) * 0.198, 1.059, Math.cos(a) * 0.198 + 0.008],
      [Math.sin(a + 0.015) * 0.198, 1.069, Math.cos(a + 0.015) * 0.198 + 0.008],
      0.0025, "#e99883", head);
  }
  b.sweep(catmull([
    [-0.185, 1.103, -0.025], [-0.15, 1.107, 0.119], [0, 1.111, 0.179],
    [0.15, 1.107, 0.119], [0.185, 1.103, -0.025],
  ]), () => [0.017, 0.008], {
    bone: head, color: leatherDark, section: "box", name: "goggle_band",
  });
  for (const s of [1, -1]) {
    cyl("goggle_housing", [s * 0.076, 1.115, 0.18], 0.057, 0.045, leatherDark, head, [0, 0, 1], 12);
    torus("goggle_brass_rim", [s * 0.076, 1.115, 0.207], 0.049, 0.008, brass, head);
    plane("blue_glass_goggle", [s * 0.076, 1.115, 0.21], 0.09, 0.09, lensTexture, head);
    cyl("goggle_adjuster", [s * 0.137, 1.115, 0.185], 0.016, 0.022, brass, head, [s, 0, 0]);
    for (let j = 0; j < 4; j++) {
      const a = j * Math.PI / 2;
      rivet([s * 0.076 + Math.sin(a) * 0.05, 1.115 + Math.cos(a) * 0.05, 0.216], head, steel);
    }
  }
  rod("goggle_bridge", [-0.026, 1.121, 0.198], [0.026, 1.121, 0.198], 0.009, brass, head);
  // A little repair patch on the cap, with a bold embroidered workshop mark.
  plane("hat_workshop_patch", [0.035, 1.253, 0.124], 0.071, 0.079, patchTexture, head, [0.15, 0.2, 1]);

  // Backpack: framed leather trunk, piping, raised corners and two closures.
  box("backpack_body", [0, 0.675, -0.236], [0.354, 0.435, 0.245], leather, chest);
  box("backpack_rear_panel", [0, 0.674, -0.365], [0.31, 0.345, 0.025], "#65422f", chest);
  box("backpack_lid", [0, 0.901, -0.235], [0.372, 0.057, 0.263], leatherDark, chest);
  for (const s of [1, -1]) {
    rod("pack_frame_upright", [s * 0.188, 0.445, -0.359], [s * 0.188, 0.921, -0.359], 0.014, brass, chest);
    rod("pack_corner_piping", [s * 0.17, 0.463, -0.105], [s * 0.17, 0.885, -0.105], 0.008, stitch, chest);
    box("pack_vertical_strap", [s * 0.108, 0.68, -0.385], [0.039, 0.427, 0.012], leatherDark, chest);
    box("pack_rear_buckle", [s * 0.108, 0.813, -0.4], [0.061, 0.067, 0.018], brass, chest);
    box("pack_buckle_opening", [s * 0.108, 0.813, -0.411], [0.035, 0.039, 0.007], leatherDark, chest);
    for (const y of [0.475, 0.895]) {
      box("pack_corner_guard", [s * 0.158, y, -0.384], [0.062, 0.058, 0.025], brass, chest);
      rivet([s * 0.158, y, -0.401], chest, steel);
    }
    for (let i = 0; i < 9; i++) {
      box("pack_edge_stitch", [s * 0.145, 0.51 + i * 0.036, -0.381], [0.005, 0.013, 0.003], stitch, chest);
    }
  }
  for (const y of [0.447, 0.924]) {
    rod("pack_frame_crossbar", [-0.188, y, -0.359], [0.188, y, -0.359], 0.014, brass, chest);
  }
  b.sweep(catmull([
    [-0.057, 0.929, -0.235], [-0.055, 0.976, -0.235], [0.055, 0.976, -0.235], [0.057, 0.929, -0.235],
  ]), 0.013, { color: leatherDark, bone: chest, sides: 6, name: "pack_carry_handle" });
  plane("maker_plate", [0, 0.506, -0.405], 0.17, 0.075, labelTexture, chest, [0, 0, -1]);

  // Rear inspection window: real meshing gears in an inset case.
  box("gearbox_backing", [0, 0.661, -0.399], [0.217, 0.19, 0.031], iron, chest);
  gearTrain(b, {
    at: [-0.043, 0.642, -0.424], axis: [0, 0, -1], up: [0, 1, 0],
    module: 0.0045, thickness: 0.014, bone: chest, spin: "packGear",
    gears: [
      { teeth: 22, spokes: 5, color: brass },
      { teeth: 12, angle: 55, color: copper },
      { teeth: 10, from: 0, angle: -115, color: steel },
    ],
  });
  for (const s of [1, -1]) {
    rod("inspection_window_frame", [s * 0.116, 0.56, -0.425], [s * 0.116, 0.765, -0.425], 0.008, brass, chest);
  }
  for (const y of [0.56, 0.765]) {
    rod("inspection_window_frame", [-0.116, y, -0.425], [0.116, y, -0.425], 0.008, brass, chest);
  }

  // A copper pressure vessel, ceramic insulators, and a cheerful spark indicator.
  cyl("pressure_tank", [0.242, 0.744, -0.244], 0.069, 0.327, copper, chest, [0, 1, 0], 10);
  ball("tank_top", [0.242, 0.91, -0.244], [0.069, 0.04, 0.069], copper, chest);
  ball("tank_bottom", [0.242, 0.581, -0.244], [0.069, 0.035, 0.069], copper, chest);
  for (const y of [0.62, 0.846]) {
    cyl("tank_clamp", [0.242, y, -0.244], 0.074, 0.027, brass, chest);
    box("tank_mount", [0.19, y, -0.244], [0.056, 0.03, 0.075], iron, chest);
  }
  cyl("valve_stem", [0.242, 0.961, -0.244], 0.016, 0.064, brass, chest);
  torus("red_valve_wheel", [0.242, 0.996, -0.244], 0.036, 0.007, "#b94e47", chest, [0, 1, 0]);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    rod("valve_spoke", [0.242, 0.996, -0.244],
      [0.242 + 0.033 * Math.cos(a), 0.996, -0.244 + 0.033 * Math.sin(a)], 0.004, brass, chest);
  }
  cyl("pressure_gauge_case", [0.247, 0.844, -0.166], 0.048, 0.026, brass, chest, [0, 0, 1], 16);
  plane("pressure_gauge_face", [0.247, 0.844, -0.15], 0.083, 0.083, gauge, chest);
  b.sweep(catmull([
    [0.25, 0.588, -0.24], [0.325, 0.55, -0.24], [0.351, 0.63, -0.266],
    [0.327, 0.908, -0.285], [0.21, 0.942, -0.28],
  ]), 0.011, { color: leatherDark, bone: chest, sides: 6, name: "pressure_hose" });

  // Left-side telescoping periscope and a bell-mouthed listening horn.
  rod("periscope_mount", [-0.177, 0.64, -0.23], [-0.256, 0.64, -0.23], 0.026, brass, chest);
  cyl("periscope_base", [-0.247, 0.769, -0.234], 0.039, 0.272, brass, chest);
  cyl("periscope_extension", [-0.247, 0.978, -0.234], 0.027, 0.2, steel, chest);
  for (const y of [0.68, 0.859, 1.063]) {
    cyl("periscope_collar", [-0.247, y, -0.234], 0.043, 0.024, leatherDark, chest);
  }
  b.sweep(catmull([
    [-0.247, 1.07, -0.234], [-0.247, 1.113, -0.231], [-0.247, 1.134, -0.179],
  ]), 0.029, { color: brass, bone: chest, sides: 8, name: "periscope_elbow" });
  cyl("periscope_objective", [-0.247, 1.134, -0.153], 0.044, 0.052, brass, chest, [0, 0, 1], 12);
  plane("periscope_lens", [-0.247, 1.134, -0.125], 0.069, 0.069, lensTexture, chest);
  b.lathe([[0.014, 0], [0.022, 0], [0.025, 0.045], [0.064, 0.104], [0.067, 0.115],
    [0.056, 0.115], [0.018, 0.051]], {
    at: [-0.207, 0.94, -0.3], axis: [-0.7, 0.6, -0.1], bone: chest,
    segments: 10, color: copper, name: "listening_horn",
  });

  // Backpack top: a glowing accumulator and spring-loaded aerial.
  cyl("spark_base", [0.08, 0.952, -0.3], 0.045, 0.047, iron, chest);
  for (let i = 0; i < 4; i++) {
    cyl("ceramic_insulator", [0.08, 0.982 + i * 0.022, -0.3], 0.03 - i * 0.002, 0.012, ivory, chest);
  }
  glow(ball("spark_crystal", [0.08, 1.084, -0.3], [0.029, 0.043, 0.029], "#87e8d4", chest), 1.25);
  for (const s of [1, -1]) {
    rod("crystal_guard", [0.08 + s * 0.04, 0.953, -0.3], [0.08 + s * 0.025, 1.118, -0.3], 0.005, brass, chest);
  }
  cyl("aerial_socket", [-0.08, 0.948, -0.315], 0.025, 0.035, brass, chest);
  b.sweep(coil([-0.08, 0.964, -0.315], [-0.08, 1.067, -0.315], 0.018, 5), 0.004, {
    color: steel, bone: chest, sides: 5, name: "aerial_coil_spring",
  });
  rod("aerial", [-0.08, 1.065, -0.315], [-0.128, 1.22, -0.329], 0.004, steel, chest);
  ball("aerial_tip", [-0.128, 1.22, -0.329], [0.012, 0.012, 0.012], copper, chest);

  // Rolled blueprints tucked beneath the pack.
  for (let i = 0; i < 2; i++) {
    const z = -0.23 - i * 0.075;
    cyl("rolled_blueprint", [0, 0.417, z], 0.035, 0.366 - i * 0.025, i ? "#b2ccca" : "#e0d6b8", chest, [1, 0, 0]);
    for (const s of [1, -1]) {
      cyl("blueprint_end", [s * (0.184 - i * 0.0125), 0.417, z], 0.027, 0.003, "#7e9690", chest, [1, 0, 0]);
      torus("paper_spiral", [s * (0.187 - i * 0.0125), 0.417, z], 0.019, 0.0025, ivory, chest, [1, 0, 0]);
    }
  }
  for (const s of [1, -1]) {
    box("blueprint_retaining_band", [s * 0.106, 0.418, -0.27], [0.025, 0.077, 0.147], leatherDark, chest);
  }

  // Workbelt: tool holsters, a little notebook, pencil and an open-ended spanner.
  box("notebook_cover", [-0.19, 0.476, 0.068], [0.089, 0.133, 0.028], "#a84b41", hips, [0, 0, -8]);
  box("notebook_pages", [-0.19, 0.478, 0.086], [0.076, 0.117, 0.012], ivory, hips, [0, 0, -8]);
  plane("notebook_diagram", [-0.19, 0.478, 0.094], 0.071, 0.108, notebookTexture, hips);
  for (let i = 0; i < 5; i++) {
    torus("notebook_wire", [-0.23, 0.435 + i * 0.022, 0.08], 0.008, 0.002, brass, hips, [0, 1, 0]);
  }
  rod("pencil", [-0.237, 0.43, 0.045], [-0.255, 0.575, 0.045], 0.006, "#dca747", hips);
  b.spike([-0.255, 0.575, 0.045], [-0.002, 0.018, 0], 0.019, 0.006, {
    color: wood, bone: hips, sides: 6, name: "pencil_tip",
  });
  box("tool_holster", [0.204, 0.449, 0.03], [0.062, 0.121, 0.059], leather, hips);
  for (const z of [0.008, 0.048]) {
    cyl("screwdriver_handle", [0.208, 0.549, z], 0.014, 0.067, z < 0.02 ? "#a9473e" : wood, hips);
    rod("screwdriver_shaft", [0.208, 0.517, z], [0.208, 0.425, z], 0.005, steel, hips);
    cyl("tool_handle_ferrule", [0.208, 0.518, z], 0.015, 0.012, brass, hips);
  }
  b.extrude([
    [-0.013, 0], [-0.013, 0.103], [-0.03, 0.122], [-0.033, 0.15],
    [-0.017, 0.166], [-0.015, 0.14], [0.012, 0.14], [0.018, 0.165],
    [0.034, 0.149], [0.03, 0.123], [0.012, 0.104], [0.012, 0],
  ], {
    at: [0.256, 0.354, 0.016], x: [1, 0, 0], thickness: 0.014,
    color: steel, bone: hips, name: "open_ended_spanner",
  });
  box("spanner_retaining_loop", [0.254, 0.428, 0.029], [0.046, 0.026, 0.017], leatherDark, hips);
  rivet([0.27, 0.427, 0.04], hips);
  plane("sleeve_guild_badge", [-0.277, 0.762, 0.073], 0.062, 0.061, patchTexture, limbs[1].arm.joints[0]);

  // Small useful clutter is attached to the pack, not scattered around the character.
  box("side_parts_drawer", [0.22, 0.527, -0.129], [0.095, 0.067, 0.106], wood, chest);
  box("drawer_front", [0.22, 0.527, -0.07], [0.104, 0.072, 0.012], brass, chest);
  torus("drawer_pull", [0.22, 0.526, -0.057], 0.015, 0.004, leatherDark, chest);
  for (let i = 0; i < 6; i++) {
    const a = random() * Math.PI * 2;
    const x = -0.082 + i * 0.032;
    ball("pack_lid_rivet", [x, 0.934, -0.344 + Math.sin(a) * 0.002],
      [0.006, 0.004, 0.006], brass, chest);
  }
  b.part(gearGeometry({ teeth: 12, radius: 0.034, thickness: 0.009, spokes: 3 }), brass, {
    at: [-0.22, 0.578, -0.1], bone: chest, dir: [-0.3, 0, 1], name: "spare_gear_on_hook",
  });
  b.sweep(bezier([-0.18, 0.64, -0.12], [-0.245, 0.638, -0.08], [-0.22, 0.582, -0.1]), 0.004, {
    bone: chest, color: steel, sides: 5, name: "spare_parts_hook",
  });

  return b.root;
}
```