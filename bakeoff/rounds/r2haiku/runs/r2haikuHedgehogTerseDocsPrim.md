```ts
import * as THREE from "three";
import { createBuilder, countershade, paint, polyline, rng } from "agentic-3js-builder";

export const meta = {
  name: "hedgehog",
  description: "A stylised hedgehog: a bold brown back with a cream-tipped spine coat, a dark pointed snout, and short stubby legs.",
};

const COAT = "#8a6444";
const BELLY = "#4a3426";
const FACE = "#7a5438";
const SNOUT = "#3b2a20";
const CREAM = "#eadcc0";
const DARK = "#2a1d16";
const EAR = "#d8a592";
const EYE = "#140d09";

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const rand = rng(11);

  // Skeleton
  const BODY = [0, 0.08, -0.03];
  const hips = b.joint("hips", { at: BODY, aim: [0, 0.08, 0.05], role: "spine" });
  const head = b.joint("head", { parent: hips, at: [0, 0.085, 0.1], aim: [0, 0.085, 0.2], role: "head" });

  // Round, blocky body
  const bodyGeo = new THREE.SphereGeometry(1, 20, 14).scale(0.058, 0.06, 0.07);
  const body = b.part(bodyGeo, countershade(COAT, BELLY, { level: -0.1 }), {
    at: BODY,
    bone: hips,
    flat: true,
  });

  // Head with a dark snout and a little nose
  b.part(new THREE.SphereGeometry(0.04, 12, 9), FACE, { at: [0, 0.085, 0.1], bone: head, flat: true });
  b.spike([0, 0.082, 0.125], [0, -0.02, 1], 0.045, 0.027, { color: SNOUT, bone: head });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), EYE, { at: [0, 0.0815, 0.168], bone: head });

  // Eyes with highlights, and ears tucked in the spines
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.01, 8, 6), EYE, { at: [s * 0.022, 0.098, 0.13], bone: head });
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), "#ffffff", { at: [s * 0.025, 0.102, 0.138], bone: head });
    b.part(new THREE.SphereGeometry(0.012, 8, 6).scale(1, 1.2, 0.4), EAR, {
      at: [s * 0.03, 0.12, 0.09],
      bone: head,
    });
  }

  // Four short legs on chains, each ending in a flat foot
  const leg = (tag: string, s: number, z: number) => {
    const ch = b.chain(
      `leg${tag}`,
      polyline([
        [s * 0.035, 0.07, z],
        [s * 0.036, 0.035, z + 0.01],
        [s * 0.034, 0.012, z + 0.02],
      ]),
      { parent: hips, names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`], role: "leg" },
    );
    b.sweep(ch, [0.013, 0.009], { color: BELLY });
    b.part(new THREE.SphereGeometry(0.014, 8, 6).scale(1, 0.6, 1.3), BELLY, {
      at: [s * 0.034, 0.008, z + 0.03],
    });
  };
  leg("FL", 1, 0.04);
  leg("FR", -1, 0.04);
  leg("BL", 1, -0.1);
  leg("BR", -1, -0.1);

  // The spine coat: dark cones scattered over the back and flanks,
  // each painted cream toward its tip.
  const spineColour = paint((_p, _n, s) => (s[1] < 0.35 ? CREAM : DARK));
  const skin = b.surface(body);
  const hits = skin.scatter(240, {
    rng: rand,
    minDist: 0.013,
    filter: (h) => h.n.z < 0.25 && h.n.y > -0.2,
  });
  for (const hit of hits) {
    b.stick(new THREE.ConeGeometry(0.0055, 0.045, 5), spineColour, hit, { embed: 0.25 });
  }

  return b.root;
}
```