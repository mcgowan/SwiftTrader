var debug = {};

var PositionsCtrl = ST.controller('PositionsCtrl', function PositionsCtrl($scope, $rootScope, socket) {

    var calculateStop = function (position) {
        if (position.stopPercent !== 0) {
            position.stopPrice = parseFloat((position.price - ((position.price/100) * position.stopPercent)).toFixed(2));

            if (position.quantity < 0)
                position.stopPrice = position.price + (position.price - position.stopPrice);
        }
    }

    $scope.getOpenOrders = function () {
        socket.emit('orders:open');
    }

    $scope.reversePosition = function (position) {
        socket.emit('position:reverse', position);
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

    $scope.updateStop = function (position) {
        socket.emit('stop:update', { 
            orderId: position.stop ? position.stop.orderId : undefined, 
            symbol: position.symbol, 
            action: position.quantity > 0 ? 'SELL' : 'BUY', 
            quantity: parseInt(position.quantity, 10), 
            stopPrice: parseFloat(position.stopPrice) 
        });
    }

    $scope.put = function (position) {
        socket.emit('position:put', position);
    }

    $scope.setPut = function (position, percent) {
        console.log(position);
        position.put = position.quantity / 100 * percent;
    }

    $scope.pop = function (position) {
        socket.emit('position:pop', position);
    }

    $scope.setPop = function (position, percent) {
        position.pop = position.quantity / 100 * percent;
    }

    socket.on('positions:get', function (data) {
        var position = _.find($scope.positions, function (p) { return p.contract.symbol === data.contract.symbol });

        if (position) {
            // apply update to current position

            console.log('position exists, will update');

            // quantity
            // average price
            // stop

            position.quantity = data.quantity;
            position.averageCost = data.averageCost

            if (data.stop) position.stop = data.stop;

            console.log(data);
                // var position = { 
                //     socketId: socket.id,
                //     contract: contract,
                //     quantity: position,
                //     marketPrice: marketPrice,
                //     marketValue: marketValue,
                //     averageCost: averageCost,
                //     unrealizedPNL: unrealizedPNL,
                //     realizedPNL: realizedPNL,
                //     accountName: accountName
                // }





        } else {

            console.log(data);

            $scope.socketId = data.socketId;

            position = data;
            position.symbol = data.contract.symbol;
            position.put = data.quantity;
            position.pop = data.quantity/2;
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

    socket.on('stop:updated', function (data) {
        
        console.log('stop:updated');
        console.log(data);

        var position = _.find($scope.positions, function (p) { return p.contract.symbol === data.symbol });

        if (position) {
            position.stopPrice = data.stopPrice;
            position.stop ? position.stop.orderId = data.orderId : position.stop = { orderId: data.orderId };
            console.log(position);
        }

    });

 
    var init = function () {
        $scope.positions = [];
        socket.emit('positions:get');
    };

    init();

});
