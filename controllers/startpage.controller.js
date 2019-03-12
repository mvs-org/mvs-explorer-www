(function() {
    'use strict';

    angular
        .module('app')
        .controller('StartpageController', StartpageController)
        .controller('NewsPreviewController', NewsPreviewController)
        .controller('BlockListController', BlockListController)
        .controller('TransactionListController', TransactionListController)
        .controller('PriceController', PriceController);

    function StartpageController($scope, $location, localStorageService, FlashService, $translate, $interval, $wamp) {

        $scope.startpage = () => $location.path('/');
        $scope.loading_blocks = true;
        $scope.loading_txs = true;
        $scope.format = (value, decimals) => value / Math.pow(10, decimals);

        $scope.loading_circulation = true;
        $scope.loading_pricing = true;
        $scope.loading_eth_swap = true;

    }

    function PriceController(MetaverseService, $scope, $translate) {

        $scope.loading_circulation = true;
        $scope.loading_pricing = true;
        $scope.loading_eth_swap = true;
        $scope.loading_etp_relayer_pool = true;
        $scope.etp_relayer_avatar = 'droplet'
        $scope.etp_relayer_pool = ''
        $scope.etp_relayer_address = '0xc1e5fd24fa2b4a3581335fc3f2850f717dd09c86';
        $scope.eth_relayer_pool = ''

        function getAvatar() {
            return MetaverseService.FetchAvatar($scope.etp_relayer_avatar).then((response) => {
                if (response.data.status && response.data.status.success) {
                    getEtpRelayerPool(response.data.result.address);
                }
            }, console.error);
        }

        function getEtpRelayerPool(address) {
            return MetaverseService.FetchAddress(address).then((response) => {
                $scope.loading_etp_relayer_pool = false;
                if (response.data.status && response.data.status.success) {
                    $scope.etp_relayer_pool = response.data.result.info.ETP;
                }
            }, console.error);
        }

        function getCirculation() {
            return MetaverseService.Circulation(1).then((response) => {
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

        function getEthSwapRate() {
            return MetaverseService.GetEthSwapRate().then((response) => {
                $scope.loading_eth_swap = false;
                if (response.data.status && response.data.status.success)
                    $scope.eth_swap_rate = response.data.result;
            }, console.error);
        }

        getCirculation();
        getPricing();
        getEthSwapRate();
        getAvatar();

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
                if (args[1] == 'i') {
                    $scope.txList = args[0];
                    if($scope.lastestBlockUpdate) {
                        $scope.lastestBlockUpdate.forEach(function(block) {
                            if(block.txs.length > 1)
                                CheckMemPool(block);
                        });
                    }
                } else {
                    AddTxsToTxs(args[0]);
                }
            }).then((subscription) => {
                $scope.$on('$destroy', () => {
                    $wamp.unsubscribe(subscription);
                });
            });
        })();

        (() => {
            $wamp.subscribe('public.blocks', (args) => {
                $scope.lastestBlockUpdate = args[0];
                $scope.lastestBlockUpdate.forEach(function(block) {
                    if(block.txs.length > 1)
                        CheckMemPool(block);
                });
            }).then((subscription) => {
                $scope.$on('$destroy', () => {
                    // console.log('unsubscribe block')
                    $wamp.unsubscribe(subscription);
                });
            });
        })();

        function CheckMemPool(block) {
            $scope.txList.forEach(function(tx, index) {
                if (tx.block == undefined && block.txs.indexOf(tx.hash) > -1) {
                    $scope.txList[index].height = block.number;
                    $scope.txList[index].confirmed_at = block.time_stamp;
                }
            });
        }

    }

    function NewsPreviewController($scope, MetaverseService) {
        $scope.news = [];
        $scope.announcements = [];
        $scope.loadinng = true
        Promise.all([
            MetaverseService.News(1).then(res => res.data.results),
            MetaverseService.Announcements(1).then(res => res.data.results),
        ])
            .then(([news, announcements]) => {
                $scope.news = news
                $scope.announcements = announcements
                $scope.loading = false
            })
            .catch(error=>{
                console.error(error)
                $scope.loading = false
            })
    }


})();
