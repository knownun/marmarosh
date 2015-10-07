import fs from 'fs'
import path from 'path'

import { sync as globSync } from 'glob'
import util from 'gulp-util'
import lo from 'lodash'
import mkdirp from 'mkdirp'
import yaml from 'js-yaml'

import Base from '../../base-task'
import BuildTask from '../js/build'

import CssCompileTask from './../css/compile'

export default class Task extends Base {

  constructor(gulp, sintez) {
    super(gulp, sintez);
    this.config = this.sintez.getConfig();
    this.jsBuildTask = new BuildTask(gulp, sintez);
    this.cssBuildTask = new CssCompileTask(gulp, sintez);
  }

  getDefaultTaskName() {
    return 'build';
  }

  get Component() {
    return this.resources.Production
  }

  get resources() {
    return this.sintez.getResources().get('components');
  }

  run() {
    this.buildComponents();
    this.buildScripts();
    this.buildStyles();
  }

  init() {
    this.run()
  }

  buildComponents() {
    var Constructor = this.Component;
    var components = this.getConfigs();
    var output = this.resources.getDest();
    components.forEach((filePath) => {
      var instance = new Constructor(path.normalize(filePath), {
        builder: {
          serverReplace: this.sintez.get("serverReplace")
        }
      });
      this.createCSHTML(instance, output);

      var themes = this.sintez.get("resources.css.themes");
      themes.forEach((theme)=> {
        if (lo.startsWith(theme, '?')) {
          var name = theme.substr(1);
          this.createCSHTML(instance, output, name);
        } else {

        }
      });

      this.createJSON(instance, output);
    });
    this.logger.log("Compiling templates");
  }

  buildStyles() {
    var start = (new Date).getTime();
    this.cssBuildTask.run(() => {
      var end = (new Date).getTime();
      this.logger.log(`Compiling styles - ${end - start}ms`);
    });
  }

  buildScripts() {
    var start = (new Date).getTime();
    this.jsBuildTask.run(() => {
      var end = (new Date).getTime();
      this.logger.log(`Compiling scripts - ${end - start}ms`);
    })
  }

  createFile(dir, fileName, data) {
    var folder = path.join(dir, path.dirname(fileName));
    mkdirp.sync(folder);
    fs.writeFileSync(path.join(dir, fileName), data, 'utf8');
  }

  getNewFilename(instance, ext, theme) {
    var name = instance.getName();
    var src = this.sintez.getSrc();
    var dir = new RegExp(`(.*)${src}(.*)`).exec(instance.getSrc())[2];
    return theme ? `${dir}/themes/${theme}/${name}.${ext}` : `${dir}/${name}.${ext}`
  }

  createCSHTML(instance, output, theme) {
    var name = this.getNewFilename(instance, "cshtml", theme);
    var data = instance.getHTML(theme || 'main');
    return data ? this.createFile(output, name, data) : false;
  }

  createJSON(instance, output) {
    var name = this.getNewFilename(instance, "json");
    var config = instance.getConfig();

    var getVars = this.getVars;

    var data = {};

    if (config.isMasterPage) {
      data.isMasterPage = config.isMasterPage
    }

    if (instance.hasIndexJS) {
      data.hasJs = true;
    }

    if (lo.startsWith(instance.getName(), 'react')) {
      data.isReact = true;
    }

    if (lo.isObject(config.template_options)) {
      data.template_options = getVars(config.template_options, ['default', 'values']);
    }

    if (lo.isObject(config.layout_options)) {
      data.layout_options = getVars(config.layout_options, ['default', 'values']);
    }

    if (lo.isObject(config.script_options)) {
      data.script_options = getVars(config.script_options, ['default', 'values']);
    }

    if (lo.isObject(config.strings)) {
      data.strings = getVars(config.strings, ['default'], 'default');
    }

    if (lo.isObject(config.images)) {
      data.images = getVars(config.images, ['default'], 'default');
    }

    if (lo.isObject(config.links)) {
      data.links = getVars(config.links, ['default'], 'default');
    }

    data.widgets = instance.widgets || {};

    if (lo.isObject(config.widgets)) {
      data.widgets = lo.merge(data.widgets, config.widgets);
    }

    return this.createFile(output, name, JSON.stringify(data, null, 2));
  }

  getConfigs() {
    var src = this.sintez.get("src");
    var mask = this.sintez.get("resources.components.mask");
    return globSync(path.join(src, mask)).map((url) => path.resolve(url));
  }

  getVars(input, properties, map) {
    var output = {};
    lo.forOwn(input, (value, key) => {
      if (!lo.startsWith(key, '$')) {
        if (lo.isObject(value)) {
          var obj = null;
          if (!lo.isUndefined(value)) {
            obj = properties ? lo.pick(value, properties) : value;
            if (!lo.isEmpty(obj)) {
              output[key] = obj
            }
          }
        } else if (!lo.isEmpty(value)) {
          output[key] = value
        }
      }
    });

    if (map) {
      lo.mapValues(output, map)
    }

    return output;
  }

}
