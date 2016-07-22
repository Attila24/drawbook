(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('ProfileEditController', ProfileEditController);

    ProfileEditController.$inject = ['$state', 'localStorageService', 'UserService'];

    /* @ngInject */
    function ProfileEditController($state, localStorageService, UserService) {
        var vm = this;
        vm.title = 'ProfileEditController';
        vm.edit = edit;
        vm.genders = ['Male', 'Female'];

        ////////////////////////////////////////////

        init();

        function init() {
            UserService.get(localStorageService.get('currentUser').username)
                .then(function (res) {
                    vm.user = res.user;
                })
                .catch(function (res) {});
        }

        function edit() {
            UserService.update(vm.user);
            $state.go('home');
        }
    }

    module.exports = ProfileEditController;

})();

