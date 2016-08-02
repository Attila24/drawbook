'use strict';

angular
    .module('drawbook')
    .controller('HomeController', HomeController);

HomeController.$inject = ['$auth', 'localStorageService', 'UserService'];

/* @ngInject */
export default function HomeController($auth, localStorageService, UserService) {
    const vm = this;
    vm.title = 'HomeController';

    vm.user = localStorageService.get("currentUser");

    vm.isAuthenticated = isAuthenticated;
    vm.logout = logout;

    if (isAuthenticated()) init();

    function init() {
        UserService.get()
            .then(res => {
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


