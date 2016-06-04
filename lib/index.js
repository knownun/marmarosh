"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _builder = require("./builder");

var _builder2 = _interopRequireDefault(_builder);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var args = process.argv;
var builderArgs = args.slice(2);
var configPath = builderArgs[0];

(0, _utils.readConfig)(configPath).then(function (config) {
  var builder = new _builder2.default(config);
  return builder.run(function () {
    console.log("Done");
  });
}).catch(function (err) {
  console.error(err);
  return _promise2.default.reject(err);
});