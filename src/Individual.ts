import _ from "lodash";

const dirDeltaX = [0, 1, 1, 1, 0, -1, -1 - 1, 0];
const dirDeltaY = [1, 1, 0, -1, -1, -1, 0, 1, 0];

export class Individual {
  public genome: number;
  public x: number;
  public y: number;
  public dir: number;
  constructor(public id: number) {
    this.genome = Math.round(Math.random() * (2 ** 24 - 1));
    this.x = Math.round(Math.random() * 127);
    this.y = Math.round(Math.random() * 127);
    this.dir = Math.round(Math.random() * 8);
  }
  getColor() {
    return [this.genome >> 16, (this.genome >> 8) & 0b11111111, this.genome & 0b11111111];
  }
  update(others: Individual[]) {
    const newX = _.clamp(this.x + dirDeltaX[this.dir], 0, 127);
    const newY = _.clamp(this.y + dirDeltaY[this.dir], 0, 127);
    if (!others.find((i) => i.x == newX && i.y == newY)) {
      this.x = newX;
      this.y = newY;
    }
  }
}
