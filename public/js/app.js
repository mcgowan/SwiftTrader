var SwiftTraderApp = angular.module('SwiftTrader', ['ui.bootstrap'])
    .value('api', 'http://localhost:3000/api')
.factory('SwiftTraderService', function ($http, $log, api) {
    return {
        
        searchTickers: function (search, callback) {
            $http({ method: 'GET', url: '{0}/tickers?search={1}'.format(api, search) }).
				success(function (data, status, headers, config) {
				    callback(data);
				}).
				error(function (data, status, headers, config) {
				    $log.warn(data, status, headers, config);
				});
        },

        searchTest: function (search) {
            // return $http({ method: 'GET', url: '{0}/tickers?search={1}'.format(api, search) }).
            //     success(function (data, status, headers, config) {
            //         return data;
            //     }).
            //     error(function (data, status, headers, config) {
            //         $log.warn(data, status, headers, config);
            //     });

            // return $http({ method: 'GET', url: 'http://localhost:3000/api/tickers?search={1}'.format(search) }).then(function(response){
            //   return response.data;
            // });

        },


    //     getListing: function (id, callback) {
    //         $http({ method: 'GET', url: '{0}/list/{1}'.format(api, id) }).
				// success(function (data, status, headers, config) {
				//     callback(data);
				// }).
				// error(function (data, status, headers, config) {
				//     $log.warn(data, status, headers, config);
				// });
    //     }
    };
// }).config(function($stateProvider) {
//     $stateProvider.state('search', {
//         templateUrl: 'partials/listing.html',
//             controllerProvider: function() {
//                 return 'ListingCtrl';
//         }      
//     }).state('favourites', {
//         templateUrl: 'partials/favourites.html',
//             controllerProvider: function() {
//                 return 'FavouritesCtrl';
//         }      
//     })
}).directive('myScrolling', function() {
    return function(scope, element, attrs) {
    	$(window).scroll(function(){
            if ($(window).scrollTop() >= ($(document).height() - ($(window).height() * 2))) {
                scope.$apply(attrs.myScrolling);
            }
    	});
    };
}).directive('myLoaded', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                scope.$apply(attrs.myLoaded);
            });
        }
    };
}).directive('myFocus', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            $timeout(function () {
                element[0].focus();
            });
        }
    };
});