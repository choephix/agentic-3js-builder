1. **Armour paint is too dirty for a medic.** The grey noise blotches and the foot darkening make the white armour and shins look grimy, and Overwatch armour is clean and bright. I replaced the paint with a clean white, cool-shaded version and a very light hem shadow.
2. **The right shin plate is blotchy steel.** I turned the tarnish off so the cybernetic leg reads as polished metal.
3. **The backpack wings are flat grey sheets.** The main plate now fades from white at the root to a pale glowing teal at the tip, which gives the wings an energy look and a bolder silhouette.
4. **The drone overlaps the cyborg elbow in the low view.** I moved it up and out to hover near the shoulder as a companion, so it reads as separate and fills the empty space beside the hero.
5. **The base is flat around the figure.** I added a ring of floating glowing healing crosses rising from the holo-pad, which supports the support-hero theme and adds sparkle at the hero's feet.

<<<<<<< SEARCH
  const ARMOR = paint((p, n) => {
    const up = smoothstep(-0.7, 0.9, n.y);
    let c = mix("#9fb4cc", "#f8fcff", up);
    c = mix(c, "#7f97b3", smoothstep(0.64, 0.82, noise(p, 0.05, 4)) * 0.4);
    return mix(c, "#6f7f90", smoothstep(0.5, 0.0, p.y - G) * 0.35);
  });
=======
  const ARMOR = paint((p, n) => {
    const up = smoothstep(-0.7, 0.9, n.y);
    let c = mix("#b9ccea", "#ffffff", up);
    c = mix(c, "#dbe9f7", smoothstep(0.6, 0.85, noise(p, 0.06, 4)) * 0.35);
    return mix(c, "#a9bbd0", smoothstep(0.25, 0.0, p.y - G) * 0.2);
  });
  const WINGP = paint((_p, _n, s) => mix("#ffffff", "#8ff6fb", smoothstep(0.08, 0.42, s[0])));
>>>>>>> REPLACE

<<<<<<< SEARCH
  const STEEL = metal("steel", { polish: 0.55 });
=======
  const STEEL = metal("steel", { polish: 0.55, tarnish: 0 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.extrude(wing(1, 0), {
      at: base,
      x: [s * 0.8, 0, -0.6],
      y: [0, 1, 0],
      thickness: 0.012,
      color: ARMOR,
=======
    b.extrude(wing(1, 0), {
      at: base,
      x: [s * 0.8, 0, -0.6],
      y: [0, 1, 0],
      thickness: 0.012,
      color: WINGP,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const D = V(-0.66, 1.2, 0.12);
=======
  const D = V(-0.72, 1.55, 0.2);
>>>>>>> REPLACE

<<<<<<< SEARCH
  return b.root;
=======
  // rising healing motes around the pad
  const motes = Array.from({ length: 12 }, (_, i) => {
    const a = i * 2.1 + 0.4;
    const r = 0.5 + 0.18 * ((i * 5) % 3);
    return frame(V(Math.sin(a) * r, 0.1 + ((i * 7) % 12) * 0.075, Math.cos(a) * r), [0, 1, 0]);
  });
  glow(
    b.cards(motes, PLUS, { size: 0.05, flow: [0, 0, 1], cross: true, vary: 0.4, rng: rand, bone: root } as never),
    1.4,
  );

  return b.root;
>>>>>>> REPLACE