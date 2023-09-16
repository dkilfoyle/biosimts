import _ from "lodash";

export class Grid {
  private data: number[];
  constructor(public width: number, public height: number) {
    this.data = _.fill(new Array(width * height), 0xffff);
  }
  reset() {
    this.data = _.fill(new Array(this.width * this.height), 0xffff);
  }
  checkCoords(x: number, y: number) {
    if (!_.inRange(x, 0, this.width)) return false;
    if (!_.inRange(y, 0, this.height)) return false;
    return true;
  }
  get(x: number, y: number) {
    if (!this.checkCoords(x, y)) throw Error(`Grid.get(${x},${y}) - invalid coord`);
    return this.data[x * this.width + y];
  }
  set(x: number, y: number, val: number) {
    if (!this.checkCoords(x, y)) throw Error(`Grid.set(${x},${y}) - invalid coord`);
    this.data[x * this.width + y] = val;
  }
  findEmptyPos() {
    let x, y;
    while (true) {
      x = _.random(0, this.width - 1);
      y = _.random(0, this.height - 1);
      if (this.get(x, y) == 0xffff) break;
    }
    return [x, y];
  }
}
