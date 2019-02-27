(function() {
    'use strict';

    angular
        .module('app')
        .controller('AssetsListController', AssetsListController)
        .controller('AssetController', AssetController);

    function AssetsListController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope, Assets) {

        $scope.loading_special_assets = false;
        $scope.loading_assets = false;
        $scope.special_assets = [];
        $scope.assets = [];
        $scope.last_known = '';
        $scope.icons = Assets.hasIcon;
        $scope.priority = Assets.priority;
        $scope.assets_fully_loaded = false;
        $scope.loading_count = true;

        listSpecialAssets();

        function listSpecialAssets() {
            NProgress.start();
            $scope.loading_special_assets = true;
            MetaverseService.ListSpecialAssets()
                .then((response) => {
                    $scope.loading_special_assets = false;
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $scope.special_assets = response.data.result;
                        $scope.special_assets.forEach(function(asset) {
                            asset.priority = (typeof $scope.priority[asset.symbol] != 'undefined') ? $scope.priority[asset.symbol] : 1000;
                            asset.icon = ($scope.icons.indexOf(asset.symbol) > -1) ? asset.symbol : 'default_mst';
                        });
                    }
                    NProgress.done();
                });
        }

        $scope.load = function() {
            if(!$scope.loading_assets && !$scope.assets_fully_loaded) {
                $scope.loading_assets = true;
                return MetaverseService.ListAssets($scope.last_known)
                    .then((response) => {
                        if(response.data.result.length == 0) {
                            $scope.assets_fully_loaded = true;
                        } else {
                            let additionnal_assets = response.data.result
                            additionnal_assets.forEach(function(asset) {
                                asset.priority = (typeof $scope.priority[asset.symbol] != 'undefined') ? $scope.priority[asset.symbol] : 1000;
                                asset.icon = ($scope.icons.indexOf(asset.symbol) > -1) ? asset.symbol : 'default_mst';
                            });
                            $scope.assets = $scope.assets.concat(additionnal_assets);
                            $scope.last_known = $scope.assets[$scope.assets.length-1].symbol;
                        }
                        $scope.loading_assets = false;
                    })
                    .catch((error) => {
                        $scope.loading_assets = false;
                        console.error(error);
                    });
            }
        }

        MetaverseService.AssetsCount()
            .then((response) => {
                $scope.count = response.data.result.count;
                $scope.loading_count = false;
            })
            .catch((error) => {
                $scope.loading_count = false;
                console.error(error);
            });

    }


    function AssetController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, Assets) {

        $scope.symbol = $stateParams.symbol;
        $scope.loading_asset = true;
        $scope.loading_depositsum = true;
        $scope.loading_circulation = true;
        $scope.loading_depositrewards = true;
        $scope.getCirculation = getCirculation;
        $scope.getDepositSum = getDepositSum;
        $scope.getDepositRewards = getDepositRewards;
        $scope.icons = Assets.hasIcon;
        $scope.showSecondaryHistory = false;

        if ($scope.symbol != undefined && $scope.symbol != "ETP") {
            NProgress.start();
            MetaverseService.AssetInfo($scope.symbol)
                .then((response) => {
                    $scope.loading_asset = false;
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $scope.asset = response.data.result[0];
                        $scope.asset.icon = ($scope.icons.indexOf($scope.symbol) > -1) ? $scope.symbol : 'default_mst';
                    }
                })
                .then(() => loadStakelist())
                .then(() => NProgress.done());
        } else if ($scope.symbol == "ETP") {
            NProgress.start();
            $scope.loading_asset = false;
            $scope.asset = [];
            $scope.asset.symbol = "ETP";
            $scope.asset.original_quantity = 10000000000000000;
            $scope.asset.quantity = 10000000000000000;
            $scope.asset.secondaryissue_threshold = 0;
            $scope.asset.decimals = 8;
            $scope.asset.issuer = "mvs.org";
            $scope.asset.address = "MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve";
            $scope.asset.issue_tx = "2a845dfa63a7c20d40dbc4b15c3e970ef36332b367500fd89307053cb4c1a2c1";
            $scope.asset.height = 0;
            $scope.asset.description = "MVS Official Token";
            $scope.asset.icon = "ETP";
            getCirculation()
                .then(() => loadStakelist())
                .then(() => NProgress.done())
                .then(() => getDepositSum())
                .then(() => getDepositRewards());

        }

        function getCirculation() {
            return MetaverseService.Circulation().then((response) => {
                $scope.loading_circulation = false;
                if (response.data.status && response.data.status.success) {
                    $scope.circulation = parseFloat(response.data.result).toFixed(0);
                }
            }, console.error);
        }

        function getDepositSum() {
            return MetaverseService.DepositSum().then((response) => {
                $scope.loading_depositsum = false;
                if (response.data.status && response.data.status.success) {
                    $scope.depositsum = parseFloat(response.data.result).toFixed(0);
                }
            }, console.error);
        }

        function getDepositRewards() {
            return MetaverseService.DepositRewards().then((response) => {
                $scope.loading_depositrewards = false;
                if (response.data.status && response.data.status.success) {
                    $scope.deposit_rewards_locked = parseFloat(response.data.result.locked).toFixed(0);
                    $scope.deposit_rewards_unlocked = parseFloat(response.data.result.unlocked).toFixed(0);
                }
            }, console.error);
        }

        function loadStakelist() {
            return MetaverseService.AssetStakes($scope.symbol)
                .then((stakes) => {
                    $scope.stakelist = stakes.data.result.map((stake) => {
                        return {
                            address: stake.a,
                            row_quantity: stake.q,
                            quantity: (stake.q * Math.pow(10, -$scope.asset.decimals)).toFixed(($scope.asset.quantity > 100 ? 0 : $scope.asset.decimals)),
                            share: ($scope.symbol == "ETP" ? (stake.q / $scope.circulation / 100000000 * 100).toFixed(3) : (stake.q / $scope.asset.quantity * 100).toFixed(3))
                        };
                    });

                    let rest = {
                        share: 100,
                        quantity: $scope.asset.quantity / Math.pow(10, -$scope.asset.decimals)
                    };
                    $scope.stakelist.forEach((stake) => {
                        rest.share -= stake.share;
                        rest.quantity -= stake.quantity;
                    });
                    $scope.stakelist.sort((a, b) => a.quantity - b.quantity);
                    $scope.stakelist = [rest].concat($scope.stakelist);
                    console.log($scope.stakelist);
                    //$scope.stakelist.push(rest);

                    var h = 800;
                    var r = h / 2;
                    var arc = d3.svg.arc().outerRadius(r);

                    $scope.data = [];

                    $scope.locations = {};

                    $scope.colors = [
                        "#006599", // dark blue
                        "#0099CB", // blue
                        '#fe6700', // orange
                        '#ffd21c', // yellow
                        "#fe0000" // red
                    ];

                    nv.addGraph(function() {
                        var chart = nv.models.pieChart()
                            .x(function(d) {
                                return "<b>" + ((d.address) ? d.address : 'others') + "</b>";
                            })
                            .y(function(d) {
                                return d.share;
                            })
                            .color($scope.colors)
                            .showLabels(true)
                            .showLegend(false)
                            .labelType("percent");

                        d3.select("#chart svg")
                            .datum($scope.stakelist)
                            .transition().duration(1200)
                            .call(chart);

                        var positionX = 210;
                        var positionY = 30;
                        var verticalOffset = 25;

                        d3.selectAll('.nv-legend .nv-series')[0].forEach(function(d) {
                            positionY += verticalOffset;
                            d3.select(d).attr('transform', 'translate(' + positionX + ',' + positionY + ')');
                        });

                        return chart;
                    });

                });
        }
    }

})();
