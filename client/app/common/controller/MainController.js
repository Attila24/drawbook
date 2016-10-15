'use strict';
/**
 * The controller responsible for handling the actions related to the navigation bar.
 * This controller's state is the parent of all other states, thus this controller is present in every page session.
 */
/* @ngInject */
export default function MainController($auth, UserService, localStorageService, socket, $state, $rootScope) {
    const vm = this;

    // bindable member variables
    vm.user = localStorageService.get('currentUser');
    vm.hasNewNotifications = false;

    // bindable member functions
    vm.setNotificationsToRead = setNotificationsAsRead;
    vm.isAuthenticated = isAuthenticated;
    vm.goToHome = goToHome;
    vm.searchUser = searchUser;
    vm.logout = logout;

    if (vm.isAuthenticated()) init();

    //////////////////////////////////////

    // Event handlers

    // on receiving new notification: indicate that there is new notification
    socket.on('notification', msg => {
        vm.hasNewNotifications = true;
    });

    // on reading the newest notification: indicate that there is no new notifications
    $rootScope.$on('notifications-read', (event, data) => {
       vm.hasNewNotifications = false;
    });

    // Functions

    /**
     * Initializing controller:
     * - get current user's data
     * - determine if current user has new notifications or not
     */
    function init() {
        UserService.get(vm.user.username)
            .then(res => {
                vm.user = res.user;
                if (vm.user.notifications.length !== 0 && vm.user.lastReadNotificationId != vm.user.notifications.reverse()[0]) {
                    vm.hasNewNotifications = true;
                }
            });
    }

    /**
     * Set current user's notifications as read.
     */
    function setNotificationsAsRead() {
        vm.hasNewNotifications = false;
    }

    /**
     * The function to determine if the current user is authenticated.
     * @returns {*}
     */
    function isAuthenticated() {
        return $auth.isAuthenticated();
    }

    /**
     * The function to redirect the user to the homescreen.
     */
    function goToHome() {
        if ($state.is('home')) $state.reload();
        else $state.go('home');
    }

    /**
     * The function to redirect the user to the search screen.
     */
    function searchUser() {
        $state.go('users', {searchInput: vm.searchInput});
        vm.searchInput = '';
    }

    /**
     * The function responsible for logging out the user.
     */
    function logout() {
        $auth.logout();
        localStorageService.remove("currentUser");
        $state.go('home', {}, {reload: true});
    }
}