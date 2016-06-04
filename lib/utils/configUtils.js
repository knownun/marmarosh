"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

exports.readConfig = readConfig;

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _index = require("./index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readConfig(string) {
  return new _promise2.default(function (resolve, reject) {
    if (string) {
      (function () {
        var resolvedPath = (0, _index.resolve)(string);
        _fs2.default.exists(resolvedPath, function (exists) {
          if (exists) {
            var module = require(resolvedPath);
            resolve(module.default ? module.default : module);
          } else {
            reject(new Error("Config not found in path " + resolvedPath));
          }
        });
      })();
    } else {
      reject(new Error("Config path not found."));
    }
  });
}

exports.default = { readConfig: readConfig };