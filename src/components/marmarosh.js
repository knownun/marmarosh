import { load as JSONfromYml } from "js-yaml";
import { readFileSync, existsSync } from "fs";
import { resolve, join, dirname } from "path";

import has from "lodash/has";
import getter from "lodash/get";
import setter from "lodash/set";
import merge from "lodash/merge";
import isArray from "lodash/isArray";
import isObject from "lodash/isObject";
import cloneDeep from "lodash/cloneDeep";

import Resources from "./resoruces";
import Builder from "./builder";

var local = {
  config: Symbol("config"),
  resources: Symbol("resources"),
  builder: Symbol("builder"),
  tests: Symbol("tests")
};

function getOrderedUrls(original, resources) {
  var urls = [];
  var originalResource = resources.get(original);
  var order = originalResource.getOptions("order");

  if (order) {
    for (var item of order) {
      var url = null;
      if (item[0] == "^") {
        var dependency = item.slice(1);
        var resource = resources.get(dependency);
        url = resource.getUrl();
      } else {
        url = item;
      }
      if (isArray(url)) {
        urls = urls.concat(url);
      } else {
        urls.push(url);
      }
    }
  } else {
    urls = originalResource.getUrl();
  }

  return urls;
}

function getDefaults(src, dest) {
  return {
    "src": src,
    "dest": dest,
    "source-maps": true,
    //"loaders": {
    //  "babel": [
    //    join(src, ".+\.js$"),
    //    join(src, ".+\.jsx$")
    //  ],
    //  "yaml": [
    //    join(src, ".+\.yml$")
    //  ],
    //  "html": [
    //    join(src, ".+\.html$")
    //  ],
    //  "json": [
    //    join(src, ".+\.json$")
    //  ],
    //  "jade": [
    //    join(src, ".+\.jade")
    //  ]
    //},
    "target": "web",
    "devtool": "source-map"
  };
}

function normalizeConfig(config) {
  var normalized = cloneDeep(config);
  var loaders = normalized.loaders;
  if (loaders) {
    var normalizedLoaders = {};
    for (var loader of Object.keys(loaders)) {
      if (!isArray(loaders[loader])) {
        normalizedLoaders[loader] = [loaders[loader]];
      } else {
        normalizedLoaders[loader] = loaders[loader];
      }
    }
    normalized.loaders = normalizedLoaders;
  }
  return normalized;
}

export default class Marmarosh {

  constructor(config = {}) {
    let validation = Marmarosh.validate(config);

    if (!validation.isValid) {
      throw new Error(`Invalid Marmarosh config. ${validation.errors.join(", ")}`);
    }

    let defaultConfig = getDefaults(config.src, config.dest);

    this[local.config] = merge(defaultConfig, config);
    this[local.builder] = this[local.builder] || {};
  }

  static loadYml(configPath) {
    if (!existsSync(configPath)) {
      throw new Error(`Marmarosh config "${configPath}" does not exist"`);
    }

    let configYml = readFileSync(configPath);
    let config = JSONfromYml(configYml);
    let normalized = normalizeConfig(config);

    if (normalized.extend) {
      let currentDir = dirname(configPath);
      let parentConfigPath = join(currentDir, normalized.extend);
      let parentConfig = Marmarosh.loadYml(parentConfigPath);
      normalized = merge(parentConfig, normalized);
    }

    return normalized;
  }

  static fromPath(configPath) {
    let config = Marmarosh.loadYml(configPath);
    return new Marmarosh(config);
  }

  static validate(config) {
    let errors = [];
    if (!config.src) {
      errors.push(`"src" is not defined`);
    }
    if (!config.dest) {
      errors.push(`"dest" is not defined`);
    }
    return {
      isValid: !errors.length,
      errors: errors
    }
  }

  createResources(customOptions = {}) {
    let src = this.getSrc();
    let dest = this.getDest();
    let resourcesConfig = this.get("resources");
    let options = {
      stats: this.get("stats"),
      alias: this.get("alias"),
      resolve: this.get("resolve"),
      globals: this.get("globals")
    };
    let config = Object.assign({}, resourcesConfig, customOptions);
    return new Resources(src, dest, config, options);
  }

  createBuilder(name, resources = []) {
    let src = this.getSrc();
    let dest = this.getDest();
    return new Builder(name, {src, dest, resources});
  }

  getConfig() {
    return this[local.config];
  }

  getResources() {
    if (!this[local.resources]) {
      this[local.resources] = this.createResources();
    }
    return this[local.resources];
  }

  getBuilder(name, resources) {
    return this.createBuilder(name, resources);

    //if (!has(this[local.builder], name)) {
    //  let builder = this.createBuilder(name, resources);
    //  setter(this[local.builder], name, builder);
    //}
    //
    //return getter(this[local.builder], name);
  }

  //createServer(customOptions = {}) {
  //  var resources = this.getResources();
  //  var index = resources.get("index");
  //
  //  var configOptions = {
  //    builder: this.getBuilder(),
  //    server: this.get("server"),
  //
  //    src: this.getSrc(),
  //    dest: this.getDest(),
  //
  //    host: this.get("host"),
  //    port: this.get("port"),
  //
  //    index: index.getDest()
  //  };
  //
  //  var options = Object.assign({}, configOptions, customOptions);
  //
  //  return new Server(options);
  //}

  //getServer() {
  //  if (!this[local.server]) {
  //    this[local.server] = this.createServer();
  //  }
  //
  //  return this[local.server];
  //}

  // --------------------------------

  get(key) {
    return getter(this[local.config], key);
  }

  has(key) {
    return !!this.get(key);
  }

  getDest() {
    return this.get("dest");
  }

  getSrc() {
    return this.get("src");
  }

  // ------------ OUTPUT --------------

  getOutputScripts() {
    var resources = this.getResources();
    var output = null;

    if (resources.has("js")) {
      output = getOrderedUrls("js", resources);
    }


    return isArray(output) ? output : [output];
  }

  getOutputStyles() {
    var resources = this.getResources();
    var output = null;

    if (resources.has("css")) {
      output = getOrderedUrls("css", resources);
    }

    return isArray(output) ? output : [output];
  }
}
