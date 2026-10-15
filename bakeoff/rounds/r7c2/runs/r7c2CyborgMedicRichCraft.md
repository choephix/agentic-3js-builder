1. **Chest top and neck read as a ragged blob.** The cuirass and suit lofts overshoot the collar, so the neck looks buried and torn. I lower and narrow both loft ends, and make the collar taller with its gold ring raised, so a clear neck and collar show.
2. **Armour paint looks dirty.** The noise mottling and the ground-darkening bake grey smudges into the shins and boots. Overwatch armour should be clean white with soft cool shading, so I remove both and keep only a light gradient.
3. **Lower legs look like stilts under the heavy torso.** I thicken the shin and ankle radii so the legs carry the armour and boots.
4. **The backpack wings are flat triangles from the side.** I add a pale, thin back feather layer behind each wing, so they read as layered wings with a bigger silhouette.

<<<<<<< SEARCH
    c = mix(c, "#dbe9f7", smoothstep(0.6, 0.85, noise(p, 0.06, 4)) * 0.35);
    return mix(c, "#a9bbd0", smoothstep(0.25, 0.0, p.y - G) * 0.2);
=======
    c = mix(c, "#e4f1fb", smoothstep(0.6, 0.85, noise(p, 0.2, 4)) * 0.12);
    return mix(c, "#c3d3e6", smoothstep(0.1, 0.0, p.y - G) * 0.1);
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: V(0, 1.49, 0), w: 0.28, h: 0.19 },
    ],
    { bone: [hips, spine], color: SUIT } as never,
=======
      { at: V(0, 1.465, 0), w: 0.24, h: 0.17 },
    ],
    { bone: [hips, spine], color: SUIT } as never,
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: V(0, 1.48, 0.015), w: 0.34, h: 0.22 },
=======
      { at: V(0, 1.45, 0.012), w: 0.29, h: 0.2 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  P(new THREE.CylinderGeometry(0.068, 0.085, 0.05, 10), GUN, chest, V(0, 1.5, 0.005), { scale: [1, 1, 0.92] });
  torus(V(0, 1.527, 0.005), 0.07, 0.008, [0, 1, 0], GOLD, chest, 10);
=======
  P(new THREE.CylinderGeometry(0.072, 0.1, 0.075, 10), GUN, chest, V(0, 1.505, 0.005), { scale: [1, 1, 0.92] });
  torus(V(0, 1.545, 0.005), 0.074, 0.009, [0, 1, 0], GOLD, chest, 10);
>>>>>>> REPLACE

<<<<<<< SEARCH
      [0.85, 0.054],
      [1, 0.046],
=======
      [0.85, 0.062],
      [1, 0.056],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(wing(0.82, 14), {
=======
    b.extrude(wing(1.14, -12), {
      at: base.clone().add(new THREE.Vector3(0, 0.0, 0.012)),
      x: [s * 0.8, 0, -0.6],
      y: [0, 1, 0],
      thickness: 0.006,
      color: "#d9f7fb",
      bone: chest,
    } as never);
    b.extrude(wing(0.82, 14), {
>>>>>>> REPLACE