import path from 'path';
import util from 'gulp-util';
import rimraf from 'rimraf';
import glob from 'glob';
import async from 'async';

import forOwn from "lodash/forOwn";
import flatten from 'lodash/flattenDeep';
import uniq from 'lodash/uniq';

import Base from '../base-task';

export default class extends Base {

  get name() {
    return 'styles';
  }

  run(done) {

    let styles = this.resources.getArray("styles");
    let builder = this.sintez.getBuilder("webpack", styles);
    let appBuilder = builder.getApplicationBuilder();

    this.initMultimeterBars(styles);

    appBuilder
      .remove('build.end')
      .on('build.end', (params) => {
        appBuilder.remove("build.waiting");
        let message = `#${params.counter} ${params.chunks.join(" & ")} was packed. Elapsed time ${params.time}s. Number of files ${params.scripts.length}`;
        let warnings = params.warnings;

        this.updateBar(params.key, 100, message);

        if (warnings && !!warnings.length) {
          this.logger.log('------------------');
          this.logger.log('*** %WARNINGS% ***');
          for (var warning of warnings) {
            this.logger.log(`at %${warning.module.issuer}%`);
            this.logger.log(`requested %"${warning.module.rawRequest}"% ("${warning.module.userRequest}")`);
            this.logger.log(warning.message.replace(/(\r\n|\n|\r)/gm, ' '));
          }
          this.logger.log('------------------');
        }
      })
      .remove('build.error')
      .on('build.error', ({key, errors, extendedFormat}) => {
        appBuilder.remove("build.waiting");
        let message = this.getErrorMessage({key, errors, extendedFormat});
        this.logger.error(message);
      })
      .remove('build.waiting')
      .on('build.waiting', ({key, percentage, msg}) => {
        this.updateBar(key, Math.round(percentage * 100), `Building ${key} - ${msg}`);
      });

    builder.run((err)=> {
      if (err) throw new Error("Error in style task");

      !this.multimeterOff && this.multimeterEnd();

      let filesToDelete = uniq(flatten(styles.map((res)=> {
        return glob.sync(path.resolve(res.getTarget(), "**.?(js|js.map)"))
      })));

      async.waterfall(filesToDelete.map((file) => {
        return (callback) => rimraf(file, {}, callback)
      }), done);

    });
  }
}
