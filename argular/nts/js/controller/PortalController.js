var NtsControllers = NtsControllers || angular.module('NtsControllers', []);

NtsControllers.controller('PortalController', ['$scope', function ($scope) {

    $scope.text = 'text';

    $scope.name = 'somename';

    $scope.loadData = function () {
        console.log('loadData');
    };
}]);