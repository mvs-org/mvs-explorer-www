(function() {
    'use strict';

    angular
        .module('app')
        .controller('StartpageController', StartpageController)
        .controller('BlockListController', BlockListController)
        .controller('TransactionListController', TransactionListController);

    function StartpageController($scope, $location, localStorageService, FlashService, $translate, $interval, $wamp) {

        $scope.startpage = () => $location.path('/');
        $scope.loading_blocks = true;
        $scope.loading_txs = true;
        $scope.format = (value, decimals) => value / Math.pow(10, decimals);

    }

    function BlockListController($scope, $wamp, $interval) {

        $scope.currentTimeStamp = Math.floor(Date.now());
        $interval(() => $scope.currentTimeStamp = Math.floor(Date.now()), 1000);

        function AddBlocksToBlocks(blocks) {
            blocks = blocks.concat($scope.blockList);
            $scope.blockList = blocks.slice(0, 10);
        }

        (() => {
            $wamp.subscribe('public.blocks', (args) => {
                $scope.loading_blocks = false;
                if (args[1] == 'i')
                    $scope.blockList = args[0];
                else
                    AddBlocksToBlocks(args[0]);

            }).then((subscription) => {
                $scope.$on('$destroy', () => {
                    // console.log('unsubscribe block')
                    $wamp.unsubscribe(subscription);
                });
            });
        })();
    }

    function TransactionListController($scope, $wamp, $interval) {

        $scope.currentTimeStamp = Math.floor(Date.now());
        $interval(() => $scope.currentTimeStamp = Math.floor(Date.now()), 1000);

        function AddTxsToTxs(txs) {
            txs = txs.concat($scope.txList);
            $scope.txList = txs.slice(0, 10);
        }

        (() => {
            $wamp.subscribe('public.transactions', (args) => {
                $scope.loading_txs = false;
                if (args[1] == 'i')
                    $scope.txList = args[0];
                else
                    AddTxsToTxs(args[0]);
            }).then((subscription) => {
                $scope.$on('$destroy', () => {
                    $wamp.unsubscribe(subscription);
                });
            });
        })();

    }


})();
