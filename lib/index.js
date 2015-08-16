var api = require('./api');
var chalk = require('chalk');
var config = require('./config').load();
var reference = require('./reference');

var program = require('commander');

program
  .version('0.0.1')
  .usage('[options] [kata-slug-or-id]')
  .option('-a, --attempt', 'Submit the kata for initial evaluation')
  .option('-f, --finalize', 'Submit the finalized kata')
  .option('-i, --info', 'Get kata information without beginning training')
  .option('-n, --next [strategy]', 'Starts training on a new kata chosen according to strategy [default]', 'default');

program.parse(process.argv);

(function() {
  if (program.info) {
    program.args.forEach(function(kata) {
      api.getChallenge(kata);
      return;
    }, this)
  }

  if (program.next) {
    if (typeof reference.train.strategies[program.next] === 'undefined') {
      console.log('Invalid strategy.  Available strategies:')
      for (var k in reference.train.strategies) {
        if (!reference.train.strategies.hasOwnProperty(k)) continue;
        console.log('%s - %s', chalk.cyan(k), reference.train.strategies[k]);
      }

      return;
    }

    api.trainNext(program.next)
  }
})();

