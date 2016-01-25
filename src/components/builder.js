import { join } from "path";

import WebpackBuilder from  "../builders/webpack/webpack-builder";
import TemplatesBuilder from  "../builders/marmarosh/templates-builder";

var local = {
  config: Symbol("config"),
  builder: Symbol("builder")
};

var builders = new Map;

builders.set("webpack", WebpackBuilder);
builders.set("marmarosh-templates", TemplatesBuilder);

export default class Builder {

  constructor(name, resources) {
    this[local.config] = resources;

    if (!builders.has(name)) {
      throw new Error(`builder type "${name}" does not registered`);
    }

    var Builder = builders.get(name);

    this[local.builder] = new Builder(resources);
  }

  getConfig() {
    return this[local.config];
  }

  getApplicationBuilder() {
    return this[local.builder];
  }

  run(cb) {
    this.getApplicationBuilder().run(cb);
  }
}
