import { join, basename, dirname } from "path";
import { resolve as resolveUrl } from "url";
import { sync as globSync } from "glob";

import cloneDeep from "lodash/cloneDeep";
import merge from "lodash/merge";
import getter from "lodash/get";
import isArray from "lodash/isArray";
import isString from "lodash/isString";
import uniq from "lodash/uniq";
import concat from "lodash/concat";

let local = {
  src: Symbol("src"),
  dest: Symbol("dest"),
  key: Symbol("key"),
  normalized: Symbol("normalized")
};

export default class Resource {

  constructor(src, dest, key, config, options) {
    this[local.src] = src;
    this[local.dest] = dest;
    this[local.key] = key;
    this[local.normalized] = this.normalize(key, config, options);
  }

  normalize(key, config, options) {

    let normalized = {
      originalSourceIsArray: false
    };

    if (!config.src) {
      config.src = ".";
    }

    if (isArray(config.src)) {
      normalized.src = config.src;
      normalized.originalSourceIsArray = true;
    } else {
      normalized.src = [config.src];
    }

    if (config.dest) {
      if (!isString(config.dest)) {
        throw new Error(`Wrong configuration for "${key}" resource: "dest" should be string`);
      }
      normalized.dest = config.dest;
    } else {
      if (!isString(config.src)) {
        throw new Error(`Wrong configuration for "${key}" resource: "dest" is not defined and could not calculated`);
      } else {
        normalized.dest = config.src;
      }
    }

    normalized.destDirName = dirname(normalized.dest);
    normalized.destName = basename(normalized.dest) || (!normalized.originalSourceIsArray) ? basename(config.src) : null;

    normalized.names = normalized.src.map(path => basename(path));

    let locations = normalized.src.map(path => dirname(path));
    normalized.locations = uniq(locations);

    if (config.mask) {
      normalized.mask = isArray(config.mask) ? config.mask : [config.mask];
    } else {
      normalized.mask = null;
    }

    normalized.options = config.options || {};

    normalized.preset = config.preset || null;

    normalized.alias = merge({}, config.alias, options.alias) || null;

    normalized.resolve = concat([], config.resolve, options.resolve);

    normalized.extensions = config.extensions || null;

    normalized.target = config.target || null;

    normalized.devtool = config.devtool || null;

    normalized.stats = config.stats || options.stats || null;

    return normalized;
  }

  static collectScripts(paths, key) {
    if (!isArray(paths)) {
      paths = [paths];
    }

    let scripts = [];
    for (let path of paths) {
      let collected = globSync(path, {
        nosort: true
      });

      if (collected.length) {
        let processedScripts = collected.map((script) => "./" + script);
        scripts = scripts.concat(processedScripts);
      } else {
        throw new Error(`There are no scripts for "${key}" resource by "${path}" path`);
      }
    }

    return scripts;
  }

  getConfig() {
    return cloneDeep(this[local.normalized]);
  }

  getName() {
    let normalized = this[local.normalized];
    let names = null;

    if (normalized.originalSourceIsArray) {
      names = normalized.names;
    } else {
      names = normalized.names[0];
    }

    return names;
  }

  getKey() {
    return this[local.key];
  }

  getDestName() {
    return this[local.normalized].destName;
  }

  hasDestName() {
    return !!this[local.normalized].destName;
  }

  getProjectSrc() {
    return this[local.src];
  }

  getProjectDest() {
    return this[local.dest];
  }

  getMask() {
    let normalized = this[local.normalized];
    let mask = null;

    if (normalized.mask) {
      let src = this[local.src];

      if (isArray(normalized.mask)) {
        mask = normalized.mask.map(path => join(src, path));
      } else {
        mask = join(src, normalized.mask);
      }
    } else {
      mask = this.getSrc();
    }

    return mask;
  }

  getRelativeSrc() {
    let normalized = this[local.normalized];
    let relativeSrc = null;

    if (normalized.originalSourceIsArray) {
      relativeSrc = normalized.src;
    } else {
      relativeSrc = normalized.src[0];
    }

    return relativeSrc;
  }

  getSrc() {
    let relativeSrc = this.getRelativeSrc();
    let src = this[local.src];
    let resourceSrc = null;

    if (isArray(relativeSrc)) {
      resourceSrc = relativeSrc.map(path => join(src, path));
    } else {
      resourceSrc = join(src, relativeSrc);
    }

    return Resource.collectScripts(resourceSrc, this[local.key]);
  }

  getRelativeDest() {
    return this[local.normalized].dest;
  }

  getDest() {
    let relativeDest = this.getRelativeDest();
    let dest = this[local.dest];
    return join(dest, relativeDest);
  }

  getRelativeLocation() {
    let normalized = this[local.normalized];
    let relativeLocation = null;

    if (normalized.originalSourceIsArray) {
      relativeLocation = normalized.locations;
    } else {
      relativeLocation = normalized.locations[0];
    }

    return relativeLocation;
  }

  getLocation() {
    let relativeLocation = this.getRelativeLocation();
    let src = this[local.src];

    let location = null;
    if (isArray(relativeLocation)) {
      location = relativeLocation.map(path => join(src, path));
    } else {
      location = join(src, relativeLocation);
    }

    return location;
  }

  getRelativeTarget() {
    return this[local.normalized].destDirName;
  }

  getTarget() {
    let relativeTarget = this.getRelativeTarget();
    let dest = this[local.dest];

    return join(dest, relativeTarget);
  }

  getOptions(optionPath) {
    let normalized = this[local.normalized];
    let options = null;

    if (!optionPath) {
      options = normalized.options;
    } else {
      options = getter(normalized.options, optionPath) || null;
    }

    return options;
  }

  getUrl() {
    let target = this.getRelativeTarget();
    let destName = this.getDestName();
    let url = null;
    if (!destName) {
      let src = this.getSrc();
      if (isArray(src)) {
        url = [];
        for (let resourcePath of src) {
          let resourceUrl = resolveUrl("/", target, basename(resourcePath));
          url.push(resourceUrl);
        }
      } else {
        url = resolveUrl("/", target, basename(src));
      }
    } else {
      url = resolveUrl("/", target, destName);
    }
    return url;
  }

  getPresetName() {
    return this[local.normalized].preset;
  }

  getBuilderName() {
    return this[local.normalized].builder;
  }

  get devtool() {
    return this.getConfig().devtool || "source-map";
  }

  get target() {
    return this.getConfig().target || "web";
  }

  get src() {
    return this.getSrc();
  }

  get dest() {
    return this.getDest();
  }

  get relativeDest() {
    return this.getRelativeDest();
  }

  get extentions() {
    return this.getConfig().extentions;
  }

  get alias() {
    return this.getConfig().alias;
  }

  get resolve() {
    return this.getConfig().resolve;
  }

  get preset() {
    return this.getConfig().preset;
  }

  get stats() {
    return this.getConfig().stats;
  }

}
