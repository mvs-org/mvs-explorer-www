(function() {
    'use strict';

    angular
        .module('app')
        .controller('MiningController', MiningController);

    function MiningController(MetaverseService, $scope, $translate) {
        $scope.loading_mining_info = true;
        $scope.loading_circulation = true;
        $scope.loading_pricing = true;
        $scope.loading_blocktimes = true;
        $scope.loading_difficulty = true;
        $scope.loading_eth_swap = true;

        function getMiningInfo() {
            return MetaverseService.MiningInfo().then((response) => {
                $scope.loading_mining_info = false;
                if (response.data.status && response.data.status.success)
                    $scope.mining_info = response.data.result;
            }, console.error);
        }

        function getCirculation() {
            return MetaverseService.Circulation().then((response) => {
                $scope.loading_circulation = false;
                if (response.data.status && response.data.status.success) {
                    $scope.circulation = parseFloat(response.data.result).toFixed(0);
                }
            }, console.error);
        }

        function getPricing() {
            return MetaverseService.Pricing().then((response) => {
                $scope.loading_pricing = false;
                if (response.data.status && response.data.status.success)
                    $scope.pricing = response.data.result;
            }, console.error);
        }

        function getEthSwapRate() {
            return MetaverseService.GetEthSwapRate().then((response) => {
                $scope.loading_eth_swap = false;
                if (response.data.status && response.data.status.success)
                    $scope.eth_swap_rate = response.data.result;
            }, console.error);
        }

        function getStatistics() {
            return MetaverseService.BlockStats()
                .then((response) => {
                    var blocktimes = [];
                    var difficulties = [];
                    response.data.result.forEach((point) => {
                        blocktimes.push({
                            x: point[0],
                            y: point[1]
                        });
                        difficulties.push({
                            x: point[0],
                            y: point[2]
                        });
                    });
                    drawBlocktimes(blocktimes);
                    drawDifficulties(difficulties);
                    $scope.loading_blocktimes = false;
                    $scope.loading_difficulty = false;
                });
        }

        function drawDifficulties(data) {
            $translate(['HEIGHT', 'GRAPH.DIFFICULTY'])
                .then((translations) => {
                    $scope.difficultyChart = {
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
                                    axisLabel: translations['HEIGHT']
                                },
                                yAxis: {
                                    axisLabelDistance: -65,
                                    axisLabel: translations['GRAPH.DIFFICULTY']
                                }
                            }
                        },
                        data: [{
                            values: data
                        }]
                    };
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
        getCirculation();
        getStatistics();
        getPricing();
        getEthSwapRate();
        getMiningInfo();
    }

})();
