import Base from "../base-task";
import map from "lodash/map";

export default class extends Base {

  get name() {
    return "templates";
  }

  run(done) {
    let resources = this.resources.getArray("templates");
    let builder = this.sintez.getBuilder("marmarosh-templates", resources);
    let appBuilder = builder.getApplicationBuilder();
    let resourceKeys = map(resources, (res) => res.getKey());

    appBuilder
      .remove("build.end")
      .remove("build.error")
      .remove("build.waiting")
      .on("build.end", ({key, files}) => {
        appBuilder.remove("build.waiting");
        let message = `%${key}% was packed. Number of templates ${files}.`;
        this.logger.log(message);
      })
      .on("build.waiting", ({key, percentage, msg}) => {
        this.logger.logProcess(`Packing - %${key}% ${msg}`);
      })
      .on("build.error", ({key, message}) => {
        appBuilder.remove("build.waiting");
        this.logger.error(message);
      });

    builder.run((err)=> {
      done(err);
    });
  }
}
