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
    vm.isFollowed = isFollowed;

    ////////////////

    if (vm.user == null) {
        $state.go('home');
    }

    function follow() {
        UserService.follow(vm.currentUser, vm.user)
            .then(res => {
                vm.user.followers.push(vm.currentUser._id);
            });
    }

    function unfollow() {
        UserService.unfollow(vm.currentUser, vm.user)
            .then(res => {

            });
    }

    function isFollowed() {
        return vm.user.followers.find(x => x._id == vm.currentUser._id) !== undefined;
    }

}



