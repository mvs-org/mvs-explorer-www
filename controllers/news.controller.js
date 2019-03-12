(function () {
    'use strict';

    angular
        .module('app')
        .controller('AnnouncementsController', AnnouncementsController)
        .controller('NewsController', NewsController);

    const NUMBER_OF_ITEMS = 5

    function AnnouncementsController($scope, $location, MetaverseService) {
        $scope.articles = [];
        $scope.total_pages = 0
        $scope.location = $location;
        $scope.$watch('location.search()', function () {
            $scope.page = ($location.search()).page || 1;
            MetaverseService.Annoucnements(NUMBER_OF_ITEMS, $scope.page)
                .then(res => {
                    $scope.articles = res.data.results
                    $scope.total_pages = res.data.total_pages
                })
        }, true);
        $scope.range = () => new Array($scope.total_pages)
    }

    function NewsController($scope, $location, MetaverseService) {
        $scope.articles = [];
        $scope.total_pages = 0
        $scope.location = $location;
        $scope.$watch('location.search()', function () {
            $scope.loading_news = true;
            $scope.articles = [];
            $scope.page = ($location.search()).page || 1;
            MetaverseService.News(NUMBER_OF_ITEMS, $scope.page)
                .then(news => {
                    $scope.articles = news.data.results
                    $scope.total_pages = news.data.total_pages
                    $scope.loading_news = false;
                })
        }, true);
        $scope.range = () => new Array($scope.total_pages)
    }

})();
