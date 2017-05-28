(function () {
    'use strict';
    /*global angular, Blob, URL */
    
    app.directive('httpSrc', ['$http', 'localStorageService', '$sessionStorage', "ngAppSettings", function ($http, localStorageService, $sessionStorage, ngAppSettings) {
            return {
                // do not share scope with sibling img tags and parent
                // (prevent show same images on img tag)
                scope: {},
                link: function ($scope, elem, attrs) {
                    function revokeObjectURL() {
                        if ($scope.objectURL) {
                            URL.revokeObjectURL($scope.objectURL);
                        }
                    }
                    
                    $scope.$watch('objectURL', function (objectURL) {
                        elem.attr('src', objectURL);
                    });
                    
                    $scope.$on('$destroy', function () {
                        revokeObjectURL();
                    });
                    
                    attrs.$observe('httpSrc', function (url) {
                        revokeObjectURL();
                        url = ngAppSettings.siteURL + url;
                        if (url && url.indexOf('data:') === 0) {
                            $scope.objectURL = url;
                        } else if (url) {
                            var authData = localStorageService.get('authorizationData');
                            if (!authData) {
                                authData = JSON.parse($sessionStorage.get('doctorAuthorizationData'));
                            }
                            $http.get(url, {
                                responseType: 'arraybuffer',
                                headers: {
                                    'Authorization': 'JWT ' + authData.token
                                }
                            })
							.then(function (response) {
                                var blob = new Blob(
                                    [response.data], 
									{ type: response.headers('Content-Type') }
                                );
                                $scope.objectURL = URL.createObjectURL(blob);
                            });
                        }
                    });
                }
            };
        }]);
}());