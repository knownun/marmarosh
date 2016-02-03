import path from 'path';
import util from 'gulp-util';

import lo from 'lodash';
import async from "async";

import Base from '../base-task';
import Styles from './styles';
import Scipts from './javascript';
import Templates from './templates';
import Clean from './clean';

export default class extends Base {

  constructor(gulp, sintez) {
    super(gulp, sintez);
    this.gulp = gulp;
    this.sintez = sintez;

    this.styles = new Styles(gulp, sintez);
    this.scipts = new Scipts(gulp, sintez);
    this.templates = new Templates(gulp, sintez);

    this.clean = new Clean(gulp, sintez);
    this.multimeterOff = true;
  }

  get name() {
    return 'build';
  }

  run(done) {
    this.clean.run((err)=> {
      if (err) throw new Error("Error in clean task");

      async.waterfall([
        this.templates.run.bind(this),
        this.styles.run.bind(this),
        this.scipts.run.bind(this)
      ], (err)=> {
        this.multimeterEnd();
        done(err);
      });
    });
  }
}
