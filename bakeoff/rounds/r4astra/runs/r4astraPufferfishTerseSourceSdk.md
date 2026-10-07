```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  paint,
  mottle,
  spots,
  mix,
  smoothstep,
} from "agentic-3js-builder";
import type { Joint, Chain } from "agentic-3js-builder";

export const meta = {
  name: "Golden Pufferfish",
  description:
    "An inflated, honey-gold pufferfish with a spotted back, ivory prickles, inquisitive eyes, a little beaked mouth, and delicately ribbed amber fins.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({ name: "Golden Pufferfish", detail: 0.8, paintSize: 1024 });
  const random = rng(7419);
  const CY = 0.222;
  type P = [number, number, number];

  const C = {
    honey: "#D9AE50",
    gold: "#B98936",
    darkGold: "#89642E",
    spot: "#665039",
    cream: "#F4E3B3",
    ivory: "#FFF0CC",
    thorn: "#F4DDA0",
    thornTip: "#D6B875",
    socket: "#AD813B",
    eyeWhite: "#FFF3D6",
    eyeRim: "#51462C",
    iris: "#80958A",
    irisLight: "#D1C477",
    pupil: "#152E31",
    white: "#FFFDF0",
    lip: "#CF9D4D",
    lowerLip: "#E8CB8C",
    mouth: "#4A3430",
    finRoot: "#C77536",
    finMiddle: "#EDA650",
    finEdge: "#FAD582",
    finRim: "#A86C34",
    ray: "#FFE1A0",
    gill: "#795A32",
  };

  // Skeleton first: a short axial skeleton, a separate head and lower jaw,
  // and individually articulated rays in every extended fin.
  const root = b.joint("root", { at: [0, CY, -0.035] });
  const spine = b.chain(
    "spine",
    [
      [0, CY, -0.153],
      [0, CY, -0.068],
      [0, CY, 0.044],
      [0, CY, 0.11],
    ],
    {
      parent: root,
      names: ["spine1", "spine2", "chest", "headBase"],
      role: "spine",
      up: [0, 1, 0],
    },
  );
  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, CY, 0.11],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, CY - 0.035, 0.167],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    [
      [0, CY, -0.15],
      [0, CY, -0.211],
      [0, CY, -0.265],
    ],
    {
      parent: spine.joints[0],
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
      up: [0, 1, 0],
    },
  );

  type FanRig = {
    name: string;
    hinge: Joint;
    rays: Chain[];
    tips: THREE.Vector3[];
    small: boolean;
  };

  function fanRig(
    name: string,
    origin: P,
    ends: P[],
    parent: Joint,
    small = false,
  ): FanRig {
    const hinge = b.joint(name, {
      parent,
      at: origin,
      aim: ends[Math.floor(ends.length / 2)],
      role: name.startsWith("pectoral") ? "wing" : "fan",
    });
    const tips = ends.map((p) => new THREE.Vector3(...p));
    const rays = tips.map((tip, i) => {
      const middle = new THREE.Vector3(...origin).lerp(tip, 0.57);
      if (name.startsWith("pectoral")) middle.z += 0.009;
      const rayName = `${name}Ray${i + 1}`;
      return b.chain(rayName, catmull([origin, middle, tip]), {
        parent: hinge,
        names: [rayName, `${rayName}Tip`],
        role: "fan",
        count: 2,
      });
    });
    return { name, hinge, rays, tips, small };
  }

  const pectorals: FanRig[] = [];
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const ends: P[] = Array.from({ length: 7 }, (_, i) => {
      const a = ((-68 + (136 * i) / 6) * Math.PI) / 180;
      return [
        s * (0.175 + 0.121 * Math.cos(a)),
        CY - 0.003 + 0.063 * Math.sin(a),
        -0.058 - 0.021 * Math.cos(a),
      ];
    });
    pectorals.push(
      fanRig(
        `pectoral${side}`,
        [s * 0.163, CY - 0.003, 0.009],
        ends,
        spine.joints[2],
      ),
    );
  }

  const tailEnds: P[] = Array.from({ length: 9 }, (_, i) => {
    const a = ((-65 + (130 * i) / 8) * Math.PI) / 180;
    return [0, CY + 0.106 * Math.sin(a), -0.275 - 0.13 * Math.cos(a)];
  });
  const caudal = fanRig("caudalFin", [0, CY, -0.258], tailEnds, tail.tip!);

  const dorsal = fanRig(
    "dorsalFin",
    [0, CY + 0.132, -0.112],
    [
      [0, CY + 0.202, -0.070],
      [0, CY + 0.228, -0.096],
      [0, CY + 0.235, -0.132],
      [0, CY + 0.209, -0.171],
      [0, CY + 0.166, -0.197],
    ],
    spine.joints[0],
    true,
  );
  const anal = fanRig(
    "analFin",
    [0, CY - 0.128, -0.11],
    [
      [0, CY - 0.183, -0.094],
      [0, CY - 0.197, -0.132],
      [0, CY - 0.185, -0.167],
      [0, CY - 0.150, -0.198],
    ],
    spine.joints[0],
    true,
  );

  // A simple faceted balloon, with the fine camouflage carried by paint.
  const goldSkin = mottle("#D6AC4D", "#E4BE68", {
    size: 0.043,
    seed: 23,
    contrast: 0.8,
  });
  const spottedSkin = spots(goldSkin, [C.spot, "#80633B", "#534B35"], {
    size: 0.043,
    amount: 0.42,
    seed: 81,
  });
  const belly = mottle("#F5E5B9", "#EAD5A4", {
    size: 0.075,
    seed: 17,
    contrast: 0.55,
  });
  const coat = paint((p, n) => {
    const border =
      CY - 0.008 +
      0.009 * Math.sin(p.z * 33 + p.x * 12) +
      0.004 * Math.sin(p.x * 57);
    const blend = smoothstep(border - 0.028, border + 0.043, p.y);
    return mix(belly.at(p, n), spottedSkin.at(p, n), blend);
  });

  const body = b.loft(
    [
      { at: [0, CY, -0.162], w: 0.052, h: 0.058 },
      { at: [0, CY, -0.126], w: 0.236, h: 0.244 },
      { at: [0, CY, -0.061], w: 0.335, h: 0.343 },
      { at: [0, CY, 0.025], w: 0.358, h: 0.354 },
      { at: [0, CY, 0.106], w: 0.292, h: 0.290 },
      { at: [0, CY, 0.158], w: 0.163, h: 0.167 },
      { at: [0, CY, 0.182], w: 0.046, h: 0.055 },
    ],
    {
      name: "inflatedBody",
      color: coat,
      bone: [spine, head],
      sides: 16,
      smooth: false,
      caps: "round",
      up: [0, 1, 0],
    },
  );
  const skin = b.surface(body);

  b.sweep(
    tail,
    (t) => [0.036 * (1 - t) + 0.012 * t, 0.039 * (1 - t) + 0.017 * t],
    {
      name: "tailPeduncle",
      sides: 10,
      smooth: false,
      color: coat,
      bands: [
        [0.64, coat],
        [0.82, C.gold],
        [1, C.finRoot],
      ],
      caps: "round",
    },
  );

  const finPaint = paint((_p, _n, s) => {
    const t = s[0];
    if (t > 0.951) return C.finRim;
    if (t < 0.5) return mix(C.finRoot, C.finMiddle, smoothstep(0.08, 0.5, t));
    return mix(C.finMiddle, C.finEdge, smoothstep(0.5, 0.95, t));
  });

  function buildFan(fan: FanRig) {
    for (let i = 0; i < fan.rays.length - 1; i++) {
      b.membrane(fan.rays[i], fan.rays[i + 1], {
        name: `${fan.name}Web${i + 1}`,
        color: finPaint,
        thickness: fan.small ? 0.0012 : 0.0016,
        rows: 2,
        cols: 5,
        scallop: 0.045,
      });
    }
    fan.rays.forEach((ray, i) => {
      b.sweep(ray, fan.small ? [0.0018, 0.0008] : [0.0025, 0.0011], {
        name: `${fan.name}Rib${i + 1}`,
        color: C.ray,
        sides: 5,
        smooth: false,
        caps: "round",
      });
    });
    b.sweep(catmull(fan.tips), fan.small ? 0.0011 : 0.0015, {
      name: `${fan.name}ScallopedEdge`,
      bone: fan.rays,
      color: C.finRim,
      sides: 5,
      smooth: false,
      caps: "round",
    });
  }
  [...pectorals, caudal, dorsal, anal].forEach(buildFan);

  // Small fleshy hinges cover the beginnings of the paired fans.
  pectorals.forEach((fin, i) => {
    const s = i === 0 ? 1 : -1;
    const hit = skin.ray([s * 0.4, CY - 0.003, 0.009], [-s, 0, 0])!;
    b.stick(new THREE.SphereGeometry(1, 10, 6), C.gold, hit, {
      name: `${fin.name}Socket`,
      bone: fin.hinge,
      scale: [0.025, 0.011, 0.022],
      embed: 0.55,
      flat: true,
    });
  });

  // Prickles sit on the actual polygonal skin and inherit its skeletal weights.
  const prickles = skin.scatter(116, {
    rng: random,
    minDist: 0.027,
    keepOut: (p) => {
      if (p.z > 0.119) return true;
      if (
        Math.abs(p.x) > 0.137 &&
        Math.abs(p.y - CY) < 0.048 &&
        p.z > -0.035 &&
        p.z < 0.068
      ) return true;
      if (Math.abs(p.x) < 0.024 && p.z < -0.076 && p.z > -0.168) return true;
      return false;
    },
  });

  prickles.forEach((hit, i) => {
    const upper = hit.at.y > CY + 0.015;
    const lower = hit.at.y < CY - 0.065;
    const length = (lower ? 0.021 : 0.026) + random() * (upper ? 0.016 : 0.01);
    const radius = 0.0049 + random() * 0.0024;
    const baseColor = upper ? C.darkGold : lower ? C.cream : C.honey;

    b.stick(new THREE.SphereGeometry(1, 7, 4), baseColor, hit, {
      name: `prickleSeat${i + 1}`,
      scale: [radius * 1.38, 0.0023, radius * 1.38],
      embed: 0.35,
      flat: true,
    });
    b.spike(hit.moved([0, -0.0015, 0]), hit, length + 0.0015, radius, {
      name: `prickle${i + 1}`,
      sides: 5,
      smooth: false,
      color: C.thorn,
      bands: [
        [0.16, upper ? C.gold : C.cream],
        [0.88, lower ? C.ivory : C.thorn],
        [1, C.thornTip],
      ],
    });
  });

  // A few smaller cheek tubercles ease the transition into the clean face.
  const cheekHits = skin.scatter(14, {
    rng: random,
    minDist: 0.018,
    filter: (h) =>
      h.at.z > 0.098 &&
      h.at.z < 0.151 &&
      h.at.y < CY + 0.012 &&
      h.at.y > CY - 0.09 &&
      Math.abs(h.at.x) > 0.066,
  });
  cheekHits.forEach((hit, i) => {
    b.stick(new THREE.ConeGeometry(0.004, 0.011, 5), C.ivory, hit, {
      name: `cheekPrickle${i + 1}`,
      embed: 0.22,
      flat: true,
    });
  });

  // Dark, curved gill slits, tucked just in front of the swimming fins.
  for (const s of [1, -1]) {
    const gillPath = skin.drape(
      catmull([
        [s * 0.19, CY + 0.027, 0.059],
        [s * 0.195, CY + 0.007, 0.069],
        [s * 0.19, CY - 0.016, 0.064],
        [s * 0.18, CY - 0.029, 0.052],
      ]),
      { lift: 0.0016 },
    );
    b.sweep(gillPath, 0.0021, {
      name: s === 1 ? "gillL" : "gillR",
      color: C.gill,
      sides: 5,
      caps: "round",
      smooth: false,
    });
  }

  // The bulging eyes are layered primitives rather than a painted-on face.
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const hit = skin.around([0, CY, 0.012]).at(s * 37, 22)!;
    const gaze = hit.n;

    b.stick(new THREE.SphereGeometry(1, 12, 8), C.socket, hit, {
      name: `eyeSocket${side}`,
      bone: head,
      scale: [0.046, 0.019, 0.046],
      embed: 0.37,
      flat: true,
    });
    const eyeball = b.stick(new THREE.SphereGeometry(1, 16, 10), C.eyeWhite, hit, {
      name: `eyeball${side}`,
      bone: head,
      scale: [0.0375, 0.032, 0.039],
      embed: 0.25,
    });

    const eyeFront = b
      .surface(eyeball)
      .ray(eyeball.at.clone().addScaledVector(gaze, 0.14), gaze.clone().negate())!;
    const irisCenter = eyeFront.at.clone().addScaledVector(gaze, 0.0028);

    b.part(new THREE.CylinderGeometry(0.0253, 0.0253, 0.003, 20), C.eyeRim, {
      name: `irisRim${side}`,
      at: irisCenter,
      dir: gaze,
      bone: head,
    });
    b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.0036, 20), C.iris, {
      name: `iris${side}`,
      at: irisCenter.clone().addScaledVector(gaze, 0.0017),
      dir: gaze,
      bone: head,
    });

    b.ring(frame(irisCenter, gaze), { count: 15, radius: 0.0197 }, (item) => {
      b.part(new THREE.BoxGeometry(0.00115, 0.0041, 0.0008), C.irisLight, {
        name: `irisFleck${side}${item.i + 1}`,
        frame: item,
        at: item.at.addScaledVector(gaze, 0.004),
        bone: head,
      });
    });

    const pupilCenter = irisCenter.clone().addScaledVector(gaze, 0.0042);
    b.part(new THREE.SphereGeometry(1, 14, 8), C.pupil, {
      name: `pupil${side}`,
      at: pupilCenter,
      dir: gaze,
      axis: "z",
      scale: [0.0148, 0.0164, 0.0034],
      bone: head,
    });

    const ex = new THREE.Vector3(1, 0, 0)
      .addScaledVector(gaze, -gaze.x)
      .normalize();
    const ey = new THREE.Vector3().crossVectors(gaze, ex).normalize();
    const glint = pupilCenter
      .clone()
      .addScaledVector(gaze, 0.0033)
      .addScaledVector(ex, -0.005)
      .addScaledVector(ey, 0.0067);
    b.part(new THREE.SphereGeometry(1, 8, 6), C.white, {
      name: `eyeCatchlight${side}`,
      at: glint,
      axis: "z",
      dir: gaze,
      scale: [0.0051, 0.0051, 0.0015],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), C.white, {
      name: `eyeSmallCatchlight${side}`,
      at: pupilCenter
        .clone()
        .addScaledVector(gaze, 0.0038)
        .addScaledVector(ex, 0.006)
        .addScaledVector(ey, -0.0052),
      axis: "z",
      dir: gaze,
      scale: [0.002, 0.002, 0.0009],
      bone: head,
    });

    const browCenter = hit.at.clone().addScaledVector(gaze, 0.012);
    const browPoints = b.ring(frame(browCenter, gaze), {
      count: 7,
      radius: 0.0395,
      fromDeg: -65,
      toDeg: 65,
    }).items.map((item) => item.at);
    b.sweep(catmull(browPoints), 0.0033, {
      name: `goldenBrow${side}`,
      bone: head,
      color: C.honey,
      sides: 6,
      smooth: false,
      caps: "round",
    });
  }

  // Paired tiny nostrils, seated on the snout instead of floating in front.
  for (const s of [1, -1]) {
    const hit = skin.ray([s * 0.028, CY + 0.019, 0.35], [0, 0, -1])!;
    const pad = b.stick(new THREE.SphereGeometry(1, 8, 6), C.honey, hit, {
      name: s === 1 ? "nostrilPadL" : "nostrilPadR",
      bone: head,
      scale: [0.007, 0.0036, 0.0055],
      embed: 0.32,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), C.gill, {
      name: s === 1 ? "nostrilL" : "nostrilR",
      at: pad.at.clone().addScaledVector(hit.n, 0.0036),
      axis: "z",
      dir: hit.n,
      scale: [0.0028, 0.0018, 0.0011],
      bone: head,
    });
  }

  // A separate upper muzzle and lower jaw make the small puckered mouth riggable.
  const mouthHit = skin.ray([0, CY - 0.021, 0.4], [0, 0, -1])!;
  const mz = mouthHit.at.z + 0.024;
  const my = CY - 0.027;

  b.part(new THREE.SphereGeometry(1, 12, 8), C.honey, {
    name: "upperMuzzle",
    at: [0, CY - 0.013, mz - 0.008],
    scale: [0.031, 0.020, 0.023],
    bone: head,
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), C.cream, {
    name: "lowerJaw",
    at: [0, CY - 0.045, mz - 0.008],
    scale: [0.029, 0.014, 0.026],
    bone: jaw,
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 14, 8), C.mouth, {
    name: "mouthInterior",
    at: [0, my, mz + 0.0165],
    scale: [0.0168, 0.0095, 0.0018],
    bone: jaw,
  });

  function lipArc(upper: boolean) {
    const points: P[] = Array.from({ length: 11 }, (_, i) => {
      const a = (Math.PI * i) / 10;
      return [
        Math.cos(a) * 0.0195,
        my + Math.sin(a) * (upper ? 0.0115 : -0.0115),
        mz + 0.015,
      ];
    });
    b.sweep(catmull(points), upper ? 0.0041 : 0.0045, {
      name: upper ? "upperLip" : "lowerLip",
      bone: upper ? head : jaw,
      color: upper ? C.lip : C.lowerLip,
      sides: 7,
      smooth: false,
      caps: "round",
    });
  }
  lipArc(true);
  lipArc(false);

  b.extrude(
    [
      [-0.0075, 0.003],
      [0.0075, 0.003],
      [0.0055, -0.002],
      [-0.0055, -0.002],
    ],
    {
      name: "upperBeak",
      at: [0, my + 0.0042, mz + 0.019],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.0022,
      bevel: 0.0005,
      color: C.ivory,
      bone: head,
    },
  );
  b.part(new THREE.BoxGeometry(0.00065, 0.004, 0.00065), C.mouth, {
    name: "beakCenterSeam",
    at: [0, my + 0.004, mz + 0.0203],
    bone: head,
  });
  b.extrude(
    [
      [-0.0058, -0.002],
      [0.0058, -0.002],
      [0.0048, 0.001],
      [-0.0048, 0.001],
    ],
    {
      name: "lowerBeak",
      at: [0, my - 0.006, mz + 0.019],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.002,
      color: C.ivory,
      bone: jaw,
    },
  );

  b.material(C.pupil).roughness = 0.24;
  b.material(C.eyeWhite).roughness = 0.42;
  b.material(C.iris).roughness = 0.38;
  b.material(C.white).roughness = 0.28;

  // Ground the lowest prickle without adding a pedestal to the fish.
  const model = b.root;
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  model.position.y -= bounds.min.y;
  model.updateMatrixWorld(true);
  return b.root;
}
```