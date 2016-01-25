import isArray from "lodash/isArray";
import isFunction from "lodash/isFunction";
import merge from "lodash/merge";
import {join,resolve} from "path"

import { sep } from "../../../utils/helpers";

import BaseConverter from "../base-converter";

let webpackLoaders = new Map;

webpackLoaders.set("eslint", "eslint-loader");
webpackLoaders.set("less", "less-loader");

export default class PreloadersConverter extends BaseConverter {

  static getPreLoaderMethodName(loader) {
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

  static getEslintLoader(pattern, loader) {
    let originalConfig = PreloadersConverter.getLoader(pattern, loader);
    originalConfig.exclude = /(node_modules|bower_components)/;
    return originalConfig;
  }

  static getLessLoader(pattern, loader) {
    let originalConfig = PreloadersConverter.getLoader(pattern, loader);
    originalConfig.query = {
      paths: [
        join(resolve(this.src), "../"),
        join(resolve(this.src), "../libs"),
        join(resolve(this.src))
      ]
    };
    return originalConfig;
  }

  getConfig(loaders) {
    let converted = [];

    if (loaders) {
      for (let loader of Object.keys(loaders)) {
        if (!webpackLoaders.has(loader)) {
          throw new Error(`Preloader "${loader}" doest not exist`);
        }

        let loaderPattern = loaders[loader];
        let patterns = null;
        if (isArray(loaderPattern)) {
          patterns = loaderPattern;
        } else {
          patterns = [loaderPattern];
        }

        let customLoaderMethodName = PreloadersConverter.getPreLoaderMethodName(loader);
        let customLoaderMethod = PreloadersConverter[customLoaderMethodName] || null;
        let loaderMethod = isFunction(customLoaderMethod) ? customLoaderMethod.bind(this) : PreloadersConverter.getLoader.bind(this);

        for (let pattern of patterns) {
          let loaderConfig = loaderMethod(pattern, loader);
          converted.push(loaderConfig);
        }
      }
    }

    return converted;
  }
}
