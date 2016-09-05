'use strict';

import FollowModalController from './FollowModalController';

UserController.$inject = ['user', '$state', 'localStorageService', 'UserService', 'socket', '$modal', '$timeout', 'bsLoadingOverlayService', '$auth'];

/**
 * The controller responsible for handling user data and actions in the user page (bio part).
 */
/* @ngInject */
export default function UserController(user, $state, localStorageService, UserService, socket, $modal, $timeout, bsLoadingOverlayService, $auth) {
    var vm = this;

    // bindable member variables
    vm.images = [];
    vm.user = user.user;
    vm.currentUser = localStorageService.get('currentUser');

    // bindable member functions
    vm.follow = follow;
    vm.unfollow = unfollow;
    vm.openModal = openModal;
    vm.isAuthenticated = isAuthenticated;

    // Endless reload fix
    $timeout(()=> {
        bsLoadingOverlayService.stop();
    }, 400);

    // If user was deleted, go to 404 page
    if (vm.user == null) {
        $state.go('404');
    }

    init();

    //////////////////////////////////////

    /**
     * Initialize controller:
     * - check if user is followed by current user
     */
    function init() {
        if (vm.isAuthenticated()) {
            vm.isFollowed = vm.user.followers.find(x => x._id == vm.currentUser._id) !== undefined;
        }
    }

    /**
     * The function responsible for sending the 'follow' request to the server.
     */
    function follow() {
        UserService.follow(vm.currentUser, vm.user)
            .then(res => {
                vm.user.followers.push(vm.currentUser._id);
                vm.isFollowed = true;

                // send notification to the server that user is followed
                socket.emit('notification', {'to': vm.user._id, 'from': vm.currentUser._id, 'author': vm.currentUser.username, 'type': 'follow'});
            });
    }

    /**
     * The function responsible for sending the 'unfollow' request to the server.
     */
    function unfollow() {
        UserService.unfollow(vm.currentUser, vm.user)
            .then(res => {
                vm.user.followers.splice(vm.user.followers.findIndex(x => x._id == vm.currentUser._id), 1);
                vm.isFollowed = false;
            });
    }

    /**
     * The function to determine if the current user is authenticated.
     * @returns {*}
     */
    function isAuthenticated() {
        return $auth.isAuthenticated();
    }

    /**
     * The function responsible for opening the modal for showing followings or followers.
     * @param type the type of modal window
     */
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