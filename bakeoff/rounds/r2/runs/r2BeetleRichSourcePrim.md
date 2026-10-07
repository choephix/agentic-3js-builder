```ts
import * as THREE from "three";
import { createBuilder, rng, gradient } from "agentic-3js-builder";

export const meta = {
  name: "Stag Beetle on Mossy Log",
  description: "Proud chestnut stag beetle with branched antler jaws, elbowed feathery antennae, spiny legs and a dewdrop, perched on a mossy log.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "stagBeetle" });
  const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const sph = (s = 1) => new THREE.SphereGeometry(s, 10, 8);
  const BLACK = "#15110f";
  const JAW = "#8a3b1c";

  const root = b.joint("root", { at: P(0, 0.14, 0) });
  const abdomen = b.joint("abdomen", { parent: root, at: P(0, 0.145, -0.005), role: "spine" });
  const thorax = b.joint("thorax", { parent: root, at: P(0, 0.148, 0.012), role: "spine" });
  const head = b.joint("head", { parent: thorax, at: P(0, 0.15, 0.04), role: "head" });
  const elytraL = b.joint("elytraL", { parent: abdomen, at: P(0.002, 0.17, 0.012), role: "hinge" });
  const elytraR = b.joint("elytraR", { parent: abdomen, at: P(-0.002, 0.17, 0.012), role: "hinge" });

  // ---- log ----
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 10), "#4a3222", { at: P(0, 0.06, 0), rotation: [90, 0, 0], bone: root });
  for (const z of [-0.15, 0.15]) {
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.004, 10), "#b8895a", { at: P(0, 0.06, z * 1.003), rotation: [90, 0, 0], bone: root });
    b.part(new THREE.TorusGeometry(0.03, 0.0015, 4, 12), "#6e4a2c", { at: P(0, 0.06, z * 1.01), bone: root });
    b.part(new THREE.TorusGeometry(0.014, 0.0012, 4, 10), "#6e4a2c", { at: P(0, 0.06, z * 1.01), bone: root });
  }
  const R = rng(5);
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2, z = (R() - 0.5) * 0.28;
    b.part(new THREE.BoxGeometry(0.006, 0.012 + R() * 0.02, 0.01), "#2e1e14", {
      at: P(Math.sin(a) * 0.06, 0.06 + Math.cos(a) * 0.06, z), rotation: [0, 0, -a * 57.3], bone: root });
  }
  for (let i = 0; i < 26; i++) {
    const a = (R() - 0.5) * 2.6 + (i % 2 ? 0 : 0), z = (R() - 0.5) * 0.29;
    const ang = i < 10 ? (R() - 0.5) * 0.5 + (R() < 0.5 ? 1.2 : -1.2) : a;
    const x = Math.sin(ang) * 0.058, y = 0.06 + Math.cos(ang) * 0.058;
    if (Math.abs(x) < 0.035 && y > 0.1 && Math.abs(z) < 0.07) continue;
    const s = 0.008 + R() * 0.012;
    b.part(sph(), R() < 0.5 ? "#4f7a2c" : "#6b9a3a", { at: P(x, y, z), scale: [s * 1.3, s * 0.6, s * 1.2], rotation: [0, R() * 180, -ang * 57.3], bone: root });
  }

  // ---- body ----
  b.part(sph(), BLACK, { at: P(0, 0.142, -0.02), scale: [0.026, 0.016, 0.036], bone: abdomen });
  b.part(sph(), BLACK, { at: P(0, 0.15, 0.022), scale: [0.023, 0.014, 0.016], bone: thorax });
  b.part(new THREE.BoxGeometry(0.05, 0.004, 0.006), "#2b2420", { at: P(0, 0.162, 0.03), bone: thorax });
  b.part(sph(), BLACK, { at: P(0, 0.15, 0.048), scale: [0.016, 0.011, 0.012], bone: head });
  for (const s of [1, -1]) {
    b.part(sph(), "#e8d9a8", { at: P(s * 0.014, 0.153, 0.05), scale: [0.004, 0.005, 0.005], bone: head });
    b.part(sph(), "#000000", { at: P(s * 0.016, 0.153, 0.052), scale: [0.0022, 0.003, 0.003], bone: head });
  }

  // wing cases
  const caseGrad = gradient("#5a1c0c", "#c2561f", P(0, 0.16, 0.02), P(0, 0.17, -0.06));
  for (const s of [1, -1]) {
    const j = s > 0 ? elytraL : elytraR;
    b.part(sph(), caseGrad, { at: P(s * 0.0185, 0.158, -0.022), scale: [0.019, 0.017, 0.046], bone: j });
    b.part(sph(), "#ffe0a8", { at: P(s * 0.0125, 0.1735, -0.012), scale: [0.003, 0.0018, 0.022], bone: j });
    b.part(sph(), "#fff3d6", { at: P(s * 0.011, 0.1745, 0.004), scale: [0.0018, 0.001, 0.005], bone: j });
    b.part(sph(), "#3a1208", { at: P(s * 0.032, 0.153, -0.03), scale: [0.003, 0.004, 0.03], bone: j });
  }
  b.part(new THREE.BoxGeometry(0.0007, 0.0012, 0.078), "#2b0e06", { at: P(0, 0.1745, -0.022), bone: abdomen });

  // ---- mandibles ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const jaw = b.joint("jaw" + side, { parent: head, at: P(s * 0.009, 0.15, 0.056), role: "jaw" });
    const base = P(s * 0.009, 0.15, 0.056), p1 = P(s * 0.017, 0.151, 0.074), p2 = P(s * 0.018, 0.153, 0.092), tip = P(s * 0.008, 0.157, 0.109);
    b.sweep([base, p1, p2, tip], [0.0068, 0.0055, 0.0035, 0.0012], { color: JAW, bone: jaw, name: "mandible" + side, sides: 6 });
    b.spike(P(s * 0.0165, 0.1515, 0.073), P(s * 0.009, 0.152, 0.079), null, 0.0022, { color: JAW, bone: jaw });
    b.spike(P(s * 0.0178, 0.1525, 0.088), P(s * 0.027, 0.158, 0.099), null, 0.0028, { color: JAW, bone: jaw });
    b.spike(P(s * 0.0165, 0.1535, 0.097), P(s * 0.0125, 0.163, 0.108), null, 0.002, { color: JAW, bone: jaw });
    b.spike(P(s * 0.0118, 0.1555, 0.104), P(s * 0.004, 0.152, 0.101), null, 0.0018, { color: JAW, bone: jaw });
    if (s > 0) {
      b.part(sph(), "#bfe8ff", { at: P(0.0268, 0.1545, 0.0985), scale: 0.0045, bone: jaw });
      b.part(sph(), "#ffffff", { at: P(0.0278, 0.156, 0.1), scale: 0.0013, bone: jaw });
    }
  }

  // ---- antennae ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = [P(s * 0.011, 0.156, 0.058), P(s * 0.02, 0.162, 0.07), P(s * 0.026, 0.166, 0.082), P(s * 0.031, 0.164, 0.093)];
    const ch = b.chain("antenna" + side, path, { parent: head, role: "digit", names: [`antA${side}`, `antB${side}`, `antC${side}`] });
    b.sweep(ch, [0.0016, 0.0011], { color: "#241a15", sides: 5 });
    const t = path[3];
    for (let k = 0; k < 4; k++) {
      const a = (k - 1.5) * 0.35;
      const e = P(t.x + s * Math.sin(a) * 0.013 + s * 0.004, t.y + Math.cos(a) * 0.005 + 0.004, t.z + 0.012);
      b.frustumBox(t, e, [0.003, 0.0007], [0.0025, 0.0007], { color: k % 2 ? "#6a2f18" : "#8a3b1c", bone: ch.joints[2] });
    }
  }

  // ---- legs ----
  const zs = [0.03, 0.0, -0.03], spread = [0.016, 0, -0.018];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    zs.forEach((z, i) => {
      const hip = P(s * 0.018, 0.14, z);
      const knee = P(s * 0.052, 0.158, z + spread[i] * 0.6);
      const ankle = P(s * 0.062, 0.115, z + spread[i]);
      const foot = P(s * 0.05, 0.097, z + spread[i] * 1.15);
      const n = `${side}${i + 1}`;
      const ch = b.chain("leg" + n, [hip, knee, ankle, foot], {
        parent: thorax, role: "leg", names: [`hip${n}`, `knee${n}`, `ankle${n}`, `foot${n}`],
      });
      b.sweep(ch, [0.0045, 0.002], { color: BLACK, sides: 5 });
      b.part(sph(), "#2b2420", { at: knee, scale: 0.0048, bone: ch.joints[1] });
      for (let k = 1; k <= 3; k++) {
        const p = ankle.clone().lerp(knee, k / 4);
        b.spike(p, P(p.x + s * 0.007, p.y + 0.002, p.z + (k % 2 ? 0.006 : -0.006)), null, 0.0014, { color: "#2b2420", bone: ch.joints[1] });
      }
      b.spike(foot, P(foot.x - s * 0.004, foot.y - 0.01, foot.z + 0.003), null, 0.0016, { color: BLACK, bone: ch.joints[2] });
    });
  }

  return b.root;
}
```