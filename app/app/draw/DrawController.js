(function () {
    'use strict';

    angular
        .module('drawbook')
        .controller('DrawController', DrawController);

    DrawController.$inject = ['$state', 'localStorageService', 'ImageService'];

    /* @ngInject */
    function DrawController($state, localStorageService, ImageService) {
        const vm = this;
        vm.title = 'DrawController';
        
        vm.saveImage = saveImage;

        ///////////////////////////////

        function saveImage() {

            let tmpcanvas = $('<canvas>').attr({width: 600, height: 600});
            let tmpcontext = tmpcanvas[0].getContext('2d');
            let arr = [];

            $('.canvas').each(() => {
                arr.push({
                    canvas: $(this),
                    zindex: parseInt($(this).css("z-index"))
                })
            });

            arr.sort((a, b) => a.zindex - b.zindex);

            for (let i = 0; i < arr.length; i++) {
                tmpcontext.drawImage(arr[i]['canvas'][0], 0, 0);
            }

            let img = tmpcanvas[0].toDataURL();
            let username = localStorageService.get("currentUser").username;

            ImageService.post(username, img, vm.imagetitle)
                .then(res => {
                    $state.go('home');
                })
                .catch(res => {});
        }
        
    }

    module.exports = DrawController;

})();

