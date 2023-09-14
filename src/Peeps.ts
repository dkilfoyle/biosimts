import { Individual } from "./Individual";

export class Peeps {
  individuals: Individual[] = [];
  constructor(public populationSize: number) {
    this.reset();
  }
  reset() {
    this.individuals = [...Array(this.populationSize)].map((i) => new Individual(i + 1));
  }
  update() {
    this.individuals.forEach((i) => i.update(this.individuals));
  }
}
