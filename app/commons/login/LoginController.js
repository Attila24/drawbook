(function () {
    'use strict';

    angular
        .module('paintr')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$state', '$auth', '$rootScope', '$window'];

    /* @ngInject */
    function LoginController($state, $auth, $rootScope, $window) {
        var vm = this;
        vm.title = 'LoginController';

        vm.login = login;

        function login() {

            var user = {
                username: vm.user.name,
                password: vm.user.password
            };

            $auth.login(user)
                .then(function(res) {
                    $window.localStorage.currentUser = JSON.stringify(res.data.user);
                    $rootScope.currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    $state.go('home');
                })
                .catch(function(res) {
                    console.log('error: ' + res);
                });
        }
    }
    module.exports = LoginController;
})();

