(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$state', '$auth', 'localStorageService'];

    /* @ngInject */
    function LoginController($state, $auth, localStorageService) {
        const vm = this;

        vm.title = 'LoginController';
        vm.incorrectLogin = false;

        vm.login = login;

        //////////////////////////////////////

        function login() {

            let user = {
                username: vm.user.name,
                password: vm.user.password
            };

            $auth.login(user)
                .then(function(res) {
                    localStorageService.set("currentUser", res.data.user);
                    $state.go('home');
                })
                .catch(function(res) {
                    console.log('Error: ' + res);
                    vm.incorrectLogin = true;
                });
        }
    }
    module.exports = LoginController;
})();

