var chalk = require('chalk');
var config = require('./config');
var path = require('path');
var reference = require('./reference');

module.exports = exports;


/**
 * Splits long strings to not more than 80 characters per line
 *
 * @param {string} str
 * @param {number} maxCount
 * @returns {Array} an array of lines
 */
function breakLines(str, maxCount) {

  maxCount = maxCount || 0;

  str = str.replace(/<br\s?\/?>/g, '\n');
  str = str.replace(/\n/g, ' ');
  //if (str.indexOf('\n') !== -1) return str.split('\n');

  var lines = [];
  var line = [];
  var chars = 0;
  var totalChars = 0;
  str = str.split(' ');
  while (str.length > 0) {
    var word = str.shift();
    if (chars + word.length + line.length + 3 > 80) {
      lines.push(line.join(' '));
      line = [];
      chars = 0;
    }

    if (maxCount > 0 && totalChars > maxCount) return lines;

    line.push(word);
    chars += word.length;
    totalChars += word.length;
  }

  lines.push(line.join(' '));
  return lines;
}


exports.renderKataInfo = function(data) {

  var refData = reference.getData(data.id);

  console.log('');

  var kyu = typeof chalk[data.rank.color] !== 'undefined'
    ?
    'bg' + data.rank.color.substr(0,1).toUpperCase() + data.rank.color.substr(1)
    :
    'bgYellow';

  var languages = data.languages.map(function(lang) {
    if (lang === config.language) return chalk.bold(lang);
    return lang;
  });

  console.log(
    '%s %s [%s]  | %s',
    chalk.white.bold.underline(data.name),
    chalk.white[kyu]('[' + data.rank.name + ']'),
    refData === null ? 'NOT SAVED' : refData.state.toUpperCase(),
    languages.join(chalk.gray(' * '))
  );
  console.log('');

  console.log('Category:  %s', chalk.bgMagenta(data.category.toUpperCase()));
  //console.log('');
  console.log('  Author:  %s', data.createdBy.username);
  console.log('Kata URL:  %s', chalk.underline(data.url));
  console.log('');
  console.log('    Tags:  %s', data.tags.map(function(t) { return chalk.black.bgCyan(t) }).join('  '));
  console.log('');
  console.log(breakLines(data.description, 330).join('\n') + '...');
  console.log('');
  console.log(
    '[ %s of %s attempts completed (%s) / %s stars / %s votes ]',
    chalk.cyan(data.totalCompleted),
    chalk.cyan(data.totalAttempts),
    chalk.yellow((Math.floor((data.totalCompleted / data.totalAttempts) * 100) / 100) + '%'),
    chalk.green(data.totalStars),
    chalk.green(data.voteScore)
  );
  console.log('');
};


exports.renderReadyToFinalizeMessage = function(lookup) {
  console.log('');
  console.log('%s %s evaluation!', lookup.slug, chalk.green('PASSED'));
  console.log('When you\'re ready to finalize your solution, type:');
  console.log('');
  console.log(chalk.white.bold('  nodewars finalize ' + lookup.slug));
  console.log('');
};


exports.renderFailedMessage = function(lookup, evalMessage) {
  console.log(
    '%s %s evaluation: %s',
    lookup.slug,
    chalk.red('FAILED'),
    evalMessage.reason
  )
};


exports.renderNotFinalMessage = function(lookup) {
  console.log(
    'Solution not for finalization! Solution state is %s - must be %s',
    chalk.red(lookup.state).toUpperCase(),
    chalk.green('FINAL')
  );
  console.log(
    'To submit for evaluation: %s',
    chalk.white('nodewars --submit ' + lookup.slug)
  );
};



exports.renderExerciseCompleteMessage = function(kata) {
  console.log('');
  console.log( '%s was successfully %s', kata.name, chalk.green('finalized'));
  console.log(
    'Compare and discuss solutions here: %s',
    chalk.white.underline(kata.url + '/solutions/' + config.language)
  );
  console.log('');

  console.log('You can access this kata again off the record at any time by typing:');
  console.log(chalk.white.bold('  nodewars edit ' + kata.slug));
  console.log('');

  console.log('Or you may train on the record again by typing:');
  console.log(chalk.white.bold('  nodewars train ' + kata.slug));
  console.log('');
};



exports.renderChallengeList = function(state) {
  if (typeof reference.kataLookup === 'undefined') {
    reference.loadData();
  }

  var maxLength = 0;
  var result = {};

  var lookup = reference.kataLookup;
  for (var k in lookup) {
    if (!lookup.hasOwnProperty(k)) continue;
    var kata = lookup[k];
    if (typeof state !== 'undefined' && state !== kata.state) continue;
    if (typeof result[kata.state] === 'undefined') result[kata.state] = [];
    result[kata.state].push(kata.slug);
    maxLength = Math.max(kata.slug.length, maxLength);
  }

  for (var r in result) {
    if (!result.hasOwnProperty(r)) continue;
    console.log('');
    console.log(chalk.green(r.toUpperCase()));
    var katas = result[r];
    katas.forEach(function(slug) {
      var str = '';
      var offset = maxLength - slug.length;
      while (offset--) str += ' ';
      str += '%s |  %s';
      console.log(
        str,
        chalk.white(slug),
        chalk.underline('https://www.codewars.com/kata/' + slug)
      );
    })

  }
};


exports.renderTrainingSession = function(slug) {
  console.log('');
  console.log(
    'Successfully created training session: %s',
    chalk.white.bold(slug)
  );
  console.log('Loading project...');
  console.log('');
};

exports.openWithEditor = function(slugOrId) {
  var lookup = reference.getData(slugOrId);
  var spawn = require('child_process').spawn;
  var challengeDir = path.resolve(config.projectDir, lookup.slug, 'kata.js');

  console.log(
    'Launching: %s %s',
    chalk.white(config.editor),
    chalk.yellow(challengeDir)
  );

  spawn(config.editor, [challengeDir]);

};