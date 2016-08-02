(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$state', '$auth', 'UserService', 'localStorageService'];

    /* @ngInject */
    function RegisterController($state, $auth, UserService, localStorageService) {
        const vm = this;

        vm.title = 'RegisterController';
        vm.genders = ['Male', 'Female'];
        vm.takenUsername = false;

        vm.checkUsername = checkUsername;
        vm.register = register;

        ////////////////

        function checkUsername() {
            UserService.get(vm.user.username)
                .then(res => {
                    vm.takenUsername = res.user != null;
                })
                .catch(res => {});
        }

        function register() {
            let user = {
                username: vm.user.username,
                password: vm.user.password,
                firstName: vm.user.firstName,
                lastName: vm.user.lastName,
                age: vm.user.age,
                gender: vm.user.gender
            };
            $auth.signup(user)
                .then(res => {
                    localStorageService.set("currentUser", res.data.user);
                    $auth.login(user)
                        .then(res => {
                            $state.go('home');
                        })
                        .catch(res =>{});
                })
                .catch(res =>{});
        }

    }

    module.exports = RegisterController;

})();

