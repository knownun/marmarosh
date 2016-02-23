'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Chunk = require('webpack/lib/Chunk');

var _Chunk2 = _interopRequireDefault(_Chunk);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  counter: Symbol('counter'),
  lastBuildFailed: Symbol('last-fbuild-failed')
};

var WebpackLogPlugin = function () {
  function WebpackLogPlugin(emit, options) {
    _classCallCheck(this, WebpackLogPlugin);

    this.emit = emit;
    this.key = options.key;
    this.extendedFormat = options.extendedFormat || null;
    this[local.counter] = 1;
    this[local.lastBuildFailed] = false;
    return this;
  }

  _createClass(WebpackLogPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('done', function (stats) {

        if (_this.extendedFormat) {
          console.log(stats.toString({
            colors: true
          }));
        }

        var counter = _this[local.counter]++;
        var time = (stats.endTime - stats.startTime) / 1000;
        var scripts = stats.compilation.fileDependencies;
        var warnings = stats.compilation.warnings;

        if (stats.compilation.errors && stats.compilation.errors.length) {
          _this[local.lastBuildFailed] = true;

          _this.emit('build.error', {
            key: _this.key,
            extendedFormat: _this.extendedFormat,
            errors: stats.compilation.errors
          });
        } else {
          _this[local.lastBuildFailed] = false;

          _this.emit('build.end', {
            key: _this.key,
            chunks: Object.keys(stats.compilation.namedChunks),
            counter: counter,
            time: time,
            scripts: scripts,
            warnings: warnings
          });
        }
      });

      compiler.plugin('invalid', function () {
        _this.emit('build.start');
      });
    }
  }]);

  return WebpackLogPlugin;
}();

exports.default = WebpackLogPlugin;