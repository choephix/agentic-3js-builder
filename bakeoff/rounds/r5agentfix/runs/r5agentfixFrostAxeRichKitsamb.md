The last `b.cards` call passes `{}` as its options, so `options.size` is `undefined` and destructuring it throws. The frame was also a made-up object cast to `never`. I replaced it with a real `frame()` and gave the cards a size and `lean`/`flow`, with the tassel hanging from the cord end.

<<<<<<< SEARCH
  b.cards([{ at: [0.052, 0.4, 0.025], axis: [0, 1, 0] } as never], TASSEL, {} as never);
=======
  b.cards([frame([0.056, 0.425, 0.025], [0, 1, 0])], TASSEL, { size: [0.03, 0.09], lean: 180, flow: [0, 0, 1], bone: charm, cross: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
import { rng } from "../../../../src/math";
=======
import { rng } from "../../../../src/math";
import { frame } from "../../../../src/frame";
>>>>>>> REPLACE