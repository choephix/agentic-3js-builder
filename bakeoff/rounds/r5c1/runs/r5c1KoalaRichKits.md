1. **Body:** the torso was an 8-sided tube that read as a faceted grey rock. I switched it to a box section so it is a chunky blocky pear in the same pixel style as the head and limbs, and the cream belly paint will sit on flat faces.
2. **Eyes:** the eyes were 2×2 dots lost on the face. They are now 3×3 with a highlight, so the face has life.
3. **Gumnuts:** the small brown cubes under the foliage floated with no connection to anything. Each is now a bigger nut with a cap and a short stem rod back to the branch tip.

<<<<<<< SEARCH
    { section: { ngon: 8 }, color: BODY, caps: { start: "round", end: "round" } },
=======
    { section: "box", color: BODY, caps: { start: "round", end: "round" } },
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let dx = -1; dx <= 2; dx++) px(ex + dx, 7, FUR[0]);
    for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) px(ex + dx, 8 + dy, "#0d0c10");
    px(ex, 8, "#e9ecf2");
=======
    for (let dx = -1; dx <= 3; dx++) px(ex + dx, 7, FUR[0]);
    for (let dx = 0; dx < 3; dx++) for (let dy = 0; dy < 3; dy++) px(ex + dx, 8 + dy, "#0d0c10");
    px(ex, 8, "#f4f6fa");
    px(ex + 2, 10, "#4a4f66");
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (let k = 0; k < 2; k++)
      b.part(new THREE.BoxGeometry(0.025, 0.03, 0.025), "#7b6a48", {
        bone: root,
        at: [c[0] + (R() - 0.5) * 0.08, c[1] - 0.04 - R() * 0.03, c[2] + (R() - 0.5) * 0.08],
      });
=======
    for (let k = 0; k < 2; k++) {
      const nut = [c[0] + (R() - 0.5) * 0.08, c[1] - 0.05 - R() * 0.03, c[2] + (R() - 0.5) * 0.08];
      b.rod(c, nut, 0.006, "#5a4030", { bone: root });
      b.part(new THREE.BoxGeometry(0.03, 0.034, 0.03), "#7b6a48", { bone: root, at: nut });
      b.part(new THREE.BoxGeometry(0.036, 0.01, 0.036), "#4a3a28", {
        bone: root,
        at: [nut[0], nut[1] + 0.02, nut[2]],
      });
    }
>>>>>>> REPLACE