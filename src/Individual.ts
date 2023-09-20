import _ from "lodash";
import { Sensor } from "./Sensor";
import { Action } from "./Action";

const NEURON = 0;
const SENSOR = 1;
const ACTION = 1;
const maxNumberNeurons = 5;

interface IGene {
  sourceType: number; // 1 bit
  sourceNum: number; // 7 bits
  sinkType: number; // 1 bits
  sinkNum: number; // 7 bits
  weight: number; // 16 bits
}

export class Gene implements IGene {
  public sourceType!: number; // 1 bit
  public sourceNum!: number; // 7 bits
  public sinkType!: number; // 1 bits
  public sinkNum!: number; // 7 bits
  public weight!: number; // 16 bits
  constructor(gene?: IGene) {
    if (gene) {
      this.sourceType = gene.sourceType;
      this.sourceNum = gene.sourceNum;
      this.sinkType = gene.sinkType;
      this.sinkNum = gene.sinkNum;
      this.weight = gene.weight;
    } else this.randomize();
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

export class Synapse extends Gene {
  constructor(gene: Gene) {
    super(gene);
    if (this.sourceType == NEURON) this.sourceNum %= maxNumberNeurons;
    else this.sourceNum %= Sensor.NUM_SENSES;
    if (this.sinkType == NEURON) this.sinkNum %= maxNumberNeurons;
    else this.sinkNum %= Action.NUM_ACTIONS;
  }
}

export class Neuron {
  output = 0.5;
  constructor(public driven: boolean) {}
}

export class NeuralNet {
  synapses: Synapse[] = [];
  neurons: Neuron[] = [];
  constructor() {}
}

interface INeuronNode {
  remappedNumber: number;
  numOutputs: number;
  numSelfInputs: number;
  numInputsFromSensorsOrOtherNeurons: number;
}

export class Individual {
  public id: number;
  public x: number;
  public genome: Gene[];
  public neuralNet = new NeuralNet();
  public y: number;
  public dir: number;
  public score: number;
  public tail: number[][];

  constructor(params: { id: number; x: number; y: number; dir: number; genome?: number }) {
    this.id = params.id;
    this.x = params.x;
    this.y = params.y;
    this.dir = params.dir;
    this.genome = _.range(24).map((i) => new Gene());
    this.score = 0;
    this.tail = [];
  }
  getColor() {
    const c =
      (this.genome[0]!.sourceType & 0b1) |
      ((this.genome[23]!.sourceType & 0b1) << 1) |
      ((this.genome[0]!.sinkType & 0b1) << 2) |
      ((this.genome[23]!.sinkType & 0b1) << 3) |
      ((this.genome[0]!.sourceNum & 0b1111111) << 4) |
      ((this.genome[23]!.sourceNum & 0b1111111) << 10) |
      ((this.genome[0]!.sinkNum & 0b1111) << 16) |
      ((this.genome[23]!.sinkNum & 0b1111) << 20);

    return [c >> 16, (c >> 8) & 0b11111111, c & 0b11111111];
  }
  addPosToTail() {
    if (this.tail.length < 5) this.tail.push([this.x, this.y]);
    else this.tail = [...this.tail.slice(1), [this.x, this.y]];
  }

  createNeuralNetwork() {
    const genome = [
      // sensor2 to action4
      new Gene({ sourceType: 1, sourceNum: 2, sinkType: 1, sinkNum: 4, weight: 0 }),
      // sensor10 to neuron3
      new Gene({ sourceType: 1, sourceNum: 10, sinkType: 0, sinkNum: 3, weight: 0 }),
      // neuron3 to action1
      new Gene({ sourceType: 0, sourceNum: 3, sinkType: 1, sinkNum: 1, weight: 0 }),
      // blind neuron0 to neuron1 - should be culled
      new Gene({ sourceType: 0, sourceNum: 0, sinkType: 0, sinkNum: 1, weight: 0 }),
      // sensor16 to blind neuron2 - should be culled
      new Gene({ sourceType: 1, sourceNum: 16, sinkType: 0, sinkNum: 2, weight: 0 }),
      // neuron2 to self - should be culled
      new Gene({ sourceType: 0, sourceNum: 2, sinkType: 0, sinkNum: 2, weight: 0 }),
    ];

    // convert each gene to a synapse but recalculating the neuron id % maxNeurons
    // let synapses = this.genome.map((gene) => new Synapse(gene));
    let synapses = genome.map((gene) => new Synapse(gene));

    console.log("Synapses pre cull", synapses);

    // build a neuronNodeMap
    const nodeMap = new Map<number, INeuronNode>();
    synapses.forEach((synapse) => {
      if (synapse.sinkType == NEURON) {
        if (!nodeMap.has(synapse.sinkNum)) {
          // sinkNum not found in nodeMap so add blank INeuralNode
          nodeMap.set(synapse.sinkNum, { numInputsFromSensorsOrOtherNeurons: 0, numOutputs: 0, numSelfInputs: 0, remappedNumber: -1 });
        }
        const node = nodeMap.get(synapse.sinkNum);
        if (synapse.sourceType == NEURON && synapse.sourceNum == synapse.sinkNum) node!.numSelfInputs++;
        else node!.numInputsFromSensorsOrOtherNeurons++;
      }
      if (synapse.sourceType == NEURON) {
        if (!nodeMap.has(synapse.sourceNum)) {
          // sinkNum not found in nodeMap so add blank INeuralNode
          nodeMap.set(synapse.sourceNum, { numInputsFromSensorsOrOtherNeurons: 0, numOutputs: 0, numSelfInputs: 0, remappedNumber: -1 });
        }
        const node = nodeMap.get(synapse.sourceNum);
        node!.numOutputs++;
      }
    });

    console.log("NeuronNodeMap pre cull", new Map(nodeMap));

    // cullUselessNeurons
    // Find and remove neurons that don't feed anything or only feed themself.
    // This reiteratively removes all connections to the useless neurons.
    let allDone = false;
    while (!allDone) {
      allDone = true;
      Array.from(nodeMap.keys()).forEach((nodeKey) => {
        const node = nodeMap.get(nodeKey);
        if (node?.numOutputs == node?.numSelfInputs) {
          console.log("Node has 0 or only self outputs", nodeKey, node);
          allDone = false;
          // remove synapses on to this neuron
          synapses = synapses.filter((synapse) => {
            if (synapse.sinkType == NEURON && synapse.sinkNum == nodeKey) {
              if (synapse.sourceType == NEURON) {
                nodeMap.get(synapse.sourceNum)!.numOutputs--;
              }
              return false; // remove this synapse
            } else return true;
          });
          nodeMap.delete(nodeKey);
        }
      });
    }

    console.log("NeuronNodeMap post cull", nodeMap);
    console.log("Synapses post cull", synapses);

    // renumber remaining neurons from 0
    let newNumber = 0;
    for (const [key, value] of nodeMap) {
      value.remappedNumber = newNumber++;
    }

    // // build neural net synapses
    // this.neuralNet.synapses = [];

    // // first synapses from sensor or neuron to neuron
    // synapses
    //   .filter((synapse) => synapse.sinkType == NEURON)
    //   .forEach((synapse) => {
    //     this.neuralNet.synapses.push(synapse);
    //     synapse.sinkNum = nodeMap.get(synapse.sinkNum)!.remappedNumber;
    //     if (synapse.sourceType == NEURON) synapse.sourceNum = nodeMap.get(synapse.sourceNum)!.remappedNumber;
    //   });

    // // next synapses from sensor or neuron to action
    // synapses
    //   .filter((synapse) => synapse.sinkType == ACTION)
    //   .forEach((synapse) => {
    //     this.neuralNet.synapses.push(synapse);
    //     if (synapse.sourceType == NEURON) synapse.sourceNum = nodeMap.get(synapse.sourceNum)!.remappedNumber;
    //   });

    // // create neurons
    // this.neuralNet.neurons = [];
    // _.range(nodeMap.size).forEach((i) => {
    //   this.neuralNet.neurons.push(new Neuron(nodeMap.get(i)!.numInputsFromSensorsOrOtherNeurons != 0));
    // });
  }
}
