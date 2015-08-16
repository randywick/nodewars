/**
 * Module dependencies
 */
var chalk = require('chalk');
var fs = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var prompt = require('prompt');


/**
 * @module nodewars/config
 */
module.exports = exports;

/** @type {string} */
exports.username = '';
/** @type {string} */
exports.apiKey = '';
/** @type {string} */
exports.projectDir = '';
/** @type {string} {@see nodewars/reference.train.languages} */
exports.language = 'javascript';


/**
 *
 * @returns {bluebird|exports|module.exports}
 */
function build() {
  console.log('It\'s probably your first time.  Let\'s get some basic information.');
  console.log('');

  var schema = {
    properties: {
      username: {
        description: 'Codewars username\n',
        required: true
      },
      apiKey: {
        description: 'Codewars API key (available at https://www.codewars.com/users/edit)\n',
        required: true
      },
      projectDir: {
        description: 'Where would you like to store project data?\n',
        required: true,
        default: path.resolve(process.cwd(), 'katas')
      }
    }
  };

  return new Promise(function(resolve) {

    prompt.message = '';
    prompt.start();
    prompt.get(schema, function(err, result) {
      console.log('');
      console.log('Does this look correct?');
      console.log('');
      console.log(result);
      console.log('');

      var property = {
        name: 'confirm',
        message: 'yes/no',
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'yes'
      };
      prompt.get(property, function(err, confirm) {

        if (confirm.confirm === 'yes') {
          var filename = path.resolve(process.cwd(), 'nwconfig.json');
          var data = JSON.stringify(result);
          fs.writeFileSync(filename, data);
          return resolve();
        }

        build().then(resolve);
      })
    });

  })
}

/**
 *
 * @returns {exports}
 */
exports.load = function() {
  var filename = path.resolve(process.cwd(), 'nwconfig.json');
  var result = {};
  try {
    var config = fs.readFileSync(filename);
    result = JSON.parse(config);
    fs.ensureDirSync(result.projectDir);
  } catch (e) {
    console.log(chalk.yellow('Uh oh!'), 'Unable to load configuration.');
    build();
    this.load();
  }

  for (var k in result) {
    if (result.hasOwnProperty(k)) this[k] = result[k];
  }

  return this;
};
