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
        .controller('StartpageController', StartpageController)
        .controller('MiningController', MiningController)
        .controller('SearchController', SearchController)
        .controller('AddressController', AddressController)
        .controller('BlockController', BlockController)
        .controller('BlocksController', BlocksController)
        .controller('NodeMapController', NodeMapController)
        .controller('ChartController', ChartController)
        .controller('BlockListController', BlockListController)
        .controller('TransactionListController', TransactionListController)
        .controller('TransactionController', TransactionController)
        .controller('TransactionsController', TransactionsController)
        .controller('AssetsListController', AssetsListController)
        .controller('AssetController', AssetController)
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

    function BlocksController($scope, MetaverseService) {

        $scope.items_per_page = 50;

        $scope.switchPage = (page) => {
            $scope.loading = true;
            return MetaverseService.ListBlocks(page-1)
                .then((response) => {
                    $scope.blocks = response.data.result.result;
                    $scope.total_count = response.data.result.count;
                    $scope.loading = false;
                })
                .catch((error) => {
                    $scope.loading = false;
                    console.error(error);
                });
        };

        $scope.switchPage(1);

    }

    function TransactionsController($scope, MetaverseService) {

        $scope.items_per_page = 10;
        $scope.minDate = new Date(2017, 2 - 1, 11);
        $scope.maxDate = new Date();

        $scope.switchPage = (page) => {
            $scope.current_page = page;
            return load();
        };

        $scope.applyFilters = () => {
            $scope.current_page = 1;
            return load();
        };

        var load = () => {
            $scope.loading_txs = true;
            return MetaverseService.Txs($scope.current_page-1, ($scope.min_date) ? $scope.min_date.getTime() / 1000 : null, ($scope.max_date) ? ($scope.max_date).getTime() / 1000 + 86400 : null)
                .then((response) => {
                    $scope.txs = response.data.result.result;
                    $scope.total_count = response.data.result.count;
                    $scope.loading_txs = false;
                })
                .catch((error) => {
                    $scope.loading_txs = false;
                    console.error(error);
                });
        };

        $scope.switchPage(1);

    }

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

    function ExplorerController($translate, localStorageService, $scope, $rootScope) {

        $scope.changeLang = changeLang;
        $scope.selectedLang = localStorageService.get('language');

        $scope.setPriority = setPriority;

        function changeLang(key) {
            //document.getElementById('language_selector').setAttribute("lang", key);
            $translate.use(key)
                .then((key) => localStorageService.set('language', key))
                .catch((key) => console.log("Cannot change language."));
        };

        function setPriority() {
            $rootScope.priority = [];
            $rootScope.priority["ETP"] = 1;
            $rootScope.priority["MVS.ZGC"] = 10;
            $rootScope.priority["MVS.ZDC"] = 20;
            $rootScope.priority["CSD"] = 30;
        };

        setPriority();

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

    function BlockListController($scope, $wamp, $interval) {

        $scope.currentTimeStamp = Math.floor(Date.now());
        $interval(() => $scope.currentTimeStamp = Math.floor(Date.now()), 1000);

        function AddBlocksToBlocks(blocks) {
            blocks = blocks.concat($scope.blockList);
            $scope.blockList = blocks.slice(0, 10);
        }

        (() => {
            $wamp.subscribe('public.blocks', (args) => {
                $scope.loading_blocks = false;
                if (args[1] == 'i')
                    $scope.blockList = args[0];
                else
                    AddBlocksToBlocks(args[0]);

            }).then((subscription) => {
                $scope.$on('$destroy', () => {
                    // console.log('unsubscribe block')
                    $wamp.unsubscribe(subscription);
                });
            });
        })();
    }

    function TransactionListController($scope, $wamp, $interval) {

        $scope.currentTimeStamp = Math.floor(Date.now());
        $interval(() => $scope.currentTimeStamp = Math.floor(Date.now()), 1000);

        function AddTxsToTxs(txs) {
            txs = txs.concat($scope.txList);
            $scope.txList = txs.slice(0, 10);
        }

        (() => {
            $wamp.subscribe('public.transactions', (args) => {
                $scope.loading_txs = false;
                if (args[1] == 'i')
                    $scope.txList = args[0];
                else
                    AddTxsToTxs(args[0]);
            }).then((subscription) => {
                $scope.$on('$destroy', () => {
                    // console.log('unsubscribe txs')
                    $wamp.unsubscribe(subscription);
                });
            });
        })();

    }


    function MiningController(MetaverseService, $scope) {
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
                            axisLabel: 'Height'
                        },
                        yAxis: {
                            axisLabelDistance: -65,
                            axisLabel: 'Difficulty (bits)'
                        }
                    }
                },
                data: [{
                    values: data
                }]
            };
        }

        function drawBlocktimes(data) {
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
                            axisLabel: 'Height'
                        },
                        yAxis: {
                            axisLabel: 'Time (s)'
                        }
                    }
                },
                data: [{
                    values: data
                }]
            };
        }
        getCirculation();
        getStatistics();
        getPricing();
        getMiningInfo();
    }

    function StartpageController($scope, $location, localStorageService, FlashService, $translate, $interval, $wamp) {

        $scope.startpage = () => $location.path('/');
        $scope.loading_blocks = true;
        $scope.loading_txs = true;

        $scope.format = (value, decimals) => value / Math.pow(10, decimals);

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

    function BlockController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope) {

        var number = $stateParams.number;
        $rootScope.nosplash = true;
        $scope.loading_block = true;
        $scope.loading_txs = true;
        $scope.loading_confirmation = true;

        $scope.format = (value, decimals) => value / Math.pow(10, decimals);

        if (number != undefined) {
            NProgress.start();
            MetaverseService.Block(number)
                .then((response) => {
                    $scope.loading_block = false;
                    if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                        $scope.block = response.data.result;
                    } else {
                        $translate('MESSAGES.ERROR_BLOCK_NOT_FOUND')
                            .then((data) => {
                                $location.path('/');
                                FlashService.Error(data, true);
                            });
                    }
                    NProgress.done();
                })
                .then(() => MetaverseService.BlockTxs($scope.block.hash))
                .then((response) => {
                    $scope.loading_txs = false;
                    if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                        $scope.txs = response.data.result.result;
                    } else {
                        $translate('MESSAGES.ERROR_BLOCK_TXS_NOT_FOUND')
                            .then((data) => {
                                $location.path('/');
                                FlashService.Error(data, true);
                            });
                    }
                })
                .then(() => MetaverseService.FetchHeight())
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                        $scope.height = response.data.result;
                        $scope.confirmations = $scope.height - $scope.block.number + 1;
                        $scope.loading_confirmation = false;
                    }
                });
        }
    }


    function AddressController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope) {

        var address = $stateParams.address;
        $rootScope.nosplash = true;
        $scope.loading_address = true;
        $scope.info = [];
        $scope.tokens = [];
        $scope.definitions = [];
        $scope.items_per_page = 10;
        $scope.minDate = new Date(2017, 2 - 1, 11);
        $scope.maxDate = new Date();

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
                                if (typeof $rootScope.priority[symbol] != 'undefined') {
                                    $scope.definitions[symbol].priority = $rootScope.priority[symbol];
                                } else {
                                    $scope.definitions[symbol].priority = 1000;
                                }
                            }

                            $scope.addressAssets = [];
                            var assetETP = [];
                            assetETP.symbol = "ETP";
                            assetETP.priority = $rootScope.priority["ETP"];
                            assetETP.decimals = 8;
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

    function AssetsListController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope) {

        $scope.loading_assets = true;

        listAssets();

        function listAssets() {
            NProgress.start();
            MetaverseService.ListAssets()
                .then((response) => {
                    $scope.loading_assets = false;
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $scope.assets = response.data.result;
                    }
                    $scope.assets.forEach(function(asset) {
                        if (typeof $rootScope.priority[asset.symbol] != 'undefined') {
                            asset.priority = $rootScope.priority[asset.symbol];
                        } else {
                            asset.priority = 1000;
                        }
                    });
                    NProgress.done();
                });
        }

    }


    function AssetController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate) {

        $scope.symbol = $stateParams.symbol;
        $scope.loading_asset = true;
        $scope.getCirculation = getCirculation;

        if ($scope.symbol != undefined && $scope.symbol != "ETP") {
            NProgress.start();
            MetaverseService.AssetInfo($scope.symbol)
                .then((response) => {
                    $scope.loading_asset = false;
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $scope.asset = response.data.result[0];
                    }
                })
                .then(() => loadStakelist())
                .then(() => NProgress.done());
        } else if ($scope.symbol == "ETP") {
            $scope.loading_asset = false;
            $scope.asset = [];
            $scope.asset.symbol = "ETP";
            $scope.asset.quantity = 10000000000000000;
            $scope.asset.decimals = 8;
            $scope.asset.issuer = "mvs.org";
            $scope.asset.address = "MGqHvbaH9wzdr6oUDFz4S1HptjoKQcjRve";
            $scope.asset.hash = "2a845dfa63a7c20d40dbc4b15c3e970ef36332b367500fd89307053cb4c1a2c1";
            $scope.asset.height = 0;
            $scope.asset.description = "MVS Official Token";
            getCirculation()
                .then(() => loadStakelist())
                .then(() => NProgress.done());
        }

        function getCirculation() {
            return MetaverseService.Circulation().then((response) => {
                $scope.loading_circulation = false;
                if (response.data.status && response.data.status.success) {
                    $scope.circulation = parseFloat(response.data.result).toFixed(0);
                }
            }, console.error);
        }

        function loadStakelist() {
            return MetaverseService.AssetStakes($scope.symbol)
                .then((stakes) => {
                    $scope.stakelist = stakes.data.result.map((stake) => {
                        return {
                            address: stake.a,
                            quantity: (stake.q * Math.pow(10, -$scope.asset.decimals)).toFixed(($scope.asset.quantity > 100 ? 0 : $scope.asset.decimals)),
                            share: ($scope.symbol == "ETP" ? (stake.q / $scope.circulation/100000000 * 100).toFixed(3) : (stake.q / $scope.asset.quantity * 100).toFixed(3))
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

                    $scope.stakelist.push(rest);

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
                        "#fe0000", // red
                        "#ED230D" // dark red
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

    function SearchController($scope, MetaverseService, $translate, $location, FlashService, $filter) {

        $scope.presEnterSearch = presEnterSearch;

        $scope.querySearch = querySearch;
        $scope.selectedItemChange = selectedItemChange;
        $scope.searchTextChange = searchTextChange;
        $scope.search = search;
        $scope.setResults = setResults;
        $scope.setResultsTx = setResultsTx;
        $scope.initialSuggestion = [];
        $scope.init = init;

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
            return Promise.all([setResultsInit(text), setResultsAsset(result.asset), setResultsAddress(result.address), setResultsTx(result.tx), setResultsBlockHash(result.block)])
                .then((results) => {
                    var repos = [];
                    repos.push.apply(repos, results[0]);
                    repos.push.apply(repos, results[1]);
                    repos.push.apply(repos, results[2]);
                    repos.push.apply(repos, results[3]);
                    repos.push.apply(repos, results[4]);
                    return repos;
                })
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
                });
            }
            return repos;
        }

        function setResultsAsset(assets) {
            var result = [];
            return Promise.all(assets.map((asset) => {
                    var addasset = {};
                    addasset.name = asset;
                    addasset.url = "asset/" + asset;
                    addasset.type = "asset";
                    result.push(addasset);
                }))
                .then(() => result);
        }

        function setResultsAddress(addresses) {
            var result = [];
            return Promise.all(addresses.map((address) => {
                    var addaddress = {};
                    addaddress.name = address.a;
                    addaddress.url = "adr/" + address.a;
                    addaddress.nbrtx = address.n;
                    addaddress.type = "address";
                    result.push(addaddress);
                }))
                .then(() => result);
        }

        function setResultsTx(txs) {
            var result = [];
            return Promise.all(txs.map((tx) => {
                    var addtx = {};
                    addtx.name = tx.h;
                    addtx.url = "tx/" + tx.h;
                    addtx.height = tx.b;
                    addtx.type = "tx";
                    result.push(addtx);
                }))
                .then(() => result);
        }



        function setResultsBlockHash(blocks) {
            var result = [];
            return Promise.all(blocks.map((block) => {
                    var addblock = {};
                    addblock.name = block.h;
                    addblock.url = "blk/" + block.h;
                    addblock.height = block.n;
                    addblock.type = "blockHash";
                    result.push(addblock);
                }))
                .then(() => result);
        }

    }
})();
