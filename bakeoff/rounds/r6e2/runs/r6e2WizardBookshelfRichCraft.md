Identity cues, judged from the front render (there is no head close-up for this prop):
- **Moon and sun doors with a gilt cabinet:** visible and in proportion.
- **Crescent finial and pentagram crest:** visible and in proportion.
- **Glowing orbs, candles and tomes:** visible and in proportion.
- **Missing cue:** nothing says "wizard" at the silhouette level. The roof is a large plain brown slab that dominates the three-quarter and top views.

1. **Identity and form (front, three-quarter and top views).** Perch a tilted, bent-tipped wizard hat on the left roof slope. It has a gold band, a glowing star buckle and a glowing bobble at the tip, and it sits flat on the slope. The skyline gains a second pointed shape beside the crescent, and the roof stops being empty.
2. **Soundness (three-quarter and back views).** The hat is seated 1 cm into the roof, tilted to the slope angle, with a sphere filling the hinge between the cone and the bent tip. No loose parts are added, and the back view stays as clean as it is.
3. **Composition.** The shelf already fills the frame and the dais fits it, so I leave both unchanged. The hat sits at the left of the roof, clear of the pentagram crest and the crescent.
4. **Finish (top, three-quarter and front views).** Replace the noisy wood-grain roof with cel-shaded teal shingle scales and dark seams, in the same family as the teal urn. The gable face keeps its wood, so the pentagram crest still reads. The roof now carries colour and pattern, and the purple hat contrasts with it.

## Edits

<<<<<<< SEARCH
  b.extrude(crown as any, { at: [0, CTOP + 0.022, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.38, bevel: 0.01, color: woodH });
=======
  const shingles = cel(scales(["#2c7f8c", "#348f9a", "#276f7c"], "#143c48", { size: 0.07, width: 0.14 }), "#1a4a58");
  const roofP = paint((_p, n) => (Math.abs(n.z) > 0.5 ? woodH : shingles));
  b.extrude(crown as any, { at: [0, CTOP + 0.022, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.38, bevel: 0.01, color: roofP });
>>>>>>> REPLACE

<<<<<<< SEARCH
  // crescent finial
=======
  // wizard hat perched on the left roof slope
  {
    const hx = -0.5;
    const rf = 0.3 * Math.pow(1 - Math.abs(hx) / 0.78, 1.5);
    const slope = (0.3 * 1.5 * Math.sqrt(1 - Math.abs(hx) / 0.78)) / 0.78;
    const A = P(-slope, 1, 0).normalize();
    const base = P(hx, CTOP + 0.022 + 0.05 + rf - 0.01, 0);
    const ad = [A.x, A.y, A.z];
    const hatP = cel("#6a3fc8", "#3d2390");
    b.lathe(
      [[0, 0], [0.14, 0], [0.14, 0.01], [0.075, 0.024], [0.062, 0.07], [0.045, 0.14], [0, 0.14]],
      { at: [base.x, base.y, base.z], axis: ad, segments: 14, color: hatP },
    );
    const b2 = base.clone().addScaledVector(A, 0.14);
    const A2 = A.clone().multiplyScalar(Math.cos(0.55)).addScaledVector(P(0, 0, 1), Math.sin(0.55));
    ball(0.047, hatP, b2.x, b2.y, b2.z);
    b.lathe(
      [[0, 0], [0.047, 0], [0.036, 0.06], [0.02, 0.11], [0.008, 0.15], [0, 0.17]],
      { at: [b2.x, b2.y, b2.z], axis: [A2.x, A2.y, A2.z], segments: 12, color: hatP },
    );
    const b3 = b2.clone().addScaledVector(A2, 0.17);
    glow(ball(0.014, "#ffe27a", b3.x, b3.y, b3.z), 1.5);
    spark(b3.x + 0.03, b3.y + 0.05, b3.z, 0.06, "#ffe9a0");
    const bp = base.clone().addScaledVector(A, 0.05);
    b.part(new THREE.CylinderGeometry(0.071, 0.075, 0.024, 12), goldP, { at: [bp.x, bp.y, bp.z], dir: ad });
    star(bp.x, bp.y, bp.z + 0.08, 0.022, "#ffe27a", 0.01, 1.4);
  }

  // crescent finial
>>>>>>> REPLACE