var NtsControllers = NtsControllers || angular.module('NtsControllers', []);

NtsControllers.controller('LoginController', ['$scope', function ($scope) {
    $scope.user = {
        username: '',
        password: ''
    };

    $scope.tooltipMessage = '请输入用户名';

    $scope.onOK = function () {
        console.log($scope.user);
    };

    $scope.loginBtnDisabled = true;

    $scope.onInputKeyup = function () {
        // validate

        if (!this.user.username) {
            $scope.tooltipMessage = '请输入用户名';
            $scope.loginBtnDisabled = true;
        } else if (!this.user.password) {
            $scope.tooltipMessage = '请输入密码';
            $scope.loginBtnDisabled = true;
        } else {
            $scope.tooltipMessage = '请点击登录';
            $scope.loginBtnDisabled = false;
        }
    };

    $scope.onReset = function () {
        this.user.username = this.user.password = '';
    };
}]);

