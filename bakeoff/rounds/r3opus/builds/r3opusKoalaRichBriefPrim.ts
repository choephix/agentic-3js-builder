import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Sleepy Koala",
  description:
    "A drowsy ash-grey koala sitting at the foot of a eucalyptus branch and hugging it. It has a cream chest, fluffy cream-lined ears, a big black nose and half-closed brown eyes, and it is munching a sprig of blue-green leaves.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "sleepy_koala" });
  const R = rng(7);

  // palette
  const FUR = "#9a9ca4";
  const FUR_LT = "#b9bbc2";
  const FUR_DK = "#7d7f88";
  const CREAM = "#f0e7d4";
  const WHITE = "#fbf8f1";
  const NOSE = "#1e1c21";
  const NOSE_HI = "#4b4952";
  const EYE = "#5b3920";
  const CLAW = "#2b2522";
  const PAD = "#3a3438";
  const MOUTH = "#b86f6c";
  const BARK = "#8c7258";
  const BARK_LT = "#cdb99a";
  const BARK_DK = "#5e4a3a";
  const STEM = "#a4554a";
  const LEAVES = ["#8fb6ad", "#6f9c96", "#a8c8bf", "#5f8c88"];

  const v = (a: V | THREE.Vector3) =>
    a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const spine = b.joint("spine", { at: [0, 0.33, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.45, 0.01], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.52, 0.03], parent: chest });
  const head = b.joint("head", { at: [0, 0.6, 0.04], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.54, 0.1], parent: head });
  const earL = b.joint("earL", { at: [0.12, 0.68, 0.01], parent: head });
  const earR = b.joint("earR", { at: [-0.12, 0.68, 0.01], parent: head });

  const shL: V = [0.13, 0.47, 0.04], elL: V = [0.21, 0.38, 0.12], wrL: V = [0.17, 0.41, 0.25];
  const shR: V = [-0.13, 0.47, 0.04], elR: V = [-0.2, 0.36, 0.15], wrR: V = [-0.08, 0.48, 0.2];
  const shoulderL = b.joint("shoulderL", { at: shL, parent: chest });
  const elbowL = b.joint("elbowL", { at: elL, parent: shoulderL });
  const wristL = b.joint("wristL", { at: wrL, parent: elbowL });
  const shoulderR = b.joint("shoulderR", { at: shR, parent: chest });
  const elbowR = b.joint("elbowR", { at: elR, parent: shoulderR });
  const wristR = b.joint("wristR", { at: wrR, parent: elbowR });

  const hpL: V = [0.1, 0.15, 0.05], knL: V = [0.14, 0.13, 0.19], anL: V = [0.11, 0.06, 0.26];
  const hpR: V = [-0.1, 0.15, 0.05], knR: V = [-0.14, 0.13, 0.19], anR: V = [-0.11, 0.06, 0.26];
  const hipL = b.joint("hipL", { at: hpL, parent: hips });
  const kneeL = b.joint("kneeL", { at: knL, parent: hipL });
  const ankleL = b.joint("ankleL", { at: anL, parent: kneeL });
  const hipR = b.joint("hipR", { at: hpR, parent: hips });
  const kneeR = b.joint("kneeR", { at: knR, parent: hipR });
  const ankleR = b.joint("ankleR", { at: anR, parent: kneeR });

  // ---------- helpers ----------
  const blob = (col: string, at: V | THREE.Vector3, s: V, bone: any, seg = [10, 8], dir?: V | THREE.Vector3) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), col, {
      at: v(at),
      scale: s,
      bone,
      ...(dir ? { dir: v(dir) } : {}),
    });

  const seg = (a: V | THREE.Vector3, c: V | THREE.Vector3, r: number, col: string, bone: any, rs = 8) => {
    const A = v(a), C = v(c);
    const d = C.clone().sub(A);
    b.part(new THREE.CapsuleGeometry(r, Math.max(0.001, d.length()), 3, rs), col, {
      at: A.clone().add(C).multiplyScalar(0.5),
      dir: d,
      bone,
    });
  };

  const rod = (a: V | THREE.Vector3, c: V | THREE.Vector3, r0: number, r1: number, col: string, bone: any, rs = 6) => {
    const A = v(a), C = v(c);
    const d = C.clone().sub(A);
    b.part(new THREE.CylinderGeometry(r1, r0, d.length(), rs), col, {
      at: A.clone().add(C).multiplyScalar(0.5),
      dir: d,
      bone,
    });
  };

  const claw = (at: V | THREE.Vector3, dir: V | THREE.Vector3, bone: any, len = 0.024) => {
    const D = v(dir).normalize();
    b.part(new THREE.ConeGeometry(0.0065, len, 5), CLAW, {
      at: v(at).add(D.clone().multiplyScalar(len * 0.4)),
      dir: D,
      bone,
    });
  };

  const leaf = (base: THREE.Vector3, dir: V | THREE.Vector3, size: number, col: string, bone: any) => {
    const D = v(dir).normalize();
    b.part(new THREE.SphereGeometry(1, 6, 4), col, {
      at: base.clone().add(D.clone().multiplyScalar(size)),
      dir: D,
      scale: [size * 0.28, size, size * 0.07],
      bone,
    });
    // midrib
    b.part(new THREE.CylinderGeometry(0.0012, 0.002, size * 1.7, 3), "#c9d9c8", {
      at: base.clone().add(D.clone().multiplyScalar(size * 0.95)),
      dir: D,
      bone,
    });
  };

  // ---------- body ----------
  blob(FUR, [0, 0.21, 0], [0.17, 0.21, 0.15], hips, [12, 10]);
  blob(FUR, [0, 0.42, 0.01], [0.145, 0.11, 0.12], chest, [12, 8]);
  blob(CREAM, [0, 0.31, 0.075], [0.11, 0.16, 0.095], spine, [10, 8]);
  blob(WHITE, [0, 0.4, 0.1], [0.075, 0.06, 0.05], chest, [8, 6]);
  // white rump patch
  blob(CREAM, [0, 0.1, -0.11], [0.11, 0.08, 0.06], hips, [8, 6]);

  // fur tufts scattered over the grey coat
  for (let i = 0; i < 46; i++) {
    const th = R() * Math.PI * 2;
    const ph = 0.25 + R() * 0.55 * Math.PI;
    const n = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
    const p = new THREE.Vector3(n.x * 0.17, 0.21 + n.y * 0.21, n.z * 0.15);
    if (p.z > 0.05 && Math.abs(p.x) < 0.12) continue;
    if (p.y < 0.03) continue;
    const s = 0.012 + R() * 0.01;
    blob(R() < 0.5 ? FUR_LT : FUR_DK, p, [s, s * 1.6, s * 0.5], p.y > 0.33 ? chest : spine, [5, 4], n.clone().add(new THREE.Vector3(0, 0.8, 0)));
  }

  // ---------- head ----------
  const H: V = [0, 0.6, 0.04];
  blob(FUR, H, [0.13, 0.11, 0.11], head, [12, 10]);
  // brow ridge & crown tufts
  blob(FUR_LT, [0, 0.66, 0.08], [0.09, 0.03, 0.05], head, [8, 6]);
  for (let i = 0; i < 5; i++) {
    const x = -0.04 + i * 0.02;
    b.part(new THREE.ConeGeometry(0.012, 0.035, 5), FUR_LT, {
      at: [x, 0.71, 0.03 + R() * 0.02],
      dir: [x * 4, 1, -0.2],
      bone: head,
    });
  }
  // muzzle & chewing cheeks
  blob(FUR_LT, [0, 0.55, 0.12], [0.07, 0.05, 0.055], head, [10, 8]);
  blob(FUR_LT, [0.075, 0.55, 0.105], [0.04, 0.035, 0.035], head, [8, 6]);
  blob(FUR_LT, [-0.078, 0.548, 0.105], [0.044, 0.038, 0.037], head, [8, 6]);
  blob(CREAM, [0, 0.528, 0.135], [0.04, 0.018, 0.03], head, [8, 6]);

  // big black leathery nose
  blob(NOSE, [0, 0.578, 0.163], [0.042, 0.052, 0.036], head, [10, 8]);
  blob(NOSE, [0, 0.548, 0.17], [0.036, 0.02, 0.03], head, [8, 6]);
  blob(NOSE_HI, [0.012, 0.6, 0.193], [0.01, 0.016, 0.005], head, [6, 4]);
  blob(NOSE_HI, [-0.016, 0.585, 0.196], [0.005, 0.008, 0.003], head, [5, 4]);
  blob("#0d0c0f", [0.016, 0.545, 0.192], [0.009, 0.006, 0.006], head, [6, 4]);
  blob("#0d0c0f", [-0.016, 0.545, 0.192], [0.009, 0.006, 0.006], head, [6, 4]);

  // drowsy half-closed eyes
  for (const s of [1, -1]) {
    const E = new THREE.Vector3(0.056 * s, 0.626, 0.128);
    b.part(new THREE.SphereGeometry(0.018, 10, 8), EYE, { at: E, bone: head });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), "#1a110b", {
      at: E.clone().add(new THREE.Vector3(0, -0.004, 0.013)),
      bone: head,
    });
    // heavy upper lid
    b.part(new THREE.SphereGeometry(0.0205, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.58), FUR_DK, {
      at: E,
      dir: [0.15 * s, 1, 0.45],
      bone: head,
    });
    // lash line
    b.part(new THREE.CapsuleGeometry(0.0025, 0.026, 2, 4), "#2a2326", {
      at: E.clone().add(new THREE.Vector3(0, -0.003, 0.018)),
      dir: [1, -0.12 * s, 0],
      bone: head,
    });
    // droopy brow
    b.part(new THREE.CapsuleGeometry(0.006, 0.03, 2, 5), FUR_DK, {
      at: E.clone().add(new THREE.Vector3(0.004 * s, 0.03, 0.006)),
      dir: [1, -0.35 * s, 0],
      bone: head,
    });
    // sleepy bag
    b.part(new THREE.CapsuleGeometry(0.004, 0.022, 2, 4), FUR_LT, {
      at: E.clone().add(new THREE.Vector3(0.002 * s, -0.022, 0.01)),
      dir: [1, 0.15 * s, 0],
      bone: head,
    });
  }

  // jaw (separate, slightly open mid-munch)
  blob(CREAM, [0, 0.508, 0.128], [0.042, 0.02, 0.038], jaw, [8, 6]);
  blob(MOUTH, [0, 0.52, 0.14], [0.03, 0.007, 0.025], jaw, [8, 4]);
  blob(FUR_LT, [0, 0.498, 0.115], [0.035, 0.016, 0.03], jaw, [8, 6]);

  // fluffy ears
  for (const [s, ej] of [[1, earL], [-1, earR]] as [number, any][]) {
    const C = new THREE.Vector3(0.125 * s, 0.685, 0.0);
    const n = new THREE.Vector3(0.4 * s, 0.1, 1).normalize();
    const u = new THREE.Vector3().crossVectors(n, new THREE.Vector3(0, 1, 0)).normalize();
    const w = new THREE.Vector3().crossVectors(u, n).normalize();
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.028, 12), FUR, { at: C, dir: n, bone: ej });
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.012, 12), CREAM, {
      at: C.clone().add(n.clone().multiplyScalar(0.015)),
      dir: n,
      bone: ej,
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 10), "#e2d3bb", {
      at: C.clone().add(n.clone().multiplyScalar(0.021)).add(w.clone().multiplyScalar(-0.012)),
      dir: n,
      bone: ej,
    });
    // rim fluff
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2 + 0.2;
      const r = 0.068 + R() * 0.008;
      const p = C.clone()
        .add(u.clone().multiplyScalar(Math.cos(a) * r))
        .add(w.clone().multiplyScalar(Math.sin(a) * r))
        .add(n.clone().multiplyScalar(0.012));
      const sz = 0.013 + R() * 0.008;
      b.part(new THREE.SphereGeometry(1, 6, 4), i % 3 === 0 ? CREAM : WHITE, {
        at: p,
        scale: [sz, sz * 1.5, sz * 0.8],
        dir: p.clone().sub(C),
        bone: ej,
      });
    }
    // long tufts poking out the inner ear
    for (let i = 0; i < 4; i++) {
      const a = -0.6 + i * 0.4 + (s < 0 ? Math.PI : 0);
      const dir = u.clone().multiplyScalar(Math.cos(a)).add(w.clone().multiplyScalar(Math.sin(a))).add(n.clone().multiplyScalar(0.5));
      b.part(new THREE.ConeGeometry(0.008, 0.05, 4), WHITE, {
        at: C.clone().add(n.clone().multiplyScalar(0.02)).add(dir.clone().multiplyScalar(0.03)),
        dir,
        bone: ej,
      });
    }
  }

  // ---------- arms ----------
  seg(shL, elL, 0.042, FUR, shoulderL);
  seg(elL, wrL, 0.036, FUR, elbowL);
  seg(shR, elR, 0.042, FUR, shoulderR);
  seg(elR, wrR, 0.036, FUR, elbowR);
  blob(WHITE, v(elL).add(new THREE.Vector3(0.025, -0.02, -0.01)), [0.025, 0.02, 0.02], elbowL, [6, 4]);
  blob(WHITE, v(elR).add(new THREE.Vector3(-0.025, -0.02, -0.01)), [0.025, 0.02, 0.02], elbowR, [6, 4]);

  // left paw gripping the branch
  const pawL = new THREE.Vector3(0.13, 0.42, 0.262);
  blob(FUR_DK, pawL, [0.042, 0.038, 0.028], wristL, [8, 6]);
  for (let i = 0; i < 3; i++) {
    const p = pawL.clone().add(new THREE.Vector3(-0.034, 0.02 - i * 0.02, -0.008));
    blob(FUR_DK, p, [0.012, 0.009, 0.012], wristL, [5, 4]);
    claw(p.clone().add(new THREE.Vector3(-0.008, 0, -0.006)), [-0.6, -0.1, -1], wristL);
  }
  for (let i = 0; i < 2; i++) {
    const p = pawL.clone().add(new THREE.Vector3(0.025, 0.012 - i * 0.022, -0.016));
    claw(p, [-0.2, -0.1, -1], wristL);
  }

  // right paw holding the sprig up to the mouth
  const pawR = new THREE.Vector3(-0.075, 0.49, 0.205);
  blob(FUR_DK, pawR, [0.036, 0.04, 0.03], wristR, [8, 6]);
  blob(PAD, pawR.clone().add(new THREE.Vector3(0.006, -0.004, 0.026)), [0.018, 0.02, 0.006], wristR, [6, 4]);
  for (let i = 0; i < 3; i++) {
    claw(pawR.clone().add(new THREE.Vector3(0.02, 0.022 - i * 0.018, 0.02)), [1, -0.2, -0.3], wristR, 0.02);
  }
  claw(pawR.clone().add(new THREE.Vector3(-0.025, 0.0, 0.022)), [1, 0.1, 0.4], wristR, 0.018);

  // ---------- legs ----------
  for (const [s, hj, kj, aj, hp, kn, an] of [
    [1, hipL, kneeL, ankleL, hpL, knL, anL],
    [-1, hipR, kneeR, ankleR, hpR, knR, anR],
  ] as [number, any, any, any, V, V, V][]) {
    blob(FUR, hp, [0.075, 0.07, 0.085], hj, [10, 8]);
    seg(hp, kn, 0.06, FUR, hj);
    seg(kn, an, 0.045, FUR, kj);
    const foot = new THREE.Vector3(an[0], 0.04, an[2] + 0.03);
    blob(FUR_DK, foot, [0.046, 0.032, 0.062], aj, [8, 6]);
    blob(PAD, foot.clone().add(new THREE.Vector3(0, -0.026, 0.005)), [0.03, 0.008, 0.045], aj, [6, 4]);
    for (let i = 0; i < 4; i++) {
      const x = an[0] + s * (-0.026 + i * 0.017);
      const p = new THREE.Vector3(x, 0.035, foot.z + 0.055);
      blob(FUR_DK, p, [0.011, 0.012, 0.012], aj, [5, 4]);
      claw(p.clone().add(new THREE.Vector3(0, -0.004, 0.006)), [0, -0.5, 1], aj);
    }
    // grasping inner toe
    claw(foot.clone().add(new THREE.Vector3(-s * 0.045, 0.0, 0.03)), [-s, -0.3, 0.5], aj, 0.02);
  }

  // ---------- eucalyptus branch ----------
  const B0 = new THREE.Vector3(0.02, -0.01, 0.3);
  const B1 = new THREE.Vector3(0.34, 1.05, 0.1);
  const BD = B1.clone().sub(B0).normalize();
  const bp = (t: number) => B0.clone().lerp(B1, t);
  const br = (t: number) => 0.034 - t * 0.012;
  const bu = new THREE.Vector3().crossVectors(BD, new THREE.Vector3(0, 0, 1)).normalize();
  const bw = new THREE.Vector3().crossVectors(BD, bu).normalize();
  const radial = (a: number) => bu.clone().multiplyScalar(Math.cos(a)).add(bw.clone().multiplyScalar(Math.sin(a)));

  rod(B0, B1, br(0), br(1), BARK, hips, 8);
  // flared root on the ground
  b.part(new THREE.CylinderGeometry(0.036, 0.055, 0.05, 8), BARK_DK, { at: [0.02, 0.02, 0.3], bone: hips });
  // peeling bark strips & knots
  for (let i = 0; i < 16; i++) {
    const t = 0.05 + R() * 0.9;
    const a = R() * Math.PI * 2;
    const n = radial(a);
    const p = bp(t).add(n.clone().multiplyScalar(br(t) * 0.92));
    b.part(new THREE.BoxGeometry(0.014 + R() * 0.01, 0.05 + R() * 0.06, 0.008), i % 4 === 0 ? BARK_DK : BARK_LT, {
      at: p,
      dir: BD,
      up: n,
      bone: hips,
    });
  }
  for (const t of [0.32, 0.66]) {
    const n = radial(t * 9);
    blob(BARK_DK, bp(t).add(n.clone().multiplyScalar(br(t) * 0.9)), [0.012, 0.016, 0.012], hips, [6, 4]);
  }

  // twigs with leaf clusters
  const twigs: [number, V][] = [
    [0.72, [-0.8, 0.6, 0.3]],
    [0.82, [0.9, 0.5, 0.4]],
    [0.93, [-0.4, 0.8, 0.6]],
    [1.0, [0.5, 0.9, -0.2]],
    [0.6, [0.7, 0.3, -0.6]],
  ];
  twigs.forEach(([t, d], k) => {
    const s = bp(t);
    const D = v(d).normalize();
    const e = s.clone().add(D.clone().multiplyScalar(0.16));
    rod(s, e, 0.008, 0.004, STEM, hips, 5);
    for (let i = 0; i < 7; i++) {
      const f = 0.25 + (i / 6) * 0.75;
      const base = s.clone().lerp(e, f);
      const side = i % 2 === 0 ? 1 : -1;
      const ld = D.clone()
        .multiplyScalar(0.6)
        .add(new THREE.Vector3(side * 0.6, -0.7 - R() * 0.3, side * 0.3 * (R() - 0.3)));
      leaf(base, ld, 0.05 + R() * 0.02, LEAVES[(i + k) % LEAVES.length], hips);
    }
    leaf(e, D, 0.05, LEAVES[k % LEAVES.length], hips);
  });

  // ---------- sprig in the right paw, mid-munch ----------
  const s0 = pawR.clone().add(new THREE.Vector3(0.004, -0.04, 0.012));
  const s1 = new THREE.Vector3(-0.14, 0.67, 0.27);
  rod(s0, s1, 0.005, 0.003, STEM, wristR, 5);
  const SD = s1.clone().sub(s0).normalize();
  for (let i = 0; i < 6; i++) {
    const f = 0.35 + i * 0.12;
    const base = s0.clone().lerp(s1, f);
    const side = i % 2 === 0 ? 1 : -1;
    leaf(base, new THREE.Vector3(side * 0.8, 0.2 - R() * 0.4, 0.4 + R() * 0.3), 0.045 + R() * 0.012, LEAVES[i % 4], wristR);
  }
  leaf(s1, SD, 0.045, LEAVES[2], wristR);
  // the leaf being chewed: from the mouth, drooping out the side
  const m0 = new THREE.Vector3(-0.012, 0.522, 0.15);
  leaf(m0, [-1, -0.3, 0.35], 0.04, LEAVES[0], jaw);
  leaf(m0.clone().add(new THREE.Vector3(0.008, 0, 0)), [-0.7, -0.75, 0.3], 0.03, LEAVES[1], jaw);
  // little stem stub poking from the lips
  rod(m0, m0.clone().add(new THREE.Vector3(-0.03, -0.008, 0.015)), 0.002, 0.002, STEM, jaw, 4);

  // a few fallen leaves on the ground for composition
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Vector3(-0.2 + R() * 0.45, 0.003, 0.15 + R() * 0.25);
    b.part(new THREE.SphereGeometry(1, 6, 4), LEAVES[i % 4], {
      at: p,
      dir: [R() - 0.5, 0, R() - 0.5],
      scale: [0.012, 0.045, 0.003],
      bone: hips,
    });
  }

  return b.root;
}
