import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { metal, panelled, gearGeometry } from "../kits/clockwork";
import { glow } from "../kits/glow";
import { svg } from "../src/texture";

const CHROME = metal("steel", { polish: 0.95, tarnish: 0.03, size: 0.22 });
const BLACK = metal("iron", { polish: 0.5, tarnish: 0.15, size: 0.09 });
const BRASS = metal("brass", { polish: 0.7, size: 0.06 });
const GILT = metal("gilt", { polish: 0.6, size: 0.05 });
const PANEL = panelled(metal("steel", { polish: 0.9, tarnish: 0.03, size: 0.22 }), { size: 0.11, rivets: 0.035 });

const sunburstTex = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#c9a227" stroke-width="4"><circle cx="64" cy="118" r="10" fill="#c9a227" stroke="none"/>${Array.from(
    { length: 13 },
    (_, i) => {
      const a = (-80 + i * (160 / 12)) * (Math.PI / 180);
      const x2 = 64 + Math.sin(a) * 95;
      const y2 = 118 - Math.cos(a) * 95;
      const x1 = 64 + Math.sin(a) * 16;
      const y1 = 118 - Math.cos(a) * 16;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    },
  ).join(
    "",
  )}<path d="M14 118 A50 50 0 0 1 114 118" stroke-width="5"/><path d="M26 118 A38 38 0 0 1 102 118" stroke-width="3"/></g></svg>`,
  { size: 256 },
);
const chevronTex = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#c9a227" stroke-width="5"><path d="M6 22 L32 36 L58 22"/><path d="M6 36 L32 50 L58 36"/></g></svg>`,
  { size: 128 },
);
const grilleTex = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="#111111"/><g stroke="#c9a227" stroke-width="3"><line x1="10" y1="4" x2="10" y2="28"/><line x1="20" y1="4" x2="20" y2="28"/><line x1="30" y1="4" x2="30" y2="28"/><line x1="40" y1="4" x2="40" y2="28"/><line x1="50" y1="4" x2="50" y2="28"/></g></svg>`,
  { size: 128 },
);

export const meta = {
  name: "Art Deco Robot Butler",
  description: "Streamline moderne chrome robot butler with tray and cloche.",
};

export default function build() {
  const b = createBuilder({ name: "artDecoRobotButler" });

  const pelvis = b.joint("pelvis", { at: [0, 1.02, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 1.02, 0],
      [0, 1.28, 0.01],
      [0, 1.48, 0.02],
    ]),
    {
      parent: pelvis,
      role: "spine",
      names: ["waist", "chest"],
    },
  );
  const chestJ = spine.joints[1];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.48, 0.02],
      [0, 1.58, 0.03],
    ]),
    {
      parent: chestJ,
      role: "neck",
      names: ["neckBase"],
    },
  );
  const head = b.joint("head", {
    parent: neck.joints[0],
    at: [0, 1.68, 0.04],
    dir: [0, 0.25, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.615, 0.13], aim: [0, 1.6, 0.6], role: "jaw", group: "head" });

  const armL = b.chain(
    "armL",
    catmull([
      [0.2, 1.44, 0.02],
      [0.38, 1.3, 0.1],
      [0.52, 1.12, 0.26],
    ]),
    {
      parent: chestJ,
      role: "arm",
      names: ["shoulderL", "elbowL", "wristL"],
    },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.2, 1.44, 0.02],
      [-0.38, 1.3, 0.1],
      [-0.5, 1.1, 0.3],
    ]),
    {
      parent: chestJ,
      role: "arm",
      names: ["shoulderR", "elbowR", "wristR"],
    },
  );
  const legL = b.chain(
    "legL",
    polyline([
      [0.11, 1.0, 0],
      [0.12, 0.55, 0.02],
      [0.12, 0.14, 0.05],
    ]),
    {
      parent: pelvis,
      role: "leg",
      names: ["hipL", "kneeL", "ankleL"],
    },
  );
  const legR = b.chain(
    "legR",
    polyline([
      [-0.11, 1.0, 0],
      [-0.12, 0.55, 0.02],
      [-0.12, 0.14, 0.05],
    ]),
    {
      parent: pelvis,
      role: "leg",
      names: ["hipR", "kneeR", "ankleR"],
    },
  );

  // torso
  b.loft(
    [
      { at: [0, 1.0, 0], w: 0.34, h: 0.24 },
      { at: [0, 1.18, 0.01], w: 0.4, h: 0.28 },
      { at: [0, 1.36, 0.02], w: 0.44, h: 0.3 },
      { at: [0, 1.5, 0.02], w: 0.36, h: 0.24 },
    ],
    { bone: [pelvis, spine], color: PANEL },
  );
  b.sweep(
    polyline([
      [0, 1.04, 0],
      [0, 1.13, 0.005],
    ]),
    [0.185, 0.205],
    { bone: pelvis, color: BLACK, section: { ngon: 8 } },
  );
  b.sweep(
    polyline([
      [0, 1.135, 0.006],
      [0, 1.155, 0.008],
    ]),
    [0.2, 0.205],
    { bone: pelvis, color: BRASS, section: { ngon: 8 } },
  );
  // shirt front + buttons + bow tie
  b.part(new THREE.BoxGeometry(0.13, 0.3, 0.02), "#f4efe2", { bone: chestJ, at: [0, 1.36, 0.175] });
  for (let i = 0; i < 3; i++)
    b.part(new THREE.SphereGeometry(0.012, 8, 6), BRASS, { bone: chestJ, at: [0, 1.28 + i * 0.07, 0.19] });
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.035, 0.06, 4), "#14100c", {
      bone: chestJ,
      at: [s * 0.055, 1.5, 0.14],
      rotation: [90, 0, s * 90],
    });
  b.part(new THREE.BoxGeometry(0.032, 0.032, 0.03), GILT, { bone: chestJ, at: [0, 1.5, 0.145] });
  b.decal(chestJ as unknown as never, chevronTex, {
    at: [0, 1.37, 0.2],
    dir: [0, 0, 1],
    size: [0.11, 0.11],
    bone: chestJ,
    color: "#ffffff",
  } as never);
  b.decal(chestJ as unknown as never, sunburstTex, {
    at: [0, 1.4, -0.16],
    dir: [0, 0, -1],
    size: [0.3, 0.2],
    bone: chestJ,
    color: "#ffffff",
  } as never);

  // tailcoat tails
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.13, 0.02],
        [0.15, -0.3],
        [0.07, -0.42, "sharp"],
        [0.0, -0.3],
      ],
      { at: [s * 0.07, 1.04, -0.15], x: [s, 0, 0], thickness: 0.025, smoothing: 1, color: BLACK, bone: pelvis },
    );
  // epaulettes
  for (const s of [1, -1]) {
    const sx = s * 0.23;
    b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.03, 12), BRASS, { bone: chestJ, at: [sx, 1.47, 0.02] });
    b.part(new THREE.CylinderGeometry(0.055, 0.07, 0.03, 12), BLACK, { bone: chestJ, at: [sx, 1.5, 0.02] });
    b.part(new THREE.CylinderGeometry(0.035, 0.05, 0.03, 12), GILT, { bone: chestJ, at: [sx, 1.53, 0.02] });
  }

  // head dome (absolute coords, head at y~1.68)
  b.lathe(
    [
      [0.001, 0],
      [0.11, 0.0],
      [0.125, 0.03],
      [0.12, 0.1],
      [0.085, 0.16],
      [0.03, 0.19],
      [0.001, 0.2],
    ],
    { at: [0, 1.62, 0.03], bone: head, segments: 20, color: CHROME },
  );
  b.lathe(
    [
      [0.001, 0],
      [0.122, 0],
      [0.122, 0.025],
      [0.001, 0.025],
    ],
    { at: [0, 1.685, 0.03], bone: head, segments: 20, color: BRASS },
  );
  b.part(new THREE.SphereGeometry(0.018, 10, 8), BRASS, { bone: head, at: [0, 1.828, 0.03] });
  b.spike([0, 1.8, 0.03], [0, 1, 0], 0.035, 0.008, { bone: head, color: BRASS });
  b.part(new THREE.SphereGeometry(0.095, 16, 12), BLACK, { bone: head, at: [0, 1.665, 0.06], scale: [1, 1.05, 0.85] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.032, 0.036, 0.02, 14), BRASS, {
      bone: head,
      at: [s * 0.048, 1.69, 0.13],
      dir: [s * 0.25, 0.05, 1],
    });
    glow(b.part(new THREE.SphereGeometry(0.024, 12, 8), "#ffe9a8", { bone: head, at: [s * 0.05, 1.692, 0.145] }), 1.6);
    b.part(new THREE.BoxGeometry(0.05, 0.012, 0.012), BRASS, {
      bone: head,
      at: [s * 0.05, 1.735, 0.12],
      rotation: [0, 0, s * -18],
    });
  }
  // grille mouth on jaw (jaw at [0,1.615,0.13])
  b.part(new THREE.BoxGeometry(0.1, 0.05, 0.03), BRASS, { bone: jaw, at: [0, 1.61, 0.135] });
  b.part(new THREE.PlaneGeometry(0.085, 0.038), "#ffffff", {
    bone: jaw,
    at: [0, 1.61, 0.152],
    dir: [0, 0, 1],
    axis: "z",
    texture: grilleTex,
  });

  // arms
  for (const [s, arm] of [
    [1, armL],
    [-1, armR],
  ] as const) {
    b.sweep(arm.path.slice(0, 0.5), [0.05, 0.042], { bone: arm, color: CHROME, section: { ngon: 8 } });
    b.sweep(arm.path.slice(0.5, 1), [0.038, 0.03], { bone: arm, color: BLACK, section: { ngon: 8 } });
    const a = arm.at(0.55).at,
      c = arm.at(0.95).at;
    b.rod([a.x + s * 0.035, a.y + 0.02, a.z], [c.x + s * 0.035, c.y + 0.02, c.z], 0.01, {
      bone: arm.joints[1],
      color: GILT,
    });
    b.part(gearGeometry({ teeth: 16, module: 0.006, thickness: 0.02, bore: 0.008 }), BRASS, {
      bone: arm.joints[1],
      at: arm.joints[1].at,
      dir: [s, 0, 0],
    });
    b.lathe(
      [
        [0.032, 0],
        [0.05, 0.0],
        [0.055, 0.05],
        [0.038, 0.05],
      ],
      {
        at: [arm.at(0.82).at.x, arm.at(0.82).at.y - 0.05, arm.at(0.82).at.z],
        bone: arm.joints[2],
        segments: 12,
        color: BRASS,
      },
    );
    const w = arm.joints[2].at;
    b.part(new THREE.SphereGeometry(0.035, 10, 8), CHROME, { bone: arm.joints[2], at: w });
    b.capsule(w, [w.x + 0.02, w.y - 0.06, w.z + 0.03], 0.011, { bone: arm.joints[2], color: BRASS });
    b.capsule(w, [w.x - 0.02, w.y - 0.06, w.z + 0.03], 0.011, { bone: arm.joints[2], color: BRASS });
    b.capsule(w, [w.x, w.y - 0.06, w.z + 0.055], 0.011, { bone: arm.joints[2], color: BRASS });
  }

  // tray + cloche on left wrist (armL tip ~ [0.52,1.12,0.26])
  {
    const w = armL.joints[2];
    const trayC: [number, number, number] = [0.53, 1.075, 0.33];
    b.part(new THREE.CylinderGeometry(0.16, 0.15, 0.015, 24), CHROME, { bone: w, at: trayC });
    b.part(new THREE.TorusGeometry(0.155, 0.008, 8, 28), BRASS, {
      bone: w,
      at: [trayC[0], trayC[1] + 0.008, trayC[2]],
      rotation: [90, 0, 0],
    });
    b.lathe(
      [
        [0.001, 0],
        [0.1, 0],
        [0.105, 0.008],
        [0.09, 0.05],
        [0.05, 0.075],
        [0.012, 0.085],
        [0.001, 0.088],
      ],
      { at: [trayC[0], trayC[1] + 0.008, trayC[2]], bone: w, segments: 24, color: CHROME },
    );
    b.part(new THREE.SphereGeometry(0.014, 8, 6), BRASS, { bone: w, at: [trayC[0], trayC[1] + 0.11, trayC[2]] });
    b.part(new THREE.TorusGeometry(0.11, 0.003, 6, 28), BRASS, {
      bone: w,
      at: [trayC[0], trayC[1] + 0.009, trayC[2]],
      rotation: [90, 0, 0],
    });
  }

  // legs + spats feet (absolute)
  for (const [s, leg] of [
    [1, legL],
    [-1, legR],
  ] as const) {
    b.sweep(leg.path.slice(0, 0.48), [0.075, 0.06], { bone: leg, color: CHROME, section: { ngon: 8 } });
    b.sweep(leg.path.slice(0.48, 1), [0.058, 0.045], { bone: leg, color: BLACK, section: { ngon: 8 } });
    b.part(gearGeometry({ teeth: 14, module: 0.006, thickness: 0.02, bore: 0.008 }), BRASS, {
      bone: leg.joints[1],
      at: [s * 0.12, 0.55, -0.03],
      dir: [s, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.055, 0.065, 0.04, 8), BRASS, {
      bone: leg.joints[2],
      at: [s * 0.12, 0.17, 0.05],
    });
    const ax = s * 0.12;
    b.part(new THREE.BoxGeometry(0.09, 0.07, 0.22), "#f4efe2", { bone: leg.joints[2], at: [ax, 0.055, 0.1] });
    b.part(new THREE.BoxGeometry(0.092, 0.03, 0.1), "#14100c", { bone: leg.joints[2], at: [ax, 0.035, 0.17] });
    b.part(new THREE.SphereGeometry(0.045, 10, 8), BRASS, {
      bone: leg.joints[2],
      at: [ax, 0.028, 0.21],
      scale: [1, 0.6, 1],
    });
    for (let i = 0; i < 3; i++)
      b.part(new THREE.SphereGeometry(0.009, 6, 4), "#14100c", {
        bone: leg.joints[2],
        at: [ax + 0.046, 0.08 - i * 0.02, 0.13],
      });
  }

  // speed-line fins
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.02, 0.1],
        [-0.28, 0.12],
        [-0.3, 0.06, "sharp"],
        [0, -0.04],
      ],
      {
        at: [s * 0.16, 1.3, -0.12],
        x: [s, 0, 0],
        y: [0, 1, -0.15],
        thickness: 0.012,
        smoothing: 1,
        color: BRASS,
        bone: chestJ,
      },
    );

  return b.root;
}
