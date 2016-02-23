import Sintez from '../components/marmarosh';
import WrongSintezInstance from '../utils/exceptions/wrong-sintez-instance';
import GulpLogger from './gulp-logger';

export default class {
  constructor(gulp, sintez) {
    if (!(sintez instanceof Sintez)) {
      throw new WrongSintezInstance();
    }

    this.sintez = sintez;
    this.gulp = gulp;

    this.logger = new GulpLogger(this.name, 2);
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

  get logLevel() {
    return process.env.BUILDER_LOGGING || null;
  }

  get isProduction() {
    return process.env.NODE_ENV == "production";
  }

}
