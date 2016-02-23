import isArray from "lodash/isArray";

import BaseBuilder from "../base-builder";
import Builder from "./builder";

let local = {
  processedConfig: Symbol("processed"),
  instance: Symbol("instance")
};

export default class TemplatesBuilder extends BaseBuilder {

  createConfig() {
    let config = this.config;

    if (!isArray(config.resources)) {
      config.resources = [config.resources];
    }

    return config.resources.map((resource)=>this.createChildConfig(resource));
  }

  createChildConfig(resource) {

    let root = this.config.src;

    let src = resource.src;
    let dest = resource.dest;

    let debug = !this.isProduction;
    let bail = this.isProduction;
    let serverReplace = resource.getConfig().serverReplaceVars;
    let themes = resource.getConfig().themes;

    return {
      root,
      src,
      dest,
      debug,
      themes,
      serverReplace,
      events: {
        done: ({percentage, msg})=> {
          this.emit("build.waiting", {key: resource.getKey(), percentage, msg});
        },
        end: ({files})=> {
          this.emit("build.end", {key: resource.getKey(), files});
        },
        error: ({message})=> {
          this.emit("build.error", {key: resource.getKey(), message});
        }
      }
    };
  }

  createInstance() {
    let config = this.createConfig();
    return new Builder(config);
  }

  getConfig() {
    if (!this[local.processedConfig]) {
      this[local.processedConfig] = this.createConfig();
    }
    return this[local.processedConfig];
  }

  getInstance() {
    if (!this[local.instance]) {
      this[local.instance] = this.createInstance();
    }
    return this[local.instance];
  }

  run(cb) {
    this.getInstance().run(cb);
  }
}
