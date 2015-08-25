import BaseResource from './base-resource';

import DevComponentClass from './marmarosh/development_component'
import ProdComponentClass from './marmarosh/production_component'

export default class MarmaroshResource extends BaseResource {
  get Development() {
    var marmarosh = this;
    return class Development extends DevComponentClass {
      constructor(config, override, child) {
        super(config, override, child);
        return this.getInstance(override)
      }

      getEnv() {
        return marmarosh.options
      }
    }
  }

  get Production() {
    var marmarosh = this;
    return class Production extends ProdComponentClass {
      getEnv() {
        return marmarosh.options
      }
    }
  }

  get options() {
    return {
      src: this.getSrc(),
      mask: this.getMask()
    }
  }

  getSrc() {
    return super.getSrc()[0]
  }

  getMask() {
    return super.getMask()[0]
  }
}




