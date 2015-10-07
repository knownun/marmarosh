import Base from '../../base-task';

export default class Build extends Base {

  getDefaultTaskName() {
    return 'js:build';
  }

  run(done) {
    var builder = this.sintez.getBuilder();
    var applicationBuilder = builder.getApplicationBuilder();

    applicationBuilder.once('build.start', () => {
      console.log("build.start")
    });

    applicationBuilder.once('build.end', (params) => {

      var message = `%#${params.counter}% application was packed. Elapsed time %${params.time}%s. `;
      message += `Number of scripts %${params.scripts.length}%`;

      this.logger.log(message);

      var warnings = params.warnings;
      if (warnings && !!warnings.length) {
        this.logger.log('------------------');
        this.logger.log('*** %WARNINGS% ***');
        for (var warning of warnings) {
          this.logger.log(`at %${warning.module.issuer}%`);
          this.logger.log(`requested %"${warning.module.rawRequest}"% ("${warning.module.userRequest}")`);
          this.logger.log(warning.message.replace(/(\r\n|\n|\r)/gm, ' '));
        }

        this.logger.log('------------------');
      }
    });

    applicationBuilder.once('build.error', ({errors}) => {
      for (var error of errors) {
        this.logger.error(`- ${error.message}`);
      }
    });

    builder.run((err) => {
      done(err);
    });
  }
}
