import Base from "../base-task";

export default class TemplatesTask extends Base {

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
        console.log(key + " end");
      })
      .on("build.waiting", ({key, percentage, msg}) => {
        bar[key].percent(Math.round(percentage * 100), `Building ${key} - ${msg}`);
      })
      .on("build.error", ({key}) => {
        console.log(key + " error");
      });

    builder.run((err)=> {
      !this.multimeterOff && this.multimeterEnd();
      done(err);
    });
  }
}
