import Webpack from "webpack";
import isArray from "lodash/isArray";

import WebpackLogPlugin from "./plugins/webpack-log-plugin";
import WebpackSplitByPathPlugin from "./plugins/webpack-split-plugin";

import CommonsChunkPlugin from "webpack/lib/optimize/CommonsChunkPlugin";

import BaseBuilder from "../base-builder";

import LoadersConverter from "./converters/loaders";
import PreloadersConverter from "./converters/preloaders";
import OutputConverter from "./converters/output";
import ResolveConverter from "./converters/resolve";
import OptimizeConverter from "./converters/optimize";

import EntryConverter from "./converters/entry";

import webpackScriptsPreset from "./presets/webpack-scripts";
import webpackStylesPreset from "./presets/webpack-styles";

import { join, resolve as res } from "../../utils/helpers";

let webpackPresets = new Map;

webpackPresets.set("webpack-scripts", webpackScriptsPreset);
webpackPresets.set("webpack-styles", webpackStylesPreset);

let local = {
  processedConfig: Symbol("processed"),
  instance: Symbol("instance")
};

export default class WebpackBuilder extends BaseBuilder {

  createConfig() {
    let config = this.config;

    if (!isArray(config.resources)) {
      config.resources = [config.resources];
    }

    return config.resources.map(this.createChildConfig.bind(this));
  }

  createChildConfig(resource) {

    let preset = webpackPresets.get(resource.preset);

    let src = this.config.src;
    let dest = this.config.dest;

    let debug = !this.isProduction;
    let bail = this.isProduction;
    let devtool = resource.devtool;
    let target = resource.target;

    let resourceSrc = resource.src;
    let resourceRelativeDest = resource.relativeDest;

    let entryConverter = new EntryConverter(src, dest);
    let entry = entryConverter.getConfig(resourceSrc, resourceRelativeDest);

    let loadersConverter = new LoadersConverter(src, dest);
    let loaders = loadersConverter.getConfig(preset.loaders);
    let loadersPlugins = loadersConverter.getPlugins();

    let preloadersConverter = new PreloadersConverter(src, dest);
    let preloaders = preloadersConverter.getConfig(preset.preloaders);

    let outputConverter = new OutputConverter(src, dest);
    let output = outputConverter.getConfig(resource.output);

    let resolveConverter = new ResolveConverter(src, dest);
    let resolve = resolveConverter.getConfig(resource.alias, resource.resolve, resource.extensions);

    // plugins
    let optimizeConverter = new OptimizeConverter(src, dest);
    let optimize = optimizeConverter.getConfig(!debug);

    let config = {
      bail,
      devtool,
      target,
      output,
      debug,
      plugins: [],
      module: {}
    };

    if (resolve) {
      config.resolve = resolve;
    }

    if (entry) {
      config.entry = entry;
    }

    if (loaders) {
      config.module.loaders = loaders;
    }

    if (loadersPlugins) {
      config.plugins = config.plugins.concat(loadersPlugins);
    }

    if (preloaders) {
      config.module.preLoaders = preloaders;
    }

    if (optimize) {
      config.plugins.push(optimize);
    }

    /**
     * console log Plugin. apply "done" and "invalid"
     */
    let logPlugin = new WebpackLogPlugin((event, params) => {
      this.emit(event, params);
    }, {key: resource.getKey(), extendedFormat: resource.stats});

    config.plugins.push(logPlugin);

    config.plugins.push(new Webpack.ProvidePlugin({
      $: "jquery"
    }));

    config.plugins.push(new Webpack.optimize.DedupePlugin());

    config.plugins.push(new Webpack.ProgressPlugin((percentage, msg) => {
      this.emit("build.waiting", {key: resource.getKey(), percentage, msg});
    }));

    let preDefinedVars = {
      DEBUG: JSON.stringify(JSON.parse(this.env != "production" || "false")),
      PRODUCTION: JSON.stringify(JSON.parse(this.env == "production" || "false")),
      "process.env.NODE_ENV": JSON.stringify(JSON.parse(this.env || "development"))
    };

    config.plugins.push(new Webpack.DefinePlugin(preDefinedVars));

    let split = resource.getOptions("split");

    if (split) {
      let relativeTarget = resource.getRelativeTarget();
      let splitConfig = [];
      for (let name of Object.keys(split)) {
        splitConfig.push({
          name: join(relativeTarget, name),
          path: split[name]
        });
      }
      console.dir(splitConfig, {colors: 1});
      let splitPlugin = new WebpackSplitByPathPlugin(splitConfig);
      config.plugins.push(splitPlugin);
    }

    return config;
  }

  createInstance() {
    let config = this.createConfig();
    return Webpack(config);
  }

  getConfig() {
    if (!this[local.processedConfig]) {
      this[local.processedConfig] = this.createConfig();
    }
    return this[local.processedConfig];
  }

  getWebpackInstance() {
    if (!this[local.instance]) {
      this[local.instance] = this.createInstance();
    }
    return this[local.instance];
  }

  run(cb) {
    this.getWebpackInstance().run(cb);
  }
}


