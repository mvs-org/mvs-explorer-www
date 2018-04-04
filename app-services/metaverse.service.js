(() => {
    'use strict';

    angular
        .module('app')
        .factory('MetaverseService', MetaverseService);

    /**
     * The MetaverseService provides access to the Metaverse JSON RPC.
     */
    MetaverseService.$inject = ['$http', 'localStorageService'];

    function MetaverseService($http, localStorageService) {
        var service = {};

      //   var SERVER = 'http://explorer.mvs.live:8080';
      // // SERVER = 'http://mvs.blocktrack.de';
      // SERVER = 'https://explorer.mvs.org';

      //   service.debug = false;


      var SERVER = window.location.protocol + "//" + window.location.hostname + ((window.location.port) ? ":" + window.location.port : "") + "/api";

      //var SERVER = "http://localhost:80";

      //var SERVER = "https://explorer.mvs.org" + "/api";

      service.SERVER = SERVER;
        /**
         * @api {post} /rpc Get blockchain height
         * @apiName Get blockchain height
         * @apiGroup Misc
         *
         * @apiDescription Get the current height of the blockchain.
         *
         * @apiParam {Const} method fetch-height
         * @apiParam {List} params []
         *
         **/
        service.FetchHeight = () => _send('height', []);

        service.FetchTx = (hash) => _send('tx/' + hash);

        service.ListBlocks = (page) => _send('blocks/' + page);

        service.FetchHistory = (address, page) => _send('address/txs/' + address + '?page=' + page);

        service.FetchAddress = (address) => _send('address/info/' + address);

        service.Block = (number) => _send('block/' + number);

        service.ListAssets = (number) => _send('assets');

        service.MiningInfo = () => _send('mining');

        service.Circulation = () => _send('circulation');

        service.Pricing = () => _send('pricing');

        service.Chart = () => _send('poolstats');

        return service;

        function _send(query) {
            return $http.get(SERVER + "/" + query, {
                    headers: {}
                })
                .then((res) => handleSuccess(res))
                .catch((res) => handleError(res));
        }

        function formatResponse(success, message, data) {
            return {
                success: success,
                message: message,
                data: data
            };
        }

        // private functions
        function handleSuccess(res) {
            if (res.data != undefined && res.data.error == undefined)
                return formatResponse(true, undefined, res.data);
            else
                return handleError(res);
        }

        function handleError(res) {
            //If resonse contains data treat it as a success
            if (res.status === 404 && res.data && res.data.status)
                return handleSuccess(res);
            else if (res.error != undefined)
                return formatResponse(false, res.error);
            else
                return formatResponse(false, 'General connection error');
        }
    }
})();
