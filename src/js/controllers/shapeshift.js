'use strict';

angular.module('copayApp.controllers').controller('shapeshiftController',
  function($scope, $ionicHistory, $timeout, $log, $state, profileService, popupService, lodash, shapeshiftService, gettextCatalog) {

    var defaultCoin = 'btc';
    var walletsBtc = [];
    var walletsBch = [];

    var showErrorAndBack = function(title, msg) {
      title = title || gettextCatalog.getString('Error');
      $scope.sendStatus = '';
      $log.error(msg);
      msg = (msg && msg.errors) ? msg.errors[0].message : msg;
      popupService.showAlert(title, msg, function() {
        $ionicHistory.goBack();
      });
    };

    var showToWallets = function() {
      $scope.toWallets = $scope.fromWallet.coin == 'btc' ? walletsBch : walletsBtc;
      $scope.onToWalletSelect($scope.toWallets[0]);

      var pair = $scope.fromWallet.coin + '_' + $scope.toWallet.coin;
      shapeshiftService.getRate(pair, function(err, rate) {
        $scope.rate = rate;
      });
      shapeshiftService.getLimit(pair, function(err, limit) {
        $scope.limit = limit;
      });

      $timeout(function() { $scope.$digest(); }, 100);
    }

    $scope.onFromWalletSelect = function(wallet) {
      $scope.fromWallet = wallet;
      showToWallets();
    };

    $scope.onToWalletSelect = function(wallet) {
      $scope.toWallet = wallet;
    }

    $scope.$on("$ionicView.beforeEnter", function(event, data) {

      $scope.network = shapeshiftService.getNetwork();
      walletsBtc = profileService.getWallets({
        onlyComplete: true,
        network: $scope.network,
        coin: 'btc'
      });

      walletsBch = profileService.getWallets({
        onlyComplete: true,
        network: $scope.network,
        coin: 'bch'
      });

      $scope.fromWallets = lodash.filter(walletsBtc.concat(walletsBch), function(w) {
        // Available balance and 1-signature wallet
        return w.status.balance.availableAmount > 0 && w.credentials.m == 1;
      });

      if (lodash.isEmpty($scope.fromWallets)) {
        showErrorAndBack(null, gettextCatalog.getString('No wallets available to use ShapeShift'));
        return;
      }

      $scope.onFromWalletSelect($scope.fromWallets[0]);

      $scope.fromWalletSelectorTitle = 'From';
      $scope.toWalletSelectorTitle = 'To';

      $scope.showFromWallets = false;
      $scope.showToWallets = false;
    });

    $scope.showFromWalletSelector = function() {
      $scope.showFromWallets = true;
    }

    $scope.showToWalletSelector = function() {
      $scope.showToWallets = true;
    }

    $scope.setAmount = function() {
      $state.go('tabs.shapeshift.amount', {
        coin: $scope.fromWallet.coin,
        id: $scope.fromWallet.id,
        toWalletId: $scope.toWallet.id
      });
    };
  });
