import assign from "lodash/assign";

import { resolve } from "../../../utils/helpers";

import BaseConverter from "../base-converter";

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
