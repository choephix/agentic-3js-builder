import * as THREE from "three";
import { createBuilder, rng, paint, catmull } from "../../../../src/index";

export const meta = {
  name: "Oh! — startled pufferfish",
  description:
    "A completely inflated, leopard-spotted pufferfish with ivory prickles, anxious eyes, a little puckered mouth, delicate fan fins, and a rising trail of bubbles.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Startled pufferfish", paintSize: 2048 });
  const random = rng(417);
  const CY = 0.47;
  const RX = 0.292;
  const RY = 0.286;
  const RZ = 0.279;
  const center = new THREE.Vector3(0, CY, 0);

  const cream = "#fff4cc";
  const ivory = "#fffbed";
  const gold = "#dbba69";
  const finEdge = "#cba358";
  const ink = "#202936";

  // Skeleton: the inflated body, independently movable face and jaw,
  // extended paired fins, and the short caudal chain.
  const bodyBone = b.joint("body", {
    at: [0, CY, -0.065],
    dir: [0, 0, 1],
    role: "spine",
  });
  const head = b.joint("head", {
    parent: bodyBone,
    at: [0, CY, 0.155],
    dir: [0, 0, 1],
    role: "head",
  });
  const mouthAngle = -11 * Math.PI / 180;
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, CY + RY * Math.sin(mouthAngle), RZ * Math.cos(mouthAngle)],
    dir: [0, -0.12, 1],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    [[0, CY, -0.252], [0, CY, -0.365], [0, CY, -0.55]],
    {
      parent: bodyBone,
      names: ["tail1", "tail2", "tailTip"],
      role: "tail",
    },
  );
  const fins = [1, -1].map((s) => ({
    s,
    joint: b.joint(s > 0 ? "finL" : "finR", {
      parent: bodyBone,
      at: [s * 0.27, CY - 0.012, 0.006],
      dir: [s, 0, -0.27],
      role: "fan",
    }),
  }));

  const smooth = (x: number) => {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
  };
  const blend = (
    a: number[],
    c: number[],
    t: number,
  ): [number, number, number] => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];

  // A small, deliberately spaced collection of broken, irregular rosettes.
  // These are painted rather than raised, so the silhouette stays beautifully simple.
  const rosettes = Array.from({ length: 62 }, (_, i) => {
    const y = -0.11 + ((i + 0.5) / 62) * 1.10;
    const angle = i * 2.39996323 + (random() - 0.5) * 0.22;
    const rr = Math.sqrt(1 - y * y);
    const nx = Math.sin(angle) * rr;
    const nz = Math.cos(angle) * rr;
    const ux = Math.cos(angle);
    const uz = -Math.sin(angle);
    return {
      nx, ny: y, nz,
      ux, uz,
      vx: -y * Math.sin(angle),
      vy: rr,
      vz: -y * Math.cos(angle),
      radius: 0.094 + random() * 0.047,
      stretch: 0.8 + random() * 0.35,
      phase: random() * Math.PI * 2,
      solid: i % 8 === 2,
    };
  });

  const skin = paint((p) => {
    const qx = p.x / RX;
    const qy = (p.y - CY) / RY;
    const qz = p.z / RZ;
    let color = blend(
      [1.0, 0.985, 0.918],
      [0.913, 0.743, 0.356],
      smooth((p.y - (CY - 0.055)) / 0.31),
    );
    const fade = smooth((qy + 0.12) / 0.40);
    if (fade < 0.002 || (qz > 0.79 && qy < 0.19 && Math.abs(qx) < 0.23)) {
      return color;
    }
    for (const r of rosettes) {
      const dx = qx - r.nx;
      const dy = qy - r.ny;
      const dz = qz - r.nz;
      if (dx * dx + dy * dy + dz * dz > 0.05) continue;
      const u = (dx * r.ux + dz * r.uz) / r.stretch;
      const v = dx * r.vx + dy * r.vy + dz * r.vz;
      const angle = Math.atan2(v, u);
      const edge =
        1 + 0.14 * Math.sin(3 * angle + r.phase) +
        0.08 * Math.cos(5 * angle - r.phase);
      const d = Math.sqrt(u * u + v * v) / (r.radius * edge);
      if (d > 1.06) continue;

      if (d < 0.72) {
        color = blend(color, [0.76, 0.545, 0.25], fade * 0.42);
      }
      const broken = Math.sin(3 * angle + r.phase * 1.7) > 0.89;
      const outside = 1 - smooth((d - 0.93) / 0.13);
      const inside = r.solid ? 1 : smooth((d - 0.49) / 0.17);
      const strength = outside * inside * fade * (broken && !r.solid ? 0.16 : 1);
      color = blend(color, [0.335, 0.218, 0.112], strength);
      break;
    }
    return color;
  });

  const body = b.sweep(
    [[0, CY, -RZ], [0, CY, 0], [0, CY, RZ]],
    (t) => {
      const u = 2 * t - 1;
      const r = Math.sqrt(Math.max(0, 1 - u * u));
      return [RX * r, RY * r];
    },
    {
      color: skin,
      bone: [bodyBone, head],
      sides: 20,
      smooth: false,
      caps: "flat",
      name: "inflated_ball",
    },
  );
  const surface = b.surface(body);

  // Short caudal peduncle and a scalloped, vertically spread tail.
  b.sweep(tail, (t) => 0.045 - t * 0.045, {
    from: 0,
    to: 0.43,
    sides: 8,
    color: gold,
    caps: "flat",
    name: "tail_stem",
  });

  const finPaint = paint((_p, _n, uv) => {
    const u = uv[0];
    const v = uv[1];
    const radius = Math.sqrt(u * u + v * v);
    return blend(
      [0.86, 0.665, 0.29],
      [1.0, 0.951, 0.737],
      smooth(radius / 0.18),
    );
  });

  const tailOutline = [
    [0, -0.022], [0.063, -0.068], [0.144, -0.124],
    [0.183, -0.103], [0.173, -0.056], [0.194, 0],
    [0.173, 0.056], [0.183, 0.103], [0.144, 0.124],
    [0.063, 0.068], [0, 0.022],
  ];
  const tailFan = b.extrude(tailOutline, {
    at: tail.joints[1],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.019,
    color: finPaint,
    bone: tail.joints[1],
    name: "scalloped_tail_fan",
  });
  const tailEnds = [
    [0.144, -0.12], [0.178, -0.10], [0.173, -0.055],
    [0.19, 0], [0.173, 0.055], [0.178, 0.10], [0.144, 0.12],
  ];
  for (const side of [-1, 1]) {
    for (const [u, v] of tailEnds) {
      b.sweep(
        [
          tailFan.local([0.012, v * 0.08, side * 0.010]),
          tailFan.local([u * 0.52, v * 0.47, side * 0.0105]),
          tailFan.local([u, v, side * 0.010]),
        ],
        [0.003, 0.0015],
        { color: cream, bone: tail.joints[1], sides: 5, name: "tail_ray" },
      );
    }
  }
  b.sweep(
    tailOutline.slice(2, 9).map(([u, v]) => tailFan.local([u, v, 0])),
    0.003,
    { color: finEdge, bone: tail.joints[1], sides: 6, name: "tail_scalloped_edge" },
  );

  // Small paddle-like fins, held away from the inflated body.
  for (const { s, joint } of fins) {
    const fin = b.extrude(
      [
        [0, -0.017], [0.056, -0.05], [0.111, -0.067],
        [0.147, -0.047], [0.137, -0.024], [0.163, 0.006],
        [0.144, 0.031], [0.143, 0.057], [0.105, 0.077],
        [0.047, 0.049], [0, 0.019],
      ],
      {
        at: joint,
        x: [s, 0, -0.27],
        y: [0, 1, 0],
        thickness: 0.009,
        color: finPaint,
        bone: joint,
        name: s > 0 ? "left_flutter_fin" : "right_flutter_fin",
      },
    );
    const out = fin.axis.z > 0 ? 1 : -1;
    const ends = [
      [0.109, -0.063], [0.144, -0.045], [0.158, 0.006],
      [0.139, 0.055], [0.104, 0.073],
    ];
    for (const [u, v] of ends) {
      b.sweep(
        [
          fin.local([0.01, v * 0.08, out * 0.005]),
          fin.local([u * 0.53, v * 0.48, out * 0.0055]),
          fin.local([u, v, out * 0.005]),
        ],
        [0.0028, 0.0013],
        { color: cream, bone: joint, sides: 5, name: "pectoral_fin_ray" },
      );
    }
    // The little gill opening is just ahead of the fin hinge.
    const gill = surface.drape(catmull([
      [s * 0.238, CY + 0.018, 0.139],
      [s * 0.253, CY - 0.01, 0.137],
      [s * 0.24, CY - 0.045, 0.139],
    ]), { lift: 0.001 });
    b.sweep(gill, [0.0032, 0.0015], {
      color: "#ac8746", sides: 5, bone: bodyBone, name: "gill_slit",
    });
  }

  // Bulging round eyes with raised inner brows and pupils anxiously looking in.
  for (const s of [1, -1]) {
    const hit = surface.around(center).at(s * 25, 20);
    const socket = b.stick(new THREE.SphereGeometry(1, 14, 10), gold, hit, {
      scale: [0.087, 0.029, 0.091],
      embed: 0.48,
      bone: head,
      name: s > 0 ? "eye_socketL" : "eye_socketR",
    });
    const eye = b.stick(new THREE.SphereGeometry(1, 16, 12), "#fffdf0", hit, {
      scale: [0.072, 0.052, 0.077],
      embed: 0.24,
      bone: head,
      name: s > 0 ? "eyeL" : "eyeR",
    });
    (eye.mesh.material as THREE.MeshStandardMaterial).roughness = 0.38;

    const eyeSurface = b.surface(eye);
    const irisHit = eyeSurface.around(eye.at).at(-s * 13, 9);
    const iris = b.stick(new THREE.SphereGeometry(1, 12, 8), "#89643d", irisHit, {
      scale: [0.040, 0.010, 0.043],
      embed: 0.3,
      bone: head,
      name: "warm_iris",
    });
    const pupilHit = b.surface(iris).around(iris.at).at(0, 0);
    const pupil = b.stick(new THREE.SphereGeometry(1, 12, 8), ink, pupilHit, {
      scale: [0.032, 0.007, 0.036],
      embed: 0.25,
      bone: head,
      name: "worried_pupil",
    });
    (pupil.mesh.material as THREE.MeshStandardMaterial).roughness = 0.22;
    const pupilSurface = b.surface(pupil);
    b.stick(
      new THREE.SphereGeometry(0.009, 8, 6),
      "#ffffff",
      pupilSurface.around(pupil.at).at(-26, 34),
      { embed: 0.52, bone: head, name: "eye_catchlight" },
    );
    b.stick(
      new THREE.SphereGeometry(0.0038, 6, 4),
      "#ffffff",
      pupilSurface.around(pupil.at).at(28, -29),
      { embed: 0.5, bone: head, name: "eye_catchlight_small" },
    );

    const e = eye.at;
    const lidPath = eyeSurface.drape(catmull([
      [e.x - s * 0.054, e.y + 0.050, e.z + 0.034],
      [e.x - s * 0.008, e.y + 0.072, e.z + 0.035],
      [e.x + s * 0.040, e.y + 0.049, e.z + 0.04],
      [e.x + s * 0.063, e.y + 0.020, e.z + 0.026],
    ]), { lift: 0.001 });
    b.sweep(lidPath, 0.006, {
      color: gold, bone: head, sides: 6, name: "worried_upper_lid",
    });

    const c = socket.at;
    const browPath = b.surface(socket).drape(catmull([
      [c.x - s * 0.043, c.y + 0.083, c.z + 0.025],
      [c.x - s * 0.013, c.y + 0.091, c.z + 0.025],
      [c.x + s * 0.034, c.y + 0.068, c.z + 0.025],
    ]), { lift: 0.0015 });
    b.sweep(browPath, [0.005, 0.0035], {
      color: "#9b753a", bone: head, sides: 6, name: "raised_anxious_brow",
    });
  }

  // The tiny "oh!" mouth is a real hollow pout, split into upper and lower jaws.
  const mouthHit = surface.around(center).at(0, -11);
  b.part(new THREE.SphereGeometry(1, 12, 8), "#624a38", {
    at: mouthHit.local([0, 0.019, 0]),
    dir: mouthHit.axis,
    scale: [0.019, 0.006, 0.014],
    bone: head,
    name: "mouth_cavity",
  });
  for (const lower of [false, true]) {
    const start = lower ? Math.PI : 0;
    const back: THREE.Vector3[] = [];
    const front: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = start + (i / 10) * Math.PI;
      back.push(mouthHit.local([
        0.027 * Math.cos(a), -0.003, 0.020 * Math.sin(a),
      ]));
      front.push(mouthHit.local([
        0.020 * Math.cos(a), 0.029, 0.014 * Math.sin(a),
      ]));
    }
    b.membrane(back, front, {
      color: lower ? "#f1d7a7" : "#ead09a",
      thickness: 0.004,
      rows: 2,
      cols: 10,
      bone: lower ? jaw : head,
      name: lower ? "lower_pout" : "upper_pout",
    });
    b.sweep(front, lower ? 0.007 : 0.006, {
      color: lower ? "#edbd91" : "#dbac7f",
      bone: lower ? jaw : head,
      sides: 7,
      name: lower ? "lower_lip" : "upper_lip",
    });
  }

  // Short prickles grow directly out of the skin, leaving the face readable.
  const spikeHits = surface.scatter(186, {
    rng: rng(902),
    minDist: 0.040,
    filter: (h) => {
      const p = h.at;
      if (p.z > 0.15) {
        for (const s of [1, -1]) {
          const ex = (p.x - s * 0.119) / 0.108;
          const ey = (p.y - (CY + 0.095)) / 0.109;
          if (ex * ex + ey * ey < 1) return false;
        }
        const mx = p.x / 0.055;
        const my = (p.y - (CY - 0.055)) / 0.048;
        if (mx * mx + my * my < 1) return false;
      }
      if (Math.abs(p.x) > 0.245 &&
          Math.abs(p.y - (CY - 0.012)) < 0.044 &&
          Math.abs(p.z) < 0.065) return false;
      if (p.z < -0.255 && Math.abs(p.y - CY) < 0.043) return false;
      return true;
    },
  });
  const thornRandom = rng(192);
  for (const hit of spikeHits) {
    const length = 0.019 + thornRandom() * 0.014;
    const radius = 0.006 + thornRandom() * 0.0022;
    b.stick(
      new THREE.ConeGeometry(radius, length, 5),
      hit.at.y > CY + 0.04 ? cream : ivory,
      hit,
      { embed: 0.15, name: "short_ivory_prickle" },
    );
  }

  // Pale glass bubbles: transparent volume, a delicate contour, and painted-looking
  // crescent highlights. They remain legible even against a light background.
  const bubbles = [
    { p: [-0.023, 0.478, 0.357], r: 0.014 },
    { p: [-0.037, 0.592, 0.395], r: 0.021 },
    { p: [-0.064, 0.754, 0.421], r: 0.027 },
    { p: [-0.034, 0.930, 0.438], r: 0.035 },
  ];
  for (const { p, r } of bubbles) {
    const bubble = b.part(new THREE.SphereGeometry(r, 16, 10), "#bce8ec", {
      at: p,
      bone: bodyBone,
      name: "bubble_glass",
    });
    const glass = bubble.mesh.material as THREE.MeshStandardMaterial;
    glass.transparent = true;
    glass.opacity = 0.19;
    glass.roughness = 0.12;
    glass.depthWrite = false;

    b.part(new THREE.TorusGeometry(r * 0.966, r * 0.035, 5, 20), "#a6d8df", {
      at: p,
      bone: bodyBone,
      name: "bubble_contour",
    });
    const crescent: number[][] = [];
    for (let i = 0; i <= 6; i++) {
      const a = (104 + i * 9) * Math.PI / 180;
      crescent.push([
        p[0] + Math.cos(a) * r * 0.72,
        p[1] + Math.sin(a) * r * 0.72,
        p[2] + r * 0.69,
      ]);
    }
    b.sweep(crescent, r * 0.068, {
      color: "#ffffff",
      sides: 5,
      bone: bodyBone,
      name: "bubble_highlight",
    });
    b.part(new THREE.SphereGeometry(r * 0.065, 6, 4), "#efffff", {
      at: [p[0] + r * 0.43, p[1] - r * 0.40, p[2] + r * 0.80],
      bone: bodyBone,
      name: "bubble_glint",
    });
  }

  return b.root;
}
