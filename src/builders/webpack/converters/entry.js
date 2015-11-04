import BaseConverter from '../base-converter';

export default class EntryConverter extends BaseConverter {
  getConfig(src, output) {
    var out = {};

    var bundle = output.split('.')[0];
    out[bundle] = src;

    out["scripts/start"] = [
      "app/start"
    ];

    return out;
  }
}
