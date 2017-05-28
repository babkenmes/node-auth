'use strict';
app.factory('authService', ['$http', '$q', 'localStorageService', 'ngAppSettings', '$sessionStorage', '$cacheFactory', function ($http, $q, localStorageService, ngAppSettings, $sessionStorage,$cacheFactory) {
    var authServiceFactory = {};
    var _authentication = {};
    var _login = function (loginData) {
        var data = "username=" + loginData.username + "&password=" + loginData.password;

        var deferred = $q.defer();
        $http.post(ngAppSettings.apiServiceBaseUri + "auth/login", data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {
            if (loginData.useRefreshTokens) {
                localStorageService.set('authorizationData', { token: response.token, fullName: response.fullName, userName: loginData.username, role: response.role});
            }
            _authentication.isAuth = true;
            _authentication.fullName = response.fullName;
            _authentication.userName = loginData.userName;
            _authentication.role = response.role;
            deferred.resolve(response);
        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });
        return deferred.promise;
    }
    var _logOut = function () {
        localStorageService.remove('authorizationData');
        clearAllCache();
        _authentication.isAuth = false;
        _authentication.userName = "";
    };
    var _fillAuthData = function () {
        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.fullName = authData.fullName;
            _authentication.userName = authData.userName;
            _authentication.role = authData.role;
        }
    };
    var _setDoctorAuthData = function (presId) {
        return $http.get(ngAppSettings.apiServiceBaseUri + "auth/getDoctorJWT/" + presId).success(function (response) {
            $sessionStorage.putObject('doctorAuthorizationData', { token: response.token, role: response.role });
            _authentication.fullName = response.fullName;
            _authentication.userName = response.userName;
            _authentication.role = response.role;
            return response;
        });
    }
    var _getBit6Token = function (presId) {
        return $http.get(ngAppSettings.apiServiceBaseUri + "auth/getBit6Token/" + presId)
                .then(function (response) {
                    return response.data;
                })
    }
    function clearAllCache() {
        var httpCache = $cacheFactory.get('$http');
        httpCache.removeAll();
    }

    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.setDoctorAuthData = _setDoctorAuthData;
    authServiceFactory.authentication = _authentication;
    authServiceFactory.getBit6Token = _getBit6Token;
    return authServiceFactory;
}]);