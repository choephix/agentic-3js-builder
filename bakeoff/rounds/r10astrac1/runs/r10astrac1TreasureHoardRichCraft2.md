1. **Repair the lid hardware.** The stays visibly stop in midair, and the medallion stands too far off the lining. Seat both against the actual curved lid.
2. **Replace the noisy wood finish.** Broader, quieter teal shading lets the gold silhouettes and heraldry read like hand-painted fantasy assets.
3. **Make the hoard genuinely abundant.** Overlapping coins should conceal the smooth gold mound underneath, with more readable stamped faces.
4. **Strengthen the chest’s heroic design.** Add angular corner armor, framed lid lining, and a dimensional emerald centerpiece.
5. **Fix the presentation plaque.** Move it onto the upper stone surface instead of leaving its lower half buried behind the stage edge.

<<<<<<< SEARCH
  const chestWood = grain("#123a49", "#23606a", {
    size: 0.045,
    axis: "x",
    seed: 9,
  });
=======
  const chestWood = paint((p, n) => {
    const broad = noise(p, 0.36, 9);
    const upper = Math.max(0, Math.min(1, (p.y - 0.32) / 1.7));
    const base = mix("#113b49", "#28616b", broad * 0.38 + upper * 0.24);
    return mix(base, "#43818a", Math.max(0, n.y) * 0.2);
  });
>>>>>>> REPLACE

<<<<<<< SEARCH
  const crestAt = lp(0, 0.135, 0.56);
=======
  const crestAt = lp(0, lidArch(0.56 / lidLength) - 0.067, 0.56);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Lid stays: angular bronze straps, attached at both ends.
  for (const s of [-1, 1]) {
    const tip = lp(s * 0.62, -0.045, 0.64);
    const a = [s * 0.63, 0.93, -0.05];
    const elbow = [s * 0.63, 1.12, -0.2];
    line(a, elbow, 0.018, C.darkGold, "lid stay lower");
    line(elbow, tip.toArray(), 0.018, gold, "lid stay upper");
    ball(elbow, 0.031, brightGold, "lid stay pivot");
  }
=======
  // Raised centerpiece, seated on the medallion rather than floating before it.
  b.part(gemGeometry(0.068, 0.058, 4), jewelPaints[2], {
    at: crestAt.clone().addScaledVector(crestDir, 0.046),
    dir: crestDir,
    up: crestUp,
    scale: [0.82, 1, 1.6],
    name: "heraldic emerald relief",
    flat: true,
  });

  // Follow the barrel profile with a narrow inner gold frame.
  for (const s of [-1, 1]) {
    const path: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = 0.065 + i * 0.087;
      path.push(lp(s * 0.575, lidArch(t) - 0.063, t * lidLength));
    }
    b.sweep(path, 0.011, {
      color: gold,
      sides: 4,
      caps: "flat",
      name: "inner lid engraved border",
    });
  }
  for (const t of [0.065, 0.935]) {
    b.rod(
      lp(-0.575, lidArch(t) - 0.063, t * lidLength),
      lp(0.575, lidArch(t) - 0.063, t * lidLength),
      0.011,
      { color: gold, sides: 4, name: "inner lid cross border" },
    );
  }

  // Lid stays terminate at real mounting bosses on the curved inner shell.
  for (const s of [-1, 1]) {
    const tip = lp(s * 0.62, lidArch(0.64 / lidLength) - 0.065, 0.64);
    const a = [s * 0.63, 0.93, -0.05];
    const elbow = [s * 0.63, 1.12, -0.2];
    line(a, elbow, 0.018, C.darkGold, "lid stay lower");
    line(elbow, tip.toArray(), 0.018, gold, "lid stay upper");
    ball(elbow, 0.031, brightGold, "lid stay pivot");
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.035, 8), gold, {
      at: tip,
      dir: crestDir,
      name: "lid stay mounting boss",
    });
    ball(a, 0.028, C.goldLight, "lower stay anchor");
  }
>>>>>>> REPLACE

<<<<<<< SEARCH
  drawing(panelTexture, [-0.335, 0.669, frontZ + 0.058],
=======
  // Forged corner wings break up the box silhouette with a repeated spear motif.
  for (const s of [-1, 1]) {
    for (const top of [false, true]) {
      const y = top ? 0.953 : 0.379;
      const vertical = top ? -1 : 1;
      b.extrude(
        [
          [0, 0],
          [0.27, 0],
          [0.235, 0.065],
          [0.128, 0.078],
          [0.075, 0.19],
          [0, 0.24],
        ],
        {
          at: [s * 0.72, y, 0.418],
          x: [-s, 0, 0],
          y: [0, vertical, 0],
          thickness: 0.036,
          bevel: 0.006,
          color: gold,
          name: "front angular corner armor",
        },
      );
      line(
        [s * 0.687, y + vertical * 0.027, 0.44],
        [s * 0.505, y + vertical * 0.027, 0.44],
        0.008,
        C.goldLight,
        "armor inset glint",
      );
      b.extrude(
        [
          [0, 0],
          [0.22, 0],
          [0.185, 0.06],
          [0.1, 0.077],
          [0.058, 0.17],
          [0, 0.21],
        ],
        {
          at: [s * 0.774, y, 0.34],
          x: [0, 0, -1],
          y: [0, vertical, 0],
          thickness: 0.032,
          bevel: 0.005,
          color: gold,
          name: "side angular corner armor",
        },
      );
    }
  }

  drawing(panelTexture, [-0.335, 0.669, frontZ + 0.058],
>>>>>>> REPLACE

<<<<<<< SEARCH
      minDist: minRadius * 1.3,
=======
      minDist: minRadius * 0.72,
>>>>>>> REPLACE

<<<<<<< SEARCH
      if (i % 6 === 0) {
=======
      if (i % 3 === 0) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  mound([0, 0.845, -0.2], [0.615, 0.2, 0.425],
    55, "gold-filled chest", 0.053);
  mound([0.05, 0.205, 0.63], [0.49, 0.105, 0.35],
    36, "spilled coin mound", 0.05);
  mound([-0.86, 0.203, -0.09], [0.255, 0.075, 0.31],
    19, "side coin spill", 0.046);
=======
  mound([0, 0.845, -0.2], [0.615, 0.2, 0.425],
    158, "gold-filled chest", 0.055);
  mound([0.05, 0.205, 0.63], [0.49, 0.105, 0.35],
    105, "spilled coin mound", 0.052);
  mound([-0.86, 0.203, -0.09], [0.255, 0.075, 0.31],
    47, "side coin spill", 0.048);
>>>>>>> REPLACE

<<<<<<< SEARCH
  // Low museum-like nameplate, clear of the actual treasure silhouette.
  box([0, 0.105, 1.255], [0.86, 0.135, 0.035],
    C.darkGold, "vault nameplate backing");
  drawing(plaqueTexture, [0, 0.107, 1.275],
    [0.81, 0.116], "sovereign ransom nameplate");
=======
  // A small lectern-like plaque rests ON the stone; its entire face is readable.
  const plaqueAt = new THREE.Vector3(0, 0.224, 1.135);
  const plaqueQ = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    -Math.PI / 3,
  );
  b.part(new THREE.BoxGeometry(0.81, 0.16, 0.045), C.darkGold, {
    at: plaqueAt,
    quat: plaqueQ,
    name: "vault nameplate backing",
  });
  const plaqueNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(plaqueQ);
  b.part(new THREE.PlaneGeometry(0.775, 0.145), "#ffffff", {
    at: plaqueAt.clone().addScaledVector(plaqueNormal, 0.0235),
    quat: plaqueQ,
    texture: plaqueTexture,
    name: "sovereign ransom nameplate",
  });
  for (const s of [-1, 1]) {
    box([s * 0.3, 0.195, 1.115], [0.045, 0.038, 0.09],
      C.darkGold, "nameplate support");
  }
>>>>>>> REPLACE