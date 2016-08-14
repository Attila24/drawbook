'use strict';

import commonModule from './app/common/drawbook.common';
import userModule from './app/user/drawbook.user';

import DrawController from './app/draw/DrawController';
import UserService from './app/services/UserService';
import ImageService from './app/services/ImageService';
import CommentService from './app/services/CommentService';
import LikeService from './app/services/LikeService';
import NotificationService from './app/services/NotificationService';
import NotificationsPopover from './app/directives/notifications-popover';

angular
    .module('drawbook', [
        'ngAnimate',
        'ui.router',
        'mgcrea.ngStrap',
        'mgcrea.ngStrap.tooltip',
        'satellizer',
        'LocalStorageModule',
        'ngFileUpload',
        'bsLoadingOverlay',
        'bsLoadingOverlayHttpInterceptor',
        'angular-growl',
        'btford.socket-io',
        commonModule.name,
        userModule.name
    ])
    .constant('server', {url: 'http://localhost:5000/api/'})
    .controller('DrawController', DrawController)

    // Services, factories
    .factory('UserService', UserService)
    .factory('ImageService', ImageService)
    .factory('CommentService', CommentService)
    .factory('LikeService', LikeService)
    .factory('NotificationService', NotificationService)

    // Instance of socket
    .factory('socket', (socketFactory) => socketFactory())

    // Directives
    .directive('notificationsPopover', NotificationsPopover)

    // Routes config
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', ($stateProvider, $urlRouterProvider, $locationProvider) => {
        $locationProvider.html5Mode(true);
        $stateProvider
            .state('draw', {
                url: '/draw',
                parent: 'master',
                templateUrl: '/app/draw/draw.tpl.html',
                controller: DrawController,
                controllerAs: 'vm'
            })
            .state('404', {
                url: '/404',
                parent: 'master',
                templateUrl: '/app/common/tpl/404.tpl.html'
            });
        $urlRouterProvider.otherwise("/404");
    }])

    // Auth config
    .config(['$authProvider', 'server', ($authProvider, server) => {
            $authProvider.baseUrl = server.url;
            $authProvider.signupUrl = '/users/register';
            $authProvider.loginUrl = '/users/login';
    }])

    .factory('allHttpInterceptor', bsLoadingOverlayHttpInterceptorFactoryFactory => bsLoadingOverlayHttpInterceptorFactoryFactory())
    .config(['$httpProvider', 'growlProvider', ($httpProvider, growlProvider) => {

        growlProvider.globalTimeToLive(5000);
        growlProvider.globalPosition('bottom-right');


        $httpProvider.interceptors.push(growlProvider.serverMessagesInterceptor);
        $httpProvider.interceptors.push('allHttpInterceptor');
    }])

    .run((bsLoadingOverlayService) => {
        bsLoadingOverlayService.setGlobalConfig({
            delay: 400,
            activeClass: undefined,
            templateUrl: './app/common/tpl/loading-overlay-template.html',
            templateOptions: undefined
        });
    })
    .run(['$transitions', 'socket', '$auth', 'localStorageService', ($transitions, socket, $auth, localStorageService) => {

        // match all transitions
        $transitions.onStart({}, ($transition$) => {
            if ($auth.isAuthenticated() && $transition$.from().name == '') {
                socket.emit('setUserId', localStorageService.get('currentUser')._id);
            }
        });
    }])

    .run(['socket', 'growl', 'ImageService', (socket, growl, ImageService) =>  {
       socket.on('notification', msg => {

           ImageService.get(msg.to, msg.imageid)
               .then(res => {
                  let img = res.data.data.data;

                   switch (msg.type) {
                       case 'like': {
                           growl.info('<strong>' + msg.from + '</strong> liked your drawing! <img src="' + img + '" class="img-responsive notification">');
                           break;
                       }
                       case 'comment': {
                           if (msg.comment.length > 30) {
                               msg.comment = msg.comment.substring(0,27);
                               msg.comment += '...';
                           }

                           growl.info('<strong>' + msg.from + '</strong>  commented on your drawing: "'+ msg.comment +'" <img src="' + img + '" class="img-responsive notification">');
                           break;
                       }

                   }
               });
       })
    }]);

