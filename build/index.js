(function() {
  var Promise, checkOptions, merge, resolveOptions;

  Promise = require("native-or-bluebird");

  merge = require("deepmerge");

  resolveOptions = function(optionName, service) {
    var i, k, o, _i, _j, _len, _len1, _ref, _ref1;
    o = [];
    if (service.deps[optionName] != null) {
      _ref = service.deps[optionName];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        _ref1 = resolveOptions(k, service);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          i = _ref1[_j];
          if (o.indexOf(i) === -1) {
            o.push(i);
          }
        }
      }
    }
    if (o.indexOf(optionName) === -1) {
      o.push(optionName);
    }
    return o;
  };

  checkOptions = function(requestType, requestPath, service) {
    return new Promise(function(resolve, reject) {
      var i, o, options, res, _i, _j, _len, _len1, _ref, _ref1;
      options = [];
      _ref = service.routes[requestType][requestPath];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        _ref1 = resolveOptions(o, service);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          i = _ref1[_j];
          if (options.indexOf(i) === -1) {
            options.push(i);
          }
        }
      }
      res = {};
      res[requestType] = {};
      res[requestType][requestPath] = options;
      return resolve(res);
    });
  };

  module.exports = function(components) {
    if (components == null) {
      components = [];
    }
    return function(app) {
      return new Promise(function(resolve, reject) {
        return Promise.all(components).then(function(results) {
          var promises, r, requestOptions, requestPath, requestType, requests, routes, service, _i, _len, _ref;
          service = {};
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            r = results[_i];
            service = merge(r, service);
          }
          routes = {};
          promises = [];
          _ref = service.routes;
          for (requestType in _ref) {
            requests = _ref[requestType];
            for (requestPath in requests) {
              requestOptions = requests[requestPath];
              promises.push(checkOptions(requestType, requestPath, service));
            }
          }
          return Promise.all(promises).then(function(reqResults) {
            var rr, _j, _len1;
            for (_j = 0, _len1 = reqResults.length; _j < _len1; _j++) {
              rr = reqResults[_j];
              service.routes = merge(rr, service.routes);
            }
            return resolve(service);
          });
        });
      });
    };
  };

}).call(this);
