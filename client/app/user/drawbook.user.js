'use strict';

import UserController from './controller/UserController';
import UserGalleryController from './controller/UserGalleryController';
import UserImageController from './controller/UserImageController';

export default angular.module('drawbook.user', [])

        // Controllers
        .controller(UserController)
        .controller(UserGalleryController)
        .controller(UserImageController)
        // States config
        .config(['$stateProvider', ($stateProvider) => {
            $stateProvider
                .state('user', {
                    abstract: true,
                    parent: 'master',
                    url: '/:username',
                    templateUrl: '/app/user/tpl/user.tpl.html',
                    controller: UserController,
                    controllerAs: 'vm',
                    resolve: {
                        user: ['$stateParams', 'UserService', ($stateParams, UserService) => UserService.get($stateParams.username)]
                    }
                })
                .state('user.gallery', {
                    url: '/',
                    params: {username: null, openImage: null},
                    templateUrl: '/app/user/tpl/user.gallery.tpl.html',
                    controller: UserGalleryController,
                    controllerAs: 'vm'
                })
                .state('user.gallery.image', {
                    url: 'image/:id',
                    params: {index: null},
                    onEnter: ['$modal', 'user', ($modal, user) => {
                        $modal({
                            templateUrl: '/app/user/tpl/user.image.tpl.html',
                            controller: UserImageController,
                            controllerAs: 'vm',
                            resolve: {
                                user: () => user
                            },
                            container: 'body',
                            animation: 'am-fade',
                            backdropAnimation: 'backdrop-anim',
                            position: 'center',
                            keyboard: false,
                            backdrop: false
                        });
                    }]
                });
        }]);
