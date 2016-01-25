import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import path from 'path';

import BaseConverter from '../base-converter';

export default class ResolveCoverter extends BaseConverter {

  getConfig(alias, resolve, extensions) {
    var config = null;

    if (!isEmpty(alias) && isObject(alias)) {
      config = config || {};
      config.alias = alias;
    }

    if (!isEmpty(resolve) && isArray(resolve)) {
      config = config || {};
      config.modulesDirectories = resolve;
    }

    if (!isEmpty(extensions) && isArray(extensions)) {
      config = config || {};
      config.extensions = [""].concat(extensions);
    }

    //config.fallback = [
    //  path.resolve("."), //project modules
    //  path.resolve("./libs"), //project modules
    //  path.resolve("./src"), //project modules
    //  path.resolve("./node_modules"), //project modules
    //  path.resolve(__dirname, "../../../../node_modules") // marmarosh modules
    //];

    return config;
  }
}
