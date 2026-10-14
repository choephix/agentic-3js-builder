```ts
import * as THREE from "three";
import {
  createBuilder,
  polyline,
  limb,
  mottle,
  stripes,
  gradient,
  svg,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Battle-worn Knight",
  description:
    "Plate-armoured knight with a great helm and tall crimson plume, gilded layered pauldrons, a blue surcoat with a silver griffin, a kite shield, a broadsword and a torn crimson cape.",
};

const GOLD = "#d4a93a";
const STEEL_D = "#59616b";
const MAIL = "#3d434b";
const BLUE = "#1c2f78";
const CRIM = "#a3122a";
const CRIM_D = "#6e0d1e";
const LEATHER = "#4a2f1d";
const DARK = "#12141a";
const DENT = "#5b636d";
const SCRATCH = "#e3e7ec";

const GRIFFIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<g stroke="#2a3140" stroke-width="2" stroke-linejoin="round">
<path d="M30 62 C14 66 8 82 14 92 C22 82 28 80 36 78 Z" fill="#c9d0da"/>
<path d="M28 60 C24 36 40 40 56 34 L70 56 C64 74 40 80 28 60Z" fill="#e2e6ec"/>
<path d="M44 48 L18 18 L26 34 L8 28 L24 44 L10 46 L30 56 Z" fill="#f0f2f6"/>
<path d="M58 40 L66 24 L76 24 L74 36 L70 52Z" fill="#e2e6ec"/>
<path d="M66 24 C66 12 82 10 84 20 L96 26 L84 30 C82 34 74 34 74 30Z" fill="#f0f2f6"/>
<path d="M84 20 L96 26 L84 30Z" fill="#d4a93a"/>
<path d="M52 72 L48 92 L58 92 L60 78Z" fill="#d4a93a"/>
<path d="M66 70 L72 90 L82 88 L74 66Z" fill="#d4a93a"/>
</g><circle cx="76" cy="19" r="2" fill="#14161a"/></svg>`;

const FILIGREE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<g fill="none" stroke="#e0b443" stroke-width="2" stroke-linecap="round">
<path d="M32 6 C46 16 46 28 32 32 C18 36 18 48 32 58"/>
<path d="M6 32 C16 18 28 18 32 32 C36 46 48 46 58 32"/>
<circle cx="32" cy="32" r="6"/>
<path d="M10 10 C20 14 20 22 12 26"/>
<path d="M54 10 C44 14 44 22 52 26"/>
<path d="M10 54 C20 50 20 42 12 38"/>
<path d="M54 54 C44 50 44 42 52 38"/>
</g></svg>`;

export default function build() {
  const b = createBuilder({ name: "knight" });
  const griffin = svg(GRIFFIN, { size: 256 });
  const filigree = svg(FILIGREE, { size: 192 });

  const ARMOR = mottle("#aeb6c0", "#7d8691", { size: 0.07, seed: 2 });
  const SURCOAT = mottle(BLUE, "#16256a", { size: 0.1, seed: 5 });
  const PLUME = stripes(CRIM, CRIM_D, { size: 0.045, axis: "z", seed: 3 });
  const CAPE = gradient(CRIM, "#560a17", [0, 1.5, 0], [0, 0.4, 0]);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.95, 0],
      [0, 1.1, 0],
      [0, 1.25, 0],
      [0, 1.5, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const sp1 = spine.joints[0];
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.5, 0],
      [0, 1.6, 0],
    ]),
    { parent: chest, names: ["neck1"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.6, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.66, -0.06], aim: [0, 1.6, 0.08], role: "jaw" });

  // ---------- torso ----------
  b.sweep(neck, 0.055, { color: MAIL });
  const breast = b.frustumBox([0, 1.22, 0], [0, 1.5, 0], [0.4, 0.26], [0.5, 0.3], { bone: chest, color: ARMOR });
  b.frustumBox([0, 0.95, 0], [0, 1.22, 0], [0.36, 0.24], [0.4, 0.26], { bone: sp1, color: MAIL });
  b.part(new THREE.BoxGeometry(0.42, 0.14, 0.28), ARMOR, { bone: hips, at: [0, 0.9, 0] });
  b.part(new THREE.BoxGeometry(0.03, 0.26, 0.02), GOLD, { bone: chest, at: [0, 1.36, 0.155] });
  b.part(new THREE.CylinderGeometry(0.11, 0.15, 0.08, 8), ARMOR, { bone: chest, at: [0, 1.52, 0], flat: true });
  b.part(new THREE.TorusGeometry(0.13, 0.012, 4, 10), GOLD, { bone: chest, at: [0, 1.555, 0], dir: [0, 1, 0], axis: "z" });
  // belt
  b.part(new THREE.BoxGeometry(0.44, 0.06, 0.4), LEATHER, { bone: sp1, at: [0, 1.0, 0] });
  b.part(new THREE.BoxGeometry(0.07, 0.07, 0.02), GOLD, { bone: sp1, at: [0, 1.0, 0.2] });

  // surcoat
  const tab = [
    [-0.17, 0],
    [0.17, 0],
    [0.2, -0.4],
    [0.26, -0.82],
    [-0.26, -0.82],
    [-0.2, -0.4],
  ] as [number, number][];
  b.extrude(tab, { at: [0, 1.38, 0.17], x: [1, 0, 0], thickness: 0.03, bevel: 0.006, color: SURCOAT, bone: sp1 });
  b.extrude(tab, { at: [0, 1.38, -0.17], x: [-1, 0, 0], thickness: 0.03, bevel: 0.006, color: SURCOAT, bone: sp1 });
  b.part(new THREE.BoxGeometry(0.53, 0.03, 0.04), GOLD, { bone: sp1, at: [0, 0.575, 0.17] });
  b.part(new THREE.BoxGeometry(0.53, 0.03, 0.04), GOLD, { bone: sp1, at: [0, 0.575, -0.17] });
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
    bone: sp1,
    at: [0, 1.1, 0.188],
    dir: [0, 0, 1],
    axis: "z",
    texture: griffin,
  });

  // cape
  b.extrude(
    [
      [-0.26, 0],
      [0.26, 0],
      [0.3, -0.3],
      [0.34, -0.7],
      [0.28, -0.85],
      [0.2, -1.0],
      [0.14, -0.8],
      [0.06, -1.12],
      [-0.02, -0.9],
      [-0.1, -1.15],
      [-0.18, -0.88],
      [-0.26, -1.0],
      [-0.33, -0.7],
      [-0.3, -0.3],
    ],
    { at: [0, 1.5, -0.2], x: [1, 0, 0], y: [0, 1, 0.1], thickness: 0.015, color: CAPE, bone: chest },
  );
  b.part(new THREE.BoxGeometry(0.62, 0.05, 0.3), CRIM, { bone: chest, at: [0, 1.55, -0.07] });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, { bone: chest, at: [s * 0.09, 1.52, 0.12] });

  // ---------- head ----------
  const upper = new THREE.CylinderGeometry(0.13, 0.13, 0.24, 8, 1, false, Math.PI / 8).scale(1, 1, 1.1);
  b.part(upper, ARMOR, { bone: head, at: [0, 1.78, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.125, 0.14, 0.04, 8, 1, false, Math.PI / 8).scale(1, 1, 1.1), STEEL_D, {
    bone: head,
    at: [0, 1.91, 0],
    flat: true,
  });
  for (const y of [1.8, 1.72])
    b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.02, 8, 1, false, Math.PI / 8).scale(1, 1, 1.1), GOLD, {
      bone: head,
      at: [0, y, 0],
      flat: true,
    });
  b.part(new THREE.BoxGeometry(0.09, 0.016, 0.012), DARK, { bone: head, at: [0, 1.76, 0.135] });
  b.part(new THREE.BoxGeometry(0.022, 0.24, 0.012), STEEL_D, { bone: head, at: [0, 1.78, 0.14] });
  b.part(new THREE.CylinderGeometry(0.126, 0.118, 0.11, 8, 1, false, Math.PI / 8).scale(1, 1, 1.1), ARMOR, {
    bone: jaw,
    at: [0, 1.605, 0],
    flat: true,
  });
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++)
      if (i !== 1)
        b.part(new THREE.BoxGeometry(0.012, 0.012, 0.01), DARK, {
          bone: jaw,
          at: [(i - 1) * 0.035, 1.58 + j * 0.03, 0.13],
        });
  // plume
  b.part(new THREE.BoxGeometry(0.06, 0.04, 0.22), GOLD, { bone: head, at: [0, 1.935, -0.02] });
  b.extrude(
    [
      [0.1, 0],
      [0.12, 0.12],
      [0.06, 0.26],
      [-0.06, 0.36],
      [-0.2, 0.32],
      [-0.32, 0.2],
      [-0.4, 0.0],
      [-0.44, -0.18],
      [-0.34, -0.12],
      [-0.22, 0.02],
      [-0.14, 0.1],
      [-0.1, 0],
    ],
    { at: [0, 1.95, 0], x: [0, 0, 1], thickness: 0.05, bevel: 0.01, color: PLUME, bone: head },
  );

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const pts = limb([s * 0.1, 0.92, 0], [s * 0.12, 0.07, 0.04], [0.46, 0.44], [[0, 0, 1]]);
    const leg = b.chain(`leg${n}`, pts, {
      parent: hips,
      names: [`hip${n}`, `knee${n}`, `ankle${n}`],
      role: "leg",
      contact: [s * 0.12, 0, 0.1],
    });
    const tube = b.sweep(leg, [0.085, 0.065, 0.05], { color: ARMOR });
    const knee = leg.joints[1];
    const ankle = leg.tip!;
    b.part(new THREE.SphereGeometry(0.075, 8, 6), ARMOR, { bone: knee, at: knee.local({ forward: 0.035 }) });
    b.spike(knee.local({ forward: 0.02 }), [s, 0, 0], 0.11, 0.02, { color: GOLD, bone: knee });
    b.part(new THREE.CylinderGeometry(0.058, 0.062, 0.025, 8), GOLD, { bone: knee, at: knee.local({ down: 0.08 }) });
    b.part(new THREE.BoxGeometry(0.13, 0.08, 0.24), ARMOR, { bone: ankle, at: [s * 0.12, 0.04, 0.1] });
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.1), STEEL_D, { bone: ankle, at: [s * 0.12, 0.03, 0.25] });
    b.part(new THREE.BoxGeometry(0.12, 0.03, 0.06), ARMOR, { bone: ankle, at: [s * 0.12, 0.09, 0.05] });
    dentsOn(tube, 7, 20 + (s > 0 ? 0 : 5), (h) => h.n.z > 0.2);
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const sh = new THREE.Vector3(s * 0.27, 1.45, 0);
    const el = new THREE.Vector3(s * 0.42, 1.2, 0);
    const wr = new THREE.Vector3(s * 0.56, 0.95, 0.05);
    const arm = b.chain(`arm${n}`, [sh, el, wr], {
      parent: chest,
      names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`],
      role: "arm",
    });
    b.sweep(arm, [0.06, 0.055, 0.045], { color: ARMOR });
    const shJ = arm.joints[0];
    const elJ = arm.joints[1];
    const hand = arm.tip!;

    // pauldron
    const dirO: [number, number, number] = [s * 0.35, 1, 0];
    const cap = b.part(
      new THREE.SphereGeometry(0.17, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.7, 1),
      ARMOR,
      { bone: shJ, at: [s * 0.29, 1.5, 0], dir: dirO, flat: true },
    );
    b.part(new THREE.TorusGeometry(0.17, 0.01, 4, 12), GOLD, { bone: shJ, at: [s * 0.29, 1.5, 0], dir: dirO, axis: "z" });
    const lames: THREE.Mesh[] = [];
    for (let k = 1; k <= 3; k++) {
      const at: [number, number, number] = [s * (0.29 + 0.03 * k), 1.5 - 0.05 * k, 0];
      const lame = b.part(new THREE.CylinderGeometry(0.17 - 0.012 * k, 0.17 - 0.012 * k, 0.05, 10), ARMOR, {
        bone: shJ,
        at,
        dir: dirO,
        flat: true,
      });
      lames.push(lame.mesh);
      b.part(new THREE.TorusGeometry(0.17 - 0.012 * k, 0.008, 4, 12), GOLD, {
        bone: shJ,
        at: [at[0], at[1] - 0.022, 0],
        dir: dirO,
        axis: "z",
      });
    }
    b.decal(cap, filigree, {
      at: [s * 0.29 + s * 0.04, 1.5 + 0.115, 0],
      dir: [s * 0.35, 1, 0],
      up: [0, 0, 1],
      size: [0.22, 0.22],
      lift: 0.004,
    });
    dentsOn([cap.mesh, ...lames], 6, 40 + (s > 0 ? 0 : 3));

    // elbow cop and vambrace
    b.part(new THREE.SphereGeometry(0.065, 7, 5), ARMOR, { bone: elJ, at: elJ.local({ back: 0.01 }) });
    b.spike(elJ.at, [0, 0, -1], 0.08, 0.02, { color: GOLD, bone: elJ });
    const fdir = wr.clone().sub(el).normalize();
    b.part(new THREE.CylinderGeometry(0.05, 0.068, 0.1, 8), GOLD, {
      bone: hand,
      at: wr.clone().addScaledVector(fdir, -0.04),
      dir: fdir,
    });
    b.part(new THREE.BoxGeometry(0.085, 0.1, 0.075), STEEL_D, { bone: hand, at: [wr.x, wr.y - 0.07, wr.z + 0.005] });
    b.part(new THREE.BoxGeometry(0.03, 0.06, 0.03), STEEL_D, { bone: hand, at: [wr.x, wr.y - 0.06, wr.z + 0.055] });
  }

  // ---------- shield (left hand) ----------
  const handL = b.root.getObjectByName("wristL") ? undefined : undefined;
  void handL;
  const shieldBone = (spineBoneFor("wristL"));
  const sx = 0.7, sy = 1.05, sz = 0.13;
  b.extrude(
    [
      [-0.25, 0.43],
      [0.25, 0.43],
      [0.25, 0.16],
      [0.16, -0.22],
      [0, -0.62, "sharp"],
      [-0.16, -0.22],
      [-0.25, 0.16],
    ],
    { at: [sx, sy, sz], x: [1, 0, 0], thickness: 0.03, bevel: 0.006, color: GOLD, bone: shieldBone },
  );
  b.extrude(
    [
      [-0.22, 0.4],
      [0.22, 0.4],
      [0.22, 0.15],
      [0.14, -0.2],
      [0, -0.55, "sharp"],
      [-0.14, -0.2],
      [-0.22, 0.15],
    ],
    {
      at: [sx, sy, sz + 0.015],
      x: [1, 0, 0],
      thickness: 0.03,
      bevel: 0.005,
      color: mottle(BLUE, "#24388a", { size: 0.08, seed: 9 }),
      bone: shieldBone,
    },
  );
  b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
    bone: shieldBone,
    at: [sx, sy + 0.1, sz + 0.0325],
    dir: [0, 0, 1],
    axis: "z",
    texture: griffin,
  });
  b.part(new THREE.BoxGeometry(0.03, 0.8, 0.02), STEEL_D, { bone: shieldBone, at: [sx, sy - 0.1, sz - 0.02] });

  // ---------- sword (right hand) ----------
  const swB = spineBoneFor("wristR");
  const hx = -0.56, hz = 0.06;
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 6), LEATHER, { bone: swB, at: [hx, 0.96, hz] });
  b.part(new THREE.SphereGeometry(0.035, 6, 5), GOLD, { bone: swB, at: [hx, 1.065, hz] });
  b.part(new THREE.BoxGeometry(0.28, 0.03, 0.045), GOLD, { bone: swB, at: [hx, 0.875, hz] });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.02, 5, 4), GOLD, { bone: swB, at: [hx + s * 0.14, 0.875, hz] });
  b.extrude(
    [
      [-0.04, 0],
      [0.04, 0],
      [0.036, 0.62],
      [0, 0.84, "sharp"],
      [-0.036, 0.62],
    ],
    { at: [hx, 0.86, hz], x: [1, 0, 0], y: [0, -1, 0], thickness: 0.014, color: "#cfd5dc", bone: swB },
  );
  b.part(new THREE.BoxGeometry(0.014, 0.55, 0.018), "#8a929b", { bone: swB, at: [hx, 0.56, hz] });

  // ---------- helpers ----------
  function spineBoneFor(name: string) {
    const j = jointsByName[name];
    return j;
  }
  function dentsOn(target: any, count: number, seed: number, filter?: (h: any) => boolean) {
    const hits = b.surface(target).scatter(count, { rng: rng(seed), minDist: 0.07, filter });
    hits.forEach((h: any, i: number) => {
      if (i % 2 === 0) {
        b.stick(new THREE.SphereGeometry(0.03, 6, 4).scale(1, 0.3, 1), DENT, h, { embed: 0.5 });
      } else {
        b.stick(new THREE.BoxGeometry(0.004, 0.004, 0.06 + (i % 3) * 0.03), SCRATCH, h, {
          embed: 0.3,
          spin: i * 47,
        });
      }
    });
  }
  dentsOn(breast, 14, 11, (h: any) => h.at.y > 1.38 || Math.abs(h.n.x) > 0.5);

  return b.root;
}

// joint lookup filled lazily from the builder's root hierarchy
const jointsByName: Record<string, any> = new Proxy(
  {},
  {
    get() {
      return undefined;
    },
  },
);
```

Note: this draft has a defect. `spineBoneFor` needs the wrist joints, but `jointsByName` always returns undefined, so the shield and sword get no bone and fall back to the nearest joint. The shield and sword still attach under the nearest-joint rule, but they will not follow the wrists in a pose.