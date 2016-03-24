import isArray from "lodash/isArray";
import isFunction from "lodash/isFunction";
import merge from "lodash/merge";

import ExtractTextPlugin from "extract-text-webpack-plugin";

import { sep, join, resolve } from "../../../utils/helpers";

import BaseConverter from "../base-converter";

let webpackLoaders = new Map;

webpackLoaders.set("babel", "babel");
webpackLoaders.set("traceur", "traceur-loader");
webpackLoaders.set("yaml", "json-loader!yaml-loader");
webpackLoaders.set("html", "html-loader");
webpackLoaders.set("json", "json-loader");
webpackLoaders.set("jade", "jade-loader");
webpackLoaders.set("less", "css-loader?-autoprefixer&sourceMap!less-loader?sourceMap");

export default class LoadersConverter extends BaseConverter {

  static getLoaderMethodName(loader) {
    return `get${ loader.charAt(0).toUpperCase() + loader.substr(1).toLowerCase() }Loader`;
  }

  static getLoader(pattern, loader) {
    let webpackLoader = webpackLoaders.get(loader);

    let config = pattern.replace(/\//g, sep).split("?");

    let test = config.shift() || null;
    let query = config.shift() || null;

    let converted = {
      test: new RegExp(test),
      loader: webpackLoader
    };

    if (query) {
      converted.query = query;
    }

    return converted;
  }

  static getBabelLoader(pattern, loader) {
    let originalConfig = LoadersConverter.getLoader(pattern, loader);
    originalConfig.exclude = /(node_modules|bower_components)(?!.*portal-frontend-.*)/;
    return originalConfig;
  }

  static getLessLoader(pattern, loader) {
    let originalConfig = LoadersConverter.getLoader(pattern, loader);

    let plugin = new ExtractTextPlugin("[name].css", {allChunks: true});
    this.addPlugin(plugin);
    originalConfig.loader = plugin.extract("style-loader", originalConfig.loader);

    return originalConfig;
  }

  addPlugin(plugin) {
    let plugins = this.plugins = this.plugins || [];
    plugins.push(plugin);
  }

  getPlugins() {
    return this.plugins || [];
  }

  getConfig(loaders) {
    let converted = [];

    if (loaders) {
      for (let loader of Object.keys(loaders)) {
        if (!webpackLoaders.has(loader)) {
          throw new Error(`Loader "${loader}" doest not exist`);
        }

        let loaderPattern = loaders[loader];
        let patterns = null;
        if (isArray(loaderPattern)) {
          patterns = loaderPattern;
        } else {
          patterns = [loaderPattern];
        }

        let customLoaderMethodName = LoadersConverter.getLoaderMethodName(loader);
        let customLoaderMethod = LoadersConverter[customLoaderMethodName] || null;
        let loaderMethod = isFunction(customLoaderMethod) ? customLoaderMethod.bind(this) : LoadersConverter.getLoader.bind(this);

        for (let pattern of patterns) {
          let loaderConfig = loaderMethod(pattern, loader);
          converted.push(loaderConfig);
        }
      }
    }

    return converted;
  }
}
