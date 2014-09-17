var NtsDirectives = NtsDirectives || angular.module('NtsDirectives', []);
NtsDirectives.directive('world', function () {
    return {
        restrict: 'AE',
        template: '<div>this is directive ,<input type="text" ng-model="text"> </div>',
        replace: true,
        scope: {
            text: '='
        }
        /*,
        link: function (scope, element, attr, controller) {
            scope.text = attr.text;

            //console.log(attr.text);
        }*/
    };
});