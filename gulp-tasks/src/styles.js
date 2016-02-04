'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _forOwn = require('lodash/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _flattenDeep = require('lodash/flattenDeep');

var _flattenDeep2 = _interopRequireDefault(_flattenDeep);

var _uniq = require('lodash/uniq');

var _uniq2 = _interopRequireDefault(_uniq);

var _baseTask = require('../base-task');

var _baseTask2 = _interopRequireDefault(_baseTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_Base) {
  _inherits(_class, _Base);

  function _class() {
    _classCallCheck(this, _class);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
  }

  _createClass(_class, [{
    key: 'run',
    value: function run(done) {
      var _this2 = this;

      var styles = this.resources.getArray("styles");
      var builder = this.sintez.getBuilder("webpack", styles);
      var appBuilder = builder.getApplicationBuilder();

      this.initMultimeterBars(styles);

      appBuilder.remove('build.end').on('build.end', function (params) {
        appBuilder.remove("build.waiting");
        var message = '#' + params.counter + ' ' + params.chunks.join(" & ") + ' was packed. Elapsed time ' + params.time + 's. Number of files ' + params.scripts.length;
        var warnings = params.warnings;

        _this2.updateBar(params.key, 100, message);

        if (warnings && !!warnings.length) {
          _this2.logger.log('------------------');
          _this2.logger.log('*** %WARNINGS% ***');
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = warnings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var warning = _step.value;

              _this2.logger.log('at %' + warning.module.issuer + '%');
              _this2.logger.log('requested %"' + warning.module.rawRequest + '"% ("' + warning.module.userRequest + '")');
              _this2.logger.log(warning.message.replace(/(\r\n|\n|\r)/gm, ' '));
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          _this2.logger.log('------------------');
        }
      }).remove('build.error').on('build.error', function (_ref) {
        var key = _ref.key;
        var errors = _ref.errors;
        var extendedFormat = _ref.extendedFormat;

        appBuilder.remove("build.waiting");
        var message = _this2.getErrorMessage({ key: key, errors: errors, extendedFormat: extendedFormat });
        _this2.logger.error(message);
      }).remove('build.waiting').on('build.waiting', function (_ref2) {
        var key = _ref2.key;
        var percentage = _ref2.percentage;
        var msg = _ref2.msg;

        _this2.updateBar(key, Math.round(percentage * 100), 'Building ' + key + ' - ' + msg);
      });

      builder.run(function (err) {
        if (err) throw new Error("Error in style task");

        !_this2.multimeterOff && _this2.multimeterEnd();

        var filesToDelete = (0, _uniq2.default)((0, _flattenDeep2.default)(styles.map(function (res) {
          return _glob2.default.sync(_path2.default.resolve(res.getTarget(), "**.?(js|js.map)"));
        })));

        _async2.default.waterfall(filesToDelete.map(function (file) {
          return function (callback) {
            return (0, _rimraf2.default)(file, {}, callback);
          };
        }), done);
      });
    }
  }, {
    key: 'name',
    get: function get() {
      return 'styles';
    }
  }]);

  return _class;
}(_baseTask2.default);

exports.default = _class;