(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('DrawController', DrawController);

    DrawController.$inject = ['$state', 'localStorageService', 'ImageService'];

    /* @ngInject */
    function DrawController($state, localStorageService, ImageService) {
        var vm = this;
        vm.title = 'DrawController';
        
        vm.saveImage = saveImage;

        ///////////////////////////////

        function saveImage() {
            var username = localStorageService.get("currentUser").username;

            ImageService.post(username)
                .then(function (res) {
                    $state.go('home');
                })
                .catch(function (res) {})
        }
        
    }

    module.exports = DrawController;

})();

