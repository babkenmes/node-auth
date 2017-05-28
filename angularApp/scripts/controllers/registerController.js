'use strict';
app.controller('registerCtrl', function ($scope, $state, $sce, $timeout, $uibModal, userService, roleNames) {
    $scope.User = {};
    $scope.register = function () {
        userService.register($scope.User).then(function (result) {

        },
        function (err) {
            ///TODO implement better handling
            $scope.message = err.message;
            console.log("error");
        });
    };
});
