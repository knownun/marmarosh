import Base from "../base-task";

export default class extends Base {

  get name() {
    return "templates";
  }

  run(done) {
    let resources = this.resources.getArray("templates");
    let builder = this.sintez.getBuilder("marmarosh-templates", resources);
    let appBuilder = builder.getApplicationBuilder();

    let multi = this.multimeter;
    let bar = {};
    resources.forEach((res, i)=> {
      let key = res.getKey();
      bar[key] = multi.rel(0, i + 1, {
        width: 8,
        solid: {background: null, foreground: 'white', text: '|'},
        empty: {background: null, foreground: null, text: ' '}
      });
      multi.charm.write("\n");
    });

    appBuilder
      .remove("build.end")
      .remove("build.error")
      .remove("build.error")
      .on("build.end", ({key}) => {
      })
      .on("build.waiting", ({key, percentage, msg}) => {
        bar[key].percent(Math.round(percentage * 100), `Building ${key} - ${msg}`);
      })
      .on("build.error", ({key, errors, extendedFormat}) => {
        appBuilder.remove("build.waiting");
        let message = this.getErrorMessage({key, errors, extendedFormat});
        this.logger.error(message);
      });

    builder.run((err)=> {
      !this.multimeterOff && this.multimeterEnd();
      done(err);
    });
  }
}
