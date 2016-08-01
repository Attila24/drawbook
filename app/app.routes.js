(function () {
    'use strict';

    DrawboookStates.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

    /* @ngInject */
    function DrawboookStates ($stateProvider, $urlRouterProvider, $locationProvider) {

        $stateProvider.state('home', {
                url: '/',
                templateUrl: '/app/common/home.tpl.html',
                controller: require('./app/common/HomeController'),
                controllerAs: 'vm'
            }).
            state('register', {
                url: '/register',
                templateUrl: '/app/common/register.tpl.html',
                controller: require('./app/common/RegisterController'),
                controllerAs: 'vm'
            }).
            state('login', {
                url: '/login',
                templateUrl: '/app/common/login.tpl.html',
                controller: require('./app/common/LoginController'),
                controllerAs: 'vm'
            })
            .state('draw', {
                url: '/draw',
                templateUrl: '/app/draw/draw.tpl.html',
                controller: require('./app/draw/DrawController'),
                controllerAs: 'vm'
            })
            .state('edit', {
                url: '/edit',
                templateUrl: '/app/common/profile-edit.tpl.html',
                controller: require('./app/common/ProfileEditController'),
                controllerAs: 'vm'
            })
            .state('user', {
                abstract: true,
                url: '/:username',
                templateUrl: '/app/user/user.tpl.html',
                controller: require('./app/user/UserController'),
                controllerAs: 'vm',
                resolve: {
                    user: ['$stateParams', 'UserService', ($stateParams, UserService) => {
                        return UserService.get($stateParams.username);
                    }]
                }
            })
            .state('user.gallery', {
                url: '/',
                templateUrl: '/app/user/user.gallery.tpl.html',
                controller: require('./app/user/UserGalleryController'),
                controllerAs: 'vm'
            })
            .state('user.gallery.image', {
                url: 'image/:id',
                params: {index: null},
                onEnter: ['$modal', '$state', 'user', '$stateParams', ($modal, $state, user) => {
                    $modal({
                        templateUrl: '/app/user/user.image.tpl.html',
                        controller: require('./app/user/UserImageController'),
                        controllerAs: 'vm',
                        resolve: {
                            user: () => {return user;}
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

        $urlRouterProvider.otherwise("/");
        $locationProvider.html5Mode(true);

    }

    module.exports = DrawboookStates;

})();