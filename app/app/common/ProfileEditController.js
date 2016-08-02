(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('ProfileEditController', ProfileEditController);

    ProfileEditController.$inject = ['$state', 'localStorageService', 'UserService', 'Upload', 'server'];

    /* @ngInject */
    function ProfileEditController($state, localStorageService, UserService, Upload, server) {
        const vm = this;
        vm.title = 'ProfileEditController';
        vm.genders = ['Male', 'Female'];

        vm.edit = edit;
        vm.upload = upload;

        let username = localStorageService.get('currentUser').username;

        init();

        ////////////////////////////////////////////


        function init() {
            UserService.get(username)
                .then(res => {
                    vm.user = res.user;
                    vm.avatarPath = vm.user.avatarPath || 'img/default-avatar.jpg';
                })
                .catch(res => {});
        }

        function edit() {
            UserService.update(vm.user);
            upload();
            $state.go('home');
        }

        function upload() {
            let file = vm.file;

            if (file) {

                file.upload = Upload.upload({
                    url: server.url + '/users/' + vm.user.username + '/images/avatar',
                    data: {file: file}
                });

                file.upload.then(function (res) {
                    file.result = res;
                }, res => {
                    if (res.status > 0) {
                        vm.errorMsg = res.status + ': ' + res.data;
                    }
                });
            }
        }
    }

    module.exports = ProfileEditController;

})();

