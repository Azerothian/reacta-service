Promise = require "native-or-bluebird"
merge = require "deepmerge"


resolveOptions = (optionName, service) ->
  o = []
  if service.deps[optionName]?
    for k in service.deps[optionName]
      for i in resolveOptions(k, service)
        if o.indexOf(i) is -1
          o.push i
  if o.indexOf(optionName) is -1
    o.push optionName
  return o;

checkOptions = (requestType, requestPath, service) ->
  return new Promise (resolve, reject) ->
    options = []
    for o in service.routes[requestType][requestPath]
      for i in resolveOptions(o, service)
        if options.indexOf(i) is -1
          options.push i
    res = {}
    res[requestType] = {}
    res[requestType][requestPath] = options

    return resolve(res)



module.exports = (components = []) ->
  return (app) ->
    return new Promise (resolve, reject) ->
      return Promise.all(components).then (results) ->
        service = {}
        for r in results
          service = merge r, service

        routes = {}

        promises = []

        for requestType, requests of service.routes
          for requestPath, requestOptions of requests
            promises.push checkOptions(requestType, requestPath, service)

        return Promise.all(promises).then (reqResults) ->
          for rr in reqResults
            service.routes = merge rr, service.routes
          return resolve(service)
