import process from "process";

import gutil from "gulp-util";
import isArray from "lodash/isArray";
import throttle from "lodash/throttle";

let colorsMap = new Map();

colorsMap.set("magenta", gutil.colors.magenta);
colorsMap.set("cyan", gutil.colors.cyan);
colorsMap.set("blue", gutil.colors.blue);
colorsMap.set("yellow", gutil.colors.yellow);
colorsMap.set("green", gutil.colors.green);

let colors = colorsMap.values();

let local = {
  throttled: Symbol("throttle")
};

let getNextColoring = () => {
  let color = colors.next();
  if (color.done) {
    colors = colorsMap.values();
    color = colors.next();
  }
  return color.value;
};

export default class {
  constructor(taskName, logLevel = 2, color) {
    this.task = taskName;
    this.errorColoring = gutil.colors.red;
    this.isErrorsOn = logLevel >= 0;
    this.isLogsOn = logLevel > 0;
    this.isProcessOn = logLevel > 1;
    if (color && colors.has(color)) {
      this.coloring = colors.get(color);
    } else {
      this.coloring = getNextColoring();
    }
  }

  log(message) {
    if (this.isLogsOn) {
      let coloring = this.coloring;
      let completeMessage = message.replace(/((%)([^%]+)(%))/g, coloring("$3"));
      gutil.log(`${coloring(this.task)} ${completeMessage}`);
    }
    return this;
  }

  error(message) {
    if (this.isErrorsOn) {
      let coloring = this.errorColoring;
      let completeMessage = coloring(message);
      if (!this.isProduction) {
        throw new Error(message)
      } else {
        gutil.log(`${coloring(this.task)} ${completeMessage}`);
      }
    }
    return this;
  }

  updated(options) {
    let coloring = this.coloring;

    if (!isArray(options.src)) {
      options.src = [options.src];
    }

    for (let src of options.src) {
      let info = `${coloring(src)} -> ${coloring(options.dest)}`;
      this.log(`fired. ${info}`);
    }
  }

  logProcess(message, wait = 300) {
    if (this.isProcessOn) {
      if (!this[local.throttled]) {
        this[local.throttled] = throttle(this.log, wait, {
          leading: 1, trailing: 0
        });
      }
      this[local.throttled](message);
    }
    return this;
  }

  get isProduction() {
    return process.env.NODE_ENV == "production";
  }
}
