'use strict';

UserController.$inject = ['user', '$state', 'localStorageService', 'UserService'];

/* @ngInject */
export default function UserController(user, $state, localStorageService, UserService) {
    var vm = this;
    vm.title = 'UserController';
    vm.images = [];
    vm.user = user.user;
    vm.currentUser = localStorageService.get('currentUser');

    vm.follow = follow;
    vm.unfollow = unfollow;

    ////////////////

    if (vm.user == null) {
        $state.go('404');
    }

    init();

    function init() {
        vm.isFollowed = vm.user.followers.find(x => x._id == vm.currentUser._id) !== undefined;
    }

    function follow() {
        UserService.follow(vm.currentUser, vm.user)
            .then(res => {
                vm.user.followers.push(vm.currentUser._id);
                vm.isFollowed = true;
            });
    }

    function unfollow() {
        UserService.unfollow(vm.currentUser, vm.user)
            .then(res => {
                vm.user.followers.splice(vm.user.followers.findIndex(x => x._id == vm.currentUser._id), 1);
                vm.isFollowed = false;
            });
    }
}