'use strict';
/* @ngInject */
export default function DrawController($state, localStorageService, ImageService, $auth) {
    const vm = this;

    // bindable member functions
    vm.saveImage = saveImage;
    vm.isAuthenticated = isAuthenticated;

    //////////////////////////////////////

    /**
     * The function responsible for saving the image and sending it to the server.
     */
    function saveImage() {

        // get canvas and context
        let tmpcanvas = $('<canvas>').attr({width: 600, height: 600});
        let tmpcontext = tmpcanvas[0].getContext('2d');
        let arr = [];

        // push each layers into the array
        $('.canvas').each(function () {
            arr.push({
                canvas: $(this),
                zindex: parseInt($(this).css("z-index"))
            })
        });

        // sort by z index
        arr.sort((a, b) => a.zindex - b.zindex);

        // draw a new image from all the layers
        for (let i = 0; i < arr.length; i++) {
            tmpcontext.drawImage(arr[i]['canvas'][0], 0, 0);
        }

        // save as a data URL
        let img = tmpcanvas[0].toDataURL();
        let username = localStorageService.get("currentUser").username;

        // send it to the server
        ImageService.post(username, img, (vm.imagetitle))
            .then(() => {
                $state.go('user.gallery', {username: username});
            });
    }

    /**
     * The function responsible for logging out the user.
     */
    function isAuthenticated() {
        return $auth.isAuthenticated();
    }
}