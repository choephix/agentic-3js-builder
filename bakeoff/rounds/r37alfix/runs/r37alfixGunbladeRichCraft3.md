Cause: TypeScript infers the optional third tuple element as `"sharp" | undefined`, but the SDK requires outline tuples to be either two-element points or exact three-element sharp tuples.

<<<<<<< SEARCH
  const bladeOutline: [number, number, "sharp"?][] = [
=======
  const bladeOutline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
  const guardOutline: [number, number, "sharp"?][] = [
=======
  const guardOutline: ([number, number] | [number, number, "sharp"])[] = [
>>>>>>> REPLACE