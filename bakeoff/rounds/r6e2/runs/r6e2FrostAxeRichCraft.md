1. **Identity and form.** Three cues carry the brief: the crescent blade, the glowing ice inlay with its snowflake, and the ice-crystal spikes. All three are visible in the front and head views.
   - The crescent is too round: its horns are short, so it reads as a shield on a pole.
   - The haft is thin under a huge head, which is the wrong weight for League's chunky Freljord style.
   - Change: lengthen both blade horns into a bolder swept crescent and thicken the haft, grip, bands and fur collar. Rim glow, edge studs and horn crystals move with the new outline. Next render, front and three-quarter: the silhouette is wider at the horns and the haft carries the head with more weight.
2. **Soundness.**
   - The rune strips and langets were sized to the old thin haft. Once the haft thickens they would sink inside it, so I re-seat them on the new radius. Front and back: the glowing runes stay visible on the haft.
   - The gilt root plates read as muddy olive because the cool shading lowers their warmth. Change: use plain polished gilt. Head close-up: bright gold plates.
3. **Composition.**
   - The floor crystal clusters and rocks are bigger than the subject's footprint and cover the rune ring. The front-right cluster blocks the plinth in the three-quarter view.
   - Change: shrink and pull in the clusters and rocks so the axe is the largest element and the rune ring shows. Three-quarter and top views: a tighter base, with fewer loose parts far from the plinth.
4. **Finish.** The glow, rune ring and fur stay as they are. The brighter gilt and the longer glowing rim along the new horns add the extra finish.

## Edits

<<<<<<< SEARCH
const GILTM = shade(metal("gilt", { polish: 0.7, tarnish: 0.05 }));
=======
const GILTM = metal("gilt", { polish: 0.9, tarnish: 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    0.04,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
=======
    0.048,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0, 0.27, 0], [0, 0.6, 0], 0.05, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.25, 0.265, 0.605, 0.62, 0.66]) band(y, 0.056, 0.009, haft);
  band(0.84, 0.05, 0.009, haft);
=======
  b.rod([0, 0.27, 0], [0, 0.6, 0], 0.06, { color: WRAP, bone: haft, sides: 8, smooth: false, name: "grip" });
  for (const y of [0.25, 0.265, 0.605, 0.62, 0.66]) band(y, 0.068, 0.009, haft);
  band(0.84, 0.058, 0.009, haft);
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [Math.sin(a) * 0.052, 0.43, Math.cos(a) * 0.052],
=======
      at: [Math.sin(a) * 0.063, 0.43, Math.cos(a) * 0.063],
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [0, 0.75, sgn * 0.0415],
=======
        at: [0, 0.75, sgn * 0.0535],
>>>>>>> REPLACE

<<<<<<< SEARCH
  const fur1 = b.ring(frame([0, 0.88, 0], [0, 1, 0]), { count: 14, radius: 0.05 });
=======
  const fur1 = b.ring(frame([0, 0.88, 0], [0, 1, 0]), { count: 14, radius: 0.058 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const fur2 = b.ring(frame([0, 0.845, 0], [0, 1, 0]), { count: 10, radius: 0.052 });
=======
  const fur2 = b.ring(frame([0, 0.845, 0], [0, 1, 0]), { count: 10, radius: 0.06 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0.5, 0.54, 0.075],
=======
    [0.5, 0.54, 0.075],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [5, 0.54, 0.075],
    [95, 0.56, 0.06],
    [190, 0.6, 0.09],
    [280, 0.55, 0.07],
    [355, 0.6, 0.05],
=======
    [8, 0.5, 0.07],
    [95, 0.5, 0.055],
    [190, 0.52, 0.075],
    [280, 0.5, 0.065],
    [350, 0.52, 0.05],
>>>>>>> REPLACE

<<<<<<< SEARCH
  cluster(40, 0.5, 0.95);
  cluster(150, 0.54, 1.45);
  cluster(235, 0.5, 1.15);
  cluster(320, 0.5, 0.8);
=======
  cluster(40, 0.48, 0.65);
  cluster(150, 0.5, 1.05);
  cluster(235, 0.48, 0.9);
  cluster(320, 0.48, 0.7);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bladeOutline: Pt[] = [
    [0.03, 0.16],
    [0.18, 0.26],
    [0.3, 0.34, "sharp"],
    [0.4, 0.21],
    [0.445, 0.0],
    [0.4, -0.21],
    [0.32, -0.38, "sharp"],
    [0.2, -0.28],
    [0.03, -0.16],
  ];
=======
  const bladeOutline: Pt[] = [
    [0.03, 0.16],
    [0.17, 0.27],
    [0.32, 0.44, "sharp"],
    [0.4, 0.25],
    [0.455, 0.0],
    [0.41, -0.25],
    [0.34, -0.5, "sharp"],
    [0.2, -0.3],
    [0.03, -0.16],
  ];
>>>>>>> REPLACE

<<<<<<< SEARCH
      catmull([H(0.295, 0.33), H(0.395, 0.21), H(0.44, 0), H(0.395, -0.21), H(0.315, -0.37)]),
=======
      catmull([H(0.315, 0.43), H(0.4, 0.25), H(0.45, 0), H(0.405, -0.25), H(0.335, -0.49)]),
>>>>>>> REPLACE

<<<<<<< SEARCH
    const edgePath = polyline([H(0.3, 0.34), H(0.4, 0.21), H(0.445, 0), H(0.4, -0.21), H(0.32, -0.38)]);
=======
    const edgePath = polyline([H(0.32, 0.44), H(0.4, 0.25), H(0.455, 0), H(0.41, -0.25), H(0.34, -0.5)]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const topEdge = polyline([H(0.04, 0.17), H(0.18, 0.255), H(0.3, 0.335)]);
=======
  const topEdge = polyline([H(0.04, 0.17), H(0.17, 0.27), H(0.3, 0.425)]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  crystal(H(0.29, 0.32), [0.35, 1, 0], 0.27, 0.034, ICE[1], { bone: head, strength: 0.9 });
  crystal(H(0.31, -0.36), [0.35, -1, 0], 0.22, 0.03, ICE[0], { bone: head, strength: 0.9 });
  crystal(H(0.27, 0.3), [0.9, 1, 0.3], 0.1, 0.018, ICE[2], { bone: head });
  crystal(H(0.27, 0.3), [0.9, 1, -0.3], 0.1, 0.018, ICE[3], { bone: head });
=======
  crystal(H(0.31, 0.42), [0.3, 1, 0], 0.22, 0.032, ICE[1], { bone: head, strength: 0.9 });
  crystal(H(0.33, -0.48), [0.3, -1, 0], 0.2, 0.03, ICE[0], { bone: head, strength: 0.9 });
  crystal(H(0.28, 0.38), [0.9, 1, 0.3], 0.09, 0.016, ICE[2], { bone: head });
  crystal(H(0.28, 0.38), [0.9, 1, -0.3], 0.09, 0.016, ICE[3], { bone: head });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.rod([0, HY - 0.26, sgn * 0.036], [0, HY - 0.52, sgn * 0.036], [0.012, 0.007], {
=======
    b.rod([0, HY - 0.26, sgn * 0.058], [0, HY - 0.52, sgn * 0.058], [0.012, 0.007], {
>>>>>>> REPLACE