var nts = angular.module('nts', [
    'NtsDirectives',
    'NtsControllers',
    'ngRoute'
]);


nts.config(function ($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'tpl/login.html',
        controller: 'LoginController'
    }).when('/portal', {
        templateUrl: 'tpl/portal.html',
        controller: 'PortalController'
    }).otherwise({
        redirectTo: '/login'
    });
});
