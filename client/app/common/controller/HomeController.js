'use strict';

HomeController.$inject = ['$auth', 'localStorageService', 'UserService', 'NotificationService', 'ImageService', '$q'];

/* @ngInject */
export default function HomeController($auth, localStorageService, UserService, NotificationService, ImageService, $q) {
    const vm = this;
    vm.title = 'HomeController';
    vm.user = localStorageService.get("currentUser");

   /* vm.notifications = []; // full notifications
    vm.notif_arr = []; // only IDs*/

    vm.isAuthenticated = isAuthenticated;
    vm.logout = logout;
    //vm.loadMoreNotifications = loadMoreNotifications;

    if (isAuthenticated()) init();

    const limit = 5;

    ////////////////////////////////////////////

    function init() {
        UserService.get()
            .then(res => {
                vm.users = res;
            });

        /*UserService.get(vm.user.username).then(res => {
            vm.notif_arr = res.user.notifications.reverse();

            console.log(vm.notif_arr);

            vm.loaded = vm.notif_arr.length < limit ? vm.notif_arr.length : limit;

            loadNotifications(0, vm.loaded)
                .then(() => {
                    loadNotificationImages(0, vm.loaded)
                })
        });*/
    }


    /*function loadNotifications(from, to) {
        let d = $q.defer();

        for (let i = from; i < to; i++) {
            NotificationService.get(vm.user.username, vm.notif_arr[i])
                .then(res => {
                    vm.notifications.push(res);

                    if (i == to - 1) d.resolve();
                })
                .catch(err => {d.reject(err);});
        }
        return d.promise;
    }

    function loadNotificationImages(from, to) {

        for (let i = from; i < to; i ++) {
            ImageService.get(vm.user.username, vm.notifications[i].imageid)
                .then(res => {
                    vm.notifications[i].imagedata = res.data.data.data;
                })
        }
    }

    function loadMoreNotifications() {
        vm.current = vm.loaded;
        vm.loaded = vm.notif_arr.length < vm.loaded + limit ? vm.notif_arr.length : vm.loaded + limit;

        loadNotifications(vm.current, vm.loaded).then(() => {
            loadNotificationImages(vm.current, vm.loaded)
        });
    }*/

    function isAuthenticated() {
        return $auth.isAuthenticated();
    }

    function logout() {
        $auth.logout();
        localStorageService.remove("currentUser");
    }
}


