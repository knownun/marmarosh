import Base from "../base-task";

export default class extends Base {

  get name() {
    return "dev";
  }

  run(done) {

    if (this.sintez.isProduction) {
      return this.logger.error("task is available only on Development environment");
    }

    let MarmaroshDevServer = require("marmarosh-dev-server");

    let stylesResources = this.resources.getArray("styles");
    let scriptsResources = this.resources.getArray("script");
    let templateResources = this.resources.getArray("templates");

    let webpackResources = [].concat(stylesResources).concat(scriptsResources);
    let webpackBuilder = this.sintez.getBuilder("webpack", webpackResources);

    let appBuilder = webpackBuilder.getApplicationBuilder();

    let cache = {};

    appBuilder
      .remove("build.end")
      .remove("build.error")
      .remove("build.waiting")
      .on("build.waiting", ({key})=> {
        if (!cache[key]) {
          cache[key] = true;
          this.logger.log(`#0 %${key}% build was started`);
        }
      })
      .on("build.end", (params) => {
        let message = `#${params.counter} %${params.key}% was packed. Elapsed time %${params.time}s%. Number of files %${params.scripts.length}%`;
        appBuilder.remove("build.waiting");

        this.logger.log(message);
      })
      .on("build.error", ({key, errors, extendedFormat}) => {
        appBuilder.remove("build.waiting");
        let message = this.getErrorMessage({key, errors, extendedFormat});
        this.logger.error(message);
      });

    let server = this.sintez.getServer(MarmaroshDevServer, {
      templates: templateResources,
      styles: stylesResources,
      scripts: scriptsResources,
      webpack: webpackBuilder
    });

    server.run(()=> {

    });

  }
}
