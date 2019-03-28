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
        $scope.loading_blocktimes = true;
        $scope.loading_difficulty = true;
        $scope.loading_pos_difficulty = true;

        var h = 600;
        var r = h / 2;
        $scope.powInterval = 3000;
        $scope.posInterval = 1000;
        $scope.posTop = 20;

        $scope.block_type_data = [];
        $scope.interval = 1000;

        $scope.powdata = [];
        $scope.posminers = [];
        $scope.posVotesInfo = {};
        $scope.locations = {}; 
        $scope.avatars = [];  

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
                    $scope.pow_mining_info.difficulty_simplify = simplify($scope.pow_mining_info.difficulty);
            }, console.error);
        }

        function getPosMiningInfo() {
            return MetaverseService.PosMiningInfo().then((response) => {
                $scope.loading_pos_mining_info = false;
                if (response.data.status && response.data.status.success)
                    $scope.pos_mining_info = response.data.result;
                    $scope.pos_mining_info.difficulty_simplify = simplify($scope.pos_mining_info.difficulty);
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
                    maxDifficultyY = Math.floor(maxDifficultyY+1);
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
            if(difficulty > 1000000000000) {
                result.text = "GRAPH.DIFFICULTY_TERA";
                result.divisor = 1000000000000;
                result.letter = 'T';
            } else if (difficulty > 1000000000) {
                result.text = "GRAPH.DIFFICULTY_GIGA";
                result.divisor = 1000000000;
                result.letter = 'G';
            } else if (difficulty > 1000000) {
                result.text = "GRAPH.DIFFICULTY_MEGA";
                result.divisor = 1000000;
                result.letter = 'M';
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
                    maxY = Math.floor(maxY+1);
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
                    $scope.block_type_data = $scope.mining_info.stats.reverse();
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


        //PoW mining pools
        MetaverseService.Chart($scope.powInterval)
            .then((res) => {
                $scope.powdata = res.data.result;
                let rest_part = $scope.powInterval;
                $scope.powdata.forEach((miner) => {
                    rest_part -= miner.counter;
                    if ($scope.locations[miner.origin] == undefined)
                        $scope.locations[miner.origin] = [];
                    $scope.locations[miner.origin].push(miner);
                });
                $scope.powdata.sort((a, b) => a.counter - b.counter);
                $scope.powdata = [{
                    name: 'others',
                    url: "",
                    counter: rest_part
                }].concat($scope.powdata);
                $scope.locationsmap = Object.keys($scope.locations);

            }).then(() => {

                nv.addGraph(function() {
                    var chart = nv.models.pieChart()
                        .x(function(d) {
                            return "<b>" + d.name + "</b><br>" + d.url;
                        })
                        .y(function(d) {
                            return d.counter / $scope.powInterval * 100;
                        })
                        .color($scope.colors)
                        .showLabels(true)
                        .showLegend(false)
                        .labelType("percent");

                    d3.select("#chart svg")
                        .datum($scope.powdata)
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

        //PoS mining pools
        MetaverseService.PosVotes($scope.posInterval)
            .then((res) => {
                $scope.posminers = res.data.result.miners;
                $scope.posVotesInfo = res.data.result.info;
                $scope.nbrPosMiners = $scope.posminers.length;
                let limit = Math.min($scope.posTop, $scope.nbrPosMiners)
                $scope.posminers.forEach((miner) => {
                    let avatarInfo = {}
                    avatarInfo.symbol = miner.avatar;
                    avatarInfo.recentBlocks = miner.recentBlocks;
                    avatarInfo.totalVotes = miner.totalVotes;
                    miner.mstMining = miner.mstMining ? miner.mstMining : "None";
                    $scope.avatars.push(avatarInfo);
                });
                
                $scope.avatars.sort((a, b) => b.recentBlocks - a.recentBlocks);
                $scope.avatars = $scope.avatars.slice(0, limit)

                $scope.posminers.sort((a, b) => a.recentBlocks - b.recentBlocks);
                let otherMiners = $scope.posminers.slice(0, $scope.nbrPosMiners - limit);
                let others = {
                    avatar: 'others',
                    recentBlocks: 0,
                    totalVotes: 0,
                    pendingVotes: 0
                }
                otherMiners.forEach((otherMiner) => {
                    others.recentBlocks += otherMiner.recentBlocks;
                    others.totalVotes += otherMiner.totalVotes;
                    others.pendingVotes += otherMiner.pendingVotes;
                });
                $scope.posminers = [others].concat($scope.posminers.slice($scope.posminers.length - limit));
            }).then(() => {

                nv.addGraph(function() {
                    var poschart = nv.models.pieChart()
                        .x(function(d) {
                            return "<b>"+d.avatar+"</b><br>Recent blocks: "+d.recentBlocks+"<br>Total votes: "+d.totalVotes+"<br>Available votes: "+(d.totalVotes-d.pendingVotes)+"<br>Pending votes: "+d.pendingVotes+"<br>MST mining: "+d.mstMining;
                        })
                        .y(function(d) {
                            return d.recentBlocks / $scope.posInterval * 100;
                        })
                        .color($scope.colors)
                        .showLabels(true)
                        .showLegend(false)
                        .labelType("percent");

                    d3.select("#poschart svg")
                        .datum($scope.posminers)
                        .transition().duration(1200)
                        .call(poschart);

                    var positionX = 210;
                    var positionY = 30;
                    var verticalOffset = 25;

                    d3.selectAll('.nv-legend .nv-series')[0].forEach(function(d) {
                        positionY += verticalOffset;
                        d3.select(d).attr('transform', 'translate(' + positionX + ',' + positionY + ')');
                    });

                    return poschart;
                });

            });

        //MST mining stats
        MetaverseService.MstMining(10000)
            .then((res) => {
                $scope.mstMining = res.data.result;
                $scope.mstMining.counters.sort((a, b) => a.blocks - b.blocks);
                $scope.mstMined = [];
                $scope.mstMining.counters.forEach((miner) => {
                    let mstInfo = {}
                    mstInfo.mst = miner.mst;
                    mstInfo.share = Math.round(miner.blocks / $scope.mstMining.interval * 100 * 100)/100
                    $scope.mstMined.push(mstInfo);
                });
                $scope.mstMined.sort((a, b) => b.share - a.share);
            }).then(() => {

                nv.addGraph(function() {
                    var poschart = nv.models.pieChart()
                        .x(function(d) {
                            return "<b>"+(d.mst?d.mst:"Not mining any MST")+"</b>";
                        })
                        .y(function(d) {
                            return d.blocks / $scope.mstMining.interval * 100;
                        })
                        .color($scope.colors)
                        .showLabels(true)
                        .showLegend(false)
                        .labelType("percent");

                    d3.select("#mstminingchart svg")
                        .datum($scope.mstMining.counters)
                        .transition().duration(1200)
                        .call(poschart);

                    var positionX = 210;
                    var positionY = 30;
                    var verticalOffset = 25;

                    d3.selectAll('.nv-legend .nv-series')[0].forEach(function(d) {
                        positionY += verticalOffset;
                        d3.select(d).attr('transform', 'translate(' + positionX + ',' + positionY + ')');
                    });

                    return poschart;
                });

            });

        //MST mining list
        MetaverseService.MstMiningList().then((response) => {
            if (response.data.status && response.data.status.success)
                $scope.mstMiningList = response.data.result;
        }, console.error);

        getStatistics();
        getPosStatistics();
        getPowMiningInfo();
        getPosMiningInfo();
        //getInfo();
    }

})();
