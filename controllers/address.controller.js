(function() {
    'use strict';

    angular
        .module('app')
        .controller('AddressController', AddressController);

    function AddressController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope, Assets) {

        var address = $stateParams.address;
        $rootScope.nosplash = true;
        $scope.loading_address = true;
        $scope.info = [];
        $scope.tokens = [];
        $scope.definitions = [];
        $scope.items_per_page = 10;
        $scope.minDate = new Date(2017, 2 - 1, 11);
        $scope.maxDate = new Date();
        $scope.icons = Assets.hasIcon;
        $scope.priority = Assets.priority;

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
                        if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                            $scope.info = response.data.result.info;
                            $scope.tokens = response.data.result.tokens;
                            $scope.definitions = response.data.result.definitions;
                            for (var symbol in $scope.definitions) {
                                $scope.definitions[symbol].priority = (typeof $scope.priority[symbol] != 'undefined') ? $scope.priority[symbol] : 1000;
                                $scope.definitions[symbol].icon = ($scope.icons.indexOf(symbol) > -1) ? symbol : 'default';
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

        $scope.switchPage = (page) => {
            $scope.current_page = page;
            return loadTransactions();
        };

        $scope.applyFilters = () => {
            $scope.current_page = 1;
            return loadTransactions();
        };

        function loadTransactions() {
            if (typeof address !== 'undefined') {
                NProgress.start();
                MetaverseService.FetchHistory(address, $scope.current_page - 1, ($scope.min_date) ? $scope.min_date.getTime() / 1000 : null, ($scope.max_date) ? ($scope.max_date).getTime() / 1000 + 86400 : null)
                    .then((response) => {
                        $scope.loading_address = false;
                        if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                            $scope.transactions = response.data.result.transactions;
                            $scope.total_count = response.data.result.count;
                            $scope.loading = false;
                        } else {
                            $translate('MESSAGES.ERROR_TRANSACTION_NOT_FOUND')
                                .then((data) => {
                                    FlashService.Error(data, true);
                                });
                        }
                        NProgress.done();
                    });
            }
        }

        $scope.switchPage(1);
    }

})();
