var debug = {};

var PositionsCtrl = ST.controller('PositionsCtrl', function PositionsCtrl($scope, $rootScope, socket) {

    var calculateStop = function (position) {
        if (position.stopPercent !== 0) {
            position.stopPrice = parseFloat((position.price - ((position.price/100) * position.stopPercent)).toFixed(2));

            if (position.quantity < 0)
                position.stopPrice = position.price + (position.price - position.stopPrice);
        }
    }

    // var calculateStop = function () {
    //     if ($scope.stopPercent !== 0) 
    //         $scope.stop = parseFloat(($scope.price - (($scope.price/100) * $scope.stopPercent)).toFixed(2));

    //     var margin = $scope.price - $scope.stop;
        
    //     if ($scope.action === actions.sell) {
    //         $scope.stop = $scope.price + ($scope.price - $scope.stop);
    //         $scope.stopLoss = margin * $scope.quantity;
    //     } else {
    //         $scope.stopLoss = margin * $scope.quantity * -1;
    //     }
    // }


    $scope.getOpenOrders = function () {
        socket.emit('orders:open');
    }

    $scope.closePosition = function (position) {
        socket.emit('position:close', position);
    }

    $scope.setStopPercent = function (position, percent) {
        position.stopPercent = percent;
        calculateStop(position);
    };

    $scope.resetStop = function (position) {
        if (position.stop)
            position.stopPrice = position.stop.order.auxPrice;
    }

    $scope.put = function (position) {

        // 

    }

    $scope.setPut = function (position, percent) {
        position.put = position.quantity / 100 * percent;
    }

    $scope.pop = function (position) {

    }

    $scope.setPop = function (position, percent) {
        position.pop = position.quantity / 100 * percent;
    }

    socket.on('positions:get', function (data) {

        console.log(data);

        var position = _.find($scope.positions, function (p) { return p.contract.symbol === data.contract.symbol });

        if (position) {
            // apply update to current position





        } else {
            position = data;
            position.symbol = data.contract.symbol;
            position.put = data.quantity;
            position.pop = 1;
            position.tickerId = Math.floor((Math.random() * 1000) + 1);

            socket.emit('ticker:price', { id: position.tickerId, symbol: position.symbol });

            socket.on('ticker:price', function (data) {

                var position = _.find($scope.positions, function (p) { return p.tickerId === data.tickerId } );

                if (position) {
                    position.price = data.price;
                    position.unrealizedPNL = (position.price - position.averageCost) * position.quantity;
                } 
            });    

            $scope.positions.push(position);
        }
    });

    socket.on('positions:update', function (data) {
        var position = _.find($scope.positions, function (p) { return p.contract.symbol === data.symbol });

        // remove if position closed out
        if (position && position.quantity + data.quantity === 0) {
            $scope.positions = _.reject($scope.positions, function (p) {
                return p.contract.symbol === data.symbol;
            });
        }

        socket.emit('positions:get');
    });
 
    var init = function () {
        $scope.positions = [];
        socket.emit('positions:get');
    };

    init();

});
