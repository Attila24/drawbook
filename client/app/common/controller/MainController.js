'use strict';

MainController.$inject = ['$auth', 'UserService', 'localStorageService', 'socket', '$state', '$rootScope'];

/* @ngInject */
export default function MainController($auth, UserService, localStorageService, socket, $state, $rootScope) {

    const vm = this;
    vm.title = "MainController";
    vm.user = localStorageService.get('currentUser');
    vm.hasNewNotifications = false;
    vm.setNotificationsToRead = setNotificationsToRead;
    vm.isAuthenticated = isAuthenticated;
    vm.goToHome = goToHome;
    vm.searchUser = searchUser;
    vm.logout = logout;

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


    function goToHome() {
        if ($state.is('home')) $state.reload();
        else $state.go('home');
    }

    function searchUser() {
        $state.go('users', {searchInput: vm.searchInput});
        vm.searchInput = '';
    }

    function logout() {
        $auth.logout();
        localStorageService.remove("currentUser");
        $state.go('home', {}, {reload: true});
    }

    $rootScope.$on('avatar-change', (event, data) => {
        UserService.getAvatarPath(vm.user.username)
            .then(res => {
                vm.user.avatarPath = res.avatarPath;
            });
    })
}