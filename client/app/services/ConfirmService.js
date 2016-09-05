'use strict';

ConfirmService.$inject = ['$modal', '$rootScope', '$q'];

/**
 * The service responsible for showing the confirmation modal window to the user when needed.
 */
/* @ngInject */
export default function ConfirmService($modal, $rootScope, $q) {
    let scope = $rootScope.$new(); // create a new scope for the modal window

    // private variables
    let deferred;

    // bindable member variables
    scope.title = 'Confirm';
    scope.content = 'Are you sure? This action is not reversible!';

    // the function to run when the answer is given
    scope.answer = (res) => {
        deferred.resolve(res);
        confirm.hide();
    };

    // the modal window object
    let confirm = $modal({
        templateUrl: '/app/common/tpl/confirm.tpl.html',
        scope: scope,
        show: false,
        html: true,
        container: 'body',
        animation: 'am-fade',
        backdropAnimation: 'backdrop-anim',
        position: 'center',
        backdrop: false
    });

    let parentShow = confirm.show;

    // the function to run when the modal window is to be shown
    confirm.show = () => {
        deferred = $q.defer();
        parentShow();
        return deferred.promise;
    };

    return confirm;
}