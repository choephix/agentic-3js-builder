1. **Flank stars were edge-on.** The big star on each side panel was extruded in the front-facing plane, so it showed as a thin sliver from the side and as stray cyan flecks poking past the columns in the front view. I now orient it flat on the panel. It faces outward on both sides.
2. **The side panels were empty.** They are the largest unadorned surface in the three-quarter and low views. I added a glowing crescent moon and a scatter of small gold stars, oriented to read the right way round on each side. This matches the pediment motif and the anime night-sky look.
3. **The owl crowded the right pinnacle.** In the three-quarter view the pinnacle sat right in front of it. I moved the owl inward so its silhouette and hat read cleanly.

<<<<<<< SEARCH
  const star = (R: number, at: number[], color: string, str = 1.5) =>
    glow(
      b.extrude(starOutline(R, R * 0.45), {
        at: at as V, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color, bone: root,
      }),
      str,
    );
=======
  const star = (R: number, at: number[], color: string, str = 1.5, xd: V = [1, 0, 0]) =>
    glow(
      b.extrude(starOutline(R, R * 0.45), {
        at: at as V, x: xd, y: [0, 1, 0], thickness: 0.006, color, bone: root,
      }),
      str,
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
    star(0.1, [s * 0.7595, 1.05, 0], CYAN, 1.3);
=======
    star(0.1, [s * 0.7595, 1.05, 0], CYAN, 1.3, [0, 0, -s]);
    glow(
      b.extrude(crescent(0.085), {
        at: [s * 0.7585, 1.5, 0.02], x: [0, 0, -s], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: GOLD, bone: root,
      }),
      1.2,
    );
    for (const [y, z, R] of [[1.3, -0.09, 0.02], [0.8, 0.07, 0.024], [0.62, -0.06, 0.016], [1.25, 0.1, 0.014], [0.9, -0.1, 0.014]] as [number, number, number][])
      star(R, [s * 0.7595, y, z], "#fff1b0", 1.6, [0, 0, -s]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const ox = 0.65;
=======
    const ox = 0.6;
>>>>>>> REPLACE