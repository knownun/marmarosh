import util from "gulp-util";
import rimraf from "rimraf";
import glob from "glob";
import async from "async";

import forOwn from "lodash/forOwn";
import flatten from "lodash/flattenDeep";
import uniq from "lodash/uniq";
import map from "lodash/map";

import Base from "../base-task";

import {resolve} from "../../utils/helpers";

export default class extends Base {

  get name() {
    return "styles";
  }

  run(done) {

    let resources = this.resources.getArray("styles");
    let builder = this.sintez.getBuilder("webpack", resources);
    let appBuilder = builder.getApplicationBuilder();

    appBuilder
      .remove("build.error")
      .remove("build.end")
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
      .on("build.waiting", ({key, msg}) => {
        this.logger.logProcess(`Packing %${key}% - ${msg}`);
      })
      .on("build.error", ({key, errors, extendedFormat}) => {
        let message = this.getErrorMessage({key, errors, extendedFormat});
        this.logger.error(message);
      });


    builder.run((err)=> {
      if (err) throw new Error("Error in style task");

      let filesToDelete = uniq(flatten(resources.map((res)=> {
        return glob.sync(resolve(res.getTarget(), "**.?(js|js.map)"))
      })));

      async.parallel(filesToDelete.map((file) => {
        return (callback) => rimraf(file, {}, callback)
      }), done);
    });

  }
}
