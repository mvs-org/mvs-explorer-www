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
        .directive('checkImage', function() {
            return {
                link: function(scope, element, attrs) {
                    element.bind('error', function() {
                        element.attr('src', 'img/assets/default_mst.png'); // set default image
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
        var interval = 3000;
        var posInterval = 1000;
        var posTop = 25;

        $scope.data = [];
        $scope.posdata = [];
        $scope.locations = {}; 
        $scope.avatars = [];     

        $scope.colors = [
            "#006599", // dark blue
            "#0099CB", // blue
            '#fe6700', // orange
            '#ffd21c', // yellow
            "#fe0000" // red

        ];


        //PoW mining pools
        MetaverseService.Chart(interval)
            .then((res) => {
                $scope.data = res.data.result;
                let rest_part = interval;
                $scope.data.forEach((miner) => {
                    rest_part -= miner.counter;
                    if ($scope.locations[miner.origin] == undefined)
                        $scope.locations[miner.origin] = [];
                    $scope.locations[miner.origin].push(miner);
                });
                $scope.data.sort((a, b) => a.counter - b.counter);
                $scope.data = [{
                    name: 'others',
                    url: "",
                    counter: rest_part
                }].concat($scope.data);
                $scope.locationsmap = Object.keys($scope.locations);

            }).then(() => {

                nv.addGraph(function() {
                    var chart = nv.models.pieChart()
                        .x(function(d) {
                            return "<b>" + d.name + "</b><br>" + d.url;
                        })
                        .y(function(d) {
                            return d.counter / interval * 100;
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

        //PoS mining pools
        MetaverseService.PosChart(posInterval, posTop)
            .then((res) => {
                $scope.posdata = res.data.result;
                let rest_part = posInterval;
                $scope.effectiveInterval = 0; //To remove after 1000 blocks
                $scope.posdata.forEach((miner) => {
                    rest_part -= miner.counter;
                    $scope.avatars.push(miner.avatar);
                    $scope.effectiveInterval += miner.counter;  //To remove after 1000 blocks
                });
                $scope.posdata.sort((a, b) => a.counter - b.counter);
                /*$scope.posdata = [{
                    avatar: 'others',
                    counter: rest_part
                }].concat($scope.posdata);*/
            }).then(() => {

                nv.addGraph(function() {
                    var poschart = nv.models.pieChart()
                        .x(function(d) {
                            return d.avatar;
                        })
                        .y(function(d) {
                            //return d.counter / posInterval * 100;
                            return d.counter / $scope.effectiveInterval * 100;
                        })
                        .color($scope.colors)
                        .showLabels(true)
                        .showLegend(false)
                        .labelType("percent");

                    d3.select("#poschart svg")
                        .datum($scope.posdata)
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

    }

    function ExplorerController($translate, localStorageService, $scope, FlashService) {

        $scope.changeLang = changeLang;
        $scope.selectedLang = localStorageService.get('language');

        function changeLang(key) {
            //document.getElementById('language_selector').setAttribute("lang", key);
            $translate.use(key)
                .then((key) => localStorageService.set('language', key))
                .catch((key) => console.log("Cannot change language."));
        };

        $scope.ClickCloseFlashMessage = () => {
          FlashService.CloseFlashMessage();
        }

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
            $translate(['SUGGESTION.SHOW_ALL_TX', 'SUGGESTION.SHOW_ALL_BLOCKS', 'SUGGESTION.SHOW_ALL_ASSETS', 'SUGGESTION.SHOW_ALL_AVATARS', 'SUGGESTION.SHOW_ALL_MITS'])
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
                        'icon': 'default_mst'
                    });
                    $scope.initialSuggestion.push({
                        'name': translations['SUGGESTION.SHOW_ALL_AVATARS'],
                        'url': 'avatars',
                        'type': 'avatar',
                        'icon': 'default_avatar'
                    });
                    $scope.initialSuggestion.push({
                        'name': translations['SUGGESTION.SHOW_ALL_MITS'],
                        'url': 'mits',
                        'type': 'mit',
                        'icon': 'default_mit'
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
                            show_asset(search_field);
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
            MetaverseService.AssetInfo($filter('uppercase')(search_field))
                .then((response) => {
                    if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined && response.data.result.length != 0) {
                        $location.path('/asset/' + $filter('uppercase')(search_field));
                    } else {
                      MetaverseService.FetchAvatar(search_field)
                          .then((response) => {
                              if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined && response.data.result.length != 0) {
                                  $location.path('/avatar/' + search_field);
                              } else {
                                  MetaverseService.MitInfo(search_field)
                                      .then((response) => {
                                          if (typeof response.success !== 'undefined' && response.success && response.data.result != undefined && response.data.result.length != 0) {
                                              $location.path('/mit/' + search_field);
                                          } else {
                                              $translate('MESSAGES.ERROR_SEARCH_NOT_FOUND')
                                                  .then((data) => FlashService.Error(data));
                                          }
                                          NProgress.done();
                                      });
                              }
                              NProgress.done();
                          });
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
            return Promise.all([setResultsInit(text), setResultsAsset(result.asset), setResultsAddress(result.address), setResultsAvatar(result.avatar), setResultsMit(result.mit), setResultsTx(result.tx), setResultsBlockHash(result.block)])
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
                    icon: $scope.icons.indexOf(asset) > -1 ? asset : 'default_mst'
                };
            });
        }

        function setResultsAvatar(avatars) {
            return avatars.map((avatar) => {
                return {
                    name: avatar,
                    url: 'avatar/' + avatar,
                    type: 'avatar',
                    icon: 'default_avatar'
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

        function setResultsMit(mits) {
            return mits.map((mit) => {
                return {
                    name: mit,
                    url: 'mit/' + mit,
                    type: 'mit',
                    icon: 'default_mit'
                };
            });
        }

    }
})();
