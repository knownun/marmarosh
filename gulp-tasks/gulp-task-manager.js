'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gulpLogger = require('./gulp-logger');

var _gulpLogger2 = _interopRequireDefault(_gulpLogger);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = new _gulpLogger2.default("tasks");

var local = {
  gulp: Symbol('gulp')
};

var TaskManager = function () {
  function TaskManager(gulp) {
    _classCallCheck(this, TaskManager);

    this[local.gulp] = gulp;
  }

  _createClass(TaskManager, [{
    key: 'add',
    value: function add(task, name) {
      var _this = this;

      var taskName = name || task.name;

      this[local.gulp].task(taskName, function (done) {
        if (task.run.length == 1) {
          task.run(done);
        } else {
          return task.run();
        }
      });

      logger.log('+ ' + taskName);

      return function () {
        _this.start(taskName);
      };
    }
  }, {
    key: 'start',
    value: function start(taskName) {
      if (!taskName) {
        throw new Error('Can not manually start task because "taskName" is not defined');
      }

      this[local.gulp].start(taskName);
    }
  }]);

  return TaskManager;
}();

exports.default = TaskManager;