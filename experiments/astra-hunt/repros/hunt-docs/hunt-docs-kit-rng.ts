import * as kit from "../../../../kits/pixel";

// docs/api.md:79 suggests kit.rng(seed) as an alternative to src/math rng(seed).
const random = kit.rng(7);
console.log(random());
export default function build() {
  return null as never;
}
