/**
 * Module dependencies
 */
var _ = require('lodash');
var config = require('./config');
var format = require('util').format;
var fs = require('fs-extra');
var https = require('https');
var modeler = require('./modeler');
var path = require('path');
var Promise = require('bluebird');
var reference = require('./reference');


/**
 * @module nodewars/api
 */
module.exports = exports;

var hostname = 'www.codewars.com';
var basePath = '/api/v1/code-challenges';


/**
 * Executes the API request and returns a string containing the response.
 *
 * @param {string}  method    HTTP method to use
 * @param {string}  route     the API route, excluding the basePath defined above
 * @param {string|Array} postData  the request body, if any, to be sent with an
*                             https POST request.
 *
 * @returns {bluebird|exports|module.exports}
 */
function makeRequest(method, route, postData) {
  var options = {
    hostname: hostname,
    port: 443,
    path: basePath + route,
    method: method,
    headers: {
      'Authorization': config.apiKey
    }
  };

  return new Promise(function(resolve, reject) {
    var response = '';

    var req = https.request(options, function(res) {
      res.on('data', function(data) {
        response += data;
      });

      res.on('end', function() {
        resolve(response);
      })
    });

    if (typeof postData !== 'undefined' && method === 'POST') {
      if (!_.isArray(postData)) postData = [postData];
      postData.forEach(function (val) {
        req.write(val);
      }, this);
    }

    req.end();

    req.on('error', function(err) {
      console.log('https error! %s: %s', err.name, err.message);
      reject(err);
    })
  });
}



exports.getUser = function(idOrUsername) {
  // GET https://www.codewars.com/api/v1/users/:id_or_username
};


/**
 * Convenience function to quickly write a file to a kata directory.  This will
 * overwrite any existing data.
 *
 * @param {string} slug
 * @param {string} filename
 * @param {string} data
 */
function writeKataFile(slug, filename, data) {
  var dir = path.resolve(config.projectDir, slug);
  filename = path.resolve(dir, filename);
  fs.ensureDirSync(dir);

  var method = typeof data === 'string' ? fs.writeFileSync : fs.writeJsonSync;
  method.call(fs, filename, data);
}


/**
 * Convenience function to quickly read a file from a kata directory into
 * memory
 *
 * @param {string} slug
 * @param {string} filename
 */
function readKataFile(slug, filename) {
  var dir = path.resolve(config.projectDir, slug);
  var data = fs.readFileSync(path.resolve(dir, filename), {encoding: 'utf8'});
  return data;
}


/**
 * Retrieves kata information
 *
 * @param {string} slugOrId
 * @param {boolean=true} save
 * @see {@link http://dev.codewars.com/#get-code-challenge}
 * @returns {Promise}
 */
exports.getChallenge = function(slugOrId, save) {
  save = typeof save !== 'undefined' ? save : true;
  return makeRequest('GET', format('/%s', slugOrId))
    .then(function(data) {
      var kata = JSON.parse(data);

      if (save === true) {
        reference.setData(kata.id, kata.slug, 'saved');
        writeKataFile(kata.slug, 'kata.json', kata);
      }

      return kata;
    });
};


/**
 * Splits long strings to not more than 80 characters per line
 *
 * @param {string} str
 * @returns {Array} an array of lines
 */
function breakLines(str) {
  str = str.replace(/<br\s?\/?>/g, '\n');
  if (str.indexOf('\n') !== -1) return str.split('\n');

  var lines = [];
  var line = [];
  var chars = 0;
  str = str.split(' ');
  while (str.length > 0) {
    var word = str.shift();
    if (chars + word.length + line.length + 3 > 80) {
      lines.push(line.join(' '));
      line = [];
      chars = 0;
    }

    line.push(word);
    chars += word.length;
  }

  lines.push(line.join(' '));
  return lines;
}


/**
 * Builds the template code file from the kata/challenge and train responses
 *
 * @param {string} slug
 * @returns {string}
 */
function buildCodeFile(slug) {

  var kataData = readKataFile(slug, 'kata.json');
  var trainData = readKataFile(slug, 'train.json');

  var kata = JSON.parse(kataData);
  var train = JSON.parse(trainData);

  var header = [
    'Nodewars: helps you choose practice over work',
    '--------',
    format('kata: %s [%s / %s kyu]', kata.name, kata.category, kata.rank.name),
    format('by:   %s (%s)', kata.createdBy.username, kata.createdBy.url),
    'url:   http://www.codewars.com/kata/' + kata.slug,
    'tags: ' + kata.tags.map(function(t) { return t.toLowerCase() }).join(' | '),
    'description: '
  ]
    .concat(breakLines(kata.description))
    .concat(['--------', 'provided code:'])
    .concat(breakLines(train.session.setup))
    .concat(['', 'sample tests:'])
    .concat(breakLines(train.session.exampleFixture))
    .concat(['', '&==BEGIN CODE==& (DO NOT REMOVE THIS LINE)', '']);

  header = header.map(function(line) { return '// ' + line; }).join('\n');
  var body = train.session.code || '';

  return header + body;
}


/**
 * @private
 * Provided with data from {@link trainNext} or {@link train},
 * updates train.json, session.json and kata.js
 *
 * @param {string} data response from {@link trainNext} or {@link train}
 *
 * @returns {Promise}
 */
exports.handleTrainResponse = function(data) {
  var kata = JSON.parse(data);
  var session = kata.session;
  reference.setData(kata.id, kata.slug, 'active');
  writeKataFile(kata.slug, 'train.json', kata);
  writeKataFile(kata.slug, 'session.json', session);

  return this.getChallenge(kata.slug)

    .then(function() {
      var code = buildCodeFile(kata.slug);
      writeKataFile(kata.slug, 'kata.js', code);
      return true;
    });
};


/**
 * @alias trainNext
 *
 * Triggers the next kata training, according to the strategy provided
 *
 * @param {string} strategy training selection strategy.
 * @see nodewars/reference.train.strategies
 * @see {@link http://dev.codewars.com/#post-train-next-code-challenge}
 */
exports.trainNext = function(strategy) {
  // POST https://www.codewars.com/api/v1/code-challenges/:language/train
  var route = format('/%s/train', config.language);
  var method = 'POST';
  var postData = format('strategy=%s', strategy || 'default');
  var handleResponse = this.handleTrainResponse.bind(this);

  return makeRequest(method, route, postData)
    .then(handleResponse);

};


/**
 * @alias train
 *
 * Triggers the specified kata training
 *
 * @param {string} slugOrId the desired kata's slug or id
 * @see {@link http://dev.codewars.com/#post-train-code-challenge}
 */
exports.train = function(slugOrId) {
  // POST https://www.codewars.com/api/v1/code-challenges/:id_or_slug/:language/train
  var route = format('/%s/%s/train', slugOrId, config.language);
  var method = 'POST';
  var postData = format('language=%s', config.language);
  var handleResponse = this.handleTrainResponse.bind(this);

  return makeRequest(method, route, postData)
    .then(handleResponse);

};


/**
 * @alias getDeferredResponse
 *
 * Returns a promise representing the eventual deferred response from the
 * server.
 *
 * Mind throttling limits imposed by the server - if this method gets out of
 * hand, it could result in the IP being banned!
 * {@see {@link http://dev.codewars.com/#get-deferred-response}}
 *
 * @param {string} dmid the message ID returned by {@link attemptSolution}
 * @returns {bluebird|exports|module.exports}
 */
exports.getDeferredResponse = function(dmid) {
  var FREQUENCY = 700;
  var route = format('/deferred/%s', dmid);
  var method = 'GET';

  return new Promise(function(resolve) {

    var poller = setInterval(function() {
      makeRequest(method, route)
        .then(function(data) {
          var obj = JSON.parse(data);
          if (obj.success !== true) return;
          clearInterval(poller);
          resolve(obj);
        });
    }, FREQUENCY);

  });
};


/**
 * @alias attemptSolution

 * Submits a solution to the API
 *
 * This API method returns a deferred message ID instead of blocking while
 * processing.  {@see {@link getDeferredResponse}}
 *
 * @param {string} slugOrId
 * @see {@link http://dev.codewars.com/#post-attempt-solution}
 */
exports.attemptSolution = function(slugOrId) {
  // POST https://www.codewars.com/api/v1/code-challenges/projects/:project_id/solutions/:solution_id/attempt
  var lookup = reference.getData(slugOrId);
  reference.setData(lookup.id, lookup.slug, 'queued');

  var session = readKataFile(lookup.slug, 'session.json');
  session = JSON.parse(session);
  var projectId = session.projectId;
  var solutionId = session.solutionId;

  var codeFile = readKataFile(lookup.slug, 'kata.js');
  var marker = codeFile.indexOf('&==BEGIN CODE==&');
  var markerLine = codeFile.indexOf('\n', marker);
  var code = codeFile.substr(markerLine + 2);

  var route = format('/projects/%s/solutions/%s/attempt', projectId, solutionId);
  var method = 'POST';
  var postData = [
    'code=' + code,
    'output_format=raw'
  ];

  var handleDeferred = this.getDeferredResponse.bind(this);

  var deferredMessage, evaluatedMessage;

  return makeRequest(method, route, postData)

    .then(function(result) {
      deferredMessage = JSON.parse(result);
      return handleDeferred(deferredMessage.dmid);
    })

    .then(function(result) {
      evaluatedMessage = JSON.parse(result);
      writeKataFile(lookup.slug, 'result.json', evaluatedMessage);

      if (evaluatedMessage.valid === true) {
        reference.setData(lookup.id, lookup.slug, 'final');
        modeler.renderReadyToFinalizeMessage(evaluatedMessage);
        return;
      }

      reference.setData(lookup.id, lookup.slug, 'active');
      modeler.renderFailedMessage(lookup, evaluatedMessage);
    });

};


/**
 *
 * @param {string} slugOrId
 * @see {@link http://dev.codewars.com/#post-finalize-solution}
 */
exports.finalizeSolution = function(slugOrId) {
  // POST https://www.codewars.com/api/v1/code-challenges/projects/:project_id/solutions/:solution_id/finalize
  var lookup = reference.getData(slugOrId);


  var session = readKataFile(lookup.slug, 'session.json');
  session = JSON.parse(session);
  var projectId = session.projectId;
  var solutionId = session.solutionId;

  var route = format('/projects/%s/solutions/%s/finalize', projectId, solutionId);
  var method = 'POST';

  return makeRequest(method, route)
    .then(function() {
      reference.setData(lookup.id, lookup.slug, 'completed');
      var kata = readKataFile(lookup.slug, 'kata.json');
      kata = JSON.parse(kata);
      modeler.renderExerciseCompleteMessage(kata);
    });
};