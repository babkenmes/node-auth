'use strict';
app.controller('registerCtrl', function ($scope, $state, $sce, $timeout, $uibModal, userService, roleNames, authService) {
    $scope.User = {};
    $scope.register = function () {
        userService.register($scope.User).then(function (result) {
			authService.login($scope.User).then(function (response) {
                $state.go('index.users');
            },
            function (err) {
                $scope.message.status = "danger";
                if (err && err.error_description) {
                    $scope.message.text = err.error_description;
                } else {
                    $scope.message.text = "Неправильный логин или пароль"
                }
            });
        },
        function (err) {
            ///TODO implement better handling
            $scope.message = err.message;
            console.log("error");
        });
    };
});
