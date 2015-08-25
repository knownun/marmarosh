import path from 'path';

import express from 'express';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';

import router from './routes/index';

export default class App {
  constructor(options) {
    this.app = express();
    this.setup(options);
    return this.app;
  }

  setup(options) {

    this.app.set('port', options.port);
    this.app.set('host', options.host);

    this.app.set('cssConfig', options.cssConfig);

    this.app.set('view engine', 'jade');
    this.app.set('views', path.join(__dirname, 'views'));

    this.app.set('view cache', false);
    this.app.set('x-powered-by', false);

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: false}));

    this.app.use(favicon(path.join(__dirname, 'public/favicon.ico')));

    this.app.use(router(options));

  }
};
