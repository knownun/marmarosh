"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cloneDeep = require("lodash/cloneDeep");

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _startsWith = require("lodash/startsWith");

var _startsWith2 = _interopRequireDefault(_startsWith);

var _each = require("lodash/each");

var _each2 = _interopRequireDefault(_each);

var _baseResource = require("../resources/base-resource");

var _baseResource2 = _interopRequireDefault(_baseResource);

var _jsResource = require("../resources/js-resource");

var _jsResource2 = _interopRequireDefault(_jsResource);

var _lessResource = require("../resources/less-resource");

var _lessResource2 = _interopRequireDefault(_lessResource);

var _templatesResources = require("../resources/templates-resources");

var _templatesResources2 = _interopRequireDefault(_templatesResources);

var _helpers = require("../utils/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var local = {
  src: Symbol("src"),
  dest: Symbol("dest"),
  options: Symbol("options"),
  resources: Symbol("resources")
};

var resourceTypesMap = new Map();

resourceTypesMap.set("scripts", _jsResource2.default);
resourceTypesMap.set("styles", _lessResource2.default);
resourceTypesMap.set("templates", _templatesResources2.default);

var Resources = function () {
  function Resources(src, dest, resources, options) {
    _classCallCheck(this, Resources);

    this[local.src] = src;
    this[local.dest] = dest;
    this[local.options] = options;
    this[local.resources] = resources;
  }

  _createClass(Resources, [{
    key: "getConfig",
    value: function getConfig() {
      return (0, _cloneDeep2.default)(this[local.resources]);
    }
  }, {
    key: "get",
    value: function get(key) {
      var resources = this[local.resources];

      if (!this.has(key)) {
        throw new Error("Resource \"" + key + "\" is not defined");
      }

      return this.create(key, resources[key]);
    }
  }, {
    key: "getArray",
    value: function getArray(startsWithString) {
      var resourceNames = Object.keys(this[local.resources]);
      var filtered = resourceNames.filter(function (name) {
        return (0, _startsWith2.default)(name, startsWithString);
      });
      return filtered.map(this.get.bind(this));
    }
  }, {
    key: "create",
    value: function create(key, config) {
      var src = this[local.src];
      var dest = this[local.dest];
      var options = this[local.options];
      var type = key.split("-")[0];
      var resourceClass = resourceTypesMap.has(type) ? resourceTypesMap.get(type) : _baseResource2.default;

      return new resourceClass(src, dest, key, config, options);
    }
  }, {
    key: "has",
    value: function has(key) {
      var resources = this[local.resources];
      return resources[key];
    }
  }]);

  return Resources;
}();

exports.default = Resources;