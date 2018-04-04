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
        .controller('SearchController', SearchController)
        .controller('AddressController', AddressController)
        .controller('BlockController', BlockController)
        .controller('NodeMapController', NodeMapController)
        .controller('ChartController', ChartController)
        .controller('BlockListController', BlockListController)
        .controller('TransactionListController', TransactionListController)
        .controller('TransactionController', TransactionController)
        .controller('AssetsController', AssetsController)
        .directive('checkImage', function() {
         return {
            link: function(scope, element, attrs) {
               element.bind('error', function() {
                  element.attr('src', 'img/assets/default.png'); // set default image
               });
             }
           }
        });

    function MenuController($location, $rootScope){

      function setMenu(){
        $rootScope.selectedMenu={
          main: $location.path().split('/')[1]
        }
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
                $scope.data.sort((a,b)=>a.counter>b.counter);
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

        var geojsonAjax = new L.GeoJSON.AJAX(MetaverseService.SERVER+"/locations");
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

    function SearchController($scope, MetaverseService, $translate, $location, FlashService) {
        $scope.search = search;

        function search() {
            switch ($scope.search_field.length) {
                case 64:
                    show_transaction();
                    break;
                case 34:
                    show_address();
                    break;
                default:
                    show_block();
            }
        }

        function show_address() {
            NProgress.start();
            MetaverseService.FetchHistory($scope.search_field)
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $location.path('/adr/' + $scope.search_field);
                    } else {
                        $translate('MESSAGES.ERROR_ADDRESS_NOT_FOUND')
                            .then((data) => FlashService.Error(data));
                    }
                    NProgress.done();
                });
        }

        function show_block() {
            NProgress.start();
            MetaverseService.Block($scope.search_field)
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $location.path('/blk/' + $scope.search_field);
                    } else {
                        $translate('MESSAGES.ERROR_BLOCK_NOT_FOUND')
                            .then((data) => FlashService.Error(data));
                    }
                    NProgress.done();
                });
        }


        function show_transaction() {
            NProgress.start();
            MetaverseService.FetchTx($scope.search_field)
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined) {
                        $location.path('/tx/' + $scope.search_field);
                    } else {
                        $translate('MESSAGES.ERROR_TRANSACTION_NOT_FOUND')
                            .then((data) => FlashService.Error(data));
                    }
                    NProgress.done();
                });
        }
    }




    // make sure to remove the api call for the $scope.blocks - deprecated
    function BlockListController($scope, $wamp, $interval) {

        $scope.currentTimeStamp = Math.floor(Date.now());
        $interval( () => $scope.currentTimeStamp = Math.floor(Date.now()), 1000);


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
        $interval( () => $scope.currentTimeStamp = Math.floor(Date.now()), 1000);

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








    function StartpageController(MetaverseService, $scope, $location, localStorageService, FlashService, $translate, $interval, $rootScope, $wamp) {

        $scope.startpage = startpage;
        $scope.loading_blocks = true;
        $scope.loading_txs = true;
        $scope.loading_mining_info = true;
        $scope.loading_circulation = true;
        $scope.loading_pricing = true;


        $scope.format = (value, decimals) => value / Math.pow(10, decimals);

        function startpage() {
            $location.path('/');
        }

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

        $rootScope.loading = {
            market_data: true
        };

        $rootScope.loaders = () => Object.keys($rootScope.loading);
        getCirculation();
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
                            $scope.transaction.outputs.forEach(function (output) {
                                if(output.attachment.type == "message") {
                                    $scope.messages.push(output.attachment.content);
                                }
                                if(output.locked_height_range)
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


        $scope.address_pagination = {
            total_count: 0,
            current_page: 1,
            items_per_page: 0,
            page_change: loadTransactions
        };

        loadTransactions(1);
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
                                if(typeof $rootScope.priority[symbol] != 'undefined') {
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
                            if(typeof $scope.info.FROZEN == 'undefined')
                                $scope.info.FROZEN = 0;
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

        function loadTransactions(page) {
            if (typeof address !== 'undefined') {
                NProgress.start();
                MetaverseService.FetchHistory(address, page - 1)
                    .then((response) => {
                        $scope.loading_address = false;
                        if (typeof response.success !== 'undefined' && response.success && typeof response.data.result !== 'undefined') {
                            $scope.transactions = response.data.result.transactions;
                            $scope.address_pagination.current_page = page;
                            $scope.address_pagination.total_count = response.data.result.count;
                            $scope.address_pagination.items_per_page = response.data.result.items_per_page;
                        } else {
                            $translate('MESSAGES.ERROR_TRANSACTION_NOT_FOUND')
                                .then((data) => {
                                    FlashService.Error(data, true);
                                    // $location.path('/');
                                });
                        }
                        NProgress.done();
                    });
            }
        }
    }

    function AssetsController(MetaverseService, $scope, $location, $stateParams, FlashService, $translate, $rootScope) {

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
                    if(typeof $rootScope.priority[asset.symbol] != 'undefined') {
                        asset.priority = $rootScope.priority[asset.symbol];
                    } else {
                        asset.priority = 1000;
                    }
                  });
                  NProgress.done();
              });
      }

    }
})();
