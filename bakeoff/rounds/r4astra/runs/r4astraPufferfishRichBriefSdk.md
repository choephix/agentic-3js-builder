```ts
import * as THREE from "three";
import { createBuilder, frame, rng } from "agentic-3js-builder";

export const meta = {
  name: "Oh! — Puffed Pufferfish",
  description:
    "A round, startled pufferfish with buttery leopard-patterned skin, an ivory belly, tiny prickles, worried eyes, delicate fan fins, and three rising bubbles."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "startled-pufferfish" });
  const random = rng(74193);

  const C = new THREE.Vector3(0, 0.337, 0);
  const p = (x: number, y: number, z: number) =>
    new THREE.Vector3(x, y, z).add(C);

  const cream = "#f6e5ab";
  const ivory = "#fff8e7";
  const cocoa = "#69452c";
  const ochre = "#bd914a";
  const finGold = "#edd08a";
  const finRay = "#b78a43";
  const eyeWhite = "#fffdf4";
  const pupilColor = "#241c19";
  const bubbleColor = "#c5eaf2";

  // Skeleton. The inflated body is essentially one rigid, round trunk.
  const spine = b.joint("spine", { at: C });
  const head = b.joint("head", {
    at: p(0, 0.045, 0.17),
    parent: spine
  });

  const mouthAt = p(0, -0.052, 0.341);
  const upperJaw = b.joint("upperJaw", { at: mouthAt, parent: head });
  const jaw = b.joint("jaw", {
    at: p(0, -0.069, 0.306),
    parent: head
  });

  const finAnchors = [p(0.292, -0.016, 0.015), p(-0.292, -0.016, 0.015)];
  const finL = b.joint("finL", { at: finAnchors[0], parent: spine });
  const finR = b.joint("finR", { at: finAnchors[1], parent: spine });
  b.joint("finTipL", { at: p(0.452, -0.016, -0.043), parent: finL });
  b.joint("finTipR", { at: p(-0.452, -0.016, -0.043), parent: finR });

  const tail = b.chain(
    "tail",
    [p(0, -0.014, -0.275), p(0, -0.014, -0.358), p(0, -0.014, -0.421)],
    { parent: spine, role: "tail" }
  );

  // Also identify the rigid joints' anatomical roles.
  function role(j: any, value: string) {
    const bone = j.bone ?? j;
    bone.userData = bone.userData ?? {};
    bone.userData.role = value;
  }
  role(spine, "spine");
  role(head, "head");
  role(upperJaw, "head");
  role(jaw, "jaw");
  role(finL, "fan");
  role(finR, "fan");

  // The simple ball carries a soft dorsal-to-ventral colour gradient.
  // Vertex colour leaves the silhouette and the underlying facets uncomplicated.
  const bodyGeo = new THREE.SphereGeometry(0.3, 32, 24);
  bodyGeo.scale(1.04, 1, 1.06);
  const positions = bodyGeo.getAttribute("position");
  const vertexColors: number[] = [];
  const belly = new THREE.Color("#fffaf0");
  const sides = new THREE.Color("#f3dfa0");
  const back = new THREE.Color("#d9b862");
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const color = belly.clone();
    color.lerp(sides, THREE.MathUtils.smoothstep(y, -0.19, 0.095));
    color.lerp(back, 0.68 * THREE.MathUtils.smoothstep(y, 0.075, 0.29));
    vertexColors.push(color.r, color.g, color.b);
  }
  bodyGeo.setAttribute("color", new THREE.Float32BufferAttribute(vertexColors, 3));
  const bodyMaterialKey = "#fffffe";
  const body = b.part(bodyGeo, bodyMaterialKey, { at: spine, bone: spine });
  const skin = b.surface(body);

  function skinHit(n: THREE.Vector3) {
    return skin.ray(C.clone().addScaledVector(n, 1.2), n.clone().negate());
  }

  // Irregular, sometimes broken leopard rosettes, in the local XZ tangent plane.
  function rosette(radius: number, broken: boolean): THREE.BufferGeometry {
    const count = 11;
    const outer: number[] = [];
    const inner: number[] = [];
    for (let i = 0; i < count; i++) {
      outer.push(radius * (0.84 + random() * 0.28));
      inner.push(radius * (0.43 + random() * 0.18));
    }
    const gap = Math.floor(random() * count);
    const verts: number[] = [];
    const add = (r: number, angle: number) => {
      verts.push(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    };
    for (let i = 0; i < count; i++) {
      if (broken && (i === gap || i === (gap + 5) % count)) continue;
      const j = (i + 1) % count;
      const a = (i / count) * Math.PI * 2;
      const c = ((i + 1) / count) * Math.PI * 2;
      add(outer[i], a); add(inner[i], a); add(outer[j], c);
      add(inner[i], a); add(inner[j], c); add(outer[j], c);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geometry.computeVertexNormals();
    return geometry;
  }

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 174; i++) {
    const y = 1 - 2 * (i + 0.5) / 174;
    const horizontal = Math.sqrt(1 - y * y);
    const angle = i * goldenAngle + 0.19;
    const n = new THREE.Vector3(
      horizontal * Math.cos(angle), y, horizontal * Math.sin(angle)
    );
    if (y < -0.18) continue;
    // Leave an open, readable mask around the facial features.
    if (n.z > 0.56 && Math.abs(n.x) < 0.77 && y < 0.78) continue;
    const hit = skinHit(n);
    if (!hit) continue;
    const radius = 0.014 + random() * 0.010;
    b.stick(
      new THREE.CylinderGeometry(radius * 0.54, radius * 0.54, 0.00065, 7),
      "#caa25b",
      hit
    );
    b.stick(rosette(radius, i % 3 !== 0), cocoa, hit);
  }

  // Small satellite flecks give the rosettes a less mechanical rhythm.
  for (let i = 0; i < 53; i++) {
    const y = 0.02 + random() * 0.92;
    const angle = i * goldenAngle + 1.8;
    const h = Math.sqrt(1 - y * y);
    const n = new THREE.Vector3(h * Math.cos(angle), y, h * Math.sin(angle));
    if (n.z > 0.55 && Math.abs(n.x) < 0.8 && y < 0.8) continue;
    const hit = skinHit(n);
    if (!hit) continue;
    const r = 0.0035 + random() * 0.0025;
    b.stick(new THREE.CylinderGeometry(r, r * 0.9, 0.0007, 5), "#876039", hit);
  }

  // Short five-sided prickles, seated on the actual ball rather than floating.
  for (let i = 0; i < 217; i++) {
    const y = 1 - 2 * (i + 0.5) / 217;
    const h = Math.sqrt(1 - y * y);
    const a = i * goldenAngle + 0.83;
    const n = new THREE.Vector3(h * Math.cos(a), y, h * Math.sin(a));
    if (
      n.z > 0.60 &&
      Math.abs(n.x) < 0.76 &&
      y > -0.37 &&
      y < 0.84
    ) continue;

    const hit = skinHit(n);
    if (!hit) continue;
    const length = 0.025 + random() * 0.014;
    const radius = 0.0046 + random() * 0.0018;
    if (y > -0.12) {
      b.stick(
        new THREE.CylinderGeometry(radius * 1.48, radius * 1.65, 0.0014, 7),
        "#c9aa66",
        hit
      );
    }
    b.stick(
      new THREE.ConeGeometry(radius, length, 5, 1),
      y < -0.16 ? ivory : "#fff0c2",
      hit
    );
  }
  // The lowest prickle just meets y = 0.
  const bottom = skinHit(new THREE.Vector3(0, -1, 0));
  if (bottom) b.stick(new THREE.ConeGeometry(0.0052, 0.037, 5), ivory, bottom);

  // Bulging worried eyes. Reframe body hits onto the head bone.
  for (const sign of [1, -1]) {
    const n = new THREE.Vector3(sign * 0.405, 0.37, 0.855).normalize();
    const hit = skinHit(n);
    if (!hit) continue;
    const onHead = frame(head, hit).moved(hit);

    b.stick(
      new THREE.SphereGeometry(0.077, 16, 10).scale(1, 0.34, 1),
      "#d2ae5e",
      onHead
    );
    const eye = b.stick(
      new THREE.SphereGeometry(0.069, 20, 14).scale(1, 0.74, 1),
      eyeWhite,
      onHead
    );

    const gazeX = sign * 0.142;
    const gazeY = 0.161;
    const irisHit = b.surface(eye).ray(p(gazeX, gazeY, 1), [0, 0, -1]);
    if (irisHit) {
      // Amber iris ring surrounding an oversized dark pupil.
      const iris = new THREE.TorusGeometry(0.0295, 0.0065, 6, 20);
      iris.rotateX(Math.PI / 2);
      b.stick(iris, "#a77732", irisHit);

      const pupil = b.stick(
        new THREE.SphereGeometry(0.026, 16, 10).scale(1, 0.28, 1),
        pupilColor,
        irisHit
      );
      const pupilSurface = b.surface(pupil);
      const shine = pupilSurface.ray(p(gazeX - 0.008, gazeY + 0.010, 1), [0, 0, -1]);
      if (shine) {
        b.stick(new THREE.SphereGeometry(0.007, 8, 6), "#ffffff", shine);
      }
      const smallShine = pupilSurface.ray(
        p(gazeX + 0.010, gazeY - 0.009, 1), [0, 0, -1]
      );
      if (smallShine) {
        b.stick(new THREE.SphereGeometry(0.0031, 7, 5), "#f8eed7", smallShine);
      }
    }

    // High inner ends and lower outer ends make a distinctly anxious brow.
    const brow = skin.drape([
      p(sign * 0.222, 0.163, 0.25),
      p(sign * 0.189, 0.211, 0.25),
      p(sign * 0.134, 0.245, 0.25),
      p(sign * 0.085, 0.243, 0.25)
    ]);
    b.sweep(brow, 0.0064, { color: cocoa, bone: head });

    // Tiny nostrils above the pouting mouth.
    const nostril = skin.ray(p(sign * 0.033, -0.006, 1), [0, 0, -1]);
    if (nostril) {
      b.stick(
        new THREE.SphereGeometry(0.0043, 7, 5).scale(1, 0.24, 0.7),
        "#957145",
        frame(head, nostril).moved(nostril)
      );
    }

    // A short curved gill slit immediately in front of each side fin.
    b.sweep(
      skin.drape([
        p(sign * 0.293, 0.037, 0.118),
        p(sign * 0.301, 0.010, 0.122),
        p(sign * 0.299, -0.020, 0.117),
        p(sign * 0.291, -0.038, 0.111)
      ]),
      0.0024,
      { color: "#9b794a", bone: spine }
    );
  }

  // A tiny O-shaped pout: independently rigged upper and lower lips.
  b.part(
    new THREE.SphereGeometry(0.019, 16, 10).scale(1, 1.08, 0.36),
    "#513526",
    { at: mouthAt, bone: upperJaw }
  );
  const upperLip = new THREE.TorusGeometry(0.0208, 0.0075, 7, 14, Math.PI);
  upperLip.scale(1, 1.08, 1);
  const lowerLip = upperLip.clone();
  lowerLip.rotateZ(Math.PI);
  b.part(upperLip, "#e6bd78", {
    at: mouthAt.clone().add(new THREE.Vector3(0, 0, 0.006)),
    bone: upperJaw
  });
  b.part(lowerLip, "#efd099", {
    at: mouthAt.clone().add(new THREE.Vector3(0, 0, 0.006)),
    bone: jaw
  });
  b.part(
    new THREE.SphereGeometry(1, 10, 6).scale(0.010, 0.0035, 0.003),
    "#c59176",
    { at: mouthAt.clone().add(new THREE.Vector3(0, -0.010, 0.0065)), bone: jaw }
  );

  // Side fins: open, lightly scalloped fans with individual supporting rays.
  for (let side = 0; side < 2; side++) {
    const sign = side === 0 ? 1 : -1;
    const joint = side === 0 ? finL : finR;
    const origin = finAnchors[side];
    const handle = frame(joint, [sign, 0, -0.35]);
    const fp = (u: number, v: number) =>
      handle.moved(
        origin.clone().add(new THREE.Vector3(sign * u, v, -u * 0.37))
      );

    const lower = [fp(0, 0), fp(0.067, -0.050), fp(0.127, -0.047), fp(0.162, 0)];
    const upper = [fp(0, 0), fp(0.072, 0.057), fp(0.131, 0.050), fp(0.162, 0)];
    b.membrane(lower, upper, { color: finGold });

    const tips = [
      [0.068, -0.050], [0.108, -0.052], [0.139, -0.032],
      [0.162, 0], [0.141, 0.032], [0.111, 0.054], [0.072, 0.057]
    ];
    for (const [u, v] of tips) {
      b.sweep(
        [fp(0.008, 0), fp(u * 0.56, v * 0.44), fp(u, v)],
        0.00165,
        { color: finRay }
      );
    }
    b.sweep(
      [
        fp(0, 0), fp(0.068, -0.050), fp(0.108, -0.052),
        fp(0.139, -0.032), fp(0.162, 0), fp(0.141, 0.032),
        fp(0.111, 0.054), fp(0.072, 0.057), fp(0, 0)
      ],
      0.0018,
      { color: "#f9e6b3" }
    );
    b.sweep([fp(0, 0), fp(0.049, 0)], 0.009, { color: cream });
  }

  // Short tail stalk and upright, striped fan.
  b.sweep(tail, 0.022, { color: cream });
  const tailEnd = tail.at(1);
  const tailOrigin = p(0, -0.014, -0.421);
  const tp = (u: number, v: number) =>
    tailEnd.moved(tailOrigin.clone().add(new THREE.Vector3(0, v, -u)));

  b.membrane(
    [tp(0, 0), tp(0.061, -0.047), tp(0.150, -0.100), tp(0.174, 0)],
    [tp(0, 0), tp(0.061, 0.047), tp(0.150, 0.100), tp(0.174, 0)],
    { color: "#e7c474" }
  );
  const tailTips = [
    [0.150, -0.100], [0.159, -0.073], [0.168, -0.038],
    [0.174, 0], [0.168, 0.038], [0.159, 0.073], [0.150, 0.100]
  ];
  for (const [u, v] of tailTips) {
    b.sweep(
      [tp(0.004, 0), tp(u * 0.51, v * 0.44), tp(u, v)],
      0.0021,
      { color: finRay }
    );
    b.sweep(
      [tp(u * 0.79, v * 0.78), tp(u, v)],
      0.003,
      { color: "#f7e4ac" }
    );
  }
  b.sweep(
    [tp(0, 0), ...tailTips.map(([u, v]) => tp(u, v)), tp(0, 0)],
    0.0022,
    { color: ochre }
  );

  // Three airy bubbles, with transparent volumes, rims, and bright curved glints.
  const bubbles = [
    { at: new THREE.Vector3(0.046, 0.399, 0.433), r: 0.016 },
    { at: new THREE.Vector3(0.108, 0.592, 0.445), r: 0.025 },
    { at: new THREE.Vector3(0.169, 0.805, 0.451), r: 0.036 }
  ];
  for (const bubble of bubbles) {
    b.part(new THREE.SphereGeometry(bubble.r, 18, 12), bubbleColor, {
      at: bubble.at,
      bone: spine
    });
    b.part(
      new THREE.TorusGeometry(bubble.r * 0.97, 0.0009, 5, 28),
      "#9dcedb",
      { at: bubble.at, bone: spine }
    );
    const glint = new THREE.TorusGeometry(
      bubble.r * 0.64, 0.0013, 5, 14, Math.PI * 0.64
    );
    glint.rotateZ(Math.PI * 0.23);
    b.part(glint, "#ffffff", {
      at: bubble.at.clone().add(new THREE.Vector3(0, 0, bubble.r * 0.77)),
      bone: spine
    });
    b.part(new THREE.SphereGeometry(bubble.r * 0.068, 7, 5), "#ffffff", {
      at: bubble.at.clone().add(
        new THREE.Vector3(bubble.r * 0.43, -bubble.r * 0.39, bubble.r * 0.80)
      ),
      bone: spine
    });
  }

  // Keep SDK-shared materials; only the body paint and bubble glass need flags.
  const bodyHex = new THREE.Color(bodyMaterialKey).getHex();
  const bubbleHex = new THREE.Color(bubbleColor).getHex();
  b.root.traverse((object: THREE.Object3D) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      const m = material as THREE.MeshStandardMaterial;
      if (!m.color) continue;
      if (m.color.getHex() === bodyHex) {
        m.vertexColors = true;
        m.flatShading = true;
        m.roughness = 0.82;
        m.needsUpdate = true;
      }
      if (m.color.getHex() === bubbleHex) {
        m.transparent = true;
        m.opacity = 0.17;
        m.depthWrite = false;
        m.roughness = 0.12;
        m.metalness = 0.05;
        m.needsUpdate = true;
      }
    }
  });

  return b.root;
}
```