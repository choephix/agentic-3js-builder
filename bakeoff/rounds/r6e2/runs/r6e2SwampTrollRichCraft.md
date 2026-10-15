**Art-director read**

- **Tusks:** two upturned tusks rise from the lower jaw with gold rings. They are visible in the front and head views, but thin next to the huge ears and the heavy body, so they are under-sized for a Warcraft troll.
- **Mohawk:** the flame-gradient crest reads well in profile and three-quarter. From the front and back it is a thin sliver, because the blades are only 3 to 8 cm thick, so it is under-sized as an identity cue.
- **Bone fetishes:** these are strong. The skull staff, crossed-bone back rack, skull necklace, pauldron spikes and belt skull all read. The necklace skulls are tiny, though.
- **Face:** both amber eyes are visible from the front. In the head close-up the eye is a small yellow chip under a heavy brow and the slit pupil is lost, so the glare has little character.
- **Soundness and composition:** no faults are reported. The loose-part list is only grass, mushrooms and stones on the base, which is fine. The back and top views are clean.

**Changes**

1. **Tusks, rebuilt as one longer, thicker feature.** The tusks get a wider base radius (0.055 to 0.072), a longer and higher curve that flares outward, and a matching resized gold ring. The next front and head renders will show tusks reaching nearly to eye level, clearly beyond the cheeks.
2. **Eyes.** Eyeball radius goes from 0.038 to 0.047, with a taller slit pupil moved forward to stay seated. The front and head renders will show larger, fiercer amber eyes with a readable pupil.
3. **Mohawk.** The blades are about 1.5 times thicker (to 0.13 m at the base, 0.05 at the tip) and 20% taller. The front and back views will show a broad flaming crest instead of a thin spike. The top view will show a wider red band.
4. **Necklace skulls.** The skull size goes from 0.75 to 1.0. The front and three-quarter views will show distinct fetish skulls on the chest cord.

## Edits

<<<<<<< SEARCH
      L(jaw, 0.2, -0.01, s * 0.1),
      L(jaw, 0.33, 0.08, s * 0.2),
      L(jaw, 0.36, 0.3, s * 0.15),
    );
    b.sweep(tuskPath, [0.055, 0], { bone: jaw, color: IVORY, sides: 7, caps: { start: "flat", end: "point" } });
=======
      L(jaw, 0.2, -0.01, s * 0.1),
      L(jaw, 0.36, 0.08, s * 0.23),
      L(jaw, 0.4, 0.38, s * 0.19),
    );
    b.sweep(tuskPath, [0.072, 0], { bone: jaw, color: IVORY, sides: 7, caps: { start: "flat", end: "point" } });
>>>>>>> REPLACE

<<<<<<< SEARCH
      torus(tuskPath.at(0.25), [tg.x, tg.y, tg.z], 0.055 * 0.75 + 0.008, 0.01, GOLD, jaw);
=======
      torus(tuskPath.at(0.25), [tg.x, tg.y, tg.z], 0.072 * 0.75 + 0.01, 0.012, GOLD, jaw);
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(put(geoS(0.038, 7, 5), AMBER, head, L(head, 0.222, 0.07, s * 0.07)), 1.4);
    put(geoB(0.01, 0.055, 0.006), "#2a1400", head, L(head, 0.258, 0.07, s * 0.07));
=======
    glow(put(geoS(0.047, 7, 5), AMBER, head, L(head, 0.222, 0.07, s * 0.07)), 1.4);
    put(geoB(0.012, 0.07, 0.006), "#2a1400", head, L(head, 0.267, 0.07, s * 0.07));
>>>>>>> REPLACE

<<<<<<< SEARCH
    const k = (0.8 + 0.5 * Math.sin(Math.PI * Math.min(t * 1.15, 1))) * (0.92 + 0.16 * R());
=======
    const k = (0.95 + 0.6 * Math.sin(Math.PI * Math.min(t * 1.15, 1))) * (0.92 + 0.16 * R());
>>>>>>> REPLACE

<<<<<<< SEARCH
      { at: root, x: [0, -nz, ny], y: [0, ny, nz], thickness: [0.085, 0.03], bevel: 0.006, color: HAIR, bone },
=======
      { at: root, x: [0, -nz, ny], y: [0, ny, nz], thickness: [0.13, 0.05], bevel: 0.008, color: HAIR, bone },
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (kind === 0) skull(chestJ, pos, 0.75);
=======
    if (kind === 0) skull(chestJ, pos, 1.0);
>>>>>>> REPLACE