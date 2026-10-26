Cause: the helper parameters use `ColorInput`, which also permits RGB tuples; these SDK overloads require `Fill` (`string | Paint`).

```text
<<<<<<< SEARCH
  color: ColorInput,
  name?: string,
  group = "galley",
) {
=======
  color: Fill,
  name?: string,
  group = "galley",
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
  name?: string,
  group = "galley",
) {
=======
  color: Fill,
  name?: string,
  group = "galley",
) {
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: ColorInput,
  name?: string,
  group = "pipes",
) {
=======
  color: Fill,
  name?: string,
  group = "pipes",
) {
>>>>>>> REPLACE
```