1. **Bike dissolves into the stage.** A navy bike on a navy pad with navy frame tubes reads as one dark mass. I lighten the pad to a steel-blue concrete with panel seams, lift the frame and engine metal (`GUNM`) to a lighter blue-steel, and brighten the pad slab. The orange and navy bike now pops, closer to Overwatch's clean, readable colour.
2. **Hazard border is lost.** The painted stripes never showed on the pad rim, so the rim reads as dead dark navy. I replace them with real alternating orange and dark chevron blocks along all six edges, which gives the pad a signature map-edge look.
3. **Tank flames are too shy.** Only small teeth peek out below the tank's edge. I raise the flame line so orange and yellow cover more of the tank's side, giving the tank a bolder hero read.
4. **Tyre sidewall stripe is a stippled dotted line.** I widen the orange sidewall ring so it renders as a clean pinstripe.

<<<<<<< SEARCH
const GUNM = toned("#55639a", 0.3, 0.4);
=======
const GUNM = toned("#7a8dc6", 0.3, 0.4);
>>>>>>> REPLACE

<<<<<<< SEARCH
const HAZARD = paint((p, n) => {
  if (n.y < -0.5) return "#1b2133";
  const k = ((((p.x + p.z) / 0.14) % 1) + 1) % 1;
  return k < 0.5 ? ORANGE : "#1b2133";
});
const DECK = panelled(SLATE, { size: 0.4, aspect: 1, rivets: 0.1 });
=======
const HAZARD = toned("#34436e", 0.25, 0.3);
const DECK = panelled("#8c9fcf", { size: 0.4, aspect: 1, rivets: 0.1 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const yb = yc + 0.035 - (0.09 + 0.2 * zf) * (1 - saw);
=======
    const yb = yc + 0.075 - (0.09 + 0.2 * zf) * (1 - saw);
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (face >= 0.6 && r > R * 0.72 && r < R * 0.77) return ORANGE;
=======
    if (face >= 0.6 && r > R * 0.7 && r < R * 0.79) return ORANGE;
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(new THREE.CylinderGeometry(1.72, 1.8, 0.05, 6), HAZARD, stage, [0, 0.025, 0.08]);
=======
  P(new THREE.CylinderGeometry(1.72, 1.8, 0.05, 6), HAZARD, stage, [0, 0.025, 0.08]);
  // hazard chevron blocks round the pad edge
  for (let k = 0; k < 6; k++) {
    const a1 = (k * Math.PI) / 3;
    const a2 = ((k + 1) * Math.PI) / 3;
    const x1 = 1.62 * Math.sin(a1);
    const z1 = 0.08 + 1.62 * Math.cos(a1);
    const x2 = 1.62 * Math.sin(a2);
    const z2 = 0.08 + 1.62 * Math.cos(a2);
    const len = Math.hypot(x2 - x1, z2 - z1);
    const yaw = Math.atan2(-(z2 - z1), x2 - x1) / D2R;
    for (let i = 0; i < 8; i++) {
      const t = 0.06 + (i + 0.5) * (0.88 / 8);
      P(box((len * 0.88) / 8, 0.014, 0.15), i % 2 ? "#1b2133" : ORANGE, stage, [x1 + (x2 - x1) * t, 0.056, z1 + (z2 - z1) * t], {
        rotation: [0, yaw, 0],
      });
    }
  }
>>>>>>> REPLACE