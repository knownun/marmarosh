import Base from '../../base-task';

export default class Build extends Base {

  getDefaultTaskName() {
    return 'js:build';
  }

  run(done) {
    this.sintez.getBuilder().run((err) => {
      done(err);
    });
  }
}
