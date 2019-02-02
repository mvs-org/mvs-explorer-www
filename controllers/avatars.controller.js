(function() {
    'use strict';

    angular
        .module('app')
        .controller('AvatarController', AvatarController)
        .controller('AvatarsController', AvatarsController);

    function AvatarController($scope, MetaverseService, $stateParams, Assets) {

        $scope.loading_balances = true;
        $scope.loading_avatar = true;
        $scope.loading_certs = true;
        $scope.showAddressesHistory = false;
        $scope.certs = [];
        $scope.icons = Assets.hasIcon;
        $scope.priority = Assets.priority;
        $scope.items_per_page = 10;
        $scope.minDate = new Date(2017, 2 - 1, 11);
        $scope.maxDate = new Date();
        $scope.transactions = [];
        $scope.last_known = '';
        $scope.loading_txs = false;
        $scope.txs_fully_loaded = false;

        MetaverseService.FetchAvatar($stateParams.symbol)
            .then((response) => {
                $scope.avatar = response.data.result;
                $scope.loading_avatar = false;
                fetchAddress($scope.avatar.address);
                $scope.loadTransactions();
            })
            .catch((error) => {
                $scope.loading_avatar = false;
                console.error(error);
            });


        MetaverseService.FetchCerts($stateParams.symbol, 1)
            .then((response) => {
                $scope.certs = response.data.result;
                $scope.loading_certs = false;
            })
            .catch((error) => {
                $scope.loading_certs = false;
                console.error(error);
            });


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
            $scope.min = min_date;
            $scope.max = max_date;
            $scope.loadTransactions();
        };
       
        $scope.loadTransactions = function() {
            if(!$scope.loading_txs && $scope.avatar && $scope.avatar.address && !$scope.txs_fully_loaded) {
                $scope.loading_txs = true;
                return MetaverseService.ListTxs($scope.last_known, $scope.avatar.address, ($scope.min) ? $scope.min.getTime() / 1000 : null, ($scope.max) ? ($scope.max).getTime() / 1000 + 86400 : null)
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

    function AvatarsController($scope, MetaverseService) {

        $scope.loading_avatars = true;
        $scope.items_per_page = 50;

        $scope.switchPage = (page) => {
            $scope.current_page = page;
            return load();
        };

        $scope.applyFilters = () => {
            $scope.current_page = 1;
            return load();
        };

        var load = () => {
            $scope.loading_avatars = true;
            return MetaverseService.ListAvatars($scope.current_page - 1, $scope.items_per_page)
                .then((response) => {
                    $scope.avatars = response.data.result.result;
                    $scope.total_count = response.data.result.count;
                    $scope.loading_avatars = false;
                })
                .catch((error) => {
                    $scope.loading_avatars = false;
                    console.error(error);
                });
        };

        $scope.switchPage(1);

    }



})();
