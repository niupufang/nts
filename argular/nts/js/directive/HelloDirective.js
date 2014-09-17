var NtsDirectives = NtsDirectives || angular.module('NtsDirectives', []);

NtsDirectives.directive('helloDirective', function () {
    return {
        restrict: 'AEMC',
        templateUrl: 'tpl/hello.html',
        //replace: true
        transclude: true,
        link: function (scope, element, attr) {
            element.bind('mouseenter', function () {
                scope.$apply(attr.howtoload);
            });
        }
    };
});