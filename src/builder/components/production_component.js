import getter from "lodash/get";
import forOwn from "lodash/forOwn";
import isObject from "lodash/isObject";
import startsWith from "lodash/startsWith";

import Base from "./base_component";

export default class ProdComponent extends Base {

  getPropsFrom(input, propertyPath) {
    let output = {};
    if (isObject(input)) {
      forOwn(input, (value, key) => {
        if (!startsWith(key, "$")) {
          output[key] = (isObject(value) && propertyPath) ? getter(value, propertyPath) : value;
        }
      });
    }
    return output;
  }

  readTemplate(theme) {
    return this.readTemplateForTheme(theme) || null;
  }

}
