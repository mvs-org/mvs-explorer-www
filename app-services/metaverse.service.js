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

      var SERVER = window.location.protocol + "//" + window.location.hostname + ((window.location.port) ? ":" + window.location.port : "") + "/api";
      //var SERVER = "http://localhost";
      //var SERVER = "https://explorer.mvs.org/api";
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

        service.FetchTxOutputs = (hash) => _send('tx/outputs/' + hash);

        service.ListBlocks = (last_known) => _send('v2/blocks' +((last_known) ? '?last_known=' + last_known : ''));

        service.BlockStats = (type, downscale) => _send('stats/block?type=' + type + ((downscale) ? '&downscale=' + downscale : ''));

        service.FetchHistory = (address, page, min_time, max_time) => _send('address/txs/' + address + '?page=' + page + ((min_time) ? '&min_time=' + min_time : '') + ((max_time) ? '&max_time=' + max_time : ''));

        service.FetchAddress = (address) => _send('address/info/' + address);

        service.Block = (number) => _send('block/' + number);

        service.BlockTxs = (blockhash, page, items_per_page) => _send('block/txs/' + blockhash + ((page) ? '?page=' + page + ((items_per_page) ? '&items_per_page=' + items_per_page : '') : ''));

        service.ListTxs = (last_known, address, min_time, max_time) => _send('v2/txs?last_known=' + last_known + ((address) ? '&address=' + address : '') + ((min_time) ? '&min_time=' + min_time : '') + ((max_time) ? '&max_time=' + max_time : ''));

        service.ListSpecialAssets = () => _send('v2/msts/special');
        
        service.ListAssets = (last_symbol) => _send('v2/msts' +((last_symbol) ? '?last_symbol=' + last_symbol : ''));

        service.AssetsCount = () => _send('v2/info/msts');

        service.ListAvatars = (last_known) => _send('v2/avatars' +((last_known) ? '?last_known=' + last_known : ''));

        service.AvatarsCount = () => _send('v2/info/avatar');
        
        service.ListCerts = (last_known) => _send('v2/certs' +((last_known) ? '?last_known=' + last_known : ''));

        service.CertsCount = () => _send('v2/info/cert');
        
        service.ListMits = (last_known) => _send('v2/mits' +((last_known) ? '?last_known=' + last_known : ''));

        service.MitsCount = () => _send('v2/info/mit');

        service.FetchAvatar = (symbol) => _send('avatar/'+symbol);

        service.FetchCerts = (symbol, show_invalidated) => _send('certs/' + symbol + ((show_invalidated) ? '?show_invalidated=' + show_invalidated : ''));

        service.FetchMit = (symbol, show_invalidated) => _send('mits/' + symbol + ((show_invalidated) ? '?show_invalidated=' + show_invalidated : ''));

        service.AssetInfo = (symbol) => _send('asset/' + symbol);

        service.MitInfo = (symbol) => _send('mits/' + symbol);

        service.AssetStakes = (symbol) => _send('stakes/' + symbol);

        service.MiningInfo = () => _send('mining');

        service.Circulation = () => _send('circulation');

        service.Pricing = () => _send('pricing/tickers');

        service.DepositSum = () => _send('depositsum');

        service.DepositRewards = () => _send('rewards');

        service.Chart = (interval) => _send('poolstats' + ((interval) ? '?interval=' + interval : ''));

        service.PosChart = (interval, top) => _send('posstats' + ((interval) ? '?interval=' + interval + ((top) ? '&top=' + top : '') : ((top) ? '?top=' + top : '')) + '&hi=12');

        service.SearchAll = (search, limit) => _send('suggest/all/' + search + '?limit=' + limit);

        service.GetEthSwapRate = () => _send('bridge/rate/ETHETP');

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
