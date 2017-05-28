'use strict';
app.factory('userService', ['$http', 'ngAppSettings', '$cacheFactory', function ($http, ngAppSettings, $cacheFactory) {

    var serviceBase = ngAppSettings.apiServiceBaseUri + "Users";

    function getAll() {
        return $http({ cache: true, url: serviceBase, method: "GET" })
            .then(function (response) {
                return response.data;
            });
    };

    function addNewUser(User) {
        return $http({
            method: "POST",
            url: serviceBase,
            data: User,
        }).then(function (response) {
            clearUsersListCache();
            return response;
        });
    };
    function register(User) {
        return $http({
            method: "POST",
            url: serviceBase + "/register",
            data: User,
        }).then(function (response) {
            clearUsersListCache();
            return response;
        });
    };
    function getUser(UserId) {
        return $http.get(serviceBase + "/" + UserId)
            .then(function (response) {
                return response.data;
            })
    };
    function deleteUser(UserId) {
        return $http.delete(serviceBase + "/" + UserId)
            .then(function (response) {
                clearUsersListCache();
                return response.data;
            })
    };
    function editUser(User) {
        var UserInfo = {
            "firstName": User.firstName,
            "lastName": User.lastName
        };
        return $http.put(serviceBase + "/" + User._id, UserInfo)
            .then(function (response) {
                clearUsersListCache();
                return response.data;
            });
    };


    function clearUsersListCache() {
        var httpCache = $cacheFactory.get('$http');
        httpCache.remove(serviceBase);
    }

    return {
        addNewUser: addNewUser,
        getAll: getAll,
        register: register,
        getUser: getUser,
        deleteUser: deleteUser,
        editUser: editUser
    };
}]);

