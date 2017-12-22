'use strict';
angular.module('copayApp.services').factory('shapeshiftService', function($http, $log, lodash, moment, storageService, configService, platformInfo, nextStepsService, homeIntegrationsService) {
  var root = {};
  var credentials = {};

  /*
   * Development: 'testnet'
   * Production: 'livenet'
   */
  credentials.NETWORK = 'livenet';
  //credentials.NETWORK = 'testnet';

  if (credentials.NETWORK == 'testnet') {
    credentials.API_URL = "";
  } else {
    // CORS: cors.shapeshift.io
    credentials.API_URL = "https://cors.shapeshift.io";
  };

  var homeItem = {
    name: 'shapeshift',
    title: 'ShapeShift',
    icon: 'icon-shapeshift',
    sref: 'tabs.shapeshift',
  };

  var _get = function(endpoint) {
    return {
      method: 'GET',
      url: credentials.API_URL + endpoint,
      headers: {
        'content-type': 'application/json'
      }
    };
  };

  var _post = function(endpoint, data) {
    return {
      method: 'POST',
      url: credentials.API_URL + endpoint,
      headers: {
        'content-type': 'application/json'
      },
      data: data
    };
  };

  root.getNetwork = function() {
    return credentials.NETWORK;
  };

  root.shift = function(data, cb) {

    var dataSrc = {
      withdrawal: data.withdrawal,
      pair: data.pair,
      returnAddress: data.returnAddress
    };

    $http(_post('/shift', dataSrc)).then(function(data) {
      $log.info('Shapeshift SHIFT: SUCCESS');
      return cb(null, data.data);
    }, function(data) {
      $log.error('Shapeshift SHIFT ERROR', data);
      return cb(data);
    });
  };

  root.getRate = function(pair, cb) {
    $http(_get('/rate/' + pair)).then(function(data) {
      $log.info('Shapeshift PAIR: SUCCESS');
      return cb(null, data.data);
    }, function(data) {
      $log.error('Shapeshift PAIR ERROR', data);
      return cb(data);
    });
  };

  root.getLimit = function(pair, cb) {
    $http(_get('/limit/' + pair)).then(function(data) {
      $log.info('Shapeshift LIMIT: SUCCESS');
      return cb(null, data.data);
    }, function(data) {
      $log.error('Shapeshift LIMIT ERROR', data);
      return cb(data);
    });
  };

  var register = function() {
    homeIntegrationsService.register(homeItem);
  };

  register();
  return root;
});
