import util from "gulp-util";

import forOwn from "lodash/forOwn";
import map from "lodash/map";

import Base from "../base-task";

export default class extends Base {

  get name() {
    return "scripts";
  }

  run(done) {

    let resources = this.resources.getArray("scripts");
    let builder = this.sintez.getBuilder("webpack", resources);
    let appBuilder = builder.getApplicationBuilder();
    let resourceKeys = map(resources, (res) => res.getKey());

    appBuilder
      .remove("build.end")
      .remove("build.error")
      .remove("build.waiting")
      .on("build.end", (params) => {
        let message = `#${params.counter} %${params.key}% was packed. Elapsed time %${params.time}s%. Number of files %${params.scripts.length}%`;
        let warnings = params.warnings;

        this.logger.log(message);

        if (warnings && !!warnings.length) {
          this.logger.log("------------------");
          this.logger.log("*** %WARNINGS% ***");
          for (var warning of warnings) {
            this.logger.log(`at %${warning.module.issuer}%`);
            this.logger.log(`requested %"${warning.module.rawRequest}"% ("${warning.module.userRequest}")`);
            this.logger.log(warning.message.replace(/(\r\n|\n|\r)/gm, " "));
          }
          this.logger.log("------------------");
        }

      })
      .on("build.error", ({key, errors, extendedFormat}) => {
        let message = this.getErrorMessage({key, errors, extendedFormat});
        this.logger.error(message);
      })
      .on("build.waiting", ({key, msg}) => {
        this.logger.logProcess(`Packing %${key}% - ${msg}`, 1000);
      });

    builder.run((err)=> {
      done(err);
    });
  }
}
