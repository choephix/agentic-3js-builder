import * as THREE from "three";
import { createBuilder, frame, rng, limb, catmull, paint, mix, svg } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = { name: "Phoenix", description: "Flame-plumed phoenix with wings spread, cel-shaded Genshin style." };

const RED = "#e8321e", ORANGE = "#ff8a1c", YELLOW = "#ffd84a", WHITEHOT = "#fff3b0", GOLD = "#f2b53a", TALON = "#5a3a1a", EMBER = "#ff5a20";

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const R = rng(11);
  const hips = b.joint("hips", { at: [0, 0.9, -0.3] });
  const spine = b.chain("spine", catmull([[0, 0.9, -0.3], [0, 1.0, 0.1], [0, 1.2, 0.3]]), { parent: hips, names: ["spine1", "spine2"], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 1.2, 0.3], [0, 1.45, 0.42], [0, 1.66, 0.5]]), { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.66, 0.5], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.1, down: 0.03 }), aim: head.local({ forward: 0.3, down: 0.03 }), role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.9, -0.3], [0, 0.8, -0.75], [0, 0.7, -1.2]]), { parent: hips, names: ["tail1", "tail2"], role: "tail" });

  // body
  const bodyPaint = cel(paint((p, n) => mix(mix(RED, ORANGE, Math.min(1, Math.max(0, (1.2 - p.y) * 1.2 + 0.2))), WHITEHOT, Math.max(0, n.z * 0.3 + (n.y < -0.2 ? 0.4 : 0)))));
  const bodyPath = spine.path.concat(neck.path);
  const body = b.sweep(bodyPath, [0.2, 0.3, 0.27, 0.14, 0.1, 0.08], { bone: [spine, neck], color: bodyPaint, sides: 10 });

  // head
  const hc = head.local({ forward: 0.07, up: 0.03 });
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), cel(ORANGE), { bone: head, at: hc, scale: [0.1, 0.095, 0.115] });
  b.spike(head.local({ forward: 0.1, up: 0.0 }), [0, -0.12, 1], 0.2, 0.05, { bone: head, color: cel(GOLD), sides: 6 });
  b.spike(jaw.local({ up: 0.0 }), [0, -0.2, 1], 0.15, 0.035, { bone: jaw, color: cel("#d99a2a"), sides: 6 });
  const EYE = animeEye({ iris: "#ff7a1c", blush: false });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(hc).at(s * 48, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.055, 0.075], mirror: s > 0 });
  }

  // feather helper
  const fpaint = (len: number) => paint((_p, _n, s) => {
    const t = Math.min(1, Math.max(0, s[1] / len));
    return t < 0.5 ? mix(RED, ORANGE, t * 2) : mix(ORANGE, YELLOW, (t - 0.5) * 2);
  });
  const paints: Record<string, ReturnType<typeof fpaint>> = {};
  const fp = (len: number) => (paints[len.toFixed(1)] ??= fpaint(len));
  const OUT = [[0, 0], [0.075, 0.12], [0.07, 0.55], [0, 1, "sharp"], [-0.07, 0.55], [-0.075, 0.12]] as [number, number, "sharp"?][];
  const feather = (at: number[], d: number[], len: number, w: number, bone: any, thick = 0.012) => {
    const dv = new THREE.Vector3(...d).normalize();
    const xv = new THREE.Vector3().crossVectors(dv, new THREE.Vector3(0, 1, 0)).normalize();
    const o = OUT.map(([x, y, k]) => (k ? [x * w * 8, y * len, k] : [x * w * 8, y * len])) as any;
    return b.extrude(o, { at, x: xv.toArray() as any, y: dv.toArray() as any, thickness: thick, color: fp(len), bone, smoothing: 1 });
  };

  // wings
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = [s * 0.22, 1.2, 0.2], el = [s * 0.85, 1.4, 0.05], wr = [s * 1.5, 1.45, -0.1];
    const arm = b.chain(`wing${S}`, catmull([sh, el, wr]), { parent: spine.joints[1], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "wing" });
    b.sweep(arm, [0.08, 0.035], { color: cel(RED), sides: 6 });
    const lerp3 = (a: number[], c: number[], u: number) => a.map((v, i) => v + (c[i] - v) * u);
    for (let k = 0; k < 8; k++) { // primaries
      const a = (-8 + k * 10) * Math.PI / 180;
      feather(wr.map((v, i) => v + (i === 1 ? -0.012 * k : 0)), [s * Math.cos(a), 0.0, -Math.sin(a)], 1.15 - k * 0.05, 0.05, arm.tip, 0.014);
    }
    for (let k = 0; k < 8; k++) { // secondaries
      const base = lerp3(el, wr, k / 8);
      feather([base[0], base[1] - 0.03, base[2]], [s * 0.2, 0, -1], 0.85 - k * 0.02, 0.055, arm.joints[1], 0.012);
    }
    for (let k = 0; k < 6; k++) { // inner
      const base = lerp3(sh, el, k / 6);
      feather([base[0], base[1] - 0.03, base[2]], [s * 0.1, 0, -1], 0.7, 0.055, arm.joints[0], 0.012);
    }
    for (let k = 0; k < 9; k++) { // coverts
      const base = k < 5 ? lerp3(el, wr, k / 5) : lerp3(sh, el, (k - 5) / 4);
      feather([base[0], base[1] + 0.02, base[2] + 0.02], [s * 0.15, 0.02, -1], 0.4, 0.045, k < 5 ? arm.joints[1] : arm.joints[0], 0.01);
    }
    // legs
    const hip = [s * 0.14, 0.8, -0.05], foot = [s * 0.14, 0.04, 0.12];
    const pts = limb(hip, foot, [0.3, 0.32, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`], role: "leg" });
    b.sweep(leg, [0.06, 0.03], { color: cel(GOLD), sides: 6 });
    for (const a of [-28, 0, 28, 180]) {
      const r = a * Math.PI / 180;
      b.spike(foot, [Math.sin(r), -0.02, Math.cos(r)], a === 180 ? 0.1 : 0.17, 0.022, { bone: leg.tip, color: TALON, sides: 5 });
    }
    // head crest feathers
    for (let k = 0; k < 3; k++) {
      feather(head.local({ back: 0.02 + k * 0.03, up: 0.09 }).toArray(), [s * 0.2 * (k + 1) * 0.3, 0.35 - k * 0.1, -1], 0.3 - k * 0.04, 0.03, head, 0.01);
    }
  }
  // wrist-up crest centre
  for (const k of [0, 1, 2]) feather(head.local({ back: 0.0 + k * 0.04, up: 0.1 }).toArray(), [0, 0.5 - k * 0.12, -1], 0.34 - k * 0.05, 0.035, head, 0.012);

  // tail streamers
  for (let i = -3; i <= 3; i++) {
    const tip = [i * 0.28, 0.35 + Math.abs(i) * 0.04, -1.9 - (3 - Math.abs(i)) * 0.15];
    const mid = [i * 0.12, 0.75, -1.0];
    const path = catmull([[0, 0.88, -0.35], mid, tip]);
    b.sweep(path, [0.05, 0.004], { bone: tail.joints[0], color: fp(1.8), caps: "point", sides: 6 });
    feather(mid, [tip[0] - mid[0], tip[1] - mid[1], tip[2] - mid[2]], 1.0, 0.07, tail.joints[1], 0.012);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), YELLOW, { bone: tail.joints[1], at: tip }), 1.5);
  }

  // flame cards on body
  const FLAME = svg(`<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4a1a"/><stop offset="0.6" stop-color="#ff9a2a"/><stop offset="1" stop-color="#ffe066"/></linearGradient></defs><path d="M16 63 C2 50 6 34 14 24 C14 32 18 34 20 28 C20 18 16 10 18 1 C28 14 31 34 30 46 C29 56 24 61 16 63Z" fill="url(#g)"/></svg>`, { size: 128 });
  const hits = b.surface(body).scatter(70, { rng: R, minDist: 0.08, filter: (h) => h.n.y > -0.3 });
  glow(b.cards(hits, FLAME, { size: [0.08, 0.2], lean: 60, bend: 25, vary: 0.3, rng: R }), 0.8);

  // chest ember
  glow(b.part(new THREE.IcosahedronGeometry(0.07, 0), WHITEHOT, { bone: spine.joints[1], at: [0, 1.08, 0.36] }), 1.4);
  return b.root;
}
