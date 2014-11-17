var OrderCtrl = ST.controller('OrderCtrl', function OrderCtrl($scope, $rootScope, api, socket) {

    var actions = Object.freeze({ buy: { key: 1, value: 'BUY' }, sell: { key: 2, value: "SELL" } });

    $scope.action = actions.buy;
    $scope.tickerId = Math.floor((Math.random() * 1000) + 1);
    $scope.quantity = 0;
    $scope.price = 0;
    $scope.stop = 0;
    $scope.stopLoss = 0;
    $scope.stopPercent = 2;

    var calculateStop = function () {
        if ($scope.stopPercent !== 0) {
            $scope.stop = parseFloat(($scope.price - (($scope.price/100) * $scope.stopPercent)).toFixed(2));
            if ($scope.action === actions.sell)
                $scope.stop = $scope.price + ($scope.price - $scope.stop);
        }
            
        var margin = $scope.price - $scope.stop;
        $scope.action === actions.sell ? $scope.stopLoss = margin * $scope.quantity : $scope.stopLoss = margin * $scope.quantity * -1;
    }

    $scope.setStopPercent = function (percent) {
        $scope.stopPercent = percent;
        calculateStop();
    };

    $scope.toggleAction = function () {
        $scope.action === actions.buy ? $scope.action = actions.sell : $scope.action = actions.buy;
        calculateStop();
    }

    $scope.tickers = function(value) {
        return api.searchTickers(value);
    };

    $scope.$watch('ticker', function(neu, old){
        if (neu && neu.symbol) {
            if(neu.symbol !== old.symbol){
                $scope.ticker.id = $scope.tickerId;
                socket.emit('ticker:price', $scope.ticker);
                console.log($scope.ticker);
            }
        }
    });    

    socket.on('ticker:price', function (data) {
        if (data.tickerId === $scope.tickerId) {
            $scope.price = data.price;
            $scope.marketValue = data.price * $scope.quantity;
            if ($scope.stopPercent !== 0) calculateStop();
        }
    });

    $scope.placeOrder = function () {
        socket.emit('order:place', { symbol: $scope.ticker.symbol, action: $scope.action.value, quantity: parseInt($scope.quantity, 10), stop: parseFloat($scope.stop) });
        $scope.reset();
    }

    $scope.reset = function () {
        socket.emit('ticker:cancel', $scope.tickerId);
        $scope.ticker = undefined;
        $scope.quantity = 0;
        $scope.price = 0;
        $scope.stop = 0;
        $scope.stopLoss = 0;
    }

});
