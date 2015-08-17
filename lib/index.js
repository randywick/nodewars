var api = require('./api');
var chalk = require('chalk');
var config = require('./config').load();
var modeler = require('./modeler');
var reference = require('./reference');

var program = require('commander');

program
  .version('0.0.1');

program
  .command('config')
  .alias('c')
  .description('Activate guided configuration')
  .action(function() {
    config.build();
  });


program
  .command('info <slugOrId>')
  .alias('i')
  .description('Retrieve information about a kata')
  .option('-s, --save', 'Save the kata\'s metadata and frame a project')
  .action(function(val, opt) {
    var save = typeof opt.save !== 'undefined';
    api.getChallenge(val, save).then(modeler.renderKataInfo);
  });


program
  .command('next [strategy]')
  .alias('n')
  .description('Create project and begin training session with a kata programmatically selected according to strategy')
  .action(function(strategy) {
    if (typeof strategy === 'undefined') strategy = 'default';
    if (typeof reference.train.strategies[strategy] === 'undefined') {
          console.log('Invalid strategy.  Available strategies:');
          for (var k in reference.train.strategies) {
            if (!reference.train.strategies.hasOwnProperty(k)) continue;
            console.log('%s - %s', chalk.cyan(k), reference.train.strategies[k]);
          }

          return;
        }

        api.trainNext(strategy)
  });

program
  .command('train <slugOrId>')
  .alias('t')
  .description('Create project and begin training session with specified kata')
  .action(function(slugOrId) {
    api.train(slugOrId)
  });


program
  .command('submit <slugOrId>')
  .alias('s')
  .description('Submit project for final evaluation')
  .action(function(slugOrId) {
    api.attemptSolution(slugOrId);
  });


program
  .command('list [state]')
  .alias('l')
  .description('Display a list of local katas, optionally restricted to [state]')
  .action(function(state) {
    modeler.renderChallengeList(state);
  });



program
  .command('edit <slugOrId>')
  .alias('e')
  .description('Launch your editor to view the challenge project')
  .action(function(slugOrId) {
    modeler.openWithEditor(slugOrId);
  });





program.parse(process.argv);