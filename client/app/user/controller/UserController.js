'use strict';

import FollowModalController from './FollowModalController';

UserController.$inject = ['user', '$state', 'localStorageService', 'UserService', 'socket', '$modal', '$timeout', 'bsLoadingOverlayService', '$auth'];

/* @ngInject */
export default function UserController(user, $state, localStorageService, UserService, socket, $modal, $timeout, bsLoadingOverlayService, $auth) {
    var vm = this;
    vm.title = 'UserController';
    vm.images = [];
    vm.user = user.user;
    vm.currentUser = localStorageService.get('currentUser');

    vm.follow = follow;
    vm.unfollow = unfollow;
    vm.openModal = openModal;
    vm.isAuthenticated = isAuthenticated;

    ////////////////

    // endless reload fix
    $timeout(()=> {
        bsLoadingOverlayService.stop();
    }, 400);

    if (vm.user == null) {
        $state.go('404');
    }

    init();

    function init() {
        if (vm.isAuthenticated()) {
            vm.isFollowed = vm.user.followers.find(x => x._id == vm.currentUser._id) !== undefined;
        }
    }

    function follow() {
        UserService.follow(vm.currentUser, vm.user)
            .then(res => {
                vm.user.followers.push(vm.currentUser._id);
                vm.isFollowed = true;
                socket.emit('notification', {'to': vm.user._id, 'from': vm.currentUser._id, 'author': vm.currentUser.username, 'type': 'follow'});
            });
    }

    function unfollow() {
        UserService.unfollow(vm.currentUser, vm.user)
            .then(res => {
                vm.user.followers.splice(vm.user.followers.findIndex(x => x._id == vm.currentUser._id), 1);
                vm.isFollowed = false;
            });
    }

    function isAuthenticated() {
        return $auth.isAuthenticated();
    }

    function openModal(type) {
        if (type == 'followers') {

            $modal({
               title: 'Followers',
               templateUrl: '/app/user/tpl/followmodal.tpl.html',
               controller: FollowModalController,
               controllerAs: 'vm',
               resolve: {
                   type: () => 'followers',
                   user: () => vm.user
               },
               animation: 'am-fade',
               backdropAnimation: 'backdrop-anim',
               keyboard: false
            });

        } else if (type == 'following') {

            $modal({
                title: 'Following',
                templateUrl: '/app/user/tpl/followmodal.tpl.html',
                controller: FollowModalController,
                controllerAs: 'vm',
                resolve: {
                    type: () => 'following',
                    user: () => vm.user
                },
                animation: 'am-fade',
                backdropAnimation: 'backdrop-anim',
                keyboard: false
            });
        }
    }
}