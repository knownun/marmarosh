import fs from "fs";
import pug from "jade";
import yaml from "js-yaml";
import glob from "glob";

import getter from "lodash/get";
import merge from "lodash/merge";
import memoize from "lodash/memoize";
import isObject from "lodash/isObject";
import isString from "lodash/isString";
import isFunction from "lodash/isFunction";

import Interface from "./helperInterface";

import {resolve, join, dirname, basename, extname} from "../utils";

let local = {
  src: Symbol("src"),
  name: Symbol("name"),
  type: Symbol("type"),
  theme: Symbol("theme"),
  config: Symbol("config"),
  helpers: Symbol("helpers"),
  configPath: Symbol("configPath"),
  helperInterface: Symbol("helperInterface"),
  options: Symbol("options")
};

const templateExt = "jade";
const configExt = "yml";
const compilerFn = pug.compileFile;
const compilerOptions = {
  pretty: true,
  self: true
};

export default class Component {

  constructor(options = {}) {
    this[local.helperInterface] = new Interface(this);
    this[local.options] = {
      configExt: options.configExt || configExt,
      templateExt: options.templateExt || templateExt,
      compilerFn: options.compilerFn || compilerFn,
      compilerOptions: options.compilerOptions || compilerOptions
    };
  }

  get config() {
    return this[local.config];
  }

  get name() {
    return this[local.name];
  }

  get type() {
    return this[local.type];
  }

  get theme() {
    return this[local.theme];
  }

  get src() {
    return this[local.src];
  }

  get hasIndexJS() {
    let filePath = resolve(join(this.src, "index.js"));
    let jsxFilePath = resolve(join(this.src, "index.jsx"));
    return fs.existsSync(filePath) || fs.existsSync(jsxFilePath);
  }

  static searchConfigFile(config, theme) {
    return new Promise((done, failed) => {
      let configPath = resolve(config);
      let src = dirname(config);
      let type = basename(dirname(src));
      let name = basename(src);
      let ext = extname(config);
      if (theme) {
        let theme_mask = resolve(join(src, "**", `${theme}.${ext}`));
        glob(theme_mask, (err, result) => {
          if (err) return failed(err);
          configPath = (result.length) ? result[0] : configPath;
          done({configPath, src, type, name});
        });
      } else {
        done({configPath, src, type, name});
      }
    });
  }

  static readConfig(config, theme) {
    return new Promise((done, failed)=> {
      if (isString(config)) {
        let searchConfigFile = Component.searchConfigFile(config, theme);
        searchConfigFile.then(({configPath, src, type, name}) => {
          fs.readFile(configPath, "utf8", (err, data) => {
            if (err) {
              failed(err);
            } else {
              let config = yaml.safeLoad(data) || {};
              done({configPath, src, type, name, theme, config});
            }
          });
        }, (err) => {
          failed(err);
        });
      } else {
        failed(new Error("Config path must be a string"));
      }
    });
  }

  static isValidConfig(input) {
    if (isString(input.name) && isString(input.src) && isObject(input.config) && isString(input.configPath)) {
      return true;
    } else {
      throw new Error("@readConfig method should be return {name, src, config, configPath}");
    }
  }

  load(config, theme = "main") {
    return new Promise((resolve, reject) => {
      Component.readConfig(config, theme).then((data) => {
        resolve(data);
      }, (err) => {
        reject(err);
      });
    }).then((data) => {
      if (Component.isValidConfig(data)) {
        this.setConfig(data);
        return Promise.resolve({component: this});
      } else {
        return Promise.reject(new Error("Invalid config in file"));
      }
    });
  }

  setConfig({configPath, src, type, name, config, theme}) {
    this[local.config] = config;
    this[local.src] = src;
    this[local.name] = name;
    this[local.type] = type;
    this[local.theme] = theme;
    this[local.configPath] = configPath;
    this[local.config].hasJS = this.hasIndexJS;
  }

  setHelpers(helpers) {
    Object.keys(helpers).forEach((helperName) => {
      let helperFN = helpers[helperName];
      this[local.helpers] = this[local.helpers] || {};
      if (isFunction(helperFN)) {
        this[local.helpers][helperName] = helperFN.bind(this[local.helperInterface]);
      } else {
        throw new Error(`Helper ${helperName} must be a function`);
      }
    });
  }

  getTemplate(theme = "main") {
    return this.getTemplateCompiler(theme).then((compiler)=> {
      let data = compiler(this[local.helpers]);
      return Promise.resolve({
        component: this,
        data
      });
    });
  }

  getTemplatePath(theme = "main") {
    return this.findFileInComponentFolder(theme, this[local.options].templateExt);
  }

  getConfigPath(theme = "main") {
    return this.findFileInComponentFolder(theme, this[local.options].configExt);
  }

  findFileInComponentFolder(name, ext) {
    return new Promise((done, failed)=> {
      let fileName = `${name}.${ext}`;
      let mask = resolve(join(this.src, "**", fileName));
      glob(mask, (err, result) => {
        if (err) return failed(err);
        if (result.length && isString(result[0])) {
          done(result[0]);
        } else {
          failed(new Error(`Can not find file "${fileName}" template for component "${this.name}"`));
        }
      });
    });
  }

  getTemplateCompiler(theme) {
    return this.getTemplatePath(theme).then((filePath)=> {
      let result = filePath ? compilerFn(filePath, compilerOptions) : null;
      return result ? Promise.resolve(result) : Promise.reject(new Error("compile fn error"));
    });
  }

  getConfigOption(path) {
    return path ? getter(this[local.config], path) : null;
  }

  getAvailableThemes(themesList) {
    if (Array.isArray(themesList)) {
      let iterator = this.getThemeSearchResults.bind(this);
      let themesSearchPromises = themesList.map(iterator);
      return Promise.all(themesSearchPromises)
        .then((data)=> {
          return Promise.resolve({
            component: this, data
          });
        });
    } else {
      return Promise.reject(new Error("Invalid themes list"));
    }
  }

  getThemeSearchResults(theme) {
    return new Promise((done)=> {
      this.getTemplatePath(theme).then((path)=> {
        done({
          theme,
          isAvailable: isString(path)
        });
      }, () => {
        done({
          theme,
          isAvailable: false
        });
      });
    });
  }

  updateConfig(sources) {
    if (sources) {
      this[local.config] = merge(this[local.config], sources);
      this[local.theme] = this.getConfigOption("route.theme");
    }
  }

  addWidgetToConfig(name, type) {
    this.widgets = this.widgets || {};
    this.widgets[name] = {"default": type || name};
  }

  getIncludedWidgets() {
    return this.widgets;
  }

}
