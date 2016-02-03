'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sep = exports.joinUrl = exports.toUnifiedPath = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toUnifiedPath = exports.toUnifiedPath = function toUnifiedPath(path) {
  return path.replace(/[\\\/]+/g, '/');
};
var joinUrl = exports.joinUrl = function joinUrl() {
  for (var _len = arguments.length, agrs = Array(_len), _key = 0; _key < _len; _key++) {
    agrs[_key] = arguments[_key];
  }

  return _url2.default.resolve(agrs);
};
var sep = exports.sep = _path2.default.sep === '/' ? '\\x2f' : '\\x5c';