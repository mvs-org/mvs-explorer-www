(function() {
    'use strict';

    angular
        .module('app')
        .controller('MiningController', MiningController);

    function MiningController(MetaverseService, $scope, $translate) {
        $scope.loading_info = true;
        $scope.loading_mining_info = true;
        $scope.loading_pow_mining_info = true;
        $scope.loading_pos_mining_info = true;
        $scope.loading_circulation = true;
        $scope.loading_pricing = true;
        $scope.loading_blocktimes = true;
        $scope.loading_difficulty = true;
        $scope.loading_pos_difficulty = true;
        $scope.loading_eth_swap = true;

        var h = 600;
        var r = h / 2;

        $scope.block_type_data = [];
        $scope.interval = 1000;

        $scope.colors = [
            "#006599", // dark blue
            "#0099CB", // blue
            '#fe6700', // orange
            '#ffd21c', // yellow
            "#fe0000" // red
        ];

        function getInfo() {
            return MetaverseService.Info().then((response) => {
                $scope.loading_info = false;
                if (response.data.status && response.data.status.success)
                    $scope.info = response.data.result;
            }, console.error);
        }

        function getPowMiningInfo() {
            return MetaverseService.PowMiningInfo().then((response) => {
                $scope.loading_pow_mining_info = false;
                if (response.data.status && response.data.status.success)
                    $scope.pow_mining_info = response.data.result;
            }, console.error);
        }

        function getPosMiningInfo() {
            return MetaverseService.PosMiningInfo().then((response) => {
                $scope.loading_pos_mining_info = false;
                if (response.data.status && response.data.status.success)
                    $scope.pos_mining_info = response.data.result;
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
            return MetaverseService.BlockStats('pow', 10)
                .then((response) => {
                    var blocktimes = [];
                    var difficulties = [];
                    let maxDifficultyY = 0;
                    let result_simplify = simplify(response.data.result[0][2]);
                    response.data.result.forEach((point) => {
                        maxDifficultyY = Math.max(maxDifficultyY, point[2]/result_simplify.divisor);
                        blocktimes.push({
                            x: point[0],
                            y: point[1]
                        });
                        difficulties.push({
                            x: point[0],
                            y: point[2]/result_simplify.divisor
                        });
                    });
                    maxDifficultyY = Math.round(maxDifficultyY);
                    drawBlocktimes(blocktimes);
                    drawDifficulties(difficulties, maxDifficultyY, result_simplify.text);
                    $scope.loading_blocktimes = false;
                    $scope.loading_difficulty = false;
                });
        }

        function simplify(difficulty) {
            var result = {};
            result.divisor = 1;
            result.text = "GRAPH.DIFFICULTY";
            if(difficulty > 10000000000000) {
                result.text = "GRAPH.DIFFICULTY_TERA";
                result.divisor = 1000000000000;
            } else if (difficulty > 10000000000) {
                result.text = "GRAPH.DIFFICULTY_GIGA";
                result.divisor = 1000000000;
            } else if (difficulty > 10000000) {
                result.text = "GRAPH.DIFFICULTY_MEGA";
                result.divisor = 1000000;
            }
            return result;
        }

        function getPosStatistics() {
            return MetaverseService.BlockStats('pos', 1)
                .then((response) => {
                    var difficulties = [];
                    let maxY = 0;
                    let result_simplify = simplify(response.data.result[0][2]);
                    response.data.result.forEach((point) => {
                        maxY = Math.max(maxY, point[2]/result_simplify.divisor);
                        difficulties.push({
                            x: point[0],
                            y: point[2]/result_simplify.divisor
                        });
                    });
                    maxY = Math.round(maxY);
                    drawPosDifficulties(difficulties, maxY, result_simplify.text);
                    $scope.loading_pos_difficulty = false;
                });
        }

        function drawDifficulties(data, maxY, text) {
            $translate(['HEIGHT', text])
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
                                    axisLabel: translations[text]
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

        function drawPosDifficulties(data, maxY, text) {
            $translate(['HEIGHT', text])
                .then((translations) => {
                    $scope.posDifficultyChart = {
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
                                    axisLabel: translations[text]
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
                    $scope.block_type_data = $scope.mining_info.stats;
                }
            }).then(() => {

                nv.addGraph(function() {
                    var blockstypechart = nv.models.pieChart()
                        .x(function(d) {
                            return d.type;
                        })
                        .y(function(d) {
                            return d.counter / $scope.interval * 100;
                        })
                        .color($scope.colors)
                        .showLabels(true)
                        .showLegend(false)
                        .labelType("percent");

                    d3.select("#blockstypechart svg")
                        .datum($scope.block_type_data)
                        .transition().duration(1200)
                        .call(blockstypechart);

                    var positionX = 210;
                    var positionY = 30;
                    var verticalOffset = 25;

                    d3.selectAll('.nv-legend .nv-series')[0].forEach(function(d) {
                        positionY += verticalOffset;
                        d3.select(d).attr('transform', 'translate(' + positionX + ',' + positionY + ')');
                    });

                    return blockstypechart;
                });

            });

        getCirculation();
        getStatistics();
        getPosStatistics();
        getPricing();
        getEthSwapRate();
        getPowMiningInfo();
        getPosMiningInfo();
        getInfo();
    }

})();
