import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import assign from 'lodash/assign';


import { resolve } from 'path';

import BaseConverter from '../base-converter';


export default class OutputCoverter extends BaseConverter {
  getConfig(customOutputConfig) {
    return assign({
      path: resolve(this.dest),
      filename: "[name].js",
      chunkFilename: "[name].js",
      pathinfo: true
    }, customOutputConfig);
  }
}
