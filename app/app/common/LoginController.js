(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$state', '$auth', '$window'];

    /* @ngInject */
    function LoginController($state, $auth, $window) {
        var vm = this;
        vm.title = 'LoginController';

        vm.login = login;

        vm.incorrectLogin = false;

        function login() {

            var user = {
                username: vm.user.name,
                password: vm.user.password
            };

            $auth.login(user)
                .then(function(res) {
                    $window.localStorage.currentUser = JSON.stringify(res.data.user);
                    //$rootScope.currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    $state.go('home');
                })
                .catch(function(res) {
                    console.log('error: ' + res);
                    vm.incorrectLogin = true;
                });
        }
    }
    module.exports = LoginController;
})();

