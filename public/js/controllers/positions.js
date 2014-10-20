var PositionsCtrl = SwiftTraderApp.controller('PositionsCtrl', function PositionsCtrl($scope, $rootScope) {

    // var unbind = $rootScope.$on('search', function(){
    //     $scope.search();
    // });

    // $scope.$on('$destroy', unbind);

    // $scope.getListings = function () {

    //     if (!$scope.data.fetching && !$scope.data.nomore) {

    //         $scope.data.fetching = true;

    //         listingService.getListings($scope.data.start, $scope.criteria, function (data) {

    //             $scope.data.fetching = false;

    //             if (data.listings.length === 0) {
    //                 $scope.data.nomore = true;

    //             } else {
    //                 _.each(data.listings, function (listing) {

    //                     listing.busy = true;

    //                     listingService.getListing(listing.data.id, function (data) {
    //                         if (data.images.length !== 0) {
    //                             listing.data.url = data.url;
    //                             listing.data.images = data.images;
    //                             listing.currentImage = listing.data.images[0];
    //                             listing.currentImageIndex = 0;
    //                             listing.favourite = $scope.isFavourite(listing);
    //                             $scope.listings.push(listing);
    //                         }
    //                     });
    //                 });

    //                 $scope.data.start += 100;
    //             }
    //         });
    //     }
    // }

    // $scope.search = function () {
    //     $scope.restore();
    //     $scope.data.start = 0;
    //     $scope.data.nomore = false;
    //     $scope.listings = [];
    //     $scope.getListings();
    // };

    // $scope.next = function () {
    //     $scope.getListings();
    // }

    // $scope.loaded = function (listing) {
    //     listing.busy = false;
    // }

    // $scope.open = function (listing) {
    //     window.open(listing.data.url);
    // }

    // $scope.hover = function (listing) {
    //     if (listing.data.images && listing.data.images.length > 1)
    //         listing.showPager = !listing.showPager;
    // };

    // $scope.pageLeft = function (listing) {
    //     if (listing.currentImageIndex === 0) listing.currentImageIndex = (listing.data.images.length);
    //     listing.currentImageIndex--;
    //     listing.currentImage = listing.data.images[listing.currentImageIndex];
    // };

    // $scope.pageRight = function (listing) {
    //     if (listing.currentImageIndex === (listing.data.images.length - 1)) listing.currentImageIndex = -1;
    //     listing.currentImageIndex++;
    //     listing.currentImage = listing.data.images[listing.currentImageIndex];
    // };

    // $scope.getFavourites = function () {
    //     var favourites = angular.fromJson(localStorage["favourites"]);
    //     return favourites ? favourites : [];
    // }

    // $scope.isFavourite = function (listing) {
    //     return $.grep($scope.favourites, function(favourite, index) {
    //         return favourite.id === listing.data.id;
    //     }).length > 0;
    // }

    // $scope.addFavourite = function (listing) {
    //     $scope.favourites.push(listing.data);
    //     localStorage["favourites"] = angular.toJson($scope.favourites);
    // }

    // $scope.removeFavourite = function (listing) {
    //     var index = $scope.favourites.indexOf(listing.data);
    //     $scope.favourites.splice(index, 1);
    //     localStorage["favourites"] = angular.toJson($scope.favourites);
    // }

    // $scope.toggleFavourite = function (listing) {
    //     listing.favourite = !listing.favourite;
    //     if (listing.favourite) {
    //         $scope.addFavourite(listing);
    //     } else {
    //         $scope.removeFavourite(listing);
    //     }
    // }

    //  $scope.restore = function () {
    //     $scope.criteria = angular.fromJson(localStorage["criteria"]);

    //     if (!$scope.criteria) {
    //         $scope.criteria = {
    //             keyword: '',
    //             range: { min: 1000, max: 3000 }
    //         };
    //     }
    //     $scope.data = {};
    // }

    // $scope.restore();
    // $scope.favourites = $scope.getFavourites();
    // $scope.search();

});
