"use strict";

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _builder = require("./builder");

var _builder2 = _interopRequireDefault(_builder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var args = process.argv;
var builderArgs = args.slice(2);
var configPath = builderArgs[0];

// Helpers
// ---------------------------

function readConfig(string) {
  return new Promise(function (resolve, reject) {
    if (string) {
      (function () {
        var resolvedPath = _path2.default.resolve(string);
        _fs2.default.exists(resolvedPath, function (exists) {
          if (exists) {
            resolve(require(resolvedPath));
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

readConfig(configPath).then(function (config) {
  var builder = new _builder2.default(config);
  builder.run(function () {
    console.log("Done");
  });
}).catch(function (err) {
  console.error(err);
  return Promise.reject(err);
});