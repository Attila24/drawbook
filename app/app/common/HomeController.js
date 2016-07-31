(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$auth', 'localStorageService', 'UserService'];

    /* @ngInject */
    function HomeController($auth, localStorageService, UserService) {
        var vm = this;
        vm.title = 'HomeController';

        vm.user = localStorageService.get("currentUser");

        vm.isAuthenticated = isAuthenticated;
        vm.logout = logout;

        if (isAuthenticated())
            init();

        function init() {
            UserService.get()
                .then(function (res) {
                    vm.users = res;
                })
        }

        
        function isAuthenticated() {
            return $auth.isAuthenticated();
        }

        function logout() {
            $auth.logout();
            localStorageService.remove("currentUser");
        }
    }

    module.exports = HomeController;

})();

