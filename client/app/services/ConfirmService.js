'use strict';

ConfirmService.$inject = ['$modal', '$rootScope', '$q'];

export default function ConfirmService($modal, $rootScope, $q) {
    let scope = $rootScope.$new();

    let deferred;

    scope.title = 'Confirm';
    scope.content = 'Are you sure? This action is not reversible!';

    scope.answer = function (res) {
        deferred.resolve(res);
        confirm.hide();
    };

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

    confirm.show = function () {
        deferred = $q.defer();
        parentShow();
        return deferred.promise;
    };

    return confirm;
}