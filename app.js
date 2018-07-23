(function() {
    'use strict';

    angular.module('app', ['ui.router', 'ngCookies', 'LocalStorageModule', 'pascalprecht.translate', 'angularUtils.directives.dirPagination', 'ngAnimate','ngAria','ngMessages','ngMaterial', 'nvd3', 'vxWamp','ngSanitize','swaggerUi'])
        .config(config)
        .filter('assetformat',function(){
            return function(input, asset_type){
                if(typeof asset_type === 'undefined')
                    asset_type=8;
                return parseFloat(input)/Math.pow(10,asset_type);
            };
        })
        .config(['$compileProvider', function($compileProvider) {
            $compileProvider.debugInfoEnabled(false);
        }])
        .config(function(localStorageServiceProvider) {
            localStorageServiceProvider
                .setPrefix('mvs.explorer');
        }).config(function($translateProvider) {
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
            if(lang.indexOf('zh') == 0) {
              $translateProvider.preferredLanguage('zh-ZH');
            } else {
              $translateProvider.preferredLanguage('en-US');
            }
        }).config(function($wampProvider) {
            $wampProvider.init({
              //url: 'wss://explorer.mvs.org/ws',
              //url: 'ws://explorer-dev.mvs.org/ws',
              //url: 'wss://explorer-new.mvs.org/ws',
              //url: 'ws://localhost:80/ws',
              url: ((window.location.protocol == 'https:') ? 'wss:' : 'ws:') + "//" + window.location.hostname + ((window.location.port) ? ":" + window.location.port : "") + "/ws",
                realm: 'realm1'
                //Any other AutobahnJS options
            });
        })
        .filter('numberFormat', () => function(number, decimals) {
            return (number / Math.pow(10, decimals)).toFixed(decimals);
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
                templateUrl: "views/startpage.view.html",
                controller: 'StartpageController'
            })
            .state('explorer.api', {
                url: "/api",
                templateUrl: "views/api/api.html"
            })
            .state('explorer.transaction', {
                url: "/tx/:hash",
                templateUrl: "views/transaction.view.html",
                controller: 'TransactionController'
            })
            .state('explorer.blocks', {
                url: "/blocks",
                templateUrl: "views/blocks.view.html",
                controller: 'BlocksController'
            })
            .state('explorer.txs', {
                url: "/txs",
                templateUrl: "views/txs.view.html",
                controller: 'TransactionsController'
            })
            .state('explorer.mining', {
                url: "/mining",
                templateUrl: "views/mining.view.html",
                controller: 'MiningController'
            })
            .state('explorer.nodemap', {
                url: "/nodemap",
                templateUrl: "views/nodemap.view.html",
                controller: 'NodeMapController'
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
                templateUrl: "views/assetslist.view.html",
                controller: 'AssetsListController'
            })
            .state('explorer.certs', {
                url: "/certs",
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
                templateUrl: "views/mits.view.html",
                controller: 'MitsController'
            })
            .state('explorer.mit', {
                url: "/mit/:symbol",
                templateUrl: "views/mit.view.html",
                controller: 'MitController'
            });
        $urlRouterProvider.otherwise("/");
        $locationProvider.html5Mode(true);

    };

    run.$inject = ['$rootScope', '$location', 'localStorageService', '$translate', '$wamp'];

    function run($rootScope, $location, $localStorageService, $translate, $wamp) {

        $wamp.open();

        $rootScope.$on('$stateChangeStart', ()=>$(this).scrollTop(0));


        if ($localStorageService.get('language') != undefined)
            $translate.use($localStorageService.get('language'));

        $rootScope.nosplash = false;
    }

})();
