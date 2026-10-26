Cause: `neck.tip` is null because the chain has no tip joint, `ColorInput` is broader than the SDK’s `Fill`, sharp outline tuples are typed too narrowly, and `flat` is not a valid extrude option.

<<<<<<< SEARCH
  type Builder,
  type ColorInput,
=======
  type Builder,
  type ColorInput,
  type Fill,
  type OutlinePoint,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const head = b.joint("head", {
    parent: neck.tip!,
    at: neck.tip!.at,
=======
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neck.joints[neck.joints.length - 1].at,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
  at: THREE.Vector3 | [number, number, number],
=======
  color: Fill,
  at: THREE.Vector3 | [number, number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
  at: THREE.Vector3 | [number, number, number],
=======
  color: Fill,
  at: THREE.Vector3 | [number, number, number],
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
  at: THREE.Vector3,
=======
  color: Fill,
  at: THREE.Vector3,
>>>>>>> REPLACE

<<<<<<< SEARCH
  const quatrefoil = (sx: number, sy: number): [number, number][] => [
=======
  const quatrefoil = (sx: number, sy: number): OutlinePoint[] => [
>>>>>>> REPLACE

<<<<<<< SEARCH
  ] as [number, number][];
=======
  ] as OutlinePoint[];
>>>>>>> REPLACE

<<<<<<< SEARCH
  const slitOutline: [number, number][] = [
=======
  const slitOutline: OutlinePoint[] = [
>>>>>>> REPLACE

<<<<<<< SEARCH
    flat: true,
    name: "s22MouthRecess",
=======
    name: "s22MouthRecess",
>>>>>>> REPLACE