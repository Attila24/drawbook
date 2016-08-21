'use strict';

FollowModalController.$inject = ['type', 'UserService', 'user'];

export default function FollowModalController(type, UserService, user) {
    const vm = this;
    vm.title = 'FollowModalController';
    vm.type = type;
    vm.arr = [];
    vm.user = user;

    vm.loadFollowers = loadFollowers;
    vm.loadFollowing = loadFollowing;

    init();

    ///////////////////////////

    function init() {
        vm.loaded = 0;

        if (type == 'followers') loadFollowers();
        else if (type == 'following') loadFollowing();
    }

    function loadFollowers() {
        UserService.getFollowers(vm.user.username, vm.loaded)
            .then(res => {
               vm.arr.push(...res);
               vm.loaded = vm.arr.length;
            });
    }

    function loadFollowing() {
        UserService.getFollowing(vm.user.username, vm.loaded)
            .then(res => {
                console.log(res);
               vm.arr.push(...res);
               vm.loaded = vm.arr.length;
            });
    }

}