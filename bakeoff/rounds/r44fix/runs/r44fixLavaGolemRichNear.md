`glow()` throws on painted parts, and the molten seams, belt and arm/leg veins use the `MOLTEN` paint as their colour. A flat colour fixes it. The torso `ROCK` paint is never wrapped in `glow`, so it is fine.

<<<<<<< SEARCH
const MOLTEN = paint((p) => mix(RED, LAVA_H, smoothstep(0.3, 0.8, noise(p, 0.08, 2))));
=======
const MOLTEN = "#ffa028";
>>>>>>> REPLACE

`mix`, `noise` and `smoothstep` are still used by `ROCK`, so no imports become unused.