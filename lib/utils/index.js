"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readConfig = exports.relative = exports.extname = exports.basename = exports.dirname = exports.normalize = exports.resolve = exports.join = exports.sep = exports.joinUrl = exports.toUnifiedPath = undefined;

var _configUtils = require("./configUtils");

Object.defineProperty(exports, "readConfig", {
  enumerable: true,
  get: function get() {
    return _configUtils.readConfig;
  }
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isWindows = process.platform === "win32";

var toUnifiedPath = exports.toUnifiedPath = function toUnifiedPath(path) {
  return path.replace(/[\\\/]+/g, "/");
};
var joinUrl = exports.joinUrl = function joinUrl() {
  for (var _len = arguments.length, agrs = Array(_len), _key = 0; _key < _len; _key++) {
    agrs[_key] = arguments[_key];
  }

  return _url2.default.resolve(agrs);
};
var sep = exports.sep = _path2.default.sep === "/" ? "\\x2f" : "\\x5c";
var join = exports.join = isWindows ? _path2.default.win32.join : _path2.default.posix.join;
var resolve = exports.resolve = isWindows ? _path2.default.win32.resolve : _path2.default.posix.resolve;
var normalize = exports.normalize = isWindows ? _path2.default.win32.normalize : _path2.default.posix.normalize;
var dirname = exports.dirname = isWindows ? _path2.default.win32.dirname : _path2.default.posix.dirname;
var basename = exports.basename = isWindows ? _path2.default.win32.basename : _path2.default.posix.basename;
var extname = exports.extname = isWindows ? _path2.default.win32.extname : _path2.default.posix.extname;
var relative = exports.relative = isWindows ? _path2.default.win32.relative : _path2.default.posix.relative;