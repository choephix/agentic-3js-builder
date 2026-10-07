import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Dragonfly",
  description: "A perched blue darner dragonfly with four veined wings, big compound eyes, a banded abdomen and six legs, rigged for animation.",
};

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  const Y = 0.02;
  const thorax = b.joint("thorax", { at: [0, Y, 0] });
  const head = b.joint("head", { at: [0, Y + 0.001, 0.0105], parent: thorax });
  const jaw = b.joint("jaw", { at: [0, Y - 0.0025, 0.0165], parent: head });

  // ---- helpers
  const rodGeo = (a: number[], c: number[], r: number, seg = 5) => {
    const va = new THREE.Vector3(...a), vc = new THREE.Vector3(...c);
    const d = vc.clone().sub(va);
    const g = new THREE.CylinderGeometry(r, r, d.length(), seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
    const m = va.clone().add(vc).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return g;
  };
  const rod = (a: number[], c: number[], r: number, color: string, bone: any) =>
    b.part(rodGeo(a, c, r), color, { at: [0, 0, 0], bone });
  const ball = (r: number, sx: number, sy: number, sz: number, w = 8, h = 6) => {
    const g = new THREE.SphereGeometry(r, w, h);
    g.scale(sx, sy, sz);
    return g;
  };

  // ---- thorax
  b.part(ball(0.0065, 0.85, 1, 1.25), "#6fa83a", { at: [0, Y, -0.001], bone: thorax });
  b.part(ball(0.0045, 0.9, 0.7, 1.1), "#4f8a2a", { at: [0, Y + 0.0045, -0.002], bone: thorax });
  for (const s of [1, -1]) {
    for (const [z, rot] of [[0.002, 0.5], [-0.004, 0.5]]) {
      const g = new THREE.BoxGeometry(0.0006, 0.0075, 0.0016);
      g.rotateX(rot);
      b.part(g, "#2a3d16", { at: [s * 0.0052, Y + 0.0005, z], bone: thorax });
    }
  }

  // ---- head
  b.part(ball(0.0038, 1.1, 0.9, 0.9), "#2b2f3a", { at: [0, Y + 0.001, 0.0115], bone: head });
  b.part(new THREE.BoxGeometry(0.005, 0.0022, 0.0022), "#d8e6a0", { at: [0, Y + 0.0006, 0.0152], bone: head });
  b.part(new THREE.BoxGeometry(0.003, 0.0014, 0.0018), "#b8c870", { at: [0, Y - 0.0006, 0.0155], bone: head });
  b.part(new THREE.BoxGeometry(0.0034, 0.0012, 0.003), "#3a2a20", { at: [0, Y - 0.0025, 0.0165], bone: jaw });
  for (const s of [1, -1]) {
    b.part(ball(0.0046, 1, 1.05, 1), "#2f8fd0", { at: [s * 0.0037, Y + 0.0022, 0.0125], bone: head });
    b.part(ball(0.0014, 1, 1, 1, 6, 4), "#bfe8ff", { at: [s * 0.0052, Y + 0.0038, 0.0145], bone: head });
    rod([s * 0.0012, Y + 0.0035, 0.0155], [s * 0.0022, Y + 0.0062, 0.0185], 0.00014, "#222", head);
  }
  b.part(ball(0.0013, 1, 1, 1, 6, 4), "#e8f0a0", { at: [0, Y + 0.0038, 0.0148], bone: head });

  // ---- wings
  const wingPts = (s: number, base: number, len: number, chord: number) => {
    const p: [number, number][] = [
      [0, -base * 0.6], [len * 0.2, -chord * 0.9], [len * 0.6, -chord], [len * 0.92, -chord * 0.55],
      [len, 0], [len * 0.92, chord * 0.5], [len * 0.6, chord * 0.7], [len * 0.25, chord * 0.7],
      [0, base * 0.5],
    ];
    return p.map(([x, y]) => [x * s, y] as [number, number]);
  };
  const makeWing = (name: string, s: number, z: number, hind: boolean) => {
    const j = b.joint(name, { at: [s * 0.003, Y + 0.0055, z], parent: thorax });
    const len = hind ? 0.046 : 0.05;
    const chord = hind ? 0.0062 : 0.0048;
    const base = hind ? 0.0085 : 0.005;
    const shape = new THREE.Shape(wingPts(s, base, len, chord).map(([x, y]) => new THREE.Vector2(x, y)));
    const tilt = (g: THREE.BufferGeometry) => {
      g.rotateX(Math.PI / 2);
      g.rotateZ(s * 0.1);
      g.rotateY(s * (hind ? -0.15 : 0.12));
      return g;
    };
    const g = tilt(new THREE.ExtrudeGeometry(shape, { depth: 0.0003, bevelEnabled: false }));
    b.part(g, hind ? "#cfe9f2" : "#dcf0f6", { at: [s * 0.003, Y + 0.0055, z], bone: j });
    // veins
    for (const off of [-0.55, 0, 0.5]) {
      const vg = new THREE.BoxGeometry(len * 0.9, 0.0004, 0.00035);
      vg.translate(s * len * 0.45, 0.0002, off * chord);
      b.part(tilt(vg), "#3b4a52", { at: [s * 0.003, Y + 0.0055, z], bone: j });
    }
    for (let i = 1; i < 6; i++) {
      const vg = new THREE.BoxGeometry(0.00028, 0.0004, chord * 1.3);
      vg.translate(s * len * (i / 6.5), 0.0002, 0);
      b.part(tilt(vg), "#56666e", { at: [s * 0.003, Y + 0.0055, z], bone: j });
    }
    // pterostigma
    const pg = new THREE.BoxGeometry(0.0035, 0.0006, 0.0011);
    pg.translate(s * len * 0.84, 0.0002, -chord * 0.5);
    b.part(tilt(pg), "#5a3a1c", { at: [s * 0.003, Y + 0.0055, z], bone: j });
  };
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    makeWing("wingFore" + n, s, 0.0035, false);
    makeWing("wingHind" + n, s, -0.0045, true);
  }

  // ---- abdomen
  let parent: any = thorax;
  let z = -0.0065;
  const segLen = 0.0073;
  const cols = ["#2d7fc4", "#1d2230"];
  for (let i = 0; i < 10; i++) {
    const r = i < 2 ? 0.0034 - i * 0.0004 : 0.0024 - (i - 2) * 0.00012;
    const j = b.joint("abdomen" + (i + 1), { at: [0, Y - 0.0004 - i * 0.0001, z], parent });
    const cy = new THREE.CylinderGeometry(r, r * 0.92, segLen, 6);
    cy.rotateX(Math.PI / 2);
    b.part(cy, i % 2 === 0 ? cols[0] : "#3a93d6", { at: [0, Y - 0.0004 - i * 0.0001, z - segLen / 2], bone: j });
    const ring = new THREE.CylinderGeometry(r * 1.06, r * 1.06, 0.0012, 6);
    ring.rotateX(Math.PI / 2);
    b.part(ring, cols[1], { at: [0, Y - 0.0004 - i * 0.0001, z - segLen + 0.0006], bone: j });
    b.part(new THREE.BoxGeometry(0.0007, 0.0006, segLen * 0.7), "#14182a", { at: [0, Y - 0.0004 - i * 0.0001 + r, z - segLen / 2], bone: j });
    parent = j;
    z -= segLen;
  }
  const endY = Y - 0.0004 - 9 * 0.0001;
  for (const s of [1, -1]) {
    const c = new THREE.ConeGeometry(0.00055, 0.004, 4);
    c.rotateX(-Math.PI / 2);
    c.rotateY(s * 0.15);
    b.part(c, "#1d2230", { at: [s * 0.0011, endY, z - 0.0018], bone: parent });
  }

  // ---- legs
  const zs = [0.006, 0.0015, -0.003];
  const lean = [0.004, 0.0, -0.004];
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    zs.forEach((hz, i) => {
      const hip = b.joint("hip" + n + (i + 1), { at: [s * 0.0035, Y - 0.0045, hz], parent: thorax });
      const kneeP = [s * 0.0095, Y + 0.0015, hz + lean[i] * 0.5 + 0.002];
      const knee = b.joint("knee" + n + (i + 1), { at: kneeP, parent: hip });
      const footP = [s * 0.0115, 0.0003, hz + lean[i] + 0.004];
      const foot = b.joint("foot" + n + (i + 1), { at: footP, parent: knee });
      rod([s * 0.0035, Y - 0.0045, hz], kneeP, 0.0004, "#2a2220", hip);
      b.part(ball(0.0006, 1, 1, 1, 5, 4), "#3a302c", { at: kneeP, bone: knee });
      rod(kneeP, footP, 0.00032, "#2a2220", knee);
      b.part(new THREE.BoxGeometry(0.0016, 0.0005, 0.0034), "#1a1514", { at: [footP[0], 0.00025, footP[2] + 0.0008], bone: foot });
    });
  }

  return b.root;
}
