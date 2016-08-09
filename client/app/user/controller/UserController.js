'use strict';

UserController.$inject = ['user', '$state'];

/* @ngInject */
export default function UserController(user, $state) {
    var vm = this;
    vm.title = 'UserController';
    vm.images = [];
    vm.user = user.user;

    ////////////////

    if (vm.user == null) {
        $state.go('home');
    }
}



