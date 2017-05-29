

'use strict';
app.controller('MainCtrl', ['$scope', '$state', 'authService', '$timeout', 'localStorageService', 'roleNames', function ($scope, $state, authService, $timeout, localStorageService, roleNames) {
        
        
        $scope.admin = false;
        $scope.authentication = authService.authentication;
        if (!$scope.authentication || $scope.authentication.isAuth !== true) {
            $timeout(function () {
                $state.go('login');
            });
        }
        $scope.logOut = function () {
            authService.logOut();
            $state.go('login');
        }
        $scope.userRole = authService.authentication.role;
        $scope.roleNames = roleNames;
        var authData = localStorageService.get('authorizationData');
        if (authData && authData.token) {
            var decoded = jwt_decode(authData.token);
            if (decoded.role && decoded.role == "admin") {
                $scope.admin = true;
            }
            var initials = $scope.authentication.fullName.split(" ");
            $scope.fn = initials[0].charAt(0);
            $scope.ln = initials[1].charAt(0);        
        }
        if (typeof(codePush) !== 'undefined' && typeof(codePush.getCurrentPackage) !== 'undefined') {
            codePush.getCurrentPackage(function (cpdata) {
                $timeout(function () {
                    if (cpdata) {
                        $scope.codePushversion = cpdata.appVersion;
                        $scope.label = cpdata.label;
                    }
                })
            })
        }
    }]);