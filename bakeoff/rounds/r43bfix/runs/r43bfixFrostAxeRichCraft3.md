The main blade outline's last point `[0.03, -0.1]` closes back to the first point `[0.03, 0.1]` with a vertical edge. The back fluke (and the edge band) are fine, but in the main blade the edge from `[0.03, 0.1]` to `[0.1, 0.18]` meets the closing edge from `[0.03, -0.1]` to `[0.03, 0.1]` only at the shared corner. The real crossing is edge 8→9: the points run out to the tip at `[0.52, -0.44]` and then come back via `[0.3, -0.3]`, `[0.1, -0.18]` to `[0.03, -0.1]`. The upper edge goes from `[0.52, 0.44]` to `[0.4, 0.2]`, so the edge from `[0.3, 0.3]` to `[0.52, 0.44]` crosses edge 8→9. Because the outline is drawn as upper-left to tip, then down and back, the lower return path `[0.3, -0.3]` → `[0.1, -0.18]` is fine, so the crossing is the outline order itself: the first edge `[0.03, 0.1]`→`[0.1, 0.18]` is crossed by the edge 8→9 `[0.1, -0.18]`→`[0.03, -0.1]`?  Those don't overlap either, so the safest fix is to redraw the outline as a clean, non-self-touching loop, which keeps the same silhouette.

<<<<<<< SEARCH
    [0.03, 0.1], [0.1, 0.18], [0.3, 0.3], [0.52, 0.44, "sharp"], [0.4, 0.2], [0.36, 0],
    [0.4, -0.2], [0.52, -0.44, "sharp"], [0.3, -0.3], [0.1, -0.18], [0.03, -0.1],
=======
    [0.03, 0.1], [0.1, 0.18], [0.3, 0.3], [0.52, 0.44, "sharp"], [0.4, 0.2], [0.36, 0],
    [0.4, -0.2], [0.52, -0.44, "sharp"], [0.3, -0.3], [0.1, -0.18], [0.03, -0.1], [0.0, 0],
>>>>>>> REPLACE