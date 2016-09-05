'use strict';
/**
 * The controller responsible for handling the actions on the profile edit page.
 */
/* @ngInject */
export default function ProfileEditController($state, localStorageService, UserService, Upload, server, $auth, ConfirmService, $rootScope) {
    const vm = this;

    // private variables
    const username = localStorageService.get('currentUser').username;

    // bindable member variables
    vm.genders = ['Male', 'Female'];

    // bindable member functions
    vm.edit = edit;
    vm.upload = upload;
    vm.remove = remove;
    vm.checkNumber = checkNumber;
    vm.removeAvatar = removeAvatar;

    init();

    //////////////////////////////////////

    /**
     * Initilize controller:
     * - get the current user's data
     */
    function init() {
        UserService.get(username)
            .then(res => {
                vm.user = res.user;
                vm.avatarPath = vm.user.avatarPath || 'img/default-avatar.jpg';
            })
            .catch(res => {});
    }

    /**
     * The function responsible for sending the 'update' request to the server
     */
    function edit() {

        // if the avatar path changed, send notification to $rootScope
        if (vm.user.avatarPath != vm.avatarPath) {
            $rootScope.$emit('avatar-change', 'Avatar changed!');
        }
        vm.user.avatarPath = vm.avatarPath;

        // update user, uplad new avatar (if present)
        UserService.update(vm.user);
        upload();

        // go back to the homescreen
        $state.go('home', {}, {reload: true});
    }

    /**
     * The function for removing the current user's avatar.
     */
    function removeAvatar() {
        vm.file = null;
        vm.avatarPath = 'img/default-avatar.jpg';
    }

    /**
     * The function responsible for sending the 'delete' request to the server
     */
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

    /**
     * Checks if the age input is not too high or low.
     */
    function checkNumber() {
        if (vm.user.age === undefined)
            vm.user.age = 999;
    }

    /**
     * The function responsible for uploading the user's new avatar.
     */
    function upload() {
        const file = vm.file;

        if (file) {
            // upload new avatar using the upload service
            file.upload = Upload.upload({
                url: `${server.url}/users/${vm.user.username}/images/avatar`,
                data: {file}
            });

            file.upload.then(res => {
                file.result = res;

                // Set the new avatar path in the browser's local storage
                let currentUser = localStorageService.get('currentUser');
                currentUser.avatarPath = res.data.avatarPath;
                localStorageService.set('currentUser', currentUser);
            }, res => {
                // show error message if there was error.
                if (res.status > 0) {
                    vm.errorMsg = `${res.status}: ${res.data}`;
                } else if (res.status) {
                    vm.errorMsg = res.status;
                }
            });
        }
    }
}