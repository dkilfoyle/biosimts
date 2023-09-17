import _ from "lodash";
import { Individual } from "./Individual";
import { Grid } from "./Grid";

const dirDeltaX = [0, 1, 1, 1, 0, -1, -1 - 1, 0];
const dirDeltaY = [1, 1, 0, -1, -1, -1, 0, 1, 0];

export interface ISimulationStatus {
  generation: number;
  population: number;
}

export interface ISimulationConfig {
  initialPopulationSize: number;
  lifetime: number;
  maxGenerations: number;
  animateGeneration: number;
  gridSize: number;
}

export const defaultSimulationConfig: ISimulationConfig = {
  initialPopulationSize: 100,
  lifetime: 130,
  maxGenerations: 500,
  animateGeneration: 20,
  gridSize: 128,
};

export class Peeps {
  individuals: Individual[] = [];
  generations = 0;
  time = 0;
  public grid!: Grid;

  constructor(public config: ISimulationConfig) {
    this.reset();
  }

  reset() {
    this.time = 0;
    this.generations = 0;
    this.grid = new Grid(this.config.gridSize, this.config.gridSize);
    this.individuals = _.range(0, this.config.initialPopulationSize).map((i) => {
      const pos = this.grid.findEmptyPos();
      this.grid.set(pos[0], pos[1], i + 1);
      return new Individual({
        id: i + 1,
        x: pos[0],
        y: pos[1],
        dir: _.random(0, 8),
        genome: _.random(2 ** 24 - 1),
      });
    });
  }

  stepTime() {
    // randomize order in which individuals are processed
    const randomizedIndividuals = _.shuffle(_.range(0, this.individuals.length));

    // move to next position if valid position and empty on grid
    randomizedIndividuals.forEach((id) => {
      const indiv = this.individuals[id];
      const newX = indiv.x + dirDeltaX[indiv.dir];
      const newY = indiv.y + dirDeltaY[indiv.dir];
      if (this.grid.checkCoords(newX, newY) && this.grid.get(newX, newY) == 0xffff) {
        // vacate old position
        this.grid.set(indiv.x, indiv.y, 0xffff);
        // move to new position
        indiv.addPosToTail();
        indiv.x = newX;
        indiv.y = newY;
        this.grid.set(indiv.x, indiv.y, indiv.id);
      }
    });

    if (this.time++ > this.config.lifetime) {
      this.time = 0;
      this.stepGeneration();
    }
  }

  stepGeneration() {
    // calculate survival score
    this.individuals.forEach((i) => (i.score = i.x));

    // identify and rank survivors
    const survivors = this.individuals.filter((i) => i.score > 0.8 * this.config.gridSize).sort((a, b) => b.score - a.score);

    this.grid.reset();

    if (survivors.length < 2) {
      // no breeding pairs left
      this.individuals = [];
      this.generations++;
      return;
    }

    // breed survivors with 2.0 birth rate
    const children = [];
    for (let childId = 0; childId < survivors.length; childId++) {
      const parent2Id = _.random(1, survivors.length - 1);
      const parent1Id = _.random(0, parent2Id);

      // TODO: child is mix of genomes
      // for now child is clone of the best parent
      const childPos = this.grid.findEmptyPos();
      children.push(
        new Individual({
          id: childId,
          x: childPos[0],
          y: childPos[1],
          dir: survivors[parent1Id].dir,
          genome: survivors[parent1Id].genome,
        })
      );
      this.grid.set(childPos[0], childPos[1], childId);
    }

    this.individuals = [...children];
    this.generations++;
  }

  getStatus() {
    return {
      population: this.individuals.length,
      generation: this.generations,
    };
  }
}
