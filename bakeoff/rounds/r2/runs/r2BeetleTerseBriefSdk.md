```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Stag Beetle",
  description: "Lucanus-style stag beetle with large toothed mandibles, glossy elytra, clubbed antennae and six jointed legs, in a rigged rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "stag_beetle" });

  const BODY = "#2a170f", ELY = "#5c2a14", ELY2 = "#7d3b1b", BLACK = "#0e0907", LEG = "#1e120c", CLUB = "#c9772c";

  // skeleton
  const body = b.joint("body", { at: [0, 0.016, 0] });
  const mk = (n: string, at: number[], parent: any, role?: string) => {
    const j: any = b.joint(n, { at, parent });
    if (role && j && j.userData) j.userData.role = role;
    return j;
  };
  const thorax = mk("thorax", [0, 0.016, 0.012], body, "spine");
  const abdomen = mk("abdomen", [0, 0.016, -0.008], body, "spine");
  const head = mk("head", [0, 0.017, 0.026], thorax, "head");

  // helpers
  const ball = (at: number[], sc: number[], color: string, bone: any, seg = 8) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2));
    g.scale(sc[0], sc[1], sc[2]);
    return b.part(g, color, { at, bone });
  };
  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any) => {
    const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, 6);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    const m = A.clone().add(C).multiplyScalar(0.5);
    return b.part(g, color, { at: [m.x, m.y, m.z], bone });
  };

  // torso
  ball([0, 0.0155, -0.018], [0.014, 0.0085, 0.022], BODY, abdomen);
  ball([0, 0.0205, 0.014], [0.0135, 0.0075, 0.011], BODY, thorax);
  ball([0, 0.0225, 0.0145], [0.0095, 0.004, 0.007], ELY, thorax, 6);
  ball([0, 0.0182, 0.0335], [0.0115, 0.0065, 0.0085], BLACK, head);
  ball([0, 0.0178, 0.0405], [0.006, 0.0035, 0.003], BLACK, head, 6);

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // elytra
    const ely = mk("elytra" + S, [s * 0.002, 0.025, 0.004], body, "wing");
    ball([s * 0.0075, 0.0235, -0.016], [0.0085, 0.0072, 0.027], ELY, ely);
    ball([s * 0.0072, 0.0262, -0.014], [0.0055, 0.003, 0.02], ELY2, ely, 6);
    // eyes
    ball([s * 0.0108, 0.0195, 0.0315], [0.0028, 0.0025, 0.0028], "#000000", head, 6);

    // antennae
    const a0 = [s * 0.006, 0.0185, 0.0395], a1 = [s * 0.011, 0.0215, 0.0475], a2 = [s * 0.0145, 0.0225, 0.0515];
    seg(a0, a1, 0.0006, 0.0005, LEG, head);
    seg(a1, a2, 0.0005, 0.0005, LEG, head);
    for (let i = 0; i < 3; i++) {
      const g = new THREE.BoxGeometry(0.0012, 0.0045 - i * 0.0008, 0.0008);
      b.part(g, CLUB, { at: [a2[0] + s * i * 0.0007, a2[1] + 0.0012, a2[2] + 0.0012 + i * 0.0009], bone: head });
    }

    // mandibles
    const jaw = mk("jaw" + S, [s * 0.007, 0.0172, 0.038], head, "jaw");
    const P = [
      [s * 0.007, 0.0172, 0.038],
      [s * 0.0125, 0.0175, 0.048],
      [s * 0.0145, 0.0178, 0.058],
      [s * 0.0110, 0.0178, 0.067],
      [s * 0.0045, 0.0178, 0.0715],
    ];
    const rr = [0.0034, 0.0030, 0.0025, 0.0019, 0.0011];
    for (let i = 0; i < 4; i++) {
      seg(P[i], P[i + 1], rr[i], rr[i + 1], "#3a1c10", jaw);
      ball(P[i + 1], [rr[i + 1], rr[i + 1], rr[i + 1]], "#3a1c10", jaw, 6);
    }
    // teeth
    const teeth: [number[], number[]][] = [
      [P[1], [s * 0.0085, 0.0178, 0.052]],
      [P[2], [s * 0.0095, 0.0178, 0.0605]],
      [[(P[2][0] + P[3][0]) / 2, 0.0178, (P[2][2] + P[3][2]) / 2], [s * 0.0075, 0.0178, 0.0645]],
    ];
    for (const [a, c] of teeth) seg(a, c, 0.0014, 0.0003, "#4a2616", jaw);
    seg(P[0], [s * 0.0105, 0.0178, 0.0365], 0.0001, 0.0001, BLACK, jaw);

    // legs
    const legZ = [0.022, 0.012, -0.002];
    const names = ["F", "M", "H"];
    for (let i = 0; i < 3; i++) {
      const z = legZ[i];
      const fwd = i === 0 ? 0.012 : i === 1 ? 0.0 : -0.014;
      const hipP = [s * 0.011, 0.0125, z];
      const kneeP = [s * 0.034, 0.0215, z + fwd * 0.6 + (i === 0 ? 0.008 : 0)];
      const ankP = [s * 0.046, 0.007, z + fwd + (i === 0 ? 0.012 : 0)];
      const toeP = [s * 0.052, 0.0012, z + fwd * 1.2 + (i === 0 ? 0.016 : 0)];
      const hip = mk("hip" + names[i] + S, hipP, thorax, "leg");
      const knee = mk("knee" + names[i] + S, kneeP, hip, "leg");
      const ankle = mk("ankle" + names[i] + S, ankP, knee, "leg");
      const sc = i === 0 ? 1.1 : 1;
      seg(hipP, kneeP, 0.0032 * sc, 0.0026 * sc, LEG, hip);
      ball(kneeP, [0.0030, 0.0030, 0.0030], "#3a1c10", knee, 6);
      seg(kneeP, ankP, 0.0024 * sc, 0.0017, LEG, knee);
      // tibial spines
      for (let k = 1; k <= 3; k++) {
        const t = k / 4;
        const px = kneeP[0] + (ankP[0] - kneeP[0]) * t;
        const py = kneeP[1] + (ankP[1] - kneeP[1]) * t;
        const pz = kneeP[2] + (ankP[2] - kneeP[2]) * t;
        seg([px, py, pz], [px + s * 0.0025, py + 0.0012, pz + 0.002], 0.0005, 0.0001, BLACK, knee);
      }
      seg(ankP, toeP, 0.0012, 0.0009, LEG, ankle);
      // claws
      const cz = toeP[2];
      seg(toeP, [toeP[0] + s * 0.002, 0.0, cz + 0.0025], 0.0007, 0.0001, BLACK, ankle);
      seg(toeP, [toeP[0] - s * 0.001, 0.0, cz + 0.0025], 0.0007, 0.0001, BLACK, ankle);
    }
  }

  return b.root;
}
```