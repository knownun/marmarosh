import { platform } from "process"
import { readFileSync, existsSync } from "fs";
import { resolve, join, dirname } from "path";
import { load as JSONfromYml } from "js-yaml";


import has from "lodash/has";
import getter from "lodash/get";
import setter from "lodash/set";
import merge from "lodash/merge";
import isArray from "lodash/isArray";
import isObject from "lodash/isObject";
import cloneDeep from "lodash/cloneDeep";

import Resources from "./resoruces";
import Builder from "./builder";

let local = {
  config: Symbol("config"),
  resources: Symbol("resources"),
  builder: Symbol("builder"),
  tests: Symbol("tests")
};

function getDefaults(src, dest) {
  return {
    "src": src,
    "dest": dest,
    "source-maps": true,
    "target": "web",
    "devtool": "source-map"
  };
}

function normalizeConfig(config) {
  let normalized = cloneDeep(config);
  let loaders = normalized.loaders;
  if (loaders) {
    let normalizedLoaders = {};
    for (let loader of Object.keys(loaders)) {
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
  }

  createServer(ServerConstructor, customOptions = {}) {

    let configOptions = {
      src: this.getSrc(),
      dest: this.getDest(),
      host: this.get("host") || Marmarosh.defaultHost,
      port: this.get("port") || Marmarosh.defaultPort,
      globals: this.get("globals")
    };

    let options = Object.assign({}, configOptions, customOptions);

    return new ServerConstructor(options);
  }

  getServer(ServerConstructor, options) {
    return this.createServer(ServerConstructor, options);
  }

  static get defaultPort() {
    return platform == "darwin" ? 8080 : 80;
  }

  static get defaultHost() {
    return "localhost";
  }

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

  get isProduction() {
    return process.env.NODE_ENV == "production";
  }

}
