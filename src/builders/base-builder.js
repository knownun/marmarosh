import events from 'events';

import isFunction from "lodash/isFunction";

var local = {
  events: Symbol('events'),
  available: ['build.start', 'build.end', 'build.error']
};

export default class BaseBuilder {
  constructor(builderConfig) {
    this.config = builderConfig;
    this[local.events] = new events.EventEmitter();
    this[local.events].setMaxListeners(0);
  }

  run(cb) {
    throw new Error('@run method should be implemented');
  }

  getConfig() {
    throw new Error('@getConfig method should be implemented');
  }

  on(event, fn) {
    this[local.events].on(event, fn);
    return this;
  }

  once(event, fn) {
    this[local.events].once(event, fn);
    return this;
  }

  remove(event) {
    this[local.events].removeAllListeners(event);
    return this;
  }

  emit(event, params) {
    this[local.events].emit(event, params);
    return this;
  }

  get env() {
    return process.env.NODE_ENV;
  }

  get isProduction() {
    return process.env.NODE_ENV == "production";
  }
}
