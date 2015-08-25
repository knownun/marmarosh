export default class BaseServer {
  constructor(serverConfig) {
    this.builder = serverConfig.builder.getApplicationBuilder();
    this.config = serverConfig;
  }

  run(cb) {
    throw new Error('@run method should be implemented');
  }

  getConfig() {
    throw new Error('@getConfig method should be implemented');
  }
}