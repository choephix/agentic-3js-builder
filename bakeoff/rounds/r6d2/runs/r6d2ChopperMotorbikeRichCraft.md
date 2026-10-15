1. **Pad paint area.** The hex stage used two big painted surfaces (hazard stripes and a panelled deck), which spread the paint texture thin over the whole model. That is why the tire pinstripes and tank flames look pixel-jagged. I'm swapping both for flat colours plus a ring of small orange hazard blocks and two deck seam lines. I'm also raising `paintSize` to 2048. The next render should show smooth orange rings on the tires and cleaner flame edges, with the pad still reading as a hazard-striped garage pad.
2. **Empty seat.** The bike has no character on it and the middle reads as a flat brown strip. I'm adding a hero helmet on the seat: navy shell, glowing teal visor, orange crest stripe and ear discs. It matches the glow and emblem colours and fills the dead area behind the tank in the three-quarter and back views. It should read as a clear second focal point and tie the palette together.

## Edits

<<<<<<< SEARCH
  panelled,
  gearGeometry,
=======
  gearGeometry,
>>>>>>> REPLACE

<<<<<<< SEARCH
const HAZARD = paint((p, n) => {
  if (n.y > 0.5) return "#232a3d";
  const k = ((((p.x + p.z) / 0.14) % 1) + 1) % 1;
  return k < 0.5 ? ORANGE : "#1b2133";
});
const DECK = panelled(SLATE, { size: 0.4, aspect: 1, rivets: 0.1 });
=======
const PAD = "#1b2338";
const DECK = SLATE;
>>>>>>> REPLACE

<<<<<<< SEARCH
  const b = createBuilder({ name: "chopper" });
=======
  const b = createBuilder({ name: "chopper", paintSize: 2048 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(new THREE.CylinderGeometry(1.72, 1.8, 0.05, 6), HAZARD, stage, [0, 0.025, 0.08]);
  P(new THREE.CylinderGeometry(1.52, 1.52, 0.02, 6), DECK, stage, [0, 0.06, 0.08]);
=======
  P(new THREE.CylinderGeometry(1.72, 1.8, 0.05, 6), PAD, stage, [0, 0.025, 0.08]);
  P(new THREE.CylinderGeometry(1.52, 1.52, 0.02, 6), DECK, stage, [0, 0.06, 0.08]);
  // hazard blocks around the pad rim
  for (let k = 0; k < 6; k++) {
    const phi = (k * 60 + 30) * D2R;
    for (let j = -2.5; j <= 2.5; j += 1) {
      const cx = 1.4 * Math.sin(phi) + j * 0.24 * Math.cos(phi);
      const cz = 0.08 + 1.4 * Math.cos(phi) - j * 0.24 * Math.sin(phi);
      P(box(0.09, 0.012, 0.12), ORANGE, stage, [cx, 0.056, cz], { rotation: [0, k * 60 + 30 + 35, 0] });
    }
  }
  // deck seam lines
  for (const sx of [-0.7, 0.7]) P(box(0.014, 0.004, 2.1), "#59668a", stage, [sx, 0.072, 0.08]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const DFneg = DF.clone().negate();
=======
  // hero helmet on the seat
  {
    const hc = V(0, 0.95, -0.46);
    const hs: [number, number, number] = [0.13, 0.115, 0.15];
    P(new THREE.SphereGeometry(1, 12, 8), toned(NAVY, 0.3, 0.3), frameJ, hc, { scale: hs });
    glow(
      P(new THREE.SphereGeometry(1.04, 10, 5, Math.PI / 2 - 0.9, 1.8, 1.0, 0.8), TEAL, frameJ, hc, { scale: hs }),
      1.2,
    );
    const crestPts = [-50, -25, 0, 25, 50].map(
      (a) => new THREE.Vector3(0, hc.y + 0.115 * 1.06 * Math.cos(a * D2R), hc.z + 0.15 * 1.06 * Math.sin(a * D2R)),
    );
    b.sweep(catmull(crestPts), 0.009, { color: ORANGE, bone: frameJ, sides: 4 });
    for (const s of [1, -1]) P(cyl(0.04, 0.04, 0.02, 8), ORANGE, frameJ, mv(hc, s * 0.13, -0.01, 0.0), { dir: X_AXIS });
  }

  const DFneg = DF.clone().negate();
>>>>>>> REPLACE