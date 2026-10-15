1. **Eyes were tiny and the pupil slit was buried.** I enlarged the amber glow eyes and moved the slit forward so the face reads as menacing from the front view.
2. **Feet and shins looked like dark mud blocks.** I tightened the mud blend so it only dirties the ankles and toes, which lets the teal skin and claws read.
3. **The torso colour was flat.** I added a pale green belly and chest patch, the classic Darkspear look, to break up the teal mass.
4. **The hunched back silhouette was too clean.** I added a row of bone spikes along the hump, off the mohawk line, for a more brutal profile from the side and rear.

## Edits

<<<<<<< SEARCH
    c = mix(c, "#225457", 0.5 * smoothstep(0.62, 0.7, noise(p, 0.05, 8)));
=======
    c = mix(c, "#225457", 0.5 * smoothstep(0.62, 0.7, noise(p, 0.05, 8)));
    c = mix(c, "#b6e0a8", 0.4 * smoothstep(0.2, 0.7, n.z) * smoothstep(1.85, 1.35, p.y) * smoothstep(0.95, 1.3, p.y) * smoothstep(0.45, 0.25, Math.abs(p.x)));
>>>>>>> REPLACE

<<<<<<< SEARCH
    c = mix(c, MUD, 0.85 * smoothstep(G + 0.5, G + 0.15, p.y) * smoothstep(0.25, 0.55, noise(p, 0.08, 5) + 0.25));
=======
    c = mix(c, MUD, 0.8 * smoothstep(G + 0.28, G + 0.06, p.y) * smoothstep(0.25, 0.55, noise(p, 0.08, 5) + 0.25));
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(put(geoS(0.037, 7, 5), AMBER, head, L(head, 0.222, 0.07, s * 0.07)), 1.6);
    put(geoB(0.01, 0.055, 0.006), "#2a1400", head, L(head, 0.257, 0.07, s * 0.07));
=======
    glow(put(geoS(0.046, 7, 5), AMBER, head, L(head, 0.222, 0.07, s * 0.07)), 1.8);
    put(geoB(0.011, 0.07, 0.008), "#2a1400", head, L(head, 0.27, 0.07, s * 0.07));
>>>>>>> REPLACE

<<<<<<< SEARCH
  // ------------------------------------------------------------------ fetish staff
=======
  // bone spikes along the hump
  for (const h of b.surface(hump).scatter(7, { rng: rng(51), minDist: 0.14, filter: (q) => q.n.y > 0.35 && Math.abs(q.at.x) > 0.1 })) {
    b.stick(new THREE.ConeGeometry(0.035, 0.15, 6), BONE, h, { embed: 0.25 });
  }

  // ------------------------------------------------------------------ fetish staff
>>>>>>> REPLACE