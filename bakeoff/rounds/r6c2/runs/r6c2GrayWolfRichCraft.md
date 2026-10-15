1. The back mane stood up like porcupine quills and dominated the silhouette. I swept the dorsal crest and its side shingles back along the spine so they read as wind-swept Frostwolf fur.
2. The neck ruff fired outward as black shards. I made the clumps lie closer to the neck, swept back, and a little wider so they read as fur.
3. The fur blades looked near-black. I raised the grey and cream root-to-tip ramps so the mane and ruff catch light and match the pale body coat.
4. The eyes are the signature of the style, so I pushed their glow to full strength. They now burn amber against the dark mask.

## Edits

<<<<<<< SEARCH
    tuft(h.moved([0, -0.025, 0]), V(0, 1, -0.5), V(1, 0, 0), L * 1.1, 0.13, maneGrey);
    for (const [s] of SIDES)
      tuft(h.moved({ left: s * 0.06, down: 0.035 }), V(s * 0.45, 0.4, -0.8), h.n, L * 0.8, 0.09, maneGrey);
=======
    tuft(h.moved([0, -0.025, 0]), V(0, 0.55, -1), V(1, 0, 0), L * 1.05, 0.14, maneGrey);
    for (const [s] of SIDES)
      tuft(h.moved({ left: s * 0.06, down: 0.035 }), V(s * 0.45, 0.12, -1), h.n, L * 0.85, 0.1, maneGrey);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const up = out.clone().multiplyScalar(0.55).addScaledVector(nkTan, -0.9);
=======
    const up = out.clone().multiplyScalar(0.3).addScaledVector(nkTan, -0.95);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const up = out.clone().multiplyScalar(0.5).addScaledVector(nk2Tan, -0.9);
=======
    const up = out.clone().multiplyScalar(0.28).addScaledVector(nk2Tan, -0.95);
>>>>>>> REPLACE

<<<<<<< SEARCH
    tuft(it, up, out, 0.2, 0.09, front ? maneCream : maneGrey);
=======
    tuft(it, up, out, 0.2, 0.11, front ? maneCream : maneGrey);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const t = smoothstep(0, 0.22, s[1]);
  const c = mix(mix(FUR_M, FUR_L, t), "#d6d8dc", smoothstep(0.6, 1, t));
=======
  const t = smoothstep(0, 0.18, s[1]);
  const c = mix(mix("#8c8f99", "#c8cacf", t), "#eceef2", smoothstep(0.6, 1, t));
>>>>>>> REPLACE

<<<<<<< SEARCH
  return shade(mix("#a39b86", "#f6f0de", t), n);
=======
  return shade(mix("#bdb59f", "#fffaf0", t), n);
>>>>>>> REPLACE

<<<<<<< SEARCH
      0.6,
    );
    b.rod(P(s * 0.03, 1.262, 0.965)
=======
      1.0,
    );
    b.rod(P(s * 0.03, 1.262, 0.965)
>>>>>>> REPLACE