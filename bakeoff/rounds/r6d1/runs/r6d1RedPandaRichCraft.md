1. **Scarf ribbons.** They shoot up from the collar knot like antennae, which breaks the silhouette in every view. I'm making them flutter back across the shoulders and ending them in small gold tips that point backward. The next render should show a scarf that flows over the back.
2. **Tail.** It rises about 1.2 m and dominates the front and back views, hiding the head's silhouette. I'm sweeping it further back with a gentler arch so the head and body read. The front view should have a clear head, and the side view a graceful trailing tail.
3. **Cheek ruffs.** They stick out sideways as pale shards. I'm laying them back along the cheek, wider and shorter, so they read as fluffy cheek fur. I'm also enlarging the skull slightly for a more characterful, cuter head.
4. **Leg and belly colour.** The cel shadow turns them nearly black. I'm lifting them to a warm dark brown so the legs and paws show their form.

<<<<<<< SEARCH
  dark: "#4a2a3c",
=======
  dark: "#6a3a38",
>>>>>>> REPLACE

<<<<<<< SEARCH
const DARK_P = cel(C.dark);
=======
const DARK_P = cel(C.dark, "#47252f");
>>>>>>> REPLACE

<<<<<<< SEARCH
    [0, 0.64, -0.45],
    [0, 0.72, -0.62],
    [0, 0.89, -0.7],
    [0, 1.06, -0.66],
    [0, 1.16, -0.55],
=======
    [0, 0.65, -0.43],
    [0, 0.7, -0.6],
    [0, 0.8, -0.72],
    [0, 0.93, -0.78],
    [0, 1.03, -0.74],
>>>>>>> REPLACE

<<<<<<< SEARCH
  ), { bone: head, at: HC, scale: [0.115, 0.095, 0.1] });
=======
  ), { bone: head, at: HC, scale: [0.125, 0.103, 0.108] });
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: H(s * 0.088, -0.015, 0.02), dir: [s, 0.12, 0.12], L: 0.085 },
      { at: H(s * 0.082, -0.045, 0.0), dir: [s, -0.2, -0.18], L: 0.09 },
      { at: H(s * 0.07, -0.07, 0.0), dir: [s, -0.5, -0.3], L: 0.075 },
    ];
    for (const sp of specs) blade(leafOutline(sp.L, 0.03), sp.at, sp.dir, [0, 1, 0], 0.014, CREAM_P, head);
=======
      { at: H(s * 0.095, -0.01, 0.03), dir: [s * 0.45, 0.05, -1], L: 0.075 },
      { at: H(s * 0.09, -0.04, 0.02), dir: [s * 0.45, -0.25, -1], L: 0.08 },
      { at: H(s * 0.078, -0.068, 0.02), dir: [s * 0.4, -0.5, -1], L: 0.065 },
    ];
    for (const sp of specs) blade(leafOutline(sp.L, 0.04), sp.at, sp.dir, [0, 1, 0], 0.016, CREAM_P, head);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const rib = bezier(kp(0, 0, 0), kp(s * 0.05, 0.06, -0.04), kp(s * 0.11, 0.13, -0.14), kp(s * 0.16, 0.12, -0.3));
=======
    const rib = bezier(kp(0, 0, 0), kp(s * 0.04, 0.04, -0.06), kp(s * 0.09, 0.03, -0.17), kp(s * 0.13, -0.005, -0.3));
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(T(new THREE.Vector3().copy(end as any)), [0, -1, 0], 0.06, 0.016, { color: C.gold, bone: chest });
=======
    b.spike(T(new THREE.Vector3().copy(end as any)), [s * 0.2, -0.3, -1], 0.05, 0.014, { color: C.gold, bone: chest });
>>>>>>> REPLACE