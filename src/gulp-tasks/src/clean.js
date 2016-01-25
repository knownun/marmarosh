import rimraf from 'rimraf';

import Base from '../base-task';

export default class Clean extends Base {

  constructor(gulp, sintez) {
    super(gulp, sintez);
    this.src = sintez.getDest();
  }

  get name() {
    return 'clean';
  }

  run(done) {
    rimraf(this.src, done);
  }
}
