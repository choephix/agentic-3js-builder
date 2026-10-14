import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Adventurer Garden Snail",
  description:
    "A garden snail with a glossy caramel, chocolate and cream striped spiral shell, a pebbly grey-green body, long eye stalks, short feelers, and a ladybird hitching a ride on the shell.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 0.01, 0] });
  const tail1 = b.joint("tail1", { at: [0, 0.006, -0.04], parent: body });
  const neck = b.joint("neck", { at: [0, 0.01, 0.035], parent: body });
  const head = b.joint("head", { at: [0, 0.018, 0.05], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.011, 0.058], parent: head });
  const stalkL = b.joint("eyeStalkL", { at: [0.005, 0.024, 0.054], parent: head });
  const stalkR = b.joint("eyeStalkR", { at: [-0.005, 0.024, 0.054], parent: head });
  const feelerL = b.joint("feelerL", { at: [0.005, 0.014, 0.062], parent: head });
  const feelerR = b.joint("feelerR", { at: [-0.005, 0.014, 0.062], parent: head });
  const shellJ = b.joint("shell", { at: [0, 0.034, -0.008], parent: body });
  const ladyJ = b.joint("ladybird", { at: [0, 0.06, -0.01], parent: shellJ });

  // ---------- helpers ----------
  const O: [number, number, number] = [0, 0, 0];
  const sph = (
    r: number, pos: number[], color: string, bone: any,
    sc: number[] = [1, 1, 1], ws = 8, hs = 6,
  ) => {
    const g = new THREE.SphereGeometry(r, ws, hs);
    g.scale(sc[0], sc[1], sc[2]);
    return b.part(g, color, { at: pos as any, bone });
  };
  const tube = (
    a: number[], c: number[], r0: number, r1: number, color: string, bone: any, seg = 6,
  ) => {
    const A = new THREE.Vector3(...(a as [number, number, number]));
    const C = new THREE.Vector3(...(c as [number, number, number]));
    const dir = C.clone().sub(A);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), dir.clone().normalize(),
    );
    const m = new THREE.Matrix4().compose(
      A.clone().add(C).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1),
    );
    g.applyMatrix4(m);
    return b.part(g, color, { at: O, bone });
  };

  // ---------- body ----------
  const skin = "#8e9f7c";
  const skinDark = "#74865f";
  const skinLight = "#a9b794";

  // foot (flattened capsule along z)
  {
    const g = new THREE.CapsuleGeometry(0.012, 0.07, 4, 10);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.55, 1);
    b.part(g, skin, { at: [0, 0.0066, -0.004], bone: body });
  }
  // pale sole fringe
  {
    const g = new THREE.CapsuleGeometry(0.0125, 0.068, 3, 10);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.12, 1);
    b.part(g, skinLight, { at: [0, 0.0012, -0.004], bone: body });
  }
  // hump under shell
  sph(0.014, [0, 0.012, -0.012], skinDark, body, [1, 0.8, 1.5]);
  // raised neck
  sph(0.0105, [0, 0.014, 0.038], skin, neck, [1, 1.1, 1.3]);
  // head
  sph(0.0105, [0, 0.019, 0.053], skin, head, [1, 0.95, 1.1]);
  // snout lip
  sph(0.006, [0, 0.015, 0.062], skinLight, head, [1.5, 0.7, 0.9]);
  // tail taper
  {
    const g = new THREE.ConeGeometry(0.0115, 0.036, 8, 1);
    g.scale(1, 1, 0.6);
    g.rotateX(-Math.PI / 2); // tip toward -z
    g.scale(1, 1, 1);
    g.translate(0, 0, 0);
    b.part(g, skin, { at: [0, 0.0058, -0.058], bone: tail1 });
  }
  sph(0.0016, [0, 0.0045, -0.076], skinDark, tail1);

  // lower jaw
  sph(0.0045, [0, 0.0105, 0.061], "#6c7c5a", jaw, [1.5, 0.6, 1]);
  // mouth dark line
  sph(0.0022, [0, 0.0128, 0.0655], "#2b2a22", head, [2, 0.4, 0.6], 6, 4);

  // pebbly texture
  const rnd = rng(7);
  for (let i = 0; i < 80; i++) {
    const z = -0.05 + rnd() * 0.1;
    const phi = 0.15 + rnd() * (Math.PI - 0.3);
    const x = 0.0122 * Math.cos(phi);
    const y = 0.0066 + 0.0068 * Math.sin(phi);
    const rr = 0.0009 + rnd() * 0.0007;
    const bone = z < -0.03 ? tail1 : z > 0.03 ? neck : body;
    const col = i % 3 === 0 ? skinLight : i % 3 === 1 ? skinDark : skin;
    sph(rr, [x, y, z], col, bone, [1, 1, 1], 5, 4);
  }
  // head/neck pebbles
  for (let i = 0; i < 22; i++) {
    const a = rnd() * Math.PI * 2;
    const el = rnd() * 1.2 - 0.1;
    const p = [
      0.0102 * Math.cos(el) * Math.sin(a),
      0.019 + 0.01 * Math.sin(el) * 0.95,
      0.053 + 0.0115 * Math.cos(el) * Math.cos(a),
    ];
    if (p[2] > 0.06 && p[1] < 0.016) continue;
    sph(0.0008, p, i % 2 ? skinDark : skinLight, head, [1, 1, 1], 5, 4);
  }
  // slimy shine highlights
  for (let i = 0; i < 6; i++) {
    sph(0.0009, [0.0085 - (i % 2) * 0.017 + (i > 3 ? 0.002 : 0), 0.0122 + (i % 2) * 0.0005, -0.03 + i * 0.012],
      "#dfe8d0", i < 4 ? body : neck, [1.2, 0.6, 1.8], 5, 4);
  }
  sph(0.0016, [0.004, 0.027, 0.057], "#dfe8d0", head, [1, 0.6, 1.2], 5, 4);

  // ---------- eye stalks & feelers ----------
  const stalkCol = "#8a9a76";
  for (const s of [1, -1]) {
    const sj = s > 0 ? stalkL : stalkR;
    const fj = s > 0 ? feelerL : feelerR;
    const base = [0.005 * s, 0.024, 0.054];
    const mid = [0.0085 * s, 0.042, 0.061];
    const tip = [0.012 * s, 0.059, 0.068];
    tube(base, mid, 0.0026, 0.002, stalkCol, sj, 6);
    tube(mid, tip, 0.002, 0.0016, stalkCol, sj, 6);
    sph(0.0034, tip, "#a2ae8c", sj, [1, 1, 1], 8, 6);
    sph(0.0026, [tip[0] + 0.0004 * s, tip[1] + 0.0005, tip[2] + 0.0017], "#0b0b0b", sj, [1, 1, 1], 7, 5);
    sph(0.0007, [tip[0] + 0.001 * s, tip[1] + 0.0016, tip[2] + 0.003], "#ffffff", sj, [1, 1, 1], 4, 3);
    // short feelers
    const fb = [0.005 * s, 0.014, 0.062];
    const ft = [0.009 * s, 0.0085, 0.083];
    tube(fb, ft, 0.0017, 0.0011, stalkCol, fj, 5);
    sph(0.0018, ft, "#a2ae8c", fj, [1, 1, 1], 6, 4);
  }

  // ---------- shell ----------
  const caramel = "#c68642";
  const choc = "#4a2c17";
  const cream = "#f1e2bd";
  const stripe = [caramel, choc, cream, caramel, choc];
  const N = 38;
  const thetaMax = Math.PI * 3.4;
  const R0 = 0.0035;
  const k = 0.16;
  const H = 0.03;
  const M = new THREE.Matrix4()
    .makeRotationX(-0.6)
    .setPosition(0, 0.034, -0.008);
  const rotOnly = new THREE.Matrix4().makeRotationX(-0.6);
  let topPoint = new THREE.Vector3(0, -1, 0);
  let topR = 0;

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const th = t * thetaMax;
    const R = R0 * Math.exp(k * th);
    const r = 0.5 * R + 0.0012;
    const y = H * Math.pow(1 - t, 1.3);
    const c = new THREE.Vector3(R * Math.cos(th), y, R * Math.sin(th));
    const radial = new THREE.Vector3(Math.cos(th), 0, Math.sin(th));
    const up = new THREE.Vector3(0, 1, 0);
    const cw = c.clone().applyMatrix4(M);
    // filler core
    sph(r * 0.85, [cw.x, cw.y, cw.z], caramel, shellJ, [1, 1, 1], 7, 5);
    for (let j = 0; j < 5; j++) {
      const phi = (j / 5) * Math.PI * 2;
      const off = radial.clone().multiplyScalar(Math.cos(phi) * r * 0.6)
        .add(up.clone().multiplyScalar(Math.sin(phi) * r * 0.6));
      const p = c.clone().add(off).applyMatrix4(M);
      sph(r * 0.52, [p.x, p.y, p.z], stripe[j], shellJ, [1, 1, 1], 7, 5);
      if (p.y > topPoint.y) {
        topPoint = p.clone();
        topR = r * 0.52;
      }
    }
  }
  // apex nub
  {
    const p = new THREE.Vector3(0, H + 0.002, 0).applyMatrix4(M);
    sph(0.0025, [p.x, p.y, p.z], choc, shellJ, [1, 1, 1], 6, 4);
    if (p.y > topPoint.y) {
      topPoint = p.clone();
      topR = 0.0025;
    }
  }
  // cream aperture rim glimpse
  {
    const th = thetaMax;
    const R = R0 * Math.exp(k * th);
    const r = 0.5 * R + 0.0012;
    const c = new THREE.Vector3(R * Math.cos(th), 0, R * Math.sin(th)).applyMatrix4(M);
    sph(r * 0.7, [c.x, c.y, c.z], cream, shellJ, [1, 1, 1], 7, 5);
  }
  void rotOnly;

  // ---------- ladybird ----------
  const lp = [topPoint.x, topPoint.y + topR * 0.75, topPoint.z];
  const lr = 0.0055;
  const red = "#d6261f";
  const black = "#141414";
  {
    const g = new THREE.SphereGeometry(lr, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(1, 0.8, 1.25);
    b.part(g, red, { at: [lp[0], lp[1] + 0.0004, lp[2]], bone: ladyJ });
  }
  // belly shadow base
  sph(lr * 0.95, [lp[0], lp[1] + 0.0003, lp[2]], black, ladyJ, [1, 0.25, 1.2], 8, 4);
  // head
  sph(lr * 0.45, [lp[0], lp[1] + 0.0017, lp[2] + lr * 1.3], black, ladyJ, [1.2, 0.8, 0.8], 7, 5);
  sph(lr * 0.12, [lp[0] + lr * 0.25, lp[1] + 0.0028, lp[2] + lr * 1.6], "#ffffff", ladyJ, [1, 1, 1], 4, 3);
  sph(lr * 0.12, [lp[0] - lr * 0.25, lp[1] + 0.0028, lp[2] + lr * 1.6], "#ffffff", ladyJ, [1, 1, 1], 4, 3);
  // antennae
  for (const s of [1, -1]) {
    tube(
      [lp[0] + 0.0008 * s, lp[1] + 0.0025, lp[2] + lr * 1.5],
      [lp[0] + 0.0018 * s, lp[1] + 0.0045, lp[2] + lr * 2.1],
      0.00028, 0.00022, black, ladyJ, 4,
    );
  }
  // centre line + spots
  b.part(new THREE.BoxGeometry(0.0003, 0.0003, lr * 2.3), black, {
    at: [lp[0], lp[1] + lr * 0.8 + 0.0004, lp[2] - 0.0002], bone: ladyJ,
  });
  const spotsAt = [
    [0.45, 0.2], [-0.45, 0.2], [0.55, -0.45], [-0.55, -0.45], [0.25, -0.95], [-0.25, -0.95],
  ];
  for (const [sx, sz] of spotsAt) {
    const x = sx * lr;
    const z = sz * lr * 1.25;
    const h = Math.sqrt(Math.max(0, 1 - (x / lr) ** 2 - (z / (lr * 1.25)) ** 2));
    sph(lr * 0.19, [lp[0] + x, lp[1] + 0.0004 + h * lr * 0.8, lp[2] + z], black, ladyJ, [1, 0.5, 1], 6, 4);
  }
  // legs
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = lp[2] + (i - 1) * 0.0022;
      tube([lp[0] + lr * 0.8 * s, lp[1] + 0.0004, z], [lp[0] + lr * 1.35 * s, lp[1] - 0.0012, z + (i - 1) * 0.0008],
        0.00028, 0.00022, black, ladyJ, 4);
    }
  }

  return b.root;
}
