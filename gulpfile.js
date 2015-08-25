var gulp = require("gulp");
var babel = require("gulp-babel");
var plumber = require('gulp-plumber');
var merge = require("merge-stream");
var clean = require("rimraf");

gulp.task("build", function () {
  var scripts = gulp.src(["src/**/*.js"]).pipe(plumber()).pipe(babel());
  var resources = gulp.src(["src/**/*", "!src/**/*.js"]).pipe(plumber());

  clean.sync("build");

  return merge(scripts, resources)
    .pipe(gulp.dest("build"))
});

gulp.task("watch", ['build'], function () {
  gulp.watch("src/**/*", ['build'])
});
