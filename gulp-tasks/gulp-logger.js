"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _process = require("process");

var _process2 = _interopRequireDefault(_process);

var _gulpUtil = require("gulp-util");

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _isArray = require("lodash/isArray");

var _isArray2 = _interopRequireDefault(_isArray);

var _throttle = require("lodash/throttle");

var _throttle2 = _interopRequireDefault(_throttle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var colorsMap = new Map();

colorsMap.set("magenta", _gulpUtil2.default.colors.magenta);
colorsMap.set("cyan", _gulpUtil2.default.colors.cyan);
colorsMap.set("blue", _gulpUtil2.default.colors.blue);
colorsMap.set("yellow", _gulpUtil2.default.colors.yellow);
colorsMap.set("green", _gulpUtil2.default.colors.green);

var colors = colorsMap.values();

var local = {
  throttled: Symbol("throttle")
};

var getNextColoring = function getNextColoring() {
  var color = colors.next();
  if (color.done) {
    colors = colorsMap.values();
    color = colors.next();
  }
  return color.value;
};

var _class = function () {
  function _class(taskName) {
    var logLevel = arguments.length <= 1 || arguments[1] === undefined ? 2 : arguments[1];
    var color = arguments[2];

    _classCallCheck(this, _class);

    this.task = taskName;
    this.errorColoring = _gulpUtil2.default.colors.red;
    this.isErrorsOn = logLevel >= 0;
    this.isLogsOn = logLevel > 0;
    this.isProcessOn = logLevel > 1;
    if (color && colors.has(color)) {
      this.coloring = colors.get(color);
    } else {
      this.coloring = getNextColoring();
    }
  }

  _createClass(_class, [{
    key: "log",
    value: function log(message) {
      if (this.isLogsOn) {
        var coloring = this.coloring;
        var completeMessage = message.replace(/((%)([^%]+)(%))/g, coloring("$3"));
        _gulpUtil2.default.log(coloring(this.task) + " " + completeMessage);
      }
      return this;
    }
  }, {
    key: "error",
    value: function error(message) {
      if (this.isErrorsOn) {
        var coloring = this.errorColoring;
        var completeMessage = coloring(message);
        if (this.isProduction) {
          throw new Error(message);
        } else {
          _gulpUtil2.default.log(coloring(this.task) + " " + completeMessage);
        }
      }
      return this;
    }
  }, {
    key: "updated",
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

          var info = coloring(src) + " -> " + coloring(options.dest);
          this.log("fired. " + info);
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
    key: "logProcess",
    value: function logProcess(message) {
      var wait = arguments.length <= 1 || arguments[1] === undefined ? 300 : arguments[1];

      if (this.isProcessOn) {
        if (!this[local.throttled]) {
          this[local.throttled] = (0, _throttle2.default)(this.log, wait, {
            leading: 1, trailing: 0
          });
        }
        this[local.throttled](message);
      }
      return this;
    }
  }, {
    key: "isProduction",
    get: function get() {
      return _process2.default.env.NODE_ENV == "production";
    }
  }]);

  return _class;
}();

exports.default = _class;