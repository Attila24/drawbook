'use strict';

HomeController.$inject = ['$auth', 'currentUser', 'UserService'];

/* @ngInject */
export default function HomeController($auth, currentUser, UserService) {
    const vm = this;
    vm.title = 'HomeController';
    vm.user = currentUser;

    vm.isAuthenticated = isAuthenticated;
    vm.loadFeed = loadFeed;
    if (isAuthenticated()) init();

    const limit = 10;

    ////////////////////////////////////////////

    function init() {
        UserService.get()
            .then(res => {
                vm.users = res;
            });
        vm.feed = [];
        vm.loaded = 0;

        console.log(vm.user.feed);

        loadFeed();
    }

    function loadFeed() {
        console.log(vm.loaded);
        UserService.getFeed(vm.user.username, vm.loaded)
            .then(res => {
               console.log(res);
               vm.feed.push(...res);
               vm.loaded += limit;
            });
    }

    function isAuthenticated() {
        return $auth.isAuthenticated();
    }
}


