1. **Fluke reads dead.** The rear fluke is almost black navy because the blade paint reads outline x, which is negative there. It now uses |x|, so the fluke gets the same icy edge as the main blade, and the blade body is a lighter steel-blue so the silhouette reads from every angle. The next render should show a frosted rear fluke and a more legible blade.
2. **Muddy fittings.** The bronze socket plates look like olive-brown leather patches. I switched the fitting metal to a brighter brass with more polish. The plates should read as gold metalwork against the blue steel.
3. **Weak haft.** The haft between head and grip is thin and near-black. I thickened it and lightened its palette so it reads as frost-blue wood rather than a void under the head.
4. **Setting.** Rocks floated 10–18 cm off the plinth, so I pulled them in to touch the base. The front-left crystal cluster hid the plinth, so I shrank it. The base should frame the axe more tightly and show its rune ring more clearly.

<<<<<<< SEARCH
    const x = s[0];
    const body: Rgb = mix("#233049", "#55699a", noise(p, 0.1, 2));
=======
    const x = Math.abs(s[0]);
    const body: Rgb = mix("#3a4c7a", "#7f98cc", noise(p, 0.1, 2));
>>>>>>> REPLACE

<<<<<<< SEARCH
const HAFT = shade(grain("#25304c", "#46598a", { size: 0.012, axis: "y" }));
=======
const HAFT = shade(grain("#3a4a78", "#7088c4", { size: 0.012, axis: "y" }));
>>>>>>> REPLACE

<<<<<<< SEARCH
const BRONZE = shade(metal("bronze", { polish: 0.35, tarnish: 0.25 }));
=======
const BRONZE = shade(metal("brass", { polish: 0.55, tarnish: 0.08 }));
>>>>>>> REPLACE

<<<<<<< SEARCH
    0.034,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
=======
    0.039,
    { bone: haft, color: HAFT, caps: "flat", sides: 8, smooth: false, name: "haftCore" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    [5, 0.54, 0.075],
    [95, 0.56, 0.06],
    [190, 0.6, 0.09],
    [280, 0.55, 0.07],
    [355, 0.6, 0.05],
=======
    [5, 0.46, 0.075],
    [95, 0.46, 0.06],
    [190, 0.49, 0.09],
    [280, 0.46, 0.07],
    [355, 0.47, 0.05],
>>>>>>> REPLACE

<<<<<<< SEARCH
  cluster(150, 0.54, 1.45);
=======
  cluster(150, 0.5, 1.1);
>>>>>>> REPLACE