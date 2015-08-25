import http from 'http'

import wdm from 'webpack-dev-middleware'
import webpack from 'webpack'

import { log } from 'gulp-util'

import App from './app'

export default class DevToolServer {
  constructor(config) {

    this.app = new App(config);

    if (config.builder) {
      var wp = config.builder.getWebpackInstance({
        output: {
          path: '/'
        }
      });
      this.app.use("/webpack", wdm(wp, {noInfo: true}));
    }

    this.app.use((req, res) => {
      res.status(404).send('404 - Not found')
    });

    this.config = config;
    this.server = http.createServer(this.app);

  }

  run(done) {
    var port = this.app.get('port');
    var host = this.app.get('host');

    this.server.listen(port, host, () => {
      log(`Server has been started - http://${host}:${port}/`);
      done()
    });

    this.server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      var bind = 'Port ' + port;
      switch (error.code) {
        case 'EACCES':
          log(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          log(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  }

  getConfig() {
    return this.config;
  }

}
