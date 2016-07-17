(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$auth', 'localStorageService', '$state'];

    /* @ngInject */
    function HomeController($auth, localStorageService, $state) {
        var vm = this;
        vm.title = 'HomeController';

        //console.log('rootscope: ' + $rootScope.currentUser);

        vm.user = localStorageService.get("currentUser");

        vm.isAuthenticated = isAuthenticated;
        vm.logout = logout;
        vm.draw = draw;
        
        function isAuthenticated() {
            return $auth.isAuthenticated();
        }

        function logout() {
            $auth.logout();
            localStorageService.remove("currentUser");
            //delete $window.localStorage.currentUser;
        }
        
        function draw() {
            $state.go('draw');
        }
        
    }

    module.exports = HomeController;

})();

