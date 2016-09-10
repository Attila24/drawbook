'use strict';

FollowModalController.$inject = ['type', 'UserService', 'user'];

/**
 * The controller responsible for handling actions in the followings/followers modal window.
 */
export default function FollowModalController(type, UserService, user) {
    const vm = this;

    // bindable member variables
    vm.type = type;
    vm.arr = [];
    vm.user = user;

    // bindable member functions
    vm.loadFollowers = loadFollowers;
    vm.loadFollowing = loadFollowing;

    init();

    //////////////////////////////////////

    /**
     * Initialie controller:
     * - load followers or followings according to modal type
     */
    function init() {
        vm.loaded = 0;

        if (type == 'followers') loadFollowers();
        else if (type == 'following') loadFollowing();
    }

    /**
     * Loads followers and saves in a bindable member variable (vm.arr)
     */
    function loadFollowers() {
        UserService.getFollowers(vm.user.username, vm.loaded)
            .then(res => {
               vm.arr.push(...res);
               vm.loaded = vm.arr.length;
            });
    }

    /**
     * Loads followings and saves in a bindable member variable (vm.arr)
     */
    function loadFollowing() {
        UserService.getFollowing(vm.user.username, vm.loaded)
            .then(res => {
               vm.arr.push(...res);
               vm.loaded = vm.arr.length;
            });
    }
}