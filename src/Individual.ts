import _ from "lodash";

export class Gene {
  public sourceType!: number; // 1 bit
  public sourceNum!: number; // 7 bits
  public sinkType!: number; // 1 bits
  public sinkNum!: number; // 7 bits
  public weight!: number; // 16 bits
  constructor() {
    this.randomize();
  }
  randomize() {
    this.sourceType = _.random(1);
    this.sourceNum = _.random(127);
    this.sinkType = _.random(1);
    this.sinkNum = _.random(127);
    this.weight = _.random(-0x8000, 0x8000);
  }
  getWeightAsFloat() {
    return this.weight / 8192.0;
  }
  asNumber() {
    return ((this.sourceType & 0b1) << 31) | (this.sourceNum << 24) | ((this.sinkType & 0b1) << 23) | (this.sinkNum << 16) | this.weight;
  }
}

export class Individual {
  public id: number;
  public x: number;
  public genome: Gene[];
  public y: number;
  public dir: number;
  public score: number;
  public tail: number[][];

  constructor(params: { id: number; x: number; y: number; dir: number; genome?: number }) {
    this.id = params.id;
    this.x = params.x;
    this.y = params.y;
    this.dir = params.dir;
    this.genome = _.range(24).map(i => new Gene());
    this.score = 0;
    this.tail = [];
  }
  getColor() {
uint8_t makeGeneticColor(const Genome &genome)
{
    return ((genome.size() & 1)
         | ((genome.front().sourceType)    << 1)
         | ((genome.back().sourceType)     << 2)
         | ((genome.front().sinkType)      << 3)
         | ((genome.back().sinkType)       << 4)
         | ((genome.front().sourceNum & 1) << 5)
         | ((genome.front().sinkNum & 1)   << 6)
         | ((genome.back().sourceNum & 1)  << 7));
}



    return [this.genome >> 16, (this.genome >> 8) & 0b11111111, this.genome & 0b11111111];
  }
  addPosToTail() {
    if (this.tail.length < 5) this.tail.push([this.x, this.y]);
    else this.tail = [...this.tail.slice(1), [this.x, this.y]];
  }
}
