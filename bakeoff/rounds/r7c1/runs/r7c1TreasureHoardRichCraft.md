1. **Hoard height.** The front mound is as tall as the chest rim and buries the chest, crown and key motifs. I made it lower and pushed it forward so the chest reads as the hero. I also gave the plinth more height (floor 0.1 → 0.14), so the hoard sits on a visible slab. The chest-fill mound follows the floor height.
2. **Rocks.** The faceted boulders were far too big. They blocked the three-quarter and front views, and several hung over the edge of the hex base. I shrank them and moved them to the back and sides, inside the plinth.
3. **Crystals.** Both clusters sat on the base edge, so I moved them inward.
4. **Loose gold ring.** It was off the hex base (floating at the front corner). I put it back on the slab beside the mound.
5. **Toppled goblet.** It sank into the floor. I raised it to match the new floor height.

<<<<<<< SEARCH
const FLOOR = 0.1;
=======
const FLOOR = 0.14;
>>>>>>> REPLACE

<<<<<<< SEARCH
    { x: 0.02, z: 0.4, y0: FLOOR, rx: 0.62, rz: 0.42, h: 0.34 },
=======
    { x: 0.02, z: 0.5, y0: FLOOR, rx: 0.6, rz: 0.36, h: 0.25 },
>>>>>>> REPLACE

<<<<<<< SEARCH
    { x: 0, z: -0.35, y0: 0.4, rx: 0.34, rz: 0.21, h: 0.15, um: 0.82 },
=======
    { x: 0, z: -0.35, y0: FLOOR + 0.3, rx: 0.34, rz: 0.21, h: 0.15, um: 0.82 },
>>>>>>> REPLACE

<<<<<<< SEARCH
      [1.26, 0],
      [1.32, 0.025],
      [1.32, 0.075],
      [1.24, 0.1],
      [0, 0.1],
=======
      [1.26, 0],
      [1.32, 0.03],
      [1.32, 0.1],
      [1.24, 0.14],
      [0, 0.14],
>>>>>>> REPLACE

<<<<<<< SEARCH
      [1.0, 0.1],
      [1.1, 0.1],
      [1.1, 0.112],
      [1.0, 0.112],
=======
      [1.0, 0.14],
      [1.1, 0.14],
      [1.1, 0.152],
      [1.0, 0.152],
>>>>>>> REPLACE

<<<<<<< SEARCH
    [1.0, -0.62, 0.26, 0.28, 0.24, 20],
    [-1.0, -0.7, 0.3, 0.34, 0.26, 50],
    [0.05, -1.02, 0.55, 0.38, 0.2, 0],
    [0.55, -1.02, 0.28, 0.3, 0.22, 30],
    [-0.5, -1.0, 0.3, 0.32, 0.22, 70],
    [1.1, 0.2, 0.18, 0.2, 0.2, 10],
    [-1.1, 0.35, 0.2, 0.24, 0.18, 60],
=======
    [0.98, -0.52, 0.17, 0.17, 0.15, 20],
    [-0.98, -0.55, 0.2, 0.2, 0.17, 50],
    [0.05, -1.08, 0.4, 0.22, 0.14, 0],
    [0.38, -0.98, 0.16, 0.16, 0.13, 30],
    [-0.3, -1.0, 0.18, 0.17, 0.14, 70],
    [1.0, 0.3, 0.1, 0.1, 0.1, 10],
    [-1.0, 0.38, 0.11, 0.11, 0.1, 60],
>>>>>>> REPLACE

<<<<<<< SEARCH
  cluster(0.78, -0.84, ["#46e9ff", "#2f9cff", "#7cf3ff"], [
=======
  cluster(0.66, -0.8, ["#46e9ff", "#2f9cff", "#7cf3ff"], [
>>>>>>> REPLACE

<<<<<<< SEARCH
  cluster(-0.72, -0.9, ["#b45cff", "#8140f0", "#d98aff"], [
=======
  cluster(-0.62, -0.84, ["#b45cff", "#8140f0", "#d98aff"], [
>>>>>>> REPLACE

<<<<<<< SEARCH
  const foot2 = V(0.42, 0.18, 0.88);
=======
  const foot2 = V(0.42, 0.24, 0.84);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const [x, z, ry] of [[-0.3, 0.98, 20], [0.9, 0.9, 70]] as [number, number, number][]) {
=======
  for (const [x, z, ry] of [[-0.3, 0.98, 20], [0.6, 0.82, 70]] as [number, number, number][]) {
>>>>>>> REPLACE