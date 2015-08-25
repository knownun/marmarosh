import path from 'path'

import watch from 'gulp-watch'
import lo from 'lodash'

import Base from '../../base-task'

import LessCompile from './compile'

export default class LessWatch extends Base {
  constructor(gulp, sintez) {
    super(gulp, sintez);
    this.progress = false;
    this.compiler = new LessCompile(gulp, sintez);
  }

  getDefaultTaskName() {
    return 'css:watch';
  }

  waitLog() {
    this.logger.log(`Waiting for changes...`);
  }

  run(done) {
    var css = lo.get(this.getResources().getConfig(), 'css');

    var src = lo.get(css, 'src');
    var mask = lo.get(css, 'mask');
    var dest = lo.get(css, 'dest');

    var inputMask = [path.join(mask), '!node_modules/**/*'];

    this.logger.log(`Start watching ${inputMask}`);

    this.compiler.run(()=> {
      this.waitLog();
      watch(inputMask, {verbose: 1}, () => {
        return this.compiler.run(() => {
          this.waitLog();
        });
      });
      return done(null)
    });
  }
}
