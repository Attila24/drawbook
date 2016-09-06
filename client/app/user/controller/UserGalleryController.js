'use strict';
/**
 * The controller responsible for handling the actions in the user's gallery section.
 */
/* @ngInject */
export default function UserGalleryController(user, ImageService, localStorageService, $stateParams, $state, LikeService, CommentService, $q, ConfirmService) {
    const vm = this;

    // private variables
    const limit = 12;

    // bindable member variables
    vm.user = user.user;
    vm.images = [];

    // bindable member functions
    vm.loadImages = loadImages;
    vm.deleteImage = deleteImage;
    vm.tooltip = tooltip;

    init();

    //////////////////////////////////////

    /**
     * Initialize controller:
     * - if image id is present in state parameters, open image modal window
     * - otherwise, load images in the gallery
     */
    function init(){
        if ($stateParams.openImage !== null && $stateParams.openImage !== undefined) {
            $state.go('user.gallery.image', {id: $stateParams.openImage, index: null});
        }
        vm.currentUser = localStorageService.get('currentUser');
        vm.loaded = 0;
        loadImages();
    }

    /**
     * The function responsible for loading images in the gallery.
     */
    function loadImages() {
        ImageService.getMany(vm.user.username, vm.loaded, limit)
            .then(res => {
                let promises = [];

                angular.forEach(res.images, item => {
                   // the promise to load the likes of current image
                   const likesPromise = LikeService.get(vm.user.username, item._id).then(data => {item.likes = data;});

                   // the promise to load the comments of current image
                   const commentPromise = CommentService.getCount(vm.user.username, item._id).then(data => {item.commentCount = data;});

                    promises.push(likesPromise, commentPromise);
                });

                // after all promises were exectuted, save images in a bindable member variable (vm.images)
                $q.all(promises).then(() => {
                    vm.images.push(...res.images);
                    vm.loaded = vm.images.length;
                });
            });
    }

    /**
     * The function responsible for sending a 'delete' request to the server.
     * @param id the id of the image that will be deleted.
     * @param index the index of the image in the gallery array.
     */
    function deleteImage(id, index) {
        ConfirmService.show().then(res => {
            if (res === 'yes') {
                // delete image from server, then delete image from local gallery array
                ImageService.delete(id, vm.user.username).then(() => {vm.images.splice(index, 1);});
            }
        });
    }

    /**
     * The function responsible for showing the 'likes' tooltip for a given image.
     * @param index the index of the current image in the feed array.
     * @returns {{title: string}} an object that contains the string that is being displayed by AngularStrap.
     */
    function tooltip(index) {
        if (vm.images[index].likes.length > 0) {

            let str = '';
            const limit = 5; // maximum number of users being shown in tooltip

            // reduce the 'likes' array to a HTML string of the last five usernames
            if (vm.images[index].likes.length <= limit) {
                str = vm.images[index].likes
                    .map(x => x.username)
                    .reduce((prev, curr) => prev + "<br />" + curr);
            } else {
                str = vm.images[index].likes.slice(0, limit)
                    .map(x => x.username)
                    .reduce((prev, curr) => prev + "<br />" + curr);

                str += "<br />" + (vm.images[index].likes.length - limit) + " more";
            }

            return {
                title: str
            }
        }
    }
}