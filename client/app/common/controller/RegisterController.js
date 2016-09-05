'use strict';

RegisterController.$inject = ['$state', '$auth', 'UserService', 'localStorageService', 'socket'];

/**
 * The controller responsible for handling the actions on the register page.
 */
/* @ngInject */
export default function RegisterController($state, $auth, UserService, localStorageService, socket) {
    const vm = this;

    // bindable member variables
    vm.genders = ['Male', 'Female'];
    vm.takenUsername = false;

    // bindable member functions
    vm.checkNumber = checkNumber;
    vm.checkUsername = checkUsername;
    vm.register = register;

    //////////////////////////////////////

    /**
     * Checks if the age input is too high or too low.
     */
    function checkNumber() {
        if (vm.user.age === undefined)
            vm.user.age = 999;
    }

    /**
     * Checks if the username in the input is taken or not.
     */
    function checkUsername() {
        UserService.get(vm.user.username)
            .then(res => {
                vm.takenUsername = res.user != null;
            });
    }

    /**
     * The function responsible for sending the 'register' request to the server.
     */
    function register() {
        const user = {
            username: vm.user.username,
            password: vm.user.password,
            firstName: vm.user.firstName,
            lastName: vm.user.lastName,
            age: vm.user.age,
            gender: vm.user.gender,
            description: vm.user.description
        };

        // Register user using the $auth service, then login user
        $auth.signup(user)
            .then(res => {
                localStorageService.set('currentUser', res.data.user);
                $auth.login(user)
                    .then(res => {
                        // send a request to the server to save the user's socket id
                        socket.emit('setUserId', res.data.user._id);
                        $state.go('home', {}, {reload: true});
                    });
            });
    }
}