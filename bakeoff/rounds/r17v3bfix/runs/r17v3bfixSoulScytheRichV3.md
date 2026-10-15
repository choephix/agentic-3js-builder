`BONE_L()` is called for the tooth and claw colours in four places, but the palette never defines it. Defining it next to the other bone tones fixes the error.

<<<<<<< SEARCH
const BONE_M = "#dccba2";
=======
const BONE_M = "#dccba2";
const BONE_L = () => "#fbf4de";
>>>>>>> REPLACE