```ts
import * as THREE from "three";
import { createBuilder, paint } from "agentic-3js-builder";
import type { Fill } from "agentic-3js-builder";

export const meta = {
  name: "Armoured knight",
  description:
    "A knight in plate armour: a great helm with a red plume, a quartered tabard, a blue heater shield with a gold cross, and a longsword planted at his right side.",
};

const STEEL = "#a3adb8";
const DARK = "#4a525c";
const GOLD = "#c9a227";
const RED = "#9b1c22";
const BLUE = "#2a4a86";
const CLOTH = "#e9e2cd";
const LEATHER = "#5b3a24";
const BLADE = "#dfe6ee";
const SLIT = "#14171b";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function knight() {
  const b = createBuilder({ name: "armoured-knight", detail: 1, paintSize: 1024 });

  // A tapered cylinder running from `a` (radius r0) to `c` (radius r1), owned by `bone`.
  const seg = (bone: string, a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, color: Fill) => {
    const len = a.distanceTo(c);
    const mid = a.clone().add(c).multiplyScalar(0.5);
    b.part(new THREE.CylinderGeometry(r1, r0, len, b.segments(10)), color, { bone, at: mid, aim: c });
  };

  // ---- Skeleton -------------------------------------------------------------------------------
  b.joint("pelvis", { at: V(0, 0.98, 0), role: "spine" });
  b.joint("chest", { parent: "pelvis", at: V(0, 1.22, 0), aim: V(0, 1.5, 0), role: "spine" });
  b.joint("neck", { parent: "chest", at: V(0, 1.5, 0), aim: V(0, 1.6, 0), role: "neck" });
  b.joint("head", { parent: "neck", at: V(0, 1.6, 0), aim: V(0, 1.8, 0), role: "head" });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = (v: number) => s * v;
    b.chain(
      `leg${S}`,
      [V(x(0.11), 0.98, 0), V(x(0.12), 0.52, 0.03), V(x(0.12), 0.1, 0)],
      { names: [`hip${S}`, `knee${S}`, `ankle${S}`], parent: "pelvis", role: "leg" },
    );
    b.chain(
      `arm${S}`,
      [V(x(0.2), 1.44, 0), V(x(0.27), 1.15, 0.03), V(x(0.29), 0.88, 0.08)],
      { names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], parent: "chest", role: "arm" },
    );
  }

  // ---- Torso ----------------------------------------------------------------------------------
  b.lathe(
    [
      [0, -0.12],
      [0.17, -0.12],
      [0.195, 0.0],
      [0.2, 0.12],
      [0.16, 0.22],
      [0, 0.23],
    ],
    { color: STEEL, at: V(0, 1.22, 0), axis: V(0, 1, 0), bone: "chest" },
  );
  b.lathe(
    [
      [0, 0.02],
      [0.16, 0.02],
      [0.19, -0.08],
      [0.21, -0.2],
      [0, -0.2],
    ],
    { color: DARK, at: V(0, 0.98, 0), axis: V(0, 1, 0), bone: "pelvis" },
  );
  b.part(new THREE.TorusGeometry(0.17, 0.012, b.segments(6), b.segments(16)), GOLD, {
    bone: "pelvis",
    at: V(0, 1.0, 0),
    rotation: V(90, 0, 0),
  });

  // Quartered tabard, painted with a heraldic pattern and a gold seam.
  const tabard = paint((p) => {
    if (Math.abs(p.y - 1.22) < 0.018 || Math.abs(p.x) < 0.018) return GOLD;
    return (p.x > 0) === (p.y > 1.22) ? RED : CLOTH;
  });
  b.extrude(
    [
      [-0.15, 0.16],
      [0.15, 0.16],
      [0.16, -0.02],
      [0.2, -0.2],
      [-0.2, -0.2],
      [-0.16, -0.02],
    ],
    {
      color: tabard,
      at: V(0, 1.22, 0.215),
      x: V(1, 0, 0),
      y: V(0, 1, 0),
      thickness: 0.012,
      bevel: 0.005,
      bone: "chest",
    },
  );

  // Gorget at the neck.
  b.lathe(
    [
      [0, -0.04],
      [0.1, -0.04],
      [0.12, 0.06],
      [0, 0.06],
    ],
    { color: DARK, at: V(0, 1.5, 0), axis: V(0, 1, 0), bone: "neck" },
  );

  // ---- Great helm -----------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0.14],
      [0.09, 0.14],
      [0.13, 0.06],
      [0.15, -0.02],
      [0.15, -0.1],
      [0.13, -0.16],
      [0, -0.16],
    ],
    { color: STEEL, at: V(0, 1.6, 0), axis: V(0, 1, 0), bone: "head" },
  );
  b.part(new THREE.BoxGeometry(0.2, 0.022, 0.02), SLIT, { bone: "head", at: V(0, 1.59, 0.142) });
  for (const k of [-0.06, -0.085, -0.11]) {
    b.part(new THREE.BoxGeometry(0.11, 0.008, 0.02), SLIT, { bone: "head", at: V(0, 1.6 + k, 0.146) });
  }
  b.part(new THREE.TorusGeometry(0.146, 0.01, b.segments(6), b.segments(16)), GOLD, {
    bone: "head",
    at: V(0, 1.6, 0),
    rotation: V(90, 0, 0),
  });

  // Plume: a row of red blobs sweeping back off the crown.
  for (let i = 0; i < 6; i++) {
    const y = 0.13 + 0.07 * Math.sin(0.35 * (i + 1));
    const z = -0.04 - 0.045 * i;
    const r = 0.045 - 0.004 * i;
    b.part(new THREE.SphereGeometry(r, b.segments(8), b.segments(6)), RED, {
      bone: "head",
      at: V(0, 1.6 + y, z),
      scale: V(0.8, 1.25, 0.7),
    });
  }

  // ---- Sides: arms, legs, pauldrons ----------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = (v: number) => s * v;

    // Legs.
    const hip = V(x(0.11), 0.98, 0);
    const knee = V(x(0.12), 0.52, 0.03);
    const ankle = V(x(0.12), 0.1, 0);
    seg(`hip${S}`, hip, knee, 0.085, 0.07, STEEL); // cuisse
    b.part(new THREE.SphereGeometry(0.075, b.segments(10), b.segments(8)), GOLD, {
      bone: `knee${S}`,
      at: knee,
    }); // knee cop
    seg(`knee${S}`, knee, ankle, 0.07, 0.052, STEEL); // greave
    b.part(new THREE.BoxGeometry(0.1, 0.08, 0.26), DARK, {
      bone: `ankle${S}`,
      at: V(x(0.12), 0.05, 0.09),
    }); // sabaton

    // Arms.
    const shoulder = V(x(0.2), 1.44, 0);
    const elbow = V(x(0.27), 1.15, 0.03);
    const wrist = V(x(0.29), 0.88, 0.08);
    seg(`shoulder${S}`, shoulder, elbow, 0.066, 0.056, STEEL); // upper arm
    b.part(new THREE.SphereGeometry(0.058, b.segments(10), b.segments(8)), STEEL, {
      bone: `elbow${S}`,
      at: elbow,
    }); // elbow cop
    seg(`elbow${S}`, elbow, wrist, 0.062, 0.05, STEEL); // vambrace
    b.part(new THREE.BoxGeometry(0.085, 0.13, 0.1), DARK, {
      bone: `wrist${S}`,
      at: wrist.clone().add(V(0, -0.07, 0.01)),
    }); // gauntlet

    // Pauldron dome and gold rim.
    b.part(
      new THREE.SphereGeometry(0.105, b.segments(12), b.segments(6), 0, Math.PI * 2, 0, Math.PI / 2),
      STEEL,
      { bone: "chest", at: V(x(0.2), 1.42, 0), scale: V(1, 0.75, 1.05) },
    );
    b.part(new THREE.TorusGeometry(0.1, 0.012, b.segments(6), b.segments(14)), GOLD, {
      bone: "chest",
      at: V(x(0.2), 1.42, 0),
      rotation: V(90, 0, 0),
    });
  }

  // ---- Heater shield on the left arm ----------------------------------------------------------
  const shieldPaint = paint((p) => {
    if (Math.abs(p.x - 0.3) < 0.025 || Math.abs(p.y - 1.0) < 0.025) return GOLD;
    return BLUE;
  });
  b.extrude(
    [
      [-0.13, 0.17],
      [0.13, 0.17],
      [0.13, 0.0],
      [0.0, -0.2],
      [-0.13, 0.0],
    ],
    {
      color: shieldPaint,
      at: V(0.3, 0.98, 0.2),
      x: V(1, 0, 0),
      y: V(0, 1, 0),
      thickness: 0.03,
      bevel: 0.01,
      bone: "wristL",
    },
  );
  b.part(new THREE.SphereGeometry(0.035, b.segments(10), b.segments(8)), GOLD, {
    bone: "wristL",
    at: V(0.3, 1.0, 0.23),
  });

  // ---- Longsword planted at the right side ----------------------------------------------------
  const hx = -0.3;
  seg("wristR", V(hx, 0.99, 0.1), V(hx, 0.85, 0.1), 0.014, 0.014, LEATHER); // grip
  b.part(new THREE.SphereGeometry(0.02, b.segments(8), b.segments(6)), GOLD, {
    bone: "wristR",
    at: V(hx, 1.0, 0.1),
  }); // pommel
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.04), GOLD, {
    bone: "wristR",
    at: V(hx, 0.84, 0.1),
  }); // crossguard
  b.extrude(
    [
      [-0.024, 0],
      [0.024, 0],
      [0.024, -0.68],
      [0, -0.8],
      [-0.024, -0.68],
    ],
    {
      color: BLADE,
      at: V(hx, 0.82, 0.1),
      x: V(1, 0, 0),
      y: V(0, 1, 0),
      thickness: 0.012,
      bevel: 0.004,
      bone: "wristR",
    },
  );

  return b.root;
}
```