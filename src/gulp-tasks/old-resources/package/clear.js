import rimraf from 'rimraf'

import Base from '../../base-task'


export default class Task extends Base {

  constructor(gulp, sintez) {
    super(gulp, sintez);
  }

  getDefaultTaskName() {
    return 'clear';
  }

  run(done) {
    rimraf.sync(this.sintez.getDest())
    done && done()
  }
}
