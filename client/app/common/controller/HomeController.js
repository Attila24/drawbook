'use strict';

HomeController.$inject = ['$auth', 'localStorageService', 'UserService', 'NotificationService', 'ImageService', '$q'];

/* @ngInject */
export default function HomeController($auth, localStorageService, UserService, NotificationService, ImageService, $q) {
    const vm = this;
    vm.title = 'HomeController';
    vm.user = localStorageService.get("currentUser");

    vm.isAuthenticated = isAuthenticated;
    vm.logout = logout;
    if (isAuthenticated()) init();

    const limit = 10;

    ////////////////////////////////////////////

    function init() {
        UserService.get()
            .then(res => {
                vm.users = res;
            });
    }

    function isAuthenticated() {
        return $auth.isAuthenticated();
    }

    function logout() {
        $auth.logout();
        localStorageService.remove("currentUser");
    }
}


