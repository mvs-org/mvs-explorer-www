(function() {
    'use strict';

    angular
        .module('app')
        .controller('TransactionController', TransactionController)
        .controller('TransactionsController', TransactionsController);

    function TransactionsController($scope, MetaverseService) {

        $scope.items_per_page = 10;
        $scope.minDate = new Date(2017, 2 - 1, 11);
        $scope.maxDate = new Date();

        $scope.switchPage = (page) => {
            $scope.current_page = page;
            return load();
        };

        $scope.applyFilters = () => {
            $scope.current_page = 1;
            return load();
        };

        var load = () => {
            $scope.loading_txs = true;
            return MetaverseService.Txs($scope.current_page - 1, ($scope.min_date) ? $scope.min_date.getTime() / 1000 : null, ($scope.max_date) ? ($scope.max_date).getTime() / 1000 + 86400 : null)
                .then((response) => {
                    $scope.txs = response.data.result.result;
                    $scope.total_count = response.data.result.count;
                    $scope.loading_txs = false;
                })
                .catch((error) => {
                    $scope.loading_txs = false;
                    console.error(error);
                });
        };

        $scope.switchPage(1);

    }

    function TransactionController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope) {

        var transaction_hash = $stateParams.hash;
        $scope.loading_tx = true;
        $rootScope.nosplash = true;
        $scope.loading_confirmation = true;

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
                                if (output.attachment.type == "message") {
                                    $scope.messages.push(output.attachment.content);
                                }
                                if (output.locked_height_range)
                                    output.unlock_block = $scope.transaction.height + output.locked_height_range;
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
                        $scope.height = response.data.result;
                        $scope.confirmations = $scope.height - $scope.transaction.height + 1;
                        $scope.loading_confirmation = false;
                    }
                });
        }
    }

})();
