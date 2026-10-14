import * as THREE from "three";
import { createBuilder, catmull, limb, mottle, rng } from "../../../../src/index";

export const meta = {
  name: "Sleepy Koala",
  description: "A drowsy ash-grey koala sitting on a eucalyptus branch, one paw clutching a leafy sprig mid-munch.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });
  const ASH = "#9b9fa4", ASH2 = "#8a8e94", PAW = "#6c7076", CREAM = "#efe6d1";
  const NOSE = "#1a1819", EYE = "#4a2c1c", BARK = "#7a6552", BARK2 = "#5f4e40", CLAW = "#2b2a2c";
  const LEAF = ["#7fa59a", "#6a9488", "#8db3a6"];
  const fur = mottle(ASH, ASH2, { size: 0.07, contrast: 0.5, seed: 3 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.4, -0.04], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.4, -0.04], [0, 0.52, -0.01], [0, 0.65, 0.04], [0, 0.74, 0.08]]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chest = spine.joints[2];
  const head = b.joint("head", { parent: chest, at: [0, 0.8, 0.09], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.78, 0.16], aim: [0, 0.77, 0.26], role: "jaw" });
  const branchJ = b.joint("branch", { parent: hips, at: [0, 0.27, 0] });

  // ---------- prop: branch & stand ----------
  b.sweep(catmull([[-0.6, 0.24, 0.0], [-0.2, 0.265, 0.01], [0.25, 0.28, -0.01], [0.6, 0.31, 0.0]]), [0.042, 0.036], {
    bone: branchJ, color: b.root && mottle(BARK, BARK2, { size: 0.05, seed: 5 }), sides: 7,
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.42, 0.27, 0], [s * 0.56, 0.02, 0.03], [0.03, 0.04], { bone: branchJ, color: BARK2, sides: 6 });
    b.rod([s * 0.56, 0.02, 0.03], [s * 0.56, 0.0, 0.03], 0.05, { bone: branchJ, color: BARK2, sides: 6, caps: "flat" });
  }

  // ---------- body ----------
  b.sweep(spine, (t) => [0.17 + 0.03 * Math.sin(Math.min(1, t * 1.4) * 2.4) , 0.17 + 0.03 * Math.sin(Math.min(1, t * 1.4) * 2.4)], {
    color: fur, sides: 10,
    sectors: [[130, 230, CREAM, 0.1, 1]],
  });
  b.part(new THREE.SphereGeometry(0.2, 10, 8), fur, { bone: hips, at: [0, 0.4, -0.06], scale: [1, 0.85, 0.95] });

  // ---------- head ----------
  const H = [0, 0.86, 0.1] as const;
  b.part(new THREE.SphereGeometry(0.16, 12, 9), fur, { bone: head, at: [...H], scale: [1.3, 1, 1.05] });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), CREAM, { bone: head, at: [0, 0.82, 0.2], scale: [1.1, 0.9, 1.1] });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), NOSE, { bone: head, at: [0, 0.865, 0.265], scale: [1.35, 0.85, 1.0], flat: true });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), "#2a1d1d", { bone: head, at: [0, 0.79, 0.22], scale: [1.4, 0.5, 1.2] });
  for (const s of [1, -1]) {
    const ex = s * 0.095, ey = 0.885, ez = 0.245;
    b.part(new THREE.SphereGeometry(0.021, 8, 6), EYE, { bone: head, at: [ex, ey, ez] });
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), "#ffffff", { bone: head, at: [ex + s * 0.004, ey + 0.002, ez + 0.019] });
    // heavy drowsy lid covering top half
    b.part(new THREE.SphereGeometry(0.0255, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2 + 0.25), ASH2, {
      bone: head, at: [ex, ey - 0.004, ez - 0.001], rotation: [-10, 0, 0],
    });
    b.part(new THREE.TorusGeometry(0.024, 0.003, 4, 10, Math.PI), CLAW, {
      bone: head, at: [ex, ey - 0.003, ez + 0.002], rotation: [-8, 0, 0],
    });
    // ears
    const ang = (s * 25 * Math.PI) / 180;
    const ep = new THREE.Vector3(s * 0.17, 0.985, 0.06);
    b.part(new THREE.SphereGeometry(0.09, 10, 8), fur, { bone: head, at: ep.toArray() as number[], scale: [1, 1, 0.42], rotation: [0, s * 25, 0] });
    const nrm = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const inner = ep.clone().addScaledVector(nrm, 0.022);
    b.part(new THREE.SphereGeometry(0.066, 8, 6), CREAM, { bone: head, at: inner.toArray() as number[], scale: [1, 1, 0.4], rotation: [0, s * 25, 0] });
    for (let i = 0; i < 9; i++) {
      const a = (-25 + i * 28) * (Math.PI / 180);
      const v = new THREE.Vector3(Math.cos(a) * 0.088, Math.sin(a) * 0.088, 0.012).applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
      b.part(new THREE.SphereGeometry(0.024, 6, 4), CREAM, { bone: head, at: ep.clone().add(v).toArray() as number[] });
    }
  }
  // cheek fluff
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.045, 6, 5), CREAM, { bone: head, at: [s * 0.15, 0.8, 0.14], scale: [1, 0.9, 1] });

  // lower jaw, slightly open
  b.part(new THREE.SphereGeometry(0.055, 8, 6), CREAM, { bone: jaw, at: [0, 0.765, 0.2], scale: [1.15, 0.55, 1.1] });
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.13, 0.4, -0.02];
    const pts = limb(hip, [s * 0.15, 0.3, 0.13], [0.17, 0.16], [[s * 0.4, 0.8, 0.5]]);
    const leg = b.chain(`leg${L}`, pts, { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" });
    b.sweep(leg, [0.085, 0.045], { color: fur, sides: 8 });
    const foot = leg.joints[2];
    const fp = pts[2];
    b.part(new THREE.SphereGeometry(0.05, 8, 6), PAW, { bone: foot, at: [fp.x, fp.y, fp.z + 0.02], scale: [1, 0.75, 1.3] });
    for (let i = -1; i <= 1; i++)
      b.part(new THREE.ConeGeometry(0.009, 0.04, 5), CLAW, {
        bone: foot, at: [fp.x + i * 0.022, fp.y - 0.015, fp.z + 0.085], dir: [0, -0.5, 0.8],
      });
  }

  // ---------- arms ----------
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.17, 0.66, 0.06];
    const target: [number, number, number] = s > 0 ? [0.15, 0.315, 0.08] : [-0.1, 0.8, 0.28];
    const pts = limb(sh, target, [0.2, 0.2], [s > 0 ? [0.6, 0, -0.5] : [-0.5, -0.7, -0.2]]);
    const arm = b.chain(`arm${L}`, pts, { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" });
    arms[L] = arm;
    b.sweep(arm, [0.065, 0.045], { color: fur, sides: 8 });
    const wr = arm.joints[2];
    const hp = pts[2];
    b.part(new THREE.SphereGeometry(0.052, 8, 6), PAW, { bone: wr, at: [hp.x, hp.y, hp.z], scale: [1, 0.85, 1.1] });
    for (let i = -1; i <= 1; i++) {
      const dir = s > 0 ? [0, -0.7, 0.5] : [0.3 * -i + 0.2, 0.5, 0.8];
      const off = s > 0 ? [i * 0.022, -0.02, 0.045] : [i * 0.022, 0.0, 0.05];
      b.part(new THREE.ConeGeometry(0.009, 0.042, 5), CLAW, {
        bone: wr, at: [hp.x + off[0], hp.y + off[1], hp.z + off[2]], dir,
      });
    }
  }

  // ---------- leaves ----------
  const outline: [number, number, string?][] = [
    [0, 0], [0.04, 0.022], [0.1, 0.026], [0.16, 0.008], [0.19, 0, "sharp"], [0.16, -0.008], [0.1, -0.026], [0.04, -0.022],
  ].map((p) => p as [number, number, string?]);
  const r = rng(11);
  function leaves(path: ReturnType<typeof catmull>, n: number, bone: any, len: number) {
    for (let i = 0; i < n; i++) {
      const t = 0.12 + (0.8 * i) / (n - 1);
      const p = path.at(t);
      const d = path.tangentAt(t);
      const side = i % 2 ? 1 : -1;
      const x = new THREE.Vector3(d.x * 0.45 + side * 0.8, d.y * 0.45 + 0.1 + r() * 0.2, d.z * 0.45 + 0.25 + r() * 0.2).normalize();
      const yv = new THREE.Vector3(0, 1, 0);
      const yy = yv.clone().sub(x.clone().multiplyScalar(x.dot(yv))).normalize();
      b.extrude(outline as any, {
        at: [p.x, p.y, p.z], x: x.toArray() as number[], y: yy.toArray() as number[],
        thickness: 0.005, smoothing: 1, color: LEAF[i % 3], bone, scale: undefined as any,
      } as any);
      void len;
    }
  }
  // sprig held to the mouth
  const wristR = arms["R"].joints[2];
  const sprig = catmull([[-0.17, 0.64, 0.33], [-0.12, 0.72, 0.32], [-0.06, 0.78, 0.3], [-0.01, 0.8, 0.285]]);
  b.sweep(sprig, [0.011, 0.006], { bone: wristR, color: "#6e5a46", sides: 5 });
  leaves(sprig, 6, wristR, 0.19);
  // twigs on the branch
  for (const s of [1, -1]) {
    const tw = catmull([[s * 0.5, 0.3, 0], [s * 0.56, 0.4, 0.05], [s * 0.64, 0.52, 0.1]]);
    b.sweep(tw, [0.016, 0.008], { bone: branchJ, color: BARK2, sides: 5 });
    leaves(tw, 5, branchJ, 0.19);
  }
  return b.root;
}
