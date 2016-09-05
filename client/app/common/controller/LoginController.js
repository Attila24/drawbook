'use strict';

LoginController.$inject = ['$state', '$auth', 'localStorageService', 'socket'];

/**
 * The controller responsible for handling the login screen actions.
 */
/* @ngInject */
export default function LoginController($state, $auth, localStorageService, socket) {
    const vm = this;

    // bindable member functions
    vm.login = login;

    //////////////////////////////////////

    /**
     * The function responsible for handling the login action.
     */
    function login() {

        let user = {
            username: vm.user.name,
            password: vm.user.password
        };

        // login user using the $auth service
        $auth.login(user)
            .then(function(res) {
                if (res.status != 401) {

                    // send message to server to save the current user's socket id.
                    socket.emit('setUserId', res.data.user._id);

                    // save current user's data in the browser's local storage.
                    localStorageService.set("currentUser", res.data.user);
                    $state.go('home', {}, {reload: true});
                }
            });
    }
}