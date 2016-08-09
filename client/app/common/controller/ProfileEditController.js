'use strict';

ProfileEditController.$inject = ['$state', 'localStorageService', 'UserService', 'Upload', 'server', '$auth'];

/* @ngInject */
export default function ProfileEditController($state, localStorageService, UserService, Upload, server, $auth) {
    const vm = this;
    vm.title = 'ProfileEditController';
    vm.genders = ['Male', 'Female'];

    vm.edit = edit;
    vm.upload = upload;
    vm.remove = remove;

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
        UserService.update(vm.user);
        upload();
        $state.go('home');
    }
    
    function remove() {
        UserService.delete(vm.user).then(res => {
            if (res.status != 500) {
                $auth.logout();
                localStorageService.remove("currentUser");
                $state.go('home');
            }
        });
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
                }
            });
        }
    }
}


