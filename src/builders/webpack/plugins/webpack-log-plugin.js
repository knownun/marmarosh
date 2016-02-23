import Chunk from 'webpack/lib/Chunk';
import process from "process";

let local = {
  counter: Symbol('counter'),
  lastBuildFailed: Symbol('last-fbuild-failed')
};

export default class WebpackLogPlugin {
  constructor(emit, options) {
    this.emit = emit;
    this.key = options.key;
    this.extendedFormat = options.extendedFormat || null;
    this[local.counter] = 1;
    this[local.lastBuildFailed] = false;
    return this;
  }

  apply(compiler) {

    compiler.plugin('done', (stats) => {

      if (this.extendedFormat) {
        console.log(stats.toString({
          colors: true
        }));
      }

      let counter = this[local.counter]++;
      let time = (stats.endTime - stats.startTime) / 1000;
      let scripts = stats.compilation.fileDependencies;
      let warnings = stats.compilation.warnings;

      if (stats.compilation.errors && stats.compilation.errors.length) {
        this[local.lastBuildFailed] = true;

        this.emit('build.error', {
          key: this.key,
          extendedFormat: this.extendedFormat,
          errors: stats.compilation.errors
        });

      } else {
        this[local.lastBuildFailed] = false;

        this.emit('build.end', {
          key: this.key,
          chunks: Object.keys(stats.compilation.namedChunks),
          counter,
          time,
          scripts,
          warnings
        });
      }
    });

    compiler.plugin('invalid', () => {
      this.emit('build.start');
    });
  }
}
