import { sync as globSync } from 'glob'
import concatFiles from 'gulp-concat'
import gulpFilter from 'gulp-filter'
import plumber from 'gulp-plumber'
import gulpLess from 'gulp-less'
import gnewer from 'gulp-newer'
import mapst from 'map-stream'
import lo from 'lodash'

import Base from '../../base-task'

import path from 'path'

export default class LessCompile extends Base {

  constructor(gulp, sintez) {
    super(gulp, sintez);
    this.plumberOpts = {
      errorHandler: (e) => {
        this.logger.error(e.message)
      }
    }
  }

  getDefaultTaskName() {
    return 'css:compile';
  }

  compileTheme(theme) {
    var themeOut = theme + this._outputExt;
    var themeMask = theme + this._inputExt;
    var themeFilter = gulpFilter(themeMask, {restore: true});
    this.stream = this.stream
      .pipe(plumber(this.plumberOpts))
      .pipe(themeFilter)
      .pipe(gnewer(path.join(this._dest, themeOut)))
      .pipe(concatFiles(themeOut))
      .pipe(mapst(this.compiledInLog.bind(this)))
      .pipe(gulpLess(this._lessOptions))
      .pipe(themeFilter.restore)
  }

  compiledInLog(file, done) {
    this.logger.log(`${path.join(this._dest, path.basename(file.path))} compiled`);
    done(null, file);
  }

  run(done) {

    this._css = lo.get(this.getResources().getConfig(), 'css');

    this._src = lo.get(this._css, 'src');
    this._dest = lo.get(this._css, 'dest');
    this._mask = lo.get(this._css, 'mask');

    this._inputExt = path.extname(this._mask);
    this._outputExt = ".css";

    this._themes = lo.get(this._css, 'themes');
    this._options = lo.get(this._css, 'options');

    this._inputMask = path.join(this._src, this._mask);

    this._lessFiles = this._lessFiles || globSync(this._inputMask);
    this._lessOptions = Object.assign({}, this._options);

    this.stream = this.gulp.src(this._lessFiles);

    lo.forEach(this._themes, (theme) => {
      if (lo.startsWith(theme, '?')) {
        this.compileTheme(theme.substr(1))
      } else {
        this.compileTheme(theme)
      }
    });

    return this.stream
      .pipe(gulpFilter("**" + this._outputExt))
      .pipe(this.gulp.dest(this._dest))
      .on('end', () => {
        done && done()
      })
  }

}
