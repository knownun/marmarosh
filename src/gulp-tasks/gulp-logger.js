import isArray from 'lodash/isArray';

import gutil from 'gulp-util';

var colorsMap = new Map();

colorsMap.set('magenta', gutil.colors.magenta);
colorsMap.set('cyan', gutil.colors.cyan);
colorsMap.set('blue', gutil.colors.blue);
colorsMap.set('yellow', gutil.colors.yellow);
colorsMap.set('green', gutil.colors.green);

var colors = colorsMap.values();

var getNextColoring = () => {
  var color = colors.next();
  if (color.done) {
    colors = colorsMap.values();
    color = colors.next();
  }
  return color.value;
};

var isEnabled = true;

export default class Log {
  constructor(task, color) {
    this.task = task;
    this.errorColoring = gutil.colors.red;

    if (color && colors.has(color)) {
      this.coloring = colors.get(color);
    } else {
      this.coloring = getNextColoring();
    }
  }

  log(message) {
    if (isEnabled) {
      var coloring = this.coloring;
      var completeMessage = message.replace(/((%)([^%]+)(%))/g, coloring('$3'));
      gutil.log(`${coloring(this.task)} ${completeMessage}`);
    }
  }

  error(message) {
    if (isEnabled) {
      var coloring = this.errorColoring;
      var completeMessage = coloring(message);
      if (!this.isProduction) {
        throw new Error(message)
      } else {
        gutil.log(`${coloring(this.task)} ${completeMessage}`);
      }
    }
  }

  updated(options) {
    var coloring = this.coloring;

    if (!isArray(options.src)) {
      options.src = [options.src];
    }

    for (var src of options.src) {
      var info = `${coloring(src)} -> ${coloring(options.dest)}`;
      this.log(`fired. ${info}`);
    }
  }

  static enable() {
    isEnabled = true;
  }

  static disable() {
    isEnabled = false;
  }

  get isProduction() {
    return process.env.NODE_ENV == "production";
  }
}
