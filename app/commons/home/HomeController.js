(function () {
    'use strict';

    angular
        .module('paintr')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$auth', '$rootScope', '$window'];

    /* @ngInject */
    function HomeController($auth, $rootScope, $window) {
        var vm = this;
        vm.title = 'HomeController';

        console.log('rootscope: ' + $rootScope.currentUser);
        console.log('localstorage: ' + JSON.parse(localStorage.getItem('currentUser')));
        vm.user = JSON.parse(localStorage.getItem('currentUser'));

        vm.isAuthenticated = isAuthenticated;
        vm.logout = logout;

        function isAuthenticated() {
            return $auth.isAuthenticated();
        }

        function logout() {
            $auth.logout();
            delete $window.localStorage.currentUser;
        }

    }

    module.exports = HomeController;

})();

