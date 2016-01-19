import DevToolServer from '../servers/marmarosh-server';

var local = {
  config: Symbol('config'),
  server: Symbol('server')
};

var serversMap = new Map();

serversMap.set('marmarosh-server', DevToolServer);

export default class Server {
  constructor(config) {

    this[local.config] = config;

    var serverName = config.server;

    var Server = serversMap.get(serverName);

    this[local.server] = new Server(config);
  }

  getConfig() {
    return this[local.config];
  }

  getApplicationServer() {
    return this[local.server];
  }

  run(cb) {
    this.getApplicationServer().run(cb);
  }
}
