'use strict';

ProfileEditController.$inject = ['$state', 'localStorageService', 'UserService', 'Upload', 'server', '$auth', 'ConfirmService'];

/* @ngInject */
export default function ProfileEditController($state, localStorageService, UserService, Upload, server, $auth, ConfirmService) {
    const vm = this;
    vm.title = 'ProfileEditController';
    vm.genders = ['Male', 'Female'];

    vm.edit = edit;
    vm.upload = upload;
    vm.remove = remove;
    vm.checkNumber = checkNumber;
    vm.removeAvatar = removeAvatar;

    const username = localStorageService.get('currentUser').username;

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
        vm.user.avatarPath = vm.avatarPath;
        UserService.update(vm.user);
        upload();
        $state.go('home', {}, {reload: true});
    }

    function removeAvatar() {
        vm.file = null;
        vm.avatarPath = 'img/default-avatar.jpg';
    }
    
    function remove() {
        ConfirmService.show().then(res => {
            if (res === 'yes') {
                UserService.delete(vm.user).then(res => {
                    if (res.status != 500) {
                        $auth.logout();
                        localStorageService.remove("currentUser");
                        $state.go('home');
                    }
                });
            }
        });
    }

    function checkNumber() {
        if (vm.user.age === undefined)
            vm.user.age = 999;
    }

    function upload() {
        const file = vm.file;

        if (file) {

            file.upload = Upload.upload({
                url: `${server.url}/users/${vm.user.username}/images/avatar`,
                data: {file}
            });

            file.upload.then(res => {
                file.result = res;

                // set new avatar path in localstorage
                let currentUser = localStorageService.get('currentUser');
                currentUser.avatarPath = res.data.avatarPath;
                localStorageService.set('currentUser', currentUser);
            }, res => {
                if (res.status > 0) {
                    vm.errorMsg = `${res.status}: ${res.data}`;
                } else if (res.status) {
                    vm.errorMsg = res.status;
                }
            });
        }
    }
}


