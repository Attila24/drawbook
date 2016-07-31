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
        //var jq = $.noConflict();

        ///////////////////////////////

        function saveImage() {


            var tmpcanvas = $('<canvas>').attr({width: 600, height: 600});
            var tmpcontext = tmpcanvas[0].getContext("2d");

            var arr = [];

            $('.canvas').each(function() {
                arr.push({
                    canvas: $(this),
                    zindex: parseInt($(this).css("z-index"))
                })
            });

            arr.sort(function(a, b) {
                return (a.zindex - b.zindex);
            });

            for (var i = 0; i < arr.length; i++) {
                tmpcontext.drawImage(arr[i]['canvas'][0], 0, 0);
            }

            var img = tmpcanvas[0].toDataURL();
            var username = localStorageService.get("currentUser").username;

            ImageService.post(username, img, vm.imagetitle)
                .then(function (res) {
                    $state.go('home');
                })
                .catch(function (res) {});
        }
        
    }

    module.exports = DrawController;

})();

