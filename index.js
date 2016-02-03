'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulpTasks = require('./gulp-tasks');

var _gulpTasks2 = _interopRequireDefault(_gulpTasks);

var _marmarosh = require('./components/marmarosh');

var _marmarosh2 = _interopRequireDefault(_marmarosh);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(gulp) {
  var configPath = _path2.default.resolve("config.yml");
  var sintez = _marmarosh2.default.fromPath(configPath);
  (0, _gulpTasks2.default)(gulp, sintez);
}