'use strict';
app.controller('LoginCtrl', ['$scope', '$state', 'authService', '$timeout', function ($scope, $state, authService, $timeout) {
        
        var auth = authService.authentication;
        if (auth && auth.isAuth === true) {
            $state.go('index.users');
        }
        $scope.loginData = {
            username: "",
            password: "",
            useRefreshTokens: true
        };
        $scope.message = {
            status: "",
            text: ""
        }
        $scope.login = function () {
            authService.login($scope.loginData).then(function (response) {
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
        };
    }]);
