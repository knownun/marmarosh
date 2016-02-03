"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _build = require("./src/build");

var _build2 = _interopRequireDefault(_build);

var _clean = require("./src/clean");

var _clean2 = _interopRequireDefault(_clean);

var _javascript = require("./src/javascript");

var _javascript2 = _interopRequireDefault(_javascript);

var _styles = require("./src/styles");

var _styles2 = _interopRequireDefault(_styles);

var _templates = require("./src/templates");

var _templates2 = _interopRequireDefault(_templates);

var _development = require("./src/development");

var _development2 = _interopRequireDefault(_development);

var _gulpTaskManager = require("./gulp-task-manager");

var _gulpTaskManager2 = _interopRequireDefault(_gulpTaskManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (gulp, sintez) {
  var taskManager = new _gulpTaskManager2.default(gulp);

  taskManager.add(new _build2.default(gulp, sintez));
  taskManager.add(new _clean2.default(gulp, sintez));
  taskManager.add(new _javascript2.default(gulp, sintez));
  taskManager.add(new _styles2.default(gulp, sintez));
  taskManager.add(new _templates2.default(gulp, sintez));

  taskManager.add(new _development2.default(gulp, sintez));
};