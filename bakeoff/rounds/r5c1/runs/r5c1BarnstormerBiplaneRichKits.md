1. **The engine cowl read as a lumpy brown cookie.** The riveted brass paint was muddy at this size. I swapped it for a clean polished-brass paint with a broad colour drift, so it reads as a shiny gold nose.
2. **The pilot's head was jammed into the upper wing, and its face was hidden.** The head sat at about 2.5 m against a wing underside at about 2.47 m. The helmet hemisphere also covered the whole face. I sank the pilot into the cockpit, shortened the helmet so the face shows, and gave him a blue flight jacket instead of leather-on-leather so he separates from the seat rim.
3. **The "mustachioed pilot" from the brief was missing.** I added a big curled handlebar moustache, which also gives the face a character read.

<<<<<<< SEARCH
const BRASS_COWL = panelled(metal("brass", { polish: 0.5 }), { size: 0.18, rivets: 0.04 });
=======
const BRASS_COWL = metal("brass", { polish: 0.7, tarnish: 0.05, size: 0.45 });
>>>>>>> REPLACE

<<<<<<< SEARCH
b.capsule([0, pTop - 0.05, pz], [0, pTop + 0.15, pz], 0.2, LEATHER, { bone: body, sides: 8 });
const hy = pTop + 0.45;
=======
b.capsule([0, pTop - 0.05, pz], [0, pTop + 0.15, pz], 0.2, "#3b6fb5", { bone: body, sides: 8 });
const hy = pTop + 0.32;
>>>>>>> REPLACE

<<<<<<< SEARCH
b.part(new THREE.SphereGeometry(0.205, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), LEATHER, {
=======
b.part(new THREE.SphereGeometry(0.205, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), LEATHER, {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.capsule([s * 0.2, pTop + 0.15, pz + 0.02], [s * 0.2, pTop + 0.1, pz + 0.3], 0.06, LEATHER, { bone: body, sides: 6 });
=======
    b.capsule([s * 0.2, pTop + 0.15, pz + 0.02], [s * 0.2, pTop + 0.1, pz + 0.3], 0.06, "#3b6fb5", { bone: body, sides: 6 });
    b.capsule([s * 0.02, hy - 0.085, pz + 0.2], [s * 0.15, hy - 0.1, pz + 0.15], 0.024, "#3a2418", { bone: body, sides: 5 });
    b.capsule([s * 0.15, hy - 0.1, pz + 0.15], [s * 0.2, hy - 0.04, pz + 0.1], 0.016, "#3a2418", { bone: body, sides: 5 });
>>>>>>> REPLACE