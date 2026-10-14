import * as THREE from "three";
import { createBuilder, catmull, polyline, mix, smoothstep, paint, mottle } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "Stylized rigged greater flamingo standing on both legs, with an S-curved neck, bent two-part beak, spread wings and webbed feet.",
};

export default function build() {
  const b = createBuilder({ name: "flamingo" });
  const PINK = "#f2708d";
  const LIGHT = "#f7a0b4";
  const DEEP = "#d94a6e";
  const BLACK = "#1a1416";
  const coat = mottle(PINK, LIGHT, { size: 0.1, contrast: 0.8, seed: 3 });

  // ---------- skeleton core
  const hips = b.joint("hips", { at: [0, 0.7, -0.1], dir: [0, 0, 1] });
  const spine = b.chain("spine", polyline([[0, 0.7, -0.1], [0, 0.73, 0.06], [0, 0.77, 0.2]]), {
    parent: hips, role: "spine",
  });
  const tail = b.chain("tail", polyline([[0, 0.7, -0.18], [0, 0.68, -0.32], [0, 0.62, -0.46]]), {
    parent: hips, role: "tail",
  });

  // ---------- body
  const body = b.loft(
    [
      { at: [0, 0.64, -0.46], w: 0.03, h: 0.03 },
      { at: [0, 0.68, -0.3], w: 0.1, h: 0.1 },
      { at: [0, 0.71, -0.12], w: 0.2, h: 0.22 },
      { at: [0, 0.73, 0.05], w: 0.25, h: 0.27 },
      { at: [0, 0.77, 0.18], w: 0.2, h: 0.24 },
      { at: [0, 0.82, 0.26], w: 0.11, h: 0.14 },
    ],
    { color: coat, bone: [tail, spine], name: "body" },
  );

  // ---------- neck and head
  const neckPath = catmull([
    [0, 0.8, 0.2], [0, 0.9, 0.27], [0, 1.03, 0.25], [0, 1.15, 0.17], [0, 1.25, 0.17], [0, 1.32, 0.23],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine, role: "neck",
    names: ["neck1", "neck2", "neck3", "neck4", "neck5", "head"],
  });
  b.sweep(neck, [0.07, 0.042, 0.03, 0.026, 0.026, 0.03], { color: coat, name: "neck" });
  const head = neck.tip!;
  b.part(new THREE.SphereGeometry(0.038, b.segments(10), b.segments(8)).scale(1, 0.95, 1.2), PINK, {
    bone: head, at: head.local({ forward: 0.02 }), name: "skull",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.322, 0.26], dir: [0, 0, 1], role: "jaw" });

  // eyes
  for (const s of [1, -1]) {
    const e = head.local({ left: 0.03 * s, forward: 0.025, up: 0.012 });
    b.part(new THREE.SphereGeometry(0.01, 8, 6), "#f4d03a", { bone: head, at: e });
    b.part(new THREE.SphereGeometry(0.0055, 6, 5), BLACK, {
      bone: head, at: head.local({ left: 0.037 * s, forward: 0.028, up: 0.012 }),
    });
  }

  // beak: upper (bent down) and lower jaw
  b.sweep(catmull([[0, 1.337, 0.25], [0, 1.335, 0.3], [0, 1.315, 0.35], [0, 1.275, 0.378]]),
    [0.027, 0.023, 0.017, 0.004], {
      bands: [[0.42, "#f8c8cf"], [1, BLACK]], bone: head, name: "beakUpper", sides: 6,
    });
  b.sweep(catmull([[0, 1.318, 0.255], [0, 1.314, 0.3], [0, 1.298, 0.34], [0, 1.268, 0.368]]),
    [0.02, 0.017, 0.012, 0.004], {
      bands: [[0.45, "#f3b5c0"], [1, BLACK]], bone: jaw, name: "beakLower", sides: 6,
    });

  // ---------- legs and feet
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = 0.08 * s;
    const leg = b.chain(`leg${S}`, polyline([[x, 0.66, 0.0], [x, 0.58, 0.07], [x, 0.34, -0.04], [x, 0.016, 0.02]]), {
      parent: hips, role: "leg",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
    });
    b.sweep(leg, (t: number) => 0.011 + 0.03 * Math.max(0, 1 - t * 3.5), { color: "#e2587a", name: `leg${S}`, sides: 6 });
    const ankle = leg.joints[2];
    b.part(new THREE.SphereGeometry(0.02, 8, 6), DEEP, { bone: ankle, at: ankle });
    const foot = leg.joints[3];
    const base = new THREE.Vector3(x, 0.008, 0.02);
    const ends: THREE.Vector3[] = [];
    for (const dx of [-0.4, 0, 0.4]) {
      const end = base.clone().add(new THREE.Vector3(dx * 0.1, 0, 0.11));
      ends.push(end);
      b.capsule(base.toArray() as [number, number, number], end.toArray() as [number, number, number], 0.008, {
        color: "#e2587a", bone: foot, sides: 5,
      });
    }
    b.capsule(base.toArray() as [number, number, number], [x, 0.008, -0.045], 0.007, {
      color: "#e2587a", bone: foot, sides: 5,
    });
    for (let i = 0; i < 2; i++) {
      b.slab([[x, 0.005, 0.02], [ends[i].x, 0.005, ends[i].z - 0.01], [ends[i + 1].x, 0.005, ends[i + 1].z - 0.01]].map(
        (p) => new THREE.Vector3(p[0], p[1], p[2])).map((v) => v.toArray() as [number, number, number]),
        { color: DEEP, thickness: 0.005, bone: foot });
    }
  }

  // ---------- wings
  const wingPaint = paint((p) => {
    const rear = smoothstep(-0.12, -0.2, p.z);
    const tipB = smoothstep(0.62, 0.72, Math.abs(p.x));
    const base = mix(mix(PINK, DEEP, smoothstep(0.0, -0.12, p.z)), LIGHT, smoothstep(0.1, 0.0, Math.abs(p.x) - 0.1));
    return mix(base, BLACK, Math.max(rear * smoothstep(0.25, 0.4, Math.abs(p.x)), tipB));
  });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pt = (x: number, y: number, z: number): [number, number, number] => [x * s, y, z];
    const arm = b.chain(`wing${S}`, polyline([pt(0.12, 0.8, 0.02), pt(0.34, 0.82, -0.06), pt(0.56, 0.82, 0.04), pt(0.78, 0.78, 0.0)]), {
      parent: "spine1", role: "wing",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
    });
    b.sweep(arm, [0.028, 0.022, 0.016, 0.01], { color: PINK, name: `wingArm${S}` });
    const trail = catmull([pt(0.12, 0.74, -0.2), pt(0.3, 0.8, -0.3), pt(0.55, 0.8, -0.3), pt(0.76, 0.77, -0.2), pt(0.8, 0.77, -0.04)]);
    const opts = { color: wingPaint, thickness: 0.008, rows: 4, bone: arm, name: `wingMembrane${S}`, scallop: 0.06 } as const;
    if (s > 0) b.membrane(arm, trail, opts);
    else b.membrane(trail, arm, opts);
  }

  // ---------- back and flank feathers
  const surf = b.surface(body);
  const feather = (c: string) => new THREE.SphereGeometry(1, 6, 4).scale(0.04, 0.012, 0.09);
  const around = surf.around([0, 0.74, 0]);
  const rows: Array<[number, number, string]> = [];
  for (const el of [78, 62, 46]) for (const az of [-50, -20, 20, 50, 180, 150, 210]) rows.push([az, el, el > 60 ? PINK : LIGHT]);
  for (const az of [95, -95, 115, -115]) rows.push([az, 20, LIGHT]);
  rows.forEach(([az, el, col]) => {
    const h = around.at(az, el);
    if (h) b.stick(feather(col), col, h, { flow: [0, 0, -1], embed: 0.45, name: "scapular" });
  });

  return b.root;
}
