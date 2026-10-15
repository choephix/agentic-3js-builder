1. **Brows:** they rendered grey and read as dirty smudges next to the white beard. I switched them to the beard's warm white paint so they match the beard and frame the eyes.
2. **Eyes:** they are the focus of the face but small under the big hat and beard. I enlarged the decals about 20% so the gnome reads as alert and friendly from the front and three-quarter views.
3. **Steam puffs:** they read as grey rock chips. I rebuilt them from smoother, larger, subdivided spheres with a soft self-lit glow so they read as a soft vapour column, and added two more puffs to extend the plume.
4. **Backpack right side:** this face is empty in the three-quarter view apart from the telescope. I added a bracketed steel tin mug with a brass handle, so the pack looks more crammed with gadgets.
5. **Base:** the plinth rim is plain. I added a ring of brass studs round the top edge so it matches the tinkerer theme and gives the stage a finished border.

<<<<<<< SEARCH
      { bone: head, color: WHITE, sides: 6, smooth: false, caps: "point" },
=======
      { bone: head, color: BEARDP, sides: 6, smooth: false, caps: "point" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.decal(skull, EYE, { at: [s * 0.05, 0.775, hz(0.05, 0.775, 0.004)], dir: [0, 0, 1], size: [0.054, 0.054], segments: 8 });
=======
    b.decal(skull, EYE, { at: [s * 0.052, 0.772, hz(0.052, 0.772, 0.004)], dir: [0, 0, 1], size: [0.066, 0.066], segments: 8 });
>>>>>>> REPLACE

<<<<<<< SEARCH
  ].forEach(([x, y, z, r]) => mk(new THREE.IcosahedronGeometry(r, 0), "#f1f6f7", pack, [x, y, z], { flat: true }));
=======
  ]
    .concat([
      [0.19, 0.85, -0.19, 0.022],
      [0.21, 0.9, -0.17, 0.016],
    ])
    .forEach(([x, y, z, r]) =>
      glow(mk(new THREE.IcosahedronGeometry(r * 1.2, 1), "#f4f8f8", pack, [x, y, z], { scale: [1, 0.85, 1] }), 0.55),
    );
>>>>>>> REPLACE

<<<<<<< SEARCH
  // floating sparks and motes of tinkering magic
=======
  // tin mug on a bracket, right side of the pack
  mk(new THREE.BoxGeometry(0.05, 0.008, 0.05), BRASS, pack, [-0.168, 0.376, -0.16]);
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.032, 0.055],
      [0.027, 0.055],
      [0.026, 0.006],
      [0, 0.006],
    ],
    { at: [-0.18, 0.38, -0.16], segments: 8, color: STEEL, bone: pack, name: "mug" },
  );
  mk(new THREE.TorusGeometry(0.014, 0.004, 4, 8), BRASS, pack, [-0.21, 0.41, -0.16]);

  // brass studs round the plinth rim
  b.ring(frame([0, 0.012, 0], [0, 1, 0]), { count: 24, radius: 0.575 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.01, 5, 4), BRASS, it, { bone: hips, embed: 0.4 }),
  );

  // floating sparks and motes of tinkering magic
>>>>>>> REPLACE