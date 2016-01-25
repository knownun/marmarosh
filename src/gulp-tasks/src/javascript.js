import path from 'path';
import util from 'gulp-util';

import forOwn from "lodash/forOwn";

import Base from '../base-task';

export default class Build extends Base {

  constructor(gulp, sintez) {
    super(gulp, sintez);
  }

  get name() {
    return 'scripts';
  }

  run(done) {

    let scripts = this.resources.getArray("scripts");
    let builder = this.sintez.getBuilder("webpack", scripts);
    let appBuilder = builder.getApplicationBuilder();

    let multi = this.multimeter;
    let bar = {};
    scripts.forEach((res, i)=> {
      let key = res.getKey();
      bar[key] = multi.rel(0, i + 1, {
        width: 8,
        solid: {background: null, foreground: 'white', text: '|'},
        empty: {background: null, foreground: null, text: ' '}
      });
      multi.charm.write("\n");
    });

    appBuilder
      .remove('build.end')
      .on('build.end', (params) => {
        appBuilder.remove("build.waiting");

        let message = `#${params.counter} scripts was packed. Elapsed time ${params.time}s. Number of scripts ${params.scripts.length}`;
        let warnings = params.warnings;

        bar[params.key].percent(100, message);

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
      .on('build.error', ({key,errors,extendedFormat}) => {
        console.log(key + " error");
        this.logger.error(`- Build has ${errors.length} errors`);
        if (!extendedFormat) {
          for (var error of errors) {
            this.logger.error(`- ${error.message}`);
          }
        }
      }).remove('build.waiting')
      .on('build.waiting', ({key, percentage, msg}) => {
        bar[key].percent(Math.round(percentage * 100), `Building ${key} - ${msg}`);
      });

    builder.run((err)=> {
      !this.multimeterOff && this.multimeterEnd();
      done(err);
    });
  }
}
