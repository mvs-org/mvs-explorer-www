(function () {
    'use strict';

    angular
        .module('app')
        .controller('AnnouncementsController', AnnouncementsController)
        .controller('NewsController', NewsController);

    const NUMBER_OF_NEWS = 10
    const NUMBER_OF_ANNOUNCEMENTS = 5

    function AnnouncementsController($scope, MetaverseService) {
        $scope.announcements = [];
        $scope.loading_announcements = true;
        MetaverseService.Announcements(NUMBER_OF_ANNOUNCEMENTS, $scope.announcements_page)
            .then(res => {
                $scope.announcements = res.data.results
                $scope.loading_announcements = false;
            })
    }

    function NewsController($scope, $location, MetaverseService) {
        $scope.articles = [];
        $scope.total_pages = 0
        $scope.location = $location;
        $scope.$watch('location.search()', function () {
            $scope.loading_news = true;
            $scope.articles = [];
            $scope.page = ($location.search()).page || 1;
            $scope.announcements_page = ($location.search()).announcements_page || 1;
            MetaverseService.News(NUMBER_OF_NEWS, $scope.page)
                .then(news => {
                    $scope.articles = news.data.results
                    $scope.total_pages = news.data.total_pages
                    $scope.loading_news = false;
                })
        }, true);
        $scope.range = () => new Array($scope.total_pages)
    }

})();
