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

    config.fallback = path.join(__dirname, "node_modules");

    return config;
  }
}
