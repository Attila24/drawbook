NotificationsPopover.$inject = ['$popover'];

NotificationsController.$inject = ['$scope', 'localStorageService', 'UserService', 'NotificationService', 'ImageService', '$q', '$state'];

function NotificationsController($scope, localStorageService, UserService, NotificationService, ImageService, $q, $state) {

    $scope.init = init;
    $scope.load = load;
    $scope.setLastReadNotification = setLastReadNotification;
    $scope.openLink = openLink;

    function init(){
        $scope.notifications = [];
        UserService.get(localStorageService.get('currentUser').username)
            .then(res => {
                $scope.user = res.user;
                $scope.loaded = 0;
                if ($scope.user.notifications.length !== 0) {
                    load();
                }
                NotificationService.getCount($scope.user)
                    .then(count => {
                        $scope.notificationsCount = count;
                    })
            });
    }

    function load() {
        loadNotifications().then(from => {
                loadNotificationImages(from, $scope.loaded)
            })
    }

    function loadNotifications() {
        let d = $q.defer();

        NotificationService.get($scope.user.username, $scope.loaded)
            .then(res => {
               let from = $scope.notifications.length;
               $scope.notifications.push(...res);
               $scope.loaded = $scope.notifications.length;
               d.resolve(from);
            });

        return d.promise;
    }

    function loadNotificationImages(from, to) {
        for (let i = from; i < to; i++) {
            if ($scope.notifications[i].type == 'follow') {
                $scope.notifications[i].deleted = false;
            } else {
                ImageService.get($scope.user.username, $scope.notifications[i].imageid)
                    .then(res => {
                        if (res.data.status == 404) {
                            $scope.notifications[i].deleted = true;
                            $scope.notifications[i].imagedata = 'img/img-placeholder.png';
                        } else {
                            $scope.notifications[i].deleted = false;
                            $scope.notifications[i].imagedata = res.data.data.data;
                        }
                    });
            }
        }
    }

    function setLastReadNotification() {
        if ($scope.notifications.length !== 0) {
            $scope.user.lastReadNotificationId = $scope.notifications[0]._id;

            UserService.update($scope.user)
                .then(res => {})
                .catch(res => {});
        }
    }

    function openLink(follower, imageid, type) {
        if (type == 'follow') {
            $state.go('user.gallery', {username: follower});
        } else {
            $state.go('user.gallery', {username: $scope.user.username, openImage: imageid});
        }
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
                container: 'nav',
                trigger: 'manual',
                autoClose: true,
                placement: 'bottom',
                onBeforeShow: $scope.init,
                onShow: $scope.setLastReadNotification,
                scope: $scope,
                id: 'notifications'
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