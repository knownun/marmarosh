import Sintez from '../components/marmarosh';
import WrongSintezInstance from '../utils/exceptions/wrong-sintez-instance';
import GulpLogger from './gulp-logger';

import multimeter from "multimeter";
import process from "process";

let local = {
  multimeter: Symbol("multimeter")
};

export default class TaskBase {
  constructor(gulp, sintez) {
    if (!(sintez instanceof Sintez)) {
      throw new WrongSintezInstance();
    }

    this.sintez = sintez;
    this.gulp = gulp;

    var taskName = this.name;
    this.logger = new GulpLogger(taskName);
  }

  get resources() {
    return this.sintez.getResources();
  }

  get name() {
    throw new Error('@get name() method should be implemented');
  }

  run() {
    throw new Error('@run method should be implemented');
  }

  get multimeter() {
    if (!this[local.multimeter]) {
      this[local.multimeter] = multimeter(process);
    }
    return this[local.multimeter];
  }

  multimeterEnd() {
    if (this[local.multimeter]) this[local.multimeter].charm.end();
  }

}
