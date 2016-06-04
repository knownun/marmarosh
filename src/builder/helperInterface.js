import cloneDeep from "lodash/cloneDeep";

let local = {
  component: Symbol("component")
};

export default class Interface {
  constructor(inst) {
    this[local.component] = inst;
  }

  get name() {
    return this[local.component].name;
  }

  get type() {
    return this[local.component].type;
  }

  get theme() {
    return this[local.component].theme;
  }

  get dir() {
    return this[local.component].src;
  }

  get config() {
    return cloneDeep(this[local.component].config);
  }

  set widget(value) {
    let {name, type} = value;
    this[local.component].addWidgetToConfig(name, type);
  }

}
