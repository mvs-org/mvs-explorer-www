(function() {
    'use strict';

    angular
        .module('app')
        .controller('StatsController', StatsController);

    function StatsController(MetaverseService, $scope, $translate) {
        $scope.loading_txcount = true;
        $scope.loading_mining_info = true;
        $scope.loading_blocktimes = true;

        $scope.interval = 1000;  

        function getStatisticsByDate() {
            return MetaverseService.BlockStatsByDate('txcount')
                .then((response) => {
                    var txPerDay = [];
                    let maxTxPerDayY = 0;
                    response.data.result.forEach((point) => {
                        maxTxPerDayY = Math.max(maxTxPerDayY, point[1]);
                        txPerDay.push({
                            x: new Date(point[0]),
                            y: point[1]
                        });
                    });
                    $scope.lastTxPerDay = response.data.result[0][1];
                    //Remove the first day since it was not a full day
                    txPerDay.pop();
                    drawTxCount(txPerDay, maxTxPerDayY);
                    $scope.loading_txcount = false;
                });
        }

        function drawTxCount(data, maxY) {
            $translate(['STATS.DATE', 'STATS.NBR_TRANSACTIONS'])
                .then((translations) => {
                    $scope.txcountChart = {
                        options: {
                            chart: {
                                type: 'lineChart',
                                height: 450,
                                margin: {
                                    top: 20,
                                    right: 40,
                                    bottom: 40,
                                    left: 95
                                },
                                y: function(d) {
                                    return d.y;
                                },
                                showLegend: false,
                                xAxis: {
                                    tickFormat: function(d) {
                                        return d3.time.format('%d/%m/%y')(new Date(d));
                                    },
                                    axisLabel: translations['STATS.DATE']
                                },
                                yAxis: {
                                    axisLabel: translations['STATS.NBR_TRANSACTIONS']
                                },
                                yDomain: [0, maxY]
                            }
                        },
                        data: [{
                            values: data
                        }]
                    };
                });
        }

        function getBlocktime() {
            return MetaverseService.BlockStats('pow', 10)
                .then((response) => {
                    var blocktimes = [];
                    response.data.result.forEach((point) => {
                        blocktimes.push({
                            x: point[0],
                            y: point[1]
                        });
                    });
                    drawBlocktimes(blocktimes);
                    $scope.loading_blocktimes = false;
                });
        }

        function drawBlocktimes(data) {
            $translate(['HEIGHT', 'GRAPH.TIME'])
                .then((translations) => {
                    $scope.blocktimeChart = {
                        options: {
                            chart: {
                                type: 'lineChart',
                                height: 450,
                                margin: {
                                    top: 20,
                                    right: 40,
                                    bottom: 40,
                                    left: 95
                                },
                                showLegend: false,
                                xAxis: {
                                    axisLabel: translations['HEIGHT']
                                },
                                yAxis: {
                                    axisLabel: translations['GRAPH.TIME']
                                }
                            }
                        },
                        data: [{
                            values: data
                        }]
                    };
                });
        }

        //Mining info
        MetaverseService.MiningInfo($scope.interval)
            .then((response) => {
                $scope.loading_mining_info = false;
                if (response.data.status && response.data.status.success) {
                    $scope.mining_info = response.data.result;
                    $scope.block_type_data = $scope.mining_info.stats.reverse();
                }
            });

        MetaverseService.AvatarsCount()
            .then((response) => {
                $scope.avatarCount = response.data.result.count;
            })
            .catch((error) => {
                $scope.avatarCount = ' ';
                console.error(error);
            });

        MetaverseService.AssetsCount()
            .then((response) => {
                $scope.assetCount = response.data.result.count;
            })
            .catch((error) => {
                $scope.assetCount = '';
                console.error(error);
            });

        MetaverseService.CertsCount()
            .then((response) => {
                $scope.certCount = response.data.result.count;
            })
            .catch((error) => {
                $scope.certCount = '';
                console.error(error);
            });

        MetaverseService.MitsCount()
            .then((response) => {
                $scope.mitCount = response.data.result.count;
            })
            .catch((error) => {
                $scope.mitCount = '';
                console.error(error);
            });

        getStatisticsByDate();
        getBlocktime();
    }

})();
