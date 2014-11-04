var PositionsCtrl = ST.controller('PositionsCtrl', function PositionsCtrl($scope, $rootScope, socket) {

    $scope.getOpenOrders = function () {
        socket.emit('orders:open');
    }

    socket.on('positions:get', function (data) {
        var position = data;

            console.log(position);

        position.symbol = data.contract.symbol;
        
        if (!_.find($scope.positions, function (p) { return p.contract.symbol === position.symbol })) {

            position.tickerId = Math.floor((Math.random() * 1000) + 1);


            socket.emit('ticker:price', { id: position.tickerId, symbol: position.symbol });

            socket.on('ticker:price', function (data) {

                console.log(data);

                var position = _.find($scope.positions, function (p) { return p.tickerId === data.tickerId } );

                if (position) {
                    position.price = data.price;
                    position.unrealizedPNL = (position.price - position.averageCost) * position.quantity;
                } 
                

                // if (data.tickerId === position.tickerId) {
                //     position.price = data.price;
                //     position.unrealizedPNL = (position.price - position.averageCost) * position.quantity;
                // }
            });    

            $scope.positions.push(position);
        }
    });

    socket.on('positions:update', function () {
        socket.emit('positions:get');
    });

    var init = function () {
        $scope.positions = [];
        socket.emit('positions:get');
    };

    init();

});
