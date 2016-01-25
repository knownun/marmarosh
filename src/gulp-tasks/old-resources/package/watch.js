import path from 'path'

import watch from 'gulp-watch'
import lo from 'lodash'

import Base from '../../base-task'

import BuildTask from './build'
import CleanTask from './clear'

export default class LessWatch extends Base {
  constructor(gulp, sintez) {
    super(gulp, sintez);
    this.builder = new BuildTask(gulp, sintez);
    this.cleaner = new CleanTask(gulp, sintez);
  }

  getDefaultTaskName() {
    return 'watch';
  }

  run() {
    var dest = this.sintez.get("dest");
    var mask = this.sintez.get("watch");

    mask.push('!node_modules/**/*');

    this.cleaner.run();

    this.builder.init();

    var watchFn = (vf)=> {
      var ext = path.extname(vf.history[0]);
      if (ext.search(/.+(jade|yml)$/) != -1) {
        this.builder.buildComponents();
      }
      if (ext.search(/.+(less|css)$/) != -1) {
        this.builder.buildStyles();
      }
      if (ext.search(/.+(js|json)$/) != -1) {
        this.builder.buildScripts();
      }
    };

    watch(mask, {verbose: 1}, watchFn);
  }
}
