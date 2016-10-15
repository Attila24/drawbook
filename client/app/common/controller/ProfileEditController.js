'use strict';
/**
 * The controller responsible for handling the actions on the profile edit page.
 */
/* @ngInject */
export default function ProfileEditController($state, localStorageService, UserService, server, $auth, ConfirmService, $q) {
    const vm = this;

    // private variables
    const username = localStorageService.get('currentUser').username;

    // bindable member variables
    vm.genders = ['Male', 'Female'];

    // bindable member functions
    vm.edit = edit;
    vm.remove = remove;
    vm.checkNumber = checkNumber;
    vm.removeAvatar = removeAvatar;
    vm.isImage = isImage;

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
                isImage(vm.user.avatarPath);
            })
            .catch(res => {});
    }

    /**
     * The function responsible for sending the 'update' request to the server
     */
    function edit() {

        // update user
        UserService.update(vm.user);

        // go back to the homescreen
        $state.go('home', {}, {reload: true});
    }

    /**
     * The function for removing the current user's avatar.
     */
    function removeAvatar() {
        vm.user.avatarPath = 'img/default-avatar.jpg';
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
     * Checks if the image URL provided by the user is correct.
     * @param src the URL of the given image.
     */
    function isImage(src) {
        loadImage(src).then(res => {
            vm.correctImage = res;
        });
    }

    /**
     * Tries to load the image provided by the user. Returns a promise which resolves to a boolean value.
     * @param src The URL of the given image.
     * @returns {Promise}
     */
    function loadImage(src) {
        let deferred = $q.defer();
        let image = new Image();

        image.onerror = () => deferred.resolve(false);
        image.onload = () => deferred.resolve(true);
        image.src = src;

        return deferred.promise;
    }
}