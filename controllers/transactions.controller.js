(function() {
    'use strict';

    angular
        .module('app')
        .controller('TransactionController', TransactionController)
        .controller('TransactionsController', TransactionsController)
        .controller('BroadcastTransactionController', BroadcastTransactionController);

    function TransactionsController($scope, MetaverseService) {

        $scope.minDate = new Date(2017, 2 - 1, 11);
        $scope.maxDate = new Date();
        $scope.transactions = [];
        $scope.last_known = '';
        $scope.loading_txs = false;
        $scope.txs_fully_loaded = false;

        $scope.applyFilters = (min_date, max_date) => {
            $scope.transactions = [];
            $scope.min = min_date;
            $scope.max = max_date;
            $scope.load();
        };
       
        $scope.load = function() {
            if(!$scope.loading_txs && !$scope.txs_fully_loaded) {
                $scope.loading_txs = true;
                return MetaverseService.ListTxs($scope.last_known, undefined, ($scope.min) ? $scope.min.getTime() / 1000 : null, ($scope.max) ? ($scope.max).getTime() / 1000 + 86400 : null)
                    .then((response) => {
                        $scope.transactions = $scope.transactions.concat(response.data.result);
                        $scope.last_known = $scope.transactions[$scope.transactions.length-1]._id;
                        $scope.loading_txs = false;
                        if(response.data.result.length == 0)
                            $scope.txs_fully_loaded = true;
                    })
                    .catch((error) => {
                        $scope.loading_txs = false;
                        console.error(error);
                    });
            }
        }

    }

    function TransactionController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope) {

        var transaction_hash = $stateParams.hash;
        $scope.loading_tx = true;
        $scope.loading_outputs = true;
        $rootScope.nosplash = true;
        $scope.loading_confirmation = true;
        $scope.total_inputs = 0;
        $scope.total_outputs = 0;
        $scope.buttonCopyToClipboard = new ClipboardJS('.btn');

        $scope.format = (value, decimals) => value / Math.pow(10, decimals);

        if (typeof transaction_hash !== 'undefined') {
            NProgress.start();
            MetaverseService.FetchTx(transaction_hash)
                .then((response) => {
                    $scope.loading_tx = false;
                    if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                        $scope.transaction = response.data.result;
                        $scope.messages = [];
                        if ($scope.transaction.outputs.length) {
                            $scope.transaction.outputs.forEach(function(output) {
                                $scope.total_outputs += output.value;
                                if (output.attachment.type == "message") {
                                    $scope.messages.push(output.attachment.content);
                                }
                                if (output.locked_height_range)
                                    output.unlock_block = $scope.transaction.height + output.locked_height_range;
                            });
                        }
                        if ($scope.transaction.inputs.length) {
                            $scope.transaction.inputs.forEach(function(input) {
                                $scope.total_inputs += input.value;
                            });
                        }
                    } else {
                        $translate('MESSAGES.ERROR_TRANSACTION_NOT_FOUND')
                            .then((data) => {
                                FlashService.Error(data, true);
                                $location.path('/');
                            });
                    }
                    NProgress.done();
                })
                .then(() => MetaverseService.FetchHeight())
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                        $scope.height = Math.max(response.data.result, $scope.transaction.height);
                        $scope.confirmations = $scope.height - $scope.transaction.height + 1;
                        $scope.loading_confirmation = false;
                    }
                })
                .then(() => MetaverseService.FetchTxOutputs(transaction_hash))
                .then((response) => {
                    $scope.loading_outputs = false;
                    var outputs = response.data.result;
                    $scope.transaction.outputs.forEach((output, index) => {
                        $scope.transaction.outputs[index].spent_tx = outputs[index].spent_tx;
                    });
                });
        }
    }

    function BroadcastTransactionController($scope, MetaverseService, FlashService, $translate) {

        $scope.raw_transaction = '';

        $scope.broadcast = function() {
            return MetaverseService.Broadcast($scope.raw_transaction)
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined' && typeof response.data.result.hash !== 'undefined') {
                        $translate('MESSAGES.SUCCESS_BROADCAST_TX').then((data) => FlashService.Success(data + response.data.result.hash, true));
                    } else {
                        if (typeof response.data.result.code !== 'undefined' && typeof response.data.result.error !== 'undefined') {
                            $translate('MESSAGES.ERROR_BROADCAST_TX').then((data) => FlashService.Error(data + ": " + response.data.result.code + ", " + response.data.result.error, true));
                        } else {
                            $translate('MESSAGES.ERROR_BROADCAST_TX').then((data) => FlashService.Error(data, true));
                        }

                    }
                })
                .catch((error) => {
                    $translate('MESSAGES.ERROR_BROADCAST_TX').then((data) => FlashService.Error(data, true));
                    console.error(error);
                });
        }

    }

})();
