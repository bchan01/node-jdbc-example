var _ = require('underscore');
var asyncjs = require('async');
var nodeunit = require('nodeunit');
var ex = require('../lib/jdbc-example');

var insertUser = function(id, ps, callback) {
  ps.setInt(1, id, function(err) {
    if (err) {
      callback(err);
    } else {
      ps.setString(2, 'Jason_' + id, function(err) {
        if (err) {
          callback(err);
        } else {
          ps.executeUpdate(function(err, result) {
            if (err) {
              callback(err);
            } else {
              callback(null, result);
            }
          });
        }
      });
    }
  });
};

exports.insert = {
  initialize: function(test) {
    ex.initialize(function(err, result) {
      test.expect(1);
      test.ok(result);
      test.done();
    });
  },
  insert: function(test) {
    ex.tableexists(null, null, 'BLAH', function(err, exists) {
      if (exists) {
        ex.update("INSERT INTO BLAH "
                + "VALUES "
                + "(1, 'Jason', CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP)",
                function(err, result) {
                  test.expect(3);
                  test.equal(err, null);
                  test.ok(result);
                  test.equal(result, 1);
                  test.done();
                });
      } else {
        console.log("TABLE 'BLAH' DOES NOT EXIST");
        test.done();
      }
    });
  },
  onethousandinserts: function(test) {
    ex.prepare("INSERT INTO BLAH "
             + "VALUES "
             + "(?, ?, CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP)",
      function(err, preparedstatement) {
        asyncjs.times(1000, function(n, next) {
          insertUser(n, preparedstatement, function(err, result) {
            next(err, result);
          });
        }, function(err, results) {
          if (err) {
            console.log(err);
          } else {
            asyncjs.filter(results, function(n, callback) {
              if (n != 1) {
                callback(true);
              } else {
                callback(false);
              }
            }, function(results) {
              test.expect(1);
              test.equal(results.length, 0);
              test.done();
            });
          }
        });
    });
  },
};