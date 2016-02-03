'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var colorsMap = new Map();

colorsMap.set('magenta', _gulpUtil2.default.colors.magenta);
colorsMap.set('cyan', _gulpUtil2.default.colors.cyan);
colorsMap.set('blue', _gulpUtil2.default.colors.blue);
colorsMap.set('yellow', _gulpUtil2.default.colors.yellow);
colorsMap.set('green', _gulpUtil2.default.colors.green);

var colors = colorsMap.values();

var getNextColoring = function getNextColoring() {
  var color = colors.next();
  if (color.done) {
    colors = colorsMap.values();
    color = colors.next();
  }
  return color.value;
};

var isEnabled = true;

var Log = function () {
  function Log(task, color) {
    _classCallCheck(this, Log);

    this.task = task;
    this.errorColoring = _gulpUtil2.default.colors.red;

    if (color && colors.has(color)) {
      this.coloring = colors.get(color);
    } else {
      this.coloring = getNextColoring();
    }
  }

  _createClass(Log, [{
    key: 'log',
    value: function log(message) {
      if (isEnabled) {
        var coloring = this.coloring;
        var completeMessage = message.replace(/((%)([^%]+)(%))/g, coloring('$3'));
        _gulpUtil2.default.log(coloring(this.task) + ' ' + completeMessage);
      }
    }
  }, {
    key: 'error',
    value: function error(message) {
      if (isEnabled) {
        var coloring = this.errorColoring;
        var completeMessage = coloring(message);
        if (!this.isProduction) {
          throw new Error(message);
        } else {
          _gulpUtil2.default.log(coloring(this.task) + ' ' + completeMessage);
        }
      }
    }
  }, {
    key: 'updated',
    value: function updated(options) {
      var coloring = this.coloring;

      if (!(0, _isArray2.default)(options.src)) {
        options.src = [options.src];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = options.src[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var src = _step.value;

          var info = coloring(src) + ' -> ' + coloring(options.dest);
          this.log('fired. ' + info);
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
    }
  }, {
    key: 'isProduction',
    get: function get() {
      return process.env.NODE_ENV == "production";
    }
  }], [{
    key: 'enable',
    value: function enable() {
      isEnabled = true;
    }
  }, {
    key: 'disable',
    value: function disable() {
      isEnabled = false;
    }
  }]);

  return Log;
}();

exports.default = Log;