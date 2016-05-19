import fs from "fs";
import pug from "jade";
import yaml from "js-yaml";
import {sync as globSync} from "glob";

import has from "lodash/has";
import getter from "lodash/get";
import setter from "lodash/set";
import isObject from "lodash/isObject";
import isNumber from "lodash/isNumber";
import isFunction from "lodash/isFunction";
import isUndefined from "lodash/isUndefined";
import isArray from "lodash/isArray";
import isString from "lodash/isString";
import cloneDeep from "lodash/cloneDeep";
import startsWith from "lodash/startsWith";
import forOwn from "lodash/forOwn";
import merge from "lodash/merge";
import union from "lodash/union";
import pick from "lodash/pick";

import {resolve, join, dirname, basename} from "../../utils/helpers";

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

  isValidConfig(input) {
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

  updateConfig(sources) {
    if (sources) {
      let config = this.getConfig();
      config = this.merge(config, sources);
      this.setConfig(config);
      this.setTheme(getter(config, "route.theme"));
    }
    return this;
  }

  saveConfig(configPath, overrideObj) {
    let data = this.readConfig(configPath, overrideObj);
    if (this.isValidConfig(data)) {
      this[local.src] = data.src;
      this[local.name] = data.name;
      this[local.type] = data.type;
      this[local.config] = data.config;
      this[local.configPath] = data.configPath;
    } else {
      throw new Error("@readConfig method should be return { name, src, config, configPath}");
    }

  }

  merge(input, sources) {
    let output = cloneDeep(input);
    return merge(output, sources);
  }

  getConfig(path) {
    let cfg = this[local.config];
    return path ? getter(cfg, path) : cfg
  }

  setConfig(obj) {
    this[local.config] = obj
  }

  getName() {
    return this[local.name]
  }

  getType() {
    return this[local.type]
  }

  getConfigPath() {
    return this[local.configPath]
  }

  getSrc() {
    return this[local.src]
  }

  readTemplate(theme) {
    return this.readTemplateForTheme(theme) || this.readTemplateForTheme("main") || null;
  }

  readTemplateForTheme(theme, name) {
    let compilerFn = pug.compileFile;
    let compileOptions = {
      pretty: true,
      self: true
    };
    let filePath = this.getTemplatePathForTheme(theme);
    return filePath ? compilerFn(filePath, compileOptions) : null;
  }

  get hasIndexJS() {
    let filePath = resolve(join(this.getSrc(), "index.js"));
    let jsxFilePath = resolve(join(this.getSrc(), "index.jsx"));
    return fs.existsSync(filePath) || fs.existsSync(jsxFilePath);
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
    let html = "";
    if (!this.templateFn) {
      this.templateFn = this.readTemplate(theme);
    }
    if (isFunction(this.templateFn)) {
      html = this.templateFn(this.getTemplateLocals());
    }
    return html;
  }

  getTemplateLocals(path) {
    return isUndefined(path) ? this[local.templateLocals] : getter(this[local.templateLocals], path)
  }

  setTemplateLocal(path, obj) {
    if (!this[local.templateLocals]) this[local.templateLocals] = {};
    setter(this[local.templateLocals], path, obj);
  }

  renderString(prod, dev) {
    return dev || ""
  }

  initTemplateLocals() {

    this.setTemplateLocal("include", this.include.bind(this));
    this.setTemplateLocal("getString", this.getString.bind(this));
    this.setTemplateLocal("getOption", this.getOption.bind(this));
    this.setTemplateLocal("getLink", this.getLink.bind(this));
    this.setTemplateLocal("getImageURL", this.getImageURL.bind(this));

    this.setTemplateLocal("includeBody", this.includeBody.bind(this));
    this.setTemplateLocal("includeServerHelper", this.includeServerHelper.bind(this));

    // for layout
    this.setTemplateLocal("includeMeta", this.includeMeta.bind(this));
    this.setTemplateLocal("includeCSS", this.includeCSS.bind(this));
    this.setTemplateLocal("includeJS", this.includeJS.bind(this));
    this.setTemplateLocal("includeJSOptions", this.includeJSOptions.bind(this));
    this.setTemplateLocal("getHtmlClass", this.getHtmlClass.bind(this));

    this.setTemplateLocal("render", this.renderString.bind(this));

    this.setTemplateLocal("includeSet", this.includeSet.bind(this));
    this.setTemplateLocal("if", this.IF.bind(this));
    this.setTemplateLocal("ifnot", this.IF_NOT.bind(this));
    this.setTemplateLocal("endif", this.ENDIF.bind(this));

    this.setTemplateLocal("itemIndex", this.itemIndex.bind(this));

  }

  getHtmlClass() {
    return ""
  }

  include() {
    throw new Error("@include method should be implemented")
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
    return this[local.theme]
  }

  setTheme(value) {
    if (isString(value)) this[local.theme] = value
  }

  get serverConfigurations() {
    let obj = this.getConfig("route.serverConfigurations");
    return merge(obj, {"components": this._JSOptions})
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
      output = obj
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

  includeBody() {
    let ins = this.getBodyInstance();
    return (ins && ins.html) ? ins.html : "$BODY$";
  }

  getString(name) {
    let config = this.getClientConfig();
    return getter(config, `strings.${name}`)
  }

  getLink(name) {
    let config = this.getClientConfig();
    return getter(config, `links.${name}`)
  }

  getImageURL(name) {
    let config = this.getClientConfig();
    return getter(config, `images.${name}`)
  }

  getOption(name) {
    let config = this.getClientConfig();
    return getter(config, `template_options.${name}`)
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
      }
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

  includeCSS() {
    let out = "";
    let themes = this.getConfig("route.themes");

    themes.forEach((theme)=> {
      out += `<link rel=stylesheet href=/webpack/styles/${theme}.css />\n`;
    });

    return out
  }

  includeMeta() {
    return ""
  }

  includeJS() {
    return ""
  }

  includeJSOptions() {
    let data = JSON.stringify(this.serverConfigurations, null, 4);
    return `<script>window["serverConfigurations"] = ${data}</script>`
  }

  readConfig(url, overrideObj) {
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
      out = {name, src, config, configPath, type}
    }
    return out;
  }

  IF() {
    return ""
  }

  IF_NOT() {
    return ""
  }

  ENDIF() {
    return ""
  }

  itemIndex() {
    return Math.round(Math.random() + 1000);
  }

  includeServerHelper() {
    return ""
  }

}
