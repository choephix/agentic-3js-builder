Cause: nullable chain tips were passed as joint references (with `neck.tip` actually null because its names list has no tip joint), and several flat string colours were supplied where the SDK overload requires `Paint`.

```ts
<<<<<<< SEARCH
    parent: neck.tip!,
=======
    parent: neck.joints[neck.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armL.tip!,
=======
      bone: armL.tip ?? armL.joints[armL.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: armR.tip!,
=======
      bone: armR.tip ?? armR.joints[armR.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armL.tip,
=======
    bone: armL.tip ?? armL.joints[armL.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: armR.tip,
=======
    bone: armR.tip ?? armR.joints[armR.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: legL.tip,
=======
    bone: legL.tip ?? legL.joints[legL.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: legR.tip,
=======
    bone: legR.tip ?? legR.joints[legR.joints.length - 1],
>>>>>>> REPLACE

<<<<<<< SEARCH
const HAIR = "#241718";
=======
const HAIR = cel("#241718");
>>>>>>> REPLACE

<<<<<<< SEARCH
const BEARD_DARK = "#301b1a";
=======
const BEARD_DARK = cel("#301b1a");
>>>>>>> REPLACE

<<<<<<< SEARCH
const NOSE = "#562c27";
=======
const NOSE = cel("#562c27");
>>>>>>> REPLACE

<<<<<<< SEARCH
const MOUTH = "#160e13";
=======
const MOUTH = cel("#160e13");
>>>>>>> REPLACE

<<<<<<< SEARCH
const HOT = "#ff6a28";
=======
const HOT = cel("#ff6a28");
>>>>>>> REPLACE

<<<<<<< SEARCH
const HOT_YELLOW = "#ffd05a";
=======
const HOT_YELLOW = cel("#ffd05a");
>>>>>>> REPLACE

<<<<<<< SEARCH
const COAL = "#241416";
=======
const COAL = cel("#241416");
>>>>>>> REPLACE

<<<<<<< SEARCH
const WOOD = "#6f4127";
=======
const WOOD = cel("#6f4127");
>>>>>>> REPLACE

<<<<<<< SEARCH
const CLOTH_EDGE = "#b7c7c0";
=======
const CLOTH_EDGE = cel("#b7c7c0");
>>>>>>> REPLACE
```