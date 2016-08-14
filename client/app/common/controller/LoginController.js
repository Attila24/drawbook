'use strict';

LoginController.$inject = ['$state', '$auth', 'localStorageService', 'socket'];

/* @ngInject */
export default function LoginController($state, $auth, localStorageService, socket) {
    const vm = this;

    vm.title = 'LoginController';
    vm.incorrectLogin = false;

    vm.login = login;

    //////////////////////////////////////

    function login() {

        let user = {
            username: vm.user.name,
            password: vm.user.password
        };

        $auth.login(user)
            .then(function(res) {
                if (res.status != 401) {
                    socket.emit('setUserId', res.data.user._id);
                    localStorageService.set("currentUser", res.data.user);
                    $state.go('home');
                }
            })
            .catch(function(res) {
                console.log('Error: ' + res);
                vm.incorrectLogin = true;
            });
    }
}

