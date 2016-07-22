(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$auth', 'localStorageService'];

    /* @ngInject */
    function HomeController($auth, localStorageService) {
        var vm = this;
        vm.title = 'HomeController';

        vm.user = localStorageService.get("currentUser");

        vm.isAuthenticated = isAuthenticated;
        vm.logout = logout;
        
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

