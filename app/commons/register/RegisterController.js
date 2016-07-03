(function () {
    'use strict';

    angular
        .module('paintr')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$state', '$auth', '$rootScope', '$window'];

    /* @ngInject */
    function RegisterController($state, $auth, $rootScope, $window) {
        var vm = this;
        vm.title = 'RegisterController';
        vm.genders = ['Male', 'Female'];

        vm.register = register;

        ////////////////

        function register() {
            var user = {
                username: vm.user.name,
                password: vm.user.password
            };

            $auth.signup(user)
                .then(function(res) {
                    console.log(res);
                    $window.localStorage.currentUser = JSON.stringify(res.data.user);
                    $rootScope.currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    $state.go('home');
                })
                .catch(function(res) {
                    console.log('Error ' + res);
                })

        }
    }

    module.exports = RegisterController;

})();

