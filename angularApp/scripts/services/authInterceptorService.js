'use strict';
app.factory('authInterceptorService', ['$q', '$injector', 'localStorageService', '$sessionStorage', 'ngAppSettings', function ($q, $injector, localStorageService, $sessionStorage, ngAppSettings) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {
        config.headers = config.headers || {};

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            config.headers.Authorization = 'JWT ' + authData.token;
        }
        else {
            var authData = JSON.parse($sessionStorage.get('doctorAuthorizationData'));
            if (authData) {
                config.headers.Authorization = 'JWT ' + authData.token;
            }
        }
        return config;
    }
    var _responseError = function (rejection) {
        var doctorAuthData = $sessionStorage.get('doctorAuthorizationData');
        if (doctorAuthData && doctorAuthData.token) {
            _responseError = function () {
                console.log("authorization failed");
            }
            var deferred = $q.defer();
            retryHttpRequest(rejection.config, deferred);
        }
    }
    function retryHttpRequest(config, deferred) {
        function successCallback(response) {
            deferred.resolve(response);
        }
        function errorCallback(response) {
            deferred.resolve(response);
        }
        var $http = $injector.get('$http');

        $http(config).then(successCallback, errorCallback).catch(function (data) { });
    }
    authInterceptorServiceFactory.request = _request;
    //authInterceptorServiceFactory.responseError = _responseError;
    return authInterceptorServiceFactory;
}]);