(function () {
    'use strict';

    angular.module('app', ['ui.router', 'ngCookies', 'LocalStorageModule', 'pascalprecht.translate', 'angularUtils.directives.dirPagination', 'ngAria', 'ngMessages', 'ngMaterial', 'nvd3', 'vxWamp', 'ngSanitize', 'swaggerUi', 'infinite-scroll'])
        .config(config)
        .config(['$compileProvider', function ($compileProvider) {
            $compileProvider.debugInfoEnabled(false);
        }])
        .config(function (localStorageServiceProvider) {
            localStorageServiceProvider
                .setPrefix('mvs.explorer');
        }).config(function ($translateProvider) {
            $translateProvider.useStaticFilesLoader({
                prefix: 'lang/',
                suffix: '.json'
            });
            $translateProvider.registerAvailableLanguageKeys(['en', 'zh', 'de'], {
                'en-US': 'en',
                'en-UK': 'en',
                'de-DE': 'de',
                'zh-ZH': 'zh'
            });
            $translateProvider.useSanitizeValueStrategy('escapeParameters');
            var lang = (navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage));
            if (lang.indexOf('zh') == 0) {
                $translateProvider.preferredLanguage('zh-ZH');
            } else {
                $translateProvider.preferredLanguage('en-US');
            }
        }).config(function ($wampProvider) {
            $wampProvider.init({
                //url: 'wss://explorer.mvs.org/ws',
                //url: 'ws://explorer-dev.mvs.org/ws',
                url: 'wss://explorer-testnet.mvs.org/ws',
                //url: 'ws://localhost:80/ws',
                // url: ((window.location.protocol == 'https:') ? 'wss:' : 'ws:') + "//" + window.location.hostname + ((window.location.port) ? ":" + window.location.port : "") + "/ws",
                realm: 'realm1'
                //Any other AutobahnJS options
            });
        })
        .directive('bsTooltip', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    $(element).hover(function () {
                        // on mouseenter
                        $(element).tooltip('show');
                    }, function () {
                        // on mouseleave
                        $(element).tooltip('hide');
                    });
                }
            };
        })
        .service('MetadataService', ['$window', function ($window) {
            var self = this;
            self.setMetaTags = function (tagData) {
                $window.document.getElementsByName('title')[0].content = "Testnet " + (tagData.title || "Metaverse Blockchain Explorer");
                $window.document.getElementsByTagName('title')[0].innerHTML = "Testnet " + (tagData.title || "Metaverse Blockchain Explorer");
                $window.document.getElementsByName('description')[0].content = "Testnet " + (tagData.description || "Metaverse Blockchain Explorer is a web tool that provides detailed information about Metaverse Smart Assets, Blocks, Addresses, and Transactions.");
                $window.document.getElementsByName('keywords')[0].content = 'testnet, ' + (tagData.keywords || "metaverse, explorer, blockchain, digital identity, asset");
            };
        }])
        .filter('assetformat', function () {
            return function (input, asset_type) {
                if (typeof asset_type === 'undefined')
                    asset_type = 8;
                return parseFloat(input) / Math.pow(10, asset_type);
            };
        })
        .filter('numberFormat', () => function (number, decimals) {
            var parts = ((number / Math.pow(10, decimals)).toFixed(decimals) * 1).toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        })
        .constant('appName', 'MetaverseExplorer')
        .run(run);

    config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

    function config($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('explorer', {
                templateUrl: "views/index.view.html",
                controller: 'ExplorerController'
            })
            .state('explorer.startpage', {
                url: '/',
                meta: {
                    title: 'Metaverse ETP Blockchain Explorer',
                    description: 'The Metaverse Blockchain Explorer provides insights into digital identity, ETP, smart assets, transactions and mining.',
                    keywords: "metaverse, blockchain, explorer, etp, mvs"
                },
                templateUrl: "views/startpage.view.html",
                controller: 'StartpageController'
            })
            .state('explorer.api', {
                url: "/dev/api",
                meta: {
                    title: 'Metaverse Explorer API',
                    description: 'API documentation of the Metaverse Blockchain Explorer. Join our developer community and create your own project today.',
                    keywords: "metaverse, blockchain, api, developer"
                },
                templateUrl: "views/api/api.html"
            })
            .state('explorer.transaction', {
                url: "/tx/:hash",
                templateUrl: "views/transaction.view.html",
                controller: 'TransactionController'
            })
            .state('explorer.blocks', {
                url: "/blocks",
                meta: {
                    title: 'Metaverse Blocks',
                    description: 'List all blocks of the Metaverse Blockchain.',
                    keywords: "metaverse, blockchain, block"
                },
                templateUrl: "views/blocks.view.html",
                controller: 'BlocksController'
            })
            .state('explorer.txs', {
                url: "/txs",
                meta: {
                    title: 'Metaverse Transactions',
                    description: 'List all transactions of the Metaverse Blockchain.',
                    keywords: "metaverse, blockchain, transactions"
                },
                templateUrl: "views/txs.view.html",
                controller: 'TransactionsController'
            })
            .state('explorer.mining', {
                url: "/mining",
                meta: {
                    title: 'Metaverse Mining',
                    description: 'Minning statistics and information of the Metaverse Blockchain. POW and POS mining.',
                    keywords: "metaverse, blockchain, mining, pow, pos, stake"
                },
                templateUrl: "views/mining.view.html",
                controller: 'MiningController'
            })
            .state('explorer.block', {
                url: "/blk/:number",
                templateUrl: "views/block.view.html",
                controller: 'BlockController'
            })
            .state('explorer.address', {
                url: "/adr/:address",
                templateUrl: "views/address.view.html",
                controller: 'AddressController'
            })
            .state('explorer.asset', {
                url: "/asset/:symbol",
                templateUrl: "views/asset.view.html",
                controller: 'AssetController'
            })
            .state('explorer.avatars', {
                url: "/avatars",
                meta: {
                    title: 'Metaverse Digital Identity - Avatars',
                    description: 'Register of the Metaverse Blockchain Avatars. Create your own digital identity.',
                    keywords: "metaverse, blockchain, digital, identity, avatar"
                },
                templateUrl: "views/avatars.view.html",
                controller: 'AvatarsController'
            })
            .state('explorer.avatar', {
                url: "/avatar/:symbol",
                templateUrl: "views/avatar.view.html",
                controller: 'AvatarController'
            })
            .state('explorer.assetslist', {
                url: "/assets",
                templateUrl: "views/assetslist.view.html",
                controller: 'AssetsListController'
            })
            .state('explorer.mstlist', {
                url: "/msts",
                meta: {
                    title: 'Metaverse Smart Token - MST',
                    description: 'Registry of the Metaverse Blockchain MST. Create your own smart asset.',
                    keywords: "metaverse, blockchain, mst, smart, asset"
                },
                templateUrl: "views/assetslist.view.html",
                controller: 'AssetsListController'
            })
            .state('explorer.certs', {
                url: "/certs",
                meta: {
                    title: 'Metaverse Smart Token - Certificates',
                    description: 'Registry of the Metaverse Blockchain MST certificates. Certificates grant rights to issue Metaverse Smart Tokens (MST).',
                    keywords: "metaverse, blockchain, mst, certificate"
                },
                templateUrl: "views/certs.view.html",
                controller: 'CertsController'
            })
            .state('explorer.broadcast', {
                url: "/broadcast",
                templateUrl: "views/broadcast.view.html",
                controller: 'BroadcastTransactionController'
            })
            .state('explorer.mits', {
                url: "/mits",
                meta: {
                    title: 'Metaverse Identifiable Token - MIT',
                    description: 'Register of the Metaverse Blockchain MIT. Create your own unique identifiable token.',
                    keywords: "metaverse, blockchain, mit, smart, asset"
                },
                templateUrl: "views/mits.view.html",
                controller: 'MitsController'
            })
            .state('explorer.mit', {
                url: "/mit/:symbol",
                templateUrl: "views/mit.view.html",
                controller: 'MitController'
            })
            .state('explorer.news', {
                url: "/news",
                meta: {
                    title: 'Metaverse Blockchain News - ETP, Smart Assets and Digital Identity',
                    description: 'Latest news and information about ETP and the Metaverse Blockchain Ecosystem.',
                    keywords: "metaverse, blockchain, news, etp, mvs"
                },
                templateUrl: "views/news.view.html",
                controller: 'NewsController'
            });
        $urlRouterProvider.otherwise("/");
        $locationProvider.html5Mode(true);

    };

    run.$inject = ['$rootScope', '$location', 'localStorageService', '$translate', '$wamp', '$state', 'MetadataService'];

    function run($rootScope, $location, $localStorageService, $translate, $wamp, $state, MetadataService) {

        $wamp.open();

        $rootScope.$on('$stateChangeSuccess', () => {
            $(this).scrollTop(0)
            MetadataService.setMetaTags($state.current.meta || {})
        });


        if ($localStorageService.get('language') != undefined)
            $translate.use($localStorageService.get('language'));

        //$rootScope.nosplash = false;
    }

})();
