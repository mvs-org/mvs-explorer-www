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

      //var SERVER = window.location.protocol + "//" + window.location.hostname + ((window.location.port) ? ":" + window.location.port : "") + "/api";
      var SERVER = "http://localhost";
      //var SERVER = "https://explorer-testnet.mvs.org/api";

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

        service.ListBlocks = (page, items_per_page) => _send('blocks?page=' + page + '&items_per_page=' + items_per_page);

        service.BlockStats = (page) => _send('stats/block');

        service.FetchHistory = (address, page, min_time, max_time) => _send('address/txs/' + address + '?page=' + page + ((min_time) ? '&min_time=' + min_time : '') + ((max_time) ? '&max_time=' + max_time : ''));

        service.FetchAddress = (address) => _send('address/info/' + address);

        service.Block = (number) => _send('block/' + number);

        service.BlockTxs = (blockhash) => _send('block/txs/' + blockhash);

        service.Txs = (page, min_time, max_time) => _send('txs?page=' + page + ((min_time) ? '&min_time=' + min_time : '') + ((max_time) ? '&max_time=' + max_time : ''));

        service.ListAssets = (number) => _send('assets');

        service.ListAvatars = (page, items_per_page) => _send('avatars?page=' + page + ((items_per_page) ? '&items_per_page=' + items_per_page : ''));

        service.ListCerts = (page, items_per_page) => _send('certs?page=' + page + ((items_per_page) ? '&items_per_page=' + items_per_page : ''));

        service.ListMits = (page, items_per_page) => _send('mits?page=' + page + ((items_per_page) ? '&items_per_page=' + items_per_page : ''));

        service.FetchAvatar = (symbol) => _send('avatar/'+symbol);

        service.FetchCerts = (symbol, show_invalidated) => _send('certs/' + symbol + ((show_invalidated) ? '?show_invalidated=' + show_invalidated : ''));

        service.FetchMit = (symbol, show_invalidated) => _send('mits/' + symbol + ((show_invalidated) ? '?show_invalidated=' + show_invalidated : ''));

        service.AssetInfo = (symbol) => _send('asset/' + symbol);

        service.MitInfo = (symbol) => _send('mits/' + symbol);

        service.AssetStakes = (symbol) => _send('stakes/' + symbol);

        service.MiningInfo = () => _send('mining');

        service.Circulation = () => _send('circulation');

        service.Pricing = () => _send('pricing');

        service.DepositSum = () => _send('depositsum');

        service.DepositRewards = () => _send('rewards');

        service.Chart = () => _send('poolstats');

        service.SearchAll = (search, limit) => _send('suggest/all/' + search + '?limit=' + limit);

        service.Broadcast = (raw_transaction) => _post('tx', '{"tx":"' + raw_transaction + '"}');

        return service;

        function _send(query) {
            return $http.get(SERVER + "/" + query, {
                    headers: {}
                })
                .then((res) => handleSuccess(res))
                .catch((res) => handleError(res));
        }

        function _post(query, data) {
            return $http.post(SERVER + "/" + query, data, {
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
