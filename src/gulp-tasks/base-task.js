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

  initMultimeterBars(resources) {
    let multi = this.multimeter;
    this.bar = {};
    resources.forEach((res, i)=> {
      let key = res.getKey();
      this.bar[key] = multi.rel(0, i + 1, {
        width: 8,
        solid: {background: null, foreground: 'white', text: '|'},
        empty: {background: null, foreground: null, text: ' '}
      });
      multi.charm.write("\n");
    });
  }

  updateBar(resKey, percent, message) {
    percent = (percent < 1) ? Math.round(percent * 100) : percent;
    this.bar[resKey].percent(percent, message);
    return this;
  }

  clearBar(resKey) {
    this.bar[resKey].percent(0, "");
  }

  getErrorMessage({key, errors = [], extendedFormat = false}) {
    let errorLength = errors.length;
    let separator = "\n\n---------------------------\n\n";
    let startSeparator = "\n\n---------- START ----------\n\n";
    let endSeparator = "\n\n----------- END -----------\n\n";
    let message = `- ${key} - Build has ${errorLength} errors`;

    if (!extendedFormat) {
      errors.forEach((error, index)=> {
        message += `${separator} Error in ${key} [${index + 1}/${errorLength}] ${startSeparator} ${error.message} ${endSeparator}`;
      });
    }

    return message;
  }

}
