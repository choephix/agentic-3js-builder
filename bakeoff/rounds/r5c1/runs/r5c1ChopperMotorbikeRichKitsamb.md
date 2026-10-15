1. **Barrel moved off the left flank.** The hazard barrel stood in front of the exhaust and rear wheel and hid the bike in the left-side and three-quarter views. It now sits at the rear right, and its stripe paint centre is updated to match.
2. **Beacon pylon turned into a hologram sign.** The short cyan stub was just a post and added no Overwatch feel. The post is now taller and carries a glowing hex-lightning emblem on a navy hex backing, with a back face so it reads from both sides. That gives the garage pad a hero-shooter signage focal point.

<<<<<<< SEARCH
    const a = Math.atan2(p.z + 0.4, p.x - 0.58) / (Math.PI * 2);
=======
    const a = Math.atan2(p.z + 0.45, p.x + 0.62) / (Math.PI * 2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.46, 14), BARREL, { bone: chassis, at: v(0.58, 0.23, -0.4) });
  for (const y of [0.08, 0.38])
    b.part(new THREE.CylinderGeometry(0.157, 0.157, 0.016, 14), NAVY_D, { bone: chassis, at: v(0.58, y, -0.4) });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10), BLACK, { bone: chassis, at: v(0.58, 0.47, -0.4) });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), CHROME, { bone: chassis, at: v(0.62, 0.49, -0.36) });
=======
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.46, 14), BARREL, { bone: chassis, at: v(-0.62, 0.23, -0.45) });
  for (const y of [0.08, 0.38])
    b.part(new THREE.CylinderGeometry(0.157, 0.157, 0.016, 14), NAVY_D, { bone: chassis, at: v(-0.62, y, -0.45) });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10), BLACK, { bone: chassis, at: v(-0.62, 0.47, -0.45) });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), CHROME, { bone: chassis, at: v(-0.58, 0.49, -0.41) });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod(v(-0.62, 0.04, -1.0), v(-0.62, 0.7, -1.0), 0.022, NAVY, { bone: chassis });
=======
  b.rod(v(-0.62, 0.04, -1.0), v(-0.62, 1.0, -1.0), 0.022, NAVY, { bone: chassis });
  const signDir: V3 = norm([0.55, 0, 1]);
  const signAt = v(-0.62, 1.28, -1.0);
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 6), NAVY_D, { bone: chassis, at: off(signAt, signDir, -0.02), dir: signDir, flat: true });
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.5), WHITE, { bone: chassis, at: off(signAt, signDir, 0.0), dir: signDir, axis: "z", texture: T.EMBLEM }), 1.5);
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.5), WHITE, { bone: chassis, at: off(signAt, signDir, -0.04), dir: [-signDir[0], 0, -signDir[2]], axis: "z", texture: T.EMBLEM }), 1.5);
>>>>>>> REPLACE