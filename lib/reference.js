/**
 * Module dependencies
 */
var format = require('util').format;
var fs = require('fs-extra');
var path = require('path');


/**
 * @module nodewars/reference
 */
module.exports = exports;


/**
 * Loads existing kata data from file
 */
exports.loadData = function() {
  this.kataLookup = {};
  var pathname = path.resolve(process.cwd(), '.nwdata');
  fs.ensureFileSync(pathname);
  var data = fs.readFileSync(pathname, {encoding: 'utf8'});
  data = data.split('\n');
  data.forEach(function(row) {
    row = row.trim().split(' ');
    if (row.length !== 3) return;
    this.kataLookup[row[0]] = {
      slug: row[1],
      state: row[2]
    };
  }, this)
};


/**
 * Attempts to match the provided piece against either kata id or slug.
 * Lazy loads data if necessary.
 *
 * @param {string} slugOrId
 * @returns {object|null}
 */
exports.getData = function(slugOrId) {
  if (typeof this.kataLookup === 'undefined') {
    this.loadData();
  }

  for (var k in this.kataLookup) {
    if (!this.kataLookup.hasOwnProperty(k)) continue;
    if (k === slugOrId || this.kataLookup[k].slug === slugOrId) {

      return {
        id: k,
        slug: this.kataLookup[k].slug,
        state: this.kataLookup[k].state
      };
    }
  }

  return null;
};


/**
 * Stores the provided kata id and slug in memory and on disk.
 *
 * @param {string} id
 * @param {string} slug
 * @param {string} state
 */
exports.setData = function(id, slug, state) {
  if (typeof this.kataLookup === 'undefined') {
    this.loadData();
  }

  this.kataLookup[id] = {
    slug: slug,
    state: state
  };

  var fileContents = [];
  for (var k in this.kataLookup) {
    if (!this.kataLookup.hasOwnProperty(k)) continue;
    fileContents.push(
      format('%s %s %s', k, this.kataLookup[k].slug, this.kataLookup[k].state)
    );
  }

  var pathname = path.resolve(process.cwd(), '.nwdata');

  try {
    fs.copySync(pathname, pathname + '.b');
    fs.writeFileSync(pathname, fileContents.join('\n'));
  //  fs.move(pathname, pathname + '.b', function(err) {
  //    if (err) {
  //      fs.removeSync(pathname + '.b');
  //      fs.move(pathname, pathname + '.b', function(err) {
  //        if (err) throw err;
  //      });
  //      fs.writeFileSync(pathname, fileContents.join('\n'));
  //    }
  //  });
  //} catch(err) {
  //  console.log('Caught another error!', err.name, err.message);
  //} finally {
  } catch (err) {
    throw err;
  }
};


/** Train API reference */
exports.train = {

  /**
   * Languages supported by Codewars API.
   * Value indicates whether language
   * is supported by Nodewars.
   * @see {@link http://dev.codewars.com/#languages}
   */
  languages: {
    coffeescript: false,
    javascript: true,
    ruby: false
  },

  /**
   * Training selection strategies.
   * @see {@link http://dev.codewars.com/#post-train-next-code-challenge}
   */
  strategies: {
    default: 'Also referred to as the “Rank Up” workout. Will select a challenge that is above your current level.',
    random: 'Randomly selected code challenges',
    reference_workout: 'Will select code challenges that are tagged as reference.',
    beta_workout: 'Will select beta code challenges.',
    retrain_workout: 'Will focus on code challenges that you have already completed.',
    algorithm_retest: 'Will focus on algorithm code challenges that you have already completed.',
    kyu_8_workout: 'Will focus on 8 kyu code challenges.',
    kyu_7_workout: 'Will focus on 7 kyu code challenges.',
    kyu_6_workout: 'Will focus on 6 kyu code challenges.',
    kyu_5_workout: 'Will focus on 5 kyu code challenges.',
    kyu_4_workout: 'Will focus on 4 kyu code challenges.',
    kyu_3_workout: 'Will focus on 3 kyu code challenges.',
    kyu_2_workout: 'Will focus on 2 kyu code challenges.',
    kyu_1_workout: 'Will focus on 1 kyu code challenges.'
  }
};