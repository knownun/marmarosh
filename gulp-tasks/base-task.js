'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _marmarosh = require('../components/marmarosh');

var _marmarosh2 = _interopRequireDefault(_marmarosh);

var _wrongSintezInstance = require('../utils/exceptions/wrong-sintez-instance');

var _wrongSintezInstance2 = _interopRequireDefault(_wrongSintezInstance);

var _gulpLogger = require('./gulp-logger');

var _gulpLogger2 = _interopRequireDefault(_gulpLogger);

var _multimeter = require('multimeter');

var _multimeter2 = _interopRequireDefault(_multimeter);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  multimeter: Symbol("multimeter")
};

var TaskBase = function () {
  function TaskBase(gulp, sintez) {
    _classCallCheck(this, TaskBase);

    if (!(sintez instanceof _marmarosh2.default)) {
      throw new _wrongSintezInstance2.default();
    }

    this.sintez = sintez;
    this.gulp = gulp;

    var taskName = this.name;
    this.logger = new _gulpLogger2.default(taskName);
  }

  _createClass(TaskBase, [{
    key: 'run',
    value: function run() {
      throw new Error('@run method should be implemented');
    }
  }, {
    key: 'multimeterEnd',
    value: function multimeterEnd() {
      if (this[local.multimeter]) this[local.multimeter].charm.end();
    }
  }, {
    key: 'initMultimeterBars',
    value: function initMultimeterBars(resources) {
      var _this = this;

      var multi = this.multimeter;
      this.bar = {};
      resources.forEach(function (res, index) {
        var key = res.getKey();
        var position = resources.length - index;
        _this.bar[key] = multi.rel(0, position, {
          width: 8,
          solid: { background: null, foreground: 'white', text: '|' },
          empty: { background: null, foreground: null, text: ' ' }
        });
        multi.charm.write("\n");
      });
    }
  }, {
    key: 'updateBar',
    value: function updateBar(resKey, percent, message) {
      percent = percent < 1 ? Math.round(percent * 100) : percent;
      this.bar[resKey].percent(percent, message);
      return this;
    }
  }, {
    key: 'clearBar',
    value: function clearBar(resKey) {
      this.bar[resKey].percent(0, "");
    }
  }, {
    key: 'getErrorMessage',
    value: function getErrorMessage(_ref) {
      var key = _ref.key;
      var _ref$errors = _ref.errors;
      var errors = _ref$errors === undefined ? [] : _ref$errors;
      var _ref$extendedFormat = _ref.extendedFormat;
      var extendedFormat = _ref$extendedFormat === undefined ? false : _ref$extendedFormat;

      var errorLength = errors.length;
      var separator = "\n\n---------------------------\n\n";
      var startSeparator = "\n\n---------- START ----------\n\n";
      var endSeparator = "\n\n----------- END -----------\n\n";
      var message = '- ' + key + ' - Build has ' + errorLength + ' errors';

      if (!extendedFormat) {
        errors.forEach(function (error, index) {
          message += separator + ' Error in ' + key + ' [' + (index + 1) + '/' + errorLength + '] ' + startSeparator + ' ' + error.message + ' ' + endSeparator;
        });
      }

      return message;
    }
  }, {
    key: 'resources',
    get: function get() {
      return this.sintez.getResources();
    }
  }, {
    key: 'name',
    get: function get() {
      throw new Error('@get name() method should be implemented');
    }
  }, {
    key: 'multimeter',
    get: function get() {
      if (!this[local.multimeter]) {
        this[local.multimeter] = (0, _multimeter2.default)(_process2.default);
        this[local.multimeter].charm.setMaxListeners(0);
      }
      return this[local.multimeter];
    }
  }]);

  return TaskBase;
}();

exports.default = TaskBase;