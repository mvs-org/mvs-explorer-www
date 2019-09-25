(function () {
    'use strict';

    angular
        .module('app')
        .controller('AvatarController', AvatarController)
        .controller('AvatarsController', AvatarsController);

    function AvatarController($scope, MetaverseService, $stateParams, Assets, $interval) {

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
        $scope.mits = [];
        $scope.mit_last_known = '';
        $scope.loading_mits = false;
        $scope.mits_fully_loaded = false;
        $scope.load_mits_nbr = 30;
        $scope.currentTimeStamp = Math.floor(Date.now());
        $interval(() => $scope.currentTimeStamp = Math.floor(Date.now()), 1000);

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

        MetaverseService.MinerVotes($stateParams.symbol, 1000)
            .then((response) => {
                $scope.posMining = response.data.result
            })
            .catch((error) => {
                $scope.loading_certs = false;
                console.error(error);
            });

        $scope.loadMits = function (limit) {
            if (!$scope.loading_mits && !$scope.mits_fully_loaded) {
                $scope.loading_mits = true;
                return MetaverseService.ListAvatarMits($stateParams.symbol, limit, $scope.mit_last_known)
                    .then((response) => {
                        $scope.mits = $scope.mits.concat(response.data.result);
                        if ($scope.mits[$scope.mits.length - 1])
                            $scope.mit_last_known = $scope.mits[$scope.mits.length - 1]._id;
                        $scope.loading_mits = false;
                        if (response.data.result.length == 0 || response.data.result.length < limit)
                            $scope.mits_fully_loaded = true;
                    })
                    .catch((error) => {
                        $scope.loading_mits = false;
                        console.error(error);
                    });
            }
        }

        $scope.loadMits(6)


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

        $scope.loadTransactions = function () {
            if (!$scope.loading_txs && $scope.avatar && $scope.avatar.address && !$scope.txs_fully_loaded) {
                $scope.loading_txs = true;
                return MetaverseService.ListTxs($scope.last_known, $scope.avatar.address, ($scope.min) ? $scope.min.getTime() / 1000 : null, ($scope.max) ? ($scope.max).getTime() / 1000 + 86400 : null)
                    .then((response) => {
                        $scope.transactions = $scope.transactions.concat(response.data.result);
                        if ($scope.transactions[$scope.transactions.length - 1])
                            $scope.last_known = $scope.transactions[$scope.transactions.length - 1]._id;
                        $scope.loading_txs = false;
                        if (response.data.result.length == 0)
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

        $scope.loading_avatars = false;
        $scope.last_known = '';
        $scope.avatars = [];
        $scope.avatars_fully_loaded = false;
        $scope.loading_count = true;

        $scope.load = function () {
            if (!$scope.loading_avatars && !$scope.avatars_fully_loaded) {
                $scope.loading_avatars = true;
                return MetaverseService.ListAvatars($scope.last_known)
                    .then((response) => {
                        $scope.avatars = $scope.avatars.concat(response.data.result);
                        $scope.last_known = $scope.avatars[$scope.avatars.length - 1]._id;
                        $scope.loading_avatars = false;
                        if (response.data.result.length == 0)
                            $scope.avatars_fully_loaded = true;
                    })
                    .catch((error) => {
                        $scope.loading_avatars = false;
                        console.error(error);
                    });
            }
        }

        MetaverseService.AvatarsCount()
            .then((response) => {
                $scope.count = response.data.result.count;
                $scope.loading_count = false;
            })
            .catch((error) => {
                $scope.loading_count = false;
                console.error(error);
            });

    }



})();
