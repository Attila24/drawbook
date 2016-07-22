(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$state', '$auth', 'UserService', 'localStorageService'];

    /* @ngInject */
    function RegisterController($state, $auth, UserService, localStorageService) {
        var vm = this;

        vm.title = 'RegisterController';
        vm.genders = ['Male', 'Female'];
        vm.takenUsername = false;

        vm.checkUsername = checkUsername;
        vm.register = register;

        ////////////////

        function checkUsername() {
            UserService.get(vm.user.username)
                .then(function (res) {
                    vm.takenUsername = res.user != null;
                })
                .catch(function(res) {
                    console.log('Server problem');
                });
        }

        function register() {
            var user = {
                username: vm.user.username,
                password: vm.user.password,
                firstName: vm.user.firstName,
                lastName: vm.user.lastName,
                age: vm.user.age,
                gender: vm.user.gender
            };

            $auth.signup(user)
                .then(function(res) {
                    console.log(res);
                    localStorageService.set("currentUser", res.data.user);
                    $auth.login(user)
                        .then(function (res) {
                            $state.go('home');
                        })
                        .catch(function (res) {
                            console.log('Error ' + res);
                        });
                })
                .catch(function(res) {
                    console.log('Error ' + res);
                });

        }
    }

    module.exports = RegisterController;

})();

