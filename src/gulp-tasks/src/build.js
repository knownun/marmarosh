import util from "gulp-util";

import lo from "lodash";
import async from "async";

import Base from "../base-task";
import Styles from "./styles";
import Scipts from "./javascript";
import Templates from "./templates";
import Clean from "./clean";

export default class extends Base {

  get name() {
    return "build";
  }

  run(done) {

    this.styles = new Styles(this.gulp, this.sintez);
    this.scipts = new Scipts(this.gulp, this.sintez);
    this.templates = new Templates(this.gulp, this.sintez);

    this.clean = new Clean(this.gulp, this.sintez);

    this.clean.run((err)=> {
      if (err) throw new Error("Error in clean task");

      async.waterfall([
        this.templates.run.bind(this),
        this.styles.run.bind(this),
        this.scipts.run.bind(this)
      ], (err)=> {
        done(err);
      });
    });
  }
}
