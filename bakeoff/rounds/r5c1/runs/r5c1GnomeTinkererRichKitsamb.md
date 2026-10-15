1. The face read as a red mask. The wide pink band across the cheeks swallowed the eyes and nose, so I removed it from the skull paint and added two small round cheek blobs instead.
2. The nose was dark and small, lost under the moustache. I made it larger, brighter and a little further forward so it reads as a proper gnome nose.
3. The nose ended up with no highlight, so I added a small glint on top for charm.

<<<<<<< SEARCH
  const skullPaint = paint((p, n) => {
    if (n.z > 0.35 && Math.abs(p.x) > 0.045 && Math.abs(p.x) < 0.1 && p.y > 0.7 && p.y < 0.745) {
      return "#f4a08a";
    }
    return SKIN;
  });
=======
  const skullPaint = paint(() => SKIN);
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: [0, 0.725, 0.14], scale: [0.04, 0.037, 0.04], flat: true });
=======
  b.part(new THREE.SphereGeometry(1, 8, 6), "#f08a7c", { bone: head, at: [0, 0.728, 0.145], scale: [0.047, 0.042, 0.046], flat: true });
  b.part(new THREE.SphereGeometry(1, 5, 4), "#ffd6c8", { bone: head, at: [0.008, 0.742, 0.178], scale: [0.012, 0.008, 0.008] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 7, 5), "#f08f86", {
      bone: head,
      at: [s * 0.072, 0.712, 0.106],
      scale: [0.024, 0.017, 0.011],
      dir: [s * 0.5, 0, 1],
      axis: "z",
      flat: true,
    });
>>>>>>> REPLACE