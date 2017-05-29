function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/index/users");

    $stateProvider
        .state('index', {
            abstract: true,
            controller: "MainCtrl",
            url: "/index",
            templateUrl: "views/common/content.html"
        })
        .state('index.users', {
            url: "/users",
            templateUrl: "views/users.html",
            controller: "userCtrl",
            data: { pageTitle: 'Users' }
        })
        .state('register', {
            url: "/register",
            templateUrl: "views/register.html",
            controller: "registerCtrl",
            data: { pageTitle: 'Register' }
        })
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            controller: "LoginCtrl",
            data: { pageTitle: 'Login' }
        })
}
app.config(config)
    .run(function ($rootScope, $state, $injector) {
        $rootScope.$state = $state;

    });

var siteURL = window.location.origin;
var siteURLWithoutPort = (window.location.port ? siteURL.split(":" + window.location.port)[0] : siteURL);
app.constant('ngAppSettings', {
    siteURL: siteURL,
    siteURLWithoutPort: siteURLWithoutPort,
    apiServiceBaseUri: siteURL + '/api/v1/',
    clientId: 'demoAngularApp'
});

app.constant('roleNames', {
    adminRoleName: "admin",
    medRepRoleName: "medicalrepresentative",
    supervisorRoleName: "supervisor"
});

app.constant('presentationStatusDetails', {
    finished: {
        text: "Закончено",
        color: "default"
    },
    online: {
        text: "Онлайн",
        color: "primary"
    },
    offline: {
        text: "Oффлайн",
        color: "danger"
    },
    pending: {
        text: "В ожидании",
        color: "warning"
    }
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.run(['authService', '$state', '$timeout', function (authService, $state, $timeout) {
    if (window.presentationId) {
        $timeout(function () {
            $state.go("medinfwatch", { "presId": presentationId });
        });

    }
    window.handleOpenURL = function (param) {
        var presentationId = param.substring(param.indexOf('#') + 1);
        $timeout(function () {
            $state.go("medinfwatch", { "presId": presentationId });
        });
    }
    authService.fillAuthData();
}]);
