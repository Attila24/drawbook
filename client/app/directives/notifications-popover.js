NotificationsPopover.$inject = ['$popover'];

NotificationsController.$inject = ['$scope', 'localStorageService', 'UserService', 'NotificationService', 'ImageService', '$q', '$state'];

function NotificationsController($scope, localStorageService, UserService, NotificationService, ImageService, $q, $state) {

    $scope.user = localStorageService.get('currentUser');
    $scope.init = init;
    $scope.loadMoreNotifications = loadMoreNotifications;
    $scope.setLastReadNotification = setLastReadNotification;
    $scope.goToImage = goToImage;

    const limit = 5;

    function init(){
        $scope.notifications = [];
        $scope.notif_arr = [];
        $scope.user = localStorageService.get('currentUser');


        UserService.get($scope.user.username)
            .then(res => {

                $scope.user = res.user;

                $scope.notif_arr = res.user.notifications.reverse();
                $scope.loaded = $scope.notif_arr.length < limit ? $scope.notif_arr.length : limit;

                loadNotifications(0, $scope.loaded)
                    .then(() => {
                        loadNotificationImages(0, $scope.loaded)
                    })
            })
    }

    function loadNotifications(from, to) {
        let d = $q.defer();

        for (let i = from; i < to; i++) {
            NotificationService.get($scope.user.username, $scope.notif_arr[i])
                .then(res => {
                    $scope.notifications.push(res);
                    if (i == to - 1) d.resolve();
                })
                .catch(err => {d.reject(err);});
        }
        return d.promise;
    }

    function loadNotificationImages(from, to) {
        for (let i = from; i < to; i++) {
            ImageService.get($scope.user.username, $scope.notifications[i].imageid)
                .then(res => {
                    if (res.data.status == 404) {
                        $scope.notifications[i].deleted = true;
                        $scope.notifications[i].imagedata = 'img/img-placeholder.png';
                    } else {
                        $scope.notifications[i].deleted = false;
                        $scope.notifications[i].imagedata = res.data.data.data;
                    }
                })
        }
    }

    function loadMoreNotifications() {
        $scope.current = $scope.loaded;
        $scope.loaded = $scope.notif_arr.length < $scope.loaded + limit ? $scope.notif_arr.length : $scope.loaded + limit;

        loadNotifications($scope.current, $scope.loaded).then(() => {
            loadNotificationImages($scope.current, $scope.loaded)
        });
    }

    function setLastReadNotification() {
        $scope.user.lastReadNotificationId = $scope.notif_arr[0];

        UserService.update($scope.user)
            .then(res => {})
            .catch(res => {});
    }

    function goToImage(params) {
        $state.go('user.gallery', params);
    }
}

export default function NotificationsPopover($popover) {
    return {
        restrict: 'A',
        controller: NotificationsController,
        link: ($scope, element, attrs) => {
            let popover = $popover(element, {
                title: 'Notifications',
                contentTemplate: 'app/directives/notifications-popover.tpl.html',
                html: true,
                container: 'body',
                trigger: 'manual',
                autoClose: true,
                placement: 'bottom',
                onBeforeShow: $scope.init,
                onShow: $scope.setLastReadNotification,
                scope: $scope
            });
            $scope.showPopover = () => {
                popover.show();
            };
            $scope.closePopover = () => {
                popover.hide();
            }
        }
    }
}