(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$auth', '$window', '$state'];

    /* @ngInject */
    function HomeController($auth, $window, $state) {
        var vm = this;
        vm.title = 'HomeController';

        //console.log('rootscope: ' + $rootScope.currentUser);
        console.log('localstorage: ' + JSON.parse(localStorage.getItem('currentUser')));
        vm.user = JSON.parse(localStorage.getItem('currentUser'));

        vm.isAuthenticated = isAuthenticated;
        vm.logout = logout;
        vm.draw = draw;
        
        function isAuthenticated() {
            return $auth.isAuthenticated();
        }

        function logout() {
            $auth.logout();
            delete $window.localStorage.currentUser;
        }
        
        function draw() {
            $state.go('draw');
        }
        
    }

    module.exports = HomeController;

})();

