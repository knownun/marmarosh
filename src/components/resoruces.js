import { resolve, join } from "path";
import cloneDeep from "lodash/cloneDeep";
import startsWith from "lodash/startsWith";
import each from "lodash/each";

import { toUnifiedPath } from "../utils/helpers";

import Resource from "../resources/base-resource";
import JsResource from "../resources/js-resource";
import LessResource from "../resources/less-resource";
import TemplatesResource from "../resources/templates-resources";

let local = {
  src: Symbol("src"),
  dest: Symbol("dest"),
  options: Symbol("options"),
  resources: Symbol("resources")
};

let resourceTypesMap = new Map();

resourceTypesMap.set("scripts", JsResource);
resourceTypesMap.set("styles", LessResource);
resourceTypesMap.set("templates", TemplatesResource);

export default class Resources {

  constructor(src, dest, resources, options) {
    this[local.src] = src;
    this[local.dest] = dest;
    this[local.options] = options;
    this[local.resources] = resources;
  }

  getConfig() {
    return cloneDeep(this[local.resources]);
  }

  get(key) {
    let resources = this[local.resources];

    if (!this.has(key)) {
      throw new Error(`Resource "${key}" is not defined`);
    }

    return this.create(key, resources[key]);
  }

  getArray(startsWithString) {
    let resourceNames = Object.keys(this[local.resources]);
    let filtered = resourceNames.filter((name)=> {
      return startsWith(name, startsWithString)
    });
    return filtered.map(this.get.bind(this));
  }

  create(key, config) {
    let src = this[local.src];
    let dest = this[local.dest];
    let options = this[local.options];
    let type = key.split("-")[0];
    let resourceClass = (resourceTypesMap.has(type)) ? resourceTypesMap.get(type) : Resource;

    return new resourceClass(src, dest, key, config, options);
  }

  has(key) {
    let resources = this[local.resources];
    return resources[key]
  }
}
