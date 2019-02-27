(function() {
    'use strict';

    angular
        .module('app')
        .controller('AddressController', AddressController);

    function AddressController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope, Assets) {

        var address = $stateParams.address;
        $rootScope.nosplash = true;
        $scope.loading_balances = true;
        $scope.info = [];
        $scope.tokens = [];
        $scope.definitions = [];
        $scope.items_per_page = 10;
        $scope.minDate = new Date(2017, 2 - 1, 11);
        $scope.maxDate = new Date();
        $scope.transactions = [];
        $scope.last_known = '';
        $scope.loading_txs = false;
        $scope.txs_fully_loaded = false;
        $scope.icons = Assets.hasIcon;
        $scope.priority = Assets.priority;
        $scope.buttonCopyToClipboard = new ClipboardJS('.btn');

        qrcodelib.toCanvas(document.getElementById('qrcode'), address, {
            color: {
                dark: '#000000',
                light: '#0000'
            },
            scale: 4
        }, function(error) {
            if (error)
                console.error(error);
        });

        $scope.address = address;

        fetchAddress(address);

        function fetchAddress(address) {
            if (typeof address !== 'undefined') {
                MetaverseService.FetchAddress(address)
                    .then((response) => {
                        $scope.loading_balances = false;
                        if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                            $scope.info = response.data.result.info;
                            $scope.tokens = response.data.result.tokens;
                            $scope.definitions = response.data.result.definitions;
                            for (var symbol in $scope.definitions) {
                                $scope.definitions[symbol].priority = (typeof $scope.priority[symbol] != 'undefined') ? $scope.priority[symbol] : 1000;
                                $scope.definitions[symbol].icon = ($scope.icons.indexOf(symbol) > -1) ? symbol : 'default_mst';
                            }

                            $scope.addressAssets = [];
                            var assetETP = [];
                            assetETP.symbol = "ETP";
                            assetETP.priority = $scope.priority["ETP"];
                            assetETP.decimals = 8;
                            assetETP.icon = "ETP";
                            $scope.addressAssets.push(assetETP);

                            for (var symbol in $scope.definitions) {
                                $scope.addressAssets.push($scope.definitions[symbol]);
                            }
                            if (typeof $scope.info.FROZEN == 'undefined')
                                $scope.info.FROZEN = 0;
                            if (typeof $scope.tokens.ETP == 'undefined')
                                $scope.tokens.ETP = 0;
                        } else {
                            $translate('MESSAGES.ERROR_ADDRESS_NOT_FOUND')
                                .then((data) => {
                                    FlashService.Error(data, true);
                                    // $location.path('/');
                                });
                        }
                    });
            }
        }

        $scope.applyFilters = (min_date, max_date) => {
            $scope.transactions = [];
            $scope.last_known = '';
            $scope.txs_fully_loaded = false;
            $scope.min = min_date;
            $scope.max = max_date;
            $scope.loadTransactions();
        };
       
        $scope.loadTransactions = function() {
            if(!$scope.loading_txs && !$scope.txs_fully_loaded) {
                $scope.loading_txs = true;
                return MetaverseService.ListTxs($scope.last_known, address, ($scope.min) ? $scope.min.getTime() / 1000 : null, ($scope.max) ? ($scope.max).getTime() / 1000 + 86400 : null)
                    .then((response) => {
                        $scope.transactions = $scope.transactions.concat(response.data.result);
                        if($scope.transactions[$scope.transactions.length-1])
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

})();
