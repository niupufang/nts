var NtsDirectives = NtsDirectives || angular.module('NtsDirectives', []);

NtsDirectives.directive('superman', function () {
    return {
        restrict: 'AE',
        scope: {},
        controller: function ($scope) {
            $scope.abilities = [];

            this.addStrength = function () {
                $scope.abilities.push('strength');
            };

            this.addSpeed = function () {
                $scope.abilities.push('speed');
            };

            this.addLight = function () {
                $scope.abilities.push('light');
            };

        },
        link: function (scope, element, attr) {
            element.addClass('btn btn-primary');
            element.bind('mouseenter', function () {
                console.log(scope.abilities);
            });
        }
    };
});

NtsDirectives.directive('strength', function () {
    return {
        require: '^superman',
        link: function (scope, element, attr, supermanController) {
            supermanController.addStrength();
        }
    };
});

NtsDirectives.directive('speed', function () {
    return {
        require: '^superman',
        link: function (scope, element, attr, supermanController) {
            supermanController.addSpeed();
        }
    };
});

NtsDirectives.directive('light', function () {
    return {
        require: '^superman',
        link: function (scope, element, attr, supermanController) {
            supermanController.addLight();
        }
    };
});