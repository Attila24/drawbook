NotificationsPopover.$inject = ['$popover'];
NotificationsController.$inject = ['$scope', 'localStorageService', 'UserService', 'NotificationService', 'ImageService', '$q', '$state'];

/**
 * The controller responsible for handling the actions of the notification popup.
 */
/*@ngInject*/
function NotificationsController($scope, localStorageService, UserService, NotificationService, ImageService, $q, $state) {

    // bindable member functions
    $scope.init = init;
    $scope.load = load;
    $scope.setLastReadNotification = setLastReadNotification;
    $scope.openLink = openLink;

    //////////////////////////////////////

    /**
     * Initialize controller:
     * - clear notifications array
     * - load notifications
     * - load number of notifications
     */
    function init(){
        $scope.notifications = [];
        UserService.get(localStorageService.get('currentUser').username)
            .then(res => {
                $scope.user = res.user;
                $scope.loaded = 0;

                // load notifications
                if ($scope.user.notifications.length !== 0) {
                    load();
                }

                // get total count of notifications
                NotificationService.getCount($scope.user)
                    .then(count => {
                        $scope.notificationsCount = count;
                    })
            });
    }

    /**
     * Loads notifications, then initiates loading the notification images.
     */
    function load() {
        loadNotifications().then(from => {
                loadNotificationImages(from, $scope.loaded)
            })
    }

    /**
     * Loads notifications and pushes them to the bindable member variable ($scope.notifications).
     * @returns {promise|e.promise|*|d} a promise which is resolved when all of the notifications finished loading.
     */
    function loadNotifications() {
        let d = $q.defer();

        NotificationService.get($scope.user.username, $scope.loaded)
            .then(res => {
               let from = $scope.notifications.length; // the amount of previously loaded notifications
               $scope.notifications.push(...res);
               $scope.loaded = $scope.notifications.length; // the current amount of loaded notifications
               d.resolve(from);
            });

        return d.promise;
    }

    /**
     * Loads notification images and saves them in the bindable member variable ($scope.notifications)
     * @param from the amount of previously loaded notifications
     * @param to the current amount of loaded notifications
     */
    function loadNotificationImages(from, to) {
        for (let i = from; i < to; i++) {

            // if notification type is 'follow', there is no image to be shown.
            if ($scope.notifications[i].type == 'follow') {
                $scope.notifications[i].deleted = false;
            } else {
                // load image (if not found, show a placeholder image)
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

    /**
     * Sets the user's last read notification to the latest loaded notification's id.
     */
    function setLastReadNotification() {
        if ($scope.notifications.length !== 0) {
            $scope.user.lastReadNotificationId = $scope.notifications[0]._id;

            UserService.update($scope.user)
                .then(res => {});
        }
    }

    /**
     * Goes to a state according to the notification's type.
     * @param follower the username of the follower if the notification type is 'follow'
     * @param imageid the id of the image if the notification type is 'like' or 'comment'
     * @param type the type of the notification
     */
    function openLink(follower, imageid, type) {
        if (type == 'follow') {
            $state.go('user.gallery', {username: follower});
        } else {
            $state.go('user.gallery', {username: $scope.user.username, openImage: imageid});
        }
    }
}

/**
 * The directive that is responsible for showing the notification popup and instantiating the NotificationController function with the correct parameters.
 */
/*@ngInject*/
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

            // functions that can be called from the controller
            $scope.showPopover = () => {
                popover.show();
            };
            $scope.closePopover = () => {
                popover.hide();
            }
        }
    }
}