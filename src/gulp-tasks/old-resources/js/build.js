import Base from '../../base-task';

export default class Build extends Base {

  constructor(gulp, sintez) {
    super(gulp, sintez);
    var appBuilder = this.sintez.getBuilder().getApplicationBuilder();


    //appBuilder.remove('build.end').on('build.end', (params) => {
    //  var message = `%#${params.counter}% application was packed. Elapsed time %${params.time}%s. `;
    //  message += `Number of scripts %${params.scripts.length}%`;
    //  this.logger.log(message);
    //  var warnings = params.warnings;
    //  if (warnings && !!warnings.length) {
    //    this.logger.log('------------------');
    //    this.logger.log('*** %WARNINGS% ***');
    //    for (var warning of warnings) {
    //      this.logger.log(`at %${warning.module.issuer}%`);
    //      this.logger.log(`requested %"${warning.module.rawRequest}"% ("${warning.module.userRequest}")`);
    //      this.logger.log(warning.message.replace(/(\r\n|\n|\r)/gm, ' '));
    //    }
    //    this.logger.log('------------------');
    //  }
    //});
    //appBuilder.remove('build.error').on('build.error', ({errors}) => {
    //  for (var error of errors) {
    //    this.logger.error(`- ${error.message}`);
    //  }
    //});
  }

  getDefaultTaskName() {
    return 'js:build';
  }

  run(done) {
    this.sintez.getBuilder().run((err) => {
      done(err);
    });
  }
}
