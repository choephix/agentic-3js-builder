```ts
import * as THREE from "three";
import {
  createBuilder, catmull, bezier, frame, line, rng, grain, svg
} from "agentic-3js-builder";

export const meta = {
  name: "Bamboo-balancing red panda",
  description: "A delighted, rust-red panda balances on a forked mossy branch, holding a leafy bamboo shoot. A big cream-and-ginger ringed tail acts as its counterweight."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Bamboo-balancing red panda", detail: 1, paintSize: 1024 });

  const C = {
    rust: "#b64b29",
    brightRust: "#cb6033",
    darkRust: "#8b3827",
    ginger: "#d78142",
    cream: "#f1ddb1",
    face: "#fff1d8",
    black: "#292326",
    charcoal: "#392b2c",
    nose: "#191d20",
    pad: "#99665b",
    tongue: "#df8d89",
    wood: "#65412d",
    woodDark: "#392a23",
    woodLight: "#a47045",
    cut: "#cb9e68",
    moss: "#58723c",
    mossLight: "#809447",
    mossDark: "#3d5834",
    bamboo: "#608646",
    bambooDark: "#355936",
    bambooLight: "#a7bc6b",
    leaf: "#4b793d",
    leafDark: "#315d36",
    vein: "#92a75c"
  };

  // Skeleton first. The scenery has its own stationary root.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root, at: [0, 0.432, -0.012], dir: [0, 1, 0], role: "spine"
  });
  const spine = b.chain("spine", [
    hips, [0, 0.511, -0.003], [0, 0.586, 0.022]
  ], { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });

  const neck = b.chain("neck", [
    spine.tip!, [0, 0.627, 0.043], [0, 0.675, 0.065]
  ], { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck" });

  const head = b.joint("head", {
    parent: neck.joints[1], at: neck.at(1), dir: [0, 0, 1], role: "head"
  });
  const H = b.region({ at: head.at, bone: head });
  const jaw = b.joint("jaw", {
    parent: head, at: H.p([0, -0.056, 0.036]), dir: [0, 0, 1], role: "jaw"
  });

  const ears = [1, -1].map(s => ({
    s,
    joint: b.joint(s > 0 ? "earL" : "earR", {
      parent: head, at: H.p([s * 0.086, 0.067, 0.001]),
      dir: [s * 0.18, 1, 0], role: "hinge"
    })
  }));

  const tail = b.chain("tail", catmull([
    hips.local({ back: 0.067 }),
    [-0.078, 0.408, -0.180],
    [-0.239, 0.394, -0.271],
    [-0.425, 0.407, -0.308],
    [-0.551, 0.454, -0.283]
  ]), { parent: hips, count: 6, role: "tail" });

  const limbs = [1, -1].map(s => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${side}`, [
      [s * 0.067, 0.429, -0.005],
      [s * 0.095, 0.355, 0.030],
      [s * 0.108, 0.274, 0.029]
    ], {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg", contact: [s * 0.108, 0.251, 0.042]
    });
    const footRegion = b.region({ at: leg.tip!.at, bone: leg.tip! });
    const toes = [-1, 0, 1].map((j, i) =>
      b.chain(`toe${side}${i + 1}`, [
        footRegion.p([j * 0.021, -0.004, 0.035]),
        footRegion.p([j * 0.024, -0.008, 0.069])
      ], { parent: leg.tip!, role: "digit" })
    );

    const armPoints = s > 0
      ? [[0.076, 0.558, 0.023], [0.159, 0.527, 0.044], [0.237, 0.539, 0.084]]
      : [[-0.076, 0.558, 0.023], [-0.159, 0.553, 0.027], [-0.245, 0.574, 0.039]];
    const arm = b.chain(`arm${side}`, armPoints, {
      parent: spine.tip!, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm"
    });
    const handRegion = b.region({ at: arm.tip!.at, bone: arm.tip! });
    const fingers = [-1, 0, 1].map((j, i) => {
      const dy = j * 0.018;
      return b.chain(`finger${side}${i + 1}`, s > 0 ? [
        handRegion.p([-0.019, dy, 0.013]),
        handRegion.p([0.015, dy, 0.031]),
        handRegion.p([0.029, dy - 0.003, 0.011])
      ] : [
        handRegion.p([-0.012, dy, 0.013]),
        handRegion.p([-0.034, dy + j * 0.003, 0.021]),
        handRegion.p([-0.055, dy + j * 0.008, 0.017])
      ], { parent: arm.tip!, role: "digit" });
    });
    const thumb = b.chain(`thumb${side}`, s > 0 ? [
      handRegion.p([-0.019, 0.023, -0.007]),
      handRegion.p([0.009, 0.026, -0.006])
    ] : [
      handRegion.p([-0.003, -0.025, 0.006]),
      handRegion.p([-0.021, -0.043, 0.016])
    ], { parent: arm.tip!, role: "digit" });
    return { s, side, leg, arm, toes, fingers, thumb, footRegion, handRegion };
  });

  const oval = (
    name: string, at: THREE.Vector3 | number[], color: string,
    scale: [number, number, number], bone: typeof root
  ) => b.part(new THREE.SphereGeometry(1, 12, 8), color, {
    name, at, scale, bone, flat: true
  });

  // Crooked fallen branch, with two grounded forks rather than a display stand.
  const branchPath = catmull([
    [-0.67, 0.083, -0.010],
    [-0.39, 0.155, -0.018],
    [0, 0.173, 0],
    [0.32, 0.166, 0.014],
    [0.64, 0.130, 0.040]
  ]);
  const bark = grain("#513426", "#755039", { size: 0.017, axis: "x", seed: 23 });
  const branch = b.sweep(branchPath, [0.057, 0.076, 0.079, 0.068, 0.048], {
    bone: root, color: bark, sides: 10, smooth: false, caps: "flat", name: "old_branch"
  });
  b.sweep(catmull([
    [-0.37, 0.144, -0.017], [-0.442, 0.105, -0.124], [-0.51, 0.033, -0.240]
  ]), [0.048, 0.032], {
    bone: root, color: bark, sides: 8, smooth: false, name: "grounded_rear_fork"
  });
  b.sweep([
    [0.28, 0.153, 0.018], [0.365, 0.083, 0.133], [0.45, 0.028, 0.211]
  ], [0.045, 0.028], {
    bone: root, color: bark, sides: 8, smooth: false, name: "grounded_front_fork"
  });
  b.sweep([
    [0.40, 0.160, -0.013], [0.463, 0.230, -0.067], [0.510, 0.277, -0.102]
  ], [0.026, 0.013], {
    bone: root, color: bark, sides: 7, smooth: false, caps: "flat", name: "broken_twig"
  });

  const woodRings = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path d="M64 8 C92 5 121 39 118 68 C114 100 92 120 62 117 C30 120 8 96 10 64 C8 34 30 10 64 8Z"
        fill="#c99b63"/>
      <g fill="none" stroke="#8b5b38" stroke-width="3">
        <path d="M65 21 C93 20 108 42 105 69 C102 95 85 107 60 104 C35 106 23 87 23 62 C25 38 42 20 65 21Z"/>
        <path d="M65 35 C85 31 94 48 93 68 C91 87 77 94 59 92 C41 91 34 77 36 61 C36 44 49 35 65 35Z"/>
        <path d="M63 48 C77 46 84 56 80 69 C77 79 66 83 55 75 C46 67 49 51 63 48Z"/>
      </g>
      <g stroke="#69442e" stroke-width="3" fill="none">
        <path d="M64 5 L61 24 L68 32"/>
        <path d="M114 85 L94 78 L84 82"/>
        <path d="M25 108 L38 89"/>
      </g>
    </svg>`, { size: 256 });

  for (const t of [0, 1]) {
    const at = branchPath.at(t);
    const outward = branchPath.tangentAt(t).multiplyScalar(t === 0 ? -1 : 1);
    const radius = t === 0 ? 0.051 : 0.043;
    b.part(new THREE.CylinderGeometry(radius, radius, 0.006, 10), C.cut, {
      at: at.clone().addScaledVector(outward, 0.001), dir: outward,
      bone: root, name: `cut_wood_${t}`
    });
    b.part(new THREE.CircleGeometry(radius * 0.95, 12), "#ffffff", {
      at: at.clone().addScaledVector(outward, 0.0045),
      dir: outward, axis: "z", texture: woodRings, bone: root,
      name: `growth_rings_${t}`
    });
  }

  const branchSkin = b.surface(branch);
  for (let k = 0; k < 5; k++) {
    const rough = [
      [-0.59, 0.090 + k * 0.020, 0.040],
      [-0.31, 0.113 + k * 0.020, 0.054],
      [0.04, 0.132 + k * 0.017, 0.075],
      [0.33, 0.123 + k * 0.014, 0.071],
      [0.55, 0.112 + k * 0.010, 0.071]
    ];
    b.sweep(branchSkin.drape(catmull(rough), { lift: 0.001 }), 0.0022, {
      bone: root, color: k % 2 ? C.woodLight : C.woodDark, sides: 5,
      name: `bark_fissure_${k}`
    });
  }

  const mossHits = branchSkin.scatter(62, {
    rng: rng(31), minDist: 0.029,
    filter: h => h.n.y > 0.46 &&
      !(Math.abs(h.at.x) < 0.165 && h.at.z > -0.027 && h.at.z < 0.094)
  });
  mossHits.forEach((hit, i) => {
    const r = 0.023 + (i % 5) * 0.0035;
    b.stick(new THREE.IcosahedronGeometry(r, 0),
      [C.moss, C.mossLight, C.mossDark][i % 3], hit, {
        scale: [1.17, 0.48, 0.94], embed: 0.35, bone: root, name: `moss_cushion_${i}`
      });
    if (i % 4 === 0) {
      b.stick(new THREE.ConeGeometry(0.007, 0.025, 4), C.mossLight, hit, {
        embed: 0.28, bone: root, name: `moss_sprig_${i}`
      });
    }
  });

  // Two small fern fronds, rooted exactly on the branch.
  for (const [fi, x] of [-0.48, 0.49].entries()) {
    const hit = branchSkin.nearest([x, 0.38, 0.006]);
    const fern = b.region({ at: hit.at, bone: root });
    const stemTip = fern.p([fi ? 0.037 : -0.042, 0.116, -0.016]);
    b.sweep(bezier(hit, fern.p([0, 0.065, -0.009]), stemTip), [0.0027, 0.001], {
      bone: root, color: C.mossLight, sides: 5, name: `fern_stem_${fi}`
    });
    for (let k = 0; k < 5; k++) {
      const f = (k + 1) / 6;
      const center = hit.at.clone().lerp(stemTip, f);
      const span = 0.031 * (1 - f * 0.62);
      for (const s of [1, -1]) {
        b.slab([
          center,
          center.clone().add(new THREE.Vector3(s * span * 0.65, 0.011, 0.007)),
          center.clone().add(new THREE.Vector3(s * span, 0.029, 0.001)),
          center.clone().add(new THREE.Vector3(s * span * 0.38, 0.018, -0.005))
        ], {
          thickness: 0.002, color: k % 2 ? C.mossLight : C.moss,
          bone: root, name: `fern_leaf_${fi}_${k}_${s > 0 ? "L" : "R"}`
        });
      }
    }
  }

  // Simple, faceted pear-shaped body: the warm back and black underside remain bold.
  const torso = b.sweep(spine, t => [
    0.099 - 0.025 * t + 0.008 * Math.sin(t * Math.PI),
    0.079 - 0.020 * t
  ], {
    color: C.rust, sides: 12, smooth: false,
    sectors: [[91, 269, C.black]], caps: "round", name: "red_back_black_belly"
  });
  b.sweep(neck, [0.062, 0.061, 0.052], {
    color: C.rust, sides: 10, smooth: false,
    sectors: [[100, 260, C.black]], name: "short_furry_neck"
  });

  for (const item of limbs) {
    const { side, s, leg, arm, footRegion, handRegion, toes, fingers, thumb } = item;
    b.sweep(leg, [0.051, 0.041, 0.029], {
      color: C.black, sides: 8, smooth: false, name: `hind_leg_${side}`
    });
    const foot = oval(`broad_hind_paw_${side}`, footRegion.p([0, 0, 0.017]),
      C.black, [0.042, 0.023, 0.052], leg.tip!);

    toes.forEach((toe, i) => {
      b.sweep(toe, [0.013, 0.010], {
        color: C.black, sides: 6, name: `hind_toe_${side}_${i}`
      });
      b.spike(toe.at(1), [0, -0.16, 1], 0.011, 0.0035, {
        color: C.cream, sides: 5, name: `hind_claw_${side}_${i}`
      });
    });

    b.sweep(arm, [0.040, 0.032, 0.024], {
      color: C.black, bands: [[0.29, C.rust], [1, C.black]],
      sides: 8, smooth: false, name: `balancing_arm_${side}`
    });
    const palm = oval(`forepaw_${side}`, handRegion.p([s > 0 ? -0.007 : -0.006, 0, 0]),
      C.black, [0.030, 0.036, 0.026], arm.tip!);
    fingers.forEach((finger, i) => {
      b.sweep(finger, [0.010, 0.009, 0.0068], {
        color: C.black, sides: 6, name: `finger_shape_${side}_${i}`
      });
      b.spike(finger.at(1), s > 0 ? [0.16, -0.1, -1] : [-1, 0.1, 0.05],
        0.007, 0.0028, { color: C.cream, sides: 5, name: `fore_claw_${side}_${i}` });
    });
    b.sweep(thumb, [0.012, 0.008], {
      color: C.black, sides: 6, name: `thumb_shape_${side}`
    });

    if (s < 0) {
      const padHit = b.surface(palm).nearest(handRegion.p([-0.010, -0.005, 0.040]));
      b.stick(new THREE.SphereGeometry(0.015, 8, 6), C.pad, padHit, {
        scale: [0.90, 0.22, 1.08], embed: 0.35, name: "open_paw_central_pad"
      });
      fingers.forEach((finger, i) => {
        const h = b.surface(finger === fingers[i] ? palm : foot)
          .nearest(handRegion.p([-0.018, (i - 1) * 0.018, 0.030]));
        b.stick(new THREE.SphereGeometry(0.0055, 6, 4), C.pad, h, {
          scale: [1, 0.3, 1], embed: 0.35, bone: arm.tip!, name: `open_paw_small_pad_${i}`
        });
      });
    }
  }

  // Very small sculpted tufts punctuate, rather than obscure, the primitive body.
  const torsoSurface = b.surface(torso);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const hit = torsoSurface.nearest([s * 0.14, 0.453 + i * 0.027, -0.026]);
      b.stick(new THREE.ConeGeometry(0.017, 0.031, 5), C.rust, hit, {
        embed: 0.64, spin: i * 39, name: `flank_fur_${s > 0 ? "L" : "R"}_${i}`
      });
    }
  }

  const tailBands: [number, string][] = [
    [0.10, C.darkRust], [0.20, C.cream], [0.30, C.ginger], [0.40, C.cream],
    [0.50, C.brightRust], [0.60, C.cream], [0.70, C.ginger], [0.80, C.cream],
    [0.90, C.brightRust], [1, C.cream]
  ];
  const tailTube = b.sweep(tail, [0.059, 0.082, 0.080, 0.070, 0.048, 0.014], {
    bands: tailBands, sides: 10, smooth: false, caps: "round", name: "fluffy_ringed_tail"
  });
  let tuftIndex = 0;
  b.along(tailTube, 36, point => {
    const index = tuftIndex++;
    const angle = [0, 72, -72, 144, -144][index % 5];
    const hit = tailTube.at(point.t, angle);
    const color = tailBands.find(band => point.t <= band[0])![1];
    b.stick(new THREE.ConeGeometry(0.015, 0.027, 5), color, hit, {
      embed: 0.69, spin: index * 31, name: `tail_fuzz_${index}`
    });
  }, { from: 0.065, to: 0.94 });

  // Round head, pale face, and silhouette-defining cheek whiskers.
  oval("rust_round_skull", head.at, C.rust, [0.116, 0.103, 0.088], head);
  const face = oval("round_white_face", H.p([0, -0.008, 0.055]),
    C.face, [0.105, 0.079, 0.048], head);

  for (const s of [1, -1]) {
    b.extrude([
      [0, -0.032], [0.024, -0.041, "sharp"], [0.014, -0.023],
      [0.044, -0.020, "sharp"], [0.030, -0.003],
      [0.043, 0.011, "sharp"], [0.011, 0.026], [-0.009, 0.011]
    ], {
      at: H.p([s * 0.085, -0.020, 0.038]),
      x: [s, 0, 0], y: [0, 1, 0], thickness: 0.028,
      bevel: 0.002, color: C.face, bone: head,
      name: `white_cheek_tuft_${s > 0 ? "L" : "R"}`
    });
  }

  for (const { s, joint } of ears) {
    const E = b.region({ at: joint.at, bone: joint });
    b.extrude([
      [-0.034, -0.023], [0.033, -0.021], [0.038, 0.021],
      [0.008, 0.082, "sharp"], [-0.036, 0.031]
    ], {
      at: joint, x: [s, 0, 0], y: [s * 0.18, 1, 0],
      thickness: 0.035, bevel: 0.003, color: C.face, bone: joint,
      name: `white_rimmed_ear_${s > 0 ? "L" : "R"}`
    });
    b.extrude([
      [-0.022, -0.013], [0.023, -0.012], [0.027, 0.019],
      [0.009, 0.059, "sharp"], [-0.022, 0.025]
    ], {
      at: E.p([0, 0, 0.020]), x: [s, 0, 0], y: [s * 0.18, 1, 0],
      thickness: 0.004, color: C.darkRust, bone: joint,
      name: `dark_inner_ear_${s > 0 ? "L" : "R"}`
    });
    b.extrude([
      [-0.012, -0.007], [0.016, -0.006], [0.010, 0.040, "sharp"], [-0.014, 0.017]
    ], {
      at: E.p([0, 0, 0.023]), x: [s, 0, 0], y: [s * 0.18, 1, 0],
      thickness: 0.002, color: C.ginger, bone: joint,
      name: `warm_ear_center_${s > 0 ? "L" : "R"}`
    });
  }

  const tears = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 192">
      <defs>
        <g id="mark">
          <path d="M45 71 C47 47 78 44 97 62 C105 75 95 87 84 91
                   C82 110 91 124 101 133 C79 139 57 123 53 105 C50 91 43 86 45 71Z"
                fill="#a9472d"/>
          <path d="M57 88 C59 106 68 119 83 124" fill="none"
                stroke="#bf5938" stroke-width="6" stroke-linecap="round"/>
          <ellipse cx="35" cy="116" rx="11" ry="6" fill="#e9b59a"/>
        </g>
      </defs>
      <use href="#mark"/>
      <use href="#mark" transform="translate(256 0) scale(-1 1)"/>
    </svg>`, { size: 512 });
  b.decal(face, tears, {
    at: H.p([0, -0.008, 0.105]), dir: [0, 0, 1],
    size: [0.202, 0.1515], segments: 12, lift: 0.0012,
    bone: head, name: "rusty_eye_masks_and_tear_marks"
  });

  const faceSurface = b.surface(face);
  for (const s of [1, -1]) {
    const eyeHit = faceSurface.nearest(H.p([s * 0.044, 0.013, 0.140]));
    const eye = b.stick(new THREE.SphereGeometry(0.016, 10, 8), C.nose, eyeHit, {
      scale: [0.94, 0.62, 1.05], embed: 0.28,
      bone: head, name: `delighted_eye_${s > 0 ? "L" : "R"}`
    });
    const highlight = b.surface(eye).nearest(
      eye.at.clone().add(new THREE.Vector3(-s * 0.004, 0.005, 0.028))
    );
    b.stick(new THREE.SphereGeometry(0.0041, 6, 4), C.face, highlight, {
      embed: 0.28, bone: head, name: `eye_sparkle_${s > 0 ? "L" : "R"}`
    });

    const brow = faceSurface.drape(bezier(
      H.p([s * 0.025, 0.036, 0.123]),
      H.p([s * 0.047, 0.055, 0.121]),
      H.p([s * 0.066, 0.038, 0.115])
    ), { lift: 0.0015 });
    b.sweep(brow, 0.0034, {
      color: C.face, bone: head, sides: 6, name: `lifted_eyebrow_${s > 0 ? "L" : "R"}`
    });
  }

  // Upper muzzle and independently rigged lower jaw leave a cheerful open smile.
  oval("smiling_mouth_cavity", H.p([0, -0.047, 0.096]),
    C.nose, [0.035, 0.022, 0.021], head);
  for (const s of [1, -1]) {
    const muzzle = oval(`upper_muzzle_${s > 0 ? "L" : "R"}`,
      H.p([s * 0.019, -0.031, 0.105]), C.face, [0.028, 0.018, 0.027], head);
    const muzzleSkin = b.surface(muzzle);
    for (let i = 0; i < 3; i++) {
      const hit = muzzleSkin.nearest(H.p([
        s * (0.023 + (i % 2) * 0.010), -0.031 - i * 0.004, 0.140
      ]));
      b.stick(new THREE.SphereGeometry(0.0017, 5, 4), C.darkRust, hit, {
        embed: 0.25, bone: head, name: `whisker_dot_${s}_${i}`
      });
    }
  }
  b.sweep([
    jaw, H.p([0, -0.063, 0.090])
  ], () => [0.033, 0.012], {
    bone: jaw, color: C.face, sides: 8, name: "separate_lower_jaw"
  });
  oval("little_pink_tongue", H.p([0, -0.055, 0.111]),
    C.tongue, [0.017, 0.0055, 0.012], jaw);
  const nose = oval("little_black_nose", H.p([0, -0.019, 0.139]),
    C.nose, [0.014, 0.0095, 0.011], head);
  const noseGlint = b.surface(nose).nearest(H.p([-0.004, -0.015, 0.155]));
  b.stick(new THREE.SphereGeometry(0.0028, 6, 4), "#b7b0a4", noseGlint, {
    embed: 0.4, bone: head, name: "nose_glint"
  });
  b.sweep([
    H.p([0, -0.027, 0.139]), H.p([0, -0.038, 0.133])
  ], 0.0018, { bone: head, color: C.nose, sides: 5, name: "muzzle_center_line" });

  // Bamboo is carried by the gripping wrist, including every leaf and node.
  const holder = limbs[0];
  const B = holder.handRegion;
  const bambooBottom = B.p([0.009, -0.196, 0.007]);
  const bambooTop = B.p([0.080, 0.324, 0.030]);
  const bambooLine = line(bambooBottom, bambooTop);
  b.sweep([bambooBottom, bambooTop], [0.0105, 0.007], {
    bone: holder.arm.tip!, color: C.bamboo, sides: 7, smooth: false,
    sectors: [[-35, -10, C.bambooLight]], caps: "flat", name: "held_bamboo_culm"
  });
  for (let i = 0; i < 6; i++) {
    const t = 0.04 + i * 0.174;
    const at = bambooBottom.clone().lerp(bambooTop, t);
    const r = 0.013 - t * 0.003;
    b.part(new THREE.CylinderGeometry(r, r, 0.007, 7), C.bambooLight, {
      at, dir: bambooLine.axis, bone: holder.arm.tip!, name: `bamboo_node_${i}`
    });
    if (i < 3) {
      b.extrude([
        [-0.009, 0], [0.009, 0], [0.006, 0.022], [-0.002, 0.033, "sharp"]
      ], {
        at: at.clone().add(new THREE.Vector3(0, -0.006, 0.011)),
        x: [1, 0, 0], y: bambooLine.axis, thickness: 0.002,
        color: i % 2 ? C.bambooDark : C.bamboo,
        bone: holder.arm.tip!, name: `bamboo_sheath_${i}`
      });
    }
  }
  b.spike(bambooTop, bambooLine.axis, 0.033, 0.007, {
    bone: holder.arm.tip!, color: C.bambooLight, sides: 7, name: "bamboo_shoot_tip"
  });

  const leafOutline = [
    [0, 0], [-0.010, 0.027], [-0.009, 0.067],
    [0, 0.125, "sharp"], [0.011, 0.069], [0.008, 0.023]
  ] as const;
  const leafSpecs = [
    { t: 0.54, direction: [0.83, 0.53, 0.15], length: 0.95 },
    { t: 0.62, direction: [-0.86, 0.42, 0.15], length: 0.86 },
    { t: 0.76, direction: [0.94, 0.29, 0.05], length: 1.10 },
    { t: 0.79, direction: [0.69, 0.70, -0.12], length: 0.95 },
    { t: 0.86, direction: [-0.79, 0.59, 0.08], length: 0.86 },
    { t: 0.93, direction: [0.65, 0.75, 0.12], length: 0.77 },
    { t: 0.73, direction: [0.78, -0.60, 0.21], length: 0.87 }
  ];
  leafSpecs.forEach((spec, i) => {
    const node = bambooBottom.clone().lerp(bambooTop, spec.t);
    const direction = new THREE.Vector3(...spec.direction).normalize();
    const leafBase = node.clone().addScaledVector(direction, 0.018);
    const across = new THREE.Vector3(direction.y, -direction.x, 0).normalize();
    b.rod(node, leafBase, 0.0023, {
      bone: holder.arm.tip!, color: C.bambooDark, sides: 5, name: `bamboo_petiole_${i}`
    });
    const outline: (number | string)[][] = leafOutline.map(p => [
      p[0] * spec.length, p[1] * spec.length,
      ...(p.length === 3 ? ["sharp"] : [])
    ]);
    b.extrude(outline, {
      at: leafBase, x: across, y: direction, thickness: 0.002,
      color: i % 3 === 0 ? C.leafDark : C.leaf, bone: holder.arm.tip!,
      name: `bamboo_lance_leaf_${i}`
    });
    b.rod(
      leafBase.clone().add(new THREE.Vector3(0, 0, 0.0016)),
      leafBase.clone().addScaledVector(direction, 0.116 * spec.length)
        .add(new THREE.Vector3(0, 0, 0.0016)),
      [0.0012, 0.0005], {
        bone: holder.arm.tip!, color: C.vein, sides: 4, name: `bamboo_leaf_vein_${i}`
      }
    );
  });

  return b.root;
}
```