import _ from "lodash";

export class Individual {
  public id: number;
  public x: number;
  public genome: number;
  public y: number;
  public dir: number;
  public score: number;

  constructor(params: { id: number; x: number; y: number; dir: number; genome?: number }) {
    this.id = params.id;
    this.x = params.x;
    this.y = params.y;
    this.dir = params.dir;
    this.genome = params.genome || _.random(2 ** 24 - 1);
    this.score = 0;
  }
  getColor() {
    return [this.genome >> 16, (this.genome >> 8) & 0b11111111, this.genome & 0b11111111];
  }
}
