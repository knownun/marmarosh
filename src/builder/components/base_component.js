import fs from "fs";
import pug from "jade";
import yaml from "js-yaml";
import {sync as globSync} from "glob";

import has from "lodash/has";
import pick from "lodash/pick";
import getter from "lodash/get";
import setter from "lodash/set";
import union from "lodash/union";
import merge from "lodash/merge";
import forOwn from "lodash/forOwn";
import isArray from "lodash/isArray";
import isObject from "lodash/isObject";
import isString from "lodash/isString";
import isNumber from "lodash/isNumber";
import cloneDeep from "lodash/cloneDeep";
import isFunction from "lodash/isFunction";
import startsWith from "lodash/startsWith";
import isUndefined from "lodash/isUndefined";

import {resolve, join, dirname, basename} from "../../utils";

let local = {
  src: Symbol("src"),
  name: Symbol("name"),
  type: Symbol("type"),
  place: Symbol("place"),
  theme: Symbol("theme"),
  config: Symbol("config"),
  configPath: Symbol("configPath"),
  clientConfig: Symbol("clientConfig"),
  bodyInstance: Symbol("bodyInstance"),
  templateLocals: Symbol("templateLocals")
};

export default class Base {

  constructor(config, overrideConfigObj, childInstance) {
    this.saveConfig(config, overrideConfigObj);
    if (overrideConfigObj) this.updateConfig(overrideConfigObj);
    if (childInstance) this.setBodyInstance(childInstance);
    this.initTemplateLocals();
  }

  static isValidConfig(input) {
    let output = false;
    if (
      has(input, "name") &&
      has(input, "src") &&
      has(input, "config") &&
      has(input, "configPath")
    ) {
      output = true;
    }
    return output;
  }

  static merge(input, sources) {
    let output = cloneDeep(input);
    return merge(output, sources);
  }

  static readConfig(url, overrideObj) {
    let out = null;
    let theme = getter(overrideObj, "route.theme");
    if (isString(url)) {
      let configPath = resolve(url);
      let src = dirname(url);
      let type = basename(dirname(src));
      let name = basename(src);

      if (theme) {
        let theme_mask = resolve(join(src, "**", theme + ".yml"));
        let theme_files = globSync(theme_mask);
        configPath = (theme_files.length) ? theme_files[0] : configPath;
      }

      let config = yaml.safeLoad(fs.readFileSync(configPath, "utf8")) || {};
      out = {name, src, config, configPath, type};
    }
    return out;
  }

  get hasIndexJS() {
    let filePath = resolve(join(this.getSrc(), "index.js"));
    let jsxFilePath = resolve(join(this.getSrc(), "index.jsx"));
    return fs.existsSync(filePath) || fs.existsSync(jsxFilePath);
  }

  get serverConfigurations() {
    let obj = this.getConfig("route.serverConfigurations");
    return merge(obj, {"components": this._JSOptions});
  }

  updateConfig(sources) {
    if (sources) {
      let config = this.getConfig();
      config = Base.merge(config, sources);
      this.setConfig(config);
      this.setTheme(getter(config, "route.theme"));
    }
    return this;
  }

  saveConfig(configPath, overrideObj) {
    let data = Base.readConfig(configPath, overrideObj);
    if (Base.isValidConfig(data)) {
      this[local.src] = data.src;
      this[local.name] = data.name;
      this[local.type] = data.type;
      this[local.config] = data.config;
      this[local.configPath] = data.configPath;
    } else {
      throw new Error("@readConfig method should be return { name, src, config, configPath}");
    }
  }

  getConfig(path) {
    let cfg = this[local.config];
    return path ? getter(cfg, path) : cfg;
  }

  setConfig(obj) {
    this[local.config] = obj;
  }

  getName() {
    return this[local.name];
  }

  getType() {
    return this[local.type];
  }

  getConfigPath() {
    return this[local.configPath];
  }

  getSrc() {
    return this[local.src];
  }

  readTemplate(theme) {
    return this.readTemplateForTheme(theme) || this.readTemplateForTheme("main") || null;
  }

  readTemplateForTheme(theme) {
    let compilerFn = pug.compileFile;
    let compileOptions = {
      pretty: true,
      self: true
    };
    let filePath = this.getTemplatePathForTheme(theme);
    return filePath ? compilerFn(filePath, compileOptions) : null;
  }

  getTemplatePathForTheme(theme) {
    let mask = resolve(join(this.getSrc(), "**", theme + ".jade"));
    let files = globSync(mask);
    return (files.length) ? files[0] : null;
  }

  hasTemplateForTheme(theme) {
    return this.getTemplatePathForTheme(theme) ? true : false;
  }

  getConfigPathForTheme(theme) {
    let mask = resolve(join(this.getSrc(), "**", theme + ".yml"));
    let files = globSync(mask);
    return (files.length) ? files[0] : null;
  }

  hasConfigForTheme(theme) {
    return this.getConfigPathForTheme(theme) ? true : false;
  }

  getTemplate(theme) {
    let html = null;
    this.templateFn = this.readTemplate(theme);
    if (isFunction(this.templateFn)) {
      html = this.templateFn(this.getTemplateLocals());
    }
    return html;
  }

  getTemplateLocals(path) {
    return isUndefined(path) ? this[local.templateLocals] : getter(this[local.templateLocals], path);
  }

  setTemplateLocal(path, obj) {
    if (!this[local.templateLocals]) this[local.templateLocals] = {};
    setter(this[local.templateLocals], path, obj);
  }

  initTemplateLocals() {
    const config = this.getConfig();
    const Helpers = this.getConfig("builder.helpers");

    const helpers = this[local.templateLocals] = new Helpers(config);
    const addWidget = this.addWidgetToConfig;

    this.setTemplateLocal("include", helpers.include.bind(helpers, addWidget.bind(this)));
    this.setTemplateLocal("includeSet", helpers.includeSet.bind(helpers, addWidget.bind(this)));
  }

  addWidgetToConfig(name, typeName) {
    this.widgets = this.widgets || {};
    this.widgets[name] = {
      "default": typeName || name
    };
  }

  setBodyInstance(childInstance) {
    this[local.bodyInstance] = {
      instance: childInstance,
      html: childInstance.getHTML()
    };
    if (childInstance._JSOptions) {
      this.addJSOptions(childInstance, childInstance._JSOptions);
    }
  }

  getBodyInstance() {
    return this[local.bodyInstance];
  }

  getTheme() {
    return this[local.theme];
  }

  setTheme(value) {
    if (isString(value)) this[local.theme] = value;
  }

  addJSOptions(instance, name, options) {
    this._JSOptions = this._JSOptions || [];
    if (arguments.length == 2 && isArray(name)) {
      this._JSOptions = union(this._JSOptions, name);
    } else {
      let type = instance.getName();
      let component_type = instance.getType();
      let model = {};
      if (startsWith(type, "react")) {
        component_type = "react-" + component_type;
        model = pick(instance.getClientConfig(), "template_options", "strings", "images", "links");
      }
      this._JSOptions.push({name, type, component_type, options, model});
    }
  }

  parseAttributes(obj, type = "attr") {
    let output = "";
    if (isString(obj)) {
      output = obj;
    } else if (isObject(obj)) {
      forOwn(obj, (value, key) => {
        if (isString(value) || isNumber(value)) {
          if (type == "attr") {
            output += ` ${key}="${value}"`;
          } else if (type == "props") {
            output += `${key}:${value};`;
          }
        } else if (isObject(value)) {
          output += this.parseAttributes(value, "props");
        }
      });
    }
    return output
  }

  setPlace(value) {
    this[local.place] = value;
  }

  getPlace() {
    return this[local.place];
  }

  getHTML(theme) {
    return this.getTemplate(theme || this.getTheme());
  }

  getClientConfig() {
    let config = this.getConfig();
    let cache = this[local.clientConfig];
    if (!cache) {
      cache = {
        template_options: this.getPropsFrom(config.template_options, "default"),
        script_options: this.getPropsFrom(config.script_options, "default"),
        strings: this.getPropsFrom(config.strings, "default"),
        images: this.getPropsFrom(config.images, "default"),
        links: this.getPropsFrom(config.links, "default")
      };
    }
    return cache;
  }

  getPropsFrom(input, propertyPath) {
    let output = {};
    if (isObject(input)) {
      forOwn(input, (value, key) => {
        key = startsWith(key, "$") ? key.substr(1) : key;
        output[key] = (isObject(value) && propertyPath) ? getter(value, propertyPath) : value;
      });
    }
    return output;
  }

}
