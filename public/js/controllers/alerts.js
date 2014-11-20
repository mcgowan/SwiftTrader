var AlertsCtrl = ST.controller('AlertsCtrl', function AlertsCtrl($scope, $rootScope, api, socket) {

$scope.alerts = [];
//     { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
//     { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
//   ];

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    socket.on('alert', function (data) {
        console.log(data);

        if (data.type === 'Error') $scope.alerts.push({ type: 'danger', message: data.message });
    });

});
