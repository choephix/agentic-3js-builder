import { catmull } from "../../../../src/path";

const tailTip = [0, 1, -2];
const rootPoint = [0, 1, 0];
const headEnd = [0, 1, 2];
const body = catmull([tailTip, ..., rootPoint, ..., headEnd]);
export default function build() {
  return body as never;
}
