(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('ProfileEditController', ProfileEditController);

    ProfileEditController.$inject = ['$state', 'localStorageService', 'UserService', 'Upload', 'server'];

    /* @ngInject */
    function ProfileEditController($state, localStorageService, UserService, Upload, server) {
        var vm = this;
        vm.title = 'ProfileEditController';
        vm.edit = edit;
        vm.genders = ['Male', 'Female'];
        vm.upload = upload;

        var username = localStorageService.get('currentUser').username;

        ////////////////////////////////////////////

        init();

        function init() {
            UserService.get(username)
                .then(function (res) {
                    vm.user = res.user;
                    vm.avatarPath = vm.user.avatarPath || 'img/default-avatar.jpg';
                })
                .catch(function (res) {});
        }

        function edit() {
            UserService.update(vm.user);
            upload();
            $state.go('home');
        }

        function upload() {
            /*console.log('file: '+ file);
            console.log('vm.file: ' + vm.file);
            vm.f = file;*/
            //vm.errFile = errFiles && errFiles[0];

            var file = vm.file;

            if (file) {
                file.upload = Upload.upload({
                    url: server.url + '/users/' + vm.user.username + '/images/avatar',
                    data: {file: file}
                });


                file.upload.then(function (res) {
                    file.result = res;
                }, function (res) {
                    if (res.status > 0)
                        vm.errorMsg = res.status + ': ' + res.data;
                }, function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                });
            }

        }
    }

    module.exports = ProfileEditController;

})();

