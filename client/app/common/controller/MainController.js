'use strict';

MainController.$inject = ['$auth', 'UserService', 'localStorageService', 'socket'];

/* @ngInject */
export default function MainController($auth, UserService, localStorageService, socket) {

    const vm = this;
    vm.title = "MainController";
    vm.user = localStorageService.get('currentUser');
    vm.hasNewNotifications = false;
    vm.setNotificationsToRead = setNotificationsToRead;
    vm.isAuthenticated = isAuthenticated;

    if (vm.isAuthenticated()) init();

    ///////////////////////////////////////

    function init() {
        UserService.get(vm.user.username)
            .then(res => {
                vm.user = res.user;
                if (vm.user.notifications.length !== 0 && vm.user.lastReadNotificationId != vm.user.notifications.reverse()[0]) {
                    vm.hasNewNotifications = true;
                }
            });
    }

    function setNotificationsToRead() {
        vm.hasNewNotifications = false;
    }

    socket.on('notification', msg => {
       vm.hasNewNotifications = true;
    });

    function isAuthenticated() {
        return $auth.isAuthenticated();
    }

}