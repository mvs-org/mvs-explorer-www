(function() {
    'use strict';

    angular
        .module('app')
        .directive('ngEnter', function() {
            return function(scope, element, attrs) {
                element.bind("keydown keypress", function(event) {
                    if (event.which === 13) {
                        scope.$apply(function() {
                            scope.$eval(attrs.ngEnter);
                        });
                        event.preventDefault();
                    }
                });
            };
        })
        .controller('MenuController', MenuController)
        .controller('ExplorerController', ExplorerController)
        .controller('SearchController', SearchController)
        .controller('NodeMapController', NodeMapController)
        .controller('ChartController', ChartController)
        .controller('TransactionController', TransactionController)
        .controller('TransactionsController', TransactionsController)
        .directive('checkImage', function() {
            return {
                link: function(scope, element, attrs) {
                    element.bind('error', function() {
                        element.attr('src', 'img/assets/default.png'); // set default image
                    });
                }
            };
        })
        .directive('mdHideAutocompleteOnEnter', function() {
            return function(scope, element, attrs) {
                element.bind("keydown keypress", function(event) {
                    if (event.which === 13) {
                        scope.$apply(function() {
                            scope.$$childHead.$mdAutocompleteCtrl.hidden = true;
                        });
                        event.preventDefault();
                    }
                });
            };
        });



    function MenuController($location, $rootScope) {

        function setMenu() {
            $rootScope.selectedMenu = {
                main: $location.path().split('/')[1]
            };
        }
        setMenu();
        $rootScope.$on("$locationChangeStart", function(event, next, current) {
            setMenu();
        });
    }

    function ChartController($scope, MetaverseService) {
        var h = 600;
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


        // api call
        MetaverseService.Chart()
            .then((res) => {
                $scope.data = res.data.result;
                let rest_part = 1000;
                $scope.data.forEach((miner) => {
                    rest_part -= miner.counter;
                    if ($scope.locations[miner.origin] == undefined)
                        $scope.locations[miner.origin] = [];
                    $scope.locations[miner.origin].push(miner);
                });
                $scope.data = [{
                    name: 'others',
                    url: "",
                    counter: rest_part
                }].concat($scope.data);
                $scope.data.sort((a, b) => a.counter > b.counter);
                $scope.locationsmap = Object.keys($scope.locations);

            }).then(() => {

                nv.addGraph(function() {
                    var chart = nv.models.pieChart()
                        .x(function(d) {
                            return "<b>" + d.name + "</b><br>" + d.url;
                        })
                        .y(function(d) {
                            return d.counter / 10;
                        })
                        .color($scope.colors)
                        .showLabels(true)
                        .showLegend(false)
                        .labelType("percent");

                    d3.select("#chart svg")
                        .datum($scope.data)
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

    function ExplorerController($translate, localStorageService, $scope) {

        $scope.changeLang = changeLang;
        $scope.selectedLang = localStorageService.get('language');

        function changeLang(key) {
            //document.getElementById('language_selector').setAttribute("lang", key);
            $translate.use(key)
                .then((key) => localStorageService.set('language', key))
                .catch((key) => console.log("Cannot change language."));
        };

    }

    function NodeMapController($scope, MetaverseService) {

        var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 7,
            minZoom: 2,
            attribution: ''
        });
        var latlng = L.latLng(50.5, 30.51);

        var map = L.map('nodemap', {
            center: latlng,
            zoom: 2,
            attributionControl: false,
            layers: [tiles]
        });

        var markers = L.markerClusterGroup({
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false
        });

        var polygon;
        markers.on('clustermouseover', function(a) {
            if (polygon) {
                map.removeLayer(polygon);
            }
            polygon = L.polygon(a.layer.getConvexHull());
            map.addLayer(polygon);
        });

        markers.on('clustermouseout', function(a) {
            if (polygon) {
                map.removeLayer(polygon);
                polygon = null;
            }
        });

        map.on('zoomend', function() {
            if (polygon) {
                map.removeLayer(polygon);
                polygon = null;
            }
        });

        var geojsonAjax = new L.GeoJSON.AJAX(MetaverseService.SERVER + "/locations");
        geojsonAjax.on('data:loaded', function() {
            // Clustering disabled for chen hao
            // markers.addLayer(geojsonAjax);
            // map.addLayer(markers);
            $scope.nodeCount = Object.keys(geojsonAjax._layers).length;
            $scope.$apply();
            map.addLayer(geojsonAjax);
        });
        map.addLayer(markers);
    }


    function MiningController(MetaverseService, $scope, $translate) {
        $scope.loading_mining_info = true;
        $scope.loading_circulation = true;
        $scope.loading_pricing = true;
        $scope.loading_blocktimes = true;
        $scope.loading_difficulty = true;

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
        getMiningInfo();
    }

    function TransactionController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope) {

        var transaction_hash = $stateParams.hash;
        $scope.loading_tx = true;
        $rootScope.nosplash = true;
        $scope.loading_confirmation = true;

        $scope.format = (value, decimals) => value / Math.pow(10, decimals);

        if (typeof transaction_hash !== 'undefined') {
            NProgress.start();
            MetaverseService.FetchTx(transaction_hash)
                .then((response) => {
                    $scope.loading_tx = false;
                    if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                        $scope.transaction = response.data.result;
                        $scope.messages = [];
                        if ($scope.transaction.outputs.length) {
                            $scope.transaction.outputs.forEach(function(output) {
                                if (output.attachment.type == "message") {
                                    $scope.messages.push(output.attachment.content);
                                }
                                if (output.locked_height_range)
                                    output.unlock_block = $scope.transaction.height + output.locked_height_range;
                            });
                        }
                    } else {
                        $translate('MESSAGES.ERROR_TRANSACTION_NOT_FOUND')
                            .then((data) => {
                                FlashService.Error(data, true);
                                $location.path('/');
                            });
                    }
                    NProgress.done();
                })
                .then(() => MetaverseService.FetchHeight())
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                        $scope.height = response.data.result;
                        $scope.confirmations = $scope.height - $scope.transaction.height + 1;
                        $scope.loading_confirmation = false;
                    }
                });
        }
    }

    function SearchController($scope, MetaverseService, $translate, $location, FlashService, $filter, Assets) {

        $scope.presEnterSearch = presEnterSearch;

        $scope.querySearch = querySearch;
        $scope.selectedItemChange = selectedItemChange;
        $scope.searchTextChange = searchTextChange;
        $scope.search = search;
        $scope.setResults = setResults;
        $scope.setResultsTx = setResultsTx;
        $scope.initialSuggestion = [];
        $scope.init = init;
        $scope.icons = Assets.hasIcon;

        function init() {
            $translate(['SUGGESTION.SHOW_ALL_TX', 'SUGGESTION.SHOW_ALL_BLOCKS', 'SUGGESTION.SHOW_ALL_ASSETS'])
                .then((translations) => {
                    $scope.initialSuggestion.push({
                        'name': translations['SUGGESTION.SHOW_ALL_TX'],
                        'url': 'txs',
                        'type': 'tx',
                    });
                    $scope.initialSuggestion.push({
                        'name': translations['SUGGESTION.SHOW_ALL_BLOCKS'],
                        'url': 'blocks',
                        'type': 'blockHeight',
                    });
                    $scope.initialSuggestion.push({
                        'name': translations['SUGGESTION.SHOW_ALL_ASSETS'],
                        'url': 'assets',
                        'type': 'asset',
                        'icon': 'default'
                    });
                    $scope.initialSuggestion.push({
                        'name': translations['SUGGESTION.SHOW_ALL_AVATARS'],
                        'url': 'avatars',
                        'type': 'avatar'
                    });
                });
        }

        init();

        function querySearch(query) {
            return (query && query.length >= 3) ? search(query) : $scope.initialSuggestion;
        }


        function presEnterSearch(search_field) {
            if (search_field == "") {
                $translate('MESSAGES.ERROR_SEARCH_NOT_FOUND')
                    .then((data) => FlashService.Error(data));
            } else if ($filter('uppercase')(search_field) == "ETP") {
                $location.path('/asset/ETP');
            } else {
                switch (search_field.length) {
                    case 64:
                        show_transaction_or_block(search_field);
                        break;
                    case 34:
                        show_address(search_field);
                        break;
                    default:
                        if (!isNaN(search_field))
                            show_block(search_field);
                        else
                            show_asset($filter('uppercase')(search_field));
                }
            }
        }

        function show_address(search_field) {
            NProgress.start();
            MetaverseService.FetchHistory(search_field)
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $location.path('/adr/' + search_field);
                    } else {
                        $translate('MESSAGES.ERROR_ADDRESS_NOT_FOUND')
                            .then((data) => FlashService.Error(data));
                    }
                    NProgress.done();
                });
        }

        function show_block(search_field) {
            NProgress.start();
            MetaverseService.Block(search_field)
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $location.path('/blk/' + search_field);
                    } else {
                        $translate('MESSAGES.ERROR_BLOCK_NOT_FOUND')
                            .then((data) => FlashService.Error(data));
                    }
                    NProgress.done();
                });
        }


        function show_transaction_or_block(search_field) {
            NProgress.start();
            MetaverseService.FetchTx(search_field)
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $location.path('/tx/' + search_field);
                    } else {
                        MetaverseService.Block(search_field)
                            .then((response) => {
                                if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                                    $location.path('/blk/' + search_field);
                                } else {
                                    $translate('MESSAGES.ERROR_TRANSACTION_NOT_FOUND')
                                        .then((data) => FlashService.Error(data));
                                }
                                NProgress.done();
                            });
                    }
                    NProgress.done();
                });
        }

        function show_asset(search_field) {
            NProgress.start();
            MetaverseService.AssetInfo(search_field)
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined && response.data.result.length != 0) {
                        $location.path('/asset/' + search_field);
                    } else {
                        $translate('MESSAGES.ERROR_SEARCH_NOT_FOUND')
                            .then((data) => FlashService.Error(data));
                    }
                    NProgress.done();
                });
        }

        function searchTextChange(text) {

        }

        function selectedItemChange(item) {

        }

        function search(text) {
            return MetaverseService.SearchAll(text, 10)
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        return setResults(text, response.data.result);
                    } else return [];
                });
        }

        function setResults(text, result) {
            return Promise.all([setResultsInit(text), setResultsAsset(result.asset), setResultsAddress(result.address), setResultsAvatar(result.avatar), setResultsTx(result.tx), setResultsBlockHash(result.block)])
                .then((results) => results.reduce((acc, val) => acc.concat(val)));
        }

        function setResultsInit(text) {
            var repos = [];
            if (!isNaN(text)) {
                repos.push({
                    'name': text,
                    'url': 'blk/' + text,
                    'type': 'blockHeight',
                });
            } else if ($filter('uppercase')(text) == "ETP") {
                repos.push({
                    'name': 'ETP',
                    'url': 'asset/ETP',
                    'type': 'asset',
                    'icon': 'ETP'
                });
            }
            return repos;
        }

        function setResultsAsset(assets) {
            return assets.map((asset) => {
                return {
                    name: asset,
                    url: "asset/" + asset,
                    type: "asset",
                    icon: $scope.icons.indexOf(asset) > -1 ? asset : 'default'
                };
            });
        }

        function setResultsAvatar(avatars) {
            return avatars.map((avatar) => {
                return {
                    name: avatar,
                    url: 'avatar/' + avatar,
                    type: 'avatar'
                };
            });
        }

        function setResultsAddress(addresses) {
            return addresses.map((address) => {
                return {
                    name: address.a,
                    url: "adr/" + address.a,
                    nbrtx: address.n,
                    type: "address"
                };
            });
        }

        function setResultsTx(txs) {
            return txs.map((tx) => {
                return {
                    name: tx.h,
                    url: "tx/" + tx.h,
                    height: tx.b,
                    type: "tx"
                };
            });
        }

        function setResultsBlockHash(blocks) {
            return blocks.map((block) => {
                return {
                    name: block.h,
                    url: "blk/" + block.h,
                    height: block.n,
                    type: "blockHash"
                };
            });
        }

    }
})();
