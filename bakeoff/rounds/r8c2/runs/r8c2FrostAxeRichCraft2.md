1. **Crescent silhouette:** the main blade was a squat fan. Its top and bottom tips are now long swept horns, with the lower one hooked like a Freljord bearded axe. This changes the silhouette most.
2. **Plate inlay:** the dark plate and gold trim are still built from the old, shorter outline (`PLATE_SRC`), so they stay inside the longer blade.
3. **Cutting edge:** the cyan edge glint now runs from horn tip to horn tip, so the whole crescent reads as frost-lit.
4. **Hook shard:** I added a frost crystal on the lower hook so the long tip doesn't read as a bare blade point.

<<<<<<< SEARCH
const MAIN: Pt[] = [
=======
const MAIN: Pt[] = [
  [0.03, 0.24],
  [0.18, 0.3],
  [0.34, 0.42],
  [0.54, 0.74, "sharp"],
  [0.47, 0.4],
  [0.56, 0.26],
  [0.63, 0.08],
  [0.65, -0.1],
  [0.6, -0.28],
  [0.5, -0.46],
  [0.36, -0.78, "sharp"],
  [0.32, -0.42],
  [0.2, -0.3],
  [0.03, -0.22],
];

const PLATE_SRC: Pt[] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.extrude(scaleOutline(MAIN, 0.72, 0.74, 0.03, 0), {
=======
  b.extrude(scaleOutline(PLATE_SRC, 0.72, 0.74, 0.03, 0), {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const plateOutline = scaleOutline(MAIN, 0.72, 0.74, 0.03, 0);
=======
  const plateOutline = scaleOutline(PLATE_SRC, 0.72, 0.74, 0.03, 0);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const edge = [
    [0.47, 0.4],
    [0.56, 0.26],
    [0.63, 0.08],
    [0.65, -0.1],
    [0.6, -0.28],
    [0.5, -0.46],
  ].map(([x, y]) => P3(x, y));
=======
  const edge = [
    [0.53, 0.7],
    [0.485, 0.5],
    [0.52, 0.34],
    [0.6, 0.18],
    [0.645, 0.0],
    [0.625, -0.2],
    [0.54, -0.4],
    [0.42, -0.64],
    [0.375, -0.75],
  ].map(([x, y]) => P3(x, y));
>>>>>>> REPLACE

<<<<<<< SEARCH
  bladeShard(1, 0.3, -0.385, 0.2, -1, 0.05, 0.16, 0.028, 3);
=======
  bladeShard(1, 0.3, -0.385, 0.2, -1, 0.05, 0.16, 0.028, 3);
  bladeShard(1, 0.36, -0.62, 0.15, -1, 0.1, 0.15, 0.02, 2);
>>>>>>> REPLACE