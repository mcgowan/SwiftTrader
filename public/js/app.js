var ST = angular.module('ST', ['ui.bootstrap', 'fcsa-number'])
    .value('api', 'http://localhost:3000/api')
    .value('ib', 'http://localhost:3000/api')
.filter('objectToArray', function() {
    return function(input) {
        return _.toArray(input);
    }
}).factory('api', function ($rootScope, $http, $log) {
    return {
        searchTickers: function (value) {
            return $http({ method: 'GET', url: 'http://localhost:3000/api/tickers?search=' + value }).then(function(response){
                return response.data;
            }, function (error) {
                $log.warn(error);
            });
        },
        // getTickerPrice: function (ticker) {
        //     socket.emit('getTickerPrice', ticker);
        // }
    };
}).factory('socket', function ($rootScope) {
    var socket = io.connect('http://localhost');
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}).directive('stMenuInput', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).click(function (event) {
                event.stopPropagation();
            });
        }
    };
}).directive('stSelectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                this.select();
            });
        }
    };
});    



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
// }).directive('myScrolling', function() {
//     return function(scope, element, attrs) {
//     	$(window).scroll(function(){
//             if ($(window).scrollTop() >= ($(document).height() - ($(window).height() * 2))) {
//                 scope.$apply(attrs.myScrolling);
//             }
//     	});
//     };
// }).directive('myLoaded', function() {
//     return {
//         restrict: 'A',
//         link: function(scope, element, attrs) {
//             element.bind('load', function() {
//                 scope.$apply(attrs.myLoaded);
//             });
//         }
//     };
// }).directive('myFocus', function ($timeout) {
//     return {
//         link: function (scope, element, attrs) {
//             $timeout(function () {
//                 element[0].focus();
//             });
//         }
//     };
// });