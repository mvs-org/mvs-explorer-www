(function() {
    'use strict';

    angular.module('app', ['ui.router', 'ngCookies', 'LocalStorageModule', 'pascalprecht.translate', 'angularUtils.directives.dirPagination', 'ngAnimate', 'nvd3', 'vxWamp','ngSanitize', 'swaggerUi'])
        .config(config)
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
              //url: 'ws://localhost:8820/ws',
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

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config($stateProvider, $urlRouterProvider) {
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
            .state('explorer.assets', {
                url: "/assets",
                templateUrl: "views/assets.view.html",
                controller: 'AssetsController'
            });
        $urlRouterProvider.otherwise("/");
    };

    run.$inject = ['$rootScope', '$location', 'localStorageService', '$translate', '$wamp'];

    function run($rootScope, $location, $localStorageService, $translate, $wamp) {

        $wamp.open();

        // Page Refresh
        $(document).ready(function() {
            $(this).scrollTop(0);
        });

        if ($localStorageService.get('language') != undefined)
            $translate.use($localStorageService.get('language'));

        $rootScope.nosplash = false;
    }

})();
